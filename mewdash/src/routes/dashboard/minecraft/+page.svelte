<!-- routes/dashboard/minecraft/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi, minecraftApi, type MinecraftServer, type MinecraftStatus } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { logger } from "$lib/logger";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import AddServerCard from "./components/AddServerCard.svelte";
  import ConsoleTab from "./components/ConsoleTab.svelte";
  import HistoryTab from "./components/HistoryTab.svelte";
  import ServerSheet from "./components/ServerSheet.svelte";
  import ServersCard from "./components/ServersCard.svelte";
  import {
    EMPTY_STATUS,
    TABS,
    errorText,
    replaceServer,
    type Named,
    type TabId
  } from "./components/minecraftModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let servers: MinecraftServer[] = $state([]);
  let channels: Named[] = $state([]);
  let statuses: Record<string, MinecraftStatus> = $state({});
  let loading = $state(true);
  let querying = $state(false);
  let refreshing = $state<string | null>(null);
  let openName: string | null = $state(null);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedKey = "";

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err, m.minecraft.notifyUpdateFailed()), "error")
  });

  const guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);
  const open = $derived(servers.find(server => server.name === openName) ?? null);

  const tabs = $derived([
    { id: "servers", label: m.common.servers(), icon: "fa-server" },
    { id: "history", label: m.common.history(), icon: "fa-chart-simple" },
    { id: "console", label: m.minecraft.tabConsole(), icon: "fa-terminal" }
  ]);

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find(id => id === requested) ?? "servers";
  });

  const actionButtons = $derived(
    servers.length
      ? [{ label: m.minecraft.queryAll(), icon: "fa-satellite-dish", action: queryAll, loading: querying }]
      : []
  );

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function select(id: TabId) {
    if (id === tab) return;
    const url = new URL(page.url);
    url.search = "";
    url.searchParams.set("tab", id);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  async function loadServers(id: bigint) {
    try {
      servers = await minecraftApi.getServers(id);
    } catch (err) {
      logger.error("Failed to load Minecraft servers:", err);
      notify(errorText(err, m.common.failedToLoadData()), "error");
    }
  }

  async function loadCachedStatuses(id: bigint) {
    await Promise.allSettled(
      servers.map(async server => {
        try {
          const cached = await minecraftApi.getCachedStatus(id, server.name);
          if (cached) statuses[server.name] = cached;
        } catch {
          return;
        }
      })
    );
  }

  async function loadAll(id: bigint) {
    loading = true;
    const [, channelList] = await Promise.all([
      loadServers(id),
      clientApi.getTextChannels(id).catch(() => [])
    ]);
    channels = (channelList as Named[]).map(channel => ({ id: String(channel.id), name: channel.name }));
    loading = false;
    await loadCachedStatuses(id);
  }

  async function queryOne(name: string) {
    if (!guildId) return;
    try {
      statuses[name] = await minecraftApi.getServerStatus(guildId, name);
    } catch (err) {
      logger.error(`Failed to query status for ${name}:`, err);
      statuses[name] = { ...EMPTY_STATUS };
    }
  }

  async function queryAll() {
    if (querying || !servers.length) return;
    querying = true;
    try {
      await Promise.allSettled(servers.map(server => queryOne(server.name)));
      notify(servers.length === 1 ? m.minecraft.notifyQueriedOne({ count: servers.length }) : m.minecraft.notifyQueriedOther({ count: servers.length }));
    } finally {
      querying = false;
    }
  }

  async function refreshOpen() {
    if (!open || refreshing) return;
    refreshing = open.name;
    await queryOne(open.name);
    refreshing = null;
  }

  async function openServer(server: MinecraftServer) {
    openName = server.name;
    if (!statuses[server.name]) await queryOne(server.name);
  }

  async function closeSheet() {
    openName = null;
    await autoSave.flush();
  }

  function updated(next: MinecraftServer) {
    servers = replaceServer(servers, next);
  }

  function added(server: MinecraftServer) {
    servers = [...servers, server];
    void openServer(server);
  }

  async function setDefault() {
    if (!guildId || !open) return;
    const name = open.name;
    try {
      await minecraftApi.updateServer(guildId, name, { isDefault: true });
      notify(m.minecraft.notifyDefaultSet({ name }));
      await loadServers(guildId);
    } catch (err) {
      logger.error("Failed to set the default server:", err);
      notify(errorText(err, m.minecraft.notifyDefaultFailed()), "error");
    }
  }

  async function remove() {
    if (!guildId || !open) return;
    const name = open.name;
    const confirmed = await requestConfirmation({ message: m.minecraft.confirmRemoveServer({ name }), confirmText: m.common.remove() });
    if (!confirmed) return;
    try {
      await autoSave.flush();
      await minecraftApi.removeServer(guildId, name);
      openName = null;
      delete statuses[name];
      notify(m.minecraft.notifyServerRemoved({ name }));
    } catch (err) {
      logger.error("Failed to remove server:", err);
      notify(errorText(err, m.minecraft.notifyRemoveFailed()), "error");
    }
    await loadServers(guildId);
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
    const key = `${$currentGuild.id}:${$currentInstance?.port ?? ""}`;
    if (loadedKey !== key) {
      loadedKey = key;
      openName = null;
      statuses = {};
      void loadAll(BigInt($currentGuild.id));
    }
  });
</script>

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
  {actionButtons}
  icon="fa-server"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.minecraftName()}
  subtitle={m.features.minecraftDescription()}
>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.features.minecraftName()}>
    {#each tabs as item (item.id)}
      {@const selected = tab === item.id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => select(item.id as TabId)}
      >
        <i class="fa-solid {item.icon}" aria-hidden="true"></i>
        {item.label}
      </button>
    {/each}
  </div>

  {#if guildId}
    {#key guildId}
      {#if tab === "servers"}
        <AddServerCard {guildId} {notify} onadded={added} />
        <ServersCard {servers} {statuses} {channels} {loading} onopen={openServer} />
      {:else if tab === "history"}
        <HistoryTab {guildId} {servers} {notify} />
      {:else}
        <ConsoleTab {guildId} {servers} />
      {/if}
    {/key}
  {/if}
</PluginPage>

{#if guildId && open}
  {#key open.name}
    <ServerSheet
      {guildId}
      server={open}
      status={statuses[open.name]}
      {channels}
      {autoSave}
      user={data.user ?? null}
      refreshing={refreshing === open.name}
      {notify}
      onupdate={updated}
      onrefresh={refreshOpen}
      onsetdefault={setDefault}
      onremove={remove}
      onclose={closeSheet}
    />
  {/key}
{/if}
