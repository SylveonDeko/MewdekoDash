// lib/api/client/models/GuildEmojiInfo.ts

/**
 * Information about guild emojis for the emoji picker
 * Maps to Mewdeko.Controllers.Common.ClientOperations.GuildEmojiInfo
 */
export interface GuildEmojiInfo {
  /** The guild these emojis belong to */
  guild: ClientGuildInfo;

  /** List of emojis in this guild */
  emojis: EmojiInfo[];
}

/**
 * Basic guild information
 * Maps to Mewdeko.Controllers.Common.ClientOperations.ClientGuildInfo
 */
export interface ClientGuildInfo {
  /** The guild ID */
  id: string;

  /** The guild name */
  name: string;

  /** The guild icon URL */
  iconUrl?: string;
}

/**
 * Information about a guild emoji
 * Maps to Mewdeko.Controllers.Common.ClientOperations.EmojiInfo
 */
export interface EmojiInfo {
  /** The emoji ID */
  id: string;

  /** The emoji name */
  name: string;

  /** Whether the emoji is animated */
  animated: boolean;

  /** Whether the emoji is available (not disabled) */
  isAvailable?: boolean;

  /** Role IDs that are allowed to use this emoji */
  roleIds: string[];

  /** Whether the emoji requires colons */
  requireColons: boolean;

  /** The CDN URL for the emoji */
  url: string;
}
