import type { GuildXpSetting } from "$lib/api/xp/models/index.ts";

export const MAX_MESSAGE_XP = 50;
export const MAX_VOICE_XP = 10;

export type Channel = { id: string; name: string };
export type Role = { id: string; name: string; color?: number };

/** How a settings change is saved: toggles and pickers at once, typed fields once typing stops. */
export type SaveMode = "now" | "typing";
export type SettingsPatch = (changes: Partial<GuildXpSetting>, mode?: SaveMode) => void;

export interface RowAction {
  label: string;
  icon: string;
  run: () => void;
}

export const CompetitionType = { MostGained: 0, ReachLevel: 1, HighestTotal: 2 } as const;

/**
 * Turns an id the API returned, which may be a big number object, into a string.
 * @param value The id
 */
export function idString(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

/**
 * Formats a count for display.
 * @param value The number
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

/**
 * Formats a date and time for a list row.
 * @param value An ISO date string; the bot sends UTC without a zone
 */
export function formatDate(value: string): string {
  const date = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Reads an error's own message, which is the bot's when it gave one.
 * @param err The thrown value
 * @param fallback What to say when there is no message
 */
export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
