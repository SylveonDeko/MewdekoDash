<!-- routes/translate/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { beforeNavigate, goto } from "$app/navigation";
  import { page } from "$app/state";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import TranslationHistory from "$lib/components/translate/TranslationHistory.svelte";
  import TranslationRow from "$lib/components/translate/TranslationRow.svelte";
  import { groupLabel, itemErrorMessage, translationErrorMessage } from "$lib/translate/client";
  import { canReviewLocale } from "$lib/translate/permissions";
  import { stringFilters, stringSorts, type BulkResult, type RowDraft, type StringFilter, type StringRow, type StringSort } from "$lib/translate/records";
  import { translationLimits } from "$lib/translate/rules";
  import { localeLabel, wikiCall } from "$lib/wiki/client";

  let { data } = $props();

  const allGroups = "*";

  let bulkMessage = $state<string | null>(null);
  let bulkError = $state<string | null>(null);

  let drafts = $state<Record<string, RowDraft>>({});
  let failures = $state<Record<string, string>>({});
  let savingAll = $state(false);

  const dirtyCount = $derived(Object.keys(drafts).length);
  const readyCount = $derived(Object.values(drafts).filter((d) => d.ready).length);
  const closedMessage = $derived(
    data.tr.blocked ? m.translate.errorBlocked() : !data.tr.suggestionsOpen ? m.translate.errorSuggestionsClosed() : null,
  );

  const draftId = (key: string, catalog = data.catalog, locale = data.locale) => `${catalog}|${locale}|${key}`;

  beforeNavigate((navigation) => {
    if (navigation.type === "leave" && dirtyCount > 0) navigation.cancel();
  });

  function track(key: string, entry: RowDraft | null) {
    const id = draftId(key);
    const before = drafts[id];
    if (!entry) {
      if (before) delete drafts[id];
      return;
    }
    if (before && before.text === entry.text && before.ready === entry.ready) return;
    if (failures[id] && before?.text !== entry.text) delete failures[id];
    drafts[id] = entry;
  }

  async function saveAll() {
    if (savingAll || readyCount === 0) return;
    savingAll = true;
    bulkMessage = null;
    bulkError = null;
    const groups = new Map<string, { catalog: string; locale: string; entries: Array<{ id: string; key: string; text: string }> }>();
    for (const [id, draft] of Object.entries(drafts)) {
      if (!draft.ready) continue;
      const [catalog, locale, ...rest] = id.split("|");
      const slot = `${catalog}|${locale}`;
      const group = groups.get(slot) ?? { catalog, locale, entries: [] };
      group.entries.push({ id, key: rest.join("|"), text: draft.text });
      groups.set(slot, group);
    }

    let saved = 0;
    let failed = 0;
    let suggested = false;
    let stopped = false;
    for (const group of groups.values()) {
      for (let start = 0; start < group.entries.length && !stopped; start += translationLimits.bulkMax) {
        const chunk = group.entries.slice(start, start + translationLimits.bulkMax);
        const result = await wikiCall<BulkResult>("POST", "/api/translations/strings/bulk", {
          catalog: group.catalog,
          locale: group.locale,
          items: chunk.map((entry) => ({ key: entry.key, text: entry.text })),
        });
        if (!result.ok || !result.data) {
          bulkError = translationErrorMessage(result.error);
          stopped = true;
          break;
        }
        const outcome = result.data;
        suggested = outcome.mode === "suggest";
        outcome.results.forEach((entry, index) => {
          const sent = chunk[index];
          if (entry.saved) {
            saved++;
            delete drafts[sent.id];
            const visible = group.catalog === data.catalog && group.locale === data.locale;
            const row = visible ? rows.find((r) => r.key === sent.key) : undefined;
            if (!row) return;
            updateRow(
              outcome.mode === "edit"
                ? { ...row, translation: sent.text, hasOverride: true, untranslated: false, outdated: false, previousSource: null, updatedByName: null, updatedAt: null }
                : { ...row, mine: { id: row.mine?.id ?? "", text: sent.text }, openSuggestions: row.mine ? row.openSuggestions : row.openSuggestions + 1 },
            );
          } else {
            failed++;
            failures[sent.id] = itemErrorMessage(entry.error);
          }
        });
      }
    }
    savingAll = false;
    if (saved > 0) bulkMessage = suggested ? m.translate.bulkSent({ count: saved }) : m.translate.bulkSaved({ count: saved });
    if (failed > 0) bulkError = m.translate.bulkFailed({ count: failed });
  }

  let rows = $derived<StringRow[]>(data.strings?.rows ?? []);
  let searchText = $state("");
  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  let historyKey = $state<string | null>(null);

  let sentSearch = "";

  $effect(() => {
    const incoming = data.search;
    if (incoming !== sentSearch) {
      searchText = incoming;
      sentSearch = incoming;
    }
  });

  const overview = $derived(data.overview.find((c) => c.catalog === data.catalog));
  const progress = $derived(overview?.languages.find((l) => l.locale === data.locale));
  const done = $derived(progress ? progress.total - progress.untranslated : 0);
  const percent = $derived(progress && progress.total > 0 ? Math.round((done / progress.total) * 100) : 0);
  const totalPages = $derived(data.strings ? Math.max(1, Math.ceil(data.strings.total / translationLimits.pageSize)) : 1);
  const canReview = $derived(data.locale !== null && canReviewLocale(data.tr.scope, data.locale));

  const languageOptions = $derived((overview?.languages ?? []).map((l) => ({ id: l.locale, name: localeLabel(l.locale) })));
  const groupOptions = $derived([
    { id: allGroups, name: m.translate.allGroups() },
    ...(overview?.groups ?? []).map((g) => ({ id: g, name: groupLabel(g) })),
  ]);

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  const sortOptions = $derived(
    stringSorts.map((sort) => ({ id: sort, name: sortLabel(sort) })),
  );

  function sortLabel(sort: StringSort): string {
    switch (sort) {
      case "added":
        return m.translate.sortAdded();
      case "approved":
        return m.translate.sortApproved();
      case "suggested":
        return m.translate.sortSuggested();
      default:
        return m.translate.sortKey();
    }
  }

  function go(next: { catalog?: string | null; locale?: string | null; group?: string | null; filter?: StringFilter; sort?: StringSort; q?: string; page?: number }, scroll = false) {
    const merged = { catalog: data.catalog, locale: data.locale, group: data.group, filter: data.filter, sort: data.sort, q: searchText.trim(), page: 1, ...next };
    sentSearch = merged.q;
    const params = new URLSearchParams();
    if (merged.catalog) params.set("catalog", merged.catalog);
    if (merged.locale) params.set("locale", merged.locale);
    if (merged.group) params.set("group", merged.group);
    if (merged.filter !== "all") params.set("filter", merged.filter);
    if (merged.sort !== "key") params.set("sort", merged.sort);
    if (merged.q) params.set("q", merged.q);
    if (merged.page > 1) params.set("page", String(merged.page));
    const query = params.toString();
    void goto(query ? `?${query}` : page.url.pathname, { keepFocus: true, noScroll: !scroll, replaceState: true });
  }

  function onSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => go({ q: searchText.trim() }), 300);
  }

  function filterLabel(filter: StringFilter): string {
    switch (filter) {
      case "untranslated":
        return m.translate.untranslated();
      case "approved":
        return m.common.approved();
      case "outdated":
        return m.translate.outdated();
      case "suggestions":
        return m.translate.hasSuggestions();
      default:
        return m.common.all();
    }
  }

  function catalogLabel(catalog: string): string {
    return catalog === "bot" ? m.translate.catalogBot() : catalog === "dash" ? m.translate.catalogDash() : catalog;
  }

  function chip(active: boolean): string {
    return active
      ? `background: ${$colorStore.primary}20; color: ${$colorStore.primary}; border: 1px solid ${$colorStore.primary}40;`
      : `background: transparent; color: ${$colorStore.muted}; border: 1px solid ${$colorStore.primary}20;`;
  }

  function updateRow(updated: StringRow) {
    rows = rows.map((row) => (row.key === updated.key ? updated : row));
  }
