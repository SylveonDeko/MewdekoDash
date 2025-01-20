<!-- src/lib/components/MusicPlayer.svelte -->
<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    Clock,
    List,
    Mic2,
    Music,
    Pause,
    Play,
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
  import type { MusicStatus } from "$lib/types/music";
  import { musicPlayerColors } from "$lib/stores/musicPlayerColorStore";

  export let musicStatus: MusicStatus;

  let progressInterval: number | null = null;
  let currentProgress = 0;
  let serverTimeDiff = 0;
  let lastSyncedPosition = 0;

  function getSeconds(timeStr: string): number {
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
    if (typeof time === "object" && time.relativePosition) {
      const match = time.relativePosition.match(/(\d+):(\d+)\.(\d+)/);
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
    if (!musicStatus.position) return;

    const serverTime = new Date(musicStatus.position.systemClock.utcNow).getTime();
    const localTime = Date.now();
    serverTimeDiff = serverTime - localTime;

    const syncedAt = new Date(musicStatus.position.syncedAt).getTime();
    lastSyncedPosition = getSeconds(musicStatus.position.relativePosition);

    const timeSinceSync = (localTime + serverTimeDiff - syncedAt) / 1000;
    currentProgress = lastSyncedPosition + timeSinceSync;
  }

  function updateProgress() {
    if (musicStatus?.state === 2) { // 2 = Playing
      const now = Date.now();
      const syncedAt = new Date(musicStatus.position.syncedAt).getTime();
      const timeSinceSync = (now + serverTimeDiff - syncedAt) / 1000;

      const timeStretchFactor = musicStatus.position.timeStretchFactor || 1;
      currentProgress = lastSyncedPosition + (timeSinceSync * timeStretchFactor);

      const duration = getSeconds(musicStatus.currentTrack.track.duration);
      if (musicStatus.repeatMode === 2 && currentProgress > duration) {
        currentProgress = currentProgress % duration;
      }

      progressInterval = requestAnimationFrame(updateProgress);
    }
  }

  async function handleSeek(event: MouseEvent) {
    const el = event.currentTarget as HTMLDivElement;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const duration = getSeconds(musicStatus.currentTrack.track.duration);
    const seekTime = Math.floor(duration * percentage);

    try {
      if (!$currentGuild?.id) return;
      await api.seek($currentGuild.id, seekTime);
    } catch (err) {
      logger.error("Failed to seek:", err);
    }
  }

  async function togglePlayPause() {
    try {
      if (!$currentGuild?.id) return;
      await api.pauseResume($currentGuild.id);
    } catch (err) {
      logger.error("Failed to toggle playback:", err);
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

  async function handleVolumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    try {
      if (!$currentGuild?.id) return;
      await api.setVolume($currentGuild.id, parseInt(input.value));
    } catch (err) {
      logger.error("Failed to update volume:", err);
    }
  }

  $: if (musicStatus?.currentTrack?.track?.artworkUri) {
    musicPlayerColors.updateFromArtwork(musicStatus.currentTrack.track.artworkUri);
  }

  $: if (musicStatus) {
    syncTimeWithServer();
    if (musicStatus.state === 2 && !progressInterval) {
      updateProgress();
    } else if (musicStatus.state !== 2 && progressInterval) {
      cancelAnimationFrame(progressInterval);
      progressInterval = null;
    }
  }

  onDestroy(() => {
    if (progressInterval) {
      cancelAnimationFrame(progressInterval);
    }
  });
</script>

<div
  class="w-full backdrop-blur-sm rounded-2xl border p-4 md:p-6 shadow-2xl overflow-hidden transition-all duration-500"
  style="
    background: linear-gradient(135deg, {$musicPlayerColors.background}, rgba(0,0,0,0.8));
    border-color: {$musicPlayerColors.foreground}40;
    --music-color: {$musicPlayerColors.foreground};
  "
>
  <div class="flex flex-col lg:flex-row gap-6">
    <!-- Album Art -->
    <div class="relative group w-full lg:w-auto lg:min-w-[160px] max-w-[300px] mx-auto lg:mx-0">
      <img
        alt="Album Art"
        class="w-full lg:w-[160px] h-[160px] rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
        src={musicStatus.currentTrack.track.artworkUri || '/default-album.png'}
      />
    </div>

    <!-- Track Info & Controls -->
    <div class="flex-grow flex flex-col gap-4 min-w-0">
      <div class="w-full">
        <div class="flex flex-wrap items-center gap-2 mb-2">
          <span
            class="px-3 py-1 rounded-full text-xs font-medium truncate max-w-full"
            style="background: {$musicPlayerColors.foreground}20; color: {$musicPlayerColors.foreground};"
          >
            {musicStatus.currentTrack.track.sourceName}
          </span>
        </div>

        <h2
          class="text-xl md:text-2xl font-bold mb-1 truncate max-w-full"
          style="color: {$musicPlayerColors.text}"
        >
          {musicStatus.currentTrack.track.title}
        </h2>
        <p
          class="text-sm md:text-base truncate max-w-full"
          style="color: {$musicPlayerColors.text}80"
        >
          {musicStatus.currentTrack.track.author}
        </p>
      </div>

      <!-- Progress Bar -->
      <div class="space-y-2 w-full mt-auto">
        <div
          class="relative w-full h-2 rounded-full overflow-hidden group cursor-pointer"
          on:click={handleSeek}
          style="background: {$musicPlayerColors.foreground}20;"
        >
          <div
            class="h-full rounded-full transition-transform duration-75 ease-linear"
            style="background: {$musicPlayerColors.foreground};"
            style:width={`${(currentProgress / getSeconds(musicStatus.currentTrack.track.duration)) * 100}%`}
          />
        </div>
        <div class="flex justify-between text-xs font-medium" style="color: {$musicPlayerColors.text}80">
          <span>{formatTime(musicStatus.position)}</span>
          <span>{formatTime(musicStatus.currentTrack.track.duration)}</span>
        </div>
      </div>

      <!-- Controls -->
      {#if musicStatus.isInVoiceChannel}
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 w-full">
          <div class="flex items-center gap-4 justify-center sm:justify-start w-full sm:w-auto">
            <button
              class="p-3 rounded-full transition-all duration-200"
              style="color: {$musicPlayerColors.text}80; hover:color: {$musicPlayerColors.foreground};
                     hover:background: {$musicPlayerColors.foreground}20;"
              on:click={previousTrack}
              aria-label="Previous Track"
            >
              <SkipBack class="w-6 h-6" />
            </button>

            <button
              class="p-4 rounded-full transition-all duration-300 transform hover:scale-105"
              style="background: {$musicPlayerColors.foreground}; color: {$musicPlayerColors.text};"
              on:click={togglePlayPause}
              aria-label={musicStatus.state === 2 ? 'Pause' : 'Play'}
            >
              <svelte:component
                this={musicStatus.state === 2 ? Pause : Play}
                class="w-6 h-6"
              />
            </button>

            <button
              class="p-3 rounded-full transition-all duration-200"
              style="color: {$musicPlayerColors.text}80; hover:color: {$musicPlayerColors.foreground};
                     hover:background: {$musicPlayerColors.foreground}20;"
              on:click={skipTrack}
              aria-label="Next Track"
            >
              <SkipForward class="w-6 h-6" />
            </button>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
            <svelte:component
              this={getVolumeIcon(musicStatus.volume)}
              class="w-5 h-5 flex-shrink-0"
              style="color: {$musicPlayerColors.text}80"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={musicStatus.volume * 100}
              class="volume-slider w-full sm:w-24"
              aria-label="Volume"
              on:change={handleVolumeChange}
            />
          </div>
        </div>

        <!-- Filters -->
        {#if Object.values(musicStatus.filters).some(f => f)}
          <div class="flex flex-wrap gap-2 mt-2">
            {#if musicStatus.filters.bassBoost}
              <span class="px-2 py-1 rounded-full text-xs"
                    style="background: {$musicPlayerColors.foreground}20; color: {$musicPlayerColors.foreground}">
                Bass Boost
              </span>
            {/if}
            {#if musicStatus.filters.nightcore}
              <span class="px-2 py-1 rounded-full text-xs"
                    style="background: {$musicPlayerColors.foreground}20; color: {$musicPlayerColors.foreground}">
                Nightcore
              </span>
            {/if}
            {#if musicStatus.filters.vaporwave}
              <span class="px-2 py-1 rounded-full text-xs"
                    style="background: {$musicPlayerColors.foreground}20; color: {$musicPlayerColors.foreground}">
                Vaporwave
              </span>
            {/if}
          </div>
        {/if}

        <!-- Requester Info -->
        <div class="flex items-center gap-2 mt-2">
          <img
            src={musicStatus.currentTrack.requester.avatarUrl}
            alt=""
            class="w-5 h-5 rounded-full"
          />
          <span class="text-sm" style="color: {$musicPlayerColors.text}80">
            Requested by {musicStatus.currentTrack.requester.username}
          </span>
        </div>
      {:else}
        <div
          class="flex items-center gap-2 px-4 py-2 rounded-lg mt-4"
          style="background: {$musicPlayerColors.foreground}20;"
        >
          <Mic2 class="w-5 h-5" style="color: {$musicPlayerColors.text}80" />
          <span style="color: {$musicPlayerColors.text}80">Join voice channel for playback</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Queue -->
  {#if musicStatus.queue?.length > 0}
    <div
      class="mt-6 pt-6"
      style="border-top: 1px solid {$musicPlayerColors.foreground}20;"
    >
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-3">
          <List class="w-5 h-5" style="color: {$musicPlayerColors.foreground}" />
          <h3 style="color: {$musicPlayerColors.foreground}">Queue</h3>
          <span
            class="px-2 py-0.5 text-xs rounded-full"
            style="background: {$musicPlayerColors.foreground}20; color: {$musicPlayerColors.text}80;"
          >
            {musicStatus.queue.length} tracks
          </span>
        </div>
      </div>

      <div
        class="max-h-[400px] overflow-y-auto space-y-2 px-2 -mx-2"
        style="scrollbar-gutter: stable;"
      >
        {#each musicStatus.queue as track}
          <div
            class="flex items-center gap-4 p-3 rounded-xl transition-all duration-200"
            style="background: {$musicPlayerColors.foreground}10;
                   hover:background: {$musicPlayerColors.foreground}20;"
          >
            <Music class="w-5 h-5" style="color: {$musicPlayerColors.text}80" />
            <div class="flex-grow truncate">
              <p
                class="text-sm font-medium truncate"
                style="color: {$musicPlayerColors.text}"
              >
                {track.track.title}
              </p>
              <p
                class="text-xs truncate"
                style="color: {$musicPlayerColors.text}80"
              >
                {track.track.author}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Clock
                class="w-4 h-4"
                style="color: {$musicPlayerColors.text}80"
              />
              <span
                class="text-xs"
                style="color: {$musicPlayerColors.text}80"
              >
                {formatTime(track.track.duration)}
              </span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
    .volume-slider {
        @apply w-full sm:w-24 h-1.5 rounded-full appearance-none cursor-pointer;
        background-color: rgb(127, 127, 127, 0.2);
        max-width: 200px;
    }

    .volume-slider::-webkit-slider-runnable-track {
        @apply w-full h-1.5 rounded-full cursor-pointer;
        background-color: rgb(127, 127, 127, 0.2);
    }

    .volume-slider::-moz-range-track {
        @apply w-full h-1.5 rounded-full cursor-pointer;
        background-color: rgb(127, 127, 127, 0.2);
    }

    .volume-slider::-webkit-slider-thumb {
        @apply appearance-none w-3 h-3 rounded-full cursor-pointer transition-all duration-200 hover:scale-125;
        background-color: var(--music-color, rgb(127, 127, 127));
        margin-top: -3px;
    }

    .volume-slider::-moz-range-thumb {
        @apply w-3 h-3 rounded-full border-0 cursor-pointer transition-all duration-200 hover:scale-125;
        background-color: var(--music-color, rgb(127, 127, 127));
    }

    /* Force hardware acceleration */
    [style*="background"],
    [style*="color"] {
        @apply transition-colors duration-300;
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
    }

    @container (max-width: 640px) {
        .music-controls {
            @apply flex-col items-center w-full;
        }

        .volume-control {
            @apply w-full flex justify-center;
        }
    }
</style>