// lib/api/moderation/moderation.ts
import { apiRequest } from "../core";
import type {
  ModCase,
  ModCaseChannels,
  ModCaseFilter,
  ModCasePage,
  ModLeaderboardEntry,
  ModNote,
  ModReasonAlias,
  PunishDms,
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

  /** Lists mod cases, newest first */
  getCases: (guildId: bigint, filter: ModCaseFilter = {}) => {
    const query = new URLSearchParams();
    if (filter.userId) query.set("userId", filter.userId.toString());
    if (filter.moderatorId) query.set("moderatorId", filter.moderatorId.toString());
    if (filter.action) query.set("action", filter.action);
    query.set("page", String(filter.page ?? 0));
    query.set("pageSize", String(filter.pageSize ?? 25));
    return apiRequest<ModCasePage>(`Moderation/${guildId}/cases?${query}`);
  },

  /** Changes the reason of a case */
  setCaseReason: (guildId: bigint, caseNumber: number, reason: string) =>
    apiRequest<ModCase>(`Moderation/${guildId}/cases/${caseNumber}/reason`, "PUT", { reason }),

  /** Deletes a case */
  deleteCase: (guildId: bigint, caseNumber: number) =>
    apiRequest<void>(`Moderation/${guildId}/cases/${caseNumber}`, "DELETE"),

  /** Gets every case as CSV text */
  exportCases: (guildId: bigint) =>
    apiRequest<{ csv: string }>(`Moderation/${guildId}/cases/export`),

  /** Gets how many cases each moderator has */
  getCaseLeaderboard: (guildId: bigint) =>
    apiRequest<ModLeaderboardEntry[]>(`Moderation/${guildId}/cases/leaderboard`),

  getCaseChannels: (guildId: bigint) =>
    apiRequest<ModCaseChannels>(`Moderation/${guildId}/case-channels`),

  /** Sets where cases and member reports are posted, with null turning one off */
  setCaseChannels: (guildId: bigint, channels: ModCaseChannels) =>
    apiRequest<ModCaseChannels>(`Moderation/${guildId}/case-channels`, "PUT", channels),

  /** Lists moderator notes, newest first, for one member or the whole guild */
  getNotes: (guildId: bigint, userId?: bigint | string | null) =>
    apiRequest<ModNote[]>(`Moderation/${guildId}/notes${userId ? `?userId=${userId}` : ""}`),

  addNote: (guildId: bigint, userId: bigint, moderatorId: bigint, note: string) =>
    apiRequest<ModNote>(`Moderation/${guildId}/notes`, "POST", { userId, moderatorId, note }),

  removeNote: (guildId: bigint, noteId: number) =>
    apiRequest<void>(`Moderation/${guildId}/notes/${noteId}`, "DELETE"),

  getReasonAliases: (guildId: bigint) =>
    apiRequest<ModReasonAlias[]>(`Moderation/${guildId}/reason-aliases`),

  setReasonAlias: (guildId: bigint, name: string, reason: string) =>
    apiRequest<ModReasonAlias[]>(`Moderation/${guildId}/reason-aliases`, "PUT", { name, reason }),

  removeReasonAlias: (guildId: bigint, name: string) =>
    apiRequest<void>(`Moderation/${guildId}/reason-aliases/${encodeURIComponent(name)}`, "DELETE"),

  getPunishDms: (guildId: bigint) =>
    apiRequest<PunishDms>(`Moderation/${guildId}/punish-dms`),

  setPunishDm: (guildId: bigint, action: string, template: string) =>
    apiRequest<void>(`Moderation/${guildId}/punish-dms/${action}`, "PUT", { template }),

  resetPunishDm: (guildId: bigint, action: string) =>
    apiRequest<void>(`Moderation/${guildId}/punish-dms/${action}`, "DELETE"),
};
