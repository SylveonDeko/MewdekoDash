<!-- routes/dashboard/moderation/+page.svelte -->
<script lang="ts">


  import { onMount } from "svelte";
  import { moderationApi } from "$lib/api/index.ts";
    import {currentGuild} from "$lib/stores/currentGuild";
    import {colorStore} from "$lib/stores/colorStore";
    import {logger} from "$lib/logger";
    import {fade, fly} from "svelte/transition";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
    import {loadingStore} from "$lib/stores/loadingStore";

    let {data} = $props();

    let warnings: any[] = $state([]);
    let recentActivity: any[] = $state([]);
    let loading = $state(true);
    let error: string | null = $state(null);

  // Layout state
    let activeTab = $state("overview");
  
  const tabs = [
    { id: "overview", label: "Overview", icon: "fa-chart-column" },
    { id: "warnings", label: "Warnings", icon: "fa-triangle-exclamation" },
    { id: "activity", label: "Recent Activity", icon: "fa-clock" }
  ];
  
  // Stats
    let totalWarnings = $state(0);
    let activeWarnings = $state(0);
    let forgivenWarnings = $state(0);

  async function fetchModerationData() {
    if (!$currentGuild?.id) return;

    return await loadingStore.wrap("fetch-moderation-data", async () => {
      try {
        loading = true;

        const [warningsData, recentData] = await Promise.all([
          moderationApi.getWarnings($currentGuild.id),
          moderationApi.getRecentModerationActivity($currentGuild.id, 10)
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
    }, "api", "Loading moderation data...");
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleString();
  }

  onMount(() => {
    fetchModerationData();
  });

  $effect(() => {
        if ($currentGuild) {
            fetchModerationData();
        }
    });
</script>

{#snippet statusMessages()}
  {#if error}
    <div class="p-6 rounded-xl mb-6 transition-all" role="alert"
         style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}40;">
      <div class="flex items-center gap-3">
        <i class="fa-utility-duo fa-regular fa-circle-exclamation"
           style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 24px;"></i>
        <div style="color: {$colorStore.accent}">
          <div class="font-semibold text-lg">Error Occurred</div>
          <div class="text-sm mt-1" style="color: {$colorStore.accent}90">{error}</div>
        </div>
      </div>
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  statusMessages={statusMessages}
  subtitle="Manage warnings, punishments, and moderation activity"
  icon="fa-shield"
  {tabs}
  bind:activeTab
  actionButtons={[
    {
      label: "Refresh",
      icon: "fa-arrows-rotate",
      action: fetchModerationData,
      loading: loading
    }
  ]}
  guildName={$currentGuild?.name || "Dashboard"}
  title="Moderation Dashboard"
>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2" style="border-color: {$colorStore.primary}"></div>
      <span class="ml-3" style="color: {$colorStore.text}">Loading moderation data...</span>
    </div>
  {:else if !error}
    {#if activeTab === 'overview'}
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" in:fly={{ y: 20, duration: 300, delay: 100 }}>
        <!-- Total Warnings -->
        <div class=" rounded-2xl p-6 shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-2px]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium" style="color: {$colorStore.muted}">Total Warnings</p>
              <p class="text-3xl font-bold mt-1" style="color: {$colorStore.text}">{totalWarnings}</p>
            </div>
            <div class="p-3 rounded-xl" style="background: {$colorStore.primary}20;">
              <i class="fa-utility-duo fa-regular fa-bell"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
            </div>
          </div>
        </div>

        <!-- Active Warnings -->
        <div class=" rounded-2xl p-6 shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-2px]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium" style="color: {$colorStore.muted}">Active Warnings</p>
              <p class="text-3xl font-bold mt-1" style="color: {$colorStore.text}">{activeWarnings}</p>
            </div>
            <div class="p-3 rounded-xl" style="background: {$colorStore.accent}20;">
              <i class="fa-utility-duo fa-regular fa-bell"
                 style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 24px;"></i>
            </div>
          </div>
        </div>

        <!-- Forgiven Warnings -->
        <div class=" rounded-2xl p-6 shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-2px]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium" style="color: {$colorStore.muted}">Forgiven Warnings</p>
              <p class="text-3xl font-bold mt-1" style="color: {$colorStore.text}">{forgivenWarnings}</p>
            </div>
            <div class="p-3 rounded-xl" style="background: {$colorStore.secondary}20;">
              <i class="fa-utility-duo fa-regular fa-circle-check" style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.primary}; font-size: 24px;"></i>
            </div>
          </div>
        </div>
      </div>
    {/if}
    
    {#if activeTab === 'warnings'}
      <!-- All Warnings Section -->
      <section class=" rounded-2xl border p-6 shadow-2xl transition-all"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                      border-color: {$colorStore.primary}30;"
               in:fly={{ y: 20, duration: 300, delay: 200 }}>
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 rounded-xl"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <i class="fa-utility-duo fa-regular fa-bell"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">All Warnings</h2>
        </div>
        
        {#if warnings.length === 0}
          <div class="text-center py-8">
            <i class="fa-utility-duo fa-regular fa-shield" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
            <p class="text-lg font-medium" style="color: {$colorStore.text}">No warnings found</p>
            <p class="text-sm" style="color: {$colorStore.muted}">This server has been peaceful!</p>
          </div>
        {:else}
          <div class="space-y-4 max-h-96 overflow-y-auto">
            {#each warnings as warning (warning.id)}
              <div
                class="flex items-start gap-4 p-4 rounded-xl transition-all duration-200 hover:shadow-lg  border"
                style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;"
                in:fade={{ duration: 200 }}>
                <div class="p-2 rounded-lg"
                     style="background: {warning.forgiven ? $colorStore.secondary + '20' : $colorStore.accent + '20'};">
                  {#if warning.forgiven}
                    <i class="fa-utility-duo fa-regular fa-circle-check" style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
                  {:else}
                    <i class="fa-utility-duo fa-regular fa-bell"
                       style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
                  {/if}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <i class="fa-solid fa-user" style="color: {$colorStore.primary}; font-size: 16px;"></i>
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
      </section>
    {/if}
    
    {#if activeTab === 'activity'}
      <!-- Recent Activity -->
      <section class=" rounded-2xl border p-6 shadow-2xl transition-all"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                      border-color: {$colorStore.primary}30;"
               in:fly={{ y: 20, duration: 300, delay: 200 }}>

        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 rounded-xl"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <i class="fa-utility-duo fa-regular fa-clock" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Recent Moderation Activity</h2>
        </div>

        {#if recentActivity.length === 0}
          <div class="text-center py-8">
            <i class="fa-utility-duo fa-regular fa-shield" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
            <p class="text-lg font-medium" style="color: {$colorStore.text}">No recent moderation activity</p>
            <p class="text-sm" style="color: {$colorStore.muted}">This server has been peaceful!</p>
          </div>
        {:else}
          <div class="space-y-4 max-h-96 overflow-y-auto">
            {#each recentActivity as warning (warning.id)}
              <div
                class="flex items-start gap-4 p-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20  border hover:border-opacity-40"
                style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;"
                in:fade={{ duration: 200 }}>

                <div class="p-2 rounded-lg"
                     style="background: {warning.forgiven ? $colorStore.secondary + '20' : $colorStore.accent + '20'};">
                  {#if warning.forgiven}
                    <i class="fa-utility-duo fa-regular fa-circle-check" style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
                  {:else}
                    <i class="fa-utility-duo fa-regular fa-bell"
                       style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
                  {/if}
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <i class="fa-solid fa-user" style="color: {$colorStore.primary}; font-size: 16px;"></i>
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
      </section>
    {/if}
  {/if}
</DashboardPageLayout>

<style lang="postcss">
    @reference '../../../app.css';
</style>