<!-- routes/wiki/manage/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto, invalidateAll } from "$app/navigation";
  import { flip } from "svelte/animate";
  import { dragHandle, dragHandleZone } from "svelte-dnd-action";
  import { colorStore } from "$lib/stores/colorStore";
  import { wikiIconClass } from "$lib/wiki";
  import { wikiCall, wikiErrorMessage } from "$lib/wiki/client";
  import { slugFromTitle, wikiLimits } from "$lib/wiki/validation";
  import type { ManagePage } from "$lib/wiki/records";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import WikiPageFields from "$lib/components/wiki/WikiPageFields.svelte";

  let { data } = $props();

  interface DragItem {
    id: string;
    page: ManagePage;
  }

  let groups = $state<Array<{ category: string; items: DragItem[] }>>([]);
  let saving = $state(false);
  let listError = $state<string | null>(null);

  $effect(() => {
    const byCategory = new Map<string, DragItem[]>();
    for (const page of data.pages) {
      const list = byCategory.get(page.category) ?? [];
      list.push({ id: page.id, page });
      byCategory.set(page.category, list);
    }
    groups = [...byCategory].map(([category, items]) => ({ category, items }));
  });

  const categories = $derived(groups.map((g) => g.category));
  const pageChoices = $derived(data.pages.map((p) => ({ slug: p.slug, title: p.title })));

  async function saveOrder(category: string, items: DragItem[]) {
    saving = true;
    listError = null;
    const result = await wikiCall("POST", "/api/wiki/pages/reorder", { category, ids: items.map((i) => i.id) });
    saving = false;
    if (!result.ok) listError = wikiErrorMessage(result.error);
    await invalidateAll();
  }

  function move(group: { category: string; items: DragItem[] }, index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= group.items.length) return;
    const items = [...group.items];
    [items[index], items[target]] = [items[target], items[index]];
    group.items = items;
    void saveOrder(group.category, items);
  }

  let creating = $state(false);
  let busy = $state(false);
  let createError = $state<string | null>(null);
  let title = $state("");
  let slug = $state("");
  let slugEdited = $state(false);
  let category = $state("");
  let icon = $state("fa-book");
  let dashboardHref = $state("");
  let moduleName = $state("");
  let related = $state<string[]>([]);

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function openCreate() {
    title = "";
    slug = "";
    slugEdited = false;
    category = categories[0] ?? "";
    icon = "fa-book";
    dashboardHref = "";
    moduleName = "";
    related = [];
    createError = null;
    creating = true;
  }

  $effect(() => {
    if (!slugEdited) slug = slugFromTitle(title);
  });

  async function create() {
    busy = true;
    createError = null;
    const result = await wikiCall<{ id: string }>("POST", "/api/wiki/pages", {
      slug,
      icon,
      category,
      dashboardHref,
      module: moduleName,
      related,
      title,
      summary: "",
      tags: [],
      markdown: "",
    });
    busy = false;
    if (result.ok && result.data) {
      creating = false;
      await goto(`/wiki/manage/${result.data.id}`);
    } else {
      createError = wikiErrorMessage(result.error);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-wrap items-center gap-3">
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
            style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
            onclick={openCreate}>
      <i class="fa-solid fa-plus" aria-hidden="true"></i>{m.wikiManage.newPage()}
    </button>
  </div>

  {#if listError}
    <p class="text-sm text-red-400" role="alert">{listError}</p>
  {/if}

  {#each groups as group (group.category)}
    <section class="rounded-2xl border p-4 sm:p-6 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <h2 class="text-base font-semibold" style="color: {$colorStore.text}">{group.category}</h2>
      <ol class="space-y-2" aria-label={group.category}
          use:dragHandleZone={{ items: group.items, type: group.category, flipDurationMs: 150, dragDisabled: saving, dropTargetStyle: {} }}
          onconsider={(e) => { group.items = e.detail.items; }}
          onfinalize={(e) => { group.items = e.detail.items; void saveOrder(group.category, e.detail.items); }}>
        {#each group.items as item, index (item.id)}
          {@const page = item.page}
          <li class="rounded-xl border p-3 flex flex-row flex-wrap items-center gap-3"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
              animate:flip={{ duration: 150 }}>
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <span use:dragHandle aria-label={m.wikiManage.dragLabel({ name: page.title })}
                    class="w-6 h-[44px] flex items-center justify-center shrink-0 cursor-grab touch-none"
                    style="color: {$colorStore.muted};">
                <i class="fa-solid fa-grip-vertical" aria-hidden="true"></i>
              </span>
              <i class="{wikiIconClass(page.icon)} text-lg w-6 text-center shrink-0"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};" aria-hidden="true"></i>
              <div class="min-w-0 flex-1">
                <div class="font-semibold truncate" style="color: {$colorStore.text}">{page.title}</div>
                <div class="flex flex-wrap gap-x-3 text-xs" style="color: {$colorStore.muted}">
                  <span class="truncate">{page.slug}</span>
                  {#if !page.published}
                    <span>{m.wikiManage.draft()}</span>
                  {/if}
                  {#if page.openSuggestions > 0}
                    <span>{page.openSuggestions === 1 ? m.wikiManage.openSuggestionsOne() : m.wikiManage.openSuggestionsOther({ count: page.openSuggestions })}</span>
                  {/if}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 ml-auto shrink-0">
              <button type="button" class="w-11 h-11 rounded-lg disabled:opacity-30" aria-label={m.common.ariaMoveNamedUp({ name: page.title })}
                      style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                      disabled={saving || index === 0} onclick={() => move(group, index, -1)}>
                <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>
              </button>
              <button type="button" class="w-11 h-11 rounded-lg disabled:opacity-30" aria-label={m.common.ariaMoveNamedDown({ name: page.title })}
                      style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                      disabled={saving || index === group.items.length - 1} onclick={() => move(group, index, 1)}>
                <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
              </button>
              <a href="/wiki/manage/{page.id}" class="w-11 h-11 rounded-lg flex items-center justify-center"
                 aria-label={m.common.editName({ name: page.title })}
                 style="background: {$colorStore.primary}10; color: {$colorStore.text};">
                <i class="fa-solid fa-pen" aria-hidden="true"></i>
              </a>
            </div>
          </li>
        {/each}
      </ol>
    </section>
  {:else}
    <p style="color: {$colorStore.muted}">{m.wikiManage.pagesEmpty()}</p>
  {/each}
</div>

{#if creating}
  <Sheet title={m.wikiManage.newPage()} onclose={() => { creating = false; }}>
    <form id="wiki-new-page" class="space-y-4" onsubmit={(event) => { event.preventDefault(); if (!busy) void create(); }}>
      <div>
        <label for="wiki-new-title" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.title()}</label>
        <input id="wiki-new-title" type="text" bind:value={title} maxlength={wikiLimits.titleMax} autocomplete="off"
               class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
      </div>
      <WikiPageFields
        bind:slug
        bind:category
        bind:icon
        bind:dashboardHref
        bind:moduleName
        bind:related
        {categories}
        pages={pageChoices}
        idPrefix="wiki-new"
        onslugedit={() => { slugEdited = true; }}
      />
      {#if createError}
        <p class="text-sm text-red-400" role="alert">{createError}</p>
      {/if}
    </form>
    {#snippet footer()}
      <button type="button" class="px-5 rounded-lg min-h-[50px] font-medium"
              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              onclick={() => { creating = false; }}>{m.common.cancel()}</button>
      <button type="submit" form="wiki-new-page" disabled={busy || !title.trim() || !slug}
              class="px-5 rounded-lg min-h-[50px] font-semibold disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};">{m.common.create()}</button>
    {/snippet}
  </Sheet>
{/if}
