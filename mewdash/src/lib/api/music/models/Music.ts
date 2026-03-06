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
  id: bigint;
  username: string;
  avatarUrl: string;
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
  position: number;
}

/**
 * Track information
 */
export interface Track {
  title: string;
  author: string;
  duration: string;
  uri: string;
  artworkUri: string;
  provider: string;
}

/**
 * Track in queue
 */
export interface QueueTrack {
  index: number;
  track: Track;
  requester: PartialUser;
}

/**
 * Music player status
 */
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
  currentTrack: QueueTrack | null;
  queue: QueueTrack[];
  state: number;
  volume: number;
  position: any;
  repeatMode: number;
  filters: {
    bassBoost: boolean;
    nightcore: boolean;
    vaporwave: boolean;
    karaoke: boolean;
    tremolo: boolean;
    vibrato: boolean;
    rotation: boolean;
    distortion: boolean;
    channelMix: boolean;
  };
  isInVoiceChannel: boolean;
  botInChannel?: boolean;
  channelId?: bigint;
  channelName?: string;
  disconnected?: boolean;
}
