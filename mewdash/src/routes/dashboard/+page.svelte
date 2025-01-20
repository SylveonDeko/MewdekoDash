<!-- routes/dashboard/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import { fade } from "svelte/transition";
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
    Server,
    Shield,
    Star,
    Users
  } from "lucide-svelte";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import MusicPlayer from "$lib/components/MusicPlayer.svelte";
  import { musicStore } from "$lib/stores/musicStore.ts";
  import StatsGraph from "$lib/components/StatsGraph.svelte";
  import StatCard from "$lib/components/StatCard.svelte";
  import InviteStats from "$lib/components/InviteStats.svelte";
  import { inviteStore } from "$lib/stores/inviteStore.ts";

  export let data;
  let currentUser = data.user;
  let botStatus: BotStatusModel | null = null;
  let loading = true;
  let error: string | null = null;
  $: musicStatus = $musicStore.status;
  let joinStats: GraphStatsResponse | null = null;
  let leaveStats: GraphStatsResponse | null = null;


  let roleStats = {
    totalRoleStates: 0,
    activeRoleGreets: 0,
    savedRoles: 0,
    totalRoles: 0
  };

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


  async function fetchRoleStats() {
    try {
      if (!$currentGuild?.id) return;

      const [roleStates, roleGreets, roleList] = await Promise.all([
        api.getAllRoleStates($currentGuild.id),
        api.getAllRoleGreets($currentGuild.id),
        api.getGuildRoles($currentGuild.id)
      ]);

      roleStats = {
        totalRoleStates: roleStates?.length,
        activeRoleGreets: roleGreets.filter(g => !g.disabled).length,
        savedRoles: roleStates.reduce((sum, state) =>
          sum + (state.savedRoles?.split(",").length || 0), 0),
        totalRoles: roleList.length
      };
    } catch (err) {
      logger.error("Failed to fetch role stats:", err);
    }
  }

  async function fetchStats() {
    if (!$currentGuild?.id) return;

    const [joinData, leaveData] = await Promise.all([
      api.getJoinStats($currentGuild.id),
      api.getLeaveStats($currentGuild.id)
    ]);

    joinStats = joinData;
    leaveStats = leaveData;
  }


  async function fetchFeatures() {
    try {
      if (!$currentGuild?.id) return;

      const [
        roleStateSettings,
        guildSettingsResponse,
        roleGreets
      ] = await Promise.all([
        api.getRoleStateSettings($currentGuild.id),
        api.getGuildConfig($currentGuild.id),
        api.getAllRoleGreets($currentGuild.id)
      ]);

      guildFeatures = {
        inviteTracking: guildFeatures.inviteTracking,
        roleStates: roleStateSettings?.enabled,
        roleGreets: roleGreets.length > 0,
        multiGreets: guildSettingsResponse.MultiGreetType > 0,
        starboard: !!guildSettingsResponse.StarboardChannel,
        suggestions: !!guildSettingsResponse.sugchan,
        musicEnabled: true,
        giveawaysEnabled: !!guildSettingsResponse.GiveawayEndMessage
      };
    } catch (err) {
      logger.error("Failed to fetch features:", err);
    }
  }

  function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "online":
        return $colorStore.primary;
      case "idle":
        return $colorStore.secondary;
      case "dnd":
        return $colorStore.accent;
      default:
        return $colorStore.muted;
    }
  }

  // Format numbers nicely
  function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }

  onMount(async () => {
    if (!currentUser) await goto("/api/discord/login");
    loading = true;
    try {
      botStatus = await api.getBotStatus();
      await colorStore.extractFromImage($currentInstance?.botAvatar);
      await Promise.all([
        fetchRoleStats(),
        fetchFeatures(),
        fetchStats()
      ]);
      // Start music polling if we have a user
      if (currentUser?.id) {
        musicStore.startPolling(currentUser.id);
      }
    } catch (err) {
      error = "Failed to fetch status";
      logger.error(error, err);
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    musicStore.stopPolling();
  });

  $: colorVars = `
    --color-primary: ${$colorStore.primary};
    --color-secondary: ${$colorStore.secondary};
    --color-accent: ${$colorStore.accent};
    --color-text: ${$colorStore.text};
    --color-muted: ${$colorStore.muted};
  `;

  $: if ($currentInstance) {
    colorStore.extractFromImage($currentInstance?.botAvatar);
    fetchBotStatus();
    // Reset music polling
    if (currentUser?.id) {
      musicStore.reset();
      musicStore.startPolling(currentUser.id);
    }
  }

  async function fetchBotStatus() {
    botStatus = await api.getBotStatus();
  }

  async function fetchGuildStuffs() {
    await Promise.all([
      fetchRoleStats(),
      fetchStats(),
      fetchFeatures(),
      inviteStore.fetchStats($currentGuild.id)
    ]);
  }

  $: if ($currentGuild) {
    fetchGuildStuffs();
  }
</script>

<!-- Template part of +page.svelte -->
<div
  class="min-h-screen p-4 md:p-6 bg-mewd-dark-grey overflow-x-hidden w-full"
  style="{colorVars} background: radial-gradient(circle at top,
    {$colorStore.gradientStart}15 0%,
    {$colorStore.gradientMid}10 50%,
    {$colorStore.gradientEnd}05 100%);"
