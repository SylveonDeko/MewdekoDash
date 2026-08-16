// lib/api/embeds/models/EmbedPersona.ts

/**
 * A saved "send as" identity: a display name and avatar a message can be delivered under via webhook.
 * Personal when guildId is null, otherwise shared with the guild.
 * Maps to Mewdeko.Controllers.Common.Embeds.EmbedPersonaResponse
 */
export interface EmbedPersona {
  id: number;
  name: string;
  avatarUrl: string | null;
  hasUploadedAvatar: boolean;
  userId: bigint;
  guildId: bigint | null;
  isGuildShared: boolean;
  dateAdded: string | null;
}

/**
 * Request body for creating a persona.
 * Maps to Mewdeko.Controllers.Common.Embeds.CreateEmbedPersonaRequest
 */
export interface CreateEmbedPersonaRequest {
  userId: bigint;
  guildId?: bigint | null;
  name: string;
  avatarUrl?: string | null;
  /** An uploaded avatar as a data URI. Takes precedence over avatarUrl. */
  avatarData?: string | null;
  isGuildShared: boolean;
}

/**
 * Request body for updating a persona.
 * Maps to Mewdeko.Controllers.Common.Embeds.UpdateEmbedPersonaRequest
 */
export interface UpdateEmbedPersonaRequest {
  userId: bigint;
  name?: string | null;
  avatarUrl?: string | null;
  avatarData?: string | null;
  clearAvatar?: boolean;
}
