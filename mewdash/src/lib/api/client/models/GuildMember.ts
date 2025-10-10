// lib/api/client/models/GuildMember.ts

/**
 * Information about a guild member
 */
export interface GuildMember {
  /** The user's ID */
  id: string;

  /** The user's username */
  username: string;

  /** The user's display name (nickname or username) */
  displayName: string;

  /** URL to the user's avatar */
  avatarUrl: string;

  /** Whether the user is a bot */
  isBot: boolean;
}

/**
 * Basic user information
 */
export interface UserInfo {
  /** The user's ID */
  userId: bigint;

  /** The user's username */
  username: string;

  /** URL to the user's avatar */
  avatarUrl: string;
}
