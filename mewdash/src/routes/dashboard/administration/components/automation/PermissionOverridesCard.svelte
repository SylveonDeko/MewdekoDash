<script lang="ts">
  import { m } from "$lib/i18n";
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
      <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.administration.automationPermissionOverridesTitle()}</h2>
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
        {expandedRoleCard === 'permissionOverride' ? m.common.collapse() : m.administration.automationPermissionOverridesAdd()}
      </button>

      {#if selectedPermissionOverrides.length > 0}
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
          style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
          onclick={() => showConfirm(m.administration.automationPermissionOverridesDeleteSelectedTitle(), selectedPermissionOverrides.length > 1 ? m.administration.automationPermissionOverridesDeleteSelectedConfirmOther({ count: selectedPermissionOverrides.length }) : m.administration.automationPermissionOverridesDeleteSelectedConfirmOne({ count: selectedPermissionOverrides.length }), deleteSelectedPermissionOverrides)}
        >
          <i class="fa-solid fa-trash" style="font-size: 16px;"></i>
          {m.administration.automationPermissionOverridesDeleteSelected({ count: selectedPermissionOverrides.length })}
        </button>
      {/if}

      {#if permissionOverrides.length > 0}
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
          style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
          onclick={() => showConfirm(m.administration.automationPermissionOverridesClearAllTitle(), m.administration.automationPermissionOverridesClearAllConfirm(), resetPermissionOverrides)}
        >
          <i class="fa-solid fa-trash" style="font-size: 16px;"></i>
          {m.common.clearAll()}
        </button>
      {/if}
    </div>
  </div>

  <div class="space-y-4">
    <p class="text-sm" style="color: {$colorStore.muted}">
      {m.administration.automationPermissionOverridesDescription({ count: availableCommands.length })}
    </p>

    {#if permissionOverrides.length === 0}
      <div class="text-center py-8">
        <i class="fa-utility-duo fa-regular fa-key"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
        <p class="text-lg font-medium" style="color: {$colorStore.text}">{m.administration.automationPermissionOverridesEmptyTitle()}</p>
        <p class="text-sm" style="color: {$colorStore.muted}">{m.administration.automationPermissionOverridesEmptyHint()}</p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each permissionOverrides as override (override.command)}
          <div class="flex items-center justify-between p-4 rounded-lg border"
               style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
            <div>
              <p class="font-medium" style="color: {$colorStore.text}">{override.command}</p>
              <p class="text-sm" style="color: {$colorStore.muted}">{m.administration.automationPermissionOverridesRequires({ permission: override.permission })}</p>
            </div>
            <button
              class="px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
              style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
              onclick={() => removePermissionOverride(override.command, override.permission)}
            >
              {m.common.remove()}
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
          <h5 class="font-medium mb-3" style="color: {$colorStore.text}">{m.administration.automationPermissionOverridesFormTitle()}</h5>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span id="bot-command-label"
                    class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                {m.administration.automationPermissionOverridesBotCommand({ count: availableCommands.length })}
              </span>
              <DiscordSelector
                type="custom"
                options={availableCommands}
                bind:selected={newPermissionOverride.command}
                placeholder={m.administration.automationPermissionOverridesCommandPlaceholder()}
                searchable={true}
                multiple={false}
              />
            </div>

            <div>
              <span id="required-permission-label" class="block text-sm font-medium mb-2"
                    style="color: {$colorStore.text}">{m.administration.automationPermissionOverridesRequiredPermission()}</span>
              <DiscordSelector
                type="custom"
                options={availablePermissions}
                bind:selected={newPermissionOverride.permission}
                placeholder={m.common.selectRequiredPermissionPlaceholder()}
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
              {m.common.cancel()}
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
              {m.administration.automationPermissionOverridesAdd()}
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
