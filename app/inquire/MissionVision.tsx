"use client";

import { Anchor, Compass } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { useRef } from "react";

const HEADLINE_WORDS = [
  "Built",
  "by",
  "Filipinos,",
  "for",
  "Filipinos",
  "at",
  "sea.",
];

// Headline runs in the first ~half of the section's scroll range.
// 7 words cascading at 0.04 progress apart.
function wordRange(i: number): [number, number] {
  const start = 0.05 + i * 0.035;
  return [start, start + 0.2];
}

function HeadlineWord({
  word,
  index,
  scrollYProgress,
}: {
  word: string;
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const range = wordRange(index);
  const y = useTransform(scrollYProgress, range, ["100%", "0%"]);
  const opacity = useTransform(scrollYProgress, range, [0, 1]);
  return (
    <span
      className="inline-block overflow-hidden align-bottom"
      style={{ paddingBottom: "0.05em" }}
    >
      <motion.span className="inline-block" style={{ y, opacity }}>
        {word}
      </motion.span>
    </span>
  );
}

function IconBubble({
  Icon,
  range,
  scrollYProgress,
}: {
  Icon: LucideIcon;
  range: [number, number];
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const popMid = range[1] - 0.04;
  const scale = useTransform(scrollYProgress, [range[0], popMid, range[1]], [0.6, 1.18, 1]);
  const opacity = useTransform(scrollYProgress, range, [0, 1]);
  return (
    <motion.span
      className="grid place-items-center rounded-full bg-[#15803d]/10 text-[#15803d]"
      style={{ width: "3rem", height: "3rem", scale, opacity }}
    >
      <Icon size={24} aria-hidden />
    </motion.span>
  );
}

export default function MissionVision() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end center"],
  });

  // Card drift: Mission from left, Vision from right.
  // Stagger so Mission slightly leads Vision.
  const missionX = useTransform(scrollYProgress, [0.4, 0.7], [-80, 0]);
  const missionOpacity = useTransform(scrollYProgress, [0.4, 0.75], [0, 1]);

  const visionX = useTransform(scrollYProgress, [0.5, 0.8], [80, 0]);
  const visionOpacity = useTransform(scrollYProgress, [0.5, 0.85], [0, 1]);

  // Icon ranges aligned to land just as their card finishes drifting.
  const missionIconRange: [number, number] = [0.6, 0.78];
  const visionIconRange: [number, number] = [0.7, 0.88];

  return (
    <section
      ref={ref}
      className="relative z-10 bg-neutral-50/60 border-y border-neutral-200/70 flex flex-col justify-center"
      style={{
        paddingInline: "clamp(1.25rem, 4vw, 4rem)",
        paddingTop: "clamp(4rem, 8vw, 7rem)",
        paddingBottom: "clamp(4rem, 8vw, 7rem)",
        minHeight: "100dvh",
      }}
    >
      <div
        className="max-w-[68rem] mx-auto flex flex-col items-center text-center"
        style={{ gap: "var(--space-3)" }}
      >
        <h2
          className="font-extrabold tracking-tight text-neutral-900"
          style={{
            fontSize: "clamp(2.25rem, 3.5vw + 1rem, 4.25rem)",
            lineHeight: 1.05,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: "0.25em",
            rowGap: "0.05em",
          }}
        >
          {HEADLINE_WORDS.map((word, i) => (
            <HeadlineWord
              key={i}
              word={word}
              index={i}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </h2>
      </div>

      <div
        className="max-w-[72rem] mx-auto grid grid-cols-1 md:grid-cols-2 w-full"
        style={{
          gap: "clamp(2rem, 4vw, 4rem)",
          marginTop: "clamp(3rem, 6vw, 5rem)",
        }}
      >
        {/* Mission — drifts in from the left */}
        <motion.div
          className="flex flex-col"
          style={{ gap: "var(--space-3)", x: missionX, opacity: missionOpacity }}
        >
          <div className="flex items-center gap-3">
            <IconBubble Icon={Anchor} range={missionIconRange} scrollYProgress={scrollYProgress} />
            <h3
              className="font-bold tracking-tight text-neutral-900"
              style={{ fontSize: "clamp(1.375rem, 1vw + 1rem, 1.875rem)" }}
            >
              Our mission
            </h3>
          </div>
          <p
            className="text-neutral-700"
            style={{
              fontSize: "clamp(1rem, 0.7vw + 0.85rem, 1.25rem)",
              lineHeight: 1.7,
            }}
          >
            To connect Filipino seafarers with principled principals — fighting
            for fair contracts, faster sign-ons, and careers that last beyond a
            single voyage. Every Pinoy mariner deserves a crewing partner that
            treats him as a professional first, and a contract second.
          </p>
        </motion.div>

        {/* Vision — drifts in from the right */}
        <motion.div
          className="flex flex-col"
          style={{ gap: "var(--space-3)", x: visionX, opacity: visionOpacity }}
        >
          <div className="flex items-center gap-3">
            <IconBubble Icon={Compass} range={visionIconRange} scrollYProgress={scrollYProgress} />
            <h3
              className="font-bold tracking-tight text-neutral-900"
              style={{ fontSize: "clamp(1.375rem, 1vw + 1rem, 1.875rem)" }}
            >
              Our vision
            </h3>
          </div>
          <p
            className="text-neutral-700"
            style={{
              fontSize: "clamp(1rem, 0.7vw + 0.85rem, 1.25rem)",
              lineHeight: 1.7,
            }}
          >
            A Philippines where every Pinoy mariner sails on the world&apos;s
            best ships — recognized for the skill, discipline, and heart they
            bring aboard, and rewarded with the kind of opportunities that
            change families for generations.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
