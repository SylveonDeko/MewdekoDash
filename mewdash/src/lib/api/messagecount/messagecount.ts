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
  ) => {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId.toString());
    if (channelId) params.set("channelId", channelId.toString());
    const qs = params.toString();
    const suffix = qs ? `?${qs}` : "";
    return apiRequest<{ message: string; removedAny: boolean }>(
      `messagecount/${guildId}/reset${suffix}`,
      "POST",
    );
  },
};
