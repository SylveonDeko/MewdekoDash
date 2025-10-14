<!-- routes/dashboard/streams/+page.svelte -->
<script lang="ts">
    import {onMount} from "svelte";
    import {fade, fly} from "svelte/transition";
    import {colorStore} from "$lib/stores/colorStore";
    import {currentGuild} from "$lib/stores/currentGuild";
    import { streamNotificationsApi, clientApi, type FollowedStream, StreamType } from "$lib/api/index.ts";
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
    let streams: FollowedStream[] = $state([]);
    let customMessage: string = $state("");
    let offlineNotifications: boolean = $state(false);
    let stats: any | null = $state(null);
    let streamers: any[] = $state([]);
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

    const platformTypes: Record<number, { name: string; color: string; icon: string }> = {
      [StreamType.Twitch]: { name: "Twitch", color: $colorStore.primary, icon: "🟣" },
      [StreamType.YouTube]: { name: "YouTube", color: $colorStore.accent, icon: "🔴" },
      [StreamType.Trovo]: { name: "Trovo", color: $colorStore.secondary, icon: "🟢" },
      [StreamType.Facebook]: { name: "Facebook", color: $colorStore.primary, icon: "🔵" }
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
              streamNotificationsApi.getFollowedStreams($currentGuild.id).catch(() => []),
              streamNotificationsApi.getCustomStreamMessage($currentGuild.id).catch(() => ""),
              streamNotificationsApi.getOfflineNotificationSetting($currentGuild.id).catch(() => false),
              streamNotificationsApi.getStreamStats($currentGuild.id).catch(() => null),
              streamNotificationsApi.getUniqueStreamers($currentGuild.id).catch(() => []),
              clientApi.getTextChannels($currentGuild.id).catch(() => [])
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
          const result = await streamNotificationsApi.followStream($currentGuild.id, {
            channelId: BigInt(newStream.channelId),
            url: newStream.url
          });
          showMessage(`Now following stream!`, "success");
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
    async function unfollowStream(id: number) {
        if (!$currentGuild?.id) return;
        if (!confirm("Are you sure you want to stop following this stream?")) return;

        saving = true;
        try {
          await streamNotificationsApi.unfollowStream($currentGuild.id, id);
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
          const result = await streamNotificationsApi.clearAllStreams($currentGuild.id);
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
    async function updateStreamMessages(id: number) {
        if (!$currentGuild?.id) return;

        saving = true;
        try {
            const promises = [];

            if (editForm.onlineMessage) {
              promises.push(streamNotificationsApi.setStreamOnlineMessage($currentGuild.id, id, editForm.onlineMessage));
            }

            if (editForm.offlineMessage) {
              promises.push(streamNotificationsApi.setStreamOfflineMessage($currentGuild.id, id, editForm.offlineMessage));
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
          await streamNotificationsApi.setCustomStreamMessage($currentGuild.id, customMessage);
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
          await streamNotificationsApi.toggleOfflineNotifications($currentGuild.id);
            await loadAllStreamData();
        } catch (err) {
            logger.error("Failed to toggle offline notifications:", err);
            showMessage("Failed to toggle notifications", "error");
        } finally {
            saving = false;
        }
    }

    // Start editing
    function startEditing(stream: FollowedStream) {
      editingStream = stream.id;
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

    function formatDate(dateString: string | null): string {
      if (!dateString) return "Unknown";
      return new Date(dateString).toLocaleDateString();
    }

    function getPlatformInfo(type: StreamType) {
      return platformTypes[type] || { name: "Unknown", color: $colorStore.muted, icon: "❓" };
    }

    function getChannelName(channelId: bigint): string {
      const channel = guildChannels.find(c => c.id === channelId.toString());
      return channel ? channel.name : "Unknown Channel";
    }

    function handleNewStreamChannelChange(detail: any) {
      newStream.channelId = detail.selected;
      newStream = { ...newStream };
    }

    onMount(() => {
        loadAllStreamData();
    });

    $effect(() => {
      if ($currentGuild) {
        loadAllStreamData();
      }
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
        <i class="fa-utility-duo fa-regular fa-circle-xmark"
           style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
      {:else}
        <i class="fa-utility-duo fa-regular fa-circle-exclamation"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
      {/if}
      <span
        style="color: {messageType === 'success' ? $colorStore.primary : messageType === 'error' ? $colorStore.accent : $colorStore.primary}">{message}</span>
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  bind:activeTab
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-radio"
  statusMessages={statusMessages}
  subtitle="Track Twitch, YouTube, Trovo & Facebook streams"
  {tabs}
  title="Stream Notifications"
>

    {#if activeTab === 'list'}
      <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
        <div class="rounded-2xl border p-6 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                      <i class="fa-utility-duo fa-regular fa-radio"
                         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Followed Streams ({streams.length})</h2>
                    </div>
                    {#if streams.length > 0}
                        <button
                          class="px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]"
                          style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
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
                             style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
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
                                              #{getChannelName(stream.channelId)} • Added {formatDate(stream.dateAdded)}
                                            </div>
                                        </div>
                                    </div>
                                  <button aria-label="Delete"
                                            class="p-2 rounded-lg transition-all hover:scale-110"
                                          style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                                          onclick={() => unfollowStream(stream.id)}
                                    >
                                    <i class="fa-solid fa-circle-xmark" style="font-size: 16px;"></i>
                                    </button>
                                </div>

                              {#if editingStream === stream.id}
                                    <div class="space-y-3 border-t pt-3" style="border-color: {$colorStore.primary}20;">
                                        <div>
                                          <label for="online-message-{stream.id}" class="block text-sm font-medium mb-2"
                                                 style="color: {$colorStore.text}">
                                                Online Message
                                            </label>
                                            <textarea
                                              id="online-message-{stream.id}"
                                                    bind:value={editForm.onlineMessage}
                                                    placeholder="Custom online message..."
                                                    rows="2"
                                                    class="w-full p-3 rounded-xl border resize-none text-sm"
                                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                            ></textarea>
                                        </div>
                                        <div>
                                          <label for="offline-message-{stream.id}"
                                                 class="block text-sm font-medium mb-2"
                                                 style="color: {$colorStore.text}">
                                                Offline Message
                                            </label>
                                            <textarea
                                              id="offline-message-{stream.id}"
                                                    bind:value={editForm.offlineMessage}
                                                    placeholder="Custom offline message..."
                                                    rows="2"
                                                    class="w-full p-3 rounded-xl border resize-none text-sm"
                                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                            ></textarea>
                                        </div>
                                        <div class="flex gap-2">
                                            <button
                                              class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                                              style="background: {$colorStore.primary}; color: {$colorStore.text};"
                                              onclick={() => updateStreamMessages(stream.id)}
                                                    disabled={saving}
                                            >
                                                Save
                                            </button>
                                            <button
                                              class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
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
                                              <div class="text-sm p-2 rounded-lg"
                                                   style="background: {$colorStore.primary}10; color: {$colorStore.text}">
                                                  <i class="fa-solid fa-bell inline mr-1"
                                                     style="color: {$colorStore.primary}; font-size: 12px;"></i>
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
                                      class="mt-2 text-sm px-3 py-1 rounded-lg transition-all hover:scale-[1.02]"
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
          <div class="rounded-2xl border p-6 shadow-2xl"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                  <i class="fa-utility-duo fa-regular fa-plus"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Follow Stream</h2>
                </div>

                <div class="space-y-4">
                    <div>
                        <span class="block text-sm font-medium mb-2"
                              style="color: {$colorStore.text}">
                            <i class="fa-solid fa-hashtag inline mr-1" style="font-size: 14px;"></i>
                            Notification Channel
                        </span>
                        <DiscordSelector
                                type="channel"
                                options={guildChannels}
                                selected={newStream.channelId}
                                placeholder="Select channel"
                                onchange={handleNewStreamChannelChange} />
                    </div>

                    <div>
                      <label for="stream-url" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                        <i class="fa-solid fa-globe inline mr-1" style="font-size: 14px;"></i>
                            Stream URL
                        </label>
                      <input id="stream-url"
                                type="url"
                                bind:value={newStream.url}
                                placeholder="https://twitch.tv/username or https://youtube.com/@username"
                             class="w-full p-3 rounded-xl border transition-all"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      >
                        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                            Supports: Twitch, YouTube, Trovo, and Facebook Gaming
                        </p>
                    </div>

                  <button
                    class="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-[1.02]"
                    style="background: {$colorStore.primary}; color: {$colorStore.text};"
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
      <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
        <div class="rounded-2xl border p-6 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
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
                                placeholder="Custom message with placeholders..."
                                rows="3"
                                class="w-full p-3 rounded-xl border resize-none"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        ></textarea>
                        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                          Available placeholders: streamer, platform, url, title, game
                        </p>
                        <button
                          class="mt-3 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
                          style="background: {$colorStore.primary}; color: {$colorStore.text};"
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
                      <button aria-label="Toggle offline notifications"
                                onclick={toggleOfflineNotifications}
                                class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                              style="background: {offlineNotifications ? $colorStore.primary : $colorStore.muted};"
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
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      value={Object.keys(stats.streamsByChannel || {}).length}
                            subtitle="with notifications"
                            iconColor="accent"
                            animationDelay={200}
                    />

                    <StatCard
                      icon="fa-globe"
                            label="Platforms"
                      value={Object.keys(stats.streamsByType || {}).length}
                            subtitle="in use"
                            iconColor="primary"
                            animationDelay={300}
                    />
                </div>

              {#if stats.streamsByType && Object.keys(stats.streamsByType).length > 0}
                <div class="mt-6 rounded-2xl border p-6 shadow-2xl"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
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
                     style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 64px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                    <h3 class="text-xl font-semibold mb-2" style="color: {$colorStore.text}">No Statistics Available</h3>
                    <p style="color: {$colorStore.muted}">
                        Stream statistics will appear here once you follow streamers.
                    </p>
                </div>
            {/if}
        </div>
    {/if}
</DashboardPageLayout>
