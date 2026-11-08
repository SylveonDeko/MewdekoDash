export type Named = { id: string; name: string };

export const TABS = ["overview", "supporters", "tiers", "settings"] as const;
export type TabId = (typeof TABS)[number];

export type Notify = (message: string, type?: "success" | "error") => void;

/**
 * Formats an amount for display.
 * @param amount The amount in dollars
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(amount);
}

/**
 * Formats a date from the bot, which sends UTC without a zone.
 * @param value An ISO date string
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { dateStyle: "medium" });
}

/**
 * Reads an error's own message, which is the bot's when it gave one.
 * @param err The thrown value
 * @param fallback What to say when there is no message
 */
export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/**
 * Turns an id the API returned, which may be a big number, into a string.
 * @param value The id
 */
export function idString(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

/**
 * Whether a Discord id is set.
 * @param value The id
 */
export function hasId(value: unknown): boolean {
  const id = idString(value);
  return id !== "" && id !== "0";
}
