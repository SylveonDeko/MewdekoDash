// lib/api/moderation/moderation.ts
import { apiRequest } from "../core";
import type { Warning, WarningPunishment } from "./models";

/**
 * Moderation API
 * Maps to Mewdeko.Controllers.ModerationController
 */
export const moderationApi = {
  /**
   * Gets all warnings for a guild
   * @param guildId The guild ID
   * @returns Collection of warnings
   */
  getWarnings: (guildId: bigint) =>
    apiRequest<Warning[]>(`Moderation/${guildId}/warnings`),

  /**
   * Gets warnings for a specific user
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns Collection of user warnings
   */
  getUserWarnings: (guildId: bigint, userId: bigint) =>
    apiRequest<Warning[]>(`Moderation/${guildId}/warnings/user/${userId}`),

  /**
   * Gets recent moderation activity
   * @param guildId The guild ID
   * @param limit Number of recent items to return (default: 20)
   * @returns Recent moderation activity
   */
  getRecentModerationActivity: (guildId: bigint, limit: number = 20) =>
    apiRequest<Warning[]>(`Moderation/${guildId}/recent?limit=${limit}`),

  /**
   * Gets warning punishment settings for a guild
   * @param guildId The guild ID
   * @returns Warning punishment configuration
   */
  getWarningPunishments: (guildId: bigint) =>
    apiRequest<WarningPunishment[]>(`Moderation/${guildId}/punishments`),

  /**
   * Gets the warn log channel for a guild
   * @param guildId The guild ID
   * @returns Channel ID
   */
  getWarnlogChannel: (guildId: bigint) =>
    apiRequest<{ channelId: bigint }>(`Moderation/${guildId}/warnlog-channel`),
};
