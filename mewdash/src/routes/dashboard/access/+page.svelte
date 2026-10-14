<!-- routes/dashboard/access/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import type { PageData } from "./$types";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { clientApi, dashboardAccessApi } from "$lib/api/index.ts";
  import {
    DashboardAccessLevel,
    DashboardAccessTargetType,
    type DashboardAccessGrant,
    type DashboardAccessManager,
    type DashboardAccessSettings,
  } from "$lib/api/dashboardaccess/models";
  import { dashboardAccessSectionGroups } from "$lib/config/dashboardAccessSections";
  import { allDashboardFeatures, categoryOrder, categoryLabel } from "$lib/config/navigationItems";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  interface SimpleOption {
    id: string;
    name: string;
  }

  let loading = $state(true);
  let settings: DashboardAccessSettings | null = $state(null);
  let managers: DashboardAccessManager[] = $state([]);
  let grants: DashboardAccessGrant[] = $state([]);
  let guildRoles: SimpleOption[] = $state([]);
  let guildMembers: SimpleOption[] = $state([]);

  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => (showNotification = false), 3000);
  }

  // Manager appointment form
  let managerTargetType: DashboardAccessTargetType = $state(DashboardAccessTargetType.User);
  let managerTargetId: string | null = $state(null);
  let addingManager = $state(false);
  let updatingToggle = $state(false);

  // Grant form (create or edit)
  let editingGrantId: number | null = $state(null);
  let grantTargetType: DashboardAccessTargetType = $state(DashboardAccessTargetType.User);
  let grantTargetId: string | null = $state(null);
  let grantLevels: Record<string, DashboardAccessLevel> = $state({});
  let savingGrant = $state(false);

  // Delete confirmations
  let showDeleteManagerConfirm = $state(false);
  let managerPendingDelete: DashboardAccessManager | null = $state(null);
  let showDeleteGrantConfirm = $state(false);
  let grantPendingDelete: DashboardAccessGrant | null = $state(null);

  async function loadAll(guildId: bigint) {
    loading = true;
    try {
      const [settingsRes, rolesRes, membersRes] = await Promise.all([
        dashboardAccessApi.getSettings(guildId),
        clientApi.getRoles(guildId),
        clientApi.getMembers(guildId),
      ]);

      settings = settingsRes;
      guildRoles = rolesRes.map((r) => ({ id: r.id, name: r.name }));
      guildMembers = membersRes.map((u) => ({ id: u.id, name: u.displayName || u.username }));

      grants = settings.canManageAccess ? await dashboardAccessApi.getGrants(guildId) : [];
      managers = settings.isGuildOwner ? await dashboardAccessApi.getManagers(guildId) : [];
    } catch (error) {
      logger.error("Failed to load dashboard access data:", error);
      showNotificationMessage(m.access.errorLoad(), "error");
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    if ($currentGuild) loadAll(BigInt($currentGuild.id));
  });

  $effect(() => {
    currentGuild.subscribe((guild) => {
      if (guild) loadAll(BigInt(guild.id));
    });
  });

  async function toggleAdminsCanManage() {
    if (!$currentGuild || !settings) return;
    const newValue = !settings.adminsCanManageAccess;
    updatingToggle = true;
    try {
      await dashboardAccessApi.updateSettings(BigInt($currentGuild.id), newValue);
      settings = { ...settings, adminsCanManageAccess: newValue };
      showNotificationMessage(
        newValue
          ? m.access.notifyAdminsCanManage()
          : m.access.notifyAdminsCannotManage(),
      );
    } catch (error) {
      logger.error("Failed to update dashboard access settings:", error);
      showNotificationMessage(m.common.notifyUpdateFailed(), "error");
    } finally {
      updatingToggle = false;
    }
  }

  function targetOptions(targetType: DashboardAccessTargetType): SimpleOption[] {
    return targetType === DashboardAccessTargetType.Role ? guildRoles : guildMembers;
  }

  function targetName(targetType: DashboardAccessTargetType, targetId: bigint): string {
    const idStr = targetId.toString();
    const found = targetOptions(targetType).find((o) => o.id === idStr);
    if (found) return found.name;
    return targetType === DashboardAccessTargetType.Role ? m.common.roleFallback({ id: idStr }) : m.common.userFallback({ id: idStr });
  }

  async function addManager() {
    if (!$currentGuild || !managerTargetId) return;
    addingManager = true;
    try {
      const manager = await dashboardAccessApi.addManager(BigInt($currentGuild.id), {
        targetType: managerTargetType,
        targetId: BigInt(managerTargetId),
      });
      managers = [...managers.filter((mgr) => mgr.id !== manager.id), manager];
      managerTargetId = null;
      showNotificationMessage(m.access.notifyManagerAdded());
    } catch (error) {
      logger.error("Failed to add dashboard access manager:", error);
      showNotificationMessage(m.access.errorAddManager(), "error");
    } finally {
      addingManager = false;
    }
  }

  function requestRemoveManager(manager: DashboardAccessManager) {
    managerPendingDelete = manager;
    showDeleteManagerConfirm = true;
  }

  async function confirmRemoveManager() {
    const manager = managerPendingDelete;
    managerPendingDelete = null;
    if (!$currentGuild || !manager) return;

    try {
      await dashboardAccessApi.removeManager(BigInt($currentGuild.id), manager.id);
      managers = managers.filter((mgr) => mgr.id !== manager.id);
      showNotificationMessage(m.access.notifyManagerRemoved());
    } catch (error) {
      logger.error("Failed to remove dashboard access manager:", error);
      showNotificationMessage(m.access.errorRemoveManager(), "error");
    }
  }

  function startNewGrant() {
    editingGrantId = null;
    grantTargetType = DashboardAccessTargetType.User;
    grantTargetId = null;
    grantLevels = {};
  }

  function editGrant(grant: DashboardAccessGrant) {
    editingGrantId = grant.id;
    grantTargetType = grant.targetType;
    grantTargetId = grant.targetId.toString();
    grantLevels = { ...grant.sections };
  }

  function sectionLevel(section: string): DashboardAccessLevel {
    return grantLevels[section] ?? DashboardAccessLevel.None;
  }

  function setSectionLevel(section: string, level: DashboardAccessLevel) {
    grantLevels = { ...grantLevels, [section]: level };
  }

  function groupLevel(sections: string[]): DashboardAccessLevel {
    // A group (dashboard feature) shows the lowest common level across its sections, so mixed
    // grants don't silently look more permissive than they are.
    return sections.reduce<DashboardAccessLevel>((min, section) => {
      const level = sectionLevel(section);
      return level < min ? level : min;
    }, DashboardAccessLevel.Manage);
  }

  function setGroupLevel(sections: string[], level: DashboardAccessLevel) {
    let updated = { ...grantLevels };
    for (const section of sections) {
      updated[section] = level;
    }
    grantLevels = updated;
  }

  async function saveGrant() {
    if (!$currentGuild || !grantTargetId) {
      showNotificationMessage(m.access.notifySelectTarget(), "error");
      return;
    }

    const sections = Object.entries(grantLevels)
      .filter(([, level]) => level !== DashboardAccessLevel.None)
      .map(([section, level]) => ({ section, level }));

    if (sections.length === 0) {
      showNotificationMessage(m.access.notifySelectSection(), "error");
      return;
    }

    savingGrant = true;
    try {
      await dashboardAccessApi.upsertGrant(BigInt($currentGuild.id), {
        targetType: grantTargetType,
        targetId: BigInt(grantTargetId),
        sections,
      });
      grants = await dashboardAccessApi.getGrants(BigInt($currentGuild.id));
      showNotificationMessage(m.access.notifyGrantSaved());
      startNewGrant();
    } catch (error) {
      logger.error("Failed to save dashboard access grant:", error);
      showNotificationMessage(m.access.errorSaveGrant(), "error");
    } finally {
      savingGrant = false;
    }
  }

  function requestRemoveGrant(grant: DashboardAccessGrant) {
    grantPendingDelete = grant;
    showDeleteGrantConfirm = true;
  }

  async function confirmRemoveGrant() {
    const grant = grantPendingDelete;
    grantPendingDelete = null;
    if (!$currentGuild || !grant) return;

    try {
      await dashboardAccessApi.removeGrant(BigInt($currentGuild.id), grant.id);
      grants = grants.filter((g) => g.id !== grant.id);
      if (editingGrantId === grant.id) startNewGrant();
      showNotificationMessage(m.access.notifyGrantRemoved());
    } catch (error) {
      logger.error("Failed to remove dashboard access grant:", error);
      showNotificationMessage(m.access.errorRemoveGrant(), "error");
    }
  }

  const levelLabels: Record<DashboardAccessLevel, string> = $derived({
    [DashboardAccessLevel.None]: m.common.none(),
    [DashboardAccessLevel.View]: m.common.view(),
    [DashboardAccessLevel.Manage]: m.common.manage(),
  });

  function categoryDisplay(category: string): string {
    return categoryLabel(category);
  }

  let groupedSections = $derived(
    categoryOrder
      .map((category) => ({
        category,
        groups: dashboardAccessSectionGroups.filter((g) => g.category === category),
      }))
      .filter((c) => c.groups.length > 0),
  );
