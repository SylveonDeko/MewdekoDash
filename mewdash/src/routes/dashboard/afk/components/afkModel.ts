export type Named = { id: string; name: string };

export const TABS = ["settings", "members"] as const;
export type TabId = (typeof TABS)[number];

export const MAX_LENGTH = 4096;
export const MAX_TIMEOUT_SECONDS = 7200;

/**
 * Reads an error's own message, which is the bot's when it gave one.
 * @param err The thrown value
 * @param fallback What to say when there is no message
 */
export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/**
 * Formats a date from the bot, which sends UTC without a zone.
 * @param value An ISO date string
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
