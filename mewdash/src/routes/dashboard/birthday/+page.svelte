<!-- routes/dashboard/birthday/+page.svelte -->
<script lang="ts">


    import { onMount } from "svelte";
    import {fade, fly} from "svelte/transition";
    import {colorStore} from "$lib/stores/colorStore";
    import {currentGuild} from "$lib/stores/currentGuild";
    import {
        birthdayApi,
        clientApi,
        BirthdayFeatures,
        type BirthdayConfig,
        type BirthdayConfigRequest,
        type BirthdayUser,
        type BirthdayStats
    } from "$lib/api/index.ts";
    import {logger} from "$lib/logger";

    import StatCard from "$lib/components/monitoring/StatCard.svelte";
    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";

    // Helper functions for birthday features
    function hasBirthdayFeature(enabledFeatures: number, feature: BirthdayFeatures): boolean {
        return (enabledFeatures & feature) === feature;
    }

    function getBirthdayFeatureNames(enabledFeatures: number): string[] {
        const names: string[] = [];
        if (hasBirthdayFeature(enabledFeatures, BirthdayFeatures.Announcements)) names.push("Announcements");
        if (hasBirthdayFeature(enabledFeatures, BirthdayFeatures.BirthdayRole)) names.push("Birthday Role");
        if (hasBirthdayFeature(enabledFeatures, BirthdayFeatures.Reminders)) names.push("Reminders");
        if (hasBirthdayFeature(enabledFeatures, BirthdayFeatures.PingRole)) names.push("Ping Role");
        if (hasBirthdayFeature(enabledFeatures, BirthdayFeatures.TimezoneSupport)) names.push("Timezone Support");
        return names;
    }

    // Common timezones
    const TIMEZONES = [
        { value: "UTC", label: "UTC (GMT+0)", offset: "+00:00" },
        { value: "America/New_York", label: "Eastern Time (GMT-5)", offset: "-05:00" },
        { value: "America/Chicago", label: "Central Time (GMT-6)", offset: "-06:00" },
        { value: "America/Denver", label: "Mountain Time (GMT-7)", offset: "-07:00" },
        { value: "America/Los_Angeles", label: "Pacific Time (GMT-8)", offset: "-08:00" },
        { value: "Europe/London", label: "London (GMT+0)", offset: "+00:00" },
        { value: "Europe/Paris", label: "Paris (GMT+1)", offset: "+01:00" },
        { value: "Europe/Berlin", label: "Berlin (GMT+1)", offset: "+01:00" },
        { value: "Europe/Moscow", label: "Moscow (GMT+3)", offset: "+03:00" },
        { value: "Asia/Tokyo", label: "Tokyo (GMT+9)", offset: "+09:00" },
        { value: "Asia/Shanghai", label: "Shanghai (GMT+8)", offset: "+08:00" },
        { value: "Asia/Dubai", label: "Dubai (GMT+4)", offset: "+04:00" },
        { value: "Australia/Sydney", label: "Sydney (GMT+10)", offset: "+10:00" }
    ];

    // Component state
    let loading = $state(false);
    let saving = $state(false);
    let message = $state("");
    let messageType: "success" | "error" | "info" = $state("info");

    // Data state
    let birthdayConfig: BirthdayConfig | null = $state(null);
    let birthdayUsers: BirthdayUser[] = $state([]);
    let birthdayStats: BirthdayStats | null = $state(null);
    let guildChannels: Array<{ id: string; name: string; }> = $state([]);
    let guildRoles: Array<{ id: string; name: string; color: number }> = $state([]);

    // Form data
    let configForm: BirthdayConfigRequest = $state({
        birthdayChannelId: null,
        birthdayRoleId: null,
        birthdayMessage: null,
        birthdayPingRoleId: null,
        birthdayReminderDays: 1,
        defaultTimezone: "UTC"
    });

    // UI state
    let activeTab = $state("config");
    let upcomingDays = $state(7);
    let upcomingBirthdays: BirthdayUser[] = $state([]);
    let todaysBirthdays: BirthdayUser[] = $state([]);

    // Initialize data
    $effect(() => {
        if (birthdayConfig) {
            configForm = {
                birthdayChannelId: birthdayConfig.birthdayChannelId,
                birthdayRoleId: birthdayConfig.birthdayRoleId,
                birthdayMessage: birthdayConfig.birthdayMessage,
                birthdayPingRoleId: birthdayConfig.birthdayPingRoleId,
                birthdayReminderDays: birthdayConfig.birthdayReminderDays,
                defaultTimezone: birthdayConfig.defaultTimezone
            };
        }
    });

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
                birthdayApi.getBirthdayConfig($currentGuild.id).catch(() => null),
                birthdayApi.getBirthdayUsers($currentGuild.id).catch(() => []),
                birthdayApi.getBirthdayStats($currentGuild.id).catch(() => null),
                clientApi.getTextChannels($currentGuild.id).catch(() => []),
                clientApi.getRoles($currentGuild.id).catch(() => []),
                birthdayApi.getBirthdayUpcoming($currentGuild.id, upcomingDays).catch(() => []),
                birthdayApi.getBirthdayToday($currentGuild.id).catch(() => [])
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
                birthdayApi.getBirthdayUpcoming($currentGuild.id, upcomingDays),
                birthdayApi.getBirthdayToday($currentGuild.id)
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
            await birthdayApi.updateBirthdayConfig($currentGuild.id, configForm);
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
            await birthdayApi.resetBirthdayConfig($currentGuild.id);
            // Reload to get the reset config
            await loadAllBirthdayData();
            showMessage("Birthday configuration reset to defaults", "success");
        } catch (err) {
            logger.error("Failed to reset birthday config:", err);
            showMessage("Failed to reset configuration", "error");
        } finally {
            saving = false;
        }
    }

    // Toggle feature
    async function toggleFeature(feature: number) {
        if (!$currentGuild?.id || !birthdayConfig) return;

        try {
            const hasFeature = hasBirthdayFeature(birthdayConfig.enabledFeatures, feature);
            if (hasFeature) {
                await birthdayApi.disableBirthdayFeature($currentGuild.id, feature);
            } else {
                await birthdayApi.enableBirthdayFeature($currentGuild.id, feature);
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
    let dayOptions = $derived([
        { id: "7", name: "Next 7 days" },
        { id: "14", name: "Next 14 days" },
        { id: "30", name: "Next 30 days" }
    ]);

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
        { id: "config", label: "Configuration", icon: "fa-gear" },
        { id: "users", label: "Users", icon: "fa-users" },
        { id: "stats", label: "Statistics", icon: "fa-chart-column" }
    ];

    // Action buttons configuration
    let actionButtons = $derived([
        {
            label: "Refresh",
            icon: "fa-arrows-rotate",
            action: loadAllBirthdayData,
            loading: loading
        }
    ]);

    // Handle tab change
    function handleTabChange(event: CustomEvent) {
        activeTab = event.detail.tabId;
    }
</script>

<DashboardPageLayout
        title="Birthday Management"
        subtitle="Configure birthday announcements and celebrations"
        icon="fa-cake-candles"
        {tabs}
        {activeTab}
        {actionButtons}
        guildName={$currentGuild?.name || "Dashboard"}
        on:tabChange={handleTabChange}
>

    <!-- @migration-task: migrate this slot by hand, `status-messages` is an invalid identifier -->
    <svelte:fragment slot="status-messages">
        <!-- Status Message -->
        {#if message}
            <div class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-all"
                 style="background: {messageType === 'success' ? '#10b98120' : messageType === 'error' ? '#ef444420' : $colorStore.primary + '20'};
                  border: 1px solid {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}30;"
                 in:fly={{ x: 20, duration: 300 }}>
                {#if messageType === 'success'}
                    <i class="fa-utility-duo fa-regular fa-circle-check" style="--fa-primary-color: #10b981; --fa-secondary-color: #059669; font-size: 20px;"></i>
                {:else if messageType === 'error'}
                    <i class="fa-utility-duo fa-regular fa-circle-xmark" style="--fa-primary-color: #ef4444; --fa-secondary-color: #dc2626; font-size: 20px;"></i>
                {:else}
                    <i class="fa-utility-duo fa-regular fa-circle-exclamation" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
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
                <i class="fa-utility-duo fa-regular fa-gift" style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
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
                <div class="relative z-20 backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                        <i class="fa-utility-duo fa-regular fa-gear" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Basic Settings</h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <!-- Channel Selection -->
                        <div>
                            <span id="birthday-channel-label" class="block text-sm font-medium mb-2"
                                  style="color: {$colorStore.text}">
                                <i class="fa-solid fa-hashtag" style="font-size: 14px;"></i>
                                Birthday Channel
                            </span>
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
                                        aria-labelledby="birthday-channel-label" />
                            </div>
                        </div>

                        <!-- Birthday Role -->
                        <div>
                            <span id="birthday-role-24-hour-temporary-label" class="block text-sm font-medium mb-2"
                                  style="color: {$colorStore.text}">
                                <i class="fa-solid fa-crown" style="font-size: 14px;"></i>
                                Birthday Role (24-hour temporary)
                            </span>
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
                                        aria-labelledby="birthday-role-24-hour-temporary-label" />
                            </div>
                        </div>

                        <!-- Ping Role -->
                        <div>
                            <span id="ping-role-notifies-when-announcing-label" class="block text-sm font-medium mb-2"
                                  style="color: {$colorStore.text}">
                                <i class="fa-solid fa-bell" style="font-size: 14px;"></i>
                                Ping Role (notifies when announcing)
                            </span>
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
                                        aria-labelledby="ping-role-notifies-when-announcing-label" />
                            </div>
                        </div>

                        <!-- Timezone -->
                        <div>
                            <span id="server-timezone-label" class="block text-sm font-medium mb-2"
                                  style="color: {$colorStore.text}">
                                <i class="fa-solid fa-location-dot" style="font-size: 14px;"></i>
                                Server Timezone
                            </span>
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
                          <label for="input-1955" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text}">
                                <i class="fa-solid fa-clock" style="font-size: 14px;"></i>
                                Reminder Days Before Birthday
                            </label>
                          <input id="input-1955"
                                    type="number"
                                    min="0"
                                    max="30"
                                    bind:value={configForm.birthdayReminderDays}
                                    class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          >
                        </div>
                    </div>
                </div>

                <!-- Custom Message -->
                <div class="relative z-10 backdrop-blur-xs rounded-2xl p-6 md:p-8 shadow-2xl transition-all border"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}15);
                    border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                        <i class="fa-utility-duo fa-regular fa-comment" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Birthday Message</h2>
                    </div>

                    <div>
                      <label for="birthday-message" class="block text-sm font-medium mb-2"
                             style="color: {$colorStore.text}">
                            Custom Birthday Announcement
                        </label>
                      <textarea id="birthday-message"
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
                  <button aria-label="Button action"
                          class="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[52px]"
                            style="background: {$colorStore.primary}; color: white;"
                            onclick={saveConfig}
                            disabled={saving}
                    >
                        <i class="fa-solid fa-floppy-disk" style="font-size: 20px;"></i>
                        {saving ? "Saving..." : "Save Configuration"}
                    </button>

                    <button
                      class="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[52px]"
                            style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                            onclick={resetConfig}
                            disabled={saving}
                    >
                        <i class="fa-solid fa-arrows-rotate" style="font-size: 20px;"></i>
                        Reset to Default
                    </button>
                </div>
            </div>

            <!-- Feature Toggles & Preview -->
            <div class="space-y-6">
                <!-- Feature Controls -->
                <div class="backdrop-blur-xs rounded-2xl border p-6 shadow-2xl transition-all"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                        <i class="fa-utility-duo fa-regular fa-gift" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Birthday Features</h2>
                    </div>

                    <div class="space-y-4">
                        <!-- Feature Toggles -->
                        <div class="space-y-3">
                            <div class="flex items-center justify-between p-3 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <i class="fa-utility-duo fa-regular fa-comment" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                                    <div>
                                        <div class="font-medium" style="color: {$colorStore.text}">Announcements</div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">Send birthday messages in channel</div>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input
                                            type="checkbox"
                                            class="sr-only peer"
                                            checked={birthdayConfig ? hasBirthdayFeature(birthdayConfig.enabledFeatures, BirthdayFeatures.Announcements) : false}
                                            onchange={() => toggleFeature(BirthdayFeatures.Announcements)}
                                    >
                                    <div
                                            class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                            style="peer-checked:bg-color: {$colorStore.primary}"></div>
                                </label>
                            </div>

                            <div class="flex items-center justify-between p-3 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <i class="fa-utility-duo fa-regular fa-crown" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                                    <div>
                                        <div class="font-medium" style="color: {$colorStore.text}">Birthday Role</div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">Assign temporary role for 24 hours</div>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input
                                            type="checkbox"
                                            class="sr-only peer"
                                            checked={birthdayConfig ? hasBirthdayFeature(birthdayConfig.enabledFeatures, BirthdayFeatures.BirthdayRole) : false}
                                            onchange={() => toggleFeature(BirthdayFeatures.BirthdayRole)}
                                            disabled={!configForm.birthdayRoleId}
                                    >
                                    <div
                                            class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-disabled:opacity-50"
                                            style="peer-checked:bg-color: {$colorStore.primary}"></div>
                                </label>
                            </div>

                            <div class="flex items-center justify-between p-3 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <i class="fa-utility-duo fa-regular fa-bell" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                                    <div>
                                        <div class="font-medium" style="color: {$colorStore.text}">Reminders</div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">Send birthday reminders to users</div>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input
                                            type="checkbox"
                                            class="sr-only peer"
                                            checked={birthdayConfig ? hasBirthdayFeature(birthdayConfig.enabledFeatures, BirthdayFeatures.Reminders) : false}
                                            onchange={() => toggleFeature(BirthdayFeatures.Reminders)}
                                    >
                                    <div
                                            class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                            style="peer-checked:bg-color: {$colorStore.primary}"></div>
                                </label>
                            </div>

                            <div class="flex items-center justify-between p-3 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <i class="fa-utility-duo fa-regular fa-at" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                                    <div>
                                        <div class="font-medium" style="color: {$colorStore.text}">Ping Role</div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">Ping specified role with announcements</div>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input
                                            type="checkbox"
                                            class="sr-only peer"
                                            checked={birthdayConfig ? hasBirthdayFeature(birthdayConfig.enabledFeatures, BirthdayFeatures.PingRole) : false}
                                            onchange={() => toggleFeature(BirthdayFeatures.PingRole)}
                                            disabled={!configForm.birthdayPingRoleId}
                                    >
                                    <div
                                            class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-disabled:opacity-50"
                                            style="peer-checked:bg-color: {$colorStore.primary}"></div>
                                </label>
                            </div>

                            <div class="flex items-center justify-between p-3 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <i class="fa-utility-duo fa-regular fa-location-dot" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                                    <div>
                                        <div class="font-medium" style="color: {$colorStore.text}">Timezone Support</div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">Respect user-specific timezones</div>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input
                                            type="checkbox"
                                            class="sr-only peer"
                                            checked={birthdayConfig ? hasBirthdayFeature(birthdayConfig.enabledFeatures, BirthdayFeatures.TimezoneSupport) : false}
                                            onchange={() => toggleFeature(BirthdayFeatures.TimezoneSupport)}
                                    >
                                    <div
                                            class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                            style="peer-checked:bg-color: {$colorStore.primary}"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Configuration Preview -->
                <div class="backdrop-blur-xs rounded-2xl border p-6 shadow-2xl transition-all"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                        <i class="fa-utility-duo fa-regular fa-circle-exclamation" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
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
                <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-3">
                            <i class="fa-utility-duo fa-regular fa-calendar" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
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
                                        <div class="h-4 rounded-sm"
                                             style="background: {$colorStore.primary}20; width: 70%;"></div>
                                        <div class="h-3 rounded-sm"
                                             style="background: {$colorStore.primary}15; width: 50%;"></div>
                                    </div>
                                    <div class="w-16 h-6 rounded-sm" style="background: {$colorStore.primary}20;"></div>
                                </div>
                            {/each}
                        {:else if upcomingBirthdays.length === 0}
                            <!-- Empty state -->
                            <div class="text-center py-8">
                                <i class="fa-utility-duo fa-regular fa-calendar" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5;"></i>
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
                <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-10"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                        <i class="fa-utility-duo fa-regular fa-users" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">All Users ({birthdayUsers.length})</h2>
                    </div>

                    <div class="space-y-3 max-h-96 overflow-y-auto">
                        {#if birthdayUsers.length === 0}
                            <div class="text-center py-8">
                                <i class="fa-utility-duo fa-regular fa-users" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5;"></i>
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
                            icon="fa-users"
                            label="Total Users"
                            value={birthdayStats.totalUsers}
                            subtitle="server members"
                            iconColor="primary"
                            animationDelay={0}
                    />

                    <StatCard
                            icon="fa-cake-candles"
                            label="Birthdays Set"
                            value={birthdayStats.usersWithBirthdays}
                            subtitle={`${Number(birthdayStats.birthdaySetPercentage || 0).toFixed(1)}% of members`}
                            iconColor="secondary"
                            animationDelay={100}
                    />

                    <StatCard
                            icon="fa-gift"
                            label="Public Birthdays"
                            value={birthdayStats.usersWithAnnouncementsEnabled || 0}
                            subtitle="announcements enabled"
                            iconColor="accent"
                            animationDelay={200}
                    />

                    <StatCard
                            icon="fa-calendar"
                            label="Today's Birthdays"
                            value={birthdayStats.todaysBirthdayCount}
                            subtitle="celebrating today"
                            iconColor="primary"
                            animationDelay={300}
                    />
                {:else}
                    <div class="col-span-full text-center py-12">
                        <i class="fa-utility-duo fa-regular fa-chart-column" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 64px; opacity: 0.5;"></i>
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