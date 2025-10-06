<!-- routes/dashboard/statusroles/+page.svelte -->
<script lang="ts">
    import {onMount} from "svelte";
    import {fade, fly} from "svelte/transition";
    import {colorStore} from "$lib/stores/colorStore";
    import {currentGuild} from "$lib/stores/currentGuild";
    import {api} from "$lib/api";
    import {logger} from "$lib/logger";

    import StatCard from "$lib/components/monitoring/StatCard.svelte";
    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";

    // Component state
    let loading = $state(false);
    let saving = $state(false);
    let message = $state("");
    let messageType: "success" | "error" | "info" = $state("info");

    // Data state
    let statusRoles: Array<{
        id: number;
        guildId: bigint;
        status: string;
        toAdd: string;
        toRemove: string;
        readdRemoved: boolean;
        removeAdded: boolean;
        statusChannelId: bigint;
        statusEmbed: string;
    }> = $state([]);
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
        embedText: ""
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
                api.getStatusRoles($currentGuild.id).catch(() => []),
                api.getGuildTextChannels($currentGuild.id).catch(() => []),
                api.getGuildRoles($currentGuild.id).catch(() => [])
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
            showMessage("Failed to load status role data", "error");
        } finally {
            loading = false;
        }
    }

    // Add status role
    async function addStatusRole() {
        if (!$currentGuild?.id || !newStatusRole.status.trim()) return;

        saving = true;
        try {
            await api.addStatusRole($currentGuild.id, newStatusRole.status);
            showMessage("Status role added successfully!", "success");
            newStatusRole = { status: "" };
            await loadAllStatusRoleData();
        } catch (err) {
            logger.error("Failed to add status role:", err);
            showMessage("Failed to add status role", "error");
        } finally {
            saving = false;
        }
    }

    // Remove status role
    async function removeStatusRole(id: number) {
        if (!$currentGuild?.id) return;
        if (!confirm("Are you sure you want to remove this status role?")) return;

        saving = true;
        try {
            await api.removeStatusRole($currentGuild.id, id);
            showMessage("Status role removed successfully!", "success");
            await loadAllStatusRoleData();
        } catch (err) {
            logger.error("Failed to remove status role:", err);
            showMessage("Failed to remove status role", "error");
        } finally {
            saving = false;
        }
    }

    // Update status role settings
    async function updateStatusRoleSettings(id: number) {
        if (!$currentGuild?.id) return;

        saving = true;
        try {
            const promises = [];

            if (editForm.addRoles) {
                promises.push(api.setStatusRoleAddRoles($currentGuild.id, id, editForm.addRoles));
            }

            if (editForm.removeRoles) {
                promises.push(api.setStatusRoleRemoveRoles($currentGuild.id, id, editForm.removeRoles));
            }

            if (editForm.channelId) {
                promises.push(api.setStatusRoleChannel($currentGuild.id, id, BigInt(editForm.channelId)));
            }

            if (editForm.embedText) {
                promises.push(api.setStatusRoleEmbed($currentGuild.id, id, editForm.embedText));
            }

            await Promise.all(promises);
            showMessage("Status role settings updated!", "success");
            editingRole = null;
            editForm = { addRoles: "", removeRoles: "", channelId: null, embedText: "" };
            await loadAllStatusRoleData();
        } catch (err) {
            logger.error("Failed to update status role:", err);
            showMessage("Failed to update settings", "error");
        } finally {
            saving = false;
        }
    }

    // Toggle remove added
    async function toggleRemoveAdded(id: number) {
        if (!$currentGuild?.id) return;

        saving = true;
        try {
            await api.toggleStatusRoleRemoveAdded($currentGuild.id, id);
            await loadAllStatusRoleData();
        } catch (err) {
            logger.error("Failed to toggle remove added:", err);
            showMessage("Failed to toggle setting", "error");
        } finally {
            saving = false;
        }
    }

    // Toggle readd removed
    async function toggleReaddRemoved(id: number) {
        if (!$currentGuild?.id) return;

        saving = true;
        try {
            await api.toggleStatusRoleReaddRemoved($currentGuild.id, id);
            await loadAllStatusRoleData();
        } catch (err) {
            logger.error("Failed to toggle readd removed:", err);
            showMessage("Failed to toggle setting", "error");
        } finally {
            saving = false;
        }
    }

    // Start editing a role
    function startEditing(role: typeof statusRoles[0]) {
        editingRole = role.id;
        editForm = {
            addRoles: role.toAdd || "",
            removeRoles: role.toRemove || "",
            channelId: role.statusChannelId ? role.statusChannelId.toString() : null,
            embedText: role.statusEmbed || ""
        };
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
        if (ids.length === 0) return "None";
        return ids.map(id => {
            const role = guildRoles.find(r => r.id === id);
            return role ? role.name : `Unknown Role`;
        }).join(", ");
    }

    onMount(() => {
        loadAllStatusRoleData();
    });

    // Tabs configuration
    const tabs = [
      { id: "list", label: "Status Roles", icon: "fa-user-check" },
      { id: "add", label: "Add New", icon: "fa-plus" },
      { id: "stats", label: "Statistics", icon: "fa-chart-column" }
    ];

    // Action buttons configuration
    let actionButtons = $derived([
        {
            label: "Refresh",
          icon: "fa-arrows-rotate",
            action: loadAllStatusRoleData,
            loading: loading
        }
    ]);

    // Handle tab change
    function handleTabChange(event: CustomEvent) {
        activeTab = event.detail.tabId;
    }
