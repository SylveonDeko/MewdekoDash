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
  import EmbedEditor from "$lib/components/specialized/EmbedEditor.svelte";
  import PreviewCard from "$lib/components/specialized/PreviewCard.svelte";
  import ComponentEditor from "$lib/components/specialized/ComponentEditor.svelte";

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
  let editingMessageType: "online" | "offline" = $state("online");
    let editForm = $state({
        onlineMessage: "",
        offlineMessage: ""
    });

  // Embed builder state (arrays for multi-embed support)
  let globalMessageEmbeds = $state<any[]>([{
    title: "",
    description: "",
    color: "#5865F2",
    fields: []
  }]);
  let globalMessageComponents = $state<any[]>([]);

  let streamOnlineEmbeds = $state<any[]>([{
    title: "",
    description: "",
    color: "#57F287",
    fields: []
  }]);
  let streamOnlineComponents = $state<any[]>([]);

  let streamOfflineEmbeds = $state<any[]>([{
    title: "",
    description: "",
    color: "#ED4245",
    fields: []
  }]);
  let streamOfflineComponents = $state<any[]>([]);

  // Component editing state
  let editingComponent: any = $state(null);

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
    { name: "%stream.name%", description: "Display name of the streamer" },
    { name: "%stream.username%", description: "Login name/username" },
    { name: "%stream.url%", description: "Direct URL to the stream" },
    { name: "%stream.title%", description: "Current stream title" },
    { name: "%stream.game%", description: "Game/category being streamed" },
    { name: "%stream.viewers%", description: "Current viewer count (- if offline)" },
    { name: "%stream.platform%", description: "Platform name (Twitch, YouTube, etc.)" },
    { name: "%stream.avatar%", description: "URL to streamer's avatar" },
    { name: "%stream.preview%", description: "URL to stream preview/thumbnail" },
    { name: "%stream.status%", description: "🟢 Online or 🔴 Offline" },
    { name: "%stream.channelid%", description: "Platform-specific channel ID" }
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

  // Embed management functions
  function getActiveEmbeds() {
    if (editingStream !== null) {
      return editingMessageType === "online" ? streamOnlineEmbeds : streamOfflineEmbeds;
    }
    return globalMessageEmbeds;
  }

  function setActiveEmbeds(embeds: any[]) {
    if (editingStream !== null) {
      if (editingMessageType === "online") {
        streamOnlineEmbeds = embeds;
      } else {
        streamOfflineEmbeds = embeds;
      }
    } else {
      globalMessageEmbeds = embeds;
    }
  }

  function addEmbed() {
    const embeds = getActiveEmbeds();
    if (embeds.length >= 10) return; // Discord limit

    const newEmbed = {
      title: "",
      description: "",
      color: "#5865F2",
      fields: []
    };

    setActiveEmbeds([...embeds, newEmbed]);
  }

  function removeEmbed(detail: { index: number }) {
    const embeds = getActiveEmbeds();
    if (embeds.length <= 1) return; // Keep at least one
    setActiveEmbeds(embeds.filter((_, i) => i !== detail.index));
  }

  function duplicateEmbed(detail: { index: number }) {
    const embeds = getActiveEmbeds();
    if (embeds.length >= 10) return;

    const embedToCopy = embeds[detail.index];
    const duplicated = JSON.parse(JSON.stringify(embedToCopy));

    embeds.splice(detail.index + 1, 0, duplicated);
    setActiveEmbeds([...embeds]);
  }

  function updateEmbed(detail: { embed: any; index: number }) {
    const embeds = getActiveEmbeds();
    embeds[detail.index] = detail.embed;
    setActiveEmbeds([...embeds]);
  }

  // Component management functions
  function getActiveComponents() {
    if (editingStream !== null) {
      return editingMessageType === "online" ? streamOnlineComponents : streamOfflineComponents;
    }
    return globalMessageComponents;
  }

  function setActiveComponents(components: any[]) {
    if (editingStream !== null) {
      if (editingMessageType === "online") {
        streamOnlineComponents = components;
      } else {
        streamOfflineComponents = components;
      }
    } else {
      globalMessageComponents = components;
    }
  }

  function addComponentRow() {
    const components = getActiveComponents();
    if (components.length >= 5) return;

    const newRow = {
      componentKey: crypto.randomUUID(),
      rowKey: crypto.randomUUID(),
      components: []
    };

    setActiveComponents([...components, newRow]);
  }

  function removeComponentRow(rowKey: string) {
    const components = getActiveComponents();
    setActiveComponents(components.filter(r => r.rowKey !== rowKey));
  }

  function addComponentToRow(rowKey: string, type: "button" | "select") {
    const components = getActiveComponents();
    const rowIndex = components.findIndex(r => r.rowKey === rowKey);
    if (rowIndex === -1) return;

    const row = components[rowIndex];

    const newComponent = {
      componentKey: crypto.randomUUID(),
      id: null,
      rowIndex: rowIndex,
      displayName: type === "button" ? "New Button" : "Select an option",
      style: type === "button" ? 1 : 0,
      url: "",
      emoji: null,
      isSelect: type === "select",
      maxOptions: 1,
      minOptions: 1,
      options: []
    };

    row.components.push(newComponent);
    setActiveComponents([...components]);
  }

  function handleComponentUpdate(detail: { component: any }) {
    const components = getActiveComponents();
    const updated = components.map(row => ({
      ...row,
      components: row.components.map((c: any) =>
        c.componentKey === detail.component.componentKey ? detail.component : c
      )
    }));
    setActiveComponents(updated);
  }

  function handleComponentRemove(detail: { componentKey: string }) {
    const components = getActiveComponents();
    const updated = components.map(row => ({
      ...row,
      components: row.components.filter((c: any) => c.componentKey !== detail.componentKey)
    }));
    setActiveComponents(updated);
    if (editingComponent?.componentKey === detail.componentKey) {
      editingComponent = null;
    }
  }

  function handleComponentEdit(detail: { component: any }) {
    editingComponent = detail.component;
  }

  function getTotalComponentCount() {
    const components = getActiveComponents();
    return components.reduce((sum, row) => sum + row.components.length, 0);
  }

  // Update single stream message (online or offline)
  async function updateSingleStreamMessage(id: number, type: "online" | "offline") {
        if (!$currentGuild?.id) return;

        saving = true;
        try {
          if (type === "online") {
            const msg = embedsToJson(streamOnlineEmbeds, streamOnlineComponents);
            await streamNotificationsApi.setStreamOnlineMessage($currentGuild.id, id, msg);
            showMessage("Online message saved!", "success");
          } else {
            const msg = embedsToJson(streamOfflineEmbeds, streamOfflineComponents);
            await streamNotificationsApi.setStreamOfflineMessage($currentGuild.id, id, msg);
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

  // Helper: Convert embeds and components to SmartEmbed JSON
  function embedsToJson(embeds: any[], components: any[] = []): string {
    const smartEmbed: any = { embeds: [] };

    // Convert all embeds
    smartEmbed.embeds = embeds.map(embed => {
      const e: any = {};

      if (embed.title) e.title = embed.title;
      if (embed.description) e.description = embed.description;
      if (embed.url) e.url = embed.url;
      if (embed.color) e.color = embed.color;

      if (embed.author?.name) {
        e.author = { name: embed.author.name };
        if (embed.author.url) e.author.url = embed.author.url;
        if (embed.author.icon_url) e.author.icon_url = embed.author.icon_url;
      }

      if (embed.footer?.text) {
        e.footer = { text: embed.footer.text };
        if (embed.footer.icon_url) e.footer.icon_url = embed.footer.icon_url;
      }

      if (embed.thumbnail?.url) e.thumbnail = { url: embed.thumbnail.url };
      if (embed.image?.url) e.image = { url: embed.image.url };
      if (embed.fields && embed.fields.length > 0) {
        e.fields = embed.fields.map((f: any) => ({
          name: f.name || "",
          value: f.value || "",
          inline: f.inline || false
        }));
      }

      return e;
    });

    // Add components if they exist
    if (components && components.length > 0) {
      smartEmbed.components = components;
    }

    return JSON.stringify(smartEmbed, null, 2);
  }

  // Helper: Try to parse message as JSON with embeds
  function tryParseEmbed(message: string | null): {
    isEmbed: boolean;
    embeds?: any[];
    components?: any[];
    text?: string
  } {
    if (!message) return { isEmbed: false };

    try {
      const parsed = JSON.parse(message);
      if (parsed.embeds && Array.isArray(parsed.embeds) && parsed.embeds.length > 0) {
        return {
          isEmbed: true,
          embeds: parsed.embeds,
          components: parsed.components || [],
          text: parsed.plainText || ""
        };
      }
    } catch {
      // Not valid JSON or not a SmartEmbed format
    }

    return { isEmbed: false, text: message || "" };
  }

    // Save global custom message
    async function saveCustomMessage() {
        if (!$currentGuild?.id) return;

        saving = true;
        try {
          const messageToSave = embedsToJson(globalMessageEmbeds, globalMessageComponents);

          await streamNotificationsApi.setCustomStreamMessage($currentGuild.id, messageToSave);
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
      editingMessageType = "online";
      editingComponent = null;

      // Parse online message
      const onlineParsed = tryParseEmbed(stream.onlineMessage);
      if (onlineParsed.isEmbed && onlineParsed.embeds) {
        streamOnlineEmbeds = onlineParsed.embeds;
        streamOnlineComponents = onlineParsed.components || [];
      } else {
        // Initialize with empty embed
        streamOnlineEmbeds = [{
          title: "",
          description: "",
          color: "#57F287",
          fields: []
        }];
        streamOnlineComponents = [];
      }

      // Parse offline message
      const offlineParsed = tryParseEmbed(stream.offlineMessage);
      if (offlineParsed.isEmbed && offlineParsed.embeds) {
        streamOfflineEmbeds = offlineParsed.embeds;
        streamOfflineComponents = offlineParsed.components || [];
      } else {
        // Initialize with empty embed
        streamOfflineEmbeds = [{
          title: "",
          description: "",
          color: "#ED4245",
          fields: []
        }];
        streamOfflineComponents = [];
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
      editingComponent = null;
      // If not on the list tab, clear stream editing
      if (activeTab !== "list") {
        editingStream = null;
      }
    }
  });

  // Reset component editing when switching message types
  $effect(() => {
    if (editingMessageType) {
      editingComponent = null;
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
                                          onclick={() => unfollowStream(stream.id)}
                                    >
                                    <i class="fa-solid fa-circle-xmark" style="font-size: 14px sm:16px;"></i>
                                    </button>
                                </div>

                              {#if editingStream === stream.id}
                                <!-- Flattened editing layout -->
                                <div class="border-t pt-3 space-y-3" style="border-color: {$colorStore.primary}20;">
                                  <!-- Message Type Toggle -->
                                  <div class="flex gap-1 sm:gap-2">
                                    <button
                                      class="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium"
                                      style="background: {editingMessageType === 'online' ? $colorStore.primary : $colorStore.muted}20; color: {editingMessageType === 'online' ? $colorStore.text : $colorStore.muted};"
                                      onclick={() => {
                                              editingMessageType = 'online';
                                              editingComponent = null;
                                            }}
                                    >
                                      <i class="fa-solid fa-circle-check inline mr-1"
                                         style="color: #57F287; font-size: 10px;"></i>
                                      <span class="hidden sm:inline">Online</span>
                                      <span class="sm:hidden">On</span>
                                    </button>
                                    <button
                                      class="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium"
                                      style="background: {editingMessageType === 'offline' ? $colorStore.primary : $colorStore.muted}20; color: {editingMessageType === 'offline' ? $colorStore.text : $colorStore.muted};"
                                      onclick={() => {
                                              editingMessageType = 'offline';
                                              editingComponent = null;
                                            }}
                                    >
                                      <i class="fa-solid fa-circle-xmark inline mr-1"
                                         style="color: #ED4245; font-size: 10px;"></i>
                                      <span class="hidden sm:inline">Offline</span>
                                      <span class="sm:hidden">Off</span>
                                    </button>
                                  </div>

                                  <!-- Embeds Section -->
                                        <div>
                                          <div class="flex items-center justify-between mb-2">
                                            <span class="text-xs sm:text-sm font-medium"
                                                  style="color: {$colorStore.text}">
                                              Embeds ({getActiveEmbeds().length}/10)
                                            </span>
                                            <button
                                              class="px-2 py-1 text-xs rounded disabled:opacity-50"
                                              style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                              disabled={getActiveEmbeds().length >= 10}
                                              onclick={addEmbed}
                                            >
                                              <i class="fa-solid fa-plus" style="font-size: 9px;"></i> Embed
                                            </button>
                                          </div>

                                          <div class="space-y-2">
                                            {#each getActiveEmbeds() as embed, index (index)}
                                              <EmbedEditor
                                                {embed}
                                                {index}
                                                placeholders={streamPlaceholders}
                                                onupdate={updateEmbed}
                                                onremove={removeEmbed}
                                                onduplicate={duplicateEmbed}
                                              />
                                            {/each}
                                          </div>
                                        </div>

                                  <!-- Components Section -->
                                        <div>
                                          <div class="flex items-center justify-between mb-2">
                                            <span class="text-xs sm:text-sm font-medium"
                                                  style="color: {$colorStore.text}">
                                              Buttons ({getTotalComponentCount()}/25)
                                            </span>
                                            <button
                                              class="px-2 py-1 text-xs rounded disabled:opacity-50"
                                              style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                              disabled={getActiveComponents().length >= 5}
                                              onclick={addComponentRow}
                                            >
                                              <i class="fa-solid fa-plus" style="font-size: 9px;"></i> Row
                                            </button>
                                          </div>

                                          {#if getActiveComponents().length === 0}
                                            <p class="text-xs text-center py-2" style="color: {$colorStore.muted}">
                                              Add a row to create buttons
                                            </p>
                                          {:else}
                                            <div class="space-y-2">
                                              {#each getActiveComponents() as row (row.componentKey)}
                                                <div class="p-2 border rounded"
                                                     style="background: {$colorStore.primary}03; border-color: {$colorStore.primary}15;">
                                                  <div class="flex justify-between items-center mb-1">
                                                    <span class="text-xs"
                                                          style="color: {$colorStore.muted}">Row {getActiveComponents().indexOf(row) + 1}</span>
                                                    <button
                                                      class="px-1.5 py-0.5 text-xs rounded"
                                                      style="background: #ED424515; color: #ED4245;"
                                                      onclick={() => removeComponentRow(row.rowKey)}
                                                    >
                                                      <i class="fa-solid fa-trash" style="font-size: 8px;"></i>
                                                    </button>
                                                  </div>

                                                  {#if row.components.length === 0}
                                                    <button
                                                      class="w-full px-2 py-1 text-xs rounded"
                                                      style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                                      onclick={() => addComponentToRow(row.rowKey, 'button')}
                                                    >
                                                      <i class="fa-solid fa-plus" style="font-size: 9px;"></i> Button
                                                    </button>
                                                  {:else}
                                                    {#if editingComponent && row.components.some((c: any) => c.componentKey === editingComponent.componentKey)}
                                                      <div class="p-2 mb-1 border rounded"
                                                           style="background: {$colorStore.secondary}05; border-color: {$colorStore.secondary}30;">
                                                        <ComponentEditor
                                                          component={editingComponent}
                                                          isEditing={true}
                                                          user={data.user}
                                                          onupdate={(detail) => { editingComponent = detail.component; }}
                                                          onremove={handleComponentRemove}
                                                          onedit={handleComponentEdit}
                                                        />
                                                        <div class="flex gap-1 mt-2">
                                                          <button
                                                            class="px-2 py-1 text-xs rounded"
                                                            style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                                            onclick={() => {
                                                              if (editingComponent) handleComponentUpdate({ component: editingComponent });
                                                              editingComponent = null;
                                                            }}
                                                          >
                                                            Done
                                                          </button>
                                                          <button
                                                            class="px-2 py-1 text-xs rounded"
                                                            style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                                                            onclick={() => editingComponent = null}
                                                          >
                                                            Cancel
                                                          </button>
                                                        </div>
                                                      </div>
                                                    {/if}

                                                    <div class="flex gap-1 flex-wrap">
                                                      {#each row.components as component (component.componentKey)}
                                                        <div
                                                          class="cursor-pointer"
                                                          class:w-full={component.isSelect}
                                                          onclick={() => handleComponentEdit({ component })}
                                                        >
                                                          <ComponentEditor
                                                            {component}
                                                            isEditing={false}
                                                            user={data.user}
                                                            onupdate={handleComponentUpdate}
                                                            onremove={handleComponentRemove}
                                                            onedit={handleComponentEdit}
                                                          />
                                                        </div>
                                                      {/each}
                                                    </div>

                                                    {#if !row.components.some((c: any) => c.isSelect) && row.components.length < 5}
                                                      <div class="flex justify-center pt-1 border-t mt-1"
                                                           style="border-color: {$colorStore.primary}15;">
                                                        <button
                                                          class="px-2 py-0.5 text-xs rounded"
                                                          style="background: {$colorStore.primary}15; color: {$colorStore.primary};"
                                                          onclick={() => addComponentToRow(row.rowKey, 'button')}
                                                        >
                                                          <i class="fa-solid fa-plus" style="font-size: 9px;"></i>
                                                          Button
                                                        </button>
                                                      </div>
                                                    {/if}
                                                  {/if}
                                                </div>
                                              {/each}
                                            </div>
                                          {/if}
                                        </div>

                                  <!-- Save Buttons -->
                                        <div class="flex gap-2">
                                          <button
                                            class="flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium"
                                            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                                            onclick={() => updateSingleStreamMessage(stream.id, editingMessageType)}
                                            disabled={saving}
                                          >
                                            <i class="fa-solid fa-floppy-disk inline mr-1" style="font-size: 10px;"></i>
                                            Save
                                          </button>
                                          <button
                                            class="flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium"
                                            style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                                            onclick={() => {
                                              editingStream = null;
                                              editingComponent = null;
                                            }}
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
                      <label class="block text-sm font-medium mb-3"
                             style="color: {$colorStore.text}">
                        <i class="fa-solid fa-message inline mr-1" style="font-size: 14px;"></i>
                        Global Stream Message
                      </label>

                      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <!-- Editor -->
                        <div class="space-y-3">
                          <!-- Embeds -->
                          <div>
                            <div class="flex items-center justify-between mb-2">
                                  <span class="text-xs sm:text-sm font-medium" style="color: {$colorStore.text}">
                                    Embeds ({globalMessageEmbeds.length}/10)
                                  </span>
                              <button
                                class="px-2 py-1 text-xs rounded disabled:opacity-50"
                                style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                disabled={globalMessageEmbeds.length >= 10}
                                onclick={addEmbed}
                              >
                                <i class="fa-solid fa-plus" style="font-size: 9px;"></i> Embed
                              </button>
                            </div>

                            <div class="space-y-3">
                              {#each globalMessageEmbeds as embed, index (index)}
                                <EmbedEditor
                                  {embed}
                                  {index}
                                  placeholders={streamPlaceholders}
                                  onupdate={updateEmbed}
                                  onremove={removeEmbed}
                                  onduplicate={duplicateEmbed}
                                />
                              {/each}
                            </div>
                          </div>

                          <!-- Components Section -->
                          <div class="border rounded-xl p-3 sm:p-4"
                               style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
                            <div class="flex items-center justify-between mb-3">
                              <h4 class="text-sm sm:text-base font-semibold" style="color: {$colorStore.text}">
                                Buttons ({getTotalComponentCount()}/25)
                              </h4>
                              <button
                                class="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg transition-all hover:scale-[1.02] disabled:opacity-50"
                                style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                disabled={globalMessageComponents.length >= 5}
                                onclick={addComponentRow}
                              >
                                <i class="fa-solid fa-plus inline mr-1" style="font-size: 10px;"></i>
                                Row
                              </button>
                            </div>

                            {#if globalMessageComponents.length === 0}
                              <div class="text-center py-4 sm:py-6">
                                <p class="text-xs sm:text-sm" style="color: {$colorStore.muted}">
                                  No buttons yet. Add a row to start.
                                </p>
                              </div>
                            {:else}
                              <div class="space-y-3">
                                {#each globalMessageComponents as row, rowIndex (row.componentKey)}
                                  <div class="border rounded-lg p-2 sm:p-3"
                                       style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                                    <!-- Row Header -->
                                    <div class="flex items-center justify-between mb-2">
                                          <span class="text-xs font-medium" style="color: {$colorStore.text}">
                                            Row {rowIndex + 1} ({row.components.length})
                                          </span>
                                      <button
                                        class="px-2 py-1 text-xs rounded transition-all"
                                        style="background: #ED424520; color: #ED4245;"
                                        onclick={() => removeComponentRow(row.rowKey)}
                                      >
                                        <i class="fa-solid fa-trash" style="font-size: 10px;"></i>
                                      </button>
                                    </div>

                                    <!-- Components in row -->
                                    {#if row.components.length === 0}
                                      <div class="flex gap-2 justify-center py-2">
                                        <button
                                          class="px-2 sm:px-3 py-1 text-xs rounded-lg transition-all"
                                          style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                          onclick={() => addComponentToRow(row.rowKey, 'button')}
                                        >
                                          <i class="fa-solid fa-plus" style="font-size: 10px;"></i> Button
                                        </button>
                                      </div>
                                    {:else}
                                      <!-- Editing Mode -->
                                      {#if editingComponent && row.components.some((c: any) => c.componentKey === editingComponent.componentKey)}
                                        <div class="p-2 border rounded-lg mb-2"
                                             style="background: {$colorStore.secondary}05; border-color: {$colorStore.secondary}30;">
                                          <ComponentEditor
                                            component={editingComponent}
                                            isEditing={true}
                                            user={data.user}
                                            onupdate={(detail) => {
                                                  editingComponent = detail.component;
                                                }}
                                            onremove={handleComponentRemove}
                                            onedit={handleComponentEdit}
                                          />
                                          <div class="flex gap-2 mt-3">
                                            <button
                                              class="px-3 py-1 text-xs rounded-lg transition-all"
                                              style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                              onclick={() => {
                                                    if (editingComponent) handleComponentUpdate({ component: editingComponent });
                                                    editingComponent = null;
                                                  }}
                                            >
                                              Done
                                            </button>
                                            <button
                                              class="px-3 py-1 text-xs rounded-lg transition-all"
                                              style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                                              onclick={() => editingComponent = null}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      {/if}

                                      <!-- Display Mode -->
                                      <div class="flex gap-2 flex-wrap">
                                        {#each row.components as component (component.componentKey)}
                                          <div
                                            class="cursor-pointer"
                                            class:w-full={component.isSelect}
                                            onclick={() => handleComponentEdit({ component })}
                                          >
                                            <ComponentEditor
                                              {component}
                                              isEditing={false}
                                              user={data.user}
                                              onupdate={handleComponentUpdate}
                                              onremove={handleComponentRemove}
                                              onedit={handleComponentEdit}
                                            />
                                          </div>
                                        {/each}
                                      </div>

                                      <!-- Add Button to Row -->
                                      {#if !row.components.some((c: any) => c.isSelect) && row.components.length < 5}
                                        <div class="flex justify-center pt-2 border-t mt-2"
                                             style="border-color: {$colorStore.primary}20;">
                                          <button
                                            class="px-2 py-1 text-xs rounded-lg transition-all"
                                            style="background: {$colorStore.primary}15; color: {$colorStore.primary};"
                                            onclick={() => addComponentToRow(row.rowKey, 'button')}
                                          >
                                            <i class="fa-solid fa-plus" style="font-size: 10px;"></i> Button
                                          </button>
                                        </div>
                                      {/if}
                                    {/if}
                                  </div>
                                {/each}
                              </div>
                            {/if}
                          </div>
                        </div>

                        <!-- Preview -->
                        <div class="sticky top-4">
                          <PreviewCard embeds={globalMessageEmbeds} componentRows={globalMessageComponents} />
                        </div>
                      </div>

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
