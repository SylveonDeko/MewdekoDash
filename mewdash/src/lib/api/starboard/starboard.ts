// lib/api/starboard/starboard.ts
import { apiRequest } from "../core";
import type { Starboard, StarboardHighlight } from "./models";

export const starboardApi = {
  getStarboards: (guildId: bigint) =>
    apiRequest<Starboard[]>(`Starboard/${guildId}/all`),

  createStarboard: (
    guildId: bigint,
    channelId: bigint,
    emote: string,
    threshold: number,
  ) =>
    apiRequest<number>(`Starboard/${guildId}`, "POST", {
      channelId,
      emote,
      threshold,
    }),

  deleteStarboard: (guildId: bigint, starboardId: number) =>
    apiRequest<void>(`Starboard/${guildId}/${starboardId}`, "DELETE"),

  setAllowBots: (guildId: bigint, starboardId: number, allowed: boolean) =>
    apiRequest<boolean>(
      `Starboard/${guildId}/${starboardId}/allow-bots`,
      "POST",
      allowed,
    ),

  setRemoveOnDelete: (
    guildId: bigint,
    starboardId: number,
    removeOnDelete: boolean,
  ) =>
    apiRequest<boolean>(
      `Starboard/${guildId}/${starboardId}/remove-on-delete`,
      "POST",
      removeOnDelete,
    ),

  setRemoveOnClear: (
    guildId: bigint,
    starboardId: number,
    removeOnClear: boolean,
  ) =>
    apiRequest<boolean>(
      `Starboard/${guildId}/${starboardId}/remove-on-clear`,
      "POST",
      removeOnClear,
    ),

  setRemoveBelowThreshold: (
    guildId: bigint,
    starboardId: number,
    removeBelowThreshold: boolean,
  ) =>
    apiRequest<boolean>(
      `Starboard/${guildId}/${starboardId}/remove-below-threshold`,
      "POST",
      removeBelowThreshold,
    ),

  setRepostThreshold: (
    guildId: bigint,
    starboardId: number,
    threshold: number,
  ) =>
    apiRequest<number>(
      `Starboard/${guildId}/${starboardId}/repost-threshold`,
      "POST",
      threshold,
    ),

  setStarThreshold: (guildId: bigint, starboardId: number, threshold: number) =>
    apiRequest<number>(
      `Starboard/${guildId}/${starboardId}/star-threshold`,
      "POST",
      threshold,
    ),

  setUseBlacklist: (
    guildId: bigint,
    starboardId: number,
    useBlacklist: boolean,
  ) =>
    apiRequest<boolean>(
      `Starboard/${guildId}/${starboardId}/use-blacklist`,
      "POST",
      useBlacklist,
    ),

  toggleChannel: (guildId: bigint, starboardId: number, channelId: bigint) =>
    apiRequest<{ wasAdded: boolean; config: Starboard }>(
      `Starboard/${guildId}/${starboardId}/toggle-channel`,
      "POST",
      channelId,
    ),

  getStarboardHighlights: (guildId: bigint, limit: number = 5) =>
    apiRequest<StarboardHighlight[]>(
      `Starboard/${guildId}/highlights?limit=${limit}`,
    ),

  addEmoteToStarboard: (guildId: bigint, starboardId: number, emote: string) =>
    apiRequest<string>(
      `Starboard/${guildId}/${starboardId}/add-emote`,
      "POST",
      emote,
    ),

  removeEmoteFromStarboard: (
    guildId: bigint,
    starboardId: number,
    emote: string,
  ) =>
    apiRequest<string>(
      `Starboard/${guildId}/${starboardId}/remove-emote`,
      "POST",
      emote,
    ),

  getStarboardStats: (guildId: bigint) =>
    apiRequest<any>(`Starboard/${guildId}/stats`),
};
