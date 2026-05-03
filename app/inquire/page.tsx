import SiteHeader from "../components/SiteHeader";
import InquireForm from "./InquireForm";

export default function InquirePage() {
 return (
 <main className="h-screen w-full bg-[#f3f4f6] flex items-stretch justify-center px-4 sm:px-6 py-4 sm:py-6">
 <div className="relative w-full max-w-[1600px] bg-white rounded-3xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors">
 <SiteHeader />

 <section className="relative z-10 flex-1 px-6 sm:px-12 pb-14 pt-0">
 <div className="rounded-3xl bg-white p-2 sm:p-4 pt-0">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
 {/* Left: form card */}
 <div className="rounded-3xl bg-white border border-[#15803d] p-5 sm:p-8 min-h-[470px] flex flex-col fade-in-up fade-in-up-1">
 <InquireForm />
 </div>

 {/* Right: copy + contact details */}
 <div className="flex flex-col justify-center px-2 sm:px-4 fade-in-up fade-in-up-2">
 <h1 className="text-[34px] sm:text-[42px] leading-[1.05] font-extrabold tracking-[-0.02em] text-neutral-900">
 Let&apos;s Chart Your
 <br />
 Next Voyage.
 </h1>

 <p className="mt-4 max-w-[520px] text-[14px] leading-relaxed text-neutral-600">
 Tell us about your seafaring experience and the position
 you&apos;re applying for — our crewing team will reach out within
 24 hours.
 </p>

 <div className="mt-7 flex flex-col gap-1.5 max-w-[520px]">
 <ContactItem
 icon={<IconPhone />}
 label="+63 287165532"
 />
 <ContactItem
 icon={<IconClock />}
 label="Mon–Fri 8:00am – 5:00pm PHT"
 />
 <ContactItem
 icon={<IconMail />}
 label="crewing@cargosafewayinc.com"
 />
 <ContactItem
 icon={<IconPin />}
 label="Sta. Mesa, Manila, PH"
 />
 </div>
 </div>
 </div>
 </div>
 </section>
 </div>
 </main>
 );
}

function ContactItem({ icon, label }: { icon: React.ReactNode; label: string }) {
 return (
 <div className="group flex items-center gap-3 text-[13px] text-neutral-800">
 <span className="grid h-12 w-12 shrink-0 place-items-center text-[#15803d] transition-transform duration-200 ease-out group-hover:scale-150">
 {icon}
 </span>
 <span className="leading-snug">{label}</span>
 </div>
 );
}

function IconPhone() {
 return (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
 <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
 </svg>
 );
}

function IconClock() {
 return (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
 <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
 <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
 </svg>
 );
}

function IconMail() {
 return (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
 <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
 <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
 </svg>
 );
}

function IconPin() {
 return (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
 <path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
 <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
 </svg>
 );
}
