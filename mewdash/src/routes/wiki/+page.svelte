<!-- routes/wiki/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { searchWiki, wikiIconClass } from "$lib/wiki";
  import ComponentEmbed from "$lib/components/layout/ComponentEmbed.svelte";
  import { buttons, container, header, linkButton, SITE_ORIGIN, separator, text } from "$lib/componentEmbed";

  let { data } = $props();

  const previewEmbed = $derived(
    container(
      header(
        `## ${m.wiki.mewdekoWiki()}\n${m.wiki.embedSummary()}`,
        `${SITE_ORIGIN}/img/Mewdeko.png`
      ),
      text(
        m.wiki.embedArticles({ count: data.articles.length, featured: data.featured.map((a) => `[${a.title}](${SITE_ORIGIN}/wiki/${a.slug})`).join(", ") })
      ),
      separator(),
      buttons(linkButton(m.wiki.embedOpenWiki(), `${SITE_ORIGIN}/wiki`))
    )
  );

  let query = $state("");
  let searching = $derived(query.trim().length > 0);
  let results = $derived(searchWiki(query));

  function handleGlobalKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault();
      document.getElementById("wiki-search")?.focus();
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  });
</script>

<ComponentEmbed embed={previewEmbed} />

<svelte:head>
  <title>{m.wiki.mewdekoWikiEveryFeatureExplained()}</title>
  <meta name="description" content={m.wiki.embedSummary()} />
  <meta property="og:title" content={m.wiki.mewdekoWiki()} />
  <meta property="og:description" content={m.wiki.ogDescription()} />
</svelte:head>

<div in:fade>
  <header
    class="rounded-2xl p-6 sm:p-8"
    style="background: linear-gradient(135deg, {$colorStore.gradientStart}18, {$colorStore.gradientEnd}10);
           border: 1px solid {$colorStore.primary}30;"
  >
    <div class="flex items-center gap-4">
      <div class="p-4 rounded-2xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);">
        <i class="fa-utility-duo fa-regular fa-book-open text-4xl"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
      </div>
      <div class="min-w-0">
        <h1 class="text-3xl md:text-4xl font-bold" style="color: {$colorStore.text}">{m.wiki.mewdekoWiki()}</h1>
        <p class="text-lg mt-1" style="color: {$colorStore.muted}">
          {m.wiki.whatEachFeatureDoesWhy()}
        </p>
      </div>
    </div>

    <div class="relative mt-6">
      <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2"
         style="color: {$colorStore.muted}"></i>
      <input
        id="wiki-search"
        type="search"
        placeholder={m.wiki.searchPlaceholder({ count: data.articles.length })}
        bind:value={query}
        class="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
        style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
      />
      <kbd class="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded"
           style="background: {$colorStore.primary}15; color: {$colorStore.muted}">Ctrl K</kbd>
    </div>
  </header>

  {#if searching}
    <section class="mt-8" in:fly={{ y: 12, duration: 250 }}>
      <p class="text-sm mb-3" style="color: {$colorStore.muted}">
        {results.length === 1 ? m.wiki.searchResultsOne({ query }) : m.wiki.searchResultsOther({ count: results.length, query })}
      </p>
      {#if results.length === 0}
        <div class="text-center py-16">
          <i class="fa-solid fa-magnifying-glass text-4xl mb-4" style="color: {$colorStore.muted}"></i>
          <p class="text-lg" style="color: {$colorStore.muted}">Nothing matches "{query}" yet.</p>
        </div>
      {:else}
        <ul class="rounded-2xl overflow-hidden" style="border: 1px solid {$colorStore.primary}25;">
          {#each results as article, i (article.slug)}
            <li style="border-top: {i === 0 ? 'none' : `1px solid ${$colorStore.primary}15`};">
              <a
                href="/wiki/{article.slug}"
                class="flex items-center gap-4 px-4 py-3 min-h-[44px] transition-colors"
                style="background: {$colorStore.primary}06;"
              >
                <i class="{wikiIconClass(article.icon)} text-lg w-6 text-center shrink-0"
                   style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                <div class="min-w-0 flex-1">
                  <div class="font-semibold" style="color: {$colorStore.text}">{article.title}</div>
                  <div class="text-sm truncate" style="color: {$colorStore.muted}">{article.summary}</div>
                </div>
                <i class="fa-solid fa-arrow-right text-sm shrink-0" style="color: {$colorStore.primary}"></i>
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {:else}
    {#if data.featured.length > 0}
      <section class="mt-8" in:fly={{ y: 12, duration: 250 }}>
        <h2 class="text-lg font-bold mb-4" style="color: {$colorStore.text}">{m.wiki.startHere()}</h2>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {#each data.featured as article (article.slug)}
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
                <span><i class="fa-regular fa-clock mr-1"></i>{m.features.setupTimeSingle({ minutes: article.readingMinutes })}</span>
                <span class="font-medium transition-transform group-hover:translate-x-1" style="color: {$colorStore.primary}">
                  {m.wiki.read()} <i class="fa-solid fa-arrow-right ml-1"></i>
                </span>
              </div>
            </a>
          {/each}
        </div>
      </section>
    {/if}

    <p class="hidden lg:block mt-8 text-sm" style="color: {$colorStore.muted}">
      <i class="fa-solid fa-arrow-left mr-1"></i>{m.wiki.everyGuideIsListedA()}
    </p>

    <!-- The sidebar is desktop only, so phones get the same A to Z list inline. -->
    <section class="lg:hidden mt-8">
      <h2 class="text-lg font-bold mb-4" style="color: {$colorStore.text}">{m.wiki.allGuides()}</h2>
      <ul class="rounded-2xl overflow-hidden" style="border: 1px solid {$colorStore.primary}25;">
        {#each data.articles as article, i (article.slug)}
          <li style="border-top: {i === 0 ? 'none' : `1px solid ${$colorStore.primary}15`};">
            <a
              href="/wiki/{article.slug}"
              class="flex items-center gap-3 px-4 py-3 min-h-[44px]"
              style="background: {$colorStore.primary}06; color: {$colorStore.text};"
            >
              <i class="{wikiIconClass(article.icon)} w-5 text-center shrink-0"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
              <span class="flex-1 truncate">{article.title}</span>
              <i class="fa-solid fa-chevron-right text-xs" style="color: {$colorStore.muted}"></i>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</div>
