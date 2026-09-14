<script lang="ts">
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { administrationApi, clientApi, type Module } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  let {
    fetchAllData,
    showConfirm,
    availableRoles = [],
    textChannels = [],
    guildChannels = []
  } = $props();

  /** Permission rule as returned by the bot's permission cache */
  interface PermissionRule {
    id: number;
    primaryTarget: number;
    primaryTargetId: bigint;
    secondaryTarget: number;
    secondaryTargetName: string | null;
    isCustomCommand: boolean;
    state: boolean;
    index: number;
  }

  interface PermissionCacheResponse {
    permRole: string | null;
    verbose: boolean;
    permissions: PermissionRule[] | null;
  }

  /** Mirrors PrimaryPermissionType in the bot */
  const PRIMARY = { User: 0, Channel: 1, Role: 2, Server: 3, Category: 4 } as const;
  /** Mirrors SecondaryPermissionType in the bot */
  const SECONDARY = { Module: 0, Command: 1, AllModules: 2 } as const;

  const primaryOptions = [
    { id: "3", name: "Whole server" },
    { id: "2", name: "A role" },
    { id: "1", name: "A channel" },
    { id: "4", name: "A category" },
    { id: "0", name: "A specific user" }
  ];

  const secondaryOptions = [
    { id: "2", name: "All modules" },
    { id: "0", name: "One module" },
    { id: "1", name: "One command" }
  ];

  const stateOptions = [
    { id: "allow", name: "Allow" },
    { id: "deny", name: "Deny" }
  ];

  let permissions = $state<PermissionCacheResponse | null>(null);
  let modules = $state<Module[]>([]);
  let loading = $state(false);
  let saving = $state(false);
  let expandedCard = $state(false);
  let showAddForm = $state(false);
  let verboseMode = $state(false);
  let permissionRole = $state<string | null>(null);
  let formError = $state("");

  let newRule = $state({
    primaryTarget: "3",
    primaryTargetId: "",
    secondaryTarget: "2",
    secondaryTargetName: "",
    state: "deny"
  });

  let categoryChannels = $state<Array<{ id: string; name: string }>>([]);

  /** Loads channel categories lazily for the category target picker */
  async function loadCategories() {
    if (!$currentGuild?.id || categoryChannels.length > 0) return;
    try {
      const cats = await clientApi.getCategories($currentGuild.id);
      categoryChannels = (cats as any[]).map(c => ({ id: c.id.toString(), name: c.name }));
    } catch (err) {
      logger.error("Failed to load categories:", err);
    }
  }

  let moduleOptions = $derived(modules.map(m => ({ id: m.name, name: m.name })));
  let commandOptions = $derived(
    modules.flatMap(m => m.commands.map(c => ({ id: c.commandName, name: c.commandName, label: `${c.commandName} (${m.name})` })))
  );

  let sortedRules = $derived((permissions?.permissions ?? []).slice().sort((a, b) => a.index - b.index));

  async function loadPermissions() {
    if (!$currentGuild?.id) return;
    try {
      loading = true;
      permissions = await administrationApi.getPermissions($currentGuild.id);
      verboseMode = permissions?.verbose ?? false;
      permissionRole = permissions?.permRole ?? null;
    } catch (err) {
      logger.error("Failed to load permissions:", err);
    } finally {
      loading = false;
    }
  }

  async function loadModules() {
    if (modules.length > 0) return;
    try {
      modules = await administrationApi.getCommandsAndModules($currentGuild?.id ?? 0n);
    } catch (err) {
      logger.error("Failed to load command list:", err);
    }
  }

  async function resetAllPermissions() {
    if (!$currentGuild?.id) return;
    try {
      saving = true;
      await administrationApi.resetPermissions($currentGuild.id);
      await loadPermissions();
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to reset permissions:", err);
    } finally {
      saving = false;
    }
  }

  async function removePermission(index: number) {
    if (!$currentGuild?.id) return;
    try {
      await administrationApi.removePermission($currentGuild.id, index);
      await loadPermissions();
    } catch (err) {
      logger.error("Failed to remove permission:", err);
    }
  }

  async function movePermission(from: number, to: number) {
    if (!$currentGuild?.id || to < 1 || to >= sortedRules.length) return;
    try {
      await administrationApi.movePermission($currentGuild.id, { from, to });
      await loadPermissions();
    } catch (err) {
      logger.error("Failed to move permission:", err);
    }
  }

  async function toggleVerboseMode() {
    if (!$currentGuild?.id) return;
    try {
      verboseMode = !verboseMode;
      await administrationApi.setVerbosePermissions($currentGuild.id, verboseMode);
      await loadPermissions();
    } catch (err) {
      logger.error("Failed to toggle verbose mode:", err);
    }
  }

  async function savePermissionRole(roleId: string | null) {
    if (!$currentGuild?.id) return;
    try {
      saving = true;
      permissionRole = roleId;
      await administrationApi.setPermissionRole($currentGuild.id, roleId ?? "");
      await loadPermissions();
    } catch (err) {
      logger.error("Failed to save permission role:", err);
    } finally {
      saving = false;
    }
  }

  async function addRule() {
    if (!$currentGuild?.id) return;
    formError = "";
    const primary = parseInt(newRule.primaryTarget);
    const secondary = parseInt(newRule.secondaryTarget);

    if (primary !== PRIMARY.Server && !newRule.primaryTargetId.trim()) {
      formError = "Pick who the rule applies to.";
      return;
    }
    if (primary === PRIMARY.User && !/^\d{15,22}$/.test(newRule.primaryTargetId.trim())) {
      formError = "Enter a valid Discord user ID.";
      return;
    }
    if (secondary !== SECONDARY.AllModules && !newRule.secondaryTargetName.trim()) {
      formError = secondary === SECONDARY.Module ? "Pick a module." : "Pick a command.";
      return;
    }

    try {
      saving = true;
      await administrationApi.addPermission($currentGuild.id, {
        primaryTarget: primary,
        primaryTargetId: primary === PRIMARY.Server ? "0" : newRule.primaryTargetId.trim(),
        secondaryTarget: secondary,
        secondaryTargetName: secondary === SECONDARY.AllModules ? "*" : newRule.secondaryTargetName.trim().toLowerCase(),
        isCustomCommand: false,
        state: newRule.state === "allow",
        index: 0
      });
      newRule = { primaryTarget: "3", primaryTargetId: "", secondaryTarget: "2", secondaryTargetName: "", state: "deny" };
      showAddForm = false;
      await loadPermissions();
    } catch (err) {
      logger.error("Failed to add permission:", err);
      formError = "Failed to add the rule. Please try again.";
    } finally {
      saving = false;
    }
  }

  /** Builds the human readable description for a rule */
  function describeRule(rule: PermissionRule): { scope: string; target: string } {
    const id = rule.primaryTargetId?.toString();
    let scope = "Everyone";
    switch (rule.primaryTarget) {
      case PRIMARY.User: scope = `User ${id}`; break;
      case PRIMARY.Channel: scope = `#${(textChannels as any[]).find(c => c.id?.toString() === id)?.name ?? id}`; break;
      case PRIMARY.Role: scope = `@${(availableRoles as any[]).find(r => r.id?.toString() === id)?.name ?? id}`; break;
      case PRIMARY.Category: scope = `Category ${(categoryChannels as any[]).find(c => c.id?.toString() === id)?.name ?? id}`; break;
      case PRIMARY.Server: scope = "Everyone in the server"; break;
    }
    let target = "all modules";
    if (rule.secondaryTarget === SECONDARY.Module) target = `module ${rule.secondaryTargetName}`;
    else if (rule.secondaryTarget === SECONDARY.Command) target = `command ${rule.secondaryTargetName}`;
    return { scope, target };
  }

  function roleColor(color: number | undefined): string {
    if (!color) return $colorStore.muted;
    return `#${color.toString(16).padStart(6, "0")}`;
  }

  $effect(() => {
    if ($currentGuild?.id) loadPermissions();
  });

  $effect(() => {
    if (showAddForm) {
      loadModules();
      loadCategories();
    }
  });
