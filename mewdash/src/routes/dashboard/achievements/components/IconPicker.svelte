<script module lang="ts">
  import type { AchievementGlyph } from "$lib/api/index.ts";

  /** The glyph list, fetched once and shared by every picker on the page. */
  let glyphCache: Promise<AchievementGlyph[]> | null = null;
</script>

<script lang="ts">
  import { slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { achievementsApi, type AchievementEmojiLookup, type AchievementIconUpload } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { draftIconSrc, GLYPH_PREFIX, glyphClass, GRADE_ICON, iconImageSrc } from "../achievementHelpers";
  import DuoIcon from "./DuoIcon.svelte";

  /** Picker inputs. */
  interface Props {
    /** The stored icon value, or null for the default. */
    value: string | null;
    /** What the default looks like, shown while value is null. */
    defaultIcon?: string | null;
    /** The default's image, when it is one. */
    defaultIconUrl?: string | null;
    /** What the default is called, such as "the category's icon". */
    defaultLabel: string;
    /** The server's uploads. */
    uploads: AchievementIconUpload[];
    /** The server's emojis, when loaded. */
    emojis?: AchievementEmojiLookup[];
    /** Tint for the preview tile. */
    color: string;
    /** Label read by screen readers. */
    label: string;
    onchange: (value: string | null) => void;
    /** Called after an upload or delete so the page can refresh its catalog. */
    onuploadschanged?: () => void;
    onerror: (text: string) => void;
  }

  let {
    value,
    defaultIcon = null,
    defaultIconUrl = null,
    defaultLabel,
    uploads,
    emojis = [],
    color,
    label,
    onchange,
    onuploadschanged,
    onerror
  }: Props = $props();

  type Tab = "icons" | "emojis" | "image";

  let open = $state(false);
  let tab = $state<Tab>("icons");
  let search = $state("");
  let glyphs = $state<AchievementGlyph[]>([]);
  let loadingGlyphs = $state(false);
  let link = $state("");
  let uploading = $state(false);
  let localUploads = $state<AchievementIconUpload[]>([]);
  let fileInput = $state<HTMLInputElement | null>(null);

  let allUploads = $derived([
    ...uploads,
    ...localUploads.filter((u) => !uploads.some((s) => s.id === u.id))
  ]);
  let shownGlyph = $derived(value ? glyphClass(value) : glyphClass(defaultIcon));
  let shownImage = $derived(value ? draftIconSrc(value, allUploads) : iconImageSrc(defaultIconUrl));
  let emojiSearch = $state("");
  let emojiKind = $state<"all" | "static" | "animated">("all");
  let filteredEmojis = $derived.by(() => {
    const term = emojiSearch.trim().toLowerCase();
    return emojis.filter((e) => {
      const animated = e.formatted.startsWith("<a:");
      if (emojiKind === "static" && animated) return false;
      if (emojiKind === "animated" && !animated) return false;
      return !term || e.name.toLowerCase().includes(term);
    });
  });
  let filtered = $derived.by(() => {
    const term = search.trim().toLowerCase();
    const list = term
      ? glyphs.filter((g) => g.name.includes(term) || g.aliases.some((a) => a.includes(term)))
      : glyphs;
    return list.slice(0, 160);
  });

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "icons", label: "Icons", icon: "fa-star" },
    { id: "emojis", label: "Server emojis", icon: "fa-face-smile" },
    { id: "image", label: "Image", icon: "fa-image" }
  ];

  /** Opens or closes the panel, loading glyphs the first time. */
  async function toggle() {
    open = !open;
    if (!open || glyphs.length > 0 || !$currentGuild?.id) return;
    loadingGlyphs = true;
    try {
      glyphCache ??= achievementsApi.glyphs($currentGuild.id);
      glyphs = await glyphCache;
    } catch (err: any) {
      glyphCache = null;
      logger.error("Failed to load icons:", err);
      onerror(err?.message || "Couldn't load the icons.");
    } finally {
      loadingGlyphs = false;
    }
  }

  /**
   * Picks a value and closes the panel.
   * @param next The icon value, or null for the default
   */
  function pick(next: string | null) {
    onchange(next);
    open = false;
  }

  /** Uses the typed link. */
  function useLink() {
    const url = link.trim();
    if (!url.startsWith("https://")) {
      onerror("Image links have to start with https://.");
      return;
    }
    link = "";
    pick(url);
  }

  /**
   * Uploads the chosen file and picks it.
   * @param event The file input change
   */
  async function upload(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file || !$currentGuild?.id) return;
    if (file.size > 4 * 1024 * 1024) {
      onerror("Images have to be under 4 MB.");
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
      const uploaded = await achievementsApi.uploadIcon($currentGuild.id, data);
      localUploads = [...localUploads, uploaded];
      onuploadschanged?.();
      pick(uploaded.icon);
    } catch (err: any) {
      logger.error("Failed to upload an icon:", err);
      onerror(err?.message || "Couldn't upload that image.");
    } finally {
      uploading = false;
    }
  }

  /**
   * Deletes an upload after asking.
   * @param upload The upload
   */
  async function removeUpload(upload: AchievementIconUpload) {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      title: "Delete this image?",
      message: "Achievements and categories using it go back to their default icon.",
      confirmText: "Delete image",
      variant: "danger"
    });
    if (!ok) return;
    try {
      await achievementsApi.deleteIcon($currentGuild.id, upload.id);
      localUploads = localUploads.filter((u) => u.id !== upload.id);
      if (value === upload.icon) onchange(null);
      onuploadschanged?.();
    } catch (err: any) {
      logger.error("Failed to delete an icon:", err);
      onerror(err?.message || "Couldn't delete that image.");
    }
  }
