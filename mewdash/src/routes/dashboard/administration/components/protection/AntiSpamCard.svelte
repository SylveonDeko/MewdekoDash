<script lang="ts">
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { administrationApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";

  let {
    protectionStatus,
    expandedProtectionCard = $bindable(),
    tempProtectionConfig = $bindable(),
    actionOptions,
    textChannels,
    saving,
    toggleProtection,
    toggleProtectionCard,
    cancelProtectionEdit,
    saveProtectionConfig,
    formatAction,
    fetchAllData
  } = $props();

  let selectedIgnoredChannel: string | null = $state(null);
  let ignoredChannels: bigint[] = $state([]);

  async function loadIgnoredChannels() {
    if (!$currentGuild?.id || !protectionStatus.antiSpam.enabled) return;

    try {
      // The ignoredChannels are in protectionStatus.antiSpam.ignoredChannels if available
      ignoredChannels = protectionStatus.antiSpam.ignoredChannels || [];
    } catch (err) {
      logger.error("Failed to load ignored channels:", err);
    }
  }

  async function toggleIgnoredChannel() {
    if (!$currentGuild?.id || !selectedIgnoredChannel) return;

    try {
      await administrationApi.toggleAntiSpamIgnoredChannel($currentGuild.id, BigInt(selectedIgnoredChannel));
      selectedIgnoredChannel = null;
      await fetchAllData();
      await loadIgnoredChannels();
    } catch (err) {
      logger.error("Failed to toggle ignored channel:", err);
    }
  }

  $effect(() => {
    if (protectionStatus.antiSpam.enabled) {
      loadIgnoredChannels();
    }
  });
</script>

<div class=" rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 200 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div class="flex items-center gap-4">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-comment"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Anti-Spam Protection</h2>
        <p class="text-sm" style="color: {$colorStore.muted}">Prevent message spam attacks</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
        onclick={() => toggleProtection('antiSpam')}
        style="background: {protectionStatus.antiSpam.enabled ? $colorStore.accent + '20' : $colorStore.secondary + '20'};
               color: {protectionStatus.antiSpam.enabled ? $colorStore.accent : $colorStore.secondary};
               border: 1px solid {protectionStatus.antiSpam.enabled ? $colorStore.accent + '30' : $colorStore.secondary + '30'};"
      >
        {#if protectionStatus.antiSpam.enabled}
          <i class="fa-solid fa-toggle-on" style="font-size: 16px;"></i>
          Enabled
        {:else}
          <i class="fa-solid fa-toggle-off" style="font-size: 16px;"></i>
          Disabled
        {/if}
      </button>

      {#if protectionStatus.antiSpam.enabled}
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
          onclick={() => toggleProtectionCard('antiSpam')}
        >
          {#if expandedProtectionCard === 'antiSpam'}
            <i class="fa-solid fa-chevron-up" style="font-size: 16px;"></i>
          {:else}
            <i class="fa-solid fa-chevron-down" style="font-size: 16px;"></i>
          {/if}
          {expandedProtectionCard === 'antiSpam' ? 'Collapse' : 'Configure'}
        </button>
      {/if}
    </div>
  </div>

  {#if protectionStatus.antiSpam.enabled}
    <div class="grid grid-cols-2 gap-4 p-4 rounded-xl" style="background: {$colorStore.primary}05;">
      <div class="text-center">
        <div class="text-2xl font-bold"
             style="color: {$colorStore.primary}">{protectionStatus.antiSpam.messageThreshold}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">Message Threshold</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-semibold"
             style="color: {$colorStore.primary}">{formatAction(protectionStatus.antiSpam.action)}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">Punishment</div>
      </div>
      {#if protectionStatus.antiSpam.muteTime > 0}
        <div class="text-center">
          <div class="text-2xl font-bold" style="color: {$colorStore.primary}">{protectionStatus.antiSpam.muteTime}m
          </div>
          <div class="text-sm" style="color: {$colorStore.muted}">Action Duration</div>
        </div>
      {/if}
    </div>

    <!-- Expanded Configuration -->
    {#if expandedProtectionCard === 'antiSpam'}
      <div transition:slide={{ duration: 300 }} class="mt-6 pt-6 border-t space-y-6"
           style="border-color: {$colorStore.primary}20;">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="antispam-message-threshold" class="block text-sm font-medium mb-2"
                   style="color: {$colorStore.text}">Message Threshold</label>
            <input id="antispam-message-threshold"
                   type="number"
                   bind:value={tempProtectionConfig.messageThreshold}
                   class="w-full px-3 py-2 rounded-lg border transition-colors"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="1"
                   max="20"
            >
          </div>
          <div>
            <span id="antispam-action-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Action</span>
            <DiscordSelector
              type="custom"
              options={actionOptions}
              bind:selected={tempProtectionConfig.action}
              placeholder="Select action..."
              multiple={false}
            />
          </div>
          <div>
            <label for="antispam-mute-time" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Mute
              Time (minutes)</label>
            <input id="antispam-mute-time"
                   type="number"
                   bind:value={tempProtectionConfig.muteTime}
                   class="w-full px-3 py-2 rounded-lg border transition-colors"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="1"
                   max="10080"
            >
          </div>
        </div>

        <!-- Ignored Channels -->
        <div class="space-y-3">
          <h5 class="font-medium" style="color: {$colorStore.text}">Ignored Channels</h5>
          <p class="text-xs" style="color: {$colorStore.muted}">Channels where anti-spam won't trigger</p>

          <div class="flex gap-2">
            <div class="flex-1">
              <DiscordSelector
                type="channel"
                options={textChannels.map((c: any) => ({ id: c.id, name: c.name, type: 0 }))}
                bind:selected={selectedIgnoredChannel}
                placeholder="Select channel to toggle..."
                multiple={false}
              />
            </div>
            <button
              class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={toggleIgnoredChannel}
              disabled={!selectedIgnoredChannel || saving}
            >
              Toggle
            </button>
          </div>

          {#if ignoredChannels.length > 0}
            <div class="space-y-1">
              {#each ignoredChannels as channelId}
                <div class="flex items-center justify-between px-3 py-2 rounded-lg"
                     style="background: {$colorStore.primary}08;">
                  <span class="text-sm" style="color: {$colorStore.text}">Channel ID: {channelId.toString()}</span>
                  <button
                    class="px-2 py-1 rounded transition-all hover:scale-110"
                    style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                    aria-label="Remove ignored channel"
                    onclick={() => $currentGuild && administrationApi.toggleAntiSpamIgnoredChannel($currentGuild.id, channelId).then(() => fetchAllData())}
                  >
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
            onclick={cancelProtectionEdit}
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
            onclick={saveProtectionConfig}
            disabled={saving}
          >
            <div class="flex items-center justify-center gap-2">
              {#if saving}
                <i class="fa-solid fa-rotate-right animate-spin" style="font-size: 16px;"></i>
              {:else}
                <i class="fa-solid fa-floppy-disk" style="font-size: 16px;"></i>
              {/if}
              <span>Save Configuration</span>
            </div>
          </button>
        </div>
      </div>
    {/if}
  {:else}
    <div class="text-center py-8">
      <i class="fa-utility-duo fa-regular fa-comment"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
      <p class="text-lg font-medium" style="color: {$colorStore.text}">Anti-Spam Protection Disabled</p>
      <p class="text-sm" style="color: {$colorStore.muted}">Enable to prevent message spam</p>
    </div>
  {/if}
</div>
