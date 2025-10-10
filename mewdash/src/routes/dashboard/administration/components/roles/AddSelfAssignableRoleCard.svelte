<script lang="ts">
  import { slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { administrationApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";

  let {
    availableRoles,
    fetchAllData
  } = $props();

  let expanded = $state(false);
  let saving = $state(false);
  let newRole: string | null = $state(null);
  let newRoleGroup = $state(0);
  let newRoleLevel = $state(0);

  async function addRole() {
    if (!$currentGuild?.id || !newRole) return;

    try {
      saving = true;
      await administrationApi.addSelfAssignableRole(
        $currentGuild.id,
        BigInt(newRole),
        { group: newRoleGroup }
      );

      // If level requirement, set it
      if (newRoleLevel > 0) {
        await administrationApi.setSelfAssignableRoleLevel($currentGuild.id, BigInt(newRole), newRoleLevel);
      }

      newRole = null;
      newRoleGroup = 0;
      newRoleLevel = 0;
      expanded = false;
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to add self-assignable role:", err);
    } finally {
      saving = false;
    }
  }
</script>

{#if expanded}
  <div transition:slide={{ duration: 300 }} class="mb-4 p-4 rounded-xl border-2 border-dashed"
       style="border-color: {$colorStore.secondary}30; background: {$colorStore.secondary}05;">
    <div class="flex items-center justify-between mb-3">
      <h5 class="font-medium" style="color: {$colorStore.text}">Add Self-Assignable Role</h5>
      <button
        class="px-2 py-1 rounded-lg text-sm"
        style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
        onclick={() => { expanded = false; newRole = null; newRoleGroup = 0; newRoleLevel = 0; }}
      >
        Cancel
      </button>
    </div>

    <div class="space-y-3">
      <div>
        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Role</span>
        <DiscordSelector
          type="role"
          options={availableRoles}
          bind:selected={newRole}
          placeholder="Select role to make self-assignable..."
          multiple={false}
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="role-group" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Group</label>
          <input
            id="role-group"
            type="number"
            bind:value={newRoleGroup}
            min="0"
            max="100"
            class="w-full px-3 py-2 rounded-lg border transition-colors"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
            placeholder="0"
          />
        </div>

        <div>
          <label for="role-level" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Level
            Req</label>
          <input
            id="role-level"
            type="number"
            bind:value={newRoleLevel}
            min="0"
            max="999"
            class="w-full px-3 py-2 rounded-lg border transition-colors"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
            placeholder="0"
          />
        </div>
      </div>

      <button
        class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
        onclick={addRole}
        disabled={!newRole || saving}
      >
        {#if saving}
          <i class="fa-solid fa-spinner fa-spin"></i>
        {:else}
          <i class="fa-solid fa-plus"></i>
        {/if}
        Add Role
      </button>
    </div>
  </div>
{:else}
  <button
    class="w-full mb-4 px-4 py-2 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
    style="background: {$colorStore.secondary}10; color: {$colorStore.secondary}; border: 2px dashed {$colorStore.secondary}40;"
    onclick={() => expanded = true}
  >
    <i class="fa-solid fa-plus"></i>
    Add Self-Assignable Role
  </button>
{/if}
