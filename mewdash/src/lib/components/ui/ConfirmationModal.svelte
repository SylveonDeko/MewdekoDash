<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { AlertTriangle, X } from "lucide-svelte";

  const dispatch = createEventDispatcher();

  export let isOpen = false;
  export let title = "Confirm Action";
  export let message = "Are you sure you want to proceed?";
  export let confirmText = "Confirm";
  export let cancelText = "Cancel";
  export let variant: "danger" | "warning" | "info" = "danger";
  export let confirmDisabled = false;

  function handleConfirm() {
    dispatch("confirm");
    close();
  }

  function handleCancel() {
    dispatch("cancel");
    close();
  }

  function close() {
    isOpen = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      handleCancel();
    } else if (event.key === "Enter" && !confirmDisabled) {
      handleConfirm();
    }
  }

  $: variantColor = variant === "danger" ? $colorStore.accent : 
                   variant === "warning" ? "#f59e0b" : 
                   $colorStore.primary;
</script>

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50 p-4"
    on:click={handleCancel}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    aria-describedby="modal-description"
    tabindex="-1"
  >
    <!-- Modal -->
    <div
      class="rounded-2xl border shadow-2xl max-w-md w-full backdrop-blur-sm"
      style="background: {$colorStore.background}90; border-color: {$colorStore.primary}30;"
      on:click|stopPropagation
      in:fly={{ y: 20, duration: 200 }}
      out:fly={{ y: -20, duration: 150 }}
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b" style="border-color: {$colorStore.primary}20;">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg" style="background: {variantColor}20;">
            <AlertTriangle class="w-5 h-5" style="color: {variantColor}" />
          </div>
          <h2 id="modal-title" class="text-lg font-semibold" style="color: {$colorStore.text}">
            {title}
          </h2>
        </div>
        <button
          class="p-2 rounded-lg transition-colors hover:opacity-70"
          style="background: {$colorStore.primary}10; color: {$colorStore.muted}"
          on:click={handleCancel}
          aria-label="Close modal"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <p id="modal-description" class="text-sm leading-relaxed" style="color: {$colorStore.muted}">
          {message}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 p-6 pt-0">
        <button
          class="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}"
          on:click={handleCancel}
        >
          {cancelText}
        </button>
        <button
          class="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80 disabled:opacity-50"
          style="background: {variantColor}; color: white"
          on:click={handleConfirm}
          disabled={confirmDisabled}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}