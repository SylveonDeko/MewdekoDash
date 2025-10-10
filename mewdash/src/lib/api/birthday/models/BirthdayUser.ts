// lib/api/birthday/models/BirthdayUser.ts

/**
 * Response model for user birthday information
 * Maps to Mewdeko.Controllers.Common.Birthday.BirthdayUserResponse
 */
export interface BirthdayUser {
  /** The user's Discord ID */
  userId: bigint;

  /** The user's Discord username */
  username: string;

  /** The user's guild nickname */
  nickname: string | null;

  /** The user's avatar URL */
  avatarUrl: string;

  /** The user's birthday date */
  birthday: string | null;

  /** The user's birthday display mode */
  birthdayDisplayMode: number;

  /** Whether the user has birthday announcements enabled */
  birthdayAnnouncementsEnabled: boolean;

  /** The user's timezone for birthday calculations */
  birthdayTimezone: string | null;

  /** Days until birthday (null if not applicable) */
  daysUntil: number | null;
}
