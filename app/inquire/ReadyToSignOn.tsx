"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import JobsExperience from "./jobs/JobsExperience";
import { jobs } from "./jobs/jobsData";

const DRIFT_DURATION_S = 18;

function MarqueeRow({ text }: { text: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="flex w-max flex-shrink-0"
      animate={reduce ? undefined : { x: ["-12%", "12%"] }}
      transition={{
        duration: DRIFT_DURATION_S,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      <span
        className="text-neutral-900 leading-[0.85] tracking-[-0.025em] whitespace-nowrap"
        style={{
          fontFamily: "var(--font-headline)",
          fontWeight: 700,
          fontSize: "clamp(4rem, 13vw, 13rem)",
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}

// Cascading word ranges — wider spans so each word (especially "Ready")
// rises gradually instead of snapping in. The first word leads the whole
// reveal so the user has time to read it before the rest catch up.
const WORD_RANGES: Record<string, [number, number]> = {
  Ready: [0.0, 0.45],
  to: [0.12, 0.5],
  sign: [0.22, 0.58],
  "on?": [0.3, 0.65],
};

function HeadlineWord({
  word,
  range,
  scrollYProgress,
  green = false,
}: {
  word: string;
  range: [number, number];
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  green?: boolean;
}) {
  const y = useTransform(scrollYProgress, range, ["100%", "0%"]);
  const opacity = useTransform(scrollYProgress, range, [0, 1]);
  return (
    <span className="inline-block overflow-hidden align-bottom" style={{ paddingBottom: "0.05em" }}>
      <motion.span
        className={`inline-block ${green ? "text-[#15803d]" : ""}`}
        style={{ y, opacity }}
      >
        {word}
      </motion.span>
    </span>
  );
}

export default function ReadyToSignOn() {
  const ref = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Section-level scroll progress — drives the headline, underline,
  // description, and the spotlight glow.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  // CTA gets its OWN scroll trigger so it only pops in when the user
  // CTA reveal is gated to true bottom-arrival: progress 0 when the
  // section's center hits the viewport bottom; progress 1 when the
  // section's BOTTOM hits the viewport bottom (= user at page bottom).
  const { scrollYProgress: bottomProgress } = useScroll({
    target: ref,
    offset: ["center end", "end end"],
  });

  // Curve underline under "sign on?" — draws after the action words
  // have landed. Uses pathLength for scroll-linked SVG drawing.
  const curveProgress = useTransform(scrollYProgress, [0.55, 0.85], [0, 1]);

  // CTA pops in only in the last stretch — when the user really arrives.
  const ctaScale = useTransform(bottomProgress, [0.6, 0.9, 1], [0.85, 1.05, 1]);
  const ctaOpacity = useTransform(bottomProgress, [0.6, 1], [0, 1]);

  // Background ambient — emerald spotlight that brightens as you scroll.
  const spotlightOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative z-10 bg-neutral-50/60 border-t border-neutral-200/70 flex items-center justify-center overflow-hidden"
      style={{
        paddingInline: "clamp(1.25rem, 4vw, 4rem)",
        paddingTop: "clamp(3rem, 6vw, 5rem)",
        paddingBottom: "clamp(3rem, 6vw, 5rem)",
        minHeight: "100dvh",
      }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full blur-3xl"
        style={{
          opacity: spotlightOpacity,
          background:
            "radial-gradient(closest-side, rgba(21, 128, 61, 0.18), rgba(21, 128, 61, 0))",
          width: "min(70vw, 900px)",
          height: "min(70vw, 900px)",
          top: "10%",
        }}
      />

      {/* Floating decorative orbs — mirror the AI Quick-Fill gate so the
          two screens feel like part of the same visual world. */}
      <motion.span
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -18, 0], x: [0, 8, 0] }}
        transition={{
          opacity: { duration: 1 },
          y: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 14, repeat: Infinity, ease: "easeInOut" },
        }}
        className="pointer-events-none absolute top-[15%] left-[18%] h-72 w-72 rounded-full bg-emerald-300/30 blur-[120px]"
      />
      <motion.span
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 14, 0], x: [0, -10, 0] }}
        transition={{
          opacity: { duration: 1, delay: 0.2 },
          y: { duration: 12, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 16, repeat: Infinity, ease: "easeInOut" },
        }}
        className="pointer-events-none absolute top-[22%] right-[16%] h-80 w-80 rounded-full bg-[#15803d]/22 blur-[130px]"
      />
      <motion.span
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -12, 0], x: [0, 12, 0] }}
        transition={{
          opacity: { duration: 1, delay: 0.4 },
          y: { duration: 13, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 17, repeat: Infinity, ease: "easeInOut" },
        }}
        className="pointer-events-none absolute bottom-[18%] left-[20%] h-64 w-64 rounded-full bg-amber-200/28 blur-[120px]"
      />
      <motion.span
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0], x: [0, -8, 0] }}
        transition={{
          opacity: { duration: 1, delay: 0.5 },
          y: { duration: 14, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 18, repeat: Infinity, ease: "easeInOut" },
        }}
        className="pointer-events-none absolute bottom-[14%] right-[20%] h-72 w-72 rounded-full bg-emerald-400/22 blur-[130px]"
      />

      {/* Green gradient bg — appears when the bento is revealed */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: isRevealed ? 1 : 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 55% at 100% 0%, rgba(21,128,61,0.22), transparent 60%),
            radial-gradient(ellipse 80% 60% at 0% 100%, rgba(34,197,94,0.20), transparent 60%),
            radial-gradient(ellipse 85% 55% at 100% 100%, rgba(21,128,61,0.18), transparent 60%),
            radial-gradient(ellipse 110% 45% at 50% 100%, rgba(16,185,129,0.16), transparent 65%),
            radial-gradient(ellipse 65% 50% at 50% 50%, rgba(16,185,129,0.08), transparent 65%),
            linear-gradient(180deg, #f0faf3 0%, #f5fbf7 50%, #ecf7ef 100%)
          `,
        }}
      />

      {/* Background watermark — endless marquee scrolling left */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: isRevealed ? 0.07 : 0 }}
        transition={{
          duration: 1.4,
          delay: isRevealed ? 0.4 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="pointer-events-none absolute inset-0 z-0 flex items-start select-none overflow-hidden"
        style={{ paddingTop: "clamp(1.5rem, 5vw, 4rem)" }}
      >
        <MarqueeRow text="NOW BOARDING" />
      </motion.div>

      <AnimatePresence mode="wait">
      {!isRevealed ? (
      <motion.div
        key="cta"
        exit={{ opacity: 0, y: -16, scale: 0.98 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-[44rem] mx-auto flex flex-col items-center text-center"
        style={{ gap: "var(--space-4)" }}
      >
        {/* Headline — "Ready to" stay neutral, "sign on?" turn emerald
            and gain a curve underline that draws across after they land. */}
        <h2
          className="font-extrabold tracking-tight text-neutral-900"
          style={{
            fontSize: "clamp(2rem, 3vw + 1rem, 3.75rem)",
            lineHeight: 1.05,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.25em",
          }}
        >
          <HeadlineWord word="Ready" range={WORD_RANGES.Ready!} scrollYProgress={scrollYProgress} />
          <HeadlineWord word="to" range={WORD_RANGES.to!} scrollYProgress={scrollYProgress} />
          {/* "sign on?" wrapper — relative so the curve underline can
              span across both action words together. */}
          <span
            className="relative inline-flex items-baseline"
            style={{ gap: "0.25em" }}
          >
            <HeadlineWord
              word="sign"
              range={WORD_RANGES.sign!}
              scrollYProgress={scrollYProgress}
              green
            />
            <HeadlineWord
              word="on?"
              range={WORD_RANGES["on?"]!}
              scrollYProgress={scrollYProgress}
              green
            />
            <svg
              aria-hidden
              viewBox="0 0 220 60"
              className="absolute left-0 right-0 w-[92%] mx-auto text-[#15803d] overflow-visible"
              style={{ height: "0.5em", bottom: "-0.18em" }}
              preserveAspectRatio="none"
            >
              <motion.path
                d="M10 46 Q 110 22 210 46"
                stroke="currentColor"
                strokeWidth="11"
                strokeLinecap="round"
                fill="none"
                style={{ pathLength: curveProgress } as CSSProperties}
              />
            </svg>
          </span>
        </h2>

        <motion.div
          ref={ctaRef}
          style={{ scale: ctaScale, opacity: ctaOpacity }}
          className="flex flex-col items-center"
        >
          <button
            type="button"
            onClick={() => setIsRevealed(true)}
            className="apply-rotating-yellow inline-flex items-center gap-2 rounded-full bg-transparent font-semibold text-neutral-900 hover:scale-[1.06] active:scale-[0.97] transition-transform duration-300 outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            style={{
              paddingInline: "clamp(1.75rem, 1.75vw + 0.75rem, 2.5rem)",
              paddingBlock: "clamp(0.875rem, 0.4vw + 0.6rem, 1.125rem)",
              fontSize: "var(--fs-base)",
            }}
          >
            Apply Now
          </button>
        </motion.div>
      </motion.div>
      ) : (
        <motion.div
          key="bento"
          initial={{ opacity: 0, y: 30, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative w-full max-w-[1320px] mx-auto"
        >
          <JobsExperience jobs={jobs} />
        </motion.div>
      )}
      </AnimatePresence>
    </section>
  );
}
