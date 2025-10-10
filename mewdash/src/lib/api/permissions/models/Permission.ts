// lib/api/permissions/models/Permission.ts

/**
 * Permission cache for a guild
 */
export interface PermissionCache {
  /** Guild ID */
  guildId: bigint;

  /** Permissions list */
  permissions: Permission[];

  /** Verbose mode enabled */
  verbose: boolean;

  /** Permission role ID */
  permissionRole: string | null;
}

/**
 * Individual permission entry
 */
export interface Permission {
  /** Permission ID */
  id: number;

  /** Guild config ID */
  guildConfigId: number;

  /** Permission index (order) */
  index: number;

  /** Primary target ID (role/user/channel) */
  primaryTargetId: bigint;

  /** Primary target type (0=Role, 1=User, 2=Channel) */
  primaryTargetType: number;

  /** Secondary target name (command name) */
  secondaryTargetName: string;

  /** Secondary target type (0=Command, 1=Module, 2=All) */
  secondaryTargetType: number;

  /** Permission state (true=allow, false=deny) */
  state: boolean;

  /** Guild ID */
  guildId: bigint;

  /** Whether this is for a custom command */
  isCustomCommand: boolean;
}

/**
 * Discord permission override request
 * Maps to Mewdeko.Controllers.Common.Permissions.DpoRequest
 */
export interface DpoRequest {
  /** The command name to apply permissions to */
  command: string;

  /** The Discord permissions value */
  permissions: bigint;
}

/**
 * Move permission request
 * Maps to Mewdeko.Controllers.Common.Permissions.MovePermRequest
 */
export interface MovePermissionRequest {
  /** The source index to move from */
  from: number;

  /** The destination index to move to */
  to: number;
}

/**
 * Discord permission override
 */
export interface DiscordPermissionOverride {
  /** Command name */
  command: string;

  /** Required permission */
  permission: string;
}
