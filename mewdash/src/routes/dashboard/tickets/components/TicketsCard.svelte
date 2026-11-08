<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { Ticket, TicketPriority, TicketTag } from "$lib/api/ticket/models";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ListRow from "./ListRow.svelte";
  import TicketSheet from "./TicketSheet.svelte";
  import { formatDay, stateLabel, ticketState, type MenuItem } from "../ticketModel";

  interface Props {
    guildId: bigint;
    tickets: Ticket[];
    loading: boolean;
    priorities: TicketPriority[];
    tags: TicketTag[];
    cases: Array<{ id: number; title: string }>;
    staffId: bigint | null;
    onreload: () => Promise<void>;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, tickets, loading, priorities, tags, cases, staffId, onreload, onerror, onsuccess }: Props = $props();

  const ALL = "*";
  const PAGE = 40;

  let search = $state("");
  let statusFilter = $state("open");
  let priorityFilter = $state(ALL);
  let showFilters = $state(false);
  let limit = $state(PAGE);
  let openId = $state<number | null>(null);

  const statusOptions = $derived([
    { id: "open", name: m.common.open() },
    { id: "closed", name: m.common.closed() },
    { id: "archived", name: m.tickets.stateArchived() },
    { id: ALL, name: m.common.all() }
  ]);

  const priorityOptions = $derived([
    { id: ALL, name: m.tickets.anyPriority() },
    ...priorities.map(p => ({ id: p.priorityId, name: `${p.emoji ?? ""} ${p.name}`.trim() }))
  ]);

  const visible = $derived.by(() => {
    const needle = search.trim().toLowerCase();
    return tickets
      .filter(t => !t.isDeleted)
      .filter(t => {
        const state = ticketState(t);
        if (statusFilter === "open") return state === "open" || state === "claimed";
        if (statusFilter === ALL) return true;
        return state === statusFilter;
      })
      .filter(t => priorityFilter === ALL || t.priority === priorityFilter)
      .filter(
        t =>
          !needle ||
          String(t.id).includes(needle) ||
          (t.creatorName ?? "").toLowerCase().includes(needle) ||
          String(t.creatorId).includes(needle) ||
          (t.channelName ?? "").toLowerCase().includes(needle) ||
          (t.claimedByName ?? "").toLowerCase().includes(needle) ||
          (t.buttonLabel ?? t.optionLabel ?? "").toLowerCase().includes(needle) ||
          (t.tags ?? []).some(tag => tag.toLowerCase().includes(needle))
      )
      .sort((a, b) => new Date(b.lastActivityAt ?? b.createdAt).getTime() - new Date(a.lastActivityAt ?? a.createdAt).getTime());
  });

  const shown = $derived(visible.slice(0, limit));
  const activeFilters = $derived([statusFilter !== "open", priorityFilter !== ALL].filter(Boolean).length);
  const opened = $derived(tickets.find(t => t.id === openId) ?? null);

  function priorityName(id: string | null): string | null {
    if (!id) return null;
    const p = priorities.find(x => x.priorityId === id);
    return p ? `${p.emoji ?? ""} ${p.name}`.trim() : id;
  }

  function badges(ticket: Ticket): string[] {
    const list = [stateLabel(ticketState(ticket))];
    const priority = priorityName(ticket.priority);
    if (priority) list.push(priority);
    if (ticket.claimedBy) list.push(m.tickets.claimedBy({ user: ticket.claimedByName ?? String(ticket.claimedBy) }));
    for (const tag of (ticket.tags ?? []).slice(0, 3)) list.push(tags.find(t => t.tagId === tag)?.name ?? tag);
    return list;
  }

  function menuFor(ticket: Ticket): MenuItem[] {
    return [
      { label: m.tickets.viewTicket(), icon: "fa-eye", onclick: () => (openId = ticket.id) },
      { label: m.tickets.viewTranscript(), icon: "fa-file-lines", onclick: () => window.open(ticket.transcriptUrl!, "_blank", "noopener"), hidden: !ticket.transcriptUrl }
    ];
  }

  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`);
  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
</script>

<PluginCard title={m.features.ticketsName()}>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if tickets.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-ticket" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p class="font-medium" style="color: {$colorStore.text}">{m.tickets.ticketsEmpty()}</p>
    </div>
  {:else}
    <div class="space-y-3">
      <div class="flex gap-3">
        <input
          type="search"
          bind:value={search}
          oninput={() => (limit = PAGE)}
          placeholder={m.tickets.searchPlaceholder()}
          aria-label={m.tickets.searchAria()}
          class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
        <button
          type="button"
          class="shrink-0 flex items-center justify-center gap-2 px-4 rounded-lg min-h-[50px] min-w-[50px] sm:hidden"
          style={buttonStyle}
          aria-expanded={showFilters}
          aria-label={m.common.filters()}
          onclick={() => (showFilters = !showFilters)}
        >
          <i class="fa-solid fa-filter" aria-hidden="true"></i>
          {#if activeFilters > 0}<span class="text-sm">{activeFilters}</span>{/if}
        </button>
        <div class="hidden sm:grid grid-cols-2 gap-3 w-96 shrink-0">
          <DiscordSelector type="custom" options={statusOptions} selected={statusFilter} searchable={false} clearable={false} customIcon="fa-circle-check" ariaLabel={m.common.status()} onchange={(d) => typeof d.selected === "string" && ((statusFilter = d.selected), (limit = PAGE))} />
          <DiscordSelector type="custom" options={priorityOptions} selected={priorityFilter} searchable={false} clearable={false} customIcon="fa-flag" ariaLabel={m.common.priority()} onchange={(d) => typeof d.selected === "string" && ((priorityFilter = d.selected), (limit = PAGE))} />
        </div>
      </div>
      {#if showFilters}
        <div class="grid grid-cols-1 gap-3 sm:hidden">
          <DiscordSelector type="custom" options={statusOptions} selected={statusFilter} searchable={false} clearable={false} customIcon="fa-circle-check" ariaLabel={m.common.status()} onchange={(d) => typeof d.selected === "string" && ((statusFilter = d.selected), (limit = PAGE))} />
          <DiscordSelector type="custom" options={priorityOptions} selected={priorityFilter} searchable={false} clearable={false} customIcon="fa-flag" ariaLabel={m.common.priority()} onchange={(d) => typeof d.selected === "string" && ((priorityFilter = d.selected), (limit = PAGE))} />
        </div>
      {/if}

      {#if visible.length === 0}
        <p class="py-6 text-center" style="color: {$colorStore.muted}">{m.tickets.noMatches()}</p>
      {:else}
        <div class="space-y-2">
          {#each shown as ticket (ticket.id)}
            <ListRow
              title={m.tickets.ticketTitle({ id: ticket.id, name: ticket.buttonLabel ?? ticket.optionLabel ?? ticket.channelName ?? "" })}
              subtitle={m.tickets.ticketMeta({ user: ticket.creatorName ?? String(ticket.creatorId), date: formatDay(ticket.createdAt) })}
              badges={badges(ticket)}
              onopen={() => (openId = ticket.id)}
              menu={menuFor(ticket)}
              menuLabel={m.tickets.rowMoreAria({ name: `#${ticket.id}` })}
            />
          {/each}
        </div>
        {#if visible.length > shown.length}
          <button type="button" class="w-full sm:w-auto px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => (limit += PAGE)}>
            {m.tickets.showMore({ count: visible.length - shown.length })}
          </button>
        {/if}
      {/if}
    </div>
  {/if}
</PluginCard>

{#if opened}
  {#key opened.id}
    <TicketSheet
      {guildId}
      ticket={opened}
      {priorities}
      {tags}
      {cases}
      {staffId}
      onchanged={onreload}
      onclose={() => (openId = null)}
      {onerror}
      {onsuccess}
    />
  {/key}
{/if}
