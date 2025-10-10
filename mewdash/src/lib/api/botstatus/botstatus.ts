// lib/api/botstatus/botstatus.ts
import { apiRequest } from "../core";
import type { BotStatus } from "./models";

/**
 * Bot status API
 * Maps to Mewdeko.Controllers.BotStatus
 */
export const botStatusApi = {
  /**
   * Gets bot status information including version, latency, and counts
   * @returns Bot status model
   */
  getBotStatus: () => apiRequest<BotStatus>("BotStatus"),

  /**
   * Gets a list of guild IDs the bot is in
   * @returns JSON string of guild IDs
   */
  getBotGuilds: () => apiRequest<string>("BotStatus/guilds"),
};
