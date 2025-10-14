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
    saveProtectionConfig
  } = $props();
</script>

<div class=" rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 500 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div class="flex items-center gap-4">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-comments"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Anti-Mass-Post</h2>
        <p class="text-sm" style="color: {$colorStore.muted}">Detect scam/spam across channels</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
        onclick={() => toggleProtection('antiMassPost')}
        style="background: {protectionStatus.antiMassPost.enabled ? $colorStore.accent + '20' : $colorStore.secondary + '20'};
               color: {protectionStatus.antiMassPost.enabled ? $colorStore.accent : $colorStore.secondary};
               border: 1px solid {protectionStatus.antiMassPost.enabled ? $colorStore.accent + '30' : $colorStore.secondary + '30'};"
      >
        {#if protectionStatus.antiMassPost.enabled}
          <i class="fa-solid fa-toggle-on" style="font-size: 16px;"></i>
          Enabled
        {:else}
          <i class="fa-solid fa-toggle-off" style="font-size: 16px;"></i>
          Disabled
        {/if}
      </button>

      {#if protectionStatus.antiMassPost.enabled}
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
          onclick={() => toggleProtectionCard('antiMassPost')}
        >
          {#if expandedProtectionCard === 'antiMassPost'}
            <i class="fa-solid fa-chevron-up" style="font-size: 16px;"></i>
          {:else}
            <i class="fa-solid fa-chevron-down" style="font-size: 16px;"></i>
          {/if}
          {expandedProtectionCard === 'antiMassPost' ? 'Collapse' : 'Configure'}
        </button>
      {/if}
    </div>
  </div>

  {#if protectionStatus.antiMassPost.enabled}
    <div class="grid grid-cols-2 gap-4 p-4 rounded-xl" style="background: {$colorStore.primary}05;">
      <div class="text-center">
        <div class="text-2xl font-bold"
             style="color: {$colorStore.primary}">{protectionStatus.antiMassPost.channelThreshold}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">Channel Threshold</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold"
             style="color: {$colorStore.primary}">{protectionStatus.antiMassPost.timeWindowSeconds}s
        </div>
        <div class="text-sm" style="color: {$colorStore.muted}">Time Window</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold"
             style="color: {$colorStore.primary}">{protectionStatus.antiMassPost.userCount}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">Users Tracked</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold"
             style="color: {$colorStore.primary}">{protectionStatus.antiMassPost.counter}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">Triggers</div>
      </div>
    </div>

    {#if expandedProtectionCard === 'antiMassPost'}
      <div class="mt-6 p-6 rounded-xl border-2 space-y-6 transition-all"
           style="background: {$colorStore.gradientStart}08; border-color: {$colorStore.accent}40;"
           in:slide={{ duration: 300 }}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="amp-channel-threshold" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Channel
              Threshold</label>
            <input id="amp-channel-threshold"
                   type="number"
                   bind:value={tempProtectionConfig.channelThreshold}
                   class="w-full px-3 py-2 rounded-lg border transition-colors"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="2"
                   max="20"
            >
          </div>
          <div>
            <label for="amp-time-window" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Time
              Window (seconds)</label>
            <input id="amp-time-window"
                   type="number"
                   bind:value={tempProtectionConfig.timeWindowSeconds}
                   class="w-full px-3 py-2 rounded-lg border transition-colors"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="10"
                   max="600"
            >
          </div>
          <div>
            <span id="amp-action-label" class="block text-sm font-medium mb-2"
                  style="color: {$colorStore.text}">Action</span>
            <DiscordSelector
              type="custom"
              options={actionOptions}
              bind:selected={tempProtectionConfig.action}
              placeholder="Select action..."
            />
          </div>
          <div>
            <label for="amp-punish-duration" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Punishment
              Duration (minutes)</label>
            <input id="amp-punish-duration"
                   type="number"
                   bind:value={tempProtectionConfig.punishDuration}
                   class="w-full px-3 py-2 rounded-lg border transition-colors"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="0"
                   max="1440"
            >
          </div>
          <div class="col-span-full">
            <label for="amp-check-links-only" class="flex items-center gap-2 cursor-pointer">
              <input id="amp-check-links-only"
                     type="checkbox"
                     bind:checked={tempProtectionConfig.checkLinksOnly}
                     class="w-4 h-4 rounded transition-all"
                     style="accent-color: {$colorStore.primary};"
              />
              <span style="color: {$colorStore.text}">Check Links Only (Recommended)</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
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
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 14px;"></i>
              {:else}
                <i class="fa-solid fa-save" style="font-size: 14px;"></i>
              {/if}
              <span>Save</span>
            </div>
          </button>
        </div>
      </div>
    {/if}
  {:else}
    <div class="text-center py-8">
      <i class="fa-utility-duo fa-regular fa-comments"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
      <p class="text-lg font-medium" style="color: {$colorStore.text}">Anti-Mass-Post Protection Disabled</p>
      <p class="text-sm" style="color: {$colorStore.muted}">Enable to detect cross-channel spam and scam links</p>
    </div>
  {/if}
</div>
