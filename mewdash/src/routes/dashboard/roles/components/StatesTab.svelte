<script lang="ts">
  import { m } from "$lib/i18n";
  import { fade } from "svelte/transition";
  import { roleStatesApi, clientApi, type RoleStateSetting, type UserRoleState } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import SubTabs from "$lib/components/ui/SubTabs.svelte";
  import TabToolbar from "./TabToolbar.svelte";
  import DenyList from "./states/DenyList.svelte";
  import StateSheet from "./states/StateSheet.svelte";

  const pageSize = 20;

  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");

  let settings = $state<RoleStateSetting | null>(null);
  let roleStates: UserRoleState[] = $state([]);
  let guildRoles: Array<{ id: string; name: string }> = $state([]);
  let guildMembers: Array<{ id: string; username: string }> = $state([]);

  let selectedUserId: string | null = $state(null);
  let selectedRoleIds: string[] = $state([]);
  let sourceUserId: string | null = $state(null);
  let targetUserId: string | null = $state(null);
  let viewingUserId: string | null = $state(null);

  let loading = $state(true);
  let savingAll = $state(false);
  let statesPage = $state(1);
  let activeTab = $state("settings");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: (err) => notify(err instanceof Error && err.message ? err.message : m.common.notifyUpdateFailed(), "error")
  });

  const guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);
  const tabs = $derived([
    { id: "settings", label: m.common.settings(), icon: "fa-gear" },
    { id: "management", label: m.common.management(), icon: "fa-users" },
    { id: "states", label: m.features.rolestatesName(), icon: "fa-user-plus" }
  ]);

  const roleOptions = $derived(guildRoles.filter((r) => r.name !== "@everyone"));
  const memberOptions = $derived(guildMembers.map((gm) => ({ id: gm.id, name: gm.username })));
  const stateUserOptions = $derived(roleStates.map((s) => ({ id: s.userId.toString(), name: s.userName })));
  const roleNames = $derived(new Map(guildRoles.map((r) => [r.id, r.name])));
  const memberNames = $derived(new Map(guildMembers.map((u) => [u.id, u.username])));
  const deniedRoles = $derived(parseList(settings?.deniedRoles));
  const deniedUsers = $derived(parseList(settings?.deniedUsers));
  const enabled = $derived(settings?.enabled ?? false);
  const totalPages = $derived(Math.max(1, Math.ceil(roleStates.length / pageSize)));
  const pageStates = $derived(roleStates.slice((statesPage - 1) * pageSize, statesPage * pageSize));
  const viewing = $derived(roleStates.find((s) => s.userId.toString() === viewingUserId) ?? null);

  const flatButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function parseList(value: string | undefined | null): string[] {
    return value ? value.split(",").filter(Boolean) : [];
  }

  function roleName(id: string): string {
    return roleNames.get(id) ?? m.common.roleIdLabel({ id });
  }

  function savedRoleIds(state: UserRoleState): string[] {
    return parseList(state.savedRoles);
  }

  async function loadSettings(id: bigint) {
    try {
      settings = await roleStatesApi.getRoleStateSettings(id);
    } catch (err) {
      logger.error("Failed to fetch role state settings:", err);
      notify(err instanceof Error && err.message ? err.message : m.rolestates.fetchSettingsFailed(), "error");
    }
  }

  async function loadStates(id: bigint) {
    try {
      roleStates = await roleStatesApi.getAllRoleStates(id);
      statesPage = Math.min(statesPage, totalPages);
    } catch (err) {
      logger.error("Failed to fetch role states:", err);
      notify(err instanceof Error && err.message ? err.message : m.rolestates.fetchStatesFailed(), "error");
    }
  }

  async function loadGuildData(id: bigint) {
    try {
      const [roles, members] = await Promise.all([clientApi.getRoles(id), clientApi.getMembers(id)]);
      guildRoles = roles;
      guildMembers = members;
    } catch (err) {
      logger.error("Failed to fetch guild roles and members:", err);
    }
  }

  async function loadAll() {
    if (guildId === null) return;
    loading = true;
    await Promise.all([loadSettings(guildId), loadStates(guildId), loadGuildData(guildId)]);
    loading = false;
  }

  function toggleSetting(key: "enabled" | "clearOnBan" | "ignoreBots", call: (id: bigint) => Promise<boolean>) {
    if (!settings || guildId === null) return;
    const id = guildId;
    const previous = settings[key];
    settings[key] = !previous;
    void autoSave.now(key, async () => {
      try {
        const result = await call(id);
        if (settings) settings[key] = result;
      } catch (err) {
        if (settings) settings[key] = previous;
        throw err;
      }
    });
  }

  function setDenied(field: "deniedRoles" | "deniedUsers", list: string[]) {
    if (!settings || guildId === null) return;
    const id = guildId;
    const previous = settings[field];
    settings[field] = list.join(",");
    void autoSave.now(field, async () => {
      try {
        await roleStatesApi.updateRoleStateSettings(id, $state.snapshot(settings!) as RoleStateSetting);
      } catch (err) {
        if (settings) settings[field] = previous;
        throw err;
      }
    });
  }

  function addDenied(field: "deniedRoles" | "deniedUsers", current: string[], id: string, duplicate: string) {
    if (current.includes(id)) {
      notify(duplicate, "error");
      return;
    }
    setDenied(field, [...current, id]);
  }

  async function run(action: (id: bigint) => Promise<void>, failed: string) {
    if (guildId === null) return false;
    try {
      await action(guildId);
      return true;
    } catch (err) {
      logger.error(failed, err);
      notify(err instanceof Error && err.message ? err.message : failed, "error");
      return false;
    }
  }

  async function deleteState(userId: string) {
    const ok = await run(async (id) => {
      await roleStatesApi.deleteUserRoleState(id, BigInt(userId));
      await loadStates(id);
    }, m.rolestates.notifyStateDeleteFailed());
    if (ok) {
      notify(m.rolestates.notifyStateDeleted());
      viewingUserId = null;
    }
  }

  async function changeRoles(mode: "add" | "remove") {
    if (!selectedUserId || selectedRoleIds.length === 0) return;
    const user = BigInt(selectedUserId);
    const roleIds = selectedRoleIds.map((r) => BigInt(r));
    const ok = await run(
      async (id) => {
        if (mode === "add") await roleStatesApi.addRolesToUser(id, user, roleIds);
        else await roleStatesApi.removeRolesFromUser(id, user, roleIds);
        await loadStates(id);
      },
      mode === "add" ? m.rolestates.notifyRolesAddFailed() : m.rolestates.notifyRolesRemoveFailed()
    );
    if (ok) {
      notify(mode === "add" ? m.rolestates.notifyRolesAdded() : m.rolestates.notifyRolesRemoved());
      selectedRoleIds = [];
    }
  }

  async function applyState() {
    if (!sourceUserId || !targetUserId) return;
    const source = BigInt(sourceUserId);
    const target = BigInt(targetUserId);
    const ok = await run(
      (id) => roleStatesApi.applyRoleState(id, source, target),
      m.rolestates.notifyStateApplyFailed()
    );
    if (ok) {
      notify(m.rolestates.notifyStateApplied());
      sourceUserId = null;
      targetUserId = null;
    }
  }

  async function saveAll() {
    if (guildId === null) return;
    savingAll = true;
    try {
      const result = await roleStatesApi.saveAllUserRoleStates(guildId);
      notify(m.rolestates.notifyStatesSaved({ count: result.savedCount }));
      await loadStates(guildId);
    } catch (err) {
      logger.error("Failed to save all user role states:", err);
      notify(m.rolestates.notifyStatesSaveFailed(), "error");
    } finally {
      savingAll = false;
    }
  }

  $effect(() => {
    const key = guildId?.toString() ?? "";
    if (!key || key === loadedGuildId) return;
    loadedGuildId = key;
    void loadAll();
  });
