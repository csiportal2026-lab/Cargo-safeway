"use client";

import { Quote } from "lucide-react";
import { useState } from "react";

type CardSize = "sm" | "md" | "lg";
type Testimonial = {
  quote: string;
  name: string;
  role: string;
  // slug → /public/people/{slug}.jpg. If the file is missing, we fall
  // back to a randomuser.me placeholder.
  slug: string;
  size: CardSize;
};

// Per-size geometry. Heights are sized so each card fits its line
// count without clipping the last line — accounting for icon, padding,
// gaps, and the avatar+name figcaption. Mixing sizes gives the marquee
// a more organic, pinterest-y feel.
const CARD_GEOMETRY: Record<CardSize, { heightRem: number; clamp: number }> = {
  sm: { heightRem: 10.5, clamp: 2 },
  md: { heightRem: 13.5, clamp: 4 },
  lg: { heightRem: 17, clamp: 6 },
};

// Testimonials roster — Taglish, Facebook-comment style with emojis.
// Slugs map left-to-right, top-to-bottom across the 3×4 photo grid in
// /public/people/. Swap copy + photos with real authorized quotes
// before launch.
const TESTIMONIALS: Testimonial[] = [
  // Row 1
  {
    quote:
      "Sobrang grateful sa Cargo Safeway 🙏 Hindi madali maging stewardess, lalo na sa first contract ko. Pero kahit anong dami ng concerns ko, lagi may sumasagot sa office — pati pamilya ko, kinukumusta talaga. Allotment on time, walang delay 💚 Pang ten years na ako, hindi pa rin nagbabago ang treatment.",
    name: "Jessa C.",
    role: "Cabin Steward · cruise line",
    slug: "jessa-c",
    size: "lg",
  },
  {
    quote:
      "Six contracts na. Walang lokohan ⚓",
    name: "Mark G.",
    role: "Bosun · M/V Cebu Trader",
    slug: "mark-g",
    size: "sm",
  },
  {
    quote:
      "Na-promote na ako from Oiler to 2nd Engineer 💪 Cargo Safeway never let me down. Pamilya na talaga sila.",
    name: "Edwin T.",
    role: "2nd Engineer · M/T Asian Gulf",
    slug: "edwin-t",
    size: "md",
  },
  {
    quote:
      "First contract pa lang pero feeling ko long-term na ito 🚢 Iba mag-asikaso!",
    name: "Joseph P.",
    role: "Ordinary Seaman · feeder vessel",
    slug: "joseph-p",
    size: "sm",
  },
  // Row 2
  {
    quote:
      "Hahaha sobrang saya ko nag-pursue ng career sa dagat 😄 Cargo Safeway took a chance on me kahit female applicant ako. 9 years na, no regrets! Lahat ng crewing officers, kilala ko by name — at sila kilala ko by my whole family. Hindi ka transactional dito 💚",
    name: "Grace R.",
    role: "Asst Cook · M/V Coral Princess",
    slug: "grace-r",
    size: "lg",
  },
  {
    quote:
      "12 years na ako sa kanila. Mula OS hanggang Bosun, lagi silang nasa likod ko ⚓💪",
    name: "Edgar L.",
    role: "Bosun · Aframax tanker",
    slug: "edgar-l",
    size: "md",
  },
  {
    quote:
      "Super dali ng app nila 📱 Saving time, saving fare!",
    name: "Kris N.",
    role: "3rd Officer · M/V Sirius Bay",
    slug: "kris-n",
    size: "sm",
  },
  {
    quote:
      "From Tacloban to Hamburg!!! 🇩🇪 Hindi ko inakala makakasakay ako sa German vessel sa first year ko pa lang. Salamat Cargo Safeway 🙏",
    name: "Joel B.",
    role: "Ordinary Seaman · feeder vessel",
    slug: "joel-b",
    size: "md",
  },
  // Row 3
  {
    quote:
      "Three contracts ago, OS lang ako. Ngayon Chief Officer na 🫡 Sa Cargo Safeway, kapag nag-deliver ka ng trabaho, nag-deliver din sila ng oportunidad. Hindi ka stuck sa entry rank kung gusto mo umakyat. Sa kanila ako natutong magpursue ng career, hindi just contracts.",
    name: "Rolando D.",
    role: "Chief Officer · M/V Pacific Crest",
    slug: "rolando-d",
    size: "lg",
  },
  {
    quote:
      "Walang kotong, walang utang sa office 💯 Yung sweldo mo, sa iyo lahat.",
    name: "Johnny B.",
    role: "Pumpman · M/T Solaris",
    slug: "johnny-b",
    size: "sm",
  },
  {
    quote:
      "Sa lahat ng agency na nilibot ko, dito ako natigil. Ang bait talaga ng crewing officers — kinukumusta pa ang nanay ko 💚 Iba talaga sa Cargo Safeway.",
    name: "Cristine B.",
    role: "Cabin Attendant · cruise line",
    slug: "cristine-b",
    size: "md",
  },
  {
    quote:
      "Bago ako sa industry pero feeling ko welcome 😊 Sobrang professional, salamat po!",
    name: "Vince C.",
    role: "Wiper · M/V Star Coral",
    slug: "vince-c",
    size: "sm",
  },
];

