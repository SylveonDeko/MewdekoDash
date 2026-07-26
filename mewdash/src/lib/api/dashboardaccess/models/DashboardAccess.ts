// lib/api/dashboardaccess/models/DashboardAccess.ts

/**
 * Whether a dashboard access grant or manager entry targets a user or a role.
 * Maps to Mewdeko.Database.Enums.DashboardAccessTargetType
 */
export enum DashboardAccessTargetType {
  User = 0,
  Role = 1,
}

/**
 * How much access a dashboard access grant allows for a section.
 * Maps to Mewdeko.Database.Enums.DashboardAccessLevel
 */
export enum DashboardAccessLevel {
  None = 0,
  View = 1,
  Manage = 2,
}

/**
 * Access-management settings and the current user's authority for a guild.
 * Maps to Mewdeko.Controllers.Common.DashboardAccess.DashboardAccessSettingsResponse
 */
export interface DashboardAccessSettings {
  adminsCanManageAccess: boolean;
  canManageAccess: boolean;
  isGuildOwner: boolean;
}

/**
 * A user or role explicitly allowed to manage the dashboard access list for a guild.
 * Maps to Mewdeko.Controllers.Common.DashboardAccess.DashboardAccessManagerResponse
 */
export interface DashboardAccessManager {
  id: number;
  targetType: DashboardAccessTargetType;
  targetId: bigint;
  grantedBy: bigint;
  dateAdded: string | null;
}

/**
 * A restricted dashboard access grant with its resolved per-section levels.
 * Maps to Mewdeko.Controllers.Common.DashboardAccess.DashboardAccessGrantResponse
 */
export interface DashboardAccessGrant {
  id: number;
  targetType: DashboardAccessTargetType;
  targetId: bigint;
  sections: Record<string, DashboardAccessLevel>;
}

/**
 * Request body for a user/role target (manager appointment).
 * Maps to Mewdeko.Controllers.Common.DashboardAccess.DashboardAccessTargetRequest
 */
export interface DashboardAccessTargetRequest {
  targetType: DashboardAccessTargetType;
  targetId: bigint;
}

/**
 * Request body to create/replace a user/role's section grants.
 * Maps to Mewdeko.Controllers.Common.DashboardAccess.UpsertDashboardAccessGrantRequest
 */
export interface UpsertDashboardAccessGrantRequest extends DashboardAccessTargetRequest {
  sections: { section: string; level: DashboardAccessLevel }[];
}
