"use client";

import { useState } from "react";
import SiteHeader from "../../components/SiteHeader";

type AllotStatus = "Disbursed" | "Approved" | "Under Review" | "Pending Receipts";

type Allotment = {
  date: string;
  type: string;
  amountUSD: number;
  status: AllotStatus;
  hasReceipt: boolean;
};

type Voyage = {
  vessel: string;
  rank: string;
  start: string;
  end: string | null;
  items: Allotment[];
};

const VOYAGES: Voyage[] = [
  {
    vessel: "MV Ever Greet",
    rank: "Third Engineer",
    start: "2025-12-08",
    end: null,
    items: [
      { date: "2025-11-22", type: "Pre-Employment Medical", amountUSD: 145, status: "Disbursed", hasReceipt: true },
      { date: "2025-11-28", type: "Vaccination", amountUSD: 60, status: "Disbursed", hasReceipt: true },
      { date: "2025-12-04", type: "Joining Allowance", amountUSD: 200, status: "Disbursed", hasReceipt: true },
      { date: "2025-12-06", type: "Travel & Transit", amountUSD: 320, status: "Approved", hasReceipt: true },
      { date: "2025-12-07", type: "Quarantine / Hotel", amountUSD: 180, status: "Under Review", hasReceipt: false },
    ],
  },
  {
    vessel: "MV Ever Galaxy",
    rank: "Fourth Engineer",
    start: "2024-07-14",
    end: "2025-09-22",
    items: [
      { date: "2024-06-30", type: "Pre-Employment Medical", amountUSD: 140, status: "Disbursed", hasReceipt: true },
      { date: "2024-07-05", type: "Joining Allowance", amountUSD: 200, status: "Disbursed", hasReceipt: true },
      { date: "2024-07-12", type: "Travel & Transit", amountUSD: 295, status: "Disbursed", hasReceipt: true },
      { date: "2025-09-22", type: "Repatriation", amountUSD: 410, status: "Disbursed", hasReceipt: true },
    ],
  },
  {
    vessel: "MV Ever Glory",
    rank: "Oiler",
    start: "2023-01-18",
    end: "2024-04-02",
    items: [
      { date: "2023-01-04", type: "Pre-Employment Medical", amountUSD: 130, status: "Disbursed", hasReceipt: true },
      { date: "2023-01-12", type: "Joining Allowance", amountUSD: 180, status: "Disbursed", hasReceipt: true },
      { date: "2023-01-16", type: "Travel & Transit", amountUSD: 240, status: "Disbursed", hasReceipt: true },
      { date: "2024-04-02", type: "Repatriation", amountUSD: 360, status: "Disbursed", hasReceipt: true },
    ],
  },
];

function fmtUSD(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function voyagePeriod(v: Voyage) {
  const start = new Date(v.start).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  if (!v.end) return `${start} – Present`;
  const end = new Date(v.end).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  return `${start} – ${end}`;
}

export default function TravelAllotmentsPage() {
  return (
    <main className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6">
      <div className="relative card-canvas w-full max-w-[1200px] lg:w-[1123px] lg:h-[632px] lg:shrink-0 bg-white rounded-3xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors">
        <SiteHeader />

        <section className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-12 pt-6 pb-10">
          <div className="mb-6">
            <h1 className="text-[28px] sm:text-[32px] font-extrabold tracking-[-0.02em] text-neutral-900">
              Travel Allotments
            </h1>
          </div>

          <ul className="divide-y divide-neutral-200">
            {VOYAGES.map((v, i) => (
              <VoyageRow key={`${v.vessel}-${v.start}`} v={v} defaultOpen={i === 0} />
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function VoyageRow({ v, defaultOpen }: { v: Voyage; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const total = v.items.reduce((s, i) => s + i.amountUSD, 0);
  const isOngoing = v.end === null;

  return (
    <li className="py-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-neutral-900 truncate">
              {v.vessel}
            </span>
            {isOngoing && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#15803d]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#15803d] animate-pulse" />
                Active
              </span>
            )}
          </div>
          <div className="text-[12px] text-neutral-500 truncate">
            {voyagePeriod(v)}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[14px] font-bold tabular-nums text-neutral-900">
            {fmtUSD(total)}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className={`text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {open && (
        <ul className="mt-3 ml-1 space-y-1.5">
          {v.items.map((it, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between gap-3 py-1 text-[12.5px]"
            >
              <span className="text-neutral-800 min-w-0 truncate">
                {it.type}
              </span>
              <div className="flex items-center gap-3 shrink-0 text-neutral-500 tabular-nums">
                <span>{fmtDate(it.date)}</span>
                <span className="font-semibold text-neutral-800 w-14 text-right">
                  {fmtUSD(it.amountUSD)}
                </span>
                <StatusDot status={it.status} />
                {!it.hasReceipt && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                    Receipt
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function StatusDot({ status }: { status: AllotStatus }) {
  const color =
    status === "Disbursed"
      ? "bg-[#15803d]"
      : status === "Approved"
        ? "bg-blue-500"
        : status === "Under Review"
          ? "bg-amber-500"
          : "bg-rose-500";
  return (
    <span
      title={status}
      aria-label={status}
      className={`h-1.5 w-1.5 rounded-full ${color}`}
    />
  );
}
