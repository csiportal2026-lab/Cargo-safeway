"use client";

import SiteHeader from "../../components/SiteHeader";

type Payslip = {
  period: string; // ISO month, e.g. "2026-04"
  vessel: string;
  rank: string;
  net: number; // USD
  fileSize: string;
};

const PAYSLIPS: Payslip[] = [
  { period: "2026-04", vessel: "MV Ever Greet", rank: "Third Engineer", net: 2275, fileSize: "184 KB" },
  { period: "2026-03", vessel: "MV Ever Greet", rank: "Third Engineer", net: 2038, fileSize: "182 KB" },
  { period: "2026-02", vessel: "MV Ever Greet", rank: "Third Engineer", net: 2157, fileSize: "180 KB" },
  { period: "2026-01", vessel: "MV Ever Greet", rank: "Third Engineer", net: 2548, fileSize: "186 KB" },
];

const PHP_RATE = 56;

function fmtUSD(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtPHP(n: number) {
  return `₱${(n * PHP_RATE).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
}
function fmtMonth(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
function fileName(p: Payslip) {
  return `Cargo-Safeway-Payslip-${p.period}.pdf`;
}

export default function PayslipsPage() {
  const visible = PAYSLIPS.filter((p) => p.period.startsWith("2026"));
  const ytd = visible.reduce((s, p) => s + p.net, 0);

  return (
    <main className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6">
      <div className="relative card-canvas w-full max-w-[1200px] lg:w-[1123px] lg:h-[632px] lg:shrink-0 bg-white rounded-3xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors">
        <SiteHeader />

        <section className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-12 pt-6 pb-10">
          <div className="mb-6">
            <h1 className="text-[28px] sm:text-[32px] font-extrabold tracking-[-0.02em] text-neutral-900">
              Payslips
            </h1>
            <p className="mt-1 text-[13px] text-neutral-500">
              Issued monthly as a PDF. Download for your records.
            </p>
          </div>

          {/* PDF list */}
          <ul className="divide-y divide-neutral-200 rounded-xl ring-1 ring-neutral-200 overflow-hidden">
            {visible.map((p) => (
              <PayslipRow key={p.period} p={p} />
            ))}
            {visible.length === 0 && (
              <li className="py-10 text-center text-[13px] text-neutral-400">
                No payslips yet.
              </li>
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}

function PayslipRow({ p }: { p: Payslip }) {
  return (
    <li className="grid grid-cols-1 sm:grid-cols-[auto_1.4fr_1.6fr_auto_auto] items-center gap-3 sm:gap-4 px-4 py-3.5 hover:bg-neutral-50 transition-colors">
      {/* PDF icon */}
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-rose-50 text-rose-600 shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <text
            x="12"
            y="17.5"
            textAnchor="middle"
            fontSize="6"
            fontWeight="700"
            fill="currentColor"
            stroke="none"
          >
            PDF
          </text>
        </svg>
      </div>

      {/* Period + filename */}
      <div className="min-w-0">
        <div className="text-[14px] font-bold text-neutral-900 truncate">
          {fmtMonth(p.period)}
        </div>
        <div className="text-[11.5px] text-neutral-500 truncate">
          {fileName(p)} · {p.fileSize}
        </div>
      </div>

      {/* Vessel · Rank */}
      <div className="text-[12.5px] text-neutral-600 truncate">
        {p.vessel}
        <span className="text-neutral-400"> · </span>
        {p.rank}
      </div>

      {/* Net pay */}
      <div className="text-[13.5px] tabular-nums font-bold text-[#15803d] sm:text-right whitespace-nowrap">
        {fmtUSD(p.net)}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          title="Preview"
          aria-label="Preview"
          className="grid h-8 w-8 place-items-center rounded-lg text-neutral-600 hover:bg-[#15803d]/10 hover:text-[#15803d] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
        <button
          type="button"
          title="Download PDF"
          aria-label="Download PDF"
          className="grid h-8 w-8 place-items-center rounded-lg text-neutral-600 hover:bg-[#15803d]/10 hover:text-[#15803d] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </li>
  );
}
