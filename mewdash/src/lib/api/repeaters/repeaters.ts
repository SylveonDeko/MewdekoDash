// lib/api/repeaters/repeaters.ts
import { apiRequest } from "../core";
import type {
  RepeaterResponse,
  CreateRepeaterRequest,
  UpdateRepeaterRequest,
  RepeaterStatsResponse,
  MessageCountingStatus,
} from "./models";

/**
 * Repeaters/Sticky messages API
 * Maps to Mewdeko.Controllers.RepeatersController
 */
export const repeatersApi = {
  /**
   * Gets all repeaters for a guild
   * @param guildId The guild ID
   * @returns List of repeaters
   */
  getRepeaters: (guildId: bigint) =>
    apiRequest<RepeaterResponse[]>(`Repeaters/${guildId}`),

  /**
   * Gets a specific repeater by ID
   * @param guildId The guild ID
   * @param repeaterId The repeater ID
   * @returns Repeater details
   */
  getRepeater: (guildId: bigint, repeaterId: number) =>
    apiRequest<RepeaterResponse>(`Repeaters/${guildId}/${repeaterId}`),

  /**
   * Creates a new repeater
   * @param guildId The guild ID
   * @param request Repeater configuration
   * @returns Created repeater
   */
  createRepeater: (guildId: bigint, request: CreateRepeaterRequest) =>
    apiRequest<RepeaterResponse>(`Repeaters/${guildId}`, "POST", request),

  /**
   * Updates an existing repeater
   * @param guildId The guild ID
   * @param repeaterId The repeater ID
   * @param request Updated configuration
   */
  updateRepeater: (
    guildId: bigint,
    repeaterId: number,
    request: UpdateRepeaterRequest,
  ) => apiRequest<void>(`Repeaters/${guildId}/${repeaterId}`, "PUT", request),

  /**
   * Deletes a repeater
   * @param guildId The guild ID
   * @param repeaterId The repeater ID
   */
  deleteRepeater: (guildId: bigint, repeaterId: number) =>
    apiRequest<void>(`Repeaters/${guildId}/${repeaterId}`, "DELETE"),

  /**
   * Manually triggers a repeater
   * @param guildId The guild ID
   * @param repeaterId The repeater ID
   */
  triggerRepeater: (guildId: bigint, repeaterId: number) =>
    apiRequest<void>(`Repeaters/${guildId}/${repeaterId}/trigger`, "POST"),

  /**
   * Gets repeater statistics
   * @param guildId The guild ID
   * @returns Repeater statistics
   */
  getRepeaterStatistics: (guildId: bigint) =>
    apiRequest<RepeaterStatsResponse>(`Repeaters/${guildId}/statistics`),

  /**
   * Bulk toggles multiple repeaters
   * @param guildId The guild ID
   * @param repeaterIds List of repeater IDs
   * @param enabled Whether to enable or disable
   */
  bulkToggleRepeaters: (
    guildId: bigint,
    repeaterIds: number[],
    enabled: boolean,
  ) =>
    apiRequest<void>(`Repeaters/${guildId}/bulk-toggle`, "POST", {
      repeaterIds,
      enabled,
    }),

  /**
   * Gets message counting status (for activity-based repeaters)
   * @param guildId The guild ID
   * @returns Message counting status
   */
  getMessageCountingStatus: (guildId: bigint) =>
    apiRequest<MessageCountingStatus>(
      `Repeaters/${guildId}/message-counting-status`,
    ),
};

// Re-export types for convenience
export type { RepeaterStatsResponse, MessageCountingStatus };
