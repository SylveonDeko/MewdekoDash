// lib/api/administration/administration.ts
import { apiRequest } from "../core";
import type {
  AddReactionRolesRequest,
  AddSelfAssignableRoleRequest,
  AntiAltConfig,
  AntiMassMentionConfig,
  AntiMassPostConfig,
  AntiPostChannelConfig,
  AntiRaidConfig,
  AntiSpamConfig,
  AutoAssignRoles,
  AutoBanRole,
  CommandCooldown,
  MassBanRequest,
  MassRenameRequest,
  Module,
  MovePermissionRequest,
  PermissionOverride,
  PermissionOverrideRequest,
  ProtectionStats,
  ProtectionStatus,
  PruneRequest,
  PruneToMessageRequest,
  ReactionRoleMessage,
  SelfAssignableRole,
  ServerRecoveryRequest,
  ServerRecoveryStatus,
  SetBanMessageRequest,
  SetChannelStateRequest,
  SetGroupRequest,
  SetTimezoneRequest,
  TimezoneInfo,
  ToggleGameVoiceChannelRequest,
  VoiceChannelRole,
  VoiceChannelRoleRequest
} from "./models";

/**
 * Administration API - Comprehensive guild management
 * Maps to Mewdeko.Controllers.AdministrationController
 * This is a large controller with 60+ endpoints
 */
