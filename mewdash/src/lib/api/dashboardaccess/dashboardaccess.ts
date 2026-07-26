// lib/api/dashboardaccess/dashboardaccess.ts
import { apiRequest } from "../core";
import type {
  DashboardAccessGrant,
  DashboardAccessManager,
  DashboardAccessSettings,
  DashboardAccessTargetRequest,
  UpsertDashboardAccessGrantRequest,
} from "./models";

/**
 * Restricted dashboard access API
 * Maps to Mewdeko.Controllers.DashboardAccessController
 */
export const dashboardAccessApi = {
  /**
   * Gets the access-management settings and the current user's authority for a guild
   * @param guildId The guild ID
   */
  getSettings: (guildId: bigint) =>
    apiRequest<DashboardAccessSettings>(`DashboardAccess/${guildId}/settings`),

  /**
   * Updates the owner-controlled setting that lets Administrator/ManageGuild members manage access grants
   * @param guildId The guild ID
   * @param adminsCanManageAccess Whether Discord administrators and Manage Guild members may manage access grants
   */
  updateSettings: (guildId: bigint, adminsCanManageAccess: boolean) =>
    apiRequest<void>(`DashboardAccess/${guildId}/settings`, "PUT", { adminsCanManageAccess }),

  /**
   * Lists explicit access-list managers for a guild (owner only)
   * @param guildId The guild ID
   */
  getManagers: (guildId: bigint) =>
    apiRequest<DashboardAccessManager[]>(`DashboardAccess/${guildId}/managers`),

  /**
   * Appoints a user or role as an explicit access-list manager (owner only)
   * @param guildId The guild ID
   * @param target The user or role to appoint
   */
  addManager: (guildId: bigint, target: DashboardAccessTargetRequest) =>
    apiRequest<DashboardAccessManager>(`DashboardAccess/${guildId}/managers`, "POST", target),

  /**
   * Removes an explicit access-list manager (owner only)
   * @param guildId The guild ID
   * @param id The manager entry's database ID
   */
  removeManager: (guildId: bigint, id: number) =>
    apiRequest<void>(`DashboardAccess/${guildId}/managers/${id}`, "DELETE"),

  /**
   * Lists restricted dashboard access grants for a guild
   * @param guildId The guild ID
   */
  getGrants: (guildId: bigint) =>
    apiRequest<DashboardAccessGrant[]>(`DashboardAccess/${guildId}/grants`),

  /**
   * Creates or replaces a user/role's restricted dashboard access grant
   * @param guildId The guild ID
   * @param request The target and section levels to grant
   */
  upsertGrant: (guildId: bigint, request: UpsertDashboardAccessGrantRequest) =>
    apiRequest<{ id: number }>(`DashboardAccess/${guildId}/grants`, "PUT", request),

  /**
   * Removes a user/role's restricted dashboard access grant
   * @param guildId The guild ID
   * @param id The grant's database ID
   */
  removeGrant: (guildId: bigint, id: number) =>
    apiRequest<void>(`DashboardAccess/${guildId}/grants/${id}`, "DELETE"),
};
