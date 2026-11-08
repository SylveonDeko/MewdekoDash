<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { customBotsApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import Sheet from "$lib/components/ui/Sheet.svelte";

  interface Props {
    userId: string;
    instanceId: string;
    name: string;
    onclose: () => void;
  }

  let { userId, instanceId, name, onclose }: Props = $props();

  let lines = $state<string[]>([]);
  let loading = $state(true);
  let failed = $state<string | null>(null);

  async function load() {
    loading = true;
    failed = null;
    try {
      const result = await customBotsApi.getLogs(userId, instanceId, 200);
      lines = result.lines ?? [];
    } catch (err) {
      logger.error("Failed to load custom bot logs:", err);
      failed = err instanceof Error && err.message ? err.message : m.customBot.logsFailed();
    } finally {
      loading = false;
    }
  }

  onMount(load);
</script>

<Sheet title={m.customBot.logsTitle({ name })} {onclose}>
  {#if loading}
    <p class="text-sm" style="color: {$colorStore.muted}" aria-live="polite">{m.common.loading()}</p>
  {:else if failed}
    <p class="text-sm text-red-400" role="alert">{failed}</p>
  {:else if lines.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.customBot.logsEmpty()}</p>
  {:else}
    <pre
      class="text-xs leading-relaxed whitespace-pre-wrap break-all rounded-lg border p-3 max-h-[70vh] overflow-y-auto"
      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20; color: {$colorStore.text};"
    >{lines.join("\n")}</pre>
  {/if}

  {#snippet footer()}
    <button
      type="button"
      class="px-4 rounded-lg min-h-[44px]"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      disabled={loading}
      onclick={load}
    >
      <i class="fa-solid fa-rotate-right mr-2" aria-hidden="true"></i>{m.common.refresh()}
    </button>
  {/snippet}
</Sheet>
