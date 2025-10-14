<!-- routes/dashboard/messagestats/+page.svelte -->
<script lang="ts">


  import { onMount } from "svelte";
  import {
    messageCountApi,
    clientApi,
    guildApi,
    type MessageStatsResponse
  } from "$lib/api/index.ts";
    import {currentGuild} from "$lib/stores/currentGuild";
    import {colorStore} from "$lib/stores/colorStore";
    import {fade, slide} from "svelte/transition";
    import type {PageData} from "./$types";
    import StatCard from "$lib/components/monitoring/StatCard.svelte";
    import StatsGraph from "$lib/components/monitoring/StatsGraph.svelte";
    import Notification from "$lib/components/ui/Notification.svelte";
    import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
    import {currentInstance} from "$lib/stores/instanceStore";
    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

    interface Props {
        data: PageData;
    }

    let {data}: Props = $props();

  // States
    let activeTab: "stats" | "manage" = $state("stats");
    let activeSubTab: "overview" | "users" | "channels" | "settings" | "export" = $state("overview");
    let loading = $state(true);
    let error: string | null = $state(null);
    let showNotification = $state(false);
    let notificationMessage = $state("");
    let notificationType: "success" | "error" = $state("success");

  // Data
    let messageStats: MessageStatsResponse | null = $state(null);
  let topUsers: any[] = $state([]);
  let topChannels: any[] = $state([]);

  // Export settings
    let exportStartDate = $state("");
    let exportEndDate = $state("");
    let exportFormat: "csv" | "json" = $state("csv");
    let includeUsers = $state(true);
    let includeChannels = $state(true);
    let includeHourly = $state(false);
    let isExporting = $state(false);

  // Settings state
    let messageCountEnabled = $state(false);
    let minMessageLength = $state(0);
    let settingsLoading = $state(false);
    let resetLoading = $state(false);

  // Computed values
  let chartData = $derived.by(() => {
    const stats = messageStats as any;
    if (!stats || !stats.hourlyStats) return null;

    return {
      labels: stats.hourlyStats.map((stat: any) => `${stat.hour}:00`),
      datasets: [{
        label: "Messages",
        data: stats.hourlyStats.map((stat: any) => stat.messageCount),
        borderColor: $colorStore.primary,
        backgroundColor: `${$colorStore.primary}20`,
        tension: 0.4,
        fill: true
      }, {
        label: "Unique Users",
        data: stats.hourlyStats.map((stat: any) => stat.uniqueUsers),
        borderColor: $colorStore.secondary,
        backgroundColor: `${$colorStore.secondary}20`,
        tension: 0.4,
        fill: false
      }]
    };
  });

  let weeklyChartData = $derived.by(() => {
    const stats = messageStats as any;
    if (!stats || !stats.weeklyTrend) return null;

    return {
      labels: stats.weeklyTrend.map((day: any) => new Date(day.date).toLocaleDateString()),
      datasets: [{
        label: "Daily Messages",
        data: stats.weeklyTrend.map((day: any) => day.messageCount),
        borderColor: $colorStore.accent,
        backgroundColor: `${$colorStore.accent}20`,
        tension: 0.4,
        fill: true
      }]
    };
  });

  // Helper Functions
  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => showNotification = false, 3000);
  }

  function formatNumber(num: number | undefined): string {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  function getRankBadgeColor(rank: number): string {
    if (rank === 1) return "#ffd700"; // Gold
    if (rank === 2) return "#c0c0c0"; // Silver
    if (rank === 3) return "#cd7f32"; // Bronze
    return $colorStore.primary;
  }

  // API Functions
  async function loadData() {
    if (!$currentGuild) return;
    
    loading = true;
    error = null;

    try {
      // Fetch both message stats and guild members
      const [statsData, guildMembers] = await Promise.all([
        messageCountApi.getMessageStats($currentGuild.id),
        clientApi.getMembers($currentGuild.id)
      ]);
      
      messageStats = statsData;
      
      // Enhance topUsers with user data from guild members
      topUsers = (statsData?.topUsers || []).map((messageUser, index) => {
        const member = guildMembers?.find(m => m?.id?.toString() === messageUser.userId);
        return {
          ...messageUser,
          rank: index + 1,
          username: member?.username || 'Unknown User',
          discriminator: '0000', // Discord no longer uses discriminators for most users
          avatarUrl: member?.avatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`,
          messageCount: messageUser.totalMessages,
          averageMessageLength: 0, // Not provided by API
          lastMessageAt: new Date().toISOString() // Not provided by API
        };
      });
      
      topChannels = statsData?.topChannels || [];
      
      // Update enabled state for settings
      messageCountEnabled = statsData?.enabled || false;

      // Set default export dates
      if (!exportStartDate) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        exportStartDate = weekAgo.toISOString().split('T')[0];
      }
      if (!exportEndDate) {
        exportEndDate = new Date().toISOString().split('T')[0];
      }

    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load message stats";
      showNotificationMessage("Failed to load message stats", "error");
    } finally {
      loading = false;
    }
  }

  async function exportStats() {
    if (!$currentGuild || isExporting) return;

    isExporting = true;
    try {
      // Note: exportMessageStats API method not yet implemented
      showNotificationMessage("Export feature not yet implemented", "error");
    } catch (err) {
      showNotificationMessage("Failed to export stats", "error");
    } finally {
      isExporting = false;
    }
  }

  // Settings functions
  async function loadSettings() {
    if (!$currentGuild) return;

    settingsLoading = true;
    try {
      // Use the existing getMessageStats which includes enabled status
      const statsData = await messageCountApi.getMessageStats($currentGuild.id);
      messageCountEnabled = statsData?.enabled || false;

      // Load guild config for min message length
      const guildConfig = await guildApi.getGuildConfig($currentGuild.id);
      minMessageLength = guildConfig?.minMessageLength || 0;
    } catch (err) {
      showNotificationMessage("Failed to load settings", "error");
    } finally {
      settingsLoading = false;
    }
  }

  async function toggleMessageCount() {
    if (!$currentGuild) return;

    settingsLoading = true;
    try {
      showNotificationMessage("Toggle feature not yet implemented", "error");
      // TODO: Implement toggleMessageCount API
    } catch (err) {
      showNotificationMessage("Failed to update setting", "error");
    } finally {
      settingsLoading = false;
    }
  }

  async function updateMinMessageLength() {
    if (!$currentGuild) return;

    settingsLoading = true;
    try {
      const guildConfig = await guildApi.getGuildConfig($currentGuild.id);
      guildConfig.minMessageLength = minMessageLength;
      await guildApi.updateGuildConfig($currentGuild.id, guildConfig);
      showNotificationMessage("Minimum message length updated", "success");
    } catch (err) {
      showNotificationMessage("Failed to update setting", "error");
    } finally {
      settingsLoading = false;
    }
  }

  async function resetMessageCounts(type: "all" | "user" | "channel") {
    if (!$currentGuild || !confirm(`Are you sure you want to reset ${type} message counts? This cannot be undone.`)) return;

    resetLoading = true;
    try {
      showNotificationMessage("Reset feature not yet implemented", "error");
      // TODO: Implement resetMessageCounts API
    } catch (err) {
      showNotificationMessage("Failed to reset counts", "error");
    } finally {
      resetLoading = false;
    }
  }

  // Event handlers
  onMount(() => {
    loadData();
    loadSettings();
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

  // Tab configuration
  const tabs = [
    { id: "stats", label: "Statistics", icon: "fa-chart-column" },
    { id: "manage", label: "Management", icon: "fa-bullseye" }
  ];

  const subTabs = [
    // Statistics subtabs
    { id: "overview", label: "Overview", icon: "fa-message", parentTab: "stats" },
    { id: "users", label: "Top Users", icon: "fa-users", parentTab: "stats" },
    { id: "channels", label: "Top Channels", icon: "fa-hashtag", parentTab: "stats" },
    
    // Management subtabs
    { id: "settings", label: "Settings", icon: "fa-circle-check", parentTab: "manage" },
    { id: "export", label: "Export Data", icon: "fa-download", parentTab: "manage" }
  ];

  // Action buttons configuration
    let actionButtons = $derived([
    {
      label: "Refresh",
      icon: "fa-arrows-rotate",
      action: loadData,
      loading: loading
    }
    ]);

  // Handle sub-tab change
  function handleSubTabChange(detail: { tabId: string }) {
    activeSubTab = detail.tabId as "overview" | "users" | "channels" | "settings" | "export";
  }

  // Handle export format change
  function handleExportFormatChange(detail: any) {
    if (detail.selected && typeof detail.selected === "string") {
      exportFormat = detail.selected as "csv" | "json";
    }
  }
</script>


<DashboardPageLayout 
  title="Message Statistics"
  subtitle="Analyze server message activity and user engagement"
  icon="fa-chart-column"
  {tabs}
  {subTabs}
  bind:activeTab
  {activeSubTab}
  {actionButtons}
  guildName="Dashboard"
  onsubTabChange={handleSubTabChange}
>

    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}

    <!-- Content -->
    {#if loading}
      <SkeletonLoader />
    {:else if error}
      <div class="rounded-xl border p-6" style="border-color: #ef4444; background: #ef444410;">
        <div class="flex items-center gap-3">
          <i class="fa-utility-duo fa-regular fa-triangle-exclamation" style="--fa-primary-color: #ef4444; --fa-secondary-color: #dc2626; font-size: 20px;"></i>
          <span style="color: #ef4444">{error}</span>
        </div>
      </div>
    {:else if activeSubTab === 'overview'}
      <div class="space-y-6" transition:fade>
        <!-- Stats Cards -->
        {#if messageStats}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Daily Messages"
              value={formatNumber(messageStats.dailyMessages)}
              icon="fa-envelope"
              iconColor="primary"
            />
            <StatCard
              label="Total Messages"
              value={formatNumber(messageStats.totalMessages)}
              icon="fa-envelope"
              iconColor="secondary"
            />
            <StatCard
              label="Last Updated"
              value={new Date(messageStats.lastUpdated).toLocaleDateString()}
              icon="fa-clock"
              iconColor="accent"
            />
            <StatCard
              label="Status"
              value={messageStats.enabled ? "Enabled" : "Disabled"}
              icon="fa-circle"
              iconColor={messageStats.enabled ? "primary" : "secondary"}
            />
          </div>
        {/if}

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Hourly Activity -->
          {#if chartData}
            <div class=" rounded-xl border p-6 transition-all"
                   style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
              <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">24-Hour Activity</h3>
              <StatsGraph data={chartData} />
            </div>
          {/if}

          <!-- Weekly Trend -->
          {#if weeklyChartData}
            <div class=" rounded-xl border p-6 transition-all"
                   style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
              <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Weekly Trend</h3>
              <StatsGraph data={weeklyChartData} />
            </div>
          {/if}
        </div>
      </div>

    {:else if activeSubTab === 'users'}
      <div class="space-y-6" transition:fade>
        <div class=" rounded-xl border p-6 transition-all"
               style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <h3 class="text-xl font-bold mb-6" style="color: {$colorStore.text}">Top Message Senders</h3>
          
          <div class="space-y-4">
            {#each topUsers as user (user.userId)}
              <div 
                class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg"
                style="background: {$colorStore.primary}08;"
                transition:slide
              >
                <!-- Mobile: Top row with rank, avatar, and main stats -->
                <div class="flex items-center gap-3 flex-1">
                    <div
                            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style="background: {getRankBadgeColor(user.rank)}; color: #000;"
                  >
                    {user.rank}
                  </div>
                  
                  <img 
                    src={user.avatarUrl} 
                    alt={user.username}
                    class="w-10 h-10 rounded-full shrink-0"
                  >
                  
                  <div class="flex-1 min-w-0">
                    <div class="font-medium truncate" style="color: {$colorStore.text}">
                      {user.username}
                    </div>
                    <div class="text-sm sm:hidden" style="color: {$colorStore.muted}">
                      {formatNumber(user.totalMessages)} messages • Daily: {formatNumber(user.dailyMessages)}
                    </div>
                  </div>
                </div>
                
                <!-- Desktop: Right-aligned stats -->
                <div class="hidden sm:block text-right">
                  <div class="font-bold" style="color: {$colorStore.text}">
                    {formatNumber(user.totalMessages)} messages
                  </div>
                  <div class="text-sm" style="color: {$colorStore.muted}">
                    Daily: {formatNumber(user.dailyMessages)}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

    {:else if activeSubTab === 'channels'}
      <div class="space-y-6" transition:fade>
        <div class=" rounded-xl border p-6 transition-all"
               style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <h3 class="text-xl font-bold mb-6" style="color: {$colorStore.text}">Most Active Channels</h3>
          
          <div class="space-y-4">
            {#each topChannels as channel (channel.channelId)}
              <div 
                class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg"
                style="background: {$colorStore.primary}08;"
                transition:slide
              >
                <!-- Mobile: Top row with icon and channel info -->
                <div class="flex items-center gap-3 flex-1">
                    <div class="shrink-0">
                    <i class="fa-utility-duo fa-regular fa-hashtag" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="font-medium truncate" style="color: {$colorStore.text}">
                      #{channel.channelName}
                    </div>
                    <div class="text-sm sm:hidden" style="color: {$colorStore.muted}">
                      {formatNumber(channel.totalMessages)} messages • Daily: {formatNumber(channel.dailyMessages)}
                    </div>
                  </div>
                </div>
                
                <!-- Desktop: Right-aligned stats -->
                <div class="hidden sm:block text-right">
                  <div class="font-bold" style="color: {$colorStore.text}">
                    {formatNumber(channel.totalMessages)} messages
                  </div>
                  <div class="text-sm" style="color: {$colorStore.muted}">
                    Daily: {formatNumber(channel.dailyMessages)}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

    {:else if activeSubTab === 'export'}
      <div class="space-y-6" transition:fade>
        <div class=" rounded-xl border p-6 transition-all"
               style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <h3 class="text-xl font-bold mb-6" style="color: {$colorStore.text}">Export Message Data</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="input-3605" class="block mb-2" style="color: {$colorStore.text}">Start Date</label>
              <input id="input-3605"
                type="date"
                bind:value={exportStartDate}
                class="w-full p-3 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              >
            </div>
            
            <div>
              <span id="end-date-label" class="block mb-2" style="color: {$colorStore.text}">End Date</span>
              <input
                type="date"
                bind:value={exportEndDate}
                class="w-full p-3 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              >
            </div>
            
            <div>
              <label for="message-limit" class="block mb-2" style="color: {$colorStore.text}">Format</label>
              <DiscordSelector
                type="custom"
                selected={exportFormat}
                onchange={handleExportFormatChange}
                options={[
                  { id: "csv", name: "CSV" },
                  { id: "json", name: "JSON" }
                ]}
                placeholder="Select export format" />
            </div>
          </div>
          
          <div class="mt-6 space-y-3">
            <label class="flex items-center gap-3">
              <input type="checkbox" bind:checked={includeUsers} class="w-4 h-4">
              <span style="color: {$colorStore.text}">Include user statistics</span>
            </label>
            
            <label class="flex items-center gap-3">
              <input type="checkbox" bind:checked={includeChannels} class="w-4 h-4">
              <span style="color: {$colorStore.text}">Include channel statistics</span>
            </label>
            
            <label class="flex items-center gap-3">
              <input type="checkbox" bind:checked={includeHourly} class="w-4 h-4">
              <span style="color: {$colorStore.text}">Include hourly breakdown</span>
            </label>
          </div>
          
          <div class="mt-6">
            <button
              class="px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
              style="background: {$colorStore.primary}; color: {$colorStore.text};"
              disabled={isExporting}
              onclick={exportStats}
            >
              {#if isExporting}
                <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Exporting...
              {:else}
                <i class="fa-solid fa-download" style="font-size: 16px;"></i>
                Export Data
              {/if}
            </button>
          </div>
        </div>
      </div>

    {:else if activeSubTab === 'settings'}
      <div class="space-y-6" transition:fade>
        <div class=" rounded-xl border p-6 transition-all"
               style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <h3 class="text-xl font-bold mb-6" style="color: {$colorStore.text}">Message Count Settings</h3>
          
          {#if settingsLoading}
            <SkeletonLoader />
          {:else}
            <div class="space-y-6">
              <!-- Enable/Disable Toggle -->
              <div class="flex items-center justify-between p-4 rounded-lg" style="background: {$colorStore.primary}10;">
                <div>
                  <h4 class="font-semibold" style="color: {$colorStore.text}">Enable Message Counting</h4>
                  <p class="text-sm mt-1" style="color: {$colorStore.muted}">Track message statistics for this server</p>
                </div>
                <button aria-label="Reset stats"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                  style="background: {messageCountEnabled ? $colorStore.primary : $colorStore.muted}40; focus:ring-color: {$colorStore.primary};"
                  onclick={toggleMessageCount}
                  disabled={settingsLoading}
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {messageCountEnabled ? 'translate-x-6' : 'translate-x-1'}"></span>
                </button>
              </div>

              <!-- Minimum Message Length -->
              <div class="p-4 rounded-lg" style="background: {$colorStore.primary}10;">
                <div class="block mb-3">
                  <label for="include-channels" class="font-semibold" style="color: {$colorStore.text}">Minimum Message
                    Length</label>
                  <div class="text-sm mt-1" style="color: {$colorStore.muted}">Only count messages with at least this
                    many characters (0-4098)
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <input id="include-channels"
                    type="range"
                    min="0"
                    max="4098"
                    step="1"
                    bind:value={minMessageLength}
                    onchange={updateMinMessageLength}
                    class="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                    style="background: {$colorStore.primary}20;"
                    disabled={settingsLoading}
                  >
                    <div class="text-sm font-mono px-2 py-1 rounded-sm"
                         style="background: {$colorStore.primary}20; color: {$colorStore.text}; min-width: 60px; text-align: center;">
                    {minMessageLength}
                  </div>
                </div>
              </div>

              <!-- Reset Options -->
              <div class="p-4 rounded-lg border" style="border-color: #ef4444; background: #ef444410;">
                <h4 class="font-semibold mb-3" style="color: #ef4444">Reset Message Counts</h4>
                <p class="text-sm mb-4" style="color: {$colorStore.muted}">Permanently delete message count data. This action cannot be undone.</p>
                
                <div class="space-y-3">
                  <button
                    class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
                    style="border-color: #ef4444; color: #ef4444; background: transparent;"
                    onclick={() => resetMessageCounts('all')}
                    disabled={resetLoading}
                  >
                    {#if resetLoading}
                      <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    {:else}
                      <i class="fa-solid fa-triangle-exclamation" style="font-size: 16px;"></i>
                    {/if}
                    Reset All Server Counts
                  </button>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
</DashboardPageLayout>