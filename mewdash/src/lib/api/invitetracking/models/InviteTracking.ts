// lib/api/invitetracking/models/InviteTracking.ts

/** Time window for leaderboards and analytics. Mirrors Mewdeko.Modules.Utility.Common.StatsRange (numeric on the wire). */
export const StatsRange = {
  AllTime: 0,
  Daily: 1,
  Weekly: 2,
  Monthly: 3,
} as const;
export type StatsRangeValue = (typeof StatsRange)[keyof typeof StatsRange];

/** Display names for {@link StatsRange} values. */
export const statsRangeLabels: Record<StatsRangeValue, string> = {
  0: "All time",
  1: "Last 24 hours",
  2: "Last 7 days",
  3: "Last 30 days",
};

/** How a member arrived. Mirrors InviteJoinType. */
export type InviteJoinType = "Unknown" | "Invite" | "Vanity" | "Bot";

/** Why a join was flagged. Mirrors InviteFakeReason. */
export type InviteFakeReason = "None" | "NewAccount" | "Rejoin" | "Self" | "NoAvatar";

/** Exclusion kinds. Mirrors InviteExclusionKind (numeric on the wire). */
export const InviteExclusionKind = {
  BlacklistedUser: 0,
  BlacklistedRole: 1,
  HiddenUser: 2,
} as const;
export type InviteExclusionKindValue = (typeof InviteExclusionKind)[keyof typeof InviteExclusionKind];

/** Reset scope. Mirrors InviteResetScope (numeric on the wire). */
export const InviteResetScope = {
  Server: 0,
  LeftMembers: 1,
} as const;

/**
 * Invite tracking settings
 */
export interface InviteTrackingSettings {
  /** Whether invite tracking is enabled */
  isEnabled: boolean;
  /** Whether to remove invite credit when user leaves */
  removeInviteOnLeave: boolean;
  /** Minimum account age requirement as a .NET TimeSpan string */
  minAccountAge: string;
  /** Whether rejoining members earn a regular invite (false flags them as fake) */
  countRejoins: boolean;
  /** Whether members without an avatar are flagged as fake */
  fakeOnNoAvatar: boolean;
  /** Channel personal links point at, or null for the system channel */
  linkChannelId: bigint | null;
  /** Channel that receives join and leave attribution embeds, or null */
  logChannelId: bigint | null;
}

/**
 * A user's invite breakdown
 */
export interface InviteBreakdown {
  userId: bigint;
  total: number;
  regular: number;
  left: number;
  fake: number;
  bonus: number;
  rank: number | null;
}

/**
 * User info for invite tracking
 */
export interface InviteUser {
  id: bigint;
  username: string;
  discriminator: string;
  avatarUrl: string;
}

/**
 * Who invited a member and how they arrived
 */
export interface InviterInfo {
  inviter: InviteUser | null;
  inviteCode: string | null;
  joinType: InviteJoinType;
  isFake: boolean;
  fakeReason: InviteFakeReason;
  joinedAt: string | null;
  leftAt: string | null;
}

/**
 * One witnessed join
 */
export interface InvitedRecord {
  userId: bigint;
  username: string | null;
  avatarUrl: string | null;
  inviterId: bigint;
  inviteCode: string | null;
  joinType: InviteJoinType;
  isFake: boolean;
  fakeReason: InviteFakeReason;
  joinedAt: string | null;
  leftAt: string | null;
}

/**
 * A page of witnessed joins
 */
export interface InvitedPage {
  total: number;
  page: number;
  pageSize: number;
  items: InvitedRecord[];
}

/**
 * Leaderboard entry
 */
export interface InviteLeaderboardEntry {
  rank: number;
  userId: bigint;
  username: string;
  avatarUrl: string | null;
  total: number;
  regular: number;
  left: number;
  fake: number;
  bonus: number;
  /** Share of real invited members still present, 0 to 1, or null */
  retention: number | null;
  latestJoinAt: string | null;
}

/**
 * An invite code with its label
 */
export interface InviteCodeSummary {
  code: string;
  label: string | null;
  joins: number;
}

/**
 * A day of joins and leaves
 */
export interface GrowthPoint {
  day: string;
  joins: number;
  leaves: number;
}

/**
 * Growth analytics for a window
 */
export interface InviteAnalytics {
  range: number;
  joins: number;
  leaves: number;
  netGrowth: number;
  fakeJoins: number;
  stayed: number;
  retention: number | null;
  sources: { invite: number; vanity: number; bot: number; unknown: number };
  topCodes: InviteCodeSummary[];
  topInviters: Omit<InviteLeaderboardEntry, "rank" | "avatarUrl">[];
  series: GrowthPoint[];
}

/**
 * A Discord invite code in the guild
 */
export interface GuildInviteCode {
  code: string;
  url: string;
  channelId: bigint;
  inviterId: bigint | null;
  inviterName: string | null;
  uses: number;
  maxUses: number | null;
  maxAge: number | null;
  isTemporary: boolean;
  createdAt: string | null;
  label: string | null;
  labelRoleId: bigint | null;
  ownerUserId: bigint | null;
}

/**
 * A labelled invite code
 */
export interface InviteLabel {
  id: number;
  guildId: bigint;
  inviteCode: string;
  label: string;
  roleId: bigint | null;
  ownerUserId: bigint | null;
  dateAdded: string | null;
}

/**
 * A label create or update
 */
export interface InviteLabelRequest {
  code: string;
  label: string;
  roleId?: bigint | null;
  ownerUserId?: bigint | null;
}

/**
 * A manual adjustment
 */
export interface InviteAdjustRequest {
  regular?: number;
  bonus?: number;
  fake?: number;
}
