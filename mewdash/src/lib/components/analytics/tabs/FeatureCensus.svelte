<!-- lib/components/analytics/tabs/FeatureCensus.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { BreakdownRow, DayValue, SettingUsageRow } from "$lib/api/analytics/models";
  import { analyticsRefreshTick } from "$lib/stores/analyticsFilters";
  import { dayLabel } from "../format";
  import BreakdownBar from "../BreakdownBar.svelte";
  import Card from "../Card.svelte";
  import SimpleLineChart from "../SimpleLineChart.svelte";

  interface Props {
    feature: string;
    features: string[];
    onFeature: (feature: string) => void;
  }

  let { feature, features, onFeature }: Props = $props();

  let settings = $state<SettingUsageRow[]>([]);
  let settingsLoading = $state(false);
  let census = $state<DayValue[]>([]);
  let censusLoading = $state(false);
  let kind = $state<"configured" | "enabled">("configured");
  let days = $state(90);
  let seq = 0;
  let censusSeq = 0;

  let censusMetric = $derived(feature ? `feature.${feature}.${kind}` : "");
  let censusLabels = $derived(census.map((p) => dayLabel(p.day)));
  let censusSeries = $derived([{ name: censusMetric, data: census.map((p) => p.value) }]);

  let groups = $derived.by(() => {
    const map = new Map<string, BreakdownRow[]>();
    for (const s of settings) {
      const key = `${s.table}.${s.column}`;
      const rows = map.get(key) ?? [];
      rows.push({ name: s.value, value: s.count });
      map.set(key, rows);
    }
    return [...map.entries()];
  });

  const selectStyle = $derived(
    `background: ${$colorStore.primary}08; color: ${$colorStore.text}; border-color: ${$colorStore.primary}20;`,
  );

  async function loadSettings() {
    if (!feature) return;
    const my = ++seq;
    settingsLoading = true;
    try {
      const result = await analyticsApi.featureSettings(feature);
      if (my !== seq) return;
      settings = result ?? [];
    } catch (err) {
      if (my !== seq) return;
      logger.warn("Feature settings failed", err);
      settings = [];
    } finally {
      if (my === seq) settingsLoading = false;
    }
  }

  async function loadCensus() {
    if (!censusMetric) return;
    const my = ++censusSeq;
    censusLoading = true;
    try {
      const result = await analyticsApi.featureCensus(censusMetric, days);
      if (my !== censusSeq) return;
      census = result ?? [];
    } catch (err) {
      if (my !== censusSeq) return;
      logger.warn("Feature census failed", err);
      census = [];
    } finally {
      if (my === censusSeq) censusLoading = false;
    }
  }

  $effect(() => {
    void [feature, $analyticsRefreshTick];
    void loadSettings();
  });

  $effect(() => {
    void [censusMetric, days, $analyticsRefreshTick];
    void loadCensus();
  });
</script>

<div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
  <Card title="Settings usage" note="latest census">
    {#snippet actions()}
      <select class="min-h-[44px] rounded-lg border px-2 text-xs font-mono" style={selectStyle} value={feature} onchange={(e) => onFeature(e.currentTarget.value)} aria-label="Feature">
        {#if !features.includes(feature) && feature}<option value={feature}>{feature}</option>{/if}
        {#each features as f}<option value={f}>{f}</option>{/each}
      </select>
    {/snippet}
    {#if !feature}
      <p class="text-xs py-4" style="color: {$colorStore.muted}">Pick a feature</p>
    {:else if settingsLoading && settings.length === 0}
      <div class="h-3 rounded animate-pulse" style="background: {$colorStore.primary}20"></div>
    {:else if groups.length === 0}
      <p class="text-xs py-4" style="color: {$colorStore.muted}">No settings census for {feature}</p>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each groups as [key, rows] (key)}
          <div>
            <p class="text-xs font-mono mb-1 truncate" style="color: {$colorStore.muted}" title={key}>{key}</p>
            <BreakdownBar {rows} max={8} />
          </div>
        {/each}
      </div>
    {/if}
  </Card>

  <Card title="Census" note={censusMetric || "pick a feature"}>
    {#snippet actions()}
      <select class="min-h-[44px] rounded-lg border px-2 text-xs" style={selectStyle} bind:value={kind} aria-label="Census kind">
        <option value="configured">configured</option>
        <option value="enabled">enabled</option>
      </select>
      <select class="min-h-[44px] rounded-lg border px-2 text-xs" style={selectStyle} bind:value={days} aria-label="Days">
        <option value={90}>90d</option>
        <option value={180}>180d</option>
        <option value={365}>365d</option>
      </select>
    {/snippet}
    <SimpleLineChart labels={censusLabels} series={censusSeries} loading={censusLoading} unit="guilds" empty="No census rows" beginAtZero height={220} />
  </Card>
</div>
