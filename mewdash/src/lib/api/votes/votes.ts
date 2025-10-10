// lib/api/votes/votes.ts
import { apiRequest } from "../core";
import type { VoteRole } from "./models";

/**
 * Voting system API
 * Maps to Mewdeko.Controllers.VotesController
 */
export const votesApi = {
  /**
   * Gets all vote roles configured for a guild
   * @param guildId The guild ID
   * @returns List of vote roles
   */
  getVoteRoles: (guildId: bigint) =>
    apiRequest<VoteRole[]>(`Votes/${guildId}/roles`),

  addVoteRole: (guildId: bigint, roleId: bigint, seconds: number = 0) =>
    apiRequest<void>(`Votes/${guildId}/roles/${roleId}`, "POST", seconds),

  removeVoteRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<void>(`Votes/${guildId}/roles/${roleId}`, "DELETE"),

  updateVoteRoleTimer: (guildId: bigint, roleId: bigint, seconds: number) =>
    apiRequest<void>(`Votes/${guildId}/roles/${roleId}`, "PATCH", seconds),

  clearVoteRoles: (guildId: bigint) =>
    apiRequest<void>(`Votes/${guildId}/roles`, "DELETE"),

  getVoteMessage: (guildId: bigint) =>
    apiRequest<string>(`Votes/${guildId}/message`),

  setVoteMessage: (guildId: bigint, message: string) =>
    apiRequest<void>(`Votes/${guildId}/message`, "POST", message),

  getVotePassword: (guildId: bigint) =>
    apiRequest<string>(`Votes/${guildId}/password`),

  setVotePassword: (guildId: bigint, password: string) =>
    apiRequest<void>(`Votes/${guildId}/password`, "POST", password),

  getVoteChannel: (guildId: bigint) =>
    apiRequest<bigint>(`Votes/${guildId}/channel`),

  setVoteChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`Votes/${guildId}/channel`, "POST", channelId),
};
