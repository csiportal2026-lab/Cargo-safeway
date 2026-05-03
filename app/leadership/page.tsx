import Image from "next/image";
import SiteHeader from "../components/SiteHeader";

export default function AboutPage() {
 return (
 <main className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center overflow-x-auto px-4 sm:px-6 py-4 sm:py-6 transition-colors">
 <div className="relative card-canvas w-[1200px] h-[675px] shrink-0 bg-white rounded-3xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors">
 <SiteHeader />

 <section className="relative z-10 flex-1 min-h-0 px-6 sm:px-12 pb-8 pt-2">
 <div className="grid grid-cols-1 lg:grid-cols-[minmax(380px,520px)_1fr] gap-10 lg:gap-16 items-stretch h-full">
 {/* CEO portrait — fills its column edge to edge */}
 <div className="relative w-full h-full z-10 about-split overflow-hidden">
 <Image
 src="/ceo.webp"
 alt="Reynaldo D. Casareo, President"
 fill
 priority
 sizes="(min-width: 1024px) 520px, 100vw"
 className="object-cover object-top"
 />
 </div>

 {/* Message — vertically centered within the stretched column */}
 <div className="relative z-0 flex flex-col justify-center form-reveal">
 <h1 className="text-[clamp(40px,4.6vw,68px)] leading-[1.05] font-extrabold tracking-[-0.025em] text-neutral-900">
 Built on <span className="sweep-text">Trust</span>.
 <br />
 Powered by People.
 </h1>

 <div className="mt-7 space-y-4 text-[clamp(15px,1.25vw,20px)] leading-[1.6] text-neutral-700 max-w-[720px]">
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
 className="text-[clamp(32px,2.8vw,44px)] font-medium text-[#15803d] leading-none"
 style={{ fontFamily: "'Brush Script MT', cursive" }}
 >
 R. D. Casareo
 </span>
 <span className="h-px w-14 bg-neutral-300" />
 <span className="text-[clamp(13px,1vw,15px)] text-neutral-500">
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
