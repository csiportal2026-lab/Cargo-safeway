import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

/**
 * POST /api/extract
 *
 * Receives multipart/form-data:
 *   - files[]: the uploaded documents (PDF / image)
 *   - types[]: the user-confirmed document type for each file (parallel array)
 *
 * Calls Gemini 2.5 Flash with all docs in a single batched request, asking it
 * to return a structured partial-application JSON. The client then writes
 * that JSON into the form's localStorage draft so the form opens pre-filled.
 *
 * Server-only: GEMINI_API_KEY must be set in .env.local. The client never
 * sees the key.
 */

/* Single-model extraction. We tried a Flash-Lite → Flash fallback tier,
 * but Lite was too inconsistent on multi-doc maritime PDFs to be worth the
 * extra moving parts. Going straight to Flash 2.5 is slower per call but
 * predictable. */
const MODEL = "gemini-2.5-flash";

/* Per-file size cap. Caps a single document at 10 MB and the whole batched
 * request at 40 MB to prevent cost-amplification attacks against the paid
 * Gemini API endpoint (an attacker could otherwise upload 8 × 100 MB junk
 * files and burn through budget on vision-token processing). */
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_TOTAL_BYTES = 40 * 1024 * 1024; // 40 MB

/* Documents we know how to extract from. Anything else lands as "other"
   and the model is told to skip it. */
const DOC_LABELS: Record<string, string> = {
  passport: "Passport (bio page)",
  "seamans-book": "Seaman's book / Seafarer's identity document",
  coc: "Certificate of Competency",
  stcw: "STCW certificate",
  medical: "Medical / fitness certificate",
  cv: "Resume / Curriculum Vitae",
  other: "Other",
};

/* JSON schema mirroring the subset of ApplicationValues that documents
   typically contain. Booleans, repeating arrays and free-form fields the
   model can't infer are intentionally omitted. */
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    // Identity
    surname: { type: Type.STRING, description: "Family name / surname" },
    firstName: { type: Type.STRING, description: "First / given name" },
    middleName: { type: Type.STRING, description: "Middle name (or empty)" },
    sex: {
      type: Type.STRING,
      enum: ["MALE", "FEMALE"],
      description: "Sex / gender as printed on the passport",
    },
    birthDate: {
      type: Type.STRING,
      description: "Date of birth in YYYY-MM-DD format",
    },
    birthPlace: { type: Type.STRING, description: "City of birth" },
    nationality: {
      type: Type.STRING,
      description:
        "Nationality / citizenship as a demonym (e.g. 'Filipino'), not 'PHL'",
    },
    // Contact (CV / resume)
    addressStreet: { type: Type.STRING },
    addressCity: { type: Type.STRING },
    addressProvince: { type: Type.STRING },
    addressPostalCode: { type: Type.STRING },
    addressCountry: { type: Type.STRING },
    mobile: {
      type: Type.STRING,
      description: "Mobile phone number, digits only",
    },
    email: { type: Type.STRING },
    tel: { type: Type.STRING, description: "Landline / telephone, digits only" },
    // Travel docs
    passportNumber: { type: Type.STRING },
    passportDateIssued: { type: Type.STRING, description: "YYYY-MM-DD" },
    passportDateExpired: { type: Type.STRING, description: "YYYY-MM-DD" },
    seamansBookNumber: { type: Type.STRING },
    seamansBookDateIssued: { type: Type.STRING, description: "YYYY-MM-DD" },
    seamansBookDateExpired: { type: Type.STRING, description: "YYYY-MM-DD" },
    usVisaNumber: { type: Type.STRING },
    usVisaDateIssued: { type: Type.STRING, description: "YYYY-MM-DD" },
    usVisaDateExpired: { type: Type.STRING, description: "YYYY-MM-DD" },
    // Certificates
    nativeCocCapacity: {
      type: Type.STRING,
      description: "e.g. 'III/4 ENG' or 'II/4 DECK'",
    },
    nativeCocNumber: { type: Type.STRING },
    nativeCocDateIssued: { type: Type.STRING, description: "YYYY-MM-DD" },
    nativeCocDateExpired: { type: Type.STRING, description: "YYYY-MM-DD" },
    medicalExamDate: { type: Type.STRING, description: "YYYY-MM-DD" },
    // Education (highest degree)
    eduInstitution: { type: Type.STRING },
    eduDepartment: { type: Type.STRING },
    eduDegree: { type: Type.STRING },
    eduPeriodFrom: { type: Type.STRING, description: "YYYY-MM-DD" },
    eduPeriodTo: { type: Type.STRING, description: "YYYY-MM-DD" },
  },
};

