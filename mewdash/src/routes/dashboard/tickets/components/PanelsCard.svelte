<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { ticketApi } from "$lib/api/index.ts";
  import type { TicketPanel, TicketPriority } from "$lib/api/ticket/models";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import ListRow from "./ListRow.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import PanelEditor from "./PanelEditor.svelte";
  import { errorText, idOrNull, panelTitle, type Named } from "../ticketModel";

  interface Props {
    guildId: bigint;
    panels: TicketPanel[];
    loading: boolean;
    channels: Named[];
    categories: Named[];
    threadChannels: Named[];
    roles: Named[];
    emojis: GuildEmojiInfo[];
    priorities: TicketPriority[];
    user?: DiscordUser | null;
    autoSave: AutoSave;
    onreload: () => Promise<void>;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, panels = $bindable(), loading, channels, categories, threadChannels, roles, emojis, priorities, user = null, autoSave, onreload: reloadPanels, onerror, onsuccess }: Props = $props();

  let editingId = $state<string | null>(null);
  let creating = $state(false);
  let newChannel = $state<string | null>(null);
  let saving = $state(false);
  let statuses = $state<Record<string, number>>({});

  const editing = $derived(panels.find(p => String(p.messageId) === editingId) ?? null);

  let checked = false;

  async function checkStatus() {
    try {
      const list = await ticketApi.getPanelStatus(guildId);
      const next: Record<string, number> = {};
      for (const item of list as unknown as Array<{ panelId: bigint; status: number | string }>) {
        const state = typeof item.status === "number" ? item.status : ["OK", "MessageMissing", "ChannelDeleted"].indexOf(item.status);
        next[String(item.panelId)] = state;
      }
      statuses = next;
    } catch (err) {
      logger.error("Failed to check panel status:", err);
    }
  }

  async function reload() {
    await reloadPanels();
    await checkStatus();
  }

  $effect(() => {
    if (loading || checked) return;
    checked = true;
    void checkStatus();
  });

  function change(patch: Partial<TicketPanel>) {
    const id = editingId;
    panels = panels.map(p => (String(p.messageId) === id ? { ...p, ...patch } : p));
  }

  async function create() {
    if (!newChannel || saving) return;
    saving = true;
    try {
      await ticketApi.createTicketPanel(guildId, { channelId: BigInt(newChannel) });
      creating = false;
      newChannel = null;
      await reload();
      const latest = panels[panels.length - 1];
      if (latest) editingId = String(latest.messageId);
    } catch (err) {
      logger.error("Failed to create ticket panel:", err);
      onerror(errorText(err, m.tickets.createPanelFailed()));
    } finally {
      saving = false;
    }
  }

  async function recreate(panel: TicketPanel) {
    try {
      await ticketApi.recreateTicketPanel(guildId, panel.messageId);
      await reload();
      onsuccess(m.tickets.panelRecreated());
    } catch (err) {
      logger.error("Failed to recreate ticket panel:", err);
      onerror(errorText(err, m.tickets.panelRecreateFailed()));
    }
  }

  async function recreateAll() {
    try {
      const result = await ticketApi.recreateAllPanels(guildId);
      await reload();
      if (result.failed > 0 && result.errors.length > 0) onerror(result.errors[0]);
      else onsuccess(m.tickets.panelsRecreated({ count: result.recreated }));
    } catch (err) {
      logger.error("Failed to recreate ticket panels:", err);
      onerror(errorText(err, m.tickets.panelRecreateFailed()));
    }
  }

  async function remove(panel: TicketPanel) {
    const ok = await requestConfirmation({ message: m.tickets.deletePanelConfirm(), confirmText: m.common.delete() });
    if (!ok) return;
    try {
      await ticketApi.deleteTicketPanel(guildId, panel.messageId, false);
    } catch (err) {
      const body = (err as { body?: { activeTickets?: unknown[]; ActiveTickets?: unknown[] } }).body;
      const active = body && typeof body === "object" ? (body.activeTickets ?? body.ActiveTickets ?? []) : [];
      if (active.length === 0) {
        logger.error("Failed to delete ticket panel:", err);
        onerror(errorText(err, m.tickets.deletePanelFailed()));
        return;
      }
      const force = await requestConfirmation({ message: m.tickets.deletePanelActive({ count: active.length }), confirmText: m.tickets.deleteAnyway() });
      if (!force) return;
      try {
        await ticketApi.deleteTicketPanel(guildId, panel.messageId, true);
      } catch (inner) {
        logger.error("Failed to force delete ticket panel:", inner);
        onerror(errorText(inner, m.tickets.deletePanelFailed()));
        return;
      }
    }
    await reload();
  }

  function counts(panel: TicketPanel): string {
    return `#${panel.channelName} · ${m.tickets.componentCounts({ buttons: panel.buttonCount, menus: panel.selectMenuCount })}`;
  }

  function problem(panel: TicketPanel): string[] {
    const state = statuses[String(panel.messageId)];
    if (state === 1) return [m.tickets.badgeMessageMissing()];
    if (state === 2) return [m.tickets.badgeChannelMissing()];
    return [];
  }

  const missing = $derived(Object.values(statuses).some(state => state === 1));

  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`);
</script>

{#snippet newButton()}
  <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => (creating = true)}>
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.tickets.newPanel()}
  </button>
{/snippet}

<PluginCard title={m.tickets.cardPanelsTitle()} actions={newButton}>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if panels.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-ticket" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p class="font-medium" style="color: {$colorStore.text}">{m.tickets.panelsEmpty()}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each panels as panel (panel.messageId)}
        <ListRow
          title={panelTitle(panel.embedJson) || `#${panel.channelName}`}
          subtitle={counts(panel)}
          badges={problem(panel)}
          onopen={() => (editingId = String(panel.messageId))}
          menu={[
            { label: m.common.edit(), icon: "fa-pen", onclick: () => (editingId = String(panel.messageId)) },
            { label: m.tickets.recreate(), icon: "fa-arrows-rotate", onclick: () => recreate(panel) },
            { label: m.common.delete(), icon: "fa-trash", onclick: () => remove(panel) }
          ]}
          menuLabel={m.tickets.rowMoreAria({ name: panelTitle(panel.embedJson) || panel.channelName })}
        />
      {/each}
    </div>
    {#if missing}
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium w-full sm:w-auto" style={buttonStyle} onclick={recreateAll}>
        {m.tickets.recreateAll()}
      </button>
    {/if}
  {/if}
</PluginCard>

{#if creating}
  <Sheet title={m.tickets.newPanel()} onclose={() => (creating = false)}>
    <SettingField label={m.common.channel()} id="new-panel-channel">
      <DiscordSelector id="new-panel-channel" type="channel" options={channels} selected={newChannel} placeholder={m.common.selectChannelPlaceholder()} onchange={(d) => (newChannel = idOrNull(d.selected))} />
    </SettingField>
    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium" style={buttonStyle} onclick={() => (creating = false)}>{m.common.cancel()}</button>
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[44px] font-medium"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={saving || !newChannel}
        onclick={create}
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        {m.common.create()}
      </button>
    {/snippet}
  </Sheet>
{/if}

{#if editing}
  {#key editingId}
    <PanelEditor
      {guildId}
      panel={editing}
      {channels}
      {categories}
      {threadChannels}
      {roles}
      {emojis}
      {priorities}
      {user}
      {autoSave}
      onpanelchange={change}
      onreload={reload}
      onclose={() => (editingId = null)}
      {onerror}
      {onsuccess}
    />
  {/key}
{/if}
