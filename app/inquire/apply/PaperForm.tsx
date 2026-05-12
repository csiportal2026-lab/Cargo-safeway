"use client";

import type { ApplicationValues } from "./applicationSchema";
import type { Job } from "../jobs/jobsData";

type PhotoState = { file: File; previewUrl: string } | null;

/**
 * Faithful HTML replica of the Evergreen "Seafarer Personal Information" sheet
 * (Form No. SMDSM1-I-001B-02). Single table, A4 portrait, with the same
 * left-spine labels (Education, Experience, Kindred, Comm.Ability) and the
 * same photo-box merged into the identity grid.
 *
 * Each top-level section header has an Edit pencil that hops the parent flow
 * back to the matching step.
 */
export default function PaperForm({
  values,
  photo,
  job,
  signature,
  onEdit,
}: {
  values: ApplicationValues;
  photo: PhotoState;
  job: Job | null;
  signature: string;
  onEdit: (step: number) => void;
}) {
  const expRows = padRows(values.experience ?? [], 7, () => ({
    agencyVessel: "",
    rank: "",
    vesselType: "",
    machine: "",
    gt: "",
    hp: "",
    periodFrom: "",
    periodTo: "",
  }));

  // First two kindred slots are pre-labelled "Father" / "Mother" on the
  // original sheet; map user rows into title-keyed lookup so we can fill
  // those slots first, then stream remaining rows into the unlabeled rows.
  const kindredFiltered = (values.kindred ?? []).filter(
    (r) => r.title.trim() !== "" || r.name.trim() !== "",
  );
  const fatherEntry = kindredFiltered.find((r) => /father/i.test(r.title));
  const motherEntry = kindredFiltered.find((r) => /mother/i.test(r.title));
  const restEntries = kindredFiltered.filter(
    (r) => r !== fatherEntry && r !== motherEntry,
  );
  const kindredSlots: Array<{
    locked?: string;
    row?: (typeof kindredFiltered)[number];
  }> = [
    { locked: "Father", row: fatherEntry },
    { locked: "Mother", row: motherEntry },
    ...Array.from({ length: 6 }).map((_, i) => ({ row: restEntries[i] })),
  ];

  return (
    <div className="w-full overflow-x-auto">
      <div
        className="mx-auto bg-white text-black shadow-[0_30px_80px_-20px_rgba(0,0,0,0.18),0_8px_20px_-10px_rgba(0,0,0,0.08)]"
        style={{
          width: "100%",
          maxWidth: "1100px",
          fontFamily:
            "Arial, 'Helvetica Neue', Helvetica, system-ui, sans-serif",
          fontSize: "13px",
          lineHeight: 1.35,
          padding: "20px 24px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            {/* 12 logical columns. Approximate the 34-col original. */}
            <col style={{ width: "5%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "9%" }} />
          </colgroup>
          <tbody>
            {/* ───── HEADER BAND ───── */}
            <tr>
              <Th colSpan={9} editStep={1} onEdit={onEdit}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      border: "2px solid #111",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 18,
                    }}
                  >
                    E
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      EVERGREEN SEAFARER PERSONAL INFORMATION
                    </div>
                    <div style={{ fontSize: 11, color: "#666" }}>
                      Form No. SMDSM1-I-001B-02
                    </div>
                  </div>
                </div>
              </Th>
              <Td colSpan={3} compact>
                <Label>No.</Label>
                <Value>—</Value>
              </Td>
            </tr>
            <tr>
              <Td colSpan={12} compact>
                <Label>Applied Rank</Label>
                <Value bold>{job?.rank || "—"}</Value>
              </Td>
            </tr>

            {/* ───── ENGLISH NAME / IDENTITY (4 rows × 12 cols, photo merged) ───── */}
            <Spine label="English Name" rows={4} editStep={1} onEdit={onEdit}>
              {/* Row 1: SURNAME · FIRST · MIDDLE | Sex · Height · Weight | Photo (merge 4 rows) */}
              <Td colSpan={3}>
                <Label>LAST (SURNAME)</Label>
                <Value bold>{values.surname}</Value>
              </Td>
              <Td colSpan={3}>
                <Label>FIRST (GIVEN)</Label>
                <Value bold>{values.firstName}</Value>
              </Td>
              <Td colSpan={2}>
                <Label>MIDDLE</Label>
                <Value bold>{values.middleName}</Value>
              </Td>
              <Td>
                <Label>Sex</Label>
                <Value bold>{values.sex || ""}</Value>
              </Td>
              <PhotoCell photo={photo} />
            </Spine>

            <tr>
              <Td colSpan={3}>
                <Label>Nationality</Label>
                <Value>{values.nationality}</Value>
              </Td>
              <Td colSpan={2}>
                <Label>Birth Date (YYYYMMDD)</Label>
                <Value>{dateNoSep(values.birthDate)}</Value>
              </Td>
              <Td colSpan={2}>
                <Label>Birth Place</Label>
                <Value>{values.birthPlace}</Value>
              </Td>
              <Td>
                <Label>Height</Label>
                <Value>{values.height ? `${values.height} cm` : ""}</Value>
              </Td>
              <Td>
                <Label>Weight</Label>
                <Value>{values.weight ? `${values.weight} kg` : ""}</Value>
              </Td>
              {/* photo cell continues */}
            </tr>

            <tr>
              <Td colSpan={9}>
                <Label>Marriage</Label>
                <div style={{ display: "flex", gap: 14, marginTop: 2 }}>
                  {(["MARRIED", "WIDOW", "UNMARRIED", "DIVORCE"] as const).map(
                    (m) => (
                      <CheckLabel
                        key={m}
                        on={values.marriage === m}
                        text={
                          m === "WIDOW"
                            ? "Widow(er)"
                            : m.charAt(0) + m.slice(1).toLowerCase()
                        }
                      />
                    ),
                  )}
                </div>
              </Td>
              {/* photo cell continues */}
            </tr>

            {/* ───── CONTACT DATA ───── */}
            <Spine label="Contact Data" rows={3} editStep={2} onEdit={onEdit}>
              <Td colSpan={8}>
                <Label>Address</Label>
                <Value>{formatAddress(values)}</Value>
              </Td>
              <Td colSpan={3}>
                <Label>Tel</Label>
                <Value>{values.tel}</Value>
              </Td>
            </Spine>
            <tr>
              <Td colSpan={8} rowSpan={2}>
                <Label>E-mail (required)</Label>
                <Value>{values.email}</Value>
              </Td>
              <Td colSpan={3}>
                <Label>H.P.</Label>
                <Value>{values.mobile}</Value>
              </Td>
            </tr>
            <tr>
              <Td colSpan={3}>
                <Label>Religion</Label>
                <Value>{values.religion}</Value>
              </Td>
            </tr>

            {/* ───── EDUCATION ───── */}
            <Spine label="Education" rows={4} editStep={3} onEdit={onEdit}>
              <Td colSpan={5}>
                <Label>The Highest Education Institution</Label>
                <Value>{values.eduInstitution}</Value>
              </Td>
              <Td colSpan={2}>
                <Label>Department</Label>
                <Value>{values.eduDepartment}</Value>
              </Td>
              <Td colSpan={2}>
                <Label>Period (yyyymm)</Label>
                <Value>{periodNoSep(values.eduPeriodFrom, values.eduPeriodTo)}</Value>
              </Td>
              <Td colSpan={2}>
                <Label>Degree</Label>
                <Value>{values.eduDegree}</Value>
              </Td>
            </Spine>
            <tr>
              <Td colSpan={5}>
                <Label>Training Institution</Label>
                <Value>{values.trainingInstitution}</Value>
              </Td>
              <Td colSpan={2}>
                <Label>Department</Label>
                <Value>{values.trainingDepartment}</Value>
              </Td>
              <Td colSpan={2}>
                <Label>Period (yyyymm)</Label>
                <Value>
                  {periodNoSep(values.trainingPeriodFrom, values.trainingPeriodTo)}
                </Value>
              </Td>
              <Td colSpan={2}>
                <Label>Degree</Label>
                <Value>{values.trainingDegree}</Value>
              </Td>
            </tr>

            {/* Native CoC row */}
            <tr>
              <Td colSpan={2}>
                <Label>Native cert. of Competency</Label>
                <Value bold>Capacity</Value>
              </Td>
              <Td colSpan={3}>
                <Value>{values.nativeCocCapacity}</Value>
              </Td>
              <Td colSpan={2}>
                <Label>No.</Label>
                <Value>{values.nativeCocNumber}</Value>
              </Td>
              <Td colSpan={2}>
                <Label>Date Issued</Label>
                <Value>{dateNoSep(values.nativeCocDateIssued)}</Value>
              </Td>
              <Td colSpan={2}>
                <Label>Date Expired</Label>
                <Value>{dateNoSep(values.nativeCocDateExpired)}</Value>
              </Td>
            </tr>
            <tr>
              <Td colSpan={2}>
                <Label>Other Training Cert</Label>
                <Value bold>Capacity</Value>
              </Td>
              <Td colSpan={3}>
                <Value>{values.otherCertCapacity}</Value>
              </Td>
              <Td colSpan={2}>
                <Label>No.</Label>
                <Value>{values.otherCertNumber}</Value>
              </Td>
              <Td colSpan={2}>
                <Label>Date Issued</Label>
                <Value>{dateNoSep(values.otherCertDateIssued)}</Value>
              </Td>
              <Td colSpan={2}>
                <Label>Date Expired</Label>
                <Value>{dateNoSep(values.otherCertDateExpired)}</Value>
              </Td>
            </tr>

            {/* ───── STCW + Medical (left) | Travel docs (right) ───── */}
            {/* This block fuses STCW tick grid (left) with Seaman Book / Passport / Visa rows on the right, like the original. */}
            <tr>
              <Td colSpan={7} rowSpan={5} alignTop>
                <Label>STCW Certificates Held</Label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    columnGap: 10,
                    rowGap: 3,
                    marginTop: 3,
                  }}
                >
                  {STCW_LIST.map(([key, label]) => (
                    <CheckLabel
                      key={key}
                      on={values[key as keyof ApplicationValues] === true}
                      text={label}
                    />
                  ))}
                </div>
              </Td>
              <Td colSpan={5}>
                <Label>Medical Exam · Date Issued</Label>
                <Value>{dateNoSep(values.medicalExamDate)}</Value>
              </Td>
            </tr>
            {/* Seaman Book */}
            <tr>
              <Td colSpan={1}>
                <Label>Seaman Book (Native)</Label>
              </Td>
              <Td colSpan={2}>
                <Value>{values.seamansBookNumber}</Value>
              </Td>
              <Td colSpan={1}>
                <Label>Issued</Label>
                <Value>{dateNoSep(values.seamansBookDateIssued)}</Value>
              </Td>
              <Td colSpan={1}>
                <Label>Expired</Label>
                <Value>{dateNoSep(values.seamansBookDateExpired)}</Value>
              </Td>
            </tr>
            {/* Passport */}
            <tr>
              <Td colSpan={1}>
                <Label>Passport</Label>
              </Td>
              <Td colSpan={2}>
                <Value>{values.passportNumber}</Value>
              </Td>
              <Td colSpan={1}>
                <Label>Issued</Label>
                <Value>{dateNoSep(values.passportDateIssued)}</Value>
              </Td>
              <Td colSpan={1}>
                <Label>Expired</Label>
                <Value>{dateNoSep(values.passportDateExpired)}</Value>
              </Td>
            </tr>
            {/* US Visa */}
            <tr>
              <Td colSpan={1}>
                <Label>U.S.A. C1/D Visa</Label>
              </Td>
              <Td colSpan={2}>
                <Value>{values.usVisaNumber}</Value>
              </Td>
              <Td colSpan={1}>
                <Label>Issued</Label>
                <Value>{dateNoSep(values.usVisaDateIssued)}</Value>
              </Td>
              <Td colSpan={1}>
                <Label>Expired</Label>
                <Value>{dateNoSep(values.usVisaDateExpired)}</Value>
              </Td>
            </tr>
            {/* Buffer row to balance the rowspan */}
            <tr style={{ height: 4 }} />

            {/* ───── EXPERIENCE ───── */}
            <Spine
              label="Experience"
              rows={1 + expRows.length}
              editStep={6}
              onEdit={onEdit}
            >
              <Td colSpan={4} compact>
                <Label>Manning Agency / Vessel Name</Label>
              </Td>
              <Td colSpan={1} compact>
                <Label>Rank</Label>
              </Td>
              <Td colSpan={2} compact>
                <Label>Vessel Type / Machine</Label>
              </Td>
              <Td colSpan={2} compact>
                <Label>G.Ton / H.P.</Label>
              </Td>
              <Td colSpan={2} compact>
                <Label>Period (YYYYMM)</Label>
              </Td>
            </Spine>
            {expRows.map((r, i) => (
              <tr key={`exp-${i}`}>
                <Td colSpan={4}>
                  <Value>{r.agencyVessel}</Value>
                </Td>
                <Td colSpan={1}>
                  <Value>{r.rank}</Value>
                </Td>
                <Td colSpan={2}>
                  <Value>{joinSlash(r.vesselType, r.machine)}</Value>
                </Td>
                <Td colSpan={2}>
                  <Value>{joinSlash(r.gt, r.hp)}</Value>
                </Td>
                <Td colSpan={2}>
                  <Value>
                    {r.periodFrom || r.periodTo
                      ? `Fm: ${dateNoSep(r.periodFrom) || "—"}  To: ${dateNoSep(r.periodTo) || "—"}`
                      : ""}
                  </Value>
                </Td>
              </tr>
            ))}

            {/* ───── KINDRED ───── */}
            <Spine
              label="Kindred"
              rows={1 + kindredSlots.length}
              editStep={7}
              onEdit={onEdit}
            >
              <Td colSpan={2} compact>
                <Label>Title</Label>
              </Td>
              <Td colSpan={3} compact>
                <Label>English Name</Label>
              </Td>
              <Td colSpan={2} compact>
                <Label>DOB (YYYYMMDD)</Label>
              </Td>
              <Td colSpan={1} compact>
                <Label>Status</Label>
              </Td>
              <Td colSpan={2} compact>
                <Label>Edu. degree</Label>
              </Td>
              <Td colSpan={1} compact>
                <Label>Occupation</Label>
              </Td>
            </Spine>
            {kindredSlots.map((slot, i) => (
              <tr key={`kin-${i}`}>
                <Td colSpan={2}>
                  <Value bold={!!slot.locked}>
                    {slot.locked || slot.row?.title || ""}
                  </Value>
                </Td>
                <Td colSpan={3}>
                  <Value>{slot.row?.name || ""}</Value>
                </Td>
                <Td colSpan={2}>
                  <Value>{dateNoSep(slot.row?.birthDate || "")}</Value>
                </Td>
                <Td colSpan={1}>
                  <Value>
                    {slot.row?.status === "ALIVE"
                      ? "Alive"
                      : slot.row?.status === "DECEASED"
                        ? "Deceased"
                        : ""}
                  </Value>
                </Td>
                <Td colSpan={2}>
                  <Value>{slot.row?.eduDegree || ""}</Value>
                </Td>
                <Td colSpan={1}>
                  <Value>{slot.row?.occupation || ""}</Value>
                </Td>
              </tr>
            ))}

            {/* ───── HEALTH (full-width Yes/No rows) ───── */}
            <tr>
              <Td colSpan={12} editStep={7} onEdit={onEdit}>
                <span>
                  Have you ever been sick or injured which may cause work restrictions?{" "}
                </span>
                <CheckLabel inline on={values.hasInjury === "YES"} text="Yes" />
                <CheckLabel inline on={values.hasInjury === "NO"} text="No" />
                {values.hasInjury === "YES" && values.injuryDescription && (
                  <span style={{ marginLeft: 10 }}>
                    — <strong>{values.injuryDescription}</strong>
                  </span>
                )}
              </Td>
            </tr>
            <tr>
              <Td colSpan={12}>
                <span>
                  Do you agree that Cargo Safeway may adjust the applied rank in
                  accordance with your condition?{" "}
                </span>
                <CheckLabel inline on={values.agreeRankAdjust === "YES"} text="Yes" />
                <CheckLabel inline on={values.agreeRankAdjust === "NO"} text="No" />
              </Td>
            </tr>

            {/* ───── COMM ABILITY (English + Mandarin proficiency, Test row) ───── */}
            <Spine label="Comm. Ability" rows={2} editStep={7} onEdit={onEdit}>
              <Td colSpan={1} compact>
                <Label>Language</Label>
              </Td>
              <Td colSpan={4} compact>
                <Label>Proficiency</Label>
                <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
                  {(["EXCELLENT", "GOOD", "FAIR", "NONE"] as const).map((p) => (
                    <span key={p} style={{ fontSize: 11, color: "#666" }}>
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                    </span>
                  ))}
                </div>
              </Td>
              <Td colSpan={3} compact>
                <Label>International English Test</Label>
                <Label>TOEIC / IELTS / TOEFL · Score</Label>
              </Td>
              <Td colSpan={1} compact>
                <Label>Language</Label>
              </Td>
              <Td colSpan={2} compact>
                <Label>Proficiency</Label>
              </Td>
            </Spine>
            <tr>
              <Td colSpan={1}>
                <Value bold>English</Value>
              </Td>
              <Td colSpan={4}>
                <div style={{ display: "flex", gap: 10 }}>
                  {(["EXCELLENT", "GOOD", "FAIR", "NONE"] as const).map((p) => (
                    <CheckLabel
                      key={p}
                      on={values.englishProficiency === p}
                      text={p.charAt(0) + p.slice(1).toLowerCase()}
                    />
                  ))}
                </div>
              </Td>
              <Td colSpan={3}>
                <Value>
                  {values.englishTest
                    ? `${values.englishTest}${
                        values.englishTestScore ? ` · ${values.englishTestScore}` : ""
                      }`
                    : ""}
                </Value>
              </Td>
              <Td colSpan={1}>
                <Value bold>Mandarin</Value>
              </Td>
              <Td colSpan={2}>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["EXCELLENT", "GOOD", "FAIR", "NONE"] as const).map((p) => (
                    <CheckLabel
                      key={p}
                      on={values.mandarinProficiency === p}
                      text={p.charAt(0) + p.slice(1).toLowerCase()}
                    />
                  ))}
                </div>
              </Td>
            </tr>

            {/* ───── DECLARATION + SIGNATURES ───── */}
            <tr>
              <Td colSpan={6} alignTop>
                <p style={{ fontSize: 12 }}>I make sure all the data is true.</p>
                <div style={{ marginTop: 22 }}>
                  <div
                    style={{
                      borderBottom: "1px solid #111",
                      paddingBottom: 2,
                      minHeight: 18,
                      fontFamily: "var(--font-anton, Arial, sans-serif)",
                      fontSize: 20,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {signature || ""}
                  </div>
                  <p style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                    Signature ＿ Date: {todayCompact()}
                  </p>
                </div>
              </Td>
              <Td colSpan={6} alignTop>
                <p style={{ fontSize: 12 }}>
                  Review by (Agency):{" "}
                  <strong>Cargo Safeway Incorporated (CSI)</strong>
                </p>
                <div style={{ marginTop: 22 }}>
                  <div
                    style={{
                      borderBottom: "1px solid #111",
                      paddingBottom: 2,
                      minHeight: 18,
                    }}
                  />
                  <p style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                    Signature
                  </p>
                </div>
              </Td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────── Building blocks ─────────── */

const CELL_BORDER = "1px solid #444";

function Td({
  children,
  colSpan = 1,
  rowSpan = 1,
  alignTop = false,
  compact = false,
  editStep,
  onEdit,
}: {
  children?: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  alignTop?: boolean;
  compact?: boolean;
  editStep?: number;
  onEdit?: (step: number) => void;
}) {
  return (
    <td
      colSpan={colSpan}
      rowSpan={rowSpan}
      style={{
        border: CELL_BORDER,
        padding: compact ? "4px 8px" : "7px 10px",
        verticalAlign: alignTop ? "top" : "middle",
        position: editStep ? "relative" : undefined,
      }}
    >
      {children}
      {editStep && onEdit && <EditPin step={editStep} onEdit={onEdit} />}
    </td>
  );
}

function Th({
  children,
  colSpan = 1,
  editStep,
  onEdit,
}: {
  children: React.ReactNode;
  colSpan?: number;
  editStep?: number;
  onEdit?: (step: number) => void;
}) {
  return (
    <th
      colSpan={colSpan}
      style={{
        border: CELL_BORDER,
        background: "#f3f4f6",
        padding: "6px 8px",
        textAlign: "left",
        position: "relative",
      }}
    >
      {children}
      {editStep && onEdit && <EditPin step={editStep} onEdit={onEdit} />}
    </th>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10.5,
        color: "#666",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        lineHeight: 1.2,
      }}
    >
      {children}
    </div>
  );
}

