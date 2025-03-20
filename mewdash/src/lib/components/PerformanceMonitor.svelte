<!-- lib/components/PerformanceMonitor.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api.ts";
  import { logger } from "$lib/logger.ts";
  import { formatDistanceToNow } from "date-fns";

  export let data;

  type PerformanceData = {
    methodName: string;
    callCount: number;
    totalTime: number;
    avgExecutionTime: number;
    lastExecuted: string;
  };

  let performanceData: PerformanceData[] = [];
  let loading = true;
  let error: string | null = null;
  let refreshInterval: number;
  let refreshInProgress = false;
  let userId = data?.user?.id ? BigInt(data.user.id) : null;

  const fetchPerformanceData = async () => {
    if (!userId || refreshInProgress) return;

    try {
      refreshInProgress = true;
      error = null;
      performanceData = await api.getPerformanceData(userId);
    } catch (err) {
      logger.error("Error fetching performance data:", err);
      error = "Failed to load performance data";
    } finally {
      loading = false;
      refreshInProgress = false;
    }
  };

  const clearPerformanceData = async () => {
    if (!userId) return;

    try {
      await api.clearPerformanceData(userId);
      await fetchPerformanceData();
    } catch (err) {
      logger.error("Error clearing performance data:", err);
      error = "Failed to clear performance data";
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateStr;
    }
  };

  const sortBy = (field: keyof PerformanceData) => {
    performanceData = [...performanceData].sort((a, b) => {
      if (a[field] > b[field]) return -1;
      if (a[field] < b[field]) return 1;
      return 0;
    });
  };

  onMount(async () => {
    if (userId) {
      await fetchPerformanceData();
      refreshInterval = window.setInterval(fetchPerformanceData, 30000); // Refresh every 30 seconds
    }
  });

  onDestroy(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
</script>

<div class="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-md mb-8">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-2xl font-bold text-white">Method Performance</h2>
    <div class="flex space-x-4">
      <button
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        disabled={refreshInProgress}
        on:click={fetchPerformanceData}
      >
        {refreshInProgress ? 'Refreshing...' : 'Refresh'}
      </button>
      <button
        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        disabled={refreshInProgress}
        on:click={clearPerformanceData}
      >
        Clear Data
      </button>
    </div>
  </div>

  {#if error}
    <div class="bg-red-500/10 text-red-400 p-4 rounded-md mb-6">
      {error}
    </div>
  {/if}

  {#if loading && performanceData.length === 0}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  {:else if performanceData.length === 0}
    <div class="text-center p-8 text-gray-400">
      <p>No performance data available yet.</p>
      <p class="mt-2 text-sm">Run some commands to generate performance metrics.</p>
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full text-gray-200">
        <thead>
        <tr class="bg-gray-700">
          <th class="px-4 py-3 text-left">
            <button class="text-left font-bold" on:click={() => sortBy('methodName')}>Method</button>
          </th>
          <th class="px-4 py-3 text-right">
            <button class="text-right font-bold" on:click={() => sortBy('callCount')}>Calls</button>
          </th>
          <th class="px-4 py-3 text-right">
            <button class="text-right font-bold" on:click={() => sortBy('avgExecutionTime')}>Avg Time</button>
          </th>
          <th class="px-4 py-3 text-right">
            <button class="text-right font-bold" on:click={() => sortBy('totalTime')}>Total Time</button>
          </th>
          <th class="px-4 py-3 text-right">
            <button class="text-right font-bold" on:click={() => sortBy('lastExecuted')}>Last Executed</button>
          </th>
        </tr>
        </thead>
        <tbody>
        {#each performanceData as method, i}
          <tr class={i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
            <td class="px-4 py-3 font-mono text-sm">{method.methodName}</td>
            <td class="px-4 py-3 text-right">{method.callCount.toLocaleString()}</td>
            <td class="px-4 py-3 text-right font-mono">
              {formatTime(method.avgExecutionTime)}
            </td>
            <td class="px-4 py-3 text-right font-mono">
              {formatTime(method.totalTime)}
            </td>
            <td class="px-4 py-3 text-right text-sm">
              {formatDate(method.lastExecuted)}
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