import { m } from "$lib/i18n";
import type { ChannelAccessGate } from "$lib/api/index.ts";

export type Named = { id: string; name: string };

export const TABS = ["gates", "applications", "blocked"] as const;
export type TabId = (typeof TABS)[number];

export type SaveMode = "now" | "typing";

/** Applies a gate change locally at once and saves it: `local` is the gate's fields, `remote` the request body. */
export type GatePatch = (
  gateId: number,
  local: Partial<ChannelAccessGate>,
  remote: Record<string, unknown>,
  mode?: SaveMode
) => void;

/**
 * Reads an error's own message, which is the bot's when it gave one.
 * @param err The thrown value
 * @param fallback What to say when there is no message
 */
export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/**
 * Names a channel for display, falling back to its id.
 * @param channels The server's channels
 * @param id The channel id
 */
export function channelName(channels: Named[], id: bigint | string | null | undefined): string {
  if (id === null || id === undefined) return m.common.none();
  const key = id.toString();
  return channels.find((x) => x.id === key)?.name ?? key;
}

/**
 * Formats a date and time for a list row.
 * @param value An ISO date string, or null
 */
export function formatDate(value: string | null): string {
  if (!value) return m.common.unknown();
  const date = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? m.common.unknown() : date.toLocaleString();
}
