<!-- lib/components/analytics/MatrixHeatmap.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { n } from "./format";

  export interface MatrixCell {
    row: string;
    col: string;
    value: number;
  }

  interface Props {
    rows: string[];
    cols: string[];
    cells: MatrixCell[];
    colLabel?: (col: string) => string;
    loading?: boolean;
    unit?: string;
    empty?: string;
  }

  let { rows, cols, cells, colLabel = (c) => c, loading = false, unit = "", empty = "No data" }: Props = $props();

  let grid = $derived.by(() => {
    const map = new Map<string, number>();
    let max = 0;
    for (const c of cells) {
      map.set(`${c.row}|${c.col}`, c.value);
      if (c.value > max) max = c.value;
    }
    return { map, max };
  });

  function cellStyle(row: string, col: string): string {
    const value = grid.map.get(`${row}|${col}`) ?? 0;
    const ratio = grid.max ? value / grid.max : 0;
    const alpha = value ? Math.round(24 + ratio * 200) : 8;
    return `background: ${$colorStore.primary}${alpha.toString(16).padStart(2, "0")}`;
  }

  function cellTitle(row: string, col: string): string {
    return `${row} · ${colLabel(col)} · ${n(grid.map.get(`${row}|${col}`) ?? 0)} ${unit}`.trim();
  }
</script>

{#if loading && cells.length === 0}
  <div class="h-40 rounded animate-pulse" style="background: {$colorStore.primary}10"></div>
{:else if rows.length === 0 || cols.length === 0 || cells.length === 0}
  <p class="text-xs py-6 text-center" style="color: {$colorStore.muted}">{empty}</p>
{:else}
  <div class="overflow-x-auto">
    <div style="min-width: {Math.max(640, 96 + cols.length * 18)}px">
      <div class="grid gap-[2px]" style="grid-template-columns: 7rem repeat({cols.length}, minmax(0, 1fr))">
        <div></div>
        {#each cols as col, i}
          <div class="text-[10px] text-center truncate" style="color: {$colorStore.muted}">{i % Math.max(1, Math.ceil(cols.length / 12)) === 0 ? colLabel(col) : ""}</div>
        {/each}
        {#each rows as row}
          <div class="text-xs pr-2 truncate self-center font-mono" style="color: {$colorStore.text}" title={row}>{row}</div>
          {#each cols as col}
            <div class="h-5 rounded-sm" style={cellStyle(row, col)} title={cellTitle(row, col)}></div>
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