</script>

{#snippet statusMessageContent()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  title={m.features.accessName()}
  subtitle={m.access.pageSubtitle()}
  icon="fa-key"
  guildName={$currentGuild?.name || "Dashboard"}
  statusMessages={statusMessageContent}
>
  {#if loading}
    <div class="flex justify-center items-center min-h-[300px]">
      <div class="w-10 h-10 border-4 rounded-full animate-spin"
           style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
    </div>
  {:else if !settings?.canManageAccess}
    <div
      class="rounded-2xl border shadow-2xl p-8 text-center"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <i class="fa-utility-duo fa-regular fa-key"
         style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 40px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
      <h2 class="text-lg font-semibold mb-2" style="color: {$colorStore.text};">{m.access.deniedTitle()}</h2>
      <p class="text-sm" style="color: {$colorStore.muted};">
        {m.access.deniedHint()}
      </p>
    </div>
  {:else}
    <div class="space-y-6">
      {#if settings.isGuildOwner}
        <!-- Delegation settings -->
        <section
          class="rounded-2xl border shadow-2xl p-6"
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                 border-color: {$colorStore.primary}30;"
        >
          <h2 class="text-lg font-semibold mb-1" style="color: {$colorStore.text};">{m.access.delegationHeading()}</h2>
          <p class="text-sm mb-4" style="color: {$colorStore.muted};">
            {m.access.delegationHint()}
          </p>

          <label class="flex items-center justify-between gap-4 p-4 rounded-xl min-h-[44px]"
                 style="background: {$colorStore.primary}10;">
            <span class="text-sm" style="color: {$colorStore.text};">
              {m.access.delegationToggleLabel()}
            </span>
            <button
              role="switch"
              aria-checked={settings.adminsCanManageAccess}
              aria-label={m.access.delegationToggleAria()}
              disabled={updatingToggle}
              onclick={toggleAdminsCanManage}
              class="relative w-12 h-7 rounded-full transition-all shrink-0 disabled:opacity-50"
              style="background: {settings.adminsCanManageAccess ? $colorStore.primary : $colorStore.muted}40;"
            >
              <span
                class="absolute top-1 w-5 h-5 rounded-full transition-all"
                style="background: {settings.adminsCanManageAccess ? $colorStore.primary : $colorStore.muted};
                       left: {settings.adminsCanManageAccess ? '1.5rem' : '0.25rem'};"
              ></span>
            </button>
          </label>

          <!-- Access managers -->
          <div class="mt-6">
            <h3 class="text-base font-semibold mb-3" style="color: {$colorStore.text};">
              {m.access.managersHeading({ count: managers.length })}
            </h3>
            <div class="flex flex-col sm:flex-row gap-2 mb-4">
              <div class="w-full sm:w-40">
                <DiscordSelector
                  type="custom"
                  options={[
                    { id: String(DashboardAccessTargetType.User), name: m.common.user() },
                    { id: String(DashboardAccessTargetType.Role), name: m.common.role() },
                  ]}
                  selected={String(managerTargetType)}
                  onchange={(d) => {
                    managerTargetType = Number(d.selected) as DashboardAccessTargetType;
                    managerTargetId = null;
                  }}
                  placeholder={m.access.targetTypePlaceholder()}
                  searchable={false}
                />
              </div>
              <div class="flex-1">
                <DiscordSelector
                  type={managerTargetType === DashboardAccessTargetType.Role ? "role" : "user"}
                  options={targetOptions(managerTargetType)}
                  selected={managerTargetId}
                  onchange={(d) => (managerTargetId = d.selected as string | null)}
                  placeholder={managerTargetType === DashboardAccessTargetType.Role ? m.common.selectARolePlaceholder() : m.common.selectUserPlaceholder()}
                />
              </div>
              <button
                class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] disabled:opacity-50 min-h-[44px] shrink-0"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                disabled={addingManager || !managerTargetId}
                onclick={addManager}
              >
                {addingManager ? m.common.adding() : m.access.addManager()}
              </button>
            </div>

            {#if managers.length === 0}
              <p class="text-sm" style="color: {$colorStore.muted};">{m.access.managersEmpty()}</p>
            {:else}
              <div class="space-y-2">
                {#each managers as manager (manager.id)}
                  <div class="flex items-center justify-between gap-2 p-3 rounded-lg border"
                       style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                    <span class="text-sm" style="color: {$colorStore.text};">
                      <i class="fa-solid {manager.targetType === DashboardAccessTargetType.Role ? 'fa-at' : 'fa-user'}"
                         style="font-size: 12px; color: {$colorStore.muted}; margin-right: 6px;"></i>
                      {targetName(manager.targetType, manager.targetId)}
                    </span>
                    <button
                      aria-label={m.access.removeManagerAria()}
                      class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                      style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
                      onclick={() => requestRemoveManager(manager)}
                    >
                      {m.common.remove()}
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </section>
      {/if}

      <!-- Access grants -->
      <section
        class="rounded-2xl border shadow-2xl p-6"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
      >
        <h2 class="text-lg font-semibold mb-1" style="color: {$colorStore.text};">
          {editingGrantId ? m.access.grantHeadingEdit() : m.access.grantHeadingNew()}
        </h2>
        <p class="text-sm mb-4" style="color: {$colorStore.muted};">
          {m.access.grantHint()}
        </p>

        <div class="flex flex-col sm:flex-row gap-2 mb-6">
          <div class="w-full sm:w-40">
            <DiscordSelector
              type="custom"
              options={[
                { id: String(DashboardAccessTargetType.User), name: m.common.user() },
                { id: String(DashboardAccessTargetType.Role), name: m.common.role() },
              ]}
              selected={String(grantTargetType)}
              disabled={editingGrantId !== null}
              onchange={(d) => {
                grantTargetType = Number(d.selected) as DashboardAccessTargetType;
                grantTargetId = null;
              }}
              placeholder={m.access.targetTypePlaceholder()}
              searchable={false}
            />
          </div>
          <div class="flex-1">
            <DiscordSelector
              type={grantTargetType === DashboardAccessTargetType.Role ? "role" : "user"}
              options={targetOptions(grantTargetType)}
              selected={grantTargetId}
              disabled={editingGrantId !== null}
              onchange={(d) => (grantTargetId = d.selected as string | null)}
              placeholder={grantTargetType === DashboardAccessTargetType.Role ? m.common.selectARolePlaceholder() : m.common.selectUserPlaceholder()}
            />
          </div>
        </div>

        <div class="space-y-4 mb-6">
          {#each groupedSections as { category, groups } (category)}
            <div>
              <h4 class="text-xs font-semibold uppercase tracking-wide mb-2" style="color: {$colorStore.muted};">
                {categoryDisplay(category)}
              </h4>
              <div class="space-y-1.5">
                {#each groups as group (group.sections.join())}
                  <div class="flex items-center justify-between gap-3 p-2.5 rounded-lg"
                       style="background: {$colorStore.primary}05;">
                    <span class="text-sm flex items-center gap-2" style="color: {$colorStore.text};">
                      <i class={group.icon.replace('fa-utility-duo ', '')}
                         style="color: {$colorStore.muted}; font-size: 13px;"></i>
                      {group.label()}
                    </span>
                    <div class="flex gap-1 shrink-0">
                      {#each [DashboardAccessLevel.None, DashboardAccessLevel.View, DashboardAccessLevel.Manage] as level (level)}
                        <button
                          class="px-2.5 py-1 rounded-md text-xs font-medium transition-all min-h-[32px]"
                          style={groupLevel(group.sections) === level
                            ? `background: ${$colorStore.primary}; color: ${$colorStore.text};`
                            : `background: ${$colorStore.primary}15; color: ${$colorStore.muted};`}
                          onclick={() => setGroupLevel(group.sections, level)}
                        >
                          {levelLabels[level]}
                        </button>
                      {/each}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>

        <div class="flex gap-2">
          <button
            class="px-6 py-2.5 rounded-lg font-medium transition-all hover:scale-[1.02] disabled:opacity-50 min-h-[44px]"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            disabled={savingGrant || !grantTargetId}
            onclick={saveGrant}
          >
            {savingGrant ? m.common.saving() : editingGrantId ? m.common.saveChanges() : m.access.grantButton()}
          </button>
          {#if editingGrantId}
            <button
              class="px-6 py-2.5 rounded-lg font-medium transition-all hover:scale-[1.02] min-h-[44px]"
              style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
              onclick={startNewGrant}
            >
              {m.common.cancel()}
            </button>
          {/if}
        </div>
      </section>

      <!-- Existing grants -->
      <section
        class="rounded-2xl border shadow-2xl p-6"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
      >
        <h2 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">
          {m.access.grantsHeading({ count: grants.length })}
        </h2>

        {#if grants.length === 0}
          <p class="text-sm" style="color: {$colorStore.muted};">{m.access.grantsEmpty()}</p>
        {:else}
          <div class="space-y-2">
            {#each grants as grant (grant.id)}
              <div class="flex items-center justify-between gap-2 p-3 rounded-lg border"
                   style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <div>
                  <span class="text-sm font-medium" style="color: {$colorStore.text};">
                    <i class="fa-solid {grant.targetType === DashboardAccessTargetType.Role ? 'fa-at' : 'fa-user'}"
                       style="font-size: 12px; color: {$colorStore.muted}; margin-right: 6px;"></i>
                    {targetName(grant.targetType, grant.targetId)}
                  </span>
                  <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                    {Object.keys(grant.sections).length === 1 ? m.access.grantSectionsOne({ count: 1 }) : m.access.grantSectionsOther({ count: Object.keys(grant.sections).length })}
                  </p>
                </div>
                <div class="flex gap-2 shrink-0">
                  <button
                    aria-label={m.access.editGrantAria()}
                    class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                    onclick={() => editGrant(grant)}
                  >
                    {m.common.edit()}
                  </button>
                  <button
                    aria-label={m.access.removeGrantAria()}
                    class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                    style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
                    onclick={() => requestRemoveGrant(grant)}
                  >
                    {m.common.remove()}
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </section>
    </div>
  {/if}
</DashboardPageLayout>

<!-- Delete Manager Confirmation -->
<ConfirmationModal
  bind:isOpen={showDeleteManagerConfirm}
  title={m.access.removeManagerAria()}
  message={m.access.removeManagerMessage({ name: managerPendingDelete ? targetName(managerPendingDelete.targetType, managerPendingDelete.targetId) : m.access.removeManagerFallback() })}
  confirmText={m.common.remove()}
  variant="danger"
  oncancel={() => (managerPendingDelete = null)}
  onconfirm={confirmRemoveManager}
/>

<!-- Delete Grant Confirmation -->
<ConfirmationModal
  bind:isOpen={showDeleteGrantConfirm}
  title={m.access.removeGrantTitle()}
  message={m.access.removeGrantMessage({ name: grantPendingDelete ? targetName(grantPendingDelete.targetType, grantPendingDelete.targetId) : m.access.removeGrantFallback() })}
  confirmText={m.common.remove()}
  variant="danger"
  oncancel={() => (grantPendingDelete = null)}
  onconfirm={confirmRemoveGrant}
/>
