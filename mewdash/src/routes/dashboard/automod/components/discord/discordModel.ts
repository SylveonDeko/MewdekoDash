import {
  AUTOMOD_PRESET_IDS,
  type AutoModAction,
  type AutoModEscalateAction,
  type AutoModFollowUp,
  type AutoModPresetName,
  type AutoModPunishAction,
  type AutoModRule,
  type AutoModRuleKind,
  type AutoModRuleSpec
} from "$lib/api/index.ts";
import { idString } from "../automodModel";

/** The limits Discord puts on its own AutoMod rules. */
export const DISCORD_LIMITS = {
  name: 100,
  keywords: 1000,
  keywordLength: 60,
  regex: 10,
  regexLength: 260,
  allowKeyword: 100,
  allowPreset: 1000,
  exemptRoles: 20,
  exemptChannels: 50,
  customMessage: 150,
  mentions: 50,
  timeoutMinutes: 40320,
  rulesPerKind: { Keyword: 6, Spam: 1, Preset: 1, MentionSpam: 1 } as Record<AutoModRuleKind, number>
} as const;

export const KINDS: AutoModRuleKind[] = ["Keyword", "Spam", "Preset", "MentionSpam"];
export const PRESETS: AutoModPresetName[] = ["Profanity", "SexualContent", "Slurs"];

export interface RuleAction {
  kind: AutoModAction["kind"];
  channelId: string | null;
  timeoutSeconds: number | null;
  customMessage: string;
}

export interface FollowUp {
  warn: boolean;
  warnReason: string;
  punishAction: AutoModPunishAction;
  punishMinutes: number;
  escalateAction: AutoModEscalateAction;
  escalateHits: number;
  escalateWindowMinutes: number;
  logChannelId: string | null;
}

export interface Rule {
  id: string;
  name: string;
  kind: AutoModRuleKind;
  enabled: boolean;
  keywords: string[];
  regexPatterns: string[];
  allowList: string[];
  presets: AutoModPresetName[];
  mentionLimit: number;
  mentionRaidProtection: boolean;
  actions: RuleAction[];
  exemptRoleIds: string[];
  exemptChannelIds: string[];
  followUp: FollowUp | null;
}

export type RulePatch = Partial<Omit<Rule, "id" | "followUp">>;

export const EMPTY_FOLLOW_UP: FollowUp = {
  warn: false,
  warnReason: "",
  punishAction: "None",
  punishMinutes: 10,
  escalateAction: "None",
  escalateHits: 3,
  escalateWindowMinutes: 60,
  logChannelId: null
};

function toFollowUp(raw: AutoModFollowUp | null): FollowUp | null {
  if (!raw) return null;
  return {
    warn: raw.warn,
    warnReason: raw.warnReason ?? "",
    punishAction: raw.punishAction,
    punishMinutes: raw.punishMinutes || EMPTY_FOLLOW_UP.punishMinutes,
    escalateAction: raw.escalateAction,
    escalateHits: raw.escalateHits || EMPTY_FOLLOW_UP.escalateHits,
    escalateWindowMinutes: raw.escalateWindowMinutes || EMPTY_FOLLOW_UP.escalateWindowMinutes,
    logChannelId: raw.logChannelId ? idString(raw.logChannelId) : null
  };
}

/**
 * Reads a rule from the bot into the shape the editor works on, with ids as strings.
 * @param raw The rule as the bot sent it
 */
export function toRule(raw: AutoModRule): Rule {
  return {
    id: idString(raw.id),
    name: raw.name,
    kind: raw.kind,
    enabled: raw.enabled,
    keywords: raw.keywords ?? [],
    regexPatterns: raw.regexPatterns ?? [],
    allowList: raw.allowList ?? [],
    presets: (raw.presets ?? []) as AutoModPresetName[],
    mentionLimit: raw.mentionLimit ?? 5,
    mentionRaidProtection: raw.mentionRaidProtection,
    actions: (raw.actions ?? []).map((x) => ({
      kind: x.kind,
      channelId: x.channelId ? idString(x.channelId) : null,
      timeoutSeconds: x.timeoutSeconds ?? null,
      customMessage: x.customMessage ?? ""
    })),
    exemptRoleIds: (raw.exemptRoleIds ?? []).map(idString),
    exemptChannelIds: (raw.exemptChannelIds ?? []).map(idString),
    followUp: toFollowUp(raw.followUp)
  };
}

export function blankRule(kind: AutoModRuleKind = "Keyword"): Rule {
  return {
    id: "",
    name: "",
    kind,
    enabled: true,
    keywords: [],
    regexPatterns: [],
    allowList: [],
    presets: [],
    mentionLimit: 5,
    mentionRaidProtection: false,
    actions: [{ kind: "BlockMessage", channelId: null, timeoutSeconds: null, customMessage: "" }],
    exemptRoleIds: [],
    exemptChannelIds: [],
    followUp: null
  };
}

