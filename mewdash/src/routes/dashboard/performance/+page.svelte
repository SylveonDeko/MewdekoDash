<!-- routes/dashboard/performance/+page.svelte -->
<script lang="ts">
    import PerformanceMonitor from "$lib/components/monitoring/PerformanceMonitor.svelte";
    import SystemInfoMonitor from "$lib/components/monitoring/SystemInfoMonitor.svelte";
    import EventMetricsMonitor from "$lib/components/monitoring/EventMetricsMonitor.svelte";
    import ModuleMetricsMonitor from "$lib/components/monitoring/ModuleMetricsMonitor.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
    import {api} from "$lib/api.ts";
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    import {Activity, BarChart3, Package, Zap, Cpu} from "lucide-svelte";
    import {loadingStore} from "$lib/stores/loadingStore";
    import {colorStore} from "$lib/stores/colorStore";

    let {data} = $props();

  let activeTab = $state("overview");

  onMount(async () => {
    await loadingStore.wrap("owner-check", async () => {
      try {
        let isOwner = await api.isOwner(BigInt(data.user.id));

        console.log(isOwner);

        if (!isOwner) {
          goto("/dashboard");
        }
      } catch (error) {
        console.error("Error checking owner status:", error);
        goto("/dashboard");
      }
    }, "critical", "Checking permissions...");
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "methods", label: "Methods", icon: Activity },
    { id: "events", label: "Events", icon: Zap },
    { id: "modules", label: "Modules", icon: Package }
  ];
</script>

<DashboardPageLayout 
  title="Performance" 
  subtitle="Monitor system resources, method performance, event processing, and module metrics" 
  icon={BarChart3}
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