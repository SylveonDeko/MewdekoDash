<!-- routes/dashboard/music/+page.svelte -->
<script lang="ts">


  import { onDestroy, onMount } from "svelte";
  import { musicApi, clientApi } from "$lib/api/index.ts";
    import type {PageData} from "./$types";
    import {currentGuild} from "$lib/stores/currentGuild";
    import {fade} from "svelte/transition";
    import {goto} from "$app/navigation";
    import Notification from "$lib/components/ui/Notification.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
    import type {OptionType} from "$lib/components/forms/DiscordSelector.svelte";
    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import {colorStore} from "$lib/stores/colorStore.ts";
    import {logger} from "$lib/logger.ts";

    interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let loading = $state(true);
  let error: string | null = $state(null);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let channels: OptionType[] = $state([]);
  let roles: OptionType[] = $state([]);
  let musicStatus: any = $state(null);
  let musicInterval: NodeJS.Timeout;

  // Settings based on your MusicPlayerSettings model
  let settings = $state({
    id: 0,
    guildId: BigInt(0),
    playerRepeat: 2,
    musicChannelId: null as bigint | null,
    volume: 100,
    djRoleId: null as bigint | null,
    autoDisconnect: 1,
    autoPlay: 0,
    voteSkipEnabled: false,
    voteSkipThreshold: 50
  });

  const AutoDisconnect = {
    None: 0,
    Voice: 1,
    Queue: 2,
    Either: 3
  } as const;

  const PlayerRepeatType = {
    None: 0,
    Track: 1,
    Queue: 2,
    All: 2
  } as const;

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function handleMusicChannelChange(detail: any) {
    if (detail.selected) {
      settings.musicChannelId = detail.selected === "null" ? null : BigInt(detail.selected);
    }
  }

  function handleDjRoleChange(detail: any) {
    if (detail.selected) {
      settings.djRoleId = detail.selected === "null" ? null : BigInt(detail.selected);
    }
  }

  function handleRepeatModeChange(detail: any) {
    if (detail.selected && typeof detail.selected === "string") {
      settings.playerRepeat = parseInt(detail.selected);
    }
  }

  function handleAutoDisconnectChange(detail: any) {
    if (detail.selected && typeof detail.selected === "string") {
      settings.autoDisconnect = parseInt(detail.selected);
    }
  }

  function handleAutoPlayChange(detail: any) {
    if (detail.selected && typeof detail.selected === "string") {
      settings.autoPlay = parseInt(detail.selected);
    }
  }

  async function fetchSettings() {
    try {
      if (!$currentGuild?.id) return;
      const response = await musicApi.getMusicSettings(BigInt($currentGuild.id));
      settings = { ...settings, ...response };
    } catch (err) {
      logger.error("Failed to fetch music settings:", err);
      error = err instanceof Error ? err.message : "Failed to fetch music settings";
    }
  }

  async function fetchChannels() {
    try {
      if (!$currentGuild?.id) return;
      const channelData = await clientApi.getTextChannels(BigInt($currentGuild.id));
      channels = channelData.map(ch => ({ id: ch.id, name: ch.name }));
    } catch (err) {
      logger.error("Failed to fetch channels:", err);
    }
  }

  async function fetchRoles() {
    try {
      if (!$currentGuild?.id) return;
      const roleData = await clientApi.getRoles(BigInt($currentGuild.id));
      roles = roleData.map(role => ({
        id: role.id,
        name: role.name
      }));
    } catch (err) {
      logger.error("Failed to fetch roles:", err);
    }
  }

  async function updateSettings() {
    try {
      if (!$currentGuild?.id) return;
      await musicApi.updateMusicSettings(BigInt($currentGuild.id), settings);
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
      musicStatus = await musicApi.getPlayerStatus(BigInt($currentGuild.id), BigInt(data.user.id));
    } catch (err) {
      logger.error("Failed to fetch playback status:", err);
    }
  }

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    loading = true;
    try {
      await Promise.all([fetchSettings(), fetchChannels(), fetchRoles()]);
      musicInterval = setInterval(fetchPlaybackStatus, 5000);
    } catch (err) {
      error = "Failed to fetch data";
      logger.error(error, err);
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    if (musicInterval) clearInterval(musicInterval);
  });

  let colors = $derived($colorStore);
  // Action buttons for the layout
  let actionButtons = $derived([
    {
      label: "Save Changes",
      icon: "fa-floppy-disk",
      action: updateSettings,
      loading: false,
      style: `background: linear-gradient(to right, ${colors.primary}, ${colors.secondary}); color: ${colors.text}; box-shadow: 0 0 20px ${colors.primary}20;`
    }
  ]);
  // Watch for guild changes
  $effect(() => {
    if ($currentGuild) {
      fetchSettings();
      fetchChannels();
      fetchRoles();
      fetchPlaybackStatus();
    }
  });
