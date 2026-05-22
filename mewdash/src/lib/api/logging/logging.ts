// lib/api/logging/logging.ts
import { apiRequest } from "../core";
import type {
  LoggingConfigurationResponse,
  LogType,
  SetIgnoredChannelsRequest,
  BulkUpdateLogChannelsRequest,
} from "./models";

export const loggingApi = {
  getLoggingConfig: (guildId: bigint) =>
    apiRequest<LoggingConfigurationResponse>(
      `logging/${guildId}/configuration`,
    ),

  setLogChannel: (
    guildId: bigint,
    logType: LogType,
    channelId: bigint | null,
  ) =>
    apiRequest<{ success: boolean; logType: string; channelId: bigint | null }>(
      `logging/${guildId}/log-type/${logType}`,
      "PUT",
      { channelId },
    ),

  setLogCategory: (
    guildId: bigint,
    category: string,
    channelId: bigint | null,
  ) =>
    apiRequest<{
      success: boolean;
      category: string;
      channelId: bigint | null;
    }>(`logging/${guildId}/log-category/${category}`, "PUT", {
      channelId,
    }),

  toggleIgnoredChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<{
      success: boolean;
      channelId: bigint;
      action: string;
      currentIgnoredChannels: bigint[];
    }>(`logging/${guildId}/ignored-channels/${channelId}`, "POST"),

  getIgnoredChannels: (guildId: bigint) =>
    apiRequest<{ ignoredChannels: bigint[] }>(
      `logging/${guildId}/ignored-channels`,
    ),

  setIgnoredChannels: (guildId: bigint, request: SetIgnoredChannelsRequest) =>
    apiRequest<{ success: boolean; ignoredChannels: bigint[] }>(
      `logging/${guildId}/ignored-channels`,
      "PUT",
      request,
    ),

  clearIgnoredChannels: (guildId: bigint) =>
    apiRequest<{ success: boolean; message: string }>(
      `logging/${guildId}/ignored-channels`,
      "DELETE",
    ),

  bulkUpdateLogChannels: (
    guildId: bigint,
    updates: BulkUpdateLogChannelsRequest,
  ) =>
    apiRequest<{ results: any[] }>(
      `logging/${guildId}/bulk-update`,
      "PUT",
      updates,
    ),

  disableAllLogging: (guildId: bigint) =>
    apiRequest<{ success: boolean; message: string }>(
      `logging/${guildId}/disable-all`,
      "DELETE",
    ),

  getLoggingStatistics: (guildId: bigint) =>
    apiRequest<any>(`logging/${guildId}/statistics`),
};
