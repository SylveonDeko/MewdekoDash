// lib/api/reputation/reputation.ts
import { apiRequest } from "../core";
import type { RepConfig, RoleRewardRequest } from "./models";

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
    apiRequest<any[]>(
      `Reputation/${guildId}/leaderboard?page=${page}&pageSize=${pageSize}`,
    ),

  getRoleRewards: (guildId: bigint) =>
    apiRequest<any[]>(`Reputation/${guildId}/roleRewards`),

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
    apiRequest<any[]>(
      `Reputation/${guildId}/history/${userId}?page=${page}&pageSize=${pageSize}`,
    ),

  getReputationStats: (guildId: bigint) =>
    apiRequest<any>(`Reputation/${guildId}/stats`),

  getCustomReputationTypes: (guildId: bigint) =>
    apiRequest<string[]>(`Reputation/${guildId}/customTypes`),
};
