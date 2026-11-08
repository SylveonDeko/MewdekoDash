// lib/api/cardpresets/cardpresets.ts
import { apiRequest } from "../core";
import type { CardPresetCatalog } from "./models";

/**
 * Card background presets API
 * Maps to Mewdeko.Controllers.CardPresetsController
 */
export const cardPresetsApi = {
  /** Gets the shared background presets: the categories and every preset with its image and thumbnail URLs */
  get: () => apiRequest<CardPresetCatalog>("CardPresets"),
};
