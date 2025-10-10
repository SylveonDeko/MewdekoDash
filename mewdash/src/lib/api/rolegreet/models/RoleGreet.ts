// lib/api/rolegreet/models/RoleGreet.ts

/**
 * Role greet model
 * Maps to DataModel.RoleGreet from Database/L2DB/RoleGreet.cs
 */
export interface RoleGreet {
  /** Primary key */
  id: number;

  /** Guild ID */
  guildId: bigint;

  /** Role ID that triggers the greet */
  roleId: bigint;

  /** Channel ID to send the greet in */
  channelId: bigint;

  /** Whether to greet bots */
  greetBots: boolean;

  /** Greet message */
  message: string | null;

  /** Time in seconds before deleting the greet message */
  deleteTime: number;

  /** Webhook URL for sending the greet */
  webhookUrl: string | null;

  /** Whether this greet is disabled */
  disabled: boolean;

  /** Date added */
  dateAdded: string | null;
}
