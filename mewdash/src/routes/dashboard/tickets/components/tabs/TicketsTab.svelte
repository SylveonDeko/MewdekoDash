<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { ticketApi, type Ticket } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  interface Props {
    allTickets: Ticket[];
    priorities: any[];
    tags: any[];
    staffId: bigint | null;
    showConfirm: (title: string, message: string, action: () => void, variant?: "danger" | "warning" | "info") => void;
    reloadTickets: () => Promise<void>;
  }

  let { allTickets, priorities, tags, staffId, showConfirm, reloadTickets }: Props = $props();

  type StatusFilter = "open" | "closed" | "archived" | "all";
  let statusFilter = $state<StatusFilter>("open");
  let search = $state("");
  let expandedId = $state<number | null>(null);
  let busy = $state(false);
  let noteDraft = $state("");
  let closeReason = $state("");
  let tagPick = $state<string | null>(null);
  let actionError = $state("");

  const statusOptions: Array<{ id: StatusFilter; name: string }> = [
    { id: "open", name: "Open" },
    { id: "closed", name: "Closed" },
    { id: "archived", name: "Archived" },
    { id: "all", name: "All" }
  ];

  let filtered = $derived.by(() => {
    const term = search.trim().toLowerCase();
    return allTickets
      .filter(t => !t.isDeleted)
      .filter(t => {
        if (statusFilter === "open") return !t.closedAt && !t.isArchived;
        if (statusFilter === "closed") return Boolean(t.closedAt) && !t.isArchived;
        if (statusFilter === "archived") return t.isArchived;
        return true;
      })
      .filter(t => !term
        || t.id.toString().includes(term)
        || t.creatorId.toString().includes(term)
        || t.channelId.toString().includes(term)
        || (t.claimedBy?.toString() ?? "").includes(term)
        || (t.tags ?? []).some(tag => tag.toLowerCase().includes(term)))
      .sort((a, b) => new Date(b.lastActivityAt ?? b.createdAt).getTime() - new Date(a.lastActivityAt ?? a.createdAt).getTime());
  });

  let priorityOptions = $derived(priorities.map(p => ({ id: p.priorityId, name: `${p.emoji ?? ""} ${p.name}`.trim() })));
  let tagOptions = $derived(tags.map(t => ({ id: t.tagId, name: t.name })));

  function priorityLabel(id: string | null): string {
    if (!id) return "No priority";
    const p = priorities.find(x => x.priorityId === id);
    return p ? `${p.emoji ?? ""} ${p.name}`.trim() : id;
  }

  function tagName(id: string): string {
    return tags.find(t => t.tagId === id)?.name ?? id;
  }

  function status(t: Ticket): { label: string; color: string } {
    if (t.isArchived) return { label: "Archived", color: $colorStore.muted };
    if (t.closedAt) return { label: "Closed", color: "#ef4444" };
    if (t.claimedBy) return { label: "Claimed", color: $colorStore.secondary };
    return { label: "Open", color: "#10b981" };
  }

  function toggle(id: number) {
    expandedId = expandedId === id ? null : id;
    noteDraft = "";
    closeReason = "";
    tagPick = null;
    actionError = "";
  }

  async function run(action: () => Promise<unknown>, failure: string) {
    busy = true;
    actionError = "";
    try {
      await action();
      await reloadTickets();
    } catch (err) {
      logger.error(failure, err);
      actionError = failure;
    } finally {
      busy = false;
    }
  }

  function claim(t: Ticket) {
    if (!$currentGuild?.id || !staffId) return;
    run(() => ticketApi.claimTicket($currentGuild!.id, t.channelId, { staffId }), "Failed to claim ticket");
  }

  function unclaim(t: Ticket) {
    if (!$currentGuild?.id) return;
    run(() => ticketApi.unclaimTicket($currentGuild!.id, t.channelId), "Failed to unclaim ticket");
  }

  function close(t: Ticket) {
    if (!$currentGuild?.id) return;
    showConfirm("Close ticket", `Close ticket #${t.id}? The channel is closed for the member.`, () => {
      run(() => ticketApi.closeTicket($currentGuild!.id, t.channelId, closeReason.trim() || undefined), "Failed to close ticket");
    }, "warning");
  }

  function archive(t: Ticket) {
    if (!$currentGuild?.id) return;
    showConfirm("Archive ticket", `Archive ticket #${t.id}? It moves out of the active list.`, () => {
      run(() => ticketApi.archiveTicket($currentGuild!.id, t.id), "Failed to archive ticket");
    }, "info");
  }

  function setPriority(t: Ticket, priorityId: string | null) {
    if (!$currentGuild?.id || !staffId || !priorityId) return;
    run(() => ticketApi.setTicketPriority($currentGuild!.id, t.channelId, { priorityId, staffId }), "Failed to set priority");
  }

  function addTag(t: Ticket, tagId: string | null) {
    if (!$currentGuild?.id || !staffId || !tagId) return;
    run(() => ticketApi.addTicketTags($currentGuild!.id, t.channelId, { tagIds: [tagId], staffId }), "Failed to add tag");
  }

  function removeTag(t: Ticket, tagId: string) {
    if (!$currentGuild?.id || !staffId) return;
    run(() => ticketApi.removeTicketTags($currentGuild!.id, t.channelId, { tagIds: [tagId], staffId }), "Failed to remove tag");
  }

  function addNote(t: Ticket) {
    if (!$currentGuild?.id || !noteDraft.trim()) return;
    const text = noteDraft.trim();
    run(async () => {
      await ticketApi.addTicketNotes($currentGuild!.id, t.channelId, text);
      noteDraft = "";
    }, "Failed to add note");
  }

  function formatDate(value: string | null): string {
    return value ? new Date(value).toLocaleString() : "";
  }
