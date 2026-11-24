<!-- routes/translate/+layout.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { page } from "$app/state";
  import { colorStore } from "$lib/stores/colorStore";

  let { data, children } = $props();

  const links = $derived(
    [
      { href: "/translate", label: m.translate.tabBrowse(), show: true, exact: true },
      { href: "/translate/progress", label: m.common.progress(), show: true, exact: false },
      { href: "/translate/manage", label: m.translate.tabQueue(), show: data.tr.isReviewer, exact: true },
      { href: "/translate/manage/translators", label: m.translate.tabTranslators(), show: data.tr.isAdmin, exact: false },
      { href: "/translate/manage/contributors", label: m.translate.tabContributors(), show: data.tr.isAdmin, exact: false },
      { href: "/translate/manage/transfer", label: m.translate.tabTransfer(), show: data.tr.isAdmin, exact: false },
      { href: "/translate/manage/settings", label: m.common.settings(), show: data.tr.isAdmin, exact: false },
      { href: "/translate/manage/mine", label: m.wikiManage.mineLink(), show: data.tr.signedIn, exact: false },
    ].filter((link) => link.show)
  );

  function active(link: { href: string; exact: boolean }): boolean {
    const path = page.url.pathname.replace(/\/$/, "");
    if (link.exact) return path === link.href;
    return path === link.href || path.startsWith(link.href + "/");
  }
</script>

<svelte:head>
  <title>{m.translate.pageTitle()}</title>
  <meta name="description" content={m.translate.pageDescription()} />
</svelte:head>

<main class="min-h-screen" style="background: {$colorStore.primary}06;">
  <div class="w-full px-4 md:px-6 xl:px-10 py-8 lg:py-10">
    <div class="space-y-6 max-w-6xl mx-auto">
      <header class="flex items-center gap-4">
        <div class="p-4 rounded-xl shrink-0" style="background: {$colorStore.primary}15;">
          <i class="fa-utility-duo fa-regular fa-language text-2xl"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"
             aria-hidden="true"></i>
        </div>
        <h1 class="text-2xl font-bold min-w-0" style="color: {$colorStore.text}">{m.translate.heading()}</h1>
      </header>

      {#if links.length > 1}
        <nav class="flex flex-wrap gap-2" aria-label={m.translate.navAria()}>
          {#each links as link (link.href)}
            <a
              href={link.href}
              class="inline-flex items-center px-4 rounded-lg min-h-[44px] text-sm font-medium"
              aria-current={active(link) ? "page" : undefined}
              style="background: {active(link) ? $colorStore.primary + '20' : 'transparent'};
                     color: {active(link) ? $colorStore.primary : $colorStore.muted};
                     border: 1px solid {active(link) ? $colorStore.primary + '40' : $colorStore.primary + '20'};"
            >
              {link.label}
            </a>
          {/each}
        </nav>
      {/if}

      {#if !data.tr.databaseAvailable}
        <p style="color: {$colorStore.muted}" role="status">{m.translate.databaseUnavailable()}</p>
      {:else}
        {@render children()}
      {/if}
    </div>
  </div>
</main>
