<!-- lib/components/EventMetricsMonitor.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { performanceApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger.ts";
  import { colorStore } from "$lib/stores/colorStore";

  let { data } = $props();

  type EventMetric = {
    eventType: string;
    totalProcessed: number;
    totalErrors: number;
    totalExecutionTime: number;
    averageExecutionTime: number;
    errorRate: number;
  };

  let eventMetrics: EventMetric[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  let refreshInterval: number;
  let refreshInProgress = $state(false);
  let userId = data?.user?.id ? BigInt(data.user.id) : null;
  let sortField: keyof EventMetric = $state("totalProcessed");
  let sortDirection: "asc" | "desc" = $state("desc");

  // Ensure eventMetrics is always an array
  let safeEventMetrics = $derived(Array.isArray(eventMetrics) ? eventMetrics : []);

  const fetchEventMetrics = async () => {
    if (!userId || refreshInProgress) return;

    try {
      refreshInProgress = true;
      error = null;
      const response = await performanceApi.getEventMetrics(userId);
      eventMetrics = Array.isArray(response) ? response : [];
      sortData();
    } catch (err) {
      logger.error("Error fetching event metrics:", err);
      error = "Failed to load event metrics";
      eventMetrics = []; // Ensure it's always an array
    } finally {
      loading = false;
      refreshInProgress = false;
    }
  };

  const formatTime = (ms: any) => {
    const num = safeNumber(ms);
    if (num < 1) return `${(num * 1000).toFixed(2)}μs`;
    if (num < 1000) return `${num.toFixed(2)}ms`;
    return `${(num / 1000).toFixed(2)}s`;
  };

  const formatNumber = (num: any) => {
    return safeNumber(num).toLocaleString();
  };

  const sortBy = (field: keyof EventMetric) => {
    if (sortField === field) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortField = field;
      sortDirection = "desc";
    }
    sortData();
  };

  const sortData = () => {
    if (!Array.isArray(eventMetrics)) {
      eventMetrics = [];
      return;
    }

    eventMetrics = [...eventMetrics].sort((a, b) => {
      if (!a || !b) return 0;

      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        const aStr = aVal || "";
        const bStr = bVal || "";
        return sortDirection === "asc"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      }

      const aNum = safeNumber(aVal);
      const bNum = safeNumber(bVal);

      if (sortDirection === "asc") {
        return aNum - bNum;
      }
      return bNum - aNum;
    });
  };

  const getSortIcon = (field: keyof EventMetric) => {
    if (sortField !== field) return "<i class=\"fa-solid fa-sort\" style=\"font-size: 12px; opacity: 0.3;\"></i>";
    return sortDirection === "asc"
      ? "<i class=\"fa-solid fa-sort-up\" style=\"font-size: 12px;\"></i>"
      : "<i class=\"fa-solid fa-sort-down\" style=\"font-size: 12px;\"></i>";
  };

  const getErrorRateColor = (errorRate: number) => {
    const rate = Number(errorRate) || 0;
    if (rate === 0) return $colorStore.primary;
    if (rate < 1) return '#f59e0b';
    if (rate < 5) return '#fb923c';
    return $colorStore.accent;
  };

  const safeToFixed = (value: any, decimals: number = 2): string => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(decimals);
  };

  const safeNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  onMount(async () => {
    if (userId) {
      await fetchEventMetrics();
      refreshInterval = window.setInterval(fetchEventMetrics, 10000); // Refresh every 10 seconds
    }
  });

  onDestroy(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
</script>

<div class="w-full">
  <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
              border-color: {$colorStore.primary}30;">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <i class="fa-utility-duo fa-regular fa-bell"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Event Metrics</h2>
      </div>
      <button aria-label="Navigate"
              class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
        disabled={refreshInProgress}
        onclick={fetchEventMetrics}
      >
        <div class:animate-spin={refreshInProgress}>
          <i class="fa-solid fa-arrows-rotate" style="font-size: 16px;"></i>
        </div>
        {refreshInProgress ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>

    {#if error}
      <div class="p-4 rounded-xl mb-6 border"
           style="background: {$colorStore.accent}15; color: {$colorStore.accent}; border-color: {$colorStore.accent}30;">
        {error}
      </div>
    {/if}

    {#if loading && safeEventMetrics.length === 0}
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-2"
             style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
      </div>
    {:else if safeEventMetrics.length === 0}
      <div class="text-center p-8">
        <i class="fa-utility-duo fa-regular fa-bell"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
        <p class="font-medium mb-2" style="color: {$colorStore.text}">No event metrics available yet.</p>
        <p class="text-sm" style="color: {$colorStore.muted}">Event metrics will appear as your bot processes Discord events.</p>
      </div>
    {:else}
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div class=" rounded-xl p-4 transition-all hover:scale-[1.01]"
             style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
          <h3 class="text-sm font-medium mb-1" style="color: {$colorStore.muted}">Total Events</h3>
          <div class="text-2xl font-bold" style="color: {$colorStore.text}">
            {formatNumber(safeEventMetrics.reduce((sum, metric) => sum + safeNumber(metric?.totalProcessed), 0))}
          </div>
        </div>
        <div class=" rounded-xl p-4 transition-all hover:scale-[1.01]"
             style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
          <h3 class="text-sm font-medium mb-1" style="color: {$colorStore.muted}">Total Errors</h3>
          <div class="text-2xl font-bold" style="color: {$colorStore.accent}">
            {formatNumber(safeEventMetrics.reduce((sum, metric) => sum + safeNumber(metric?.totalErrors), 0))}
          </div>
        </div>
        <div class=" rounded-xl p-4 transition-all hover:scale-[1.01]"
             style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
          <h3 class="text-sm font-medium mb-1" style="color: {$colorStore.muted}">Event Types</h3>
          <div class="text-2xl font-bold" style="color: {$colorStore.secondary}">
            {safeEventMetrics.length}
          </div>
        </div>
        <div class=" rounded-xl p-4 transition-all hover:scale-[1.01]"
             style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
          <h3 class="text-sm font-medium mb-1" style="color: {$colorStore.muted}">Avg Error Rate</h3>
          <div class="text-2xl font-bold" style="color: {$colorStore.text}">
            {safeToFixed(safeEventMetrics.length > 0 ? safeEventMetrics.reduce((sum, metric) => sum + safeNumber(metric?.errorRate), 0) / safeEventMetrics.length : 0)}%
          </div>
        </div>
      </div>

      <!-- Events Table -->
      <div class="overflow-x-auto rounded-xl" style="background: {$colorStore.primary}05;">
        <table class="w-full">
          <thead>
            <tr style="background: {$colorStore.primary}15; border-bottom: 1px solid {$colorStore.primary}20;">
              <th class="px-4 py-3 text-left">
                <button class="text-left font-bold hover:opacity-80 transition-opacity flex items-center gap-1"
                        style="color: {$colorStore.text}"
                        onclick={() => sortBy('eventType')}>
                  Event Type
                  {#if sortField === 'eventType'}
                    <i class="fa-solid {sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}"
                       style="font-size: 12px;"></i>
                  {:else}
                    <i class="fa-solid fa-sort" style="font-size: 12px; opacity: 0.3;"></i>
                  {/if}
                </button>
              </th>
              <th class="px-4 py-3 text-right">
                <button
                  class="text-right font-bold hover:opacity-80 transition-opacity flex items-center gap-1 justify-end ml-auto"
                        style="color: {$colorStore.text}"
                        onclick={() => sortBy('totalProcessed')}>
                  Processed
                  {#if sortField === 'totalProcessed'}
                    <i class="fa-solid {sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}"
                       style="font-size: 12px;"></i>
                  {:else}
                    <i class="fa-solid fa-sort" style="font-size: 12px; opacity: 0.3;"></i>
                  {/if}
                </button>
              </th>
              <th class="px-4 py-3 text-right">
                <button
                  class="text-right font-bold hover:opacity-80 transition-opacity flex items-center gap-1 justify-end ml-auto"
                        style="color: {$colorStore.text}"
                        onclick={() => sortBy('totalErrors')}>
                  Errors
                  {#if sortField === 'totalErrors'}
                    <i class="fa-solid {sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}"
                       style="font-size: 12px;"></i>
                  {:else}
                    <i class="fa-solid fa-sort" style="font-size: 12px; opacity: 0.3;"></i>
                  {/if}
                </button>
              </th>
              <th class="px-4 py-3 text-right">
                <button
                  class="text-right font-bold hover:opacity-80 transition-opacity flex items-center gap-1 justify-end ml-auto"
                        style="color: {$colorStore.text}"
                        onclick={() => sortBy('errorRate')}>
                  Error Rate
                  {#if sortField === 'errorRate'}
                    <i class="fa-solid {sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}"
                       style="font-size: 12px;"></i>
                  {:else}
                    <i class="fa-solid fa-sort" style="font-size: 12px; opacity: 0.3;"></i>
                  {/if}
                </button>
              </th>
              <th class="px-4 py-3 text-right">
                <button
                  class="text-right font-bold hover:opacity-80 transition-opacity flex items-center gap-1 justify-end ml-auto"
                        style="color: {$colorStore.text}"
                        onclick={() => sortBy('averageExecutionTime')}>
                  Avg Time
                  {#if sortField === 'averageExecutionTime'}
                    <i class="fa-solid {sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}"
                       style="font-size: 12px;"></i>
                  {:else}
                    <i class="fa-solid fa-sort" style="font-size: 12px; opacity: 0.3;"></i>
                  {/if}
                </button>
              </th>
              <th class="px-4 py-3 text-right">
                <button
                  class="text-right font-bold hover:opacity-80 transition-opacity flex items-center gap-1 justify-end ml-auto"
                        style="color: {$colorStore.text}"
                        onclick={() => sortBy('totalExecutionTime')}>
                  Total Time
                  {#if sortField === 'totalExecutionTime'}
                    <i class="fa-solid {sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}"
                       style="font-size: 12px;"></i>
                  {:else}
                    <i class="fa-solid fa-sort" style="font-size: 12px; opacity: 0.3;"></i>
                  {/if}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {#each safeEventMetrics as metric, i}
              {#if metric}
                <tr class="border-b transition-all hover:scale-[1.01]"
                    style="background: {i % 2 === 0 ? $colorStore.primary + '08' : 'transparent'};
                           border-color: {$colorStore.primary}10;">
                  <td class="px-4 py-3 font-mono text-sm" style="color: {$colorStore.text}">{metric.eventType || 'Unknown'}</td>
                  <td class="px-4 py-3 text-right" style="color: {$colorStore.text}">{formatNumber(safeNumber(metric.totalProcessed))}</td>
                  <td class="px-4 py-3 text-right" style="color: {safeNumber(metric.totalErrors) > 0 ? $colorStore.accent : '#10b981'}">
                    {formatNumber(safeNumber(metric.totalErrors))}
                  </td>
                  <td class="px-4 py-3 text-right" style="color: {getErrorRateColor(safeNumber(metric.errorRate))}">
                    {safeToFixed(metric.errorRate)}%
                  </td>
                  <td class="px-4 py-3 text-right font-mono" style="color: {$colorStore.primary}">
                    {formatTime(safeNumber(metric.averageExecutionTime))}
                  </td>
                  <td class="px-4 py-3 text-right font-mono" style="color: {$colorStore.secondary}">
                    {formatTime(safeNumber(metric.totalExecutionTime))}
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
