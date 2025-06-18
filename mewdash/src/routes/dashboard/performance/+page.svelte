<!-- routes/dashboard/performance/+page.svelte -->
<script lang="ts">
  import PerformanceMonitor from "$lib/components/PerformanceMonitor.svelte";
  import SystemInfoMonitor from "$lib/components/SystemInfoMonitor.svelte";
  import EventMetricsMonitor from "$lib/components/EventMetricsMonitor.svelte";
  import ModuleMetricsMonitor from "$lib/components/ModuleMetricsMonitor.svelte";
  import { api } from "$lib/api.ts";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  export let data;

  let activeTab = "overview";

  onMount(async () => {
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
  });

  const tabs = [
    { id: "overview", label: "Overview", description: "System resources and top performance metrics" },
    { id: "methods", label: "Methods", description: "Method execution performance" },
    { id: "events", label: "Events", description: "Discord event processing metrics" },
    { id: "modules", label: "Modules", description: "Module performance and error rates" }
  ];

  const setActiveTab = (tabId: string) => {
    activeTab = tabId;
  };
</script>

<div class="container mx-auto px-4 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-white mb-2">Bot Performance Dashboard</h1>
    <p class="text-gray-300">Monitor system resources, method performance, event processing, and module metrics for your
      bot instance.</p>
  </div>

  <!-- Tab Navigation -->
  <div class="mb-8">
    <nav class="flex space-x-1 bg-gray-900 p-1 rounded-lg">
      {#each tabs as tab}
        <button
          class="flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors {
            activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-300 hover:text-white hover:bg-gray-800'
          }"
          on:click={() => setActiveTab(tab.id)}
        >
          <div class="text-center">
            <div class="font-semibold">{tab.label}</div>
            <div class="text-xs opacity-75 mt-1">{tab.description}</div>
          </div>
        </button>
      {/each}
    </nav>
  </div>

  <!-- Tab Content -->
  <div class="tab-content">
    {#if activeTab === 'overview'}
      <div class="space-y-8">
        <SystemInfoMonitor {data} />

        <!-- Quick Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-gray-800 p-6 rounded-lg">
            <h3 class="text-lg font-semibold text-white mb-2">System Health</h3>
            <p class="text-gray-300 text-sm">CPU usage, memory consumption, and system uptime</p>
          </div>
          <div class="bg-gray-800 p-6 rounded-lg">
            <h3 class="text-lg font-semibold text-white mb-2">Event Processing</h3>
            <p class="text-gray-300 text-sm">Discord events handled and processing efficiency</p>
          </div>
          <div class="bg-gray-800 p-6 rounded-lg">
            <h3 class="text-lg font-semibold text-white mb-2">Module Performance</h3>
            <p class="text-gray-300 text-sm">Individual module execution times and error rates</p>
          </div>
        </div>
      </div>
    {:else if activeTab === 'methods'}
      <PerformanceMonitor {data} />
    {:else if activeTab === 'events'}
      <EventMetricsMonitor {data} />
    {:else if activeTab === 'modules'}
      <ModuleMetricsMonitor {data} />
    {/if}
  </div>
</div>

<style>
    .tab-content {
        min-height: 400px;
    }
</style>