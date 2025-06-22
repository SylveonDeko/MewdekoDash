<!-- routes/dashboard/administration/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { AlertTriangle, Bot, CheckCircle, Settings, Shield, UserCheck, Users } from "lucide-svelte";
  import { fly } from "svelte/transition";

  export let data;

  let loading = true;
  let error: string | null = null;

  // Auto-assign roles
  let autoAssignRoles = { normalRoles: [], botRoles: [] };
  let availableRoles: any[] = [];

  // Protection settings - Initialize with proper default structure
  let protectionStatus: any = {
    antiRaid: { enabled: false },
    antiSpam: { enabled: false },
    antiAlt: { enabled: false },
    antiMassMention: { enabled: false }
  };

  // Self-assignable roles
  let selfAssignableRoles: any[] = [];

  async function fetchAdministrationData() {
    if (!$currentGuild?.id) return;

    try {
      loading = true;

      const [autoAssignData, protectionData, selfAssignData, rolesData] = await Promise.all([
        api.getAutoAssignRoles($currentGuild.id),
        api.getProtectionStatus($currentGuild.id),
        api.getSelfAssignableRoles($currentGuild.id),
        api.getGuildRoles($currentGuild.id)
      ]);

      // FIX: Ensure autoAssignRoles and its properties are always arrays.
      autoAssignRoles = {
        normalRoles: autoAssignData?.normalRoles || [],
        botRoles: autoAssignData?.botRoles || []
      };

      // Ensure protectionStatus has the correct structure even if API returns null/undefined
      protectionStatus = protectionData || {
        antiRaid: { enabled: false },
        antiSpam: { enabled: false },
        antiAlt: { enabled: false },
        antiMassMention: { enabled: false }
      };
      selfAssignableRoles = selfAssignData || [];
      availableRoles = rolesData || [];

    } catch (err) {
      logger.error("Failed to fetch administration data:", err);
      error = "Failed to load administration data";
      // Ensure all data has safe defaults even on error
      autoAssignRoles = { normalRoles: [], botRoles: [] };
      selfAssignableRoles = [];
      protectionStatus = {
        antiRaid: { enabled: false },
        antiSpam: { enabled: false },
        antiAlt: { enabled: false },
        antiMassMention: { enabled: false }
      };
    } finally {
      loading = false;
    }
  }

  function getRoleName(roleId: bigint): string {
    const role = availableRoles.find(r => BigInt(r.id) === roleId);
    return role ? role.name : `Role ${roleId}`;
  }

  function formatAction(action: number): string {
    const actions = ["None", "Warn", "Mute", "Kick", "Ban", "Softban"];
    return actions[action] || "Unknown";
  }

  function formatDuration(minutes: number): string {
    if (minutes === 0) return "Permanent";
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
  }

  async function toggleProtection(type: string) {
    if (!$currentGuild?.id || !protectionStatus) return;

    try {
      if (type === "antiRaid") {
        if (protectionStatus.antiRaid?.enabled) {
          await api.stopAntiRaid($currentGuild.id);
        } else {
          // Simple default settings - you might want to make this configurable
          await api.startAntiRaid($currentGuild.id, 5, 10, 1); // 5 users in 10 seconds, warn action
        }
      } else if (type === "antiSpam") {
        if (protectionStatus.antiSpam?.enabled) {
          await api.stopAntiSpam($currentGuild.id);
        } else {
          // Simple default settings
          await api.startAntiSpam($currentGuild.id, 5, 2, BigInt(0)); // 5 messages, mute action, no role
        }
      }

      // Refresh data
      await fetchAdministrationData();
    } catch (err) {
      logger.error(`Failed to toggle ${type}:`, err);
    }
  }

  onMount(() => {
    fetchAdministrationData();
  });

  $: if ($currentGuild) {
    fetchAdministrationData();
  }
</script>

