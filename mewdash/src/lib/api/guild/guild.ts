// lib/api/guild/guild.ts
import { apiRequest } from "../core";
import type {
  GuildConfig,
  GuildInfo,
  BotGuildProfile,
  SetGuildProfileRequest,
} from "./models";

/**
 * Guild operations API
 * Combines GuildController and GuildConfigController endpoints
 */
export const guildApi = {
  // ============================================
  // Guild Information (GuildController)
  // ============================================

  /**
   * Gets essential guild information for dashboard display
   * @param guildId The guild ID
   * @returns Guild information for dashboard theming and display
   */
  getGuildInfo: (guildId: bigint) =>
    apiRequest<GuildInfo>(`guild/${guildId}/info`),

  /**
   * Gets the bot's guild-specific profile (avatar, banner, bio)
   * @param guildId The guild ID
   * @returns Bot's guild profile information
   */
  getBotGuildProfile: (guildId: bigint) =>
    apiRequest<BotGuildProfile>(`guild/${guildId}/bot-profile`),

  /**
   * Sets the bot's guild-specific profile (avatar, banner, bio)
   * @param guildId The guild ID
   * @param request Profile update request
   * @returns Success status
   */
  setBotGuildProfile: (guildId: bigint, request: SetGuildProfileRequest) =>
    apiRequest<{ success: boolean; message: string }>(
      `guild/${guildId}/bot-profile`,
      "POST",
      request,
    ),

  // ============================================
  // Guild Configuration (GuildConfigController)
  // ============================================

  /**
   * Gets the complete guild configuration
   * @param guildId The guild ID
   * @returns Complete guild configuration
   */
  getGuildConfig: (guildId: bigint) =>
    apiRequest<GuildConfig>(`guildconfig/${guildId}`),

  /**
   * Updates the guild configuration
   * @param guildId The guild ID
   * @param config The guild configuration to update
   * @returns Success status
   */
  updateGuildConfig: (guildId: bigint, config: GuildConfig) =>
    apiRequest<void>(`GuildConfig/${guildId}`, "POST", config),
};
