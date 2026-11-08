<script lang="ts">
  import { m } from "$lib/i18n";
  import { countingApi, type CountingChannelResponse } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "./NumberField.svelte";
  import { formatNumber, idString, type Named, type Notify } from "./countingModel";

  interface Props {
    guildId: bigint;
    textChannels: Named[];
    channels: CountingChannelResponse[];
    selectedId: string | null;
    notify: Notify;
    onopen: (channelId: string) => void;
    onchanged: () => Promise<void>;
  }

  let { guildId, textChannels, channels, selectedId, notify, onopen, onchanged }: Props = $props();

  let pickedChannel = $state<string | null>(null);
  let startNumber = $state(1);
  let increment = $state(1);
  let creating = $state(false);

  const freeChannels = $derived(
    textChannels.filter((c) => !channels.some((x) => idString(x.channelId) === c.id))
  );

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  function statusOf(channel: CountingChannelResponse): { color: string; text: string } {
    if (!channel.isActive) return { color: "#ef4444", text: m.common.inactive() };
    if (channel.currentNumber === channel.highestNumber) return { color: "#22c55e", text: m.counting.statusRecordHigh() };
    return { color: "#3b82f6", text: m.common.active() };
  }

  async function setup() {
    if (!pickedChannel || creating) return;
    const id = pickedChannel;
    creating = true;
    try {
      await countingApi.setupCountingChannel(guildId, BigInt(id), { startNumber, increment });
      pickedChannel = null;
      startNumber = 1;
      increment = 1;
      notify(m.counting.notifyChannelSetup());
      await onchanged();
      onopen(id);
    } catch (err) {
      logger.error("Failed to set up a counting channel:", err);
      notify(m.counting.notifyChannelSetupFailed(), "error");
    } finally {
      creating = false;
    }
  }

  async function disable(channel: CountingChannelResponse) {
    const confirmed = await requestConfirmation({
      title: m.counting.confirmDisableTitle(),
      message: m.counting.confirmDisableMessage({ name: channel.channelName ?? "" }),
      confirmText: m.counting.channelDisable(),
      variant: "danger"
    });
    if (!confirmed) return;
    try {
      await countingApi.removeCountingChannel(guildId, channel.channelId);
      notify(m.counting.notifyChannelDisabled());
      await onchanged();
    } catch (err) {
      logger.error("Failed to disable a counting channel:", err);
      notify(m.counting.notifyDisableFailed(), "error");
    }
  }
</script>

<div class="space-y-4 min-w-0">
  <PluginCard title={m.counting.setupTitle()} alwaysOpen>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="sm:col-span-2">
        <DiscordSelector
          type="channel"
          options={freeChannels}
          selected={pickedChannel}
          placeholder={m.common.selectAChannelPlaceholder()}
          ariaLabel={m.common.channel()}
          onchange={({ selected }) => (pickedChannel = (selected as string) ?? null)}
        />
      </div>
      <NumberField
        id="counting-start"
        label={m.counting.setupStartNumber()}
        value={startNumber}
        min={0}
        onchange={(value) => (startNumber = value ?? 0)}
      />
      <NumberField
        id="counting-increment"
        label={m.counting.setupIncrement()}
        value={increment}
        min={1}
        onchange={(value) => (increment = value ?? 1)}
      />
    </div>
    <button
      type="button"
      class="w-full sm:w-auto px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={!pickedChannel || creating}
      onclick={setup}
    >
      {m.counting.setupButton()}
    </button>
  </PluginCard>

  {#if channels.length === 0}
    <p class="text-sm px-1" style="color: {$colorStore.muted}">{m.counting.channelsEmptyTitle()}</p>
  {/if}

  {#each channels as channel (idString(channel.channelId))}
    {@const status = statusOf(channel)}
    {@const selected = idString(channel.channelId) === selectedId}
    <div
      class="rounded-xl border p-4 space-y-3 min-w-0"
      style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`};"
    >
      <div class="flex flex-wrap items-center gap-2 min-w-0">
        <h4 class="text-sm font-medium truncate" style="color: {$colorStore.text}">#{channel.channelName ?? idString(channel.channelId)}</h4>
        <span class="text-xs px-2 py-1 rounded-lg" style="background: {status.color}20; color: {$colorStore.text};">{status.text}</span>
      </div>
      <dl class="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt class="text-xs" style="color: {$colorStore.muted}">{m.common.current()}</dt>
          <dd class="font-semibold tabular-nums" style="color: {$colorStore.text}">{formatNumber(channel.currentNumber)}</dd>
        </div>
        <div>
          <dt class="text-xs" style="color: {$colorStore.muted}">{m.counting.channelHighest()}</dt>
          <dd class="font-semibold tabular-nums" style="color: {$colorStore.text}">{formatNumber(channel.highestNumber)}</dd>
        </div>
        {#if channel.lastUsername}
          <div class="col-span-2 min-w-0">
            <dt class="text-xs" style="color: {$colorStore.muted}">{m.counting.channelLastBy()}</dt>
            <dd class="truncate" style="color: {$colorStore.text}">{channel.lastUsername}</dd>
          </div>
        {/if}
      </dl>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={iconButton} onclick={() => onopen(idString(channel.channelId))}>
          <i class="fa-solid fa-gear mr-2" aria-hidden="true"></i>{m.common.settings()}
        </button>
        <button
          type="button"
          class="px-4 rounded-lg min-h-[44px] text-sm font-medium"
          style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
          onclick={() => disable(channel)}
        >
          {m.counting.channelDisable()}
        </button>
      </div>
    </div>
  {/each}
</div>
