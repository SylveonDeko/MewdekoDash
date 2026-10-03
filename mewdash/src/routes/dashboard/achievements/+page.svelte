<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
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
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import OverviewTab from "./components/OverviewTab.svelte";
  import LibraryTab from "./components/LibraryTab.svelte";
  import CategoriesTab from "./components/CategoriesTab.svelte";
  import AnnouncementsTab from "./components/AnnouncementsTab.svelte";
  import MembersTab from "./components/MembersTab.svelte";
  import CardsTab from "./components/CardsTab.svelte";
  import SettingsTab from "./components/SettingsTab.svelte";
  import type { PageData } from "./$types";

  /** Page inputs from the server load. */
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let loading = $state(false);
  let loaded = $state(false);
  let message = $state("");
  let messageType: "success" | "error" | "info" = $state("info");
  let messageTimer: ReturnType<typeof setTimeout> | null = null;

  let overview = $state<AchievementOverview | null>(null);
  let catalog = $state<AchievementCatalog | null>(null);
  let lookups = $state<AchievementLookups | null>(null);
  let activeTab = $state("overview");
  let libraryRequest = $state<{ mode: "new" | "edit"; key?: string; nonce: number } | null>(null);

  /** Loads the overview, the catalog, and the lookups together. */
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

      if (!overviewData || !catalogData) {
        showMessage("Couldn't load achievements.", "error");
      }
      overview = overviewData;
      catalog = catalogData;
      lookups = lookupData;
      loaded = true;
    } finally {
      loading = false;
    }
  }

  /** Reloads the overview numbers after something changes. */
  async function refreshOverview() {
    if (!$currentGuild?.id) return;
    try {
      overview = await achievementsApi.overview($currentGuild.id);
    } catch (err) {
      logger.error("Failed to refresh the achievement overview:", err);
    }
  }

  /** Reloads the catalog after a change that touches many achievements. */
  async function refreshCatalog() {
    if (!$currentGuild?.id) return;
    try {
      catalog = await achievementsApi.catalog($currentGuild.id);
    } catch (err) {
      logger.error("Failed to refresh achievements:", err);
    }
  }

  /**
   * Shows the banner above the page for a few seconds.
   * @param text The message
   * @param type Banner tone
   */
  function showMessage(text: string, type: "success" | "error" | "info") {
    message = text;
    messageType = type;
    if (messageTimer) clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
      message = "";
    }, 5000);
  }

  /**
   * Puts a saved achievement into the catalog and refreshes category counts.
   * @param achievement The achievement
   */
  function upsertAchievement(achievement: Achievement) {
    if (!catalog) return;
    const index = catalog.achievements.findIndex((a) => a.key === achievement.key);
    const achievements = index === -1
      ? [...catalog.achievements, achievement]
      : catalog.achievements.map((a) => (a.key === achievement.key ? achievement : a));
    catalog = { ...catalog, achievements, categories: recount(catalog.categories, achievements) };
  }

  /**
   * Removes an achievement from the catalog.
   * @param key The achievement key
   */
  function removeAchievement(key: string) {
    if (!catalog) return;
    const achievements = catalog.achievements.filter((a) => a.key !== key);
    catalog = { ...catalog, achievements, categories: recount(catalog.categories, achievements) };
  }

  /**
   * Category counts recomputed from the achievements.
   * @param categories The categories
   * @param achievements The achievements
   */
  function recount(categories: AchievementCategory[], achievements: Achievement[]): AchievementCategory[] {
    return categories.map((c) => {
      const items = achievements.filter((a) => a.categoryKey === c.key);
      return { ...c, achievementCount: items.length, enabledCount: items.filter((a) => a.enabled).length };
    });
  }

  /**
   * Stores saved settings in the overview.
   * @param settings The settings
   */
  function setSettings(settings: AchievementSettings) {
    if (overview) overview = { ...overview, settings };
  }

  /**
   * Opens the library editor on an achievement or a blank one.
   * @param mode New or edit
   * @param key The achievement key when editing
   */
  function openEditor(mode: "new" | "edit", key?: string) {
    activeTab = "library";
    libraryRequest = { mode, key, nonce: Date.now() };
  }

  onMount(() => {
    loadAll();
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: "fa-gauge" },
    { id: "library", label: "Achievements", icon: "fa-crown" },
    { id: "categories", label: "Categories", icon: "fa-layer-group" },
    { id: "announcements", label: "Announcements", icon: "fa-bullhorn" },
    { id: "cards", label: "Cards", icon: "fa-id-card" },
    { id: "members", label: "Members", icon: "fa-users" },
    { id: "settings", label: "Settings", icon: "fa-sliders" }
  ];

  let actionButtons = $derived([
    {
      label: "New achievement",
      icon: "fa-plus",
      action: () => openEditor("new"),
      disabled: !catalog
    },
    {
      label: "Refresh",
      icon: "fa-arrows-rotate",
      action: loadAll,
      loading: loading
    }
  ]);
