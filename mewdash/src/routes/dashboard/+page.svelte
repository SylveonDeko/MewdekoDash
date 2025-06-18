<!-- routes/dashboard/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import { fade, fly } from "svelte/transition";
  import type { BotStatusModel, GraphStatsResponse } from "$lib/types/models";
  import { goto } from "$app/navigation";
  import { currentGuild } from "$lib/stores/currentGuild";
  import {
    BarChart3,
    Bot,
    ChartBar,
    Code,
    Gift,
    Library,
    Link,
    MessageSquare,
    Music,
    RefreshCw,
    Server,
    Shield,
    Star,
    Users
  } from "lucide-svelte";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { browser } from "$app/environment";

  // Import  components
  import MusicPlayer from "$lib/components/MusicPlayer.svelte";
  import StatsGraph from "$lib/components/StatsGraph.svelte";
  import InviteStats from "$lib/components/InviteStats.svelte";
  import StatCard from "$lib/components/StatCard.svelte";
  import FeatureCard from "$lib/components/FeatureCard.svelte";
  import ServerSelector from "$lib/components/ServerSelector.svelte";
  import SkeletonLoader from "$lib/components/SkeletonLoader.svelte";
  import KeyboardShortcuts from "$lib/components/KeyboardShortcuts.svelte";

  // Import stores
  import { musicStore } from "$lib/stores/musicStore";
  import { inviteStore } from "$lib/stores/inviteStore";
  import { dashboardStore } from "$lib/stores/dashboardStore";
  import { userAdminGuilds } from "$lib/stores/adminGuildsStore.ts";

  export let data;

  // State management
  let currentUser = data.user;
  let botStatus: BotStatusModel | null = null;
  let loading = true;
  let error: string | null = null;
  let refreshing = false;
  let joinStats: GraphStatsResponse | null = null;
  let leaveStats: GraphStatsResponse | null = null;
  let showShortcuts = false;

  // Derived state
  $: musicStatus = $musicStore.status;

  // Track when data is being fetched to prevent duplicate requests
  let fetchingData = false;

  // Role statistics
  let roleStats = {
    totalRoleStates: 0,
    activeRoleGreets: 0,
    savedRoles: 0,
    totalRoles: 0,
    previousTotalRoles: 0
  };

  // Feature flags for guild
  let guildFeatures = {
    inviteTracking: false,
    roleStates: false,
    roleGreets: false,
    multiGreets: false,
    starboard: false,
    suggestions: false,
    musicEnabled: false,
    giveawaysEnabled: false
  };

  // Description for features
  const featureDescriptions = {
    inviteTracking: "Track who invited users to your server",
    roleStates: "Save and restore user roles when they leave and rejoin",
    roleGreets: "Custom greetings based on user roles",
    multiGreets: "Multiple greeting channels and messages",
    starboard: "Highlight popular messages in a dedicated channel",
    suggestions: "Let users submit and vote on suggestions",
    musicEnabled: "Play music in voice channels",
    giveawaysEnabled: "Host giveaways with automatic winner selection"
  };

  // Tooltip data for stats
  $: memberTooltipData = [
    { label: "Online", value: botStatus?.onlineUsers || 0 },
    { label: "Bots", value: botStatus?.botCount || 0 },
    { label: "Growth (30d)", value: `${botStatus?.userGrowthRate || 0}%` }
  ];

  $: roleTooltipData = [
    { label: "Total Roles", value: roleStats.totalRoles },
    { label: "Saved Roles", value: roleStats.savedRoles },
    { label: "Role States", value: roleStats.totalRoleStates },
    { label: "Role Greets", value: roleStats.activeRoleGreets }
  ];

  // Unified data fetching
  async function fetchRoleStats() {
    try {
      if (!$currentGuild?.id) return;

      const [roleStates, roleGreets, roleList] = await Promise.all([
        api.getAllRoleStates($currentGuild.id),
        api.getAllRoleGreets($currentGuild.id),
        api.getGuildRoles($currentGuild.id)
      ]);

      // Store previous value for trend
      roleStats.previousTotalRoles = roleStats.totalRoles;

      roleStats = {
        totalRoleStates: roleStates?.length || 0,
        activeRoleGreets: roleGreets.filter(g => !g.disabled).length || 0,
        savedRoles: roleStates.reduce((sum, state) =>
          sum + (state.savedRoles?.split(",").length || 0), 0) || 0,
        totalRoles: roleList.length || 0,
        previousTotalRoles: roleStats.totalRoles
      };
    } catch (err) {
      logger.error("Failed to fetch role stats:", err);
    }
  }

  async function fetchStats() {
    if (!$currentGuild?.id) return;

    try {
      const [joinData, leaveData] = await Promise.all([
        api.getJoinStats($currentGuild.id),
        api.getLeaveStats($currentGuild.id)
      ]);

      joinStats = joinData;
      leaveStats = leaveData;
    } catch (err) {
      logger.error("Failed to fetch join/leave stats:", err);
    }
  }

  async function fetchFeatures() {
    try {
      if (!$currentGuild?.id) return;

      const [
        roleStateSettings,
        guildSettingsResponse,
        roleGreets,
        inviteTrackingSettings
      ] = await Promise.all([
        api.getRoleStateSettings($currentGuild.id),
        api.getGuildConfig($currentGuild.id),
        api.getAllRoleGreets($currentGuild.id),
        api.getInviteSettings($currentGuild.id)
      ]);

      guildFeatures = {
        // Fix the circular reference by using actual response data
        inviteTracking: inviteTrackingSettings?.isEnabled || false,
        roleStates: roleStateSettings?.enabled || false,
        roleGreets: (roleGreets?.length || 0) > 0,
        multiGreets: (guildSettingsResponse?.MultiGreetType || 0) > 0,
        starboard: !!guildSettingsResponse?.StarboardChannel,
        suggestions: !!guildSettingsResponse?.sugchan,
        musicEnabled: true, // Assuming always enabled
        giveawaysEnabled: !!guildSettingsResponse?.GiveawayEndMessage
      };
    } catch (err) {
      logger.error("Failed to fetch features:", err);
    }
  }

  // Format numbers nicely
  function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }

  // Calculate role trend
  function calculateRoleTrend(): { trend: "up" | "down" | "neutral", value: string } {
    const current = roleStats.totalRoles;
    const previous = roleStats.previousTotalRoles;

    if (previous === 0) return { trend: "neutral", value: "" };

    const diff = current - previous;
    const percentage = Math.round((diff / previous) * 100);

    if (diff > 0) return { trend: "up", value: `+${percentage}%` };
    if (diff < 0) return { trend: "down", value: `${percentage}%` };

    return { trend: "neutral", value: "" };
  }

  // Unified data fetch
  async function fetchAllData() {
    if (fetchingData) return;
    fetchingData = true;
    refreshing = true;

    try {
      if (browser) {
        // Add a subtle refresh animation
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      if (!$currentGuild?.id) {
        botStatus = await api.getBotStatus();
        return;
      }

      await Promise.all([
        fetchBotStatus(),
        fetchRoleStats(),
        fetchStats(),
        fetchFeatures(),
        inviteStore.fetchStats($currentGuild.id)
      ]);

      dashboardStore.setLastUpdated(new Date());
    } catch (err) {
      error = err.message || "An error occurred while fetching data";
      logger.error("Dashboard data fetch error:", err);
    } finally {
      fetchingData = false;
      refreshing = false;
    }
  }

  async function fetchBotStatus() {
    try {
      botStatus = await api.getBotStatus();
    } catch (err) {
      logger.error("Failed to fetch bot status:", err);
      error = "Failed to fetch bot status";
    }
  }

  // Handler for server selection
  function handleServerSelect(guild) {
    currentGuild.set(guild);
  }

  // Keyboard shortcut handler
  function handleKeyDown(event: KeyboardEvent) {
    // Only process if no input element is focused
    const target = event.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

    // Keyboard shortcuts
    switch (event.key.toLowerCase()) {
      case "r": // Refresh data
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          fetchAllData();
        }
        break;
      case "m": // Go to music page
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          goto("/dashboard/music");
        }
        break;
      case "h": // Go to home
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          goto("/dashboard");
        }
        break;
      case "s": // Go to settings
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          goto("/dashboard/settings");
        }
        break;
      case "?": // Show shortcuts
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          showShortcuts = true;
        }
        break;
    }
  }

  onMount(async () => {
    loading = true;
    try {
      await colorStore.extractFromImage($currentInstance?.botAvatar);
      await fetchAllData();

      // Start music polling if we have a user
      if (currentUser?.id) {
        musicStore.startPolling(currentUser.id);
      }

      // Setup keyboard shortcuts
      if (browser) {
        window.addEventListener("keydown", handleKeyDown);
      }
    } catch (err) {
      error = "Failed to fetch dashboard data";
      logger.error(error, err);
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    musicStore.stopPolling();

    if (browser) {
      window.removeEventListener("keydown", handleKeyDown);
    }
  });

  $: if ($currentInstance) {
    colorStore.extractFromImage($currentInstance?.botAvatar);

    // Reset music polling
    if (currentUser?.id) {
      musicStore.reset();
      musicStore.startPolling(currentUser.id);
    }

    fetchAllData();
  }

  $: if ($currentGuild) {
    fetchAllData();
  }

  // Watch for userAdminGuilds to be populated and restore saved guild if needed
  $: if (browser && $userAdminGuilds) {
    try {
      const savedGuild = localStorage.getItem("lastSelectedGuild");
      if (savedGuild) {
        const guildData = JSON.parse(savedGuild);
        const restoredGuild = {
          ...guildData,
          id: BigInt(guildData.id)
        };

        // Check if this guild is still in the user's admin guilds
        const guildExists = $userAdminGuilds.some(guild => guild.id === restoredGuild.id);
        if (guildExists) {
          currentGuild.set(restoredGuild);
          logger.info("Restored saved guild after admin guilds loaded:", restoredGuild.name);
        } else {
          // Guild no longer available, clear saved data
          localStorage.removeItem("lastSelectedGuild");
        }
      }
    } catch (err) {
      logger.error("Failed to restore saved guild after admin guilds loaded:", err);
      localStorage.removeItem("lastSelectedGuild");
    }
  }
</script>

<!-- Keyboard Shortcuts Dialog -->
<KeyboardShortcuts bind:isVisible={showShortcuts} />

<!-- Main Dashboard -->
<div
  class="min-h-screen p-4 md:p-6 overflow-x-hidden w-full transition-all duration-500"
  style="{colorStore.getCssVars()} background: radial-gradient(circle at top,
    {$colorStore.gradientStart}15 0%,
    {$colorStore.gradientMid}10 50%,
    {$colorStore.gradientEnd}05 100%);"
