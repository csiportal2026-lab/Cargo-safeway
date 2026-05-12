"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  applicationSchema,
  PHOTO_SESSION_KEY,
  STORAGE_KEY,
  type ApplicationValues,
} from "../applicationSchema";
import PaperForm from "../PaperForm";
import FormProgress from "../../../components/FormProgress";
import type { Job } from "../../jobs/jobsData";

type PhotoState = { file: File; previewUrl: string } | null;

type DraftState = {
  values: ApplicationValues | null;
  photo: PhotoState;
  loaded: boolean;
};

export default function ReviewClient({ job }: { job: Job | null }) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftState>({
    values: null,
    photo: null,
    loaded: false,
  });
  const [consent, setConsent] = useState(false);
  const [signature, setSignature] = useState("");
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* Load draft + photo from storage on mount. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    let values: ApplicationValues | null = null;
    let photo: PhotoState = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ApplicationValues>;
        const result = applicationSchema.safeParse(parsed);
        if (result.success) values = result.data;
        else values = parsed as ApplicationValues; // best-effort even if incomplete
      }
    } catch {}
    try {
      const rawPhoto = window.sessionStorage.getItem(PHOTO_SESSION_KEY);
      if (rawPhoto) {
        const { dataUrl, name, type } = JSON.parse(rawPhoto) as {
          dataUrl: string;
          name: string;
          type: string;
        };
        const file = dataUrlToFile(dataUrl, name, type);
        photo = { file, previewUrl: dataUrl };
      }
    } catch {}
    setDraft({ values, photo, loaded: true });
  }, []);

  /* If no draft after load, bounce back to the apply page. */
  useEffect(() => {
    if (draft.loaded && !draft.values) {
      const qs = job?.slug ? `?job=${encodeURIComponent(job.slug)}` : "";
      router.replace(`/inquire/apply${qs}`);
    }
  }, [draft.loaded, draft.values, job, router]);

  const fullName = useMemo(() => {
    if (!draft.values) return "";
    return [draft.values.firstName, draft.values.middleName, draft.values.surname]
      .filter((s) => (s ?? "").trim() !== "")
      .join(" ");
  }, [draft.values]);

  const sigMatchesName =
    fullName.trim() !== "" &&
    signature.trim().toLowerCase() === fullName.trim().toLowerCase();
  const canSubmit =
    consent && signature.trim() !== "" && submitState !== "submitting";

  function editHref(stepIndex: number) {
    const params = new URLSearchParams();
    if (job?.slug) params.set("job", job.slug);
    params.set("step", String(stepIndex));
    return `/inquire/apply?${params.toString()}`;
  }

  async function handleSubmit() {
    if (!draft.values || submitState === "submitting") return;
    setSubmitError(null);
    setSubmitState("submitting");
    try {
      const fd = new FormData();
      fd.append("_subject", `New crew application — ${job?.title ?? "Unknown rank"}`);
      fd.append("appliedJob", job?.title ?? "");
      fd.append("appliedJobSlug", job?.slug ?? "");
      fd.append("appliedVessel", job?.vesselName ?? "");
      fd.append("appliedDepartment", job?.department ?? "");
      fd.append("signature", signature);
      fd.append("submittedAt", new Date().toISOString());
      fd.append("application", JSON.stringify(draft.values, null, 2));
      Object.entries(draft.values).forEach(([key, val]) => {
        if (
          typeof val === "string" ||
          typeof val === "boolean" ||
          typeof val === "number"
        ) {
          fd.append(key, String(val));
        }
      });
      if (draft.photo?.file) {
        fd.append("photo", draft.photo.file, `photo-${draft.photo.file.name}`);
      }
      const res = await fetch("https://formspree.io/f/xjglgowg", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { errors?: { message?: string }[]; error?: string }
          | null;
        const msg =
          data?.errors?.[0]?.message ??
          data?.error ??
          `Submission failed (${res.status})`;
        throw new Error(msg);
      }
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.sessionStorage.removeItem(PHOTO_SESSION_KEY);
      } catch {}
      setSubmitState("success");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
      setSubmitState("error");
    }
  }

  /* Loading shell while we hydrate from storage. */
  if (!draft.loaded) {
    return (
      <div className="flex items-center justify-center py-32 text-[13px] text-neutral-500">
        Loading your application…
      </div>
    );
  }

  if (submitState === "success") {
    return (
      <div className="flex flex-col items-center text-center py-24">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#15803d] text-white shadow-lg shadow-[#15803d]/20">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 12.5L10 17L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3
          className="mt-7 text-[28px] font-semibold text-neutral-900"
          style={{ letterSpacing: "-0.01em" }}
        >
          Application submitted
        </h3>
        <p className="mt-3 max-w-md text-[14.5px] text-neutral-600">
          Thank you. Cargo Safeway&apos;s recruitment team will review your details and get back to you by email within a few business days.
        </p>
      </div>
    );
  }

  if (!draft.values) {
    return null; // about to redirect
  }

  return (
    <div className="space-y-8">
      <FormProgress value={1} total={1} label="Review & Submit" />
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-[11px] font-semibold uppercase text-neutral-500"
            style={{ letterSpacing: "0.18em" }}
          >
            Step 08 · Final
          </p>
          <h2
            className="mt-1 text-[26px] sm:text-[30px] font-semibold text-neutral-900"
            style={{ letterSpacing: "-0.01em" }}
          >
            Review &amp; Submit
          </h2>
          <p className="mt-1 text-[13px] text-neutral-500">
            Confirm the details, sign, and submit. Edit pencils on the document jump
            you back to that section.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase text-neutral-500 hover:text-[#15803d] transition-colors"
          style={{ letterSpacing: "0.1em" }}
        >
          ← Back to form
        </button>
      </div>

      <PaperForm
        values={draft.values}
        photo={draft.photo}
        job={job}
        signature={signature}
        onEdit={(stepIndex) => router.push(editHref(stepIndex))}
      />

      {/* Consent + signature + submit */}
      <div className="rounded-2xl border border-neutral-200 bg-white/85 p-6 sm:p-8 space-y-7">
        <div className="space-y-3">
          <p className="text-[12.5px] text-neutral-500 leading-relaxed">
            We use your information only to review your application. We never
            sell your data, and you can request deletion anytime.
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4.5 w-4.5 rounded border-neutral-300 text-[#15803d] focus:ring-[#15803d]"
            />
            <span className="text-[13.5px] text-neutral-700 leading-relaxed">
              I agree to Cargo Safeway&apos;s{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#15803d] hover:underline"
              >
                Privacy Policy
              </a>{" "}
              and confirm the information above is true and complete.
            </span>
          </label>
        </div>

        <div>
          <label
            className="block text-[13px] font-semibold uppercase mb-2 text-neutral-600"
            style={{ letterSpacing: "0.06em" }}
          >
            Signature (type your full name)
          </label>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder={fullName || "Full name"}
            className="w-full rounded-xl bg-white border border-neutral-300 px-5 py-4 text-[18px] font-medium text-neutral-900 outline-none focus:border-neutral-600 focus:ring-2 focus:ring-neutral-200/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200"
            style={{
              fontFamily: "var(--font-anton, serif)",
              letterSpacing: "0.02em",
            }}
          />
          {fullName && signature.trim() !== "" && !sigMatchesName && (
            <p className="mt-2 text-[12px] text-amber-600">
              Heads up — this doesn&apos;t exactly match the name you entered ({fullName}).
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-[12px] text-neutral-500">
            Date: {new Date().toLocaleDateString("en-CA")}
          </p>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`rounded-xl px-7 py-3.5 text-[13px] font-semibold uppercase transition-all duration-200 ${
              canSubmit
                ? "bg-[#15803d] text-white shadow-md shadow-[#15803d]/20 hover:bg-[#166534]"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
            style={{ letterSpacing: "0.1em" }}
          >
            {submitState === "submitting" ? "Submitting…" : "Submit Application"}
          </button>
        </div>

        {submitState === "error" && submitError && (
          <p className="text-[13px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">
            {submitError}
          </p>
        )}
      </div>
    </div>
  );
}

function dataUrlToFile(dataUrl: string, name: string, type: string): File {
  const arr = dataUrl.split(",");
  const bstr = atob(arr[1] ?? "");
  const u8 = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
  return new File([u8], name, { type });
}
