<script lang="ts">
  import { fade } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import type { ProductUpdate } from "$lib/content/productUpdates";

  interface Props {
    updates: ProductUpdate[];
    intervalMs?: number;
  }

  let { updates, intervalMs = 9000 }: Props = $props();

  let index = $state(0);
  let paused = $state(false);

  let update = $derived(updates[Math.min(index, updates.length - 1)]);

  /**
   * Rotates through the updates on a timer, holding still while the reader is hovering or
   * tabbing through the card and for anyone who asked for reduced motion.
   */
  $effect(() => {
    if (paused || updates.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      index = (index + 1) % updates.length;
    }, intervalMs);

    return () => clearInterval(timer);
  });

  function show(target: number) {
    index = target;
  }
</script>

<section aria-labelledby="latest-update-heading" class="px-4 py-12 sm:py-16">
  <div class="mx-auto max-w-5xl">
    <div class="update-rule mb-5" style="background: {$colorStore.primary}45;"></div>

    <article
      class="grid overflow-hidden border md:grid-cols-[11rem_minmax(0,1fr)]"
      style="background: linear-gradient(110deg, {$colorStore.gradientStart}0c, {$colorStore.gradientMid}08);
             border-color: {$colorStore.primary}35;"
      onmouseenter={() => (paused = true)}
      onmouseleave={() => (paused = false)}
      onfocusin={() => (paused = true)}
      onfocusout={() => (paused = false)}
    >
      <div class="relative flex min-h-44 flex-col justify-between p-6 sm:p-8"
           style="background: {$colorStore.primary}10; border-right: 1px solid {$colorStore.primary}25;">
        {#key update.id}
          <div class="font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em]"
               style="color: {$colorStore.primary}" in:fade={{ duration: 220 }}>
            {update.label}
          </div>
        {/key}
        <div class="hash-grid absolute inset-x-6 bottom-6 h-16 opacity-70" aria-hidden="true">
          {#each Array(24) as _, index}
            <span style="background: {index % 5 === 0 || index % 7 === 0 ? $colorStore.primary : $colorStore.secondary}"></span>
          {/each}
        </div>
      </div>

      <div class="p-6 sm:p-8 md:p-10">
        <p class="mb-3 text-xs font-semibold uppercase tracking-[0.14em]" style="color: {$colorStore.muted}">
          What Mewdeko has been working on
        </p>
        {#key update.id}
          <div in:fade={{ duration: 220 }}>
            <h2 id="latest-update-heading" class="text-2xl font-bold sm:text-3xl" style="color: {$colorStore.text}">
              {update.title}
            </h2>
            <p class="mt-3 max-w-2xl text-base leading-relaxed sm:text-lg" style="color: {$colorStore.muted}">
              {update.summary}
            </p>

            <ul class="mt-6 grid gap-3 text-sm sm:grid-cols-3" style="color: {$colorStore.text}">
              {#each update.details as detail}
                <li class="border-l-2 pl-3 leading-relaxed" style="border-color: {$colorStore.secondary}75;">
                  {detail}
                </li>
              {/each}
            </ul>

            <a
              class="mt-7 inline-flex items-center gap-2 border-b pb-1 text-sm font-semibold transition-opacity hover:opacity-70 focus:outline-hidden focus:ring-2 focus:ring-offset-4"
              href={update.href}
              style="color: {$colorStore.primary}; border-color: {$colorStore.primary}80; --tw-ring-color: {$colorStore.primary}; --tw-ring-offset-color: {$colorStore.gradientStart};"
            >
              {update.action}
              <span aria-hidden="true">→</span>
            </a>
          </div>
        {/key}

        {#if updates.length > 1}
          <div class="mt-8 flex items-center gap-3">
            {#each updates as item, position (item.id)}
              <button
                class="h-11 px-1 focus:outline-hidden focus:ring-2 focus:ring-offset-4"
                style="--tw-ring-color: {$colorStore.primary}; --tw-ring-offset-color: {$colorStore.gradientStart};"
                aria-label={item.title}
                aria-current={position === index}
                onclick={() => show(position)}
              >
                <span
                  class="block h-0.5 w-8 transition-opacity"
                  style="background: {$colorStore.primary}; opacity: {position === index ? 1 : 0.28};"
                ></span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </article>
  </div>
</section>

<style>
  .update-rule {
    height: 2px;
    width: min(11rem, 35%);
  }

  .hash-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 5px;
  }

  .hash-grid span {
    opacity: 0.2;
  }

  .hash-grid span:nth-child(3n) {
    opacity: 0.5;
  }

  @media (max-width: 767px) {
    article > div:first-child {
      min-height: 7.5rem;
      border-right: 0;
      border-bottom: 1px solid var(--color-primary);
    }

    .hash-grid {
      inset: auto 1.5rem 1.5rem;
      width: 7rem;
      margin-left: auto;
    }
  }
</style>
