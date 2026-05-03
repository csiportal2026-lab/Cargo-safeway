import Image from "next/image";
import SiteHeader from "./components/SiteHeader";

export default function Home() {
 return (
 <main className="h-screen w-full bg-[#f3f4f6] flex items-stretch justify-center px-4 sm:px-6 py-4 sm:py-6 transition-colors">
 <div className="relative w-full max-w-[1200px] bg-white rounded-3xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors">
 {/* Ship background — spans the entire card */}
 <Image
 src="/hero-ship.webp"
 alt=""
 width={2000}
 height={1640}
 priority
 aria-hidden
 className="pointer-events-none select-none absolute right-[-180px] bottom-[-250px] w-auto h-[160%] max-h-[1400px] z-0 opacity-100"
 />
 {/* Header + Hero wrapper */}
 <div className="relative flex-1 flex flex-col">

 <SiteHeader />

 {/* Hero */}
 <section className="relative z-10 flex-1 px-6 sm:px-12 pt-8 pb-6 text-left">
 <span className="inline-block text-[14px] font-medium text-neutral-500 fade-in-up fade-in-up-1">
 Sailing Trust Across Every Ocean
 </span>
 <h1 className="mt-0 max-w-[640px] text-[48px] sm:text-[72px] leading-[1.18] font-extrabold tracking-[-0.02em] text-neutral-900 fade-in-up fade-in-up-2">
 Your <span className="sweep-text">Trusted</span>{" "}
 <span className="relative inline-block">
 Maritime
 <svg
 aria-hidden
 viewBox="0 0 220 60"
 className="absolute left-0 right-0 -bottom-4 w-full h-[36px] text-[#15803d] overflow-visible"
 preserveAspectRatio="none"
 >
 <path
 d="M6 52 Q 110 4 214 52"
 stroke="currentColor"
 strokeWidth="14"
 strokeLinecap="round"
 fill="none"
 />
 </svg>
 </span>
 <br />
 Partner
 </h1>
 <ul className="mt-8 space-y-2.5 max-w-[360px] fade-in-up fade-in-up-3">
 {[
 "Filipino crews",
 "Global routes",
 "Zero compromises",
 "Powering 197 vessels",
 ].map((line, i) => (
 <li
 key={i}
 className="flex items-center gap-3 text-[17px] font-semibold"
 >
 <span
 aria-hidden
 className="grid h-6 w-6 place-items-center rounded-full bg-[#15803d] text-white shadow-sm"
 >
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
 <path
 className="check-draw"
 style={{ animationDelay: `${1100 + i * 250}ms` }}
 d="M5 12.5 10 17 19 7"
 stroke="currentColor"
 strokeWidth="3"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 </svg>
 </span>
 <span className="tracking-[-0.01em] text-neutral-800">
 {line}
 </span>
 </li>
 ))}
 </ul>
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
