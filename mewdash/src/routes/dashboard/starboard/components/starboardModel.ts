import { starboardApi, type Starboard } from "$lib/api/index.ts";

export interface Named {
  id: string;
  name: string;
}

export type StarboardPatch = Partial<
  Pick<
    Starboard,
    | "enabled"
    | "threshold"
    | "repostThreshold"
    | "allowBots"
    | "allowSelfStar"
    | "allowNsfw"
    | "removeOnDelete"
    | "removeOnReactionsClear"
    | "removeOnBelowThreshold"
    | "useBlacklist"
    | "autoReact"
    | "countMultipleReactions"
    | "removeInvalidStars"
    | "repostCooldownMinutes"
    | "minMessageAgeMinutes"
    | "maxMessageAgeMinutes"
    | "postDesign"
    | "lockedUntil"
  >
>;

export interface SectionProps {
  starboard: Starboard;
  change: (patch: StarboardPatch, typing?: boolean) => void;
}

export const AutoReact = { None: 0, First: 1, All: 2 } as const;

export function splitIds(value: string | null | undefined): string[] {
  return (value ?? "").split(" ").filter(Boolean);
}

export function splitEmotes(value: string | null | undefined): string[] {
  return (value ?? "")
    .split("|")
    .map(emote => emote.trim())
    .filter(Boolean);
}

/**
 * Parses a time the bot stored without a zone, which is always UTC.
 * @param value The stored time
 */
export function parseUtc(value: string | null | undefined): Date | null {
  if (!value) return null;
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
  const date = new Date(hasZone ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

const INDEFINITE_MS = 1000 * 60 * 60 * 24 * 365 * 50;

/**
 * Describes the lock on a starboard, or null when it accepts stars.
 * @param starboard The starboard
 */
export function lockState(starboard: Starboard): { until: Date; indefinite: boolean } | null {
  const until = parseUtc(starboard.lockedUntil);
  if (!until || until.getTime() <= Date.now()) return null;
  return { until, indefinite: until.getTime() - Date.now() > INDEFINITE_MS };
}

/** Maps each editable field to the save it belongs to, so fields saved together share one request. */
export function saveKeyOf(field: keyof StarboardPatch): string {
  return field === "minMessageAgeMinutes" || field === "maxMessageAgeMinutes" ? "age" : field;
}

type Saver = (guildId: bigint, starboard: Starboard) => Promise<unknown>;

export const savers: Record<string, Saver> = {
  enabled: (g, s) => starboardApi.setEnabled(g, s.id, s.enabled),
  threshold: (g, s) => starboardApi.setStarThreshold(g, s.id, Math.max(1, s.threshold)),
  repostThreshold: (g, s) => starboardApi.setRepostThreshold(g, s.id, s.repostThreshold),
  allowBots: (g, s) => starboardApi.setAllowBots(g, s.id, s.allowBots),
  allowSelfStar: (g, s) => starboardApi.setAllowSelfStar(g, s.id, s.allowSelfStar),
  allowNsfw: (g, s) => starboardApi.setAllowNsfw(g, s.id, s.allowNsfw),
  removeOnDelete: (g, s) => starboardApi.setRemoveOnDelete(g, s.id, s.removeOnDelete),
  removeOnReactionsClear: (g, s) => starboardApi.setRemoveOnClear(g, s.id, s.removeOnReactionsClear),
  removeOnBelowThreshold: (g, s) => starboardApi.setRemoveBelowThreshold(g, s.id, s.removeOnBelowThreshold),
  useBlacklist: (g, s) => starboardApi.setUseBlacklist(g, s.id, s.useBlacklist),
  autoReact: (g, s) => starboardApi.setAutoReact(g, s.id, s.autoReact),
  countMultipleReactions: (g, s) => starboardApi.setCountMultipleReactions(g, s.id, s.countMultipleReactions),
  removeInvalidStars: (g, s) => starboardApi.setRemoveInvalidStars(g, s.id, s.removeInvalidStars),
  repostCooldownMinutes: (g, s) => starboardApi.setRepostCooldown(g, s.id, s.repostCooldownMinutes),
  age: (g, s) => starboardApi.setMessageAge(g, s.id, s.minMessageAgeMinutes, s.maxMessageAgeMinutes),
  postDesign: (g, s) => starboardApi.setPostDesign(g, s.id, s.postDesign?.trim() ? s.postDesign : null),
  lockedUntil: (g, s) => starboardApi.setLockedUntil(g, s.id, s.lockedUntil)
};
