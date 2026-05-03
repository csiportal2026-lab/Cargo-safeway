"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SiteHeader from "../components/SiteHeader";

const SECTIONS = [
  "Basic Details",
  "Personal Details",
  "Identification Cards",
  "Contact Details",
  "Family & Relatives",
] as const;
type Section = (typeof SECTIONS)[number];

export default function PortalPage() {
  const [section, setSection] = useState<Section>("Basic Details");
  const [status, setStatus] = useState<SeafarerStatus>("Vacation");
  const idx = SECTIONS.indexOf(section);
  const isFirst = idx === 0;
  const isLast = idx === SECTIONS.length - 1;

  function next() {
    if (!isLast) setSection(SECTIONS[idx + 1]);
  }
  function prev() {
    if (!isFirst) setSection(SECTIONS[idx - 1]);
  }

  return (
    <main className="min-h-screen w-full bg-[#f3f4f6] flex items-stretch justify-center px-4 sm:px-6 py-4 sm:py-6">
      <div className="relative w-full max-w-[1200px] bg-white rounded-3xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors">
        <SiteHeader />

        <section className="flex-1 px-6 sm:px-12 pt-2 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-x-6 gap-y-2">
            {/* Left: profile column — aligned to top, spans both rows */}
            <aside className="lg:row-span-2 lg:self-center space-y-3">
              {/* Profile picture box */}
              <div className="rounded-2xl bg-white ring-1 ring-[#15803d]/40 overflow-hidden">
                <div className="relative aspect-square w-full bg-[#15803d]/10 grid place-items-center text-[#15803d] text-[88px] font-extrabold tracking-tight">
                  IR
                  <button
                    type="button"
                    aria-label="Upload photo"
                    className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-[#15803d] text-white shadow-md hover:bg-[#126a33] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </button>
                </div>

                <div className="px-4 py-3 text-center">
                  <h2 className="text-[16px] font-bold tracking-tight text-neutral-900">
                    Ian Rex
                  </h2>
                </div>

              </div>

              {/* Security actions — plain rows, no card */}
              <div className="px-1">
                <div className="flex items-center justify-between py-2.5">
                  <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-neutral-700">
                    <span
                      className={`relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center ${
                        status === "Onboard"
                          ? "text-blue-500"
                          : status === "Vacation"
                            ? "text-amber-500"
                            : "text-[#15803d]"
                      }`}
                    >
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-full bg-current status-pulse-out"
                      />
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                        className="relative"
                      >
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                      </svg>
                    </span>
                    Status
                  </span>
                  <SeafarerStatusSelect value={status} onChange={setStatus} />
                </div>

                <div className="flex items-center justify-between gap-2 py-2.5">
                  <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-neutral-700">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M12 2 4 6v6c0 5 3.5 9.4 8 10 4.5-.6 8-5 8-10V6l-8-4Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Position
                  </span>
                  <PositionSelect />
                </div>

                <AvailabilityRow disabled={status !== "Available"} />

                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 py-2.5 text-[12.5px] font-semibold text-neutral-700 hover:text-[#15803d] transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    Change Password
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden className="text-neutral-400">
                    <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <TwoFactorRow />
              </div>

            </aside>

            {/* Title + progress above the form column */}
            <div className="mb-1">
              <div className="relative flex items-center justify-between gap-3 min-h-[40px]">
              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="text-[28px] sm:text-[32px] font-extrabold tracking-[-0.02em] text-neutral-900">
                  My Profile
                </h1>
                <span className="text-[13px] font-medium text-neutral-500">
                  · {section}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold tabular-nums text-neutral-500">
                  ({idx + 1}/{SECTIONS.length})
                </span>
                <button
                  type="button"
                  aria-label="Previous section"
                  title="Previous"
                  onClick={prev}
                  disabled={isFirst}
                  className="group grid h-10 w-10 place-items-center rounded-full text-[#15803d] hover:bg-[#15803d]/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                    className="transition-transform group-hover:enabled:-translate-x-0.5"
                  >
                    <path
                      d="M19 12H5m0 0 5 5m-5-5 5-5"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next section"
                  title={isLast ? "Last section" : `Next: ${SECTIONS[idx + 1]}`}
                  onClick={next}
                  disabled={isLast}
                  className="group grid h-10 w-10 place-items-center rounded-full text-[#15803d] hover:bg-[#15803d]/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                    className="transition-transform group-hover:enabled:translate-x-0.5"
                  >
                    <path
                      d="M5 12h14m0 0-5-5m5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              </div>

            </div>

            {/* Right: form fields per section */}
            <form
              key={section}
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 fade-in-up"
            >
              {section === "Basic Details" && <BasicDetailsFields />}
              {section === "Personal Details" && <PersonalDetailsFields />}
              {section === "Identification Cards" && <GovernmentIDsFields />}
              {section === "Contact Details" && <ContactDetailsFields />}
              {section === "Family & Relatives" && <FamilyFields />}
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function AvailabilityRow({ disabled = false }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);

  // Auto-close when becoming disabled
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  const [pos, setPos] = useState<{ bottom: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function place() {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      // Place popover above the trigger row, aligned to its left edge
      setPos({ bottom: window.innerHeight - r.top + 8, left: r.left });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);

    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node;
      if (
        triggerRef.current?.contains(t) ||
        popRef.current?.contains(t)
      )
        return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={disabled ? "Set status to Available to declare availability" : undefined}
        className={`w-full flex items-center justify-between gap-2 py-2.5 text-[12.5px] font-semibold transition-colors ${
          disabled
            ? "text-neutral-400 cursor-not-allowed"
            : "text-neutral-700 hover:text-[#15803d]"
        }`}
      >
        <span className="inline-flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Availability
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className={`transition-colors ${open ? "text-[#15803d]" : "text-neutral-400"}`}
        >
          <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && pos && (
        <div
          ref={popRef}
          style={{ position: "fixed", bottom: pos.bottom, left: pos.left }}
          className="z-50 w-[340px] rounded-2xl bg-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] ring-1 ring-[#15803d]/40 p-4 dropdown-pop"
        >
          <CompactAvailabilityCalendar />
        </div>
      )}
    </>
  );
}

const CAL_DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const CAL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function CompactAvailabilityCalendar() {
  const [view, setView] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [declared, setDeclared] = useState<{ start: Date; end: Date } | null>(
    null,
  );

  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);
  const minView = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today],
  );
  const maxView = useMemo(
    () => new Date(today.getFullYear(), today.getMonth() + 6, 1),
    [today],
  );
  const canPrev = view > minView;
  const canNext = view < maxView;

  const days = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const s = new Date(first);
    s.setDate(s.getDate() - first.getDay());
    const out: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      out.push(d);
    }
    return out;
  }, [view]);

  function sameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function selectDay(d: Date) {
    if (d < today) return;
    if (declared) setDeclared(null);
    if (!start || (start && end)) {
      setStart(d);
      setEnd(null);
    } else if (start && !end) {
      if (d < start) {
        setEnd(start);
        setStart(d);
      } else if (sameDay(d, start)) {
        return;
      } else {
        setEnd(d);
      }
    }
  }

  function fmtRange(a: Date, b: Date) {
    const sameYear = a.getFullYear() === b.getFullYear();
    const aStr = a.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(sameYear ? {} : { year: "numeric" }),
    });
    const bStr = b.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${aStr} – ${bStr}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => canPrev && setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
          disabled={!canPrev}
          aria-label="Previous month"
          className="grid h-7 w-7 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-[#15803d] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-[13px] font-extrabold tracking-tight text-neutral-900">
          {CAL_MONTHS[view.getMonth()]} {view.getFullYear()}
        </div>
        <button
          type="button"
          onClick={() => canNext && setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
          disabled={!canNext}
          aria-label="Next month"
          className="grid h-7 w-7 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-[#15803d] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {CAL_DAY_LABELS.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-semibold uppercase tracking-wider text-neutral-500 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const isCurrentMonth = d.getMonth() === view.getMonth();
          const isToday = sameDay(d, today);
          const isPast = d < today;
          const isStart = start !== null && sameDay(d, start);
          const isEnd = end !== null && sameDay(d, end);
          const isInRange =
            start !== null && end !== null && d > start && d < end;

          let style = "";
          if (isStart || isEnd) style = "bg-[#15803d] text-white font-bold";
          else if (isInRange) style = "bg-[#15803d]/15 text-[#15803d] font-semibold";
          else if (isPast) style = "text-neutral-300 cursor-not-allowed";
          else if (!isCurrentMonth) style = "text-neutral-300";
          else style = "text-neutral-800 hover:bg-[#15803d]/10 hover:text-[#15803d]";

          return (
            <button
              key={i}
              type="button"
              onClick={() => selectDay(d)}
              disabled={isPast}
              className={`h-8 grid place-items-center rounded-md text-[12px] transition-colors ${style} ${
                isToday && !isStart && !isEnd ? "ring-1 ring-[#15803d]" : ""
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col items-center gap-1.5">
        {declared ? (
          <>
            <button
              type="button"
              onClick={() => {
                setDeclared(null);
                setStart(null);
                setEnd(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#15803d] bg-white px-4 py-1.5 text-[11.5px] font-semibold text-[#15803d] hover:bg-[#15803d]/5 transition-colors"
            >
              Edit Declaration
            </button>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803d]">
              ✓ {fmtRange(declared.start, declared.end)}
            </div>
          </>
        ) : (
          <button
            type="button"
            disabled={!start || !end}
            onClick={() => {
              if (start && end) setDeclared({ start, end });
            }}
            className="rounded-full bg-[#15803d] px-4 py-1.5 text-[11.5px] font-semibold text-white shadow-sm hover:bg-[#126a33] transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
          >
            Declare Availability
          </button>
        )}
      </div>
    </div>
  );
}

type SeafarerStatus = "Onboard" | "Vacation" | "Available";

const STATUS_META: Record<
  SeafarerStatus,
  { dot: string; bg: string; text: string }
> = {
  Onboard: { dot: "bg-blue-500", bg: "bg-transparent", text: "text-neutral-900" },
  Vacation: { dot: "bg-amber-500", bg: "bg-transparent", text: "text-neutral-900" },
  Available: { dot: "bg-[#15803d]", bg: "bg-transparent", text: "text-neutral-900" },
};

function SeafarerStatusSelect({
  value,
  onChange,
}: {
  value: SeafarerStatus;
  onChange: (v: SeafarerStatus) => void;
}) {
  const status = value;
  const setStatus = onChange;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const m = STATUS_META[status];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 text-[13px] font-bold tracking-tight transition-colors hover:text-[#15803d] ${m.text}`}
      >
        {status}
        <svg
          width="9"
          height="9"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 z-10 min-w-[140px] rounded-xl bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)] ring-1 ring-neutral-200 p-1 dropdown-pop"
        >
          {(Object.keys(STATUS_META) as SeafarerStatus[]).map((s) => {
            const active = s === status;
            return (
              <button
                key={s}
                type="button"
                role="menuitem"
                onClick={() => {
                  setStatus(s);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
                  active
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <span>{s}</span>
                {active && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="m5 12 5 5L20 7"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const POSITIONS = [
  "Captain",
  "Chief Officer",
  "Second Officer",
  "Third Officer",
  "Chief Engineer",
  "Second Engineer",
  "Third Engineer",
  "Fourth Engineer",
  "Electro-Technical Officer",
  "Bosun",
  "Able Seaman",
  "Ordinary Seaman",
  "Oiler",
  "Wiper",
  "Cook",
  "Messman",
] as const;

function PositionSelect() {
  const [position, setPosition] = useState<string>("Third Engineer");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-[13px] font-bold tracking-tight text-neutral-900 transition-colors hover:text-[#15803d]"
      >
        {position}
        <svg
          width="9"
          height="9"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 z-30 max-h-[260px] overflow-y-auto min-w-[200px] rounded-xl bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)] ring-1 ring-neutral-200 p-1 dropdown-pop"
        >
          {POSITIONS.map((p) => {
            const active = p === position;
            return (
              <button
                key={p}
                type="button"
                role="menuitem"
                onClick={() => {
                  setPosition(p);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
                  active
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <span>{p}</span>
                {active && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="m5 12 5 5L20 7"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TwoFactorRow() {
  const [enabled, setEnabled] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setEnabled((v) => !v)}
      className="w-full flex items-center justify-between gap-2 py-2.5 text-[12.5px] font-semibold text-neutral-700 hover:text-[#15803d] transition-colors"
    >
      <span className="inline-flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2 4 6v6c0 5 3.5 9.4 8 10 4.5-.6 8-5 8-10V6l-8-4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="m9 12 2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Two-Factor Auth
      </span>
      <span
        aria-hidden
        className={`relative h-5 w-9 rounded-full transition-colors ${
          enabled ? "bg-[#15803d]" : "bg-neutral-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            enabled ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function BasicDetailsFields() {
  return (
    <>
      <Field label="Seaman Code" name="seamanCode" placeholder="e.g. CS-04521" />
      <SelectField
        label="Gender"
        name="gender"
        placeholder="Select gender"
        options={["Male", "Female"]}
      />
      <Field label="First Name" name="firstName" placeholder="Ian" />
      <Field label="Middle Name" name="middleName" placeholder="Dela Cruz" />
      <Field label="Surname" name="surname" placeholder="Rex" />
      <Field label="Name Suffix" name="suffix" placeholder="Jr., Sr., III" />
      <Field label="Father's Name" name="fatherName" placeholder="Full name" />
      <Field label="Nationality" name="nationality" placeholder="Filipino" />
      <Field label="Date of Birth" name="dob" type="date" />
      <Field label="Place of Birth" name="placeOfBirth" placeholder="City, country" />
    </>
  );
}

function PersonalDetailsFields() {
  return (
    <>
      <Field
        label="Nearest Airport"
        name="nearestAirport"
        placeholder="e.g. NAIA Manila"
      />
      <Field
        label="Weight (Kg)"
        name="weight"
        type="number"
        placeholder="68"
      />
      <Field
        label="Height (cm)"
        name="height"
        type="number"
        placeholder="172"
      />
      <Field label="Shoe Size" name="shoeSize" placeholder="EU 42" />
      <SelectField
        label="Body Build"
        name="bodyBuild"
        placeholder="Select body build"
        options={["Slim", "Average", "Athletic", "Heavy", "Muscular"]}
      />
      <SelectField
        label="Eye Color"
        name="eyeColor"
        placeholder="Select eye color"
        options={["Black", "Brown", "Blue", "Green", "Gray", "Hazel"]}
      />
      <SelectField
        label="Skin Complexion"
        name="skinComplexion"
        placeholder="Select complexion"
        options={["Fair", "Light", "Medium", "Olive", "Tan", "Dark"]}
      />
      <SelectField
        label="Blood Type"
        name="bloodType"
        placeholder="Select blood type"
        options={["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"]}
      />
      <Field label="Religion" name="religion" placeholder="e.g. Roman Catholic" />
      <Field
        label="Identifying Marks"
        name="identifyingMarks"
        placeholder="Tattoo, scar, birthmark, etc."
      />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[11.5px]">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold text-neutral-900 tabular-nums">
        {value}
      </span>
    </div>
  );
}

function Badge({
  label,
  status,
}: {
  label: string;
  status: "ok" | "pending" | "warn";
}) {
  const tones = {
    ok: { dot: "bg-emerald-500", text: "text-neutral-700" },
    pending: { dot: "bg-amber-500", text: "text-neutral-700" },
    warn: { dot: "bg-red-500", text: "text-neutral-700" },
  };
  const t = tones[status];
  return (
    <div className="flex items-center gap-2 text-[11.5px]">
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      <span className={t.text}>{label}</span>
    </div>
  );
}

function FamilyFields() {
  return (
    <>
      <Field label="Mother's Name" name="motherName" placeholder="Full name" />
      <Field
        label="Mother's Contact"
        name="motherContact"
        type="tel"
        placeholder="+63 9XX XXX XXXX"
      />
      <Field label="Spouse Name" name="spouseName" placeholder="Full name" />
      <Field
        label="Spouse Contact"
        name="spouseContact"
        type="tel"
        placeholder="+63 9XX XXX XXXX"
      />
      <Field label="Spouse Date of Birth" name="spouseDob" type="date" />
      <Field
        label="Number of Children"
        name="children"
        type="number"
        placeholder="0"
      />
      <Field
        label="Emergency Contact Name"
        name="emergencyName"
        placeholder="Full name"
      />
      <Field
        label="Emergency Contact Relationship"
        name="emergencyRelation"
        placeholder="e.g. Spouse, Mother"
      />
      <Field
        label="Emergency Contact Number"
        name="emergencyMobile"
        type="tel"
        placeholder="+63 9XX XXX XXXX"
      />
      <Field
        label="Emergency Contact Address"
        name="emergencyAddress"
        placeholder="Street, barangay, city, province"
      />
    </>
  );
}

function ContactDetailsFields() {
  return (
    <>
      <Field
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
      />
      <Field
        label="Primary Mobile"
        name="mobile"
        type="tel"
        placeholder="+63 9XX XXX XXXX"
      />
      <Field label="Viber" name="viber" placeholder="+63 9XX XXX XXXX" type="tel" />
      <Field label="WhatsApp" name="whatsapp" placeholder="+63 9XX XXX XXXX" type="tel" />
      <Field label="Signal" name="signal" placeholder="+63 9XX XXX XXXX" type="tel" />
      <Field label="Skype" name="skype" placeholder="live:yourhandle" />
      <Field label="Facebook" name="facebook" placeholder="facebook.com/your.handle" />
      <Field label="Instagram" name="instagram" placeholder="@yourhandle" />
      <Field label="LinkedIn" name="linkedin" placeholder="linkedin.com/in/yourname" />
      <Field label="Others" name="otherContact" placeholder="Telegram, X, etc." />
    </>
  );
}

function GovernmentIDsFields() {
  const ids = [
    { name: "SSS", placeholder: "34-1234567-8" },
    { name: "PhilHealth", placeholder: "01-234567890-1" },
    { name: "Pag-IBIG (HDMF)", placeholder: "1234-5678-9012" },
    { name: "TIN", placeholder: "123-456-789-000" },
    { name: "PhilSys (National ID)", placeholder: "0000-0000-0000-0000" },
    { name: "Others", placeholder: "ID number" },
  ];
  return (
    <div className="sm:col-span-2 space-y-3">
      {ids.map((id) => (
        <IdRow key={id.name} name={id.name} placeholder={id.placeholder} />
      ))}
    </div>
  );
}

function IdRow({ name, placeholder }: { name: string; placeholder: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-3">
      <div className="sm:w-44 shrink-0">
        <label
          htmlFor={`id-type-${name}`}
          className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1"
        >
          ID Type
        </label>
        <input
          id={`id-type-${name}`}
          type="text"
          placeholder={name}
          className="w-full rounded-lg bg-neutral-50 border border-[#15803d]/40 px-3 py-2 text-[13px] font-bold text-neutral-900 placeholder:font-normal placeholder:text-neutral-400 outline-none focus:bg-white focus:border-[#15803d] transition-colors"
        />
      </div>

      <div className="flex-1">
        <label
          htmlFor={`id-num-${name}`}
          className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1"
        >
          ID Number
        </label>
        <input
          id={`id-num-${name}`}
          type="text"
          placeholder={placeholder}
          className="w-full rounded-lg bg-neutral-50 border border-[#15803d]/40 px-3 py-2 text-[13px] font-semibold text-neutral-900 placeholder:font-normal placeholder:text-neutral-400 outline-none focus:bg-white focus:border-[#15803d] transition-colors"
        />
      </div>

      <label className="inline-flex items-center justify-center gap-1.5 cursor-pointer rounded-lg border border-[#15803d] bg-white px-3 py-2 text-[12px] font-semibold text-[#15803d] hover:bg-[#15803d]/5 transition-colors shrink-0 sm:mb-0.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Upload
        <input type="file" accept="image/*,application/pdf" className="hidden" />
      </label>
    </div>
  );
}

function SelectField({
  label,
  name,
  placeholder,
  options,
  span,
}: {
  label: string;
  name: string;
  placeholder: string;
  options: string[];
  span?: 2;
}) {
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <label
        htmlFor={name}
        className="block text-[12.5px] font-medium text-neutral-700 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          defaultValue=""
          className="w-full appearance-none rounded-xl bg-white border border-[#15803d]/40 px-4 py-3 pr-10 text-[13.5px] font-semibold text-neutral-900 outline-none focus:border-[#15803d] transition-colors invalid:text-neutral-400 invalid:font-normal"
          required
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
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
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  span,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  span?: 2;
}) {
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <label
        htmlFor={name}
        className="block text-[12.5px] font-medium text-neutral-700 mb-1.5"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl bg-white border border-[#15803d]/40 px-4 py-3 text-[13.5px] font-semibold text-neutral-900 placeholder:font-normal placeholder:text-neutral-400 outline-none focus:border-[#15803d] transition-colors"
      />
    </div>
  );
}
