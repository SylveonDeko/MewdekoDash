// lib/api/xp/models/XpModels.ts

/**
 * Guild XP settings
 * Maps to DataModel.GuildXpSetting
 */
export interface GuildXpSetting {
  id: number;
  guildId: bigint;
  xpPerMessage: number;
  messageXpCooldown: number;
  voiceXpPerMinute: number;
  voiceXpTimeout: number;
  xpMultiplier: number;
  xpCurveType: number;
  customXpImageUrl: string | null;
  xpGainDisabled: boolean;
  dateAdded: string | null;
}

/**
 * User XP data
 * Maps to DataModel.GuildUserXp
 */
export interface GuildUserXp {
  guildId: bigint;
  userId: bigint;
  totalXp: number;
  bonusXp: number;
  lastActivity: string;
  notifyType: number;
  lastLevelUp: string;
  id: number;
  dateAdded: string | null;
}

/**
 * XP role reward
 * Maps to DataModel.XpRoleReward
 */
export interface XpRoleReward {
  guildId: bigint;
  level: number;
  roleId: bigint;
  id: number;
  dateAdded: string | null;
}

/**
 * XP currency reward
 * Maps to DataModel.XpCurrencyReward
 */
export interface XpCurrencyReward {
  guildId: bigint;
  level: number;
  amount: number;
  id: number;
  dateAdded: string | null;
}

/**
 * XP template configuration
 * Maps to DataModel.Template (complex type with related entities)
 */
export interface XpTemplate {
  id: number;
  guildId: bigint;
  outputSizeX: number;
  outputSizeY: number;
  timeOnLevelFormat: string | null;
  timeOnLevelX: number;
  timeOnLevelY: number;
  timeOnLevelFontSize: number;
  timeOnLevelColor: string | null;
  showTimeOnLevel: boolean;
  awardedX: number;
  awardedY: number;
  awardedFontSize: number;
  awardedColor: string | null;
  showAwarded: boolean;
  templateUser: TemplateUser | null;
  templateBar: TemplateBar | null;
  templateClub: TemplateClub | null;
  templateGuild: TemplateGuild | null;
}

export interface TemplateUser {
  id: number;
  fontSize: number;
  iconSizeX: number;
  iconSizeY: number;
  iconX: number;
  iconY: number;
  showIcon: boolean;
  showText: boolean;
  textColor: string | null;
  textX: number;
  textY: number;
}

export interface TemplateBar {
  id: number;
  barColor: string | null;
  barDirection: number;
  barLength: number;
  barPointAx: number;
  barPointAy: number;
  barPointBx: number;
  barPointBy: number;
  barTransparency: number;
  showBar: boolean;
}

export interface TemplateClub {
  id: number;
  clubIconSizeX: number;
  clubIconSizeY: number;
  clubIconX: number;
  clubIconY: number;
  clubNameColor: string | null;
  clubNameFontSize: number;
  clubNameX: number;
  clubNameY: number;
  showClubIcon: boolean;
  showClubName: boolean;
}

export interface TemplateGuild {
  id: number;
  guildLevelColor: string | null;
  guildLevelFontSize: number;
  guildLevelX: number;
  guildLevelY: number;
  guildRankColor: string | null;
  guildRankFontSize: number;
  guildRankX: number;
  guildRankY: number;
  showGuildLevel: boolean;
  showGuildRank: boolean;
}
