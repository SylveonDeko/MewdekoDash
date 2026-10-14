<!-- routes/dashboard/confessions/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { colorStore } from "$lib/stores/colorStore";
    import { currentGuild } from "$lib/stores/currentGuild";
    import { clientApi, type Confession, confessionsApi, type ConfessionStats } from "$lib/api/index.ts";
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
    let confessions: Confession[] = $state([]);
    let confessionChannel: bigint | null = $state(null);
    let confessionLogChannel: bigint | null = $state(null);
    let blacklistedRoles: bigint[] = $state([]);
    let stats: ConfessionStats | null = $state(null);
    let guildChannels: Array<{ id: string; name: string; }> = $state([]);
    let guildRoles: Array<{ id: string; name: string; color: number }> = $state([]);

    // Form data
    let configForm = $state({
        channelId: null as bigint | null,
        logChannelId: null as bigint | null
    });

    // UI state
    let activeTab = $state("config");
    let showConfessionContent: Set<number> = $state(new Set());

    // Load all confession data
    async function loadAllConfessionData() {
        if (!$currentGuild?.id) return;

        loading = true;
        try {
            const [
                confessionsData,
                channelData,
                logChannelData,
                blacklistData,
                statsData,
                channelsData,
                rolesListData
            ] = await Promise.all([
                confessionsApi.getConfessions($currentGuild.id).catch(() => []),
                confessionsApi.getConfessionChannel($currentGuild.id).catch(() => null),
                confessionsApi.getConfessionLogChannel($currentGuild.id).catch(() => null),
                confessionsApi.getConfessionBlacklist($currentGuild.id).catch(() => []),
                confessionsApi.getConfessionStats($currentGuild.id).catch(() => null),
                clientApi.getTextChannels($currentGuild.id).catch(() => []),
                clientApi.getRoles($currentGuild.id).catch(() => [])
            ]);

            confessions = confessionsData;
            confessionChannel = channelData;
            confessionLogChannel = logChannelData;
            blacklistedRoles = blacklistData;
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
              .sort((a: any, b: any) => a.name.localeCompare(b.name));

            configForm = {
                channelId: confessionChannel,
                logChannelId: confessionLogChannel
            };
        } catch (err) {
            logger.error("Failed to load confession data:", err);
            showMessage(m.confessions.pageErrorLoad(), "error");
        } finally {
            loading = false;
        }
    }

    const autoSave = createAutoSave({
        onError: () => showMessage(m.confessions.pageErrorAutosave(), "error")
    });

    // Each channel saves as soon as it is picked. confessionChannel / confessionLogChannel hold
    // the last values the server confirmed, so a failed save can be rolled back.
    function saveConfessionChannel(value: bigint | null) {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const previous = confessionChannel;
        configForm.channelId = value;
        autoSave.now("channel", async () => {
            try {
                await confessionsApi.setConfessionChannel(guildId, value || BigInt(0));
                if ($currentGuild?.id === guildId) confessionChannel = value;
            } catch (err) {
                if ($currentGuild?.id === guildId) configForm.channelId = previous;
                throw err;
            }
        });
    }

    function saveConfessionLogChannel(value: bigint | null) {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const previous = confessionLogChannel;
        configForm.logChannelId = value;
        autoSave.now("logChannel", async () => {
            try {
                await confessionsApi.setConfessionLogChannel(guildId, value || BigInt(0));
                if ($currentGuild?.id === guildId) confessionLogChannel = value;
            } catch (err) {
                if ($currentGuild?.id === guildId) configForm.logChannelId = previous;
                throw err;
            }
        });
    }

    // Toggle role blacklist
    async function toggleRoleBlacklist(roleId: string) {
        if (!$currentGuild?.id) return;

        saving = true;
        try {
            await confessionsApi.toggleConfessionBlacklist($currentGuild.id, BigInt(roleId));
            await loadAllConfessionData();
        } catch (err) {
            logger.error("Failed to toggle role blacklist:", err);
            showMessage(m.common.failedToUpdateBlacklist(), "error");
        } finally {
            saving = false;
        }
    }

    // Delete confession
    async function deleteConfession(confessionNumber: bigint) {
        if (!$currentGuild?.id) return;
        if (!(await requestConfirmation({ message: m.confessions.pageConfirmDelete({ number: confessionNumber.toString() }), confirmText: m.common.delete() }))) return;

        saving = true;
        try {
            await confessionsApi.deleteConfession($currentGuild.id, confessionNumber);
            showMessage(m.confessions.pageNotifyDeleted(), "success");
            await loadAllConfessionData();
        } catch (err) {
            logger.error("Failed to delete confession:", err);
            showMessage(m.confessions.pageErrorDelete(), "error");
        } finally {
            saving = false;
        }
    }

    // Toggle confession visibility
    function toggleConfessionVisibility(id: number) {
        const newSet = new Set(showConfessionContent);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        showConfessionContent = newSet;
    }

    // Utility functions
    function showMessage(text: string, type: "success" | "error" | "info") {
        message = text;
        messageType = type;
        setTimeout(() => {
            message = "";
        }, 5000);
    }

    function formatDate(dateString: string | null): string {
        if (!dateString) return m.common.unknown();
        return new Date(dateString).toLocaleString();
    }

    function isRoleBlacklisted(roleId: string): boolean {
        return blacklistedRoles.some(id => id.toString() === roleId);
    }

    function truncateText(text: string, maxLength: number = 100): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    }

    onMount(() => {
        loadAllConfessionData();
    });

    // Tabs configuration
    const tabs = $derived([
        { id: "config", label: m.common.configuration(), icon: "fa-gear" },
        { id: "confessions", label: m.features.confessionsName(), icon: "fa-comment" },
        { id: "stats", label: m.common.statistics(), icon: "fa-chart-column" }
    ]);

    // Action buttons configuration
    let actionButtons = $derived([
        {
            label: m.common.refresh(),
            icon: "fa-arrows-rotate",
            action: async () => {
                await autoSave.flush();
                await loadAllConfessionData();
            },
            loading: loading
        }
    ]);

