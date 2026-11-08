<script lang="ts">
  import { m } from "$lib/i18n";
  import { confessionsApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { Named } from "./confessionsModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    channelId: string | null;
    logChannelId: string | null;
    prefix: string;
    autoSave: AutoSave;
  }

  let { guildId, channels, channelId = $bindable(), logChannelId = $bindable(), prefix, autoSave }: Props = $props();

  let copied = $state(false);

  const command = $derived(m.confessions.pageHowToCommand({ prefix, guildId: String(guildId) }));

  function pick(selected: unknown): string | null {
    return typeof selected === "string" && selected ? selected : null;
  }

  function saveChannel(value: string | null) {
    const previous = channelId;
    channelId = value;
    void autoSave.now("channel", async () => {
      try {
        await confessionsApi.setConfessionChannel(guildId, BigInt(value ?? 0));
      } catch (err) {
        logger.error("Failed to save the confession channel:", err);
        channelId = previous;
        throw err;
      }
    });
  }

  function saveLogChannel(value: string | null) {
    const previous = logChannelId;
    logChannelId = value;
    void autoSave.now("logChannel", async () => {
      try {
        await confessionsApi.setConfessionLogChannel(guildId, BigInt(value ?? 0));
      } catch (err) {
        logger.error("Failed to save the confession log channel:", err);
        logChannelId = previous;
        throw err;
      }
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch (err) {
      logger.error("Failed to copy the confession command:", err);
    }
  }
</script>

<PluginCard title={m.common.channels()} alwaysOpen>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.common.confessionChannel()} id="confession-channel">
      <DiscordSelector
        id="confession-channel"
        type="channel"
        options={channels}
        selected={channelId}
        placeholder={m.common.noChannelSelected()}
        onchange={({ selected }) => saveChannel(pick(selected))}
      />
    </SettingField>
    <SettingField label={m.confessions.pageConfigLogChannel()} id="confession-log-channel">
      <DiscordSelector
        id="confession-log-channel"
        type="channel"
        options={channels}
        selected={logChannelId}
        placeholder={m.common.noLogChannel()}
        onchange={({ selected }) => saveLogChannel(pick(selected))}
      />
    </SettingField>
  </div>

  <div class="flex flex-wrap items-center gap-2 text-sm" style="color: {$colorStore.muted}">
    <span>{m.confessions.pageHowTo()}</span>
    <code class="px-2 py-1 rounded-sm font-mono break-all" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{command}</code>
    <button
      type="button"
      class="px-4 rounded-lg min-h-[44px]"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      aria-label={m.confessions.pageHowToCopyAria()}
      onclick={copy}
    >
      <i class="fa-solid {copied ? 'fa-check' : 'fa-copy'}" aria-hidden="true"></i>
    </button>
  </div>
</PluginCard>
