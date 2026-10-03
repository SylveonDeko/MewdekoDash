<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { dragHandle, dragHandleZone } from "svelte-dnd-action";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import {
    achievementsApi,
    type AchievementCatalog,
    type AchievementCategory,
    type AchievementLookups,
    type AchievementSettings
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import AchievementIcon from "./AchievementIcon.svelte";
  import DuoIcon from "./DuoIcon.svelte";
  import IconPicker from "./IconPicker.svelte";

  /** Tab inputs. */
  interface Props {
    catalog: AchievementCatalog;
    lookups: AchievementLookups | null;
    settings: AchievementSettings;
    onchanged: () => Promise<void>;
    onerror: (text: string) => void;
    onsuccess: (text: string) => void;
  }

  let { catalog, lookups, settings, onchanged, onerror }: Props = $props();

  let saving = $state(false);
  let creating = $state(false);
  let newName = $state("");
  let newIcon = $state<string | null>(null);
  let newDescription = $state("");
  let editingId = $state<number | null>(null);
  let editName = $state("");
  let editIcon = $state<string | null>(null);
  let editDescription = $state("");

  let ordered = $derived(catalog.categories);
  let customCount = $derived(catalog.categories.filter((c) => !c.isBuiltIn).length);

  /** The list as the drag and drop zone holds it, following the catalog between drags. */
  let dragItems = $state<{ id: string; category: AchievementCategory }[]>([]);

  $effect(() => {
    dragItems = catalog.categories.map((category) => ({ id: category.key, category }));
  });

  /**
   * Saves the order a drag left behind.
   * @param event The drop
   */
  function dropped(event: CustomEvent<{ items: { id: string; category: AchievementCategory }[] }>) {
    dragItems = event.detail.items;
    const keys = dragItems.map((item) => item.category.key);
    if (keys.join("|") === ordered.map((c) => c.key).join("|")) return;
    saveLayout(keys, ordered.filter((c) => !c.enabled).map((c) => c.key));
  }

  /**
   * Saves a new order and set of disabled categories.
   * @param order Category keys in order
   * @param disabled Category keys turned off
   */
  async function saveLayout(order: string[], disabled: string[]) {
    if (!$currentGuild?.id || saving) return;
    saving = true;
    try {
      await achievementsApi.setCategoryLayout($currentGuild.id, order, disabled);
      await onchanged();
    } catch (err: any) {
      logger.error("Failed to save the category layout:", err);
      onerror(err?.message || "Couldn't save the categories.");
    } finally {
      saving = false;
    }
  }

  /**
   * Moves a category up or down.
   * @param index Its position
   * @param direction -1 up, 1 down
   */
  function move(index: number, direction: -1 | 1) {
    const keys = ordered.map((c) => c.key);
    const target = index + direction;
    if (target < 0 || target >= keys.length) return;
    [keys[index], keys[target]] = [keys[target], keys[index]];
    saveLayout(keys, ordered.filter((c) => !c.enabled).map((c) => c.key));
  }

  /**
   * Turns a category on or off.
   * @param category The category
   * @param enabled The new state
   */
  function setEnabled(category: AchievementCategory, enabled: boolean) {
    const disabled = ordered.filter((c) => (c.key === category.key ? !enabled : !c.enabled)).map((c) => c.key);
    saveLayout(ordered.map((c) => c.key), disabled);
  }

  /** Makes a new category from the form. */
  async function create() {
    if (!$currentGuild?.id || creating || !newName.trim()) return;
    creating = true;
    try {
      await achievementsApi.createCategory($currentGuild.id, newName.trim(), newDescription.trim() || null, newIcon);
      newName = "";
      newIcon = null;
      newDescription = "";
      await onchanged();
    } catch (err: any) {
      logger.error("Failed to make a category:", err);
      onerror(err?.message || "Couldn't make the category.");
    } finally {
      creating = false;
    }
  }

  /**
   * Opens the inline editor on a server category.
   * @param category The category
   */
  function startEdit(category: AchievementCategory) {
    editingId = category.id ?? null;
    editName = category.name;
    editIcon = category.icon === "fa:folder" ? null : category.icon;
    editDescription = category.description;
  }

  /** Saves the inline editor. */
  async function saveEdit() {
    if (!$currentGuild?.id || editingId === null || !editName.trim()) return;
    saving = true;
    try {
      await achievementsApi.updateCategory($currentGuild.id, editingId, editName.trim(),
        editDescription.trim() || null, editIcon);
      editingId = null;
      await onchanged();
    } catch (err: any) {
      logger.error("Failed to rename a category:", err);
      onerror(err?.message || "Couldn't save the category.");
    } finally {
      saving = false;
    }
  }

  /**
   * Deletes a server category after asking.
   * @param category The category
   */
  async function remove(category: AchievementCategory) {
    if (!$currentGuild?.id || !category.id) return;
    const ok = await requestConfirmation({
      title: `Delete ${category.name}?`,
      message: category.achievementCount > 0
        ? `Its ${category.achievementCount} achievements move to the Server category. Nobody loses anything.`
        : "It has no achievements in it.",
      confirmText: "Delete category",
      variant: "danger"
    });
    if (!ok) return;
    try {
      await achievementsApi.deleteCategory($currentGuild.id, category.id);
      await onchanged();
    } catch (err: any) {
      logger.error("Failed to delete a category:", err);
      onerror(err?.message || "Couldn't delete the category.");
    }
  }
</script>

<div class="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start" in:fade={{ duration: 200 }}>
  <div class="xl:col-span-2 rounded-2xl border p-5 md:p-6 shadow-2xl"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
              border-color: {$colorStore.primary}30;">
    <h2 class="flex items-center gap-2 text-lg font-semibold" style="color: {$colorStore.text}">
      <DuoIcon icon="fa-layer-group" />
      Order and visibility
    </h2>
    <p class="text-sm mt-1 mb-5" style="color: {$colorStore.muted}">
      Members see categories in this order everywhere. Deactivating one stops new unlocks in it; anything already earned stays.
    </p>

    <ol class="space-y-2" aria-label="Categories"
        use:dragHandleZone={{ items: dragItems, flipDurationMs: 150, dragDisabled: saving || editingId !== null,
                              dropTargetStyle: {} }}
        onconsider={(e) => { dragItems = e.detail.items; }}
        onfinalize={dropped}>
      {#each dragItems as item, index (item.id)}
        {@const category = item.category}
        <li class="rounded-xl border p-3 flex flex-row flex-wrap items-center gap-3"
            class:opacity-60={!category.enabled}
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
            animate:flip={{ duration: 150 }}>
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <span use:dragHandle aria-label="Drag {category.name} to reorder"
                  class="w-6 h-[44px] flex items-center justify-center shrink-0 cursor-grab touch-none"
                  style="color: {$colorStore.muted};">
              <i class="fa-solid fa-grip-vertical" aria-hidden="true"></i>
            </span>
            <div class="flex flex-col gap-1">
              <button type="button" class="w-8 h-7 rounded-md disabled:opacity-30" aria-label="Move {category.name} up"
                      style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                      disabled={saving || index === 0} onclick={() => move(index, -1)}>
                <i class="fa-solid fa-chevron-up text-xs" aria-hidden="true"></i>
              </button>
              <button type="button" class="w-8 h-7 rounded-md disabled:opacity-30" aria-label="Move {category.name} down"
                      style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                      disabled={saving || index === ordered.length - 1} onclick={() => move(index, 1)}>
                <i class="fa-solid fa-chevron-down text-xs" aria-hidden="true"></i>
              </button>
            </div>
            <AchievementIcon icon={category.icon} iconUrl={category.iconUrl} color={$colorStore.primary} size={40} />
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-semibold" style="color: {$colorStore.text}">{category.name}</span>
                {#if !category.isBuiltIn}
                  <span class="text-xs px-2 py-0.5 rounded-md" style="background: {$colorStore.accent}20; color: {$colorStore.accent}">Made here</span>
                {/if}
              </div>
              <div class="text-xs line-clamp-2" style="color: {$colorStore.muted}">
                {category.enabledCount} of {category.achievementCount} active{category.description ? ` · ${category.description}` : ""}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 ml-auto shrink-0">
            {#if !category.isBuiltIn}
              <button type="button" class="w-10 h-10 rounded-lg" aria-label="Edit {category.name}"
                      style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                      onclick={() => startEdit(category)}>
                <i class="fa-solid fa-pen" aria-hidden="true"></i>
              </button>
              <button type="button" class="w-10 h-10 rounded-lg" aria-label="Delete {category.name}"
                      style="background: #ef444420; color: #ef4444;"
                      onclick={() => remove(category)}>
                <i class="fa-solid fa-trash" aria-hidden="true"></i>
              </button>
            {/if}
            {#if category.key !== "global"}
              <button type="button" role="switch" aria-checked={category.enabled}
                      aria-label="{category.enabled ? 'Deactivate' : 'Activate'} {category.name}"
                      class="w-12 h-7 rounded-full relative transition-all shrink-0 disabled:opacity-50"
                      style="background: {category.enabled ? $colorStore.primary : $colorStore.primary + '20'};"
                      disabled={saving}
                      onclick={() => setEnabled(category, !category.enabled)}>
                <span class="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all"
                      style="left: {category.enabled ? '22px' : '2px'};"></span>
              </button>
            {/if}
          </div>
          {#if editingId !== null && editingId === category.id}
            <div class="basis-full grid grid-cols-1 gap-3 pt-2" transition:slide={{ duration: 150 }}>
              <input type="text" bind:value={editName} maxlength={catalog.limits.nameLength} aria-label="Name"
                     class="px-3 h-[44px] rounded-xl border text-sm"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
              <input type="text" bind:value={editDescription} maxlength={catalog.limits.descriptionLength}
                     aria-label="Description" placeholder="What goes in it"
                     class="px-3 h-[44px] rounded-xl border text-sm"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
              <IconPicker value={editIcon} defaultIcon="fa:folder" defaultLabel="the folder icon"
                          uploads={catalog.uploads} emojis={lookups?.emojis ?? []} color={$colorStore.primary}
                          label="Change the icon of {category.name}"
                          onchange={(icon) => { editIcon = icon; }} onuploadschanged={onchanged} {onerror} />
              <div class="flex gap-2 justify-end">
                <button type="button" class="px-4 py-2 rounded-xl min-h-[44px]"
                        style="background: {$colorStore.primary}08; color: {$colorStore.text};"
                        onclick={() => { editingId = null; }}>Cancel</button>
                <button type="button" class="px-4 py-2 rounded-xl min-h-[44px] font-semibold disabled:opacity-50"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                        disabled={saving || !editName.trim()} onclick={saveEdit}>Save</button>
              </div>
            </div>
          {/if}
        </li>
      {/each}
    </ol>
  </div>

  <div class="rounded-2xl border p-5 md:p-6 shadow-2xl xl:sticky xl:top-4"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
              border-color: {$colorStore.primary}30;">
    <h2 class="flex items-center gap-2 text-lg font-semibold" style="color: {$colorStore.text}">
      <DuoIcon icon="fa-folder-plus" />
      New category
    </h2>
    <p class="text-sm mt-1 mb-5" style="color: {$colorStore.muted}">
      Group your own achievements, like Events, Seasons, or Lore. {customCount} of {catalog.limits.maxCustomCategories} used.
    </p>
    <div class="space-y-3">
      <input type="text" bind:value={newName} maxlength={catalog.limits.nameLength} aria-label="Name" placeholder="Events"
             class="w-full px-3 h-[44px] rounded-xl border text-sm"
             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
      <IconPicker value={newIcon} defaultIcon="fa:folder" defaultLabel="the folder icon"
                  uploads={catalog.uploads} emojis={lookups?.emojis ?? []} color={$colorStore.primary}
                  label="Pick an icon for the new category"
                  onchange={(icon) => { newIcon = icon; }} onuploadschanged={onchanged} {onerror} />
      <input type="text" bind:value={newDescription} maxlength={catalog.limits.descriptionLength}
             aria-label="Description" placeholder="What goes in it"
             class="w-full px-3 h-[44px] rounded-xl border text-sm"
             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
      <button type="button" class="w-full px-4 py-3 rounded-xl min-h-[44px] font-semibold disabled:opacity-50"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              disabled={creating || !newName.trim() || customCount >= catalog.limits.maxCustomCategories}
              onclick={create}>
        <i class="fa-solid fa-plus mr-2" aria-hidden="true"></i>Make category
      </button>
    </div>
    <div class="mt-6">
      <ToggleRow checked={!settings.disabledCategories.includes("prestige")}
                 title="Prestige for finishing categories"
                 subtitle="Bonus achievements for unlocking every achievement in a category."
                 colors={$colorStore}
                 disabled={saving}
                 onchange={(on) => { const p = ordered.find((c) => c.key === "prestige"); if (p) setEnabled(p, on); }} />
    </div>
  </div>
</div>
