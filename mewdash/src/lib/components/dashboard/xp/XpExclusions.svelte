<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  interface Props {
    excludedChannels?: string[];
    excludedRoles?: string[];
    guildChannels?: any[];
    guildRoles?: any[];
    loading?: boolean;
    error?: string | null;
    onExcludeChannel: (channelId: string) => void;
    onIncludeChannel: (channelId: string) => void;
    onExcludeRole: (roleId: string) => void;
    onIncludeRole: (roleId: string) => void;
  }

  let {
    excludedChannels = [],
    excludedRoles = [],
    guildChannels = [],
    guildRoles = [],
    loading = false,
    error = null,
    onExcludeChannel,
    onIncludeChannel,
    onExcludeRole,
    onIncludeRole
  }: Props = $props();

  let selectedChannelId = $state("");
  let selectedRoleId = $state("");

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

  let channelOptions = $derived(guildChannels.map(channel => ({
    id: channel.id,
    name: channel.name
  })));

  let roleOptions = $derived(guildRoles.map(role => ({
    id: role.id,
    name: role.name,
    color: role.color
  })));
</script>

<div class="flex items-center gap-3 mb-6">
  <div
    class="p-3 rounded-xl"
    style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
           color: {$colorStore.primary};"
  >
    <i aria-hidden="true"
       class="fa-utility-duo fa-regular fa-database"
       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
  </div>
  <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.xp.exclusionsTitle()}</h2>
</div>

{#if loading}
  <div class="flex justify-center items-center min-h-[200px]">
    <div
      class="w-12 h-12 border-4 rounded-full animate-spin"
      style="border-color: {$colorStore.primary}20;
             border-top-color: {$colorStore.primary};"
      aria-label={m.common.loading()}
    >
    </div>
  </div>
{:else if error}
  <div
    class="rounded-xl p-4 flex items-center gap-3"
    style="background: {$colorStore.accent}10;"
    role="alert"
  >
    <i class="fa-utility-duo fa-regular fa-bell"
       style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"
       aria-hidden="true"></i>
    <p style="color: {$colorStore.accent}">{error}</p>
  </div>
{:else}
  <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
    <!-- Excluded Channels -->
    <div
      class="rounded-xl p-4 h-full flex flex-col"
      style="background: {$colorStore.primary}10;"
    >
      <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">{m.xp.exclusionsChannelsTitle()}</h3>

      <!-- Add Excluded Channel Form -->
      <div class="mb-6 p-4 rounded-lg" style="background: {$colorStore.primary}15;">
        <h4 class="text-sm font-medium mb-3" style="color: {$colorStore.muted}">{m.xp.exclusionsChannelForm()}</h4>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <DiscordSelector
              type="channel"
              options={channelOptions}
              selected={selectedChannelId}
              placeholder={m.common.selectChannelPlaceholder()}
              onchange={(detail) => {
                if (detail.selected && typeof detail.selected === 'string') {
                  selectedChannelId = detail.selected;
                }
              }}
            />
          </div>
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 min-h-[50px] sm:min-h-[44px]"
            disabled={!selectedChannelId}
            onclick={handleExcludeChannel}
            style="background: {$colorStore.primary}20;
                   color: {$colorStore.text};"
            aria-label={m.xp.exclusionsExcludeChannelAria()}
          >
            {m.xp.exclusionsExclude()}
          </button>
        </div>
        <p class="mt-2 text-xs" style="color: {$colorStore.muted}">
          {m.xp.exclusionsChannelHint()}
        </p>
      </div>

      <!-- Excluded Channels List -->
      {#if excludedChannels.length === 0}
        <div class="text-center py-4" style="color: {$colorStore.muted}">
          {m.xp.exclusionsNoChannels()}
        </div>
      {:else}
        <ul class="space-y-2">
          {#each excludedChannels as channelId (channelId)}
            <li
              class="flex items-center justify-between p-3 rounded-lg"
              style="background: {$colorStore.primary}15;"
            >
              <span class="truncate flex-1 min-w-0" style="color: {$colorStore.text}">
                #{guildChannels.find(c => c.id === channelId.toString())?.name || m.common.channelIdLabel({ id: channelId })}
              </span>
              <button
                      class="p-2 rounded-full transition-all duration-200 shrink-0 ml-2 min-w-[44px] min-h-[44px]"
                style="background: {$colorStore.accent}20;
                       color: {$colorStore.accent};"
                onclick={() => onIncludeChannel(channelId)}
                aria-label={m.xp.exclusionsIncludeChannelAria({ name: guildChannels.find(c => c.id === channelId.toString())?.name || channelId })}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2}
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
      <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">{m.common.excludedRoles()}</h3>

      <!-- Add Excluded Role Form -->
      <div class="mb-6 p-4 rounded-lg" style="background: {$colorStore.secondary}15;">
        <h4 class="text-sm font-medium mb-3" style="color: {$colorStore.muted}">{m.xp.exclusionsRoleForm()}</h4>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <DiscordSelector
              type="role"
              options={roleOptions}
              selected={selectedRoleId}
              placeholder={m.common.selectRolePlaceholder()}
              onchange={(detail) => {
                if (detail.selected && typeof detail.selected === 'string') {
                  selectedRoleId = detail.selected;
                }
              }}
            />
          </div>
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 min-h-[50px] sm:min-h-[44px]"
            disabled={!selectedRoleId}
            onclick={handleExcludeRole}
            style="background: {$colorStore.secondary}20;
                   color: {$colorStore.text};"
            aria-label={m.xp.exclusionsExcludeRoleAria()}
          >
            {m.xp.exclusionsExclude()}
          </button>
        </div>
        <p class="mt-2 text-xs" style="color: {$colorStore.muted}">
          {m.xp.exclusionsRoleHint()}
        </p>
      </div>

      <!-- Excluded Roles List -->
      {#if excludedRoles.length === 0}
        <div class="text-center py-4" style="color: {$colorStore.muted}">
          {m.xp.exclusionsNoRoles()}
        </div>
      {:else}
        <ul class="space-y-2">
          {#each excludedRoles as roleId (roleId)}
            <li
              class="flex items-center justify-between p-3 rounded-lg"
              style="background: {$colorStore.secondary}15;"
            >
              <span class="truncate flex-1 min-w-0" style="color: {$colorStore.text}">
                @{guildRoles.find(r => r.id === roleId.toString())?.name || m.common.roleIdLabel({ id: roleId })}
              </span>
              <button
                      class="p-2 rounded-full transition-all duration-200 shrink-0 ml-2 min-w-[44px] min-h-[44px]"
                style="background: {$colorStore.accent}20;
                       color: {$colorStore.accent};"
                onclick={() => onIncludeRole(roleId)}
                aria-label={m.xp.exclusionsIncludeRoleAria({ name: guildRoles.find(r => r.id === roleId.toString())?.name || roleId })}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2}
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