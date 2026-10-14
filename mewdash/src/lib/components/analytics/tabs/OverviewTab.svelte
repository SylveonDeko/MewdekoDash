<!-- lib/components/analytics/tabs/OverviewTab.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { FiringAlert, SnapshotRow } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick } from "$lib/stores/analyticsFilters";
  import { ago, compact } from "../format";
  import { severityColor } from "../palette";
  import { severityLabel } from "./alertText";
  import AnalyticsTile from "../AnalyticsTile.svelte";
  import AnalyticsChart from "../AnalyticsChart.svelte";
  import Card from "../Card.svelte";
  import Pill from "../Pill.svelte";
  import SimpleLineChart from "../SimpleLineChart.svelte";
  import ErrorsPanel from "../ErrorsPanel.svelte";

  let firing = $state<FiringAlert[]>([]);
  let firingFailed = $state(false);
  let snapshots = $state<SnapshotRow[]>([]);
  let snapshotsLoading = $state(true);

  let snapshotLabels = $derived(snapshots.map((s) => s.day.slice(5, 10)));
  let snapshotSeries = $derived([{ name: m.common.servers(), data: snapshots.map((s) => s.guilds) }]);

  async function loadFiring() {
    try {
      firing = (await analyticsApi.firingAlerts()) ?? [];
      firingFailed = false;
    } catch (err) {
      logger.debug("Firing alerts unavailable", err);
      firingFailed = true;
    }
  }

  async function loadSnapshots() {
    snapshotsLoading = true;
    try {
      snapshots = (await analyticsApi.serverSnapshots(30, $analyticsFilters.bot || undefined)) ?? [];
    } catch (err) {
      logger.warn("Server snapshots failed", err);
      snapshots = [];
    } finally {
      snapshotsLoading = false;
    }
  }

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick];
    void loadFiring();
    void loadSnapshots();
  });
</script>

<div class="space-y-4">
  <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
    <AnalyticsTile label={m.common.servers()} metric="guild.count" agg="last" format="int" filters={["bot", "shard"]} />
    <AnalyticsTile label={m.common.users()} metric="user.count" agg="last" format="compact" filters={["bot"]} />
    <AnalyticsTile label={m.analytics.tabOverviewCommandsMin()} metric="cmd.count" agg="sum" per="minute" format="float" filters={["bot", "shard"]} />
    <AnalyticsTile label={m.analytics.tabOverviewGatewayEvents()} metric="ev.count" agg="sum" format="compact" filters={["bot", "shard"]} />
    <AnalyticsTile label={m.analytics.tabOverviewRestReqS()} metric="rest.count" agg="sum" per="second" format="float" filters={["bot"]} />
    <AnalyticsTile label={m.analytics.tabLatencyUnhandledErrors()} metric="err.count" agg="sum" format="int" filters={["bot", "shard"]}>
      {#snippet drillContent()}
        <p class="text-xs uppercase tracking-wide" style="color: {$colorStore.muted}">{m.analytics.tabLatencyExceptionGroups()}</p>
        <ErrorsPanel limit={15} />
      {/snippet}
    </AnalyticsTile>
    <AnalyticsTile label={m.analytics.tabOverviewWorstShardLatency()} metric="shard.latency" agg="max" format="ms" filters={["bot", "shard"]} sparkTone="crit" unit="ms" />
    <AnalyticsTile label={m.analytics.tabOverviewMusicPlayers()} metric="music.players" agg="last" format="int" filters={["bot"]} />
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
    <Card title={m.analytics.tabLatencyShardLatency()} note={m.analytics.tabOverviewMaxPerBucketBandsFromAlert()} class="xl:col-span-2">
      <AnalyticsChart metric="shard.latency" agg="max" groupBy="shard" max={24} filters={["bot", "shard"]} unit="ms" zoom bands height={300} />
    </Card>
    <Card title={m.analytics.tabOverviewFiringAlerts()}>
      {#if firingFailed}
        <p class="text-xs" style="color: {$colorStore.muted}">{m.analytics.tabOverviewAlertsUnavailable()}</p>
      {:else if firing.length === 0}
        <p class="text-sm" style="color: {$colorStore.muted}"><i class="fa-solid fa-check mr-2" style="color: #4ade80"></i>{m.analytics.tabAlertsNothingFiring()}</p>
      {:else}
        <div class="space-y-2">
          {#each firing as a}
            <div class="rounded-lg border p-2.5" style="border-color: {severityColor(a.severity)}40; background: {severityColor(a.severity)}12">
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-medium truncate" style="color: {$colorStore.text}">{a.ruleName}</span>
                <Pill tone={a.severity === "critical" ? "crit" : a.severity === "warning" ? "warn" : "muted"} text={severityLabel(a.severity)} />
              </div>
              <p class="text-xs mt-1 font-mono" style="color: {$colorStore.muted}">
                {a.groupKey || m.analytics.tabAlertsFleet()} · {compact(a.lastValue)} vs {compact(a.threshold)} · {ago(a.since)}
              </p>
            </div>
          {/each}
        </div>
      {/if}
    </Card>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Card title={m.analytics.tabOverviewCommandsSByKind()}>
      <AnalyticsChart metric="cmd.count" agg="rate" groupBy="kind" filters={["bot", "shard"]} type="area" unit="/ s" totalToggle />
    </Card>
    <Card title={m.analytics.tabOverviewGatewayEventsS()} note={m.analytics.tabEventsByTypeNote()}>
      <AnalyticsChart metric="ev.count" agg="rate" groupBy="type" max={6} filters={["bot", "shard"]} type="area" unit="/ s" totalToggle />
    </Card>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
    <Card title={m.analytics.tabOverviewServersDailySnapshots()}>
      <SimpleLineChart labels={snapshotLabels} series={snapshotSeries} loading={snapshotsLoading} empty={m.analytics.tabOverviewNoSnapshotsYet()} />
    </Card>
    <Card title={m.analytics.tabOverviewRestRequestsS()}>
      <AnalyticsChart metric="rest.count" agg="rate" filters={["bot"]} unit="req/s" fill height={160} />
    </Card>
    <Card title={m.analytics.tabOverviewProcessMemory()}>
      <AnalyticsChart metric="proc.rss" agg="avg" groupBy="bot" filters={["bot"]} yFormat="bytes" fill height={160} />
    </Card>
  </div>
</div>
