<script lang="ts">
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  let {
    permissionOverrides,
    expandedRoleCard = $bindable(),
    newPermissionOverride = $bindable(),
    selectedPermissionOverrides,
    availableCommands,
    availablePermissions,
    saving,
    showConfirm,
    removePermissionOverride,
    addPermissionOverride,
    resetPermissionOverrides,
    deleteSelectedPermissionOverrides
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
        <i class="fa-utility-duo fa-regular fa-key"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Permission Overrides</h2>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
        onclick={() => expandedRoleCard = expandedRoleCard === 'permissionOverride' ? null : 'permissionOverride'}
        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
      >
        {#if expandedRoleCard === 'permissionOverride'}
          <i class="fa-solid fa-chevron-up" style="font-size: 16px;"></i>
        {:else}
          <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
        {/if}
        {expandedRoleCard === 'permissionOverride' ? 'Collapse' : 'Add Override'}
      </button>

      {#if selectedPermissionOverrides.length > 0}
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
          style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
          onclick={() => showConfirm("Delete Selected Overrides", `Delete ${selectedPermissionOverrides.length} selected permission override${selectedPermissionOverrides.length > 1 ? 's' : ''}?`, deleteSelectedPermissionOverrides)}
        >
          <i class="fa-solid fa-trash" style="font-size: 16px;"></i>
          Delete Selected ({selectedPermissionOverrides.length})
        </button>
      {/if}

      {#if permissionOverrides.length > 0}
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
          style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
          onclick={() => showConfirm("Clear All Overrides", "Are you sure you want to clear all permission overrides?", resetPermissionOverrides)}
        >
          <i class="fa-solid fa-trash" style="font-size: 16px;"></i>
          Clear All
        </button>
      {/if}
    </div>
  </div>

  <div class="space-y-4">
    <p class="text-sm" style="color: {$colorStore.muted}">
      Override Discord permissions required for specific bot commands. Select from {availableCommands.length} available
      commands.
    </p>

    {#if permissionOverrides.length === 0}
      <div class="text-center py-8">
        <i class="fa-utility-duo fa-regular fa-key"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
        <p class="text-lg font-medium" style="color: {$colorStore.text}">No permission overrides configured</p>
        <p class="text-sm" style="color: {$colorStore.muted}">Add command permission overrides using actual bot
          commands</p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each permissionOverrides as override (override.command)}
          <div class="flex items-center justify-between p-4 rounded-lg border"
               style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
            <div>
              <p class="font-medium" style="color: {$colorStore.text}">{override.command}</p>
              <p class="text-sm" style="color: {$colorStore.muted}">Requires: {override.permission}</p>
            </div>
            <button
              class="px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
              style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
              onclick={() => removePermissionOverride(override.command, override.permission)}
            >
              Remove
            </button>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Inline Add Permission Override Form -->
    {#if expandedRoleCard === 'permissionOverride'}
      <div transition:slide={{ duration: 300 }} class="mt-4 pt-4 border-t"
           style="border-color: {$colorStore.primary}20;">
        <div class="p-4 rounded-xl border-2 border-dashed"
             style="border-color: {$colorStore.secondary}30; background: {$colorStore.secondary}05;">
          <h5 class="font-medium mb-3" style="color: {$colorStore.text}">Add Permission Override</h5>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span id="bot-command-label"
                    class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                Bot Command ({availableCommands.length} available)
              </span>
              <DiscordSelector
                type="custom"
                options={availableCommands}
                bind:selected={newPermissionOverride.command}
                placeholder="Select a bot command..."
                searchable={true}
                multiple={false}
              />
            </div>

            <div>
              <span id="required-permission-label" class="block text-sm font-medium mb-2"
                    style="color: {$colorStore.text}">Required Discord Permission</span>
              <DiscordSelector
                type="custom"
                options={availablePermissions}
                bind:selected={newPermissionOverride.permission}
                placeholder="Select required permission..."
                searchable={true}
                multiple={false}
              />
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
              style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
              onclick={() => { expandedRoleCard = null; newPermissionOverride = { command: "", permission: "Administrator" }; }}
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
              onclick={addPermissionOverride}
              disabled={!newPermissionOverride.command || saving}
            >
              {#if saving}
                <i class="fa-solid fa-rotate-right fa-spin" style="font-size: 16px;"></i>
              {:else}
                <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
              {/if}
              Add Override
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
