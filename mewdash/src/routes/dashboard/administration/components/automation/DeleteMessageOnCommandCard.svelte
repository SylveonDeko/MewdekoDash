<script lang="ts">
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { administrationApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";

  let {
    textChannels,
    fetchAllData
  } = $props();

  let deleteMessageOnCommand: any = $state({ enabled: false, channels: [] });
  let loading = $state(false);
  let saving = $state(false);
  let expanded = $state(false);
  let selectedChannel: string | null = $state(null);
  let channelState = $state("enable");

  async function loadSettings() {
    if (!$currentGuild?.id) return;

    try {
      loading = true;
      deleteMessageOnCommand = await administrationApi.getDeleteMessageOnCommand($currentGuild.id);
    } catch (err) {
      logger.error("Failed to load delete message settings:", err);
    } finally {
      loading = false;
    }
  }

  async function toggleGlobal() {
    if (!$currentGuild?.id) return;

    try {
      saving = true;
      const newState = await administrationApi.toggleDeleteMessageOnCommand($currentGuild.id);
      await loadSettings();
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to toggle delete message on command:", err);
    } finally {
      saving = false;
    }
  }

  async function setChannelState() {
    if (!$currentGuild?.id || !selectedChannel) return;

    try {
      saving = true;
      await administrationApi.setDeleteMessageOnCommandChannel($currentGuild.id, {
        channelId: BigInt(selectedChannel),
        state: channelState
      });
      selectedChannel = null;
      await loadSettings();
    } catch (err) {
      logger.error("Failed to set channel state:", err);
    } finally {
      saving = false;
    }
  }

  $effect(() => {
    if ($currentGuild?.id) {
      loadSettings();
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
        <i class="fa-utility-duo fa-regular fa-message-slash"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Delete Message on Command</h2>
        <p class="text-sm" style="color: {$colorStore.muted}">Auto-delete command messages</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
        disabled={saving}
        onclick={toggleGlobal}
        style="background: {deleteMessageOnCommand.enabled ? $colorStore.accent + '20' : $colorStore.secondary + '20'};
               color: {deleteMessageOnCommand.enabled ? $colorStore.accent : $colorStore.secondary};
               border: 1px solid {deleteMessageOnCommand.enabled ? $colorStore.accent + '30' : $colorStore.secondary + '30'};"
      >
        {#if deleteMessageOnCommand.enabled}
          <i class="fa-solid fa-toggle-on" style="font-size: 16px;"></i>
          Enabled
        {:else}
          <i class="fa-solid fa-toggle-off" style="font-size: 16px;"></i>
          Disabled
        {/if}
      </button>

      {#if deleteMessageOnCommand.enabled}
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
          onclick={() => expanded = !expanded}
        >
          {#if expanded}
            <i class="fa-solid fa-chevron-up" style="font-size: 16px;"></i>
          {:else}
            <i class="fa-solid fa-chevron-down" style="font-size: 16px;"></i>
          {/if}
          {expanded ? 'Collapse' : 'Configure Channels'}
        </button>
      {/if}
    </div>
  </div>

  {#if deleteMessageOnCommand.enabled}
    <div class="p-4 rounded-xl" style="background: {$colorStore.primary}05;">
      <p class="text-sm" style="color: {$colorStore.muted}">
        Command messages will be automatically deleted. Configure per-channel overrides below.
      </p>
    </div>

    {#if expanded}
      <div transition:slide={{ duration: 300 }} class="mt-6 pt-6 border-t space-y-4"
           style="border-color: {$colorStore.primary}20;">
        <h4 class="font-medium" style="color: {$colorStore.text}">Channel-Specific Settings</h4>

        <!-- Add channel override -->
        <div class="p-4 rounded-xl border-2 border-dashed"
             style="border-color: {$colorStore.secondary}30; background: {$colorStore.secondary}05;">
          <h5 class="font-medium mb-3" style="color: {$colorStore.text}">Set Channel Override</h5>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Channel</span>
              <DiscordSelector
                type="channel"
                options={textChannels}
                bind:selected={selectedChannel}
                placeholder="Select channel..."
                multiple={false}
              />
            </div>

            <div>
              <span class="block text-sm font-medium mb-2"
                    style="color: {$colorStore.text}">State</span>
              <DiscordSelector
                type="custom"
                customIcon="fa-gear"
                options={[
                  { id: "enable", name: "Enable (Always delete)" },
                  { id: "disable", name: "Disable (Never delete)" },
                  { id: "inherit", name: "Inherit (Use global setting)" }
                ]}
                bind:selected={channelState}
                placeholder="Select state..."
                searchable={false}
              />
            </div>
          </div>

          <button
            class="w-full mt-4 px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
            onclick={setChannelState}
            disabled={!selectedChannel || saving}
          >
            {#if saving}
              <i class="fa-solid fa-spinner fa-spin"></i>
            {:else}
              <i class="fa-solid fa-plus"></i>
            {/if}
            Set Channel Override
          </button>
        </div>

        <!-- Show existing channel overrides -->
        {#if deleteMessageOnCommand.channels?.length > 0}
          <div class="space-y-2">
            <h5 class="font-medium text-sm" style="color: {$colorStore.text}">Channel Overrides</h5>
            {#each deleteMessageOnCommand.channels as channel}
              <div class="flex items-center justify-between p-3 rounded-lg border"
                   style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <span style="color: {$colorStore.text}">Channel ID: {channel.channelId.toString()}</span>
                <span class="text-xs px-2 py-1 rounded-full"
                      style="background: {channel.state ? $colorStore.secondary + '20' : $colorStore.muted + '20'};
                             color: {channel.state ? $colorStore.secondary : $colorStore.muted}">
                  {channel.state ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {:else}
    <div class="text-center py-8">
      <i class="fa-utility-duo fa-regular fa-message-slash"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
      <p class="text-lg font-medium mt-4" style="color: {$colorStore.text}">Delete Message on Command Disabled</p>
      <p class="text-sm" style="color: {$colorStore.muted}">Enable to auto-delete command messages</p>
    </div>
  {/if}
</div>
