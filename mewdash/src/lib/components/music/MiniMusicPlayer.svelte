<!-- lib/components/MiniMusicPlayer.svelte -->
<script lang="ts">
    import {fly} from "svelte/transition";
    import { musicApi } from "$lib/api/index.ts";
    import {currentGuild} from "$lib/stores/currentGuild";
    import {logger} from "$lib/logger";
    import type {MusicStatus} from "$lib/types/music";
    import {musicPlayerColors} from "$lib/stores/musicPlayerColorStore";
    import { musicSkinStore } from "$lib/stores/musicSkinStore";

    interface Props {
    musicStatus?: MusicStatus | null;
    isVisible?: boolean;
  }

  let { musicStatus = null, isVisible = false }: Props = $props();

  /** Windowshade title line: "Artist - Title", the way the shaded 2.x window scrolled it. */
  let shadeTitle = $derived(
    musicStatus?.CurrentTrack?.Track
      ? `${musicStatus.CurrentTrack.Track.Author} - ${musicStatus.CurrentTrack.Track.Title}`
      : "*** nothing playing ***"
  );
  const shadeBars = [0, 1, 2, 3, 4, 5, 6, 7];

  // Derived state
  let currentTrack = $derived(musicStatus?.CurrentTrack);
  let isPlaying = $derived(musicStatus?.State === 2);  // 2 = Playing state
  let hasTrack = $derived(currentTrack?.Track?.Title);
    let botInChannel = $derived(musicStatus?.BotInChannel);
    let channelName = $derived(musicStatus?.ChannelName);

  // Color store reactive values
  let colors = $derived($musicPlayerColors);

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

      await musicApi.pauseResume($currentGuild.id);
    } catch (err) {
      logger.error("Failed to toggle play/pause:", err);
    }
  }

  async function skipTrack() {
    try {
      if (!$currentGuild?.id) return;
      await musicApi.skipTrack($currentGuild.id);
    } catch (err) {
      logger.error("Failed to skip track:", err);
    }
  }

    async function previousTrack() {
        try {
            if (!$currentGuild?.id) return;
          await musicApi.previousTrack($currentGuild.id);
        } catch (err) {
            logger.error("Failed to go to previous track:", err);
        }
    }

  // Navigate to music dashboard
  function openMusicDashboard() {
    window.location.href = "/dashboard/music";
  }
</script>

