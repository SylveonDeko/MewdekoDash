// Types for Counting module API responses and requests

export enum CountingPattern {
  Normal = 0,
  Roman = 1,
  Binary = 2,
  Hexadecimal = 3,
  Words = 4,
  Ordinal = 5,
  Fibonacci = 6,
  Primes = 7,
  Custom = 8
}

export enum LeaderboardType {
  Contributions = "contributions",
  Streak = "streak", 
  Accuracy = "accuracy",
  TotalNumbers = "totalnumbers"
}

// Response types
export interface CountingChannelResponse {
  id: number;
  guildId: bigint;
  channelId: bigint;
  channelName?: string;
  currentNumber: number;
  startNumber: number;
  increment: number;
  lastUserId: bigint;
  lastUsername?: string;
  isActive: boolean;
  createdAt?: string;
  highestNumber: number;
  highestNumberReachedAt?: string;
  totalCounts: number;
}

export interface CountingConfigResponse {
  id: number;
  channelId: bigint;
  allowRepeatedUsers: boolean;
  cooldown: number;
  requiredRoles?: string;
  bannedRoles?: string;
  maxNumber: number;
  resetOnError: boolean;
  deleteWrongMessages: boolean;
  pattern: CountingPattern;
  numberBase: number;
  successEmote?: string;
  errorEmote?: string;
  enableAchievements: boolean;
  enableCompetitions: boolean;
}

export interface CountingUserStatsResponse {
  userId: bigint;
  username?: string;
  avatarUrl?: string;
  contributionsCount: number;
  highestStreak: number;
  currentStreak: number;
  lastContribution?: string;
  totalNumbersCounted: number;
  errorsCount: number;
  accuracy: number;
  rank?: number;
}

export interface CountingStatsResponse {
  channel: CountingChannelResponse;
  totalParticipants: number;
  totalErrors: number;
  milestonesReached: number;
  topContributor?: CountingUserStatsResponse;
  lastActivity?: string;
  averageAccuracy: number;
}

export interface SavePointResponse {
  id: number;
  savedNumber: number;
  savedAt?: string;
  savedBy: bigint;
  savedByUsername?: string;
  reason?: string;
  isActive: boolean;
}

export interface LeaderboardResponse {
  type: string;
  entries: CountingUserStatsResponse[];
}

// Request types
export interface SetupCountingChannelRequest {
  startNumber: number;
  increment: number;
}

export interface UpdateCountingConfigRequest {
  allowRepeatedUsers?: boolean;
  cooldown?: number;
  requiredRoles?: string;
  bannedRoles?: string;
  maxNumber?: number;
  resetOnError?: boolean;
  deleteWrongMessages?: boolean;
  pattern?: CountingPattern;
  numberBase?: number;
  successEmote?: string;
  errorEmote?: string;
  enableAchievements?: boolean;
  enableCompetitions?: boolean;
}

export interface ResetCountingChannelRequest {
  newNumber: number;
  userId: bigint;
  reason?: string;
}

export interface CreateSavePointRequest {
  userId: bigint;
  reason?: string;
}

export interface RestoreSavePointRequest {
  saveId: number;
  userId: bigint;
}

export interface BanUserRequest {
  bannedBy: bigint;
  durationMinutes?: number;
  reason?: string;
}

export interface UnbanUserRequest {
  unbannedBy: bigint;
  reason?: string;
}

export interface SetCustomMessageRequest {
  message: string;
}

export interface SetMilestonesRequest {
  milestones: number[];
}

export interface PurgeChannelRequest {
  userId: bigint;
  reason?: string;
}

// UI-specific types
export interface CountingChannelListItem extends CountingChannelResponse {
  statusColor: string;
  statusText: string;
}

export interface CountingFormData {
  hubChannelId?: string;
  startNumber: number;
  increment: number;
  allowRepeatedUsers: boolean;
  cooldown: number;
  requiredRoles: string;
  bannedRoles: string;
  maxNumber: number;
  resetOnError: boolean;
  deleteWrongMessages: boolean;
  pattern: CountingPattern;
  numberBase: number;
  successEmote: string;
  errorEmote: string;
  enableAchievements: boolean;
  enableCompetitions: boolean;
}