<script lang="ts">
  import { m } from "$lib/i18n";
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { dataImportApi, ImportKind, ImportSource, type ImportHistoryEntry } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import ImportFlow from "$lib/components/dashboard/import/ImportFlow.svelte";

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

  const undoErrors = $derived<Record<string, string>>({
    UndoExpired: m.import.pageUndoExpired(),
    UndoNotLatest: m.import.pageUndoNotLatest(),
    JobMissing: m.import.pageUndoJobMissing()
  });

  let activeTab = $state("import");
  let history = $state<ImportHistoryEntry[]>([]);
  let historyLoading = $state(false);
  let error = $state("");
  let undoTarget = $state<ImportHistoryEntry | null>(null);
  let undoOpen = $state(false);
  let undoing = $state<number | null>(null);

  /**
   * Formats a UTC time from the bot in the viewer's locale.
   * @param value The time, with or without a zone suffix
   */
  function when(value: string): string {
    return new Date(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`).toLocaleString();
  }

  /** Loads the server's past imports. */
  async function loadHistory() {
    if (!$currentGuild?.id) return;
    historyLoading = true;
    try {
      history = await dataImportApi.getHistory($currentGuild.id);
    } catch (err) {
      logger.error("Failed to load import history:", err);
      error = m.import.pageErrorLoadHistory();
    } finally {
      historyLoading = false;
    }
  }

  /** Undoes the import picked in the confirmation. */
  async function undo() {
    if (!$currentGuild?.id || !undoTarget) return;
    undoing = undoTarget.id;
    error = "";
    try {
      await dataImportApi.undo($currentGuild.id, undoTarget.id);
      await loadHistory();
    } catch (err) {
      logger.error("Failed to undo an import:", err);
      error = undoErrors[err instanceof Error ? err.message : ""] ?? m.import.pageErrorUndo();
    } finally {
      undoing = null;
      undoTarget = null;
    }
  }

  $effect(() => {
    if ($currentGuild?.id) loadHistory();
  });

  const tabs = $derived([
    { id: "import", label: m.common.import(), icon: "fa-arrow-right-to-bracket" },
    { id: "history", label: m.common.history(), icon: "fa-clock-rotate-left" }
  ]);
</script>

<DashboardPageLayout
  bind:activeTab
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-arrow-right-to-bracket"
  subtitle={m.features.importDescription()}
  {tabs}
  title={m.common.import()}
>
  <div class:hidden={activeTab !== "import"}>
    {#if $currentGuild?.id}
      <ImportFlow guildId={$currentGuild.id} onimported={loadHistory} />
    {/if}
  </div>

  <div class:hidden={activeTab !== "history"}>
    {#if error}
      <div class="mb-4 p-4 rounded-xl flex items-center gap-3" role="alert"
           style="background: #ef444415; border: 1px solid #ef444430; color: #ef4444;">
        <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
        <span class="text-sm">{error}</span>
      </div>
    {/if}

    {#if historyLoading && !history.length}
      <div class="flex items-center justify-center py-16" style="color: {$colorStore.muted}">
        <i class="fa-solid fa-spinner fa-spin text-2xl" aria-hidden="true"></i>
        <span class="sr-only">{m.common.loading()}</span>
      </div>
    {:else if !history.length}
      <p class="text-sm py-8 text-center" style="color: {$colorStore.muted}">{m.import.pageHistoryEmpty()}</p>
    {:else}
      <ul class="space-y-2">
        {#each history as entry (entry.id)}
          <li class="flex items-center gap-3 p-3 rounded-xl min-h-[44px]" in:fly={{ y: 10, duration: 200 }}
              style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium" style="color: {$colorStore.text}">
                {#if entry.kind === ImportKind.Settings}
                  {m.import.pageHistorySettings({ source: sourceNames[entry.source], count: Number(entry.memberCount).toLocaleString() })}
                {:else if entry.kind === ImportKind.Currency}
                  {entry.roleRewardCount
                    ? m.import.pageHistoryBalancesRoles({ source: sourceNames[entry.source], count: Number(entry.memberCount).toLocaleString(), roles: entry.roleRewardCount })
                    : m.import.pageHistoryBalances({ source: sourceNames[entry.source], count: Number(entry.memberCount).toLocaleString() })}
                {:else}
                  {entry.roleRewardCount
                    ? m.import.pageHistoryXpRoles({ source: sourceNames[entry.source], count: Number(entry.memberCount).toLocaleString(), roles: entry.roleRewardCount })
                    : m.import.pageHistoryXp({ source: sourceNames[entry.source], count: Number(entry.memberCount).toLocaleString() })}
                {/if}
              </p>
              <p class="text-xs" style="color: {$colorStore.muted}">
                {when(entry.dateAdded)}
                {#if entry.undoneAt}, {m.import.pageHistoryUndone({ when: when(entry.undoneAt) })}{/if}
              </p>
            </div>
            {#if entry.canUndo}
              <button
                type="button"
                class="px-4 rounded-lg min-h-[44px] text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                disabled={undoing !== null}
                onclick={() => { undoTarget = entry; undoOpen = true; }}
              >
                <i class="fa-solid {undoing === entry.id ? 'fa-arrows-rotate fa-spin' : 'fa-rotate-left'}" aria-hidden="true"></i>
                {m.common.undo()}
              </button>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</DashboardPageLayout>

<ConfirmationModal
  bind:isOpen={undoOpen}
  title={m.import.pageUndoTitle()}
  message={m.import.pageUndoMessage()}
  confirmText={m.import.pageUndoConfirm()}
  variant="warning"
  onconfirm={undo}
  oncancel={() => { undoTarget = null; }}
/>