function Value({
  children,
  bold = false,
}: {
  children?: React.ReactNode;
  bold?: boolean;
}) {
  const text = (children ?? "").toString();
  return (
    <div
      style={{
        fontSize: 14,
        fontWeight: bold ? 700 : 500,
        color: text.trim() ? "#111" : "transparent",
        minHeight: 16,
        wordBreak: "break-word",
      }}
    >
      {text.trim() || "·"}
    </div>
  );
}

function PhotoCell({ photo }: { photo: PhotoState }) {
  return (
    <td
      colSpan={3}
      rowSpan={3}
      style={{
        border: CELL_BORDER,
        padding: 6,
        verticalAlign: "middle",
        textAlign: "center",
      }}
    >
      {photo?.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.previewUrl}
          alt="Applicant"
          style={{
            width: "100%",
            maxWidth: 160,
            aspectRatio: "1 / 1",
            objectFit: "cover",
            border: "1px solid #999",
            display: "block",
            margin: "0 auto",
          }}
        />
      ) : (
        <div
          style={{
            width: 110,
            aspectRatio: "1 / 1",
            margin: "0 auto",
            border: "1px dashed #999",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: "#999",
            lineHeight: 1.2,
          }}
        >
          2 × 2
          <br />
          PHOTO
        </div>
      )}
      <p style={{ fontSize: 10, color: "#666", marginTop: 6 }}>
        Recent photo
        <br />
        (within past 3 months)
      </p>
    </td>
  );
}

