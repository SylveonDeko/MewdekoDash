<!-- routes/dashboard/multigreets/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
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
  import JoinMessagesCard from "./components/JoinMessagesCard.svelte";
  import GreetMessageCard from "./components/GreetMessageCard.svelte";
  import JoinRolesCard from "./components/JoinRolesCard.svelte";
  import VerificationCard from "./components/VerificationCard.svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let channels: Array<{ id: string; name: string }> = $state([]);
  let roles: Array<{ id: string; name: string; color?: number }> = $state([]);
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

  async function loadGuildData(id: bigint) {
    try {
      const [loadedChannels, loadedRoles] = await Promise.all([clientApi.getTextChannels(id), clientApi.getRoles(id)]);
      channels = loadedChannels;
      roles = loadedRoles as typeof roles;
    } catch (err) {
      logger.error("Failed to load channels and roles:", err);
      notify(err instanceof Error ? err.message : m.common.failedToFetchChannels(), "error");
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
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  icon="fa-bell"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.multigreets.pageTitle()}
  subtitle={m.multigreets.pageSubtitle()}
>
  {#if guildId}
    {#key guildId}
      <JoinMessagesCard {guildId} {channels} {autoSave} user={data.user} onerror={(message) => notify(message, "error")} />
      <GreetMessageCard
        {guildId}
        kind="bye"
        title={m.multigreets.cardByeTitle()}
        {channels}
        {autoSave}
        user={data.user}
        onerror={(message) => notify(message, "error")}
      />
      <GreetMessageCard
        {guildId}
        kind="dmgreet"
        title={m.multigreets.cardDmTitle()}
        {channels}
        {autoSave}
        user={data.user}
        onerror={(message) => notify(message, "error")}
      />
      <GreetMessageCard
        {guildId}
        kind="boost"
        title={m.multigreets.cardBoostTitle()}
        {channels}
        {autoSave}
        user={data.user}
        onerror={(message) => notify(message, "error")}
      />
      <JoinRolesCard {guildId} {roles} {autoSave} onerror={(message) => notify(message, "error")} />
      <VerificationCard
        {guildId}
        {channels}
        {roles}
        {autoSave}
        onerror={(message) => notify(message, "error")}
        onsuccess={(message) => notify(message)}
      />
    {/key}
  {/if}
</PluginPage>
