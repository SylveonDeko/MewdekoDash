<!-- lib/components/stats/RankList.svelte -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";

  export interface RankRow {
    rank: number;
    /** The row's key for rendering. */
    id: string;
    name: string;
    avatarUrl?: string | null;
    /** The formatted primary value. */
    value: string;
    /** A short line under the name. */
    detail?: string;
  }

  interface Props {
    rows: RankRow[];
    /** Rendered after the value on each row, for actions. */
    trailing?: Snippet<[RankRow]>;
    onselect?: (row: RankRow) => void;
  }

  let { rows, trailing, onselect }: Props = $props();

  const medals = ["#FFD700", "#C0C0C0", "#CD7F32"];

  function rankColor(rank: number): string {
    return rank >= 1 && rank <= 3 ? medals[rank - 1] : $colorStore.primary;
  }
</script>

<ul class="space-y-2">
  {#each rows as row (row.id)}
    <li
      class="flex items-center gap-3 rounded-xl p-3 border min-h-[56px]"
      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
    >
      <span
        class="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-sm font-bold"
        style="background: {rankColor(row.rank)}20; color: {rankColor(row.rank)};"
      >
        #{row.rank}
      </span>
      {#if row.avatarUrl}
        <img src={row.avatarUrl} alt="" class="w-9 h-9 rounded-full shrink-0" loading="lazy" />
      {/if}
      <button
        type="button"
        class="grow min-w-0 text-left"
        class:cursor-default={!onselect}
        onclick={() => onselect?.(row)}
        disabled={!onselect}
      >
        <p class="font-medium truncate" style="color: {$colorStore.text}">{row.name}</p>
        {#if row.detail}
          <p class="text-xs truncate" style="color: {$colorStore.muted}">{row.detail}</p>
        {/if}
      </button>
      <span class="font-semibold tabular-nums shrink-0" style="color: {$colorStore.secondary}">{row.value}</span>
      {#if trailing}
        {@render trailing(row)}
      {/if}
    </li>
  {/each}
</ul>
