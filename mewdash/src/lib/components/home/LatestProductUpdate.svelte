<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { ProductUpdate } from "$lib/content/productUpdates";

  interface Props {
    updates: ProductUpdate[];
    /** How many of the newest updates to show. */
    count?: number;
  }

  let { updates, count = 3 }: Props = $props();

  let latest = $derived(updates.slice(0, count));
</script>

<section aria-labelledby="latest-update-heading" class="px-4 py-12 sm:py-16">
  <div class="mx-auto max-w-6xl">
    <div class="flex flex-wrap items-baseline justify-between gap-3 mb-8">
      <h2 id="latest-update-heading" class="text-2xl font-bold sm:text-3xl" style="color: {$colorStore.text}">
        {m.home.updateHeading()}
      </h2>
      <a href="/updates" class="text-sm font-semibold min-h-[44px] inline-flex items-center" style="color: {$colorStore.primary}">
        {m.home.updateSeeAll()}
      </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3" style="--rule: {$colorStore.primary}20;">
      {#each latest as update (update.id)}
        <article class="min-w-0 py-6 md:py-0 md:px-6 first:md:pl-0 last:md:pr-0">
          <div class="font-mono text-xs font-bold mb-2" style="color: {$colorStore.primary}">{update.label}</div>
          <h3 class="text-lg font-bold leading-snug" style="color: {$colorStore.text}">{update.title}</h3>
          <p class="mt-2 text-sm leading-relaxed" style="color: {$colorStore.muted}">{update.summary}</p>
          <a class="mt-4 inline-flex items-center gap-2 border-b pb-1 text-sm font-semibold transition-opacity hover:opacity-70"
             href={update.href} style="color: {$colorStore.primary}; border-color: {$colorStore.primary}80;">
            {update.action}
          </a>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  article + article {
    border-top: 1px solid var(--rule);
  }

  @media (min-width: 768px) {
    article + article {
      border-top: 0;
      border-left: 1px solid var(--rule);
    }
  }
</style>
