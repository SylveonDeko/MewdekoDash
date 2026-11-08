<!-- routes/dashboard/giveaways/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi, giveawaysApi, type Giveaway, type GiveawaySettings } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import GiveawaysCard from "./components/GiveawaysCard.svelte";
  import AppearanceCard from "./components/AppearanceCard.svelte";
  import WinnerMessageCard from "./components/WinnerMessageCard.svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let giveaways: Giveaway[] = $state([]);
  let entryCounts: Record<string, number> = $state({});
  let settings: GiveawaySettings | null = $state(null);
  let channels: Array<{ id: string; name: string }> = $state([]);
  let roles: Array<{ id: string; name: string; color?: number }> = $state([]);
  let emojis: GuildEmojiInfo[] = $state([]);
  let loading = $state(true);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: (err) => notify(err instanceof Error && err.message ? err.message : m.common.failedToSaveTheSettings(), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function loadGiveaways(id: bigint) {
    try {
      const [list, counts] = await Promise.all([giveawaysApi.getGiveaways(id), giveawaysApi.getEntryCounts(id)]);
      giveaways = list;
      entryCounts = counts;
    } catch (err) {
      logger.error("Failed to fetch giveaways:", err);
      notify(err instanceof Error && err.message ? err.message : m.giveaways.loadFailed(), "error");
    }
  }

  async function loadGuildData(id: bigint) {
    loading = true;
    const results = await Promise.allSettled([
      loadGiveaways(id),
      giveawaysApi.getSettings(id).then(value => (settings = value)),
      clientApi.getTextChannels(id).then(value => (channels = value)),
      clientApi.getRoles(id).then(value => (roles = value as typeof roles)),
      data.user?.id ? clientApi.getEmojis(data.user.id, true).then(value => (emojis = value)) : Promise.resolve()
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load giveaway data:", result.reason);
    }
    loading = false;
  }

  function changeSettings(patch: Partial<GiveawaySettings>, typing = false) {
    if (!settings || !guildId) return;
    const id = guildId;
    settings = { ...settings, ...patch };
    const send = async () => {
      if (!settings) return;
      try {
        await giveawaysApi.updateSettings(id, settings);
      } catch (err) {
        settings = await giveawaysApi.getSettings(id).catch(() => settings);
        throw err;
      }
    };
    if (typing) autoSave.schedule("settings", send);
    else void autoSave.now("settings", send);
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
  icon="fa-gift"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.giveawaysName()}
  subtitle={m.giveaways.pageSubtitle()}
>
  {#if guildId}
    {#key guildId}
      <GiveawaysCard
        {guildId}
        bind:giveaways
        {entryCounts}
        {loading}
        {channels}
        {roles}
        {emojis}
        defaultEmote={settings?.emote ?? null}
        {autoSave}
        user={data.user}
        onreload={() => loadGiveaways(guildId)}
        onerror={(message) => notify(message, "error")}
        onsuccess={(message) => notify(message)}
      />
      {#if settings}
        <AppearanceCard {settings} {roles} {emojis} onchange={changeSettings} />
        <WinnerMessageCard {settings} user={data.user} onchange={changeSettings} />
      {/if}
    {/key}
  {/if}
</PluginPage>
