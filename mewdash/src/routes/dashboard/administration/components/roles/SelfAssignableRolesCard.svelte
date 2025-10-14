<script lang="ts">
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { administrationApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";

  let {
    selfAssignableRoles,
    toggleSelfAssignableRolesExclusive,
    fetchAllData
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
        <i class="fa-utility-duo fa-regular fa-user-check"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Self-Assignable Roles</h2>
    </div>

    <div class="flex items-center gap-2">
      <span class="text-sm" style="color: {$colorStore.text}">Exclusive</span>
      <button aria-label="Toggle exclusive mode"
              class="p-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] min-w-[44px]"
              onclick={toggleSelfAssignableRolesExclusive}
              style="color: {selfAssignableRoles.exclusive ? $colorStore.secondary : $colorStore.muted}"
      >
        {#if selfAssignableRoles.exclusive}
          <i class="fa-solid fa-toggle-on" style="font-size: 24px;"></i>
        {:else}
          <i class="fa-solid fa-toggle-off" style="font-size: 24px;"></i>
        {/if}
      </button>
    </div>
  </div>

  {#if !Array.isArray(selfAssignableRoles.roles) || selfAssignableRoles.roles.length === 0}
    <div class="text-center py-8">
      <i class="fa-utility-duo fa-regular fa-user-check"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
      <p class="text-lg font-medium mt-4" style="color: {$colorStore.text}">No self-assignable roles configured</p>
      <p class="text-sm" style="color: {$colorStore.muted}">Users can't assign roles to themselves yet</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each Object.entries(selfAssignableRoles.groups || {}) as [groupId, groupName] (groupId)}
        <div class="border rounded-lg p-4" style="border-color: {$colorStore.primary}20;">
          <h3 class="font-semibold mb-3" style="color: {$colorStore.text}">
            Group {groupId}: {groupName || 'Unnamed'}
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {#each selfAssignableRoles.roles.filter((r: any) => r.model.group === parseInt(groupId)) as role (role.model.roleId)}
              <div
                class="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:shadow-lg  border"
                style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <span class="font-medium" style="color: {$colorStore.text}">
                  {role.role?.name || `Role ${role.model.roleId}`}
                  {#if role.model.levelRequirement > 0}
                    <span class="text-xs" style="color: {$colorStore.muted}">
                      (Level {role.model.levelRequirement}+)
                    </span>
                  {/if}
                </span>
                <button
                  class="px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                  onclick={() => $currentGuild && administrationApi.removeSelfAssignableRole($currentGuild.id, role.model.roleId).then(() => fetchAllData())}
                  aria-label="Remove {role.role?.name} from self-assignable roles"
                >
                  Remove
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/each}

      <!-- Ungrouped roles -->
      {#if selfAssignableRoles.roles.filter((r: any) => r.model.group === 0).length > 0}
        <div class="border rounded-lg p-4" style="border-color: {$colorStore.primary}20;">
          <h3 class="font-semibold mb-3" style="color: {$colorStore.text}">
            Ungrouped Roles
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {#each selfAssignableRoles.roles.filter((r: any) => r.model.group === 0) as role (role.model.roleId)}
              <div
                class="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:shadow-lg  border"
                style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <span class="font-medium" style="color: {$colorStore.text}">
                  {role.role?.name || `Role ${role.model.roleId}`}
                  {#if role.model.levelRequirement > 0}
                    <span class="text-xs" style="color: {$colorStore.muted}">
                      (Level {role.model.levelRequirement}+)
                    </span>
                  {/if}
                </span>
                <button
                  class="px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                  onclick={() => $currentGuild && administrationApi.removeSelfAssignableRole($currentGuild.id, role.model.roleId).then(() => fetchAllData())}
                  aria-label="Remove {role.role?.name} from self-assignable roles"
                >
                  Remove
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
