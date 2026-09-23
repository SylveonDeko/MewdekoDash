// lib/api/streamnotifications/models/Stream.ts

/**
 * Numeric stream platform type as stored by the bot's FType enum. The values
 * are not contiguous (0, 3, 4, 5, 6, 7), so this must never be treated as a
 * sequential index.
 */
export enum StreamType {
  Twitch = 0,
  Picarto = 3,
  YouTube = 4,
  Facebook = 5,
  Trovo = 6,
  Kick = 7,
}

/**
 * A stream followed for notifications in a guild.
 */
export interface FollowedStream {
  index: number;
  id: number;
  channelId: bigint;
  username: string;
  type: StreamType;
  /** Server-derived display name for `type` (e.g. "YouTube"). Prefer this over deriving the platform from `type` locally. */
  typeName?: string | null;
  onlineMessage: string | null;
  offlineMessage: string | null;
  dateAdded: string | null;
  channelName: string | null;
}

export interface FollowStreamRequest {
  channelId: bigint;
  url: string;
}

/**
 * A single entry in `StreamStats.streamsByType`. Returned as an array by the
 * bot API, not a dictionary keyed by type.
 */
export interface StreamTypeCount {
  type: StreamType;
  typeName: string;
  count: number;
}

/**
 * A single entry in `StreamStats.streamsByChannel`.
 */
export interface StreamChannelCount {
  channelId: bigint;
  count: number;
}

/**
 * The longest-followed stream in a guild, or null when no streams are followed.
 */
export interface OldestStream {
  username: string;
  type: StreamType;
  typeName: string;
  dateAdded: string | null;
}

/**
 * Aggregate stream statistics for a guild.
 */
export interface StreamStats {
  totalStreams: number;
  streamsByType: StreamTypeCount[];
  streamsByChannel: StreamChannelCount[];
  oldestStream: OldestStream | null;
}

/**
 * A distinct streamer (by username and platform) followed in a guild.
 */
export interface UniqueStreamer {
  username: string;
  type: StreamType;
  typeName: string;
  followCount: number;
}
