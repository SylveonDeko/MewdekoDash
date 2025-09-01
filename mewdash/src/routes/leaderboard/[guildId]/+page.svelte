<!-- routes/leaderboard/[guildId]/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { fade, fly } from "svelte/transition";
  import { api } from "$lib/api";
  import { logger } from "$lib/logger";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentInstance } from "$lib/stores/instanceStore";
  import {
    Award,
    Crown,
    Star,
    TrendingUp,
    Users,
    Zap
  } from "lucide-svelte";

  export let data;

  // Authentication required
  let currentUser = data.user;
  let userId = currentUser ? BigInt(currentUser.id) : null;
  
  // Get guild ID from URL params
  $: guildId = BigInt($page.params.guildId);
  
  // Guild membership state
  let isMember = false;
  let checkingMembership = false;

  // State
  let loading = true;
  let paginationLoading = false;
  let error = "";
  let guildInfo: any = null;
  let leaderboard: any[] = [];
  let serverStats: any = {};
  let currentPage = 1;
  let pageSize = 20;
  let availableInstances: any[] = [];
  let selectedInstance: any = null;
  let checkingInstances = false;

  // Instance state tracking (like InstanceSelector.svelte)
  let instanceStates: Record<string, {
    loading: boolean;
    hasGuild: boolean;
    error: string | null;
    checked: boolean;
    guildInfo?: any;
  }> = {};

  // Find which instances have this guild (following InstanceSelector pattern)
  async function findInstancesWithGuild() {
    if (!guildId) return;

    checkingInstances = true;
    try {
      // Get all available instances
      const instances = await api.getBotInstances().catch(() => []);
      
      if (instances.length === 0) {
        error = "No bot instances available";
        checkingInstances = false;
        return;
      }

      // Check each instance in parallel (like InstanceSelector does)
      await Promise.all(instances.map(async (instance: any) => {
        const instanceId = instance.botId.toString();
        
        // Set loading state
        instanceStates[instanceId] = {
          loading: true,
          hasGuild: false,
          error: null,
          checked: false
        };
        instanceStates = { ...instanceStates }; // Trigger reactivity

        try {
          // Set the instance in the store temporarily to check
          currentInstance.set(instance);
          
          const hasGuildResponse = await api.checkInstanceHasGuild(guildId);
          
          instanceStates[instanceId] = {
            loading: false,
            hasGuild: hasGuildResponse.hasGuild,
            error: null,
            checked: true,
            guildInfo: hasGuildResponse.hasGuild ? hasGuildResponse : null
          };

          // Add to available instances if it has the guild
          if (hasGuildResponse.hasGuild) {
            availableInstances = [...availableInstances, { ...instance, guildInfo: hasGuildResponse }];
            
            // Auto-select first available instance and keep it set in store
            if (!selectedInstance) {
              selectedInstance = { ...instance, guildInfo: hasGuildResponse };
              guildInfo = hasGuildResponse;
              currentInstance.set(instance); // Keep this instance selected
            }
          }

        } catch (err: any) {
          const is404 = err?.message?.includes("404") || err?.status === 404;
          
          instanceStates[instanceId] = {
            loading: false,
            hasGuild: false,
            error: is404 ? null : "Failed to check guild",
            checked: true
          };
        }
        
        instanceStates = { ...instanceStates }; // Trigger reactivity
      }));

    } catch (err) {
      logger.error("Failed to find instances:", err);
      error = "Failed to check bot instances";
    } finally {
      checkingInstances = false;
    }
  }

  // Check if user is a member of this guild
  async function checkGuildMembership() {
    if (!userId || !selectedInstance) return;

    checkingMembership = true;
    try {
      // Instance is already set in store from findInstancesWithGuild
      const mutualGuilds = await api.getMutualGuilds(userId, false);
      console.log("Mutual guilds:", mutualGuilds);
      console.log("Looking for guildId:", guildId);
      console.log("Guild IDs in mutuals:", mutualGuilds?.map((g: any) => g.id));
      
      isMember = mutualGuilds?.some((guild: any) => {
        // Handle BigInt comparison properly
        const guildIdBigInt = typeof guild.id === 'string' ? BigInt(guild.id) : guild.id;
        console.log("Comparing:", guildIdBigInt, "===", guildId);
        return guildIdBigInt === guildId;
      }) || false;
      
      console.log("Is member:", isMember);
      
      if (!isMember) {
        error = "You must be a member of this server to view its leaderboard";
      }
    } catch (err) {
      logger.error("Failed to check guild membership:", err);
      error = "Failed to verify guild membership";
      isMember = false;
    } finally {
      checkingMembership = false;
    }
  }

  // Load member leaderboard data (includes message counts)
  async function loadLeaderboard(isPagination = false) {
    if (!guildId || !selectedInstance || !isMember) return;

    if (isPagination) {
      paginationLoading = true;
    } else {
      loading = true;
    }
    error = "";

    try {
      // Instance is already set in store, no need for custom headers
      if (isPagination) {
        // Only load leaderboard for pagination
        const board = await api.getXpLeaderboard(guildId, currentPage, pageSize).catch(() => []);
        
        // Enhance with message counts for members
        const enhancedBoard = await Promise.all(
          board.map(async (user: any) => {
            try {
              const messageStats = await api.getUserMessages(guildId, BigInt(user.userId)).catch(() => ({ totalMessages: 0 }));
              return { ...user, messageCount: messageStats.totalMessages || 0 };
            } catch {
              return { ...user, messageCount: 0 };
            }
          })
        );
        
        leaderboard = enhancedBoard;
      } else {
        // Load both leaderboard and stats for initial load
        const [board, stats] = await Promise.all([
          api.getXpLeaderboard(guildId, currentPage, pageSize).catch(() => []),
          api.getXpServerStats(guildId).catch(() => ({}))
        ]);

        // Enhance leaderboard with message counts for members
        const enhancedBoard = await Promise.all(
          board.map(async (user: any) => {
            try {
              const messageStats = await api.getUserMessages(guildId, BigInt(user.userId)).catch(() => ({ totalMessages: 0 }));
              return { ...user, messageCount: messageStats.totalMessages || 0 };
            } catch {
              return { ...user, messageCount: 0 };
            }
          })
        );

        leaderboard = enhancedBoard;
        serverStats = stats;

        // Extract colors from guild icon if available
        if (guildInfo?.iconUrl) {
          await colorStore.extractFromImage(guildInfo.iconUrl);
        }
      }

    } catch (err: any) {
      logger.error("Failed to load leaderboard:", err);
      error = "Failed to load leaderboard data";
    } finally {
      if (isPagination) {
        paginationLoading = false;
      } else {
        loading = false;
      }
    }
  }

  function goToPage(page: number) {
    if (page < 1 || paginationLoading) return;
    currentPage = page;
    loadLeaderboard(true); // Pass true for pagination
  }

  function getRankIcon(rank: number) {
    switch (rank) {
      case 1: return Crown;
      case 2: return Award;
      case 3: return Star;
      default: return TrendingUp;
    }
  }

  function getRankColor(rank: number) {
    switch (rank) {
      case 1: return "#FFD700"; // Gold
      case 2: return "#C0C0C0"; // Silver
      case 3: return "#CD7F32"; // Bronze
      default: return "#6b7280"; // Gray
    }
  }

  // Reactive state tracking (like InstanceSelector)
  $: stillChecking = Object.values(instanceStates).some(state => state.loading);
  $: showLoadingState = (loading && !paginationLoading) || checkingInstances || stillChecking || checkingMembership;

  onMount(async () => {
    // Require authentication
    if (!currentUser) {
      error = "Please log in to view server leaderboards";
      loading = false;
      return;
    }

    try {
      await findInstancesWithGuild();
      if (selectedInstance) {
        await checkGuildMembership();
        if (isMember) {
          await loadLeaderboard();
        } else {
          loading = false; // Stop loading if not a member
        }
      } else {
        loading = false; // Stop loading if no instances found
      }
    } catch (err) {
      logger.error("Error in onMount:", err);
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>XP Leaderboard - {guildInfo?.name || 'Server'}</title>
  <meta name="description" content="View the XP leaderboard for {guildInfo?.name || 'this server'}" />
</svelte:head>

<div class="min-h-screen p-4 md:p-6"
     style="background: radial-gradient(circle at top, {$colorStore.gradientStart}15 0%, {$colorStore.gradientMid}10 50%, {$colorStore.gradientEnd}05 100%);">

  <div class="max-w-6xl mx-auto">
    {#if showLoadingState}
      <!-- Loading State (unified like InstanceSelector) -->
      <div class="flex justify-center items-center min-h-[60vh]">
        <div class="text-center">
          <div class="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
               style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"></div>
          <p class="text-lg" style="color: {$colorStore.muted}">
            {#if checkingInstances || stillChecking}
              Finding which bot has this server...
            {:else if loading}
              Loading leaderboard...
            {/if}
          </p>
        </div>
      </div>

    {:else if !currentUser}
      <!-- Not Logged In -->
      <div class="text-center py-16">
        <div class="p-6 rounded-2xl border max-w-md mx-auto"
             style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.primary}10);
                    border-color: {$colorStore.primary}30;">
          <div class="text-6xl mb-4">🔐</div>
          <h2 class="text-2xl font-bold mb-2" style="color: {$colorStore.text}">Login Required</h2>
          <p class="text-lg mb-4" style="color: {$colorStore.muted}">
            Please log in with Discord to view server leaderboards
          </p>
          <a
            href="/api/discord/login"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
            style="background: {$colorStore.primary}; color: white;"
          >
            Login with Discord
          </a>
        </div>
      </div>

    {:else if availableInstances.length === 0}
      <!-- No Instances Found -->
      <div class="text-center py-16">
        <div class="p-6 rounded-2xl border max-w-md mx-auto"
             style="background: linear-gradient(135deg, {$colorStore.accent}15, {$colorStore.accent}10);
                    border-color: {$colorStore.accent}30;">
          <div class="text-6xl mb-4">🤖</div>
          <h2 class="text-2xl font-bold mb-2" style="color: {$colorStore.text}">Server Not Found</h2>
          <p class="text-lg" style="color: {$colorStore.muted}">
            This server doesn't appear to be using Mewdeko, or XP tracking isn't enabled.
          </p>
        </div>
      </div>

    {:else if selectedInstance && !isMember && !checkingMembership}
      <!-- Not a Member -->
      <div class="text-center py-16">
        <div class="p-6 rounded-2xl border max-w-md mx-auto"
             style="background: linear-gradient(135deg, {$colorStore.accent}15, {$colorStore.accent}10);
                    border-color: {$colorStore.accent}30;">
          <div class="text-6xl mb-4">🚫</div>
          <h2 class="text-2xl font-bold mb-2" style="color: {$colorStore.text}">Member Access Only</h2>
          <p class="text-lg" style="color: {$colorStore.muted}">
            You must be a member of {guildInfo?.guildName || 'this server'} to view its leaderboard
          </p>
        </div>
      </div>

    {:else if error}
      <!-- Error State -->
      <div class="text-center py-16">
        <div class="p-6 rounded-2xl border max-w-md mx-auto"
             style="background: linear-gradient(135deg, {$colorStore.accent}15, {$colorStore.accent}10);
                    border-color: {$colorStore.accent}30;">
          <div class="text-6xl mb-4">😅</div>
          <h2 class="text-2xl font-bold mb-2" style="color: {$colorStore.text}">Oops!</h2>
          <p class="text-lg" style="color: {$colorStore.muted}">{error}</p>
        </div>
      </div>

    {:else}
      <!-- Header -->
      <div class="text-center mb-8" in:fade={{ duration: 300 }}>
        {#if guildInfo?.iconUrl}
          <img
            src={guildInfo.iconUrl}
            alt=""
            class="w-20 h-20 rounded-2xl mx-auto mb-4 border-4"
            style="border-color: {$colorStore.primary}50;"
          />
        {/if}
        <h1 class="text-4xl font-bold mb-2" style="color: {$colorStore.text}">
          {guildInfo?.name || 'Server'} Leaderboard
        </h1>
        <p class="text-lg mb-4" style="color: {$colorStore.muted}">
          Top members by experience points
        </p>

        <!-- Instance Selector (if multiple instances) -->
        {#if availableInstances.length > 1}
          <div class="flex justify-center">
            <div class="p-2 rounded-xl border"
                 style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}20;">
              <select
                bind:value={selectedInstance}
                class="px-3 py-2 rounded-lg border-none text-sm"
                style="background: {$colorStore.primary}08; color: {$colorStore.text};"
              >
                {#each availableInstances as instance}
                  <option value={instance}>
                    {instance.botName}
                    {#if instance.isActive}
                      ✅
                    {:else}
                      ⚠️
                    {/if}
                  </option>
                {/each}
              </select>
            </div>
          </div>
        {:else if selectedInstance}
          <div class="flex justify-center">
            <div class="px-4 py-2 rounded-lg border text-sm"
                 style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}20; color: {$colorStore.text};">
              Bot Instance: {selectedInstance.botName}
              {#if selectedInstance.isActive}
                <span class="text-green-500">●</span>
              {:else}
                <span class="text-yellow-500">●</span>
              {/if}
            </div>
          </div>
        {/if}
      </div>

      <!-- Server Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" in:fly={{ y: 20, duration: 400, delay: 100 }}>
        <div class="p-6 rounded-2xl text-center border backdrop-blur-sm"
             style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}15);
                    border-color: {$colorStore.primary}30;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <Users class="w-8 h-8 mx-auto mb-2" style="color: {$colorStore.primary}" />
          <div class="text-2xl font-bold" style="color: {$colorStore.text}">{serverStats.totalUsers?.toLocaleString() || 0}</div>
          <div class="text-sm" style="color: {$colorStore.muted}">Total Users</div>
        </div>

        <div class="p-6 rounded-2xl text-center border backdrop-blur-sm"
             style="background: linear-gradient(135deg, {$colorStore.secondary}15, {$colorStore.accent}15);
                    border-color: {$colorStore.secondary}30;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <Zap class="w-8 h-8 mx-auto mb-2" style="color: {$colorStore.secondary}" />
          <div class="text-2xl font-bold" style="color: {$colorStore.text}">{serverStats.totalXp?.toLocaleString() || 0}</div>
          <div class="text-sm" style="color: {$colorStore.muted}">Total XP</div>
        </div>

        <div class="p-6 rounded-2xl text-center border backdrop-blur-sm"
             style="background: linear-gradient(135deg, {$colorStore.accent}15, {$colorStore.primary}15);
                    border-color: {$colorStore.accent}30;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <TrendingUp class="w-8 h-8 mx-auto mb-2" style="color: {$colorStore.accent}" />
          <div class="text-2xl font-bold" style="color: {$colorStore.text}">{serverStats.averageLevel || 0}</div>
          <div class="text-sm" style="color: {$colorStore.muted}">Avg Level</div>
        </div>

        <div class="p-6 rounded-2xl text-center border backdrop-blur-sm"
             style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}15);
                    border-color: {$colorStore.primary}30;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <Crown class="w-8 h-8 mx-auto mb-2" style="color: {$colorStore.primary}" />
          <div class="text-2xl font-bold" style="color: {$colorStore.text}">{serverStats.highestLevel || 0}</div>
          <div class="text-sm" style="color: {$colorStore.muted}">Highest Level</div>
        </div>
      </div>

      <!-- Leaderboard -->
      <div class="rounded-2xl border backdrop-blur-sm overflow-hidden"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                  border-color: {$colorStore.primary}30;
                  box-shadow: 0 8px 32px rgba(0,0,0,0.3);"
           in:fly={{ y: 20, duration: 400, delay: 200 }}>
        
        <div class="p-6 border-b" style="border-color: {$colorStore.primary}20;">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold flex items-center gap-3" style="color: {$colorStore.text}">
              <Users class="w-6 h-6" />
              Top Members
            </h2>
            
            <!-- Top Pagination -->
            {#if leaderboard.length >= pageSize}
              <div class="flex gap-2">
                <button
                  class="px-3 py-1.5 rounded-lg border transition-all hover:scale-105 text-sm min-h-[36px] flex items-center justify-center"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border-color: {$colorStore.primary}30;"
                  on:click={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1 || paginationLoading}
                >
                  {#if paginationLoading && currentPage > 1}
                    <div class="w-3 h-3 border-2 rounded-full animate-spin"
                         style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
                  {:else}
                    ←
                  {/if}
                </button>
                
                <div class="px-3 py-1.5 rounded-lg border text-sm min-h-[36px] flex items-center"
                     style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}20; color: {$colorStore.text};">
                  {currentPage}
                </div>
                
                <button
                  class="px-3 py-1.5 rounded-lg border transition-all hover:scale-105 text-sm min-h-[36px] flex items-center justify-center"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border-color: {$colorStore.primary}30;"
                  on:click={() => goToPage(currentPage + 1)}
                  disabled={leaderboard.length < pageSize || paginationLoading}
                >
                  {#if paginationLoading}
                    <div class="w-3 h-3 border-2 rounded-full animate-spin"
                         style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
                  {:else}
                    →
                  {/if}
                </button>
              </div>
            {/if}
          </div>
        </div>

        <div class="divide-y" style="divide-color: {$colorStore.primary}10;">
          {#each leaderboard as user, index (user.userId)}
            <div class="p-4 hover:bg-black hover:bg-opacity-20 transition-colors"
                 in:fly={{ x: -20, duration: 300, delay: index * 50 }}>
              <div class="flex items-center gap-4">
                <!-- Rank -->
                <div class="flex items-center justify-center w-12 h-12 rounded-xl border-2"
                     style="background: {getRankColor(user.rank)}20; border-color: {getRankColor(user.rank)}40;">
                  {#if user.rank <= 3}
                    <svelte:component this={getRankIcon(user.rank)} 
                                      class="w-6 h-6" 
                                      style="color: {getRankColor(user.rank)}" />
                  {:else}
                    <span class="font-bold text-lg" style="color: {getRankColor(user.rank)}">
                      {user.rank}
                    </span>
                  {/if}
                </div>

                <!-- User Info -->
                <div class="flex items-center gap-3 flex-1">
                  <img
                    src={user.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                    alt=""
                    class="w-12 h-12 rounded-xl"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-lg truncate" style="color: {$colorStore.text}" title={user.username}>
                      {user.username}
                    </div>
                    <div class="text-sm truncate" style="color: {$colorStore.muted}">
                      Level {user.level} • {user.totalXp.toLocaleString()} XP
                      {#if user.messageCount !== undefined}
                        • {user.messageCount.toLocaleString()} messages
                      {/if}
                    </div>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div class="hidden md:block w-32">
                  <div class="w-full bg-gray-600 rounded-full h-2">
                    <div
                      class="h-2 rounded-full transition-all duration-500"
                      style="background: linear-gradient(90deg, {$colorStore.primary}, {$colorStore.secondary});
                             width: {Math.min((user.levelXp / user.requiredXp) * 100, 100)}%;"
                    ></div>
                  </div>
                  <div class="text-xs mt-1 text-center" style="color: {$colorStore.muted}">
                    {user.levelXp.toLocaleString()} / {user.requiredXp.toLocaleString()}
                  </div>
                </div>

                <!-- Level Badge -->
                <div class="text-right">
                  <div class="px-3 py-1 rounded-lg border"
                       style="background: {$colorStore.primary}20; border-color: {$colorStore.primary}40;">
                    <span class="font-bold" style="color: {$colorStore.primary}">
                      Level {user.level}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          {:else}
            <div class="p-8 text-center">
              <Users class="w-16 h-16 mx-auto mb-4" style="color: {$colorStore.primary}50" />
              <p class="text-lg" style="color: {$colorStore.text}">No leaderboard data available</p>
              <p class="text-sm" style="color: {$colorStore.muted}">This server may not have XP tracking enabled</p>
            </div>
          {/each}
        </div>

        <!-- Pagination -->
        {#if leaderboard.length >= pageSize}
          <div class="p-4 border-t flex justify-center gap-2" style="border-color: {$colorStore.primary}20;">
            <button
              class="px-4 py-2 rounded-lg border transition-all hover:scale-105 min-h-[40px] flex items-center justify-center"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border-color: {$colorStore.primary}30;"
              on:click={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1 || paginationLoading}
            >
              {#if paginationLoading && currentPage > 1}
                <div class="w-4 h-4 border-2 rounded-full animate-spin"
                     style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
              {:else}
                Previous
              {/if}
            </button>
            
            <div class="px-4 py-2 rounded-lg border min-h-[40px] flex items-center"
                 style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}20; color: {$colorStore.text};">
              Page {currentPage}
            </div>
            
            <button
              class="px-4 py-2 rounded-lg border transition-all hover:scale-105 min-h-[40px] flex items-center justify-center"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border-color: {$colorStore.primary}30;"
              on:click={() => goToPage(currentPage + 1)}
              disabled={leaderboard.length < pageSize || paginationLoading}
            >
              {#if paginationLoading}
                <div class="w-4 h-4 border-2 rounded-full animate-spin"
                     style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
              {:else}
                Next
              {/if}
            </button>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="text-center mt-8 p-6 rounded-2xl border"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                  border-color: {$colorStore.primary}20;">
        <p class="text-sm" style="color: {$colorStore.muted}">
          Powered by <span style="color: {$colorStore.primary};" class="font-semibold">Mewdeko</span>
        </p>
        <p class="text-xs mt-1" style="color: {$colorStore.muted}">
          Join this server to start earning XP and climb the leaderboard!
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  :global(body) {
    background-color: #0f172a;
  }
</style>