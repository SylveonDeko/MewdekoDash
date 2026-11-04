<script lang="ts">
  import { m } from "$lib/i18n";
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  let {
    newTimezone = $bindable(),
    availableTimezones,
    saveTimezone
  } = $props();
</script>

<div class=" rounded-2xl border p-6 transition-all"
     in:fly={{ y: 20, duration: 300, delay: 200 }}
     style="background: {$colorStore.primary}0c;
            border-color: {$colorStore.primary}30;">

  <div class="flex items-center gap-4 mb-6">
    <div class="p-3 rounded-xl"
         style="background: {$colorStore.primary}20;">
      <i class="fa-utility-duo fa-regular fa-globe"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
    </div>
    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.administration.automationTimezoneTitle()}</h2>
  </div>

  <div class="space-y-4">
    <span class="block text-sm font-medium" id="server-timezone-label" style="color: {$colorStore.text}">
      {m.common.serverTimezone()}
    </span>
    <DiscordSelector
      bind:selected={newTimezone}
      multiple={false}
      options={availableTimezones}
      placeholder={m.administration.automationTimezonePlaceholder()}
      type="timezone"
      onchange={(d) => saveTimezone(typeof d.selected === "string" && d.selected ? d.selected : null)}
    />
    <p class="text-xs" style="color: {$colorStore.muted}">
      {m.administration.automationTimezoneHint()}
    </p>
  </div>

</div>