</script>

{#if data.overview.length === 0}
  <p style="color: {$colorStore.muted}">{m.translate.catalogsEmpty()}</p>
{:else}
  <div class="space-y-5">
    {#if data.overview.length > 1}
      <div class="flex flex-wrap gap-2" role="group" aria-label={m.translate.catalogAria()}>
        {#each data.overview as item (item.catalog)}
          <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={chip(item.catalog === data.catalog)}
                  aria-pressed={item.catalog === data.catalog}
                  onclick={() => go({ catalog: item.catalog, locale: null, group: null })}>{catalogLabel(item.catalog)}</button>
        {/each}
      </div>
    {/if}

    {#if data.locale === null}
      <p style="color: {$colorStore.muted}">{m.translate.catalogsEmpty()}</p>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <span id="translate-language-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.language()}</span>
          <DiscordSelector type="custom" options={languageOptions} selected={data.locale} clearable={false}
                           placeholder={m.translate.languagePlaceholder()} ariaLabelledby="translate-language-label"
                           onchange={(d) => { if (typeof d.selected === "string") go({ locale: d.selected }); }} />
        </div>
        <div>
          <span id="translate-group-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.group()}</span>
          <DiscordSelector type="custom" options={groupOptions} selected={data.group ?? allGroups} clearable={false}
                           ariaLabelledby="translate-group-label"
                           onchange={(d) => { if (typeof d.selected === "string") go({ group: d.selected === allGroups ? null : d.selected }); }} />
        </div>
      </div>

      {#if progress}
        <div class="space-y-2">
          <div class="text-sm" style="color: {$colorStore.text}">{m.translate.progress({ done, total: progress.total })}</div>
          <div class="h-2 rounded-full overflow-hidden" style="background: {$colorStore.primary}20;"
               role="progressbar" aria-label={m.translate.progressAria()} aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent}>
            <div class="h-full rounded-full" style="width: {percent}%; background: {$colorStore.primary}; color: {$colorStore.onPrimary};"></div>
          </div>
        </div>
      {/if}

      <div class="flex flex-wrap gap-2" role="group" aria-label={m.translate.filterAria()}>
        {#each stringFilters as filter (filter)}
          <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={chip(filter === data.filter)}
                  aria-pressed={filter === data.filter} onclick={() => go({ filter })}>{filterLabel(filter)}</button>
        {/each}
      </div>

      <div class="max-w-sm">
        <span id="translate-sort-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.translate.sortAria()}</span>
        <DiscordSelector type="custom" options={sortOptions} selected={data.sort} clearable={false}
                         ariaLabelledby="translate-sort-label"
                         onchange={(d) => { if (typeof d.selected === "string") go({ sort: d.selected as StringSort }); }} />
      </div>

      <input type="search" bind:value={searchText} oninput={onSearch} maxlength={translationLimits.searchMax} autocomplete="off"
             placeholder={m.common.searchPlaceholder()} aria-label={m.translate.searchAria()}
             class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>

      {#if !data.tr.signedIn}
        <a href="/api/discord/login?redirect_to={encodeURIComponent(page.url.pathname + page.url.search)}"
           class="inline-flex items-center min-h-[44px] text-sm font-medium underline" style="color: {$colorStore.primary}">{m.translate.loginPrompt()}</a>
      {/if}

      {#if rows.length === 0}
        <p style="color: {$colorStore.muted}">{m.translate.stringsEmpty()}</p>
      {:else}
        <ul>
          {#each rows as row (row.key)}
            <TranslationRow {row} catalog={data.catalog ?? ""} locale={data.locale} signedIn={data.tr.signedIn} {canReview} {closedMessage}
                            draft={drafts[draftId(row.key)]?.text} error={failures[draftId(row.key)] ?? null}
                            onupdate={updateRow} onhistory={(key) => { historyKey = key; }} ondraft={track} />
          {/each}
        </ul>
      {/if}

      {#if data.strings && totalPages > 1}
        <div class="flex flex-wrap items-center gap-3">
          {#if data.strings.page > 1}
            <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={chip(false)}
                    onclick={() => go({ page: data.strings!.page - 1 }, true)}>{m.common.previous()}</button>
          {/if}
          <span class="text-sm" style="color: {$colorStore.muted}">{m.common.pageOfTotal({ page: data.strings.page, total: totalPages })}</span>
          {#if data.strings.page < totalPages}
            <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={chip(false)}
                    onclick={() => go({ page: data.strings!.page + 1 }, true)}>{m.common.next()}</button>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
{/if}

{#if dirtyCount > 0}
  <div class="sticky bottom-3 z-30 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg p-3"
       style="background: {$colorStore.background}; border: 1px solid {$colorStore.primary}30;">
    <div class="text-sm" style="color: {$colorStore.text}">
      <p>{dirtyCount === 1 ? m.translate.unsavedOne() : m.translate.unsavedOther({ count: dirtyCount })}</p>
      {#if dirtyCount > readyCount}
        <p class="text-xs" style="color: {$colorStore.muted}">{m.translate.bulkInvalid({ count: dirtyCount - readyCount })}</p>
      {/if}
    </div>
    <button type="button" class="px-5 rounded-lg min-h-[44px] font-semibold w-full sm:w-auto" disabled={savingAll || readyCount === 0}
            style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" onclick={saveAll}>{m.translate.saveAll()}</button>
  </div>
{/if}

{#if bulkError}
  <p class="text-sm text-red-400 mt-3" role="alert">{bulkError}</p>
{/if}
{#if bulkMessage}
  <p class="text-sm mt-3" style="color: {$colorStore.muted}" role="status">{bulkMessage}</p>
{/if}

{#if historyKey !== null && data.catalog && data.locale}
  <TranslationHistory catalog={data.catalog} locale={data.locale} translationKey={historyKey} canRestore={canReview}
                      onclose={() => { historyKey = null; }}
                      onrestored={(text) => {
                        const row = rows.find((r) => r.key === historyKey);
                        if (row) updateRow({ ...row, translation: text, hasOverride: true, untranslated: false, outdated: false, previousSource: null });
                      }} />
{/if}