</script>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="mb-6" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  statusMessages={statusMessages}
  subtitle="Configure music playback settings and controls"
  icon="fa-music"
  {actionButtons}
  guildName={$currentGuild?.name || "Dashboard"}
  title="Music Player Settings"
>

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
        <i class="fa-utility-duo fa-regular fa-circle-exclamation" style="--fa-primary-color: {colors.accent}; --fa-secondary-color: {colors.primary}; font-size: 20px;"></i>
        <p style="color: {colors.accent}">{error}</p>
      </div>
    {:else}
      <!-- Current Playback Section -->
      {#if musicStatus?.currentTrack}
        <div
          class=" rounded-2xl border p-6 shadow-2xl transition-all"
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
              <i class="fa-utility-duo fa-regular fa-music" style="--fa-primary-color: {colors.primary}; --fa-secondary-color: {colors.secondary}; font-size: 24px;"></i>
            </div>
            <h2 class="text-xl font-bold" style="color: {colors.text}">Now Playing</h2>
          </div>

          <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
            <img
              src={musicStatus.currentTrack.track.artworkUri || '/default-album.png'}
              alt="Album Art"
              class="w-24 h-24 rounded-xl object-cover"
              style="border: 2px solid {colors.primary}30;"
            >
              <div class="grow">
              <h3 class="font-medium text-lg" style="color: {colors.text}">
                {musicStatus.currentTrack.track.title}
              </h3>
              <p style="color: {colors.muted}">{musicStatus.currentTrack.track.author}</p>
              <div class="flex items-center gap-2 mt-2">
                <i class="fa-solid fa-list" style="color: {colors.primary}; font-size: 16px;"></i>
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
          class=" rounded-2xl border p-6 shadow-2xl transition-all"
          style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                 border-color: {colors.primary}30;"
        >
          <div class="flex items-center gap-3 mb-6">
            <div
              class="p-3 rounded-xl"
              style="background: linear-gradient(135deg, {colors.primary}20, {colors.secondary}20);
                     color: {colors.primary};"
            >
              <i class="fa-utility-duo fa-regular fa-gear" style="--fa-primary-color: {colors.primary}; --fa-secondary-color: {colors.secondary}; font-size: 24px;"></i>
            </div>
            <h2 class="text-xl font-bold" style="color: {colors.text}">General Settings</h2>
          </div>

          <div class="space-y-6">
            <!-- Volume -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <i class="fa-solid fa-volume" style="color: {colors.primary}; font-size: 16px;"></i>
                <label for="default-volume" class="font-medium" style="color: {colors.text}">
                  Default Volume
                </label>
              </div>
              <input
                id="default-volume"
                type="range"
                min="0"
                max="100"
                bind:value={settings.volume}
                class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style="background: {colors.primary}20;"
              >
              <div class="text-sm mt-1" style="color: {colors.muted}">{settings.volume}%</div>
            </div>

            <!-- Music Channel -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <i class="fa-solid fa-music" style="color: {colors.secondary}; font-size: 16px;"></i>
                <span id="music-channel-label" class="font-medium" style="color: {colors.text}">
                  Music Channel
                </span>
              </div>
              <DiscordSelector
                type="channel"
                options={[{id: 'null', name: 'All Channels'}, ...channels]}
                selected={settings.musicChannelId === null ? 'null' : settings.musicChannelId.toString()}
                placeholder="Select music channel..."
                onchange={handleMusicChannelChange}
              />
            </div>

            <!-- DJ Role -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <i class="fa-solid fa-users" style="color: {colors.accent}; font-size: 16px;"></i>
                <span id="dj-role-label" class="font-medium" style="color: {colors.text}">
                  DJ Role
                </span>
              </div>
              <DiscordSelector
                type="role"
                options={[{id: 'null', name: 'No DJ Role'}, ...roles]}
                selected={settings.djRoleId === null ? 'null' : settings.djRoleId.toString()}
                placeholder="Select DJ role..."
                onchange={handleDjRoleChange}
              />
            </div>

            <!-- Player Repeat -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <i class="fa-solid fa-clock" style="color: {colors.primary}; font-size: 16px;"></i>
                <span id="repeat-mode-label" class="font-medium" style="color: {colors.text}">
                  Repeat Mode
                </span>
              </div>
              <DiscordSelector
                type="custom"
                options={[
                  {id: PlayerRepeatType.None.toString(), name: 'None'},
                  {id: PlayerRepeatType.Track.toString(), name: 'Single Track'},
                  {id: PlayerRepeatType.Queue.toString(), name: 'Queue'}
                ]}
                selected={settings.playerRepeat.toString()}
                placeholder="Select repeat mode..."
                onchange={handleRepeatModeChange}
              />
            </div>
          </div>
        </div>

        <!-- Advanced Settings -->
        <div
          class=" rounded-2xl border p-6 shadow-2xl transition-all"
          style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                 border-color: {colors.primary}30;"
        >
          <div class="flex items-center gap-3 mb-6">
            <div
              class="p-3 rounded-xl"
              style="background: linear-gradient(135deg, {colors.primary}20, {colors.secondary}20);
                     color: {colors.secondary};"
            >
              <i class="fa-utility-duo fa-regular fa-sliders" style="--fa-primary-color: {colors.secondary}; --fa-secondary-color: {colors.primary}; font-size: 24px;"></i>
            </div>
            <h2 class="text-xl font-bold" style="color: {colors.text}">Advanced Settings</h2>
          </div>

          <div class="space-y-6">
            <!-- Auto Disconnect -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <i class="fa-solid fa-users" style="color: {colors.primary}; font-size: 16px;"></i>
                <span id="auto-disconnect-label" class="font-medium" style="color: {colors.text}">
                  Auto Disconnect
                </span>
              </div>
              <DiscordSelector
                type="custom"
                options={[
                  {id: AutoDisconnect.None.toString(), name: 'Never'},
                  {id: AutoDisconnect.Voice.toString(), name: 'When Voice Empty'},
                  {id: AutoDisconnect.Queue.toString(), name: 'When Queue Empty'},
                  {id: AutoDisconnect.Either.toString(), name: 'Either Condition'}
                ]}
                selected={settings.autoDisconnect.toString()}
                placeholder="Select auto disconnect..."
                onchange={handleAutoDisconnectChange}
              />
            </div>

            <!-- Auto Play -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <i class="fa-solid fa-music" style="color: {colors.secondary}; font-size: 16px;"></i>
                <span id="auto-play-similar-label" class="font-medium" style="color: {colors.text}">
                  Auto Play Similar
                </span>
              </div>
              <DiscordSelector
                type="custom"
                options={[
                  {id: '0', name: 'Disabled'},
                  {id: '1', name: 'Enabled'}
                ]}
                selected={settings.autoPlay.toString()}
                placeholder="Select auto play..."
                onchange={handleAutoPlayChange}
              />
            </div>

            <!-- Vote Skip Settings -->
            <div class="space-y-4">
              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={settings.voteSkipEnabled}
                  class="sr-only peer"
                >
                <span
                  class="relative w-11 h-6 rounded-full transition-all duration-200 block"
                  style="background: {settings.voteSkipEnabled ? colors.primary : colors.primary + '30'};"
                >
                  <span
                    class="absolute w-4 h-4 rounded-full top-1 left-1 transition-all duration-200 block"
                    style="background: {colors.text};
                           transform: translateX({settings.voteSkipEnabled ? '20px' : '0'});"
                  ></span>
                </span>
                <span style="color: {colors.text}">Enable Vote Skip</span>
              </label>

              {#if settings.voteSkipEnabled}
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <i class="fa-solid fa-gear" style="color: {colors.accent}; font-size: 16px;"></i>
                    <label for="vote-skip-threshold" class="font-medium" style="color: {colors.text}">
                      Vote Skip Threshold
                    </label>
                  </div>
                  <input
                    id="vote-skip-threshold"
                    type="range"
                    min="1"
                    max="100"
                    bind:value={settings.voteSkipThreshold}
                    class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style="background: {colors.primary}20;"
                  >
                  <div class="text-sm mt-1" style="color: {colors.muted}">
                    {settings.voteSkipThreshold}% of users must vote to skip
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>

    {/if}
</DashboardPageLayout>

<style lang="postcss">
    @reference '../../../app.css'; /* Custom range input styling */
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

    /* Custom scrollbar *//* Prevent blue highlight on iOS */

    /* Custom styling for options */
</style>