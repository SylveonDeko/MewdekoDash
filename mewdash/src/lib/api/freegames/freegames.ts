// lib/api/freegames/freegames.ts
import { apiRequest } from "../core";
import type { FreeGame, FreeGameAlert } from "./models";

export const freeGamesApi = {
  getAlerts: (guildId: bigint) => apiRequest<FreeGameAlert[]>(`FreeGames/${guildId}`),

  saveAlert: (guildId: bigint, alert: FreeGameAlert) =>
    apiRequest<FreeGameAlert>(`FreeGames/${guildId}`, "POST", alert),

  removeAlert: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`FreeGames/${guildId}/${channelId}`, "DELETE"),

  getCurrent: (guildId: bigint) => apiRequest<FreeGame[]>(`FreeGames/${guildId}/now`),
};
