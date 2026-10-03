<script module lang="ts">
  import type { AchievementGlyph } from "$lib/api/index.ts";

  /** The glyph list, fetched once and shared by every field on the page. */
  let glyphCache: Promise<AchievementGlyph[]> | null = null;
</script>

<script lang="ts">
  import { slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { achievementsApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DuoIcon from "../DuoIcon.svelte";

  /**
   * Picks a Font Awesome glyph by name, with optional automatic and none choices.
   */
  interface Props {
    label: string;
    value: string;
    /** Label of the empty value, such as "Automatic", or null when a glyph is required */
    emptyLabel?: string | null;
    /** Whether "none" is offered */
    allowNone?: boolean;
    onchange: (value: string) => void;
    onerror: (text: string) => void;
  }

  let { label, value, emptyLabel = null, allowNone = false, onchange, onerror }: Props = $props();

  let open = $state(false);
  let search = $state("");
  let glyphs = $state<AchievementGlyph[]>([]);
  let filtered = $derived.by(() => {
    const term = search.trim().toLowerCase();
    const list = term
      ? glyphs.filter((g) => g.name.includes(term) || g.aliases.some((a) => a.includes(term)))
      : glyphs;
    return list.slice(0, 120);
  });

  /** Opens or closes the list, loading glyphs the first time. */
  async function toggle() {
    open = !open;
    if (!open || glyphs.length > 0 || !$currentGuild?.id) return;
    try {
      glyphCache ??= achievementsApi.glyphs($currentGuild.id);
      glyphs = await glyphCache;
    } catch (err: any) {
      glyphCache = null;
      logger.error("Failed to load icons:", err);
      onerror(err?.message || "Couldn't load the icons.");
    }
  }

  /**
   * Picks a glyph and closes the list.
   * @param next The glyph name, empty, or none
   */
  function pick(next: string) {
    onchange(next);
    open = false;
  }
</script>

<div class="space-y-1">
  <span class="text-xs block" style="color: {$colorStore.muted}">{label}</span>
  <button type="button" class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border min-h-[40px] text-left"
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
          aria-expanded={open} onclick={toggle}>
    {#if value && value !== "none"}
      <DuoIcon icon="fa-{value}" size={16} />
    {/if}
    <span class="text-sm flex-1 truncate">{value === "none" ? "None" : value || emptyLabel || "Pick an icon"}</span>
    <i class="fa-solid fa-chevron-down text-xs" style="color: {$colorStore.muted}" aria-hidden="true"></i>
  </button>

  {#if open}
    <div class="p-3 rounded-xl border space-y-2" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
         transition:slide={{ duration: 120 }}>
      <div class="flex flex-wrap gap-1.5">
        {#if emptyLabel}
          <button type="button" class="px-2 py-1 rounded-lg text-xs min-h-[32px]"
                  style="background: {value === '' ? $colorStore.primary + '30' : $colorStore.primary + '10'}; color: {$colorStore.text};"
                  onclick={() => pick("")}>{emptyLabel}</button>
        {/if}
        {#if allowNone}
          <button type="button" class="px-2 py-1 rounded-lg text-xs min-h-[32px]"
                  style="background: {value === 'none' ? $colorStore.primary + '30' : $colorStore.primary + '10'}; color: {$colorStore.text};"
                  onclick={() => pick("none")}>None</button>
        {/if}
      </div>
      <input type="search" bind:value={search} placeholder="Search icons" aria-label="Search icons"
             class="w-full px-3 py-2 rounded-lg border text-sm min-h-[40px]"
             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
      <div class="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto">
        {#each filtered as glyph (glyph.name)}
          <button type="button" title={glyph.name} aria-label={glyph.name}
                  class="aspect-square rounded-lg flex items-center justify-center"
                  style="background: {value === glyph.name ? $colorStore.primary + '30' : $colorStore.primary + '08'};"
                  onclick={() => pick(glyph.name)}>
            <DuoIcon icon="fa-{glyph.name}" size={18} />
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
