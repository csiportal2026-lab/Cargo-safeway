"use client";

/**
 * Vertical job-card grid — three portrait tiles side-by-side on desktop,
 * stacked single-column on mobile.
 *
 * Each card is just the photo + the rank title at the bottom. On hover, a
 * dark scrim fades in over the image and the Apply CTA appears centered.
 * No department chip, no vessel info, no summary — title only.
 *
 * Click Apply → the picked card flips on its Y axis (0 → 180°) with
 * backface-hidden so it visibly "turns away" at midpoint. Other cards fade
 * and shrink. After ~750ms we navigate to /inquire/apply?job=<slug>.
 */

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import type { Job } from "./jobsData";

const APPLY_TRANSITION_MS = 750;

export default function JobsExperience({ jobs }: { jobs: Job[] }) {
  const router = useRouter();
  const [applyingSlug, setApplyingSlug] = useState<string | null>(null);

  // Display order — Oiler is the headline role, so it sits in the middle of
  // the 3-card row. Other consumers of `jobs` (apply form lookup, etc.) get
  // the canonical order from jobsData.
  const ordered = (() => {
    const oiler = jobs.find((j) => j.slug === "oiler");
    const rest = jobs.filter((j) => j.slug !== "oiler");
    if (!oiler) return jobs;
    const [first, second] = rest;
    return [first, oiler, second].filter(Boolean) as Job[];
  })();

  function handleApply(slug: string) {
    if (applyingSlug) return; // already navigating
    setApplyingSlug(slug);
    window.setTimeout(() => {
      router.push(`/inquire/apply?job=${slug}`);
    }, APPLY_TRANSITION_MS);
  }

  return (
    <div
      className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8"
      style={{ perspective: "1800px" }}
    >
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-7 lg:gap-10">
        {ordered.map((job, i) => {
          const isApplyingThis = applyingSlug === job.slug;
          const isOtherApplying =
            applyingSlug !== null && applyingSlug !== job.slug;

          return (
            <motion.li
              key={job.slug}
              initial={{ opacity: 0, scale: 0.86, y: 28, rotateY: 0 }}
              animate={
                applyingSlug === null
                  ? { opacity: 1, scale: 1, y: 0, rotateY: 0 }
                  : isApplyingThis
                    ? {
                        opacity: 1,
                        scale: 1.04,
                        y: 0,
                        rotateY: 180,
                        zIndex: 50,
                      }
                    : {
                        opacity: 0.15,
                        scale: 0.9,
                        y: 8,
                        rotateY: 0,
                      }
              }
              transition={{
                duration: applyingSlug ? 0.75 : 0.85,
                delay: applyingSlug ? 0 : i * 0.22,
                ease: applyingSlug
                  ? [0.55, 0.06, 0.68, 0.19] // stronger ease-in-out for the flip
                  : [0.22, 1, 0.36, 1],
              }}
              className="list-none relative"
              style={{
                transformStyle: "preserve-3d",
                zIndex: isApplyingThis ? 50 : "auto",
              }}
            >
              <JobCard
                job={job}
                onApply={() => handleApply(job.slug)}
                disabled={isOtherApplying || isApplyingThis}
              />
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

function JobCard({
  job,
  onApply,
  disabled,
}: {
  job: Job;
  onApply: () => void;
  disabled: boolean;
}) {
  return (
    <article
      className="group relative aspect-[2/3] w-full overflow-hidden rounded-3xl bg-neutral-100 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_20px_44px_-16px_rgba(15,23,42,0.18)] transition-shadow duration-300"
      style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
    >
      {/* Image */}
      <Image
        src={job.image}
        alt={job.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
      />

      {/* Permanent bottom gradient — beefier so the title stays readable
          even when the photo's bottom half is bright (white uniform, sky
          background, etc.). Extends to two-thirds of the card. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
      />

      {/* Hover scrim — darkens the whole image when hovered/focused */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300"
      />

      {/* Title — always visible, anchored bottom-left. Uses the short
          billboard form (e.g. "AB", "OILER") so the longer `title` and
          `rank` stay intact for SEO + the apply form. */}
      <h3
        className="absolute left-6 right-6 bottom-6 z-10 font-bold tracking-tight text-white transition-transform duration-300 ease-out group-hover:-translate-y-2"
        style={{
          fontSize: "clamp(1.6rem, 2.4vw, 2.25rem)",
          lineHeight: 1.1,
          // Soft text shadow — invisible most of the time, but rescues
          // legibility when the photo content directly behind the title
          // happens to be bright.
          textShadow: "0 2px 12px rgba(0, 0, 0, 0.65), 0 1px 2px rgba(0, 0, 0, 0.5)",
        }}
      >
        {job.displayName}
      </h3>

      {/* Apply CTA — hidden until hover/focus, then fades + scales in.
          During the apply transition, clicks are disabled to prevent
          double-fire. */}
      <button
        type="button"
        onClick={onApply}
        disabled={disabled}
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-[#15803d] px-8 py-3.5 text-[14px] font-semibold text-white shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 transition-all duration-300 ease-out hover:bg-[#166534] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/60 disabled:opacity-100 disabled:cursor-default"
      >
        Apply
      </button>
    </article>
  );
}
