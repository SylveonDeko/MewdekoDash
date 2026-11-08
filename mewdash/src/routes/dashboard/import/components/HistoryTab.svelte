<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { ImportKind, ImportSource, type ImportHistoryEntry } from "$lib/api/index.ts";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";

  interface Props {
    history: ImportHistoryEntry[];
    loading: boolean;
    error: string;
    undoing: number | null;
    onundo: (entry: ImportHistoryEntry) => void;
  }

  let { history, loading, error, undoing, onundo }: Props = $props();

  const sourceNames = $derived<Record<number, string>>({
    [ImportSource.Mee6]: "MEE6",
    [ImportSource.Lurkr]: "Lurkr",
    [ImportSource.Polaris]: "Polaris",
    [ImportSource.Arcane]: "Arcane",
    [ImportSource.Amari]: "Amari",
    [ImportSource.Tatsu]: "Tatsu",
    [ImportSource.File]: m.import.pageSourceFile(),
    [ImportSource.UnbelievaBoat]: "UnbelievaBoat",
    [ImportSource.Mee6Settings]: m.import.pageSourceMee6Settings()
  });

  function when(value: string): string {
    return new Date(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`).toLocaleString();
  }

  function describe(entry: ImportHistoryEntry): string {
    const source = sourceNames[entry.source];
    const count = Number(entry.memberCount).toLocaleString();
    if (entry.kind === ImportKind.Settings) return m.import.pageHistorySettings({ source, count });
    if (entry.kind === ImportKind.Currency) {
      return entry.roleRewardCount
        ? m.import.pageHistoryBalancesRoles({ source, count, roles: entry.roleRewardCount })
        : m.import.pageHistoryBalances({ source, count });
    }
    return entry.roleRewardCount
      ? m.import.pageHistoryXpRoles({ source, count, roles: entry.roleRewardCount })
      : m.import.pageHistoryXp({ source, count });
  }
</script>

<PluginCard title={m.common.history()} alwaysOpen>
  {#if error}
    <div class="p-3 rounded-xl flex items-center gap-3" role="alert" style="background: #ef444415; border: 1px solid #ef444430; color: #ef4444;">
      <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      <span class="text-sm">{error}</span>
    </div>
  {/if}

  {#if loading && !history.length}
    <div class="flex items-center justify-center py-10" style="color: {$colorStore.muted}">
      <i class="fa-solid fa-spinner fa-spin text-2xl" aria-hidden="true"></i>
      <span class="sr-only">{m.common.loading()}</span>
    </div>
  {:else if !history.length}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-clock-rotate-left" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p style="color: {$colorStore.muted}">{m.import.pageHistoryEmpty()}</p>
    </div>
  {:else}
    <ul class="space-y-2">
      {#each history as entry (entry.id)}
        <li
          class="flex flex-wrap items-center gap-2 p-2 rounded-xl border min-w-0"
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
        >
          <div class="grow min-w-0 px-1">
            <p class="text-sm font-medium" style="color: {$colorStore.text}">{describe(entry)}</p>
            <p class="text-xs" style="color: {$colorStore.muted}">
              {when(entry.dateAdded)}
              {#if entry.undoneAt}, {m.import.pageHistoryUndone({ when: when(entry.undoneAt) })}{/if}
            </p>
          </div>
          {#if entry.canUndo}
            <button
              type="button"
              class="px-4 rounded-lg min-h-[44px] text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              disabled={undoing !== null}
              onclick={() => onundo(entry)}
            >
              <i class="fa-solid {undoing === entry.id ? 'fa-arrows-rotate fa-spin' : 'fa-rotate-left'}" aria-hidden="true"></i>
              {m.common.undo()}
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</PluginCard>
