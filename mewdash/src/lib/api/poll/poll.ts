// lib/api/poll/poll.ts
import { apiRequest } from "../core";
import type {
  ClosePollRequest,
  CreatePollRequest,
  CreateTemplateRequest,
  PollAnalyticsResponse,
  PollResponse,
  PollTemplateResponse,
  SchedulePollRequest,
  ScheduledPollResponse,
  UpdatePollRequest,
} from "./models";

/**
 * Poll system API
 * Maps to Mewdeko.Controllers.PollController
 */
export const pollApi = {
  /**
   * Gets all polls for a guild
   */
  getPolls: (guildId: bigint, includeInactive: boolean = false) =>
    apiRequest<PollResponse[]>(
      `Poll/${guildId}?includeInactive=${includeInactive}`,
    ),

  /**
   * Gets a specific poll with statistics
   */
  getPoll: (guildId: bigint, pollId: number) =>
    apiRequest<PollResponse>(`Poll/${guildId}/${pollId}`),

  /**
   * Creates a new poll
   */
  createPoll: (guildId: bigint, request: CreatePollRequest) =>
    apiRequest<PollResponse>(`Poll/${guildId}`, "POST", request),

  /**
   * Updates an existing poll
   */
  updatePoll: (guildId: bigint, pollId: number, request: UpdatePollRequest) =>
    apiRequest<PollResponse>(`Poll/${guildId}/${pollId}`, "PATCH", request),

  /**
   * Closes a poll
   */
  closePoll: (guildId: bigint, pollId: number, request: ClosePollRequest) =>
    apiRequest<void>(`Poll/${guildId}/${pollId}/close`, "POST", request),

  /**
   * Deletes a poll
   */
  deletePoll: (guildId: bigint, pollId: number, userId: bigint) =>
    apiRequest<void>(`Poll/${guildId}/${pollId}/${userId}`, "DELETE"),

  /**
   * Gets guild wide poll analytics
   */
  getAnalytics: (
    guildId: bigint,
    timeframe: "day" | "week" | "month" | "year" = "month",
  ) =>
    apiRequest<PollAnalyticsResponse>(
      `Poll/${guildId}/analytics?timeframe=${timeframe}`,
    ),

  /**
   * Schedules a poll for later
   */
  schedulePoll: (guildId: bigint, request: SchedulePollRequest) =>
    apiRequest<any>(`Poll/${guildId}/schedule`, "POST", request),

  /**
   * Gets scheduled polls
   */
  getScheduledPolls: (guildId: bigint) =>
    apiRequest<{ guildId: bigint; scheduledPolls: ScheduledPollResponse[]; count: number }>(
      `Poll/${guildId}/scheduled`,
    ),

  /**
   * Cancels a scheduled poll
   */
  cancelScheduledPoll: (guildId: bigint, scheduledId: number, userId: bigint) =>
    apiRequest<void>(
      `Poll/${guildId}/scheduled/${scheduledId}/${userId}`,
      "DELETE",
    ),

  /**
   * Creates a poll template
   */
  createTemplate: (guildId: bigint, request: CreateTemplateRequest) =>
    apiRequest<PollTemplateResponse>(
      `Poll/${guildId}/templates`,
      "POST",
      request,
    ),

  /**
   * Gets all poll templates for a guild
   */
  getTemplates: (guildId: bigint) =>
    apiRequest<PollTemplateResponse[]>(`Poll/${guildId}/templates`),

  /**
   * Deletes a poll template
   */
  deleteTemplate: (guildId: bigint, templateId: number, userId: bigint) =>
    apiRequest<void>(
      `Poll/${guildId}/templates/${templateId}/${userId}`,
      "DELETE",
    ),
};
