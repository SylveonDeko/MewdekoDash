// lib/api/guild/models/BotGuildProfile.ts

/**
 * Response model for the bot's guild-specific profile
 * Maps to Mewdeko.Controllers.Common.Guild.BotGuildProfileResponse
 */
export interface BotGuildProfile {
  /** The bot's guild-specific avatar hash */
  avatar: string | null;

  /** The bot's guild-specific avatar URL */
  avatarUrl: string | null;

  /** The bot's guild-specific banner hash */
  banner: string | null;

  /** The bot's guild-specific banner URL */
  bannerUrl: string | null;

  /** The bot's guild-specific bio */
  bio: string | null;

  /** The bot's nickname in the guild */
  nickname: string | null;
}

/**
 * Request model for setting the bot's guild profile
 * Maps to Mewdeko.Controllers.Common.Guild.SetGuildProfileRequest
 */
export interface SetGuildProfileRequest {
  /** URL to the avatar image or base64 data URI (optional) */
  avatarUrl?: string | null;

  /** URL to the banner image or base64 data URI (optional) */
  bannerUrl?: string | null;

  /** Bio text for the bot in this guild (optional) */
  bio?: string | null;
}
