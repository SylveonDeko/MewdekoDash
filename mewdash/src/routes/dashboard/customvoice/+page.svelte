<!-- routes/dashboard/customvoice/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { fade, slide } from "svelte/transition";
  import type { PageData } from "./$types";
  import type { 
    CustomVoiceConfigurationResponse, 
    CustomVoiceChannelResponse,
    CustomVoiceConfigurationRequest 
  } from "$lib/types/customvoice";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import { browser } from "$app/environment";
  import { 
    Mic, 
    Settings, 
    Users, 
    Hash, 
    Volume2, 
    VolumeX, 
    Lock, 
    Unlock,
    Trash2,
    Plus,
    Clock,
    User,
    BarChart3,
    AlertCircle,
    CheckCircle
  } from "lucide-svelte";
  import { currentInstance } from "$lib/stores/instanceStore";

  export let data: PageData;

  let currentUser = data.user;
  
  // States
  let activeTab: "config" | "channels" | "preferences" = "config";
  let loading = true;
  let error: string | null = null;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let isMobile = false;

  // Data
  let config: CustomVoiceConfigurationResponse | null = null;
  let activeChannels: CustomVoiceChannelResponse[] = [];
  let voiceChannels: Array<{ id: string; name: string }> = [];
  let categories: Array<{ id: string; name: string }> = [];
  let hasChanges = false;

  // Form data
  let hubChannelId: string | null = null;
  let categoryId: string | null = null;
  let defaultNameFormat = "{username}'s Channel";
  let defaultUserLimit = 0;
  let defaultBitrate = 64000;
  let deleteWhenEmpty = true;
  let emptyChannelTimeout = 60;
  let allowMultipleChannels = false;
  let allowNameCustomization = true;
  let allowUserLimitCustomization = true;
  let allowBitrateCustomization = false;
  let allowLocking = true;
  let allowUserManagement = true;
  let maxUserLimit = 99;
  let maxBitrate = 384000;
  let persistUserPreferences = true;
  let autoPermission = true;
  let customVoiceAdminRoleId: string | null = null;

  // Computed values
  $: colorVars = `
    --color-primary: ${$colorStore.primary};
    --color-secondary: ${$colorStore.secondary};
    --color-accent: ${$colorStore.accent};
    --color-text: ${$colorStore.text};
    --color-muted: ${$colorStore.muted};
  `;

  $: tabStyle = (isActive: boolean) => `
    background: ${isActive ? $colorStore.primary : `${$colorStore.primary}20`};
    color: ${isActive ? $colorStore.text : $colorStore.muted};
  `;

  // Helper Functions
  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => showNotification = false, 3000);
  }

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  function markAsChanged() {
    hasChanges = true;
  }

  function formatBitrate(bitrate: number): string {
    return `${bitrate / 1000}kbps`;
  }

  function formatChannelType(channel: CustomVoiceChannelResponse): string {
    if (channel.isLocked) return "🔒 Private";
    if (channel.userLimit > 0) return `👥 ${channel.userCount}/${channel.userLimit}`;
    return `👥 ${channel.userCount}`;
  }

  function getTimeAgo(dateString: string): string {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
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

    try {
      const [configData, activeChannelsData, voiceChannelsData, categoriesData] = await Promise.all([
        api.getCustomVoiceConfig($currentGuild.id),
        api.getActiveCustomVoiceChannels($currentGuild.id),
        api.getGuildVoiceChannels($currentGuild.id),
        api.getGuildCategories($currentGuild.id)
      ]);

      config = configData;
      activeChannels = activeChannelsData || [];
      voiceChannels = voiceChannelsData || [];
      categories = categoriesData || [];

      // Populate form data
      if (config && config.enabled) {
        hubChannelId = config.hubVoiceChannelId?.toString() || null;
        categoryId = config.channelCategoryId?.toString() || null;
        defaultNameFormat = config.defaultNameFormat || "{username}'s Channel";
        defaultUserLimit = config.defaultUserLimit || 0;
        defaultBitrate = config.defaultBitrate || 64000;
        deleteWhenEmpty = config.deleteWhenEmpty ?? true;
        emptyChannelTimeout = config.emptyChannelTimeout || 60;
        allowMultipleChannels = config.allowMultipleChannels ?? false;
        allowNameCustomization = config.allowNameCustomization ?? true;
        allowUserLimitCustomization = config.allowUserLimitCustomization ?? true;
        allowBitrateCustomization = config.allowBitrateCustomization ?? false;
        allowLocking = config.allowLocking ?? true;
        allowUserManagement = config.allowUserManagement ?? true;
        maxUserLimit = config.maxUserLimit || 99;
        maxBitrate = config.maxBitrate || 384000;
        persistUserPreferences = config.persistUserPreferences ?? true;
        autoPermission = config.autoPermission ?? true;
        customVoiceAdminRoleId = config.customVoiceAdminRoleId?.toString() || null;
      }

    } catch (err) {
      console.error("Failed to load custom voice data:", err);
      error = err instanceof Error ? err.message : "Failed to load custom voice data";
      showNotificationMessage("Failed to load custom voice data", "error");

      console.log(activeChannels)
    } finally {
      loading = false;
    }
  }

  async function saveConfiguration() {
    if (!$currentGuild || !hasChanges) return;

    try {
      const configData: CustomVoiceConfigurationRequest = {
        hubVoiceChannelId: hubChannelId ? BigInt(hubChannelId) : BigInt(0),
        channelCategoryId: categoryId ? BigInt(categoryId) : BigInt(0),
        defaultNameFormat,
        defaultUserLimit,
        defaultBitrate,
        deleteWhenEmpty,
        emptyChannelTimeout,
        allowMultipleChannels,
        allowNameCustomization,
        allowUserLimitCustomization,
        allowBitrateCustomization,
        allowLocking,
        allowUserManagement,
        maxUserLimit,
        maxBitrate,
        persistUserPreferences,
        autoPermission,
        customVoiceAdminRoleId: customVoiceAdminRoleId ? BigInt(customVoiceAdminRoleId) : null
      };

      await api.updateCustomVoiceConfig($currentGuild.id, configData);
      hasChanges = false;
      showNotificationMessage("Configuration saved successfully!", "success");
      
      // Reload data to get updated config
      await loadData();
    } catch (err) {
      console.error("Failed to save configuration:", err);
      showNotificationMessage("Failed to save configuration", "error");
    }
  }

  async function deleteChannel(channelId: bigint) {
    if (!$currentGuild) return;
    
    try {
      await api.deleteCustomVoiceChannel($currentGuild.id, channelId);
      showNotificationMessage("Channel deleted successfully!", "success");
      
      // Remove from local array
      activeChannels = activeChannels.filter(ch => ch.id !== channelId);
    } catch (err) {
      console.error("Failed to delete channel:", err);
      showNotificationMessage("Failed to delete channel", "error");
    }
  }

  async function lockChannel(channelId: bigint, lock: boolean) {
    if (!$currentGuild) return;
    
    try {
      await api.updateCustomVoiceChannel($currentGuild.id, channelId, { isLocked: lock });
      showNotificationMessage(`Channel ${lock ? 'locked' : 'unlocked'} successfully!`, "success");
      
      // Update local array
      activeChannels = activeChannels.map(ch => 
        ch.id === channelId ? { ...ch, isLocked: lock } : ch
      );
    } catch (err) {
      console.error("Failed to update channel:", err);
      showNotificationMessage("Failed to update channel", "error");
    }
  }

  // Event handlers
  onMount(() => {
    if (browser) {
      checkMobile();
      window.addEventListener("resize", checkMobile);
    }
    
    loadData();

    return () => {
      if (browser) {
        window.removeEventListener("resize", checkMobile);
      }
    };
  });

  $: if ($currentInstance) {
    loadData();
  }

  $: if ($currentGuild) {
    loadData();
  }
