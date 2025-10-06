<!-- lib/components/PerformanceMonitor.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api.ts";
  import { logger } from "$lib/logger.ts";
  import { formatDistanceToNow } from "date-fns";
  import { colorStore } from "$lib/stores/colorStore";

  let { data } = $props();

  type PerformanceData = {
    methodName: string;
    callCount: number;
    totalTime: number;
    avgExecutionTime: number;
    lastExecuted: string;
  };

  let performanceData: PerformanceData[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  let refreshInterval: number;
  let refreshInProgress = $state(false);
  let userId = data?.user?.id ? BigInt(data.user.id) : null;

  // Ensure performanceData is always an array
  let safePerformanceData = $derived(Array.isArray(performanceData) ? performanceData : []);

  const fetchPerformanceData = async () => {
    if (!userId || refreshInProgress) return;

    try {
      refreshInProgress = true;
      error = null;
      const response = await api.getPerformanceData(userId);
      performanceData = Array.isArray(response) ? response : [];
    } catch (err) {
      logger.error("Error fetching performance data:", err);
      error = "Failed to load performance data";
      performanceData = [];
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

<div class="w-full">
  <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
              border-color: {$colorStore.primary}30;">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <i class="fa-utility-duo fa-regular fa-clock"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Method Performance</h2>
      </div>
      <div class="flex gap-3">
        <button aria-label="Navigate"
          class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50"
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
          disabled={refreshInProgress}
          onclick={fetchPerformanceData}
        >
          <div class:animate-spin={refreshInProgress}>
            <i class="fa-solid fa-arrows-rotate" style="font-size: 16px;"></i>
          </div>
          {refreshInProgress ? 'Refreshing...' : 'Refresh'}
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50"
          style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
          disabled={refreshInProgress}
          onclick={clearPerformanceData}
        >
          <i class="fa-solid fa-trash" style="font-size: 16px;"></i>
          Clear Data
        </button>
      </div>
    </div>

    {#if error}
      <div class="p-4 rounded-xl mb-6 border"
           style="background: {$colorStore.accent}15; color: {$colorStore.accent}; border-color: {$colorStore.accent}30;">
        {error}
      </div>
    {/if}

    {#if loading && safePerformanceData.length === 0}
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-2"
             style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
      </div>
    {:else if safePerformanceData.length === 0}
      <div class="text-center p-8">
        <i class="fa-utility-duo fa-regular fa-clock"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
        <p class="font-medium mb-2" style="color: {$colorStore.text}">No performance data available yet.</p>
        <p class="text-sm" style="color: {$colorStore.muted}">Run some commands to generate performance metrics.</p>
      </div>
    {:else}
      <div class="overflow-x-auto rounded-xl" style="background: {$colorStore.primary}05;">
        <table class="w-full">
          <thead>
            <tr style="background: {$colorStore.primary}15; border-bottom: 1px solid {$colorStore.primary}20;">
              <th class="px-4 py-3 text-left">
                <button class="text-left font-bold hover:opacity-80 transition-opacity"
                        style="color: {$colorStore.text}"
                        onclick={() => sortBy('methodName')}>Method</button>
              </th>
              <th class="px-4 py-3 text-right">
                <button class="text-right font-bold hover:opacity-80 transition-opacity"
                        style="color: {$colorStore.text}"
                        onclick={() => sortBy('callCount')}>Calls</button>
              </th>
              <th class="px-4 py-3 text-right">
                <button class="text-right font-bold hover:opacity-80 transition-opacity"
                        style="color: {$colorStore.text}"
                        onclick={() => sortBy('avgExecutionTime')}>Avg Time</button>
              </th>
              <th class="px-4 py-3 text-right">
                <button class="text-right font-bold hover:opacity-80 transition-opacity"
                        style="color: {$colorStore.text}"
                        onclick={() => sortBy('totalTime')}>Total Time</button>
              </th>
              <th class="px-4 py-3 text-right">
                <button class="text-right font-bold hover:opacity-80 transition-opacity"
                        style="color: {$colorStore.text}"
                        onclick={() => sortBy('lastExecuted')}>Last Executed</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {#each safePerformanceData as method, i}
              <tr class="border-b transition-all hover:scale-[1.01]"
                  style="background: {i % 2 === 0 ? $colorStore.primary + '08' : 'transparent'};
                         border-color: {$colorStore.primary}10;">
                <td class="px-4 py-3 font-mono text-sm" style="color: {$colorStore.text}">{method.methodName}</td>
                <td class="px-4 py-3 text-right" style="color: {$colorStore.text}">{method.callCount.toLocaleString()}</td>
                <td class="px-4 py-3 text-right font-mono" style="color: {$colorStore.primary}">
                  {formatTime(method.avgExecutionTime)}
                </td>
                <td class="px-4 py-3 text-right font-mono" style="color: {$colorStore.secondary}">
                  {formatTime(method.totalTime)}
                </td>
                <td class="px-4 py-3 text-right text-sm" style="color: {$colorStore.muted}">
                  {formatDate(method.lastExecuted)}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>