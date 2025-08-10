<!-- routes/dashboard/settings/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { fade } from "svelte/transition";
  import type { BotStatusModel, GuildConfig } from "$lib/types/models";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/ui/Notification.svelte";
  import { browser } from "$app/environment";
  import {
    AlertTriangle,
    Bell,
    Bot,
    Coins,
    Hash,
    Lock,
    MessagesSquare,
    Settings,
    Shell,
    Star,
    User,
    Users
  } from "lucide-svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { writable } from "svelte/store";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";

  export let data: PageData;
  let guildConfig: GuildConfig | null = null;
  let loading = true;
  let error: string | null = null;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let isMobile = false;
  let changedSettings = writable<Set<string>>(new Set());
  let channels: Array<{ id: string; name: string }> = [];
  let roles: Array<{ id: string; name: string }> = [];
  let botStatus: BotStatusModel | null = null;

  // We track local settings separately from the API state
  let settings = {
    prefix: ".",
    staffRole: "0",
    gameMasterRole: "0",
    useMessageCount: true,
    minMessageLength: 0,
    commandLogChannel: "0",
    deleteMessageOnCommand: false,
    currencyName: "Coins",
    currencyEmoji: "💰",
    autoAssignRoleId: null as string | null,
    memberRole: "0",
    commandsChannel: "0",
    warningsEnabled: true,
    warnExpireHours: 0,
    starboardChannel: "0",
    starboardThreshold: 1
  };

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function markAsChanged(setting: string) {
    changedSettings.update(set => {
      const newSet = new Set(set);
      newSet.add(setting);
      return newSet;
    });
  }

  async function fetchGuildSettings() {
    try {
      if (!$currentGuild?.id) return;
      const config = await api.getGuildConfig($currentGuild.id);
      console.log(config);
      guildConfig = config;

      // Update local settings
      settings = {
        prefix: config.prefix,
        staffRole: config.staffRole?.toString() || "0",
        gameMasterRole: config.gameMasterRole?.toString() || "0",
        useMessageCount: config.useMessageCount,
        minMessageLength: config.minMessageLength,
        commandLogChannel: config.commandLogChannel?.toString() || "0",
        deleteMessageOnCommand: config.deleteMessageOnCommand,
        currencyName: config.currencyName,
        currencyEmoji: config.currencyEmoji,
        autoAssignRoleId: config.autoAssignRoleId?.toString() || null,
        memberRole: config.memberRole?.toString() || "0",
        commandsChannel: config.commandLogChannel?.toString() || "0",
        warningsEnabled: config.warningsInitialized,
        warnExpireHours: config.warnExpireHours,
        starboardChannel: config.starboardChannel?.toString() || "0",
        starboardThreshold: config.stars || 1
      };
    } catch (err) {
      logger.error("Failed to fetch guild settings:", err);
      error = err instanceof Error ? err.message : "Failed to fetch guild settings";
    }
  }

  async function fetchChannelsAndRoles() {
    try {
      if (!$currentGuild?.id) return;
      const [channelList, roleList] = await Promise.all([
        api.getGuildTextChannels($currentGuild.id),
        api.getGuildRoles($currentGuild.id)
      ]);
      channels = channelList;
      roles = roleList;
    } catch (err) {
      logger.error("Failed to fetch channels and roles:", err);
    }
  }

  async function updateSettings() {
    try {
      if (!$currentGuild?.id || !guildConfig) return;

      // Create updated config with lowercase property names
      const updatedConfig = {
        ...guildConfig,
        prefix: settings.prefix,
        staffRole: settings.staffRole === "0" ? 0 : BigInt(settings.staffRole),
        gameMasterRole: settings.gameMasterRole === "0" ? 0 : BigInt(settings.gameMasterRole),
        useMessageCount: settings.useMessageCount,
        minMessageLength: settings.minMessageLength,
        commandLogChannel: settings.commandLogChannel === "0" ? 0 : BigInt(settings.commandLogChannel),
        deleteMessageOnCommand: settings.deleteMessageOnCommand,
        currencyName: settings.currencyName,
        currencyEmoji: settings.currencyEmoji,
        autoAssignRoleId: settings.autoAssignRoleId ? settings.autoAssignRoleId : null,
        memberRole: settings.memberRole === "0" ? 0 : BigInt(settings.memberRole),
        warningsInitialized: settings.warningsEnabled,
        warnExpireHours: settings.warnExpireHours,
        starboardChannel: settings.starboardChannel === "0" ? 0 : BigInt(settings.starboardChannel),
        stars: settings.starboardThreshold
      };

      await api.updateGuildConfig($currentGuild.id, updatedConfig);
      showNotificationMessage("Settings updated successfully");
      // Clear changed settings store
      changedSettings.set(new Set());
    } catch (err) {
      logger.error("Failed to update settings:", err);
      showNotificationMessage("Failed to update settings", "error");
    }
  }

  // Track current guild changes
  $: if ($currentGuild) {
    fetchGuildSettings();
    fetchChannelsAndRoles();
  }

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    loading = true;
    try {
      await Promise.all([
        fetchGuildSettings(),
        fetchChannelsAndRoles()
      ]);
    } catch (err) {
      error = "Failed to fetch data";
      logger.error(error, err);
    } finally {
      loading = false;
    }
    checkMobile();
    if (browser) window.addEventListener("resize", checkMobile);
  });

  onDestroy(() => {
    if (browser) window.removeEventListener("resize", checkMobile);
  });

