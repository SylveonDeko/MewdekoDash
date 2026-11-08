import type { StatChannelStyleOptions } from "$lib/api/statchannels/models";

export type Named = { id: string; name: string };
export type Notify = (message: string, type?: "success" | "error") => void;

export const TABS = ["channels", "defaults", "counters"] as const;
export type TabId = (typeof TABS)[number];

/** Mirrors StatChannelRequirement on the bot. */
export const REQUIREMENT = {
  None: 0,
  Role: 1,
  Date: 2,
  Goal: 3,
  CounterName: 4,
  CountingChannel: 5,
  MinecraftServer: 6
} as const;

/** Mirrors StatChannelUpdateMechanism on the bot. */
export const MECHANISM = { Rename: 0, Recreate: 1, Auto: 2 } as const;

/** Mirrors StatChannelValueKind on the bot. */
export const VALUE_KIND = { Number: 0, Text: 1, Boolean: 2 } as const;

/** Mirrors StatChannelDisplayStyle on the bot. */
export const STYLE = { Compact: 2, Padded: 3, Percent: 5, ProgressBar: 6 } as const;

export const MAX_INTERVAL = 1440;

export const DEFAULT_STYLE_OPTIONS: Required<StatChannelStyleOptions> = {
  barWidth: 10,
  barFilled: "▰",
  barEmpty: "▱",
  decimals: 1,
  padWidth: 4,
  trueText: "🔴 LIVE",
  falseText: "⚫ Offline"
};

export function isValidInterval(value: unknown, min: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= MAX_INTERVAL;
}

/** Stored options use the bot's casing, so match keys without regard to it. */
export function parseStyleOptions(json: string | null | undefined): Required<StatChannelStyleOptions> {
  const result = { ...DEFAULT_STYLE_OPTIONS };
  if (!json) return result;
  try {
    const raw = JSON.parse(json) as Record<string, unknown>;
    for (const key of Object.keys(result) as Array<keyof typeof result>) {
      const found = Object.keys(raw).find((k) => k.toLowerCase() === key.toLowerCase());
      if (found === undefined || raw[found] === null) continue;
      (result as Record<string, unknown>)[key] = raw[found];
    }
  } catch {
    return result;
  }
  return result;
}
