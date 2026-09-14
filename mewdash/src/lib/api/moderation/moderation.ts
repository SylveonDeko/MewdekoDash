// lib/api/moderation/moderation.ts
import { apiRequest } from "../core";
import type {
  SetWarnPunishmentRequest,
  WarnUserRequest,
  WarnUserResponse,
  Warning,
  WarningPunishment,
} from "./models";

/**
 * Moderation API
 * Maps to Mewdeko.Controllers.ModerationController
 */
export const moderationApi = {
  getWarnings: (guildId: bigint) =>
    apiRequest<Warning[]>(`Moderation/${guildId}/warnings`),

  getUserWarnings: (guildId: bigint, userId: bigint) =>
    apiRequest<Warning[]>(`Moderation/${guildId}/warnings/user/${userId}`),

  /**
   * Issues a warning to a user from the dashboard
   */
  warnUser: (guildId: bigint, userId: bigint, request: WarnUserRequest) =>
    apiRequest<WarnUserResponse>(
      `Moderation/${guildId}/warnings/user/${userId}`,
      "POST",
      request,
    ),

  /**
   * Forgives a single warning by id
   */
  forgiveWarning: (guildId: bigint, warningId: number, moderatorId: bigint) =>
    apiRequest<Warning>(
      `Moderation/${guildId}/warnings/${warningId}/forgive`,
      "POST",
      { moderatorId },
    ),

  /**
   * Forgives every active warning for a user
   */
  forgiveAllWarnings: (guildId: bigint, userId: bigint, moderatorId: bigint) =>
    apiRequest<Warning[]>(
      `Moderation/${guildId}/warnings/user/${userId}/forgive-all`,
      "POST",
      { moderatorId },
    ),

  /**
   * Permanently deletes a warning
   */
  deleteWarning: (guildId: bigint, warningId: number) =>
    apiRequest<void>(`Moderation/${guildId}/warnings/${warningId}`, "DELETE"),

  getRecentModerationActivity: (guildId: bigint, limit: number = 20) =>
    apiRequest<Warning[]>(`Moderation/${guildId}/recent?limit=${limit}`),

  getWarningPunishments: (guildId: bigint) =>
    apiRequest<WarningPunishment[]>(`Moderation/${guildId}/punishments`),

  /**
   * Adds or replaces the punishment for a warning count
   */
  setWarningPunishment: (guildId: bigint, request: SetWarnPunishmentRequest) =>
    apiRequest<WarningPunishment[]>(
      `Moderation/${guildId}/punishments`,
      "PUT",
      request,
    ),

  /**
   * Removes the punishment configured for a warning count
   */
  removeWarningPunishment: (guildId: bigint, count: number) =>
    apiRequest<WarningPunishment[]>(
      `Moderation/${guildId}/punishments/${count}`,
      "DELETE",
    ),

  getWarnlogChannel: (guildId: bigint) =>
    apiRequest<{ channelId: bigint }>(`Moderation/${guildId}/warnlog-channel`),

  /**
   * Sets the channel warnings are logged to
   */
  setWarnlogChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<{ channelId: bigint }>(
      `Moderation/${guildId}/warnlog-channel`,
      "POST",
      { channelId },
    ),
};
