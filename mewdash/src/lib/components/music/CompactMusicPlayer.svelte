<!-- lib/components/CompactMusicPlayer.svelte -->
<script lang="ts">

    import {onDestroy, onMount} from "svelte";
    import {fly, slide} from "svelte/transition";
    import {api} from "$lib/api";
    import {currentGuild} from "$lib/stores/currentGuild";
    import {logger} from "$lib/logger";
    import type {MusicStatus} from "$lib/types/music";
    import {musicPlayerColors} from "$lib/stores/musicPlayerColorStore";

    onMount(() => {
    setupSilentAudio();
    setupMediaSession();
  });

  onDestroy(() => {
    if (silentAudioElement) {
      silentAudioElement.pause();
      silentAudioElement.src = "";
      silentAudioElement = null;
    }

    if ("mediaSession" in navigator) {
        const actions: MediaSessionAction[] = ["play", "pause", "previoustrack", "nexttrack", "seekto"];
      actions.forEach(action => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (e) {
          // Ignore errors for unsupported actions
        }
      });

      try {
        navigator.mediaSession.metadata = null;
      } catch (e) {
        // Some browsers might not support clearing metadata
      }
    }
  });

  interface Props {
    musicStatus?: MusicStatus | null;
  }

  let { musicStatus = null }: Props = $props();

  // Component state
  let isExpanded = $state(false);
  let progressInterval: number | null = null;
  let smoothProgress = 0;
  let lastUpdateTime = Date.now();

  // Media session variables
  let silentAudioElement: HTMLAudioElement | null = null;
  let audioPlayPromisePending = false;





  // Format track title for display
  function formatTrackTitle(title: string, compact: boolean = true): string {
    if (!title) return "";
    const maxLength = compact ? 40 : 60;
    return title.length > maxLength ? title.substring(0, maxLength - 3) + "..." : title;
  }

  function formatArtist(artist: string, compact: boolean = true): string {
    if (!artist) return "";
    const maxLength = compact ? 35 : 50;
    return artist.length > maxLength ? artist.substring(0, maxLength - 3) + "..." : artist;
  }

  function formatDuration(duration: any): string {
    if (!duration) return "--:--";

    // Handle different duration formats from the main player
    if (typeof duration === "string") {
      const parts = duration.split(":");
      if (parts.length === 3) {
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const seconds = parseInt(parts[2]);
        return `${hours * 60 + minutes}:${seconds.toString().padStart(2, "0")}`;
      } else if (parts.length === 2) {
        return duration;
      }
    }

    // If it's a number (seconds), convert normally
    if (typeof duration === "number") {
      const mins = Math.floor(duration / 60);
      const secs = Math.floor(duration % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    return "--:--";
  }

  function formatTime(time: any): string {
      if (!time) return "0:00";

      // Handle Position object with RelativePosition
      if (typeof time === "object" && time.RelativePosition) {
          const match = time.RelativePosition.match(/(\d+):(\d+)\.(\d+)/);
          if (match) {
              const minutes = parseInt(match[1]);
              const seconds = parseInt(match[2]);
              return `${minutes}:${seconds.toString().padStart(2, "0")}`;
          }
      }

      // Handle string format
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

      // Handle number format (seconds)
      if (typeof time === "number") {
          const mins = Math.floor(time / 60);
          const secs = Math.floor(time % 60);
          return `${mins}:${secs.toString().padStart(2, "0")}`;
      }

      return "0:00";
  }

  function getSeconds(timeStr: string): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(":");
      if (parts.length === 3) {
          // Format: HH:MM:SS.FFFFFFF
          const hours = parseInt(parts[0]) || 0;
          const minutes = parseInt(parts[1]) || 0;
          const seconds = parseFloat(parts[2]) || 0;
          return hours * 3600 + minutes * 60 + seconds;
      } else if (parts.length === 2) {
          // Format: MM:SS
          const minutes = parseInt(parts[0]) || 0;
          const seconds = parseFloat(parts[1]) || 0;
          return minutes * 60 + seconds;
      }
      return 0;
  }

  function getCurrentPosition(): number {
      if (!musicStatus?.Position) return 0;

      // If we're not playing, just return the relative position
      if (musicStatus.State !== 2) {
          return getSeconds(musicStatus.Position.RelativePosition || "0:00");
      }

      // Calculate actual position based on server time sync
      try {
          const serverTime = new Date(musicStatus.Position.SystemClock?.UtcNow).getTime();
          const localTime = Date.now();
          const serverTimeDiff = serverTime - localTime;

          const syncedAt = new Date(musicStatus.Position.SyncedAt).getTime();
          const basePosition = getSeconds(musicStatus.Position.RelativePosition || "0:00");

          const timeSinceSync = (localTime + serverTimeDiff - syncedAt) / 1000;
          return Math.max(0, basePosition + timeSinceSync);
      } catch (err) {
          // Fallback to simple relative position if sync data is missing
          return getSeconds(musicStatus.Position.RelativePosition || "0:00");
    }
  }

  function getProgressPercentage(): number {
    if (!currentTrack?.Track?.Duration || !currentPosition) return 0;
    const duration = getSeconds(currentTrack.Track.Duration);
    if (duration === 0) return 0;
    return Math.max(0, Math.min(100, (currentPosition / duration) * 100));
  }

  // Control functions
  async function togglePlayPause() {
    try {
      if (!$currentGuild?.id) return;
      await api.pauseResume($currentGuild.id);

      // Handle silent audio element for MediaSession API
        if (silentAudioElement && musicStatus) {
        if (musicStatus.State !== 2) { // Will become playing
          if (!audioPlayPromisePending && silentAudioElement.paused) {
            audioPlayPromisePending = true;

            try {
              await silentAudioElement.play();
              audioPlayPromisePending = false;
            } catch (e) {
              audioPlayPromisePending = false;
                logger.info("Silent audio play prevented:", e);
            }
          }
        } else { // Will become paused
          if (!audioPlayPromisePending && !silentAudioElement.paused) {
            silentAudioElement.pause();
          }
        }
      }
    } catch (err) {
      logger.error("Failed to toggle play/pause:", err);
    }
  }

  async function skipTrack() {
    try {
      if (!$currentGuild?.id) return;
      await api.skipTrack($currentGuild.id);
    } catch (err) {
      logger.error("Failed to skip track:", err);
    }
  }

  async function previousTrack() {
    try {
      if (!$currentGuild?.id) return;
      await api.previousTrack($currentGuild.id);
    } catch (err) {
      logger.error("Failed to go to previous track:", err);
    }
  }

  // Toggle expansion
  function toggleExpanded() {
    isExpanded = !isExpanded;
  }

  // Navigate to music dashboard
  function openMusicDashboard() {
    window.location.href = "/dashboard/music";
  }

  // Add missing API functions to match original music player

  // Note: These functions would need to be implemented in the API if shuffle/repeat are needed
  // Currently commenting out as they're not used in the compact player
  /*
  async function toggleShuffle() {
    try {
      if (!$currentGuild?.id) return;
      // await api.toggleShuffle($currentGuild.id);
    } catch (err) {
      logger.error("Failed to toggle shuffle:", err);
    }
  }

  async function toggleRepeat() {
    try {
      if (!$currentGuild?.id) return;
      // await api.toggleRepeat($currentGuild.id);
    } catch (err) {
      logger.error("Failed to toggle repeat:", err);
    }
  }
  */

  // Media Session Setup Functions
  function setupMediaSession() {
    if ("mediaSession" in navigator) {
      try {
        updateMediaSessionMetadata();

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

        try {
          navigator.mediaSession.setActionHandler("seekto", (details) => {
            if (!musicStatus?.CurrentTrack?.Track?.Duration) return;

            const duration = getSeconds(musicStatus.CurrentTrack.Track.Duration);
            if (details.seekTime !== undefined && duration > 0) {
              const seekRequest = { Position: details.seekTime };
              if ($currentGuild?.id) {
                api.seek($currentGuild.id, seekRequest)
                  .then(() => {
                    // currentProgress would be updated here if we had it
                  })
                  .catch(err => {
                    logger.error("Failed to seek via MediaSession:", err);
                  });
              }
            }
          });

          navigator.mediaSession.setPositionState({
            duration: musicStatus?.CurrentTrack?.Track ? getSeconds(musicStatus.CurrentTrack.Track.Duration) : 0,
            position: currentPosition || 0,
            playbackRate: 1.0
          });
        } catch (error) {
            logger.info("MediaSession seekto not supported", error);
        }

        logger.info("MediaSession API initialized successfully");
      } catch (err) {
        logger.error("Error setting up MediaSession:", err);
      }
    }
  }

  function updateMediaSessionMetadata() {
    if (!("mediaSession" in navigator) || !musicStatus?.CurrentTrack?.Track) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: musicStatus.CurrentTrack.Track.Title || "Unknown Title",
        artist: musicStatus.CurrentTrack.Track.Author || "Unknown Artist",
        album: musicStatus.CurrentTrack.Track.SourceName || "",
        artwork: [{
          src: musicStatus.CurrentTrack.Track.ArtworkUri || "/default-album.png",
          sizes: "512x512",
          type: "image/png"
        }]
      });

      navigator.mediaSession.playbackState = musicStatus.State === 2 ? "playing" : "paused";

      if ("setPositionState" in navigator.mediaSession) {
        const duration = getSeconds(musicStatus.CurrentTrack.Track.Duration) || 0;
        let position = currentPosition || 0;

        if (position > duration && duration > 0) {
          position = duration;
        }

        if (duration > 0 && position >= 0) {
          try {
            navigator.mediaSession.setPositionState({
              duration: duration,
              position: position,
              playbackRate: 1.0
            });
          } catch (error) {
              logger.info("MediaSession position state error:", error);
          }
        }
      }
    } catch (err) {
      logger.error("Error updating MediaSession metadata:", err);
    }
  }

  function setupSilentAudio() {
    if (!silentAudioElement) {
      silentAudioElement = new Audio();

      try {
        silentAudioElement.src = "/silent-audio.mp3";
        silentAudioElement.loop = true;
        silentAudioElement.volume = 0.01;

        silentAudioElement.addEventListener("play", () => {
          updateMediaSessionMetadata();
        });

          logger.info("Silent audio element initialized");
      } catch (err) {
        logger.error("Error setting up silent audio:", err);
      }
    }
  }

  function ensureSilentAudioPlaying() {
    if (!silentAudioElement) return;

    if (musicStatus?.State === 2 && silentAudioElement.paused && !audioPlayPromisePending) {
      audioPlayPromisePending = true;

      const playPromise = silentAudioElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audioPlayPromisePending = false;
          })
          .catch(err => {
            audioPlayPromisePending = false;
              logger.info("Silent audio play prevented:", err);
          });
      } else {
        audioPlayPromisePending = false;
      }
    } else if (musicStatus?.State !== 2 && !silentAudioElement.paused && !audioPlayPromisePending) {
      silentAudioElement.pause();
    }
  }
  // Derived state
  let currentTrack = $derived(musicStatus?.CurrentTrack);
  let isPlaying = $derived(musicStatus?.State === 2);
  let hasTrack = $derived(currentTrack?.Track?.Title);
  let botInChannel = $derived(musicStatus?.BotInChannel);
  let channelName = $derived(musicStatus?.ChannelName);
  let currentPosition = $derived(getCurrentPosition());
  let progressPercentage = $derived(getProgressPercentage());
  // Color store reactive values
  let colors = $derived($musicPlayerColors);
  // Update MediaSession metadata when track changes
  $effect(() => {
    if (musicStatus?.CurrentTrack?.Track) {
      updateMediaSessionMetadata();
    }
  });
  // Update MediaSession playback state when playback state changes
  $effect(() => {
    if (musicStatus?.State !== undefined) {
      ensureSilentAudioPlaying();

      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = musicStatus.State === 2 ? "playing" : "paused";
      }
    }
  });
