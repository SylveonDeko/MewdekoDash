// lib/api/client/models/MutualGuild.ts

/**
 * Information about a guild that the bot and user share
 */
export interface MutualGuild {
  /** The guild ID */
  id: bigint;

  /** The guild name */
  name: string;

  /** The guild icon ID */
  icon: string | null;

  /** Whether the user is the owner of the guild */
  owner: boolean;

  /** The user's permission value in the guild */
  permissions: number;

  /** Guild features */
  features: string[];

  /** URL to the guild's banner */
  banner: string | null;

  /** Whether the user has administrator access */
  hasAdminAccess: boolean;
}
