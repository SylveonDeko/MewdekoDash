// lib/api/poll/models/Poll.ts

/**
 * Poll types
 * Mirrors Mewdeko.Modules.Games.Common.PollType
 */
export enum PollType {
  YesNo = 0,
  SingleChoice = 1,
  MultiChoice = 2,
  Anonymous = 3,
  RoleRestricted = 4,
}

/**
 * Poll option request
 */
export interface PollOptionRequest {
  text: string;
  color?: string | null;
  emote?: string | null;
}

/**
 * Poll option response
 */
export interface PollOptionResponse {
  id: number;
  text: string;
  index: number;
  color: string | null;
  emote: string | null;
  voteCount: number;
  votePercentage: number;
}

/**
 * A single recorded vote
 */
export interface VoteHistoryResponse {
  userId: bigint;
  username: string | null;
  optionIndices: number[];
  votedAt: string;
  isAnonymous: boolean;
  userRoles: string[];
}

/**
 * Poll statistics
 * Maps to Mewdeko.Controllers.Common.Polls.PollStatsResponse
 */
export interface PollStatsResponse {
  totalVotes: number;
  uniqueVoters: number;
  optionVotes: Record<string, number>;
  voteHistory: VoteHistoryResponse[];
  votesByRole: Record<string, number>;
  averageVoteTime: string;
  participationRate: number;
  hourlyVoteCounts: Record<string, number>;
  peakVotingHour: number;
}

/**
 * Poll response
 * Maps to Mewdeko.Controllers.Common.Polls.PollResponse
 */
export interface PollResponse {
  id: number;
  guildId: bigint;
  channelId: bigint;
  channelName: string | null;
  messageId: bigint;
  creatorId: bigint;
  creatorName: string | null;
  question: string;
  type: PollType;
  options: PollOptionResponse[];
  createdAt: string;
  expiresAt: string | null;
  closedAt: string | null;
  isActive: boolean;
  stats: PollStatsResponse | null;
}

/**
 * Create poll request
 * Maps to Mewdeko.Controllers.Common.Polls.CreatePollRequest
 */
export interface CreatePollRequest {
  question: string;
  options: PollOptionRequest[];
  type: PollType;
  channelId: bigint;
  durationMinutes?: number | null;
  allowMultipleVotes: boolean;
  isAnonymous: boolean;
  allowedRoles?: bigint[] | null;
  color?: string | null;
  allowVoteChanges?: boolean;
  showResults?: boolean;
  showProgressBars?: boolean;
  userId: bigint;
}

/**
 * Update poll request
 * Maps to Mewdeko.Controllers.Common.Polls.UpdatePollRequest
 */
export interface UpdatePollRequest {
  question?: string | null;
  durationMinutes?: number | null;
  allowMultipleVotes?: boolean | null;
  isAnonymous?: boolean | null;
  allowedRoles?: bigint[] | null;
}

/**
 * Close poll request
 * Maps to Mewdeko.Controllers.Common.Polls.ClosePollRequest
 */
export interface ClosePollRequest {
  userId: bigint;
  reason?: string | null;
  notifyVoters?: boolean;
}

/**
 * Schedule poll request
 * Maps to Mewdeko.Controllers.Common.Polls.SchedulePollRequest
 */
export interface SchedulePollRequest extends Omit<CreatePollRequest, "durationMinutes"> {
  scheduledFor: string;
  durationMinutes?: number | null;
}

/**
 * Scheduled poll as returned by the bot
 */
export interface ScheduledPollResponse {
  id: number;
  question: string;
  type: PollType;
  channelId: bigint;
  creatorId: bigint;
  scheduledFor: string;
  durationMinutes: number | null;
  scheduledAt: string;
  isExecuted: boolean;
  executedAt: string | null;
  createdPollId: number | null;
  isCancelled: boolean;
  cancelledAt: string | null;
  timeUntilExecution: string;
}

/**
 * Create template request
 * Maps to Mewdeko.Controllers.Common.Polls.CreateTemplateRequest
 */
export interface CreateTemplateRequest {
  name: string;
  question: string;
  options: PollOptionRequest[];
  defaultType: PollType;
  allowMultipleVotes: boolean;
  isAnonymous: boolean;
  color?: string | null;
  allowVoteChanges?: boolean;
  showResults?: boolean;
  userId: bigint;
}

/**
 * Poll template as stored by the bot
 */
export interface PollTemplateResponse {
  id: number;
  guildId: bigint;
  name: string;
  question: string;
  /** JSON encoded list of options */
  options: string;
  /** JSON encoded settings */
  settings: string | null;
  creatorId: bigint;
  createdAt: string;
}

/**
 * Guild wide poll analytics
 */
export interface PollAnalyticsResponse {
  totalPolls: number;
  activePolls: number;
  closedPolls: number;
  totalVotes: number;
  averageVotesPerPoll: number;
  mostPopularPollType: PollType;
  pollTypeDistribution: Record<string, number>;
  pollsCreatedByDay: Record<string, number>;
  hourlyCreationDistribution: Record<string, number>;
  dailyEngagement: Record<string, number>;
  topCreators: Record<string, number>;
  timeframe: string;
  analysisDate: string;
}