</script>

{#if hasTrack || botInChannel}
  <div
          class="backdrop-blur-xs rounded-2xl border shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px] w-full"
    style="background: linear-gradient(135deg, {colors.gradientStart}, {colors.gradientEnd});
           border-color: {colors.accent}30;"
          in:fly={{ y: 10, duration: 400, delay: 100 }}
          out:fly={{ y: -10, duration: 300 }}
  >
    <!-- Compact Header -->
    <div class="p-4">
        {#if hasTrack}
      <div class="flex items-center gap-4">
        <!-- Album Art -->
          <div class="relative shrink-0">
          <div
            class="w-16 h-16 rounded-xl overflow-hidden shadow-lg ring-2 ring-opacity-30"
            style="ring-color: {colors.accent};"
          >
            {#if currentTrack?.Track?.ArtworkUri}
              <img
                src={currentTrack.Track.ArtworkUri}
                alt="Album artwork"
                class="w-full h-full object-cover"
              >
            {:else}
              <div
                class="w-full h-full flex items-center justify-center"
                style="background: {colors.primary}20;"
              >
                <i class="fa-utility-duo fa-regular fa-music text-2xl"
                   style="--fa-primary-color: {colors.primary}; --fa-secondary-color: {colors.secondary};"></i>
              </div>
            {/if}
          </div>

          <!-- Playing indicator -->
          {#if isPlaying}
            <div
                    class="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-xs animate-pulse"
              style="background: {colors.accent};"
            ></div>
          {/if}
        </div>

        <!-- Track Info -->
        <div class="flex-1 min-w-0">
          <div
            class="font-semibold text-base md:text-lg truncate"
            style="color: {colors.text};"
            title={currentTrack?.Track?.Title}
          >
            {formatTrackTitle(currentTrack?.Track?.Title || "", !isExpanded)}
          </div>
          <div
            class="text-sm truncate opacity-80"
            style="color: {colors.text}80;"
            title={currentTrack?.Track?.Author}
          >
            {formatArtist(currentTrack?.Track?.Author || "", !isExpanded)}
          </div>
          <!-- Desktop: Show time below artist -->
            {#if currentTrack?.Track?.Duration && musicStatus?.Position}
            <div class="hidden md:block text-xs mt-1" style="color: {colors.text}60;">
                {formatTime(musicStatus.Position)} / {formatDuration(currentTrack.Track.Duration)}
            </div>
          {/if}
        </div>

        <!-- Compact Controls -->
          <div class="flex flex-col md:flex-row items-center gap-1 md:gap-2 shrink-0">
          <!-- Mobile: Show time above controls -->
              {#if currentTrack?.Track?.Duration && musicStatus?.Position}
            <div class="md:hidden text-xs mb-1 text-center order-first" style="color: {colors.text}60;">
                {formatTime(musicStatus.Position)} / {formatDuration(currentTrack.Track.Duration)}
            </div>
          {/if}

          <div class="flex items-center gap-1 md:gap-2">

            <!-- Previous Button -->
            <button aria-label="Button action"
              class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style="background: {colors.foreground}20; color: {colors.foreground};"
              onclick={previousTrack}

            >
              <i class="fa-utility-duo fa-regular fa-step-backward text-sm md:text-base"
                 style="--fa-primary-color: {colors.foreground}; --fa-secondary-color: {colors.accent};"></i>
            </button>

            <!-- Play/Pause Button -->
            <button
              class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg"
              style="background: {colors.controlsHighlight}; color: {colors.text};"
              onclick={togglePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {#if isPlaying}
                <i class="fa-utility-duo fa-regular fa-pause text-base md:text-lg"
                   style="--fa-primary-color: {colors.text}; --fa-secondary-color: {colors.accent};"></i>
              {:else}
                <i class="fa-utility-duo fa-regular fa-play text-base md:text-lg"
                   style="--fa-primary-color: {colors.text}; --fa-secondary-color: {colors.accent}; margin-left: 2px;"></i>
              {/if}
            </button>

            <!-- Skip Button -->
            <button aria-label="Button action"
              class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style="background: {colors.foreground}20; color: {colors.foreground};"
              onclick={skipTrack}

            >
              <i class="fa-utility-duo fa-regular fa-step-forward text-sm md:text-base"
                 style="--fa-primary-color: {colors.foreground}; --fa-secondary-color: {colors.accent};"></i>
            </button>

            <!-- Desktop: Expand/Collapse Button -->
            <button
              class="hidden md:flex w-10 h-10 rounded-full items-center justify-center transition-all hover:scale-110 active:scale-95 ml-2"
              style="background: {colors.accent}20; color: {colors.accent};"
              onclick={toggleExpanded}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {#if isExpanded}
                <i class="fa-utility-duo fa-regular fa-chevron-up"
                   style="--fa-primary-color: {colors.accent}; --fa-secondary-color: {colors.primary};"></i>
              {:else}
                <i class="fa-utility-duo fa-regular fa-chevron-down"
                   style="--fa-primary-color: {colors.accent}; --fa-secondary-color: {colors.primary};"></i>
              {/if}
            </button>

            <!-- Open Full Player Button -->
            <button aria-label="Button action"
              class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style="background: {colors.accent}20; color: {colors.accent};"
              onclick={openMusicDashboard}

            >
              <i class="fa-utility-duo fa-regular fa-external-link-alt text-sm md:text-base"
                 style="--fa-primary-color: {colors.accent}; --fa-secondary-color: {colors.primary};"></i>
            </button>
          </div>
        </div>
      </div>
        {:else if botInChannel}
            <!-- Bot in channel but not playing -->
            <div class="flex items-center gap-4">
                <div class="relative shrink-0">
                    <div
                            class="w-16 h-16 rounded-xl overflow-hidden shadow-lg ring-2 ring-opacity-30 flex items-center justify-center"
                            style="ring-color: {colors.accent}; background: {colors.primary}20;"
                    >
                        <i class="fa-utility-duo fa-regular fa-music text-2xl"
                           style="--fa-primary-color: {colors.primary}; --fa-secondary-color: {colors.secondary};"></i>
                    </div>
                </div>

                <div class="flex-1 min-w-0">
                    <div
                            class="font-semibold text-base md:text-lg truncate"
                            style="color: {colors.text};"
                    >
                        Ready to play
                    </div>
                    <div
                            class="text-sm truncate opacity-80"
                            style="color: {colors.text}80;"
                    >
                        Connected to {channelName || "voice channel"}
                    </div>
                </div>

                <!-- Open Full Player Button -->
                <div class="flex items-center gap-2 shrink-0">
                  <button aria-label="Button action"
                            class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                            style="background: {colors.accent}20; color: {colors.accent};"
                            onclick={openMusicDashboard}

                  >
                        <i class="fa-utility-duo fa-regular fa-external-link-alt text-base md:text-lg"
                           style="--fa-primary-color: {colors.accent}; --fa-secondary-color: {colors.primary};"></i>
                    </button>
                </div>
            </div>
        {/if}

      <!-- Progress Bar -->
        {#if hasTrack && currentTrack?.Track?.Duration}
        <div class="mt-4">
          <div
            class="w-full h-2 rounded-full overflow-hidden"
            style="background: {colors.foreground}20;"
          >
            <div
                    class="h-full rounded-full transition-all duration-100"
                    style="background: linear-gradient(90deg, {colors.foreground}, {colors.accent});
                     width: {progressPercentage}%;"
            ></div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Expanded Content -->
    {#if isExpanded}
      <div
        class="border-t px-4 pb-4"
        style="border-color: {colors.foreground}20;"
        in:slide={{ duration: 300 }}
        out:slide={{ duration: 300 }}
      >
        <!-- Queue Preview -->
        {#if musicStatus?.Queue && musicStatus.Queue.length > 0}
          <div class="mt-4">
            <h4 class="text-sm font-medium mb-2" style="color: {colors.text};">
              Up Next ({musicStatus.Queue.length} tracks)
            </h4>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              {#each musicStatus.Queue.slice(0, 3) as track, index}
                <div class="flex items-center gap-3 p-2 rounded-lg" style="background: {colors.foreground}05;">
                  <div class="text-xs" style="color: {colors.text}60;">
                    {index + 1}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm truncate" style="color: {colors.text};">
                      {track.Track?.Title || "Unknown Track"}
                    </div>
                    <div class="text-xs truncate" style="color: {colors.text}60;">
                      {track.Track?.Author || "Unknown Artist"}
                    </div>
                  </div>
                  <div class="text-xs" style="color: {colors.text}60;">
                    {formatDuration(track.Track?.Duration || 0)}
                  </div>
                </div>
              {/each}
              {#if musicStatus.Queue.length > 3}
                <div class="text-center py-2">
                  <span class="text-xs" style="color: {colors.text}60;">
                    +{musicStatus.Queue.length - 3} more tracks
                  </span>
                </div>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Additional Controls -->
        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center gap-3">
            <!-- Volume -->
            <div class="flex items-center gap-2">
              <i class="fa-utility-duo fa-regular fa-volume-up"
                 style="--fa-primary-color: {colors.text}; --fa-secondary-color: {colors.text}; --fa-primary-opacity: 0.6; --fa-secondary-opacity: 0.4;"></i>
              <span class="text-sm" style="color: {colors.text}60;">
                {Math.round((musicStatus?.Volume || 0) * 100)}%
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
              <!-- Shuffle (removed as API not available) -->
              <!-- Repeat (removed as API not available) -->
          </div>
        </div>
      </div>
    {/if}
  </div>
{:else if !botInChannel}
  <!-- No Music Placeholder -->
    <div class="backdrop-blur-xs rounded-2xl border p-6 text-center transition-all"
       style="background: linear-gradient(135deg, {colors.gradientStart}, {colors.gradientEnd});
              border-color: {colors.foreground}30;"
         in:fly={{ y: 10, duration: 400, delay: 100 }}
         out:fly={{ y: -10, duration: 300 }}>
    <i class="fa-utility-duo fa-regular fa-music text-5xl mx-auto mb-4 block"
       style="--fa-primary-color: {colors.foreground}; --fa-secondary-color: {colors.foreground}; --fa-primary-opacity: 0.5; --fa-secondary-opacity: 0.3;"></i>
    <h3 class="text-xl font-semibold" style="color: {colors.text};">
        Bot is not in a voice channel
    </h3>
    <p class="mt-2" style="color: {colors.text}80;">
        Use bot commands to join a voice channel and play music
    </p>
    <button
      class="mt-4 px-4 py-2 rounded-lg transition-all hover:scale-105"
      style="background: {colors.foreground}20; color: {colors.foreground}; border: 1px solid {colors.foreground}30;"
      onclick={openMusicDashboard}
    >
      Open Music Dashboard
    </button>
  </div>
{/if}

<style>
    /* Custom scrollbar for queue */
    .overflow-y-auto::-webkit-scrollbar {
        width: 4px;
    }

    .overflow-y-auto::-webkit-scrollbar-track {
        background: transparent;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }
</style>