// src/lib/types/music.ts
export interface Track {
  title: string;
  identifier: string;
  author: string;
  duration: string;
  isLiveStream: boolean;
  isSeekable: boolean;
  uri: string;
  artworkUri: string;
  isrc: string | null;
  sourceName: string;
  startPosition: string | null;
  probeInfo: any | null;
  provider: number;
  additionalInformation: Record<string, any>;
}

export interface Requester {
  id: number;
  username: string;
  avatarUrl: string;
}

export interface TrackInfo {
  index: number;
  track: Track;
  requester: Requester;
}

export interface Position {
  systemClock: {
    utcNow: string;
  };
  syncedAt: string;
  unstretchedRelativePosition: string;
  timeStretchFactor: number;
  relativePosition: string;
  unstretchedUnsyncedDuration: string;
  unsyncedDuration: string;
  unstretchedPosition: string;
  position: string;
  isStretched: boolean;
}

export interface Filters {
  bassBoost: boolean;
  nightcore: boolean;
  vaporwave: boolean;
  karaoke: boolean;
  tremolo: boolean;
  vibrato: boolean;
  rotation: boolean;
  distortion: boolean;
  channelMix: boolean;
}

export interface MusicStatus {
  currentTrack: TrackInfo;
  queue: TrackInfo[];
  state: number;
  volume: number;
  position: Position;
  repeatMode: number;
  filters: Filters;
  isInVoiceChannel: boolean;
}