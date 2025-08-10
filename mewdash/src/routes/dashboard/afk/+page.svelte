<!-- routes/dashboard/afk/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade, slide } from "svelte/transition";
  import type { Afk, BotStatusModel } from "$lib/types/models.ts";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import { AlertCircle, Clock, MessageCircle, Settings, Users, RefreshCw, Hash, UserMinus, CheckSquare, Trash2 } from "lucide-svelte";
  import { browser } from "$app/environment";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import { loadingStore } from "$lib/stores/loadingStore";


  let botStatus: BotStatusModel | null = null;

  export let data: PageData;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let isMobile = false;

  let afkUsers: Afk[] = [];
  let expandedUser = null;
  let loading = true;
  let error = null;

  // AFK Settings
  let afkDeletionTime = 0;
  let afkMaxLength = 0;
  let afkType = 1;
  let afkTimeout = "0s";
  let afkTimeoutSeconds = 0;
  let afkDisabledChannels: string[] = [];
  let customAfkMessage = "";
  let changedSettings = new Set();
  
  // Channel management
  let availableChannels: Array<{ id: string; name: string }> = [];
  let selectedDisabledChannels: string[] = [];
  
  // User management
  let selectedUsers = new Set<string>();
  let selectAllUsers = false;
  
  // Modal state
  let showConfirmModal = false;
  let modalConfig = {
    title: "",
    message: "",
    confirmText: "Confirm",
    variant: "danger" as "danger" | "warning" | "info",
    action: null as (() => void) | null
  };
  
  // Layout state
  let activeTab = "settings";
  
  const tabs = [
    { id: "settings", label: "Basic Settings", icon: Settings },
    { id: "advanced", label: "Advanced Settings", icon: Clock },
    { id: "users", label: "User Management", icon: Users }
  ];
  
  // AFK type options for DiscordSelector
  const afkTypeOptions = [
    { id: "1", name: "Self Disable" },
    { id: "2", name: "On Message" },
    { id: "3", name: "On Type" },
    { id: "4", name: "Either" }
  ];
  
  // Helper functions for timeout conversion
  function secondsToTimeString(seconds: number): string {
    if (seconds === 0) return "0s";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let result = "";
    if (hours > 0) result += `${hours}h`;
    if (minutes > 0) result += `${minutes}m`;
    if (secs > 0) result += `${secs}s`;
    
    return result || "0s";
  }
  
  function timeStringToSeconds(timeStr: string): number {
    if (!timeStr || timeStr === "0s") return 0;
    
    const regex = /(\d+)([hms])/g;
    let totalSeconds = 0;
    let match;
    
    while ((match = regex.exec(timeStr)) !== null) {
      const value = parseInt(match[1]);
      const unit = match[2];
      
      switch (unit) {
        case 'h': totalSeconds += value * 3600; break;
        case 'm': totalSeconds += value * 60; break;
        case 's': totalSeconds += value; break;
      }
    }
    
    return totalSeconds;
  }

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
  
  function validateAfkMaxLength(length: number): boolean {
    if (length < 1 || length > 4096) {
      showNotificationMessage("AFK message length must be between 1 and 4096 characters", "error");
      return false;
    }
    return true;
  }
  
  function validateAfkDeletionTime(time: number): boolean {
    if (time < 0) {
      showNotificationMessage("Auto-deletion time cannot be negative", "error");
      return false;
    }
    return true;
  }

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  async function updateAllAfkSettings() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      // Validate settings before saving
      if (changedSettings.has("deletion") && !validateAfkDeletionTime(afkDeletionTime)) {
        return;
      }
      if (changedSettings.has("maxLength") && !validateAfkMaxLength(afkMaxLength)) {
        return;
      }
      if (changedSettings.has("timeout") && (afkTimeoutSeconds < 1 || afkTimeoutSeconds > 7200)) {
        showNotificationMessage("AFK timeout must be between 1 second and 2 hours", "error");
        return;
      }

      const updatePromises = [];
      const settingsUpdated = [];

      if (changedSettings.has("deletion")) {
        updatePromises.push(api.afkDelSet($currentGuild.id, afkDeletionTime));
        settingsUpdated.push("auto-deletion time");
      }
      if (changedSettings.has("maxLength")) {
        updatePromises.push(api.afkLengthSet($currentGuild.id, afkMaxLength));
        settingsUpdated.push("max message length");
      }
      if (changedSettings.has("type")) {
        updatePromises.push(api.afkTypeSet($currentGuild.id, afkType));
        settingsUpdated.push("AFK type");
      }
      if (changedSettings.has("timeout")) {
        updatePromises.push(api.afkTimeoutSet($currentGuild.id, afkTimeout));
        settingsUpdated.push("AFK timeout");
      }
      if (changedSettings.has("customMessage")) {
        updatePromises.push(api.setCustomAfkMessage($currentGuild.id, customAfkMessage));
        settingsUpdated.push("custom message");
      }
      if (changedSettings.has("disabledChannels")) {
        const channelsString = selectedDisabledChannels.join(",");
        updatePromises.push(api.setDisabledAfkChannels($currentGuild.id, channelsString || "0"));
        settingsUpdated.push("disabled channels");
      }

      if (updatePromises.length === 0) {
        showNotificationMessage("No changes to save", "error");
        return;
      }

      await Promise.all(updatePromises);
      showNotificationMessage(`Successfully updated: ${settingsUpdated.join(", ")}`, "success");
      changedSettings.clear();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      logger.error("Failed to update AFK settings:", err);
      showNotificationMessage(`Failed to update AFK settings: ${errorMsg}`, "error");
    }
  }

  function showBulkRemoveConfirm() {
    if (!$currentGuild?.id || selectedUsers.size === 0) return;
    
    modalConfig = {
      title: "Bulk Remove AFK Status",
      message: `Are you sure you want to remove AFK status from ${selectedUsers.size} user(s)? This action cannot be undone.`,
      confirmText: "Remove AFK Status",
      variant: "danger",
      action: executeBulkRemove
    };
    showConfirmModal = true;
  }

  async function executeBulkRemove() {
    if (!$currentGuild?.id || selectedUsers.size === 0) return;
    
    try {
      const removePromises = Array.from(selectedUsers).map(userId => 
        api.deleteAfkStatus($currentGuild.id, BigInt(userId))
      );
      
      await Promise.all(removePromises);
      showNotificationMessage(`Successfully removed AFK status from ${selectedUsers.size} user(s)`, "success");
      selectedUsers.clear();
      selectAllUsers = false;
      await fetchAfkUsers();
    } catch (error) {
      logger.error("Failed to bulk remove AFK:", error);
      showNotificationMessage(`Failed to remove AFK status from user(s): ${error instanceof Error ? error.message : 'Unknown error'}`, "error");
    }
  }
  
  function toggleUserSelection(userId: string) {
    if (selectedUsers.has(userId)) {
      selectedUsers.delete(userId);
    } else {
      selectedUsers.add(userId);
    }
    selectedUsers = selectedUsers;
    selectAllUsers = selectedUsers.size === afkUsers.length;
  }
  
  function toggleSelectAll() {
    if (selectAllUsers) {
      selectedUsers.clear();
    } else {
      afkUsers.forEach(user => selectedUsers.add(user.userId.toString()));
    }
    selectedUsers = selectedUsers;
    selectAllUsers = !selectAllUsers;
  }
  
  function handleTimeoutInput(event: Event) {
    const target = event.target as HTMLInputElement;
    afkTimeout = target.value;
    afkTimeoutSeconds = timeStringToSeconds(afkTimeout);
    
    // Validate timeout range (1s to 2h = 7200s)
    if (afkTimeoutSeconds < 1 || afkTimeoutSeconds > 7200) {
      showNotificationMessage("AFK timeout must be between 1 second and 2 hours", "error");
      return;
    }
    
    markAsChanged("timeout");
  }
  
  function handleDisabledChannelsChange(event: CustomEvent) {
    selectedDisabledChannels = Array.isArray(event.detail.selected) ? event.detail.selected : [];
    markAsChanged("disabledChannels");
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
    return await loadingStore.wrap("fetch-afk-settings", async () => {
      try {
        if (!$currentGuild?.id) throw new Error("No guild selected");

        const [deletion, maxLength, type, timeout, disabledChannels, customMessage, channels] = await Promise.all([
          api.getAfkDel($currentGuild.id),
          api.getAfkLength($currentGuild.id),
          api.getAfkType($currentGuild.id),
          api.getAfkTimeout($currentGuild.id),
          api.getDisabledAfkChannels($currentGuild.id),
          api.getCustomAfkMessage($currentGuild.id),
          api.getGuildTextChannels($currentGuild.id)
        ]);

        afkDeletionTime = deletion;
        afkMaxLength = maxLength;
        afkType = type;
        afkTimeoutSeconds = timeout;
        afkTimeout = secondsToTimeString(timeout);
        
        // Parse disabled channels - handle both direct string and nested object response
        let disabledChannelsString = "";
        if (disabledChannels && typeof disabledChannels === 'object' && disabledChannels.data) {
          // API returns nested object with data property
          disabledChannelsString = disabledChannels.data;
        } else if (disabledChannels && typeof disabledChannels === 'string') {
          // API returns direct string
          disabledChannelsString = disabledChannels;
        }
        
        const disabledChannelIds = disabledChannelsString && disabledChannelsString !== "0" 
          ? disabledChannelsString.split(",").filter(Boolean) 
          : [];
        afkDisabledChannels = disabledChannelIds;
        selectedDisabledChannels = disabledChannelIds;
        
        customAfkMessage = customAfkMessage || "";
        availableChannels = channels;
        
        // Ensure the disabled channels are set after available channels are loaded
        // This helps with pre-population timing
        setTimeout(() => {
          selectedDisabledChannels = [...disabledChannelIds];
        }, 0);
      } catch (err) {
        logger.error("Failed to fetch AFK settings:", err);
        error = err instanceof Error ? err.message : "Failed to fetch AFK settings";
      }
    }, "api", "Loading AFK settings...");
  }

  async function fetchAfkUsers() {
    return await loadingStore.wrap("fetch-afk-users", async () => {
      try {
        loading = true;
        error = null;
        if (!$currentGuild?.id) {
          throw new Error("No guild selected");
        }
        const response = await api.getAllAfkStatus($currentGuild.id);
        afkUsers = response.filter(user =>
          user.afkStatus !== null &&
          user.afkStatus !== undefined &&
          user.afkStatus.message !== "" &&
          user.afkStatus.message !== null &&
          user.afkStatus.message !== undefined
        );
      } catch (err) {
        logger.error("Failed to fetch AFK users:", err);
        error = err instanceof Error ? err.message : "Failed to fetch AFK users";
      } finally {
        loading = false;
      }
    }, "api", "Loading AFK users...");
  }

  function showClearAfkConfirm(userId: string) {
    if (!$currentGuild?.id) return;
    
    const user = afkUsers.find(u => u.userId.toString() === userId);
    const userName = user ? user.username : 'user';
    
    modalConfig = {
      title: "Remove AFK Status",
      message: `Are you sure you want to remove AFK status from ${userName}?`,
      confirmText: "Remove AFK",
      variant: "warning",
      action: () => executeClearAfk(userId)
    };
    showConfirmModal = true;
  }

  async function executeClearAfk(userId: string) {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }
      
      const user = afkUsers.find(u => u.userId.toString() === userId);
      const userName = user ? user.username : 'user';
      
      await api.deleteAfkStatus($currentGuild.id, BigInt(userId));
      showNotificationMessage(`Successfully cleared AFK status for ${userName}`, "success");
      await fetchAfkUsers();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      logger.error("Failed to clear AFK status:", error);
      showNotificationMessage(`Failed to clear AFK status: ${errorMsg}`, "error");
    }
  }

  function toggleUserExpand(userId: string) {
    expandedUser = expandedUser === userId ? null : userId;
  }


  $: if ($currentGuild) {
    fetchAfkUsers();
    fetchAfkSettings();
  }

  $: if ($currentInstance) {
    fetchAfkUsers();
    fetchAfkSettings();
  }

  // Action buttons configuration
  $: actionButtons = [
    {
      label: "Refresh",
      icon: RefreshCw,
      action: async () => {
        loading = true;
        await Promise.all([fetchAfkUsers(), fetchAfkSettings(), fetchBotStatus()]);
        loading = false;
      },
      loading: loading
    },
    ...(activeTab === "users" && selectedUsers.size > 0 ? [{
      label: `Remove AFK (${selectedUsers.size})`,
      icon: UserMinus,
      action: showBulkRemoveConfirm,
      loading: false,
      variant: "danger" as const
    }] : [])
  ];

