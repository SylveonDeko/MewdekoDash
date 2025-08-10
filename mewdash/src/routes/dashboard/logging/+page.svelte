<!-- routes/dashboard/logging/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { fade, slide } from "svelte/transition";
  import type { PageData } from "./$types";
  import type { 
    LoggingConfigurationResponse,
    LogType,
    LogTypeMapping 
  } from "$lib/types/logging";
  import { LOG_TYPE_MAPPINGS } from "$lib/types/logging";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import { browser } from "$app/environment";
  import { 
    FileText, 
    Settings, 
    Trash2, 
    Edit, 
    UserPlus, 
    UserMinus,
    Ban,
    MessageSquare,
    Hash,
    Mic,
    MicOff,
    Shield,
    AlertTriangle,
    CheckCircle,
    X,
    Plus,
    Save,
    Star,
    Search,
    Trash2 as TrashIcon
  } from "lucide-svelte";
  import { currentInstance } from "$lib/stores/instanceStore";

  export let data: PageData;

  let currentUser = data.user;
  
  // States
  let activeTab: "channels" | "ignored" = "channels";
  let loading = true;
  let error: string | null = null;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let hasChanges = false;

  // Data
  let config: LoggingConfigurationResponse | null = null;
  let textChannels: Array<{ id: string; name: string }> = [];
  let logChannels: Record<LogType, string | null> = {} as any;
  let ignoredChannels: string[] = [];
  let selectedCategory = "popular";
  let channelSearchQuery = "";
  
  // Reactive: logging is enabled if any channels are configured
  $: isLoggingEnabled = Object.values(logChannels).some(channelId => channelId && channelId !== '0');

  // Tab configuration for DashboardPageLayout
  $: tabs = [
    { id: "channels", label: "Log Channels", icon: Hash },
    { id: "ignored", label: `Ignored Channels (${ignoredChannels.length})`, icon: X }
  ];

  // Action buttons for save functionality
  $: actionButtons = hasChanges ? [
    {
      label: "Save Configuration",
      icon: Save,
      action: saveConfiguration,
      style: `background: ${$colorStore.primary}; color: white; box-shadow: 0 4px 12px ${$colorStore.primary}30;`
    }
  ] : [];

  // Handle tab changes from DashboardPageLayout
  function handleTabChange(event: CustomEvent<{tabId: string}>) {
    activeTab = event.detail.tabId as "channels" | "ignored";
  }

  // Categories for organization
  const categories = [
    { id: "popular", name: "Popular", icon: Star },
    { id: "users", name: "Users", icon: UserPlus },
    { id: "messages", name: "Messages", icon: MessageSquare },
    { id: "moderation", name: "Moderation", icon: Shield },
    { id: "server", name: "Server", icon: Hash },
    { id: "voice", name: "Voice", icon: Mic },
    { id: "all", name: "All Events", icon: FileText }
  ];

  // Icon mapping for log types
  const iconMap: Record<string, any> = {
    "trash-2": Trash2,
    "edit": Edit,
    "trash": Trash2,
    "user-plus": UserPlus,
    "user-minus": UserMinus,
    "user": UserPlus,
    "ban": Ban,
    "user-check": CheckCircle,
    "user-x": X,
    "volume-x": MicOff,
    "volume-2": Mic,
    "alert-triangle": AlertTriangle,
    "plus-circle": Plus,
    "minus-circle": X,
    "edit-3": Edit,
    "hash": Hash,
    "settings": Settings,
    "mic": Mic,
    "mic-off": MicOff,
    "move": Edit
  };

  // Popular log types to highlight for new users
  const popularLogTypes = [
    'user_joined', 'user_left', 'message_deleted', 'message_edited', 
    'user_banned', 'user_unbanned', 'channel_created', 'channel_deleted'
  ];

  // Reactive: Filter channels for search
  $: filteredChannels = textChannels.filter(channel => 
    channel.name.toLowerCase().includes(channelSearchQuery.toLowerCase())
  );

  // Reactive: Separate ignored and active channels for better UX
  $: ignoredChannelList = textChannels.filter(channel => ignoredChannels.includes(channel.id));
  $: activeChannelList = textChannels.filter(channel => !ignoredChannels.includes(channel.id));

  $: filteredLogTypes = selectedCategory === "all" 
    ? LOG_TYPE_MAPPINGS 
    : selectedCategory === "popular"
    ? LOG_TYPE_MAPPINGS.filter(mapping => popularLogTypes.includes(mapping.logType))
    : LOG_TYPE_MAPPINGS.filter(mapping => mapping.category === selectedCategory);

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

  function getIconComponent(iconName: string) {
    return iconMap[iconName] || FileText;
  }

  // API Functions
  async function loadData() {
    if (!$currentGuild) return;
    
    loading = true;
    error = null;

    try {
      const [configData, channelsData] = await Promise.all([
        api.getLoggingConfig($currentGuild.id),
        api.getGuildTextChannels($currentGuild.id)
      ]);

      config = configData;
      textChannels = channelsData;

      console.log(configData)
      console.log(channelsData)

      // Convert logChannels to string IDs and initialize missing ones
      logChannels = {} as any;
      for (const mapping of LOG_TYPE_MAPPINGS) {
        // API returns 'logTypes' instead of 'logChannels'
        const channelId = (config.logChannels || config.logTypes)?.[mapping.logType];
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
          LogType: logType,
          ChannelId: channelId ? BigInt(channelId) : null
        });
      }

      // Save log channels using bulk update endpoint
      await api.bulkUpdateLogChannels($currentGuild.id, { logTypeMappings });
      
      // Save ignored channels
      await api.setIgnoredChannels($currentGuild.id, {
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
    logChannels[logType] = channelId;
    markAsChanged();
  }

  function toggleIgnoredChannel(channelId: string) {
    const index = ignoredChannels.indexOf(channelId);
    if (index === -1) {
      ignoredChannels = [...ignoredChannels, channelId];
    } else {
      ignoredChannels = ignoredChannels.filter(id => id !== channelId);
    }
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

  $: if ($currentInstance) {
    loadData();
  }

  $: if ($currentGuild) {
    loadData();
  }
</script>

<DashboardPageLayout 
  title="Logging Configuration"
  subtitle="Configure event logging channels and settings"
  icon={FileText}
  {tabs}
  {activeTab}
  {actionButtons}
  guildName={$currentGuild?.name || "Dashboard"}
  on:tabChange={handleTabChange}
>

  <svelte:fragment slot="status-messages">
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
        <CheckCircle size={16} style="color: #10b981" />
        <span style="color: #10b981">
          Logging is active • {Object.values(logChannels).filter(ch => ch && ch !== '0').length} event types configured
        </span>
      </div>
    {:else}
      <div class="mb-6 p-6 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}10, {$colorStore.secondary}10); border: 1px solid {$colorStore.primary}30;"
           in:fade={{ duration: 300 }}>
        <div class="flex items-start gap-4">
          <FileText size={20} style="color: {$colorStore.primary}" />
          <div>
            <h3 class="font-semibold mb-2" style="color: {$colorStore.text}">Set up Event Logging</h3>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">
              Track important server events like joins, leaves, message edits, and moderation actions by assigning channels below.
            </p>
            <p class="text-xs" style="color: {$colorStore.muted}">
              💡 Start with "User Joined" and "Message Deleted" for basic monitoring
            </p>
          </div>
        </div>
      </div>
    {/if}
  </svelte:fragment>

  <!-- Tab Content -->
  {#if loading}
    <SkeletonLoader />
  {:else if error}
    <div class="rounded-xl border p-6" style="border-color: #ef4444; background: #ef444410;">
      <div class="flex items-center gap-3">
        <AlertTriangle size={20} style="color: #ef4444" />
        <span style="color: #ef4444">{error}</span>
      </div>
    </div>
  {:else if activeTab === 'channels'}
    <div class="space-y-6" transition:fade>
      <!-- Category Filter -->
      <div class="flex flex-wrap gap-2">
        {#each categories as category}
          <button
            class="px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
            style="background: {selectedCategory === category.id ? $colorStore.secondary : `${$colorStore.primary}10`};
                   color: {selectedCategory === category.id ? $colorStore.text : $colorStore.muted};"
            on:click={() => selectedCategory = category.id}
          >
            <svelte:component this={category.icon} size={16} />
            {category.name}
          </button>
        {/each}
      </div>

      <!-- Log Channel Configuration -->
      <div class="grid gap-4">
        {#each filteredLogTypes as mapping (mapping.logType)}
          <div 
            class="rounded-xl border p-4"
            style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;"
            transition:slide
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg" style="background: {$colorStore.primary}20;">
                  <svelte:component this={getIconComponent(mapping.icon)} size={20} style="color: {$colorStore.primary}" />
                </div>
                <div>
                  <h3 class="font-medium" style="color: {$colorStore.text}">{mapping.displayName}</h3>
                  <p class="text-sm" style="color: {$colorStore.muted}">{mapping.description}</p>
                </div>
              </div>
              
              <div class="w-64">
                <DiscordSelector
                  type="channel"
                  options={textChannels}
                  bind:selected={logChannels[mapping.logType]}
                  placeholder="Select channel..."
                  on:change={() => markAsChanged()}
                />
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

  {:else if activeTab === 'ignored'}
    <div class="space-y-6" transition:fade>
      <!-- Info Section -->
      <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <div class="flex items-start gap-4 mb-4">
          <X class="w-5 h-5 mt-1" style="color: {$colorStore.primary}" />
          <div>
            <h3 class="text-lg font-bold mb-2" style="color: {$colorStore.text}">Channel Exclusions</h3>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">
              Prevent logging for specific channels like staff rooms, bot commands, or spam channels.
            </p>
            <div class="flex items-center gap-4 text-xs" style="color: {$colorStore.muted}">
              <span>💡 <strong>{ignoredChannelList.length}</strong> channels ignored</span>
              <span>📝 <strong>{activeChannelList.length}</strong> channels logged</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Currently Ignored Channels -->
        <div class="rounded-xl border p-6" style="border-color: #ef444430; background: #ef444405;">
          <div class="flex items-center gap-3 mb-4">
            <X class="w-5 h-5" style="color: #ef4444" />
            <h3 class="font-bold" style="color: {$colorStore.text}">Ignored Channels ({ignoredChannelList.length})</h3>
          </div>
          
          {#if ignoredChannelList.length === 0}
            <div class="text-center py-8">
              <CheckCircle class="w-8 h-8 mx-auto mb-3" style="color: {$colorStore.primary}50" />
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
                    <Hash size={14} style="color: #ef4444" />
                    <span class="text-sm font-medium" style="color: {$colorStore.text}">#{channel.name}</span>
                  </div>
                  
                  <button 
                    class="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all hover:scale-105"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                    on:click={() => removeFromIgnored(channel.id)}
                  >
                    <Plus size={12} />
                    <span>Log</span>
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Available Channels to Ignore -->
        <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <div class="flex items-center gap-3 mb-4">
            <Hash class="w-5 h-5" style="color: {$colorStore.primary}" />
            <h3 class="font-bold" style="color: {$colorStore.text}">Active Channels ({activeChannelList.length})</h3>
          </div>

          <!-- Search Box -->
          <div class="relative mb-4">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style="color: {$colorStore.muted}" />
            <input
              type="text"
              placeholder="Search channels..."
              bind:value={channelSearchQuery}
              class="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>

          {#if activeChannelList.length === 0}
            <div class="text-center py-8">
              <X class="w-8 h-8 mx-auto mb-3" style="color: {$colorStore.muted}" />
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
                    <Hash size={14} style="color: {$colorStore.primary}" />
                    <span class="text-sm font-medium" style="color: {$colorStore.text}">#{channel.name}</span>
                  </div>
                  
                  <button 
                    class="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all hover:scale-105"
                    style="background: #ef444420; color: #ef4444;"
                    on:click={() => addToIgnored(channel.id)}
                  >
                    <X size={12} />
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