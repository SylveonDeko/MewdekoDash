// lib/api/embeds/embeds.ts
import { apiRequest } from "../core";
import type { CreateSavedEmbedRequest, SavedEmbed, UpdateSavedEmbedRequest } from "./models";

/**
 * Saved embed templates API
 * Maps to Mewdeko.Controllers.EmbedsController
 */
export const embedsApi = {
  /**
   * Gets all personal embed templates saved by a user
   * @param userId The Discord user ID
   * @returns The user's personal embed templates
   */
  getUserEmbeds: (userId: bigint) =>
    apiRequest<SavedEmbed[]>(`Embeds/user/${userId}`),

  /**
   * Gets all guild-shared embed templates for a guild
   * @param guildId The guild ID
   * @returns The guild's shared embed templates
   */
  getGuildEmbeds: (guildId: bigint) =>
    apiRequest<SavedEmbed[]>(`Embeds/guild/${guildId}`),

  /**
   * Gets a single embed template by its ID
   * @param id The embed template's database ID
   * @returns The embed template
   */
  getEmbed: (id: number) => apiRequest<SavedEmbed>(`Embeds/${id}`),

  /**
   * Creates a new personal or guild-shared embed template
   * @param request The embed template to create
   * @returns The created embed template
   */
  createEmbed: (request: CreateSavedEmbedRequest) =>
    apiRequest<SavedEmbed>("Embeds", "POST", request),

  /**
   * Updates an existing embed template's name and/or JSON
   * @param id The embed template's database ID
   * @param request The fields to update
   * @returns The updated embed template
   */
  updateEmbed: (id: number, request: UpdateSavedEmbedRequest) =>
    apiRequest<SavedEmbed>(`Embeds/${id}`, "PUT", request),

  /**
   * Deletes an embed template
   * @param id The embed template's database ID
   * @param userId The ID of the user requesting the deletion, used for ownership verification
   */
  deleteEmbed: (id: number, userId: bigint) =>
    apiRequest<void>(`Embeds/${id}?userId=${userId}`, "DELETE"),
};
