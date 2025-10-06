<!-- routes/dashboard/votes/+page.svelte -->
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
        CheckCircle,
        Clock,
        Crown,
        Hash,
        Key,
        MessageSquare,
        Plus,
        RefreshCw,
        Save,
        Settings,
        TrendingUp,
        Trophy,
        Users,
        Vote,
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
    let voteRoles: Array<{id: number; guildId: bigint; roleId: bigint; timer: number; roleName?: string}> = $state([]);
    let voteMessage: string = $state("");
    let votePassword: string = $state("");
    let voteChannel: bigint | null = $state(null);
    let votes: Array<{id: number; userId: bigint; dateAdded: string}> = $state([]);
    let leaderboard: Array<{userId: bigint; voteCount: number}> = $state([]);
    let guildChannels: Array<{ id: string; name: string; }> = $state([]);
    let guildRoles: Array<{ id: string; name: string; color: number }> = $state([]);

    // Form data
    let configForm = $state({
        message: "",
        password: "",
        channelId: null as bigint | null
    });
    let newVoteRole = $state({
        roleId: null as string | null,
        timer: 0
    });

    // UI state
    let activeTab = $state("config");
    let leaderboardLimit = $state(10);
    let showPasswordField = $state(false);

    // Load all vote data
    async function loadAllVoteData() {
        if (!$currentGuild?.id) return;

        loading = true;
        try {
            const [
                rolesData,
                messageData,
                passwordData,
                channelData,
                votesData,
                channelsData,
                rolesListData,
                leaderboardData
            ] = await Promise.all([
                api.getVoteRoles($currentGuild.id).catch(() => []),
                api.getVoteMessage($currentGuild.id).catch(() => ""),
                api.getVotePassword($currentGuild.id).catch(() => ""),
                api.getVoteChannel($currentGuild.id).catch(() => null),
                api.getVotes($currentGuild.id).catch(() => []),
                api.getGuildTextChannels($currentGuild.id).catch(() => []),
                api.getGuildRoles($currentGuild.id).catch(() => []),
                api.getVoteLeaderboard($currentGuild.id, leaderboardLimit).catch(() => [])
            ]);

            voteRoles = rolesData;
            voteMessage = messageData;
            votePassword = passwordData;
            voteChannel = channelData;
            votes = votesData;
            leaderboard = leaderboardData;

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

            configForm = {
                message: voteMessage,
                password: votePassword,
                channelId: voteChannel
            };
        } catch (err) {
            logger.error("Failed to load vote data:", err);
            showMessage("Failed to load vote data", "error");
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

            if (configForm.message !== voteMessage) {
                promises.push(api.setVoteMessage($currentGuild.id, configForm.message));
            }

            if (configForm.password !== votePassword) {
                promises.push(api.setVotePassword($currentGuild.id, configForm.password));
            }

            if (configForm.channelId !== voteChannel) {
                promises.push(api.setVoteChannel($currentGuild.id, configForm.channelId || BigInt(0)));
            }

            await Promise.all(promises);
            showMessage("Vote configuration saved successfully!", "success");
            await loadAllVoteData();
        } catch (err) {
            logger.error("Failed to save vote config:", err);
            showMessage("Failed to save configuration", "error");
        } finally {
            saving = false;
        }
    }

    // Add vote role
    async function addVoteRole() {
        if (!$currentGuild?.id || !newVoteRole.roleId) return;

        saving = true;
        try {
            await api.addVoteRole($currentGuild.id, BigInt(newVoteRole.roleId), newVoteRole.timer);
            showMessage("Vote role added successfully!", "success");
            newVoteRole = { roleId: null, timer: 0 };
            await loadAllVoteData();
        } catch (err) {
            logger.error("Failed to add vote role:", err);
            showMessage("Failed to add vote role", "error");
        } finally {
            saving = false;
        }
    }

    // Remove vote role
    async function removeVoteRole(roleId: bigint) {
        if (!$currentGuild?.id) return;

        saving = true;
        try {
            await api.removeVoteRole($currentGuild.id, roleId);
            showMessage("Vote role removed successfully!", "success");
            await loadAllVoteData();
        } catch (err) {
            logger.error("Failed to remove vote role:", err);
            showMessage("Failed to remove vote role", "error");
        } finally {
            saving = false;
        }
    }

    // Clear all vote roles
    async function clearAllVoteRoles() {
        if (!$currentGuild?.id) return;
        if (!confirm("Are you sure you want to remove all vote roles?")) return;

        saving = true;
        try {
            await api.clearVoteRoles($currentGuild.id);
            showMessage("All vote roles cleared!", "success");
            await loadAllVoteData();
        } catch (err) {
            logger.error("Failed to clear vote roles:", err);
            showMessage("Failed to clear vote roles", "error");
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

    function formatDuration(seconds: number): string {
        if (seconds === 0) return "Permanent";
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    }

    function getRoleName(roleId: bigint): string {
        const role = guildRoles.find(r => r.id === roleId.toString());
        return role ? role.name : `Unknown Role`;
    }

    onMount(() => {
        loadAllVoteData();
    });

    // Tabs configuration
    const tabs = [
        { id: "config", label: "Configuration", icon: Settings },
        { id: "roles", label: "Vote Roles", icon: Crown },
        { id: "stats", label: "Statistics", icon: BarChart3 }
    ];

    // Action buttons configuration
    let actionButtons = $derived([
        {
            label: "Refresh",
            icon: RefreshCw,
            action: loadAllVoteData,
            loading: loading
        }
    ]);

    // Handle tab change
    function handleTabChange(event: CustomEvent) {
        activeTab = event.detail.tabId;
    }
</script>

<DashboardPageLayout
        title="Vote Management"
        subtitle="Configure voting rewards and tracking"
        icon={Vote}
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
    </svelte:fragment>

    <!-- Tab Content -->
    {#if activeTab === 'config'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <div class="space-y-6 md:space-y-8">
                <!-- Basic Settings -->
                <div class="relative z-20 backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                        <Settings class="w-5 h-5" style="color: {$colorStore.primary}" />
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Basic Settings</h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <!-- Channel Selection -->
                        <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                <Hash class="w-4 h-4 inline mr-1" />
                                Vote Announcement Channel
                            </label>
                            <div class="min-h-[44px]">
                                <DiscordSelector
                                        type="channel"
                                        options={guildChannels}
                                        selected={configForm.channelId?.toString() || null}
                                        placeholder="No channel selected"
                                        on:change={(e) => {
                                            configForm.channelId = e.detail.selected ? BigInt(e.detail.selected) : null;
                                            configForm = { ...configForm };
                                        }}
                                />
                            </div>
                        </div>

                        <!-- Password -->
                        <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                <Key class="w-4 h-4 inline mr-1" />
                                API Password (for webhooks)
                            </label>
                            <div class="relative">
                                <input
                                        type={showPasswordField ? "text" : "password"}
                                        bind:value={configForm.password}
                                        placeholder="Enter API password"
                                        class="w-full p-3 pr-12 rounded-xl border transition-all min-h-[44px] text-base"
                                        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                />
                                <button
                                        type="button"
                                        class="absolute right-3 top-1/2 -translate-y-1/2"
                                        onclick={() => showPasswordField = !showPasswordField}
                                        style="color: {$colorStore.muted}"
                                >
                                    {showPasswordField ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Custom Message -->
                <div class="relative z-10 backdrop-blur-xs rounded-2xl p-6 md:p-8 shadow-2xl transition-all border"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}15);
                    border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                        <MessageSquare class="w-5 h-5" style="color: {$colorStore.primary}" />
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Vote Message</h2>
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            Custom Vote Announcement
                        </label>
                        <textarea
                                bind:value={configForm.message}
                                placeholder="🗳️ Thanks %user.mention% for voting! You've received your rewards!"
                                rows="3"
                                class="w-full p-3 rounded-xl border transition-all resize-none min-h-[100px] text-base"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        ></textarea>
                        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                            Available placeholders: %user.mention%, %user.name%, %user.id%, %server.name%. Leave empty for default message.
                        </p>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4">
                    <button
                            class="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-105 min-h-[52px]"
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

    {:else if activeTab === 'roles'}
        <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
            <!-- Add New Vote Role -->
            <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                    <Plus class="w-5 h-5" style="color: {$colorStore.primary}" />
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Add Vote Role</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <Crown class="w-4 h-4 inline mr-1" />
                            Role to Grant
                        </label>
                        <DiscordSelector
                                type="role"
                                options={guildRoles}
                                selected={newVoteRole.roleId}
                                placeholder="Select role"
                                on:change={(e) => {
                                    newVoteRole.roleId = e.detail.selected;
                                    newVoteRole = { ...newVoteRole };
                                }}
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <Clock class="w-4 h-4 inline mr-1" />
                            Duration (seconds, 0 for permanent)
                        </label>
                        <input
                                type="number"
                                min="0"
                                bind:value={newVoteRole.timer}
                                class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        />
                    </div>
                </div>

                <button
                        class="flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                        style="background: {$colorStore.primary}; color: white;"
                        onclick={addVoteRole}
                        disabled={saving || !newVoteRole.roleId}
                >
                    <Plus class="w-4 h-4" />
                    Add Vote Role
                </button>
            </div>

            <!-- Vote Roles List -->
            <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-10"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <Crown class="w-5 h-5" style="color: {$colorStore.primary}" />
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Vote Roles ({voteRoles.length})</h2>
                    </div>
                    {#if voteRoles.length > 0}
                        <button
                                class="px-4 py-2 rounded-lg text-sm transition-all hover:scale-105"
                                style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                                onclick={clearAllVoteRoles}
                        >
                            Clear All
                        </button>
                    {/if}
                </div>

                <div class="space-y-3">
                    {#if voteRoles.length === 0}
                        <div class="text-center py-8">
                            <Crown class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No Vote Roles</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                Add roles to grant users when they vote for your server.
                            </p>
                        </div>
                    {:else}
                        {#each voteRoles as voteRole}
                            <div class="flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.02]"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <Crown class="w-5 h-5" style="color: {$colorStore.primary}" />
                                    <div>
                                        <div class="font-semibold" style="color: {$colorStore.text}">
                                            {getRoleName(voteRole.roleId)}
                                        </div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">
                                            Duration: {formatDuration(voteRole.timer)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                        class="p-2 rounded-lg transition-all hover:scale-110"
                                        style="background: #ef444420; color: #ef4444;"
                                        onclick={() => removeVoteRole(voteRole.roleId)}
                                >
                                    <XCircle class="w-4 h-4" />
                                </button>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>

    {:else if activeTab === 'stats'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                <StatCard
                        icon={Vote}
                        label="Total Votes"
                        value={votes.length}
                        subtitle="all time"
                        iconColor="primary"
                        animationDelay={0}
                />

                <StatCard
                        icon={Crown}
                        label="Vote Roles"
                        value={voteRoles.length}
                        subtitle="configured rewards"
                        iconColor="secondary"
                        animationDelay={100}
                />

                <StatCard
                        icon={Trophy}
                        label="Top Voter"
                        value={leaderboard[0]?.voteCount || 0}
                        subtitle={leaderboard.length > 0 ? "votes" : "no data"}
                        iconColor="accent"
                        animationDelay={200}
                />
            </div>

            <!-- Leaderboard -->
            <div class="mt-6 backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                    <TrendingUp class="w-5 h-5" style="color: {$colorStore.primary}" />
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Vote Leaderboard</h2>
                </div>

                <div class="space-y-3">
                    {#if leaderboard.length === 0}
                        <div class="text-center py-8">
                            <Trophy class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No Votes Yet</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                Vote statistics will appear here once users start voting.
                            </p>
                        </div>
                    {:else}
                        {#each leaderboard as entry, index}
                            <div class="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02]"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center justify-center w-8 h-8 rounded-full"
                                     style="background: {index < 3 ? $colorStore.accent : $colorStore.primary}20; color: {index < 3 ? $colorStore.accent : $colorStore.primary};">
                                    {index + 1}
                                </div>
                                <div class="flex-1">
                                    <div class="font-semibold" style="color: {$colorStore.text}">
                                        User {entry.userId.toString()}
                                    </div>
                                    <div class="text-sm" style="color: {$colorStore.muted}">
                                        {entry.voteCount} vote{entry.voteCount !== 1 ? 's' : ''}
                                    </div>
                                </div>
                                {#if index === 0}
                                    <Trophy class="w-6 h-6" style="color: #fbbf24" />
                                {:else if index === 1}
                                    <Award class="w-6 h-6" style="color: #94a3b8" />
                                {:else if index === 2}
                                    <Award class="w-6 h-6" style="color: #c2410c" />
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</DashboardPageLayout>
