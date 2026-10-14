<script lang="ts">
  import { m } from "$lib/i18n";
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  let {
    staffRole,
    memberRole,
    newStaffRole = $bindable(),
    newMemberRole = $bindable(),
    availableRoles,
    saving,
    saveServerSettings
  } = $props();
</script>

<div class=" rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 100 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex items-center gap-4 mb-6">
    <div class="p-3 rounded-xl"
         style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
      <i class="fa-utility-duo fa-regular fa-crown"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
    </div>
    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.features.wizardRolesStepCoreTitle()}</h2>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-4">
      <span class="block text-sm font-medium" id="staff-role-label" style="color: {$colorStore.text}">
        {m.common.staffRole()}
      </span>
      <DiscordSelector
        bind:selected={newStaffRole}
        multiple={false}
        options={availableRoles}
        placeholder={m.administration.automationServerRolesStaffPlaceholder()}
        type="role"
      />
      <p class="text-xs" style="color: {$colorStore.muted}">
        {m.administration.automationServerRolesStaffHint()}
      </p>
    </div>

    <div class="space-y-4">
      <span class="block text-sm font-medium" id="member-role-label" style="color: {$colorStore.text}">
        {m.administration.automationServerRolesMember()}
      </span>
      <DiscordSelector
        bind:selected={newMemberRole}
        multiple={false}
        options={availableRoles}
        placeholder={m.administration.automationServerRolesMemberPlaceholder()}
        type="role"
      />
      <p class="text-xs" style="color: {$colorStore.muted}">
        {m.administration.automationServerRolesMemberHint()}
      </p>
    </div>
  </div>

  {#if (newStaffRole && newStaffRole !== (staffRole?.toString() || null)) || (newMemberRole && newMemberRole !== (memberRole?.toString() || null))}
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
        {m.common.saveChanges()}
      </button>
    </div>
  {/if}
</div>
