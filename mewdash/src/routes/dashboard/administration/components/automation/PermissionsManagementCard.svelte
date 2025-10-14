<script lang="ts">
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { administrationApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";

  let {
    fetchAllData,
    showConfirm,
    availableRoles
  } = $props();

  let permissions: any = $state(null);
  let loading = $state(false);
  let saving = $state(false);
  let expandedCard = $state(false);
  let verboseMode = $state(false);
  let permissionRole = $state("");
  let selectedPermissions: number[] = $state([]);

  async function loadPermissions() {
    if (!$currentGuild?.id) return;

    try {
      loading = true;
      permissions = await administrationApi.getPermissions($currentGuild.id);
      if (permissions?.config) {
        verboseMode = permissions.config.verbosePermissions || false;
        permissionRole = permissions.config.permissionRole || "";
      }
    } catch (err) {
      logger.error("Failed to load permissions:", err);
    } finally {
      loading = false;
    }
  }

  async function resetAllPermissions() {
    if (!$currentGuild?.id) return;

    try {
      saving = true;
      await administrationApi.resetPermissions($currentGuild.id);
      await loadPermissions();
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to reset permissions:", err);
    } finally {
      saving = false;
    }
  }

  async function removePermission(index: number) {
    if (!$currentGuild?.id) return;

    try {
      await administrationApi.removePermission($currentGuild.id, index);
      await loadPermissions();
    } catch (err) {
      logger.error("Failed to remove permission:", err);
    }
  }

  async function toggleVerboseMode() {
    if (!$currentGuild?.id) return;

    try {
      verboseMode = !verboseMode;
      await administrationApi.setVerbosePermissions($currentGuild.id, verboseMode);
      await loadPermissions();
    } catch (err) {
      logger.error("Failed to toggle verbose mode:", err);
    }
  }

  async function savePermissionRole() {
    if (!$currentGuild?.id || !permissionRole) return;

    try {
      saving = true;
      await administrationApi.setPermissionRole($currentGuild.id, permissionRole);
      await loadPermissions();
    } catch (err) {
      logger.error("Failed to save permission role:", err);
    } finally {
      saving = false;
    }
  }

  $effect(() => {
    if ($currentGuild?.id) {
      loadPermissions();
    }
  });
</script>

<div class=" rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 600 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div class="flex items-center gap-4">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-shield-halved"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Permissions System</h2>
        <p class="text-sm" style="color: {$colorStore.muted}">Custom permission rules beyond Discord</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
        onclick={() => expandedCard = !expandedCard}
        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
      >
        {#if expandedCard}
          <i class="fa-solid fa-chevron-up" style="font-size: 16px;"></i>
        {:else}
          <i class="fa-solid fa-chevron-down" style="font-size: 16px;"></i>
        {/if}
        {expandedCard ? 'Collapse' : 'Manage'}
      </button>

      {#if permissions?.permissions?.length > 0}
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
          style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
          onclick={() => showConfirm("Reset All Permissions", "This will reset all custom permissions to default. Are you sure?", resetAllPermissions, "danger")}
        >
          <i class="fa-solid fa-rotate-left" style="font-size: 16px;"></i>
          Reset All
        </button>
      {/if}
    </div>
  </div>

  {#if loading}
    <div class="text-center py-8">
      <i class="fa-solid fa-spinner fa-spin" style="color: {$colorStore.primary}; font-size: 32px;"></i>
      <p class="text-sm mt-2" style="color: {$colorStore.muted}">Loading permissions...</p>
    </div>
  {:else if permissions}
    <div class="space-y-4">
      <!-- Quick Stats -->
      <div class="grid grid-cols-2 gap-4 p-4 rounded-xl" style="background: {$colorStore.primary}05;">
        <div class="text-center">
          <div class="text-2xl font-bold"
               style="color: {$colorStore.primary}">{permissions?.permissions?.length || 0}</div>
          <div class="text-sm" style="color: {$colorStore.muted}">Custom Rules</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-semibold"
               style="color: {$colorStore.primary}">{verboseMode ? 'Enabled' : 'Disabled'}</div>
          <div class="text-sm" style="color: {$colorStore.muted}">Verbose Mode</div>
        </div>
      </div>

      <!-- Settings -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border"
           style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
        <div class="flex items-center justify-between">
          <span style="color: {$colorStore.text}">Verbose Permissions</span>
          <button
            class="p-2 rounded-lg transition-all hover:scale-[1.02]"
            style="color: {verboseMode ? $colorStore.secondary : $colorStore.muted}"
            onclick={toggleVerboseMode}
          >
            {#if verboseMode}
              <i class="fa-solid fa-toggle-on" style="font-size: 24px;"></i>
            {:else}
              <i class="fa-solid fa-toggle-off" style="font-size: 24px;"></i>
            {/if}
          </button>
        </div>

        <div>
          <label for="permission-role" class="block text-sm mb-1" style="color: {$colorStore.text}">Permission Role
            ID</label>
          <div class="flex gap-2">
            <input
              id="permission-role"
              type="text"
              bind:value={permissionRole}
              placeholder="Enter role ID..."
              class="flex-1 px-3 py-2 rounded-lg border transition-colors text-sm"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
            />
            <button
              class="px-3 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
              onclick={savePermissionRole}
              disabled={!permissionRole || saving}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {#if expandedCard}
        <div transition:slide={{ duration: 300 }} class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-medium" style="color: {$colorStore.text}">Custom Permission Rules</h4>
            <span class="text-xs px-3 py-1 rounded-full"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
              {permissions?.permissions?.length || 0} rules
            </span>
          </div>

          {#if !permissions?.permissions || permissions.permissions.length === 0}
            <div class="text-center py-6 rounded-lg" style="background: {$colorStore.primary}05;">
              <i class="fa-utility-duo fa-regular fa-shield-halved"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 32px; opacity: 0.5;"></i>
              <p class="text-sm mt-2" style="color: {$colorStore.muted}">No custom permissions configured</p>
              <p class="text-xs" style="color: {$colorStore.muted}">Use bot commands to manage permissions</p>
            </div>
          {:else}
            <div class="space-y-2 max-h-96 overflow-y-auto">
              {#each permissions.permissions as perm, index (index)}
                <div class="flex items-center justify-between p-3 rounded-lg border"
                     style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                  <div class="flex-1">
                    <p class="text-sm font-mono" style="color: {$colorStore.text}">
                      #{index}: {perm.permissionType || perm.type || 'Unknown'}
                    </p>
                    <p class="text-xs" style="color: {$colorStore.muted}">
                      {JSON.stringify(perm, null, 2).substring(0, 100)}...
                    </p>
                  </div>
                  {#if index === 0}
                    <span class="px-3 py-1 rounded-lg text-xs"
                          style="background: {$colorStore.muted}20; color: {$colorStore.muted};">
                      <i class="fa-solid fa-lock"></i> Protected
                    </span>
                  {:else}
                    <button
                      class="px-3 py-1 rounded-lg text-sm transition-all hover:scale-[1.02]"
                      style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                      onclick={() => showConfirm("Remove Permission", `Remove permission #${index}?`, () => removePermission(index))}
                    >
                      Remove
                    </button>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}

          <div class="p-4 rounded-xl border"
               style="background: {$colorStore.secondary}05; border-color: {$colorStore.secondary}30;">
            <p class="text-sm" style="color: {$colorStore.text}">
              <i class="fa-solid fa-info-circle mr-2"></i>
              <strong>Note:</strong> Use bot text commands to add new permission rules. The permission system is complex
              and requires command-based configuration for safety.
            </p>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="text-center py-8">
      <p class="text-sm" style="color: {$colorStore.muted}">Click "Manage" to load permissions</p>
    </div>
  {/if}
</div>
