<!-- routes/dashboard/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import { fade } from "svelte/transition";
  import type { BotStatusModel } from "$lib/types/models.ts";
  import { goto } from "$app/navigation";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { browser } from "$app/environment";
  import {
    Play, Pause, SkipForward, SkipBack,
    Volume2, Volume1, Volume, VolumeX,
    List, Mic2, Bot, ChartBar,
    Server, Code, Users, Library,
    Music, Music2, Clock
  } from 'lucide-svelte';
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { writable } from "svelte/store";
  import { logger } from "$lib/logger.ts";

  export let data;
  let currentUser = data.user;
  let botStatus: BotStatusModel | null = null;
  let loading = true;
  let error: string | null = null;
  let musicStatus: any = null;
  let musicInterval: NodeJS.Timeout;
  let animationFrame: number;
  let isMobile = false;
  let lastPosition = 0;

  function getSeconds(timeStr: string): number {
    const parts = timeStr.split(':');
    return parts.length === 3
      ? parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2])
      : 0;
  }

  function updateMediaSession() {
  if ('mediaSession' in navigator && musicStatus?.currentTrack) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: musicStatus.currentTrack.track.title,
      artist: musicStatus.currentTrack.track.author,
      artwork: [
        {
          src: musicStatus.currentTrack.track.artworkUri || '/default-album.png',
          sizes: '512x512',
          type: 'image/jpeg'
        }
      ]
    });

    // Set up handlers for media keys
    navigator.mediaSession.setActionHandler('play', () => {
      if (musicStatus.state !== 'Playing') togglePlayPause();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      if (musicStatus.state === 'Playing') togglePlayPause();
    });
    navigator.mediaSession.setActionHandler('nexttrack', skipTrack);
    navigator.mediaSession.setActionHandler('previoustrack', previousTrack);
  }
}

$: if (musicStatus?.currentTrack) {
  updateMediaSession();
  navigator.mediaSession.playbackState = musicStatus.state === 'Playing' ? 'playing' : 'paused';
}

  function updateProgressBar() {
    if (musicStatus?.state === 'Playing') {
      lastPosition += 0.1; // Increment by 100ms
      animationFrame = requestAnimationFrame(updateProgressBar);
    }
  }

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  async function fetchMusicStatus() {
    try {
      if (!$currentGuild?.id || !currentUser?.id) return;
      const newStatus = await api.getPlayerStatus($currentGuild.id, currentUser.id);
      if (newStatus.position !== musicStatus?.position) {
        lastPosition = getSeconds(newStatus.position?.relativePosition || '00:00:00');
      }
      musicStatus = newStatus;
      if (musicStatus.state === 'Playing' && !animationFrame) {
        updateProgressBar();
      }
    } catch (err) {
      logger.debug("Failed to fetch music status:", err);
    }
  }

  async function togglePlayPause() {
    try {
      if (!$currentGuild?.id) return;
      await api.pauseResume($currentGuild.id);
      await fetchMusicStatus();
    } catch (err) {
      logger.error("Failed to toggle playback:", err);
    }
  }

  async function skipTrack() {
    try {
      if (!$currentGuild?.id) return;
      await api.skipTrack($currentGuild.id);
      await fetchMusicStatus();
    } catch (err) {
      logger.error("Failed to skip track:", err);
    }
  }

  async function previousTrack() {
    try {
      if (!$currentGuild?.id) return;
      await api.previousTrack($currentGuild.id);
      await fetchMusicStatus();
    } catch (err) {
      logger.error("Failed to go to previous track:", err);
    }
  }

  async function handleVolumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    try {
      if (!$currentGuild?.id) return;
      await api.setVolume($currentGuild.id, parseInt(input.value));
      await fetchMusicStatus();
    } catch (err) {
      logger.error("Failed to update volume:", err);
    }
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

  function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "online": return $colorStore.primary;
      case "idle": return $colorStore.secondary;
      case "dnd": return $colorStore.accent;
      default: return $colorStore.muted;
    }
  }

  onMount(async () => {
    if (!currentUser) await goto("/api/discord/login");
    try {
      botStatus = await api.getBotStatus();
      await fetchMusicStatus();
      musicInterval = setInterval(fetchMusicStatus, 3000);
      checkMobile();
      if (browser) window.addEventListener("resize", checkMobile);
    } catch (err) {
      error = "Failed to fetch status";
      logger.error(error, err);
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    if (musicInterval) clearInterval(musicInterval);
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (browser) window.removeEventListener("resize", checkMobile);
  });

  $: colorVars = `
  --color-primary: ${$colorStore.primary};
  --color-secondary: ${$colorStore.secondary};
  --color-accent: ${$colorStore.accent};
  --color-text: ${$colorStore.text};
  --color-muted: ${$colorStore.muted};
`;

  $ : if(currentInstance) {
    colorStore.extractFromImage($currentInstance?.botAvatar);
    fetchBotStatus();
    fetchMusicStatus();
    musicInterval = setInterval(fetchMusicStatus, 3000);
  }

  async function fetchBotStatus() {
    botStatus = await api.getBotStatus();
  }
</script>

<div
  class="min-h-screen p-4 md:p-6 bg-mewd-dark-grey"
  style="{colorVars} background: radial-gradient(circle at top,
    {$colorStore.gradientStart}15 0%,
    {$colorStore.gradientMid}10 50%,
    {$colorStore.gradientEnd}05 100%);"
