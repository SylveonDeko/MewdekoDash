// lib/api/welcomecards/welcomecards.ts
import { apiRequest } from "../core";
import type { CardImage, CardPreview, CardTemplate } from "../cards/models";
import type { CardPlacement, WelcomeCard, WelcomeCardStarter, WelcomeCardTarget } from "./models";

/**
 * Message cards API. ownerId is the multi-greet or role greet ID, or 0 for the other messages.
 * Maps to Mewdeko.Controllers.WelcomeCardsController
 */
export const welcomeCardsApi = {
  /** Gets the card for a message: where it appears, its design, and what the designer needs */
  get: (guildId: bigint, target: WelcomeCardTarget, ownerId = 0) =>
    apiRequest<WelcomeCard>(`WelcomeCards/${guildId}/${target}?ownerId=${ownerId}`),

  /** Saves the card's placement, its design, or both. Anything left out is kept */
  save: (guildId: bigint, target: WelcomeCardTarget, ownerId: number,
    changes: { placement?: CardPlacement; template?: CardTemplate }) =>
    apiRequest<WelcomeCard>(`WelcomeCards/${guildId}/${target}?ownerId=${ownerId}`, "POST", changes),

  /** Lists the starter layouts */
  starters: (guildId: bigint, target: WelcomeCardTarget) =>
    apiRequest<WelcomeCardStarter[]>(`WelcomeCards/${guildId}/${target}/starters`),

  /** Replaces the card's design with a starter layout */
  useStarter: (guildId: bigint, target: WelcomeCardTarget, ownerId: number, starterId: string) =>
    apiRequest<WelcomeCard>(`WelcomeCards/${guildId}/${target}/starters/${starterId}?ownerId=${ownerId}`, "POST"),

  /**
   * Draws a design before saving, with where each element landed
   * @param template The design as edited, or null for the saved one
   * @param editingId An element being typed over, drawn without its text
   * @param userId The member to draw the card for
   */
  preview: (guildId: bigint, target: WelcomeCardTarget, ownerId: number, template: CardTemplate | null,
    editingId?: string | null, userId?: string | bigint | null) =>
    apiRequest<CardPreview>(`WelcomeCards/${guildId}/${target}/preview?ownerId=${ownerId}`, "POST",
      { template, editingId, userId: userId ? userId.toString() : null }),

  /** Stores an image, as base64 or a data URI, for the server's designs */
  uploadImage: (guildId: bigint, target: WelcomeCardTarget, data: string) =>
    apiRequest<CardImage>(`WelcomeCards/${guildId}/${target}/images`, "POST", { data }),

  /** Deletes a stored image and removes it from every design that uses it */
  deleteImage: (guildId: bigint, target: WelcomeCardTarget, ownerId: number, id: number) =>
    apiRequest<WelcomeCard>(`WelcomeCards/${guildId}/${target}/images/${id}?ownerId=${ownerId}`, "DELETE"),
};
