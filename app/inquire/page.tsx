import SiteHeader from "../components/SiteHeader";
import InquireForm from "./InquireForm";

export default function InquirePage() {
 return (
 <main className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6">
 <div className="relative card-canvas w-full max-w-[1200px] lg:w-[1123px] lg:h-[632px] lg:shrink-0 bg-white rounded-3xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors">
 {/* Hairline navigational grid — chart aesthetic, consistent with Fleet & Find Us */}
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

 <section className="relative z-10 flex-1 px-6 sm:px-12 pb-14 pt-0">
 <div className="rounded-3xl bg-white p-2 sm:p-4 pt-0">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
 {/* Left: form card */}
 <div className="rounded-3xl bg-white border border-[#15803d] p-5 sm:p-8 min-h-[470px] flex flex-col fade-in-up fade-in-up-1">
 <InquireForm />
 </div>

 {/* Right: copy */}
 <div className="flex flex-col justify-center px-2 sm:px-4">
 <h1 className="text-[34px] sm:text-[42px] leading-[1.05] font-extrabold tracking-[-0.02em] text-neutral-900">
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
 className="absolute left-0 right-0 -bottom-4 w-[92%] h-[28px] text-[#15803d] overflow-visible"
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

 <p className="mt-6 max-w-[520px] text-[14px] leading-relaxed text-neutral-600 fade-in-up fade-in-up-6">
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

