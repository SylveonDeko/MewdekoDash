<script lang="ts">
  import { m } from "$lib/i18n";
  import { chatTriggersApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { DiscordUser } from "$lib/types/discord";

  interface Props {
    guildId: bigint;
    user?: DiscordUser | null;
    onreload: () => Promise<void>;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, user = null, onreload, onerror, onsuccess }: Props = $props();

  let code = $state("");
  let busy = $state(false);
  let fileInput: HTMLInputElement | undefined = $state();

  const userId = $derived(String(user?.id ?? "0"));
  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  async function importCode() {
    if (!code.trim() || busy) return;
    busy = true;
    try {
      await chatTriggersApi.importShareCode(guildId, code.trim(), userId);
      code = "";
      await onreload();
      onsuccess(m.chatTriggers.importDone());
    } catch (err) {
      logger.error("Failed to import share code:", err);
      onerror(err instanceof Error && err.message ? err.message : m.chatTriggers.importFailed());
    } finally {
      busy = false;
    }
  }

  async function importFile(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file || busy) return;
    busy = true;
    try {
      await chatTriggersApi.importTriggers(guildId, await file.text(), userId);
      await onreload();
      onsuccess(m.chatTriggers.importDone());
    } catch (err) {
      logger.error("Failed to import triggers:", err);
      onerror(err instanceof Error && err.message ? err.message : m.chatTriggers.importFailed());
    } finally {
      busy = false;
    }
  }

  async function exportAll() {
    try {
      const { text } = await chatTriggersApi.exportTriggers(guildId);
      const url = URL.createObjectURL(new Blob([text], { type: "text/yaml" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "chat-triggers.yml";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      logger.error("Failed to export triggers:", err);
      onerror(err instanceof Error && err.message ? err.message : m.chatTriggers.exportFailed());
    }
  }
</script>

<PluginCard title={m.chatTriggers.cardTransferTitle()}>
  <SettingField label={m.chatTriggers.importCode()} id="ct-import-code">
    <div class="flex flex-col sm:flex-row gap-3">
      <input
        id="ct-import-code"
        type="text"
        bind:value={code}
        onkeydown={(e) => e.key === "Enter" && importCode()}
        class="grow p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >
      <button type="button" class="flex items-center justify-center gap-2 px-6 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={!code.trim() || busy} onclick={importCode}>
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        {m.common.import()}
      </button>
    </div>
  </SettingField>

  <div class="flex flex-col sm:flex-row gap-3">
    <button type="button" class="flex items-center justify-center gap-2 px-6 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={exportAll}>
      <i class="fa-solid fa-download" aria-hidden="true"></i>
      {m.chatTriggers.exportAll()}
    </button>
    <button type="button" class="flex items-center justify-center gap-2 px-6 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy} onclick={() => fileInput?.click()}>
      <i class="fa-solid fa-upload" aria-hidden="true"></i>
      {m.chatTriggers.importFile()}
    </button>
    <input bind:this={fileInput} type="file" accept=".yml,.yaml,text/yaml,text/plain" class="sr-only" tabindex="-1" aria-hidden="true" onchange={importFile}>
  </div>
</PluginCard>
