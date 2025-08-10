<!-- lib/components/SystemInfoMonitor.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api.ts";
  import { logger } from "$lib/logger.ts";

  export let data;

  type SystemInfo = {
    cpuUsage: number;
    memoryUsageMb: number;
    totalMemoryMb: number;
    uptime: string;
    processStartTime: string;
    threadCount: number;
    topMethods: Array<{
      name: string;
      avgTime: number;
    }>;
  };

  let systemInfo: SystemInfo | null = null;
  let loading = true;
  let error: string | null = null;
  let refreshInterval: number;
  let refreshInProgress = false;
  let userId = data?.user?.id ? BigInt(data.user.id) : null;

  const fetchSystemInfo = async () => {
    if (!userId || refreshInProgress) return;

    try {
      refreshInProgress = true;
      error = null;
      systemInfo = await api.getSystemInfo(userId);
    } catch (err) {
      logger.error("Error fetching system info:", err);
      error = "Failed to load system information";
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

  const formatMemory = (mb: number) => {
    if (mb < 1024) return `${mb.toFixed(2)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  onMount(async () => {
    if (userId) {
      await fetchSystemInfo();
      refreshInterval = window.setInterval(fetchSystemInfo, 5000); // Refresh every 5 seconds
    }
  });

  onDestroy(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
</script>

<div class="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-md">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-2xl font-bold text-white">System Resources</h2>
    <button
      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
      disabled={refreshInProgress}
      on:click={fetchSystemInfo}
    >
      {refreshInProgress ? 'Refreshing...' : 'Refresh'}
    </button>
  </div>

  {#if error}
    <div class="bg-red-500/10 text-red-400 p-4 rounded-md mb-6">
      {error}
    </div>
  {/if}

  {#if loading && !systemInfo}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  {:else if systemInfo}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- CPU Usage -->
      <div class="bg-gray-750 p-4 rounded-lg">
        <h3 class="text-lg font-medium text-gray-300 mb-2">CPU Usage</h3>
        <div class="w-full bg-gray-700 rounded-full h-4">
          <div
            class="h-4 rounded-full"
            style="width: {systemInfo.cpuUsage}%; background-color: {systemInfo.cpuUsage > 80 ? '#ef4444' : systemInfo.cpuUsage > 50 ? '#f59e0b' : '#10b981'};"
          ></div>
        </div>
        <div class="mt-2 text-right text-white font-medium">{systemInfo.cpuUsage.toFixed(1)}%</div>
      </div>

      <!-- Memory Usage -->
      <div class="bg-gray-750 p-4 rounded-lg">
        <h3 class="text-lg font-medium text-gray-300 mb-2">Memory Usage</h3>
        <div class="w-full bg-gray-700 rounded-full h-4">
          <div
            class="h-4 rounded-full bg-blue-500"
            style="width: {(systemInfo.memoryUsageMb / systemInfo.totalMemoryMb) * 100}%;"
          ></div>
        </div>
        <div class="mt-2 text-right text-white font-medium">
          {formatMemory(systemInfo.memoryUsageMb)} / {formatMemory(systemInfo.totalMemoryMb)}
        </div>
      </div>

      <!-- Uptime -->
      <div class="bg-gray-750 p-4 rounded-lg">
        <h3 class="text-lg font-medium text-gray-300 mb-2">Uptime</h3>
        <div class="text-white text-xl font-mono text-center">
          {systemInfo.uptime}
        </div>
      </div>

      <!-- Thread Count -->
      <div class="bg-gray-750 p-4 rounded-lg">
        <h3 class="text-lg font-medium text-gray-300 mb-2">Thread Count</h3>
        <div class="text-white text-xl font-mono text-center">
          {systemInfo.threadCount}
        </div>
      </div>

      <!-- Top Methods -->
      <div class="bg-gray-750 p-4 rounded-lg md:col-span-2">
        <h3 class="text-lg font-medium text-gray-300 mb-2">Top CPU Intensive Methods</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-gray-200">
            <thead>
            <tr class="border-b border-gray-600">
              <th class="px-4 py-2 text-left">Method</th>
              <th class="px-4 py-2 text-right">Avg Time</th>
            </tr>
            </thead>
            <tbody>
            {#each systemInfo.topMethods as method, i}
              <tr class="border-b border-gray-700">
                <td class="px-4 py-2 font-mono text-sm">{method.name}</td>
                <td class="px-4 py-2 text-right font-mono">{formatTime(method.avgTime)}</td>
              </tr>
            {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center p-8 text-gray-400">
      <p>No system information available.</p>
    </div>
  {/if}
</div>

<style>
    .bg-gray-750 {
        background-color: #2d3748;
    }
</style>