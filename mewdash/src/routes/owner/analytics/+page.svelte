<!-- routes/owner/analytics/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount, untrack } from "svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import FilterBar from "$lib/components/analytics/FilterBar.svelte";
  import OverviewTab from "$lib/components/analytics/tabs/OverviewTab.svelte";
  import CommandsTab from "$lib/components/analytics/tabs/CommandsTab.svelte";
  import EventsTab from "$lib/components/analytics/tabs/EventsTab.svelte";
  import LatencyTab from "$lib/components/analytics/tabs/LatencyTab.svelte";
  import ServersTab from "$lib/components/analytics/tabs/ServersTab.svelte";
  import GuildsTab from "$lib/components/analytics/tabs/GuildsTab.svelte";
  import FeaturesTab from "$lib/components/analytics/tabs/FeaturesTab.svelte";
  import AiTab from "$lib/components/analytics/tabs/AiTab.svelte";
  import MusicTab from "$lib/components/analytics/tabs/MusicTab.svelte";
  import WebsiteTab from "$lib/components/analytics/tabs/WebsiteTab.svelte";
  import AlertsTab from "$lib/components/analytics/tabs/AlertsTab.svelte";
  import PipelineTab from "$lib/components/analytics/tabs/PipelineTab.svelte";
  import { ownershipApi } from "$lib/api/index.ts";
  import { loadingStore } from "$lib/stores/loadingStore";
  import { analyticsFilters, readFilters, syncFiltersToUrl } from "$lib/stores/analyticsFilters";

  let { data } = $props();

  const tabs = $derived([
    { id: "overview", label: m.common.overview(), icon: "fa-gauge-high" },
    { id: "commands", label: m.common.commands(), icon: "fa-terminal" },
    { id: "events", label: m.common.events(), icon: "fa-bolt" },
    { id: "latency", label: m.common.latency(), icon: "fa-stopwatch" },
    { id: "servers", label: m.common.servers(), icon: "fa-server" },
    { id: "guilds", label: m.analytics.pageTabGuilds(), icon: "fa-people-group" },
    { id: "features", label: m.common.features(), icon: "fa-puzzle-piece" },
    { id: "ai", label: m.analytics.pageTabAi(), icon: "fa-robot" },
    { id: "music", label: m.features.musicName(), icon: "fa-music" },
    { id: "website", label: m.analytics.pageTabWebsite(), icon: "fa-globe" },
    { id: "alerts", label: m.common.alerts(), icon: "fa-bell" },
    { id: "pipeline", label: m.analytics.pageTabPipeline(), icon: "fa-diagram-project" },
  ]);

  const parsed = readFilters(page.url.searchParams);
  const initial = untrack(() => tabs).some((t) => t.id === parsed.tab) ? parsed : { ...parsed, tab: "overview" };
  if (browser) analyticsFilters.set(initial);

  let activeTab = $state(initial.tab);
  let allowed = $state(false);

  function onTabChange({ tabId }: { tabId: string }) {
    analyticsFilters.update((f) => ({ ...f, tab: tabId }));
    syncFiltersToUrl();
  }

  onMount(async () => {
    await loadingStore.wrap("owner-check", async () => {
      try {
        const isOwner = await ownershipApi.isOwner(BigInt(data.user.id));
        if (!isOwner) {
          goto("/dashboard");
          return;
        }
        allowed = true;
      } catch {
        goto("/dashboard");
      }
    }, "critical", m.common.checkingPermissions());
  });
</script>

<DashboardPageLayout
  icon="fa-chart-simple"
  title={m.features.analyticsName()}
  subtitle={m.features.analyticsDescription()}
  guildName={m.analytics.pageGuildName()}
  category="Analytics"
  basePath="/owner/analytics"
  {tabs}
  bind:activeTab
  ontabChange={onTabChange}
>
  {#if allowed}
    <FilterBar />

    {#if activeTab === "overview"}
      <OverviewTab />
    {:else if activeTab === "commands"}
      <CommandsTab />
    {:else if activeTab === "events"}
      <EventsTab />
    {:else if activeTab === "latency"}
      <LatencyTab />
    {:else if activeTab === "servers"}
      <ServersTab />
    {:else if activeTab === "guilds"}
      <GuildsTab />
    {:else if activeTab === "features"}
      <FeaturesTab />
    {:else if activeTab === "ai"}
      <AiTab />
    {:else if activeTab === "music"}
      <MusicTab />
    {:else if activeTab === "website"}
      <WebsiteTab />
    {:else if activeTab === "alerts"}
      <AlertsTab />
    {:else if activeTab === "pipeline"}
      <PipelineTab />
    {/if}
  {/if}
</DashboardPageLayout>
