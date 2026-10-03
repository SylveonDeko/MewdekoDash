<script lang="ts">
  import { slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { achievementsApi, type AchievementIconUpload } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { iconImageSrc } from "../../achievementHelpers";

  /**
   * Picks an image for a card: one of the server's card images, a new upload, or an https link.
   */
  interface Props {
    label: string;
    /** An https URL, upload:id, or empty */
    value: string;
    /** The server's card images */
    images: AchievementIconUpload[];
    onchange: (value: string) => void;
    /** Called after an upload or delete with the new image list */
    onimages: (images: AchievementIconUpload[]) => void;
    onerror: (text: string) => void;
  }

  let { label, value, images, onchange, onimages, onerror }: Props = $props();

  let open = $state(false);
  let link = $state("");
  let uploading = $state(false);
  let fileInput = $state<HTMLInputElement | null>(null);
  let current = $derived(images.find((i) => i.icon === value));
  let preview = $derived(current ? iconImageSrc(current.url) : value.startsWith("https://") ? value : null);

  /** Uses the typed link. */
  function useLink() {
    const url = link.trim();
    if (!url.startsWith("https://")) {
      onerror("Image links have to start with https://.");
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
      const uploaded = await achievementsApi.uploadCardImage($currentGuild.id, data);
      onimages([...images, uploaded]);
      onchange(uploaded.icon);
      open = false;
    } catch (err: any) {
      logger.error("Failed to upload a card image:", err);
      onerror(err?.message || "Couldn't upload that image.");
    } finally {
      uploading = false;
    }
  }

  /**
   * Deletes a card image after asking.
   * @param image The image
   */
  async function remove(image: AchievementIconUpload) {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      title: "Delete this image?",
      message: "Every design using it loses the image.",
      confirmText: "Delete image",
      variant: "danger"
    });
    if (!ok) return;
    try {
      await achievementsApi.deleteIcon($currentGuild.id, image.id);
      onimages(images.filter((i) => i.id !== image.id));
      if (value === image.icon) onchange("");
    } catch (err: any) {
      logger.error("Failed to delete a card image:", err);
      onerror(err?.message || "Couldn't delete that image.");
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
    <span class="text-sm flex-1 truncate">{current ? "Uploaded image" : value ? "Linked image" : "No image"}</span>
    <i class="fa-solid fa-chevron-down text-xs" style="color: {$colorStore.muted}" aria-hidden="true"></i>
  </button>

  {#if open}
    <div class="p-3 rounded-xl border space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
         transition:slide={{ duration: 120 }}>
      <div class="grid grid-cols-3 gap-2">
        {#each images as image (image.id)}
          <div class="relative group">
            <button type="button" class="w-full aspect-video rounded-lg overflow-hidden border"
                    style="border-color: {value === image.icon ? $colorStore.primary : $colorStore.primary + '20'};"
                    aria-label="Use this image" onclick={() => { onchange(image.icon); open = false; }}>
              <img src={iconImageSrc(image.url)} alt="" class="w-full h-full object-cover" />
            </button>
            <button type="button" aria-label="Delete this image"
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
          Upload
        </button>
        {#if value}
          <button type="button" class="px-3 py-2 rounded-lg text-sm min-h-[40px]"
                  style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                  onclick={() => { onchange(""); open = false; }}>Remove</button>
        {/if}
      </div>
      <input bind:this={fileInput} type="file" accept="image/png,image/jpeg,image/gif,image/webp" class="hidden"
             onchange={upload} />
      <div class="flex gap-2">
        <input type="url" bind:value={link} placeholder="https://" aria-label="Image link"
               class="flex-1 min-w-0 px-3 py-2 rounded-lg border text-sm min-h-[40px]"
               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
               onkeydown={(e) => { if (e.key === "Enter") useLink(); }} />
        <button type="button" class="px-3 py-2 rounded-lg text-sm min-h-[40px]"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary};" onclick={useLink}>Use</button>
      </div>
    </div>
  {/if}
</div>
