<script lang="ts">
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { administrationApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";

  let {
    selfAssignableRoles,
    toggleSelfAssignableRolesExclusive,
    fetchAllData
  } = $props();

  /** Last known auto-delete state, null until toggled once this session */
  let autoDeleteState = $state<boolean | null>(null);
  let busy = $state(false);
  let editingGroup = $state<string | null>(null);
  let groupNameDraft = $state("");
  let editingLevelRole = $state<string | null>(null);
  let levelDraft = $state(0);

  /** Groups roles by their group id for rendering */
  let groupedRoles = $derived.by(() => {
    const roles: any[] = Array.isArray(selfAssignableRoles?.roles) ? selfAssignableRoles.roles : [];
    const groups: Record<string, string | null> = selfAssignableRoles?.groups || {};
    const ids = new Set<number>([...Object.keys(groups).map(Number), ...roles.map(r => r.model.group)]);
    return Array.from(ids).sort((a, b) => a - b).map(id => ({
      id,
      name: groups[id] ?? null,
      roles: roles.filter(r => r.model.group === id)
    })).filter(g => g.roles.length > 0 || g.name);
  });

  async function toggleAutoDelete() {
    if (!$currentGuild) return;
    busy = true;
    try {
      autoDeleteState = await administrationApi.toggleSelfAssignableRoleAutoDelete($currentGuild.id);
    } catch (err) {
      logger.error("Failed to toggle self-assign auto delete:", err);
    } finally {
      busy = false;
    }
  }

  async function removeRole(roleId: bigint) {
    if (!$currentGuild) return;
    busy = true;
    try {
      await administrationApi.removeSelfAssignableRole($currentGuild.id, roleId);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to remove self-assignable role:", err);
    } finally {
      busy = false;
    }
  }

  function startGroupRename(groupId: number, current: string | null) {
    editingGroup = groupId.toString();
    groupNameDraft = current ?? "";
  }

  async function saveGroupName(groupId: number) {
    if (!$currentGuild) return;
    busy = true;
    try {
      await administrationApi.setSelfAssignableRoleGroup($currentGuild.id, { group: groupId, name: groupNameDraft.trim() || null });
      editingGroup = null;
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to rename group:", err);
    } finally {
      busy = false;
    }
  }

  function startLevelEdit(role: any) {
    editingLevelRole = role.model.roleId.toString();
    levelDraft = role.model.levelRequirement || 0;
  }

  async function saveLevel(roleId: bigint) {
    if (!$currentGuild) return;
    busy = true;
    try {
      await administrationApi.setSelfAssignableRoleLevel($currentGuild.id, roleId, Math.max(0, Math.floor(levelDraft)));
      editingLevelRole = null;
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to set level requirement:", err);
    } finally {
      busy = false;
    }
  }
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
      <div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Self-Assignable Roles</h2>
        <p class="text-sm" style="color: {$colorStore.muted}">Roles members can give themselves with the iam command</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2">
        <div class="text-right">
          <div class="text-sm" style="color: {$colorStore.text}">Exclusive</div>
          <div class="text-xs" style="color: {$colorStore.muted}">One role per group</div>
        </div>
        <button aria-label="Toggle exclusive mode"
                role="switch"
                aria-checked={selfAssignableRoles.exclusive}
                class="p-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] min-w-[44px]"
                onclick={toggleSelfAssignableRolesExclusive}
                style="color: {selfAssignableRoles.exclusive ? $colorStore.secondary : $colorStore.muted}">
          <i class="fa-solid {selfAssignableRoles.exclusive ? 'fa-toggle-on' : 'fa-toggle-off'}" style="font-size: 24px;"></i>
        </button>
      </div>
      <div class="flex items-center gap-2">
        <div class="text-right">
          <div class="text-sm" style="color: {$colorStore.text}">Auto delete</div>
          <div class="text-xs" style="color: {$colorStore.muted}">
            {#if autoDeleteState === null}Remove iam messages{:else}{autoDeleteState ? "On" : "Off"}{/if}
          </div>
        </div>
        <button aria-label="Toggle auto delete of self-assign messages"
                class="p-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] min-w-[44px] disabled:opacity-50"
                disabled={busy}
                onclick={toggleAutoDelete}
                style="color: {autoDeleteState ? $colorStore.secondary : $colorStore.muted}">
          <i class="fa-solid {autoDeleteState ? 'fa-toggle-on' : 'fa-toggle-off'}" style="font-size: 24px;"></i>
        </button>
      </div>
    </div>
  </div>

  {#if groupedRoles.length === 0}
    <div class="text-center py-8">
      <i class="fa-utility-duo fa-regular fa-user-check"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
      <p class="text-lg font-medium mt-4" style="color: {$colorStore.text}">No self-assignable roles configured</p>
      <p class="text-sm" style="color: {$colorStore.muted}">Add a role above so members can assign it themselves</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each groupedRoles as group (group.id)}
        <div class="border rounded-lg p-4" style="border-color: {$colorStore.primary}20;">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            {#if editingGroup === group.id.toString()}
              <form class="flex items-center gap-2 flex-1 min-w-[220px]" onsubmit={(e) => { e.preventDefault(); saveGroupName(group.id); }} transition:slide>
                <input type="text" bind:value={groupNameDraft} placeholder="Group name" aria-label="Group name" maxlength="100"
                       class="flex-1 px-3 py-2 rounded-lg border text-sm min-h-[40px]"
                       style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
                <button type="submit" disabled={busy} class="px-3 py-2 rounded-lg text-sm min-h-[40px] disabled:opacity-50"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary};">Save</button>
                <button type="button" class="px-3 py-2 rounded-lg text-sm min-h-[40px]"
                        style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                        onclick={() => editingGroup = null}>Cancel</button>
              </form>
            {:else}
              <h3 class="font-semibold flex items-center gap-2" style="color: {$colorStore.text}">
                {#if group.id === 0}
                  Ungrouped
                {:else}
                  Group {group.id}{group.name ? `: ${group.name}` : ""}
                {/if}
                {#if group.id !== 0}
                  <button class="p-1 rounded-sm hover:opacity-80 min-h-[28px] min-w-[28px]" aria-label="Rename group"
                          onclick={() => startGroupRename(group.id, group.name)}>
                    <i class="fa-solid fa-pen" style="color: {$colorStore.muted}; font-size: 12px;"></i>
                  </button>
                {/if}
              </h3>
            {/if}
            <span class="text-xs px-2 py-1 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.muted};">
              {group.roles.length} role{group.roles.length === 1 ? "" : "s"}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {#each group.roles as role (role.model.roleId)}
              <div class="flex items-center justify-between gap-2 p-3 rounded-lg transition-all duration-200 hover:shadow-lg border"
                   style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <div class="min-w-0">
                  <div class="font-medium truncate" style="color: {$colorStore.text}">
                    {role.role?.name || `Role ${role.model.roleId}`}
                  </div>
                  {#if editingLevelRole === role.model.roleId.toString()}
                    <form class="flex items-center gap-1 mt-1" onsubmit={(e) => { e.preventDefault(); saveLevel(role.model.roleId); }}>
                      <input type="number" min="0" max="1000" bind:value={levelDraft} aria-label="Required level"
                             class="w-20 px-2 py-1 rounded-sm border text-xs min-h-[32px]"
                             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
                      <button type="submit" disabled={busy} class="px-2 py-1 rounded-sm text-xs min-h-[32px] disabled:opacity-50"
                              style="background: {$colorStore.primary}20; color: {$colorStore.primary};">Save</button>
                      <button type="button" class="px-2 py-1 rounded-sm text-xs min-h-[32px]"
                              style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                              onclick={() => editingLevelRole = null}>Cancel</button>
                    </form>
                  {:else}
                    <button class="text-xs mt-0.5 hover:underline" style="color: {$colorStore.muted}"
                            onclick={() => startLevelEdit(role)}>
                      {role.model.levelRequirement > 0 ? `Level ${role.model.levelRequirement}+` : "No level requirement"}
                      <i class="fa-solid fa-pen ml-1" style="font-size: 10px;"></i>
                    </button>
                  {/if}
                </div>
                <button
                  class="px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80 shrink-0 min-h-[36px] disabled:opacity-50"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                  disabled={busy}
                  onclick={() => removeRole(role.model.roleId)}
                  aria-label="Remove {role.role?.name} from self-assignable roles"
                >
                  Remove
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
