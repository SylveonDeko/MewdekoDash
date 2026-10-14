<!-- lib/components/analytics/tabs/LatencyTab.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import AnalyticsChart from "../AnalyticsChart.svelte";
  import AnalyticsTile from "../AnalyticsTile.svelte";
  import BreakdownPanel from "../BreakdownPanel.svelte";
  import Card from "../Card.svelte";
  import ErrorsPanel from "../ErrorsPanel.svelte";
  import ShardTable from "./ShardTable.svelte";
</script>

<div class="space-y-4">
  <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
    <AnalyticsTile label={m.analytics.tabLatencyRestP95()} metric="rest.duration" agg="p95" format="ms" filters={["bot"]} unit="ms" />
    <AnalyticsTile label={m.analytics.tabLatencyRest5xx()} metric="rest.count" agg="sum" format="int" filters={["bot"]} fixed={{ status: "5xx" }} sparkTone="crit" />
    <AnalyticsTile label={m.analytics.tabLatencyRest429()} metric="rest.count" agg="sum" format="int" filters={["bot"]} fixed={{ status: "429" }} sparkTone="crit" />
    <AnalyticsTile label={m.analytics.tabLatencyRatelimitHits()} metric="ratelimit.hit" agg="sum" format="int" filters={["bot"]} />
    <AnalyticsTile label={m.analytics.tabLatencyDbP95()} metric="db.duration" agg="p95" format="ms" filters={["bot"]} unit="ms" />
    <AnalyticsTile label={m.analytics.tabLatencyDbErrors()} metric="db.errors" agg="sum" format="int" filters={["bot"]} sparkTone="crit" />
    <AnalyticsTile label={m.analytics.tabLatencyShardReconnects()} metric="shard.reconnects" agg="sum" format="int" filters={["bot", "shard"]} />
    <AnalyticsTile label={m.analytics.tabLatencyUnhandledErrors()} metric="err.count" agg="sum" format="int" filters={["bot", "shard"]}>
      {#snippet drillContent()}
        <p class="text-xs uppercase tracking-wide" style="color: {$colorStore.muted}">{m.analytics.tabLatencyExceptionGroups()}</p>
        <ErrorsPanel limit={15} />
      {/snippet}
    </AnalyticsTile>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Card title={m.analytics.tabLatencyRestLatency()} note="p50 · p95 · p99">
      <AnalyticsChart metric="rest.duration" aggs={["p50", "p95", "p99"]} filters={["bot"]} unit="ms" noCompare />
    </Card>
    <Card title={m.analytics.tabLatencyRestRequestsSByRoute()} note={m.analytics.tabLatencySnowflakesTemplated()}>
      <AnalyticsChart metric="rest.count" agg="rate" groupBy="route" max={8} filters={["bot"]} type="area" unit="req/s" totalToggle />
    </Card>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
    <Card title={m.analytics.tabLatencyRateLimitHitsByRoute()}>
      <AnalyticsChart metric="ratelimit.hit" agg="sum" groupBy="route" max={8} filters={["bot"]} type="bar" stack unit={m.common.hits()} />
    </Card>
    <Card title={m.analytics.tabLatencyDatabaseP95ByOp()}>
      <AnalyticsChart metric="db.duration" agg="p95" groupBy="op" filters={["bot"]} unit="ms" noCompare />
    </Card>
    <Card title={m.analytics.tabLatencyDatabaseErrorsByOp()}>
      <AnalyticsChart metric="db.errors" agg="sum" groupBy="op" filters={["bot"]} type="bar" stack unit={m.analytics.unitErrors()} />
    </Card>
  </div>

  <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
    <Card title={m.analytics.tabLatencyCpu()}>
      <AnalyticsChart metric="proc.cpu" agg="avg" groupBy="bot" filters={["bot"]} unit="%" height={150} noCompare />
    </Card>
    <Card title={m.analytics.tabLatencyRss()}>
      <AnalyticsChart metric="proc.rss" agg="avg" groupBy="bot" filters={["bot"]} yFormat="bytes" height={150} noCompare />
    </Card>
    <Card title={m.common.threads()}>
      <AnalyticsChart metric="proc.threads" agg="max" groupBy="bot" filters={["bot"]} height={150} noCompare />
    </Card>
    <Card title={m.analytics.tabLatencyGen2Gcs()}>
      <AnalyticsChart metric="proc.gc2" agg="last" groupBy="bot" filters={["bot"]} height={150} noCompare />
    </Card>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-4 gap-4">
    <Card title={m.analytics.tabLatencyShards()} note={m.analytics.tabLatencyLatestStatePeakInRange()} class="xl:col-span-3">
      <ShardTable />
    </Card>
    <Card title={m.analytics.tabLatencyShardLatency()}>
      <AnalyticsChart metric="shard.latency" agg="max" groupBy="shard" max={24} filters={["bot", "shard"]} unit="ms" bands height={260} />
    </Card>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
    <Card title={m.analytics.tabLatencyUnhandledExceptions()} note={m.analytics.tabLatencyRowOccurrences()} class="xl:col-span-2">
      <ErrorsPanel limit={25} />
    </Card>
    <Card title={m.analytics.tabLatencyErrorsByType()}>
      <BreakdownPanel metric="err.count" label="type" filters={["bot", "shard"]} max={10} color="#f87171" />
    </Card>
  </div>
</div>
