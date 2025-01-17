<!-- routes/dashboard/music/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { api } from "$lib/api";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { fade } from "svelte/transition";
  import { goto } from "$app/navigation";
  import Notification from "$lib/Notification.svelte";
  import { browser } from "$app/environment";
  import ColorThief from "colorthief";
  import {currentInstance} from "$lib/stores/instanceStore.ts";
  import { Volume2, Music2, Settings, Users, Clock, List, AlertCircle, Sliders } from "lucide-svelte";
  import { logger } from "$lib/logger.ts";

  export let data: PageData;
  let loading = true;
  let error: string | null = null;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let channels: Array<{ id: string; name: string }> = [];
  let roles: Array<{ id: string; name: string }> = [];
  let musicStatus: any = null;
  let musicInterval: NodeJS.Timeout;
  let isMobile = false;

  let colors = {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    accent: "#ec4899",
    text: "#ffffff",
    muted: "#9ca3af",
    gradientStart: "#3b82f6",
    gradientMid: "#8b5cf6",
    gradientEnd: "#ec4899"
  };

  // Settings based on your MusicPlayerSettings model
  let settings = {
    id: 0,
    guildId: "",
    playerRepeat: 2,
    musicChannelId: null as string | null,
    volume: 100,
    djRoleId: null as string | null,
    autoDisconnect: 1,
    autoPlay: 0,
    voteSkipEnabled: false,
    voteSkipThreshold: 50
  };

  enum AutoDisconnect {
    None = 0,
    Voice = 1,
    Queue = 2,
    Either = 3
  }

  enum PlayerRepeatType {
    None = 0,
    Track = 1,
    Queue = 2,
    Song = 1,
    All = 2,
    Off = 0
  }

  // Function to convert RGB to HSL
  function rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }

  // Function to convert RGB to HEX
  function rgbToHex(r: number, g: number, b: number) {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  }

  // Function to adjust color lightness
  function adjustLightness(rgb: number[], lightness: number) {
    const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    return `hsl(${hsl[0]}, ${hsl[1]}%, ${lightness}%)`;
  }

  async function extractColors() {
    if (!data?.user?.avatar) return;
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = $currentInstance?.botAvatar;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const colorThief = new ColorThief();
      const dominantColor = colorThief.getColor(img);
      const palette = colorThief.getPalette(img);

      const primaryHex = rgbToHex(...dominantColor);
      const secondaryHex = rgbToHex(...palette[1]);
      const accentHex = rgbToHex(...palette[2]);

      colors = {
        primary: primaryHex,
        secondary: secondaryHex,
        accent: accentHex,
        text: adjustLightness(dominantColor, 95),
        muted: adjustLightness(dominantColor, 60),
        gradientStart: primaryHex,
        gradientMid: secondaryHex,
        gradientEnd: accentHex
      };
    } catch (err) {
      logger.error("Failed to extract colors:", err);
    }
  }

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function fetchSettings() {
    try {
      if (!$currentGuild?.id) return;
      const response = await api.getMusicSettings(BigInt($currentGuild.id));
      settings = { ...settings, ...response };
    } catch (err) {
      logger.error("Failed to fetch music settings:", err);
      error = err instanceof Error ? err.message : "Failed to fetch music settings";
    }
  }

  async function fetchChannels() {
    try {
      if (!$currentGuild?.id) return;
      channels = await api.getGuildTextChannels(BigInt($currentGuild.id));
    } catch (err) {
      logger.error("Failed to fetch channels:", err);
    }
  }

  async function fetchRoles() {
    try {
      if (!$currentGuild?.id) return;
      roles = await api.getGuildRoles(BigInt($currentGuild.id));
    } catch (err) {
      logger.error("Failed to fetch roles:", err);
    }
  }

  async function updateSettings() {
    try {
      if (!$currentGuild?.id) return;
      await api.updateMusicSettings(BigInt($currentGuild.id), settings);
      showNotificationMessage("Settings updated successfully");
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to update settings",
        "error"
      );
    }
  }

  async function fetchPlaybackStatus() {
    try {
      if (!$currentGuild?.id || !data.user?.id) return;
      const status = await api.getPlayerStatus(BigInt($currentGuild.id), BigInt(data.user.id));
      musicStatus = status;
    } catch (err) {
      logger.error("Failed to fetch playback status:", err);
    }
  }

  // Watch for guild changes
  $: if ($currentGuild) {
    fetchSettings();
    fetchChannels();
    fetchRoles();
    fetchPlaybackStatus();
  }

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    loading = true;
    try {
      await Promise.all([fetchSettings(), fetchChannels(), fetchRoles(), extractColors()]);
      musicInterval = setInterval(fetchPlaybackStatus, 5000);
      checkMobile();
      if (browser) window.addEventListener("resize", checkMobile);
    } catch (err) {
      error = "Failed to fetch data";
      logger.error(error, err);
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    if (musicInterval) clearInterval(musicInterval);
    if (browser) window.removeEventListener("resize", checkMobile);
  });

  $: colorVars = `
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-accent: ${colors.accent};
    --color-text: ${colors.text};
    --color-muted: ${colors.muted};
  `;
