<!-- routes/dashboard/import/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { dataImportApi, type ImportHistoryEntry } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import ImportFlow from "$lib/components/dashboard/import/ImportFlow.svelte";
  import HistoryTab from "./components/HistoryTab.svelte";

  const undoErrors = $derived<Record<string, string>>({
    UndoExpired: m.import.pageUndoExpired(),
    UndoNotLatest: m.import.pageUndoNotLatest(),
    JobMissing: m.import.pageUndoJobMissing()
  });

  let history = $state<ImportHistoryEntry[]>([]);
  let historyLoading = $state(false);
  let error = $state("");
  let undoTarget = $state<ImportHistoryEntry | null>(null);
  let undoOpen = $state(false);
  let undoing = $state<number | null>(null);
  let loadedGuildId = "";

  const tabs = $derived([
    { id: "import", label: m.common.import(), icon: "fa-arrow-right-to-bracket" },
    { id: "history", label: m.common.history(), icon: "fa-clock-rotate-left" }
  ]);

  const activeTab = $derived(tabs.find(tab => tab.id === page.url.searchParams.get("tab"))?.id ?? "import");

  function select(id: string) {
    if (id === activeTab) return;
    const url = new URL(page.url);
    url.search = "";
    url.searchParams.set("tab", id);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  async function loadHistory() {
    if (!$currentGuild?.id) return;
    historyLoading = true;
    try {
      history = await dataImportApi.getHistory($currentGuild.id);
      error = "";
    } catch (err) {
      logger.error("Failed to load import history:", err);
      error = m.import.pageErrorLoadHistory();
    } finally {
      historyLoading = false;
    }
  }

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
    if (!$currentGuild) {
      void goto("/dashboard");
      return;
    }
    if (loadedGuildId !== $currentGuild.id.toString()) {
      loadedGuildId = $currentGuild.id.toString();
      void loadHistory();
    }
  });
</script>

<PluginPage
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-arrow-right-to-bracket"
  title={m.common.import()}
  subtitle={m.features.importDescription()}
>
  <div class="grid grid-cols-2 gap-2 [&>:last-child:nth-child(odd)]:col-span-2" role="group" aria-label={m.common.import()}>
    {#each tabs as tab (tab.id)}
      {@const selected = activeTab === tab.id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => select(tab.id)}
      >
        <i class="fa-solid {tab.icon}" aria-hidden="true"></i>
        {tab.label}
      </button>
    {/each}
  </div>

  <div class:hidden={activeTab !== "import"}>
    {#if $currentGuild?.id}
      <ImportFlow guildId={$currentGuild.id} onimported={loadHistory} />
    {/if}
  </div>

  <div class:hidden={activeTab !== "history"}>
    <HistoryTab {history} loading={historyLoading} {error} {undoing} onundo={(entry) => { undoTarget = entry; undoOpen = true; }} />
  </div>
</PluginPage>

<ConfirmationModal
  bind:isOpen={undoOpen}
  title={m.import.pageUndoTitle()}
  message={m.import.pageUndoMessage()}
  confirmText={m.import.pageUndoConfirm()}
  variant="warning"
  onconfirm={undo}
  oncancel={() => { undoTarget = null; }}
/>