function CheckLabel({
  on,
  text,
  inline = false,
}: {
  on: boolean;
  text: string;
  inline?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12,
        color: "#111",
        marginRight: inline ? 12 : 0,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 13,
          height: 13,
          border: "1px solid #555",
          background: "#fff",
          flexShrink: 0,
        }}
      >
        {on && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 12.5L10 17L19 7"
              stroke="#111"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {text}
    </span>
  );
}

/**
 * Spine: renders a section's first row, with a left-side label cell that
 * vertically merges across the next `rows-1` rows. The first content row is
 * passed in as children.
 */
function Spine({
  label,
  rows,
  editStep,
  onEdit,
  children,
}: {
  label: string;
  rows: number;
  editStep: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td
        rowSpan={rows}
        style={{
          border: CELL_BORDER,
          background: "#f8f8f8",
          padding: "4px 3px",
          verticalAlign: "middle",
          textAlign: "center",
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          writingMode: "vertical-rl" as const,
          transform: "rotate(180deg)",
          position: "relative",
        }}
      >
        {label}
        <EditPin step={editStep} onEdit={onEdit} vertical />
      </td>
      {children}
    </tr>
  );
}

function EditPin({
  step,
  onEdit,
  vertical = false,
}: {
  step: number;
  onEdit: (step: number) => void;
  vertical?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit(step);
      }}
      title="Edit this section"
      style={{
        position: "absolute",
        top: 2,
        right: 2,
        opacity: 0.45,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 2,
        transform: vertical ? "rotate(180deg)" : undefined,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.45")}
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 20h4l10-10-4-4L4 16v4z"
          stroke="#15803d"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/* ─────────── Helpers ─────────── */

const STCW_LIST: Array<[string, string]> = [
  ["stcwBasicTraining", "1. Basic Training"],
  ["stcwSurvivalCraft", "2. Survival Craft & Rescue Boats"],
  ["stcwAdvancedFireFighting", "3. Advanced Fire Fighting"],
  ["stcwMedicalFirstAid", "4. Medical First Aid"],
  ["stcwMedicalCare", "5. Medical Care"],
  ["stcwSecurityAwareness", "6. Security Awareness / Duty"],
  ["stcwShipSecurityOfficer", "7. Ship Security Officer"],
  ["stcwShipsCookCert", "8. Ship's Cook Certificate"],
  ["stcwYellowFever", "9. Yellow Fever"],
  ["stcwEcdis", "10. ECDIS"],
  ["stcwRadarArpa", "11. RADAR / ARPA"],
  ["stcwBrmErm", "12. BRM / ERM"],
];

function dateNoSep(s: string | undefined): string {
  if (!s) return "";
  return s.replace(/-/g, "");
}

function periodNoSep(from: string | undefined, to: string | undefined): string {
  const f = (from || "").replace(/-/g, "");
  const t = (to || "").replace(/-/g, "");
  if (!f && !t) return "";
  return `${f || "—"} → ${t || "—"}`;
}

function formatAddress(v: ApplicationValues): string {
  const cityProv = [v.addressCity, v.addressProvince]
    .filter((s) => (s ?? "").trim() !== "")
    .join(", ");
  const cityProvZip = [cityProv, v.addressPostalCode]
    .filter((s) => (s ?? "").trim() !== "")
    .join(" ");
  return [v.addressStreet, cityProvZip, v.addressCountry]
    .filter((s) => (s ?? "").trim() !== "")
    .join(", ");
}

function joinSlash(a: string | undefined, b: string | undefined): string {
  const av = (a || "").trim();
  const bv = (b || "").trim();
  if (av && bv) return `${av} / ${bv}`;
  return av || bv;
}

function todayCompact(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

function padRows<T>(arr: T[], min: number, factory: () => T): T[] {
  const out = [...arr];
  while (out.length < min) out.push(factory());
  return out;
}
