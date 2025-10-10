// lib/api/chattriggers/chattriggers.ts
import { apiRequest } from "../core";
import type { ChatTrigger } from "./models";

/**
 * Chat triggers API
 * Maps to Mewdeko.Controllers.ChatTriggersController
 */
export const chatTriggersApi = {
  /**
   * Gets all chat triggers for a guild
   * @param guildId The guild ID
   * @returns Collection of chat triggers
   */
  getChatTriggers: (guildId: bigint) =>
    apiRequest<ChatTrigger[]>(`chattriggers/${guildId}`),

  /**
   * Updates a chat trigger
   * @param guildId The guild ID
   * @param trigger The updated trigger
   */
  updateChatTrigger: (guildId: bigint, trigger: ChatTrigger) =>
    apiRequest<void>(`chattriggers/${guildId}`, "PATCH", trigger),

  /**
   * Adds a new chat trigger
   * @param guildId The guild ID
   * @param trigger The trigger to add
   * @returns The added trigger with its ID
   */
  addChatTrigger: (guildId: bigint, trigger: Omit<ChatTrigger, "id">) =>
    apiRequest<ChatTrigger>(`chattriggers/${guildId}`, "POST", trigger),

  /**
   * Deletes a chat trigger
   * @param guildId The guild ID
   * @param triggerId The trigger ID to delete
   */
  deleteChatTrigger: (guildId: bigint, triggerId: number) =>
    apiRequest<void>(`chattriggers/${guildId}/${triggerId}`, "DELETE"),
};
