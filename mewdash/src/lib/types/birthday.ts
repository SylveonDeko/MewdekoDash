// lib/types/birthday.ts
export interface BirthdayConfig {
  guildId: bigint;
  channelId?: bigint | null;
  roleId?: bigint | null;
  message?: string | null;
  pingRoleId?: bigint | null;
  reminderDays: number;
  timezone: string;
  features: BirthdayFeatures;
}

export interface BirthdayConfigRequest {
  channelId?: bigint | null;
  roleId?: bigint | null;
  message?: string | null;
  pingRoleId?: bigint | null;
  reminderDays?: number;
  timezone?: string;
  features?: BirthdayFeatures;
}

export enum BirthdayFeatures {
  None = 0,
  Announcements = 1,
  BirthdayRole = 2,
  Reminders = 4,
  PingRole = 8,
  TimezoneSupport = 16
}

export interface BirthdayUser {
  userId: bigint;
  guildId: bigint;
  birthday: string; // ISO date string
  timezone: string;
  announcementsEnabled: boolean;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  daysUntilBirthday?: number;
}

export interface BirthdayStats {
  guildId: bigint;
  totalUsers: number;
  usersWithBirthdays: number;
  usersWithAnnouncements: number;
  todaysBirthdayCount: number;
  percentageWithBirthdays: number;
}

export interface BirthdayUpcomingRequest {
  days?: number; // 1-30 days ahead
}

// API response types

// Helper type for timezone options
export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

// Common timezones supported by the birthday system
export const SUPPORTED_TIMEZONES: TimezoneOption[] = [
  { value: "UTC", label: "UTC - Coordinated Universal Time", offset: "+00:00" },
  { value: "America/New_York", label: "Eastern Time (ET)", offset: "-05:00/-04:00" },
  { value: "America/Chicago", label: "Central Time (CT)", offset: "-06:00/-05:00" },
  { value: "America/Denver", label: "Mountain Time (MT)", offset: "-07:00/-06:00" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)", offset: "-08:00/-07:00" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)", offset: "-09:00/-08:00" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HST)", offset: "-10:00" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)", offset: "+00:00/+01:00" },
  { value: "Europe/Paris", label: "Central European Time (CET)", offset: "+01:00/+02:00" },
  { value: "Europe/Berlin", label: "Central European Time (CET)", offset: "+01:00/+02:00" },
  { value: "Europe/Rome", label: "Central European Time (CET)", offset: "+01:00/+02:00" },
  { value: "Europe/Madrid", label: "Central European Time (CET)", offset: "+01:00/+02:00" },
  { value: "Europe/Amsterdam", label: "Central European Time (CET)", offset: "+01:00/+02:00" },
  { value: "Europe/Stockholm", label: "Central European Time (CET)", offset: "+01:00/+02:00" },
  { value: "Europe/Helsinki", label: "Eastern European Time (EET)", offset: "+02:00/+03:00" },
  { value: "Europe/Athens", label: "Eastern European Time (EET)", offset: "+02:00/+03:00" },
  { value: "Europe/Moscow", label: "Moscow Standard Time (MSK)", offset: "+03:00" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (GST)", offset: "+04:00" },
  { value: "Asia/Karachi", label: "Pakistan Standard Time (PKT)", offset: "+05:00" },
  { value: "Asia/Kolkata", label: "India Standard Time (IST)", offset: "+05:30" },
  { value: "Asia/Dhaka", label: "Bangladesh Standard Time (BST)", offset: "+06:00" },
  { value: "Asia/Bangkok", label: "Indochina Time (ICT)", offset: "+07:00" },
  { value: "Asia/Singapore", label: "Singapore Standard Time (SGT)", offset: "+08:00" },
  { value: "Asia/Shanghai", label: "China Standard Time (CST)", offset: "+08:00" },
  { value: "Asia/Hong_Kong", label: "Hong Kong Time (HKT)", offset: "+08:00" },
  { value: "Asia/Taipei", label: "Taipei Standard Time (TST)", offset: "+08:00" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)", offset: "+09:00" },
  { value: "Asia/Seoul", label: "Korea Standard Time (KST)", offset: "+09:00" },
  { value: "Australia/Sydney", label: "Australian Eastern Standard Time (AEST)", offset: "+10:00/+11:00" },
  { value: "Australia/Melbourne", label: "Australian Eastern Standard Time (AEST)", offset: "+10:00/+11:00" },
  { value: "Australia/Brisbane", label: "Australian Eastern Standard Time (AEST)", offset: "+10:00" },
  { value: "Australia/Perth", label: "Australian Western Standard Time (AWST)", offset: "+08:00" },
  { value: "Pacific/Auckland", label: "New Zealand Standard Time (NZST)", offset: "+12:00/+13:00" },
  { value: "Pacific/Fiji", label: "Fiji Time (FJT)", offset: "+12:00/+13:00" },
  { value: "America/Toronto", label: "Eastern Time (Canada)", offset: "-05:00/-04:00" },
  { value: "America/Vancouver", label: "Pacific Time (Canada)", offset: "-08:00/-07:00" },
  { value: "America/Mexico_City", label: "Central Standard Time (Mexico)", offset: "-06:00/-05:00" },
  { value: "America/Sao_Paulo", label: "Brasília Time (BRT)", offset: "-03:00/-02:00" },
  { value: "America/Buenos_Aires", label: "Argentina Time (ART)", offset: "-03:00" },
  { value: "Africa/Cairo", label: "Eastern European Time (Egypt)", offset: "+02:00" },
  { value: "Africa/Johannesburg", label: "South Africa Standard Time (SAST)", offset: "+02:00" },
  { value: "Asia/Jerusalem", label: "Israel Standard Time (IST)", offset: "+02:00/+03:00" },
  { value: "Europe/Istanbul", label: "Turkey Time (TRT)", offset: "+03:00" }
];

