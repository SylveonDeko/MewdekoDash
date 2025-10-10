// lib/api/counting/counting.ts
import { apiRequest } from "../core";
import {
  type CountingChannelResponse,
  type CountingConfigResponse,
  type CountingStatsResponse,
  type CountingUserStatsResponse,
  type LeaderboardResponse,
  type SavePointResponse,
  type SetupCountingChannelRequest,
  type UpdateCountingConfigRequest,
  type ResetCountingChannelRequest,
  type CreateSavePointRequest,
  type RestoreSavePointRequest,
  type BanUserRequest,
  type UnbanUserRequest,
  type SetCustomMessageRequest,
  type SetMilestonesRequest,
  type PurgeChannelRequest,
  LeaderboardType,
} from "./models";

/**
 * Counting game API
 * Maps to Mewdeko.Controllers.CountingController
 */
export const countingApi = {
  /**
   * Gets all counting channels in a guild
   * @param guildId The guild ID
   * @returns List of counting channels
   */
  getCountingChannels: (guildId: bigint) =>
    apiRequest<CountingChannelResponse[]>(`Counting/${guildId}/channels`),

  /**
   * Sets up counting in a specific channel
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @param request Setup configuration
   * @returns Created counting channel
   */
  setupCountingChannel: (
    guildId: bigint,
    channelId: bigint,
    request: SetupCountingChannelRequest,
  ) =>
    apiRequest<CountingChannelResponse>(
      `Counting/${guildId}/channels/${channelId}/setup`,
      "POST",
      request,
    ),

  /**
   * Gets the status and statistics of a counting channel
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @returns Channel status and stats
   */
  getChannelStatus: (guildId: bigint, channelId: bigint) =>
    apiRequest<any>(`Counting/${guildId}/channels/${channelId}/status`),

  /**
   * Gets counting configuration for a channel
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @returns Channel configuration
   */
  getCountingConfig: (guildId: bigint, channelId: bigint) =>
    apiRequest<CountingConfigResponse>(
      `Counting/${guildId}/channels/${channelId}/config`,
    ),

  /**
   * Updates counting configuration for a channel
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @param request Configuration updates
   */
  updateCountingConfig: (
    guildId: bigint,
    channelId: bigint,
    request: UpdateCountingConfigRequest,
  ) =>
    apiRequest<void>(
      `Counting/${guildId}/channels/${channelId}/config`,
      "PUT",
      request,
    ),

  /**
   * Resets a counting channel to a specific number
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @param request Reset configuration
   */
  resetCountingChannel: (
    guildId: bigint,
    channelId: bigint,
    request: ResetCountingChannelRequest,
  ) =>
    apiRequest<void>(
      `Counting/${guildId}/channels/${channelId}/reset`,
      "POST",
      request,
    ),

  /**
   * Removes counting from a channel
   * @param guildId The guild ID
   * @param channelId The channel ID
   */
  removeCountingChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`Counting/${guildId}/channels/${channelId}`, "DELETE"),

  /**
   * Purges all data for a counting channel (IRREVERSIBLE)
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @param request Purge request
   */
  purgeCountingChannel: (
    guildId: bigint,
    channelId: bigint,
    request: PurgeChannelRequest,
  ) =>
    apiRequest<string>(
      `Counting/${guildId}/channels/${channelId}/purge`,
      "DELETE",
      request,
    ),

  /**
   * Gets counting statistics for a channel
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @returns Channel statistics
   */
  getCountingStats: (guildId: bigint, channelId: bigint) =>
    apiRequest<CountingStatsResponse>(
      `Counting/${guildId}/channels/${channelId}/stats`,
    ),

  /**
   * Gets user counting statistics for a channel
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @param userId The user ID
   * @returns User statistics
   */
  getUserCountingStats: (guildId: bigint, channelId: bigint, userId: bigint) =>
    apiRequest<CountingUserStatsResponse>(
      `Counting/${guildId}/channels/${channelId}/users/${userId}/stats`,
    ),

  /**
   * Gets counting leaderboard for a channel
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @param type Leaderboard type
   * @param page Page number
   * @param pageSize Items per page
   * @returns Leaderboard data
   */
  getLeaderboard: (
    guildId: bigint,
    channelId: bigint,
    type: LeaderboardType = LeaderboardType.Contributions,
    page: number = 1,
    pageSize: number = 20,
  ) =>
    apiRequest<LeaderboardResponse>(
      `Counting/${guildId}/channels/${channelId}/leaderboard?type=${type}&page=${page}&pageSize=${pageSize}`,
    ),

  /**
   * Creates a save point at the current number
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @param request Save point request
   * @returns Created save point
   */
  createSavePoint: (
    guildId: bigint,
    channelId: bigint,
    request: CreateSavePointRequest,
  ) =>
    apiRequest<SavePointResponse>(
      `Counting/${guildId}/channels/${channelId}/savepoints`,
      "POST",
      request,
    ),

  /**
   * Gets all save points for a channel
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @returns List of save points
   */
  getSavePoints: (guildId: bigint, channelId: bigint) =>
    apiRequest<SavePointResponse[]>(
      `Counting/${guildId}/channels/${channelId}/savepoints`,
    ),

  /**
   * Restores counting from a save point
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @param request Restore request
   */
  restoreSavePoint: (
    guildId: bigint,
    channelId: bigint,
    request: RestoreSavePointRequest,
  ) =>
    apiRequest<void>(
      `Counting/${guildId}/channels/${channelId}/savepoints/restore`,
      "POST",
      request,
    ),

  /**
   * Deletes a save point
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @param saveId The save point ID
   */
  deleteSavePoint: (guildId: bigint, channelId: bigint, saveId: number) =>
    apiRequest<void>(
      `Counting/${guildId}/channels/${channelId}/savepoints/${saveId}`,
      "DELETE",
    ),

  /**
   * Bans a user from counting
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @param userId The user ID to ban
   * @param request Ban request
   */
  banUser: (
    guildId: bigint,
    channelId: bigint,
    userId: bigint,
    request: BanUserRequest,
  ) =>
    apiRequest<void>(
      `Counting/${guildId}/channels/${channelId}/users/${userId}/ban`,
      "POST",
      request,
    ),

  /**
   * Unbans a user from counting
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @param userId The user ID to unban
   * @param request Unban request
   */
  unbanUser: (
    guildId: bigint,
    channelId: bigint,
    userId: bigint,
    request: UnbanUserRequest,
  ) =>
    apiRequest<void>(
      `Counting/${guildId}/channels/${channelId}/users/${userId}/unban`,
      "POST",
      request,
    ),

  /**
   * Gets banned users for a channel
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @returns List of banned users
   */
  getBannedUsers: (guildId: bigint, channelId: bigint) =>
    apiRequest<any[]>(`Counting/${guildId}/channels/${channelId}/banned-users`),

  /**
   * Sets custom success message
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @param request Custom message request
   */
  setCustomMessage: (
    guildId: bigint,
    channelId: bigint,
    request: SetCustomMessageRequest,
  ) =>
    apiRequest<void>(
      `Counting/${guildId}/channels/${channelId}/custom-message`,
      "POST",
      request,
    ),

  /**
   * Sets milestone numbers
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @param request Milestones request
   */
  setMilestones: (
    guildId: bigint,
    channelId: bigint,
    request: SetMilestonesRequest,
  ) =>
    apiRequest<void>(
      `Counting/${guildId}/channels/${channelId}/milestones`,
      "POST",
      request,
    ),

  /**
   * Gets milestones for a channel
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @returns List of milestone numbers
   */
  getMilestones: (guildId: bigint, channelId: bigint) =>
    apiRequest<number[]>(
      `Counting/${guildId}/channels/${channelId}/milestones`,
    ),
};
