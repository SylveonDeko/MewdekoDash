// lib/api/confessions/confessions.ts
import { apiRequest } from "../core";
import type { Confession, ConfessionStats } from "./models";

/**
 * Anonymous confessions API
 * Maps to Mewdeko.Controllers.ConfessionsController
 */
export const confessionsApi = {
  /**
   * Gets all confessions for a guild
   * @param guildId The guild ID
   * @returns Collection of confessions
   */
  getConfessions: (guildId: bigint) =>
    apiRequest<Confession[]>(`Confessions/${guildId}`),

  /**
   * Gets a specific confession by number
   * @param guildId The guild ID
   * @param confessionNumber The confession number
   * @returns The confession details
   */
  getConfession: (guildId: bigint, confessionNumber: bigint) =>
    apiRequest<Confession>(`Confessions/${guildId}/${confessionNumber}`),

  /**
   * Gets the confession channel for a guild
   * @param guildId The guild ID
   * @returns The confession channel ID
   */
  getConfessionChannel: (guildId: bigint) =>
    apiRequest<bigint>(`Confessions/${guildId}/channel`),

  /**
   * Sets the confession channel for a guild
   * @param guildId The guild ID
   * @param channelId The channel ID
   */
  setConfessionChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`Confessions/${guildId}/channel`, "POST", channelId),

  /**
   * Gets the confession log channel for a guild
   * @param guildId The guild ID
   * @returns The confession log channel ID
   */
  getConfessionLogChannel: (guildId: bigint) =>
    apiRequest<bigint>(`Confessions/${guildId}/logChannel`),

  /**
   * Sets the confession log channel for a guild
   * @param guildId The guild ID
   * @param channelId The channel ID
   */
  setConfessionLogChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`Confessions/${guildId}/logChannel`, "POST", channelId),

  /**
   * Gets the confession blacklist for a guild
   * @param guildId The guild ID
   * @returns List of blacklisted role IDs
   */
  getConfessionBlacklist: (guildId: bigint) =>
    apiRequest<bigint[]>(`Confessions/${guildId}/blacklist`),

  /**
   * Toggles a role in the confession blacklist
   * @param guildId The guild ID
   * @param roleId The role ID to toggle
   * @returns Updated blacklist status
   */
  toggleConfessionBlacklist: (guildId: bigint, roleId: bigint) =>
    apiRequest<{ roleId: bigint; isBlacklisted: boolean }>(
      `Confessions/${guildId}/blacklist/${roleId}`,
      "POST",
    ),

  /**
   * Gets confession statistics for a guild
   * @param guildId The guild ID
   * @returns Confession statistics
   */
  getConfessionStats: (guildId: bigint) =>
    apiRequest<ConfessionStats>(`Confessions/${guildId}/stats`),

  /**
   * Deletes a confession by number
   * @param guildId The guild ID
   * @param confessionNumber The confession number to delete
   */
  deleteConfession: (guildId: bigint, confessionNumber: bigint) =>
    apiRequest<void>(`Confessions/${guildId}/${confessionNumber}`, "DELETE"),
};
