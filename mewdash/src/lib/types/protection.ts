// Protection system types
export interface ProtectionStatus {
  antiRaid: AntiRaidSettings;
  antiSpam: AntiSpamSettings;
  antiAlt: AntiAltSettings;
  antiMassMention: AntiMassMentionSettings;
}

export interface AntiRaidSettings {
  enabled: boolean;
  userThreshold: number;
  seconds: number;
  action: number;
  punishDuration: number;
  usersCount: number;
}

export interface AntiSpamSettings {
  enabled: boolean;
  messageThreshold: number;
  action: number;
  muteTime: number;
  roleId: bigint;
  userCount: number;
  ignoredChannels?: bigint[];
  ignoredUsers?: bigint[];
}

export interface AntiAltSettings {
  enabled: boolean;
  minAge: string;
  action: number;
  actionDuration: number;
  roleId: bigint;
  counter: number;
}

export interface AntiMassMentionSettings {
  enabled: boolean;
  mentionThreshold: number;
  maxMentionsInTimeWindow: number;
  timeWindowSeconds: number;
  action: number;
  muteTime: number;
  roleId: bigint;
  ignoreBots: boolean;
  userCount: number;
}

export interface ProtectionActionType {
  id: number;
  name: string;
  description: string;
  requiresDuration?: boolean;
  requiresRole?: boolean;
}

export interface ProtectionStats {
  antiRaid: {
    triggeredToday: number;
    usersDetected: number;
    averageUsersPerMinute: number;
  };
  antiSpam: {
    messagesBlocked: number;
    usersWarned: number;
    usersMuted: number;
  };
  antiAlt: {
    altsDetected: number;
    accountsBlocked: number;
  };
  antiMassMention: {
    mentionsBlocked: number;
    usersWarned: number;
  };
}

export const PROTECTION_ACTIONS: ProtectionActionType[] = [
  { id: 0, name: "None", description: "No action taken" },
  { id: 1, name: "Warn", description: "Send a warning to the user" },
  { id: 2, name: "Mute", description: "Mute the user", requiresDuration: true, requiresRole: true },
  { id: 3, name: "Kick", description: "Kick the user from the server" },
  { id: 4, name: "Ban", description: "Ban the user from the server", requiresDuration: true },
  { id: 5, name: "Softban", description: "Ban and immediately unban to delete messages" },
];