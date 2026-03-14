// lib/api/birthday/models/BirthdayConfig.ts

/**
 * Request model for updating birthday configuration
 * Maps to Mewdeko.Controllers.Common.Birthday.BirthdayConfigRequest
 */
export interface BirthdayConfigRequest {
  /** The channel ID for birthday announcements */
  birthdayChannelId?: bigint | null;

  /** The role ID to assign on birthdays */
  birthdayRoleId?: bigint | null;

  /** The birthday message template */
  birthdayMessage?: string | null;

  /** The role ID to ping for birthday announcements */
  birthdayPingRoleId?: bigint | null;

  /** Number of days before birthday to send reminders */
  birthdayReminderDays?: number | null;

  /** Default timezone for the guild */
  defaultTimezone?: string | null;
}

/**
 * Response model for birthday configuration
 * Maps to Mewdeko.Controllers.Common.Birthday.BirthdayConfigResponse
 */
export interface BirthdayConfig {
  /** The channel ID for birthday announcements */
  birthdayChannelId: bigint | null;

  /** The role ID to assign on birthdays */
  birthdayRoleId: bigint | null;

  /** The birthday message template */
  birthdayMessage: string | Record<string, any>;

  /** The role ID to ping for birthday announcements */
  birthdayPingRoleId: bigint | null;

  /** Number of days before birthday to send reminders */
  birthdayReminderDays: number;

  /** Default timezone for the guild */
  defaultTimezone: string;

  /** Enabled birthday features (bitfield) */
  enabledFeatures: number;

  /** Date when configuration was first created */
  dateAdded: string | null;

  /** Date when configuration was last modified */
  dateModified: string | null;
}
