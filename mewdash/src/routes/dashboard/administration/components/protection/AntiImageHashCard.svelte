<script lang="ts">
  import { m } from "$lib/i18n";
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { protectionApi } from "$lib/api/index.ts";
  import type { BannedImageHash } from "$lib/api/protection/models";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";

  let {
    protectionStatus,
    expandedProtectionCard = $bindable(),
    tempProtectionConfig = $bindable(),
    saving,
    toggleProtection,
    toggleProtectionCard,
    cancelProtectionEdit,
    saveProtectionConfig,
    fetchAllData
  } = $props();

  /**
   * The full PunishmentAction set that makes sense here. "Delete" removes the image without
   * touching the poster, which is why the per-image override exists at all.
   */
  const imageActionOptions = $derived([
    { id: "8", name: m.administration.protectionActionDeleteOnly(), label: m.administration.protectionActionDeleteOnly() },
    { id: "9", name: m.common.warn(), label: m.common.warn() },
    { id: "0", name: m.common.actionMute(), label: m.common.actionMute() },
    { id: "10", name: m.common.timeout(), label: m.common.timeout() },
    { id: "1", name: m.common.actionKick(), label: m.common.actionKick() },
    { id: "2", name: m.common.actionBan(), label: m.common.actionBan() }
  ]);

  /**
   * PunishmentAction values the bot accepts a duration for. Everything else is instantaneous and the
   * duration is discarded server side.
   */
  const TIMED_ACTIONS = ["0", "2", "10"];

  let presetCountLabel = $derived(
    protectionStatus.antiImageHash.presetCount === 1
      ? m.administration.protectionImagehashPresetCountOne({ count: protectionStatus.antiImageHash.presetCount })
      : m.administration.protectionImagehashPresetCountOther({ count: protectionStatus.antiImageHash.presetCount })
  );
  let presetCaughtLabel = $derived(
    protectionStatus.antiImageHash.presetTriggers === 1
      ? m.administration.protectionImagehashPresetCaughtOne({ count: protectionStatus.antiImageHash.presetTriggers })
      : m.administration.protectionImagehashPresetCaughtOther({ count: protectionStatus.antiImageHash.presetTriggers })
  );

  const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

  let durationApplies = $derived(
    TIMED_ACTIONS.includes((tempProtectionConfig.action ?? "").toString())
  );

  let hashes: BannedImageHash[] = $state([]);
  let loadingHashes = $state(false);

  let pendingBase64: string | null = $state(null);
  let pendingPreview: string | null = $state(null);
  let pendingUrl = $state("");
  let pendingHash: string | null = $state(null);
  let pendingQuality: number | null = $state(null);
  let pendingReliable = $state(true);
  let pendingName = $state("");
  let pendingAction: string = $state("");
  let hashing = $state(false);
  let blocking = $state(false);
  let togglingPreset = $state(false);
  let addError: string | null = $state(null);
  let fileInput: HTMLInputElement | null = $state(null);
  let dragging = $state(false);

  $effect(() => {
    if (protectionStatus.antiImageHash?.enabled && $currentGuild?.id) {
      loadHashes();
    }
  });

  async function loadHashes() {
    if (!$currentGuild?.id) return;
    try {
      loadingHashes = true;
      hashes = (await protectionApi.getBannedImageHashes($currentGuild.id)) || [];
    } catch (err) {
      logger.error("Failed to load blocked image hashes:", err);
    } finally {
      loadingHashes = false;
    }
  }

  function actionLabel(action: number | null): string {
    if (action === null || action === undefined) return m.common.default();
    return imageActionOptions.find(o => o.id === action.toString())?.label ?? m.administration.protectionImagehashActionFallback({ action });
  }

  function resetPending() {
    pendingBase64 = null;
    pendingPreview = null;
    pendingUrl = "";
    pendingHash = null;
    pendingQuality = null;
    pendingReliable = true;
    pendingName = "";
    pendingAction = "";
    addError = null;
    if (fileInput) fileInput.value = "";
  }

  async function handleFile(file: File) {
    addError = null;

    if (!file.type.startsWith("image/")) {
      addError = m.administration.protectionImagehashErrorNotImage();
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      addError = m.administration.protectionImagehashErrorTooLarge();
      return;
    }

    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    pendingBase64 = dataUrl;
    pendingPreview = dataUrl;
    pendingUrl = "";
    await computeHash();
  }

  async function computeHash() {
    if (!$currentGuild?.id) return;
    if (!pendingBase64 && !pendingUrl.trim()) return;

    try {
      hashing = true;
      addError = null;

      const result = await protectionApi.computeImageHash($currentGuild.id, pendingBase64
        ? { imageBase64: pendingBase64 }
        : { imageUrl: pendingUrl.trim() });

      pendingHash = result?.hash ?? null;
      pendingQuality = result?.quality ?? null;
      pendingReliable = result?.reliable ?? false;

      if (!pendingHash) {
        addError = m.administration.protectionImagehashErrorUnreadable();
      } else if (!pendingReliable) {
        addError = m.administration.protectionImagehashErrorTooPlain();
        pendingHash = null;
      } else if (!pendingBase64) {
        pendingPreview = pendingUrl.trim();
      }
    } catch (err) {
      logger.error("Failed to hash image:", err);
      addError = m.administration.protectionImagehashErrorUnsupported();
      pendingHash = null;
    } finally {
      hashing = false;
    }
  }

  async function blockImage() {
    if (!$currentGuild?.id || !pendingHash) return;

    try {
      blocking = true;
      addError = null;

      await protectionApi.addBannedImageHash($currentGuild.id, {
        hash: pendingHash,
        imageUrl: pendingBase64 ? undefined : pendingUrl.trim() || undefined,
        name: pendingName.trim() || null,
        action: pendingAction ? parseInt(pendingAction) : null
      });

      resetPending();
      await loadHashes();
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to block image:", err);
      addError = m.administration.protectionImagehashErrorAlreadyBlocked();
    } finally {
      blocking = false;
    }
  }

  async function togglePreset() {
    if (!$currentGuild?.id) return;
    try {
      togglingPreset = true;
      await protectionApi.setPresetScamImages($currentGuild.id, !protectionStatus.antiImageHash.usePresetList);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to toggle the known scam image list:", err);
    } finally {
      togglingPreset = false;
    }
  }

  async function removeHash(hashId: number) {
    if (!$currentGuild?.id) return;
    try {
      await protectionApi.removeBannedImageHash($currentGuild.id, hashId);
      await loadHashes();
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to remove blocked image:", err);
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    dragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }
</script>

<div class="rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 700 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div class="flex items-center gap-4">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-image"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.administration.overviewAntiImageHash()}</h2>
        <p class="text-sm" style="color: {$colorStore.muted}">{m.administration.protectionImagehashSubtitle()}</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
        onclick={() => toggleProtection('antiImageHash')}
        style="background: {protectionStatus.antiImageHash.enabled ? $colorStore.accent + '20' : $colorStore.secondary + '20'};
               color: {protectionStatus.antiImageHash.enabled ? $colorStore.accent : $colorStore.secondary};
               border: 1px solid {protectionStatus.antiImageHash.enabled ? $colorStore.accent + '30' : $colorStore.secondary + '30'};"
      >
        {#if protectionStatus.antiImageHash.enabled}
          <i class="fa-solid fa-toggle-on" style="font-size: 16px;"></i>
          {m.common.enabled()}
        {:else}
          <i class="fa-solid fa-toggle-off" style="font-size: 16px;"></i>
          {m.common.disabled()}
        {/if}
      </button>

      {#if protectionStatus.antiImageHash.enabled}
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
          onclick={() => toggleProtectionCard('antiImageHash')}
        >
          {#if expandedProtectionCard === 'antiImageHash'}
            <i class="fa-solid fa-chevron-up" style="font-size: 16px;"></i>
          {:else}
            <i class="fa-solid fa-chevron-down" style="font-size: 16px;"></i>
          {/if}
          {expandedProtectionCard === 'antiImageHash' ? m.common.collapse() : m.common.configure()}
        </button>
      {/if}
    </div>
  </div>

  {#if protectionStatus.antiImageHash.enabled}
    <div class="grid grid-cols-3 gap-4 p-4 rounded-xl" style="background: {$colorStore.primary}05;">
      <div class="text-center">
        <div class="text-2xl font-bold"
             style="color: {$colorStore.primary}">{protectionStatus.antiImageHash.hashCount}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">{m.administration.protectionImagehashBlockedImages()}</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold"
             style="color: {$colorStore.primary}">{protectionStatus.antiImageHash.counter}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">{m.administration.protectionImagehashTimesCaught()}</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold"
             style="color: {$colorStore.primary}">{protectionStatus.antiImageHash.hashThreshold}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">{m.administration.protectionImagehashMatchTolerance()}</div>
      </div>
    </div>

    <!-- Known scam images: the one-click win, so it sits above the guild's own list -->
    <div class="mt-6 p-4 rounded-xl border"
         style="background: {protectionStatus.antiImageHash.usePresetList ? $colorStore.accent + '10' : $colorStore.primary + '05'};
                border-color: {protectionStatus.antiImageHash.usePresetList ? $colorStore.accent : $colorStore.primary}30;">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-start gap-3 min-w-0">
          <i class="fa-utility-duo fa-regular fa-shield-check mt-1"
             style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <div class="min-w-0">
            <div class="font-medium" style="color: {$colorStore.text}">
              {m.administration.protectionImagehashBlockPreset()}
              {#if protectionStatus.antiImageHash.presetCount}
                <span class="text-sm font-normal" style="color: {$colorStore.muted}">
                  {presetCountLabel}
                </span>
              {/if}
            </div>
            <p class="text-sm" style="color: {$colorStore.muted}">
              {m.administration.protectionImagehashPresetDescription()}
            </p>
            {#if protectionStatus.antiImageHash.usePresetList && protectionStatus.antiImageHash.presetTriggers > 0}
              <p class="text-sm mt-1" style="color: {$colorStore.accent}">
                {presetCaughtLabel}
              </p>
            {/if}
          </div>
        </div>

        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px] flex-shrink-0"
          onclick={togglePreset}
          disabled={togglingPreset}
          style="background: {protectionStatus.antiImageHash.usePresetList ? $colorStore.accent + '20' : $colorStore.secondary + '20'};
                 color: {protectionStatus.antiImageHash.usePresetList ? $colorStore.accent : $colorStore.secondary};
                 border: 1px solid {protectionStatus.antiImageHash.usePresetList ? $colorStore.accent + '30' : $colorStore.secondary + '30'};"
        >
          {#if togglingPreset}
            <i class="fa-solid fa-spinner fa-spin"></i>
          {:else if protectionStatus.antiImageHash.usePresetList}
            <i class="fa-solid fa-toggle-on"></i>
          {:else}
            <i class="fa-solid fa-toggle-off"></i>
          {/if}
          <span>{protectionStatus.antiImageHash.usePresetList ? m.common.enabled() : m.common.enable()}</span>
        </button>
      </div>
    </div>

    <!-- Blocked images, always visible so the hit counters are easy to check -->
    <div class="mt-6 space-y-2">
      {#if loadingHashes && hashes.length === 0}
        <div class="text-sm text-center py-4" style="color: {$colorStore.muted}">
          <i class="fa-solid fa-spinner fa-spin"></i> {m.administration.protectionImagehashLoadingHashes()}
        </div>
      {:else if hashes.length === 0}
        <p class="text-sm text-center py-4" style="color: {$colorStore.muted}">
          {@html m.administration.protectionImagehashEmptyHtml()}
        </p>
      {:else}
        {#each hashes as entry (entry.id)}
          <div class="flex items-center gap-3 p-3 rounded-xl" style="background: {$colorStore.primary}08;">
            {#if entry.sourceUrl}
              <img src={entry.sourceUrl} alt={entry.name || m.administration.protectionImagehashBlockedImageAlt()}
                   class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                   style="border: 1px solid {$colorStore.primary}30;" />
            {:else}
              <div class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                   style="background: {$colorStore.primary}15;">
                <i class="fa-solid fa-image" style="color: {$colorStore.muted};"></i>
              </div>
            {/if}

            <div class="min-w-0 flex-1">
              <div class="font-medium truncate flex items-center gap-2" style="color: {$colorStore.text}">
                <span class="truncate">{entry.name || m.administration.protectionImagehashUnnamed()}</span>
                {#if !entry.variants}
                  <span class="text-xs px-2 py-0.5 rounded flex-shrink-0"
                        style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                        title={m.administration.protectionImagehashExactCopiesTitle()}>
                    {m.administration.protectionImagehashExactCopiesOnly()}
                  </span>
                {/if}
              </div>
              <div class="text-xs font-mono truncate" style="color: {$colorStore.muted}">{entry.hash}</div>
            </div>

            <div class="text-center flex-shrink-0 px-2">
              <div class="text-lg font-bold" style="color: {$colorStore.accent}">{entry.hitCount}</div>
              <div class="text-xs" style="color: {$colorStore.muted}">{m.common.hits()}</div>
            </div>

            <span class="text-xs px-2 py-1 rounded-lg flex-shrink-0 hidden sm:inline"
                  style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">
              {actionLabel(entry.action)}
            </span>

            <button
              class="px-3 py-2 rounded-lg transition-all hover:scale-110 min-h-[44px] flex-shrink-0"
              style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
              aria-label={m.administration.protectionImagehashRemoveBlockedImage()}
              onclick={() => removeHash(entry.id)}
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        {/each}
      {/if}
    </div>

    <!-- Add a blocked image -->
    <div class="mt-4 p-4 rounded-xl border-2 border-dashed space-y-4"
         style="background: {dragging ? $colorStore.primary + '15' : $colorStore.primary + '05'};
                border-color: {dragging ? $colorStore.accent : $colorStore.primary}40;"
         role="region"
         aria-label={m.administration.protectionImagehashBlockNewImage()}
         ondragover={(e) => { e.preventDefault(); dragging = true; }}
         ondragleave={() => dragging = false}
         ondrop={onDrop}>

      <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
        {#if pendingPreview}
          <img src={pendingPreview} alt={m.administration.protectionImagehashPendingPreviewAlt()}
               class="w-20 h-20 rounded-lg object-cover flex-shrink-0"
               style="border: 1px solid {$colorStore.primary}30;" />
        {/if}

        <div class="flex-1 space-y-2">
          <button
            class="w-full px-4 py-3 rounded-lg font-medium transition-all hover:scale-[1.01] flex items-center justify-center gap-2 min-h-[44px]"
            style="background: {$colorStore.primary}15; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            onclick={() => fileInput?.click()}
            disabled={hashing}
          >
            <i class="fa-solid fa-upload"></i>
            <span>{m.administration.protectionImagehashUploadOrDrop()}</span>
          </button>

          <input
            bind:this={fileInput}
            type="file"
            accept="image/*"
            class="hidden"
            onchange={(e) => {
              const file = (e.currentTarget as HTMLInputElement).files?.[0];
              if (file) handleFile(file);
            }}
          />

          <div class="flex gap-2">
            <input
              type="text"
              bind:value={pendingUrl}
              oninput={() => { pendingBase64 = null; pendingHash = null; }}
              placeholder={m.administration.protectionImagehashPasteUrlPlaceholder()}
              class="flex-1 px-4 py-2 rounded-lg border transition-colors min-h-[44px]"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
            />
            <button
              class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] min-h-[44px]"
              style="background: {$colorStore.primary}15; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={computeHash}
              disabled={hashing || (!pendingUrl.trim() && !pendingBase64)}
            >
              {#if hashing}
                <i class="fa-solid fa-spinner fa-spin"></i>
              {:else}
                <i class="fa-solid fa-fingerprint"></i>
              {/if}
              <span class="ml-2">{m.administration.protectionImagehashHash()}</span>
            </button>
          </div>
        </div>
      </div>

      {#if addError}
        <p class="text-sm" style="color: {$colorStore.accent}">{addError}</p>
      {/if}

      {#if pendingHash}
        <div transition:slide={{ duration: 200 }} class="space-y-3">
          <div class="flex items-center gap-2 text-sm">
            <span style="color: {$colorStore.muted}">{m.administration.protectionImagehashHashLabel()}</span>
            <code class="font-mono px-2 py-1 rounded"
                  style="background: {$colorStore.primary}15; color: {$colorStore.text}">{pendingHash}</code>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
            <div>
              <label for="aih-new-name" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                {m.common.label()}
              </label>
              <input
                id="aih-new-name"
                type="text"
                bind:value={pendingName}
                placeholder={m.administration.protectionImagehashLabelPlaceholder()}
                class="w-full px-3 rounded-xl border transition-colors"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};
                       min-height: 50px;"
              />
            </div>
            <div>
              <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                {m.administration.protectionImagehashActionForImage()}
                <span class="text-xs" style="color: {$colorStore.muted}">{m.administration.protectionImagehashActionLeaveEmpty()}</span>
              </span>
              <DiscordSelector
                type="custom"
                options={imageActionOptions}
                bind:selected={pendingAction}
                placeholder={m.administration.protectionImagehashUseDefaultAction()}
              />
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button
              class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] min-h-[44px]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={resetPending}
            >
              {m.common.cancel()}
            </button>
            <button
              class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
              style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
              onclick={blockImage}
              disabled={blocking}
            >
              {#if blocking}
                <i class="fa-solid fa-spinner fa-spin"></i>
              {:else}
                <i class="fa-solid fa-ban"></i>
              {/if}
              <span>{m.administration.protectionImagehashBlockImage()}</span>
            </button>
          </div>
        </div>
      {/if}
    </div>

    {#if expandedProtectionCard === 'antiImageHash'}
      <div class="mt-6 p-6 rounded-xl border-2 space-y-6 transition-all"
           style="background: {$colorStore.gradientStart}08; border-color: {$colorStore.accent}40;"
           in:slide={{ duration: 300 }}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.administration.protectionImagehashDefaultAction()}</span>
            <DiscordSelector
              type="custom"
              options={imageActionOptions}
              bind:selected={tempProtectionConfig.action}
              placeholder={m.administration.protectionCommonSelectAction()}
            />
          </div>

          <div>
            <label for="aih-punish-duration" class="block text-sm font-medium mb-2"
                   style="color: {$colorStore.text}">
              {m.administration.protectionCommonPunishmentDurationMinutes()}
              {#if !durationApplies}
                <span class="text-xs font-normal" style="color: {$colorStore.muted}">{m.administration.protectionImagehashDurationNotUsed()}</span>
              {/if}
            </label>
            <input id="aih-punish-duration"
                   type="number"
                   bind:value={tempProtectionConfig.punishDuration}
                   disabled={!durationApplies}
                   class="w-full px-3 rounded-xl border transition-colors"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};
                          min-height: 50px; opacity: {durationApplies ? 1 : 0.5};"
                   min="0"
                   max="1440"
            >
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="col-span-full">
            <label for="aih-threshold" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              {m.administration.protectionImagehashMatchToleranceValue({ value: tempProtectionConfig.hashThreshold })}
              <span class="block text-xs font-normal mt-1" style="color: {$colorStore.muted}">
                {m.administration.protectionImagehashMatchToleranceHint()}
              </span>
            </label>
            <input id="aih-threshold"
                   type="range"
                   bind:value={tempProtectionConfig.hashThreshold}
                   min="0"
                   max="64"
                   class="w-full"
                   style="accent-color: {$colorStore.primary};"
            >
          </div>

          <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer min-h-[44px]"
                 style="background: {$colorStore.primary}08;">
            <input type="checkbox" bind:checked={tempProtectionConfig.deleteMessages}
                   style="accent-color: {$colorStore.primary};">
            <span class="text-sm" style="color: {$colorStore.text}">{m.administration.protectionImagehashDeleteMessage()}</span>
          </label>

          <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer min-h-[44px]"
                 style="background: {$colorStore.primary}08;">
            <input type="checkbox" bind:checked={tempProtectionConfig.notifyUser}
                   style="accent-color: {$colorStore.primary};">
            <span class="text-sm" style="color: {$colorStore.text}">{m.administration.protectionImagehashDmUser()}</span>
          </label>

          <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer min-h-[44px]"
                 style="background: {$colorStore.primary}08;">
            <input type="checkbox" bind:checked={tempProtectionConfig.checkEmbeds}
                   style="accent-color: {$colorStore.primary};">
            <span class="text-sm" style="color: {$colorStore.text}">{m.administration.protectionImagehashCheckEmbeddedImages()}</span>
          </label>

          <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer min-h-[44px]"
                 style="background: {$colorStore.primary}08;">
            <input type="checkbox" bind:checked={tempProtectionConfig.ignoreBots}
                   style="accent-color: {$colorStore.primary};">
            <span class="text-sm" style="color: {$colorStore.text}">{m.common.ignoreBots()}</span>
          </label>

          <label class="col-span-full flex items-start gap-3 p-3 rounded-lg cursor-pointer"
                 style="background: {$colorStore.primary}08;">
            <input type="checkbox" bind:checked={tempProtectionConfig.checkBorders}
                   class="mt-1"
                   style="accent-color: {$colorStore.primary};">
            <span class="text-sm" style="color: {$colorStore.text}">
              {m.administration.protectionImagehashCatchBordered()}
              <span class="block text-xs" style="color: {$colorStore.muted}">
                {m.administration.protectionImagehashCatchBorderedHint()}
              </span>
            </span>
          </label>
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] min-h-[44px]"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            onclick={cancelProtectionEdit}
          >
            {m.common.cancel()}
          </button>
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
            onclick={saveProtectionConfig}
            disabled={saving}
          >
            {#if saving}
              <i class="fa-solid fa-spinner fa-spin" style="font-size: 14px;"></i>
            {:else}
              <i class="fa-solid fa-save" style="font-size: 14px;"></i>
            {/if}
            <span>{m.common.save()}</span>
          </button>
        </div>
      </div>
    {/if}
  {:else}
    <div class="text-center py-8">
      <i class="fa-utility-duo fa-regular fa-image"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
      <p class="text-lg font-medium" style="color: {$colorStore.text}">{m.administration.protectionImagehashDisabledTitle()}</p>
      <p class="text-sm" style="color: {$colorStore.muted}">
        {m.administration.protectionImagehashDisabledHint()}
      </p>
    </div>
  {/if}
</div>
