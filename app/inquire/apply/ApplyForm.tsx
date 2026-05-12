"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useFormState,
  type FieldPath,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DayPicker } from "react-day-picker";
import AIQuickFill from "./AIQuickFill";
import {
  applicationSchema,
  certificatesSchema,
  contactSchema,
  emptyExperienceRow,
  emptyKindredRow,
  healthSchema,
  identitySchema,
  KINDRED_TITLES_MARRIED,
  KINDRED_TITLES_SINGLE,
  kindredSchema,
  languageSchema,
  PHOTO_CONSTRAINTS,
  PHOTO_SESSION_KEY,
  seaExperienceSchema,
  SECTIONS,
  STORAGE_KEY,
  travelDocsSchema,
  type ApplicationValues,
} from "./applicationSchema";
import type { Job } from "../jobs/jobsData";
import {
  COUNTRIES,
  NATIONALITIES,
  NATIONALITY_TO_COUNTRY,
  PH_PROVINCES,
  RELIGIONS,
} from "./suggestions";

/* ─────────── AI-filled tracking ───────────
 * Set of field names that came from Gemini extraction. Fields stay flagged
 * until the user edits them (dirtyFields). Provider lives in ApplyForm so
 * the gate (AIQuickFill) and the form share one source of truth.
 */
const AIFilledContext = createContext<{
  fields: Set<string>;
  mark: (keys: string[]) => void;
}>({ fields: new Set(), mark: () => {} });

export function useAIFilled() {
  return useContext(AIFilledContext);
}

/* Set of field names currently flagged as required-but-missing in any section
 * whose "Still missing" warning is active. FloatField + SelectField consume
 * this to paint their border red. */
const MissingFieldsContext = createContext<Set<string>>(new Set());

export function useIsFieldMissing(name: string): boolean {
  return useContext(MissingFieldsContext).has(name);
}

const defaultApplication: ApplicationValues = {
  surname: "",
  firstName: "",
  middleName: "",
  sex: "MALE",
  height: "",
  weight: "",
  nationality: "Filipino",
  birthDate: "",
  birthPlace: "",
  marriage: "UNMARRIED",
  addressStreet: "",
  addressCity: "",
  addressProvince: "",
  addressPostalCode: "",
  addressCountry: "Philippines",
  tel: "",
  mobile: "",
  email: "",
  religion: "",
  // Qualifications — Education
  eduInstitution: "",
  eduDepartment: "",
  eduPeriodFrom: "",
  eduPeriodTo: "",
  eduDegree: "",
  // Qualifications — Training (optional)
  trainingInstitution: "",
  trainingDepartment: "",
  trainingPeriodFrom: "",
  trainingPeriodTo: "",
  trainingDegree: "",
  // STCW Certificates
  stcwBasicTraining: false,
  stcwSurvivalCraft: false,
  stcwAdvancedFireFighting: false,
  stcwMedicalFirstAid: false,
  stcwMedicalCare: false,
  stcwSecurityAwareness: false,
  stcwShipSecurityOfficer: false,
  stcwShipsCookCert: false,
  stcwYellowFever: false,
  stcwEcdis: false,
  stcwRadarArpa: false,
  stcwBrmErm: false,
  // Native CoC
  nativeCocCapacity: "",
  nativeCocNumber: "",
  nativeCocDateIssued: "",
  nativeCocDateExpired: "",
  // Other Cert
  otherCertCapacity: "",
  otherCertNumber: "",
  otherCertDateIssued: "",
  otherCertDateExpired: "",
  // Medical
  medicalExamDate: "",
  // Travel docs
  seamansBookNumber: "",
  seamansBookDateIssued: "",
  seamansBookDateExpired: "",
  passportNumber: "",
  passportDateIssued: "",
  passportDateExpired: "",
  usVisaNumber: "",
  usVisaDateIssued: "",
  usVisaDateExpired: "",
  // Sea experience — start with one empty row so users can begin typing.
  experience: [
    {
      agencyVessel: "",
      rank: "",
      vesselType: "",
      machine: "",
      gt: "",
      hp: "",
      periodFrom: "",
      periodTo: "",
    },
  ],
  // Kindred — start with one empty row.
  kindred: [
    {
      title: "",
      name: "",
      birthDate: "",
      status: "",
      eduDegree: "",
      occupation: "",
    },
  ],
  // Health — empty until user picks.
  hasInjury: "" as unknown as "YES" | "NO",
  injuryDescription: "",
  agreeRankAdjust: "" as unknown as "YES" | "NO",
  // Language — empty until user picks.
  englishProficiency: "" as unknown as "EXCELLENT",
  englishTest: "",
  englishTestScore: "",
  mandarinProficiency: "" as unknown as "EXCELLENT",
};

type PhotoState = { file: File; previewUrl: string } | null;

