// lib/api/rolestates/rolestates.ts
import { apiRequest } from "../core";
import type { RoleStateSetting, UserRoleState } from "./models";

/**
 * Role states API
 * Maps to Mewdeko.Controllers.RoleStatesController
 */
export const roleStatesApi = {
  /**
   * Gets role state settings for a guild
   * @param guildId The guild ID
   * @returns Role state settings
   */
  getRoleStateSettings: (guildId: bigint) =>
    apiRequest<RoleStateSetting>(`RoleStates/${guildId}/settings`),

  /**
   * Toggles role state functionality for a guild
   * @param guildId The guild ID
   * @returns New enabled status
   */
  toggleRoleStates: (guildId: bigint) =>
    apiRequest<boolean>(`RoleStates/${guildId}/toggle`, "POST"),

  /**
   * Gets role state for a specific user
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns User role state
   */
  getUserRoleState: (guildId: bigint, userId: bigint) =>
    apiRequest<UserRoleState>(`RoleStates/${guildId}/user/${userId}`),

  /**
   * Gets all role states in a guild
   * @param guildId The guild ID
   * @returns Collection of all user role states
   */
  getAllRoleStates: (guildId: bigint) =>
    apiRequest<UserRoleState[]>(`RoleStates/${guildId}/all`),

  /**
   * Adds roles to a user's role state
   * @param guildId The guild ID
   * @param userId The user ID
   * @param roleIds List of role IDs to add
   */
  addRolesToUser: (guildId: bigint, userId: bigint, roleIds: bigint[]) =>
    apiRequest<void>(
      `RoleStates/${guildId}/user/${userId}/roles`,
      "POST",
      roleIds,
    ),

  /**
   * Removes roles from a user's role state
   * @param guildId The guild ID
   * @param userId The user ID
   * @param roleIds List of role IDs to remove
   */
  removeRolesFromUser: (guildId: bigint, userId: bigint, roleIds: bigint[]) =>
    apiRequest<void>(
      `RoleStates/${guildId}/user/${userId}/roles`,
      "DELETE",
      roleIds,
    ),

  /**
   * Deletes a user's role state
   * @param guildId The guild ID
   * @param userId The user ID
   */
  deleteUserRoleState: (guildId: bigint, userId: bigint) =>
    apiRequest<void>(`RoleStates/${guildId}/user/${userId}`, "DELETE"),

  /**
   * Applies one user's role state to another user
   * @param guildId The guild ID
   * @param sourceUserId Source user ID
   * @param targetUserId Target user ID
   */
  applyRoleState: (
    guildId: bigint,
    sourceUserId: bigint,
    targetUserId: bigint,
  ) =>
    apiRequest<void>(
      `RoleStates/${guildId}/user/${sourceUserId}/apply/${targetUserId}`,
      "POST",
    ),

  /**
   * Sets roles for a user manually
   * @param guildId The guild ID
   * @param userId The user ID
   * @param roleIds List of role IDs to set
   */
  setUserRoles: (guildId: bigint, userId: bigint, roleIds: bigint[]) =>
    apiRequest<void>(
      `RoleStates/${guildId}/user/${userId}/set-roles`,
      "POST",
      roleIds,
    ),

  /**
   * Toggles the option to clear saved roles upon a user's ban
   * @param guildId The guild ID
   * @returns New clear on ban status
   */
  toggleClearOnBan: (guildId: bigint) =>
    apiRequest<boolean>(`RoleStates/${guildId}/clear-on-ban`, "POST", {}),

  /**
   * Toggles the option to ignore bots when saving and restoring roles
   * @param guildId The guild ID
   * @returns New ignore bots status
   */
  toggleIgnoreBots: (guildId: bigint) =>
    apiRequest<boolean>(`RoleStates/${guildId}/ignore-bots`, "POST", {}),

  /**
   * Updates the role state settings for a guild
   * @param guildId The guild ID
   * @param settings Settings to update
   */
  updateRoleStateSettings: (guildId: bigint, settings: RoleStateSetting) =>
    apiRequest<void>(`RoleStates/${guildId}/settings`, "POST", settings),

  /**
   * Saves the current role states of all users in a guild
   * @param guildId The guild ID
   * @returns Number of saved states and any error message
   */
  saveAllUserRoleStates: (guildId: bigint) =>
    apiRequest<{ savedCount: number; errorMessage: string }>(
      `RoleStates/${guildId}/save-all`,
      "POST",
    ),
};
