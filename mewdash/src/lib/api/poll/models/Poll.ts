// lib/api/poll/models/Poll.ts

/**
 * Poll types
 */
export enum PollType {
  SingleChoice = 0,
  MultiChoice = 1,
  Ranking = 2,
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
 * Poll statistics
 */
export interface PollStatsResponse {
  totalVotes: number;
  uniqueVoters: number;
  options: Array<{
    optionId: number;
    voteCount: number;
    percentage: number;
  }>;
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
 */
export interface UpdatePollRequest {
  question?: string | null;
  expiresAt?: string | null;
  allowVoteChanges?: boolean | null;
  showResults?: boolean | null;
}

/**
 * Close poll request
 */
export interface ClosePollRequest {
  userId: bigint;
  reason?: string | null;
}

/**
 * Schedule poll request
 */
export interface SchedulePollRequest {
  scheduledFor: string;
  pollData: CreatePollRequest;
}

/**
 * Create template request
 */
export interface CreateTemplateRequest {
  name: string;
  description?: string | null;
  pollData: CreatePollRequest;
}
