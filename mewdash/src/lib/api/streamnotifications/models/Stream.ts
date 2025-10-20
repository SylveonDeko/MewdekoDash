// lib/api/streamnotifications/models/Stream.ts

export enum StreamType {
  Twitch = 0,
  Picarto = 3,
  YouTube = 4,
  Trovo = 6,
  Kick = 7,
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
