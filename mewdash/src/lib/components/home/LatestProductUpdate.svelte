<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import type { ProductUpdate } from "$lib/content/productUpdates";

  interface Props {
    update: ProductUpdate;
  }

  let { update }: Props = $props();
</script>

<section aria-labelledby="latest-update-heading" class="px-4 py-12 sm:py-16">
  <div class="mx-auto max-w-5xl">
    <div class="update-rule mb-5" style="background: {$colorStore.primary}45;"></div>

    <article
      class="grid overflow-hidden border md:grid-cols-[11rem_minmax(0,1fr)]"
      style="background: linear-gradient(110deg, {$colorStore.gradientStart}0c, {$colorStore.gradientMid}08);
             border-color: {$colorStore.primary}35;"
    >
      <div class="relative flex min-h-44 flex-col justify-between p-6 sm:p-8"
           style="background: {$colorStore.primary}10; border-right: 1px solid {$colorStore.primary}25;">
        <div class="font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em]" style="color: {$colorStore.primary}">
          {update.label}
        </div>
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
