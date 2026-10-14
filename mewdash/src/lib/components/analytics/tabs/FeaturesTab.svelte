<!-- lib/components/analytics/tabs/FeaturesTab.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { FeatureAdoptionRow, FeatureDepth } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick, timeParams } from "$lib/stores/analyticsFilters";
  import { compact, n, pct } from "../format";
  import AnalyticsTable, { type Column } from "../AnalyticsTable.svelte";
  import Card from "../Card.svelte";
  import ScatterChart, { type ScatterPoint } from "../ScatterChart.svelte";
  import SimpleLineChart from "../SimpleLineChart.svelte";
  import FeatureCensus from "./FeatureCensus.svelte";

  let adoption = $state<FeatureAdoptionRow[]>([]);
  let adoptionLoading = $state(true);
  let depth = $state<FeatureDepth | null>(null);
  let depthLoading = $state(true);
  let feature = $state("");
  let seq = 0;

  let histLabels = $derived((depth?.histogram ?? []).map((h) => String(h.features)));
  let histSeries = $derived([{ name: m.analytics.pageTabGuilds(), data: (depth?.histogram ?? []).map((h) => h.guilds) }]);
  let scatter = $derived<ScatterPoint[]>(
    (depth?.points ?? [])
      .filter((p) => p.memberCount !== null)
      .map((p) => ({ x: p.memberCount!, y: p.features, label: p.guildId })),
  );
  let featureKeys = $derived(adoption.map((r) => r.feature).sort());

  function ratio(a: number | null, b: number | null): number | null {
    return a === null || b === null || !b ? null : (a / b) * 100;
  }

  const columns: Column<FeatureAdoptionRow>[] = $derived([
    { key: "feature", label: m.analytics.tabCensusAriaFeature(), mono: true },
    { key: "configured", label: m.common.configured(), num: true, format: (r) => n(r.configured) },
    { key: "enabled", label: m.common.enabled(), num: true, format: (r) => n(r.enabled) },
    { key: "enabledPct", label: m.analytics.tabFeaturesColEnabledPct(), num: true, muted: true, format: (r) => pct(ratio(r.enabled, r.configured)), sortValue: (r) => ratio(r.enabled, r.configured) },
    { key: "activeGuilds", label: m.common.active(), num: true },
    { key: "activePct", label: m.analytics.tabFeaturesColActivePct(), num: true, muted: true, format: (r) => pct(ratio(r.activeGuilds, r.enabled ?? r.configured)), sortValue: (r) => ratio(r.activeGuilds, r.enabled ?? r.configured) },
    { key: "activity", label: m.analytics.tabFeaturesColActivity(), num: true, format: (r) => compact(r.activity) },
    { key: "errors", label: m.common.errors(), num: true },
    { key: "errorPct", label: m.analytics.tabAiColErrPct(), num: true, format: (r) => pct(r.activity ? (r.errors / r.activity) * 100 : 0), sortValue: (r) => (r.activity ? r.errors / r.activity : 0), tone: (r) => (r.activity && r.errors / r.activity >= 0.1 ? "crit" : r.activity && r.errors / r.activity >= 0.02 ? "warn" : null) },
  ]);

  async function load() {
    const my = ++seq;
    const f = $analyticsFilters;
    const base = { ...timeParams(f), bot: f.bot || undefined };
    adoptionLoading = depthLoading = true;
    const [a, d] = await Promise.allSettled([analyticsApi.featureAdoption(base), analyticsApi.featureDepth(base)]);
    if (my !== seq) return;
    adoption = a.status === "fulfilled" ? a.value ?? [] : [];
    depth = d.status === "fulfilled" ? d.value ?? null : null;
    for (const r of [a, d]) if (r.status === "rejected") logger.warn("Features tab query failed", r.reason);
    adoptionLoading = depthLoading = false;
    if (!feature && adoption.length) feature = [...adoption].sort((x, y) => y.activity - x.activity)[0].feature;
  }

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick];
    void load();
  });
</script>

<div class="space-y-4">
  <Card title={m.analytics.tabFeaturesCardAdoption()} note={m.analytics.tabFeaturesAdoptionNote()}>
    <AnalyticsTable {columns} rows={adoption} loading={adoptionLoading} sortKey="activeGuilds" onRowClick={(r) => (feature = r.feature)} selected={(r) => r.feature === feature} />
  </Card>

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Card title={m.analytics.tabFeaturesCardPerGuild()} note={m.analytics.tabFeaturesPerGuildNote()}>
      <SimpleLineChart labels={histLabels} series={histSeries} type="bar" loading={depthLoading} unit={m.analytics.unitGuilds()} beginAtZero height={220} />
    </Card>
    <Card title={m.analytics.tabFeaturesCardSize()} note={m.analytics.tabFeaturesSizeNote()}>
      <ScatterChart points={scatter} xLabel={m.common.members()} yLabel={m.analytics.tabFeaturesAxisFeatures()} loading={depthLoading} height={220} />
    </Card>
  </div>

  <FeatureCensus {feature} features={featureKeys} onFeature={(f) => (feature = f)} />
</div>
