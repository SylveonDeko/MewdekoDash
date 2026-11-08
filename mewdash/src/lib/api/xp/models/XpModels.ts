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
  levelUpMessage: string | null;
  levelUpChannel: bigint | string | number;
  exclusiveRoleRewards: boolean;
  levelUpInterval: number;
  levelUpMinLevel: number;
  levelUpRewardsOnly: boolean;
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

/**
 * A temporary XP boost
 * Maps to the anonymous objects of XpController.GetBoosts
 */
export interface XpBoost {
  id: number;
  name: string;
  multiplier: number;
  startTime: string;
  endTime: string;
  active: boolean;
  channelIds: string[];
  roleIds: string[];
}

/**
 * A placement reward of a competition
 * Maps to the anonymous objects of XpController.GetCompetitions
 */
export interface XpCompetitionReward {
  id: number;
  position: number;
  roleId: string;
  roleName: string | null;
  xpAmount: number;
  currencyAmount: number;
}

/**
 * An XP competition
 * Maps to the anonymous objects of XpController.GetCompetitions
 */
export interface XpCompetition {
  id: number;
  name: string;
  /** 0 most gained, 1 reach level, 2 highest total */
  type: number;
  startTime: string;
  endTime: string;
  targetLevel: number;
  announcementChannelId: string | null;
  active: boolean;
  participants: number;
  rewards: XpCompetitionReward[];
}

/**
 * One standing of a competition
 * Maps to the anonymous objects of XpController.GetCompetitionStandings
 */
export interface XpCompetitionStanding {
  position: number;
  userId: string;
  username: string;
  gained: number;
  total: number;
  achievedTargetAt: string | null;
  finalPlacement: number;
}

/**
 * What a new competition is made from
 * Maps to Mewdeko.Controllers.Common.XpEvents.XpCompetitionRequest
 */
export interface XpCompetitionRequest {
  name: string;
  type: number;
  durationMinutes: number;
  targetLevel: number;
  announcementChannelId: bigint;
  rewards: Array<{ position: number; roleId: bigint; xpAmount: number; currencyAmount: number }>;
}

/**
 * A custom level-up message
 * Maps to the anonymous objects of XpController.GetLevelUpMessages
 */
export interface XpLevelUpMessage {
  id: number;
  messageContent: string;
  isEnabled: boolean;
}

/**
 * A level-up in the log
 * Maps to the anonymous objects of XpController.GetLevelUpLog
 */
export interface XpLevelUpLogEntry {
  userId: bigint;
  username: string;
  oldLevel: number;
  newLevel: number;
  dateAdded: string;
}

/**
 * The rank card background in use
 * Maps to the anonymous object of XpController.GetBackground
 */
export interface XpBackground {
  value: string;
  image: string;
}