</script>

<DashboardPageLayout 
  title="Guild Settings" 
  subtitle="Configure your server's bot settings and preferences" 
  icon={Settings}
  guildName={$currentGuild?.name || "Dashboard"}
  actionButtons={[
    {
      label: "Save Changes",
      icon: Settings,
      action: updateSettings,
      disabled: $changedSettings.size === 0,
      style: `background: linear-gradient(to right, ${$colorStore.primary}, ${$colorStore.secondary}); color: ${$colorStore.text}; box-shadow: 0 0 20px ${$colorStore.primary}20;`
    }
  ]}
>
  <svelte:fragment slot="status-messages">
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}
  </svelte:fragment>

  {#if loading}
    <div class="flex justify-center items-center min-h-[200px]">
      <div
        class="w-12 h-12 border-4 rounded-full animate-spin"
        style="border-color: {$colorStore.primary}20;
               border-top-color: {$colorStore.primary};">
      </div>
    </div>
  {:else if error}
    <div
      class="rounded-xl p-4 flex items-center gap-3"
      style="background: {$colorStore.accent}10;"
      role="alert"
    >
      <AlertTriangle class="w-5 h-5" style="color: {$colorStore.accent}" />
      <p style="color: {$colorStore.accent}">{error}</p>
    </div>
  {:else}
      <!-- Basic Settings -->
      <div
        class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   color: {$colorStore.primary};"
          >
            <Settings class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Basic Settings</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Prefix -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <div class="flex items-center gap-2 mb-3">
              <Shell class="w-5 h-5" style="color: {$colorStore.primary}" />
              <h3 class="font-semibold" style="color: {$colorStore.text}">Command Prefix</h3>
            </div>
            <label for="prefix-input" class="sr-only">Command Prefix</label>
            <input
              id="prefix-input"
              type="text"
              bind:value={settings.prefix}
              class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
              on:input={() => markAsChanged("prefix")}
              style="border-color: {$colorStore.primary}30;
                     color: {$colorStore.text};"
              aria-label="Command prefix for bot commands"
            />
          </div>

          <!-- Command Log Channel -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <div class="flex items-center gap-2 mb-3">
              <Hash class="w-5 h-5" style="color: {$colorStore.secondary}" />
              <h3 class="font-semibold" style="color: {$colorStore.text}">Command Log Channel</h3>
            </div>
            <DiscordSelector
              type="channel"
              options={channels}
              selected={settings.commandLogChannel === "0" ? null : settings.commandLogChannel}
              placeholder="Select command log channel"
              on:change={(e) => {
                settings.commandLogChannel = e.detail || "0";
                markAsChanged("commandLogChannel");
              }}
            />
          </div>

          <!-- Currency Settings -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <div class="flex items-center gap-2 mb-3">
              <Coins class="w-5 h-5" style="color: {$colorStore.primary}" />
              <h3 class="font-semibold" style="color: {$colorStore.text}">Currency Settings</h3>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <label for="currency-name" class="sr-only">Currency Name</label>
              <input
                id="currency-name"
                type="text"
                bind:value={settings.currencyName}
                placeholder="Currency Name"
                class="p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                on:input={() => markAsChanged("currency")}
                style="border-color: {$colorStore.primary}30;
                       color: {$colorStore.text};"
                aria-label="Name for server currency"
              />
              <label for="currency-emoji" class="sr-only">Currency Emoji</label>
              <input
                id="currency-emoji"
                type="text"
                bind:value={settings.currencyEmoji}
                placeholder="Currency Emoji"
                class="p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                on:input={() => markAsChanged("currency")}
                style="border-color: {$colorStore.primary}30;
                       color: {$colorStore.text};"
                aria-label="Emoji for server currency"
              />
            </div>
          </div>

          <!-- Message Settings -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <div class="flex items-center gap-2 mb-3">
              <MessagesSquare class="w-5 h-5" style="color: {$colorStore.secondary}" />
              <h3 class="font-semibold" style="color: {$colorStore.text}">Message Settings</h3>
            </div>
            <div class="space-y-4">
              <label class="flex items-center gap-3" for="message-count-toggle">
                <div
                  class="relative w-11 h-6 rounded-full transition-all duration-200"
                  style="background: {settings.useMessageCount ? $colorStore.primary : $colorStore.primary + '30'};"
                >
                  <input
                    id="message-count-toggle"
                    type="checkbox"
                    bind:checked={settings.useMessageCount}
                    on:change={() => markAsChanged("messageCount")}
                    class="sr-only peer"
                    aria-label="Enable message count tracking"
                  />
                  <div
                    class="absolute w-4 h-4 rounded-full top-1 left-1 transition-all duration-200"
                    style="background: {$colorStore.text};
                           transform: translateX({settings.useMessageCount ? '20px' : '0'});"
                    aria-hidden="true"
                  />
                </div>
                <span style="color: {$colorStore.text}">Enable Message Count</span>
              </label>
              <label for="min-message-length" class="sr-only">Minimum Message Length</label>
              <input
                id="min-message-length"
                type="number"
                bind:value={settings.minMessageLength}
                placeholder="Minimum Message Length"
                class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                on:input={() => markAsChanged("minMessageLength")}
                style="border-color: {$colorStore.secondary}30;
                       color: {$colorStore.text};"
                aria-label="Minimum message length for XP gain"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Role Settings -->
      <div
        class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   color: {$colorStore.primary};"
          >
            <Users class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Role Settings</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Staff Role -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <div class="flex items-center gap-2 mb-3">
              <Lock class="w-5 h-5" style="color: {$colorStore.primary}" />
              <h3 class="font-semibold" style="color: {$colorStore.text}">Staff Role</h3>
            </div>
            <DiscordSelector
              type="role"
              options={roles}
              selected={settings.staffRole === "0" ? null : settings.staffRole}
              placeholder="Select staff role"
              on:change={(e) => {
                settings.staffRole = e.detail || "0";
                markAsChanged("staffRole");
              }}
            />
          </div>

          <!-- Game Master Role -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <div class="flex items-center gap-2 mb-3">
              <User class="w-5 h-5" style="color: {$colorStore.secondary}" />
              <h3 class="font-semibold" style="color: {$colorStore.text}">Game Master Role</h3>
            </div>
            <DiscordSelector
              type="role"
              options={roles}
              selected={settings.gameMasterRole === "0" ? null : settings.gameMasterRole}
              placeholder="Select game master role"
              on:change={(e) => {
                settings.gameMasterRole = e.detail || "0";
                markAsChanged("gameMasterRole");
              }}
            />
          </div>

          <!-- Member Role -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <div class="flex items-center gap-2 mb-3">
              <Users class="w-5 h-5" style="color: {$colorStore.accent}" />
              <h3 class="font-semibold" style="color: {$colorStore.text}">Member Role</h3>
            </div>
            <DiscordSelector
              type="role"
              options={roles}
              selected={settings.memberRole === "0" ? null : settings.memberRole}
              placeholder="Select member role"
              on:change={(e) => {
                settings.memberRole = e.detail || "0";
                markAsChanged("memberRole");
              }}
            />
          </div>

          <!-- Auto Assign Role -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <div class="flex items-center gap-2 mb-3">
              <Bot class="w-5 h-5" style="color: {$colorStore.primary}" />
              <h3 class="font-semibold" style="color: {$colorStore.text}">Auto Assign Role</h3>
            </div>
            <DiscordSelector
              type="role"
              options={roles}
              selected={settings.autoAssignRoleId}
              placeholder="Select auto assign role"
              on:change={(e) => {
                settings.autoAssignRoleId = e.detail;
                markAsChanged("autoAssignRole");
              }}
            />
          </div>
        </div>
      </div>

      <!-- Additional Settings -->
      <div
        class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   color: {$colorStore.primary};"
          >
            <Settings class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Additional Settings</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Starboard Settings -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <div class="flex items-center gap-2 mb-3">
              <Star class="w-5 h-5" style="color: {$colorStore.primary}" />
              <h3 class="font-semibold" style="color: {$colorStore.text}">Starboard Settings</h3>
            </div>
            <div class="space-y-4">
              <DiscordSelector
                type="channel"
                options={channels}
                selected={settings.starboardChannel === "0" ? null : settings.starboardChannel}
                placeholder="Select starboard channel"
                on:change={(e) => {
                  settings.starboardChannel = e.detail || "0";
                  markAsChanged("starboard");
                }}
              />
              <div class="flex items-center gap-2">
                <label for="starboard-threshold" class="sr-only">Starboard Threshold</label>
                <input
                  id="starboard-threshold"
                  type="number"
                  bind:value={settings.starboardThreshold}
                  min="1"
                  class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                  on:input={() => markAsChanged("starboard")}
                  style="border-color: {$colorStore.primary}30;
                         color: {$colorStore.text};"
                  aria-label="Number of stars required for starboard"
                />
                <span class="text-sm whitespace-nowrap" style="color: {$colorStore.muted}">
                  stars required
                </span>
              </div>
            </div>
          </div>

          <!-- Warning Settings -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <div class="flex items-center gap-2 mb-3">
              <Bell class="w-5 h-5" style="color: {$colorStore.secondary}" />
              <h3 class="font-semibold" style="color: {$colorStore.text}">Warning Settings</h3>
            </div>
            <div class="space-y-4">
              <label class="flex items-center gap-3" for="warnings-toggle">
                <div
                  class="relative w-11 h-6 rounded-full transition-all duration-200"
                  style="background: {settings.warningsEnabled ? $colorStore.primary : $colorStore.primary + '30'};"
                >
                  <input
                    id="warnings-toggle"
                    type="checkbox"
                    bind:checked={settings.warningsEnabled}
                    on:change={() => markAsChanged("warnings")}
                    class="sr-only peer"
                    aria-label="Enable warning system"
                  />
                  <div
                    class="absolute w-4 h-4 rounded-full top-1 left-1 transition-all duration-200"
                    style="background: {$colorStore.text};
                           transform: translateX({settings.warningsEnabled ? '20px' : '0'});"
                    aria-hidden="true"
                  />
                </div>
                <span style="color: {$colorStore.text}">Enable Warnings</span>
              </label>
              {#if settings.warningsEnabled}
                <label for="warn-expire-hours" class="sr-only">Warning Expiry Hours</label>
                <input
                  id="warn-expire-hours"
                  type="number"
                  bind:value={settings.warnExpireHours}
                  min="0"
                  placeholder="Warning expiry in hours (0 = never)"
                  class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                  on:input={() => markAsChanged("warnings")}
                  style="border-color: {$colorStore.secondary}30;
                         color: {$colorStore.text};"
                  aria-label="Hours until warnings expire (0 for never)"
                />
              {/if}
            </div>
          </div>
        </div>
      </div>

  {/if}
</DashboardPageLayout>

<style lang="postcss">
    :global(body) {
        background-color: #1a202c;
        color: #ffffff;
    }

    :global(select),
    :global(input),
    :global(textarea) {
        color-scheme: dark;
    }

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

    /* Remove number input spinners */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    input[type="number"] {
        -moz-appearance: textfield;
    }

    /* Prevent iOS styling */
    select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 0.5rem center;
        background-repeat: no-repeat;
        background-size: 1.5em 1.5em;
        padding-right: 2.5rem;
    }

    /* Prevent blue highlight on iOS */
    select:focus {
        -webkit-tap-highlight-color: transparent;
    }

    /* Custom styling for options */
    option {
        background-color: #374151;
        color: white;
        padding: 0.5rem;
    }
</style>