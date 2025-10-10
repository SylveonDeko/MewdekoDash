// lib/api/me/models/UserSettings.ts

/**
 * AFK request
 * Maps to Mewdeko.Controllers.Common.UserSettings.AfkRequest
 */
export interface AfkRequest {
  message?: string | null;
  isTimed: boolean;
  until?: string | null;
}

/**
 * Highlight settings request
 * Maps to Mewdeko.Controllers.Common.UserSettings.HighlightSettingsRequest
 */
export interface HighlightSettingsRequest {
  highlightsEnabled: boolean;
}

/**
 * User preferences request
 * Maps to Mewdeko.Controllers.Common.UserSettings.UserPreferencesRequest
 */
export interface UserPreferencesRequest {
  levelUpPingsDisabled?: boolean | null;
  pronounsDisabled?: boolean | null;
  prefersGuidedSetup?: boolean | null;
  dashboardExperienceLevel?: number | null;
}

/**
 * User profile request
 * Maps to Mewdeko.Controllers.Common.UserSettings.UserProfileRequest
 */
export interface UserProfileRequest {
  bio?: string | null;
  zodiacSign?: string | null;
  profilePrivacy?: number | null;
  birthdayDisplayMode?: number | null;
  greetDmsOptOut?: boolean | null;
  statsOptOut?: boolean | null;
  birthday?: string | null;
  birthdayTimezone?: string | null;
  birthdayAnnouncementsEnabled?: boolean | null;
  profileColor?: number | null;
  profileImageUrl?: string | null;
  switchFriendCode?: string | null;
  pronouns?: string | null;
}

/**
 * User's AFK status
 */
export interface UserAfkStatus {
  isAfk: boolean;
  message: string;
  when: string | null;
  wasTimed: boolean;
}

/**
 * User's reputation stats
 */
export interface UserReputationStats {
  totalRep: number;
  rank: number;
  totalGiven: number;
  totalReceived: number;
  currentStreak: number;
  longestStreak: number;
  lastGivenAt: string | null;
  lastReceivedAt: string | null;
}

/**
 * User preferences
 */
export interface UserPreferences {
  levelUpPingsDisabled: boolean;
  pronounsDisabled: boolean;
  prefersGuidedSetup: boolean;
  dashboardExperienceLevel: number;
  hasCompletedAnyWizard: boolean;
}

/**
 * User profile
 */
export interface UserProfile {
  bio: string;
  zodiacSign: string;
  profilePrivacy: number;
  birthdayDisplayMode: number;
  greetDmsOptOut: boolean;
  statsOptOut: boolean;
  birthday: string | null;
  birthdayTimezone: string;
  birthdayAnnouncementsEnabled: boolean;
  profileColor: number | null;
  profileImageUrl: string;
  switchFriendCode: string;
  pronouns: string;
}
