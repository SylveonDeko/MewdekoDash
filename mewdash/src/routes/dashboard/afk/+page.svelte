<!-- routes/dashboard/afk/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { api } from "$lib/api";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade, slide } from "svelte/transition";
  import type { Afk, BotStatusModel } from "$lib/types/models.ts";
  import { goto } from "$app/navigation";
  import Notification from "$lib/Notification.svelte";
  import { Clock, Users, MessageCircle, Settings, AlertCircle } from "lucide-svelte";
  import { browser } from "$app/environment";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from '$lib/stores/colorStore';
  import { logger } from "$lib/logger.ts";


  let botStatus: BotStatusModel | null = null;

  export let data: PageData;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let isMobile = false;

  let colors = {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    accent: "#ec4899",
    text: "#ffffff",
    muted: "#9ca3af",
    gradientStart: "#3b82f6",
    gradientMid: "#8b5cf6",
    gradientEnd: "#ec4899"
  };

  let afkUsers: Afk[] = [];
  let expandedUser = null;
  let loading = true;
  let error = null;

  // AFK Settings
  let afkDeletionTime = 0;
  let afkMaxLength = 0;
  let afkType = 1;
  let afkTimeout = 0;
  let afkDisabledChannels: string[] = [];
  let customAfkMessage = "";
  let changedSettings = new Set();

  async function fetchBotStatus() {
  try {
    botStatus = await api.getBotStatus();
  } catch (err) {
    logger.error("Failed to fetch bot status:", err);
  }
}


  $: if ($currentInstance) {
    Promise.all([
      fetchAfkUsers(),
      fetchAfkSettings(),
      fetchBotStatus()
    ]);
  }

  function markAsChanged(setting: string) {
    changedSettings = changedSettings.add(setting);
  }

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  async function updateAllAfkSettings() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      const updatePromises = [];

      if (changedSettings.has("deletion")) {
        updatePromises.push(api.afkDelSet($currentGuild.id, afkDeletionTime));
      }
      if (changedSettings.has("maxLength")) {
        updatePromises.push(api.afkLengthSet($currentGuild.id, afkMaxLength));
      }
      if (changedSettings.has("type")) {
        updatePromises.push(api.afkTypeSet($currentGuild.id, afkType));
      }
      if (changedSettings.has("timeout")) {
        updatePromises.push(api.afkTimeoutSet($currentGuild.id, afkTimeout));
      }
      if (changedSettings.has("customMessage")) {
        updatePromises.push(api.setCustomAfkMessage($currentGuild.id, customAfkMessage));
      }

      await Promise.all(updatePromises);
      showNotificationMessage("AFK settings updated successfully", "success");
      changedSettings.clear();
    } catch (err) {
      logger.error("Failed to update AFK settings:", err);
      showNotificationMessage("Failed to update AFK settings", "error");
    }
  }

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    await Promise.all([
      fetchAfkUsers(),
      fetchAfkSettings(),
      fetchBotStatus()
    ]);
    checkMobile();
    if (browser) window.addEventListener("resize", checkMobile);
  });
  onDestroy(() => {
    if (browser) window.removeEventListener("resize", checkMobile);
  });

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function fetchAfkSettings() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      const [deletion, maxLength, type, timeout, disabledChannels, customMessage] = await Promise.all([
        api.getAfkDel($currentGuild.id),
        api.getAfkLength($currentGuild.id),
        api.getAfkType($currentGuild.id),
        api.getAfkTimeout($currentGuild.id),
        api.getDisabledAfkChannels($currentGuild.id),
        api.getCustomAfkMessage($currentGuild.id)
      ]);

      afkDeletionTime = deletion;
      afkMaxLength = maxLength;
      afkType = type;
      afkTimeout = timeout;
      afkDisabledChannels = disabledChannels ? disabledChannels.split(",") : [];
      customAfkMessage = customMessage || "";
    } catch (err) {
      logger.error("Failed to fetch AFK settings:", err);
      error = err instanceof Error ? err.message : "Failed to fetch AFK settings";
    }
  }

  async function fetchAfkUsers() {
    try {
      loading = true;
      error = null;
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }
      const response = await api.getAllAfkStatus($currentGuild.id);
      afkUsers = response.filter(user =>
        user.afkStatus !== null &&
        user.afkStatus.message !== "" &&
        user.afkStatus.message
      );
    } catch (err) {
      logger.error("Failed to fetch AFK users:", err);
      error = err instanceof Error ? err.message : "Failed to fetch AFK users";
    } finally {
      loading = false;
    }
  }

  async function clearAfkStatus(userId: string) {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }
      await api.deleteAfkStatus($currentGuild.id, userId);
      showNotificationMessage("AFK Status Cleared", "success");
      await fetchAfkUsers();
    } catch (error) {
      showNotificationMessage(
        "Failed to clear AFK status: " + (error instanceof Error ? error.message : "Unknown error"),
        "error"
      );
    }
  }

  function toggleUserExpand(userId: string) {
    expandedUser = expandedUser === userId ? null : userId;
  }

  function handleUserKeydown(event: KeyboardEvent, userId: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleUserExpand(userId);
    }
  }

  $: colorVars = `
    --color-primary: ${$colorStore.primary};
    --color-secondary: ${$colorStore.secondary};
    --color-accent: ${$colorStore.accent};
    --color-text: ${$colorStore.text};
    --color-muted: ${$colorStore.muted};
`;

  $: if ($currentGuild) {
    fetchAfkUsers();
    fetchAfkSettings();
  }

  $: if ($currentInstance) {
    fetchAfkUsers();
    fetchAfkSettings();
  }

