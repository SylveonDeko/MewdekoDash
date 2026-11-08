import { m } from "$lib/i18n";
import type { Giveaway } from "$lib/api/index.ts";

export const GiveawayStatus = { Active: 0, Ended: 1, Draft: 2 } as const;

export type EntryMethod = "reaction" | "button" | "captcha";

export const PrizeType = { None: 0, Xp: 1, Coins: 2 } as const;

export const DEFAULT_EMOTE = "🎉";

export const DURATION_UNITS = { minutes: 60, hours: 3600, days: 86400 } as const;

export type DurationUnit = keyof typeof DURATION_UNITS;

export interface ExtraEntry {
  roleId: string;
  extra: number;
}

export interface GiveawayForm {
  item: string;
  winners: number;
  channelId: string | null;
  duration: number;
  unit: DurationUnit;
  entryMethod: EntryMethod;
  emote: string;
  roles: string[];
  messageCount: number;
  extraEntries: ExtraEntry[];
  prizeType: number;
  prizeAmount: number;
}

export type GiveawayProblem = "item" | "winners" | "channel" | "duration" | "prize" | null;

export function newForm(emote: string | null): GiveawayForm {
  return {
    item: "",
    winners: 1,
    channelId: null,
    duration: 1,
    unit: "days",
    entryMethod: "button",
    emote: emote || DEFAULT_EMOTE,
    roles: [],
    messageCount: 0,
    extraEntries: [],
    prizeType: PrizeType.None,
    prizeAmount: 0
  };
}

export function parseExtraEntries(value: string | null | undefined): ExtraEntry[] {
  const entries: ExtraEntry[] = [];
  for (const pair of (value ?? "").split(" ")) {
    const [roleId, extra] = pair.split(":");
    const count = Number(extra);
    if (roleId && Number.isInteger(count) && count > 0) entries.push({ roleId, extra: count });
  }
  return entries;
}

export function formatExtraEntries(entries: ExtraEntry[]): string {
  return entries.map(entry => `${entry.roleId}:${entry.extra}`).join(" ");
}

export function splitRoles(value: string | null | undefined): string[] {
  return (value ?? "").split(" ").filter(Boolean);
}

export function durationSeconds(form: Pick<GiveawayForm, "duration" | "unit">): number {
  return Math.floor(form.duration * DURATION_UNITS[form.unit]);
}

export function prizeProblem(type: number, amount: number): boolean {
  return type !== PrizeType.None && !(amount > 0);
}

export function formProblem(form: GiveawayForm): GiveawayProblem {
  if (!form.item.trim()) return "item";
  if (!(form.winners >= 1)) return "winners";
  if (!form.channelId) return "channel";
  if (!(durationSeconds(form) > 0)) return "duration";
  if (prizeProblem(form.prizeType, form.prizeAmount)) return "prize";
  return null;
}

export function toGiveaway(form: GiveawayForm, guildId: bigint, userId: bigint, draft: boolean): Partial<Giveaway> {
  const seconds = durationSeconds(form);
  return {
    item: form.item.trim(),
    winners: form.winners,
    channelId: BigInt(form.channelId ?? "0"),
    serverId: guildId,
    userId,
    when: new Date(Date.now() + seconds * 1000).toISOString(),
    ended: draft ? GiveawayStatus.Draft : GiveawayStatus.Active,
    draftDurationSeconds: draft ? seconds : 0,
    useButton: form.entryMethod === "button",
    useCaptcha: form.entryMethod === "captcha",
    emote: form.emote || DEFAULT_EMOTE,
    restrictTo: form.roles.join(" "),
    messageCountReq: BigInt(Math.max(0, Math.floor(form.messageCount))),
    extraEntryRoles: formatExtraEntries(form.extraEntries),
    prizeType: form.prizeType,
    prizeAmount: form.prizeType === PrizeType.None ? 0 : form.prizeAmount
  };
}

/**
 * Reads a time the bot stores in UTC without a zone suffix.
 * @param value The stored time
 */
export function parseUtc(value: string): Date {
  return new Date(/(Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`);
}

export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts = [
    days > 0 ? m.common.daysShort({ count: days }) : "",
    hours > 0 ? m.common.hoursShort({ count: hours }) : "",
    minutes > 0 || (days === 0 && hours === 0) ? m.common.minutesShort({ count: minutes }) : ""
  ];
  return parts.filter(Boolean).join(" ");
}

export function entryMethodOf(giveaway: Giveaway): EntryMethod {
  if (giveaway.useCaptcha) return "captcha";
  if (giveaway.useButton) return "button";
  return "reaction";
}

export function sameId(a: bigint | number | string, b: bigint | number | string): boolean {
  return String(a) === String(b);
}
