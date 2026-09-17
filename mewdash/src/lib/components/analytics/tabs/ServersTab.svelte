<!-- lib/components/analytics/tabs/ServersTab.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { BouncedGuildRow, ChurnSummary, GuildOverviewRow, RetentionPoint, SilentGuildRow, SnapshotRow } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick, queryParams, timeParams } from "$lib/stores/analyticsFilters";
  import { ago, compact, dayLabel, duration, n, pct, stamp, utcParse } from "../format";
  import { CRIT, GOOD } from "../palette";
  import AnalyticsTile from "../AnalyticsTile.svelte";
  import AnalyticsChart from "../AnalyticsChart.svelte";
  import AnalyticsTable, { type Column } from "../AnalyticsTable.svelte";
  import BreakdownBar from "../BreakdownBar.svelte";
  import Card from "../Card.svelte";
  import DrillModal from "../DrillModal.svelte";
  import GuildCardView from "../GuildCardView.svelte";
  import SimpleLineChart from "../SimpleLineChart.svelte";
  import StatTile from "../StatTile.svelte";

  let snapshots = $state<SnapshotRow[]>([]);
  let snapshotsLoading = $state(true);
  let churn = $state<ChurnSummary | null>(null);
  let churnLoading = $state(true);
  let retention = $state<RetentionPoint[]>([]);
  let retentionLoading = $state(true);
  let bounced = $state<BouncedGuildRow[]>([]);
  let bouncedLoading = $state(true);
  let silent = $state<SilentGuildRow[]>([]);
  let silentLoading = $state(true);
  let overview = $state<GuildOverviewRow[]>([]);
  let overviewLoading = $state(true);
  let overviewSearch = $state("");
  let drillGuild = $state("");
  let drillOpen = $state(false);
  let seq = 0;
  let overviewSeq = 0;

  let overviewRows = $derived.by(() => {
    const q = overviewSearch.trim().toLowerCase();
    if (!q) return overview;
    return overview.filter((r) => r.name.toLowerCase().includes(q) || r.guildId.includes(q));
  });
  let overviewTotals = $derived.by(() => {
    let humans = 0;
    let bots = 0;
    let configured = 0;
    for (const r of overview) {
      humans += r.shape.humans;
      bots += r.shape.bots;
      if (r.featuresConfigured > 0) configured++;
    }
    return { humans, bots, configured };
  });

  function botTone(r: GuildOverviewRow): "ok" | "warn" | "crit" | "muted" | null {
    const ratio = r.shape.memberCount ? r.shape.bots / r.shape.memberCount : 0;
    return ratio >= 0.5 ? "crit" : ratio >= 0.25 ? "warn" : null;
  }

  const overviewColumns: Column<GuildOverviewRow>[] = [
    { key: "name", label: "Server", format: (r) => r.name, title: (r) => r.guildId },
    { key: "memberCount", label: "Members", num: true, format: (r) => n(r.shape.memberCount), sortValue: (r) => r.shape.memberCount },
    { key: "humans", label: "Humans", num: true, format: (r) => n(r.shape.humans), sortValue: (r) => r.shape.humans },
    { key: "bots", label: "Bots", num: true, format: (r) => `${n(r.shape.bots)} · ${pct(r.shape.memberCount ? (r.shape.bots / r.shape.memberCount) * 100 : 0, 0)}`, sortValue: (r) => r.shape.bots, tone: botTone },
    { key: "online", label: "Online", num: true, format: (r) => n(r.shape.online), sortValue: (r) => r.shape.online },
    { key: "boosts", label: "Boosts", num: true, format: (r) => (r.shape.boosts ? `${n(r.shape.boosts)} · T${r.shape.boostTier}` : "—"), sortValue: (r) => r.shape.boosts },
    { key: "commands", label: "Commands", num: true, format: (r) => compact(r.commands) },
    { key: "events", label: "Events", num: true, format: (r) => compact(r.events) },
    { key: "featuresUsed", label: "Features", num: true, format: (r) => `${r.featuresUsed} used · ${r.featuresEnabled}/${r.featuresConfigured} on`, title: (r) => r.features.join(", ") || "none used in range" },
    { key: "shard", label: "Shard", num: true, muted: true },
    { key: "joinedAt", label: "Joined", muted: true, format: (r) => (r.joinedAt ? ago(r.joinedAt) : "—"), sortValue: (r) => (r.joinedAt ? utcParse(r.joinedAt) : null) },
  ];

  let byDay = $derived.by(() => {
    const map = new Map<string, { guilds: number; users: number }>();
    for (const s of snapshots) {
      const key = s.day.slice(0, 10);
      const cur = map.get(key) ?? { guilds: 0, users: 0 };
      map.set(key, { guilds: cur.guilds + s.guilds, users: cur.users + s.users });
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  });
  let snapshotLabels = $derived(byDay.map(([d]) => d.slice(5)));
  let guildSeries = $derived([{ name: "Servers", data: byDay.map(([, v]) => v.guilds) }]);
  let userSeries = $derived([{ name: "Users", data: byDay.map(([, v]) => v.users) }]);

  let churnLabels = $derived((churn?.days ?? []).map((d) => dayLabel(d.day)));
  let churnSeries = $derived([
    { name: "Joins", data: (churn?.days ?? []).map((d) => d.joins), color: GOOD },
    { name: "Leaves", data: (churn?.days ?? []).map((d) => d.leaves), color: CRIT },
  ]);

  let retentionLabels = $derived(retention.map((r) => dayLabel(r.day)));
  let retentionSeries = $derived([{ name: "Retained %", data: retention.map((r) => (r.rate === null ? null : r.rate * 100)) }]);

  const bouncedColumns: Column<BouncedGuildRow>[] = [
    { key: "guildId", label: "Guild", mono: true },
    { key: "firstSeen", label: "First seen", muted: true, format: (r) => stamp(r.firstSeen), sortValue: (r) => utcParse(r.firstSeen) },
    { key: "lastSeen", label: "Last seen", muted: true, format: (r) => stamp(r.lastSeen), sortValue: (r) => utcParse(r.lastSeen) },
    { key: "stay", label: "Stayed", num: true, format: (r) => duration((utcParse(r.lastSeen) - utcParse(r.firstSeen)) / 1000), sortValue: (r) => utcParse(r.lastSeen) - utcParse(r.firstSeen) },
    { key: "events", label: "Events", num: true },
  ];

  const silentColumns: Column<SilentGuildRow>[] = [
    { key: "guildId", label: "Guild", mono: true },
    { key: "name", label: "Name", format: (r) => r.name ?? "—" },
    { key: "memberCount", label: "Members", num: true, format: (r) => n(r.memberCount) },
    { key: "lastActive", label: "Last active", muted: true, format: (r) => ago(r.lastActive), sortValue: (r) => utcParse(r.lastActive) },
    { key: "events", label: "Prior events", num: true },
  ];

  async function load() {
    const my = ++seq;
    const f = $analyticsFilters;
    const bot = f.bot || undefined;
    snapshotsLoading = churnLoading = retentionLoading = bouncedLoading = silentLoading = true;
    const [s, c, r, b, q] = await Promise.allSettled([
      analyticsApi.serverSnapshots(30, bot),
      analyticsApi.growthChurn(queryParams(f, ["bot", "shard"])),
      analyticsApi.growthRetention(30, { bot, shard: f.shard || undefined }),
      analyticsApi.growthBounced({ ...timeParams(f), bot, limit: 50 }),
      analyticsApi.growthSilent({ bot, limit: 50 }),
    ]);
    if (my !== seq) return;
    snapshots = s.status === "fulfilled" ? s.value ?? [] : [];
    churn = c.status === "fulfilled" ? c.value ?? null : null;
    retention = r.status === "fulfilled" ? r.value ?? [] : [];
    bounced = b.status === "fulfilled" ? b.value ?? [] : [];
    silent = q.status === "fulfilled" ? q.value ?? [] : [];
    for (const x of [s, c, r, b, q]) if (x.status === "rejected") logger.warn("Servers tab query failed", x.reason);
    snapshotsLoading = churnLoading = retentionLoading = bouncedLoading = silentLoading = false;
  }

  async function loadOverview() {
    const my = ++overviewSeq;
    const f = $analyticsFilters;
    overviewLoading = true;
    try {
      const rows = await analyticsApi.serverOverview({ ...timeParams(f), bot: f.bot || undefined });
      if (my !== overviewSeq) return;
      overview = rows ?? [];
    } catch (err) {
      if (my !== overviewSeq) return;
      logger.warn("Server overview failed", err);
      overview = [];
    } finally {
      if (my === overviewSeq) overviewLoading = false;
    }
  }

  function drill(guildId: string) {
    drillGuild = guildId;
    drillOpen = true;
  }

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick];
    void load();
    void loadOverview();
  });
