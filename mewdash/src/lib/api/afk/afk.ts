// lib/api/afk/afk.ts
import { apiRequest } from "../core";
import type { Afk, UserWithAfk } from "./models";

/**
 * AFK (Away From Keyboard) API
 * Maps to Mewdeko.Controllers.AfkController
 */
export const afkApi = {
  /**
   * Gets a specific user's AFK status in a guild
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns AFK status if found
   */
  getAfkStatus: (guildId: bigint, userId: bigint) =>
    apiRequest<Afk>(`afk/${guildId}/${userId}`),

  /**
   * Sets a user's AFK status in a guild
   * @param guildId The guild ID
   * @param userId The user ID
   * @param message The AFK message
   */
  setAfkStatus: (guildId: bigint, userId: bigint, message: string) =>
    apiRequest<void>(`afk/${guildId}/${userId}`, "POST", message),

  /**
   * Removes a user's AFK status
   * @param guildId The guild ID
   * @param userId The user ID
   */
  deleteAfkStatus: (guildId: bigint, userId: bigint) =>
    apiRequest<void>(`afk/${guildId}/${userId}`, "DELETE"),

  /**
   * Gets all AFK statuses for users in a guild
   * @param guildId The guild ID
   * @returns List of users with their AFK status
   */
  getAllAfkStatus: (guildId: bigint) =>
    apiRequest<UserWithAfk[]>(`afk/${guildId}`),

  /**
   * Gets the auto-deletion time for AFK messages
   * @param guildId The guild ID
   * @returns Deletion time in seconds
   */
  getAfkDel: (guildId: bigint) => apiRequest<number>(`afk/${guildId}/deletion`),

  /**
   * Sets the auto-deletion time for AFK messages
   * @param guildId The guild ID
   * @param time Deletion time in seconds
   */
  afkDelSet: (guildId: bigint, time: number) =>
    apiRequest<void>(`afk/${guildId}/deletion`, "POST", time),

  /**
   * Gets the maximum length for AFK messages
   * @param guildId The guild ID
   * @returns Maximum length
   */
  getAfkLength: (guildId: bigint) =>
    apiRequest<number>(`afk/${guildId}/length`),

  /**
   * Sets the maximum length for AFK messages
   * @param guildId The guild ID
   * @param length Maximum length
   */
  afkLengthSet: (guildId: bigint, length: number) =>
    apiRequest<void>(`afk/${guildId}/length`, "POST", length),

  /**
   * Gets the AFK type setting for a guild
   * @param guildId The guild ID
   * @returns AFK type
   */
  getAfkType: (guildId: bigint) => apiRequest<number>(`afk/${guildId}/type`),

  /**
   * Sets the AFK type setting for a guild
   * @param guildId The guild ID
   * @param type The AFK type
   */
  afkTypeSet: (guildId: bigint, type: number) =>
    apiRequest<void>(`afk/${guildId}/type`, "POST", type),

  /**
   * Gets the AFK timeout setting
   * @param guildId The guild ID
   * @returns Timeout in seconds
   */
  getAfkTimeout: (guildId: bigint) =>
    apiRequest<number>(`afk/${guildId}/timeout`),

  /**
   * Sets the AFK timeout setting
   * @param guildId The guild ID
   * @param timeout Timeout as string (e.g., "5m", "1h")
   */
  afkTimeoutSet: (guildId: bigint, timeout: string) =>
    apiRequest<void>(`afk/${guildId}/timeout`, "POST", timeout),

  /**
   * Gets the disabled AFK channels
   * @param guildId The guild ID
   * @returns Comma-separated string of channel IDs
   */
  getDisabledAfkChannels: (guildId: bigint) =>
    apiRequest<string | null>(`afk/${guildId}/disabled-channels`),

  /**
   * Sets the disabled AFK channels
   * @param guildId The guild ID
   * @param channels Comma-separated string of channel IDs
   */
  setDisabledAfkChannels: (guildId: bigint, channels: string) =>
    apiRequest<void>(`afk/${guildId}/disabled-channels`, "POST", channels),

  /**
   * Gets the custom AFK message format
   * @param guildId The guild ID
   * @returns Custom AFK message format
   */
  getCustomAfkMessage: (guildId: bigint) =>
    apiRequest<string>(`afk/${guildId}/custom-message`),

  /**
   * Sets the custom AFK message format
   * @param guildId The guild ID
   * @param message Custom AFK message format
   */
  setCustomAfkMessage: (guildId: bigint, message: string) =>
    apiRequest<void>(`afk/${guildId}/custom-message`, "POST", message),
};