export const administrationApi = {
  // ============================================
  // Auto-Assign Roles
  // ============================================

  /**
   * Gets auto-assign role settings for normal users and bots
   * @param guildId The guild ID
   * @returns Auto-assign role configuration
   */
  getAutoAssignRoles: (guildId: bigint) =>
    apiRequest<AutoAssignRoles>(`Administration/${guildId}/auto-assign-roles`),

  /**
   * Sets auto-assign roles for normal users
   * @param guildId The guild ID
   * @param roleIds List of role IDs to auto-assign
   */
  setAutoAssignRoles: (guildId: bigint, roleIds: bigint[]) =>
    apiRequest<void>(
      `Administration/${guildId}/auto-assign-roles/normal`,
      "POST",
      roleIds,
    ),

  /**
   * Sets auto-assign roles for bots
   * @param guildId The guild ID
   * @param roleIds List of role IDs to auto-assign to bots
   */
  setBotAutoAssignRoles: (guildId: bigint, roleIds: bigint[]) =>
    apiRequest<void>(
      `Administration/${guildId}/auto-assign-roles/bots`,
      "POST",
      roleIds,
    ),

  /**
   * Toggles an auto-assign role for normal users
   * @param guildId The guild ID
   * @param roleId The role ID to toggle
   * @returns Updated list of auto-assign roles
   */
  toggleAutoAssignRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<bigint[]>(
      `Administration/${guildId}/auto-assign-roles/normal/${roleId}/toggle`,
      "POST",
    ),

  /**
   * Toggles an auto-assign role for bots
   * @param guildId The guild ID
   * @param roleId The role ID to toggle
   * @returns Updated list of bot auto-assign roles
   */
  toggleBotAutoAssignRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<bigint[]>(
      `Administration/${guildId}/auto-assign-roles/bots/${roleId}/toggle`,
      "POST",
    ),

  // ============================================
  // Protection System
  // ============================================

  /**
   * Gets current protection settings status
   * @param guildId The guild ID
   * @returns All protection system statuses
   */
  getProtectionStatus: (guildId: bigint) =>
    apiRequest<ProtectionStatus>(`Administration/${guildId}/protection/status`),

  /**
   * Gets protection statistics
   * @param guildId The guild ID
   * @returns Protection trigger statistics
   */
  getProtectionStats: (guildId: bigint) =>
    apiRequest<ProtectionStats>(
      `Administration/${guildId}/protection/statistics`,
    ),

  /**
   * Configures anti-raid protection
   * @param guildId The guild ID
   * @param config Anti-raid configuration
   */
  configureAntiRaid: (guildId: bigint, config: AntiRaidConfig) =>
    apiRequest<{ success: boolean; settings?: any }>(
      `Administration/${guildId}/protection/anti-raid`,
      "PUT",
      config,
    ),

  /**
   * Configures anti-spam protection
   * @param guildId The guild ID
   * @param config Anti-spam configuration
   */
  configureAntiSpam: (guildId: bigint, config: AntiSpamConfig) =>
    apiRequest<{ success: boolean }>(
      `Administration/${guildId}/protection/anti-spam`,
      "PUT",
      config,
    ),

  /**
   * Toggles ignored channel for anti-spam
   * @param guildId The guild ID
   * @param channelId The channel ID to toggle
   * @returns Whether channel was added to ignore list
   */
  toggleAntiSpamIgnoredChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<{ added: boolean }>(
      `Administration/${guildId}/protection/anti-spam/ignored-channels/${channelId}`,
      "POST",
    ),

  /**
   * Configures anti-alt protection
   * @param guildId The guild ID
   * @param config Anti-alt configuration
   */
  configureAntiAlt: (guildId: bigint, config: AntiAltConfig) =>
    apiRequest<void>(
      `Administration/${guildId}/protection/anti-alt`,
      "PUT",
      config,
    ),

  /**
   * Configures anti-mass mention protection
   * @param guildId The guild ID
   * @param config Anti-mass mention configuration
   */
  configureAntiMassMention: (guildId: bigint, config: AntiMassMentionConfig) =>
    apiRequest<void>(
      `Administration/${guildId}/protection/anti-mass-mention`,
      "PUT",
      config,
    ),

  /**
   * Configures anti-mass-post protection
   * @param guildId The guild ID
   * @param config Anti-mass-post configuration
   */
  configureAntiMassPost: (guildId: bigint, config: AntiMassPostConfig) =>
    apiRequest<{ success: boolean }>(
      `Administration/${guildId}/protection/anti-mass-post`,
      "PUT",
      config,
    ),

  /**
   * Configures anti-post-channel protection
   * @param guildId The guild ID
   * @param config Anti-post-channel configuration
   */
  configureAntiPostChannel: (guildId: bigint, config: AntiPostChannelConfig) =>
    apiRequest<{ success: boolean }>(
      `Administration/${guildId}/protection/anti-post-channel`,
      "PUT",
      config,
    ),

  /**
   * Adds a honeypot channel to anti-post-channel protection
   * @param guildId The guild ID
   * @param channelId The channel ID to add as honeypot
   */
  addAntiPostChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<{ success: boolean }>(
      `Administration/${guildId}/protection/anti-post-channel/channels/${channelId}`,
      "POST",
    ),

  /**
   * Removes a honeypot channel from anti-post-channel protection
   * @param guildId The guild ID
   * @param channelId The channel ID to remove
   */
  removeAntiPostChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<{ success: boolean }>(
      `Administration/${guildId}/protection/anti-post-channel/channels/${channelId}`,
      "DELETE",
    ),

  /**
   * Gets list of honeypot channels
   * @param guildId The guild ID
   * @returns List of honeypot channel IDs
   */
  getAntiPostChannelChannels: (guildId: bigint) =>
    apiRequest<bigint[]>(
      `Administration/${guildId}/protection/anti-post-channel/channels`,
    ),

  /**
   * Toggles an ignored role for anti-post-channel protection
   * @param guildId The guild ID
   * @param roleId The role ID to toggle
   * @returns Whether role was added (true) or removed (false)
   */
  toggleAntiPostChannelIgnoredRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<{ added: boolean }>(
      `Administration/${guildId}/protection/anti-post-channel/ignored-roles/${roleId}`,
      "POST",
    ),

  /**
   * Gets list of ignored roles for anti-post-channel
   * @param guildId The guild ID
   * @returns List of ignored role IDs
   */
  getAntiPostChannelIgnoredRoles: (guildId: bigint) =>
    apiRequest<bigint[]>(
      `Administration/${guildId}/protection/anti-post-channel/ignored-roles`,
    ),

  /**
   * Toggles an ignored user for anti-post-channel protection
   * @param guildId The guild ID
   * @param userId The user ID to toggle
   * @returns Whether user was added (true) or removed (false)
   */
  toggleAntiPostChannelIgnoredUser: (guildId: bigint, userId: bigint) =>
    apiRequest<{ added: boolean }>(
      `Administration/${guildId}/protection/anti-post-channel/ignored-users/${userId}`,
      "POST",
    ),

  /**
   * Gets list of ignored users for anti-post-channel
   * @param guildId The guild ID
   * @returns List of ignored user IDs
   */
  getAntiPostChannelIgnoredUsers: (guildId: bigint) =>
    apiRequest<bigint[]>(
      `Administration/${guildId}/protection/anti-post-channel/ignored-users`,
    ),

  // ============================================
  // Self-Assignable Roles
  // ============================================

  /**
   * Gets all self-assignable roles
   * @param guildId The guild ID
   * @returns List of self-assignable roles
   */
  getSelfAssignableRoles: (guildId: bigint) =>
    apiRequest<SelfAssignableRole[]>(
      `Administration/${guildId}/self-assignable-roles`,
    ),

  /**
   * Adds a self-assignable role
   * @param guildId The guild ID
   * @param roleId The role ID to add
   * @param request Optional group configuration
   */
  addSelfAssignableRole: (
    guildId: bigint,
    roleId: bigint,
    request?: AddSelfAssignableRoleRequest,
  ) =>
    apiRequest<void>(
      `Administration/${guildId}/self-assignable-roles/${roleId}`,
      "POST",
      request,
    ),

  /**
   * Removes a self-assignable role
   * @param guildId The guild ID
   * @param roleId The role ID to remove
   */
  removeSelfAssignableRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<void>(
      `Administration/${guildId}/self-assignable-roles/${roleId}`,
      "DELETE",
    ),

  /**
   * Sets group for self-assignable roles
   * @param guildId The guild ID
   * @param request Group configuration
   */
  setSelfAssignableRoleGroup: (guildId: bigint, request: SetGroupRequest) =>
    apiRequest<void>(
      `Administration/${guildId}/self-assignable-roles/groups`,
      "POST",
      request,
    ),

  /**
   * Toggles exclusive mode for self-assignable roles
   * @param guildId The guild ID
   * @returns New exclusive state
   */
  toggleSelfAssignableRoleExclusive: (guildId: bigint) =>
    apiRequest<boolean>(
      `Administration/${guildId}/self-assignable-roles/exclusive/toggle`,
      "POST",
    ),

  /**
   * Sets level requirement for a self-assignable role
   * @param guildId The guild ID
   * @param roleId The role ID
   * @param level Level requirement
   */
  setSelfAssignableRoleLevel: (
    guildId: bigint,
    roleId: bigint,
    level: number,
  ) =>
    apiRequest<void>(
      `Administration/${guildId}/self-assignable-roles/${roleId}/level`,
      "POST",
      level,
    ),

  /**
   * Toggles auto-delete for self-assigned role messages
   * @param guildId The guild ID
   * @returns New auto-delete state
   */
  toggleSelfAssignableRoleAutoDelete: (guildId: bigint) =>
    apiRequest<boolean>(
      `Administration/${guildId}/self-assignable-roles/auto-delete/toggle`,
      "POST",
    ),

  // ============================================
  // Staff & Member Roles
  // ============================================

  /**
   * Gets the staff role for a guild
   * @param guildId The guild ID
   * @returns Staff role ID
   */
  getStaffRole: (guildId: bigint) =>
    apiRequest<bigint>(`Administration/${guildId}/staff-role`),

  /**
   * Sets the staff role for a guild
   * @param guildId The guild ID
   * @param roleId The staff role ID
   */
  setStaffRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<void>(`Administration/${guildId}/staff-role`, "POST", roleId),

  /**
   * Gets the member role for a guild
   * @param guildId The guild ID
   * @returns Member role ID
   */
  getMemberRole: (guildId: bigint) =>
    apiRequest<bigint>(`Administration/${guildId}/member-role`),

  /**
   * Sets the member role for a guild
   * @param guildId The guild ID
   * @param roleId The member role ID
   */
  setMemberRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<void>(`Administration/${guildId}/member-role`, "POST", roleId),

  // ============================================
  // Delete Message On Command
  // ============================================

  /**
   * Gets delete message on command setting
   * @param guildId The guild ID
   * @returns Delete message setting
   */
  getDeleteMessageOnCommand: (guildId: bigint) =>
    apiRequest<boolean>(`Administration/${guildId}/delete-message-on-command`),

  /**
   * Toggles delete message on command
   * @param guildId The guild ID
   * @returns New setting value
   */
  toggleDeleteMessageOnCommand: (guildId: bigint) =>
    apiRequest<boolean>(
      `Administration/${guildId}/delete-message-on-command/toggle`,
      "POST",
    ),

  /**
   * Sets channel state for delete message on command
   * @param guildId The guild ID
   * @param request Channel state configuration
   */
  setDeleteMessageOnCommandChannel: (
    guildId: bigint,
    request: SetChannelStateRequest,
  ) =>
    apiRequest<void>(
      `Administration/${guildId}/delete-message-on-command/channel`,
      "POST",
      request,
    ),

  // ============================================
  // Stats & Privacy
  // ============================================

  /**
   * Toggles stats opt-out
   * @param guildId The guild ID
   * @returns New opt-out status
   */
  toggleStatsOptOut: (guildId: bigint) =>
    apiRequest<boolean>(
      `Administration/${guildId}/stats-opt-out/toggle`,
      "POST",
    ),

  /**
   * Deletes all stats data for the guild
   * @param guildId The guild ID
   */
  deleteStatsData: (guildId: bigint) =>
    apiRequest<void>(`Administration/${guildId}/stats-data`, "DELETE"),

  // ============================================
  // Auto-Ban Roles
  // ============================================

  /**
   * Gets auto-ban roles
   * @param guildId The guild ID
   * @returns List of auto-ban roles
   */
  getAutoBanRoles: (guildId: bigint) =>
    apiRequest<AutoBanRole[]>(`Administration/${guildId}/auto-ban-roles`),

  /**
   * Adds an auto-ban role
   * @param guildId The guild ID
   * @param roleId The role ID that triggers auto-ban
   */
  addAutoBanRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<void>(
      `Administration/${guildId}/auto-ban-roles`,
      "POST",
      roleId,
    ),

  /**
   * Removes an auto-ban role
   * @param guildId The guild ID
   * @param roleId The role ID to remove
   */
  removeAutoBanRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<void>(
      `Administration/${guildId}/auto-ban-roles/${roleId}`,
      "DELETE",
    ),

  // ============================================
  // Voice Channel Roles
  // ============================================

  /**
   * Gets voice channel role assignments
   * @param guildId The guild ID
   * @returns List of voice channel roles
   */
  getVoiceChannelRoles: (guildId: bigint) =>
    apiRequest<VoiceChannelRole[]>(
      `Administration/${guildId}/voice-channel-roles`,
    ),

  /**
   * Adds a voice channel role
   * @param guildId The guild ID
   * @param request Voice channel role configuration
   */
  addVoiceChannelRole: (guildId: bigint, request: VoiceChannelRoleRequest) =>
    apiRequest<void>(
      `Administration/${guildId}/voice-channel-roles`,
      "POST",
      request,
    ),

  /**
   * Removes a voice channel role
   * @param guildId The guild ID
   * @param channelId The channel ID
   */
  removeVoiceChannelRole: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(
      `Administration/${guildId}/voice-channel-roles/${channelId}`,
      "DELETE",
    ),

  // ============================================
  // Reaction Roles
  // ============================================

  /**
   * Gets all reaction role messages
   * @param guildId The guild ID
   * @returns Reaction role messages with success status
   */
  getReactionRoles: (guildId: bigint) =>
    apiRequest<{ success: boolean; reactionRoles: ReactionRoleMessage[] }>(
      `Administration/${guildId}/reaction-roles`,
    ),

  /**
   * Adds reaction roles to a message
   * @param guildId The guild ID
   * @param request Reaction roles configuration
   */
  addReactionRoles: (guildId: bigint, request: AddReactionRolesRequest) =>
    apiRequest<void>(
      `Administration/${guildId}/reaction-roles`,
      "POST",
      request,
    ),

  /**
   * Removes reaction roles by index
   * @param guildId The guild ID
   * @param index The index of the reaction role message
   */
  removeReactionRoles: (guildId: bigint, index: number) =>
    apiRequest<void>(
      `Administration/${guildId}/reaction-roles/${index}`,
      "DELETE",
    ),

  // ============================================
  // Timezones
  // ============================================

  /**
   * Gets all available timezones
   * @param guildId The guild ID
   * @returns List of available timezones
   */
  getTimezones: (guildId: bigint) =>
    apiRequest<TimezoneInfo[]>(`Administration/${guildId}/timezones`),

  /**
   * Gets the guild's current timezone
   * @param guildId The guild ID
   * @returns Current timezone ID
   */
  getGuildTimezone: (guildId: bigint) =>
    apiRequest<string>(`Administration/${guildId}/timezone`),

  /**
   * Sets the guild's timezone
   * @param guildId The guild ID
   * @param request Timezone configuration
   */
  setGuildTimezone: (guildId: bigint, request: SetTimezoneRequest) =>
    apiRequest<void>(`Administration/${guildId}/timezone`, "POST", request),

  // ============================================
  // Permission Overrides
  // ============================================

  /**
   * Gets permission overrides
   * @param guildId The guild ID
   * @returns List of permission overrides
   */
  getPermissionOverrides: (guildId: bigint) =>
    apiRequest<PermissionOverride[]>(
      `Administration/${guildId}/permission-overrides`,
    ),

  /**
   * Adds a permission override
   * @param guildId The guild ID
   * @param request Permission override configuration
   */
  addPermissionOverride: (
    guildId: bigint,
    request: PermissionOverrideRequest,
  ) =>
    apiRequest<any>(
      `Administration/${guildId}/permission-overrides`,
      "POST",
      request,
    ),

  /**
   * Removes a permission override
   * @param guildId The guild ID
   * @param command The command name
   */
  removePermissionOverride: (guildId: bigint, command: string) =>
    apiRequest<void>(
      `Administration/${guildId}/permission-overrides/${command}`,
      "DELETE",
    ),

  /**
   * Clears all permission overrides
   * @param guildId The guild ID
   */
  clearAllPermissionOverrides: (guildId: bigint) =>
    apiRequest<void>(
      `Administration/${guildId}/permission-overrides`,
      "DELETE",
    ),

  // ============================================
  // Game Voice Channel
  // ============================================

  /**
   * Gets the game voice channel
   * @param guildId The guild ID
   * @returns Game voice channel ID or null
   */
  getGameVoiceChannel: (guildId: bigint) =>
    apiRequest<bigint | null>(`Administration/${guildId}/game-voice-channel`),

  /**
   * Toggles game voice channel
   * @param guildId The guild ID
   * @param request Channel configuration
   * @returns Channel ID or null
   */
  toggleGameVoiceChannel: (
    guildId: bigint,
    request: ToggleGameVoiceChannelRequest,
  ) =>
    apiRequest<bigint | null>(
      `Administration/${guildId}/game-voice-channel/toggle`,
      "POST",
      request,
    ),

  // ============================================
  // Server Recovery
  // ============================================

  /**
   * Gets server recovery status
   * @param guildId The guild ID
   * @returns Server recovery status
   */
  getServerRecoveryStatus: (guildId: bigint) =>
    apiRequest<ServerRecoveryStatus>(
      `Administration/${guildId}/server-recovery`,
    ),

  /**
   * Sets up server recovery
   * @param guildId The guild ID
   * @param request Recovery configuration
   */
  setupServerRecovery: (guildId: bigint, request: ServerRecoveryRequest) =>
    apiRequest<void>(
      `Administration/${guildId}/server-recovery`,
      "POST",
      request,
    ),

  /**
   * Clears server recovery
   * @param guildId The guild ID
   */
  clearServerRecovery: (guildId: bigint) =>
    apiRequest<void>(`Administration/${guildId}/server-recovery`, "DELETE"),

  // ============================================
  // Ban Messages
  // ============================================

  /**
   * Gets the ban message template
   * @param guildId The guild ID
   * @returns Ban message template
   */
  getBanMessage: (guildId: bigint) =>
    apiRequest<string>(`Administration/${guildId}/ban-message`),

  /**
   * Sets the ban message template
   * @param guildId The guild ID
   * @param request Ban message configuration
   */
  setBanMessage: (guildId: bigint, request: SetBanMessageRequest) =>
    apiRequest<void>(`Administration/${guildId}/ban-message`, "POST", request),

  // ============================================
  // Mass Operations
  // ============================================

  /**
   * Mass ban users
   * @param guildId The guild ID
   * @param request Mass ban configuration
   * @returns Number of successful and failed bans
   */
  massBan: (guildId: bigint, request: MassBanRequest) =>
    apiRequest<{ succeeded: number; failed: number }>(
      `Administration/${guildId}/mass-ban`,
      "POST",
      request,
    ),

  /**
   * Mass rename users
   * @param guildId The guild ID
   * @param request Mass rename configuration
   * @returns Number of renamed users
   */
  massRename: (guildId: bigint, request: MassRenameRequest) =>
    apiRequest<{ renamed: number }>(
      `Administration/${guildId}/mass-rename`,
      "POST",
      request,
    ),

  /**
   * Prune inactive users
   * @param guildId The guild ID
   * @param request Prune configuration
   * @returns Number of pruned users
   */
  pruneUsers: (guildId: bigint, request: PruneRequest) =>
    apiRequest<{ pruned: number }>(
      `Administration/${guildId}/prune`,
      "POST",
      request,
    ),

  /**
   * Prune messages up to a specific message
   * @param guildId The guild ID
   * @param request Prune configuration
   * @returns Number of deleted messages
   */
  pruneToMessage: (guildId: bigint, request: PruneToMessageRequest) =>
    apiRequest<{ deleted: number }>(
      `Administration/${guildId}/prune-to`,
      "POST",
      request,
    ),

  // ============================================
  // Permissions Management
  // ============================================

  /**
   * Gets permissions for a guild
   * @param guildId The guild ID
   * @returns Permission cache
   */
  getPermissions: (guildId: bigint) =>
    apiRequest<any>(`Administration/${guildId}/permissions`),

  /**
   * Adds a new permission
   * @param guildId The guild ID
   * @param permission Permission to add
   */
  addPermission: (guildId: bigint, permission: any) =>
    apiRequest<void>(
      `Administration/${guildId}/permissions`,
      "POST",
      permission,
    ),

  /**
   * Removes a permission by index
   * @param guildId The guild ID
   * @param index Permission index
   */
  removePermission: (guildId: bigint, index: number) =>
    apiRequest<void>(
      `Administration/${guildId}/permissions/${index}`,
      "DELETE",
    ),

  /**
   * Moves a permission to a new position
   * @param guildId The guild ID
   * @param request Move configuration
   */
  movePermission: (guildId: bigint, request: MovePermissionRequest) =>
    apiRequest<void>(
      `Administration/${guildId}/permissions/move`,
      "POST",
      request,
    ),

  /**
   * Resets all permissions for a guild
   * @param guildId The guild ID
   */
  resetPermissions: (guildId: bigint) =>
    apiRequest<void>(`Administration/${guildId}/permissions/reset`, "POST"),

  /**
   * Sets verbose mode for permissions
   * @param guildId The guild ID
   * @param verbose Whether to enable verbose mode
   */
  setVerbosePermissions: (guildId: bigint, verbose: boolean) =>
    apiRequest<void>(`Administration/${guildId}/permissions/verbose`, "POST", {
      verbose,
    }),

  /**
   * Sets the permission role for the guild
   * @param guildId The guild ID
   * @param roleId The permission role ID
   */
  setPermissionRole: (guildId: bigint, roleId: string) =>
    apiRequest<void>(
      `Administration/${guildId}/permissions/role`,
      "POST",
      roleId,
    ),

  // ============================================
  // Commands
  // ============================================

  /**
   * Gets all commands and modules
   * @param guildId The guild ID (use 0 for global)
   * @returns List of modules with their commands
   */
  getCommandsAndModules: (guildId: bigint = 0n) =>
    apiRequest<Module[]>(`Administration/${guildId}/commands`),

  // ============================================
  // Command Cooldowns
  // ============================================

  /**
   * Gets command cooldowns for the guild
   * @param guildId The guild ID
   * @returns List of command cooldowns
   */
  getCommandCooldowns: (guildId: bigint) =>
    apiRequest<CommandCooldown[]>(
      `Administration/${guildId}/command-cooldowns`,
    ),

  /**
   * Sets command cooldown
   * @param guildId The guild ID
   * @param commandName The command name
   * @param seconds Cooldown in seconds (0-90000)
   */
  setCommandCooldown: (guildId: bigint, commandName: string, seconds: number) =>
    apiRequest<void>(
      `Administration/${guildId}/command-cooldowns/${commandName}`,
      "PUT",
      seconds,
    ),

  /**
   * Removes command cooldown
   * @param guildId The guild ID
   * @param commandName The command name
   */
  removeCommandCooldown: (guildId: bigint, commandName: string) =>
    apiRequest<void>(
      `Administration/${guildId}/command-cooldowns/${commandName}`,
      "DELETE",
    ),
};
