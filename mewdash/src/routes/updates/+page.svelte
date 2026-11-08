<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { productUpdates } from "$lib/content/productUpdates";
</script>

<svelte:head>
  <title>{m.home.updatesPageTitle()} - Mewdeko</title>
  <meta content={m.home.updatesPageSubtitle()} name="description" />
</svelte:head>

<main class="px-4 py-12 sm:py-16">
  <div class="mx-auto max-w-3xl">
    <h1 class="text-3xl sm:text-4xl font-extrabold" style="color: {$colorStore.text}">{m.home.updatesPageTitle()}</h1>
    <p class="mt-2 text-base" style="color: {$colorStore.muted}">{m.home.updatesPageSubtitle()}</p>

    <ol class="mt-10">
      {#each productUpdates as update (update.id)}
        <li id={update.id} class="py-8 border-t first:border-t-0 first:pt-0" style="border-color: {$colorStore.primary}20;">
          <div class="font-mono text-xs font-bold mb-2" style="color: {$colorStore.primary}">{update.label}</div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{update.title}</h2>
          <p class="mt-2 leading-relaxed" style="color: {$colorStore.muted}">{update.summary}</p>
          <ul class="mt-4 space-y-2 text-sm" style="color: {$colorStore.text}">
            {#each update.details as detail (detail)}
              <li class="border-l-2 pl-3 leading-relaxed" style="border-color: {$colorStore.primary}30;">{detail}</li>
            {/each}
          </ul>
          <a class="mt-5 inline-flex items-center gap-2 border-b pb-1 text-sm font-semibold transition-opacity hover:opacity-70"
             href={update.href} style="color: {$colorStore.primary}; border-color: {$colorStore.primary}80;">
            {update.action}
          </a>
        </li>
      {/each}
    </ol>
  </div>
</main>
