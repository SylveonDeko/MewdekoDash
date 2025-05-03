<!-- routes/commands/+page.svelte -->
<script lang="ts">
  import MewdekoModule from "$lib/components/MewdekoModule.svelte";
  import { createSearchStore, searchHandler } from "$lib/stores/commandSearch";
  import { onDestroy, onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import type { PageData } from "./$types";

  export let data: PageData;

  const searchStore = createSearchStore(data.modules);
  let mounted = false;

  const unsubscribe = searchStore.subscribe((model) => searchHandler(model));

  onMount(() => {
    mounted = true;
  });

  onDestroy(() => {
    unsubscribe();
  });
</script>

<svelte:head>
  <title>Mewdeko - Commands</title>
  <meta content="Mewdeko - All the commands! Searchable!" property="og:title" />
  <meta
    content="Find out more about Mewdeko's commands and how to use them."
    name="description"
  />
  <meta
    content="Find out more about Mewdeko's commands and how to use them."
    property="og:description"
  />
  <meta
    content="Find out more about Mewdeko's commands and how to use them."
    name="twitter:description"
  />
</svelte:head>

<main
  style="--color-primary: {$colorStore.primary};
         --color-secondary: {$colorStore.secondary};
         --color-accent: {$colorStore.accent};
         --color-text: {$colorStore.text};
         --color-muted: {$colorStore.muted};"
>
  <div
    class="min-h-screen w-full p-2 space-y-6 backdrop-blur-sm"
    style="background: radial-gradient(circle at center,
      {$colorStore.gradientStart}15 0%,
      {$colorStore.gradientMid}10 50%,
      {$colorStore.gradientEnd}05 100%
    );"
  >
    <h1
      class="text-center text-4xl font-bold py-8"
      in:fade={{ duration: 300 }}
      style="color: {$colorStore.text};"
    >
      Mewdeko Modules
    </h1>

    <div class="sticky top-0 z-50 flex flex-col items-center space-y-2 py-4 backdrop-blur-md"
         style="background: linear-gradient(135deg,
        {$colorStore.gradientStart}70 0%,
        {$colorStore.gradientEnd}70 100%
      );"
    >
      <input
        type="search"
        id="search"
        placeholder="Search..."
        class="rounded-full px-3 py-3 text-center sm:w-96 drop-shadow-md transition-all duration-300"
        style="background: {$colorStore.primary}90;
               color: {$colorStore.text};
               border: 1px solid {$colorStore.accent}40;"
        bind:value={$searchStore.search}
      />
    </div>

    <ul class="w-full px-4" id="modules">
      {#each $searchStore.filtered as module, index}
        {#if mounted}
          <li
            class="mb-4 p-4 rounded-xl shadow-lg transition-all duration-300"
            style="background: linear-gradient(135deg,
              {$colorStore.gradientStart}60 0%,
              {$colorStore.gradientEnd}60 100%
            );
            border: 1px solid {$colorStore.primary}30;"
            in:fly={{ y: 20, duration: 300, delay: index * 50 }}
          >
            <MewdekoModule {module} searching={!!$searchStore.search?.trim()} />
          </li>
        {:else}
          <li
            class="mb-4 p-4 rounded-xl shadow-lg transition-all duration-300"
            style="background: linear-gradient(135deg,
              {$colorStore.gradientStart}60 0%,
              {$colorStore.gradientEnd}60 100%
            );
            border: 1px solid {$colorStore.primary}30;"
          >
            <MewdekoModule {module} searching={!!$searchStore.search?.trim()} />
          </li>
        {/if}
      {/each}
    </ul>
  </div>
</main>

<style lang="postcss">
    :global(body) {
        @apply text-mewd-white;
        background: var(--color-primary);
    }

    /* Add smooth transitions for color changes */
    [style*="background"],
    [style*="color"] {
        @apply transition-colors duration-300;
    }

    /* Improve gradient transitions */
    .backdrop-blur-sm {
        @apply transition-all duration-300;
    }

    /* Consistent border styling */
    [class*="border"] {
        @apply transition-colors duration-300;
    }

    /* Ensure proper gradient overlays */
    [style*="gradient"] {
        @apply transition-all duration-300;
    }

    /* Input field focus styling */
    input[type="search"]:focus {
        @apply outline-none ring-2;
        ring-color: var(--color-accent);
    }

    input[type="search"]::placeholder {
        color: var(--color-muted);
    }

    /* Custom scrollbar styling */
    :global(*::-webkit-scrollbar) {
        @apply w-2;
    }

    :global(*::-webkit-scrollbar-track) {
        background: var(--color-primary) 10;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background: var(--color-primary) 30;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb:hover) {
        background: var(--color-primary) 50;
    }
</style>