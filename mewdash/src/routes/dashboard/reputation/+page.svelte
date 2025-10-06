<!-- routes/dashboard/reputation/+page.svelte -->
<script lang="ts">
    import {onMount} from "svelte";
    import {fade, fly} from "svelte/transition";
    import {colorStore} from "$lib/stores/colorStore";
    import {currentGuild} from "$lib/stores/currentGuild";
    import {api} from "$lib/api";
    import {logger} from "$lib/logger";
    import {
        AlertCircle,
        Award,
        BarChart3,
        Bell,
        CheckCircle,
        Clock,
        Crown,
        Gift,
        Hash,
        MessageSquare,
        Plus,
        RefreshCw,
        Save,
        Settings,
        Star,
        TrendingUp,
        Trophy,
        Users,
        XCircle
    } from "lucide-svelte";

    import StatCard from "$lib/components/monitoring/StatCard.svelte";
    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";

    // Component state
    let loading = $state(false);
    let saving = $state(false);
    let message = $state("");
    let messageType: "success" | "error" | "info" = $state("info");

    // Data state
    let repConfig: {
        guildId: bigint;
        enabled: boolean;
        defaultCooldownMinutes: number;
        dailyLimit: number;
        weeklyLimit: number | null;
        minAccountAgeDays: number;
        minServerMembershipHours: number;
        minMessageCount: number;
        enableNegativeRep: boolean;
        enableAnonymous: boolean;
        enableDecay: boolean;
        decayType: string;
        decayAmount: number;
        decayInactiveDays: number;
        notificationChannel: bigint | null;
    } | null = $state(null);
    let roleRewards: Array<{
        roleId: bigint;
        roleName: string;
        repRequired: number;
        removeOnDrop: boolean;
        announceChannel: bigint | null;
        announceDM: boolean;
        xpReward: number | null;
    }> = $state([]);
    let leaderboard: Array<{
        rank: number;
        userId: bigint;
        username: string;
        reputation: number;
    }> = $state([]);
    let stats: {
        totalUsers: number;
        totalRepGiven: number;
        totalTransactions: number;
        averageRepPerUser: number;
        recentActivity: Array<{
            fromUserId: bigint;
            toUserId: bigint;
            amount: number;
            timestamp: string;
            reason: string | null;
        }>;
        topGivers: Array<{
            userId: bigint;
            totalGiven: number;
        }>;
    } | null = $state(null);
    let guildChannels: Array<{ id: string; name: string; }> = $state([]);
    let guildRoles: Array<{ id: string; name: string; color: number }> = $state([]);

    // Form data
    let configForm = $state({
        enabled: true,
        defaultCooldownMinutes: 60,
        dailyLimit: 10,
        weeklyLimit: null as number | null,
        minAccountAgeDays: 7,
        minServerMembershipHours: 24,
        minMessageCount: 10,
        enableNegativeRep: false,
        enableAnonymous: false,
        notificationChannel: null as bigint | null
    });
    let newRoleReward = $state({
        roleId: null as string | null,
        repRequired: 100,
        removeOnDrop: true,
        announceChannelId: null as string | null,
        announceDM: false,
        xpReward: null as number | null
    });

    // UI state
    let activeTab = $state("config");
    let leaderboardPage = $state(1);
    let leaderboardPageSize = $state(20);

    // Load all reputation data
    async function loadAllReputationData() {
        if (!$currentGuild?.id) return;

        loading = true;
        try {
            const [
                configData,
                rewardsData,
                leaderboardData,
                statsData,
                channelsData,
                rolesListData
            ] = await Promise.all([
                api.getReputationConfig($currentGuild.id).catch(() => null),
                api.getReputationRoleRewards($currentGuild.id).catch(() => []),
                api.getReputationLeaderboard($currentGuild.id, leaderboardPage, leaderboardPageSize).catch(() => []),
                api.getReputationStats($currentGuild.id).catch(() => null),
                api.getGuildTextChannels($currentGuild.id).catch(() => []),
                api.getGuildRoles($currentGuild.id).catch(() => [])
            ]);

            repConfig = configData;
            roleRewards = rewardsData;
            leaderboard = leaderboardData;
            stats = statsData;

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

            if (repConfig) {
                configForm = {
                    enabled: repConfig.enabled,
                    defaultCooldownMinutes: repConfig.defaultCooldownMinutes,
                    dailyLimit: repConfig.dailyLimit,
                    weeklyLimit: repConfig.weeklyLimit,
                    minAccountAgeDays: repConfig.minAccountAgeDays,
                    minServerMembershipHours: repConfig.minServerMembershipHours,
                    minMessageCount: repConfig.minMessageCount,
                    enableNegativeRep: repConfig.enableNegativeRep,
                    enableAnonymous: repConfig.enableAnonymous,
                    notificationChannel: repConfig.notificationChannel
                };
            }
        } catch (err) {
            logger.error("Failed to load reputation data:", err);
            showMessage("Failed to load reputation data", "error");
        } finally {
            loading = false;
        }
    }

    // Save configuration
    async function saveConfig() {
        if (!$currentGuild?.id) return;

        saving = true;
        try {
            const promises = [];

            if (configForm.enabled !== repConfig?.enabled) {
                promises.push(api.setReputationEnabled($currentGuild.id, configForm.enabled));
            }
            if (configForm.defaultCooldownMinutes !== repConfig?.defaultCooldownMinutes) {
                promises.push(api.setReputationCooldown($currentGuild.id, configForm.defaultCooldownMinutes));
            }
            if (configForm.dailyLimit !== repConfig?.dailyLimit) {
                promises.push(api.setReputationDailyLimit($currentGuild.id, configForm.dailyLimit));
            }
            if (configForm.weeklyLimit !== repConfig?.weeklyLimit) {
                promises.push(api.setReputationWeeklyLimit($currentGuild.id, configForm.weeklyLimit));
            }
            if (configForm.minAccountAgeDays !== repConfig?.minAccountAgeDays) {
                promises.push(api.setReputationMinAccountAge($currentGuild.id, configForm.minAccountAgeDays));
            }
            if (configForm.minServerMembershipHours !== repConfig?.minServerMembershipHours) {
                promises.push(api.setReputationMinServerMembership($currentGuild.id, configForm.minServerMembershipHours));
            }
            if (configForm.minMessageCount !== repConfig?.minMessageCount) {
                promises.push(api.setReputationMinMessageCount($currentGuild.id, configForm.minMessageCount));
            }
            if (configForm.enableNegativeRep !== repConfig?.enableNegativeRep) {
                promises.push(api.setReputationNegativeRep($currentGuild.id, configForm.enableNegativeRep));
            }
            if (configForm.enableAnonymous !== repConfig?.enableAnonymous) {
                promises.push(api.setReputationAnonymousRep($currentGuild.id, configForm.enableAnonymous));
            }
            if (configForm.notificationChannel !== repConfig?.notificationChannel) {
                promises.push(api.setReputationNotificationChannel($currentGuild.id, configForm.notificationChannel));
            }

            await Promise.all(promises);
            showMessage("Reputation configuration saved successfully!", "success");
            await loadAllReputationData();
        } catch (err) {
            logger.error("Failed to save reputation config:", err);
            showMessage("Failed to save configuration", "error");
        } finally {
            saving = false;
        }
    }

    // Add role reward
    async function addRoleReward() {
        if (!$currentGuild?.id || !newRoleReward.roleId) return;

        saving = true;
        try {
            await api.addReputationRoleReward($currentGuild.id, {
                roleId: BigInt(newRoleReward.roleId),
                repRequired: newRoleReward.repRequired,
                removeOnDrop: newRoleReward.removeOnDrop,
                announceChannelId: newRoleReward.announceChannelId ? BigInt(newRoleReward.announceChannelId) : null,
                announceDM: newRoleReward.announceDM,
                xpReward: newRoleReward.xpReward
            });
            showMessage("Role reward added successfully!", "success");
            newRoleReward = {
                roleId: null,
                repRequired: 100,
                removeOnDrop: true,
                announceChannelId: null,
                announceDM: false,
                xpReward: null
            };
            await loadAllReputationData();
        } catch (err) {
            logger.error("Failed to add role reward:", err);
            showMessage("Failed to add role reward", "error");
        } finally {
            saving = false;
        }
    }

    // Remove role reward
    async function removeRoleReward(roleId: bigint) {
        if (!$currentGuild?.id) return;
        if (!confirm("Are you sure you want to remove this role reward?")) return;

        saving = true;
        try {
            await api.removeReputationRoleReward($currentGuild.id, roleId);
            showMessage("Role reward removed!", "success");
            await loadAllReputationData();
        } catch (err) {
            logger.error("Failed to remove role reward:", err);
            showMessage("Failed to remove role reward", "error");
        } finally {
            saving = false;
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

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleString();
    }

    function getRoleName(roleId: bigint): string {
        const role = guildRoles.find(r => r.id === roleId.toString());
        return role ? role.name : `Unknown Role`;
    }

    onMount(() => {
        loadAllReputationData();
    });

    // Tabs configuration
    const tabs = [
        { id: "config", label: "Configuration", icon: Settings },
        { id: "rewards", label: "Role Rewards", icon: Crown },
        { id: "leaderboard", label: "Leaderboard", icon: Trophy },
        { id: "stats", label: "Statistics", icon: BarChart3 }
    ];

    // Action buttons configuration
    let actionButtons = $derived([
        {
            label: "Refresh",
            icon: RefreshCw,
            action: loadAllReputationData,
            loading: loading
        }
    ]);

    // Handle tab change
    function handleTabChange(event: CustomEvent) {
        activeTab = event.detail.tabId;
    }
</script>

<DashboardPageLayout
        title="Reputation System"
        subtitle="Manage server reputation and rewards"
        icon={Star}
        {tabs}
        {activeTab}
        {actionButtons}
        guildName={$currentGuild?.name || "Dashboard"}
        on:tabChange={handleTabChange}
>

    <svelte:fragment slot="status-messages">
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
                <span style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
            </div>
        {/if}
    </svelte:fragment>

    {#if activeTab === 'config'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <div class="space-y-6 md:space-y-8">
                <!-- Basic Settings -->
                <div class="relative z-20 backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                        <Settings class="w-5 h-5" style="color: {$colorStore.primary}" />
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">System Configuration</h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <!-- Enabled Toggle -->
                        <div class="md:col-span-2 lg:col-span-3 flex items-center justify-between p-4 rounded-xl"
                             style="background: {$colorStore.primary}08;">
                            <div>
                                <div class="font-medium mb-1" style="color: {$colorStore.text}">
                                    Enable Reputation System
                                </div>
                                <div class="text-sm" style="color: {$colorStore.muted}">
                                    Allow users to give and receive reputation points
                                </div>
                            </div>
                            <button
                                    onclick={() => {
                                        configForm.enabled = !configForm.enabled;
                                        configForm = { ...configForm };
                                    }}
                                    class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                                    style="background: {configForm.enabled ? $colorStore.primary : '#64748b'};"
                            >
                                <span class="inline-block w-4 h-4 transform transition-transform bg-white rounded-full"
                                      style="transform: translateX({configForm.enabled ? '1.5rem' : '0.25rem'})"></span>
                            </button>
                        </div>

                        <!-- Cooldown -->
                        <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                <Clock class="w-4 h-4 inline mr-1" />
                                Cooldown (minutes)
                            </label>
                            <input
                                    type="number"
                                    min="1"
                                    bind:value={configForm.defaultCooldownMinutes}
                                    class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            />
                        </div>

                        <!-- Daily Limit -->
                        <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Daily Limit
                            </label>
                            <input
                                    type="number"
                                    min="1"
                                    bind:value={configForm.dailyLimit}
                                    class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            />
                        </div>

                        <!-- Weekly Limit -->
                        <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Weekly Limit (optional)
                            </label>
                            <input
                                    type="number"
                                    min="0"
                                    bind:value={configForm.weeklyLimit}
                                    placeholder="None"
                                    class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            />
                        </div>

                        <!-- Min Account Age -->
                        <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Min Account Age (days)
                            </label>
                            <input
                                    type="number"
                                    min="0"
                                    bind:value={configForm.minAccountAgeDays}
                                    class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            />
                        </div>

                        <!-- Min Server Membership -->
                        <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Min Server Time (hours)
                            </label>
                            <input
                                    type="number"
                                    min="0"
                                    bind:value={configForm.minServerMembershipHours}
                                    class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            />
                        </div>

                        <!-- Min Messages -->
                        <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Min Message Count
                            </label>
                            <input
                                    type="number"
                                    min="0"
                                    bind:value={configForm.minMessageCount}
                                    class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            />
                        </div>

                        <!-- Notification Channel -->
                        <div class="md:col-span-2 lg:col-span-3">
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                <Hash class="w-4 h-4 inline mr-1" />
                                Notification Channel (optional)
                            </label>
                            <DiscordSelector
                                    type="channel"
                                    options={guildChannels}
                                    selected={configForm.notificationChannel?.toString() || null}
                                    placeholder="No notifications"
                                    on:change={(e) => {
                                        configForm.notificationChannel = e.detail.selected ? BigInt(e.detail.selected) : null;
                                        configForm = { ...configForm };
                                    }}
                            />
                        </div>
                    </div>

                    <!-- Feature Toggles -->
                    <div class="mt-6 space-y-3">
                        <div class="flex items-center justify-between p-3 rounded-lg"
                             style="background: {$colorStore.primary}08;">
                            <div class="flex items-center gap-2">
                                <MessageSquare class="w-4 h-4" style="color: {$colorStore.primary}" />
                                <span style="color: {$colorStore.text}">Allow Negative Reputation</span>
                            </div>
                            <button
                                    onclick={() => {
                                        configForm.enableNegativeRep = !configForm.enableNegativeRep;
                                        configForm = { ...configForm };
                                    }}
                                    class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                                    style="background: {configForm.enableNegativeRep ? $colorStore.primary : '#64748b'};"
                            >
                                <span class="inline-block w-4 h-4 transform transition-transform bg-white rounded-full"
                                      style="transform: translateX({configForm.enableNegativeRep ? '1.5rem' : '0.25rem'})"></span>
                            </button>
                        </div>

                        <div class="flex items-center justify-between p-3 rounded-lg"
                             style="background: {$colorStore.primary}08;">
                            <div class="flex items-center gap-2">
                                <Eye class="w-4 h-4" style="color: {$colorStore.primary}" />
                                <span style="color: {$colorStore.text}">Enable Anonymous Reputation</span>
                            </div>
                            <button
                                    onclick={() => {
                                        configForm.enableAnonymous = !configForm.enableAnonymous;
                                        configForm = { ...configForm };
                                    }}
                                    class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                                    style="background: {configForm.enableAnonymous ? $colorStore.primary : '#64748b'};"
                            >
                                <span class="inline-block w-4 h-4 transform transition-transform bg-white rounded-full"
                                      style="transform: translateX({configForm.enableAnonymous ? '1.5rem' : '0.25rem'})"></span>
                            </button>
                        </div>
                    </div>

                    <button
                            class="mt-6 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-105 min-h-[52px]"
                            style="background: {$colorStore.primary}; color: white;"
                            onclick={saveConfig}
                            disabled={saving}
                    >
                        <Save class="w-5 h-5" />
                        {saving ? "Saving..." : "Save Configuration"}
                    </button>
                </div>
            </div>
        </div>

    {:else if activeTab === 'rewards'}
        <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
            <!-- Add Role Reward -->
            <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                    <Plus class="w-5 h-5" style="color: {$colorStore.primary}" />
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Add Role Reward</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <Crown class="w-4 h-4 inline mr-1" />
                            Role
                        </label>
                        <DiscordSelector
                                type="role"
                                options={guildRoles}
                                selected={newRoleReward.roleId}
                                placeholder="Select role"
                                on:change={(e) => {
                                    newRoleReward.roleId = e.detail.selected;
                                    newRoleReward = { ...newRoleReward };
                                }}
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            Reputation Required
                        </label>
                        <input
                                type="number"
                                min="1"
                                bind:value={newRoleReward.repRequired}
                                class="w-full p-3 rounded-xl border"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <Bell class="w-4 h-4 inline mr-1" />
                            Announce Channel (optional)
                        </label>
                        <DiscordSelector
                                type="channel"
                                options={guildChannels}
                                selected={newRoleReward.announceChannelId}
                                placeholder="No announcements"
                                on:change={(e) => {
                                    newRoleReward.announceChannelId = e.detail.selected;
                                    newRoleReward = { ...newRoleReward };
                                }}
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <Gift class="w-4 h-4 inline mr-1" />
                            Bonus XP (optional)
                        </label>
                        <input
                                type="number"
                                min="0"
                                bind:value={newRoleReward.xpReward}
                                placeholder="None"
                                class="w-full p-3 rounded-xl border"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        />
                    </div>
                </div>

                <div class="flex gap-4 mb-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input
                                type="checkbox"
                                bind:checked={newRoleReward.removeOnDrop}
                                class="rounded"
                                style="color: {$colorStore.primary}"
                        />
                        <span class="text-sm" style="color: {$colorStore.text}">Remove role if rep drops below threshold</span>
                    </label>

                    <label class="flex items-center gap-2 cursor-pointer">
                        <input
                                type="checkbox"
                                bind:checked={newRoleReward.announceDM}
                                class="rounded"
                                style="color: {$colorStore.primary}"
                        />
                        <span class="text-sm" style="color: {$colorStore.text}">Send DM notification</span>
                    </label>
                </div>

                <button
                        class="flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                        style="background: {$colorStore.primary}; color: white;"
                        onclick={addRoleReward}
                        disabled={saving || !newRoleReward.roleId}
                >
                    <Plus class="w-4 h-4" />
                    Add Role Reward
                </button>
            </div>

            <!-- Role Rewards List -->
            <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-10"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                    <Crown class="w-5 h-5" style="color: {$colorStore.primary}" />
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Role Rewards ({roleRewards.length})</h2>
                </div>

                <div class="space-y-3">
                    {#if roleRewards.length === 0}
                        <div class="text-center py-8">
                            <Crown class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No Role Rewards</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                Add role rewards to incentivize reputation growth.
                            </p>
                        </div>
                    {:else}
                        {#each roleRewards.sort((a, b) => a.repRequired - b.repRequired) as reward}
                            <div class="flex items-center justify-between p-4 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <Crown class="w-5 h-5" style="color: {$colorStore.primary}" />
                                    <div>
                                        <div class="font-semibold" style="color: {$colorStore.text}">
                                            {getRoleName(reward.roleId)}
                                        </div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">
                                            {reward.repRequired} reputation{reward.xpReward ? ` • +${reward.xpReward} XP bonus` : ''}
                                        </div>
                                    </div>
                                </div>
                                <button
                                        class="p-2 rounded-lg transition-all hover:scale-110"
                                        style="background: #ef444420; color: #ef4444;"
                                        onclick={() => removeRoleReward(reward.roleId)}
                                >
                                    <XCircle class="w-4 h-4" />
                                </button>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>

    {:else if activeTab === 'leaderboard'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                    <Trophy class="w-5 h-5" style="color: {$colorStore.primary}" />
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Reputation Leaderboard</h2>
                </div>

                <div class="space-y-3">
                    {#if leaderboard.length === 0}
                        <div class="text-center py-8">
                            <Trophy class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No Reputation Data</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                The leaderboard will appear once users start earning reputation.
                            </p>
                        </div>
                    {:else}
                        {#each leaderboard as entry}
                            <div class="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02]"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center justify-center w-8 h-8 rounded-full"
                                     style="background: {entry.rank <= 3 ? $colorStore.accent : $colorStore.primary}20; color: {entry.rank <= 3 ? $colorStore.accent : $colorStore.primary};">
                                    {entry.rank}
                                </div>
                                <div class="flex-1">
                                    <div class="font-semibold" style="color: {$colorStore.text}">
                                        {entry.username}
                                    </div>
                                    <div class="text-sm" style="color: {$colorStore.muted}">
                                        User ID: {entry.userId.toString()}
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="font-bold text-lg" style="color: {$colorStore.primary}">
                                        {entry.reputation}
                                    </div>
                                    <div class="text-xs" style="color: {$colorStore.muted}">
                                        reputation
                                    </div>
                                </div>
                                {#if entry.rank === 1}
                                    <Trophy class="w-6 h-6" style="color: #fbbf24" />
                                {:else if entry.rank === 2}
                                    <Award class="w-6 h-6" style="color: #94a3b8" />
                                {:else if entry.rank === 3}
                                    <Award class="w-6 h-6" style="color: #c2410c" />
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>

    {:else if activeTab === 'stats'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            {#if stats}
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <StatCard
                            icon={Users}
                            label="Total Users"
                            value={stats.totalUsers}
                            subtitle="with reputation"
                            iconColor="primary"
                            animationDelay={0}
                    />

                    <StatCard
                            icon={Star}
                            label="Total Rep Given"
                            value={stats.totalRepGiven}
                            subtitle="all time"
                            iconColor="secondary"
                            animationDelay={100}
                    />

                    <StatCard
                            icon={TrendingUp}
                            label="Transactions"
                            value={stats.totalTransactions}
                            subtitle="reputation exchanges"
                            iconColor="accent"
                            animationDelay={200}
                    />

                    <StatCard
                            icon={Award}
                            label="Average Rep"
                            value={Math.round(stats.averageRepPerUser)}
                            subtitle="per user"
                            iconColor="primary"
                            animationDelay={300}
                    />
                </div>
            {:else}
                <div class="text-center py-12">
                    <BarChart3 class="w-16 h-16 mx-auto mb-4" style="color: {$colorStore.primary}50" />
                    <h3 class="text-xl font-semibold mb-2" style="color: {$colorStore.text}">No Statistics Available</h3>
                    <p style="color: {$colorStore.muted}">
                        Reputation statistics will appear here once the system is active.
                    </p>
                </div>
            {/if}
        </div>
    {/if}
</DashboardPageLayout>
