<!-- routes/dashboard/moderation/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { fade } from "svelte/transition";
  import { clientApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import WarningsCard from "./components/WarningsCard.svelte";
  import PunishmentsCard from "./components/PunishmentsCard.svelte";
  import CasesCard from "./components/CasesCard.svelte";
  import NotesCard from "./components/NotesCard.svelte";
  import ReasonAliasesCard from "./components/ReasonAliasesCard.svelte";
  import PunishDmsCard from "./components/PunishDmsCard.svelte";
  import BanPurgeCard from "./components/BanPurgeCard.svelte";
  import ActivityCard from "./components/ActivityCard.svelte";

  let { data } = $props();

  let channels: Array<{ id: string; name: string }> = $state([]);
  let roles: Array<{ id: string; name: string; color?: number }> = $state([]);
  let refreshKey = $state(0);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: () => notify(m.common.failedToSaveTheSettings())
  });

  const guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);
  const moderatorId = $derived(data?.user?.id ? BigInt(data.user.id) : null);

  function notify(message: string) {
    notificationMessage = message;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function loadGuildData(id: bigint) {
    try {
      const [loadedChannels, loadedRoles] = await Promise.all([clientApi.getTextChannels(id), clientApi.getRoles(id)]);
      channels = loadedChannels;
      roles = (loadedRoles as any[]).map(r => ({ id: r.id.toString(), name: r.name, color: r.color }));
    } catch (err) {
      logger.error("Failed to load channels and roles:", err);
      notify(m.moderation.errorLoadData());
    }
  }

  $effect(() => {
    if ($currentGuild?.id && loadedGuildId !== $currentGuild.id.toString()) {
      loadedGuildId = $currentGuild.id.toString();
      void loadGuildData(BigInt($currentGuild.id));
    }
  });
</script>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type="error" />
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  icon="fa-shield"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.moderation.pageTitle()}
  subtitle={m.moderation.pageSubtitle()}
  actionButtons={[
    {
      label: m.common.refresh(),
      icon: "fa-arrows-rotate",
      action: () => (refreshKey += 1)
    }
  ]}
>
  {#if guildId}
    {#key `${guildId}:${refreshKey}`}
      <WarningsCard {guildId} {moderatorId} onerror={notify} />
      <PunishmentsCard {guildId} {channels} {roles} {autoSave} onerror={notify} />
      <CasesCard {guildId} {channels} {autoSave} onerror={notify} />
      <NotesCard {guildId} {moderatorId} onerror={notify} />
      <ReasonAliasesCard {guildId} onerror={notify} />
      <PunishDmsCard {guildId} {autoSave} user={data?.user} onerror={notify} />
      <BanPurgeCard {guildId} {channels} onerror={notify} />
      <ActivityCard {guildId} />
    {/key}
  {/if}
</PluginPage>
