<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { channelAccessApi, type ChannelAccessGate } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { channelName, errorText, type Named } from "./channelAccessModel";

  interface Props {
    guildId: bigint;
    gate: ChannelAccessGate;
    channels: Named[];
    onposted: () => void;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, gate, channels, onposted, onerror, onsuccess }: Props = $props();

  let target: string | null = $state(untrack(() => (gate.panelChannelId ? gate.panelChannelId.toString() : null)));
  let busy = $state(false);

  async function post() {
    if (!target) {
      onerror(m.channelAccess.errorPickPanelChannel());
      return;
    }
    busy = true;
    try {
      await channelAccessApi.postPanel(guildId, gate.id, BigInt(target));
      onsuccess(m.channelAccess.notifyPanelPosted());
      onposted();
    } catch (err) {
      logger.error("Failed to post panel:", err);
      onerror(errorText(err, m.channelAccess.errorPostPanel()));
    } finally {
      busy = false;
    }
  }
</script>

<div class="space-y-2">
  <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.channelAccess.panelTitle()}</h4>
  <p class="text-sm" style="color: {$colorStore.muted}">
    {gate.panelChannelId ? m.channelAccess.panelPosted({ channel: channelName(channels, gate.panelChannelId) }) : m.channelAccess.panelNotPosted()}
  </p>
  <div class="flex flex-col sm:flex-row gap-3 sm:items-stretch">
    <div class="grow min-w-0">
      <DiscordSelector
        type="channel"
        options={channels}
        selected={target}
        placeholder={m.channelAccess.panelWhere()}
        ariaLabel={m.channelAccess.panelWhere()}
        onchange={({ selected }) => (target = typeof selected === "string" ? selected : null)}
      />
    </div>
    <button
      type="button"
      class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={busy || !target}
      onclick={post}
    >
      {m.channelAccess.panelPost()}
    </button>
  </div>
</div>
