// src/lib/types/music.ts
export interface Track {
  Title: string;
  Identifier: string;
  Author: string;
  Duration: string;
  IsLiveStream: boolean;
  IsSeekable: boolean;
  Uri: string;
  ArtworkUri: string;
  Isrc: string | null;
  SourceName: string;
  StartPosition: string | null;
  ProbeInfo: any | null;
  Provider: number;
  AdditionalInformation: Record<string, any>;
}

export interface Requester {
  Id: number;
  Username: string;
  AvatarUrl: string;
}

export interface TrackInfo {
  Index: number;
  Track: Track;
  Requester: Requester;
}

export interface Position {
  SystemClock: {
    UtcNow: string;
  };
  SyncedAt: string;
  UnstretchedRelativePosition: string;
  TimeStretchFactor: number;
  RelativePosition: string;
  UnstretchedUnsyncedDuration: string;
  UnsyncedDuration: string;
  UnstretchedPosition: string;
  Position: string;
  IsStretched: boolean;
}

export interface Filters {
  BassBoost: boolean;
  Nightcore: boolean;
  Vaporwave: boolean;
  Karaoke: boolean;
  Tremolo: boolean;
  Vibrato: boolean;
  Rotation: boolean;
  Distortion: boolean;
  ChannelMix: boolean;
}

export interface MusicStatus {
  CurrentTrack: TrackInfo;
  Queue: TrackInfo[];
  State: number;
  Volume: number;
  Position: Position;
  RepeatMode: number;
  Filters: Filters;
  IsInVoiceChannel: boolean;
}