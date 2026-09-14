/**
 * Shared list of common IANA timezones for timezone selectors across the dashboard.
 */
export interface TimezoneEntry {
  value: string;
  label: string;
  offset: string;
}

/** Common timezones used by DiscordSelector type="timezone" */
export const TIMEZONES: TimezoneEntry[] = [
  { value: "UTC", label: "UTC (GMT+0)", offset: "+00:00" },
  { value: "America/New_York", label: "Eastern Time (GMT-5)", offset: "-05:00" },
  { value: "America/Chicago", label: "Central Time (GMT-6)", offset: "-06:00" },
  { value: "America/Denver", label: "Mountain Time (GMT-7)", offset: "-07:00" },
  { value: "America/Los_Angeles", label: "Pacific Time (GMT-8)", offset: "-08:00" },
  { value: "America/Anchorage", label: "Alaska (GMT-9)", offset: "-09:00" },
  { value: "Pacific/Honolulu", label: "Hawaii (GMT-10)", offset: "-10:00" },
  { value: "America/Sao_Paulo", label: "Sao Paulo (GMT-3)", offset: "-03:00" },
  { value: "Europe/London", label: "London (GMT+0)", offset: "+00:00" },
  { value: "Europe/Paris", label: "Paris (GMT+1)", offset: "+01:00" },
  { value: "Europe/Berlin", label: "Berlin (GMT+1)", offset: "+01:00" },
  { value: "Europe/Madrid", label: "Madrid (GMT+1)", offset: "+01:00" },
  { value: "Europe/Athens", label: "Athens (GMT+2)", offset: "+02:00" },
  { value: "Europe/Moscow", label: "Moscow (GMT+3)", offset: "+03:00" },
  { value: "Asia/Dubai", label: "Dubai (GMT+4)", offset: "+04:00" },
  { value: "Asia/Kolkata", label: "India (GMT+5:30)", offset: "+05:30" },
  { value: "Asia/Bangkok", label: "Bangkok (GMT+7)", offset: "+07:00" },
  { value: "Asia/Shanghai", label: "Shanghai (GMT+8)", offset: "+08:00" },
  { value: "Asia/Singapore", label: "Singapore (GMT+8)", offset: "+08:00" },
  { value: "Asia/Tokyo", label: "Tokyo (GMT+9)", offset: "+09:00" },
  { value: "Asia/Seoul", label: "Seoul (GMT+9)", offset: "+09:00" },
  { value: "Australia/Sydney", label: "Sydney (GMT+10)", offset: "+10:00" },
  { value: "Pacific/Auckland", label: "Auckland (GMT+12)", offset: "+12:00" }
];

/** Timezone list shaped for DiscordSelector options */
export const TIMEZONE_OPTIONS = TIMEZONES.map(tz => ({
  id: tz.value,
  name: tz.label,
  label: tz.label,
  offset: tz.offset,
  value: tz.value
}));