</script>

{#snippet statusMessageContent()}
  {#if message}
    <div class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-all"
         style="background: {messageType === 'success' ? '#10b98120' : messageType === 'error' ? '#ef444420' : $colorStore.primary + '20'};
                border: 1px solid {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}30;"
         in:fly={{ x: 20, duration: 300 }}
         role="status">
      {#if messageType === 'success'}
        <i class="fa-utility-duo fa-regular fa-circle-check"
           style="--fa-primary-color: #10b981; --fa-secondary-color: #059669; font-size: 20px;"></i>
      {:else}
        <i class="fa-utility-duo fa-regular fa-circle-exclamation"
           style="--fa-primary-color: {messageType === 'error' ? '#ef4444' : $colorStore.primary}; --fa-secondary-color: {messageType === 'error' ? '#dc2626' : $colorStore.secondary}; font-size: 20px;"></i>
      {/if}
      <span style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
    </div>
  {/if}

  {#if overview && !overview.settings.enabled && activeTab !== "overview"}
    <div class="mb-6 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3"
         style="background: {$colorStore.accent}20; border: 1px solid {$colorStore.accent}30;"
         in:fly={{ x: -20, duration: 300 }}>
      <div class="flex items-center gap-3 flex-1">
        <i class="fa-utility-duo fa-regular fa-circle-exclamation"
           style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
        <span style="color: {$colorStore.text}">Earning is paused in this server, so nothing unlocks yet. You can still set everything up first.</span>
      </div>
      <button type="button"
              class="px-4 py-2 rounded-lg min-h-[44px] text-sm font-medium transition-all hover:scale-[1.02]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={() => { activeTab = "overview"; }}>
        Start earning
      </button>
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  bind:activeTab
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-crown"
  statusMessages={statusMessageContent}
  subtitle="Milestones, badges, and ranks members earn by taking part"
  {tabs}
  title="Achievements"
>
  {#if !loaded}
    <div class="flex items-center justify-center py-16" style="color: {$colorStore.muted}">
      <i class="fa-solid fa-spinner fa-spin text-2xl" aria-hidden="true"></i>
      <span class="sr-only">Loading</span>
    </div>
  {:else if overview && catalog}
    <div class:hidden={activeTab !== 'overview'}>
      <OverviewTab
        {overview}
        {catalog}
        onsettings={(s) => { setSettings(s); refreshOverview(); }}
        onsources={(sources) => { if (overview) overview = { ...overview, dataSources: sources }; }}
        onopen={(key) => openEditor("edit", key)}
        ongoto={(tab) => { activeTab = tab; }}
        onerror={(text) => showMessage(text, "error")}
        onsuccess={(text) => showMessage(text, "success")}
      />
    </div>

    <div class:hidden={activeTab !== 'library'}>
      <LibraryTab
        {catalog}
        {lookups}
        request={libraryRequest}
        onsaved={(a) => { upsertAchievement(a); refreshOverview(); }}
        onremoved={(key) => { removeAchievement(key); refreshOverview(); }}
        onbulk={async () => { await refreshCatalog(); refreshOverview(); }}
        ongotocategories={() => { activeTab = "categories"; }}
        onerror={(text) => showMessage(text, "error")}
        onsuccess={(text) => showMessage(text, "success")}
      />
    </div>

    <div class:hidden={activeTab !== 'categories'}>
      <CategoriesTab
        {catalog}
        {lookups}
        settings={overview.settings}
        onchanged={async () => { await refreshCatalog(); refreshOverview(); }}
        onerror={(text) => showMessage(text, "error")}
        onsuccess={(text) => showMessage(text, "success")}
      />
    </div>

    <div class:hidden={activeTab !== 'announcements'}>
      <AnnouncementsTab
        settings={overview.settings}
        {catalog}
        {lookups}
        user={data.user}
        onsaved={setSettings}
        onerror={(text) => showMessage(text, "error")}
        onsuccess={(text) => showMessage(text, "success")}
      />
    </div>

    <div class:hidden={activeTab !== 'cards'}>
      {#if activeTab === 'cards'}
        <CardsTab {catalog} onerror={(text) => showMessage(text, "error")} />
      {/if}
    </div>

    <div class:hidden={activeTab !== 'members'}>
      {#if activeTab === 'members'}
        <MembersTab
          {catalog}
          onchanged={refreshOverview}
          onerror={(text) => showMessage(text, "error")}
          onsuccess={(text) => showMessage(text, "success")}
        />
      {/if}
    </div>

    <div class:hidden={activeTab !== 'settings'}>
      <SettingsTab
        settings={overview.settings}
        {catalog}
        {lookups}
        onsaved={setSettings}
        onreset={async () => { await refreshCatalog(); refreshOverview(); }}
        onerror={(text) => showMessage(text, "error")}
        onsuccess={(text) => showMessage(text, "success")}
      />
    </div>
  {/if}
</DashboardPageLayout>