const SYSTEM_PROMPT = `You are a maritime crewing-application extraction assistant. The user has uploaded documents (passports, seaman's books, certificates of competency, STCW certs, medical certs, CVs/resumes). Each document is labeled with its type by the user.

Your job:
1. Read every document carefully.
2. Cross-reference fields across documents (e.g., the name on the passport should match the name on the seaman's book — prefer the most authoritative source).
3. Extract values into the JSON schema. Use ISO date format (YYYY-MM-DD) for ALL dates. Convert non-ISO dates (e.g., "15 JUN 1990", "1990/06/15", "15-06-1990") into YYYY-MM-DD.
4. For nationality, use the demonym (e.g. "Filipino", "American"), not country code.
5. If a field is not present in any document, omit it from the response — DO NOT make up values or guess.
6. For names: surname is the family name, first name is the given name, middle name is middle (or empty if not present).
7. Return ONLY the JSON object that matches the schema. No commentary.`;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Could not parse multipart/form-data body." },
      { status: 400 },
    );
  }

  const files = formData.getAll("files").filter((v): v is File => v instanceof File);
  const types = formData.getAll("types").map((v) => String(v));

  if (files.length === 0) {
    return NextResponse.json(
      { error: "No files provided." },
      { status: 400 },
    );
  }
  if (files.length > 8) {
    return NextResponse.json(
      { error: "Too many files (max 8)." },
      { status: 400 },
    );
  }
  if (types.length !== files.length) {
    return NextResponse.json(
      { error: "Each file must have a matching type." },
      { status: 400 },
    );
  }

  // Per-file + aggregate size check — blocks DoS / cost-amplification.
  let totalBytes = 0;
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        {
          error: `File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max ${(MAX_FILE_BYTES / 1024 / 1024).toFixed(0)} MB per file.`,
        },
        { status: 413 },
      );
    }
    totalBytes += file.size;
  }
  if (totalBytes > MAX_TOTAL_BYTES) {
    return NextResponse.json(
      {
        error: `Combined upload is too large (${(totalBytes / 1024 / 1024).toFixed(1)} MB). Max ${(MAX_TOTAL_BYTES / 1024 / 1024).toFixed(0)} MB per request.`,
      },
      { status: 413 },
    );
  }

  // Build the parts array: a user prompt that names each doc + the inline
  // image/PDF bytes per doc.
  const filePartsPromises = files.map(async (file, idx) => {
    const ab = await file.arrayBuffer();
    const data = Buffer.from(ab).toString("base64");
    return {
      type: types[idx] ?? "other",
      label: DOC_LABELS[types[idx] ?? "other"] ?? "Other",
      mimeType: file.type || guessMime(file.name),
      data,
      name: file.name,
    };
  });
  const fileParts = await Promise.all(filePartsPromises);

  const userPrompt =
    `The user has uploaded ${fileParts.length} document${fileParts.length === 1 ? "" : "s"}:\n\n` +
    fileParts
      .map((p, i) => `Document ${i + 1} (${p.label}): "${p.name}"`)
      .join("\n") +
    `\n\nExtract the available fields into the JSON schema. Cross-reference across documents where possible.`;

  const contents = [
    { text: userPrompt },
    ...fileParts.map((p) => ({
      inlineData: { mimeType: p.mimeType, data: p.data },
    })),
  ];

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json(
        { error: "Empty response from extraction model." },
        { status: 502 },
      );
    }

    let extracted: Record<string, unknown>;
    try {
      extracted = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Extraction response was not valid JSON." },
        { status: 502 },
      );
    }

    // Strip empty strings / undefined so the form's draft-merge keeps its
    // own defaults for unfilled fields.
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(extracted)) {
      if (v === undefined || v === null) continue;
      if (typeof v === "string" && v.trim() === "") continue;
      cleaned[k] = v;
    }

    return NextResponse.json({
      ok: true,
      filledCount: Object.keys(cleaned).length,
      values: cleaned,
      meta: { model: MODEL },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown extraction error.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function guessMime(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "heic":
      return "image/heic";
    case "webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}
