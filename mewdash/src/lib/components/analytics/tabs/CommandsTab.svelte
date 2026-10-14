<!-- lib/components/analytics/tabs/CommandsTab.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { CommandQuery, UsageHeatmap } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick, timeParams } from "$lib/stores/analyticsFilters";
  import { labelValues } from "../registry";
  import AnalyticsChart from "../AnalyticsChart.svelte";
  import AnalyticsTile from "../AnalyticsTile.svelte";
  import BreakdownPanel from "../BreakdownPanel.svelte";
  import Card from "../Card.svelte";
  import Heatmap from "../Heatmap.svelte";
  import CommandTables from "./CommandTables.svelte";

  let kind = $state("");
  let module = $state("");
  let outcome = $state("");
  let kinds = $state<string[]>([]);
  let modules = $state<string[]>([]);
  let heatmap = $state<UsageHeatmap>({ sizes: [], cells: [] });
  let heatmapLoading = $state(true);
  let seq = 0;

  /** Label filters the rollup charts apply on top of the global bar. */
  let fixed = $derived.by(() => {
    const out: Record<string, string> = {};
    if (kind) out.kind = kind;
    if (module) out.module = module;
    return out;
  });
  let fixedFailed = $derived({ ...fixed, ok: "0" });

  /** Raw table query: global bot/shard/guild plus the local selects. */
  let commandQuery = $derived.by((): CommandQuery => {
    const f = $analyticsFilters;
    const q: CommandQuery = { ...timeParams(f) };
    if (f.bot) q.bot = f.bot;
    if (f.shard) q.shard = f.shard;
    if (f.guild) q.guild = f.guild;
    if (kind) q.kind = kind;
    if (module) q.module = module;
    if (outcome) q.ok = outcome === "ok";
    return q;
  });

  const selectStyle = $derived(
    `background: ${$colorStore.primary}08; color: ${$colorStore.text}; border-color: ${$colorStore.primary}20;`,
  );

  async function loadOptions() {
    try {
      kinds = await labelValues("cmd.count", "kind");
      modules = await labelValues("cmd.count", "module");
    } catch (err) {
      logger.debug("Command label values unavailable", err);
    }
  }

  async function loadHeatmap() {
    const my = ++seq;
    heatmapLoading = true;
    try {
      const result = await analyticsApi.commandHeatmap(commandQuery);
      if (my !== seq) return;
      heatmap = result ?? { sizes: [], cells: [] };
    } catch (err) {
      if (my !== seq) return;
      logger.warn("Command heatmap failed", err);
      heatmap = { sizes: [], cells: [] };
    } finally {
      if (my === seq) heatmapLoading = false;
    }
  }

  $effect(() => {
    void loadOptions();
  });

  $effect(() => {
    void [commandQuery, $analyticsRefreshTick];
    void loadHeatmap();
  });
</script>

<div class="space-y-4">
  <div class="flex flex-wrap items-center gap-2">
    <select class="min-h-[36px] rounded-lg border px-2 text-xs" style={selectStyle} bind:value={kind} aria-label={m.analytics.tableColKind()}>
      <option value="">{m.analytics.tabCommandsAnyKind()}</option>
      {#each kinds as k}<option value={k}>{k}</option>{/each}
    </select>
    <select class="min-h-[36px] rounded-lg border px-2 text-xs" style={selectStyle} bind:value={module} aria-label={m.common.module()}>
      <option value="">{m.analytics.tabCommandsAnyModule()}</option>
      {#each modules as mod}<option value={mod}>{mod}</option>{/each}
    </select>
    <select class="min-h-[36px] rounded-lg border px-2 text-xs" style={selectStyle} bind:value={outcome} aria-label={m.analytics.tabCommandsSelectOutcome()}>
      <option value="">{m.analytics.tabCommandsAnyOutcome()}</option>
      <option value="ok">{m.analytics.tabAlertsStateOk()}</option>
      <option value="error">{m.analytics.tabPipelineStatusError()}</option>
    </select>
  </div>

  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <AnalyticsTile label={m.analytics.tabCommandsTileInvocations()} metric="cmd.count" agg="sum" format="int" filters={["bot", "shard"]} {fixed} />
    <AnalyticsTile label={m.common.errors()} metric="cmd.count" agg="sum" format="int" filters={["bot", "shard"]} fixed={fixedFailed} />
    <AnalyticsTile label={m.analytics.tabCommandsTileP95()} metric="cmd.duration" agg="p95" format="ms" filters={["bot"]} {fixed} unit="ms" />
    <AnalyticsTile label={m.analytics.tabCommandsTileP50()} metric="cmd.duration" agg="p50" format="ms" filters={["bot"]} {fixed} unit="ms" />
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
    <Card title={m.analytics.tabCommandsCardByModule()} class="xl:col-span-2">
      <AnalyticsChart metric="cmd.count" agg="sum" groupBy="module" max={12} filters={["bot", "shard"]} {fixed} type="area" unit={m.analytics.unitPerBucket()} zoom height={300} />
    </Card>
    <Card title={m.analytics.tabCommandsCardByClass()}>
      <AnalyticsChart metric="cmd.errors" agg="sum" groupBy="error" max={8} filters={["bot"]} {fixed} type="area" unit={m.analytics.unitErrors()} height={300} />
    </Card>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Card title={m.analytics.tabCommandsCardDuration()} note="p50 · p95 · p99">
      <AnalyticsChart metric="cmd.duration" aggs={["p50", "p95", "p99"]} filters={["bot"]} {fixed} unit="ms" noCompare />
    </Card>
    <Card title={m.analytics.tabCommandsCardByKind()}>
      <BreakdownPanel metric="cmd.count" label="kind" filters={["bot", "shard"]} {fixed} />
    </Card>
  </div>

  <Card title={m.analytics.tabCommandsCardHeatmap()} note={m.analytics.tabCommandsHeatmapNote()}>
    <Heatmap buckets={heatmap.sizes} cells={heatmap.cells} loading={heatmapLoading} unit={m.analytics.unitInvocations()} />
  </Card>

  <CommandTables query={commandQuery} />
</div>