// Helper functions for birthday features
export const getBirthdayFeatureNames = (features: BirthdayFeatures | bigint | any): string[] => {
  const names: string[] = [];
  let featuresNum: number;
  if (typeof features === "bigint") {
    featuresNum = Number(features);
  } else if (typeof features === "object" && features !== null) {
    if (typeof features.toString === "function") {
      featuresNum = Number(features.toString());
    } else if (typeof features.valueOf === "function") {
      featuresNum = Number(features.valueOf());
    } else {
      featuresNum = Number(JSON.parse(JSON.stringify(features)));
    }
  } else {
    featuresNum = Number(features);
  }
  if (featuresNum & BirthdayFeatures.Announcements) names.push("Announcements");
  if (featuresNum & BirthdayFeatures.BirthdayRole) names.push("Birthday Role");
  if (featuresNum & BirthdayFeatures.Reminders) names.push("Reminders");
  if (featuresNum & BirthdayFeatures.PingRole) names.push("Ping Role");
  if (featuresNum & BirthdayFeatures.TimezoneSupport) names.push("Timezone Support");
  return names;
};

export const hasBirthdayFeature = (features: BirthdayFeatures | bigint | any, feature: BirthdayFeatures): boolean => {
  // Handle json-bigint objects that can't be directly converted
  let featuresNum: number;
  if (typeof features === "bigint") {
    featuresNum = Number(features);
  } else if (typeof features === "object" && features !== null) {
    // Handle json-bigint objects - try different conversion methods
    if (typeof features.toString === "function") {
      featuresNum = Number(features.toString());
    } else if (typeof features.valueOf === "function") {
      featuresNum = Number(features.valueOf());
    } else {
      featuresNum = Number(JSON.parse(JSON.stringify(features)));
    }
  } else {
    featuresNum = Number(features);
  }
  return (featuresNum & feature) === feature;
};

