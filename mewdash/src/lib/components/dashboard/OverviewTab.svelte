<!-- lib/components/dashboard/OverviewTab.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
    import {fly} from "svelte/transition";
    import {colorStore} from "$lib/stores/colorStore";
    import {musicStore} from "$lib/stores/musicStore";
    import {musicPlayerColors} from "$lib/stores/musicPlayerColorStore";

    import StatCard from "$lib/components/monitoring/StatCard.svelte";
    import CompactMusicPlayer from "$lib/components/music/CompactMusicPlayer.svelte";
    import StatsGraph from "$lib/components/monitoring/StatsGraph.svelte";
    import BotGuildProfile from "$lib/components/settings/BotGuildProfile.svelte";


    interface Props {
    // Props from parent
    botStatus: any;
    guildMemberStats: any;
    roleStats: any;
    joinStats: any;
    leaveStats: any;
    onRefresh: () => void;
    refreshing?: boolean;
  }

  let {
    botStatus,
    guildMemberStats,
    roleStats,
    joinStats,
    leaveStats,
    onRefresh,
    refreshing = false
  }: Props = $props();



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

  // Helper functions for mobile music display

  function getCurrentPosition(): number {
    if (!musicStatus?.Position?.RelativePosition) return 0;

    const match = musicStatus.Position.RelativePosition.match(/(\d+):(\d+)\.(\d+)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3]);
      return minutes * 60 + seconds + milliseconds / 1000;
    }
    return 0;
  }

  function getProgressPercentage(): number {
    const currentPosition = getCurrentPosition();
    if (!musicStatus?.CurrentTrack?.Track?.Duration || !currentPosition) return 0;
    const duration = getSeconds(musicStatus.CurrentTrack.Track.Duration);
    if (duration === 0) return 0;
    return Math.max(0, Math.min(100, (currentPosition / duration) * 100));
  }

  function getSeconds(timeStr: string): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(":");
    return parts.length === 3
      ? parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2])
      : 0;
  }

  // Derived state
  let musicStatus = $derived($musicStore.status);
  let colors = $derived($musicPlayerColors);
  let currentPosition = $derived(getCurrentPosition());
  let progressPercentage = $derived(getProgressPercentage());
  let memberTooltipData = $derived([
    { label: m.dashboard.overviewHumanMembers(), value: guildMemberStats.humanMembers },
    { label: m.dashboard.overviewBotMembers(), value: guildMemberStats.botMembers },
    { label: m.common.totalMembers(), value: guildMemberStats.totalMembers }
  ]);
  let roleTooltipData = $derived([
    { label: m.dashboard.overviewTotalRoles(), value: roleStats.totalRoles },
    { label: m.dashboard.overviewSavedRoles(), value: roleStats.savedRoles },
    { label: m.features.rolestatesName(), value: roleStats.totalRoleStates },
    { label: m.features.rolegreetsName(), value: roleStats.activeRoleGreets }
  ]);
</script>

