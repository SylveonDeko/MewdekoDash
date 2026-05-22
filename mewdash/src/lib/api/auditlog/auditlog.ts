// lib/api/auditlog/auditlog.ts
import { apiRequest } from "../core";
import type { AuditLogPage, AuditLogQuery } from "./models";

/**
 * Dashboard Audit Log API
 * Maps to Mewdeko.Controllers.AuditLogController
 */
export const auditLogApi = {
  /**
   * Gets a page of dashboard audit log entries for a guild, newest first.
   * @param guildId The guild ID
   * @param query Optional filters (user, action, section, date range, paging)
   * @returns A page of audit log entries plus the total count
   */
  getAuditLog: (guildId: bigint, query: AuditLogQuery = {}) => {
    const params = new URLSearchParams();
    if (query.userId != null) params.set("userId", query.userId.toString());
    if (query.action != null) params.set("action", query.action.toString());
    if (query.section) params.set("section", query.section);
    if (query.after) params.set("after", query.after);
    if (query.before) params.set("before", query.before);
    if (query.page != null) params.set("page", query.page.toString());
    if (query.pageSize != null) params.set("pageSize", query.pageSize.toString());

    const qs = params.toString();
    const suffix = qs ? `?${qs}` : "";
    return apiRequest<AuditLogPage>(`AuditLog/${guildId}${suffix}`);
  },
};
