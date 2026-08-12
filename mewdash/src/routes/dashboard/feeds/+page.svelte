<!-- routes/dashboard/feeds/+page.svelte -->
<script lang="ts">
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
            showMessage("Failed to load feed data", "error");
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
            showMessage("RSS feed added successfully!", "success");
            newFeed = { channelId: null, url: "" };
            await loadAllFeedData();
        } catch (err) {
            logger.error("Failed to add feed:", err);
            showMessage("Failed to add feed", "error");
        } finally {
            saving = false;
        }
    }

    // Update feed message
    async function updateFeedMessage(index: number) {
        if (!$currentGuild?.id) return;

        saving = true;
        try {
            await feedsApi.setFeedMessage($currentGuild.id, index, editMessage);
            showMessage("Feed message updated!", "success");
            editingFeed = null;
            editMessage = "";
            await loadAllFeedData();
        } catch (err) {
            logger.error("Failed to update feed message:", err);
            showMessage("Failed to update message", "error");
        } finally {
            saving = false;
        }
    }

    // Remove feed
    async function removeFeed(index: number) {
        if (!$currentGuild?.id) return;
        if (!confirm("Are you sure you want to remove this RSS feed?")) return;

        saving = true;
        try {
            await feedsApi.removeFeed($currentGuild.id, index);
            showMessage("Feed removed successfully!", "success");
            await loadAllFeedData();
        } catch (err) {
            logger.error("Failed to remove feed:", err);
            showMessage("Failed to remove feed", "error");
        } finally {
            saving = false;
        }
    }

    // Start editing
    function startEditing(feed: FeedSub) {
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
        if (!dateString) return "Unknown";
        return new Date(dateString).toLocaleString();
    }

    function getChannelName(channelId: bigint): string {
        const channel = guildChannels.find(c => c.id === channelId.toString());
        return channel?.name || "Unknown Channel";
    }

    function truncateUrl(url: string, maxLength: number = 50): string {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + "...";
    }

    onMount(() => {
        loadAllFeedData();
    });

    // Tabs configuration
    const tabs = [
        { id: "list", label: "RSS Feeds", icon: "fa-newspaper" },
        { id: "add", label: "Add Feed", icon: "fa-plus" },
        { id: "stats", label: "Statistics", icon: "fa-chart-bar" }
    ];

    // Action buttons configuration
    let actionButtons = $derived([
        {
            label: "Refresh",
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
{/snippet}

<DashboardPageLayout
  {actionButtons}
  bind:activeTab
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-newspaper"
  statusMessages={statusMessageContent}
  subtitle="Manage RSS feed subscriptions"
  {tabs}
  title="RSS Feeds"
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
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">RSS Feeds ({feeds.length})</h2>
                </div>

                <div class="space-y-3">
                    {#if feeds.length === 0}
                        <div class="text-center py-8">
                            <i class="fa-utility-duo fa-regular fa-newspaper"
                               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No RSS Feeds</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                Add RSS feeds to automatically post updates to your channels.
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
                                                Added: {formatDate(feed.dateAdded)}
                                            </div>
                                        </div>
                                    </div>
                                    <button aria-label="Delete feed"
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
                                                placeholder="Custom message (optional)"
                                                rows="2"
                                                class="w-full p-3 rounded-xl border resize-none text-sm"
                                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        ></textarea>
                                        <div class="flex gap-2">
                                            <button
                                              aria-label="Save feed message"
                                              aria-busy={saving}
                                              class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] min-h-[44px] focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                                              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                                              onclick={() => updateFeedMessage(feed.index)}
                                                    disabled={saving}
                                            >
                                              <i class="fa-solid fa-floppy-disk {saving ? 'fa-spin' : ''}"
                                                 style="font-size: 16px;"></i>
                                              {saving ? "Saving..." : "Save"}
                                            </button>
                                            <button
                                              aria-label="Cancel editing"
                                              class="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                                                    style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                                                    onclick={() => editingFeed = null}
                                            >
                                                Cancel
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
                                        {feed.message ? "Edit Message" : "Add Custom Message"}
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
                    <i class="fa-utility-duo fa-regular fa-plus" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Add RSS Feed</h2>
                </div>

                <div class="space-y-4">
                    <div>
                        <span id="channel-label" class="block text-sm font-medium mb-2"
                              style="color: {$colorStore.text}">
                            <i class="fa-solid fa-hashtag inline mr-1" style="font-size: 14px;"></i>
                            Channel
                        </span>
                        <DiscordSelector
                                type="channel"
                                options={guildChannels}
                                selected={newFeed.channelId}
                                placeholder="Select channel"
                                onchange={(detail) => {
                                    newFeed.channelId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null;
                                }}
                        />
                    </div>

                    <div>
                        <label for="input-8024" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text}">
                            <i class="fa-solid fa-globe inline mr-1" style="font-size: 14px;"></i>
                            RSS Feed URL
                        </label>
                        <input id="input-8024"
                                type="url"
                                bind:value={newFeed.url}
                                placeholder="https://example.com/feed.xml"
                                class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        >
                        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                            Enter the full URL to an RSS or Atom feed.
                        </p>
                    </div>

                  <button aria-label="Add RSS Feed"
                          aria-busy={saving}
                          class="flex items-center justify-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                            onclick={addFeed}
                            disabled={saving || !newFeed.channelId || !newFeed.url.trim()}
                    >
                    <i class="fa-solid fa-plus {saving ? 'fa-spin' : ''}" style="font-size: 18px;"></i>
                        {saving ? "Adding..." : "Add RSS Feed"}
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
                            label="Total Feeds"
                            value={feedStats.totalFeeds}
                            subtitle="active subscriptions"
                            iconColor="primary"
                            animationDelay={0}
                    />

                    <StatCard
                            icon="fa-hashtag"
                            label="Unique Feeds"
                            value={feedUrls.length}
                            subtitle="different sources"
                            iconColor="secondary"
                            animationDelay={100}
                    />

                    <StatCard
                            icon="fa-globe"
                            label="Channels"
                            value={Object.keys(feedStats.feedsByChannel).length}
                            subtitle="with feeds"
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
                            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Feeds by Channel</h2>
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
                                        #{channel?.name || `Unknown Channel`}
                                    </span>
                                    <span class="font-semibold" style="color: {$colorStore.primary}">
                                        {countNum} feed{countNum !== 1 ? 's' : ''}
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
                        Feed statistics will appear here once you add RSS feeds.
                    </p>
                </div>
            {/if}
        </div>
    {/if}
</DashboardPageLayout>
