<!-- routes/dashboard/counting/+page.svelte -->
<script lang="ts">


  import { onMount } from "svelte";
  import { logger } from "$lib/logger";
    import {
      countingApi,
      clientApi,
      CountingPattern,
        type CountingChannelResponse,
        type CountingConfigResponse,
        type CountingStatsResponse,
        type CountingUserStatsResponse,
        type CreateSavePointRequest,
        type ResetCountingChannelRequest,
        type SavePointResponse,
        type SetupCountingChannelRequest,
        type UpdateCountingConfigRequest
    } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { fade, slide } from "svelte/transition";
  import type { PageData } from "./$types";
  import { m } from "$lib/i18n";
    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import Notification from "$lib/components/ui/Notification.svelte";
    import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
    import {currentInstance} from "$lib/stores/instanceStore";
    import { requestConfirmation } from "$lib/stores/confirmationStore";
    import { createAutoSave } from "$lib/utils/autoSave.svelte";

    const autoSave = createAutoSave({
      onError: (_err, key) => showNotificationMessage(
        TYPED_SETTINGS.has(key.slice(key.indexOf(":") + 1) as SettingKey)
          ? m.counting.notifySaveFailed()
          : m.counting.notifySaveFailedUndone(),
        "error"
      )
    });

    interface Props {
        data: PageData;
    }

    let {data}: Props = $props();

  // States
    let activeTab: "channels" | "config" | "stats" | "leaderboard" | "management" = $state("channels");
    let loading = $state(true);
    let error: string | null = $state(null);
    let showNotification = $state(false);
    let notificationMessage = $state("");
    let notificationType: "success" | "error" = $state("success");

  // Data
    let countingChannels: CountingChannelResponse[] = $state([]);
    let selectedChannel: CountingChannelResponse | null = $state(null);
  let channelConfig: CountingConfigResponse | null = null;
    let channelStats: CountingStatsResponse | null = $state(null);
    let leaderboard: CountingUserStatsResponse[] = $state([]);
    let savePoints: SavePointResponse[] = $state([]);
    let textChannels: Array<{ id: string; name: string }> = $state([]);
    let guildRoles: Array<{ id: string; name: string; color?: number }> = $state([]);

  // Form data for new channel setup
    let setupChannelId: string | null = $state(null);
    let setupStartNumber = $state(1);
    let setupIncrement = $state(1);

  // Config form data
  interface CountingSettings {
    allowRepeatedUsers: boolean;
    cooldown: number;
    requiredRoles: string[];
    bannedRoles: string[];
    maxNumber: number;
    resetOnError: boolean;
    deleteWrongMessages: boolean;
    pattern: CountingPattern;
    numberBase: number;
    successEmote: string;
    errorEmote: string;
    enableAchievements: boolean;
    enableCompetitions: boolean;
  }
  type SettingKey = keyof CountingSettings;

  /** Settings edited by typing. They save debounced and are not rolled back on failure. */
  const TYPED_SETTINGS = new Set<SettingKey>(["cooldown", "maxNumber", "numberBase", "successEmote", "errorEmote"]);

  function defaultSettings(): CountingSettings {
    return {
      allowRepeatedUsers: false,
      cooldown: 0,
      requiredRoles: [],
      bannedRoles: [],
      maxNumber: 0,
      resetOnError: true,
      deleteWrongMessages: true,
      pattern: CountingPattern.Sequential,
      numberBase: 10,
      successEmote: "",
      errorEmote: "",
      enableAchievements: true,
      enableCompetitions: false
    };
  }

  let settings: CountingSettings = $state(defaultSettings());
  /** Last values the server confirmed for the selected channel, so a failed save can roll back. */
  let savedSettings: CountingSettings = defaultSettings();

  // Leaderboard settings
    let leaderboardType = $state("contributions");
    let leaderboardLimit = $state(20);

  // Reset form
    let resetNumber = $state(1);
    let resetReason = $state("");

  // Save point form
    let saveReason = $state("");

  // Helper Functions
  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => showNotification = false, 3000);
  }

  function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }

  function formatPattern(pattern: CountingPattern): string {
    switch (pattern) {
      case CountingPattern.Sequential:
        return m.counting.patternSequential();
      case CountingPattern.SkipMultiples:
        return m.counting.patternSkipMultiples();
      case CountingPattern.Fibonacci: return m.counting.patternFibonacci();
      case CountingPattern.Primes: return m.counting.patternPrimes();
      case CountingPattern.PowersOfTwo:
        return m.counting.patternPowersOfTwo();
      default: return m.common.unknown();
    }
  }

  function getTimeAgo(dateString: string): string {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return m.common.justNow();
    if (diffMins < 60) return m.common.agoMinutes({ count: diffMins });
    if (diffMins < 1440) return m.common.agoHours({ count: Math.floor(diffMins / 60) });
    return m.common.agoDays({ count: Math.floor(diffMins / 1440) });
  }

  function getChannelStatus(channel: CountingChannelResponse): { color: string; text: string } {
    if (!channel.isActive) return { color: "#ef4444", text: m.common.inactive() };
    if (channel.currentNumber === channel.highestNumber) return { color: "#22c55e", text: m.counting.statusRecordHigh() };
    return { color: "#3b82f6", text: m.common.active() };
  }

  // API Functions
  async function loadData() {
    if (!$currentGuild) return;
    
    loading = true;
    error = null;
    countingChannels = [];
    textChannels = [];

    try {
      const [channelsData, textChannelsData, rolesData] = await Promise.all([
        countingApi.getCountingChannels($currentGuild.id),
        clientApi.getTextChannels($currentGuild.id),
        clientApi.getRoles($currentGuild.id)
      ]);

      countingChannels = channelsData || [];
      textChannels = textChannelsData || [];
      guildRoles = rolesData || [];

      // Load config and stats for selected channel
      if (selectedChannel) {
        await loadChannelDetails(selectedChannel.channelId);
      }

    } catch (err) {
      logger.error("Failed to load counting data:", err);
      error = err instanceof Error ? err.message : m.counting.notifyLoadFailed();
      showNotificationMessage(m.counting.notifyLoadFailed(), "error");
    } finally {
      loading = false;
    }
  }

  async function loadChannelDetails(channelId: bigint) {
    if (!$currentGuild) return;

    // Let queued edits land first so the reload does not show stale values over them.
    await autoSave.flush();
    if (!$currentGuild) return;

    try {
      const [configData, statsData, savePointsData] = await Promise.all([
        countingApi.getCountingConfig($currentGuild.id, channelId).catch(() => null),
        countingApi.getCountingStats($currentGuild.id, channelId).catch(() => null),
        countingApi.getSavePoints($currentGuild.id, channelId).catch(() => [])
      ]);

      channelConfig = configData;
      channelStats = statsData;
      savePoints = savePointsData || [];

      // Populate form data from config
      if (channelConfig) {
        const loaded: CountingSettings = {
          allowRepeatedUsers: channelConfig.allowRepeatedUsers,
          cooldown: channelConfig.cooldown,
          requiredRoles: channelConfig.requiredRoles ? channelConfig.requiredRoles.split(',').map(r => r.trim()).filter(r => r) : [],
          bannedRoles: channelConfig.bannedRoles ? channelConfig.bannedRoles.split(',').map(r => r.trim()).filter(r => r) : [],
          maxNumber: channelConfig.maxNumber,
          resetOnError: channelConfig.resetOnError,
          deleteWrongMessages: channelConfig.deleteWrongMessages,
          pattern: channelConfig.pattern,
          numberBase: channelConfig.numberBase,
          successEmote: channelConfig.successEmote || "",
          errorEmote: channelConfig.errorEmote || "",
          enableAchievements: channelConfig.enableAchievements,
          enableCompetitions: channelConfig.enableCompetitions
        };
        settings = loaded;
        savedSettings = { ...loaded, requiredRoles: [...loaded.requiredRoles], bannedRoles: [...loaded.bannedRoles] };
      }
    } catch (err) {
      logger.error("Failed to load channel details:", err);
      showNotificationMessage(m.counting.notifyDetailsFailed(), "error");
    }
  }

  async function loadLeaderboard() {
    if (!selectedChannel || !$currentGuild) return;
    
    try {
      const leaderboardData = await countingApi.getLeaderboard(
        $currentGuild.id,
        selectedChannel.channelId,
        leaderboardType as any,
        1,
        leaderboardLimit
      );
      leaderboard = leaderboardData.users || [];
    } catch (err) {
      logger.error("Failed to load leaderboard:", err);
      showNotificationMessage(m.common.failedToLoadLeaderboard(), "error");
    }
  }

  async function setupChannel() {
    if (!$currentGuild || !setupChannelId) return;

    try {
      const request: SetupCountingChannelRequest = {
        startNumber: setupStartNumber,
        increment: setupIncrement
      };

      const newChannel = await countingApi.setupCountingChannel($currentGuild.id, BigInt(setupChannelId), request);
      showNotificationMessage(m.counting.notifyChannelSetup(), "success");
      
      // Refresh data
      await loadData();
      
      // Select the new channel
      selectedChannel = newChannel;
      activeTab = "config";
      
      // Reset form
      setupChannelId = null;
      setupStartNumber = 1;
      setupIncrement = 1;
    } catch (err) {
      logger.error("Failed to setup counting channel:", err);
      showNotificationMessage(m.counting.notifyChannelSetupFailed(), "error");
    }
  }

  function isIntInRange(value: unknown, min: number, max = Number.MAX_SAFE_INTEGER): value is number {
    return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
  }

  /**
   * Builds the partial update for one setting, or null while the value is not valid to send.
   * The API leaves omitted fields alone, so each setting is saved on its own. Empty role lists
   * and emotes are sent as "" so clearing them actually reaches the server.
   */
  function buildRequest(key: SettingKey, s: CountingSettings): UpdateCountingConfigRequest | null {
    switch (key) {
      case "cooldown":
        return isIntInRange(s.cooldown, 0, 300) ? { cooldown: s.cooldown } : null;
      case "maxNumber":
        return isIntInRange(s.maxNumber, 0) ? { maxNumber: s.maxNumber } : null;
      case "numberBase":
        return isIntInRange(s.numberBase, 2, 36) ? { numberBase: s.numberBase } : null;
      case "requiredRoles":
        return { requiredRoles: s.requiredRoles.join(",") };
      case "bannedRoles":
        return { bannedRoles: s.bannedRoles.join(",") };
      case "successEmote":
        return { successEmote: s.successEmote.trim() };
      case "errorEmote":
        return { errorEmote: s.errorEmote.trim() };
      case "pattern":
        return { pattern: s.pattern };
      case "allowRepeatedUsers":
        return { allowRepeatedUsers: s.allowRepeatedUsers };
      case "resetOnError":
        return { resetOnError: s.resetOnError };
      case "deleteWrongMessages":
        return { deleteWrongMessages: s.deleteWrongMessages };
      case "enableAchievements":
        return { enableAchievements: s.enableAchievements };
      case "enableCompetitions":
        return { enableCompetitions: s.enableCompetitions };
    }
  }

  function settingSaveKey(channelId: bigint, key: SettingKey) {
    // Keyed by channel too, so switching channels mid-edit cannot replace another channel's queued save.
    return `${channelId}:${key}`;
  }

  /**
   * Saves one setting of the selected channel. Toggles, selects and role pickers save at once
   * and roll back on failure; typed fields save after a pause and keep what the user typed.
   */
  function saveSetting(key: SettingKey) {
    if (!selectedChannel || !$currentGuild) return;
    const guildId = $currentGuild.id;
    const channelId = selectedChannel.channelId;
    const snapshot = $state.snapshot(settings) as CountingSettings;
    const request = buildRequest(key, snapshot);
    if (!request) return;

    const isCurrent = () => $currentGuild?.id === guildId && selectedChannel?.channelId === channelId;
    const typed = TYPED_SETTINGS.has(key);

    const save = async () => {
      try {
        await countingApi.updateCountingConfig(guildId, channelId, request);
        if (isCurrent()) savedSettings = { ...savedSettings, [key]: snapshot[key] };
      } catch (err) {
        if (!typed && isCurrent()) settings = { ...settings, [key]: savedSettings[key] };
        throw err;
      }
    };

    if (typed) {
      autoSave.schedule(settingSaveKey(channelId, key), save);
    } else {
      autoSave.now(settingSaveKey(channelId, key), save);
    }
  }

  function flushSetting(key: SettingKey) {
    if (!selectedChannel) return;
    autoSave.flush(settingSaveKey(selectedChannel.channelId, key));
  }

  async function resetChannel() {
    if (!selectedChannel || !$currentGuild || !data.user) return;

    try {
      const request: ResetCountingChannelRequest = {
        newNumber: resetNumber,
        userId: BigInt(data.user.id),
        reason: resetReason || undefined
      };

      await countingApi.resetCountingChannel($currentGuild.id, selectedChannel.channelId, request);
      showNotificationMessage(m.counting.notifyChannelReset({ number: resetNumber }), "success");
      
      // Reload data
      await loadData();
      await loadChannelDetails(selectedChannel.channelId);
      
      // Reset form
      resetNumber = 1;
      resetReason = "";
    } catch (err) {
      logger.error("Failed to reset channel:", err);
      showNotificationMessage(m.counting.notifyResetFailed(), "error");
    }
  }

  async function createSavePoint() {
    if (!selectedChannel || !$currentGuild || !data.user) return;

    try {
      const request: CreateSavePointRequest = {
        userId: BigInt(data.user.id),
        reason: saveReason || undefined
      };

      await countingApi.createSavePoint($currentGuild.id, selectedChannel.channelId, request);
      showNotificationMessage(m.counting.notifySavePointCreated(), "success");

      // Reload save points
      const savePointsData = await countingApi.getSavePoints($currentGuild.id, selectedChannel.channelId);
      savePoints = savePointsData || [];
      
      // Reset form
      saveReason = "";
    } catch (err) {
      logger.error("Failed to create save point:", err);
      showNotificationMessage(m.counting.notifySavePointFailed(), "error");
    }
  }

  /** Banned users, milestones, and custom message state for the management tab */
  let bannedUsers: any[] = $state([]);
  let milestones: number[] = $state([]);
  let newMilestone = $state<number | null>(null);
  let customMessage = $state("");
  let banUserId = $state("");
  let banReason = $state("");
  let banDurationMinutes = $state<number | null>(null);
  let purgeReason = $state("");
  let managementBusy = $state(false);

  async function loadManagementData() {
    if (!selectedChannel || !$currentGuild) return;
    try {
      const [bannedData, milestoneData] = await Promise.all([
        countingApi.getBannedUsers($currentGuild.id, selectedChannel.channelId).catch(() => []),
        countingApi.getMilestones($currentGuild.id, selectedChannel.channelId).catch(() => [])
      ]);
      bannedUsers = bannedData || [];
      milestones = ((milestoneData as any)?.milestones ?? []).slice().sort((a: number, b: number) => a - b);
    } catch (err) {
      logger.error("Failed to load counting management data:", err);
    }
  }

  async function restoreSavePoint(saveId: number) {
    if (!selectedChannel || !$currentGuild || !data.user) return;
    managementBusy = true;
    try {
      await countingApi.restoreSavePoint($currentGuild.id, selectedChannel.channelId, { saveId, userId: BigInt(data.user.id) });
      showNotificationMessage(m.counting.notifySavePointRestored(), "success");
      await loadChannelDetails(selectedChannel.channelId);
    } catch (err) {
      logger.error("Failed to restore save point:", err);
      showNotificationMessage(m.counting.notifyRestoreFailed(), "error");
    } finally {
      managementBusy = false;
    }
  }

  async function deleteSavePoint(saveId: number) {
    if (!selectedChannel || !$currentGuild || !data.user) return;
    managementBusy = true;
    try {
      await countingApi.deleteSavePoint($currentGuild.id, selectedChannel.channelId, saveId, BigInt(data.user.id));
      savePoints = savePoints.filter(sp => sp.id !== saveId);
    } catch (err) {
      logger.error("Failed to delete save point:", err);
      showNotificationMessage(m.counting.notifyDeleteSavePointFailed(), "error");
    } finally {
      managementBusy = false;
    }
  }

  async function banCountingUser() {
    if (!selectedChannel || !$currentGuild || !data.user) return;
    if (!/^\d{15,22}$/.test(banUserId.trim())) {
      showNotificationMessage(m.common.invalidUserId(), "error");
      return;
    }
    managementBusy = true;
    try {
      await countingApi.banUser($currentGuild.id, selectedChannel.channelId, BigInt(banUserId.trim()), {
        bannedBy: BigInt(data.user.id),
        durationMinutes: banDurationMinutes || null,
        reason: banReason || null
      });
      banUserId = "";
      banReason = "";
      banDurationMinutes = null;
      await loadManagementData();
    } catch (err) {
      logger.error("Failed to ban user from counting:", err);
      showNotificationMessage(m.counting.notifyBanFailed(), "error");
    } finally {
      managementBusy = false;
    }
  }

  async function unbanCountingUser(userId: bigint) {
    if (!selectedChannel || !$currentGuild || !data.user) return;
    managementBusy = true;
    try {
      await countingApi.unbanUser($currentGuild.id, selectedChannel.channelId, userId, { unbannedBy: BigInt(data.user.id) });
      await loadManagementData();
    } catch (err) {
      logger.error("Failed to unban user from counting:", err);
      showNotificationMessage(m.counting.notifyUnbanFailed(), "error");
    } finally {
      managementBusy = false;
    }
  }

  async function saveMilestones(next: number[]) {
    if (!selectedChannel || !$currentGuild) return;
    managementBusy = true;
    try {
      const sorted = Array.from(new Set(next.filter(n => Number.isFinite(n) && n > 0))).sort((a, b) => a - b);
      await countingApi.setMilestones($currentGuild.id, selectedChannel.channelId, { milestones: sorted });
      milestones = sorted;
      newMilestone = null;
    } catch (err) {
      logger.error("Failed to save milestones:", err);
      showNotificationMessage(m.counting.notifyMilestonesFailed(), "error");
    } finally {
      managementBusy = false;
    }
  }

  async function saveCustomMessage() {
    if (!selectedChannel || !$currentGuild) return;
    managementBusy = true;
    try {
      await countingApi.setCustomMessage($currentGuild.id, selectedChannel.channelId, { message: customMessage });
      showNotificationMessage(m.counting.notifyMilestoneMessageSaved(), "success");
    } catch (err) {
      logger.error("Failed to save custom message:", err);
      showNotificationMessage(m.common.failedToSaveMessage(), "error");
    } finally {
      managementBusy = false;
    }
  }

  async function purgeChannel() {
    if (!selectedChannel || !$currentGuild || !data.user) return;
    if (!(await requestConfirmation({
      title: m.counting.confirmPurgeTitle(),
      message: m.counting.confirmPurgeMessage(),
      confirmText: m.counting.purgeButton()
    }))) return;
    managementBusy = true;
    try {
      await countingApi.purgeCountingChannel($currentGuild.id, selectedChannel.channelId, {
        userId: BigInt(data.user.id),
        reason: purgeReason || null
      });
      purgeReason = "";
      showNotificationMessage(m.counting.notifyPurged(), "success");
      await loadChannelDetails(selectedChannel.channelId);
      await loadManagementData();
    } catch (err) {
      logger.error("Failed to purge counting channel:", err);
      showNotificationMessage(m.counting.notifyPurgeFailed(), "error");
    } finally {
      managementBusy = false;
    }
  }

  $effect(() => {
    if (activeTab === "management" && selectedChannel) {
      loadManagementData();
    }
  });

  async function disableChannel(channel: CountingChannelResponse) {
    if (!$currentGuild) return;

    try {
      await countingApi.removeCountingChannel($currentGuild.id, channel.channelId);
      showNotificationMessage(m.counting.notifyChannelDisabled(), "success");
      
      // Reload data
      await loadData();
      
      // Clear selection if disabled channel was selected
      if (selectedChannel?.channelId === channel.channelId) {
        selectedChannel = null;
      }
    } catch (err) {
      logger.error("Failed to disable channel:", err);
      showNotificationMessage(m.counting.notifyDisableFailed(), "error");
    }
  }

  // Event handlers
  onMount(() => {
    loadData();
  });

  $effect(() => {
        if ($currentInstance) {
            loadData();
        }
    });

  $effect(() => {
        if ($currentGuild) {
            loadData();
        }
    });

  $effect(() => {
        if (activeTab === "leaderboard" && selectedChannel) {
            loadLeaderboard();
        }
    });

  const tabs = $derived([
    { id: "channels", label: m.counting.tabChannels({ count: countingChannels.length || 0 }), icon: "fa-hashtag" },
    { id: "config", label: m.common.configuration(), icon: "fa-gear" },
    { id: "stats", label: m.common.statistics(), icon: "fa-chart-column" },
    { id: "leaderboard", label: m.common.leaderboard(), icon: "fa-trophy" },
    { id: "management", label: m.common.management(), icon: "fa-shield" }
  ]);
