import { m } from "$lib/i18n";
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
export const ELEMENT_KINDS: Record<string, { label: () => string; icon: string; hint: () => string }> = {
  icon: { label: m.achievements.cardHelpersKindIconLabel, icon: "fa-crown", hint: m.achievements.cardHelpersKindIconHint },
  grade: { label: m.achievements.cardHelpersKindGradeLabel, icon: "fa-trophy", hint: m.achievements.cardHelpersKindGradeHint },
  label: { label: m.achievements.cardHelpersKindLabelLabel, icon: "fa-tag", hint: m.achievements.cardHelpersKindLabelHint },
  title: { label: m.common.title, icon: "fa-heading", hint: m.achievements.cardHelpersKindTitleHint },
  description: { label: m.common.description, icon: "fa-align-left", hint: m.achievements.cardHelpersKindDescriptionHint },
  progress: { label: m.common.progressBar, icon: "fa-bars-progress", hint: m.achievements.cardHelpersKindProgressHint },
  avatar: { label: m.common.avatar, icon: "fa-circle-user", hint: m.achievements.cardHelpersKindAvatarHint },
  member: { label: m.achievements.cardHelpersKindMemberLabel, icon: "fa-user", hint: m.achievements.cardHelpersKindMemberHint },
  category: { label: m.achievements.cardHelpersKindCategoryLabel, icon: "fa-layer-group", hint: m.achievements.cardHelpersKindCategoryHint },
  points: { label: m.achievements.cardHelpersKindPointsLabel, icon: "fa-star", hint: m.achievements.cardHelpersKindPointsHint },
  more: { label: m.achievements.cardHelpersKindMoreLabel, icon: "fa-plus", hint: m.achievements.cardHelpersKindMoreHint },
  rectangle: { label: m.common.rectangle, icon: "fa-square", hint: m.achievements.cardHelpersKindRectangleHint },
  ellipse: { label: m.common.ellipse, icon: "fa-circle", hint: m.achievements.cardHelpersKindEllipseHint },
  text: { label: m.common.text, icon: "fa-font", hint: m.achievements.cardHelpersKindTextHint },
  image: { label: m.common.image, icon: "fa-image", hint: m.achievements.cardHelpersKindImageHint },
  glyph: { label: m.achievements.editorIconLabel, icon: "fa-icons", hint: m.achievements.cardHelpersKindGlyphHint },
};

/** Element kinds a server can add. */
export const CUSTOM_TYPES: AchievementCardCustomType[] = ["rectangle", "ellipse", "text", "image", "glyph"];

/** Kinds drawn as text. */
export const TEXT_TYPES = ["label", "title", "description", "member", "text"];

/** Kinds drawn as badges. */
export const PILL_TYPES = ["grade", "category", "points", "more"];

/** What each built in kind shows when its text is left empty. */
export const DEFAULT_TEXT: Record<string, string> = {
  title: "%achievement.name%",
  description: "%achievement.description%",
  grade: "%achievement.grade%",
  category: "%achievement.category%",
  points: "%points%",
  more: "%more%",
};

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
  return element.name || ELEMENT_KINDS[element.type]?.label() || element.type;
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
  if (!value) return m.common.none();
  const { base, alpha } = parseToken(value);
  return alpha >= 255 ? tokenName(base) : m.achievements.cardHelpersTokenAtAlpha({ token: tokenName(base), percent: Math.round(alpha / 2.55) });
}

/**
 * The display name of a color token; custom colors stay as their hex.
 * @param base A token name or #rrggbb
 */
export function tokenName(base: string): string {
  switch (base) {
    case "primary": return m.achievements.cardHelpersTokenPrimary();
    case "secondary": return m.achievements.cardHelpersTokenSecondary();
    case "accent": return m.achievements.cardHelpersTokenAccent();
    case "text": return m.achievements.cardHelpersTokenText();
    case "muted": return m.common.muted();
    case "grade": return m.achievements.cardHelpersTokenGrade();
    default: return base;
  }
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
    text: type === "text" ? "%achievement.name%" : "",
    lockedText: "",
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