</script>

<svelte:head>
  <title>Music Settings - Dashboard</title>
</svelte:head>

<div
  class="min-h-screen p-4 md:p-6"
  style="{colorVars} background: radial-gradient(circle at top,
    {colors.gradientStart}15 0%,
    {colors.gradientMid}10 50%,
    {colors.gradientEnd}05 100%);"
>
  <div class="max-w-7xl mx-auto space-y-8">
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}

    <!-- Header -->
    <div
      class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
             border-color: {colors.primary}30;"
    >
      <h1 class="text-3xl font-bold" style="color: {colors.text}">Music Settings</h1>
      <p class="mt-2" style="color: {colors.muted}">Configure music playback preferences and permissions</p>
    </div>

    {#if loading}
      <div class="flex justify-center items-center min-h-[200px]">
        <div
          class="w-12 h-12 border-4 rounded-full animate-spin"
          style="border-color: {colors.primary}20;
                 border-top-color: {colors.primary};">
        </div>
      </div>
    {:else if error}
      <div
        class="rounded-xl p-4 flex items-center gap-3"
        style="background: {colors.accent}10;"
        role="alert"
      >
        <AlertCircle class="w-5 h-5" style="color: {colors.accent}" />
        <p style="color: {colors.accent}">{error}</p>
      </div>
    {:else}
      <!-- Current Playback Section -->
      {#if musicStatus?.currentTrack}
        <div
          class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
          style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                 border-color: {colors.primary}30;"
          transition:fade
        >
          <div class="flex items-center gap-3 mb-6">
            <div
              class="p-3 rounded-xl"
              style="background: linear-gradient(135deg, {colors.primary}20, {colors.secondary}20);
                     color: {colors.primary};"
            >
              <Music2 class="w-6 h-6" />
            </div>
            <h2 class="text-xl font-bold" style="color: {colors.text}">Now Playing</h2>
          </div>

          <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
            <img
              src={musicStatus.currentTrack.track.artworkUri || '/default-album.png'}
              alt="Album Art"
              class="w-24 h-24 rounded-xl object-cover"
              style="border: 2px solid {colors.primary}30;"
            />
            <div class="flex-grow">
              <h3 class="font-medium text-lg" style="color: {colors.text}">
                {musicStatus.currentTrack.track.title}
              </h3>
              <p style="color: {colors.muted}">{musicStatus.currentTrack.track.author}</p>
              <div class="flex items-center gap-2 mt-2">
                <List class="w-4 h-4" style="color: {colors.primary}" />
                <span class="text-sm" style="color: {colors.muted}">
                  Queue: {musicStatus.queue.length} tracks
                </span>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- General Settings -->
        <div
          class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
          style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                 border-color: {colors.primary}30;"
        >
          <div class="flex items-center gap-3 mb-6">
            <div
              class="p-3 rounded-xl"
              style="background: linear-gradient(135deg, {colors.primary}20, {colors.secondary}20);
                     color: {colors.primary};"
            >
              <Settings class="w-6 h-6" />
            </div>
            <h2 class="text-xl font-bold" style="color: {colors.text}">General Settings</h2>
          </div>

          <div class="space-y-6">
            <!-- Volume -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <Volume2 class="w-4 h-4" style="color: {colors.primary}" />
                <label class="font-medium" style="color: {colors.text}">
                  Default Volume
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                bind:value={settings.volume}
                class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style="background: {colors.primary}20;"
              />
              <div class="text-sm mt-1" style="color: {colors.muted}">{settings.volume}%</div>
            </div>

            <!-- Music Channel -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <Music2 class="w-4 h-4" style="color: {colors.secondary}" />
                <label class="font-medium" style="color: {colors.text}">
                  Music Channel
                </label>
              </div>
              <select
                bind:value={settings.musicChannelId}
                class="w-full p-3 rounded-lg border transition-all duration-200"
                style="background: {colors.primary}10;
                       border-color: {colors.secondary}30;
                       color: {colors.text};"
              >
                <option value={null}>No Channel (All Channels)</option>
                {#each channels as channel}
                  <option value={channel.id}>{channel.name}</option>
                {/each}
              </select>
            </div>

            <!-- DJ Role -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <Users class="w-4 h-4" style="color: {colors.accent}" />
                <label class="font-medium" style="color: {colors.text}">
                  DJ Role
                </label>
              </div>
              <select
                bind:value={settings.djRoleId}
                class="w-full p-3 rounded-lg border transition-all duration-200"
                style="background: {colors.primary}10;
                       border-color: {colors.accent}30;
                       color: {colors.text};"
              >
                <option value={null}>No DJ Role</option>
                {#each roles as role}
                  <option value={role.id}>{role.name}</option>
                {/each}
              </select>
            </div>

            <!-- Player Repeat -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <Clock class="w-4 h-4" style="color: {colors.primary}" />
                <label class="font-medium" style="color: {colors.text}">
                  Repeat Mode
                </label>
              </div>
              <select
                bind:value={settings.playerRepeat}
                class="w-full p-3 rounded-lg border transition-all duration-200"
                style="background: {colors.primary}10;
                       border-color: {colors.primary}30;
                       color: {colors.text};"
              >
                <option value={PlayerRepeatType.None}>None</option>
                <option value={PlayerRepeatType.Track}>Single Track</option>
                <option value={PlayerRepeatType.Queue}>Queue</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Advanced Settings -->
        <div
          class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
          style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                 border-color: {colors.primary}30;"
        >
          <div class="flex items-center gap-3 mb-6">
            <div
              class="p-3 rounded-xl"
              style="background: linear-gradient(135deg, {colors.primary}20, {colors.secondary}20);
                     color: {colors.secondary};"
            >
              <Sliders class="w-6 h-6" />
            </div>
            <h2 class="text-xl font-bold" style="color: {colors.text}">Advanced Settings</h2>
          </div>

          <div class="space-y-6">
            <!-- Auto Disconnect -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <Users class="w-4 h-4" style="color: {colors.primary}" />
                <label class="font-medium" style="color: {colors.text}">
                  Auto Disconnect
                </label>
              </div>
              <select
                bind:value={settings.autoDisconnect}
                class="w-full p-3 rounded-lg border transition-all duration-200"
                style="background: {colors.primary}10;
                       border-color: {colors.primary}30;
                       color: {colors.text};"
              >
                <option value={AutoDisconnect.None}>Never</option>
                <option value={AutoDisconnect.Voice}>When Voice Empty</option>
                <option value={AutoDisconnect.Queue}>When Queue Empty</option>
                <option value={AutoDisconnect.Either}>Either Condition</option>
              </select>
            </div>

            <!-- Auto Play -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <Music2 class="w-4 h-4" style="color: {colors.secondary}" />
                <label class="font-medium" style="color: {colors.text}">
                  Auto Play Similar
                </label>
              </div>
              <select
                bind:value={settings.autoPlay}
                class="w-full p-3 rounded-lg border transition-all duration-200"
                style="background: {colors.primary}10;
                       border-color: {colors.secondary}30;
                       color: {colors.text};"
              >
                <option value={0}>Disabled</option>
                <option value={1}>Enabled</option>
              </select>
            </div>

            <!-- Vote Skip Settings -->
            <div class="space-y-4">
              <label class="flex items-center gap-3">
                <div
                  class="relative w-11 h-6 rounded-full transition-all duration-200"
                  style="background: {settings.voteSkipEnabled ? colors.primary : colors.primary + '30'};"
                >
                  <input
                    type="checkbox"
                    bind:checked={settings.voteSkipEnabled}
                    class="sr-only peer"
                  />
                  <div
                    class="absolute w-4 h-4 rounded-full top-1 left-1 transition-all duration-200"
                    style="background: {colors.text};
                           transform: translateX({settings.voteSkipEnabled ? '20px' : '0'});"
                  />
                </div>
                <span style="color: {colors.text}">Enable Vote Skip</span>
              </label>

              {#if settings.voteSkipEnabled}
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <Settings class="w-4 h-4" style="color: {colors.accent}" />
                    <label class="font-medium" style="color: {colors.text}">
                      Vote Skip Threshold
                    </label>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    bind:value={settings.voteSkipThreshold}
                    class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style="background: {colors.primary}20;"
                  />
                  <div class="text-sm mt-1" style="color: {colors.muted}">
                    {settings.voteSkipThreshold}% of users must vote to skip
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="mt-8 flex justify-end">
        <button
          class="px-6 py-3 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm"
          style="background: linear-gradient(to right, {colors.primary}, {colors.secondary});
                 color: {colors.text};
                 box-shadow: 0 0 20px {colors.primary}20;"
          on:click={updateSettings}
        >
          Save Changes
        </button>
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
    :global(body) {
        background-color: #1a202c;
        color: #ffffff;
    }

    :global(select),
    :global(input),
    :global(textarea) {
        color-scheme: dark;
    }

    /* Custom range input styling */
    input[type="range"] {
        -webkit-appearance: none;
        background: transparent;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: var(--color-primary);
        cursor: pointer;
        margin-top: -6px;
        transition: transform 0.2s;
    }

    input[type="range"]::-webkit-slider-thumb:hover {
        transform: scale(1.2);
    }

    input[type="range"]::-webkit-slider-runnable-track {
        width: 100%;
        height: 4px;
        border-radius: 2px;
    }

    input[type="range"]::-moz-range-thumb {
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: var(--color-primary);
        cursor: pointer;
        border: none;
        transition: transform 0.2s;
    }

    input[type="range"]::-moz-range-thumb:hover {
        transform: scale(1.2);
    }

    input[type="range"]::-moz-range-track {
        width: 100%;
        height: 4px;
        border-radius: 2px;
    }

    input[type="range"]:focus {
        outline: none;
    }

    /* Custom select styling */
    select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 0.5rem center;
        background-repeat: no-repeat;
        background-size: 1.5em 1.5em;
        padding-right: 2.5rem;
    }

    /* Custom scrollbar */
    :global(*::-webkit-scrollbar) {
        @apply w-2;
    }

    :global(*::-webkit-scrollbar-track) {
        background: var(--color-primary) 10;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background: var(--color-primary) 30;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb:hover) {
        background: var(--color-primary) 50;
    }

    /* Prevent blue highlight on iOS */
    select:focus {
        -webkit-tap-highlight-color: transparent;
    }

    /* Custom styling for options */
    option {
        background-color: #374151;
        color: white;
        padding: 0.5rem;
    }
</style>