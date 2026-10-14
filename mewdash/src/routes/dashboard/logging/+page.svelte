<!-- routes/dashboard/logging/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";


  import { onMount } from "svelte";
  import { logger } from "$lib/logger";
  import {
    clientApi,
    LOG_TYPE_MAPPINGS,
    loggingApi,
    type LoggingConfigurationResponse,
    type LogType
  } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";

  const autoSave = createAutoSave({
    onError: () => showNotificationMessage(m.logging.pageErrorAutosave(), "error")
  });

  interface Props {
        data: PageData;
    }

    let {data}: Props = $props();

  // States
    let activeTab: "channels" | "ignored" = $state("channels");
    let loading = $state(true);
    let error: string | null = $state(null);
    let showNotification = $state(false);
    let notificationMessage = $state("");
    let notificationType: "success" | "error" = $state("success");

  // Data
  let config: LoggingConfigurationResponse | null = null;
    let textChannels: Array<{ id: string; name: string }> = $state([]);
    let logChannels: Record<LogType, string | null> = $state({} as any);
    let ignoredChannels: string[] = $state([]);
    let selectedCategory = $state("popular");
    let channelSearchQuery = $state("");
  




  // Categories for organization
  const categories = $derived([
    { id: "popular", name: m.logging.pageCategoryPopular(), icon: "fa-star" },
    { id: "users", name: m.common.users(), icon: "fa-user-plus" },
    { id: "messages", name: m.common.messages(), icon: "fa-message" },
    { id: "moderation", name: m.features.categoryModeration(), icon: "fa-shield" },
    { id: "server", name: m.features.categoryServer(), icon: "fa-server" },
    { id: "channels", name: m.common.channels(), icon: "fa-hashtag" },
    { id: "roles", name: m.common.roles(), icon: "fa-user-tag" },
    { id: "threads", name: m.common.threads(), icon: "fa-comments" },
    { id: "voice", name: m.features.categoryVoice(), icon: "fa-microphone" },
    { id: "all", name: m.logging.pageCategoryAll(), icon: "fa-file-lines" }
  ]);

  // Icon mapping for log types
  const iconMap: Record<string, string> = {
    "trash-2": "fa-trash",
    "edit": "fa-pen",
    "trash": "fa-trash",
    "user-plus": "fa-user-plus",
    "user-minus": "fa-user-minus",
    "user": "fa-user-plus",
    "ban": "fa-ban",
    "user-check": "fa-user-check",
    "user-x": "fa-xmark",
    "volume-x": "fa-volume-xmark",
    "volume-2": "fa-volume",
    "alert-triangle": "fa-triangle-exclamation",
    "plus-circle": "fa-circle-plus",
    "minus-circle": "fa-circle-minus",
    "edit-3": "fa-pen",
    "hash": "fa-hashtag",
    "settings": "fa-gear",
    "mic": "fa-microphone",
    "mic-off": "fa-microphone-slash",
    "move": "fa-arrows-up-down-left-right"
  };

  // Popular log types to highlight for new users
  const popularLogTypes = [
    "UserJoined", "UserLeft", "MessageDeleted", "MessageUpdated",
    "UserBanned", "UserUnbanned", "ChannelCreated", "ChannelDestroyed"
  ];




  // Helper Functions
  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => showNotification = false, 3000);
  }

  function getIconComponent(iconName: string): string {
    return iconMap[iconName] || "fa-file-lines";
  }

  // API Functions
  async function loadData() {
    if (!$currentGuild) return;
    
    loading = true;
    error = null;

    try {
      const [configData, channelsData] = await Promise.all([
        loggingApi.getLoggingConfig($currentGuild.id),
        clientApi.getTextChannels($currentGuild.id)
      ]);

      config = configData;
      textChannels = channelsData;

      // Convert logChannels to string IDs and initialize missing ones
      logChannels = {} as any;
      for (const mapping of LOG_TYPE_MAPPINGS) {
        const channelId = config.logTypes?.[mapping.logType];
        logChannels[mapping.logType] = channelId ? channelId.toString() : null;
      }

      ignoredChannels = (config.ignoredChannels || []).map(id => id.toString());
      savedLogChannels = { ...logChannels };

    } catch (err) {
      logger.error("Failed to load logging data:", err);
      error = err instanceof Error ? err.message : m.logging.pageErrorLoad();
      showNotificationMessage(m.logging.pageErrorLoad(), "error");
    } finally {
      loading = false;
    }
  }

  /**
   * Saves every log channel assignment. The payload is taken now, not when the save runs,
   * so a save still queued after switching servers cannot carry the new server's state.
   */
  function saveLogChannels(previous: Record<LogType, string | null>) {
    if (!$currentGuild) return;
    const guildId = $currentGuild.id;
    const logTypeMappings = Object.entries(logChannels).map(([logType, channelId]) => ({
      logType,
      channelId: channelId ? BigInt(channelId) : null
    }));
    autoSave.now("channels", async () => {
      try {
        await loggingApi.bulkUpdateLogChannels(guildId, { logTypeMappings });
      } catch (err) {
        if ($currentGuild?.id === guildId) logChannels = previous;
        throw err;
      }
    });
  }

  function saveIgnoredChannels(previous: string[]) {
    if (!$currentGuild) return;
    const guildId = $currentGuild.id;
    const channelIds = ignoredChannels.map(id => BigInt(id));
    autoSave.now("ignored", async () => {
      try {
        await loggingApi.setIgnoredChannels(guildId, { channelIds });
      } catch (err) {
        if ($currentGuild?.id === guildId) ignoredChannels = previous;
        throw err;
      }
    });
  }

  /** Remembers each selector's value before it changes, so a failed save can put it back. */
  let savedLogChannels: Record<LogType, string | null> = {} as any;

  function setLogChannel(logType: LogType, channelId: string | null) {
    const previous = { ...savedLogChannels };
    logChannels = { ...logChannels, [logType]: channelId };
    savedLogChannels = { ...logChannels };
    saveLogChannels(previous);
  }

  async function clearCategory(category: string) {
    const name = categories.find(c => c.id === category)?.name ?? category;
    if (!(await requestConfirmation({
      title: m.logging.pageConfirmClearCategoryTitle({ name }),
      message: m.logging.pageConfirmClearCategoryMessage({ name }),
      confirmText: m.common.clear()
    }))) return;

    // Get all log types in this category
    const categoryLogTypes = LOG_TYPE_MAPPINGS
      .filter(mapping => mapping.category === category)
      .map(mapping => mapping.logType);

    // Clear all channels for this category
    const previous = { ...logChannels };
    const updatedChannels = { ...logChannels };
    for (const logType of categoryLogTypes) {
      updatedChannels[logType] = null;
    }
    logChannels = updatedChannels;
    savedLogChannels = { ...logChannels };
    saveLogChannels(previous);
  }

  async function clearAllChannels() {
    if (!(await requestConfirmation({
      title: m.logging.pageConfirmClearAllTitle(),
      message: m.logging.pageConfirmDisableMessage(),
      confirmText: m.common.clearAll()
    }))) return;
    const previous = { ...logChannels };
    const updatedChannels = { ...logChannels };
    for (const mapping of LOG_TYPE_MAPPINGS) {
      updatedChannels[mapping.logType] = null;
    }
    logChannels = updatedChannels;
    savedLogChannels = { ...logChannels };
    saveLogChannels(previous);
  }

  function addToIgnored(channelId: string) {
    if (!ignoredChannels.includes(channelId)) {
      const previous = [...ignoredChannels];
      ignoredChannels = [...ignoredChannels, channelId];
      saveIgnoredChannels(previous);
    }
  }

  function removeFromIgnored(channelId: string) {
    const previous = [...ignoredChannels];
    ignoredChannels = ignoredChannels.filter(id => id !== channelId);
    saveIgnoredChannels(previous);
  }

  // Event handlers
  onMount(() => {
    loadData();
  });


    // Reactive: logging is enabled if any channels are configured
    let isLoggingEnabled = $derived(Object.values(logChannels).some(channelId => channelId && channelId !== '0'));
    // Tab configuration for DashboardPageLayout
    let tabs = $derived([
        {id: "channels", label: m.common.logChannels(), icon: "fa-hashtag"},
        {id: "ignored", label: m.logging.pageTabIgnored({ count: ignoredChannels.length }), icon: "fa-xmark"}
    ]);
    /** Turns off every log type at once after confirmation */
    async function disableAllLogging() {
        if (!$currentGuild?.id) return;
        if (!(await requestConfirmation({
            title: m.logging.pageConfirmDisableTitle(),
            message: m.logging.pageConfirmDisableMessage(),
            confirmText: m.common.disableAll()
        }))) return;
        try {
            await autoSave.flush();
            await loggingApi.disableAllLogging($currentGuild.id);
            await loadData();
        } catch (err) {
            logger.error("Failed to disable all logging:", err);
            showNotificationMessage(m.logging.pageErrorDisable(), "error");
        }
    }

    let hasAnyLogChannel = $derived(Object.values(logChannels).some(Boolean));

    let actionButtons = $derived([
        ...(hasAnyLogChannel ? [{
            label: m.common.disableAll(),
            icon: "fa-power-off",
            action: disableAllLogging
        }] : [])
    ]);
    // Reactive: Separate ignored and active channels for better UX
    let ignoredChannelList = $derived(textChannels.filter(channel => ignoredChannels.includes(channel.id)));
    let activeChannelList = $derived(textChannels.filter(channel => !ignoredChannels.includes(channel.id)));
    let filteredLogTypes = $derived(selectedCategory === "all"
        ? LOG_TYPE_MAPPINGS
        : selectedCategory === "popular"
            ? LOG_TYPE_MAPPINGS.filter(mapping => popularLogTypes.includes(mapping.logType))
            : LOG_TYPE_MAPPINGS.filter(mapping => mapping.category === selectedCategory));
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

