<!-- lib/components/analytics/tabs/PipelineTab.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { PipelineHealth, PipelineInstance, PipelineTable } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick } from "$lib/stores/analyticsFilters";
  import { ago, duration, n, utcParse } from "../format";
  import AnalyticsChart from "../AnalyticsChart.svelte";
  import AnalyticsTable, { type Column } from "../AnalyticsTable.svelte";
  import Card from "../Card.svelte";
  import Pill from "../Pill.svelte";
  import StatTile from "../StatTile.svelte";

  let health = $state<PipelineHealth | null>(null);
  let loading = $state(true);
  let failed = $state(false);
  let now = $state(Date.now());
  let seq = 0;

  function ageSeconds(value: string | null | undefined): number | null {
    const ms = utcParse(value);
    return Number.isNaN(ms) ? null : (now - ms) / 1000;
  }

  function ageText(value: string | null | undefined): string {
    const s = ageSeconds(value);
    return s === null ? "never" : `${duration(s)} ago`;
  }

  let flushAge = $derived(ageSeconds(health?.lastFlushAt));
  let rollupAge = $derived(ageSeconds(health?.lastRollupAt));
  let status = $derived.by((): { label: string; tone: "ok" | "warn" | "crit" | "muted" } => {
    if (!health) return { label: failed ? "unreachable" : "loading", tone: failed ? "crit" : "muted" };
    if (!health.enabled) return { label: "disabled", tone: "muted" };
    if (health.lastError) return { label: "error", tone: "crit" };
    if (flushAge === null || flushAge > 60) return { label: "flush stale", tone: "crit" };
    if (rollupAge === null || rollupAge > 600) return { label: "rollup stale", tone: "warn" };
    return { label: "healthy", tone: "ok" };
  });

  const tableColumns: Column<PipelineTable>[] = [
    { key: "table", label: "Table", mono: true },
    { key: "rows", label: "Rows", num: true, format: (r) => n(r.rows) },
    { key: "newest", label: "Newest", num: true, muted: true, format: (r) => (r.newest ? ago(r.newest) : "—"), sortValue: (r) => utcParse(r.newest) },
  ];

  const instanceColumns: Column<PipelineInstance>[] = [
    { key: "botName", label: "Bot" },
    { key: "botId", label: "Id", mono: true, muted: true },
    { key: "host", label: "Host", mono: true, muted: true, format: (r) => `${r.host}:${r.port}` },
    { key: "isActive", label: "State", format: (r) => (r.isActive ? "active" : "inactive"), tone: (r) => (r.isActive ? "ok" : "muted") },
    { key: "lastStatusUpdate", label: "Heartbeat", num: true, muted: true, format: (r) => ago(r.lastStatusUpdate), sortValue: (r) => utcParse(r.lastStatusUpdate) },
    {
      key: "lastGuildCountAt",
      label: "Last guild count",
      num: true,
      format: (r) => (r.lastGuildCountAt ? ago(r.lastGuildCountAt) : "never"),
      sortValue: (r) => utcParse(r.lastGuildCountAt),
      tone: (r) => {
        const s = ageSeconds(r.lastGuildCountAt);
        return s === null || s > 600 ? "crit" : s > 180 ? "warn" : null;
      },
    },
  ];

  async function load() {
    const my = ++seq;
    loading = true;
    try {
      const result = await analyticsApi.health();
      if (my !== seq) return;
      health = result ?? null;
      failed = false;
    } catch (err) {
      if (my !== seq) return;
      logger.warn("Pipeline health failed", err);
      health = null;
      failed = true;
    } finally {
      if (my === seq) {
        loading = false;
        now = Date.now();
      }
    }
  }

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick];
    void load();
  });
</script>

<div class="space-y-4">
  <Card>
    <div class="flex flex-wrap items-center gap-3">
      <Pill tone={status.tone} text={status.label} icon={status.tone === "ok" ? "fa-check" : status.tone === "crit" ? "fa-triangle-exclamation" : "fa-circle-info"} />
      <span class="text-xs font-mono" style="color: {$colorStore.muted}">
        healthy = flush ≤ 60s · rollup ≤ 10m · no flush error
      </span>
    </div>
  </Card>

  <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
    <StatTile label="Last flush" value={ageText(health?.lastFlushAt)} {loading} tone={flushAge !== null && flushAge > 60 ? "crit" : null} />
    <StatTile label="Last rollup" value={ageText(health?.lastRollupAt)} {loading} tone={rollupAge !== null && rollupAge > 600 ? "warn" : null} />
    <StatTile label="Last maintenance" value={ageText(health?.lastMaintenanceAt)} {loading} />
    <StatTile label="Pending series" value={n(health?.pendingSeries)} {loading} />
    <StatTile label="Pending rows" value={n(health?.pendingRows)} {loading} />
  </div>

  {#if health?.lastError}
    <div class="rounded-xl border p-3 text-xs font-mono whitespace-pre-wrap break-words" style="border-color: #f8717140; background: #f8717112; color: {$colorStore.text}">
      <p class="uppercase tracking-wide mb-1" style="color: #f87171">Last flush error</p>
      {health.lastError}
    </div>
  {/if}

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Card title="Tables">
      <AnalyticsTable columns={tableColumns} rows={health?.tables ?? []} {loading} empty="No tables reported" sortKey="rows" />
    </Card>
    <Card title="Instances">
      <AnalyticsTable columns={instanceColumns} rows={health?.instances ?? []} {loading} empty="No instances registered" sortKey="lastStatusUpdate" />
    </Card>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Card title="Flush duration" note="an.flush · ms">
      <AnalyticsChart metric="an.flush" agg="max" groupBy="bot" filters={["bot"]} unit="ms" noCompare />
    </Card>
    <Card title="Rows per flush" note="an.rows">
      <AnalyticsChart metric="an.rows" agg="sum" groupBy="bot" filters={["bot"]} type="bar" stack unit="rows" noCompare />
    </Card>
  </div>
</div>
