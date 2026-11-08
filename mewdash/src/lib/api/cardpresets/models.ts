/**
 * A group of background presets
 * Maps to Mewdeko.Controllers.Common.CardPresets.CardPresetCategoryResponse
 */
export interface CardPresetCategory {
  id: string;
  name: string;
  order: number;
}

/**
 * One background preset a server can pick instead of uploading an image
 * Maps to Mewdeko.Controllers.Common.CardPresets.CardPresetResponse
 */
export interface CardPreset {
  id: string;
  category: string;
  name: string;
  /** What a design stores to use it: preset:id */
  reference: string;
  imageUrl: string;
  thumbUrl: string;
  width: number;
  height: number;
  credit: string | null;
}

/**
 * The shared background presets
 * Maps to Mewdeko.Controllers.Common.CardPresets.CardPresetCatalogResponse
 */
export interface CardPresetCatalog {
  categories: CardPresetCategory[];
  presets: CardPreset[];
}