{#snippet statusMessagesSnippet()}
  <!-- Status Messages -->
  {#if showNotification}
    <div class="mb-6" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}

  <!-- Logging Status -->
  {#if isLoggingEnabled}
    <div class="mb-6 p-4 rounded-xl flex items-center gap-3"
         style="background: #10b98120; border: 1px solid #10b98130;"
         in:fade={{ duration: 300 }}>
      <i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 16px;"></i>
      <span style="color: #10b981">
        {m.logging.pageStatusActive({ count: Object.values(logChannels).filter(ch => ch && ch !== '0').length })}
      </span>
    </div>
  {:else}
    <div class="mb-6 p-6 rounded-xl"
         style="background: linear-gradient(135deg, {$colorStore.primary}10, {$colorStore.secondary}10); border: 1px solid {$colorStore.primary}30;"
         in:fade={{ duration: 300 }}>
      <div class="flex items-start gap-4">
        <i class="fa-utility-duo fa-regular fa-file"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
        <div>
          <h3 class="font-semibold mb-2" style="color: {$colorStore.text}">{m.logging.pageSetupTitle()}</h3>
          <p class="text-sm mb-3" style="color: {$colorStore.muted}">
            {m.logging.pageSetupBody()}
          </p>
          <p class="text-xs" style="color: {$colorStore.muted}">
            {m.logging.pageSetupTip()}
          </p>
        </div>
      </div>
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  {autoSave}
  bind:activeTab
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-file"
  statusMessages={statusMessagesSnippet}
  subtitle={m.logging.pageSubtitle()}
  {tabs}
  title={m.logging.pageTitle()}
>

  <!-- Tab Content -->
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
    <div class="space-y-6" transition:fade={{ duration: 200 }}>
      <!-- Category Filter -->
      <div class="flex flex-wrap items-center gap-2 mb-2">
        {#each categories as category}
          <button
            class="px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-all hover:scale-[1.02] touch-manipulation"
            style="background: {selectedCategory === category.id ? `${$colorStore.primary}` : `${$colorStore.primary}15`};
                   color: {selectedCategory === category.id ? 'white' : $colorStore.text};
                   border: 1px solid {selectedCategory === category.id ? $colorStore.primary : `${$colorStore.primary}30`};"
            onclick={() => selectedCategory = category.id}
            aria-label={m.logging.pageFilterAria({ name: category.name })}
          >
            <i class="fa-solid {category.icon}" style="font-size: 14px;"></i>
            <span class="whitespace-nowrap">{category.name}</span>
          </button>
        {/each}

        {#if selectedCategory === "all"}
          <button
            class="px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-all hover:scale-[1.02] touch-manipulation ml-auto"
            style="background: #ef444415; color: #ef4444; border: 1px solid #ef444430;"
            onclick={clearAllChannels}
            aria-label={m.logging.pageClearAllAria()}
          >
            <i class="fa-solid fa-broom" style="font-size: 14px;"></i>
            <span class="whitespace-nowrap">{m.common.clearAll()}</span>
          </button>
        {:else if selectedCategory !== "popular"}
          <button
            class="px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-all hover:scale-[1.02] touch-manipulation ml-auto"
            style="background: #ef444415; color: #ef4444; border: 1px solid #ef444430;"
            onclick={() => clearCategory(selectedCategory)}
            aria-label={m.logging.pageClearCategoryAria({ name: categories.find(c => c.id === selectedCategory)?.name ?? selectedCategory })}
          >
            <i class="fa-solid fa-broom" style="font-size: 14px;"></i>
            <span class="whitespace-nowrap">{m.logging.pageClearCategory()}</span>
          </button>
        {/if}
      </div>

      <!-- Log Channel Configuration -->
      <div class="grid gap-4">
        {#each filteredLogTypes as mapping (mapping.logType)}
            <div
              class="rounded-xl border p-4 transition-all"
            style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;"
          >
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="p-2 rounded-lg flex-shrink-0" style="background: {$colorStore.primary}20;">
                    <i class="fa-solid {getIconComponent(mapping.icon)}" style="color: {$colorStore.primary}; font-size: 20px;"></i>
                </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="font-medium truncate" style="color: {$colorStore.text}">{mapping.displayName()}</h3>
                    <p class="text-sm line-clamp-2" style="color: {$colorStore.muted}">{mapping.description()}</p>
                </div>
              </div>

                <div class="w-full sm:w-64 flex-shrink-0">
                <DiscordSelector
                  type="channel"
                  options={textChannels}
                  bind:selected={logChannels[mapping.logType]}
                  placeholder={m.common.selectChannelPlaceholder()}
                  onchange={() => setLogChannel(mapping.logType, logChannels[mapping.logType])}
                />
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

  {:else if activeTab === 'ignored'}
    <div class="space-y-6" transition:fade={{ duration: 200 }}>
      <!-- Info Section -->
      <div class="rounded-xl border p-4 sm:p-6"
           style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <div class="flex items-start gap-3 sm:gap-4 mb-4">
          <i class="fa-solid fa-xmark mt-1 flex-shrink-0" style="color: {$colorStore.primary}; font-size: 18px;"></i>
          <div class="min-w-0 flex-1">
            <h3 class="text-base sm:text-lg font-bold mb-2" style="color: {$colorStore.text}">{m.logging.pageExclusionsTitle()}</h3>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">
              {m.logging.pageExclusionsBody()}
            </p>
            <div class="flex flex-wrap items-center gap-3 sm:gap-4 text-xs" style="color: {$colorStore.muted}">
              <span>{@html m.logging.pageExclusionsIgnoredCount({ count: ignoredChannelList.length })}</span>
              <span>{@html m.logging.pageExclusionsLoggedCount({ count: activeChannelList.length })}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Currently Ignored Channels -->
        <div class="rounded-xl border p-4 sm:p-6 transition-all"
               style="border-color: #ef444430; background: #ef444405;">
          <div class="flex items-center gap-3 mb-4">
            <i class="fa-solid fa-xmark" style="color: #ef4444; font-size: 18px;"></i>
            <h3 class="text-base sm:text-lg font-bold" style="color: {$colorStore.text}">{m.logging.pageTabIgnored({ count: ignoredChannelList.length })}</h3>
          </div>
          
          {#if ignoredChannelList.length === 0}
            <div class="text-center py-8">
              <i class="fa-utility-duo fa-regular fa-circle-check" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 32px; opacity: 0.5; display: block; margin: 0 auto 12px;"></i>
              <p class="text-sm" style="color: {$colorStore.muted}">
                {m.logging.pageIgnoredEmpty()}
              </p>
            </div>
          {:else}
            <div class="space-y-2 max-h-64 overflow-y-auto">
              {#each ignoredChannelList as channel}
                <div class="flex items-center justify-between p-3 rounded-lg" 
                     style="background: #ef444410; border: 1px solid #ef444420;">
                  <div class="flex items-center gap-3">
                    <i class="fa-solid fa-hashtag" style="color: #ef4444; font-size: 14px;"></i>
                    <span class="text-sm font-medium" style="color: {$colorStore.text}">#{channel.name}</span>
                  </div>

                    <button
                      class="flex items-center gap-1 px-3 py-2 rounded-lg text-xs sm:text-sm transition-all hover:scale-[1.02] touch-manipulation"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                    onclick={() => removeFromIgnored(channel.id)}
                      aria-label={m.logging.pageEnableLoggingAria({ name: channel.name })}
                  >
                    <i class="fa-solid fa-plus" style="font-size: 12px;"></i>
                    <span>{m.logging.pageEnableLogging()}</span>
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Available Channels to Ignore -->
        <div class="rounded-xl border p-4 sm:p-6 transition-all"
               style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <div class="flex items-center gap-3 mb-4">
            <i class="fa-utility-duo fa-regular fa-square"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
            <h3 class="text-base sm:text-lg font-bold" style="color: {$colorStore.text}">{m.common.activeChannelsCount({ count: activeChannelList.length })}</h3>
          </div>

          <!-- Search Box -->
          <div class="relative mb-4">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2" style="color: {$colorStore.muted}; font-size: 16px;"></i>
            <input
              type="text"
              placeholder={m.logging.pageSearchChannelsPlaceholder()}
              bind:value={channelSearchQuery}
              class="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
          </div>

          {#if activeChannelList.length === 0}
            <div class="text-center py-8">
              <i class="fa-utility-duo fa-regular fa-xmark" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 32px; opacity: 0.5; display: block; margin: 0 auto 12px;"></i>
              <p class="text-sm" style="color: {$colorStore.muted}">
                {m.logging.pageActiveEmpty()}
              </p>
            </div>
          {:else}
            <div class="space-y-2 max-h-64 overflow-y-auto">
              {#each activeChannelList.filter(ch => ch.name.toLowerCase().includes(channelSearchQuery.toLowerCase())) as channel}
                <div class="flex items-center justify-between p-3 rounded-lg" 
                     style="background: {$colorStore.primary}08;">
                  <div class="flex items-center gap-3">
                    <i class="fa-solid fa-hashtag" style="color: {$colorStore.primary}; font-size: 14px;"></i>
                    <span class="text-sm font-medium" style="color: {$colorStore.text}">#{channel.name}</span>
                  </div>

                    <button
                      class="flex items-center gap-1 px-3 py-2 rounded-lg text-xs sm:text-sm transition-all hover:scale-[1.02] touch-manipulation"
                    style="background: #ef444420; color: #ef4444;"
                    onclick={() => addToIgnored(channel.id)}
                      aria-label={m.logging.pageIgnoreLoggingAria({ name: channel.name })}
                  >
                    <i class="fa-solid fa-xmark" style="font-size: 12px;"></i>
                    <span>{m.logging.pageIgnore()}</span>
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

</DashboardPageLayout>