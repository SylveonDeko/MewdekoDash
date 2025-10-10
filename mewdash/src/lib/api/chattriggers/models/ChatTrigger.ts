// lib/api/chattriggers/models/ChatTrigger.ts

/**
 * Chat trigger model
 * Maps to DataModel.ChatTrigger from Database/L2DB/ChatTrigger.cs
 */
export interface ChatTrigger {
  /** Primary key */
  id: number;

  /** Number of times this trigger has been used */
  useCount: bigint;

  /** Whether the trigger uses regex */
  isRegex: boolean;

  /** Whether this trigger is owner-only */
  ownerOnly: boolean;

  /** Guild ID (null for global triggers) */
  guildId: bigint | null;

  /** The response text */
  response: string | null;

  /** The trigger text or pattern */
  trigger: string | null;

  /** Prefix type */
  prefixType: number;

  /** Custom prefix */
  customPrefix: string | null;

  /** Whether to auto-delete the trigger message */
  autoDeleteTrigger: boolean;

  /** Whether to react to the trigger */
  reactToTrigger: boolean;

  /** Whether not to respond (for reaction-only triggers) */
  noRespond: boolean;

  /** Whether to DM the response */
  dmResponse: boolean;

  /** Whether to match anywhere in message */
  containsAnywhere: boolean;

  /** Whether to allow targeting users */
  allowTarget: boolean;

  /** Reactions to add (JSON array) */
  reactions: string | null;

  /** Roles to grant (comma-separated) */
  grantedRoles: string | null;

  /** Roles to remove (comma-separated) */
  removedRoles: string | null;

  /** Role grant type */
  roleGrantType: number;

  /** Valid trigger types (bitfield) */
  validTriggerTypes: number;

  /** Application command ID */
  applicationCommandId: bigint;

  /** Application command name */
  applicationCommandName: string | null;

  /** Application command description */
  applicationCommandDescription: string | null;

  /** Application command type */
  applicationCommandType: number;

  /** Whether response should be ephemeral */
  ephemeralResponse: boolean;

  /** Crossposting channel ID */
  crosspostingChannelId: bigint;

  /** Crossposting webhook URL */
  crosspostingWebhookUrl: string | null;

  /** Date added */
  dateAdded: string | null;
}
