<!-- lib/components/analytics/BreakdownPanel.svelte -->
<script lang="ts">
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { AnalyticsAgg, BreakdownRow } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick, queryParams } from "$lib/stores/analyticsFilters";
  import { compact } from "./format";
  import BreakdownBar from "./BreakdownBar.svelte";

  interface Props {
    metric: string;
    label: string;
    agg?: AnalyticsAgg;
    filters?: string[];
    fixed?: Record<string, string>;
    max?: number;
    format?: (value: number) => string;
    color?: string;
    onSelect?: (name: string) => void;
    selected?: string | null;
    empty?: string;
  }

  let {
    metric,
    label,
    agg = "sum",
    filters = ["bot", "shard"],
    fixed = {},
    max = 12,
    format = compact,
    color,
    onSelect,
    selected = null,
    empty = "No data",
  }: Props = $props();

  let rows = $state<BreakdownRow[]>([]);
  let loading = $state(true);
  let seq = 0;

  let fixedKey = $derived(JSON.stringify(fixed));

  async function load() {
    const my = ++seq;
    loading = true;
    try {
      const result = await analyticsApi.breakdown({ metric, label, agg, limit: max, ...queryParams($analyticsFilters, filters, fixed) });
      if (my !== seq) return;
      rows = result ?? [];
    } catch (err) {
      if (my !== seq) return;
      logger.warn(`Analytics breakdown ${metric}/${label} failed`, err);
      rows = [];
    } finally {
      if (my === seq) loading = false;
    }
  }

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick, metric, label, agg, fixedKey, max, filters];
    void load();
  });
</script>

<BreakdownBar {rows} {loading} {max} {format} {color} {onSelect} {selected} {empty} />
