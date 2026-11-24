<!-- routes/wiki/manage/[id]/+page.svelte -->
<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { goto, invalidateAll } from "$app/navigation";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { localeLabel, wikiCall, wikiErrorMessage } from "$lib/wiki/client";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import WikiEditor from "$lib/components/wiki/WikiEditor.svelte";
  import WikiHistory from "$lib/components/wiki/WikiHistory.svelte";
  import WikiPageFields from "$lib/components/wiki/WikiPageFields.svelte";

  let { data } = $props();

  type Tab = "article" | "details" | "history";

  let tab = $state<Tab>(untrack(() => data.tab ?? "article"));

  let title = $state("");
  let summary = $state("");
  let tags = $state<string[]>([]);
  let markdown = $state("");
  let note = $state("");
  let busy = $state(false);
  let articleError = $state<string | null>(null);
  let saved = $state(false);

  let slug = $state("");
  let category = $state("");
  let icon = $state("fa-book");
  let dashboardHref = $state("");
  let moduleName = $state("");
  let related = $state<string[]>([]);
  let published = $state(false);
  let detailsBusy = $state(false);
  let detailsError = $state<string | null>(null);
  let detailsSaved = $state(false);

  $effect(() => {
    if (!data.page) return;
    title = data.prefill?.title ?? data.page.title;
    summary = data.prefill?.summary ?? "";
    tags = [...(data.prefill?.tags ?? [])];
    markdown = data.prefill?.markdown ?? "";
    note = "";
    articleError = null;
    saved = false;
  });

  $effect(() => {
    if (!data.page) return;
    slug = data.page.slug;
    category = data.page.category;
    icon = data.page.icon;
    dashboardHref = data.page.dashboardHref ?? "";
    moduleName = data.page.module ?? "";
    related = [...data.page.related];
    published = data.page.published;
    detailsError = null;
    detailsSaved = false;
  });

  const localeOptions = $derived(
    (data.locales ?? []).map((id) => ({ id, name: localeLabel(id) }))
  );

  const tabs = $derived([
    { id: "article" as Tab, label: m.wikiManage.tabArticle() },
    { id: "details" as Tab, label: m.common.details() },
    { id: "history" as Tab, label: m.common.history() },
  ]);

  const untranslated = $derived(data.page ? !data.version : false);

  async function saveArticle() {
    if (!data.page) return;
    busy = true;
    articleError = null;
    saved = false;
    const result = await wikiCall("PUT", `/api/wiki/pages/${data.page.id}/versions/${data.locale}`, {
      title,
      summary,
      tags,
      markdown,
      note,
      baseRevisionId: data.version?.currentRevisionId ?? null,
    });
    busy = false;
    if (!result.ok) {
      articleError = wikiErrorMessage(result.error);
      return;
    }
    await invalidateAll();
    saved = true;
  }

  async function saveDetails() {
    if (!data.page) return;
    detailsBusy = true;
    detailsError = null;
    detailsSaved = false;
    const result = await wikiCall("PATCH", `/api/wiki/pages/${data.page.id}`, {
      slug,
      category,
      icon,
      dashboardHref,
      module: moduleName,
      related,
      published,
    });
    detailsBusy = false;
    if (!result.ok) {
      detailsError = wikiErrorMessage(result.error);
      return;
    }
    await invalidateAll();
    detailsSaved = true;
  }

  async function removePage() {
    if (!data.page) return;
    const ok = await requestConfirmation({
      title: m.wikiManage.deleteTitle({ name: data.page.title }),
      message: m.wikiManage.deleteMessage(),
      confirmText: m.common.delete(),
      variant: "danger",
    });
    if (!ok) return;
    const result = await wikiCall("DELETE", `/api/wiki/pages/${data.page.id}`);
    if (!result.ok) {
      detailsError = wikiErrorMessage(result.error);
      return;
    }
    await goto("/wiki/manage");
  }

  function tabStyle(active: boolean): string {
    return active
      ? `background: ${$colorStore.primary}20; color: ${$colorStore.primary}; border: 1px solid ${$colorStore.primary}40;`
      : `background: transparent; color: ${$colorStore.muted}; border: 1px solid ${$colorStore.primary}20;`;
  }
