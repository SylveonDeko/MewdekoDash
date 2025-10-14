<script lang="ts">
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  let {
    guildTimezone,
    newTimezone = $bindable(),
    availableTimezones,
    saving,
    saveServerSettings
  } = $props();
</script>

<div class=" rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 200 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex items-center gap-4 mb-6">
    <div class="p-3 rounded-xl"
         style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
      <i class="fa-utility-duo fa-regular fa-globe"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
    </div>
    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Timezone Settings</h2>
  </div>

  <div class="space-y-4">
    <span class="block text-sm font-medium" id="server-timezone-label" style="color: {$colorStore.text}">
      Server Timezone
    </span>
    <DiscordSelector
      bind:selected={newTimezone}
      multiple={false}
      options={availableTimezones}
      placeholder="Select server timezone..."
      type="timezone"
    />
    <p class="text-xs" style="color: {$colorStore.muted}">
      Timezone used for time-based features and logging
    </p>
  </div>

  {#if newTimezone && newTimezone !== guildTimezone}
    <div class="mt-6 flex justify-end">
      <button
        class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
        onclick={saveServerSettings}
        disabled={saving}
      >
        {#if saving}
          <i class="fa-solid fa-rotate-right fa-spin" style="font-size: 16px;"></i>
        {:else}
          <i class="fa-solid fa-floppy-disk" style="font-size: 16px;"></i>
        {/if}
        Save Timezone
      </button>
    </div>
  {/if}
</div>
