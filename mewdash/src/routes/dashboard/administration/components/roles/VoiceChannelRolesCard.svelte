<script lang="ts">
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  let {
    voiceChannelRoles,
    expandedRoleCard = $bindable(),
    newVoiceChannelRole = $bindable(),
    voiceChannels,
    availableRoles,
    saving,
    showConfirm,
    removeVoiceChannelRole,
    addVoiceChannelRole
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
        <i class="fa-utility-duo fa-regular fa-volume"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Voice Channel Roles</h2>
    </div>

    <button
      class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
      onclick={() => expandedRoleCard = expandedRoleCard === 'voiceChannel' ? null : 'voiceChannel'}
      style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
    >
      {#if expandedRoleCard === 'voiceChannel'}
        <i class="fa-solid fa-chevron-up" style="font-size: 16px;"></i>
      {:else}
        <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
      {/if}
      {expandedRoleCard === 'voiceChannel' ? 'Collapse' : 'Add Mapping'}
    </button>
  </div>

  <div class="space-y-4">
    <p class="text-sm" style="color: {$colorStore.muted}">
      Automatically assign roles when users join specific voice channels
    </p>

    {#if voiceChannelRoles.length === 0}
      <div class="text-center py-8">
        <i class="fa-utility-duo fa-regular fa-volume"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
        <p class="text-lg font-medium mt-4" style="color: {$colorStore.text}">No voice channel roles configured</p>
        <p class="text-sm" style="color: {$colorStore.muted}">Add voice channel to role mappings</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each voiceChannelRoles as vcRole (vcRole.channelId)}
          <div
            class="flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:shadow-lg  border"
            style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
            <div class="space-y-1">
              <p class="font-medium" style="color: {$colorStore.text}">
                🔊 {vcRole.channelName}
              </p>
              <p class="text-sm" style="color: {$colorStore.muted}">
                → {vcRole.roleName}
              </p>
            </div>
            <button
              class="px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80"
              style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
              onclick={() => showConfirm("Remove Voice Channel Role", `Remove role mapping for ${vcRole.channelName}?`, () => removeVoiceChannelRole(vcRole.channelId))}
              aria-label="Remove voice channel role mapping for {vcRole.channelName}"
            >
              Remove
            </button>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Inline Add Voice Channel Role Form -->
    {#if expandedRoleCard === 'voiceChannel'}
      <div transition:slide={{ duration: 300 }} class="mt-4 pt-4 border-t"
           style="border-color: {$colorStore.primary}20;">
        <div class="p-4 rounded-xl border-2 border-dashed"
             style="border-color: {$colorStore.secondary}30; background: {$colorStore.secondary}05;">
          <h5 class="font-medium mb-3" style="color: {$colorStore.text}">Add Voice Channel Role Mapping</h5>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span id="voice-channel-label" class="block text-sm font-medium mb-2"
                    style="color: {$colorStore.text}">Voice Channel</span>
              <DiscordSelector
                type="channel"
                options={voiceChannels}
                bind:selected={newVoiceChannelRole.channelId}
                placeholder="Select voice channel..."
                multiple={false}
              />
            </div>

            <div>
              <span id="role-to-assign-label" class="block text-sm font-medium mb-2"
                    style="color: {$colorStore.text}">Role to Assign</span>
              <DiscordSelector
                type="role"
                options={availableRoles}
                bind:selected={newVoiceChannelRole.roleId}
                placeholder="Select role..."
                multiple={false}
              />
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
              style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
              onclick={() => { expandedRoleCard = null; newVoiceChannelRole = { channelId: null, roleId: null }; }}
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
              onclick={addVoiceChannelRole}
              disabled={!newVoiceChannelRole.channelId || !newVoiceChannelRole.roleId || saving}
            >
              {#if saving}
                <i class="fa-solid fa-rotate-right animate-spin" style="font-size: 16px;"></i>
              {:else}
                <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
              {/if}
              Add Mapping
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
