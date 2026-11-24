<!-- routes/wiki/+layout.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { page } from "$app/stores";
  import { colorStore } from "$lib/stores/colorStore";
  import { wikiIconClass } from "$lib/wiki";

  let { data, children } = $props();

  let sidebarQuery = $state("");

  let manageHref = $derived(data.wikiAccess.canEdit ? "/wiki/manage" : "/wiki/manage/mine");
  let showManage = $derived(data.wikiAccess.databaseAvailable && data.wikiAccess.signedIn);
  let managing = $derived($page.url.pathname.startsWith("/wiki/manage"));

  let sidebarGroups = $derived(
    data.groups
      .map((group) => ({
        ...group,
        articles: group.articles.filter((a) => !sidebarQuery.trim() || a.title.toLowerCase().includes(sidebarQuery.toLowerCase())),
      }))
      .filter((group) => group.articles.length > 0)
  );

  let activeSlug = $derived($page.params.slug ?? null);
</script>

{#snippet manageLink()}
  <a
    href={manageHref}
    class="flex items-center gap-2.5 px-3 rounded-lg text-sm font-semibold min-h-[44px] transition-all"
    style="background: {managing ? $colorStore.primary + '20' : 'transparent'};
           color: {managing ? $colorStore.primary : $colorStore.muted};"
  >
    <i class="fa-utility-duo fa-regular fa-pen-to-square w-4 text-center"
       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
    <span>{data.wikiAccess.canEdit ? m.wikiManage.manageLink() : m.wikiManage.mineLink()}</span>
  </a>
{/snippet}

<main
  class="min-h-screen"
  style="background: {$colorStore.primary}06;"
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
            <span>{m.wiki.wikiHome()}</span>
          </a>
          {#if showManage}
            {@render manageLink()}
          {/if}
          <input
            type="search"
            placeholder={m.wiki.filterArticles()}
            bind:value={sidebarQuery}
            class="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}25; color: {$colorStore.text};"
          />
          <div class="space-y-3 max-h-[calc(100vh-13rem)] overflow-y-auto pr-1 scrollbar-thin">
            {#each sidebarGroups as group (group.name)}
              <section aria-label={group.name}>
                <h2 class="flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide" style="color: {$colorStore.muted}">
                  <i class="{wikiIconClass(group.icon)} w-4 text-center" aria-hidden="true"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                  <span class="truncate">{group.name}</span>
                </h2>
                <ul class="space-y-0.5">
                  {#each group.articles as a (a.slug)}
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
                  {/each}
                </ul>
              </section>
            {:else}
              <p class="px-3 py-2 text-sm" style="color: {$colorStore.muted}">{m.common.noMatches()}</p>
            {/each}
          </div>
        </div>
      </aside>

      <div class="min-w-0">
        {#if showManage}
          <div class="lg:hidden mb-4">
            {@render manageLink()}
          </div>
        {/if}
        {@render children()}
      </div>
    </div>
  </div>
</main>
