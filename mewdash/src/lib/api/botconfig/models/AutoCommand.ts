// lib/api/botconfig/models/AutoCommand.ts

/**
 * Auto-executing command model
 */
export interface AutoCommand {
  /** Command ID */
  id: number;

  /** The command text */
  commandText: string;

  /** Channel ID to execute in */
  channelId: bigint;

  /** Guild ID */
  guildId: bigint;

  /** Interval in seconds */
  interval: number;
}