</script>

<div class="space-y-2">
  <div class="flex items-center gap-3">
    <span class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
          style="background: {color}20; border: 1px solid {color}50;" aria-hidden="true">
      {#if shownImage}
        <img src={shownImage} alt="" class="w-8 h-8 object-contain" />
      {:else}
        <DuoIcon icon={shownGlyph ?? GRADE_ICON} {color} size={20} />
      {/if}
    </span>
    <div class="flex-1 min-w-0">
      <div class="text-sm truncate" style="color: {$colorStore.text}">
        {value ? (glyphClass(value)?.slice(3) ?? (value.startsWith("upload:") ? "Uploaded image" : value.startsWith("<") ? "Server emoji" : "Linked image")) : defaultLabel}
      </div>
      {#if value}
        <button type="button" class="text-xs underline" style="color: {$colorStore.muted}" onclick={() => pick(null)}>
          Use {defaultLabel}
        </button>
      {/if}
    </div>
    <button type="button" class="px-4 py-2 rounded-xl min-h-[44px] text-sm font-medium"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            aria-expanded={open} aria-label={label} onclick={toggle}>
      {open ? "Done" : "Change"}
    </button>
  </div>

  {#if open}
    <div class="rounded-xl border p-3 space-y-3" transition:slide={{ duration: 150 }}
         style="background: {$colorStore.primary}06; border-color: {$colorStore.primary}25;">
      <div class="flex gap-2 overflow-x-auto" role="group" aria-label="Icon source">
        {#each tabs as t (t.id)}
          {@const active = tab === t.id}
          <button type="button" aria-pressed={active}
                  class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm min-h-[40px] whitespace-nowrap"
                  style="background: {active ? $colorStore.primary + '20' : 'transparent'};
                         color: {active ? $colorStore.primary : $colorStore.text};
                         border: 1px solid {active ? $colorStore.primary + '40' : 'transparent'};"
                  onclick={() => { tab = t.id; }}>
            <i class="fa-solid {t.icon}" aria-hidden="true"></i>{t.label}
          </button>
        {/each}
      </div>

      {#if tab === "icons"}
        <input type="search" bind:value={search} placeholder="Search icons, like trophy or star"
               aria-label="Search icons"
               class="w-full px-3 h-[44px] rounded-xl border text-sm"
               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
        {#if loadingGlyphs}
          <p class="text-sm py-4 text-center" style="color: {$colorStore.muted}">Loading icons</p>
        {:else}
          <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-64 overflow-y-auto pr-1">
            {#each filtered as glyph (glyph.name)}
              {@const stored = GLYPH_PREFIX + glyph.name}
              {@const picked = value === stored}
              <button type="button" title={glyph.name} aria-label={glyph.name} aria-pressed={picked}
                      class="aspect-square rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style="background: {picked ? color + '30' : $colorStore.primary + '08'};
                             border: 1px solid {picked ? color : 'transparent'};"
                      onclick={() => pick(stored)}>
                <DuoIcon icon="fa-{glyph.name}" color={picked ? color : $colorStore.text} size={18} />
              </button>
            {/each}
          </div>
          {#if filtered.length === 0}
            <p class="text-sm" style="color: {$colorStore.muted}">No icons match.</p>
          {/if}
        {/if}
      {:else if tab === "emojis"}
        {#if emojis.length === 0}
          <p class="text-sm" style="color: {$colorStore.muted}">This server has no emojis of its own.</p>
        {:else}
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <input type="search" bind:value={emojiSearch} placeholder="Search emojis by name"
                   aria-label="Search emojis"
                   class="flex-1 min-w-0 px-3 h-[44px] rounded-xl border text-sm"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
            <div class="flex h-[44px] rounded-xl p-1 gap-1 shrink-0" style="background: {$colorStore.primary}10;"
                 role="group" aria-label="Emoji type">
              {#each [{ id: "all", label: "All" }, { id: "static", label: "Still" }, { id: "animated", label: "Animated" }] as option (option.id)}
                <button type="button" aria-pressed={emojiKind === option.id}
                        class="px-3 h-full rounded-lg text-xs font-medium"
                        style="background: {emojiKind === option.id ? $colorStore.primary + '30' : 'transparent'};
                               color: {emojiKind === option.id ? $colorStore.primary : $colorStore.text};"
                        onclick={() => { emojiKind = option.id as typeof emojiKind; }}>{option.label}</button>
              {/each}
            </div>
          </div>
          <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-64 overflow-y-auto pr-1">
            {#each filteredEmojis as emoji (emoji.id.toString())}
              {@const picked = value === emoji.formatted}
              <button type="button" title={emoji.name} aria-label={emoji.name} aria-pressed={picked}
                      class="aspect-square rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style="background: {picked ? color + '30' : $colorStore.primary + '08'};
                             border: 1px solid {picked ? color : 'transparent'};"
                      onclick={() => pick(emoji.formatted)}>
                <img src={emoji.url} alt="" class="w-7 h-7 object-contain" />
              </button>
            {/each}
          </div>
          {#if filteredEmojis.length === 0}
            <p class="text-sm" style="color: {$colorStore.muted}">No emojis match.</p>
          {/if}
        {/if}
      {:else}
        <div class="flex flex-col sm:flex-row gap-2">
          <input type="url" bind:value={link} placeholder="https://example.com/icon.png" aria-label="Image link"
                 class="flex-1 px-3 h-[44px] rounded-xl border text-sm"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
          <button type="button" class="px-4 h-[44px] rounded-xl text-sm font-medium disabled:opacity-50"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  disabled={!link.trim()} onclick={useLink}>Use link</button>
        </div>
        <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" class="hidden"
               bind:this={fileInput} onchange={upload} />
        <button type="button" class="w-full px-4 py-3 rounded-xl min-h-[44px] text-sm font-medium border-dashed border-2 disabled:opacity-50"
                style="border-color: {$colorStore.primary}40; color: {$colorStore.text};"
                disabled={uploading} onclick={() => fileInput?.click()}>
          <i class="fa-solid {uploading ? 'fa-spinner fa-spin' : 'fa-upload'} mr-2" aria-hidden="true"></i>
          {uploading ? "Uploading" : "Upload an image (PNG, JPEG, GIF, or WebP, under 4 MB)"}
        </button>
        {#if allUploads.length > 0}
          <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {#each allUploads as upload (upload.id)}
              {@const picked = value === upload.icon}
              <div class="relative group">
                <button type="button" aria-label="Use uploaded image {upload.id}" aria-pressed={picked}
                        class="w-full aspect-square rounded-lg flex items-center justify-center"
                        style="background: {picked ? color + '30' : $colorStore.primary + '08'};
                               border: 1px solid {picked ? color : 'transparent'};"
                        onclick={() => pick(upload.icon)}>
                  <img src={iconImageSrc(upload.url)} alt="" class="w-3/4 h-3/4 object-contain" />
                </button>
                <button type="button" aria-label="Delete uploaded image {upload.id}"
                        class="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full text-xs"
                        style="background: #ef4444; color: #fff;"
                        onclick={() => removeUpload(upload)}>
                  <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
              </div>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>
