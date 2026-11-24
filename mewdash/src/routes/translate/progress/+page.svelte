<!-- routes/translate/progress/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { localeLabel } from "$lib/wiki/client";

  let { data } = $props();

  const rows = $derived(
    [...new Set(data.overview.flatMap((c) => c.languages.map((l) => l.locale)))].sort().map((locale) => ({
      locale,
      catalogs: data.overview.flatMap((c) => {
        const language = c.languages.find((l) => l.locale === locale);
        if (!language || c.total === 0) return [];
        const untranslated = Math.min(language.untranslated, c.total);
        const pending = Math.min(language.openSuggestions, untranslated);
        const approved = c.total - untranslated;
        return [{ catalog: c.catalog, total: c.total, approved, pending, untranslated: untranslated - pending }];
      }),
    })),
  );

  const percentOf = (part: number, total: number) => (total <= 0 ? 0 : Math.min(100, Math.round((part / total) * 100)));

  function catalogLabel(catalog: string): string {
    return catalog === "bot" ? m.translate.catalogBot() : catalog === "dash" ? m.translate.catalogDash() : catalog;
  }
</script>

<section class="space-y-5">
  <h2 class="text-lg font-semibold" style="color: {$colorStore.text}">{m.translate.progressTitle()}</h2>
  {#if rows.length === 0}
    <p style="color: {$colorStore.muted}">{m.translate.catalogsEmpty()}</p>
  {:else}
    <ul>
      {#each rows as row (row.locale)}
        <li class="py-4 space-y-3" style="border-top: 1px solid {$colorStore.primary}20;">
          <h3 class="font-semibold" style="color: {$colorStore.text}">{localeLabel(row.locale)}</h3>
          {#each row.catalogs as entry (entry.catalog)}
            <div class="space-y-1">
              <a href="/translate?{new URLSearchParams({ locale: row.locale, catalog: entry.catalog })}"
                 class="inline-flex items-center min-h-[44px] text-sm font-medium underline" style="color: {$colorStore.primary}">{catalogLabel(entry.catalog)}</a>
              <div class="flex h-2 rounded-full overflow-hidden" style="background: {$colorStore.primary}20;" role="img"
                   aria-label="{m.translate.progress({ done: entry.approved, total: entry.total })}, {m.translate.progressPending({ count: entry.pending })}">
                <div class="h-full" style="width: {(entry.approved / entry.total) * 100}%; background: {$colorStore.primary}; color: {$colorStore.onPrimary};"></div>
                <div class="h-full" style="width: {(entry.pending / entry.total) * 100}%; background: {$colorStore.accent}; color: {$colorStore.onAccent};"></div>
              </div>
              <p class="flex flex-wrap gap-x-4 gap-y-1 text-xs" style="color: {$colorStore.muted}">
                <span>{m.translate.progress({ done: entry.approved, total: entry.total })} ({percentOf(entry.approved, entry.total)}%)</span>
                <span>{m.translate.progressPending({ count: entry.pending })}</span>
                <span>{m.translate.progressUntranslated({ count: entry.untranslated })}</span>
              </p>
            </div>
          {/each}
        </li>
      {/each}
    </ul>
  {/if}
</section>