</script>

<DashboardPageLayout
        title="Status Roles"
        subtitle="Manage roles based on Discord custom status"
        icon="fa-user-check"
        {tabs}
        {activeTab}
        {actionButtons}
        guildName={$currentGuild?.name || "Dashboard"}
        on:tabChange={handleTabChange}
>

    <svelte:fragment slot="status-messages">
        <!-- Status Message -->
        {#if message}
            <div class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-all"
                 style="background: {messageType === 'success' ? '#10b98120' : messageType === 'error' ? '#ef444420' : $colorStore.primary + '20'};
                  border: 1px solid {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}30;"
                 in:fly={{ x: 20, duration: 300 }}>
                {#if messageType === 'success'}
                  <i class="fa-utility-duo fa-regular fa-circle-check"
                     style="--fa-primary-color: #10b981; --fa-secondary-color: #059669; font-size: 20px;"></i>
                {:else if messageType === 'error'}
                  <i class="fa-utility-duo fa-regular fa-circle-xmark"
                     style="--fa-primary-color: #ef4444; --fa-secondary-color: #dc2626; font-size: 20px;"></i>
                {:else}
                  <i class="fa-utility-duo fa-regular fa-circle-exclamation"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                {/if}
                <span
                        style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
            </div>
        {/if}
    </svelte:fragment>

    <!-- Tab Content -->
    {#if activeTab === 'list'}
        <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
            <!-- Status Roles List -->
            <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                  <i class="fa-utility-duo fa-regular fa-user-check"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Status Roles ({statusRoles.length})</h2>
                </div>

                <div class="space-y-3">
                    {#if statusRoles.length === 0}
                        <div class="text-center py-8">
                          <i class="fa-utility-duo fa-regular fa-user-check"
                             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No Status Roles</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                Add status-based role assignments to automatically manage roles based on custom status text.
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
                                                Status: "{role.status}"
                                            </div>
                                            <div class="text-sm" style="color: {$colorStore.muted}">
                                                Adds: {getRoleNames(role.toAdd)} • Removes: {getRoleNames(role.toRemove)}
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
                                      <button aria-label="Delete"
                                                class="p-2 rounded-lg transition-all hover:scale-110"
                                                style="background: #ef444420; color: #ef4444;"
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
                                                        Roles to Add (space-separated IDs)
                                                    </label>
                                                  <input id="input-8035"
                                                            type="text"
                                                            bind:value={editForm.addRoles}
                                                            placeholder="123456789 987654321"
                                                            class="w-full p-3 rounded-xl border"
                                                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                                  >
                                                </div>

                                                <div>
                                                  <label for="input-6007" class="block text-sm font-medium mb-2"
                                                         style="color: {$colorStore.text}">
                                                        Roles to Remove (space-separated IDs)
                                                    </label>
                                                  <input id="input-6007"
                                                            type="text"
                                                            bind:value={editForm.removeRoles}
                                                            placeholder="123456789 987654321"
                                                            class="w-full p-3 rounded-xl border"
                                                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                                  >
                                                </div>

                                                <div>
                                                    <span id="notification-channel-label"
                                                          class="block text-sm font-medium mb-2"
                                                          style="color: {$colorStore.text}">
                                                        Notification Channel
                                                    </span>
                                                    <DiscordSelector
                                                            type="channel"
                                                            options={guildChannels}
                                                            selected={editForm.channelId}
                                                            placeholder="No channel"
                                                            on:change={(e) => {
                                                                editForm.channelId = e.detail.selected;
                                                                editForm = { ...editForm };
                                                            }}
                                                            aria-labelledby="notification-channel-label" />
                                                </div>

                                                <div>
                                                  <label for="input-1942" class="block text-sm font-medium mb-2"
                                                         style="color: {$colorStore.text}">
                                                        Embed Text
                                                    </label>
                                                    <textarea
                                                            bind:value={editForm.embedText}
                                                            placeholder="Custom embed text..."
                                                            rows="2"
                                                            class="w-full p-3 rounded-xl border resize-none"
                                                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                                    ></textarea>
                                                </div>

                                                <div class="flex gap-2">
                                                    <button
                                                            class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                                                            style="background: {$colorStore.primary}; color: white;"
                                                            onclick={() => updateStatusRoleSettings(role.id)}
                                                            disabled={saving}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                            class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                                                            style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                                                            onclick={() => editingRole = null}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        {:else}
                                            <!-- View Mode -->
                                            <div class="space-y-3">
                                                <div class="flex items-center justify-between p-3 rounded-lg"
                                                     style="background: {$colorStore.primary}05;">
                                                    <span style="color: {$colorStore.muted}">Remove added roles when status removed:</span>
                                                  <button aria-label="Add role"
                                                            onclick={() => toggleRemoveAdded(role.id)}
                                                            class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                                                            style="background: {role.removeAdded ? $colorStore.primary : '#64748b'};"
                                                    >
                                                        <span class="inline-block w-4 h-4 transform transition-transform bg-white rounded-full"
                                                              style="transform: translateX({role.removeAdded ? '1.5rem' : '0.25rem'})"></span>
                                                    </button>
                                                </div>

                                                <div class="flex items-center justify-between p-3 rounded-lg"
                                                     style="background: {$colorStore.primary}05;">
                                                    <span style="color: {$colorStore.muted}">Re-add removed roles when status removed:</span>
                                                  <button aria-label="Remove role"
                                                            onclick={() => toggleReaddRemoved(role.id)}
                                                            class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                                                            style="background: {role.readdRemoved ? $colorStore.primary : '#64748b'};"
                                                    >
                                                        <span class="inline-block w-4 h-4 transform transition-transform bg-white rounded-full"
                                                              style="transform: translateX({role.readdRemoved ? '1.5rem' : '0.25rem'})"></span>
                                                    </button>
                                                </div>

                                                <button
                                                        class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                                                        style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                                        onclick={() => startEditing(role)}
                                                >
                                                    Edit Settings
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
            <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                  <i class="fa-utility-duo fa-regular fa-plus"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Add Status Role</h2>
                </div>

                <div class="space-y-4">
                    <div>
                      <label for="input-1942" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            Status Text to Watch For
                        </label>
                      <input id="input-1942"
                                type="text"
                                bind:value={newStatusRole.status}
                                placeholder="Enter status text (e.g., 'playing minecraft')"
                                class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      >
                        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                            When a user's custom status contains this text, the configured roles will be added/removed.
                        </p>
                    </div>

                  <button aria-label="Add"
                            class="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-105 min-h-[52px]"
                            style="background: {$colorStore.primary}; color: white;"
                            onclick={addStatusRole}
                            disabled={saving || !newStatusRole.status.trim()}
                    >
                    <i class="fa-solid fa-plus" style="font-size: 20px;"></i>
                        {saving ? "Adding..." : "Add Status Role"}
                    </button>

                    <div class="p-4 rounded-xl" style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30;">
                        <p class="text-sm" style="color: {$colorStore.text}">
                            <strong>Note:</strong> After adding a status role, you can configure which roles to add/remove and notification settings by expanding it in the Status Roles tab.
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
                        label="Total Status Roles"
                        value={statusRoles.length}
                        subtitle="configured"
                        iconColor="primary"
                        animationDelay={0}
                />

                <StatCard
                  icon="fa-crown"
                        label="Active Configs"
                        value={statusRoles.filter(r => r.toAdd || r.toRemove).length}
                        subtitle="with role changes"
                        iconColor="secondary"
                        animationDelay={100}
                />

                <StatCard
                  icon="fa-bell"
                        label="With Notifications"
                        value={statusRoles.filter(r => r.statusChannelId && r.statusChannelId !== BigInt(0)).length}
                        subtitle="have notification channels"
                        iconColor="accent"
                        animationDelay={200}
                />
            </div>
        </div>
    {/if}
</DashboardPageLayout>
