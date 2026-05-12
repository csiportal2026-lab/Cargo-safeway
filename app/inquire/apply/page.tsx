import SiteHeader from "../../components/SiteHeader";
import ApplyForm from "./ApplyForm";
import NauticalCorners from "./NauticalCorners";
import { getJob } from "../jobs/jobsData";

export default async function InquireApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const { job: jobSlug } = await searchParams;
  const job = jobSlug ? (getJob(jobSlug) ?? null) : null;

  return (
    <main
      className="relative min-h-screen w-full bg-white flex flex-col"
      style={{
        background: `
          radial-gradient(ellipse 90% 55% at 100% 0%, rgba(21,128,61,0.08), transparent 60%),
          radial-gradient(ellipse 80% 60% at 0% 100%, rgba(34,197,94,0.07), transparent 60%),
          radial-gradient(ellipse 85% 55% at 100% 100%, rgba(21,128,61,0.05), transparent 60%),
          linear-gradient(160deg, #fafdfb 0%, #f5faf6 60%, #eff7f1 100%)
        `,
      }}
    >
      <NauticalCorners />
      <SiteHeader />

      <section
        className="relative z-10 flex-1 flex flex-col"
        style={{
          paddingInline: "clamp(1.25rem, 5vw, 5rem)",
          paddingTop: "clamp(5.5rem, 8vw, 8rem)",
          paddingBottom: "clamp(2rem, 4vw, 3rem)",
        }}
      >
        <div className="mx-auto w-full" style={{ maxWidth: "min(1280px, 100%)" }}>
          <ApplyForm job={job} />
        </div>
      </section>
    </main>
  );
}
