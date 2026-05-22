// lib/api/chat/chat.ts
import { apiRequest } from "../core";
import type {
  ChatLogMessage,
  ChatLogSummary,
  ChatLog,
  SaveChatLogRequest,
} from "./models";

/**
 * Chat message management API
 * Maps to Mewdeko.Controllers.ChatController
 */
export const chatApi = {
  /**
   * Gets chat messages from a channel within a specified time range
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @param after Date string to get messages after
   * @returns Collection of chat messages
   */
  getChatMessages: (guildId: bigint, channelId: bigint, after: string) =>
    apiRequest<ChatLogMessage[]>(
      `Chat/${guildId}/${channelId}/messages?after=${encodeURIComponent(after)}`,
    ),

  /**
   * Gets all saved chat logs for a guild
   * @param guildId The guild ID
   * @returns Collection of chat log summaries
   */
  getChatLogs: (guildId: bigint) =>
    apiRequest<ChatLogSummary[]>(`Chat/${guildId}/logs`),

  /**
   * Gets a specific chat log by ID
   * @param guildId The guild ID
   * @param logId The log ID
   * @returns Complete chat log with messages
   */
  getChatLog: (guildId: bigint, logId: string) =>
    apiRequest<ChatLog>(`Chat/${guildId}/logs/${logId}`),

  /**
   * Saves a chat log
   * @param guildId The guild ID
   * @param data Chat log save request
   * @returns The created log ID
   */
  saveChatLog: (guildId: bigint, data: SaveChatLogRequest) =>
    apiRequest<{ id: string }>(`Chat/${guildId}/logs`, "POST", data),

  /**
   * Updates a chat log's name
   * @param guildId The guild ID
   * @param logId The log ID
   * @param name The new name
   */
  updateChatLogName: (guildId: bigint, logId: string, name: string) =>
    apiRequest<void>(`Chat/${guildId}/logs/${logId}`, "PATCH", {
      name,
    }),

  /**
   * Deletes a chat log
   * @param guildId The guild ID
   * @param logId The log ID
   */
  deleteChatLog: (guildId: bigint, logId: string) =>
    apiRequest<void>(`Chat/${guildId}/logs/${logId}`, "DELETE"),
};
