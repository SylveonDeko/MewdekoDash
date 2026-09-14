<!-- lib/components/analytics/tabs/ShardTable.svelte -->
<script lang="ts">
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { BreakdownRow } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick, queryParams } from "$lib/stores/analyticsFilters";
  import { ms, n } from "../format";
  import AnalyticsTable, { type Column } from "../AnalyticsTable.svelte";

  interface ShardRow {
    shard: number;
    connected: boolean | null;
    latency: number | null;
    peak: number | null;
    guilds: number | null;
    reconnects: number | null;
  }

  let rows = $state<ShardRow[]>([]);
  let loading = $state(true);
  let seq = 0;

  const columns: Column<ShardRow>[] = [
    { key: "shard", label: "Shard", num: true },
    {
      key: "connected",
      label: "State",
      format: (r) => (r.connected === null ? "unknown" : r.connected ? "connected" : "down"),
      tone: (r) => (r.connected === null ? "muted" : r.connected ? "ok" : "crit"),
      sortValue: (r) => (r.connected === null ? -1 : r.connected ? 1 : 0),
    },
    { key: "latency", label: "Latency", num: true, format: (r) => ms(r.latency) },
    { key: "peak", label: "Peak", num: true, format: (r) => ms(r.peak), tone: (r) => (r.peak !== null && r.peak >= 1000 ? "crit" : r.peak !== null && r.peak >= 400 ? "warn" : null) },
    { key: "guilds", label: "Guilds", num: true, format: (r) => n(r.guilds) },
    { key: "reconnects", label: "Reconnects", num: true, format: (r) => n(r.reconnects) },
  ];

  function groups(result: PromiseSettledResult<BreakdownRow[]>): Record<string, number | null> {
    if (result.status !== "fulfilled") return {};
    return Object.fromEntries((result.value ?? []).map((r) => [r.name, r.value]));
  }

  async function load() {
    const my = ++seq;
    loading = true;
    const base = { label: "shard", limit: 500, ...queryParams($analyticsFilters, ["bot", "shard"]) };
    const results = await Promise.allSettled([
      analyticsApi.breakdown({ metric: "shard.state", agg: "last", ...base }),
      analyticsApi.breakdown({ metric: "shard.latency", agg: "last", ...base }),
      analyticsApi.breakdown({ metric: "shard.latency", agg: "max", ...base }),
      analyticsApi.breakdown({ metric: "guild.count", agg: "last", ...base }),
      analyticsApi.breakdown({ metric: "shard.reconnects", agg: "sum", ...base }),
    ]);
    if (my !== seq) return;
    for (const r of results) if (r.status === "rejected") logger.warn("Shard table query failed", r.reason);
    const [state, latency, peak, guilds, reconnects] = results.map(groups);
    const ids = new Set<string>([...Object.keys(state), ...Object.keys(latency), ...Object.keys(peak), ...Object.keys(guilds)]);
    rows = [...ids]
      .map((id) => ({
        shard: Number(id),
        connected: state[id] === null || state[id] === undefined ? null : state[id]! >= 1,
        latency: latency[id] ?? null,
        peak: peak[id] ?? null,
        guilds: guilds[id] ?? null,
        reconnects: reconnects[id] ?? null,
      }))
      .filter((r) => !Number.isNaN(r.shard));
    loading = false;
  }

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick];
    void load();
  });
</script>

<AnalyticsTable {columns} {rows} {loading} empty="No shards reporting" sortKey="shard" sortDesc={false} pageSize={24} />
