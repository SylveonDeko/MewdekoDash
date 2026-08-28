<script lang="ts">
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import Portal from "$lib/components/ui/Portal.svelte";
  import { type ProductUpdate, productUpdates } from "$lib/content/productUpdates";

  interface Props {
    updates: ProductUpdate[];
    ondismiss: () => void;
    startInArchive?: boolean;
  }

  let { updates, ondismiss, startInArchive = false }: Props = $props();

  let index = $state(0);

  /** Set once the viewer switches view themselves, so their choice wins over the default. */
  let chosenView = $state<boolean | null>(null);

  // Opening from the sidebar, or with nothing new to page through, starts on the history.
  let showingArchive = $derived(chosenView ?? (startInArchive || updates.length === 0));

  let current = $derived(updates[index]);
  let isLast = $derived(index >= updates.length - 1);

  /**
   * Moves to the next update, or closes once the last one has been read.
   */
  function next() {
    if (isLast) {
      ondismiss();
      return;
    }

    index += 1;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") ondismiss();
  }
</script>

{#if showingArchive || current}
  <Portal>
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style="background: rgba(0, 0, 0, 0.45);"
      onclick={ondismiss}
      onkeydown={handleKeydown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-update-title"
      tabindex="-1"
    >
      <div
        class="w-full max-w-lg rounded-2xl border shadow-2xl"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="presentation"
        in:fly={{ y: 20, duration: 200 }}
        out:fly={{ y: -20, duration: 150 }}
      >
        <div class="flex items-start gap-3 border-b p-6" style="border-color: {$colorStore.primary}20;">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style="background: {$colorStore.primary}20;"
          >
            <i
              class="fa-utility-duo fa-regular fa-sparkles"
              style="--fa-primary-color: {$colorStore.primary};
                     --fa-secondary-color: {$colorStore.primary};
                     font-size: 20px;"
              aria-hidden="true"
            ></i>
          </span>
          <div class="min-w-0 flex-1">
            {#if showingArchive}
              <h2 id="product-update-title" class="text-lg font-semibold" style="color: {$colorStore.text}">
                Everything that's new
              </h2>
            {:else}
              <span class="block text-xs font-semibold uppercase tracking-[0.12em]"
                    style="color: {$colorStore.primary}">
                {current.label}
              </span>
              <h2 id="product-update-title" class="text-lg font-semibold" style="color: {$colorStore.text}">
                {current.title}
              </h2>
            {/if}
          </div>
          <button
            class="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors hover:opacity-70"
            style="color: {$colorStore.muted};"
            onclick={ondismiss}
            aria-label="Dismiss updates"
          >
            <i class="fa-solid fa-xmark" style="font-size: 16px;"></i>
          </button>
        </div>

        {#if showingArchive}
          <div class="max-h-[55vh] space-y-5 overflow-y-auto p-6">
            {#each productUpdates as update (update.id)}
              <div class="border-b pb-5 last:border-0 last:pb-0" style="border-color: {$colorStore.primary}15;">
                <span class="block text-xs font-semibold uppercase tracking-[0.12em]"
                      style="color: {$colorStore.primary}">
                  {update.label}
                </span>
                <h3 class="mt-0.5 text-base font-semibold" style="color: {$colorStore.text}">{update.title}</h3>
                <p class="mt-1 text-sm leading-relaxed" style="color: {$colorStore.muted}">{update.summary}</p>
                <a
                  class="mt-2 inline-flex text-sm font-medium hover:opacity-70"
                  href={update.href}
                  onclick={ondismiss}
                  style="color: {$colorStore.primary}"
                >
                  {update.action} →
                </a>
              </div>
            {/each}
          </div>
        {:else}
          <div class="space-y-4 p-6">
            <p class="text-sm leading-relaxed" style="color: {$colorStore.muted}">{current.summary}</p>

            <ul class="space-y-2">
              {#each current.details as detail (detail)}
                <li class="flex gap-2.5 text-sm" style="color: {$colorStore.muted}">
                  <i class="fa-solid fa-check mt-1 shrink-0" style="color: {$colorStore.primary}; font-size: 12px;"
                     aria-hidden="true"></i>
                  <span>{detail}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        <div class="flex flex-wrap items-center gap-3 border-t p-6" style="border-color: {$colorStore.primary}20;">
          {#if !showingArchive && updates.length > 1}
            <span class="text-xs" style="color: {$colorStore.muted}">
              {index + 1} of {updates.length}
            </span>
          {/if}

          <div class="ml-auto flex flex-wrap items-center gap-3">
            {#if updates.length > 0}
              <button
                class="flex min-h-[44px] items-center rounded-xl px-4 text-sm font-medium transition-all hover:opacity-80"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary};
                       border: 1px solid {$colorStore.primary}30;"
                onclick={() => (chosenView = !showingArchive)}
              >
                {showingArchive ? "Back" : "See all updates"}
              </button>
            {/if}

            {#if !showingArchive}
              <a
                class="flex min-h-[44px] items-center rounded-xl px-4 text-sm font-medium transition-all hover:opacity-80"
                href={current.href}
                onclick={ondismiss}
                style="background: {$colorStore.primary}20; color: {$colorStore.primary};
                       border: 1px solid {$colorStore.primary}30;"
              >
                {current.action}
              </a>
            {/if}

            <button
              class="flex min-h-[44px] items-center rounded-xl px-4 text-sm font-medium transition-all hover:opacity-80"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary};
                     border: 1px solid {$colorStore.primary}30;"
              onclick={showingArchive ? ondismiss : next}
            >
              {showingArchive || isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Portal>
{/if}
