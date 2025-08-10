<!-- lib/components/MiniMusicPlayer.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import { Music, Pause, Play, SkipForward, Volume2 } from "lucide-svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";
  import type { MusicStatus } from "$lib/types/music";
  import { musicPlayerColors } from "$lib/stores/musicPlayerColorStore";

  export let musicStatus: MusicStatus | null = null;
  export let isVisible: boolean = false;

  // Derived state
  $: currentTrack = musicStatus?.CurrentTrack;
  $: isPlaying = musicStatus?.State === 2;  // 2 = Playing state
  $: hasTrack = currentTrack?.Track?.Title;

  // Color store reactive values
  $: colors = $musicPlayerColors;

  // Format track title for display
  function formatTrackTitle(title: string): string {
    if (!title) return "";
    // Truncate long titles for mini player
    return title.length > 30 ? title.substring(0, 27) + "..." : title;
  }

  function formatArtist(artist: string): string {
    if (!artist) return "";
    // Truncate long artist names
    return artist.length > 25 ? artist.substring(0, 22) + "..." : artist;
  }

  // Control functions
  async function togglePlayPause() {
    try {
      if (!$currentGuild?.id) return;

      await api.pauseResume($currentGuild.id);
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

  // Navigate to music dashboard
  function openMusicDashboard() {
    window.location.href = "/dashboard/music";
  }
</script>

{#if isVisible && hasTrack}
  <div
    class="flex items-center gap-3 p-3 rounded-lg backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl border border-opacity-20 max-w-sm"
    style="background: linear-gradient(135deg, {colors.background}90, {colors.backgroundSecondary}80); 
           border-color: {colors.accent}30;
           color: {colors.text};"
    in:fly={{ x: 100, duration: 300, delay: 0 }}
    out:fly={{ x: 100, duration: 300 }}
  >
    <!-- Album Art Thumbnail -->
    <div class="relative flex-shrink-0">
      <div
        class="w-12 h-12 rounded-lg overflow-hidden shadow-md ring-1 ring-opacity-20"
        style="ring-color: {colors.accent};"
      >
        {#if currentTrack?.Track?.ArtworkUri}
          <img
            src={currentTrack.Track.ArtworkUri}
            alt="Album artwork"
            class="w-full h-full object-cover"
          />
        {:else}
          <div
            class="w-full h-full flex items-center justify-center"
            style="background: {colors.primary}20;"
          >
            <Music size={20} style="color: {colors.primary}" />
          </div>
        {/if}
      </div>

      <!-- Playing indicator -->
      {#if isPlaying}
        <div
          class="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm animate-pulse"
          style="background: {colors.accent};"
        ></div>
      {/if}
    </div>

    <!-- Track Info -->
    <button 
      class="flex-1 min-w-0 cursor-pointer text-left" 
      on:click={openMusicDashboard}
      aria-label="Open music dashboard"
    >
      <div
        class="font-medium text-sm truncate"
        style="color: {colors.text};"
        title={currentTrack?.Track?.Title}
      >
        {formatTrackTitle(currentTrack?.Track?.Title || "")}
      </div>
      <div
        class="text-xs truncate opacity-80"
        style="color: {colors.textSecondary};"
        title={currentTrack?.Track?.Author}
      >
        {formatArtist(currentTrack?.Track?.Author || "")}
      </div>
    </button>

    <!-- Controls -->
    <div class="flex items-center gap-1 flex-shrink-0">
      <!-- Play/Pause Button -->
      <button
        class="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style="background: {colors.primary}25; color: {colors.primary};"
        on:click={togglePlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {#if isPlaying}
          <Pause size={14} />
        {:else}
          <Play size={14} style="margin-left: 1px;" />
        {/if}
      </button>

      <!-- Skip Button -->
      <button
        class="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style="background: {colors.secondary}20; color: {colors.secondary};"
        on:click={skipTrack}
        aria-label="Skip track"
      >
        <SkipForward size={14} />
      </button>

      <!-- Volume Indicator -->
      <div
        class="w-6 h-6 flex items-center justify-center opacity-60"
        title="Volume: {Math.round((musicStatus?.Volume || 0) * 100)}%"
      >
        <Volume2 size={12} style="color: {colors.textSecondary}" />
      </div>
    </div>
  </div>
{/if}

<style>
    /* Add subtle animation for playing indicator */
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }

    .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
</style>