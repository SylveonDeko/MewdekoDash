<!-- routes/dashboard/counting/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { fade, slide } from "svelte/transition";
  import type { PageData } from "./$types";
  import {
      type CountingChannelResponse,
      type CountingConfigResponse,
      type CountingStatsResponse,
      type CountingUserStatsResponse,
      type SavePointResponse,
      type SetupCountingChannelRequest,
      type UpdateCountingConfigRequest,
      type LeaderboardType,
      type ResetCountingChannelRequest,
      type CreateSavePointRequest, CountingPattern
  } from "$lib/types/counting";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import { browser } from "$app/environment";
  import { 
    Hash, 
    Settings, 
    Users, 
    BarChart3, 
    Trophy,
    AlertCircle,
    CheckCircle,
    Plus,
    Trash2,
    RotateCcw,
    Save,
    Play,
    Pause,
    Clock,
    Target,
    TrendingUp,
    User,
    Crown,
    Zap,
    Shield,
    MessageSquare,
    Eye,
    EyeOff,
    Ban,
    Archive,
    Milestone
  } from "lucide-svelte";
  import { currentInstance } from "$lib/stores/instanceStore";

  export let data: PageData;

  let currentUser = data.user;
  
  // States
  let activeTab: "channels" | "config" | "stats" | "leaderboard" | "management" = "channels";
  let loading = true;
  let error: string | null = null;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let isMobile = false;
  let hasChanges = false;

  // Data
  let countingChannels: CountingChannelResponse[] = [];
  let selectedChannel: CountingChannelResponse | null = null;
  let channelConfig: CountingConfigResponse | null = null;
  let channelStats: CountingStatsResponse | null = null;
  let leaderboard: CountingUserStatsResponse[] = [];
  let savePoints: SavePointResponse[] = [];
  let textChannels: Array<{ id: string; name: string }> = [];

  // Form data for new channel setup
  let setupChannelId: string | null = null;
  let setupStartNumber = 1;
  let setupIncrement = 1;

  // Config form data
  let allowRepeatedUsers = false;
  let cooldown = 0;
  let requiredRoles = "";
  let bannedRoles = "";
  let maxNumber = 0;
  let resetOnError = true;
  let deleteWrongMessages = true;
  let pattern = CountingPattern.Normal;
  let numberBase = 10;
  let successEmote = "";
  let errorEmote = "";
  let enableAchievements = true;
  let enableCompetitions = false;

  // Leaderboard settings
  let leaderboardType = "contributions";
  let leaderboardLimit = 20;

  // Reset form
  let resetNumber = 1;
  let resetReason = "";

  // Save point form
  let saveReason = "";

  // Computed values
  $: colorVars = `
    --color-primary: ${$colorStore.primary};
    --color-secondary: ${$colorStore.secondary};
    --color-accent: ${$colorStore.accent};
    --color-text: ${$colorStore.text};
    --color-muted: ${$colorStore.muted};
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

  function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }

  function formatPattern(pattern: CountingPattern): string {
    switch (pattern) {
      case CountingPattern.Normal: return "Normal (1, 2, 3...)";
      case CountingPattern.Roman: return "Roman (I, II, III...)";
      case CountingPattern.Binary: return "Binary (1, 10, 11...)";
      case CountingPattern.Hexadecimal: return "Hexadecimal (1, 2... A, B...)";
      case CountingPattern.Words: return "Words (one, two, three...)";
      case CountingPattern.Ordinal: return "Ordinal (1st, 2nd, 3rd...)";
      case CountingPattern.Fibonacci: return "Fibonacci (1, 1, 2, 3, 5...)";
      case CountingPattern.Primes: return "Primes (2, 3, 5, 7...)";
      case CountingPattern.Custom: return "Custom Pattern";
      default: return "Unknown";
    }
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

  function getChannelStatus(channel: CountingChannelResponse): { color: string; text: string } {
    if (!channel.isActive) return { color: "#ef4444", text: "Inactive" };
    if (channel.currentNumber === channel.highestNumber) return { color: "#22c55e", text: "Active - Record High" };
    return { color: "#3b82f6", text: "Active" };
  }

  // API Functions
  async function loadData() {
    if (!$currentGuild) return;
    
    loading = true;
    error = null;
    countingChannels = [];
    textChannels = [];

    try {
      const [channelsData, textChannelsData] = await Promise.all([
        api.getCountingChannels($currentGuild.id),
        api.getGuildTextChannels($currentGuild.id)
      ]);

      countingChannels = channelsData || [];
      textChannels = textChannelsData || [];

      // Load config and stats for selected channel
      if (selectedChannel) {
        await loadChannelDetails(selectedChannel.channelId);
      }

    } catch (err) {
      console.error("Failed to load counting data:", err);
      error = err instanceof Error ? err.message : "Failed to load counting data";
      showNotificationMessage("Failed to load counting data", "error");
    } finally {
      loading = false;
    }
  }

  async function loadChannelDetails(channelId: bigint) {
    if (!$currentGuild) return;
    
    try {
      const [configData, statsData, savePointsData] = await Promise.all([
        api.getCountingChannelConfig($currentGuild.id, channelId).catch(() => null),
        api.getCountingChannelStats($currentGuild.id, channelId).catch(() => null),
        api.getCountingSavePoints($currentGuild.id, channelId).catch(() => [])
      ]);

      channelConfig = configData;
      channelStats = statsData;
      savePoints = savePointsData || [];

      // Populate form data from config
      if (channelConfig) {
        allowRepeatedUsers = channelConfig.allowRepeatedUsers;
        cooldown = channelConfig.cooldown;
        requiredRoles = channelConfig.requiredRoles || "";
        bannedRoles = channelConfig.bannedRoles || "";
        maxNumber = channelConfig.maxNumber;
        resetOnError = channelConfig.resetOnError;
        deleteWrongMessages = channelConfig.deleteWrongMessages;
        pattern = channelConfig.pattern;
        numberBase = channelConfig.numberBase;
        successEmote = channelConfig.successEmote || "";
        errorEmote = channelConfig.errorEmote || "";
        enableAchievements = channelConfig.enableAchievements;
        enableCompetitions = channelConfig.enableCompetitions;
      }

      hasChanges = false;
    } catch (err) {
      console.error("Failed to load channel details:", err);
      showNotificationMessage("Failed to load channel details", "error");
    }
  }

  async function loadLeaderboard() {
    if (!selectedChannel || !$currentGuild) return;
    
    try {
      const leaderboardData = await api.getCountingChannelLeaderboard(
        $currentGuild.id,
        selectedChannel.channelId,
        leaderboardType,
        leaderboardLimit
      );
      leaderboard = leaderboardData.entries || [];
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
      showNotificationMessage("Failed to load leaderboard", "error");
    }
  }

  async function setupChannel() {
    if (!$currentGuild || !setupChannelId) return;

    try {
      const request: SetupCountingChannelRequest = {
        startNumber: setupStartNumber,
        increment: setupIncrement
      };

      const newChannel = await api.setupCountingChannel($currentGuild.id, BigInt(setupChannelId), request);
      showNotificationMessage("Counting channel setup successfully!", "success");
      
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
      console.error("Failed to setup counting channel:", err);
      showNotificationMessage("Failed to setup counting channel", "error");
    }
  }

  async function saveConfiguration() {
    if (!selectedChannel || !$currentGuild || !hasChanges) return;

    try {
      const request: UpdateCountingConfigRequest = {
        allowRepeatedUsers,
        cooldown,
        requiredRoles: requiredRoles || undefined,
        bannedRoles: bannedRoles || undefined,
        maxNumber: maxNumber || undefined,
        resetOnError,
        deleteWrongMessages,
        pattern,
        numberBase,
        successEmote: successEmote || undefined,
        errorEmote: errorEmote || undefined,
        enableAchievements,
        enableCompetitions
      };

      await api.updateCountingChannelConfig($currentGuild.id, selectedChannel.channelId, request);
      hasChanges = false;
      showNotificationMessage("Configuration saved successfully!", "success");
      
      // Reload channel details
      await loadChannelDetails(selectedChannel.channelId);
    } catch (err) {
      console.error("Failed to save configuration:", err);
      showNotificationMessage("Failed to save configuration", "error");
    }
  }

  async function resetChannel() {
    if (!selectedChannel || !$currentGuild || !currentUser) return;

    try {
      const request: ResetCountingChannelRequest = {
        newNumber: resetNumber,
        userId: BigInt(currentUser.id),
        reason: resetReason || undefined
      };

      await api.resetCountingChannel($currentGuild.id, selectedChannel.channelId, request);
      showNotificationMessage(`Channel reset to ${resetNumber} successfully!`, "success");
      
      // Reload data
      await loadData();
      await loadChannelDetails(selectedChannel.channelId);
      
      // Reset form
      resetNumber = 1;
      resetReason = "";
    } catch (err) {
      console.error("Failed to reset channel:", err);
      showNotificationMessage("Failed to reset channel", "error");
    }
  }

  async function createSavePoint() {
    if (!selectedChannel || !$currentGuild || !currentUser) return;

    try {
      const request: CreateSavePointRequest = {
        userId: BigInt(currentUser.id),
        reason: saveReason || undefined
      };

      await api.createCountingSavePoint($currentGuild.id, selectedChannel.channelId, request);
      showNotificationMessage("Save point created successfully!", "success");
      
      // Reload save points
      const savePointsData = await api.getCountingSavePoints($currentGuild.id, selectedChannel.channelId);
      savePoints = savePointsData || [];
      
      // Reset form
      saveReason = "";
    } catch (err) {
      console.error("Failed to create save point:", err);
      showNotificationMessage("Failed to create save point", "error");
    }
  }

  async function disableChannel(channel: CountingChannelResponse) {
    if (!$currentGuild || !currentUser) return;
    
    try {
      await api.disableCountingChannel($currentGuild.id, channel.channelId, BigInt(currentUser.id));
      showNotificationMessage("Channel disabled successfully!", "success");
      
      // Reload data
      await loadData();
      
      // Clear selection if disabled channel was selected
      if (selectedChannel?.channelId === channel.channelId) {
        selectedChannel = null;
      }
    } catch (err) {
      console.error("Failed to disable channel:", err);
      showNotificationMessage("Failed to disable channel", "error");
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

  $: if (activeTab === "leaderboard" && selectedChannel) {
    loadLeaderboard();
  }
</script>

<svelte:head>
  <title>Counting Channels - Dashboard</title>
</svelte:head>

<DashboardPageLayout 
  title="Counting Channels" 
  subtitle="Manage counting games and competitions in your server" 
  icon={Hash}
  guildName={$currentGuild?.name || "Dashboard"}
  tabs={[
    { id: "channels", label: `Channels (${countingChannels.length || 0})`, icon: Hash },
    { id: "config", label: "Configuration", icon: Settings, disabled: !selectedChannel },
    { id: "stats", label: "Statistics", icon: BarChart3, disabled: !selectedChannel },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, disabled: !selectedChannel },
    { id: "management", label: "Management", icon: Shield, disabled: !selectedChannel }
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
    
    {#if selectedChannel}
      <div class="mb-6 flex items-center gap-2 p-4 rounded-lg" style="background: {getChannelStatus(selectedChannel).color}15; border: 1px solid {getChannelStatus(selectedChannel).color}30;">
        <CheckCircle size={16} style="color: {getChannelStatus(selectedChannel).color}" />
        <span class="text-sm" style="color: {getChannelStatus(selectedChannel).color}">
          Selected: #{selectedChannel.channelName} - {getChannelStatus(selectedChannel).text}
        </span>
      </div>
    {:else if countingChannels.length === 0}
      <div class="mb-6 flex items-center gap-2 p-4 rounded-lg" style="background: #f59e0b15; border: 1px solid #f59e0b30;">
        <AlertCircle size={16} style="color: #f59e0b" />
        <span class="text-sm" style="color: #f59e0b">No counting channels configured</span>
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
  {:else if activeTab === 'channels'}
    <div class="space-y-6" transition:fade>
      <!-- Setup New Channel -->
      <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Setup New Counting Channel</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block mb-2" style="color: {$colorStore.text}">
              Channel <span style="color: #ef4444">*</span>
            </label>
            <DiscordSelector
              type="channel"
              options={textChannels}
              bind:selected={setupChannelId}
              placeholder="Select channel..."
            />
          </div>
          
          <div>
            <label class="block mb-2" style="color: {$colorStore.text}">Start Number</label>
            <input
              type="number"
              bind:value={setupStartNumber}
              min="0"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>
          
          <div>
            <label class="block mb-2" style="color: {$colorStore.text}">Increment</label>
            <input
              type="number"
              bind:value={setupIncrement}
              min="1"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>
        </div>
        
        <button
          class="mt-4 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
          on:click={setupChannel}
          disabled={!setupChannelId}
        >
          <Plus size={16} />
          Setup Channel
        </button>
      </div>

      <!-- Existing Channels -->
      {#if countingChannels.length === 0}
        <div class="text-center py-12">
          <Hash size={48} style="color: {$colorStore.muted}; margin: 0 auto 16px;" />
          <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text}">No counting channels</h3>
          <p style="color: {$colorStore.muted}">Setup your first counting channel to get started</p>
        </div>
      {:else}
        <div class="grid gap-4">
          {#each countingChannels as channel (channel.id)}
            <div 
              class="rounded-xl border p-4 cursor-pointer transition-all hover:scale-[1.02]"
              style="border-color: {selectedChannel?.id === channel.id ? $colorStore.primary : $colorStore.primary + '30'}; background: {selectedChannel?.id === channel.id ? $colorStore.primary + '15' : $colorStore.primary + '05'};"
              on:click={() => {
                selectedChannel = channel;
                activeTab = "config";
                loadChannelDetails(channel.channelId);
              }}
              transition:slide
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <Hash size={20} style="color: {$colorStore.primary}" />
                    <h3 class="font-medium" style="color: {$colorStore.text}">{channel.channelName}</h3>
                    <span class="px-2 py-1 rounded-full text-xs" style="background: {getChannelStatus(channel).color}20; color: {getChannelStatus(channel).color};">
                      {getChannelStatus(channel).text}
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-4 text-sm" style="color: {$colorStore.muted}">
                    <span>Current: {formatNumber(channel.currentNumber)}</span>
                    <span>Highest: {formatNumber(channel.highestNumber)}</span>
                    <span>Total: {formatNumber(channel.totalCounts)}</span>
                    {#if channel.lastUsername}
                      <span>Last: {channel.lastUsername}</span>
                    {/if}
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    class="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-500/20"
                    on:click|stopPropagation={() => disableChannel(channel)}
                    title="Disable channel"
                  >
                    <Trash2 size={16} />
                  </button>
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
      <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Basic Settings</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label class="block mb-2" style="color: {$colorStore.text}">Counting Pattern</label>
            <DiscordSelector
              type="custom"
              customIcon={Hash}
              options={[
                { id: "0", name: "Normal (1, 2, 3...)", label: "Normal" },
                { id: "1", name: "Roman (I, II, III...)", label: "Roman" },
                { id: "2", name: "Binary (1, 10, 11...)", label: "Binary" },
                { id: "3", name: "Hexadecimal (1, 2... A, B...)", label: "Hex" },
                { id: "4", name: "Words (one, two, three...)", label: "Words" },
                { id: "5", name: "Ordinal (1st, 2nd, 3rd...)", label: "Ordinal" },
                { id: "6", name: "Fibonacci (1, 1, 2, 3, 5...)", label: "Fibonacci" },
                { id: "7", name: "Primes (2, 3, 5, 7...)", label: "Primes" }
              ]}
              selected={pattern.toString()}
              placeholder="Select pattern..."
              searchable={false}
              on:change={(e) => {
                pattern = parseInt(e.detail.selected);
                markAsChanged();
              }}
            />
          </div>

          <div>
            <label class="block mb-2" style="color: {$colorStore.text}">Number Base</label>
            <input
              type="number"
              bind:value={numberBase}
              on:input={markAsChanged}
              min="2"
              max="36"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
            <p class="text-sm mt-1" style="color: {$colorStore.muted}">2-36 (10 for decimal)</p>
          </div>

          <div>
            <label class="block mb-2" style="color: {$colorStore.text}">Cooldown (seconds)</label>
            <input
              type="number"
              bind:value={cooldown}
              on:input={markAsChanged}
              min="0"
              max="300"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>

          <div>
            <label class="block mb-2" style="color: {$colorStore.text}">Max Number</label>
            <input
              type="number"
              bind:value={maxNumber}
              on:input={markAsChanged}
              min="0"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
            <p class="text-sm mt-1" style="color: {$colorStore.muted}">0 = unlimited</p>
          </div>

          <div>
            <label class="block mb-2" style="color: {$colorStore.text}">Success Emote</label>
            <input
              type="text"
              bind:value={successEmote}
              on:input={markAsChanged}
              placeholder="✅"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>

          <div>
            <label class="block mb-2" style="color: {$colorStore.text}">Error Emote</label>
            <input
              type="text"
              bind:value={errorEmote}
              on:input={markAsChanged}
              placeholder="❌"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>
        </div>
      </div>

      <!-- Behavior Settings -->
      <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Behavior Settings</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <label class="flex items-center gap-3">
              <input
                type="checkbox"
                bind:checked={allowRepeatedUsers}
                on:change={markAsChanged}
                class="w-4 h-4"
              />
              <span style="color: {$colorStore.text}">Allow repeated users</span>
            </label>

            <label class="flex items-center gap-3">
              <input
                type="checkbox"
                bind:checked={resetOnError}
                on:change={markAsChanged}
                class="w-4 h-4"
              />
              <span style="color: {$colorStore.text}">Reset count on error</span>
            </label>

            <label class="flex items-center gap-3">
              <input
                type="checkbox"
                bind:checked={deleteWrongMessages}
                on:change={markAsChanged}
                class="w-4 h-4"
              />
              <span style="color: {$colorStore.text}">Delete wrong messages</span>
            </label>
          </div>

          <div class="space-y-4">
            <label class="flex items-center gap-3">
              <input
                type="checkbox"
                bind:checked={enableAchievements}
                on:change={markAsChanged}
                class="w-4 h-4"
              />
              <span style="color: {$colorStore.text}">Enable achievements</span>
            </label>

            <label class="flex items-center gap-3">
              <input
                type="checkbox"
                bind:checked={enableCompetitions}
                on:change={markAsChanged}
                class="w-4 h-4"
              />
              <span style="color: {$colorStore.text}">Enable competitions</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Role Restrictions -->
      <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Role Restrictions</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block mb-2" style="color: {$colorStore.text}">Required Roles</label>
            <input
              type="text"
              bind:value={requiredRoles}
              on:input={markAsChanged}
              placeholder="Comma-separated role IDs"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
            <p class="text-sm mt-1" style="color: {$colorStore.muted}">Users must have one of these roles</p>
          </div>

          <div>
            <label class="block mb-2" style="color: {$colorStore.text}">Banned Roles</label>
            <input
              type="text"
              bind:value={bannedRoles}
              on:input={markAsChanged}
              placeholder="Comma-separated role IDs"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
            <p class="text-sm mt-1" style="color: {$colorStore.muted}">Users with these roles cannot count</p>
          </div>
        </div>
      </div>
    </div>

  {:else if activeTab === 'stats' && selectedChannel && channelStats}
    <div class="space-y-6" transition:fade>
      <!-- Overview Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="rounded-xl border p-4" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm" style="color: {$colorStore.muted}">Current Number</p>
              <p class="text-2xl font-bold" style="color: {$colorStore.text}">{formatNumber(channelStats.channel.currentNumber)}</p>
            </div>
            <Hash size={24} style="color: {$colorStore.primary}" />
          </div>
        </div>

        <div class="rounded-xl border p-4" style="border-color: {$colorStore.secondary}30; background: {$colorStore.secondary}05;">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm" style="color: {$colorStore.muted}">Total Participants</p>
              <p class="text-2xl font-bold" style="color: {$colorStore.text}">{formatNumber(channelStats.totalParticipants)}</p>
            </div>
            <Users size={24} style="color: {$colorStore.secondary}" />
          </div>
        </div>

        <div class="rounded-xl border p-4" style="border-color: {$colorStore.accent}30; background: {$colorStore.accent}05;">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm" style="color: {$colorStore.muted}">Average Accuracy</p>
              <p class="text-2xl font-bold" style="color: {$colorStore.text}">{channelStats.averageAccuracy.toFixed(1)}%</p>
            </div>
            <Target size={24} style="color: {$colorStore.accent}" />
          </div>
        </div>

        <div class="rounded-xl border p-4" style="border-color: #ef444430; background: #ef444405;">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm" style="color: {$colorStore.muted}">Total Errors</p>
              <p class="text-2xl font-bold" style="color: {$colorStore.text}">{formatNumber(channelStats.totalErrors)}</p>
            </div>
            <AlertCircle size={24} style="color: #ef4444" />
          </div>
        </div>
      </div>

      <!-- Top Contributor -->
      {#if channelStats.topContributor}
        <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Top Contributor</h3>
          
          <div class="flex items-center gap-4">
            {#if channelStats.topContributor.avatarUrl}
              <img src={channelStats.topContributor.avatarUrl} alt="Avatar" class="w-12 h-12 rounded-full" />
            {:else}
              <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background: {$colorStore.primary}20;">
                <User size={20} style="color: {$colorStore.primary}" />
              </div>
            {/if}
            
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <Crown size={16} style="color: #fbbf24" />
                <span class="font-bold" style="color: {$colorStore.text}">
                  {channelStats.topContributor.username || "Unknown User"}
                </span>
                {#if channelStats.topContributor.rank}
                  <span class="px-2 py-1 rounded-full text-xs" style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
                    Rank #{channelStats.topContributor.rank}
                  </span>
                {/if}
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm" style="color: {$colorStore.muted}">
                <span>Contributions: {formatNumber(channelStats.topContributor.contributionsCount)}</span>
                <span>Best Streak: {formatNumber(channelStats.topContributor.highestStreak)}</span>
                <span>Accuracy: {channelStats.topContributor.accuracy.toFixed(1)}%</span>
                <span>Numbers Counted: {formatNumber(channelStats.topContributor.totalNumbersCounted)}</span>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Milestones -->
      <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Milestones</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center">
            <Milestone size={32} style="color: {$colorStore.primary}; margin: 0 auto 8px;" />
            <p class="text-sm" style="color: {$colorStore.muted}">Milestones Reached</p>
            <p class="text-xl font-bold" style="color: {$colorStore.text}">{formatNumber(channelStats.milestonesReached)}</p>
          </div>
          
          <div class="text-center">
            <TrendingUp size={32} style="color: {$colorStore.secondary}; margin: 0 auto 8px;" />
            <p class="text-sm" style="color: {$colorStore.muted}">Highest Number</p>
            <p class="text-xl font-bold" style="color: {$colorStore.text}">{formatNumber(channelStats.channel.highestNumber)}</p>
          </div>
          
          <div class="text-center">
            <Clock size={32} style="color: {$colorStore.accent}; margin: 0 auto 8px;" />
            <p class="text-sm" style="color: {$colorStore.muted}">Last Activity</p>
            <p class="text-xl font-bold" style="color: {$colorStore.text}">
              {channelStats.lastActivity ? getTimeAgo(channelStats.lastActivity) : "Never"}
            </p>
          </div>
        </div>
      </div>
    </div>

  {:else if activeTab === 'leaderboard' && selectedChannel}
    <div class="space-y-6" transition:fade>
      <!-- Leaderboard Controls -->
      <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <div class="flex items-center gap-4 mb-4">
          <h3 class="text-xl font-bold" style="color: {$colorStore.text}">Leaderboard Settings</h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block mb-2" style="color: {$colorStore.text}">Sort By</label>
            <DiscordSelector
              type="custom"
              customIcon={Trophy}
              options={[
                { id: "contributions", name: "Contributions", label: "Contributions" },
                { id: "streak", name: "Highest Streak", label: "Streak" },
                { id: "accuracy", name: "Accuracy", label: "Accuracy" },
                { id: "totalnumbers", name: "Total Numbers", label: "Total Numbers" }
              ]}
              selected={leaderboardType}
              placeholder="Select sort type..."
              searchable={false}
              on:change={(e) => {
                leaderboardType = e.detail.selected;
                loadLeaderboard();
              }}
            />
          </div>
          
          <div>
            <label class="block mb-2" style="color: {$colorStore.text}">Limit</label>
            <input
              type="number"
              bind:value={leaderboardLimit}
              on:change={loadLeaderboard}
              min="5"
              max="100"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>
        </div>
      </div>

      <!-- Leaderboard -->
      {#if leaderboard.length === 0}
        <div class="text-center py-12">
          <Trophy size={48} style="color: {$colorStore.muted}; margin: 0 auto 16px;" />
          <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text}">No leaderboard data</h3>
          <p style="color: {$colorStore.muted}">No users have participated in counting yet</p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each leaderboard as entry, index (entry.userId)}
            <div 
              class="rounded-xl border p-4 flex items-center gap-4"
              style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;"
              transition:slide={{ delay: index * 50 }}
            >
              <!-- Rank -->
              <div class="text-center min-w-[3rem]">
                <div class="text-2xl font-bold" style="color: {$colorStore.text}">
                  {#if index === 0}
                    <Crown size={24} style="color: #fbbf24;" />
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
              <div class="min-w-[3rem]">
                {#if entry.avatarUrl}
                  <img src={entry.avatarUrl} alt="Avatar" class="w-12 h-12 rounded-full" />
                {:else}
                  <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background: {$colorStore.primary}20;">
                    <User size={20} style="color: {$colorStore.primary}" />
                  </div>
                {/if}
              </div>

              <!-- User Info -->
              <div class="flex-1">
                <h4 class="font-bold" style="color: {$colorStore.text}">
                  {entry.username || "Unknown User"}
                </h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm" style="color: {$colorStore.muted}">
                  <span>Contributions: {formatNumber(entry.contributionsCount)}</span>
                  <span>Best Streak: {formatNumber(entry.highestStreak)}</span>
                  <span>Accuracy: {entry.accuracy.toFixed(1)}%</span>
                  <span>Total: {formatNumber(entry.totalNumbersCounted)}</span>
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
      <div class="rounded-xl border p-6" style="border-color: #f59e0b30; background: #f59e0b05;">
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Reset Channel</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block mb-2" style="color: {$colorStore.text}">Reset to Number</label>
            <input
              type="number"
              bind:value={resetNumber}
              min="0"
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>
          
          <div>
            <label class="block mb-2" style="color: {$colorStore.text}">Reason (optional)</label>
            <input
              type="text"
              bind:value={resetReason}
              placeholder="Reason for reset..."
              class="w-full p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>
        </div>
        
        <button
          class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2"
          style="background: #f59e0b20; color: #f59e0b; border: 1px solid #f59e0b30;"
          on:click={resetChannel}
        >
          <RotateCcw size={16} />
          Reset Channel
        </button>
      </div>

      <!-- Save Points -->
      <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Save Points</h3>
        
        <!-- Create Save Point -->
        <div class="mb-6">
          <div class="flex gap-4">
            <input
              type="text"
              bind:value={saveReason}
              placeholder="Reason for save point..."
              class="flex-1 p-3 rounded-lg border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
            <button
              class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2"
              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
              on:click={createSavePoint}
            >
              <Save size={16} />
              Create Save Point
            </button>
          </div>
        </div>

        <!-- Save Points List -->
        {#if savePoints.length === 0}
          <div class="text-center py-8">
            <Archive size={32} style="color: {$colorStore.muted}; margin: 0 auto 8px;" />
            <p style="color: {$colorStore.muted}">No save points created</p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each savePoints as savePoint (savePoint.id)}
              <div 
                class="rounded-lg border p-4 flex items-center justify-between"
                style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08;"
                transition:slide
              >
                <div>
                  <div class="flex items-center gap-2">
                    <Save size={16} style="color: {$colorStore.primary}" />
                    <span class="font-medium" style="color: {$colorStore.text}">
                      Number: {formatNumber(savePoint.savedNumber)}
                    </span>
                    <span class="text-sm" style="color: {$colorStore.muted}">
                      by {savePoint.savedByUsername}
                    </span>
                  </div>
                  <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                    {savePoint.reason || "No reason provided"} • {savePoint.savedAt ? getTimeAgo(savePoint.savedAt) : "Unknown time"}
                  </p>
                </div>
                
                <div class="flex items-center gap-2">
                  <button
                    class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                    style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                    on:click={() => {
                      if (confirm("Are you sure you want to restore from this save point?")) {
                        // Implementation would go here
                      }
                    }}
                  >
                    <Play size={14} />
                  </button>
                  
                  <button
                    class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 text-red-500 hover:bg-red-500/20"
                    on:click={() => {
                      if (confirm("Are you sure you want to delete this save point?")) {
                        // Implementation would go here
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

  {:else}
    <div class="text-center py-12">
      <Settings size={48} style="color: {$colorStore.muted}; margin: 0 auto 16px;" />
      <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text}">Select a Channel</h3>
      <p style="color: {$colorStore.muted}">Choose a counting channel to configure settings</p>
    </div>
  {/if}
</DashboardPageLayout>