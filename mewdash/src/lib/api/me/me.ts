// lib/api/me/me.ts
import { apiRequest } from "../core";
import type {
  AfkRequest,
  HighlightSettingsRequest,
  UserAfkStatus,
  UserPreferences,
  UserPreferencesRequest,
  UserProfile,
  UserProfileRequest,
  UserReputationStats
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

  /**
   * Gets user's giveaway activity
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns Giveaway entries and wins
   */
  getMyGiveaways: (guildId: bigint, userId: bigint) =>
    apiRequest<any[]>(`me/${guildId}/${userId}/giveaways`),

  /**
   * Gets user's reminders
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns User's reminders
   */
  getMyReminders: (guildId: bigint, userId: bigint) =>
    apiRequest<any[]>(`me/${guildId}/${userId}/reminders`),

  /**
   * Gets global cross-server analytics
   * @param guildId The guild ID (for route consistency)
   * @param userId The user ID
   * @returns Global analytics
   */
  getMyGlobalAnalytics: (guildId: bigint, userId: bigint) =>
    apiRequest<any>(`me/${guildId}/${userId}/analytics`),

  /**
   * Gets user's invite statistics
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns Invite statistics
   */
  getMyInvites: (guildId: bigint, userId: bigint) =>
    apiRequest<any>(`me/${guildId}/${userId}/invites`),

  /**
   * Gets user's message statistics
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns Message statistics
   */
  getMyMessages: (guildId: bigint, userId: bigint) =>
    apiRequest<any>(`me/${guildId}/${userId}/messages`),

  /**
   * Gets user's starboard statistics
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns Starboard statistics
   */
  getMyStarboard: (guildId: bigint, userId: bigint) =>
    apiRequest<any>(`me/${guildId}/${userId}/starboard`),

  /**
   * Toggles greet DMs opt-out
   * @param guildId The guild ID (for route consistency)
   * @param userId The user ID
   * @returns New opt-out status
   */
  toggleGreetDms: (guildId: bigint, userId: bigint) =>
    apiRequest<{ greetDmsOptOut: boolean }>(
      `me/${guildId}/${userId}/profile/toggle-greet-dms`,
      "POST",
    ),

  /**
   * Toggles stats opt-out
   * @param guildId The guild ID (for route consistency)
   * @param userId The user ID
   * @returns New opt-out status
   */
  toggleStats: (guildId: bigint, userId: bigint) =>
    apiRequest<{ statsOptOut: boolean }>(
      `me/${guildId}/${userId}/profile/toggle-stats`,
      "POST",
    ),

  /**
   * Toggles birthday announcements
   * @param guildId The guild ID (for route consistency)
   * @param userId The user ID
   * @returns New announcement status
   */
  toggleBirthdayAnnouncements: (guildId: bigint, userId: bigint) =>
    apiRequest<{ birthdayAnnouncementsEnabled: boolean }>(
      `me/${guildId}/${userId}/profile/toggle-birthday-announcements`,
      "POST",
    ),

  /**
   * Toggles level-up pings preference
   * @param guildId The guild ID (for route consistency)
   * @param userId The user ID
   * @returns New preference status
   */
  toggleLevelUpPings: (guildId: bigint, userId: bigint) =>
    apiRequest<{ levelUpPingsDisabled: boolean }>(
      `me/${guildId}/${userId}/preferences/toggle-levelup-pings`,
      "POST",
    ),

  /**
   * Toggles pronoun fetching preference
   * @param guildId The guild ID (for route consistency)
   * @param userId The user ID
   * @returns New preference status
   */
  togglePronouns: (guildId: bigint, userId: bigint) =>
    apiRequest<{ pronounsDisabled: boolean }>(
      `me/${guildId}/${userId}/preferences/toggle-pronouns`,
      "POST",
    ),

  /**
   * Toggles guided setup preference
   * @param guildId The guild ID (for route consistency)
   * @param userId The user ID
   * @returns New preference status
   */
  toggleGuidedSetup: (guildId: bigint, userId: bigint) =>
    apiRequest<{ prefersGuidedSetup: boolean }>(
      `me/${guildId}/${userId}/preferences/toggle-guided-setup`,
      "POST",
    ),

  /**
   * Resets wizard completion state
   * @param guildId The guild ID (for route consistency)
   * @param userId The user ID
   * @returns Success response
   */
  resetWizard: (guildId: bigint, userId: bigint) =>
    apiRequest<any>(`me/${guildId}/${userId}/wizard/reset`, "POST"),

  /**
   * Resets wizard completion for a specific guild
   * @param guildId The guild ID (for route consistency)
   * @param userId The user ID
   * @param resetGuildId The guild ID to reset wizard for
   * @returns Success response
   */
  resetGuildWizard: (guildId: bigint, userId: bigint, resetGuildId: bigint) =>
    apiRequest<any>(
      `me/${guildId}/${userId}/wizard/reset/${resetGuildId}`,
      "POST",
    ),
};