</script>

<div class="space-y-4">
  <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
    <AnalyticsTile label="Servers" metric="guild.count" agg="last" format="int" filters={["bot", "shard"]} />
    <AnalyticsTile label="Users" metric="user.count" agg="last" format="compact" filters={["bot"]} />
    <StatTile label="Joined" value={n(churn?.joins)} loading={churnLoading} />
    <StatTile label="Left" value={n(churn?.leaves)} loading={churnLoading} />
    <StatTile label="Net" value={churn ? `${churn.net >= 0 ? "+" : ""}${n(churn.net)}` : "—"} loading={churnLoading} tone={churn ? (churn.net >= 0 ? "ok" : "crit") : null} />
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Card title="Servers · daily snapshots" note="30d">
      <SimpleLineChart labels={snapshotLabels} series={guildSeries} loading={snapshotsLoading} empty="No snapshots yet" height={200} />
    </Card>
    <Card title="Users · daily snapshots" note="30d">
      <SimpleLineChart labels={snapshotLabels} series={userSeries} loading={snapshotsLoading} empty="No snapshots yet" height={200} />
    </Card>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
    <Card title="Joins and leaves per day" class="xl:col-span-2">
      <SimpleLineChart labels={churnLabels} series={churnSeries} type="bar" loading={churnLoading} height={220} beginAtZero />
    </Card>
    <Card title="Churn">
      {#if churnLoading && !churn}
        <div class="h-3 rounded animate-pulse" style="background: {$colorStore.primary}20"></div>
      {:else if !churn}
        <p class="text-xs" style="color: {$colorStore.muted}">No data</p>
      {:else}
        <div class="space-y-3">
          <p class="text-xs font-mono" style="color: {$colorStore.muted}">
            bounced {n(churn.bounced)} · bounce rate {pct((churn.bounceRate ?? 0) * 100)}
          </p>
          <div>
            <p class="text-xs uppercase tracking-wide mb-1" style="color: {$colorStore.muted}">Joins by size</p>
            <BreakdownBar rows={churn.joinsBySize} color={GOOD} max={6} />
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide mb-1" style="color: {$colorStore.muted}">Leaves by size</p>
            <BreakdownBar rows={churn.leavesBySize} color={CRIT} max={6} />
          </div>
        </div>
      {/if}
    </Card>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Card title="Retention by join day" note="still present · 30d">
      <SimpleLineChart labels={retentionLabels} series={retentionSeries} loading={retentionLoading} unit="%" height={200} beginAtZero />
    </Card>
    <Card title="Joins by size">
      <AnalyticsChart metric="guild.join" agg="sum" groupBy="size" filters={["bot", "shard"]} type="bar" stack unit="guilds" height={200} />
    </Card>
  </div>

  <Card title="Server overview" note="{n(overviewRows.length)} of {n(overview.length)} · {compact(overviewTotals.humans)} humans · {compact(overviewTotals.bots)} bots · {n(overviewTotals.configured)} configured · row → card">
    {#snippet actions()}
      <input
        type="search"
        class="min-h-[36px] rounded-lg border px-2 text-xs"
        style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.primary}20;"
        placeholder="name or id"
        bind:value={overviewSearch}
        aria-label="Search servers"
      />
    {/snippet}
    <AnalyticsTable columns={overviewColumns} rows={overviewRows} loading={overviewLoading} empty="No servers" sortKey="memberCount" pageSize={25} onRowClick={(r) => drill(r.guildId)} />
  </Card>

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Card title="Bounced guilds" note="row → card">
      <AnalyticsTable columns={bouncedColumns} rows={bounced} loading={bouncedLoading} empty="No bounces" sortKey="lastSeen" pageSize={10} onRowClick={(r) => drill(r.guildId)} />
    </Card>
    <Card title="Went silent" note="row → card">
      <AnalyticsTable columns={silentColumns} rows={silent} loading={silentLoading} empty="Nothing went quiet" sortKey="events" pageSize={10} onRowClick={(r) => drill(r.guildId)} />
    </Card>
  </div>
</div>

<DrillModal bind:open={drillOpen} title="Guild {drillGuild}">
  {#if drillOpen}
    <GuildCardView guildId={drillGuild} />
  {/if}
</DrillModal>
