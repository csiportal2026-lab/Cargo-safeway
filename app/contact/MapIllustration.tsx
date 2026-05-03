// Hand-styled illustration of the area around Cargo Safeway's
// Sta. Mesa, Manila office. Not a real map — a brand-coloured
// schematic with Pasig River, R. Magsaysay Blvd, and a pin.

export default function MapIllustration() {
  return (
    <svg
      viewBox="0 0 800 320"
      className="w-full h-full block"
      role="img"
      aria-label="Stylized map showing Cargo Safeway office near R. Magsaysay Blvd, Sta. Mesa, Manila"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#15803d" fillOpacity="0.08" />
        </pattern>
        <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#15803d" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#15803d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="riverGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>

      {/* Paper background */}
      <rect x="0" y="0" width="800" height="320" fill="#f7f6f0" />
      <rect x="0" y="0" width="800" height="320" fill="url(#dots)" />

      {/* Pasig River curving through bottom */}
      <path
        d="M -20 270 C 120 250, 280 290, 420 260 C 560 230, 700 280, 820 250 L 820 340 L -20 340 Z"
        fill="url(#riverGrad)"
      />
      <path
        d="M -20 270 C 120 250, 280 290, 420 260 C 560 230, 700 280, 820 250"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
      <text
        x="640"
        y="248"
        fill="#0c4a6e"
        fillOpacity="0.55"
        fontSize="11"
        fontWeight="600"
        fontStyle="italic"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        Pasig River
      </text>

      {/* Block fills */}
      <g fill="#e7e5dc">
        <rect x="40" y="40" width="170" height="90" rx="4" />
        <rect x="240" y="40" width="220" height="90" rx="4" />
        <rect x="490" y="40" width="270" height="90" rx="4" />
        <rect x="40" y="160" width="160" height="80" rx="4" />
        <rect x="230" y="160" width="160" height="80" rx="4" />
        <rect x="420" y="160" width="160" height="80" rx="4" />
        <rect x="610" y="160" width="150" height="80" rx="4" />
      </g>

      {/* Building footprints (subtle) */}
      <g fill="#d6d3c5" fillOpacity="0.65">
        <rect x="55" y="55" width="38" height="28" rx="2" />
        <rect x="105" y="55" width="50" height="28" rx="2" />
        <rect x="55" y="95" width="60" height="22" rx="2" />
        <rect x="135" y="95" width="60" height="22" rx="2" />

        <rect x="260" y="55" width="40" height="28" rx="2" />
        <rect x="320" y="55" width="60" height="28" rx="2" />
        <rect x="395" y="55" width="55" height="28" rx="2" />
        <rect x="265" y="95" width="80" height="22" rx="2" />
        <rect x="360" y="95" width="90" height="22" rx="2" />

        <rect x="510" y="55" width="55" height="28" rx="2" />
        <rect x="580" y="55" width="50" height="28" rx="2" />
        <rect x="645" y="55" width="100" height="28" rx="2" />
        <rect x="510" y="95" width="120" height="22" rx="2" />
        <rect x="640" y="95" width="105" height="22" rx="2" />

        <rect x="55" y="175" width="55" height="22" rx="2" />
        <rect x="125" y="175" width="65" height="22" rx="2" />
        <rect x="55" y="210" width="135" height="22" rx="2" />

        <rect x="245" y="175" width="60" height="22" rx="2" />
        <rect x="320" y="175" width="60" height="22" rx="2" />
        <rect x="245" y="210" width="135" height="22" rx="2" />

        <rect x="435" y="175" width="55" height="22" rx="2" />
        <rect x="500" y="175" width="65" height="22" rx="2" />
        <rect x="435" y="210" width="130" height="22" rx="2" />

        <rect x="625" y="175" width="55" height="22" rx="2" />
        <rect x="690" y="175" width="55" height="22" rx="2" />
        <rect x="625" y="210" width="120" height="22" rx="2" />
      </g>

      {/* Streets — drawn last over blocks */}
      {/* R. Magsaysay Blvd (main horizontal) */}
      <rect x="-20" y="135" width="840" height="22" fill="#ffffff" />
      <line
        x1="-20"
        y1="146"
        x2="820"
        y2="146"
        stroke="#cbd5e1"
        strokeWidth="1"
        strokeDasharray="6 6"
      />
      <text
        x="32"
        y="130"
        fill="#475569"
        fontSize="10"
        fontWeight="700"
        letterSpacing="2"
        fontFamily="ui-sans-serif, system-ui"
      >
        R. MAGSAYSAY BLVD
      </text>

      {/* Cross streets */}
      <g fill="#ffffff">
        <rect x="220" y="20" width="14" height="240" />
        <rect x="470" y="20" width="14" height="240" />
        <rect x="595" y="20" width="14" height="240" />
        <rect x="105" y="20" width="10" height="240" />
        <rect x="370" y="20" width="10" height="240" />
        <rect x="725" y="20" width="10" height="240" />
      </g>

      {/* Park/green block */}
      <g>
        <rect x="402" y="160" width="60" height="80" rx="4" fill="#dcfce7" />
        <circle cx="412" cy="180" r="5" fill="#86efac" />
        <circle cx="426" cy="200" r="6" fill="#86efac" />
        <circle cx="445" cy="190" r="5" fill="#86efac" />
        <circle cx="450" cy="220" r="6" fill="#86efac" />
        <text
          x="406"
          y="252"
          fill="#166534"
          fillOpacity="0.7"
          fontSize="8"
          fontWeight="600"
          fontFamily="ui-sans-serif, system-ui"
        >
          PARK
        </text>
      </g>

      {/* Trees scattered */}
      <g fill="#86efac">
        <circle cx="225" cy="148" r="3" />
        <circle cx="478" cy="148" r="3" />
        <circle cx="603" cy="148" r="3" />
        <circle cx="58" cy="270" r="4" />
        <circle cx="180" cy="280" r="4" />
        <circle cx="305" cy="265" r="4" />
        <circle cx="555" cy="275" r="4" />
        <circle cx="700" cy="270" r="4" />
      </g>

      {/* Cargo Safeway pin */}
      <g transform="translate(330 110)">
        {/* glow */}
        <circle cx="0" cy="0" r="60" fill="url(#pinGlow)">
          <animate
            attributeName="r"
            values="40;65;40"
            dur="2.6s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.6;0.2;0.6"
            dur="2.6s"
            repeatCount="indefinite"
          />
        </circle>
        {/* shadow */}
        <ellipse cx="0" cy="20" rx="14" ry="3" fill="#000" opacity="0.18" />
        {/* pin body */}
        <path
          d="M0 -28c10 0 18 7.6 18 17 0 12.5-18 30-18 30S-18 1.5 -18 -11c0-9.4 8-17 18-17z"
          fill="#15803d"
        />
        <circle cx="0" cy="-11" r="8" fill="#ffffff" />
        <circle cx="0" cy="-11" r="3.5" fill="#15803d" />
      </g>

      {/* Pin label */}
      <g transform="translate(330 70)">
        <rect
          x="-72"
          y="-22"
          width="144"
          height="22"
          rx="11"
          fill="#ffffff"
          stroke="#15803d"
          strokeOpacity="0.35"
        />
        <text
          x="0"
          y="-7"
          textAnchor="middle"
          fill="#15803d"
          fontSize="10"
          fontWeight="700"
          letterSpacing="1.5"
          fontFamily="ui-sans-serif, system-ui"
        >
          CARGO SAFEWAY
        </text>
      </g>

      {/* Compass rose */}
      <g transform="translate(750 50)" opacity="0.7">
        <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
        <path d="M0 -10 L3 0 L0 10 L-3 0 Z" fill="#15803d" />
        <text
          x="0"
          y="-19"
          textAnchor="middle"
          fill="#475569"
          fontSize="8"
          fontWeight="700"
        >
          N
        </text>
      </g>

      {/* Scale bar */}
      <g transform="translate(40 290)" opacity="0.7">
        <line x1="0" y1="0" x2="80" y2="0" stroke="#475569" strokeWidth="2" />
        <line x1="0" y1="-3" x2="0" y2="3" stroke="#475569" strokeWidth="2" />
        <line x1="40" y1="-3" x2="40" y2="3" stroke="#475569" strokeWidth="2" />
        <line x1="80" y1="-3" x2="80" y2="3" stroke="#475569" strokeWidth="2" />
        <text x="40" y="14" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="600">
          200 m
        </text>
      </g>
    </svg>
  );
}
