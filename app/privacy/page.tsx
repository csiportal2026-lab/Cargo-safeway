import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy Policy · Cargo Safeway",
  description:
    "How Cargo Safeway Inc. collects, processes, and protects the personal data you submit through this site.",
};

const COMPANY = "Cargo Safeway Incorporated (CSI)";
const ADDRESS = "Seaborne Bldg., 4203 R. Magsaysay Blvd., Sta. Mesa, Manila, PH 1016";
const EMAIL = "info@cargosafeway.com";
const PHONE = "+63 2 8716 5532";
const LAST_UPDATED = "May 11, 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen w-full bg-white">
      <SiteHeader />

      <article
        className="relative z-10 mx-auto max-w-3xl pb-24"
        style={{
          paddingInline: "clamp(1.25rem, 4vw, 2rem)",
          paddingTop: "clamp(4rem, 12vh, 7rem)",
        }}
      >
        <header className="mb-12">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#15803d]">
            Privacy Policy
          </p>
          <h1 className="mt-3 font-extrabold tracking-tight text-neutral-900" style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", lineHeight: 1.05 }}>
            How we handle your data.
          </h1>
          <p className="mt-4 text-[14px] text-neutral-500">
            Last updated {LAST_UPDATED}
          </p>
        </header>

        <Section title="1. Who we are">
          <p>
            {COMPANY} is the personal information controller (PIC) for the data
            you submit through this site. We are a maritime crewing agency
            registered in the Philippines. We process your information in
            accordance with the{" "}
            <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong>,
            its Implementing Rules and Regulations, and applicable issuances of
            the National Privacy Commission (NPC).
          </p>
          <p className="mt-3">
            <strong>Address:</strong> {ADDRESS}
            <br />
            <strong>Data Protection Officer (DPO):</strong>{" "}
            <a className="text-[#15803d] hover:underline" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
            <br />
            <strong>Phone:</strong> {PHONE}
          </p>
        </Section>

        <Section title="2. What data we collect">
          <p>When you apply through our online form, we collect:</p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              <strong>Identity:</strong> name, sex, date of birth, place of
              birth, nationality, marriage status, height, weight, photo
            </li>
            <li>
              <strong>Contact details:</strong> address, mobile, telephone,
              email, religion
            </li>
            <li>
              <strong>Education &amp; training:</strong> institutions, degrees,
              periods of study
            </li>
            <li>
              <strong>Certificates &amp; documents:</strong> STCW
              endorsements, Certificate of Competency, medical exam date,
              passport, Seaman&apos;s Book, U.S. visa
            </li>
            <li>
              <strong>Sea experience:</strong> previous vessels, ranks, periods
              of service
            </li>
            <li>
              <strong>Family details:</strong> spouse, children, parents,
              siblings (as required by the application form)
            </li>
            <li>
              <strong>Health &amp; language:</strong> fitness-to-work
              disclosures, English / Mandarin proficiency
            </li>
            <li>
              <strong>Uploaded documents:</strong> passport, Seaman&apos;s Book,
              CoC, STCW certificates, medical certificate, CV / resume — if you
              choose to use the AI Smart-Upload feature
            </li>
          </ul>
        </Section>

        <Section title="3. Why we collect it">
          <p>
            We process this information solely to evaluate your application for
            a seafaring role, communicate with you about the recruitment
            process, and meet our obligations as a licensed manning agency
            under Philippine and flag-state regulations.
          </p>
        </Section>

        <Section title="4. Who processes your data">
          <p>
            Your data is handled by {COMPANY} staff involved in recruitment. We
            also share data with the following third-party processors strictly
            to operate this site:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-2">
            <li>
              <strong>Formspree, Inc.</strong> (United States) — receives form
              submissions and forwards them to our recruitment inbox. See{" "}
              <a
                href="https://formspree.io/legal/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#15803d] hover:underline"
              >
                Formspree&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Google LLC (Gemini API)</strong> — if you choose the
              Smart-Upload option, the documents you upload are processed by
              Google Gemini 2.5 to extract fields for your application. Files
              are processed transiently and are not retained for model
              training. See{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#15803d] hover:underline"
              >
                Google&apos;s Privacy Policy
              </a>
              .
            </li>
          </ul>
          <p className="mt-3">
            We do <strong>not</strong> sell your data, and we do not share it
            with any other third party except where required by law or by a
            shipping principal evaluating your application.
          </p>
          <p className="mt-3">
            <strong>Cross-border transfer.</strong> Both Formspree and Google
            are based in the United States, so your submission and any
            uploaded documents leave the Philippines for processing. By
            submitting the application, you consent to this transfer. Both
            providers maintain industry-standard safeguards (HTTPS,
            access controls, contractual data-protection commitments).
          </p>
        </Section>

        <Section title="5. How long we keep it">
          <p>
            Application data is retained for up to <strong>24 months</strong>{" "}
            after your last contact with us, after which it is securely
            deleted. Hired seafarers&apos; records are retained for the
            duration of the employment contract plus any period required by
            applicable maritime regulations.
          </p>
        </Section>

        <Section title="6. Your rights">
          <p>
            Under RA 10173 (Philippines), GDPR (EU/EEA), and CCPA (California),
            you have the right to:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              <strong>Be informed</strong> — know what data we hold, why, and
              how it&apos;s being processed
            </li>
            <li>
              <strong>Access</strong> — request a copy of the personal data we
              hold about you
            </li>
            <li>
              <strong>Correct</strong> — request correction of inaccurate or
              incomplete data
            </li>
            <li>
              <strong>Erase / block</strong> — request deletion (the &quot;right
              to be forgotten&quot;) where the data is no longer necessary
            </li>
            <li>
              <strong>Object</strong> — refuse or withdraw consent for further
              processing, including automated processing
            </li>
            <li>
              <strong>Data portability</strong> — receive your data in a
              structured, commonly used electronic format
            </li>
            <li>
              <strong>File a complaint</strong> — lodge a complaint with the{" "}
              <a
                href="https://privacy.gov.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#15803d] hover:underline"
              >
                National Privacy Commission
              </a>{" "}
              or, if applicable, your local data-protection authority
            </li>
            <li>
              <strong>Damages</strong> — be indemnified for damages sustained
              from inaccurate, false, unlawfully obtained or unauthorized use
              of personal information (RA 10173, §16f)
            </li>
            <li>
              <em>For California residents:</em> opt out of the &quot;sale&quot;
              or &quot;sharing&quot; of personal information. We do not sell or
              share your data for cross-context behavioral advertising.
            </li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, email our Data Protection Officer
            at{" "}
            <a className="text-[#15803d] hover:underline" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>{" "}
            with the subject &quot;Data Request.&quot; We will respond within
            30 days.
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            Submissions travel to our forms provider over HTTPS. Uploaded
            documents are transmitted to the Google Gemini API over encrypted
            channels. We restrict internal access to your data to staff who
            need it for recruitment decisions.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            This site uses{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[13px]">
              localStorage
            </code>{" "}
            to autosave your application draft so you can return to it later.
            We do not use third-party analytics or advertising cookies.
          </p>
        </Section>

        <Section title="9. Changes to this policy">
          <p>
            We may update this policy from time to time. The &quot;Last
            updated&quot; date at the top of the page reflects the most recent
            revision. Material changes will be highlighted on the site.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            For any privacy-related question, write to our Data Protection
            Officer at{" "}
            <a className="text-[#15803d] hover:underline" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>{" "}
            or visit our office at the address above.
          </p>
        </Section>

        <div className="mt-16 border-t border-neutral-200 pt-8">
          <Link
            href="/inquire"
            className="text-[14px] font-medium text-[#15803d] hover:underline"
          >
            ← Back to careers
          </Link>
        </div>
      </article>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0 text-[15px] leading-relaxed text-neutral-700">
      <h2 className="mb-3 text-[18px] font-bold tracking-tight text-neutral-900">
        {title}
      </h2>
      {children}
    </section>
  );
}