// Split into 3 columns; each column gets a different speed so the
// marquee never feels mechanical. Leftmost runs noticeably faster.
const COLUMNS = [
  { items: TESTIMONIALS.slice(0, 4), duration: "26s" },
  { items: TESTIMONIALS.slice(4, 8), duration: "56s" },
  { items: TESTIMONIALS.slice(8, 12), duration: "50s" },
];

// Local photo path: /public/people/{slug}.jpg. If the file is missing,
// onError swaps in a randomuser.me placeholder so cards never break.
function localPhoto(slug: string) {
  return `/people/${slug}.jpg`;
}
function fallbackAvatar(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const id = (Math.abs(hash) % 99) + 1;
  return `https://randomuser.me/api/portraits/men/${id}.jpg`;
}

// Card heights vary per testimonial (sm/md/lg via CARD_GEOMETRY).
// CARD_GAP stays uniform so the marquee scroll cadence is consistent.
const CARD_GAP_REM = 0.875;

function Avatar({ t, size }: { t: Testimonial; size: string }) {
  const [src, setSrc] = useState(localPhoto(t.slug));
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      onError={() => {
        // local file missing → fall back to randomuser.me placeholder
        if (!src.startsWith("https://")) setSrc(fallbackAvatar(t.name));
      }}
      className="shrink-0 rounded-full bg-neutral-100 object-cover ring-1 ring-neutral-200/60"
      style={{ width: size, height: size }}
    />
  );
}

function Card({ t }: { t: Testimonial }) {
  const geom = CARD_GEOMETRY[t.size];
  return (
    <figure
      className="bg-white border border-neutral-200/80 flex flex-col shadow-[0_2px_14px_-6px_rgba(0,0,0,0.08)] transition-[box-shadow,border-color,transform] duration-300 ease-out hover:shadow-[0_10px_28px_-8px_rgba(21,128,61,0.18)] hover:border-emerald-200/80"
      style={{
        borderRadius: "clamp(0.875rem, 1.25vw, 1.25rem)",
        padding: "clamp(0.875rem, 1.25vw, 1.25rem)",
        gap: "var(--space-2)",
        height: `${geom.heightRem}rem`,
      }}
    >
      <Quote
        size={18}
        className="shrink-0 text-[#15803d]/70"
        strokeWidth={2}
        aria-hidden
      />
      <blockquote
        className="text-neutral-800 flex-1 overflow-hidden"
        style={{
          fontSize: "var(--fs-sm)",
          lineHeight: 1.55,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: geom.clamp,
        }}
      >
        {t.quote}
      </blockquote>
      <figcaption className="flex items-center" style={{ gap: "var(--space-2)" }}>
        <Avatar t={t} size="2rem" />
        <span className="flex flex-col leading-tight min-w-0">
          <span className="font-semibold text-neutral-900 truncate" style={{ fontSize: "var(--fs-sm)" }}>
            {t.name}
          </span>
          <span className="text-neutral-500 truncate" style={{ fontSize: "var(--fs-2xs)" }}>
            {t.role}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  // Container tuned to fit roughly 3 cards at the average size. Since
  // cards vary (sm/md/lg), the exact number visible at any moment is
  // intentionally non-uniform — gives the marquee a more organic feel.
  const containerHeight = "clamp(36rem, 65dvh, 46rem)";
  // mask-image fades the columns at top + bottom so cards dissolve into
  // the wallpaper instead of being cut by an opaque white overlay. The
  // mask makes the cards themselves transparent at the edges — borders
  // and shadows fade naturally with the content.
  const fadeMask =
    "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)";

  return (
    <div className="relative" style={{ height: containerHeight }}>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 h-full"
        style={{ gap: "clamp(0.75rem, 1.5vw, 1.25rem)" }}
      >
        {COLUMNS.map((col, idx) => (
          <div
            key={idx}
            className={`group overflow-hidden ${idx === 2 ? "hidden lg:block" : idx === 1 ? "hidden sm:block" : ""}`}
            style={{
              maskImage: fadeMask,
              WebkitMaskImage: fadeMask,
            }}
          >
            <div
              className="flex flex-col animate-marquee-vertical group-hover:[animation-play-state:paused]"
              style={
                {
                  gap: `${CARD_GAP_REM}rem`,
                  // CSS custom property for per-column speed
                  ["--duration" as string]: col.duration,
                } as React.CSSProperties
              }
            >
              {/* Render the items twice for a seamless loop */}
              {[...col.items, ...col.items].map((t, i) => (
                <Card key={i} t={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