>
  <div class="max-w-7xl mx-auto space-y-8">
    <!-- Server Selector () -->
    <div class="mb-6">
      <ServerSelector
        error={null}
        guilds={$userAdminGuilds || []}
        loading={false}
        onRetry={() => {}}
        onSelect={handleServerSelect}
      />
    </div>

    {#if !$currentGuild}
      <!-- Welcome Dashboard -->
      <div
        class="text-center p-8 rounded-2xl backdrop-blur-sm border flex flex-col items-center"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
           border-color: {$colorStore.primary}30;"
        in:fly={{ y: 20, duration: 300 }}
      >
        <div class="w-20 h-20 rounded-full mb-6 flex items-center justify-center"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}30, {$colorStore.gradientMid}30);">
          <div>
            <Server size={32} style="color: {$colorStore.primary}" />
          </div>
        </div>

        <h1 class="text-2xl md:text-3xl font-semibold mb-3" style="color: {$colorStore.text}">
          Select a Server
        </h1>
        <p class="text-base max-w-xl mx-auto mb-6" style="color: {$colorStore.muted}">
          Choose a server to start managing your Discord community.
        </p>

        <!-- Key Features Preview -->
        <div class="max-w-2xl w-full mx-auto mt-8">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            {#each [{ name: 'Moderation', icon: '🛡️' }, { name: 'Music', icon: '🎵' }, {
              name: 'Economy',
              icon: '💰'
            }, { name: 'Fun', icon: '🎮' }] as feature}
              <div class="p-4 rounded-xl text-center transition-all duration-200 hover:scale-105 group"
                   style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                <div class="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">{feature.icon}</div>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">{feature.name}</span>
              </div>
            {/each}
          </div>
        </div>

        <!-- Bot Status if available -->
        {#if botStatus}
          <div class="mt-12 w-full max-w-2xl">
            <h2 class="text-xl font-semibold mb-4" style="color: {$colorStore.text}">Bot Status</h2>
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex-1">
                <StatCard
                  icon={Bot}
                  label="Status"
                  value={botStatus.botStatus || 'Unknown'}
                  iconColor="primary"
                  animationDelay={0}
                />
              </div>

              <div class="flex-1">
                <StatCard
                  icon={Users}
                  label="Users"
                  value={botStatus.userCount || 0}
                  iconColor="secondary"
                  animationDelay={100}
                />
              </div>

              <div class="flex-1">
                <StatCard
                  icon={Code}
                  label="Commands"
                  value={botStatus.commandsCount || 0}
                  iconColor="accent"
                  animationDelay={200}
                />
              </div>
            </div>
          </div>
        {/if}
      </div>
    {:else if loading}
      <div role="status" aria-live="polite">
        <!-- Skeleton Loaders -->
        <div class="flex flex-col gap-6">
          <!-- Music Player Skeleton -->
          <div class="w-full">
            <SkeletonLoader type="music" />
          </div>

          <!-- Bot Profile Skeleton -->
          <div class="w-full">
            <SkeletonLoader type="card" height="360px" />
          </div>

          <!-- Stats Cards Skeletons - Flexbox layout -->
          <div class="flex flex-col md:flex-row gap-6">
            <div class="flex-1">
              <SkeletonLoader type="stats" />
            </div>
            <div class="flex-1">
              <SkeletonLoader type="stats" delay={100} />
            </div>
            <div class="flex-1">
              <SkeletonLoader type="stats" delay={200} />
            </div>
          </div>

          <!-- Features Skeleton -->
          <div class="flex-1">
            <div class="grid grid-cols-2 gap-4">
              <SkeletonLoader type="feature" delay={300} />
              <SkeletonLoader type="feature" delay={350} />
              <SkeletonLoader type="feature" delay={400} />
              <SkeletonLoader type="feature" delay={450} />
            </div>
          </div>
        </div>
      </div>
    {:else if error}
      <div class="p-6 rounded-xl mb-6 transition-all" role="alert"
           style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}40;">
        <div class="flex items-center gap-3">
          <Bot class="w-6 h-6" style="color: {$colorStore.accent}" />
          <div style="color: {$colorStore.accent}">
            <div class="font-semibold text-lg">Error Occurred</div>
            <div class="text-sm mt-1" style="color: {$colorStore.accent}90">{error}</div>
          </div>
        </div>

        <div class="mt-4 flex justify-end">
          <button
            class="flex items-center gap-2 py-2 px-4 rounded-lg transition-colors"
            on:click={fetchAllData}
            style="background: {$colorStore.accent}20; color: {$colorStore.accent}"
          >
            <RefreshCw size={18} />
            Retry
          </button>
        </div>
      </div>
    {:else}
      <!-- Refresh button -->
      <div class="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-30" class:hidden={refreshing}>
        <button
          class="flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all hover:scale-105"
          style="background: {$colorStore.primary}; color: white"
          on:click={fetchAllData}
          aria-label="Refresh dashboard data"
          class:animate-spin={refreshing}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <!-- Music Player Section -->
      <div class="w-full overflow-hidden mb-6">
        {#if musicStatus?.CurrentTrack}
          <MusicPlayer {musicStatus} />
        {:else}
          <!-- No Music Placeholder -->
          <div class="backdrop-blur-sm rounded-2xl border p-6 text-center transition-all"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                      border-color: {$colorStore.primary}30;"
               in:fade={{ duration: 300 }}
          >
            <Music class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
            <h3 class="text-xl font-semibold" style="color: {$colorStore.text}">
              No music is currently playing
            </h3>
            <p class="mt-2" style="color: {$colorStore.muted}">
              Join a voice channel and use commands to play music
            </p>
          </div>
        {/if}
      </div>

      <!-- Bot Profile Card -->
      <div
        class="w-full backdrop-blur-sm rounded-2xl border shadow-2xl overflow-hidden transition-all mb-6"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
        in:fly={{ y: 20, duration: 300 }}
      >
        <div class="relative h-48 md:h-64">
          {#if botStatus?.botBanner}
            <div class="absolute inset-0">
              <img
                src={botStatus.botBanner}
                alt=""
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0"
                   style="background: linear-gradient(to top, {$colorStore.primary}90, transparent)">
              </div>
            </div>
          {:else}
            <div class="absolute inset-0"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}20)">
            </div>
          {/if}

          <div class="absolute bottom-0 left-0 right-0 p-6">
            <div class="flex items-end gap-6">
              <div class="relative group">
                <div
                  class="absolute -inset-1 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-200"
                  style="background: linear-gradient(to right, {$colorStore.primary}, {$colorStore.secondary})"
                ></div>
                <img
                  src={botStatus?.botAvatar || '/img/Mewdeko.png'}
                  alt=""
                  class="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white object-cover"
                />
              </div>
              <div class="flex-grow">
                <h2 class="text-3xl md:text-4xl font-bold mb-2" style="color: {$colorStore.text}">
                  {botStatus?.botName || 'Bot'}
                </h2>
                <div class="flex items-center gap-3">
                  <p style="color: {$colorStore.muted}">Version {botStatus?.botVersion || '1.0.0'}</p>

                  {#if botStatus?.botStatus}
                    <div class="flex items-center gap-1 px-2 py-0.5 rounded-full text-sm"
                         style="background: {botStatus.botStatus === 'Online' ? '#10b98130' : '#f59e0b30'};
                                color: {botStatus.botStatus === 'Online' ? '#10b981' : '#f59e0b'};">
                      <span class="w-2 h-2 rounded-full bg-current"></span>
                      <span>{botStatus.botStatus}</span>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Grid using Flexbox -->
      <div class="flex flex-col lg:flex-row gap-6 mb-6">
        <!-- Bot Info Card -->
        <div
          class="flex-1 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-4 mb-6">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <ChartBar class="w-6 h-6" style="color: {$colorStore.primary}" />
            </div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Bot Info</h2>
          </div>

          <div class="space-y-4">
            <StatCard
              icon={Bot}
              label="Latency"
              value={`${botStatus?.botLatency || 0}ms`}
              iconColor="primary"
              trend={botStatus?.botLatency < 100 ? "up" : botStatus?.botLatency > 200 ? "down" : "neutral"}
              trendValue={botStatus?.botLatency < 100 ? "Good" : botStatus?.botLatency > 200 ? "High" : ""}
              animationDelay={0}
            />

            <StatCard
              icon={Code}
              label="Commands"
              value={botStatus?.commandsCount || 0}
              iconColor="primary"
              tooltipData={[
                { label: "Modules", value: botStatus?.modulesCount || 0 },
                { label: "Text Commands", value: botStatus?.textCommandsCount || 0 },
                { label: "Slash Commands", value: botStatus?.slashCommandsCount || 0 }
              ]}
              animationDelay={100}
            />

            <StatCard
              icon={Library}
              label="Discord.NET"
              value={botStatus?.dNetVersion || ""}
              iconColor="secondary"
              subtitle={botStatus?.commitHash?.substring(0, 7) || ""}
              animationDelay={200}
            />
          </div>
        </div>

        <!-- Server Stats Card -->
        <div
          class="flex-1 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-4 mb-6">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <BarChart3 class="w-6 h-6" style="color: {$colorStore.primary}" />
            </div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Server Stats</h2>
          </div>

          <div class="space-y-4">
            <StatCard
              icon={Users}
              label="Members"
              value={botStatus?.userCount || 0}
              iconColor="primary"
              tooltipData={memberTooltipData}
              animationDelay={300}
            />

            <StatCard
              icon={Shield}
              label="Roles"
              value={roleStats.totalRoles}
              subtitle={`${roleStats.savedRoles} saved`}
              iconColor="accent"
              trend={calculateRoleTrend().trend}
              trendValue={calculateRoleTrend().value}
              tooltipData={roleTooltipData}
              animationDelay={400}
            />
          </div>
        </div>

        <!-- Feature Overview Card -->
        <div
          class="flex-1 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-4 mb-6">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <ChartBar class="w-6 h-6" style="color: {$colorStore.primary}" />
            </div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Active Features</h2>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Invite Tracking -->
            <FeatureCard
              icon={Link}
              title="Invite Tracking"
              isActive={guildFeatures.inviteTracking}
              description={featureDescriptions.inviteTracking}
              href="/dashboard/invites"
              animationDelay={0}
            />

            <!-- Role States -->
            <FeatureCard
              icon={Shield}
              title="Role States"
              isActive={guildFeatures.roleStates}
              description={featureDescriptions.roleStates}
              href="/dashboard/rolestates"
              animationDelay={50}
            />

            <!-- Role Greets -->
            <FeatureCard
              icon={MessageSquare}
              title="Role Greets"
              isActive={guildFeatures.roleGreets}
              description={featureDescriptions.roleGreets}
              href="/dashboard/rolegreets"
              animationDelay={100}
            />

            <!-- Starboard -->
            <FeatureCard
              icon={Star}
              title="Starboard"
              isActive={guildFeatures.starboard}
              description={featureDescriptions.starboard}
              href="/dashboard/starboard"
              animationDelay={150}
            />
          </div>
        </div>
      </div>

      <!-- Second row of content -->
      <div class="flex flex-col lg:flex-row gap-6 mb-6">
        <!-- Top Inviters Card -->
        <div class="flex-1">
          <InviteStats animationDelay={300} />
        </div>

        <!-- Additional Feature Cards -->
        <div
          class="flex-1 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-4 mb-6">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <ChartBar class="w-6 h-6" style="color: {$colorStore.primary}" />
            </div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">More Features</h2>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Suggestions -->
            <FeatureCard
              icon={MessageSquare}
              title="Suggestions"
              isActive={guildFeatures.suggestions}
              description={featureDescriptions.suggestions}
              href="/dashboard/suggestions"
              animationDelay={200}
            />

            <!-- Giveaways -->
            <FeatureCard
              icon={Gift}
              title="Giveaways"
              isActive={guildFeatures.giveawaysEnabled}
              description={featureDescriptions.giveawaysEnabled}
              href="/dashboard/giveaways"
              animationDelay={250}
            />

            <!-- Music -->
            <FeatureCard
              icon={Music}
              title="Music"
              isActive={guildFeatures.musicEnabled}
              description={featureDescriptions.musicEnabled}
              href="/dashboard/music"
              animationDelay={200}
            />

            <!-- Multi Greets -->
            <FeatureCard
              icon={MessageSquare}
              title="Multi Greets"
              isActive={guildFeatures.multiGreets}
              description={featureDescriptions.multiGreets}
              href="/dashboard/multigreets"
              animationDelay={250}
            />
          </div>
        </div>
      </div>

      <!-- Join/Leave Graphs - using flexbox -->
      <div class="flex flex-col md:flex-row gap-6">
        {#if joinStats}
          <div
            class="flex-1 backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
            style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                  border-color: {$colorStore.primary}30;"
            in:fly={{ y: 20, duration: 300, delay: 400 }}
          >
            <StatsGraph data={joinStats} type="join" />
          </div>
        {/if}

        {#if leaveStats}
          <div
            class="flex-1 backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
            style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                  border-color: {$colorStore.primary}30;"
            in:fly={{ y: 20, duration: 300, delay: 500 }}
          >
            <StatsGraph data={leaveStats} type="leave" />
          </div>
        {/if}
      </div>
    {/if}

    <!-- Last Updated Indicator -->
    {#if $dashboardStore.lastUpdated && !loading}
      <div class="text-center text-sm py-4 opacity-60" style="color: {$colorStore.muted}">
        Last updated: {$dashboardStore.lastUpdated.toLocaleTimeString()}
        <!-- Press R to refresh (hidden for screen readers) -->
        <span class="ml-2 hidden md:inline" aria-hidden="true">
          (Press <kbd class="px-1 py-0.5 rounded" style="background: {$colorStore.primary}20">R</kbd> to refresh)
        </span>
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
    :global(*::-webkit-scrollbar) {
        @apply w-2;
    }

    :global(*::-webkit-scrollbar-track) {
        background: var(--color-primary) 10;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background: var(--color-primary) 30;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb:hover) {
        background: var(--color-primary) 50;
    }

    @container (max-width: 640px) {
        .music-controls {
            @apply flex-col items-stretch;
        }
    }

    @media (max-width: 640px) {
        :global(.card-grid) {
            @apply gap-4;
        }

        :global(.card) {
            @apply p-4;
        }
    }

    [style*="background"],
    [style*="color"] {
        @apply transition-colors duration-300;
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 100000px;
    }

    /* Add smooth transition for hover effects */
    .hover\:shadow-xl {
        transition: all 0.3s ease;
    }

    .hover\:translate-y-\[-2px\] {
        transition: all 0.3s ease;
    }

    /* Animation for the refresh button */
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }
</style>