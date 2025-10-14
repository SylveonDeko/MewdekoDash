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
     in:fly={{ y: 20, duration: 300, delay: 300 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div class="flex items-center gap-4">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-clock"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Anti-Alt Protection</h2>
        <p class="text-sm" style="color: {$colorStore.muted}">Block young accounts</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
        onclick={() => toggleProtection('antiAlt')}
        style="background: {protectionStatus.antiAlt.enabled ? $colorStore.accent + '20' : $colorStore.secondary + '20'};
               color: {protectionStatus.antiAlt.enabled ? $colorStore.accent : $colorStore.secondary};
               border: 1px solid {protectionStatus.antiAlt.enabled ? $colorStore.accent + '30' : $colorStore.secondary + '30'};"
      >
        {#if protectionStatus.antiAlt.enabled}
          <i class="fa-solid fa-toggle-on" style="font-size: 16px;"></i>
          Enabled
        {:else}
          <i class="fa-solid fa-toggle-off" style="font-size: 16px;"></i>
          Disabled
        {/if}
      </button>

      {#if protectionStatus.antiAlt.enabled}
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
          onclick={() => toggleProtectionCard('antiAlt')}
        >
          {#if expandedProtectionCard === 'antiAlt'}
            <i class="fa-solid fa-chevron-up" style="font-size: 16px;"></i>
          {:else}
            <i class="fa-solid fa-chevron-down" style="font-size: 16px;"></i>
          {/if}
          {expandedProtectionCard === 'antiAlt' ? 'Collapse' : 'Configure'}
        </button>
      {/if}
    </div>
  </div>

  {#if protectionStatus.antiAlt.enabled}
    <div class="grid grid-cols-2 gap-4 p-4 rounded-xl" style="background: {$colorStore.primary}05;">
      <div class="text-center">
        <div class="text-2xl font-bold"
             style="color: {$colorStore.primary}">{Math.floor(protectionStatus.antiAlt.minAgeMinutes / 1440)}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">Min Account Age (days)</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-semibold"
             style="color: {$colorStore.primary}">{formatAction(protectionStatus.antiAlt.action)}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">Punishment</div>
      </div>
      {#if protectionStatus.antiAlt.action === 1 && protectionStatus.antiAlt.actionDurationMinutes > 0}
        <div class="text-center">
          <div class="text-2xl font-bold"
               style="color: {$colorStore.primary}">{protectionStatus.antiAlt.actionDurationMinutes}m
          </div>
          <div class="text-sm" style="color: {$colorStore.muted}">Mute Duration</div>
        </div>
      {/if}
    </div>

    <!-- Expanded Configuration -->
    {#if expandedProtectionCard === 'antiAlt'}
      <div transition:slide={{ duration: 300 }} class="mt-6 pt-6 border-t space-y-6"
           style="border-color: {$colorStore.primary}20;">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="antialt-min-age" class="block text-sm font-medium mb-2"
                   style="color: {$colorStore.text}">Minimum Account Age (minutes)</label>
            <input id="antialt-min-age"
                   type="number"
                   bind:value={tempProtectionConfig.minAgeMinutes}
                   class="w-full px-3 py-2 rounded-lg border transition-colors"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="1"
                   max="525600"
            >
          </div>
          <div>
            <span id="antialt-action-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Action</span>
            <DiscordSelector
              type="custom"
              options={actionOptions}
              bind:selected={tempProtectionConfig.action}
              placeholder="Select action..."
              multiple={false}
            />
          </div>
          <div>
            <label for="antialt-action-duration" class="block text-sm font-medium mb-2"
                   style="color: {$colorStore.text}">Action
              Duration (minutes)</label>
            <input id="antialt-action-duration"
                   type="number"
                   bind:value={tempProtectionConfig.actionDurationMinutes}
                   class="w-full px-3 py-2 rounded-lg border transition-colors"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="0"
                   max="525600"
            >
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
      <i class="fa-utility-duo fa-regular fa-clock"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
      <p class="text-lg font-medium" style="color: {$colorStore.text}">Anti-Alt Protection Disabled</p>
      <p class="text-sm" style="color: {$colorStore.muted}">Enable to block young accounts</p>
    </div>
  {/if}
</div>
