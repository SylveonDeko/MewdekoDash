import { ApiError } from "$lib/api/core";

export type Named = { id: string; name: string; color?: number };
export type Notify = (message: string, type?: "success" | "error") => void;

export const TABS = ["protection", "filters", "discord"] as const;
export type TabId = (typeof TABS)[number];

export type SaveMode = "now" | "typing";

export function idString(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

/**
 * Reads the message the bot sent with a refusal, falling back to the error text.
 * @param err The thrown error
 * @param fallback Text for errors that carry none
 */
export function errorText(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const message = (err.body as { message?: unknown } | null)?.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return err instanceof Error && err.message ? err.message : fallback;
}

/**
 * Splits a change of a selection into what was added and what was removed.
 * @param before The ids before
 * @param after The ids after
 */
export function diffIds(before: string[], after: string[]): string[] {
  return [...after.filter((id) => !before.includes(id)), ...before.filter((id) => !after.includes(id))];
}

export function nameOf(list: Named[], id: unknown): string {
  const key = idString(id);
  return list.find((item) => item.id === key)?.name ?? key;
}