</script>

<DashboardPageLayout 
  title="AFK Management"
  subtitle="Configure AFK settings and manage AFK users"
  icon={Clock}
  {tabs}
  bind:activeTab
  {actionButtons}
  guildName={$currentGuild?.name || "Dashboard"}
  on:tabChange={(e) => activeTab = e.detail.tabId}
>
  
  <svelte:fragment slot="status-messages">
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}
  </svelte:fragment>

  {#if activeTab === 'settings'}
    <!-- Basic Settings Section -->
    <section
      class="rounded-2xl border p-6 shadow-2xl"
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
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Basic AFK Settings</h2>
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
          <label for="afk-deletion-time" class="sr-only">Auto-deletion Time</label>
          <input
            id="afk-deletion-time"
            bind:value={afkDeletionTime}
            class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
            on:input={(e) => {
              const value = parseInt(e.currentTarget.value);
              if (isNaN(value) || value < 0) {
                e.currentTarget.setCustomValidity("Value must be 0 or greater");
              } else {
                e.currentTarget.setCustomValidity("");
                markAsChanged("deletion");
              }
            }}
            style="border-color: {$colorStore.primary}30;
                   color: {$colorStore.text};
                   focus-visible:outline: none;
                   focus-visible:ring: 2px;
                   focus-visible:ring-color: {$colorStore.primary}50;"
            type="number"
            min="0"
            aria-label="Time in seconds before AFK messages are deleted"
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
          <label for="afk-max-length" class="sr-only">Max Message Length</label>
          <input
            id="afk-max-length"
            bind:value={afkMaxLength}
            class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
            on:input={(e) => {
              const value = parseInt(e.currentTarget.value);
              if (isNaN(value) || value < 1 || value > 4096) {
                e.currentTarget.setCustomValidity("Value must be between 1 and 4096");
              } else {
                e.currentTarget.setCustomValidity("");
                markAsChanged("maxLength");
              }
            }}
            style="border-color: {$colorStore.secondary}30;
                   color: {$colorStore.text};
                   focus-visible:outline: none;
                   focus-visible:ring: 2px;
                   focus-visible:ring-color: {$colorStore.secondary}50;"
            type="number"
            min="1"
            max="4096"
            aria-label="Maximum length for AFK messages"
          />
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            Maximum allowed length for AFK messages (1-4096 characters).
          </p>
        </div>

        <!-- AFK Type -->
        <div
          class="col-span-full rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <Settings class="w-5 h-5" style="color: {$colorStore.accent}" />
            <h3 class="font-semibold" style="color: {$colorStore.text}">AFK Removal Type</h3>
          </div>
          <label for="afk-type" class="sr-only">AFK Type</label>
          <DiscordSelector
            type="custom"
            options={afkTypeOptions}
            customIcon={Settings}
            placeholder="Select AFK removal behavior"
            selected={afkType.toString()}
            on:change={(e) => {
              afkType = parseInt(e.detail.selected);
              markAsChanged("type");
            }}
          />
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            Determines how AFK status is automatically removed: Self Disable (manual only), On Message, On Type, or Either.
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
    </section>
  {/if}
  
  {#if activeTab === 'advanced'}
    <!-- Advanced Settings Section -->
    <section
      class="rounded-2xl border p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="flex items-center gap-3 mb-6">
        <div
          class="p-3 rounded-xl"
          style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                 color: {$colorStore.primary};"
        >
          <Clock class="w-6 h-6" />
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Advanced AFK Settings</h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- AFK Timeout -->
        <div
          class="rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <Clock class="w-5 h-5" style="color: {$colorStore.secondary}" />
            <h3 class="font-semibold" style="color: {$colorStore.text}">AFK Timeout</h3>
          </div>
          <label for="afk-timeout" class="sr-only">AFK Timeout</label>
          <input
            id="afk-timeout"
            value={afkTimeout}
            class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
            on:input={handleTimeoutInput}
            style="border-color: {$colorStore.secondary}30;
                   color: {$colorStore.text};
                   focus-visible:outline: none;
                   focus-visible:ring: 2px;
                   focus-visible:ring-color: {$colorStore.secondary}50;"
            type="text"
            placeholder="e.g., 5m, 1h30m, 2h"
            aria-label="AFK timeout duration"
          />
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            Time before someone is considered AFK (format: 1h2m3s). Range: 1s to 2h.
          </p>
        </div>

        <!-- Disabled Channels -->
        <div
          class="rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <Hash class="w-5 h-5" style="color: {$colorStore.accent}" />
            <h3 class="font-semibold" style="color: {$colorStore.text}">Disabled Channels</h3>
          </div>
          <label for="disabled-channels" class="sr-only">Disabled Channels</label>
          <DiscordSelector
            type="channel"
            options={availableChannels}
            placeholder="Select channels to disable AFK messages"
            multiple={true}
            selected={selectedDisabledChannels}
            on:change={handleDisabledChannelsChange}
          />
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            Channels where AFK messages will not be displayed. Select multiple channels to disable AFK notifications in those areas.
          </p>
        </div>

        <!-- Custom Message -->
        <div
          class="col-span-full rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <MessageCircle class="w-5 h-5" style="color: {$colorStore.primary}" />
            <h3 class="font-semibold" style="color: {$colorStore.text}">Custom AFK Embed Message</h3>
          </div>
          <label for="custom-afk-message" class="sr-only">Custom AFK Message</label>
          <textarea
            id="custom-afk-message"
            bind:value={customAfkMessage}
            class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200 min-h-[120px] resize-vertical"
            on:input={() => markAsChanged("customMessage")}
            placeholder="Enter custom AFK embed message... Use '-' to reset to default."
            style="border-color: {$colorStore.primary}30;
                   color: {$colorStore.text};
                   focus-visible:outline: none;
                   focus-visible:ring: 2px;
                   focus-visible:ring-color: {$colorStore.primary}50;"
            aria-label="Custom embed message to display when a user is AFK"
          ></textarea>
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            Custom embed message template for AFK notifications. Use "-" to reset to default. Check 
            <a href="/dashboard/embedbuilder" style="color: {$colorStore.primary}; text-decoration: underline;">embed builder</a> 
            and <a href="http://mewdeko.tech/placeholders" target="_blank" rel="noopener" style="color: {$colorStore.primary}; text-decoration: underline;">placeholders</a> for help.
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
    </section>
  {/if}

  {#if activeTab === 'users'}
    <!-- User Management Section -->
    <section
      class="rounded-2xl border p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   color: {$colorStore.primary};"
          >
            <Users class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">AFK User Management</h2>
        </div>
        
        <!-- Bulk Actions -->
        {#if afkUsers.length > 0}
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={selectAllUsers}
                on:change={toggleSelectAll}
                class="w-4 h-4 rounded border flex-shrink-0"
                style="accent-color: {$colorStore.primary};"
              />
              <span style="color: {$colorStore.text}" class="text-sm font-medium">
                Select All ({afkUsers.length})
              </span>
            </label>
            
            {#if selectedUsers.size > 0}
              <button
                class="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
                style="background: {$colorStore.accent}15;
                       color: {$colorStore.accent};
                       hover:background: {$colorStore.accent}20;"
                on:click={showBulkRemoveConfirm}
              >
                <UserMinus class="w-4 h-4" />
                <span class="sm:hidden">Remove Selected ({selectedUsers.size})</span>
                <span class="hidden sm:inline">Remove AFK ({selectedUsers.size})</span>
              </button>
            {/if}
          </div>
        {/if}
      </div>

      {#if loading}
        <div class="flex justify-center items-center min-h-[200px]">
          <div
            class="w-12 h-12 border-4 rounded-full animate-spin"
            style="border-color: {$colorStore.primary}20;
                   border-top-color: {$colorStore.primary};"
          >
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
        <div class="space-y-3">
          {#each afkUsers as user (user.userId)}
            <div
              class="rounded-xl border p-4 transition-all duration-200"
              style="background: {$colorStore.primary}10;
                     border-color: {selectedUsers.has(user.userId.toString()) ? $colorStore.primary : $colorStore.primary + '20'};
                     border-width: {selectedUsers.has(user.userId.toString()) ? '2px' : '1px'};"
            >
              <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <!-- Mobile-first layout -->
                <div class="flex items-center gap-3 flex-grow min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.userId.toString())}
                    on:change={() => toggleUserSelection(user.userId.toString())}
                    class="w-4 h-4 rounded border flex-shrink-0"
                    style="accent-color: {$colorStore.primary};"
                  />
                  
                  <button
                    class="flex items-center gap-3 flex-grow text-left transition-colors duration-200 rounded-lg p-2 min-w-0"
                    style="hover:background: {$colorStore.primary}15;"
                    on:click={() => toggleUserExpand(user.userId)}
                    aria-expanded={expandedUser === user.userId}
                    aria-controls="user-details-{user.userId}"
                  >
                    <img
                      src={user.avatarUrl}
                      alt=""
                      class="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex-shrink-0"
                      style="border-color: {$colorStore.primary}30;"
                    />
                    
                    <div class="flex-grow min-w-0">
                      <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <p class="font-medium truncate" style="color: {$colorStore.text}">{user.username}</p>
                        <div class="flex flex-wrap gap-1">
                          {#if user.nickname}
                            <span class="text-xs px-2 py-1 rounded" style="background: {$colorStore.secondary}15; color: {$colorStore.secondary}">
                              {user.nickname}
                            </span>
                          {/if}
                          {#if user.afkStatus?.wasTimed}
                            <span class="text-xs px-2 py-1 rounded" style="background: {$colorStore.accent}15; color: {$colorStore.accent}">
                              Timed
                            </span>
                          {/if}
                        </div>
                      </div>
                      
                      <div class="space-y-1 text-sm">
                        <div class="truncate">
                          <span style="color: {$colorStore.muted}">Message:</span>
                          <span style="color: {$colorStore.text}" class="ml-1">{user.afkStatus?.message || 'No message'}</span>
                        </div>
                        
                        <div class="hidden sm:grid sm:grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <span style="color: {$colorStore.muted}">Since:</span>
                            <span style="color: {$colorStore.text}" class="ml-1">
                              {user.afkStatus?.dateAdded ? new Date(user.afkStatus.dateAdded).toLocaleDateString() : 'Unknown'}
                            </span>
                          </div>
                          
                          {#if user.afkStatus?.wasTimed}
                            <div>
                              <span style="color: {$colorStore.muted}">Expires:</span>
                              <span style="color: {$colorStore.text}" class="ml-1">
                                {user.afkStatus?.when ? new Date(user.afkStatus.when).toLocaleDateString() : 'Unknown'}
                              </span>
                            </div>
                          {:else}
                            <div>
                              <span style="color: {$colorStore.muted}">Type:</span>
                              <span style="color: {$colorStore.primary}" class="ml-1 font-medium">Permanent AFK</span>
                            </div>
                          {/if}
                        </div>
                        
                        <!-- Mobile summary -->
                        <div class="sm:hidden text-xs" style="color: {$colorStore.muted}">
                          Since: {user.afkStatus?.dateAdded ? new Date(user.afkStatus.dateAdded).toLocaleDateString() : 'Unknown'}
                          {#if user.afkStatus?.wasTimed}
                            • Expires: {user.afkStatus?.when ? new Date(user.afkStatus.when).toLocaleDateString() : 'Unknown'}
                          {:else}
                            • Permanent
                          {/if}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
                
                <!-- Remove button -->
                <button
                  class="px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto flex-shrink-0"
                  style="background: {$colorStore.accent}15;
                         color: {$colorStore.accent};
                         hover:background: {$colorStore.accent}20;"
                  on:click={() => showClearAfkConfirm(user.userId)}
                >
                  <UserMinus class="w-4 h-4" />
                  <span class="sm:hidden">Remove AFK</span>
                  <span class="hidden sm:inline">Remove</span>
                </button>
              </div>
              
              <!-- Expanded Details -->
              {#if expandedUser === user.userId}
                <div
                  transition:slide
                  class="mt-4 pt-4 border-t"
                  style="border-color: {$colorStore.primary}20;"
                  id="user-details-{user.userId}"
                >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span style="color: {$colorStore.muted}" class="text-sm font-medium">Full Message:</span>
                      <p style="color: {$colorStore.text}" class="font-medium break-words mt-1">
                        {user.afkStatus?.message || 'No message'}
                      </p>
                    </div>
                    
                    <div>
                      <span style="color: {$colorStore.muted}" class="text-sm font-medium">AFK Details:</span>
                      <div class="mt-1 space-y-1">
                        <p style="color: {$colorStore.text}" class="text-sm">
                          <span class="font-medium">Since:</span> {user.afkStatus?.dateAdded ? new Date(user.afkStatus.dateAdded).toLocaleString() : 'Unknown'}
                        </p>
                        {#if user.afkStatus?.wasTimed}
                          <p style="color: {$colorStore.text}" class="text-sm">
                            <span class="font-medium">Expires:</span> {user.afkStatus?.when ? new Date(user.afkStatus.when).toLocaleString() : 'Unknown'}
                          </p>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
        
        <!-- Summary Stats -->
        <div class="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div
            class="rounded-xl p-4 text-center"
            style="background: {$colorStore.primary}10;"
          >
            <div class="text-2xl font-bold" style="color: {$colorStore.primary}">{afkUsers.length}</div>
            <div class="text-sm" style="color: {$colorStore.muted}">Total AFK Users</div>
          </div>
          
          <div
            class="rounded-xl p-4 text-center"
            style="background: {$colorStore.secondary}10;"
          >
            <div class="text-2xl font-bold" style="color: {$colorStore.secondary}">
              {afkUsers.filter(u => u.afkStatus?.wasTimed).length}
            </div>
            <div class="text-sm" style="color: {$colorStore.muted}">Timed AFK</div>
          </div>
          
          <div
            class="rounded-xl p-4 text-center"
            style="background: {$colorStore.accent}10;"
          >
            <div class="text-2xl font-bold" style="color: {$colorStore.accent}">{selectedUsers.size}</div>
            <div class="text-sm" style="color: {$colorStore.muted}">Selected</div>
          </div>
        </div>
      {/if}
    </section>
  {/if}
</DashboardPageLayout>

<!-- Confirmation Modal -->
<ConfirmationModal
  bind:isOpen={showConfirmModal}
  title={modalConfig.title}
  message={modalConfig.message}
  confirmText={modalConfig.confirmText}
  variant={modalConfig.variant}
  on:confirm={() => modalConfig.action?.()}
  on:cancel={() => showConfirmModal = false}
/>

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