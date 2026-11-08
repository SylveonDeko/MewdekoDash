<!-- routes/dashboard/starboard/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi, starboardApi, type Starboard } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import StarboardsCard from "./components/StarboardsCard.svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let starboards: Starboard[] = $state([]);
  let channels: Array<{ id: string; name: string }> = $state([]);
  let roles: Array<{ id: string; name: string; color?: number }> = $state([]);
  let emojis: GuildEmojiInfo[] = $state([]);
  let placeholders: string[] = $state([]);
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

  async function loadStarboards(id: bigint) {
    try {
      starboards = await starboardApi.getStarboards(id);
    } catch (err) {
      logger.error("Failed to fetch starboards:", err);
      notify(err instanceof Error && err.message ? err.message : m.starboard.errorFetch(), "error");
    }
  }

  async function loadGuildData(id: bigint) {
    loading = true;
    const results = await Promise.allSettled([
      loadStarboards(id),
      clientApi.getTextChannels(id).then(value => (channels = value)),
      clientApi.getRoles(id).then(value => (roles = value as typeof roles)),
      starboardApi.getDesignPlaceholders(id).then(value => (placeholders = value)),
      data.user?.id ? clientApi.getEmojis(data.user.id, true).then(value => (emojis = value)) : Promise.resolve()
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load starboard data:", result.reason);
    }
    loading = false;
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
  icon="fa-star"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.starboardName()}
  subtitle={m.starboard.pageSubtitle()}
>
  {#if guildId}
    {#key guildId}
      <StarboardsCard
        {guildId}
        bind:starboards
        {loading}
        {channels}
        {roles}
        {emojis}
        {placeholders}
        {autoSave}
        user={data.user}
        onreload={() => loadStarboards(guildId)}
        onerror={(message) => notify(message, "error")}
        onsuccess={(message) => notify(message)}
      />
    {/key}
  {/if}
</PluginPage>
