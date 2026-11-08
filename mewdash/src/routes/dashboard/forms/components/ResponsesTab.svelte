<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page as pageState } from "$app/state";
  import {
    formsApi,
    intToResponseStatus,
    RESPONSE_STATUS_LABELS,
    type Form,
    type FormQuestion,
    type FormResponseRevision,
    type PaginatedResponses,
    type QueuedResponse,
    type ResponseStatus
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import { responseStatusLabel } from "$lib/components/forms/formLabels";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, formatDate, isReviewed, type Notify } from "./formsModel";

  interface Props {
    forms: Form[];
    formId: number | null;
    userId: bigint;
    notify: Notify;
    fixedForm?: boolean;
  }

  const STATUSES: ResponseStatus[] = ["Pending", "UnderReview", "Approved", "Rejected"];
  const PAGE_SIZE = 25;

  let { forms, formId, userId, notify, fixedForm = false }: Props = $props();

  let form = $state<Form | null>(null);
  let questions = $state<FormQuestion[]>([]);
  let data = $state<PaginatedResponses | null>(null);
  let loading = $state(false);
  let openId = $state<number | null>(null);
  let notes = $state<Record<number, string>>({});
  let deciding = $state<number | null>(null);
  let revisions = $state<Record<number, FormResponseRevision[]>>({});
  let shownRevisions = $state<Set<number>>(new Set());

  const statusFilter = $derived((pageState.url.searchParams.get("status") as ResponseStatus | null) ?? null);
  const currentPage = $derived(Number(pageState.url.searchParams.get("page")) || 1);
  const reviewed = $derived(!!form && isReviewed(form));
  const counts = $derived(data?.statusCounts ?? {});
  const key = $derived(`${formId}|${statusFilter}|${currentPage}`);

  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
  const buttonStyle = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`);

  function statusOf(item: QueuedResponse): ResponseStatus {
    return item.workflow ? intToResponseStatus(item.workflow.status) : "Pending";
  }

  function decidable(item: QueuedResponse): boolean {
    const status = statusOf(item);
    return status === "Pending" || status === "UnderReview";
  }

  async function load() {
    const id = formId;
    if (id === null) {
      form = null;
      data = null;
      return;
    }
    loading = true;
    try {
      if (form?.id !== id) {
        form = null;
        questions = [];
        [form, questions] = await Promise.all([formsApi.getForm(id), formsApi.getFormQuestions(id)]);
      }
      const result = await formsApi.getFormResponses(id, currentPage, PAGE_SIZE, statusFilter ?? undefined);
      if (formId === id) data = result;
    } catch (err) {
      logger.error("Failed to load form responses:", err);
      notify(errorText(err, m.forms.queueLoadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function setQuery(next: { form?: number | null; status?: ResponseStatus | null; page?: number }) {
    const params = new URLSearchParams(pageState.url.searchParams);
    if ("form" in next) {
      if (next.form) params.set("form", String(next.form));
      else params.delete("form");
      params.delete("status");
      params.delete("page");
    }
    if ("status" in next) {
      if (next.status) params.set("status", next.status);
      else params.delete("status");
      params.delete("page");
    }
    if (next.page !== undefined) {
      if (next.page > 1) params.set("page", String(next.page));
      else params.delete("page");
    }
    openId = null;
    await goto(`?${params.toString()}`, { replaceState: true, noScroll: true, keepFocus: true });
  }

  function toggle(item: QueuedResponse) {
    openId = openId === item.response.id ? null : item.response.id;
  }

  async function toggleRevisions(item: QueuedResponse) {
    const id = item.response.id;
    const next = new Set(shownRevisions);
    if (next.has(id)) {
      next.delete(id);
      shownRevisions = next;
      return;
    }
    next.add(id);
    shownRevisions = next;
    if (revisions[id]) return;
    try {
      revisions[id] = await formsApi.getResponseRevisions(id);
    } catch (err) {
      logger.error("Failed to load response revisions:", err);
      notify(errorText(err, m.forms.queueRevisionsLoadFailed()), "error");
    }
  }

  async function decide(item: QueuedResponse, approve: boolean) {
    const id = item.response.id;
    const text = notes[id]?.trim() || undefined;
    if (!approve && !text) {
      notify(m.forms.queueReasonRequired(), "error");
      return;
    }
    deciding = id;
    try {
      if (approve) {
        const result = await formsApi.approveResponse(id, userId, text);
        notify(result.inviteCode ? m.forms.queueApprovedWithInvite({ code: result.inviteCode }) : m.forms.queueApproved());
      } else {
        await formsApi.rejectResponse(id, userId, text!);
        notify(m.forms.queueRejected());
      }
      delete notes[id];
      await load();
    } catch (err) {
      logger.error("Failed to decide a response:", err);
      notify(errorText(err, approve ? m.forms.queueApproveFailed() : m.forms.queueRejectFailed()), "error");
    } finally {
      deciding = null;
    }
  }

  async function remove(item: QueuedResponse) {
    const ok = await requestConfirmation({
      title: m.forms.queueDeleteTitle(),
      message: m.forms.queueDeleteMessage({ id: item.response.id, user: item.response.username || m.forms.queueDeleteAnonymousUser() }),
      confirmText: m.forms.queueDeleteResponse()
    });
    if (!ok) return;
    try {
      await formsApi.deleteResponse(item.response.id);
      notify(m.forms.queueDeleted());
      await load();
    } catch (err) {
      logger.error("Failed to delete a response:", err);
      notify(errorText(err, m.forms.queueDeleteFailed()), "error");
    }
  }

  async function exportCsv() {
    if (formId === null) return;
    try {
      const blob = await formsApi.exportResponses(formId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `form-${formId}-responses.csv`;
      link.click();
      URL.revokeObjectURL(url);
      notify(m.forms.pageNotifyExported());
    } catch (err) {
      logger.error("Failed to export responses:", err);
      notify(errorText(err, m.forms.pageErrorExport()), "error");
    }
  }

  function questionFor(id: number): FormQuestion | undefined {
    return questions.find((q) => q.id === id);
  }

  $effect(() => {
    void key;
    untrack(() => {
      void load();
    });
  });
</script>

{#snippet exportButton()}
  {#if formId !== null}
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={exportCsv}>
      <i class="fa-solid fa-download" aria-hidden="true"></i>
      {m.forms.queueExportCsv()}
    </button>
  {/if}
{/snippet}

<PluginCard title={m.common.responses()} alwaysOpen actions={exportButton}>
  {#if !fixedForm}
    <SettingField label={m.features.formsName()} id="responses-form">
      <DiscordSelector
        id="responses-form"
        type="custom"
        customIcon="fa-file"
        clearable={false}
        options={forms.map((f) => ({ id: String(f.id), name: f.name }))}
        selected={formId === null ? null : String(formId)}
        placeholder={m.forms.responsesPickForm()}
        onchange={({ selected }) => setQuery({ form: selected ? Number(selected) : null })}
      />
    </SettingField>
  {/if}

  {#if formId === null}
    <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.forms.responsesPickForm()}</p>
  {:else if loading && !data}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if data}
    {#if reviewed}
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2" role="group" aria-label={m.common.status()}>
        <button
          type="button"
          class="min-h-[44px] px-2 rounded-lg border text-sm font-medium"
          style="background: {statusFilter === null ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {statusFilter === null ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
          aria-pressed={statusFilter === null}
          onclick={() => setQuery({ status: null })}
        >
          {m.common.all()}
        </button>
        {#each STATUSES as status (status)}
          {@const selected = statusFilter === status}
          <button
            type="button"
            class="min-h-[44px] px-2 rounded-lg border text-sm font-medium"
            style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
            aria-pressed={selected}
            onclick={() => setQuery({ status })}
          >
            {m.forms.queueStatusCount({ label: responseStatusLabel(status), count: counts[status] ?? 0 })}
          </button>
        {/each}
      </div>
    {/if}

    {#if data.responses.length === 0}
      <div class="py-6 text-center space-y-1">
        <p class="font-medium" style="color: {$colorStore.text}">
          {statusFilter ? m.forms.queueEmptyStatus({ status: responseStatusLabel(statusFilter).toLowerCase() }) : m.forms.queueEmpty()}
        </p>
        <p class="text-sm" style="color: {$colorStore.muted}">{statusFilter ? m.forms.queueEmptyStatusHint() : m.forms.queueEmptyHint()}</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each data.responses as item (item.response.id)}
          {@const id = item.response.id}
          {@const expanded = openId === id}
          {@const status = statusOf(item)}
          <div class="rounded-xl border p-2 sm:p-3 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
            <button type="button" class="w-full text-left min-h-[44px] flex items-center gap-3" aria-expanded={expanded} onclick={() => toggle(item)}>
              <span class="grow min-w-0">
                <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">
                  #{id} {item.response.username || m.forms.queueDeleteAnonymousUser()}
                </span>
                <span class="flex flex-wrap items-center gap-1.5 mt-1">
                  <span class="text-xs" style="color: {$colorStore.muted}">{formatDate(item.response.submittedAt)}</span>
                  {#if reviewed}
                    <span class="text-xs px-2 py-0.5 rounded-full flex items-center gap-1.5" style="background: {$colorStore.primary}15; color: {$colorStore.text};">
                      <span class="w-2 h-2 rounded-full" style="background: {RESPONSE_STATUS_LABELS[status].color}" aria-hidden="true"></span>
                      {responseStatusLabel(status)}
                    </span>
                  {/if}
                  {#if item.response.editedAt}
                    <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{m.forms.queueEdited()}</span>
                  {/if}
                  {#if item.workflow?.dmFailed}
                    <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{m.forms.queueNotDelivered()}</span>
                  {/if}
                </span>
              </span>
              <i class="fa-solid fa-chevron-{expanded ? 'up' : 'down'} shrink-0" style="color: {$colorStore.muted}" aria-hidden="true"></i>
            </button>

            {#if expanded}
              <div class="space-y-3">
                {#each item.answers as answer (answer.id)}
                  {@const question = questionFor(answer.questionId)}
                  <div class="min-w-0">
                    <div class="text-xs" style="color: {$colorStore.muted}">
                      {answer.questionText ?? question?.questionText ?? m.forms.queueQuestionRemoved()}
                    </div>
                    <div class="text-sm whitespace-pre-wrap break-words" style="color: {$colorStore.text}">
                      {answer.answerDisplay ?? answer.answerText ?? answer.answerValues?.join(", ") ?? m.forms.queueNoAnswer()}
                    </div>
                  </div>
                {:else}
                  <p class="text-sm" style="color: {$colorStore.muted}">{m.forms.queueNoAnswers()}</p>
                {/each}

                {#if item.revisionCount > 0}
                  <button type="button" class="min-h-[44px] px-4 rounded-lg text-sm" style={buttonStyle} onclick={() => toggleRevisions(item)}>
                    {#if shownRevisions.has(id)}
                      {item.revisionCount === 1 ? m.forms.queueRevisionsHideOne({ count: item.revisionCount }) : m.forms.queueRevisionsHideOther({ count: item.revisionCount })}
                    {:else}
                      {item.revisionCount === 1 ? m.forms.queueRevisionsShowOne({ count: item.revisionCount }) : m.forms.queueRevisionsShowOther({ count: item.revisionCount })}
                    {/if}
                  </button>
                  {#if shownRevisions.has(id)}
                    {#each revisions[id] ?? [] as revision (revision.id)}
                      <div class="rounded-lg border p-2 space-y-2" style="border-color: {$colorStore.primary}20;">
                        <div class="text-xs font-medium" style="color: {$colorStore.muted}">{m.forms.queueRevisionAsOf({ date: formatDate(revision.createdAt) })}</div>
                        {#each revision.answers as old (old.questionId)}
                          <div class="min-w-0">
                            <div class="text-xs" style="color: {$colorStore.muted}">{old.questionText}</div>
                            <div class="text-sm whitespace-pre-wrap break-words" style="color: {$colorStore.text}">
                              {old.answerDisplay ?? old.answerText ?? old.answerValues?.join(", ") ?? m.forms.queueNoAnswer()}
                            </div>
                          </div>
                        {/each}
                      </div>
                    {/each}
                  {/if}
                {/if}

                {#if item.workflow?.reviewNotes}
                  <div class="rounded-lg border p-2" style="border-color: {$colorStore.primary}20;">
                    <div class="text-xs" style="color: {$colorStore.muted}">{m.forms.queueReviewerNotes()}</div>
                    <div class="text-sm whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{item.workflow.reviewNotes}</div>
                  </div>
                {/if}

                {#if reviewed && decidable(item)}
                  <SettingField label={m.forms.queueNotesLabel()} id="response-notes-{id}">
                    <textarea
                      id="response-notes-{id}"
                      rows="2"
                      value={notes[id] ?? ""}
                      oninput={(e) => (notes[id] = e.currentTarget.value)}
                      placeholder={m.forms.queueNotesPlaceholder()}
                      class="w-full p-3 rounded-lg border resize-none"
                      style={inputStyle}
                    ></textarea>
                  </SettingField>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      class="rounded-xl min-h-[50px] font-medium disabled:opacity-50"
                      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
                      disabled={deciding === id}
                      onclick={() => decide(item, true)}
                    >
                      {m.common.approve()}
                    </button>
                    <button type="button" class="rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={buttonStyle} disabled={deciding === id} onclick={() => decide(item, false)}>
                      {m.forms.queueReject()}
                    </button>
                  </div>
                {/if}

                <button type="button" class="min-h-[44px] px-4 rounded-lg text-sm" style={buttonStyle} onclick={() => remove(item)}>
                  <i class="fa-solid fa-trash mr-2" aria-hidden="true"></i>{m.forms.queueDeleteResponse()}
                </button>
              </div>
            {/if}
          </div>
        {/each}
      </div>

      {#if data.totalPages > 1}
        <div class="flex items-center justify-between gap-2">
          <button type="button" class="min-h-[44px] px-4 rounded-lg disabled:opacity-40" style={buttonStyle} disabled={currentPage <= 1} aria-label={m.common.previous()} onclick={() => setQuery({ page: currentPage - 1 })}>
            <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
          </button>
          <span class="text-sm" style="color: {$colorStore.muted}">{m.forms.pageOfTotal({ page: currentPage, total: data.totalPages })}</span>
          <button type="button" class="min-h-[44px] px-4 rounded-lg disabled:opacity-40" style={buttonStyle} disabled={currentPage >= data.totalPages} aria-label={m.common.next()} onclick={() => setQuery({ page: currentPage + 1 })}>
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      {/if}
    {/if}
  {/if}
</PluginCard>
