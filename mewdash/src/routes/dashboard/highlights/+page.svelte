<!-- routes/dashboard/highlights/+page.svelte -->
<script lang="ts">
    import {onMount} from "svelte";
    import {fade, fly} from "svelte/transition";
    import {colorStore} from "$lib/stores/colorStore";
    import {currentGuild} from "$lib/stores/currentGuild";
    import {api} from "$lib/api";
    import {logger} from "$lib/logger";

    import StatCard from "$lib/components/monitoring/StatCard.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";

    // Component state
    let loading = $state(false);
    let saving = $state(false);
    let message = $state("");
    let messageType: "success" | "error" | "info" = $state("info");

    // Data state
    let highlights: Array<{
        id: number;
        userId: bigint;
        username: string;
        word: string;
        dateAdded: string;
    }> = $state([]);
    let stats: {
        totalHighlights: number;
        totalUsers: number;
        topHighlightedWords: Array<{ word: string; count: number }>;
        topUsers: Array<{ userId: bigint; username: string; highlightCount: number }>;
        recentHighlights: Array<{ word: string; userId: bigint; username: string; dateAdded: string }>;
    } | null = $state(null);
    let disabledUsers: Array<{
        userId: bigint;
        username: string;
        ignoredChannelsCount: number;
        ignoredUsersCount: number;
    }> = $state([]);

    // UI state
    let activeTab = $state("highlights");
    let searchQuery = $state("");
    let searchResults: typeof highlights = $state([]);

    // Load all highlight data
    async function loadAllHighlightData() {
        if (!$currentGuild?.id) return;

        loading = true;
        try {
            const [
                highlightsData,
                statsData,
                disabledData
            ] = await Promise.all([
                api.getGuildHighlights($currentGuild.id).catch(() => []),
                api.getHighlightStats($currentGuild.id).catch(() => null),
                api.getDisabledHighlightUsers($currentGuild.id).catch(() => [])
            ]);

            highlights = highlightsData;
            stats = statsData;
            disabledUsers = disabledData;
        } catch (err) {
            logger.error("Failed to load highlight data:", err);
            showMessage("Failed to load highlight data", "error");
        } finally {
            loading = false;
        }
    }

    // Search highlights
    async function searchHighlights() {
        if (!$currentGuild?.id || !searchQuery.trim()) {
            searchResults = [];
            return;
        }

        try {
            searchResults = await api.searchHighlights($currentGuild.id, searchQuery);
        } catch (err) {
            logger.error("Failed to search highlights:", err);
            showMessage("Search failed", "error");
        }
    }

    // Delete highlight
    async function deleteHighlight(highlightId: number) {
        if (!$currentGuild?.id) return;
        if (!confirm("Are you sure you want to delete this highlight?")) return;

        saving = true;
        try {
            await api.deleteHighlight($currentGuild.id, highlightId);
            showMessage("Highlight deleted successfully!", "success");
            await loadAllHighlightData();
            if (searchQuery.trim()) {
                await searchHighlights();
            }
        } catch (err) {
            logger.error("Failed to delete highlight:", err);
            showMessage("Failed to delete highlight", "error");
        } finally {
            saving = false;
        }
    }

    // Delete all user highlights
    async function deleteUserHighlights(userId: bigint, username: string) {
        if (!$currentGuild?.id) return;
        if (!confirm(`Are you sure you want to delete all highlights for ${username}?`)) return;

        saving = true;
        try {
            const result = await api.deleteUserHighlights($currentGuild.id, userId);
            showMessage(`Deleted ${result.removedCount} highlight(s)!`, "success");
            await loadAllHighlightData();
        } catch (err) {
            logger.error("Failed to delete user highlights:", err);
            showMessage("Failed to delete highlights", "error");
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

    function groupHighlightsByUser() {
        const grouped = new Map<string, typeof highlights>();
        highlights.forEach(h => {
            const key = h.userId.toString();
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key)!.push(h);
        });
        return Array.from(grouped.entries()).map(([userId, userHighlights]) => ({
            userId: BigInt(userId),
            username: userHighlights[0].username,
            highlights: userHighlights
        }));
    }

    onMount(() => {
        loadAllHighlightData();
    });

    // Tabs configuration
    const tabs = [
        { id: "highlights", label: "All Highlights", icon: "fa-bolt" },
        { id: "search", label: "Search", icon: "fa-magnifying-glass" },
        { id: "disabled", label: "Disabled Users", icon: "fa-eye-slash" },
        { id: "stats", label: "Statistics", icon: "fa-chart-column" }
    ];

    // Action buttons configuration
    let actionButtons = $derived([
        {
            label: "Refresh",
            icon: "fa-arrows-rotate",
            action: loadAllHighlightData,
            loading: loading
        }
    ]);

    // Handle tab change
    function handleTabChange(event: CustomEvent) {
        activeTab = event.detail.tabId;
    }

    let groupedHighlights = $derived(groupHighlightsByUser());
</script>

<DashboardPageLayout
        title="Highlights"
        subtitle="Manage guild-wide highlight system"
        icon="fa-bolt"
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
                    <i class="fa-utility-duo fa-regular fa-circle-check" style="--fa-primary-color: #10b981; --fa-secondary-color: #059669; font-size: 20px;"></i>
                {:else if messageType === 'error'}
                    <i class="fa-utility-duo fa-regular fa-circle-xmark" style="--fa-primary-color: #ef4444; --fa-secondary-color: #dc2626; font-size: 20px;"></i>
                {:else}
                    <i class="fa-utility-duo fa-regular fa-circle-exclamation" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                {/if}
                <span style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
            </div>
        {/if}
    </svelte:fragment>

    {#if activeTab === 'highlights'}
        <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
            <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                    <i class="fa-utility-duo fa-regular fa-bolt" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">All Highlights ({highlights.length})</h2>
                </div>

                <div class="space-y-4">
                    {#if highlights.length === 0}
                        <div class="text-center py-8">
                            <i class="fa-utility-duo fa-regular fa-bolt" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No Highlights</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                Users haven't set up any highlights yet.
                            </p>
                        </div>
                    {:else}
                        {#each groupedHighlights as userGroup}
                            <div class="rounded-xl border p-4 transition-all"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="flex items-center gap-3">
                                        <i class="fa-utility-duo fa-regular fa-user-check" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                                        <div>
                                            <div class="font-semibold" style="color: {$colorStore.text}">
                                                {userGroup.username}
                                            </div>
                                            <div class="text-sm" style="color: {$colorStore.muted}">
                                                {userGroup.highlights.length} highlight{userGroup.highlights.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                            class="px-3 py-2 rounded-lg text-sm transition-all hover:scale-105"
                                            style="background: #ef444420; color: #ef4444;"
                                            onclick={() => deleteUserHighlights(userGroup.userId, userGroup.username)}
                                    >
                                        Delete All
                                    </button>
                                </div>

                                <div class="flex flex-wrap gap-2">
                                    {#each userGroup.highlights as highlight}
                                        <div class="flex items-center gap-2 px-3 py-2 rounded-lg"
                                             style="background: {$colorStore.primary}10;">
                                            <span class="text-sm font-medium" style="color: {$colorStore.text}">
                                                "{highlight.word}"
                                            </span>
                                          <button aria-label="Delete highlight"
                                                    class="p-1 rounded hover:bg-red-500/20 transition-colors"
                                                    onclick={() => deleteHighlight(highlight.id)}
                                            >
                                                <i class="fa-solid fa-circle-xmark" style="color: #ef4444; font-size: 12px;"></i>
                                            </button>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>

    {:else if activeTab === 'search'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                    <i class="fa-utility-duo fa-regular fa-magnifying-glass" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Search Highlights</h2>
                </div>

                <div class="mb-6">
                    <div class="flex gap-2">
                        <input
                                type="text"
                                bind:value={searchQuery}
                                placeholder="Enter word or pattern..."
                                class="flex-1 p-3 rounded-xl border transition-all text-base"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                onkeydown={(e) => e.key === 'Enter' && searchHighlights()}
                        >
                      <button aria-label="Button action"
                                class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                                style="background: {$colorStore.primary}; color: white;"
                                onclick={searchHighlights}
                        >
                            <i class="fa-solid fa-magnifying-glass" style="font-size: 20px;"></i>
                        </button>
                    </div>
                </div>

                <div class="space-y-3">
                    {#if searchResults.length === 0 && searchQuery.trim()}
                        <div class="text-center py-8">
                            <i class="fa-utility-duo fa-regular fa-magnifying-glass" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No Results</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                No highlights match your search query.
                            </p>
                        </div>
                    {:else if searchResults.length > 0}
                        {#each searchResults as highlight}
                            <div class="flex items-center justify-between p-4 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <i class="fa-utility-duo fa-regular fa-bolt" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                                    <div>
                                        <div class="font-semibold" style="color: {$colorStore.text}">
                                            "{highlight.word}"
                                        </div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">
                                            {highlight.username} • {formatDate(highlight.dateAdded)}
                                        </div>
                                    </div>
                                </div>
                              <button aria-label="Delete word"
                                        class="p-2 rounded-lg transition-all hover:scale-110"
                                        style="background: #ef444420; color: #ef4444;"
                                        onclick={() => deleteHighlight(highlight.id)}
                                >
                                    <i class="fa-solid fa-circle-xmark" style="font-size: 16px;"></i>
                                </button>
                            </div>
                        {/each}
                    {:else if !searchQuery.trim()}
                        <div class="text-center py-8">
                            <i class="fa-utility-duo fa-regular fa-magnifying-glass" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                Enter a search term to find highlights.
                            </p>
                        </div>
                    {/if}
                </div>
            </div>
        </div>

    {:else if activeTab === 'disabled'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                    <i class="fa-utility-duo fa-regular fa-eye-slash" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Disabled Users ({disabledUsers.length})</h2>
                </div>

                <div class="space-y-3">
                    {#if disabledUsers.length === 0}
                        <div class="text-center py-8">
                            <i class="fa-utility-duo fa-regular fa-eye" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">All Users Enabled</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                No users have disabled highlights.
                            </p>
                        </div>
                    {:else}
                        {#each disabledUsers as user}
                            <div class="flex items-center justify-between p-4 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <i class="fa-utility-duo fa-regular fa-eye-slash" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 20px;"></i>
                                    <div>
                                        <div class="font-semibold" style="color: {$colorStore.text}">
                                            {user.username}
                                        </div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">
                                            Ignoring {user.ignoredChannelsCount} channel(s) • {user.ignoredUsersCount} user(s)
                                        </div>
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
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6">
                    <StatCard
                            icon="fa-bolt"
                            label="Total Highlights"
                            value={stats.totalHighlights}
                            subtitle="across server"
                            iconColor="primary"
                            animationDelay={0}
                    />

                    <StatCard
                            icon="fa-users"
                            label="Active Users"
                            value={stats.totalUsers}
                            subtitle="with highlights"
                            iconColor="secondary"
                            animationDelay={100}
                    />

                    <StatCard
                      icon="fa-star"
                            label="Top Word"
                            value={stats.topHighlightedWords[0]?.count || 0}
                            subtitle={stats.topHighlightedWords[0]?.word || "none"}
                            iconColor="accent"
                            animationDelay={200}
                    />

                    <StatCard
                            icon="fa-user-check"
                            label="Most Active"
                            value={stats.topUsers[0]?.highlightCount || 0}
                            subtitle={stats.topUsers[0]?.username || "none"}
                            iconColor="primary"
                            animationDelay={300}
                    />
                </div>

                {#if stats.topHighlightedWords.length > 0}
                    <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all mb-6"
                         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                                border-color: {$colorStore.primary}30;">
                        <div class="flex items-center gap-3 mb-6">
                            <i class="fa-utility-duo fa-regular fa-chart-line" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Top Highlighted Words</h2>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {#each stats.topHighlightedWords.slice(0, 6) as word}
                                <div class="p-4 rounded-xl" style="background: {$colorStore.primary}08;">
                                    <div class="font-semibold mb-1" style="color: {$colorStore.text}">
                                        "{word.word}"
                                    </div>
                                    <div class="text-sm" style="color: {$colorStore.primary}">
                                        {word.count} user{word.count !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}

                {#if stats.recentHighlights.length > 0}
                    <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
                         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                                border-color: {$colorStore.primary}30;">
                        <div class="flex items-center gap-3 mb-6">
                            <i class="fa-utility-duo fa-regular fa-bolt" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Recent Highlights</h2>
                        </div>

                        <div class="space-y-2">
                            {#each stats.recentHighlights.slice(0, 10) as highlight}
                                <div class="flex items-center justify-between p-3 rounded-lg"
                                     style="background: {$colorStore.primary}08;">
                                    <span style="color: {$colorStore.text}">
                                        <strong>"{highlight.word}"</strong> by {highlight.username}
                                    </span>
                                    <span class="text-sm" style="color: {$colorStore.muted}">
                                        {formatDate(highlight.dateAdded)}
                                    </span>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            {:else}
                <div class="text-center py-12">
                    <i class="fa-utility-duo fa-regular fa-chart-column" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 64px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                    <h3 class="text-xl font-semibold mb-2" style="color: {$colorStore.text}">No Statistics Available</h3>
                    <p style="color: {$colorStore.muted}">
                        Highlight statistics will appear here once users set up highlights.
                    </p>
                </div>
            {/if}
        </div>
    {/if}
</DashboardPageLayout>
