// lib/api/repeaters/models/Repeater.ts

/**
 * Sticky trigger modes
 */
export enum StickyTriggerMode {
  TimeInterval = 0,
  OnActivity = 1,
  OnNoActivity = 2,
  AfterMessages = 3,
  Immediate = 4,
}

/**
 * Repeater response
 * Maps to Mewdeko.Controllers.Common.Repeaters.RepeaterResponse
 */
export interface RepeaterResponse {
  id: number;
  channelId: bigint;
  message: string;
  interval: string;
  startTimeOfDay: string | null;
  noRedundant: boolean;
  isEnabled: boolean;
  triggerMode: StickyTriggerMode;
  activityThreshold: number;
  activityTimeWindow: string;
  conversationDetection: boolean;
  conversationThreshold: number;
  priority: number;
  queuePosition: number;
  timeConditions: string | null;
  maxAge: string | null;
  maxTriggers: number | null;
  threadAutoSticky: boolean;
  threadOnlyMode: boolean;
  forumTagConditions: string | null;
  displayCount: number;
  lastDisplayed: string | null;
  dateAdded: string | null;
  nextExecution: string | null;
  guildTimezone: string | null;
  requiresTimezone: boolean;
  threadStickyMessages: string | null;
}

/**
 * Create repeater request
 * Maps to Mewdeko.Controllers.Common.Repeaters.CreateRepeaterRequest
 */
export interface CreateRepeaterRequest {
  channelId: bigint;
  message: string;
  interval?: string;
  startTimeOfDay?: string | null;
  noRedundant?: boolean;
  allowMentions?: boolean;
  triggerMode?: StickyTriggerMode;
  activityThreshold?: number;
  activityTimeWindow?: string;
  conversationDetection?: boolean;
  conversationThreshold?: number;
  priority?: number;
  timeSchedulePreset?: string | null;
  timeConditions?: string | null;
  maxAge?: string | null;
  maxTriggers?: number | null;
  threadAutoSticky?: boolean;
  threadOnlyMode?: boolean;
  forumTagConditions?: string | null;
}

/**
 * Update repeater request
 * Maps to Mewdeko.Controllers.Common.Repeaters.UpdateRepeaterRequest
 */
export interface UpdateRepeaterRequest {
  message?: string | null;
  channelId?: bigint | null;
  interval?: string | null;
  allowMentions?: boolean | null;
  triggerMode?: StickyTriggerMode | null;
  activityThreshold?: number | null;
  activityTimeWindow?: string | null;
  conversationDetection?: boolean | null;
  conversationThreshold?: number | null;
  priority?: number | null;
  queuePosition?: number | null;
  noRedundant?: boolean | null;
  isEnabled?: boolean | null;
  timeConditions?: string | null;
  maxAge?: string | null;
  maxTriggers?: number | null;
  threadAutoSticky?: boolean | null;
  threadOnlyMode?: boolean | null;
  forumTagConditions?: string | null;
}

/**
 * Repeater statistics response
 * Maps to Mewdeko.Controllers.Common.Repeaters.RepeaterStatsResponse
 */
export interface RepeaterStatsResponse {
  totalRepeaters: number;
  activeRepeaters: number;
  disabledRepeaters: number;
  totalDisplays: number;
  triggerModeDistribution: Record<string, number>;
  mostActiveRepeater: RepeaterResponse | null;
  timeScheduledRepeaters: number;
  conversationAwareRepeaters: number;
}

/**
 * Repeater form data for UI
 */
export interface RepeaterFormData {
  channelId: string;
  message: string;
  interval: string;
  startTimeOfDay: string;
  noRedundant: boolean;
  allowMentions?: boolean;
  triggerMode: StickyTriggerMode;
  activityThreshold: number;
  activityTimeWindow: string;
  conversationDetection: boolean;
  conversationThreshold: number;
  priority: number;
  queuePosition?: number;
  timeSchedulePreset?: string | null;
  timeConditions: string | null;
  maxAge: string | null;
  maxTriggers: number | null;
  threadAutoSticky: boolean;
  threadOnlyMode: boolean;
  forumTagConditions: string | null;
}

/**
 * Message counting status response
 */
export interface MessageCountingStatus {
  enabled: boolean;
  available: boolean;
  message?: string;
}

// Time schedule presets for UI
export const TIME_SCHEDULE_PRESETS = [
  { value: "WEEKDAYS", label: "Weekdays Only" },
  { value: "WEEKENDS", label: "Weekends Only" },
  { value: "BUSINESS_HOURS", label: "Business Hours (9-5)" },
  { value: "CUSTOM", label: "Custom Schedule" },
] as const;

// Helper functions for repeaters
export function getTriggerModeLabel(mode: StickyTriggerMode): string {
  switch (mode) {
    case StickyTriggerMode.TimeInterval:
      return "Time Interval";
    case StickyTriggerMode.OnActivity:
      return "On Activity";
    case StickyTriggerMode.OnNoActivity:
      return "On No Activity";
    case StickyTriggerMode.AfterMessages:
      return "After Messages";
    case StickyTriggerMode.Immediate:
      return "Immediate";
    default:
      return "Unknown";
  }
}

export function getTriggerModeDescription(mode: StickyTriggerMode): string {
  switch (mode) {
    case StickyTriggerMode.TimeInterval:
      return "Repeats at fixed time intervals";
    case StickyTriggerMode.OnActivity:
      return "Triggers when activity is detected";
    case StickyTriggerMode.OnNoActivity:
      return "Triggers when no activity is detected";
    case StickyTriggerMode.AfterMessages:
      return "Triggers after a certain number of messages";
    case StickyTriggerMode.Immediate:
      return "Triggers immediately";
    default:
      return "Unknown trigger mode";
  }
}

export function formatInterval(interval: string): string {
  // Parse interval (format: "HH:mm:ss" or timespan string)
  if (!interval) return "Not set";

  const parts = interval.split(":");
  if (parts.length >= 2) {
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    }
  }

  return interval;
}

export function formatTimeUntilNext(nextExecution: string | null): string {
  if (!nextExecution) return "Not scheduled";

  const now = new Date();
  const next = new Date(nextExecution);
  const diff = next.getTime() - now.getTime();

  if (diff < 0) return "Overdue";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}
