<!-- lib/components/analytics/BreakdownBar.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { compact } from "./format";
  import type { BreakdownRow } from "$lib/api/analytics/models";

  interface Props {
    rows: BreakdownRow[];
    loading?: boolean;
    empty?: string;
    max?: number;
    color?: string;
    format?: (value: number) => string;
    onSelect?: (name: string) => void;
    selected?: string | null;
  }

  let {
    rows,
    loading = false,
    empty = "No data",
    max = 12,
    color,
    format = compact,
    onSelect,
    selected = null,
  }: Props = $props();

  let shown = $derived(
    [...rows]
      .filter((r) => r.value !== null && r.value !== undefined)
      .sort((a, b) => b.value - a.value)
      .slice(0, max),
  );
  let peak = $derived(Math.max(1, ...shown.map((r) => Math.abs(r.value))));
  let barColor = $derived(color ?? $colorStore.primary);
</script>

{#if loading && rows.length === 0}
  <div class="space-y-2">
    {#each [0, 1, 2] as _}
      <div class="h-3 rounded animate-pulse" style="background: {$colorStore.primary}20"></div>
    {/each}
  </div>
{:else if shown.length === 0}
  <p class="text-xs py-2" style="color: {$colorStore.muted}">{empty}</p>
{:else}
  <div class="space-y-1">
    {#each shown as row}
      <button
        type="button"
        class="w-full flex items-center gap-2 text-left rounded px-1 py-0.5 transition-colors {onSelect ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'}"
        style={selected === row.name ? `background: ${$colorStore.primary}15` : ""}
        onclick={() => onSelect?.(row.name)}
        disabled={!onSelect}
      >
        <span class="w-28 sm:w-36 shrink-0 truncate text-xs font-mono" style="color: {$colorStore.text}" title={row.name}>{row.name}</span>
        <span class="flex-1 h-2.5 rounded-full overflow-hidden" style="background: {$colorStore.primary}10">
          <span class="block h-full rounded-full" style="width: {Math.max(2, (Math.abs(row.value) / peak) * 100)}%; background: {barColor}"></span>
        </span>
        <span class="w-14 shrink-0 text-right text-xs tabular-nums" style="color: {$colorStore.muted}">{format(row.value)}</span>
      </button>
    {/each}
  </div>
{/if}
