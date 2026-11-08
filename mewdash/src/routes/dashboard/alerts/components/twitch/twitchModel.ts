import { m } from "$lib/i18n";
import type { Named, Notify } from "../alertsModel";

export type { Named, Notify };

export type TwitchSection = "setup" | "commands" | "timers" | "quotes" | "events" | "live" | "links";

export const TWITCH_SECTIONS: TwitchSection[] = ["setup", "commands", "timers", "quotes", "events", "live", "links"];

export function formatDate(value: string | null | undefined): string {
  if (!value) return m.twitch.dateNever();
  return new Date(value).toLocaleString();
}
