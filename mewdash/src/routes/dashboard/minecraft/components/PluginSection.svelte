<script lang="ts">
  import { m } from "$lib/i18n";
  import { minecraftApi, type MinecraftServer } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { Notify } from "./minecraftModel";

  interface Props {
    guildId: bigint;
    server: MinecraftServer;
    notify: Notify;
    onupdate: (server: MinecraftServer) => void;
  }

  let { guildId, server, notify, onupdate }: Props = $props();

  let pluginKey: string | null = $state(null);
  let busy = $state(false);

  const wsUrl = $derived.by(() => {
    if (!$currentInstance?.port) return "ws://localhost:5001/botapi/mc-bridge/ws";
    const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `ws://${host}:${$currentInstance.port}/botapi/mc-bridge/ws`;
  });

  async function generate() {
    if (busy) return;
    if (server.hasPluginKey) {
      const confirmed = await requestConfirmation({ message: m.minecraft.confirmReplaceKey(), confirmText: m.minecraft.confirmReplaceButton() });
      if (!confirmed) return;
    }
    busy = true;
    try {
      const result = await minecraftApi.generatePluginKey(guildId, server.name);
      pluginKey = result.key;
      onupdate({ ...server, hasPluginKey: true });
      notify(m.minecraft.notifyKeyGenerated());
    } catch (err) {
      logger.error("Failed to generate the plugin key:", err);
      notify(m.minecraft.notifyKeyGenerateFailed(), "error");
    } finally {
      busy = false;
    }
  }

  async function revoke() {
    if (busy) return;
    const confirmed = await requestConfirmation({ message: m.minecraft.confirmRevokeKey(), confirmText: m.minecraft.confirmRevokeButton() });
    if (!confirmed) return;
    busy = true;
    try {
      await minecraftApi.revokePluginKey(guildId, server.name);
      pluginKey = null;
      onupdate({ ...server, hasPluginKey: false });
      notify(m.minecraft.notifyKeyRevoked());
    } catch (err) {
      logger.error("Failed to revoke the plugin key:", err);
      notify(m.minecraft.notifyKeyRevokeFailed(), "error");
    } finally {
      busy = false;
    }
  }

  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      notify(message);
    } catch (err) {
      logger.error("Failed to copy:", err);
    }
  }
</script>

{#snippet copyRow(label: string, value: string, aria: string, done: string)}
  <div class="min-w-0">
    <span class="block text-xs font-medium mb-1" style="color: {$colorStore.muted}">{label}</span>
    <div class="flex items-center gap-2">
      <code class="grow min-w-0 text-xs p-2 rounded break-all" style="background: {$colorStore.primary}10; color: {$colorStore.text};">{value}</code>
      <button
        type="button"
        class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
        style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
        aria-label={aria}
        onclick={() => copy(value, done)}
      >
        <i class="fa-solid fa-copy" aria-hidden="true"></i>
      </button>
    </div>
  </div>
{/snippet}

<PluginCard title={m.minecraft.pluginTitle()} alwaysOpen>
  {#if pluginKey}
    <div class="p-3 rounded-xl space-y-3" style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;">
      <p class="text-sm" style="color: {$colorStore.text}">{m.minecraft.pluginCopyHint()}</p>
      {@render copyRow("api-key:", pluginKey, m.minecraft.ariaCopyApiKey(), m.minecraft.notifyKeyCopied())}
      {@render copyRow("api-url:", wsUrl, m.minecraft.ariaCopyApiUrl(), m.minecraft.notifyUrlCopied())}
    </div>
  {/if}

  <div class="flex flex-wrap items-center gap-2">
    <button
      type="button"
      class="flex items-center gap-2 px-4 rounded-lg min-h-[44px] text-sm font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={busy}
      onclick={generate}
    >
      <i class="fa-solid fa-key" aria-hidden="true"></i>
      {server.hasPluginKey ? m.minecraft.pluginRegenerate() : m.minecraft.pluginGenerate()}
    </button>
    {#if server.hasPluginKey}
      <button
        type="button"
        class="flex items-center gap-2 px-4 rounded-lg min-h-[44px] text-sm font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
        disabled={busy}
        onclick={revoke}
      >
        <i class="fa-solid fa-ban" aria-hidden="true"></i>
        {m.minecraft.pluginRevoke()}
      </button>
    {/if}
    <span class="text-sm" style="color: {$colorStore.muted}">{server.hasPluginKey ? m.minecraft.pluginKeyActive() : m.minecraft.pluginKeyNone()}</span>
  </div>
</PluginCard>
