<script lang="ts">
  import { m } from "$lib/i18n";
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  let {
    autoAssignRoles,
    selectedNormalRoles = $bindable(),
    selectedBotRoles = $bindable(),
    availableRoles,
    saveNormalRoles,
    saveBotRoles
  } = $props();
</script>

<div class=" rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 100 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex items-center gap-4 mb-6">
    <div class="p-3 rounded-xl"
         style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
      <i class="fa-utility-duo fa-regular fa-users"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
    </div>
    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.features.wizardAdministrationName()}</h2>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Normal Users -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold flex items-center gap-2" style="color: {$colorStore.text}">
        <i class="fa-utility-duo fa-regular fa-users"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
        {m.administration.rolesAutoAssignNormalUsers()}
      </h3>

      <DiscordSelector
        bind:selected={selectedNormalRoles}
        multiple={true}
        options={availableRoles}
        placeholder={m.administration.rolesAutoAssignNormalPlaceholder()}
        type="role"
        onchange={() => saveNormalRoles()}
      />
      <p class="text-sm" style="color: {$colorStore.muted}">
        {m.administration.rolesAutoAssignNormalHint()}
      </p>
    </div>

    <!-- Bot Users -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold flex items-center gap-2" style="color: {$colorStore.text}">
        <i class="fa-utility-duo fa-regular fa-circle-user"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
        {m.administration.rolesAutoAssignBotUsers()}
      </h3>

      <DiscordSelector
        bind:selected={selectedBotRoles}
        multiple={true}
        options={availableRoles}
        placeholder={m.administration.rolesAutoAssignBotPlaceholder()}
        type="role"
        onchange={() => saveBotRoles()}
      />
      <p class="text-sm" style="color: {$colorStore.muted}">
        {m.administration.rolesAutoAssignBotHint()}
      </p>
    </div>
  </div>
</div>
