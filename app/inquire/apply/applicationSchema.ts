import { z } from "zod";

/* Schema grows section by section. */

/* ── Section 1: Identity ── */
export const identitySchema = z.object({
  surname: z.string().min(1, "Required"),
  firstName: z.string().min(1, "Required"),
  middleName: z.string(),
  sex: z.enum(["MALE", "FEMALE"], { message: "Select one" }),
  height: z
    .string()
    .regex(/^\d{2,3}$/, "Height in cm (2–3 digits)"),
  weight: z
    .string()
    .regex(/^\d{2,3}$/, "Weight in kg (2–3 digits)"),
  nationality: z.string().min(1, "Required"),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),
  birthPlace: z.string().min(1, "Required"),
  marriage: z.enum(["UNMARRIED", "MARRIED", "WIDOW", "DIVORCE"], {
    message: "Select one",
  }),
});

/* ── Section 2: Contact ── */
export const contactSchema = z.object({
  addressStreet: z.string().min(1, "Required"),
  addressCity: z.string().min(1, "Required"),
  addressProvince: z.string().min(1, "Required"),
  addressPostalCode: z.string().min(1, "Required"),
  addressCountry: z.string().min(1, "Required"),
  tel: z.string(),
  // Permissive — accepts +63 prefix, spaces, dashes, parens. Counted by
  // digits only so 09171234567, +639171234567, "0917 123 4567", and
  // (0917) 123-4567 all pass. Normalize on submit if you need strict E.164.
  mobile: z
    .string()
    .refine(
      (v) =>
        /^[\d\s+\-()]+$/.test(v) &&
        v.replace(/\D/g, "").length >= 10 &&
        v.replace(/\D/g, "").length <= 13,
      "Enter a valid mobile number (e.g. 09171234567 or +639171234567)",
    ),
  email: z.string().email("Invalid email"),
  religion: z.string(),
});

/* ── Section 3: Education + Training ── */
export const educationSchema = z.object({
  eduInstitution: z.string().min(1, "Required"),
  eduDepartment: z.string(),
  eduPeriodFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),
  eduPeriodTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),
  eduDegree: z.string().min(1, "Required"),

  trainingInstitution: z.string(),
  trainingDepartment: z.string(),
  trainingPeriodFrom: z.string(),
  trainingPeriodTo: z.string(),
  trainingDegree: z.string(),
});

/* ── Section 4: Certificates (STCW + CoC + Medical) ── */
export const certificatesSchema = z.object({
  stcwBasicTraining: z.boolean(),
  stcwSurvivalCraft: z.boolean(),
  stcwAdvancedFireFighting: z.boolean(),
  stcwMedicalFirstAid: z.boolean(),
  stcwMedicalCare: z.boolean(),
  stcwSecurityAwareness: z.boolean(),
  stcwShipSecurityOfficer: z.boolean(),
  stcwShipsCookCert: z.boolean(),
  stcwYellowFever: z.boolean(),
  stcwEcdis: z.boolean(),
  stcwRadarArpa: z.boolean(),
  stcwBrmErm: z.boolean(),

  nativeCocCapacity: z.string(),
  nativeCocNumber: z.string(),
  nativeCocDateIssued: z.string(),
  nativeCocDateExpired: z.string(),

  otherCertCapacity: z.string(),
  otherCertNumber: z.string(),
  otherCertDateIssued: z.string(),
  otherCertDateExpired: z.string(),

  medicalExamDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),
});

/* ── Section 5: Travel Documents ── */
export const travelDocsSchema = z.object({
  seamansBookNumber: z.string().min(1, "Required"),
  seamansBookDateIssued: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),
  seamansBookDateExpired: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),

  passportNumber: z.string().min(1, "Required"),
  passportDateIssued: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),
  passportDateExpired: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),

  usVisaNumber: z.string(),
  usVisaDateIssued: z.string(),
  usVisaDateExpired: z.string(),
});

/* ── Section 6: Sea Experience (repeating rows) ── */
export const experienceRowSchema = z.object({
  agencyVessel: z.string(),
  rank: z.string(),
  vesselType: z.string(),
  machine: z.string(),
  gt: z.string(),
  hp: z.string(),
  periodFrom: z.string(),
  periodTo: z.string(),
});

export const seaExperienceSchema = z.object({
  experience: z
    .array(experienceRowSchema)
    .min(1)
    .refine(
      (rows) =>
        rows.some(
          (r) =>
            r.agencyVessel.trim() !== "" &&
            r.rank.trim() !== "" &&
            r.vesselType.trim() !== "" &&
            /^\d{4}-\d{2}-\d{2}$/.test(r.periodFrom) &&
            /^\d{4}-\d{2}-\d{2}$/.test(r.periodTo),
        ),
      { message: "Complete at least one experience entry" },
    ),
});

