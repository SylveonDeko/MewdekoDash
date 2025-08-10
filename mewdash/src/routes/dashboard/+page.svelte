<!-- routes/dashboard/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import { fade, fly } from "svelte/transition";
  import type { BotStatusModel, GraphStatsResponse } from "$lib/types/models";
  import { goto } from "$app/navigation";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { Bot, ChevronDown, Code, Link, RefreshCw, Search, Server, User, Users } from "lucide-svelte";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { browser } from "$app/environment";
  import { clickOutside } from "$lib/clickOutside.ts";

  // Import  components
  import TabbedDashboard from "$lib/components/layout/TabbedDashboard.svelte";
  import StatCard from "$lib/components/monitoring/StatCard.svelte";
  import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";
  import KeyboardShortcuts from "$lib/components/specialized/KeyboardShortcuts.svelte";

  // Import stores
  import { musicStore } from "$lib/stores/musicStore";
  import { inviteStore } from "$lib/stores/inviteStore";
  import { dashboardStore } from "$lib/stores/dashboardStore";
  import { userAdminGuilds } from "$lib/stores/adminGuildsStore.ts";

  // Import search component
  import SearchTrigger from "$lib/components/search/SearchTrigger.svelte";

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

  // Tab state for mini player - let TabbedDashboard handle its own initialization
  let currentActiveTab;

  // Track when data is being fetched to prevent duplicate requests
  let fetchingData = false;

  // Server selector dropdown state
  let showServerDropdown = false;
  let serverSearchTerm = "";
  let serverDropdownRef: HTMLDivElement;
  let hasEverSelectedServer = false;
  let switchingServer = false;

  // Guild detailed information
  let guildInfo = null;

  // Role statistics
  let roleStats = {
    totalRoleStates: 0,
    activeRoleGreets: 0,
    savedRoles: 0,
    totalRoles: 0,
    previousTotalRoles: 0
  };

  // Guild member statistics
  let guildMemberStats = {
    totalMembers: 0,
    botMembers: 0,
    humanMembers: 0,
    previousMemberCount: 0
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


  // Tooltip data for stats
  $: memberTooltipData = [
    { label: "Human Members", value: guildMemberStats.humanMembers },
    { label: "Bot Members", value: guildMemberStats.botMembers },
    { label: "Total Members", value: guildMemberStats.totalMembers }
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
        savedRoles: roleStates.reduce((sum, state) => {
          if (!state.savedRoles || state.savedRoles.trim() === "") return sum;
          return sum + state.savedRoles.split(",").filter(role => role.trim() !== "").length;
        }, 0),
        totalRoles: roleList.length || 0,
        previousTotalRoles: roleStats.totalRoles
      };
    } catch (err) {
      logger.error("Failed to fetch role stats:", err);
    }
  }

  async function fetchGuildMemberStats() {
    try {
      if (!$currentGuild?.id) return;

      const members = await api.getGuildMembers($currentGuild.id);

      // Store previous value for trends
      guildMemberStats.previousMemberCount = guildMemberStats.totalMembers;

      // Count bots vs humans using Discord.NET's IsBot property
      const botMembers = members.filter(member => member.isBot).length;

      guildMemberStats = {
        totalMembers: members.length,
        botMembers: botMembers,
        humanMembers: members.length - botMembers,
        previousMemberCount: guildMemberStats.totalMembers
      };
    } catch (err) {
      logger.error("Failed to fetch guild member stats:", err);
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
        multiGreets: (guildSettingsResponse?.multiGreetType || 0) > 0,
        starboard: !!guildSettingsResponse?.starboardChannel,
        suggestions: !!(guildSettingsResponse?.sugchan || guildSettingsResponse?.sugchan),
        musicEnabled: true, // Assuming always enabled
        giveawaysEnabled: !!guildSettingsResponse?.GiveawayEndMessage
      };
    } catch (err) {
      logger.error("Failed to fetch features:", err);
      // Ensure all features have boolean values even on error
      guildFeatures = {
        inviteTracking: false,
        roleStates: false,
        roleGreets: false,
        multiGreets: false,
        starboard: false,
        suggestions: false,
        musicEnabled: true,
        giveawaysEnabled: false
      };
    }
  }

  // Format numbers nicely

  // Calculate role trend

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
        fetchGuildInfo(),
        fetchRoleStats(),
        fetchGuildMemberStats(),
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

  async function fetchGuildInfo() {
    try {
      if (!$currentGuild?.id) return;
      guildInfo = await api.getGuildInfo($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch guild info:", err);
    }
  }

  // Handler for server selection
  async function handleServerSelect(guild) {
    if (switchingServer) return; // Prevent multiple switches

    switchingServer = true;
    showServerDropdown = false;
    serverSearchTerm = "";

    // Add visual feedback with smooth transition
    if (browser) {
      // Show loading state with proper timing
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Clear current data to show loading state
    guildInfo = null;
    
    currentGuild.set(guild);

    if (browser) {
      hasEverSelectedServer = true;
      localStorage.setItem("hasEverSelectedServer", "true");

      // Save the selected guild to localStorage for persistence across page reloads
      try {
        localStorage.setItem("lastSelectedGuild", JSON.stringify({
          id: guild.id.toString(),
          name: guild.name,
          icon: guild.icon,
          owner: guild.owner,
          permissions: guild.permissions,
          features: guild.features
        }));

        // Show success feedback
        logger.info(`Switched to server: ${guild.name}`);
      } catch (err) {
        logger.error("Failed to save guild to localStorage:", err);
      }
    }

    // Reset switching state after transition completes
    setTimeout(() => {
      switchingServer = false;
    }, 1200);
  }

  // Filtered guilds for server selector
  $: filteredGuilds = ($userAdminGuilds || []).filter(guild =>
    guild.name.toLowerCase().includes(serverSearchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Server dropdown functions
  function toggleServerDropdown() {
    showServerDropdown = !showServerDropdown;
    if (showServerDropdown) {
      serverSearchTerm = "";
    }
  }

  function closeServerDropdown() {
    showServerDropdown = false;
    serverSearchTerm = "";
  }

  // Handle escape key for server dropdown
  function handleServerDropdownKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && showServerDropdown) {
      closeServerDropdown();
    }
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

    // Check for previously selected server
    if (browser) {
      hasEverSelectedServer = localStorage.getItem("hasEverSelectedServer") === "true";

      // Set up keyboard event listeners
      window.addEventListener("keydown", handleServerDropdownKeydown);
    }
    
    try {
      // Fetch data first to get guildInfo
      await fetchAllData();

      // Extract colors from server icon if available, otherwise use bot avatar as fallback
      if (guildInfo?.iconUrl) {
        await colorStore.extractFromServerIcon(guildInfo.iconUrl);
      } else if ($currentGuild?.icon) {
        const serverIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
        await colorStore.extractFromServerIcon(serverIconUrl);
      } else {
        await colorStore.extractFromImage($currentInstance?.botAvatar);
      }

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
      window.removeEventListener("keydown", handleServerDropdownKeydown);
    }
  });

  $: if ($currentInstance) {
    // Extract colors from server icon if available, otherwise use bot avatar as fallback
    if (guildInfo?.iconUrl) {
      colorStore.extractFromServerIcon(guildInfo.iconUrl);
    } else if ($currentGuild?.icon) {
      const serverIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
      colorStore.extractFromServerIcon(serverIconUrl);
    } else {
      colorStore.extractFromImage($currentInstance?.botAvatar);
    }

    // Reset music polling
    if (currentUser?.id) {
      musicStore.reset();
      musicStore.startPolling(currentUser.id);
    }

    fetchAllData();
  }

  $: if ($currentGuild) {
    // Reset music store when guild changes
    musicStore.reset();
    if (currentUser?.id) {
      musicStore.startPolling(currentUser.id);
    }
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
  <div class="w-full space-y-8">
    {#if !$currentGuild}
      <!-- Welcome Dashboard -->
      <div
        class="text-center p-8 rounded-2xl backdrop-blur-sm border flex flex-col items-center relative"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
           border-color: {$colorStore.primary}30;"
        in:fly={{ y: 20, duration: 300 }}
        bind:this={serverDropdownRef}
      >
        <div class="w-20 h-20 rounded-full mb-6 flex items-center justify-center"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}30, {$colorStore.gradientMid}30);">
          <div>
            <Server size={32} style="color: {$colorStore.primary}" />
          </div>
        </div>

        <h1 class="text-2xl md:text-3xl font-semibold mb-3" style="color: {$colorStore.text}">
          Welcome to MewdekoDash
        </h1>
        <p class="text-base max-w-xl mx-auto mb-8" style="color: {$colorStore.muted}">
          Choose a server to start managing your Discord community with powerful moderation, music, and engagement
          tools.
        </p>

        <!-- Prominent Server Selection Button -->
        <div class="mb-8">
          {#if $userAdminGuilds && $userAdminGuilds.length > 0}
            <div class="flex flex-col items-center gap-4">
              <button
                class="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                style="background: linear-gradient(135deg, {$colorStore.primary}, {$colorStore.secondary}); color: white;"
                on:click={toggleServerDropdown}
                use:clickOutside
                on:clickoutside={closeServerDropdown}
              >
                <Server size={24} />
                {showServerDropdown ? 'Close Server List' : 'Select Your Server'}
                <ChevronDown size={20} class="transition-transform {showServerDropdown ? 'rotate-180' : ''}" />
              </button>
              
              <!-- Search Features -->
              <div class="text-center">
                <p class="text-sm mb-3" style="color: {$colorStore.muted}">
                  Or search for specific features and settings
                </p>
                <SearchTrigger variant="button" />
              </div>
            </div>
          {:else if $userAdminGuilds && $userAdminGuilds.length === 0}
            <div class="p-6 rounded-lg"
                 style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}30;">
              <div class="text-lg font-medium mb-2" style="color: {$colorStore.accent}">No Servers Available</div>
              <p class="text-sm" style="color: {$colorStore.muted}">
                You don't have admin permissions in any servers with this bot. Contact a server admin to get the
                necessary permissions.
              </p>
            </div>
          {:else}
            <div class="flex items-center gap-3 px-6 py-3 rounded-lg"
                 style="background: {$colorStore.primary}10; color: {$colorStore.text};">
              <div class="w-5 h-5 border-2 rounded-full animate-spin"
                   style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary}"></div>
              Loading your servers...
            </div>
          {/if}
        </div>

        <!-- Server Dropdown -->
        {#if showServerDropdown && $userAdminGuilds && $userAdminGuilds.length > 0}
          <div
            class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            in:fade={{ duration: 200 }}
            out:fade={{ duration: 150 }}
            on:click={closeServerDropdown}
            on:keydown={(e) => e.key === 'Escape' && closeServerDropdown()}
            role="dialog"
            aria-modal="true"
            aria-label="Server selection dropdown"
          >
            <div
              class="w-96 max-w-[90vw] bg-gray-900 rounded-xl shadow-2xl border overflow-hidden"
              style="border-color: {$colorStore.primary}30; background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.9));"
              in:fly={{ y: -20, duration: 200, delay: 100 }}
              out:fly={{ y: -20, duration: 150 }}
              on:click|stopPropagation
            >
              <!-- Search -->
              <div class="p-4 border-b" style="border-color: {$colorStore.primary}20;">
                <div class="relative">
                  <Search size={18} class="absolute left-3 top-1/2 transform -translate-y-1/2"
                          style="color: {$colorStore.muted}" />
                  <input
                    type="text"
                    placeholder="Search your servers..."
                    bind:value={serverSearchTerm}
                    class="w-full pl-11 pr-4 py-3 bg-black bg-opacity-50 rounded-lg border text-sm focus:outline-none focus:ring-2"
                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text}; --tw-ring-color: {$colorStore.primary}50;"
                  />
                </div>
                <div class="text-xs mt-2" style="color: {$colorStore.muted};">
                  {filteredGuilds.length} of {$userAdminGuilds.length} servers
                </div>
              </div>

              <!-- Server List -->
              <div class="max-h-80 overflow-y-auto">
                {#each filteredGuilds as guild (guild.id)}
                  <button
                    class="w-full flex items-center gap-4 p-4 hover:bg-black hover:bg-opacity-30 transition-colors text-left group"
                    on:click={() => handleServerSelect(guild)}
                  >
                    <div class="relative">
                      <img
                        src={guild.icon ?
                        `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith('a_') ? 'gif' : 'png'}?size=64` :
                        'https://cdn.discordapp.com/embed/avatars/0.png'
                      }
                        alt=""
                        class="w-12 h-12 rounded-lg object-cover transition-transform group-hover:scale-105"
                      />
                      {#if guild.owner}
                        <div
                          class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      {/if}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-semibold truncate text-base" style="color: {$colorStore.text};">
                        {guild.name}
                      </div>
                      <div class="text-sm flex items-center gap-2" style="color: {$colorStore.muted};">
                        {guild.owner ? 'Owner' : 'Admin'}
                        <span class="text-xs">•</span>
                        <span>{guild.memberCount ? guild.memberCount.toLocaleString() : 'N/A'} members</span>
                      </div>
                    </div>
                    <ChevronDown size={16} class="rotate-[-90deg] opacity-50 group-hover:opacity-100 transition-opacity"
                                 style="color: {$colorStore.primary}" />
                  </button>
                {:else}
                  <div class="p-6 text-center" style="color: {$colorStore.muted};">
                    <Search size={24} class="mx-auto mb-2 opacity-50" />
                    <div class="font-medium">No servers found</div>
                    <div class="text-sm">Try adjusting your search terms</div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        <!-- Key Features Preview -->
        <div class="max-w-2xl w-full mx-auto">
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
        >
          <span class:animate-spin={refreshing}>
            <RefreshCw size={20} />
          </span>
        </button>
      </div>

      <!-- Beautiful Server Header with integrated selector -->
      <div class="relative mb-8 overflow-visible rounded-2xl transition-all duration-500 ease-out"
           class:opacity-75={switchingServer}
           class:scale-[0.98]={switchingServer}
           style="min-height: {switchingServer ? '200px' : 'auto'};"
           in:fly={{ y: -20, duration: 600, delay: 100 }}>

        {#if switchingServer}
          <!-- Loading skeleton during server switch -->
          <div class="absolute inset-0 rounded-2xl animate-pulse"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}25, {$colorStore.gradientEnd}20);">
            <div class="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600 opacity-50 rounded-2xl"></div>
          </div>
        {:else}
          <!-- Server Banner Background (if available) -->
          {#if guildInfo?.bannerUrl}
            <div class="absolute inset-0 rounded-2xl overflow-hidden transition-opacity duration-500"
                 in:fade={{ duration: 400, delay: 200 }}>
              <img
                src="{guildInfo.bannerUrl}?size=1024"
                alt="{guildInfo.name} banner"
                class="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
              <!-- Dark overlay for text readability -->
              <div class="absolute inset-0 bg-black bg-opacity-60"></div>
              <!-- Color gradient overlay -->
              <div class="absolute inset-0 transition-opacity duration-500"
                   style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}25, {$colorStore.gradientEnd}20);">
              </div>
            </div>
          {:else}
            <!-- Fallback gradient background -->
            <div class="absolute inset-0 rounded-2xl transition-opacity duration-500"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}15);
                        backdrop-filter: blur(10px);"
                 in:fade={{ duration: 300, delay: 100 }}>
            </div>

            <!-- Subtle pattern overlay -->
            <div class="absolute inset-0 opacity-5 rounded-2xl transition-opacity duration-500"
                 style="background-image: radial-gradient(circle at 1px 1px, {$colorStore.primary} 1px, transparent 0);
                        background-size: 20px 20px;">
            </div>
          {/if}
        {/if}

        <!-- Content -->
        <div class="relative p-6 md:p-8 transition-all duration-500">
          {#if switchingServer}
            <!-- Loading skeleton for server switch -->
            <div class="flex flex-col md:flex-row items-start md:items-center gap-6 animate-pulse">
              <!-- Server Icon Skeleton -->
              <div class="relative flex-shrink-0">
                <div class="w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-lg ring-2 ring-opacity-20 animate-pulse"
                     style="background: {$colorStore.primary}20; ring-color: {$colorStore.primary};">
                  <div
                    class="w-full h-full rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 animate-pulse"></div>
                </div>
                <div
                  class="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
              </div>

              <!-- Server Info Skeleton -->
              <div class="flex-1 min-w-0 space-y-3">
                <div class="h-8 bg-gray-600 rounded-lg animate-pulse w-3/4"></div>
                <div class="h-4 bg-gray-700 rounded animate-pulse w-1/2"></div>
                <div class="flex gap-4">
                  <div class="h-4 bg-gray-700 rounded animate-pulse w-24"></div>
                  <div class="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
                  <div class="h-4 bg-gray-700 rounded animate-pulse w-16"></div>
                </div>
              </div>
            </div>
          {:else if $currentGuild}
            <!-- Selected Server Display -->
            <div
              class="flex flex-col md:flex-row items-start md:items-center gap-6 transition-all duration-500 ease-out"
              in:fade={{ duration: 400, delay: 200 }}>

              <!-- Server Icon -->
              <div class="relative flex-shrink-0">
                <div
                  class="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-lg ring-2 ring-opacity-20 transition-all duration-500 hover:scale-105"
                  style="ring-color: {$colorStore.primary};">
                  {#key $currentGuild?.id}
                    <div in:fade={{ duration: 400, delay: 100 }} out:fade={{ duration: 200 }}>
                      {#if guildInfo?.iconUrl}
                        <img
                          src="{guildInfo.iconUrl}?size=256"
                          alt="{guildInfo.name} icon"
                          class="w-full h-full object-cover transition-all duration-500 hover:scale-110"
                          loading="lazy"
                        />
                      {:else if $currentGuild.icon}
                        <img
                          src="https://cdn.discordapp.com/icons/{$currentGuild.id}/{$currentGuild.icon}.{$currentGuild.icon.startsWith('a_') ? 'gif' : 'png'}?size=256"
                          alt="{$currentGuild.name} icon"
                          class="w-full h-full object-cover transition-all duration-500 hover:scale-110"
                          loading="lazy"
                        />
                      {:else}
                        <div
                          class="w-full h-full flex items-center justify-center text-2xl font-bold transition-all duration-500 hover:scale-110"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
                          <Server size={32} />
                        </div>
                      {/if}
                    </div>
                  {/key}
                </div>

                <!-- Online indicator -->
                <div
                  class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-sm transition-all duration-500 hover:scale-110"
                  in:fade={{ delay: 300 }}></div>
              </div>

              <!-- Server Info -->
              <div class="flex-1 min-w-0 transition-all duration-500">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                  <!-- Clickable Server Name Section -->
                  <div class="flex-1 min-w-0 relative" bind:this={serverDropdownRef}>
                    <!-- Clickable server name -->
                    <button
                      class="group flex items-center gap-2 mb-2 rounded-lg p-2 -m-2 transition-all duration-300 hover:bg-black hover:bg-opacity-10"
                      on:click={toggleServerDropdown}
                      use:clickOutside
                      on:clickoutside={closeServerDropdown}
                    >
                      {#key $currentGuild?.id}
                        <h1
                          class="text-2xl md:text-3xl font-bold truncate text-left transition-all duration-500 transform"
                          style="color: {$colorStore.text};"
                          in:fade={{ duration: 400, delay: 200 }}
                          out:fade={{ duration: 200 }}>
                          {guildInfo?.name || $currentGuild.name}
                        </h1>
                      {/key}
                      <ChevronDown
                        size={20}
                        style="color: {$colorStore.muted}"
                        class="transition-all duration-300 group-hover:scale-110 {showServerDropdown ? 'rotate-180' : ''}"
                      />
                    </button>

                    <!-- Server Dropdown -->
                    {#if showServerDropdown}
                      <div
                        class="absolute top-full left-0 mt-2 w-80 bg-gray-900 rounded-xl shadow-2xl border z-50 overflow-hidden"
                        style="border-color: {$colorStore.primary}30; background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.9));"
                        in:fade={{ duration: 150 }}
                        out:fade={{ duration: 100 }}
                      >
                        <!-- Search -->
                        <div class="p-3 border-b" style="border-color: {$colorStore.primary}20;">
                          <div class="relative">
                            <Search size={16} class="absolute left-3 top-1/2 transform -translate-y-1/2"
                                    style="color: {$colorStore.muted}" />
                            <input
                              type="text"
                              placeholder="Search servers..."
                              bind:value={serverSearchTerm}
                              class="w-full pl-10 pr-4 py-2 bg-black bg-opacity-50 rounded-lg border text-sm"
                              style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            />
                          </div>
                        </div>

                        <!-- Server List -->
                        <div class="max-h-60 overflow-y-auto">
                          {#each filteredGuilds as guild (guild.id)}
                            <button
                              class="w-full flex items-center gap-3 p-3 hover:bg-black hover:bg-opacity-30 transition-colors text-left"
                              class:bg-black={guild.id === $currentGuild.id}
                              class:bg-opacity-20={guild.id === $currentGuild.id}
                              on:click={() => handleServerSelect(guild)}
                            >
                              <img
                                src={guild.icon ? 
                                  `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith('a_') ? 'gif' : 'png'}?size=64` :
                                  'https://cdn.discordapp.com/embed/avatars/0.png'
                                }
                                alt=""
                                class="w-10 h-10 rounded-lg object-cover"
                              />
                              <div class="flex-1 min-w-0">
                                <div class="font-medium truncate" style="color: {$colorStore.text};">
                                  {guild.name}
                                </div>
                                <div class="text-xs" style="color: {$colorStore.muted};">
                                  {guild.owner ? 'Owner' : 'Admin'}
                                </div>
                              </div>
                              {#if guild.id === $currentGuild.id}
                                <div class="w-2 h-2 rounded-full" style="background: {$colorStore.primary};"></div>
                              {/if}
                            </button>
                          {:else}
                            <div class="p-4 text-center" style="color: {$colorStore.muted};">
                              No servers found
                            </div>
                          {/each}
                        </div>
                      </div>
                    {/if}

                    {#if guildInfo?.description || $currentGuild.description}
                      <div in:fade={{ duration: 400, delay: 300 }} out:fade={{ duration: 200 }}>
                        <p class="text-sm md:text-base mb-3 line-clamp-2 transition-all duration-300"
                           style="color: {$colorStore.muted};">
                          {guildInfo?.description || $currentGuild.description}
                        </p>
                      </div>
                    {/if}

                    <!-- Quick stats -->
                    <div class="flex flex-wrap items-center gap-4 text-sm transition-all duration-500"
                         in:fade={{ duration: 400, delay: 400 }} out:fade={{ duration: 200 }}>
                      <div class="flex items-center gap-2 transition-all duration-300 hover:scale-105">
                        <Users size={16} style="color: {$colorStore.primary}" />
                        <span style="color: {$colorStore.text}">
                          {(guildInfo?.memberCount || guildMemberStats.totalMembers).toLocaleString()} members
                        </span>
                      </div>

                      <div class="flex items-center gap-2 transition-all duration-300 hover:scale-105">
                        <User size={16} style="color: {$colorStore.secondary}" />
                        <span style="color: {$colorStore.text}">
                          {guildMemberStats.humanMembers.toLocaleString()} humans
                        </span>
                      </div>

                      {#if botStatus?.isReady}
                        <div class="flex items-center gap-2 transition-all duration-300 hover:scale-105">
                          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span style="color: {$colorStore.text}">Bot Online</span>
                        </div>
                      {/if}
                    </div>
                  </div>

                  <!-- Action buttons and Mini Music Player Container -->
                  <div class="flex items-start gap-3 transition-all duration-500 ease-in-out"
                       in:fade={{ duration: 400, delay: 500 }} out:fade={{ duration: 200 }}>
                    <!-- Action buttons section -->
                    <div class="flex items-center gap-3 flex-wrap transition-all duration-500 ease-in-out">
                      {#if $currentGuild.owner}
                        <div
                          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105"
                          style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                          in:fade={{ duration: 300, delay: 100 }}>
                          Owner
                        </div>
                      {/if}

                      <button
                        class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                        on:click={() => window.open(`https://discord.com/channels/${$currentGuild.id}`, '_blank')}
                        in:fade={{ duration: 300, delay: 200 }}
                      >
                        <Link size={16} />
                        <span class="hidden sm:inline">View Server</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {:else}
            <!-- This case should not occur since we handle server selection in the welcome state -->
            <div class="text-center p-6">
              <div class="text-lg font-medium mb-2" style="color: {$colorStore.text};">
                Unexpected State
              </div>
              <p class="text-sm" style="color: {$colorStore.muted};">
                Please refresh the page to continue.
              </p>
              <button
                class="mt-4 px-4 py-2 rounded-lg transition-colors"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                on:click={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </div>
          {/if}
        </div>

        <!-- Bottom border accent -->
        <div class="h-1"
             style="background: linear-gradient(90deg, {$colorStore.primary}, {$colorStore.secondary}, {$colorStore.accent});"></div>
      </div>

      <!-- Tabbed Dashboard -->
      {#key $currentGuild?.id}
        <div class="transition-all duration-500 ease-out"
             class:opacity-75={switchingServer}
             class:scale-[0.98]={switchingServer}
             in:fade={{ duration: switchingServer ? 500 : 300, delay: switchingServer ? 400 : 0 }}
             out:fade={{ duration: 200 }}>
          <TabbedDashboard
            {botStatus}
            {guildMemberStats}
            {roleStats}
            {joinStats}
            {leaveStats}
            {guildFeatures}
            onRefresh={fetchAllData}
            {refreshing}
            bind:activeTab={currentActiveTab}
          />
        </div>
      {/key}
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

    /* Smooth loading transitions for better UX */

    /* Smooth height transitions */
    [style*="min-height"] {
        transition: min-height 0.5s ease-out;
    }

    /* Performance optimizations for transforms */
    .transform {
        transform: translateZ(0);
        backface-visibility: hidden;
    }
</style>