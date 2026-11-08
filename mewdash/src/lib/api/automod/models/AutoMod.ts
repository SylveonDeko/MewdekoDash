// lib/api/automod/models/AutoMod.ts

export type AutoModRuleKind = "Keyword" | "Spam" | "Preset" | "MentionSpam";
export type AutoModActionKind = "BlockMessage" | "SendAlert" | "Timeout";
export type AutoModPunishAction = "None" | "Timeout" | "Mute";
export type AutoModEscalateAction = "None" | "Kick" | "Ban";

/** Discord's keyword preset ids. */
export const AUTOMOD_PRESET_IDS = { Profanity: 1, SexualContent: 2, Slurs: 3 } as const;
export type AutoModPresetName = keyof typeof AUTOMOD_PRESET_IDS;

export interface AutoModAction {
  kind: AutoModActionKind;
  channelId?: bigint | null;
  timeoutSeconds?: number | null;
  customMessage?: string | null;
}

export interface AutoModFollowUp {
  warn: boolean;
  warnReason: string | null;
  punishAction: AutoModPunishAction;
  punishMinutes: number;
  escalateAction: AutoModEscalateAction;
  escalateHits: number;
  escalateWindowMinutes: number;
  logChannelId: bigint | null;
}

export interface AutoModRule {
  id: bigint;
  name: string;
  kind: AutoModRuleKind;
  enabled: boolean;
  keywords: string[];
  regexPatterns: string[];
  allowList: string[];
  presets: AutoModPresetName[];
  mentionLimit: number | null;
  mentionRaidProtection: boolean;
  actions: AutoModAction[];
  exemptRoleIds: bigint[];
  exemptChannelIds: bigint[];
  followUp: AutoModFollowUp | null;
}

/** What to create or change. On a change, fields left out stay as they are. */
export interface AutoModRuleSpec {
  name?: string;
  kind?: AutoModRuleKind;
  enabled?: boolean;
  keywords?: string[];
  regexPatterns?: string[];
  allowList?: string[];
  presets?: number[];
  mentionLimit?: number;
  mentionRaidProtection?: boolean;
  actions?: AutoModAction[];
  exemptRoleIds?: bigint[];
  exemptChannelIds?: bigint[];
}

export interface AutoModStatus {
  canManage: boolean;
  canModerate: boolean;
}
