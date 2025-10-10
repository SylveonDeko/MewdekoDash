// lib/api/birthday/models/BirthdayFeature.ts

/**
 * Birthday features that can be enabled for a guild
 * Maps to Mewdeko.Modules.Birthday.Common.BirthdayFeature
 * This is a Flags enum in C#
 */
export enum BirthdayFeatures {
  /** No birthday features enabled */
  None = 0,

  /** Enable birthday announcements in the configured channel */
  Announcements = 1,

  /** Enable temporary birthday role assignment */
  BirthdayRole = 2,

  /** Enable birthday reminders for users */
  Reminders = 4,

  /** Enable pinging a role when announcing birthdays */
  PingRole = 8,

  /** Enable timezone support for accurate birthday detection */
  TimezoneSupport = 16,
}

/**
 * Response model for feature status
 * Maps to Mewdeko.Controllers.Common.Birthday.FeatureStatusResponse
 */
export interface FeatureStatus {
  /** Dictionary of feature names and their enabled status */
  features: Record<string, boolean>;
}
