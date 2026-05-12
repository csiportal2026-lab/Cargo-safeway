import Image from "next/image";
import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import HomeStats from "./components/HomeStats";

export default function Home() {
 return (
 <main className="min-h-screen w-full flex items-stretch justify-stretch transition-colors">
 <div className="relative card-canvas card-canvas-locked w-full bg-neutral-900 overflow-hidden flex flex-col transition-colors">
 {/* Hero ship — full bleed, the photo carries the whole hero */}
 <Image
 src="/hero-ship-v9.jpg"
 alt=""
 fill
 priority
 unoptimized
 aria-hidden
 sizes="100vw"
 className="pointer-events-none select-none object-cover z-0"
 />
 {/* Top-heavy gradient — upper portion stays dark for readable text,
 lower portion lets the vessel breathe through */}
 <div
 aria-hidden
 className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/35 to-transparent"
 />

 <div className="relative z-10 flex-1 flex flex-col">
 <SiteHeader />

 {/* Hero — centered horizontally, anchored to the top so the vessel
 below isn't visually competing with the content */}
 <section
 className="relative flex flex-col items-center justify-start text-center"
 style={{
 paddingInline: "clamp(1.25rem, 4vw, 5rem)",
 paddingTop: "var(--space-6)",
 paddingBottom: "var(--space-12)",
 gap: "var(--space-6)",
 }}
 >
 <h1
 className="max-w-[18ch] leading-[1.05] font-extrabold tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-400 fade-in-up fade-in-up-2"
 style={{ fontSize: "var(--fs-display)" }}
 >
 Your Trusted Maritime Partner
 </h1>
 <HomeStats />
 <div className="flex items-center fade-in-up fade-in-up-3" style={{ gap: "var(--space-3)" }}>
 <Link
 href="/inquire"
 className="rounded-full bg-white font-semibold text-[#15803d] shadow-sm hover:bg-emerald-50 transition-colors"
 style={{
 paddingInline: "clamp(1.5rem, 1.5vw + 0.75rem, 2.25rem)",
 paddingBlock: "clamp(0.625rem, 0.4vw + 0.5rem, 0.9375rem)",
 fontSize: "var(--fs-sm)",
 }}
 >
 Inquire Now
 </Link>
 </div>
 </section>
 </div>
 </div>
 </main>
 );
}
