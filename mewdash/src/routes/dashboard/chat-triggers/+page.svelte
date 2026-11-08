<!-- routes/dashboard/chat-triggers/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { chatTriggersApi, clientApi, type ChatTrigger } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import type { TriggerCounter } from "$lib/api/chattriggers/chattriggers";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import TriggersCard from "./components/TriggersCard.svelte";
  import CategoriesCard from "./components/CategoriesCard.svelte";
  import CountersCard from "./components/CountersCard.svelte";
  import ServerSettingsCard from "./components/ServerSettingsCard.svelte";
  import TransferCard from "./components/TransferCard.svelte";
  import ReferenceCard from "./components/ReferenceCard.svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let triggers: ChatTrigger[] = $state([]);
  let counters: TriggerCounter[] = $state([]);
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

  async function loadTriggers(id: bigint) {
    try {
      triggers = await chatTriggersApi.getChatTriggers(id);
    } catch (err) {
      logger.error("Failed to fetch chat triggers:", err);
      notify(err instanceof Error && err.message ? err.message : m.chatTriggers.errorFetchTriggers(), "error");
    }
  }

  async function loadGuildData(id: bigint) {
    loading = true;
    const results = await Promise.allSettled([
      loadTriggers(id),
      clientApi.getTextChannels(id).then(value => (channels = value)),
      clientApi.getRoles(id).then(value => (roles = value as typeof roles)),
      chatTriggersApi.getCounters(id).then(value => (counters = value)),
      data.user?.id ? clientApi.getEmojis(data.user.id, true).then(value => (emojis = value)) : Promise.resolve()
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load chat trigger data:", result.reason);
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
  icon="fa-comment"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.chatTriggersName()}
  subtitle={m.chatTriggers.pageSubtitle()}
>
  {#if guildId}
    {#key guildId}
      <TriggersCard
        {guildId}
        bind:triggers
        {loading}
        {channels}
        {roles}
        {emojis}
        {counters}
        {autoSave}
        user={data.user}
        onreload={() => loadTriggers(guildId)}
        onerror={(message) => notify(message, "error")}
        onsuccess={(message) => notify(message)}
      />
      <CategoriesCard {guildId} bind:triggers onerror={(message) => notify(message, "error")} onsuccess={(message) => notify(message)} />
      <CountersCard {guildId} bind:counters {autoSave} onerror={(message) => notify(message, "error")} />
      <ServerSettingsCard {guildId} {autoSave} onerror={(message) => notify(message, "error")} />
      <TransferCard
        {guildId}
        user={data.user}
        onreload={() => loadTriggers(guildId)}
        onerror={(message) => notify(message, "error")}
        onsuccess={(message) => notify(message)}
      />
      <ReferenceCard {guildId} onerror={(message) => notify(message, "error")} />
    {/key}
  {/if}
</PluginPage>
