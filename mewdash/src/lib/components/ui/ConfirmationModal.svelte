<script lang="ts">

  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import Portal from "./Portal.svelte";

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
    close();
    onconfirm?.();
  }

  function handleCancel() {
    close();
    oncancel?.();
  }

  function close() {
    const scrollPosition = typeof window === "undefined"
      ? null
      : { x: window.scrollX, y: window.scrollY };

    isOpen = false;

    if (scrollPosition) {
      requestAnimationFrame(() => window.scrollTo(scrollPosition.x, scrollPosition.y));
    }
  }

  let dialogEl = $state<HTMLElement>();
  let previouslyFocused: HTMLElement | null = null;

  function focusableWithin(): HTMLElement[] {
    if (!dialogEl) return [];
    return [
      ...dialogEl.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ];
  }

  /**
   * Keeps Tab inside the dialog. Without this, tabbing walks the page behind, which
   * is especially wrong here because the dialog renders through a Portal at the end
   * of the body and is therefore nowhere near its trigger in the tab order.
   */
  function trapTab(event: KeyboardEvent) {
    const focusable = focusableWithin();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === dialogEl)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      handleCancel();
    } else if (event.key === "Enter" && !confirmDisabled) {
      handleConfirm();
    } else if (event.key === "Tab") {
      trapTab(event);
    }
  }

  /**
   * Listens on the window rather than the dialog element. The handler used to be bound
   * to the backdrop, which never received focus, so Escape silently did nothing until
   * the user happened to click or tab into the dialog first.
   */
  $effect(() => {
    if (!isOpen || typeof window === "undefined") return;

    previouslyFocused = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => dialogEl?.focus());
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      previouslyFocused?.focus?.();
      previouslyFocused = null;
    };
  });

  let variantColor = $derived(variant === "danger" ? $colorStore.accent : 
                   variant === "warning" ? "#f59e0b" : 
                   $colorStore.primary);
</script>

{#if isOpen}
  <!-- Backdrop -->
  <Portal>
  <div
    class="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4"
    onclick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
    role="presentation"
  >
    <!-- Modal -->
    <div
      bind:this={dialogEl}
      class="rounded-2xl border shadow-2xl max-w-md w-full"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30;"
      in:fly={{ y: 20, duration: 200 }}
      out:fly={{ y: -20, duration: 150 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      tabindex="-1"
    >
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
        <button type="button" aria-label="Button action"
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
          type="button"
          class="flex-1 px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80 min-h-[44px]"
          style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
          onclick={handleCancel}
        >
          {cancelText}
        </button>
        <button
          type="button"
          class="flex-1 px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80 disabled:opacity-50 min-h-[44px]"
          style="background: {variantColor}20; color: {variantColor}; border: 1px solid {variantColor}30;"
          onclick={handleConfirm}
          disabled={confirmDisabled}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
  </Portal>
{/if}
