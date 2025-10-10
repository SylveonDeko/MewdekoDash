// lib/api/feeds/models/Feed.ts

export interface FeedSub {
  id: number;
  channelId: bigint;
  url: string;
  message: string | null;
  dateAdded: string | null;
}

export interface AddFeedRequest {
  channelId: bigint;
  url: string;
}
