<script lang="ts">
  import { m } from "$lib/i18n";
  import { streamNotificationsApi, StreamType, type FollowedStream } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import AlertRow from "./AlertRow.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { channelName, errorText, type Named, type Notify } from "./alertsModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    autoSave: AutoSave;
    user?: DiscordUser | null;
    notify: Notify;
  }

  let { guildId, channels, autoSave, user = null, notify }: Props = $props();

  type Platform = { name: string; color: string; icon: string };

  const platformTypes: Record<number, Platform> = {
    [StreamType.Twitch]: { name: "Twitch", color: "#9146FF", icon: "fa-brands fa-twitch" },
    [StreamType.YouTube]: { name: "YouTube", color: "#FF0000", icon: "fa-brands fa-youtube" },
    [StreamType.Facebook]: { name: "Facebook", color: "#1877F2", icon: "fa-brands fa-facebook" },
    [StreamType.Trovo]: { name: "Trovo", color: "#1DB954", icon: "fa-solid fa-video" },
    [StreamType.Picarto]: { name: "Picarto", color: "#1DA362", icon: "fa-solid fa-palette" },
    [StreamType.Kick]: { name: "Kick", color: "#53FC18", icon: "fa-solid fa-video" }
  };

  const platformsByName: Record<string, Platform> = {
    twitch: platformTypes[StreamType.Twitch],
    youtube: platformTypes[StreamType.YouTube],
    facebook: platformTypes[StreamType.Facebook],
    trovo: platformTypes[StreamType.Trovo],
    picarto: platformTypes[StreamType.Picarto],
    kick: platformTypes[StreamType.Kick]
  };

  let streams: FollowedStream[] = $state([]);
  let globalMessage = $state("");
  let offlinePosts = $state(false);
  let loading = $state(true);
  let busy = $state(false);
  let channelId: string | null = $state(null);
  let url = $state("");
  let openId: number | null = $state(null);

  const open = $derived(streams.find(stream => stream.id === openId) ?? null);

  const placeholders = $derived([
    { category: m.placeholders.categoryStream(), name: "%stream.name%", description: m.streams.phName() },
    { category: m.placeholders.categoryStream(), name: "%stream.username%", description: m.streams.phUsername() },
    { category: m.placeholders.categoryStream(), name: "%stream.url%", description: m.common.streamUrlHint() },
    { category: m.placeholders.categoryStream(), name: "%stream.title%", description: m.common.currentStreamTitle() },
    { category: m.placeholders.categoryStream(), name: "%stream.game%", description: m.common.streamGameHint() },
    { category: m.placeholders.categoryStream(), name: "%stream.viewers%", description: m.streams.phViewers() },
    { category: m.placeholders.categoryStream(), name: "%stream.platform%", description: m.streams.phPlatform() },
    { category: m.placeholders.categoryStream(), name: "%stream.avatar%", description: m.streams.phAvatar() },
    { category: m.placeholders.categoryStream(), name: "%stream.preview%", description: m.streams.phPreview() },
    { category: m.placeholders.categoryStream(), name: "%stream.status%", description: m.streams.phStatus() },
    { category: m.placeholders.categoryStream(), name: "%stream.channelid%", description: m.streams.phChannelid() }
  ]);

  const buttonStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const quietStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  function platformOf(stream: FollowedStream): Platform {
    const byName = stream.typeName ? platformsByName[stream.typeName.toLowerCase()] : undefined;
    return byName ?? platformTypes[stream.type] ?? { name: stream.typeName ?? "", color: $colorStore.muted, icon: "fa-solid fa-circle-question" };
  }

  async function load() {
    loading = true;
    try {
      const [list, message, offline] = await Promise.all([
        streamNotificationsApi.getFollowedStreams(guildId),
        streamNotificationsApi.getCustomStreamMessage(guildId).catch(() => ""),
        streamNotificationsApi.getOfflineNotificationSetting(guildId).catch(() => false)
      ]);
      streams = list;
      globalMessage = message ?? "";
      offlinePosts = offline;
    } catch (err) {
      logger.error("Failed to load streams:", err);
      notify(errorText(err, m.alerts.loadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function reloadStreams() {
    try {
      streams = await streamNotificationsApi.getFollowedStreams(guildId);
    } catch (err) {
      logger.error("Failed to reload streams:", err);
    }
  }

  async function follow() {
    if (busy || !channelId || !url.trim()) return;
    busy = true;
    try {
      await streamNotificationsApi.followStream(guildId, { channelId: BigInt(channelId), url: url.trim() });
      url = "";
      notify(m.alerts.streamsFollowed());
      await reloadStreams();
    } catch (err) {
      logger.error("Failed to follow stream:", err);
      notify(errorText(err, m.alerts.streamsAddFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function unfollow(stream: FollowedStream) {
    const confirmed = await requestConfirmation({ message: m.streams.confirmUnfollow(), confirmText: m.common.remove() });
    if (!confirmed) return;
    try {
      autoSave.cancel(`stream:${stream.id}:online`);
      autoSave.cancel(`stream:${stream.id}:offline`);
      await autoSave.flush();
      await streamNotificationsApi.unfollowStream(guildId, stream.index);
      notify(m.streams.notifyUnfollowed());
    } catch (err) {
      logger.error("Failed to unfollow stream:", err);
      notify(errorText(err, m.alerts.streamsRemoveFailed()), "error");
    }
    await reloadStreams();
  }

  async function clearAll() {
    const confirmed = await requestConfirmation({ message: m.streams.confirmUnfollowAll(), confirmText: m.streams.confirmUnfollowAllButton() });
    if (!confirmed) return;
    try {
      await autoSave.flush();
      const result = await streamNotificationsApi.clearAllStreams(guildId);
      notify(m.alerts.streamsCleared({ count: result.removedCount }));
    } catch (err) {
      logger.error("Failed to clear streams:", err);
      notify(errorText(err, m.alerts.streamsClearFailed()), "error");
    }
    await reloadStreams();
  }

  function changeStreamMessage(stream: FollowedStream, kind: "online" | "offline", message: string) {
    streams = streams.map(item =>
      item.id === stream.id ? { ...item, [kind === "online" ? "onlineMessage" : "offlineMessage"]: message } : item
    );
    const index = stream.index;
    autoSave.schedule(`stream:${stream.id}:${kind}`, async () => {
      const send = kind === "online" ? streamNotificationsApi.setStreamOnlineMessage : streamNotificationsApi.setStreamOfflineMessage;
      await send(guildId, index, message || null);
    });
  }

  function changeGlobalMessage(message: string) {
    globalMessage = message;
    autoSave.schedule("streamsMessage", () => streamNotificationsApi.setCustomStreamMessage(guildId, message || null));
  }

  async function toggleOffline(value: boolean) {
    const previous = offlinePosts;
    offlinePosts = value;
    await autoSave.now("streamsOffline", async () => {
      try {
        const result = await streamNotificationsApi.toggleOfflineNotifications(guildId);
        offlinePosts = result.offlineNotificationsEnabled;
      } catch (err) {
        offlinePosts = previous;
        notify(m.alerts.streamsOfflineFailed(), "error");
        throw err;
      }
    });
  }

  function close() {
    if (openId !== null) {
      void autoSave.flush(`stream:${openId}:online`);
      void autoSave.flush(`stream:${openId}:offline`);
    }
    openId = null;
  }

  void load();
</script>

<PluginCard title={m.alerts.streamsCardAdd()} alwaysOpen>
  <div class="space-y-3">
    <DiscordSelector
      type="channel"
      options={channels}
      selected={channelId}
      placeholder={m.common.selectAChannelPlaceholder()}
      onchange={(detail) => (channelId = typeof detail.selected === "string" ? detail.selected : null)}
    />
    <div class="flex flex-col sm:flex-row gap-3">
      <input
        type="url"
        bind:value={url}
        placeholder={m.alerts.streamsUrlPlaceholder()}
        aria-label={m.streams.streamUrl()}
        class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        onkeydown={(e) => e.key === "Enter" && follow()}
      >
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style={buttonStyle}
        disabled={busy || !channelId || !url.trim()}
        onclick={follow}
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        {m.alerts.streamsAdd()}
      </button>
    </div>
  </div>
</PluginCard>

{#snippet clearButton()}
  {#if streams.length > 1}
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={quietStyle} onclick={clearAll}>
      {m.streams.confirmUnfollowAllButton()}
    </button>
  {/if}
{/snippet}

<PluginCard title={m.common.streams()} actions={clearButton} alwaysOpen>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if streams.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-radio" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p style="color: {$colorStore.muted}">{m.alerts.streamsEmpty()}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each streams as stream (stream.id)}
        {@const platform = platformOf(stream)}
        <AlertRow
          title={stream.username}
          subtitle={`${platform.name} · #${channelName(channels, stream.channelId)}`}
          removeLabel={m.alerts.streamsRemoveAria({ name: stream.username })}
          badges={[...(stream.onlineMessage ? [m.common.online()] : []), ...(stream.offlineMessage ? [m.common.offline()] : [])]}
          onopen={() => (openId = stream.id)}
          onremove={() => unfollow(stream)}
        >
          {#snippet lead()}
            <span class="flex items-center justify-center w-10 h-10 rounded-full" style="background: {platform.color}20;">
              <i class={platform.icon} style="color: {platform.color};" aria-hidden="true"></i>
            </span>
          {/snippet}
        </AlertRow>
      {/each}
    </div>
  {/if}
</PluginCard>

<PluginCard title={m.common.messages()} alwaysOpen>
  <p class="text-sm font-medium" style="color: {$colorStore.text}">{m.alerts.streamsDefaultMessage()}</p>
  <MessageField
    value={globalMessage}
    previewTitle={m.alerts.streamsDefaultMessage()}
    icon="fa-comment"
    {user}
    {placeholders}
    onchange={changeGlobalMessage}
  />
  <ToggleRow checked={offlinePosts} title={m.alerts.streamsOfflinePosts()} colors={$colorStore} onchange={toggleOffline} />
</PluginCard>

{#if open}
  {@const stream = open}
  {#key stream.id}
    <Sheet title={m.alerts.streamsMessagesTitle({ name: stream.username })} onclose={close}>
      <p class="text-sm font-medium" style="color: {$colorStore.text}">{m.alerts.streamsMessageOnline()}</p>
      <MessageField
        value={stream.onlineMessage}
        previewTitle={m.alerts.streamsMessageOnline()}
        icon="fa-circle-check"
        {user}
        {placeholders}
        onchange={(message) => changeStreamMessage(stream, "online", message)}
      />
      <p class="text-sm font-medium" style="color: {$colorStore.text}">{m.alerts.streamsMessageOffline()}</p>
      <MessageField
        value={stream.offlineMessage}
        previewTitle={m.alerts.streamsMessageOffline()}
        icon="fa-circle-exclamation"
        {user}
        {placeholders}
        onchange={(message) => changeStreamMessage(stream, "offline", message)}
      />
    </Sheet>
  {/key}
{/if}
