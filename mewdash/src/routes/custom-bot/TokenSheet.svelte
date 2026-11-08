<script lang="ts">
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
    ondone: () => void;
  }

  let { userId, instanceId, name, onclose, ondone }: Props = $props();

  let token = $state("");
  let saving = $state(false);
  let failed = $state<string | null>(null);

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!token.trim() || saving) return;
    saving = true;
    failed = null;
    try {
      await customBotsApi.replaceToken(userId, instanceId, token.trim());
      token = "";
      ondone();
    } catch (err) {
      logger.error("Failed to replace custom bot token:", err);
      failed = err instanceof Error && err.message ? err.message : m.customBot.setupFailed();
    } finally {
      saving = false;
    }
  }
</script>

<Sheet title={m.customBot.tokenTitle({ name })} {onclose}>
  <form class="space-y-4" onsubmit={submit}>
    <div>
      <label for="custom-bot-new-token" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
        {m.customBot.setupTokenLabel()}
      </label>
      <input
        id="custom-bot-new-token"
        type="password"
        bind:value={token}
        autocomplete="new-password"
        spellcheck="false"
        class="w-full p-3 rounded-lg border min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >
    </div>
    {#if failed}
      <p class="text-sm text-red-400" role="alert">{failed}</p>
    {/if}
    <button
      type="submit"
      class="px-5 rounded-lg min-h-[50px] font-semibold w-full sm:w-auto disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={saving || !token.trim()}
    >
      {m.customBot.tokenReplace()}
    </button>
  </form>
</Sheet>
