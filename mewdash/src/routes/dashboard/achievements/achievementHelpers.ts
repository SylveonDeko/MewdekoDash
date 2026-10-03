import type {
  Achievement,
  AchievementCatalog,
  AchievementGrade,
  AchievementMetric,
} from "$lib/api/achievements/models";
import { AchievementTrigger } from "$lib/api/achievements/models";

/** Grade colors used before the catalog loads; they match the bot's. */
export const FALLBACK_GRADES: AchievementGrade[] = [
  { value: 0, name: "Bronze", points: 10, color: "#CD7F32" },
  { value: 1, name: "Silver", points: 25, color: "#C0C7D0" },
  { value: 2, name: "Gold", points: 50, color: "#F5C542" },
  { value: 3, name: "Emerald", points: 100, color: "#34D399" },
  { value: 4, name: "Amethyst", points: 250, color: "#A78BFA" },
  { value: 5, name: "Champion", points: 500, color: "#FF5D73" },
];

/** Where unlocks can be announced, with what each choice does. */
export const ANNOUNCE_MODES = [
  { value: 0, icon: "fa-wand-magic-sparkles", title: "Automatic", text: "The log channel when one is set, otherwise the channel it happened in." },
  { value: 1, icon: "fa-location-dot", title: "Where it happened", text: "In the channel the member was active in, falling back to the log channel." },
  { value: 2, icon: "fa-bell", title: "Log channel only", text: "Only in the log channel. Nothing is sent without one." },
  { value: 3, icon: "fa-envelope", title: "DMs only", text: "Only in members' DMs, for those who allow it." },
  { value: 4, icon: "fa-volume-xmark", title: "Silent", text: "Achievements unlock quietly with no message." },
];

/** What can unlock a server made achievement. */
export const CUSTOM_TRIGGERS = [
  { value: AchievementTrigger.Metric, icon: "fa-chart-simple", title: "Reach a number", text: "Messages, voice hours, invites, level, and more." },
  { value: AchievementTrigger.Keyword, icon: "fa-comments", title: "Say a phrase", text: "Unlocks when a message contains the phrase." },
  { value: AchievementTrigger.Reaction, icon: "fa-face-smile", title: "React with an emoji", text: "Unlocks the first time they react with it." },
  { value: AchievementTrigger.Manual, icon: "fa-gift", title: "Staff hand it out", text: "Only given with the grant command or from Members." },
];

/** Utility duo icon for grades and rank tiers. */
export const GRADE_ICON = "fa-trophy";

/** Prefix of glyph icon values. */
export const GLYPH_PREFIX = "fa:";

/**
 * The Font Awesome class of a glyph icon value such as "fa:trophy", or null for image icons.
 * @param icon The icon value
 */
export function glyphClass(icon: string | null | undefined): string | null {
  return icon?.startsWith(GLYPH_PREFIX) ? `fa-${icon.slice(GLYPH_PREFIX.length)}` : null;
}

/**
 * Where to load an icon image. Uploads served from the bot API come back as a path, which the dashboard
 * serves publicly under /cdn/achievement.
 * @param iconUrl The icon URL from the API
 */
export function iconImageSrc(iconUrl: string | null | undefined): string | null {
  if (!iconUrl) return null;
  const upload = /^achievements\/(\d+)\/icons\/(\d+)$/.exec(iconUrl);
  return upload ? `/cdn/achievement/${upload[1]}/${upload[2]}.png` : iconUrl;
}

/**
 * The image of an icon value the editor holds before saving: a custom emoji, an https link, or an upload.
 * @param icon The icon value
 * @param uploads The server's uploads
 */
export function draftIconSrc(
  icon: string | null | undefined,
  uploads: { icon: string; url: string }[] = [],
): string | null {
  if (!icon) return null;
  const upload = uploads.find((u) => u.icon === icon);
  if (upload) return iconImageSrc(upload.url);
  const emoji = emojiImageUrl(icon);
  if (emoji) return emoji;
  return icon.startsWith("https://") ? icon : null;
}

/** Key of the category server made achievements land in by default. */
export const CUSTOM_CATEGORY = "custom";

/** Keys of categories server made achievements cannot use. */
export const RESERVED_CATEGORIES = ["global", "prestige"];

/**
 * The grade facts for a value, falling back to bronze.
 * @param grades Grades from the catalog
 * @param value 0 to 5
 */
