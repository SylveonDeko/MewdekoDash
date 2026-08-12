// lib/api/feeds/models/Feed.ts

export interface FeedSub {
  /** Database primary key. Not accepted by the update and remove endpoints, use `index`. */
  id: number;

  /** Position in the guild's feed list, and the identifier every other feed endpoint takes. */
  index: number;

  channelId: bigint;
  url: string;
  message: string | null;
  dateAdded: string | null;
  channelName?: string;
}

export interface AddFeedRequest {
  channelId: bigint;
  url: string;
}
