// lib/api/permissions/permissions.ts
import { apiRequest } from "../core";
import type {
  PermissionCache,
  Permission,
  DpoRequest,
  MovePermissionRequest,
  DiscordPermissionOverride,
} from "./models";
import type { Module } from "../administration/models";

/**
 * Permissions API
 * Maps to Mewdeko.Controllers.PermissionsController
 */
export const permissionsApi = {
  // ============================================
  // Discord Permission Overrides (DPO)
  // ============================================

  /**
   * Gets all Discord permission overrides for a guild
   * @param guildId The guild ID
   * @returns Collection of permission overrides
   */
  getPermissionOverrides: (guildId: bigint) =>
    apiRequest<DiscordPermissionOverride[]>(`Permissions/dpo/${guildId}`),

  /**
   * Adds a Discord permission override
   * @param guildId The guild ID
   * @param request Permission override configuration
   * @returns Created override
   */
  addDpo: (guildId: bigint, request: DpoRequest) =>
    apiRequest<any>(`Permissions/dpo/${guildId}`, "POST", request),

  /**
   * Removes a Discord permission override
   * @param guildId The guild ID
   * @param commandName The command name
   */
  removeDpo: (guildId: bigint, commandName: string) =>
    apiRequest<void>(`Permissions/dpo/${guildId}`, "DELETE", commandName),

  // ============================================
  // Regular Permissions
  // ============================================

  /**
   * Gets regular permissions for a guild
   * @param guildId The guild ID
   * @returns Permission cache
   */
  getPermissions: (guildId: bigint) =>
    apiRequest<PermissionCache>(`Permissions/regular/${guildId}`),

  /**
   * Adds a new permission
   * @param guildId The guild ID
   * @param permission Permission to add
   */
  addPermission: (
    guildId: bigint,
    permission: Omit<Permission, "guildConfigId">,
  ) =>
    apiRequest<void>(`Permissions/regular/${guildId}`, "POST", {
      ...permission,
      primaryTargetId: permission.primaryTargetId.toString(),
      isCustomCommand: permission.isCustomCommand ?? false,
      secondaryTargetName: permission.secondaryTargetName || "*",
    }),

  /**
   * Removes a permission by index
   * @param guildId The guild ID
   * @param index Permission index
   */
  removePermission: (guildId: bigint, index: number) =>
    apiRequest<void>(`Permissions/regular/${guildId}/${index}`, "DELETE"),

  /**
   * Moves a permission to a new position
   * @param guildId The guild ID
   * @param from Source index
   * @param to Destination index
   */
  movePermission: (guildId: bigint, from: number, to: number) =>
    apiRequest<void>(`Permissions/regular/${guildId}/move`, "POST", {
      from,
      to,
    } as MovePermissionRequest),

  /**
   * Resets all permissions for a guild
   * @param guildId The guild ID
   */
  resetPermissions: (guildId: bigint) =>
    apiRequest<void>(`Permissions/regular/${guildId}/reset`, "POST"),

  /**
   * Sets verbose mode for permissions
   * @param guildId The guild ID
   * @param verbose Whether to enable verbose mode
   */
  setVerbose: (guildId: bigint, verbose: boolean) =>
    apiRequest<void>(`Permissions/regular/${guildId}/verbose`, "POST", {
      verbose,
    }),

  /**
   * Sets the permission role for the guild
   * @param guildId The guild ID
   * @param roleId The permission role ID as string
   */
  setPermissionRole: (guildId: bigint, roleId: string) =>
    apiRequest<void>(`Permissions/regular/${guildId}/role`, "POST", roleId),

  /**
   * Gets all commands and modules
   * @returns List of modules with their commands
   */
  getCommandsAndModules: () => apiRequest<Module[]>(`Permissions/commands`),
};
