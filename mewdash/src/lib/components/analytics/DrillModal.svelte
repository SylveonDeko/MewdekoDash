<!-- lib/components/analytics/DrillModal.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import type { Snippet } from "svelte";
  import Portal from "$lib/components/ui/Portal.svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { AnalyticsAgg, BreakdownRow } from "$lib/api/analytics/models";
  import { analyticsFilters, queryParams } from "$lib/stores/analyticsFilters";
  import { metricLabels } from "./registry";
  import AnalyticsChart from "./AnalyticsChart.svelte";
  import BreakdownBar from "./BreakdownBar.svelte";

  interface Props {
    open?: boolean;
    title: string;
    metric?: string;
    agg?: AnalyticsAgg;
    filters?: string[];
    fixed?: Record<string, string>;
    unit?: string;
    yFormat?: "compact" | "bytes";
    /** Extra content under the breakdowns, such as a drilldown table. */
    children?: Snippet;
  }

  let {
    open = $bindable(false),
    title,
    metric,
    agg = "sum",
    filters = ["bot", "shard"],
    fixed = {},
    unit = "",
    yFormat = "compact",
    children,
  }: Props = $props();

  let crumbs = $state<Record<string, string>>({});
  let blocks = $state<{ label: string; rows: BreakdownRow[] }[]>([]);
  let loading = $state(false);
  let seq = 0;

  let effectiveFixed = $derived({ ...fixed, ...crumbs });

  async function loadBreakdowns() {
    if (!metric) return;
    const my = ++seq;
    loading = true;
    try {
      const labels = (await metricLabels(metric)).filter((l) => !(l in effectiveFixed));
      const base = queryParams($analyticsFilters, filters, effectiveFixed);
      const results = await Promise.all(
        labels.map(async (label) => ({
          label,
          rows: await analyticsApi.breakdown({ metric: metric!, label, agg, limit: 12, ...base }).catch(() => [] as BreakdownRow[]),
        })),
      );
      if (my !== seq) return;
      blocks = results.filter((b) => b.rows.length > 1);
    } catch (err) {
      logger.warn("Analytics drill breakdown failed", err);
    } finally {
      if (my === seq) loading = false;
    }
  }

  function narrow(label: string, value: string) {
    crumbs = { ...crumbs, [label]: value };
  }

  function drop(label: string) {
    const next = { ...crumbs };
    delete next[label];
    crumbs = next;
  }

  function close() {
    open = false;
    crumbs = {};
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") close();
  }

  $effect(() => {
    if (!open) return;
    void [effectiveFixed, $analyticsFilters];
    void loadBreakdowns();
  });

  $effect(() => {
    if (!open || typeof window === "undefined") return;
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
</script>

{#if open}
  <Portal>
    <div
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto backdrop-blur-md p-4 sm:p-8"
      style="background: {$colorStore.background}aa"
      onclick={(e) => { if (e.target === e.currentTarget) close(); }}
      role="presentation"
    >
      <div
        class="w-full max-w-4xl rounded-2xl border shadow-2xl"
        style="background: {$colorStore.background}; border-color: {$colorStore.primary}30;"
        in:fly={{ y: 20, duration: 200 }}
        out:fly={{ y: -20, duration: 150 }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div class="flex items-center justify-between gap-3 p-4 border-b" style="border-color: {$colorStore.primary}20;">
          <h3 class="text-base font-semibold truncate" style="color: {$colorStore.text}">{title}</h3>
          <button
            type="button"
            class="min-h-[44px] min-w-[44px] rounded-lg hover:opacity-70"
            style="background: {$colorStore.primary}10; color: {$colorStore.muted}"
            onclick={close}
            aria-label="Close"
          ><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="p-4 space-y-4">
          <div class="flex flex-wrap items-center gap-2 text-xs" style="color: {$colorStore.muted}">
            {#if Object.keys(crumbs).length === 0}
              <span>Bar → narrow</span>
            {:else}
              {#each Object.entries(crumbs) as [label, value]}
                <button
                  type="button"
                  class="min-h-[32px] rounded-full px-3 font-mono"
                  style="background: {$colorStore.primary}20; color: {$colorStore.text}"
                  onclick={() => drop(label)}
                >{label} = {value} <i class="fa-solid fa-xmark text-[10px] ml-1"></i></button>
              {/each}
            {/if}
          </div>

          {#if metric}
            <AnalyticsChart {metric} {agg} {filters} fixed={effectiveFixed} {unit} {yFormat} fill noCompare height={180} />

            {#if loading && blocks.length === 0}
              <div class="h-3 rounded animate-pulse" style="background: {$colorStore.primary}20"></div>
            {:else if blocks.length === 0}
              <p class="text-xs" style="color: {$colorStore.muted}">No further labels</p>
            {:else}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each blocks as block (block.label)}
                  <div>
                    <p class="text-xs uppercase tracking-wide mb-1" style="color: {$colorStore.muted}">{block.label}</p>
                    <BreakdownBar rows={block.rows} max={8} onSelect={(name) => narrow(block.label, name)} />
                  </div>
                {/each}
              </div>
            {/if}
          {/if}

          {@render children?.()}
        </div>
      </div>
    </div>
  </Portal>
{/if}
