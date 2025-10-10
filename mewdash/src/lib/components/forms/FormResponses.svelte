<!-- lib/components/forms/FormResponses.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import {
    type Form,
    type FormAnswer,
    type FormQuestion,
    type FormResponse,
    formsApi,
    type PaginatedResponses
  } from "$lib/api/index.ts";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { loadingStore } from "$lib/stores/loadingStore";
  import { fade, slide } from "svelte/transition";
  import { escapeHtml } from "$lib/utils/sanitize";

  interface Props {
    formId: number;
    onShowNotification: (message: string, type: "success" | "error") => void;
  }

  let { formId, onShowNotification }: Props = $props();

  let form = $state<Form | null>(null);
  let questions = $state<FormQuestion[]>([]);
  let paginatedData = $state<PaginatedResponses | null>(null);
  let currentPage = $state(1);
  let pageSize = $state(20);
  let selectedResponse = $state<{ response: FormResponse; answers: FormAnswer[] } | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let showResponseModal = $state(false);
  let showShareLinkModal = $state(false);
  let currentShareLink = $state("");

  async function loadForm() {
    try {
      form = await formsApi.getForm(formId);
      questions = await formsApi.getFormQuestions(formId);
    } catch (err) {
      console.error("Failed to load form:", err);
    }
  }

  async function loadResponses() {
    return await loadingStore.wrap("load-responses", async () => {
      try {
        loading = true;
        error = null;
        paginatedData = await formsApi.getFormResponses(formId, currentPage, pageSize);
      } catch (err) {
        error = err instanceof Error ? err.message : "Failed to load responses";
      } finally {
        loading = false;
      }
    }, "api", "Loading responses...");
  }

  async function viewResponse(responseId: number) {
    return await loadingStore.wrap("load-response", async () => {
      try {
        selectedResponse = await formsApi.getResponseDetails(responseId);
        showResponseModal = true;
      } catch (err) {
        onShowNotification("Failed to load response details", "error");
      }
    }, "operation", "Loading response...");
  }

  async function deleteResponse(responseId: number) {
    if (!confirm("Are you sure you want to delete this response?")) return;

    return await loadingStore.wrap("delete-response", async () => {
      try {
        await formsApi.deleteResponse(responseId);
        onShowNotification("Response deleted successfully", "success");
        await loadResponses();
        if (selectedResponse?.response.id === responseId) {
          closeModal();
        }
      } catch (err) {
        onShowNotification("Failed to delete response", "error");
      }
    }, "operation", "Deleting response...");
  }

  function closeModal() {
    showResponseModal = false;
    selectedResponse = null;
  }

  function getQuestionById(questionId: number): FormQuestion | undefined {
    return questions.find((q) => q.id === questionId);
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  function goToPage(newPage: number) {
    currentPage = newPage;
    loadResponses();
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(currentShareLink).then(() => {
      onShowNotification("Link copied to clipboard!", "success");
      showShareLinkModal = false;
    }).catch(() => {
      onShowNotification("Failed to copy to clipboard", "error");
    });
  }

  onMount(async () => {
    await loadForm();
    await loadResponses();
  });

  $effect(() => {
    if ($currentGuild && formId) {
      loadForm();
      loadResponses();
    }
  });
</script>

<!-- Share Link Modal -->
{#if showShareLinkModal}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onclick={() => (showShareLinkModal = false)}
    onkeydown={(e) => e.key === 'Escape' && (showShareLinkModal = false)}
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
          <i class="fa-solid fa-link mr-2" style="color: {$colorStore.primary};"></i>
          Share Form
        </h2>
        <button
          onclick={() => (showShareLinkModal = false)}
          class="p-2 rounded-lg transition-all hover:scale-110"
          style="background: {$colorStore.primary}20; color: {$colorStore.text};"
          aria-label="Close share modal"
        >
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <p class="mb-4 text-sm" style="color: {$colorStore.muted};">
        Share this link with your community to allow them to submit the form:
      </p>

      <div class="mb-4">
        <input
          type="text"
          readonly
          value={currentShareLink}
          onclick={(e) => e.currentTarget.select()}
          class="w-full p-3 rounded-lg font-mono text-sm"
          style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
        />
      </div>

      <div class="flex gap-3">
        <button
          onclick={copyToClipboard}
          class="flex-1 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
          style="background: linear-gradient(135deg, {$colorStore.primary}, {$colorStore.secondary}); color: white;"
        >
          <i class="fa-solid fa-copy mr-2"></i>
          Copy to Clipboard
        </button>
        <button
          onclick={() => (showShareLinkModal = false)}
          class="px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Response Details Modal -->
{#if showResponseModal && selectedResponse}
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
          <p class="text-sm" style="color: {$colorStore.muted};">
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
        </div>
        <button
          onclick={closeModal}
          class="p-2 rounded-lg transition-all hover:scale-110"
          style="background: {$colorStore.primary}20; color: {$colorStore.text};"
          aria-label="Close response modal"
        >
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <div class="space-y-4">
        {#each selectedResponse.answers as answer}
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

      <div class="mt-6 flex gap-3 justify-end">
        <button
          onclick={() => selectedResponse && deleteResponse(selectedResponse.response.id)}
          class="px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
          style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
        >
          <i class="fa-solid fa-trash mr-2"></i>
          Delete
        </button>
        <button
          onclick={closeModal}
          class="px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
          style="background: {$colorStore.primary}; color: white;"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

<div class="space-y-6">
  <!-- Form Info -->
  {#if form}
    <div
      class="backdrop-blur-xs rounded-xl border p-6"
      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
    >
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-lg font-bold" style="color: {$colorStore.text};">
              {form.name}
            </h3>
            {#if form.isDraft}
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  style="background: #f59e0b20; color: #f59e0b;"
                >
                  Draft
                </span>
            {/if}
          </div>
          {#if form.description}
            <p class="text-sm" style="color: {$colorStore.muted};">
              {form.description}
            </p>
          {/if}
        </div>
        <div class="flex items-center gap-6 flex-wrap">
          <div class="text-center">
            <div class="text-2xl font-bold" style="color: {$colorStore.primary};">
              {form.responseCount || 0}
            </div>
            <div class="text-xs" style="color: {$colorStore.muted};">Total</div>
          </div>
          {#if form.maxResponses}
            <div class="text-center">
              <div class="text-2xl font-bold" style="color: {$colorStore.secondary};">
                {form.maxResponses}
              </div>
              <div class="text-xs" style="color: {$colorStore.muted};">Max</div>
            </div>
          {/if}
          <div class="text-center">
            <div
              class="text-2xl font-bold"
              style="color: {form.isActive ? '#10B981' : '#6B7280'};"
            >
              {form.isActive ? "✓" : "✗"}
            </div>
            <div class="text-xs" style="color: {$colorStore.muted};">
              {form.isActive ? "Active" : "Inactive"}
            </div>
          </div>
          {#if form.expiresAt}
            {@const timeRemaining = new Date(form.expiresAt).getTime() - Date.now()}
            {@const isExpired = timeRemaining <= 0}
            <div class="text-center">
              <div
                class="text-2xl font-bold"
                style="color: {isExpired ? '#ef4444' : '#10B981'};"
              >
                {#if isExpired}
                  <i class="fa-solid fa-clock"></i>
                {:else if timeRemaining < 3600000}
                  {Math.floor(timeRemaining / 60000)}m
                {:else if timeRemaining < 86400000}
                  {Math.floor(timeRemaining / 3600000)}h
                {:else}
                  {Math.floor(timeRemaining / 86400000)}d
                {/if}
              </div>
              <div class="text-xs" style="color: {$colorStore.muted};">
                {isExpired ? "Expired" : "Remaining"}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Responses List -->
  {#if loading}
    <div
      class="backdrop-blur-xs rounded-xl border p-12 text-center"
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
      class="backdrop-blur-xs rounded-xl border p-6"
      style="background: #ef444410; border-color: #ef444430;"
    >
      <div class="flex items-center gap-3">
        <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444; font-size: 20px;"></i>
        <span style="color: #ef4444;">{error}</span>
      </div>
    </div>
  {:else if paginatedData && paginatedData.responses.length === 0}
    <div
      class="backdrop-blur-xs rounded-xl border p-12 text-center"
      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
    >
      <i
        class="fa-solid fa-inbox mb-4"
        style="color: {$colorStore.muted}; font-size: 48px; display: block;"
      ></i>
      <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text};">No responses yet</h3>
      <p class="mb-6" style="color: {$colorStore.muted};">
        Responses will appear here once users start submitting the form
      </p>
      <button
        onclick={async () => {
            await loadingStore.wrap("generate-link", async () => {
              try {
                const instance = $currentInstance;
                if (!instance) {
                  onShowNotification("No instance selected", "error");
                  return;
                }

                const { shareCode } = await formsApi.generateShareLink(formId, instance.port.toString());
                currentShareLink = `${window.location.origin}/forms/${shareCode}`;
                showShareLinkModal = true;
              } catch (err) {
                onShowNotification("Failed to generate share link", "error");
              }
            }, "operation", "Generating link...");
          }}
        class="px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
        style="background: linear-gradient(135deg, {$colorStore.primary}, {$colorStore.secondary}); color: white;"
      >
        <i class="fa-solid fa-link mr-2"></i>
        Get Share Link
      </button>
    </div>
  {:else if paginatedData}
    <div class="space-y-4">
      {#each paginatedData.responses as response, index (response.id)}
        <div
          class="backdrop-blur-xs rounded-xl border overflow-hidden transition-all hover:shadow-lg"
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
                style="background: {response.userId ? $colorStore.primary + '20' : '#8b5cf620'}; color: {response.userId ? $colorStore.primary : '#8b5cf6'};"
              >
                {#if response.userId}
                  #{response.id}
                {:else}
                  <i class="fa-solid fa-user-secret"></i>
                {/if}
              </div>
              <div class="min-w-0">
                <div class="font-semibold truncate" style="color: {$colorStore.text};">
                  {#if response.userId}
                    {response.username || `User ${response.userId}`}
                  {:else}
                      <span style="color: #8b5cf6;">
                        <i class="fa-solid fa-user-secret mr-1"></i>
                        Anonymous
                      </span>
                  {/if}
                </div>
                <div class="text-sm" style="color: {$colorStore.muted};">
                  <i class="fa-solid fa-clock mr-1"></i>
                  {formatDate(response.submittedAt)}
                </div>
              </div>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button
                onclick={() => viewResponse(response.id)}
                class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
              >
                <i class="fa-solid fa-eye mr-2"></i>
                <span class="hidden sm:inline">View</span>
              </button>
              <button
                onclick={() => deleteResponse(response.id)}
                class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
                style="background: #ef444415; color: #ef4444; border: 1px solid #ef444430;"
              >
                <i class="fa-solid fa-trash mr-2"></i>
                <span class="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>
      {/each}

      <!-- Pagination -->
      {#if paginatedData && paginatedData.totalPages > 1}
        <div
          class="backdrop-blur-xs rounded-xl border p-4"
          style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
        >
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div class="text-sm" style="color: {$colorStore.muted};">
              Page {paginatedData.page} of {paginatedData.totalPages} ({paginatedData.totalCount} total)
            </div>
            <div class="flex gap-2">
              <button
                onclick={() => goToPage(1)}
                disabled={currentPage === 1}
                class="px-3 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                aria-label="Go to first page"
              >
                <i class="fa-solid fa-angles-left"></i>
              </button>
              <button
                onclick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                class="px-3 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                aria-label="Go to previous page"
              >
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <div
                class="px-4 py-2 rounded-lg font-medium"
                style="background: {$colorStore.primary}10; color: {$colorStore.text};"
              >
                {currentPage}
              </div>
              <button
                onclick={() => goToPage(currentPage + 1)}
                disabled={!paginatedData || currentPage === paginatedData.totalPages}
                class="px-3 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                aria-label="Go to next page"
              >
                <i class="fa-solid fa-chevron-right"></i>
              </button>
              <button
                onclick={() => paginatedData && goToPage(paginatedData.totalPages)}
                disabled={!paginatedData || currentPage === paginatedData.totalPages}
                class="px-3 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                aria-label="Go to last page"
              >
                <i class="fa-solid fa-angles-right"></i>
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