export function gradeOf(grades: AchievementGrade[], value: number): AchievementGrade {
  return grades.find((g) => g.value === value) ?? grades[0] ?? FALLBACK_GRADES[0];
}

/**
 * The metric facts for a value.
 * @param catalog The catalog
 * @param value The metric value
 */
export function metricOf(catalog: AchievementCatalog | null, value: number): AchievementMetric | undefined {
  return catalog?.metrics.find((m) => m.value === value);
}

/**
 * A short line saying what unlocks an achievement.
 * @param achievement The achievement
 * @param catalog The catalog, for metric labels
 */
export function criteriaText(achievement: Achievement, catalog: AchievementCatalog | null): string {
  switch (achievement.trigger) {
    case AchievementTrigger.Metric: {
      const metric = metricOf(catalog, achievement.metric);
      if (!metric) return `Reach ${achievement.threshold.toLocaleString()}`;
      const unit = achievement.threshold === 1 ? metric.unit : metric.unitPlural;
      return `${metric.label}: ${achievement.threshold.toLocaleString()} ${unit}`;
    }
    case AchievementTrigger.Keyword:
      return `Says "${achievement.keyword ?? ""}"`;
    case AchievementTrigger.Reaction:
      return `Reacts with ${achievement.keyword ?? ""}`;
    case AchievementTrigger.Manual:
      return "Handed out by staff";
    case AchievementTrigger.Feat:
      return "A one time moment";
    case AchievementTrigger.Completion:
      return "Finish a category";
    default:
      return "";
  }
}

/**
 * The image URL for a custom emoji such as <:name:id>, or null for unicode emojis.
 * @param emoji The emoji text
 */
export function emojiImageUrl(emoji: string | null | undefined): string | null {
  if (!emoji) return null;
  const match = emoji.match(/^<(a?):[^:]+:(\d+)>$/);
  if (!match) return null;
  return `https://cdn.discordapp.com/emojis/${match[2]}.${match[1] === "a" ? "gif" : "png"}?size=48`;
}

/**
 * Turns a stored message source into the embed builder's value.
 * @param raw The stored source
 */
export function parseMessageSource(raw: string | null | undefined): Record<string, any> {
  if (!raw || !raw.trim()) return {};
  if (raw.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : { content: raw };
    } catch {
      return { content: raw };
    }
  }
  return { content: raw };
}

/**
 * Serializes an embed builder value for saving, or "" when it shows nothing.
 * @param value The embed builder value
 */
export function serializeMessage(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object" || Object.keys(value).length === 0) return "";
  const source = value as Record<string, any>;
  const content = typeof source.content === "string" ? source.content.trim() : "";
  const embeds = Array.isArray(source.embeds) ? source.embeds : [];
  const hasEmbed = embeds.some((embed: Record<string, any>) =>
    embed?.title?.trim?.() || embed?.description?.trim?.() || embed?.fields?.length > 0 ||
    embed?.author?.name?.trim?.() || embed?.footer?.text?.trim?.() || embed?.image?.url?.trim?.());
  return content || hasEmbed ? JSON.stringify(value) : "";
}

/**
 * A relative time such as "3h ago".
 * @param iso An ISO timestamp
 */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "never";
  const stamp = iso.endsWith("Z") || iso.includes("+") ? iso : `${iso}Z`;
  const seconds = Math.max(0, (Date.now() - new Date(stamp).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 30) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(stamp).toLocaleDateString();
}

/** Names and help for the features that feed achievements data. */
export const DATA_SOURCES: Record<string, { label: string; icon: string; off: string; href?: string }> = {
  messages: { label: "Message counting", icon: "fa-comments", off: "Message achievements can't track until message counting is on." },
  voice: { label: "Voice tracking", icon: "fa-microphone", off: "Voice hours and channels need voice tracking in Server Stats.", href: "/dashboard/serverstats" },
  invites: { label: "Invite tracking", icon: "fa-users", off: "Invite achievements need invite tracking.", href: "/dashboard/invites" },
  commands: { label: "Command stats", icon: "fa-code", off: "Command achievements need command stats, which this server opted out of." },
  xp: { label: "XP", icon: "fa-star", off: "Level achievements need XP gain turned on.", href: "/dashboard/xp" },
  reputation: { label: "Reputation", icon: "fa-trophy", off: "Reputation achievements need the reputation system.", href: "/dashboard/reputation" },
};
