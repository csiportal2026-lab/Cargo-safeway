"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export default function SiteHeader() {
  const pathname = usePathname();
  const onInquire = pathname?.startsWith("/inquire") ?? false;
  const onApply = pathname?.startsWith("/inquire/apply") ?? false;
  const onHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  // Two color legends: violet (AI-filled fields), red (required/missing).
  // Mutually exclusive so popovers don't stack.
  const [openLegend, setOpenLegend] = useState<null | "violet" | "red">(null);
  const violetLegendRef = useRef<HTMLDivElement>(null);
  const redLegendRef = useRef<HTMLDivElement>(null);

  // ApplyForm broadcasts via a CustomEvent whenever it transitions between
  // the AI Quick-Fill gate and the actual form. The legend dots only show
  // once the form is visible.
  const [formStarted, setFormStarted] = useState(false);
  useEffect(() => {
    if (!onApply) {
      setFormStarted(false);
      return;
    }
    function onState(e: Event) {
      const detail = (e as CustomEvent<{ started: boolean }>).detail;
      setFormStarted(!!detail?.started);
    }
    window.addEventListener("cs-apply-form-state", onState);
    return () => window.removeEventListener("cs-apply-form-state", onState);
  }, [onApply]);

  // Close whichever legend is open when clicking outside or pressing Escape.
  useEffect(() => {
    if (!openLegend) return;
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      const insideViolet =
        !!violetLegendRef.current && violetLegendRef.current.contains(t);
      const insideRed =
        !!redLegendRef.current && redLegendRef.current.contains(t);
      if (!insideViolet && !insideRed) setOpenLegend(null);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenLegend(null);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [openLegend]);

  // Pill gains an opaque background + shadow as soon as the user starts
  // scrolling. Tiny tolerance (>4px) avoids jitter from sub-pixel scroll
  // events at the very top. On pages with a locked viewport (home), no
  // scroll happens, so this stays false.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-3 sm:top-5 md:top-6 z-30 flex justify-center px-4 sm:px-6 lg:px-8">
      <div
        className={`flex w-full items-center justify-between gap-3 rounded-2xl transition-[max-width,padding,background-color,border-color,box-shadow] duration-300 ease-out ${
          onHome && !scrolled
            ? // Home, at top: fully transparent — let the hero breathe.
              "bg-transparent border border-transparent"
            : // Everywhere else: white glass pill with green border + shadow.
              "bg-white/65 backdrop-blur-xl backdrop-saturate-150 border border-[#15803d]/50 ring-1 ring-[#15803d]/20 shadow-[0_8px_32px_-12px_rgba(21,128,61,0.25),0_2px_8px_-4px_rgba(15,23,42,0.08)]"
        } ${
          scrolled ? "max-w-[920px] px-4" : "max-w-[1080px] px-4 sm:px-5"
        }`}
        style={{ height: "3.5rem" }}
      >
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group/logo">
          <motion.span
            className="relative inline-flex"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="block"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{
                duration: 4.5,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            >
              <Image
                src="/logo-cs.png"
                alt="Cargo Safeway logo"
                width={64}
                height={64}
                priority
                className="object-contain transition-transform duration-300 group-hover/logo:rotate-[-6deg]"
                style={{ width: "2rem", height: "2rem" }}
              />
            </motion.span>
          </motion.span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span
              className={`font-bold tracking-tight ${
                onHome
                  ? "text-neutral-900 lg:text-transparent lg:bg-clip-text lg:bg-gradient-to-b lg:from-white lg:to-emerald-400"
                  : "text-neutral-900"
              }`}
              style={{ fontSize: "var(--fs-base)" }}
            >
              Cargo Safeway
            </span>
          </span>
        </Link>

        <nav
          className="hidden md:flex lg:absolute lg:left-1/2 lg:-translate-x-1/2 items-center font-medium text-neutral-700"
          style={{ gap: "clamp(1.25rem, 2vw, 2.25rem)", fontSize: "var(--fs-sm)" }}
        >
          <Link
            href="/leadership"
            aria-current={pathname === "/leadership" ? "page" : undefined}
            className={`${onHome && !scrolled ? "hero-on-dark" : ""} sweep-text relative inline-block origin-center rounded-full px-3 py-1 transition-all duration-300 ease-out hover:bg-[#15803d]/8 after:absolute after:left-3 after:right-3 after:-bottom-0 after:h-[2px] after:bg-[#22c55e] after:transition-all after:duration-200 ${
              pathname === "/leadership"
                ? "bg-[#15803d]/10 after:scale-x-100"
                : "after:scale-x-0 hover:after:scale-x-100"
            }`}
          >
            Leadership
          </Link>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0 font-medium text-neutral-700" style={{ fontSize: "var(--fs-sm)" }}>
          <Link
            href="/contact"
            aria-current={pathname === "/contact" ? "page" : undefined}
            className={`${onHome && !scrolled ? "hero-on-dark" : ""} sweep-text relative hidden md:inline-block origin-center rounded-full px-3 py-1 transition-all duration-300 ease-out hover:bg-[#15803d]/8 after:absolute after:left-3 after:right-3 after:-bottom-0 after:h-[2px] after:bg-[#22c55e] after:transition-all after:duration-200 ${
              pathname === "/contact"
                ? "bg-[#15803d]/10 after:scale-x-100"
                : "after:scale-x-0 hover:after:scale-x-100"
            }`}
          >
            Find Us
          </Link>

          {onApply && formStarted && (
            <div className="hidden md:flex items-center gap-1.5">
              {/* Violet legend — AI-filled fields */}
              <div ref={violetLegendRef} className="relative inline-block">
                <button
                  type="button"
                  onClick={() =>
                    setOpenLegend((cur) => (cur === "violet" ? null : "violet"))
                  }
                  aria-label="What does the violet color mean?"
                  aria-expanded={openLegend === "violet"}
                  className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-violet-500 bg-transparent hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 transition-transform"
                />
                <AnimatePresence>
                  {openLegend === "violet" && (
                    <motion.div
                      role="dialog"
                      aria-label="Violet color legend"
                      initial={{ opacity: 0, y: -4, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-full mt-2 z-40 w-[240px] rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_12px_36px_-8px_rgba(15,23,42,0.18),0_2px_8px_-4px_rgba(15,23,42,0.08)]"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 border-violet-500 bg-transparent" />
                        <div>
                          <p className="text-[12.5px] font-semibold text-neutral-900">
                            Violet fields
                          </p>
                          <p className="mt-1 text-[12px] leading-relaxed text-neutral-600">
                            Pre-filled by AI from your uploaded documents.
                            Please verify before submitting.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Red legend — missing / error fields */}
              <div ref={redLegendRef} className="relative inline-block">
                <button
                  type="button"
                  onClick={() =>
                    setOpenLegend((cur) => (cur === "red" ? null : "red"))
                  }
                  aria-label="What does the red color mean?"
                  aria-expanded={openLegend === "red"}
                  className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-red-500 bg-transparent hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 transition-transform"
                />
                <AnimatePresence>
                  {openLegend === "red" && (
                    <motion.div
                      role="dialog"
                      aria-label="Red color legend"
                      initial={{ opacity: 0, y: -4, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-full mt-2 z-40 w-[240px] rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_12px_36px_-8px_rgba(15,23,42,0.18),0_2px_8px_-4px_rgba(15,23,42,0.08)]"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 border-red-500 bg-transparent" />
                        <div>
                          <p className="text-[12.5px] font-semibold text-neutral-900">
                            Red fields
                          </p>
                          <p className="mt-1 text-[12px] leading-relaxed text-neutral-600">
                            Required information is missing or invalid. Please
                            fill these in before submitting.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
          {!onHome && !onInquire && (
            <Link
              href="/inquire"
              className="rounded-full bg-[#15803d] px-3 sm:px-4 py-1 sm:py-1.5 text-[12px] sm:text-[13px] font-medium text-white shadow-sm hover:bg-[#126a33] transition-colors"
            >
              Inquire Now
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
