<!-- routes/dashboard/performance/+page.svelte -->
<script lang="ts">
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
    }, "critical", "Checking permissions...");
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: "fa-chart-bar" },
    { id: "methods", label: "Methods", icon: "fa-clock" },
    { id: "events", label: "Events", icon: "fa-bell" },
    { id: "modules", label: "Modules", icon: "fa-square" }
  ];
</script>

<DashboardPageLayout
  icon="fa-chart-bar"
  subtitle="Monitor system resources, method performance, event processing, and module metrics"
  title="Performance"
  guildName="Bot Performance Dashboard"
  tabs={tabs}
  bind:activeTab
  on:tabChange={(e) => activeTab = e.detail.tabId}
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