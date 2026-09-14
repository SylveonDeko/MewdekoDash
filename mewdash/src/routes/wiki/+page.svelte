<!-- routes/wiki/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { searchWiki, wikiIconClass } from "$lib/wiki";
  import type { WikiArticleMeta } from "$lib/wiki";

  let { data } = $props();

  let mounted = $state(false);
  let query = $state("");
  let selectedCategory = $state("all");

  let results = $derived.by(() => {
    const matches = searchWiki(query);
    return selectedCategory === "all" ? matches : matches.filter((a) => a.category === selectedCategory);
  });

  let grouped = $derived.by(() => {
    const groups: { category: string; articles: WikiArticleMeta[] }[] = [];
    for (const { category } of data.categories) {
      const articles = results.filter((a) => a.category === category);
      if (articles.length > 0) groups.push({ category, articles });
    }
    return groups;
  });

  const categoryIcons: Record<string, string> = {
    Community: "fa-users",
    Entertainment: "fa-gamepad",
    Actions: "fa-bolt",
    Security: "fa-shield-halved",
    Analytics: "fa-chart-line",
    Settings: "fa-gear",
    General: "fa-book",
  };

  function handleGlobalKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault();
      document.getElementById("wiki-search")?.focus();
    }
  }

  onMount(() => {
    mounted = true;
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  });
</script>

<svelte:head>
  <title>Mewdeko Wiki - Every feature explained</title>
  <meta name="description" content="Plain language write-ups of every Mewdeko feature: what it does, how to set it up, and how servers use it." />
  <meta property="og:title" content="Mewdeko Wiki" />
  <meta property="og:description" content="Plain language write-ups of every Mewdeko feature." />
</svelte:head>

{#if mounted}
  <main
    class="min-h-screen"
    style="background: radial-gradient(circle at top,
             {$colorStore.gradientStart}15 0%,
             {$colorStore.gradientMid}10 50%,
             {$colorStore.gradientEnd}05 100%);"
    in:fade
  >
    <div class="py-10 border-b"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}15 0%, {$colorStore.gradientEnd}10 100%);
                border-color: {$colorStore.primary}30;">
      <div class="w-full px-4 md:px-6 xl:px-10">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="p-4 rounded-2xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);">
              <i class="fa-utility-duo fa-regular fa-book-open text-4xl"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
            </div>
            <div>
              <h1 class="text-3xl md:text-4xl font-bold" style="color: {$colorStore.text}">Mewdeko Wiki</h1>
              <p class="text-lg mt-1" style="color: {$colorStore.muted}">
                What each feature does, why you would want it, and how to set it up.
              </p>
            </div>
          </div>
          <div class="text-sm" style="color: {$colorStore.muted}">
            {data.articles.length} {data.articles.length === 1 ? "article" : "articles"}
          </div>
        </div>

        <div class="mt-8 flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2"
               style="color: {$colorStore.muted}"></i>
            <input
              id="wiki-search"
              type="search"
              placeholder="Search features, e.g. anti-raid, afk, welcome message"
              bind:value={query}
              class="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
              style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
            />
            <kbd class="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded"
                 style="background: {$colorStore.primary}15; color: {$colorStore.muted}">Ctrl K</kbd>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
            style="background: {selectedCategory === 'all' ? $colorStore.primary + '25' : $colorStore.primary + '08'};
                   color: {selectedCategory === 'all' ? $colorStore.primary : $colorStore.muted};
                   border: 1px solid {selectedCategory === 'all' ? $colorStore.primary + '40' : 'transparent'};"
            onclick={() => (selectedCategory = "all")}
          >
            All
          </button>
          {#each data.categories as { category }}
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
              style="background: {selectedCategory === category ? $colorStore.primary + '25' : $colorStore.primary + '08'};
                     color: {selectedCategory === category ? $colorStore.primary : $colorStore.muted};
                     border: 1px solid {selectedCategory === category ? $colorStore.primary + '40' : 'transparent'};"
              onclick={() => (selectedCategory = category)}
            >
              <i class="fa-solid {categoryIcons[category] ?? 'fa-book'} mr-1.5"></i>{category}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <div class="w-full px-4 md:px-6 xl:px-10 py-10 space-y-12">
      {#if grouped.length === 0}
        <div class="text-center py-20" in:fade>
          <i class="fa-solid fa-magnifying-glass text-4xl mb-4" style="color: {$colorStore.muted}"></i>
          <p class="text-lg" style="color: {$colorStore.muted}">Nothing matches "{query}" yet.</p>
        </div>
      {/if}

      {#each grouped as group, gi (group.category)}
        <section in:fly={{ y: 16, duration: 300, delay: gi * 60 }}>
          <div class="flex items-center gap-3 mb-5">
            <i class="fa-solid {categoryIcons[group.category] ?? 'fa-book'}" style="color: {$colorStore.primary}"></i>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{group.category}</h2>
            <span class="text-sm" style="color: {$colorStore.muted}">{group.articles.length}</span>
          </div>

          <div class="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
            {#each group.articles as article (article.slug)}
              <a
                href="/wiki/{article.slug}"
                class="group flex flex-col rounded-2xl p-5 transition-all hover:scale-[1.02] hover:shadow-xl"
                style="background: {$colorStore.primary}0c; border: 1px solid {$colorStore.primary}25;"
              >
                <div class="flex items-center gap-3 mb-3">
                  <div class="p-2.5 rounded-xl shrink-0"
                       style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
                    <i class="{wikiIconClass(article.icon)} text-xl"
                       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                  </div>
                  <h3 class="font-semibold text-lg leading-tight" style="color: {$colorStore.text}">{article.title}</h3>
                </div>
                <p class="text-sm flex-1" style="color: {$colorStore.muted}">{article.summary}</p>
                <div class="mt-4 flex items-center justify-between text-xs" style="color: {$colorStore.muted}">
                  <span><i class="fa-regular fa-clock mr-1"></i>{article.readingMinutes} min</span>
                  <span class="font-medium transition-transform group-hover:translate-x-1" style="color: {$colorStore.primary}">
                    Read <i class="fa-solid fa-arrow-right ml-1"></i>
                  </span>
                </div>
              </a>
            {/each}
          </div>
        </section>
      {/each}
    </div>
  </main>
{/if}
