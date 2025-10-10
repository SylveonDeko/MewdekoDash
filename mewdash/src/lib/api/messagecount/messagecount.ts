// lib/api/messagecount/messagecount.ts
import { apiRequest } from "../core";
import type {
  DailyMessageStats,
  ChannelMessageStats,
  UserMessageStats,
  MessageStatsResponse,
} from "./models";

export const messageCountApi = {
  getDailyMessageStats: (guildId: bigint) =>
    apiRequest<DailyMessageStats>(`messagecount/${guildId}/daily`),

  getChannelMessageStats: (guildId: bigint, channelId: bigint) =>
    apiRequest<ChannelMessageStats>(
      `messagecount/${guildId}/channel/${channelId}`,
    ),

  getUserMessageStats: (guildId: bigint, userId: bigint) =>
    apiRequest<UserMessageStats>(`messagecount/${guildId}/user/${userId}`),

  getMessageLeaderboard: (guildId: bigint, limit: number = 10) =>
    apiRequest<any>(`messagecount/${guildId}/leaderboard?limit=${limit}`),

  getMessageStats: (guildId: bigint) =>
    apiRequest<MessageStatsResponse>(`messagecount/${guildId}/stats`),

  getMessageCountStatus: (guildId: bigint) =>
    apiRequest<{ enabled: boolean }>(`messagecount/${guildId}/status`),

  toggleMessageCount: (guildId: bigint) =>
    apiRequest<{ enabled: boolean; message: string }>(
      `messagecount/${guildId}/toggle`,
      "POST",
    ),

  resetMessageCounts: (
    guildId: bigint,
    userId?: bigint | null,
    channelId?: bigint | null,
  ) =>
    apiRequest<{ message: string }>(
      `messagecount/${guildId}/reset${userId ? `?userId=${userId}` : ""}${channelId ? `${userId ? "&" : "?"}channelId=${channelId}` : ""}`,
      "POST",
    ),
};
