<!-- lib/components/translate/TranslationHistory.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { translationErrorMessage } from "$lib/translate/client";
  import type { HistoryEntry, TranslationStatus } from "$lib/translate/records";
  import { formatWhen, wikiCall } from "$lib/wiki/client";

  interface Props {
    catalog: string;
    locale: string;
    translationKey: string;
    onclose: () => void;
  }

  let { catalog, locale, translationKey, onclose }: Props = $props();

  let entries = $state<HistoryEntry[] | null>(null);
  let error = $state<string | null>(null);

  function statusLabel(status: TranslationStatus): string {
    switch (status) {
      case "open":
        return m.common.open();
      case "approved":
        return m.common.approved();
      case "declined":
        return m.wikiManage.statusDeclined();
      default:
        return m.wikiManage.statusReplaced();
    }
  }

  $effect(() => {
    const query = new URLSearchParams({ catalog, key: translationKey, locale });
    void wikiCall<{ entries: HistoryEntry[] }>("GET", `/api/translations/history?${query}`).then((result) => {
      if (result.ok && result.data) entries = result.data.entries;
      else error = translationErrorMessage(result.error);
    });
  });
</script>

<Sheet title={m.translate.historyTitle({ key: translationKey })} {onclose}>
  {#if error}
    <p class="text-sm text-red-400" role="alert">{error}</p>
  {:else if entries === null}
    <p style="color: {$colorStore.muted}">{m.common.loading()}</p>
  {:else if entries.length === 0}
    <p style="color: {$colorStore.muted}">{m.translate.historyEmpty()}</p>
  {:else}
    <ul class="space-y-4">
      {#each entries as entry (entry.id)}
        <li class="space-y-1">
          <div class="text-sm" style="color: {$colorStore.muted}">
            {m.translate.historyMeta({ name: entry.userName, when: formatWhen(entry.createdAt) })}
            <span class="font-medium" style="color: {$colorStore.text}">{statusLabel(entry.status)}</span>
          </div>
          <p class="whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{entry.text}</p>
          {#if entry.status === "declined" && entry.declineReason}
            <p class="text-sm break-words" style="color: {$colorStore.muted}">{entry.declineReason}</p>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</Sheet>
