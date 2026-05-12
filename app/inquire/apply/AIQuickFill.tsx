"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { Job } from "../jobs/jobsData";
import {
  STORAGE_KEY,
  type ApplicationValues,
} from "./applicationSchema";
import { useAIFilled } from "./ApplyForm";

type Doc = { file: File; previewUrl?: string };

/* Rotating headlines + sub-lines shown during the processing stage. The
 * effect inside the component advances `processingStep` every ~2.5s so the
 * spinner doesn't read as a single frozen state. Returns to step 0 whenever
 * the stage leaves "processing". */
const PROCESSING_STEPS: { title: string; sub: string }[] = [
  { title: "Reading your documents…", sub: "Scanning the pages." },
  {
    title: "Identifying fields…",
    sub: "Picking out names, dates, and document numbers.",
  },
  {
    title: "Cross-referencing details…",
    sub: "Matching information across your uploads.",
  },
  {
    title: "Almost there…",
    sub: "Finalizing your pre-filled application.",
  },
];

function isImageFile(file: File): boolean {
  return (
    file.type.startsWith("image/") || /\.(jpe?g|png|heic|webp)$/i.test(file.name)
  );
}

/**
 * AI Quick-Fill GATE — full-page landing shown the moment the user lands
 * on /inquire/apply, before the form is rendered.
 *
 * Smart upload click → OS file picker. Selected files appear inline
 * directly below the pill. Once the user is happy, the same pill (whose
 * label has flipped to "Process N file(s)") starts the processing stub
 * → demo → onContinue (reveals the form).
 *
 * Front-end only for now. Real LLM extraction lands once the API +
 * privacy story is settled.
 */
