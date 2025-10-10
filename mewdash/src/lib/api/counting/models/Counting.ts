// lib/api/counting/models/Counting.ts

/**
 * Counting patterns
 */
export enum CountingPattern {
  Sequential = 0,
  SkipMultiples = 1,
  Fibonacci = 2,
  Primes = 3,
  PowersOfTwo = 4,
}

/**
 * Leaderboard types
 */
export enum LeaderboardType {
  Contributions = 0,
  Streak = 1,
  Accuracy = 2,
}

/**
 * Counting channel response
 * Maps to Mewdeko.Controllers.Common.Counting.CountingChannelResponse
 */
export interface CountingChannelResponse {
  id: number;
  guildId: bigint;
  channelId: bigint;
  channelName: string | null;
  currentNumber: number;
  startNumber: number;
  increment: number;
  lastUserId: bigint;
  lastUsername: string | null;
  isActive: boolean;
  createdAt: string | null;
  highestNumber: number;
  highestNumberReachedAt: string | null;
  totalCounts: number;
}

/**
 * Counting configuration response
 * Maps to Mewdeko.Controllers.Common.Counting.CountingConfigResponse
 */
export interface CountingConfigResponse {
  id: number;
  channelId: bigint;
  allowRepeatedUsers: boolean;
  cooldown: number;
  requiredRoles: string | null;
  bannedRoles: string | null;
  maxNumber: number;
  resetOnError: boolean;
  deleteWrongMessages: boolean;
  pattern: CountingPattern;
  numberBase: number;
  successEmote: string | null;
  errorEmote: string | null;
  enableAchievements: boolean;
  enableCompetitions: boolean;
}

/**
 * User counting statistics
 * Maps to Mewdeko.Controllers.Common.Counting.CountingUserStatsResponse
 */
export interface CountingUserStatsResponse {
  userId: bigint;
  username: string | null;
  avatarUrl: string | null;
  contributionsCount: number;
  highestStreak: number;
  currentStreak: number;
  lastContribution: string | null;
  totalNumbersCounted: number;
  errorsCount: number;
  accuracy: number;
  rank: number | null;
}

/**
 * Channel counting statistics
 * Maps to Mewdeko.Controllers.Common.Counting.CountingStatsResponse
 */
export interface CountingStatsResponse {
  channel: CountingChannelResponse;
  totalParticipants: number;
  totalErrors: number;
  milestonesReached: number;
  topContributor: CountingUserStatsResponse | null;
  lastActivity: string | null;
  averageAccuracy: number;
}

/**
 * Save point response
 * Maps to Mewdeko.Controllers.Common.Counting.SavePointResponse
 */
export interface SavePointResponse {
  id: number;
  savedNumber: number;
  savedAt: string | null;
  savedBy: bigint;
  savedByUsername: string | null;
  reason: string | null;
  isActive: boolean;
}

/**
 * Leaderboard response
 */
export interface LeaderboardResponse {
  users: CountingUserStatsResponse[];
  totalUsers: number;
  page: number;
  pageSize: number;
}

/**
 * Setup counting channel request
 * Maps to Mewdeko.Controllers.Common.Counting.SetupCountingChannelRequest
 */
export interface SetupCountingChannelRequest {
  startNumber?: number;
  increment?: number;
}

/**
 * Update counting config request
 * Maps to Mewdeko.Controllers.Common.Counting.UpdateCountingConfigRequest
 */
export interface UpdateCountingConfigRequest {
  allowRepeatedUsers?: boolean | null;
  cooldown?: number | null;
  requiredRoles?: string | null;
  bannedRoles?: string | null;
  maxNumber?: number | null;
  resetOnError?: boolean | null;
  deleteWrongMessages?: boolean | null;
  pattern?: CountingPattern | null;
  numberBase?: number | null;
  successEmote?: string | null;
  errorEmote?: string | null;
  enableAchievements?: boolean | null;
  enableCompetitions?: boolean | null;
}

/**
 * Reset counting channel request
 * Maps to Mewdeko.Controllers.Common.Counting.ResetCountingChannelRequest
 */
export interface ResetCountingChannelRequest {
  newNumber: number;
  userId: bigint;
  reason?: string | null;
}

/**
 * Create save point request
 * Maps to Mewdeko.Controllers.Common.Counting.CreateSavePointRequest
 */
export interface CreateSavePointRequest {
  userId: bigint;
  reason?: string | null;
}

/**
 * Restore save point request
 * Maps to Mewdeko.Controllers.Common.Counting.RestoreSavePointRequest
 */
export interface RestoreSavePointRequest {
  saveId: number;
  userId: bigint;
}

/**
 * Ban user request
 * Maps to Mewdeko.Controllers.Common.Counting.BanUserRequest
 */
export interface BanUserRequest {
  bannedBy: bigint;
  durationMinutes?: number | null;
  reason?: string | null;
}

/**
 * Unban user request
 * Maps to Mewdeko.Controllers.Common.Counting.UnbanUserRequest
 */
export interface UnbanUserRequest {
  unbannedBy: bigint;
  reason?: string | null;
}

/**
 * Set custom message request
 * Maps to Mewdeko.Controllers.Common.Counting.SetCustomMessageRequest
 */
export interface SetCustomMessageRequest {
  message: string;
}

/**
 * Set milestones request
 * Maps to Mewdeko.Controllers.Common.Counting.SetMilestonesRequest
 */
export interface SetMilestonesRequest {
  milestones: number[];
}

/**
 * Purge channel request
 * Maps to Mewdeko.Controllers.Common.Counting.PurgeChannelRequest
 */
export interface PurgeChannelRequest {
  userId: bigint;
  reason?: string | null;
}
