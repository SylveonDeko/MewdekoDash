// lib/api/birthday/birthday.ts
import { apiRequest } from "../core";
import type {
  BirthdayConfig,
  BirthdayConfigRequest,
  BirthdayUser,
  BirthdayStats,
  BirthdayFeatures,
  FeatureStatus,
} from "./models";

/**
 * Birthday management API
 * Maps to Mewdeko.Controllers.BirthdayController
 */
export const birthdayApi = {
  /**
   * Gets the birthday configuration for a guild
   * @param guildId The guild ID
   * @returns Birthday configuration
   */
  getBirthdayConfig: (guildId: bigint) =>
    apiRequest<BirthdayConfig>(`birthday/${guildId}/config`),

  /**
   * Updates the birthday configuration for a guild
   * @param guildId The guild ID
   * @param config Configuration update request
   */
  updateBirthdayConfig: (guildId: bigint, config: BirthdayConfigRequest) =>
    apiRequest<void>(`birthday/${guildId}/config`, "PUT", config),

  /**
   * Resets the birthday configuration to defaults
   * @param guildId The guild ID
   */
  resetBirthdayConfig: (guildId: bigint) =>
    apiRequest<void>(`birthday/${guildId}/config/reset`, "POST"),

  /**
   * Gets upcoming birthdays for a guild
   * @param guildId The guild ID
   * @param days Number of days to look ahead (default: 7, max: 30)
   * @returns List of upcoming birthdays
   */
  getBirthdayUpcoming: (guildId: bigint, days: number = 7) =>
    apiRequest<BirthdayUser[]>(`birthday/${guildId}/upcoming?days=${days}`),

  /**
   * Gets today's birthdays for a guild
   * @param guildId The guild ID
   * @returns List of today's birthdays
   */
  getBirthdayToday: (guildId: bigint) =>
    apiRequest<BirthdayUser[]>(`birthday/${guildId}/today`),

  /**
   * Gets all users with birthdays set in a guild
   * @param guildId The guild ID
   * @returns List of users with birthdays
   */
  getBirthdayUsers: (guildId: bigint) =>
    apiRequest<BirthdayUser[]>(`birthday/${guildId}/users`),

  /**
   * Gets a specific user's birthday information
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns User's birthday information
   */
  getUserBirthday: (guildId: bigint, userId: bigint) =>
    apiRequest<BirthdayUser>(`birthday/${guildId}/users/${userId}`),

  /**
   * Enables a specific birthday feature for a guild
   * @param guildId The guild ID
   * @param feature The feature to enable
   */
  enableBirthdayFeature: (guildId: bigint, feature: BirthdayFeatures) =>
    apiRequest<void>(`birthday/${guildId}/features/${feature}/enable`, "POST"),

  /**
   * Disables a specific birthday feature for a guild
   * @param guildId The guild ID
   * @param feature The feature to disable
   */
  disableBirthdayFeature: (guildId: bigint, feature: BirthdayFeatures) =>
    apiRequest<void>(`birthday/${guildId}/features/${feature}/disable`, "POST"),

  /**
   * Gets the status of all birthday features for a guild
   * @param guildId The guild ID
   * @returns Feature status information
   */
  getBirthdayFeatures: (guildId: bigint) =>
    apiRequest<FeatureStatus>(`birthday/${guildId}/features`),

  /**
   * Gets birthday statistics for a guild
   * @param guildId The guild ID
   * @returns Birthday statistics
   */
  getBirthdayStats: (guildId: bigint) =>
    apiRequest<BirthdayStats>(`birthday/${guildId}/stats`),
};
