// lib/api/featurerequests/models/FeatureRequest.ts

/** The category keys the bot accepts. */
export type FeatureRequestCategory = "feature" | "bug" | "other";

/** The status keys a bot owner can set. */
export type FeatureRequestStatus = "open" | "planned" | "done" | "declined";

/**
 * One feature request, bug report, or other suggestion submitted from the dashboard.
 */
export interface FeatureRequestEntry {
  /** The request's unique id. */
  id: number;

  /** The submitting user. */
  userId: bigint;

  /** The submitter's name at the time. */
  userName: string;

  /** The guild the submitter was managing, if any. */
  guildId: bigint | null;

  /** That guild's name at the time. */
  guildName: string | null;

  /** The category key. */
  category: FeatureRequestCategory;

  /** The short title. */
  title: string;

  /** The full description. */
  body: string;

  /** The status key. */
  status: FeatureRequestStatus;

  /** A note a bot owner left for the submitter. */
  ownerNote: string | null;

  /** How many users upvoted it. */
  votes: number;

  /** Whether the current user has upvoted it. */
  voted: boolean;

  /** Whether the current user submitted it. */
  mine: boolean;

  /** When the status or note last changed (UTC ISO string). */
  updatedAt: string | null;

  /** When it was submitted (UTC ISO string). */
  dateAdded: string | null;
}

/**
 * A page of requests plus the total count.
 */
export interface FeatureRequestPage {
  items: FeatureRequestEntry[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Filters and paging for the request list.
 */
export interface FeatureRequestQuery {
  status?: FeatureRequestStatus;
  category?: FeatureRequestCategory;
  search?: string;
  sort?: "votes" | "newest";
  page?: number;
  pageSize?: number;
}

/**
 * Counts by status and category, owner only.
 */
export interface FeatureRequestStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}

/**
 * The bot wide report channel settings, owner only.
 */
export interface FeatureRequestSettings {
  channelId: bigint;
  effectiveChannelId: bigint;
  usingFallback: boolean;
  channelName: string | null;
  guildId: bigint;
  guildName: string | null;
  reachable: boolean;
}

/**
 * The vote count after toggling.
 */
export interface FeatureRequestVoteResult {
  votes: number;
  voted: boolean;
}

/**
 * A new request.
 */
export interface FeatureRequestSubmit {
  guildId: bigint | null;
  category: FeatureRequestCategory;
  title: string;
  body: string;
}

/**
 * A status change from a bot owner.
 */
export interface FeatureRequestStatusChange {
  status: FeatureRequestStatus;
  note: string | null;
}
