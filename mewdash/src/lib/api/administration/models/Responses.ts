// lib/api/administration/models/Responses.ts

/**
 * Auto-assign role response
 */
export interface AutoAssignRoles {
  /** Roles assigned to normal users */
  normalRoles: bigint[];

  /** Roles assigned to bot users */
  botRoles: bigint[];
}

/**
 * Server recovery status
 */
export interface ServerRecoveryStatus {
  /** Whether server recovery is set up */
  isSetup: boolean;

  /** The recovery key (if setup) */
  recoveryKey?: string | null;
}

/**
 * Permission override
 */
export interface PermissionOverride {
  /** Command name */
  command: string;

  /** Required permission */
  permission: string;
}

/**
 * Command information
 */
export interface Command {
  /** Bot version */
  botVersion: string;

  /** Command name */
  commandName: string;

  /** Command description */
  description: string;

  /** Usage examples */
  example: string[];

  /** Required guild user permissions */
  guildUserPermissions: string;

  /** Required channel user permissions */
  channelUserPermissions: string;

  /** Required guild bot permissions */
  guildBotPermissions: string;

  /** Required channel bot permissions */
  channelBotPermissions: string;

  /** Whether the command requires Dragon level */
  isDragon: boolean;
}

/**
 * Module with commands
 */
export interface Module {
  /** Module name */
  name: string;

  /** Commands in this module */
  commands: Command[];
}

/**
 * Timezone information
 */
export interface TimezoneInfo {
  /** Timezone ID */
  id: string;

  /** Display name */
  displayName: string;

  /** Current offset from UTC */
  offset: string;
}

/**
 * Self-assignable role
 */
export interface SelfAssignableRole {
  /** Role ID */
  roleId: bigint;

  /** Role name */
  roleName: string;

  /** Group number */
  group: number;

  /** Level requirement (if XP-based) */
  levelRequirement: number;
}

/**
 * Voice channel role
 */
export interface VoiceChannelRole {
  /** Channel ID */
  channelId: bigint;

  /** Channel name */
  channelName: string;

  /** Role ID */
  roleId: bigint;

  /** Role name */
  roleName: string;
}

/**
 * Auto-ban role
 */
export interface AutoBanRole {
  /** Role ID */
  roleId: bigint;

  /** Role name */
  roleName: string;
}

/**
 * Reaction role (individual emoji-to-role mapping)
 */
export interface ReactionRole {
  /** Emoji name or unicode */
  emoteName: string;

  /** Role ID to assign */
  roleId: bigint;
}

/**
 * Reaction role message
 */
export interface ReactionRoleMessage {
  /** Database index (used for removal) */
  index: number;

  /** Message ID */
  messageId: bigint;

  /** Channel ID */
  channelId: bigint;

  /** Whether roles are exclusive */
  exclusive: boolean;

  /** Reaction roles */
  reactionRoles: ReactionRole[];
}

/**
 * Get reaction roles response
 */
export interface GetReactionRolesResponse {
  /** Whether any reaction roles exist */
  success: boolean;

  /** List of reaction role messages */
  reactionRoles: ReactionRoleMessage[];
}

/**
 * Command cooldown
 */
export interface CommandCooldown {
  /** Command name */
  commandName: string;

  /** Cooldown in seconds */
  seconds: number;
}
