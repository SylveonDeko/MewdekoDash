<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { fade } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import {
    achievementsApi,
    type AchievementCard,
    type AchievementCardTemplate,
    type AchievementCatalog
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import AchievementIcon from "./AchievementIcon.svelte";
  import DuoIcon from "./DuoIcon.svelte";
  import CardDesigner from "./card/CardDesigner.svelte";
  import { cloneTemplate } from "./card/cardHelpers";

  /**
   * Card designs: saved designs with previews, which one is the server's default, the designer, and which
   * categories and achievements use a design of their own.
   */
  interface Props {
    catalog: AchievementCatalog;
    onerror: (text: string) => void;
  }

  let { catalog, onerror }: Props = $props();

  let card = $state<AchievementCard | null>(null);
  let loading = $state(true);
  let editing = $state<{ id: number | null; name: string; template: AchievementCardTemplate; makeDefault: boolean } | null>(null);
  /** Bumped each time the designer opens, so a design saved for the first time keeps its open designer. */
  let session = $state(0);
  let thumbnails = $state<Record<string, string>>({});
  let busy = $state(false);
  let ruleTarget = $state<string | null>(null);
  let ruleDesign = $state<string | null>(null);

  let designOptions = $derived((card?.designs ?? []).map((d) => ({ id: d.id.toString(), name: d.name })));
  /** Every category and achievement that picks its own design, categories first. */
  let rules = $derived.by(() => {
    if (!card) return [];
    const categories = catalog.categories
      .filter((c) => card!.assignments.categories[c.key] != null)
      .map((c) => ({ category: true, key: c.key, name: c.name, icon: c.icon, iconUrl: c.iconUrl, id: card!.assignments.categories[c.key] }));
    const achievements = catalog.achievements
      .filter((a) => card!.assignments.achievements[a.key] != null)
      .map((a) => ({ category: false, key: a.key, name: a.name, icon: a.icon, iconUrl: a.iconUrl, id: card!.assignments.achievements[a.key] }));
    return [...categories, ...achievements];
  });
  /** Categories and achievements that follow the default, as picker options. */
  let targetOptions = $derived([
    ...catalog.categories
      .filter((c) => card?.assignments.categories[c.key] == null)
      .map((c) => ({ id: `c:${c.key}`, name: `${c.name} (whole category)` })),
    ...catalog.achievements
      .filter((a) => card?.assignments.achievements[a.key] == null)
      .map((a) => ({ id: `a:${a.key}`, name: a.name }))
  ]);
  let defaultName = $derived(card?.designs.find((d) => d.id === card?.defaultId)?.name ?? "Built in");

  onMount(load);

  /** Loads the designs and draws their previews. */
  async function load() {
    if (!$currentGuild?.id) return;
    loading = true;
    try {
      apply(await achievementsApi.card($currentGuild.id));
    } catch (err: any) {
      logger.error("Failed to load card designs:", err);
      onerror(err?.message || "Couldn't load the card designs.");
    } finally {
      loading = false;
    }
  }

  /**
   * Takes a fresh card response and draws previews that are missing or out of date.
   * @param next The response
   */
  function apply(next: AchievementCard) {
    card = next;
    drawThumbnail("builtin", next.builtIn);
    for (const design of next.designs) drawThumbnail(`${design.id}:${design.dateUpdated}`, design.template);
  }

  /**
   * Draws a design's preview once per version.
   * @param key The design ID and version, or builtin
   * @param template The design
   */
  async function drawThumbnail(key: string, template: AchievementCardTemplate) {
    if (thumbnails[key] || !$currentGuild?.id) return;
    try {
      const preview = await achievementsApi.previewCard($currentGuild.id, template, false);
      thumbnails = { ...thumbnails, [key]: preview.image };
    } catch (err) {
      logger.warn("Failed to draw a design preview:", err);
    }
  }

  /**
   * Runs a change and takes the response.
   * @param action The API call
   * @param failure What to say when it fails
   */
  async function run(action: () => Promise<AchievementCard>, failure: string) {
    busy = true;
    try {
      apply(await action());
    } catch (err: any) {
      logger.error(failure, err);
      onerror(err?.message || failure);
    } finally {
      busy = false;
    }
  }

  /**
   * Opens the designer on a design that isn't saved yet. Nothing is created until it is saved.
   * @param name Its starting name
   * @param template Where it starts
   * @param makeDefault Whether saving also makes it the default, as when the built in default is edited
   */
  function startNew(name: string, template: AchievementCardTemplate, makeDefault = false) {
    if (!card) return;
    if (card.designs.length >= card.limits.maxDesigns) {
      onerror(`A server keeps at most ${card.limits.maxDesigns} designs. Delete one first.`);
      return;
    }
    session++;
    editing = { id: null, name, template: cloneTemplate(template), makeDefault };
  }

  /**
   * Opens the designer on a saved design.
   * @param id The design ID
   */
  function openSaved(id: number) {
    const design = card?.designs.find((d) => d.id === id);
    if (!design) return;
    session++;
    editing = { id, name: design.name, template: design.template, makeDefault: false };
  }

  /** A name like "Design 3" that isn't taken. */
  function nextName(): string {
    let n = (card?.designs.length ?? 0) + 1;
    while (card?.designs.some((d) => d.name === `Design ${n}`)) n++;
    return `Design ${n}`;
  }

  /**
   * Saves the designer's draft.
   * @param name The design's name
   * @param template The design
   */
  async function save(name: string, template: AchievementCardTemplate) {
    if (!$currentGuild?.id || !editing || !card) return;
    if (editing.id !== null) {
      apply(await achievementsApi.updateCardDesign($currentGuild.id, editing.id, { name, template }));
      return;
    }
    const before = new Set(card.designs.map((d) => d.id));
    const next = await achievementsApi.createCardDesign($currentGuild.id, name, template, editing.makeDefault);
    apply(next);
    const created = next.designs.find((d) => !before.has(d.id));
    if (created) editing = { ...editing, id: created.id, makeDefault: false };
  }

  /**
   * Deletes a design after asking.
   * @param id The design ID
   * @param name Its name
   */
  async function remove(id: number, name: string) {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      title: `Delete ${name}?`,
      message: "Categories and achievements using it go back to the server default. If it is the default, the built in design takes over.",
      confirmText: "Delete design",
      variant: "danger"
    });
    if (!ok) return;
    await run(() => achievementsApi.deleteCardDesign($currentGuild!.id, id), "Couldn't delete the design.");
  }

  /**
   * Makes a design the server default.
   * @param id The design ID, or null for the built in design
   */
  async function makeDefault(id: number | null) {
    if (!$currentGuild?.id) return;
    await run(() => achievementsApi.setDefaultCard($currentGuild!.id, id), "Couldn't change the default design.");
  }

  /**
   * Sets the design a category or achievement uses.
   * @param category True for a category key
   * @param key The key
   * @param id The design ID as text, or empty to follow the default
   */
  async function assign(category: boolean, key: string, id: string | null) {
    if (!$currentGuild?.id) return;
    const designId = id ? Number(id) : null;
    await run(() => achievementsApi.assignCard($currentGuild!.id, category, key, designId), "Couldn't change which design that uses.");
  }

  /**
   * How many categories and achievements pick a design.
   * @param id The design ID
   */
  function usage(id: number): string {
    if (!card) return "";
    const categories = Object.values(card.assignments.categories).filter((v) => v === id).length;
    const achievements = Object.values(card.assignments.achievements).filter((v) => v === id).length;
    const parts = [];
    if (categories) parts.push(`${categories} ${categories === 1 ? "category" : "categories"}`);
    if (achievements) parts.push(`${achievements} ${achievements === 1 ? "achievement" : "achievements"}`);
    return parts.join(", ");
  }
