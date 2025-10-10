// lib/api/invitetracking/models/InviteTracking.ts

/**
 * Invite tracking settings
 */
export interface InviteTrackingSettings {
  /** Whether invite tracking is enabled */
  isEnabled: boolean;

  /** Whether to remove invite credit when user leaves */
  removeInviteOnLeave: boolean;

  /** Minimum account age requirement */
  minAccountAge: string;
}

/**
 * User info for invite tracking
 */
export interface InviteUser {
  /** User ID */
  id: string;

  /** Username */
  username: string;

  /** Discriminator */
  discriminator: string;

  /** Avatar URL */
  avatarUrl: string;
}

/**
 * Leaderboard entry
 */
export interface InviteLeaderboardEntry {
  /** User ID */
  userId: string;

  /** Username */
  username: string;

  /** Number of invites */
  inviteCount: number;
}
