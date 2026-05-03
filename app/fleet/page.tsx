import SiteHeader from "../components/SiteHeader";
import FleetExplorer from "./FleetExplorer";

export default function FleetPage() {
 return (
 <main className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6">
 <div className="relative card-canvas w-full max-w-[1200px] lg:w-[1123px] lg:h-[632px] lg:shrink-0 bg-white rounded-3xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors">
 {/* Hairline navigational grid — chart aesthetic */}
 <svg
 aria-hidden
 className="pointer-events-none absolute inset-0 z-0 w-full h-full"
 preserveAspectRatio="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <defs>
 <pattern id="chart-grid" width="56" height="56" patternUnits="userSpaceOnUse">
 <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#0f172a" strokeOpacity="0.055" strokeWidth="1" />
 </pattern>
 </defs>
 <rect width="100%" height="100%" fill="url(#chart-grid)" />
 </svg>
 {/* Soft radial spotlight behind the title */}
 <div
 aria-hidden
 className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,_rgba(21,128,61,0.09)_0%,_rgba(21,128,61,0)_70%)]"
 />
 <SiteHeader />
 <section className="relative z-10 flex-1 px-6 sm:px-12 pb-16 pt-6">
 <FleetExplorer />
 </section>
 </div>
 </main>
 );
}
