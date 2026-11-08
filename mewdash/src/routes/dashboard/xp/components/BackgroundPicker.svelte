<script module lang="ts">
  import type { CardPresetCatalog } from "$lib/api/cardpresets/models";

  let loadedCatalog: CardPresetCatalog | null = null;
</script>

<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { cardPresetsApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import SettingField from "$lib/components/forms/SettingField.svelte";

  interface Props {
    /** The stored background: preset:id, an upload, an https URL, or empty. */
    value: string;
    busy?: boolean;
    onpick: (value: string) => void;
    onclear: () => void;
  }

  let { value, busy = false, onpick, onclear }: Props = $props();

  let catalog = $state<CardPresetCatalog | null>(loadedCatalog);
  let failed = $state(false);
  let tab = $state("");
  let url = $state("");

  const categories = $derived(
    (catalog?.categories ?? [])
      .filter((c) => catalog!.presets.some((p) => p.category === c.id))
      .sort((a, b) => a.order - b.order)
  );
  const current = $derived(tab || categories[0]?.id || "");
  const shown = $derived((catalog?.presets ?? []).filter((p) => p.category === current));

  onMount(async () => {
    if (catalog) return;
    try {
      catalog = loadedCatalog = await cardPresetsApi.get();
    } catch (err) {
      logger.error("Failed to load card presets:", err);
      failed = true;
    }
  });

  function apply() {
    const trimmed = url.trim();
    if (!trimmed) return;
    onpick(trimmed);
    url = "";
  }
</script>

<div class="space-y-3">
  {#if categories.length > 0}
    <div class="flex flex-wrap gap-2" role="tablist" aria-label={m.xp.backgrounds()}>
      {#each categories as category (category.id)}
        {@const selected = current === category.id}
        <button type="button" role="tab" aria-selected={selected} tabindex={selected ? 0 : -1}
                class="min-h-[44px] px-3 rounded-lg text-sm font-medium border"
                style="background: {selected ? $colorStore.selectedSurface : $colorStore.primary + '08'};
                       border-color: {selected ? $colorStore.selectedBorder : $colorStore.primary + '20'};
                       color: {selected ? $colorStore.text : $colorStore.muted};"
                onclick={() => (tab = category.id)}>
          {category.name}
        </button>
      {/each}
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-4 gap-3">
      {#each shown as preset (preset.id)}
        {@const selected = value === preset.reference}
        <button type="button" class="text-left min-w-0 flex flex-col gap-1.5 disabled:opacity-50" disabled={busy}
                title={preset.credit ?? preset.name} aria-pressed={selected}
                aria-label={m.xp.useBackgroundAria({ name: preset.name })} onclick={() => onpick(preset.reference)}>
          <span class="block w-full rounded-lg overflow-hidden border-2" style="aspect-ratio: 797 / 279;
                border-color: {selected ? $colorStore.selectedBorder : 'transparent'}; background: {$colorStore.primary}10;">
            <img src={preset.thumbUrl} alt="" loading="lazy" class="w-full h-full object-cover" />
          </span>
          <span class="block text-xs leading-snug line-clamp-2" style="color: {selected ? $colorStore.text : $colorStore.muted}">{preset.name}</span>
        </button>
      {/each}
    </div>
  {:else if failed}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.xp.backgroundsFailed()}</p>
  {/if}

  <SettingField label={m.xp.backgroundUrl()} id="xp-background-url">
    <div class="flex gap-3 items-stretch">
      <input id="xp-background-url" type="url" bind:value={url} placeholder="https://"
             onkeydown={(e) => { if (e.key === "Enter") apply(); }}
             class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
             style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              disabled={busy || !url.trim()} onclick={apply}>
        {m.xp.useBackground()}
      </button>
    </div>
  </SettingField>

  {#if value}
    <button type="button" class="px-4 rounded-xl min-h-[44px] text-sm font-medium disabled:opacity-50"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            disabled={busy} onclick={onclear}>
      {m.xp.removeBackground()}
    </button>
  {/if}
</div>
