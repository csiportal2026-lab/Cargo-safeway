"use client";

import { useMemo, useRef, useState } from "react";
import SiteHeader from "../../components/SiteHeader";

type DocStatus = "valid" | "expiring" | "expired";

type Doc = {
  name: string;
  country: string;
  rank: string;
  number: string;
  issued: string | null;
  expiry: string | null;
};

const TODAY = new Date(2026, 4, 2);

const DOCS: Doc[] = [
  { name: "Passport", country: "Philippines", rank: "—", number: "P1234567A", issued: "2024-08-15", expiry: "2029-08-14" },
  { name: "Seaman's Book (SIRB)", country: "Philippines", rank: "—", number: "MNL-2022-554123", issued: "2022-03-23", expiry: "2027-03-22" },
  { name: "US C1/D Visa", country: "USA", rank: "—", number: "C1D-7894561", issued: "2021-06-11", expiry: "2026-06-10" },
  { name: "Basic Safety Training", country: "Philippines", rank: "All Ranks", number: "BST-2022-44872", issued: "2022-11-05", expiry: "2027-11-04" },
  { name: "Advanced Fire Fighting", country: "Philippines", rank: "All Ranks", number: "AFF-2021-22184", issued: "2021-04-19", expiry: "2026-04-18" },
  { name: "Medical First Aid", country: "Philippines", rank: "All Ranks", number: "MFA-2023-91003", issued: "2023-02-10", expiry: "2028-02-09" },
  { name: "Survival Craft & Rescue Boats", country: "Philippines", rank: "All Ranks", number: "SCRB-2022-77512", issued: "2022-10-01", expiry: "2027-09-30" },
  { name: "PEME (Pre-Employment Medical)", country: "Philippines", rank: "—", number: "PEME-2025-12044", issued: "2025-08-23", expiry: "2026-08-22" },
  { name: "Yellow Fever Vaccination", country: "Philippines", rank: "—", number: "YF-2020-883", issued: "2020-05-12", expiry: null },
  { name: "Latest Contract (EVG-2024-04)", country: "Taiwan", rank: "Third Engineer", number: "EVG-2024-04", issued: "2024-04-12", expiry: "2025-12-15" },
  { name: "Service Record Book", country: "Philippines", rank: "—", number: "SRB-995412", issued: "2024-08-15", expiry: null },
];

function statusOf(d: Doc): DocStatus {
  if (!d.expiry) return "valid";
  const days = Math.round(
    (new Date(d.expiry).getTime() - TODAY.getTime()) / 86400000,
  );
  if (days < 0) return "expired";
  if (days <= 90) return "expiring";
  return "valid";
}

