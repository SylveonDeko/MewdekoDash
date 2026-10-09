/**
 * Shapes for the mascot's nine tails. Each tail sits in one of nine slots fanned around the cat and can slide
 * between neighbouring slots, which is how the tails turn like a wheel. A tail swaps what it carries while it
 * passes behind the cat, so the wheel can show more things than there are tails.
 */

export type Point = [number, number];

/** The things a tail can carry, one for each part of the bot. */
export type MascotToolName =
  | "star"
  | "chart"
  | "bubble"
  | "coins"
  | "gift"
  | "note"
  | "shield"
  | "wrench"
  | "clipboard"
  | "pin"
  | "paw"
  | "tag"
  | "cake"
  | "bell"
  | "mic"
  | "dice"
  | "clock"
  | "bulb";

/** The faces the cat can pull. "look" has it glancing up at its tails. */
export type MascotExpression =
  | "neutral"
  | "happy"
  | "excited"
  | "wink"
  | "determined"
  | "vibing"
  | "surprised"
  | "starry"
  | "look"
  | "sad";

/** What the tails carry when nothing else is asked for, starting with the tail at the top. */
export const DEFAULT_TOOLS: MascotToolName[] = [
  "star",
  "chart",
  "bubble",
  "coins",
  "gift",
  "note",
  "shield",
  "wrench",
  "clipboard"
];

/** The slot above the cat's head, where the featured tail ends up. */
export const TOP_SLOT = 4;

export const SLOT_COUNT = 9;

/** How far each tool's lowest point sits below its own origin, so it can stand on a tail. */
const TOOL_BASE: Record<MascotToolName, number> = {
  wrench: 4,
  bubble: 38,
  shield: 32,
  coins: 14,
  note: 11,
  gift: 20,
  clipboard: 30,
  chart: 26,
  star: 30,
  pin: 26,
  paw: 28,
  tag: 26,
  cake: 26,
  bell: 32,
  mic: 29,
  dice: 27,
  clock: 26,
  bulb: 26
};

/** The path each slot's tail follows from the cat's back to its tip, lower left round to lower right. */
const SLOT_WAYPOINTS: Point[][] = [
  [[236, 342], [196, 384], [124, 388], [60, 420], [-20, 412], [-60, 398], [-100, 398]],
  [[234, 334], [170, 340], [110, 300], [40, 306], [-30, 270], [-76, 262], [-116, 262]],
  [[236, 330], [180, 296], [104, 284], [76, 214], [44, 150], [0, 126], [-50, 126]],
  [[238, 326], [214, 250], [150, 190], [110, 110], [112, 30], [66, -14], [16, -14]],
  [[240, 326], [230, 200], [252, 70], [240, -64]],
  [[242, 326], [290, 256], [330, 170], [372, 96], [378, 20], [420, -30], [470, -30]],
  [[244, 330], [300, 290], [380, 280], [420, 220], [440, 164], [480, 150], [528, 150]],
  [[246, 334], [318, 346], [388, 306], [440, 300], [500, 262], [552, 240], [600, 240]],
  [[244, 342], [292, 388], [362, 392], [428, 420], [500, 410], [548, 384], [590, 384]]
];

/** Where a card describing a slot's tail sits, just beyond the tail's tip. */
const CARD_ANCHORS: Point[] = [
  [-300, 400],
  [-312, 262],
  [-250, 126],
  [-176, -30],
  [240, -150],
  [672, -46],
  [724, 150],
  [796, 240],
  [788, 386]
];

const SAMPLES = 110;
const FAT = 46;
const TIP_START = Math.floor(SAMPLES * 0.72);
/** Roughly how far apart neighbouring points sit along a tail, in drawing units. */
const SPACING = 4.3;

/**
 * A small uneven ripple for a spot along a tail's edge, which gives the outline a hand-drawn fuzz. It depends
 * only on the tail and the spot, so the fuzz travels with the tail and never shimmers.
 * @param spot How far along the edge, in points
 * @param seed A number that makes each edge of each tail ripple differently
 */
function fuzz(spot: number, seed: number): number {
  const along = spot * SPACING;
  return (
    1.1 * Math.sin(along * 0.085 + seed * 1.7) +
    0.7 * Math.sin(along * 0.19 + seed * 2.9 + 1) +
    0.4 * Math.sin(along * 0.37 + seed * 4.3 + 2)
  );
}

/**
 * Draws a smooth curve through waypoints.
 * @param points The waypoints
 * @param steps Points produced between each pair of waypoints
 */
