<!-- lib/components/analytics/AnalyticsTable.svelte -->
<script lang="ts" module>
  import type { PillTone } from "./palette";

  export interface Column<Row> {
    key: string;
    label: string;
    num?: boolean;
    mono?: boolean;
    muted?: boolean;
    /** Cell text; defaults to the raw field. */
    format?: (row: Row) => string;
    /** Renders the cell as a pill in this tone. */
    tone?: (row: Row) => PillTone | null;
    /** Value used for sorting; defaults to the raw field. */
    sortValue?: (row: Row) => number | string | null;
    title?: (row: Row) => string;
    width?: string;
  }
</script>

<script lang="ts" generics="T">
  import { colorStore } from "$lib/stores/colorStore";
  import { n } from "./format";
  import Pill from "./Pill.svelte";

  interface Props {
    columns: Column<T>[];
    rows: T[];
    loading?: boolean;
    empty?: string;
    /** Client side page size; omit to show every row. */
    pageSize?: number;
    /** Server side paging: current page, total rows and the page callback. */
    page?: number;
    total?: number;
    onPage?: (page: number) => void;
    sortKey?: string;
    sortDesc?: boolean;
    onRowClick?: (row: T, index: number) => void;
    selected?: (row: T) => boolean;
  }

  let {
    columns,
    rows,
    loading = false,
    empty = "No data",
    pageSize,
    page,
    total,
    onPage,
    sortKey = $bindable(""),
    sortDesc = $bindable(true),
    onRowClick,
    selected,
  }: Props = $props();

  let localPage = $state(1);

  function raw(row: T, col: Column<T>): unknown {
    return (row as Record<string, unknown>)[col.key];
  }

  function text(row: T, col: Column<T>): string {
    if (col.format) return col.format(row);
    const value = raw(row, col);
    if (value === null || value === undefined) return "—";
    if (typeof value === "number") return n(value);
    return String(value);
  }

  function sortValue(row: T, col: Column<T>): number | string | null {
    if (col.sortValue) return col.sortValue(row);
    const value = raw(row, col);
    if (typeof value === "number" || typeof value === "string") return value;
    if (typeof value === "boolean") return value ? 1 : 0;
    return null;
  }

  let sorted = $derived.by(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return rows;
    const dir = sortDesc ? -1 : 1;
    return [...rows].sort((a, b) => {
      const x = sortValue(a, col);
      const y = sortValue(b, col);
      if (x === y) return 0;
      if (x === null) return 1;
      if (y === null) return -1;
      if (typeof x === "number" && typeof y === "number") return (x - y) * dir;
      return String(x).localeCompare(String(y)) * dir;
    });
  });

  let serverPaged = $derived(page !== undefined && total !== undefined && !!onPage);
  let pageCount = $derived(
    serverPaged
      ? Math.max(1, Math.ceil((total ?? 0) / (pageSize ?? 25)))
      : pageSize
        ? Math.max(1, Math.ceil(rows.length / pageSize))
        : 1,
  );
  let currentPage = $derived(serverPaged ? (page ?? 1) : Math.min(localPage, pageCount));
  let visible = $derived(
    !serverPaged && pageSize ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sorted,
  );

  function sortBy(col: Column<T>) {
    if (sortKey === col.key) sortDesc = !sortDesc;
    else {
      sortKey = col.key;
      sortDesc = true;
    }
  }

  function go(delta: number) {
    const next = Math.min(pageCount, Math.max(1, currentPage + delta));
    if (serverPaged) onPage?.(next);
    else localPage = next;
  }
</script>

<div class="overflow-x-auto">
  <table class="w-full text-sm">
    <thead>
      <tr>
        {#each columns as col}
          <th
            class="px-2 py-2 text-xs font-medium text-left whitespace-nowrap select-none cursor-pointer {col.num ? 'text-right' : ''}"
            style="color: {$colorStore.muted}; width: {col.width ?? 'auto'}"
            onclick={() => sortBy(col)}
          >
            {col.label}
            {#if sortKey === col.key}
              <i class="fa-solid {sortDesc ? 'fa-sort-down' : 'fa-sort-up'} ml-1 text-[10px]"></i>
            {/if}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#if loading && rows.length === 0}
        <tr>
          <td colspan={columns.length} class="px-2 py-4">
            <div class="h-3 rounded animate-pulse" style="background: {$colorStore.primary}20"></div>
          </td>
        </tr>
      {:else if visible.length === 0}
        <tr>
          <td colspan={columns.length} class="px-2 py-4 text-xs text-center" style="color: {$colorStore.muted}">{empty}</td>
        </tr>
      {:else}
        {#each visible as row, i}
          <tr
            class="border-t transition-colors {onRowClick ? 'cursor-pointer hover:bg-white/5' : ''}"
            style="border-color: {$colorStore.primary}10; {selected?.(row) ? `background: ${$colorStore.primary}15;` : ''}"
            onclick={() => onRowClick?.(row, i)}
          >
            {#each columns as col}
              {@const tone = col.tone?.(row) ?? null}
              <td
                class="px-2 py-1.5 whitespace-nowrap {col.num ? 'text-right tabular-nums' : ''} {col.mono ? 'font-mono text-xs' : ''}"
                style="color: {col.muted ? $colorStore.muted : $colorStore.text}"
                title={col.title?.(row)}
              >
                {#if tone}
                  <Pill {tone} text={text(row, col)} />
                {:else}
                  {text(row, col)}
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>

{#if pageCount > 1 || serverPaged}
  <div class="flex items-center justify-between mt-2 text-xs" style="color: {$colorStore.muted}">
    <span>
      {#if serverPaged}
        {n(total ?? 0)} rows
      {:else}
        {n(rows.length)} rows
      {/if}
    </span>
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="min-h-[44px] min-w-[44px] rounded-lg disabled:opacity-40"
        style="background: {$colorStore.primary}10; color: {$colorStore.text}"
        disabled={currentPage <= 1}
        onclick={() => go(-1)}
        aria-label="Previous page"
      ><i class="fa-solid fa-chevron-left"></i></button>
      <span class="px-2">{currentPage} / {pageCount}</span>
      <button
        type="button"
        class="min-h-[44px] min-w-[44px] rounded-lg disabled:opacity-40"
        style="background: {$colorStore.primary}10; color: {$colorStore.text}"
        disabled={currentPage >= pageCount}
        onclick={() => go(1)}
        aria-label="Next page"
      ><i class="fa-solid fa-chevron-right"></i></button>
    </div>
  </div>
{/if}
