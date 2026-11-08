<script lang="ts">
  import { m } from "$lib/i18n";
  import { feedsApi, type FeedSub } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
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

  let feeds: FeedSub[] = $state([]);
  let loading = $state(true);
  let busy = $state(false);
  let channelId: string | null = $state(null);
  let url = $state("");
  let openId: number | null = $state(null);

  const open = $derived(feeds.find(feed => feed.id === openId) ?? null);

  const placeholders = $derived([
    { category: m.alerts.feedsPhCategory(), name: "%title%", description: m.alerts.feedsPhTitle() },
    { category: m.alerts.feedsPhCategory(), name: "%author%", description: m.alerts.feedsPhAuthor() },
    { category: m.alerts.feedsPhCategory(), name: "%content%", description: m.alerts.feedsPhContent() },
    { category: m.alerts.feedsPhCategory(), name: "%url%", description: m.alerts.feedsPhUrl() },
    { category: m.alerts.feedsPhCategory(), name: "%feedurl%", description: m.alerts.feedsUrl() },
    { category: m.alerts.feedsPhCategory(), name: "%image_url%", description: m.alerts.feedsPhImage() },
    { category: m.alerts.feedsPhCategory(), name: "%categories%", description: m.alerts.feedsPhCategories() },
    { category: m.alerts.feedsPhCategory(), name: "%timestamp%", description: m.alerts.feedsPhTimestamp() }
  ]);

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`
  );

  async function load() {
    loading = true;
    try {
      feeds = await feedsApi.getFeeds(guildId);
    } catch (err) {
      logger.error("Failed to load feeds:", err);
      notify(errorText(err, m.alerts.loadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function add() {
    if (busy || !channelId || !url.trim()) return;
    busy = true;
    try {
      await feedsApi.addFeed(guildId, { channelId: BigInt(channelId), url: url.trim() });
      url = "";
      notify(m.alerts.feedsAdded());
      await load();
    } catch (err) {
      logger.error("Failed to add feed:", err);
      notify(errorText(err, m.alerts.feedsAddFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function remove(feed: FeedSub) {
    const confirmed = await requestConfirmation({ message: m.feeds.pageConfirmRemove(), confirmText: m.common.remove() });
    if (!confirmed) return;
    try {
      autoSave.cancel(`feed:${feed.id}`);
      await autoSave.flush();
      await feedsApi.removeFeed(guildId, feed.index);
      notify(m.feeds.pageNotifyRemoved());
    } catch (err) {
      logger.error("Failed to remove feed:", err);
      notify(errorText(err, m.alerts.feedsRemoveFailed()), "error");
    }
    await load();
  }

  function changeMessage(feed: FeedSub, message: string) {
    feeds = feeds.map(item => (item.id === feed.id ? { ...item, message } : item));
    const index = feed.index;
    autoSave.schedule(`feed:${feed.id}`, async () => {
      try {
        await feedsApi.setFeedMessage(guildId, index, message);
      } catch (err) {
        notify(m.alerts.feedsMessageFailed(), "error");
        throw err;
      }
    });
  }

  function close() {
    if (openId !== null) void autoSave.flush(`feed:${openId}`);
    openId = null;
  }

  void load();
</script>

<PluginCard title={m.alerts.feedsAdd()} alwaysOpen>
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
        placeholder="https://example.com/feed.xml"
        aria-label={m.alerts.feedsUrl()}
        class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        onkeydown={(e) => e.key === "Enter" && add()}
      >
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style={buttonStyle}
        disabled={busy || !channelId || !url.trim()}
        onclick={add}
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        {m.alerts.feedsAdd()}
      </button>
    </div>
  </div>
</PluginCard>

<PluginCard title={m.features.feedsName()} alwaysOpen>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if feeds.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-newspaper" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p style="color: {$colorStore.muted}">{m.alerts.feedsEmpty()}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each feeds as feed (feed.id)}
        <AlertRow
          title={feed.url}
          subtitle={`#${channelName(channels, feed.channelId)}`}
          removeLabel={m.alerts.feedsRemoveAria({ url: feed.url })}
          badges={feed.message ? [m.common.message()] : []}
          onopen={() => (openId = feed.id)}
          onremove={() => remove(feed)}
        />
      {/each}
    </div>
  {/if}
</PluginCard>

{#if open}
  {@const feed = open}
  {#key feed.id}
    <Sheet title={feed.url} onclose={close}>
      <MessageField
        value={feed.message}
        previewTitle={m.alerts.feedsMessageTitle()}
        icon="fa-newspaper"
        {user}
        {placeholders}
        onchange={(message) => changeMessage(feed, message)}
      />
    </Sheet>
  {/key}
{/if}
