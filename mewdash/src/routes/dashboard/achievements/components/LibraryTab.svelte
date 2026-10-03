<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import {
    achievementsApi,
    type Achievement,
    type AchievementCatalog,
    type AchievementLookups
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import AchievementEditor from "./AchievementEditor.svelte";
  import AchievementIcon from "./AchievementIcon.svelte";
  import DuoIcon from "./DuoIcon.svelte";
  import { criteriaText, gradeOf } from "../achievementHelpers";

  /** Tab inputs. */
  interface Props {
    catalog: AchievementCatalog;
    lookups: AchievementLookups | null;
    request: { mode: "new" | "edit"; key?: string; nonce: number } | null;
    onsaved: (achievement: Achievement) => void;
    onremoved: (key: string) => void;
    onbulk: () => Promise<void>;
    ongotocategories: () => void;
    onerror: (text: string) => void;
    onsuccess: (text: string) => void;
  }

  let { catalog, lookups, request, onsaved, onremoved, onbulk, ongotocategories, onerror, onsuccess }: Props = $props();

  type Filter = "all" | "on" | "off" | "hidden" | "custom" | "rewards" | "changed";
  type Sort = "order" | "name" | "popular" | "rare" | "points";

  let category = $state("all");
  let search = $state("");
  let filter = $state<Filter>("all");
  let gradeFilter = $state("any");
  let sort = $state<Sort>("order");
  let selected = $state<Set<string>>(new Set());
  let busy = $state<Record<string, boolean>>({});
  let bulkBusy = $state(false);
  let editor = $state<{ achievement: Achievement | null; key: number } | null>(null);
  let editorCounter = 0;
  let lastRequest = 0;

  $effect(() => {
    if (!request || request.nonce === lastRequest) return;
    lastRequest = request.nonce;
    if (request.mode === "new") {
      startNew();
    } else if (request.key) {
      const found = catalog.achievements.find((a) => a.key === request.key);
      if (found) startEdit(found);
    }
  });

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "on", label: "Active" },
    { id: "off", label: "Inactive" },
    { id: "custom", label: "Made here" },
    { id: "changed", label: "Customized" },
    { id: "hidden", label: "Secret" },
    { id: "rewards", label: "Has rewards" }
  ];

  const sortOptions = [
    { id: "order", name: "Category order" },
    { id: "name", name: "Name" },
    { id: "popular", name: "Most unlocked" },
    { id: "rare", name: "Rarest" },
    { id: "points", name: "Most points" }
  ];

  let gradeOptions = $derived([
    { id: "any", name: "Any grade" },
    ...catalog.grades.map((g) => ({ id: g.value.toString(), name: g.name }))
  ]);

  let visibleCategories = $derived(catalog.categories.filter((c) => c.achievementCount > 0 || !c.isBuiltIn || c.key === "custom"));
  let currentCategory = $derived(catalog.categories.find((c) => c.key === category) ?? null);

  let shown = $derived.by(() => {
    const term = search.trim().toLowerCase();
    let items = catalog.achievements.filter((a) => {
      if (category !== "all" && a.categoryKey !== category) return false;
      if (term && !a.name.toLowerCase().includes(term) && !a.description.toLowerCase().includes(term) &&
        !a.key.toLowerCase().includes(term)) return false;
      if (gradeFilter !== "any" && a.grade.toString() !== gradeFilter) return false;
      switch (filter) {
        case "on": return a.enabled;
        case "off": return !a.enabled;
        case "custom": return a.isCustom;
        case "changed": return a.isOverridden;
        case "hidden": return a.hidden;
        case "rewards": return !!a.roleRewardId || a.currencyReward > 0 || a.xpReward > 0;
        default: return true;
      }
    });
    switch (sort) {
      case "name": items = [...items].sort((a, b) => a.name.localeCompare(b.name)); break;
      case "popular": items = [...items].sort((a, b) => b.unlockCount - a.unlockCount); break;
      case "rare": items = [...items].sort((a, b) => a.unlockCount - b.unlockCount); break;
      case "points": items = [...items].sort((a, b) => b.points - a.points); break;
    }
    return items;
  });

  let groups = $derived.by(() => {
    if (category !== "all" || sort !== "order") return [{ key: category, items: shown }];
    return catalog.categories
      .map((c) => ({ key: c.key, items: shown.filter((a) => a.categoryKey === c.key) }))
      .filter((g) => g.items.length > 0);
  });

  let selectableShown = $derived(shown.filter((a) => !a.isGlobal));
  let allShownSelected = $derived(selectableShown.length > 0 && selectableShown.every((a) => selected.has(a.key)));
  let customOrder = $derived(catalog.achievements.filter((a) => a.isCustom));

  /** Opens the editor on a new achievement. */
  function startNew() {
    editorCounter += 1;
    editor = { achievement: null, key: editorCounter };
  }

  /**
   * Opens the editor on an achievement.
   * @param achievement The achievement
   */
  function startEdit(achievement: Achievement) {
    editorCounter += 1;
    editor = { achievement, key: editorCounter };
  }

  /**
   * Handles a saved achievement from the editor.
   * @param achievement The saved achievement
   * @param created Whether it is new
   */
  function handleSaved(achievement: Achievement, created: boolean) {
    onsaved(achievement);
    editor = null;
    if (created) {
      onsuccess(`Made ${achievement.name}. Members who already qualify get it quietly within a few minutes.`);
    }
  }

  /**
   * Turns one achievement on or off.
   * @param achievement The achievement
   */
  async function toggle(achievement: Achievement) {
    if (!$currentGuild?.id || busy[achievement.key] || achievement.isGlobal) return;
    busy[achievement.key] = true;
    const next = !achievement.selfEnabled;
    try {
      await achievementsApi.setEnabled($currentGuild.id, [achievement.key], next);
      const categoryOn = catalog.categories.find((c) => c.key === achievement.categoryKey)?.enabled ?? true;
      onsaved({ ...achievement, selfEnabled: next, enabled: next && categoryOn, isOverridden: achievement.isCustom ? false : true });
    } catch (err: any) {
      logger.error("Failed to switch an achievement:", err);
      onerror(err?.message || "Couldn't save that.");
    } finally {
      busy[achievement.key] = false;
    }
  }

  /**
   * Turns every selected achievement on or off.
   * @param enabled The new state
   */
  async function bulkSet(enabled: boolean) {
    if (!$currentGuild?.id || selected.size === 0 || bulkBusy) return;
    bulkBusy = true;
    try {
      await achievementsApi.setEnabled($currentGuild.id, [...selected], enabled);
      selected = new Set();
      await onbulk();
    } catch (err: any) {
      logger.error("Failed to switch achievements:", err);
      onerror(err?.message || "Couldn't save that.");
    } finally {
      bulkBusy = false;
    }
  }

  /**
   * Selects or unselects an achievement.
   * @param key The achievement key
   */
  function toggleSelected(key: string) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    selected = next;
  }

  /** Selects every shown achievement, or clears the selection when all are selected. */
  function toggleSelectAll() {
    selected = allShownSelected ? new Set() : new Set(selectableShown.map((a) => a.key));
  }

  /**
   * Moves a server achievement up or down among the server's achievements.
   * @param achievement The achievement
   * @param direction -1 up, 1 down
   */
  async function move(achievement: Achievement, direction: -1 | 1) {
    if (!$currentGuild?.id || !achievement.customId) return;
    const siblings = customOrder.filter((a) => a.categoryKey === achievement.categoryKey);
    const index = siblings.findIndex((a) => a.key === achievement.key);
    const target = siblings[index + direction];
    if (!target) return;

    const order = customOrder.map((a) => a.customId!);
    const from = order.indexOf(achievement.customId);
    const to = order.indexOf(target.customId!);
    [order[from], order[to]] = [order[to], order[from]];
    try {
      await achievementsApi.reorderCustom($currentGuild.id, order);
      await onbulk();
    } catch (err: any) {
      logger.error("Failed to reorder achievements:", err);
      onerror(err?.message || "Couldn't reorder.");
    }
  }

  /**
   * The rewards on an achievement as short labels.
   * @param achievement The achievement
   */
  function rewards(achievement: Achievement): string[] {
    const list: string[] = [];
    if (achievement.roleRewardId) list.push(`@${achievement.roleRewardName ?? "deleted role"}`);
    if (achievement.currencyReward > 0) list.push(`${achievement.currencyReward.toLocaleString()} currency`);
    if (achievement.xpReward > 0) list.push(`${achievement.xpReward.toLocaleString()} XP`);
    return list;
  }

  /**
   * The category facts for a key.
   * @param key The category key
   */
  function categoryOf(key: string) {
    return catalog.categories.find((c) => c.key === key);
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start" in:fade={{ duration: 200 }}>
  <aside class="lg:sticky lg:top-4">
    <div class="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-1 px-1" role="tablist" aria-label="Categories">
      <button type="button" role="tab" aria-selected={category === "all"}
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left min-h-[44px] shrink-0 transition-all"
              style="background: {category === 'all' ? $colorStore.primary + '20' : $colorStore.primary + '08'};
                     border: 1px solid {category === 'all' ? $colorStore.primary + '50' : 'transparent'};"
              onclick={() => { category = "all"; }}>
        <DuoIcon icon="fa-layer-group" class="w-5 text-center" />
        <span class="flex-1 text-sm font-medium whitespace-nowrap" style="color: {category === 'all' ? $colorStore.primary : $colorStore.text}">Everything</span>
        <span class="text-xs" style="color: {$colorStore.muted}">{catalog.achievements.length}</span>
      </button>
      {#each visibleCategories as c (c.key)}
        {@const active = category === c.key}
        <button type="button" role="tab" aria-selected={active}
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left min-h-[44px] shrink-0 transition-all"
                class:opacity-60={!c.enabled}
                style="background: {active ? $colorStore.primary + '20' : $colorStore.primary + '08'};
                       border: 1px solid {active ? $colorStore.primary + '50' : 'transparent'};"
                onclick={() => { category = c.key; }}>
          <span class="w-5 flex justify-center">
            <AchievementIcon icon={c.icon} iconUrl={c.iconUrl} color={$colorStore.primary} size={16} bare />
          </span>
          <span class="flex-1 text-sm font-medium whitespace-nowrap" style="color: {active ? $colorStore.primary : $colorStore.text}">{c.name}</span>
          <span class="text-xs whitespace-nowrap" style="color: {$colorStore.muted}">
            {c.enabled ? `${c.enabledCount}/${c.achievementCount}` : "inactive"}
          </span>
        </button>
      {/each}
    </div>
    <button type="button" class="hidden lg:flex mt-3 w-full items-center justify-center gap-2 px-3 py-2.5 rounded-xl min-h-[44px] text-sm"
            style="background: {$colorStore.primary}08; color: {$colorStore.text}; border: 1px dashed {$colorStore.primary}40;"
            onclick={ongotocategories}>
      <DuoIcon icon="fa-layer-group" />
      Arrange categories
    </button>
  </aside>

  <section class="min-w-0 space-y-4">
    {#if currentCategory}
      <div class="rounded-2xl border p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <span class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style="background: {$colorStore.primary}20; border: 1px solid {$colorStore.primary}30;" aria-hidden="true">
          <AchievementIcon icon={currentCategory.icon} iconUrl={currentCategory.iconUrl} color={$colorStore.primary}
                           size={22} bare />
        </span>
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-bold" style="color: {$colorStore.text}">{currentCategory.name}</h2>
          <p class="text-sm" style="color: {$colorStore.muted}">
            {currentCategory.description || "Achievements this server made."}
            {#if !currentCategory.enabled}<strong style="color: {$colorStore.accent}"> This category is inactive.</strong>{/if}
          </p>
        </div>
        {#if currentCategory.key !== "global"}
          <button type="button" class="px-4 py-2 rounded-xl min-h-[44px] text-sm font-medium"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  onclick={startNew}>
            <i class="fa-solid fa-plus mr-2" aria-hidden="true"></i>New here
          </button>
        {/if}
      </div>
    {/if}

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_224px_224px] gap-3 items-end">
      <div class="sm:col-span-2 lg:col-span-1">
        <span id="ach-search-label" class="block text-xs font-medium mb-1.5" style="color: {$colorStore.muted}">Search</span>
        <div class="relative">
          <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none" aria-hidden="true">
            <DuoIcon icon="fa-magnifying-glass" color={$colorStore.muted} />
          </span>
          <input type="search" bind:value={search} placeholder="Name, description, or key"
                 aria-labelledby="ach-search-label"
                 class="w-full pl-10 pr-3 h-[44px] rounded-xl border text-sm"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
        </div>
      </div>
      <div>
        <span id="ach-grade-label" class="block text-xs font-medium mb-1.5" style="color: {$colorStore.muted}">Show grade</span>
        <DiscordSelector type="custom" options={gradeOptions} selected={gradeFilter} searchable={false}
                         ariaLabelledby="ach-grade-label" customIcon="fa-trophy"
                         onchange={(d) => { gradeFilter = typeof d.selected === "string" ? d.selected : "any"; }} />
      </div>
      <div>
        <span id="ach-sort-label" class="block text-xs font-medium mb-1.5" style="color: {$colorStore.muted}">Sort by</span>
        <DiscordSelector type="custom" options={sortOptions} selected={sort} searchable={false}
                         ariaLabelledby="ach-sort-label" customIcon="fa-arrow-down-wide-short"
                         onchange={(d) => { if (typeof d.selected === "string") sort = d.selected as Sort; }} />
      </div>
    </div>

    <div class="flex flex-wrap gap-2" role="group" aria-label="Filter">
      {#each filters as f (f.id)}
        {@const active = filter === f.id}
        <button type="button" aria-pressed={active}
                class="px-3 py-2 rounded-lg text-sm min-h-[40px] transition-all"
                style="background: {active ? $colorStore.primary + '20' : $colorStore.primary + '08'};
                       color: {active ? $colorStore.primary : $colorStore.text};
                       border: 1px solid {active ? $colorStore.primary + '40' : 'transparent'};"
                onclick={() => { filter = f.id; }}>
          {f.label}
        </button>
      {/each}
    </div>

    <div class="flex flex-wrap items-center gap-3 p-3 rounded-xl" style="background: {$colorStore.primary}08;">
      <label class="flex items-center gap-2 text-sm min-h-[40px] cursor-pointer" style="color: {$colorStore.text}">
        <input type="checkbox" checked={allShownSelected} onchange={toggleSelectAll} class="w-5 h-5 rounded"
               style="accent-color: {$colorStore.primary}" />
        {selected.size > 0 ? `${selected.size} selected` : `Select all ${selectableShown.length}`}
      </label>
      {#if selected.size > 0}
        <div class="flex flex-wrap gap-2 sm:ml-auto" transition:slide={{ duration: 150 }}>
          <button type="button" class="px-3 py-2 rounded-lg text-sm font-medium min-h-[40px] disabled:opacity-50"
                  style="background: #10b98120; color: #10b981; border: 1px solid #10b98130;"
                  disabled={bulkBusy} onclick={() => bulkSet(true)}>Activate</button>
          <button type="button" class="px-3 py-2 rounded-lg text-sm font-medium min-h-[40px] disabled:opacity-50"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                  disabled={bulkBusy} onclick={() => bulkSet(false)}>Deactivate</button>
          <button type="button" class="px-3 py-2 rounded-lg text-sm min-h-[40px]"
                  style="background: {$colorStore.primary}08; color: {$colorStore.text};"
                  onclick={() => { selected = new Set(); }}>Clear</button>
        </div>
      {/if}
    </div>

    {#if shown.length === 0}
      <div class="rounded-2xl border p-10 text-center"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <DuoIcon icon="fa-crown" size={40} />
        <h3 class="text-lg font-semibold mt-4" style="color: {$colorStore.text}">
          {category === "custom" && filter === "all" && !search ? "No server achievements yet" : "Nothing matches"}
        </h3>
        <p class="text-sm mt-2 max-w-md mx-auto" style="color: {$colorStore.muted}">
          {category === "custom" && filter === "all" && !search
            ? "Make your own: hit a number, say a phrase, react with an emoji, or something staff hand out by hand."
            : "Try another filter or search."}
        </p>
        {#if category === "custom" || category === "all"}
          <button type="button" class="mt-5 px-5 py-3 rounded-xl min-h-[44px] font-medium"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  onclick={startNew}>
            <i class="fa-solid fa-plus mr-2" aria-hidden="true"></i>Make an achievement
          </button>
        {/if}
      </div>
    {:else}
      {#each groups as group (group.key)}
        {@const groupCategory = categoryOf(group.key)}
        <div class="space-y-2">
          {#if category === "all" && groupCategory}
            <h3 class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide pt-2" style="color: {$colorStore.muted}">
              <AchievementIcon icon={groupCategory.icon} iconUrl={groupCategory.iconUrl} color={$colorStore.primary}
                               size={14} bare />{groupCategory.name}
              {#if !groupCategory.enabled}<span class="normal-case font-normal" style="color: {$colorStore.accent}">(inactive)</span>{/if}
            </h3>
          {/if}
          {#each group.items as a (a.key)}
            {@const grade = gradeOf(catalog.grades, a.grade)}
            {@const siblingIndex = a.isCustom ? customOrder.filter((c) => c.categoryKey === a.categoryKey).findIndex((c) => c.key === a.key) : -1}
            {@const siblingCount = a.isCustom ? customOrder.filter((c) => c.categoryKey === a.categoryKey).length : 0}
            {@const rewardList = rewards(a)}
            <div class="rounded-xl border p-3 md:p-4 flex items-start gap-3 transition-all"
                 class:opacity-60={!a.enabled}
                 style="background: {selected.has(a.key) ? $colorStore.primary + '15' : $colorStore.primary + '08'};
                        border-color: {selected.has(a.key) ? $colorStore.primary + '50' : $colorStore.primary + '20'};">
              {#if !a.isGlobal}
                <input type="checkbox" checked={selected.has(a.key)} onchange={() => toggleSelected(a.key)}
                       class="w-5 h-5 mt-3 rounded shrink-0" style="accent-color: {$colorStore.primary}"
                       aria-label="Select {a.name}" />
              {/if}
              <button type="button" class="flex-1 min-w-0 flex items-start gap-3 text-left" onclick={() => startEdit(a)}>
                <AchievementIcon icon={a.icon} iconUrl={a.iconUrl} color={grade.color} />
                <span class="flex-1 min-w-0">
                  <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span class="font-semibold truncate" style="color: {$colorStore.text}">{a.name}</span>
                    <span class="text-xs px-2 py-0.5 rounded-md font-medium" style="background: {grade.color}20; color: {grade.color}">{grade.name} · {a.points}</span>
                    {#if a.hidden}<span class="text-xs px-2 py-0.5 rounded-md" style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">Secret</span>{/if}
                    {#if a.isCustom}<span class="text-xs px-2 py-0.5 rounded-md" style="background: {$colorStore.accent}20; color: {$colorStore.accent}">Made here</span>{/if}
                    {#if a.isOverridden}<span class="text-xs px-2 py-0.5 rounded-md" style="background: {$colorStore.primary}20; color: {$colorStore.primary}">Customized</span>{/if}
                  </span>
                  <span class="block text-sm mt-1" style="color: {$colorStore.muted}">{a.description}</span>
                  <span class="flex flex-wrap gap-x-3 gap-y-1 text-xs mt-2" style="color: {$colorStore.muted}">
                    <span><DuoIcon icon="fa-circle-check" color={$colorStore.muted} class="mr-1" />{criteriaText(a, catalog)}</span>
                    <span><DuoIcon icon="fa-users" color={$colorStore.muted} class="mr-1" />{a.unlockCount.toLocaleString()} unlocked</span>
                    {#if rewardList.length > 0}
                      <span style="color: {$colorStore.primary}"><DuoIcon icon="fa-gift" class="mr-1" />{rewardList.join(", ")}</span>
                    {/if}
                  </span>
                </span>
              </button>
              <div class="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                {#if a.isCustom && sort === "order" && siblingCount > 1}
                  <div class="flex gap-1">
                    <button type="button" class="w-9 h-9 rounded-lg disabled:opacity-30" aria-label="Move {a.name} up"
                            style="background: {$colorStore.primary}08; color: {$colorStore.text};"
                            disabled={siblingIndex <= 0} onclick={() => move(a, -1)}>
                      <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>
                    </button>
                    <button type="button" class="w-9 h-9 rounded-lg disabled:opacity-30" aria-label="Move {a.name} down"
                            style="background: {$colorStore.primary}08; color: {$colorStore.text};"
                            disabled={siblingIndex >= siblingCount - 1} onclick={() => move(a, 1)}>
                      <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                    </button>
                  </div>
                {/if}
                {#if !a.isGlobal}
                  <button type="button" role="switch" aria-checked={a.selfEnabled}
                          aria-label="{a.selfEnabled ? 'Deactivate' : 'Activate'} {a.name}"
                          class="w-12 h-7 rounded-full relative transition-all shrink-0 disabled:opacity-50"
                          style="background: {a.selfEnabled ? $colorStore.primary : $colorStore.primary + '20'};"
                          disabled={busy[a.key]}
                          onclick={() => toggle(a)}>
                    <span class="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all"
                          style="left: {a.selfEnabled ? '22px' : '2px'};"></span>
                  </button>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/each}
    {/if}
  </section>
</div>

{#if editor}
  {#key editor.key}
    <AchievementEditor
      achievement={editor.achievement}
      {catalog}
      {lookups}
      defaultCategory={category === "all" ? undefined : category}
      onsaved={handleSaved}
      onremoved={(key) => { editor = null; onremoved(key); }}
      onclose={() => { editor = null; }}
      onuploadschanged={onbulk}
      {onerror}
    />
  {/key}
{/if}
