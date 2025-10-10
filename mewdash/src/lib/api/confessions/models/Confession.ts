// lib/api/confessions/models/Confession.ts

/**
 * Confession model
 * Maps to DataModel.Confession from Database/L2DB/Confession.cs
 */
export interface Confession {
  /** Primary key */
  id: number;

  /** Guild ID */
  guildId: bigint;

  /** User ID (anonymous) */
  userId: bigint;

  /** Message ID */
  messageId: bigint;

  /** Channel ID */
  channelId: bigint;

  /** Confession number */
  confessNumber: bigint;

  /** The confession text */
  confession1: string | null;

  /** Date added */
  dateAdded: string | null;
}

/**
 * Confession statistics
 */
export interface ConfessionStats {
  /** Total confessions in the guild */
  totalConfessions: number;

  /** Confessions this month */
  confessionsThisMonth: number;

  /** Confessions today */
  confessionsToday: number;

  /** Last confession number */
  lastConfessionNumber: bigint;

  /** Last confession date */
  lastConfessionDate: string | null;
}
