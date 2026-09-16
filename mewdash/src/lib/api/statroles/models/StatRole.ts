// lib/api/statroles/models/StatRole.ts

/** What a stat role measures. Mirrors StatRoleStat (numeric on the wire). */
export const StatRoleStat = {
  Messages: 0,
  VoiceMinutes: 1,
  Invites: 2,
  JoinedDays: 3,
  AccountDays: 4,
  ActivityMinutes: 5,
} as const;
export type StatRoleStatValue = (typeof StatRoleStat)[keyof typeof StatRoleStat];

/** How members qualify. Mirrors StatRoleLimit (numeric on the wire). */
export const StatRoleLimit = {
  Threshold: 0,
  TopRank: 1,
  TopPercent: 2,
  DailyStreak: 3,
} as const;
export type StatRoleLimitValue = (typeof StatRoleLimit)[keyof typeof StatRoleLimit];

/** Display labels for stats. */
export const statRoleStatLabels: Record<StatRoleStatValue, string> = {
  0: "Messages",
  1: "Voice minutes",
  2: "Invites",
  3: "Days in server",
  4: "Account age (days)",
  5: "Minutes in a game",
};

/** Display labels for limit types. */
export const statRoleLimitLabels: Record<StatRoleLimitValue, string> = {
  0: "Threshold",
  1: "Top rank",
  2: "Top percent",
  3: "Daily streak",
};

/** A stat role as returned by the bot. */
export interface StatRole {
  id: number;
  roleId: bigint;
  name: string;
  enabled: boolean;
  statType: number;
  limitType: number;
  minimum: number;
  maximum: number | null;
  lookbackDays: number;
  topStart: number;
  topEnd: number;
  requiredDays: number;
  permanent: boolean;
  invert: boolean;
  applyToBots: boolean;
  groupName: string | null;
  activityName: string | null;
  channelFilter: bigint[];
  roleWhitelist: bigint[];
  roleBlacklist: bigint[];
  ignoredUsers: bigint[];
  notifyChannelId: bigint | null;
  notifyDm: boolean;
  notifyMessage: string | null;
  intervalMinutes: number;
  lastRunAt: string | null;
  condition: string;
}

/** A create or update. Every field is optional on update. */
export interface StatRoleRequest {
  roleId?: bigint;
  name?: string;
  enabled?: boolean;
  statType?: number;
  limitType?: number;
  minimum?: number;
  maximum?: number;
  clearMaximum?: boolean;
  lookbackDays?: number;
  topStart?: number;
  topEnd?: number;
  requiredDays?: number;
  permanent?: boolean;
  invert?: boolean;
  applyToBots?: boolean;
  groupName?: string;
  activityName?: string;
  channelFilter?: bigint[];
  roleWhitelist?: bigint[];
  roleBlacklist?: bigint[];
  ignoredUsers?: bigint[];
  notifyChannelId?: bigint;
  clearNotifyChannel?: boolean;
  notifyDm?: boolean;
  notifyMessage?: string;
  intervalMinutes?: number;
}

/** One member in a run result. */
export interface StatRoleMember {
  userId: bigint;
  value: number;
  rank: number | null;
  username: string | null;
  avatarUrl: string | null;
}

/** A preview or run result. */
export interface StatRoleRunResult {
  statRoleId: number;
  roleId: bigint;
  qualifyingCount: number;
  qualifying: StatRoleMember[];
  toGrant: StatRoleMember[];
  toRemove: StatRoleMember[];
  granted: number;
  removed: number;
  failed: number;
}
