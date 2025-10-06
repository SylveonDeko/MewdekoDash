<!-- routes/dashboard/rolestates/+page.svelte -->
<script lang="ts">
    import {run} from 'svelte/legacy';

    import {onDestroy, onMount} from "svelte";
    import {api} from "$lib/api";
    import {currentGuild} from "$lib/stores/currentGuild.ts";
    import {fade} from "svelte/transition";
    import type {BotStatusModel} from "$lib/types/models.ts";
    import {goto} from "$app/navigation";
    import Notification from "$lib/components/ui/Notification.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
    import {browser} from "$app/environment";
    import {currentInstance} from "$lib/stores/instanceStore.ts";
    import {colorStore} from "$lib/stores/colorStore";
    import {logger} from "$lib/logger.ts";
    import {loadingStore} from "$lib/stores/loadingStore";
    import type {PageData} from "./$types";

    interface Props {
        data: PageData;
    }

    let {data}: Props = $props();

  // State management
  let botStatus: BotStatusModel | null = null;
    let showNotification = $state(false);
    let notificationMessage = $state("");
    let notificationType: "success" | "error" = $state("success");
  let isMobile = false;

  // Role States Settings
    let roleStateSettings = $state({
    guildId: "",
    enabled: false,
    clearOnBan: false,
    ignoreBots: false,
    deniedRoles: "",
    deniedUsers: ""
    });

  // Parsed denied items
    let deniedRolesList: string[] = $state([]);
    let deniedUsersList: string[] = $state([]);

  // Role States
  let roleStates: Array<{
    id: number;
    userId: string;
    guildId: string;
    savedRoles: string;
    userName: string;
  }> = $state([]);

  // Guild roles and users
  let guildRoles: Array<{
    id: string;
    name: string;
  }> = $state([]);

  let guildMembers: Array<{
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  }> = $state([]);

  // Role management states
    let selectedUserId = $state("");
    let sourceUserId = $state("");
    let targetUserId = $state("");
    let selectedRoleIds: string[] = $state([]);
    let selectedUserRoles: string[] = $state([]);
    let viewingUserId: string | null = $state(null);

  // Denied roles/users management
    let selectedDeniedRoleId = $state("");
    let selectedDeniedUserId = $state("");

  // Management
    let loadingSettings = $state(true);
    let loadingStates = $state(true);
    let savingAllStates = $state(false);
    let errorSettings: string | null = $state(null);
    let errorStates: string | null = $state(null);

  // Active tab for settings
    let settingsTab: "general" | "denied" = $state("general");
  
  // Layout state
    let activeTab = $state("settings");
  
  const tabs = [
    { id: "settings", label: "Settings", icon: "fa-gear" },
    { id: "management", label: "Management", icon: "fa-users" },
    { id: "states", label: "Role States", icon: "fa-user-plus" }
  ];

  // Fetch bot status
  async function fetchBotStatus() {
    try {
      botStatus = await api.getBotStatus();
    } catch (err) {
      logger.error("Failed to fetch bot status:", err);
    }
  }


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

  async function fetchRoleStateSettings() {
    return await loadingStore.wrap("fetch-role-settings", async () => {
      try {
        loadingSettings = true;
        errorSettings = null;
        if (!$currentGuild?.id) {
          throw new Error("No guild selected");
        }

        roleStateSettings = await api.getRoleStateSettings($currentGuild.id);
      if (!roleStateSettings) {
        roleStateSettings = {
          guildId: $currentGuild.id.toString(),
          enabled: false,
          clearOnBan: false,
          ignoreBots: false,
          deniedRoles: "",
          deniedUsers: ""
        };
      }

        // Parse denied lists
        parseDeniedLists();
      } catch (err) {
        logger.error("Failed to fetch role state settings:", err);
        errorSettings = err instanceof Error ? err.message : "Failed to fetch role state settings";
      } finally {
        loadingSettings = false;
      }
    }, "api", "Loading settings...");
  }

  function parseDeniedLists() {
    if (roleStateSettings.deniedRoles) {
      deniedRolesList = roleStateSettings.deniedRoles.split(",");
    } else {
      deniedRolesList = [];
    }

    if (roleStateSettings.deniedUsers) {
      deniedUsersList = roleStateSettings.deniedUsers.split(",");
    } else {
      deniedUsersList = [];
    }
  }

  async function fetchRoleStates() {
    try {
      loadingStates = true;
      errorStates = null;
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      roleStates = await api.getAllRoleStates($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch role states:", err);
      errorStates = err instanceof Error ? err.message : "Failed to fetch role states";
    } finally {
      loadingStates = false;
    }
  }

  async function fetchGuildRoles() {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      guildRoles = await api.getGuildRoles($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch guild roles:", err);
    }
  }

  async function fetchGuildMembers() {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      guildMembers = await api.getGuildMembers($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch guild members:", err);
    }
  }

  async function toggleRoleStates() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      const result = await api.toggleRoleStates($currentGuild.id);
      showNotificationMessage(`Role states ${result ? "enabled" : "disabled"}`, "success");
      await fetchRoleStateSettings();
    } catch (err) {
      logger.error("Failed to toggle role states:", err);
      showNotificationMessage("Failed to update setting", "error");
    }
  }

  async function toggleClearOnBan() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!roleStateSettings) throw new Error("Settings not loaded");

      const result = await api.toggleClearOnBan($currentGuild.id, roleStateSettings);
      showNotificationMessage(`Clear on ban ${result ? "enabled" : "disabled"}`, "success");
      await fetchRoleStateSettings();
    } catch (err) {
      logger.error("Failed to toggle clear on ban:", err);
      showNotificationMessage("Failed to update setting", "error");
    }
  }

  async function toggleIgnoreBots() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!roleStateSettings) throw new Error("Settings not loaded");

      const result = await api.toggleIgnoreBots($currentGuild.id, roleStateSettings);
      showNotificationMessage(`Ignore bots ${result ? "enabled" : "disabled"}`, "success");
      await fetchRoleStateSettings();
    } catch (err) {
      logger.error("Failed to toggle ignore bots:", err);
      showNotificationMessage("Failed to update setting", "error");
    }
  }

  async function getUserRoleState(userId: string) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!userId) throw new Error("No user selected");

      const roleState = await api.getUserRoleState($currentGuild.id, BigInt(userId));
      viewingUserId = userId;

      // Parse saved roles
      if (roleState && roleState.savedRoles) {
        selectedUserRoles = roleState.savedRoles.split(",");
      } else {
        selectedUserRoles = [];
      }
    } catch (err) {
      logger.error("Failed to get user role state:", err);
      showNotificationMessage("Failed to get user role state", "error");
      selectedUserRoles = [];
    }
  }

  async function deleteUserRoleState(userId: string) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!userId) throw new Error("No user selected");

      await api.deleteUserRoleState($currentGuild.id, BigInt(userId));
      showNotificationMessage("User role state deleted successfully", "success");
      await fetchRoleStates();
      viewingUserId = null;
    } catch (err) {
      logger.error("Failed to delete user role state:", err);
      showNotificationMessage("Failed to delete user role state", "error");
    }
  }

  async function addRolesToUser() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!selectedUserId) throw new Error("No user selected");
      if (selectedRoleIds.length === 0) throw new Error("No roles selected");

      await api.addRolesToUser($currentGuild.id, BigInt(selectedUserId), selectedRoleIds.map(id => BigInt(id)));
      showNotificationMessage("Roles added to user successfully", "success");
      selectedRoleIds = [];
      await fetchRoleStates();
      if (viewingUserId === selectedUserId) {
        await getUserRoleState(selectedUserId);
      }
    } catch (err) {
      logger.error("Failed to add roles to user:", err);
      showNotificationMessage(err instanceof Error ? err.message : "Failed to add roles to user", "error");
    }
  }

  async function removeRolesFromUser() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!selectedUserId) throw new Error("No user selected");
      if (selectedRoleIds.length === 0) throw new Error("No roles selected");

      await api.removeRolesFromUser($currentGuild.id, BigInt(selectedUserId), selectedRoleIds.map(id => BigInt(id)));
      showNotificationMessage("Roles removed from user successfully", "success");
      selectedRoleIds = [];
      await fetchRoleStates();
      if (viewingUserId === selectedUserId) {
        await getUserRoleState(selectedUserId);
      }
    } catch (err) {
      logger.error("Failed to remove roles from user:", err);
      showNotificationMessage(err instanceof Error ? err.message : "Failed to remove roles from user", "error");
    }
  }

  async function applyRoleState() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!sourceUserId) throw new Error("No source user selected");
      if (!targetUserId) throw new Error("No target user selected");

      await api.applyRoleState($currentGuild.id, BigInt(sourceUserId), BigInt(targetUserId));
      showNotificationMessage("Role state applied successfully", "success");
      sourceUserId = "";
      targetUserId = "";
    } catch (err) {
      logger.error("Failed to apply role state:", err);
      showNotificationMessage("Failed to apply role state", "error");
    }
  }

  async function addDeniedRole() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!selectedDeniedRoleId) throw new Error("No role selected");
      if (!roleStateSettings) throw new Error("Settings not loaded");

      // Check if role is already denied
      if (deniedRolesList.includes(selectedDeniedRoleId)) {
        showNotificationMessage("Role is already in the deny list", "error");
        return;
      }

      // Add role to denied list
      deniedRolesList.push(selectedDeniedRoleId);
      roleStateSettings.deniedRoles = deniedRolesList.join(",");

      // Update settings
      await api.updateRoleStateSettings($currentGuild.id, roleStateSettings);
      showNotificationMessage("Role added to deny list", "success");
      selectedDeniedRoleId = "";
    } catch (err) {
      logger.error("Failed to add denied role:", err);
      showNotificationMessage("Failed to update deny list", "error");
    }
  }

  async function removeDeniedRole(roleId: string) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!roleStateSettings) throw new Error("Settings not loaded");

      // Remove role from denied list
      deniedRolesList = deniedRolesList.filter(id => id !== roleId);
      roleStateSettings.deniedRoles = deniedRolesList.join(",");

      // Update settings
      await api.updateRoleStateSettings($currentGuild.id, roleStateSettings);
      showNotificationMessage("Role removed from deny list", "success");
    } catch (err) {
      logger.error("Failed to remove denied role:", err);
      showNotificationMessage("Failed to update deny list", "error");
    }
  }

  async function addDeniedUser() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!selectedDeniedUserId) throw new Error("No user selected");
      if (!roleStateSettings) throw new Error("Settings not loaded");

      // Check if user is already denied
      if (deniedUsersList.includes(selectedDeniedUserId)) {
        showNotificationMessage("User is already in the deny list", "error");
        return;
      }

      // Add user to denied list
      deniedUsersList.push(selectedDeniedUserId);
      roleStateSettings.deniedUsers = deniedUsersList.join(",");

      // Update settings
      await api.updateRoleStateSettings($currentGuild.id, roleStateSettings);
      showNotificationMessage("User added to deny list", "success");
      selectedDeniedUserId = "";
    } catch (err) {
      logger.error("Failed to add denied user:", err);
      showNotificationMessage("Failed to update deny list", "error");
    }
  }

  async function removeDeniedUser(userId: string) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!roleStateSettings) throw new Error("Settings not loaded");

      // Remove user from denied list
      deniedUsersList = deniedUsersList.filter(id => id !== userId);
      roleStateSettings.deniedUsers = deniedUsersList.join(",");

      // Update settings
      await api.updateRoleStateSettings($currentGuild.id, roleStateSettings);
      showNotificationMessage("User removed from deny list", "success");
    } catch (err) {
      logger.error("Failed to remove denied user:", err);
      showNotificationMessage("Failed to update deny list", "error");
    }
  }

  async function saveAllUserRoleStates() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      savingAllStates = true;
      const result = await api.saveAllUserRoleStates($currentGuild.id);
      showNotificationMessage(`Saved role states for ${result.savedCount} users`, "success");
      await fetchRoleStates();
    } catch (err) {
      logger.error("Failed to save all user role states:", err);
      showNotificationMessage("Failed to save user role states", "error");
    } finally {
      savingAllStates = false;
    }
  }

  function getRoleName(roleId: string): string {
    const role = guildRoles.find(r => r.id === roleId);
    return role ? role.name : `Role ID: ${roleId}`;
  }

  function getUserName(userId: string): string {
    const user = guildMembers.find(u => u.id === userId);
    return user ? user.username : `User ID: ${userId}`;
  }

  function toggleRoleSelection(roleId: string) {
    const index = selectedRoleIds.indexOf(roleId);
    if (index === -1) {
      selectedRoleIds = [...selectedRoleIds, roleId];
    } else {
      selectedRoleIds = selectedRoleIds.filter(id => id !== roleId);
    }
  }

  onMount(() => {
    if (!$currentGuild) goto("/dashboard");
    Promise.all([
      fetchRoleStateSettings(),
      fetchRoleStates(),
      fetchGuildRoles(),
      fetchGuildMembers(),
      fetchBotStatus()
    ]);
    checkMobile();

    if (browser) {
      window.addEventListener("resize", checkMobile);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener("resize", checkMobile);
    }
  });


    run(() => {
        if ($currentInstance) {
            Promise.all([
                fetchRoleStateSettings(),
                fetchRoleStates(),
                fetchGuildRoles(),
                fetchGuildMembers(),
                fetchBotStatus()
            ]);
        }
    });
  // Reactive declarations for guild changes
    run(() => {
        if ($currentGuild) {
            fetchRoleStateSettings();
            fetchRoleStates();
            fetchGuildRoles();
            fetchGuildMembers();
        }
    });
  // Reactive declarations for instance changes
    run(() => {
        if ($currentInstance) {
            fetchRoleStateSettings();
            fetchRoleStates();
            fetchGuildRoles();
            fetchGuildMembers();
        }
    });
