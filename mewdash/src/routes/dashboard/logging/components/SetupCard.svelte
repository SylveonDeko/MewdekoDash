<script lang="ts">
  import { m } from "$lib/i18n";
  import { loggingApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { errorText } from "./loggingModel";

  interface Props {
    guildId: bigint;
    configured: boolean;
    onchanged: () => Promise<void>;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, configured, onchanged, onerror, onsuccess }: Props = $props();

  let busy = $state(false);
  let creating = $state(false);
  let sheet: "export" | "import" | null = $state(null);
  let code = $state("");
  let pasted = $state("");

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  async function setup() {
    if (
      configured &&
      !(await requestConfirmation({
        title: m.logging.setupConfirmTitle(),
        message: m.logging.setupConfirmMessage(),
        confirmText: m.logging.setupConfirm()
      }))
    )
      return;
    busy = creating = true;
    try {
      await loggingApi.setupLogging(guildId);
      await onchanged();
      onsuccess(m.logging.notifySetup());
    } catch (err) {
      logger.error("Failed to set up logging:", err);
      onerror(errorText(err, m.logging.errorSetup()));
    } finally {
      busy = creating = false;
    }
  }

  async function openExport() {
    busy = true;
    try {
      const result = await loggingApi.exportConfig(guildId);
      if (result.empty || !result.code) {
        onerror(m.logging.exportEmpty());
        return;
      }
      code = result.code;
      sheet = "export";
    } catch (err) {
      logger.error("Failed to export logging:", err);
      onerror(errorText(err, m.logging.errorExport()));
    } finally {
      busy = false;
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      onsuccess(m.common.copied());
    } catch (err) {
      logger.error("Failed to copy export code:", err);
    }
  }

  async function runImport() {
    if (!pasted.trim()) return;
    busy = true;
    try {
      const result = await loggingApi.importConfig(guildId, pasted.trim());
      await onchanged();
      sheet = null;
      pasted = "";
      onsuccess(m.logging.notifyImported({ count: result.applied }));
    } catch (err) {
      logger.error("Failed to import logging:", err);
      onerror(errorText(err, m.logging.errorImport()));
    } finally {
      busy = false;
    }
  }
</script>

<PluginCard title={m.logging.setupTitle()} alwaysOpen>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={buttonStyle} disabled={busy} onclick={setup}>
      <i class="fa-solid {creating ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}" aria-hidden="true"></i>{creating ? m.common.creating() : m.logging.createChannels()}
    </button>
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={buttonStyle} disabled={busy} onclick={openExport}>
      <i class="fa-solid fa-file-export" aria-hidden="true"></i>{m.logging.exportAction()}
    </button>
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={buttonStyle} disabled={busy} onclick={() => (sheet = "import")}>
      <i class="fa-solid fa-file-import" aria-hidden="true"></i>{m.common.import()}
    </button>
  </div>
</PluginCard>

{#if sheet === "export"}
  <Sheet title={m.logging.exportAction()} onclose={() => (sheet = null)}>
    <textarea
      readonly
      rows="4"
      aria-label={m.logging.exportCode()}
      value={code}
      class="w-full p-3 rounded-lg border font-mono text-sm break-all"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    ></textarea>
    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={copy}>{m.common.copyToClipboard()}</button>
    {/snippet}
  </Sheet>
{:else if sheet === "import"}
  <Sheet title={m.common.import()} onclose={() => (sheet = null)}>
    <textarea
      rows="4"
      aria-label={m.logging.exportCode()}
      bind:value={pasted}
      placeholder={m.logging.importPlaceholder()}
      class="w-full p-3 rounded-lg border font-mono text-sm break-all"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    ></textarea>
    {#snippet footer()}
      <button
        type="button"
        class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={busy || !pasted.trim()}
        onclick={runImport}
      >
        {m.common.import()}
      </button>
    {/snippet}
  </Sheet>
{/if}