</script>

<svelte:head>
  <title>AFK Management - Dashboard</title>
</svelte:head>

<div
  class="min-h-screen p-4 md:p-6"
  style="{colorVars} background: radial-gradient(circle at top,
    {$colorStore.gradientStart}15 0%,
    {$colorStore.gradientMid}10 50%,
    {$colorStore.gradientEnd}05 100%);"
>
  <div class="max-w-7xl mx-auto space-y-8">
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}

    <!-- Header -->
    <div
      class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <h1 class="text-3xl font-bold" style="color: {$colorStore.text}">AFK Management</h1>
      <p class="mt-2" style="color: {$colorStore.muted}">Configure AFK settings and manage AFK users</p>
    </div>

    <!-- Settings Section -->
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
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">AFK Settings</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Auto-deletion Time -->
        <div
          class="rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <Clock class="w-5 h-5" style="color: {$colorStore.primary}" />
            <h3 class="font-semibold" style="color: {$colorStore.text}">Auto-deletion Time</h3>
          </div>
          <input
            bind:value={afkDeletionTime}
            class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
            on:input={() => markAsChanged("deletion")}
            style="border-color: {$colorStore.primary}30;
                   color: {$colorStore.text};
                   focus-visible:outline: none;
                   focus-visible:ring: 2px;
                   focus-visible:ring-color: {$colorStore.primary}50;"
            type="number"
          />
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            Time in seconds before AFK messages are deleted. Set to 0 to disable.
          </p>
        </div>

        <!-- Max Message Length -->
        <div
          class="rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <MessageCircle class="w-5 h-5" style="color: {$colorStore.secondary}" />
            <h3 class="font-semibold" style="color: {$colorStore.text}">Max Message Length</h3>
          </div>
          <input
            bind:value={afkMaxLength}
            class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
            on:input={() => markAsChanged("maxLength")}
            style="border-color: {$colorStore.secondary}30;
                   color: {$colorStore.text};
                   focus-visible:outline: none;
                   focus-visible:ring: 2px;
                   focus-visible:ring-color: {$colorStore.secondary}50;"
            type="number"
          />
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            Maximum allowed length for AFK messages.
          </p>
        </div>

        <!-- AFK Type -->
        <div
          class="rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <Settings class="w-5 h-5" style="color: {$colorStore.accent}" />
            <h3 class="font-semibold" style="color: {$colorStore.text}">AFK Type</h3>
          </div>
          <select
            bind:value={afkType}
            class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
            on:change={() => markAsChanged("type")}
            style="border-color: {$colorStore.accent}30;
                   color: {$colorStore.text};
                   focus-visible:outline: none;
                   focus-visible:ring: 2px;
                   focus-visible:ring-color: {$colorStore.accent}50;"
          >
            <option value={1}>Self Disable</option>
            <option value={2}>On Message</option>
            <option value={3}>On Type</option>
            <option value={4}>Either</option>
          </select>
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            Determines how AFK status is removed.
          </p>
        </div>

        <!-- AFK Timeout -->
        <div
          class="rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <Clock class="w-5 h-5" style="color: {$colorStore.secondary}" />
            <h3 class="font-semibold" style="color: {$colorStore.text}">AFK Timeout</h3>
          </div>
          <input
            bind:value={afkTimeout}
            class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
            on:input={() => markAsChanged("timeout")}
            style="border-color: {$colorStore.secondary}30;
                   color: {$colorStore.text};
                   focus-visible:outline: none;
                   focus-visible:ring: 2px;
                   focus-visible:ring-color: {$colorStore.secondary}50;"
            type="text"
          />
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            Time before someone is considered AFK (format: 1h2m3s)
          </p>
        </div>

        <!-- Custom Message -->
        <div
          class="col-span-full rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <MessageCircle class="w-5 h-5" style="color: {$colorStore.primary}" />
            <h3 class="font-semibold" style="color: {$colorStore.text}">Custom AFK Message</h3>
          </div>
          <textarea
            bind:value={customAfkMessage}
            class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200 min-h-[120px] resize-vertical"
            on:input={() => markAsChanged("customMessage")}
            placeholder="Enter custom AFK message..."
            style="border-color: {$colorStore.primary}30;
                   color: {$colorStore.text};
                   focus-visible:outline: none;
                   focus-visible:ring: 2px;
                   focus-visible:ring-color: {$colorStore.primary}50;"
          ></textarea>
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            Custom embed to display when a user is AFK. Use "-" to reset to default.
          </p>
        </div>
      </div>

      <!-- Save Button -->
      <div class="mt-6 flex justify-end">
        <button
          class="px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
          disabled={changedSettings.size === 0}
          on:click={updateAllAfkSettings}
          style="background: linear-gradient(to right, {$colorStore.primary}, {$colorStore.secondary});
                 color: {$colorStore.text};"
        >
          Save Changes
        </button>
      </div>
    </div>

    <!-- AFK Users Section -->
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
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Currently AFK Users</h2>
      </div>

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
          <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" />
          <p style="color: {$colorStore.accent}">{error}</p>
        </div>
      {:else if afkUsers.length === 0}
        <div
          class="text-center py-12"
          transition:fade
        >
          <Users class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.muted}" />
          <p style="color: {$colorStore.muted}">No users are currently AFK</p>
        </div>
      {:else}
        <div class="space-y-4">
          {#each afkUsers as user (user.userId)}
            <div
              class="rounded-xl overflow-hidden border transition-all duration-200"
              style="background: {$colorStore.primary}10;
                     border-color: {$colorStore.primary}20;
                     hover:border-color: {$colorStore.primary}30;"
            >
              <button
                class="w-full text-left p-4 transition-colors duration-200"
                style="hover:background: {$colorStore.primary}15;"
                on:click={() => toggleUserExpand(user.userId)}
                aria-expanded={expandedUser === user.userId}
                aria-controls="user-details-{user.userId}"
              >
                <div class="flex items-center gap-4">
                  <img
                    src={user.avatarUrl}
                    alt=""
                    class="w-12 h-12 rounded-full border-2"
                    style="border-color: {$colorStore.primary}30;"
                  />
                  <div class="flex-grow min-w-0">
                    <p class="font-medium truncate" style="color: {$colorStore.text}">{user.username}</p>
                    <p class="text-sm truncate" style="color: {$colorStore.muted}">{user.afkStatus.message}</p>
                  </div>
                </div>
              </button>

              {#if expandedUser === user.userId}
                <div
                  transition:slide
                  class="p-4 border-t"
                  style="background: {$colorStore.primary}15;
                         border-color: {$colorStore.primary}20;"
                  id="user-details-{user.userId}"
                >
                  <p class="mb-4" style="color: {$colorStore.muted}">
                    AFK since: {new Date(user.afkStatus.dateAdded).toLocaleString()}
                  </p>
                  <button
                    class="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                    style="background: {$colorStore.accent}15;
                           color: {$colorStore.accent};
                           hover:background: {$colorStore.accent}20;"
                    on:click={() => clearAfkStatus(user.userId)}
                  >
                    Clear AFK Status
                  </button>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

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

    /* Prevent iOS styling */
    select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
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