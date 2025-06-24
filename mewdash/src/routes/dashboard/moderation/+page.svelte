<!-- routes/dashboard/moderation/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { AlertTriangle, CheckCircle, Clock, Shield, User, XCircle } from "lucide-svelte";
  import { fade, fly } from "svelte/transition";

  export let data;

  let warnings: any[] = [];
  let recentActivity: any[] = [];
  let loading = true;
  let error: string | null = null;

  // Stats
  let totalWarnings = 0;
  let activeWarnings = 0;
  let forgivenWarnings = 0;

  async function fetchModerationData() {
    if (!$currentGuild?.id) return;

    try {
      loading = true;

      const [warningsData, recentData] = await Promise.all([
        api.getWarnings($currentGuild.id),
        api.getRecentModerationActivity($currentGuild.id, 10)
      ]);

      warnings = warningsData;
      recentActivity = recentData;

      // Calculate stats
      totalWarnings = warnings.length;
      activeWarnings = warnings.filter(w => !w.forgiven).length;
      forgivenWarnings = warnings.filter(w => w.forgiven).length;

    } catch (err) {
      logger.error("Failed to fetch moderation data:", err);
      error = "Failed to load moderation data";
    } finally {
      loading = false;
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleString();
  }

  onMount(() => {
    fetchModerationData();
  });

  $: if ($currentGuild) {
    fetchModerationData();
  }
</script>

<div class="min-h-screen p-4 md:p-6 overflow-x-hidden w-full transition-all duration-500"
     style="background: radial-gradient(circle at top,
       {$colorStore.gradientStart}15 0%,
       {$colorStore.gradientMid}10 50%,
       {$colorStore.gradientEnd}05 100%);">

  <div class="max-w-7xl mx-auto space-y-8">

    <!-- Page Header -->
    <div class="mb-8" in:fly={{ y: 20, duration: 300 }}>
      <div class="flex items-center gap-4 mb-4">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <Shield class="w-8 h-8" style="color: {$colorStore.primary}" />
        </div>
        <div>
          <h1 class="text-3xl font-bold" style="color: {$colorStore.text}">Moderation Dashboard</h1>
          <p class="text-lg" style="color: {$colorStore.muted}">
            Manage warnings, punishments, and moderation activity
          </p>
        </div>
      </div>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2" style="border-color: {$colorStore.primary}"></div>
        <span class="ml-3" style="color: {$colorStore.text}">Loading moderation data...</span>
      </div>
    {:else if error}
      <div class="p-6 rounded-xl mb-6 transition-all" role="alert"
           style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}40;">
        <div class="flex items-center gap-3">
          <AlertTriangle class="w-6 h-6" style="color: {$colorStore.accent}" />
          <div style="color: {$colorStore.accent}">
            <div class="font-semibold text-lg">Error Occurred</div>
            <div class="text-sm mt-1" style="color: {$colorStore.accent}90">{error}</div>
          </div>
        </div>
      </div>
    {:else}

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" in:fly={{ y: 20, duration: 300, delay: 100 }}>
        <!-- Total Warnings -->
        <div class="backdrop-blur-sm rounded-2xl p-6 shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-2px]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium" style="color: {$colorStore.muted}">Total Warnings</p>
              <p class="text-3xl font-bold mt-1" style="color: {$colorStore.text}">{totalWarnings}</p>
            </div>
            <div class="p-3 rounded-xl" style="background: {$colorStore.primary}20;">
              <AlertTriangle class="w-6 h-6" style="color: {$colorStore.primary}" />
            </div>
          </div>
        </div>

        <!-- Active Warnings -->
        <div class="backdrop-blur-sm rounded-2xl p-6 shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-2px]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium" style="color: {$colorStore.muted}">Active Warnings</p>
              <p class="text-3xl font-bold mt-1" style="color: {$colorStore.text}">{activeWarnings}</p>
            </div>
            <div class="p-3 rounded-xl" style="background: {$colorStore.accent}20;">
              <XCircle class="w-6 h-6" style="color: {$colorStore.accent}" />
            </div>
          </div>
        </div>

        <!-- Forgiven Warnings -->
        <div class="backdrop-blur-sm rounded-2xl p-6 shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-2px]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium" style="color: {$colorStore.muted}">Forgiven Warnings</p>
              <p class="text-3xl font-bold mt-1" style="color: {$colorStore.text}">{forgivenWarnings}</p>
            </div>
            <div class="p-3 rounded-xl" style="background: {$colorStore.secondary}20;">
              <CheckCircle class="w-6 h-6" style="color: {$colorStore.secondary}" />
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                  border-color: {$colorStore.primary}30;"
           in:fly={{ y: 20, duration: 300, delay: 200 }}>

        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 rounded-xl"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <Clock class="w-6 h-6" style="color: {$colorStore.primary}" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Recent Moderation Activity</h2>
        </div>

        {#if recentActivity.length === 0}
          <div class="text-center py-8">
            <Shield class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
            <p class="text-lg font-medium" style="color: {$colorStore.text}">No recent moderation activity</p>
            <p class="text-sm" style="color: {$colorStore.muted}">This server has been peaceful!</p>
          </div>
        {:else}
          <div class="space-y-4 max-h-96 overflow-y-auto">
            {#each recentActivity as warning (warning.id)}
              <div
                class="flex items-start gap-4 p-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 backdrop-blur-sm border hover:border-opacity-40"
                style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;"
                in:fade={{ duration: 200 }}>

                <div class="p-2 rounded-lg"
                     style="background: {warning.forgiven ? $colorStore.secondary + '20' : $colorStore.accent + '20'};">
                  {#if warning.forgiven}
                    <CheckCircle class="w-5 h-5" style="color: {$colorStore.secondary}" />
                  {:else}
                    <AlertTriangle class="w-5 h-5" style="color: {$colorStore.accent}" />
                  {/if}
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <User class="w-4 h-4" style="color: {$colorStore.primary}" />
                    <span class="font-medium" style="color: {$colorStore.text}">
                      User ID: {warning.userId}
                    </span>
                    {#if warning.forgiven}
                      <span class="px-2 py-1 text-xs rounded-full"
                            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                        Forgiven
                      </span>
                    {/if}
                  </div>

                  <p class="text-sm mb-2" style="color: {$colorStore.text}">
                    <strong>Reason:</strong> {warning.reason || "No reason provided"}
                  </p>

                  <div class="flex items-center gap-4 text-xs" style="color: {$colorStore.muted}">
                    <span>Moderator: {warning.moderator || "Unknown"}</span>
                    <span>Date: {formatDate(warning.dateAdded)}</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
    :global(*::-webkit-scrollbar) {
        @apply w-2;
    }

    :global(*::-webkit-scrollbar-track) {
        background: var(--color-primary) 10;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background: var(--color-primary) 30;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb:hover) {
        background: var(--color-primary) 50;
    }
</style>