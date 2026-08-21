// lib/api/banprune/banprune.ts
import { apiRequest } from "../core";
import type {
  BanPruneActionInfo,
  BanPruneEffective,
  BanPruneSetting,
  BanPruneSettingRequest,
} from "./models";
import { BanPruneScope } from "./models";

/**
 * Ban purge API
 * Maps to Mewdeko.Controllers.BanPruneController
 */
export const banPruneApi = {
  /**
   * Gets the actions that can carry a purge setting, with their built in defaults
   * @param guildId The guild ID
   * @returns Every configurable action
   */
  getActions: (guildId: bigint) =>
    apiRequest<BanPruneActionInfo[]>(`BanPrune/${guildId}/actions`),

  /**
   * Gets every purge setting configured in a guild
   * @param guildId The guild ID
   * @returns The stored settings
   */
  getSettings: (guildId: bigint) =>
    apiRequest<BanPruneSetting[]>(`BanPrune/${guildId}`),

  /**
   * Gets the purge a ban would use right now for one action
   * @param guildId The guild ID
   * @param actionKey The action to resolve
   * @param channelId The channel the ban would come from, if any
   * @returns The resolved purge in days
   */
  getEffective: (guildId: bigint, actionKey: string, channelId?: bigint) =>
    apiRequest<BanPruneEffective>(
      `BanPrune/${guildId}/effective/${actionKey}${channelId ? `?channelId=${channelId}` : ""}`,
    ),

  /**
   * Creates or updates one purge setting
   * @param guildId The guild ID
   * @param request The setting to store
   */
  setSetting: (guildId: bigint, request: BanPruneSettingRequest) =>
    apiRequest<void>(`BanPrune/${guildId}`, "POST", request),

  /**
   * Removes one purge setting
   * @param guildId The guild ID
   * @param scopeType The scope the setting is on
   * @param scopeId The category or channel ID, or 0n for the guild default
   * @param actionKey The action to clear, or null for the setting covering every action
   */
  clearSetting: (
    guildId: bigint,
    scopeType: BanPruneScope,
    scopeId: bigint,
    actionKey: string | null,
  ) =>
    apiRequest<void>(
      `BanPrune/${guildId}?scopeType=${scopeType}&scopeId=${scopeId}` +
        (actionKey ? `&actionKey=${actionKey}` : ""),
      "DELETE",
    ),

  /**
   * Removes every purge setting in a guild
   * @param guildId The guild ID
   * @returns The number of settings removed
   */
  reset: (guildId: bigint) =>
    apiRequest<{ removed: number }>(`BanPrune/${guildId}/all`, "DELETE"),
};
