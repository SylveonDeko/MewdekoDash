// lib/api/repeaters/models/Repeater.ts
import { m } from "$lib/i18n";

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
  suppressNotifications: boolean;
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
  suppressNotifications?: boolean;
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
  /**
   * New start time of day in UTC (e.g. "09:00"). An empty string "" clears it.
   * Leaving it out, or sending null, keeps the current value.
   */
  startTimeOfDay?: string | null;
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
  /**
   * Time schedule preset to apply: "business", "evening", "weekend", "none" (clears the
   * schedule) or "custom" (uses timeConditions). Takes precedence over timeConditions.
   * Leaving it out keeps the current schedule.
   */
  timeSchedulePreset?: string | null;
  timeConditions?: string | null;
  maxAge?: string | null;
  maxTriggers?: number | null;
  /**
   * When true, removes the max age limit so the repeater never expires by age.
   * Takes precedence over maxAge in the same request.
   */
  clearMaxAge?: boolean | null;
  /**
   * When true, removes the max triggers limit so the repeater never expires by display count.
   * Takes precedence over maxTriggers in the same request.
   */
  clearMaxTriggers?: boolean | null;
  threadAutoSticky?: boolean | null;
  threadOnlyMode?: boolean | null;
  suppressNotifications?: boolean | null;
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
  suppressNotifications: boolean;
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

// Time schedule presets for UI. Labels are accessor functions so they resolve at render time.
export const TIME_SCHEDULE_PRESETS = [
  { value: "business", label: m.repeaters.timePresetBusiness },
  { value: "evening", label: m.repeaters.timePresetEvening },
  { value: "weekend", label: m.repeaters.timePresetWeekend },
  { value: "custom", label: m.repeaters.timePresetCustom },
] as const;

// Helper functions for repeaters
export function getTriggerModeLabel(mode: StickyTriggerMode): string {
  switch (mode) {
    case StickyTriggerMode.TimeInterval:
      return m.repeaters.modeLabelTimeInterval();
    case StickyTriggerMode.OnActivity:
      return m.repeaters.modeLabelOnActivity();
    case StickyTriggerMode.OnNoActivity:
      return m.repeaters.modeLabelOnNoActivity();
    case StickyTriggerMode.AfterMessages:
      return m.repeaters.modeLabelAfterMessages();
    case StickyTriggerMode.Immediate:
      return m.repeaters.modeLabelImmediate();
    default:
      return m.common.unknown();
  }
}

export function getTriggerModeDescription(mode: StickyTriggerMode): string {
  switch (mode) {
    case StickyTriggerMode.TimeInterval:
      return m.repeaters.modeDescriptionTimeInterval();
    case StickyTriggerMode.OnActivity:
      return m.repeaters.modeDescriptionOnActivity();
    case StickyTriggerMode.OnNoActivity:
      return m.repeaters.modeDescriptionOnNoActivity();
    case StickyTriggerMode.AfterMessages:
      return m.repeaters.modeDescriptionAfterMessages();
    case StickyTriggerMode.Immediate:
      return m.repeaters.modeDescriptionImmediate();
    default:
      return m.repeaters.modeDescriptionUnknown();
  }
}

export function formatInterval(interval: string): string {
  // Parse interval (format: "HH:mm:ss" or timespan string)
  if (!interval) return m.common.notSet();

  const parts = interval.split(":");
  if (parts.length >= 2) {
    const hours = Number.parseInt(parts[0]);
    const minutes = Number.parseInt(parts[1]);

    if (hours > 0 && minutes > 0) {
      return m.repeaters.formatHoursMinutes({ hours, minutes });
    } else if (hours > 0) {
      return m.repeaters.formatHours({ hours });
    } else if (minutes > 0) {
      return m.repeaters.formatMinutes({ minutes });
    }
  }

  return interval;
}

export function formatTimeUntilNext(nextExecution: string | null): string {
  if (!nextExecution) return m.repeaters.formatNextNotScheduled();

  const now = new Date();
  const next = new Date(nextExecution);
  const diff = next.getTime() - now.getTime();

  if (diff < 0) return m.repeaters.formatNextOverdue();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return m.repeaters.formatDaysHours({ days, hours: hours % 24 });
  } else if (hours > 0) {
    return m.repeaters.formatHoursMinutes({ hours, minutes });
  } else {
    return m.repeaters.formatMinutes({ minutes });
  }
}
