<script lang="ts">
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  let {
    protectionStatus,
    expandedProtectionCard = $bindable(),
    tempProtectionConfig = $bindable(),
    actionOptions,
    saving,
    toggleProtection,
    toggleProtectionCard,
    cancelProtectionEdit,
    saveProtectionConfig,
    formatAction
  } = $props();
</script>

<div class=" rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 400 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div class="flex items-center gap-4">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-at"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Anti-Mass Mention</h2>
        <p class="text-sm" style="color: {$colorStore.muted}">Prevent mention spam</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
        onclick={() => toggleProtection('antiMassMention')}
        style="background: {protectionStatus.antiMassMention.enabled ? $colorStore.accent + '20' : $colorStore.secondary + '20'};
               color: {protectionStatus.antiMassMention.enabled ? $colorStore.accent : $colorStore.secondary};
               border: 1px solid {protectionStatus.antiMassMention.enabled ? $colorStore.accent + '30' : $colorStore.secondary + '30'};"
      >
        {#if protectionStatus.antiMassMention.enabled}
          <i class="fa-solid fa-toggle-on" style="font-size: 16px;"></i>
          Enabled
        {:else}
          <i class="fa-solid fa-toggle-off" style="font-size: 16px;"></i>
          Disabled
        {/if}
      </button>

      {#if protectionStatus.antiMassMention.enabled}
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
          onclick={() => toggleProtectionCard('antiMassMention')}
        >
          {#if expandedProtectionCard === 'antiMassMention'}
            <i class="fa-solid fa-chevron-up" style="font-size: 16px;"></i>
          {:else}
            <i class="fa-solid fa-chevron-down" style="font-size: 16px;"></i>
          {/if}
          {expandedProtectionCard === 'antiMassMention' ? 'Collapse' : 'Configure'}
        </button>
      {/if}
    </div>
  </div>

  {#if protectionStatus.antiMassMention.enabled}
    <div class="grid grid-cols-2 gap-4 p-4 rounded-xl" style="background: {$colorStore.primary}05;">
      <div class="text-center">
        <div class="text-2xl font-bold"
             style="color: {$colorStore.primary}">{protectionStatus.antiMassMention.mentionThreshold}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">Mention Threshold</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold"
             style="color: {$colorStore.primary}">{protectionStatus.antiMassMention.timeWindowSeconds}s
        </div>
        <div class="text-sm" style="color: {$colorStore.muted}">Time Window</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-semibold"
             style="color: {$colorStore.primary}">{formatAction(protectionStatus.antiMassMention.action)}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">Punishment</div>
      </div>
      {#if protectionStatus.antiMassMention.muteTime > 0}
        <div class="text-center">
          <div class="text-2xl font-bold"
               style="color: {$colorStore.primary}">{protectionStatus.antiMassMention.muteTime}m
          </div>
          <div class="text-sm" style="color: {$colorStore.muted}">Action Duration</div>
        </div>
      {/if}
    </div>

    <!-- Expanded Configuration -->
    {#if expandedProtectionCard === 'antiMassMention'}
      <div transition:slide={{ duration: 300 }} class="mt-6 pt-6 border-t space-y-6"
           style="border-color: {$colorStore.primary}20;">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label for="antimm-mention-threshold" class="block text-sm font-medium mb-2"
                   style="color: {$colorStore.text}">Mention
              Threshold</label>
            <input id="antimm-mention-threshold"
                   type="number"
                   bind:value={tempProtectionConfig.mentionThreshold}
                   class="w-full px-3 py-2 rounded-lg border transition-colors"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="1"
                   max="50"
            >
          </div>
          <div>
            <label for="antimm-time-window" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Time
              Window (seconds)</label>
            <input id="antimm-time-window"
                   type="number"
                   bind:value={tempProtectionConfig.timeWindowSeconds}
                   class="w-full px-3 py-2 rounded-lg border transition-colors"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="1"
                   max="300"
            >
          </div>
          <div>
            <label for="antimm-max-mentions" class="block text-sm font-medium mb-2"
                   style="color: {$colorStore.text}">Max Mentions in Window</label>
            <input id="antimm-max-mentions"
                   type="number"
                   bind:value={tempProtectionConfig.maxMentionsInTimeWindow}
                   class="w-full px-3 py-2 rounded-lg border transition-colors"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="1"
                   max="100"
            >
          </div>
          <div>
            <span id="antimm-action-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Action</span>
            <DiscordSelector
              type="custom"
              options={actionOptions}
              bind:selected={tempProtectionConfig.action}
              placeholder="Select action..."
              multiple={false}
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="antimm-mute-time" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Mute
              Time (minutes)</label>
            <input id="antimm-mute-time"
                   type="number"
                   bind:value={tempProtectionConfig.muteTime}
                   class="w-full px-3 py-2 rounded-lg border transition-colors"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="1"
                   max="10080"
            >
          </div>

          <div class="flex items-center">
            <label for="antimm-ignore-bots"
                   class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                   style="background: {$colorStore.primary}08;">
              <input id="antimm-ignore-bots" type="checkbox"
                     bind:checked={tempProtectionConfig.ignoreBots}
                     class="sr-only peer" />
              <div class="w-5 h-5 rounded-sm border-2 transition-all duration-200 flex items-center justify-center"
                   style="border-color: {tempProtectionConfig.ignoreBots ? $colorStore.primary : $colorStore.muted};
                          background: {tempProtectionConfig.ignoreBots ? $colorStore.primary : 'transparent'};">
                {#if tempProtectionConfig.ignoreBots}
                  <i class="fa-solid fa-check text-white" style="font-size: 12px;"></i>
                {/if}
              </div>
              <span style="color: {$colorStore.text}">Ignore Bot Mentions</span>
            </label>
          </div>
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
      <i class="fa-utility-duo fa-regular fa-at"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
      <p class="text-lg font-medium" style="color: {$colorStore.text}">Anti-Mass Mention Disabled</p>
      <p class="text-sm" style="color: {$colorStore.muted}">Enable to prevent mention spam</p>
    </div>
  {/if}
</div>