>
  <div class="max-w-7xl mx-auto space-y-8">
    <!-- Dashboard Header -->
    {#if !$currentGuild}
      <div class="text-center p-8 rounded-2xl backdrop-blur-sm border"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;">
        <h1 class="text-3xl md:text-4xl font-bold mb-4" style="color: {$colorStore.text}">
          Select a Server
        </h1>
        <p class="text-lg" style="color: {$colorStore.muted}">
          Choose a server from the dropdown menu to manage your bot settings
        </p>
      </div>
    {:else}
      <!-- Loading State -->
      {#if loading}
        <div class="flex justify-center items-center min-h-[400px]" aria-live="polite">
          <div class="relative">
            <div class="w-16 h-16 border-4 rounded-full animate-spin"
              style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}">
            </div>
          </div>
        </div>
      <!-- Error State -->
      {:else if error}
        <div class="p-6 rounded-xl mb-6" role="alert"
          style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}40;">
          <div class="flex items-center gap-3">
            <Bot class="w-6 h-6" style="color: {$colorStore.accent}" />
            <div style="color: {$colorStore.accent}">
              <div class="font-semibold text-lg">Error Occurred</div>
              <div class="text-sm mt-1" style="color: {$colorStore.accent}90">{error}</div>
            </div>
          </div>
        </div>
      <!-- Content State -->
      {:else}
        <!-- Music Player Card -->
        {#if musicStatus?.currentTrack}
          <div
            class="w-full backdrop-blur-sm rounded-2xl border p-4 md:p-6 shadow-2xl"
            style="background: linear-gradient(135deg,
              {$colorStore.gradientStart}10,
              {$colorStore.gradientMid}15);
              border-color: {$colorStore.primary}30;"
            transition:fade
          >
            <div class="flex flex-col lg:flex-row gap-6">
              <!-- Album Art Side -->
              <div class="relative group w-full lg:w-auto lg:min-w-[160px]">
                <img
                  src={musicStatus.currentTrack.track.artworkUri || '/default-album.png'}
                  alt="Album Art"
                  class="w-full lg:w-[160px] h-[160px] rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center"
                  style="background: {$colorStore.primary}40;"
                >
                  <Music2 class="w-8 h-8" style="color: {$colorStore.text}" />
                </div>
              </div>

              <!-- Track Info & Controls Side -->
              <div class="flex-grow flex flex-col gap-4">
                <div>
                  <div class="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      class="px-3 py-1 rounded-full text-xs font-medium"
                      style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                    >
                      {musicStatus.currentTrack.track.provider || "Unknown"}
                    </span>
                  </div>
                  <h2
                    class="text-xl md:text-2xl font-bold mb-1 truncate"
                    style="color: {$colorStore.text}"
                  >
                    {musicStatus.currentTrack.track.title}
                  </h2>
                  <p
                    class="text-sm md:text-base truncate"
                    style="color: {$colorStore.muted}"
                  >
                    {musicStatus.currentTrack.track.author}
                  </p>
                </div>
                <!-- Progress Bar -->
                <div class="space-y-2 w-full mt-auto">
                  <div class="relative w-full h-2 rounded-full overflow-hidden group cursor-pointer"
                    style="background: {$colorStore.primary}20;">
                    <div
                      class="h-full rounded-full transition-all duration-200"
                      style="background: linear-gradient(to right, {$colorStore.primary}, {$colorStore.secondary});
                      width: {(() => {
                        const position = musicStatus.position?.relativePosition || '00:00:00';
                        const duration = musicStatus.currentTrack.track.duration || '00:00:00';
                        const getSeconds = (timeStr) => {
                          const parts = timeStr.split(':');
                          return parts.length === 3
                            ? parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2])
                            : 0;
                        };
                        return ((getSeconds(position) / getSeconds(duration)) * 100) + '%';
                      })()}"
                    />
                  </div>
                  <div class="flex justify-between text-xs font-medium" style="color: {$colorStore.muted}">
                    <span>{formatTime(musicStatus.position)}</span>
                    <span>{formatTime(musicStatus.currentTrack.track.duration)}</span>
                  </div>
                </div>

                <!-- Controls -->
                {#if musicStatus.isInVoiceChannel}
                  <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                    <div class="flex items-center gap-4">
                      <button
                        class="p-3 rounded-full transition-all duration-200"
                        style="color: {$colorStore.muted}; hover:color: {$colorStore.text}; hover:background: {$colorStore.primary}20;"
                        on:click={previousTrack}
                        aria-label="Previous Track"
                      >
                        <SkipBack class="w-6 h-6" />
                      </button>

                      <button
                        class="p-4 rounded-full transition-all duration-300 transform hover:scale-105"
                        style="background: linear-gradient(to right, {$colorStore.primary}, {$colorStore.secondary});"
                        on:click={togglePlayPause}
                        aria-label={musicStatus.state === 'Playing' ? 'Pause' : 'Play'}
                      >
                        <svelte:component this={musicStatus.state === 'Playing' ? Pause : Play} class="w-6 h-6" style="color: {$colorStore.text}" />
                      </button>

                      <button
                        class="p-3 rounded-full transition-all duration-200"
                        style="color: {$colorStore.muted}; hover:color: {$colorStore.text}; hover:background: {$colorStore.primary}20;"
                        on:click={skipTrack}
                        aria-label="Next Track"
                      >
                        <SkipForward class="w-6 h-6" />
                      </button>
                    </div>

                    <div class="flex items-center gap-3">
                      <svelte:component
                        this={getVolumeIcon(musicStatus.volume)}
                        class="w-5 h-5"
                        style="color: {$colorStore.muted}"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={musicStatus.volume * 100}
                        class="volume-slider"
                        style="--slider-color: {$colorStore.primary}"
                        aria-label="Volume"
                        on:change={handleVolumeChange}
                      />
                    </div>
                  </div>
                {:else}
                  <div
                    class="flex items-center gap-2 px-4 py-2 rounded-lg mt-4"
                    style="background: {$colorStore.primary}20;"
                  >
                    <Mic2 class="w-5 h-5" style="color: {$colorStore.muted}" />
                    <span style="color: {$colorStore.muted}">Join voice channel for playback</span>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Queue -->
            {#if musicStatus.queue?.length > 0}
              <div class="mt-6 pt-6" style="border-top: 1px solid {$colorStore.primary}20;">
                <div class="flex justify-between items-center mb-4">
                  <div class="flex items-center gap-3">
                    <List class="w-5 h-5" style="color: {$colorStore.primary}" />
                    <h3 style="color: {$colorStore.primary}">Queue</h3>
                    <span
                      class="px-2 py-0.5 text-xs rounded-full"
                      style="background: {$colorStore.primary}20; color: {$colorStore.muted};"
                    >
                      {musicStatus.queue.length} tracks
                    </span>
                  </div>
                </div>

                <div class="relative">
                  <!-- Fade overlay at top -->
                  <div
                    class="absolute top-0 left-0 right-0 h-8 z-10 pointer-events-none"
                    style="background: linear-gradient(to bottom,
                      {$colorStore.gradientStart}10 0%,
                      transparent 100%
                    );"
                  ></div>

                  <!-- Queue list -->
                  <div
                    class="max-h-[400px] overflow-y-auto space-y-2 px-2 -mx-2"
                    style="scrollbar-gutter: stable;"
                  >
                    {#each musicStatus.queue as track}
                      <div
                        class="flex items-center gap-4 p-3 rounded-xl transition-all duration-200"
                        style="background: {$colorStore.primary}10; hover:background: {$colorStore.primary}20;"
                      >
                        <Music class="w-5 h-5" style="color: {$colorStore.muted}" />
                        <div class="flex-grow truncate">
                          <p class="text-sm font-medium truncate" style="color: {$colorStore.text}">
                            {track.track.title}
                          </p>
                          <p class="text-xs truncate" style="color: {$colorStore.muted}">
                            {track.track.author}
                          </p>
                        </div>
                        <div class="flex items-center gap-2">
                          <Clock class="w-4 h-4" style="color: {$colorStore.muted}" />
                          <span style="color: {$colorStore.muted}" class="text-xs">
                            {formatTime(track.track.duration)}
                          </span>
                        </div>
                      </div>
                    {/each}
                  </div>

                  <!-- Fade overlay at bottom -->
                  <div
                    class="absolute bottom-0 left-0 right-0 h-8 z-10 pointer-events-none"
                    style="background: linear-gradient(to top,
                      {$colorStore.gradientStart}10 0%,
                      transparent 100%
                    );"
                  ></div>
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Bot Status Cards -->
        {#if botStatus}
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" in:fade>
            <!-- Bot Profile Card -->
            <div
              class="col-span-full backdrop-blur-sm rounded-2xl border shadow-2xl overflow-hidden"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;"
            >
              <div class="relative h-48 md:h-64">
                {#if botStatus.botBanner}
                  <div class="absolute inset-0">
                    <img
                      src={botStatus.botBanner}
                      alt=""
                      class="w-full h-full object-cover"
                    />
                    <div class="absolute inset-0"
                      style="background: linear-gradient(to top, {$colorStore.primary}90, transparent)">
                    </div>
                  </div>
                {:else}
                  <div class="absolute inset-0"
                    style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}20)">
                  </div>
                {/if}

                <div class="absolute bottom-0 left-0 right-0 p-6">
                  <div class="flex items-end gap-6">
                    <div class="relative group">
                      <div
                        class="absolute -inset-1 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-200"
                        style="background: linear-gradient(to right, {$colorStore.primary}, {$colorStore.secondary})"
                      ></div>
                      <img
                        src={botStatus.botAvatar}
                        alt=""
                        class="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white object-cover"
                      />
                    </div>
                    <div class="flex-grow">
                      <h2 class="text-3xl md:text-4xl font-bold mb-2" style="color: {$colorStore.text}">
                        {botStatus.botName}
                      </h2>
                      <p style="color: {$colorStore.muted}">Version {botStatus.botVersion}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status Card -->
            <div
              class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-colors duration-300"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;
                     hover:border-color: {$colorStore.primary}50;"
            >
              <div class="flex items-center gap-4 mb-6">
                <div
                  class="p-3 rounded-xl"
                  style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                         color: {$colorStore.primary};"
                >
                  <Bot class="w-6 h-6" />
                </div>
                <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Bot Status</h2>
              </div>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span style="color: {$colorStore.muted}">Status</span>
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full"
                      style="background: {getStatusColor(botStatus.botStatus)}">
                    </div>
                    <span class="capitalize" style="color: {$colorStore.text}">{botStatus.botStatus}</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span style="color: {$colorStore.muted}">Latency</span>
                  <span class="font-medium" style="color: {$colorStore.text}">{botStatus.botLatency}ms</span>
                </div>
              </div>
            </div>

            <!-- Stats Card -->
            <div
              class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-colors duration-300"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;
                     hover:border-color: {$colorStore.primary}50;"
            >
              <div class="flex items-center gap-4 mb-6">
                <div
                  class="p-3 rounded-xl"
                  style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                         color: {$colorStore.primary};"
                >
                  <ChartBar class="w-6 h-6" />
                </div>
                <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Bot Stats</h2>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <div class="flex items-center justify-between p-3 rounded-xl"
                  style="background: {$colorStore.primary}10">
                  <div class="flex items-center gap-3">
                    <Code class="w-5 h-5" style="color: {$colorStore.primary}" />
                    <span style="color: {$colorStore.muted}">Commands</span>
                  </div>
                  <span class="font-medium" style="color: {$colorStore.text}">{botStatus.commandsCount}</span>
                </div>
                <div class="flex items-center justify-between p-3 rounded-xl"
                  style="background: {$colorStore.primary}10">
                  <div class="flex items-center gap-3">
                    <Library class="w-5 h-5" style="color: {$colorStore.secondary}" />
                    <span style="color: {$colorStore.muted}">Modules</span>
                  </div>
                  <span class="font-medium" style="color: {$colorStore.text}">{botStatus.modulesCount}</span>
                </div>
                <div class="flex items-center justify-between p-3 rounded-xl"
                  style="background: {$colorStore.primary}10">
                  <div class="flex items-center gap-3">
                    <Users class="w-5 h-5" style="color: {$colorStore.accent}" />
                    <span style="color: {$colorStore.muted}">Users</span>
                  </div>
                  <span class="font-medium" style="color: {$colorStore.text}">{botStatus.userCount}</span>
                </div>
              </div>
            </div>

           <!-- Technical Info Card -->
            <div
              class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-colors duration-300"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;
                     hover:border-color: {$colorStore.primary}50;"
            >
              <div class="flex items-center gap-4 mb-6">
                <div
                  class="p-3 rounded-xl flex-shrink-0"
                  style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                         color: {$colorStore.primary};"
                >
                  <Server class="w-6 h-6" />
                </div>
                <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Technical Info</h2>
              </div>
              <div class="space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl gap-2"
                  style="background: {$colorStore.primary}10">
                  <span class="text-sm whitespace-nowrap" style="color: {$colorStore.muted}">Discord.NET</span>
                  <span class="font-medium text-right break-all" style="color: {$colorStore.text}">{botStatus.dNetVersion}</span>
                </div>
                <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl gap-2"
                  style="background: {$colorStore.primary}10">
                  <span class="text-sm whitespace-nowrap" style="color: {$colorStore.muted}">Commit</span>
                  <span class="font-mono font-medium text-right break-all" style="color: {$colorStore.text}">{botStatus.commitHash}</span>
                </div>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    {/if}
  </div>
</div>

<style lang="postcss">
  .volume-slider {
    @apply w-24 h-1.5 rounded-full appearance-none cursor-pointer;
    background: var(--slider-color)20;
  }

  .volume-slider::-webkit-slider-thumb {
    @apply appearance-none w-3 h-3 rounded-full cursor-pointer transition-all duration-200 hover:scale-125;
    background: var(--slider-color);
    margin-top: -3px;
  }

  .volume-slider::-moz-range-thumb {
    @apply w-3 h-3 rounded-full border-0 cursor-pointer transition-all duration-200 hover:scale-125;
    background: var(--slider-color);
  }

  :global(*::-webkit-scrollbar) {
    @apply w-2;
  }

  :global(*::-webkit-scrollbar-track) {
    background: var(--color-primary)10;
    @apply rounded-full;
  }

  :global(*::-webkit-scrollbar-thumb) {
    background: var(--color-primary)30;
    @apply rounded-full;
  }

  :global(*::-webkit-scrollbar-thumb:hover) {
    background: var(--color-primary)50;
  }

  @container (max-width: 640px) {
    .music-controls {
      @apply flex-col items-stretch;
    }
  }

  @media (max-width: 640px) {
    :global(.card-grid) {
      @apply gap-4;
    }

    :global(.card) {
      @apply p-4;
    }
  }

  [style*="background"],
  [style*="color"] {
    @apply transition-colors duration-300;
  }

  .max-h-400px {
    mask-image: linear-gradient(
      to bottom,
      transparent,
      black 8px,
      black calc(100% - 8px),
      transparent
    );
  }
</style>
