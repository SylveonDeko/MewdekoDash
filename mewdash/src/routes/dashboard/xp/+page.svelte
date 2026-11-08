<!-- routes/dashboard/xp/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi, xpApi } from "$lib/api/index.ts";
  import type { GuildXpSetting } from "$lib/api/xp/models/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import StatsCard from "./components/StatsCard.svelte";
  import GainCard from "./components/GainCard.svelte";
  import LevelUpCard from "./components/LevelUpCard.svelte";
  import RewardsCard from "./components/RewardsCard.svelte";
  import MultipliersCard from "./components/MultipliersCard.svelte";
  import CompetitionsCard from "./components/CompetitionsCard.svelte";
  import ExclusionsCard from "./components/ExclusionsCard.svelte";
  import RankCardCard from "./components/RankCardCard.svelte";
  import LeaderboardCard from "./components/LeaderboardCard.svelte";
  import DataCard from "./components/DataCard.svelte";
  import DesignsLinkCard from "$lib/components/designs/DesignsLinkCard.svelte";
  import { errorText, type Channel, type Role, type SaveMode } from "./components/xpModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let channels: Channel[] = $state([]);
  let roles: Role[] = $state([]);
  let settings: GuildXpSetting | null = $state(null);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";
  let savedSettings: GuildXpSetting | null = null;

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err, m.xp.errorSaveSettings()), "error")
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
      const [loadedChannels, loadedRoles, loadedSettings] = await Promise.all([
        clientApi.getTextChannels(id),
        clientApi.getRoles(id),
        xpApi.getXpSettings(id)
      ]);
      channels = loadedChannels;
      roles = loadedRoles as Role[];
      settings = loadedSettings;
      savedSettings = { ...loadedSettings };
    } catch (err) {
      logger.error("Failed to load XP data:", err);
      notify(errorText(err, m.xp.errorLoadSettings()), "error");
    }
  }

  /**
   * Applies a settings change and saves the whole object.
   * @param changes The fields that changed
   * @param mode Whether to save now or once typing stops
   */
  function patch(changes: Partial<GuildXpSetting>, mode: SaveMode = "typing") {
    const id = guildId;
    if (!settings || !id) return;
    const previous = savedSettings;
    Object.assign(settings, changes);
    const payload = { ...settings } as GuildXpSetting;
    const save = async () => {
      try {
        await xpApi.updateXpSettings(id, payload);
        savedSettings = payload;
      } catch (err) {
        if (mode === "now" && settings && previous && guildId === id) {
          for (const key of Object.keys(changes) as (keyof GuildXpSetting)[]) {
            (settings as any)[key] = previous[key];
          }
        }
        throw err;
      }
    };
    if (mode === "now") void autoSave.now("xpSettings", save);
    else autoSave.schedule("xpSettings", save);
  }

  /**
   * Keeps the page's copy of the background in step.
   * @param value The stored background
   */
  function syncBackground(value: string) {
    if (settings) settings.customXpImageUrl = value;
    if (savedSettings) savedSettings.customXpImageUrl = value;
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
      settings = null;
      void loadGuildData(BigInt($currentGuild.id));
    }
  });
</script>

<svelte:head>
  <title>{m.xp.pageHeadTitle()}</title>
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
  {autoSave}
  icon="fa-star"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.xp.pageTitle()}
  subtitle={m.xp.pageSubtitle()}
>
  {#if guildId}
    {#key guildId}
      <div class="space-y-4 min-w-0" onfocusout={() => autoSave.flush("xpSettings")}>
        <StatsCard {guildId} onerror={(message) => notify(message, "error")} />
        {#if settings}
          <GainCard {settings} onpatch={patch} />
          <LevelUpCard
            {guildId}
            {settings}
            {channels}
            user={data.user}
            onpatch={patch}
            onerror={(message) => notify(message, "error")}
          />
          <RewardsCard
            {guildId}
            {settings}
            {roles}
            onpatch={patch}
            onerror={(message) => notify(message, "error")}
            onsuccess={(message) => notify(message)}
          />
        {/if}
        <MultipliersCard {guildId} {channels} {roles} onerror={(message) => notify(message, "error")} />
        <CompetitionsCard {guildId} {channels} {roles} onerror={(message) => notify(message, "error")} />
        <ExclusionsCard {guildId} {channels} {roles} onerror={(message) => notify(message, "error")} />
        <RankCardCard
          {guildId}
          userId={data.user?.id}
          onerror={(message) => notify(message, "error")}
          onbackground={syncBackground}
        />
        <DesignsLinkCard />
        <LeaderboardCard {guildId} onerror={(message) => notify(message, "error")} />
        <DataCard {guildId} onerror={(message) => notify(message, "error")} onsuccess={(message) => notify(message)} />
      </div>
    {/key}
  {/if}
</PluginPage>