</script>

{#if showNotification}
  <div class="fixed top-4 right-4 z-50" transition:fade>
    <Notification message={notificationMessage} type={notificationType} />
  </div>
{/if}

<div class="space-y-4 min-w-0">
  <TabToolbar
    {autoSave}
    buttons={[
      { label: m.rolestates.actionSaveAllStates(), icon: "fa-floppy-disk", action: saveAll, loading: savingAll, disabled: !enabled },
      { label: m.common.refresh(), icon: "fa-arrows-rotate", action: loadAll, loading }
    ]}
  />
  <SubTabs {tabs} bind:active={activeTab} />

  {#if activeTab === "settings"}
    <PluginCard title={m.features.rolestatesName()} enabled={enabled}
                onToggle={() => toggleSetting("enabled", roleStatesApi.toggleRoleStates)}>
      <div class="space-y-2">
        <ToggleRow checked={settings?.clearOnBan ?? false} title={m.rolestates.toggleClearOnBanTitle()}
                   colors={$colorStore}
                   onchange={() => toggleSetting("clearOnBan", roleStatesApi.toggleClearOnBan)} />
        <ToggleRow checked={settings?.ignoreBots ?? false} title={m.common.ignoreBots()}
                   colors={$colorStore}
                   onchange={() => toggleSetting("ignoreBots", roleStatesApi.toggleIgnoreBots)} />
      </div>
    </PluginCard>

    {#if enabled}
    <DenyList
      title={m.rolestates.deniedRolesTitle()}
      type="role"
      ids={deniedRoles}
      options={roleOptions}
      names={roleNames}
      emptyText={m.rolestates.deniedRolesEmpty()}
      removeLabel={m.rolestates.deniedRoleRemove()}
      placeholder={m.common.selectARolePlaceholder()}
      disabled={!enabled}
      onadd={(id) => addDenied("deniedRoles", deniedRoles, id, m.rolestates.notifyRoleAlreadyDenied())}
      onremove={(id) => setDenied("deniedRoles", deniedRoles.filter((x) => x !== id))}
    />

    <DenyList
      title={m.rolestates.deniedUsersTitle()}
      type="user"
      ids={deniedUsers}
      options={memberOptions}
      names={memberNames}
      emptyText={m.rolestates.deniedUsersEmpty()}
      removeLabel={m.rolestates.deniedUserRemove()}
      placeholder={m.common.selectUserPlaceholder()}
      disabled={!enabled}
      onadd={(id) => addDenied("deniedUsers", deniedUsers, id, m.rolestates.notifyUserAlreadyDenied())}
      onremove={(id) => setDenied("deniedUsers", deniedUsers.filter((x) => x !== id))}
    />
    {/if}
  {:else if activeTab === "management"}
    <PluginCard title={m.rolestates.manageTitle()} alwaysOpen>
      <div class="space-y-2">
        <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.selectUserTitle()}</span>
        <DiscordSelector type="user" options={memberOptions} bind:selected={selectedUserId}
                         ariaLabel={m.common.selectUserTitle()} placeholder={m.common.selectUserPlaceholder()} />
      </div>
      <div class="space-y-2">
        <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.rolestates.manageSelectRoles()}</span>
        <DiscordSelector type="role" options={roleOptions} bind:selected={selectedRoleIds} multiple
                         ariaLabel={m.rolestates.manageSelectRoles()}
                         placeholder={m.rolestates.manageRolesPlaceholder()} />
      </div>
      <div class="flex flex-col sm:flex-row gap-3">
        <button type="button" class="flex-1 px-4 rounded-xl min-h-[50px] font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
                disabled={!selectedUserId || selectedRoleIds.length === 0} onclick={() => changeRoles("add")}>
          <i class="fa-solid fa-plus" aria-hidden="true"></i>{m.rolestates.manageAddRoles()}
        </button>
        <button type="button" class="flex-1 px-4 rounded-xl min-h-[50px] font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                style={flatButton}
                disabled={!selectedUserId || selectedRoleIds.length === 0} onclick={() => changeRoles("remove")}>
          <i class="fa-solid fa-minus" aria-hidden="true"></i>{m.rolestates.manageRemoveRoles()}
        </button>
      </div>
    </PluginCard>

    <PluginCard title={m.rolestates.copyTitle()} alwaysOpen>
      <div class="space-y-2">
        <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.rolestates.copySource()}</span>
        <DiscordSelector type="user" options={stateUserOptions} bind:selected={sourceUserId}
                         ariaLabel={m.rolestates.copySource()} placeholder={m.rolestates.copySourcePlaceholder()} />
      </div>
      <div class="space-y-2">
        <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.rolestates.copyTarget()}</span>
        <DiscordSelector type="user" options={memberOptions} bind:selected={targetUserId}
                         ariaLabel={m.rolestates.copyTarget()} placeholder={m.rolestates.copyTargetPlaceholder()} />
      </div>
      <button type="button" class="w-full px-4 rounded-xl min-h-[50px] font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              disabled={!sourceUserId || !targetUserId} onclick={applyState}>
        <i class="fa-solid fa-copy" aria-hidden="true"></i>{m.rolestates.copyApply()}
      </button>
    </PluginCard>
  {:else}
    <PluginCard title={m.rolestates.statesTitle({ count: roleStates.length })} alwaysOpen>
      {#if loading}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.common.loading()}</p>
      {:else if roleStates.length === 0}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.rolestates.statesEmptyTitle()}</p>
      {:else}
        <div class="space-y-2">
          {#each pageStates as state (state.userId.toString())}
            {@const ids = savedRoleIds(state)}
            <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
              <button type="button" class="grow min-w-0 text-left min-h-[44px] flex flex-col justify-center"
                      aria-label="{m.rolestates.statesViewDetails()}: {state.userName}"
                      onclick={() => (viewingUserId = state.userId.toString())}>
                <span class="truncate text-sm font-medium" style="color: {$colorStore.text}">{state.userName}</span>
                <span class="truncate text-xs" style="color: {$colorStore.muted}">
                  {m.common.rolesCount({ count: ids.length })}
                </span>
              </button>
              <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0" style={flatButton}
                      aria-label="{m.rolestates.statesDelete()}: {state.userName}"
                      onclick={() => deleteState(state.userId.toString())}>
                <i class="fa-solid fa-trash" aria-hidden="true"></i>
              </button>
            </div>
          {/each}
        </div>

        {#if totalPages > 1}
          <div class="flex items-center justify-center gap-3">
            <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-50" style={flatButton}
                    disabled={statesPage === 1} aria-label={m.common.previousPage()}
                    onclick={() => (statesPage = Math.max(1, statesPage - 1))}>
              <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
            </button>
            <span class="text-sm" style="color: {$colorStore.text}">
              {m.common.pageOfTotal({ page: statesPage, total: totalPages })}
            </span>
            <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-50" style={flatButton}
                    disabled={statesPage === totalPages} aria-label={m.common.nextPage()}
                    onclick={() => (statesPage = Math.min(totalPages, statesPage + 1))}>
              <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
            </button>
          </div>
        {/if}
      {/if}
    </PluginCard>
  {/if}
</div>

{#if viewing}
  <StateSheet
    name={viewing.userName}
    roleIds={savedRoleIds(viewing)}
    {roleName}
    onclose={() => (viewingUserId = null)}
    ondelete={() => deleteState(viewingUserId ?? "")}
  />
{/if}
