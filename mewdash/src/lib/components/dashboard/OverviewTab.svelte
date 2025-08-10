<!-- lib/components/dashboard/OverviewTab.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { musicStore } from "$lib/stores/musicStore";
  import { musicPlayerColors } from "$lib/stores/musicPlayerColorStore";
  import { BarChart3, Bot, ChartBar, Code, Library, Music, RefreshCw, Shield, Users } from "lucide-svelte";

  import StatCard from "$lib/components/monitoring/StatCard.svelte";
  import CompactMusicPlayer from "$lib/components/music/CompactMusicPlayer.svelte";
  import StatsGraph from "$lib/components/monitoring/StatsGraph.svelte";

  // Props from parent
  export let botStatus: any;
  export let guildMemberStats: any;
  export let roleStats: any;
  export let joinStats: any;
  export let leaveStats: any;
  export let onRefresh: () => void;
  export let refreshing: boolean = false;

  // Derived state
  $: musicStatus = $musicStore.status;
  $: colors = $musicPlayerColors;
  $: currentPosition = getCurrentPosition();
  $: progressPercentage = getProgressPercentage();
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

</script>

<div class="space-y-6" in:fly={{ y: 20, duration: 300 }}>

  <!-- 4-Column Desktop Grid Layout -->
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

    <!-- Bot Status Column -->
    <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
      <div class="flex items-center gap-4 mb-6">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <Bot class="w-6 h-6" style="color: {$colorStore.primary}" />
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Bot Status</h2>
      </div>

      <div class="space-y-4">
        <StatCard
          animationDelay={0}
          icon={Bot}
          iconColor="primary"
          label="Latency"
          trend={botStatus?.botLatency < 100 ? "up" : botStatus?.botLatency > 200 ? "down" : "neutral"}
          trendValue={botStatus?.botLatency < 100 ? "Good" : botStatus?.botLatency > 200 ? "High" : ""}
          value={`${botStatus?.botLatency || 0}ms`}
        />

        <StatCard
          animationDelay={100}
          icon={Code}
          iconColor="secondary"
          label="Status"
          value={botStatus?.botStatus || 'Unknown'}
        />
      </div>
    </div>

    <!-- Server Stats Column -->
    <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
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
          animationDelay={200}
          icon={Users}
          iconColor="primary"
          label="Members"
          subtitle={`${guildMemberStats.humanMembers} humans, ${guildMemberStats.botMembers} bots`}
          tooltipData={memberTooltipData}
          value={guildMemberStats.totalMembers}
        />

        <StatCard
          animationDelay={300}
          icon={Shield}
          iconColor="accent"
          label="Roles"
          subtitle={`${roleStats.savedRoles} saved`}
          tooltipData={roleTooltipData}
          trend={calculateRoleTrend().trend}
          trendValue={calculateRoleTrend().value}
          value={roleStats.totalRoles}
        />
      </div>
    </div>

    <!-- Bot Info Column -->
    <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
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
          animationDelay={400}
          icon={Code}
          iconColor="primary"
          label="Commands"
          tooltipData={[
            { label: "Modules", value: botStatus?.modulesCount || 0 },
            { label: "Text Commands", value: botStatus?.textCommandsCount || 0 },
            { label: "Slash Commands", value: botStatus?.slashCommandsCount || 0 }
          ]}
          value={botStatus?.commandsCount || 0}
        />

        <StatCard
          animationDelay={500}
          icon={Library}
          iconColor="secondary"
          label="Discord.NET"
          subtitle={botStatus?.commitHash?.substring(0, 7) || ""}
          value={botStatus?.dNetVersion || ""}
        />
      </div>
    </div>

    <!-- Quick Actions Column -->
    <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
      <div class="flex items-center gap-4 mb-6">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <RefreshCw class="w-6 h-6" style="color: {$colorStore.primary}" />
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Quick Actions</h2>
      </div>

      <div class="space-y-4">
        <button
          class="w-full flex items-center gap-2 py-3 px-4 rounded-xl transition-all hover:scale-105"
          disabled={refreshing}
          on:click={onRefresh}
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
        >
          <span class:animate-spin={refreshing}>
            <RefreshCw size={18} />
          </span>
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>

        <a
          class="w-full flex items-center gap-2 py-3 px-4 rounded-xl transition-all hover:scale-105"
          href="/dashboard/music"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
        >
          <Music size={18} />
          Music Player
        </a>

        <a
          class="w-full flex items-center gap-2 py-3 px-4 rounded-xl transition-all hover:scale-105"
          href="/dashboard/moderation"
          style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
        >
          <Shield size={18} />
          Moderation
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
        class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
              border-color: {$colorStore.primary}30;"
        in:fly={{ y: 20, duration: 300, delay: 400 }}
      >
        <StatsGraph data={joinStats} type="join" />
      </div>
    {/if}

    {#if leaveStats}
      <div
        class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
              border-color: {$colorStore.primary}30;"
        in:fly={{ y: 20, duration: 300, delay: 500 }}
      >
        <StatsGraph data={leaveStats} type="leave" />
      </div>
    {/if}
  </div>
</div>