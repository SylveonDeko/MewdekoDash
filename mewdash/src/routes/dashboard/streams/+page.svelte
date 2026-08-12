<!-- routes/dashboard/streams/+page.svelte -->
<script lang="ts">
  import type { PageData } from "./$types";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { clientApi, type FollowedStream, streamNotificationsApi, StreamType } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import StatCard from "$lib/components/monitoring/StatCard.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import PreviewCard from "$lib/components/specialized/PreviewCard.svelte";
  import { parseStoredMessage, serializeMessage, toBuilderValue } from "$lib/utils/embedMessage";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // Component state
  let loading = $state(false);
  let saving = $state(false);
  let message = $state("");
  let messageType: "success" | "error" | "info" = $state("info");

  // Data state
  let streams: FollowedStream[] = $state([]);
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
  let editingMessageType: "online" | "offline" = $state("online");

  // Embed builder state - unified objects for FullscreenEmbedBuilder
  let globalMessage: any = $state({});
  let streamOnlineMessage: any = $state({});
  let streamOfflineMessage: any = $state({});

  // UI state
  let activeTab = $state("list");

  const platformTypes: Record<number, { name: string; color: string; faIcon: string; faClass: string }> = {
    [StreamType.Twitch]: { name: "Twitch", color: "#9146FF", faIcon: "fa-twitch", faClass: "fa-brands" },
    [StreamType.YouTube]: { name: "YouTube", color: "#FF0000", faIcon: "fa-youtube", faClass: "fa-brands" },
    [StreamType.Trovo]: { name: "Trovo", color: "#1DB954", faIcon: "fa-video", faClass: "fa-solid" },
    [StreamType.Picarto]: { name: "Picarto", color: "#1DA362", faIcon: "fa-palette", faClass: "fa-solid" },
    [StreamType.Kick]: { name: "Kick", color: "#53FC18", faIcon: "fa-video", faClass: "fa-solid" }
  };

  // Stream-specific placeholders (from backend CreateStreamReplacer)
  const streamPlaceholders = [
    { category: "Stream", name: "%stream.name%", description: "Display name of the streamer" },
    { category: "Stream", name: "%stream.username%", description: "Login name/username" },
    { category: "Stream", name: "%stream.url%", description: "Direct URL to the stream" },
    { category: "Stream", name: "%stream.title%", description: "Current stream title" },
    { category: "Stream", name: "%stream.game%", description: "Game/category being streamed" },
    { category: "Stream", name: "%stream.viewers%", description: "Current viewer count (- if offline)" },
    { category: "Stream", name: "%stream.platform%", description: "Platform name (Twitch, YouTube, etc.)" },
    { category: "Stream", name: "%stream.avatar%", description: "URL to streamer's avatar" },
    { category: "Stream", name: "%stream.preview%", description: "URL to stream preview/thumbnail" },
    { category: "Stream", name: "%stream.status%", description: "🟢 Online or 🔴 Offline" },
    { category: "Stream", name: "%stream.channelid%", description: "Platform-specific channel ID" }
  ];

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
      globalMessage = toBuilderValue(messageData);
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


  // Update single stream message (online or offline)
  async function updateSingleStreamMessage(id: number, type: "online" | "offline") {
    if (!$currentGuild?.id) return;

    saving = true;
    try {
      if (type === "online") {
        const messageToSend = serializeMessage(streamOnlineMessage) || null;
        await streamNotificationsApi.setStreamOnlineMessage($currentGuild.id, id, messageToSend);
        showMessage("Online message saved!", "success");
      } else {
        const messageToSend = serializeMessage(streamOfflineMessage) || null;
        await streamNotificationsApi.setStreamOfflineMessage($currentGuild.id, id, messageToSend);
        showMessage("Offline message saved!", "success");
      }

      await loadAllStreamData();
    } catch (err) {
      logger.error("Failed to update stream message:", err);
      showMessage("Failed to save message", "error");
    } finally {
      saving = false;
    }
  }

  // Save global custom message
  async function saveCustomMessage() {
    if (!$currentGuild?.id) return;

    saving = true;
    try {
      const messageToSend = serializeMessage(globalMessage) || null;
      await streamNotificationsApi.setCustomStreamMessage($currentGuild.id, messageToSend);
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
    editingStream = stream.index;
    editingMessageType = "online";

    streamOnlineMessage = toBuilderValue(stream.onlineMessage);
    streamOfflineMessage = toBuilderValue(stream.offlineMessage);
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
    return platformTypes[type] || {
      name: "Unknown",
      color: $colorStore.muted,
      faIcon: "fa-circle-question",
      faClass: "fa-solid"
    };
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

  // Reset editing state when switching contexts
  $effect(() => {
    // When activeTab changes, reset all editing state
    if (activeTab) {
      // If not on the list tab, clear stream editing
      if (activeTab !== "list") {
        editingStream = null;
      }
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
  subtitle="Track Twitch, YouTube, Kick, Trovo & Picarto streams"
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
              class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all hover:scale-[1.02]"
              style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
              onclick={clearAllStreams}
            >
              <i class="fa-solid fa-trash inline mr-1" style="font-size: 12px sm:14px;"></i>
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
                      <i class="{platform.faClass} {platform.faIcon}"
                         style="color: {platform.color}; font-size: 20px;"></i>
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
                          class="p-1.5 sm:p-2 rounded-lg transition-all hover:scale-110"
                          style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                          onclick={() => unfollowStream(stream.index)}
                  >
                    <i class="fa-solid fa-circle-xmark" style="font-size: 14px sm:16px;"></i>
                  </button>
                </div>

                {#if editingStream === stream.index}
                  <div class="border-t pt-3 space-y-3" style="border-color: {$colorStore.primary}20;">
                    <!-- Message Type Toggle -->
                    <div class="flex gap-1 sm:gap-2">
                      <button
                        class="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium"
                        style="background: {editingMessageType === 'online' ? $colorStore.primary : $colorStore.muted}20; color: {editingMessageType === 'online' ? $colorStore.primary : $colorStore.muted}; border: 1px solid {editingMessageType === 'online' ? $colorStore.primary : $colorStore.muted}30;"
                        onclick={() => editingMessageType = 'online'}
                      >
                        <i class="fa-solid fa-circle-check inline mr-1"
                           style="color: #57F287; font-size: 10px;"></i>
                        <span class="hidden sm:inline">Online</span>
                        <span class="sm:hidden">On</span>
                      </button>
                      <button
                        class="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium"
                        style="background: {editingMessageType === 'offline' ? $colorStore.primary : $colorStore.muted}20; color: {editingMessageType === 'offline' ? $colorStore.primary : $colorStore.muted}; border: 1px solid {editingMessageType === 'offline' ? $colorStore.primary : $colorStore.muted}30;"
                        onclick={() => editingMessageType = 'offline'}
                      >
                        <i class="fa-solid fa-circle-xmark inline mr-1"
                           style="color: #ED4245; font-size: 10px;"></i>
                        <span class="hidden sm:inline">Offline</span>
                        <span class="sm:hidden">Off</span>
                      </button>
                    </div>

                    <!-- Online Message Editor -->
                    {#if editingMessageType === 'online'}
                      <FullscreenEmbedBuilder
                        bind:value={streamOnlineMessage}
                        previewTitle="Online Message"
                        previewDescription="Message sent when stream goes online"
                        icon="fa-circle-check"
                        allowContent={true}
                        allowMultipleEmbeds={true}
                        maxEmbeds={10}
                        allowComponents={true}
                        additionalPlaceholders={streamPlaceholders}
                        guildId={$currentGuild?.id}
                        user={data.user}
                      />
                    {/if}

                    <!-- Offline Message Editor -->
                    {#if editingMessageType === 'offline'}
                      <FullscreenEmbedBuilder
                        bind:value={streamOfflineMessage}
                        previewTitle="Offline Message"
                        previewDescription="Message sent when stream goes offline"
                        icon="fa-circle-xmark"
                        allowContent={true}
                        allowMultipleEmbeds={true}
                        maxEmbeds={10}
                        allowComponents={true}
                        additionalPlaceholders={streamPlaceholders}
                        guildId={$currentGuild?.id}
                        user={data.user}
                      />
                    {/if}

                    <!-- Save Buttons -->
                    <div class="flex gap-2">
                      <button
                        class="flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                        onclick={() => updateSingleStreamMessage(stream.index, editingMessageType)}
                        disabled={saving}
                      >
                        <i class="fa-solid fa-floppy-disk inline mr-1" style="font-size: 10px;"></i>
                        Save
                      </button>
                      <button
                        class="flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium"
                        style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                        onclick={() => editingStream = null}
                      >
                        <i class="fa-solid fa-xmark inline mr-1" style="font-size: 10px;"></i>
                        Cancel
                      </button>
                    </div>
                  </div>
                {:else}
                  {#if stream.onlineMessage || stream.offlineMessage}
                    <div class="border-t pt-3 space-y-2" style="border-color: {$colorStore.primary}20;">
                      {#if stream.onlineMessage}
                        {@const onlinePreview = parseStoredMessage(stream.onlineMessage)}
                        <div class="text-sm p-2 rounded-lg"
                             style="background: {$colorStore.primary}10; color: {$colorStore.text}">
                          <i class="fa-solid fa-bell inline mr-1"
                             style="color: {$colorStore.primary}; font-size: 12px;"></i>
                          <PreviewCard
                            content={onlinePreview.content}
                            embeds={onlinePreview.embeds}
                            componentRows={onlinePreview.componentRows}
                            guildId={$currentGuild?.id}
                            showEmpty={false}
                          />
                        </div>
                      {/if}
                      {#if stream.offlineMessage}
                        {@const offlinePreview = parseStoredMessage(stream.offlineMessage)}
                        <div class="text-sm p-2 rounded-lg"
                             style="background: {$colorStore.muted}10; color: {$colorStore.text}">
                          <i class="fa-solid fa-bell-slash inline mr-1"
                             style="color: {$colorStore.muted}; font-size: 12px;"></i>
                          <PreviewCard
                            content={offlinePreview.content}
                            embeds={offlinePreview.embeds}
                            componentRows={offlinePreview.componentRows}
                            guildId={$currentGuild?.id}
                            showEmpty={false}
                          />
                        </div>
                      {/if}
                    </div>
                  {/if}

                  <button
                    class="mt-2 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-lg transition-all hover:scale-[1.02]"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                    onclick={() => startEditing(stream)}
                  >
                    <i class="fa-solid fa-pen-to-square inline mr-1" style="font-size: 10px;"></i>
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
              Supports: Twitch, YouTube, Kick, Trovo, and Picarto
            </p>
          </div>

          <button
            class="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-medium transition-all hover:scale-[1.02]"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            onclick={followStream}
            disabled={saving || !newStream.channelId || !newStream.url.trim()}
          >
            <i class="fa-solid fa-plus" style="font-size: 16px sm:20px;"></i>
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
            <label for="f-+page-global-stream-message-603" class="block text-sm font-medium mb-3"
                   style="color: {$colorStore.text}">
              <i class="fa-solid fa-message inline mr-1" style="font-size: 14px;"></i>
              Global Stream Message
            </label>

            <FullscreenEmbedBuilder id="f-+page-global-stream-message-603"
              bind:value={globalMessage}
              previewTitle="Global Stream Message"
              previewDescription="Default message for all stream notifications"
              icon="fa-message"
              allowContent={true}
              allowMultipleEmbeds={true}
              maxEmbeds={10}
              allowComponents={true}
              additionalPlaceholders={streamPlaceholders}
              guildId={$currentGuild?.id}
              user={data.user}
            />

            <button
              class="mt-3 px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all hover:scale-[1.02]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={saveCustomMessage}
              disabled={saving}
            >
              <i class="fa-solid fa-floppy-disk inline mr-1" style="font-size: 12px sm:14px;"></i>
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
                {@const streamCount = typeof count === 'number' ? count : parseInt(String(count)) || 0}
                <div class="flex items-center justify-between p-3 rounded-lg"
                     style="background: {$colorStore.primary}08;">
                  <div class="flex items-center gap-2">
                    <i class="{platform.faClass} {platform.faIcon}"
                       style="color: {platform.color}; font-size: 18px;"></i>
                    <span style="color: {$colorStore.text}">{platform.name}</span>
                  </div>
                  <span class="font-semibold" style="color: {platform.color}">
                                        {streamCount} stream{streamCount !== 1 ? 's' : ''}
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
