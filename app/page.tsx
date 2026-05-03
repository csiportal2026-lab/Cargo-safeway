import Image from "next/image";
import Link from "next/link";
import SiteHeader from "./components/SiteHeader";

export default function Home() {
 return (
 <main className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6 transition-colors">
 <div className="relative card-canvas w-full max-w-[1200px] lg:w-[1123px] lg:h-[632px] lg:shrink-0 bg-white rounded-3xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors">
 {/* Ship background — overflows card edges for that dramatic crop */}
 <Image
 src="/hero-ship-v6.webp"
 alt=""
 fill
 priority
 quality={95}
 aria-hidden
 sizes="(max-width: 1024px) 100vw, 1200px"
 className="pointer-events-none select-none hidden lg:block object-cover z-0 saturate-[1.45] contrast-[1.07]"
 />
 {/* Left-side fade so headline + nav sit on calmer ground */}
 <div
 aria-hidden
 className="pointer-events-none hidden lg:block absolute inset-0 z-[1] bg-gradient-to-r from-white/60 via-white/30 to-transparent"
 />
 {/* Top-strip fade to give the nav links a calm canvas */}
 <div
 aria-hidden
 className="pointer-events-none hidden lg:block absolute inset-x-0 top-0 h-24 z-[1] bg-gradient-to-b from-white/55 to-transparent"
 />

 <div className="relative flex-1 flex flex-col">
 <SiteHeader />

 {/* Hero text — left-anchored over the ship */}
 <section className="relative z-10 flex-1 flex flex-col justify-center px-6 lg:px-12 pb-8">
 <span className="inline-block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#15803d] fade-in-up fade-in-up-1">
 Sailing Trust Across Every Ocean
 </span>
 <h1 className="mt-2 max-w-[640px] text-[42px] sm:text-[52px] lg:text-[64px] leading-[1.15] font-extrabold tracking-[-0.02em] text-neutral-900 fade-in-up fade-in-up-2">
 Your <span className="sweep-text">Trusted</span>
 <br />
 <span className="relative inline-block">
 Maritime
 <svg
 aria-hidden
 viewBox="0 0 220 60"
 className="absolute left-0 right-0 -bottom-4 w-full h-[36px] text-[#15803d] overflow-visible"
 preserveAspectRatio="none"
 >
 <path
 d="M10 46 Q 110 22 210 46"
 stroke="currentColor"
 strokeWidth="11"
 strokeLinecap="round"
 fill="none"
 />
 </svg>
 </span>{" "}
 Partner
 </h1>
 <dl className="mt-9 flex items-center gap-6 fade-in-up fade-in-up-3">
 {[
 { value: "197", label: "Vessels Powered" },
 { value: "5,000+", label: "Seafarers Deployed" },
 { value: "Global", label: "Routes" },
 ].map((stat, i) => (
 <div
 key={stat.label}
 className={`flex flex-col ${i > 0 ? "pl-6 border-l border-neutral-300/80" : ""}`}
 >
 <dt className="text-[28px] sm:text-[32px] font-extrabold tracking-tight text-[#15803d] leading-none">
 {stat.value}
 </dt>
 <dd className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-600">
 {stat.label}
 </dd>
 </div>
 ))}
 </dl>
 <div className="mt-8 flex items-center gap-3 fade-in-up fade-in-up-3">
 <Link
 href="/inquire"
 className="rounded-full bg-[#15803d] px-6 py-2.5 text-[14px] font-semibold text-white shadow-sm hover:bg-[#126a33] transition-colors"
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

function IconAddress() {
 return (
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-[#15803d]" aria-hidden>
 <path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
 <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6" />
 </svg>
 );
}

function IconPhone() {
 return (
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#15803d]" aria-hidden>
 <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
 </svg>
 );
}

function IconMail() {
 return (
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#15803d]" aria-hidden>
 <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
 <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
 </svg>
 );
}