</script>

<div class=" rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 600 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div class="flex items-center gap-4">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-shield-halved"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Command Permissions</h2>
        <p class="text-sm" style="color: {$colorStore.muted}">Allow or deny commands and modules per role, channel, or user</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
        onclick={() => expandedCard = !expandedCard}
        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
      >
        <i class="fa-solid {expandedCard ? 'fa-chevron-up' : 'fa-chevron-down'}" style="font-size: 16px;"></i>
        {expandedCard ? 'Collapse' : 'Manage'}
      </button>

      {#if sortedRules.length > 1}
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
          style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
          onclick={() => showConfirm("Reset All Permissions", "This removes every custom permission rule and restores the default allow-all rule.", resetAllPermissions, "danger")}
        >
          <i class="fa-solid fa-rotate-left" style="font-size: 16px;"></i>
          Reset All
        </button>
      {/if}
    </div>
  </div>

  {#if loading && !permissions}
    <div class="text-center py-8">
      <i class="fa-solid fa-spinner fa-spin" style="color: {$colorStore.primary}; font-size: 32px;"></i>
      <p class="text-sm mt-2" style="color: {$colorStore.muted}">Loading permissions...</p>
    </div>
  {:else if permissions}
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-4 p-4 rounded-xl" style="background: {$colorStore.primary}05;">
        <div class="text-center">
          <div class="text-2xl font-bold" style="color: {$colorStore.primary}">{Math.max(sortedRules.length - 1, 0)}</div>
          <div class="text-sm" style="color: {$colorStore.muted}">Custom Rules</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-semibold" style="color: {$colorStore.primary}">{verboseMode ? 'Enabled' : 'Disabled'}</div>
          <div class="text-sm" style="color: {$colorStore.muted}">Verbose Mode</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border"
           style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-sm font-medium" style="color: {$colorStore.text}">Verbose permissions</div>
            <div class="text-xs" style="color: {$colorStore.muted}">Tell users when a rule blocks a command</div>
          </div>
          <button
            class="p-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] min-w-[44px]"
            style="color: {verboseMode ? $colorStore.secondary : $colorStore.muted}"
            onclick={toggleVerboseMode}
            role="switch"
            aria-checked={verboseMode}
            aria-label="Verbose permissions"
          >
            <i class="fa-solid {verboseMode ? 'fa-toggle-on' : 'fa-toggle-off'}" style="font-size: 24px;"></i>
          </button>
        </div>

        <div>
          <span id="permission-role-label" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Permission role</span>
          <p class="text-xs mb-2" style="color: {$colorStore.muted}">Members with this role can edit permission rules via commands</p>
          <DiscordSelector
            type="role"
            options={availableRoles}
            selected={permissionRole}
            placeholder="No permission role"
            ariaLabelledby="permission-role-label"
            disabled={saving}
            onchange={(e) => savePermissionRole(typeof e.selected === "string" ? e.selected : null)}
          />
        </div>
      </div>

      {#if expandedCard}
        <div transition:slide={{ duration: 300 }} class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h4 class="font-medium" style="color: {$colorStore.text}">Rules (checked top to bottom, first match wins)</h4>
            <button
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={() => { showAddForm = !showAddForm; formError = ""; }}
            >
              <i class="fa-solid {showAddForm ? 'fa-xmark' : 'fa-plus'}"></i>
              {showAddForm ? 'Cancel' : 'Add rule'}
            </button>
          </div>

          {#if showAddForm}
            <form class="p-4 rounded-xl border space-y-4" transition:slide
                  style="background: {$colorStore.secondary}05; border-color: {$colorStore.secondary}30;"
                  onsubmit={(e) => { e.preventDefault(); addRule(); }}>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span id="perm-state-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Action</span>
                  <DiscordSelector type="custom" options={stateOptions} selected={newRule.state} searchable={false}
                                   ariaLabelledby="perm-state-label"
                                   onchange={(e) => { if (typeof e.selected === "string") newRule.state = e.selected; }} />
                </div>
                <div>
                  <span id="perm-secondary-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">What</span>
                  <DiscordSelector type="custom" options={secondaryOptions} selected={newRule.secondaryTarget} searchable={false}
                                   ariaLabelledby="perm-secondary-label"
                                   onchange={(e) => { if (typeof e.selected === "string") { newRule.secondaryTarget = e.selected; newRule.secondaryTargetName = ""; } }} />
                </div>
                <div>
                  <span id="perm-primary-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">For</span>
                  <DiscordSelector type="custom" options={primaryOptions} selected={newRule.primaryTarget} searchable={false}
                                   ariaLabelledby="perm-primary-label"
                                   onchange={(e) => { if (typeof e.selected === "string") { newRule.primaryTarget = e.selected; newRule.primaryTargetId = ""; } }} />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#if newRule.secondaryTarget === "0"}
                  <div>
                    <span id="perm-module-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Module</span>
                    <DiscordSelector type="custom" options={moduleOptions} selected={newRule.secondaryTargetName || null}
                                     placeholder={modules.length ? "Select module" : "Loading modules..."}
                                     ariaLabelledby="perm-module-label"
                                     onchange={(e) => { if (typeof e.selected === "string") newRule.secondaryTargetName = e.selected; }} />
                  </div>
                {:else if newRule.secondaryTarget === "1"}
                  <div>
                    <span id="perm-command-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Command</span>
                    <DiscordSelector type="custom" options={commandOptions} selected={newRule.secondaryTargetName || null}
                                     placeholder={modules.length ? "Search commands" : "Loading commands..."}
                                     ariaLabelledby="perm-command-label"
                                     onchange={(e) => { if (typeof e.selected === "string") newRule.secondaryTargetName = e.selected; }} />
                  </div>
                {/if}

                {#if newRule.primaryTarget === "2"}
                  <div>
                    <span id="perm-role-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Role</span>
                    <DiscordSelector type="role" options={availableRoles} selected={newRule.primaryTargetId || null}
                                     placeholder="Select role" ariaLabelledby="perm-role-label"
                                     onchange={(e) => { if (typeof e.selected === "string") newRule.primaryTargetId = e.selected; }} />
                  </div>
                {:else if newRule.primaryTarget === "1"}
                  <div>
                    <span id="perm-channel-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Channel</span>
                    <DiscordSelector type="channel" options={textChannels} selected={newRule.primaryTargetId || null}
                                     placeholder="Select channel" ariaLabelledby="perm-channel-label"
                                     onchange={(e) => { if (typeof e.selected === "string") newRule.primaryTargetId = e.selected; }} />
                  </div>
                {:else if newRule.primaryTarget === "4"}
                  <div>
                    <span id="perm-category-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Category</span>
                    <DiscordSelector type="custom" options={categoryChannels} selected={newRule.primaryTargetId || null}
                                     placeholder="Select category" ariaLabelledby="perm-category-label"
                                     onchange={(e) => { if (typeof e.selected === "string") newRule.primaryTargetId = e.selected; }} />
                  </div>
                {:else if newRule.primaryTarget === "0"}
                  <div>
                    <label for="perm-user-id" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">User ID</label>
                    <input id="perm-user-id" type="text" inputmode="numeric" bind:value={newRule.primaryTargetId}
                           placeholder="Paste a Discord user ID"
                           class="w-full px-4 py-3 rounded-lg border min-h-[44px]"
                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
                  </div>
                {/if}
              </div>

              {#if formError}
                <div class="p-3 rounded-lg flex items-center gap-2 text-sm" role="alert"
                     style="background: #ef444420; border: 1px solid #ef444430; color: #ef4444;">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  <span>{formError}</span>
                </div>
              {/if}

              <button type="submit" disabled={saving}
                      class="px-4 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] min-h-[44px] disabled:opacity-50 flex items-center gap-2"
                      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
                {#if saving}<i class="fa-solid fa-spinner fa-spin"></i>{:else}<i class="fa-solid fa-plus"></i>{/if}
                Add rule
              </button>
            </form>
          {/if}

          {#if sortedRules.length <= 1}
            <div class="text-center py-6 rounded-lg" style="background: {$colorStore.primary}05;">
              <i class="fa-utility-duo fa-regular fa-shield-halved"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 32px; opacity: 0.5;"></i>
              <p class="text-sm mt-2" style="color: {$colorStore.muted}">No custom rules yet. Every command is allowed for everyone.</p>
            </div>
          {:else}
            <div class="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
              {#each sortedRules as rule, position (rule.id)}
                {@const info = describeRule(rule)}
                {@const isRoot = rule.index === 0}
                <div class="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border"
                     style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                  <span class="text-xs font-mono px-2 py-1 rounded-sm shrink-0"
                        style="background: {$colorStore.primary}15; color: {$colorStore.muted};">#{rule.index}</span>
                  <span class="px-2 py-1 rounded-sm text-xs font-semibold uppercase shrink-0"
                        style="background: {rule.state ? '#10b98120' : '#ef444420'}; color: {rule.state ? '#10b981' : '#ef4444'};">
                    {rule.state ? 'Allow' : 'Deny'}
                  </span>
                  <div class="flex-1 min-w-0 text-sm" style="color: {$colorStore.text}">
                    <span class="font-medium">{info.target}</span>
                    <span style="color: {$colorStore.muted}"> for </span>
                    <span class="font-medium" style="color: {rule.primaryTarget === PRIMARY.Role ? roleColor((availableRoles as any[]).find(r => r.id?.toString() === rule.primaryTargetId?.toString())?.color) : $colorStore.text}">{info.scope}</span>
                  </div>
                  {#if isRoot}
                    <span class="px-3 py-1 rounded-lg text-xs shrink-0"
                          style="background: {$colorStore.muted}20; color: {$colorStore.muted};">
                      <i class="fa-solid fa-lock"></i> Default
                    </span>
                  {:else}
                    <div class="flex items-center gap-1 shrink-0">
                      <button class="p-2 rounded-lg transition-all hover:scale-[1.05] min-h-[36px] min-w-[36px] disabled:opacity-30"
                              style="background: {$colorStore.secondary}15; color: {$colorStore.secondary};"
                              disabled={rule.index <= 1}
                              onclick={() => movePermission(rule.index, rule.index - 1)}
                              aria-label="Move rule up">
                        <i class="fa-solid fa-arrow-up" style="font-size: 12px;"></i>
                      </button>
                      <button class="p-2 rounded-lg transition-all hover:scale-[1.05] min-h-[36px] min-w-[36px] disabled:opacity-30"
                              style="background: {$colorStore.secondary}15; color: {$colorStore.secondary};"
                              disabled={position >= sortedRules.length - 1}
                              onclick={() => movePermission(rule.index, rule.index + 1)}
                              aria-label="Move rule down">
                        <i class="fa-solid fa-arrow-down" style="font-size: 12px;"></i>
                      </button>
                      <button
                        class="px-3 py-2 rounded-lg text-sm transition-all hover:scale-[1.02] min-h-[36px]"
                        style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                        onclick={() => showConfirm("Remove Rule", `Remove rule #${rule.index}: ${rule.state ? 'allow' : 'deny'} ${info.target} for ${info.scope}?`, () => removePermission(rule.index))}
                      >
                        Remove
                      </button>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {:else}
    <div class="text-center py-8">
      <p class="text-sm" style="color: {$colorStore.muted}">Permissions could not be loaded.</p>
    </div>
  {/if}
</div>
