// lib/api/custombots/custombots.ts
import { apiRequest } from "../core";
import type { CustomBotGuildInfo, CustomBot, CustomBotLogs, CustomBotOwnerList, CustomBotUserState } from "./models";

/**
 * Self-service custom bots API
 * Maps to Mewdeko.Controllers.CustomBotsController
 */
export const customBotsApi = {
  /**
   * Gets a user's slots and bots
   * @param userId The Discord user ID
   */
  getUser: (userId: string) => apiRequest<CustomBotUserState>(`CustomBots/user/${userId}`),

  /**
   * Creates a bot from a token in a free slot
   * @param userId The Discord user ID
   * @param token The bot token
   * @param slotId The slot to use
   */
  createBot: (userId: string, token: string, slotId: number | string) =>
    apiRequest<CustomBot>(`CustomBots/user/${userId}/bots`, "POST", { token, slotId }),

  /**
   * Links a Ko-fi purchase to the user
   * @param userId The Discord user ID
   * @param email The purchase email
   * @param transactionId The Ko-fi transaction id
   */
  claim: (userId: string, email: string, transactionId: string) =>
    apiRequest<unknown>(`CustomBots/user/${userId}/claim`, "POST", { email, transactionId }),

  /**
   * Starts, stops or restarts a bot
   * @param userId The Discord user ID
   * @param instanceId The bot's instance id
   * @param action The action to run
   */
  control: (userId: string, instanceId: string, action: "start" | "stop" | "restart") =>
    apiRequest<unknown>(`CustomBots/user/${userId}/bots/${instanceId}/${action}`, "POST"),

  /**
   * Replaces a bot's token
   * @param userId The Discord user ID
   * @param instanceId The bot's instance id
   * @param token The new token
   */
  replaceToken: (userId: string, instanceId: string, token: string) =>
    apiRequest<unknown>(`CustomBots/user/${userId}/bots/${instanceId}/token`, "PUT", { token }),

  /**
   * Removes a bot
   * @param userId The Discord user ID
   * @param instanceId The bot's instance id
   */
  removeBot: (userId: string, instanceId: string) =>
    apiRequest<unknown>(`CustomBots/user/${userId}/bots/${instanceId}`, "DELETE"),

  /**
   * Gets the tail of a bot's log
   * @param userId The Discord user ID
   * @param instanceId The bot's instance id
   * @param tail How many lines to fetch
   */
  getLogs: (userId: string, instanceId: string, tail = 200) =>
    apiRequest<CustomBotLogs>(`CustomBots/user/${userId}/bots/${instanceId}/logs?tail=${tail}`),

  /**
   * Hands a server to a bot
   * @param userId The Discord user ID
   * @param instanceId The bot's instance id
   * @param guildId The server ID
   */
  assignGuild: (userId: string, instanceId: string, guildId: string) =>
    apiRequest<unknown>(`CustomBots/user/${userId}/bots/${instanceId}/guilds/${guildId}`, "POST"),

  /**
   * Gives a server back to the main bot
   * @param userId The Discord user ID
   * @param instanceId The bot's instance id
   * @param guildId The server ID
   */
  releaseGuild: (userId: string, instanceId: string, guildId: string) =>
    apiRequest<unknown>(`CustomBots/user/${userId}/bots/${instanceId}/guilds/${guildId}`, "DELETE"),

  /**
   * Gets the custom bot running a server, if any
   * @param guildId The server ID
   */
  getGuild: (guildId: string) => apiRequest<CustomBotGuildInfo>(`CustomBots/guild/${guildId}`),

  /**
   * Grants a manual slot (owner only)
   * @param userId The Discord user ID
   * @param days Days until it expires, omitted for no expiry
   */
  grantSlot: (userId: string, days?: number) =>
    apiRequest<unknown>(`CustomBots/slots/${userId}`, "POST", days ? { days } : {}),

  /**
   * Lists every slot and bot (owner only)
   */
  listSlots: () => apiRequest<CustomBotOwnerList>("CustomBots/slots"),
};
