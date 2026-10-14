<!-- routes/dashboard/reputation/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { clientApi, reputationApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";

  import StatCard from "$lib/components/monitoring/StatCard.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";

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
              reputationApi.getRepConfig($currentGuild.id).catch(() => null),
              reputationApi.getRoleRewards($currentGuild.id).catch(() => []),
              reputationApi.getLeaderboard($currentGuild.id, leaderboardPage, leaderboardPageSize).catch(() => []),
              reputationApi.getReputationStats($currentGuild.id).catch(() => null),
              clientApi.getTextChannels($currentGuild.id).catch(() => []),
              clientApi.getRoles($currentGuild.id).catch(() => [])
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
                saved = { ...configForm };
            }
        } catch (err) {
            logger.error("Failed to load reputation data:", err);
            showMessage(m.reputation.errorLoad(), "error");
        } finally {
            loading = false;
        }
    }

    // Auto-save: each setting saves through its own setter as soon as it changes
    type ConfigForm = typeof configForm;
    type ToggleKey = "enabled" | "enableNegativeRep" | "enableAnonymous";
    type NumberKey = "defaultCooldownMinutes" | "dailyLimit" | "minAccountAgeDays" | "minServerMembershipHours" | "minMessageCount";

    /** Last values the server confirmed, so a failed save can be rolled back. */
    let saved: ConfigForm = {
        enabled: true,
        defaultCooldownMinutes: 60,
        dailyLimit: 10,
        weeklyLimit: null,
        minAccountAgeDays: 7,
        minServerMembershipHours: 24,
        minMessageCount: 10,
        enableNegativeRep: false,
        enableAnonymous: false,
        notificationChannel: null
    };

    const toggleSetters: Record<ToggleKey, (guildId: bigint, value: boolean) => Promise<unknown>> = {
        enabled: (guildId, value) => reputationApi.setEnabled(guildId, value),
        enableNegativeRep: (guildId, value) => reputationApi.setNegativeReputation(guildId, value),
        enableAnonymous: (guildId, value) => reputationApi.setAnonymousReputation(guildId, value)
    };

    const numberSetters: Record<NumberKey, { min: number; set: (guildId: bigint, value: number) => Promise<unknown> }> = {
        defaultCooldownMinutes: { min: 1, set: (guildId, value) => reputationApi.setDefaultCooldown(guildId, value) },
        dailyLimit: { min: 1, set: (guildId, value) => reputationApi.setDailyLimit(guildId, value) },
        minAccountAgeDays: { min: 0, set: (guildId, value) => reputationApi.setMinAccountAge(guildId, value) },
        minServerMembershipHours: { min: 0, set: (guildId, value) => reputationApi.setMinServerMembership(guildId, value) },
        minMessageCount: { min: 0, set: (guildId, value) => reputationApi.setMinMessageCount(guildId, value) }
    };

    const autoSave = createAutoSave({
        onError: () => showMessage(m.reputation.errorSave(), "error")
    });

    function isValidCount(value: unknown, min: number): value is number {
        return typeof value === "number" && Number.isInteger(value) && value >= min;
    }

    function toggleSetting(key: ToggleKey) {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const value = !configForm[key];
        const previous = saved[key];
        configForm[key] = value;
        configForm = { ...configForm };
        autoSave.now(key, async () => {
            try {
                await toggleSetters[key](guildId, value);
                if ($currentGuild?.id === guildId) saved[key] = value;
            } catch (err) {
                if ($currentGuild?.id === guildId) {
                    configForm[key] = previous;
                    configForm = { ...configForm };
                }
                throw err;
            }
        });
    }

    function saveNumber(key: NumberKey) {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const value = configForm[key];
        const { min, set } = numberSetters[key];
        if (!isValidCount(value, min)) {
            autoSave.cancel(key);
            return;
        }
        autoSave.schedule(key, async () => {
            try {
                await set(guildId, value);
                if ($currentGuild?.id === guildId) saved[key] = value;
            } catch (err) {
                // Only undo if the field still shows the value that failed, so typing isn't interrupted
                if ($currentGuild?.id === guildId && configForm[key] === value) configForm[key] = saved[key];
                throw err;
            }
        });
    }

    /** Saves on blur, and puts back the last saved value if the field was left invalid. */
    function blurNumber(key: NumberKey) {
        if (!isValidCount(configForm[key], numberSetters[key].min)) configForm[key] = saved[key];
        autoSave.flush(key);
    }

    function saveWeeklyLimit() {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const raw = configForm.weeklyLimit as number | null | undefined;
        // Empty means "no weekly limit"
        const value = raw === null || raw === undefined ? null : raw;
        if (value !== null && !isValidCount(value, 0)) {
            autoSave.cancel("weeklyLimit");
            return;
        }
        autoSave.schedule("weeklyLimit", async () => {
            try {
                await reputationApi.setWeeklyLimit(guildId, value);
                if ($currentGuild?.id === guildId) saved.weeklyLimit = value;
            } catch (err) {
                if ($currentGuild?.id === guildId && configForm.weeklyLimit === value) configForm.weeklyLimit = saved.weeklyLimit;
                throw err;
            }
        });
    }

    function blurWeeklyLimit() {
        const value = configForm.weeklyLimit as number | null | undefined;
        if (value === undefined) configForm.weeklyLimit = null;
        else if (value !== null && !isValidCount(value, 0)) configForm.weeklyLimit = saved.weeklyLimit;
        autoSave.flush("weeklyLimit");
    }

    function saveNotificationChannel() {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const value = configForm.notificationChannel;
        const previous = saved.notificationChannel;
        autoSave.now("notificationChannel", async () => {
            try {
                await reputationApi.setNotificationChannel(guildId, value);
                if ($currentGuild?.id === guildId) saved.notificationChannel = value;
            } catch (err) {
                if ($currentGuild?.id === guildId) {
                    configForm.notificationChannel = previous;
                    configForm = { ...configForm };
                }
                throw err;
            }
        });
    }

    // Add role reward
    async function addRoleReward() {
        if (!$currentGuild?.id || !newRoleReward.roleId) return;

        saving = true;
        try {
          await reputationApi.addOrUpdateRoleReward($currentGuild.id, {
                roleId: BigInt(newRoleReward.roleId),
                repRequired: newRoleReward.repRequired,
                removeOnDrop: newRoleReward.removeOnDrop,
                announceChannelId: newRoleReward.announceChannelId ? BigInt(newRoleReward.announceChannelId) : null,
                announceDM: newRoleReward.announceDM,
            xpReward: newRoleReward.xpReward || 0
            });
            showMessage(m.reputation.notifyRewardAdded(), "success");
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
            showMessage(m.common.failedToAddRoleReward(), "error");
        } finally {
            saving = false;
        }
    }

    // Remove role reward
    async function removeRoleReward(roleId: bigint) {
        if (!$currentGuild?.id) return;
        if (!(await requestConfirmation({ message: m.reputation.confirmRemoveReward(), confirmText: m.common.remove() }))) return;

        saving = true;
        try {
          await reputationApi.removeRoleReward($currentGuild.id, roleId);
            showMessage(m.reputation.notifyRewardRemoved(), "success");
            await loadAllReputationData();
        } catch (err) {
            logger.error("Failed to remove role reward:", err);
            showMessage(m.common.failedToRemoveRoleReward(), "error");
        } finally {
            saving = false;
        }
    }

    // Utility functions
    /** Reputation history modal state */
    let historyTarget: any = $state(null);
    let history: any[] = $state([]);
    let historyPage = $state(1);
    const historyPageSize = 20;
    let historyLoading = $state(false);

    async function loadHistory(page: number) {
        if (!$currentGuild?.id || !historyTarget || page < 1) return;
        historyLoading = true;
        try {
            history = await reputationApi.getReputationHistory($currentGuild.id, BigInt(historyTarget.userId), page, historyPageSize);
            historyPage = page;
        } catch (err) {
            logger.error("Failed to load reputation history:", err);
            showMessage(m.reputation.errorLoadHistory(), "error");
        } finally {
            historyLoading = false;
        }
    }

    function openHistory(entry: any) {
        historyTarget = entry;
        history = [];
        loadHistory(1);
    }

    function closeHistory() {
        historyTarget = null;
        history = [];
    }

    function showMessage(text: string, type: "success" | "error" | "info") {
        message = text;
        messageType = type;
        setTimeout(() => {
            message = "";
        }, 5000);
    }

    function getRoleName(roleId: bigint): string {
        const role = guildRoles.find(r => r.id === roleId.toString());
        return role ? role.name : m.common.unknownRole();
    }

    // DiscordSelector handlers
    function handleNotificationChannelChange(detail: any) {
      configForm.notificationChannel = detail.selected ? BigInt(detail.selected) : null;
      configForm = { ...configForm };
      saveNotificationChannel();
    }

    function handleRoleChange(detail: any) {
      newRoleReward.roleId = detail.selected;
      newRoleReward = { ...newRoleReward };
    }

    function handleAnnounceChannelChange(detail: any) {
      newRoleReward.announceChannelId = detail.selected;
      newRoleReward = { ...newRoleReward };
    }

    onMount(() => {
        loadAllReputationData();
    });

    // Tabs configuration
    const tabs = $derived([
      { id: "config", label: m.common.configuration(), icon: "fa-gear" },
      { id: "rewards", label: m.features.wizardXpStepRewardsTitle(), icon: "fa-star" },
      { id: "leaderboard", label: m.common.leaderboard(), icon: "fa-star" },
      { id: "stats", label: m.common.statistics(), icon: "fa-chart-bar" }
    ]);

    // Action buttons configuration
    let actionButtons = $derived([
        {
            label: m.common.refresh(),
          icon: "fa-arrows-rotate",
            action: async () => {
                await autoSave.flush();
                await loadAllReputationData();
            },
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
        <i class="fa-utility-duo fa-regular fa-bell"
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
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-star"
  statusMessages={statusMessages}
  subtitle={m.reputation.pageSubtitle()}
  {tabs}
  title={m.reputation.pageTitle()}
>

    {#if activeTab === 'config'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <div class="space-y-6 md:space-y-8">
                <!-- Basic Settings -->
              <div class="relative z-20  rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                      <i class="fa-utility-duo fa-regular fa-gear"
                         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.reputation.configHeading()}</h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <!-- Enabled Toggle -->
                        <div class="md:col-span-2 lg:col-span-3 flex items-center justify-between p-4 rounded-xl"
                             style="background: {$colorStore.primary}08;">
                            <div>
                                <div class="font-medium mb-1" style="color: {$colorStore.text}">
                                    {m.reputation.enableAria()}
                                </div>
                                <div class="text-sm" style="color: {$colorStore.muted}">
                                    {m.reputation.enableHint()}
                                </div>
                            </div>
                          <button aria-label={m.reputation.enableAria()}
                                    role="switch"
                                    aria-checked={configForm.enabled}
                                    onclick={() => toggleSetting("enabled")}
                                    class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                                  style="background: {configForm.enabled ? $colorStore.primary : $colorStore.muted};"
                            >
                                <span class="inline-block w-4 h-4 transform transition-transform bg-white rounded-full"
                                      style="transform: translateX({configForm.enabled ? '1.5rem' : '0.25rem'})"></span>
                            </button>
                        </div>

                        <!-- Cooldown -->
                        <div>
                          <label for="input-3278" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text}">
                            <i class="fa-solid fa-clock" style="font-size: 16px;"></i>
                                {m.common.cooldownMinutes()}
                            </label>
                          <input id="input-3278"
                                    type="number"
                                    min="1"
                                    bind:value={configForm.defaultCooldownMinutes}
                                    oninput={() => saveNumber("defaultCooldownMinutes")}
                                    onblur={() => blurNumber("defaultCooldownMinutes")}
                                    class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          >
                        </div>

                        <!-- Daily Limit -->
                        <div>
                          <label for="input-1523" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text}">
                                {m.common.dailyLimit()}
                            </label>
                          <input id="input-1523"
                                    type="number"
                                    min="1"
                                    bind:value={configForm.dailyLimit}
                                    oninput={() => saveNumber("dailyLimit")}
                                    onblur={() => blurNumber("dailyLimit")}
                                    class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          >
                        </div>

                        <!-- Weekly Limit -->
                        <div>
                          <label for="input-4559" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text}">
                                {m.reputation.weeklyLimitLabel()}
                            </label>
                          <input id="input-4559"
                                    type="number"
                                    min="0"
                                    bind:value={configForm.weeklyLimit}
                                    oninput={saveWeeklyLimit}
                                    onblur={blurWeeklyLimit}
                                    placeholder={m.common.none()}
                                    class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          >
                        </div>

                        <!-- Min Account Age -->
                        <div>
                          <label for="input-3155" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text}">
                                {m.common.minAccountAgeDays()}
                            </label>
                          <input id="input-3155"
                                    type="number"
                                    min="0"
                                    bind:value={configForm.minAccountAgeDays}
                                    oninput={() => saveNumber("minAccountAgeDays")}
                                    onblur={() => blurNumber("minAccountAgeDays")}
                                    class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          >
                        </div>

                        <!-- Min Server Membership -->
                        <div>
                          <label for="input-4752" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text}">
                                {m.reputation.minServerTimeLabel()}
                            </label>
                          <input id="input-4752"
                                    type="number"
                                    min="0"
                                    bind:value={configForm.minServerMembershipHours}
                                    oninput={() => saveNumber("minServerMembershipHours")}
                                    onblur={() => blurNumber("minServerMembershipHours")}
                                    class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          >
                        </div>

                        <!-- Min Messages -->
                        <div>
                          <label for="input-3616" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text}">
                                {m.reputation.minMessagesLabel()}
                            </label>
                          <input id="input-3616"
                                    type="number"
                                    min="0"
                                    bind:value={configForm.minMessageCount}
                                    oninput={() => saveNumber("minMessageCount")}
                                    onblur={() => blurNumber("minMessageCount")}
                                    class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          >
                        </div>

                        <!-- Notification Channel -->
                        <div class="md:col-span-2 lg:col-span-3">
                            <span id="notification-channel-optional-label" class="block text-sm font-medium mb-2"
                                  style="color: {$colorStore.text}">
                                <i class="fa-solid fa-hashtag" style="font-size: 16px;"></i>
                                {m.reputation.notificationChannelLabel()}
                            </span>
                            <DiscordSelector
                                    type="channel"
                                    options={guildChannels}
                                    selected={configForm.notificationChannel?.toString() || null}
                                    placeholder={m.reputation.notificationChannelPlaceholder()}
                                    onchange={handleNotificationChannelChange} />
                        </div>
                    </div>

                    <!-- Feature Toggles -->
                    <div class="mt-6 space-y-3">
                        <div class="flex items-center justify-between p-3 rounded-lg"
                             style="background: {$colorStore.primary}08;">
                            <div class="flex items-center gap-2">
                              <i class="fa-solid fa-message" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                                <span style="color: {$colorStore.text}">{m.common.allowNegativeReputation()}</span>
                            </div>
                          <button aria-label={m.common.allowNegativeReputation()}
                                    role="switch"
                                    aria-checked={configForm.enableNegativeRep}
                                    onclick={() => toggleSetting("enableNegativeRep")}
                                    class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                                  style="background: {configForm.enableNegativeRep ? $colorStore.primary : $colorStore.muted};"
                            >
                                <span class="inline-block w-4 h-4 transform transition-transform bg-white rounded-full"
                                      style="transform: translateX({configForm.enableNegativeRep ? '1.5rem' : '0.25rem'})"></span>
                            </button>
                        </div>

                        <div class="flex items-center justify-between p-3 rounded-lg"
                             style="background: {$colorStore.primary}08;">
                            <div class="flex items-center gap-2">
                              <i class="fa-solid fa-eye" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                                <span style="color: {$colorStore.text}">{m.reputation.anonymousAria()}</span>
                            </div>
                          <button aria-label={m.reputation.anonymousAria()}
                                    role="switch"
                                    aria-checked={configForm.enableAnonymous}
                                    onclick={() => toggleSetting("enableAnonymous")}
                                    class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                                  style="background: {configForm.enableAnonymous ? $colorStore.primary : $colorStore.muted};"
                            >
                                <span class="inline-block w-4 h-4 transform transition-transform bg-white rounded-full"
                                      style="transform: translateX({configForm.enableAnonymous ? '1.5rem' : '0.25rem'})"></span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>

    {:else if activeTab === 'rewards'}
        <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
            <!-- Add Role Reward -->
          <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                  <i class="fa-solid fa-plus" style="color: {$colorStore.primary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.common.addRoleReward()}</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <span id="role-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-crown" style="font-size: 16px;"></i>
                            {m.common.role()}
                        </span>
                        <DiscordSelector
                                type="role"
                                options={guildRoles}
                                selected={newRoleReward.roleId}
                                placeholder={m.common.selectRolePlaceholder()}
                                onchange={handleRoleChange} />
                    </div>

                    <div>
                      <label for="input-4273" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            {m.reputation.repRequiredLabel()}
                        </label>
                      <input id="input-4273"
                                type="number"
                                min="1"
                                bind:value={newRoleReward.repRequired}
                                class="w-full p-3 rounded-xl border"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      >
                    </div>

                    <div>
                        <span id="announce-channel-optional-label" class="block text-sm font-medium mb-2"
                              style="color: {$colorStore.text}">
                            <i class="fa-solid fa-bell" style="font-size: 16px;"></i>
                            {m.reputation.announceChannelLabel()}
                        </span>
                        <DiscordSelector
                                type="channel"
                                options={guildChannels}
                                selected={newRoleReward.announceChannelId}
                                placeholder={m.common.noAnnouncements()}
                                onchange={handleAnnounceChannelChange} />
                    </div>

                    <div>
                      <label for="input-2975" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                        <i class="fa-solid fa-gift" style="font-size: 16px;"></i>
                            {m.reputation.bonusXpLabel()}
                        </label>
                      <input id="input-2975"
                                type="number"
                                min="0"
                                bind:value={newRoleReward.xpReward}
                                placeholder={m.common.none()}
                                class="w-full p-3 rounded-xl border"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      >
                    </div>
                </div>

                <div class="flex gap-4 mb-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input
                                type="checkbox"
                                bind:checked={newRoleReward.removeOnDrop}
                                class="rounded"
                                style="color: {$colorStore.primary}"
                        >
                        <span class="text-sm" style="color: {$colorStore.text}">{m.reputation.removeOnDropLabel()}</span>
                    </label>

                    <label class="flex items-center gap-2 cursor-pointer">
                        <input
                                type="checkbox"
                                bind:checked={newRoleReward.announceDM}
                                class="rounded"
                                style="color: {$colorStore.primary}"
                        >
                        <span class="text-sm" style="color: {$colorStore.text}">{m.reputation.sendDmLabel()}</span>
                    </label>
                </div>

                <button
                  aria-label={m.common.addRoleReward()}
                  aria-busy={saving}
                  class="flex items-center justify-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                        onclick={addRoleReward}
                        disabled={saving || !newRoleReward.roleId}
                >
                  <i class="fa-solid fa-plus {saving ? 'fa-spin' : ''}" style="font-size: 18px;"></i>
                  {saving ? m.common.adding() : m.common.addRoleReward()}
                </button>
            </div>

            <!-- Role Rewards List -->
          <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-10"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                  <i class="fa-solid fa-crown" style="color: {$colorStore.primary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.reputation.rewardsHeading({ count: roleRewards.length })}</h2>
                </div>

                <div class="space-y-3">
                    {#if roleRewards.length === 0}
                        <div class="text-center py-8">
                          <i class="fa-utility-duo fa-regular fa-star"
                             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">{m.reputation.rewardsEmptyTitle()}</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                {m.reputation.rewardsEmptyHint()}
                            </p>
                        </div>
                    {:else}
                        {#each roleRewards.sort((a, b) => a.repRequired - b.repRequired) as reward}
                            <div class="flex items-center justify-between p-4 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                  <i class="fa-solid fa-crown"
                                     style="color: {$colorStore.primary}; font-size: 20px;"></i>
                                    <div>
                                        <div class="font-semibold" style="color: {$colorStore.text}">
                                            {getRoleName(reward.roleId)}
                                        </div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">
                                            {reward.xpReward ? m.reputation.rewardRequirementXp({ rep: reward.repRequired, xp: reward.xpReward }) : m.reputation.rewardRequirement({ rep: reward.repRequired })}
                                        </div>
                                    </div>
                                </div>
                              <button aria-label={m.common.delete()}
                                        class="p-2 rounded-lg transition-all hover:scale-110"
                                      style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                                        onclick={() => removeRoleReward(reward.roleId)}
                                >
                                </button>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>

    {:else if activeTab === 'leaderboard'}
        <div class="w-full" in:fade={{ duration: 200 }}>
          <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                  <i class="fa-utility-duo fa-regular fa-star"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.reputation.leaderboardHeading()}</h2>
                </div>

                <div class="space-y-3">
                    {#if leaderboard.length === 0}
                        <div class="text-center py-8">
                          <i class="fa-utility-duo fa-regular fa-star"
                             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">{m.reputation.leaderboardEmptyTitle()}</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                {m.reputation.leaderboardEmptyHint()}
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
                                        {m.common.userIdLabel({ id: entry.userId.toString() })}
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="font-bold text-lg" style="color: {$colorStore.primary}">
                                        {entry.reputation}
                                    </div>
                                    <div class="text-xs" style="color: {$colorStore.muted}">
                                        {m.reputation.reputationUnit()}
                                    </div>
                                </div>
                                {#if entry.rank === 1}
                                  <i class="fa-solid fa-trophy"
                                     style="color: {$colorStore.primary}; font-size: 24px;"></i>
                                {:else if entry.rank === 2}
                                  <i class="fa-solid fa-star"
                                     style="color: {$colorStore.secondary}; font-size: 24px;"></i>
                                {:else if entry.rank === 3}
                                  <i class="fa-solid fa-star" style="color: {$colorStore.accent}; font-size: 24px;"></i>
                                {/if}
                                <button class="p-2 rounded-lg transition-all hover:scale-[1.05] shrink-0 min-h-[40px] min-w-[40px]"
                                        style="background: {$colorStore.primary}15; color: {$colorStore.primary};"
                                        aria-label={m.reputation.viewHistoryAria({ username: entry.username })}
                                        title={m.reputation.viewHistory()}
                                        onclick={() => openHistory(entry)}>
                                    <i class="fa-solid fa-clock-rotate-left" style="font-size: 14px;"></i>
                                </button>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>

        {#if historyTarget}
            <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                 role="presentation"
                 onclick={closeHistory}
                 onkeydown={(e) => { if (e.key === "Escape") closeHistory(); }}
                 in:fade={{ duration: 150 }}>
                <div class="rounded-2xl shadow-2xl w-full max-w-2xl border max-h-[85vh] flex flex-col"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}, {$colorStore.gradientMid}); border-color: {$colorStore.primary}30;"
                     role="dialog"
                     aria-modal="true"
                     aria-labelledby="rep-history-title"
                     tabindex="-1"
                     onclick={(e) => e.stopPropagation()}
                     onkeydown={(e) => e.stopPropagation()}
                     in:fly={{ y: 20, duration: 250 }}>
                    <div class="p-6 pb-4 flex items-center justify-between gap-3 border-b" style="border-color: {$colorStore.primary}20;">
                        <div class="min-w-0">
                            <h3 id="rep-history-title" class="text-lg font-bold truncate" style="color: {$colorStore.text}">{m.reputation.historyTitle()}</h3>
                            <p class="text-xs truncate" style="color: {$colorStore.muted}">{m.reputation.historySubtitle({ username: historyTarget.username, reputation: historyTarget.reputation })}</p>
                        </div>
                        <button class="p-2 rounded-lg min-h-[40px] min-w-[40px]" style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                                aria-label={m.common.close()} onclick={closeHistory}>
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div class="p-6 overflow-y-auto flex-1 space-y-2">
                        {#if historyLoading}
                            <div class="text-center py-8"><i class="fa-solid fa-spinner fa-spin" style="color: {$colorStore.primary}; font-size: 28px;"></i></div>
                        {:else if history.length === 0}
                            <p class="text-center py-8 text-sm" style="color: {$colorStore.muted}">{m.reputation.historyEmpty()}</p>
                        {:else}
                            {#each history as item (item.id)}
                                <div class="flex items-start gap-3 p-3 rounded-lg" style="background: {$colorStore.primary}08;">
                                    <span class="px-2 py-1 rounded-sm text-sm font-bold shrink-0"
                                          style="background: {item.amount >= 0 ? '#10b98120' : '#ef444420'}; color: {item.amount >= 0 ? '#10b981' : '#ef4444'};">
                                        {item.amount >= 0 ? "+" : ""}{item.amount}
                                    </span>
                                    <div class="flex-1 min-w-0 text-sm">
                                        <div style="color: {$colorStore.text}">
                                            <span class="font-medium">{item.repType}</span>
                                            <span class="font-medium" style="color: {$colorStore.muted}">{item.isAnonymous ? m.reputation.historyFromAnonymous() : m.reputation.historyFromUser({ id: item.giverId.toString() })}</span>
                                        </div>
                                        {#if item.reason}
                                            <div class="text-xs mt-0.5 break-words" style="color: {$colorStore.muted}">{item.reason}</div>
                                        {/if}
                                        <div class="text-xs mt-1" style="color: {$colorStore.muted}">{new Date(item.timestamp).toLocaleString()}</div>
                                    </div>
                                </div>
                            {/each}
                            <div class="flex justify-center gap-2 pt-2">
                                <button class="px-4 py-2 rounded-lg text-sm min-h-[40px] disabled:opacity-40"
                                        style="background: {$colorStore.primary}20; color: {$colorStore.text};"
                                        disabled={historyPage <= 1 || historyLoading}
                                        onclick={() => loadHistory(historyPage - 1)}>{m.common.previous()}</button>
                                <span class="px-3 py-2 text-sm" style="color: {$colorStore.muted}">{m.common.pageNumber({ page: historyPage })}</span>
                                <button class="px-4 py-2 rounded-lg text-sm min-h-[40px] disabled:opacity-40"
                                        style="background: {$colorStore.primary}20; color: {$colorStore.text};"
                                        disabled={history.length < historyPageSize || historyLoading}
                                        onclick={() => loadHistory(historyPage + 1)}>{m.common.next()}</button>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}

    {:else if activeTab === 'stats'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            {#if stats}
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <StatCard
                      icon="fa-users"
                            label={m.common.totalUsers()}
                            value={stats.totalUsers}
                            subtitle={m.reputation.statUsersSubtitle()}
                            iconColor="primary"
                            animationDelay={0}
                    />

                    <StatCard
                      icon="fa-star"
                            label={m.reputation.statGiven()}
                            value={stats.totalRepGiven}
                            subtitle={m.common.allTimeLower()}
                            iconColor="secondary"
                            animationDelay={100}
                    />

                    <StatCard
                      icon="fa-chart-simple"
                            label={m.common.transactions()}
                            value={stats.totalTransactions}
                            subtitle={m.reputation.statTransactionsSubtitle()}
                            iconColor="accent"
                            animationDelay={200}
                    />

                    <StatCard
                      icon="fa-star"
                            label={m.reputation.statAverage()}
                            value={Math.round(stats.averageRepPerUser)}
                            subtitle={m.reputation.statAverageSubtitle()}
                            iconColor="primary"
                            animationDelay={300}
                    />
                </div>
            {:else}
                <div class="text-center py-12">
                  <i class="fa-utility-duo fa-regular fa-chart-simple"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 64px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                    <h3 class="text-xl font-semibold mb-2" style="color: {$colorStore.text}">{m.common.noStatisticsAvailable()}</h3>
                    <p style="color: {$colorStore.muted}">
                        {m.reputation.statsEmptyHint()}
                    </p>
                </div>
            {/if}
        </div>
    {/if}
</DashboardPageLayout>
