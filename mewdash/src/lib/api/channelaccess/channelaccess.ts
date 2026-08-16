// lib/api/channelaccess/channelaccess.ts
import { apiRequest } from "../core";
import type {
  AccessApplicationStatus,
  ChannelAccessApplication,
  ChannelAccessBlacklistEntry,
  ChannelAccessGate,
  ChannelAccessQuestion,
  CreateChannelAccessBlacklistRequest,
  CreateChannelAccessGateRequest,
  CreateChannelAccessQuestionRequest,
  ResolveChannelAccessApplicationRequest,
  UpdateChannelAccessGateRequest,
} from "./models";

/**
 * Channel access API: gates on locked channels, their application forms, the
 * applications themselves and the applicant blacklist.
 * Maps to Mewdeko.Controllers.ChannelAccessController
 */
export const channelAccessApi = {
  /**
   * Gets every access gate in a guild, with its questions and open application count
   * @param guildId The guild ID
   */
  getGates: (guildId: bigint) =>
    apiRequest<ChannelAccessGate[]>(`ChannelAccess/${guildId}/gates`),

  /**
   * Opens applications for a locked channel
   * @param guildId The guild ID
   * @param request The channel to gate and the role approved applicants receive
   */
  createGate: (guildId: bigint, request: CreateChannelAccessGateRequest) =>
    apiRequest<ChannelAccessGate>(`ChannelAccess/${guildId}/gates`, "POST", request),

  /**
   * Changes a gate's settings. Omitted fields are left alone
   * @param guildId The guild ID
   * @param configId The gate ID
   * @param request The settings to change
   */
  updateGate: (guildId: bigint, configId: number, request: UpdateChannelAccessGateRequest) =>
    apiRequest<ChannelAccessGate>(`ChannelAccess/${guildId}/gates/${configId}`, "PUT", request),

  /**
   * Removes a gate along with its questions, applications and votes
   * @param guildId The guild ID
   * @param configId The gate ID
   */
  deleteGate: (guildId: bigint, configId: number) =>
    apiRequest<void>(`ChannelAccess/${guildId}/gates/${configId}`, "DELETE"),

  /**
   * Posts the gate's apply panel in a channel
   * @param guildId The guild ID
   * @param configId The gate ID
   * @param channelId The channel to post the panel in
   */
  postPanel: (guildId: bigint, configId: number, channelId: bigint) =>
    apiRequest<{ messageId: bigint }>(`ChannelAccess/${guildId}/gates/${configId}/panel`, "POST", { channelId }),

  /**
   * Gets a gate's application questions in display order
   * @param guildId The guild ID
   * @param configId The gate ID
   */
  getQuestions: (guildId: bigint, configId: number) =>
    apiRequest<ChannelAccessQuestion[]>(`ChannelAccess/${guildId}/gates/${configId}/questions`),

  /**
   * Adds a question to a gate's application form
   * @param guildId The guild ID
   * @param configId The gate ID
   * @param request The question to add
   */
  addQuestion: (guildId: bigint, configId: number, request: CreateChannelAccessQuestionRequest) =>
    apiRequest<ChannelAccessQuestion[]>(`ChannelAccess/${guildId}/gates/${configId}/questions`, "POST", request),

  /**
   * Removes a question by its one-based display position
   * @param guildId The guild ID
   * @param configId The gate ID
   * @param position The one-based display position
   */
  removeQuestion: (guildId: bigint, configId: number, position: number) =>
    apiRequest<ChannelAccessQuestion[]>(
      `ChannelAccess/${guildId}/gates/${configId}/questions/${position}`,
      "DELETE",
    ),

  /**
   * Gets applications in a guild, newest first, optionally filtered by gate and status
   * @param guildId The guild ID
   * @param options Optional gate, status and limit filters
   */
  getApplications: (
    guildId: bigint,
    options: { configId?: number; status?: AccessApplicationStatus; limit?: number } = {},
  ) => {
    const params = new URLSearchParams();
    if (options.configId !== undefined) params.set("configId", options.configId.toString());
    if (options.status !== undefined) params.set("status", options.status.toString());
    if (options.limit !== undefined) params.set("limit", options.limit.toString());

    const query = params.toString();
    return apiRequest<ChannelAccessApplication[]>(
      `ChannelAccess/${guildId}/applications${query ? `?${query}` : ""}`,
    );
  },

  /**
   * Gets a single application with its answers and, when the gate allows it, its votes
   * @param guildId The guild ID
   * @param applicationId The application ID
   */
  getApplication: (guildId: bigint, applicationId: number) =>
    apiRequest<ChannelAccessApplication>(`ChannelAccess/${guildId}/applications/${applicationId}`),

  /**
   * Closes an application, overriding the vote count
   * @param guildId The guild ID
   * @param applicationId The application ID
   * @param request The outcome to record
   */
  resolveApplication: (
    guildId: bigint,
    applicationId: number,
    request: ResolveChannelAccessApplicationRequest,
  ) =>
    apiRequest<ChannelAccessApplication>(
      `ChannelAccess/${guildId}/applications/${applicationId}/resolve`,
      "POST",
      request,
    ),

  /**
   * Gets everyone barred from applying in a guild
   * @param guildId The guild ID
   */
  getBlacklist: (guildId: bigint) =>
    apiRequest<ChannelAccessBlacklistEntry[]>(`ChannelAccess/${guildId}/blacklist`),

  /**
   * Bars a user from applying, either for one gate or for every gate in the guild
   * @param guildId The guild ID
   * @param request The user to bar and the scope of the bar
   */
  addBlacklist: (guildId: bigint, request: CreateChannelAccessBlacklistRequest) =>
    apiRequest<void>(`ChannelAccess/${guildId}/blacklist`, "POST", request),

  /**
   * Lifts a bar so a user can apply again
   * @param guildId The guild ID
   * @param userId The barred user
   * @param configId The gate the bar was set on, or omitted for the guild wide entry
   */
  removeBlacklist: (guildId: bigint, userId: bigint, configId?: number | null) =>
    apiRequest<void>(
      `ChannelAccess/${guildId}/blacklist/${userId}${configId != null ? `?configId=${configId}` : ""}`,
      "DELETE",
    ),
};
