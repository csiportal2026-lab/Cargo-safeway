/**
 * Nautical edge ornaments — stylized rope-coil + wave swirls scattered
 * along the left/right edges of the page so something is always visible
 * in the periphery, no matter how tall the form gets.
 *
 * The container fills the full <main> height (absolute inset-0). Top/bottom
 * corner ornaments anchor to the page edges; mid-page ornaments sit at
 * percentage offsets so they auto-distribute when the form extends. Sits
 * behind all content (z-0) and ignores pointer events.
 */
export default function NauticalCorners() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden z-0"
    >
      {/* ── Top corners ── */}
      <CornerSwirl
        size={340}
        className="absolute -top-12 -right-16 text-[#15803d]/[0.10]"
      />
      <CornerSwirl
        size={180}
        className="absolute -top-8 -left-10 text-emerald-500/[0.06] -scale-x-100"
      />

      {/* ── Mid-page swirls — staggered down both edges, alternating sides ── */}
      <CornerSwirl
        size={240}
        className="absolute -right-12 text-[#15803d]/[0.07]"
        style={{ top: "18%" }}
      />
      <CornerSwirl
        size={200}
        className="absolute -left-10 text-emerald-500/[0.06] -scale-x-100"
        style={{ top: "30%" }}
      />
      <CornerSwirl
        size={280}
        className="absolute -right-14 text-[#15803d]/[0.08]"
        style={{ top: "44%", transform: "rotate(8deg)" }}
      />
      <CornerSwirl
        size={220}
        className="absolute -left-12 text-emerald-500/[0.06]"
        style={{ top: "57%", transform: "scaleX(-1) rotate(-6deg)" }}
      />
      <CornerSwirl
        size={260}
        className="absolute -right-12 text-[#15803d]/[0.07]"
        style={{ top: "70%" }}
      />
      <CornerSwirl
        size={200}
        className="absolute -left-10 text-emerald-500/[0.06] -scale-x-100"
        style={{ top: "83%" }}
      />

      {/* ── Bottom corners ── */}
      <CornerSwirl
        size={380}
        className="absolute -bottom-16 -left-20 text-[#15803d]/[0.10] rotate-180"
      />
      <CornerSwirl
        size={200}
        className="absolute -bottom-10 -right-12 text-emerald-500/[0.07] -scale-x-100 rotate-180"
      />
    </div>
  );
}

function CornerSwirl({
  size,
  className,
  style,
}: {
  size: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{ width: size, height: size, ...style }}
    >
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <g
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Outer wave crest sweeping into a curl */}
          <path d="M 8 218 C 70 218, 110 196, 128 158 C 142 130, 168 108, 198 116 C 224 124, 230 154, 210 170 C 192 184, 168 174, 168 156 C 168 142, 184 138, 192 148" />
          {/* Middle wave following the same arc, tighter */}
          <path d="M 30 224 C 84 222, 116 200, 134 170 C 150 144, 174 130, 196 138" />
          {/* Inner wave hint */}
          <path d="M 56 226 C 100 224, 124 208, 138 184" />
          {/* Tiny anchor-dot at the spiral center */}
          <circle cx="186" cy="153" r="2.5" fill="currentColor" stroke="none" />
        </g>
      </svg>
    </div>
  );
}
