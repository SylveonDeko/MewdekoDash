import { get } from "svelte/store";
import { currentGuild } from "$lib/stores/currentGuild";
import { achievementsApi, cardPresetsApi, type AchievementCard, type AchievementCatalog } from "$lib/api/index.ts";
import type { CardDesignerConfig } from "$lib/components/cards/cardConfig";
import { BUILT_IN_TYPES, CARD_TOKENS, CUSTOM_TYPES } from "$lib/components/cards/cardHelpers";
import { iconImageSrc } from "../achievementHelpers";

/**
 * Describes achievement cards to the shared card designer.
 * @param card The server's card designs and what the designer needs
 * @param catalog The server's achievements, which the preview draws samples from
 * @param options A community to draw in when none is selected, and whether images are limited to presets
 */
export function achievementCardConfig(
  card: AchievementCard,
  catalog: AchievementCatalog,
  options: { guildId?: bigint | string; presetsOnly?: boolean } = {}
): CardDesignerConfig {
  const guildId = () => (options.guildId !== undefined ? BigInt(options.guildId) : get(currentGuild)!.id);
  const preferred = catalog.achievements.find((a) => a.metric > 0 && a.threshold > 0 && !a.hidden) ?? catalog.achievements[0];
  const ordered = preferred ? [preferred, ...catalog.achievements.filter((a) => a !== preferred)] : [];

  return {
    limits: card.limits,
    palette: card.palette,
    placeholders: card.placeholders,
    images: options.presetsOnly ? [] : card.images,
    builtIn: card.builtIn,
    builtInTypes: [...BUILT_IN_TYPES],
    customTypes: CUSTOM_TYPES,
    newTextDefault: "%achievement.name%",
    tokens: [...CARD_TOKENS],
    states: true,
    textShadows: false,
    samples: ordered.map((a) => ({ id: a.key, name: a.name })),
    defaultLabel: card.defaultLabel,
    defaultLockedLabel: card.defaultLockedLabel,
    gradeColor: (locked, sample) => {
      if (locked) return card.palette.muted;
      const grade = catalog.achievements.find((a) => a.key === sample)?.grade ?? preferred?.grade;
      return catalog.grades.find((g) => g.value === grade)?.color ?? card.palette.primary;
    },
    starters: [],
    preview: (template, request) =>
      achievementsApi.previewCard(guildId(), template, request.locked, request.sample, null, request.editingId),
    uploadImage: (data) => achievementsApi.uploadCardImage(guildId(), data),
    deleteImage: async (image) => {
      await achievementsApi.deleteIcon(guildId(), image.id);
    },
    imageSrc: iconImageSrc,
    loadPresets: () => cardPresetsApi.get(),
    presetsOnly: options.presetsOnly,
  };
}
