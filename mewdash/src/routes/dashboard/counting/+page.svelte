<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi, countingApi, type CountingChannelResponse } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import ChannelsTab from "./components/ChannelsTab.svelte";
  import SettingsTab from "./components/SettingsTab.svelte";
  import StatsTab from "./components/StatsTab.svelte";
  import ManageTab from "./components/ManageTab.svelte";
  import { idString, type Named } from "./components/countingModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const TABS = ["channels", "settings", "stats", "manage"] as const;
  type TabId = (typeof TABS)[number];

  let countingChannels: CountingChannelResponse[] = $state([]);
  let textChannels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let emojis: GuildEmojiInfo[] = $state([]);
  let loaded = $state(false);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: (_err, key) =>
      notify(key.includes(":successMessage") || key.includes(":failureMessage") || key.includes(":milestoneMessage")
        ? m.common.failedToSaveMessage()
        : m.counting.notifySaveFailedUndone(), "error")
  });

  const guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find((id) => id === requested) ?? "channels";
  });

  const selectedId = $derived.by(() => {
    const requested = page.url.searchParams.get("channel");
    const found = countingChannels.find((c) => idString(c.channelId) === requested);
    return idString((found ?? countingChannels[0])?.channelId) || null;
  });

  const labels = $derived<Record<TabId, { label: string; icon: string }>>({
    channels: { label: m.counting.tabChannels({ count: countingChannels.length }), icon: "fa-hashtag" },
    settings: { label: m.common.settings(), icon: "fa-gear" },
    stats: { label: m.common.statistics(), icon: "fa-chart-column" },
    manage: { label: m.common.management(), icon: "fa-shield" }
  });

  const channelOptions = $derived(
    countingChannels.map((c) => ({ id: idString(c.channelId), name: c.channelName ?? idString(c.channelId) }))
  );

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function navigate(next: { tab?: TabId; channel?: string }) {
    void autoSave.flush();
    const url = new URL(page.url);
    if (next.tab) url.searchParams.set("tab", next.tab);
    if (next.channel) url.searchParams.set("channel", next.channel);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  async function loadChannels() {
    if (!guildId) return;
    try {
      countingChannels = (await countingApi.getCountingChannels(guildId)) ?? [];
    } catch (err) {
      logger.error("Failed to load counting channels:", err);
      notify(m.counting.notifyLoadFailed(), "error");
    }
  }

  async function loadGuildData(id: bigint) {
    const results = await Promise.allSettled([
      loadChannels(),
      clientApi.getTextChannels(id).then((value) => (textChannels = value as Named[])),
      clientApi.getRoles(id).then((value) => (roles = value as Named[])),
      data.user?.id ? clientApi.getEmojis(data.user.id, true).then((value) => (emojis = value)) : Promise.resolve()
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load counting data:", result.reason);
    }
    loaded = true;
  }

  $effect(() => {
    if (!$currentGuild) {
      void goto("/dashboard");
      return;
    }
    if ($currentGuild.icon) {
      const serverIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
      colorStore.extractFromServerIcon(serverIconUrl);
    } else if ($currentInstance?.botAvatar) {
      colorStore.extractFromImage($currentInstance.botAvatar);
    }
    if (loadedGuildId !== $currentGuild.id.toString()) {
      loadedGuildId = $currentGuild.id.toString();
      loaded = false;
      countingChannels = [];
      void loadGuildData(BigInt($currentGuild.id));
    }
  });
</script>

<svelte:head>
  <title>{m.counting.headTitle()}</title>
</svelte:head>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-[10001]" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  icon="fa-list-numeric"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.counting.pageTitle()}
  subtitle={m.counting.pageSubtitle()}
>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.counting.tabsAria()}>
    {#each TABS as id (id)}
      {@const selected = tab === id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => navigate({ tab: id })}
      >
        <i class="fa-solid {labels[id].icon}" aria-hidden="true"></i>
        {labels[id].label}
      </button>
    {/each}
  </div>

  {#if guildId && loaded}
    {#if tab !== "channels" && countingChannels.length > 0}
      <DiscordSelector
        type="channel"
        options={channelOptions}
        selected={selectedId}
        ariaLabel={m.common.channel()}
        onchange={({ selected }) => {
          if (typeof selected === "string" && selected) navigate({ channel: selected });
        }}
      />
    {/if}

    {#key `${guildId}:${tab}:${tab === "channels" ? "" : selectedId}`}
      {#if tab === "channels"}
        <ChannelsTab
          {guildId}
          {textChannels}
          channels={countingChannels}
          {selectedId}
          {notify}
          onchanged={loadChannels}
          onopen={(channel) => navigate({ tab: "settings", channel })}
        />
      {:else if !selectedId}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.counting.channelsNoneConfigured()}</p>
      {:else if tab === "settings"}
        <SettingsTab {guildId} channelId={BigInt(selectedId)} {roles} {emojis} user={data.user} {autoSave} {notify} />
      {:else if tab === "stats"}
        <StatsTab {guildId} channelId={BigInt(selectedId)} {notify} />
      {:else if data.user}
        <ManageTab {guildId} channelId={BigInt(selectedId)} user={data.user} {notify} onchanged={loadChannels} />
      {/if}
    {/key}
  {/if}
</PluginPage>
