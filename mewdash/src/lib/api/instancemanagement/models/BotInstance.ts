// lib/api/instancemanagement/models/BotInstance.ts

/**
 * Bot instance information
 * Maps to DataModel.BotInstance from Database/L2DB/BotInstance.cs
 */
export interface BotInstance {
  /** Primary key */
  id: number;

  /** Bot username */
  botName: string;

  /** Date added */
  dateAdded: string | null;

  /** Bot avatar URL */
  botAvatar: string;

  /** Bot ID (Discord application ID) */
  botId: bigint;

  /** Whether the instance is active */
  isActive: boolean;

  /** Last status update timestamp */
  lastStatusUpdate: string;

  /** The port number the instance is running on */
  port: number;
}
