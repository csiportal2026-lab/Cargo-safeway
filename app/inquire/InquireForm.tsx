"use client";

import { useEffect, useState } from "react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xjglgowg";
const COOLDOWN_KEY = "cs_inquire_submission";
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// 🚧 TESTING ONLY — set to false before pushing to production.
// When true: skips the 24-hour cooldown so you can submit repeatedly
// to test the form/success states.
const BYPASS_COOLDOWN = true;

type Status = "idle" | "sending" | "sent" | "error";
type View = "form" | "comment";

type StoredSubmission = {
  refId: string;
  submittedAt: number;
};

export default function InquireForm() {
  const [view, setView] = useState<View>("form");
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [age, setAge] = useState("");
  const [years, setYears] = useState("");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [refId, setRefId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // On mount: if there's a recent submission within 24h, show the success state
  useEffect(() => {
    if (BYPASS_COOLDOWN) return;
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(COOLDOWN_KEY);
      if (!raw) return;
      const parsed: StoredSubmission = JSON.parse(raw);
      const elapsed = Date.now() - parsed.submittedAt;
      if (elapsed < COOLDOWN_MS && parsed.refId) {
        setRefId(parsed.refId);
        setStatus("sent");
      } else {
        // Stale — clear it
        window.localStorage.removeItem(COOLDOWN_KEY);
      }
    } catch {
      // Corrupt entry — clear
      window.localStorage.removeItem(COOLDOWN_KEY);
    }
  }, []);

  function generateRefId() {
    let digits = "";
    for (let i = 0; i < 6; i++) {
      digits += Math.floor(Math.random() * 10);
    }
    return `BM8${digits}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending" || status === "sent") return;
    setStatus("sending");
    setRefId(null);
    setCopied(false);
    setErrorMsg(null);

    const reference = generateRefId();

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          // Standard fields
          name,
          phone,
          email,
          position,
          age,
          yearsAtSea: years,
          coverNote: message || "(none)",
          referenceId: reference,
          // Formspree special fields — pretties up the email in your inbox
          _subject: `New Inquiry · ${position} · ${name} (Ref ${reference})`,
          _replyto: email,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        let detail = text;
        try {
          const data = JSON.parse(text);
          if (data?.errors?.length) {
            detail = data.errors
              .map((e: { message?: string; field?: string; code?: string }) =>
                [e.code, e.field, e.message].filter(Boolean).join(": "),
              )
              .join(" | ");
          } else if (data?.error) {
            detail = data.error;
          }
        } catch {
          /* keep raw text */
        }
        // Log the full response for debugging
        // eslint-disable-next-line no-console
        console.log("Formspree error response:", text);
        throw new Error(`HTTP ${response.status}: ${detail.slice(0, 220)}`);
      }

      setRefId(reference);
      setStatus("sent");

      // Persist so the user sees the success card on revisit within 24h
      if (!BYPASS_COOLDOWN) {
        try {
          window.localStorage.setItem(
            COOLDOWN_KEY,
            JSON.stringify({
              refId: reference,
              submittedAt: Date.now(),
            } satisfies StoredSubmission),
          );
        } catch {
          /* localStorage unavailable — non-fatal */
        }
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  async function copyRefId() {
    if (!refId) return;
    try {
      await navigator.clipboard.writeText(refId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore — graceful fallback
    }
  }


  const isBusy = status === "sending" || status === "sent";
  const ageNum = parseInt(age, 10);
  const isAgeValid = !isNaN(ageNum) && ageNum >= 18 && ageNum < 70;
  const isFormValid =
    name.trim().length > 0 &&
    /^\d{11}$/.test(phone) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    position.length > 0 &&
    isAgeValid &&
    years.length > 0 &&
    agreed;

  if (status === "sent" && refId) {
    return (
      <SuccessCard
        refId={refId}
        copied={copied}
        onCopy={copyRefId}
        onDevReset={
          BYPASS_COOLDOWN
            ? () => {
                setStatus("idle");
                setName("");
                setPhone("");
                setEmail("");
                setPosition("");
                setAge("");
                setYears("");
                setMessage("");
                setAgreed(false);
                setRefId(null);
                setCopied(false);
                setErrorMsg(null);
              }
            : undefined
        }
      />
    );
  }

  if (view === "comment") {
    return (
      <CommentBox
        message={message}
        onMessageChange={setMessage}
        onBack={() => {
          if (isBusy) return;
          setView("form");
        }}
        status={status}
        onSubmit={handleSubmit}
        disabled={isBusy}
      />
    );
  }

  return (
    <form className="space-y-3 h-full" onSubmit={handleSubmit}>
      <div className="grid grid-cols-[1fr_160px] gap-3">
        <FormField
          label="Full Name"
          name="name"
          type="text"
          placeholder="Juan dela Cruz"
          disabled={isBusy}
          required
          value={name}
          onChange={setName}
          valid={name.trim().length > 0}
        />
        <FormField
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="09171234567"
          disabled={isBusy}
          required
          inputMode="numeric"
          pattern="[0-9]{11}"
          maxLength={11}
          value={phone}
          onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 11))}
          valid={/^\d{11}$/.test(phone)}
        />
      </div>

      <div className="grid grid-cols-[1fr_160px] gap-3">
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          disabled={isBusy}
          required
          value={email}
          onChange={setEmail}
          valid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
        />
        <div>
          <label
            htmlFor="years"
            className="block text-[12.5px] font-medium text-neutral-700 mb-1.5"
          >
            Years at Sea
            <span className="ml-0.5 text-[#15803d]">*</span>
          </label>
          <label
            htmlFor="years"
            className={`flex items-center w-full cursor-text rounded-xl bg-white border px-4 py-3 transition-colors ${
              years.length > 0
                ? "border-emerald-400/80 focus-within:border-emerald-500"
                : "border-neutral-200 focus-within:border-neutral-400"
            }`}
          >
            <input
              id="years"
              name="years"
              type="text"
              inputMode="numeric"
              pattern="[0-9]+"
              maxLength={2}
              placeholder="e.g. 5"
              required
              disabled={isBusy}
              value={years}
              onChange={(e) => setYears(e.target.value.replace(/\D/g, ""))}
              style={{ fieldSizing: "content" } as React.CSSProperties}
              className="min-w-[1ch] bg-transparent text-[13.5px] font-semibold text-neutral-900 placeholder:font-normal placeholder:text-neutral-400 outline-none border-0"
            />
            {years && (
              <span className="ml-0.5 text-[13.5px] font-semibold text-[#15803d]">
                {years === "1" ? "year" : "years"}
              </span>
            )}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_160px] gap-3">
       <div>
        <label
          htmlFor="position"
          className="block text-[12.5px] font-medium text-neutral-700 mb-1.5"
        >
          Position Applying For
          <span className="ml-0.5 text-[#15803d]">*</span>
        </label>
        <div className="relative">
          <select
            id="position"
            name="position"
            required
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            disabled={isBusy}
            className={`w-full appearance-none rounded-xl bg-white border px-4 py-3 text-[13.5px] font-semibold text-neutral-900 outline-none pr-10 disabled:opacity-60 invalid:text-neutral-400 invalid:font-normal transition-colors ${
              position
                ? "border-emerald-400/80 focus:border-emerald-500"
                : "border-neutral-200 focus:border-neutral-400"
            }`}
          >
            <option value="" disabled>
              e.g. Third Engineer
            </option>
            <optgroup label="Deck">
              <option>Master / Captain</option>
              <option>Chief Officer</option>
              <option>Second Officer</option>
              <option>Third Officer</option>
              <option>Bosun</option>
              <option>Able Seaman (AB)</option>
              <option>Ordinary Seaman (OS)</option>
            </optgroup>
            <optgroup label="Engine">
              <option>Chief Engineer</option>
              <option>Second Engineer</option>
              <option>Third Engineer</option>
              <option>Fourth Engineer</option>
              <option>Oiler</option>
              <option>Wiper</option>
            </optgroup>
            <optgroup label="Catering">
              <option>Chief Cook</option>
              <option>Steward / Messman</option>
            </optgroup>
            <option>Other</option>
          </select>
          <svg
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
       </div>

       <div>
         <label
           htmlFor="age"
           className="block text-[12.5px] font-medium text-neutral-700 mb-1.5"
         >
           Age
           <span className="ml-0.5 text-[#15803d]">*</span>
         </label>
         <input
           id="age"
           name="age"
           type="text"
           inputMode="numeric"
           pattern="[0-9]+"
           maxLength={2}
           placeholder="e.g. 32"
           required
           disabled={isBusy}
           value={age}
           onChange={(e) => {
             const next = e.target.value.replace(/\D/g, "").slice(0, 2);
             setAge(next);
           }}
           className={`w-full rounded-xl bg-white border px-4 py-3 text-[13.5px] font-semibold text-neutral-900 placeholder:font-normal placeholder:text-neutral-400 outline-none disabled:opacity-60 transition-colors ${
             age.length === 0
               ? "border-neutral-200 focus:border-neutral-400"
               : isAgeValid
                 ? "border-emerald-400/80 focus:border-emerald-500"
                 : "border-rose-300/80 focus:border-rose-400"
           }`}
         />
       </div>
      </div>

      {/* Cover note with expand icon */}
      <div>
        <label
          htmlFor="message"
          className="block text-[12.5px] font-medium text-neutral-700 mb-1.5"
        >
          Cover Note
          <span className="ml-1 text-[10.5px] font-normal text-neutral-400">(optional)</span>
        </label>
        <div className="relative">
          <textarea
            id="message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. 8 years on container vessels, BOSIET certified, last contract on a 14,000-TEU box ship..."
            disabled={isBusy}
            rows={2}
            className="w-full resize-none rounded-xl bg-white border border-neutral-200 px-4 py-3 pr-10 text-[13.5px] font-semibold text-neutral-900 placeholder:font-normal placeholder:text-neutral-400 outline-none focus:border-neutral-400 disabled:opacity-60"
          />
          <button
            type="button"
            aria-label="Expand cover note"
            title="Expand"
            onClick={() => setView("comment")}
            disabled={isBusy}
            className="absolute top-2.5 right-2.5 grid h-7 w-7 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-[#15803d] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton status={status} disabled={isBusy || !isFormValid} />
        {status !== "error" && (
          <label className="block cursor-pointer max-w-[440px] select-none text-[10.5px] leading-[1.5] text-neutral-600">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={isBusy}
              className="mr-1.5 h-3 w-3 align-[-1px] accent-[#15803d] cursor-pointer"
            />
            I confirm the information is accurate, consent to its processing
            for recruitment under the Data Privacy Act of 2012, and acknowledge
            that this submission does not guarantee employment.
          </label>
        )}
        {status === "error" && errorMsg && (
          <span className="text-[12.5px] text-rose-600 font-semibold whitespace-normal">
            {errorMsg}
          </span>
        )}
        {status === "sent" && refId && (
          <div className="ref-id-pop inline-flex items-center gap-2 text-[13px] text-neutral-800">
            <span className="text-neutral-500">Reference number:</span>
            <span className="font-mono">{refId}</span>
            <button
              type="button"
              onClick={copyRefId}
              aria-label={copied ? "Copied" : "Copy reference ID"}
              className="grid h-6 w-6 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
            >
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M5 12.5 10 17 19 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}

function SuccessCard({
  refId,
  copied,
  onCopy,
  onDevReset,
}: {
  refId: string;
  copied: boolean;
  onCopy: () => void;
  onDevReset?: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center h-full pt-2 fade-in-up fade-in-up-1">
      {/* Animated check */}
      <div className="grid h-16 w-16 place-items-center rounded-full bg-[#15803d]/10 ring-1 ring-[#15803d]/20 check-pop">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="m5 12.5 5 5 9-10"
            stroke="#15803d"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="mt-5 text-[22px] font-extrabold tracking-tight text-neutral-900 fade-in-up fade-in-up-2">
        Inquiry received
      </h2>

      <p className="mt-2 max-w-[420px] text-[13px] leading-relaxed text-neutral-600 fade-in-up fade-in-up-3">
        Your application has reached our crewing team. We&apos;ll be in touch
        should there be an opportunity that matches your experience.
      </p>

      {/* Reference number block */}
      <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-neutral-50 ring-1 ring-neutral-200 pl-4 pr-2 py-1.5 fade-in-up fade-in-up-4">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Reference
        </span>
        <span className="font-mono text-[14px] font-bold text-neutral-900 tabular-nums">
          {refId}
        </span>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Copied" : "Copy reference number"}
          title={copied ? "Copied" : "Copy"}
          className="grid h-7 w-7 place-items-center rounded-full text-neutral-500 hover:bg-white hover:text-[#15803d] transition-colors"
        >
          {copied ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 12.5 10 17 19 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
              <path
                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      <p className="mt-3 text-[11.5px] text-neutral-500 max-w-[360px] fade-in-up fade-in-up-5">
        Save this number — our team may reference it when we reach out.
      </p>

      {onDevReset && (
        <button
          type="button"
          onClick={onDevReset}
          className="mt-6 text-[11px] text-amber-700 underline hover:text-amber-900"
        >
          🚧 Dev: reset to form
        </button>
      )}
    </div>
  );
}

function CommentBox({
  message,
  onMessageChange,
  onBack,
  status,
  onSubmit,
  disabled,
}: {
  message: string;
  onMessageChange: (v: string) => void;
  onBack: () => void;
  status: Status;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          disabled={disabled}
          className="grid h-9 w-9 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="m15 18-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="text-[14px] font-semibold text-neutral-900">
          Cover Note
        </span>
      </div>

      <textarea
        name="message"
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder="Tell us about your sea time, vessels you've sailed on, certifications, and any details you want us to know…"
        disabled={disabled}
        className="flex-1 w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[14px] leading-relaxed font-semibold text-neutral-900 placeholder:font-normal placeholder:text-neutral-400 outline-none focus:border-neutral-400 disabled:opacity-60"
      />
    </form>
  );
}

function SubmitButton({ status, disabled }: { status: Status; disabled: boolean }) {
  const isIdleOrError = status === "idle" || status === "error";
  const inactive = isIdleOrError && disabled;
  const ready = isIdleOrError && !disabled;
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full pl-2 pr-6 py-2 text-[13px] font-semibold text-white shadow transition-all duration-300 ${
        status === "sent"
          ? "bg-emerald-600 cursor-default"
          : status === "error"
            ? "bg-rose-600 hover:bg-rose-700"
            : inactive
              ? "bg-neutral-300 cursor-not-allowed"
              : "bg-[#15803d] hover:bg-[#126a33] disabled:bg-[#15803d]/80"
      } ${ready ? "submit-ready" : ""}`}
    >
      <span
        className={`grid h-7 w-7 place-items-center rounded-full bg-white ${
          inactive ? "text-neutral-400" : status === "error" ? "text-rose-600" : "text-[#15803d]"
        }`}
      >
        {isIdleOrError && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="m22 2-11 11M22 2l-7 20-4-9-9-4 20-7z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {status === "sending" && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className="animate-spin"
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {status === "sent" && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className="check-pop"
          >
            <path
              d="M5 12.5 10 17 19 7"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="min-w-[55px] text-left">
        {status === "idle" && "Submit"}
        {status === "sending" && "Sending..."}
        {status === "sent" && "Sent!"}
        {status === "error" && "Retry"}
      </span>
    </button>
  );
}

function FormField({
  label,
  name,
  type,
  placeholder,
  helper,
  disabled,
  required,
  inputMode,
  pattern,
  maxLength,
  value,
  onChange,
  valid,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  helper?: string;
  disabled?: boolean;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  maxLength?: number;
  value?: string;
  onChange?: (v: string) => void;
  valid?: boolean;
}) {
  const hasValue = !!value && value.length > 0;
  const showValid = hasValue && valid === true;
  const showInvalid = hasValue && valid === false;
  const borderCls = showValid
    ? "border-emerald-400/80 focus:border-emerald-500"
    : showInvalid
      ? "border-rose-300/80 focus:border-rose-400"
      : "border-neutral-200 focus:border-neutral-400";
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[12.5px] font-medium text-neutral-700 mb-1.5"
      >
        {label}
        {required && <span className="ml-0.5 text-[#15803d]">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        inputMode={inputMode}
        pattern={pattern}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-xl bg-white border ${borderCls} px-4 py-3 text-[13.5px] font-semibold text-neutral-900 placeholder:font-normal placeholder:text-neutral-400 outline-none disabled:opacity-60 transition-colors`}
      />
      {helper && (
        <p className="mt-1 text-[11px] leading-snug text-neutral-500">{helper}</p>
      )}
    </div>
  );
}