export default function DocumentVaultPage() {
  const docs = useMemo(
    () => DOCS.map((d) => ({ ...d, status: statusOf(d) })),
    [],
  );

  const needsAttention = docs.filter((d) => d.status === "expired").length;

  const [dragOver, setDragOver] = useState(false);
  const [queued, setQueued] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [revealNumbers, setRevealNumbers] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const PAGE_SIZE = 8;
  const totalPages = Math.max(1, Math.ceil(docs.length / PAGE_SIZE));
  const pageDocs = docs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    setQueued((q) => [...q, ...names]);
  }

  return (
    <main className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center overflow-x-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="relative card-canvas w-[1123px] h-[632px] shrink-0 bg-white rounded-3xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors">
        <SiteHeader />

        {/* Decorative background watermark */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-[68px] left-[160px] sm:left-[195px] w-[100px] h-[100px] opacity-95 bg-no-repeat bg-contain bg-left-top"
          style={{ backgroundImage: "url('/document-vault-bg.webp')" }}
        />

        <section className="relative flex-1 min-h-0 overflow-y-auto px-6 sm:px-12 pt-6 pb-10">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[28px] sm:text-[32px] font-extrabold tracking-[-0.02em] text-neutral-900">
                Document
              </h1>
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              title="Upload document"
              aria-label="Upload document"
              className="submit-ready grid h-10 w-10 place-items-center rounded-full bg-white text-[#15803d] ring-1 ring-[#15803d] hover:bg-[#15803d]/5 transition-colors shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {queued.length > 0 && (
            <div className="mb-5 text-[12px] text-[#15803d]">
              <span className="font-semibold">{queued.length} queued:</span>{" "}
              <span className="text-neutral-600">{queued.join(", ")}</span>
            </div>
          )}

          {/* Drop zone wrapper around the table */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`relative rounded-xl transition-colors ${
              dragOver ? "ring-2 ring-[#15803d] bg-[#15803d]/5" : ""
            }`}
          >
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[12px] font-extrabold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 [&>th+th]:border-l [&>th+th]:border-neutral-200">
                    <th className="py-2 px-4 font-semibold">Document</th>
                    <th className="py-2 px-4 font-semibold">Country</th>
                    <th className="py-2 px-4 font-semibold text-center">
                      <span className="inline-flex items-center gap-1.5">
                        Document No.
                        <button
                          type="button"
                          onClick={() => setRevealNumbers((s) => !s)}
                          title={revealNumbers ? "Hide all numbers" : "Reveal all numbers"}
                          aria-label={revealNumbers ? "Hide all numbers" : "Reveal all numbers"}
                          className="grid h-5 w-5 place-items-center rounded text-neutral-400 hover:text-[#15803d] hover:bg-[#15803d]/10 transition-colors"
                        >
                          {revealNumbers ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path
                                d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-7 0-10-7-10-7a17.5 17.5 0 0 1 4.06-5.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a17.5 17.5 0 0 1-2.16 3.19M14.12 14.12A3 3 0 1 1 9.88 9.88M1 1l22 22"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path
                                d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              />
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                            </svg>
                          )}
                        </button>
                      </span>
                    </th>
                    <th className="py-2 px-4 font-semibold">Issued</th>
                    <th className="py-2 px-4 font-semibold">Expires</th>
                    <th className="py-2 px-4 font-semibold">Status</th>
                    <th className="py-2 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {pageDocs.map((d) => (
                    <DocTableRow key={d.name} doc={d} reveal={revealNumbers} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="md:hidden divide-y divide-neutral-200">
              {pageDocs.map((d) => (
                <DocMobileCard key={d.name} doc={d} reveal={revealNumbers} />
              ))}
            </ul>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between">
              <div className="text-[12px] text-neutral-500">
                Showing {page * PAGE_SIZE + 1}–
                {Math.min((page + 1) * PAGE_SIZE, docs.length)} of {docs.length}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  aria-label="Previous page"
                  className="grid h-9 w-9 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-[#15803d] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="m15 18-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <span className="text-[12.5px] font-semibold tabular-nums text-neutral-700 px-2">
                  {page + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  aria-label="Next page"
                  className="grid h-9 w-9 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-[#15803d] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="m9 18 6-6-6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: DocStatus }) {
  const meta: Record<DocStatus, { label: string; tone: string }> = {
    valid: { label: "Valid", tone: "text-[#15803d]" },
    expiring: { label: "Expiring", tone: "text-yellow-500" },
    expired: { label: "Expired", tone: "text-rose-600 animate-pulse" },
  };
  const m = meta[status];
  return (
    <span
      className={`whitespace-nowrap text-[12px] font-semibold uppercase tracking-wide ${m.tone}`}
    >
      {m.label}
    </span>
  );
}

function fmtDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function edgeColor(status: DocStatus): string {
  switch (status) {
    case "expired":
      return "bg-rose-500";
    case "expiring":
      return "bg-yellow-400";
    case "valid":
    default:
      return "bg-[#15803d]";
  }
}

function edgeBorder(status: DocStatus): string {
  switch (status) {
    case "expired":
      return "border-rose-500";
    case "expiring":
      return "border-yellow-400";
    case "valid":
    default:
      return "border-[#15803d]";
  }
}

