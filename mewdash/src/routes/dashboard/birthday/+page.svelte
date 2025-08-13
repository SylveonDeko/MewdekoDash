<!-- routes/dashboard/birthday/+page.svelte -->
<script lang="ts">
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { colorStore } from "$lib/stores/colorStore";
    import { currentGuild } from "$lib/stores/currentGuild";
    import { api } from "$lib/api";
    import { logger } from "$lib/logger";
    import {
        AlertCircle,
        AtSign,
        BarChart3,
        Bell,
        Cake,
        Calendar,
        CheckCircle,
        Clock,
        Crown,
        Gift,
        Hash,
        MapPin,
        MessageSquare,
        RefreshCw,
        Save,
        Settings,
        Users,
        XCircle
    } from "lucide-svelte";

    import StatCard from "$lib/components/monitoring/StatCard.svelte";
    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
    import type {
        BirthdayConfigResponse,
        BirthdayConfigRequest,
        BirthdayFeatures,
        BirthdayStatsResponse,
        BirthdayUserResponse
    } from "$lib/types/birthday";
    import {
        BirthdayFeatures as BirthdayFeaturesEnum,
        getBirthdayFeatureNames,
        hasBirthdayFeature,
        SUPPORTED_TIMEZONES as TIMEZONES
    } from "$lib/types/birthday";

    // Component state
    let loading = false;
    let saving = false;
    let message = "";
    let messageType: "success" | "error" | "info" = "info";

    // Data state
    let birthdayConfig: BirthdayConfigResponse | null = null;
    let birthdayUsers: BirthdayUserResponse[] = [];
    let birthdayStats: BirthdayStatsResponse | null = null;
    let guildChannels: Array<{ id: string; name: string; }> = [];
    let guildRoles: Array<{ id: string; name: string; color: number }> = [];

    // Form data
    let configForm: BirthdayConfigRequest = {
        birthdayChannelId: null,
        birthdayRoleId: null,
        birthdayMessage: null,
        birthdayPingRoleId: null,
        birthdayReminderDays: 1,
        defaultTimezone: "UTC"
    };

    // UI state
    let activeTab = "config";
    let upcomingDays = 7;
    let upcomingBirthdays: BirthdayUserResponse[] = [];
    let todaysBirthdays: BirthdayUserResponse[] = [];

    // Initialize data
    $: if (birthdayConfig) {
        configForm = {
            birthdayChannelId: birthdayConfig.birthdayChannelId,
            birthdayRoleId: birthdayConfig.birthdayRoleId,
            birthdayMessage: birthdayConfig.birthdayMessage,
            birthdayPingRoleId: birthdayConfig.birthdayPingRoleId,
            birthdayReminderDays: birthdayConfig.birthdayReminderDays,
            defaultTimezone: birthdayConfig.defaultTimezone
        };
    }

    // Load all birthday data
    async function loadAllBirthdayData() {
        if (!$currentGuild?.id) return;

        loading = true;
        try {
            const [
                config,
                users,
                stats,
                channels,
                roles,
                upcoming,
                today
            ] = await Promise.all([
                api.getBirthdayConfig($currentGuild.id).catch(() => null),
                api.getBirthdayUsers($currentGuild.id).catch(() => []),
                api.getBirthdayStats($currentGuild.id).catch(() => null),
                api.getGuildTextChannels($currentGuild.id).catch(() => []),
                api.getGuildRoles($currentGuild.id).catch(() => []),
                api.getBirthdayUpcoming($currentGuild.id, upcomingDays).catch(() => []),
                api.getBirthdayToday($currentGuild.id).catch(() => [])
            ]);

            birthdayConfig = config;
            birthdayUsers = users;
            birthdayStats = stats;

            // Process channels to only include text channels
            guildChannels = (channels || []).map((channel: any) => ({
                id: channel.id.toString(),
                name: channel.name
            }));

            // Process roles to filter out system roles
            guildRoles = (roles || [])
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

            upcomingBirthdays = upcoming;
            todaysBirthdays = today;
        } catch (err) {
            logger.error("Failed to load birthday data:", err);
            showMessage("Failed to load birthday data", "error");
        } finally {
            loading = false;
        }
    }

    // Load dynamic data only
    async function loadBirthdayData() {
        if (!$currentGuild?.id) return;

        try {
            const [upcoming, today] = await Promise.all([
                api.getBirthdayUpcoming($currentGuild.id, upcomingDays),
                api.getBirthdayToday($currentGuild.id)
            ]);

            upcomingBirthdays = upcoming;
            todaysBirthdays = today;
        } catch (err) {
            logger.error("Failed to load birthday data:", err);
            showMessage("Failed to load birthday data", "error");
        }
    }

    // Save configuration
    async function saveConfig() {
        if (!$currentGuild?.id) return;

        saving = true;
        try {
            await api.updateBirthdayConfig($currentGuild.id, configForm);
            showMessage("Birthday configuration saved successfully!", "success");
            // Reload to get updated config
            await loadAllBirthdayData();
        } catch (err) {
            logger.error("Failed to save birthday config:", err);
            showMessage("Failed to save configuration", "error");
        } finally {
            saving = false;
        }
    }

    // Reset configuration
    async function resetConfig() {
        if (!$currentGuild?.id) return;
        if (!confirm("Are you sure you want to reset the birthday configuration to defaults?")) return;

        saving = true;
        try {
            const resetConfig = await api.resetBirthdayConfig($currentGuild.id);
            configForm = {
                birthdayChannelId: resetConfig.birthdayChannelId,
                birthdayRoleId: resetConfig.birthdayRoleId,
                birthdayMessage: resetConfig.birthdayMessage,
                birthdayPingRoleId: resetConfig.birthdayPingRoleId,
                birthdayReminderDays: resetConfig.birthdayReminderDays,
                defaultTimezone: resetConfig.defaultTimezone
            };
            showMessage("Birthday configuration reset to defaults", "success");
        } catch (err) {
            logger.error("Failed to reset birthday config:", err);
            showMessage("Failed to reset configuration", "error");
        } finally {
            saving = false;
        }
    }

    // Toggle feature
    async function toggleFeature(feature: BirthdayFeatures) {
        if (!$currentGuild?.id || !birthdayConfig) return;

        try {
            const hasFeature = hasBirthdayFeature(birthdayConfig.enabledFeatures, feature);
            if (hasFeature) {
                await api.disableBirthdayFeature($currentGuild.id, feature);
            } else {
                await api.enableBirthdayFeature($currentGuild.id, feature);
            }

            // Reload config to get updated features
            await loadAllBirthdayData();
        } catch (err) {
            logger.error("Failed to toggle birthday feature:", err);
            showMessage("Failed to update feature", "error");
        }
    }

    // Utility functions
    function showMessage(text: string, type: "success" | "error" | "info") {
        message = text;
        messageType = type;
        setTimeout(() => {
            message = "";
        }, 5000);
    }

    function formatDate(dateString: string | Date | null | undefined): string {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleDateString();
    }

    function getChannelName(channelId: bigint | null | undefined): string {
        if (!channelId) return "Not set";
        const channel = guildChannels.find(c => c.id === channelId.toString());
        return channel ? `#${channel.name}` : "Unknown channel";
    }

    function getRoleName(roleId: bigint | null | undefined): string {
        if (!roleId) return "Not set";
        const role = guildRoles.find(r => r.id === roleId.toString());
        return role ? `@${role.name}` : "Unknown role";
    }

    // Day options for DiscordSelector
    $: dayOptions = [
        { id: "7", name: "Next 7 days" },
        { id: "14", name: "Next 14 days" },
        { id: "30", name: "Next 30 days" }
    ];

    // Handle day selection change
    function handleDayChange(event: CustomEvent) {
        upcomingDays = parseInt(event.detail.selected);
        loadBirthdayData();
    }

    onMount(() => {
        loadAllBirthdayData();
    });

    // Tabs configuration
    const tabs = [
        { id: "config", label: "Configuration", icon: Settings },
        { id: "users", label: "Users", icon: Users },
        { id: "stats", label: "Statistics", icon: BarChart3 }
    ];

    // Action buttons configuration
    $: actionButtons = [
        {
            label: "Refresh",
            icon: RefreshCw,
            action: loadAllBirthdayData,
            loading: loading
        }
    ];

    // Handle tab change
    function handleTabChange(event: CustomEvent) {
        activeTab = event.detail.tabId;
    }
