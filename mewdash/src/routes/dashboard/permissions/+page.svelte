<!-- routes/dashboard/permissions/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { fade, slide } from "svelte/transition";
  import type {
    BotStatusModel,
    CommandInfo,
    Module,
    Permission,
    PermissionCache,
    Permissionv2
  } from "$lib/types/models";
  import { PrimaryPermissionType, SecondaryPermissionType } from "$lib/types/models";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/Notification.svelte";
  import { browser } from "$app/environment";
  import {
    AlertTriangle,
    Check,
    ChevronDown,
    ChevronUp,
    Command,
    Eye,
    FolderOpen,
    Hash,
    Lock,
    Plus,
    Search,
    Server,
    Settings,
    Shield,
    Trash2
  } from "lucide-svelte";
  import { logger } from "$lib/logger.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";

  let permCache: PermissionCache | null = null;
  let loading = true;
  let error: string | null = null;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let isMobile = false;
  let botStatus: BotStatusModel | null = null;

  let moduleList: Module[] = [];
  let searchTerm = "";
  let showCommandDropdown = false;
  let commandDropdownRef: HTMLDivElement;
  let commandInputRect: DOMRect | null = null;

  // New permission form state
  let selectedPrimaryType = PrimaryPermissionType.Server;
  let selectedSecondaryType = SecondaryPermissionType.Command;
  let selectedTarget: string | null = null;
  let selectedCommandOrModule: string = "";
  let enableState = true;

  // Available options
  let availableCommands: CommandInfo[] = [];
  let availableModules: string[] = [];
  let guildRoles: Array<{ id: bigint; name: string }> = [];
  let guildChannels: Array<{ id: bigint; name: string }> = [];
  let guildCategories: Array<{ id: bigint; name: string }> = [];

  let editingPermission: Permission | null = null;
  let showPermissionDropdown = false;

  $: colors = $colorStore;

  // Deduplicate modules and process commands
  function getUniqueModules(modules) {
    const moduleMap = new Map();

    modules.forEach(module => {
      if (!moduleMap.has(module.name)) {
        moduleMap.set(module.name, {
          name: module.name,
          commands: []
        });
      }

      const existingModule = moduleMap.get(module.name);
      module.commands.forEach(command => {
        const commandWithModule = {
          ...command,
          module: module.name
        };
        // Check if command already exists to avoid duplicates
        if (!existingModule.commands.some(cmd => cmd.commandName === command.commandName)) {
          existingModule.commands.push(commandWithModule);
        }
      });
    });

    return Array.from(moduleMap.values());
  }

  // Safe filter function
  function safeFilter(item, searchTerm) {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();

    if (typeof item === "string") {
      return item.toLowerCase().includes(term);
    }

    return false;
  }

  function handleSelect(value) {
    selectedCommandOrModule = value;
    searchTerm = value;
  }

  $: processedModuleList = moduleList ? getUniqueModules(moduleList) : [];

  $: filteredModules = processedModuleList.filter(module =>
    !searchTerm ||
    module.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  $: filteredCommands = processedModuleList.flatMap(module =>
    module.commands.filter(command => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        (command.commandName || "").toLowerCase().includes(searchLower) ||
        (command.description || "").toLowerCase().includes(searchLower) ||
        (command.module || "").toLowerCase().includes(searchLower)
      );
    })
  );

  // Reset search and selection when changing types
  $: if (selectedSecondaryType) {
    searchTerm = "";
    selectedCommandOrModule = "";
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

  async function fetchPermissions() {
    try {
      loading = true;
      error = null;

      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      const [perms, roles, channels, statusResponse] = await Promise.all([
        api.getPermissions($currentGuild.id),
        api.getGuildRoles($currentGuild.id),
        api.getGuildTextChannels($currentGuild.id),
        api.getBotStatus()
      ]);

      console.log(perms);

      permCache = perms;
      guildRoles = roles;
      guildChannels = channels;
      guildCategories = channels.filter(c => c.name.includes("category"));
      botStatus = statusResponse;

    } catch (err) {
      logger.error("Failed to fetch permissions:", err);
      error = err instanceof Error ? err.message : "Failed to fetch permissions";
    } finally {
      loading = false;
    }
  }

  async function addPermission() {
    try {
      if (!$currentGuild?.id || !selectedCommandOrModule) {
        throw new Error("Missing required fields");
      }

      // For server-wide permissions, we don't need a target and should use 0 as the ID
      const targetId = selectedPrimaryType === PrimaryPermissionType.Server
        ? BigInt(0)
        : selectedTarget
          ? BigInt(selectedTarget)
          : null;

      // If we need a target but don't have one, throw error
      if (selectedPrimaryType !== PrimaryPermissionType.Server && !targetId) {
        throw new Error("Please select a target");
      }

      const permission: Permissionv2 = {
        primaryTarget: selectedPrimaryType,
        primaryTargetId: targetId,
        secondaryTarget: selectedSecondaryType,
        secondaryTargetName: selectedSecondaryType === SecondaryPermissionType.AllModules ? "*" : selectedCommandOrModule,
        state: enableState
      };

      console.log(permission);

      await api.addPermission($currentGuild.id, permission);
      showNotificationMessage("Permission added successfully");
      await fetchPermissions();
      resetForm();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to add permission",
        "error"
      );
    }
  }

  async function removePermission(index: number) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (index === 0) {
        showNotificationMessage("Cannot remove default permission", "error");
        return;
      }
      await api.removePermission($currentGuild.id, index);
      showNotificationMessage("Permission removed successfully");
      await fetchPermissions();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to remove permission",
        "error"
      );
    }
  }

  async function movePermission(from: number, to: number) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      await api.movePermission($currentGuild.id, from, to);
      showNotificationMessage("Permission moved successfully");
      await fetchPermissions();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to move permission",
        "error"
      );
    }
  }

  async function resetPermissions() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      await api.resetPermissions($currentGuild.id);
      showNotificationMessage("Permissions reset successfully");
      await fetchPermissions();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to reset permissions",
        "error"
      );
    }
  }

  async function toggleVerbose() {
    try {
      if (!$currentGuild?.id || !permCache) throw new Error("No guild selected");
      await api.setVerbose($currentGuild.id, !permCache.verbose);
      showNotificationMessage("Verbose mode updated successfully");
      await fetchPermissions();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to update verbose mode",
        "error"
      );
    }
  }

  async function updatePermissionRole(roleId: string | null) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      await api.setPermissionRole($currentGuild.id, roleId);
      showNotificationMessage("Permission role updated successfully");
      await fetchPermissions();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to update permission role",
        "error"
      );
    }
  }

  function resetForm() {
    selectedPrimaryType = PrimaryPermissionType.Server;
    selectedSecondaryType = SecondaryPermissionType.Command;
    selectedTarget = null;
    selectedCommandOrModule = "";
    enableState = true;
  }

  function getTargetOptions() {
    switch (selectedPrimaryType) {
      case PrimaryPermissionType.Channel:
        return guildChannels;
      case PrimaryPermissionType.Category:
        return guildCategories;
      case PrimaryPermissionType.Role:
        return guildRoles;
      default:
        return [];
    }
  }

  function formatPermissionName(permission: Permission): string {
    // Get target name based on primaryTarget type
    let targetName = "";
    switch (permission.primaryTarget) {
      case PrimaryPermissionType.Server:
        targetName = "Server";
        break;
      case PrimaryPermissionType.Channel:
        targetName = guildChannels.find(c => c.id === permission.primaryTargetId)?.name || "Unknown Channel";
        break;
      case PrimaryPermissionType.Category:
        targetName = guildCategories.find(c => c.id === permission.primaryTargetId)?.name || "Unknown Category";
        break;
      case PrimaryPermissionType.Role:
        targetName = guildRoles.find(r => r.id === permission.primaryTargetId)?.name || "Unknown Role";
        break;
      case PrimaryPermissionType.User:
        targetName = "User " + permission.primaryTargetId; // Could fetch username if needed
        break;
    }

    // Format secondary target
    let targetType = "";
    switch (permission.secondaryTarget) {
      case SecondaryPermissionType.Command:
        targetType = "Command";
        break;
      case SecondaryPermissionType.Module:
        targetType = "Module";
        break;
      case SecondaryPermissionType.AllModules:
        targetType = "All Modules";
        break;
    }

    // Check if it's the default permission
    if (permission.index === 0) {
      return `Default Server Permission (${permission.state ? "Enabled" : "Disabled"} ${targetType})`;
    }

    return `${permission.state ? "Enabled" : "Disabled"} ${targetType} ${permission.secondaryTargetName} for ${targetName}`;
  }

  function getFilteredItems() {
    if (selectedSecondaryType === SecondaryPermissionType.AllModules) {
      return [];
    }

    const searchLower = searchTerm.toLowerCase();

    if (selectedSecondaryType === SecondaryPermissionType.Module) {
      return moduleList
        .filter(m => m.name.toLowerCase().includes(searchLower))
        .map(m => ({
          name: m.name,
          description: `${m.commands.length} commands`
        }));
    }

    return moduleList
      .flatMap(m => m.commands
        .filter(c =>
          c.commandName.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower)
        )
        .map(c => ({
          name: c.commandName,
          description: c.description,
          module: m.name
        }))
      );
  }

  function handleCommandSelect(item: { name: string; description: string }) {
    selectedCommandOrModule = item.name;
    showCommandDropdown = false;
    searchTerm = item.name;
  }

  function handleInputFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    commandInputRect = input.getBoundingClientRect();
    showCommandDropdown = true;
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest(".command-dropdown") && !target.closest(".command-input")) {
      showCommandDropdown = false;
    }
  }

  async function fetchCommandsAndModules() {
    try {
      moduleList = await api.getCommandsAndModules();
    } catch (err) {
      logger.error("Failed to fetch commands and modules:", err);
      showNotificationMessage("Failed to fetch commands and modules", "error");
    }
  }

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    await Promise.all([
      fetchPermissions(),
      fetchCommandsAndModules()
    ]);
    await fetchPermissions();
    checkMobile();
    if (browser) {
      window.addEventListener("resize", checkMobile);
      window.addEventListener("click", handleClickOutside);
      window.addEventListener("scroll", () => {
        if (showCommandDropdown) {
          const input = document.querySelector(".command-input") as HTMLInputElement;
          if (input) {
            commandInputRect = input.getBoundingClientRect();
          }
        }
      });
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("click", handleClickOutside);
    }
  });

  $: if ($currentGuild) {
    fetchPermissions();
  }

  $: colorVars = `
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-accent: ${colors.accent};
    --color-text: ${colors.text};
    --color-muted: ${colors.muted};
  `;