</script>

<svelte:head>
  <title>Custom Voice Channels - Dashboard</title>
</svelte:head>

<DashboardPageLayout 
  title="Custom Voice Channels" 
  subtitle="Create and manage temporary voice channels" 
  icon={Mic}
  guildName={$currentGuild?.name || "Dashboard"}
  tabs={[
    { id: "config", label: "Configuration", icon: Settings },
    { id: "channels", label: `Active Channels (${activeChannels.length || 0})`, icon: Mic },
    { id: "preferences", label: "User Preferences", icon: User }
  ]}
  bind:activeTab
  actionButtons={hasChanges ? [
    {
      label: "Save Configuration",
      icon: CheckCircle,
      action: saveConfiguration,
      style: `background: linear-gradient(to right, ${$colorStore.primary}, ${$colorStore.secondary}); color: ${$colorStore.text}; box-shadow: 0 0 20px ${$colorStore.primary}20;`
    }
  ] : []}
>
  <svelte:fragment slot="status-messages">

    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}
    
    {#if config && config.enabled}
      <div class="mb-6 flex items-center gap-2 p-4 rounded-lg" style="background: #22c55e15; border: 1px solid #22c55e30;">
        <CheckCircle size={16} style="color: #22c55e" />
        <span class="text-sm" style="color: #22c55e">Custom Voice is enabled</span>
      </div>
    {:else}
      <div class="mb-6 flex items-center gap-2 p-4 rounded-lg" style="background: #f59e0b15; border: 1px solid #f59e0b30;">
        <AlertCircle size={16} style="color: #f59e0b" />
        <span class="text-sm" style="color: #f59e0b">Custom Voice is not configured</span>
      </div>
    {/if}
  </svelte:fragment>

    <!-- Content -->
    {#if loading}
      <SkeletonLoader />
    {:else if error}
      <div class="rounded-xl border p-6" style="border-color: #ef4444; background: #ef444410;">
        <div class="flex items-center gap-3">
          <AlertCircle size={20} style="color: #ef4444" />
          <span style="color: #ef4444">{error}</span>
        </div>
      </div>
    {:else if activeTab === 'config'}
      <div class="space-y-6" transition:fade>
        <!-- Basic Configuration -->
        <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Basic Configuration</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block mb-2" style="color: {$colorStore.text}">
                Hub Voice Channel <span style="color: #ef4444">*</span>
              </label>
              <DiscordSelector
                type="channel"
                options={voiceChannels}
                bind:selected={hubChannelId}
                placeholder="Select voice channel..."
                on:change={markAsChanged}
              />
              <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                Channel users join to create their own temporary voice channel
              </p>
            </div>

            <div>
              <label class="block mb-2" style="color: {$colorStore.text}">
                Channel Category <span style="color: #ef4444">*</span>
              </label>
              <DiscordSelector
                type="channel"
                options={categories}
                bind:selected={categoryId}
                placeholder="Select category..."
                on:change={markAsChanged}
              />
              <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                Category where temporary channels will be created
              </p>
            </div>
          </div>
        </div>

        <!-- Channel Defaults -->
        <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Channel Defaults</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label class="block mb-2" style="color: {$colorStore.text}">Default Name Format</label>
              <input
                type="text"
                bind:value={defaultNameFormat}
                on:input={markAsChanged}
                class="w-full p-3 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                placeholder="&#123;username&#125;'s Channel"
              />
              <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                Use &#123;username&#125; for the user's name
              </p>
            </div>

            <div>
              <label class="block mb-2" style="color: {$colorStore.text}">Default User Limit</label>
              <input
                type="number"
                bind:value={defaultUserLimit}
                on:input={markAsChanged}
                min="0"
                max="99"
                class="w-full p-3 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              />
              <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                0 = unlimited
              </p>
            </div>

            <div>
              <label class="block mb-2" style="color: {$colorStore.text}">Default Bitrate</label>
              <DiscordSelector
                type="custom"
                customIcon={Volume2}
                options={[
                  { id: "64000", name: "64kbps", label: "64kbps" },
                  { id: "96000", name: "96kbps", label: "96kbps" },
                  { id: "128000", name: "128kbps", label: "128kbps" },
                  { id: "256000", name: "256kbps", label: "256kbps" },
                  { id: "384000", name: "384kbps", label: "384kbps" }
                ]}
                selected={defaultBitrate.toString()}
                placeholder="Select bitrate..."
                searchable={false}
                on:change={(e) => {
                  defaultBitrate = parseInt(e.detail.selected);
                  markAsChanged();
                }}
              />
            </div>
          </div>
        </div>

        <!-- Channel Management -->
        <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Channel Management</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={deleteWhenEmpty}
                  on:change={markAsChanged}
                  class="w-4 h-4"
                />
                <span style="color: {$colorStore.text}">Delete channels when empty</span>
              </label>

              {#if deleteWhenEmpty}
                <div class="ml-7">
                  <label class="block mb-2" style="color: {$colorStore.text}">Empty timeout (seconds)</label>
                  <input
                    type="number"
                    bind:value={emptyChannelTimeout}
                    on:input={markAsChanged}
                    min="5"
                    max="300"
                    class="w-32 p-2 rounded-lg border"
                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                  />
                </div>
              {/if}

              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={allowMultipleChannels}
                  on:change={markAsChanged}
                  class="w-4 h-4"
                />
                <span style="color: {$colorStore.text}">Allow multiple channels per user</span>
              </label>

              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={persistUserPreferences}
                  on:change={markAsChanged}
                  class="w-4 h-4"
                />
                <span style="color: {$colorStore.text}">Remember user preferences</span>
              </label>

              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={autoPermission}
                  on:change={markAsChanged}
                  class="w-4 h-4"
                />
                <span style="color: {$colorStore.text}">Auto-manage channel permissions</span>
              </label>
            </div>

            <div class="space-y-4">
              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={allowNameCustomization}
                  on:change={markAsChanged}
                  class="w-4 h-4"
                />
                <span style="color: {$colorStore.text}">Allow name customization</span>
              </label>

              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={allowUserLimitCustomization}
                  on:change={markAsChanged}
                  class="w-4 h-4"
                />
                <span style="color: {$colorStore.text}">Allow user limit customization</span>
              </label>

              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={allowBitrateCustomization}
                  on:change={markAsChanged}
                  class="w-4 h-4"
                />
                <span style="color: {$colorStore.text}">Allow bitrate customization</span>
              </label>

              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={allowLocking}
                  on:change={markAsChanged}
                  class="w-4 h-4"
                />
                <span style="color: {$colorStore.text}">Allow channel locking</span>
              </label>

              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={allowUserManagement}
                  on:change={markAsChanged}
                  class="w-4 h-4"
                />
                <span style="color: {$colorStore.text}">Allow user management</span>
              </label>
            </div>
          </div>
        </div>

      </div>

    {:else if activeTab === 'channels'}
      <div class="space-y-6" transition:fade>
        {#if activeChannels === undefined || !activeChannels || activeChannels.length === 0}
          <div class="text-center py-12">
            <Mic size={48} style="color: {$colorStore.muted}; margin: 0 auto 16px;" />
            <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text}">No active channels</h3>
            <p style="color: {$colorStore.muted}">Custom voice channels will appear here when users create them</p>
          </div>
        {:else}
          <div class="grid gap-4">
            {#each activeChannels as channel (channel.id)}
              <div 
                class="rounded-xl border p-4 flex items-center justify-between"
                style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;"
                transition:slide
              >
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    {#if channel.isLocked}
                      <Lock size={20} style="color: #f59e0b" />
                    {:else}
                      <Unlock size={20} style="color: {$colorStore.primary}" />
                    {/if}
                    <h3 class="font-medium" style="color: {$colorStore.text}">{channel.channelName}</h3>
                  </div>
                  
                  <div class="flex items-center gap-4 text-sm" style="color: {$colorStore.muted}">
                    <span>Owner: {channel.ownerName}</span>
                    <span>{formatChannelType(channel)}</span>
                    <span>{formatBitrate(channel.bitrate)}</span>
                    <span>{getTimeAgo(channel.createdAt)}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    class="p-2 rounded-lg transition-colors"
                    style="color: {$colorStore.muted}; hover:background: {$colorStore.primary}20;"
                    on:click={() => lockChannel(channel.id, !channel.isLocked)}
                    title={channel.isLocked ? "Unlock channel" : "Lock channel"}
                  >
                    {#if channel.isLocked}
                      <Unlock size={16} />
                    {:else}
                      <Lock size={16} />
                    {/if}
                  </button>
                  
                  <button
                    class="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-500/20"
                    on:click={() => deleteChannel(channel.id)}
                    title="Delete channel"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

    {:else if activeTab === 'preferences'}
      <div class="space-y-6" transition:fade>
        <div class="text-center py-12">
          <User size={48} style="color: {$colorStore.muted}; margin: 0 auto 16px;" />
          <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text}">User Preferences</h3>
          <p style="color: {$colorStore.muted}">Individual user preferences will be displayed here</p>
        </div>
      </div>
    {/if}
</DashboardPageLayout>