<script lang="ts">
  import { get } from "svelte/store";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { embedsApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import PlaceholderPicker from "$lib/components/forms/PlaceholderPicker.svelte";
  import PlaceholderButton from "$lib/components/forms/PlaceholderButton.svelte";

  interface Placeholder {
    category: string;
    name: string;
    description: string;
  }

  interface Props {
    id: string;
    value: string;
    placeholder: string;
    placeholders?: Placeholder[];
    onchange: (value: string) => void;
  }

  let { id, value, placeholder, placeholders = [], onchange }: Props = $props();

  const MAX_BYTES = 8 * 1024 * 1024;
  const TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

  let fileInput = $state<HTMLInputElement | null>(null);
  let uploading = $state(false);
  let message = $state("");
  let failed = $state(false);
  let pickerOpen = $state(false);
  let pickerSearch = $state("");
  let pickerElement = $state<HTMLInputElement | null>(null);

  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);

  function say(text: string, isError: boolean) {
    message = text;
    failed = isError;
  }

  function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error(m.embedbuilder.pictureReadFailed()));
      reader.readAsDataURL(file);
    });
  }

  async function upload(event: Event & { currentTarget: HTMLInputElement }) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    const guild = get(currentGuild);
    if (!guild) {
      say(m.embedbuilder.pictureNeedsServer(), true);
      return;
    }
    if (!TYPES.includes(file.type)) {
      say(m.embedbuilder.pictureWrongType(), true);
      return;
    }
    if (file.size > MAX_BYTES) {
      say(m.embedbuilder.pictureTooLarge(), true);
      return;
    }

    uploading = true;
    say("", false);
    try {
      const result = await embedsApi.uploadImage(BigInt(guild.id), await readAsDataUrl(file));
      onchange(result.url);
      say(m.embedbuilder.pictureUploaded(), false);
    } catch (error) {
      logger.error("Failed to upload picture:", error);
      say(error instanceof Error && error.message ? error.message : m.embedbuilder.pictureUploadFailed(), true);
    } finally {
      uploading = false;
    }
  }

  function togglePicker() {
    pickerElement = document.getElementById(id) as HTMLInputElement | null;
    pickerOpen = !pickerOpen;
    pickerSearch = "";
  }
</script>

<div class="space-y-2">
  <input
    {id}
    type="url"
    class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
    style={inputStyle}
    {placeholder}
    {value}
    oninput={(e) => onchange(e.currentTarget.value)}
  />

  <div class="flex flex-wrap items-center gap-2">
    <button
      type="button"
      class="min-h-[44px] px-3 rounded-lg text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      disabled={uploading}
      onclick={() => fileInput?.click()}
    >
      <i class="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i>
      {uploading ? m.embedbuilder.pictureUploading() : m.embedbuilder.pictureUpload()}
    </button>

    {#if placeholders.length > 0}
      <PlaceholderButton expanded={pickerOpen} onclick={togglePicker} />
    {/if}
  </div>

  <input
    bind:this={fileInput}
    type="file"
    class="hidden"
    accept="image/png,image/jpeg,image/gif,image/webp"
    tabindex="-1"
    aria-hidden="true"
    onchange={upload}
  />

  {#if message}
    <p class="text-sm" role="status" style="color: {failed ? '#ED4245' : $colorStore.muted};">{message}</p>
  {/if}

  <PlaceholderPicker
    visible={pickerOpen}
    {placeholders}
    searchTerm={pickerSearch}
    inline={true}
    inputElement={pickerElement}
    onselect={() => (pickerOpen = false)}
    onclose={() => (pickerOpen = false)}
    onsearch={(detail) => (pickerSearch = detail.term)}
  />
</div>
