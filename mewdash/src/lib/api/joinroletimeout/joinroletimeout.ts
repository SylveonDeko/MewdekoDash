// lib/api/joinroletimeout/joinroletimeout.ts
import { apiRequest } from "../core";
import type { JoinRoleTimeoutPending, JoinRoleTimeoutSettings } from "./models";

/**
 * Join role timeout API
 * Maps to Mewdeko.Controllers.JoinRoleTimeoutController
 */
export const joinRoleTimeoutApi = {
  /** Gets the join role timeout settings */
  get: (guildId: bigint) => apiRequest<JoinRoleTimeoutSettings>(`JoinRoleTimeout/${guildId}`),

  /** Saves every setting at once and returns the saved state */
  update: (guildId: bigint, settings: JoinRoleTimeoutSettings) =>
    apiRequest<JoinRoleTimeoutSettings>(`JoinRoleTimeout/${guildId}`, "POST", settings),

  /** Gets how many members are counting down and the next few due */
  pending: (guildId: bigint, limit = 10) =>
    apiRequest<JoinRoleTimeoutPending>(`JoinRoleTimeout/${guildId}/pending?limit=${limit}`),
};
