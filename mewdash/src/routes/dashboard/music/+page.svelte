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
    import type { TtsVcSetting, TtsVoice } from "$lib/api/music/models";

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
  let voiceChannels: OptionType[] = $state([]);
  let roles: OptionType[] = $state([]);
  let musicStatus: any = $state(null);
  let musicInterval: NodeJS.Timeout;

  // Tab state
  let activeTab = $state("music");
  const tabs = [
    { id: "music", label: "Music Settings", icon: "fa-music" },
    { id: "tts", label: "TTS Settings", icon: "fa-microphone" }
  ];

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

  // TTS state
  let ttsSettings = $state({
    volume: 100,
    speed: 1.0,
    defaultVoice: null as string | null,
    replyContext: true,
    attachmentNarration: true,
    consecutiveGrouping: true,
    maxQueueSize: 10,
    roleId: null as bigint | null,
    vcSettings: [] as TtsVcSetting[]
  });

  let ttsBlockedUsers: any[] = $state([]);
  let ttsVoiceSearch = $state("");
  let ttsVoiceResults: TtsVoice[] = $state([]);
  let searchingVoices = $state(false);
  let showAddVc = $state(false);
  let newVcId = $state<string | null>(null);
  let blockUserId = $state("");

  // Music link conversion channels
  let linkChannels: bigint[] = $state([]);
  let showAddLinkChannel = $state(false);
  let newLinkChannelId = $state<string | null>(null);

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

  function handleTtsRoleChange(detail: any) {
    if (detail.selected) {
      ttsSettings.roleId = detail.selected === "null" ? null : BigInt(detail.selected);
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

  async function fetchVoiceChannels() {
    try {
      if (!$currentGuild?.id) return;
      const vcData = await clientApi.getVoiceChannels(BigInt($currentGuild.id));
      voiceChannels = vcData.map(vc => ({ id: vc.id, name: vc.name }));
    } catch (err) {
      logger.error("Failed to fetch voice channels:", err);
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

  async function fetchTtsSettings() {
    try {
      if (!$currentGuild?.id) return;
      const response: any = await musicApi.getTtsSettings(BigInt($currentGuild.id));
      ttsSettings = {
        volume: response.ttsVolume ?? 100,
        speed: response.ttsSpeed ?? 1.0,
        defaultVoice: response.ttsDefaultVoice ?? null,
        replyContext: response.ttsReplyContext ?? true,
        attachmentNarration: response.ttsAttachmentNarration ?? true,
        consecutiveGrouping: response.ttsConsecutiveGrouping ?? true,
        maxQueueSize: response.ttsMaxQueueSize ?? 10,
        roleId: response.ttsRoleId ?? null,
        vcSettings: (response.voiceChannels ?? []).map((vc: any) => ({
          voiceChannelId: vc.voiceChannelId,
          enabled: vc.enabled,
          linkedTextChannelId: vc.linkedTextChannelId ?? null,
          announceJoinLeave: vc.announceJoinLeave,
          joinFormat: vc.joinFormat ?? null,
          leaveFormat: vc.leaveFormat ?? null
        }))
      };
    } catch (err) {
      logger.error("Failed to fetch TTS settings:", err);
    }
  }

  async function fetchTtsBlockedUsers() {
    try {
      if (!$currentGuild?.id) return;
      const response = await musicApi.getTtsBlockedUsers(BigInt($currentGuild.id));
      ttsBlockedUsers = response || [];
    } catch (err) {
      logger.error("Failed to fetch TTS blocked users:", err);
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

  async function updateTtsSettings() {
    try {
      if (!$currentGuild?.id) return;
      await musicApi.updateTtsSettings(BigInt($currentGuild.id), {
        volume: ttsSettings.volume,
        speed: ttsSettings.speed,
        defaultVoice: ttsSettings.defaultVoice ?? "",
        replyContext: ttsSettings.replyContext,
        attachmentNarration: ttsSettings.attachmentNarration,
        consecutiveGrouping: ttsSettings.consecutiveGrouping,
        maxQueueSize: ttsSettings.maxQueueSize,
        roleId: ttsSettings.roleId ?? BigInt(0)
      });
      showNotificationMessage("TTS settings updated successfully");
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to update TTS settings",
        "error"
      );
    }
  }

  async function addVcSetting() {
    if (!$currentGuild?.id || !newVcId) return;
    try {
      await musicApi.upsertTtsVcSetting(BigInt($currentGuild.id), {
        voiceChannelId: BigInt(newVcId),
        enabled: true,
        linkedTextChannelId: null,
        announceJoinLeave: false,
        joinFormat: null,
        leaveFormat: null
      });
      showAddVc = false;
      newVcId = null;
      await fetchTtsSettings();
      showNotificationMessage("Voice channel TTS enabled");
    } catch (err) {
      showNotificationMessage("Failed to add VC setting", "error");
    }
  }

  async function updateVcSetting(vc: TtsVcSetting) {
    if (!$currentGuild?.id) return;
    try {
      await musicApi.upsertTtsVcSetting(BigInt($currentGuild.id), {
        voiceChannelId: vc.voiceChannelId,
        enabled: vc.enabled,
        linkedTextChannelId: vc.linkedTextChannelId,
        announceJoinLeave: vc.announceJoinLeave,
        joinFormat: vc.joinFormat,
        leaveFormat: vc.leaveFormat
      });
      showNotificationMessage("VC setting updated");
    } catch (err) {
      showNotificationMessage("Failed to update VC setting", "error");
    }
  }

  async function removeVcSetting(voiceChannelId: bigint) {
    if (!$currentGuild?.id) return;
    try {
      await musicApi.removeTtsVcSetting(BigInt($currentGuild.id), voiceChannelId);
      await fetchTtsSettings();
      showNotificationMessage("Voice channel TTS removed");
    } catch (err) {
      showNotificationMessage("Failed to remove VC setting", "error");
    }
  }

  async function searchVoices() {
    if (!$currentGuild?.id || !ttsVoiceSearch.trim()) return;
    searchingVoices = true;
    try {
      ttsVoiceResults = await musicApi.searchTtsVoices(BigInt($currentGuild.id), ttsVoiceSearch);
    } catch (err) {
      logger.error("Failed to search voices:", err);
    } finally {
      searchingVoices = false;
    }
  }

  async function blockUser() {
    if (!$currentGuild?.id || !blockUserId.trim()) return;
    try {
      await musicApi.setTtsUserBlocked(BigInt($currentGuild.id), BigInt(blockUserId), true);
      blockUserId = "";
      await fetchTtsBlockedUsers();
      showNotificationMessage("User blocked from TTS");
    } catch (err) {
      showNotificationMessage("Failed to block user", "error");
    }
  }

  async function unblockUser(userId: bigint) {
    if (!$currentGuild?.id) return;
    try {
      await musicApi.setTtsUserBlocked(BigInt($currentGuild.id), userId, false);
      await fetchTtsBlockedUsers();
      showNotificationMessage("User unblocked from TTS");
    } catch (err) {
      showNotificationMessage("Failed to unblock user", "error");
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

  function getVcName(vcId: bigint): string {
    const vc = voiceChannels.find(v => v.id.toString() === vcId.toString());
    return vc?.name ?? `Unknown (${vcId})`;
  }

  function getChannelName(chId: bigint): string {
    const ch = channels.find(c => c.id.toString() === chId.toString());
    return ch?.name ?? `Unknown (${chId})`;
  }

  async function fetchLinkChannels() {
    try {
      if (!$currentGuild?.id) return;
      linkChannels = await musicApi.getLinkChannels(BigInt($currentGuild.id));
    } catch (err) {
      logger.error("Failed to fetch music link channels:", err);
    }
  }

  async function addLinkChannel() {
    if (!$currentGuild?.id || !newLinkChannelId) return;
    try {
      linkChannels = await musicApi.enableLinkChannel(BigInt($currentGuild.id), BigInt(newLinkChannelId));
      showAddLinkChannel = false;
      newLinkChannelId = null;
      showNotificationMessage("Music link conversion enabled for channel");
    } catch (err) {
      showNotificationMessage("Failed to enable music link conversion", "error");
    }
  }

  async function removeLinkChannel(channelId: bigint) {
    if (!$currentGuild?.id) return;
    try {
      linkChannels = await musicApi.disableLinkChannel(BigInt($currentGuild.id), channelId);
      showNotificationMessage("Music link conversion disabled for channel");
    } catch (err) {
      showNotificationMessage("Failed to disable music link conversion", "error");
    }
  }

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    loading = true;
    try {
      await Promise.all([fetchSettings(), fetchChannels(), fetchVoiceChannels(), fetchRoles(), fetchLinkChannels()]);
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

  // Lazy-load TTS data when tab is accessed
  let ttsLoaded = $state(false);
  $effect(() => {
    if (activeTab === "tts" && !ttsLoaded && $currentGuild?.id) {
      ttsLoaded = true;
      fetchTtsSettings();
      fetchTtsBlockedUsers();
    }
  });

  let colors = $derived($colorStore);

  let actionButtons = $derived([
    {
      label: "Save Changes",
      icon: "fa-floppy-disk",
      action: activeTab === "music" ? updateSettings : updateTtsSettings,
      loading: false,
      style: `background: linear-gradient(to right, ${colors.primary}, ${colors.secondary}); color: ${colors.text}; box-shadow: 0 0 20px ${colors.primary}20;`
    }
  ]);

  $effect(() => {
    if ($currentGuild) {
      fetchSettings();
      fetchChannels();
      fetchVoiceChannels();
      fetchRoles();
      fetchPlaybackStatus();
      fetchLinkChannels();
      ttsLoaded = false;
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
  subtitle="Configure music playback and TTS settings"
  icon="fa-music"
  {actionButtons}
  guildName={$currentGuild?.name || "Dashboard"}
  title="Music Player Settings"
  {tabs}
  bind:activeTab
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

      {#if activeTab === 'music'}
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

        <!-- Music Link Conversion Channels -->
        <div
          class="rounded-2xl border p-6 shadow-2xl transition-all mt-8"
          style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                 border-color: {colors.primary}30;"
        >
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div
                class="p-3 rounded-xl"
                style="background: linear-gradient(135deg, {colors.primary}20, {colors.secondary}20);
                       color: {colors.primary};"
              >
                <i class="fa-utility-duo fa-regular fa-link" style="--fa-primary-color: {colors.primary}; --fa-secondary-color: {colors.secondary}; font-size: 24px;"></i>
              </div>
              <div>
                <h2 class="text-xl font-bold" style="color: {colors.text}">Music Link Conversion</h2>
                <p class="text-sm" style="color: {colors.muted}">
                  Apple Music, Spotify, and YouTube links posted in these channels get replaced with a
                  cross-platform embed showing links to every provider.
                </p>
              </div>
            </div>
            <button
              onclick={() => showAddLinkChannel = !showAddLinkChannel}
              class="px-4 py-2 rounded-lg font-medium transition-all"
              style="background: {colors.primary}; color: {colors.text};"
            >
              <i class="fa-solid fa-plus mr-2"></i>Add Channel
            </button>
          </div>

          {#if showAddLinkChannel}
            <div class="mb-6 p-4 rounded-xl" style="background: {colors.gradientStart}20; border: 1px solid {colors.primary}20;">
              <div class="flex gap-3 items-end">
                <div class="grow">
                  <span class="text-sm font-medium mb-1 block" style="color: {colors.text}">Channel</span>
                  <DiscordSelector
                    type="channel"
                    options={channels}
                    selected={newLinkChannelId}
                    placeholder="Select channel..."
                    onchange={(d) => { if (typeof d.selected === "string") newLinkChannelId = d.selected; }}
                  />
                </div>
                <button
                  onclick={addLinkChannel}
                  disabled={!newLinkChannelId}
                  class="px-4 py-2 rounded-lg font-medium transition-all"
                  style="background: {colors.primary}; color: {colors.text}; opacity: {newLinkChannelId ? '1' : '0.5'};"
                >
                  Enable
                </button>
              </div>
            </div>
          {/if}

          {#if linkChannels.length === 0}
            <div class="text-center py-8" style="color: {colors.muted}">
              <i class="fa-regular fa-link-slash text-3xl mb-3 block" style="color: {colors.primary}30;"></i>
              <p>No channels have music link conversion enabled</p>
              <p class="text-sm mt-1">Click "Add Channel" to enable it for a channel</p>
            </div>
          {:else}
            <div class="space-y-2">
              {#each linkChannels as channelId}
                <div class="p-3 rounded-xl flex items-center justify-between" style="background: {colors.gradientStart}15; border: 1px solid {colors.primary}15;">
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-hashtag" style="color: {colors.primary}; font-size: 14px;"></i>
                    <span class="font-medium" style="color: {colors.text}">{getChannelName(channelId)}</span>
                  </div>
                  <button
                    onclick={() => removeLinkChannel(channelId)}
                    class="p-1.5 rounded-lg transition-all hover:opacity-80"
                    style="color: {colors.accent};"
                    title="Remove"
                  >
                    <i class="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      {#if activeTab === 'tts'}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Guild-wide TTS Settings -->
          <div
            class="rounded-2xl border p-6 shadow-2xl transition-all"
            style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                   border-color: {colors.primary}30;"
          >
            <div class="flex items-center gap-3 mb-6">
              <div
                class="p-3 rounded-xl"
                style="background: linear-gradient(135deg, {colors.primary}20, {colors.secondary}20);
                       color: {colors.primary};"
              >
                <i class="fa-utility-duo fa-regular fa-microphone" style="--fa-primary-color: {colors.primary}; --fa-secondary-color: {colors.secondary}; font-size: 24px;"></i>
              </div>
              <h2 class="text-xl font-bold" style="color: {colors.text}">General TTS Settings</h2>
            </div>

            <div class="space-y-6">
              <!-- TTS Volume -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-volume" style="color: {colors.primary}; font-size: 16px;"></i>
                  <label for="tts-volume" class="font-medium" style="color: {colors.text}">TTS Volume</label>
                </div>
                <input
                  id="tts-volume"
                  type="range"
                  min="0"
                  max="100"
                  bind:value={ttsSettings.volume}
                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style="background: {colors.primary}20;"
                >
                <div class="text-sm mt-1" style="color: {colors.muted}">{ttsSettings.volume}%</div>
              </div>

              <!-- TTS Speed -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-gauge-high" style="color: {colors.secondary}; font-size: 16px;"></i>
                  <label for="tts-speed" class="font-medium" style="color: {colors.text}">TTS Speed</label>
                </div>
                <input
                  id="tts-speed"
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  bind:value={ttsSettings.speed}
                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style="background: {colors.primary}20;"
                >
                <div class="text-sm mt-1" style="color: {colors.muted}">{ttsSettings.speed.toFixed(1)}x</div>
              </div>

              <!-- Max Queue Size -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-list-ol" style="color: {colors.accent}; font-size: 16px;"></i>
                  <label for="tts-max-queue" class="font-medium" style="color: {colors.text}">Max Queue Size</label>
                </div>
                <input
                  id="tts-max-queue"
                  type="number"
                  min="1"
                  max="50"
                  bind:value={ttsSettings.maxQueueSize}
                  class="w-full px-3 py-2 rounded-lg border"
                  style="background: {colors.gradientStart}20; border-color: {colors.primary}30; color: {colors.text};"
                >
              </div>

              <!-- Default Voice -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-waveform-lines" style="color: {colors.primary}; font-size: 16px;"></i>
                  <label for="tts-default-voice" class="font-medium" style="color: {colors.text}">Default Voice</label>
                </div>
                <input
                  id="tts-default-voice"
                  type="text"
                  bind:value={ttsSettings.defaultVoice}
                  placeholder="e.g. Brian (leave empty for default)"
                  class="w-full px-3 py-2 rounded-lg border"
                  style="background: {colors.gradientStart}20; border-color: {colors.primary}30; color: {colors.text};"
                >
                <div class="text-sm mt-1" style="color: {colors.muted}">Use the voice search below to find available voices</div>
              </div>

              <!-- TTS Role -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-user-shield" style="color: {colors.secondary}; font-size: 16px;"></i>
                  <span class="font-medium" style="color: {colors.text}">Required Role</span>
                </div>
                <DiscordSelector
                  type="role"
                  options={[{id: 'null', name: 'No Role Required'}, ...roles]}
                  selected={ttsSettings.roleId === null ? 'null' : ttsSettings.roleId.toString()}
                  placeholder="Select required role..."
                  onchange={handleTtsRoleChange}
                />
                <div class="text-sm mt-1" style="color: {colors.muted}">Only users with this role can use TTS (admins always can)</div>
              </div>
            </div>
          </div>

          <!-- TTS Behavior Toggles -->
          <div
            class="rounded-2xl border p-6 shadow-2xl transition-all"
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
              <h2 class="text-xl font-bold" style="color: {colors.text}">TTS Behavior</h2>
            </div>

            <div class="space-y-5">
              <!-- Reply Context -->
              <label class="flex items-center gap-3">
                <input type="checkbox" bind:checked={ttsSettings.replyContext} class="sr-only peer">
                <span
                  class="relative w-11 h-6 rounded-full transition-all duration-200 block"
                  style="background: {ttsSettings.replyContext ? colors.primary : colors.primary + '30'};"
                >
                  <span
                    class="absolute w-4 h-4 rounded-full top-1 left-1 transition-all duration-200 block"
                    style="background: {colors.text};
                           transform: translateX({ttsSettings.replyContext ? '20px' : '0'});"
                  ></span>
                </span>
                <div>
                  <span style="color: {colors.text}">Reply Context</span>
                  <div class="text-sm" style="color: {colors.muted}">Read "replying to [user]" for replies</div>
                </div>
              </label>

              <!-- Attachment Narration -->
              <label class="flex items-center gap-3">
                <input type="checkbox" bind:checked={ttsSettings.attachmentNarration} class="sr-only peer">
                <span
                  class="relative w-11 h-6 rounded-full transition-all duration-200 block"
                  style="background: {ttsSettings.attachmentNarration ? colors.primary : colors.primary + '30'};"
                >
                  <span
                    class="absolute w-4 h-4 rounded-full top-1 left-1 transition-all duration-200 block"
                    style="background: {colors.text};
                           transform: translateX({ttsSettings.attachmentNarration ? '20px' : '0'});"
                  ></span>
                </span>
                <div>
                  <span style="color: {colors.text}">Attachment Narration</span>
                  <div class="text-sm" style="color: {colors.muted}">Announce "sent an image/video/file"</div>
                </div>
              </label>

              <!-- Consecutive Grouping -->
              <label class="flex items-center gap-3">
                <input type="checkbox" bind:checked={ttsSettings.consecutiveGrouping} class="sr-only peer">
                <span
                  class="relative w-11 h-6 rounded-full transition-all duration-200 block"
                  style="background: {ttsSettings.consecutiveGrouping ? colors.primary : colors.primary + '30'};"
                >
                  <span
                    class="absolute w-4 h-4 rounded-full top-1 left-1 transition-all duration-200 block"
                    style="background: {colors.text};
                           transform: translateX({ttsSettings.consecutiveGrouping ? '20px' : '0'});"
                  ></span>
                </span>
                <div>
                  <span style="color: {colors.text}">Consecutive Grouping</span>
                  <div class="text-sm" style="color: {colors.muted}">Skip name for consecutive messages from the same user</div>
                </div>
              </label>
            </div>

            <!-- Voice Search -->
            <div class="mt-8">
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="p-2 rounded-lg"
                  style="background: linear-gradient(135deg, {colors.primary}20, {colors.secondary}20);"
                >
                  <i class="fa-solid fa-magnifying-glass" style="color: {colors.primary}; font-size: 16px;"></i>
                </div>
                <h3 class="text-lg font-bold" style="color: {colors.text}">Voice Search</h3>
              </div>

              <div class="flex gap-2">
                <input
                  type="text"
                  bind:value={ttsVoiceSearch}
                  placeholder="Search voices (e.g. Brian, English)..."
                  class="grow px-3 py-2 rounded-lg border"
                  style="background: {colors.gradientStart}20; border-color: {colors.primary}30; color: {colors.text};"
                  onkeydown={(e) => { if (e.key === 'Enter') searchVoices(); }}
                >
                <button
                  onclick={searchVoices}
                  disabled={searchingVoices}
                  class="px-4 py-2 rounded-lg font-medium transition-all"
                  style="background: {colors.primary}; color: {colors.text};"
                >
                  {searchingVoices ? 'Searching...' : 'Search'}
                </button>
              </div>

              {#if ttsVoiceResults.length > 0}
                <div class="mt-3 max-h-48 overflow-y-auto rounded-lg border" style="border-color: {colors.primary}20;">
                  {#each ttsVoiceResults as voice}
                    <button
                      class="w-full text-left px-3 py-2 flex justify-between items-center transition-colors hover:opacity-80"
                      style="border-bottom: 1px solid {colors.primary}10;"
                      onclick={() => { ttsSettings.defaultVoice = voice.name; showNotificationMessage(`Default voice set to ${voice.name}`); }}
                    >
                      <div>
                        <span class="font-medium" style="color: {colors.text}">{voice.name}</span>
                        <span class="text-sm ml-2" style="color: {colors.muted}">{voice.source}</span>
                      </div>
                      <span class="text-sm" style="color: {colors.muted}">{voice.language?.name ?? ''}</span>
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Voice Channel TTS Settings -->
        <div
          class="rounded-2xl border p-6 shadow-2xl transition-all mt-8"
          style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                 border-color: {colors.primary}30;"
        >
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div
                class="p-3 rounded-xl"
                style="background: linear-gradient(135deg, {colors.primary}20, {colors.secondary}20);
                       color: {colors.primary};"
              >
                <i class="fa-utility-duo fa-regular fa-headphones" style="--fa-primary-color: {colors.primary}; --fa-secondary-color: {colors.secondary}; font-size: 24px;"></i>
              </div>
              <h2 class="text-xl font-bold" style="color: {colors.text}">Voice Channel TTS</h2>
            </div>
            <button
              onclick={() => showAddVc = !showAddVc}
              class="px-4 py-2 rounded-lg font-medium transition-all"
              style="background: {colors.primary}; color: {colors.text};"
            >
              <i class="fa-solid fa-plus mr-2"></i>Add Channel
            </button>
          </div>

          {#if showAddVc}
            <div class="mb-6 p-4 rounded-xl" style="background: {colors.gradientStart}20; border: 1px solid {colors.primary}20;">
              <div class="flex gap-3 items-end">
                <div class="grow">
                  <span class="text-sm font-medium mb-1 block" style="color: {colors.text}">Voice Channel</span>
                  <DiscordSelector
                    type="custom"
                    options={voiceChannels}
                    selected={newVcId}
                    placeholder="Select voice channel..."
                    onchange={(d) => { if (typeof d.selected === "string") newVcId = d.selected; }}
                  />
                </div>
                <button
                  onclick={addVcSetting}
                  disabled={!newVcId}
                  class="px-4 py-2 rounded-lg font-medium transition-all"
                  style="background: {colors.primary}; color: {colors.text}; opacity: {newVcId ? '1' : '0.5'};"
                >
                  Enable TTS
                </button>
              </div>
            </div>
          {/if}

          {#if ttsSettings.vcSettings.length === 0}
            <div class="text-center py-8" style="color: {colors.muted}">
              <i class="fa-regular fa-volume-slash text-3xl mb-3 block" style="color: {colors.primary}30;"></i>
              <p>No voice channels have TTS enabled</p>
              <p class="text-sm mt-1">Click "Add Channel" to enable TTS for a voice channel</p>
            </div>
          {:else}
            <div class="space-y-4">
              {#each ttsSettings.vcSettings as vc, i}
                <div class="p-4 rounded-xl" style="background: {colors.gradientStart}15; border: 1px solid {colors.primary}15;">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <i class="fa-solid fa-volume-high" style="color: {colors.primary}; font-size: 16px;"></i>
                      <span class="font-medium" style="color: {colors.text}">{getVcName(vc.voiceChannelId)}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <label class="flex items-center gap-2">
                        <input type="checkbox" bind:checked={vc.enabled} class="sr-only peer" onchange={() => updateVcSetting(vc)}>
                        <span
                          class="relative w-9 h-5 rounded-full transition-all duration-200 block"
                          style="background: {vc.enabled ? colors.primary : colors.primary + '30'};"
                        >
                          <span
                            class="absolute w-3 h-3 rounded-full top-1 left-1 transition-all duration-200 block"
                            style="background: {colors.text};
                                   transform: translateX({vc.enabled ? '16px' : '0'});"
                          ></span>
                        </span>
                      </label>
                      <button
                        onclick={() => removeVcSetting(vc.voiceChannelId)}
                        class="p-1.5 rounded-lg transition-all hover:opacity-80"
                        style="color: {colors.accent};"
                        title="Remove"
                      >
                        <i class="fa-solid fa-trash-can text-sm"></i>
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <!-- Linked Text Channel -->
                    <div>
                      <span class="text-sm" style="color: {colors.muted}">Linked Text Channel</span>
                      <DiscordSelector
                        type="channel"
                        options={[{id: 'null', name: 'VC Text Chat Only'}, ...channels]}
                        selected={vc.linkedTextChannelId === null ? 'null' : vc.linkedTextChannelId.toString()}
                        placeholder="Select channel..."
                        onchange={(d) => {
                          if (typeof d.selected === "string") {
                            vc.linkedTextChannelId = d.selected === 'null' ? null : BigInt(d.selected);
                            updateVcSetting(vc);
                          }
                        }}
                      />
                    </div>

                    <!-- Announce Join/Leave -->
                    <div>
                      <span class="text-sm mb-1 block" style="color: {colors.muted}">Announce Join/Leave</span>
                      <label class="flex items-center gap-2 mt-2">
                        <input type="checkbox" bind:checked={vc.announceJoinLeave} class="sr-only peer" onchange={() => updateVcSetting(vc)}>
                        <span
                          class="relative w-9 h-5 rounded-full transition-all duration-200 block"
                          style="background: {vc.announceJoinLeave ? colors.primary : colors.primary + '30'};"
                        >
                          <span
                            class="absolute w-3 h-3 rounded-full top-1 left-1 transition-all duration-200 block"
                            style="background: {colors.text};
                                   transform: translateX({vc.announceJoinLeave ? '16px' : '0'});"
                          ></span>
                        </span>
                        <span class="text-sm" style="color: {colors.text}">Announce Join/Leave</span>
                      </label>
                    </div>
                  </div>

                  {#if vc.announceJoinLeave}
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div>
                        <span class="text-sm" style="color: {colors.muted}">Join Format</span>
                        <input
                          type="text"
                          bind:value={vc.joinFormat}
                          placeholder="%user.name% joined the channel"
                          class="w-full px-3 py-1.5 rounded-lg border text-sm"
                          style="background: {colors.gradientStart}20; border-color: {colors.primary}20; color: {colors.text};"
                          onblur={() => updateVcSetting(vc)}
                        >
                      </div>
                      <div>
                        <span class="text-sm" style="color: {colors.muted}">Leave Format</span>
                        <input
                          type="text"
                          bind:value={vc.leaveFormat}
                          placeholder="%user.name% left the channel"
                          class="w-full px-3 py-1.5 rounded-lg border text-sm"
                          style="background: {colors.gradientStart}20; border-color: {colors.primary}20; color: {colors.text};"
                          onblur={() => updateVcSetting(vc)}
                        >
                      </div>
                    </div>
                    <div class="mt-2 text-xs" style="color: {colors.muted}">
                      Available placeholders: <code style="color: {colors.primary}">%user.name%</code> <code style="color: {colors.primary}">%user.mention%</code> <code style="color: {colors.primary}">%user.id%</code> <code style="color: {colors.primary}">%server.name%</code> <code style="color: {colors.primary}">%server.members%</code> <code style="color: {colors.primary}">%channel.name%</code>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Blocked Users -->
        <div
          class="rounded-2xl border p-6 shadow-2xl transition-all mt-8"
          style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                 border-color: {colors.primary}30;"
        >
          <div class="flex items-center gap-3 mb-6">
            <div
              class="p-3 rounded-xl"
              style="background: linear-gradient(135deg, {colors.accent}20, {colors.primary}20);
                     color: {colors.accent};"
            >
              <i class="fa-utility-duo fa-regular fa-user-xmark" style="--fa-primary-color: {colors.accent}; --fa-secondary-color: {colors.primary}; font-size: 24px;"></i>
            </div>
            <h2 class="text-xl font-bold" style="color: {colors.text}">Blocked TTS Users</h2>
          </div>

          <div class="flex gap-2 mb-4">
            <input
              type="text"
              bind:value={blockUserId}
              placeholder="Enter user ID to block..."
              class="grow px-3 py-2 rounded-lg border"
              style="background: {colors.gradientStart}20; border-color: {colors.primary}30; color: {colors.text};"
              onkeydown={(e) => { if (e.key === 'Enter') blockUser(); }}
            >
            <button
              onclick={blockUser}
              disabled={!blockUserId.trim()}
              class="px-4 py-2 rounded-lg font-medium transition-all"
              style="background: {colors.accent}; color: {colors.text}; opacity: {blockUserId.trim() ? '1' : '0.5'};"
            >
              Block
            </button>
          </div>

          {#if ttsBlockedUsers.length === 0}
            <div class="text-center py-4" style="color: {colors.muted}">
              <p class="text-sm">No users are blocked from TTS</p>
            </div>
          {:else}
            <div class="space-y-2">
              {#each ttsBlockedUsers as user}
                <div class="flex items-center justify-between p-3 rounded-lg" style="background: {colors.gradientStart}10;">
                  <span style="color: {colors.text}">{user.userId}</span>
                  <button
                    onclick={() => unblockUser(user.userId)}
                    class="px-3 py-1 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                    style="background: {colors.primary}20; color: {colors.primary};"
                  >
                    Unblock
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

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
