// lib/api/starboard/starboard.ts
import JSONbig from "json-bigint";
import { apiRequest } from "../core";
import type { Starboard, StarboardHighlight } from "./models";

/**
 * Posts a bare value. `apiRequest` drops falsy bodies, which would turn false, 0 and null
 * into an empty request the bot rejects, so the body is written here instead.
 */
function send<T>(endpoint: string, value: unknown): Promise<T> {
  const body = JSONbig.stringify(value ?? null);
  const withBody: typeof fetch = (input, init) => fetch(input, { ...init, body });
  return apiRequest<T>(endpoint, "POST", true, {}, withBody);
}

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

  setupStarboard: (
    guildId: bigint,
    name: string,
    emote: string,
    threshold: number,
  ) =>
    apiRequest<{ starboardId: number; channelId: bigint }>(
      `Starboard/${guildId}/setup`,
      "POST",
      { name, emote, threshold },
    ),

  deleteStarboard: (guildId: bigint, starboardId: number) =>
    apiRequest<void>(`Starboard/${guildId}/${starboardId}`, "DELETE"),

  setEnabled: (guildId: bigint, starboardId: number, enabled: boolean) =>
    send<boolean>(`Starboard/${guildId}/${starboardId}/enabled`, enabled),

  setAllowBots: (guildId: bigint, starboardId: number, allowed: boolean) =>
    send<boolean>(`Starboard/${guildId}/${starboardId}/allow-bots`, allowed),

  setAllowSelfStar: (guildId: bigint, starboardId: number, allowed: boolean) =>
    send<boolean>(`Starboard/${guildId}/${starboardId}/self-star`, allowed),

  setAllowNsfw: (guildId: bigint, starboardId: number, allowed: boolean) =>
    send<boolean>(`Starboard/${guildId}/${starboardId}/nsfw`, allowed),

  setLockedUntil: (
    guildId: bigint,
    starboardId: number,
    lockedUntil: string | null,
  ) => send<string | null>(`Starboard/${guildId}/${starboardId}/lock`, lockedUntil),

  setRemoveOnDelete: (
    guildId: bigint,
    starboardId: number,
    removeOnDelete: boolean,
  ) =>
    send<boolean>(
      `Starboard/${guildId}/${starboardId}/remove-on-delete`,
      removeOnDelete,
    ),

  setRemoveOnClear: (
    guildId: bigint,
    starboardId: number,
    removeOnClear: boolean,
  ) =>
    send<boolean>(
      `Starboard/${guildId}/${starboardId}/remove-on-clear`,
      removeOnClear,
    ),

  setRemoveBelowThreshold: (
    guildId: bigint,
    starboardId: number,
    removeBelowThreshold: boolean,
  ) =>
    send<boolean>(
      `Starboard/${guildId}/${starboardId}/remove-below-threshold`,
      removeBelowThreshold,
    ),

  setRepostThreshold: (
    guildId: bigint,
    starboardId: number,
    threshold: number,
  ) =>
    send<number>(`Starboard/${guildId}/${starboardId}/repost-threshold`, threshold),

  setStarThreshold: (guildId: bigint, starboardId: number, threshold: number) =>
    send<number>(`Starboard/${guildId}/${starboardId}/star-threshold`, threshold),

  setUseBlacklist: (
    guildId: bigint,
    starboardId: number,
    useBlacklist: boolean,
  ) =>
    send<boolean>(`Starboard/${guildId}/${starboardId}/use-blacklist`, useBlacklist),

  toggleChannel: (guildId: bigint, starboardId: number, channelId: bigint) =>
    send<{ wasAdded: boolean; config: Starboard }>(
      `Starboard/${guildId}/${starboardId}/toggle-channel`,
      channelId,
    ),

  toggleAutoStarChannel: (
    guildId: bigint,
    starboardId: number,
    channelId: bigint,
  ) =>
    send<{ wasAdded: boolean; config: Starboard }>(
      `Starboard/${guildId}/${starboardId}/autostar-channel`,
      channelId,
    ),

  toggleAllowedRole: (guildId: bigint, starboardId: number, roleId: bigint) =>
    send<{ wasAdded: boolean; config: Starboard }>(
      `Starboard/${guildId}/${starboardId}/allowed-role`,
      roleId,
    ),

  toggleDeniedRole: (guildId: bigint, starboardId: number, roleId: bigint) =>
    send<{ wasAdded: boolean; config: Starboard }>(
      `Starboard/${guildId}/${starboardId}/denied-role`,
      roleId,
    ),

  setAutoReact: (guildId: bigint, starboardId: number, mode: number) =>
    send<number>(`Starboard/${guildId}/${starboardId}/auto-react`, mode),

  setCountMultipleReactions: (
    guildId: bigint,
    starboardId: number,
    enabled: boolean,
  ) => send<boolean>(`Starboard/${guildId}/${starboardId}/multi-react`, enabled),

  setRemoveInvalidStars: (
    guildId: bigint,
    starboardId: number,
    enabled: boolean,
  ) =>
    send<boolean>(`Starboard/${guildId}/${starboardId}/remove-invalid-stars`, enabled),

  setMessageAge: (
    guildId: bigint,
    starboardId: number,
    minMinutes: number,
    maxMinutes: number,
  ) =>
    apiRequest<unknown>(
      `Starboard/${guildId}/${starboardId}/message-age`,
      "POST",
      { minMinutes, maxMinutes },
    ),

  setRepostCooldown: (guildId: bigint, starboardId: number, minutes: number) =>
    send<number>(`Starboard/${guildId}/${starboardId}/repost-cooldown`, minutes),

  getDesignPlaceholders: (guildId: bigint) =>
    apiRequest<string[]>(`Starboard/${guildId}/placeholders`),

  setPostDesign: (
    guildId: bigint,
    starboardId: number,
    design: string | null,
  ) => send<string | null>(`Starboard/${guildId}/${starboardId}/design`, design),

  sendDesignTest: (
    guildId: bigint,
    starboardId: number,
    channelId: bigint,
    messageId: bigint | null,
  ) =>
    apiRequest<void>(
      `Starboard/${guildId}/${starboardId}/design/test`,
      "POST",
      { channelId, messageId },
    ),

  getStarboardHighlights: (guildId: bigint, limit: number = 5) =>
    apiRequest<StarboardHighlight[]>(
      `Starboard/${guildId}/highlights?limit=${limit}`,
    ),

  addEmoteToStarboard: (guildId: bigint, starboardId: number, emote: string) =>
    send<string>(`Starboard/${guildId}/${starboardId}/add-emote`, emote),

  removeEmoteFromStarboard: (
    guildId: bigint,
    starboardId: number,
    emote: string,
  ) => send<string>(`Starboard/${guildId}/${starboardId}/remove-emote`, emote),

  getStarboardStats: (guildId: bigint) =>
    apiRequest<any>(`Starboard/${guildId}/stats`),
};
