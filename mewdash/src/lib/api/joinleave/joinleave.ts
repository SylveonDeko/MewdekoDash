// lib/api/joinleave/joinleave.ts
import { apiRequest } from "../core";
import type { GraphStatsResponse, GraphImageResponse } from "./models";

/**
 * Join/Leave statistics API
 * Maps to Mewdeko.Controllers.JoinLeaveController
 */
export const joinLeaveApi = {
  /**
   * Gets join statistics for a guild
   * @param guildId The guild ID
   * @returns Join statistics and graph data
   */
  getJoinStats: (guildId: bigint) =>
    apiRequest<GraphStatsResponse>(`JoinLeave/${guildId}/join-stats`),

  /**
   * Gets leave statistics for a guild
   * @param guildId The guild ID
   * @returns Leave statistics and graph data
   */
  getLeaveStats: (guildId: bigint) =>
    apiRequest<GraphStatsResponse>(`JoinLeave/${guildId}/leave-stats`),

  /**
   * Gets average joins per day for a guild
   * @param guildId The guild ID
   * @returns Average number of joins
   */
  getAverageJoins: (guildId: bigint) =>
    apiRequest<number>(`JoinLeave/${guildId}/average-joins`),

  /**
   * Gets a join statistics graph image
   * @param guildId The guild ID
   * @returns Graph image as base64 and embed data
   */
  getJoinGraph: (guildId: bigint) =>
    apiRequest<GraphImageResponse>(`JoinLeave/${guildId}/join-graph`),

  /**
   * Gets a leave statistics graph image
   * @param guildId The guild ID
   * @returns Graph image as base64 and embed data
   */
  getLeaveGraph: (guildId: bigint) =>
    apiRequest<GraphImageResponse>(`JoinLeave/${guildId}/leave-graph`),

  /**
   * Sets the join graph color
   * @param guildId The guild ID
   * @param color The color value
   */
  setJoinColor: (guildId: bigint, color: number) =>
    apiRequest<void>(`JoinLeave/${guildId}/join-color`, "POST", color),

  /**
   * Sets the leave graph color
   * @param guildId The guild ID
   * @param color The color value
   */
  setLeaveColor: (guildId: bigint, color: number) =>
    apiRequest<void>(`JoinLeave/${guildId}/leave-color`, "POST", color),
};
