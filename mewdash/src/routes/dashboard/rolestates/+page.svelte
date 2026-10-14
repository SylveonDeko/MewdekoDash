<!-- routes/dashboard/rolestates/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";


  import { onMount } from "svelte";
  import { roleStatesApi, clientApi, type RoleStateSetting, type UserRoleState } from "$lib/api/index.ts";
    import {currentGuild} from "$lib/stores/currentGuild.ts";
    import {fade} from "svelte/transition";
    import {goto} from "$app/navigation";
    import Notification from "$lib/components/ui/Notification.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
    import {colorStore} from "$lib/stores/colorStore";
    import {logger} from "$lib/logger.ts";
    import {loadingStore} from "$lib/stores/loadingStore";

  // State management
    let showNotification = $state(false);
    let notificationMessage = $state("");
    let notificationType: "success" | "error" = $state("success");

  // Role States Settings
  let roleStateSettings: RoleStateSetting | null = $state(null);

  // Parsed denied items
    let deniedRolesList: string[] = $state([]);
    let deniedUsersList: string[] = $state([]);

  // Role States
  let roleStates: UserRoleState[] = $state([]);

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

  // Pagination for states
  let statesPage = $state(1);
  let statesPageSize = $state(20);
  let totalStatesPages = $derived(Math.ceil(roleStates.length / statesPageSize));
  let paginatedStates = $derived(roleStates.slice((statesPage - 1) * statesPageSize, statesPage * statesPageSize));

  // Active tab for settings
    let settingsTab: "general" | "denied" = $state("general");

  // Layout state
    let activeTab = $state("settings");

  const tabs = $derived([
    { id: "settings", label: m.common.settings(), icon: "fa-gear" },
    { id: "management", label: m.common.management(), icon: "fa-users" },
    { id: "states", label: m.features.rolestatesName(), icon: "fa-user-plus" }
  ]);

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
          throw new Error(m.common.noGuildSelected());
        }

        roleStateSettings = await roleStatesApi.getRoleStateSettings($currentGuild.id);

        // Parse denied lists
        if (roleStateSettings) {
          parseDeniedLists();
        }
      } catch (err) {
        logger.error("Failed to fetch role state settings:", err);
        errorSettings = err instanceof Error ? err.message : m.rolestates.fetchSettingsFailed();
      } finally {
        loadingSettings = false;
      }
    }, "api", m.common.loadingSettings());
  }

  function parseDeniedLists() {
    if (roleStateSettings?.deniedRoles) {
      deniedRolesList = roleStateSettings.deniedRoles.split(",");
    } else {
      deniedRolesList = [];
    }

    if (roleStateSettings?.deniedUsers) {
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
        throw new Error(m.common.noGuildSelected());
      }

      roleStates = await roleStatesApi.getAllRoleStates($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch role states:", err);
      errorStates = err instanceof Error ? err.message : m.rolestates.fetchStatesFailed();
    } finally {
      loadingStates = false;
    }
  }

  async function fetchGuildRoles() {
    try {
      if (!$currentGuild?.id) {
        throw new Error(m.common.noGuildSelected());
      }

      guildRoles = await clientApi.getRoles($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch guild roles:", err);
    }
  }

  async function fetchGuildMembers() {
    try {
      if (!$currentGuild?.id) {
        throw new Error(m.common.noGuildSelected());
      }

      guildMembers = await clientApi.getMembers($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch guild members:", err);
    }
  }

  async function toggleRoleStates() {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());

      const result = await roleStatesApi.toggleRoleStates($currentGuild.id);
      showNotificationMessage(result ? m.rolestates.notifyRoleStatesEnabled() : m.rolestates.notifyRoleStatesDisabled(), "success");
      await fetchRoleStateSettings();
    } catch (err) {
      logger.error("Failed to toggle role states:", err);
      showNotificationMessage(m.common.notifyUpdateFailed(), "error");
    }
  }

  async function toggleClearOnBan() {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());

      const result = await roleStatesApi.toggleClearOnBan($currentGuild.id);
      showNotificationMessage(result ? m.rolestates.notifyClearOnBanEnabled() : m.rolestates.notifyClearOnBanDisabled(), "success");
      await fetchRoleStateSettings();
    } catch (err) {
      logger.error("Failed to toggle clear on ban:", err);
      showNotificationMessage(m.common.notifyUpdateFailed(), "error");
    }
  }

  async function toggleIgnoreBots() {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());

      const result = await roleStatesApi.toggleIgnoreBots($currentGuild.id);
      showNotificationMessage(result ? m.rolestates.notifyIgnoreBotsEnabled() : m.rolestates.notifyIgnoreBotsDisabled(), "success");
      await fetchRoleStateSettings();
    } catch (err) {
      logger.error("Failed to toggle ignore bots:", err);
      showNotificationMessage(m.common.notifyUpdateFailed(), "error");
    }
  }

  async function deleteUserRoleState(userId: string) {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      if (!userId) throw new Error(m.rolestates.errorNoUser());

      await roleStatesApi.deleteUserRoleState($currentGuild.id, BigInt(userId));
      showNotificationMessage(m.rolestates.notifyStateDeleted(), "success");
      await fetchRoleStates();
      viewingUserId = null;
    } catch (err) {
      logger.error("Failed to delete user role state:", err);
      showNotificationMessage(m.rolestates.notifyStateDeleteFailed(), "error");
    }
  }

  async function addRolesToUser() {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      if (!selectedUserId) throw new Error(m.rolestates.errorNoUser());
      if (selectedRoleIds.length === 0) throw new Error(m.rolestates.errorNoRoles());

      await roleStatesApi.addRolesToUser($currentGuild.id, BigInt(selectedUserId), selectedRoleIds.map(id => BigInt(id)));
      showNotificationMessage(m.rolestates.notifyRolesAdded(), "success");
      selectedRoleIds = [];
      await fetchRoleStates();
    } catch (err) {
      logger.error("Failed to add roles to user:", err);
      showNotificationMessage(err instanceof Error ? err.message : m.rolestates.notifyRolesAddFailed(), "error");
    }
  }

  async function removeRolesFromUser() {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      if (!selectedUserId) throw new Error(m.rolestates.errorNoUser());
      if (selectedRoleIds.length === 0) throw new Error(m.rolestates.errorNoRoles());

      await roleStatesApi.removeRolesFromUser($currentGuild.id, BigInt(selectedUserId), selectedRoleIds.map(id => BigInt(id)));
      showNotificationMessage(m.rolestates.notifyRolesRemoved(), "success");
      selectedRoleIds = [];
      await fetchRoleStates();
    } catch (err) {
      logger.error("Failed to remove roles from user:", err);
      showNotificationMessage(err instanceof Error ? err.message : m.rolestates.notifyRolesRemoveFailed(), "error");
    }
  }

  async function applyRoleState() {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      if (!sourceUserId) throw new Error(m.rolestates.errorNoSource());
      if (!targetUserId) throw new Error(m.rolestates.errorNoTarget());

      await roleStatesApi.applyRoleState($currentGuild.id, BigInt(sourceUserId), BigInt(targetUserId));
      showNotificationMessage(m.rolestates.notifyStateApplied(), "success");
      sourceUserId = "";
      targetUserId = "";
    } catch (err) {
      logger.error("Failed to apply role state:", err);
      showNotificationMessage(m.rolestates.notifyStateApplyFailed(), "error");
    }
  }

  async function addDeniedRole() {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      if (!selectedDeniedRoleId) throw new Error(m.common.noRoleSelected());
      if (!roleStateSettings) throw new Error(m.common.settingsNotLoaded());

      // Check if role is already denied
      if (deniedRolesList.includes(selectedDeniedRoleId)) {
        showNotificationMessage(m.rolestates.notifyRoleAlreadyDenied(), "error");
        return;
      }

      // Add role to denied list
      deniedRolesList = [...deniedRolesList, selectedDeniedRoleId];
      roleStateSettings.deniedRoles = deniedRolesList.join(",");

      // Update settings
      await roleStatesApi.updateRoleStateSettings($currentGuild.id, roleStateSettings);
      showNotificationMessage(m.rolestates.notifyRoleDenied(), "success");
      selectedDeniedRoleId = "";
    } catch (err) {
      logger.error("Failed to add denied role:", err);
      showNotificationMessage(m.rolestates.notifyDenyListFailed(), "error");
    }
  }

  async function removeDeniedRole(roleId: string) {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      if (!roleStateSettings) throw new Error(m.common.settingsNotLoaded());

      // Remove role from denied list
      deniedRolesList = deniedRolesList.filter(id => id !== roleId);
      roleStateSettings.deniedRoles = deniedRolesList.join(",");

      // Update settings
      await roleStatesApi.updateRoleStateSettings($currentGuild.id, roleStateSettings);
      showNotificationMessage(m.rolestates.notifyRoleAllowed(), "success");
    } catch (err) {
      logger.error("Failed to remove denied role:", err);
      showNotificationMessage(m.rolestates.notifyDenyListFailed(), "error");
    }
  }

  async function addDeniedUser() {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      if (!selectedDeniedUserId) throw new Error(m.rolestates.errorNoUser());
      if (!roleStateSettings) throw new Error(m.common.settingsNotLoaded());

      // Check if user is already denied
      if (deniedUsersList.includes(selectedDeniedUserId)) {
        showNotificationMessage(m.rolestates.notifyUserAlreadyDenied(), "error");
        return;
      }

      // Add user to denied list
      deniedUsersList.push(selectedDeniedUserId);
      roleStateSettings.deniedUsers = deniedUsersList.join(",");

      // Update settings
      await roleStatesApi.updateRoleStateSettings($currentGuild.id, roleStateSettings);
      showNotificationMessage(m.rolestates.notifyUserDenied(), "success");
      selectedDeniedUserId = "";
    } catch (err) {
      logger.error("Failed to add denied user:", err);
      showNotificationMessage(m.rolestates.notifyDenyListFailed(), "error");
    }
  }

  async function removeDeniedUser(userId: string) {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      if (!roleStateSettings) throw new Error(m.common.settingsNotLoaded());

      // Remove user from denied list
      deniedUsersList = deniedUsersList.filter(id => id !== userId);
      roleStateSettings.deniedUsers = deniedUsersList.join(",");

      // Update settings
      await roleStatesApi.updateRoleStateSettings($currentGuild.id, roleStateSettings);
      showNotificationMessage(m.rolestates.notifyUserAllowed(), "success");
    } catch (err) {
      logger.error("Failed to remove denied user:", err);
      showNotificationMessage(m.rolestates.notifyDenyListFailed(), "error");
    }
  }

  async function saveAllUserRoleStates() {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());

      savingAllStates = true;
      const result = await roleStatesApi.saveAllUserRoleStates($currentGuild.id);
      showNotificationMessage(m.rolestates.notifyStatesSaved({ count: result.savedCount }), "success");
      await fetchRoleStates();
    } catch (err) {
      logger.error("Failed to save all user role states:", err);
      showNotificationMessage(m.rolestates.notifyStatesSaveFailed(), "error");
    } finally {
      savingAllStates = false;
    }
  }

  function getRoleName(roleId: string): string {
    const role = guildRoles.find(r => r.id === roleId);
    return role ? role.name : m.common.roleIdLabel({ id: roleId });
  }

  function getUserName(userId: string): string {
    const user = guildMembers.find(u => u.id === userId);
    return user ? user.username : m.common.userIdLabel({ id: userId });
  }

  onMount(() => {
    if (!$currentGuild) goto("/dashboard");
    Promise.all([
      fetchRoleStateSettings(),
      fetchRoleStates(),
      fetchGuildRoles(),
      fetchGuildMembers()
    ]);
  });

  $effect(() => {
        if ($currentGuild) {
            fetchRoleStateSettings();
            fetchRoleStates();
            fetchGuildRoles();
            fetchGuildMembers();
        }
    });