export default function ApplyForm({ job }: { job: Job | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Honor ?step=N when arriving from the review page's Edit pencil.
  const stepFromUrl = (() => {
    const raw = searchParams?.get("step");
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) && n >= 1 && n <= SECTIONS.length ? n : 1;
  })();
  const [step, setStep] = useState(stepFromUrl);

  // Gate: the AI Quick-Fill chooser screen renders before the form. The
  // form itself only appears once the user picks "Upload" (after demo) or
  // "Manual". A `?step=N` deep link skips the gate.
  const [started, setStarted] = useState(stepFromUrl > 1);

  // Tell the SiteHeader whether the user is on the gate (AI Quick-Fill) or
  // the actual form. The header only shows the violet + red legend dots
  // when the form is visible. CustomEvents are the lightest cross-tree
  // signal (header and form live in different React subtrees).
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("cs-apply-form-state", { detail: { started } }),
    );
  }, [started]);
  useEffect(() => {
    return () => {
      if (typeof window === "undefined") return;
      window.dispatchEvent(
        new CustomEvent("cs-apply-form-state", { detail: { started: false } }),
      );
    };
  }, []);

  const methods = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: defaultApplication,
    mode: "onChange",
  });

  /* Restore draft on mount */
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<ApplicationValues>;
      methods.reset({ ...defaultApplication, ...parsed });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [methods]);

  /* Autosave on change */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const sub = methods.watch((value) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        } catch {}
      }, 600);
    });
    return () => {
      if (timer) clearTimeout(timer);
      sub.unsubscribe();
    };
  }, [methods]);

  const [photo, setPhoto] = useState<PhotoState>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Persist photo as a data URL whenever it changes — sessionStorage carries it
  // across the navigation to the review page (File objects don't survive nav).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!photo?.file) {
      try {
        window.sessionStorage.removeItem(PHOTO_SESSION_KEY);
      } catch {}
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        window.sessionStorage.setItem(
          PHOTO_SESSION_KEY,
          JSON.stringify({
            dataUrl: reader.result,
            name: photo.file.name,
            type: photo.file.type,
          }),
        );
      } catch {}
    };
    reader.readAsDataURL(photo.file);
  }, [photo]);

  function goToReview() {
    const qs = job?.slug ? `?job=${encodeURIComponent(job.slug)}` : "";
    router.push(`/inquire/apply/review${qs}`);
  }

  // Watch all values so per-section validators re-run on every change.
  const allValues = methods.watch();

  // Subscribe to touchedFields — fields the user has focused-then-blurred.
  // Cleared on `methods.reset()` (incl. the AI-fill reset), so this only
  // tracks genuine user interaction, not AI pre-fill.
  const { touchedFields } = useFormState({ control: methods.control });

  // Auto-fill the country whenever the user CHANGES nationality to one of
  // the mapped values (e.g. Filipino → Philippines). Only fires on the
  // transition into the matched value, so the user can still override the
  // country afterwards without it being clobbered.
  const prevNationalityRef = useRef(allValues.nationality);
  useEffect(() => {
    const cur = (allValues.nationality ?? "").trim();
    const prev = (prevNationalityRef.current ?? "").trim();
    prevNationalityRef.current = cur;
    if (cur === prev) return;
    const target = NATIONALITY_TO_COUNTRY[cur];
    if (target && allValues.addressCountry !== target) {
      methods.setValue("addressCountry", target, {
        shouldValidate: true,
        shouldTouch: true,
        shouldDirty: true,
      });
    }
  }, [allValues.nationality, allValues.addressCountry, methods]);

  // Per-section readiness — each section validates ONLY its own fields.
  const section1Ready =
    identitySchema.safeParse(allValues).success && !!photo;
  const section2Ready = contactSchema.safeParse(allValues).success;
  // Education-only — Training is its own (optional) section now.
  const section3Ready =
    !!allValues.eduInstitution.trim() &&
    !!allValues.eduDegree.trim() &&
    /^\d{4}-\d{2}-\d{2}$/.test(allValues.eduPeriodFrom) &&
    /^\d{4}-\d{2}-\d{2}$/.test(allValues.eduPeriodTo);
  // Training is optional — no auto-advance gate; user clicks Skip / Continue.
  const section4Ready = false;
  // Certificates (STCW + CoC) — no hard schema requirements, so user clicks
  // Continue when they're done reviewing checkboxes.
  const section5Ready = false;
  const section6Ready = /^\d{4}-\d{2}-\d{2}$/.test(
    allValues.medicalExamDate ?? "",
  );
  const section7Ready = travelDocsSchema.safeParse(allValues).success;
  const section8Ready = seaExperienceSchema.safeParse(allValues).success;
  const section9Ready = kindredSchema.safeParse(allValues).success;
  const section10Ready =
    healthSchema.safeParse(allValues).success &&
    (allValues.hasInjury === "NO" ||
      (allValues.hasInjury === "YES" &&
        (allValues.injuryDescription ?? "").trim() !== ""));
  const section11Ready = languageSchema.safeParse(allValues).success;

  // Final-step readiness for the "Next: Review" button — every required
  // section must be valid. Training (4) and Certificates (5) have no hard
  // schema gate (no required fields), so they're excluded.
  const allReady =
    section1Ready &&
    section2Ready &&
    section3Ready &&
    section6Ready &&
    section7Ready &&
    section8Ready &&
    section9Ready &&
    section10Ready &&
    section11Ready;

  // Per-section readiness map (1-indexed; 0 is unused) — used by the
  // disabled-Review tooltip and the scroll-to-first-incomplete handler.
  const sectionReady: Record<number, boolean> = {
    1: section1Ready,
    2: section2Ready,
    3: section3Ready,
    4: true, // optional, never blocks
    5: true, // optional, never blocks
    6: section6Ready,
    7: section7Ready,
    8: section8Ready,
    9: section9Ready,
    10: section10Ready,
    11: section11Ready,
  };

  // Compute the list of human-readable missing field labels per section.
  // Used to (a) drive the inline "Still missing: …" hint that appears once
  // the user has started filling a section but stopped early, and (b)
  // populate the disabled-button tooltip.
  function getSectionMissing(n: number): string[] {
    const v = allValues;
    const m: string[] = [];
    const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
    switch (n) {
      case 1:
        if (!v.surname.trim()) m.push("Surname");
        if (!v.firstName.trim()) m.push("First Name");
        if (!isDate(v.birthDate)) m.push("Birth Date");
        if (!v.birthPlace.trim()) m.push("Birth Place");
        if (!v.nationality.trim()) m.push("Nationality");
        if (!v.height.trim()) m.push("Height");
        if (!v.weight.trim()) m.push("Weight");
        if (!photo) m.push("Photo");
        break;
      case 2:
        if (!v.addressStreet.trim()) m.push("Street Address");
        if (!v.addressCity.trim()) m.push("City");
        if (!v.addressProvince.trim()) m.push("Province");
        if (!v.addressPostalCode.trim()) m.push("Postal Code");
        if (!v.addressCountry.trim()) m.push("Country");
        if (!v.mobile.trim()) m.push("Mobile");
        if (!v.email.trim()) m.push("Email");
        if (!v.religion.trim()) m.push("Religion");
        break;
      case 3:
        if (!v.eduInstitution.trim()) m.push("Institution");
        if (!v.eduDegree.trim()) m.push("Degree");
        if (!isDate(v.eduPeriodFrom)) m.push("Period From");
        if (!isDate(v.eduPeriodTo)) m.push("Period To");
        break;
      case 6:
        if (!isDate(v.medicalExamDate ?? "")) m.push("Medical Exam Date");
        break;
      case 7:
        if (!v.seamansBookNumber.trim()) m.push("Seaman's Book Number");
        if (!isDate(v.seamansBookDateIssued)) m.push("Seaman's Book Date Issued");
        if (!isDate(v.seamansBookDateExpired)) m.push("Seaman's Book Date Expired");
        if (!v.passportNumber.trim()) m.push("Passport Number");
        if (!isDate(v.passportDateIssued)) m.push("Passport Date Issued");
        if (!isDate(v.passportDateExpired)) m.push("Passport Date Expired");
        break;
      case 8:
        if (
          !v.experience.some(
            (r) =>
              r.agencyVessel.trim() &&
              r.rank.trim() &&
              r.vesselType.trim() &&
              isDate(r.periodFrom) &&
              isDate(r.periodTo),
          )
        )
          m.push("At least one complete entry");
        break;
      case 9:
        if (v.kindred.length === 0) m.push("At least one kindred entry");
        break;
      case 10:
        if (!v.hasInjury) m.push("Injury question");
        if (
          v.hasInjury === "YES" &&
          !(v.injuryDescription ?? "").trim()
        )
          m.push("Injury description");
        if (!v.agreeRankAdjust) m.push("Rank-adjust question");
        break;
      case 11:
        if (!v.englishProficiency) m.push("English Proficiency");
        // Mandarin is optional — not flagged as missing.
        break;
    }
    return m;
  }

  // Has the user filled ANY required field in this section? Drives whether
  // we show the "Still missing" hint — empty sections shouldn't nag.
  function sectionHasAnyContent(n: number): boolean {
    const v = allValues;
    switch (n) {
      case 1:
        return (
          !!v.surname.trim() ||
          !!v.firstName.trim() ||
          !!v.birthDate ||
          !!v.birthPlace.trim() ||
          !!v.height.trim() ||
          !!v.weight.trim() ||
          !!photo
        );
      case 2:
        return (
          !!v.addressStreet.trim() ||
          !!v.addressCity.trim() ||
          !!v.mobile.trim() ||
          !!v.email.trim()
        );
      case 3:
        return (
          !!v.eduInstitution.trim() ||
          !!v.eduDegree.trim() ||
          !!v.eduPeriodFrom ||
          !!v.eduPeriodTo
        );
      case 6:
        return !!v.medicalExamDate;
      case 7:
        return (
          !!v.seamansBookNumber.trim() ||
          !!v.passportNumber.trim() ||
          !!v.seamansBookDateIssued ||
          !!v.passportDateIssued
        );
      case 8:
        return v.experience.some(
          (r) => r.agencyVessel.trim() || r.rank.trim(),
        );
      case 9:
        return v.kindred.some((k) => k.name.trim());
      case 10:
        return !!v.hasInjury || !!v.agreeRankAdjust;
      case 11:
        return !!v.englishProficiency || !!v.mandarinProficiency;
      default:
        return false;
    }
  }

  // Map a field path to its owning section number. Drives "user has attempted
  // section N" detection — we only show a section's missing-fields warning
  // once the user has touched a field in a later section.
  function fieldToSection(name: string): number {
    if (name.startsWith("experience.")) return 8;
    if (name.startsWith("kindred.")) return 9;
    if (
      name.startsWith("stcw") ||
      name.startsWith("nativeCoc") ||
      name.startsWith("otherCert")
    )
      return 5;
    if (name.startsWith("training")) return 4;
    if (name.startsWith("edu")) return 3;
    if (
      name.startsWith("address") ||
      name === "tel" ||
      name === "mobile" ||
      name === "email" ||
      name === "religion"
    )
      return 2;
    if (
      name.startsWith("passport") ||
      name.startsWith("seamansBook") ||
      name.startsWith("usVisa")
    )
      return 7;
    if (name === "medicalExamDate") return 6;
    if (
      name === "hasInjury" ||
      name === "injuryDescription" ||
      name === "agreeRankAdjust"
    )
      return 10;
    if (name.startsWith("english") || name.startsWith("mandarin")) return 11;
    // Everything else (surname, firstName, middleName, sex, marriage,
    // birthDate, birthPlace, nationality, height, weight) is Identity.
    return 1;
  }

  // Highest section number the user has focused/blurred at least one field in.
  // Photo upload counts as Section 1 interaction. AI-filled values don't count
  // because reset() clears touchedFields. 0 means "user hasn't touched anything
  // yet — show no warnings."
  const maxAttemptedSection = (() => {
    let max = photo ? 1 : 0;
    function walk(obj: unknown, prefix: string) {
      if (!obj || typeof obj !== "object") return;
      for (const k of Object.keys(obj as Record<string, unknown>)) {
        const v = (obj as Record<string, unknown>)[k];
        const path = prefix ? `${prefix}.${k}` : k;
        if (v === true) {
          const n = fieldToSection(path);
          if (n > max) max = n;
        } else if (v && typeof v === "object") {
          walk(v, path);
        }
      }
    }
    walk(touchedFields, "");
    return max;
  })();

  // A section's "Still missing" hint only surfaces once the user has moved on
  // to a later section — keeps the form from nagging while you're still
  // typing in the current section.
  function showMissingFor(n: number): boolean {
    return n < maxAttemptedSection && !sectionReady[n];
  }

  // Parallel to getSectionMissing — returns the actual RHF field NAMES of any
  // required fields currently missing/invalid in section n. Drives per-field
  // red-border highlighting in FloatField/SelectField.
  function getSectionMissingFieldNames(n: number): string[] {
    const v = allValues;
    const m: string[] = [];
    const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
    switch (n) {
      case 1:
        if (!v.surname.trim()) m.push("surname");
        if (!v.firstName.trim()) m.push("firstName");
        if (!isDate(v.birthDate)) m.push("birthDate");
        if (!v.birthPlace.trim()) m.push("birthPlace");
        if (!v.nationality.trim()) m.push("nationality");
        if (!v.height.trim()) m.push("height");
        if (!v.weight.trim()) m.push("weight");
        break;
      case 2:
        if (!v.addressStreet.trim()) m.push("addressStreet");
        if (!v.addressCity.trim()) m.push("addressCity");
        if (!v.addressProvince.trim()) m.push("addressProvince");
        if (!v.addressPostalCode.trim()) m.push("addressPostalCode");
        if (!v.addressCountry.trim()) m.push("addressCountry");
        if (!v.mobile.trim()) m.push("mobile");
        if (!v.email.trim()) m.push("email");
        if (!v.religion.trim()) m.push("religion");
        break;
      case 3:
        if (!v.eduInstitution.trim()) m.push("eduInstitution");
        if (!v.eduDegree.trim()) m.push("eduDegree");
        if (!isDate(v.eduPeriodFrom)) m.push("eduPeriodFrom");
        if (!isDate(v.eduPeriodTo)) m.push("eduPeriodTo");
        break;
      case 6:
        if (!isDate(v.medicalExamDate ?? "")) m.push("medicalExamDate");
        break;
      case 7:
        if (!v.seamansBookNumber.trim()) m.push("seamansBookNumber");
        if (!isDate(v.seamansBookDateIssued))
          m.push("seamansBookDateIssued");
        if (!isDate(v.seamansBookDateExpired))
          m.push("seamansBookDateExpired");
        if (!v.passportNumber.trim()) m.push("passportNumber");
        if (!isDate(v.passportDateIssued)) m.push("passportDateIssued");
        if (!isDate(v.passportDateExpired)) m.push("passportDateExpired");
        break;
      case 10:
        if (!v.hasInjury) m.push("hasInjury");
        if (
          v.hasInjury === "YES" &&
          !(v.injuryDescription ?? "").trim()
        )
          m.push("injuryDescription");
        if (!v.agreeRankAdjust) m.push("agreeRankAdjust");
        break;
      case 11:
        if (!v.englishProficiency) m.push("englishProficiency");
        break;
    }
    return m;
  }

  // Aggregate set of field names whose section's missing-warning is active.
  // FloatField / SelectField consume this via MissingFieldsContext to paint
  // their border red. Recomputed every render — small (< 30 keys typical).
  const missingFieldNames: Set<string> = (() => {
    const s = new Set<string>();
    for (let n = 1; n <= 11; n++) {
      if (showMissingFor(n)) {
        getSectionMissingFieldNames(n).forEach((name) => s.add(name));
      }
    }
    return s;
  })();

  // Pick the current section's readiness for the auto-advance flow.
  const ready =
    step === 1
      ? section1Ready
      : step === 2
        ? section2Ready
        : step === 3
          ? section3Ready
          : step === 4
            ? section4Ready
            : step === 5
              ? section5Ready
              : step === 6
                ? section6Ready
                : step === 7
                  ? section7Ready
                  : step === 8
                    ? section8Ready
                    : step === 9
                      ? section9Ready
                      : step === 10
                        ? section10Ready
                        : step === 11
                          ? section11Ready
                          : false;

  // State machine for the auto-advance flow: idle → loading → success → next section.
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success">(
    "idle",
  );

  // Reset the state machine whenever the user advances to a new section.
  useEffect(() => {
    setSubmitState("idle");
  }, [step]);

  // Trigger loading when the current section becomes ready; cancel if user invalidates.
  // Skip the auto-advance flow for the final section — it uses a manual "Continue" button.
  useEffect(() => {
    if (step === SECTIONS.length) return;
    if (submitState === "idle" && ready) setSubmitState("loading");
    if (submitState === "loading" && !ready) setSubmitState("idle");
  }, [ready, submitState, step]);

  // Loading → success after a brief verifying beat.
  useEffect(() => {
    if (submitState !== "loading") return;
    const t = window.setTimeout(() => setSubmitState("success"), 1100);
    return () => window.clearTimeout(t);
  }, [submitState]);

  // Success → advance to the next section after the checkmark sits for a beat.
  useEffect(() => {
    if (submitState !== "success") return;
    const t = window.setTimeout(() => {
      setStep((s) => Math.min(SECTIONS.length, s + 1));
    }, 900);
    return () => window.clearTimeout(t);
  }, [submitState]);

  // Scroll smoothly to the latest unlocked section
  const section1Ref = useRef<HTMLElement>(null);
  const section2Ref = useRef<HTMLElement>(null);
  const section3Ref = useRef<HTMLElement>(null);
  const section4Ref = useRef<HTMLElement>(null);
  const section5Ref = useRef<HTMLElement>(null);
  const section6Ref = useRef<HTMLElement>(null);
  const section7Ref = useRef<HTMLElement>(null);
  const section8Ref = useRef<HTMLElement>(null);
  const section9Ref = useRef<HTMLElement>(null);
  const section10Ref = useRef<HTMLElement>(null);
  const section11Ref = useRef<HTMLElement>(null);
  // When AIQuickFill reveals every section at once (Smart upload path), we
  // jump `step` from 1 → SECTIONS.length. The scroll-to-section effect would
  // otherwise hurl the user to the bottom; this ref tells it to skip the
  // first run after such a jump so users land at the top.
  const skipScrollOnceRef = useRef(false);

  useEffect(() => {
    if (skipScrollOnceRef.current) {
      skipScrollOnceRef.current = false;
      return;
    }
    if (step < 2) return;
    const ref =
      step === 2
        ? section2Ref
        : step === 3
          ? section3Ref
          : step === 4
            ? section4Ref
            : step === 5
              ? section5Ref
              : step === 6
                ? section6Ref
                : step === 7
                  ? section7Ref
                  : step === 8
                    ? section8Ref
                    : step === 9
                      ? section9Ref
                      : step === 10
                        ? section10Ref
                        : step === 11
                          ? section11Ref
                          : null;
    if (!ref) return;
    const t = window.setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
    return () => window.clearTimeout(t);
  }, [step]);

  // When the user clicks the disabled "Review Application" button, we scroll
  // to the first incomplete section and pulse its header for a beat. This
  // state holds the section number to pulse; cleared after the animation.
  const [pulseSection, setPulseSection] = useState<number | null>(null);

  // Missing-fields popover next to the Review button. Click the alert icon
  // to expand the list; click outside / Escape to dismiss.
  const [missingPanelOpen, setMissingPanelOpen] = useState(false);
  const missingPanelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!missingPanelOpen) return;
    function onDocClick(e: MouseEvent) {
      if (
        missingPanelRef.current &&
        !missingPanelRef.current.contains(e.target as Node)
      ) {
        setMissingPanelOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMissingPanelOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [missingPanelOpen]);

  // Helper: scroll to a specific section + pulse its header. Used by both
  // the disabled-CTA click handler and the missing-fields banner.
  function jumpToSection(n: number) {
    const refMap: Record<number, React.RefObject<HTMLElement | null>> = {
      1: section1Ref,
      2: section2Ref,
      3: section3Ref,
      4: section4Ref,
      5: section5Ref,
      6: section6Ref,
      7: section7Ref,
      8: section8Ref,
      9: section9Ref,
      10: section10Ref,
      11: section11Ref,
    };
    refMap[n]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setPulseSection(n);
    window.setTimeout(() => setPulseSection(null), 3000);
  }

  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
  const aiCtxValue = useMemo(
    () => ({
      fields: aiFilledFields,
      mark: (keys: string[]) => setAiFilledFields(new Set(keys)),
    }),
    [aiFilledFields],
  );

  if (!started) {
    return (
      <FormProvider {...methods}>
        <AIFilledContext.Provider value={aiCtxValue}>
          <AIQuickFill
            job={job}
            onContinue={() => {
              // Reveal every section at once for BOTH Smart upload and
              // manual paths. Suppress the scroll-to-section effect so the
              // user lands at the top instead of being yanked to the bottom.
              skipScrollOnceRef.current = true;
              setStep(SECTIONS.length);
              setStarted(true);
            }}
          />
        </AIFilledContext.Provider>
      </FormProvider>
    );
  }

  return (
    <FormProvider {...methods}>
      <AIFilledContext.Provider value={aiCtxValue}>
      <MissingFieldsContext.Provider value={missingFieldNames}>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-8 md:space-y-10">
          {/* SECTION 1 — Identity */}
          <section ref={section1Ref as React.RefObject<HTMLElement>}>
            <SectionHeader
              n={1}
              title="Identity"
              pulse={pulseSection === 1}
              missing={
                showMissingFor(1) ? getSectionMissing(1) : undefined
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-8">
              {/* LEFT column — Photo only */}
              <div className="space-y-7">
                <PhotoUpload
                  photo={photo}
                  error={photoError}
                  onChange={(p) => {
                    setPhoto(p);
                    setPhotoError(null);
                  }}
                  onError={setPhotoError}
                />
              </div>

              {/* RIGHT column — fields grouped by meaning, paired per row */}
              <div className="space-y-7">
                {/* Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FloatField name="surname" label="Surname" autoComplete="family-name" placeholder="e.g. SANTOS" />
                  <FloatField name="firstName" label="First Name" autoComplete="given-name" placeholder="e.g. JUAN MIGUEL" />
                </div>
                {/* Legal identity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FloatField name="middleName" label="Middle Name" optional autoComplete="additional-name" placeholder="e.g. DELA CRUZ" />
                  <FloatField
                    name="nationality"
                    label="Nationality"
                    autoComplete="country-name"
                    suggestions={NATIONALITIES}
                    placeholder="e.g. Filipino"
                  />
                </div>
                {/* Birth */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <DateField name="birthDate" label="Birth Date" />
                  <FloatField name="birthPlace" label="Birth Place" placeholder="e.g. Manila" />
                </div>
                {/* Demographic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <SelectField
                    name="sex"
                    label="Sex"
                    options={[
                      { value: "MALE", label: "Male" },
                      { value: "FEMALE", label: "Female" },
                    ]}
                  />
                  <SelectField
                    name="marriage"
                    label="Marital Status"
                    options={[
                      { value: "UNMARRIED", label: "Single" },
                      { value: "MARRIED", label: "Married" },
                      { value: "WIDOW", label: "Widow(er)" },
                      { value: "DIVORCE", label: "Divorced" },
                    ]}
                  />
                </div>
                {/* Physical */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FloatField name="height" label="Height (cm)" inputMode="numeric" maxLength={3} placeholder="e.g. 172" />
                  <FloatField name="weight" label="Weight (kg)" inputMode="numeric" maxLength={3} placeholder="e.g. 68" />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2 — Contact (reveals when step >= 2) */}
          <AnimatePresence>
            {step >= 2 && (
              <motion.section
                ref={section2Ref as React.RefObject<HTMLElement>}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeader
                  n={2}
                  title="Contact"
                  pulse={pulseSection === 2}
                  missing={
                    showMissingFor(2) ? getSectionMissing(2) : undefined
                  }
                />
                <div className="space-y-7">
                  {/* Address — structured */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-7">
                    <div className="md:col-span-2">
                      <FloatField
                        name="addressStreet"
                        label="Street Address"
                        autoComplete="street-address"
                        placeholder="e.g. 4203 R. Magsaysay Blvd., Sta. Mesa"
                      />
                    </div>
                    <FloatField
                      name="addressCity"
                      label="City / Municipality"
                      autoComplete="address-level2"
                      placeholder="e.g. Manila"
                    />
                    <FloatField
                      name="addressProvince"
                      label="Province"
                      autoComplete="address-level1"
                      suggestions={PH_PROVINCES}
                      placeholder="e.g. Metro Manila"
                    />
                    <FloatField
                      name="addressPostalCode"
                      label="Postal Code"
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="postal-code"
                      placeholder="e.g. 1016"
                    />
                    <FloatField
                      name="addressCountry"
                      label="Country"
                      autoComplete="country-name"
                      suggestions={COUNTRIES}
                      placeholder="e.g. Philippines"
                    />
                  </div>

                  {/* Phone, email, religion */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-7">
                    <FloatField
                      name="mobile"
                      label="Mobile (H.P.)"
                      inputMode="numeric"
                      maxLength={11}
                      autoComplete="tel"
                      placeholder="e.g. 09171234567"
                    />
                    <FloatField
                      name="email"
                      label="Email"
                      type="email"
                      autoComplete="email"
                      placeholder="e.g. juan.santos@email.com"
                    />
                    <FloatField
                      name="tel"
                      label="Telephone"
                      optional
                      autoComplete="tel-national"
                      placeholder="e.g. (02) 8123 4567"
                    />
                    <FloatField
                      name="religion"
                      label="Religion"
                      suggestions={RELIGIONS}
                      placeholder="e.g. Roman Catholic"
                    />
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* SECTION 3 — Education (reveals when step >= 3) */}
          <AnimatePresence>
            {step >= 3 && (
              <motion.section
                ref={section3Ref as React.RefObject<HTMLElement>}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeader
                  n={3}
                  title="Education"
                  pulse={pulseSection === 3}
                  missing={
                    showMissingFor(3) ? getSectionMissing(3) : undefined
                  }
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-7">
                  <div className="md:col-span-2">
                    <FloatField name="eduInstitution" label="Institution" placeholder="e.g. Philippine Maritime Institute" />
                  </div>
                  <FloatField name="eduDepartment" label="Department" optional placeholder="e.g. College" />
                  <FloatField name="eduDegree" label="Degree" placeholder="e.g. BS Marine Transportation" />
                  <DateField name="eduPeriodFrom" label="Period From" />
                  <DateField name="eduPeriodTo" label="Period To" />
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* SECTION 4 — Training (Optional, reveals when step >= 4) */}
          <AnimatePresence>
            {step >= 4 && (
              <motion.section
                ref={section4Ref as React.RefObject<HTMLElement>}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeader n={4} title="Training" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-7">
                  <div className="md:col-span-2">
                    <FloatField name="trainingInstitution" label="Institution" optional placeholder="e.g. NYK-TDG Maritime Academy" />
                  </div>
                  <FloatField name="trainingDepartment" label="Department" optional placeholder="e.g. Cadetship" />
                  <FloatField name="trainingDegree" label="Degree / Cert" optional placeholder="e.g. STCW Advanced Fire Fighting" />
                  <DateField name="trainingPeriodFrom" label="Period From" optional />
                  <DateField name="trainingPeriodTo" label="Period To" optional />
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* SECTION 5 — Certificates (STCW + CoC) reveals when step >= 5 */}
          <AnimatePresence>
            {step >= 5 && (
              <motion.section
                ref={section5Ref as React.RefObject<HTMLElement>}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10"
              >
                <SectionHeader n={5} title="Certificates" />
                <div>
                  <SubHeader>STCW Certificates Held</SubHeader>
                  <p className="-mt-3 mb-4 text-[12.5px] text-neutral-500">
                    Tap every certificate you currently hold.
                  </p>
                  <fieldset>
                    <legend className="sr-only">STCW certificates held</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
                      <CheckboxField name="stcwBasicTraining" label="Basic Training" tooltip="STCW Basic Safety Training (BST) — fire fighting, first aid, personal survival, social responsibilities. Required for all seafarers." />
                      <CheckboxField name="stcwSurvivalCraft" label="Survival Craft & Rescue Boats" tooltip="Proficiency in launching and handling lifeboats, life rafts and rescue boats." />
                      <CheckboxField name="stcwAdvancedFireFighting" label="Advanced Fire Fighting" tooltip="Advanced training in shipboard fire fighting tactics and command." />
                      <CheckboxField name="stcwMedicalFirstAid" label="Medical First Aid" />
                      <CheckboxField name="stcwMedicalCare" label="Medical Care" tooltip="Medical care on board ship — for officers responsible for medical care of crew." />
                      <CheckboxField name="stcwSecurityAwareness" label="Security Awareness" tooltip="ISPS Code basic security awareness for all seafarers." />
                      <CheckboxField name="stcwShipSecurityOfficer" label="Ship Security Officer" tooltip="ISPS Code Ship Security Officer (SSO) certification." />
                      <CheckboxField name="stcwShipsCookCert" label="Ship's Cook Certificate" />
                      <CheckboxField name="stcwYellowFever" label="Yellow Fever" tooltip="Valid yellow fever vaccination certificate (required for some ports)." />
                      <CheckboxField name="stcwEcdis" label="ECDIS" tooltip="Electronic Chart Display & Information System — type-specific training for navigators." />
                      <CheckboxField name="stcwRadarArpa" label="RADAR / ARPA" tooltip="RADAR observation and Automatic Radar Plotting Aids — collision avoidance and target tracking." />
                      <CheckboxField name="stcwBrmErm" label="BRM / ERM" tooltip="Bridge Resource Management and Engine Resource Management — team coordination and human factors training." />
                    </div>
                  </fieldset>
                </div>
                <div>
                  <SubHeader>Certificates of Competency</SubHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-7">
                    <div className="space-y-7">
                      <p className="text-[12px] font-bold uppercase text-neutral-700" style={{ letterSpacing: "0.18em" }}>
                        Native CoC
                        <InfoTip text="Certificate of Competency issued by your home country (e.g. III/4 Engine, II/4 Deck). The licence that authorises you to serve in your rank." />
                      </p>
                      <FloatField name="nativeCocCapacity" label="Capacity" optional placeholder="e.g. III/4 (ENG)" />
                      <FloatField name="nativeCocNumber" label="Number" optional placeholder="e.g. ANW2132132131" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <DateField name="nativeCocDateIssued" label="Date Issued" optional />
                        <DateField name="nativeCocDateExpired" label="Date Expired" optional />
                      </div>
                    </div>
                    <div className="space-y-7">
                      <p className="text-[12px] font-bold uppercase text-neutral-700" style={{ letterSpacing: "0.18em" }}>
                        Other Training Cert
                        <InfoTip text="Any additional national or specialised certificate beyond your main CoC (e.g. flag-state endorsement, dangerous-cargo cert, tanker familiarisation)." />
                      </p>
                      <FloatField name="otherCertCapacity" label="Capacity" optional placeholder="e.g. II/4 (DECK)" />
                      <FloatField name="otherCertNumber" label="Number" optional placeholder="e.g. RFP1332131231" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <DateField name="otherCertDateIssued" label="Date Issued" optional />
                        <DateField name="otherCertDateExpired" label="Date Expired" optional />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* SECTION 6 — Medical Exam (reveals when step >= 6) */}
          <AnimatePresence>
            {step >= 6 && (
              <motion.section
                ref={section6Ref as React.RefObject<HTMLElement>}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeader
                  n={6}
                  title="Medical Exam"
                  pulse={pulseSection === 6}
                  missing={
                    showMissingFor(6) ? getSectionMissing(6) : undefined
                  }
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-7">
                  <DateField name="medicalExamDate" label="Date Issued" />
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* SECTION 7 — Travel Documents (reveals when step >= 7) */}
          <AnimatePresence>
            {step >= 7 && (
              <motion.section
                ref={section7Ref as React.RefObject<HTMLElement>}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10"
              >
                <SectionHeader
                  n={7}
                  title="Travel Documents"
                  pulse={pulseSection === 7}
                  missing={
                    showMissingFor(7) ? getSectionMissing(7) : undefined
                  }
                />
                <div>
                  <div className="space-y-8">
                    <div>
                      <p className="text-[12px] font-bold uppercase text-neutral-700 mb-3" style={{ letterSpacing: "0.18em" }}>
                        Seaman&apos;s Book
                        <InfoTip text="Seafarer's Identity Document (SID) issued by your flag state — proves your identity and right to work at sea." />
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-5">
                        <FloatField name="seamansBookNumber" label="Number" placeholder="e.g. C1234567" />
                        <DateField name="seamansBookDateIssued" label="Date Issued" />
                        <DateField name="seamansBookDateExpired" label="Date Expired" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold uppercase text-neutral-700 mb-3" style={{ letterSpacing: "0.18em" }}>
                        Passport
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-5">
                        <FloatField name="passportNumber" label="Number" placeholder="e.g. P5689123A" />
                        <DateField name="passportDateIssued" label="Date Issued" />
                        <DateField name="passportDateExpired" label="Date Expired" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold uppercase text-neutral-700 mb-3" style={{ letterSpacing: "0.18em" }}>
                        U.S. C1/D Visa <span className="ml-1.5 text-[10px] font-normal normal-case tracking-normal text-neutral-400">(optional)</span>
                        <InfoTip text="Combined Crewman / Transit visa for the United States. Required if your vessel calls at U.S. ports — not required for crew change only." />
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-5">
                        <FloatField name="usVisaNumber" label="Number" optional placeholder="e.g. 20240001" />
                        <DateField name="usVisaDateIssued" label="Date Issued" optional />
                        <DateField name="usVisaDateExpired" label="Date Expired" optional />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* SECTION 8 — Sea Experience (reveals when step >= 8) */}
          <AnimatePresence>
            {step >= 8 && (
              <motion.section
                ref={section8Ref as React.RefObject<HTMLElement>}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeader
                  n={8}
                  title="Sea Experience"
                  pulse={pulseSection === 8}
                  missing={
                    showMissingFor(8) ? getSectionMissing(8) : undefined
                  }
                />
                <p className="-mt-3 mb-6 text-[12.5px] text-neutral-500">
                  List your service from latest to oldest. Add a row for each contract.
                </p>
                <ExperienceTable engineDept={job?.department === "ENGINE"} />
              </motion.section>
            )}
          </AnimatePresence>

          {/* SECTION 7 — Kindred + Health + Language (reveals when step >= 7) */}
          {/* SECTION 9 — Kindred (reveals when step >= 9) */}
          <AnimatePresence>
            {step >= 9 && (
              <motion.section
                ref={section9Ref as React.RefObject<HTMLElement>}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeader
                  n={9}
                  title="Kindred"
                  pulse={pulseSection === 9}
                  missing={
                    showMissingFor(9) ? getSectionMissing(9) : undefined
                  }
                />
                <p className="-mt-3 mb-6 text-[12.5px] text-neutral-500">
                  {allValues.marriage === "MARRIED"
                    ? "List your spouse and children. Parents are optional."
                    : "List your parents and siblings."}
                </p>
                <KindredTable married={allValues.marriage === "MARRIED"} />
              </motion.section>
            )}
          </AnimatePresence>

          {/* SECTION 10 — Health (reveals when step >= 10) */}
          <AnimatePresence>
            {step >= 10 && (
              <motion.section
                ref={section10Ref as React.RefObject<HTMLElement>}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeader
                  n={10}
                  title="Health"
                  pulse={pulseSection === 10}
                  missing={
                    showMissingFor(10) ? getSectionMissing(10) : undefined
                  }
                />
                <HealthBlock />
              </motion.section>
            )}
          </AnimatePresence>

          {/* SECTION 11 — Language (reveals when step >= 11) */}
          <AnimatePresence>
            {step >= 11 && (
              <motion.section
                ref={section11Ref as React.RefObject<HTMLElement>}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeader
                  n={11}
                  title="Language"
                  pulse={pulseSection === 11}
                  missing={
                    showMissingFor(11) ? getSectionMissing(11) : undefined
                  }
                />
                <LanguageBlock />
              </motion.section>
            )}
          </AnimatePresence>

        </div>

        {/* Footer: auto-advance status for required sections, manual Skip on
            Training (optional), and final Review button on the last section.
            "Clear draft" sits on the left so the primary CTA stays right-aligned. */}
        <div className="mt-10 flex items-center justify-between gap-4 min-h-[2.5rem]">
          {/* Clear draft — wipes the form, photo, and AI-fill state */}
          {step === SECTIONS.length ? (
            <button
              type="button"
              onClick={() => {
                if (
                  !window.confirm(
                    "Clear all entries on this form? This cannot be undone.",
                  )
                )
                  return;
                try {
                  window.localStorage.removeItem(STORAGE_KEY);
                } catch {}
                methods.reset(defaultApplication);
                setAiFilledFields(new Set());
                setPhoto(null);
                setPhotoError(null);
              }}
              className="text-[12px] font-medium text-neutral-400 underline-offset-4 hover:text-rose-500 hover:underline transition-colors"
            >
              Clear draft
            </button>
          ) : (
            <span />
          )}

          {/* Right-side controls cluster */}
          <div className="flex items-center gap-4">
          {/* "What's missing" — clickable alert icon, only shown on the
              final step when at least one required section is incomplete.
              Click → popover lists incomplete sections with jump links. */}
          {step === SECTIONS.length && !allReady && (() => {
            const incomplete = ([1, 2, 3, 6, 7, 8, 9, 10, 11] as const).filter(
              (n) => !sectionReady[n],
            );
            return (
              <div ref={missingPanelRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMissingPanelOpen((v) => !v)}
                  aria-label={`${incomplete.length} section${incomplete.length === 1 ? "" : "s"} incomplete`}
                  aria-expanded={missingPanelOpen}
                  className="group inline-flex items-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-3 py-2 text-[12px] font-semibold text-rose-700 hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 7v6M12 16.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="tabular-nums">{incomplete.length}</span>
                </button>
                <AnimatePresence>
                  {missingPanelOpen && (
                    <motion.div
                      role="dialog"
                      aria-label="Incomplete sections"
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 bottom-full mb-2 z-30 w-[320px] rounded-2xl border border-rose-200 bg-white p-4 shadow-[0_12px_36px_-8px_rgba(15,23,42,0.18),0_2px_8px_-4px_rgba(15,23,42,0.08)]"
                    >
                      <p className="text-[13px] font-semibold text-rose-700">
                        A few things still need attention before you can
                        submit:
                      </p>
                      <ul className="mt-3 space-y-2">
                        {incomplete.map((n) => {
                          const section = SECTIONS.find((s) => s.id === n);
                          const missing = getSectionMissing(n);
                          return (
                            <li
                              key={n}
                              className="text-[12.5px] text-neutral-700"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  jumpToSection(n);
                                  setMissingPanelOpen(false);
                                }}
                                className="font-semibold text-[#15803d] hover:underline"
                              >
                                {String(n).padStart(2, "0")} · {section?.title} →
                              </button>
                              <p className="mt-0.5 text-neutral-500 leading-snug">
                                {missing.length > 0
                                  ? missing.join(", ")
                                  : "incomplete"}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })()}

          {/* Final section: send-icon submission CTA */}
          {step === SECTIONS.length && (
            <span className="group relative inline-block">
              <button
                type="button"
                onClick={() => {
                  if (allReady) {
                    goToReview();
                    return;
                  }
                  // Find the first incomplete required section, jump to it.
                  const REQUIRED = [1, 2, 3, 6, 7, 8, 9, 10, 11] as const;
                  const first = REQUIRED.find((n) => !sectionReady[n]);
                  if (first != null) jumpToSection(first);
                }}
                aria-disabled={!allReady}
                className={`inline-flex items-center gap-3 rounded-2xl px-9 py-4 text-[15px] font-semibold tracking-tight transition-all duration-200 ${
                  allReady
                    ? "bg-[#15803d] text-white shadow-lg shadow-[#15803d]/30 hover:bg-[#166534] hover:shadow-xl hover:shadow-[#15803d]/40 hover:-translate-y-0.5"
                    : "bg-neutral-200 text-neutral-400 cursor-help"
                }`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className={
                    allReady
                      ? "transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:rotate-12"
                      : ""
                  }
                >
                  <path
                    d="M3.4 20.4 21 12 3.4 3.6 3.4 10.2 16 12 3.4 13.8z"
                    fill="currentColor"
                  />
                </svg>
                Review Application
              </button>
              {/* C — hover tooltip listing which sections aren't ready */}
              {!allReady && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full right-0 mb-2 z-20 w-max max-w-[280px] rounded-xl bg-neutral-900 px-3 py-2.5 text-[11.5px] font-medium text-white shadow-lg opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0"
                >
                  <span className="block font-semibold mb-1">
                    Still incomplete:
                  </span>
                  <span className="block opacity-90">
                    {SECTIONS.filter(
                      (s) =>
                        !sectionReady[s.id] && s.id !== 4 && s.id !== 5,
                    )
                      .map((s) => s.title)
                      .join(" · ")}
                  </span>
                  <span
                    aria-hidden
                    className="absolute right-8 top-full h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-neutral-900"
                  />
                </span>
              )}
            </span>
          )}

          {/* Manual sections (Training, Certificates): manual Continue */}
          {(step === 4 || step === 5) && step < SECTIONS.length && (
            <button
              type="button"
              onClick={() =>
                setStep((s) => Math.min(SECTIONS.length, s + 1))
              }
              className="rounded-xl bg-[#15803d] px-7 py-3.5 text-[13px] font-semibold uppercase text-white shadow-md shadow-[#15803d]/20 hover:bg-[#166534] transition-all duration-200"
              style={{ letterSpacing: "0.1em" }}
            >
              Continue →
            </button>
          )}

          {/* Required sections: auto-advance feedback */}
          {step !== 4 && step !== 5 && step < SECTIONS.length && (
            <AnimatePresence mode="wait">
              {submitState === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-3"
                >
                  <Spinner />
                  <span className="text-[13px] font-medium text-neutral-700">
                    Verifying…
                  </span>
                </motion.div>
              )}
              {submitState === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-3"
                >
                  <Checkmark />
                  <span className="text-[13px] font-semibold text-[#15803d]">
                    Section complete
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          </div>
        </div>
      </form>
      </MissingFieldsContext.Provider>
      </AIFilledContext.Provider>
    </FormProvider>
  );
}

/* Path-aware getter for nested RHF state (e.g. "experience.0.rank"). */
function getByPath(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, key) => (acc == null ? acc : (acc as Record<string, unknown>)[key]), obj);
}


/* ─────────── InfoTip · "?" with hover/focus popover ─────────── */

function InfoTip({ text }: { text: string }) {
  return (
    <span className="relative inline-flex group ml-1.5 align-middle">
      <button
        type="button"
        tabIndex={0}
        aria-label={`Help: ${text}`}
        className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-neutral-100 border border-neutral-300 text-neutral-500 text-[11px] font-bold leading-none hover:bg-[#15803d] hover:border-[#15803d] hover:text-white focus:bg-[#15803d] focus:border-[#15803d] focus:text-white focus:outline-none focus:ring-2 focus:ring-[#15803d]/20 transition-colors cursor-help"
      >
        ?
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 z-30 w-max max-w-[320px] rounded-xl bg-white border border-neutral-200 px-4 py-3 text-[12.5px] font-normal normal-case text-neutral-700 leading-relaxed shadow-[0_8px_24px_-4px_rgba(15,23,42,0.18),0_2px_6px_-2px_rgba(15,23,42,0.08)] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150"
        style={{ letterSpacing: "0.005em" }}
      >
        {text}
        <span className="absolute left-1/2 -translate-x-1/2 top-full -mt-[5px] h-2.5 w-2.5 rotate-45 bg-white border-r border-b border-neutral-200" />
      </span>
    </span>
  );
}

/* ─────────── Top-level section header (large numbered anchor) ─────────── */

const SECTION_SUBTITLES: Record<number, string> = {
  1: "Tell us who you are.",
  2: "How can we reach you?",
  3: "Where you studied.",
  4: "Any additional training. (Optional)",
  5: "Your STCW endorsements and competency papers.",
  6: "Most recent fitness-for-duty exam.",
  7: "Passport, seaman's book, and visas.",
  8: "Your service history, latest first.",
  9: "Family — parents, siblings, spouse, children.",
  10: "Fitness to work and prior injuries.",
  11: "Your English and Mandarin proficiency.",
};

function SectionHeader({
  n,
  title,
  pulse = false,
}: {
  n: number;
  title: string;
  pulse?: boolean;
  /**
   * NOTE: `missing` used to drive an orange title + info icon when a
   * section had unfilled required fields. We dropped that — the red field
   * borders alone are now the missing-state signal. Prop kept on the call
   * sites but no longer consumed here.
   */
  missing?: string[];
}) {
  return (
    <motion.div
      className="mb-8 flex items-baseline gap-4 sm:gap-5 border-b border-neutral-200 pb-5 rounded-xl"
      animate={
        pulse
          ? {
              boxShadow: [
                "0 0 0 0 rgba(244, 63, 94, 0)",
                "0 0 0 6px rgba(244, 63, 94, 0.18)",
                "0 0 0 0 rgba(244, 63, 94, 0)",
              ],
            }
          : { boxShadow: "0 0 0 0 rgba(244, 63, 94, 0)" }
      }
      transition={{
        duration: 1.4,
        ease: "easeInOut",
        repeat: pulse ? 1 : 0,
      }}
    >
      <span
        aria-hidden
        className="font-extrabold tracking-tight text-[#15803d]/30 select-none shrink-0"
        style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", lineHeight: 1 }}
      >
        {String(n).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <h2
          className="flex items-center gap-2 font-bold tracking-tight text-neutral-900"
          style={{ fontSize: "clamp(1.4rem, 2vw, 1.875rem)", lineHeight: 1.1 }}
        >
          {title}
        </h2>
        {SECTION_SUBTITLES[n] && (
          <p className="mt-1 text-[14px] text-neutral-500">
            {SECTION_SUBTITLES[n]}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────── Sub-header (small caps with hairline rule) ─────────── */

function SubHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-7 pb-3 border-b-2 border-[#15803d]/25">
      <span
        className="text-[15px] font-extrabold uppercase text-[#15803d]"
        style={{ letterSpacing: "0.18em" }}
      >
        {children}
      </span>
    </div>
  );
}

/* ─────────── Checkbox field (boolean) ─────────── */

function CheckboxField({
  name,
  label,
  tooltip,
}: {
  name: FieldPath<ApplicationValues>;
  label: string;
  tooltip?: string;
}) {
  const { register } = useFormContext<ApplicationValues>();
  return (
    <label
      htmlFor={name}
      className="flex items-center gap-3 cursor-pointer rounded-md py-1.5 px-1 -mx-1 text-[15px] font-medium text-neutral-800 select-none hover:text-[#15803d] hover:bg-neutral-50 transition-colors"
    >
      <input
        id={name}
        type="checkbox"
        {...register(name)}
        className="h-[18px] w-[18px] rounded border-neutral-400 accent-[#15803d] cursor-pointer shrink-0"
      />
      <span>{label}</span>
      {tooltip && <InfoTip text={tooltip} />}
    </label>
  );
}

/* ─────────── Spinner + Checkmark ─────────── */

function Spinner() {
  return (
    <motion.svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="rgba(15,23,42,0.12)" strokeWidth="3" />
      <path
        d="M12 3 A9 9 0 0 1 21 12"
        stroke="#15803d"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

function Checkmark() {
  return (
    <motion.div
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      className="grid h-7 w-7 place-items-center rounded-full bg-[#15803d] shadow-[0_4px_14px_-4px_rgba(21,128,61,0.55)]"
      aria-hidden
    >
      <motion.svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <motion.path
          d="m5 12.5 5 5 9-10"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
        />
      </motion.svg>
    </motion.div>
  );
}

/* ─────────── Boxed text field with label above ─────────── */

function FloatField({
  name,
  label,
  type = "text",
  inputMode,
  maxLength,
  autoComplete = "off",
  optional = false,
  suggestions,
  placeholder,
}: {
  name: FieldPath<ApplicationValues>;
  label: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  autoComplete?: string;
  optional?: boolean;
  suggestions?: readonly string[];
  placeholder?: string;
}) {
  const {
    register,
    setValue,
    formState: { errors, touchedFields, dirtyFields },
    watch,
  } = useFormContext<ApplicationValues>();
  const value = (watch(name) as string | undefined) ?? "";
  const error = (getByPath(errors, name) as { message?: string } | undefined)?.message;
  const touched = !!getByPath(touchedFields, name);
  const showError = !!error && (touched || !!value);
  const filled = !!value;
  const { fields: aiFields } = useAIFilled();
  const isAi = aiFields.has(name) && !getByPath(dirtyFields, name);
  const isMissing = useIsFieldMissing(name);

  // Custom 3-item suggestion dropdown — only used when `suggestions` is passed.
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const filtered = (() => {
    if (!suggestions) return [] as string[];
    const v = value.toLowerCase().trim();
    const list = v
      ? suggestions.filter((s) => s.toLowerCase().includes(v))
      : suggestions;
    return list.slice(0, 3);
  })();
  const showDropdown = !!suggestions && open && filtered.length > 0;

  // Reset highlight when the candidate list changes so we don't point past the end.
  useEffect(() => {
    setHighlight(0);
  }, [value, suggestions]);

  function pick(text: string) {
    setValue(name, text as never, {
      shouldValidate: true,
      shouldTouch: true,
      shouldDirty: true,
    });
    setOpen(false);
  }

  // Chain RHF's onBlur with our own (delayed close so a click on a suggestion
  // can fire before the dropdown unmounts).
  const reg = register(name);

  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className={`block text-[12px] font-medium mb-1.5 ${
          showError ? "text-rose-500" : "text-neutral-500"
        }`}
      >
        {label}
        {optional && (
          <span className="ml-1.5 text-[11px] font-normal text-neutral-400">
            (optional)
          </span>
        )}
      </label>
      <div className="relative">
        <input
          id={name}
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete={suggestions ? "off" : autoComplete}
          placeholder={placeholder}
          {...reg}
          onFocus={() => suggestions && setOpen(true)}
          onBlur={(e) => {
            reg.onBlur(e);
            if (suggestions) window.setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={(e) => {
            if (!showDropdown) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((i) => Math.min(filtered.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((i) => Math.max(0, i - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              pick(filtered[highlight] ?? filtered[0]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          aria-autocomplete={suggestions ? "list" : undefined}
          aria-expanded={suggestions ? showDropdown : undefined}
          role={suggestions ? "combobox" : undefined}
          className={`w-full rounded-xl border px-5 py-4 text-[16px] leading-tight text-neutral-900 outline-none transition-all duration-200 caret-neutral-700 ${
            isMissing
              ? "bg-white border-2 border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200"
              : showError
                ? "bg-white border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                : isAi
                  ? "bg-white border-2 border-violet-500 focus:border-violet-600 focus:ring-2 focus:ring-violet-200"
                  : filled
                      ? "bg-white border-[#15803d]/40 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/15"
                      : "bg-white border-slate-300 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/15 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
          }`}
        />

        {showDropdown && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full mt-1.5 z-30 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_10px_30px_-10px_rgba(15,23,42,0.18),0_4px_10px_-6px_rgba(15,23,42,0.08)]"
          >
            {filtered.map((s, i) => (
              <li
                key={s}
                role="option"
                aria-selected={i === highlight}
                onMouseDown={(e) => {
                  // Prevent the input's blur from firing before our click handler.
                  e.preventDefault();
                  pick(s);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`cursor-pointer px-5 py-3 text-[15px] transition-colors ${
                  i === highlight
                    ? "bg-[#15803d]/10 text-[#15803d] font-semibold"
                    : "text-neutral-800 hover:bg-neutral-50"
                }`}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      {showError && (
        <p className="mt-1.5 text-[11px] font-medium text-rose-500">{error}</p>
      )}
    </div>
  );
}

/* ─────────── Date field with calendar popover ─────────── */
/* Replaces native <input type="date"> across the form. The native picker
 * is hard to use on tablets (small wheel scrollers, especially the month
 * column). This uses react-day-picker with month/year dropdowns at the
 * top so users can jump to any month in 2 taps. Stores the value in
 * ISO YYYY-MM-DD to match the existing zod regex. */

function DateField({
  name,
  label,
  optional = false,
}: {
  name: FieldPath<ApplicationValues>;
  label: string;
  optional?: boolean;
}) {
  const {
    register,
    setValue,
    formState: { errors, touchedFields, dirtyFields },
    watch,
  } = useFormContext<ApplicationValues>();
  const value = (watch(name) as string | undefined) ?? "";
  const error = (getByPath(errors, name) as { message?: string } | undefined)?.message;
  const touched = !!getByPath(touchedFields, name);
  const showError = !!error && (touched || !!value);
  const filled = !!value;
  const { fields: aiFields } = useAIFilled();
  const isAi = aiFields.has(name) && !getByPath(dirtyFields, name);
  const isMissing = useIsFieldMissing(name);

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Parse current ISO value into a Date for the picker.
  const selectedDate =
    value && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(value + "T00:00:00")
      : undefined;

  // Friendly display string ("Jan 5, 1990" style).
  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  // Click outside / Escape closes the popover.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  function pickDate(d: Date | undefined) {
    if (!d) {
      setValue(name, "" as never, {
        shouldValidate: true,
        shouldTouch: true,
        shouldDirty: true,
      });
      return;
    }
    // Local ISO without TZ shift (toISOString uses UTC).
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setValue(name, `${y}-${m}-${day}` as never, {
      shouldValidate: true,
      shouldTouch: true,
      shouldDirty: true,
    });
    setOpen(false);
  }

  return (
    <div className="w-full" ref={wrapperRef}>
      <label
        htmlFor={name}
        className={`block text-[12px] font-medium mb-1.5 ${
          showError ? "text-rose-500" : "text-neutral-500"
        }`}
      >
        {label}
        {optional && (
          <span className="ml-1.5 text-[11px] font-normal text-neutral-400">
            (optional)
          </span>
        )}
      </label>
      <div className="relative">
        <button
          type="button"
          id={name}
          onClick={() => setOpen((v) => !v)}
          className={`w-full flex items-center justify-between rounded-xl border px-5 py-4 text-[16px] leading-tight outline-none transition-all duration-200 text-left ${
            isMissing
              ? "bg-white border-2 border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200"
              : showError
                ? "bg-white border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                : isAi
                  ? "bg-white border-2 border-violet-500 focus:border-violet-600 focus:ring-2 focus:ring-violet-200"
                  : filled
                    ? "bg-white border-[#15803d]/40 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/15"
                    : "bg-white border-slate-300 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/15 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
          }`}
        >
          <span className={filled ? "text-neutral-900" : "text-neutral-400"}>
            {displayValue || "Select a date"}
          </span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className="text-neutral-500 shrink-0"
          >
            <rect
              x="3"
              y="5"
              width="18"
              height="16"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M3 10h18M8 3v4M16 3v4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {/* Hidden registered input keeps RHF aware of the field. */}
        <input type="hidden" {...register(name)} />

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-full mt-1.5 z-30 rounded-2xl border border-neutral-200 bg-white p-3 shadow-[0_12px_36px_-8px_rgba(15,23,42,0.18),0_2px_8px_-4px_rgba(15,23,42,0.08)]"
            >
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={pickDate}
                captionLayout="dropdown"
                startMonth={new Date(1940, 0)}
                endMonth={new Date(2050, 11)}
                weekStartsOn={1}
                modifiersStyles={{
                  selected: {
                    backgroundColor: "#15803d",
                    color: "white",
                  },
                  today: {
                    color: "#15803d",
                    fontWeight: 700,
                  },
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {showError && (
        <p className="mt-1.5 text-[11px] font-medium text-rose-500">{error}</p>
      )}
    </div>
  );
}

/* ─────────── Boxed select dropdown ─────────── */

function SelectField({
  name,
  label,
  options,
}: {
  name: FieldPath<ApplicationValues>;
  label: string;
  options: { value: string; label: string }[];
}) {
  const {
    register,
    formState: { errors, touchedFields, dirtyFields },
    watch,
  } = useFormContext<ApplicationValues>();
  const value = watch(name) as string | undefined;
  const error = (getByPath(errors, name) as { message?: string } | undefined)?.message;
  const touched = !!getByPath(touchedFields, name);
  const showError = !!error && (touched || !!value);
  const filled = !!value;
  const { fields: aiFields } = useAIFilled();
  const isAi = aiFields.has(name) && !getByPath(dirtyFields, name);
  const isMissing = useIsFieldMissing(name);

  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className={`block text-[12px] font-medium mb-1.5 ${
          showError ? "text-rose-500" : "text-neutral-500"
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={name}
          {...register(name)}
          className={`w-full appearance-none rounded-xl border px-5 py-4 pr-11 text-[16px] text-neutral-900 outline-none transition-all duration-200 ${
            isMissing
              ? "bg-white border-2 border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200"
              : showError
                ? "bg-white border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                : isAi
                  ? "bg-white border-2 border-violet-500 focus:border-violet-600 focus:ring-2 focus:ring-violet-200"
                  : filled
                      ? "bg-white border-[#15803d]/40 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/15"
                      : "bg-white border-slate-300 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/15 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
          }`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showError && (
        <p className="mt-1.5 text-[11px] font-medium text-rose-500">{error}</p>
      )}
    </div>
  );
}

/* ─────────── Photo upload (separate from RHF) ─────────── */

function PhotoUpload({
  photo,
  error,
  onChange,
  onError,
}: {
  photo: PhotoState;
  error: string | null;
  onChange: (p: PhotoState) => void;
  onError: (msg: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl);
    };
  }, [photo?.previewUrl]);

  async function handleFile(file: File) {
    onError(null);
    const accepted: readonly string[] = PHOTO_CONSTRAINTS.acceptedTypes;
    if (!accepted.includes(file.type)) {
      onError("File must be JPEG or PNG");
      return;
    }
    if (file.size > PHOTO_CONSTRAINTS.maxBytes) {
      onError(
        `File too large — max ${(PHOTO_CONSTRAINTS.maxBytes / 1024 / 1024).toFixed(0)}MB`,
      );
      return;
    }
    const url = URL.createObjectURL(file);
    const dims = await readDims(url);
    if (
      dims.width < PHOTO_CONSTRAINTS.minDimension ||
      dims.height < PHOTO_CONSTRAINTS.minDimension
    ) {
      URL.revokeObjectURL(url);
      onError(
        `Photo too small — minimum ${PHOTO_CONSTRAINTS.minDimension}×${PHOTO_CONSTRAINTS.minDimension}px (yours is ${dims.width}×${dims.height})`,
      );
      return;
    }
    if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl);
    onChange({ file, previewUrl: url });
  }

  return (
    <div>
      {photo ? (
        <div className="group relative w-full max-w-[540px] mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.previewUrl}
            alt="Photo preview"
            className="w-full aspect-square object-cover rounded-2xl border border-neutral-200"
          />
          {/* Hover overlay — reveals Replace/Remove on mouse-over */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl flex items-center justify-center gap-3 bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/45 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="pointer-events-auto rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-neutral-900 shadow-md hover:bg-neutral-100 transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => {
                if (photo.previewUrl) URL.revokeObjectURL(photo.previewUrl);
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="pointer-events-auto rounded-full bg-rose-600 px-4 py-2 text-[13px] font-semibold text-white shadow-md hover:bg-rose-700 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`group flex w-full max-w-[540px] mx-auto aspect-square flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 text-center transition-colors ${
            error
              ? "border-rose-300 bg-rose-50/50 text-rose-700"
              : "border-neutral-300 bg-neutral-50/60 text-neutral-600 hover:border-[#15803d]/50 hover:bg-[#15803d]/5"
          }`}
        >
          {/* Head-and-shoulders silhouette (Lucide User) with a small camera badge */}
          <span className="relative inline-flex">
            <svg
              width="88"
              height="88"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              className={`transition-colors ${
                error
                  ? "text-rose-300"
                  : "text-neutral-300 group-hover:text-[#15803d]/55"
              }`}
            >
              {/* Lucide "User" outline */}
              <circle cx="12" cy="8" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M4 21c1.6-4.4 4.7-6.5 8-6.5s6.4 2.1 8 6.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span
              aria-hidden
              className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-neutral-200 transition-colors ${
                error ? "text-rose-400" : "text-neutral-500 group-hover:text-[#15803d]"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                {/* Lucide "Camera" outline */}
                <path
                  d="M14.5 4l1.5 2h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l1.5-2h5z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.7" />
              </svg>
            </span>
          </span>
          <div>
            <p className="text-[14px] font-semibold text-neutral-700">
              Upload your 2×2 photo
            </p>
            <p className="mt-1 text-[12px] text-neutral-500">
              Click to browse · JPEG or PNG · ≥600px · ≤2MB
            </p>
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
        className="sr-only"
      />

      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-rose-500">{error}</p>
      )}
    </div>
  );
}

function readDims(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Could not read image"));
    img.src = src;
  });
}

/* ─────────── Sea Experience repeating rows ─────────── */

function ExperienceTable({ engineDept }: { engineDept: boolean }) {
  const { control } = useFormContext<ApplicationValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  return (
    <div className="space-y-5">
      <AnimatePresence initial={false}>
        {fields.map((field, idx) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border border-[#15803d]/35 p-5 sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <span
                className="text-[12px] font-bold uppercase text-neutral-700"
                style={{ letterSpacing: "0.18em" }}
              >
                Entry {String(idx + 1).padStart(2, "0")}
              </span>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="text-[11px] font-semibold uppercase text-neutral-400 hover:text-rose-500 transition-colors"
                  style={{ letterSpacing: "0.08em" }}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-6">
              <div className="md:col-span-2">
                <FloatField
                  name={`experience.${idx}.agencyVessel` as FieldPath<ApplicationValues>}
                  label="Manning Agency / Vessel Name"
                  placeholder="e.g. Cargo Safeway Inc. / MV Ever Leader"
                />
              </div>
              <FloatField
                name={`experience.${idx}.rank` as FieldPath<ApplicationValues>}
                label="Rank"
                placeholder="e.g. Oiler"
              />
              <FloatField
                name={`experience.${idx}.vesselType` as FieldPath<ApplicationValues>}
                label="Vessel Type"
                placeholder="e.g. Container"
              />

              {engineDept && (
                <>
                  <FloatField
                    name={`experience.${idx}.machine` as FieldPath<ApplicationValues>}
                    label="Machine"
                    optional
                    placeholder="e.g. Wärtsilä"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FloatField
                      name={`experience.${idx}.gt` as FieldPath<ApplicationValues>}
                      label="G. Ton."
                      optional
                      placeholder="e.g. 98921"
                    />
                    <FloatField
                      name={`experience.${idx}.hp` as FieldPath<ApplicationValues>}
                      label="H.P."
                      optional
                      placeholder="e.g. 95613"
                    />
                  </div>
                </>
              )}

              {!engineDept && (
                <FloatField
                  name={`experience.${idx}.gt` as FieldPath<ApplicationValues>}
                  label="G. Ton."
                  optional
                  placeholder="e.g. 98921"
                />
              )}

              <DateField
                name={`experience.${idx}.periodFrom` as FieldPath<ApplicationValues>}
                label="From"
              />
              <DateField
                name={`experience.${idx}.periodTo` as FieldPath<ApplicationValues>}
                label="To"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => append({ ...emptyExperienceRow })}
        className="w-full rounded-2xl border-2 border-dashed border-neutral-300 bg-white/40 px-6 py-4 text-[13px] font-semibold uppercase text-neutral-500 hover:border-[#15803d]/50 hover:bg-[#15803d]/5 hover:text-[#15803d] transition-colors"
        style={{ letterSpacing: "0.1em" }}
      >
        + Add Another Entry
      </button>
    </div>
  );
}

/* ─────────── Kindred repeating rows ─────────── */

function KindredTable({ married }: { married: boolean }) {
  const { control } = useFormContext<ApplicationValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "kindred",
  });

  const titleOptions = married ? KINDRED_TITLES_MARRIED : KINDRED_TITLES_SINGLE;

  return (
    <div className="space-y-5">
      <AnimatePresence initial={false}>
        {fields.map((field, idx) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border border-[#15803d]/35 p-5 sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <span
                className="text-[12px] font-bold uppercase text-neutral-700"
                style={{ letterSpacing: "0.18em" }}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="text-[11px] font-semibold uppercase text-neutral-400 hover:text-rose-500 transition-colors"
                  style={{ letterSpacing: "0.08em" }}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-6">
              <SelectField
                name={`kindred.${idx}.title` as FieldPath<ApplicationValues>}
                label="Relationship"
                options={[
                  { value: "", label: "Select relationship" },
                  ...titleOptions.map((t) => ({ value: t, label: t })),
                ]}
              />
              <FloatField
                name={`kindred.${idx}.name` as FieldPath<ApplicationValues>}
                label="Full Name"
                placeholder="e.g. Jose P. Santos"
              />
              <DateField
                name={`kindred.${idx}.birthDate` as FieldPath<ApplicationValues>}
                label="Date of Birth"
                optional
              />
              <SelectField
                name={`kindred.${idx}.status` as FieldPath<ApplicationValues>}
                label="Status"
                options={[
                  { value: "", label: "Select status" },
                  { value: "ALIVE", label: "Alive" },
                  { value: "DECEASED", label: "Deceased" },
                ]}
              />
              <SelectField
                name={`kindred.${idx}.eduDegree` as FieldPath<ApplicationValues>}
                label="Education"
                options={[
                  { value: "", label: "Select education" },
                  { value: "ELEMENTARY", label: "Elementary" },
                  { value: "HIGH SCHOOL", label: "High School" },
                  { value: "COLLEGE", label: "College" },
                  { value: "VOCATIONAL", label: "Vocational" },
                  { value: "POSTGRADUATE", label: "Postgraduate" },
                  { value: "NONE", label: "None" },
                ]}
              />
              <FloatField
                name={`kindred.${idx}.occupation` as FieldPath<ApplicationValues>}
                label="Occupation"
                optional
                placeholder="e.g. Teacher"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => append({ ...emptyKindredRow })}
        className="w-full rounded-2xl border-2 border-dashed border-neutral-300 bg-white/40 px-6 py-4 text-[13px] font-semibold uppercase text-neutral-500 hover:border-[#15803d]/50 hover:bg-[#15803d]/5 hover:text-[#15803d] transition-colors"
        style={{ letterSpacing: "0.1em" }}
      >
        + Add Family Member
      </button>
    </div>
  );
}

/* ─────────── Health Y/N block ─────────── */

function HealthBlock() {
  const { watch, setValue, formState } = useFormContext<ApplicationValues>();
  const hasInjury = watch("hasInjury");
  const agree = watch("agreeRankAdjust");
  const injuryDesc = watch("injuryDescription");

  const injuryError =
    hasInjury === "YES" && (injuryDesc ?? "").trim() === "" && formState.isSubmitted;

  return (
    <div className="space-y-8">
      <YesNoField
        label="Have you ever been sick or injured in a way that may cause work restrictions?"
        value={hasInjury}
        onChange={(v) =>
          setValue("hasInjury", v, { shouldValidate: true, shouldTouch: true })
        }
      />

      <AnimatePresence>
        {hasInjury === "YES" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <label
              className="block text-[13px] font-semibold uppercase mb-2 text-neutral-800"
              style={{ letterSpacing: "0.06em" }}
            >
              Please describe
            </label>
            <textarea
              rows={3}
              value={injuryDesc ?? ""}
              onChange={(e) =>
                setValue("injuryDescription", e.target.value, {
                  shouldValidate: true,
                  shouldTouch: true,
                })
              }
              className={`w-full rounded-xl bg-white border px-5 py-4 text-[16px] text-neutral-900 outline-none transition-all duration-200 ${
                injuryError
                  ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  : "border-slate-300 bg-white focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/15 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
              }`}
              placeholder="Briefly describe the condition and any restrictions"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <YesNoField
        label="Do you agree that Cargo Safeway may adjust the applied rank in line with your condition?"
        value={agree}
        onChange={(v) =>
          setValue("agreeRankAdjust", v, { shouldValidate: true, shouldTouch: true })
        }
      />
    </div>
  );
}

function YesNoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: "YES" | "NO" | undefined | "";
  onChange: (v: "YES" | "NO") => void;
}) {
  return (
    <div>
      <p className="text-[13.5px] font-medium text-neutral-700 mb-3">{label}</p>
      <div className="grid grid-cols-2 gap-3 max-w-md">
        {(["YES", "NO"] as const).map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`rounded-xl border px-5 py-3.5 text-[14px] font-semibold uppercase transition-all duration-200 ${
                active
                  ? "border-[#15803d] bg-[#15803d] text-white shadow-sm"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
              }`}
              style={{ letterSpacing: "0.08em" }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── Language proficiency block ─────────── */

const PROFICIENCY_OPTIONS = [
  { value: "", label: "Select level" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "NONE", label: "None" },
];

function LanguageBlock() {
  return (
    <div className="space-y-8">
      <div>
        <p
          className="text-[11px] font-semibold uppercase text-neutral-500 mb-4"
          style={{ letterSpacing: "0.18em" }}
        >
          English
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-5">
          <SelectField
            name="englishProficiency"
            label="Proficiency"
            options={PROFICIENCY_OPTIONS}
          />
          <SelectField
            name="englishTest"
            label="Test"
            options={[
              { value: "", label: "Optional" },
              { value: "TOEIC", label: "TOEIC" },
              { value: "IELTS", label: "IELTS" },
              { value: "TOEFL", label: "TOEFL" },
            ]}
          />
          <FloatField name="englishTestScore" label="Score" optional placeholder="e.g. 850 (TOEIC)" />
        </div>
      </div>

      <div>
        <p
          className="text-[11px] font-semibold uppercase text-neutral-500 mb-4"
          style={{ letterSpacing: "0.18em" }}
        >
          Mandarin{" "}
          <span className="ml-1 text-[10px] font-normal normal-case tracking-normal text-neutral-400">
            (optional)
          </span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-5">
          <SelectField
            name="mandarinProficiency"
            label="Proficiency"
            options={PROFICIENCY_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}

