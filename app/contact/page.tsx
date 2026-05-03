import SiteHeader from "../components/SiteHeader";

const ADDRESS_LINES = [
 "Seaborne Bldg.",
 "4203 R. Magsaysay Blvd.",
 "Sta. Mesa, Manila, Philippines, 1016",
];

export default function ContactPage() {
 return (
 <main className="h-screen w-full bg-[#f3f4f6] flex items-stretch justify-center px-4 sm:px-6 py-4 sm:py-6">
 <div className="relative w-full max-w-[1200px] bg-white rounded-3xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors">
 <SiteHeader />

 <section className="relative z-10 flex-1 px-6 sm:px-12 pb-12 pt-2">
 {/* Hero: smaller map beside the address card */}
 <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-5 items-stretch fade-in-up fade-in-up-1">
 {/* Map */}
 <div className="rounded-2xl overflow-hidden border border-[#15803d] h-[420px] lg:h-[520px]">
 <iframe
 title="Cargo Safeway office map"
 src="https://maps.google.com/maps?q=14.6028,121.0099%20(Cargo%20Safeway%20Inc.)&z=17&t=m&output=embed&hl=en"
 className="w-full h-full block"
 style={{ border: 0 }}
 loading="lazy"
 referrerPolicy="no-referrer-when-downgrade"
 />
 </div>

 {/* Address card */}
 <div className="rounded-2xl bg-white ring-1 ring-neutral-200 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.12)] p-6 flex flex-col justify-between">
 <div>
 <h1 className="text-[24px] leading-[1.1] font-extrabold tracking-[-0.02em] text-neutral-900">
 Location
 </h1>
 <div className="mt-3 space-y-0.5 text-[13px] leading-[1.55] text-neutral-700">
 {ADDRESS_LINES.map((l) => (
 <p key={l}>{l}</p>
 ))}
 </div>

 {/* Transit notes */}
 <div className="mt-5 pt-4 border-t border-neutral-200 space-y-2.5">
 <div className="text-[9.5px] font-semibold uppercase tracking-wider text-neutral-500">
 How to Get Here
 </div>
 <div className="flex items-start gap-2.5 text-[12px] text-neutral-700">
 <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#15803d]/10 text-[#15803d]">
 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
 <rect x="5" y="3" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
 <path d="M5 13h14M9 19l-2 2M15 19l2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
 <circle cx="9" cy="16" r="1" fill="currentColor" />
 <circle cx="15" cy="16" r="1" fill="currentColor" />
 </svg>
 </span>
 <span>
 <span className="font-semibold text-neutral-900">By LRT-2:</span>{" "}
 V. Mapa Station, ~5-min walk
 </span>
 </div>
 <div className="flex items-start gap-2.5 text-[12px] text-neutral-700">
 <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#15803d]/10 text-[#15803d]">
 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
 <path d="M3 13h18l-2-6H5l-2 6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
 <path d="M5 13v4M19 13v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
 <circle cx="7.5" cy="17" r="1.4" stroke="currentColor" strokeWidth="1.6" />
 <circle cx="16.5" cy="17" r="1.4" stroke="currentColor" strokeWidth="1.6" />
 </svg>
 </span>
 <span>
 <span className="font-semibold text-neutral-900">By car:</span>{" "}
 Street parking along Magsaysay Blvd
 </span>
 </div>
 <div className="flex items-start gap-2.5 text-[12px] text-neutral-700">
 <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#15803d]/10 text-[#15803d]">
 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
 <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.8" />
 <path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
 </svg>
 </span>
 <span>
 <span className="font-semibold text-neutral-900">Landmarks:</span>{" "}
 Across PUP Sta. Mesa, near Pureza LRT
 </span>
 </div>
 </div>
 </div>

 <div className="mt-5 space-y-3">
 <div className="pt-4 border-t border-neutral-200 space-y-3 text-[11.5px]">
 <div>
 <div className="text-[9.5px] font-semibold uppercase tracking-wider text-neutral-500">
 Office Hours
 </div>
 <div className="mt-0.5 text-neutral-800">
 Mon–Fri · 8AM – 5PM
 </div>
 </div>
 <div>
 <div className="text-[9.5px] font-semibold uppercase tracking-wider text-neutral-500">
 Main Line
 </div>
 <div className="mt-0.5 text-neutral-800">+63 2 8716 5532</div>
 </div>
 </div>

 <a
 href="https://www.google.com/maps/dir/?api=1&destination=Seaborne+Bldg+R.+Magsaysay+Blvd+Sta.+Mesa+Manila"
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center justify-center w-full rounded-full bg-[#15803d] px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-[#126a33] transition-colors"
 >
 Get Directions
 </a>
 </div>
 </div>
 </div>

 </section>
 </div>
 </main>
 );
}
