import { protectionApi } from "$lib/api/index.ts";
import { idString, type SaveMode } from "../automodModel";

export const Action = { Mute: 0, Kick: 1, Ban: 2, AddRole: 7, Delete: 8, Warn: 9, Timeout: 10 } as const;

/** Actions that last for a set time. */
export const TIMED_ACTIONS: number[] = [Action.Mute, Action.Ban, Action.AddRole, Action.Timeout];

export type ProtectionKey =
  | "antiRaid"
  | "antiSpam"
  | "antiAlt"
  | "antiMassMention"
  | "antiMassPost"
  | "antiPostChannel"
  | "antiPattern"
  | "antiImageHash"
  | "antiExternalApp";

export const PROTECTION_KEYS: ProtectionKey[] = [
  "antiRaid",
  "antiSpam",
  "antiAlt",
  "antiMassMention",
  "antiMassPost",
  "antiPostChannel",
  "antiPattern",
  "antiImageHash",
  "antiExternalApp"
];

export type Status = Record<string, any>;
export type StatusMap = Record<ProtectionKey, Status>;
export type Patch = (changes: Status, mode?: SaveMode) => void;

const DEFAULTS: StatusMap = {
  antiRaid: { userThreshold: 5, seconds: 10, action: Action.Timeout, punishDuration: 60 },
  antiSpam: { messageThreshold: 5, action: Action.Timeout, muteTime: 5, roleId: null, ignoredChannels: [] },
  antiAlt: { minAgeMinutes: 1440, action: Action.Kick, actionDurationMinutes: 0, roleId: null },
  antiMassMention: {
    mentionThreshold: 5,
    timeWindowSeconds: 30,
    maxMentionsInTimeWindow: 10,
    ignoreBots: true,
    action: Action.Timeout,
    muteTime: 5,
    roleId: null
  },
  antiMassPost: {
    channelThreshold: 3,
    timeWindowSeconds: 60,
    contentSimilarityThreshold: 0.8,
    minContentLength: 20,
    checkLinksOnly: true,
    checkDuplicateContent: true,
    requireIdenticalContent: false,
    caseSensitive: false,
    deleteMessages: true,
    notifyUser: true,
    action: Action.Ban,
    punishDuration: 0,
    roleId: null,
    ignoreBots: true,
    maxMessagesTracked: 50,
    counter: 0
  },
  antiPostChannel: {
    action: Action.Ban,
    punishDuration: 0,
    roleId: null,
    deleteMessages: true,
    notifyUser: true,
    ignoreBots: true,
    channels: [],
    ignoredRoles: [],
    ignoredUsers: [],
    counter: 0
  },
  antiPattern: {
    action: Action.Timeout,
    punishDuration: 60,
    roleId: null,
    checkAccountAge: true,
    maxAccountAgeMonths: 6,
    checkJoinTiming: true,
    maxJoinHours: 48,
    checkBatchCreation: true,
    checkOfflineStatus: true,
    checkNewAccounts: true,
    newAccountDays: 7,
    minimumScore: 15,
    patternCount: 0,
    counter: 0
  },
  antiImageHash: {
    action: Action.Ban,
    punishDuration: 0,
    roleId: null,
    hashThreshold: 31,
    deleteMessages: true,
    notifyUser: true,
    ignoreBots: true,
    checkEmbeds: true,
    checkBorders: true,
    usePresetList: true,
    presetCount: 0,
    presetTriggers: 0,
    maxImageSizeMb: 8,
    hashCount: 0,
    counter: 0
  },
  antiExternalApp: {
    action: Action.Timeout,
    punishDuration: 60,
    roleId: null,
    mentionThreshold: 5,
    blockInvites: true,
    maxMessages: 5,
    timeWindowSeconds: 10,
    deleteMessages: true,
    notifyUser: true,
    counter: 0
  }
};

function ids(value: unknown): string[] {
  return Array.isArray(value) ? value.map(idString) : [];
}

/**
 * Fills in a protection's settings from what the bot reported.
 * @param key The protection
 * @param raw What the bot returned for it
 */
export function normalize(key: ProtectionKey, raw: Status | undefined): Status {
  const enabled = Boolean(raw?.enabled);
  const merged: Status = enabled ? { ...DEFAULTS[key], ...raw } : { ...DEFAULTS[key] };
  const role = idString(raw?.roleId);
  merged.roleId = enabled && role && role !== "0" ? role : null;
  merged.enabled = enabled;
  if (key === "antiAlt") merged.actionDurationMinutes = enabled ? Number(raw?.actionDuration ?? 0) : 0;
  for (const list of ["ignoredChannels", "channels", "ignoredRoles", "ignoredUsers"]) {
    if (list in DEFAULTS[key]) merged[list] = enabled ? ids(raw?.[list]) : [];
  }
  return merged;
}

