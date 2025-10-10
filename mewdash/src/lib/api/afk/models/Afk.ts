// lib/api/afk/models/Afk.ts

/**
 * AFK status model
 * Maps to DataModel.Afk from Database/L2DB/Afk.cs
 */
export interface Afk {
  /** Primary key */
  id: number;

  /** User ID */
  userId: bigint;

  /** Guild ID */
  guildId: bigint;

  /** AFK message */
  message: string | null;

  /** Whether the AFK was timed */
  wasTimed: boolean;

  /** When the AFK was set */
  when: string | null;

  /** Date added */
  dateAdded: string | null;
}

/**
 * User with AFK status
 */
export interface UserWithAfk {
  /** User ID */
  userId: bigint;

  /** Username */
  username: string;

  /** Nickname (if any) */
  nickname: string | null;

  /** Avatar URL */
  avatarUrl: string;

  /** AFK status (null if not AFK) */
  afkStatus: Afk | null;
}
