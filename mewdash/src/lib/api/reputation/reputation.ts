// lib/api/reputation/reputation.ts
import { apiRequest } from "../core";
import type {
  CustomRepType,
  DecaySettingsRequest,
  RepLeaderboardEntry,
  ReactionRule,
  ReactionRuleRequest,
  RepConfig,
  RepHistoryEntry,
  RepStats,
  RoleReward,
  RoleRewardRequest,
} from "./models";

export const reputationApi = {
  getRepConfig: (guildId: bigint) =>
    apiRequest<RepConfig>(`Reputation/${guildId}/config`),

  setEnabled: (guildId: bigint, enabled: boolean) =>
    apiRequest<{ enabled: boolean }>(
      `Reputation/${guildId}/enabled`,
      "POST",
      enabled,
    ),

  setDefaultCooldown: (guildId: bigint, minutes: number) =>
    apiRequest<{ cooldownMinutes: number }>(
      `Reputation/${guildId}/cooldown`,
      "POST",
      minutes,
    ),

  setDailyLimit: (guildId: bigint, limit: number) =>
    apiRequest<{ dailyLimit: number }>(
      `Reputation/${guildId}/dailyLimit`,
      "POST",
      limit,
    ),

  setWeeklyLimit: (guildId: bigint, limit: number | null) =>
    apiRequest<{ weeklyLimit: number | null }>(
      `Reputation/${guildId}/weeklyLimit`,
      "POST",
      limit,
    ),

  setMinAccountAge: (guildId: bigint, days: number) =>
    apiRequest<{ minAccountAgeDays: number }>(
      `Reputation/${guildId}/minAccountAge`,
      "POST",
      days,
    ),

  setMinServerMembership: (guildId: bigint, hours: number) =>
    apiRequest<{ minServerMembershipHours: number }>(
      `Reputation/${guildId}/minServerMembership`,
      "POST",
      hours,
    ),

  setMinMessageCount: (guildId: bigint, count: number) =>
    apiRequest<{ minMessageCount: number }>(
      `Reputation/${guildId}/minMessageCount`,
      "POST",
      count,
    ),

  setNegativeReputation: (guildId: bigint, enabled: boolean) =>
    apiRequest<{ negativeRepEnabled: boolean }>(
      `Reputation/${guildId}/negativeRep`,
      "POST",
      enabled,
    ),

  setAnonymousReputation: (guildId: bigint, enabled: boolean) =>
    apiRequest<{ anonymousRepEnabled: boolean }>(
      `Reputation/${guildId}/anonymousRep`,
      "POST",
      enabled,
    ),

  setNotificationChannel: (guildId: bigint, channelId: bigint | null) =>
    apiRequest<{ notificationChannelId: bigint | null }>(
      `Reputation/${guildId}/notificationChannel`,
      "POST",
      channelId,
    ),

  getLeaderboard: (guildId: bigint, page: number = 1, pageSize: number = 20) =>
    apiRequest<RepLeaderboardEntry[]>(
      `Reputation/${guildId}/leaderboard?page=${page}&pageSize=${pageSize}`,
    ),

  getRoleRewards: (guildId: bigint) =>
    apiRequest<RoleReward[]>(`Reputation/${guildId}/roleRewards`),

  addOrUpdateRoleReward: (guildId: bigint, request: RoleRewardRequest) =>
    apiRequest<void>(`Reputation/${guildId}/roleRewards`, "POST", request),

  removeRoleReward: (guildId: bigint, roleId: bigint) =>
    apiRequest<void>(`Reputation/${guildId}/roleRewards/${roleId}`, "DELETE"),

  getReputationHistory: (
    guildId: bigint,
    userId: bigint,
    page: number = 1,
    pageSize: number = 20,
  ) =>
    apiRequest<RepHistoryEntry[]>(
      `Reputation/${guildId}/history/${userId}?page=${page}&pageSize=${pageSize}`,
    ),

  getReputationStats: (guildId: bigint) =>
    apiRequest<RepStats>(`Reputation/${guildId}/stats`),

  getCustomReputationTypes: (guildId: bigint) =>
    apiRequest<string[]>(`Reputation/${guildId}/customTypes`),

  setDecay: (guildId: bigint, request: DecaySettingsRequest) =>
    apiRequest<void>(`Reputation/${guildId}/decay`, "POST", request),

  getReactionRules: (guildId: bigint) =>
    apiRequest<ReactionRule[]>(`Reputation/${guildId}/reactions`),

  addReactionRule: (guildId: bigint, request: ReactionRuleRequest) =>
    apiRequest<void>(`Reputation/${guildId}/reactions`, "POST", request),

  removeReactionRule: (guildId: bigint, emoji: string) =>
    apiRequest<void>(
      `Reputation/${guildId}/reactions?emoji=${encodeURIComponent(emoji)}`,
      "DELETE",
    ),

  getMemberRep: (guildId: bigint, userId: bigint) =>
    apiRequest<{ totalRep: number; isFrozen: boolean }>(`Reputation/${guildId}/members/${userId}`),

  takeMemberRep: (guildId: bigint, userId: bigint, amount: number, adminId: bigint) =>
    apiRequest<{ totalRep: number }>(`Reputation/${guildId}/members/${userId}/take`, "POST", { amount, adminId }),

  setMemberRep: (guildId: bigint, userId: bigint, amount: number, adminId: bigint) =>
    apiRequest<{ totalRep: number }>(`Reputation/${guildId}/members/${userId}/set`, "POST", { amount, adminId }),

  setMemberFrozen: (guildId: bigint, userId: bigint, frozen: boolean) =>
    apiRequest<void>(`Reputation/${guildId}/members/${userId}/freeze`, "POST", frozen),

  resetMemberRep: (guildId: bigint, userId: bigint) =>
    apiRequest<void>(`Reputation/${guildId}/members/${userId}/reset`, "POST"),

  getCustomTypes: (guildId: bigint) =>
    apiRequest<CustomRepType[]>(`Reputation/${guildId}/types`),

  addCustomType: (guildId: bigint, typeName: string, displayName: string) =>
    apiRequest<void>(`Reputation/${guildId}/types`, "POST", { typeName, displayName }),

  removeCustomType: (guildId: bigint, typeName: string) =>
    apiRequest<void>(
      `Reputation/${guildId}/types/${encodeURIComponent(typeName)}`,
      "DELETE",
    ),
};
