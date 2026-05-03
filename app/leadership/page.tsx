import Image from "next/image";
import SiteHeader from "../components/SiteHeader";

export default function AboutPage() {
 return (
 <main className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6 transition-colors">
 <div className="relative card-canvas w-full max-w-[1200px] lg:w-[1123px] lg:h-[632px] lg:shrink-0 bg-white rounded-3xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors">
 <SiteHeader />

 <section
 className="relative z-10 flex-1 min-h-0 px-6 sm:px-12 pb-8 pt-2 lg:[zoom:0.9]"
 >
 <div className="grid grid-cols-1 lg:grid-cols-[minmax(308px,421px)_1fr] gap-8 lg:gap-0 items-stretch h-full">
 {/* CEO portrait — entire image visible, scaled to fit */}
 <div className="relative w-full h-72 sm:h-80 lg:h-full z-10 about-split overflow-hidden flex items-center justify-center">
 <Image
 src="/ceo.webp"
 alt="Reynaldo D. Casareo, President"
 fill
 priority
 sizes="(min-width: 1024px) 360px, 100vw"
 className="object-contain object-center scale-[0.92]"
 />
 </div>

 {/* Message — vertically centered within the stretched column */}
 <div className="relative z-0 flex flex-col justify-center form-reveal lg:pl-16">
 {/* Decorative quote glyph — frames the letter without imagery */}
 <span
 aria-hidden
 className="pointer-events-none absolute -top-6 left-12 lg:left-14 text-[180px] leading-none font-serif text-[#15803d]/[0.07] select-none"
 >
 &ldquo;
 </span>
 <span className="relative inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#15803d] mb-3 fade-in-up fade-in-up-1">
 From the President
 </span>
 <h1 className="text-[36px] sm:text-[44px] lg:text-[60px] leading-[1.05] font-extrabold tracking-[-0.025em] text-neutral-900">
 Built on <span className="sweep-text">Trust</span>.
 <br />
 Powered by People.
 </h1>

 <div className="mt-7 space-y-4 text-[17px] leading-[1.6] text-neutral-700 max-w-[720px]">
 <p className="blur-in-1">
 Cargo Safeway began with a single conviction — that the
 Filipino seafarer is among the finest in the world, and
 deserves a manning partner that meets that standard in every
 detail.
 </p>
 <p className="blur-in-2">
 Over the years, we have grown from a standard manning agency
 into a specialized partner for high-tier shipping lines,
 focusing on the deployment of skilled Filipino crew aboard
 container ships and bulk carriers. That growth has only ever
 meant one thing to me: more lives entrusted to our care, and
 a higher standard to live up to.
 </p>
 <p className="blur-in-3">
 To the principals who place their fleets in our hands, and to
 the seafarers who carry our name across every ocean — thank
 you. We sail because of you.
 </p>
 </div>

 <div className="mt-9 flex items-center gap-5 blur-in-4">
 <span
 className="text-[38px] font-medium text-[#15803d] leading-none"
 style={{ fontFamily: "'Brush Script MT', cursive" }}
 >
 R. D. Casareo
 </span>
 <span className="h-px w-14 bg-neutral-300" />
 <span className="text-[14px] text-neutral-500">
 Reynaldo D. Casareo, President
 </span>
 </div>
 </div>
 </div>
 </section>
 </div>
 </main>
 );
}
