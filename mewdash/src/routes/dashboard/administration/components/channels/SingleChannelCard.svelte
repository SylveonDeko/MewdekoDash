<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi, channelActionsApi, type PurgeFilter } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import NumberField from "../NumberField.svelte";
  import { errorText, purgeFilters, type Named, type Notify } from "../toolsModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    textChannels: Named[];
    notify: Notify;
  }

  type Tool = "clone" | "purge" | "after" | "nuke";

  let { guildId, channels, textChannels, notify }: Props = $props();

  let tool = $state<Tool>("clone");
  let channelId: string | null = $state(null);
  let name = $state("");
  let amount: number | null = $state(100);
  let filter: PurgeFilter = $state("All");
  let keepPinned = $state(true);
  let messageId = $state("");
  let busy = $state(false);

  const tools = $derived<Array<{ id: Tool; label: string; icon: string }>>([
    { id: "clone", label: m.serverTools.toolClone(), icon: "fa-solid fa-clone" },
    { id: "purge", label: m.serverTools.toolPurge(), icon: "fa-solid fa-broom" },
    { id: "after", label: m.serverTools.toolAfter(), icon: "fa-solid fa-eraser" },
    { id: "nuke", label: m.serverTools.toolNuke(), icon: "fa-solid fa-bomb" }
  ]);
  const filters = $derived(purgeFilters());

  const options = $derived(tool === "clone" ? channels : textChannels);
  const channelLabel = $derived(options.find(channel => channel.id === channelId)?.name ?? "");
  const ready = $derived(
    Boolean(channelId) &&
      (tool === "after" ? /^\d{15,21}$/.test(messageId.trim()) : tool === "purge" ? (amount ?? 0) > 0 : true)
  );
  const solid = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const danger = "background: #ef444420; color: #ef4444; border: 1px solid #ef444440;";
  const destructive = $derived(tool !== "clone");

  function tile(on: boolean) {
    return `background: ${on ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: ${on ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: ${$colorStore.text};`;
  }

  function pick(next: Tool) {
    tool = next;
    channelId = null;
  }

  async function run() {
    if (busy || !channelId) return;
    const id = BigInt(channelId);
    const label = tools.find(item => item.id === tool)?.label ?? "";
    if (destructive) {
      const message =
        tool === "nuke"
          ? m.serverTools.nukeConfirm({ channel: channelLabel })
          : tool === "purge"
            ? m.serverTools.purgeConfirm({ count: amount ?? 0, channel: channelLabel })
            : m.serverTools.afterConfirm({ channel: channelLabel });
      const confirmed = await requestConfirmation({ title: label, message, confirmText: label });
      if (!confirmed) return;
    }
    busy = true;
    try {
      if (tool === "clone") {
        await channelActionsApi.clone(guildId, { channelId: id, name: name.trim() || null });
        name = "";
      } else if (tool === "nuke") {
        await channelActionsApi.nuke(guildId, id);
      } else if (tool === "purge") {
        await channelActionsApi.purge(guildId, { channelId: id, amount: amount ?? 0, filter, keepPinned });
      } else {
        await administrationApi.pruneToMessage(guildId, { channelId: id, messageId: BigInt(messageId.trim()) });
        messageId = "";
      }
      notify(m.serverTools.singleDone());
      channelId = null;
    } catch (err) {
      logger.error("Failed to run channel tool:", err);
      notify(errorText(err, m.serverTools.singleFailed()), "error");
    } finally {
      busy = false;
    }
  }
</script>

<PluginCard title={m.serverTools.singleTitle()} alwaysOpen>
  <div class="space-y-4">
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label={m.serverTools.singleToolAria()}>
      {#each tools as item (item.id)}
        <button type="button" class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2" style={tile(tool === item.id)} aria-pressed={tool === item.id} onclick={() => pick(item.id)}>
          <i class={item.icon} aria-hidden="true"></i>{item.label}
        </button>
      {/each}
    </div>

    <DiscordSelector
      type="channel"
      {options}
      selected={channelId}
      placeholder={m.common.selectAChannelPlaceholder()}
      ariaLabel={m.common.selectAChannelPlaceholder()}
      onchange={(detail) => (channelId = typeof detail.selected === "string" ? detail.selected : null)}
    />

    {#if tool === "clone"}
      <input
        type="text"
        bind:value={name}
        maxlength="100"
        placeholder={m.serverTools.cloneNamePlaceholder()}
        aria-label={m.serverTools.cloneNamePlaceholder()}
        class="w-full min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >
    {:else if tool === "purge"}
      <NumberField id="purge-amount" label={m.serverTools.purgeAmount()} value={amount} min={1} max={1000} onchange={(value) => (amount = value)} />
      <DiscordSelector
        type="custom"
        customIcon="fa-filter"
        options={filters}
        selected={filter}
        clearable={false}
        searchable={false}
        ariaLabel={m.serverTools.purgeFilter()}
        onchange={(detail) => (filter = (typeof detail.selected === "string" ? detail.selected : "All") as PurgeFilter)}
      />
      <SettingToggle id="purge-pinned" label={m.serverTools.purgeKeepPinned()} checked={keepPinned} onchange={(on) => (keepPinned = on)} />
    {:else if tool === "after"}
      <input
        type="text"
        inputmode="numeric"
        bind:value={messageId}
        placeholder={m.serverTools.afterMessageId()}
        aria-label={m.serverTools.afterMessageId()}
        class="w-full min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >
    {/if}

    <button
      type="button"
      class="w-full sm:w-auto flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style={destructive ? danger : solid}
      disabled={busy || !ready}
      onclick={run}
    >
      <i class="fa-solid {busy ? 'fa-spinner fa-spin' : (tools.find(item => item.id === tool)?.icon.replace('fa-solid ', '') ?? 'fa-check')}" aria-hidden="true"></i>
      {tools.find(item => item.id === tool)?.label}
    </button>
  </div>
</PluginCard>
