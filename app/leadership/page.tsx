import Image from "next/image";
import SiteHeader from "../components/SiteHeader";

export default function AboutPage() {
 return (
 <main className="min-h-screen w-full flex items-stretch justify-stretch transition-colors">
 <div className="relative card-canvas w-full bg-white flex flex-col transition-colors">
 <SiteHeader />

 <section
 className="relative z-10 flex-1 min-h-0"
 style={{
 paddingInline: "clamp(1.25rem, 4vw, 4rem)",
 paddingTop: "var(--space-2)",
 paddingBottom: "var(--space-6)",
 }}
 >
 <div
 className="grid grid-cols-1 lg:grid-cols-[minmax(20rem,28%)_1fr] items-stretch h-full"
 style={{ gap: "clamp(1.5rem, 3vw, 4rem)" }}
 >
 {/* CEO portrait — entire image visible, scaled to fit */}
 <div
 className="relative w-full h-[clamp(16rem,38vw,24rem)] lg:h-full z-10 about-split overflow-hidden flex items-center justify-center"
 >
 <Image
 src="/ceo.webp"
 alt="Reynaldo D. Casareo, President"
 fill
 priority
 sizes="(min-width: 1024px) 28vw, 100vw"
 className="object-contain object-center scale-[0.92]"
 />
 </div>

 {/* Message — vertically centered within the stretched column */}
 <div
 className="relative z-0 flex flex-col justify-center form-reveal"
 style={{ paddingLeft: "clamp(0px, 2vw, 2.5rem)" }}
 >
 {/* Decorative quote glyph — frames the letter without imagery */}
 <span
 aria-hidden
 className="pointer-events-none absolute leading-none font-serif text-[#15803d]/[0.07] select-none"
 style={{
 top: "clamp(-3rem, -2vw, -1.5rem)",
 left: "clamp(2.5rem, 3vw, 3.5rem)",
 fontSize: "clamp(8rem, 11vw, 14rem)",
 }}
 >
 &ldquo;
 </span>
 <span
 className="relative inline-block font-semibold uppercase text-[#15803d] fade-in-up fade-in-up-1"
 style={{
 fontSize: "clamp(0.6875rem, 0.4vw + 0.55rem, 0.875rem)",
 letterSpacing: "0.22em",
 marginBottom: "var(--space-3)",
 }}
 >
 From the President
 </span>
 <h1
 className="leading-[1.05] font-extrabold tracking-[-0.025em] text-neutral-900"
 style={{ fontSize: "clamp(2rem, 4.5vw + 0.5rem, 5rem)" }}
 >
 Built on <span className="sweep-text">Trust</span>.
 <br />
 Powered by People.
 </h1>

 <div
 className="text-neutral-700"
 style={{
 marginTop: "var(--space-6)",
 fontSize: "clamp(0.9375rem, 0.6vw + 0.75rem, 1.25rem)",
 lineHeight: 1.6,
 maxWidth: "min(80ch, 100%)",
 display: "flex",
 flexDirection: "column",
 gap: "var(--space-4)",
 }}
 >
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

 <div
 className="flex items-center blur-in-4"
 style={{ marginTop: "var(--space-8)", gap: "var(--space-4)" }}
 >
 <span
 className="font-medium text-[#15803d] leading-none"
 style={{
 fontFamily: "'Brush Script MT', cursive",
 fontSize: "clamp(2rem, 3vw + 0.8rem, 4rem)",
 }}
 >
 R. D. Casareo
 </span>
 <span
 className="bg-neutral-300"
 style={{ height: "1px", width: "clamp(2.5rem, 3vw, 4rem)" }}
 />
 <span
 className="text-neutral-500"
 style={{ fontSize: "clamp(0.75rem, 0.4vw + 0.6rem, 1rem)" }}
 >
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
