<script lang="ts">
  import { AlertCircle, BarChart2 } from "lucide-svelte";
  import { colorStore } from "$lib/stores/colorStore";

  export let serverStats: any;
  export let loading: boolean = false;
  export let error: string | null = null;

  function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }
</script>

<div class="flex items-center gap-3 mb-6">
  <div
    class="p-3 rounded-xl"
    style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
           color: {$colorStore.primary};"
  >
    <BarChart2 aria-hidden="true" class="w-6 h-6" />
  </div>
  <h2 class="text-xl font-bold" style="color: {$colorStore.text}">XP Statistics</h2>
</div>

{#if loading}
  <div class="flex justify-center items-center min-h-[200px]">
    <div
      class="w-12 h-12 border-4 rounded-full animate-spin"
      style="border-color: {$colorStore.primary}20;
             border-top-color: {$colorStore.primary};"
      aria-label="Loading"
    >
    </div>
  </div>
{:else if error}
  <div
    class="rounded-xl p-4 flex items-center gap-3"
    style="background: {$colorStore.accent}10;"
    role="alert"
  >
    <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
    <p style="color: {$colorStore.accent}">{error}</p>
  </div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Total Users Stat -->
    <div
      class="rounded-xl p-4"
      style="background: {$colorStore.primary}10;"
    >
      <div class="flex flex-col">
        <span class="text-sm" style="color: {$colorStore.muted}">Total Users</span>
        <span class="text-3xl font-bold"
              style="color: {$colorStore.text}">{formatNumber(serverStats.totalUsers)}</span>
      </div>
    </div>

    <!-- Total XP Stat -->
    <div
      class="rounded-xl p-4"
      style="background: {$colorStore.secondary}10;"
    >
      <div class="flex flex-col">
        <span class="text-sm" style="color: {$colorStore.muted}">Total XP</span>
        <span class="text-3xl font-bold"
              style="color: {$colorStore.text}">{formatNumber(serverStats.totalXp)}</span>
      </div>
    </div>

    <!-- Average Level Stat -->
    <div
      class="rounded-xl p-4"
      style="background: {$colorStore.accent}10;"
    >
      <div class="flex flex-col">
        <span class="text-sm" style="color: {$colorStore.muted}">Average Level</span>
        <span class="text-3xl font-bold" style="color: {$colorStore.text}">{serverStats.averageLevel}</span>
      </div>
    </div>

    <!-- Highest Level Stat -->
    <div
      class="rounded-xl p-4"
      style="background: {$colorStore.primary}10;"
    >
      <div class="flex flex-col">
        <span class="text-sm" style="color: {$colorStore.muted}">Highest Level</span>
        <span class="text-3xl font-bold" style="color: {$colorStore.text}">{serverStats.highestLevel}</span>
      </div>
    </div>
  </div>

  <!-- Recent Activity -->
  <div
    class="rounded-xl p-4"
    style="background: {$colorStore.primary}15;"
  >
    <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">Recent XP Activity</h3>

    {#if serverStats.recentActivity && serverStats.recentActivity.length > 0}
      <ul class="space-y-3">
        {#each serverStats.recentActivity as activity}
          <li class="flex items-center gap-3 p-3 rounded-lg" style="background: {$colorStore.primary}10;">
            <img
              src={activity.avatarUrl}
              alt=""
              class="w-10 h-10 rounded-full border-2"
              style="border-color: {$colorStore.primary}30;"
            />
            <div class="flex-grow">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span class="font-medium" style="color: {$colorStore.text}">{activity.username}</span>
                <span class="text-sm" style="color: {$colorStore.muted}">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
              <div class="text-sm" style="color: {$colorStore.secondary}">
                Recent activity
              </div>
            </div>
          </li>
        {/each}
      </ul>
    {:else}
      <div class="text-center py-6" style="color: {$colorStore.muted}">
        No recent XP activity
      </div>
    {/if}
  </div>
{/if}