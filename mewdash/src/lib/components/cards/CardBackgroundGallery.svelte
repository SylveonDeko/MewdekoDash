<script module lang="ts">
  import type { CardPresetCatalog } from "$lib/api/cardpresets/models";

  let loadedCatalog: CardPresetCatalog | null = null;
</script>

<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import type { CardImage } from "$lib/api/cards/models";
  import { logger } from "$lib/logger";

  /**
   * A browsable grid of background presets and the server's own images, picked with one click.
   */
  interface Props {
    /** The background image in use: upload:id, preset:id, an https URL, or empty */
    value: string;
    /** Whether the card background is an image right now */
    active: boolean;
    images: CardImage[];
    upload: (data: string) => Promise<CardImage>;
    imageSrc?: (url: string) => string | null;
    presets: () => Promise<CardPresetCatalog>;
    onpick: (value: string) => void;
    onimages: (images: CardImage[]) => void;
    onerror: (text: string) => void;
    /** Hides uploads */
    presetsOnly?: boolean;
  }

  let { value, active, images, upload: store, imageSrc = (url) => url, presets: loadPresets, onpick, onimages, onerror, presetsOnly = false }: Props = $props();

  const OWN = "own";
  let catalog = $state<CardPresetCatalog | null>(loadedCatalog);
  let failed = $state(false);
  let uploading = $state(false);
  let fileInput = $state<HTMLInputElement | null>(null);
  let tab = $state("");

  let categories = $derived(
    (catalog?.categories ?? [])
      .filter((c) => catalog!.presets.some((p) => p.category === c.id))
      .sort((a, b) => a.order - b.order)
  );
  let tabs = $derived([
    ...categories.map((c) => ({ id: c.id, name: c.name, count: catalog!.presets.filter((p) => p.category === c.id).length })),
    ...(presetsOnly ? [] : [{ id: OWN, name: m.achievements.cardPresetYourImages(), count: images.length }])
  ]);
  let current = $derived(tab || categories[0]?.id || (presetsOnly ? "" : OWN));
  let shown = $derived(current === OWN ? [] : (catalog?.presets ?? []).filter((p) => p.category === current));

  onMount(async () => {
    if (catalog) return;
    try {
      catalog = loadedCatalog = await loadPresets();
    } catch (err) {
      logger.error("Failed to load card presets:", err);
      failed = true;
    }
  });

  /**
   * Uploads the chosen file and uses it as the background.
   * @param event The file input change
   */
  async function upload(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      onerror(m.achievements.iconErrorSize());
      return;
    }

    uploading = true;
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const uploaded = await store(data);
      onimages([...images, uploaded]);
      tab = OWN;
      onpick(uploaded.icon);
    } catch (err: any) {
      logger.error("Failed to upload a card image:", err);
      onerror(err?.message || m.achievements.iconErrorUpload());
    } finally {
      uploading = false;
    }
  }
</script>

{#snippet tile(src: string | null, name: string, reference: string, credit?: string | null)}
  {@const selected = active && value === reference}
  <button type="button" class="text-left min-w-0 flex flex-col gap-1.5" title={credit ?? name}
          aria-label={m.achievements.cardPresetUseAria({ name })} aria-pressed={selected} onclick={() => onpick(reference)}>
    <span class="block w-full rounded-lg overflow-hidden border-2" style="aspect-ratio: 1000 / 360;
          border-color: {selected ? $colorStore.selectedBorder : 'transparent'};
          background: {$colorStore.primary}10;">
      {#if src}
        <img src={src} alt="" loading="lazy" class="w-full h-full object-cover" />
      {/if}
    </span>
    <span class="block text-xs leading-snug line-clamp-2" style="color: {selected ? $colorStore.text : $colorStore.muted}">{name}</span>
  </button>
{/snippet}

<section class="pt-4 border-t space-y-3" style="border-color: {$colorStore.primary}20;">
  <h3 class="text-sm font-semibold" style="color: {$colorStore.text}">{m.achievements.cardPresetTitle()}</h3>

  {#if catalog || images.length > 0 || failed}
    <div class="flex flex-wrap gap-2" role="tablist" aria-label={m.achievements.cardPresetTitle()}>
      {#each tabs as t (t.id)}
        {@const selected = current === t.id}
        <button type="button" role="tab" aria-selected={selected} tabindex={selected ? 0 : -1}
                class="min-h-[36px] px-3 rounded-lg text-sm font-medium border flex items-center gap-2"
                style="background: {selected ? $colorStore.selectedSurface : $colorStore.primary + '08'};
                       border-color: {selected ? $colorStore.selectedBorder : $colorStore.primary + '20'};
                       color: {selected ? $colorStore.text : $colorStore.muted};"
                onclick={() => { tab = t.id; }}>
          {t.name}
          <span class="text-xs tabular-nums" style="color: {$colorStore.muted}">{t.count}</span>
        </button>
      {/each}
    </div>
  {/if}

  <div class="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-4 gap-3">
    {#if !presetsOnly}
    <button type="button" class="text-left min-w-0 flex flex-col gap-1.5 disabled:opacity-50" disabled={uploading}
            onclick={() => fileInput?.click()}>
      <span class="w-full rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium"
            style="aspect-ratio: 1000 / 360; border-color: {$colorStore.primary}40; color: {$colorStore.text}; background: {$colorStore.primary}08;">
        <i class="fa-solid {uploading ? 'fa-spinner fa-spin' : 'fa-upload'}" aria-hidden="true"></i>
        {m.achievements.cardPresetUpload()}
      </span>
      <span class="block text-xs" style="color: {$colorStore.muted}">{images.length} / 30</span>
    </button>
    {/if}

    {#if current === OWN}
      {#each images as image (image.id)}
        {@render tile(imageSrc(image.url), m.achievements.iconKindUploaded(), image.icon)}
      {/each}
    {:else}
      {#each shown as preset (preset.id)}
        {@render tile(preset.thumbUrl, preset.name, preset.reference, preset.credit)}
      {/each}
    {/if}
  </div>

  {#if failed && current !== OWN}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.achievements.cardPresetFailed()}</p>
  {/if}

  <input bind:this={fileInput} type="file" accept="image/png,image/jpeg,image/gif,image/webp" class="hidden" onchange={upload} />
</section>
