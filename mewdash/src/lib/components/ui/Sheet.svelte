<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import { fly } from "svelte/transition";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import Portal from "$lib/components/ui/Portal.svelte";

  type Size = "md" | "lg" | "xl" | "2xl";

  interface Props {
    title: string;
    onclose: () => void;
    /** md for small forms, lg for medium editors, xl for big editors. */
    size?: Size;
    /** Shows a back arrow before the title and calls this instead of closing. */
    onback?: () => void;
    /** Controls shown in the sticky header beside the close button. */
    actions?: Snippet;
    /** Sticky footer. Leave out when there is nothing to confirm. */
    footer?: Snippet;
    children: Snippet;
  }

  let { title, onclose, size = "md", onback, actions, footer, children }: Props = $props();

  setContext("surface", "sheet");

  const widths: Record<Size, string> = { md: "max-w-3xl", lg: "max-w-4xl", xl: "max-w-6xl", "2xl": "max-w-[1440px]" };
  const heights: Record<Size, string> = {
    md: "sm:min-h-0",
    lg: "sm:min-h-0",
    xl: "sm:min-h-[calc(100dvh-3rem)]",
    "2xl": "sm:min-h-[calc(100dvh-3rem)]"
  };
  const padding: Record<Size, string> = { md: "sm:p-8", lg: "sm:p-8", xl: "sm:p-6", "2xl": "sm:p-6" };

  let dialogEl = $state<HTMLElement>();

  function back() {
    if (onback) onback();
    else onclose();
  }

  function focusable(): HTMLElement[] {
    if (!dialogEl) return [];
    return [
      ...dialogEl.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])'
      )
    ];
  }

  function onKey(event: KeyboardEvent) {
    if (!dialogEl?.contains(event.target as Node)) return;
    if (event.key === "Escape") {
      if (!dialogEl.querySelector('[aria-expanded="true"][aria-haspopup]')) back();
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogEl)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  $effect(() => {
    const previous = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => dialogEl?.focus());
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  });
</script>

<Portal>
  <div
    class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overflow-x-hidden overscroll-contain sm:backdrop-blur-md {padding[size]}
           [background:var(--sheet)] sm:[background:var(--overlay)]"
    style="--sheet: {$colorStore.surface}; --overlay: {$colorStore.background}aa;"
    onclick={(e) => {
      if (e.target === e.currentTarget) onclose();
    }}
    role="presentation"
  >
    <div
      bind:this={dialogEl}
      tabindex="-1"
      class="w-full {widths[size]} min-w-0 min-h-full {heights[size]} flex flex-col sm:block rounded-none sm:rounded-2xl border-0 sm:border sm:shadow-2xl"
      style="background: {$colorStore.surface}; border-color: {$colorStore.primary}30;"
      in:fly={{ y: 20, duration: 200 }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        class="flex flex-wrap items-center gap-3 p-4 border-b sticky top-0 z-30 sm:static sm:rounded-t-2xl"
        style="background: {$colorStore.surface}; border-color: {$colorStore.primary}20;"
      >
        {#if onback}
          <button
            type="button"
            class="px-4 rounded-lg min-h-[44px]"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            aria-label={m.common.back()}
            onclick={onback}
          >
            <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
          </button>
        {/if}
        <h3 class="grow min-w-0 text-base font-semibold truncate" style="color: {$colorStore.text}">{title}</h3>
        {@render actions?.()}
        <button
          type="button"
          class="px-4 rounded-lg min-h-[44px]"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
          aria-label={m.common.close()}
          onclick={onclose}
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>

      <div class="grow min-w-0 p-4 sm:p-6 space-y-4">
        {@render children()}
      </div>

      {#if footer}
        <div
          class="flex flex-wrap items-center justify-end gap-2 px-4 py-2 border-t sticky bottom-0 z-30 sm:static sm:rounded-b-2xl"
          style="background: {$colorStore.surface}; border-color: {$colorStore.primary}20;"
        >
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
</Portal>
