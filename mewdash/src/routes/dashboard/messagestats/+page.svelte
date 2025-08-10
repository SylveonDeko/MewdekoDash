<!-- routes/dashboard/messagestats/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { fade, slide } from "svelte/transition";
  import type { PageData } from "./$types";
  import type { 
    MessageStatsResponse,
    DailyMessageStats,
    UserMessageStats,
    ChannelMessageStats 
  } from "$lib/types/messagestats";
  import StatCard from "$lib/components/monitoring/StatCard.svelte";
  import StatsGraph from "$lib/components/monitoring/StatsGraph.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import { browser } from "$app/environment";
  import { 
    MessageSquare, 
    BarChart3, 
    TrendingUp, 
    Users, 
    Hash,
    Clock,
    Download,
    Calendar,
    Target,
    AlertCircle,
    AlertTriangle,
    CheckCircle,
    RefreshCw
  } from "lucide-svelte";
  import { currentInstance } from "$lib/stores/instanceStore";

  export let data: PageData;

  let currentUser = data.user;
  
  // States
  let activeTab: "stats" | "manage" = "stats";
  let activeSubTab: "overview" | "users" | "channels" | "settings" | "export" = "overview";
  let loading = true;
  let error: string | null = null;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";

  // Data
  let messageStats: MessageStatsResponse | null = null;
  let topUsers: UserMessageStats[] = [];
  let topChannels: ChannelMessageStats[] = [];
  let userPage = 1;
  let channelPage = 1;
  const pageSize = 10;

  // Export settings
  let exportStartDate = "";
  let exportEndDate = "";
  let exportFormat: "csv" | "json" = "csv";
  let includeUsers = true;
  let includeChannels = true;
  let includeHourly = false;
  let isExporting = false;

  // Settings state
  let messageCountEnabled = false;
  let minMessageLength = 0;
  let settingsLoading = false;
  let resetLoading = false;

  // Computed values
  $: colorVars = `
    --color-primary: ${$colorStore.primary};
    --color-secondary: ${$colorStore.secondary};
    --color-accent: ${$colorStore.accent};
    --color-text: ${$colorStore.text};
    --color-muted: ${$colorStore.muted};
  `;


  $: chartData = messageStats?.hourlyStats ? {
    labels: messageStats.hourlyStats.map(stat => `${stat.hour}:00`),
    datasets: [{
      label: "Messages",
      data: messageStats.hourlyStats.map(stat => stat.messageCount),
      borderColor: $colorStore.primary,
      backgroundColor: `${$colorStore.primary}20`,
      tension: 0.4,
      fill: true
    }, {
      label: "Unique Users",
      data: messageStats.hourlyStats.map(stat => stat.uniqueUsers),
      borderColor: $colorStore.secondary,
      backgroundColor: `${$colorStore.secondary}20`,
      tension: 0.4,
      fill: false
    }]
  } : null;

  $: weeklyChartData = messageStats?.weeklyTrend ? {
    labels: messageStats.weeklyTrend.map(day => new Date(day.date).toLocaleDateString()),
    datasets: [{
      label: "Daily Messages",
      data: messageStats.weeklyTrend.map(day => day.messageCount),
      borderColor: $colorStore.accent,
      backgroundColor: `${$colorStore.accent}20`,
      tension: 0.4,
      fill: true
    }]
  } : null;

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

  function getTimeAgo(dateString: string): string {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffHours < 1) return "Less than an hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
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
        api.getMessageStats($currentGuild.id),
        api.getGuildMembers($currentGuild.id)
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
      console.error("Failed to load message stats:", err);
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
      const result = await api.exportMessageStats($currentGuild.id, {
        startDate: exportStartDate,
        endDate: exportEndDate,
        format: exportFormat,
        includeUsers,
        includeChannels,
        includeHourly
      });

      // Trigger download
      if (result.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `message-stats-${exportStartDate}-to-${exportEndDate}.${exportFormat}`;
        link.click();
        showNotificationMessage("Export completed successfully!", "success");
      }
    } catch (err) {
      console.error("Failed to export stats:", err);
      showNotificationMessage("Failed to export stats", "error");
    } finally {
      isExporting = false;
    }
  }

  async function loadUserPage(page: number) {
    userPage = page;
    // In a real implementation, you'd make an API call with pagination
    // For now, we'll just simulate it with the existing data
  }

  async function loadChannelPage(page: number) {
    channelPage = page;
    // In a real implementation, you'd make an API call with pagination
  }

  // Settings functions
  async function loadSettings() {
    if (!$currentGuild) return;
    
    settingsLoading = true;
    try {
      // Use the existing getMessageStats which includes enabled status
      const statsData = await api.getMessageStats($currentGuild.id);
      messageCountEnabled = statsData?.enabled || false;
      
      // Load guild config for min message length
      const guildConfig = await api.getGuildConfig($currentGuild.id);
      minMessageLength = guildConfig?.minMessageLength || 0;
    } catch (err) {
      console.error("Failed to load message count settings:", err);
      showNotificationMessage("Failed to load settings", "error");
    } finally {
      settingsLoading = false;
    }
  }

  async function toggleMessageCount() {
    if (!$currentGuild) return;
    
    settingsLoading = true;
    try {
      const result = await api.toggleMessageCount($currentGuild.id);
      messageCountEnabled = result.enabled;
      showNotificationMessage(result.message, "success");
      // Reload data to reflect changes
      await loadData();
    } catch (err) {
      console.error("Failed to toggle message count:", err);
      showNotificationMessage("Failed to update setting", "error");
    } finally {
      settingsLoading = false;
    }
  }

  async function updateMinMessageLength() {
    if (!$currentGuild) return;
    
    settingsLoading = true;
    try {
      await api.updateGuildConfig($currentGuild.id, { minMessageLength });
      showNotificationMessage("Minimum message length updated", "success");
    } catch (err) {
      console.error("Failed to update min message length:", err);
      showNotificationMessage("Failed to update setting", "error");
    } finally {
      settingsLoading = false;
    }
  }

  async function resetMessageCounts(type: 'all' | 'user' | 'channel', id?: string) {
    if (!$currentGuild || !confirm(`Are you sure you want to reset ${type} message counts? This cannot be undone.`)) return;
    
    resetLoading = true;
    try {
      const userId = type === 'user' && id ? BigInt(id) : undefined;
      const channelId = type === 'channel' && id ? BigInt(id) : undefined;
      
      const result = await api.resetMessageCounts($currentGuild.id, userId, channelId);
      showNotificationMessage(result.message, "success");
      // Reload data to reflect changes
      await loadData();
    } catch (err) {
      console.error("Failed to reset message counts:", err);
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

  $: if ($currentInstance) {
    loadData();
  }

  $: if ($currentGuild) {
    loadData();
  }

  // Tab configuration
  const tabs = [
    { id: "stats", label: "Statistics", icon: BarChart3 },
    { id: "manage", label: "Management", icon: Target }
  ];

  const subTabs = [
    // Statistics subtabs
    { id: "overview", label: "Overview", icon: MessageSquare, parentTab: "stats" },
    { id: "users", label: "Top Users", icon: Users, parentTab: "stats" },
    { id: "channels", label: "Top Channels", icon: Hash, parentTab: "stats" },
    
    // Management subtabs
    { id: "settings", label: "Settings", icon: CheckCircle, parentTab: "manage" },
    { id: "export", label: "Export Data", icon: Download, parentTab: "manage" }
  ];

  // Action buttons configuration
  $: actionButtons = [
    {
      label: "Refresh",
      icon: RefreshCw,
      action: loadData,
      loading: loading
    }
  ];

  // Handle tab change
  function handleTabChange(event: CustomEvent) {
    activeTab = event.detail.tabId as "stats" | "manage";
  }

  // Handle sub-tab change
  function handleSubTabChange(event: CustomEvent) {
    activeSubTab = event.detail.tabId as "overview" | "users" | "channels" | "settings" | "export";
  }
</script>


<DashboardPageLayout 
  title="Message Statistics"
  subtitle="Analyze server message activity and user engagement"
  icon={BarChart3}
  {tabs}
  {subTabs}
  {activeTab}
  {activeSubTab}
  {actionButtons}
  guildName="Dashboard"
  on:tabChange={handleTabChange}
  on:subTabChange={handleSubTabChange}
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
          <AlertTriangle size={20} style="color: #ef4444" />
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
              icon={MessageSquare}
              iconColor="primary"
            />
            <StatCard
              label="Total Messages"
              value={formatNumber(messageStats.totalMessages)}
              icon={BarChart3}
              iconColor="secondary"
            />
            <StatCard
              label="Last Updated"
              value={new Date(messageStats.lastUpdated).toLocaleDateString()}
              icon={Clock}
              iconColor="accent"
            />
            <StatCard
              label="Status"
              value={messageStats.enabled ? "Enabled" : "Disabled"}
              icon={Target}
              iconColor={messageStats.enabled ? "primary" : "secondary"}
            />
          </div>
        {/if}

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Hourly Activity -->
          {#if chartData}
            <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
              <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">24-Hour Activity</h3>
              <StatsGraph data={chartData} height={300} />
            </div>
          {/if}

          <!-- Weekly Trend -->
          {#if weeklyChartData}
            <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
              <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Weekly Trend</h3>
              <StatsGraph data={weeklyChartData} height={300} />
            </div>
          {/if}
        </div>
      </div>

    {:else if activeSubTab === 'users'}
      <div class="space-y-6" transition:fade>
        <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <h3 class="text-xl font-bold mb-6" style="color: {$colorStore.text}">Top Message Senders</h3>
          
          <div class="space-y-4">
            {#each topUsers as user, index (user.userId)}
              <div 
                class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg"
                style="background: {$colorStore.primary}08;"
                transition:slide
              >
                <!-- Mobile: Top row with rank, avatar, and main stats -->
                <div class="flex items-center gap-3 flex-1">
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style="background: {getRankBadgeColor(user.rank)}; color: #000;"
                  >
                    {user.rank}
                  </div>
                  
                  <img 
                    src={user.avatarUrl} 
                    alt={user.username}
                    class="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  
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
        <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <h3 class="text-xl font-bold mb-6" style="color: {$colorStore.text}">Most Active Channels</h3>
          
          <div class="space-y-4">
            {#each topChannels as channel, index (channel.channelId)}
              <div 
                class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg"
                style="background: {$colorStore.primary}08;"
                transition:slide
              >
                <!-- Mobile: Top row with icon and channel info -->
                <div class="flex items-center gap-3 flex-1">
                  <div class="flex-shrink-0">
                    <Hash size={20} style="color: {$colorStore.primary}" />
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
        <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <h3 class="text-xl font-bold mb-6" style="color: {$colorStore.text}">Export Message Data</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block mb-2" style="color: {$colorStore.text}">Start Date</label>
              <input
                type="date"
                bind:value={exportStartDate}
                class="w-full p-3 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              />
            </div>
            
            <div>
              <label class="block mb-2" style="color: {$colorStore.text}">End Date</label>
              <input
                type="date"
                bind:value={exportEndDate}
                class="w-full p-3 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              />
            </div>
            
            <div>
              <label class="block mb-2" style="color: {$colorStore.text}">Format</label>
              <DiscordSelector
                type="custom"
                selected={exportFormat}
                on:change={(e) => exportFormat = e.detail.selected}
                options={[
                  { id: "csv", name: "CSV", description: "Comma-separated values" },
                  { id: "json", name: "JSON", description: "JavaScript Object Notation" }
                ]}
                placeholder="Select export format"
              />
            </div>
          </div>
          
          <div class="mt-6 space-y-3">
            <label class="flex items-center gap-3">
              <input type="checkbox" bind:checked={includeUsers} class="w-4 h-4" />
              <span style="color: {$colorStore.text}">Include user statistics</span>
            </label>
            
            <label class="flex items-center gap-3">
              <input type="checkbox" bind:checked={includeChannels} class="w-4 h-4" />
              <span style="color: {$colorStore.text}">Include channel statistics</span>
            </label>
            
            <label class="flex items-center gap-3">
              <input type="checkbox" bind:checked={includeHourly} class="w-4 h-4" />
              <span style="color: {$colorStore.text}">Include hourly breakdown</span>
            </label>
          </div>
          
          <div class="mt-6">
            <button
              class="px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
              style="background: {$colorStore.primary}; color: {$colorStore.text};"
              disabled={isExporting}
              on:click={exportStats}
            >
              {#if isExporting}
                <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Exporting...
              {:else}
                <Download size={16} />
                Export Data
              {/if}
            </button>
          </div>
        </div>
      </div>

    {:else if activeSubTab === 'settings'}
      <div class="space-y-6" transition:fade>
        <div class="rounded-xl border p-6" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
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
                <button
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style="background: {messageCountEnabled ? $colorStore.primary : $colorStore.muted}40; focus:ring-color: {$colorStore.primary};"
                  on:click={toggleMessageCount}
                  disabled={settingsLoading}
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {messageCountEnabled ? 'translate-x-6' : 'translate-x-1'}"></span>
                </button>
              </div>

              <!-- Minimum Message Length -->
              <div class="p-4 rounded-lg" style="background: {$colorStore.primary}10;">
                <label class="block mb-3">
                  <span class="font-semibold" style="color: {$colorStore.text}">Minimum Message Length</span>
                  <p class="text-sm mt-1" style="color: {$colorStore.muted}">Only count messages with at least this many characters (0-4098)</p>
                </label>
                <div class="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="4098"
                    step="1"
                    bind:value={minMessageLength}
                    on:change={updateMinMessageLength}
                    class="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                    style="background: {$colorStore.primary}20;"
                    disabled={settingsLoading}
                  />
                  <div class="text-sm font-mono px-2 py-1 rounded" style="background: {$colorStore.primary}20; color: {$colorStore.text}; min-width: 60px; text-align: center;">
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
                    on:click={() => resetMessageCounts('all')}
                    disabled={resetLoading}
                  >
                    {#if resetLoading}
                      <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    {:else}
                      <AlertTriangle size={16} />
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