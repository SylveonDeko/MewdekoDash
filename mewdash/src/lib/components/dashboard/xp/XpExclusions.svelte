<script lang="ts">
  import { AlertCircle, Database } from "lucide-svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  export let excludedChannels: string[] = [];
  export let excludedRoles: string[] = [];
  export let guildChannels: any[] = [];
  export let guildRoles: any[] = [];
  export let loading: boolean = false;
  export let error: string | null = null;
  export let onExcludeChannel: (channelId: string) => void;
  export let onIncludeChannel: (channelId: string) => void;
  export let onExcludeRole: (roleId: string) => void;
  export let onIncludeRole: (roleId: string) => void;

  let selectedChannelId = "";
  let selectedRoleId = "";

  function handleExcludeChannel() {
    if (selectedChannelId) {
      onExcludeChannel(selectedChannelId);
      selectedChannelId = "";
    }
  }

  function handleExcludeRole() {
    if (selectedRoleId) {
      onExcludeRole(selectedRoleId);
      selectedRoleId = "";
    }
  }

  $: channelOptions = guildChannels.map(channel => ({
    id: channel.id,
    name: channel.name
  }));

  $: roleOptions = guildRoles.map(role => ({
    id: role.id,
    name: role.name,
    color: role.color
  }));
</script>

<div class="flex items-center gap-3 mb-6">
  <div
    class="p-3 rounded-xl"
    style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
           color: {$colorStore.primary};"
  >
    <Database aria-hidden="true" class="w-6 h-6" />
  </div>
  <h2 class="text-xl font-bold" style="color: {$colorStore.text}">XP Exclusions</h2>
</div>

{#if loading}
  <div class="flex justify-center items-center min-h-[200px]">
    <div
      class="w-12 h-12 border-4 rounded-full animate-spin"
      style="border-color: {$colorStore.primary}20;
             border-top-color: {$colorStore.primary};"
      aria-label="Loading"
    >
    </div>
  </div>
{:else if error}
  <div
    class="rounded-xl p-4 flex items-center gap-3"
    style="background: {$colorStore.accent}10;"
    role="alert"
  >
    <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
    <p style="color: {$colorStore.accent}">{error}</p>
  </div>
{:else}
  <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
    <!-- Excluded Channels -->
    <div
      class="rounded-xl p-4 h-full flex flex-col"
      style="background: {$colorStore.primary}10;"
    >
      <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">Excluded Channels</h3>

      <!-- Add Excluded Channel Form -->
      <div class="mb-6 p-4 rounded-lg" style="background: {$colorStore.primary}15;">
        <h4 class="text-sm font-medium mb-3" style="color: {$colorStore.muted}">Exclude Channel from XP</h4>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <DiscordSelector
              type="channel"
              options={channelOptions}
              selected={selectedChannelId}
              placeholder="Select Channel"
              on:change={(e) => selectedChannelId = e.detail.selected}
            />
          </div>
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 min-h-[50px] sm:min-h-[44px]"
            disabled={!selectedChannelId}
            on:click={handleExcludeChannel}
            style="background: {$colorStore.primary}20;
                   color: {$colorStore.text};"
            aria-label="Exclude selected channel"
          >
            Exclude
          </button>
        </div>
        <p class="mt-2 text-xs" style="color: {$colorStore.muted}">
          Users won't earn XP from messages in excluded channels.
        </p>
      </div>

      <!-- Excluded Channels List -->
      {#if excludedChannels.length === 0}
        <div class="text-center py-4" style="color: {$colorStore.muted}">
          No excluded channels
        </div>
      {:else}
        <ul class="space-y-2">
          {#each excludedChannels as channelId}
            <li
              class="flex items-center justify-between p-3 rounded-lg"
              style="background: {$colorStore.primary}15;"
            >
              <span class="truncate flex-1 min-w-0" style="color: {$colorStore.text}">
                #{guildChannels.find(c => c.id === channelId.toString())?.name || `Channel ID: ${channelId}`}
              </span>
              <button
                class="p-2 rounded-full transition-all duration-200 flex-shrink-0 ml-2 min-w-[44px] min-h-[44px]"
                style="background: {$colorStore.accent}20;
                       color: {$colorStore.accent};"
                on:click={() => onIncludeChannel(channelId)}
                aria-label={`Include channel ${guildChannels.find(c => c.id === channelId.toString())?.name || channelId}`}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <!-- Excluded Roles -->
    <div
      class="rounded-xl p-4 h-full flex flex-col"
      style="background: {$colorStore.secondary}10;"
    >
      <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">Excluded Roles</h3>

      <!-- Add Excluded Role Form -->
      <div class="mb-6 p-4 rounded-lg" style="background: {$colorStore.secondary}15;">
        <h4 class="text-sm font-medium mb-3" style="color: {$colorStore.muted}">Exclude Role from XP</h4>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <DiscordSelector
              type="role"
              options={roleOptions}
              selected={selectedRoleId}
              placeholder="Select Role"
              on:change={(e) => selectedRoleId = e.detail.selected}
            />
          </div>
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 min-h-[50px] sm:min-h-[44px]"
            disabled={!selectedRoleId}
            on:click={handleExcludeRole}
            style="background: {$colorStore.secondary}20;
                   color: {$colorStore.text};"
            aria-label="Exclude selected role"
          >
            Exclude
          </button>
        </div>
        <p class="mt-2 text-xs" style="color: {$colorStore.muted}">
          Users with excluded roles won't earn XP from any source.
        </p>
      </div>

      <!-- Excluded Roles List -->
      {#if excludedRoles.length === 0}
        <div class="text-center py-4" style="color: {$colorStore.muted}">
          No excluded roles
        </div>
      {:else}
        <ul class="space-y-2">
          {#each excludedRoles as roleId}
            <li
              class="flex items-center justify-between p-3 rounded-lg"
              style="background: {$colorStore.secondary}15;"
            >
              <span class="truncate flex-1 min-w-0" style="color: {$colorStore.text}">
                @{guildRoles.find(r => r.id === roleId.toString())?.name || `Role ID: ${roleId}`}
              </span>
              <button
                class="p-2 rounded-full transition-all duration-200 flex-shrink-0 ml-2 min-w-[44px] min-h-[44px]"
                style="background: {$colorStore.accent}20;
                       color: {$colorStore.accent};"
                on:click={() => onIncludeRole(roleId)}
                aria-label={`Include role ${guildRoles.find(r => r.id === roleId.toString())?.name || roleId}`}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
{/if}