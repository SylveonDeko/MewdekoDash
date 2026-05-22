// lib/api/xp/xp.ts
import { apiRequest } from "../core";
import type {
  GuildXpSetting,
  XpCurrencyReward,
  XpTemplate,
} from "./models";

/**
 * XP/Leveling system API
 * Maps to Mewdeko.Controllers.XpController
 */
export const xpApi = {
  /**
   * Gets XP settings for a guild
   * @param guildId The guild ID
   * @returns XP settings
   */
  getXpSettings: (guildId: bigint) =>
    apiRequest<GuildXpSetting>(`xp/${guildId}/settings`),

  updateXpSettings: (guildId: bigint, settings: GuildXpSetting) =>
    apiRequest<GuildXpSetting>(`xp/${guildId}/settings`, "POST", settings),

  getUserXpStats: (guildId: bigint, userId: bigint) =>
    apiRequest<{
      userId: bigint;
      guildId: bigint;
      totalXp: number;
      level: number;
      levelXp: number;
      requiredXp: number;
      rank: number;
      bonusXp: number;
      username: string;
      avatarUrl: string;
      timeOnLevel: {
        days: number;
        hours: number;
        minutes: number;
      };
    }>(`xp/${guildId}/user/${userId}`),

  addUserXp: (guildId: bigint, userId: bigint, amount: number) =>
    apiRequest<void>(`xp/${guildId}/user/${userId}/add`, "POST", amount),

  resetUserXp: (
    guildId: bigint,
    userId: bigint,
    resetBonusXp: boolean = false,
  ) =>
    apiRequest<void>(
      `xp/${guildId}/user/${userId}/reset`,
      "POST",
      resetBonusXp,
    ),

  setUserXp: (guildId: bigint, userId: bigint, amount: number) =>
    apiRequest<void>(`xp/${guildId}/user/${userId}/set`, "POST", amount),

  getXpLeaderboard: (
    guildId: bigint,
    page: number = 1,
    pageSize: number = 10,
    customFetch: typeof fetch = fetch,
    additionalHeaders: HeadersInit = {},
  ) =>
    apiRequest<
      Array<{
        userId: bigint;
        guildId: bigint;
        totalXp: number;
        level: number;
        levelXp: number;
        requiredXp: number;
        rank: number;
        bonusXp: number;
        username: string;
        avatarUrl: string;
      }>
    >(
      `xp/${guildId}/leaderboard?page=${page}&pageSize=${pageSize}`,
      "GET",
      undefined,
      additionalHeaders,
      customFetch,
    ),

  getXpRoleRewards: (guildId: bigint) =>
    apiRequest<
      Array<{
        id: number;
        guildId: bigint;
        level: number;
        roleId: bigint;
        roleName: string;
      }>
    >(`xp/${guildId}/rewards/roles`),

  addXpRoleReward: (guildId: bigint, level: number, roleId: bigint) =>
    apiRequest<void>(`xp/${guildId}/rewards/roles`, "POST", { level, roleId }),

  removeXpRoleReward: (guildId: bigint, rewardId: number) =>
    apiRequest<void>(`xp/${guildId}/rewards/roles/${rewardId}`, "DELETE"),

  getXpCurrencyRewards: (guildId: bigint) =>
    apiRequest<XpCurrencyReward[]>(`xp/${guildId}/rewards/currency`),

  addXpCurrencyReward: (guildId: bigint, level: number, amount: number) =>
    apiRequest<void>(`xp/${guildId}/rewards/currency`, "POST", {
      level,
      amount,
    }),

  removeXpCurrencyReward: (guildId: bigint, rewardId: number) =>
    apiRequest<void>(`xp/${guildId}/rewards/currency/${rewardId}`, "DELETE"),

  getXpExcludedChannels: (guildId: bigint) =>
    apiRequest<bigint[]>(`xp/${guildId}/excluded/channels`),

  excludeXpChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`xp/${guildId}/excluded/channels`, "POST", channelId),

  includeXpChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`xp/${guildId}/excluded/channels/${channelId}`, "DELETE"),

  getXpExcludedRoles: (guildId: bigint) =>
    apiRequest<bigint[]>(`xp/${guildId}/excluded/roles`),

  excludeXpRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<void>(`xp/${guildId}/excluded/roles`, "POST", roleId),

  includeXpRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<void>(`xp/${guildId}/excluded/roles/${roleId}`, "DELETE"),

  getXpTemplate: (guildId: bigint) =>
    apiRequest<XpTemplate>(`xp/${guildId}/template`),

  updateXpTemplate: (guildId: bigint, template: XpTemplate) =>
    apiRequest<void>(`xp/${guildId}/template`, "POST", template),

  getXpServerStats: (
    guildId: bigint,
    customFetch: typeof fetch = fetch,
    additionalHeaders: HeadersInit = {},
  ) =>
    apiRequest<{
      totalUsers: number;
      totalXp: number;
      averageLevel: number;
      highestLevel: number;
      recentActivity: Array<{
        userId: bigint;
        username: string;
        avatarUrl: string;
        timestamp: string;
      }>;
    }>(`xp/${guildId}/stats`, "GET", undefined, additionalHeaders, customFetch),
};
