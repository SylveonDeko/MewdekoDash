// lib/api/embeds/models/SavedEmbed.ts

/**
 * A saved embed template, either personal (guildId is null) or guild-shared.
 * Maps to Mewdeko.Controllers.Common.Embeds.EmbedResponse
 */
export interface SavedEmbed {
  id: number;
  embedName: string | null;
  jsonCode: string;
  userId: bigint;
  dateAdded: string | null;
  guildId: bigint | null;
  isGuildShared: boolean;
}

/**
 * Request body for creating a saved embed template.
 * Maps to Mewdeko.Controllers.Common.Embeds.CreateEmbedRequest
 */
export interface CreateSavedEmbedRequest {
  userId: bigint;
  guildId?: bigint | null;
  embedName: string;
  jsonCode: string;
  isGuildShared: boolean;
}

/**
 * Request body for updating a saved embed template.
 * Maps to Mewdeko.Controllers.Common.Embeds.UpdateEmbedRequest
 */
export interface UpdateSavedEmbedRequest {
  userId: bigint;
  embedName?: string;
  jsonCode?: string;
}
