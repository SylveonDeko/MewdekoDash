// lib/api/music/models/Music.ts

/**
 * Music player settings
 * Maps to DataModel.MusicPlayerSetting
 */
export interface MusicPlayerSetting {
  id: number;
  guildId: bigint;
  playerRepeat: number;
  musicChannelId: bigint | null;
  volume: number;
  autoDisconnect: number;
  autoPlay: number;
  djRoleId: bigint | null;
  voteSkipEnabled: boolean;
  voteSkipThreshold: number;
}

/**
 * Partial user for track requester
 */
export interface PartialUser {
  id?: bigint;
  username?: string;
  avatarUrl?: string;
  Id?: bigint;
  Username?: string;
  AvatarUrl?: string;
}

/**
 * Play request
 * Maps to Mewdeko.Controllers.Common.Music.PlayRequest
 */
export interface PlayRequest {
  url: string;
  requester: PartialUser;
}

/**
 * Seek request
 * Maps to Mewdeko.Controllers.Common.Music.SeekRequest
 */
export interface SeekRequest {
  position?: number;
  Position?: number;
}

/**
 * Track information
 */
export interface Track {
  Title: string;
  Author: string;
  Duration: string;
  Uri: string;
  ArtworkUri: string;
  Provider: string;
  SourceName?: string;
}

export interface QueueTrack {
  Index: number;
  Track: Track;
  Requester: PartialUser;
}

// TTS Types

export interface TtsGuildSettings {
  volume: number;
  speed: number;
  defaultVoice: string | null;
  replyContext: boolean;
  attachmentNarration: boolean;
  consecutiveGrouping: boolean;
  maxQueueSize: number;
  roleId: bigint | null;
  vcSettings: TtsVcSetting[];
}

export interface TtsVcSetting {
  voiceChannelId: bigint;
  enabled: boolean;
  linkedTextChannelId: bigint | null;
  announceJoinLeave: boolean;
  joinFormat: string | null;
  leaveFormat: string | null;
}

export interface TtsVcSettingRequest {
  voiceChannelId: bigint;
  enabled: boolean;
  linkedTextChannelId: bigint | null;
  announceJoinLeave: boolean;
  joinFormat: string | null;
  leaveFormat: string | null;
}

export interface TtsGuildSettingsRequest {
  volume?: number;
  speed?: number;
  defaultVoice?: string;
  replyContext?: boolean;
  attachmentNarration?: boolean;
  consecutiveGrouping?: boolean;
  maxQueueSize?: number;
  roleId?: bigint;
}

export interface TtsBlockedUser {
  userId: bigint;
  guildId: bigint;
}

export interface TtsVoice {
  name: string;
  source: string;
  language: { name: string; code: string };
}

export interface MusicStatus {
  CurrentTrack: QueueTrack | null;
  Queue: QueueTrack[];
  State: number;
  Volume: number;
  Position: any;
  RepeatMode: number;
  Filters: {
    BassBoost: boolean;
    Nightcore: boolean;
    Vaporwave: boolean;
    Karaoke: boolean;
    Tremolo: boolean;
    Vibrato: boolean;
    Rotation: boolean;
    Distortion: boolean;
    ChannelMix: boolean;
  };
  IsInVoiceChannel: boolean;
  BotInChannel?: boolean;
  ChannelId?: bigint;
  ChannelName?: string;
  Disconnected?: boolean;
}
