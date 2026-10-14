<!-- routes/dashboard/statusroles/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { clientApi, type StatusRole, statusRolesApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";

  import StatCard from "$lib/components/monitoring/StatCard.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import type { PageData } from "./$types";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import { serializeMessage } from "$lib/utils/embedMessage";

  const autoSave = createAutoSave({
    onError: () => showMessage(m.statusroles.pageErrorAutosave(), "error")
  });

  interface Props {
      data: PageData;
    }

    let { data }: Props = $props();

    // Component state
    let loading = $state(false);
    let saving = $state(false);
    let message = $state("");
    let messageType: "success" | "error" | "info" = $state("info");

    // Data state
    let statusRoles: StatusRole[] = $state([]);
    let guildChannels: Array<{ id: string; name: string; }> = $state([]);
    let guildRoles: Array<{ id: string; name: string; color: number }> = $state([]);

    // Form data
    let newStatusRole = $state({
        status: ""
    });
    let editingRole: number | null = $state(null);
    let editForm = $state({
        addRoles: "",
        removeRoles: "",
        channelId: null as string | null,
      embedText: {} as any
    });

    // UI state
    let activeTab = $state("list");
    let expandedRole: number | null = $state(null);

    // Load all status role data
    async function loadAllStatusRoleData() {
        if (!$currentGuild?.id) return;

        loading = true;
        try {
            const [
                rolesData,
                channelsData,
                rolesListData
            ] = await Promise.all([
              statusRolesApi.getStatusRoles($currentGuild.id).catch(() => []),
              clientApi.getTextChannels($currentGuild.id).catch(() => []),
              clientApi.getRoles($currentGuild.id).catch(() => [])
            ]);

            statusRoles = rolesData;

            guildChannels = (channelsData || []).map((channel: any) => ({
                id: channel.id.toString(),
                name: channel.name
            }));

            guildRoles = (rolesListData || [])
                .filter((role: any) =>
                    role.id !== $currentGuild?.id?.toString() &&
                    !role.managed &&
                    !role.name.startsWith("@")
                )
                .map((role: any) => ({
                    id: role.id.toString(),
                    name: role.name,
                    color: role.color || 0
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
        } catch (err) {
            logger.error("Failed to load status role data:", err);
            showMessage(m.statusroles.pageErrorLoad(), "error");
        } finally {
            loading = false;
        }
    }

    // Add status role
    async function addStatusRole() {
        if (!$currentGuild?.id || !newStatusRole.status.trim()) return;

        saving = true;
        try {
          await statusRolesApi.addStatusRole($currentGuild.id, newStatusRole.status);
            showMessage(m.statusroles.pageNotifyAdded(), "success");
            newStatusRole = { status: "" };
            await loadAllStatusRoleData();
        } catch (err) {
            logger.error("Failed to add status role:", err);
            showMessage(m.statusroles.pageErrorAdd(), "error");
        } finally {
            saving = false;
        }
    }

    // Remove status role
    async function removeStatusRole(id: number) {
        if (!$currentGuild?.id) return;
        if (!(await requestConfirmation({ message: m.statusroles.pageConfirmRemove(), confirmText: m.common.remove() }))) return;

        saving = true;
        try {
          await statusRolesApi.removeStatusRole($currentGuild.id, id);
            showMessage(m.statusroles.pageNotifyRemoved(), "success");
            await loadAllStatusRoleData();
        } catch (err) {
            logger.error("Failed to remove status role:", err);
            showMessage(m.statusroles.pageErrorRemove(), "error");
        } finally {
            saving = false;
        }
    }

    /** Applies a confirmed change to one entry in the list, if the list still belongs to the guild it was saved for. */
    function patchStatusRole(guildId: bigint, id: number, patch: Partial<StatusRole>) {
        if ($currentGuild?.id !== guildId) return;
        statusRoles = statusRoles.map(r => r.id === id ? { ...r, ...patch } : r);
    }

    /** Saves a role list field. Text, so it is debounced and not rolled back while the user may still be typing. */
    function saveRoleList(id: number, field: "addRoles" | "removeRoles") {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const value = editForm[field].trim().split(/\s+/).filter(Boolean).join(" ");

        autoSave.schedule(`${id}:${field}`, async () => {
            if (field === "addRoles") {
                await statusRolesApi.setAddRoles(guildId, id, value);
                patchStatusRole(guildId, id, { toAdd: value });
            } else {
                await statusRolesApi.setRemoveRoles(guildId, id, value);
                patchStatusRole(guildId, id, { toRemove: value });
            }
        });
    }

    function setStatusChannel(id: number, channelId: string | null) {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const previous = statusRoles.find(r => r.id === id)?.statusChannelId ?? null;
        editForm.channelId = channelId;

        autoSave.now(`${id}:channel`, async () => {
            const value = channelId ? BigInt(channelId) : BigInt(0);
            try {
                await statusRolesApi.setStatusChannel(guildId, id, value);
                patchStatusRole(guildId, id, { statusChannelId: channelId ? value : null });
            } catch (err) {
                if ($currentGuild?.id === guildId && editingRole === id) {
                    editForm.channelId = previous && previous !== BigInt(0) ? previous.toString() : null;
                }
                throw err;
            }
        });
    }

    /** The notification message as last saved, so reopening and cancelling the builder does not write anything. */
    let savedEmbedText = "";

    /**
     * The notification message is authored in the embed builder, whose own Save button is the explicit commit, so
     * the message is stored when the builder saves rather than on every edit inside it.
     */
    function saveStatusEmbed(id: number, embedText: any) {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const value = serializeMessage(embedText);
        if (value === savedEmbedText) return;
        const previous = savedEmbedText;
        savedEmbedText = value;

        autoSave.now(`${id}:embed`, async () => {
            try {
                await statusRolesApi.setStatusEmbed(guildId, id, value);
                patchStatusRole(guildId, id, { statusEmbed: value });
            } catch (err) {
                if ($currentGuild?.id === guildId && editingRole === id) savedEmbedText = previous;
                throw err;
            }
        });
    }

    /**
     * Flips a toggle immediately. The bot only exposes a toggle endpoint, so the value it reports back is the one
     * kept, and a failed request flips the switch back.
     */
    function toggleSetting(id: number, field: "removeAdded" | "readdRemoved") {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const role = statusRoles.find(r => r.id === id);
        if (!role) return;
        const previous = role[field];
        patchStatusRole(guildId, id, { [field]: !previous });

        autoSave.now(`${id}:${field}`, async () => {
            try {
                if (field === "removeAdded") {
                    const result = await statusRolesApi.toggleRemoveAdded(guildId, id);
                    patchStatusRole(guildId, id, { removeAdded: result.removeAdded });
                } else {
                    const result = await statusRolesApi.toggleReaddRemoved(guildId, id);
                    patchStatusRole(guildId, id, { readdRemoved: result.readdRemoved });
                }
            } catch (err) {
                patchStatusRole(guildId, id, { [field]: previous });
                throw err;
            }
        });
    }

    function stopEditing() {
        if (editingRole === null) return;
        void autoSave.flush(`${editingRole}:addRoles`);
        void autoSave.flush(`${editingRole}:removeRoles`);
        editingRole = null;
    }

    // Start editing a role
    function startEditing(role: typeof statusRoles[0]) {
        stopEditing();
        editingRole = role.id;

      // Parse embedText if it's a JSON string
      let parsedEmbedText: any = role.statusEmbed || {};
      try {
        if (typeof parsedEmbedText === "string" && parsedEmbedText.trim().startsWith("{")) {
          parsedEmbedText = JSON.parse(parsedEmbedText);
        } else if (typeof parsedEmbedText === "string" && parsedEmbedText) {
          parsedEmbedText = { content: parsedEmbedText };
        } else if (!parsedEmbedText) {
          parsedEmbedText = {};
        }
      } catch {
        parsedEmbedText = parsedEmbedText ? { content: parsedEmbedText } : {};
      }

        editForm = {
            addRoles: role.toAdd || "",
            removeRoles: role.toRemove || "",
            channelId: role.statusChannelId ? role.statusChannelId.toString() : null,
          embedText: parsedEmbedText
        };
        savedEmbedText = serializeMessage(parsedEmbedText);
    }

    // Utility functions
    function showMessage(text: string, type: "success" | "error" | "info") {
        message = text;
        messageType = type;
        setTimeout(() => {
            message = "";
        }, 5000);
    }

    function parseRoleIds(roleString: string): string[] {
        if (!roleString) return [];
        return roleString.split(' ').filter(id => id.trim());
    }

    function getRoleNames(roleString: string): string {
        const ids = parseRoleIds(roleString);
        if (ids.length === 0) return m.common.none();
        return ids.map(id => {
            const role = guildRoles.find(r => r.id === id);
            return role ? role.name : m.common.unknownRole();
        }).join(", ");
    }

    onMount(() => {
        loadAllStatusRoleData();
    });

    $effect(() => {
      if ($currentGuild) {
        loadAllStatusRoleData();
      }
    });

    // Tabs configuration
    const tabs = $derived([
      { id: "list", label: m.features.statusrolesName(), icon: "fa-user-check" },
      { id: "add", label: m.statusroles.pageTabAdd(), icon: "fa-plus" },
      { id: "stats", label: m.common.statistics(), icon: "fa-chart-column" }
    ]);

    // Action buttons configuration
    let actionButtons = $derived([
        {
            label: m.common.refresh(),
          icon: "fa-arrows-rotate",
            action: loadAllStatusRoleData,
            loading: loading
        }
    ]);

</script>

{#snippet statusMessages()}
  {#if message}
    <div class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-all"
         style="background: {messageType === 'success' ? $colorStore.primary + '20' : messageType === 'error' ? $colorStore.accent + '20' : $colorStore.primary + '20'};
          border: 1px solid {messageType === 'success' ? $colorStore.primary : messageType === 'error' ? $colorStore.accent : $colorStore.primary}30;"
         in:fly={{ x: 20, duration: 300 }}>
      {#if messageType === 'success'}
        <i class="fa-utility-duo fa-regular fa-circle-check"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
      {:else if messageType === 'error'}
        <i class="fa-utility-duo fa-regular fa-circle-exclamation"
           style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
      {:else}
        <i class="fa-utility-duo fa-regular fa-circle-exclamation"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
      {/if}
      <span
        style="color: {messageType === 'success' ? $colorStore.primary : messageType === 'error' ? $colorStore.accent : $colorStore.primary}">{message}</span>
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  {autoSave}
  bind:activeTab
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-user-check"
  statusMessages={statusMessages}
  subtitle={m.statusroles.pageSubtitle()}
  {tabs}
  title={m.features.statusrolesName()}
>

    <!-- Tab Content -->
    {#if activeTab === 'list'}
        <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
            <!-- Status Roles List -->
          <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                  <i class="fa-utility-duo fa-regular fa-user-check"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.statusroles.pageListTitle({ count: statusRoles.length })}</h2>
                </div>

                <div class="space-y-3">
                    {#if statusRoles.length === 0}
                        <div class="text-center py-8">
                          <i class="fa-utility-duo fa-regular fa-user-check"
                             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">{m.statusroles.pageListEmptyTitle()}</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                {m.statusroles.pageListEmptyHint()}
                            </p>
                        </div>
                    {:else}
                        {#each statusRoles as role}
                            <div class="rounded-xl border transition-all"
                                 style="background: {$colorStore.primary}08; border-color: {expandedRole === role.id ? $colorStore.primary + '40' : $colorStore.primary + '20'};">
                                <div class="flex items-center justify-between p-4">
                                    <div class="flex items-center gap-3 flex-1">
                                      <i class="fa-utility-duo fa-regular fa-user-check"
                                         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                                        <div class="flex-1">
                                            <div class="font-semibold" style="color: {$colorStore.text}">
                                                {m.statusroles.pageItemStatus({ status: role.status })}
                                            </div>
                                            <div class="text-sm" style="color: {$colorStore.muted}">
                                                {m.statusroles.pageItemRoles({ adds: getRoleNames(role.toAdd), removes: getRoleNames(role.toRemove) })}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <button
                                                class="p-2 rounded-lg transition-all hover:scale-110"
                                                style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                                onclick={() => expandedRole = expandedRole === role.id ? null : role.id}
                                        >
                                            {expandedRole === role.id ? "▼" : "▶"}
                                        </button>
                                      <button aria-label={m.common.delete()}
                                                class="p-2 rounded-lg transition-all hover:scale-110"
                                              style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                                                onclick={() => removeStatusRole(role.id)}
                                        >
                                        <i class="fa-solid fa-circle-xmark" style="font-size: 16px;"></i>
                                        </button>
                                    </div>
                                </div>

                                {#if expandedRole === role.id}
                                    <div class="border-t p-4 space-y-4" style="border-color: {$colorStore.primary}20;">
                                        {#if editingRole === role.id}
                                            <!-- Edit Form -->
                                            <div class="space-y-4">
                                                <div>
                                                  <label for="input-8035" class="block text-sm font-medium mb-2"
                                                         style="color: {$colorStore.text}">
                                                        {m.statusroles.pageEditAddRoles()}
                                                    </label>
                                                  <input id="input-8035"
                                                            type="text"
                                                            bind:value={editForm.addRoles}
                                                            oninput={() => saveRoleList(role.id, "addRoles")}
                                                            onblur={() => autoSave.flush(`${role.id}:addRoles`)}
                                                            placeholder="123456789 987654321"
                                                            class="w-full p-3 rounded-xl border"
                                                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                                  >
                                                </div>

                                                <div>
                                                  <label for="input-6007" class="block text-sm font-medium mb-2"
                                                         style="color: {$colorStore.text}">
                                                        {m.statusroles.pageEditRemoveRoles()}
                                                    </label>
                                                  <input id="input-6007"
                                                            type="text"
                                                            bind:value={editForm.removeRoles}
                                                            oninput={() => saveRoleList(role.id, "removeRoles")}
                                                            onblur={() => autoSave.flush(`${role.id}:removeRoles`)}
                                                            placeholder="123456789 987654321"
                                                            class="w-full p-3 rounded-xl border"
                                                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                                  >
                                                </div>

                                                <div>
                                                    <span id="notification-channel-label"
                                                          class="block text-sm font-medium mb-2"
                                                          style="color: {$colorStore.text}">
                                                        {m.common.notificationChannel()}
                                                    </span>
                                                    <DiscordSelector
                                                            type="channel"
                                                            options={guildChannels}
                                                            selected={editForm.channelId}
                                                            placeholder={m.common.noChannel()}
                                                            onchange={(detail) => setStatusChannel(role.id, typeof detail.selected === "string" && detail.selected ? detail.selected : null)} />
                                                </div>

                                                <div>
                                                  <label for="f-+page-notification-message-422" class="block text-sm font-medium mb-3"
                                                         style="color: {$colorStore.text}">
                                                    <i class="fa-solid fa-comment" style="font-size: 14px;"></i>
                                                    {m.statusroles.pageEditMessage()}
                                                  </label>

                                                  <FullscreenEmbedBuilder id="f-+page-notification-message-422"
                                                    bind:value={editForm.embedText}
                                                    onchange={(value) => saveStatusEmbed(role.id, value)}
                                                    previewTitle={m.statusroles.pageEditPreviewTitle()}
                                                    previewDescription={m.statusroles.pageEditPreviewDescription()}
                                                    icon="fa-user-check"
                                                    allowContent={true}
                                                    allowMultipleEmbeds={true}
                                                    maxEmbeds={10}
                                                    allowComponents={true}
                                                    additionalPlaceholders={[
                                                      { category: "User", name: "%user%", description: m.placeholders.user() },
                                                      { category: "User", name: "%user.mention%", description: m.placeholders.userMention() },
                                                      { category: "Status", name: "%status%", description: m.placeholders.status() },
                                                      { category: "Server", name: "%server%", description: m.placeholders.server() }
                                                    ]}
                                                    guildId={$currentGuild?.id}
                                                    user={data.user}
                                                    placeholder={m.statusroles.pageEditMessagePlaceholder()}
                                                  />
                                                </div>

                                                <div class="flex items-center gap-3 flex-wrap">
                                                    <button
                                                      class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                                                      style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                                      onclick={stopEditing}
                                                    >
                                                      <i class="fa-solid fa-check" style="font-size: 14px;" aria-hidden="true"></i>
                                                      {m.common.done()}
                                                    </button>
                                                    <span class="text-xs" style="color: {$colorStore.muted}">
                                                      {m.common.changesSaveAutomatically()}
                                                    </span>
                                                </div>
                                            </div>
                                        {:else}
                                            <!-- View Mode -->
                                            <div class="space-y-3">
                                                <div class="flex items-center justify-between p-3 rounded-lg"
                                                     style="background: {$colorStore.primary}05;">
                                                    <span style="color: {$colorStore.muted}">{m.statusroles.pageToggleRemoveAdded()}</span>
                                                  <button aria-label={m.statusroles.pageToggleRemoveAdded()}
                                                            onclick={() => toggleSetting(role.id, "removeAdded")}
                                                            class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                                                          style="background: {role.removeAdded ? $colorStore.primary : $colorStore.muted};"
                                                    >
                                                        <span class="inline-block w-4 h-4 transform transition-transform bg-white rounded-full"
                                                              style="transform: translateX({role.removeAdded ? '1.5rem' : '0.25rem'})"></span>
                                                    </button>
                                                </div>

                                                <div class="flex items-center justify-between p-3 rounded-lg"
                                                     style="background: {$colorStore.primary}05;">
                                                    <span style="color: {$colorStore.muted}">{m.statusroles.pageToggleReaddRemoved()}</span>
                                                  <button aria-label={m.statusroles.pageToggleReaddRemoved()}
                                                            onclick={() => toggleSetting(role.id, "readdRemoved")}
                                                            class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                                                          style="background: {role.readdRemoved ? $colorStore.primary : $colorStore.muted};"
                                                    >
                                                        <span class="inline-block w-4 h-4 transform transition-transform bg-white rounded-full"
                                                              style="transform: translateX({role.readdRemoved ? '1.5rem' : '0.25rem'})"></span>
                                                    </button>
                                                </div>

                                                <button
                                                  class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
                                                        style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                                        onclick={() => startEditing(role)}
                                                >
                                                    {m.statusroles.pageEditSettings()}
                                                </button>
                                            </div>
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>

    {:else if activeTab === 'add'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <!-- Add New Status Role -->
          <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                  <i class="fa-utility-duo fa-regular fa-circle-plus"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.statusroles.pageAddAria()}</h2>
                </div>

                <div class="space-y-4">
                    <div>
                      <label for="input-1942" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            {m.statusroles.pageAddStatusLabel()}
                        </label>
                      <input id="input-1942"
                                type="text"
                                bind:value={newStatusRole.status}
                                placeholder={m.statusroles.pageAddStatusPlaceholder()}
                                class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      >
                        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                            {m.statusroles.pageAddStatusHint()}
                        </p>
                    </div>

                  <button
                    class="flex items-center justify-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                    onclick={addStatusRole}
                    disabled={saving || !newStatusRole.status.trim()}
                    aria-busy={saving}
                    aria-label={m.statusroles.pageAddAria()}
                  >
                    <i class="fa-solid fa-plus {saving ? 'fa-spin' : ''}" style="font-size: 18px;"
                       aria-hidden="true"></i>
                    <span class="text-sm sm:text-base">{saving ? m.common.adding() : m.statusroles.pageAddAria()}</span>
                  </button>

                    <div class="p-4 rounded-xl" style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30;">
                        <p class="text-sm" style="color: {$colorStore.text}">
                            {@html m.statusroles.pageAddNote()}
                        </p>
                    </div>
                </div>
            </div>
        </div>

    {:else if activeTab === 'stats'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <StatCard
                  icon="fa-user-check"
                        label={m.statusroles.pageStatTotal()}
                        value={statusRoles.length}
                        subtitle={m.common.configuredLower()}
                        iconColor="primary"
                        animationDelay={0}
                />

                <StatCard
                  icon="fa-crown"
                        label={m.statusroles.pageStatActive()}
                        value={statusRoles.filter(r => r.toAdd || r.toRemove).length}
                        subtitle={m.statusroles.pageStatActiveSub()}
                        iconColor="secondary"
                        animationDelay={100}
                />

                <StatCard
                  icon="fa-bell"
                        label={m.statusroles.pageStatNotify()}
                        value={statusRoles.filter(r => r.statusChannelId && r.statusChannelId !== BigInt(0)).length}
                        subtitle={m.statusroles.pageStatNotifySub()}
                        iconColor="accent"
                        animationDelay={200}
                />
            </div>
        </div>
    {/if}
</DashboardPageLayout>
