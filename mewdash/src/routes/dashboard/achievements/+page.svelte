<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import {
    achievementsApi,
    type Achievement,
    type AchievementCatalog,
    type AchievementCategory,
    type AchievementLookups,
    type AchievementOverview,
    type AchievementSettings
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import OverviewTab from "./components/OverviewTab.svelte";
  import LibraryTab from "./components/LibraryTab.svelte";
  import CategoriesTab from "./components/CategoriesTab.svelte";
  import AnnouncementsTab from "./components/AnnouncementsTab.svelte";
  import MembersTab from "./components/MembersTab.svelte";
  import CardsTab from "./components/CardsTab.svelte";
  import SettingsTab from "./components/SettingsTab.svelte";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const TABS = ["overview", "library", "categories", "announcements", "cards", "members", "settings"] as const;
  type TabId = (typeof TABS)[number];

  const autoSave = createAutoSave({
    onError: (err) => showMessage((err as Error)?.message || m.common.failedToSaveTheSettings(), "error")
  });

  let loading = $state(false);
  let loaded = $state(false);
  let message = $state("");
  let messageType: "success" | "error" = $state("success");
  let messageTimer: ReturnType<typeof setTimeout> | null = null;

  let overview = $state<AchievementOverview | null>(null);
  let catalog = $state<AchievementCatalog | null>(null);
  let lookups = $state<AchievementLookups | null>(null);
  let libraryRequest = $state<{ mode: "new" | "edit"; key?: string; nonce: number } | null>(null);
  let toggling = false;

  const activeTab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find((id) => id === requested) ?? "overview";
  });

  const labels = $derived<Record<TabId, { label: string; icon: string }>>({
    overview: { label: m.common.overview(), icon: "fa-gauge" },
    library: { label: m.features.achievementsName(), icon: "fa-crown" },
    categories: { label: m.common.categories(), icon: "fa-layer-group" },
    announcements: { label: m.common.announcements(), icon: "fa-bullhorn" },
    cards: { label: m.achievements.tabCards(), icon: "fa-id-card" },
    members: { label: m.common.members(), icon: "fa-users" },
    settings: { label: m.common.settings(), icon: "fa-sliders" }
  });

  function selectTab(id: TabId) {
    if (id === activeTab) return;
    void autoSave.flush();
    const url = new URL(page.url);
    url.searchParams.set("tab", id);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  async function loadAll() {
    if (!$currentGuild?.id) return;
    loading = true;
    try {
      const guildId = $currentGuild.id;
      const [overviewData, catalogData, lookupData] = await Promise.all([
        achievementsApi.overview(guildId).catch((err) => {
          logger.error("Failed to load the achievement overview:", err);
          return null;
        }),
        achievementsApi.catalog(guildId).catch((err) => {
          logger.error("Failed to load achievements:", err);
          return null;
        }),
        achievementsApi.lookups(guildId).catch(() => null)
      ]);

      if (!overviewData || !catalogData) showMessage(m.achievements.pageLoadFailed(), "error");
      overview = overviewData;
      catalog = catalogData;
      lookups = lookupData;
      loaded = true;
    } finally {
      loading = false;
    }
  }

  async function refreshOverview() {
    if (!$currentGuild?.id) return;
    try {
      overview = await achievementsApi.overview($currentGuild.id);
    } catch (err) {
      logger.error("Failed to refresh the achievement overview:", err);
    }
  }

  async function refreshCatalog() {
    if (!$currentGuild?.id) return;
    try {
      catalog = await achievementsApi.catalog($currentGuild.id);
    } catch (err) {
      logger.error("Failed to refresh achievements:", err);
    }
  }

  function showMessage(text: string, type: "success" | "error") {
    message = text;
    messageType = type;
    if (messageTimer) clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
      message = "";
    }, 4000);
  }

  function upsertAchievement(achievement: Achievement) {
    if (!catalog) return;
    const index = catalog.achievements.findIndex((a) => a.key === achievement.key);
    const achievements =
      index === -1
        ? [...catalog.achievements, achievement]
        : catalog.achievements.map((a) => (a.key === achievement.key ? achievement : a));
    catalog = { ...catalog, achievements, categories: recount(catalog.categories, achievements) };
  }

  function removeAchievement(key: string) {
    if (!catalog) return;
    const achievements = catalog.achievements.filter((a) => a.key !== key);
    catalog = { ...catalog, achievements, categories: recount(catalog.categories, achievements) };
  }

  function recount(categories: AchievementCategory[], achievements: Achievement[]): AchievementCategory[] {
    return categories.map((c) => {
      const items = achievements.filter((a) => a.categoryKey === c.key);
      return { ...c, achievementCount: items.length, enabledCount: items.filter((a) => a.enabled).length };
    });
  }

  function setSettings(settings: AchievementSettings) {
    if (overview) overview = { ...overview, settings };
  }

  function openEditor(mode: "new" | "edit", key?: string) {
    libraryRequest = { mode, key, nonce: Date.now() };
    selectTab("library");
  }

  async function setEnabled(enabled: boolean) {
    const guildId = $currentGuild?.id;
    if (!guildId || !overview || toggling) return;
    toggling = true;
    const previous = overview.settings;
    overview = { ...overview, settings: { ...previous, enabled } };
    try {
      setSettings(await achievementsApi.updateSettings(guildId, { enabled }));
      if (enabled && !previous.backfilledAt) showMessage(m.achievements.overviewStartedMessage(), "success");
    } catch (err: any) {
      logger.error("Failed to switch achievements:", err);
      if (overview) overview = { ...overview, settings: previous };
      showMessage(err?.message || m.common.saveFailedInline(), "error");
    } finally {
      toggling = false;
    }
  }

  onMount(() => {
    void loadAll();
  });

  const actionButtons = $derived([
    { label: m.achievements.editorNewTitle(), icon: "fa-plus", action: () => openEditor("new"), disabled: !catalog },
    { label: m.common.refresh(), icon: "fa-arrows-rotate", action: loadAll, loading }
  ]);
