<!-- routes/dashboard/music/+page.svelte -->
<script lang="ts">


  import { onDestroy, onMount, untrack } from "svelte";
  import { musicApi, clientApi } from "$lib/api/index.ts";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
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
    import { m } from "$lib/i18n";
    import { createAutoSave } from "$lib/utils/autoSave.svelte";

    const autoSave = createAutoSave({
      onError: () => showNotificationMessage(m.music.notifySaveFailed(), "error")
    });

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
  const tabs = $derived([
    { id: "music", label: m.music.tabMusic(), icon: "fa-music" },
    { id: "tts", label: m.music.tabTts(), icon: "fa-microphone" }
  ]);

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

  type MusicSettings = typeof settings;
  type TtsGeneralField = Exclude<keyof typeof ttsSettings, "vcSettings">;

  /** Music settings as the server last confirmed them; a failed save restores from here. */
  let savedSettings: MusicSettings = untrack(() => $state.snapshot(settings));
  /** TTS settings as the server last confirmed them. */
  let savedTts = untrack(() => $state.snapshot(ttsSettings));

  function isValidQueueSize(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 50;
  }

  /**
   * Saves the whole music settings object (the API only takes it in bulk). The payload is
   * built now, so a save still waiting after a server switch cannot carry the new server's
   * values. `field` is the setting that changed; it alone is rolled back if the save fails.
   */
  function saveMusicSettings(field: keyof MusicSettings, debounce = false) {
    if (!$currentGuild?.id) return;
    const guildId = BigInt($currentGuild.id);
    const payload = $state.snapshot(settings) as MusicSettings;
    const previous = savedSettings[field];
    const run = async () => {
      try {
        await musicApi.updateMusicSettings(guildId, payload);
        if ($currentGuild?.id === guildId) savedSettings = payload;
      } catch (err) {
        if ($currentGuild?.id === guildId) (settings as any)[field] = previous;
        throw err;
      }
    };
    if (debounce) autoSave.schedule("music", run);
    else autoSave.now("music", run);
  }

  /**
   * Saves the guild-wide TTS settings in bulk. An invalid queue size is never sent: the last
   * confirmed one goes in its place. Typed fields are not rolled back on failure.
   */
  function saveTtsSettings(field: TtsGeneralField, debounce = false, rollback = true) {
    if (!$currentGuild?.id) return;
    const guildId = BigInt($currentGuild.id);
    const current = $state.snapshot(ttsSettings);
    const maxQueueSize = isValidQueueSize(current.maxQueueSize) ? current.maxQueueSize : savedTts.maxQueueSize;
    const confirmed = { ...current, maxQueueSize, vcSettings: savedTts.vcSettings };
    const previous = savedTts[field];
    const run = async () => {
      try {
        await musicApi.updateTtsSettings(guildId, {
          volume: current.volume,
          speed: current.speed,
          defaultVoice: current.defaultVoice ?? "",
          replyContext: current.replyContext,
          attachmentNarration: current.attachmentNarration,
          consecutiveGrouping: current.consecutiveGrouping,
          maxQueueSize,
          roleId: current.roleId ?? BigInt(0)
        });
        if ($currentGuild?.id === guildId) savedTts = confirmed;
      } catch (err) {
        if (rollback && $currentGuild?.id === guildId) (ttsSettings as any)[field] = previous;
        throw err;
      }
    };
    if (debounce) autoSave.schedule("tts", run);
    else autoSave.now("tts", run);
  }

  function handleMusicChannelChange(detail: any) {
    if (detail.selected) {
      settings.musicChannelId = detail.selected === "null" ? null : BigInt(detail.selected);
      saveMusicSettings("musicChannelId");
    }
  }

  function handleDjRoleChange(detail: any) {
    if (detail.selected) {
      settings.djRoleId = detail.selected === "null" ? null : BigInt(detail.selected);
      saveMusicSettings("djRoleId");
    }
  }

  function handleRepeatModeChange(detail: any) {
    if (detail.selected && typeof detail.selected === "string") {
      settings.playerRepeat = parseInt(detail.selected);
      saveMusicSettings("playerRepeat");
    }
  }

  function handleAutoDisconnectChange(detail: any) {
    if (detail.selected && typeof detail.selected === "string") {
      settings.autoDisconnect = parseInt(detail.selected);
      saveMusicSettings("autoDisconnect");
    }
  }

  function handleAutoPlayChange(detail: any) {
    if (detail.selected && typeof detail.selected === "string") {
      settings.autoPlay = parseInt(detail.selected);
      saveMusicSettings("autoPlay");
    }
  }

  function handleTtsRoleChange(detail: any) {
    if (detail.selected) {
      ttsSettings.roleId = detail.selected === "null" ? null : BigInt(detail.selected);
      saveTtsSettings("roleId");
    }
  }

  function handleMaxQueueInput() {
    if (!isValidQueueSize(ttsSettings.maxQueueSize)) return;
    saveTtsSettings("maxQueueSize", true, false);
  }

  /** Leaving the field with an out-of-range size puts the saved one back rather than sending it. */
  function handleMaxQueueBlur() {
    if (!isValidQueueSize(ttsSettings.maxQueueSize)) ttsSettings.maxQueueSize = savedTts.maxQueueSize;
    void autoSave.flush("tts");
  }

  async function fetchSettings() {
    try {
      if (!$currentGuild?.id) return;
      const response = await musicApi.getMusicSettings(BigInt($currentGuild.id));
      settings = { ...settings, ...response };
      savedSettings = $state.snapshot(settings) as MusicSettings;
    } catch (err) {
      logger.error("Failed to fetch music settings:", err);
      error = err instanceof Error ? err.message : m.music.errorFetchSettings();
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
          leaveFormat: vc.leaveFormat ?? null,
          autoJoin: vc.autoJoin ?? false
        }))
      };
      savedTts = $state.snapshot(ttsSettings);
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

  async function addVcSetting() {
    if (!$currentGuild?.id || !newVcId) return;
    try {
      await musicApi.upsertTtsVcSetting(BigInt($currentGuild.id), {
        voiceChannelId: BigInt(newVcId),
        enabled: true,
        linkedTextChannelId: null,
        announceJoinLeave: false,
        joinFormat: null,
        leaveFormat: null,
        autoJoin: false
      });
      showAddVc = false;
      newVcId = null;
      await fetchTtsSettings();
      showNotificationMessage(m.music.notifyVcAdded());
    } catch (err) {
      showNotificationMessage(m.music.notifyVcAddFailed(), "error");
    }
  }

  /**
   * Saves one voice channel's TTS row, filed under that channel so rows save independently.
   * `rollback` puts the changed field back if the save fails; typed formats pass none.
   */
  function updateVcSetting(vc: TtsVcSetting, rollback?: () => void, debounce = false) {
    if (!$currentGuild?.id) return;
    const guildId = BigInt($currentGuild.id);
    const payload = {
      voiceChannelId: vc.voiceChannelId,
      enabled: vc.enabled,
      linkedTextChannelId: vc.linkedTextChannelId,
      announceJoinLeave: vc.announceJoinLeave,
      joinFormat: vc.joinFormat,
      leaveFormat: vc.leaveFormat,
      autoJoin: vc.autoJoin
    };
    const key = `vc-${vc.voiceChannelId}`;
    const run = async () => {
      try {
        await musicApi.upsertTtsVcSetting(guildId, payload);
      } catch (err) {
        if (rollback && $currentGuild?.id === guildId) rollback();
        throw err;
      }
    };
    if (debounce) autoSave.schedule(key, run);
    else autoSave.now(key, run);
  }

  async function removeVcSetting(voiceChannelId: bigint) {
    if (!$currentGuild?.id) return;
    try {
      await musicApi.removeTtsVcSetting(BigInt($currentGuild.id), voiceChannelId);
      await fetchTtsSettings();
      showNotificationMessage(m.music.notifyVcRemoved());
    } catch (err) {
      showNotificationMessage(m.music.notifyVcRemoveFailed(), "error");
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
      showNotificationMessage(m.music.notifyUserBlocked());
    } catch (err) {
      showNotificationMessage(m.music.notifyUserBlockFailed(), "error");
    }
  }

  async function unblockUser(userId: bigint) {
    if (!$currentGuild?.id) return;
    try {
      await musicApi.setTtsUserBlocked(BigInt($currentGuild.id), userId, false);
      await fetchTtsBlockedUsers();
      showNotificationMessage(m.music.notifyUserUnblocked());
    } catch (err) {
      showNotificationMessage(m.music.notifyUserUnblockFailed(), "error");
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

  /** Guards queue tools against double submits */
  let queueBusy = $state(false);

  /** Filters the bot player supports, keyed by the API filter name */
  const audioFilters = $derived([
    { key: "bassboost", label: m.music.filterBassboost() },
    { key: "nightcore", label: m.music.filterNightcore() },
    { key: "vaporwave", label: m.music.filterVaporwave() },
    { key: "karaoke", label: m.music.filterKaraoke() },
    { key: "tremolo", label: m.music.filterTremolo() },
    { key: "vibrato", label: m.music.filterVibrato() },
    { key: "rotation", label: m.music.filterRotation() },
    { key: "distortion", label: m.music.filterDistortion() }
  ]);

  /** Live repeat buttons; labels resolved at render time */
  const liveRepeatModes = $derived([
    { id: "off", icon: "fa-xmark", label: m.common.off(), value: 0 },
    { id: "track", icon: "fa-repeat-1", label: m.common.track(), value: 1 },
    { id: "queue", icon: "fa-repeat", label: m.music.repeatLiveQueue(), value: 2 }
  ]);

  /** Reads the active state of a filter from the player status regardless of casing */
  function isFilterActive(key: string): boolean {
    const filters = musicStatus?.filters ?? musicStatus?.Filters;
    if (!filters) return false;
    const wanted = key.toLowerCase();
    for (const [name, value] of Object.entries(filters)) {
      if (name.toLowerCase() === wanted) return Boolean(value);
    }
    return false;
  }

  async function shuffleQueue() {
    if (!$currentGuild?.id) return;
    queueBusy = true;
    try {
      await musicApi.shuffleQueue(BigInt($currentGuild.id));
      await fetchPlaybackStatus();
    } catch (err) {
      logger.error("Failed to shuffle queue:", err);
      showNotificationMessage(m.music.notifyQueueShuffleFailed(), "error");
    } finally {
      queueBusy = false;
    }
  }

  async function clearQueue() {
    if (!$currentGuild?.id) return;
    if (!(await requestConfirmation({ message: m.music.queueClearConfirm(), confirmText: m.music.queueClear() }))) return;
    queueBusy = true;
    try {
      await musicApi.clearQueue(BigInt($currentGuild.id));
      await fetchPlaybackStatus();
    } catch (err) {
      logger.error("Failed to clear queue:", err);
      showNotificationMessage(m.music.notifyQueueClearFailed(), "error");
    } finally {
      queueBusy = false;
    }
  }

  async function setLiveRepeat(mode: string, value: number) {
    if (!$currentGuild?.id) return;
    try {
      await musicApi.setRepeatMode(BigInt($currentGuild.id), mode);
      settings.playerRepeat = value;
      await fetchPlaybackStatus();
    } catch (err) {
      logger.error("Failed to set repeat mode:", err);
      showNotificationMessage(m.music.notifyRepeatFailed(), "error");
    }
  }

  async function toggleAudioFilter(key: string, enable: boolean) {
    if (!$currentGuild?.id) return;
    queueBusy = true;
    try {
      await musicApi.toggleFilter(BigInt($currentGuild.id), key, enable);
      await fetchPlaybackStatus();
    } catch (err) {
      logger.error("Failed to toggle filter:", err);
      showNotificationMessage(m.music.notifyFilterFailed(), "error");
    } finally {
      queueBusy = false;
    }
  }

  function getVcName(vcId: bigint): string {
    const vc = voiceChannels.find(v => v.id.toString() === vcId.toString());
    return vc?.name ?? m.music.unknownWithId({ id: vcId.toString() });
  }

  function getChannelName(chId: bigint): string {
    const ch = channels.find(c => c.id.toString() === chId.toString());
    return ch?.name ?? m.music.unknownWithId({ id: chId.toString() });
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
      showNotificationMessage(m.music.notifyLinkEnabled());
    } catch (err) {
      showNotificationMessage(m.music.notifyLinkEnableFailed(), "error");
    }
  }

  async function removeLinkChannel(channelId: bigint) {
    if (!$currentGuild?.id) return;
    try {
      linkChannels = await musicApi.disableLinkChannel(BigInt($currentGuild.id), channelId);
      showNotificationMessage(m.music.notifyLinkDisabled());
    } catch (err) {
      showNotificationMessage(m.music.notifyLinkDisableFailed(), "error");
    }
  }

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    loading = true;
    try {
      await Promise.all([fetchSettings(), fetchChannels(), fetchVoiceChannels(), fetchRoles(), fetchLinkChannels()]);
      musicInterval = setInterval(fetchPlaybackStatus, 5000);
    } catch (err) {
      error = m.common.failedToFetchData();
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
  subtitle={m.music.pageSubtitle()}
  icon="fa-music"
  {autoSave}
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.music.pageTitle()}
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
              <h2 class="text-xl font-bold" style="color: {colors.text}">{m.common.nowPlaying()}</h2>
            </div>

            <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
              <img
                src={musicStatus.currentTrack.track.artworkUri || '/default-album.png'}
                alt={m.music.albumArtAlt()}
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
                    {musicStatus.queue.length === 1 ? m.music.queueCountOne({ count: 1 }) : m.music.queueCountOther({ count: musicStatus.queue.length })}
                  </span>
                </div>
              </div>
            </div>

            <!-- Queue tools -->
            <div class="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t" style="border-color: {colors.primary}20;">
              <button
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] min-h-[44px] disabled:opacity-50"
                style="background: {colors.primary}20; color: {colors.primary}; border: 1px solid {colors.primary}30;"
                disabled={queueBusy || musicStatus.queue.length < 2}
                onclick={shuffleQueue}
              >
                <i class="fa-solid fa-shuffle"></i>
                {m.music.queueShuffle()}
              </button>
              <button
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] min-h-[44px] disabled:opacity-50"
                style="background: {colors.accent}20; color: {colors.accent}; border: 1px solid {colors.accent}30;"
                disabled={queueBusy || musicStatus.queue.length === 0}
                onclick={clearQueue}
              >
                <i class="fa-solid fa-trash"></i>
                {m.music.queueClear()}
              </button>
              <div class="flex items-center gap-1 ml-auto">
                <span class="text-xs mr-1" style="color: {colors.muted}">{m.common.repeat()}</span>
                {#each liveRepeatModes as mode}
                  <button
                    class="px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] min-h-[36px]"
                    style="background: {(musicStatus.repeatMode ?? settings.playerRepeat) === mode.value ? colors.primary + '30' : colors.primary + '08'}; color: {(musicStatus.repeatMode ?? settings.playerRepeat) === mode.value ? colors.primary : colors.muted}; border: 1px solid {(musicStatus.repeatMode ?? settings.playerRepeat) === mode.value ? colors.primary + '40' : 'transparent'};"
                    onclick={() => setLiveRepeat(mode.id, mode.value)}
                    aria-pressed={(musicStatus.repeatMode ?? settings.playerRepeat) === mode.value}
                    aria-label={m.music.repeatLiveAria({ mode: mode.label })}
                  >
                    <i class="fa-solid {mode.icon} mr-1"></i>{mode.label}
                  </button>
                {/each}
              </div>
            </div>

            <!-- Audio filters -->
            <div class="mt-4">
              <div class="flex items-center gap-2 mb-2">
                <i class="fa-solid fa-wave-square" style="color: {colors.primary}; font-size: 14px;"></i>
                <span class="text-sm font-medium" style="color: {colors.text}">{m.music.filtersTitle()}</span>
              </div>
              <div class="flex flex-wrap gap-2">
                {#each audioFilters as filter}
                  {@const active = isFilterActive(filter.key)}
                  <button
                    class="px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] min-h-[36px] disabled:opacity-50"
                    style="background: {active ? colors.secondary + '30' : colors.primary + '08'}; color: {active ? colors.secondary : colors.muted}; border: 1px solid {active ? colors.secondary + '40' : 'transparent'};"
                    disabled={queueBusy}
                    onclick={() => toggleAudioFilter(filter.key, !active)}
                    aria-pressed={active}
                  >
                    {filter.label}
                  </button>
                {/each}
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
              <h2 class="text-xl font-bold" style="color: {colors.text}">{m.common.generalSettings()}</h2>
            </div>

            <div class="space-y-6">
              <!-- Volume -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-volume" style="color: {colors.primary}; font-size: 16px;"></i>
                  <label for="default-volume" class="font-medium" style="color: {colors.text}">
                    {m.music.generalVolume()}
                  </label>
                </div>
                <input
                  id="default-volume"
                  type="range"
                  min="0"
                  max="100"
                  bind:value={settings.volume}
                  oninput={() => saveMusicSettings("volume", true)}
                  onchange={() => autoSave.flush("music")}
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
                    {m.music.generalChannel()}
                  </span>
                </div>
                <DiscordSelector
                  type="channel"
                  options={[{id: 'null', name: m.music.generalChannelAll()}, ...channels]}
                  selected={settings.musicChannelId === null ? 'null' : settings.musicChannelId.toString()}
                  placeholder={m.music.generalChannelPlaceholder()}
                  onchange={handleMusicChannelChange}
                />
              </div>

              <!-- DJ Role -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-users" style="color: {colors.accent}; font-size: 16px;"></i>
                  <span id="dj-role-label" class="font-medium" style="color: {colors.text}">
                    {m.music.generalDjRole()}
                  </span>
                </div>
                <DiscordSelector
                  type="role"
                  options={[{id: 'null', name: m.music.generalDjRoleNone()}, ...roles]}
                  selected={settings.djRoleId === null ? 'null' : settings.djRoleId.toString()}
                  placeholder={m.music.generalDjRolePlaceholder()}
                  onchange={handleDjRoleChange}
                />
              </div>

              <!-- Player Repeat -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-clock" style="color: {colors.primary}; font-size: 16px;"></i>
                  <span id="repeat-mode-label" class="font-medium" style="color: {colors.text}">
                    {m.music.generalRepeatMode()}
                  </span>
                </div>
                <DiscordSelector
                  type="custom"
                  options={[
                    {id: PlayerRepeatType.None.toString(), name: m.common.none()},
                    {id: PlayerRepeatType.Track.toString(), name: m.music.repeatModeSingle()},
                    {id: PlayerRepeatType.Queue.toString(), name: m.music.repeatLiveQueue()}
                  ]}
                  selected={settings.playerRepeat.toString()}
                  placeholder={m.music.repeatModePlaceholder()}
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
              <h2 class="text-xl font-bold" style="color: {colors.text}">{m.common.advancedSettings()}</h2>
            </div>

            <div class="space-y-6">
              <!-- Auto Disconnect -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-users" style="color: {colors.primary}; font-size: 16px;"></i>
                  <span id="auto-disconnect-label" class="font-medium" style="color: {colors.text}">
                    {m.music.advancedAutoDisconnect()}
                  </span>
                </div>
                <DiscordSelector
                  type="custom"
                  options={[
                    {id: AutoDisconnect.None.toString(), name: m.common.never()},
                    {id: AutoDisconnect.Voice.toString(), name: m.music.autoDisconnectVoice()},
                    {id: AutoDisconnect.Queue.toString(), name: m.music.autoDisconnectQueue()},
                    {id: AutoDisconnect.Either.toString(), name: m.music.autoDisconnectEither()}
                  ]}
                  selected={settings.autoDisconnect.toString()}
                  placeholder={m.music.autoDisconnectPlaceholder()}
                  onchange={handleAutoDisconnectChange}
                />
              </div>

              <!-- Auto Play -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-music" style="color: {colors.secondary}; font-size: 16px;"></i>
                  <span id="auto-play-similar-label" class="font-medium" style="color: {colors.text}">
                    {m.music.advancedAutoPlay()}
                  </span>
                </div>
                <DiscordSelector
                  type="custom"
                  options={[
                    {id: '0', name: m.common.disabled()},
                    {id: '1', name: m.common.enabled()}
                  ]}
                  selected={settings.autoPlay.toString()}
                  placeholder={m.music.autoPlayPlaceholder()}
                  onchange={handleAutoPlayChange}
                />
              </div>

              <!-- Vote Skip Settings -->
              <div class="space-y-4">
                <label class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    bind:checked={settings.voteSkipEnabled}
                    onchange={() => saveMusicSettings("voteSkipEnabled")}
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
                  <span style="color: {colors.text}">{m.music.advancedVoteSkip()}</span>
                </label>

                {#if settings.voteSkipEnabled}
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <i class="fa-solid fa-gear" style="color: {colors.accent}; font-size: 16px;"></i>
                      <label for="vote-skip-threshold" class="font-medium" style="color: {colors.text}">
                        {m.music.advancedVoteSkipThreshold()}
                      </label>
                    </div>
                    <input
                      id="vote-skip-threshold"
                      type="range"
                      min="1"
                      max="100"
                      bind:value={settings.voteSkipThreshold}
                      oninput={() => saveMusicSettings("voteSkipThreshold", true)}
                      onchange={() => autoSave.flush("music")}
                      class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style="background: {colors.primary}20;"
                    >
                    <div class="text-sm mt-1" style="color: {colors.muted}">
                      {m.music.advancedVoteSkipThresholdHint({ percent: settings.voteSkipThreshold })}
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
                <h2 class="text-xl font-bold" style="color: {colors.text}">{m.music.linkTitle()}</h2>
                <p class="text-sm" style="color: {colors.muted}">
                  {m.music.linkDescription()}
                </p>
              </div>
            </div>
            <button
              onclick={() => showAddLinkChannel = !showAddLinkChannel}
              class="px-4 py-2 rounded-lg font-medium transition-all"
              style="background: {colors.primary}; color: {colors.text};"
            >
              <i class="fa-solid fa-plus mr-2"></i>{m.music.linkAddChannel()}
            </button>
          </div>

          {#if showAddLinkChannel}
            <div class="mb-6 p-4 rounded-xl" style="background: {colors.gradientStart}20; border: 1px solid {colors.primary}20;">
              <div class="flex gap-3 items-end">
                <div class="grow">
                  <span class="text-sm font-medium mb-1 block" style="color: {colors.text}">{m.common.channel()}</span>
                  <DiscordSelector
                    type="channel"
                    options={channels}
                    selected={newLinkChannelId}
                    placeholder={m.common.selectChannelPlaceholder()}
                    onchange={(d) => { if (typeof d.selected === "string") newLinkChannelId = d.selected; }}
                  />
                </div>
                <button
                  onclick={addLinkChannel}
                  disabled={!newLinkChannelId}
                  class="px-4 py-2 rounded-lg font-medium transition-all"
                  style="background: {colors.primary}; color: {colors.text}; opacity: {newLinkChannelId ? '1' : '0.5'};"
                >
                  {m.common.enable()}
                </button>
              </div>
            </div>
          {/if}

          {#if linkChannels.length === 0}
            <div class="text-center py-8" style="color: {colors.muted}">
              <i class="fa-regular fa-link-slash text-3xl mb-3 block" style="color: {colors.primary}30;"></i>
              <p>{m.music.linkEmpty()}</p>
              <p class="text-sm mt-1">{m.music.linkEmptyHint()}</p>
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
                    title={m.common.remove()}
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
              <h2 class="text-xl font-bold" style="color: {colors.text}">{m.music.ttsGeneralTitle()}</h2>
            </div>

            <div class="space-y-6">
              <!-- TTS Volume -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-volume" style="color: {colors.primary}; font-size: 16px;"></i>
                  <label for="tts-volume" class="font-medium" style="color: {colors.text}">{m.music.ttsVolume()}</label>
                </div>
                <input
                  id="tts-volume"
                  type="range"
                  min="0"
                  max="100"
                  bind:value={ttsSettings.volume}
                  oninput={() => saveTtsSettings("volume", true)}
                  onchange={() => autoSave.flush("tts")}
                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style="background: {colors.primary}20;"
                >
                <div class="text-sm mt-1" style="color: {colors.muted}">{ttsSettings.volume}%</div>
              </div>

              <!-- TTS Speed -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-gauge-high" style="color: {colors.secondary}; font-size: 16px;"></i>
                  <label for="tts-speed" class="font-medium" style="color: {colors.text}">{m.music.ttsSpeed()}</label>
                </div>
                <input
                  id="tts-speed"
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  bind:value={ttsSettings.speed}
                  oninput={() => saveTtsSettings("speed", true)}
                  onchange={() => autoSave.flush("tts")}
                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style="background: {colors.primary}20;"
                >
                <div class="text-sm mt-1" style="color: {colors.muted}">{ttsSettings.speed.toFixed(1)}x</div>
              </div>

              <!-- Max Queue Size -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-list-ol" style="color: {colors.accent}; font-size: 16px;"></i>
                  <label for="tts-max-queue" class="font-medium" style="color: {colors.text}">{m.music.ttsMaxQueue()}</label>
                </div>
                <input
                  id="tts-max-queue"
                  type="number"
                  min="1"
                  max="50"
                  bind:value={ttsSettings.maxQueueSize}
                  oninput={handleMaxQueueInput}
                  onblur={handleMaxQueueBlur}
                  class="w-full px-3 py-2 rounded-lg border"
                  style="background: {colors.gradientStart}20; border-color: {colors.primary}30; color: {colors.text};"
                >
              </div>

              <!-- Default Voice -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-waveform-lines" style="color: {colors.primary}; font-size: 16px;"></i>
                  <label for="tts-default-voice" class="font-medium" style="color: {colors.text}">{m.music.ttsDefaultVoice()}</label>
                </div>
                <input
                  id="tts-default-voice"
                  type="text"
                  bind:value={ttsSettings.defaultVoice}
                  oninput={() => saveTtsSettings("defaultVoice", true, false)}
                  onblur={() => autoSave.flush("tts")}
                  placeholder={m.music.ttsDefaultVoicePlaceholder()}
                  class="w-full px-3 py-2 rounded-lg border"
                  style="background: {colors.gradientStart}20; border-color: {colors.primary}30; color: {colors.text};"
                >
                <div class="text-sm mt-1" style="color: {colors.muted}">{m.music.ttsDefaultVoiceHint()}</div>
              </div>

              <!-- TTS Role -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-user-shield" style="color: {colors.secondary}; font-size: 16px;"></i>
                  <span class="font-medium" style="color: {colors.text}">{m.common.requiredRole()}</span>
                </div>
                <DiscordSelector
                  type="role"
                  options={[{id: 'null', name: m.music.ttsRequiredRoleNone()}, ...roles]}
                  selected={ttsSettings.roleId === null ? 'null' : ttsSettings.roleId.toString()}
                  placeholder={m.music.ttsRequiredRolePlaceholder()}
                  onchange={handleTtsRoleChange}
                />
                <div class="text-sm mt-1" style="color: {colors.muted}">{m.music.ttsRequiredRoleHint()}</div>
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
              <h2 class="text-xl font-bold" style="color: {colors.text}">{m.music.ttsBehaviorTitle()}</h2>
            </div>

            <div class="space-y-5">
              <!-- Reply Context -->
              <label class="flex items-center gap-3">
                <input type="checkbox" bind:checked={ttsSettings.replyContext} onchange={() => saveTtsSettings("replyContext")} class="sr-only peer">
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
                  <span style="color: {colors.text}">{m.music.ttsReplyContext()}</span>
                  <div class="text-sm" style="color: {colors.muted}">{m.music.ttsReplyContextHint()}</div>
                </div>
              </label>

              <!-- Attachment Narration -->
              <label class="flex items-center gap-3">
                <input type="checkbox" bind:checked={ttsSettings.attachmentNarration} onchange={() => saveTtsSettings("attachmentNarration")} class="sr-only peer">
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
                  <span style="color: {colors.text}">{m.music.ttsAttachmentNarration()}</span>
                  <div class="text-sm" style="color: {colors.muted}">{m.music.ttsAttachmentNarrationHint()}</div>
                </div>
              </label>

              <!-- Consecutive Grouping -->
              <label class="flex items-center gap-3">
                <input type="checkbox" bind:checked={ttsSettings.consecutiveGrouping} onchange={() => saveTtsSettings("consecutiveGrouping")} class="sr-only peer">
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
                  <span style="color: {colors.text}">{m.music.ttsConsecutiveGrouping()}</span>
                  <div class="text-sm" style="color: {colors.muted}">{m.music.ttsConsecutiveGroupingHint()}</div>
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
                <h3 class="text-lg font-bold" style="color: {colors.text}">{m.music.ttsVoiceSearchTitle()}</h3>
              </div>

              <div class="flex gap-2">
                <input
                  type="text"
                  bind:value={ttsVoiceSearch}
                  placeholder={m.music.ttsVoiceSearchPlaceholder()}
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
                  {searchingVoices ? m.music.searchSearching() : m.common.search()}
                </button>
              </div>

              {#if ttsVoiceResults.length > 0}
                <div class="mt-3 max-h-48 overflow-y-auto rounded-lg border" style="border-color: {colors.primary}20;">
                  {#each ttsVoiceResults as voice}
                    <button
                      class="w-full text-left px-3 py-2 flex justify-between items-center transition-colors hover:opacity-80"
                      style="border-bottom: 1px solid {colors.primary}10;"
                      onclick={() => { ttsSettings.defaultVoice = voice.name; saveTtsSettings("defaultVoice"); }}
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
              <h2 class="text-xl font-bold" style="color: {colors.text}">{m.music.ttsVcTitle()}</h2>
            </div>
            <button
              onclick={() => showAddVc = !showAddVc}
              class="px-4 py-2 rounded-lg font-medium transition-all"
              style="background: {colors.primary}; color: {colors.text};"
            >
              <i class="fa-solid fa-plus mr-2"></i>{m.music.linkAddChannel()}
            </button>
          </div>

          {#if showAddVc}
            <div class="mb-6 p-4 rounded-xl" style="background: {colors.gradientStart}20; border: 1px solid {colors.primary}20;">
              <div class="flex gap-3 items-end">
                <div class="grow">
                  <span class="text-sm font-medium mb-1 block" style="color: {colors.text}">{m.common.voiceChannel()}</span>
                  <DiscordSelector
                    type="custom"
                    options={voiceChannels}
                    selected={newVcId}
                    placeholder={m.common.selectVoiceChannelPlaceholder()}
                    onchange={(d) => { if (typeof d.selected === "string") newVcId = d.selected; }}
                  />
                </div>
                <button
                  onclick={addVcSetting}
                  disabled={!newVcId}
                  class="px-4 py-2 rounded-lg font-medium transition-all"
                  style="background: {colors.primary}; color: {colors.text}; opacity: {newVcId ? '1' : '0.5'};"
                >
                  {m.music.ttsVcEnable()}
                </button>
              </div>
            </div>
          {/if}

          {#if ttsSettings.vcSettings.length === 0}
            <div class="text-center py-8" style="color: {colors.muted}">
              <i class="fa-regular fa-volume-slash text-3xl mb-3 block" style="color: {colors.primary}30;"></i>
              <p>{m.music.ttsVcEmpty()}</p>
              <p class="text-sm mt-1">{m.music.ttsVcEmptyHint()}</p>
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
                        <input type="checkbox" bind:checked={vc.enabled} class="sr-only peer" onchange={() => { const previous = !vc.enabled; updateVcSetting(vc, () => { vc.enabled = previous; }); }}>
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
                        title={m.common.remove()}
                      >
                        <i class="fa-solid fa-trash-can text-sm"></i>
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <!-- Linked Text Channel -->
                    <div>
                      <span class="text-sm" style="color: {colors.muted}">{m.music.ttsVcLinkedTextChannel()}</span>
                      <DiscordSelector
                        type="channel"
                        options={[{id: 'null', name: m.music.ttsVcLinkedTextOnly()}, ...channels]}
                        selected={vc.linkedTextChannelId === null ? 'null' : vc.linkedTextChannelId.toString()}
                        placeholder={m.common.selectChannelPlaceholder()}
                        onchange={(d) => {
                          if (typeof d.selected === "string") {
                            const previous = vc.linkedTextChannelId;
                            vc.linkedTextChannelId = d.selected === 'null' ? null : BigInt(d.selected);
                            updateVcSetting(vc, () => { vc.linkedTextChannelId = previous; });
                          }
                        }}
                      />
                    </div>

                    <!-- Announce Join/Leave -->
                    <div>
                      <span class="text-sm mb-1 block" style="color: {colors.muted}">{m.music.ttsVcAnnounce()}</span>
                      <label class="flex items-center gap-2 mt-2">
                        <input type="checkbox" bind:checked={vc.announceJoinLeave} class="sr-only peer" onchange={() => { const previous = !vc.announceJoinLeave; updateVcSetting(vc, () => { vc.announceJoinLeave = previous; }); }}>
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
                        <span class="text-sm" style="color: {colors.text}">{m.music.ttsVcAnnounce()}</span>
                      </label>
                    </div>

                    <!-- Auto-Join -->
                    <div>
                      <span class="text-sm mb-1 block" style="color: {colors.muted}">{m.music.ttsVcAutoJoin()}</span>
                      <label class="flex items-center gap-2 mt-2">
                        <input type="checkbox" bind:checked={vc.autoJoin} class="sr-only peer" onchange={() => { const previous = !vc.autoJoin; updateVcSetting(vc, () => { vc.autoJoin = previous; }); }}>
                        <span
                          class="relative w-9 h-5 rounded-full transition-all duration-200 block"
                          style="background: {vc.autoJoin ? colors.primary : colors.primary + '30'};"
                        >
                          <span
                            class="absolute w-3 h-3 rounded-full top-1 left-1 transition-all duration-200 block"
                            style="background: {colors.text};
                                   transform: translateX({vc.autoJoin ? '16px' : '0'});"
                          ></span>
                        </span>
                        <span class="text-sm" style="color: {colors.text}">{m.music.ttsVcAutoJoinToggle()}</span>
                      </label>
                      <div class="text-xs mt-1" style="color: {colors.muted}">{m.music.ttsVcAutoJoinHint()}</div>
                    </div>
                  </div>

                  {#if vc.announceJoinLeave}
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div>
                        <span class="text-sm" style="color: {colors.muted}">{m.music.ttsVcJoinFormat()}</span>
                        <input
                          type="text"
                          bind:value={vc.joinFormat}
                          oninput={() => updateVcSetting(vc, undefined, true)}
                          placeholder={m.music.ttsVcJoinFormatPlaceholder()}
                          class="w-full px-3 py-1.5 rounded-lg border text-sm"
                          style="background: {colors.gradientStart}20; border-color: {colors.primary}20; color: {colors.text};"
                          onblur={() => autoSave.flush(`vc-${vc.voiceChannelId}`)}
                        >
                      </div>
                      <div>
                        <span class="text-sm" style="color: {colors.muted}">{m.music.ttsVcLeaveFormat()}</span>
                        <input
                          type="text"
                          bind:value={vc.leaveFormat}
                          oninput={() => updateVcSetting(vc, undefined, true)}
                          placeholder={m.music.ttsVcLeaveFormatPlaceholder()}
                          class="w-full px-3 py-1.5 rounded-lg border text-sm"
                          style="background: {colors.gradientStart}20; border-color: {colors.primary}20; color: {colors.text};"
                          onblur={() => autoSave.flush(`vc-${vc.voiceChannelId}`)}
                        >
                      </div>
                    </div>
                    <div class="mt-2 text-xs" style="color: {colors.muted}">
                      {m.music.ttsVcPlaceholders()} <code style="color: {colors.primary}">%user.name%</code> <code style="color: {colors.primary}">%user.mention%</code> <code style="color: {colors.primary}">%user.id%</code> <code style="color: {colors.primary}">%server.name%</code> <code style="color: {colors.primary}">%server.members%</code> <code style="color: {colors.primary}">%channel.name%</code>
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
            <h2 class="text-xl font-bold" style="color: {colors.text}">{m.music.ttsBlockedTitle()}</h2>
          </div>

          <div class="flex gap-2 mb-4">
            <input
              type="text"
              bind:value={blockUserId}
              placeholder={m.music.ttsBlockedPlaceholder()}
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
              {m.common.block()}
            </button>
          </div>

          {#if ttsBlockedUsers.length === 0}
            <div class="text-center py-4" style="color: {colors.muted}">
              <p class="text-sm">{m.music.ttsBlockedEmpty()}</p>
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
                    {m.common.unblock()}
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
