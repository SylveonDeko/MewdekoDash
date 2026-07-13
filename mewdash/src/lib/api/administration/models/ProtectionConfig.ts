// lib/api/administration/models/ProtectionConfig.ts
import type { PunishmentAction } from "./PunishmentAction";

/**
 * Request model for anti-raid configuration
 * Maps to Mewdeko.Controllers.Common.Protection.AntiRaidConfigRequest
 */
export interface AntiRaidConfig {
  /** Whether anti-raid protection should be enabled */
  enabled: boolean;

  /** The number of users joining that triggers the anti-raid protection (2-30) */
  userThreshold: number;

  /** The time period in seconds in which the user threshold must be reached (2-300) */
  seconds: number;

  /** The punishment action to be applied when the protection is triggered */
  action: PunishmentAction;

  /** The duration of the punishment in minutes, if applicable (0-1440) */
  punishDuration: number;
}

/**
 * Request model for anti-spam configuration
 * Maps to Mewdeko.Controllers.Common.Protection.AntiSpamConfigRequest
 */
export interface AntiSpamConfig {
  /** Whether anti-spam protection should be enabled */
  enabled: boolean;

  /** The number of messages that triggers the anti-spam protection */
  messageThreshold: number;

  /** The punishment action to be applied when the protection is triggered */
  action: PunishmentAction;

  /** The duration of the mute in minutes, if applicable */
  muteTime: number;

  /** The ID of the role to be added as punishment, if applicable */
  roleId?: bigint | null;
}

/**
 * Request model for anti-alt configuration
 * Maps to Mewdeko.Controllers.Common.Protection.AntiAltConfigRequest
 */
export interface AntiAltConfig {
  /** Whether anti-alt protection should be enabled */
  enabled: boolean;

  /** The minimum account age in minutes */
  minAgeMinutes: number;

  /** The punishment action to be applied when the protection is triggered */
  action: PunishmentAction;

  /** The duration of the action in minutes, if applicable */
  actionDurationMinutes: number;

  /** The ID of the role to be added as punishment, if applicable */
  roleId?: bigint | null;
}

/**
 * Request model for anti-mass mention configuration
 * Maps to Mewdeko.Controllers.Common.Protection.AntiMassMentionConfigRequest
 */
export interface AntiMassMentionConfig {
  /** Whether anti-mass mention protection should be enabled */
  enabled: boolean;

  /** The number of mentions that triggers the protection */
  mentionThreshold: number;

  /** The time window in seconds for counting mentions */
  timeWindowSeconds: number;

  /** The maximum allowed mentions within the time window */
  maxMentionsInTimeWindow: number;

  /** Whether to ignore bot mentions */
  ignoreBots: boolean;

  /** The punishment action to be applied when the protection is triggered */
  action: PunishmentAction;

  /** The duration of the mute in minutes, if applicable */
  muteTime: number;

  /** The ID of the role to be added as punishment, if applicable */
  roleId?: bigint | null;
}

/**
 * Request model for anti-mass-post configuration
 * Maps to Mewdeko.Controllers.Common.Protection.AntiMassPostConfigRequest
 */
export interface AntiMassPostConfig {
  /** Whether anti-mass-post protection should be enabled */
  enabled: boolean;

  /** The number of different channels that triggers the protection (2-20) */
  channelThreshold: number;

  /** The time window in seconds for tracking posts (10-600) */
  timeWindowSeconds: number;

  /** Content similarity threshold (0.0-1.0) */
  contentSimilarityThreshold: number;

  /** Minimum content length to track */
  minContentLength: number;

  /** Only track messages containing links */
  checkLinksOnly: boolean;

  /** Check for duplicate content */
  checkDuplicateContent: boolean;

  /** Require content to be identical vs similar */
  requireIdenticalContent: boolean;

  /** Whether content comparison is case sensitive */
  caseSensitive: boolean;

  /** Whether to delete detected messages */
  deleteMessages: boolean;

  /** Whether to notify user via DM */
  notifyUser: boolean;

  /** The punishment action to be applied */
  action: PunishmentAction;

  /** The duration of the punishment in minutes (0-1440) */
  punishDuration: number;

  /** The ID of the role to be added as punishment, if applicable */
  roleId?: bigint | null;

  /** Whether to ignore bot messages */
  ignoreBots: boolean;

  /** Maximum number of messages to track per user */
  maxMessagesTracked: number;
}