</script>

{#snippet tile(key: string, title: string, isDefault: boolean, subtitle: string, actions: Snippet)}
  <div class="rounded-2xl border overflow-hidden flex flex-col"
       style="background: {$colorStore.primary}05; border-color: {isDefault ? $colorStore.primary + '60' : $colorStore.primary + '20'};">
    <div class="aspect-[1280/500] w-full flex items-center justify-center" style="background: {$colorStore.primary}05;">
      {#if thumbnails[key]}
        <img src={thumbnails[key]} alt="Preview of {title}" class="w-full h-full object-contain" />
      {:else}
        <i class="fa-solid fa-spinner fa-spin" style="color: {$colorStore.muted}" aria-hidden="true"></i>
      {/if}
    </div>
    <div class="p-3 flex-1 flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <span class="font-semibold text-sm truncate flex-1" style="color: {$colorStore.text}">{title}</span>
        {#if isDefault}
          <span class="text-xs px-2 py-1 rounded-lg shrink-0" style="background: {$colorStore.primary}20; color: {$colorStore.primary}">Default</span>
        {/if}
      </div>
      {#if subtitle}
        <p class="text-xs" style="color: {$colorStore.muted}">{subtitle}</p>
      {/if}
      <div class="flex flex-wrap gap-2 mt-auto">
        {@render actions()}
      </div>
    </div>
  </div>
{/snippet}

{#snippet button(label: string, icon: string, onclick: () => void, danger = false)}
  <button type="button" class="px-2.5 py-1.5 rounded-lg text-xs font-medium min-h-[34px] disabled:opacity-50"
          style="background: {danger ? '#ef444420' : $colorStore.primary + '15'}; color: {danger ? '#ef4444' : $colorStore.text};"
          disabled={busy} {onclick}>
    <i class="fa-solid {icon} mr-1" aria-hidden="true"></i>{label}
  </button>
{/snippet}

{#if loading}
  <div class="flex items-center justify-center py-16" style="color: {$colorStore.muted}">
    <i class="fa-solid fa-spinner fa-spin text-2xl" aria-hidden="true"></i>
    <span class="sr-only">Loading</span>
  </div>
{:else if card && editing}
  {#key session}
    <CardDesigner name={editing.name} template={editing.template} isNew={editing.id === null} {card} {catalog} onsave={save}
                  onclose={() => { editing = null; }} onimages={(images) => { if (card) card = { ...card, images }; }} {onerror} />
  {/key}
{:else if card}
  <div class="space-y-6" in:fade={{ duration: 200 }}>
    <div class="rounded-2xl border p-5 md:p-6 shadow-2xl"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                border-color: {$colorStore.primary}30;">
      <div class="flex flex-col md:flex-row md:items-center gap-4">
        <div class="flex-1 min-w-0">
          <h3 class="flex items-center gap-2 font-semibold" style="color: {$colorStore.text}">
            <DuoIcon icon="fa-id-card" />
            Card designs
          </h3>
          <p class="text-sm mt-1" style="color: {$colorStore.muted}">
            The image attached to unlock messages and shown by achview. Every achievement uses the default,
            <strong style="color: {$colorStore.text}">{defaultName}</strong>, unless its category or itself picks another design.
          </p>
        </div>
        <button type="button" class="px-4 h-[44px] rounded-xl text-sm font-medium shrink-0 transition-all hover:scale-[1.02] disabled:opacity-50"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                disabled={busy} onclick={() => startNew(nextName(), card!.builtIn)}>
          <i class="fa-solid fa-plus mr-2" aria-hidden="true"></i>New design
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {#snippet builtInActions()}
        {#if card!.defaultId == null}
          {@render button("Edit", "fa-pen", () => startNew("Default", card!.builtIn, true))}
        {:else}
          {@render button("Make default", "fa-star", () => makeDefault(null))}
          {@render button("Start from it", "fa-copy", () => startNew(nextName(), card!.builtIn))}
        {/if}
      {/snippet}
      {@render tile("builtin", "Built in", card.defaultId == null, "Mewdeko's design in your server's colors.", builtInActions)}

      {#each card.designs as design (design.id)}
        {#snippet designActions()}
          {@render button("Edit", "fa-pen", () => openSaved(design.id))}
          {#if card!.defaultId !== design.id}
            {@render button("Make default", "fa-star", () => makeDefault(design.id))}
          {/if}
          {@render button("Duplicate", "fa-copy", () => startNew(`${design.name} copy`.slice(0, card!.limits.nameLength), design.template))}
          {@render button("Delete", "fa-trash", () => remove(design.id, design.name), true)}
        {/snippet}
        {@render tile(`${design.id}:${design.dateUpdated}`, design.name, card.defaultId === design.id, usage(design.id), designActions)}
      {/each}
    </div>

    {#if card.designs.length > 0}
      <div class="rounded-2xl border p-5 md:p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <h3 class="flex items-center gap-2 font-semibold mb-1" style="color: {$colorStore.text}">
          <DuoIcon icon="fa-layer-group" />
          Different designs for some unlocks
        </h3>
        <p class="text-sm mb-4" style="color: {$colorStore.muted}">
          Optional. Give a whole category or a single achievement its own design. An achievement's own design wins over its category's.
        </p>
        <div class="space-y-2">
          {#each rules as rule (`${rule.category}:${rule.key}`)}
            <div class="flex items-center gap-3 p-2 pl-3 rounded-xl" style="background: {$colorStore.primary}08;">
              <span class="w-6 flex justify-center shrink-0">
                <AchievementIcon icon={rule.icon} iconUrl={rule.iconUrl} color={$colorStore.primary} size={18} bare />
              </span>
              <div class="flex-1 min-w-0">
                <span class="block truncate text-sm font-medium" style="color: {$colorStore.text}">{rule.name}</span>
                <span class="block text-xs" style="color: {$colorStore.muted}">{rule.category ? "Every achievement in this category" : "Achievement"}</span>
              </div>
              <div class="w-40 sm:w-48 shrink-0">
                <DiscordSelector type="custom" options={designOptions} searchable={false} ariaLabel="Design for {rule.name}"
                                 selected={rule.id.toString()}
                                 onchange={(d) => { if (typeof d.selected === "string") assign(rule.category, rule.key, d.selected); }} />
              </div>
              <button type="button" class="w-[44px] h-[44px] rounded-xl shrink-0 disabled:opacity-50"
                      style="background: #ef444415; color: #ef4444;" disabled={busy}
                      aria-label="Use the default for {rule.name}" title="Use the default again"
                      onclick={() => assign(rule.category, rule.key, null)}>
                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </div>
          {:else}
            <p class="text-sm p-3 rounded-xl" style="background: {$colorStore.primary}08; color: {$colorStore.muted}">
              Every unlock uses <strong style="color: {$colorStore.text}">{defaultName}</strong>.
            </p>
          {/each}
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 pt-2">
            <div class="flex-1 min-w-0">
              <DiscordSelector type="custom" options={targetOptions} selected={ruleTarget} ariaLabel="Category or achievement"
                               placeholder="Pick a category or achievement" customIcon="fa-crown"
                               onchange={(d) => { ruleTarget = typeof d.selected === "string" ? d.selected : null; }} />
            </div>
            <div class="sm:w-48">
              <DiscordSelector type="custom" options={designOptions} selected={ruleDesign} searchable={false}
                               ariaLabel="Design" placeholder="Pick a design"
                               onchange={(d) => { ruleDesign = typeof d.selected === "string" ? d.selected : null; }} />
            </div>
            <button type="button" class="px-5 h-[44px] rounded-xl text-sm font-medium disabled:opacity-50"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                    disabled={busy || !ruleTarget || !ruleDesign}
                    onclick={async () => {
                      await assign(ruleTarget!.startsWith("c:"), ruleTarget!.slice(2), ruleDesign);
                      ruleTarget = null;
                      ruleDesign = null;
                    }}>
              Add
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}
