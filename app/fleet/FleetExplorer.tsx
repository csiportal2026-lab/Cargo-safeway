"use client";

import { useEffect, useState } from "react";

const TOTAL_VESSELS = 197;
const TOTAL_CLASSES = 16;

function CountUp({
  to,
  duration = 1600,
}: {
  to: number;
  duration?: number;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setN(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const progress = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setN(Math.round(to * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);

  return <span className="tabular-nums">{n}</span>;
}

export default function FleetExplorer() {
  return (
    <div className="relative py-16 sm:py-24">
      {/* Triptych: stat — title — stat */}
      <div className="grid grid-cols-3 items-center gap-2 sm:gap-8">
        <Stat value={TOTAL_VESSELS} label="Vessels" align="right" delay={2} />

        <h1 className="text-[64px] sm:text-[128px] font-extrabold tracking-[-0.05em] text-neutral-900 leading-[0.88] text-center fade-in-up fade-in-up-3">
          Fleet
        </h1>

        <Stat value={TOTAL_CLASSES} label="Ship Classes" align="left" delay={4} />
      </div>

      {/* Hairline rule + caption */}
      <div className="mt-12 sm:mt-16 mx-auto max-w-[640px] fade-in-up fade-in-up-5">
        <div className="h-px bg-neutral-200 w-full mb-6" />
        <p className="text-center text-[14px] sm:text-[15px] leading-relaxed text-neutral-600">
          Cargo Safeway exclusively deploys Filipino seafarers to Evergreen
          Marine&apos;s active fleet — covering Asia–Europe, Trans-Pacific, and
          Intra-Asia trade lanes.
        </p>
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  align,
  delay,
}: {
  value: number;
  label: string;
  align: "left" | "right";
  delay: 1 | 2 | 3 | 4 | 5;
}) {
  const alignCls =
    align === "right" ? "text-right items-end" : "text-left items-start";
  const delayCls = `fade-in-up-${delay}`;
  return (
    <div className={`flex flex-col ${alignCls} fade-in-up ${delayCls}`}>
      <div className="text-[44px] sm:text-[92px] font-extrabold tracking-[-0.05em] text-[#15803d] leading-none">
        <CountUp to={value} />
      </div>
      <div
        className={`mt-3 text-[9.5px] sm:text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-500`}
      >
        {label}
      </div>
    </div>
  );
}
