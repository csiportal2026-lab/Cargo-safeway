"use client";

import { useMemo, useState } from "react";
import SiteHeader from "../../components/SiteHeader";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
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

export default function AvailabilityPage() {
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

  // Limit navigation: current month → 6 months ahead
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

  const days = useMemo(() => buildCalendarDays(view), [view]);

  function prevMonth() {
    if (!canPrev) return;
    setView(new Date(view.getFullYear(), view.getMonth() - 1, 1));
  }
  function nextMonth() {
    if (!canNext) return;
    setView(new Date(view.getFullYear(), view.getMonth() + 1, 1));
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

  const monthLabel = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;

  return (
    <main className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6">
      <div className="relative card-canvas w-full max-w-[1200px] lg:w-[1123px] lg:h-[632px] lg:shrink-0 bg-white rounded-3xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors">
        <SiteHeader />

        <section className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-12 pt-6 pb-10">
          <div className="max-w-[820px] mx-auto rounded-2xl bg-white ring-1 ring-[#15803d]/40 px-5 pt-3 pb-5">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={prevMonth}
                disabled={!canPrev}
                aria-label="Previous month"
                className="grid h-10 w-10 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-[#15803d] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="text-[20px] font-extrabold tracking-tight text-neutral-900">
                {monthLabel}
              </div>
              <button
                type="button"
                onClick={nextMonth}
                disabled={!canNext}
                aria-label="Next month"
                className="grid h-10 w-10 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-[#15803d] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {DAY_LABELS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[11.5px] font-semibold uppercase tracking-wider text-neutral-500 py-2"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((d, i) => {
                const isCurrentMonth = d.getMonth() === view.getMonth();
                const isToday = sameDay(d, today);
                const isPast = d < today;
                const isStart = start !== null && sameDay(d, start);
                const isEnd = end !== null && sameDay(d, end);
                const isInRange =
                  start !== null && end !== null && d > start && d < end;

                let style = "";
                if (isStart || isEnd) {
                  style = "bg-[#15803d] text-white shadow-md font-bold";
                } else if (isInRange) {
                  style = "bg-[#15803d]/15 text-[#15803d] font-semibold";
                } else if (isPast) {
                  style = "text-neutral-300 cursor-not-allowed";
                } else if (!isCurrentMonth) {
                  style = "text-neutral-300";
                } else {
                  style = "text-neutral-900 hover:bg-[#15803d]/10 hover:text-[#15803d]";
                }

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectDay(d)}
                    disabled={isPast}
                    className={`h-12 sm:h-14 grid place-items-center rounded-lg text-[20px] sm:text-[22px] font-normal transition-colors ${style} ${
                      isToday && !isStart && !isEnd
                        ? "ring-2 ring-[#15803d] ring-offset-1"
                        : ""
                    }`}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-col items-center gap-2">
              {declared ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setDeclared(null);
                      setStart(null);
                      setEnd(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#15803d] bg-white px-6 py-2.5 text-[13px] font-semibold text-[#15803d] hover:bg-[#15803d]/5 transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Edit Declaration
                  </button>
                  <div className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#15803d]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="m5 12 5 5L20 7"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Declared · {formatRange(declared.start, declared.end)}
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  disabled={!start || !end}
                  onClick={() => {
                    if (start && end) setDeclared({ start, end });
                  }}
                  className="rounded-full bg-[#15803d] px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-[#126a33] transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                >
                  Declare Availability
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatRange(a: Date, b: Date): string {
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

function buildCalendarDays(view: Date): Date[] {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const start = new Date(first);
  start.setDate(start.getDate() - first.getDay());
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