>
  <div class="max-w-7xl mx-auto space-y-8">
    {#if !$currentGuild}
      <div class="text-center p-8 rounded-2xl backdrop-blur-sm border"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;">
        <h1 class="text-3xl md:text-4xl font-bold mb-4" style="color: {$colorStore.text}">
          Select a Server
        </h1>
        <p class="text-lg" style="color: {$colorStore.muted}">
          Choose a server from the dropdown menu to manage your bot settings
        </p>
      </div>
    {:else}
      {#if loading}
        <div class="flex justify-center items-center min-h-[400px]" aria-live="polite">
          <div class="relative">
            <div class="w-16 h-16 border-4 rounded-full animate-spin"
                 style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}">
            </div>
          </div>
        </div>
      {:else if error}
        <div class="p-6 rounded-xl mb-6" role="alert"
             style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}40;">
          <div class="flex items-center gap-3">
            <Bot class="w-6 h-6" style="color: {$colorStore.accent}" />
            <div style="color: {$colorStore.accent}">
              <div class="font-semibold text-lg">Error Occurred</div>
              <div class="text-sm mt-1" style="color: {$colorStore.accent}90">{error}</div>
            </div>
          </div>
        </div>
      {:else}
        <!-- Music Player Section -->
        {#if musicStatus?.currentTrack}
          <MusicPlayer
            {musicStatus}
          />
        {/if}

        <!-- Main Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" in:fade>
          <!-- Bot Profile Card -->
          <div
            class="col-span-full backdrop-blur-sm rounded-2xl border shadow-2xl overflow-hidden"
            style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                   border-color: {$colorStore.primary}30;"
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
                      src={botStatus?.botAvatar}
                      alt=""
                      class="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white object-cover"
                    />
                  </div>
                  <div class="flex-grow">
                    <h2 class="text-3xl md:text-4xl font-bold mb-2" style="color: {$colorStore.text}">
                      {botStatus?.botName}
                    </h2>
                    <p style="color: {$colorStore.muted}">Version {botStatus?.botVersion}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bot Status Card -->
          <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 rounded-xl"
                   style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
                <Bot class="w-6 h-6" style="color: {$colorStore.primary}" />
              </div>
              <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Bot Status</h2>
            </div>

            <div class="space-y-4">
              <StatCard
                icon={Bot}
                label="Status"
                value={botStatus?.botStatus}
                iconColor="primary"
              />
              <StatCard
                icon={Bot}
                label="Latency"
                value={`${botStatus?.botLatency}ms`}
                iconColor="primary"
              />
            </div>
          </div>

          <!-- Bot Stats Card -->
          <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 rounded-xl"
                   style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
                <ChartBar class="w-6 h-6" style="color: {$colorStore.primary}" />
              </div>
              <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Bot Stats</h2>
            </div>

            <div class="space-y-4">
              <StatCard
                icon={Code}
                label="Commands"
                value={botStatus?.commandsCount}
                iconColor="primary"
              />
              <StatCard
                icon={Library}
                label="Modules"
                value={botStatus?.modulesCount}
                iconColor="secondary"
              />
              <StatCard
                icon={Users}
                label="Users"
                value={botStatus?.userCount}
                iconColor="accent"
              />
            </div>
          </div>

          <!-- Technical Info Card -->
          <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 rounded-xl"
                   style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
                <Server class="w-6 h-6" style="color: {$colorStore.primary}" />
              </div>
              <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Technical Info</h2>
            </div>

            <div class="space-y-4">
              <StatCard
                icon={Code}
                label="Discord.NET"
                value={botStatus?.dNetVersion}
                iconColor="primary"
              />
              <StatCard
                icon={Code}
                label="Commit"
                value={botStatus?.commitHash.substring(0, 7)}
                iconColor="primary"
              />
            </div>
          </div>

          <!-- Feature Overview Card -->
          <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 rounded-xl"
                   style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
                <ChartBar class="w-6 h-6" style="color: {$colorStore.primary}" />
              </div>
              <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Active Features</h2>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Invite Tracking -->
              <div class="p-3 rounded-xl flex items-center gap-3"
                   style="background: {guildFeatures.inviteTracking ? $colorStore.primary + '20' : $colorStore.primary + '10'}">
                <Link class="w-5 h-5"
                      style="color: {guildFeatures.inviteTracking ? $colorStore.primary : $colorStore.muted}" />
                <span style="color: {guildFeatures.inviteTracking ? $colorStore.text : $colorStore.muted}">
                  Invite Tracking
                </span>
              </div>

              <!-- Role States -->
              <div class="p-3 rounded-xl flex items-center gap-3"
                   style="background: {guildFeatures.roleStates ? $colorStore.primary + '20' : $colorStore.primary + '10'}">
                <Shield class="w-5 h-5"
                        style="color: {guildFeatures.roleStates ? $colorStore.primary : $colorStore.muted}" />
                <span style="color: {guildFeatures.roleStates ? $colorStore.text : $colorStore.muted}">
                  Role States
                </span>
              </div>

              <!-- Role Greets -->
              <div class="p-3 rounded-xl flex items-center gap-3"
                   style="background: {guildFeatures.roleGreets ? $colorStore.primary + '20' : $colorStore.primary + '10'}">
                <MessageSquare class="w-5 h-5"
                               style="color: {guildFeatures.roleGreets ? $colorStore.primary : $colorStore.muted}" />
                <span style="color: {guildFeatures.roleGreets ? $colorStore.text : $colorStore.muted}">
                  Role Greets
                </span>
              </div>

              <!-- Starboard -->
              <div class="p-3 rounded-xl flex items-center gap-3"
                   style="background: {guildFeatures.starboard ? $colorStore.primary + '20' : $colorStore.primary + '10'}">
                <Star class="w-5 h-5"
                      style="color: {guildFeatures.starboard ? $colorStore.primary : $colorStore.muted}" />
                <span style="color: {guildFeatures.starboard ? $colorStore.text : $colorStore.muted}">
                  Starboard
                </span>
              </div>

              <!-- Suggestions -->
              <div class="p-3 rounded-xl flex items-center gap-3"
                   style="background: {guildFeatures.suggestions ? $colorStore.primary + '20' : $colorStore.primary + '10'}">
                <MessageSquare class="w-5 h-5"
                               style="color: {guildFeatures.suggestions ? $colorStore.primary : $colorStore.muted}" />
                <span style="color: {guildFeatures.suggestions ? $colorStore.text : $colorStore.muted}">
                  Suggestions
                </span>
              </div>

              <!-- Giveaways -->
              <div class="p-3 rounded-xl flex items-center gap-3"
                   style="background: {guildFeatures.giveawaysEnabled ? $colorStore.primary + '20' : $colorStore.primary + '10'}">
                <Gift class="w-5 h-5"
                      style="color: {guildFeatures.giveawaysEnabled ? $colorStore.primary : $colorStore.muted}" />
                <span style="color: {guildFeatures.giveawaysEnabled ? $colorStore.text : $colorStore.muted}">
                  Giveaways
                </span>
              </div>
            </div>
          </div>

          <!-- Stats Overview -->
          <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
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
                value={formatNumber(botStatus?.userCount || 0)}
                iconColor="primary"
              />

              <StatCard
                icon={Shield}
                label="Roles"
                value={formatNumber(roleStats.totalRoles)}
                subtitle={`${roleStats.savedRoles} saved`}
                iconColor="accent"
              />
            </div>
          </div>

          <!-- Top Inviters -->
          <InviteStats />

          <!-- Join/Leave Graphs -->
          <div class="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {#if joinStats}
              <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
                   style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                          border-color: {$colorStore.primary}30;">
                <StatsGraph data={joinStats} type="join" />
              </div>
            {/if}

            {#if leaveStats}
              <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
                   style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                          border-color: {$colorStore.primary}30;">
                <StatsGraph data={leaveStats} type="leave" />
              </div>
            {/if}
          </div>
        </div>
      {/if}
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
</style>