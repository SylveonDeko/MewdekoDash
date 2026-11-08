<!-- routes/dashboard/serverstats/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount, untrack } from "svelte";
  import { fade } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
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
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import SimpleLineChart from "$lib/components/analytics/SimpleLineChart.svelte";
  import StatTile from "$lib/components/analytics/StatTile.svelte";
  import AsyncState from "$lib/components/stats/AsyncState.svelte";
  import RankList, { type RankRow } from "$lib/components/stats/RankList.svelte";
  import {
    formatDate,
    formatDateTime,
    formatHour,
    formatDuration,
    formatNumber,
    formatSigned,
    lookbackOptions,
    saveBlob,
  } from "$lib/components/stats/format";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const TABS = ["overview", "top", "lookup", "settings"] as const;
  type TabId = (typeof TABS)[number];

  const tabs = $derived<Array<{ id: TabId; label: string; icon: string }>>([
    { id: "overview", label: m.common.overview(), icon: "fa-solid fa-chart-line" },
    { id: "top", label: m.serverstats.rankTitle(), icon: "fa-solid fa-trophy" },
    { id: "lookup", label: m.serverstats.tabLookup(), icon: "fa-solid fa-user" },
    { id: "settings", label: m.common.settings(), icon: "fa-solid fa-gear" },
  ]);

  const activeTab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find((id) => id === requested) ?? "overview";
  });

  function selectTab(id: TabId) {
    if (id === activeTab) return;
    void autoSave.flush();
    const url = new URL(page.url);
    url.searchParams.set("tab", id);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType = $state<"success" | "error">("success");

  function notify(message: string, type: "success" | "error" = "error") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => (showNotification = false), 4000);
  }

  const autoSave = createAutoSave({
    onError: () => notify(m.serverstats.notifySaveFailed(), "error"),
  });

  function fail(err: unknown, fallback: string) {
    logger.error(fallback, err);
    notify(err instanceof Error ? err.message : fallback, "error");
  }

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

  function channelName(id: bigint | string): string {
    const key = id.toString();
    return channels.find((c) => c.id === key)?.name ?? key;
  }

  function roleName(id: bigint | string): string {
    const key = id.toString();
    return roles.find((r) => r.id === key)?.name ?? key;
  }

  function memberName(id: bigint | string): string {
    const key = id.toString();
    return members.find((mem) => mem.id === key)?.name ?? key;
  }

  let lookback = $state(14);

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

  let lookupUserId = $state<string | null>(null);
  let lookupChannelId = $state<string | null>(null);
  let lookupGame = $state("");
  let userActivity = $state<UserActivity | null>(null);
  let userGames = $state<ActivityRow[]>([]);
  let userMessageSeries = $state<StatSeriesPoint[]>([]);
  let userVoiceSeries = $state<StatSeriesPoint[]>([]);
  let channelActivity = $state<ChannelActivity | null>(null);
  let channelMessageSeries = $state<StatSeriesPoint[]>([]);
  let channelVoiceSeries = $state<StatSeriesPoint[]>([]);
  let gameDetail = $state<ActivityDetail | null>(null);
  let lookupLoading = $state(false);

  async function loadUser() {
    if (!$currentGuild?.id || !lookupUserId) return;
    lookupLoading = true;
    try {
      const guildId = $currentGuild.id;
      const id = BigInt(lookupUserId);
      const chartDays = Math.max(1, lookback || 90);
      const [a, games, msgs, voice] = await Promise.all([
        serverStatsApi.getUser(guildId, id, lookback),
        settings?.trackActivities ? serverStatsApi.getTopActivities(guildId, lookback, 10, id).catch(() => []) : Promise.resolve([]),
        serverStatsApi.getSeries(guildId, StatChartKind.Messages, chartDays, id).catch(() => []),
        serverStatsApi.getSeries(guildId, StatChartKind.Voice, chartDays, id).catch(() => []),
      ]);
      userActivity = a;
      userGames = games;
      userMessageSeries = msgs;
      userVoiceSeries = voice;
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
      const guildId = $currentGuild.id;
      const id = BigInt(lookupChannelId);
      const chartDays = Math.max(1, lookback || 90);
      const [a, msgs, voice] = await Promise.all([
        serverStatsApi.getChannel(guildId, id, lookback),
        serverStatsApi.getSeries(guildId, StatChartKind.Messages, chartDays, undefined, id).catch(() => []),
        serverStatsApi.getSeries(guildId, StatChartKind.Voice, chartDays, undefined, id).catch(() => []),
      ]);
      channelActivity = a;
      channelMessageSeries = msgs;
      channelVoiceSeries = voice;
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
    selectTab("lookup");
    loadGame(name);
  }

  function openUser(id: string) {
    selectTab("lookup");
    lookupUserId = id;
    loadUser();
  }

  function openChannel(id: string) {
    selectTab("lookup");
    lookupChannelId = id;
    loadChannel();
  }

  let settings = $state<ServerStatsSettings | null>(null);
  let savedSettings: ServerStatsSettings | null = null;
  let exclusions = $state<StatsExclusions | null>(null);
  let activityFilters = $state<ActivityFilters | null>(null);
  let settingsLoading = $state(false);
  let settingsError = $state<string | null>(null);
  let lookbackDraft = $state(14);
  let cooldownDraft = $state(0);
  let excludePick = $state<Record<number, string | null>>({ 0: null, 1: null, 2: null });
  let filterNameDraft = $state("");

  const voiceStateOptions: Array<{ flag: number; label: string }> = $derived([
    { flag: VoiceStateFlags.SelfMuted, label: m.serverstats.voiceSelfMuted() },
    { flag: VoiceStateFlags.SelfDeafened, label: m.serverstats.voiceSelfDeafened() },
    { flag: VoiceStateFlags.ServerMuted, label: m.serverstats.voiceServerMuted() },
    { flag: VoiceStateFlags.ServerDeafened, label: m.serverstats.voiceServerDeafened() },
    { flag: VoiceStateFlags.Afk, label: m.serverstats.voiceAfk() },
    { flag: VoiceStateFlags.Alone, label: m.serverstats.voiceAlone() },
    { flag: VoiceStateFlags.Streaming, label: m.serverstats.voiceStreaming() },
    { flag: VoiceStateFlags.Video, label: m.serverstats.voiceCamera() },
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

  async function addExclusion(kind: 0 | 1 | 2) {
    const target = excludePick[kind];
    if (!$currentGuild?.id || !target) return;
    try {
      await serverStatsApi.addExclusion($currentGuild.id, kind, BigInt(target));
      exclusions = await serverStatsApi.getExclusions($currentGuild.id);
      excludePick[kind] = null;
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

  function changeWindow(value: number) {
    lookback = value;
    loadOverview();
    loadTop();
    if (lookupUserId) loadUser();
    if (lookupChannelId) loadChannel();
    if (lookupGame) loadGame();
  }

  function changeKind(value: number) {
    topKind = value;
    loadTop();
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

  const kindOptions = $derived([
    { value: StatKind.Messages, label: m.common.messages() },
    { value: StatKind.Voice, label: m.features.categoryVoice() },
    ...(settings?.trackActivities ? [{ value: StatKind.Activity, label: m.common.games() }] : []),
  ]);

  const exclusionGroups = $derived([
    { kind: StatsExclusionKind.Channel, title: m.common.ignoredChannels(), ids: exclusions?.channels ?? [], label: (id: bigint) => `#${channelName(id)}` },
    { kind: StatsExclusionKind.Role, title: m.common.ignoredRoles(), ids: exclusions?.roles ?? [], label: (id: bigint) => `@${roleName(id)}` },
    { kind: StatsExclusionKind.User, title: m.common.ignoredMembers(), ids: exclusions?.users ?? [], label: (id: bigint) => memberName(id) },
  ]);

  const inputStyle = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`);
</script>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-[10001]" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

{#snippet segmented(options: Array<{ value: number; label: string }>, value: number, onpick: (v: number) => void, cols: string, aria: string)}
  <div class="grid {cols} gap-2" role="group" aria-label={aria}>
    {#each options as option (option.value)}
      {@const selected = value === option.value}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => onpick(option.value)}
      >
        {option.label}
      </button>
    {/each}
  </div>
{/snippet}

{#snippet windowPicker()}
  {@render segmented(lookbackOptions, lookback, changeWindow, "grid-cols-3 sm:grid-cols-6", m.common.timeWindow())}
{/snippet}

{#snippet statList(title: string, rows: Array<{ id: bigint; label: string; value: string }>)}
  {#if rows.length > 0}
    <div>
      <h4 class="text-sm font-medium mb-1" style="color: {$colorStore.text}">{title}</h4>
      <ul class="text-sm space-y-1" style="color: {$colorStore.muted}">
        {#each rows as row (row.id.toString())}
          <li class="flex justify-between gap-2"><span class="truncate">{row.label}</span><span class="shrink-0" style="color: {$colorStore.secondary}">{row.value}</span></li>
        {/each}
      </ul>
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  icon="fa-chart-simple"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.serverstatsName()}
  subtitle={m.serverstats.pageSubtitle()}
>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.serverstats.tabsAria()}>
    {#each tabs as tab (tab.id)}
      {@const selected = activeTab === tab.id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => selectTab(tab.id)}
      >
        <i class={tab.icon} aria-hidden="true"></i>
        <span class="truncate">{tab.label}</span>
      </button>
    {/each}
  </div>

  {#if activeTab !== "settings"}
    {@render windowPicker()}
  {/if}

  {#if activeTab === "overview"}
    <AsyncState loading={overviewLoading} error={overviewError} empty={!overview}>
      {#if overview}
        <div class="space-y-4">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatTile label={m.common.messages()} value={formatNumber(overview.messages)} sub={m.serverstats.tileChatters({ count: formatNumber(overview.messageContributors) })} />
            <StatTile label={m.serverstats.tileVoiceTime()} value={formatDuration(overview.voiceSeconds)} sub={m.serverstats.tileInVoice({ count: formatNumber(overview.voiceContributors) })} />
            <StatTile label={m.common.joins()} value={formatNumber(overview.joins)} />
            <StatTile label={m.common.leaves()} value={formatNumber(overview.leaves)} />
            <StatTile label={m.common.netGrowth()} value={formatSigned(overview.netGrowth)} tone={overview.netGrowth >= 0 ? "ok" : "crit"} />
            <StatTile label={m.serverstats.tileMembersNow()} value={formatNumber(overview.now.members)} sub={m.serverstats.tileOnlineInVoice({ online: formatNumber(overview.now.online), voice: formatNumber(overview.now.inVoice) })} />
          </div>

          <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <StatTile label={m.serverstats.tileTopChatter()} value={overview.topMessageUser?.displayName || overview.topMessageUser?.name || "-"} sub={overview.topMessageUser ? m.common.messagesCount({ count: formatNumber(overview.topMessageUser.value) }) : undefined} />
            <StatTile label={m.serverstats.tileTopVoice()} value={overview.topVoiceUser?.displayName || overview.topVoiceUser?.name || "-"} sub={overview.topVoiceUser ? formatDuration(overview.topVoiceUser.value) : undefined} />
            <StatTile label={m.serverstats.tileBusiestChannel()} value={overview.topMessageChannel ? `#${overview.topMessageChannel.name ?? ""}` : "-"} sub={overview.topMessageChannel ? m.common.messagesCount({ count: formatNumber(overview.topMessageChannel.value) }) : undefined} />
            <StatTile label={m.serverstats.tileMostPlayed()} value={topGames[0]?.name ?? (settings?.trackActivities ? "-" : m.serverstats.tileTrackingOff())} sub={topGames[0] ? m.serverstats.tileMostPlayedSub({ duration: formatDuration(topGames[0].seconds), players: topGames[0].players }) : undefined} />
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <PluginCard title={m.common.messages()} alwaysOpen>
              <SimpleLineChart labels={messageLabels} series={[{ name: m.common.messages(), data: messageSeries.map((p) => p.value) }]} height={200} beginAtZero empty={m.serverstats.chartEmptyMessages()} />
            </PluginCard>
            <PluginCard title={m.serverstats.chartVoiceHours()} alwaysOpen>
              <SimpleLineChart labels={voiceLabels} series={[{ name: m.common.hours(), data: voiceSeries.map((p) => Math.round(p.value * 10) / 10), color: "#b67ff0" }]} height={200} beginAtZero empty={m.serverstats.chartEmptyVoice()} />
            </PluginCard>
            <PluginCard title={m.common.members()} alwaysOpen>
              <SimpleLineChart labels={snapshotLabels} series={[{ name: m.common.members(), data: snapshots.map((s) => s.members), color: "#4ade80" }]} height={200} empty={m.serverstats.chartEmptySnapshots()} />
            </PluginCard>
            <PluginCard title={m.serverstats.chartMemberStatus()} alwaysOpen>
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
            </PluginCard>
            <PluginCard title={m.common.joinsAndLeaves()} alwaysOpen>
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
            </PluginCard>
          </div>
        </div>
      {/if}
    </AsyncState>
  {/if}

  {#if activeTab === "top"}
    <div class="flex flex-wrap items-center gap-2">
      <div class="grow min-w-0">
        {@render segmented(kindOptions, topKind, changeKind, kindOptions.length === 3 ? "grid-cols-3" : "grid-cols-2", m.serverstats.rankKindLabel())}
      </div>
      <button
        type="button"
        class="min-h-[44px] px-4 rounded-lg text-sm font-medium"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        onclick={exportTop}
      >
        <i class="fa-solid fa-download mr-1" aria-hidden="true"></i>
        {m.serverstats.rankCsv()}
      </button>
    </div>

    <AsyncState loading={topLoading} error={topError} empty={topUsers.length === 0 && topActivities.length === 0} emptyMessage={m.serverstats.rankEmpty()}>
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <PluginCard title={topKind === StatKind.Activity ? m.serverstats.rankTopGamesTime() : m.common.topMembers()} alwaysOpen>
          <RankList rows={topUserRows} onselect={(row) => openUser(row.id)} />
        </PluginCard>
        {#if topKind === StatKind.Activity}
          <PluginCard title={m.serverstats.rankTopGamesApps()} alwaysOpen>
            <RankList rows={topGameRows} onselect={(row) => openGame(row.name)} />
          </PluginCard>
        {:else}
          <PluginCard title={m.common.topChannels()} alwaysOpen>
            {#if topChannelRows.length === 0}
              <p class="text-sm" style="color: {$colorStore.muted}">{m.serverstats.rankNoChannelActivity()}</p>
            {:else}
              <RankList rows={topChannelRows} onselect={(row) => openChannel(row.id)} />
            {/if}
          </PluginCard>
        {/if}
      </div>
    </AsyncState>
  {/if}

  {#if activeTab === "lookup"}
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <PluginCard title={m.common.member()} alwaysOpen>
        <DiscordSelector type="custom" options={members} customIcon="fa-user" placeholder={m.common.pickMemberPlaceholder()} bind:selected={lookupUserId} onchange={() => loadUser()} />
        {#if userActivity}
          <div class="grid grid-cols-2 gap-2">
            <StatTile label={m.common.messages()} value={formatNumber(userActivity.messages)} sub={userActivity.messageRank ? m.common.rankNumber({ rank: userActivity.messageRank }) : undefined} />
            <StatTile label={m.features.categoryVoice()} value={formatDuration(userActivity.voiceSeconds)} sub={userActivity.voiceRank ? m.common.rankNumber({ rank: userActivity.voiceRank }) : undefined} />
            <StatTile label={m.serverstats.lookupLifetimeMessages()} value={formatNumber(userActivity.allTimeMessages)} />
            <StatTile label={m.serverstats.lookupLifetimeVoice()} value={formatDuration(userActivity.allTimeVoiceSeconds)} />
          </div>
          <SimpleLineChart labels={userMessageSeries.map((p) => bucketLabel(p.bucket))} series={[{ name: m.common.messages(), data: userMessageSeries.map((p) => p.value) }]} height={160} beginAtZero empty={m.serverstats.chartEmptyMessages()} />
          <SimpleLineChart labels={userVoiceSeries.map((p) => bucketLabel(p.bucket))} series={[{ name: m.common.hours(), data: userVoiceSeries.map((p) => Math.round(p.value * 10) / 10), color: "#b67ff0" }]} height={160} beginAtZero empty={m.serverstats.chartEmptyVoice()} />
          {@render statList(m.serverstats.lookupChatsMost(), userActivity.topMessageChannels.map((c) => ({ id: c.id, label: `#${c.name ?? c.id.toString()}`, value: formatNumber(c.value) })))}
          {@render statList(m.serverstats.lookupVoiceChannels(), userActivity.topVoiceChannels.map((c) => ({ id: c.id, label: `#${c.name ?? c.id.toString()}`, value: formatDuration(c.value) })))}
          {#if userGames.length > 0}
            <div>
              <h4 class="text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.serverstats.lookupGamesApps()}</h4>
              <ul class="text-sm space-y-1" style="color: {$colorStore.muted}">
                {#each userGames as g (g.rank)}
                  <li class="flex justify-between gap-2">
                    <button type="button" class="truncate text-left min-h-[44px]" onclick={() => openGame(g.name)}>{g.name}</button>
                    <span class="shrink-0 self-center" style="color: {$colorStore.secondary}">{formatDuration(g.seconds)}</span>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        {:else if !lookupLoading}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.serverstats.lookupMemberEmpty()}</p>
        {/if}
      </PluginCard>

      <PluginCard title={m.common.channel()} alwaysOpen>
        <DiscordSelector type="channel" options={channels} placeholder={m.common.pickChannelPlaceholder()} bind:selected={lookupChannelId} onchange={() => loadChannel()} />
        {#if channelActivity}
          <div class="grid grid-cols-3 gap-2">
            <StatTile label={m.common.messages()} value={formatNumber(channelActivity.messages)} />
            <StatTile label={m.features.categoryVoice()} value={formatDuration(channelActivity.voiceSeconds)} />
            <StatTile label={m.serverstats.lookupPeople()} value={formatNumber(channelActivity.contributors)} />
          </div>
          <SimpleLineChart labels={channelMessageSeries.map((p) => bucketLabel(p.bucket))} series={[{ name: m.common.messages(), data: channelMessageSeries.map((p) => p.value) }]} height={160} beginAtZero empty={m.serverstats.chartEmptyMessages()} />
          <SimpleLineChart labels={channelVoiceSeries.map((p) => bucketLabel(p.bucket))} series={[{ name: m.common.hours(), data: channelVoiceSeries.map((p) => Math.round(p.value * 10) / 10), color: "#b67ff0" }]} height={160} beginAtZero empty={m.serverstats.chartEmptyVoice()} />
          {@render statList(m.serverstats.lookupTopChatters(), channelActivity.topMessageUsers.map((u) => ({ id: u.id, label: u.displayName || u.name || u.id.toString(), value: formatNumber(u.value) })))}
          {@render statList(m.serverstats.tileTopVoice(), channelActivity.topVoiceUsers.map((u) => ({ id: u.id, label: u.displayName || u.name || u.id.toString(), value: formatDuration(u.value) })))}
        {:else if !lookupLoading}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.serverstats.lookupChannelEmpty()}</p>
        {/if}
      </PluginCard>

      <PluginCard title={m.serverstats.lookupWhoPlays()} alwaysOpen>
        <div class="flex gap-2">
          <input type="text" placeholder={m.serverstats.lookupGamePlaceholder()} bind:value={lookupGame} onkeydown={(e) => e.key === "Enter" && loadGame()} class="grow min-w-0 rounded-lg px-3 min-h-[50px]" style={inputStyle} aria-label={m.serverstats.lookupGamePlaceholder()} />
          <button type="button" class="min-h-[50px] px-4 rounded-lg font-medium shrink-0" style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" onclick={() => loadGame()}>{m.serverstats.lookupLookUp()}</button>
        </div>
        {#if !settings?.trackActivities}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.serverstats.lookupTrackingOff()}</p>
        {:else if gameDetail}
          <div class="grid grid-cols-3 gap-2">
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
      </PluginCard>
    </div>
  {/if}

  {#if activeTab === "settings"}
    <AsyncState loading={settingsLoading} error={settingsError} empty={!settings}>
      {#if settings}
        <PluginCard title={m.serverstats.settingsTitle()} alwaysOpen>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ToggleRow id="track-voice" title={m.serverstats.settingTrackVoice()} colors={$colorStore} checked={settings.trackVoice} onchange={(v) => update({ trackVoice: v })} />
            <ToggleRow id="track-snapshots" title={m.serverstats.settingSnapshots()} colors={$colorStore} checked={settings.trackSnapshots} onchange={(v) => update({ trackSnapshots: v })} />
            <ToggleRow id="count-bots" title={m.serverstats.settingCountBots()} colors={$colorStore} checked={settings.countBots} onchange={(v) => update({ countBots: v })} />
            <ToggleRow id="track-activities" title={m.serverstats.settingTrackActivities()} colors={$colorStore} checked={settings.trackActivities} onchange={(v) => update({ trackActivities: v })} />
            {#if settings.trackActivities}
              <ToggleRow id="verify-activities" title={m.serverstats.settingVerify()} colors={$colorStore} checked={settings.verifyActivities} onchange={(v) => update({ verifyActivities: v })} />
            {/if}
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingField label={m.serverstats.settingWindow()} id="lookback">
              <input id="lookback" type="number" min="1" max="90" step="1" bind:value={lookbackDraft} oninput={saveLookback} onblur={() => autoSave.flush("defaultLookbackDays")} class="w-full rounded-lg px-3 min-h-[44px]" style={inputStyle} />
            </SettingField>
            <SettingField label={m.serverstats.settingCooldown()} hint={m.serverstats.settingCooldownHint()} id="cooldown">
              <input id="cooldown" type="number" min="0" max="300" step="1" bind:value={cooldownDraft} oninput={saveCooldown} onblur={() => autoSave.flush("messageCooldownSeconds")} class="w-full rounded-lg px-3 min-h-[44px]" style={inputStyle} />
            </SettingField>
          </div>
        </PluginCard>

        <PluginCard title={m.serverstats.voiceStatesTitle()} alwaysOpen>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
            {#each voiceStateOptions as option (option.flag)}
              <ToggleRow id={`vs-${option.flag}`} title={option.label} colors={$colorStore} checked={voiceStateIgnored(option.flag)} onchange={(v) => toggleVoiceState(option.flag, v)} />
            {/each}
          </div>
        </PluginCard>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {#each exclusionGroups as group (group.kind)}
            <PluginCard title={group.title} alwaysOpen>
              <div class="flex gap-2">
                <div class="grow min-w-0">
                  {#if group.kind === StatsExclusionKind.Channel}
                    <DiscordSelector type="channel" options={channels} placeholder={m.common.addAChannel()} bind:selected={excludePick[group.kind]} />
                  {:else if group.kind === StatsExclusionKind.Role}
                    <DiscordSelector type="role" options={roles} placeholder={m.common.addARole()} bind:selected={excludePick[group.kind]} />
                  {:else}
                    <DiscordSelector type="custom" options={members} customIcon="fa-user" placeholder={m.common.addAMember()} bind:selected={excludePick[group.kind]} />
                  {/if}
                </div>
                <button type="button" class="min-h-[50px] px-4 rounded-lg shrink-0" style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" onclick={() => addExclusion(group.kind)}>{m.common.add()}</button>
              </div>
              <ul class="space-y-1">
                {#each group.ids as id (id.toString())}
                  <li class="flex items-center justify-between gap-2 rounded-lg pl-3" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
                    <span class="truncate">{group.label(id)}</span>
                    <button type="button" class="min-h-[44px] min-w-[44px]" style="color: {$colorStore.accent};" onclick={() => removeExclusion(group.kind, BigInt(id))} aria-label={m.common.remove()}>
                      <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </button>
                  </li>
                {/each}
              </ul>
            </PluginCard>
          {/each}
        </div>

        <PluginCard title={m.serverstats.filterTitle()} alwaysOpen>
          {@render segmented(
            [
              { value: ActivityFilterMode.Blacklist, label: m.common.blacklist() },
              { value: ActivityFilterMode.Whitelist, label: m.common.whitelist() },
            ],
            settings.activityFilterMode,
            (v) => update({ activityFilterMode: v as 0 | 1 }),
            "grid-cols-2",
            m.serverstats.filterModeLabel(),
          )}
          <div class="flex gap-2">
            <input type="text" maxlength="128" placeholder={m.serverstats.lookupGamePlaceholder()} bind:value={filterNameDraft} onkeydown={(e) => e.key === "Enter" && toggleFilterName(filterNameDraft)} class="grow min-w-0 rounded-lg px-3 min-h-[50px]" style={inputStyle} aria-label={m.serverstats.lookupGamePlaceholder()} />
            <button type="button" class="min-h-[50px] px-4 rounded-lg font-medium shrink-0" style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" onclick={() => toggleFilterName(filterNameDraft)}>{m.common.add()}</button>
          </div>
          <div class="flex flex-wrap gap-2">
            {#each activityFilters?.names ?? [] as name (name)}
              <span class="inline-flex items-center gap-1 rounded-full pl-3 min-h-[44px] text-sm max-w-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">
                <span class="truncate">{name}</span>
                <button type="button" class="min-h-[44px] min-w-[44px]" style="color: {$colorStore.accent};" onclick={() => toggleFilterName(name)} aria-label={m.common.ariaRemoveNamed({ name })}>
                  <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
              </span>
            {/each}
            {#if (activityFilters?.names.length ?? 0) === 0}
              <p class="text-sm" style="color: {$colorStore.muted}">{m.serverstats.filterEmpty()}</p>
            {/if}
          </div>
        </PluginCard>
      {/if}
    </AsyncState>
  {/if}
</PluginPage>
