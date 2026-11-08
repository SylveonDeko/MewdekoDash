<script lang="ts">
  import { m } from "$lib/i18n";
  import { protectionApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { Action } from "./protectionModel";

  interface Props {
    guildId: bigint;
    onblock: (request: { hash: string; imageUrl?: string; name: string | null; action: number | null }) => Promise<void>;
    onclose: () => void;
  }

  let { guildId, onblock, onclose }: Props = $props();

  const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

  let base64: string | null = $state(null);
  let preview: string | null = $state(null);
  let url = $state("");
  let hash: string | null = $state(null);
  let name = $state("");
  let action: string | null = $state(null);
  let hashing = $state(false);
  let blocking = $state(false);
  let problem: string | null = $state(null);
  let fileInput: HTMLInputElement | undefined = $state();

  const options = $derived([
    { id: String(Action.Delete), name: m.automod.actionDelete() },
    { id: String(Action.Warn), name: m.common.warn() },
    { id: String(Action.Timeout), name: m.common.timeout() },
    { id: String(Action.Mute), name: m.common.actionMute() },
    { id: String(Action.Kick), name: m.common.actionKick() },
    { id: String(Action.Ban), name: m.common.actionBan() }
  ]);

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  async function compute() {
    if (!base64 && !url.trim()) return;
    hashing = true;
    problem = null;
    hash = null;
    try {
      const result = await protectionApi.computeImageHash(
        guildId,
        base64 ? { imageBase64: base64 } : { imageUrl: url.trim() }
      );
      if (!result?.hash) problem = m.automod.imageUnreadable();
      else if (!result.reliable) problem = m.automod.imageTooPlain();
      else {
        hash = result.hash;
        if (!base64) preview = url.trim();
      }
    } catch (err) {
      logger.error("Failed to hash image:", err);
      problem = m.automod.imageUnsupported();
    } finally {
      hashing = false;
    }
  }

  async function pick(file: File) {
    problem = null;
    if (!file.type.startsWith("image/")) {
      problem = m.automod.imageNotImage();
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      problem = m.automod.imageTooLarge();
      return;
    }
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    base64 = dataUrl;
    preview = dataUrl;
    url = "";
    await compute();
  }

  async function submit() {
    if (!hash || blocking) return;
    blocking = true;
    try {
      await onblock({
        hash,
        imageUrl: base64 ? undefined : url.trim() || undefined,
        name: name.trim() || null,
        action: action ? Number(action) : null
      });
    } finally {
      blocking = false;
    }
  }
</script>

<Sheet title={m.automod.blockImage()} {onclose} size="lg">
  {#if preview}
    <img src={preview} alt="" class="w-24 h-24 rounded-lg object-cover" />
  {/if}

  <button
    type="button"
    class="w-full flex items-center justify-center gap-2 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
    style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
    disabled={hashing}
    onclick={() => fileInput?.click()}
  >
    <i class="fa-solid fa-upload" aria-hidden="true"></i>
    {m.automod.imageUpload()}
  </button>
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    class="hidden"
    onchange={(e) => {
      const file = e.currentTarget.files?.[0];
      if (file) void pick(file);
    }}
  >

  <SettingField label={m.automod.imageUrl()} id="image-url">
    <div class="flex gap-3 items-stretch">
      <input
        id="image-url"
        type="url"
        bind:value={url}
        oninput={() => {
          base64 = null;
          hash = null;
        }}
        class="grow min-w-0 p-3 rounded-lg border min-h-[50px]"
        style={field}
      >
      <button
        type="button"
        class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        disabled={hashing || (!url.trim() && !base64)}
        onclick={compute}
      >
        {#if hashing}
          <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
          <span class="sr-only">{m.common.loading()}</span>
        {:else}
          {m.automod.imageHash()}
        {/if}
      </button>
    </div>
  </SettingField>

  {#if problem}
    <p class="text-sm" role="alert" style="color: #ef4444;">{problem}</p>
  {/if}

  {#if hash}
    <SettingField label={m.common.label()} id="image-name">
      <input id="image-name" type="text" bind:value={name} class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
    </SettingField>
    <SettingField label={m.automod.imageAction()} id="image-action">
      <DiscordSelector
        id="image-action"
        type="custom"
        {options}
        bind:selected={action}
        placeholder={m.common.default()}
        searchable={false}
        customIcon="fa-bolt"
      />
    </SettingField>
  {/if}

  {#snippet footer()}
    <button
      type="button"
      class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={!hash || blocking}
      onclick={submit}
    >
      {m.automod.blockImage()}
    </button>
  {/snippet}
</Sheet>
