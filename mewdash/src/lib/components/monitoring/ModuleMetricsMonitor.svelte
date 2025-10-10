<!-- lib/components/ModuleMetricsMonitor.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { performanceApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger.ts";
  import { colorStore } from "$lib/stores/colorStore";

  let { data } = $props();

  type ModuleMetric = {
    moduleName: string;
    eventsProcessed: number;
    errors: number;
    totalExecutionTime: number;
    averageExecutionTime: number;
    errorRate: number;
  };

  let moduleMetrics: ModuleMetric[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  let refreshInterval: number;
  let refreshInProgress = $state(false);
  let userId = data?.user?.id ? BigInt(data.user.id) : null;
  let sortField: keyof ModuleMetric = $state("eventsProcessed");
  let sortDirection: "asc" | "desc" = $state("desc");

  // Ensure moduleMetrics is always an array
  let safeModuleMetrics = $derived(Array.isArray(moduleMetrics) ? moduleMetrics : []);

  const fetchModuleMetrics = async () => {
    if (!userId || refreshInProgress) return;

    try {
      refreshInProgress = true;
      error = null;
      const response = await performanceApi.getModuleMetrics(userId);
      moduleMetrics = Array.isArray(response) ? response : [];
      sortData();
    } catch (err) {
      logger.error("Error fetching module metrics:", err);
      error = "Failed to load module metrics";
      moduleMetrics = []; // Ensure it's always an array
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

  const formatNumber = (num: any) => {
    return safeNumber(num).toLocaleString();
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
    if (!Array.isArray(moduleMetrics)) {
      moduleMetrics = [];
      return;
    }

    moduleMetrics = [...moduleMetrics].sort((a, b) => {
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

  const getSortIcon = (field: keyof ModuleMetric) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? "" : "";
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

  const getModuleBadgeColor = (moduleName: string) => {
    // Give different colors to different module types using colorStore
    if (moduleName === "Legacy") return $colorStore.accent;
    if (moduleName.includes("Command")) return $colorStore.primary;
    if (moduleName.includes("Event")) return $colorStore.secondary;
    if (moduleName.includes("Service")) return '#fb923c';
    return $colorStore.muted;
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

<div class="w-full">
  <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
              border-color: {$colorStore.primary}30;">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <i class="fa-utility-duo fa-regular fa-square"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Module Metrics</h2>
      </div>
      <button aria-label="Navigate"
              class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
        disabled={refreshInProgress}
        onclick={fetchModuleMetrics}
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

    {#if loading && safeModuleMetrics.length === 0}
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-2"
             style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
      </div>
    {:else if safeModuleMetrics.length === 0}
      <div class="text-center p-8">
        <i class="fa-utility-duo fa-regular fa-square"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
        <p class="font-medium mb-2" style="color: {$colorStore.text}">No module metrics available yet.</p>
        <p class="text-sm" style="color: {$colorStore.muted}">Module metrics will appear as your bot modules process events.</p>
      </div>
    {:else}
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div class="backdrop-blur-xs rounded-xl p-4 transition-all hover:scale-[1.01]"
             style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
          <h3 class="text-sm font-medium mb-1" style="color: {$colorStore.muted}">Active Modules</h3>
          <div class="text-2xl font-bold" style="color: {$colorStore.text}">
            {safeModuleMetrics.length}
          </div>
        </div>
        <div class="backdrop-blur-xs rounded-xl p-4 transition-all hover:scale-[1.01]"
             style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
          <h3 class="text-sm font-medium mb-1" style="color: {$colorStore.muted}">Total Events</h3>
          <div class="text-2xl font-bold" style="color: {$colorStore.primary}">
            {formatNumber(safeModuleMetrics.reduce((sum, metric) => sum + safeNumber(metric?.eventsProcessed), 0))}
          </div>
        </div>
        <div class="backdrop-blur-xs rounded-xl p-4 transition-all hover:scale-[1.01]"
             style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
          <h3 class="text-sm font-medium mb-1" style="color: {$colorStore.muted}">Total Errors</h3>
          <div class="text-2xl font-bold" style="color: {$colorStore.accent}">
            {formatNumber(safeModuleMetrics.reduce((sum, metric) => sum + safeNumber(metric?.errors), 0))}
          </div>
        </div>
        <div class="backdrop-blur-xs rounded-xl p-4 transition-all hover:scale-[1.01]"
             style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
          <h3 class="text-sm font-medium mb-1" style="color: {$colorStore.muted}">Avg Error Rate</h3>
          <div class="text-2xl font-bold" style="color: {$colorStore.text}">
            {safeToFixed(safeModuleMetrics.length > 0 ? safeModuleMetrics.reduce((sum, metric) => sum + safeNumber(metric?.errorRate), 0) / safeModuleMetrics.length : 0)}%
          </div>
        </div>
      </div>

      <!-- Modules Table -->
      <div class="overflow-x-auto rounded-xl" style="background: {$colorStore.primary}05;">
        <table class="w-full">
          <thead>
            <tr style="background: {$colorStore.primary}15; border-bottom: 1px solid {$colorStore.primary}20;">
              <th class="px-4 py-3 text-left">
                <button class="text-left font-bold hover:opacity-80 transition-opacity flex items-center gap-1"
                        style="color: {$colorStore.text}"
                        onclick={() => sortBy('moduleName')}>
                  Module Name
                  {#if sortField === 'moduleName'}
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
                        onclick={() => sortBy('eventsProcessed')}>
                  Events Processed
                  {#if sortField === 'eventsProcessed'}
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
                        onclick={() => sortBy('errors')}>
                  Errors
                  {#if sortField === 'errors'}
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
            {#each safeModuleMetrics as metric, i}
              {#if metric}
                <tr class="border-b transition-all hover:scale-[1.01]"
                    style="background: {i % 2 === 0 ? $colorStore.primary + '08' : 'transparent'};
                           border-color: {$colorStore.primary}10;">
                  <td class="px-4 py-3">
                    <div class="flex items-center space-x-2">
                      <span
                        class="px-2 py-1 text-xs rounded-full font-medium"
                        style="background: {getModuleBadgeColor(metric.moduleName || 'Unknown')}20; color: {getModuleBadgeColor(metric.moduleName || 'Unknown')};">
                        {metric.moduleName || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-right" style="color: {$colorStore.text}">{formatNumber(safeNumber(metric.eventsProcessed))}</td>
                  <td class="px-4 py-3 text-right" style="color: {safeNumber(metric.errors) > 0 ? $colorStore.accent : '#10b981'}">
                    {formatNumber(safeNumber(metric.errors))}
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