</script>

<DashboardPageLayout 
  title="Role States" 
  actionButtons={[
    {
      label: "Save All States",
      icon: "fa-floppy-disk",
      action: saveAllUserRoleStates,
      loading: savingAllStates
    },
    {
      label: "Refresh",
      icon: "fa-arrows-rotate",
      action: () => {
        fetchRoleStateSettings();
        fetchRoleStates();
        fetchGuildRoles();
        fetchGuildMembers();
      },
      loading: loadingSettings || loadingStates
    }
  ]}
  icon="fa-users"
  {tabs}
  bind:activeTab
  subtitle="Save user roles when they leave and restore them when they return"
  guildName={$currentGuild?.name || "Dashboard"}
  on:tabChange={(e) => activeTab = e.detail.tabId}
>
    <!-- @migration-task: migrate this slot by hand, `status-messages` is an invalid identifier -->
  <svelte:fragment slot="status-messages">
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}
  </svelte:fragment>

  {#if activeTab === 'settings'}
    <!-- Settings Section -->
    <section
            class="backdrop-blur-xs rounded-2xl border p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="flex items-center gap-3 mb-6">
        <div
          class="p-3 rounded-xl"
          style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                 color: {$colorStore.primary};"
        >
          <i class="fa-utility-duo fa-regular fa-gear"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"
             aria-hidden="true"></i>
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Role States Settings</h2>
      </div>

      <!-- Settings Tabs -->
      <div class="mb-6">
        <div class="flex mb-4 border-b" style="border-color: {$colorStore.primary}20;">
          <button
            class="px-4 py-2 border-b-2 transition-colors"
            class:font-medium={settingsTab === 'general'}
            onclick={() => settingsTab = 'general'}
            style="border-color: {settingsTab === 'general' ? $colorStore.primary : 'transparent'};
                   color: {settingsTab === 'general' ? $colorStore.text : $colorStore.muted};"
          >
            General
          </button>
          <button
            class="px-4 py-2 border-b-2 transition-colors"
            class:font-medium={settingsTab === 'denied'}
            onclick={() => settingsTab = 'denied'}
            style="border-color: {settingsTab === 'denied' ? $colorStore.primary : 'transparent'};
                   color: {settingsTab === 'denied' ? $colorStore.text : $colorStore.muted};"
          >
            Deny List
          </button>
        </div>
      </div>

      {#if loadingSettings}
        <div class="flex justify-center items-center min-h-[100px]">
          <div
            class="w-8 h-8 border-3 rounded-full animate-spin"
            style="border-color: {$colorStore.primary}20;
                   border-top-color: {$colorStore.primary};"
            aria-label="Loading"
          >
          </div>
        </div>
      {:else if errorSettings}
        <div
          class="rounded-xl p-4 flex items-center gap-3"
          style="background: {$colorStore.accent}10;"
          role="alert"
        >
          <i class="fa-utility-duo fa-regular fa-bell"
             style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"
             aria-hidden="true"></i>
          <p style="color: {$colorStore.accent}">{errorSettings}</p>
        </div>
      {:else if settingsTab === 'general'}
        <!-- General Settings -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Enable Role States -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold" style="color: {$colorStore.text}">Role States</h3>
                <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                  {roleStateSettings.enabled
                    ? 'Currently remembering user roles when they leave'
                    : 'Not currently saving user roles'}
                </p>
              </div>
              <button 
                class="p-2 rounded-lg transition-all duration-200"
                onclick={toggleRoleStates}
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};"
                aria-label={roleStateSettings.enabled ? "Disable Role States" : "Enable Role States"}
              >
                {#if roleStateSettings.enabled}
                  <i class="fa-solid fa-toggle-on" style="font-size: 24px;"></i>
                {:else}
                  <i class="fa-solid fa-toggle-off" style="font-size: 24px;"></i>
                {/if}
              </button>
            </div>
          </div>

          <!-- Clear on Ban -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.accent}10;"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold" style="color: {$colorStore.text}">Clear on Ban</h3>
                <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                  {roleStateSettings.clearOnBan
                    ? 'Role states will be deleted when a user is banned'
                    : 'Role states will be kept when a user is banned'}
                </p>
              </div>
              <button 
                class="p-2 rounded-lg transition-all duration-200"
                onclick={toggleClearOnBan}
                disabled={!roleStateSettings.enabled}
                style="background: {$colorStore.accent}20;
                       color: {$colorStore.text};
                       opacity: {!roleStateSettings.enabled ? '0.5' : '1'};"
                aria-label={roleStateSettings.clearOnBan ? "Don't clear on ban" : "Clear on ban"}
              >
                {#if roleStateSettings.clearOnBan}
                  <i class="fa-solid fa-toggle-on" style="font-size: 24px;"></i>
                {:else}
                  <i class="fa-solid fa-toggle-off" style="font-size: 24px;"></i>
                {/if}
              </button>
            </div>
          </div>

          <!-- Ignore Bots -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.secondary}10;"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold" style="color: {$colorStore.text}">Ignore Bots</h3>
                <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                  {roleStateSettings.ignoreBots
                    ? 'Bot roles will not be saved'
                    : 'Bot roles will be saved just like user roles'}
                </p>
              </div>
              <button 
                class="p-2 rounded-lg transition-all duration-200"
                onclick={toggleIgnoreBots}
                disabled={!roleStateSettings.enabled}
                style="background: {$colorStore.secondary}20;
                       color: {$colorStore.text};
                       opacity: {!roleStateSettings.enabled ? '0.5' : '1'};"
                aria-label={roleStateSettings.ignoreBots ? "Don't ignore bots" : "Ignore bots"}
              >
                {#if roleStateSettings.ignoreBots}
                  <i class="fa-solid fa-toggle-on" style="font-size: 24px;"></i>
                {:else}
                  <i class="fa-solid fa-toggle-off" style="font-size: 24px;"></i>
                {/if}
              </button>
            </div>
          </div>

          <!-- Save All User States -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-semibold" style="color: {$colorStore.text}">Save Current States</h3>
                <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                  Save role states for all current server members
                </p>
              </div>
              <button
                class="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                onclick={saveAllUserRoleStates}
                disabled={!roleStateSettings.enabled || savingAllStates}
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};
                       opacity: {!roleStateSettings.enabled || savingAllStates ? '0.5' : '1'};"
              >
                {#if savingAllStates}
                  <div
                    class="w-4 h-4 border-2 rounded-full animate-spin"
                    style="border-color: {$colorStore.text}20;
                           border-top-color: {$colorStore.text};"
                  ></div>
                {:else}
                  <i class="fa-solid fa-floppy-disk" style="font-size: 16px;"></i>
                {/if}
                <span>Save All</span>
              </button>
            </div>
          </div>
        </div>
      {:else if settingsTab === 'denied'}
        <!-- Denied Roles/Users -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Denied Roles Section -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">Denied Roles</h3>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">
              Roles in this list will not be saved or restored
            </p>

            <!-- Add Denied Role -->
            <div class="flex gap-2 mb-4">
              <select
                id="denied-role-select"
                bind:value={selectedDeniedRoleId}
                class="flex-1 p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                disabled={!roleStateSettings.enabled}
              >
                <option value="">Select a Role</option>
                {#each guildRoles.filter(r => r.name !== '@everyone') as role}
                  <option value={role.id}>{role.name}</option>
                {/each}
              </select>
              <button
                class="px-3 py-1 rounded-lg transition-all duration-200 flex items-center gap-1"
                onclick={addDeniedRole}
                disabled={!roleStateSettings.enabled || !selectedDeniedRoleId}
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};
                       opacity: {!roleStateSettings.enabled || !selectedDeniedRoleId ? '0.5' : '1'};"
              >
                <i class="fa-solid fa-shield" style="font-size: 16px;"></i>
                <span>Add</span>
              </button>
            </div>

            <!-- Denied Roles List -->
            <div
              class="p-3 rounded-lg max-h-40 overflow-y-auto"
              style="background: {$colorStore.primary}15;"
            >
              {#if deniedRolesList.length === 0}
                <p class="text-sm italic" style="color: {$colorStore.muted}">No roles are being excluded</p>
              {:else}
                <ul class="space-y-2">
                  {#each deniedRolesList as roleId}
                    <li class="flex items-center justify-between p-2 rounded-lg"
                        style="background: {$colorStore.primary}10;">
                      <span style="color: {$colorStore.text}">{getRoleName(roleId)}</span>
                      <button
                              class="p-1 rounded-sm transition-all duration-200"
                        onclick={() => removeDeniedRole(roleId)}
                        disabled={!roleStateSettings.enabled}
                        style="background: {$colorStore.accent}20;
                               color: {$colorStore.accent};
                               opacity: {!roleStateSettings.enabled ? '0.5' : '1'};"
                        aria-label="Remove denied role"
                      >
                        <i class="fa-solid fa-minus" style="font-size: 16px;"></i>
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          </div>

          <!-- Denied Users Section -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.secondary}10;"
          >
            <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">Denied Users</h3>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">
              Users in this list will not have their roles saved or restored
            </p>

            <!-- Add Denied User -->
            <div class="flex gap-2 mb-4">
              <select
                id="denied-user-select"
                bind:value={selectedDeniedUserId}
                class="flex-1 p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                disabled={!roleStateSettings.enabled}
              >
                <option value="">Select a User</option>
                {#each guildMembers as member}
                  <option value={member.id}>{member.username}</option>
                {/each}
              </select>
              <button
                class="px-3 py-1 rounded-lg transition-all duration-200 flex items-center gap-1"
                onclick={addDeniedUser}
                disabled={!roleStateSettings.enabled || !selectedDeniedUserId}
                style="background: {$colorStore.secondary}20;
                       color: {$colorStore.text};
                       opacity: {!roleStateSettings.enabled || !selectedDeniedUserId ? '0.5' : '1'};"
              >
                <i class="fa-solid fa-user-minus" style="font-size: 16px;"></i>
                <span>Add</span>
              </button>
            </div>

            <!-- Denied Users List -->
            <div
              class="p-3 rounded-lg max-h-40 overflow-y-auto"
              style="background: {$colorStore.secondary}15;"
            >
              {#if deniedUsersList.length === 0}
                <p class="text-sm italic" style="color: {$colorStore.muted}">No users are being excluded</p>
              {:else}
                <ul class="space-y-2">
                  {#each deniedUsersList as userId}
                    <li class="flex items-center justify-between p-2 rounded-lg"
                        style="background: {$colorStore.secondary}10;">
                      <span style="color: {$colorStore.text}">{getUserName(userId)}</span>
                      <button
                              class="p-1 rounded-sm transition-all duration-200"
                        onclick={() => removeDeniedUser(userId)}
                        disabled={!roleStateSettings.enabled}
                        style="background: {$colorStore.accent}20;
                               color: {$colorStore.accent};
                               opacity: {!roleStateSettings.enabled ? '0.5' : '1'};"
                        aria-label="Remove denied user"
                      >
                        <i class="fa-solid fa-minus" style="font-size: 16px;"></i>
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </section>
  {/if}

  {#if activeTab === 'management'}
    <!-- Management Section would go here -->
    <section class="text-center py-12">
      <i class="fa-utility-duo fa-regular fa-user"
         style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; display: block; margin: 0 auto 16px;"></i>
      <p style="color: {$colorStore.muted}">Role management functionality</p>
    </section>
  {/if}
  
  {#if activeTab === 'states'}
    <!-- Role States List would go here -->
    <section class="text-center py-12">
      <i class="fa-utility-duo fa-regular fa-users"
         style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; display: block; margin: 0 auto 16px;"></i>
      <p style="color: {$colorStore.muted}">Role states list functionality</p>
    </section>
  {/if}
</DashboardPageLayout>


<style lang="postcss">
    /* Custom styling for options */
    option {
        background-color: #374151;
        color: white;
        padding: 0.5rem;
    }

    :global(.input-field) {
        transition: all 0.2s ease;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    :global(.input-field:focus) {
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
    }

    /* Prevent stretch in Safari */
    select {
        min-height: 44px;
    }

    /* Improve touchable area on mobile */
    @media (max-width: 768px) {
    }
</style>