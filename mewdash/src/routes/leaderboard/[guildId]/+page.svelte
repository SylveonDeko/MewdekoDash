<!-- routes/leaderboard/[guildId]/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { fade, fly } from "svelte/transition";
  import { clientApi, instanceManagementApi, messageCountApi, xpApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentInstance } from "$lib/stores/instanceStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ComponentEmbed from "$lib/components/layout/ComponentEmbed.svelte";
  import { buttons, container, header, linkButton, plain, SITE_ORIGIN, separator, text, withRows } from "$lib/componentEmbed";

  let { data } = $props();

  let previewName = $derived(data.preview?.guildName ?? null);

  let previewEmbed = $derived.by(() => {
    const preview = data.preview;
    if (!preview?.guildName) return null;
    const rows = (preview.top ?? []).map(
      (entry) => m.public.leaderboardEmbedRow({ rank: entry.rank, user: plain(entry.username), level: entry.level })
    );
    return withRows(
      (list) =>
        container(
          header(`## ${plain(preview.guildName)}\n${m.common.xpLeaderboard()}`, preview.guildIcon),
          separator(),
          list.length ? text(list.join("\n")) : null,
          list.length ? separator() : null,
          buttons(linkButton(m.public.leaderboardEmbedOpen(), `${SITE_ORIGIN}/leaderboard/${$page.params.guildId}`))
        ),
      rows
    );
  });

  // Authentication required
  let currentUser = $derived(data.user);
  let userId = $derived(currentUser ? BigInt(currentUser.id) : null);
  
  // Get guild ID from URL params
  let guildId = $derived(BigInt($page.params.guildId ?? "0"));
  
  // Guild membership state
  let isMember = $state(false);
  let checkingMembership = $state(false);

  // State
  let loading = $state(true);
  let paginationLoading = $state(false);
  let error = $state("");
  let guildInfo: any = $state(null);
  let leaderboard: any[] = $state([]);
  let serverStats: any = $state({});
  let currentPage = $state(1);
  let pageSize = 20;
  let availableInstances: any[] = $state([]);
  let selectedInstance: any = $state(null);
  let checkingInstances = $state(false);

  // Instance state tracking (like InstanceSelector.svelte)
  let instanceStates: Record<string, {
    loading: boolean;
    hasGuild: boolean;
    error: string | null;
    checked: boolean;
    guildInfo?: any;
  }> = $state({});

  // Find which instances have this guild (following InstanceSelector pattern)
  async function findInstancesWithGuild() {
    if (!guildId) return;

    checkingInstances = true;
    try {
      // Get all available instances
      const instances = await instanceManagementApi.getBotInstances().catch(() => []);
      
      if (instances.length === 0) {
        error = m.common.noBotInstancesAvailable();
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

          const hasGuildResponse = await clientApi.hasGuild(guildId);
          
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
            error: is404 ? null : m.public.leaderboardCheckGuildFailed(),
            checked: true
          };
        }
        
        instanceStates = { ...instanceStates }; // Trigger reactivity
      }));

    } catch (err) {
      logger.error("Failed to find instances:", err);
      error = m.public.leaderboardCheckInstancesFailed();
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
      const mutualGuilds = await clientApi.getMutualGuilds(userId, false);
      
      isMember = mutualGuilds?.some((guild: any) => {
        // Handle BigInt comparison properly
        const guildIdBigInt = typeof guild.id === 'string' ? BigInt(guild.id) : guild.id;
        return guildIdBigInt === guildId;
      }) || false;
      
      
      if (!isMember) {
        error = m.public.leaderboardMembersOnly();
      }
    } catch (err) {
      logger.error("Failed to check guild membership:", err);
      error = m.public.leaderboardVerifyFailed();
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
        const board = await xpApi.getXpLeaderboard(guildId, currentPage, pageSize).catch(() => []);
        
        // Enhance with message counts for members
        leaderboard = await Promise.all(
          board.map(async (user: any) => {
            try {
              const messageStats = await messageCountApi.getUserMessageStats(guildId, BigInt(user.userId)).catch(() => ({ totalMessages: 0 }));
              return { ...user, messageCount: messageStats.totalMessages || 0 };
            } catch {
              return { ...user, messageCount: 0 };
            }
          })
        );
      } else {
        // Load both leaderboard and stats for initial load
        const [board, stats] = await Promise.all([
          xpApi.getXpLeaderboard(guildId, currentPage, pageSize).catch(() => []),
          xpApi.getXpServerStats(guildId).catch(() => ({}))
        ]);

        // Enhance leaderboard with message counts for members
        leaderboard = await Promise.all(
          board.map(async (user: any) => {
            try {
              const messageStats = await messageCountApi.getUserMessageStats(guildId, BigInt(user.userId)).catch(() => ({ totalMessages: 0 }));
              return { ...user, messageCount: messageStats.totalMessages || 0 };
            } catch {
              return { ...user, messageCount: 0 };
            }
          })
        );
        serverStats = stats;

        // Extract colors from guild icon if available
        if (guildInfo?.iconUrl) {
          await colorStore.extractFromImage(guildInfo.iconUrl);
        }
      }

    } catch (err: any) {
      logger.error("Failed to load leaderboard:", err);
      error = m.public.leaderboardLoadFailed();
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
      case 1:
        return "fa-crown";
      case 2:
        return "fa-star";
      case 3:
        return "fa-star";
      default:
        return "fa-arrow-trend-up";
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
  let stillChecking = $derived(Object.values(instanceStates).some(state => state.loading));
  let showLoadingState = $derived((loading && !paginationLoading) || checkingInstances || stillChecking || checkingMembership);

  onMount(async () => {
    // Require authentication
    if (!currentUser) {
      error = m.public.leaderboardLoginPrompt();
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

<ComponentEmbed embed={previewEmbed} />

<svelte:head>
  <title>{m.public.leaderboardTitle({ server: guildInfo?.name || previewName || m.features.categoryServer() })}</title>
  <meta name="description" content={m.public.leaderboardDescription({ server: guildInfo?.name || previewName || m.common.thisServer() })} />
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
              {m.public.leaderboardFindingBot()}
            {:else if loading}
              {m.public.leaderboardLoading()}
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
          <h2 class="text-2xl font-bold mb-2" style="color: {$colorStore.text}">{m.common.loginRequired()}</h2>
          <p class="text-lg mb-4" style="color: {$colorStore.muted}">
            {m.public.leaderboardPleaseLogInWithDiscord()}
          </p>
          <a
            href="/api/discord/login?redirect_to={encodeURIComponent($page.url.pathname)}"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
            style="background: {$colorStore.primary}; color: white;"
          >
            {m.common.loginWithDiscord()}
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
          <h2 class="text-2xl font-bold mb-2" style="color: {$colorStore.text}">{m.public.leaderboardServerNotFound()}</h2>
          <p class="text-lg" style="color: {$colorStore.muted}">
            {m.public.leaderboardThisServerDoesntAppearTo()}
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
          <h2 class="text-2xl font-bold mb-2" style="color: {$colorStore.text}">{m.public.leaderboardMemberAccessOnly()}</h2>
          <p class="text-lg" style="color: {$colorStore.muted}">
            {m.public.leaderboardMustBeMember({ server: guildInfo?.guildName || m.common.thisServer() })}
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
          <h2 class="text-2xl font-bold mb-2" style="color: {$colorStore.text}">{m.public.leaderboardOops()}</h2>
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
          >
        {/if}
        <h1 class="text-4xl font-bold mb-2" style="color: {$colorStore.text}">
          {m.public.leaderboardHeading({ server: guildInfo?.name || m.features.categoryServer() })}
        </h1>
        <p class="text-lg mb-4" style="color: {$colorStore.muted}">
          {m.public.leaderboardTopMembersByExperiencePoints()}
        </p>

        <!-- Instance Selector (if multiple instances) -->
        {#if availableInstances.length > 1}
          <div class="flex justify-center">
            <div class="p-2 rounded-xl border"
                 style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}20;">
              <div class="min-w-[220px]">
                <DiscordSelector
                  type="custom"
                  options={availableInstances.map(instance => ({
                    id: instance.botId.toString(),
                    name: `${instance.botName} ${instance.isActive ? "✅" : "⚠️"}`
                  }))}
                  selected={selectedInstance?.botId?.toString() ?? null}
                  searchable={false}
                  ariaLabel="Bot instance"
                  onchange={(e) => {
                    const match = availableInstances.find(i => i.botId.toString() === e.selected);
                    if (match) selectedInstance = match;
                  }}
                />
              </div>
            </div>
          </div>
        {:else if selectedInstance}
          <div class="flex justify-center">
            <div class="px-4 py-2 rounded-lg border text-sm"
                 style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}20; color: {$colorStore.text};">
              {m.public.leaderboardBotInstance({ bot: selectedInstance.botName })}
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
        <div class="p-6 rounded-2xl text-center border "
             style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}15);
                    border-color: {$colorStore.primary}30;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
            <i class="fa-solid fa-users"
               style="color: {$colorStore.primary}; font-size: 32px; display: block; margin: 0 auto 8px;"></i>
          <div class="text-2xl font-bold" style="color: {$colorStore.text}">{serverStats.totalUsers?.toLocaleString() || 0}</div>
          <div class="text-sm" style="color: {$colorStore.muted}">{m.common.totalUsers()}</div>
        </div>

        <div class="p-6 rounded-2xl text-center border "
             style="background: linear-gradient(135deg, {$colorStore.secondary}15, {$colorStore.accent}15);
                    border-color: {$colorStore.secondary}30;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
            <i class="fa-solid fa-bolt"
               style="color: {$colorStore.secondary}; font-size: 32px; display: block; margin: 0 auto 8px;"></i>
          <div class="text-2xl font-bold" style="color: {$colorStore.text}">{serverStats.totalXp?.toLocaleString() || 0}</div>
          <div class="text-sm" style="color: {$colorStore.muted}">{m.common.totalXp()}</div>
        </div>

        <div class="p-6 rounded-2xl text-center border "
             style="background: linear-gradient(135deg, {$colorStore.accent}15, {$colorStore.primary}15);
                    border-color: {$colorStore.accent}30;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
            <i class="fa-solid fa-arrow-trend-up"
               style="color: {$colorStore.accent}; font-size: 32px; display: block; margin: 0 auto 8px;"></i>
          <div class="text-2xl font-bold" style="color: {$colorStore.text}">{serverStats.averageLevel || 0}</div>
          <div class="text-sm" style="color: {$colorStore.muted}">{m.public.leaderboardAvgLevel()}</div>
        </div>

        <div class="p-6 rounded-2xl text-center border "
             style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}15);
                    border-color: {$colorStore.primary}30;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
            <i class="fa-solid fa-crown"
               style="color: {$colorStore.primary}; font-size: 32px; display: block; margin: 0 auto 8px;"></i>
          <div class="text-2xl font-bold" style="color: {$colorStore.text}">{serverStats.highestLevel || 0}</div>
          <div class="text-sm" style="color: {$colorStore.muted}">{m.common.highestLevel()}</div>
        </div>
      </div>

      <!-- Leaderboard -->
      <div class="rounded-2xl border  overflow-hidden"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                  border-color: {$colorStore.primary}30;
                  box-shadow: 0 8px 32px rgba(0,0,0,0.3);"
           in:fly={{ y: 20, duration: 400, delay: 200 }}>
        
        <div class="p-6 border-b" style="border-color: {$colorStore.primary}20;">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold flex items-center gap-3" style="color: {$colorStore.text}">
              <i class="fa-solid fa-users" style="font-size: 24px;"></i>
              {m.common.topMembers()}
            </h2>
            
            <!-- Top Pagination -->
            {#if leaderboard.length >= pageSize}
              <div class="flex gap-2">
                <button
                  class="px-3 py-1.5 rounded-lg border transition-all hover:scale-[1.02] text-sm min-h-[36px] flex items-center justify-center"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border-color: {$colorStore.primary}30;"
                  onclick={() => goToPage(currentPage - 1)}
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
                  class="px-3 py-1.5 rounded-lg border transition-all hover:scale-[1.02] text-sm min-h-[36px] flex items-center justify-center"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border-color: {$colorStore.primary}30;"
                  onclick={() => goToPage(currentPage + 1)}
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
            <div class="p-4 hover:bg-black hover:opacity-20 transition-colors"
                 in:fly={{ x: -20, duration: 300, delay: index * 50 }}>
              <div class="flex items-center gap-4">
                <!-- Rank -->
                <div class="flex items-center justify-center w-12 h-12 rounded-xl border-2"
                     style="background: {getRankColor(user.rank)}20; border-color: {getRankColor(user.rank)}40;">
                  {#if user.rank <= 3}
                    <i class="fa-solid {getRankIcon(user.rank)}"
                       style="color: {getRankColor(user.rank)}; font-size: 24px;"></i>
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
                  >
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-lg truncate" style="color: {$colorStore.text}" title={user.username}>
                      {user.username}
                    </div>
                    <div class="text-sm truncate" style="color: {$colorStore.muted}">
                      {m.common.levelWithXp({ level: user.level, xp: user.totalXp.toLocaleString() })}
                      {#if user.messageCount !== undefined}
                        {m.public.leaderboardRowMessages({ count: user.messageCount.toLocaleString() })}
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
                      {m.common.levelNumber({ level: user.level })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          {:else}
            <div class="p-8 text-center">
              <i class="fa-solid fa-users"
                 style="color: {$colorStore.primary}50; font-size: 64px; display: block; margin: 0 auto 16px;"></i>
              <p class="text-lg" style="color: {$colorStore.text}">{m.public.leaderboardNoLeaderboardDataAvailable()}</p>
              <p class="text-sm" style="color: {$colorStore.muted}">{m.public.leaderboardThisServerMayNotHave()}</p>
            </div>
          {/each}
        </div>

        <!-- Pagination -->
        {#if leaderboard.length >= pageSize}
          <div class="p-4 border-t flex justify-center gap-2" style="border-color: {$colorStore.primary}20;">
            <button
              class="px-4 py-2 rounded-lg border transition-all hover:scale-[1.02] min-h-[40px] flex items-center justify-center"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border-color: {$colorStore.primary}30;"
              onclick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1 || paginationLoading}
            >
              {#if paginationLoading && currentPage > 1}
                <div class="w-4 h-4 border-2 rounded-full animate-spin"
                     style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
              {:else}
                {m.common.previous()}
              {/if}
            </button>
            
            <div class="px-4 py-2 rounded-lg border min-h-[40px] flex items-center"
                 style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}20; color: {$colorStore.text};">
              {m.common.pageNumber({ page: currentPage })}
            </div>
            
            <button
              class="px-4 py-2 rounded-lg border transition-all hover:scale-[1.02] min-h-[40px] flex items-center justify-center"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border-color: {$colorStore.primary}30;"
              onclick={() => goToPage(currentPage + 1)}
              disabled={leaderboard.length < pageSize || paginationLoading}
            >
              {#if paginationLoading}
                <div class="w-4 h-4 border-2 rounded-full animate-spin"
                     style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
              {:else}
                {m.common.next()}
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
          {@html m.public.leaderboardPoweredBy({ color: $colorStore.primary })}
        </p>
        <p class="text-xs mt-1" style="color: {$colorStore.muted}">
          {m.public.leaderboardJoinThisServerToStart()}
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
    :global body {
    background-color: #0f172a;
  }
</style>