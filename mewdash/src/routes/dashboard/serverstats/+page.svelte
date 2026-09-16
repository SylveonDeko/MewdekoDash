<!-- routes/dashboard/serverstats/+page.svelte -->
<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { goto } from "$app/navigation";
  import {
    clientApi,
    serverStatsApi,
    ActivityFilterMode,
    StatChartKind,
    StatKind,
    StatsExclusionKind,
    VoiceStateFlags,
    type ActivityDetail,
    type ActivityFilters,
    type ActivityRow,
    type ChannelActivity,
    type GuildSnapshot,
    type JoinLeaveSeries,
    type RankedEntry,
    type StatSeriesPoint,
    type ServerOverview,
    type ServerStatsSettings,
    type StatKindValue,
    type StatsExclusions,
    type UserActivity,
  } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import SimpleLineChart from "$lib/components/analytics/SimpleLineChart.svelte";
  import StatTile from "$lib/components/analytics/StatTile.svelte";
  import Card from "$lib/components/analytics/Card.svelte";
  import SectionHeader from "$lib/components/stats/SectionHeader.svelte";
  import AsyncState from "$lib/components/stats/AsyncState.svelte";
  import WindowPicker from "$lib/components/stats/WindowPicker.svelte";
  import RankList, { type RankRow } from "$lib/components/stats/RankList.svelte";
  import {
    formatDate,
    formatDateTime,
    formatDuration,
    formatHours,
    formatNumber,
    formatSigned,
    lookbackOptions,
    saveBlob,
    windowLabel,
  } from "$lib/components/stats/format";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const tabs = [
    { id: "overview", label: "Overview", icon: "fa-chart-line" },
    { id: "top", label: "Rankings", icon: "fa-trophy" },
    { id: "lookup", label: "Member & Channel", icon: "fa-user" },
    { id: "settings", label: "Settings", icon: "fa-gear" },
  ];

  let activeTab = $state("overview");
  let notificationMessage = $state("");
  let notificationType = $state<"success" | "error">("success");

  function notify(message: string, type: "success" | "error" = "error") {
    notificationMessage = message;
    notificationType = type;
    setTimeout(() => (notificationMessage = ""), 4000);
  }

  function fail(err: unknown, fallback: string) {
    logger.error(fallback, err);
    notify(err instanceof Error ? err.message : fallback, "error");
  }

  /** Guild lists */
  let members = $state<Array<{ id: string; name: string; avatarUrl?: string }>>([]);
  let roles = $state<Array<{ id: string; name: string; color?: number }>>([]);
  let channels = $state<Array<{ id: string; name: string }>>([]);

  async function loadGuildLists() {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const [memberList, roleList, channelList] = await Promise.all([
      clientApi.getMembers(guildId).catch(() => []),
      clientApi.getRoles(guildId).catch(() => []),
      clientApi.getChannels(guildId).catch(() => []),
    ]);
    members = memberList.map((m: any) => ({ id: m.id.toString(), name: m.username, avatarUrl: m.avatarUrl }));
    roles = roleList.map((r: any) => ({ id: r.id.toString(), name: r.name, color: r.color }));
    channels = channelList.map((c: any) => ({ id: c.id.toString(), name: c.name }));
  }

  function channelName(id: bigint | string | null | undefined): string {
    if (id === null || id === undefined) return "-";
    const key = id.toString();
    return channels.find((c) => c.id === key)?.name ?? key;
  }

  function roleName(id: string): string {
    return roles.find((r) => r.id === id)?.name ?? id;
  }

  function memberName(id: bigint | string): string {
    const key = id.toString();
    return members.find((m) => m.id === key)?.name ?? key;
  }

  /** Shared window */
  let lookback = $state(14);

  /** Overview */
  let overview = $state<ServerOverview | null>(null);
  let topGames = $state<ActivityRow[]>([]);
  let messageSeries = $state<StatSeriesPoint[]>([]);
  let voiceSeries = $state<StatSeriesPoint[]>([]);
  let snapshots = $state<GuildSnapshot[]>([]);
  let joinLeave = $state<JoinLeaveSeries | null>(null);
  let overviewLoading = $state(false);
  let overviewError = $state<string | null>(null);

  async function loadOverview() {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const chartDays = Math.max(1, lookback || 90);
    overviewLoading = true;
    overviewError = null;
    try {
      const [o, games, msgs, voice, snaps, jl] = await Promise.all([
        serverStatsApi.getOverview(guildId, lookback),
        settings?.trackActivities ? serverStatsApi.getTopActivities(guildId, lookback, 5).catch(() => []) : Promise.resolve([]),
        serverStatsApi.getSeries(guildId, StatChartKind.Messages, chartDays),
        serverStatsApi.getSeries(guildId, StatChartKind.Voice, chartDays),
        serverStatsApi.getSnapshots(guildId, chartDays),
        serverStatsApi.getJoinLeaveSeries(guildId, chartDays),
      ]);
      overview = o;
      topGames = games;
      messageSeries = msgs;
      voiceSeries = voice;
      snapshots = snaps;
      joinLeave = jl;
    } catch (err) {
      overviewError = err instanceof Error ? err.message : "Failed to load activity";
      logger.error("Failed to load server stats overview", err);
    } finally {
      overviewLoading = false;
    }
  }

  function bucketLabel(iso: string): string {
    return lookback === 1 || lookback === 2 ? formatDateTime(iso) : formatDate(iso);
  }

  let messageLabels = $derived(messageSeries.map((p) => bucketLabel(p.bucket)));
  let voiceLabels = $derived(voiceSeries.map((p) => bucketLabel(p.bucket)));
  let snapshotLabels = $derived(snapshots.map((s) => (snapshots.length > 48 ? formatDate(s.timestamp) : formatDateTime(s.timestamp))));
  let joinLabels = $derived(joinLeave?.joins.map((p) => formatDate(p.bucket)) ?? []);

  /** Rankings */
  let topKind = $state<number>(StatKind.Messages);
  let topUsers = $state<RankedEntry[]>([]);
  let topChannels = $state<RankedEntry[]>([]);
  let topActivities = $state<ActivityRow[]>([]);
  let topLoading = $state(false);
  let topError = $state<string | null>(null);

  async function loadTop() {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    topLoading = true;
    topError = null;
    try {
      const kind = topKind as StatKindValue;
      const [users, chans, games] = await Promise.all([
        serverStatsApi.getTopUsers(guildId, kind, lookback, 100),
        kind === StatKind.Activity ? Promise.resolve([]) : serverStatsApi.getTopChannels(guildId, kind, lookback, 25),
        kind === StatKind.Activity ? serverStatsApi.getTopActivities(guildId, lookback, 50) : Promise.resolve([]),
      ]);
      topUsers = users;
      topChannels = chans;
      topActivities = games;
    } catch (err) {
      topError = err instanceof Error ? err.message : "Failed to load rankings";
      logger.error("Failed to load rankings", err);
    } finally {
      topLoading = false;
    }
  }

  function formatValue(kind: number, value: number): string {
    return kind === StatKind.Messages ? formatNumber(value) : formatDuration(value);
  }

  let topUserRows = $derived<RankRow[]>(
    topUsers.map((r) => ({
      rank: r.rank,
      id: r.entry.id.toString(),
      name: r.entry.displayName || r.entry.name || r.entry.id.toString(),
      avatarUrl: r.entry.avatarUrl ?? null,
      value: formatValue(topKind, r.entry.value),
    })),
  );

  let topChannelRows = $derived<RankRow[]>(
    topChannels.map((r) => ({
      rank: r.rank,
      id: r.entry.id.toString(),
      name: `#${r.entry.name ?? r.entry.id.toString()}`,
      value: formatValue(topKind, r.entry.value),
    })),
  );

  let topGameRows = $derived<RankRow[]>(
    topActivities.map((g) => ({
      rank: g.rank,
      id: `${g.type}|${g.name}`,
      name: g.name,
      value: formatDuration(g.seconds),
      detail: `${g.players} ${g.players === 1 ? "player" : "players"} · ${g.activeNow} now · ${g.type}`,
    })),
  );

  async function exportTop() {
    if (!$currentGuild?.id) return;
    try {
      const blob = await serverStatsApi.exportCsv($currentGuild.id, topKind as StatKindValue, lookback);
      saveBlob(blob, `activity-${topKind === StatKind.Messages ? "messages" : topKind === StatKind.Voice ? "voice" : "games"}-${lookback}d.csv`);
    } catch (err) {
      fail(err, "Failed to export the ranking");
    }
  }

  /** Lookup */
  let lookupUserId = $state<string | null>(null);
  let lookupChannelId = $state<string | null>(null);
  let lookupGame = $state("");
  let userActivity = $state<UserActivity | null>(null);
  let userGames = $state<ActivityRow[]>([]);
  let channelActivity = $state<ChannelActivity | null>(null);
  let gameDetail = $state<ActivityDetail | null>(null);
  let lookupLoading = $state(false);

  async function loadUser() {
    if (!$currentGuild?.id || !lookupUserId) return;
    lookupLoading = true;
    try {
      const id = BigInt(lookupUserId);
      const [a, games] = await Promise.all([
        serverStatsApi.getUser($currentGuild.id, id, lookback),
        settings?.trackActivities ? serverStatsApi.getTopActivities($currentGuild.id, lookback, 10, id).catch(() => []) : Promise.resolve([]),
      ]);
      userActivity = a;
      userGames = games;
    } catch (err) {
      fail(err, "Failed to load the member's activity");
    } finally {
      lookupLoading = false;
    }
  }

  async function loadChannel() {
    if (!$currentGuild?.id || !lookupChannelId) return;
    lookupLoading = true;
    try {
      channelActivity = await serverStatsApi.getChannel($currentGuild.id, BigInt(lookupChannelId), lookback);
    } catch (err) {
      fail(err, "Failed to load the channel's activity");
    } finally {
      lookupLoading = false;
    }
  }

  async function loadGame(name?: string) {
    if (!$currentGuild?.id) return;
    if (name) lookupGame = name;
    if (!lookupGame.trim()) return;
    lookupLoading = true;
    try {
      gameDetail = await serverStatsApi.getActivity($currentGuild.id, lookupGame.trim(), lookback);
    } catch (err) {
      fail(err, "Failed to load who plays that");
    } finally {
      lookupLoading = false;
    }
  }

  function openGame(name: string) {
    activeTab = "lookup";
    loadGame(name);
  }

  function openUser(id: string) {
    activeTab = "lookup";
    lookupUserId = id;
    loadUser();
  }

  /** Settings */
  let settings = $state<ServerStatsSettings | null>(null);
  let exclusions = $state<StatsExclusions | null>(null);
  let activityFilters = $state<ActivityFilters | null>(null);
  let settingsLoading = $state(false);
  let settingsError = $state<string | null>(null);
  let lookbackDraft = $state(14);
  let cooldownDraft = $state(0);
  let excludeChannel = $state<string | null>(null);
  let excludeRole = $state<string | null>(null);
  let excludeUser = $state<string | null>(null);
  let filterNameDraft = $state("");

  const voiceStateOptions: Array<{ flag: number; label: string; hint: string }> = [
    { flag: VoiceStateFlags.SelfMuted, label: "Self muted", hint: "Time with the mic off" },
    { flag: VoiceStateFlags.SelfDeafened, label: "Self deafened", hint: "Time with sound off" },
    { flag: VoiceStateFlags.ServerMuted, label: "Server muted", hint: "Muted by a moderator" },
    { flag: VoiceStateFlags.ServerDeafened, label: "Server deafened", hint: "Deafened by a moderator" },
    { flag: VoiceStateFlags.Afk, label: "AFK channel", hint: "Time in the AFK channel" },
    { flag: VoiceStateFlags.Alone, label: "Alone", hint: "The only human in the channel" },
    { flag: VoiceStateFlags.Streaming, label: "Streaming", hint: "Time with a stream running" },
    { flag: VoiceStateFlags.Video, label: "Camera on", hint: "Time with video on" },
  ];

  async function loadSettings() {
    if (!$currentGuild?.id) return;
    settingsLoading = true;
    settingsError = null;
    try {
      const guildId = $currentGuild.id;
      const [s, ex, af] = await Promise.all([
        serverStatsApi.getSettings(guildId),
        serverStatsApi.getExclusions(guildId),
        serverStatsApi.getActivityFilters(guildId),
      ]);
      settings = s;
      exclusions = ex;
      activityFilters = af;
      lookbackDraft = s.defaultLookbackDays;
      cooldownDraft = s.messageCooldownSeconds;
      if (!overview) lookback = s.defaultLookbackDays;
    } catch (err) {
      settingsError = err instanceof Error ? err.message : "Failed to load settings";
      logger.error("Failed to load stats settings", err);
    } finally {
      settingsLoading = false;
    }
  }

  async function update(request: Parameters<typeof serverStatsApi.updateSettings>[1], fallback = "Failed to save the setting") {
    if (!$currentGuild?.id) return;
    try {
      settings = await serverStatsApi.updateSettings($currentGuild.id, request);
    } catch (err) {
      fail(err, fallback);
    }
  }

  function voiceStateIgnored(flag: number): boolean {
    return ((settings?.voiceStates ?? 0) & flag) !== 0;
  }

  async function toggleVoiceState(flag: number, ignored: boolean) {
    const current = settings?.voiceStates ?? 0;
    await update({ voiceStates: ignored ? current | flag : current & ~flag });
  }

  async function addExclusion(kind: 0 | 1 | 2, target: string | null) {
    if (!$currentGuild?.id || !target) return;
    try {
      await serverStatsApi.addExclusion($currentGuild.id, kind, BigInt(target));
      exclusions = await serverStatsApi.getExclusions($currentGuild.id);
      excludeChannel = null;
      excludeRole = null;
      excludeUser = null;
    } catch (err) {
      fail(err, "Failed to add the exclusion");
    }
  }

  async function removeExclusion(kind: 0 | 1 | 2, target: bigint) {
    if (!$currentGuild?.id) return;
    try {
      await serverStatsApi.removeExclusion($currentGuild.id, kind, target);
      exclusions = await serverStatsApi.getExclusions($currentGuild.id);
    } catch (err) {
      fail(err, "Failed to remove the exclusion");
    }
  }

  async function toggleFilterName(name: string) {
    if (!$currentGuild?.id || !name.trim()) return;
    try {
      await serverStatsApi.toggleActivityFilter($currentGuild.id, name.trim());
      activityFilters = await serverStatsApi.getActivityFilters($currentGuild.id);
      filterNameDraft = "";
    } catch (err) {
      fail(err, "Failed to update the activity filter");
    }
  }

  /** Orchestration */
  let loadedFor = $state("");

  async function loadAll() {
    if (!$currentGuild?.id) return;
    const key = `${$currentGuild.id}:${$currentInstance?.port ?? ""}`;
    if (loadedFor === key) return;
    loadedFor = key;
    await loadGuildLists();
    await loadSettings();
    await Promise.all([loadOverview(), loadTop()]);
  }

  function changeWindow() {
    loadOverview();
    loadTop();
    if (lookupUserId) loadUser();
    if (lookupChannelId) loadChannel();
    if (lookupGame) loadGame();
  }

  onMount(async () => {
    if (!$currentGuild) {
      await goto("/dashboard");
      return;
    }
    await loadAll();
  });

  $effect(() => {
    if ($currentGuild && $currentInstance) untrack(() => loadAll());
  });
