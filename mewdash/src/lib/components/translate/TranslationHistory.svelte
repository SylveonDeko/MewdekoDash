<!-- lib/components/translate/TranslationHistory.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { translationErrorMessage } from "$lib/translate/client";
  import type { CurrentTranslation, HistoryEntry, HistoryOrigin, HistoryResult, HistoryStatus, OverrideResult } from "$lib/translate/records";
  import { formatWhen, wikiCall } from "$lib/wiki/client";

  interface Props {
    catalog: string;
    locale: string;
    translationKey: string;
    canRestore: boolean;
    onclose: () => void;
    onrestored: (text: string) => void;
  }

  let { catalog, locale, translationKey, canRestore, onclose, onrestored }: Props = $props();

  let entries = $state<HistoryEntry[] | null>(null);
  let current = $state<CurrentTranslation | null>(null);
  let error = $state<string | null>(null);
  let busy = $state(false);

  function statusLabel(status: HistoryStatus): string {
    switch (status) {
      case "open":
        return m.common.open();
      case "approved":
        return m.common.approved();
      case "declined":
        return m.wikiManage.statusDeclined();
      case "reverted":
        return m.translate.removed();
      default:
        return m.wikiManage.statusReplaced();
    }
  }

  function originLabel(origin: HistoryOrigin): string | null {
    switch (origin) {
      case "edit":
        return m.translate.originEdit();
      case "import":
        return m.translate.originImport();
      case "restore":
        return m.translate.originRestore();
      default:
        return null;
    }
  }

  async function load() {
    const query = new URLSearchParams({ catalog, key: translationKey, locale });
    const result = await wikiCall<HistoryResult>("GET", `/api/translations/history?${query}`);
    if (result.ok && result.data) {
      entries = result.data.entries;
      current = result.data.current;
    } else error = translationErrorMessage(result.error);
  }

  $effect(() => {
    void load();
  });

  async function restore(entry: HistoryEntry) {
    const ok = await requestConfirmation({
      title: m.translate.historyRestoreTitle(),
      message: m.translate.historyRestoreMessage(),
      confirmText: m.common.restore(),
      variant: "danger",
    });
    if (!ok) return;
    busy = true;
    error = null;
    const result = await wikiCall<OverrideResult>("POST", "/api/translations/restore", { catalog, key: translationKey, locale, id: entry.id });
    busy = false;
    if (!result.ok || !result.data) {
      error = translationErrorMessage(result.error);
      return;
    }
    onrestored(entry.text);
    await load();
  }
</script>

<Sheet title={m.translate.historyTitle({ key: translationKey })} {onclose}>
  {#if error}
    <p class="text-sm text-red-400" role="alert">{error}</p>
  {/if}
  {#if entries === null}
    {#if !error}
      <p style="color: {$colorStore.muted}">{m.common.loading()}</p>
    {/if}
  {:else}
    {#if current}
      <div class="space-y-1 pb-4 mb-4" style="border-bottom: 1px solid {$colorStore.primary}20;">
        <div class="text-xs font-medium" style="color: {$colorStore.muted}">{m.translate.historyCurrent()}</div>
        <p class="whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{current.text}</p>
        {#if current.builtIn}
          <p class="text-xs" style="color: {$colorStore.muted}">{m.translate.historyBuiltIn()}</p>
        {:else}
          <p class="flex flex-wrap gap-x-3 gap-y-1 text-xs" style="color: {$colorStore.muted}">
            {#if current.writtenByName}<span>{m.translate.historyWrittenBy({ name: current.writtenByName })}</span>{/if}
            {#if current.approvedByName}<span>{m.translate.historyApprovedBy({ name: current.approvedByName })}</span>{/if}
            {#if current.approvedAt}<span>{formatWhen(current.approvedAt)}</span>{/if}
          </p>
        {/if}
      </div>
    {/if}
    {#if entries.length === 0}
      <p style="color: {$colorStore.muted}">{m.translate.historyEmpty()}</p>
    {:else}
      <ul class="space-y-4">
        {#each entries as entry (entry.id)}
          <li class="space-y-1">
            <div class="text-sm" style="color: {$colorStore.muted}">
              {m.translate.historyMeta({ name: entry.userName, when: formatWhen(entry.createdAt) })}
              <span class="font-medium" style="color: {$colorStore.text}">{statusLabel(entry.status)}</span>
              {#if originLabel(entry.origin)}<span>{originLabel(entry.origin)}</span>{/if}
            </div>
            <p class="whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{entry.text}</p>
            {#if entry.status === "declined" && entry.declineReason}
              <p class="text-sm break-words" style="color: {$colorStore.muted}">{entry.declineReason}</p>
            {/if}
            {#if entry.status === "approved" && entry.origin === "suggestion" && entry.reviewedByName}
              <p class="text-xs" style="color: {$colorStore.muted}">{m.translate.historyApprovedBy({ name: entry.reviewedByName })}</p>
            {/if}
            {#if canRestore && entry.status === "approved" && entry.text !== current?.text}
              <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" disabled={busy}
                      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                      onclick={() => restore(entry)}>{m.common.restore()}</button>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</Sheet>
