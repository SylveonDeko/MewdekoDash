import { m } from "$lib/i18n";

export type Named = { id: string; name: string; color?: number };

export type Tab = "repeaters" | "stickies" | "reactions";

export const TABS: Tab[] = ["repeaters", "stickies", "reactions"];

export interface ForumChannel {
  id: string;
  name: string;
  tags: Array<{ id: string; name: string }>;
}

export interface Shared {
  guildId: bigint;
  channels: Named[];
  forums: ForumChannel[];
  roles: Named[];
  members: Named[];
  emojis: import("$lib/api/client/models").GuildEmojiInfo[];
  loading: boolean;
}

/**
 * Turns an id the API returned, which may be a big number object, into a string.
 * @param value The id
 */
export function idString(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

/**
 * Picks the message to show from an error, falling back to a given text.
 * @param err The thrown value
 * @param fallback The text when the error has none
 */
export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/**
 * Shows the first line of a stored message, which is plain text or embed JSON.
 * @param content The stored message
 */
export function preview(content: string | null | undefined): string {
  if (!content) return m.channelMessages.emptyMessage();
  const text = content.trim();
  if (text.startsWith("{")) {
    try {
      const parsed = JSON.parse(text);
      const embed = Array.isArray(parsed.embeds) ? parsed.embeds[0] : null;
      const value = parsed.content || parsed.plainText || embed?.title || embed?.description;
      if (typeof value === "string" && value.trim()) return value.trim();
      return m.channelMessages.embedMessage();
    } catch {
      return text;
    }
  }
  return text;
}

export type DurationUnit = "s" | "m" | "h" | "d";

export const UNIT_SECONDS: Record<DurationUnit, number> = { s: 1, m: 60, h: 3600, d: 86400 };

/**
 * Reads a .NET time span such as 1.02:00:00 or 00:05:00 as seconds.
 * @param value The time span text
 * @param fallback What to return when the text is empty or not a time span
 */
export function spanSeconds(value: string | null | undefined, fallback = 0): number {
  const match = /^(?:(\d+)\.)?(\d{1,2}):(\d{2}):(\d{2})/.exec((value ?? "").trim());
  if (!match) return fallback;
  return Number(match[1] ?? 0) * 86400 + Number(match[2]) * 3600 + Number(match[3]) * 60 + Number(match[4]);
}

/**
 * Writes seconds as a .NET time span.
 * @param seconds The length
 */
export function secondsSpan(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const days = Math.floor(total / 86400);
  const rest = total % 86400;
  const pad = (n: number) => String(n).padStart(2, "0");
  const clock = `${pad(Math.floor(rest / 3600))}:${pad(Math.floor((rest % 3600) / 60))}:${pad(rest % 60)}`;
  return days > 0 ? `${days}.${clock}` : clock;
}

/**
 * Writes a length in seconds as a short label such as 5m or 2h.
 * @param seconds The length
 */
export function durationLabel(seconds: number): string {
  if (seconds >= 86400 && seconds % 86400 === 0) return `${seconds / 86400}d`;
  if (seconds >= 3600 && seconds % 3600 === 0) return `${seconds / 3600}h`;
  if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60}m`;
  return `${seconds}s`;
}

/**
 * Shows a custom emoji as its name.
 * @param emoji The stored emoji
 */
export function emojiLabel(emoji: string): string {
  const match = /^<a?:([^:]+):\d+>$/.exec(emoji);
  return match ? `:${match[1]}:` : emoji;
}
