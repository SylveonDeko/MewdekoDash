<!-- routes/dashboard/polls/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import {
    clientApi,
    pollApi,
    type PollResponse,
    type PollTemplateResponse,
    type ScheduledPollResponse
  } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { userStore } from "$lib/stores/userStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import PollsCard from "./components/PollsCard.svelte";
  import ScheduledCard from "./components/ScheduledCard.svelte";
  import TemplatesCard from "./components/TemplatesCard.svelte";
  import AnalyticsCard from "./components/AnalyticsCard.svelte";
  import CreatePollSheet from "./components/CreatePollSheet.svelte";
  import { draftFromTemplate, emptyDraft, type Named, type PollDraft, type Role } from "./components/pollModel";

  let polls: PollResponse[] = $state([]);
  let scheduled: ScheduledPollResponse[] = $state([]);
  let templates: PollTemplateResponse[] = $state([]);
  let channels: Named[] = $state([]);
  let roles: Role[] = $state([]);
  let includeClosed = $state(false);
  let loading = $state(true);
  let version = $state(0);
  let creating: PollDraft | null = $state(null);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);
  let userId = $derived($userStore?.id ? BigInt($userStore.id) : null);

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function loadPolls() {
    if (!guildId) return;
    const [pollData, scheduledData, templateData] = await Promise.all([
      pollApi.getPolls(guildId, includeClosed).catch(() => []),
      pollApi.getScheduledPolls(guildId).catch(() => null),
      pollApi.getTemplates(guildId).catch(() => [])
    ]);
    polls = pollData || [];
    scheduled = scheduledData?.scheduledPolls ?? [];
    templates = templateData || [];
    version++;
  }

  async function loadGuildData(id: bigint) {
    loading = true;
    try {
      const [channelData, roleData] = await Promise.all([
        clientApi.getTextChannels(id).catch(() => []),
        clientApi.getRoles(id).catch(() => [])
      ]);
      channels = channelData.map(channel => ({ id: channel.id.toString(), name: channel.name }));
      roles = (roleData as any[]).map(role => ({ id: role.id.toString(), name: role.name, color: role.color }));
      await loadPolls();
    } catch (err) {
      logger.error("Failed to load polls:", err);
      notify(m.polls.notifyLoadFailed(), "error");
    } finally {
      loading = false;
    }
  }

  function setIncludeClosed(value: boolean) {
    includeClosed = value;
    void loadPolls();
  }

  async function created(wasScheduled: boolean) {
    creating = null;
    notify(wasScheduled ? m.polls.notifyScheduled() : m.polls.notifyPosted());
    await loadPolls();
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
    if (loadedGuildId !== key) {
      loadedGuildId = key;
      void loadGuildData(BigInt($currentGuild.id));
    }
  });
</script>

<svelte:head>
  <title>{m.features.pollsName()}</title>
</svelte:head>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  icon="fa-chart-simple"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.pollsName()}
  subtitle={m.features.pollsDescription()}
>
  {#if guildId}
    {#key guildId}
      <div class="space-y-4 min-w-0">
        <PollsCard
          {guildId}
          {userId}
          {polls}
          {loading}
          {includeClosed}
          onincludeclosed={setIncludeClosed}
          onnew={() => (creating = emptyDraft())}
          onchanged={loadPolls}
          onerror={(message) => notify(message, "error")}
        />
        <ScheduledCard {guildId} {userId} items={scheduled} {channels} onchanged={loadPolls} onerror={(message) => notify(message, "error")} />
        <TemplatesCard
          {guildId}
          {userId}
          {templates}
          onuse={(template) => (creating = draftFromTemplate(template))}
          onchanged={loadPolls}
          onerror={(message) => notify(message, "error")}
        />
        <AnalyticsCard {guildId} {version} />
      </div>

      {#if creating && $userStore}
        <CreatePollSheet {guildId} user={$userStore} initial={creating} {channels} {roles} onclose={() => (creating = null)} oncreated={created} />
      {/if}
    {/key}
  {/if}
</PluginPage>
