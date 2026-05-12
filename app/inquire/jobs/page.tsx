import { Anton, Inter } from "next/font/google";
import SiteHeader from "../../components/SiteHeader";
import { jobs } from "./jobsData";
import JobsExperience from "./JobsExperience";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-billboard",
  display: "swap",
});

export default function JobsPage() {
  return (
    <main
      className={`${anton.variable} ${inter.variable} min-h-screen w-full flex items-stretch justify-stretch`}
    >
      <div
        className="relative card-canvas w-full flex flex-col transition-colors"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 100% 0%, rgba(21,128,61,0.18), transparent 60%), radial-gradient(ellipse 70% 60% at 0% 100%, rgba(34,197,94,0.14), transparent 60%), linear-gradient(180deg, #f0faf3 0%, #fafaf7 60%)",
        }}
      >
        <SiteHeader />

        <section
          className="relative z-0 flex-1"
          style={{
            paddingInline: "clamp(1rem, 3vw, 2.5rem)",
            paddingTop: "clamp(1.5rem, 3vw, 3rem)",
            paddingBottom: "clamp(1.5rem, 3vw, 3rem)",
          }}
        >
          <div className="mx-auto" style={{ maxWidth: "min(1320px, 100%)" }}>
            <JobsExperience jobs={jobs} />
          </div>
        </section>
      </div>
    </main>
  );
}
