<!-- routes/wiki/+layout.svelte -->
<script lang="ts">
  import { page } from "$app/stores";
  import { colorStore } from "$lib/stores/colorStore";
  import { wikiIconClass } from "$lib/wiki";

  let { data, children } = $props();

  let sidebarQuery = $state("");

  // Flat and alphabetical, matching the dashboard sidebar: one list to scan rather than
  // category blocks to hunt through.
  let sidebarArticles = $derived(
    data.all.filter((a) => !sidebarQuery.trim() || a.title.toLowerCase().includes(sidebarQuery.toLowerCase()))
  );

  let activeSlug = $derived($page.params.slug ?? null);
</script>

<main
  class="min-h-screen"
  style="background: radial-gradient(circle at top,
           {$colorStore.gradientStart}15 0%,
           {$colorStore.gradientMid}10 50%,
           {$colorStore.gradientEnd}05 100%);"
>
  <div class="w-full px-4 md:px-6 xl:px-10 py-8 lg:py-10">
    <div class="grid gap-8 lg:grid-cols-[minmax(220px,16%)_minmax(0,1fr)]">
      <aside class="hidden lg:block">
        <div class="sticky top-24 space-y-3">
          <a
            href="/wiki"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
            style="background: {activeSlug ? 'transparent' : $colorStore.primary + '20'};
                   color: {activeSlug ? $colorStore.muted : $colorStore.primary};"
          >
            <i class="fa-utility-duo fa-regular fa-book-open w-4 text-center"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
            <span>Wiki home</span>
          </a>
          <input
            type="search"
            placeholder="Filter articles"
            bind:value={sidebarQuery}
            class="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}25; color: {$colorStore.text};"
          />
          <ul class="space-y-0.5 max-h-[calc(100vh-13rem)] overflow-y-auto pr-1 scrollbar-thin">
            {#each sidebarArticles as a (a.slug)}
              <li>
                <a
                  href="/wiki/{a.slug}"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
                  style="background: {a.slug === activeSlug ? $colorStore.primary + '20' : 'transparent'};
                         color: {a.slug === activeSlug ? $colorStore.primary : $colorStore.muted};"
                >
                  <i class="{wikiIconClass(a.icon)} w-4 text-center"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                  <span class="truncate">{a.title}</span>
                </a>
              </li>
            {:else}
              <li class="px-3 py-2 text-sm" style="color: {$colorStore.muted}">No matches</li>
            {/each}
          </ul>
        </div>
      </aside>

      <div class="min-w-0">
        {@render children()}
      </div>
    </div>
  </div>
</main>
