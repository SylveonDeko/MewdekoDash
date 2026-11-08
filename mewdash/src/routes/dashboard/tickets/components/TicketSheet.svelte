<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { ticketApi } from "$lib/api/index.ts";
  import type { Ticket, TicketNote, TicketPriority, TicketTag } from "$lib/api/ticket/models";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { errorText, formatDate, idOrNull, stateLabel, ticketState } from "../ticketModel";

  interface Props {
    guildId: bigint;
    ticket: Ticket;
    priorities: TicketPriority[];
    tags: TicketTag[];
    cases: Array<{ id: number; title: string }>;
    staffId: bigint | null;
    onchanged: () => Promise<void>;
    onclose: () => void;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, ticket, priorities, tags, cases, staffId, onchanged, onclose, onerror, onsuccess }: Props = $props();

  let notes = $state<TicketNote[]>([]);
  let answers = $state<Array<[string, string]>>([]);
  let busy = $state(false);
  let noteDraft = $state("");
  let editingNote = $state<number | null>(null);
  let editDraft = $state("");

  const status = $derived(ticketState(ticket));
  const live = $derived(status === "open" || status === "claimed");
  const mine = $derived(!!staffId && !!ticket.claimedBy && ticket.claimedBy.toString() === staffId.toString());
  const priorityOptions = $derived(priorities.map(p => ({ id: p.priorityId, name: `${p.emoji ?? ""} ${p.name}`.trim() })));
  const tagOptions = $derived(tags.filter(t => !(ticket.tags ?? []).includes(t.tagId)).map(t => ({ id: t.tagId, name: t.name })));
  const caseOptions = $derived(cases.map(c => ({ id: String(c.id), name: `#${c.id} ${c.title}` })));

  function tagName(id: string): string {
    return tags.find(t => t.tagId === id)?.name ?? id;
  }

  async function loadNotes() {
    try {
      notes = await ticketApi.getTicketNotes(guildId, ticket.id);
    } catch (err) {
      logger.error("Failed to load ticket notes:", err);
    }
  }

  async function loadAnswers() {
    try {
      const full = await ticketApi.getTicket(guildId, ticket.id);
      if (!full.modalResponses) return;
      const parsed = JSON.parse(full.modalResponses) as Record<string, unknown>;
      answers = Object.entries(parsed).map(([key, value]) => [key, String(value)]);
    } catch (err) {
      logger.error("Failed to load ticket answers:", err);
    }
  }

  onMount(() => {
    void loadNotes();
    void loadAnswers();
  });

  async function run(action: () => Promise<unknown>, failure: string, reload = true) {
    if (busy) return;
    busy = true;
    try {
      await action();
      if (reload) await onchanged();
    } catch (err) {
      logger.error(failure, err);
      onerror(errorText(err, failure));
    } finally {
      busy = false;
    }
  }

  const claim = () => staffId && run(() => ticketApi.claimTicket(guildId, ticket.channelId, { staffId }), m.tickets.failedClaim());
  const unclaim = () => staffId && run(() => ticketApi.unclaimTicket(guildId, ticket.channelId, staffId), m.tickets.failedUnclaim());

  async function close(archive: boolean) {
    const ok = await requestConfirmation({
      message: archive ? m.tickets.closeArchiveConfirm({ id: ticket.id }) : m.tickets.closeConfirm({ id: ticket.id }),
      confirmText: archive ? m.tickets.closeArchive() : m.common.close(),
      variant: "warning"
    });
    if (ok) await run(() => ticketApi.closeTicket(guildId, ticket.channelId, archive), m.tickets.failedClose());
  }

  async function archive() {
    const ok = await requestConfirmation({ message: m.tickets.archiveConfirm({ id: ticket.id }), confirmText: m.common.archive(), variant: "info" });
    if (ok) await run(() => ticketApi.archiveTicket(guildId, ticket.id), m.tickets.failedArchive());
  }

  const setPriority = (priorityId: string | null) =>
    staffId && priorityId && run(() => ticketApi.setTicketPriority(guildId, ticket.channelId, { priorityId, staffId }), m.tickets.failedSetPriority());
  const addTag = (tagId: string | null) =>
    staffId && tagId && run(() => ticketApi.addTicketTags(guildId, ticket.channelId, { tagIds: [tagId], staffId }), m.tickets.failedAddTag());
  const removeTag = (tagId: string) =>
    staffId && run(() => ticketApi.removeTicketTags(guildId, ticket.channelId, { tagIds: [tagId], staffId }), m.tickets.failedRemoveTag());

  const link = (caseId: string | null) =>
    caseId ? run(() => ticketApi.linkTicketsToCase(guildId, Number(caseId), [ticket.id]), m.tickets.failedLink()) : undefined;
  const unlink = () => run(() => ticketApi.unlinkTickets(guildId, [ticket.id]), m.tickets.failedUnlink());

  async function addNote() {
    const content = noteDraft.trim();
    if (!content || !staffId) return;
    await run(
      async () => {
        await ticketApi.addTicketNotes(guildId, ticket.channelId, { content, authorId: staffId });
        noteDraft = "";
        await loadNotes();
      },
      m.tickets.failedAddNote(),
      false
    );
  }

  async function saveNote(note: TicketNote) {
    const content = editDraft.trim();
    if (!content || !staffId) return;
    await run(
      async () => {
        await ticketApi.editTicketNote(guildId, note.id, { content, authorId: staffId });
        editingNote = null;
        await loadNotes();
      },
      m.tickets.failedEditNote(),
      false
    );
  }

  async function removeNote(note: TicketNote) {
    if (!staffId) return;
    const ok = await requestConfirmation({ message: m.tickets.deleteNoteConfirm(), confirmText: m.common.delete() });
    if (!ok) return;
    await run(
      async () => {
        await ticketApi.deleteTicketNote(guildId, note.id, { authorId: staffId });
        await loadNotes();
      },
      m.tickets.failedDeleteNote(),
      false
    );
  }

  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`);
  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
</script>

<Sheet title={m.tickets.ticketNumber({ id: ticket.id })} size="lg" {onclose}>
  <div class="flex flex-wrap items-center gap-2">
    <span class="text-xs px-2 py-1 rounded-full font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.text};">{stateLabel(status)}</span>
    {#if ticket.buttonLabel || ticket.optionLabel}
      <span class="text-xs px-2 py-1 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{ticket.buttonLabel ?? ticket.optionLabel}</span>
    {/if}
  </div>

  <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
    <div>
      <dt style="color: {$colorStore.muted}">{m.tickets.openedBy()}</dt>
      <dd class="truncate" style="color: {$colorStore.text}">{ticket.creatorName ?? ticket.creatorId}</dd>
    </div>
    <div>
      <dt style="color: {$colorStore.muted}">{m.common.created()}</dt>
      <dd style="color: {$colorStore.text}">{formatDate(ticket.createdAt)}</dd>
    </div>
    <div>
      <dt style="color: {$colorStore.muted}">{m.tickets.claimedByLabel()}</dt>
      <dd class="truncate" style="color: {$colorStore.text}">{ticket.claimedBy ? (ticket.claimedByName ?? ticket.claimedBy) : m.common.none()}</dd>
    </div>
    <div>
      <dt style="color: {$colorStore.muted}">{m.tickets.lastActivity()}</dt>
      <dd style="color: {$colorStore.text}">{formatDate(ticket.lastActivityAt) || m.common.none()}</dd>
    </div>
    {#if ticket.closedAt}
      <div>
        <dt style="color: {$colorStore.muted}">{m.common.closed()}</dt>
        <dd style="color: {$colorStore.text}">{formatDate(ticket.closedAt)}</dd>
      </div>
    {/if}
  </dl>

  <div class="flex flex-wrap gap-3">
    {#if live}
      {#if !ticket.claimedBy}
        <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy || !staffId} onclick={claim}>
          <i class="fa-solid fa-hand" aria-hidden="true"></i>{m.tickets.claim()}
        </button>
      {:else if mine}
        <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy} onclick={unclaim}>
          <i class="fa-solid fa-hand" aria-hidden="true"></i>{m.tickets.unclaim()}
        </button>
      {/if}
      <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy} onclick={() => close(false)}>
        <i class="fa-solid fa-lock" aria-hidden="true"></i>{m.common.close()}
      </button>
      <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy} onclick={() => close(true)}>
        <i class="fa-solid fa-box-archive" aria-hidden="true"></i>{m.tickets.closeArchive()}
      </button>
      <a
        href={`https://discord.com/channels/${guildId}/${ticket.channelId}`}
        target="_blank"
        rel="noopener"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
        style={buttonStyle}
      >
        <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>{m.tickets.openChannel()}
      </a>
    {:else}
      {#if status === "closed"}
        <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy} onclick={archive}>
          <i class="fa-solid fa-box-archive" aria-hidden="true"></i>{m.common.archive()}
        </button>
      {/if}
    {/if}
    {#if ticket.transcriptUrl}
      <a
        href={ticket.transcriptUrl}
        target="_blank"
        rel="noopener"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
        style={buttonStyle}
      >
        <i class="fa-solid fa-file-lines" aria-hidden="true"></i>{m.tickets.viewTranscript()}
      </a>
    {/if}
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <SettingField label={m.common.priority()} id="ticket-priority">
      <DiscordSelector
        id="ticket-priority"
        type="custom"
        options={priorityOptions}
        selected={ticket.priority}
        customIcon="fa-flag"
        clearable={false}
        disabled={busy || !live || priorityOptions.length === 0}
        placeholder={priorityOptions.length ? m.tickets.noPriority() : m.tickets.noPriorities()}
        onchange={(d) => setPriority(idOrNull(d.selected))}
      />
    </SettingField>
    <SettingField label={m.tickets.case()} id="ticket-case">
      {#if ticket.caseId}
        <div class="flex items-center gap-3 min-h-[50px]">
          <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{m.tickets.caseNumber({ id: ticket.caseId })}</span>
          <button type="button" class="shrink-0 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy} onclick={unlink}>{m.common.unlink()}</button>
        </div>
      {:else}
        <DiscordSelector
          id="ticket-case"
          type="custom"
          options={caseOptions}
          selected={null}
          customIcon="fa-folder"
          disabled={busy || caseOptions.length === 0}
          placeholder={caseOptions.length ? m.tickets.linkToCase() : m.tickets.casesEmpty()}
          onchange={(d) => link(idOrNull(d.selected))}
        />
      {/if}
    </SettingField>
  </div>

  <div class="space-y-2">
    <SettingField label={m.tickets.tags()} id="ticket-tag">
      <DiscordSelector
        id="ticket-tag"
        type="custom"
        options={tagOptions}
        selected={null}
        customIcon="fa-tag"
        disabled={busy || !live || tagOptions.length === 0}
        placeholder={tags.length ? m.tickets.addTag() : m.tickets.noTags()}
        onchange={(d) => addTag(idOrNull(d.selected))}
      />
    </SettingField>
    {#if ticket.tags && ticket.tags.length > 0}
      <div class="flex flex-wrap gap-2">
        {#each ticket.tags as tag (tag)}
          <span class="inline-flex items-center gap-1 pl-3 rounded-full text-sm" style="background: {$colorStore.primary}15; color: {$colorStore.text};">
            {tagName(tag)}
            <button
              type="button"
              class="min-h-[44px] min-w-[44px]"
              aria-label={m.tickets.removeTagAria({ name: tagName(tag) })}
              disabled={busy || !live}
              onclick={() => removeTag(tag)}
            >
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </span>
        {/each}
      </div>
    {/if}
  </div>

  {#if answers.length > 0}
    <div class="space-y-2">
      <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.tickets.formAnswers()}</h4>
      {#each answers as [key, value] (key)}
        <div class="rounded-xl border p-3" style="border-color: {$colorStore.primary}20; background: {$colorStore.primary}08;">
          <p class="text-xs font-mono" style="color: {$colorStore.muted}">{key}</p>
          <p class="text-sm whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{value}</p>
        </div>
      {/each}
    </div>
  {/if}

  <div class="space-y-2">
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.tickets.notes()}</h4>
    {#each notes as note (note.id)}
      <div class="rounded-xl border p-3 space-y-2" style="border-color: {$colorStore.primary}20; background: {$colorStore.primary}08;">
        <div class="flex items-center gap-2">
          <p class="grow min-w-0 truncate text-xs" style="color: {$colorStore.muted}">{note.authorName} · {formatDate(note.createdAt)}</p>
          {#if live && staffId && note.authorId.toString() === staffId.toString() && editingNote !== note.id}
            <button type="button" class="rounded-lg min-h-[44px] min-w-[44px]" style={buttonStyle} aria-label={m.tickets.editNoteAria()} onclick={() => { editingNote = note.id; editDraft = note.content; }}>
              <i class="fa-solid fa-pen" aria-hidden="true"></i>
            </button>
            <button type="button" class="rounded-lg min-h-[44px] min-w-[44px]" style={buttonStyle} aria-label={m.tickets.deleteNoteAria()} onclick={() => removeNote(note)}>
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          {/if}
        </div>
        {#if editingNote === note.id}
          <textarea bind:value={editDraft} rows="3" maxlength="1000" class="w-full p-3 rounded-lg border focus:ring-2" style={inputStyle} aria-label={m.tickets.editNoteAria()}></textarea>
          <div class="flex gap-3">
            <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => (editingNote = null)}>{m.common.cancel()}</button>
            <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" disabled={busy || !editDraft.trim()} onclick={() => saveNote(note)}>{m.common.save()}</button>
          </div>
        {:else}
          <p class="text-sm whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{note.content}</p>
        {/if}
      </div>
    {/each}
    {#if live}
      <div class="flex gap-3">
        <input
          type="text"
          maxlength="1000"
          bind:value={noteDraft}
          onkeydown={(e) => e.key === "Enter" && addNote()}
          placeholder={m.tickets.notePlaceholder()}
          aria-label={m.tickets.notePlaceholder()}
          class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
        <button type="button" class="shrink-0 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy || !noteDraft.trim() || !staffId} onclick={addNote}>
          {m.tickets.addNote()}
        </button>
      </div>
    {:else if notes.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.tickets.noNotes()}</p>
    {/if}
  </div>
</Sheet>
