<!--
@component
A comprehensive music player component for Discord bot music functionality.

- Displays currently playing track with album artwork and progress
- Provides playback controls (play/pause, skip, volume, etc.)
- Shows and manages the music queue
- Integrates with dynamic color themes based on album artwork
- Supports search and adding tracks to queue

@example
```svelte
<MusicPlayer bind:musicStatus={status} />
```
-->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    Clock,
    Disc,
    List,
    Mic2,
    Pause,
    Play,
    PlusCircle,
    Repeat,
    Search,
    SkipBack,
    SkipForward,
    Volume,
    Volume1,
    Volume2,
    VolumeX
  } from "lucide-svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";
  import type { MusicStatus, Requester, TrackInfo } from "$lib/types/music";
  import { musicPlayerColors } from "$lib/stores/musicPlayerColorStore";
  import MusicSearch from "./MusicSearch.svelte";

  export let musicStatus: MusicStatus;

  let isRotationEnabled = true;
  let selectedQueueItem = -1;
  let isSearchModalOpen = false; // New state for search modal

  let progressInterval: number | null = null;
  let currentProgress = 0;
  let serverTimeDiff = 0;
  let lastSyncedPosition = 0;
  let progressBarElement: HTMLDivElement;
  let volumeSliderElement: HTMLInputElement;
  let isTransitioning = false;
  let lastAnimationTimestamp = 0;
  let smoothProgress = 0;
  let lastMusicStatusUpdate = 0;
  const UPDATE_DEBOUNCE_TIME = 250; // ms - prevents too frequent updates

  // Function to determine if a track is currently playing
  function isCurrentlyPlaying(track: TrackInfo): boolean {
    if (!musicStatus?.CurrentTrack?.Track) return false;

    // Compare by title and author to identify the same track
    return track.Track.Title === musicStatus.CurrentTrack.Track.Title &&
      track.Track.Author === musicStatus.CurrentTrack.Track.Author;
  }

  function getSeconds(timeStr: string): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(":");
    return parts.length === 3
      ? parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2])
      : 0;
  }

  function formatTime(time: any): string {
    if (!time) return "0:00";
    if (typeof time === "string") {
      const parts = time.split(":");
      if (parts.length === 3) {
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const seconds = parseInt(parts[2]);
        return `${hours * 60 + minutes}:${seconds.toString().padStart(2, "0")}`;
      } else if (parts.length === 2) {
        return time;
      }
    }
    if (typeof time === "object" && time.RelativePosition) {
      const match = time.RelativePosition.match(/(\d+):(\d+)\.(\d+)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
      }
    }
    return "0:00";
  }

  function getVolumeIcon(volume: number) {
    if (volume === 0) return VolumeX;
    if (volume < 0.33) return Volume;
    if (volume < 0.67) return Volume1;
    return Volume2;
  }

  function syncTimeWithServer() {
    if (!musicStatus?.Position) return;

    const serverTime = new Date(musicStatus.Position.SystemClock.UtcNow).getTime();
    const localTime = Date.now();
    serverTimeDiff = serverTime - localTime;

    const SyncedAt = new Date(musicStatus.Position.SyncedAt).getTime();
    lastSyncedPosition = getSeconds(musicStatus.Position.RelativePosition);

    const timeSinceSync = (localTime + serverTimeDiff - SyncedAt) / 1000;
    currentProgress = lastSyncedPosition + timeSinceSync;

    // Initialize smooth progress on first sync
    if (smoothProgress === 0 || Math.abs(smoothProgress - currentProgress) > 1) {
      smoothProgress = currentProgress;
    }
  }

  function updateProgress(timestamp = performance.now()) {
    if (musicStatus?.State !== 2) return; // Not playing

    // Calculate time delta since last frame for smooth interpolation
    const delta = lastAnimationTimestamp ? (timestamp - lastAnimationTimestamp) / 1000 : 0;
    lastAnimationTimestamp = timestamp;

    if (musicStatus?.State === 2) { // 2 = Playing
      // Get basic time progression
      const now = Date.now();
      const SyncedAt = new Date(musicStatus.Position.SyncedAt).getTime();
      const timeSinceSync = (now + serverTimeDiff - SyncedAt) / 1000;

      const TimeStretchFactor = musicStatus.Position.TimeStretchFactor || 1;

      // Calculate the actual position from server data
      const actualPosition = lastSyncedPosition + (timeSinceSync * TimeStretchFactor);

      // Smoothly interpolate between current displayed position and actual position
      if (Math.abs(smoothProgress - actualPosition) > 1) {
        // If difference is large (like after a seek), jump immediately
        smoothProgress = actualPosition;
      } else {
        // Otherwise, smoothly interpolate (easing)
        smoothProgress += (actualPosition - smoothProgress) * Math.min(1, delta * 5);
      }

      // Update the UI with smoothed progress
      currentProgress = smoothProgress;

      // Handle looping if needed
      const duration = getSeconds(musicStatus.CurrentTrack.Track.Duration);
      if (musicStatus.RepeatMode === 2 && currentProgress > duration) {
        currentProgress = currentProgress % duration;
        smoothProgress = currentProgress;
      }

      // Continue animation loop
      progressInterval = requestAnimationFrame(updateProgress);
    }
  }

  /**
   * Handles seeking to a specific position in the current track
   * Uses the SeekRequest model expected by the backend API
   */
  async function handleSeek(event: MouseEvent | KeyboardEvent) {
    if (!progressBarElement || !musicStatus?.CurrentTrack?.Track?.Duration) return;

    let percentage = 0;

    if (event instanceof MouseEvent) {
      const rect = progressBarElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      percentage = Math.max(0, Math.min(1, x / rect.width));
    } else if (event instanceof KeyboardEvent) {
      // Handle keyboard navigation (left/right arrows)
      if (event.key === "ArrowLeft") {
        percentage = Math.max(0, (currentProgress - 5) / getSeconds(musicStatus.CurrentTrack.Track.Duration));
      } else if (event.key === "ArrowRight") {
        percentage = Math.min(1, (currentProgress + 5) / getSeconds(musicStatus.CurrentTrack.Track.Duration));
      } else {
        return; // Not a handled key
      }
    }

    const duration = getSeconds(musicStatus.CurrentTrack.Track.Duration);
    const seekTime = Math.floor(duration * percentage);

    try {
      if (!$currentGuild?.id) return;

      // Create the request object matching the SeekRequest model
      const seekRequest = {
        Position: seekTime
      };

      await api.seek($currentGuild.id, seekRequest);

      // Update current progress immediately for smoother UX
      currentProgress = seekTime;

      // Announce to screen readers
      const minutes = Math.floor(seekTime / 60);
      const seconds = seekTime % 60;
      const announcement = `Seeking to ${minutes}:${seconds.toString().padStart(2, "0")}`;
      announceToScreenReader(announcement);
    } catch (err) {
      logger.error("Failed to seek:", err);
      announceToScreenReader("Failed to seek");
    }
  }

  async function togglePlayPause() {
    try {
      if (!$currentGuild?.id) return;

      // Call the API to toggle playback
      await api.pauseResume($currentGuild.id);

      // Handle silent audio element for MediaSession API
      if (silentAudioElement) {
        if (musicStatus.State !== 2) { // Will become playing
          // Only try to play if we're not already in the middle of a play operation
          if (!audioPlayPromisePending && silentAudioElement.paused) {
            audioPlayPromisePending = true;

            try {
              await silentAudioElement.play();
              audioPlayPromisePending = false;
            } catch (e) {
              audioPlayPromisePending = false;
              logger.debug("Silent audio play prevented:", e);
              // Continue anyway - this is just for MediaSession support
            }
          }
        } else { // Will become paused
          // Only pause if not in the middle of a play operation
          if (!audioPlayPromisePending && !silentAudioElement.paused) {
            silentAudioElement.pause();
          }
        }
      }

      // Announce to screen readers
      const action = musicStatus.State === 2 ? "Paused" : "Playing";
      announceToScreenReader(action);
    } catch (err) {
      logger.error("Failed to toggle playback:", err);
      announceToScreenReader("Failed to toggle playback");
    }
  }

  async function skipTrack() {
    try {
      if (!$currentGuild?.id) return;
      await api.skipTrack($currentGuild.id);
      announceToScreenReader("Skipped to next track");
    } catch (err) {
      logger.error("Failed to skip track:", err);
      announceToScreenReader("Failed to skip track");
    }
  }

  async function previousTrack() {
    try {
      if (!$currentGuild?.id) return;
      await api.previousTrack($currentGuild.id);
      announceToScreenReader("Previous track");
    } catch (err) {
      logger.error("Failed to go to previous track:", err);
      announceToScreenReader("Failed to go to previous track");
    }
  }

  // New function: Play a specific track from the queue
  async function playQueueItem(index: number) {
    try {
      if (!$currentGuild?.id) return;

      // Set as selected before API call for better UX
      selectedQueueItem = index;

      // Get the track from the queue
      const track = musicStatus.Queue[index];

      // Call the API function to play a specific track
      await api.playTrackAt($currentGuild.id, track.Index);

      // Announce to screen readers
      announceToScreenReader(`Playing ${track.Track.Title}`);
    } catch (err) {
      logger.error("Failed to play queue item:", err);
      announceToScreenReader("Failed to play selected track");
      selectedQueueItem = -1; // Reset selection on error
    }
  }

  // Queue item keyboard handling
  function handleQueueItemKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      playQueueItem(index);
    }
  }

  // Toggle album rotation
  function toggleRotation() {
    isRotationEnabled = !isRotationEnabled;
    announceToScreenReader(isRotationEnabled ? "Album rotation enabled" : "Album rotation disabled");
  }

  async function handleVolumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    try {
      if (!$currentGuild?.id) return;
      const newVolume = parseInt(input.value);
      await api.setVolume($currentGuild.id, newVolume);

      // Announce volume change to screen readers
      announceToScreenReader(`Volume ${newVolume}%`);
    } catch (err) {
      logger.error("Failed to update volume:", err);
      announceToScreenReader("Failed to update volume");
    }
  }

  // Keyboard navigation for volume
  function handleVolumeKeyDown(event: KeyboardEvent) {
    if (!volumeSliderElement) return;

    let newValue = parseInt(volumeSliderElement.value);
    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      newValue = Math.min(100, newValue + 5);
      volumeSliderElement.value = newValue.toString();
      volumeSliderElement.dispatchEvent(new Event("change"));
    } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      newValue = Math.max(0, newValue - 5);
      volumeSliderElement.value = newValue.toString();
      volumeSliderElement.dispatchEvent(new Event("change"));
    }
  }

  // Track song changes to detect rapid transitions
  let lastTrackId = "";
  let lastSongChangeTime = 0;
  let lastCheckedStatus = null;
  const RAPID_CHANGE_THRESHOLD = 400; // milliseconds

  function checkTrackChanged(force = false) {
    // Skip if no track data is available
    if (!musicStatus?.CurrentTrack?.Track) return false;

    // Skip redundant checks for the same status update
    const currentStatusJSON = JSON.stringify(musicStatus.CurrentTrack);
    if (!force && currentStatusJSON === lastCheckedStatus) return false;
    lastCheckedStatus = currentStatusJSON;

    // Create a unique ID for the current track
    const currentTrackId = `${musicStatus.CurrentTrack.Track.Title}-${musicStatus.CurrentTrack.Track.Author}`;

    // Only consider it changed if the track ID changed
    if (lastTrackId && lastTrackId !== currentTrackId) {
      const now = performance.now();
      const timeSinceLastChange = now - lastSongChangeTime;

      if (timeSinceLastChange < RAPID_CHANGE_THRESHOLD) {
        // If songs are being changed rapidly, skip the transitions
        musicPlayerColors.skipTransitions(500); // Skip transitions for 500ms
        logger.debug("Rapid track change detected, skipping color transition");
      } else {
        // Start transition animation
        isTransitioning = true;
        setTimeout(() => {
          isTransitioning = false;
        }, 500);
      }

      lastSongChangeTime = now;
      lastTrackId = currentTrackId;

      // Announce track change to screen readers
      announceToScreenReader(`Now playing: ${musicStatus.CurrentTrack.Track.Title} by ${musicStatus.CurrentTrack.Track.Author}`);

      return true; // Track changed
    }

    // Update the last track ID if it wasn't set
    if (!lastTrackId) {
      lastTrackId = currentTrackId;
    }

    return false; // Track didn't change
  }

  // Accessible screen reader announcements
  let screenReaderAnnouncement = "";

  function announceToScreenReader(message: string) {
    screenReaderAnnouncement = message;
    // Reset after a moment so it can be announced again if the same message is triggered
    setTimeout(() => {
      screenReaderAnnouncement = "";
    }, 1000);
  }

  // Handle keyboard shortcuts
  function handleGlobalKeydown(event: KeyboardEvent) {
    // Only respond to keyboard shortcuts if the player is active and user isn't typing in an input
    if (!musicStatus?.IsInVoiceChannel ||
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (event.code === "Space" && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      togglePlayPause();
    } else if (event.code === "ArrowRight" && event.ctrlKey) {
      event.preventDefault();
      skipTrack();
    } else if (event.code === "ArrowLeft" && event.ctrlKey) {
      event.preventDefault();
      previousTrack();
    }
  }

  // Register with MediaSession API
  function setupMediaSession() {
    // Check if MediaSession API is available
    if ("mediaSession" in navigator) {
      try {
        // Set initial metadata
        updateMediaSessionMetadata();

        // Register action handlers
        navigator.mediaSession.setActionHandler("play", () => {
          if (musicStatus?.State !== 2) togglePlayPause();
        });

        navigator.mediaSession.setActionHandler("pause", () => {
          if (musicStatus?.State === 2) togglePlayPause();
        });

        navigator.mediaSession.setActionHandler("previoustrack", () => {
          previousTrack();
        });

        navigator.mediaSession.setActionHandler("nexttrack", () => {
          skipTrack();
        });

        // Add seek controls if supported
        try {
          navigator.mediaSession.setActionHandler("seekto", (details) => {
            if (!musicStatus?.CurrentTrack?.Track?.Duration) return;

            const duration = getSeconds(musicStatus.CurrentTrack.Track.Duration);
            if (details.seekTime !== undefined && duration > 0) {
              const seekRequest = { Position: details.seekTime };
              if ($currentGuild?.id) {
                api.seek($currentGuild.id, seekRequest)
                  .then(() => {
                    currentProgress = details.seekTime;
                  })
                  .catch(err => {
                    logger.error("Failed to seek via MediaSession:", err);
                  });
              }
            }
          });

          // Set supported seek positions if seekto is supported
          navigator.mediaSession.setPositionState({
            duration: musicStatus?.CurrentTrack?.Track ? getSeconds(musicStatus.CurrentTrack.Track.Duration) : 0,
            position: currentProgress || 0,
            playbackRate: 1.0
          });
        } catch (error) {
          logger.debug("MediaSession seekto not supported", error);
        }

        logger.info("MediaSession API initialized successfully");
      } catch (err) {
        logger.error("Error setting up MediaSession:", err);
      }
    } else {
      logger.debug("MediaSession API not supported");
    }
  }

  // Update media session metadata when track changes
  function updateMediaSessionMetadata() {
    if (!("mediaSession" in navigator) || !musicStatus?.CurrentTrack?.Track) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: musicStatus.CurrentTrack.Track.Title || "Unknown Title",
        artist: musicStatus.CurrentTrack.Track.Author || "Unknown Artist",
        album: musicStatus.CurrentTrack.Track.SourceName || "",
        artwork: [
          {
            src: musicStatus.CurrentTrack.Track.ArtworkUri || "/default-album.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      });

      // Update the playback state
      navigator.mediaSession.playbackState = musicStatus.State === 2 ? "playing" : "paused";

      // Update position state if available and validate values
      if ("setPositionState" in navigator.mediaSession) {
        const duration = getSeconds(musicStatus.CurrentTrack.Track.Duration) || 0;
        let position = currentProgress || 0;

        if (position > duration && duration > 0) {
          position = duration;
        }

        // Only set position state if we have valid values
        if (duration > 0 && position >= 0) {
          try {
            navigator.mediaSession.setPositionState({
              duration: duration,
              position: position,
              playbackRate: 1.0
            });
          } catch (error) {
            // Silently handle position state errors
            logger.debug("MediaSession position state error:", error);
          }
        }
      }
    } catch (err) {
      logger.error("Error updating MediaSession metadata:", err);
    }
  }

  let silentAudioElement: HTMLAudioElement;
  let audioPlayPromisePending = false;

  // Set up a silent audio element to activate MediaSession API
  function setupSilentAudio() {
    if (!silentAudioElement) {
      silentAudioElement = new Audio();

      try {
        silentAudioElement.src = "/silent-audio.mp3";
        silentAudioElement.loop = true;
        silentAudioElement.volume = 0.01;

        // Add event listeners
        silentAudioElement.addEventListener("play", () => {
          updateMediaSessionMetadata();
        });

        logger.debug("Silent audio element initialized");
      } catch (err) {
        logger.error("Error setting up silent audio:", err);
      }
    }
  }

  // Function to ensure silent audio is playing when needed
  function ensureSilentAudioPlaying() {
    if (!silentAudioElement) return;

    if (musicStatus?.State === 2 && silentAudioElement.paused && !audioPlayPromisePending) {
      // Mark that we have a play operation in progress
      audioPlayPromisePending = true;

      // We need to play in response to user interaction
      const playPromise = silentAudioElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Successfully started playing
            audioPlayPromisePending = false;
          })
          .catch(err => {
            // Play was prevented or failed - this is okay, just log and continue
            audioPlayPromisePending = false;
            logger.debug("Silent audio play prevented:", err);

          });
      } else {
        // Promise not returned (older browsers), assume it worked
        audioPlayPromisePending = false;
      }
    } else if (musicStatus?.State !== 2 && !silentAudioElement.paused && !audioPlayPromisePending) {
      // Only pause if no play operation is in progress
      silentAudioElement.pause();
    }
  }

  // Add and remove global event listeners
  onMount(() => {
    window.addEventListener("keydown", handleGlobalKeydown);

    // Set up silent audio for MediaSession
    setupSilentAudio();

    // Initialize MediaSession API
    setupMediaSession();
  });

  /**
   * Handle music status updates with debouncing to prevent UI flicker
   * from frequent WebSocket updates (every second)
   */
  function handleMusicStatusUpdate(status) {
    if (!status?.CurrentTrack?.Track) return;

    const now = performance.now();
    // Only process updates that are sufficiently separated in time
    if (now - lastMusicStatusUpdate > UPDATE_DEBOUNCE_TIME) {
      // Check if track actually changed
      const currentTrackId = `${status.CurrentTrack.Track.Title}-${status.CurrentTrack.Track.Author}`;
      const trackChanged = lastTrackId !== currentTrackId && lastTrackId !== "";
      const initialLoad = !lastTrackId;

      if (trackChanged) {
        isTransitioning = true;
        setTimeout(() => {
          isTransitioning = false;
        }, 500);

        // Update colors only when track changes
        if (status.CurrentTrack.Track.ArtworkUri) {
          musicPlayerColors.updateFromArtwork(status.CurrentTrack.Track.ArtworkUri);
        }

        // Reset queue selection when track changes
        selectedQueueItem = -1;
      } else if (initialLoad && status.CurrentTrack.Track.ArtworkUri) {
        // Initial load - set colors without transition
        musicPlayerColors.updateFromArtwork(status.CurrentTrack.Track.ArtworkUri);
      }

      if (trackChanged || initialLoad) {
        lastTrackId = currentTrackId;
      }

      lastMusicStatusUpdate = now;
    }
  }

  // Process music status updates through the debounced handler
  $: if (musicStatus?.CurrentTrack?.Track) {
    handleMusicStatusUpdate(musicStatus);

    // Update MediaSession metadata when track changes
    updateMediaSessionMetadata();
  }

  // Update MediaSession playback state when playback state changes
  $: if (musicStatus?.State !== undefined) {
    // Try to sync silent audio with player state
    ensureSilentAudioPlaying();

    // Update media session if available
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = musicStatus.State === 2 ? "playing" : "paused";
    }
  }

  $: if (musicStatus) {
    // Reset animation timestamp when syncing to prevent jumps
    lastAnimationTimestamp = 0;

    syncTimeWithServer();

    // Initialize smooth progress with the current progress value
    if (Math.abs(smoothProgress - currentProgress) > 1) {
      smoothProgress = currentProgress;
    }

    if (musicStatus.State === 2 && !progressInterval) {
      // Start animation loop for smooth progress updates
      updateProgress();
    } else if (musicStatus.State !== 2 && progressInterval) {
      // Stop animation when not playing
      cancelAnimationFrame(progressInterval);
      progressInterval = null;
    }
  }

  // Get CSS variables for music player
  $: colors = $musicPlayerColors;

  // Calculate progress percentage for ARIA attributes
  $: progressPercentage = musicStatus?.CurrentTrack?.Track ?
    Math.round((currentProgress / Math.max(0.01, getSeconds(musicStatus.CurrentTrack.Track.Duration))) * 100) : 0;

  // Playback state for ARIA
  $: playbackState = musicStatus?.State === 2 ? "playing" : "paused";

  // Function to open search modal
  function openSearchModal() {
    isSearchModalOpen = true;
  }

  // Function to handle when a track is added through the search modal
  function handleTrackAdded(event) {
    isSearchModalOpen = false;
    announceToScreenReader(`Added ${event.detail.track.title} to queue`);
  }

  // Get user information for the requester field
  function getCurrentUser(): Requester {
    // This should be replaced with actual user information from your auth system
    return {
      Id: musicStatus?.CurrentTrack?.Requester?.Id || 0,
      Username: musicStatus?.CurrentTrack?.Requester?.Username || "Unknown User",
      AvatarUrl: musicStatus?.CurrentTrack?.Requester?.AvatarUrl || "/default-avatar.png"
    };
  }

  // Clean up on component destroy
  onDestroy(() => {
    if (progressInterval) {
      cancelAnimationFrame(progressInterval);
      progressInterval = null;
    }
    // Reset animation state
    lastAnimationTimestamp = 0;
    smoothProgress = 0;
    lastMusicStatusUpdate = 0;

    // Stop silent audio if it exists
    if (silentAudioElement) {
      silentAudioElement.pause();
      silentAudioElement.src = "";
      silentAudioElement = null;
    }

    // Clear MediaSession if supported
    if ("mediaSession" in navigator) {
      // Clear action handlers
      const actions = ["play", "pause", "previoustrack", "nexttrack", "seekto"];
      actions.forEach(action => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (e) {
          // Ignore errors for unsupported actions
        }
      });

      // Clear metadata
      try {
        navigator.mediaSession.metadata = null;
      } catch (e) {
        // Some browsers might not support clearing metadata
      }
    }

    musicPlayerColors.cleanup(); // Clean up any color transitions
    window.removeEventListener("keydown", handleGlobalKeydown);
  });
