<!-- routes/dashboard/rolestates/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade } from "svelte/transition";
  import type { BotStatusModel } from "$lib/types/models.ts";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/Notification.svelte";
  import {
    AlertCircle,
    ExternalLink,
    Eye,
    ListMinus,
    Plus,
    Save,
    Settings,
    ShieldOff,
    ToggleLeft,
    ToggleRight,
    Trash,
    UserMinus,
    UserPlus,
    Users,
    UserX
  } from "lucide-svelte";
  import { browser } from "$app/environment";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import type { PageData } from "./$types";

  export let data: PageData;

  // State management
  let botStatus: BotStatusModel | null = null;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let isMobile = false;

  // Role States Settings
  let roleStateSettings = {
    guildId: "",
    enabled: false,
    clearOnBan: false,
    ignoreBots: false,
    deniedRoles: "",
    deniedUsers: ""
  };

  // Parsed denied items
  let deniedRolesList: string[] = [];
  let deniedUsersList: string[] = [];

  // Role States
  let roleStates: Array<{
    id: number;
    userId: string;
    guildId: string;
    savedRoles: string;
    userName: string;
  }> = [];

  // Guild roles and users
  let guildRoles: Array<{
    id: string;
    name: string;
  }> = [];

  let guildMembers: Array<{
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  }> = [];

  // Role management states
  let selectedUserId = "";
  let sourceUserId = "";
  let targetUserId = "";
  let selectedRoleIds: string[] = [];
  let selectedUserRoles: string[] = [];
  let viewingUserId: string | null = null;

  // Denied roles/users management
  let selectedDeniedRoleId = "";
  let selectedDeniedUserId = "";

  // Management
  let loadingSettings = true;
  let loadingStates = true;
  let savingAllStates = false;
  let errorSettings: string | null = null;
  let errorStates: string | null = null;

  // Active tab for settings
  let settingsTab: "general" | "denied" = "general";

  // Fetch bot status
  async function fetchBotStatus() {
    try {
      botStatus = await api.getBotStatus();
    } catch (err) {
      logger.error("Failed to fetch bot status:", err);
    }
  }

  $: if ($currentInstance) {
    Promise.all([
      fetchRoleStateSettings(),
      fetchRoleStates(),
      fetchGuildRoles(),
      fetchGuildMembers(),
      fetchBotStatus()
    ]);
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

  // Color handling
  $: colorVars = `
    --color-primary: ${$colorStore.primary};
    --color-secondary: ${$colorStore.secondary};
    --color-accent: ${$colorStore.accent};
    --color-text: ${$colorStore.text};
    --color-muted: ${$colorStore.muted};
    --color-primary-rgb: ${hexToRgb($colorStore.primary)};
    --color-secondary-rgb: ${hexToRgb($colorStore.secondary)};
    --color-accent-rgb: ${hexToRgb($colorStore.accent)};
  `;

  // Convert hex color to rgb values
  function hexToRgb(hex: string) {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }

  // Reactive declarations for guild changes
  $: if ($currentGuild) {
    fetchRoleStateSettings();
    fetchRoleStates();
    fetchGuildRoles();
    fetchGuildMembers();
  }

  // Reactive declarations for instance changes
  $: if ($currentInstance) {
    fetchRoleStateSettings();
    fetchRoleStates();
    fetchGuildRoles();
    fetchGuildMembers();
  }
</script>

<svelte:head>
  <title>Role States - Dashboard</title>
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
      <h1 class="text-3xl font-bold" style="color: {$colorStore.text}">Role States</h1>
      <p class="mt-2" style="color: {$colorStore.muted}">Save user roles when they leave and restore them when they
        return</p>
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
          <Settings aria-hidden="true" class="w-6 h-6" />
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Role States Settings</h2>
      </div>

      <!-- Settings Tabs -->
      <div class="mb-6">
        <div class="flex mb-4 border-b" style="border-color: {$colorStore.primary}20;">
          <button
            class="px-4 py-2 border-b-2 transition-colors"
            class:font-medium={settingsTab === 'general'}
            on:click={() => settingsTab = 'general'}
            style="border-color: {settingsTab === 'general' ? $colorStore.primary : 'transparent'};
                   color: {settingsTab === 'general' ? $colorStore.text : $colorStore.muted};"
          >
            General
          </button>
          <button
            class="px-4 py-2 border-b-2 transition-colors"
            class:font-medium={settingsTab === 'denied'}
            on:click={() => settingsTab = 'denied'}
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
          <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
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
                on:click={toggleRoleStates}
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};"
                aria-label={roleStateSettings.enabled ? "Disable Role States" : "Enable Role States"}
              >
                {#if roleStateSettings.enabled}
                  <ToggleRight size={24} />
                {:else}
                  <ToggleLeft size={24} />
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
                on:click={toggleClearOnBan}
                disabled={!roleStateSettings.enabled}
                style="background: {$colorStore.accent}20;
                       color: {$colorStore.text};
                       opacity: {!roleStateSettings.enabled ? '0.5' : '1'};"
                aria-label={roleStateSettings.clearOnBan ? "Don't clear on ban" : "Clear on ban"}
              >
                {#if roleStateSettings.clearOnBan}
                  <ToggleRight size={24} />
                {:else}
                  <ToggleLeft size={24} />
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
                on:click={toggleIgnoreBots}
                disabled={!roleStateSettings.enabled}
                style="background: {$colorStore.secondary}20;
                       color: {$colorStore.text};
                       opacity: {!roleStateSettings.enabled ? '0.5' : '1'};"
                aria-label={roleStateSettings.ignoreBots ? "Don't ignore bots" : "Ignore bots"}
              >
                {#if roleStateSettings.ignoreBots}
                  <ToggleRight size={24} />
                {:else}
                  <ToggleLeft size={24} />
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
                on:click={saveAllUserRoleStates}
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
                  <Save size={16} />
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
                on:click={addDeniedRole}
                disabled={!roleStateSettings.enabled || !selectedDeniedRoleId}
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};
                       opacity: {!roleStateSettings.enabled || !selectedDeniedRoleId ? '0.5' : '1'};"
              >
                <ShieldOff size={16} />
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
                        class="p-1 rounded transition-all duration-200"
                        on:click={() => removeDeniedRole(roleId)}
                        disabled={!roleStateSettings.enabled}
                        style="background: {$colorStore.accent}20;
                               color: {$colorStore.accent};
                               opacity: {!roleStateSettings.enabled ? '0.5' : '1'};"
                        aria-label="Remove denied role"
                      >
                        <ListMinus size={16} />
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
                on:click={addDeniedUser}
                disabled={!roleStateSettings.enabled || !selectedDeniedUserId}
                style="background: {$colorStore.secondary}20;
                       color: {$colorStore.text};
                       opacity: {!roleStateSettings.enabled || !selectedDeniedUserId ? '0.5' : '1'};"
              >
                <UserMinus size={16} />
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
                        class="p-1 rounded transition-all duration-200"
                        on:click={() => removeDeniedUser(userId)}
                        disabled={!roleStateSettings.enabled}
                        style="background: {$colorStore.accent}20;
                               color: {$colorStore.accent};
                               opacity: {!roleStateSettings.enabled ? '0.5' : '1'};"
                        aria-label="Remove denied user"
                      >
                        <ListMinus size={16} />
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Role States Management -->
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
          <UserPlus aria-hidden="true" class="w-6 h-6" />
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Role Management</h2>
      </div>

      <!-- Role Management Tools -->
      <div class="space-y-6">
        <!-- Add/Remove Roles Form -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">Add/Remove Roles</h3>

            <div class="space-y-4">
              <!-- User Selection -->
              <div>
                <label class="block text-sm mb-2" for="user-select" style="color: {$colorStore.muted}">
                  Select User
                </label>
                <select
                  bind:value={selectedUserId}
                  class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                  id="user-select"
                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                >
                  <option value="">Select a User</option>
                  {#each guildMembers as member}
                    <option value={member.id}>{member.username}</option>
                  {/each}
                </select>
              </div>

              <!-- Role Selection -->
              <fieldset>
                <legend class="block text-sm mb-2" style="color: {$colorStore.muted}">
                  Select Roles
                </legend>
                <div class="max-h-40 overflow-y-auto p-2 rounded-lg" style="background: {$colorStore.primary}15;">
                  {#if guildRoles.length === 0}
                    <p class="text-sm" style="color: {$colorStore.muted}">No roles available</p>
                  {:else}
                    {#each guildRoles.filter(r => r.name !== '@everyone') as role}
                      <div class="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`role-${role.id}`}
                          checked={selectedRoleIds.includes(role.id)}
                          on:change={() => toggleRoleSelection(role.id)}
                          class="mr-2"
                        />
                        <label for={`role-${role.id}`} class="text-sm" style="color: {$colorStore.text}">
                          {role.name}
                        </label>
                      </div>
                    {/each}
                  {/if}
                </div>
              </fieldset>

              <!-- Action Buttons -->
              <div class="flex gap-2">
                <button
                  class="flex-1 px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  disabled={!selectedUserId || selectedRoleIds.length === 0}
                  on:click={addRolesToUser}
                  style="background: {$colorStore.primary}20;
                         color: {$colorStore.text};
                         opacity: {!selectedUserId || selectedRoleIds.length === 0 ? '0.5' : '1'};"
                >
                  <Plus size={16} />
                  <span>Add Roles</span>
                </button>

                <button
                  class="flex-1 px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  disabled={!selectedUserId || selectedRoleIds.length === 0}
                  on:click={removeRolesFromUser}
                  style="background: {$colorStore.accent}20;
                         color: {$colorStore.text};
                         opacity: {!selectedUserId || selectedRoleIds.length === 0 ? '0.5' : '1'};"
                >
                  <Trash size={16} />
                  <span>Remove Roles</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Apply Role State Form -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.secondary}10;"
          >
            <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">Apply Role State</h3>

            <div class="space-y-4">
              <!-- Source User Selection -->
              <div>
                <label class="block text-sm mb-2" for="source-user-select" style="color: {$colorStore.muted}">
                  Source User (Copy From)
                </label>
                <select
                  bind:value={sourceUserId}
                  class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                  id="source-user-select"
                  style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                >
                  <option value="">Select Source User</option>
                  {#each roleStates as state}
                    <option value={state.userId}>{state.userName}</option>
                  {/each}
                </select>
              </div>

              <!-- Target User Selection -->
              <div>
                <label class="block text-sm mb-2" for="target-user-select" style="color: {$colorStore.muted}">
                  Target User (Apply To)
                </label>
                <select
                  bind:value={targetUserId}
                  class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                  id="target-user-select"
                  style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                >
                  <option value="">Select Target User</option>
                  {#each guildMembers as member}
                    <option value={member.id}>{member.username}</option>
                  {/each}
                </select>
              </div>

              <!-- Apply Button -->
              <button
                class="w-full px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                disabled={!sourceUserId || !targetUserId}
                on:click={applyRoleState}
                style="background: {$colorStore.secondary}20;
                       color: {$colorStore.text};
                       opacity: {!sourceUserId || !targetUserId ? '0.5' : '1'};"
              >
                <ExternalLink size={16} />
                <span>Apply Role State</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Saved Role States List -->
        <div>
          <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">Saved Role States</h3>

          {#if loadingStates}
            <div class="flex justify-center items-center min-h-[100px]">
              <div
                class="w-8 h-8 border-3 rounded-full animate-spin"
                style="border-color: {$colorStore.primary}20;
                       border-top-color: {$colorStore.primary};"
                aria-label="Loading"
              >
              </div>
            </div>
          {:else if errorStates}
            <div
              class="rounded-xl p-4 flex items-center gap-3"
              style="background: {$colorStore.accent}10;"
              role="alert"
            >
              <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
              <p style="color: {$colorStore.accent}">{errorStates}</p>
            </div>
          {:else if roleStates.length === 0}
            <div
              class="text-center py-8 rounded-xl"
              style="background: {$colorStore.primary}10;"
              transition:fade
            >
              <Users class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.muted}" aria-hidden="true" />
              <p style="color: {$colorStore.muted}">No saved role states</p>
              <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
                When users leave the server, their roles will be saved here
              </p>
            </div>
          {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each roleStates as state}
                <div
                  class="rounded-xl p-4 border hover:shadow-lg transition-all duration-200"
                  style="background: {$colorStore.primary}10;
                         border-color: {$colorStore.primary}20;
                         hover:border-color: {$colorStore.primary}40;"
                >
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <h4 class="font-medium truncate" style="color: {$colorStore.text}">
                        {state.userName || getUserName(state.userId)}
                      </h4>
                      <p class="text-xs" style="color: {$colorStore.muted}">
                        {state.savedRoles ? state.savedRoles.split(',').length : 0} saved roles
                      </p>
                    </div>
                    <div class="flex items-center">
                      <button
                        class="p-2 rounded-lg transition-all duration-200 mr-2"
                        on:click={() => getUserRoleState(state.userId)}
                        style="background: {$colorStore.primary}20;
                               color: {$colorStore.text};"
                        aria-label="View roles"
                        title="View roles"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        class="p-2 rounded-lg transition-all duration-200"
                        on:click={() => deleteUserRoleState(state.userId)}
                        style="background: {$colorStore.accent}20;
                               color: {$colorStore.accent};"
                        aria-label="Delete role state"
                        title="Delete role state"
                      >
                        <UserX size={16} />
                      </button>
                    </div>
                  </div>

                  {#if viewingUserId === state.userId}
                    <div class="p-3 rounded-lg mt-2" style="background: {$colorStore.primary}15;">
                      <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.muted}">Saved Roles</h5>
                      {#if selectedUserRoles.length === 0}
                        <p class="text-sm" style="color: {$colorStore.text}">No roles saved</p>
                      {:else}
                        <div class="flex flex-wrap gap-2">
                          {#each selectedUserRoles as roleId}
                            <div class="px-2 py-1 rounded-md text-xs"
                                 style="background: {$colorStore.secondary}20; color: {$colorStore.text};">
                              {getRoleName(roleId)}
                            </div>
                          {/each}
                        </div>
                      {/if}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

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
    input, select, textarea {
        min-height: 44px;
    }

    /* Improve touchable area on mobile */
    @media (max-width: 768px) {
        button, input[type="checkbox"], input[type="radio"] {
            min-height: 44px;
            min-width: 44px;
        }
    }
</style>