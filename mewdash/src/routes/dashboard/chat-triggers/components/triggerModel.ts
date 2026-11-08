import type { ChatTrigger } from "$lib/api/index.ts";

/** Bit flags for the ways a trigger can fire. Mirrors ChatTriggerType in the bot. */
export const TriggerKind = {
  Message: 1,
  Interaction: 2,
  Button: 4,
  Reactions: 8,
  ReactionsRemoved: 16,
  Event: 32
} as const;

export const AppCommandType = { None: 0, Slash: 1, Message: 2, User: 3 } as const;

export const MatchMode = { Exact: "exact", Contains: "contains", Regex: "regex" } as const;
export type MatchModeValue = (typeof MatchMode)[keyof typeof MatchMode];

export const ListSeparator = "@@@";

export type TriggerPatch = Partial<ChatTrigger>;

/** A new trigger with the bot's defaults, ready to be filled in and created. */
export function newTrigger(guildId: bigint): ChatTrigger {
  return {
    id: 0,
    useCount: 0n,
    isRegex: false,
    ownerOnly: false,
    guildId,
    response: "",
    trigger: "",
    prefixType: 0,
    customPrefix: null,
    autoDeleteTrigger: false,
    reactToTrigger: false,
    noRespond: false,
    dmResponse: false,
    containsAnywhere: false,
    allowTarget: false,
    reactions: null,
    grantedRoles: null,
    removedRoles: null,
    roleGrantType: 0,
    validTriggerTypes: TriggerKind.Message,
    applicationCommandId: 0n,
    applicationCommandName: null,
    applicationCommandDescription: null,
    applicationCommandType: AppCommandType.None,
    ephemeralResponse: false,
    crosspostingChannelId: 0n,
    crosspostingWebhookUrl: null,
    isDisabled: false,
    additionalResponses: null,
    responseMode: 0,
    roundRobinIndex: 0,
    currencyCost: 0,
    currencyReward: 0,
    xpReward: 0,
    requiredXpLevel: 0,
    requirementFailMessage: null,
    timeConditions: null,
    expiresAt: null,
    maxUses: null,
    minAccountAgeMinutes: 0,
    minServerMembershipMinutes: 0,
    eventType: 0,
    eventChannelId: 0n,
    eventRoleId: 0n,
    allowBots: false,
    nextTriggerId: null,
    replyToTrigger: false,
    deleteResponseAfter: 0,
    cooldownSeconds: 0,
    cooldownScope: 0,
    counterName: null,
    counterMin: null,
    counterMax: null,
    category: null,
    staffOnly: false,
    nsfwOnly: false,
    allowedChannelIds: null,
    deniedChannelIds: null,
    deniedRoleIds: null,
    anonymous: false,
    replyChannelId: 0n,
    creatorId: 0n,
    promptQuestion: null,
    promptTimeoutSeconds: 30,
    dateAdded: null
  };
}

/** Splits a list the bot stores as one "@@@" separated string. */
export function splitList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(ListSeparator).map(part => part.trim()).filter(part => part.length > 0);
}

/** Joins a list back into the bot's stored form, or null when it is empty. */
export function joinList(values: string[]): string | null {
  const parts = values.map(part => part.trim()).filter(part => part.length > 0);
  return parts.length > 0 ? parts.join(ListSeparator) : null;
}

/** Id fields are compared as strings. */
export function idString(value: unknown): string {
  return value === null || value === undefined ? "0" : String(value);
}

export function hasId(value: unknown): boolean {
  return idString(value) !== "0";
}

export function matchModeOf(trigger: ChatTrigger): MatchModeValue {
  if (trigger.isRegex) return MatchMode.Regex;
  return trigger.containsAnywhere ? MatchMode.Contains : MatchMode.Exact;
}

export function matchModePatch(mode: MatchModeValue): TriggerPatch {
  return {
    isRegex: mode === MatchMode.Regex,
    containsAnywhere: mode === MatchMode.Contains
  };
}