</script>

{#if data.page}
  <div class="rounded-2xl border p-4 sm:p-6 space-y-4" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
    <div class="flex flex-wrap items-center gap-3">
      <a href="/wiki/manage" class="inline-flex items-center justify-center px-4 rounded-lg min-h-[44px]"
         aria-label={m.common.back()}
         style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;">
        <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
      </a>
      <h2 class="text-lg font-semibold min-w-0 grow break-words" style="color: {$colorStore.text}">{data.page.title}</h2>
      {#if data.page.published}
        <a href="/wiki/{data.page.slug}" class="inline-flex items-center justify-center px-4 rounded-lg min-h-[44px] text-sm font-medium"
           style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;">
          {m.wikiManage.viewArticle()}
        </a>
      {/if}
    </div>

    <div class="flex flex-wrap gap-2" role="group" aria-label={m.wikiManage.sectionsAria()}>
      {#each tabs as item (item.id)}
        <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={tabStyle(tab === item.id)}
                aria-pressed={tab === item.id} onclick={() => { tab = item.id; }}>{item.label}</button>
      {/each}
    </div>

    {#if tab !== "details"}
      <div class="max-w-xs">
        <span id="wiki-manage-language" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.language()}</span>
        <DiscordSelector
          type="custom"
          options={localeOptions}
          selected={data.locale}
          clearable={false}
          ariaLabelledby="wiki-manage-language"
          onchange={(e) => {
            if (typeof e.selected === "string") goto(`/wiki/manage/${data.page?.id}?locale=${e.selected}`, { keepFocus: true });
          }}
        />
      </div>
    {/if}

    {#if tab === "article"}
      {#if untranslated}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.wikiManage.notTranslated()}</p>
      {/if}
      <WikiEditor
        bind:title
        bind:summary
        bind:tags
        bind:markdown
        bind:note
        {busy}
        canUpload
        error={articleError}
        submitLabel={m.common.save()}
        onsubmit={saveArticle}
      />
      {#if saved}
        <p class="text-sm" style="color: {$colorStore.muted}" role="status">{m.wikiManage.saved()}</p>
      {/if}
    {:else if tab === "details"}
      <form class="space-y-4" onsubmit={(event) => { event.preventDefault(); if (!detailsBusy) void saveDetails(); }}>
        <WikiPageFields
          bind:slug
          bind:category
          bind:icon
          bind:dashboardHref
          bind:moduleName
          bind:related
          categories={data.categories}
          pages={data.choices}
          ownSlug={data.page.slug}
          idPrefix="wiki-details"
        />
        <ToggleRow checked={published} title={m.wikiManage.publishedToggle()} colors={$colorStore} onchange={(value) => { published = value; }} />
        {#if detailsError}
          <p class="text-sm text-red-400" role="alert">{detailsError}</p>
        {/if}
        <div class="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={detailsBusy}
                  class="px-5 rounded-lg min-h-[50px] font-semibold disabled:opacity-50"
                  style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};">{m.common.save()}</button>
          <button type="button" class="px-5 rounded-lg min-h-[50px] font-medium"
                  style="background: {$colorStore.accent}20; color: {$colorStore.text}; border: 1px solid {$colorStore.accent}40;"
                  onclick={removePage}>
            <i class="fa-solid fa-trash mr-2" aria-hidden="true"></i>{m.common.delete()}
          </button>
        </div>
        {#if detailsSaved}
          <p class="text-sm" style="color: {$colorStore.muted}" role="status">{m.wikiManage.saved()}</p>
        {/if}
      </form>
    {:else}
      <WikiHistory
        pageId={data.page.id}
        locale={data.locale}
        currentRevisionId={data.version?.currentRevisionId ?? null}
        onrestored={() => invalidateAll()}
      />
    {/if}
  </div>
{/if}