export function timeoutAllowed(kind: AutoModRuleKind): boolean {
  return kind === "Keyword" || kind === "MentionSpam";
}

function toActions(actions: RuleAction[]): AutoModAction[] {
  return actions.map((x) => ({
    kind: x.kind,
    channelId: x.kind === "SendAlert" && x.channelId ? BigInt(x.channelId) : null,
    timeoutSeconds: x.kind === "Timeout" ? x.timeoutSeconds : null,
    customMessage: x.kind === "BlockMessage" && x.customMessage.trim() ? x.customMessage.trim() : null
  }));
}

/**
 * Builds what to send for the parts of a rule that changed.
 * @param rule The rule as it is now
 * @param fields The fields to include
 */
export function toSpec(rule: Rule, fields: Array<keyof RulePatch>): AutoModRuleSpec {
  const spec: AutoModRuleSpec = {};
  for (const field of fields) {
    switch (field) {
      case "name":
        spec.name = rule.name.trim();
        break;
      case "enabled":
        spec.enabled = rule.enabled;
        break;
      case "keywords":
        spec.keywords = rule.keywords;
        break;
      case "regexPatterns":
        spec.regexPatterns = rule.regexPatterns;
        break;
      case "allowList":
        spec.allowList = rule.allowList;
        break;
      case "presets":
        spec.presets = rule.presets.map((x) => AUTOMOD_PRESET_IDS[x]);
        break;
      case "mentionLimit":
        spec.mentionLimit = rule.mentionLimit;
        break;
      case "mentionRaidProtection":
        spec.mentionRaidProtection = rule.mentionRaidProtection;
        break;
      case "actions":
        spec.actions = toActions(rule.actions);
        break;
      case "exemptRoleIds":
        spec.exemptRoleIds = rule.exemptRoleIds.map((x) => BigInt(x));
        break;
      case "exemptChannelIds":
        spec.exemptChannelIds = rule.exemptChannelIds.map((x) => BigInt(x));
        break;
    }
  }
  return spec;
}

export function toCreateSpec(rule: Rule): AutoModRuleSpec {
  const fields: Array<keyof RulePatch> = ["name", "enabled", "actions", "exemptRoleIds", "exemptChannelIds"];
  if (rule.kind === "Keyword") fields.push("keywords", "regexPatterns", "allowList");
  if (rule.kind === "Preset") fields.push("presets", "allowList");
  if (rule.kind === "MentionSpam") fields.push("mentionLimit", "mentionRaidProtection");
  return { ...toSpec(rule, fields), kind: rule.kind };
}

export function actionsValid(rule: Rule): boolean {
  if (rule.actions.length === 0) return false;
  if (rule.actions.some((x) => x.kind === "SendAlert" && !x.channelId)) return false;
  return !rule.actions.some((x) => x.kind === "Timeout" && !(x.timeoutSeconds && x.timeoutSeconds > 0));
}

/** Whether a new rule has what Discord needs to create it. */
export function creatable(rule: Rule): boolean {
  if (!rule.name.trim() || !actionsValid(rule)) return false;
  switch (rule.kind) {
    case "Keyword":
      return rule.keywords.length + rule.regexPatterns.length > 0;
    case "Preset":
      return rule.presets.length > 0;
    case "MentionSpam":
      return rule.mentionLimit >= 1 && rule.mentionLimit <= DISCORD_LIMITS.mentions;
    default:
      return true;
  }
}

export function followUpEmpty(f: FollowUp): boolean {
  return !f.warn && f.punishAction === "None" && f.escalateAction === "None" && !f.logChannelId;
}

export function followUpValid(f: FollowUp): boolean {
  if (f.punishAction !== "None" && (f.punishMinutes < 1 || (f.punishAction === "Timeout" && f.punishMinutes > DISCORD_LIMITS.timeoutMinutes))) {
    return false;
  }
  if (f.escalateAction === "None") return true;
  return f.escalateHits >= 2 && f.escalateWindowMinutes >= 1 && f.escalateWindowMinutes <= 43200;
}

export function toFollowUpBody(f: FollowUp): AutoModFollowUp {
  return {
    warn: f.warn,
    warnReason: f.warn && f.warnReason.trim() ? f.warnReason.trim() : null,
    punishAction: f.punishAction,
    punishMinutes: f.punishAction === "None" ? 0 : f.punishMinutes,
    escalateAction: f.escalateAction,
    escalateHits: f.escalateAction === "None" ? 0 : f.escalateHits,
    escalateWindowMinutes: f.escalateAction === "None" ? 0 : f.escalateWindowMinutes,
    logChannelId: f.logChannelId ? BigInt(f.logChannelId) : null
  };
}
