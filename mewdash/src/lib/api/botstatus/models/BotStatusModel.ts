// lib/api/botstatus/models/BotStatusModel.ts

/**
 * Bot status information
 * Maps to Mewdeko.Controllers.Common.Bot.BotStatusModel
 */
export interface BotStatus {
  /** The version of the bot */
  botVersion: string;

  /** The current commit hash of the bot */
  commitHash: string;

  /** The latency to Discord in ms */
  botLatency: number;

  /** The name of the bot */
  botName: string;

  /** The bot's avatar URL */
  botAvatar: string;

  /** The bot's banner URL (if any) */
  botBanner: string;

  /** The number of commands */
  commandsCount: number;

  /** The number of modules */
  modulesCount: number;

  /** The version of Discord.Net the bot is using */
  dNetVersion: string;

  /** The bot's current status (idle, afk, etc) */
  botStatus: string;

  /** The number of users in every guild */
  userCount: number;

  /** The bot's user ID */
  botId: bigint;

  /** The API URL of this instance */
  instanceUrl: string;
}
