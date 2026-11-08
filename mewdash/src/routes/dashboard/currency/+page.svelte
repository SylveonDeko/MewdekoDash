<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import { clientApi, currencyApi } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import SetupTab from "./components/SetupTab.svelte";
  import AnalyticsTab from "./components/AnalyticsTab.svelte";
  import ConfigTab from "./components/ConfigTab.svelte";
  import ShopTab from "./components/ShopTab.svelte";
  import BoostsTab from "./components/BoostsTab.svelte";
  import DesignsTab from "./components/DesignsTab.svelte";
  import MembersTab from "./components/MembersTab.svelte";
  import type { Named } from "./components/currencyModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const TABS = ["setup", "analytics", "config", "shop", "designs", "boosts", "members"] as const;
  type TabId = (typeof TABS)[number];

  let roles: Named[] = $state([]);
  let emojis: GuildEmojiInfo[] = $state([]);
  let defaultTab = $state<TabId | null>(null);
  let shopStartNew = $state(false);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" | "warning" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: (_err, key) =>
      notify(key.endsWith("Enabled") ? m.currency.notifySaveFailedUndone() : m.currency.notifySaveFailed(), "error")
  });

  const guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  const requestedTab = $derived(TABS.find((id) => id === page.url.searchParams.get("tab")) ?? null);
  const tab = $derived(requestedTab ?? defaultTab ?? "analytics");

  const labels = $derived<Record<TabId, { label: string; icon: string }>>({
    setup: { label: m.common.setup(), icon: "fa-wand-magic-sparkles" },
    analytics: { label: m.features.analyticsName(), icon: "fa-chart-line" },
    config: { label: m.common.configuration(), icon: "fa-gear" },
    shop: { label: m.currency.tabShop(), icon: "fa-bag-shopping" },
    designs: { label: m.designs.title(), icon: "fa-palette" },
    boosts: { label: m.currency.tabBoosts(), icon: "fa-bolt" },
    members: { label: m.common.members(), icon: "fa-users" }
  });

  function notify(message: string, type: "success" | "error" | "warning" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function select(id: TabId, newShopItem = false) {
    shopStartNew = newShopItem;
    if (id === tab) return;
    void autoSave.flush();
    const url = new URL(page.url);
    url.search = "";
    url.searchParams.set("tab", id);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  function finishSetup() {
    defaultTab = "analytics";
    const url = new URL(page.url);
    url.search = "";
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  async function loadDefaultTab(id: bigint) {
    try {
      defaultTab = (await currencyApi.getSetup(id)).configured ? "analytics" : "setup";
    } catch (err) {
      logger.error("Failed to load the currency setup", err);
      defaultTab = "analytics";
    }
  }

  async function loadEmojis() {
    if (!data.user?.id) return;
    try {
      emojis = await clientApi.getEmojis(data.user.id, true);
    } catch (err) {
      logger.error("Failed to load emojis", err);
    }
  }

  async function loadRoles(id: bigint) {
    try {
      roles = ((await clientApi.getRoles(id)) as any[])
        .filter((role) => !role.managed && !role.name.startsWith("@"))
        .map((role) => ({ id: role.id.toString(), name: role.name, color: role.color || 0 }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      logger.error("Failed to load roles", err);
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
      defaultTab = null;
      void loadRoles(BigInt($currentGuild.id));
      void loadDefaultTab(BigInt($currentGuild.id));
      void loadEmojis();
    }
  });
</script>

<svelte:head>
  <title>{m.currency.pageTitle()}</title>
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
  icon="fa-circle-dollar"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.currency.pageTitle()}
  subtitle={m.currency.pageSubtitle()}
>
  <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.currency.tabsAria()}>
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

  {#if guildId && (requestedTab || defaultTab)}
    {#key `${guildId}:${tab}`}
      {#if tab === "setup"}
        <SetupTab {guildId} {emojis} {autoSave} {notify} onaddshopitem={() => select("shop", true)} oncomplete={finishSetup} />
      {:else if tab === "analytics"}
        <AnalyticsTab {guildId} {notify} />
      {:else if tab === "config"}
        <ConfigTab {guildId} {autoSave} {notify} />
      {:else if tab === "shop"}
        <ShopTab {guildId} {roles} {notify} startNew={shopStartNew} />
      {:else if tab === "designs"}
        <DesignsTab {guildId} {roles} {autoSave} {notify} />
      {:else if tab === "boosts"}
        <BoostsTab {guildId} {notify} />
      {:else}
        <MembersTab {guildId} {notify} />
      {/if}
    {/key}
  {/if}
</PluginPage>
