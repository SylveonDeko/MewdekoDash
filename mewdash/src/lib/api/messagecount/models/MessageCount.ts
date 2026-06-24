// lib/api/messagecount/models/MessageCount.ts

export interface DailyMessageStats {
  enabled: boolean;
  dailyMessages: number;
  totalMessages: number;
  lastUpdated?: string;
}

export interface ChannelMessageStats {
  enabled: boolean;
  channelId: string;
  channelName: string;
  totalMessages: number;
  dailyMessages: number;
  lastUpdated: string;
}

export interface UserMessageStats {
  enabled: boolean;
  userId: string;
  totalMessages: number;
  dailyMessages: number;
  lastUpdated: string;
}

export interface MessageStatsResponse {
  enabled: boolean;
  topUsers: Array<{
    userId: string;
    totalMessages: number;
    dailyMessages: number;
    percentage?: number;
  }>;
  topChannels: Array<{
    channelId: string;
    channelName: string;
    totalMessages: number;
    dailyMessages: number;
    percentage?: number;
  }>;
  leastActiveUser?: {
    userId: string;
    totalMessages: number;
    dailyMessages: number;
    percentage?: number;
  } | null;
  leastActiveChannel?: {
    channelId: string;
    channelName: string;
    totalMessages: number;
    dailyMessages: number;
    percentage?: number;
  } | null;
  busiestHours?: Array<{
    hour: number;
    messageCount: number;
  }>;
  busiestDays?: Array<{
    day: string;
    messageCount: number;
  }>;
  dailyMessages: number;
  totalMessages: number;
  lastUpdated: string;
}

export interface HourlyMessageStats {
  hour: number;
  messageCount: number;
}

export interface MessageCountExportRequest {
  startDate?: string | null;
  endDate?: string | null;
  channelIds?: bigint[] | null;
  userIds?: bigint[] | null;
}
