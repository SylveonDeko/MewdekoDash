<!-- routes/dashboard/customvoice/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi, customVoiceApi, type CustomVoiceChannelResponse } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";
  import HubsTab from "./components/HubsTab.svelte";
  import ChannelsTab from "./components/ChannelsTab.svelte";
  import MembersTab from "./components/MembersTab.svelte";
  import { errorText, hubFromResponse, idString, type Hub, type Named } from "./components/model";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let hubs: Hub[] = $state([]);
  let activeChannels: CustomVoiceChannelResponse[] = $state([]);
  let voiceChannels: Named[] = $state([]);
  let categories: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let members: Named[] = $state([]);
  let loading = $state(true);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";
  let membersGuildId = "";

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err, m.customvoice.notifySaveFailed()), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  const tabs = $derived([
    { id: "hubs", label: m.customvoice.tabHubs(), icon: "fa-microphone" },
    { id: "channels", label: m.customvoice.tabChannels(), icon: "fa-list" },
    { id: "members", label: m.customvoice.prefsTitle(), icon: "fa-user" }
  ]);

  const activeTab = $derived(tabs.find((t) => t.id === page.url.searchParams.get("tab"))?.id ?? "hubs");

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function select(id: string) {
    if (id === activeTab) return;
    void autoSave.flush();
    const url = new URL(page.url);
    url.search = "";
    url.searchParams.set("tab", id);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  async function loadChannels() {
    const id = guildId;
    if (!id) return;
    const list = await customVoiceApi.getActiveCustomVoiceChannels(id);
    if (guildId === id) activeChannels = list ?? [];
  }

  async function loadGuildData(id: bigint) {
    loading = true;
    try {
      const [hubList, channelList, voiceList, categoryList, roleList] = await Promise.all([
        customVoiceApi.getCustomVoiceHubs(id),
        customVoiceApi.getActiveCustomVoiceChannels(id),
        clientApi.getVoiceChannels(id),
        clientApi.getCategories(id),
        clientApi.getRoles(id)
      ]);
      if (guildId !== id) return;
      hubs = (hubList ?? []).filter((h) => idString(h.hubVoiceChannelId) !== "0").map(hubFromResponse);
      activeChannels = channelList ?? [];
      voiceChannels = (voiceList ?? []) as Named[];
      categories = (categoryList ?? []) as Named[];
      roles = (roleList ?? []) as Named[];
    } catch (err) {
      logger.error("Failed to load custom voice data:", err);
      notify(errorText(err, m.customvoice.notifyLoadFailed()), "error");
    } finally {
      if (guildId === id) loading = false;
    }
  }

  async function loadMembers(id: bigint) {
    membersGuildId = id.toString();
    try {
      const list = await clientApi.getMembers(id);
      if (guildId !== id) return;
      members = list
        .map((x) => ({ id: idString(x.id), name: x.username ?? idString(x.id) }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      membersGuildId = "";
      logger.error("Failed to load members:", err);
    }
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
      hubs = [];
      activeChannels = [];
      members = [];
      void loadGuildData(BigInt($currentGuild.id));
    }
  });

  $effect(() => {
    if (guildId && activeTab !== "hubs" && membersGuildId !== guildId.toString()) void loadMembers(guildId);
  });
</script>

<svelte:head>
  <title>{m.customvoice.pageHeadTitle()}</title>
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
  icon="fa-microphone"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.customvoiceName()}
  subtitle={m.customvoice.pageSubtitle()}
>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.customvoice.tabsAria()}>
    {#each tabs as tab (tab.id)}
      {@const selected = activeTab === tab.id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => select(tab.id)}
      >
        <i class="fa-solid {tab.icon}" aria-hidden="true"></i>
        {tab.label}
      </button>
    {/each}
  </div>

  {#if loading}
    <SkeletonLoader />
  {:else if guildId}
    {#key guildId}
      {#if activeTab === "hubs"}
        <HubsTab
          {guildId}
          {hubs}
          {voiceChannels}
          {categories}
          {roles}
          {autoSave}
          {notify}
          onchange={(value) => (hubs = value)}
        />
      {:else if activeTab === "channels"}
        <ChannelsTab
          {guildId}
          channels={activeChannels}
          {voiceChannels}
          {members}
          {hubs}
          {notify}
          onchange={(value) => (activeChannels = value)}
          onreload={loadChannels}
        />
      {:else}
        <MembersTab {guildId} {members} {autoSave} {notify} />
      {/if}
    {/key}
  {/if}
</PluginPage>
