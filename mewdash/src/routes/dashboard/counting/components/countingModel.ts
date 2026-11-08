import { m } from "$lib/i18n";

export type Named = { id: string; name: string; color?: number };

export type Notify = (message: string, type?: "success" | "error") => void;

export function idString(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

/**
 * A relative time for a list row.
 * @param value An ISO date string; the bot sends UTC without a zone
 */
export function timeAgo(value: string | null | undefined): string {
  if (!value) return m.counting.timeUnknown();
  const stamp = value.endsWith("Z") || value.includes("+") ? value : `${value}Z`;
  const minutes = Math.floor((Date.now() - new Date(stamp).getTime()) / 60000);
  if (minutes < 1) return m.common.justNow();
  if (minutes < 60) return m.common.agoMinutes({ count: minutes });
  if (minutes < 1440) return m.common.agoHours({ count: Math.floor(minutes / 60) });
  return m.common.agoDays({ count: Math.floor(minutes / 1440) });
}

export function splitIds(value: string | null | undefined): string[] {
  return value ? value.split(",").map((id) => id.trim()).filter(Boolean) : [];
}
