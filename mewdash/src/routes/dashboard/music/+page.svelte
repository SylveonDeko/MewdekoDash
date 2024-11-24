<!-- routes/dashboard/music/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { api } from "$lib/api";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { fade, slide } from "svelte/transition";
  import { goto } from "$app/navigation";
  import Notification from "$lib/Notification.svelte";
  import { browser } from "$app/environment";

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

  // Settings based on your MusicPlayerSettings model
  let settings = {
    id: 0,
    guildId: "",
    playerRepeat: 2, // Default to Queue
    musicChannelId: null as string | null,
    volume: 100,
    djRoleId: null as string | null,
    autoDisconnect: 1, // Default to Voice
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
    Song = 1, // Same as Track
    All = 2,  // Same as Queue
    Off = 0   // Same as None
  }

  function showNotificationMessage(
    message: string,
    type: "success" | "error" = "success"
  ) {
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
      console.error("Failed to fetch music settings:", err);
      error = err instanceof Error ? err.message : "Failed to fetch music settings";
    }
  }

  async function fetchChannels() {
    try {
      if (!$currentGuild?.id) return;
      channels = await api.getGuildTextChannels(BigInt($currentGuild.id));
    } catch (err) {
      console.error("Failed to fetch channels:", err);
    }
  }

  async function fetchRoles() {
    try {
      if (!$currentGuild?.id) return;
      roles = await api.getGuildRoles(BigInt($currentGuild.id));
    } catch (err) {
      console.error("Failed to fetch roles:", err);
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
      console.error("Failed to fetch playback status:", err);
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
      await Promise.all([fetchSettings(), fetchChannels(), fetchRoles()]);
      musicInterval = setInterval(fetchPlaybackStatus, 5000);
    } catch (err) {
      error = "Failed to fetch data";
      console.error(error, err);
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    if (musicInterval) clearInterval(musicInterval);
  });
</script>

<svelte:head>
  <title>Music Settings - Mewdeko Dashboard</title>
</svelte:head>

<div class="container mx-auto px-4 py-6 max-w-7xl min-h-screen">
  <h1 class="text-3xl font-bold mb-8">Music Settings</h1>

  {#if showNotification}
    <div class="fixed top-4 right-4 z-50">
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}

  {#if loading}
    <div class="flex flex-col items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/50 border-t-blue-500" />
      <span class="mt-4 text-gray-400">Loading settings...</span>
    </div>
  {:else if error}
    <div class="bg-red-500/10 border-l-4 border-red-500 text-red-500 p-4 rounded-lg mb-6" role="alert">
      <div class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <div>
          <div class="font-medium">Error Occurred</div>
          <div class="text-sm mt-1">{error}</div>
        </div>
      </div>
    </div>
  {:else}
    <!-- Current Playback Section -->
    {#if musicStatus?.currentTrack}
      <div class="col-span-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-blue-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
          </svg>
          Now Playing
        </h2>
        <div class="flex items-center gap-4">
          <div class="flex-grow">
            <h3 class="font-medium text-lg">{musicStatus.currentTrack.track.title}</h3>
            <p class="text-gray-400">{musicStatus.currentTrack.track.author}</p>
          </div>
          <div class="text-sm text-gray-400">
            Queue: {musicStatus.queue.length} tracks
          </div>
        </div>
      </div>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Main Settings -->
      <section class="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <h2 class="text-xl font-semibold mb-6">General Settings</h2>

        <div class="space-y-6">
          <!-- Volume -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Default Volume
            </label>
            <input
              type="range"
              min="0"
              max="100"
              bind:value={settings.volume}
              class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div class="text-sm text-gray-400 mt-1">{settings.volume}%</div>
          </div>

          <!-- Music Channel -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Music Channel
            </label>
            <select
              bind:value={settings.musicChannelId}
              class="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value={null}>No Channel (All Channels)</option>
              {#each channels as channel}
                <option value={channel.id}>{channel.name}</option>
              {/each}
            </select>
          </div>

          <!-- DJ Role -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              DJ Role
            </label>
            <select
              bind:value={settings.djRoleId}
              class="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value={null}>No DJ Role</option>
              {#each roles as role}
                <option value={role.id}>{role.name}</option>
              {/each}
            </select>
          </div>

          <!-- Player Repeat -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Repeat Mode
            </label>
            <select
              bind:value={settings.playerRepeat}
              class="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value={PlayerRepeatType.None}>None</option>
              <option value={PlayerRepeatType.Track}>Single Track</option>
              <option value={PlayerRepeatType.Queue}>Queue</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Advanced Settings -->
      <section class="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <h2 class="text-xl font-semibold mb-6">Advanced Settings</h2>

        <div class="space-y-6">
          <!-- Auto Disconnect -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Auto Disconnect
            </label>
            <select
              bind:value={settings.autoDisconnect}
              class="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value={AutoDisconnect.None}>Never</option>
              <option value={AutoDisconnect.Voice}>When Voice Empty</option>
              <option value={AutoDisconnect.Queue}>When Queue Empty</option>
              <option value={AutoDisconnect.Either}>Either Condition</option>
            </select>
          </div>

          <!-- Auto Play -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Auto Play Similar
            </label>
            <select
              bind:value={settings.autoPlay}
              class="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value={0}>Disabled</option>
              <option value={1}>Enabled</option>
            </select>
          </div>

          <!-- Vote Skip Settings -->
          <div class="space-y-4">
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                bind:checked={settings.voteSkipEnabled}
                class="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-300">Enable Vote Skip</span>
            </label>

            {#if settings.voteSkipEnabled}
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Vote Skip Threshold (%)
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  bind:value={settings.voteSkipThreshold}
                  class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div class="text-sm text-gray-400 mt-1">{settings.voteSkipThreshold}%</div>
              </div>
            {/if}
          </div>
        </div>
      </section>
    </div>

    <!-- Save Button -->
    <div class="mt-8 flex justify-end">
      <button
        class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
        on:click={updateSettings}
      >
        Save Changes
      </button>
    </div>
  {/if}
</div>

<style lang="postcss">
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
    background: #3b82f6;
    cursor: pointer;
    margin-top: -6px;
  }

  input[type="range"]::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    background: #374151;
    border-radius: 2px;
  }

  input[type="range"]::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
  }

  input[type="range"]::-moz-range-track {
    width: 100%;
    height: 4px;
    background: #374151;
    border-radius: 2px;
  }

  input[type="range"]:focus {
    outline: none;
  }

  input[type="range"]:focus::-webkit-slider-thumb {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }

  input[type="range"]:focus::-moz-range-thumb {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }

  /* Custom checkbox styling */
  input[type="checkbox"] {
    @apply rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500;
  }

  /* Custom select styling */
  select {
    @apply appearance-none bg-gray-700 border-gray-600 rounded-lg text-white px-4 py-2;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
  }

  select:focus {
    @apply outline-none ring-2 ring-blue-500 border-transparent;
  }

  /* Hover effects for buttons */
  button:not(:disabled):hover {
    @apply transform scale-105 transition-transform duration-200;
  }

  /* Animation for loading spinner */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>