// lib/api/moderation/models/Warning.ts

/**
 * Warning record
 */
export interface Warning {
  /** Warning ID */
  id: number;

  /** Guild ID */
  guildId: bigint;

  /** User ID who was warned */
  userId: bigint;

  /** Reason for the warning */
  reason: string | null;

  /** Whether the warning was forgiven */
  forgiven: boolean;

  /** User ID who forgave the warning */
  forgivenBy: string | null;

  /** Moderator who issued the warning */
  moderator: string | null;

  /** Date the warning was added */
  dateAdded: string | null;
}

/**
 * Warning punishment setting
 */
export interface WarningPunishment {
  /** Number of warnings */
  count: number;

  /** Punishment to apply */
  punishment: string;

  /** Duration in minutes */
  time: number;

  /** Role ID (if applicable) */
  roleId: bigint | null;
}
