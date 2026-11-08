// lib/api/filter/filter.ts
import { apiRequest } from "../core";
import type {
  FilterExtras,
  FilterExtrasRequest,
  FilterSettings,
  ServerFilterSettingsRequest,
  WarningSettingsRequest,
} from "./models";

export const filterApi = {
  getFilterSettings: (guildId: bigint) =>
    apiRequest<FilterSettings>(`Filter/${guildId}/settings`),

  updateServerFilterSettings: (
    guildId: bigint,
    settings: ServerFilterSettingsRequest,
  ) =>
    apiRequest<{ success: boolean }>(
      `Filter/${guildId}/server-settings`,
      "PUT",
      settings,
    ),

  toggleFilteredWord: (guildId: bigint, word: string) =>
    apiRequest<{ added: boolean; word: string }>(
      `Filter/${guildId}/words/${encodeURIComponent(word)}`,
      "POST",
    ),

  getFilteredWords: (guildId: bigint) =>
    apiRequest<{ words: string[] }>(`Filter/${guildId}/words`),

  clearFilteredWords: (guildId: bigint) =>
    apiRequest<{ success: boolean; clearedCount: number }>(
      `Filter/${guildId}/words`,
      "DELETE",
    ),

  toggleAutoBanWord: (guildId: bigint, word: string) =>
    apiRequest<{ added: boolean; word: string }>(
      `Filter/${guildId}/autoban-words/${encodeURIComponent(word)}`,
      "POST",
    ),

  getAutoBanWords: (guildId: bigint) =>
    apiRequest<{ words: string[] }>(`Filter/${guildId}/autoban-words`),

  updateFilterWarnings: (guildId: bigint, settings: WarningSettingsRequest) =>
    apiRequest<{ success: boolean }>(
      `Filter/${guildId}/warnings`,
      "PUT",
      settings,
    ),

  getFilterExtras: (guildId: bigint) =>
    apiRequest<FilterExtras>(`Filter/${guildId}/extras`),

  updateFilterExtras: (guildId: bigint, request: FilterExtrasRequest) =>
    apiRequest<FilterExtras>(`Filter/${guildId}/extras`, "PUT", request),

  setLinkLimit: (
    guildId: bigint,
    channelId: bigint,
    maxLinks: number,
    windowSeconds: number,
  ) =>
    apiRequest<{ success: boolean }>(
      `Filter/${guildId}/channels/${channelId}/link-limit`,
      "PUT",
      { maxLinks, windowSeconds },
    ),

  toggleChannelFilter: (
    guildId: bigint,
    channelId: bigint,
    filterType: "word" | "invite" | "link",
  ) =>
    apiRequest<{ enabled: boolean; channelId: bigint }>(
      `Filter/${guildId}/channels/${channelId}/${filterType}-filter`,
      "POST",
    ),

};
