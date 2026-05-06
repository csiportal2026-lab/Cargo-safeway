"use client";

import { useEffect, useState } from "react";

function CountUp({
  to,
  duration = 6500,
  tailAt,
}: {
  to: number;
  duration?: number;
  /** When set (0..1), the count reaches this fraction of `to` by half-time
   *  then crawls to 100% over the remaining half — gives a noticeable
   *  slow-down for the last leg of the count. */
  tailAt?: number;
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
      let eased: number;
      if (tailAt !== undefined) {
        if (progress < 0.5) {
          const p = progress / 0.5;
          eased = (1 - Math.pow(1 - p, 3)) * tailAt;
        } else {
          const p = (progress - 0.5) / 0.5;
          eased = tailAt + (1 - Math.pow(1 - p, 3)) * (1 - tailAt);
        }
      } else {
        eased = 1 - Math.pow(1 - progress, 3);
      }
      setN(Math.round(to * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, tailAt]);

  return <span className="tabular-nums">{n.toLocaleString()}</span>;
}

type Stat =
  | { kind: "number"; value: number; suffix?: string; label: string }
  | { kind: "text"; value: string; label: string };

const STATS: Stat[] = [
  { kind: "number", value: 238, label: "Vessels Powered" },
  { kind: "number", value: 5000, suffix: "+", label: "Seafarers Deployed" },
  { kind: "text", value: "Global", label: "Routes" },
];

export default function HomeStats() {
  return (
    <dl
      className="flex flex-wrap items-start justify-center fade-in-up fade-in-up-3"
      style={{
        marginTop: "var(--space-2)",
        columnGap: "clamp(2rem, 4vw, 4rem)",
        rowGap: "var(--space-4)",
      }}
    >
      {STATS.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center">
          <dt
            className="font-extrabold tracking-tight leading-none text-white"
            style={{ fontSize: "var(--fs-2xl)" }}
          >
            {stat.kind === "number" ? (
              <>
                <CountUp
                  to={stat.value}
                  tailAt={stat.value === 5000 ? 0.9 : undefined}
                />
                {stat.suffix}
              </>
            ) : (
              stat.value
            )}
          </dt>
          <dd
            className="font-semibold uppercase tracking-[0.14em] text-white/65"
            style={{
              fontSize: "var(--fs-2xs)",
              marginTop: "var(--space-1)",
            }}
          >
            {stat.label}
          </dd>
        </div>
      ))}
    </dl>
  );
}
