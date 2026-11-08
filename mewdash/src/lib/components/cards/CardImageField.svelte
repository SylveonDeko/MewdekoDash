<script module lang="ts">
  import type { CardPresetCatalog } from "$lib/api/cardpresets/models";

  let loadedCatalog: CardPresetCatalog | null = null;
</script>

<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import type { CardImage } from "$lib/api/cards/models";
  import { logger } from "$lib/logger";

  /**
   * Picks an image for a card: one of the server's card images, a shared preset, a new upload, or an https link.
   */
  interface Props {
    label: string;
    /** An https URL, upload:id, preset:id, or empty */
    value: string;
    /** The server's card images */
    images: CardImage[];
    /** Stores a new image sent as a data URI */
    upload: (data: string) => Promise<CardImage>;
    /** Deletes an image */
    remove: (image: CardImage) => Promise<void>;
    /** What to show for an image's URL */
    imageSrc?: (url: string) => string | null;
    /** Loads the shared background presets */
    presets: () => Promise<CardPresetCatalog>;
    onchange: (value: string) => void;
    /** Called after an upload or delete with the new image list */
    onimages: (images: CardImage[]) => void;
    onerror: (text: string) => void;
    /** Hides uploads and links */
    presetsOnly?: boolean;
  }

  let { label, value, images, upload: store, remove: erase, imageSrc = (url) => url, presets: loadPresets, onchange, onimages, onerror, presetsOnly = false }: Props = $props();

  let open = $state(false);
  let view = $state<"uploads" | "presets">(untrack(() => (presetsOnly ? "presets" : "uploads")));
  let link = $state("");
  let uploading = $state(false);
  let fileInput = $state<HTMLInputElement | null>(null);
  let catalog = $state<CardPresetCatalog | null>(loadedCatalog);
  let catalogState = $state<"idle" | "loading" | "failed">("idle");
  let category = $state("");
  let current = $derived(images.find((i) => i.icon === value));
  let currentPreset = $derived(value.startsWith("preset:") ? catalog?.presets.find((p) => p.reference === value) : undefined);
  let categories = $derived((catalog?.categories ?? []).filter((c) => catalog!.presets.some((p) => p.category === c.id)));
  let shown = $derived((catalog?.presets ?? []).filter((p) => !category || p.category === category));
  let preview = $derived(
    current ? imageSrc(current.url) : currentPreset ? currentPreset.thumbUrl : value.startsWith("https://") ? value : null
  );

  $effect(() => {
    const wanted = value.startsWith("preset:") || (open && view === "presets");
    if (wanted) untrack(() => void ensureCatalog());
  });

  /** Loads the preset catalog once, and again after a failure. */
  async function ensureCatalog() {
    if (catalog || catalogState === "loading") return;
    catalogState = "loading";
    try {
      catalog = loadedCatalog = await loadPresets();
      catalogState = "idle";
    } catch (err) {
      logger.error("Failed to load card presets:", err);
      catalogState = "failed";
    }
  }

  /** Uses the typed link. */
  function useLink() {
    const url = link.trim();
    if (!url.startsWith("https://")) {
      onerror(m.achievements.iconErrorHttps());
      return;
    }
    link = "";
    onchange(url);
    open = false;
  }

  /**
   * Uploads the chosen file and uses it.
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
      onchange(uploaded.icon);
      open = false;
    } catch (err: any) {
      logger.error("Failed to upload a card image:", err);
      onerror(err?.message || m.achievements.iconErrorUpload());
    } finally {
      uploading = false;
    }
  }

  /**
   * Deletes a card image after asking.
   * @param image The image
   */
  async function remove(image: CardImage) {
    const ok = await requestConfirmation({
      title: m.achievements.iconDeleteTitle(),
      message: m.achievements.cardImageDeleteMessage(),
      confirmText: m.achievements.iconDeleteConfirm(),
      variant: "danger"
    });
    if (!ok) return;
    try {
      await erase(image);
      onimages(images.filter((i) => i.id !== image.id));
      if (value === image.icon) onchange("");
    } catch (err: any) {
      logger.error("Failed to delete a card image:", err);
      onerror(err?.message || m.achievements.iconErrorDelete());
    }
  }
</script>

