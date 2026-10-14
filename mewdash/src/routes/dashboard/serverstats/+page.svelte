<!-- routes/dashboard/serverstats/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
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
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
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
    formatHour,
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

  const tabs = $derived([
    { id: "overview", label: m.common.overview(), icon: "fa-chart-line" },
    { id: "top", label: m.serverstats.rankTitle(), icon: "fa-trophy" },
    { id: "lookup", label: m.serverstats.tabLookup(), icon: "fa-user" },
    { id: "settings", label: m.common.settings(), icon: "fa-gear" },
  ]);

  let activeTab = $state("overview");
  let notificationMessage = $state("");
  let notificationType = $state<"success" | "error">("success");

  function notify(message: string, type: "success" | "error" = "error") {
    notificationMessage = message;
    notificationType = type;
    setTimeout(() => (notificationMessage = ""), 4000);
  }

  const autoSave = createAutoSave({
    onError: () => notify(m.serverstats.notifySaveFailed(), "error"),
  });

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
    members = memberList.map((mem: any) => ({ id: mem.id.toString(), name: mem.username, avatarUrl: mem.avatarUrl }));
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
    return members.find((mem) => mem.id === key)?.name ?? key;
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
      overviewError = err instanceof Error ? err.message : m.serverstats.errorLoadActivity();
      logger.error("Failed to load server stats overview", err);
    } finally {
      overviewLoading = false;
    }
  }

  /**
   * Axis labels: hour only inside a single day, date and time for a couple of
   * days, date alone beyond that. Long labels collide on a 24 hour axis.
   */
  function bucketLabel(iso: string): string {
    if (lookback === 1) return formatHour(iso);
    return lookback === 2 ? formatDateTime(iso) : formatDate(iso);
  }

  let messageLabels = $derived(messageSeries.map((p) => bucketLabel(p.bucket)));
  let voiceLabels = $derived(voiceSeries.map((p) => bucketLabel(p.bucket)));
  let snapshotLabels = $derived(
    snapshots.map((s) =>
      snapshots.length > 48 ? formatDate(s.timestamp) : lookback === 1 ? formatHour(s.timestamp) : formatDateTime(s.timestamp)
    )
  );
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
      topError = err instanceof Error ? err.message : m.serverstats.errorLoadRankings();
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
      detail: (g.players === 1 ? m.serverstats.gameDetailOne : m.serverstats.gameDetailOther)({ players: g.players, active: g.activeNow, type: g.type }),
    })),
  );

  async function exportTop() {
    if (!$currentGuild?.id) return;
    try {
      const blob = await serverStatsApi.exportCsv($currentGuild.id, topKind as StatKindValue, lookback);
      saveBlob(blob, `activity-${topKind === StatKind.Messages ? "messages" : topKind === StatKind.Voice ? "voice" : "games"}-${lookback}d.csv`);
    } catch (err) {
      fail(err, m.serverstats.errorExport());
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
      fail(err, m.serverstats.errorLoadMember());
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
      fail(err, m.serverstats.errorLoadChannel());
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
      fail(err, m.serverstats.errorLoadGame());
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
  /** The settings as the server last confirmed them, for putting a toggle back when its save fails. */
  let savedSettings: ServerStatsSettings | null = null;
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

  const voiceStateOptions: Array<{ flag: number; label: string; hint: string }> = $derived([
    { flag: VoiceStateFlags.SelfMuted, label: m.serverstats.voiceSelfMuted(), hint: m.serverstats.voiceSelfMutedHint() },
    { flag: VoiceStateFlags.SelfDeafened, label: m.serverstats.voiceSelfDeafened(), hint: m.serverstats.voiceSelfDeafenedHint() },
    { flag: VoiceStateFlags.ServerMuted, label: m.serverstats.voiceServerMuted(), hint: m.serverstats.voiceServerMutedHint() },
    { flag: VoiceStateFlags.ServerDeafened, label: m.serverstats.voiceServerDeafened(), hint: m.serverstats.voiceServerDeafenedHint() },
    { flag: VoiceStateFlags.Afk, label: m.serverstats.voiceAfk(), hint: m.serverstats.voiceAfkHint() },
    { flag: VoiceStateFlags.Alone, label: m.serverstats.voiceAlone(), hint: m.serverstats.voiceAloneHint() },
    { flag: VoiceStateFlags.Streaming, label: m.serverstats.voiceStreaming(), hint: m.serverstats.voiceStreamingHint() },
    { flag: VoiceStateFlags.Video, label: m.serverstats.voiceCamera(), hint: m.serverstats.voiceCameraHint() },
  ]);

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
      savedSettings = { ...s };
      exclusions = ex;
      activityFilters = af;
      lookbackDraft = s.defaultLookbackDays;
      cooldownDraft = s.messageCooldownSeconds;
      if (!overview) lookback = s.defaultLookbackDays;
    } catch (err) {
      settingsError = err instanceof Error ? err.message : m.common.notifyLoadSettingsFailed();
      logger.error("Failed to load stats settings", err);
    } finally {
      settingsLoading = false;
    }
  }

  type SettingsRequest = Parameters<typeof serverStatsApi.updateSettings>[1];

  /**
   * Saves a partial settings change. The change shows straight away; the guild id and payload
   * are taken now, so a save still queued after switching servers carries this server's values.
   * Toggles and pickers save immediately and are put back if the save fails. Number fields wait
   * for typing to stop and keep what was typed on failure, so the header offers a retry instead.
   */
  function update(request: SettingsRequest, debounced = false) {
    if (!$currentGuild?.id || !settings) return;
    const guildId = $currentGuild.id;
    const keys = Object.keys(request) as Array<keyof SettingsRequest>;
    const key = keys.join(",");
    const previous: SettingsRequest = {};
    for (const k of keys) (previous as Record<string, unknown>)[k] = savedSettings?.[k];
    settings = { ...settings, ...request };

    const save = async () => {
      try {
        const result = await serverStatsApi.updateSettings(guildId, request);
        const confirmed: SettingsRequest = {};
        for (const k of keys) (confirmed as Record<string, unknown>)[k] = result[k];
        if (savedSettings) savedSettings = { ...savedSettings, ...confirmed };
        if ($currentGuild?.id === guildId && settings) settings = { ...settings, ...confirmed };
      } catch (err) {
        if (!debounced && $currentGuild?.id === guildId && settings) settings = { ...settings, ...previous };
        throw err;
      }
    };

    if (debounced) autoSave.schedule(key, save);
    else autoSave.now(key, save);
  }

  function saveLookback() {
    const value = lookbackDraft;
    if (!Number.isInteger(value) || value < 1 || value > 90) return;
    update({ defaultLookbackDays: value }, true);
  }

  function saveCooldown() {
    const value = cooldownDraft;
    if (!Number.isInteger(value) || value < 0 || value > 300) return;
    update({ messageCooldownSeconds: value }, true);
  }

  function voiceStateIgnored(flag: number): boolean {
    return ((settings?.voiceStates ?? 0) & flag) !== 0;
  }

  function toggleVoiceState(flag: number, ignored: boolean) {
    const current = settings?.voiceStates ?? 0;
    update({ voiceStates: ignored ? current | flag : current & ~flag });
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
      fail(err, m.common.failedToAddTheExclusion());
    }
  }

  async function removeExclusion(kind: 0 | 1 | 2, target: bigint) {
    if (!$currentGuild?.id) return;
    try {
      await serverStatsApi.removeExclusion($currentGuild.id, kind, target);
      exclusions = await serverStatsApi.getExclusions($currentGuild.id);
    } catch (err) {
      fail(err, m.common.failedToRemoveTheExclusion());
    }
  }

  async function toggleFilterName(name: string) {
    if (!$currentGuild?.id || !name.trim()) return;
    try {
      await serverStatsApi.toggleActivityFilter($currentGuild.id, name.trim());
      activityFilters = await serverStatsApi.getActivityFilters($currentGuild.id);
      filterNameDraft = "";
    } catch (err) {
      fail(err, m.serverstats.errorUpdateFilter());
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
  title={m.features.serverstatsName()}
  subtitle={m.serverstats.pageSubtitle()}
  icon="fa-chart-simple"
  guildName={$currentGuild?.name || m.common.dashboard()}
  {tabs}
  bind:activeTab
  bind:notificationMessage
  {notificationType}
  {autoSave}
>
  {#if activeTab === "overview"}
    <section>
      <SectionHeader icon="fa-chart-simple" title={m.serverstats.overviewTitle()} subtitle={windowLabel(lookback)} actions={windowActions} />

      <AsyncState loading={overviewLoading} error={overviewError} empty={!overview}>
        {#if overview}
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatTile label={m.common.messages()} value={formatNumber(overview.messages)} sub={m.serverstats.tileChatters({ count: formatNumber(overview.messageContributors) })} />
            <StatTile label={m.serverstats.tileVoiceTime()} value={formatDuration(overview.voiceSeconds)} sub={m.serverstats.tileInVoice({ count: formatNumber(overview.voiceContributors) })} />
            <StatTile label={m.common.joins()} value={formatNumber(overview.joins)} />
            <StatTile label={m.common.leaves()} value={formatNumber(overview.leaves)} />
            <StatTile label={m.common.netGrowth()} value={formatSigned(overview.netGrowth)} tone={overview.netGrowth >= 0 ? "ok" : "crit"} />
            <StatTile label={m.serverstats.tileMembersNow()} value={formatNumber(overview.now.members)} sub={m.serverstats.tileOnlineInVoice({ online: formatNumber(overview.now.online), voice: formatNumber(overview.now.inVoice) })} />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
            <StatTile label={m.serverstats.tileTopChatter()} value={overview.topMessageUser?.displayName || overview.topMessageUser?.name || "-"} sub={overview.topMessageUser ? m.common.messagesCount({ count: formatNumber(overview.topMessageUser.value) }) : undefined} />
            <StatTile label={m.serverstats.tileTopVoice()} value={overview.topVoiceUser?.displayName || overview.topVoiceUser?.name || "-"} sub={overview.topVoiceUser ? formatDuration(overview.topVoiceUser.value) : undefined} />
            <StatTile label={m.serverstats.tileBusiestChannel()} value={overview.topMessageChannel ? `#${overview.topMessageChannel.name ?? ""}` : "-"} sub={overview.topMessageChannel ? m.common.messagesCount({ count: formatNumber(overview.topMessageChannel.value) }) : undefined} />
            <StatTile label={m.serverstats.tileMostPlayed()} value={topGames[0]?.name ?? (settings?.trackActivities ? "-" : m.serverstats.tileTrackingOff())} sub={topGames[0] ? m.serverstats.tileMostPlayedSub({ duration: formatDuration(topGames[0].seconds), players: topGames[0].players }) : undefined} />
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card title={m.common.messages()}>
              <SimpleLineChart labels={messageLabels} series={[{ name: m.common.messages(), data: messageSeries.map((p) => p.value) }]} height={200} beginAtZero empty={m.serverstats.chartEmptyMessages()} />
            </Card>
            <Card title={m.serverstats.chartVoiceHours()}>
              <SimpleLineChart labels={voiceLabels} series={[{ name: m.common.hours(), data: voiceSeries.map((p) => Math.round(p.value * 10) / 10), color: "#b67ff0" }]} height={200} beginAtZero empty={m.serverstats.chartEmptyVoice()} />
            </Card>
            <Card title={m.common.members()}>
              <SimpleLineChart labels={snapshotLabels} series={[{ name: m.common.members(), data: snapshots.map((s) => s.members), color: "#4ade80" }]} height={200} empty={m.serverstats.chartEmptySnapshots()} />
            </Card>
            <Card title={m.serverstats.chartMemberStatus()}>
              <SimpleLineChart
                labels={snapshotLabels}
                series={[
                  { name: m.common.online(), data: snapshots.map((s) => s.online), color: "#43b581" },
                  { name: m.serverstats.chartIdle(), data: snapshots.map((s) => s.idle), color: "#faa61a" },
                  { name: m.serverstats.chartDnd(), data: snapshots.map((s) => s.dnd), color: "#f04747" },
                  { name: m.serverstats.chartInVoice(), data: snapshots.map((s) => s.inVoice), color: "#b67ff0" },
                ]}
                height={200}
                beginAtZero
                empty={m.serverstats.chartEmptySnapshots()}
              />
            </Card>
            <Card title={m.common.joinsAndLeaves()} class="xl:col-span-2">
              <SimpleLineChart
                labels={joinLabels}
                series={[
                  { name: m.common.joins(), data: joinLeave?.joins.map((p) => p.value) ?? [], color: "#4ade80" },
                  { name: m.common.leaves(), data: joinLeave?.leaves.map((p) => p.value) ?? [], color: "#f87171" },
                ]}
                height={200}
                beginAtZero
                empty={m.serverstats.chartEmptyJoins()}
              />
            </Card>
          </div>
        {/if}
      </AsyncState>
    </section>
  {/if}

  {#if activeTab === "top"}
    <section>
      <SectionHeader icon="fa-trophy" title={m.serverstats.rankTitle()} subtitle={windowLabel(lookback)}>
        {#snippet actions()}
          <WindowPicker
            bind:value={topKind}
            options={[
              { value: StatKind.Messages, label: m.common.messages() },
              { value: StatKind.Voice, label: m.features.categoryVoice() },
              ...(settings?.trackActivities ? [{ value: StatKind.Activity, label: m.common.games() }] : []),
            ]}
            ariaLabel={m.serverstats.rankKindLabel()}
            onchange={() => loadTop()}
          />
          <WindowPicker bind:value={lookback} options={lookbackOptions} onchange={changeWindow} />
          <button type="button" class="px-3 min-h-[36px] rounded-lg text-sm font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.primary};" onclick={exportTop}>
            <i class="fa-solid fa-download mr-1" aria-hidden="true"></i> {m.serverstats.rankCsv()}
          </button>
        {/snippet}
      </SectionHeader>

      <AsyncState loading={topLoading} error={topError} empty={topUsers.length === 0 && topActivities.length === 0} emptyMessage={m.serverstats.rankEmpty()}>
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card title={topKind === StatKind.Activity ? m.serverstats.rankTopGamesTime() : m.common.topMembers()}>
            <RankList rows={topUserRows} onselect={(row) => openUser(row.id)} />
          </Card>
          {#if topKind === StatKind.Activity}
            <Card title={m.serverstats.rankTopGamesApps()}>
              <RankList rows={topGameRows} onselect={(row) => openGame(row.name)} />
            </Card>
          {:else}
            <Card title={m.common.topChannels()}>
              {#if topChannelRows.length === 0}
                <p class="text-sm" style="color: {$colorStore.muted}">{m.serverstats.rankNoChannelActivity()}</p>
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
      <SectionHeader icon="fa-user" title={m.serverstats.tabLookup()} subtitle={windowLabel(lookback)} actions={windowActions} />

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title={m.common.member()}>
          <div class="mb-3">
            <DiscordSelector type="custom" options={members} customIcon="fa-user" placeholder={m.common.pickMemberPlaceholder()} bind:selected={lookupUserId} onchange={() => loadUser()} />
          </div>
          {#if userActivity}
            <div class="grid grid-cols-2 gap-2 mb-3">
              <StatTile label={m.common.messages()} value={formatNumber(userActivity.messages)} sub={userActivity.messageRank ? m.common.rankNumber({ rank: userActivity.messageRank }) : undefined} />
              <StatTile label={m.features.categoryVoice()} value={formatDuration(userActivity.voiceSeconds)} sub={userActivity.voiceRank ? m.common.rankNumber({ rank: userActivity.voiceRank }) : undefined} />
              <StatTile label={m.serverstats.lookupLifetimeMessages()} value={formatNumber(userActivity.allTimeMessages)} />
              <StatTile label={m.serverstats.lookupLifetimeVoice()} value={formatDuration(userActivity.allTimeVoiceSeconds)} />
            </div>
            {#if userActivity.topMessageChannels.length > 0}
              <h4 class="text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.serverstats.lookupChatsMost()}</h4>
              <ul class="text-sm mb-3 space-y-1" style="color: {$colorStore.muted}">
                {#each userActivity.topMessageChannels as c (c.id.toString())}
                  <li class="flex justify-between"><span>#{c.name ?? c.id.toString()}</span><span style="color: {$colorStore.secondary}">{formatNumber(c.value)}</span></li>
                {/each}
              </ul>
            {/if}
            {#if userActivity.topVoiceChannels.length > 0}
              <h4 class="text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.serverstats.lookupVoiceChannels()}</h4>
              <ul class="text-sm mb-3 space-y-1" style="color: {$colorStore.muted}">
                {#each userActivity.topVoiceChannels as c (c.id.toString())}
                  <li class="flex justify-between"><span>#{c.name ?? c.id.toString()}</span><span style="color: {$colorStore.secondary}">{formatDuration(c.value)}</span></li>
                {/each}
              </ul>
            {/if}
            {#if userGames.length > 0}
              <h4 class="text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.serverstats.lookupGamesApps()}</h4>
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
            <p class="text-sm" style="color: {$colorStore.muted}">{m.serverstats.lookupMemberEmpty()}</p>
          {/if}
        </Card>

        <Card title={m.common.channel()}>
          <div class="mb-3">
            <DiscordSelector type="channel" options={channels} placeholder={m.common.pickChannelPlaceholder()} bind:selected={lookupChannelId} onchange={() => loadChannel()} />
          </div>
          {#if channelActivity}
            <div class="grid grid-cols-3 gap-2 mb-3">
              <StatTile label={m.common.messages()} value={formatNumber(channelActivity.messages)} />
              <StatTile label={m.features.categoryVoice()} value={formatDuration(channelActivity.voiceSeconds)} />
              <StatTile label={m.serverstats.lookupPeople()} value={formatNumber(channelActivity.contributors)} />
            </div>
            {#if channelActivity.topMessageUsers.length > 0}
              <h4 class="text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.serverstats.lookupTopChatters()}</h4>
              <ul class="text-sm mb-3 space-y-1" style="color: {$colorStore.muted}">
                {#each channelActivity.topMessageUsers as u (u.id.toString())}
                  <li class="flex justify-between"><span>{u.displayName || u.name || u.id.toString()}</span><span style="color: {$colorStore.secondary}">{formatNumber(u.value)}</span></li>
                {/each}
              </ul>
            {/if}
            {#if channelActivity.topVoiceUsers.length > 0}
              <h4 class="text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.serverstats.tileTopVoice()}</h4>
              <ul class="text-sm space-y-1" style="color: {$colorStore.muted}">
                {#each channelActivity.topVoiceUsers as u (u.id.toString())}
                  <li class="flex justify-between"><span>{u.displayName || u.name || u.id.toString()}</span><span style="color: {$colorStore.secondary}">{formatDuration(u.value)}</span></li>
                {/each}
              </ul>
            {/if}
          {:else if !lookupLoading}
            <p class="text-sm" style="color: {$colorStore.muted}">{m.serverstats.lookupChannelEmpty()}</p>
          {/if}
        </Card>

        <Card title={m.serverstats.lookupWhoPlays()}>
          <div class="flex gap-2 mb-3">
            <input type="text" placeholder={m.serverstats.lookupGamePlaceholder()} bind:value={lookupGame} onkeydown={(e) => e.key === "Enter" && loadGame()} class="grow rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" aria-label={m.serverstats.lookupGamePlaceholder()} />
            <button type="button" class="min-h-[44px] px-4 rounded-lg font-medium" style="background: {$colorStore.primary}; color: #fff;" onclick={() => loadGame()}>{m.serverstats.lookupLookUp()}</button>
          </div>
          {#if !settings?.trackActivities}
            <p class="text-sm" style="color: {$colorStore.muted}">{m.serverstats.lookupTrackingOff()}</p>
          {:else if gameDetail}
            <div class="grid grid-cols-3 gap-2 mb-3">
              <StatTile label={m.serverstats.lookupPlayingNow()} value={formatNumber(gameDetail.activeNow)} />
              <StatTile label={m.common.players()} value={formatNumber(gameDetail.players)} />
              <StatTile label={m.common.totalTime()} value={formatDuration(gameDetail.totalSeconds)} />
            </div>
            {#if gameDetail.top.length > 0}
              <RankList rows={gameDetail.top.map((r) => ({ rank: r.rank, id: r.entry.id.toString(), name: r.entry.displayName || r.entry.name || r.entry.id.toString(), avatarUrl: r.entry.avatarUrl ?? null, value: formatDuration(r.entry.value) }))} onselect={(row) => openUser(row.id)} />
            {:else}
              <p class="text-sm" style="color: {$colorStore.muted}">{m.serverstats.lookupNobody({ game: gameDetail.name })}</p>
            {/if}
          {:else if !lookupLoading}
            <p class="text-sm" style="color: {$colorStore.muted}">{m.serverstats.lookupGameEmpty()}</p>
          {/if}
        </Card>
      </div>
    </section>
  {/if}

  {#if activeTab === "settings"}
    <section>
      <SectionHeader icon="fa-gear" title={m.serverstats.settingsTitle()} subtitle={m.serverstats.settingsSubtitle()} />

      <AsyncState loading={settingsLoading} error={settingsError} empty={!settings}>
        {#if settings}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <SettingToggle id="track-voice" label={m.serverstats.settingTrackVoice()} hint={m.serverstats.settingTrackVoiceHint()} checked={settings.trackVoice} onchange={(v) => update({ trackVoice: v })} />
            <SettingToggle id="track-snapshots" label={m.serverstats.settingSnapshots()} hint={m.serverstats.settingSnapshotsHint()} checked={settings.trackSnapshots} onchange={(v) => update({ trackSnapshots: v })} />
            <SettingToggle id="count-bots" label={m.serverstats.settingCountBots()} hint={m.serverstats.settingCountBotsHint()} checked={settings.countBots} onchange={(v) => update({ countBots: v })} />
            <SettingToggle id="track-activities" label={m.serverstats.settingTrackActivities()} hint={m.serverstats.settingTrackActivitiesHint()} checked={settings.trackActivities} onchange={(v) => update({ trackActivities: v })} />
            <SettingToggle id="verify-activities" label={m.serverstats.settingVerify()} hint={m.serverstats.settingVerifyHint()} checked={settings.verifyActivities} onchange={(v) => update({ verifyActivities: v })} disabled={!settings.trackActivities} />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <SettingField label={m.serverstats.settingWindow()} hint={m.serverstats.settingWindowHint()} id="lookback">
              <input id="lookback" type="number" min="1" max="90" step="1" bind:value={lookbackDraft} oninput={saveLookback} onblur={() => autoSave.flush("defaultLookbackDays")} class="w-full rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" />
            </SettingField>
            <SettingField label={m.serverstats.settingCooldown()} hint={m.serverstats.settingCooldownHint()} id="cooldown">
              <input id="cooldown" type="number" min="0" max="300" step="1" bind:value={cooldownDraft} oninput={saveCooldown} onblur={() => autoSave.flush("messageCooldownSeconds")} class="w-full rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" />
            </SettingField>
          </div>

          <Card title={m.serverstats.voiceStatesTitle()} note={m.serverstats.voiceStatesNote()} class="mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
              {#each voiceStateOptions as option (option.flag)}
                <SettingToggle id={`vs-${option.flag}`} label={option.label} hint={option.hint} checked={voiceStateIgnored(option.flag)} onchange={(v) => toggleVoiceState(option.flag, v)} />
              {/each}
            </div>
          </Card>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card title={m.common.ignoredChannels()} note={m.serverstats.ignoredChannelsNote()}>
              <div class="flex gap-2 mb-3">
                <div class="grow"><DiscordSelector type="channel" options={channels} placeholder={m.common.addAChannel()} bind:selected={excludeChannel} /></div>
                <button type="button" class="min-h-[44px] px-3 rounded-lg" style="background: {$colorStore.primary}; color: #fff;" onclick={() => addExclusion(StatsExclusionKind.Channel, excludeChannel)}>{m.common.add()}</button>
              </div>
              <ul class="space-y-1">
                {#each exclusions?.channels ?? [] as id (id.toString())}
                  <li class="flex items-center justify-between rounded-lg p-2" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
                    <span class="truncate">#{channelName(id)}</span>
                    <button type="button" class="text-sm px-2 min-h-[32px]" style="color: {$colorStore.accent};" onclick={() => removeExclusion(StatsExclusionKind.Channel, BigInt(id))} aria-label={m.common.remove()}>✕</button>
                  </li>
                {/each}
              </ul>
            </Card>
            <Card title={m.common.ignoredRoles()} note={m.serverstats.ignoredRolesNote()}>
              <div class="flex gap-2 mb-3">
                <div class="grow"><DiscordSelector type="role" options={roles} placeholder={m.common.addARole()} bind:selected={excludeRole} /></div>
                <button type="button" class="min-h-[44px] px-3 rounded-lg" style="background: {$colorStore.primary}; color: #fff;" onclick={() => addExclusion(StatsExclusionKind.Role, excludeRole)}>{m.common.add()}</button>
              </div>
              <ul class="space-y-1">
                {#each exclusions?.roles ?? [] as id (id.toString())}
                  <li class="flex items-center justify-between rounded-lg p-2" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
                    <span class="truncate">@{roleName(id.toString())}</span>
                    <button type="button" class="text-sm px-2 min-h-[32px]" style="color: {$colorStore.accent};" onclick={() => removeExclusion(StatsExclusionKind.Role, BigInt(id))} aria-label={m.common.remove()}>✕</button>
                  </li>
                {/each}
              </ul>
            </Card>
            <Card title={m.common.ignoredMembers()} note={m.serverstats.ignoredMembersNote()}>
              <div class="flex gap-2 mb-3">
                <div class="grow"><DiscordSelector type="custom" options={members} customIcon="fa-user" placeholder={m.common.addAMember()} bind:selected={excludeUser} /></div>
                <button type="button" class="min-h-[44px] px-3 rounded-lg" style="background: {$colorStore.primary}; color: #fff;" onclick={() => addExclusion(StatsExclusionKind.User, excludeUser)}>{m.common.add()}</button>
              </div>
              <ul class="space-y-1">
                {#each exclusions?.users ?? [] as id (id.toString())}
                  <li class="flex items-center justify-between rounded-lg p-2" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
                    <span class="truncate">{memberName(id)}</span>
                    <button type="button" class="text-sm px-2 min-h-[32px]" style="color: {$colorStore.accent};" onclick={() => removeExclusion(StatsExclusionKind.User, BigInt(id))} aria-label={m.common.remove()}>✕</button>
                  </li>
                {/each}
              </ul>
            </Card>
          </div>

          <Card title={m.serverstats.filterTitle()} note={m.serverstats.filterNote()}>
            <div class="flex flex-wrap items-center gap-3 mb-3">
              <WindowPicker
                value={settings.activityFilterMode}
                options={[
                  { value: ActivityFilterMode.Blacklist, label: m.common.blacklist() },
                  { value: ActivityFilterMode.Whitelist, label: m.common.whitelist() },
                ]}
                ariaLabel={m.serverstats.filterModeLabel()}
                onchange={(v) => update({ activityFilterMode: v as 0 | 1 })}
              />
              <p class="text-sm" style="color: {$colorStore.muted}">
                {settings.activityFilterMode === ActivityFilterMode.Whitelist ? m.serverstats.filterWhitelistHint() : m.serverstats.filterBlacklistHint()}
              </p>
            </div>
            <div class="flex gap-2 mb-3">
              <input type="text" maxlength="128" placeholder={m.serverstats.lookupGamePlaceholder()} bind:value={filterNameDraft} onkeydown={(e) => e.key === "Enter" && toggleFilterName(filterNameDraft)} class="grow rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" aria-label={m.serverstats.lookupGamePlaceholder()} />
              <button type="button" class="min-h-[44px] px-4 rounded-lg font-medium" style="background: {$colorStore.primary}; color: #fff;" onclick={() => toggleFilterName(filterNameDraft)}>{m.common.add()}</button>
            </div>
            <div class="flex flex-wrap gap-2">
              {#each activityFilters?.names ?? [] as name (name)}
                <span class="inline-flex items-center gap-2 rounded-full px-3 min-h-[36px] text-sm" style="background: {$colorStore.primary}15; color: {$colorStore.text};">
                  {name}
                  <button type="button" style="color: {$colorStore.accent};" onclick={() => toggleFilterName(name)} aria-label={m.common.ariaRemoveNamed({ name })}>✕</button>
                </span>
              {/each}
              {#if (activityFilters?.names.length ?? 0) === 0}
                <p class="text-sm" style="color: {$colorStore.muted}">{m.serverstats.filterEmpty()}</p>
              {/if}
            </div>
          </Card>
        {/if}
      </AsyncState>
    </section>
  {/if}
</DashboardPageLayout>
