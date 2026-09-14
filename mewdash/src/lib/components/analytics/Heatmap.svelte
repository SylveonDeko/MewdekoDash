<!-- lib/components/analytics/Heatmap.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { n } from "./format";
  import type { HeatmapCell } from "$lib/api/analytics/models";

  interface Props {
    buckets: string[];
    cells: HeatmapCell[];
    loading?: boolean;
    unit?: string;
    empty?: string;
  }

  let { buckets, cells, loading = false, unit = "", empty = "No data" }: Props = $props();

  const hours = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0"));

  let grid = $derived.by(() => {
    const map = new Map<string, number>();
    let max = 0;
    for (const c of cells) {
      map.set(`${c.size}|${c.hour}`, c.count);
      if (c.count > max) max = c.count;
    }
    return { map, max };
  });

  function cellStyle(bucket: string, hour: number): string {
    const value = grid.map.get(`${bucket}|${hour}`) ?? 0;
    const ratio = grid.max ? value / grid.max : 0;
    const alpha = value ? Math.round(24 + ratio * 200) : 8;
    return `background: ${$colorStore.primary}${alpha.toString(16).padStart(2, "0")}`;
  }

  function cellTitle(bucket: string, hour: number): string {
    return `${bucket} · ${hours[hour]}:00 UTC · ${n(grid.map.get(`${bucket}|${hour}`) ?? 0)} ${unit}`.trim();
  }
</script>

{#if loading && cells.length === 0}
  <div class="h-40 rounded animate-pulse" style="background: {$colorStore.primary}10"></div>
{:else if buckets.length === 0 || cells.length === 0}
  <p class="text-xs py-6 text-center" style="color: {$colorStore.muted}">{empty}</p>
{:else}
  <div class="overflow-x-auto">
    <div class="min-w-[640px]">
      <div class="grid gap-[2px]" style="grid-template-columns: 5rem repeat(24, minmax(0, 1fr))">
        <div></div>
        {#each hours as h}
          <div class="text-[10px] text-center" style="color: {$colorStore.muted}">{h}</div>
        {/each}
        {#each buckets as bucket}
          <div class="text-xs pr-2 truncate self-center" style="color: {$colorStore.text}" title={bucket}>{bucket}</div>
          {#each hours as _, hour}
            <div class="h-6 rounded-sm" style={cellStyle(bucket, hour)} title={cellTitle(bucket, hour)}></div>
          {/each}
        {/each}
      </div>
      <div class="flex items-center justify-end gap-2 mt-2 text-[10px]" style="color: {$colorStore.muted}">
        <span>0</span>
        <span class="h-2 w-24 rounded-full" style="background: linear-gradient(90deg, {$colorStore.primary}18, {$colorStore.primary})"></span>
        <span>{n(grid.max)} {unit}</span>
      </div>
    </div>
  </div>
{/if}
