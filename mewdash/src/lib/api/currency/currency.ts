// lib/api/currency/currency.ts
import { apiRequest } from "../core";
import {
  type AdjustBalanceRequest,
  type EconomyAnalytics,
  type EconomyConfig,
  type InventoryItem,
  type LeaderboardPage,
  type ShopItem,
  type ShopItemRequest,
  type UpdateEconomyConfigRequest,
  type UserBalance,
} from "./models";

/**
 * Currency and economy API
 * Maps to Mewdeko.Controllers.CurrencyController
 */
export const currencyApi = {
  /**
   * Gets a page of the guild's currency leaderboard, ordered by net worth.
   * @param guildId The guild ID
   * @param page Zero-based page index
   * @param pageSize Entries per page, capped server-side at 100
   * @returns A page of leaderboard entries plus the guild's total supply
   */
  getLeaderboard: (guildId: bigint, page = 0, pageSize = 25) =>
    apiRequest<LeaderboardPage>(`Currency/${guildId}/leaderboard?page=${page}&pageSize=${pageSize}`),

  /**
   * Gets a single user's holdings and recent ledger entries.
   * @param guildId The guild ID
   * @param userId The user to inspect
   * @returns Wallet, bank, net worth and transaction history
   */
  getBalance: (guildId: bigint, userId: bigint) =>
    apiRequest<UserBalance>(`Currency/${guildId}/balance/${userId}`),

  /**
   * Adds or removes currency from a user's wallet.
   * @param guildId The guild ID
   * @param request The user, amount and reason
   * @returns The user's holdings after the adjustment
   */
  adjustBalance: (guildId: bigint, request: AdjustBalanceRequest) =>
    apiRequest<{ wallet: number; bank: number; netWorth: number }>(
      `Currency/${guildId}/balance`,
      "POST",
      request,
    ),

  /**
   * Gets the full economy analytics view: current supply and distribution, plus
   * where currency has been coming from and going over the window.
   * @param guildId The guild ID
   * @param days How many days the windowed figures cover, 1-365
   * @returns Snapshot, flow breakdown, per-game performance and supply history
   */
  getAnalytics: (guildId: bigint, days = 30) =>
    apiRequest<EconomyAnalytics>(`Currency/${guildId}/analytics?days=${days}`),

  /**
   * Gets the guild's economy settings, creating defaults on first access.
   * @param guildId The guild ID
   * @returns The guild's economy configuration
   */
  getConfig: (guildId: bigint) => apiRequest<EconomyConfig>(`Currency/${guildId}/config`),

  /**
   * Applies a partial update to the guild's economy settings.
   * @param guildId The guild ID
   * @param request The fields to change; omitted fields are left alone
   * @returns The configuration after the update
   */
  updateConfig: (guildId: bigint, request: UpdateEconomyConfigRequest) =>
    apiRequest<EconomyConfig>(`Currency/${guildId}/config`, "PATCH", request),

  /**
   * Restores the guild's economy settings to their defaults.
   * @param guildId The guild ID
   * @returns The freshly defaulted configuration
   */
  resetConfig: (guildId: bigint) =>
    apiRequest<EconomyConfig>(`Currency/${guildId}/config/reset`, "POST"),

  /**
   * Gets every shop item the guild has defined, including hidden ones.
   * @param guildId The guild ID
   * @returns Shop items with ownership and revenue totals
   */
  getShop: (guildId: bigint) => apiRequest<ShopItem[]>(`Currency/${guildId}/shop`),

  /**
   * Creates a shop item.
   * @param guildId The guild ID
   * @param request The item to create
   * @returns The created item
   */
  createShopItem: (guildId: bigint, request: ShopItemRequest) =>
    apiRequest<ShopItem>(`Currency/${guildId}/shop`, "POST", request),

  /**
   * Replaces an existing shop item's settings.
   * @param guildId The guild ID
   * @param name The current name of the item
   * @param request The new settings
   * @returns The updated item
   */
  updateShopItem: (guildId: bigint, name: string, request: ShopItemRequest) =>
    apiRequest<ShopItem>(`Currency/${guildId}/shop/${encodeURIComponent(name)}`, "PUT", request),

  /**
   * Deletes a shop item and every inventory entry referencing it.
   * @param guildId The guild ID
   * @param name The name of the item to delete
   */
  deleteShopItem: (guildId: bigint, name: string) =>
    apiRequest<void>(`Currency/${guildId}/shop/${encodeURIComponent(name)}`, "DELETE"),

  /**
   * Gets a user's shop inventory.
   * @param guildId The guild ID
   * @param userId The owning user
   * @returns The items the user owns and how many of each
   */
  getInventory: (guildId: bigint, userId: bigint) =>
    apiRequest<InventoryItem[]>(`Currency/${guildId}/inventory/${userId}`),
};
