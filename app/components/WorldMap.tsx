// Stylized dotted world map. Continents are approximated by polygons; we render
// a dot at every grid point that falls inside one of those polygons.

type Pt = [number, number];
type Polygon = Pt[];

const CONTINENTS: Polygon[] = [
  // North America
  [
    [70, 95], [150, 70], [240, 70], [305, 100], [320, 150], [300, 200],
    [255, 235], [205, 250], [165, 255], [130, 235], [95, 200], [75, 160],
  ],
  // Central America strip
  [
    [225, 235], [260, 240], [275, 270], [255, 285], [230, 275],
  ],
  // South America
  [
    [250, 280], [300, 280], [320, 320], [310, 380], [280, 430], [250, 445],
    [225, 410], [220, 360], [230, 320],
  ],
  // Greenland
  [
    [340, 60], [385, 55], [400, 90], [380, 115], [345, 110], [330, 85],
  ],
  // Europe
  [
    [455, 105], [510, 95], [555, 100], [575, 130], [560, 165], [510, 175],
    [470, 165], [450, 140],
  ],
  // Africa
  [
    [475, 200], [540, 195], [585, 215], [600, 270], [580, 330], [545, 380],
    [515, 400], [485, 380], [465, 330], [460, 270], [465, 230],
  ],
  // Middle East / Arabia
  [
    [560, 195], [610, 200], [625, 235], [605, 255], [575, 245], [560, 220],
  ],
  // Asia (large)
  [
    [555, 95], [640, 80], [740, 80], [820, 95], [870, 120], [880, 165],
    [855, 200], [800, 220], [740, 235], [685, 235], [640, 220], [600, 195],
    [575, 165], [560, 130],
  ],
  // India subcontinent
  [
    [690, 215], [730, 215], [735, 255], [710, 280], [690, 260],
  ],
  // Southeast Asia / Indonesia
  [
    [780, 245], [840, 245], [870, 265], [855, 285], [800, 280], [780, 265],
  ],
  // Japan
  [
    [880, 155], [905, 150], [915, 175], [895, 195], [875, 180],
  ],
  // Australia
  [
    [820, 330], [890, 320], [925, 340], [920, 380], [870, 395], [820, 385],
    [800, 360],
  ],
];

function pointInPolygon(pt: Pt, poly: Polygon): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect =
      yi > pt[1] !== yj > pt[1] &&
      pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function buildDots() {
  const dots: Pt[] = [];
  const step = 9;
  for (let y = 50; y <= 450; y += step) {
    // Stagger every other row for a denser, more organic look
    const offset = (Math.floor(y / step) % 2) * (step / 2);
    for (let x = 50; x <= 950; x += step) {
      const pt: Pt = [x + offset, y];
      for (const c of CONTINENTS) {
        if (pointInPolygon(pt, c)) {
          dots.push(pt);
          break;
        }
      }
    }
  }
  return dots;
}

const DOTS = buildDots();

// Route: from China (origin) heading west across Asia/Europe to North America east coast
const ROUTE = {
  origin: { x: 770, y: 175 },     // China
  destination: { x: 230, y: 195 }, // North America
};

export default function WorldMap() {
  return (
    <div className="w-full">
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-auto"
        role="img"
        aria-label="World map showing shipping route from China"
      >
        <defs>
          <linearGradient id="route" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#2563ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#2563ff" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Dotted continents */}
        <g fill="#cfd6e4">
          {DOTS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1.6} />
          ))}
        </g>

        {/* Route arc */}
        <path
          d={`M ${ROUTE.origin.x} ${ROUTE.origin.y} Q 500 60 ${ROUTE.destination.x} ${ROUTE.destination.y}`}
          stroke="url(#route)"
          strokeWidth="2"
          strokeDasharray="2 6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Origin pin (China) — package icon */}
        <Pin x={ROUTE.origin.x} y={ROUTE.origin.y} icon="package" />
        {/* Destination pin */}
        <Pin x={ROUTE.destination.x} y={ROUTE.destination.y} icon="pin" />
      </svg>
    </div>
  );
}

function Pin({
  x,
  y,
  icon,
}: {
  x: number;
  y: number;
  icon: "package" | "pin";
}) {
  return (
    <g transform={`translate(${x - 18} ${y - 36})`}>
      {/* Drop shadow */}
      <ellipse cx="18" cy="40" rx="10" ry="2.5" fill="#000" opacity="0.08" />
      {/* Pin body */}
      <path
        d="M18 0c9.94 0 18 7.61 18 17 0 12.5-18 22-18 22S0 29.5 0 17C0 7.61 8.06 0 18 0z"
        fill="#2563ff"
      />
      <circle cx="18" cy="17" r="11" fill="#ffffff" />
      {icon === "package" ? (
        <g transform="translate(10 9.5)" fill="#2563ff">
          <path d="M8 0L0 3.2v8L8 14.5l8-3.3v-8L8 0zm0 1.8l5.6 2.2L8 6.3 2.4 4 8 1.8zM1.5 5l5.7 2.3v6L1.5 11V5zm13 0v6l-5.7 2.3v-6L14.5 5z" />
        </g>
      ) : (
        <circle cx="18" cy="17" r="4.2" fill="#2563ff" />
      )}
    </g>
  );
}
