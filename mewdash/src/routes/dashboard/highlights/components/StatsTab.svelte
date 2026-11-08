<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { formatDate, type HighlightRow, type HighlightStats } from "./highlightsModel";

  interface Props {
    stats: HighlightStats | null;
    rows: HighlightRow[];
    loading: boolean;
    onremoveword: (word: string) => void;
  }

  let { stats, rows, loading, onremoveword }: Props = $props();

  const names = $derived(
    new Map(
      rows
        .filter(row => row.username && row.username !== "Unknown")
        .map(row => [String(row.userId), row.username as string])
    )
  );

  function member(id: bigint | string): string {
    return names.get(String(id)) ?? m.common.userFallback({ id: String(id) });
  }

  const tiles = $derived(
    stats
      ? [
          { label: m.highlights.pageStatTotal(), value: stats.totalHighlights },
          { label: m.highlights.pageStatUsers(), value: stats.totalUsers }
        ]
      : []
  );
</script>

{#if loading}
  <div class="flex justify-center py-6">
    <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
  </div>
{:else if !stats}
  <p class="py-6 text-center" style="color: {$colorStore.muted}">{m.common.noStatisticsAvailable()}</p>
{:else}
  <PluginCard title={m.common.statistics()} alwaysOpen>
    <div class="grid grid-cols-2 gap-3">
      {#each tiles as tile (tile.label)}
        <div class="rounded-lg p-3 min-w-0" style="background: {$colorStore.primary}08;">
          <p class="text-xs" style="color: {$colorStore.muted}">{tile.label}</p>
          <p class="text-lg font-semibold tabular-nums" style="color: {$colorStore.text}">{tile.value}</p>
        </div>
      {/each}
    </div>
  </PluginCard>

  {#if stats.topHighlightedWords.length > 0}
    <PluginCard title={m.highlights.pageTopWordsTitle()} alwaysOpen>
      <div class="space-y-2">
        {#each stats.topHighlightedWords as entry (entry.word)}
          <div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
            <div class="grow min-w-0 px-1">
              <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{entry.word}</span>
              <span class="block text-sm" style="color: {$colorStore.muted}">
                {entry.count === 1 ? m.highlights.pageTopWordUsersOne({ count: entry.count }) : m.highlights.pageTopWordUsersOther({ count: entry.count })}
              </span>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              aria-label={m.highlights.removeWordAria({ word: entry.word })}
              onclick={() => onremoveword(entry.word)}
            >
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        {/each}
      </div>
    </PluginCard>
  {/if}

  {#if stats.topUsers.length > 0}
    <PluginCard title={m.highlights.topMembersTitle()} alwaysOpen>
      <div class="space-y-2">
        {#each stats.topUsers as entry (String(entry.userId))}
          <div class="flex items-center justify-between gap-3 rounded-lg p-3 min-w-0" style="background: {$colorStore.primary}08;">
            <span class="truncate text-sm" style="color: {$colorStore.text}">{member(entry.userId)}</span>
            <span class="shrink-0 text-sm tabular-nums" style="color: {$colorStore.muted}">{entry.highlightCount}</span>
          </div>
        {/each}
      </div>
    </PluginCard>
  {/if}

  {#if stats.recentHighlights.length > 0}
    <PluginCard title={m.highlights.pageRecentTitle()} alwaysOpen>
      <div class="space-y-2">
        {#each stats.recentHighlights as entry (`${entry.userId}:${entry.word}:${entry.dateAdded}`)}
          <div class="flex items-center justify-between gap-3 rounded-lg p-3 min-w-0" style="background: {$colorStore.primary}08;">
            <span class="min-w-0 truncate text-sm" style="color: {$colorStore.text}">
              {m.highlights.pageRecentLine({ word: entry.word, username: member(entry.userId) })}
            </span>
            <span class="shrink-0 text-xs" style="color: {$colorStore.muted}">{formatDate(entry.dateAdded)}</span>
          </div>
        {/each}
      </div>
    </PluginCard>
  {/if}
{/if}
