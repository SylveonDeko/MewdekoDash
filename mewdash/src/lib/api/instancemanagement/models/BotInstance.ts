// lib/api/instancemanagement/models/BotInstance.ts

/**
 * Bot instance information
 */
export interface BotInstance {
  /** The port number the instance is running on */
  port: number;

  /** Whether the instance is active */
  active: boolean;

  /** Instance status message */
  status?: string;
}