</script>

<svelte:head>
  <title>{m.features.achievementsName()}</title>
</svelte:head>

{#snippet statusMessages()}
  {#if message}
    <div class="fixed top-4 right-4 z-[10001]" transition:fade>
      <Notification {message} type={messageType} />
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  {actionButtons}
  icon="fa-crown"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.achievementsName()}
  subtitle={m.achievements.pageSubtitle()}
  enabled={overview?.settings.enabled}
  onToggle={setEnabled}
>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.achievements.tabsAria()}>
    {#each TABS as id (id)}
      {@const selected = activeTab === id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => selectTab(id)}
      >
        <i class="fa-solid {labels[id].icon}" aria-hidden="true"></i>
        {labels[id].label}
      </button>
    {/each}
  </div>

  {#if !loaded}
    <div class="flex items-center justify-center py-16" style="color: {$colorStore.muted}">
      <i class="fa-solid fa-spinner fa-spin text-2xl" aria-hidden="true"></i>
      <span class="sr-only">{m.common.loading()}</span>
    </div>
  {:else if overview && catalog}
    {#if !overview.settings.enabled && activeTab !== "overview"}
      <p
        class="p-3 rounded-lg text-sm border"
        style="background: {$colorStore.accent}10; border-color: {$colorStore.accent}30; color: {$colorStore.text};"
        role="status"
      >
        {m.achievements.pagePausedNotice()}
      </p>
    {/if}

    <div class:hidden={activeTab !== "overview"}>
      <OverviewTab
        {overview}
        {catalog}
        onsources={(sources) => {
          if (overview) overview = { ...overview, dataSources: sources };
        }}
        onopen={(key) => openEditor("edit", key)}
        ongoto={(tab) => selectTab(tab as TabId)}
        onerror={(text) => showMessage(text, "error")}
      />
    </div>

    <div class:hidden={activeTab !== "library"}>
      <LibraryTab
        {catalog}
        {lookups}
        request={libraryRequest}
        onsaved={(a) => {
          upsertAchievement(a);
          void refreshOverview();
        }}
        onremoved={(key) => {
          removeAchievement(key);
          void refreshOverview();
        }}
        onbulk={async () => {
          await refreshCatalog();
          void refreshOverview();
        }}
        ongotocategories={() => selectTab("categories")}
        onerror={(text) => showMessage(text, "error")}
        onsuccess={(text) => showMessage(text, "success")}
      />
    </div>

    <div class:hidden={activeTab !== "categories"}>
      <CategoriesTab
        {catalog}
        {lookups}
        settings={overview.settings}
        onchanged={async () => {
          await refreshCatalog();
          void refreshOverview();
        }}
        onerror={(text) => showMessage(text, "error")}
        onsuccess={(text) => showMessage(text, "success")}
      />
    </div>

    <div class:hidden={activeTab !== "announcements"}>
      <AnnouncementsTab
        settings={overview.settings}
        {catalog}
        {lookups}
        user={data.user}
        {autoSave}
        onsaved={setSettings}
        onerror={(text) => showMessage(text, "error")}
      />
    </div>

    <div class:hidden={activeTab !== "cards"}>
      {#if activeTab === "cards"}
        <CardsTab {catalog} {lookups} onerror={(text) => showMessage(text, "error")} />
      {/if}
    </div>

    <div class:hidden={activeTab !== "members"}>
      {#if activeTab === "members"}
        <MembersTab
          {catalog}
          onchanged={refreshOverview}
          onerror={(text) => showMessage(text, "error")}
          onsuccess={(text) => showMessage(text, "success")}
        />
      {/if}
    </div>

    <div class:hidden={activeTab !== "settings"}>
      <SettingsTab
        settings={overview.settings}
        {lookups}
        {autoSave}
        onsaved={setSettings}
        onreset={async () => {
          await refreshCatalog();
          void refreshOverview();
        }}
        onerror={(text) => showMessage(text, "error")}
        onsuccess={(text) => showMessage(text, "success")}
      />
    </div>
  {/if}
</PluginPage>
