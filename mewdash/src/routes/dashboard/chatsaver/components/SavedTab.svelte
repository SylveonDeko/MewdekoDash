<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { ChatLogSummary } from "$lib/api/index.ts";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { formatDateTime } from "./chatModel";

  interface Props {
    logs: ChatLogSummary[];
    loading: boolean;
    opening: string | null;
    onopen: (log: ChatLogSummary) => void;
    ondelete: (log: ChatLogSummary) => void;
  }

  let { logs, loading, opening, onopen, ondelete }: Props = $props();
</script>

<PluginCard title={m.chatsaver.saverTabSaved()} alwaysOpen>
  {#if loading && !logs.length}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if logs.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-folder-open" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p style="color: {$colorStore.muted}">{m.chatsaver.saverNoSavedLogs()}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each logs as log (log.id)}
        <div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <button type="button" class="grow min-w-0 text-left min-h-[44px] px-1 disabled:opacity-60" disabled={opening === log.id} onclick={() => onopen(log)}>
            <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{log.name}</span>
            <span class="block text-sm truncate" style="color: {$colorStore.muted}">
              {log.messageCount === 1
                ? m.chatsaver.saverLogMetaOne({ channel: log.channelName, date: formatDateTime(log.timestamp), count: log.messageCount })
                : m.chatsaver.saverLogMetaOther({ channel: log.channelName, date: formatDateTime(log.timestamp), count: log.messageCount })}
            </span>
          </button>
          <button
            type="button"
            class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            aria-label={m.chatsaver.saverDeleteLog()}
            onclick={() => ondelete(log)}
          >
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</PluginCard>
