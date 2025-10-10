<script lang="ts">
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  let {
    autoBanRoles,
    expandedRoleCard = $bindable(),
    newAutoBanRole = $bindable(),
    availableRoles,
    saving,
    showConfirm,
    removeAutoBanRole,
    addAutoBanRole
  } = $props();
</script>

<div class="backdrop-blur-xs rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 200 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div class="flex items-center gap-4">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.accent}20, {$colorStore.accent}30);">
        <i class="fa-utility-duo fa-regular fa-shield"
           style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 24px;"></i>
      </div>
      <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Auto-Ban Roles</h2>
    </div>

    <button
      class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
      onclick={() => expandedRoleCard = expandedRoleCard === 'autoBan' ? null : 'autoBan'}
      style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
    >
      {#if expandedRoleCard === 'autoBan'}
        <i class="fa-solid fa-chevron-up" style="font-size: 16px;"></i>
      {:else}
        <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
      {/if}
      {expandedRoleCard === 'autoBan' ? 'Collapse' : 'Add Role'}
    </button>
  </div>

  <div class="space-y-4">
    <p class="text-sm" style="color: {$colorStore.muted}">
      Users who receive these roles will be automatically banned from the server
    </p>

    {#if autoBanRoles.length === 0}
      <div class="text-center py-8">
        <i class="fa-utility-duo fa-regular fa-shield"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
        <p class="text-lg font-medium mt-4" style="color: {$colorStore.text}">No auto-ban roles configured</p>
        <p class="text-sm" style="color: {$colorStore.muted}">Add roles that should trigger automatic bans</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each autoBanRoles as role (role.roleId)}
          <div
            class="flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:shadow-lg backdrop-blur-xs border"
            style="background: {$colorStore.accent}05; border-color: {$colorStore.accent}20;">
            <span class="font-medium" style="color: {$colorStore.text}">
              {role.roleName}
            </span>
            <button
              class="px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80"
              style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
              onclick={() => showConfirm("Remove Auto-Ban Role", `Are you sure you want to remove ${role.roleName} from auto-ban roles?`, () => removeAutoBanRole(role.roleId))}
              aria-label="Remove {role.roleName} from auto-ban roles"
            >
              Remove
            </button>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Inline Add Form -->
    {#if expandedRoleCard === 'autoBan'}
      <div transition:slide={{ duration: 300 }} class="mt-4 pt-4 border-t"
           style="border-color: {$colorStore.primary}20;">
        <div class="p-4 rounded-xl border-2 border-dashed"
             style="border-color: {$colorStore.secondary}30; background: {$colorStore.secondary}05;">
          <h5 class="font-medium mb-3" style="color: {$colorStore.text}">Add Auto-Ban Role</h5>

          <div class="space-y-4">
            <div>
              <span id="autoban-role-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Role</span>
              <DiscordSelector
                type="role"
                options={availableRoles}
                bind:selected={newAutoBanRole}
                placeholder="Select role..."
                multiple={false}
              />
            </div>

            <div class="flex flex-col sm:flex-row gap-3">
              <button
                class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
                style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                onclick={() => { expandedRoleCard = null; newAutoBanRole = null; }}
              >
                Cancel
              </button>
              <button
                class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
                style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                onclick={addAutoBanRole}
                disabled={!newAutoBanRole || saving}
              >
                {#if saving}
                  <i class="fa-solid fa-rotate-right fa-spin" style="font-size: 16px;"></i>
                {:else}
                  <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
                {/if}
                Add Role
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>