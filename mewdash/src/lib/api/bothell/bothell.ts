// lib/api/bothell/bothell.ts
import { apiRequest } from "../core";
import type { BotHellEntry, BotHellLeaveResult, BotHellList, BotHellSettings, BotHellSettingsRequest } from "./models";

/**
 * Bot Hell API: servers littered with bots, and bulk leaving them. Owner only: the bot checks
 * the dashboard JWT, so a non-owner gets a 403 from every call here.
 * Maps to Mewdeko.Controllers.BotHellController
 */
export const botHellApi = {
  /**
   * Gets every server on the selected instance evaluated against the thresholds, flagged ones first.
   * @param flaggedOnly Whether to return only flagged servers
   */
  getAll: (flaggedOnly = false) => apiRequest<BotHellList>(`BotHell${flaggedOnly ? "?flaggedOnly=true" : ""}`),

  /**
   * Re-evaluates one server after downloading its full member list.
   * @param guildId The server to check
   */
  check: (guildId: bigint) => apiRequest<BotHellEntry>(`BotHell/${guildId.toString()}/check`, "POST"),

  /**
   * Leaves the given servers.
   * @param guildIds The servers to leave
   */
  leave: (guildIds: bigint[]) => apiRequest<BotHellLeaveResult>("BotHell/leave", "POST", { guildIds }),

  /**
   * Gets the bot wide settings, with the effective report channel resolved.
   */
  getSettings: () => apiRequest<BotHellSettings>("BotHell/settings"),

  /**
   * Updates the bot wide settings.
   * @param settings The new thresholds, auto leave flag and report channel
   */
  setSettings: (settings: BotHellSettingsRequest) =>
    apiRequest<BotHellSettings>("BotHell/settings", "POST", settings),
};
