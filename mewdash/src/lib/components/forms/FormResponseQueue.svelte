<script lang="ts">
  /**
   * A form's responses and their review, on one page.
   *
   * Reading a response and deciding on it are the same task, so they are the same screen: each row
   * expands in place to show the answers, the notes and the decision buttons. Splitting them meant
   * opening a modal per response and losing your place in the queue.
   */
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page as pageStore } from "$app/stores";
  import { fade, slide } from "svelte/transition";
  import {
    type Form,
    formsApi,
    type FormQuestion,
    type FormResponseRevision,
    intToResponseStatus,
    type PaginatedResponses,
    type QueuedResponse,
    RESPONSE_STATUS_LABELS,
    type ResponseStatus
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { loadingStore } from "$lib/stores/loadingStore";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";

  interface Props {
    formId: number;
    /** The reviewer, recorded against whatever they decide. */
    userId: bigint;
    onShowNotification: (message: string, type: "success" | "error") => void;
  }

  let { formId, userId, onShowNotification }: Props = $props();

  let form = $state<Form | null>(null);
  let questions = $state<FormQuestion[]>([]);
  let data = $state<PaginatedResponses | null>(null);
  let loading = $state(true);

  /** Which response is expanded. Only one at a time, since answers are long. */
  let openResponseId = $state<number | null>(null);

  /** Notes typed against each response, kept per response so switching rows does not lose them. */
  let notes = $state<Record<number, string>>({});
  let deciding = $state<number | null>(null);
  let pendingDelete = $state<QueuedResponse | null>(null);

  /** Earlier answers, loaded only when a reviewer asks to see what an edit replaced. */
  let revisions = $state<Record<number, FormResponseRevision[]>>({});
  let openRevisions = $state<Set<number>>(new Set());

  const STATUSES: ResponseStatus[] = ["Pending", "UnderReview", "Approved", "Rejected"];

  /**
   * The filter and page live in the URL, so a reviewer can bookmark "everything still pending on
   * this form" and send that link to somebody else.
   */
  let statusFilter = $derived(
    (($pageStore.url.searchParams.get("status") as ResponseStatus | null) ?? null)
  );

  let currentPage = $derived(parseInt($pageStore.url.searchParams.get("page") ?? "1") || 1);

  /** Whether this form reviews responses at all. If it does not, there is nothing to filter by. */
  let isReviewed = $derived(!!form && (form.requireApproval || form.formType !== 0));

  let statusCounts = $derived(data?.statusCounts ?? {});

  function statusStyle(status: ResponseStatus) {
    return (
      RESPONSE_STATUS_LABELS[status] ?? {
        label: status,
        color: $colorStore.muted,
        icon: "fa-circle"
      }
    );
  }

  /** Reads a queued response's review state, treating a missing workflow row as pending. */
  function statusOf(item: QueuedResponse): ResponseStatus {
    return item.workflow ? intToResponseStatus(item.workflow.status) : "Pending";
  }

  function isOpenForDecision(item: QueuedResponse): boolean {
    const status = statusOf(item);
    return status === "Pending" || status === "UnderReview";
  }

  async function load() {
    return await loadingStore.wrap(
      "load-response-queue",
      async () => {
        try {
          loading = true;

          if (!form) form = await formsApi.getForm(formId);
          if (questions.length === 0) questions = await formsApi.getFormQuestions(formId);

          data = await formsApi.getFormResponses(
            formId,
            currentPage,
            25,
            statusFilter ?? undefined
          );
        } catch (err) {
          onShowNotification("Failed to load responses", "error");
        } finally {
          loading = false;
        }
      },
      "api",
      "Loading responses..."
    );
  }

  /** Rewrites the query string, which reloads the queue through the derived filter and page. */
  async function setQuery(next: { status?: ResponseStatus | null; page?: number }) {
    const params = new URLSearchParams($pageStore.url.searchParams);

    if ("status" in next) {
      if (next.status) params.set("status", next.status);
      else params.delete("status");

      // A filter change invalidates the page number, since page 3 of "pending" is not page 3 of
      // everything.
      params.delete("page");
    }

    if (next.page !== undefined) {
      if (next.page > 1) params.set("page", String(next.page));
      else params.delete("page");
    }

    openResponseId = null;

    await goto(`?${params.toString()}`, { replaceState: true, noScroll: true, keepFocus: true });
    await load();
  }

  function toggleResponse(item: QueuedResponse) {
    openResponseId = openResponseId === item.response.id ? null : item.response.id;
  }

  async function toggleRevisions(item: QueuedResponse) {
    const responseId = item.response.id;
    const next = new Set(openRevisions);

    if (next.has(responseId)) {
      next.delete(responseId);
      openRevisions = next;
      return;
    }

    next.add(responseId);
    openRevisions = next;

    if (revisions[responseId]) return;

    try {
      revisions[responseId] = await formsApi.getResponseRevisions(responseId);
    } catch {
      onShowNotification("Failed to load earlier answers", "error");
    }
  }

  async function decide(item: QueuedResponse, approve: boolean) {
    const responseId = item.response.id;
    const reviewerNotes = notes[responseId]?.trim() || undefined;

    // Rejecting without saying why leaves the submitter with nothing to act on, and the reason is
    // what gets sent to them.
    if (!approve && !reviewerNotes) {
      onShowNotification("Add a reason before rejecting, the submitter is told what you write", "error");
      return;
    }

    try {
      deciding = responseId;

      if (approve) {
        const result = await formsApi.approveResponse(responseId, userId, reviewerNotes);
        onShowNotification(
          result.inviteCode ? `Approved, invite ${result.inviteCode} created` : "Response approved",
          "success"
        );
      } else {
        await formsApi.rejectResponse(responseId, userId, reviewerNotes!);
        onShowNotification("Response rejected", "success");
      }

      delete notes[responseId];
      await load();
    } catch (err) {
      onShowNotification(
        err instanceof Error ? err.message : `Failed to ${approve ? "approve" : "reject"} response`,
        "error"
      );
    } finally {
      deciding = null;
    }
  }

  async function deleteResponse() {
    if (!pendingDelete) return;

    const responseId = pendingDelete.response.id;
    pendingDelete = null;

    try {
      await formsApi.deleteResponse(responseId);
      onShowNotification("Response deleted", "success");
      await load();
    } catch {
      onShowNotification("Failed to delete response", "error");
    }
  }

  async function exportCsv() {
    try {
      const blob = await formsApi.exportResponses(formId);
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `form-${formId}-responses.csv`;
      link.click();

      URL.revokeObjectURL(url);
    } catch {
      onShowNotification("Failed to export responses", "error");
    }
  }

  /** The question an answer belongs to, when it is still on the form. */
  function questionFor(questionId: number): FormQuestion | undefined {
    return questions.find((q) => q.id === questionId);
  }

  onMount(load);
</script>

<div class="space-y-4">
  <!-- Header -->
  <div
    class="rounded-xl border p-5 flex items-start justify-between gap-4 flex-wrap"
    style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}25;"
  >
    <div class="min-w-0">
      <h2 class="text-xl font-bold truncate" style="color: {$colorStore.text};">
        {form?.name ?? "Responses"}
      </h2>
      <p class="text-sm" style="color: {$colorStore.muted};">
        {data?.totalCount ?? 0}
        {statusFilter ? statusStyle(statusFilter).label.toLowerCase() : ""}
        response{(data?.totalCount ?? 0) === 1 ? "" : "s"}
      </p>
    </div>

    <button
      type="button"
      onclick={exportCsv}
      class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
      style="background: {$colorStore.primary}15; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
    >
      <i class="fa-solid fa-file-csv mr-2"></i>
      Export CSV
    </button>
  </div>

  <!-- Filter chips, only where there is a review state to filter by -->
  {#if isReviewed}
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        onclick={() => setQuery({ status: null })}
        class="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
        style="background: {statusFilter === null ? $colorStore.primary + '25' : $colorStore.primary + '08'};
               color: {statusFilter === null ? $colorStore.text : $colorStore.muted};
               border: 1px solid {$colorStore.primary}25;"
      >
        All
      </button>

      {#each STATUSES as status}
        {@const style = statusStyle(status)}
        {@const count = statusCounts[status] ?? 0}
        <button
          type="button"
          onclick={() => setQuery({ status })}
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
          style="background: {statusFilter === status ? style.color + '25' : $colorStore.primary + '08'};
                 color: {statusFilter === status ? style.color : $colorStore.muted};
                 border: 1px solid {statusFilter === status ? style.color + '50' : $colorStore.primary + '25'};"
        >
          <i class="fa-solid {style.icon} mr-1"></i>
          {style.label} ({count})
        </button>
      {/each}
    </div>
  {/if}

  {#if loading && !data}
    <div class="p-10 text-center" style="color: {$colorStore.muted};">
      <i class="fa-solid fa-spinner fa-spin text-2xl mb-3"></i>
      <div>Loading responses</div>
    </div>
  {:else if !data || data.responses.length === 0}
    <div
      class="p-10 rounded-xl text-center"
      style="background: {$colorStore.primary}05; border: 1px solid {$colorStore.primary}20;"
    >
      <i class="fa-solid fa-inbox text-3xl mb-3" style="color: {$colorStore.muted};"></i>
      <div class="font-semibold mb-1" style="color: {$colorStore.text};">
        {statusFilter ? `Nothing ${statusStyle(statusFilter).label.toLowerCase()}` : "No responses yet"}
      </div>
      <div style="color: {$colorStore.muted};">
        {statusFilter
          ? "Try a different filter."
          : "Responses will show up here as people submit them."}
      </div>
    </div>
  {:else}
    <div class="space-y-3">
      {#each data.responses as item (item.response.id)}
        {@const status = statusOf(item)}
        {@const style = statusStyle(status)}
        {@const isOpen = openResponseId === item.response.id}

        <div
          class="rounded-xl overflow-hidden"
          style="background: {$colorStore.primary}05; border: 1px solid {$colorStore.primary}25;"
          in:fade={{ duration: 150 }}
        >
          <!-- Row -->
          <div class="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium truncate" style="color: {$colorStore.text};">
                  {item.response.username ?? "Anonymous"}
                </span>

                {#if isReviewed}
                  <span
                    class="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full"
                    style="background: {style.color}20; color: {style.color};"
                  >
                    <i class="fa-solid {style.icon}"></i>
                    {style.label}
                  </span>
                {/if}
              </div>

              <div class="text-xs mt-1 flex items-center gap-2 flex-wrap" style="color: {$colorStore.muted};">
                <!-- The id matches the footer of the embed posted to Discord, which is how a
                     reviewer gets from a message back to this row. -->
                <span>
                  {new Date(item.response.submittedAt).toLocaleString()} &middot; #{item.response.id}
                </span>

                {#if item.response.editedAt}
                  <span
                    class="px-1.5 py-0.5 rounded"
                    style="background: #f59e0b20; color: #f59e0b;"
                    title={new Date(item.response.editedAt).toLocaleString()}
                  >
                    <i class="fa-solid fa-pen mr-1"></i>Edited
                  </span>
                {/if}

                {#if item.workflow?.dmFailed}
                  <span class="px-1.5 py-0.5 rounded" style="background: #ef444420; color: #ef4444;">
                    <i class="fa-solid fa-comment-slash mr-1"></i>Not delivered
                  </span>
                {/if}
              </div>
            </div>

            <div class="flex gap-2">
              <button
                type="button"
                onclick={() => toggleResponse(item)}
                class="flex-1 sm:flex-none px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style="background: {$colorStore.primary}15; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
              >
                <i class="fa-solid {isOpen ? 'fa-eye-slash' : 'fa-eye'} mr-2"></i>
                {isOpen ? "Hide" : "View"}
              </button>

              <button
                type="button"
                onclick={() => (pendingDelete = item)}
                aria-label="Delete response"
                class="px-3 py-2.5 rounded-lg text-sm transition-all"
                style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>

          <!-- Detail -->
          {#if isOpen}
            <div
              class="border-t p-4 space-y-4"
              style="border-color: {$colorStore.primary}20;"
              transition:slide={{ duration: 200 }}
            >
              {#if item.answers.length === 0}
                <p class="text-sm" style="color: {$colorStore.muted};">
                  This response has no answers stored.
                </p>
              {/if}

              {#each item.answers as answer (answer.id)}
                {@const question = questionFor(answer.questionId)}
                <div>
                  <div class="text-xs mb-1 flex items-center gap-2 flex-wrap" style="color: {$colorStore.muted};">
                    <span>{answer.questionText ?? question?.questionText ?? "Question"}</span>
                    {#if !question}
                      <span
                        class="px-1.5 py-0.5 rounded"
                        style="background: {$colorStore.primary}15;"
                      >
                        no longer on the form
                      </span>
                    {/if}
                  </div>

                  {#if answer.answerValues && answer.answerValues.length > 0}
                    <ul class="list-disc list-inside text-sm" style="color: {$colorStore.text};">
                      {#each answer.answerValues as value}
                        <li>{value}</li>
                      {/each}
                    </ul>
                  {:else}
                    <div class="text-sm whitespace-pre-wrap break-words" style="color: {$colorStore.text};">
                      {answer.answerDisplay || answer.answerText || "(No answer)"}
                    </div>
                  {/if}
                </div>
              {/each}

              <!-- Earlier answers, when the submitter has revised them -->
              {#if item.revisionCount > 0}
                <div class="pt-3 border-t" style="border-color: {$colorStore.primary}20;">
                  <button
                    type="button"
                    onclick={() => toggleRevisions(item)}
                    class="text-sm font-medium"
                    style="color: {$colorStore.primary};"
                  >
                    <i class="fa-solid fa-clock-rotate-left mr-2"></i>
                    {openRevisions.has(item.response.id) ? "Hide" : "Show"}
                    {item.revisionCount} earlier
                    version{item.revisionCount === 1 ? "" : "s"}
                  </button>

                  {#if openRevisions.has(item.response.id)}
                    <div class="mt-3 space-y-3" transition:slide={{ duration: 150 }}>
                      {#each revisions[item.response.id] ?? [] as revision (revision.id)}
                        <div
                          class="p-3 rounded-lg"
                          style="background: {$colorStore.primary}05; border: 1px dashed {$colorStore.primary}30;"
                        >
                          <div class="text-xs mb-2" style="color: {$colorStore.muted};">
                            As it stood on {new Date(revision.createdAt).toLocaleString()}
                          </div>
                          {#each revision.answers as previous}
                            <div class="text-sm mb-2">
                              <div style="color: {$colorStore.muted};">
                                {previous.questionText ?? "Question"}
                              </div>
                              <div class="whitespace-pre-wrap break-words" style="color: {$colorStore.text};">
                                {previous.answerDisplay || previous.answerText || "(No answer)"}
                              </div>
                            </div>
                          {/each}
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/if}

              <!-- What was decided, or the means to decide -->
              {#if item.workflow?.reviewNotes}
                <div class="pt-3 border-t" style="border-color: {$colorStore.primary}20;">
                  <div class="text-xs mb-1" style="color: {$colorStore.muted};">Reviewer notes</div>
                  <div class="text-sm whitespace-pre-wrap break-words" style="color: {$colorStore.text};">
                    {item.workflow.reviewNotes}
                  </div>
                </div>
              {/if}

              {#if item.workflow?.inviteCode}
                <div class="pt-3 border-t" style="border-color: {$colorStore.primary}20;">
                  <div class="text-xs mb-1" style="color: {$colorStore.muted};">Invite created</div>
                  <code class="text-sm" style="color: {$colorStore.text};">
                    discord.gg/{item.workflow.inviteCode}
                  </code>
                </div>
              {/if}

              {#if isReviewed && isOpenForDecision(item)}
                <div class="pt-3 border-t space-y-2" style="border-color: {$colorStore.primary}20;">
                  <label
                    for="notes-{item.response.id}"
                    class="block text-xs"
                    style="color: {$colorStore.muted};"
                  >
                    Notes for the submitter
                  </label>
                  <textarea
                    id="notes-{item.response.id}"
                    bind:value={notes[item.response.id]}
                    rows="2"
                    maxlength="1000"
                    placeholder="Sent to them with the decision. Required when rejecting."
                    class="w-full p-3 rounded-lg text-sm resize-none"
                    style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                  ></textarea>

                  <div class="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onclick={() => decide(item, true)}
                      disabled={deciding === item.response.id}
                      class="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      style="background: #10B98120; color: #10B981; border: 1px solid #10B98140;"
                    >
                      <i class="fa-solid fa-check mr-2"></i>
                      Approve
                    </button>
                    <button
                      type="button"
                      onclick={() => decide(item, false)}
                      disabled={deciding === item.response.id}
                      class="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      style="background: #ef444420; color: #ef4444; border: 1px solid #ef444440;"
                    >
                      <i class="fa-solid fa-xmark mr-2"></i>
                      Reject
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Pagination -->
    {#if data.totalPages > 1}
      <div class="flex items-center justify-center gap-3">
        <button
          type="button"
          onclick={() => setQuery({ page: currentPage - 1 })}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          class="px-4 py-2.5 rounded-lg text-sm transition-all disabled:opacity-40"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>

        <span class="text-sm" style="color: {$colorStore.muted};">
          Page {data.page} of {data.totalPages}
        </span>

        <button
          type="button"
          onclick={() => setQuery({ page: currentPage + 1 })}
          disabled={currentPage >= data.totalPages}
          aria-label="Next page"
          class="px-4 py-2.5 rounded-lg text-sm transition-all disabled:opacity-40"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    {/if}
  {/if}
</div>

<ConfirmationModal
  isOpen={pendingDelete !== null}
  title="Delete this response?"
  message={pendingDelete
    ? `This permanently deletes response #${pendingDelete.response.id} from ${pendingDelete.response.username ?? "an anonymous submitter"}, along with its answers and review history.`
    : ""}
  confirmText="Delete"
  variant="danger"
  onconfirm={deleteResponse}
  oncancel={() => (pendingDelete = null)}
/>