<div class="space-y-6" in:fly={{ y: 20, duration: 300 }}>

  <!-- Bot Guild Profile -->
  <BotGuildProfile />

  <!-- 4-Column Desktop Grid Layout -->
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

    <!-- Bot Status Column -->
    <div class=" rounded-2xl p-6 transition-all hover:shadow-lg hover:translate-y-[-2px] border"
         style="background: {$colorStore.primary}05;
                border-color: {$colorStore.primary}15;">
      <div class="flex items-center gap-4 mb-6">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <i class="fa-utility-duo fa-regular fa-circle text-2xl"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.common.botStatus()}</h2>
      </div>

      <div class="space-y-4">
        <StatCard
          animationDelay={0}
          icon="fa-wifi"
          iconColor="primary"
          label={m.common.latency()}
          trend={botStatus?.botLatency < 100 ? "up" : botStatus?.botLatency > 200 ? "down" : "neutral"}
          trendValue={botStatus?.botLatency < 100 ? m.common.good() : botStatus?.botLatency > 200 ? m.common.high() : ""}
          value={`${botStatus?.botLatency || 0}ms`}
        />

        <StatCard
          animationDelay={100}
          icon="fa-check-circle"
          iconColor="secondary"
          label={m.common.status()}
          value={botStatus?.botStatus || m.common.unknown()}
        />
      </div>
    </div>

    <!-- Server Stats Column -->
    <div class=" rounded-2xl p-6 transition-all hover:shadow-lg hover:translate-y-[-2px] border"
         style="background: {$colorStore.primary}05;
                border-color: {$colorStore.primary}15;">
      <div class="flex items-center gap-4 mb-6">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <i class="fa-utility-duo fa-regular fa-server text-2xl"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.dashboard.overviewServerStats()}</h2>
      </div>

      <div class="space-y-4">
        <StatCard
          animationDelay={200}
          icon="fa-users"
          iconColor="primary"
          label={m.common.members()}
          subtitle={m.dashboard.overviewMembersSubtitle({ humans: guildMemberStats.humanMembers, bots: guildMemberStats.botMembers })}
          tooltipData={memberTooltipData}
          value={guildMemberStats.totalMembers}
        />

        <StatCard
          animationDelay={300}
          icon="fa-shield"
          iconColor="accent"
          label={m.common.roles()}
          subtitle={m.dashboard.overviewRolesSubtitle({ saved: roleStats.savedRoles })}
          tooltipData={roleTooltipData}
          trend={calculateRoleTrend().trend}
          trendValue={calculateRoleTrend().value}
          value={roleStats.totalRoles}
        />
      </div>
    </div>

    <!-- Bot Info Column -->
    <div class=" rounded-2xl p-6 transition-all hover:shadow-lg hover:translate-y-[-2px] border"
         style="background: {$colorStore.primary}05;
                border-color: {$colorStore.primary}15;">
      <div class="flex items-center gap-4 mb-6">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <i class="fa-utility-duo fa-regular fa-info-circle text-2xl"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.dashboard.overviewBotInfo()}</h2>
      </div>

      <div class="space-y-4">
        <StatCard
          animationDelay={400}
          icon="fa-code"
          iconColor="primary"
          label={m.common.commands()}
          tooltipData={[
            { label: m.common.modules(), value: botStatus?.modulesCount || 0 },
            { label: m.dashboard.overviewTextCommands(), value: botStatus?.textCommandsCount || 0 },
            { label: m.common.slashCommands(), value: botStatus?.slashCommandsCount || 0 }
          ]}
          value={botStatus?.commandsCount || 0}
        />

        <StatCard
          animationDelay={500}
          icon="fa-book"
          iconColor="secondary"
          label="Discord.NET"
          subtitle={botStatus?.commitHash?.substring(0, 7) || ""}
          value={botStatus?.dNetVersion || ""}
        />
      </div>
    </div>

    <!-- Quick Actions Column -->
    <div class=" rounded-2xl p-6 transition-all hover:shadow-lg hover:translate-y-[-2px] border"
         style="background: {$colorStore.primary}05;
                border-color: {$colorStore.primary}15;">
      <div class="flex items-center gap-4 mb-6">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <i class="fa-utility-duo fa-regular fa-bolt text-2xl"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.common.quickActions()}</h2>
      </div>

      <div class="space-y-4">
        <button aria-label={m.dashboard.pageRefreshAria()}
                class="w-full flex items-center gap-2 py-3 px-4 rounded-xl transition-all hover:scale-[1.02]"
          disabled={refreshing}
          onclick={onRefresh}
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
        >
          <i class="fa-utility-duo fa-regular fa-sync {refreshing ? 'fa-spin' : ''}"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
          {refreshing ? m.common.refreshing() : m.common.refreshData()}
        </button>

        <a
          class="w-full flex items-center gap-2 py-3 px-4 rounded-xl transition-all hover:scale-[1.02]"
          href="/dashboard/music"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
        >
          <i class="fa-utility-duo fa-regular fa-music"
             style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.accent};"></i>
          {m.common.musicPlayer()}
        </a>

        <a
          class="w-full flex items-center gap-2 py-3 px-4 rounded-xl transition-all hover:scale-[1.02]"
          href="/dashboard/moderation"
          style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
        >
          <i class="fa-utility-duo fa-regular fa-flag"
             style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary};"></i>
          {m.features.categoryModeration()}
        </a>
      </div>
    </div>
  </div>

  <!-- Music Player Section - Integrated Layout -->
  <CompactMusicPlayer {musicStatus} />

  <!-- Join/Leave Graphs - Full width on large screens -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {#if joinStats}
      <div
        class=" rounded-2xl border p-6 transition-all hover:shadow-lg hover:translate-y-[-2px]"
              style="background: {$colorStore.primary}05;
              border-color: {$colorStore.primary}15;"
        in:fly={{ y: 20, duration: 300, delay: 400 }}
      >
        <StatsGraph data={joinStats} type="join" />
      </div>
    {/if}

    {#if leaveStats}
      <div
        class=" rounded-2xl border p-6 transition-all hover:shadow-lg hover:translate-y-[-2px]"
              style="background: {$colorStore.primary}05;
              border-color: {$colorStore.primary}15;"
        in:fly={{ y: 20, duration: 300, delay: 500 }}
      >
        <StatsGraph data={leaveStats} type="leave" />
      </div>
    {/if}
  </div>
</div>