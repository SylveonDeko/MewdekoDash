// lib/api/rolestates/models/RoleState.ts

/**
 * Role state settings
 * Maps to DataModel.RoleStateSetting from Database/L2DB/RoleStateSetting.cs
 */
export interface RoleStateSetting {
  /** Primary key */
  id: number;

  /** Guild ID */
  guildId: bigint;

  /** Whether role states are enabled */
  enabled: boolean;

  /** Whether to clear saved roles on ban */
  clearOnBan: boolean;

  /** Whether to ignore bots */
  ignoreBots: boolean;

  /** Denied roles (comma-separated) */
  deniedRoles: string | null;

  /** Denied users (comma-separated) */
  deniedUsers: string | null;

  /** Date added */
  dateAdded: string | null;
}

/**
 * User role state
 */
export interface UserRoleState {
  /** User ID */
  userId: bigint;

  /** Guild ID */
  guildId: bigint;

  /** Saved roles (comma-separated) */
  savedRoles: string;

  /** Username */
  userName: string;
}
