<script lang="ts">
  import { m } from "$lib/i18n";
  import { serverBackupsApi, type RestoreStatus } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";

  interface Props {
    userId: bigint | string;
    guildId: bigint;
    watching: boolean;
  }

  let { userId, guildId, watching = $bindable() }: Props = $props();

  let status = $state<RestoreStatus | null>(null);
  let seen = $state(false);

  async function poll() {
    try {
      status = await serverBackupsApi.restoreStatus(userId, guildId);
      if (status.started && (watching || !status.finished)) seen = true;
      if (status.started && !status.finished) watching = true;
      if (status.finished) watching = false;
    } catch (err) {
      logger.error("Failed to read restore progress:", err);
    }
  }

  $effect(() => {
    void poll();
  });

  $effect(() => {
    if (!watching) return;
    const timer = setInterval(poll, 3000);
    return () => clearInterval(timer);
  });

  const counts = $derived(
    status
      ? [
          { label: m.common.roles(), value: status.rolesCreated },
          { label: m.common.channels(), value: status.channelsCreated },
          { label: m.serverTools.backupEmojis(), value: status.emojisCreated },
          { label: m.common.messages(), value: status.messagesRestored }
        ]
      : []
  );
</script>

{#if status?.started && seen}
  <PluginCard title={status.finished ? m.serverTools.restoreDone() : m.serverTools.restoreRunning()} alwaysOpen>
    <div class="space-y-3" aria-live="polite">
      {#if !status.finished}
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-5 h-5 shrink-0 border-2 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
          <span class="text-sm truncate" style="color: {$colorStore.text}">{status.step}</span>
        </div>
      {/if}
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {#each counts as item (item.label)}
          <div class="rounded-lg p-3 min-w-0" style="background: {$colorStore.primary}08;">
            <div class="text-lg font-semibold" style="color: {$colorStore.text}">{item.value}</div>
            <div class="text-xs truncate" style="color: {$colorStore.muted}">{item.label}</div>
          </div>
        {/each}
      </div>
      {#if status.failures.length > 0}
        <div class="rounded-lg p-3 space-y-1" style="background: #ef444415;">
          <div class="text-sm font-medium" style="color: {$colorStore.text}">{m.serverTools.restoreFailures({ count: status.failures.length })}</div>
          <ul class="text-sm space-y-1 max-h-40 overflow-y-auto overscroll-contain" style="color: {$colorStore.muted}">
            {#each status.failures as failure, index (index)}
              <li class="break-words">{failure}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </PluginCard>
{/if}
