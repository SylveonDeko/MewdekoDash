<!-- routes/dashboard/alerts/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import FeedsTab from "./components/FeedsTab.svelte";
  import FreeGamesTab from "./components/FreeGamesTab.svelte";
  import StreamsTab from "./components/StreamsTab.svelte";
  import TwitchTab from "./components/TwitchTab.svelte";
  import { SOURCES, type Named, type SourceId } from "./components/alertsModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let channels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let saveErrorText: ((key: string) => string) | null = null;
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: (_err, key) => notify(saveErrorText?.(key) ?? m.common.failedToSaveTheSettings(), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  const source: SourceId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return SOURCES.find(id => id === requested) ?? "twitch";
  });

  const labels = $derived<Record<SourceId, { label: string; icon: string }>>({
    twitch: { label: m.features.twitchName(), icon: "fa-brands fa-twitch" },
    streams: { label: m.common.streams(), icon: "fa-solid fa-radio" },
    feeds: { label: m.features.feedsName(), icon: "fa-solid fa-newspaper" },
    games: { label: m.alerts.sourceGames(), icon: "fa-solid fa-gamepad" }
  });

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function select(id: SourceId) {
    if (id === source) return;
    void autoSave.flush();
    const url = new URL(page.url);
    url.search = "";
    url.searchParams.set("tab", id);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  async function loadGuildData(id: bigint) {
    const results = await Promise.allSettled([
      clientApi.getTextChannels(id).then(value => (channels = value as Named[])),
      clientApi.getRoles(id).then(value => (roles = value as Named[]))
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load alert data:", result.reason);
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
      void loadGuildData(BigInt($currentGuild.id));
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
  icon="fa-bell"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.common.alerts()}
  subtitle={m.alerts.pageSubtitle()}
>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.alerts.sourceAria()}>
    {#each SOURCES as id (id)}
      {@const selected = source === id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => select(id)}
      >
        <i class={labels[id].icon} aria-hidden="true"></i>
        {labels[id].label}
      </button>
    {/each}
  </div>

  {#if guildId}
    {#key `${guildId}:${source}`}
      {#if source === "twitch"}
        <TwitchTab
          {guildId}
          {channels}
          {autoSave}
          user={data.user}
          {notify}
          registerSaveError={(handler) => (saveErrorText = handler)}
        />
      {:else if source === "streams"}
        <StreamsTab {guildId} {channels} {autoSave} user={data.user} {notify} />
      {:else if source === "feeds"}
        <FeedsTab {guildId} {channels} {autoSave} user={data.user} {notify} />
      {:else}
        <FreeGamesTab {guildId} {channels} {roles} {notify} />
      {/if}
    {/key}
  {/if}
</PluginPage>