</script>

{#snippet statusMessageContent()}
    {#if message}
        <div class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-all"
             style="background: {messageType === 'success' ? '#10b98120' : messageType === 'error' ? '#ef444420' : $colorStore.primary + '20'};
                border: 1px solid {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}30;"
             in:fly={{ x: 20, duration: 300 }}>
            {#if messageType === 'success'}
                <i class="fa-utility-duo fa-regular fa-circle-check"
                   style="--fa-primary-color: #10b981; --fa-secondary-color: #059669; font-size: 20px;"></i>
            {:else if messageType === 'error'}
                <i class="fa-utility-duo fa-regular fa-circle-exclamation"
                   style="--fa-primary-color: #ef4444; --fa-secondary-color: #dc2626; font-size: 20px;"></i>
            {:else}
                <i class="fa-utility-duo fa-regular fa-circle-exclamation"
                   style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
            {/if}
            <span
              style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
        </div>
    {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  {autoSave}
  bind:activeTab
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-comment"
  statusMessages={statusMessageContent}
  subtitle={m.confessions.pageSubtitle()}
  {tabs}
  title={m.features.confessionsName()}
>

    <!-- Tab Content -->
    {#if activeTab === 'config'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <div class="space-y-6 md:space-y-8">
                <!-- Basic Settings -->
                <div class="relative z-20  rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                        <i class="fa-utility-duo fa-regular fa-gear" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.common.basicSettings()}</h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <!-- Confession Channel -->
                        <div>
                            <span id="confession-channel-label" class="block text-sm font-medium mb-2"
                                  style="color: {$colorStore.text}">
                                <i class="fa-solid fa-hashtag" style="font-size: 14px;"></i>
                                {m.common.confessionChannel()}
                            </span>
                            <div class="min-h-[44px]">
                                <DiscordSelector
                                        type="channel"
                                        options={guildChannels}
                                        selected={configForm.channelId?.toString() || null}
                                        placeholder={m.common.noChannelSelected()}
                                        onchange={(detail) => saveConfessionChannel(detail.selected && typeof detail.selected === 'string' ? BigInt(detail.selected) : null)}
                                />
                            </div>
                        </div>

                        <!-- Log Channel -->
                        <div>
                            <span id="log-channel-shows-user-ids-label" class="block text-sm font-medium mb-2"
                                  style="color: {$colorStore.text}">
                                <i class="fa-solid fa-file-lines" style="font-size: 14px;"></i>
                                {m.confessions.pageConfigLogChannel()}
                            </span>
                            <div class="min-h-[44px]">
                                <DiscordSelector
                                        type="channel"
                                        options={guildChannels}
                                        selected={configForm.logChannelId?.toString() || null}
                                        placeholder={m.common.noLogChannel()}
                                        onchange={(detail) => saveConfessionLogChannel(detail.selected && typeof detail.selected === 'string' ? BigInt(detail.selected) : null)}
                                />
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Role Blacklist -->
                <div class="relative z-10  rounded-2xl p-6 md:p-8 shadow-2xl transition-all border"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}15);
                    border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                        <i class="fa-utility-duo fa-regular fa-lock" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.confessions.pageBlacklistTitle()}</h2>
                    </div>

                    <p class="text-sm mb-4" style="color: {$colorStore.muted}">
                        {m.confessions.pageBlacklistHint()}
                    </p>

                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {#each guildRoles as role}
                            <button
                              class="p-3 rounded-lg transition-all hover:scale-[1.02] text-left flex items-center gap-2"
                                    style="background: {isRoleBlacklisted(role.id) ? '#ef444420' : $colorStore.primary + '10'};
                                   border: 1px solid {isRoleBlacklisted(role.id) ? '#ef4444' : $colorStore.primary}30;"
                                    onclick={() => toggleRoleBlacklist(role.id)}
                                    disabled={saving}
                            >
                                {#if isRoleBlacklisted(role.id)}
                                    <i class="fa-solid fa-lock" style="color: #ef4444; font-size: 16px;"></i>
                                {:else}
                                    <i class="fa-solid fa-crown"
                                       style="color: {$colorStore.primary}; font-size: 16px;"></i>
                                {/if}
                                <span class="text-sm truncate" style="color: {$colorStore.text}">{role.name}</span>
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
        </div>

    {:else if activeTab === 'confessions'}
        <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
            <!-- Confessions List -->
            <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                    <i class="fa-utility-duo fa-regular fa-comment" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.confessions.pageListTitle({ count: confessions.length })}</h2>
                </div>

                <div class="space-y-3 max-h-[600px] overflow-y-auto">
                    {#if confessions.length === 0}
                        <div class="text-center py-8">
                            <i class="fa-utility-duo fa-regular fa-comment" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">{m.confessions.pageListEmptyTitle()}</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                {m.confessions.pageListEmptyHint()}
                            </p>
                        </div>
                    {:else}
                        {#each confessions.slice().reverse() as confession}
                            <div class="rounded-xl border transition-all"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                                <div class="p-4">
                                    <div class="flex items-start justify-between mb-3">
                                        <div class="flex items-center gap-3">
                                            <div class="flex items-center justify-center w-10 h-10 rounded-full"
                                                 style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
                                                #{confession.confessNumber}
                                            </div>
                                            <div>
                                                <div class="font-semibold" style="color: {$colorStore.text}">
                                                    {m.confessions.pageItemTitle({ number: confession.confessNumber.toString() })}
                                                </div>
                                                <div class="text-sm" style="color: {$colorStore.muted}">
                                                    {formatDate(confession.dateAdded)}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <button
                                                    class="p-2 rounded-lg transition-all hover:scale-110"
                                                    style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                                    onclick={() => toggleConfessionVisibility(confession.id)}
                                                    aria-label={showConfessionContent.has(confession.id) ? m.confessions.pageHideContentAria() : m.confessions.pageShowContentAria()}
                                            >
                                                {#if showConfessionContent.has(confession.id)}
                                                    <i class="fa-solid fa-eye-slash" style="font-size: 16px;"></i>
                                                {:else}
                                                    <i class="fa-solid fa-eye" style="font-size: 16px;"></i>
                                                {/if}
                                            </button>
                                            <button aria-label={m.confessions.pageDeleteAria()}
                                                    class="p-2 rounded-lg transition-all hover:scale-110"
                                                    style="background: #ef444420; color: #ef4444;"
                                                    onclick={() => deleteConfession(confession.confessNumber)}
                                            >
                                                <i class="fa-solid fa-circle-xmark" style="font-size: 16px;"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="p-3 rounded-lg" style="background: {$colorStore.primary}05;">
                                        <p class="text-sm" style="color: {$colorStore.text}">
                                            {#if showConfessionContent.has(confession.id)}
                                                {confession.confession1 || m.confessions.pageNoContent()}
                                            {:else}
                                                {truncateText(confession.confession1 || m.confessions.pageNoContent())}
                                                {#if (confession.confession1 || '').length > 100}
                                                    <button
                                                            class="text-xs ml-2"
                                                            style="color: {$colorStore.primary}"
                                                            onclick={() => toggleConfessionVisibility(confession.id)}
                                                    >
                                                        {m.confessions.pageShowMore()}
                                                    </button>
                                                {/if}
                                            {/if}
                                        </p>
                                    </div>
                                </div>
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
                            icon="fa-comment"
                            label={m.confessions.pageStatTotal()}
                            value={stats.totalConfessions}
                            subtitle={m.common.allTimeLower()}
                            iconColor="primary"
                            animationDelay={0}
                    />

                    <StatCard
                            icon="fa-calendar"
                            label={m.confessions.pageStatMonth()}
                            value={stats.confessionsThisMonth}
                            subtitle={m.confessions.pageStatConfessionsSub()}
                            iconColor="secondary"
                            animationDelay={100}
                    />

                    <StatCard
                            icon="fa-clock"
                            label={m.common.today()}
                            value={stats.confessionsToday}
                            subtitle={m.confessions.pageStatConfessionsSub()}
                            iconColor="accent"
                            animationDelay={200}
                    />

                    <StatCard
                            icon="fa-list-numeric"
                            label={m.confessions.pageStatLatest()}
                            value={Number(stats.lastConfessionNumber)}
                            subtitle={m.confessions.pageStatLatestSub()}
                            iconColor="primary"
                            animationDelay={300}
                    />
                </div>
            {:else}
                <div class="text-center py-12">
                    <i class="fa-utility-duo fa-regular fa-chart-simple" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 64px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                    <h3 class="text-xl font-semibold mb-2" style="color: {$colorStore.text}">{m.common.noStatisticsAvailable()}</h3>
                    <p style="color: {$colorStore.muted}">
                        {m.confessions.pageStatsEmptyHint()}
                    </p>
                </div>
            {/if}
        </div>
    {/if}
</DashboardPageLayout>
