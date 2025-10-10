// lib/api/giveaways/giveaways.ts
import { apiRequest } from "../core";
import type { Giveaway } from "./models";

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
};
