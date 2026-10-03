import type {
  AchievementCardCustomType,
  AchievementCardElement,
  AchievementCardTemplate,
} from "$lib/api/achievements/models";

/** Color token names: the server palette and the achievement's grade color. */
export const CARD_TOKENS = ["primary", "secondary", "accent", "text", "muted", "grade"] as const;

/** Every built in element kind, in the order the layer list explains them. */
export const BUILT_IN_TYPES = [
  "icon", "grade", "label", "title", "description", "progress", "avatar", "member", "category", "points", "more",
] as const;

/** What each element kind is called and its icon. */
export const ELEMENT_KINDS: Record<string, { label: string; icon: string; hint: string }> = {
  icon: { label: "Icon tile", icon: "fa-crown", hint: "The achievement's icon on a tile" },
  grade: { label: "Grade badge", icon: "fa-trophy", hint: "Bronze, Silver, and so on" },
  label: { label: "State line", icon: "fa-tag", hint: "\"Achievement unlocked\" or \"Locked\"" },
  title: { label: "Title", icon: "fa-heading", hint: "The achievement's name" },
  description: { label: "Description", icon: "fa-align-left", hint: "What it asks for" },
  progress: { label: "Progress bar", icon: "fa-bars-progress", hint: "Shown on locked achievements with a goal" },
  avatar: { label: "Avatar", icon: "fa-circle-user", hint: "The member's avatar" },
  member: { label: "Member line", icon: "fa-user", hint: "The member's name and the server" },
  category: { label: "Category badge", icon: "fa-layer-group", hint: "The achievement's category" },
  points: { label: "Points badge", icon: "fa-star", hint: "Points it is worth" },
  more: { label: "More badge", icon: "fa-plus", hint: "\"+2 more\" when several unlock at once" },
  rectangle: { label: "Rectangle", icon: "fa-square", hint: "A box, panel, or stripe" },
  ellipse: { label: "Ellipse", icon: "fa-circle", hint: "A circle or oval" },
  text: { label: "Text", icon: "fa-font", hint: "Your own text, with placeholders" },
  image: { label: "Image", icon: "fa-image", hint: "An uploaded or linked image" },
  glyph: { label: "Icon", icon: "fa-icons", hint: "Any Font Awesome icon" },
};

/** Element kinds a server can add. */
export const CUSTOM_TYPES: AchievementCardCustomType[] = ["rectangle", "ellipse", "text", "image", "glyph"];

/** Kinds drawn as text. */
export const TEXT_TYPES = ["label", "title", "description", "member", "text"];

/** Kinds drawn as badges. */
export const PILL_TYPES = ["grade", "category", "points", "more"];

/** Kinds with a fill, outline, and corners. */
export const SHAPE_TYPES = ["rectangle", "ellipse", "icon", "avatar", "progress", ...PILL_TYPES];

/**
 * Whether an element kind is built in.
 * @param type The kind
 */
export function isBuiltIn(type: string): boolean {
  return (BUILT_IN_TYPES as readonly string[]).includes(type);
}

/**
 * The name shown for an element in the layer list.
 * @param element The element
 */
export function elementName(element: AchievementCardElement): string {
  return element.name || ELEMENT_KINDS[element.type]?.label || element.type;
}

/**
 * Splits a color token into its base (a token name or #rrggbb) and alpha (0 to 255).
 * @param value The token
 */
export function parseToken(value: string): { base: string; alpha: number } {
  if (!value) return { base: "", alpha: 255 };
  if (value.startsWith("#")) {
    return value.length === 9
      ? { base: value.slice(0, 7), alpha: parseInt(value.slice(7), 16) }
      : { base: value, alpha: 255 };
  }
  const [base, alpha] = value.split("@");
  return { base, alpha: alpha ? parseInt(alpha, 16) : 255 };
}

/**
 * A color token as CSS, or null for none.
 * @param value The token
 * @param palette The bot's palette by token name
 * @param grade The grade color
 */
export function resolveToken(value: string, palette: Record<string, string>, grade: string): string | null {
  const { base, alpha } = parseToken(value);
  if (!base) return null;
  const hex = base.startsWith("#") ? base : base === "grade" ? grade : palette[base];
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return null;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${(alpha / 255).toFixed(3)})`;
}

/**
 * A short description of a color token, such as "primary at 19%".
 * @param value The token
 */
export function tokenLabel(value: string): string {
  if (!value) return "None";
  const { base, alpha } = parseToken(value);
  return alpha >= 255 ? base : `${base} at ${Math.round(alpha / 2.55)}%`;
}

/**
 * An element ID not used yet in the template.
 * @param template The template
 * @param type The element kind
 */
export function uniqueId(template: AchievementCardTemplate, type: string): string {
  let n = 1;
  while (template.elements.some((e) => e.id === `${type}-${n}`)) n++;
  return `${type}-${n}`;
}

/**
 * A new custom element in the middle of the card.
 * @param template The template it joins
 * @param type The element kind
 */
export function newElement(template: AchievementCardTemplate, type: AchievementCardCustomType): AchievementCardElement {
  const sizes: Record<AchievementCardCustomType, [number, number]> = {
    rectangle: [320, 120],
    ellipse: [160, 160],
    text: [420, 40],
    image: [200, 200],
    glyph: [120, 120],
  };
  const [w, h] = sizes[type];
  return {
    id: uniqueId(template, type),
    type,
    name: "",
    visible: true,
    show: "always",
    x: Math.round((template.width - w) / 2),
    y: Math.round((template.height - h) / 2),
    w,
    h,
    rotation: 0,
    opacity: 1,
    fill: type === "rectangle" || type === "ellipse" ? "primary@20" : "",
    fill2: "",
    fillAngle: 135,
    stroke: "",
    strokeWidth: 0,
    radius: type === "rectangle" ? 24 : type === "image" ? 16 : 0,
    shadowColor: "",
    shadowBlur: 0,
    shadowX: 0,
    shadowY: 0,
    color: type === "glyph" ? "primary" : "text",
    color2: type === "text" ? "primary" : "muted",
    color3: type === "glyph" ? "secondary" : "",
    fontSize: 28,
    bold: true,
    align: "left",
    uppercase: false,
    spacing: 0,
    lineHeight: 1.25,
    maxLines: 1,
    text: type === "text" ? "{achievement.name}" : "",
    glyph: type === "glyph" ? "star" : "",
    url: "",
    fit: "cover",
    autoWidth: true,
    followId: "",
    besideId: "",
    gap: 10,
  };
}

/**
 * A deep copy, so edits never touch the copy held for undo or for the saved state.
 * @param template The template
 */
export function cloneTemplate(template: AchievementCardTemplate): AchievementCardTemplate {
  return JSON.parse(JSON.stringify(template));
}
