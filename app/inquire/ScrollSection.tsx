"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

// Generic scroll-linked reveal wrapper. As the section enters the
// viewport (target.start crossing viewport.end → target.start reaching
// viewport.center), the contents fade up with opacity + translateY tied
// directly to scroll progress.
export default function ScrollSection({ children, className, style }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);

  return (
    <motion.section
      ref={ref}
      className={className}
      style={{ ...style, opacity, y }}
    >
      {children}
    </motion.section>
  );
}
