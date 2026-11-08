<script lang="ts">
  import { m } from "$lib/i18n";
  import { protectionApi, type BannedImageHash } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "../NumberField.svelte";
  import { errorText, type Named, type Notify } from "../automodModel";
  import ActionFields from "./ActionFields.svelte";
  import ImageSheet from "./ImageSheet.svelte";
  import TriggerCount from "./TriggerCount.svelte";
  import { Action, type Patch, type Status } from "./protectionModel";

  interface Props {
    guildId: bigint;
    status: Status;
    onpatch: Patch;
    ontoggle: (enabled: boolean) => void;
    roles: Named[];
    notify: Notify;
    onreload: () => Promise<void>;
  }

  let { guildId, status, onpatch, ontoggle, roles, notify, onreload }: Props = $props();

  let hashes: BannedImageHash[] = $state([]);
  let adding = $state(false);
  let loaded = false;

  const toggles = $derived([
    { key: "deleteMessages", label: m.automod.deleteMessages() },
    { key: "notifyUser", label: m.automod.notifyMember() },
    { key: "checkEmbeds", label: m.automod.imageEmbeds() },
    { key: "ignoreBots", label: m.common.ignoreBots() },
    { key: "checkBorders", label: m.automod.imageBorders() }
  ]);

  const actionNames = $derived<Record<number, string>>({
    [Action.Delete]: m.automod.actionDelete(),
    [Action.Warn]: m.common.warn(),
    [Action.Timeout]: m.common.timeout(),
    [Action.Mute]: m.common.actionMute(),
    [Action.Kick]: m.common.actionKick(),
    [Action.Ban]: m.common.actionBan()
  });

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load() {
    try {
      hashes = (await protectionApi.getBannedImageHashes(guildId)) ?? [];
    } catch (err) {
      logger.error("Failed to load blocked images:", err);
      notify(errorText(err, m.automod.errorLoad()), "error");
    }
  }

  async function block(request: { hash: string; imageUrl?: string; name: string | null; action: number | null }) {
    try {
      await protectionApi.addBannedImageHash(guildId, request);
      adding = false;
      await Promise.all([load(), onreload()]);
    } catch (err) {
      logger.error("Failed to block image:", err);
      notify(errorText(err, m.automod.imageAlreadyBlocked()), "error");
    }
  }

  async function remove(entry: BannedImageHash) {
    const confirmed = await requestConfirmation({
      message: m.automod.deleteImageConfirm({ name: entry.name || m.automod.unnamed() }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      await protectionApi.removeBannedImageHash(guildId, entry.id);
      hashes = hashes.filter((x) => x.id !== entry.id);
      await onreload();
    } catch (err) {
      logger.error("Failed to remove blocked image:", err);
      notify(errorText(err, m.automod.errorSave()), "error");
    }
  }

  $effect(() => {
    if (status.enabled && !loaded) {
      loaded = true;
      void load();
    }
  });
</script>

<PluginCard title={m.automod.imageTitle()} enabled={status.enabled} onToggle={ontoggle}>
  <div class="grid gap-4 sm:grid-cols-2">
    <ActionFields id="image" {status} {onpatch} {roles} durationKey="punishDuration" deleteOnly />
    <NumberField
      id="image-size"
      label={m.automod.imageMaxSize()}
      min={1}
      max={32}
      value={status.maxImageSizeMb}
      onchange={(value) => onpatch({ maxImageSizeMb: value }, "typing")}
    />
  </div>

  <SettingField label={m.automod.imageTolerance({ value: status.hashThreshold })} hint={m.automod.imageToleranceHint()} id="image-tolerance">
    <input
      id="image-tolerance"
      type="range"
      min="0"
      max="64"
      value={status.hashThreshold}
      class="w-full min-h-[44px]"
      style="accent-color: {$colorStore.primary};"
      oninput={(e) => onpatch({ hashThreshold: Number(e.currentTarget.value) }, "typing")}
    >
  </SettingField>

  <div class="grid gap-2 sm:grid-cols-2">
    {#each toggles as toggle (toggle.key)}
      <ToggleRow
        checked={status[toggle.key]}
        title={toggle.label}
        colors={$colorStore}
        onchange={(value) => onpatch({ [toggle.key]: value }, "now")}
      />
    {/each}
  </div>

  <ToggleRow
    checked={status.usePresetList}
    title={m.automod.imagePreset()}
    subtitle={status.presetCount ? m.automod.imagePresetCount({ count: status.presetCount }) : undefined}
    colors={$colorStore}
    onchange={(value) => onpatch({ usePresetList: value }, "now")}
  />

  <div class="flex flex-wrap items-center justify-between gap-3">
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.automod.blockedImages()}</h4>
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
      style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
      onclick={() => (adding = true)}
    >
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {m.automod.blockImage()}
    </button>
  </div>

  <div class="space-y-2">
    {#each hashes as entry (entry.id)}
      <div
        class="flex items-center gap-3 rounded-xl border p-2 min-w-0"
        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
      >
        {#if entry.sourceUrl}
          <img src={entry.sourceUrl} alt="" class="w-12 h-12 rounded-lg object-cover shrink-0" />
        {:else}
          <div class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style="background: {$colorStore.primary}15;">
            <i class="fa-solid fa-image" style="color: {$colorStore.muted};" aria-hidden="true"></i>
          </div>
        {/if}
        <div class="grow min-w-0">
          <p class="text-sm font-medium truncate" style="color: {$colorStore.text}">{entry.name || m.automod.unnamed()}</p>
          <p class="text-xs" style="color: {$colorStore.muted}">
            {m.automod.hitCount({ count: entry.hitCount })}
            · {entry.action === null ? m.common.default() : (actionNames[entry.action] ?? entry.action)}
            {#if !entry.variants}· {m.automod.exactOnly()}{/if}
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg min-h-[44px] min-w-[44px] shrink-0"
          style={iconButton}
          aria-label={m.automod.removeAria({ name: entry.name || m.automod.unnamed() })}
          onclick={() => remove(entry)}
        >
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.automod.noImages()}</p>
    {/each}
  </div>
  <TriggerCount count={Number(status.counter ?? 0)} />
</PluginCard>

{#if adding}
  <ImageSheet {guildId} onblock={block} onclose={() => (adding = false)} />
{/if}
