// lib/api/highlights/highlights.ts
import { apiRequest } from "../core";
import type { Highlight, HighlightSettings } from "./models";

export const highlightsApi = {
  getAllHighlights: (guildId: bigint) =>
    apiRequest<Highlight[]>(`Highlights/${guildId}`),

  getUserHighlights: (guildId: bigint, userId: bigint) =>
    apiRequest<Highlight[]>(`Highlights/${guildId}/user/${userId}`),

  getUserHighlightSettings: (guildId: bigint, userId: bigint) =>
    apiRequest<HighlightSettings>(
      `Highlights/${guildId}/user/${userId}/settings`,
    ),

  getHighlightStats: (guildId: bigint) =>
    apiRequest<any>(`Highlights/${guildId}/stats`),

  removeHighlight: (guildId: bigint, highlightId: number) =>
    apiRequest<void>(`Highlights/${guildId}/${highlightId}`, "DELETE"),

  removeUserHighlights: (guildId: bigint, userId: bigint) =>
    apiRequest<{ removedCount: number }>(
      `Highlights/${guildId}/user/${userId}`,
      "DELETE",
    ),

  getDisabledUsers: (guildId: bigint) =>
    apiRequest<any[]>(`Highlights/${guildId}/disabled`),

  searchHighlights: (guildId: bigint, searchTerm: string) =>
    apiRequest<Highlight[]>(
      `Highlights/${guildId}/search?searchTerm=${encodeURIComponent(searchTerm)}`,
    ),
};
