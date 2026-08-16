// lib/api/embeds/embeds.ts
import { apiRequest } from "../core";
import type {
  CreateEmbedPersonaRequest,
  CreateSavedEmbedRequest,
  EmbedPersona,
  SavedEmbed,
  SendableChannel,
  SendEmbedRequest,
  SendEmbedResult,
  UpdateEmbedPersonaRequest,
  UpdateSavedEmbedRequest,
} from "./models";

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

  /**
   * Gets the guild channels the user can see, each annotated with what the user and the bot are
   * allowed to do there. The bot filters out channels the user has no view access to, so a user
   * granted dashboard access without matching Discord permissions never sees them.
   * @param guildId The guild ID
   * @param userId The Discord user ID whose permissions should be resolved
   * @returns The visible channels and their permission flags
   */
  getSendableChannels: (guildId: bigint, userId: bigint) =>
    apiRequest<SendableChannel[]>(`Embeds/channels/${guildId}?userId=${userId}`),

  /**
   * Sends a built message to a guild channel, as the bot or through a channel webhook.
   * @param guildId The guild ID
   * @param request The channel, payload, and delivery options
   * @returns Details of the sent message, including a jump link
   */
  sendEmbed: (guildId: bigint, request: SendEmbedRequest) =>
    apiRequest<SendEmbedResult>(`Embeds/send/${guildId}`, "POST", request),

  /**
   * Gets a user's personal "send as" personas.
   * @param userId The Discord user ID
   */
  getUserPersonas: (userId: bigint) =>
    apiRequest<EmbedPersona[]>(`Embeds/personas/user/${userId}`),

  /**
   * Gets the "send as" personas shared with a guild.
   * @param guildId The guild ID
   */
  getGuildPersonas: (guildId: bigint) =>
    apiRequest<EmbedPersona[]>(`Embeds/personas/guild/${guildId}`),

  /**
   * Creates a personal or guild-shared "send as" persona.
   * @param request The persona to create
   */
  createPersona: (request: CreateEmbedPersonaRequest) =>
    apiRequest<EmbedPersona>("Embeds/personas", "POST", request),

  /**
   * Updates a persona's name or avatar.
   * @param id The persona's database ID
   * @param request The fields to update
   */
  updatePersona: (id: number, request: UpdateEmbedPersonaRequest) =>
    apiRequest<EmbedPersona>(`Embeds/personas/${id}`, "PUT", request),

  /**
   * Deletes a persona.
   * @param id The persona's database ID
   * @param userId The ID of the user requesting the deletion, used for ownership verification
   */
  deletePersona: (id: number, userId: bigint) =>
    apiRequest<void>(`Embeds/personas/${id}?userId=${userId}`, "DELETE"),
};
