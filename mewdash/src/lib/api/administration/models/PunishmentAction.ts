// lib/api/administration/models/PunishmentAction.ts

/**
 * Types of punishment actions that can be taken
 * Maps to Mewdeko.Modules.Administration.Common.PunishmentAction
 */
export enum PunishmentAction {
  /** Mute the user, preventing them from sending messages */
  Mute = 0,

  /** Kick the user from the server */
  Kick = 1,

  /** Ban the user from the server */
  Ban = 2,

  /** Softban the user (ban and immediately unban to clear recent messages) */
  Softban = 3,

  /** Remove all roles from the user */
  RemoveRoles = 4,

  /** Mute the user in text channels only */
  ChatMute = 5,

  /** Mute the user in voice channels only */
  VoiceMute = 6,

  /** Add a specific role to the user */
  AddRole = 7,

  /** Delete the user's message that triggered the action */
  Delete = 8,

  /** Issue a warning to the user */
  Warn = 9,

  /** Temporarily restrict the user's access to the server */
  Timeout = 10,

  /** Take no action */
  None = 11,
}

/**
 * Protection types available
 * Maps to Mewdeko.Modules.Administration.Common.ProtectionType
 */
export enum ProtectionType {
  /** Protection against raiding */
  Raiding = 0,

  /** Protection against spamming */
  Spamming = 1,

  /** Protection against alting */
  Alting = 2,

  /** Protection against mass mention */
  MassMention = 3,

  /** Protection against username/display name patterns */
  PatternMatching = 4,
}
