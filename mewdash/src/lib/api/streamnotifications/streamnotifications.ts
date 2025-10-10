// lib/api/streamnotifications/streamnotifications.ts
import { apiRequest } from "../core";
import type { FollowedStream, FollowStreamRequest } from "./models";

export const streamNotificationsApi = {
  getFollowedStreams: (guildId: bigint) =>
    apiRequest<FollowedStream[]>(`StreamNotifications/${guildId}`),

  followStream: (guildId: bigint, request: FollowStreamRequest) =>
    apiRequest<{ platform: string; username: string; streamUrl: string }>(
      `StreamNotifications/${guildId}`,
      "POST",
      request,
    ),

  unfollowStream: (guildId: bigint, index: number) =>
    apiRequest<void>(`StreamNotifications/${guildId}/${index}`, "DELETE"),

  clearAllStreams: (guildId: bigint) =>
    apiRequest<{ removedCount: number }>(
      `StreamNotifications/${guildId}`,
      "DELETE",
    ),

  setStreamOnlineMessage: (guildId: bigint, index: number, message: string) =>
    apiRequest<void>(
      `StreamNotifications/${guildId}/${index}/onlineMessage`,
      "PUT",
      message,
    ),

  setStreamOfflineMessage: (guildId: bigint, index: number, message: string) =>
    apiRequest<void>(
      `StreamNotifications/${guildId}/${index}/offlineMessage`,
      "PUT",
      message,
    ),

  getCustomStreamMessage: (guildId: bigint) =>
    apiRequest<string>(`StreamNotifications/${guildId}/customMessage`),

  setCustomStreamMessage: (guildId: bigint, message: string) =>
    apiRequest<void>(
      `StreamNotifications/${guildId}/customMessage`,
      "POST",
      message,
    ),

  getOfflineNotificationSetting: (guildId: bigint) =>
    apiRequest<boolean>(`StreamNotifications/${guildId}/offlineNotifications`),

  toggleOfflineNotifications: (guildId: bigint) =>
    apiRequest<{ offlineNotificationsEnabled: boolean }>(
      `StreamNotifications/${guildId}/offlineNotifications/toggle`,
      "POST",
    ),

  getStreamStats: (guildId: bigint) =>
    apiRequest<any>(`StreamNotifications/${guildId}/stats`),

  getUniqueStreamers: (guildId: bigint) =>
    apiRequest<any[]>(`StreamNotifications/${guildId}/streamers`),
};
