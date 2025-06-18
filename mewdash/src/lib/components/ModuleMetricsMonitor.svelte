<!-- lib/components/ModuleMetricsMonitor.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api.ts";
  import { logger } from "$lib/logger.ts";

  export let data;

  type ModuleMetric = {
    moduleName: string;
    eventsProcessed: number;
    errors: number;
    totalExecutionTime: number;
    averageExecutionTime: number;
    errorRate: number;
  };

  let moduleMetrics: ModuleMetric[] = [];
  let loading = true;
  let error: string | null = null;
  let refreshInterval: number;
  let refreshInProgress = false;
  let userId = data?.user?.id ? BigInt(data.user.id) : null;
  let sortField: keyof ModuleMetric = "eventsProcessed";
  let sortDirection: "asc" | "desc" = "desc";

  const fetchModuleMetrics = async () => {
    if (!userId || refreshInProgress) return;

    try {
      refreshInProgress = true;
      error = null;
      moduleMetrics = await api.getModuleMetrics(userId);
      sortData();
    } catch (err) {
      logger.error("Error fetching module metrics:", err);
      error = "Failed to load module metrics";
    } finally {
      loading = false;
      refreshInProgress = false;
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const sortBy = (field: keyof ModuleMetric) => {
    if (sortField === field) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortField = field;
      sortDirection = "desc";
    }
    sortData();
  };

  const sortData = () => {
    moduleMetrics = [...moduleMetrics].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (sortDirection === "asc") {
        return (aVal as number) - (bVal as number);
      }
      return (bVal as number) - (aVal as number);
    });
  };

  const getSortIcon = (field: keyof ModuleMetric) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getErrorRateColor = (errorRate: number) => {
    if (errorRate === 0) return "text-green-400";
    if (errorRate < 1) return "text-yellow-400";
    if (errorRate < 5) return "text-orange-400";
    return "text-red-400";
  };

  const getModuleBadgeColor = (moduleName: string) => {
    // Give different colors to different module types
    if (moduleName === "Legacy") return "bg-purple-600";
    if (moduleName.includes("Command")) return "bg-blue-600";
    if (moduleName.includes("Event")) return "bg-green-600";
    if (moduleName.includes("Service")) return "bg-orange-600";
    return "bg-gray-600";
  };

  onMount(async () => {
    if (userId) {
      await fetchModuleMetrics();
      refreshInterval = window.setInterval(fetchModuleMetrics, 10000); // Refresh every 10 seconds
    }
  });

  onDestroy(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
</script>

<div class="max-w-6xl mx-auto p-6 bg-gray-800 rounded-lg shadow-md mb-8">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-2xl font-bold text-white">Module Metrics</h2>
    <button
      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
      disabled={refreshInProgress}
      on:click={fetchModuleMetrics}
    >
      {refreshInProgress ? 'Refreshing...' : 'Refresh'}
    </button>
  </div>

  {#if error}
    <div class="bg-red-500/10 text-red-400 p-4 rounded-md mb-6">
      {error}
    </div>
  {/if}

  {#if loading && moduleMetrics.length === 0}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  {:else if moduleMetrics.length === 0}
    <div class="text-center p-8 text-gray-400">
      <p>No module metrics available yet.</p>
      <p class="mt-2 text-sm">Module metrics will appear as your bot modules process events.</p>
    </div>
  {:else}
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-gray-750 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-300 mb-1">Active Modules</h3>
        <div class="text-2xl font-bold text-white">
          {moduleMetrics.length}
        </div>
      </div>
      <div class="bg-gray-750 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-300 mb-1">Total Events</h3>
        <div class="text-2xl font-bold text-blue-400">
          {formatNumber(moduleMetrics.reduce((sum, metric) => sum + metric.eventsProcessed, 0))}
        </div>
      </div>
      <div class="bg-gray-750 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-300 mb-1">Total Errors</h3>
        <div class="text-2xl font-bold text-red-400">
          {formatNumber(moduleMetrics.reduce((sum, metric) => sum + metric.errors, 0))}
        </div>
      </div>
      <div class="bg-gray-750 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-300 mb-1">Avg Error Rate</h3>
        <div class="text-2xl font-bold text-yellow-400">
          {(moduleMetrics.reduce((sum, metric) => sum + metric.errorRate, 0) / moduleMetrics.length || 0).toFixed(2)}%
        </div>
      </div>
    </div>

    <!-- Modules Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-gray-200">
        <thead>
        <tr class="bg-gray-700">
          <th class="px-4 py-3 text-left">
            <button class="text-left font-bold hover:text-blue-300" on:click={() => sortBy('moduleName')}>
              Module Name {getSortIcon('moduleName')}
            </button>
          </th>
          <th class="px-4 py-3 text-right">
            <button class="text-right font-bold hover:text-blue-300" on:click={() => sortBy('eventsProcessed')}>
              Events Processed {getSortIcon('eventsProcessed')}
            </button>
          </th>
          <th class="px-4 py-3 text-right">
            <button class="text-right font-bold hover:text-blue-300" on:click={() => sortBy('errors')}>
              Errors {getSortIcon('errors')}
            </button>
          </th>
          <th class="px-4 py-3 text-right">
            <button class="text-right font-bold hover:text-blue-300" on:click={() => sortBy('errorRate')}>
              Error Rate {getSortIcon('errorRate')}
            </button>
          </th>
          <th class="px-4 py-3 text-right">
            <button class="text-right font-bold hover:text-blue-300" on:click={() => sortBy('averageExecutionTime')}>
              Avg Time {getSortIcon('averageExecutionTime')}
            </button>
          </th>
          <th class="px-4 py-3 text-right">
            <button class="text-right font-bold hover:text-blue-300" on:click={() => sortBy('totalExecutionTime')}>
              Total Time {getSortIcon('totalExecutionTime')}
            </button>
          </th>
        </tr>
        </thead>
        <tbody>
        {#each moduleMetrics as metric, i}
          <tr class={i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
            <td class="px-4 py-3">
              <div class="flex items-center space-x-2">
                  <span class="px-2 py-1 text-xs rounded-full text-white {getModuleBadgeColor(metric.moduleName)}">
                    {metric.moduleName}
                  </span>
              </div>
            </td>
            <td class="px-4 py-3 text-right">{formatNumber(metric.eventsProcessed)}</td>
            <td class="px-4 py-3 text-right {metric.errors > 0 ? 'text-red-400' : 'text-green-400'}">
              {formatNumber(metric.errors)}
            </td>
            <td class="px-4 py-3 text-right {getErrorRateColor(metric.errorRate)}">
              {metric.errorRate.toFixed(2)}%
            </td>
            <td class="px-4 py-3 text-right font-mono">
              {formatTime(metric.averageExecutionTime)}
            </td>
            <td class="px-4 py-3 text-right font-mono">
              {formatTime(metric.totalExecutionTime)}
            </td>
          </tr>
        {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
    .bg-gray-750 {
        background-color: #2d3748;
    }
</style>