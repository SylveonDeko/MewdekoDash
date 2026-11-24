<!-- routes/wiki/manage/languages/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { localeLabel } from "$lib/wiki/client";
  import type { LanguageRow } from "$lib/wiki/records";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";

  let { data } = $props();

  type State = "current" | "outdated" | "missing";

  let onlyOpen = $state(false);

  function stateOf(row: LanguageRow, locale: string): State {
    if (!row.locales.includes(locale)) return "missing";
    return row.outdated.includes(locale) ? "outdated" : "current";
  }

  function stateLabel(state: State): string {
    return state === "current" ? m.wikiManage.languagesCurrent() : state === "outdated" ? m.wikiManage.languagesOutdated() : m.wikiManage.languagesMissing();
  }

  function stateIcon(state: State): string {
    return state === "current" ? "fa-check" : state === "outdated" ? "fa-arrows-rotate" : "fa-minus";
  }

  function stateStyle(state: State): string {
    if (state === "current") return `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}40;`;
    if (state === "outdated") return `background: ${$colorStore.accent}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.accent}40;`;
    return `background: transparent; color: ${$colorStore.muted}; border: 1px solid ${$colorStore.primary}20;`;
  }

  const rows = $derived(onlyOpen ? data.rows.filter((row) => data.locales.some((locale) => stateOf(row, locale) !== "current")) : data.rows);

  const totals = $derived(
    data.locales.map((locale) => ({ locale, done: data.rows.filter((row) => stateOf(row, locale) === "current").length }))
  );
</script>

<div class="space-y-6">
  <section class="rounded-2xl border p-4 sm:p-6 space-y-4" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
    <ul class="flex flex-wrap gap-x-4 gap-y-2 text-sm" style="color: {$colorStore.muted}">
      {#each ["current", "outdated", "missing"] as const as state (state)}
        <li class="inline-flex items-center gap-2">
          <i class="fa-solid {stateIcon(state)} w-4 text-center" aria-hidden="true"></i>{stateLabel(state)}
        </li>
      {/each}
    </ul>

    <ul class="flex flex-wrap gap-2">
      {#each totals as total (total.locale)}
        <li class="px-3 py-1 rounded-lg text-sm" style="background: {$colorStore.primary}10; color: {$colorStore.text};">
          {localeLabel(total.locale)}: {m.wikiManage.languagesProgress({ done: total.done, total: data.rows.length })}
        </li>
      {/each}
    </ul>

    <ToggleRow checked={onlyOpen} title={m.wikiManage.languagesOnlyOpen()} colors={$colorStore} onchange={(value) => { onlyOpen = value; }} />
  </section>

  <section class="rounded-2xl border p-4 sm:p-6" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
    {#if rows.length === 0}
      <p style="color: {$colorStore.muted}">{m.wikiManage.pagesEmpty()}</p>
    {:else}
      <ul>
        {#each rows as row (row.id)}
          <li class="py-3 border-t first:border-t-0 space-y-2" style="border-color: {$colorStore.primary}20;">
            <a href="/wiki/manage/{row.id}" class="font-semibold break-words" style="color: {$colorStore.text}">{row.title}</a>
            <div class="flex flex-wrap gap-2">
              {#each data.locales as locale (locale)}
                {@const state = stateOf(row, locale)}
                <a href="/wiki/manage/{row.id}?locale={locale}"
                   class="inline-flex items-center gap-2 px-3 rounded-lg min-h-[44px] text-sm"
                   style={stateStyle(state)}
                   aria-label={m.wikiManage.languagesCell({ page: row.title, language: localeLabel(locale), state: stateLabel(state) })}>
                  <i class="fa-solid {stateIcon(state)}" aria-hidden="true"></i>{locale}
                </a>
              {/each}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>