<div class="space-y-1">
  <span class="text-xs block" style="color: {$colorStore.muted}">{label}</span>
  <button type="button" class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border min-h-[40px] text-left"
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
          aria-expanded={open} onclick={() => { open = !open; }}>
    {#if preview}
      <img src={preview} alt="" class="w-8 h-6 rounded object-cover shrink-0" />
    {:else}
      <i class="fa-utility-duo fa-regular fa-image" aria-hidden="true"></i>
    {/if}
    <span class="text-sm flex-1 truncate">{current ? m.achievements.iconKindUploaded() : value.startsWith("preset:") ? (currentPreset?.name ?? m.achievements.cardImagePreset()) : value ? m.achievements.iconKindLinked() : m.achievements.cardImageNone()}</span>
    <i class="fa-solid fa-chevron-down text-xs" style="color: {$colorStore.muted}" aria-hidden="true"></i>
  </button>

  {#if open}
    <div class="p-3 rounded-xl border space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
         transition:slide={{ duration: 120 }}>
      <div class="flex gap-2" role="tablist" class:hidden={presetsOnly}>
        {#each [{ id: "uploads", name: m.achievements.cardPresetTabUploads() }, { id: "presets", name: m.achievements.cardPresetTabPresets() }] as tab (tab.id)}
          {@const selected = view === tab.id}
          <button type="button" role="tab" aria-selected={selected} tabindex={selected ? 0 : -1}
                  class="flex-1 min-h-[36px] px-3 rounded-lg text-sm font-medium border"
                  style="background: {selected ? $colorStore.selectedSurface : $colorStore.primary + '08'};
                         border-color: {selected ? $colorStore.selectedBorder : $colorStore.primary + '20'};
                         color: {selected ? $colorStore.text : $colorStore.muted};"
                  onclick={() => { view = tab.id as "uploads" | "presets"; }}>{tab.name}</button>
        {/each}
      </div>
      {#if view === "uploads" && !presetsOnly}
        <div class="grid grid-cols-3 gap-2">
          {#each images as image (image.id)}
            <div class="relative group">
              <button type="button" class="w-full aspect-video rounded-lg overflow-hidden border"
                      style="border-color: {value === image.icon ? $colorStore.primary : $colorStore.primary + '20'};"
                      aria-label={m.achievements.cardImageUseThisAria()} onclick={() => { onchange(image.icon); open = false; }}>
                <img src={imageSrc(image.url)} alt="" class="w-full h-full object-cover" />
              </button>
              <button type="button" aria-label={m.achievements.cardImageDeleteAria()}
                      class="absolute top-1 right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs"
                      style="background: #000000a0; color: #fff;" onclick={() => remove(image)}>
                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </div>
          {/each}
        </div>
        <div class="flex gap-2">
          <button type="button" class="flex-1 px-3 py-2 rounded-lg text-sm min-h-[40px] disabled:opacity-50"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                  disabled={uploading} onclick={() => fileInput?.click()}>
            <i class="fa-solid {uploading ? 'fa-spinner fa-spin' : 'fa-upload'} mr-1" aria-hidden="true"></i>
            {m.common.upload()}
          </button>
          {#if value}
            <button type="button" class="px-3 py-2 rounded-lg text-sm min-h-[40px]"
                    style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                    onclick={() => { onchange(""); open = false; }}>{m.common.remove()}</button>
          {/if}
        </div>
        <input bind:this={fileInput} type="file" accept="image/png,image/jpeg,image/gif,image/webp" class="hidden"
               onchange={upload} />
        <div class="flex gap-2">
          <input type="url" bind:value={link} placeholder="https://" aria-label={m.achievements.iconLinkLabel()}
                 class="flex-1 min-w-0 px-3 py-2 rounded-lg border text-sm min-h-[40px]"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                 onkeydown={(e) => { if (e.key === "Enter") useLink(); }} />
          <button type="button" class="px-3 py-2 rounded-lg text-sm min-h-[40px]"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary};" onclick={useLink}>{m.common.use()}</button>
        </div>
      {:else}
        {#if categories.length > 1}
          <div class="flex gap-2 overflow-x-auto scrollbar-hide" role="tablist" aria-label={m.achievements.cardPresetTabPresets()}>
            {#each [{ id: "", name: m.achievements.cardPresetAll() }, ...categories] as tab (tab.id)}
              {@const selected = category === tab.id}
              <button type="button" role="tab" aria-selected={selected} tabindex={selected ? 0 : -1}
                      class="shrink-0 min-h-[36px] px-3 rounded-lg text-sm font-medium whitespace-nowrap border"
                      style="background: {selected ? $colorStore.selectedSurface : $colorStore.primary + '08'};
                             border-color: {selected ? $colorStore.selectedBorder : $colorStore.primary + '20'};
                             color: {selected ? $colorStore.text : $colorStore.muted};"
                      onclick={() => { category = tab.id; }}>{tab.name}</button>
            {/each}
          </div>
        {/if}
        {#if catalogState === "loading" && !catalog}
          <div class="py-6 text-center" style="color: {$colorStore.muted}" role="status" aria-label={m.achievements.cardPresetLoadingAria()}>
            <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
          </div>
        {:else if catalogState === "failed" && !catalog}
          <p class="py-6 text-center text-sm" style="color: {$colorStore.muted}">{m.achievements.cardPresetFailed()}</p>
        {:else if shown.length === 0}
          <p class="py-6 text-center text-sm" style="color: {$colorStore.muted}">{m.achievements.cardPresetEmpty()}</p>
        {:else}
          <div class="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto">
            {#each shown as preset (preset.id)}
              {@const selected = value === preset.reference}
              <button type="button" class="text-left space-y-1" title={preset.credit ?? preset.name}
                      aria-label={m.achievements.cardPresetUseAria({ name: preset.name })}
                      onclick={() => { onchange(preset.reference); open = false; }}>
                <span class="block w-full aspect-video rounded-lg overflow-hidden border"
                      style="background: {selected ? $colorStore.selectedSurface : 'transparent'};
                             border-color: {selected ? $colorStore.selectedBorder : $colorStore.primary + '20'};">
                  <img src={preset.thumbUrl} alt="" loading="lazy" class="w-full h-full object-cover" />
                </span>
                <span class="block text-xs truncate" style="color: {selected ? $colorStore.text : $colorStore.muted}">{preset.name}</span>
              </button>
            {/each}
          </div>
        {/if}
        {#if value}
          <button type="button" class="w-full px-3 py-2 rounded-lg text-sm min-h-[40px]"
                  style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                  onclick={() => { onchange(""); open = false; }}>{m.common.remove()}</button>
        {/if}
      {/if}
    </div>
  {/if}
</div>
