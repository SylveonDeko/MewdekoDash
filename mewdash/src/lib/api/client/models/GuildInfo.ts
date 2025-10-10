// lib/api/client/models/GuildInfo.ts

/**
 * Basic information about whether the bot has a guild
 */
export interface HasGuildResponse {
  /** Whether the bot is in the guild */
  hasGuild: boolean;

  /** The guild's name (if found) */
  guildName?: string;

  /** The guild's member count (if found) */
  memberCount?: number;

  /** URL to the guild's icon (if found) */
  iconUrl?: string;

  /** When the guild was created (if found) */
  createdAt?: string;

  /** The guild's description (if found) */
  description?: string;

  /** Guild features (if found) */
  features?: string[];
}