</script>

<div class="space-y-6" in:fade={{ duration: 200 }}>
  <div class=" rounded-2xl border p-6 shadow-2xl transition-all"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30;">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-4">
        <div class="p-3 rounded-xl" style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <i class="fa-utility-duo fa-regular fa-ticket" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
        </div>
        <div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Tickets ({filtered.length})</h2>
          <p class="text-sm" style="color: {$colorStore.muted}">Claim, prioritise, tag, and close tickets without leaving the dashboard</p>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
        <div class="relative flex-1 lg:w-72">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2" style="color: {$colorStore.muted}; font-size: 14px;"></i>
          <input type="text" bind:value={search} placeholder="Ticket, user, channel, or tag" aria-label="Search tickets"
                 class="w-full pl-9 pr-3 py-3 rounded-lg border min-h-[44px]"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
        </div>
        <div class="w-full sm:w-40">
          <DiscordSelector type="custom" options={statusOptions} selected={statusFilter} searchable={false} ariaLabel="Ticket status"
                           onchange={(e) => { if (typeof e.selected === "string") statusFilter = e.selected as StatusFilter; }} />
        </div>
      </div>
    </div>

    {#if filtered.length === 0}
      <div class="text-center py-8">
        <i class="fa-utility-duo fa-regular fa-ticket" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
        <p class="text-lg font-medium" style="color: {$colorStore.text}">No tickets here</p>
        <p class="text-sm" style="color: {$colorStore.muted}">Try another status filter or search term.</p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each filtered as ticket (ticket.id)}
          {@const s = status(ticket)}
          <div class="rounded-xl border transition-all" style="background: {$colorStore.primary}05; border-color: {expandedId === ticket.id ? $colorStore.primary + '40' : $colorStore.primary + '20'};">
            <button class="w-full text-left p-4 flex items-start gap-4" onclick={() => toggle(ticket.id)} aria-expanded={expandedId === ticket.id}>
              <span class="px-2 py-1 rounded-sm text-xs font-semibold shrink-0" style="background: {s.color}20; color: {s.color};">{s.label}</span>
              <div class="flex-1 min-w-0">
                <div class="font-semibold" style="color: {$colorStore.text}">
                  Ticket #{ticket.id}
                  {#if ticket.priority}
                    <span class="ml-2 text-xs font-normal px-2 py-0.5 rounded-full" style="background: {$colorStore.accent}20; color: {$colorStore.accent};">{priorityLabel(ticket.priority)}</span>
                  {/if}
                </div>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mt-1" style="color: {$colorStore.muted}">
                  <span>Opened by {ticket.creatorId.toString()}</span>
                  <span>{formatDate(ticket.createdAt)}</span>
                  {#if ticket.claimedBy}<span>Claimed by {ticket.claimedBy.toString()}</span>{/if}
                  {#if ticket.caseId}<span>Case #{ticket.caseId}</span>{/if}
                </div>
                {#if ticket.tags && ticket.tags.length > 0}
                  <div class="flex flex-wrap gap-1 mt-2">
                    {#each ticket.tags as tag}
                      <span class="px-2 py-0.5 rounded-full text-xs" style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">{tagName(tag)}</span>
                    {/each}
                  </div>
                {/if}
              </div>
              <i class="fa-solid fa-chevron-{expandedId === ticket.id ? 'up' : 'down'} shrink-0 mt-1" style="color: {$colorStore.muted}; font-size: 12px;"></i>
            </button>

            {#if expandedId === ticket.id}
              <div class="px-4 pb-4 space-y-4" transition:slide>
                {#if !ticket.closedAt && !ticket.isArchived}
                  <div class="flex flex-wrap gap-2">
                    {#if ticket.claimedBy && staffId && ticket.claimedBy.toString() === staffId.toString()}
                      <button class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] min-h-[40px] disabled:opacity-50"
                              style="background: {$colorStore.muted}20; color: {$colorStore.muted};" disabled={busy} onclick={() => unclaim(ticket)}>
                        <i class="fa-solid fa-hand mr-1"></i>Unclaim
                      </button>
                    {:else if !ticket.claimedBy}
                      <button class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] min-h-[40px] disabled:opacity-50"
                              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                              disabled={busy || !staffId} onclick={() => claim(ticket)}>
                        <i class="fa-solid fa-hand mr-1"></i>Claim
                      </button>
                    {/if}
                    <a href={`https://discord.com/channels/${$currentGuild?.id}/${ticket.channelId}`} target="_blank" rel="noopener"
                       class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] min-h-[40px] inline-flex items-center"
                       style="background: {$colorStore.primary}15; color: {$colorStore.primary};">
                      <i class="fa-brands fa-discord mr-1"></i>Open channel
                    </a>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span id="ticket-priority-{ticket.id}" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Priority</span>
                      <DiscordSelector type="custom" options={priorityOptions} selected={ticket.priority} placeholder={priorityOptions.length ? "Set priority" : "No priorities configured"}
                                       ariaLabelledby="ticket-priority-{ticket.id}" disabled={busy || priorityOptions.length === 0}
                                       onchange={(e) => setPriority(ticket, typeof e.selected === "string" ? e.selected : null)} />
                    </div>
                    <div>
                      <span id="ticket-tag-{ticket.id}" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Add tag</span>
                      <DiscordSelector type="custom" options={tagOptions.filter(t => !(ticket.tags ?? []).includes(t.id))} selected={tagPick}
                                       placeholder={tagOptions.length ? "Pick a tag" : "No tags configured"}
                                       ariaLabelledby="ticket-tag-{ticket.id}" disabled={busy || tagOptions.length === 0}
                                       onchange={(e) => addTag(ticket, typeof e.selected === "string" ? e.selected : null)} />
                      {#if ticket.tags && ticket.tags.length > 0}
                        <div class="flex flex-wrap gap-1 mt-2">
                          {#each ticket.tags as tag}
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">
                              {tagName(tag)}
                              <button class="min-h-[20px] min-w-[20px]" aria-label={`Remove tag ${tagName(tag)}`} disabled={busy} onclick={() => removeTag(ticket, tag)}>
                                <i class="fa-solid fa-xmark" style="font-size: 10px;"></i>
                              </button>
                            </span>
                          {/each}
                        </div>
                      {/if}
                    </div>
                  </div>

                  <div>
                    <label for="ticket-note-{ticket.id}" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Staff note</label>
                    <div class="flex flex-col sm:flex-row gap-2">
                      <input id="ticket-note-{ticket.id}" type="text" bind:value={noteDraft} maxlength="1000" placeholder="Visible to staff only"
                             class="flex-1 p-3 rounded-lg border min-h-[44px]"
                             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
                      <button class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] min-h-[44px] disabled:opacity-50"
                              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                              disabled={busy || !noteDraft.trim()} onclick={() => addNote(ticket)}>
                        Add note
                      </button>
                    </div>
                  </div>

                  <div class="p-4 rounded-xl border" style="background: #ef444405; border-color: #ef444430;">
                    <label for="ticket-close-{ticket.id}" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Close ticket</label>
                    <div class="flex flex-col sm:flex-row gap-2">
                      <input id="ticket-close-{ticket.id}" type="text" bind:value={closeReason} maxlength="500" placeholder="Reason (optional)"
                             class="flex-1 p-3 rounded-lg border min-h-[44px]"
                             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
                      <button class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] min-h-[44px] disabled:opacity-50"
                              style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
                              disabled={busy} onclick={() => close(ticket)}>
                        <i class="fa-solid fa-lock mr-1"></i>Close
                      </button>
                    </div>
                  </div>
                {:else}
                  <div class="flex flex-wrap items-center gap-3 text-sm" style="color: {$colorStore.muted}">
                    {#if ticket.closedAt}<span>Closed {formatDate(ticket.closedAt)}</span>{/if}
                    {#if ticket.transcriptUrl}
                      <a href={ticket.transcriptUrl} target="_blank" rel="noopener" class="underline" style="color: {$colorStore.primary};">View transcript</a>
                    {/if}
                    {#if !ticket.isArchived}
                      <button class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] min-h-[40px] disabled:opacity-50"
                              style="background: {$colorStore.muted}20; color: {$colorStore.muted};" disabled={busy} onclick={() => archive(ticket)}>
                        <i class="fa-solid fa-box-archive mr-1"></i>Archive
                      </button>
                    {/if}
                  </div>
                {/if}

                {#if actionError}
                  <div class="p-3 rounded-lg flex items-center gap-2 text-sm" role="alert"
                       style="background: #ef444420; border: 1px solid #ef444430; color: #ef4444;">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>{actionError}</span>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
