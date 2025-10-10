// lib/api/streamnotifications/models/Stream.ts

export enum StreamType {
  Twitch = 0,
  YouTube = 1,
  Trovo = 2,
  Facebook = 3,
}

export interface FollowedStream {
  id: number;
  channelId: bigint;
  username: string;
  type: StreamType;
  onlineMessage: string | null;
  offlineMessage: string | null;
  dateAdded: string | null;
}

export interface FollowStreamRequest {
  channelId: bigint;
  url: string;
}