{#if isVisible && (hasTrack || botInChannel)}
  {#if $musicSkinStore === "classic"}
    <!-- Windowshade: the collapsed one-line form of the classic main window -->
    <div
      class="wa-shade"
      class:wa-shade-playing={isPlaying}
      in:fly={{ x: 20, duration: 400, delay: 0 }}
      out:fly={{ x: 20, duration: 300 }}
    >
      <span class="wa-shade-lines" aria-hidden="true"></span>
      <div class="wa-shade-analyser" aria-hidden="true">
        {#each shadeBars as bar}
          <span class="wa-shade-bar" style="--i: {bar};"></span>
        {/each}
      </div>
      <button type="button" class="wa-shade-marquee" onclick={openMusicDashboard} title="Open the music dashboard">
        <span class="wa-shade-text" class:wa-shade-scroll={shadeTitle.length > 26}>{shadeTitle}{shadeTitle.length > 26 ? "   ***   " + shadeTitle : ""}</span>
      </button>
      {#if hasTrack}
        <div class="wa-shade-buttons">
          <button type="button" class="wa-shade-btn" onclick={previousTrack} aria-label="Previous" title="Previous">⏮</button>
          <button type="button" class="wa-shade-btn" onclick={togglePlayPause} aria-label={isPlaying ? "Pause" : "Play"} title={isPlaying ? "Pause" : "Play"}>{isPlaying ? "❚❚" : "▶"}</button>
          <button type="button" class="wa-shade-btn" onclick={skipTrack} aria-label="Next" title="Next">⏭</button>
        </div>
      {/if}
    </div>
  {:else}
  <div
    class="flex items-center gap-2 p-2 rounded-xl  shadow-lg transition-all duration-300 hover:shadow-xl border"
          style="background: linear-gradient(135deg, {colors.gradientStart}, {colors.gradientEnd});
           border-color: {colors.accent}30;
           max-width: 320px;"
          in:fly={{ x: 20, duration: 400, delay: 0 }}
          out:fly={{ x: 20, duration: 300 }}
  >
    <!-- Album Art Thumbnail -->
      <div class="relative shrink-0">
      <div
              class="w-10 h-10 rounded-lg overflow-hidden shadow-md ring-1 ring-opacity-30"
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
              <i class="fa-utility-duo fa-regular fa-music"
                 style="--fa-primary-color: {colors.primary}; --fa-secondary-color: {colors.secondary};"></i>
          </div>
        {/if}
      </div>

          <!-- Playing/Connected indicator -->
      {#if isPlaying}
        <div
                class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white shadow-xs animate-pulse"
          style="background: {colors.accent};"
        ></div>
      {:else if botInChannel && !hasTrack}
          <div
                  class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white shadow-xs"
                  style="background: {colors.primary};"
        ></div>
      {/if}
    </div>

    <!-- Track Info -->
      <button
              class="flex-1 min-w-0 cursor-pointer text-left"
      onclick={openMusicDashboard}
      aria-label="Open music dashboard"
    >
          {#if hasTrack}
      <div
              class="font-medium text-xs truncate"
        style="color: {colors.text};"
        title={currentTrack?.Track?.Title}
      >
        {formatTrackTitle(currentTrack?.Track?.Title || "")}
      </div>
      <div
        class="text-xs truncate opacity-80"
        style="color: {colors.text}80;"
        title={currentTrack?.Track?.Author}
      >
        {formatArtist(currentTrack?.Track?.Author || "")}
      </div>
          {:else if botInChannel}
              <div
                      class="font-medium text-xs truncate"
                      style="color: {colors.text};"
              >
                  Ready to play
              </div>
              <div
                      class="text-xs truncate opacity-80"
                      style="color: {colors.text}80;"
              >
                  {channelName || "Voice channel"}
              </div>
          {/if}
    </button>

    <!-- Controls -->
      {#if hasTrack}
          <div class="flex items-center gap-0.5 shrink-0">
              <!-- Previous Button -->
            <button aria-label="Button action"
                      class="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                      style="background: {colors.foreground}20; color: {colors.foreground};"
                      onclick={previousTrack}

            >
                  <i class="fa-utility-duo fa-regular fa-step-backward text-xs"
                     style="--fa-primary-color: {colors.foreground}; --fa-secondary-color: {colors.accent};"></i>
              </button>

              <!-- Play/Pause Button -->
      <button
              class="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md"
              style="background: {colors.controlsHighlight}; color: {colors.text};"
        onclick={togglePlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {#if isPlaying}
            <i class="fa-utility-duo fa-regular fa-pause text-sm"
               style="--fa-primary-color: {colors.text}; --fa-secondary-color: {colors.accent};"></i>
        {:else}
            <i class="fa-utility-duo fa-regular fa-play text-sm"
               style="--fa-primary-color: {colors.text}; --fa-secondary-color: {colors.accent}; margin-left: 1px;"></i>
        {/if}
      </button>

      <!-- Skip Button -->
            <button aria-label="Button action"
              class="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style="background: {colors.foreground}20; color: {colors.foreground};"
        onclick={skipTrack}

            >
          <i class="fa-utility-duo fa-regular fa-step-forward text-xs"
             style="--fa-primary-color: {colors.foreground}; --fa-secondary-color: {colors.accent};"></i>
      </button>
          </div>
      {:else}
          <!-- When bot is idle in channel, just show an arrow to open dashboard -->
          <div class="shrink-0">
            <button aria-label="Navigate"
                      class="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                      style="background: {colors.accent}20; color: {colors.accent};"
                      onclick={openMusicDashboard}

            >
                  <i class="fa-utility-duo fa-regular fa-arrow-right text-sm"
                     style="--fa-primary-color: {colors.accent}; --fa-secondary-color: {colors.primary};"></i>
              </button>
    </div>
      {/if}
  </div>
  {/if}
{/if}

<style>
    /* Windowshade chrome, sharing the classic player's tokens. */
    .wa-shade {
        --wa-lcd: color-mix(in oklch, var(--color-primary, #37ff37) 45%, #5cff5c);
        --wa-lcd-dim: color-mix(in srgb, var(--wa-lcd) 35%, #000000);
        --wa-face: #2b2b36;
        --wa-face-hi: #4a4a5c;
        --wa-face-lo: #15151c;
        --wa-title: color-mix(in oklch, var(--color-primary, #4c6fd1) 35%, #26264a);
        display: flex;
        align-items: center;
        gap: 6px;
        height: 28px;
        max-width: 320px;
        padding: 0 6px;
        background: linear-gradient(180deg, var(--wa-title), color-mix(in srgb, var(--wa-title) 60%, #000));
        border: 1px solid var(--wa-face-lo);
        box-shadow: inset 1px 1px 0 var(--wa-face-hi), inset -1px -1px 0 var(--wa-face-lo), 0 6px 18px rgba(0, 0, 0, 0.55);
        font-family: "Lucida Console", "Monaco", "DejaVu Sans Mono", "Courier New", monospace;
        font-size: 10px;
        color: var(--wa-lcd);
        text-shadow: none;
        user-select: none;
    }

    .wa-shade-lines {
        width: 18px;
        height: 8px;
        background: repeating-linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0 1px, transparent 1px 3px);
    }

    .wa-shade-analyser {
        display: flex;
        align-items: flex-end;
        gap: 1px;
        width: 30px;
        height: 14px;
        padding: 1px;
        background: #000;
        border: 1px solid var(--wa-face-lo);
    }

    .wa-shade-bar {
        flex: 1;
        height: 10%;
        background: linear-gradient(180deg, #ff4040, #ffd040 40%, var(--wa-lcd) 100%);
        transition: height 320ms ease-out;
    }

    .wa-shade-playing .wa-shade-bar {
        animation: wa-shade-bounce 700ms ease-in-out infinite alternate;
        animation-delay: calc(var(--i) * -90ms);
    }

    @keyframes wa-shade-bounce {
        0% { height: 15%; }
        40% { height: 70%; }
        70% { height: 35%; }
        100% { height: 95%; }
    }

    .wa-shade-marquee {
        flex: 1;
        min-width: 0;
        height: 16px;
        padding: 2px 4px;
        background: #000;
        border: 1px solid var(--wa-face-lo);
        color: var(--wa-lcd);
        font: inherit;
        text-align: left;
        overflow: hidden;
        white-space: nowrap;
        text-shadow: 0 0 4px var(--wa-lcd);
        cursor: pointer;
    }

    .wa-shade-text {
        display: inline-block;
    }

    .wa-shade-scroll {
        animation: wa-shade-marquee 16s linear infinite;
    }

    @keyframes wa-shade-marquee {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
    }

    .wa-shade-buttons {
        display: flex;
        gap: 1px;
    }

    .wa-shade-btn {
        width: 20px;
        height: 16px;
        display: grid;
        place-items: center;
        background: linear-gradient(180deg, var(--wa-face-hi), var(--wa-face));
        border: 1px solid var(--wa-face-lo);
        box-shadow: inset 1px 1px 0 #fff2, inset -1px -1px 0 #0006;
        color: #e6e6f0;
        font-size: 8px;
        cursor: pointer;
    }

    .wa-shade-btn:active {
        box-shadow: inset -1px -1px 0 #fff2, inset 1px 1px 0 #0006;
        transform: translateY(1px);
    }

    @media (prefers-reduced-motion: reduce) {
        .wa-shade-playing .wa-shade-bar {
            animation: none;
            height: 45%;
        }
        .wa-shade-scroll {
            animation: none;
        }
    }

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