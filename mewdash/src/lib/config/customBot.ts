export const CUSTOM_BOT_SHOP_URL = "https://ko-fi.com/mewdeko/shop";

export const DISCORD_DEVELOPER_PORTAL_URL = "https://discord.com/developers/applications";

/**
 * Resolves a custom bot's avatar to a URL. The API may send a full URL or a Discord avatar hash.
 * @param avatar The avatar value from the API
 * @param botId The bot's user ID, needed for a hash
 */
export function customBotAvatarUrl(avatar: string | null | undefined, botId?: string | null): string | null {
  if (!avatar) return null;
  if (/^https?:\/\//i.test(avatar)) return avatar;
  if (!botId) return null;
  return `https://cdn.discordapp.com/avatars/${botId}/${avatar}.${avatar.startsWith("a_") ? "gif" : "png"}`;
}

/**
 * Resolves a server icon to a URL.
 * @param guildId The server ID
 * @param icon The icon hash
 */
export function guildIconUrl(guildId: string, icon: string | null | undefined): string | null {
  if (!icon) return null;
  if (/^https?:\/\//i.test(icon)) return icon;
  return `https://cdn.discordapp.com/icons/${guildId}/${icon}.${icon.startsWith("a_") ? "gif" : "png"}`;
}
