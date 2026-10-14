<!-- routes/dashboard/customvoice/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";


  import { onMount } from "svelte";
  import { logger } from "$lib/logger";
  import {
    clientApi,
    customVoiceApi,
    type CustomVoiceChannelResponse,
    type CustomVoiceConfigurationRequest,
    type CustomVoiceConfigurationResponse,
    type CustomVoiceUserPreference
  } from "$lib/api/index.ts";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { fade, slide } from "svelte/transition";
  import type { PageData } from "./$types";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import { currentInstance } from "$lib/stores/instanceStore";

  interface Props {
        data: PageData;
    }

    let {data}: Props = $props();

  // States
    let activeTab: "config" | "channels" | "preferences" = $state("config");
    let loading = $state(true);
    let error: string | null = $state(null);
    let showNotification = $state(false);
    let notificationMessage = $state("");
    let notificationType: "success" | "error" = $state("success");

  // Data
    let config: CustomVoiceConfigurationResponse | null = $state(null);
    let activeChannels: CustomVoiceChannelResponse[] = $state([]);
    let voiceChannels: Array<{ id: string; name: string }> = $state([]);
    let categories: Array<{ id: string; name: string }> = $state([]);

  // Form data
  const DEFAULT_NAME_FORMAT = "{username}'s Channel";
  const DEFAULT_TOGGLES = {
    deleteWhenEmpty: true,
    allowMultipleChannels: false,
    allowNameCustomization: true,
    allowUserLimitCustomization: true,
    allowBitrateCustomization: false,
    allowLocking: true,
    allowUserManagement: true,
    persistUserPreferences: true,
    autoPermission: true
  };
  type ToggleKey = keyof typeof DEFAULT_TOGGLES;

    let hubChannelId: string | null = $state(null);
    let categoryId: string | null = $state(null);
    let defaultNameFormat = $state(DEFAULT_NAME_FORMAT);
    let defaultUserLimit = $state(0);
  let defaultBitrate = $state(64);
    let emptyChannelTimeout = $state(60);
  let toggles = $state({ ...DEFAULT_TOGGLES });
  let maxUserLimit = 99;
  let maxBitrate = 384;
  let customVoiceAdminRoleId: string | null = null;

  /** The configuration as the server last confirmed it, and which guild it belongs to. */
  let saved = {
    hubChannelId: null as string | null,
    categoryId: null as string | null,
    defaultNameFormat: DEFAULT_NAME_FORMAT,
    defaultUserLimit: 0,
    defaultBitrate: 64,
    emptyChannelTimeout: 60
  };
  let loadedGuildId: string | null = null;

  /** Nothing is saved until both the hub channel and the category are picked. */
  const missingChannels = $derived(!hubChannelId || !categoryId);

  const autoSave = createAutoSave({
    onError: () => showNotificationMessage(m.customvoice.notifySaveFailed(), "error")
  });

  // Helper Functions
  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => showNotification = false, 3000);
  }

  function getChannelName(channelId: bigint): string {
    const channel = voiceChannels.find(ch => ch.id === channelId.toString());
    return channel?.name || m.common.channelFallback({ id: channelId.toString() });
  }

  function formatChannelStatus(channel: CustomVoiceChannelResponse): string {
    if (channel.isLocked) return m.customvoice.statusPrivate();
    if (channel.keepAlive) return m.customvoice.statusPersistent();
    return m.customvoice.statusPublic();
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

  // API Functions
  async function loadData() {
    if (!$currentGuild) return;
    
    loading = true;
    error = null;
    // Ensure arrays are initialized before api is even called.
    activeChannels = [];
    voiceChannels = [];
    categories = [];

    const guildId = $currentGuild.id;
    try {
      // Anything still waiting belongs to the data on screen, so send it before replacing it
      await autoSave.flush();
      const [configData, activeChannelsData, voiceChannelsData, categoriesData] = await Promise.all([
        customVoiceApi.getCustomVoiceConfig(guildId),
        customVoiceApi.getActiveCustomVoiceChannels(guildId),
        clientApi.getVoiceChannels(guildId),
        clientApi.getCategories(guildId)
      ]);

      if ($currentGuild?.id !== guildId) return;

      config = configData;
      activeChannels = activeChannelsData || [];
      voiceChannels = voiceChannelsData || [];
      categories = categoriesData || [];

      // Populate form data; a guild without a configuration starts from the defaults
      if (config && config.enabled) {
        hubChannelId = config.hubVoiceChannelId?.toString() || null;
        categoryId = config.channelCategoryId?.toString() || null;
        defaultNameFormat = config.defaultNameFormat || DEFAULT_NAME_FORMAT;
        defaultUserLimit = config.defaultUserLimit || 0;
        defaultBitrate = config.defaultBitrate || 64;
        emptyChannelTimeout = config.emptyChannelTimeout || 60;
        toggles = {
          deleteWhenEmpty: config.deleteWhenEmpty ?? true,
          allowMultipleChannels: config.allowMultipleChannels ?? false,
          allowNameCustomization: config.allowNameCustomization ?? true,
          allowUserLimitCustomization: config.allowUserLimitCustomization ?? true,
          allowBitrateCustomization: config.allowBitrateCustomization ?? false,
          allowLocking: config.allowLocking ?? true,
          allowUserManagement: config.allowUserManagement ?? true,
          persistUserPreferences: config.persistUserPreferences ?? true,
          autoPermission: config.autoPermission ?? true
        };
        maxUserLimit = config.maxUserLimit || 99;
        maxBitrate = config.maxBitrate || 96;
        customVoiceAdminRoleId = config.customVoiceAdminRoleId?.toString() || null;
      } else {
        hubChannelId = null;
        categoryId = null;
        defaultNameFormat = DEFAULT_NAME_FORMAT;
        defaultUserLimit = 0;
        defaultBitrate = 64;
        emptyChannelTimeout = 60;
        toggles = { ...DEFAULT_TOGGLES };
        maxUserLimit = 99;
        maxBitrate = 384;
        customVoiceAdminRoleId = null;
      }
      saved = { hubChannelId, categoryId, defaultNameFormat, defaultUserLimit, defaultBitrate, emptyChannelTimeout };
      loadedGuildId = guildId.toString();

    } catch (err) {
      logger.error("Failed to load custom voice data:", err);
      error = err instanceof Error ? err.message : m.customvoice.notifyLoadFailed();
      showNotificationMessage(m.customvoice.notifyLoadFailed(), "error");

      logger.debug(activeChannels)
    } finally {
      loading = false;
    }
  }

  function isIntInRange(value: unknown, min: number, max: number): value is number {
    return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
  }

  /**
   * Builds a save of the whole configuration from the form as it is right now. Everything is
   * captured here, not when the save runs, so a save still waiting after switching servers
   * cannot carry the new server's state. A field that is currently invalid is sent with its
   * last saved value. Returns null while the hub channel or category is missing, since saving
   * is what turns custom voice on.
   */
  function buildSave(rollback?: () => void) {
    if (!$currentGuild || loadedGuildId !== $currentGuild.id.toString()) return null;
    if (!hubChannelId || !categoryId) return null;
    const guildId = $currentGuild.id;
    const next = {
      hubChannelId,
      categoryId,
      defaultNameFormat: defaultNameFormat.trim() ? defaultNameFormat : saved.defaultNameFormat,
      defaultUserLimit: isIntInRange(defaultUserLimit, 0, 99) ? defaultUserLimit : saved.defaultUserLimit,
      defaultBitrate,
      emptyChannelTimeout: isIntInRange(emptyChannelTimeout, 5, 300) ? emptyChannelTimeout : saved.emptyChannelTimeout
    };
    const request: CustomVoiceConfigurationRequest = {
      hubVoiceChannelId: BigInt(next.hubChannelId),
      channelCategoryId: BigInt(next.categoryId),
      defaultNameFormat: next.defaultNameFormat,
      defaultUserLimit: next.defaultUserLimit,
      defaultBitrate: next.defaultBitrate,
      emptyChannelTimeout: next.emptyChannelTimeout,
      ...toggles,
      maxUserLimit,
      maxBitrate,
      customVoiceAdminRoleId: customVoiceAdminRoleId ? BigInt(customVoiceAdminRoleId) : null
    };

    return async () => {
      try {
        await customVoiceApi.updateCustomVoiceConfig(guildId, request);
        if ($currentGuild?.id === guildId) {
          saved = next;
          // The first save creates the configuration
          if (!config?.enabled) config = { ...config, enabled: true } as CustomVoiceConfigurationResponse;
        }
      } catch (err) {
        if ($currentGuild?.id === guildId) rollback?.();
        throw err;
      }
    };
  }

  /** Saves straight away (toggles, selectors), running `rollback` if the save fails. */
  function saveNow(rollback: () => void) {
    const save = buildSave(rollback);
    if (save) autoSave.now("config", save);
  }

  /** Saves once typing stops. Typed values are not rolled back on failure; the header offers Retry. */
  function scheduleSave() {
    const save = buildSave();
    if (save) autoSave.schedule("config", save);
  }

  /** Leaving a field that holds an invalid value puts back its last saved value. */
  function handleBlur(field: "defaultNameFormat" | "defaultUserLimit" | "emptyChannelTimeout") {
    switch (field) {
      case "defaultNameFormat":
        if (!defaultNameFormat.trim()) defaultNameFormat = saved.defaultNameFormat;
        break;
      case "defaultUserLimit":
        if (!isIntInRange(defaultUserLimit, 0, 99)) defaultUserLimit = saved.defaultUserLimit;
        break;
      case "emptyChannelTimeout":
        if (!isIntInRange(emptyChannelTimeout, 5, 300)) emptyChannelTimeout = saved.emptyChannelTimeout;
        break;
    }
    void autoSave.flush("config");
  }

  function handleToggle(key: ToggleKey) {
    const previous = !toggles[key];
    saveNow(() => {
      toggles[key] = previous;
    });
  }

  function handleHubChange() {
    const previous = saved.hubChannelId;
    saveNow(() => {
      hubChannelId = previous;
    });
  }

  function handleCategoryChange() {
    const previous = saved.categoryId;
    saveNow(() => {
      categoryId = previous;
    });
  }

  function handleBitrateChange(detail: { selected: string | string[] | null }) {
    if (!detail.selected || typeof detail.selected !== "string") return;
    const value = parseInt(detail.selected);
    const previous = saved.defaultBitrate;
    defaultBitrate = value;
    saveNow(() => {
      defaultBitrate = previous;
    });
  }

  /** Statistics, maintenance, and user preference state */
  let stats: any = $state(null);
  let cleanupHours = $state(24);
  let maintenanceBusy = $state(false);
  let prefUserId = $state("");
  let prefLoading = $state(false);
  let prefError = $state("");
  let userPrefs: CustomVoiceUserPreference | null = $state(null);
  let prefForm = $state({ defaultName: "", defaultUserLimit: null as number | null, defaultBitrate: null as number | null });

  async function loadStats() {
    if (!$currentGuild) return;
    try {
      stats = await customVoiceApi.getCustomVoiceStatistics($currentGuild.id);
    } catch (err) {
      logger.error("Failed to load custom voice statistics:", err);
    }
  }

  async function cleanupInactive() {
    if (!$currentGuild) return;
    if (!(await requestConfirmation({
      message: m.customvoice.cleanupConfirmMessage({ hours: cleanupHours }),
      confirmText: m.customvoice.cleanupConfirm(),
      variant: "warning"
    }))) return;
    maintenanceBusy = true;
    try {
      const result = await customVoiceApi.cleanupInactiveChannels($currentGuild.id, cleanupHours);
      showNotificationMessage(
        (result.deletedChannels === 1 ? m.customvoice.notifyCleanupDoneOne : m.customvoice.notifyCleanupDoneOther)({ count: result.deletedChannels }),
        "success"
      );
      await loadData();
      await loadStats();
    } catch (err) {
      logger.error("Failed to clean up channels:", err);
      showNotificationMessage(m.customvoice.notifyCleanupFailed(), "error");
    } finally {
      maintenanceBusy = false;
    }
  }

  async function disableCustomVoice() {
    if (!$currentGuild) return;
    if (!(await requestConfirmation({
      title: m.customvoice.disableTitle(),
      message: m.customvoice.disableMessage(),
      confirmText: m.common.disable()
    }))) return;
    maintenanceBusy = true;
    try {
      await customVoiceApi.disableCustomVoice($currentGuild.id);
      await loadData();
      await loadStats();
    } catch (err) {
      logger.error("Failed to disable custom voice:", err);
      showNotificationMessage(m.customvoice.notifyDisableFailed(), "error");
    } finally {
      maintenanceBusy = false;
    }
  }

  async function loadUserPreferences() {
    if (!$currentGuild) return;
    await autoSave.flush("prefs");
    prefError = "";
    userPrefs = null;
    if (!/^\d{15,22}$/.test(prefUserId.trim())) {
      prefError = m.common.invalidUserId();
      return;
    }
    prefLoading = true;
    try {
      userPrefs = await customVoiceApi.getCustomVoiceUserPreferences($currentGuild.id, BigInt(prefUserId.trim()));
      prefForm = {
        defaultName: userPrefs?.defaultName ?? "",
        defaultUserLimit: userPrefs?.defaultUserLimit ?? null,
        defaultBitrate: userPrefs?.defaultBitrate ?? null
      };
    } catch (err) {
      logger.error("Failed to load user preferences:", err);
      prefError = m.customvoice.prefErrorNotFound();
    } finally {
      prefLoading = false;
    }
  }

  /** Saves the looked-up member's preferences once typing stops. Empty fields mean "server default". */
  function scheduleUserPreferencesSave() {
    if (!$currentGuild || !userPrefs) return;
    const { defaultUserLimit: limit, defaultBitrate: bitrate } = prefForm;
    if (limit != null && !isIntInRange(limit, 0, 99)) {
      prefError = m.customvoice.prefErrorLimit();
      autoSave.cancel("prefs");
      return;
    }
    if (bitrate != null && !isIntInRange(bitrate, 8, 384)) {
      prefError = m.customvoice.prefErrorBitrate();
      autoSave.cancel("prefs");
      return;
    }
    prefError = "";
    const guildId = $currentGuild.id;
    const userId = userPrefs.userId;
    const payload = {
      defaultName: prefForm.defaultName.trim() || null,
      defaultUserLimit: limit ?? null,
      defaultBitrate: bitrate ?? null
    };
    autoSave.schedule("prefs", () => customVoiceApi.updateCustomVoiceUserPreferences(guildId, userId, payload));
  }

  $effect(() => {
    if (activeTab === "channels" && $currentGuild?.id) loadStats();
  });

  async function deleteChannel(channelId: bigint) {
    if (!$currentGuild) return;
    
    try {
      await customVoiceApi.deleteCustomVoiceChannel($currentGuild.id, channelId);
      showNotificationMessage(m.customvoice.notifyDeleted(), "success");
      
      // Remove from local array
      activeChannels = activeChannels.filter(ch => ch.channelId !== channelId);
    } catch (err) {
      logger.error("Failed to delete channel:", err);
      showNotificationMessage(m.customvoice.notifyDeleteFailed(), "error");
    }
  }

  async function lockChannel(channelId: bigint, lock: boolean) {
    if (!$currentGuild) return;

    try {
      await customVoiceApi.updateCustomVoiceChannel($currentGuild.id, channelId, { isLocked: lock });
      showNotificationMessage(lock ? m.customvoice.notifyLocked() : m.customvoice.notifyUnlocked(), "success");

      // Update local array
      activeChannels = activeChannels.map(ch =>
        ch.channelId === channelId ? { ...ch, isLocked: lock } : ch
      );
    } catch (err) {
      logger.error("Failed to update channel:", err);
      showNotificationMessage(m.customvoice.notifyUpdateFailed(), "error");
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
</script>

<svelte:head>
  <title>{m.customvoice.pageHeadTitle()}</title>
</svelte:head>

{#snippet statusMessageContent()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}

  {#if config && config.enabled}
    <div class="mb-6 flex items-center gap-2 p-4 rounded-lg"
         style="background: #22c55e15; border: 1px solid #22c55e30;">
      <i class="fa-solid fa-circle-check" style="color: #22c55e; font-size: 16px;"></i>
      <span class="text-sm" style="color: #22c55e">{m.customvoice.statusEnabled()}</span>
    </div>
  {:else}
    <div class="mb-6 flex items-center gap-2 p-4 rounded-lg"
         style="background: #f59e0b15; border: 1px solid #f59e0b30;">
      <i class="fa-solid fa-circle-exclamation" style="color: #f59e0b; font-size: 16px;"></i>
      <span class="text-sm" style="color: #f59e0b">{m.customvoice.statusNotConfigured()}</span>
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  statusMessages={statusMessageContent}
  subtitle={m.customvoice.pageSubtitle()}
  icon="fa-microphone"
  guildName={$currentGuild?.name || m.common.dashboard()}
  tabs={[
    { id: "config", label: m.common.configuration(), icon: "fa-gear" },
    { id: "channels", label: m.common.activeChannelsCount({ count: activeChannels.length || 0 }), icon: "fa-microphone" },
    { id: "preferences", label: m.customvoice.prefsTitle(), icon: "fa-user" }
  ]}
  bind:activeTab
  {autoSave}
  title={m.features.customvoiceDescription()}
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
    {:else if activeTab === 'config'}
      <div class="space-y-6" transition:fade>
        <!-- Basic Configuration -->
        <div class=" rounded-xl border p-6 transition-all"
               style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">{m.customvoice.basicTitle()}</h3>

          {#if missingChannels}
            <div class="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                 style="background: #f59e0b15; border: 1px solid #f59e0b30; color: #f59e0b;">
              <i class="fa-solid fa-circle-info"></i>
              <span>{m.customvoice.basicMissing()}</span>
            </div>
          {/if}
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span id="hub-voice-channel-span-stylecolor-ef4444span-label" class="block mb-2"
                    style="color: {$colorStore.text}">
                {m.common.hubVoiceChannel()} <span style="color: #ef4444">*</span>
              </span>
              <DiscordSelector
                type="custom"
                customIcon="fa-microphone"
                options={voiceChannels}
                bind:selected={hubChannelId}
                placeholder={m.common.selectVoiceChannelPlaceholder()}
                onchange={handleHubChange} />
              <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                {m.customvoice.hubHint()}
              </p>
            </div>

            <div>
              <span id="channel-category-span-stylecolor-ef4444span-label" class="block mb-2"
                    style="color: {$colorStore.text}">
                {m.customvoice.categoryLabel()} <span style="color: #ef4444">*</span>
              </span>
              <DiscordSelector
                type="custom"
                customIcon="fa-folder"
                options={categories}
                bind:selected={categoryId}
                placeholder={m.common.selectCategoryPlaceholder()}
                onchange={handleCategoryChange} />
              <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                {m.customvoice.categoryHint()}
              </p>
            </div>
          </div>
        </div>

        <!-- Channel Defaults -->
        <div class=" rounded-xl border p-6 transition-all"
               style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">{m.customvoice.defaultsTitle()}</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label for="input-6869" class="block mb-2" style="color: {$colorStore.text}">{m.customvoice.nameFormatLabel()}</label>
              <input id="input-6869"
                type="text"
                bind:value={defaultNameFormat}
                oninput={scheduleSave}
                onblur={() => handleBlur("defaultNameFormat")}
                class="w-full p-3 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                placeholder={m.customvoice.nameFormatPlaceholder({ token: "{username}" })}
              >
              <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                {m.customvoice.nameFormatHint({ token: "{username}" })}
              </p>
            </div>

            <div>
              <label for="input-7323" class="block mb-2" style="color: {$colorStore.text}">{m.common.defaultUserLimit()}</label>
              <input id="input-7323"
                type="number"
                bind:value={defaultUserLimit}
                oninput={scheduleSave}
                onblur={() => handleBlur("defaultUserLimit")}
                min="0"
                max="99"
                class="w-full p-3 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              >
              <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                {m.common.zeroMeansUnlimited()}
              </p>
            </div>

            <div>
              <span id="default-bitrate-label" class="block mb-2"
                    style="color: {$colorStore.text}">{m.customvoice.bitrateLabel()}</span>
              <DiscordSelector
                type="custom"
                customIcon="fa-volume"
                options={[
                  { id: "64", name: "64kbps", label: "64kbps" },
                  { id: "96", name: "96kbps", label: "96kbps" },
                  { id: "128", name: "128kbps", label: "128kbps" },
                  { id: "256", name: "256kbps", label: "256kbps" },
                  { id: "384", name: "384kbps", label: "384kbps" }
                ]}
                selected={defaultBitrate.toString()}
                placeholder={m.customvoice.bitratePlaceholder()}
                searchable={false}
                onchange={handleBitrateChange}
              />
            </div>
          </div>
        </div>

        <!-- Channel Management -->
        <div class=" rounded-xl border p-6 transition-all"
               style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">{m.customvoice.managementTitle()}</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <label for="input-5476" class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={toggles.deleteWhenEmpty}
                  onchange={() => handleToggle("deleteWhenEmpty")}
                  class="w-4 h-4"
                >
                <span style="color: {$colorStore.text}">{m.common.deleteChannelsWhenEmpty()}</span>
              </label>

              {#if toggles.deleteWhenEmpty}
                <div class="ml-7">
                  <label for="input-5476" class="block mb-2" style="color: {$colorStore.text}">{m.customvoice.emptyTimeout()}</label>
                  <input id="input-5476"
                    type="number"
                    bind:value={emptyChannelTimeout}
                    oninput={scheduleSave}
                    onblur={() => handleBlur("emptyChannelTimeout")}
                    min="5"
                    max="300"
                    class="w-32 p-2 rounded-lg border"
                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                  >
                </div>
              {/if}

              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={toggles.allowMultipleChannels}
                  onchange={() => handleToggle("allowMultipleChannels")}
                  class="w-4 h-4"
                >
                <span style="color: {$colorStore.text}">{m.customvoice.toggleMultiple()}</span>
              </label>

              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={toggles.persistUserPreferences}
                  onchange={() => handleToggle("persistUserPreferences")}
                  class="w-4 h-4"
                >
                <span style="color: {$colorStore.text}">{m.customvoice.toggleRemember()}</span>
              </label>

              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={toggles.autoPermission}
                  onchange={() => handleToggle("autoPermission")}
                  class="w-4 h-4"
                >
                <span style="color: {$colorStore.text}">{m.customvoice.toggleAutoPermission()}</span>
              </label>
            </div>

            <div class="space-y-4">
              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={toggles.allowNameCustomization}
                  onchange={() => handleToggle("allowNameCustomization")}
                  class="w-4 h-4"
                >
                <span style="color: {$colorStore.text}">{m.customvoice.toggleName()}</span>
              </label>

              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={toggles.allowUserLimitCustomization}
                  onchange={() => handleToggle("allowUserLimitCustomization")}
                  class="w-4 h-4"
                >
                <span style="color: {$colorStore.text}">{m.customvoice.toggleUserLimit()}</span>
              </label>

              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={toggles.allowBitrateCustomization}
                  onchange={() => handleToggle("allowBitrateCustomization")}
                  class="w-4 h-4"
                >
                <span style="color: {$colorStore.text}">{m.customvoice.toggleBitrate()}</span>
              </label>

              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={toggles.allowLocking}
                  onchange={() => handleToggle("allowLocking")}
                  class="w-4 h-4"
                >
                <span style="color: {$colorStore.text}">{m.customvoice.toggleLocking()}</span>
              </label>

              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={toggles.allowUserManagement}
                  onchange={() => handleToggle("allowUserManagement")}
                  class="w-4 h-4"
                >
                <span style="color: {$colorStore.text}">{m.customvoice.toggleUserManagement()}</span>
              </label>
            </div>
          </div>
        </div>

      </div>

    {:else if activeTab === 'channels'}
      <div class="space-y-6" transition:fade>
        {#if stats?.enabled}
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            {#each [
              { label: m.customvoice.statTotal(), value: stats.totalChannels ?? 0, icon: "fa-microphone" },
              { label: m.customvoice.statActive(), value: stats.activeChannels ?? 0, icon: "fa-bolt" },
              { label: m.common.locked(), value: stats.lockedChannels ?? 0, icon: "fa-lock" },
              { label: m.customvoice.statKeptAlive(), value: stats.keepAliveChannels ?? 0, icon: "fa-thumbtack" }
            ] as stat}
              <div class="rounded-xl border p-4" style="border-color: {$colorStore.primary}20; background: {$colorStore.primary}05;">
                <div class="flex items-center gap-2 mb-1">
                  <i class="fa-solid {stat.icon}" style="color: {$colorStore.primary}; font-size: 14px;"></i>
                  <span class="text-xs" style="color: {$colorStore.muted}">{stat.label}</span>
                </div>
                <div class="text-2xl font-bold" style="color: {$colorStore.text}">{stat.value}</div>
              </div>
            {/each}
          </div>
        {/if}

        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2">
            <label for="cleanup-hours" class="text-sm" style="color: {$colorStore.muted}">{m.customvoice.cleanupInactiveFor()}</label>
            <input id="cleanup-hours" type="number" min="1" max="720" bind:value={cleanupHours}
                   class="w-20 p-2 rounded-lg border min-h-[40px] text-sm"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            <span class="text-sm" style="color: {$colorStore.muted}">{m.customvoice.cleanupHours()}</span>
          </div>
          <button disabled={maintenanceBusy}
                  class="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[40px] disabled:opacity-50"
                  style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                  onclick={cleanupInactive}>
            <i class="fa-solid fa-broom"></i>
            {m.customvoice.cleanupButton()}
          </button>
          {#if config?.enabled}
            <button disabled={maintenanceBusy}
                    class="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[40px] disabled:opacity-50 ml-auto"
                    style="background: #ef444415; color: #ef4444; border: 1px solid #ef444430;"
                    onclick={disableCustomVoice}>
              <i class="fa-solid fa-power-off"></i>
              {m.customvoice.disableButton()}
            </button>
          {/if}
        </div>

        {#if activeChannels === undefined || !activeChannels || activeChannels.length === 0}
          <div class="text-center py-12">
            <i class="fa-utility-duo fa-regular fa-microphone" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
            <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text}">{m.customvoice.emptyTitle()}</h3>
            <p style="color: {$colorStore.muted}">{m.customvoice.emptyText()}</p>
          </div>
        {:else}
          <div class="grid gap-4">
            {#each activeChannels as channel (channel.channelId.toString())}
                <div
                  class=" rounded-xl border p-4 flex items-center justify-between transition-all"
                style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;"
                transition:slide
              >
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    {#if channel.isLocked}
                      <i class="fa-solid fa-lock" style="color: #f59e0b; font-size: 20px;"></i>
                    {:else if channel.keepAlive}
                      <i class="fa-solid fa-thumbtack" style="color: {$colorStore.secondary}; font-size: 20px;"></i>
                    {:else}
                      <i class="fa-solid fa-unlock" style="color: {$colorStore.primary}; font-size: 20px;"></i>
                    {/if}
                    <h3 class="font-medium" style="color: {$colorStore.text}">{getChannelName(channel.channelId)}</h3>
                  </div>

                  <div class="flex items-center gap-4 text-sm" style="color: {$colorStore.muted}">
                    <span>{m.customvoice.channelOwner({ id: channel.ownerId.toString() })}</span>
                    <span>{formatChannelStatus(channel)}</span>
                    <span>{getTimeAgo(channel.createdAt)}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    class="p-2 rounded-lg transition-colors"
                    style="color: {$colorStore.muted}; hover:background: {$colorStore.primary}20;"
                    onclick={() => lockChannel(channel.channelId, !channel.isLocked)}
                    title={channel.isLocked ? m.customvoice.channelUnlock() : m.customvoice.channelLock()}
                  >
                    {#if channel.isLocked}
                      <i class="fa-solid fa-unlock" style="font-size: 16px;"></i>
                    {:else}
                      <i class="fa-solid fa-lock" style="font-size: 16px;"></i>
                    {/if}
                  </button>

                  <button aria-label={m.customvoice.channelDelete()}
                    class="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-500/20"
                          onclick={() => deleteChannel(channel.channelId)}
                    title={m.customvoice.channelDelete()}
                  >
                    <i class="fa-solid fa-trash" style="font-size: 16px;"></i>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

    {:else if activeTab === 'preferences'}
      <div class="space-y-6" transition:fade>
        <div class=" rounded-xl border p-6 transition-all"
             style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <div class="flex items-center gap-3 mb-2">
            <i class="fa-utility-duo fa-regular fa-user" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
            <h3 class="text-xl font-bold" style="color: {$colorStore.text}">{m.customvoice.prefsTitle()}</h3>
          </div>
          <p class="text-sm mb-4" style="color: {$colorStore.muted}">{m.customvoice.prefsText()}</p>

          <form class="flex flex-col sm:flex-row gap-3" onsubmit={(e) => { e.preventDefault(); loadUserPreferences(); }}>
            <input type="text" inputmode="numeric" bind:value={prefUserId} placeholder={m.customvoice.prefsUserIdPlaceholder()} aria-label={m.common.userId()}
                   class="flex-1 p-3 rounded-lg border min-h-[44px]"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            <button type="submit" disabled={prefLoading || !prefUserId.trim()}
                    class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
              {#if prefLoading}<i class="fa-solid fa-spinner fa-spin"></i>{:else}<i class="fa-solid fa-magnifying-glass"></i>{/if}
              {m.common.load()}
            </button>
          </form>

          {#if prefError}
            <div class="mt-4 p-3 rounded-lg flex items-center gap-2 text-sm" role="alert"
                 style="background: #ef444420; border: 1px solid #ef444430; color: #ef4444;">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span>{prefError}</span>
            </div>
          {/if}

          {#if userPrefs}
            <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4" transition:slide>
              <div>
                <label for="pref-name" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.customvoice.prefsName()}</label>
                <input id="pref-name" type="text" bind:value={prefForm.defaultName}
                       oninput={scheduleUserPreferencesSave} onblur={() => autoSave.flush("prefs")} placeholder={m.common.useServerDefault()}
                       class="w-full p-3 rounded-lg border min-h-[44px]"
                       style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
              </div>
              <div>
                <label for="pref-limit" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.defaultUserLimit()}</label>
                <input id="pref-limit" type="number" min="0" max="99" bind:value={prefForm.defaultUserLimit}
                       oninput={scheduleUserPreferencesSave} onblur={() => autoSave.flush("prefs")} placeholder={m.common.serverDefault()}
                       class="w-full p-3 rounded-lg border min-h-[44px]"
                       style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
              </div>
              <div>
                <label for="pref-bitrate" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.customvoice.prefsBitrate()}</label>
                <input id="pref-bitrate" type="number" min="8" max="384" bind:value={prefForm.defaultBitrate}
                       oninput={scheduleUserPreferencesSave} onblur={() => autoSave.flush("prefs")} placeholder={m.common.serverDefault()}
                       class="w-full p-3 rounded-lg border min-h-[44px]"
                       style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
</DashboardPageLayout>