// lib/api/administration/models/Requests.ts

/**
 * Request model for setting channel state in delete message on command
 * Maps to Mewdeko.Controllers.Common.Administration.SetChannelStateRequest
 */
export interface SetChannelStateRequest {
  /** The ID of the channel to set state for */
  channelId: bigint;

  /** The state to set (enable, disable, inherit) */
  state: string;
}

/**
 * Request model for voice channel role management
 * Maps to Mewdeko.Controllers.Common.Administration.VoiceChannelRoleRequest
 */
export interface VoiceChannelRoleRequest {
  /** The ID of the voice channel */
  channelId: bigint;

  /** The ID of the role to assign when users join the voice channel */
  roleId: bigint;
}

/**
 * Request model for setting self-assignable role group
 * Maps to Mewdeko.Controllers.Common.Administration.SetGroupRequest
 */
export interface SetGroupRequest {
  /** The group number for the self-assignable roles */
  group: number;

  /** The display name for the group */
  name?: string | null;
}

/**
 * Reaction role data for requests
 * Maps to Mewdeko.Controllers.Common.Administration.ReactionRoleData
 */
export interface ReactionRoleData {
  /** The name or Unicode representation of the emote */
  emoteName: string;

  /** The ID of the role to assign when the reaction is added */
  roleId: bigint;
}

/**
 * Request model for adding reaction roles
 * Maps to Mewdeko.Controllers.Common.Administration.AddReactionRolesRequest
 */
export interface AddReactionRolesRequest {
  /** The ID of the message to add reaction roles to (null for new message) */
  messageId?: bigint | null;

  /** Whether the reaction roles are mutually exclusive */
  exclusive: boolean;

  /** The list of reaction roles to add */
  roles: ReactionRoleData[];
}

/**
 * Request model for setting guild timezone
 * Maps to Mewdeko.Controllers.Common.Administration.SetTimezoneRequest
 */
export interface SetTimezoneRequest {
  /** The timezone ID (e.g., "America/New_York", "UTC") */
  timezoneId: string;
}

/**
 * Request model for permission overrides
 * Maps to Mewdeko.Controllers.Common.Administration.PermissionOverrideRequest
 */
export interface PermissionOverrideRequest {
  /** The command name to override permissions for */
  command: string;

  /** The required permission level (Discord permission name) */
  permission: string;
}

/**
 * Request model for toggling game voice channel
 * Maps to Mewdeko.Controllers.Common.Administration.ToggleGameVoiceChannelRequest
 */
export interface ToggleGameVoiceChannelRequest {
  /** The ID of the voice channel to toggle as game voice channel */
  channelId: bigint;
}

/**
 * Request model for server recovery setup
 * Maps to Mewdeko.Controllers.Common.Administration.ServerRecoveryRequest
 */
export interface ServerRecoveryRequest {
  /** The recovery key for server restoration */
  recoveryKey: string;

  /** The two-factor authentication key for additional security */
  twoFactorKey: string;
}

/**
 * Request model for setting ban message
 * Maps to Mewdeko.Controllers.Common.Administration.SetBanMessageRequest
 */
export interface SetBanMessageRequest {
  /** The message to send to users when they are banned */
  message: string;
}

/**
 * Request model for mass ban operation
 * Maps to Mewdeko.Controllers.Common.Administration.MassBanRequest
 */
export interface MassBanRequest {
  /** The list of user IDs to ban */
  userIds: bigint[];

  /** The reason for the mass ban operation */
  reason?: string | null;
}

/**
 * Request model for mass rename operation
 * Maps to Mewdeko.Controllers.Common.Administration.MassRenameRequest
 */
export interface MassRenameRequest {
  /** The naming pattern for mass rename (use {username} placeholder) */
  pattern: string;
}

/**
 * Request model for pruning users
 * Maps to Mewdeko.Controllers.Common.Administration.PruneRequest
 */
export interface PruneRequest {
  /** The number of days of inactivity to prune users for */
  days: number;

  /** The reason for the prune operation */
  reason?: string | null;
}

/**
 * Request model for pruning messages to a specific message
 * Maps to Mewdeko.Controllers.Common.Administration.PruneToMessageRequest
 */
export interface PruneToMessageRequest {
  /** The ID of the channel to prune messages from */
  channelId: bigint;

  /** The ID of the message to prune up to (exclusive) */
  messageId: bigint;
}

/**
 * Request model for adding self-assignable role with group
 * Maps to Mewdeko.Controllers.Common.Administration.AddSelfAssignableRoleRequest
 */
export interface AddSelfAssignableRoleRequest {
  /** The group number for the self-assignable role (0 for no group) */
  group: number;
}

/**
 * Request to move permission
 */
export interface MovePermissionRequest {
  /** Source index */
  from: number;

  /** Target index */
  to: number;
}
