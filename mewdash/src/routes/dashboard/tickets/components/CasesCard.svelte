<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { ticketApi } from "$lib/api/index.ts";
  import type { Ticket, TicketCase } from "$lib/api/ticket/models";
  import { logger } from "$lib/logger";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import ListRow from "./ListRow.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import CaseSheet from "./CaseSheet.svelte";
  import { errorText, formatDay } from "../ticketModel";

  interface Props {
    guildId: bigint;
    cases: TicketCase[];
    tickets: Ticket[];
    loading: boolean;
    staffId: bigint | null;
    autoSave: AutoSave;
    onreload: () => Promise<void>;
    onticketsreload: () => Promise<void>;
    onerror: (message: string) => void;
  }

  let { guildId, cases, tickets, loading, staffId, autoSave, onreload, onticketsreload, onerror }: Props = $props();

  let openId = $state<number | null>(null);
  let creating = $state(false);
  let title = $state("");
  let description = $state("");
  let saving = $state(false);

  const ordered = $derived([...cases].sort((a, b) => b.id - a.id));

  async function create() {
    if (!title.trim() || !staffId || saving) return;
    saving = true;
    try {
      await ticketApi.createTicketCase(guildId, { title: title.trim(), description: description.trim(), creatorId: staffId });
      creating = false;
      title = "";
      description = "";
      await onreload();
    } catch (err) {
      logger.error("Failed to create ticket case:", err);
      onerror(errorText(err, m.tickets.failedCreateCase()));
    } finally {
      saving = false;
    }
  }

  async function changed() {
    await onreload();
    await onticketsreload();
  }

  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`);
  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
</script>

{#snippet newButton()}
  <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => (creating = true)}>
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.tickets.newCase()}
  </button>
{/snippet}

<PluginCard title={m.tickets.cardCasesTitle()} actions={newButton}>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if cases.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-folder" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p class="font-medium" style="color: {$colorStore.text}">{m.tickets.casesEmpty()}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each ordered as ticketCase (ticketCase.id)}
        <ListRow
          title={ticketCase.title}
          subtitle={ticketCase.linkedTickets === 1
            ? m.tickets.casesCardMetaOne({ id: ticketCase.id, count: 1 })
            : m.tickets.casesCardMetaOther({ id: ticketCase.id, count: ticketCase.linkedTickets })}
          badges={[ticketCase.closedAt ? m.common.closed() : m.common.open(), formatDay(ticketCase.createdAt)]}
          dimmed={!!ticketCase.closedAt}
          onopen={() => (openId = ticketCase.id)}
        />
      {/each}
    </div>
  {/if}
</PluginCard>

{#if creating}
  <Sheet title={m.tickets.newCase()} onclose={() => (creating = false)}>
    <SettingField label={m.common.title()} id="new-case-title" required>
      <input
        id="new-case-title"
        type="text"
        maxlength="100"
        bind:value={title}
        placeholder={m.tickets.casesTitlePlaceholder()}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>
    <SettingField label={m.common.description()} id="new-case-description">
      <textarea
        id="new-case-description"
        rows="3"
        maxlength="1000"
        bind:value={description}
        placeholder={m.tickets.casesDescriptionPlaceholder()}
        class="w-full p-3 rounded-lg border focus:ring-2"
        style={inputStyle}
      ></textarea>
    </SettingField>
    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium" style={buttonStyle} onclick={() => (creating = false)}>{m.common.cancel()}</button>
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[44px] font-medium"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={saving || !title.trim() || !staffId}
        onclick={create}
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        {m.common.create()}
      </button>
    {/snippet}
  </Sheet>
{/if}

{#if openId !== null}
  {#key openId}
    <CaseSheet {guildId} caseId={openId} {tickets} {staffId} {autoSave} onchanged={changed} onclose={() => (openId = null)} {onerror} />
  {/key}
{/if}
