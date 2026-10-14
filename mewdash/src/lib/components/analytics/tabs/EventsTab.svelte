<!-- lib/components/analytics/tabs/EventsTab.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { EventCountRow } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick, queryParams } from "$lib/stores/analyticsFilters";
  import { compact } from "../format";
  import AnalyticsChart from "../AnalyticsChart.svelte";
  import AnalyticsTile from "../AnalyticsTile.svelte";
  import AnalyticsTable, { type Column } from "../AnalyticsTable.svelte";
  import BreakdownPanel from "../BreakdownPanel.svelte";
  import Card from "../Card.svelte";

  let counts = $state<EventCountRow[]>([]);
  let loading = $state(true);
  let seq = 0;

  const columns: Column<EventCountRow>[] = $derived([
    { key: "type", label: m.common.type(), mono: true },
    { key: "count", label: m.common.count(), num: true, format: (r) => compact(r.count) },
  ]);

  async function load() {
    const my = ++seq;
    loading = true;
    try {
      const rows = await analyticsApi.eventCounts(queryParams($analyticsFilters, ["bot", "shard"]));
      if (my !== seq) return;
      counts = rows ?? [];
    } catch (err) {
      if (my !== seq) return;
      logger.warn("Event counts failed", err);
      counts = [];
    } finally {
      if (my === seq) loading = false;
    }
  }

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick];
    void load();
  });
</script>

<div class="space-y-4">
  <div class="grid grid-cols-1 xl:grid-cols-4 gap-4">
    <Card title={m.analytics.tabEventsCardByType()} note={m.analytics.tabEventsByTypeNote()} class="xl:col-span-3">
      <AnalyticsChart metric="ev.count" agg="rate" groupBy="type" max={12} filters={["bot", "shard"]} type="area" unit="/ s" zoom totalToggle height={320} />
    </Card>
    <div class="space-y-3">
      <AnalyticsTile label={m.analytics.tabEventsTileCount()} metric="ev.count" agg="sum" format="compact" filters={["bot", "shard"]} spark={false} />
      <Card>
        <AnalyticsTable {columns} rows={counts} {loading} sortKey="count" pageSize={14} />
      </Card>
    </div>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Card title={m.analytics.tabEventsCardPerShard()}>
      <BreakdownPanel metric="ev.count" label="shard" filters={["bot"]} max={24} />
    </Card>
    <Card title={m.analytics.tabEventsCardHandlerP95()} note={m.analytics.tabEventsHandlerNote()}>
      <AnalyticsChart metric="ev.duration" agg="p95" groupBy="type" max={8} filters={["bot"]} unit="ms" noCompare />
    </Card>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Card title={m.analytics.tabEventsCardErrorsModule()}>
      <AnalyticsChart metric="ev.errors" agg="sum" groupBy="module" max={8} filters={["bot"]} type="bar" stack unit={m.analytics.unitErrors()} />
    </Card>
    <Card title={m.analytics.tabEventsCardErrorsType()}>
      <BreakdownPanel metric="ev.errors" label="type" filters={["bot"]} max={12} color="#f87171" />
    </Card>
  </div>
</div>
