<!-- routes/wiki/manage/suggestions/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { invalidateAll } from "$app/navigation";
  import { colorStore } from "$lib/stores/colorStore";
  import { diffVersions } from "$lib/wiki/diff";
  import { formatWhen, localeLabel, wikiCall, wikiErrorMessage } from "$lib/wiki/client";
  import { renderWikiMarkdown } from "$lib/wiki/render";
  import { wikiLimits } from "$lib/wiki/validation";
  import type { SuggestionRecord } from "$lib/wiki/records";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import WikiArticleView from "$lib/components/wiki/WikiArticle.svelte";
  import WikiDiff from "$lib/components/wiki/WikiDiff.svelte";

  let { data } = $props();

  let reviewing = $state<SuggestionRecord | null>(null);
  let view = $state<"changes" | "preview">("changes");
  let declining = $state(false);
  let reason = $state("");
  let busy = $state(false);
  let error = $state<string | null>(null);

  const diffs = $derived(
    reviewing
      ? diffVersions(reviewing.current ? { title: reviewing.current.title, summary: reviewing.current.summary, tags: reviewing.current.tags, markdown: reviewing.current.markdown } : null, reviewing)
      : []
  );
  const previewHtml = $derived(reviewing ? renderWikiMarkdown(reviewing.markdown).html : "");
  const outdated = $derived(reviewing ? (reviewing.current?.revisionId ?? null) !== reviewing.baseRevisionId : false);

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function statusLabel(status: SuggestionRecord["status"]): string {
    switch (status) {
      case "open":
        return m.common.open();
      case "approved":
        return m.common.approved();
      case "declined":
        return m.wikiManage.statusDeclined();
      default:
        return m.wikiManage.statusReplaced();
    }
  }

  function open(suggestion: SuggestionRecord) {
    reviewing = suggestion;
    view = "changes";
    declining = false;
    reason = "";
    error = null;
  }

  async function decide(action: "approve" | "decline") {
    if (!reviewing) return;
    busy = true;
    error = null;
    const result = await wikiCall("POST", `/api/wiki/suggestions/${reviewing.id}`, action === "decline" ? { action, reason } : { action });
    busy = false;
    if (!result.ok) {
      error = wikiErrorMessage(result.error);
      return;
    }
    reviewing = null;
    await invalidateAll();
  }

  function viewStyle(active: boolean): string {
    return active
      ? `background: ${$colorStore.primary}20; color: ${$colorStore.primary}; border: 1px solid ${$colorStore.primary}40;`
      : `background: transparent; color: ${$colorStore.muted}; border: 1px solid ${$colorStore.primary}20;`;
  }
</script>

<section class="rounded-2xl border p-4 sm:p-6 space-y-4" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
  <div class="flex flex-wrap gap-2" role="group" aria-label={m.wikiManage.sectionsAria()}>
    <a href="/wiki/manage/suggestions" class="inline-flex items-center px-4 rounded-lg min-h-[44px] text-sm font-medium" style={viewStyle(!data.closed)}
       aria-current={!data.closed ? "page" : undefined}>{m.common.open()}</a>
    <a href="/wiki/manage/suggestions?show=closed" class="inline-flex items-center px-4 rounded-lg min-h-[44px] text-sm font-medium" style={viewStyle(data.closed)}
       aria-current={data.closed ? "page" : undefined}>{m.common.closed()}</a>
  </div>

  {#if data.suggestions.length === 0}
    <p style="color: {$colorStore.muted}">{m.wikiManage.suggestionsEmpty()}</p>
  {:else}
    <ul class="space-y-2">
      {#each data.suggestions as suggestion (suggestion.id)}
        <li class="rounded-xl border p-3 flex flex-wrap items-center gap-x-3 gap-y-2"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="min-w-0 grow">
            <div class="font-semibold break-words" style="color: {$colorStore.text}">{suggestion.pageTitle}</div>
            <div class="text-xs" style="color: {$colorStore.muted}">
              {m.wikiManage.changeMeta({ language: localeLabel(suggestion.locale), name: suggestion.userName, when: formatWhen(suggestion.createdAt) })}
            </div>
            {#if suggestion.note}
              <div class="text-sm mt-1 break-words" style="color: {$colorStore.muted}">{suggestion.note}</div>
            {/if}
            {#if suggestion.status !== "open"}
              <div class="text-xs mt-1" style="color: {$colorStore.muted}">{statusLabel(suggestion.status)}</div>
            {/if}
          </div>
          <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium"
                  style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                  onclick={() => open(suggestion)}>
            {suggestion.status === "open" ? m.wikiManage.suggestionReview() : m.common.view()}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</section>

{#if reviewing}
  <Sheet title={reviewing.pageTitle} size="lg" onclose={() => { reviewing = null; }}>
    <p class="text-sm" style="color: {$colorStore.muted}">
      {m.wikiManage.changeMeta({ language: localeLabel(reviewing.locale), name: reviewing.userName, when: formatWhen(reviewing.createdAt) })}
    </p>
    {#if reviewing.note}
      <p class="text-sm break-words" style="color: {$colorStore.text}">{reviewing.note}</p>
    {/if}
    {#if reviewing.status === "declined" && reviewing.declineReason}
      <p class="text-sm break-words" style="color: {$colorStore.muted}">{reviewing.declineReason}</p>
    {/if}
    {#if reviewing.status === "open" && outdated}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.wikiManage.suggestionOutdated()}</p>
    {/if}

    <div class="flex flex-wrap gap-2">
      <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={viewStyle(view === "changes")}
              aria-pressed={view === "changes"} onclick={() => { view = "changes"; }}>{m.wikiManage.suggestionChanges()}</button>
      <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={viewStyle(view === "preview")}
              aria-pressed={view === "preview"} onclick={() => { view = "preview"; }}>{m.common.preview()}</button>
    </div>

    {#if view === "changes"}
      <WikiDiff {diffs} />
    {:else}
      <h3 class="text-xl font-bold break-words" style="color: {$colorStore.text}">{reviewing.title}</h3>
      <WikiArticleView article={{ html: previewHtml }} compact />
    {/if}

    {#if declining}
      <div>
        <label for="wiki-decline-reason" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.wikiManage.declineReason()}</label>
        <input id="wiki-decline-reason" type="text" bind:value={reason} maxlength={wikiLimits.reasonMax} autocomplete="off"
               class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
      </div>
    {/if}
    {#if error}
      <p class="text-sm text-red-400" role="alert">{error}</p>
    {/if}

    {#snippet footer()}
      {#if reviewing && reviewing.status === "open"}
        {#if declining}
          <button type="button" class="px-5 rounded-lg min-h-[50px] font-medium"
                  style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                  onclick={() => { declining = false; }}>{m.common.cancel()}</button>
          <button type="button" class="px-5 rounded-lg min-h-[50px] font-semibold disabled:opacity-50"
                  style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
                  disabled={busy} onclick={() => decide("decline")}>{m.wikiManage.suggestionDecline()}</button>
        {:else}
          <button type="button" class="px-5 rounded-lg min-h-[50px] font-medium"
                  style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                  onclick={() => { declining = true; }}>{m.wikiManage.suggestionDecline()}</button>
          <button type="button" class="px-5 rounded-lg min-h-[50px] font-semibold disabled:opacity-50"
                  style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
                  disabled={busy} onclick={() => decide("approve")}>{m.common.approve()}</button>
        {/if}
      {/if}
    {/snippet}
  </Sheet>
{/if}
