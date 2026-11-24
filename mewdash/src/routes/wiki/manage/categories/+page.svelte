<!-- routes/wiki/manage/categories/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { invalidateAll } from "$app/navigation";
  import { flip } from "svelte/animate";
  import { dragHandle, dragHandleZone } from "svelte-dnd-action";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { wikiIconClass } from "$lib/wiki";
  import { wikiCall, wikiErrorMessage } from "$lib/wiki/client";
  import { wikiLimits } from "$lib/wiki/validation";
  import type { CategoryRecord } from "$lib/wiki/records";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import WikiIconSelect from "$lib/components/wiki/WikiIconSelect.svelte";

  let { data } = $props();

  let items = $state<CategoryRecord[]>([]);
  let saving = $state(false);
  let listError = $state<string | null>(null);

  $effect(() => {
    items = [...data.categories];
  });

  async function saveOrder(next: CategoryRecord[]) {
    saving = true;
    listError = null;
    const result = await wikiCall("POST", "/api/wiki/categories/reorder", { ids: next.map((item) => item.id) });
    saving = false;
    if (!result.ok) listError = wikiErrorMessage(result.error);
    await invalidateAll();
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    items = next;
    void saveOrder(next);
  }

  let editing = $state<{ id: string | null } | null>(null);
  let name = $state("");
  let icon = $state("fa-folder");
  let busy = $state(false);
  let formError = $state<string | null>(null);

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function openForm(category: CategoryRecord | null) {
    editing = { id: category?.id ?? null };
    name = category?.name ?? "";
    icon = category?.icon ?? "fa-folder";
    formError = null;
  }

  async function submit() {
    if (!editing || busy) return;
    busy = true;
    formError = null;
    const result =
      editing.id === null
        ? await wikiCall("POST", "/api/wiki/categories", { name, icon })
        : await wikiCall("PATCH", `/api/wiki/categories/${editing.id}`, { name, icon });
    busy = false;
    if (!result.ok) {
      formError = wikiErrorMessage(result.error);
      return;
    }
    editing = null;
    await invalidateAll();
  }

  async function remove(category: CategoryRecord) {
    const ok = await requestConfirmation({
      title: m.wikiManage.categoryDeleteTitle({ name: category.name }),
      message: m.wikiManage.categoryDeleteMessage(),
      confirmText: m.common.delete(),
      variant: "danger",
    });
    if (!ok) return;
    const result = await wikiCall("DELETE", `/api/wiki/categories/${category.id}`);
    if (!result.ok) {
      listError = wikiErrorMessage(result.error);
      return;
    }
    await invalidateAll();
  }
</script>

<div class="space-y-6">
  <div class="flex flex-wrap items-center gap-3">
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
            style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
            onclick={() => openForm(null)}>
      <i class="fa-solid fa-plus" aria-hidden="true"></i>{m.wikiManage.categoryAdd()}
    </button>
  </div>

  {#if listError}
    <p class="text-sm text-red-400" role="alert">{listError}</p>
  {/if}

  <section class="rounded-2xl border p-4 sm:p-6" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
    {#if items.length === 0}
      <p style="color: {$colorStore.muted}">{m.wikiManage.categoriesEmpty()}</p>
    {:else}
      <ol class="space-y-2" aria-label={m.common.categories()}
          use:dragHandleZone={{ items, type: "categories", flipDurationMs: 150, dragDisabled: saving, dropTargetStyle: {} }}
          onconsider={(e) => { items = e.detail.items; }}
          onfinalize={(e) => { items = e.detail.items; void saveOrder(e.detail.items); }}>
        {#each items as category, index (category.id)}
          <li class="flex flex-row flex-wrap items-center gap-3 py-2 border-t first:border-t-0"
              style="border-color: {$colorStore.primary}20;"
              animate:flip={{ duration: 150 }}>
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <span use:dragHandle aria-label={m.wikiManage.dragLabel({ name: category.name })}
                    class="w-6 h-[44px] flex items-center justify-center shrink-0 cursor-grab touch-none"
                    style="color: {$colorStore.muted};">
                <i class="fa-solid fa-grip-vertical" aria-hidden="true"></i>
              </span>
              <i class="{wikiIconClass(category.icon)} text-lg w-6 text-center shrink-0"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};" aria-hidden="true"></i>
              <div class="min-w-0 flex-1">
                <div class="font-semibold truncate" style="color: {$colorStore.text}">{category.name}</div>
                <div class="text-xs" style="color: {$colorStore.muted}">
                  {category.pageCount === 1 ? m.wikiManage.categoryPagesOne() : m.wikiManage.categoryPagesOther({ count: category.pageCount })}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 ml-auto shrink-0">
              <button type="button" class="w-11 h-11 rounded-lg disabled:opacity-30" aria-label={m.common.ariaMoveNamedUp({ name: category.name })}
                      style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                      disabled={saving || index === 0} onclick={() => move(index, -1)}>
                <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>
              </button>
              <button type="button" class="w-11 h-11 rounded-lg disabled:opacity-30" aria-label={m.common.ariaMoveNamedDown({ name: category.name })}
                      style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                      disabled={saving || index === items.length - 1} onclick={() => move(index, 1)}>
                <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
              </button>
              <button type="button" class="w-11 h-11 rounded-lg" aria-label={m.common.editName({ name: category.name })}
                      style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                      onclick={() => openForm(category)}>
                <i class="fa-solid fa-pen" aria-hidden="true"></i>
              </button>
              <button type="button" class="w-11 h-11 rounded-lg disabled:opacity-30" aria-label={m.common.ariaRemoveNamed({ name: category.name })}
                      style="background: {$colorStore.accent}20; color: {$colorStore.text};"
                      disabled={category.pageCount > 0} onclick={() => remove(category)}>
                <i class="fa-solid fa-trash" aria-hidden="true"></i>
              </button>
            </div>
          </li>
        {/each}
      </ol>
    {/if}
  </section>
</div>

{#if editing}
  <Sheet title={editing.id === null ? m.wikiManage.categoryAdd() : m.wikiManage.categoryEdit()} onclose={() => { editing = null; }}>
    <form id="wiki-category-form" class="space-y-4" onsubmit={(event) => { event.preventDefault(); void submit(); }}>
      <div>
        <label for="wiki-category-name" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.name()}</label>
        <input id="wiki-category-name" type="text" bind:value={name} maxlength={wikiLimits.categoryMax} autocomplete="off"
               class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
      </div>
      <WikiIconSelect bind:icon idPrefix="wiki-category" label={m.wikiManage.categoryIcon()} />
      {#if formError}
        <p class="text-sm text-red-400" role="alert">{formError}</p>
      {/if}
    </form>
    {#snippet footer()}
      <button type="button" class="px-5 rounded-lg min-h-[50px] font-medium"
              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              onclick={() => { editing = null; }}>{m.common.cancel()}</button>
      <button type="submit" form="wiki-category-form" disabled={busy || !name.trim()}
              class="px-5 rounded-lg min-h-[50px] font-semibold disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};">{m.common.save()}</button>
    {/snippet}
  </Sheet>
{/if}
