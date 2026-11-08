// lib/api/giveaways/giveaways.ts
import { apiRequest } from "../core";
import type { Giveaway, GiveawayOptions, GiveawaySettings } from "./models";

export const giveawaysApi = {
  enterGiveaway: (data: {
    guildId: bigint;
    giveawayId: number;
    userId: bigint;
    turnstileToken: string;
  }) => apiRequest<void>("giveaways/enter", "POST", data),

  getGiveaway: (giveawayId: string | number) =>
    apiRequest<Giveaway>(`giveaways/${giveawayId}`),

  getGiveaways: (guildId: bigint) =>
    apiRequest<Giveaway[]>(`giveaways/guild/${guildId}`),

  createGiveaway: (guildId: bigint, giveaway: Partial<Giveaway>) =>
    apiRequest<Giveaway>(`giveaways/${guildId}`, "POST", giveaway),

  endGiveaway: (guildId: bigint, giveawayId: number) =>
    apiRequest<void>(`giveaways/${guildId}/${giveawayId}`, "PATCH"),

  rerollGiveaway: (guildId: bigint, giveawayId: number) =>
    apiRequest<void>(`giveaways/${guildId}/${giveawayId}/reroll`, "POST"),

  startDraft: (guildId: bigint, giveawayId: number) =>
    apiRequest<Giveaway>(`giveaways/${guildId}/${giveawayId}/start`, "POST"),

  deleteDraft: (guildId: bigint, giveawayId: number) =>
    apiRequest<void>(`giveaways/${guildId}/${giveawayId}`, "DELETE"),

  updateOptions: (guildId: bigint, giveawayId: number, options: GiveawayOptions) =>
    apiRequest<Giveaway>(`giveaways/${guildId}/${giveawayId}/options`, "PATCH", options),

  getEntryCounts: (guildId: bigint) =>
    apiRequest<Record<string, number>>(`giveaways/entries/${guildId}`),

  getSettings: (guildId: bigint) =>
    apiRequest<GiveawaySettings>(`giveaways/settings/${guildId}`),

  updateSettings: (guildId: bigint, settings: GiveawaySettings) =>
    apiRequest<GiveawaySettings>(`giveaways/settings/${guildId}`, "PUT", settings),
};
