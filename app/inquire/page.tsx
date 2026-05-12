import { Anton, Inter, Space_Grotesk } from "next/font/google";
import SiteHeader from "../components/SiteHeader";
import Testimonials from "./Testimonials";
import ReadyToSignOn from "./ReadyToSignOn";
import ScrollSection from "./ScrollSection";
import HeroManifesto from "./HeroManifesto";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-headline",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-button",
  display: "swap",
});

export default function InquireWelcomePage() {
  return (
    <main className={`${anton.variable} ${spaceGrotesk.variable} ${inter.variable} min-h-screen w-full flex items-stretch justify-stretch`}>
      <div className="relative card-canvas w-full bg-white flex flex-col transition-colors">
        {/* Gradient wallpaper — multiple soft emerald/teal blobs distributed
            across the viewport and fixed in place so content scrolls over
            it. Stack of radial-gradients composes into one backdrop. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background: `
              radial-gradient(ellipse 70% 55% at 12% 5%, rgba(21, 128, 61, 0.18), transparent 60%),
              radial-gradient(ellipse 60% 50% at 92% 12%, rgba(34, 197, 94, 0.14), transparent 60%),
              radial-gradient(ellipse 65% 55% at 18% 55%, rgba(16, 185, 129, 0.10), transparent 60%),
              radial-gradient(ellipse 70% 55% at 95% 65%, rgba(20, 184, 166, 0.10), transparent 60%),
              radial-gradient(ellipse 55% 45% at 45% 100%, rgba(74, 222, 128, 0.12), transparent 60%)
            `,
          }}
        />
        <SiteHeader />

        {/* HERO — full viewport, content centered as a single block:
            headline + manifesto + trust avatars all visible together. */}
        <section
          className="relative z-10 flex flex-col items-center justify-center text-center"
          style={{
            paddingInline: "clamp(1.25rem, 4vw, 4rem)",
            paddingTop: "clamp(2rem, 4vw, 3rem)",
            paddingBottom: "clamp(2rem, 4vw, 3rem)",
            gap: "clamp(1.25rem, 2.5vw, 2rem)",
            minHeight: "100dvh",
          }}
        >
          <h1
            className="relative z-10 leading-[1.05] font-extrabold tracking-[-0.02em] text-neutral-900 text-center"
            style={{ fontSize: "clamp(2rem, 4.5vw + 0.5rem, 4.75rem)" }}
          >
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
                className="absolute left-0 right-0 w-[92%] text-[#15803d] overflow-visible"
                style={{ height: "0.5em", bottom: "-0.2em" }}
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

          <HeroManifesto />
        </section>

        {/* TESTIMONIALS — full-viewport, scroll-linked fade-up */}
        <ScrollSection
          className="relative z-10 flex flex-col justify-center"
          style={{
            paddingInline: "clamp(1.25rem, 4vw, 4rem)",
            paddingTop: "clamp(4rem, 8vw, 7rem)",
            paddingBottom: "clamp(4rem, 8vw, 7rem)",
            minHeight: "100dvh",
          }}
        >
          <div className="max-w-[68rem] mx-auto flex flex-col items-center text-center" style={{ gap: "var(--space-3)" }}>
            <h2
              className="font-extrabold tracking-tight text-neutral-900"
              style={{
                fontSize: "clamp(2.25rem, 3.5vw + 1rem, 4.25rem)",
                lineHeight: 1.05,
              }}
            >
              Hear from seafarers who sail with us.
            </h2>
          </div>
          <div className="max-w-[72rem] mx-auto w-full" style={{ marginTop: "clamp(3rem, 6vw, 5rem)" }}>
            <Testimonials />
          </div>
        </ScrollSection>

        {/* FINAL CTA — full-viewport section with scroll-linked reveal */}
        <ReadyToSignOn />
      </div>
    </main>
  );
}
