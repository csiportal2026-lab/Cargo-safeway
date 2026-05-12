export type Department = "DECK" | "ENGINE";

export type Job = {
  slug: string;
  title: string;
  rank: string;
  /** Short, all-caps billboard heading. Must fit in one line at display size. */
  displayName: string;
  department: Department;
  vesselName: string;
  vesselType: string;
  contractMonths: number;
  summary: string;
  image: string; // /jobs/<slug>.jpg
  /** Pre-qualifier shown on the back of the bento card after Apply is clicked. */
  prequalifier: string;
};

export function getJob(slug: string): Job | undefined {
  return jobs.find((j) => j.slug === slug);
}

export const jobs: Job[] = [
  {
    slug: "oiler",
    title: "Oiler",
    rank: "OILER",
    displayName: "OILER",
    department: "ENGINE",
    vesselName: "MV Ever Leader",
    vesselType: "Container, 14,000 TEU",
    contractMonths: 9,
    summary:
      "Engine-room watchkeeping under the Engineer Officer of the Watch. Routine maintenance of main and auxiliary engines, fuel and lube systems.",
    image: "/jobs/oiler.webp",
    prequalifier:
      "Do you have at least 2 years of sea time as Wiper or higher?",
  },
  {
    slug: "fitter",
    title: "Fitter",
    rank: "FITTER",
    displayName: "FITTER",
    department: "ENGINE",
    vesselName: "MV Ever Diadem",
    vesselType: "Container, 8,500 TEU",
    contractMonths: 9,
    summary:
      "Workshop fabrication and welding for engine-room and deck repairs. Pipe-fitting, machining, and on-board mechanical maintenance.",
    image: "/jobs/fitter.webp",
    prequalifier:
      "Do you have welding & fabrication competency (TIG / MIG / arc)?",
  },
  {
    slug: "ab",
    title: "Able Bodied Seaman (with OIC)",
    rank: "ABLE BODIED SEAMAN WITH OIC",
    displayName: "AB",
    department: "DECK",
    vesselName: "MV Uni Assure",
    vesselType: "Container, 6,000 TEU",
    contractMonths: 9,
    summary:
      "Bridge watchkeeping support, deck maintenance, mooring operations, and cargo handling. Reports to Bosun and Officer of the Watch.",
    image: "/jobs/ab.webp",
    prequalifier:
      "Do you hold an OIC endorsement and at least 2 years as OS or higher?",
  },
];
