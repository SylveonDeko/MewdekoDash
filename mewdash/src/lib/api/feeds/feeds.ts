// lib/api/feeds/feeds.ts
import { apiRequest } from "../core";
import type { FeedSub, AddFeedRequest } from "./models";

export const feedsApi = {
  getFeeds: (guildId: bigint) => apiRequest<FeedSub[]>(`Feeds/${guildId}`),

  addFeed: (guildId: bigint, request: AddFeedRequest) =>
    apiRequest<void>(`Feeds/${guildId}`, "POST", request),

  setFeedMessage: (guildId: bigint, index: number, message: string) =>
    apiRequest<void>(`Feeds/${guildId}/${index}/message`, "PUT", message),

  removeFeed: (guildId: bigint, index: number) =>
    apiRequest<void>(`Feeds/${guildId}/${index}`, "DELETE"),

  getFeedStats: (guildId: bigint) => apiRequest<any>(`Feeds/${guildId}/stats`),

  getUniqueFeedUrls: (guildId: bigint) =>
    apiRequest<string[]>(`Feeds/${guildId}/urls`),
};