function spline(points: Point[], steps: number): Point[] {
  const padded = [points[0], ...points, points[points.length - 1]];
  const out: Point[] = [];
  for (let i = 1; i < padded.length - 2; i++) {
    const [p0, p1, p2, p3] = [padded[i - 1], padded[i], padded[i + 1], padded[i + 2]];
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      const at = (j: 0 | 1) =>
        0.5 *
        (2 * p1[j] +
          (-p0[j] + p2[j]) * t +
          (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t +
          (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t * t * t);
      out.push([at(0), at(1)]);
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

/**
 * Spaces points evenly along a curve, so two curves can be blended point by point.
 * @param curve The curve
 * @param count How many points to return
 */
function resample(curve: Point[], count: number): Point[] {
  const lengths = [0];
  for (let i = 1; i < curve.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(curve[i][0] - curve[i - 1][0], curve[i][1] - curve[i - 1][1]));
  }
  const total = lengths[lengths.length - 1];
  const out: Point[] = [];
  let segment = 1;
  for (let i = 0; i < count; i++) {
    const target = (total * i) / (count - 1);
    while (segment < curve.length - 1 && lengths[segment] < target) segment++;
    const span = lengths[segment] - lengths[segment - 1] || 1;
    const t = (target - lengths[segment - 1]) / span;
    out.push([
      curve[segment - 1][0] + (curve[segment][0] - curve[segment - 1][0]) * t,
      curve[segment - 1][1] + (curve[segment][1] - curve[segment - 1][1]) * t
    ]);
  }
  return out;
}

const SLOTS: Point[][] = SLOT_WAYPOINTS.map((points) => resample(spline(points, 40), SAMPLES));

/**
 * Writes points as a closed SVG path that curves through them, so the outline has no corners.
 * @param points The points
 */
function toPath(points: Point[]): string {
  const count = points.length;
  const mid = (a: Point, b: Point) => `${((a[0] + b[0]) / 2).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)}`;
  let d = `M${mid(points[count - 1], points[0])}`;
  for (let i = 0; i < count; i++) {
    d += `Q${points[i][0].toFixed(1)} ${points[i][1].toFixed(1)} ${mid(points[i], points[(i + 1) % count])}`;
  }
  return `${d}Z`;
}

/**
 * A number wrapped into a range starting at zero.
 * @param value The number
 * @param size The size of the range
 */
function wrap(value: number, size: number): number {
  return ((value % size) + size) % size;
}

/** One tail, ready to draw. */
export interface TailShape {
  /** Which tail this is. */
  index: number;
  /** Which entry of the tool list this tail carries right now. */
  feature: number;
  tool: MascotToolName;
  /** The whole tail's outline. */
  outline: string;
  /** The pale end of the tail. */
  tip: string;
  /** 0 for a tail out at the side, 1 for one behind the cat's head. */
  depth: number;
  /** How close the tail is to the top slot, from 0 to 1. */
  featured: number;
  /** How many slots the tail is from the top slot. */
  distance: number;
  /** 0 while the tail passes behind the cat and swaps its tool, 1 otherwise. */
  shown: number;
  /** Where the tool stands, and how far it leans. */
  toolX: number;
  toolY: number;
  toolAngle: number;
  /** The small pad a tail grows under its tool when it points straight up. */
  padX: number;
  padY: number;
  padOpacity: number;
  /** Where a card describing this tail sits. */
  cardX: number;
  cardY: number;
}

/**
 * Builds a tail at a position on the wheel.
 * @param index Which tail
 * @param position Its slot, where a fraction means it is part way to the next slot
 * @param feature Which entry of the tool list it carries
 * @param tool The tool it carries
 */
function buildTail(index: number, position: number, feature: number, tool: MascotToolName): TailShape {
  const from = Math.floor(position) % SLOT_COUNT;
  const to = (from + 1) % SLOT_COUNT;
  const blend = position - Math.floor(position);
  const centre: Point[] = SLOTS[from].map((p, i) => [
    p[0] + (SLOTS[to][i][0] - p[0]) * blend,
    p[1] + (SLOTS[to][i][1] - p[1]) * blend
  ]);

  const distance = Math.min(Math.abs(position - TOP_SLOT), SLOT_COUNT - Math.abs(position - TOP_SLOT));
  const depth = Math.min(Math.max(2 - distance, 0), 1);
  const featured = Math.min(Math.max(1 - distance, 0), 1);
  const shown = from === SLOT_COUNT - 1 ? Math.min(1, Math.abs(blend - 0.5) * 2.6) : 1;

  const left: Point[] = [];
  const right: Point[] = [];
  const normals: Point[] = [];
  const widths: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const a = centre[Math.max(i - 1, 0)];
    const b = centre[Math.min(i + 1, SAMPLES - 1)];
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / length;
    const ny = (b[0] - a[0]) / length;
    const t = i / (SAMPLES - 1);
    const body = 12 * (1 - t) + FAT * Math.min(1, t / 0.5) ** 0.8 * (1 - 0.22 * Math.max(0, (t - 0.5) / 0.5));
    const tuft = 1 + 0.07 * Math.sin(t * Math.PI * 7) * Math.sin(t * Math.PI);
    const width = body * tuft;
    const wobbleLeft = fuzz(i, index);
    const wobbleRight = fuzz(i + 40, index + 0.5);
    normals.push([nx, ny]);
    widths.push(width);
    left.push([centre[i][0] + nx * (width / 2 + wobbleLeft), centre[i][1] + ny * (width / 2 + wobbleLeft)]);
    right.push([centre[i][0] - nx * (width / 2 + wobbleRight), centre[i][1] - ny * (width / 2 + wobbleRight)]);
  }

  const end = centre[SAMPLES - 1];
  const [nx, ny] = normals[SAMPLES - 1];
  const ux = ny;
  const uy = -nx;
  const radius = widths[SAMPLES - 1] / 2;
  const cap: Point[] = [];
  for (let k = 1; k < 10; k++) {
    const angle = (Math.PI * k) / 10;
    cap.push([
      end[0] + (nx * Math.cos(angle) + ux * Math.sin(angle)) * radius,
      end[1] + (ny * Math.cos(angle) + uy * Math.sin(angle)) * radius
    ]);
  }

  const outline = [...left, ...cap, ...right.slice().reverse()];
  const tip = [...left.slice(TIP_START), ...cap, ...right.slice(TIP_START).reverse(), centre[TIP_START - 8]];

  const flat = Math.abs(ux);
  const perch = Math.floor(SAMPLES * 0.9);
  const up = normals[perch][1] < 0 ? 1 : -1;
  const shelfX = centre[perch][0] + (normals[perch][0] * up * widths[perch]) / 2;
  const shelfY = centre[perch][1] + (normals[perch][1] * up * widths[perch]) / 2;
  const padX = end[0];
  const padY = end[1] - 12;
  const standX = padX + (shelfX - padX) * flat;
  const standY = padY - 15 + (shelfY - (padY - 15)) * flat;
  const anchorFrom = CARD_ANCHORS[from];
  const anchorTo = CARD_ANCHORS[to];

  return {
    index,
    feature,
    tool,
    outline: toPath(outline),
    tip: toPath(tip),
    depth,
    featured,
    distance,
    shown,
    toolX: tool === "wrench" ? standX + 30 * flat : standX,
    toolY: tool === "wrench" ? standY - TOOL_BASE.wrench : standY - TOOL_BASE[tool] + 5,
    toolAngle: tool === "wrench" ? -62 * flat : 0,
    padX,
    padY,
    padOpacity: (1 - flat) * shown,
    cardX: anchorFrom[0] + (anchorTo[0] - anchorFrom[0]) * blend,
    cardY: anchorFrom[1] + (anchorTo[1] - anchorFrom[1]) * blend
  };
}

/**
 * Builds all nine tails for a turn of the wheel, ordered back to front for drawing. With the wheel turned to
 * minus N, entry N of the tool list is at the top, the entries after it run down the right side and the entries
 * before it run down the left.
 * @param turn How many slots the wheel has turned. Fractions are part way between slots.
 * @param toolSet What the tails carry, in the order they come to the top
 */
export function buildTails(turn: number, toolSet: MascotToolName[] = DEFAULT_TOOLS): TailShape[] {
  const tails: TailShape[] = [];
  for (let index = 0; index < SLOT_COUNT; index++) {
    const travelled = index + turn;
    const position = wrap(travelled, SLOT_COUNT);
    const laps = Math.floor((travelled + 0.5) / SLOT_COUNT);
    const feature = wrap(index - TOP_SLOT - laps * SLOT_COUNT, toolSet.length);
    tails.push(buildTail(index, position, feature, toolSet[feature]));
  }
  return tails.sort((a, b) => b.depth - a.depth || a.distance - b.distance);
}
