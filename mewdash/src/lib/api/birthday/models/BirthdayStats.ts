// lib/api/birthday/models/BirthdayStats.ts

/**
 * Response model for birthday statistics
 * Maps to Mewdeko.Controllers.Common.Birthday.BirthdayStatsResponse
 */
export interface BirthdayStats {
  /** Total number of users in the guild */
  totalUsers: number;

  /** Number of users with birthdays set */
  usersWithBirthdays: number;

  /** Number of users with birthday announcements enabled */
  usersWithAnnouncementsEnabled: number;

  /** Number of birthdays today */
  todaysBirthdayCount: number;

  /** Percentage of users who have set their birthday */
  birthdaySetPercentage: number;
}
