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
  }>;
  topChannels: Array<{
    channelId: string;
    channelName: string;
    totalMessages: number;
    dailyMessages: number;
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