/* ── Section 7a: Kindred (repeating rows) ── */
export const kindredRowSchema = z.object({
  title: z.string(),
  name: z.string(),
  birthDate: z.string(),
  status: z.enum(["ALIVE", "DECEASED", ""]),
  eduDegree: z.string(),
  occupation: z.string(),
});

export const kindredSchema = z.object({
  kindred: z
    .array(kindredRowSchema)
    .min(1)
    .refine(
      (rows) =>
        rows.some(
          (r) => r.title.trim() !== "" && r.name.trim() !== "",
        ),
      { message: "Add at least one family member" },
    ),
});

/* ── Section 7b: Health ── */
export const healthSchema = z.object({
  hasInjury: z.enum(["YES", "NO"], { message: "Select one" }),
  injuryDescription: z.string(),
  agreeRankAdjust: z.enum(["YES", "NO"], { message: "Select one" }),
});

/* ── Section 7c: Language ── */
const PROFICIENCY = z.enum(["EXCELLENT", "GOOD", "FAIR", "NONE"], {
  message: "Select one",
});
// Mandarin is OPTIONAL — accepts an unset (empty) value as well, so most
// Filipino seafarers don't have to pick anything.
const PROFICIENCY_OR_EMPTY = z.union([PROFICIENCY, z.literal("")]);

export const languageSchema = z.object({
  englishProficiency: PROFICIENCY,
  englishTest: z.string(),
  englishTestScore: z.string(),
  mandarinProficiency: PROFICIENCY_OR_EMPTY,
});

/* ── Combined application schema (used by the form's resolver) ── */
export const applicationSchema = identitySchema
  .merge(contactSchema)
  .merge(educationSchema)
  .merge(certificatesSchema)
  .merge(travelDocsSchema)
  .merge(seaExperienceSchema)
  .merge(kindredSchema)
  .merge(healthSchema)
  .merge(languageSchema);

export type IdentityValues = z.infer<typeof identitySchema>;
export type ContactValues = z.infer<typeof contactSchema>;
export type EducationValues = z.infer<typeof educationSchema>;
export type CertificatesValues = z.infer<typeof certificatesSchema>;
export type TravelDocsValues = z.infer<typeof travelDocsSchema>;
export type ExperienceRow = z.infer<typeof experienceRowSchema>;
export type SeaExperienceValues = z.infer<typeof seaExperienceSchema>;
export type KindredRow = z.infer<typeof kindredRowSchema>;
export type KindredValues = z.infer<typeof kindredSchema>;
export type HealthValues = z.infer<typeof healthSchema>;
export type LanguageValues = z.infer<typeof languageSchema>;
export type ApplicationValues = z.infer<typeof applicationSchema>;

export const emptyExperienceRow: ExperienceRow = {
  agencyVessel: "",
  rank: "",
  vesselType: "",
  machine: "",
  gt: "",
  hp: "",
  periodFrom: "",
  periodTo: "",
};

export const emptyKindredRow: KindredRow = {
  title: "",
  name: "",
  birthDate: "",
  status: "",
  eduDegree: "",
  occupation: "",
};

/* Suggested kindred titles — user can pick or type their own. */
export const KINDRED_TITLES_SINGLE = [
  "Father",
  "Mother",
  "Elder Brother",
  "Younger Brother",
  "Elder Sister",
  "Younger Sister",
] as const;

export const KINDRED_TITLES_MARRIED = [
  "Father",
  "Mother",
  "Spouse",
  "Son",
  "Daughter",
] as const;

/* Photo lives outside RHF/Zod (File objects don't serialize for autosave). */
export const PHOTO_CONSTRAINTS = {
  acceptedTypes: ["image/jpeg", "image/png"] as const,
  maxBytes: 10 * 1024 * 1024,
  minDimension: 600,
};

export const STORAGE_KEY = "cs_application_draft_v1";

/* Section list — Review & Submit lives on its own route now. */
export const SECTIONS = [
  { id: 1, title: "Identity" },
  { id: 2, title: "Contact" },
  { id: 3, title: "Education" },
  { id: 4, title: "Training" },
  { id: 5, title: "Certificates" },
  { id: 6, title: "Medical Exam" },
  { id: 7, title: "Travel Documents" },
  { id: 8, title: "Sea Experience" },
  { id: 9, title: "Kindred" },
  { id: 10, title: "Health" },
  { id: 11, title: "Language" },
] as const;

/* sessionStorage key for the photo data URL — passed across pages
   since File objects don't survive navigation. */
export const PHOTO_SESSION_KEY = "cs_application_photo_v1";
