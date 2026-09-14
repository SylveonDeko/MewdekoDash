// lib/api/featurerequests/featurerequests.ts
import { apiRequest } from "../core";
import type {
  FeatureRequestEntry,
  FeatureRequestPage,
  FeatureRequestQuery,
  FeatureRequestSettings,
  FeatureRequestStats,
  FeatureRequestStatusChange,
  FeatureRequestSubmit,
  FeatureRequestVoteResult,
} from "./models";

/**
 * Feature Requests API
 * Maps to Mewdeko.Controllers.FeatureRequestsController
 */
export const featureRequestsApi = {
  /**
   * Submits a new request.
   * @param request The category, title, body, and optional guild
   * @returns The stored request
   */
  submit: (request: FeatureRequestSubmit) =>
    apiRequest<FeatureRequestEntry>("FeatureRequests", "POST", request),

  /**
   * Gets a page of requests, most voted first by default.
   * @param query Optional filters and paging
   */
  getPage: (query: FeatureRequestQuery = {}) => {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.category) params.set("category", query.category);
    if (query.search) params.set("search", query.search);
    if (query.sort) params.set("sort", query.sort);
    if (query.page != null) params.set("page", query.page.toString());
    if (query.pageSize != null) params.set("pageSize", query.pageSize.toString());

    const qs = params.toString();
    return apiRequest<FeatureRequestPage>(`FeatureRequests${qs ? `?${qs}` : ""}`);
  },

  /**
   * Gets everything the current user has submitted, newest first.
   */
  getMine: () => apiRequest<FeatureRequestEntry[]>("FeatureRequests/mine"),

  /**
   * Adds or removes the current user's upvote.
   * @param id The request id
   */
  toggleVote: (id: number) =>
    apiRequest<FeatureRequestVoteResult>(`FeatureRequests/${id}/vote`, "POST"),

  /**
   * Sets the status and note on a request. Bot owner only.
   * @param id The request id
   * @param change The new status and note
   */
  setStatus: (id: number, change: FeatureRequestStatusChange) =>
    apiRequest<FeatureRequestEntry>(`FeatureRequests/${id}/status`, "POST", change),

  /**
   * Deletes a request. Bot owner only.
   * @param id The request id
   */
  deleteRequest: (id: number) => apiRequest<void>(`FeatureRequests/${id}`, "DELETE"),

  /**
   * Gets counts by status and category. Bot owner only.
   */
  getStats: () => apiRequest<FeatureRequestStats>("FeatureRequests/stats"),

  /**
   * Gets the report channel settings. Bot owner only.
   */
  getSettings: () => apiRequest<FeatureRequestSettings>("FeatureRequests/settings"),

  /**
   * Updates the report channel. Bot owner only.
   * @param channelId The channel, or 0n for the join/leave channel fallback
   */
  setSettings: (channelId: bigint) =>
    apiRequest<FeatureRequestSettings>("FeatureRequests/settings", "POST", { channelId }),
};