function role(status: Status): bigint | null {
  return status.roleId && Action.AddRole === Number(status.action) ? BigInt(status.roleId) : null;
}

/**
 * Builds the request the bot expects for one protection.
 * @param key The protection
 * @param s The settings
 */
export function toRequest(key: ProtectionKey, s: Status): Status {
  const base = { enabled: s.enabled, action: Number(s.action), roleId: role(s) };
  switch (key) {
    case "antiRaid":
      return { enabled: s.enabled, userThreshold: s.userThreshold, seconds: s.seconds, action: Number(s.action), punishDuration: s.punishDuration };
    case "antiSpam":
      return { ...base, messageThreshold: s.messageThreshold, muteTime: s.muteTime };
    case "antiAlt":
      return { ...base, minAgeMinutes: s.minAgeMinutes, actionDurationMinutes: s.actionDurationMinutes };
    case "antiMassMention":
      return {
        ...base,
        mentionThreshold: s.mentionThreshold,
        timeWindowSeconds: s.timeWindowSeconds,
        maxMentionsInTimeWindow: s.maxMentionsInTimeWindow,
        ignoreBots: s.ignoreBots,
        muteTime: s.muteTime
      };
    case "antiMassPost":
      return {
        ...base,
        channelThreshold: s.channelThreshold,
        timeWindowSeconds: s.timeWindowSeconds,
        contentSimilarityThreshold: s.contentSimilarityThreshold,
        minContentLength: s.minContentLength,
        checkLinksOnly: s.checkLinksOnly,
        checkDuplicateContent: s.checkDuplicateContent,
        requireIdenticalContent: s.requireIdenticalContent,
        caseSensitive: s.caseSensitive,
        deleteMessages: s.deleteMessages,
        notifyUser: s.notifyUser,
        punishDuration: s.punishDuration,
        ignoreBots: s.ignoreBots,
        maxMessagesTracked: s.maxMessagesTracked
      };
    case "antiPostChannel":
      return {
        ...base,
        punishDuration: s.punishDuration,
        deleteMessages: s.deleteMessages,
        notifyUser: s.notifyUser,
        ignoreBots: s.ignoreBots
      };
    case "antiPattern":
      return {
        ...base,
        punishDuration: s.punishDuration,
        checkAccountAge: s.checkAccountAge,
        maxAccountAgeMonths: s.maxAccountAgeMonths,
        checkJoinTiming: s.checkJoinTiming,
        maxJoinHours: s.maxJoinHours,
        checkBatchCreation: s.checkBatchCreation,
        checkOfflineStatus: s.checkOfflineStatus,
        checkNewAccounts: s.checkNewAccounts,
        newAccountDays: s.newAccountDays,
        minimumScore: s.minimumScore
      };
    case "antiImageHash":
      return {
        ...base,
        punishDuration: s.punishDuration,
        hashThreshold: s.hashThreshold,
        deleteMessages: s.deleteMessages,
        notifyUser: s.notifyUser,
        ignoreBots: s.ignoreBots,
        checkEmbeds: s.checkEmbeds,
        checkBorders: s.checkBorders,
        usePresetList: s.usePresetList,
        maxImageSizeMb: s.maxImageSizeMb
      };
    case "antiExternalApp":
      return {
        ...base,
        punishDuration: s.punishDuration,
        mentionThreshold: s.mentionThreshold,
        blockInvites: s.blockInvites,
        maxMessages: s.maxMessages,
        timeWindowSeconds: s.timeWindowSeconds,
        deleteMessages: s.deleteMessages,
        notifyUser: s.notifyUser
      };
  }
}

export const senders: Record<ProtectionKey, (guildId: bigint, request: Status) => Promise<unknown>> = {
  antiRaid: (g, r) => protectionApi.configureAntiRaid(g, r as never),
  antiSpam: (g, r) => protectionApi.configureAntiSpam(g, r as never),
  antiAlt: (g, r) => protectionApi.configureAntiAlt(g, r as never),
  antiMassMention: (g, r) => protectionApi.configureAntiMassMention(g, r as never),
  antiMassPost: (g, r) => protectionApi.configureAntiMassPost(g, r as never),
  antiPostChannel: (g, r) => protectionApi.configureAntiPostChannel(g, r as never),
  antiPattern: (g, r) => protectionApi.configureAntiPattern(g, r),
  antiImageHash: (g, r) => protectionApi.configureAntiImageHash(g, r as never),
  antiExternalApp: (g, r) => protectionApi.configureAntiExternalApp(g, r as never)
};
