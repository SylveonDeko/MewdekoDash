import { ApiError } from "$lib/api/core";
import { m } from "$lib/i18n";
import { parseStoredMessage } from "$lib/utils/embedMessage";
import type { Ticket } from "$lib/api/ticket/models";

export interface Named {
  id: string;
  name: string;
}

export interface MenuItem {
  label: string;
  icon: string;
  onclick: () => void;
  hidden?: boolean;
}

export const HOUR = 3600;
export const MINUTE = 60;

const SPAN = /^(-)?(?:(\d+)\.)?(\d+):(\d+):(\d+)(?:\.\d+)?$/;

/**
 * Reads a .NET TimeSpan ("d.hh:mm:ss") as seconds. Anything unreadable is zero.
 */
export function spanSeconds(value: string | null | undefined): number {
  if (!value) return 0;
  const match = SPAN.exec(value.trim());
  if (!match) return 0;
  const [, sign, days, hours, minutes, seconds] = match;
  const total = Number(days ?? 0) * 86400 + Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
  return sign ? -total : total;
}

/**
 * Writes seconds as a .NET TimeSpan. Zero is how the bot's update endpoints clear a time.
 */
export function secondsSpan(total: number): string {
  const safe = Math.max(0, Math.floor(total));
  const days = Math.floor(safe / 86400);
  const rest = safe % 86400;
  const pad = (n: number) => String(n).padStart(2, "0");
  const clock = `${pad(Math.floor(rest / 3600))}:${pad(Math.floor((rest % 3600) / 60))}:${pad(rest % 60)}`;
  return days > 0 ? `${days}.${clock}` : clock;
}

/**
 * A TimeSpan as a whole number of units, or null when it is unset.
 */
export function spanInUnits(value: string | null | undefined, unit: number): number | null {
  const seconds = spanSeconds(value);
  return seconds > 0 ? Math.round(seconds / unit) : null;
}

export function unitsSpan(amount: number | null, unit: number): string {
  return secondsSpan(amount && amount > 0 ? amount * unit : 0);
}

export function idStrings(values: Array<bigint | string | number> | null | undefined): string[] {
  return (values ?? []).map(value => String(value));
}

export function idBigints(values: string[]): bigint[] {
  return values.map(value => BigInt(value));
}

export function idOrNull(value: string | string[] | null | undefined): string | null {
  return typeof value === "string" && value ? value : null;
}

/**
 * The bot's own message when a request failed, otherwise the fallback.
 */
export function errorText(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const body = err.body as { error?: unknown; Error?: unknown } | string | null;
    if (body && typeof body === "object") {
      const inner = body.error ?? body.Error;
      if (typeof inner === "string" && inner.trim()) return inner;
    }
  }
  return err instanceof Error && err.message ? err.message : fallback;
}

export type TicketState = "open" | "claimed" | "closed" | "archived";

export function ticketState(ticket: Ticket): TicketState {
  if (ticket.isArchived) return "archived";
  if (ticket.closedAt) return "closed";
  if (ticket.claimedBy) return "claimed";
  return "open";
}

export function stateLabel(state: TicketState): string {
  switch (state) {
    case "archived":
      return m.tickets.stateArchived();
    case "closed":
      return m.common.closed();
    case "claimed":
      return m.tickets.stateClaimed();
    default:
      return m.common.open();
  }
}

export function formatDate(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleString() : "";
}

export function formatDay(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleDateString() : "";
}

/**
 * The image for a custom emoji such as <:name:123>, or null for a Unicode one.
 */
export function emojiUrl(value: string | null | undefined): string | null {
  const match = /^<(a?):\w+:(\d+)>$/.exec(value ?? "");
  return match ? `https://cdn.discordapp.com/emojis/${match[2]}.${match[1] ? "gif" : "png"}?size=48` : null;
}

/**
 * What a panel is called in lists: its embed title, else its text, else nothing.
 */
export function panelTitle(embedJson: string | null | undefined): string {
  const parsed = parseStoredMessage(embedJson);
  const embed = parsed.embeds.find(e => typeof e?.title === "string" && e.title.trim());
  return (embed?.title ?? parsed.content ?? "").toString().trim().slice(0, 80);
}

/**
 * A color from the bot as #rrggbb.
 */
export function colorHex(value: number | bigint | null | undefined): string {
  const n = Number(value ?? 0) & 0xffffff;
  return `#${n.toString(16).padStart(6, "0")}`;
}

export function hexColor(hex: string): number {
  const parsed = Number.parseInt(hex.replace("#", ""), 16);
  return Number.isNaN(parsed) ? 0 : parsed & 0xffffff;
}

/**
 * Minutes from the statistics' average, which arrives as a number of minutes or a TimeSpan.
 */
export function averageMinutes(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const asNumber = Number(value);
  if (!Number.isNaN(asNumber)) return asNumber;
  return spanSeconds(value) / 60;
}
