<!-- routes/wiki/[slug]/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import WikiArticle from "$lib/components/wiki/WikiArticle.svelte";
  import { wikiIconClass } from "$lib/wiki";

  let { data } = $props();

  let mounted = $state(false);
  let activeHeading = $state("");
  let sidebarQuery = $state("");

  let sidebarArticles = $derived(
    data.all.filter((a) => !sidebarQuery.trim() || a.title.toLowerCase().includes(sidebarQuery.toLowerCase()))
  );

  let dashboardLink = $derived(
    data.article.dashboardHref
      ? $currentGuild
        ? data.article.dashboardHref
        : "/dashboard"
      : null
  );

  onMount(() => {
    mounted = true;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) activeHeading = entry.target.id;
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    const attach = () => {
      for (const h of data.article.headings) {
        const el = document.getElementById(h.id);
        if (el) observer.observe(el);
      }
    };
    const timer = setTimeout(attach, 50);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  });
</script>

<svelte:head>
  <title>{data.article.title} - Mewdeko Wiki</title>
  <meta name="description" content={data.article.summary} />
  <meta property="og:title" content="{data.article.title} - Mewdeko Wiki" />
  <meta property="og:description" content={data.article.summary} />
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
    <div class="w-full px-4 md:px-6 xl:px-10 py-8 lg:py-10">
      <nav class="text-sm mb-6 flex items-center gap-2 flex-wrap" aria-label="Breadcrumb" style="color: {$colorStore.muted}">
        <a href="/wiki" class="hover:underline" style="color: {$colorStore.primary}">Wiki</a>
        <i class="fa-solid fa-chevron-right text-xs"></i>
        <span>{data.article.category}</span>
        <i class="fa-solid fa-chevron-right text-xs"></i>
        <span style="color: {$colorStore.text}">{data.article.title}</span>
      </nav>

      <div class="grid gap-8 lg:grid-cols-[minmax(200px,16%)_minmax(0,1fr)] xl:grid-cols-[minmax(200px,14%)_minmax(0,1fr)_minmax(180px,12%)]">
        <aside class="hidden lg:block">
          <div class="sticky top-24 space-y-3">
            <input
              type="search"
              placeholder="Filter articles"
              bind:value={sidebarQuery}
              class="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2"
              style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}25; color: {$colorStore.text};"
            />
            <ul class="space-y-0.5 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1 scrollbar-thin">
              {#each sidebarArticles as a (a.slug)}
                <li>
                  <a
                    href="/wiki/{a.slug}"
                    class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
                    style="background: {a.slug === data.article.slug ? $colorStore.primary + '20' : 'transparent'};
                           color: {a.slug === data.article.slug ? $colorStore.primary : $colorStore.muted};"
                  >
                    <i class="{wikiIconClass(a.icon)} w-4 text-center"
                       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                    <span class="truncate">{a.title}</span>
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        </aside>

        <div class="min-w-0" in:fly={{ y: 16, duration: 300 }}>
          <header
            class="rounded-2xl p-6 sm:p-8 mb-8"
            style="background: linear-gradient(135deg, {$colorStore.gradientStart}18, {$colorStore.gradientEnd}10);
                   border: 1px solid {$colorStore.primary}30;"
          >
            <div class="flex flex-col sm:flex-row sm:items-center gap-5">
              <div class="p-4 rounded-2xl w-fit"
                   style="background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);">
                <i class="{wikiIconClass(data.article.icon)} text-4xl"
                   style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
              </div>
              <div class="min-w-0 flex-1">
                <h1 class="text-3xl sm:text-4xl font-bold" style="color: {$colorStore.text}">{data.article.title}</h1>
                <p class="text-lg mt-2" style="color: {$colorStore.muted}">{data.article.summary}</p>
                <div class="mt-3 flex flex-wrap items-center gap-2 text-xs" style="color: {$colorStore.muted}">
                  <span class="px-2 py-1 rounded-md" style="background: {$colorStore.primary}15; color: {$colorStore.primary}">
                    {data.article.category}
                  </span>
                  {#if data.article.module}
                    <span class="px-2 py-1 rounded-md" style="background: {$colorStore.secondary}15; color: {$colorStore.secondary}">
                      <i class="fa-solid fa-terminal mr-1"></i>{data.article.module} module
                    </span>
                  {/if}
                  <span><i class="fa-regular fa-clock mr-1"></i>{data.article.readingMinutes} min read</span>
                </div>
              </div>
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              {#if dashboardLink}
                <a
                  href={dashboardLink}
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02]"
                  style="background: {$colorStore.primary}; color: #0f172a;"
                >
                  <i class="fa-solid fa-sliders"></i>
                  {$currentGuild ? `Open in ${$currentGuild.name}` : "Open in dashboard"}
                </a>
              {/if}
              {#if data.article.module}
                <a
                  href="/commands"
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02]"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                >
                  <i class="fa-solid fa-terminal"></i>
                  Command reference
                </a>
              {/if}
            </div>
          </header>

          <div class="rounded-2xl p-6 sm:p-8"
               style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;">
            <WikiArticle article={data.article} />
          </div>

          {#if data.related.length > 0}
            <section class="mt-10">
              <h2 class="text-lg font-bold mb-4" style="color: {$colorStore.text}">Related features</h2>
              <div class="grid gap-3 sm:grid-cols-2">
                {#each data.related as r (r.slug)}
                  <a
                    href="/wiki/{r.slug}"
                    class="flex items-center gap-3 rounded-xl p-4 transition-all hover:scale-[1.02]"
                    style="background: {$colorStore.primary}0c; border: 1px solid {$colorStore.primary}25;"
                  >
                    <i class="{wikiIconClass(r.icon)} text-xl"
                       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                    <div class="min-w-0">
                      <div class="font-semibold" style="color: {$colorStore.text}">{r.title}</div>
                      <div class="text-sm truncate" style="color: {$colorStore.muted}">{r.summary}</div>
                    </div>
                  </a>
                {/each}
              </div>
            </section>
          {/if}

          <nav class="mt-10 flex flex-col sm:flex-row gap-3 justify-between" aria-label="Article pagination">
            {#if data.previous}
              <a href="/wiki/{data.previous.slug}"
                 class="flex-1 rounded-xl p-4 transition-all hover:scale-[1.01]"
                 style="background: {$colorStore.primary}0c; border: 1px solid {$colorStore.primary}25;">
                <div class="text-xs" style="color: {$colorStore.muted}"><i class="fa-solid fa-arrow-left mr-1"></i>Previous</div>
                <div class="font-semibold" style="color: {$colorStore.text}">{data.previous.title}</div>
              </a>
            {:else}
              <div class="flex-1"></div>
            {/if}
            {#if data.next}
              <a href="/wiki/{data.next.slug}"
                 class="flex-1 rounded-xl p-4 text-right transition-all hover:scale-[1.01]"
                 style="background: {$colorStore.primary}0c; border: 1px solid {$colorStore.primary}25;">
                <div class="text-xs" style="color: {$colorStore.muted}">Next<i class="fa-solid fa-arrow-right ml-1"></i></div>
                <div class="font-semibold" style="color: {$colorStore.text}">{data.next.title}</div>
              </a>
            {/if}
          </nav>
        </div>

        <aside class="hidden xl:block">
          {#if data.article.headings.length > 0}
            <div class="sticky top-24">
              <p class="text-xs uppercase tracking-widest font-semibold mb-3" style="color: {$colorStore.muted}">
                On this page
              </p>
              <ul class="space-y-1 border-l" style="border-color: {$colorStore.primary}25;">
                {#each data.article.headings as h (h.id)}
                  <li>
                    <a
                      href="#{h.id}"
                      class="block text-sm py-1 -ml-px border-l-2 transition-all {h.level === 3 ? 'pl-6' : 'pl-3'}"
                      style="border-color: {activeHeading === h.id ? $colorStore.primary : 'transparent'};
                             color: {activeHeading === h.id ? $colorStore.primary : $colorStore.muted};"
                    >
                      {h.text}
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </aside>
      </div>
    </div>
  </main>
{/if}