function DocTableRow({ doc, reveal }: { doc: Doc & { status: DocStatus }; reveal: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    country: doc.country,
    rank: doc.rank,
    number: doc.number,
    issued: doc.issued ?? "",
    expiry: doc.expiry ?? "",
  });

  function save() {
    setEditing(false);
    // (data is static — in a real app, persist `draft` here)
  }
  function cancel() {
    setDraft({
      country: doc.country,
      rank: doc.rank,
      number: doc.number,
      issued: doc.issued ?? "",
      expiry: doc.expiry ?? "",
    });
    setEditing(false);
  }

  const inputCls =
    "w-full rounded-md bg-white border border-[#15803d]/40 px-2 py-1 text-[12.5px] text-neutral-900 outline-none focus:border-[#15803d] transition-colors";

  return (
    <tr
      className={`group text-[13px] transition-colors [&>td+td]:border-l [&>td+td]:border-neutral-200 ${
        editing
          ? "bg-[#15803d]/5"
          : "text-neutral-800 hover:bg-[#15803d]/5 hover:text-[#15803d] cursor-pointer [&:hover_td]:text-[#15803d]"
      }`}
    >
      <td className="py-3 px-4 font-semibold text-neutral-900">
        <div className="flex items-stretch gap-3">
          <span className={`w-1 rounded-full ${edgeColor(doc.status)}`} />
          <span>{doc.name}</span>
        </div>
      </td>
      <td className="py-3 px-4 font-medium text-neutral-700">
        {editing ? (
          <input
            className={inputCls}
            value={draft.country}
            onChange={(e) => setDraft({ ...draft, country: e.target.value })}
          />
        ) : (
          doc.country
        )}
      </td>
      <td className="py-3 px-4 tabular-nums font-medium text-neutral-700 text-center">
        {editing ? (
          <input
            className={`${inputCls} text-center`}
            value={draft.number}
            onChange={(e) => setDraft({ ...draft, number: e.target.value })}
          />
        ) : (
          <MaskedNumber value={doc.number} reveal={reveal} />
        )}
      </td>
      <td className="py-3 px-4 tabular-nums font-medium text-neutral-700">
        {editing ? (
          <input
            type="date"
            className={inputCls}
            value={draft.issued}
            onChange={(e) => setDraft({ ...draft, issued: e.target.value })}
          />
        ) : (
          fmtDate(doc.issued)
        )}
      </td>
      <td
        className={`py-3 px-4 tabular-nums font-medium ${
          editing
            ? "text-neutral-700"
            : doc.status === "expired"
              ? "text-rose-600 font-semibold animate-pulse"
              : doc.status === "expiring"
                ? "text-yellow-500 font-semibold"
                : "text-neutral-700"
        }`}
      >
        {editing ? (
          <input
            type="date"
            className={inputCls}
            value={draft.expiry}
            onChange={(e) => setDraft({ ...draft, expiry: e.target.value })}
          />
        ) : (
          fmtDate(doc.expiry)
        )}
      </td>
      <td className="py-3 px-4 whitespace-nowrap">
        <StatusPill
          status={
            editing
              ? statusOf({ ...doc, expiry: draft.expiry || null })
              : doc.status
          }
        />
      </td>
      <td className="py-3 px-4">
        {editing ? (
          <EditingActions onSave={save} onCancel={cancel} />
        ) : (
          <ActionButtons onEdit={() => setEditing(true)} />
        )}
      </td>
    </tr>
  );
}

function DocMobileCard({ doc, reveal }: { doc: Doc & { status: DocStatus }; reveal: boolean }) {
  return (
    <li className={`group py-4 pl-3 space-y-2 border-l-4 cursor-pointer hover:bg-[#15803d]/5 hover:[&_*]:text-[#15803d] transition-colors ${edgeBorder(doc.status)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="font-semibold text-[14px] text-neutral-900">
          {doc.name}
        </div>
        <StatusPill status={doc.status} />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px]">
        <FieldLine label="Country" value={doc.country} />
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Document No.
          </div>
          <div className="mt-0.5 font-semibold text-neutral-800">
            <MaskedNumber value={doc.number} reveal={reveal} />
          </div>
        </div>
        <FieldLine label="Issued" value={fmtDate(doc.issued)} />
        <FieldLine
          label="Expires"
          value={fmtDate(doc.expiry)}
          tone={
            doc.status === "expired"
              ? "text-rose-600 animate-pulse"
              : doc.status === "expiring"
                ? "text-yellow-500"
                : ""
          }
        />
      </div>
      <div className="pt-1">
        <ActionButtons />
      </div>
    </li>
  );
}

function FieldLine({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </div>
      <div className={`mt-0.5 font-semibold text-neutral-800 ${tone || ""}`}>
        {value}
      </div>
    </div>
  );
}

function MaskedNumber({ value, reveal }: { value: string; reveal: boolean }) {
  if (reveal) return <span className="tabular-nums">{value}</span>;
  if (value.length <= 2) return <span className="tabular-nums">{value}</span>;
  const tail = value.slice(-2);
  const head = value.slice(0, -2).replace(/[^\s\-]/g, "*");
  return <span className="tabular-nums">{head + tail}</span>;
}

function EditingActions({
  onSave,
  onCancel,
}: {
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        title="Save"
        aria-label="Save"
        onClick={onSave}
        className="grid h-8 w-8 place-items-center rounded-lg text-[#15803d] hover:bg-[#15803d]/10 transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="m5 12 5 5L20 7"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        title="Cancel"
        aria-label="Cancel"
        onClick={onCancel}
        className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M18 6 6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

function ActionButtons({ onEdit }: { onEdit?: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        title="View"
        aria-label="View"
        className="grid h-8 w-8 place-items-center rounded-lg text-[#15803d] hover:bg-[#15803d]/10 transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>
      <button
        type="button"
        title="Edit"
        aria-label="Edit"
        onClick={onEdit}
        className="grid h-8 w-8 place-items-center rounded-lg text-neutral-600 hover:bg-[#15803d]/10 hover:text-[#15803d] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        title="Delete"
        aria-label="Delete"
        className="grid h-8 w-8 place-items-center rounded-lg text-neutral-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14ZM10 11v6M14 11v6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
