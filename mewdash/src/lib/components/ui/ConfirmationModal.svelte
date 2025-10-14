<script lang="ts">

    import {fly} from "svelte/transition";
    import {colorStore} from "$lib/stores/colorStore";

  interface Props {
    isOpen?: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    confirmDisabled?: boolean;
    onconfirm?: () => void;
    oncancel?: () => void;
  }

  let {
    isOpen = $bindable(false),
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    confirmDisabled = false,
    onconfirm,
    oncancel
  }: Props = $props();

  function handleConfirm() {
    onconfirm?.();
    close();
  }

  function handleCancel() {
    oncancel?.();
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

  let variantColor = $derived(variant === "danger" ? $colorStore.accent : 
                   variant === "warning" ? "#f59e0b" : 
                   $colorStore.primary);
</script>

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black opacity-50 backdrop-blur-md flex items-center justify-center z-50 p-4"
    onclick={handleCancel}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    aria-describedby="modal-description"
    tabindex="-1"
  >
    <!-- Modal -->
    <div
      class="rounded-2xl border shadow-2xl max-w-md w-full "
      style="background: {$colorStore.background}90; border-color: {$colorStore.primary}30;"
            onclick={(e) => e.stopPropagation()}
      in:fly={{ y: 20, duration: 200 }}
      out:fly={{ y: -20, duration: 150 }}
            role="button" tabindex="0"
            onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); } }}>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b" style="border-color: {$colorStore.primary}20;">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg" style="background: {variantColor}20;">
            <i class="fa-solid fa-triangle-exclamation" style="color: {variantColor}; font-size: 20px;"></i>
          </div>
          <h2 id="modal-title" class="text-lg font-semibold" style="color: {$colorStore.text}">
            {title}
          </h2>
        </div>
        <button aria-label="Button action"
          class="p-2 rounded-lg transition-colors hover:opacity-70"
          style="background: {$colorStore.primary}10; color: {$colorStore.muted}"
          onclick={handleCancel}

        ><i class="fa-solid fa-xmark" style="font-size: 16px;"></i></button>
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
          onclick={handleCancel}
        >
          {cancelText}
        </button>
        <button
          class="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80 disabled:opacity-50"
          style="background: {variantColor}; color: white"
          onclick={handleConfirm}
          disabled={confirmDisabled}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}