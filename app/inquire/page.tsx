import SiteHeader from "../components/SiteHeader";
import InquireForm from "./InquireForm";

export default function InquirePage() {
 return (
 <main className="min-h-screen w-full flex items-stretch justify-stretch">
 <div className="relative card-canvas w-full bg-white overflow-hidden flex flex-col transition-colors">
 {/* Hairline navigational grid — chart aesthetic, consistent with Find Us */}
 <svg
 aria-hidden
 className="pointer-events-none absolute inset-0 z-0 w-full h-full"
 preserveAspectRatio="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <defs>
 <pattern id="chart-grid-inquire" width="56" height="56" patternUnits="userSpaceOnUse">
 <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#0f172a" strokeOpacity="0.055" strokeWidth="1" />
 </pattern>
 </defs>
 <rect width="100%" height="100%" fill="url(#chart-grid-inquire)" />
 </svg>
 <SiteHeader />

 <section
 className="relative z-10 flex-1 flex flex-col justify-center"
 style={{
 paddingInline: "clamp(1.25rem, 4vw, 4rem)",
 paddingTop: "var(--space-2)",
 paddingBottom: "var(--space-6)",
 }}
 >
 <div className="bg-white">
 <div
 className="grid grid-cols-1 lg:grid-cols-2 items-stretch"
 style={{ gap: "clamp(1.5rem, 3vw, 3rem)" }}
 >
 {/* Left: form card */}
 <div
 className="bg-white border border-[#15803d] flex flex-col fade-in-up fade-in-up-1"
 style={{
 borderRadius: "clamp(1rem, 1.5vw, 1.5rem)",
 padding: "clamp(1.25rem, 2vw, 2rem)",
 minHeight: "clamp(28rem, 50dvh, 32rem)",
 }}
 >
 <InquireForm />
 </div>

 {/* Right: copy */}
 <div className="flex flex-col justify-center" style={{ paddingInline: "var(--space-2)" }}>
 <h1
 className="leading-[1.05] font-extrabold tracking-[-0.02em] text-neutral-900"
 style={{ fontSize: "clamp(2rem, 4.5vw + 0.5rem, 5rem)" }}
 >
 <span className="inline-block fade-in-up fade-in-up-1">Let&apos;s</span>{" "}
 <span className="inline-block fade-in-up fade-in-up-2">Chart</span>{" "}
 <span className="inline-block fade-in-up fade-in-up-3">Your</span>
 <br />
 <span className="inline-block fade-in-up fade-in-up-4">Next</span>{" "}
 <span className="relative inline-block fade-in-up fade-in-up-5">
 Voyage.
 <svg
 aria-hidden
 viewBox="0 0 220 60"
 className="absolute left-0 right-0 w-[92%] text-[#15803d] overflow-visible"
 style={{ height: "0.5em", bottom: "-0.2em" }}
 preserveAspectRatio="none"
 >
 <path
 d="M10 46 Q 110 22 210 46"
 stroke="currentColor"
 strokeWidth="11"
 strokeLinecap="round"
 fill="none"
 className="curve-draw"
 />
 </svg>
 </span>
 </h1>

 <p
 className="text-neutral-600 fade-in-up fade-in-up-6"
 style={{
 marginTop: "var(--space-4)",
 maxWidth: "min(60ch, 100%)",
 fontSize: "clamp(0.9375rem, 0.6vw + 0.75rem, 1.25rem)",
 lineHeight: 1.6,
 }}
 >
 Tell us about your seafaring experience and the position
 you&apos;re applying for. Our crewing team reviews each
 application individually.
 </p>
 </div>
 </div>
 </div>
 </section>
 </div>
 </main>
 );
}

