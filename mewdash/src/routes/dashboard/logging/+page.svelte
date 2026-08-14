<!-- routes/dashboard/logging/+page.svelte -->
<script lang="ts">


  import { onMount } from "svelte";
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
    let hasChanges = $state(false);

  // Data
  let config: LoggingConfigurationResponse | null = null;
    let textChannels: Array<{ id: string; name: string }> = $state([]);
    let logChannels: Record<LogType, string | null> = $state({} as any);
    let ignoredChannels: string[] = $state([]);
    let selectedCategory = $state("popular");
    let channelSearchQuery = $state("");
  




  // Categories for organization
  const categories = [
    { id: "popular", name: "Popular", icon: "fa-star" },
    { id: "users", name: "Users", icon: "fa-user-plus" },
    { id: "messages", name: "Messages", icon: "fa-message" },
    { id: "moderation", name: "Moderation", icon: "fa-shield" },
    { id: "server", name: "Server", icon: "fa-server" },
    { id: "channels", name: "Channels", icon: "fa-hashtag" },
    { id: "roles", name: "Roles", icon: "fa-user-tag" },
    { id: "threads", name: "Threads", icon: "fa-comments" },
    { id: "voice", name: "Voice", icon: "fa-microphone" },
    { id: "all", name: "All Events", icon: "fa-file-lines" }
  ];

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

  function markAsChanged() {
    hasChanges = true;
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

    } catch (err) {
      console.error("Failed to load logging data:", err);
      error = err instanceof Error ? err.message : "Failed to load logging data";
      showNotificationMessage("Failed to load logging data", "error");
    } finally {
      loading = false;
    }
  }

  async function saveConfiguration() {
    if (!$currentGuild || !hasChanges) return;

    try {
      // Prepare updates array for bulk update
      const logTypeMappings = [];
      for (const [logType, channelId] of Object.entries(logChannels)) {
        logTypeMappings.push({
          logType: logType,
          channelId: channelId ? BigInt(channelId) : null
        });
      }

      // Save log channels using bulk update endpoint
      await loggingApi.bulkUpdateLogChannels($currentGuild.id, { logTypeMappings });
      
      // Save ignored channels
      await loggingApi.setIgnoredChannels($currentGuild.id, {
        channelIds: ignoredChannels.map(id => BigInt(id))
      });

      hasChanges = false;
      showNotificationMessage("Logging configuration saved successfully!", "success");
      
      // Reload data to get updated config
      await loadData();
    } catch (err) {
      console.error("Failed to save configuration:", err);
      showNotificationMessage("Failed to save configuration", "error");
    }
  }

  async function setLogChannel(logType: LogType, channelId: string | null) {
    logChannels = { ...logChannels, [logType]: channelId };
    markAsChanged();
  }

  function clearCategory(category: string) {
    // Get all log types in this category
    const categoryLogTypes = LOG_TYPE_MAPPINGS
      .filter(mapping => mapping.category === category)
      .map(mapping => mapping.logType);

    // Clear all channels for this category
    const updatedChannels = { ...logChannels };
    for (const logType of categoryLogTypes) {
      updatedChannels[logType] = null;
    }
    logChannels = updatedChannels;
    markAsChanged();
  }

  function clearAllChannels() {
    // Clear all log channels
    const updatedChannels = { ...logChannels };
    for (const mapping of LOG_TYPE_MAPPINGS) {
      updatedChannels[mapping.logType] = null;
    }
    logChannels = updatedChannels;
    markAsChanged();
  }

  function addToIgnored(channelId: string) {
    if (!ignoredChannels.includes(channelId)) {
      ignoredChannels = [...ignoredChannels, channelId];
      markAsChanged();
    }
  }

  function removeFromIgnored(channelId: string) {
    ignoredChannels = ignoredChannels.filter(id => id !== channelId);
    markAsChanged();
  }

  // Event handlers
  onMount(() => {
    loadData();
  });


    // Reactive: logging is enabled if any channels are configured
    let isLoggingEnabled = $derived(Object.values(logChannels).some(channelId => channelId && channelId !== '0'));
    // Tab configuration for DashboardPageLayout
    let tabs = $derived([
        {id: "channels", label: "Log Channels", icon: "fa-hashtag"},
        {id: "ignored", label: `Ignored Channels (${ignoredChannels.length})`, icon: "fa-xmark"}
    ]);
    // Action buttons for save functionality
    let actionButtons = $derived(hasChanges ? [
        {
            label: "Save Configuration",
            icon: "fa-floppy-disk",
            action: saveConfiguration,
          style: `background: ${$colorStore.primary}20; color: ${$colorStore.primary}; border: 1px solid ${$colorStore.primary}30; box-shadow: 0 4px 12px ${$colorStore.primary}15;`
        }
    ] : []);
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
        Logging is active • {Object.values(logChannels).filter(ch => ch && ch !== '0').length} event types configured
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
          <h3 class="font-semibold mb-2" style="color: {$colorStore.text}">Set up Event Logging</h3>
          <p class="text-sm mb-3" style="color: {$colorStore.muted}">
            Track important server events like joins, leaves, message edits, and moderation actions by assigning
            channels below.
          </p>
          <p class="text-xs" style="color: {$colorStore.muted}">
            💡 Start with "User Joined" and "Message Deleted" for basic monitoring
          </p>
        </div>
      </div>
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  bind:activeTab
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-file"
  statusMessages={statusMessagesSnippet}
  subtitle="Configure event logging channels and settings"
  {tabs}
  title="Logging Configuration"
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
            aria-label="Filter by {category.name}"
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
            aria-label="Clear all log channels"
          >
            <i class="fa-solid fa-broom" style="font-size: 14px;"></i>
            <span class="whitespace-nowrap">Clear All</span>
          </button>
        {:else if selectedCategory !== "popular"}
          <button
            class="px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-all hover:scale-[1.02] touch-manipulation ml-auto"
            style="background: #ef444415; color: #ef4444; border: 1px solid #ef444430;"
            onclick={() => clearCategory(selectedCategory)}
            aria-label="Clear all channels in {selectedCategory}"
          >
            <i class="fa-solid fa-broom" style="font-size: 14px;"></i>
            <span class="whitespace-nowrap">Clear Category</span>
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
                    <h3 class="font-medium truncate" style="color: {$colorStore.text}">{mapping.displayName}</h3>
                    <p class="text-sm line-clamp-2" style="color: {$colorStore.muted}">{mapping.description}</p>
                </div>
              </div>

                <div class="w-full sm:w-64 flex-shrink-0">
                <DiscordSelector
                  type="channel"
                  options={textChannels}
                  bind:selected={logChannels[mapping.logType]}
                  placeholder="Select channel..."
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
            <h3 class="text-base sm:text-lg font-bold mb-2" style="color: {$colorStore.text}">Channel Exclusions</h3>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">
              Prevent logging for specific channels like staff rooms, bot commands, or spam channels.
            </p>
            <div class="flex flex-wrap items-center gap-3 sm:gap-4 text-xs" style="color: {$colorStore.muted}">
              <span>💡 <strong>{ignoredChannelList.length}</strong> channels ignored</span>
              <span>📝 <strong>{activeChannelList.length}</strong> channels logged</span>
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
            <h3 class="text-base sm:text-lg font-bold" style="color: {$colorStore.text}">Ignored Channels
              ({ignoredChannelList.length})</h3>
          </div>
          
          {#if ignoredChannelList.length === 0}
            <div class="text-center py-8">
              <i class="fa-utility-duo fa-regular fa-circle-check" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 32px; opacity: 0.5; display: block; margin: 0 auto 12px;"></i>
              <p class="text-sm" style="color: {$colorStore.muted}">
                No channels are ignored. All events will be logged according to your channel configurations.
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
                      aria-label="Enable logging for {channel.name}"
                  >
                    <i class="fa-solid fa-plus" style="font-size: 12px;"></i>
                    <span>Log</span>
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
            <h3 class="text-base sm:text-lg font-bold" style="color: {$colorStore.text}">Active Channels
              ({activeChannelList.length})</h3>
          </div>

          <!-- Search Box -->
          <div class="relative mb-4">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2" style="color: {$colorStore.muted}; font-size: 16px;"></i>
            <input
              type="text"
              placeholder="Search channels..."
              bind:value={channelSearchQuery}
              class="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
          </div>

          {#if activeChannelList.length === 0}
            <div class="text-center py-8">
              <i class="fa-utility-duo fa-regular fa-xmark" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 32px; opacity: 0.5; display: block; margin: 0 auto 12px;"></i>
              <p class="text-sm" style="color: {$colorStore.muted}">
                All channels are ignored. Consider enabling logging for important channels.
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
                      aria-label="Ignore logging for {channel.name}"
                  >
                    <i class="fa-solid fa-xmark" style="font-size: 12px;"></i>
                    <span>Ignore</span>
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