</script>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  statusMessages={statusMessages}
  actionButtons={[
    {
      label: m.rolestates.actionSaveAllStates(),
      icon: "fa-floppy-disk",
      action: saveAllUserRoleStates,
      loading: savingAllStates
    },
    {
      label: m.common.refresh(),
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
  subtitle={m.features.rolestatesDescription()}
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.rolestatesName()}
>

  {#if activeTab === 'settings'}
    <!-- Settings Section -->
    <section
      class=" rounded-2xl border p-6 shadow-2xl"
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
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.rolestates.settingsTitle()}</h2>
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
            {m.rolestates.settingsTabGeneral()}
          </button>
          <button
            class="px-4 py-2 border-b-2 transition-colors"
            class:font-medium={settingsTab === 'denied'}
            onclick={() => settingsTab = 'denied'}
            style="border-color: {settingsTab === 'denied' ? $colorStore.primary : 'transparent'};
                   color: {settingsTab === 'denied' ? $colorStore.text : $colorStore.muted};"
          >
            {m.rolestates.settingsTabDenied()}
          </button>
        </div>
      </div>

      {#if loadingSettings}
        <div class="flex justify-center items-center min-h-[100px]">
          <div
            class="w-8 h-8 border-3 rounded-full animate-spin"
            style="border-color: {$colorStore.primary}20;
                   border-top-color: {$colorStore.primary};"
            aria-label={m.common.loading()}
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
                <h3 class="font-semibold" style="color: {$colorStore.text}">{m.features.rolestatesName()}</h3>
                <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                  {roleStateSettings?.enabled
                    ? m.rolestates.toggleRoleStatesOn()
                    : m.rolestates.toggleRoleStatesOff()}
                </p>
              </div>
              <button
                class="p-2 rounded-lg transition-all duration-200"
                onclick={toggleRoleStates}
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};"
                aria-label={roleStateSettings?.enabled ? m.rolestates.toggleRoleStatesDisable() : m.rolestates.toggleRoleStatesEnable()}
              >
                {#if roleStateSettings?.enabled}
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
                <h3 class="font-semibold" style="color: {$colorStore.text}">{m.rolestates.toggleClearOnBanTitle()}</h3>
                <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                  {roleStateSettings?.clearOnBan
                    ? m.rolestates.toggleClearOnBanOn()
                    : m.rolestates.toggleClearOnBanOff()}
                </p>
              </div>
              <button 
                class="p-2 rounded-lg transition-all duration-200"
                onclick={toggleClearOnBan}
                disabled={!roleStateSettings?.enabled}
                style="background: {$colorStore.accent}20;
                       color: {$colorStore.text};
                       opacity: {!roleStateSettings?.enabled ? '0.5' : '1'};"
                aria-label={roleStateSettings?.clearOnBan ? m.rolestates.toggleClearOnBanDisable() : m.rolestates.toggleClearOnBanTitle()}
              >
                {#if roleStateSettings?.clearOnBan}
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
                <h3 class="font-semibold" style="color: {$colorStore.text}">{m.common.ignoreBots()}</h3>
                <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                  {roleStateSettings?.ignoreBots
                    ? m.rolestates.toggleIgnoreBotsOn()
                    : m.rolestates.toggleIgnoreBotsOff()}
                </p>
              </div>
              <button 
                class="p-2 rounded-lg transition-all duration-200"
                onclick={toggleIgnoreBots}
                disabled={!roleStateSettings?.enabled}
                style="background: {$colorStore.secondary}20;
                       color: {$colorStore.text};
                       opacity: {!roleStateSettings?.enabled ? '0.5' : '1'};"
                aria-label={roleStateSettings?.ignoreBots ? m.rolestates.toggleIgnoreBotsDisable() : m.common.ignoreBots()}
              >
                {#if roleStateSettings?.ignoreBots}
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
                <h3 class="font-semibold" style="color: {$colorStore.text}">{m.rolestates.saveCurrentTitle()}</h3>
                <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                  {m.rolestates.saveCurrentHint()}
                </p>
              </div>
              <button
                class="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                onclick={saveAllUserRoleStates}
                disabled={!roleStateSettings?.enabled || savingAllStates}
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};
                       opacity: {!roleStateSettings?.enabled || savingAllStates ? '0.5' : '1'};"
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
                <span>{m.rolestates.saveAllButton()}</span>
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
            <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">{m.rolestates.deniedRolesTitle()}</h3>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">
              {m.rolestates.deniedRolesHint()}
            </p>

            <!-- Add Denied Role -->
            <div class="flex gap-2 mb-4">
              <div class="flex-1">
                <DiscordSelector
                  type="role"
                  options={guildRoles.filter(r => r.name !== '@everyone')}
                  bind:selected={selectedDeniedRoleId}
                  placeholder={m.common.selectARolePlaceholder()}
                  disabled={!roleStateSettings?.enabled}
                />
              </div>
              <button
                class="px-3 py-1 rounded-lg transition-all duration-200 flex items-center gap-1"
                onclick={addDeniedRole}
                disabled={!roleStateSettings?.enabled || !selectedDeniedRoleId}
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};
                       opacity: {!roleStateSettings?.enabled || !selectedDeniedRoleId ? '0.5' : '1'};"
              >
                <i class="fa-solid fa-shield" style="font-size: 16px;"></i>
                <span>{m.common.add()}</span>
              </button>
            </div>

            <!-- Denied Roles List -->
            <div
              class="p-3 rounded-lg max-h-40 overflow-y-auto"
              style="background: {$colorStore.primary}15;"
            >
              {#if deniedRolesList.length === 0}
                <p class="text-sm italic" style="color: {$colorStore.muted}">{m.rolestates.deniedRolesEmpty()}</p>
              {:else}
                <ul class="space-y-2">
                  {#each deniedRolesList as roleId}
                    <li class="flex items-center justify-between p-2 rounded-lg"
                        style="background: {$colorStore.primary}10;">
                      <span style="color: {$colorStore.text}">{getRoleName(roleId)}</span>
                      <button
                              class="p-1 rounded-sm transition-all duration-200"
                        onclick={() => removeDeniedRole(roleId)}
                              disabled={!roleStateSettings?.enabled}
                        style="background: {$colorStore.accent}20;
                               color: {$colorStore.accent};
                               opacity: {!roleStateSettings?.enabled ? '0.5' : '1'};"
                        aria-label={m.rolestates.deniedRoleRemove()}
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
            <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">{m.rolestates.deniedUsersTitle()}</h3>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">
              {m.rolestates.deniedUsersHint()}
            </p>

            <!-- Add Denied User -->
            <div class="flex gap-2 mb-4">
              <div class="flex-1">
                <DiscordSelector
                  type="user"
                  options={guildMembers.map(gm => ({ id: gm.id, name: gm.username }))}
                  bind:selected={selectedDeniedUserId}
                  placeholder={m.common.selectUserPlaceholder()}
                  disabled={!roleStateSettings?.enabled}
                />
              </div>
              <button
                class="px-3 py-1 rounded-lg transition-all duration-200 flex items-center gap-1"
                onclick={addDeniedUser}
                disabled={!roleStateSettings?.enabled || !selectedDeniedUserId}
                style="background: {$colorStore.secondary}20;
                       color: {$colorStore.text};
                       opacity: {!roleStateSettings?.enabled || !selectedDeniedUserId ? '0.5' : '1'};"
              >
                <i class="fa-solid fa-user-minus" style="font-size: 16px;"></i>
                <span>{m.common.add()}</span>
              </button>
            </div>

            <!-- Denied Users List -->
            <div
              class="p-3 rounded-lg max-h-40 overflow-y-auto"
              style="background: {$colorStore.secondary}15;"
            >
              {#if deniedUsersList.length === 0}
                <p class="text-sm italic" style="color: {$colorStore.muted}">{m.rolestates.deniedUsersEmpty()}</p>
              {:else}
                <ul class="space-y-2">
                  {#each deniedUsersList as userId}
                    <li class="flex items-center justify-between p-2 rounded-lg"
                        style="background: {$colorStore.secondary}10;">
                      <span style="color: {$colorStore.text}">{getUserName(userId)}</span>
                      <button
                              class="p-1 rounded-sm transition-all duration-200"
                        onclick={() => removeDeniedUser(userId)}
                              disabled={!roleStateSettings?.enabled}
                        style="background: {$colorStore.accent}20;
                               color: {$colorStore.accent};
                               opacity: {!roleStateSettings?.enabled ? '0.5' : '1'};"
                        aria-label={m.rolestates.deniedUserRemove()}
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
    <!-- Role Management Section -->
    <div class="space-y-6" in:fade={{ duration: 200 }}>
      <!-- Add/Remove Roles -->
      <section class="rounded-2xl border p-6 shadow-2xl"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                      border-color: {$colorStore.primary}30;">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-utility-duo fa-regular fa-user-plus"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.rolestates.manageTitle()}</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- User Selection -->
          <div>
            <label for="user-select" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              {m.common.selectUserTitle()}
            </label>
            <DiscordSelector
              type="user"
              options={guildMembers.map(gm => ({ id: gm.id, name: gm.username }))}
              bind:selected={selectedUserId}
              placeholder={m.common.selectUserPlaceholder()}
            />
          </div>

          <!-- Role Selection -->
          <div>
            <label for="role-multi-select" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              {m.rolestates.manageSelectRoles()}
            </label>
            <DiscordSelector
              type="role"
              options={guildRoles.filter(r => r.name !== '@everyone')}
              bind:selected={selectedRoleIds}
              multiple={true}
              placeholder={m.rolestates.manageRolesPlaceholder()}
            />
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            class="flex-1 px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            onclick={addRolesToUser}
            disabled={!selectedUserId || selectedRoleIds.length === 0}
            style="background: {$colorStore.primary}; color: {$colorStore.text};
                   opacity: {!selectedUserId || selectedRoleIds.length === 0 ? '0.5' : '1'};"
          >
            <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
            <span>{m.rolestates.manageAddRoles()}</span>
          </button>

          <button
            class="flex-1 px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            onclick={removeRolesFromUser}
            disabled={!selectedUserId || selectedRoleIds.length === 0}
            style="background: {$colorStore.accent}; color: {$colorStore.text};
                   opacity: {!selectedUserId || selectedRoleIds.length === 0 ? '0.5' : '1'};"
          >
            <i class="fa-solid fa-minus" style="font-size: 16px;"></i>
            <span>{m.rolestates.manageRemoveRoles()}</span>
          </button>
        </div>
      </section>

      <!-- Copy Role State -->
      <section class="rounded-2xl border p-6 shadow-2xl"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                      border-color: {$colorStore.secondary}30;">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-utility-duo fa-regular fa-copy"
             style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.rolestates.copyTitle()}</h2>
        </div>

        <p class="text-sm mb-4" style="color: {$colorStore.muted}">
          {m.rolestates.copyHint()}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="source-user" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              {m.rolestates.copySource()}
            </label>
            <DiscordSelector
              type="user"
              options={roleStates.map(s => ({ id: s.userId.toString(), name: s.userName }))}
              bind:selected={sourceUserId}
              placeholder={m.rolestates.copySourcePlaceholder()}
            />
          </div>

          <div>
            <label for="target-user" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              {m.rolestates.copyTarget()}
            </label>
            <DiscordSelector
              type="user"
              options={guildMembers.map(gm => ({ id: gm.id, name: gm.username }))}
              bind:selected={targetUserId}
              placeholder={m.rolestates.copyTargetPlaceholder()}
            />
          </div>
        </div>

        <button
          class="w-full mt-4 px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          onclick={applyRoleState}
          disabled={!sourceUserId || !targetUserId}
          style="background: {$colorStore.secondary}; color: {$colorStore.text};
                 opacity: {!sourceUserId || !targetUserId ? '0.5' : '1'};"
        >
          <i class="fa-solid fa-copy" style="font-size: 16px;"></i>
          <span>{m.rolestates.copyApply()}</span>
        </button>
      </section>
    </div>
  {/if}

  {#if activeTab === 'states'}
    <!-- Role States List Section -->
    <section class="rounded-2xl border p-6 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;">
      <div class="flex items-center gap-3 mb-6">
        <i class="fa-utility-duo fa-regular fa-users"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.rolestates.statesTitle({ count: roleStates.length })}</h2>
      </div>

      {#if loadingStates}
        <div class="flex justify-center items-center min-h-[200px]">
          <div class="w-12 h-12 border-4 rounded-full animate-spin"
               style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"></div>
        </div>
      {:else if errorStates}
        <div class="rounded-xl p-4 flex items-center gap-3"
             style="background: {$colorStore.accent}10;"
             role="alert">
          <i class="fa-utility-duo fa-regular fa-circle-exclamation"
             style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <p style="color: {$colorStore.accent}">{errorStates}</p>
        </div>
      {:else if roleStates.length === 0}
        <div class="text-center py-12">
          <i class="fa-utility-duo fa-regular fa-users"
             style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; display: block; margin: 0 auto 16px;"></i>
          <p style="color: {$colorStore.text}">{m.rolestates.statesEmptyTitle()}</p>
          <p class="text-sm mt-2" style="color: {$colorStore.muted}">
            {m.rolestates.statesEmptyHint()}
          </p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each paginatedStates as state}
            <div class="rounded-xl p-4 border transition-all hover:scale-[1.01]"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30;">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="fa-solid fa-user" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                    <span class="font-semibold" style="color: {$colorStore.text}">{state.userName}</span>
                    <span class="text-xs px-2 py-1 rounded-sm"
                          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">
                      {m.common.rolesCount({ count: state.savedRoles.split(',').length })}
                    </span>
                  </div>

                  <div class="flex flex-wrap gap-2 mt-2">
                    {#each state.savedRoles.split(',').slice(0, 5) as roleId}
                      <span class="text-xs px-2 py-1 rounded-sm"
                            style="background: {$colorStore.primary}15; color: {$colorStore.text};">
                        {getRoleName(roleId)}
                      </span>
                    {/each}
                    {#if state.savedRoles.split(',').length > 5}
                      <span class="text-xs px-2 py-1 rounded-sm"
                            style="background: {$colorStore.muted}15; color: {$colorStore.muted};">
                        {m.common.moreCount({ count: state.savedRoles.split(',').length - 5 })}
                      </span>
                    {/if}
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    class="p-2 rounded-lg transition-all duration-200"
                    onclick={() => {
                      viewingUserId = viewingUserId === state.userId.toString() ? null : state.userId.toString();
                    }}
                    style="background: {$colorStore.secondary}20; color: {$colorStore.text};"
                    aria-label={m.rolestates.statesViewDetails()}
                  >
                    <i class="fa-solid fa-{viewingUserId === state.userId.toString() ? 'eye-slash' : 'eye'}"
                       style="font-size: 16px;"></i>
                  </button>

                  <button
                    class="p-2 rounded-lg transition-all duration-200"
                    onclick={() => deleteUserRoleState(state.userId.toString())}
                    style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                    aria-label={m.rolestates.statesDelete()}
                  >
                    <i class="fa-solid fa-trash" style="font-size: 16px;"></i>
                  </button>
                </div>
              </div>

              {#if viewingUserId === state.userId.toString()}
                <div class="mt-4 pt-4 border-t" style="border-color: {$colorStore.primary}20;">
                  <h4 class="text-sm font-medium mb-3" style="color: {$colorStore.text}">{m.rolestates.statesAllRoles()}</h4>
                  <div class="flex flex-wrap gap-2">
                    {#each state.savedRoles.split(',') as roleId}
                      <span class="text-sm px-3 py-1 rounded-lg"
                            style="background: {$colorStore.primary}15; color: {$colorStore.text};">
                        {getRoleName(roleId)}
                      </span>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <!-- Pagination Controls -->
        {#if totalStatesPages > 1}
          <div class="flex items-center justify-center gap-2 mt-6">
            <button
              class="px-3 py-2 rounded-lg transition-all"
              onclick={() => statesPage = Math.max(1, statesPage - 1)}
              disabled={statesPage === 1}
              style="background: {$colorStore.primary}20; color: {$colorStore.text};
                     opacity: {statesPage === 1 ? '0.5' : '1'};"
              aria-label={m.common.previousPage()}
            >
              <i class="fa-solid fa-chevron-left" style="font-size: 14px;"></i>
            </button>

            <span class="px-4 py-2 text-sm" style="color: {$colorStore.text}">
              {m.common.pageOfTotal({ page: statesPage, total: totalStatesPages })}
            </span>

            <button
              class="px-3 py-2 rounded-lg transition-all"
              onclick={() => statesPage = Math.min(totalStatesPages, statesPage + 1)}
              disabled={statesPage === totalStatesPages}
              style="background: {$colorStore.primary}20; color: {$colorStore.text};
                     opacity: {statesPage === totalStatesPages ? '0.5' : '1'};"
              aria-label={m.common.nextPage()}
            >
              <i class="fa-solid fa-chevron-right" style="font-size: 14px;"></i>
            </button>
          </div>
        {/if}
      {/if}
    </section>
  {/if}
</DashboardPageLayout>


