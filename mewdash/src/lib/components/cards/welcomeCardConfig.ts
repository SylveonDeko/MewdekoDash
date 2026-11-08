import { cardPresetsApi, welcomeCardsApi, type WelcomeCard, type WelcomeCardStarter, type WelcomeCardTarget } from "$lib/api/index.ts";
import type { CardDesignerConfig } from "./cardConfig";
import { WELCOME_TYPES } from "./cardHelpers";

/**
 * Describes message cards to the shared card designer.
 * @param guildId The guild ID
 * @param target Which kind of message the card is for
 * @param ownerId The multi-greet or role greet ID, or 0
 * @param card The card and what the designer needs
 * @param starters The starter layouts
 * @param userId The member the preview is drawn for
 */
export function welcomeCardConfig(
  guildId: bigint,
  target: WelcomeCardTarget,
  ownerId: number,
  card: WelcomeCard,
  starters: WelcomeCardStarter[],
  userId: string | bigint | null,
): CardDesignerConfig {
  return {
    limits: card.limits,
    palette: card.palette,
    placeholders: card.placeholders,
    images: card.images,
    builtIn: card.builtIn,
    builtInTypes: [],
    customTypes: WELCOME_TYPES,
    newTextDefault: "%user.name%",
    tokens: ["primary", "secondary", "accent", "text", "muted"],
    states: false,
    textShadows: true,
    samples: [],
    defaultLabel: "",
    defaultLockedLabel: "",
    gradeColor: () => card.palette.primary,
    starters,
    preview: (template, request) => welcomeCardsApi.preview(guildId, target, ownerId, template, request.editingId, userId),
    uploadImage: (data) => welcomeCardsApi.uploadImage(guildId, target, data),
    deleteImage: async (image) => {
      await welcomeCardsApi.deleteImage(guildId, target, ownerId, image.id);
    },
    imageSrc: (url) => url || null,
    loadPresets: () => cardPresetsApi.get(),
  };
}
