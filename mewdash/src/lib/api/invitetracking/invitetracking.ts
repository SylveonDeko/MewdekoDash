// lib/api/invitetracking/invitetracking.ts
import { apiRequest } from "../core";
import type {
  InviteTrackingSettings,
  InviteUser,
  InviteLeaderboardEntry,
} from "./models";

/**
 * Invite tracking API
 * Maps to Mewdeko.Controllers.InviteTrackingController
 */
export const inviteTrackingApi = {
  /**
   * Gets invite tracking settings for a guild
   * @param guildId The guild ID
   * @returns Invite tracking settings
   */
  getInviteSettings: (guildId: bigint) =>
    apiRequest<InviteTrackingSettings>(`InviteTracking/${guildId}/settings`),

  /**
   * Enables or disables invite tracking for a guild
   * @param guildId The guild ID
   * @param enabled Whether to enable tracking
   * @returns New enabled status
   */
  toggleInviteTracking: (guildId: bigint, enabled: boolean) =>
    apiRequest<boolean>(`InviteTracking/${guildId}/toggle`, "POST", enabled),

  /**
   * Sets whether invites should be removed when users leave
   * @param guildId The guild ID
   * @param removeOnLeave Whether to remove invites on leave
   * @returns New setting value
   */
  setRemoveOnLeave: (guildId: bigint, removeOnLeave: boolean) =>
    apiRequest<boolean>(
      `InviteTracking/${guildId}/remove-on-leave`,
      "POST",
      removeOnLeave,
    ),

  /**
   * Sets minimum account age for invite counting
   * @param guildId The guild ID
   * @param minAge Minimum age as string (e.g., "7d", "1h")
   * @returns Updated minimum age
   */
  setMinAccountAge: (guildId: bigint, minAge: string) =>
    apiRequest<string>(`InviteTracking/${guildId}/min-age`, "POST", minAge),

  /**
   * Gets invite count for a specific user
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns Invite count
   */
  getInviteCount: (guildId: bigint, userId: bigint) =>
    apiRequest<number>(`InviteTracking/${guildId}/count/${userId}`),

  /**
   * Gets who invited a specific user
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns Inviter information
   */
  getInviter: (guildId: bigint, userId: bigint) =>
    apiRequest<InviteUser>(`InviteTracking/${guildId}/inviter/${userId}`),

  /**
   * Gets all users invited by a specific user
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns Collection of invited users
   */
  getInvitedUsers: (guildId: bigint, userId: bigint) =>
    apiRequest<InviteUser[]>(`InviteTracking/${guildId}/invited/${userId}`),

  /**
   * Gets the invite leaderboard for a guild
   * @param guildId The guild ID
   * @param page Page number (default: 1)
   * @param pageSize Page size (default: 10)
   * @returns Leaderboard entries
   */
  getInviteLeaderboard: (
    guildId: bigint,
    page: number = 1,
    pageSize: number = 10,
  ) =>
    apiRequest<InviteLeaderboardEntry[]>(
      `InviteTracking/${guildId}/leaderboard?page=${page}&pageSize=${pageSize}`,
    ),
};