</script>

<div
  class="min-h-screen p-4 md:p-6"
  style="{colorVars} background: radial-gradient(circle at top,
    {colors.gradientStart}15 0%,
    {colors.gradientMid}10 50%,
    {colors.gradientEnd}05 100%);"
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
      style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
             border-color: {colors.primary}30;"
    >
      <h1 class="text-3xl font-bold flex items-center gap-3" style="color: {colors.text}">
        <Shield class="w-8 h-8" style="color: {colors.primary}" />
        Permission Management
      </h1>
      <p class="mt-2" style="color: {colors.muted}">
        Configure command and module permissions for your server
      </p>
    </div>

    {#if loading}
      <div class="flex justify-center items-center min-h-[400px]">
        <div class="relative">
          <div
            class="w-16 h-16 border-4 rounded-full animate-spin"
            style="border-color: {colors.primary}20; border-top-color: {colors.primary}"
          ></div>
          <span class="mt-4 block text-center" style="color: {colors.muted}">Loading permissions...</span>
        </div>
      </div>
    {:else if error}
      <div
        class="p-6 rounded-xl mb-6"
        style="background: {colors.accent}10; border: 1px solid {colors.accent}40;"
        role="alert"
      >
        <div class="flex items-center gap-3">
          <AlertTriangle class="w-6 h-6" style="color: {colors.accent}" />
          <div style="color: {colors.accent}">
            <div class="font-semibold text-lg">Error Occurred</div>
            <div class="text-sm mt-1" style="color: {colors.accent}90">{error}</div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Settings Section -->
      <section
        class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
        style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
               border-color: {colors.primary}30;"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {colors.primary}20, {colors.secondary}20);
                   color: {colors.primary};"
          >
            <Settings class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {colors.text}">Permission Settings</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Verbose Mode -->
          <div
            class="rounded-xl p-4"
            style="background: {colors.primary}10;"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Eye class="w-5 h-5" style="color: {colors.primary}" />
                <div>
                  <h3 class="font-semibold" style="color: {colors.text}">Verbose Mode</h3>
                  <p class="text-sm" style="color: {colors.muted}">Show detailed permission messages</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  class="sr-only peer"
                  checked={permCache?.verbose ?? false}
                  on:change={toggleVerbose}
                />
                <div class="w-11 h-6 rounded-full peer-focus:ring-2
                          after:content-[''] after:absolute after:top-[2px]
                          after:left-[2px] after:bg-white after:rounded-full
                          after:h-5 after:w-5 after:transition-all
                          peer-checked:after:translate-x-full"
                     style="background: {permCache?.verbose ? colors.primary : `${colors.primary}20`}">
                </div>
              </label>
            </div>
          </div>

          <!-- Permission Role -->
          <div
            class="rounded-xl p-4"
            style="background: {colors.primary}10;"
          >
            <div class="flex items-center gap-2 mb-3">
              <Lock class="w-5 h-5" style="color: {colors.secondary}" />
              <h3 class="font-semibold" style="color: {colors.text}">Permission Role</h3>
            </div>
            <select
              class="w-full p-3 rounded-lg border transition-all duration-200"
              style="background: {colors.primary}20;
                     border-color: {colors.primary}30;
                     color: {colors.text}"
              on:change={(e) => updatePermissionRole(e.currentTarget.value)}
            >
              <option value="">No Permission Role</option>
              {#each guildRoles as role}
                <option
                  value={role.id}
                  selected={permCache?.permRole === role.id}
                >
                  {role.name}
                </option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Reset Button -->
        <button
          class="mt-6 py-2 px-4 rounded-lg font-medium transition-all duration-200
                 flex items-center justify-center gap-2"
          style="background: {colors.accent}20;
                 color: {colors.accent}"
          on:click={resetPermissions}
        >
          <Trash2 class="w-4 h-4" />
          Reset All Permissions
        </button>
      </section>

      <!-- Add New Permission Section -->
      <section
        class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
        style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
               border-color: {colors.primary}30;"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {colors.primary}20, {colors.secondary}20);
                   color: {colors.primary};"
          >
            <Plus class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {colors.text}">Add Permission</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Primary Target Type -->
          <div class="space-y-2">
            <label for="primary-target-type" class="flex items-center gap-2 text-sm font-medium"
                   style="color: {colors.text}">
              <Server class="w-4 h-4" style="color: {colors.primary}" />
              Target Type
            </label>
            <select
              id="primary-target-type"
              bind:value={selectedPrimaryType}
              class="w-full p-3 rounded-lg border transition-all duration-200"
              style="background: {colors.primary}10;
                     border-color: {colors.primary}30;
                     color: {colors.text}"
            >
              <option value={PrimaryPermissionType.Server}>Server</option>
              <option value={PrimaryPermissionType.Channel}>Channel</option>
              <option value={PrimaryPermissionType.Category}>Category</option>
              <option value={PrimaryPermissionType.Role}>Role</option>
              <option value={PrimaryPermissionType.User}>User</option>
            </select>
          </div>

          <!-- Target Selection -->
          {#if selectedPrimaryType !== PrimaryPermissionType.Server}
            <div class="space-y-2">
              <label for="permission-target" class="flex items-center gap-2 text-sm font-medium"
                     style="color: {colors.text}">
                <Hash class="w-4 h-4" style="color: {colors.primary}" />
                Target
              </label>
              <select
                id="permission-target"
                bind:value={selectedTarget}
                class="w-full p-3 rounded-lg border transition-all duration-200"
                style="background: {colors.primary}10;
                       border-color: {colors.primary}30;
                       color: {colors.text}"
              >
                <option value="">Select {selectedPrimaryType === PrimaryPermissionType.Channel ? 'Channel' :
                  selectedPrimaryType === PrimaryPermissionType.Category ? 'Category' :
                    selectedPrimaryType === PrimaryPermissionType.Role ? 'Role' : 'User'}</option>
                {#each getTargetOptions() as option}
                  <option value={option.id}>{option.name}</option>
                {/each}
              </select>
            </div>
          {/if}

          <!-- Secondary Type -->
          <div class="space-y-2">
            <label for="permission-type" class="flex items-center gap-2 text-sm font-medium"
                   style="color: {colors.text}">
              <Command class="w-4 h-4" style="color: {colors.secondary}" />
              Permission Type
            </label>
            <select
              id="permission-type"
              bind:value={selectedSecondaryType}
              class="w-full p-3 rounded-lg border transition-all duration-200"
              style="background: {colors.primary}10;
                     border-color: {colors.primary}30;
                     color: {colors.text}"
            >
              <option value={SecondaryPermissionType.Command}>Command</option>
              <option value={SecondaryPermissionType.Module}>Module</option>
              <option value={SecondaryPermissionType.AllModules}>All Modules</option>
            </select>
          </div>

          <!-- Command/Module Selection -->
          {#if selectedSecondaryType !== SecondaryPermissionType.AllModules}
            <div class="space-y-2">
              <label for="command-module-search" class="flex items-center gap-2 text-sm font-medium"
                     style="color: {colors.text}">
                {#if selectedSecondaryType === SecondaryPermissionType.Command}
                  <Command class="w-4 h-4" style="color: {colors.secondary}" />
                  Command
                {:else}
                  <FolderOpen class="w-4 h-4" style="color: {colors.secondary}" />
                  Module
                {/if}
              </label>

              <!-- Search input -->
              <div class="relative">
                <input
                  id="command-module-search"
                  type="text"
                  bind:value={searchTerm}
                  placeholder={selectedSecondaryType === SecondaryPermissionType.Command ? "Filter commands..." : "Filter modules..."}
                  class="w-full p-3 pl-10 rounded-t-lg border-x border-t transition-all duration-200"
                  style="background: {colors.primary}10;
               border-color: {colors.primary}30;
               color: {colors.text};"
                />
                <Search
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style="color: {colors.muted}"
                />
              </div>

              <!-- Custom Select List -->
              <div
                class="max-h-64 overflow-y-auto rounded-b-lg border-x border-b divide-y"
                style="background: {colors.primary}10;
             border-color: {colors.primary}30;
             divide-color: {colors.primary}20;"
              >
                {#if selectedSecondaryType === SecondaryPermissionType.Module}
                  {#each filteredModules as module}
                    <button
                      class="w-full p-3 text-left transition-all duration-200 flex items-center justify-between hover:bg-gray-800"
                      on:click={() => handleSelect(module.name)}
                    >
                      <div>
                        <span class="font-medium" style="color: {colors.text}">{module.name}</span>
                        <span class="text-sm ml-2" style="color: {colors.muted}">
                {module.commands.length} commands
              </span>
                      </div>
                      {#if selectedCommandOrModule === module.name}
                        <div style="color: {colors.primary}">
                          <Check class="w-4 h-4" />
                        </div>
                      {/if}
                    </button>
                  {/each}
                {:else}
                  {#each filteredCommands as command}
                    <button
                      class="w-full p-3 text-left transition-all duration-200 hover:bg-gray-800"
                      on:click={() => handleSelect(command.commandName)}
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex-1">
                <span class="font-medium" style="color: {colors.text}">
                  {command.commandName}
                </span>
                          <p class="text-sm truncate mt-1" style="color: {colors.muted}">
                            {command.description}
                          </p>
                        </div>
                        <div class="ml-3 flex items-center">
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  style="background: {colors.secondary}20;
                         color: {colors.secondary}"
                >
                  {command.module}
                </span>
                          {#if selectedCommandOrModule === command.commandName}
                            <div class="ml-2" style="color: {colors.primary}">
                              <Check class="w-4 h-4" />
                            </div>
                          {/if}
                        </div>
                      </div>
                    </button>
                  {/each}
                {/if}

                {#if (selectedSecondaryType === SecondaryPermissionType.Module && filteredModules.length === 0) ||
                (selectedSecondaryType === SecondaryPermissionType.Command && filteredCommands.length === 0)}
                  <div class="p-4 text-center" style="color: {colors.muted}">
                    No results found
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>

        <!-- Action Toggle -->
        <div class="mt-6 flex items-center gap-4">
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              class="sr-only peer"
              bind:checked={enableState}
            />
            <div class="w-11 h-6 rounded-full peer-focus:ring-2
                      after:content-[''] after:absolute after:top-[2px]
                      after:left-[2px] after:bg-white after:rounded-full
                      after:h-5 after:w-5 after:transition-all
                      peer-checked:after:translate-x-full"
                 style="background: {enableState ? colors.primary : `${colors.primary}20`}">
            </div>
            <span class="ml-3" style="color: {colors.text}">
              {enableState ? 'Enable' : 'Disable'}
            </span>
          </label>
        </div>

        <!-- Submit Button -->
        <button
          on:click={addPermission}
          disabled={selectedPrimaryType !== PrimaryPermissionType.Server && !selectedTarget}
          class="mt-6 w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                 flex items-center justify-center gap-2 disabled:opacity-50"
          style="background: linear-gradient(to right, {colors.primary}, {colors.secondary});
                 color: {colors.text};"
        >
          <Plus class="w-5 h-5" />
          Add Permission
        </button>
      </section>

      <!-- Current Permissions List -->
      <section
        class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
        style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
               border-color: {colors.primary}30;"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {colors.primary}20, {colors.secondary}20);
                   color: {colors.primary};"
          >
            <Lock class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {colors.text}">Current Permissions</h2>
        </div>

        {#if !permCache?.permissions?.length}
          <div
            class="text-center py-12"
            transition:fade
          >
            <Shield class="w-12 h-12 mx-auto mb-4" style="color: {colors.muted}" />
            <p style="color: {colors.muted}">No permissions configured</p>
            <p class="text-sm mt-2" style="color: {colors.muted}">
              Add your first permission using the form above
            </p>
          </div>
        {:else}
          <div class="space-y-4">
            {#each permCache.permissions as permission, i}
              <div
                class="rounded-xl border overflow-hidden transition-all duration-200"
                style="background: {colors.primary}10;
                       border-color: {colors.primary}30;"
                transition:slide
              >
                <div class="p-4">
                  <div class="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h3 class="font-medium flex items-center gap-2" style="color: {colors.text}">
                        Permission #{permission.index + 1}
                        {#if i === 0}
                          <span class="text-xs px-2 py-1 rounded-full"
                                style="background: {colors.primary}20;
                                       color: {colors.primary}">
                            Default
                          </span>
                        {/if}
                      </h3>
                      <p class="text-sm mt-2" style="color: {colors.muted}">
                        {formatPermissionName(permission)}
                      </p>
                    </div>
                    <div class="flex gap-2">
                      {#if i > 1}
                        <button
                          on:click={() => movePermission(i, i - 1)}
                          class="p-2 rounded-lg transition-all duration-200"
                          style="background: {colors.primary}20;
                                 color: {colors.text}"
                        >
                          <ChevronUp class="w-5 h-5" />
                        </button>
                      {/if}
                      {#if i < permCache.permissions.length - 1 && i > 0}
                        <button
                          on:click={() => movePermission(i, i + 1)}
                          class="p-2 rounded-lg transition-all duration-200"
                          style="background: {colors.primary}20;
                                 color: {colors.text}"
                        >
                          <ChevronDown class="w-5 h-5" />
                        </button>
                      {/if}
                      {#if i !== 0}
                        <button
                          on:click={() => removePermission(i)}
                          class="p-2 rounded-lg transition-all duration-200"
                          style="background: {colors.accent}20;
                                 color: {colors.accent}"
                        >
                          <Trash2 class="w-5 h-5" />
                        </button>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </section>
    {/if}
  </div>
</div>

<style lang="postcss">
    :global(body) {
        background-color: #1a202c;
        color: #ffffff;
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

    /* Add smooth transitions */
    [style*="background"],
    [style*="color"] {
        @apply transition-colors duration-300;
    }

    select, input, /* Prevent iOS styling */
    select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
    }

    /* Custom styling for options */
    option {
        background-color: #374151;
        color: white;
        padding: 0.5rem;
    }

    /* Improve hover states */

    /* Ensure the container is above other sections */
    .relative {
        isolation: isolate;
    }
</style>