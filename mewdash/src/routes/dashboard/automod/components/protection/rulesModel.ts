import type { AutomodRuleName, AutomodRuleRequest, AutomodRuleSettings } from "$lib/api/index.ts";
import { idString } from "../automodModel";

export const RULE_ACTIONS = ["delete", "warn", "timeout", "mute", "kick", "ban", "message", "dm", "review"] as const;
export type RuleActionName = (typeof RULE_ACTIONS)[number];

export type RuleField =
  | "minLength"
  | "capsPercent"
  | "maxAttachments"
  | "windowSeconds"
  | "maxEmojis"
  | "maxSpoilers"
  | "zalgoThreshold";

export const RULES: Array<{ rule: AutomodRuleName; fields: RuleField[]; media?: boolean }> = [
  { rule: "Caps", fields: ["minLength", "capsPercent"] },
  { rule: "Attachments", fields: ["maxAttachments", "windowSeconds"] },
  { rule: "Emoji", fields: ["maxEmojis"] },
  { rule: "Spoilers", fields: ["maxSpoilers"] },
  { rule: "Zalgo", fields: ["zalgoThreshold"] },
  { rule: "Files", fields: [] },
  { rule: "Media", fields: [], media: true },
  { rule: "ImageOnly", fields: [], media: true },
  { rule: "VideoOnly", fields: [], media: true },
  { rule: "Commands", fields: [], media: true }
];

export const FIELD_RANGES: Record<RuleField, [number, number]> = {
  minLength: [1, 2000],
  capsPercent: [1, 100],
  maxAttachments: [1, 100],
  windowSeconds: [1, 600],
  maxEmojis: [1, 200],
  maxSpoilers: [1, 100],
  zalgoThreshold: [1, 30]
};

export interface AutomodRule {
  rule: AutomodRuleName;
  enabled: boolean;
  actions: RuleActionName[];
  actionMinutes: number;
  actionMessage: string;
  numbers: Record<RuleField, number>;
  allowThreads: boolean;
  mediaChannelIds: string[];
  exemptRoleIds: string[];
  exemptChannelIds: string[];
}

export function toAutomodRule(raw: AutomodRuleSettings): AutomodRule {
  return {
    rule: raw.rule,
    enabled: raw.enabled,
    actions: raw.actions
      .split(",")
      .map((x) => x.trim())
      .filter((x): x is RuleActionName => (RULE_ACTIONS as readonly string[]).includes(x)),
    actionMinutes: raw.actionMinutes,
    actionMessage: raw.actionMessage ?? "",
    numbers: {
      minLength: raw.minLength,
      capsPercent: raw.capsPercent,
      maxAttachments: raw.maxAttachments,
      windowSeconds: raw.windowSeconds,
      maxEmojis: raw.maxEmojis,
      maxSpoilers: raw.maxSpoilers,
      zalgoThreshold: raw.zalgoThreshold
    },
    allowThreads: raw.allowThreads,
    mediaChannelIds: raw.mediaChannelIds.map(idString),
    exemptRoleIds: raw.exemptRoleIds.map(idString),
    exemptChannelIds: raw.exemptChannelIds.map(idString)
  };
}

export function toRuleRequest(rule: AutomodRule): AutomodRuleRequest {
  return {
    enabled: rule.enabled,
    actions: rule.actions.join(", "),
    actionMinutes: rule.actionMinutes,
    actionMessage: rule.actionMessage,
    ...rule.numbers,
    allowThreads: rule.allowThreads,
    mediaChannelIds: rule.mediaChannelIds.map((x) => BigInt(x)),
    exemptRoleIds: rule.exemptRoleIds.map((x) => BigInt(x)),
    exemptChannelIds: rule.exemptChannelIds.map((x) => BigInt(x))
  };
}
