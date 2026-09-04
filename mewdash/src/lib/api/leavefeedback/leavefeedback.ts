// lib/api/leavefeedback/leavefeedback.ts
import { apiRequest } from "../core";
import type {
  LeaveFeedbackPage,
  LeaveFeedbackQuery,
  LeaveFeedbackSettings,
  LeaveFeedbackSettingsRequest,
  LeaveFeedbackStats,
} from "./models";

/**
 * Leave Feedback API
 * Maps to Mewdeko.Controllers.LeaveFeedbackController
 */
export const leaveFeedbackApi = {
  /**
   * Gets a page of leave feedback records, newest first.
   * @param query Optional filters (reason, status, search, paging)
   * @returns A page of records plus the total count
   */
  getFeedback: (query: LeaveFeedbackQuery = {}) => {
    const params = new URLSearchParams();
    if (query.reason) params.set("reason", query.reason);
    if (query.status) params.set("status", query.status);
    if (query.search) params.set("search", query.search);
    if (query.page != null) params.set("page", query.page.toString());
    if (query.pageSize != null) params.set("pageSize", query.pageSize.toString());

    const qs = params.toString();
    return apiRequest<LeaveFeedbackPage>(`LeaveFeedback${qs ? `?${qs}` : ""}`);
  },

  /**
   * Gets aggregate counts by status and by reason.
   */
  getStats: () => apiRequest<LeaveFeedbackStats>("LeaveFeedback/stats"),

  /**
   * Gets the bot wide settings, with the effective report channel resolved.
   */
  getSettings: () => apiRequest<LeaveFeedbackSettings>("LeaveFeedback/settings"),

  /**
   * Updates the bot wide settings.
   * @param settings The new enabled flag and report channel
   */
  setSettings: (settings: LeaveFeedbackSettingsRequest) =>
    apiRequest<LeaveFeedbackSettings>("LeaveFeedback/settings", "POST", settings),

  /**
   * Deletes a feedback record.
   * @param id The record id to delete
   */
  deleteFeedback: (id: number) => apiRequest<void>(`LeaveFeedback/${id}`, "DELETE"),
};
