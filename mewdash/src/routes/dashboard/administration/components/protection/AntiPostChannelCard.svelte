<script lang="ts">
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { administrationApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";

  let {
    protectionStatus,
    expandedProtectionCard = $bindable(),
    tempProtectionConfig = $bindable(),
    selectedHoneypotChannels = $bindable(),
    selectedIgnoredRoles = $bindable(),
    selectedIgnoredUsers = $bindable(),
    actionOptions,
    textChannels,
    availableRoles,
    saving,
    toggleProtection,
    toggleProtectionCard,
    cancelProtectionEdit,
    saveProtectionConfig,
    saveHoneypotChannels,
    saveIgnoredRoles,
    addIgnoredUser,
    fetchAllData
  } = $props();
</script>

<div class="backdrop-blur-xs rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 600 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div class="flex items-center gap-4">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-hand"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Anti-Post-Channel</h2>
        <p class="text-sm" style="color: {$colorStore.muted}">Honeypot channels for auto-banning</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
        onclick={() => toggleProtection('antiPostChannel')}
        style="background: {protectionStatus.antiPostChannel.enabled ? $colorStore.accent + '20' : $colorStore.secondary + '20'};
               color: {protectionStatus.antiPostChannel.enabled ? $colorStore.accent : $colorStore.secondary};
               border: 1px solid {protectionStatus.antiPostChannel.enabled ? $colorStore.accent + '30' : $colorStore.secondary + '30'};"
      >
        {#if protectionStatus.antiPostChannel.enabled}
          <i class="fa-solid fa-toggle-on" style="font-size: 16px;"></i>
          Enabled
        {:else}
          <i class="fa-solid fa-toggle-off" style="font-size: 16px;"></i>
          Disabled
        {/if}
      </button>

      {#if protectionStatus.antiPostChannel.enabled}
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
          onclick={() => toggleProtectionCard('antiPostChannel')}
        >
          {#if expandedProtectionCard === 'antiPostChannel'}
            <i class="fa-solid fa-chevron-up" style="font-size: 16px;"></i>
          {:else}
            <i class="fa-solid fa-chevron-down" style="font-size: 16px;"></i>
          {/if}
          {expandedProtectionCard === 'antiPostChannel' ? 'Collapse' : 'Configure'}
        </button>
      {/if}
    </div>
  </div>

  {#if protectionStatus.antiPostChannel.enabled}
    <div class="grid grid-cols-2 gap-4 p-4 rounded-xl" style="background: {$colorStore.primary}05;">
      <div class="text-center">
        <div class="text-2xl font-bold"
             style="color: {$colorStore.primary}">{protectionStatus.antiPostChannel.channelCount}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">Honeypot Channels</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold"
             style="color: {$colorStore.primary}">{protectionStatus.antiPostChannel.counter}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">Triggers</div>
      </div>
    </div>

    {#if expandedProtectionCard === 'antiPostChannel'}
      <div class="mt-6 p-6 rounded-xl border-2 space-y-6 transition-all"
           style="background: {$colorStore.gradientStart}08; border-color: {$colorStore.accent}40;"
           in:slide={{ duration: 300 }}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span id="apc-action-label" class="block text-sm font-medium mb-2"
                  style="color: {$colorStore.text}">Action</span>
            <DiscordSelector
              type="custom"
              options={actionOptions}
              bind:selected={tempProtectionConfig.action}
              placeholder="Select action..."
            />
          </div>
          <div>
            <label for="apc-punish-duration" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Punishment
              Duration (minutes)</label>
            <input id="apc-punish-duration"
                   type="number"
                   bind:value={tempProtectionConfig.punishDuration}
                   class="w-full px-3 py-2 rounded-lg border transition-colors"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="0"
                   max="1440"
            >
          </div>

          <!-- Honeypot Channels -->
          <div class="col-span-full space-y-2">
            <label class="block text-sm font-medium" style="color: {$colorStore.text}">
              Honeypot Channels
              <span class="text-xs" style="color: {$colorStore.muted}">Channels that will auto-ban anyone who posts in them</span>
            </label>
            <DiscordSelector
              type="channel"
              options={textChannels.map((c: any) => ({ id: c.id, name: c.name, type: 0 }))}
              bind:selected={selectedHoneypotChannels}
              multiple={true}
              placeholder="Select honeypot channels..."
            />
            <button
              class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              style="background: {$colorStore.primary}15; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={saveHoneypotChannels}
              disabled={saving}
            >
              {#if saving}
                <i class="fa-solid fa-spinner fa-spin"></i>
              {:else}
                <i class="fa-solid fa-save"></i>
              {/if}
              <span>Save Channels</span>
            </button>
          </div>

          <!-- Ignored Roles -->
          <div class="col-span-full space-y-2">
            <label class="block text-sm font-medium" style="color: {$colorStore.text}">
              Ignored Roles
              <span class="text-xs" style="color: {$colorStore.muted}">Users with these roles can post in honeypot channels</span>
            </label>
            <DiscordSelector
              type="role"
              options={availableRoles}
              bind:selected={selectedIgnoredRoles}
              multiple={true}
              placeholder="Select roles to ignore..."
            />
            <button
              class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              style="background: {$colorStore.primary}15; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={saveIgnoredRoles}
              disabled={saving}
            >
              {#if saving}
                <i class="fa-solid fa-spinner fa-spin"></i>
              {:else}
                <i class="fa-solid fa-save"></i>
              {/if}
              <span>Save Roles</span>
            </button>
          </div>

          <!-- Ignored Users -->
          <div class="col-span-full space-y-2">
            <label class="block text-sm font-medium" style="color: {$colorStore.text}">
              Ignored Users
              <span class="text-xs"
                    style="color: {$colorStore.muted}">Specific users who can post in honeypot channels</span>
            </label>
            <div class="flex gap-2">
              <input
                type="text"
                bind:value={selectedIgnoredUsers}
                placeholder="Enter user ID..."
                class="flex-1 px-4 py-2 rounded-lg border transition-colors"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              />
              <button
                class="px-6 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
                style="background: {$colorStore.primary}15; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                onclick={addIgnoredUser}
                disabled={!selectedIgnoredUsers || saving}
              >
                {#if saving}
                  <i class="fa-solid fa-spinner fa-spin"></i>
                {:else}
                  <i class="fa-solid fa-plus"></i>
                {/if}
                <span>Add</span>
              </button>
            </div>
            {#if protectionStatus.antiPostChannel.ignoredUsers?.length > 0}
              <div class="space-y-1 mt-2">
                {#each protectionStatus.antiPostChannel.ignoredUsers as userId}
                  <div class="flex items-center justify-between px-3 py-2 rounded-lg"
                       style="background: {$colorStore.primary}08;">
                    <span class="text-sm" style="color: {$colorStore.text}">{userId.toString()}</span>
                    <button
                      class="px-2 py-1 rounded transition-all hover:scale-110"
                      style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                      onclick={() => $currentGuild && administrationApi.toggleAntiPostChannelIgnoredUser($currentGuild.id, userId).then(() => fetchAllData())}
                    >
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            onclick={cancelProtectionEdit}
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
            onclick={saveProtectionConfig}
            disabled={saving}
          >
            <div class="flex items-center justify-center gap-2">
              {#if saving}
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 14px;"></i>
              {:else}
                <i class="fa-solid fa-save" style="font-size: 14px;"></i>
              {/if}
              <span>Save</span>
            </div>
          </button>
        </div>
      </div>
    {/if}
  {:else}
    <div class="text-center py-8">
      <i class="fa-utility-duo fa-regular fa-hand"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
      <p class="text-lg font-medium" style="color: {$colorStore.text}">Anti-Post-Channel Protection Disabled</p>
      <p class="text-sm" style="color: {$colorStore.muted}">Enable to create honeypot channels that auto-ban posters</p>
    </div>
  {/if}
</div>
