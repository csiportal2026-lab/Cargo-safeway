"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent";
type View = "form" | "comment";

export default function InquireForm() {
  const [view, setView] = useState<View>("form");
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [years, setYears] = useState("");
  const [message, setMessage] = useState("");
  const [refId, setRefId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function generateRefId() {
    let digits = "";
    for (let i = 0; i < 6; i++) {
      digits += Math.floor(Math.random() * 10);
    }
    return `BM8${digits}`;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("sending");
    setRefId(null);
    setCopied(false);
    window.setTimeout(() => {
      setRefId(generateRefId());
      setStatus("sent");
    }, 1800);
    // No reset — once sent, the form stays locked with the reference ID visible.
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

  const isBusy = status !== "idle";
  const isFormValid =
    name.trim().length > 0 &&
    /^\d{11}$/.test(phone) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    position.length > 0 &&
    years.length > 0;

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
      <div className="grid grid-cols-[1fr_180px] gap-3">
        <FormField
          label="Full Name"
          name="name"
          type="text"
          placeholder="Ian Rex"
          disabled={isBusy}
          required
          value={name}
          onChange={setName}
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
        />
      </div>

      <div className="grid grid-cols-[1fr_140px] gap-3">
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="Email"
          disabled={isBusy}
          required
          value={email}
          onChange={setEmail}
        />
        <div>
          <label
            htmlFor="years"
            className="block text-[12.5px] font-medium text-neutral-700 mb-1.5"
          >
            Years at Sea
          </label>
          <label
            htmlFor="years"
            className="flex items-center w-full cursor-text rounded-xl bg-white border border-neutral-200 px-4 py-3 focus-within:border-neutral-400"
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

      <div>
        <label
          htmlFor="position"
          className="block text-[12.5px] font-medium text-neutral-700 mb-1.5"
        >
          Position Applying For
        </label>
        <div className="relative">
          <select
            id="position"
            name="position"
            required
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            disabled={isBusy}
            className="w-full appearance-none rounded-xl bg-white border border-neutral-200 px-4 py-3 text-[13.5px] font-semibold text-neutral-900 outline-none focus:border-neutral-400 pr-10 disabled:opacity-60 invalid:text-neutral-400 invalid:font-normal"
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

      {/* Cover note with expand icon */}
      <div>
        <label
          htmlFor="message"
          className="block text-[12.5px] font-medium text-neutral-700 mb-1.5"
        >
          Cover Note
        </label>
        <div className="relative">
          <textarea
            id="message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Briefly tell us about your experience…"
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

      <div className="flex items-center gap-3 whitespace-nowrap">
        <SubmitButton status={status} disabled={isBusy || !isFormValid} />
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
  const inactive = status === "idle" && disabled;
  const ready = status === "idle" && !disabled;
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full pl-2 pr-6 py-2 text-[13px] font-semibold text-white shadow transition-all duration-300 ${
        status === "sent"
          ? "bg-emerald-600 cursor-default"
          : inactive
            ? "bg-neutral-300 cursor-not-allowed"
            : "bg-[#15803d] hover:bg-[#126a33] disabled:bg-[#15803d]/80"
      } ${ready ? "submit-ready" : ""}`}
    >
      <span
        className={`grid h-7 w-7 place-items-center rounded-full bg-white ${
          inactive ? "text-neutral-400" : "text-[#15803d]"
        }`}
      >
        {status === "idle" && (
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
      </span>
    </button>
  );
}

function FormField({
  label,
  name,
  type,
  placeholder,
  disabled,
  required,
  inputMode,
  pattern,
  maxLength,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  maxLength?: number;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[12.5px] font-medium text-neutral-700 mb-1.5"
      >
        {label}
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
        className="w-full rounded-xl bg-white border border-neutral-200 px-4 py-3 text-[13.5px] font-semibold text-neutral-900 placeholder:font-normal placeholder:text-neutral-400 outline-none focus:border-neutral-400 disabled:opacity-60"
      />
    </div>
  );
}