<div class="min-h-screen p-4 md:p-6 overflow-x-hidden w-full transition-all duration-500"
     style="background: radial-gradient(circle at top,
       {$colorStore.gradientStart}15 0%,
       {$colorStore.gradientMid}10 50%,
       {$colorStore.gradientEnd}05 100%);">

  <div class="max-w-7xl mx-auto space-y-8">

    <!-- Page Header -->
    <div class="mb-8" in:fly={{ y: 20, duration: 300 }}>
      <div class="flex items-center gap-4 mb-4">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <Settings class="w-8 h-8" style="color: {$colorStore.primary}" />
        </div>
        <div>
          <h1 class="text-3xl font-bold" style="color: {$colorStore.text}">Administration Dashboard</h1>
          <p class="text-lg" style="color: {$colorStore.muted}">
            Manage auto-assign roles, server protection, and administrative settings
          </p>
        </div>
      </div>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2" style="border-color: {$colorStore.primary}"></div>
        <span class="ml-3" style="color: {$colorStore.text}">Loading administration data...</span>
      </div>
    {:else if error}
      <div class="p-6 rounded-xl mb-6 transition-all" role="alert"
           style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}40;">
        <div class="flex items-center gap-3">
          <AlertTriangle class="w-6 h-6" style="color: {$colorStore.accent}" />
          <div style="color: {$colorStore.accent}">
            <div class="font-semibold text-lg">Error Occurred</div>
            <div class="text-sm mt-1" style="color: {$colorStore.accent}90">{error}</div>
          </div>
        </div>
      </div>
    {:else if protectionStatus}

      <!-- Auto-Assign Roles Section -->
      <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                  border-color: {$colorStore.primary}30;"
           in:fly={{ y: 20, duration: 300, delay: 100 }}>

        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 rounded-xl"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <Users class="w-6 h-6" style="color: {$colorStore.primary}" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Auto-Assign Roles</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Normal Users -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2" style="color: {$colorStore.text}">
              <Users class="w-5 h-5" />
              Normal Users
            </h3>

            {#if !autoAssignRoles || !autoAssignRoles.normalRoles || autoAssignRoles.normalRoles.length === 0}
              <p class="text-sm" style="color: {$colorStore.muted}">No auto-assign roles configured</p>
            {:else}
              <div class="space-y-2">
                {#each autoAssignRoles.normalRoles as roleId}
                  <div
                    class="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:shadow-lg backdrop-blur-sm border"
                    style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                    <span class="font-medium" style="color: {$colorStore.text}">
                      {getRoleName(roleId)}
                    </span>
                    <button
                      class="px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80"
                      style="background: {$colorStore.accent}20; color: {$colorStore.accent}"
                      on:click={() => api.toggleAutoAssignRole($currentGuild.id, roleId).then(() => fetchAdministrationData())}
                    >
                      Remove
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Bot Users -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2" style="color: {$colorStore.text}">
              <Bot class="w-5 h-5" />
              Bot Users
            </h3>

            {#if !autoAssignRoles || !autoAssignRoles.botRoles || autoAssignRoles.botRoles.length === 0}
              <p class="text-sm" style="color: {$colorStore.muted}">No bot auto-assign roles configured</p>
            {:else}
              <div class="space-y-2">
                {#each autoAssignRoles.botRoles as roleId}
                  <div
                    class="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:shadow-lg backdrop-blur-sm border"
                    style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                    <span class="font-medium" style="color: {$colorStore.text}">
                      {getRoleName(roleId)}
                    </span>
                    <button
                      class="px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80"
                      style="background: {$colorStore.accent}20; color: {$colorStore.accent}"
                      on:click={() => api.toggleBotAutoAssignRole($currentGuild.id, roleId).then(() => fetchAdministrationData())}
                    >
                      Remove
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Server Protection Section -->
      <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                  border-color: {$colorStore.primary}30;"
           in:fly={{ y: 20, duration: 300, delay: 200 }}>

        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 rounded-xl"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <Shield class="w-6 h-6" style="color: {$colorStore.primary}" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Server Protection</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Anti-Raid -->
          <div class="p-4 rounded-xl transition-all duration-200 hover:shadow-lg backdrop-blur-sm border"
               style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold" style="color: {$colorStore.text}">Anti-Raid</h3>
              <div class="flex items-center gap-2">
                {#if protectionStatus.antiRaid.enabled}
                  <CheckCircle class="w-5 h-5" style="color: {$colorStore.secondary}" />
                {:else}
                  <AlertTriangle class="w-5 h-5" style="color: {$colorStore.muted}" />
                {/if}
              </div>
            </div>

            {#if protectionStatus.antiRaid.enabled}
              <div class="text-sm space-y-1" style="color: {$colorStore.muted}">
                <p>Threshold: {protectionStatus.antiRaid.userThreshold} users</p>
                <p>Window: {protectionStatus.antiRaid.seconds}s</p>
                <p>Action: {formatAction(protectionStatus.antiRaid.action)}</p>
                <p>Users caught: {protectionStatus.antiRaid.usersCount}</p>
              </div>
            {:else}
              <p class="text-sm" style="color: {$colorStore.muted}">Not configured</p>
            {/if}

            <button
              class="w-full mt-3 py-2 px-4 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
              style="background: {protectionStatus.antiRaid.enabled ? $colorStore.accent + '20' : $colorStore.secondary + '20'};
                     color: {protectionStatus.antiRaid.enabled ? $colorStore.accent : $colorStore.secondary}"
              on:click={() => toggleProtection('antiRaid')}
            >
              {protectionStatus.antiRaid.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>

          <!-- Anti-Spam -->
          <div class="p-4 rounded-xl transition-all duration-200 hover:shadow-lg backdrop-blur-sm border"
               style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold" style="color: {$colorStore.text}">Anti-Spam</h3>
              <div class="flex items-center gap-2">
                {#if protectionStatus.antiSpam.enabled}
                  <CheckCircle class="w-5 h-5" style="color: {$colorStore.secondary}" />
                {:else}
                  <AlertTriangle class="w-5 h-5" style="color: {$colorStore.muted}" />
                {/if}
              </div>
            </div>

            {#if protectionStatus.antiSpam.enabled}
              <div class="text-sm space-y-1" style="color: {$colorStore.muted}">
                <p>Threshold: {protectionStatus.antiSpam.messageThreshold} msgs</p>
                <p>Action: {formatAction(protectionStatus.antiSpam.action)}</p>
                <p>Mute time: {formatDuration(protectionStatus.antiSpam.muteTime)}</p>
                <p>Active users: {protectionStatus.antiSpam.userCount}</p>
              </div>
            {:else}
              <p class="text-sm" style="color: {$colorStore.muted}">Not configured</p>
            {/if}

            <button
              class="w-full mt-3 py-2 px-4 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
              style="background: {protectionStatus.antiSpam.enabled ? $colorStore.accent + '20' : $colorStore.secondary + '20'};
                     color: {protectionStatus.antiSpam.enabled ? $colorStore.accent : $colorStore.secondary}"
              on:click={() => toggleProtection('antiSpam')}
            >
              {protectionStatus.antiSpam.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>

          <!-- Anti-Alt -->
          <div class="p-4 rounded-xl transition-all duration-200 hover:shadow-lg backdrop-blur-sm border"
               style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold" style="color: {$colorStore.text}">Anti-Alt</h3>
              <div class="flex items-center gap-2">
                {#if protectionStatus.antiAlt.enabled}
                  <CheckCircle class="w-5 h-5" style="color: {$colorStore.secondary}" />
                {:else}
                  <AlertTriangle class="w-5 h-5" style="color: {$colorStore.muted}" />
                {/if}
              </div>
            </div>

            {#if protectionStatus.antiAlt.enabled}
              <div class="text-sm space-y-1" style="color: {$colorStore.muted}">
                <p>Min age: {protectionStatus.antiAlt.minAge}</p>
                <p>Action: {formatAction(protectionStatus.antiAlt.action)}</p>
                <p>Duration: {formatDuration(protectionStatus.antiAlt.actionDuration)}</p>
                <p>Detected: {protectionStatus.antiAlt.counter}</p>
              </div>
            {:else}
              <p class="text-sm" style="color: {$colorStore.muted}">Not configured</p>
            {/if}

            <button
              class="w-full mt-3 py-2 px-4 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
              style="background: {$colorStore.muted}20; color: {$colorStore.muted}"
              disabled
            >
              Configure manually
            </button>
          </div>

          <!-- Anti-Mass Mention -->
          <div class="p-4 rounded-xl transition-all duration-200 hover:shadow-lg backdrop-blur-sm border"
               style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold" style="color: {$colorStore.text}">Anti-Mass Mention</h3>
              <div class="flex items-center gap-2">
                {#if protectionStatus.antiMassMention.enabled}
                  <CheckCircle class="w-5 h-5" style="color: {$colorStore.secondary}" />
                {:else}
                  <AlertTriangle class="w-5 h-5" style="color: {$colorStore.muted}" />
                {/if}
              </div>
            </div>

            {#if protectionStatus.antiMassMention.enabled}
              <div class="text-sm space-y-1" style="color: {$colorStore.muted}">
                <p>Threshold: {protectionStatus.antiMassMention.mentionThreshold}</p>
                <p>Window: {protectionStatus.antiMassMention.timeWindowSeconds}s</p>
                <p>Action: {formatAction(protectionStatus.antiMassMention.action)}</p>
                <p>Active users: {protectionStatus.antiMassMention.userCount}</p>
              </div>
            {:else}
              <p class="text-sm" style="color: {$colorStore.muted}">Not configured</p>
            {/if}

            <button
              class="w-full mt-3 py-2 px-4 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
              style="background: {$colorStore.muted}20; color: {$colorStore.muted}"
              disabled
            >
              Configure manually
            </button>
          </div>
        </div>
      </div>

      <!-- Self-Assignable Roles Section -->
      <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                  border-color: {$colorStore.primary}30;"
           in:fly={{ y: 20, duration: 300, delay: 300 }}>

        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 rounded-xl"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <UserCheck class="w-6 h-6" style="color: {$colorStore.primary}" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Self-Assignable Roles</h2>
        </div>

        {#if !selfAssignableRoles || selfAssignableRoles.length === 0}
          <div class="text-center py-8">
            <UserCheck class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
            <p class="text-lg font-medium" style="color: {$colorStore.text}">No self-assignable roles configured</p>
            <p class="text-sm" style="color: {$colorStore.muted}">Users can't assign roles to themselves yet</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each selfAssignableRoles as role}
              <div
                class="flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:shadow-lg backdrop-blur-sm border"
                style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <span class="font-medium" style="color: {$colorStore.text}">
                  {getRoleName(role.roleId)}
                </span>
                <button
                  class="px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent}"
                  on:click={() => api.removeSelfAssignableRole($currentGuild.id, role.roleId).then(() => fetchAdministrationData())}
                >
                  Remove
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
    :global(*::-webkit-scrollbar) {
        @apply w-2;
    }

    :global(*::-webkit-scrollbar-track) {
        background: var(--color-primary) 10;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background: var(--color-primary) 30;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb:hover) {
        background: var(--color-primary) 50;
    }
</style>
