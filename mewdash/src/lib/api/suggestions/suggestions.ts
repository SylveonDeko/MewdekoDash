// lib/api/suggestions/suggestions.ts
import { apiRequest } from "../core";
import type { Suggestion, SuggestStateUpdate } from "./models";

/**
 * Suggestions system API
 * Maps to Mewdeko.Controllers.SuggestionsController
 */
export const suggestionsApi = {
  /**
   * Gets suggestions for a guild, optionally filtered by user
   * @param guildId The guild ID
   * @param userId Optional user ID to filter by
   * @returns List of suggestions
   */
  getSuggestions: (guildId: bigint, userId?: bigint) =>
    apiRequest<Suggestion[]>(
      `suggestions/${guildId}${userId ? `/${userId}` : ""}`,
    ),

  deleteSuggestion: (guildId: bigint, id: bigint) =>
    apiRequest<void>(`suggestions/${guildId}/${id}`, "DELETE"),

  updateSuggestionStatus: (
    guildId: bigint,
    suggestionId: bigint,
    update: SuggestStateUpdate,
  ) =>
    apiRequest<void>(`suggestions/${guildId}/${suggestionId}`, "PATCH", update),

  getMinLength: (guildId: bigint) =>
    apiRequest<number>(`suggestions/${guildId}/minLength`),

  setMinLength: (guildId: bigint, minLength: number) =>
    apiRequest<void>(`suggestions/${guildId}/minLength`, "POST", minLength),

  getMaxLength: (guildId: bigint) =>
    apiRequest<number>(`suggestions/${guildId}/maxLength`),

  setMaxLength: (guildId: bigint, maxLength: number) =>
    apiRequest<void>(`suggestions/${guildId}/maxLength`, "POST", maxLength),

  getAcceptMessage: (guildId: bigint) =>
    apiRequest<string | null>(`suggestions/${guildId}/acceptMessage`),

  setAcceptMessage: (guildId: bigint, message: string | null) =>
    apiRequest<void>(`suggestions/${guildId}/acceptMessage`, "POST", message),

  getDenyMessage: (guildId: bigint) =>
    apiRequest<string | null>(`suggestions/${guildId}/denyMessage`),

  setDenyMessage: (guildId: bigint, message: string | null) =>
    apiRequest<void>(`suggestions/${guildId}/denyMessage`, "POST", message),

  getConsiderMessage: (guildId: bigint) =>
    apiRequest<string | null>(`suggestions/${guildId}/considerMessage`),

  setConsiderMessage: (guildId: bigint, message: string | null) =>
    apiRequest<void>(`suggestions/${guildId}/considerMessage`, "POST", message),

  getImplementMessage: (guildId: bigint) =>
    apiRequest<string | null>(`suggestions/${guildId}/implementMessage`),

  setImplementMessage: (guildId: bigint, message: string | null) =>
    apiRequest<void>(
      `suggestions/${guildId}/implementMessage`,
      "POST",
      message,
    ),

  getAcceptChannel: (guildId: bigint) =>
    apiRequest<bigint>(`suggestions/${guildId}/acceptChannel`),

  setAcceptChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`suggestions/${guildId}/acceptChannel`, "POST", channelId),

  getDenyChannel: (guildId: bigint) =>
    apiRequest<bigint>(`suggestions/${guildId}/denyChannel`),

  setDenyChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`suggestions/${guildId}/denyChannel`, "POST", channelId),

  getConsiderChannel: (guildId: bigint) =>
    apiRequest<bigint>(`suggestions/${guildId}/considerChannel`),

  setConsiderChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(
      `suggestions/${guildId}/considerChannel`,
      "POST",
      channelId,
    ),

  getImplementChannel: (guildId: bigint) =>
    apiRequest<bigint>(`suggestions/${guildId}/implementChannel`),

  setImplementChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(
      `suggestions/${guildId}/implementChannel`,
      "POST",
      channelId,
    ),

  getSuggestThreadsType: (guildId: bigint) =>
    apiRequest<number>(`suggestions/${guildId}/suggestThreadsType`),

  setSuggestThreadsType: (guildId: bigint, type: number) =>
    apiRequest<void>(`suggestions/${guildId}/suggestThreadsType`, "POST", type),

  getSuggestButtonChannel: (guildId: bigint) =>
    apiRequest<bigint>(`suggestions/${guildId}/suggestButtonChannel`),

  setSuggestButtonChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(
      `suggestions/${guildId}/suggestButtonChannel`,
      "POST",
      channelId,
    ),

  getSuggestButtonMessage: (guildId: bigint) =>
    apiRequest<string | null>(`suggestions/${guildId}/suggestButtonMessage`),

  setSuggestButtonMessage: (guildId: bigint, message: string | null) =>
    apiRequest<void>(
      `suggestions/${guildId}/suggestButtonMessage`,
      "POST",
      message,
    ),

  getSuggestButtonLabel: (guildId: bigint) =>
    apiRequest<string | null>(`suggestions/${guildId}/suggestButtonLabel`),

  setSuggestButtonLabel: (guildId: bigint, label: string | null) =>
    apiRequest<void>(
      `suggestions/${guildId}/suggestButtonLabel`,
      "POST",
      label,
    ),

  getSuggestButtonEmote: (guildId: bigint) =>
    apiRequest<string | null>(`suggestions/${guildId}/suggestButtonEmote`),

  setSuggestButtonEmote: (guildId: bigint, emote: string | null) =>
    apiRequest<void>(
      `suggestions/${guildId}/suggestButtonEmote`,
      "POST",
      emote,
    ),

  getArchiveOnDeny: (guildId: bigint) =>
    apiRequest<boolean>(`suggestions/${guildId}/archiveOnDeny`),

  setArchiveOnDeny: (guildId: bigint, archive: boolean) =>
    apiRequest<void>(`suggestions/${guildId}/archiveOnDeny`, "POST", archive),

  getArchiveOnAccept: (guildId: bigint) =>
    apiRequest<boolean>(`suggestions/${guildId}/archiveOnAccept`),

  setArchiveOnAccept: (guildId: bigint, archive: boolean) =>
    apiRequest<void>(`suggestions/${guildId}/archiveOnAccept`, "POST", archive),

  getArchiveOnConsider: (guildId: bigint) =>
    apiRequest<boolean>(`suggestions/${guildId}/archiveOnConsider`),

  setArchiveOnConsider: (guildId: bigint, archive: boolean) =>
    apiRequest<void>(
      `suggestions/${guildId}/archiveOnConsider`,
      "POST",
      archive,
    ),

  getArchiveOnImplement: (guildId: bigint) =>
    apiRequest<boolean>(`suggestions/${guildId}/archiveOnImplement`),

  setArchiveOnImplement: (guildId: bigint, archive: boolean) =>
    apiRequest<void>(
      `suggestions/${guildId}/archiveOnImplement`,
      "POST",
      archive,
    ),

  getSuggestChannel: (guildId: bigint) =>
    apiRequest<bigint>(`suggestions/${guildId}/suggestChannel`),

  setSuggestChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(
      `suggestions/${guildId}/suggestChannel`,
      "POST",
      channelId,
    ),

  getSuggestEmotes: (guildId: bigint) =>
    apiRequest<string | null>(`suggestions/${guildId}/suggestEmotes`),

  setSuggestEmotes: (guildId: bigint, emotes: string | null) =>
    apiRequest<void>(`suggestions/${guildId}/suggestEmotes`, "POST", emotes),
};
