<!-- lib/components/forms/FormWorkflowReview.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import {
    formsApi,
    type Form,
    type FormAnswer,
    type FormQuestion,
    type ResponseWithWorkflow,
    type ResponseStatus,
    RESPONSE_STATUS_LABELS,
    intToResponseStatus
  } from "$lib/api/index.ts";
  import type { PageData } from "../../../routes/dashboard/forms/$types";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { loadingStore } from "$lib/stores/loadingStore";
  import { fade, slide } from "svelte/transition";
  import { escapeHtml } from "$lib/utils/sanitize";

  interface Props {
    formId: number;
    userId: bigint;
    onShowNotification: (message: string, type: "success" | "error") => void;
  }

  let { formId, userId, onShowNotification }: Props = $props();

  let form = $state<Form | null>(null);
  let questions = $state<FormQuestion[]>([]);
  let pendingResponses = $state<ResponseWithWorkflow[]>([]);
  let selectedResponse = $state<ResponseWithWorkflow | null>(null);
  let responseAnswers = $state<FormAnswer[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let showResponseModal = $state(false);
  let showApproveModal = $state(false);
  let showRejectModal = $state(false);
  let approvalNotes = $state("");
  let rejectionNotes = $state("");
  let showInviteModal = $state(false);
  let generatedInviteCode = $state("");
  let filterStatus = $state<ResponseStatus | "all">("all");

  async function loadForm() {
    try {
      form = await formsApi.getForm(formId);
      questions = await formsApi.getFormQuestions(formId);
    } catch (err) {
      console.error("Failed to load form:", err);
    }
  }

  async function loadPendingResponses() {
    return await loadingStore.wrap("load-pending", async () => {
      try {
        loading = true;
        error = null;

        // Load responses based on filter
        if (filterStatus === "all") {
          pendingResponses = await formsApi.getPendingResponses(formId);
        } else {
          pendingResponses = await formsApi.getPendingResponses(formId, filterStatus);
        }
      } catch (err) {
        error = err instanceof Error ? err.message : "Failed to load pending responses";
      } finally {
        loading = false;
      }
    }, "api", "Loading pending responses...");
  }

  async function viewResponse(responseWithWorkflow: ResponseWithWorkflow) {
    return await loadingStore.wrap("load-response", async () => {
      try {
        const responseDetails = await formsApi.getResponseDetails(responseWithWorkflow.response.id);
        selectedResponse = responseWithWorkflow;
        responseAnswers = responseDetails.answers;
        showResponseModal = true;
      } catch (err) {
        onShowNotification("Failed to load response details", "error");
      }
    }, "operation", "Loading response...");
  }

  function closeModal() {
    showResponseModal = false;
    showApproveModal = false;
    showRejectModal = false;
    showInviteModal = false;
    selectedResponse = null;
    responseAnswers = [];
    approvalNotes = "";
    rejectionNotes = "";
    generatedInviteCode = "";
  }

  function openApproveModal() {
    showResponseModal = false;
    showApproveModal = true;
  }

  function openRejectModal() {
    showResponseModal = false;
    showRejectModal = true;
  }

  async function approveResponse() {
    if (!selectedResponse) return;

    return await loadingStore.wrap("approve-response", async () => {
      try {
        const result = await formsApi.approveResponse(
          selectedResponse.response.id,
          userId,
          approvalNotes || undefined
        );

        onShowNotification("Response approved successfully", "success");

        // If invite code was generated, show it
        if (result.inviteCode) {
          generatedInviteCode = result.inviteCode;
          showApproveModal = false;
          showInviteModal = true;
        } else {
          closeModal();
        }

        await loadPendingResponses();
      } catch (err) {
        onShowNotification("Failed to approve response", "error");
      }
    }, "operation", "Approving response...");
  }

  async function rejectResponse() {
    if (!selectedResponse || !rejectionNotes.trim()) {
      onShowNotification("Rejection reason is required", "error");
      return;
    }

    return await loadingStore.wrap("reject-response", async () => {
      try {
        await formsApi.rejectResponse(
          selectedResponse.response.id,
          userId,
          rejectionNotes
        );

        onShowNotification("Response rejected successfully", "success");
        closeModal();
        await loadPendingResponses();
      } catch (err) {
        onShowNotification("Failed to reject response", "error");
      }
    }, "operation", "Rejecting response...");
  }

  function copyInviteToClipboard() {
    const inviteUrl = `https://discord.gg/${generatedInviteCode}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      onShowNotification("Invite link copied to clipboard!", "success");
    }).catch(() => {
      onShowNotification("Failed to copy to clipboard", "error");
    });
  }

  function getQuestionById(questionId: number): FormQuestion | undefined {
    return questions.find((q) => q.id === questionId);
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  onMount(async () => {
    await loadForm();
    await loadPendingResponses();
  });

  $effect(() => {
    if ($currentGuild && formId) {
      loadForm();
      loadPendingResponses();
    }
  });

  // Reload when filter changes
  $effect(() => {
    filterStatus;
    loadPendingResponses();
  });
</script>

<!-- Invite Code Modal -->
{#if showInviteModal}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onclick={closeModal}
    onkeydown={(e) => e.key === 'Escape' && closeModal()}
    role="button"
    tabindex="-1"
    transition:fade
  >
    <div
      class="w-full max-w-lg backdrop-blur-md rounded-xl border p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}95, {$colorStore.gradientMid}98); border-color: {$colorStore.primary}30;"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="flex items-start justify-between mb-4">
        <h2 class="text-2xl font-bold" style="color: {$colorStore.text};">
          <i class="fa-solid fa-check-circle mr-2" style="color: #10B981;"></i>
          Application Approved!
        </h2>
        <button
          onclick={closeModal}
          class="p-2 rounded-lg transition-all hover:scale-110"
          style="background: {$colorStore.primary}20; color: {$colorStore.text};"
          aria-label="Close modal"
        >
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <p class="mb-4 text-sm" style="color: {$colorStore.muted};">
        The application has been approved and an invite link has been generated. Share this link with the user:
      </p>

      <div class="mb-4">
        <input
          type="text"
          readonly
          value="https://discord.gg/{generatedInviteCode}"
          onclick={(e) => e.currentTarget.select()}
          class="w-full p-3 rounded-lg font-mono text-sm"
          style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
        />
      </div>

      <div
        class="mb-4 p-3 rounded-lg text-sm"
        style="background: #10B98110; border: 1px solid #10B98130;"
      >
        <div class="font-semibold mb-2" style="color: #10B981;">
          <i class="fa-solid fa-info-circle mr-1"></i>
          Next Steps:
        </div>
        <ul class="space-y-1" style="color: {$colorStore.text};">
          <li>• The user should check their submission status page for the invite link</li>
          <li>• Configured roles will be automatically assigned when they join</li>
          <li>• The invite will expire based on your settings</li>
        </ul>
      </div>

      <div class="flex gap-3">
        <button
          onclick={copyInviteToClipboard}
          class="flex-1 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
          style="background: linear-gradient(135deg, {$colorStore.primary}, {$colorStore.secondary}); color: white;"
        >
          <i class="fa-solid fa-copy mr-2"></i>
          Copy Invite Link
        </button>
        <button
          onclick={closeModal}
          class="px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        >
          Done
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Approve Modal -->
{#if showApproveModal && selectedResponse}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onclick={closeModal}
    onkeydown={(e) => e.key === 'Escape' && closeModal()}
    role="button"
    tabindex="-1"
    transition:fade
  >
    <div
      class="w-full max-w-lg backdrop-blur-md rounded-xl border p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}95, {$colorStore.gradientMid}98); border-color: {$colorStore.primary}30;"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="flex items-start justify-between mb-4">
        <h2 class="text-2xl font-bold" style="color: {$colorStore.text};">
          <i class="fa-solid fa-check-circle mr-2" style="color: #10B981;"></i>
          Approve Response
        </h2>
        <button
          onclick={closeModal}
          class="p-2 rounded-lg transition-all hover:scale-110"
          style="background: {$colorStore.primary}20; color: {$colorStore.text};"
          aria-label="Close modal"
        >
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <p class="mb-4 text-sm" style="color: {$colorStore.muted};">
        You are about to approve response #{selectedResponse.response.id}
        {#if form?.formType === 1}
          and <strong>unban the user</strong>
        {:else if form?.formType === 2}
          and <strong>generate an invite link</strong> with pre-assigned roles
        {/if}.
      </p>

      <div class="mb-4">
        <label for="approval-notes" class="block text-sm mb-2" style="color: {$colorStore.muted};">
          Approval Notes (Optional)
        </label>
        <textarea
          id="approval-notes"
          bind:value={approvalNotes}
          rows="3"
          class="w-full p-3 rounded-lg resize-none"
          style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
          placeholder="Add notes about why this was approved..."
        ></textarea>
      </div>

      <div class="flex gap-3">
        <button
          onclick={closeModal}
          class="flex-1 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        >
          Cancel
        </button>
        <button
          onclick={approveResponse}
          class="flex-1 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
          style="background: linear-gradient(135deg, #10B981, #059669); color: white;"
        >
          <i class="fa-solid fa-check mr-2"></i>
          Confirm Approval
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Reject Modal -->
{#if showRejectModal && selectedResponse}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onclick={closeModal}
    onkeydown={(e) => e.key === 'Escape' && closeModal()}
    role="button"
    tabindex="-1"
    transition:fade
  >
    <div
      class="w-full max-w-lg backdrop-blur-md rounded-xl border p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}95, {$colorStore.gradientMid}98); border-color: {$colorStore.primary}30;"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="flex items-start justify-between mb-4">
        <h2 class="text-2xl font-bold" style="color: {$colorStore.text};">
          <i class="fa-solid fa-times-circle mr-2" style="color: #ef4444;"></i>
          Reject Response
        </h2>
        <button
          onclick={closeModal}
          class="p-2 rounded-lg transition-all hover:scale-110"
          style="background: {$colorStore.primary}20; color: {$colorStore.text};"
          aria-label="Close modal"
        >
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <p class="mb-4 text-sm" style="color: {$colorStore.muted};">
        You are about to reject response #{selectedResponse.response.id}. Please provide a reason for this decision.
      </p>

      <div class="mb-4">
        <label for="rejection-notes" class="block text-sm mb-2" style="color: {$colorStore.muted};">
          Rejection Reason <span style="color: #ef4444;">*</span>
        </label>
        <textarea
          id="rejection-notes"
          bind:value={rejectionNotes}
          rows="3"
          class="w-full p-3 rounded-lg resize-none"
          style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
          placeholder="Explain why this response was rejected..."
        ></textarea>
      </div>

      <div class="flex gap-3">
        <button
          onclick={closeModal}
          class="flex-1 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        >
          Cancel
        </button>
        <button
          onclick={rejectResponse}
          disabled={!rejectionNotes.trim()}
          class="flex-1 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
          style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white;"
        >
          <i class="fa-solid fa-times mr-2"></i>
          Confirm Rejection
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Response Details Modal -->
{#if showResponseModal && selectedResponse}
  {@const statusStr = intToResponseStatus(selectedResponse.workflow.status)}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onclick={closeModal}
    onkeydown={(e) => e.key === 'Escape' && closeModal()}
    role="button"
    tabindex="-1"
    transition:fade
  >
    <div
      class="w-full max-w-2xl backdrop-blur-md rounded-xl border p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}95, {$colorStore.gradientMid}98); border-color: {$colorStore.primary}30;"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="flex items-start justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold mb-2" style="color: {$colorStore.text};">
            Response #{selectedResponse.response.id}
          </h2>
          <p class="text-sm mb-2" style="color: {$colorStore.muted};">
            Submitted by
            {#if selectedResponse.response.userId}
              {selectedResponse.response.username || `User ${selectedResponse.response.userId}`}
            {:else}
              <span style="color: #8b5cf6;">
                <i class="fa-solid fa-user-secret mr-1"></i>
                Anonymous
              </span>
            {/if}
            on {formatDate(selectedResponse.response.submittedAt)}
          </p>
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
            style="background: {RESPONSE_STATUS_LABELS[statusStr].color}20; color: {RESPONSE_STATUS_LABELS[statusStr].color};"
          >
            <i class="fa-solid {RESPONSE_STATUS_LABELS[statusStr].icon}"></i>
            {RESPONSE_STATUS_LABELS[statusStr].label}
          </div>
        </div>
        <button
          onclick={closeModal}
          class="p-2 rounded-lg transition-all hover:scale-110"
          style="background: {$colorStore.primary}20; color: {$colorStore.text};"
          aria-label="Close modal"
        >
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <!-- Answers -->
      <div class="space-y-4 mb-6">
        {#each responseAnswers as answer}
          {@const question = getQuestionById(answer.questionId)}
          {#if question}
            <div
              class="p-4 rounded-lg"
              style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;"
            >
              <div class="font-semibold mb-2" style="color: {$colorStore.text};">
                {question.questionText}
                {#if question.isRequired}
                  <span style="color: #ef4444;"> *</span>
                {/if}
              </div>
              <div
                class="p-3 rounded"
                style="background: {$colorStore.primary}05; color: {$colorStore.text};"
              >
                {#if answer.answerValues && answer.answerValues.length > 0}
                  <ul class="list-disc list-inside space-y-1">
                    {#each answer.answerValues as value}
                      <li>{@html escapeHtml(value)}</li>
                    {/each}
                  </ul>
                {:else}
                  <div class="whitespace-pre-wrap">
                    {@html escapeHtml(answer.answerText || "(No answer)")}
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        {/each}
      </div>

      <!-- Actions -->
      {#if selectedResponse.workflow.status === 0 || selectedResponse.workflow.status === 1}
        <div class="flex gap-3">
          <button
            onclick={openRejectModal}
            class="flex-1 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
            style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
          >
            <i class="fa-solid fa-times mr-2"></i>
            Reject
          </button>
          <button
            onclick={openApproveModal}
            class="flex-1 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
            style="background: linear-gradient(135deg, #10B981, #059669); color: white;"
          >
            <i class="fa-solid fa-check mr-2"></i>
            Approve
          </button>
        </div>
      {:else}
        <div class="text-center p-4 rounded-lg" style="background: {$colorStore.primary}05;">
          <p class="text-sm" style="color: {$colorStore.muted};">
            This response has already been {intToResponseStatus(selectedResponse.workflow.status).toLowerCase()}.
            {#if selectedResponse.workflow.reviewNotes}
              <br />
              <strong>Notes:</strong> {selectedResponse.workflow.reviewNotes}
            {/if}
          </p>
        </div>
      {/if}
    </div>
  </div>
{/if}

<div class="space-y-6">
  <!-- Form Info -->
  {#if form}
    <div
      class=" rounded-xl border p-6"
      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
    >
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex-1">
          <h3 class="text-lg font-bold mb-1" style="color: {$colorStore.text};">
            {form.name}
          </h3>
          {#if form.description}
            <p class="text-sm" style="color: {$colorStore.muted};">
              {form.description}
            </p>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Filter Tabs -->
  <div
    class=" rounded-xl border p-4"
    style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
  >
    <div class="flex items-center gap-2 flex-wrap">
      <button
        class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
        onclick={() => (filterStatus = "all")}
        style="background: {filterStatus === 'all' ? $colorStore.primary : $colorStore.primary + '15'}; color: {filterStatus === 'all' ? 'white' : $colorStore.text};"
      >
        All Pending
      </button>
      <button
        class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
        onclick={() => (filterStatus = "Pending")}
        style="background: {filterStatus === 'Pending' ? '#f59e0b' : $colorStore.primary + '15'}; color: {filterStatus === 'Pending' ? 'white' : $colorStore.text};"
      >
        <i class="fa-solid fa-clock mr-1"></i>
        Pending
      </button>
      <button
        class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
        onclick={() => (filterStatus = "UnderReview")}
        style="background: {filterStatus === 'UnderReview' ? '#3b82f6' : $colorStore.primary + '15'}; color: {filterStatus === 'UnderReview' ? 'white' : $colorStore.text};"
      >
        <i class="fa-solid fa-search mr-1"></i>
        Under Review
      </button>
      <button
        class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
        onclick={() => (filterStatus = "Approved")}
        style="background: {filterStatus === 'Approved' ? '#10B981' : $colorStore.primary + '15'}; color: {filterStatus === 'Approved' ? 'white' : $colorStore.text};"
      >
        <i class="fa-solid fa-check-circle mr-1"></i>
        Approved
      </button>
      <button
        class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
        onclick={() => (filterStatus = "Rejected")}
        style="background: {filterStatus === 'Rejected' ? '#ef4444' : $colorStore.primary + '15'}; color: {filterStatus === 'Rejected' ? 'white' : $colorStore.text};"
      >
        <i class="fa-solid fa-times-circle mr-1"></i>
        Rejected
      </button>
    </div>
  </div>

  <!-- Responses List -->
  {#if loading}
    <div
      class=" rounded-xl border p-12 text-center"
      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
    >
      <div
        class="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
        style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"
      ></div>
      <p style="color: {$colorStore.muted};">Loading responses...</p>
    </div>
  {:else if error}
    <div
      class=" rounded-xl border p-6"
      style="background: #ef444410; border-color: #ef444430;"
    >
      <div class="flex items-center gap-3">
        <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444; font-size: 20px;"></i>
        <span style="color: #ef4444;">{error}</span>
      </div>
    </div>
  {:else if pendingResponses.length === 0}
    <div
      class=" rounded-xl border p-12 text-center"
      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
    >
      <i
        class="fa-solid fa-inbox mb-4"
        style="color: {$colorStore.muted}; font-size: 48px; display: block;"
      ></i>
      <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text};">
        No {filterStatus === "all" ? "pending" : filterStatus.toLowerCase()} responses
      </h3>
      <p style="color: {$colorStore.muted};">
        {#if filterStatus === "all"}
          Responses awaiting review will appear here
        {:else}
          No responses with status "{filterStatus}"
        {/if}
      </p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each pendingResponses as item, index (item.response.id)}
        {@const itemStatusStr = intToResponseStatus(item.workflow.status)}
        <div
          class=" rounded-xl border overflow-hidden transition-all hover:shadow-lg"
          style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
          in:slide={{ duration: 300, delay: index * 50 }}
        >
          <div
            class="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            style="background: {$colorStore.primary}08; border-bottom: 1px solid {$colorStore.primary}20;"
          >
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div
                class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style="background: {item.response.userId ? $colorStore.primary + '20' : '#8b5cf620'}; color: {item.response.userId ? $colorStore.primary : '#8b5cf6'};"
              >
                {#if item.response.userId}
                  #{item.response.id}
                {:else}
                  <i class="fa-solid fa-user-secret"></i>
                {/if}
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-semibold truncate" style="color: {$colorStore.text};">
                  {#if item.response.userId}
                    {item.response.username || `User ${item.response.userId}`}
                  {:else}
                    <span style="color: #8b5cf6;">
                      <i class="fa-solid fa-user-secret mr-1"></i>
                      Anonymous
                    </span>
                  {/if}
                </div>
                <div class="text-sm flex items-center gap-2 flex-wrap" style="color: {$colorStore.muted};">
                  <span>
                    <i class="fa-solid fa-clock mr-1"></i>
                    {formatDate(item.response.submittedAt)}
                  </span>
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style="background: {RESPONSE_STATUS_LABELS[itemStatusStr].color}20; color: {RESPONSE_STATUS_LABELS[itemStatusStr].color};"
                  >
                    <i class="fa-solid {RESPONSE_STATUS_LABELS[itemStatusStr].icon} mr-1"></i>
                    {RESPONSE_STATUS_LABELS[itemStatusStr].label}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button
                onclick={() => viewResponse(item)}
                class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
              >
                <i class="fa-solid fa-eye mr-2"></i>
                <span class="hidden sm:inline">Review</span>
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
