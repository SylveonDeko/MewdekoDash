<!-- lib/dashboard/suggestions/StatusChangeModal.svelte -->
<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { Check, X } from "lucide-svelte";
  import { type SuggestionsModel, SuggestionState } from "$lib/types/models.ts";

  export let suggestion: SuggestionsModel | null = null;
  export let status: SuggestionState | null = null;
  export let colors: any;
  export let onConfirm: (reason: string) => void;
  export let onClose: () => void;

  let reason = "";

  function getStatusString(status: SuggestionState): string {
    return {
      [SuggestionState.Pending]: "Pending",
      [SuggestionState.Accepted]: "Accepted",
      [SuggestionState.Denied]: "Denied",
      [SuggestionState.Considered]: "Considered",
      [SuggestionState.Implemented]: "Implemented"
    }[status] || "Unknown";
  }

  function handleConfirm() {
    onConfirm(reason);
    reason = "";
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") onClose();
    if (event.key === "Enter" && event.ctrlKey) handleConfirm();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div
  class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
  transition:fade={{ duration: 200 }}
  on:click|self={onClose}
>
  <div
    class="w-full max-w-md rounded-xl border shadow-xl p-6"
    style="background: linear-gradient(135deg, {colors.gradientStart}15, {colors.gradientMid}15);
           border-color: {colors.primary}30;"
    transition:slide={{ duration: 200 }}
    role="dialog"
    aria-labelledby="modal-title"
  >
    <h2
      id="modal-title"
      class="text-xl font-semibold mb-4"
      style="color: {colors.text}"
    >
      Update Status to {suggestion && status !== null ? getStatusString(status) : ''}
    </h2>

    <div class="space-y-4">
      <div>
        <label
          for="status-reason"
          class="block text-sm font-medium mb-2"
          style="color: {colors.muted}"
        >
          Reason (optional)
        </label>
        <textarea
          id="status-reason"
          bind:value={reason}
          class="w-full rounded-lg border p-3 bg-gray-800 focus:ring-2 transition-all duration-200"
          style="border-color: {colors.primary}30;
                 color: {colors.text};
                 focus:ring-color: {colors.primary}50;"
          rows="3"
          placeholder="Enter reason for the status change..."
        ></textarea>
        <p class="mt-1 text-sm" style="color: {colors.muted}">
          Press Ctrl+Enter to confirm
        </p>
      </div>

      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
          style="background: {colors.accent}20;
                 color: {colors.accent};"
          on:click={onClose}
        >
          <X class="w-4 h-4" />
          Cancel
        </button>
        <button
          class="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
          style="background: {colors.primary};
                 color: {colors.text};"
          on:click={handleConfirm}
        >
          <Check class="w-4 h-4" />
          Confirm
        </button>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
    textarea {
        @apply resize-none;
    }

    button {
        @apply focus:outline-none focus:ring-2 focus:ring-opacity-50;
    }

    button:focus {
        @apply ring-offset-gray-900;
    }

    /* Improve focus visibility */
    textarea:focus {
        @apply outline-none;
    }

    /* Improve scrollbar styling */
    textarea::-webkit-scrollbar {
        @apply w-2;
    }

    textarea::-webkit-scrollbar-track {
        @apply bg-gray-700 rounded-full;
    }

    textarea::-webkit-scrollbar-thumb {
        @apply bg-gray-600 rounded-full;
    }

    textarea::-webkit-scrollbar-thumb:hover {
        @apply bg-gray-500;
    }
</style>