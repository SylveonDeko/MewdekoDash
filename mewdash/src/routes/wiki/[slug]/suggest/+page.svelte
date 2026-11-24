<!-- routes/wiki/[slug]/suggest/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { colorStore } from "$lib/stores/colorStore";
  import { localeLabel, wikiCall, wikiErrorMessage } from "$lib/wiki/client";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import WikiEditor from "$lib/components/wiki/WikiEditor.svelte";

  let { data } = $props();

  let title = $state("");
  let summary = $state("");
  let tags = $state<string[]>([]);
  let markdown = $state("");
  let note = $state("");
  let busy = $state(false);
  let error = $state<string | null>(null);
  let sent = $state(false);

  $effect(() => {
    if (!data.available) return;
    title = data.initial.title;
    summary = data.initial.summary;
    tags = [...data.initial.tags];
    markdown = data.initial.markdown;
    note = data.initial.note;
    error = null;
    sent = false;
  });

  const localeOptions = $derived(data.locales.map((id) => ({ id, name: localeLabel(id) })));

  async function submit() {
    if (!data.available) return;
    busy = true;
    error = null;
    const result = await wikiCall("POST", "/api/wiki/suggestions", {
      pageId: data.pageId,
      locale: data.locale,
      title,
      summary,
      tags,
      markdown,
      note,
    });
    busy = false;
    if (result.ok) sent = true;
    else error = wikiErrorMessage(result.error);
  }
</script>

<svelte:head>
  <title>{m.wikiManage.suggestPageTitle()}</title>
</svelte:head>

<div class="space-y-6 max-w-6xl">
  <h1 class="text-2xl font-bold" style="color: {$colorStore.text}">{m.wikiManage.suggestAnEdit()}</h1>

  {#if !data.available}
    <p style="color: {$colorStore.muted}">
      {data.notice === "closed" ? m.wikiManage.suggestionsClosed() : data.notice === "blocked" ? m.wikiManage.suggestionsBlocked() : m.wikiManage.databaseUnavailable()}
    </p>
  {:else if sent}
    <div class="space-y-4">
      <p style="color: {$colorStore.text}" role="status">{m.wikiManage.suggestSent()}</p>
      <div class="flex flex-wrap gap-2">
        <a href="/wiki/{data.slug}" class="inline-flex items-center justify-center px-5 rounded-lg min-h-[50px] font-medium"
           style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;">
          {m.wikiManage.backToArticle()}
        </a>
        <a href="/wiki/manage/mine" class="inline-flex items-center justify-center px-5 rounded-lg min-h-[50px] font-medium"
           style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;">
          {m.wikiManage.mineLink()}
        </a>
      </div>
    </div>
  {:else}
    <div class="rounded-2xl border p-4 sm:p-6 space-y-4" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <div class="max-w-xs">
        <span id="suggest-language" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.language()}</span>
        <DiscordSelector
          type="custom"
          options={localeOptions}
          selected={data.locale}
          clearable={false}
          ariaLabelledby="suggest-language"
          onchange={(e) => {
            if (typeof e.selected === "string") goto(`/wiki/${data.slug}/suggest?locale=${e.selected}`);
          }}
        />
      </div>
      {#if data.replacing}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.wikiManage.suggestReplacing()}</p>
      {/if}
      <WikiEditor
        bind:title
        bind:summary
        bind:tags
        bind:markdown
        bind:note
        {busy}
        {error}
        submitLabel={m.wikiManage.suggestSubmit()}
        onsubmit={submit}
      />
    </div>
  {/if}
</div>