</script>

<svelte:head>
  <title>{m.counting.headTitle()}</title>
</svelte:head>

{#snippet statusMessageContent()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}

  {#if selectedChannel}
    <div class="mb-6 flex items-center gap-2 p-4 rounded-lg"
         style="background: {getChannelStatus(selectedChannel).color}15; border: 1px solid {getChannelStatus(selectedChannel).color}30;">
      <i class="fa-solid fa-circle-check"
         style="color: {getChannelStatus(selectedChannel).color}; font-size: 16px;"></i>
      <span class="text-sm" style="color: {getChannelStatus(selectedChannel).color}">
        {m.counting.selectedChannel({ name: selectedChannel.channelName ?? "", status: getChannelStatus(selectedChannel).text })}
      </span>
    </div>
  {:else if countingChannels.length === 0}
    <div class="mb-6 flex items-center gap-2 p-4 rounded-lg"
         style="background: #f59e0b15; border: 1px solid #f59e0b30;">
      <i class="fa-solid fa-circle-exclamation" style="color: #f59e0b; font-size: 16px;"></i>
      <span class="text-sm" style="color: #f59e0b">{m.counting.channelsNoneConfigured()}</span>
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  {autoSave}
  bind:activeTab
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-list-numeric"
  statusMessages={statusMessageContent}
  subtitle={m.counting.pageSubtitle()}
  {tabs}
  title={m.counting.pageTitle()}
>

  <!-- Content -->
  {#if loading}
    <SkeletonLoader />
  {:else if error}
    <div class="rounded-xl border p-6" style="border-color: #ef4444; background: #ef444410;">
      <div class="flex items-center gap-3">
        <i class="fa-utility-duo fa-regular fa-circle-exclamation" style="--fa-primary-color: #ef4444; --fa-secondary-color: #dc2626; font-size: 20px;"></i>
        <span style="color: #ef4444">{error}</span>
      </div>
    </div>
  {:else if activeTab === 'channels'}
    <div class="space-y-6" transition:fade>
      <!-- Setup New Channel -->
      <div class=" rounded-xl border p-6 transition-all"
             style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">{m.counting.setupTitle()}</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span id="channel-span-stylecolor-ef4444span-label" class="block mb-2" style="color: {$colorStore.text}">
              {m.common.channel()} <span style="color: #ef4444">*</span>
            </span>
            <DiscordSelector
              type="channel"
              options={textChannels}
              bind:selected={setupChannelId}
              placeholder={m.common.selectChannelPlaceholder()}
            />
          </div>
          
          <div>
            <label for="input-9001" class="block mb-2" style="color: {$colorStore.text}">{m.counting.setupStartNumber()}</label>
            <input id="input-9001"
              type="number"
              bind:value={setupStartNumber}
              min="0"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
          </div>
          
          <div>
            <label for="input-7842" class="block mb-2" style="color: {$colorStore.text}">{m.counting.setupIncrement()}</label>
            <input id="input-7842"
              type="number"
              bind:value={setupIncrement}
              min="1"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
          </div>
        </div>
        
        <button
          class="mt-4 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
          onclick={setupChannel}
          disabled={!setupChannelId}
        >
          <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
          {m.counting.setupButton()}
        </button>
      </div>

      <!-- Existing Channels -->
      {#if countingChannels.length === 0}
        <div class="text-center py-12">
          <i class="fa-utility-duo fa-regular fa-list-numeric" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
          <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text}">{m.counting.channelsEmptyTitle()}</h3>
          <p style="color: {$colorStore.muted}">{m.counting.channelsEmptyHint()}</p>
        </div>
      {:else}
        <div class="grid gap-4">
          {#each countingChannels as channel (channel.id)}
              <div
                class=" rounded-xl border p-4 cursor-pointer transition-all hover:scale-[1.02]"
              style="border-color: {selectedChannel?.id === channel.id ? $colorStore.primary : $colorStore.primary + '30'}; background: {selectedChannel?.id === channel.id ? $colorStore.primary + '15' : $colorStore.primary + '05'};"
                      role="button"
                      tabindex="0"
              onclick={() => {
                selectedChannel = channel;
                activeTab = "config";
                loadChannelDetails(channel.channelId);
              }}
                      onkeydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectedChannel = channel;
                  activeTab = "config";
                  loadChannelDetails(channel.channelId);
                }
              }}
              transition:slide
            >
              <div class="space-y-3">
                <!-- Header Row -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 min-w-0 flex-1">
                    <i class="fa-utility-duo fa-regular fa-list-numeric" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h3 class="font-medium truncate" style="color: {$colorStore.text}">{channel.channelName}</h3>
                    <span class="px-2 py-1 rounded-full text-xs whitespace-nowrap" style="background: {getChannelStatus(channel).color}20; color: {getChannelStatus(channel).color};">
                      {getChannelStatus(channel).text}
                    </span>
                  </div>

                  <button aria-label={m.counting.channelDisable()}
                          class="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-500/20 shrink-0"
                          onclick={(e) => { e.stopPropagation(); disableChannel(channel); }}
                    title={m.counting.channelDisable()}
                  >
                    <i class="fa-solid fa-trash" style="font-size: 16px;"></i>
                  </button>
                </div>
                
                <!-- Stats Grid - Responsive -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm" style="color: {$colorStore.muted}">
                  <div>
                    <span class="font-medium" style="color: {$colorStore.text}">{m.common.current()}</span>
                    <div>{formatNumber(channel.currentNumber)}</div>
                  </div>
                  <div>
                    <span class="font-medium" style="color: {$colorStore.text}">{m.counting.channelHighest()}</span>
                    <div>{formatNumber(channel.highestNumber)}</div>
                  </div>
                  <div>
                    <span class="font-medium" style="color: {$colorStore.text}">{m.common.total()}</span>
                    <div>{formatNumber(channel.totalCounts)}</div>
                  </div>
                  {#if channel.lastUsername}
                    <div class="col-span-2 sm:col-span-1">
                      <span class="font-medium" style="color: {$colorStore.text}">{m.counting.channelLastBy()}</span>
                      <div class="truncate">{channel.lastUsername}</div>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

  {:else if activeTab === 'config' && selectedChannel}
    <div class="space-y-6" transition:fade>
      <!-- Basic Settings -->
      <div class=" rounded-xl border p-6 transition-all"
             style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">{m.common.basicSettings()}</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <span id="counting-pattern-label" class="block mb-2"
                  style="color: {$colorStore.text}">{m.counting.configPattern()}</span>
            <DiscordSelector
              type="custom"
              customIcon="fa-hashtag"
              options={[
                { id: "0", name: m.counting.patternSequential(), label: m.counting.patternLabelSequential() },
                { id: "1", name: m.counting.patternSkipMultiples(), label: m.counting.patternSkipMultiples() },
                { id: "2", name: m.counting.patternFibonacci(), label: m.counting.patternLabelFibonacci() },
                { id: "3", name: m.counting.patternPrimes(), label: m.counting.patternLabelPrimes() },
                { id: "4", name: m.counting.patternPowersOfTwo(), label: m.counting.patternLabelPowersOfTwo() }
              ]}
              selected={settings.pattern?.toString() ?? "0"}
              placeholder={m.counting.configPatternPlaceholder()}
              searchable={false}
              onchange={(detail) => {
                if (detail.selected && typeof detail.selected === 'string') {
                  settings.pattern = parseInt(detail.selected);
                  saveSetting("pattern");
                }
              }}
            />
          </div>

          <div>
            <label for="input-5192" class="block mb-2" style="color: {$colorStore.text}">{m.counting.configNumberBase()}</label>
            <input id="input-5192"
              type="number"
              bind:value={settings.numberBase}
              oninput={() => saveSetting("numberBase")}
              onblur={() => flushSetting("numberBase")}
              min="2"
              max="36"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
            <p class="text-sm mt-1" style="color: {$colorStore.muted}">{m.counting.configNumberBaseHint()}</p>
          </div>

          <div>
            <label for="input-2101" class="block mb-2" style="color: {$colorStore.text}">{m.common.cooldownSeconds()}</label>
            <input id="input-2101"
              type="number"
              bind:value={settings.cooldown}
              oninput={() => saveSetting("cooldown")}
              onblur={() => flushSetting("cooldown")}
              min="0"
              max="300"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
          </div>

          <div>
            <label for="input-6772" class="block mb-2" style="color: {$colorStore.text}">{m.counting.configMaxNumber()}</label>
            <input id="input-6772"
              type="number"
              bind:value={settings.maxNumber}
              oninput={() => saveSetting("maxNumber")}
              onblur={() => flushSetting("maxNumber")}
              min="0"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
            <p class="text-sm mt-1" style="color: {$colorStore.muted}">{m.common.zeroMeansUnlimited()}</p>
          </div>

          <div>
            <label for="input-1917" class="block mb-2" style="color: {$colorStore.text}">{m.counting.configSuccessEmote()}</label>
            <input id="input-1917"
              type="text"
              bind:value={settings.successEmote}
              oninput={() => saveSetting("successEmote")}
              onblur={() => flushSetting("successEmote")}
              placeholder="✅"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
          </div>

          <div>
            <label for="input-9952" class="block mb-2" style="color: {$colorStore.text}">{m.counting.configErrorEmote()}</label>
            <input id="input-9952"
              type="text"
              bind:value={settings.errorEmote}
              oninput={() => saveSetting("errorEmote")}
              onblur={() => flushSetting("errorEmote")}
              placeholder="❌"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
          </div>
        </div>
      </div>

      <!-- Behavior Settings -->
      <div class=" rounded-xl border p-6 transition-all"
             style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">{m.counting.configBehaviorTitle()}</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <label for="input-2005" class="flex items-center gap-3">
              <input
                type="checkbox"
                bind:checked={settings.allowRepeatedUsers}
                onchange={() => saveSetting("allowRepeatedUsers")}
                class="w-4 h-4"
              >
              <span style="color: {$colorStore.text}">{m.counting.configAllowRepeated()}</span>
            </label>

            <label for="input-2005" class="flex items-center gap-3">
              <input
                type="checkbox"
                bind:checked={settings.resetOnError}
                onchange={() => saveSetting("resetOnError")}
                class="w-4 h-4"
              >
              <span style="color: {$colorStore.text}">{m.counting.configResetOnError()}</span>
            </label>

            <label for="input-2005" class="flex items-center gap-3">
              <input
                type="checkbox"
                bind:checked={settings.deleteWrongMessages}
                onchange={() => saveSetting("deleteWrongMessages")}
                class="w-4 h-4"
              >
              <span style="color: {$colorStore.text}">{m.counting.configDeleteWrong()}</span>
            </label>
          </div>

          <div class="space-y-4">
            <label for="input-2005" class="flex items-center gap-3">
              <input
                type="checkbox"
                bind:checked={settings.enableAchievements}
                onchange={() => saveSetting("enableAchievements")}
                class="w-4 h-4"
              >
              <span style="color: {$colorStore.text}">{m.counting.configEnableAchievements()}</span>
            </label>

            <label for="input-2005" class="flex items-center gap-3">
              <input
                type="checkbox"
                bind:checked={settings.enableCompetitions}
                onchange={() => saveSetting("enableCompetitions")}
                class="w-4 h-4"
              >
              <span style="color: {$colorStore.text}">{m.counting.configEnableCompetitions()}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Role Restrictions -->
      <div class=" rounded-xl border p-6 transition-all"
             style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">{m.counting.configRolesTitle()}</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span id="required-roles-label" class="block mb-2" style="color: {$colorStore.text}">{m.common.requiredRoles()}</span>
            <DiscordSelector
              type="role"
              options={guildRoles}
              bind:selected={settings.requiredRoles}
              placeholder={m.counting.configRequiredRolesPlaceholder()}
              multiple={true}
              onchange={() => saveSetting("requiredRoles")}
            />
            <p class="text-sm mt-1" style="color: {$colorStore.muted}">{m.counting.configRequiredRolesHint()}</p>
          </div>

          <div>
            <span id="banned-roles-label" class="block mb-2" style="color: {$colorStore.text}">{m.counting.configBannedRoles()}</span>
            <DiscordSelector
              type="role"
              options={guildRoles}
              bind:selected={settings.bannedRoles}
              placeholder={m.counting.configBannedRolesPlaceholder()}
              multiple={true}
              onchange={() => saveSetting("bannedRoles")}
            />
            <p class="text-sm mt-1" style="color: {$colorStore.muted}">{m.counting.configBannedRolesHint()}</p>
          </div>
        </div>
      </div>
    </div>

  {:else if activeTab === 'stats' && selectedChannel && channelStats}
    <div class="space-y-6" transition:fade>
      <!-- Overview Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class=" rounded-xl border p-4 transition-all"
               style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm" style="color: {$colorStore.muted}">{m.counting.statsCurrentNumber()}</p>
              <p class="text-2xl font-bold" style="color: {$colorStore.text}">{formatNumber(channelStats.channel.currentNumber)}</p>
            </div>
            <i class="fa-utility-duo fa-regular fa-list-numeric" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
          </div>
        </div>

        <div class=" rounded-xl border p-4 transition-all"
               style="border-color: {$colorStore.secondary}30; background: {$colorStore.secondary}05;">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm" style="color: {$colorStore.muted}">{m.counting.statsTotalParticipants()}</p>
              <p class="text-2xl font-bold" style="color: {$colorStore.text}">{formatNumber(channelStats.totalParticipants)}</p>
            </div>
            <i class="fa-utility-duo fa-regular fa-users" style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.primary}; font-size: 24px;"></i>
          </div>
        </div>

        <div class=" rounded-xl border p-4 transition-all"
               style="border-color: {$colorStore.accent}30; background: {$colorStore.accent}05;">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm" style="color: {$colorStore.muted}">{m.counting.statsAverageAccuracy()}</p>
                <p class="text-2xl font-bold"
                   style="color: {$colorStore.text}">{Number(channelStats.averageAccuracy || 0).toFixed(1)}%</p>
            </div>
            <i class="fa-utility-duo fa-regular fa-gauge" style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 24px;"></i>
          </div>
        </div>

        <div class=" rounded-xl border p-4 transition-all"
               style="border-color: #ef444430; background: #ef444405;">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm" style="color: {$colorStore.muted}">{m.common.totalErrors()}</p>
              <p class="text-2xl font-bold" style="color: {$colorStore.text}">{formatNumber(channelStats.totalErrors)}</p>
            </div>
            <i class="fa-utility-duo fa-regular fa-circle-exclamation" style="--fa-primary-color: #ef4444; --fa-secondary-color: #dc2626; font-size: 24px;"></i>
          </div>
        </div>
      </div>

      <!-- Top Contributor -->
      {#if channelStats.topContributor}
        <div class=" rounded-xl border p-6 transition-all"
               style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">{m.counting.statsTopContributor()}</h3>
          
          <div class="flex items-center gap-4">
            {#if channelStats.topContributor.avatarUrl}
              <img src={channelStats.topContributor.avatarUrl} alt={m.common.avatar()} class="w-12 h-12 rounded-full">
            {:else}
              <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background: {$colorStore.primary}20;">
                <i class="fa-utility-duo fa-regular fa-user" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
              </div>
            {/if}
            
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-crown" style="color: #fbbf24; font-size: 16px;"></i>
                <span class="font-bold" style="color: {$colorStore.text}">
                  {channelStats.topContributor.username || m.common.unknownUser()}
                </span>
                {#if channelStats.topContributor.rank}
                  <span class="px-2 py-1 rounded-full text-xs" style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
                    {m.common.rankNumber({ rank: channelStats.topContributor.rank })}
                  </span>
                {/if}
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm" style="color: {$colorStore.muted}">
                <span>{m.counting.statContributions({ count: formatNumber(channelStats.topContributor.contributionsCount) })}</span>
                <span>{m.counting.statBestStreak({ count: formatNumber(channelStats.topContributor.highestStreak) })}</span>
                  <span>{m.counting.statAccuracy({ percent: Number(channelStats.topContributor.accuracy || 0).toFixed(1) })}</span>
                <span>{m.counting.statNumbersCounted({ count: formatNumber(channelStats.topContributor.totalNumbersCounted) })}</span>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Milestones -->
      <div class=" rounded-xl border p-6 transition-all"
             style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">{m.counting.milestonesTitle()}</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center">
            <i class="fa-utility-duo fa-regular fa-flag"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 32px; display: block; margin: 0 auto 8px;"></i>
            <p class="text-sm" style="color: {$colorStore.muted}">{m.counting.statsMilestonesReached()}</p>
            <p class="text-xl font-bold" style="color: {$colorStore.text}">{formatNumber(channelStats.milestonesReached)}</p>
          </div>

          <div class="text-center">
            <i class="fa-utility-duo fa-regular fa-star"
               style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.primary}; font-size: 32px; display: block; margin: 0 auto 8px;"></i>
            <p class="text-sm" style="color: {$colorStore.muted}">{m.counting.statsHighestNumber()}</p>
            <p class="text-xl font-bold" style="color: {$colorStore.text}">{formatNumber(channelStats.channel.highestNumber)}</p>
          </div>
          
          <div class="text-center">
            <i class="fa-utility-duo fa-regular fa-clock" style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 32px; display: block; margin: 0 auto 8px;"></i>
            <p class="text-sm" style="color: {$colorStore.muted}">{m.counting.statsLastActivity()}</p>
            <p class="text-xl font-bold" style="color: {$colorStore.text}">
              {channelStats.lastActivity ? getTimeAgo(channelStats.lastActivity) : m.common.never()}
            </p>
          </div>
        </div>
      </div>
    </div>

  {:else if activeTab === 'leaderboard' && selectedChannel}
    <div class="space-y-6" transition:fade>
      <!-- Leaderboard Controls -->
      <div class=" rounded-xl border p-6 transition-all"
             style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <div class="flex items-center gap-4 mb-4">
          <h3 class="text-xl font-bold" style="color: {$colorStore.text}">{m.counting.leaderboardSettings()}</h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span id="sort-by-label" class="block mb-2" style="color: {$colorStore.text}">{m.common.sortBy()}</span>
            <DiscordSelector
              type="custom"
              customIcon="fa-trophy"
              options={[
                { id: "contributions", name: m.counting.leaderboardContributions(), label: m.counting.leaderboardContributions() },
                { id: "streak", name: m.counting.leaderboardHighestStreak(), label: m.counting.leaderboardStreak() },
                { id: "accuracy", name: m.counting.leaderboardAccuracy(), label: m.counting.leaderboardAccuracy() },
                { id: "totalnumbers", name: m.counting.leaderboardTotalNumbers(), label: m.counting.leaderboardTotalNumbers() }
              ]}
              selected={leaderboardType}
              placeholder={m.counting.leaderboardSortPlaceholder()}
              searchable={false}
              onchange={(detail) => {
                if (detail.selected && typeof detail.selected === 'string') {
                  leaderboardType = detail.selected;
                  loadLeaderboard();
                }
              }}
            />
          </div>
          
          <div>
            <label for="input-2005" class="block mb-2" style="color: {$colorStore.text}">{m.counting.leaderboardLimit()}</label>
            <input id="input-2005"
              type="number"
              bind:value={leaderboardLimit}
              onchange={loadLeaderboard}
              min="5"
              max="100"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
          </div>
        </div>
      </div>

      <!-- Leaderboard -->
      {#if leaderboard.length === 0}
        <div class="text-center py-12">
          <i class="fa-utility-duo fa-regular fa-trophy" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
          <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text}">{m.counting.leaderboardEmptyTitle()}</h3>
          <p style="color: {$colorStore.muted}">{m.counting.leaderboardEmptyHint()}</p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each leaderboard as entry, index (entry.userId)}
              <div
                class=" rounded-xl border p-4 flex items-center gap-4 transition-all"
              style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;"
              transition:slide={{ delay: index * 50 }}
            >
              <!-- Rank -->
                  <div class="text-center min-w-12">
                <div class="text-2xl font-bold" style="color: {$colorStore.text}">
                  {#if index === 0}
                    <i class="fa-solid fa-crown" style="color: #fbbf24; font-size: 24px;"></i>
                  {:else if index === 1}
                    <span style="color: #c0c0c0;">2</span>
                  {:else if index === 2}
                    <span style="color: #cd7f32;">3</span>
                  {:else}
                    <span style="color: {$colorStore.muted};">{index + 1}</span>
                  {/if}
                </div>
              </div>

              <!-- Avatar -->
                  <div class="min-w-12">
                {#if entry.avatarUrl}
                  <img src={entry.avatarUrl} alt={m.common.avatar()} class="w-12 h-12 rounded-full">
                {:else}
                  <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background: {$colorStore.primary}20;">
                    <i class="fa-utility-duo fa-regular fa-user" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                  </div>
                {/if}
              </div>

              <!-- User Info -->
              <div class="flex-1">
                <h4 class="font-bold" style="color: {$colorStore.text}">
                  {entry.username || m.common.unknownUser()}
                </h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm" style="color: {$colorStore.muted}">
                  <span>{m.counting.statContributions({ count: formatNumber(entry.contributionsCount) })}</span>
                  <span>{m.counting.statBestStreak({ count: formatNumber(entry.highestStreak) })}</span>
                    <span>{m.counting.statAccuracy({ percent: Number(entry.accuracy || 0).toFixed(1) })}</span>
                  <span>{m.counting.statTotal({ count: formatNumber(entry.totalNumbersCounted) })}</span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

  {:else if activeTab === 'management' && selectedChannel}
    <div class="space-y-6" transition:fade>
      <!-- Reset Channel -->
      <div class=" rounded-xl border p-6 transition-all"
             style="border-color: #f59e0b30; background: #f59e0b05;">
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">{m.counting.resetTitle()}</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label for="input-5476" class="block mb-2" style="color: {$colorStore.text}">{m.counting.resetToNumber()}</label>
            <input id="input-5476"
              type="number"
              bind:value={resetNumber}
              min="0"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
          </div>
          
          <div>
            <label for="input-9512" class="block mb-2" style="color: {$colorStore.text}">{m.common.reasonOptional()}</label>
            <input id="input-9512"
              type="text"
              bind:value={resetReason}
              placeholder={m.counting.resetReasonPlaceholder()}
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
          </div>
        </div>
        
        <button
          class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
          style="background: #f59e0b20; color: #f59e0b; border: 1px solid #f59e0b30;"
          onclick={resetChannel}
        >
          <i class="fa-solid fa-arrow-rotate-left" style="font-size: 16px;"></i>
          {m.counting.resetTitle()}
        </button>
      </div>

      <!-- Save Points -->
      <div class=" rounded-xl border p-6 transition-all"
             style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">{m.counting.savePointsTitle()}</h3>
        
        <!-- Create Save Point -->
        <div class="mb-6">
          <div class="flex gap-4">
            <input
              type="text"
              bind:value={saveReason}
              placeholder={m.counting.savePointReasonPlaceholder()}
              class="flex-1 p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
            <button
              class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
              onclick={createSavePoint}
            >
              <i class="fa-solid fa-floppy-disk" style="font-size: 16px;"></i>
              {m.counting.savePointCreate()}
            </button>
          </div>
        </div>

        <!-- Save Points List -->
        {#if savePoints.length === 0}
          <div class="text-center py-8">
            <i class="fa-utility-duo fa-regular fa-box-archive" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 32px; display: block; margin: 0 auto 8px;"></i>
            <p style="color: {$colorStore.muted}">{m.counting.savePointsEmpty()}</p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each savePoints as savePoint (savePoint.id)}
                <div
                  class=" rounded-lg border p-4 flex items-center justify-between transition-all"
                style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08;"
                transition:slide
              >
                <div>
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-floppy-disk" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                    <span class="font-medium" style="color: {$colorStore.text}">
                      {m.counting.savePointNumber({ number: formatNumber(savePoint.savedNumber) })}
                    </span>
                    <span class="text-sm" style="color: {$colorStore.muted}">
                      {m.common.byName({ name: savePoint.savedByUsername ?? "" })}
                    </span>
                  </div>
                  <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                    {savePoint.reason || m.common.noReasonProvided()} • {savePoint.savedAt ? getTimeAgo(savePoint.savedAt) : m.counting.timeUnknown()}
                  </p>
                </div>
                
                <div class="flex items-center gap-2">
                  <button aria-label={m.counting.savePointRestoreAria()}
                          class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] min-h-[40px] disabled:opacity-50"
                    style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                    disabled={managementBusy}
                    onclick={async () => {
                      if (await requestConfirmation({ message: m.counting.confirmRestore({ number: formatNumber(savePoint.savedNumber) }), confirmText: m.common.restore(), variant: "warning" })) {
                        await restoreSavePoint(savePoint.id);
                      }
                    }}
                  >
                    <i class="fa-solid fa-rotate-left" style="font-size: 14px;"></i>
                  </button>

                  <button aria-label={m.counting.savePointDeleteAria()}
                          class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] min-h-[40px] disabled:opacity-50"
                    style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
                    disabled={managementBusy}
                    onclick={async () => {
                      if (await requestConfirmation({ message: m.counting.confirmDeleteSavePoint(), confirmText: m.common.delete() })) {
                        await deleteSavePoint(savePoint.id);
                      }
                    }}
                  >
                    <i class="fa-solid fa-trash" style="font-size: 14px;"></i>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Milestones -->
      <div class=" rounded-xl border p-6 transition-all"
           style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <div class="flex items-center gap-3 mb-2">
          <i class="fa-utility-duo fa-regular fa-flag" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h3 class="text-xl font-bold" style="color: {$colorStore.text}">{m.counting.milestonesTitle()}</h3>
        </div>
        <p class="text-sm mb-4" style="color: {$colorStore.muted}">{m.counting.milestonesHint()}</p>

        <div class="flex flex-wrap gap-2 mb-4">
          {#if milestones.length === 0}
            <span class="text-sm" style="color: {$colorStore.muted}">{m.counting.milestonesDefault()}</span>
          {/if}
          {#each milestones as milestone (milestone)}
            <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                  style="background: {$colorStore.primary}15; color: {$colorStore.text};" transition:fade>
              {formatNumber(milestone)}
              <button class="rounded-sm hover:opacity-80 min-h-[24px] min-w-[24px]" aria-label={m.counting.milestoneRemoveAria({ milestone })}
                      disabled={managementBusy}
                      onclick={() => saveMilestones(milestones.filter(value => value !== milestone))}>
                <i class="fa-solid fa-xmark" style="color: {$colorStore.muted}; font-size: 12px;"></i>
              </button>
            </span>
          {/each}
        </div>

        <form class="flex flex-col sm:flex-row gap-3" onsubmit={(e) => { e.preventDefault(); if (newMilestone) saveMilestones([...milestones, newMilestone]); }}>
          <input type="number" min="1" bind:value={newMilestone} placeholder={m.counting.milestoneAddPlaceholder()}
                 aria-label={m.counting.milestoneNewAria()}
                 class="flex-1 p-3 rounded-lg border min-h-[44px]"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          <button type="submit" disabled={managementBusy || !newMilestone}
                  class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
            <i class="fa-solid fa-plus"></i>
            {m.common.add()}
          </button>
        </form>

        <div class="mt-6">
          <label for="milestone-message" class="block mb-2 font-medium" style="color: {$colorStore.text}">{m.counting.milestoneMessageLabel()}</label>
          <p class="text-xs mb-2" style="color: {$colorStore.muted}">{m.counting.milestoneMessageHint()}</p>
          <div class="flex flex-col sm:flex-row gap-3">
            <input id="milestone-message" type="text" bind:value={customMessage} placeholder={m.counting.milestoneMessagePlaceholder()}
                   class="flex-1 p-3 rounded-lg border min-h-[44px]"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            <button disabled={managementBusy || !customMessage.trim()}
                    class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
                    style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                    onclick={saveCustomMessage}>
              <i class="fa-solid fa-floppy-disk"></i>
              {m.common.save()}
            </button>
          </div>
        </div>
      </div>

      <!-- Counting bans -->
      <div class=" rounded-xl border p-6 transition-all"
           style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <div class="flex items-center gap-3 mb-2">
          <i class="fa-utility-duo fa-regular fa-user" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h3 class="text-xl font-bold" style="color: {$colorStore.text}">{m.counting.bansTitle()}</h3>
        </div>
        <p class="text-sm mb-4" style="color: {$colorStore.muted}">{m.counting.bansHint()}</p>

        <form class="grid grid-cols-1 md:grid-cols-[1fr_1fr_140px_auto] gap-3 mb-6" onsubmit={(e) => { e.preventDefault(); banCountingUser(); }}>
          <input type="text" inputmode="numeric" bind:value={banUserId} placeholder={m.common.userId()} aria-label={m.counting.bansUserIdAria()}
                 class="p-3 rounded-lg border min-h-[44px]"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          <input type="text" bind:value={banReason} placeholder={m.common.reasonOptional()} aria-label={m.common.banReason()}
                 class="p-3 rounded-lg border min-h-[44px]"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          <input type="number" min="1" bind:value={banDurationMinutes} placeholder={m.common.minutes()} aria-label={m.counting.bansDurationAria()}
                 class="p-3 rounded-lg border min-h-[44px]"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          <button type="submit" disabled={managementBusy || !banUserId.trim()}
                  class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
                  style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;">
            <i class="fa-solid fa-ban"></i>
            {m.common.actionBan()}
          </button>
        </form>

        {#if bannedUsers.length === 0}
          <div class="text-center py-6">
            <i class="fa-utility-duo fa-regular fa-user-check" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 32px; display: block; margin: 0 auto 8px;"></i>
            <p style="color: {$colorStore.muted}">{m.counting.bansEmpty()}</p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each bannedUsers as ban (ban.id)}
              <div class="rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-all"
                   style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08;" transition:slide>
                {#if ban.avatarUrl}
                  <img src={ban.avatarUrl} alt="" class="w-10 h-10 rounded-full shrink-0 border-2" style="border-color: {$colorStore.primary}30;">
                {:else}
                  <div class="w-10 h-10 rounded-full shrink-0 flex items-center justify-center" style="background: {$colorStore.primary}20;">
                    <i class="fa-solid fa-user" style="color: {$colorStore.primary};"></i>
                  </div>
                {/if}
                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate" style="color: {$colorStore.text}">{ban.username || m.common.userFallback({ id: ban.userId })}</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">
                    {ban.reason || m.common.noReasonProvided()} • {m.common.byName({ name: ban.bannedByUsername || ban.bannedBy })}
                    {#if ban.expiresAt}
                      • {m.counting.banUntil({ date: new Date(ban.expiresAt).toLocaleString() })}
                    {:else}
                      • {m.common.permanentLower()}
                    {/if}
                  </div>
                </div>
                <button class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] min-h-[40px] disabled:opacity-50"
                        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                        disabled={managementBusy}
                        onclick={() => unbanCountingUser(ban.userId)}>
                  {m.common.unban()}
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Danger zone -->
      <div class=" rounded-xl border p-6 transition-all"
           style="border-color: #ef444430; background: #ef444405;">
        <div class="flex items-center gap-3 mb-2">
          <i class="fa-utility-duo fa-regular fa-circle-exclamation" style="--fa-primary-color: #ef4444; --fa-secondary-color: #dc2626; font-size: 20px;"></i>
          <h3 class="text-xl font-bold" style="color: {$colorStore.text}">{m.counting.purgeTitle()}</h3>
        </div>
        <p class="text-sm mb-4" style="color: {$colorStore.muted}">{m.counting.purgeHint()}</p>
        <div class="flex flex-col sm:flex-row gap-3">
          <input type="text" bind:value={purgeReason} placeholder={m.common.reasonOptional()} aria-label={m.counting.purgeReasonAria()}
                 class="flex-1 p-3 rounded-lg border min-h-[44px]"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          <button disabled={managementBusy}
                  class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
                  style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
                  onclick={purgeChannel}>
            <i class="fa-solid fa-trash"></i>
            {m.counting.purgeButton()}
          </button>
        </div>
      </div>
    </div>

  {:else}
    <div class="text-center py-12">
      <i class="fa-utility-duo fa-regular fa-gear" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
      <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text}">{m.common.selectAChannelPlaceholder()}</h3>
      <p style="color: {$colorStore.muted}">{m.counting.selectHint()}</p>
    </div>
  {/if}
</DashboardPageLayout>
