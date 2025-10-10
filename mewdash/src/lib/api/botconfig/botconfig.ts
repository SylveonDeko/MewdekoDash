// lib/api/botconfig/botconfig.ts
import { apiRequest } from "../core";
import type { AutoCommand } from "./models";

/**
 * Bot configuration API
 * Maps to Mewdeko.Controllers.BotConfigController
 */
export const botConfigApi = {
  /**
   * Gets list of bot owner IDs
   * @returns Collection of owner IDs
   */
  getOwners: () => apiRequest<bigint[]>("BotConfig/owners"),

  /**
   * Gets the bot's auto-executing commands
   * @returns Collection of auto commands
   */
  getAutoCommands: () => apiRequest<AutoCommand[]>("BotConfig/autocommands"),

  /**
   * Gets the bot's startup commands
   * @returns Collection of startup commands
   */
  getStartupCommands: () =>
    apiRequest<AutoCommand[]>("BotConfig/startupcommands"),
};
