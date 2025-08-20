// lib/types/repeater.ts

// Trigger modes from C# enum
export enum StickyTriggerMode {
  TimeInterval = 0,
  OnActivity = 1,
  OnNoActivity = 2,
  Immediate = 3,
  AfterMessages = 4
}

// Forum tag condition structure  
export interface ForumTagCondition {
  requiredTags?: bigint[];
  excludedTags?: bigint[];
}

// Forum channel types from ClientOperations
export interface ForumChannelInfo {
  id: bigint;
  name: string;
  topic: string | null;
  requiresTags: boolean;
  maxActiveThreads: number | null;
  defaultAutoArchiveDuration: number;
  tags: ForumTagInfo[];
  activeThreads: ThreadInfo[];
  totalThreadCount: number;
}

export interface ForumTagInfo {
  id: bigint;
  name: string;
  emoji: string | null;
  isModerated: boolean;
}

export interface ThreadInfo {
  id: bigint;
  name: string;
  appliedTags: bigint[];
  creatorId: bigint;
  createdAt: string;
  messageCount: number;
  isArchived: boolean;
  isLocked: boolean;
}

// Repeater request/response models
export interface CreateRepeaterRequest {
  channelId: bigint;
  message: string;
  interval: string;
  startTimeOfDay?: string | null;
  noRedundant?: boolean;
  allowMentions?: boolean;
  triggerMode: StickyTriggerMode;
  activityThreshold: number;
  activityTimeWindow: string;
  conversationDetection: boolean;
  conversationThreshold?: number;
  priority: number;
  timeSchedulePreset?: string | null;
  timeConditions?: string | null;
  maxAge?: string | null;
  maxTriggers?: number | null;
  threadAutoSticky?: boolean;
  threadOnlyMode?: boolean;
  forumTagConditions?: string | null;
}

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
  threadStickyMessages: string | null;
  displayCount: number;
  lastDisplayed: string | null;
  dateAdded: string;
  nextExecution: string | null;
  guildTimezone: string;
  requiresTimezone: boolean;
}

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

export interface MessageCountingStatus {
  enabled: boolean;
  available: boolean;
  message?: string;
}

export interface BulkToggleResult {
  results: Array<{
    repeaterId: number;
    success: boolean;
    message?: string;
    error?: string;
  }>;
}

// Helper types for form handling
export interface RepeaterFormData {
  channelId: string | null;
  message: string;
  interval: string;
  startTimeOfDay: string;
  triggerMode: StickyTriggerMode;
  activityThreshold: number;
  activityTimeWindow: string;
  conversationDetection: boolean;
  conversationThreshold: number;
  priority: number;
  queuePosition: number;
  noRedundant: boolean;
  allowMentions: boolean;
  timeSchedulePreset: string;
  timeConditions: string;
  maxAge: string;
  maxTriggers: number | null;
  threadAutoSticky: boolean;
  threadOnlyMode: boolean;
  forumTagConditions: ForumTagCondition | null;
}

// Forum tag management types
export interface ForumTagManagementRequest {
  action: 'add' | 'remove' | 'clear' | 'list';
  tagType?: 'required' | 'excluded';
  tagIds?: bigint[];
}

export interface ThreadStickyMessage {
  threadId: bigint;
  messageId: bigint; 
  threadName: string;
  isActive: boolean;
}

// Bulk operations
export interface BulkRepeaterOperation {
  repeaterIds: number[];
  enable: boolean;
}

// Utility functions
export function getTriggerModeLabel(mode: StickyTriggerMode): string {
  switch (mode) {
    case StickyTriggerMode.TimeInterval:
      return "Time Interval";
    case StickyTriggerMode.OnActivity:
      return "On Activity";
    case StickyTriggerMode.OnNoActivity:
      return "On No Activity";
    case StickyTriggerMode.Immediate:
      return "Immediate";
    case StickyTriggerMode.AfterMessages:
      return "After Messages";
    default:
      return "Unknown";
  }
}

export function getTriggerModeDescription(mode: StickyTriggerMode): string {
  switch (mode) {
    case StickyTriggerMode.TimeInterval:
      return "Repeats based on time intervals";
    case StickyTriggerMode.OnActivity:
      return "Triggers when activity threshold is met";
    case StickyTriggerMode.OnNoActivity:
      return "Triggers when no activity detected";
    case StickyTriggerMode.Immediate:
      return "Immediately repost when message is sent";
    case StickyTriggerMode.AfterMessages:
      return "Triggers after specific number of messages";
    default:
      return "Unknown trigger mode";
  }
}

export function formatInterval(intervalString: string): string {
  try {
    // Parse TimeSpan format HH:MM:SS or DD.HH:MM:SS
    const parts = intervalString.split(':');
    if (parts.length >= 3) {
      const hours = parseInt(parts[parts.length - 3]);
      const minutes = parseInt(parts[parts.length - 2]);
      const seconds = parseInt(parts[parts.length - 1]);
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `${minutes}m`;
      } else {
        return `${seconds}s`;
      }
    }
    return intervalString;
  } catch {
    return intervalString;
  }
}

export function formatTimeUntilNext(nextExecution: string | null): string {
  if (!nextExecution) return "Not scheduled";
  
  const now = new Date();
  const next = new Date(nextExecution);
  const diffMs = next.getTime() - now.getTime();
  
  if (diffMs <= 0) return "Due now";
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
  if (diffHours > 0) return `${diffHours}h ${diffMinutes % 60}m`;
  return `${diffMinutes}m`;
}

// Time schedule presets
export const TIME_SCHEDULE_PRESETS = [
  { id: "none", name: "No Schedule", description: "Always active" },
  { id: "business", name: "Business Hours", description: "Monday-Friday 9 AM - 5 PM" },
  { id: "evening", name: "Evening Hours", description: "Daily 6 PM - 11 PM" },
  { id: "weekend", name: "Weekends", description: "Saturday-Sunday all day" }
] as const;

export type TimeSchedulePreset = typeof TIME_SCHEDULE_PRESETS[number]['id'];