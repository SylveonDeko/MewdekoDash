<!-- routes/dashboard/feeds/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { colorStore } from "$lib/stores/colorStore";
    import { currentGuild } from "$lib/stores/currentGuild";
    import { clientApi, feedsApi, type FeedSub } from "$lib/api/index.ts";
    import { logger } from "$lib/logger";

    import StatCard from "$lib/components/monitoring/StatCard.svelte";
    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
    import PreviewCard from "$lib/components/specialized/PreviewCard.svelte";
    import { parseStoredMessage } from "$lib/utils/embedMessage";
    import { requestConfirmation } from "$lib/stores/confirmationStore";
    import { createAutoSave } from "$lib/utils/autoSave.svelte";

    const autoSave = createAutoSave({
        onError: () => showMessage(m.feeds.pageErrorAutosave(), "error")
    });

    /** Feed messages are saved under the feed's id, which, unlike its index, survives removals. */
    function messageKey(feedId: number) {
        return `feed-message-${feedId}`;
    }

    // Saves that have been sent but not answered. Removing a feed shifts the indexes the API
    // uses, so a removal waits for these to land first.
    const inFlight = new Set<Promise<void>>();

    // Component state
    let loading = $state(false);
    let saving = $state(false);
    let message = $state("");
    let messageType: "success" | "error" | "info" = $state("info");

    // Data state
    let feeds: FeedSub[] = $state([]);
    let feedStats: {
        totalFeeds: number;
        feedsByChannel: Record<string, number>;
        oldestFeed: string | null;
    } | null = $state(null);
    let feedUrls: string[] = $state([]);
    let guildChannels: Array<{ id: string; name: string; }> = $state([]);

    // Form data
    let newFeed = $state({
        channelId: null as string | null,
        url: ""
    });
    let editingFeed: number | null = $state(null);
    let editMessage = $state("");

    // UI state
    let activeTab = $state("list");

    // Load all feed data
    async function loadAllFeedData() {
        if (!$currentGuild?.id) return;

        // Let anything still waiting land first, so the reload shows it.
        await settleSaves();
        if (!$currentGuild?.id) return;

        loading = true;
        try {
            const [
                feedsData,
                statsData,
                channelsData
            ] = await Promise.all([
                feedsApi.getFeeds($currentGuild.id).catch(() => []),
                feedsApi.getFeedStats($currentGuild.id).catch(() => null),
                clientApi.getTextChannels($currentGuild.id).catch(() => [])
            ]);

            feeds = feedsData;
            feedStats = statsData;
            feedUrls = Array.from(new Set(feedsData.map((f: any) => f.url)));

            guildChannels = (channelsData || []).map((channel: any) => ({
                id: channel.id.toString(),
                name: channel.name
            }));
        } catch (err) {
            logger.error("Failed to load feed data:", err);
            showMessage(m.feeds.pageErrorLoad(), "error");
        } finally {
            loading = false;
        }
    }

    // Add feed
    async function addFeed() {
        if (!$currentGuild?.id || !newFeed.channelId || !newFeed.url.trim()) return;

        saving = true;
        try {
            await feedsApi.addFeed($currentGuild.id, {
                channelId: BigInt(newFeed.channelId),
                url: newFeed.url
            });
            showMessage(m.feeds.pageNotifyAdded(), "success");
            newFeed = { channelId: null, url: "" };
            await loadAllFeedData();
        } catch (err) {
            logger.error("Failed to add feed:", err);
            showMessage(m.feeds.pageErrorAdd(), "error");
        } finally {
            saving = false;
        }
    }

    /** Runs every waiting message save and waits for the ones already sent. */
    async function settleSaves() {
        await autoSave.flush();
        await Promise.allSettled([...inFlight]);
    }

    /**
     * Saves the message being edited once the user pauses. The feed's index is read now,
     * when the edit happens, because that is what the API addresses the feed by.
     */
    function saveFeedMessage(feed: FeedSub) {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const feedId = feed.id;
        const index = feed.index;
        const text = editMessage;
        autoSave.schedule(messageKey(feedId), async () => {
            const request = feedsApi.setFeedMessage(guildId, index, text);
            const tracked = request.then(() => {}, () => {});
            inFlight.add(tracked);
            try {
                await request;
            } finally {
                inFlight.delete(tracked);
            }
            if ($currentGuild?.id !== guildId) return;
            feeds = feeds.map((f) => f.id === feedId ? { ...f, message: text } : f);
        });
    }

    /** Escape puts the last saved message back and drops the waiting save. */
    function revertFeedMessage(feed: FeedSub) {
        autoSave.cancel(messageKey(feed.id));
        editMessage = feed.message || "";
        editingFeed = null;
    }

    function finishEditing(feed: FeedSub) {
        void autoSave.flush(messageKey(feed.id));
        editingFeed = null;
        editMessage = "";
    }

    // Remove feed
    async function removeFeed(index: number) {
        if (!$currentGuild?.id) return;
        if (!(await requestConfirmation({ message: m.feeds.pageConfirmRemove(), confirmText: m.common.remove() }))) return;
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;

        saving = true;
        try {
            // A waiting edit to the removed feed would land on whichever feed takes its index.
            const removed = feeds.find((f) => f.index === index);
            if (removed) {
                autoSave.cancel(messageKey(removed.id));
                if (editingFeed === removed.id) editingFeed = null;
            }
            // Other feeds' edits were addressed by the old indexes, so they must land first.
            await settleSaves();
            await feedsApi.removeFeed(guildId, index);
            showMessage(m.feeds.pageNotifyRemoved(), "success");
            await loadAllFeedData();
        } catch (err) {
            logger.error("Failed to remove feed:", err);
            showMessage(m.feeds.pageErrorRemove(), "error");
        } finally {
            saving = false;
        }
    }

    // Start editing
    function startEditing(feed: FeedSub) {
        if (editingFeed !== null) void autoSave.flush(messageKey(editingFeed));
        editingFeed = feed.id;
        editMessage = feed.message || "";
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

    function getChannelName(channelId: bigint): string {
        const channel = guildChannels.find(c => c.id === channelId.toString());
        return channel?.name || m.common.unknownChannel();
    }

    function truncateUrl(url: string, maxLength: number = 50): string {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + "...";
    }

    onMount(() => {
        loadAllFeedData();
    });

    // Tabs configuration
    const tabs = $derived([
        { id: "list", label: m.features.wizardFeedsName(), icon: "fa-newspaper" },
        { id: "add", label: m.feeds.pageTabAdd(), icon: "fa-plus" },
        { id: "stats", label: m.common.statistics(), icon: "fa-chart-bar" }
    ]);

    // Action buttons configuration
    let actionButtons = $derived([
        {
            label: m.common.refresh(),
            icon: "fa-arrows-rotate",
            action: loadAllFeedData,
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
  icon="fa-newspaper"
  statusMessages={statusMessageContent}
  subtitle={m.feeds.pageSubtitle()}
  {tabs}
  title={m.features.wizardFeedsName()}
>

    <!-- Tab Content -->
    {#if activeTab === 'list'}
        <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
            <!-- Feeds List -->
            <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                    <i class="fa-utility-duo fa-regular fa-newspaper"
                       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.feeds.pageListTitle({ count: feeds.length })}</h2>
                </div>

                <div class="space-y-3">
                    {#if feeds.length === 0}
                        <div class="text-center py-8">
                            <i class="fa-utility-duo fa-regular fa-newspaper"
                               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">{m.feeds.pageListEmptyTitle()}</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                {m.feeds.pageListEmptyHint()}
                            </p>
                        </div>
                    {:else}
                        {#each feeds as feed}
                            <div class="rounded-xl border p-4 transition-all"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                                <div class="flex items-start justify-between mb-3">
                                    <div class="flex items-start gap-3 flex-1">
                                        <i class="fa-utility-duo fa-regular fa-newspaper mt-1"
                                           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                                        <div class="flex-1 min-w-0">
                                            <div class="font-semibold mb-1" style="color: {$colorStore.text}">
                                                #{getChannelName(feed.channelId)}
                                            </div>
                                            <div class="text-sm mb-2 break-all" style="color: {$colorStore.muted}">
                                                <i class="fa-solid fa-link inline mr-1" style="font-size: 12px;"></i>
                                                {truncateUrl(feed.url)}
                                            </div>
                                            <div class="text-xs" style="color: {$colorStore.muted}">
                                                {m.feeds.pageFeedAdded({ date: formatDate(feed.dateAdded) })}
                                            </div>
                                        </div>
                                    </div>
                                    <button aria-label={m.feeds.pageFeedDeleteAria()}
                                            class="p-2 rounded-lg transition-all hover:scale-110"
                                            style="background: #ef444420; color: #ef4444;"
                                            onclick={() => removeFeed(feed.index)}
                                    >
                                        <i class="fa-solid fa-circle-xmark" style="font-size: 16px;"></i>
                                    </button>
                                </div>

                                {#if editingFeed === feed.id}
                                    <div class="space-y-3 border-t pt-3" style="border-color: {$colorStore.primary}20;">
                                        <textarea
                                                bind:value={editMessage}
                                                oninput={() => saveFeedMessage(feed)}
                                                onblur={() => autoSave.flush(messageKey(feed.id))}
                                                onkeydown={(e) => { if (e.key === "Escape") revertFeedMessage(feed); }}
                                                aria-label={m.feeds.pageEditMessageAria()}
                                                readonly={saving}
                                                placeholder={m.feeds.pageEditMessagePlaceholder()}
                                                rows="2"
                                                class="w-full p-3 rounded-xl border resize-none text-sm"
                                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        ></textarea>
                                        <div class="flex gap-2">
                                            <button
                                              aria-label={m.common.doneEditing()}
                                              class="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                                                    style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                                                    onclick={() => finishEditing(feed)}
                                            >
                                                {m.common.done()}
                                            </button>
                                        </div>
                                    </div>
                                {:else if feed.message}
                                    {@const preview = parseStoredMessage(feed.message)}
                                    <div class="border-t pt-3" style="border-color: {$colorStore.primary}20;">
                                        <div class="text-sm p-2 rounded-lg" style="background: {$colorStore.primary}05; color: {$colorStore.text}">
                                            <PreviewCard
                                                content={preview.content}
                                                embeds={preview.embeds}
                                                componentRows={preview.componentRows}
                                                guildId={$currentGuild?.id}
                                                showEmpty={false}
                                            />
                                        </div>
                                    </div>
                                {/if}

                                {#if editingFeed !== feed.id}
                                    <button
                                      class="mt-2 text-sm px-3 py-1 rounded-lg transition-all hover:scale-[1.02]"
                                            style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                            onclick={() => startEditing(feed)}
                                    >
                                        {feed.message ? m.feeds.pageEditMessage() : m.feeds.pageAddMessage()}
                                    </button>
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>

    {:else if activeTab === 'add'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <!-- Add New Feed -->
            <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                    <i class="fa-utility-duo fa-regular fa-circle-plus" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.feeds.pageAddAria()}</h2>
                </div>

                <div class="space-y-4">
                    <div>
                        <span id="channel-label" class="block text-sm font-medium mb-2"
                              style="color: {$colorStore.text}">
                            <i class="fa-solid fa-hashtag inline mr-1" style="font-size: 14px;"></i>
                            {m.common.channel()}
                        </span>
                        <DiscordSelector
                                type="channel"
                                options={guildChannels}
                                selected={newFeed.channelId}
                                placeholder={m.common.selectChannelPlaceholder()}
                                onchange={(detail) => {
                                    newFeed.channelId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null;
                                }}
                        />
                    </div>

                    <div>
                        <label for="input-8024" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text}">
                            <i class="fa-solid fa-globe inline mr-1" style="font-size: 14px;"></i>
                            {m.feeds.pageAddUrlLabel()}
                        </label>
                        <input id="input-8024"
                                type="url"
                                bind:value={newFeed.url}
                                placeholder="https://example.com/feed.xml"
                                class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        >
                        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                            {m.feeds.pageAddUrlHint()}
                        </p>
                    </div>

                  <button aria-label={m.feeds.pageAddAria()}
                          aria-busy={saving}
                          class="flex items-center justify-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                            onclick={addFeed}
                            disabled={saving || !newFeed.channelId || !newFeed.url.trim()}
                    >
                    <i class="fa-solid fa-plus {saving ? 'fa-spin' : ''}" style="font-size: 18px;"></i>
                        {saving ? m.common.adding() : m.feeds.pageAddAria()}
                    </button>
                </div>
            </div>
        </div>

    {:else if activeTab === 'stats'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            {#if feedStats}
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <StatCard
                      icon="fa-newspaper"
                            label={m.feeds.pageStatTotal()}
                            value={feedStats.totalFeeds}
                            subtitle={m.feeds.pageStatTotalSub()}
                            iconColor="primary"
                            animationDelay={0}
                    />

                    <StatCard
                            icon="fa-list-numeric"
                            label={m.feeds.pageStatUnique()}
                            value={feedUrls.length}
                            subtitle={m.feeds.pageStatUniqueSub()}
                            iconColor="secondary"
                            animationDelay={100}
                    />

                    <StatCard
                            icon="fa-globe"
                            label={m.common.channels()}
                            value={Object.keys(feedStats.feedsByChannel).length}
                            subtitle={m.feeds.pageStatChannelsSub()}
                            iconColor="accent"
                            animationDelay={200}
                    />
                </div>

                <!-- Feeds by Channel -->
                {#if Object.keys(feedStats.feedsByChannel).length > 0}
                    <div class="mt-6  rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
                         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                                border-color: {$colorStore.primary}30;">
                        <div class="flex items-center gap-3 mb-6">
                            <i class="fa-utility-duo fa-regular fa-newspaper"
                               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.feeds.pageByChannelTitle()}</h2>
                        </div>

                        <div class="space-y-2">
                            {#each Array.isArray(feedStats.feedsByChannel) ? feedStats.feedsByChannel : Object.entries(feedStats.feedsByChannel).map(([channelId, count]) => ({
                                channelId,
                                count
                            })) as item}
                                {@const
                                  channelIdStr = typeof item.channelId === 'bigint' ? item.channelId.toString() : String(item.channelId)}
                                {@const
                                  countNum = typeof item.count === 'bigint' ? Number(item.count) : Number(item.count)}
                                {@const channel = guildChannels.find(c => c.id === channelIdStr)}
                                <div class="flex items-center justify-between p-3 rounded-lg"
                                     style="background: {$colorStore.primary}08;">
                                    <span style="color: {$colorStore.text}">
                                        #{channel?.name || m.common.unknownChannel()}
                                    </span>
                                    <span class="font-semibold" style="color: {$colorStore.primary}">
                                        {countNum === 1 ? m.feeds.pageByChannelCountOne({ count: countNum }) : m.feeds.pageByChannelCountOther({ count: countNum })}
                                    </span>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            {:else}
                <div class="text-center py-12">
                    <i class="fa-utility-duo fa-regular fa-chart-simple" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 64px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                    <h3 class="text-xl font-semibold mb-2" style="color: {$colorStore.text}">{m.common.noStatisticsAvailable()}</h3>
                    <p style="color: {$colorStore.muted}">
                        {m.feeds.pageStatsEmptyHint()}
                    </p>
                </div>
            {/if}
        </div>
    {/if}
</DashboardPageLayout>
