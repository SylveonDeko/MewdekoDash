<!-- routes/dashboard/streams/+page.svelte -->
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
    let streams: Array<{
        index: number;
        id: number;
        channelId: bigint;
        username: string;
        type: number;
        typeName: string;
        onlineMessage: string;
        offlineMessage: string;
        dateAdded: string;
        channelName: string;
    }> = $state([]);
    let customMessage: string = $state("");
    let offlineNotifications: boolean = $state(false);
    let stats: {
        totalStreams: number;
        streamsByType: Record<string, number>;
        streamsByChannel: Record<string, number>;
        oldestStream: string | null;
    } | null = $state(null);
    let streamers: Array<{username: string; type: number; typeName: string; followCount: number}> = $state([]);
    let guildChannels: Array<{ id: string; name: string; }> = $state([]);

    // Form data
    let newStream = $state({
        channelId: null as string | null,
        url: ""
    });
    let editingStream: number | null = $state(null);
    let editForm = $state({
        onlineMessage: "",
        offlineMessage: ""
    });

    // UI state
    let activeTab = $state("list");

    const platformTypes = {
        0: { name: "Twitch", color: "#9146FF", icon: "🟣" },
        1: { name: "YouTube", color: "#FF0000", icon: "🔴" },
        2: { name: "Trovo", color: "#20C05C", icon: "🟢" },
        3: { name: "Facebook", color: "#1877F2", icon: "🔵" }
    };

    // Load all stream data
    async function loadAllStreamData() {
        if (!$currentGuild?.id) return;

        loading = true;
        try {
            const [
                streamsData,
                messageData,
                offlineData,
                statsData,
                streamersData,
                channelsData
            ] = await Promise.all([
                api.getStreamNotifications($currentGuild.id).catch(() => []),
                api.getStreamCustomMessage($currentGuild.id).catch(() => ""),
                api.getStreamOfflineNotifications($currentGuild.id).catch(() => false),
                api.getStreamStats($currentGuild.id).catch(() => null),
                api.getStreamers($currentGuild.id).catch(() => []),
                api.getGuildTextChannels($currentGuild.id).catch(() => [])
            ]);

            streams = streamsData;
            customMessage = messageData;
            offlineNotifications = offlineData;
            stats = statsData;
            streamers = streamersData;

            guildChannels = (channelsData || []).map((channel: any) => ({
                id: channel.id.toString(),
                name: channel.name
            }));
        } catch (err) {
            logger.error("Failed to load stream data:", err);
            showMessage("Failed to load stream data", "error");
        } finally {
            loading = false;
        }
    }

    // Follow stream
    async function followStream() {
        if (!$currentGuild?.id || !newStream.channelId || !newStream.url.trim()) return;

        saving = true;
        try {
            const result = await api.followStream($currentGuild.id, BigInt(newStream.channelId), newStream.url);
            showMessage(`Now following ${result.username} on ${result.platform}!`, "success");
            newStream = { channelId: null, url: "" };
            await loadAllStreamData();
        } catch (err) {
            logger.error("Failed to follow stream:", err);
            showMessage("Failed to follow stream", "error");
        } finally {
            saving = false;
        }
    }

    // Unfollow stream
    async function unfollowStream(index: number) {
        if (!$currentGuild?.id) return;
        if (!confirm("Are you sure you want to stop following this stream?")) return;

        saving = true;
        try {
            await api.unfollowStream($currentGuild.id, index);
            showMessage("Stream unfollowed successfully!", "success");
            await loadAllStreamData();
        } catch (err) {
            logger.error("Failed to unfollow stream:", err);
            showMessage("Failed to unfollow stream", "error");
        } finally {
            saving = false;
        }
    }

    // Clear all streams
    async function clearAllStreams() {
        if (!$currentGuild?.id) return;
        if (!confirm("Are you sure you want to unfollow ALL streams? This cannot be undone!")) return;

        saving = true;
        try {
            const result = await api.clearAllStreams($currentGuild.id);
            showMessage(`Removed ${result.removedCount} stream(s)!`, "success");
            await loadAllStreamData();
        } catch (err) {
            logger.error("Failed to clear streams:", err);
            showMessage("Failed to clear streams", "error");
        } finally {
            saving = false;
        }
    }

    // Update stream messages
    async function updateStreamMessages(index: number) {
        if (!$currentGuild?.id) return;

        saving = true;
        try {
            const promises = [];

            if (editForm.onlineMessage) {
                promises.push(api.setStreamOnlineMessage($currentGuild.id, index, editForm.onlineMessage));
            }

            if (editForm.offlineMessage) {
                promises.push(api.setStreamOfflineMessage($currentGuild.id, index, editForm.offlineMessage));
            }

            await Promise.all(promises);
            showMessage("Stream messages updated!", "success");
            editingStream = null;
            editForm = { onlineMessage: "", offlineMessage: "" };
            await loadAllStreamData();
        } catch (err) {
            logger.error("Failed to update stream messages:", err);
            showMessage("Failed to update messages", "error");
        } finally {
            saving = false;
        }
    }

    // Save global custom message
    async function saveCustomMessage() {
        if (!$currentGuild?.id) return;

        saving = true;
        try {
            await api.setStreamCustomMessage($currentGuild.id, customMessage);
            showMessage("Custom message saved!", "success");
        } catch (err) {
            logger.error("Failed to save custom message:", err);
            showMessage("Failed to save message", "error");
        } finally {
            saving = false;
        }
    }

    // Toggle offline notifications
    async function toggleOfflineNotifications() {
        if (!$currentGuild?.id) return;

        saving = true;
        try {
            await api.toggleStreamOfflineNotifications($currentGuild.id);
            await loadAllStreamData();
        } catch (err) {
            logger.error("Failed to toggle offline notifications:", err);
            showMessage("Failed to toggle notifications", "error");
        } finally {
            saving = false;
        }
    }

    // Start editing
    function startEditing(stream: typeof streams[0]) {
        editingStream = stream.index;
        editForm = {
            onlineMessage: stream.onlineMessage || "",
            offlineMessage: stream.offlineMessage || ""
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

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleString();
    }

    function getPlatformInfo(type: number) {
        return platformTypes[type] || { name: "Unknown", color: "#6B7280", icon: "❓" };
    }

    onMount(() => {
        loadAllStreamData();
    });

    // Tabs configuration
    const tabs = [
      { id: "list", label: "Streams", icon: "fa-radio" },
      { id: "add", label: "Follow Stream", icon: "fa-plus" },
      { id: "config", label: "Settings", icon: "fa-gear" },
      { id: "stats", label: "Statistics", icon: "fa-chart-column" }
    ];

    // Action buttons configuration
    let actionButtons = $derived([
        {
            label: "Refresh",
          icon: "fa-arrows-rotate",
            action: loadAllStreamData,
            loading: loading
        }
    ]);

    // Handle tab change
    function handleTabChange(event: CustomEvent) {
        activeTab = event.detail.tabId;
    }
</script>

<DashboardPageLayout
        title="Stream Notifications"
        subtitle="Track Twitch, YouTube, Trovo & Facebook streams"
        icon="fa-radio"
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
                  <i class="fa-utility-duo fa-regular fa-circle-check"
                     style="--fa-primary-color: #10b981; --fa-secondary-color: #059669; font-size: 20px;"></i>
                {:else if messageType === 'error'}
                  <i class="fa-utility-duo fa-regular fa-circle-xmark"
                     style="--fa-primary-color: #ef4444; --fa-secondary-color: #dc2626; font-size: 20px;"></i>
                {:else}
                  <i class="fa-utility-duo fa-regular fa-circle-exclamation"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                {/if}
                <span style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
            </div>
        {/if}
    </svelte:fragment>

    {#if activeTab === 'list'}
        <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
            <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                      <i class="fa-utility-duo fa-regular fa-radio"
                         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Followed Streams ({streams.length})</h2>
                    </div>
                    {#if streams.length > 0}
                        <button
                                class="px-4 py-2 rounded-lg text-sm transition-all hover:scale-105"
                                style="background: #ef444420; color: #ef4444;"
                                onclick={clearAllStreams}
                        >
                          <i class="fa-solid fa-trash inline mr-1" style="font-size: 16px;"></i>
                            Clear All
                        </button>
                    {/if}
                </div>

                <div class="space-y-3">
                    {#if streams.length === 0}
                        <div class="text-center py-8">
                          <i class="fa-utility-duo fa-regular fa-radio"
                             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No Streams Followed</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                Start following streamers to get notifications when they go live!
                            </p>
                        </div>
                    {:else}
                        {#each streams as stream}
                            {@const platform = getPlatformInfo(stream.type)}
                            <div class="rounded-xl border p-4 transition-all"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                                <div class="flex items-start justify-between mb-3">
                                    <div class="flex items-start gap-3 flex-1">
                                        <div class="flex items-center justify-center w-10 h-10 rounded-full"
                                             style="background: {platform.color}20;">
                                            <span class="text-xl">{platform.icon}</span>
                                        </div>
                                        <div class="flex-1">
                                            <div class="font-semibold mb-1" style="color: {$colorStore.text}">
                                                {stream.username}
                                            </div>
                                            <div class="text-sm mb-1" style="color: {platform.color}">
                                                {platform.name}
                                            </div>
                                            <div class="text-xs mb-2" style="color: {$colorStore.muted}">
                                                #{stream.channelName} • Added {formatDate(stream.dateAdded)}
                                            </div>
                                        </div>
                                    </div>
                                  <button aria-label="Delete"
                                            class="p-2 rounded-lg transition-all hover:scale-110"
                                            style="background: #ef444420; color: #ef4444;"
                                            onclick={() => unfollowStream(stream.index)}
                                    >
                                    <i class="fa-solid fa-circle-xmark" style="font-size: 16px;"></i>
                                    </button>
                                </div>

                                {#if editingStream === stream.index}
                                    <div class="space-y-3 border-t pt-3" style="border-color: {$colorStore.primary}20;">
                                        <div>
                                          <label for="input-7271" class="block text-sm font-medium mb-2"
                                                 style="color: {$colorStore.text}">
                                                Online Message
                                            </label>
                                            <textarea
                                                    bind:value={editForm.onlineMessage}
                                                    placeholder="Custom online message..."
                                                    rows="2"
                                                    class="w-full p-3 rounded-xl border resize-none text-sm"
                                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                            ></textarea>
                                        </div>
                                        <div>
                                          <label for="input-7271" class="block text-sm font-medium mb-2"
                                                 style="color: {$colorStore.text}">
                                                Offline Message
                                            </label>
                                            <textarea
                                                    bind:value={editForm.offlineMessage}
                                                    placeholder="Custom offline message..."
                                                    rows="2"
                                                    class="w-full p-3 rounded-xl border resize-none text-sm"
                                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                            ></textarea>
                                        </div>
                                        <div class="flex gap-2">
                                            <button
                                                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                                                    style="background: {$colorStore.primary}; color: white;"
                                                    onclick={() => updateStreamMessages(stream.index)}
                                                    disabled={saving}
                                            >
                                                Save
                                            </button>
                                            <button
                                                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                                                    style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                                                    onclick={() => editingStream = null}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                {:else}
                                    {#if stream.onlineMessage || stream.offlineMessage}
                                        <div class="border-t pt-3 space-y-2" style="border-color: {$colorStore.primary}20;">
                                            {#if stream.onlineMessage}
                                                <div class="text-sm p-2 rounded-lg" style="background: #10b98110; color: {$colorStore.text}">
                                                  <i class="fa-solid fa-bell inline mr-1"
                                                     style="color: #10b981; font-size: 12px;"></i>
                                                    {stream.onlineMessage}
                                                </div>
                                            {/if}
                                            {#if stream.offlineMessage}
                                                <div class="text-sm p-2 rounded-lg" style="background: {$colorStore.muted}10; color: {$colorStore.text}">
                                                  <i class="fa-solid fa-bell-slash inline mr-1"
                                                     style="color: {$colorStore.muted}; font-size: 12px;"></i>
                                                    {stream.offlineMessage}
                                                </div>
                                            {/if}
                                        </div>
                                    {/if}

                                    <button
                                            class="mt-2 text-sm px-3 py-1 rounded-lg transition-all hover:scale-105"
                                            style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                            onclick={() => startEditing(stream)}
                                    >
                                        Customize Messages
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
            <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                  <i class="fa-utility-duo fa-regular fa-plus"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Follow Stream</h2>
                </div>

                <div class="space-y-4">
                    <div>
                        <span id="notification-channel-label" class="block text-sm font-medium mb-2"
                              style="color: {$colorStore.text}">
                            <i class="fa-solid fa-hashtag inline mr-1" style="font-size: 14px;"></i>
                            Notification Channel
                        </span>
                        <DiscordSelector
                                type="channel"
                                options={guildChannels}
                                selected={newStream.channelId}
                                placeholder="Select channel"
                                on:change={(e) => {
                                    newStream.channelId = e.detail.selected;
                                    newStream = { ...newStream };
                                }}
                                aria-labelledby="notification-channel-label" />
                    </div>

                    <div>
                      <label for="input-7271" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                        <i class="fa-solid fa-globe inline mr-1" style="font-size: 14px;"></i>
                            Stream URL
                        </label>
                      <input id="input-7271"
                                type="url"
                                bind:value={newStream.url}
                                placeholder="https://twitch.tv/username or https://youtube.com/@username"
                                class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      >
                        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                            Supports: Twitch, YouTube, Trovo, and Facebook Gaming
                        </p>
                    </div>

                  <button aria-label="Add"
                            class="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-105 min-h-[52px]"
                            style="background: {$colorStore.primary}; color: white;"
                            onclick={followStream}
                            disabled={saving || !newStream.channelId || !newStream.url.trim()}
                    >
                    <i class="fa-solid fa-plus" style="font-size: 20px;"></i>
                        {saving ? "Following..." : "Follow Stream"}
                    </button>
                </div>
            </div>
        </div>

    {:else if activeTab === 'config'}
        <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
            <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                  <i class="fa-utility-duo fa-regular fa-gear"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Global Settings</h2>
                </div>

                <div class="space-y-6">
                    <div>
                      <label for="stream-message" class="block text-sm font-medium mb-2"
                             style="color: {$colorStore.text}">
                        <i class="fa-solid fa-message inline mr-1" style="font-size: 14px;"></i>
                            Global Stream Message
                        </label>
                      <textarea id="stream-message"
                                bind:value={customMessage}
                                placeholder="{`{streamer} is now live on {platform}! {url}`}"
                                rows="3"
                                class="w-full p-3 rounded-xl border resize-none"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        ></textarea>
                        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                            Available placeholders: {`{streamer}`, `{platform}`, `{url}`, `{title}`, `{game}`}
                        </p>
                        <button
                                class="mt-3 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                                style="background: {$colorStore.primary}; color: white;"
                                onclick={saveCustomMessage}
                                disabled={saving}
                        >
                            Save Message
                        </button>
                    </div>

                    <div class="flex items-center justify-between p-4 rounded-xl"
                         style="background: {$colorStore.primary}08;">
                        <div>
                            <div class="font-medium mb-1" style="color: {$colorStore.text}">
                                Offline Notifications
                            </div>
                            <div class="text-sm" style="color: {$colorStore.muted}">
                                Send notifications when streams go offline
                            </div>
                        </div>
                      <button aria-label="Delete"
                                onclick={toggleOfflineNotifications}
                                class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                                style="background: {offlineNotifications ? $colorStore.primary : '#64748b'};"
                        >
                            <span class="inline-block w-4 h-4 transform transition-transform bg-white rounded-full"
                                  style="transform: translateX({offlineNotifications ? '1.5rem' : '0.25rem'})"></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

    {:else if activeTab === 'stats'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            {#if stats}
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                    <StatCard
                      icon="fa-radio"
                            label="Total Streams"
                            value={stats.totalStreams}
                            subtitle="being tracked"
                            iconColor="primary"
                            animationDelay={0}
                    />

                    <StatCard
                      icon="fa-video"
                            label="Unique Streamers"
                            value={streamers.length}
                            subtitle="followed"
                            iconColor="secondary"
                            animationDelay={100}
                    />

                    <StatCard
                      icon="fa-hashtag"
                            label="Channels"
                            value={Object.keys(stats.streamsByChannel).length}
                            subtitle="with notifications"
                            iconColor="accent"
                            animationDelay={200}
                    />

                    <StatCard
                      icon="fa-globe"
                            label="Platforms"
                            value={Object.keys(stats.streamsByType).length}
                            subtitle="in use"
                            iconColor="primary"
                            animationDelay={300}
                    />
                </div>

                {#if Object.keys(stats.streamsByType).length > 0}
                    <div class="mt-6 backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
                         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                                border-color: {$colorStore.primary}30;">
                        <div class="flex items-center gap-3 mb-6">
                          <i class="fa-utility-duo fa-regular fa-chart-line"
                             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Streams by Platform</h2>
                        </div>

                        <div class="space-y-2">
                            {#each Object.entries(stats.streamsByType) as [type, count]}
                                {@const platform = getPlatformInfo(parseInt(type))}
                                <div class="flex items-center justify-between p-3 rounded-lg"
                                     style="background: {$colorStore.primary}08;">
                                    <div class="flex items-center gap-2">
                                        <span class="text-lg">{platform.icon}</span>
                                        <span style="color: {$colorStore.text}">{platform.name}</span>
                                    </div>
                                    <span class="font-semibold" style="color: {platform.color}">
                                        {count} stream{count !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            {:else}
                <div class="text-center py-12">
                  <i class="fa-utility-duo fa-regular fa-chart-column"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 64px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                    <h3 class="text-xl font-semibold mb-2" style="color: {$colorStore.text}">No Statistics Available</h3>
                    <p style="color: {$colorStore.muted}">
                        Stream statistics will appear here once you follow streamers.
                    </p>
                </div>
            {/if}
        </div>
    {/if}
</DashboardPageLayout>