</script>

<DashboardPageLayout
        title="Birthday Management"
        subtitle="Configure birthday announcements and celebrations"
        icon={Cake}
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
                    <CheckCircle class="w-5 h-5" style="color: #10b981" />
                {:else if messageType === 'error'}
                    <XCircle class="w-5 h-5" style="color: #ef4444" />
                {:else}
                    <AlertCircle class="w-5 h-5" style="color: {$colorStore.primary}" />
                {/if}
                <span
                        style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
            </div>
        {/if}

        <!-- Today's Birthdays Alert -->
        {#if todaysBirthdays.length > 0}
            <div class="mb-6 p-4 rounded-xl flex items-center gap-3"
                 style="background: linear-gradient(135deg, {$colorStore.accent}20, {$colorStore.primary}20); border: 1px solid {$colorStore.accent}30;"
                 in:fly={{ x: -20, duration: 300 }}>
                <Gift class="w-5 h-5" style="color: {$colorStore.accent}" />
                <span style="color: {$colorStore.text}">
          🎉 {todaysBirthdays.length} birthday{todaysBirthdays.length !== 1 ? 's' : ''} today!
        </span>
            </div>
        {/if}
    </svelte:fragment>


    <!-- Tab Content -->
    {#if activeTab === 'config'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <!-- Configuration Form -->
            <div class="space-y-6 md:space-y-8">
                <!-- Basic Settings -->
                <div class="relative z-20 rounded-2xl p-6 md:p-8 shadow-2xl"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
                    <div class="flex items-center gap-3 mb-6">
                        <Settings class="w-5 h-5" style="color: {$colorStore.primary}" />
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Basic Settings</h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <!-- Channel Selection -->
                        <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                <Hash class="w-4 h-4 inline mr-1" />
                                Birthday Channel
                            </label>
                            <div class="min-h-[44px]">
                                <DiscordSelector
                                        type="channel"
                                        options={guildChannels}
                                        selected={configForm.birthdayChannelId?.toString() || null}
                                        placeholder="No channel selected"
                                        on:change={(e) => {
                    configForm.birthdayChannelId = e.detail.selected ? BigInt(e.detail.selected) : null;
                    configForm = { ...configForm };
                  }}
                                />
                            </div>
                        </div>

                        <!-- Birthday Role -->
                        <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                <Crown class="w-4 h-4 inline mr-1" />
                                Birthday Role (24-hour temporary)
                            </label>
                            <div class="min-h-[44px]">
                                <DiscordSelector
                                        type="role"
                                        options={guildRoles}
                                        selected={configForm.birthdayRoleId?.toString() || null}
                                        placeholder="No role selected"
                                        on:change={(e) => {
                    configForm.birthdayRoleId = e.detail.selected ? BigInt(e.detail.selected) : null;
                    configForm = { ...configForm };
                  }}
                                />
                            </div>
                        </div>

                        <!-- Ping Role -->
                        <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                <Bell class="w-4 h-4 inline mr-1" />
                                Ping Role (notifies when announcing)
                            </label>
                            <div class="min-h-[44px]">
                                <DiscordSelector
                                        type="role"
                                        options={guildRoles}
                                        selected={configForm.birthdayPingRoleId?.toString() || null}
                                        placeholder="No ping role"
                                        on:change={(e) => {
                    configForm.birthdayPingRoleId = e.detail.selected ? BigInt(e.detail.selected) : null;
                    configForm = { ...configForm };
                  }}
                                />
                            </div>
                        </div>

                        <!-- Timezone -->
                        <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                <MapPin class="w-4 h-4 inline mr-1" />
                                Server Timezone
                            </label>
                            <div class="min-h-[44px]">
                                <DiscordSelector
                                        type="timezone"
                                        options={TIMEZONES.map(tz => ({
                    id: tz.value,
                    name: tz.label,
                    label: tz.label,
                    offset: tz.offset,
                    value: tz.value
                  }))}
                                        selected={configForm.defaultTimezone}
                                        placeholder="Select timezone"
                                        on:change={(e) => {
                    configForm.defaultTimezone = e.detail.selected || "UTC";
                    configForm = { ...configForm };
                  }}
                                />
                            </div>
                        </div>

                        <!-- Reminder Days -->
                        <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                <Clock class="w-4 h-4 inline mr-1" />
                                Reminder Days Before Birthday
                            </label>
                            <input
                                    type="number"
                                    min="0"
                                    max="30"
                                    bind:value={configForm.birthdayReminderDays}
                                    class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            />
                        </div>
                    </div>
                </div>

                <!-- Custom Message -->
                <div class="relative z-10 rounded-2xl p-6 md:p-8 shadow-2xl border"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}15);
                    border-color: {$colorStore.primary}20;">
                    <div class="flex items-center gap-3 mb-6">
                        <MessageSquare class="w-5 h-5" style="color: {$colorStore.primary}" />
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Birthday Message</h2>
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            Custom Birthday Announcement
                        </label>
                        <textarea
                                bind:value={configForm.birthdayMessage}
                                placeholder="🎉 Happy Birthday %user.mention%! 🎂 Hope you have a wonderful day!"
                                rows="3"
                                class="w-full p-3 rounded-xl border transition-all resize-none min-h-[100px] text-base"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        ></textarea>
                        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                            Available placeholders: %user.mention%, %user.name%, %user.displayname%, %birthday.age%, %server.name%,
                            %server.time%. Leave empty for default message.
                        </p>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4">
                    <button
                            class="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-105 min-h-[52px]"
                            style="background: {$colorStore.primary}; color: white;"
                            on:click={saveConfig}
                            disabled={saving}
                    >
                        <Save class="w-5 h-5" />
                        {saving ? "Saving..." : "Save Configuration"}
                    </button>

                    <button
                            class="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-105 min-h-[52px]"
                            style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                            on:click={resetConfig}
                            disabled={saving}
                    >
                        <RefreshCw class="w-5 h-5" />
                        Reset to Default
                    </button>
                </div>
            </div>

            <!-- Feature Toggles & Preview -->
            <div class="space-y-6">
                <!-- Feature Controls -->
                <div class="rounded-2xl p-6 shadow-2xl"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
                    <div class="flex items-center gap-3 mb-6">
                        <Gift class="w-5 h-5" style="color: {$colorStore.primary}" />
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Birthday Features</h2>
                    </div>

                    <div class="space-y-4">
                        <!-- Feature Toggles -->
                        <div class="space-y-3">
                            <div class="flex items-center justify-between p-3 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <MessageSquare class="w-5 h-5" style="color: {$colorStore.primary}" />
                                    <div>
                                        <div class="font-medium" style="color: {$colorStore.text}">Announcements</div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">Send birthday messages in channel</div>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input
                                            type="checkbox"
                                            class="sr-only peer"
                                            checked={birthdayConfig ? hasBirthdayFeature(birthdayConfig.enabledFeatures, BirthdayFeaturesEnum.Announcements) : false}
                                            on:change={() => toggleFeature(BirthdayFeaturesEnum.Announcements)}
                                    />
                                    <div
                                            class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                            style="peer-checked:bg-color: {$colorStore.primary}"></div>
                                </label>
                            </div>

                            <div class="flex items-center justify-between p-3 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <Crown class="w-5 h-5" style="color: {$colorStore.primary}" />
                                    <div>
                                        <div class="font-medium" style="color: {$colorStore.text}">Birthday Role</div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">Assign temporary role for 24 hours</div>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input
                                            type="checkbox"
                                            class="sr-only peer"
                                            checked={birthdayConfig ? hasBirthdayFeature(birthdayConfig.enabledFeatures, BirthdayFeaturesEnum.BirthdayRole) : false}
                                            on:change={() => toggleFeature(BirthdayFeaturesEnum.BirthdayRole)}
                                            disabled={!configForm.birthdayRoleId}
                                    />
                                    <div
                                            class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-disabled:opacity-50"
                                            style="peer-checked:bg-color: {$colorStore.primary}"></div>
                                </label>
                            </div>

                            <div class="flex items-center justify-between p-3 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <Bell class="w-5 h-5" style="color: {$colorStore.primary}" />
                                    <div>
                                        <div class="font-medium" style="color: {$colorStore.text}">Reminders</div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">Send birthday reminders to users</div>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input
                                            type="checkbox"
                                            class="sr-only peer"
                                            checked={birthdayConfig ? hasBirthdayFeature(birthdayConfig.enabledFeatures, BirthdayFeaturesEnum.Reminders) : false}
                                            on:change={() => toggleFeature(BirthdayFeaturesEnum.Reminders)}
                                    />
                                    <div
                                            class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                            style="peer-checked:bg-color: {$colorStore.primary}"></div>
                                </label>
                            </div>

                            <div class="flex items-center justify-between p-3 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <AtSign class="w-5 h-5" style="color: {$colorStore.primary}" />
                                    <div>
                                        <div class="font-medium" style="color: {$colorStore.text}">Ping Role</div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">Ping specified role with announcements</div>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input
                                            type="checkbox"
                                            class="sr-only peer"
                                            checked={birthdayConfig ? hasBirthdayFeature(birthdayConfig.enabledFeatures, BirthdayFeaturesEnum.PingRole) : false}
                                            on:change={() => toggleFeature(BirthdayFeaturesEnum.PingRole)}
                                            disabled={!configForm.birthdayPingRoleId}
                                    />
                                    <div
                                            class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-disabled:opacity-50"
                                            style="peer-checked:bg-color: {$colorStore.primary}"></div>
                                </label>
                            </div>

                            <div class="flex items-center justify-between p-3 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <MapPin class="w-5 h-5" style="color: {$colorStore.primary}" />
                                    <div>
                                        <div class="font-medium" style="color: {$colorStore.text}">Timezone Support</div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">Respect user-specific timezones</div>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input
                                            type="checkbox"
                                            class="sr-only peer"
                                            checked={birthdayConfig ? hasBirthdayFeature(birthdayConfig.enabledFeatures, BirthdayFeaturesEnum.TimezoneSupport) : false}
                                            on:change={() => toggleFeature(BirthdayFeaturesEnum.TimezoneSupport)}
                                    />
                                    <div
                                            class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                            style="peer-checked:bg-color: {$colorStore.primary}"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Configuration Preview -->
                <div class="rounded-2xl p-6 shadow-2xl"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
                    <div class="flex items-center gap-3 mb-6">
                        <AlertCircle class="w-5 h-5" style="color: {$colorStore.primary}" />
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Current Configuration</h2>
                    </div>

                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span style="color: {$colorStore.muted}">Channel:</span>
                            <span style="color: {$colorStore.text}">{getChannelName(configForm.birthdayChannelId)}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span style="color: {$colorStore.muted}">Birthday Role:</span>
                            <span style="color: {$colorStore.text}">{getRoleName(configForm.birthdayRoleId)}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span style="color: {$colorStore.muted}">Ping Role:</span>
                            <span style="color: {$colorStore.text}">{getRoleName(configForm.birthdayPingRoleId)}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span style="color: {$colorStore.muted}">Timezone:</span>
                            <span style="color: {$colorStore.text}">{configForm.defaultTimezone}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span style="color: {$colorStore.muted}">Active Features:</span>
                            <span style="color: {$colorStore.text}">
                {birthdayConfig ? getBirthdayFeatureNames(birthdayConfig.enabledFeatures).join(", ") || "None" : "None"}
              </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    {:else if activeTab === 'users'}
        <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                <!-- Upcoming Birthdays -->
                <div class="rounded-2xl p-6 md:p-8 shadow-2xl relative z-20"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-3">
                            <Calendar class="w-5 h-5" style="color: {$colorStore.primary}" />
                            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Upcoming Birthdays</h2>
                        </div>
                        <div class="min-w-[140px]">
                            <DiscordSelector
                                    type="custom"
                                    options={dayOptions}
                                    selected={upcomingDays.toString()}
                                    placeholder="Select period"
                                    on:change={handleDayChange}
                                    searchable={false}
                            />
                        </div>
                    </div>

                    <div class="space-y-3 max-h-96 overflow-y-auto">
                        {#if loading}
                            <!-- Loading state -->
                            {#each Array(5).fill(0) as _}
                                <div class="flex items-center gap-4 p-3 rounded-xl animate-pulse"
                                     style="background: {$colorStore.primary}08;">
                                    <div class="w-12 h-12 rounded-full" style="background: {$colorStore.primary}20;"></div>
                                    <div class="flex-1 space-y-2">
                                        <div class="h-4 rounded" style="background: {$colorStore.primary}20; width: 70%;"></div>
                                        <div class="h-3 rounded" style="background: {$colorStore.primary}15; width: 50%;"></div>
                                    </div>
                                    <div class="w-16 h-6 rounded" style="background: {$colorStore.primary}20;"></div>
                                </div>
                            {/each}
                        {:else if upcomingBirthdays.length === 0}
                            <!-- Empty state -->
                            <div class="text-center py-8">
                                <Calendar class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
                                <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No Upcoming Birthdays</h3>
                                <p class="text-sm" style="color: {$colorStore.muted}">
                                    No birthdays in the next {upcomingDays} days.
                                </p>
                            </div>
                        {:else}
                            {#each upcomingBirthdays as user}
                                <div class="flex items-center gap-4 p-3 rounded-xl transition-all hover:scale-[1.02]"
                                     style="background: {$colorStore.primary}08;">
                                    <img src={user.avatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`}
                                         alt="" class="w-12 h-12 rounded-full" />
                                    <div class="flex-1">
                                        <div class="font-semibold" style="color: {$colorStore.text}">
                                            {user.nickname || user.username}
                                        </div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">
                                            {user.birthdayAnnouncementsEnabled ? formatDate(user.birthday) : 'Private'} • {user.birthdayTimezone || 'UTC'}
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm font-medium" style="color: {$colorStore.primary}">
                                            {user.daysUntil === 0 ? 'Today!' :
                                                user.daysUntil === 1 ? 'Tomorrow' :
                                                    `${user.daysUntil} days`}
                                        </div>
                                        <div class="text-xs" style="color: {$colorStore.muted}">
                                            {user.birthdayAnnouncementsEnabled ? 'Public' : 'Private'}
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                </div>

                <!-- All Users with Birthdays -->
                <div class="rounded-2xl p-6 md:p-8 shadow-2xl relative z-10"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
                    <div class="flex items-center gap-3 mb-6">
                        <Users class="w-5 h-5" style="color: {$colorStore.primary}" />
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">All Users ({birthdayUsers.length})</h2>
                    </div>

                    <div class="space-y-3 max-h-96 overflow-y-auto">
                        {#if birthdayUsers.length === 0}
                            <div class="text-center py-8">
                                <Users class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
                                <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No Birthdays Set</h3>
                                <p class="text-sm" style="color: {$colorStore.muted}">
                                    No users have configured their birthdays yet.
                                </p>
                            </div>
                        {:else}
                            {#each birthdayUsers as user}
                                <div class="flex items-center gap-4 p-3 rounded-xl transition-all hover:scale-[1.02]"
                                     style="background: {$colorStore.primary}08;">
                                    <img src={user.avatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`}
                                         alt="" class="w-10 h-10 rounded-full" />
                                    <div class="flex-1">
                                        <div class="font-medium" style="color: {$colorStore.text}">
                                            {user.nickname || user.username}
                                        </div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">
                                            {user.birthdayAnnouncementsEnabled ? formatDate(user.birthday) : 'Private'} • {user.birthdayTimezone || 'UTC'}
                                        </div>
                                    </div>
                                    <div class="text-xs px-2 py-1 rounded-lg"
                                         style="background: {user.birthdayAnnouncementsEnabled ? $colorStore.primary + '20' : $colorStore.muted + '20'};
                            color: {user.birthdayAnnouncementsEnabled ? $colorStore.primary : $colorStore.muted};">
                                        {user.birthdayAnnouncementsEnabled ? 'Public' : 'Private'}
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                </div>
            </div>
        </div>

    {:else if activeTab === 'stats'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                {#if birthdayStats}
                    <StatCard
                            icon={Users}
                            label="Total Users"
                            value={birthdayStats.totalUsers}
                            subtitle="server members"
                            iconColor="primary"
                            animationDelay={0}
                    />

                    <StatCard
                            icon={Cake}
                            label="Birthdays Set"
                            value={birthdayStats.usersWithBirthdays}
                            subtitle={`${(birthdayStats.birthdaySetPercentage || 0).toFixed(1)}% of members`}
                            iconColor="secondary"
                            animationDelay={100}
                    />

                    <StatCard
                            icon={Gift}
                            label="Public Birthdays"
                            value={birthdayStats.usersWithAnnouncementsEnabled || 0}
                            subtitle="announcements enabled"
                            iconColor="accent"
                            animationDelay={200}
                    />

                    <StatCard
                            icon={Calendar}
                            label="Today's Birthdays"
                            value={birthdayStats.todaysBirthdayCount}
                            subtitle="celebrating today"
                            iconColor="primary"
                            animationDelay={300}
                    />
                {:else}
                    <div class="col-span-full text-center py-12">
                        <BarChart3 class="w-16 h-16 mx-auto mb-4" style="color: {$colorStore.primary}50" />
                        <h3 class="text-xl font-semibold mb-2" style="color: {$colorStore.text}">No Statistics Available</h3>
                        <p style="color: {$colorStore.muted}">
                            Birthday statistics will appear here once the system is configured.
                        </p>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</DashboardPageLayout>

<style>
    .peer:checked ~ div {
        background-color: var(--primary-color);
    }
</style>