</script>

<div
  class="w-full backdrop-blur-sm rounded-2xl border p-4 md:p-6 shadow-2xl overflow-hidden transition-all duration-500"
  aria-label="Music Player"
  class:State-2={musicStatus?.State === 2}
  role="region"
  style="
    background: linear-gradient(135deg, {colors.gradientStart}, {colors.gradientEnd});
    border-color: {colors.foreground}40;
    --music-color: {colors.foreground};
    --music-text: {colors.text};
    --music-accent: {colors.accent};
    --music-foreground: {colors.foreground};
    --music-controls-highlight: {colors.controlsHighlight};
  "
>
  <!-- Screen reader announcements -->
  <div aria-live="polite" class="sr-only">
    {screenReaderAnnouncement}
  </div>

  <div class="flex flex-col md:flex-row gap-6">
    <!-- Album Art -->
    <div class="relative group w-full md:w-auto md:min-w-[160px] max-w-[220px] mx-auto md:mx-0">
      <!-- Rotation Toggle Button -->
      <button
        aria-label={isRotationEnabled ? "Disable rotation" : "Enable rotation"}
        class="absolute top-2 right-2 z-20 p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 hover:bg-opacity-40 focus:outline-none focus:ring-2"
        on:click={toggleRotation}
        style="background: var(--music-foreground)30; color: var(--music-text); --ring-color: var(--music-accent)"
      >
        <Disc class="w-4 h-4" />
      </button>

      <div class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
           style="background: radial-gradient(circle at center, var(--music-foreground)30 0%, transparent 70%);">
      </div>

      <div
        class={`relative overflow-hidden transition-all duration-300 ${isRotationEnabled ? "rounded-full" : "rounded-xl"} ${musicStatus?.State === 2 && isRotationEnabled ? "album-rotation" : ""}`}>
        <!-- Circular overlay for vinyl-like appearance -->
        <div class="absolute inset-0 z-10 vinyl-overlay">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-1/4 h-1/4 rounded-full bg-black opacity-20 z-20"></div>
          </div>
        </div>

        <img
          alt={musicStatus?.CurrentTrack?.Track ? `Album artwork for ${musicStatus.CurrentTrack.Track.Title} by ${musicStatus.CurrentTrack.Track.Author}` : "Album artwork"}
          class={`w-full lg:w-[160px] h-[160px] object-cover transition-transform duration-300 group-hover:scale-105 ${isRotationEnabled ? "rounded-full" : "rounded-xl"} ${isTransitioning ? "track-image-transition" : ""}`}
          src={musicStatus?.CurrentTrack?.Track?.ArtworkUri || '/default-album.png'}
        />

        <!-- Vinyl record effect when playing -->
        {#if musicStatus?.State === 2 && isRotationEnabled}
          <div class="vinyl-effect"></div>
        {/if}
      </div>
    </div>

    <!-- Track Info & Controls -->
    <div class="flex-grow flex flex-col gap-4 min-w-0">
      <div class="w-full">
        <div class="flex flex-wrap items-center gap-2 mb-2">
          {#if musicStatus?.CurrentTrack?.Track?.SourceName}
            <span
              class="px-3 py-1 rounded-full text-xs font-medium truncate max-w-full"
              style="background: var(--music-foreground)20; color: var(--music-foreground);"
            >
              {musicStatus.CurrentTrack.Track.SourceName}
            </span>
          {/if}

          <!-- Repeat mode indicator -->
          {#if musicStatus?.RepeatMode > 0}
            <span
              class="flex items-center px-2 py-1 rounded-full text-xs"
              style="background: var(--music-foreground)20; color: var(--music-foreground);"
            >
              <Repeat class="w-3 h-3 mr-1" />
              {musicStatus.RepeatMode === 1 ? "All" : "One"}
            </span>
          {/if}
        </div>

        {#if musicStatus?.CurrentTrack?.Track}
          <h2
            class="text-xl md:text-2xl font-bold mb-1 truncate max-w-full transition-opacity duration-300"
            class:track-text-transition={isTransitioning}
            style="color: var(--music-text)"
          >
            {musicStatus.CurrentTrack.Track.Title}
          </h2>
          <p
            class="text-sm md:text-base truncate max-w-full transition-opacity duration-300"
            class:track-text-transition={isTransitioning}
            style="color: var(--music-text)80"
          >
            {musicStatus.CurrentTrack.Track.Author}
          </p>
        {/if}
      </div>

      <!-- Progress Bar -->
      {#if musicStatus?.CurrentTrack?.Track}
        <div class="space-y-2 w-full mt-auto">
          <div
            aria-label="Song progress"
            aria-valuemax="100"
            on:click={handleSeek}
            aria-valuemin="0"
            aria-valuenow={progressPercentage}
            aria-valuetext={`${formatTime(musicStatus.Position)} of ${formatTime(musicStatus.CurrentTrack.Track.Duration)}`}
            bind:this={progressBarElement}
            class="relative w-full h-3 rounded-full overflow-hidden group cursor-pointer"
            on:keydown={handleSeek}
            role="slider"
            style="background: var(--music-foreground)20;"
            tabindex="0"
          >
            <div
              class="h-full rounded-full transition-transform duration-75 ease-linear progress-bar-fill liquid-progress"
              style="background: var(--music-accent); width: {progressPercentage}%;"
            >
              <div class="liquid-animation"></div>
            </div>

            <!-- Gradient overlay on progress bar -->
            <div
              class="absolute top-0 left-0 h-full w-full opacity-30 pointer-events-none progress-bar-glow"
              style="background: linear-gradient(90deg, transparent, var(--music-controls-highlight)40);
                     width: {progressPercentage}%"
            ></div>

            <!-- Pulsating position indicator -->
            <div
              class="absolute top-50% w-3 h-3 rounded-full transform -translate-y-1/2 progress-indicator"
              style="background: var(--music-accent); left: calc({progressPercentage}% - 6px);
                     box-shadow: 0 0 8px var(--music-accent);"
            ></div>
          </div>

          <div class="flex justify-between text-xs font-medium" style="color: var(--music-text)80">
            <span>{formatTime(musicStatus.Position)}</span>
            <span>{formatTime(musicStatus.CurrentTrack.Track.Duration)}</span>
          </div>
        </div>
      {/if}

      <!-- Controls -->
      {#if musicStatus?.IsInVoiceChannel}
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 w-full">
          <div class="flex items-center gap-4 justify-center sm:justify-start w-full sm:w-auto">
            <button
              class="p-3 rounded-full transition-all duration-200 hover:scale-110 focus:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--music-foreground)]"
              style="color: var(--music-text)80;"
              on:mouseover={(e) => {
                e.currentTarget.style.color = 'var(--music-foreground)';
                e.currentTarget.style.background = 'var(--music-foreground)20';
              }}
              on:mouseleave={(e) => {
                e.currentTarget.style.color = 'var(--music-text)80';
                e.currentTarget.style.background = 'transparent';
              }}
              on:focus={(e) => {
                e.currentTarget.style.color = 'var(--music-foreground)';
                e.currentTarget.style.background = 'var(--music-foreground)20';
              }}
              on:blur={(e) => {
                e.currentTarget.style.color = 'var(--music-text)80';
                e.currentTarget.style.background = 'transparent';
              }}
              on:click={previousTrack}
              aria-label="Previous Track"
            >
              <SkipBack class="w-6 h-6" />
            </button>

            <button
              class="p-4 rounded-full transition-all duration-300 transform hover:scale-105 focus:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--music-accent)] relative overflow-hidden control-pulse"
              style="background: var(--music-controls-highlight); color: var(--music-text);"
              on:click={togglePlayPause}
              aria-label={musicStatus?.State === 2 ? 'Pause' : 'Play'}
              aria-pressed={musicStatus?.State === 2}
            >
              <!-- Button glow effect -->
              <div class="absolute inset-0 opacity-40 rounded-full"
                   style="background: radial-gradient(circle at center, var(--music-foreground)80 0%, transparent 70%);"></div>

              {#if musicStatus?.State === 2}
                <Pause class="w-6 h-6 relative z-10" />
              {:else}
                <Play class="w-6 h-6 relative z-10" />
              {/if}
            </button>

            <button
              class="p-3 rounded-full transition-all duration-200 hover:scale-110 focus:scale-110 focus:outline-none focus-visible:ring-2"
              style="color: var(--music-text)80; --ring-color: var(--music-foreground);"
              on:mouseover={(e) => {
                e.currentTarget.style.color = 'var(--music-foreground)';
                e.currentTarget.style.background = 'var(--music-foreground)20';
              }}
              on:mouseleave={(e) => {
                e.currentTarget.style.color = 'var(--music-text)80';
                e.currentTarget.style.background = 'transparent';
              }}
              on:focus={(e) => {
                e.currentTarget.style.color = 'var(--music-foreground)';
                e.currentTarget.style.background = 'var(--music-foreground)20';
              }}
              on:blur={(e) => {
                e.currentTarget.style.color = 'var(--music-text)80';
                e.currentTarget.style.background = 'transparent';
              }}
              on:click={skipTrack}
              aria-label="Next Track"
            >
              <SkipForward class="w-6 h-6" />
            </button>

            <!-- Add Music button -->
            <button
              class="flex items-center gap-2 p-3 rounded-full transition-all duration-200 hover:scale-110 focus:scale-110 focus:outline-none focus-visible:ring-2"
              style="color: var(--music-accent); --ring-color: var(--music-accent);"
              on:click={openSearchModal}
              aria-label="Add Music"
            >
              <PlusCircle class="w-6 h-6" />
              <span class="hidden sm:inline text-sm">Add</span>
            </button>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
            <svelte:component
              this={getVolumeIcon(musicStatus.Volume)}
              class="w-5 h-5 flex-shrink-0"
              style="color: var(--music-foreground)"
              aria-hidden="true"
            />
            <input
              bind:this={volumeSliderElement}
              type="range"
              min="0"
              max="100"
              value={musicStatus.Volume * 100}
              class="volume-slider w-full sm:w-24"
              aria-label="Volume"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.round(musicStatus.Volume * 100)}
              aria-valuetext={`Volume ${Math.round(musicStatus.Volume * 100)}%`}
              on:change={handleVolumeChange}
              on:keydown={handleVolumeKeyDown}
            />
          </div>
        </div>

        <!-- Filters -->
        {#if musicStatus?.Filters && Object.values(musicStatus.Filters).some(f => f)}
          <div class="flex flex-wrap gap-2 mt-2" aria-label="Active audio filters">
            {#if musicStatus.Filters.BassBoost}
              <span class="px-2 py-1 rounded-full text-xs filter-badge"
                    style="background: var(--music-accent)20; color: var(--music-accent)">
                Bass Boost
              </span>
            {/if}
            {#if musicStatus.Filters.Nightcore}
              <span class="px-2 py-1 rounded-full text-xs filter-badge"
                    style="background: var(--music-accent)20; color: var(--music-accent)">
                Nightcore
              </span>
            {/if}
            {#if musicStatus.Filters.Vaporwave}
              <span class="px-2 py-1 rounded-full text-xs filter-badge"
                    style="background: var(--music-accent)20; color: var(--music-accent)">
                Vaporwave
              </span>
            {/if}
          </div>
        {/if}

        <!-- Requester Info -->
        {#if musicStatus?.CurrentTrack?.Requester}
          <div class="flex items-center gap-2 mt-2">
            <div class="w-5 h-5 rounded-full overflow-hidden relative">
              <div class="absolute inset-0 opacity-25 rounded-full"
                   style="background: radial-gradient(circle at center, var(--music-foreground) 0%, transparent 100%);"></div>
              <img
                src={musicStatus.CurrentTrack.Requester.AvatarUrl}
                alt={`${musicStatus.CurrentTrack.Requester.Username}'s avatar`}
                class="w-full h-full rounded-full relative z-10"
              />
            </div>
            <span class="text-sm" style="color: var(--music-text)80">
              Requested by {musicStatus.CurrentTrack.Requester.Username}
            </span>
          </div>
        {/if}
      {:else}
        <div
          class="flex items-center gap-2 px-4 py-3 rounded-lg mt-4"
          style="background: var(--music-foreground)20;"
          role="alert"
        >
          <Mic2 class="w-5 h-5" style="color: var(--music-text)80" />
          <span style="color: var(--music-text)80">Join voice channel for playback</span>
        </div>
      {/if}
    </div>
  </div>

  {#if musicStatus?.Queue?.length > 0}
    <div
      class="mt-6 pt-6"
      style="border-top: 1px solid var(--music-foreground)20;"
    >
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-3">
          <List class="w-5 h-5" style="color: var(--music-accent)" />
          <h3 style="color: var(--music-accent)">Queue</h3>
          <span
            class="px-2 py-0.5 text-xs rounded-full"
            style="background: var(--music-accent)20; color: var(--music-text)80;"
          >
            {musicStatus.Queue.length} tracks
          </span>
        </div>

        <!-- Add search button to queue header -->
        <button
          class="p-2 rounded-full transition-colors"
          style="background: var(--music-accent)20; color: var(--music-accent);"
          on:click={openSearchModal}
          aria-label="Add more tracks"
        >
          <Search class="w-4 h-4" />
        </button>
      </div>

      <!-- Mobile Queue (Horizontal Scroll) -->
      <div class="md:hidden overflow-x-auto pb-4 mb-2">
        <div class="flex gap-3" style="min-width: max-content;">
          {#each musicStatus.Queue as track, i}
            <button
              type="button"
              class="flex-shrink-0 w-44 p-3 rounded-xl transition-all duration-200 queue-card text-left focus:outline-none focus:ring-2 relative"
              style="background: {isCurrentlyPlaying(track) ? 'var(--music-accent)40' : selectedQueueItem === i ? 'var(--music-accent)20' : 'var(--music-foreground)10'};
                     border-left: {isCurrentlyPlaying(track) ? '4px solid var(--music-accent)' : selectedQueueItem === i ? '4px solid var(--music-accent)' : 'none'};
                     --ring-color: var(--music-accent);"
              on:click={() => playQueueItem(i)}
              on:keydown={(e) => handleQueueItemKeyDown(e, i)}
              aria-current={isCurrentlyPlaying(track) ? 'true' : undefined}
            >
              <div class="flex items-center mb-2">
                <div class="queue-number-circle flex-shrink-0 w-5 h-5 flex items-center justify-center mr-2"
                     style="background: {isCurrentlyPlaying(track) ? 'var(--music-accent)' : selectedQueueItem === i ? 'var(--music-accent)' : 'var(--music-accent)20'};
                            color: {isCurrentlyPlaying(track) || selectedQueueItem === i ? 'white' : 'var(--music-accent)'}">
                  <span class="text-xs font-medium">{i + 1}</span>
                </div>

                {#if isCurrentlyPlaying(track)}
                  <div class="playing-indicator-mobile ml-auto mr-2">
                    <div class="playing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                {/if}

                <div class="flex items-center {isCurrentlyPlaying(track) ? '' : 'ml-auto'}">
                  <Clock class="w-4 h-4" style="color: var(--music-foreground)" aria-hidden="true" />
                  <span class="text-xs ml-1" style="color: var(--music-text)80">
                    {formatTime(track.Track.Duration)}
                  </span>
                </div>
              </div>

              <p class="text-sm font-medium truncate mb-1" style="color: var(--music-text)">
                {track.Track.Title}
              </p>
              <p class="text-xs truncate" style="color: var(--music-text)80">
                {track.Track.Author}
              </p>
            </button>
          {/each}
        </div>
      </div>

      <!-- Desktop Queue (Vertical List) -->
      <div
        class="max-h-[400px] overflow-y-auto space-y-2 px-2 -mx-2 queue-list hidden md:block"
        style="scrollbar-gutter: stable;"
        role="list"
        aria-label="Upcoming tracks"
      >
        {#each musicStatus.Queue as track, i}
          <button
            type="button"
            class="flex w-full items-center gap-4 p-3 rounded-xl transition-all duration-200 queue-item text-left focus:outline-none focus:ring-2"
            style="background: {isCurrentlyPlaying(track) ? 'var(--music-accent)40' : selectedQueueItem === i ? 'var(--music-accent)20' : 'var(--music-foreground)10'};
                   border-left: {isCurrentlyPlaying(track) ? '4px solid var(--music-accent)' : selectedQueueItem === i ? '4px solid var(--music-accent)' : 'none'};
                   --ring-color: var(--music-accent);"
            on:click={() => playQueueItem(i)}
            on:keydown={(e) => handleQueueItemKeyDown(e, i)}
            aria-current={isCurrentlyPlaying(track) ? 'true' : undefined}
          >
            <div class="w-8 flex-shrink-0">
              <div class="queue-position flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium"
                   style="background: {isCurrentlyPlaying(track) ? 'var(--music-accent)' : selectedQueueItem === i ? 'var(--music-accent)' : 'var(--music-accent)20'};
                          color: {isCurrentlyPlaying(track) || selectedQueueItem === i ? 'white' : 'var(--music-accent)'}">
                {i + 1}
              </div>
            </div>
            <div class="flex-grow truncate">
              <p
                class="text-sm font-medium truncate"
                style="color: var(--music-text)"
              >
                {track.Track.Title}
              </p>
              <p
                class="text-xs truncate"
                style="color: var(--music-text)80"
              >
                {track.Track.Author}
              </p>
            </div>

            <div class="flex items-center gap-2 ml-auto pr-8 flex-shrink-0">
              <Clock
                class="w-4 h-4"
                style="color: var(--music-foreground)"
                aria-hidden="true"
              />
              <span
                class="text-xs"
                style="color: var(--music-text)80"
              >
                {formatTime(track.Track.Duration)}
              </span>
            </div>

            {#if isCurrentlyPlaying(track)}
              <div class="absolute right-3 flex items-center justify-center">
                <div class="playing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Keyboard shortcuts info -->
  <div class="mt-4 pt-4 text-xs" style="color: var(--music-text)60; border-top: 1px solid var(--music-foreground)10;">
    <details>
      <summary class="cursor-pointer hover:underline focus:outline-none focus-visible:underline">
        Keyboard shortcuts
      </summary>
      <div class="mt-2 grid grid-cols-2 gap-2">
        <div>Space: Play/Pause</div>
        <div>Ctrl+←: Previous Track</div>
        <div>Ctrl+→: Next Track</div>
        <div>←/→: Seek (when progress bar focused)</div>
      </div>
    </details>
  </div>

  <!-- Music Search Modal -->
  <MusicSearch
    bind:isOpen={isSearchModalOpen}
    colors={colors}
    currentUser={getCurrentUser()}
    on:close={() => isSearchModalOpen = false}
    on:trackAdded={handleTrackAdded}
  />
</div>

<style lang="postcss">
    /* Volume slider styles */
    .volume-slider {
        width: 100%;
        height: 0.375rem;
        border-radius: 9999px;
        appearance: none;
        cursor: pointer;
        background-color: rgba(127, 127, 127, 0.2);
        max-width: 200px;
    }

    @media (min-width: 640px) {
        .volume-slider {
            width: 6rem;
        }
    }

    .volume-slider::-webkit-slider-runnable-track {
        width: 100%;
        height: 0.375rem;
        border-radius: 9999px;
        cursor: pointer;
        background-color: rgba(127, 127, 127, 0.2);
    }

    .volume-slider::-moz-range-track {
        width: 100%;
        height: 0.375rem;
        border-radius: 9999px;
        cursor: pointer;
        background-color: rgba(127, 127, 127, 0.2);
    }

    .volume-slider::-webkit-slider-thumb {
        appearance: none;
        width: 0.75rem;
        height: 0.75rem;
        border-radius: 9999px;
        cursor: pointer;
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 200ms;
        background-color: var(--music-color, rgb(127, 127, 127));
        margin-top: -3px;
    }

    .volume-slider::-webkit-slider-thumb:hover {
        transform: scale(1.25);
    }

    .volume-slider::-moz-range-thumb {
        width: 0.75rem;
        height: 0.75rem;
        border-radius: 9999px;
        border: 0;
        cursor: pointer;
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 200ms;
        background-color: var(--music-color, rgb(127, 127, 127));
    }

    .volume-slider::-moz-range-thumb:hover {
        transform: scale(1.25);
    }

    /* Focus styling for buttons and controls */
    .focus-visible:focus {
        @apply ring-2 ring-offset-2;
        outline: none;
        ring-color: var(--music-accent);
        ring-offset-color: var(--music-foreground);
    }

    /* Progress bar liquid effect */
    .liquid-progress {
        position: relative;
        overflow: hidden;
    }

    .liquid-animation {
        position: absolute;
        top: -50%;
        left: 0;
        right: 5px;
        bottom: -50%;
        background: linear-gradient(
                90deg,
                transparent 0%,
                rgba(255, 255, 255, 0.2) 50%,
                transparent 100%
        );
        animation: liquid-flow 2s linear infinite;
        opacity: 0.5;
    }

    @keyframes liquid-flow {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(100%);
        }
    }

    .progress-bar-fill {
        position: relative;
        will-change: width;
        transition: width 0.1s linear;
        box-shadow: 0 0 8px 1px var(--music-accent);
    }

    .progress-bar-fill::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        width: 8px;
        height: 100%;
        background: inherit;
        filter: blur(4px);
    }

    /* When playing, ensure width transitions are instantaneous to avoid laggy feeling */
    :global(.State-2) .progress-bar-fill {
        transition: none;
    }

    .progress-indicator {
        animation: pulse 1.5s infinite;
        will-change: transform, left;
        transition: left 0.1s linear;
        box-shadow: 0 0 10px 2px var(--music-accent);
    }

    /* When playing, ensure left transitions are instantaneous to avoid laggy feeling */
    :global(.State-2) .progress-indicator {
        transition: none;
    }

    @keyframes pulse {
        0% {
            transform: translateY(-50%) scale(1);
            opacity: 0.8;
        }
        50% {
            transform: translateY(-50%) scale(1.2);
            opacity: 1;
        }
        100% {
            transform: translateY(-50%) scale(1);
            opacity: 0.8;
        }
    }

    /* Control button pulse */
    .control-pulse {
        animation: controlPulse 2s infinite;
    }

    @keyframes controlPulse {
        0% {
            box-shadow: 0 0 0 0 rgba(var(--music-accent-rgb, 255, 255, 255), 0.4);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(var(--music-accent-rgb, 255, 255, 255), 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(var(--music-accent-rgb, 255, 255, 255), 0);
        }
    }

    /* Album art styling with vinyl appearance */
    .album-container {
        width: 100%;
        max-width: 220px;
        aspect-ratio: 1;
        margin: 0 auto;
    }

    .album-border {
        border-color: rgba(0, 0, 0, 0.5);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }

    .vinyl-edge {
        border-radius: 50%;
        background: repeating-radial-gradient(
                circle at center,
                rgba(0, 0, 0, 0.6) 0%,
                rgba(0, 0, 0, 0.1) 2.5%,
                rgba(0, 0, 0, 0.6) 5%,
                rgba(0, 0, 0, 0.2) 7.5%,
                rgba(0, 0, 0, 0.1) 10%,
                transparent 12%
        );
        opacity: 0.3;
        pointer-events: none;
    }

    .center-hole {
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
    }

    .vinyl-grooves {
        position: absolute;
        inset: 12%;
        border-radius: 50%;
        background: repeating-radial-gradient(
                circle at center,
                transparent 0%,
                transparent 3%,
                rgba(0, 0, 0, 0.03) 3.5%,
                transparent 4%
        );
        z-index: 15;
        opacity: 0.8;
        pointer-events: none;
    }

    /* Album art rotation effect */
    .album-rotation {
        animation: subtle-rotation 20s infinite linear;
    }

    @keyframes subtle-rotation {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    /* Filter badge animation */
    .filter-badge {
        animation: badge-pulse 2s infinite;
    }

    @keyframes badge-pulse {
        0% {
            opacity: 0.8;
        }
        50% {
            opacity: 1;
        }
        100% {
            opacity: 0.8;
        }
    }

    /* Track transition effects - targeted to specific elements */
    .track-image-transition {
        animation: image-transition 0.5s ease-out;
    }

    .track-text-transition {
        animation: text-transition 0.3s ease-out;
    }

    @keyframes image-transition {
        0% {
            opacity: 0.7;
            transform: scale(0.95);
            filter: blur(5px);
        }
        100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
        }
    }

    @keyframes text-transition {
        0% {
            opacity: 0;
            transform: translateY(5px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Background transition when colors change */
    div[style*="background: linear-gradient"] {
        transition: background 1s ease-out;
    }

    .queue-item, .queue-card {
        position: relative;
        overflow: hidden;
        transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
    }

    .queue-item:hover, .queue-card:hover {
        background-color: var(--music-accent) 30 !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .queue-position {
        transition: transform 0.2s ease;
    }

    .queue-item:hover .queue-position, .queue-card:hover .queue-position {
        transform: scale(1.2);
    }

    .playing-indicator {
        display: flex;
        align-items: flex-end;
        height: 16px;
        gap: 2px;
    }

    .playing-indicator span {
        display: inline-block;
        width: 3px;
        height: 5px;
        background-color: var(--music-accent);
        border-radius: 1px;
        animation: soundBars 1.2s infinite ease-in-out;
    }

    .playing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
        height: 8px;
    }

    .playing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
        height: 5px;
    }

    @keyframes soundBars {
        0% {
            height: 5px;
        }
        50% {
            height: 12px;
        }
        100% {
            height: 5px;
        }
    }

    /* Force hardware acceleration */
    [style*="background"],
    [style*="color"] {
        transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
    }

    /* Mobile improvements */
    @media (max-width: 640px) {
        .volume-slider {
            width: 100%;
            max-width: 100%;
            height: 10px;
        }

        .volume-slider::-webkit-slider-thumb {
            width: 16px;
            height: 16px;
            margin-top: -4px;
        }

        .volume-slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
        }

        .queue-item {
            padding: 0.75rem;
        }

        /* Enhanced mobile scrolling */
        .overflow-x-auto {
            -webkit-overflow-scrolling: touch;
            scroll-snap-type: x mandatory;
            padding-bottom: 12px;
        }

        /* Snap each card to grid when scrolling */
        .queue-card {
            scroll-snap-align: start;
            min-height: 100px;
            padding: 10px;
            margin-bottom: 8px;
        }
    }

    /* Container queries */
    @container (max-width: 640px) {
        .music-controls {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
        }

        .volume-control {
            width: 100%;
            display: flex;
            justify-content: center;
        }
    }

    /* Screen reader only class */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    }

    /* Queue styling */
    .queue-card {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
    }

    .queue-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
</style>