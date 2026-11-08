<script lang="ts">
  import { m } from "$lib/i18n";
  import type { WordOfTheDayHistoryEntry } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { formatDate } from "./wotdModel";

  interface Props {
    history: WordOfTheDayHistoryEntry[];
    lastPostedDate: string | null;
    loading: boolean;
  }

  let { history, lastPostedDate, loading }: Props = $props();
</script>

<PluginCard title={m.wordoftheday.historyTitle()} alwaysOpen>
  <p class="text-sm" style="color: {$colorStore.muted}">{m.wordoftheday.lastPosted({ date: formatDate(lastPostedDate) })}</p>

  {#if loading}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.common.loading()}</p>
  {:else if history.length === 0}
    <div class="py-6 text-center">
      <p class="font-semibold" style="color: {$colorStore.text}">{m.wordoftheday.historyEmptyTitle()}</p>
      <p class="text-sm" style="color: {$colorStore.muted}">{m.wordoftheday.historyEmptyHint()}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each history as entry (entry.id)}
        <div class="rounded-xl border p-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="flex flex-wrap items-baseline justify-between gap-x-3">
            <span class="text-sm font-semibold break-words" style="color: {$colorStore.text}">
              {entry.word}
              {#if entry.phonetic}
                <span class="text-xs font-normal ml-1" style="color: {$colorStore.muted}">{entry.phonetic}</span>
              {/if}
              {#if entry.partOfSpeech}
                <span class="text-xs font-normal italic ml-1" style="color: {$colorStore.muted}">{entry.partOfSpeech}</span>
              {/if}
            </span>
            <span class="text-xs shrink-0" style="color: {$colorStore.muted}">{formatDate(entry.postedOn)}</span>
          </div>
          <p class="text-sm mt-1 break-words" style="color: {$colorStore.muted}">{entry.definition}</p>
          {#if entry.example}
            <p class="text-xs italic mt-1 break-words" style="color: {$colorStore.muted}">"{entry.example}"</p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</PluginCard>
