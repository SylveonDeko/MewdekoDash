<!-- lib/components/wiki/WikiHistory.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { diffVersions } from "$lib/wiki/diff";
  import { formatWhen, wikiCall, wikiErrorMessage } from "$lib/wiki/client";
  import { renderWikiMarkdown } from "$lib/wiki/render";
  import type { RevisionRecord, RevisionSummary, VersionRecord } from "$lib/wiki/records";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import WikiArticleView from "./WikiArticle.svelte";
  import WikiDiff from "./WikiDiff.svelte";

  interface Props {
    pageId: string;
    locale: string;
    currentRevisionId: string | null;
    onrestored: () => void | Promise<void>;
  }

  let { pageId, locale, currentRevisionId, onrestored }: Props = $props();

  type View = "previous" | "current" | "preview";

  let revisions = $state<RevisionSummary[]>([]);
  let hasMore = $state(false);
  let loading = $state(true);
  let error = $state<string | null>(null);

  let opened = $state<{ revision: RevisionRecord; previous: RevisionRecord | null; current: VersionRecord | null } | null>(null);
  let view = $state<View>("previous");
  let opening = $state<string | null>(null);
  let restoring = $state(false);
  let restoreError = $state<string | null>(null);

  async function load(reset: boolean) {
    loading = true;
    error = null;
    const before = !reset && revisions.length > 0 ? `&before=${revisions[revisions.length - 1].id}` : "";
    const result = await wikiCall<{ revisions: RevisionSummary[]; hasMore: boolean }>(
      "GET",
      `/api/wiki/pages/${pageId}/revisions?locale=${encodeURIComponent(locale)}${before}`
    );
    loading = false;
    if (!result.ok || !result.data) {
      error = wikiErrorMessage(result.error);
      return;
    }
    revisions = reset ? result.data.revisions : [...revisions, ...result.data.revisions];
    hasMore = result.data.hasMore;
  }

  $effect(() => {
    void pageId;
    void locale;
    void currentRevisionId;
    revisions = [];
    void load(true);
  });

  async function open(id: string) {
    opening = id;
    const result = await wikiCall<{ revision: RevisionRecord; previous: RevisionRecord | null; current: VersionRecord | null }>(
      "GET",
      `/api/wiki/revisions/${id}`
    );
    opening = null;
    if (!result.ok || !result.data) {
      error = wikiErrorMessage(result.error);
      return;
    }
    opened = result.data;
    view = result.data.previous ? "previous" : "current";
    restoreError = null;
  }

  const diffs = $derived.by(() => {
    if (!opened) return [];
    const target = opened.revision;
    if (view === "previous") return diffVersions(opened.previous, target);
    return diffVersions(opened.current, target);
  });

  const previewHtml = $derived(opened ? renderWikiMarkdown(opened.revision.markdown).html : "");

  async function restore() {
    if (!opened) return;
    const revision = opened.revision;
    const ok = await requestConfirmation({
      title: m.wikiManage.historyRestoreTitle(),
      message: m.wikiManage.historyRestoreMessage(),
      confirmText: m.wikiManage.historyRestore(),
      variant: "warning",
    });
    if (!ok) return;
    restoring = true;
    restoreError = null;
    const result = await wikiCall("POST", `/api/wiki/pages/${pageId}/undo`, {
      revisionId: revision.id,
      expectedRevisionId: currentRevisionId,
      note: m.wikiManage.historyRestoreNote({ id: revision.id }),
    });
    restoring = false;
    if (!result.ok) {
      restoreError = wikiErrorMessage(result.error);
      return;
    }
    opened = null;
    await onrestored();
  }

  function viewStyle(active: boolean): string {
    return active
      ? `background: ${$colorStore.primary}20; color: ${$colorStore.primary}; border: 1px solid ${$colorStore.primary}40;`
      : `background: transparent; color: ${$colorStore.muted}; border: 1px solid ${$colorStore.primary}20;`;
  }
</script>

<div class="space-y-3">
  {#if error}
    <p class="text-sm text-red-400" role="alert">{error}</p>
  {/if}

  {#if !loading && revisions.length === 0 && !error}
    <p style="color: {$colorStore.muted}">{m.wikiManage.historyEmpty()}</p>
  {/if}

  <ul class="space-y-2">
    {#each revisions as revision (revision.id)}
      <li class="rounded-xl border p-3 flex flex-wrap items-center gap-x-3 gap-y-2"
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <div class="min-w-0 grow">
          <div class="text-sm font-medium truncate" style="color: {$colorStore.text}">
            {revision.authorName}
          </div>
          <div class="text-xs" style="color: {$colorStore.muted}">
            {formatWhen(revision.createdAt)}{#if revision.id === currentRevisionId}<span class="ml-2">{m.common.current()}</span>{/if}
          </div>
          {#if revision.note}
            <div class="text-sm mt-1 break-words" style="color: {$colorStore.muted}">{revision.note}</div>
          {/if}
        </div>
        <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium disabled:opacity-50"
                style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                disabled={opening !== null}
                onclick={() => open(revision.id)}>
          {m.common.view()}
        </button>
      </li>
    {/each}
  </ul>

  {#if hasMore}
    <button type="button" class="px-5 rounded-lg min-h-[50px] font-medium disabled:opacity-50"
            style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
            disabled={loading} onclick={() => load(false)}>
      {m.wikiManage.historyLoadMore()}
    </button>
  {/if}
</div>

{#if opened}
  <Sheet title={m.wikiManage.historyRevisionTitle({ name: opened.revision.authorName, when: formatWhen(opened.revision.createdAt) })} size="lg" onclose={() => { opened = null; }}>
    <div class="flex flex-wrap gap-2">
      {#if opened.previous}
        <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={viewStyle(view === "previous")}
                aria-pressed={view === "previous"} onclick={() => { view = "previous"; }}>{m.wikiManage.historyVsPrevious()}</button>
      {/if}
      {#if opened.current && opened.revision.id !== currentRevisionId}
        <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={viewStyle(view === "current")}
                aria-pressed={view === "current"} onclick={() => { view = "current"; }}>{m.wikiManage.historyVsCurrent()}</button>
      {/if}
      <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={viewStyle(view === "preview")}
              aria-pressed={view === "preview"} onclick={() => { view = "preview"; }}>{m.common.preview()}</button>
    </div>

    {#if opened.revision.note}
      <p class="text-sm break-words" style="color: {$colorStore.muted}">{opened.revision.note}</p>
    {/if}

    {#if view === "preview"}
      <h3 class="text-xl font-bold break-words" style="color: {$colorStore.text}">{opened.revision.title}</h3>
      <WikiArticleView article={{ html: previewHtml }} compact />
    {:else}
      <WikiDiff {diffs} />
    {/if}

    {#if restoreError}
      <p class="text-sm text-red-400" role="alert">{restoreError}</p>
    {/if}

    {#snippet footer()}
      {#if opened && opened.revision.id !== currentRevisionId}
        <button type="button" class="px-5 rounded-lg min-h-[50px] font-semibold disabled:opacity-50"
                style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
                disabled={restoring} onclick={restore}>
          {m.wikiManage.historyRestore()}
        </button>
      {/if}
    {/snippet}
  </Sheet>
{/if}
