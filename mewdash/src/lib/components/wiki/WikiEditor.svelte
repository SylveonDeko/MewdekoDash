<!-- lib/components/wiki/WikiEditor.svelte -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { renderWikiMarkdown } from "$lib/wiki/render";
  import { wikiLimits } from "$lib/wiki/validation";
  import TagInput from "./TagInput.svelte";
  import WikiArticleView from "./WikiArticle.svelte";

  interface Props {
    title: string;
    summary: string;
    tags: string[];
    markdown: string;
    note: string;
    busy?: boolean;
    submitLabel: string;
    error?: string | null;
    onsubmit: () => void;
    actions?: Snippet;
  }

  let {
    title = $bindable(),
    summary = $bindable(),
    tags = $bindable(),
    markdown = $bindable(),
    note = $bindable(),
    busy = false,
    submitLabel,
    error = null,
    onsubmit,
    actions,
  }: Props = $props();

  let pane = $state<"write" | "preview">("write");
  let previewHtml = $state("");

  $effect(() => {
    const source = markdown;
    const timer = setTimeout(() => {
      previewHtml = renderWikiMarkdown(source).html;
    }, 150);
    return () => clearTimeout(timer);
  });

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function paneStyle(active: boolean): string {
    return active
      ? `background: ${$colorStore.primary}20; color: ${$colorStore.primary}; border: 1px solid ${$colorStore.primary}40;`
      : `background: transparent; color: ${$colorStore.muted}; border: 1px solid transparent;`;
  }
</script>

<form
  class="space-y-4"
  onsubmit={(event) => {
    event.preventDefault();
    if (!busy) onsubmit();
  }}
>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div class="space-y-4 min-w-0 {pane === 'preview' ? 'hidden lg:block' : ''}">
      <div>
        <label for="wiki-edit-title" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.title()}</label>
        <input id="wiki-edit-title" type="text" bind:value={title} maxlength={wikiLimits.titleMax} autocomplete="off"
               class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
      </div>
      <div>
        <label for="wiki-edit-summary" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.wikiManage.fieldSummary()}</label>
        <textarea id="wiki-edit-summary" bind:value={summary} maxlength={wikiLimits.summaryMax} rows="2"
                  class="w-full p-3 rounded-lg border" style={field}></textarea>
      </div>
      <div>
        <label for="wiki-edit-tags" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.wikiManage.fieldTags()}</label>
        <TagInput id="wiki-edit-tags" bind:tags />
      </div>
      <div>
        <label for="wiki-edit-body" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.wikiManage.fieldBody()}</label>
        <textarea id="wiki-edit-body" bind:value={markdown} maxlength={wikiLimits.markdownMax} rows="22" spellcheck="true"
                  class="w-full p-3 rounded-lg border font-mono text-sm min-h-[50vh]" style={field}></textarea>
      </div>
    </div>

    <div class="min-w-0 {pane === 'write' ? 'hidden lg:block' : ''}">
      <h3 class="hidden lg:block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.preview()}</h3>
      <div class="rounded-lg border p-4 overflow-x-hidden" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <WikiArticleView article={{ html: previewHtml }} compact />
      </div>
    </div>
  </div>

  <div>
    <label for="wiki-edit-note" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.wikiManage.fieldNote()}</label>
    <input id="wiki-edit-note" type="text" bind:value={note} maxlength={wikiLimits.noteMax} autocomplete="off"
           class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
  </div>

  {#if error}
    <p class="text-sm text-red-400" role="alert">{error}</p>
  {/if}

  <div class="flex flex-wrap items-center gap-2">
    <button type="submit" disabled={busy}
            class="px-5 rounded-lg min-h-[50px] font-semibold disabled:opacity-50"
            style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};">
      {submitLabel}
    </button>
    <div class="flex lg:hidden gap-1 p-1 rounded-lg" style="background: {$colorStore.primary}10;" role="group" aria-label={m.wikiManage.paneSwitchAria()}>
      <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={paneStyle(pane === "write")}
              aria-pressed={pane === "write"} onclick={() => (pane = "write")}>{m.wikiManage.paneWrite()}</button>
      <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={paneStyle(pane === "preview")}
              aria-pressed={pane === "preview"} onclick={() => (pane = "preview")}>{m.common.preview()}</button>
    </div>
    {@render actions?.()}
  </div>
</form>
