<script lang="ts">
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { dataImportApi, ImportKind, ImportSource, type ImportHistoryEntry } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import ImportFlow from "$lib/components/dashboard/import/ImportFlow.svelte";

  const sourceNames: Record<number, string> = {
    [ImportSource.Mee6]: "MEE6",
    [ImportSource.Lurkr]: "Lurkr",
    [ImportSource.Polaris]: "Polaris",
    [ImportSource.Arcane]: "Arcane",
    [ImportSource.Amari]: "Amari",
    [ImportSource.Tatsu]: "Tatsu",
    [ImportSource.File]: "File",
    [ImportSource.UnbelievaBoat]: "UnbelievaBoat",
    [ImportSource.Mee6Settings]: "MEE6 settings"
  };

  const undoErrors: Record<string, string> = {
    UndoExpired: "That import can no longer be undone.",
    UndoNotLatest: "Undo the newer import first.",
    JobMissing: "That import no longer exists."
  };

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
      error = "Couldn't load past imports.";
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
      error = undoErrors[err instanceof Error ? err.message : ""] ?? "Couldn't undo that import.";
    } finally {
      undoing = null;
      undoTarget = null;
    }
  }

  $effect(() => {
    if ($currentGuild?.id) loadHistory();
  });

  const tabs = [
    { id: "import", label: "Import", icon: "fa-arrow-right-to-bracket" },
    { id: "history", label: "History", icon: "fa-clock-rotate-left" }
  ];
</script>

<DashboardPageLayout
  bind:activeTab
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-arrow-right-to-bracket"
  subtitle="Bring XP, levels and balances over from other bots"
  {tabs}
  title="Import"
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
        <span class="sr-only">Loading</span>
      </div>
    {:else if !history.length}
      <p class="text-sm py-8 text-center" style="color: {$colorStore.muted}">Nothing has been imported into this server yet.</p>
    {:else}
      <ul class="space-y-2">
        {#each history as entry (entry.id)}
          <li class="flex items-center gap-3 p-3 rounded-xl min-h-[44px]" in:fly={{ y: 10, duration: 200 }}
              style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium" style="color: {$colorStore.text}">
                {#if entry.kind === ImportKind.Settings}
                  {sourceNames[entry.source]}: {Number(entry.memberCount).toLocaleString()} settings
                {:else}
                  {sourceNames[entry.source]}: {entry.kind === ImportKind.Currency ? "balances" : "XP"} for
                  {Number(entry.memberCount).toLocaleString()} members{entry.roleRewardCount ? `, ${entry.roleRewardCount} level roles` : ""}
                {/if}
              </p>
              <p class="text-xs" style="color: {$colorStore.muted}">
                {when(entry.dateAdded)}
                {#if entry.undoneAt}, undone {when(entry.undoneAt)}{/if}
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
                Undo
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
  title="Undo this import?"
  message="Every member it changed goes back to what they had before. Anything they earned since the import is lost."
  confirmText="Undo import"
  variant="warning"
  onconfirm={undo}
  oncancel={() => { undoTarget = null; }}
/>
