// lib/api/music/music.ts
import { apiRequest } from "../core";
import type {
  MusicStatus,
  PlayRequest,
  SeekRequest,
  MusicPlayerSetting,
  Track,
  QueueTrack,
} from "./models";

/**
 * Music API
 * Maps to Mewdeko.Controllers.MusicController
 */
export const musicApi = {
  /**
   * Gets the current player state and track information
   * @param guildId The guild ID
   * @param userId The user ID making the request
   * @returns Player status including current track, queue, and settings
   */
  getPlayerStatus: (guildId: bigint, userId: bigint) =>
    apiRequest<MusicStatus>(`music/${guildId}/status?userId=${userId}`),

  /**
   * Searches for tracks using the provided query
   * @param guildId The guild ID
   * @param query The search query
   * @param platform Search platform (youtube, spotify, soundcloud)
   * @param limit Maximum number of results (1-25)
   * @returns List of matching tracks
   */
  searchTracks: (
    guildId: bigint,
    query: string,
    platform: string = "youtube",
    limit: number = 10,
  ) =>
    apiRequest<{ tracks: Track[] }>(
      `Music/${guildId}/search?query=${encodeURIComponent(query)}&mode=${platform}&limit=${limit}`,
    ),

  /**
   * Extracts track information from a URL
   * @param guildId The guild ID
   * @param url The track URL
   * @returns Track information
   */
  extractTrack: (guildId: bigint, url: string) =>
    apiRequest<Track>(
      `Music/${guildId}/extract?url=${encodeURIComponent(url)}`,
    ),

  /**
   * Plays or enqueues a track
   * @param guildId The guild ID
   * @param playRequest Play request with URL and requester info
   * @returns The loaded track and its position in queue
   */
  playTrack: (guildId: bigint, playRequest: PlayRequest) =>
    apiRequest<{ track: Track; position: number }>(
      `Music/${guildId}/play`,
      "POST",
      playRequest,
    ),

  /**
   * Plays a specific track from the queue by index
   * @param guildId The guild ID
   * @param index The queue index
   * @returns Result with track information
   */
  playTrackAt: (guildId: bigint, index: number) =>
    apiRequest<{ message: string; track: QueueTrack }>(
      `music/${guildId}/play-track/${index}`,
      "POST",
    ),

  /**
   * Pauses or resumes playback
   * @param guildId The guild ID
   * @returns New player state
   */
  pauseResume: (guildId: bigint) =>
    apiRequest<{ state: number }>(`music/${guildId}/pause`, "POST"),

  /**
   * Gets the current queue
   * @param guildId The guild ID
   * @returns Music queue
   */
  getQueue: (guildId: bigint) =>
    apiRequest<QueueTrack[]>(`music/${guildId}/queue`),

  /**
   * Clears the entire queue
   * @param guildId The guild ID
   */
  clearQueue: (guildId: bigint) =>
    apiRequest<void>(`music/${guildId}/queue`, "DELETE"),

  /**
   * Removes a track from the queue
   * @param guildId The guild ID
   * @param index The track index to remove
   */
  removeTrack: (guildId: bigint, index: number) =>
    apiRequest<void>(`music/${guildId}/queue/${index}`, "DELETE"),

  /**
   * Sets the player volume
   * @param guildId The guild ID
   * @param volume Volume level (0-100)
   * @returns New volume level
   */
  setVolume: (guildId: bigint, volume: number) =>
    apiRequest<{ volume: number }>(`music/${guildId}/volume/${volume}`, "POST"),

  /**
   * Seeks to a position in the current track
   * @param guildId The guild ID
   * @param request Seek request with position in seconds
   */
  seek: (guildId: bigint, request: SeekRequest) =>
    apiRequest<void>(`music/${guildId}/seek`, "POST", request),

  /**
   * Skips to the next track
   * @param guildId The guild ID
   */
  skipTrack: (guildId: bigint) =>
    apiRequest<void>(`music/${guildId}/skip`, "POST"),

  /**
   * Goes to the previous track
   * @param guildId The guild ID
   */
  previousTrack: (guildId: bigint) =>
    apiRequest<void>(`music/${guildId}/previous`, "POST"),

  /**
   * Shuffles the queue
   * @param guildId The guild ID
   */
  shuffleQueue: (guildId: bigint) =>
    apiRequest<void>(`music/${guildId}/shuffle`, "POST"),

  /**
   * Sets the repeat mode
   * @param guildId The guild ID
   * @param mode Repeat mode (off/0, track/1, queue/2)
   * @returns New repeat mode
   */
  setRepeatMode: (guildId: bigint, mode: string) =>
    apiRequest<{ repeatMode: number }>(
      `music/${guildId}/repeat/${mode}`,
      "POST",
    ),

  /**
   * Gets music player settings
   * @param guildId The guild ID
   * @returns Current settings
   */
  getMusicSettings: (guildId: bigint) =>
    apiRequest<MusicPlayerSetting>(`music/${guildId}/settings`),

  /**
   * Updates music player settings
   * @param guildId The guild ID
   * @param settings Settings to update
   * @returns Updated settings
   */
  updateMusicSettings: (guildId: bigint, settings: MusicPlayerSetting) =>
    apiRequest<MusicPlayerSetting>(
      `music/${guildId}/settings`,
      "POST",
      settings,
    ),

  /**
   * Toggles an audio filter
   * @param guildId The guild ID
   * @param filterName Filter name (bass, nightcore, vaporwave, etc.)
   * @param enable Whether to enable the filter
   * @returns Filter status
   */
  toggleFilter: (guildId: bigint, filterName: string, enable: boolean) =>
    apiRequest<{ filter: string; enabled: boolean }>(
      `music/${guildId}/filter/${filterName}`,
      "POST",
      enable,
    ),
};
