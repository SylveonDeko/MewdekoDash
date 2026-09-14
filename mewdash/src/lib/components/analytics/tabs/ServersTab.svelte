<!-- lib/components/analytics/tabs/ServersTab.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { BouncedGuildRow, ChurnSummary, RetentionPoint, SilentGuildRow, SnapshotRow } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick, queryParams, timeParams } from "$lib/stores/analyticsFilters";
  import { ago, dayLabel, duration, n, pct, stamp, utcParse } from "../format";
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
  let drillGuild = $state("");
  let drillOpen = $state(false);
  let seq = 0;

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

  function drill(guildId: string) {
    drillGuild = guildId;
    drillOpen = true;
  }

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick];
    void load();
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