export function isValidRegex(pattern: string | null | undefined): boolean {
  if (!pattern) return true;
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

export interface ActiveHours {
  start: string;
  end: string;
  days: number[];
}

/** Reads the first time window out of the condition format shared with sticky messages. */
export function parseActiveHours(value: string | null | undefined): ActiveHours {
  const fallback: ActiveHours = { start: "09:00", end: "17:00", days: [] };
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    const first = Array.isArray(parsed) ? parsed[0] : null;
    if (!first) return fallback;
    return {
      start: first.StartTime ?? first.startTime ?? fallback.start,
      end: first.EndTime ?? first.endTime ?? fallback.end,
      days: (first.DaysOfWeek ?? first.daysOfWeek ?? []) as number[]
    };
  } catch {
    return fallback;
  }
}

/** Writes the first time window back, keeping any further windows and the first one's other fields. */
export function serializeActiveHours(hours: ActiveHours, existing?: string | null): string {
  let windows: Record<string, unknown>[] = [];
  try {
    const parsed = existing ? JSON.parse(existing) : null;
    if (Array.isArray(parsed)) windows = parsed;
  } catch {
    windows = [];
  }
  const first = windows[0] ?? { Enabled: true, Name: null };
  windows[0] = {
    ...first,
    StartTime: hours.start,
    EndTime: hours.end,
    DaysOfWeek: hours.days.length > 0 ? hours.days : null
  };
  return JSON.stringify(windows);
}

/** Why a trigger cannot be saved yet, or null when it can. */
export type TriggerProblem = "triggerText" | "regex" | "commandName" | "response" | null;

const commandNamePattern = /^[\w-]{1,32}(?: [\w-]{1,32}){0,2}$/;

/** The command name the bot registers: the set name, or the trigger text when none is set. */
export function commandName(trigger: ChatTrigger): string {
  return (trigger.applicationCommandName?.trim() || trigger.trigger?.trim() || "");
}

export function triggerProblem(trigger: ChatTrigger): TriggerProblem {
  if (!trigger.trigger?.trim()) return "triggerText";
  if (trigger.isRegex && !isValidRegex(trigger.trigger)) return "regex";
  if (trigger.applicationCommandType > 0) {
    const name = commandName(trigger);
    if (name.length < 1) return "commandName";
    if (trigger.applicationCommandType === AppCommandType.Slash
        && (!commandNamePattern.test(name) || name !== name.toLowerCase())) return "commandName";
  }
  const hasResponse = !!String(trigger.response ?? "").trim();
  if (!hasResponse && !trigger.noRespond && !trigger.reactToTrigger) return "response";
  return null;
}

/** The trigger as the bot expects it on the wire: ids as big integers, the response as a string. */
export function toWire(trigger: ChatTrigger): ChatTrigger {
  return {
    ...trigger,
    response: typeof trigger.response === "string" ? trigger.response : JSON.stringify(trigger.response ?? ""),
    eventChannelId: BigInt(idString(trigger.eventChannelId)),
    eventRoleId: BigInt(idString(trigger.eventRoleId)),
    replyChannelId: BigInt(idString(trigger.replyChannelId)),
    crosspostingChannelId: BigInt(idString(trigger.crosspostingChannelId)),
    applicationCommandId: BigInt(idString(trigger.applicationCommandId)),
    creatorId: BigInt(idString(trigger.creatorId)),
    useCount: BigInt(idString(trigger.useCount)),
    guildId: trigger.guildId === null ? null : BigInt(idString(trigger.guildId))
  };
}

/** A one line description of what a trigger says, for list rows. */
export function responseSummary(response: ChatTrigger["response"]): string {
  if (!response) return "";
  const text = typeof response === "string" ? response : JSON.stringify(response);
  if (!text.trim().startsWith("{")) return text;
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed.content === "string" && parsed.content) return parsed.content;
    const embeds = Array.isArray(parsed.embeds) ? parsed.embeds : parsed.embed ? [parsed.embed] : [];
    const first = embeds[0];
    return first?.title || first?.description || "";
  } catch {
    return text;
  }
}
