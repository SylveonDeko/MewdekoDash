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
  response: string | Record<string, any> | null;

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

  /** Whether the trigger is paused without being deleted */
  isDisabled: boolean;

  /** Extra responses, separated by "@@@" */
  additionalResponses: string | null;

  /** How the trigger picks between its responses (CtResponseMode) */
  responseMode: number;

  /** Position in the round-robin rotation */
  roundRobinIndex: number;

  /** Currency charged to the user when the trigger fires */
  currencyCost: number;

  /** Currency paid out when the trigger fires */
  currencyReward: number;

  /** XP granted when the trigger fires */
  xpReward: number;

  /** XP level required before the trigger will fire */
  requiredXpLevel: number;

  /** Message shown when requirements are not met, or null to fail silently */
  requirementFailMessage: string | null;

  /** Serialized time conditions (shared format with sticky messages) */
  timeConditions: string | null;

  /** When the trigger stops firing */
  expiresAt: string | null;

  /** How many times the trigger may fire, or null for no limit */
  maxUses: number | null;

  /** Minimum account age in minutes */
  minAccountAgeMinutes: number;

  /** Minimum server membership in minutes */
  minServerMembershipMinutes: number;

  /** Bot event the trigger listens for (CtEventType) */
  eventType: number;

  /** Channel an event trigger responds in, or 0 for where the event happened */
  eventChannelId: bigint;

  /** Whether the trigger responds to bot and webhook messages instead of humans */
  allowBots: boolean;

  /** Trigger run after this one, or null */
  nextTriggerId: number | null;

  /** Whether the response replies to the message that fired it */
  replyToTrigger: boolean;

  /** Seconds before the response is deleted, or 0 to keep it */
  deleteResponseAfter: number;

  /** The trigger's own cooldown in seconds */
  cooldownSeconds: number;

  /** Who the cooldown applies to (CtCooldownScope) */
  cooldownScope: number;

  /** Counter that gates the trigger */
  counterName: string | null;

  /** Lowest counter value that allows firing */
  counterMin: number | null;

  /** Highest counter value that allows firing */
  counterMax: number | null;

  /** Category used to group and bulk-manage triggers */
  category: string | null;

  /** Date added */
  dateAdded: string | null;
}
