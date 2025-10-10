// lib/api/poll/poll.ts
import { apiRequest } from "../core";
import type {
  PollResponse,
  CreatePollRequest,
  UpdatePollRequest,
  ClosePollRequest,
  SchedulePollRequest,
  CreateTemplateRequest,
  PollStatsResponse,
} from "./models";

/**
 * Poll system API
 * Maps to Mewdeko.Controllers.PollController
 */
export const pollApi = {
  /**
   * Gets all polls for a guild
   * @param guildId The guild ID
   * @param includeInactive Whether to include closed/expired polls
   * @returns List of polls
   */
  getPolls: (guildId: bigint, includeInactive: boolean = false) =>
    apiRequest<PollResponse[]>(
      `Poll/${guildId}?includeInactive=${includeInactive}`,
    ),

  /**
   * Gets a specific poll by ID
   * @param guildId The guild ID
   * @param pollId The poll ID
   * @returns Poll details with statistics
   */
  getPoll: (guildId: bigint, pollId: number) =>
    apiRequest<PollResponse>(`Poll/${guildId}/${pollId}`),

  /**
   * Creates a new poll
   * @param guildId The guild ID
   * @param request Poll creation data
   * @returns Created poll
   */
  createPoll: (guildId: bigint, request: CreatePollRequest) =>
    apiRequest<PollResponse>(`Poll/${guildId}`, "POST", request),

  /**
   * Updates an existing poll
   * @param guildId The guild ID
   * @param pollId The poll ID
   * @param request Poll updates
   * @returns Updated poll
   */
  updatePoll: (guildId: bigint, pollId: number, request: UpdatePollRequest) =>
    apiRequest<PollResponse>(`Poll/${guildId}/${pollId}`, "PATCH", request),

  /**
   * Closes a poll
   * @param guildId The guild ID
   * @param pollId The poll ID
   * @param request Close request
   */
  closePoll: (guildId: bigint, pollId: number, request: ClosePollRequest) =>
    apiRequest<void>(`Poll/${guildId}/${pollId}/close`, "POST", request),

  /**
   * Deletes a poll
   * @param guildId The guild ID
   * @param pollId The poll ID
   */
  deletePoll: (guildId: bigint, pollId: number) =>
    apiRequest<void>(`Poll/${guildId}/${pollId}`, "DELETE"),

  /**
   * Gets poll statistics
   * @param guildId The guild ID
   * @param pollId The poll ID
   * @returns Poll statistics
   */
  getPollStats: (guildId: bigint, pollId: number) =>
    apiRequest<PollStatsResponse>(`Poll/${guildId}/${pollId}/stats`),

  /**
   * Schedules a poll for later
   * @param guildId The guild ID
   * @param request Schedule request
   */
  schedulePoll: (guildId: bigint, request: SchedulePollRequest) =>
    apiRequest<any>(`Poll/${guildId}/schedule`, "POST", request),

  /**
   * Gets scheduled polls
   * @param guildId The guild ID
   * @returns List of scheduled polls
   */
  getScheduledPolls: (guildId: bigint) =>
    apiRequest<any[]>(`Poll/${guildId}/scheduled`),

  /**
   * Creates a poll template
   * @param guildId The guild ID
   * @param request Template data
   */
  createTemplate: (guildId: bigint, request: CreateTemplateRequest) =>
    apiRequest<any>(`Poll/${guildId}/templates`, "POST", request),

  /**
   * Gets all poll templates for a guild
   * @param guildId The guild ID
   * @returns List of templates
   */
  getTemplates: (guildId: bigint) =>
    apiRequest<any[]>(`Poll/${guildId}/templates`),

  /**
   * Deletes a poll template
   * @param guildId The guild ID
   * @param templateId The template ID
   */
  deleteTemplate: (guildId: bigint, templateId: number) =>
    apiRequest<void>(`Poll/${guildId}/templates/${templateId}`, "DELETE"),
};
