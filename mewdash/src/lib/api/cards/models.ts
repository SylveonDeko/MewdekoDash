/**
 * What fills a card behind its elements
 * Maps to Mewdeko.Common.Cards.CardBackground
 */
export interface CardBackground {
  /** palette, solid, gradient, or image */
  kind: "palette" | "solid" | "gradient" | "image";
  color: string;
  color2: string;
  angle: number;
  /** An https URL or upload:id */
  url: string;
  fit: "cover" | "contain";
  /** How much the page color covers an image, 0 to 1 */
  dim: number;
  /** Whether the palette wash is laid over solid, gradient, and image backgrounds */
  wash: boolean;
}

/** Achievement card kinds shown once each, hidden rather than removed. */
export type CardBuiltInType =
  | "icon" | "grade" | "label" | "title" | "description" | "progress"
  | "avatar" | "member" | "category" | "points" | "more";

/** Element kinds a design can hold any number of. Which ones a feature offers is up to the feature. */
export type CardCustomType =
  | "rectangle" | "ellipse" | "text" | "image" | "glyph"
  | "avatar" | "username" | "servername" | "servericon" | "membercount";

/**
 * One element of a card. Colors are tokens: #rrggbb, #rrggbbaa, or a palette name
 * (primary, secondary, accent, text, muted, grade) with an optional hex alpha such as primary@30.
 * Maps to Mewdeko.Common.Cards.CardElement
 */
export interface CardElement {
  id: string;
  type: CardBuiltInType | CardCustomType;
  name: string;
  visible: boolean;
  show: "always" | "unlocked" | "locked";
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  opacity: number;
  fill: string;
  fill2: string;
  fillAngle: number;
  stroke: string;
  strokeWidth: number;
  radius: number;
  shadowColor: string;
  shadowBlur: number;
  shadowX: number;
  shadowY: number;
  color: string;
  color2: string;
  color3: string;
  fontSize: number;
  bold: boolean;
  /** Empty for Noto Sans, or unisans */
  font: string;
  /** Whether single line text shrinks to fit its box before it is cut short */
  shrink: boolean;
  align: "left" | "center" | "right";
  uppercase: boolean;
  spacing: number;
  lineHeight: number;
  maxLines: number;
  text: string;
  lockedText: string;
  glyph: string;
  url: string;
  fit: "cover" | "contain";
  autoWidth: boolean;
  followId: string;
  besideId: string;
  gap: number;
}

/**
 * A card design
 * Maps to Mewdeko.Common.Cards.CardTemplate
 */
export interface CardTemplate {
  width: number;
  height: number;
  radius: number;
  borderColor: string;
  borderWidth: number;
  shadow: boolean;
  background: CardBackground;
  /** Back to front */
  elements: CardElement[];
}

/** An image a design can use */
export interface CardImage {
  id: number;
  /** The value designs link it with: upload:id */
  icon: string;
  /** What to show for it: a public URL, an API path, or a data URI */
  url: string;
}

/** Where one element landed on a drawn card, in card pixels. */
export interface CardBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  drawn: boolean;
}

/** A drawn card preview */
export interface CardPreview {
  image: string;
  width: number;
  height: number;
  /** Transparent space around the card on every side */
  margin: number;
  layout: CardBox[];
  template: CardTemplate | null;
}
