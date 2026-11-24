<!-- routes/wiki/manage/analytics/+page.svelte -->
<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { wikiCall, wikiErrorMessage } from "$lib/wiki/client";
  import type { AnalyticsItem, AnalyticsOverview } from "$lib/wiki/records";

  let { data } = $props();

  type SortKey = "views" | "helpful" | "notHelpful" | "share" | "openReports";
  type Preset = "all" | "rated" | "reported";

  const periods = [7, 30, 90] as const;
  const minVotes = 5;
  const pageSize = 25;

  let analytics = $state<AnalyticsOverview>(untrack(() => data.analytics));
  let days = $state<number>(untrack(() => data.analytics.days));
  let loading = $state(false);
  let error = $state<string | null>(null);
  let preset = $state<Preset>("all");
  let sortKey = $state<SortKey>("views");
  let descending = $state(true);
  let shown = $state(pageSize);

  const number = (value: number) => new Intl.NumberFormat().format(value);

  function share(item: AnalyticsItem): number | null {
    const votes = item.helpful + item.notHelpful;
    return votes > 0 ? item.helpful / votes : null;
  }

  function shareText(item: AnalyticsItem): string {
    const value = share(item);
    return value === null ? m.common.notAvailable() : `${Math.round(value * 100)}%`;
  }

  function valueOf(item: AnalyticsItem, key: SortKey): number | null {
    return key === "share" ? share(item) : item[key];
  }

  async function choose(period: number) {
    if (period === days || loading) return;
    loading = true;
    error = null;
    const result = await wikiCall<AnalyticsOverview>("GET", `/api/wiki/analytics?days=${period}`);
    loading = false;
    if (!result.ok || !result.data) {
      error = wikiErrorMessage(result.error);
      return;
    }
    analytics = result.data;
    days = period;
    shown = pageSize;
  }

  function sortBy(key: SortKey) {
    if (sortKey === key) descending = !descending;
    else {
      sortKey = key;
      descending = true;
    }
  }

  const rows = $derived.by(() => {
    let list = analytics.items;
    if (preset === "rated") list = list.filter((item) => item.helpful + item.notHelpful >= minVotes);
    else if (preset === "reported") list = list.filter((item) => item.openReports > 0);
    const factor = descending ? -1 : 1;
    return [...list].sort((a, b) => {
      const left = valueOf(a, sortKey);
      const right = valueOf(b, sortKey);
      if (left === null && right === null) return a.title.localeCompare(b.title);
      if (left === null) return 1;
      if (right === null) return -1;
      return (left - right) * factor || a.title.localeCompare(b.title);
    });
  });

  const peak = $derived(Math.max(1, ...analytics.daily.map((d) => d.views)));

  const columns = $derived<Array<{ key: SortKey; label: string }>>([
    { key: "views", label: m.wikiManage.analyticsViews() },
    { key: "helpful", label: m.wikiManage.feedbackHelpful() },
    { key: "notHelpful", label: m.wikiManage.feedbackNotHelpful() },
    { key: "share", label: m.wikiManage.analyticsShare() },
    { key: "openReports", label: m.wikiManage.analyticsReports() },
  ]);

  const presets = $derived<Array<{ key: Preset; label: string }>>([
    { key: "all", label: m.wikiManage.analyticsFilterAll() },
    { key: "rated", label: m.wikiManage.analyticsFilterRated() },
    { key: "reported", label: m.wikiManage.analyticsFilterReported() },
  ]);

  function chip(active: boolean): string {
    return active
      ? `background: ${$colorStore.selectedSurface}; color: ${$colorStore.text}; border: 1px solid ${$colorStore.selectedBorder};`
      : `background: transparent; color: ${$colorStore.muted}; border: 1px solid ${$colorStore.primary}20;`;
  }
</script>