export default function AIQuickFill({
  job: _job,
  onContinue,
}: {
  job: Job | null;
  onContinue: (opts?: { prefilled?: boolean }) => void;
}) {
  void _job;
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<"idle" | "processing" | "error">("idle");
  // Rotating message index during the processing stage. Cycles through
  // 4 sub-stages every ~2.5s so the user doesn't think the page froze.
  const [processingStep, setProcessingStep] = useState(0);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [filledCount, setFilledCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // The gate lives INSIDE the form's FormProvider (in ApplyForm), so we can
  // grab the same RHF methods to push extracted values directly. Bypasses
  // the form's restore-once guard which only reads localStorage on mount.
  const { reset, getValues } = useFormContext<ApplicationValues>();
  const { mark: markAiFilled } = useAIFilled();

  // Layout is derived: compact (centered) when no files; expands to a
  // 2-column split (content+buttons on the left, file list on the right)
  // as soon as at least one file is added. Cancelling the picker keeps us
  // compact; clicking Back clears docs and snaps back to compact.
  const expanded = docs.length > 0;

  // Revoke any outstanding object URLs on unmount so we don't leak memory.
  useEffect(() => {
    return () => {
      docs.forEach((d) => {
        if (d.previewUrl) URL.revokeObjectURL(d.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cycle through processing sub-messages every 2.5s while the extraction
  // is running. Resets to step 0 whenever the user is not in "processing"
  // so a re-run starts the rotation fresh.
  useEffect(() => {
    if (stage !== "processing") {
      setProcessingStep(0);
      return;
    }
    const id = window.setInterval(() => {
      setProcessingStep((s) => (s + 1) % PROCESSING_STEPS.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, [stage]);

  function pickDocuments() {
    inputRef.current?.click();
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list) return;
    const accepted = Array.from(list)
      .filter(
        (f) =>
          f.type.startsWith("image/") ||
          f.type === "application/pdf" ||
          /\.(pdf|jpe?g|png|heic|webp)$/i.test(f.name),
      )
      .map<Doc>((file) => ({
        file,
        previewUrl: isImageFile(file)
          ? URL.createObjectURL(file)
          : undefined,
      }));
    e.target.value = "";
    if (accepted.length === 0) return;
    setDocs((prev) => [...prev, ...accepted].slice(0, 8));
  }

  function removeDoc(idx: number) {
    setDocs((prev) => {
      const removed = prev[idx];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function startProcessing() {
    if (docs.length === 0) return;
    setStage("processing");
    setErrorMessage(null);
    try {
      const fd = new FormData();
      docs.forEach((d) => {
        fd.append("files", d.file);
        // Server still expects a parallel types[] array. We don't ask users
        // to pick anymore — let the model figure it out from the doc itself.
        fd.append("types", "other");
      });
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      const json = (await res.json()) as
        | { ok: true; filledCount: number; values: Record<string, unknown> }
        | { error: string };
      if (!res.ok || "error" in json) {
        const msg = "error" in json ? json.error : `Extraction failed (${res.status})`;
        throw new Error(msg);
      }
      // Debug: surface what came back so we can see if extraction worked.
      // eslint-disable-next-line no-console
      console.log("[AIQuickFill] extracted from Gemini:", json);

      // Push extracted values directly into the form via the shared RHF
      // methods (the gate is inside FormProvider). Merge with current values
      // so anything the user already typed survives.
      const merged = {
        ...getValues(),
        ...(json.values as Partial<ApplicationValues>),
      };
      // Reset WITHOUT keepDefaultValues — that flag would mark every AI-filled
      // field dirty (since merged ≠ original empty default), which then
      // suppresses the violet treatment in FloatField/SelectField. Clearing
      // dirty here lets the violet show, then dirty flips back to `true` the
      // moment the user edits a field → violet auto-removes.
      reset(merged);
      markAiFilled(Object.keys(json.values));

      // Also persist to localStorage so the next session reload still has
      // the pre-fill if the user navigates away.
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // localStorage failure is non-fatal
      }

      setFilledCount(json.filledCount);
      // Skip the "Your application is pre-filled" interstitial — go straight
      // to the form. The legend dot in the nav signals what the violet
      // fields mean.
      onContinue({ prefilled: json.filledCount > 0 });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Extraction failed.");
      setStage("error");
    }
  }

  return (
    <div className="relative min-h-[78vh] flex items-start justify-center px-4 pt-[clamp(3rem,10vh,7rem)] pb-12 overflow-hidden">
      {/* Floating decorative orbs */}
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

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.heic,.webp,application/pdf,image/*"
        onChange={onFileSelect}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
      />

      {/* Stage-driven foreground content */}
      <div className="relative w-full max-w-6xl">
        <AnimatePresence mode="wait">
          {stage === "idle" && (
            <motion.div
              key="idle"
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                opacity: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
              }}
              className="mx-auto max-w-3xl text-center"
            >
              <motion.div
                layout
                transition={{ layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
              >
                <motion.h1
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="font-extrabold tracking-[-0.02em] text-neutral-900"
                  style={{
                    fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
                    lineHeight: 0.95,
                  }}
                >
                  Less paperwork.
                  <span className="block text-[#15803d]">More sea time.</span>
                </motion.h1>

                <p className="mt-7 mx-auto max-w-[40rem] text-[15px] sm:text-[16px] text-neutral-600 leading-relaxed">
                  Upload any documents that can help pre-fill this form for
                  you. The more detailed the information you provide, the more
                  accurately the AI can complete your application.{" "}
                  <span className="relative inline-block whitespace-normal">
                    By uploading, you authorize the AI to process your
                    information for this purpose.
                    <svg
                      aria-hidden
                      viewBox="0 0 300 14"
                      preserveAspectRatio="none"
                      className="pointer-events-none absolute left-0 right-0 -bottom-2 h-3 w-full"
                    >
                      <motion.path
                        d="M2 8 C 40 2, 80 12, 120 6 S 200 12, 240 5 S 295 10, 298 7"
                        stroke="#facc15"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </svg>
                  </span>
                  {/* Info icon — hover/focus reveals the model name */}
                  <span
                    tabIndex={0}
                    aria-label="Which AI model are we using?"
                    className="group relative ml-1 inline-flex h-4 w-4 -translate-y-[1px] items-center justify-center rounded-full border border-neutral-300 bg-white text-[10px] font-bold text-neutral-500 align-middle cursor-help hover:border-[#15803d] hover:text-[#15803d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d]/40 transition-colors"
                  >
                    i
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-20 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-focus:opacity-100 group-focus:translate-y-0"
                    >
                      Powered by Google Gemini 2.5
                      <span
                        aria-hidden
                        className="absolute left-1/2 top-full -translate-x-1/2 h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-neutral-900"
                      />
                    </span>
                  </span>
                </p>

                {/* Buttons live with the content */}
                <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  {docs.length === 0 ? (
                    <motion.button
                      key="smart-upload"
                      type="button"
                      onClick={pickDocuments}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="inline-flex items-center justify-center rounded-full bg-[#15803d] px-7 py-4 text-[15px] font-semibold text-white shadow-[0_14px_36px_-12px_rgba(21,128,61,0.55)] hover:bg-[#166534] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#15803d]/40 transition-colors"
                    >
                      Smart upload
                    </motion.button>
                  ) : (
                    <motion.button
                      key="process"
                      type="button"
                      onClick={startProcessing}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        backgroundPosition: ["0% 50%", "200% 50%"],
                        boxShadow: [
                          "0 14px 36px -12px rgba(21,128,61,0.55), 0 0 0 0 rgba(34,197,94,0)",
                          "0 14px 36px -12px rgba(21,128,61,0.55), 0 0 22px 4px rgba(34,197,94,0.35)",
                          "0 14px 36px -12px rgba(21,128,61,0.55), 0 0 0 0 rgba(34,197,94,0)",
                        ],
                      }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{
                        opacity: { duration: 0.18 },
                        scale: { duration: 0.18 },
                        backgroundPosition: { duration: 14, repeat: Infinity, ease: "linear" },
                        boxShadow: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                      }}
                      className="relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-[15px] font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#15803d]/40 overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(110deg, #15803d 0%, #34d399 25%, #22c55e 50%, #34d399 75%, #15803d 100%)",
                        backgroundSize: "200% 100%",
                      }}
                    >
                      {/* Subtle moving sheen overlay */}
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                          backgroundSize: "200% 100%",
                        }}
                        animate={{ backgroundPosition: ["-200% 0%", "200% 0%"] }}
                        transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="relative">Process</span>
                    </motion.button>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait" initial={false}>
                  {docs.length === 0 ? (
                    <motion.button
                      key="type-yourself"
                      type="button"
                      onClick={() => onContinue()}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur border border-neutral-300 px-7 py-4 text-[14px] font-semibold text-neutral-800 hover:border-neutral-500 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400/40 transition-colors"
                    >
                      Type it manually
                    </motion.button>
                  ) : (
                    <motion.button
                      key="back"
                      type="button"
                      onClick={() => {
                        docs.forEach((d) => {
                          if (d.previewUrl) URL.revokeObjectURL(d.previewUrl);
                        });
                        setDocs([]);
                      }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/90 backdrop-blur border border-neutral-300 px-7 py-4 text-[14px] font-semibold text-neutral-800 hover:border-neutral-500 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400/40 transition-colors"
                    >
                      Back
                    </motion.button>
                  )}
                </AnimatePresence>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  className="mt-7 text-[11.5px] font-medium text-neutral-400"
                >
                  All values stay editable until you submit.
                </motion.p>
              </motion.div>

              {/* BELOW — horizontal file row, only renders when docs exist */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    key="filelist"
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-8 w-full"
                  >
                    <ul className="flex flex-wrap items-stretch justify-center gap-3">
                      <AnimatePresence initial={false}>
                        {docs.map((d, i) => {
                          return (
                            <motion.li
                              key={`${d.file.name}-${i}`}
                              layout
                              initial={{ opacity: 0, scale: 0.92, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.92, y: -4 }}
                              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                              whileHover={{ y: -2 }}
                              className="group relative flex items-center gap-2.5 rounded-2xl border border-neutral-200 bg-white/85 backdrop-blur pl-2 pr-3 py-2 shadow-sm hover:shadow-md transition-shadow"
                            >
                              {/* Thumbnail or icon block */}
                              {d.previewUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={d.previewUrl}
                                  alt=""
                                  className="h-9 w-9 shrink-0 rounded-lg object-cover border border-neutral-200"
                                />
                              ) : (
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#15803d]/10 text-[#15803d]">
                                  <FileIcon size={16} />
                                </span>
                              )}

                              {/* Filename + size, one line each */}
                              <div className="min-w-0 max-w-[200px] text-left">
                                <p className="truncate text-[12.5px] font-semibold text-neutral-900">
                                  {d.file.name}
                                </p>
                                <p className="mt-0.5 text-[10.5px] text-neutral-400">
                                  {formatBytes(d.file.size)}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeDoc(i)}
                                aria-label={`Remove ${d.file.name}`}
                                className="ml-1 text-neutral-300 hover:text-rose-500 opacity-60 group-hover:opacity-100 transition-all shrink-0"
                              >
                                <CloseIcon size={14} />
                              </button>
                            </motion.li>
                          );
                        })}
                      </AnimatePresence>

                      {docs.length < 8 && (
                        <motion.li layout className="flex items-center">
                          <button
                            type="button"
                            onClick={pickDocuments}
                            className="inline-flex items-center gap-1.5 rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-4 py-3 text-[12.5px] font-semibold text-[#15803d] hover:border-[#15803d] hover:bg-white transition-colors"
                          >
                            + Add more
                          </button>
                        </motion.li>
                      )}
                    </ul>
                    <p className="mt-3 text-center text-[11.5px] text-neutral-500">
                      {docs.length}/8 file{docs.length === 1 ? "" : "s"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {stage === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-[#15803d]/10 text-[#15803d]"
              >
                <SparkleIcon size={26} />
              </motion.div>
              <div className="mt-7 min-h-[5.5rem] flex flex-col items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={processingStep}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center"
                  >
                    <h2 className="text-[24px] sm:text-[28px] font-extrabold text-neutral-900 tracking-tight">
                      {PROCESSING_STEPS[processingStep].title}
                    </h2>
                    <p className="mt-3 text-[14px] text-neutral-500">
                      {PROCESSING_STEPS[processingStep].sub}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {stage === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 8v5m0 3.5h.01M5.07 19h13.86A2 2 0 0 0 20.66 16L13.73 4a2 2 0 0 0-3.46 0L3.34 16A2 2 0 0 0 5.07 19z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h2 className="mt-7 text-[24px] sm:text-[28px] font-extrabold text-neutral-900 tracking-tight">
                Couldn&apos;t process your documents.
              </h2>
              <p className="mt-3 mx-auto max-w-md text-[14px] text-neutral-500 leading-relaxed">
                {errorMessage ?? "Something went wrong reading your files."}
              </p>
              <div className="mt-7 flex flex-col sm:flex-row items-center gap-3">
                <motion.button
                  type="button"
                  onClick={() => {
                    setStage("idle");
                    setErrorMessage(null);
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center rounded-full bg-[#15803d] px-7 py-4 text-[15px] font-semibold text-white shadow-[0_14px_36px_-12px_rgba(21,128,61,0.55)] hover:bg-[#166534] transition-colors"
                >
                  Try again
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => onContinue()}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center rounded-full bg-white border border-neutral-300 px-7 py-4 text-[14px] font-semibold text-neutral-800 hover:border-neutral-500 transition-colors"
                >
                  Continue manually
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────── Icons + helpers ─────────── */

function SparkleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l1.7 4.6L18 9.3l-4.3 1.7L12 15.6l-1.7-4.6L6 9.3l4.3-1.7L12 3z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v5h5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M6 18L18 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
