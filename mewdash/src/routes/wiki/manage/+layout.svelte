<!-- routes/wiki/manage/+layout.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { page } from "$app/state";
  import { colorStore } from "$lib/stores/colorStore";

  let { data, children } = $props();

  const links = $derived(
    [
      { href: "/wiki/manage", label: m.wikiManage.tabPages(), show: data.manage.canEdit, exact: true },
      { href: "/wiki/manage/categories", label: m.common.categories(), show: data.manage.canEdit, exact: false },
      { href: "/wiki/manage/languages", label: m.wikiManage.tabLanguages(), show: data.manage.canEdit, exact: false },
      { href: "/wiki/manage/recent", label: m.wikiManage.tabRecent(), show: data.manage.canEdit, exact: false },
      { href: "/wiki/manage/suggestions", label: m.wikiManage.tabSuggestions(), show: data.manage.canEdit, exact: false },
      { href: "/wiki/manage/feedback", label: m.wikiManage.tabFeedback(), show: data.manage.canEdit, exact: false },
      { href: "/wiki/manage/analytics", label: m.features.analyticsName(), show: data.manage.canEdit, exact: false },
      { href: "/wiki/manage/editors", label: m.wikiManage.tabEditors(), show: data.manage.canManageEditors, exact: false },
      { href: "/wiki/manage/settings", label: m.common.settings(), show: data.manage.canManageEditors, exact: false },
      { href: "/wiki/manage/mine", label: m.wikiManage.mineLink(), show: true, exact: false },
      { href: "/translate", label: m.translate.navTitle(), show: true, exact: false },
    ].filter((link) => link.show)
  );

  function active(link: { href: string; exact: boolean }): boolean {
    const path = page.url.pathname.replace(/\/$/, "");
    if (link.exact) return path === link.href || /^\/wiki\/manage\/\d+$/.test(path);
    return path === link.href || path.startsWith(link.href + "/");
  }
</script>

<svelte:head>
  <title>{m.wikiManage.pageTitle()}</title>
</svelte:head>

<div class="space-y-6 max-w-6xl">
  <header class="flex items-center gap-4">
    <div class="p-4 rounded-xl shrink-0" style="background: {$colorStore.primary}15;">
      <i class="fa-utility-duo fa-regular fa-pen-to-square text-2xl"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"
         aria-hidden="true"></i>
    </div>
    <h1 class="text-2xl font-bold min-w-0" style="color: {$colorStore.text}">{m.wikiManage.heading()}</h1>
  </header>

  {#if links.length > 1}
    <nav class="flex flex-wrap gap-2" aria-label={m.wikiManage.navAria()}>
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

  {#if !data.manage.databaseAvailable}
    <p style="color: {$colorStore.muted}" role="status">{m.wikiManage.databaseUnavailable()}</p>
  {:else}
    {@render children()}
  {/if}
</div>
