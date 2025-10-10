// lib/api/me/me.ts
import { apiRequest } from "../core";
import type {
  AfkRequest,
  HighlightSettingsRequest,
  UserPreferencesRequest,
  UserProfileRequest,
  UserAfkStatus,
  UserReputationStats,
  UserPreferences,
  UserProfile,
} from "./models";

/**
 * User settings and data API
 * Maps to Mewdeko.Controllers.MeController
 * This is a user-centric API aggregating data from multiple features
 */
export const meApi = {
  /**
   * Gets all highlight words for the authenticated user in a guild
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns List of highlights
   */
  getHighlights: (guildId: bigint, userId: bigint) =>
    apiRequest<Array<{ id: number; word: string; dateAdded: string }>>(
      `me/${guildId}/${userId}/highlights`,
    ),

  /**
   * Adds a highlight word for the user
   * @param guildId The guild ID
   * @param userId The user ID
   * @param word The word to highlight
   */
  addHighlight: (guildId: bigint, userId: bigint, word: string) =>
    apiRequest<{ word: string; dateAdded: string }>(
      `me/${guildId}/${userId}/highlights`,
      "POST",
      word,
    ),

  /**
   * Removes a highlight word
   * @param guildId The guild ID
   * @param userId The user ID
   * @param highlightId The highlight ID
   */
  removeHighlight: (guildId: bigint, userId: bigint, highlightId: number) =>
    apiRequest<void>(
      `me/${guildId}/${userId}/highlights/${highlightId}`,
      "DELETE",
    ),

  /**
   * Gets highlight settings
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns Highlight settings
   */
  getHighlightSettings: (guildId: bigint, userId: bigint) =>
    apiRequest<any>(`me/${guildId}/${userId}/highlights/settings`),

  /**
   * Updates highlight settings
   * @param guildId The guild ID
   * @param userId The user ID
   * @param request Settings update
   */
  updateHighlightSettings: (
    guildId: bigint,
    userId: bigint,
    request: HighlightSettingsRequest,
  ) =>
    apiRequest<void>(
      `me/${guildId}/${userId}/highlights/settings`,
      "PUT",
      request,
    ),

  /**
   * Gets AFK status
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns AFK status
   */
  getAfkStatus: (guildId: bigint, userId: bigint) =>
    apiRequest<UserAfkStatus>(`me/${guildId}/${userId}/afk`),

  /**
   * Sets AFK status
   * @param guildId The guild ID
   * @param userId The user ID
   * @param request AFK configuration
   */
  setAfkStatus: (guildId: bigint, userId: bigint, request: AfkRequest) =>
    apiRequest<void>(`me/${guildId}/${userId}/afk`, "POST", request),

  /**
   * Removes AFK status
   * @param guildId The guild ID
   * @param userId The user ID
   */
  removeAfkStatus: (guildId: bigint, userId: bigint) =>
    apiRequest<void>(`me/${guildId}/${userId}/afk`, "DELETE"),

  /**
   * Gets reputation statistics
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns Reputation stats
   */
  getReputation: (guildId: bigint, userId: bigint) =>
    apiRequest<UserReputationStats>(`me/${guildId}/${userId}/reputation`),

  /**
   * Gets global user preferences
   * @param guildId The guild ID (for route consistency)
   * @param userId The user ID
   * @returns User preferences
   */
  getUserPreferences: (guildId: bigint, userId: bigint) =>
    apiRequest<UserPreferences>(`me/${guildId}/${userId}/preferences`),

  /**
   * Updates global user preferences
   * @param guildId The guild ID (for route consistency)
   * @param userId The user ID
   * @param request Preferences update
   */
  updateUserPreferences: (
    guildId: bigint,
    userId: bigint,
    request: UserPreferencesRequest,
  ) => apiRequest<void>(`me/${guildId}/${userId}/preferences`, "PUT", request),

  /**
   * Gets user profile information
   * @param guildId The guild ID (for route consistency)
   * @param userId The user ID
   * @returns User profile
   */
  getUserProfile: (guildId: bigint, userId: bigint) =>
    apiRequest<UserProfile>(`me/${guildId}/${userId}/profile`),

  /**
   * Updates user profile settings
   * @param guildId The guild ID (for route consistency)
   * @param userId The user ID
   * @param request Profile update
   */
  updateUserProfile: (
    guildId: bigint,
    userId: bigint,
    request: UserProfileRequest,
  ) => apiRequest<void>(`me/${guildId}/${userId}/profile`, "PUT", request),

  /**
   * Gets user's suggestions in a guild
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns User's suggestions
   */
  getMySuggestions: (guildId: bigint, userId: bigint) =>
    apiRequest<any[]>(`me/${guildId}/${userId}/suggestions`),

  /**
   * Gets user's currency balance and transaction history
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns Currency data
   */
  getMyCurrency: (guildId: bigint, userId: bigint) =>
    apiRequest<any>(`me/${guildId}/${userId}/currency`),
};
