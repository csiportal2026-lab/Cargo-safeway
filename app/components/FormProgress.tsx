"use client";

import { AnimatePresence, motion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

/**
 * Vertical form-progress strip pinned to the left edge of the viewport.
 * Driven by a discrete step value (not scroll). Renders:
 *   - a faint background track,
 *   - a green gradient fill that grows top-to-bottom,
 *   - a glowing dot at the leading edge with a slow pulse halo,
 *   - a floating chip next to the dot showing the current section name
 *     (always visible; cross-fades when the section changes).
 */
export default function FormProgress({
  value,
  total,
  label,
}: {
  value: number;
  total: number;
  label?: string;
}) {
  // Position the dot at the MIDDLE of each section's band so the dot
  // (and the chip beside it) never sits flush with the top or bottom of
  // the viewport. e.g. for 7 sections: section 1 ≈ 7%, section 7 ≈ 93%.
  const target = Math.max(0.04, Math.min(0.96, (value - 0.5) / total));

  // Spring-smoothed fill value (0 → 1). Keeps the leading dot from snapping
  // when the user advances a step.
  const fill = useSpring(0, { stiffness: 110, damping: 28, mass: 0.4 });
  useEffect(() => {
    fill.set(target);
  }, [target, fill]);

  // Convert the 0–1 spring into a CSS percentage string for height + top.
  const fillPct = useTransform(fill, (v) => `${v * 100}%`);

  const sectionText = label ?? "";

  return (
    <div
      aria-hidden
      className="fixed top-0 bottom-0 left-0 z-50 pointer-events-none"
      style={{ width: 8 }}
    >
      {/* Standard full-height green bar — same on every section. The dot
          alone communicates current position. */}
      <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-gradient-to-b from-[#15803d] via-[#22c55e] to-[#15803d]" />

      {/* Leading-edge marker (dot + halo + chip) */}
      <motion.div
        className="absolute left-[1.5px]"
        style={{ top: fillPct, transform: "translate(-50%, -50%)" }}
      >
        <div className="relative">
          {/* Soft pulsing halo */}
          <motion.span
            className="absolute inset-0 rounded-full bg-[#22c55e]"
            initial={{ scale: 1, opacity: 0.55 }}
            animate={{ scale: [1, 2.2, 2.2], opacity: [0.55, 0, 0] }}
            transition={{
              duration: 2,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 0.2,
            }}
            style={{ width: 12, height: 12 }}
          />
          {/* Solid dot with persistent glow */}
          <span
            className="block rounded-full bg-[#15803d] ring-2 ring-white/80 shadow-[0_0_14px_rgba(34,197,94,0.85),0_0_30px_rgba(34,197,94,0.45)]"
            style={{ width: 12, height: 12 }}
          />

          {/* Floating chip with current section name — always visible,
              cross-fades when the section changes. */}
          {sectionText && (
            <span className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center rounded-full bg-[#15803d] px-3 py-1.5 text-[11px] font-bold uppercase text-white shadow-[0_4px_14px_rgba(15,23,42,0.18)] whitespace-nowrap overflow-hidden">
              {/* Tip arrow pointing back at the dot */}
              <span
                aria-hidden
                className="absolute -left-[5px] top-1/2 -translate-y-1/2 h-2.5 w-2.5 rotate-45 bg-[#15803d]"
              />
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={sectionText}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                  style={{ letterSpacing: "0.08em" }}
                >
                  {sectionText}
                </motion.span>
              </AnimatePresence>
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
