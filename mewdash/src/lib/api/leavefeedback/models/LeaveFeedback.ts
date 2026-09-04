// lib/api/leavefeedback/models/LeaveFeedback.ts

/**
 * One record of the "why was I removed" prompt sent to a server owner after the
 * bot left their server, plus whatever they answered.
 */
export interface LeaveFeedbackEntry {
  /** The record's unique id. */
  id: number;

  /** The guild the bot was removed from. */
  guildId: bigint;

  /** The guild's name at the time of removal. */
  guildName: string;

  /** How many members the guild had at the time of removal. */
  memberCount: number;

  /** The owner the prompt was sent to. */
  ownerId: bigint;

  /** When the bot joined the guild, if known (UTC ISO string). */
  joinedAt: string | null;

  /** The stored reason key, or null if nothing was selected. */
  reason: string | null;

  /** The human readable label for the reason. */
  reasonLabel: string | null;

  /** The free text the owner wrote, if any. */
  comment: string | null;

  /** Whether the owner dismissed the prompt without answering. */
  dismissed: boolean;

  /** When the owner answered or dismissed the prompt (UTC ISO string). */
  answeredAt: string | null;

  /** When the bot was removed and the prompt sent (UTC ISO string). */
  dateAdded: string | null;
}

/**
 * A page of leave feedback records plus the total count for pagination.
 */
export interface LeaveFeedbackPage {
  items: LeaveFeedbackEntry[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * One reason key with its label and how many records use it.
 */
export interface LeaveFeedbackReason {
  key: string;
  label: string;
  count: number;
}

/**
 * Aggregate counts across all collected feedback.
 */
export interface LeaveFeedbackStats {
  total: number;
  answered: number;
  dismissed: number;
  pending: number;
  withComment: number;
  reasons: LeaveFeedbackReason[];
}

/**
 * The bot wide leave feedback settings. There is one channel for the whole bot,
 * not one per server.
 */
export interface LeaveFeedbackSettings {
  /** Whether owners get a DM asking why the bot was removed. */
  enabled: boolean;

  /** The configured channel, or 0n when the join/leave channel is used instead. */
  channelId: bigint;

  /** The channel answers actually get posted to, after the fallback. */
  effectiveChannelId: bigint;

  /** Whether the effective channel comes from the join/leave channel fallback. */
  usingFallback: boolean;

  /** The effective channel's name, when the bot can see it. */
  channelName: string | null;

  /** The server the effective channel lives in, when the bot can see it. */
  guildId: bigint;

  /** The name of that server, when the bot can see it. */
  guildName: string | null;

  /** Whether the bot could resolve the channel and can post to it. */
  reachable: boolean;
}

/**
 * An update to the bot wide leave feedback settings.
 */
export interface LeaveFeedbackSettingsRequest {
  enabled: boolean;
  channelId: bigint;
}

/**
 * The status buckets a record can be filtered by.
 */
export type LeaveFeedbackStatus = "answered" | "dismissed" | "pending" | "commented";

/**
 * Optional filters for a leave feedback query.
 */
export interface LeaveFeedbackQuery {
  reason?: string;
  status?: LeaveFeedbackStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}
