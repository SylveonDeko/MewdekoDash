<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { ticketApi } from "$lib/api/index.ts";
  import type { Ticket, TicketCaseDetail } from "$lib/api/ticket/models";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import SaveStatus from "$lib/components/ui/SaveStatus.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import ListRow from "./ListRow.svelte";
  import { errorText, formatDate, formatDay } from "../ticketModel";

  interface Props {
    guildId: bigint;
    caseId: number;
    tickets: Ticket[];
    staffId: bigint | null;
    autoSave: AutoSave;
    onchanged: () => Promise<void>;
    onclose: () => void;
    onerror: (message: string) => void;
  }

  let { guildId, caseId, tickets, staffId, autoSave, onchanged, onclose, onerror }: Props = $props();

  let detail = $state<TicketCaseDetail | null>(null);
  let failed = $state(false);
  let busy = $state(false);
  let noteDraft = $state("");
  let toLink = $state<string[]>([]);
  let archiveOnClose = $state(false);

  const saveKey = $derived(`case:${caseId}`);
  const closed = $derived(!!detail?.closedAt);
  const linkedIds = $derived(new Set((detail?.linkedTickets ?? []).map(t => t.id)));
  const linkable = $derived(
    tickets
      .filter(t => !t.isDeleted && !t.caseId && !linkedIds.has(t.id))
      .map(t => ({ id: String(t.id), name: m.tickets.ticketTitle({ id: t.id, name: t.buttonLabel ?? t.optionLabel ?? t.channelName ?? "" }) }))
  );

  async function load() {
    try {
      detail = await ticketApi.getTicketCase(guildId, caseId);
      failed = false;
    } catch (err) {
      logger.error("Failed to load ticket case:", err);
      failed = true;
      onerror(errorText(err, m.tickets.loadCaseFailed()));
    }
  }

  onMount(() => {
    void load();
    return () => {
      void autoSave.flush(saveKey);
    };
  });

  function edit(patch: { title?: string; description?: string }) {
    if (!detail) return;
    detail = { ...detail, ...patch };
    autoSave.schedule(saveKey, async () => {
      const current = detail;
      if (!current || !current.title.trim()) return;
      await ticketApi.updateTicketCase(guildId, caseId, { title: current.title, description: current.description ?? "" });
      await onchanged();
    });
  }

  async function run(action: () => Promise<unknown>, failure: string) {
    if (busy) return;
    busy = true;
    try {
      await action();
      await load();
      await onchanged();
    } catch (err) {
      logger.error(failure, err);
      onerror(errorText(err, failure));
    } finally {
      busy = false;
    }
  }

  async function closeCase() {
    const ok = await requestConfirmation({ message: m.tickets.casesCloseConfirm(), confirmText: m.common.close(), variant: "warning" });
    if (ok) await run(() => ticketApi.closeTicketCase(guildId, caseId, archiveOnClose), m.tickets.failedCloseCase());
  }

  const reopen = () => run(() => ticketApi.reopenTicketCase(guildId, caseId), m.tickets.failedReopenCase());

  async function link() {
    const ids = toLink.map(Number);
    if (ids.length === 0) return;
    await run(async () => {
      await ticketApi.linkTicketsToCase(guildId, caseId, ids);
      toLink = [];
    }, m.tickets.failedLink());
  }

  async function unlink(ticketId: number) {
    const ok = await requestConfirmation({ message: m.tickets.casesUnlinkConfirm({ id: ticketId }), confirmText: m.common.unlink() });
    if (ok) await run(() => ticketApi.unlinkTickets(guildId, [ticketId]), m.tickets.failedUnlink());
  }

  async function addNote() {
    const content = noteDraft.trim();
    if (!content || !staffId) return;
    await run(async () => {
      await ticketApi.addCaseNotes(guildId, caseId, { content, authorId: staffId });
      noteDraft = "";
    }, m.tickets.failedAddNote());
  }

  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`);
  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
</script>

{#snippet actions()}
  <SaveStatus {autoSave} />
{/snippet}

<Sheet title={detail?.title || m.tickets.caseNumber({ id: caseId })} size="lg" {onclose} {actions}>
  {#if failed}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <p style="color: {$colorStore.muted}">{m.tickets.loadCaseFailed()}</p>
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={load}>{m.common.retry()}</button>
    </div>
  {:else if !detail}
    <div class="flex justify-center py-8">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else}
    <p class="text-sm" style="color: {$colorStore.muted}">
      {m.tickets.caseMeta({ id: detail.id, creator: detail.createdByName ?? String(detail.createdBy), date: formatDay(detail.createdAt) })}
    </p>

    <SettingField label={m.common.title()} id="case-title">
      <input
        id="case-title"
        type="text"
        maxlength="100"
        value={detail.title}
        oninput={(e) => edit({ title: e.currentTarget.value })}
        onblur={() => autoSave.flush(saveKey)}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>
    <SettingField label={m.common.description()} id="case-description">
      <textarea
        id="case-description"
        rows="3"
        maxlength="1000"
        value={detail.description ?? ""}
        oninput={(e) => edit({ description: e.currentTarget.value })}
        onblur={() => autoSave.flush(saveKey)}
        class="w-full p-3 rounded-lg border focus:ring-2"
        style={inputStyle}
      ></textarea>
    </SettingField>

    <div class="flex flex-wrap items-center gap-3">
      {#if closed}
        <p class="grow text-sm" style="color: {$colorStore.muted}">{m.common.closedDate({ date: formatDate(detail.closedAt) })}</p>
        <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy} onclick={reopen}>{m.tickets.casesReopen()}</button>
      {:else}
        <div class="grow min-w-0">
          <ToggleRow colors={$colorStore} checked={archiveOnClose} title={m.tickets.casesArchiveOnClose()} onchange={(on) => (archiveOnClose = on)} />
        </div>
        <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy} onclick={closeCase}>
          <i class="fa-solid fa-lock" aria-hidden="true"></i>{m.common.close()}
        </button>
      {/if}
    </div>

    <div class="space-y-2">
      <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.tickets.casesLinkedHeading({ count: detail.linkedTickets.length })}</h4>
      {#each detail.linkedTickets as linked (linked.id)}
        <ListRow
          title={m.tickets.ticketTitle({ id: linked.id, name: linked.channelName })}
          subtitle={m.tickets.casesTicketMeta({ creator: linked.creatorName, date: formatDay(linked.createdAt) })}
          badges={linked.isArchived ? [m.tickets.stateArchived()] : linked.closedAt ? [m.common.closed()] : [m.common.open()]}
          menu={[{ label: m.common.unlink(), icon: "fa-link", onclick: () => unlink(linked.id) }]}
          menuLabel={m.tickets.rowMoreAria({ name: `#${linked.id}` })}
        />
      {:else}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.tickets.casesNoLinked()}</p>
      {/each}
      <SettingField label={m.tickets.casesLinkTickets()} id="case-link">
        <div class="flex gap-3">
          <div class="grow min-w-0">
            <DiscordSelector
              id="case-link"
              type="custom"
              multiple={true}
              options={linkable}
              selected={toLink}
              customIcon="fa-ticket"
              placeholder={linkable.length ? m.tickets.casesPickTickets() : m.tickets.casesNoUnlinked()}
              disabled={linkable.length === 0}
              onchange={(d) => (toLink = Array.isArray(d.selected) ? d.selected : [])}
            />
          </div>
          <button type="button" class="shrink-0 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy || toLink.length === 0} onclick={link}>
            {m.tickets.casesLink()}
          </button>
        </div>
      </SettingField>
    </div>

    <div class="space-y-2">
      <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.tickets.casesNotesHeading({ count: detail.notes?.length ?? 0 })}</h4>
      {#each detail.notes ?? [] as note (note.id)}
        <div class="rounded-xl border p-3" style="border-color: {$colorStore.primary}20; background: {$colorStore.primary}08;">
          <p class="text-xs" style="color: {$colorStore.muted}">{note.authorId} · {formatDate(note.createdAt)}</p>
          <p class="text-sm whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{note.content}</p>
        </div>
      {/each}
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
    </div>
  {/if}
</Sheet>
