// lib/api/guild/models/BotSettings.ts

/**
 * The general bot settings of a guild.
 * Maps to Mewdeko.Controllers.Common.Guild.BotSettings. On a request, a field left out is not changed.
 */
export interface BotSettings {
  prefix?: string | null;
  /** 0 for none. */
  commandLogChannel?: bigint;
  currencyEmoji?: string | null;
  /** 0 for none. */
  warnlogChannelId?: bigint;
  /** 0 for never. */
  warnExpireHours?: number;
  /** 0 clears an expired warning, 1 deletes it. */
  warnExpireAction?: number;
  /** Empty for the bot's default language. */
  locale?: string | null;
  snipeset?: boolean;
  previewLinks?: boolean;
  /** Empty for the default role name. */
  muteRoleName?: string | null;
  removeRolesOnMute?: boolean;
  verboseErrors?: boolean;
}
