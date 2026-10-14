<!-- routes/owner/performance/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
    import PerformanceMonitor from "$lib/components/monitoring/PerformanceMonitor.svelte";
    import SystemInfoMonitor from "$lib/components/monitoring/SystemInfoMonitor.svelte";
    import EventMetricsMonitor from "$lib/components/monitoring/EventMetricsMonitor.svelte";
    import ModuleMetricsMonitor from "$lib/components/monitoring/ModuleMetricsMonitor.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
    import { ownershipApi } from "$lib/api/index.ts";
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    import {loadingStore} from "$lib/stores/loadingStore";
    import {colorStore} from "$lib/stores/colorStore";

    let {data} = $props();

  let activeTab = $state("overview");

  onMount(async () => {
    await loadingStore.wrap("owner-check", async () => {
      try {
        let isOwner = await ownershipApi.isOwner(BigInt(data.user.id));

        if (!isOwner) {
          goto("/dashboard");
        }
      } catch (error) {
        goto("/dashboard");
      }
    }, "critical", m.common.checkingPermissions());
  });

  const tabs = $derived([
    { id: "overview", label: m.common.overview(), icon: "fa-chart-bar" },
    { id: "methods", label: m.owner.performanceTabMethods(), icon: "fa-clock" },
    { id: "events", label: m.common.events(), icon: "fa-bell" },
    { id: "modules", label: m.common.modules(), icon: "fa-square" }
  ]);
</script>

<DashboardPageLayout
  icon="fa-chart-simple"
  subtitle={m.owner.performanceSubtitle()}
  title={m.features.performanceName()}
  guildName={m.owner.performanceGuildName()}
  basePath="/owner/performance"
  tabs={tabs}
  bind:activeTab
>
  {#if activeTab === 'overview'}
    <SystemInfoMonitor {data} />
  {:else if activeTab === 'methods'}
    <PerformanceMonitor {data} />
  {:else if activeTab === 'events'}
    <EventMetricsMonitor {data} />
  {:else if activeTab === 'modules'}
    <ModuleMetricsMonitor {data} />
  {/if}
</DashboardPageLayout>