<div class="space-y-6">
  <div class="flex flex-wrap gap-2" role="group" aria-label={m.wikiManage.analyticsPeriodAria()}>
    {#each periods as period (period)}
      <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium disabled:opacity-60" style={chip(days === period)}
              aria-pressed={days === period} disabled={loading} onclick={() => choose(period)}>{m.common.daysCount({ count: period })}</button>
    {/each}
  </div>

  {#if error}
    <p class="text-sm text-red-400" role="alert">{error}</p>
  {/if}

  <section class="rounded-2xl border p-4 sm:p-6 space-y-4" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
    <dl class="grid grid-cols-2 gap-4">
      <div>
        <dt class="text-xs" style="color: {$colorStore.muted}">{m.wikiManage.analyticsViews()}</dt>
        <dd class="text-2xl font-bold" style="color: {$colorStore.text}">{number(analytics.views)}</dd>
      </div>
      <div>
        <dt class="text-xs" style="color: {$colorStore.muted}">{m.wikiManage.feedbackHelpful()}</dt>
        <dd class="text-2xl font-bold" style="color: {$colorStore.text}">{number(analytics.helpful)}</dd>
      </div>
      <div>
        <dt class="text-xs" style="color: {$colorStore.muted}">{m.wikiManage.feedbackNotHelpful()}</dt>
        <dd class="text-2xl font-bold" style="color: {$colorStore.text}">{number(analytics.notHelpful)}</dd>
      </div>
      <div>
        <dt class="text-xs" style="color: {$colorStore.muted}">{m.wikiManage.analyticsReports()}</dt>
        <dd class="text-2xl font-bold" style="color: {$colorStore.text}">{number(analytics.reports)}</dd>
      </div>
    </dl>

    {#if analytics.views === 0}
      <p style="color: {$colorStore.muted}">{m.wikiManage.analyticsEmpty()}</p>
    {:else}
      <div role="img" aria-label={m.wikiManage.analyticsChartLabel()} class="flex items-end gap-px h-32">
        {#each analytics.daily as day (day.day)}
          <div class="flex-1 min-w-px rounded-sm" title="{day.day}: {number(day.views)}"
               style="height: {Math.max(2, Math.round((day.views / peak) * 100))}%; background: {$colorStore.primary}60;"></div>
        {/each}
      </div>
    {/if}
  </section>

  <section class="rounded-2xl border p-4 sm:p-6 space-y-4" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
    <div class="flex flex-wrap gap-2" role="group" aria-label={m.wikiManage.sectionsAria()}>
      {#each presets as item (item.key)}
        <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={chip(preset === item.key)}
                aria-pressed={preset === item.key} onclick={() => { preset = item.key; shown = pageSize; }}>{item.label}</button>
      {/each}
    </div>

    <div class="flex flex-wrap gap-2" role="group" aria-label={m.wikiManage.analyticsSortAria()}>
      {#each columns as column (column.key)}
        <button type="button" class="px-3 rounded-lg min-h-[44px] text-sm" style={chip(sortKey === column.key)}
                aria-pressed={sortKey === column.key} onclick={() => sortBy(column.key)}>
          {column.label}
          {#if sortKey === column.key}
            <i class="fa-solid {descending ? 'fa-chevron-down' : 'fa-chevron-up'} ml-1" aria-hidden="true"></i>
          {/if}
        </button>
      {/each}
    </div>

    {#if rows.length === 0}
      <p style="color: {$colorStore.muted}">{m.wikiManage.analyticsNoPages()}</p>
    {:else}
      <ul>
        {#each rows.slice(0, shown) as item (item.pageId)}
          <li class="py-3 border-t first:border-t-0" style="border-color: {$colorStore.primary}20;">
            <a href="/wiki/manage/{item.pageId}" class="font-semibold break-words" style="color: {$colorStore.text}">{item.title}</a>
            <div class="text-xs" style="color: {$colorStore.muted}">{item.category}</div>
            <dl class="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm" style="color: {$colorStore.text}">
              <div class="flex gap-1"><dt style="color: {$colorStore.muted}">{m.wikiManage.analyticsViews()}</dt><dd>{number(item.views)}</dd></div>
              <div class="flex gap-1"><dt style="color: {$colorStore.muted}">{m.wikiManage.feedbackHelpful()}</dt><dd>{number(item.helpful)}</dd></div>
              <div class="flex gap-1"><dt style="color: {$colorStore.muted}">{m.wikiManage.feedbackNotHelpful()}</dt><dd>{number(item.notHelpful)}</dd></div>
              <div class="flex gap-1"><dt style="color: {$colorStore.muted}">{m.wikiManage.analyticsShare()}</dt><dd>{shareText(item)}</dd></div>
              <div class="flex gap-1"><dt style="color: {$colorStore.muted}">{m.wikiManage.analyticsReports()}</dt><dd>{number(item.openReports)}</dd></div>
            </dl>
          </li>
        {/each}
      </ul>
      {#if rows.length > shown}
        <button type="button" class="px-5 rounded-lg min-h-[50px] font-medium"
                style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                onclick={() => { shown += pageSize; }}>{m.wikiManage.historyLoadMore()}</button>
      {/if}
    {/if}
  </section>

  <section class="rounded-2xl border p-4 sm:p-6 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
    <h2 class="text-base font-semibold" style="color: {$colorStore.text}">{m.wikiManage.analyticsMisses()}</h2>
    {#if analytics.misses.length === 0}
      <p style="color: {$colorStore.muted}">{m.wikiManage.analyticsMissesEmpty()}</p>
    {:else}
      <ul>
        {#each analytics.misses as miss (miss.query)}
          <li class="flex items-center justify-between gap-3 py-2 border-t first:border-t-0" style="border-color: {$colorStore.primary}20;">
            <span class="break-words min-w-0" style="color: {$colorStore.text}">{miss.query}</span>
            <span class="shrink-0 text-sm" style="color: {$colorStore.muted}">{number(miss.count)}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>
