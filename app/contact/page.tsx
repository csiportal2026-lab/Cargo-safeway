"use client";

import { useState } from "react";
import SiteHeader from "../components/SiteHeader";
import InteractiveGrid from "../components/InteractiveGrid";

const ADDRESS_ROWS = [
 { label: "BLDG", value: "Seaborne Bldg." },
 { label: "STR", value: "4203 R. Magsaysay Blvd." },
 { label: "LOC", value: "Sta. Mesa, Manila, PH 1016" },
];

const PHONE_DISPLAY = "+63 2 8716 5532";
const EMAIL_DISPLAY = "info@cargosafeway.com";

type View = "address" | "phone" | "email";

export default function ContactPage() {
 const [view, setView] = useState<View>("address");
 const showPhone = view === "phone";
 const showEmail = view === "email";
 return (
 <main className="min-h-screen w-full flex items-stretch justify-stretch">
 <div className="relative card-canvas w-full bg-white flex flex-col transition-colors">
 {/* Interactive grid background — follows the cursor with a green spotlight */}
 <InteractiveGrid />
 <SiteHeader />

 <section
 className="relative z-10 flex-1 flex flex-col items-center justify-start text-center"
 style={{
 paddingInline: "clamp(1.25rem, 4vw, 4rem)",
 paddingTop: "clamp(3rem, 14vh, 8rem)",
 paddingBottom: "var(--space-6)",
 }}
 >
 {/* Coordinate watermark — chart-style header label, sits behind the content */}
 <div
 aria-hidden
 className="pointer-events-none absolute inset-x-0 z-0 text-center font-extrabold uppercase text-[#15803d] tabular-nums select-none"
 style={{
 top: "9%",
 fontSize: "clamp(1.25rem, 5vw, 4rem)",
 letterSpacing: "0.18em",
 opacity: 0.08,
 whiteSpace: "nowrap",
 }}
 >
 14.6028° N · 121.0099° E
 </div>

 {/* Faded compass-rose backdrop — maritime/wayfinding decoration */}
 <svg
 aria-hidden
 className="pointer-events-none absolute z-0 text-[#15803d]"
 style={{
 width: "clamp(20rem, 40vw, 36rem)",
 height: "clamp(20rem, 40vw, 36rem)",
 opacity: 0.05,
 left: "50%",
 top: "50%",
 transform: "translate(-50%, -50%)",
 }}
 viewBox="0 0 200 200"
 fill="none"
 stroke="currentColor"
 >
 <circle cx="100" cy="100" r="98" strokeWidth="1" />
 <circle cx="100" cy="100" r="78" strokeWidth="0.6" />
 <circle cx="100" cy="100" r="55" strokeWidth="0.4" />
 <circle cx="100" cy="100" r="3" fill="currentColor" stroke="none" />
 {/* Cardinal points (N S E W) — large diamonds */}
 <path d="M100 2 L107 100 L100 108 L93 100 Z" fill="currentColor" stroke="none" />
 <path d="M100 198 L93 100 L100 92 L107 100 Z" fill="currentColor" fillOpacity="0.7" stroke="none" />
 <path d="M2 100 L100 93 L108 100 L100 107 Z" fill="currentColor" fillOpacity="0.7" stroke="none" />
 <path d="M198 100 L100 107 L92 100 L100 93 Z" fill="currentColor" fillOpacity="0.7" stroke="none" />
 {/* Inter-cardinal points (NE NW SE SW) — slimmer */}
 <path d="M170 30 L107 93 L100 100 L93 93 Z" fill="currentColor" fillOpacity="0.5" stroke="none" transform="rotate(0 100 100)" />
 <path d="M30 30 L93 93 L100 100 L107 93 Z" fill="currentColor" fillOpacity="0.5" stroke="none" />
 <path d="M30 170 L93 107 L100 100 L107 107 Z" fill="currentColor" fillOpacity="0.5" stroke="none" />
 <path d="M170 170 L107 107 L100 100 L93 107 Z" fill="currentColor" fillOpacity="0.5" stroke="none" />
 {/* N marker */}
 <text x="100" y="-8" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor" stroke="none" dy="22">N</text>
 </svg>

 {/* Open location info */}
 <div
 className="relative z-10 flex flex-col items-center fade-in-up fade-in-up-1"
 style={{ maxWidth: "min(48rem, 100%)" }}
 >
 <h1
 className="flex items-center justify-center leading-[1.05] font-extrabold tracking-[-0.025em] text-neutral-900"
 style={{
 fontSize: "clamp(1.625rem, 3.5vw + 0.5rem, 4rem)",
 gap: "clamp(0.4rem, 0.85vw, 0.75rem)",
 transform: "translateY(calc(-1 * clamp(1rem, 3vh, 3rem)))",
 }}
 >
 <svg
 aria-hidden
 viewBox="0 0 24 24"
 className="shrink-0"
 style={{ width: "0.78em", height: "0.78em" }}
 >
 <path
 d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z"
 fill="#dc2626"
 stroke="#991b1b"
 strokeWidth="1.2"
 strokeLinejoin="round"
 />
 <circle cx="12" cy="9" r="2.5" fill="white" stroke="#991b1b" strokeWidth="1.2" />
 </svg>
 Location
 </h1>
 {/* Chart instrument plate — label / value rows divided by hairline rules */}
 <div
 className="w-full"
 style={{
 marginTop: "var(--space-5)",
 maxWidth: "min(26rem, 100%)",
 }}
 >
 {(showPhone
 ? [{ label: "TEL", value: PHONE_DISPLAY }]
 : showEmail
 ? [{ label: "MAIL", value: EMAIL_DISPLAY }]
 : ADDRESS_ROWS
 ).map((row) => (
 <div
 key={row.label}
 className="flex items-baseline"
 style={{
 gap: "var(--space-3)",
 paddingBlock: "var(--space-2)",
 }}
 >
 <div
 className="font-semibold uppercase tracking-[0.22em] text-[#15803d] tabular-nums shrink-0 text-left"
 style={{
 fontSize: "clamp(0.625rem, 0.3vw + 0.55rem, 0.75rem)",
 width: "3rem",
 }}
 >
 {row.label}
 </div>
 <div
 className="font-mono tabular-nums text-neutral-800 text-left"
 style={{
 fontSize: "clamp(0.8125rem, 0.45vw + 0.7rem, 1rem)",
 letterSpacing: "0.02em",
 }}
 >
 {row.value}
 </div>
 </div>
 ))}
 </div>

 {/* Multi-channel contact row */}
 <div
 className="flex flex-wrap items-center justify-center"
 style={{
 marginTop: "var(--space-8)",
 gap: "var(--space-3)",
 }}
 >
 <a
 href="https://www.google.com/maps/dir/?api=1&destination=Seaborne+Bldg+R.+Magsaysay+Blvd+Sta.+Mesa+Manila"
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center justify-center rounded-full border-2 border-[#15803d] font-semibold text-[#15803d] transition-all duration-300 ease-out hover:bg-[#15803d] hover:text-white hover:shadow-lg hover:shadow-[#15803d]/25 hover:-translate-y-0.5"
 style={{
 paddingInline: "clamp(1rem, 0.8vw + 0.6rem, 1.5rem)",
 paddingBlock: "clamp(0.3125rem, 0.3vw + 0.25rem, 0.5rem)",
 fontSize: "clamp(0.8125rem, 0.4vw + 0.65rem, 1rem)",
 gap: "var(--space-2)",
 }}
 >
 Directions
 </a>
 <a
 href="tel:+63287165532"
 onClick={(e) => {
 if (showPhone) {
 e.preventDefault();
 setView("address");
 return;
 }
 const ok = window.confirm(
 `Call Cargo Safeway at ${PHONE_DISPLAY}?`,
 );
 if (!ok) {
 e.preventDefault();
 return;
 }
 setView("phone");
 }}
 className={`inline-flex items-center justify-center rounded-full border-2 border-[#15803d] font-semibold transition-all duration-300 ease-out hover:bg-[#15803d] hover:text-white hover:shadow-lg hover:shadow-[#15803d]/25 hover:-translate-y-0.5 ${showPhone ? "bg-[#15803d] text-white shadow-md shadow-[#15803d]/25" : "text-[#15803d]"}`}
 style={{
 paddingInline: "clamp(1rem, 0.8vw + 0.6rem, 1.5rem)",
 paddingBlock: "clamp(0.3125rem, 0.3vw + 0.25rem, 0.5rem)",
 fontSize: "clamp(0.8125rem, 0.4vw + 0.65rem, 1rem)",
 gap: "var(--space-2)",
 }}
 >
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
 <path
 d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinejoin="round"
 />
 </svg>
 Call
 </a>
 <a
 href={`mailto:${EMAIL_DISPLAY}`}
 onClick={(e) => {
 if (showEmail) {
 e.preventDefault();
 setView("address");
 return;
 }
 const ok = window.confirm(
 `Email Cargo Safeway at ${EMAIL_DISPLAY}?`,
 );
 if (!ok) {
 e.preventDefault();
 return;
 }
 setView("email");
 }}
 className={`inline-flex items-center justify-center rounded-full border-2 border-[#15803d] font-semibold transition-all duration-300 ease-out hover:bg-[#15803d] hover:text-white hover:shadow-lg hover:shadow-[#15803d]/25 hover:-translate-y-0.5 ${showEmail ? "bg-[#15803d] text-white shadow-md shadow-[#15803d]/25" : "text-[#15803d]"}`}
 style={{
 paddingInline: "clamp(1rem, 0.8vw + 0.6rem, 1.5rem)",
 paddingBlock: "clamp(0.3125rem, 0.3vw + 0.25rem, 0.5rem)",
 fontSize: "clamp(0.8125rem, 0.4vw + 0.65rem, 1rem)",
 gap: "var(--space-2)",
 }}
 >
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
 <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
 <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
 </svg>
 Email
 </a>
 </div>
 </div>

 </section>
 </div>
 </main>
 );
}
