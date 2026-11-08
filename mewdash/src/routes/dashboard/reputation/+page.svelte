<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import { clientApi, reputationApi } from "$lib/api/index.ts";
  import type { RepConfig } from "$lib/api/reputation/models";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { colorStore } from "$lib/stores/colorStore";
  import type { PageData } from "./$types";
  import { logger } from "$lib/logger";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import ConfigTab from "./components/ConfigTab.svelte";
  import RewardsTab from "./components/RewardsTab.svelte";
  import ReactionsTab from "./components/ReactionsTab.svelte";
  import LeaderboardTab from "./components/LeaderboardTab.svelte";
  import StatsTab from "./components/StatsTab.svelte";
  import type { Named } from "./components/repModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const TABS = ["config", "rewards", "reactions", "leaderboard", "stats"] as const;
  type TabId = (typeof TABS)[number];

  let config = $state<RepConfig | null>(null);
  let channels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let emojis: GuildEmojiInfo[] = $state([]);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";
  let toggling = false;

  const autoSave = createAutoSave({
    onError: () => notify(m.reputation.errorSave(), "error")
  });

  const guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find((id) => id === requested) ?? "config";
  });

  const labels = $derived<Record<TabId, { label: string; icon: string }>>({
    config: { label: m.common.configuration(), icon: "fa-gear" },
    rewards: { label: m.features.wizardXpStepRewardsTitle(), icon: "fa-crown" },
    reactions: { label: m.reputation.tabReactions(), icon: "fa-face-smile" },
    leaderboard: { label: m.common.leaderboard(), icon: "fa-ranking-star" },
    stats: { label: m.common.statistics(), icon: "fa-chart-bar" }
  });

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
    void autoSave.flush();
    const url = new URL(page.url);
    url.search = "";
    url.searchParams.set("tab", id);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  async function setEnabled(value: boolean) {
    const id = guildId;
    if (!id || !config || toggling) return;
    toggling = true;
    const previous = config.enabled;
    config.enabled = value;
    try {
      await reputationApi.setEnabled(id, value);
    } catch (err) {
      logger.error("Failed to switch reputation:", err);
      if (config) config.enabled = previous;
      notify(m.reputation.errorSave(), "error");
    } finally {
      toggling = false;
    }
  }

  async function loadGuildData(id: bigint) {
    const results = await Promise.allSettled([
      reputationApi.getRepConfig(id).then((value) => (config = value)),
      clientApi.getTextChannels(id).then((value) => (channels = value as Named[])),
      clientApi.getRoles(id).then(
        (value) =>
          (roles = (value as any[])
            .filter((role) => role.id.toString() !== id.toString() && !role.managed && !role.name.startsWith("@"))
            .map((role) => ({ id: role.id.toString(), name: role.name, color: role.color || 0 }))
            .sort((a, b) => a.name.localeCompare(b.name)))
      ),
      data.user?.id ? clientApi.getEmojis(data.user.id, true).then((value) => (emojis = value)) : Promise.resolve()
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load reputation data:", result.reason);
    }
    if (!config) notify(m.reputation.errorLoad(), "error");
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
      config = null;
      void loadGuildData(BigInt($currentGuild.id));
    }
  });
</script>

<svelte:head>
  <title>{m.reputation.pageTitle()}</title>
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
  icon="fa-star"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.reputation.pageTitle()}
  subtitle={m.reputation.pageSubtitle()}
  enabled={config?.enabled}
  onToggle={setEnabled}
>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.reputation.tabsAria()}>
    {#each TABS as id (id)}
      {@const selected = tab === id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => select(id)}
      >
        <i class="fa-solid {labels[id].icon}" aria-hidden="true"></i>
        {labels[id].label}
      </button>
    {/each}
  </div>

  {#if guildId && config}
    {#key `${guildId}:${tab}`}
      {#if tab === "config"}
        <ConfigTab {guildId} {config} {channels} {autoSave} />
      {:else if tab === "rewards"}
        <RewardsTab {guildId} {roles} {channels} {notify} />
      {:else if tab === "reactions"}
        <ReactionsTab {guildId} {emojis} {notify} />
      {:else if tab === "leaderboard"}
        <LeaderboardTab {guildId} adminId={data.user?.id ? String(data.user.id) : null} {notify} />
      {:else}
        <StatsTab {guildId} {notify} />
      {/if}
    {/key}
  {/if}
</PluginPage>