/**
 * Request model for anti-post-channel configuration
 * Maps to Mewdeko.Controllers.Common.Protection.AntiPostChannelConfigRequest
 */
export interface AntiPostChannelConfig {
  /** Whether anti-post-channel protection should be enabled */
  enabled: boolean;

  /** The punishment action to be applied */
  action: PunishmentAction;

  /** The duration of the punishment in minutes (0-1440) */
  punishDuration: number;

  /** The ID of the role to be added as punishment, if applicable */
  roleId?: bigint | null;

  /** Whether to delete messages posted in honeypot channels */
  deleteMessages: boolean;

  /** Whether to notify user via DM */
  notifyUser: boolean;

  /** Whether to ignore bot messages */
  ignoreBots: boolean;
}

/**
 * Protection status response
 */
export interface ProtectionStatus {
  antiRaid: {
    enabled: boolean;
    userThreshold: number;
    seconds: number;
    action: number;
    punishDuration: number;
    usersCount: number;
  };
  antiSpam: {
    enabled: boolean;
    messageThreshold: number;
    action: number;
    muteTime: number;
    roleId: bigint;
    userCount: number;
  };
  antiAlt: {
    enabled: boolean;
    minAge: string;
    action: number;
    actionDuration: number;
    roleId: bigint;
    counter: number;
  };
  antiMassMention: {
    enabled: boolean;
    mentionThreshold: number;
    maxMentionsInTimeWindow: number;
    timeWindowSeconds: number;
    action: number;
    muteTime: number;
    roleId: bigint;
    ignoreBots: boolean;
    userCount: number;
  };
  antiPattern: {
    enabled: boolean;
    action: number;
    punishDuration: number;
    roleId: bigint;
    checkAccountAge: boolean;
    maxAccountAgeMonths: number;
    checkJoinTiming: boolean;
    maxJoinHours: number;
    checkBatchCreation: boolean;
    checkOfflineStatus: boolean;
    checkNewAccounts: boolean;
    newAccountDays: number;
    minimumScore: number;
    patternCount: number;
    counter: number;
  };
  antiMassPost: {
    enabled: boolean;
    action: number;
    channelThreshold: number;
    timeWindowSeconds: number;
    contentSimilarityThreshold: number;
    minContentLength: number;
    checkLinksOnly: boolean;
    checkDuplicateContent: boolean;
    requireIdenticalContent: boolean;
    caseSensitive: boolean;
    deleteMessages: boolean;
    notifyUser: boolean;
    punishDuration: number;
    roleId: bigint;
    ignoreBots: boolean;
    maxMessagesTracked: number;
    userCount: number;
    counter: number;
  };
  antiPostChannel: {
    enabled: boolean;
    action: number;
    deleteMessages: boolean;
    notifyUser: boolean;
    punishDuration: number;
    roleId: bigint;
    ignoreBots: boolean;
    channelCount: number;
    channels: bigint[];
    ignoredRoles: bigint[];
    ignoredUsers: bigint[];
    counter: number;
  };
  antiImageHash: {
    enabled: boolean;
    action: number;
    punishDuration: number;
    roleId: bigint;
    /** Max hamming distance out of 256 PDQ bits. PDQ's standard "same image" threshold is 31. */
    hashThreshold: number;
    deleteMessages: boolean;
    notifyUser: boolean;
    ignoreBots: boolean;
    checkEmbeds: boolean;
    /** Strip a solid border from posted images before matching, catching bordered copies. */
    checkBorders: boolean;
    /** Also block the known scam images that ship with the bot. */
    usePresetList: boolean;
    /** How many known scam images the bot ships with. */
    presetCount: number;
    /** How many times a known scam image has been caught in this guild. */
    presetTriggers: number;
    maxImageSizeMb: number;
    hashCount: number;
    ignoredRoles: bigint[];
    ignoredChannels: bigint[];
    counter: number;
  };
}

/**
 * Protection statistics
 */
export interface ProtectionStats {
  /** Total protection triggers */
  totalTriggers: number;

  /** Triggers by type */
  triggersByType: Record<string, number>;

  /** Recent triggers */
  recentTriggers: Array<{
    type: string;
    timestamp: string;
    userId: bigint;
  }>;
}

/**
 * Protection statistics
 */
export interface ProtectionStats {
  /** Total protection triggers */
  totalTriggers: number;

  /** Triggers by type */
  triggersByType: Record<string, number>;

  /** Recent triggers */
  recentTriggers: Array<{
    type: string;
    timestamp: string;
    userId: bigint;
  }>;
}
