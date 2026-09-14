<!-- lib/components/analytics/AnalyticsTile.svelte -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { AnalyticsAgg } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick, queryParams, rangeSeconds } from "$lib/stores/analyticsFilters";
  import { fmt, type ValueFormat } from "./format";
  import { CRIT } from "./palette";
  import DrillModal from "./DrillModal.svelte";

  interface Props {
    label: string;
    metric: string;
    agg?: AnalyticsAgg;
    format?: ValueFormat;
    filters?: string[];
    fixed?: Record<string, string>;
    /** Divide the aggregate by the range length in this unit. */
    per?: "minute" | "second";
    scaleBy?: number;
    spark?: boolean;
    sparkTone?: "primary" | "crit";
    drill?: boolean;
    unit?: string;
    /** Extra content shown in the drill modal under the breakdowns. */
    drillContent?: Snippet;
  }

  let {
    label,
    metric,
    agg = "sum",
    format = "int",
    filters = ["bot", "shard"],
    fixed = {},
    per,
    scaleBy,
    spark = true,
    sparkTone = "primary",
    drill = true,
    unit = "",
    drillContent,
  }: Props = $props();

  let value = $state<number | null>(null);
  let loading = $state(true);
  let points = $state<number[]>([]);
  let open = $state(false);
  let seq = 0;

  let fixedKey = $derived(JSON.stringify(fixed));
  let sparkColor = $derived(sparkTone === "crit" ? CRIT : $colorStore.primary);
  let yFormat = $derived<"compact" | "bytes">(format === "bytes" ? "bytes" : "compact");

  let sparkPath = $derived.by(() => {
    if (points.length < 2) return "";
    const min = Math.min(...points);
    const max = Math.max(...points);
    const span = max - min || 1;
    const w = 100;
    const h = 28;
    return points
      .map((p, i) => `${((i / (points.length - 1)) * w).toFixed(1)},${(h - ((p - min) / span) * (h - 2) - 1).toFixed(1)}`)
      .join(" ");
  });

  async function load() {
    const my = ++seq;
    const f = $analyticsFilters;
    loading = true;
    const base = queryParams(f, filters, fixed);
    try {
      const result = await analyticsApi.aggregate({ metric, agg, ...base });
      if (my !== seq) return;
      let v = result.value;
      if (v !== null && v !== undefined) {
        if (scaleBy !== undefined) v *= scaleBy;
        if (per === "minute") v /= rangeSeconds(f) / 60;
        if (per === "second") v /= rangeSeconds(f);
      }
      value = v ?? null;
    } catch (err) {
      if (my !== seq) return;
      logger.warn(`Analytics tile ${metric} failed`, err);
      value = null;
    } finally {
      if (my === seq) loading = false;
    }

    if (!spark) return;
    try {
      const series = await analyticsApi.series({ metric, agg, ...base });
      if (my !== seq) return;
      points = series.series[0]?.points.map((p) => p.value ?? 0) ?? [];
    } catch {
      if (my === seq) points = [];
    }
  }

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick, metric, agg, fixedKey, per, scaleBy, filters];
    void load();
  });
</script>

<div
  class="rounded-xl border p-3 flex flex-col gap-1 min-h-[88px]"
  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
>
  <div class="flex items-start justify-between gap-2">
    <p class="text-xs truncate" style="color: {$colorStore.muted}" title={label}>{label}</p>
    {#if drill}
      <button
        type="button"
        class="min-h-[28px] min-w-[28px] -mt-1 -mr-1 rounded text-[11px] opacity-60 hover:opacity-100"
        style="color: {$colorStore.muted}"
        title="Breakdown"
        aria-label="Open breakdown of {label}"
        onclick={() => (open = true)}
      ><i class="fa-solid fa-magnifying-glass-chart"></i></button>
    {/if}
  </div>
  <div class="text-xl font-semibold tabular-nums leading-tight" style="color: {$colorStore.text}">
    {#if loading && value === null}
      <span class="inline-block h-5 w-16 rounded animate-pulse" style="background: {$colorStore.primary}20"></span>
    {:else}
      {fmt(value, format)}
    {/if}
  </div>
  {#if spark}
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" class="w-full h-7 mt-auto" aria-hidden="true">
      {#if sparkPath}
        <polyline points={sparkPath} fill="none" stroke={sparkColor} stroke-width="1.5" vector-effect="non-scaling-stroke" />
        <polygon points="0,28 {sparkPath} 100,28" fill={sparkColor} opacity="0.15" />
      {/if}
    </svg>
  {/if}
</div>

{#if drill}
  <DrillModal bind:open title="{label} · {fmt(value, format)}" {metric} {agg} {filters} {fixed} {unit} {yFormat}>
    {@render drillContent?.()}
  </DrillModal>
{/if}
