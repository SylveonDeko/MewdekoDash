// lib/api/patreon/patreon.ts
import { apiRequest } from "../core";
import type {
  PatreonOAuthResponse,
  PatreonOAuthCallbackResponse,
  PatreonOAuthStatusResponse,
  PatreonConfig,
  PatreonConfigUpdateRequest,
  PatreonTier,
  PatreonSupporter,
  PatreonCreator,
  PatreonAnalytics,
  PatreonOperationRequest,
  PatreonTierMappingRequest,
} from "./models";

/**
 * Patreon integration API
 * Maps to Mewdeko.Controllers.PatreonController
 */
export const patreonApi = {
  /**
   * Generates OAuth authorization URL for Patreon integration
   * @param guildId The guild ID
   * @returns OAuth URL and state
   */
  getPatreonOAuthUrl: (guildId: bigint) =>
    apiRequest<PatreonOAuthResponse>(`patreon/oauth/url?guildId=${guildId}`),

  /**
   * Handles OAuth callback from Patreon
   * @param code Authorization code from Patreon
   * @param state State parameter containing guild ID
   * @param error Optional error from OAuth
   * @returns Callback result
   */
  handlePatreonOAuthCallback: (code: string, state: string, error?: string) => {
    const errorQs = error ? `&error=${encodeURIComponent(error)}` : "";
    return apiRequest<PatreonOAuthCallbackResponse>(
      `patreon/oauth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}${errorQs}`,
    );
  },

  /**
   * Gets Patreon OAuth connection status
   * @param guildId The guild ID
   * @returns Connection status
   */
  getPatreonOAuthStatus: (guildId: bigint) =>
    apiRequest<PatreonOAuthStatusResponse>(
      `patreon/oauth/status?guildId=${guildId}`,
    ),

  /**
   * Gets Patreon analytics
   * @param guildId The guild ID
   * @returns Patreon analytics data
   */
  getPatreonAnalytics: (guildId: bigint) =>
    apiRequest<PatreonAnalytics>(`patreon/analytics?guildId=${guildId}`),

  /**
   * Gets all Patreon supporters
   * @param guildId The guild ID
   * @returns List of supporters
   */
  getPatreonSupporters: (guildId: bigint) =>
    apiRequest<PatreonSupporter[]>(`patreon/supporters?guildId=${guildId}`),

  /**
   * Gets Patreon configuration
   * @param guildId The guild ID
   * @returns Patreon configuration
   */
  getPatreonConfig: (guildId: bigint) =>
    apiRequest<PatreonConfig>(`patreon/config?guildId=${guildId}`),

  /**
   * Updates Patreon configuration
   * @param guildId The guild ID
   * @param config Configuration updates
   * @returns Updated configuration
   */
  updatePatreonConfig: (guildId: bigint, config: PatreonConfigUpdateRequest) =>
    apiRequest<PatreonConfig>(
      `patreon/config?guildId=${guildId}`,
      "POST",
      config,
    ),

  /**
   * Gets Patreon tiers
   * @param guildId The guild ID
   * @returns List of tiers
   */
  getPatreonTiers: (guildId: bigint) =>
    apiRequest<PatreonTier[]>(`patreon/tiers?guildId=${guildId}`),

  /**
   * Gets Patreon creator information
   * @param guildId The guild ID
   * @returns Creator info
   */
  getPatreonCreator: (guildId: bigint) =>
    apiRequest<PatreonCreator>(`patreon/creator?guildId=${guildId}`),

  /**
   * Triggers a Patreon operation (sync, syncRoles, announceGoals)
   * @param guildId The guild ID
   * @param operation Operation to trigger
   * @returns Operation result
   */
  triggerPatreonOperation: (
    guildId: bigint,
    operation: PatreonOperationRequest,
  ) =>
    apiRequest<{ message: string }>(
      `patreon/operations?guildId=${guildId}`,
      "POST",
      operation,
    ),

  /**
   * Maps a Patreon tier to a Discord role
   * @param guildId The guild ID
   * @param mapping Tier to role mapping
   * @returns Mapping result
   */
  mapPatreonTierToRole: (guildId: bigint, mapping: PatreonTierMappingRequest) =>
    apiRequest<{ message: string }>(
      `patreon/tiers/map?guildId=${guildId}`,
      "POST",
      mapping,
    ),

  /**
   * Disconnects Patreon integration
   * @param guildId The guild ID
   * @returns Disconnection result
   */
  disconnectPatreon: (guildId: bigint) =>
    apiRequest<{ message: string }>(
      `patreon/oauth/disconnect?guildId=${guildId}`,
      "DELETE",
    ),
};
