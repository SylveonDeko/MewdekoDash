// Message statistics types
export interface DailyMessageStats {
  enabled: boolean;
  dailyMessages: number;
  totalMessages: number;
  lastUpdated: string;
  trend: number; // percentage change from previous day
  averagePerHour: number;
  peakHour: number;
  peakHourCount: number;
}

export interface UserMessageStats {
  userId: bigint;
  username: string;
  discriminator: string;
  avatarUrl: string;
  messageCount: number;
  charactersTyped: number;
  averageMessageLength: number;
  rank: number;
  lastMessageAt: string;
  favoriteChannels: Array<{
    channelId: bigint;
    channelName: string;
    messageCount: number;
  }>;
}

export interface ChannelMessageStats {
  channelId: bigint;
  channelName: string;
  messageCount: number;
  uniqueUsers: number;
  averageMessagesPerUser: number;
  lastMessageAt: string;
  topUsers: Array<{
    userId: bigint;
    username: string;
    messageCount: number;
  }>;
}

export interface HourlyMessageStats {
  hour: number;
  messageCount: number;
  uniqueUsers: number;
  date: string;
}

export interface MessageActivityGraph {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }>;
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

export interface MessageCountExportRequest {
  startDate: string;
  endDate: string;
  format: 'csv' | 'json';
  includeUsers: boolean;
  includeChannels: boolean;
  includeHourly: boolean;
}