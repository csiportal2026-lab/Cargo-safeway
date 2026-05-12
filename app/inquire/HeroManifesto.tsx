"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";

// First five seafarers from the testimonial roster — mix of male and
// female so the avatar stack reflects the actual crew diversity.
const TRUST_FACES: { name: string; slug: string }[] = [
  { name: "Jessa C.", slug: "jessa-c" },
  { name: "Mark G.", slug: "mark-g" },
  { name: "Edwin T.", slug: "edwin-t" },
  { name: "Joseph P.", slug: "joseph-p" },
  { name: "Grace R.", slug: "grace-r" },
];
function fallbackAvatar(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const id = (Math.abs(hash) % 99) + 1;
  return `https://randomuser.me/api/portraits/men/${id}.jpg`;
}

function TrustFace({ face, index, count }: { face: { name: string; slug: string }; index: number; count: number }) {
  const [src, setSrc] = useState(`/people/${face.slug}.jpg`);
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      onError={() => {
        if (!src.startsWith("https://")) setSrc(fallbackAvatar(face.name));
      }}
      className="rounded-full bg-neutral-100 object-cover ring-2 ring-white"
      style={{
        width: "clamp(2rem, 1.5vw + 1.5rem, 2.75rem)",
        height: "clamp(2rem, 1.5vw + 1.5rem, 2.75rem)",
        marginLeft: index === 0 ? 0 : "-0.6rem",
        zIndex: count - index,
      }}
    />
  );
}

// Scroll-linked manifesto reveal — paragraphs and trust avatars rise
// from below as the user scrolls into them. The headline above is left
// alone (it has its own load-time animation).
export default function HeroManifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start center"],
  });

  // Each block has a slightly different range so they cascade.
  const p1Y = useTransform(scrollYProgress, [0.0, 0.5], [60, 0]);
  const p1Op = useTransform(scrollYProgress, [0.0, 0.5], [0, 1]);

  const p2Y = useTransform(scrollYProgress, [0.1, 0.6], [60, 0]);
  const p2Op = useTransform(scrollYProgress, [0.1, 0.6], [0, 1]);

  const p3Y = useTransform(scrollYProgress, [0.2, 0.7], [60, 0]);
  const p3Op = useTransform(scrollYProgress, [0.2, 0.7], [0, 1]);

  const p4Y = useTransform(scrollYProgress, [0.3, 0.8], [60, 0]);
  const p4Op = useTransform(scrollYProgress, [0.3, 0.8], [0, 1]);

  const trustY = useTransform(scrollYProgress, [0.45, 0.95], [40, 0]);
  const trustOp = useTransform(scrollYProgress, [0.45, 0.95], [0, 1]);

  return (
    <div ref={ref} className="flex flex-col items-center" style={{ gap: "clamp(1rem, 2vw, 1.75rem)", width: "100%" }}>
      <div
        className="flex flex-col text-left"
        style={{
          gap: "var(--space-3)",
          maxWidth: "min(58ch, 100%)",
        }}
      >
        <motion.p
          className="text-neutral-700"
          style={{
            fontSize: "clamp(0.875rem, 0.4vw + 0.75rem, 1rem)",
            lineHeight: 1.6,
            y: p1Y,
            opacity: p1Op,
          }}
        >
          At Cargo Safeway, we believe every Filipino seafarer who walks
          through our doors in Manila carries something the world cannot
          do without — skill, discipline, and the unmatched heart of the{" "}
          <span className="kw-emph" style={{ animationDelay: "2000ms" }}>
            Pinoy mariner
          </span>
          .
        </motion.p>
        <motion.p
          className="text-neutral-700"
          style={{
            fontSize: "clamp(0.875rem, 0.4vw + 0.75rem, 1rem)",
            lineHeight: 1.6,
            y: p2Y,
            opacity: p2Op,
          }}
        >
          For years, we have stood as the bridge between world-class
          shipping principals and the{" "}
          <span className="kw-emph" style={{ animationDelay: "4000ms" }}>
            world-class seafarers
          </span>{" "}
          who keep their vessels moving.
        </motion.p>
        <motion.p
          className="text-neutral-700"
          style={{
            fontSize: "clamp(0.875rem, 0.4vw + 0.75rem, 1rem)",
            lineHeight: 1.6,
            y: p3Y,
            opacity: p3Op,
          }}
        >
          We don&apos;t just deploy crew; we{" "}
          <span className="kw-emph" style={{ animationDelay: "6000ms" }}>
            champion careers
          </span>
          . From your application to your sign-on, from your first
          contract to your next{" "}
          <span className="kw-emph" style={{ animationDelay: "8000ms" }}>
            promotion
          </span>
          , Cargo Safeway is the partner that fights for{" "}
          <span className="kw-emph" style={{ animationDelay: "10000ms" }}>
            fair contracts
          </span>
          , principled principals, and the kind of opportunities that take
          Filipino seafarers further than ever before.
        </motion.p>
        <motion.p
          className="font-semibold text-neutral-900"
          style={{
            fontSize: "clamp(0.9375rem, 0.4vw + 0.8rem, 1.0625rem)",
            lineHeight: 1.5,
            y: p4Y,
            opacity: p4Op,
          }}
        >
          Because when you sail under our{" "}
          <span className="kw-emph" style={{ animationDelay: "12000ms" }}>
            flag of trust
          </span>
          , you don&apos;t just join a fleet — you join a{" "}
          <span className="kw-emph" style={{ animationDelay: "14000ms" }}>
            family
          </span>{" "}
          that believes Filipino seafarers belong on the best ships in the
          world.
        </motion.p>
      </div>

      <motion.div
        className="flex flex-col sm:flex-row items-center"
        style={{ gap: "clamp(0.75rem, 1.5vw, 1.25rem)", y: trustY, opacity: trustOp }}
      >
        <div className="flex items-center" aria-hidden>
          {TRUST_FACES.map((face, i) => (
            <TrustFace key={face.slug} face={face} index={i} count={TRUST_FACES.length} />
          ))}
        </div>
        <p
          className="text-neutral-600 text-center sm:text-left"
          style={{ fontSize: "var(--fs-xs)", lineHeight: 1.4 }}
        >
          Trusted by{" "}
          <span className="font-semibold text-neutral-900">
            5,000+ Filipino seafarers
          </span>
          .
        </p>
      </motion.div>
    </div>
  );
}
