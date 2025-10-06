<!-- lib/components/SystemInfoMonitor.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api.ts";
  import { logger } from "$lib/logger.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { Cpu, HardDrive, Clock, Layers, RefreshCw, Zap } from "lucide-svelte";

  let { data } = $props();

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

  let systemInfo: SystemInfo | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);
  let refreshInterval: number;
  let refreshInProgress = $state(false);
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

  const getCpuColor = (usage: number) => {
    if (usage > 80) return $colorStore.accent;
    if (usage > 50) return '#f59e0b';
    return '#10b981';
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

<div class="w-full">
  <div class="backdrop-blur-xs rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
              border-color: {$colorStore.primary}30;">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <Cpu class="w-5 h-5" style="color: {$colorStore.primary}" />
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">System Resources</h2>
      </div>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
        disabled={refreshInProgress}
        onclick={fetchSystemInfo}
      >
        <div class:animate-spin={refreshInProgress}>
          <RefreshCw class="w-4 h-4" />
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

    {#if loading && !systemInfo}
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-2"
             style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
      </div>
    {:else if systemInfo}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <!-- CPU Usage -->
        <div class="backdrop-blur-xs rounded-xl p-4 transition-all hover:scale-[1.01]"
             style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
          <div class="flex items-center gap-2 mb-3">
            <Cpu class="w-5 h-5" style="color: {$colorStore.primary}" />
            <h3 class="text-base font-semibold" style="color: {$colorStore.text}">CPU Usage</h3>
          </div>
          <div class="w-full rounded-full h-3 mb-2"
               style="background: {$colorStore.primary}10;">
            <div
              class="h-3 rounded-full transition-all duration-500"
              style="width: {systemInfo.cpuUsage}%; background: {getCpuColor(systemInfo.cpuUsage)};"
            ></div>
          </div>
          <div class="text-right text-lg font-bold" style="color: {$colorStore.text}">{systemInfo.cpuUsage.toFixed(1)}%</div>
        </div>

        <!-- Memory Usage -->
        <div class="backdrop-blur-xs rounded-xl p-4 transition-all hover:scale-[1.01]"
             style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
          <div class="flex items-center gap-2 mb-3">
            <HardDrive class="w-5 h-5" style="color: {$colorStore.secondary}" />
            <h3 class="text-base font-semibold" style="color: {$colorStore.text}">Memory Usage</h3>
          </div>
          <div class="w-full rounded-full h-3 mb-2"
               style="background: {$colorStore.primary}10;">
            <div
              class="h-3 rounded-full transition-all duration-500"
              style="width: {(systemInfo.memoryUsageMb / systemInfo.totalMemoryMb) * 100}%; background: {$colorStore.secondary};"
            ></div>
          </div>
          <div class="text-right text-sm font-medium" style="color: {$colorStore.text}">
            {formatMemory(systemInfo.memoryUsageMb)} / {formatMemory(systemInfo.totalMemoryMb)}
          </div>
        </div>

        <!-- Uptime -->
        <div class="backdrop-blur-xs rounded-xl p-4 transition-all hover:scale-[1.01]"
             style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
          <div class="flex items-center gap-2 mb-3">
            <Clock class="w-5 h-5" style="color: {$colorStore.accent}" />
            <h3 class="text-base font-semibold" style="color: {$colorStore.text}">Uptime</h3>
          </div>
          <div class="text-xl font-mono text-center" style="color: {$colorStore.text}">
            {systemInfo.uptime}
          </div>
        </div>

        <!-- Thread Count -->
        <div class="backdrop-blur-xs rounded-xl p-4 transition-all hover:scale-[1.01]"
             style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
          <div class="flex items-center gap-2 mb-3">
            <Layers class="w-5 h-5" style="color: {$colorStore.primary}" />
            <h3 class="text-base font-semibold" style="color: {$colorStore.text}">Thread Count</h3>
          </div>
          <div class="text-xl font-mono text-center" style="color: {$colorStore.text}">
            {systemInfo.threadCount}
          </div>
        </div>

        <!-- Top Methods -->
        <div class="backdrop-blur-xs rounded-xl p-4 transition-all hover:scale-[1.01] md:col-span-2"
             style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
          <div class="flex items-center gap-2 mb-4">
            <Zap class="w-5 h-5" style="color: {$colorStore.accent}" />
            <h3 class="text-base font-semibold" style="color: {$colorStore.text}">Top CPU Intensive Methods</h3>
          </div>
          <div class="overflow-x-auto rounded-lg" style="background: {$colorStore.primary}05;">
            <table class="w-full">
              <thead>
                <tr style="background: {$colorStore.primary}15; border-bottom: 1px solid {$colorStore.primary}20;">
                  <th class="px-4 py-3 text-left font-bold" style="color: {$colorStore.text}">Method</th>
                  <th class="px-4 py-3 text-right font-bold" style="color: {$colorStore.text}">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {#each systemInfo.topMethods as method, i}
                  <tr class="border-b" style="border-color: {$colorStore.primary}10;">
                    <td class="px-4 py-3 font-mono text-sm" style="color: {$colorStore.text}">{method.name}</td>
                    <td class="px-4 py-3 text-right font-mono" style="color: {$colorStore.primary}">{formatTime(method.avgTime)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    {:else}
      <div class="text-center p-8">
        <Cpu class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
        <p class="font-medium mb-2" style="color: {$colorStore.text}">No system information available.</p>
        <p class="text-sm" style="color: {$colorStore.muted}">System data will appear here once loaded.</p>
      </div>
    {/if}
  </div>
</div>
