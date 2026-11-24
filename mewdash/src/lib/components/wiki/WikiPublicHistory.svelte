<!-- lib/components/wiki/WikiPublicHistory.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { diffVersions } from "$lib/wiki/diff";
  import { formatWhen, wikiCall, wikiErrorMessage } from "$lib/wiki/client";
  import type { PublicRevision, RevisionRecord } from "$lib/wiki/records";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import WikiDiff from "./WikiDiff.svelte";

  interface Props {
    pageId: string;
    locale: string;
    onclose: () => void;
  }

  let { pageId, locale, onclose }: Props = $props();

  let revisions = $state<PublicRevision[]>([]);
  let hasMore = $state(false);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let opened = $state<{ revision: RevisionRecord; previous: RevisionRecord | null } | null>(null);
  let opening = $state<string | null>(null);

  async function load(reset: boolean) {
    loading = true;
    error = null;
    const before = !reset && revisions.length > 0 ? `&before=${revisions[revisions.length - 1].id}` : "";
    const result = await wikiCall<{ revisions: PublicRevision[]; hasMore: boolean }>(
      "GET",
      `/api/wiki/history?pageId=${pageId}&locale=${encodeURIComponent(locale)}${before}`
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
    revisions = [];
    void load(true);
  });

  async function open(id: string) {
    opening = id;
    const result = await wikiCall<{ revision: RevisionRecord; previous: RevisionRecord | null }>("GET", `/api/wiki/history/${id}`);
    opening = null;
    if (!result.ok || !result.data) {
      error = wikiErrorMessage(result.error);
      return;
    }
    opened = result.data;
  }

  const diffs = $derived(opened ? diffVersions(opened.previous, opened.revision) : []);
</script>

<Sheet title={m.common.history()} size="lg" {onclose}>
  {#if opened}
    <button type="button" class="inline-flex items-center gap-2 px-4 rounded-lg min-h-[44px] text-sm font-medium"
            style="background: {$colorStore.primary}10; color: {$colorStore.text};"
            onclick={() => { opened = null; }}>
      <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>{m.common.back()}
    </button>
    <p class="text-sm" style="color: {$colorStore.muted}">
      {m.wikiManage.historyRevisionTitle({ name: opened.revision.authorName, when: formatWhen(opened.revision.createdAt) })}
    </p>
    {#if opened.revision.note}
      <p class="text-sm break-words" style="color: {$colorStore.muted}">{opened.revision.note}</p>
    {/if}
    <WikiDiff {diffs} />
  {:else}
    {#if error}
      <p class="text-sm text-red-400" role="alert">{error}</p>
    {/if}
    {#if !loading && revisions.length === 0 && !error}
      <p style="color: {$colorStore.muted}">{m.wikiManage.historyEmpty()}</p>
    {/if}
    <ul>
      {#each revisions as revision, index (revision.id)}
        <li class="py-3 border-t first:border-t-0 flex flex-wrap items-center gap-x-3 gap-y-2" style="border-color: {$colorStore.primary}20;">
          <div class="min-w-0 grow">
            <div class="text-sm font-medium truncate" style="color: {$colorStore.text}">{revision.authorName}</div>
            <div class="text-xs" style="color: {$colorStore.muted}">
              {formatWhen(revision.createdAt)}{#if index === 0}<span class="ml-2">{m.common.current()}</span>{/if}
            </div>
            {#if revision.note}
              <div class="text-sm mt-1 break-words" style="color: {$colorStore.muted}">{revision.note}</div>
            {/if}
          </div>
          <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium disabled:opacity-50"
                  style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                  disabled={opening !== null} onclick={() => open(revision.id)}>{m.common.view()}</button>
        </li>
      {/each}
    </ul>
    {#if hasMore}
      <button type="button" class="px-5 rounded-lg min-h-[50px] font-medium disabled:opacity-50"
              style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
              disabled={loading} onclick={() => load(false)}>{m.wikiManage.historyLoadMore()}</button>
    {/if}
  {/if}
</Sheet>