</script>

{#snippet windowActions()}
  <WindowPicker bind:value={lookback} options={lookbackOptions} onchange={changeWindow} />
{/snippet}

<DashboardPageLayout
  title="Activity Stats"
  subtitle="Messages, voice time, games and member growth over any window"
  icon="fa-chart-simple"
  guildName={$currentGuild?.name || "Dashboard"}
  {tabs}
  bind:activeTab
  bind:notificationMessage
  {notificationType}
>
  {#if activeTab === "overview"}
    <section>
      <SectionHeader icon="fa-chart-simple" title="Server Activity" subtitle={windowLabel(lookback)} actions={windowActions} />

      <AsyncState loading={overviewLoading} error={overviewError} empty={!overview}>
        {#if overview}
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatTile label="Messages" value={formatNumber(overview.messages)} sub={`${formatNumber(overview.messageContributors)} chatters`} />
            <StatTile label="Voice time" value={formatDuration(overview.voiceSeconds)} sub={`${formatNumber(overview.voiceContributors)} in voice`} />
            <StatTile label="Joins" value={formatNumber(overview.joins)} />
            <StatTile label="Leaves" value={formatNumber(overview.leaves)} />
            <StatTile label="Net growth" value={formatSigned(overview.netGrowth)} tone={overview.netGrowth >= 0 ? "ok" : "crit"} />
            <StatTile label="Members now" value={formatNumber(overview.now.members)} sub={`${formatNumber(overview.now.online)} online · ${formatNumber(overview.now.inVoice)} in voice`} />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
            <StatTile label="Top chatter" value={overview.topMessageUser?.displayName || overview.topMessageUser?.name || "-"} sub={overview.topMessageUser ? `${formatNumber(overview.topMessageUser.value)} messages` : undefined} />
            <StatTile label="Top voice" value={overview.topVoiceUser?.displayName || overview.topVoiceUser?.name || "-"} sub={overview.topVoiceUser ? formatDuration(overview.topVoiceUser.value) : undefined} />
            <StatTile label="Busiest channel" value={overview.topMessageChannel ? `#${overview.topMessageChannel.name ?? ""}` : "-"} sub={overview.topMessageChannel ? `${formatNumber(overview.topMessageChannel.value)} messages` : undefined} />
            <StatTile label="Most played" value={topGames[0]?.name ?? (settings?.trackActivities ? "-" : "Game tracking off")} sub={topGames[0] ? `${formatDuration(topGames[0].seconds)} · ${topGames[0].players} players` : undefined} />
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card title="Messages">
              <SimpleLineChart labels={messageLabels} series={[{ name: "Messages", data: messageSeries.map((p) => p.value) }]} height={200} beginAtZero empty="No messages in this window" />
            </Card>
            <Card title="Voice hours">
              <SimpleLineChart labels={voiceLabels} series={[{ name: "Hours", data: voiceSeries.map((p) => Math.round(p.value * 10) / 10), color: "#b67ff0" }]} height={200} beginAtZero empty="No voice time in this window" />
            </Card>
            <Card title="Members">
              <SimpleLineChart labels={snapshotLabels} series={[{ name: "Members", data: snapshots.map((s) => s.members), color: "#4ade80" }]} height={200} empty="Snapshots start an hour after tracking is enabled" />
            </Card>
            <Card title="Member status">
              <SimpleLineChart
                labels={snapshotLabels}
                series={[
                  { name: "Online", data: snapshots.map((s) => s.online), color: "#43b581" },
                  { name: "Idle", data: snapshots.map((s) => s.idle), color: "#faa61a" },
                  { name: "DND", data: snapshots.map((s) => s.dnd), color: "#f04747" },
                  { name: "In voice", data: snapshots.map((s) => s.inVoice), color: "#b67ff0" },
                ]}
                height={200}
                beginAtZero
                empty="Snapshots start an hour after tracking is enabled"
              />
            </Card>
            <Card title="Joins and leaves" class="xl:col-span-2">
              <SimpleLineChart
                labels={joinLabels}
                series={[
                  { name: "Joins", data: joinLeave?.joins.map((p) => p.value) ?? [], color: "#4ade80" },
                  { name: "Leaves", data: joinLeave?.leaves.map((p) => p.value) ?? [], color: "#f87171" },
                ]}
                height={200}
                beginAtZero
                empty="No joins or leaves in this window"
              />
            </Card>
          </div>
        {/if}
      </AsyncState>
    </section>
  {/if}

  {#if activeTab === "top"}
    <section>
      <SectionHeader icon="fa-trophy" title="Rankings" subtitle={windowLabel(lookback)}>
        {#snippet actions()}
          <WindowPicker
            bind:value={topKind}
            options={[
              { value: StatKind.Messages, label: "Messages" },
              { value: StatKind.Voice, label: "Voice" },
              ...(settings?.trackActivities ? [{ value: StatKind.Activity, label: "Games" }] : []),
            ]}
            ariaLabel="Ranking kind"
            onchange={() => loadTop()}
          />
          <WindowPicker bind:value={lookback} options={lookbackOptions} onchange={changeWindow} />
          <button type="button" class="px-3 min-h-[36px] rounded-lg text-sm font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.primary};" onclick={exportTop}>
            <i class="fa-solid fa-download mr-1" aria-hidden="true"></i> CSV
          </button>
        {/snippet}
      </SectionHeader>

      <AsyncState loading={topLoading} error={topError} empty={topUsers.length === 0 && topActivities.length === 0} emptyMessage="No activity recorded for this window">
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card title={topKind === StatKind.Activity ? "Most time in games" : "Top members"}>
            <RankList rows={topUserRows} onselect={(row) => openUser(row.id)} />
          </Card>
          {#if topKind === StatKind.Activity}
            <Card title="Top games and apps">
              <RankList rows={topGameRows} onselect={(row) => openGame(row.name)} />
            </Card>
          {:else}
            <Card title="Top channels">
              {#if topChannelRows.length === 0}
                <p class="text-sm" style="color: {$colorStore.muted}">No channel activity in this window.</p>
              {:else}
                <RankList rows={topChannelRows} onselect={(row) => { lookupChannelId = row.id; activeTab = "lookup"; loadChannel(); }} />
              {/if}
            </Card>
          {/if}
        </div>
      </AsyncState>
    </section>
  {/if}

  {#if activeTab === "lookup"}
    <section>
      <SectionHeader icon="fa-user" title="Member & Channel" subtitle={windowLabel(lookback)} actions={windowActions} />

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="Member">
          <div class="mb-3">
            <DiscordSelector type="custom" options={members} customIcon="fa-user" placeholder="Pick a member" bind:selected={lookupUserId} onchange={() => loadUser()} />
          </div>
          {#if userActivity}
            <div class="grid grid-cols-2 gap-2 mb-3">
              <StatTile label="Messages" value={formatNumber(userActivity.messages)} sub={userActivity.messageRank ? `Rank #${userActivity.messageRank}` : undefined} />
              <StatTile label="Voice" value={formatDuration(userActivity.voiceSeconds)} sub={userActivity.voiceRank ? `Rank #${userActivity.voiceRank}` : undefined} />
              <StatTile label="Lifetime messages" value={formatNumber(userActivity.allTimeMessages)} />
              <StatTile label="Lifetime voice" value={formatDuration(userActivity.allTimeVoiceSeconds)} />
            </div>
            {#if userActivity.topMessageChannels.length > 0}
              <h4 class="text-sm font-medium mb-1" style="color: {$colorStore.text}">Chats most in</h4>
              <ul class="text-sm mb-3 space-y-1" style="color: {$colorStore.muted}">
                {#each userActivity.topMessageChannels as c (c.id.toString())}
                  <li class="flex justify-between"><span>#{c.name ?? c.id.toString()}</span><span style="color: {$colorStore.secondary}">{formatNumber(c.value)}</span></li>
                {/each}
              </ul>
            {/if}
            {#if userActivity.topVoiceChannels.length > 0}
              <h4 class="text-sm font-medium mb-1" style="color: {$colorStore.text}">Voice channels</h4>
              <ul class="text-sm mb-3 space-y-1" style="color: {$colorStore.muted}">
                {#each userActivity.topVoiceChannels as c (c.id.toString())}
                  <li class="flex justify-between"><span>#{c.name ?? c.id.toString()}</span><span style="color: {$colorStore.secondary}">{formatDuration(c.value)}</span></li>
                {/each}
              </ul>
            {/if}
            {#if userGames.length > 0}
              <h4 class="text-sm font-medium mb-1" style="color: {$colorStore.text}">Games and apps</h4>
              <ul class="text-sm space-y-1" style="color: {$colorStore.muted}">
                {#each userGames as g (g.rank)}
                  <li class="flex justify-between gap-2">
                    <button type="button" class="truncate text-left" onclick={() => openGame(g.name)}>{g.name}</button>
                    <span style="color: {$colorStore.secondary}">{formatDuration(g.seconds)}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          {:else if !lookupLoading}
            <p class="text-sm" style="color: {$colorStore.muted}">Pick a member to see their messages, voice time and games.</p>
          {/if}
        </Card>

        <Card title="Channel">
          <div class="mb-3">
            <DiscordSelector type="channel" options={channels} placeholder="Pick a channel" bind:selected={lookupChannelId} onchange={() => loadChannel()} />
          </div>
          {#if channelActivity}
            <div class="grid grid-cols-3 gap-2 mb-3">
              <StatTile label="Messages" value={formatNumber(channelActivity.messages)} />
              <StatTile label="Voice" value={formatDuration(channelActivity.voiceSeconds)} />
              <StatTile label="People" value={formatNumber(channelActivity.contributors)} />
            </div>
            {#if channelActivity.topMessageUsers.length > 0}
              <h4 class="text-sm font-medium mb-1" style="color: {$colorStore.text}">Top chatters</h4>
              <ul class="text-sm mb-3 space-y-1" style="color: {$colorStore.muted}">
                {#each channelActivity.topMessageUsers as u (u.id.toString())}
                  <li class="flex justify-between"><span>{u.displayName || u.name || u.id.toString()}</span><span style="color: {$colorStore.secondary}">{formatNumber(u.value)}</span></li>
                {/each}
              </ul>
            {/if}
            {#if channelActivity.topVoiceUsers.length > 0}
              <h4 class="text-sm font-medium mb-1" style="color: {$colorStore.text}">Top voice</h4>
              <ul class="text-sm space-y-1" style="color: {$colorStore.muted}">
                {#each channelActivity.topVoiceUsers as u (u.id.toString())}
                  <li class="flex justify-between"><span>{u.displayName || u.name || u.id.toString()}</span><span style="color: {$colorStore.secondary}">{formatDuration(u.value)}</span></li>
                {/each}
              </ul>
            {/if}
          {:else if !lookupLoading}
            <p class="text-sm" style="color: {$colorStore.muted}">Pick a channel to see who is active in it.</p>
          {/if}
        </Card>

        <Card title="Who plays">
          <div class="flex gap-2 mb-3">
            <input type="text" placeholder="Game or app name" bind:value={lookupGame} onkeydown={(e) => e.key === "Enter" && loadGame()} class="grow rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" aria-label="Game or app name" />
            <button type="button" class="min-h-[44px] px-4 rounded-lg font-medium" style="background: {$colorStore.primary}; color: #fff;" onclick={() => loadGame()}>Look up</button>
          </div>
          {#if !settings?.trackActivities}
            <p class="text-sm" style="color: {$colorStore.muted}">Game tracking is off. Turn it on under Settings.</p>
          {:else if gameDetail}
            <div class="grid grid-cols-3 gap-2 mb-3">
              <StatTile label="Playing now" value={formatNumber(gameDetail.activeNow)} />
              <StatTile label="Players" value={formatNumber(gameDetail.players)} />
              <StatTile label="Total time" value={formatDuration(gameDetail.totalSeconds)} />
            </div>
            {#if gameDetail.top.length > 0}
              <RankList rows={gameDetail.top.map((r) => ({ rank: r.rank, id: r.entry.id.toString(), name: r.entry.displayName || r.entry.name || r.entry.id.toString(), avatarUrl: r.entry.avatarUrl ?? null, value: formatDuration(r.entry.value) }))} onselect={(row) => openUser(row.id)} />
            {:else}
              <p class="text-sm" style="color: {$colorStore.muted}">Nobody has been seen in {gameDetail.name} in this window.</p>
            {/if}
          {:else if !lookupLoading}
            <p class="text-sm" style="color: {$colorStore.muted}">Type a game to see who plays it and for how long.</p>
          {/if}
        </Card>
      </div>
    </section>
  {/if}

  {#if activeTab === "settings"}
    <section>
      <SectionHeader icon="fa-gear" title="Tracking Settings" subtitle="What is recorded, for whom, and where" />

      <AsyncState loading={settingsLoading} error={settingsError} empty={!settings}>
        {#if settings}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <SettingToggle id="track-voice" label="Track voice time" hint="Seconds spent in voice channels, per member and channel" checked={settings.trackVoice} onchange={(v) => update({ trackVoice: v })} />
            <SettingToggle id="track-snapshots" label="Hourly snapshots" hint="Member and status counts every hour, for the member and status charts" checked={settings.trackSnapshots} onchange={(v) => update({ trackSnapshots: v })} />
            <SettingToggle id="count-bots" label="Count bots" hint="Include bot accounts in message and voice stats" checked={settings.countBots} onchange={(v) => update({ countBots: v })} />
            <SettingToggle id="track-activities" label="Track games and apps" hint="Time members spend playing, streaming, listening or watching. Off by default; the heaviest tracker." checked={settings.trackActivities} onchange={(v) => update({ trackActivities: v })} />
            <SettingToggle id="verify-activities" label="Verify activities" hint="Only count activities backed by a Discord application, Spotify or a stream, which blocks spoofed presences" checked={settings.verifyActivities} onchange={(v) => update({ verifyActivities: v })} disabled={!settings.trackActivities} />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <SettingField label="Default window (days)" hint="What stats commands and this page use when no window is picked, 1 to 90" id="lookback">
              <div class="flex gap-2">
                <input id="lookback" type="number" min="1" max="90" bind:value={lookbackDraft} class="w-full rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" />
                <button type="button" class="min-h-[44px] px-4 rounded-lg font-medium" style="background: {$colorStore.primary}; color: #fff;" onclick={() => update({ defaultLookbackDays: lookbackDraft })}>Save</button>
              </div>
            </SettingField>
            <SettingField label="Message cooldown (seconds)" hint="Messages from the same member count at most once per this many seconds. 0 counts every message." id="cooldown">
              <div class="flex gap-2">
                <input id="cooldown" type="number" min="0" max="300" bind:value={cooldownDraft} class="w-full rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" />
                <button type="button" class="min-h-[44px] px-4 rounded-lg font-medium" style="background: {$colorStore.primary}; color: #fff;" onclick={() => update({ messageCooldownSeconds: cooldownDraft })}>Save</button>
              </div>
            </SettingField>
          </div>

          <Card title="Voice states that do not count" note="Toggle a state to leave that time out of voice stats" class="mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
              {#each voiceStateOptions as option (option.flag)}
                <SettingToggle id={`vs-${option.flag}`} label={option.label} hint={option.hint} checked={voiceStateIgnored(option.flag)} onchange={(v) => toggleVoiceState(option.flag, v)} />
              {/each}
            </div>
          </Card>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card title="Ignored channels" note="Messages and voice here are not counted">
              <div class="flex gap-2 mb-3">
                <div class="grow"><DiscordSelector type="channel" options={channels} placeholder="Add a channel" bind:selected={excludeChannel} /></div>
                <button type="button" class="min-h-[44px] px-3 rounded-lg" style="background: {$colorStore.primary}; color: #fff;" onclick={() => addExclusion(StatsExclusionKind.Channel, excludeChannel)}>Add</button>
              </div>
              <ul class="space-y-1">
                {#each exclusions?.channels ?? [] as id (id.toString())}
                  <li class="flex items-center justify-between rounded-lg p-2" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
                    <span class="truncate">#{channelName(id)}</span>
                    <button type="button" class="text-sm px-2 min-h-[32px]" style="color: {$colorStore.accent};" onclick={() => removeExclusion(StatsExclusionKind.Channel, BigInt(id))} aria-label="Remove">✕</button>
                  </li>
                {/each}
              </ul>
            </Card>
            <Card title="Ignored roles" note="Holders are not counted">
              <div class="flex gap-2 mb-3">
                <div class="grow"><DiscordSelector type="role" options={roles} placeholder="Add a role" bind:selected={excludeRole} /></div>
                <button type="button" class="min-h-[44px] px-3 rounded-lg" style="background: {$colorStore.primary}; color: #fff;" onclick={() => addExclusion(StatsExclusionKind.Role, excludeRole)}>Add</button>
              </div>
              <ul class="space-y-1">
                {#each exclusions?.roles ?? [] as id (id.toString())}
                  <li class="flex items-center justify-between rounded-lg p-2" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
                    <span class="truncate">@{roleName(id.toString())}</span>
                    <button type="button" class="text-sm px-2 min-h-[32px]" style="color: {$colorStore.accent};" onclick={() => removeExclusion(StatsExclusionKind.Role, BigInt(id))} aria-label="Remove">✕</button>
                  </li>
                {/each}
              </ul>
            </Card>
            <Card title="Ignored members" note="Not counted in this server">
              <div class="flex gap-2 mb-3">
                <div class="grow"><DiscordSelector type="custom" options={members} customIcon="fa-user" placeholder="Add a member" bind:selected={excludeUser} /></div>
                <button type="button" class="min-h-[44px] px-3 rounded-lg" style="background: {$colorStore.primary}; color: #fff;" onclick={() => addExclusion(StatsExclusionKind.User, excludeUser)}>Add</button>
              </div>
              <ul class="space-y-1">
                {#each exclusions?.users ?? [] as id (id.toString())}
                  <li class="flex items-center justify-between rounded-lg p-2" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
                    <span class="truncate">{memberName(id)}</span>
                    <button type="button" class="text-sm px-2 min-h-[32px]" style="color: {$colorStore.accent};" onclick={() => removeExclusion(StatsExclusionKind.User, BigInt(id))} aria-label="Remove">✕</button>
                  </li>
                {/each}
              </ul>
            </Card>
          </div>

          <Card title="Activity filter" note="Games and apps that are, or are not, tracked">
            <div class="flex flex-wrap items-center gap-3 mb-3">
              <WindowPicker
                value={settings.activityFilterMode}
                options={[
                  { value: ActivityFilterMode.Blacklist, label: "Blacklist" },
                  { value: ActivityFilterMode.Whitelist, label: "Whitelist" },
                ]}
                ariaLabel="Activity filter mode"
                onchange={(v) => update({ activityFilterMode: v as 0 | 1 })}
              />
              <p class="text-sm" style="color: {$colorStore.muted}">
                {settings.activityFilterMode === ActivityFilterMode.Whitelist ? "Only the listed games are tracked." : "The listed games are ignored; everything else is tracked."}
              </p>
            </div>
            <div class="flex gap-2 mb-3">
              <input type="text" maxlength="128" placeholder="Game or app name" bind:value={filterNameDraft} onkeydown={(e) => e.key === "Enter" && toggleFilterName(filterNameDraft)} class="grow rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" aria-label="Game or app name" />
              <button type="button" class="min-h-[44px] px-4 rounded-lg font-medium" style="background: {$colorStore.primary}; color: #fff;" onclick={() => toggleFilterName(filterNameDraft)}>Add</button>
            </div>
            <div class="flex flex-wrap gap-2">
              {#each activityFilters?.names ?? [] as name (name)}
                <span class="inline-flex items-center gap-2 rounded-full px-3 min-h-[36px] text-sm" style="background: {$colorStore.primary}15; color: {$colorStore.text};">
                  {name}
                  <button type="button" style="color: {$colorStore.accent};" onclick={() => toggleFilterName(name)} aria-label={`Remove ${name}`}>✕</button>
                </span>
              {/each}
              {#if (activityFilters?.names.length ?? 0) === 0}
                <p class="text-sm" style="color: {$colorStore.muted}">No games listed.</p>
              {/if}
            </div>
          </Card>
        {/if}
      </AsyncState>
    </section>
  {/if}
</DashboardPageLayout>
