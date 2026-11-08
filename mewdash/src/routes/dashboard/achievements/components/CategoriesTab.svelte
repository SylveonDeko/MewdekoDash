<script lang="ts">
  import { m } from "$lib/i18n";
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
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import AchievementIcon from "./AchievementIcon.svelte";
  import CategorySheet from "./CategorySheet.svelte";

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
  let editing = $state<{ category: AchievementCategory | null } | null>(null);

  let ordered = $derived(catalog.categories);

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
      onerror(err?.message || m.achievements.categoriesErrorSaveLayout());
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

  /**
   * Deletes a server category after asking.
   * @param category The category
   */
  async function remove(category: AchievementCategory) {
    if (!$currentGuild?.id || !category.id) return;
    const ok = await requestConfirmation({
      title: m.achievements.editorDeleteTitle({ name: category.name }),
      message: category.achievementCount === 0
        ? m.achievements.categoriesDeleteMessageNone()
        : category.achievementCount === 1
          ? m.achievements.categoriesDeleteMessageOne({ count: 1 })
          : m.achievements.categoriesDeleteMessageOther({ count: category.achievementCount }),
      confirmText: m.achievements.categoriesDeleteConfirm(),
      variant: "danger"
    });
    if (!ok) return;
    try {
      await achievementsApi.deleteCategory($currentGuild.id, category.id);
      await onchanged();
    } catch (err: any) {
      logger.error("Failed to delete a category:", err);
      onerror(err?.message || m.achievements.categoriesErrorDelete());
    }
  }
</script>

<div class="space-y-4" in:fade={{ duration: 200 }}>
  <PluginCard title={m.achievements.categoriesOrderTitle()} alwaysOpen>
    {#snippet actions()}
      <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
              style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
              onclick={() => { editing = { category: null }; }}>
        <i class="fa-solid fa-plus" aria-hidden="true"></i>{m.achievements.categoriesNewTitle()}
      </button>
    {/snippet}
    <ol class="space-y-2" aria-label={m.common.categories()}
        use:dragHandleZone={{ items: dragItems, flipDurationMs: 150, dragDisabled: saving,
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
            <span use:dragHandle aria-label={m.achievements.categoriesDragLabel({ name: category.name })}
                  class="w-6 h-[44px] flex items-center justify-center shrink-0 cursor-grab touch-none"
                  style="color: {$colorStore.muted};">
              <i class="fa-solid fa-grip-vertical" aria-hidden="true"></i>
            </span>
            <AchievementIcon icon={category.icon} iconUrl={category.iconUrl} color={$colorStore.primary} size={40} />
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-semibold" style="color: {$colorStore.text}">{category.name}</span>
                {#if !category.isBuiltIn}
                  <span class="text-xs px-2 py-0.5 rounded-md" style="background: {$colorStore.accent}20; color: {$colorStore.accent}">{m.achievements.libraryMadeHere()}</span>
                {/if}
              </div>
              <div class="text-xs line-clamp-2" style="color: {$colorStore.muted}">
                {m.achievements.categoriesActiveCount({ enabled: category.enabledCount, total: category.achievementCount })}{category.description ? ` · ${category.description}` : ""}
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
                    disabled={saving || index === ordered.length - 1} onclick={() => move(index, 1)}>
              <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
            </button>
            {#if !category.isBuiltIn}
              <button type="button" class="w-11 h-11 rounded-lg" aria-label={m.common.editName({ name: category.name })}
                      style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                      onclick={() => { editing = { category }; }}>
                <i class="fa-solid fa-pen" aria-hidden="true"></i>
              </button>
              <button type="button" class="w-11 h-11 rounded-lg" aria-label={m.common.ariaDeleteNamed({ name: category.name })}
                      style="background: #ef444420; color: #ef4444;"
                      onclick={() => remove(category)}>
                <i class="fa-solid fa-trash" aria-hidden="true"></i>
              </button>
            {/if}
            {#if category.key !== "global"}
              <button type="button" role="switch" aria-checked={category.enabled}
                      aria-label={category.enabled ? m.achievements.libraryDeactivateLabel({ name: category.name }) : m.achievements.libraryActivateLabel({ name: category.name })}
                      class="w-12 h-11 flex items-center justify-center shrink-0 disabled:opacity-50"
                      disabled={saving}
                      onclick={() => setEnabled(category, !category.enabled)}>
                <span class="block w-11 h-6 rounded-full relative transition-all"
                      style="background: {category.enabled ? $colorStore.primary : $colorStore.primary + '20'};">
                  <span class="absolute top-[2px] w-5 h-5 rounded-full bg-white transition-all"
                        style="left: {category.enabled ? '22px' : '2px'};"></span>
                </span>
              </button>
            {/if}
          </div>
        </li>
      {/each}
    </ol>
  </PluginCard>

  <PluginCard title={m.achievements.categoriesPrestigeTitle()} alwaysOpen>
    <ToggleRow checked={!settings.disabledCategories.includes("prestige")}
               title={m.achievements.categoriesPrestigeSubtitle()}
               colors={$colorStore}
               disabled={saving}
               onchange={(on) => { const p = ordered.find((c) => c.key === "prestige"); if (p) setEnabled(p, on); }} />
  </PluginCard>
</div>

{#if editing}
  <CategorySheet category={editing.category} {catalog} {lookups} {onchanged} {onerror} onclose={() => { editing = null; }} />
{/if}
