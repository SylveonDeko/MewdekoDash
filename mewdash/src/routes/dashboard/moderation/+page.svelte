<!-- routes/dashboard/moderation/+page.svelte -->
<script lang="ts">


  import { onMount } from "svelte";
  import { banPruneApi, clientApi, moderationApi } from "$lib/api/index.ts";
  import { BanPruneScope } from "$lib/api/banprune/models";
  import type { BanPruneActionInfo, BanPruneSetting } from "$lib/api/banprune/models";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
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
    { id: "activity", label: "Recent Activity", icon: "fa-clock" },
    { id: "banpurge", label: "Ban Purge", icon: "fa-broom" }
  ];

  const ALL_ACTIONS = "*";

  let pruneActions: BanPruneActionInfo[] = $state([]);
  let pruneSettings: BanPruneSetting[] = $state([]);
  let categories: Array<{ id: string; name: string }> = $state([]);
  let textChannels: Array<{ id: string; name: string }> = $state([]);
  let pruneSaving = $state(false);

  let overrideScope = $state<BanPruneScope>(BanPruneScope.Channel);
  let overrideTarget: string | null = $state(null);
  let overrideAction: string | null = $state(ALL_ACTIONS);
  let overrideDays = $state(0);

  let pendingRemoval: BanPruneSetting | null = $state(null);
  let confirmResetOpen = $state(false);

  const actionSelectorOptions = $derived([
    { id: ALL_ACTIONS, name: "All actions" },
    ...pruneActions.map(a => ({ id: a.key, name: a.displayName }))
  ]);

  const guildDefaults = $derived(
    new Map(
      pruneSettings
        .filter(x => x.scopeType === BanPruneScope.Guild)
        .map(x => [x.actionKey, x])
    )
  );

  const overrides = $derived(
    pruneSettings.filter(x => x.scopeType !== BanPruneScope.Guild)
  );

  const overrideTargetOptions = $derived(
    overrideScope === BanPruneScope.Category ? categories : textChannels
  );

  function scopeTargetName(setting: BanPruneSetting): string {
    const pool = setting.scopeType === BanPruneScope.Category ? categories : textChannels;
    const match = pool.find(x => x.id === setting.scopeId);
    const prefix = setting.scopeType === BanPruneScope.Category ? "" : "#";
    return match ? `${prefix}${match.name}` : `${prefix}${setting.scopeId}`;
  }

  function actionName(key: string): string {
    if (!key) return "All actions";
    return pruneActions.find(a => a.key === key)?.displayName ?? key;
  }

  function describeDays(days: number): string {
    if (days <= 0) return "No messages";
    return days === 1 ? "1 day" : `${days} days`;
  }

  /**
   * The purge an action uses at the server level: its own setting, the catch-all
   * setting covering every action, or the action's built in default.
   */
  function guildValueFor(action: BanPruneActionInfo): { days: number; source: string } {
    const own = guildDefaults.get(action.key);
    if (own) return { days: own.pruneDays, source: "set" };

    const all = guildDefaults.get("");
    if (all) return { days: all.pruneDays, source: "all" };

    return { days: action.defaultDays, source: "default" };
  }

  async function fetchBanPruneData() {
    if (!$currentGuild?.id) return;

    try {
      const [actions, settings, categoryData, channelData] = await Promise.all([
        banPruneApi.getActions($currentGuild.id),
        banPruneApi.getSettings($currentGuild.id),
        clientApi.getCategories($currentGuild.id),
        clientApi.getTextChannels($currentGuild.id)
      ]);

      pruneActions = actions || [];
      pruneSettings = settings || [];
      categories = (categoryData || []).map(c => ({ id: String(c.id), name: c.name }));
      textChannels = channelData || [];
    } catch (err) {
      logger.error("Failed to fetch ban purge settings:", err);
      error = "Failed to load ban purge settings";
    }
  }

  async function saveSetting(scopeType: BanPruneScope, scopeId: bigint, actionKey: string | null, days: number) {
    if (!$currentGuild?.id) return;

    pruneSaving = true;
    try {
      await banPruneApi.setSetting($currentGuild.id, {
        scopeType,
        scopeId,
        actionKey,
        pruneDays: Math.max(0, Math.min(7, days))
      });
      pruneSettings = await banPruneApi.getSettings($currentGuild.id);
    } catch (err) {
      logger.error("Failed to save ban purge setting:", err);
      error = "Failed to save ban purge setting";
    } finally {
      pruneSaving = false;
    }
  }

  async function removeSetting(setting: BanPruneSetting) {
    if (!$currentGuild?.id) return;

    pruneSaving = true;
    try {
      await banPruneApi.clearSetting(
        $currentGuild.id,
        setting.scopeType,
        BigInt(setting.scopeId),
        setting.actionKey || null
      );
      pruneSettings = await banPruneApi.getSettings($currentGuild.id);
    } catch (err) {
      logger.error("Failed to remove ban purge setting:", err);
      error = "Failed to remove ban purge setting";
    } finally {
      pruneSaving = false;
    }
  }

  async function addOverride() {
    if (!overrideTarget) return;

    await saveSetting(
      overrideScope,
      BigInt(overrideTarget),
      overrideAction === ALL_ACTIONS ? null : overrideAction,
      overrideDays
    );

    overrideTarget = null;
    overrideAction = ALL_ACTIONS;
    overrideDays = 0;
  }

  async function resetAllSettings() {
    if (!$currentGuild?.id) return;

    pruneSaving = true;
    try {
      await banPruneApi.reset($currentGuild.id);
      pruneSettings = await banPruneApi.getSettings($currentGuild.id);
    } catch (err) {
      logger.error("Failed to reset ban purge settings:", err);
      error = "Failed to reset ban purge settings";
    } finally {
      pruneSaving = false;
    }
  }
  
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

        await fetchBanPruneData();

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

    {#if activeTab === 'banpurge'}
      <!-- Server defaults -->
      <section class="rounded-2xl border p-6 shadow-2xl transition-all mb-8"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                      border-color: {$colorStore.primary}30;"
               in:fly={{ y: 20, duration: 300, delay: 100 }}>
        <div class="flex items-center gap-4 mb-2">
          <div class="p-3 rounded-xl"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <i class="fa-utility-duo fa-regular fa-trash"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Server Defaults</h2>
            <p class="text-sm" style="color: {$colorStore.muted}">
              How many days of a member's messages each action deletes when it bans them.
            </p>
          </div>
        </div>

        <div class="space-y-3 mt-6">
          {#each pruneActions as action (action.key)}
            {@const current = guildValueFor(action)}
            <div class="flex flex-wrap items-center gap-4 p-4 rounded-xl border"
                 style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
              <div class="flex-1 min-w-[180px]">
                <div class="font-medium" style="color: {$colorStore.text}">{action.displayName}</div>
                <div class="text-xs" style="color: {$colorStore.muted}">
                  {#if current.source === 'set'}
                    Set to {describeDays(current.days)}
                  {:else if current.source === 'all'}
                    From the all-actions default
                  {:else}
                    Built in default of {describeDays(action.defaultDays)}
                  {/if}
                </div>
              </div>

              <label class="sr-only" for="prune-days-{action.key}">{action.displayName} purge in days</label>
              <input
                id="prune-days-{action.key}"
                type="number"
                min="0"
                max="7"
                value={current.days}
                disabled={pruneSaving}
                onchange={(e) => saveSetting(BanPruneScope.Guild, 0n, action.key, Number(e.currentTarget.value))}
                class="w-20 p-2 rounded-lg border text-center"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              >

              {#if guildDefaults.has(action.key)}
                <button
                  type="button"
                  class="px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80"
                  style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
                  disabled={pruneSaving}
                  onclick={() => removeSetting(guildDefaults.get(action.key)!)}
                >
                  Unset
                </button>
              {/if}
            </div>
          {/each}
        </div>

        <div class="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t"
             style="border-color: {$colorStore.primary}20;">
          <div class="flex-1 min-w-[180px]">
            <div class="font-medium" style="color: {$colorStore.text}">All actions</div>
            <div class="text-xs" style="color: {$colorStore.muted}">
              Applies to any action above that has no value of its own.
            </div>
          </div>

          <label class="sr-only" for="prune-days-all">Purge in days for every action</label>
          <input
            id="prune-days-all"
            type="number"
            min="0"
            max="7"
            value={guildDefaults.get("")?.pruneDays ?? 0}
            disabled={pruneSaving}
            onchange={(e) => saveSetting(BanPruneScope.Guild, 0n, null, Number(e.currentTarget.value))}
            class="w-20 p-2 rounded-lg border text-center"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
          >

          {#if guildDefaults.has("")}
            <button
              type="button"
              class="px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80"
              style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
              disabled={pruneSaving}
              onclick={() => removeSetting(guildDefaults.get("")!)}
            >
              Unset
            </button>
          {/if}
        </div>
      </section>

      <!-- Overrides -->
      <section class="rounded-2xl border p-6 shadow-2xl transition-all"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                      border-color: {$colorStore.primary}30;"
               in:fly={{ y: 20, duration: 300, delay: 200 }}>
        <div class="flex items-center gap-4 mb-2">
          <div class="p-3 rounded-xl"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <i class="fa-utility-duo fa-regular fa-layer-group"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Overrides</h2>
            <p class="text-sm" style="color: {$colorStore.muted}">
              A channel beats its category, which beats the server default.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div>
            <span id="override-scope-label" class="block mb-2 text-sm" style="color: {$colorStore.text}">Scope</span>
            <DiscordSelector
              type="custom"
              ariaLabelledby="override-scope-label"
              options={[
                { id: String(BanPruneScope.Channel), name: "Channel" },
                { id: String(BanPruneScope.Category), name: "Category" }
              ]}
              selected={String(overrideScope)}
              searchable={false}
              placeholder="Scope..."
              onchange={(detail) => {
                overrideScope = Number(detail.selected) as BanPruneScope;
                overrideTarget = null;
              }}
            />
          </div>

          <div>
            <span id="override-target-label" class="block mb-2 text-sm" style="color: {$colorStore.text}">
              {overrideScope === BanPruneScope.Category ? "Category" : "Channel"}
            </span>
            <DiscordSelector
              type={overrideScope === BanPruneScope.Category ? "custom" : "channel"}
              ariaLabelledby="override-target-label"
              options={overrideTargetOptions}
              bind:selected={overrideTarget}
              placeholder="Select..."
            />
          </div>

          <div>
            <span id="override-action-label" class="block mb-2 text-sm" style="color: {$colorStore.text}">Action</span>
            <DiscordSelector
              type="custom"
              ariaLabelledby="override-action-label"
              options={actionSelectorOptions}
              bind:selected={overrideAction}
              placeholder="Action..."
            />
          </div>

          <div>
            <label for="override-days" class="block mb-2 text-sm" style="color: {$colorStore.text}">Purge (days)</label>
            <div class="flex gap-2">
              <input
                id="override-days"
                type="number"
                min="0"
                max="7"
                bind:value={overrideDays}
                class="w-full p-3 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              >
              <button
                type="button"
                class="px-4 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-40"
                style="background: {$colorStore.primary}; color: {$colorStore.text};"
                disabled={!overrideTarget || pruneSaving}
                onclick={addOverride}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {#if overrides.length === 0}
          <div class="text-center py-8 mt-4">
            <i class="fa-utility-duo fa-regular fa-layer-group"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
            <p class="text-lg font-medium" style="color: {$colorStore.text}">No overrides</p>
            <p class="text-sm" style="color: {$colorStore.muted}">Every channel uses the server defaults.</p>
          </div>
        {:else}
          <div class="space-y-3 mt-6">
            {#each overrides as setting (setting.id)}
              <div class="flex flex-wrap items-center gap-4 p-4 rounded-xl border"
                   style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;"
                   in:fade={{ duration: 200 }}>
                <div class="flex-1 min-w-[200px]">
                  <div class="font-medium" style="color: {$colorStore.text}">
                    {scopeTargetName(setting)}
                  </div>
                  <div class="text-xs" style="color: {$colorStore.muted}">
                    {actionName(setting.actionKey)} &middot; {describeDays(setting.pruneDays)}
                  </div>
                </div>

                <label class="sr-only" for="override-days-{setting.id}">Purge in days</label>
                <input
                  id="override-days-{setting.id}"
                  type="number"
                  min="0"
                  max="7"
                  value={setting.pruneDays}
                  disabled={pruneSaving}
                  onchange={(e) => saveSetting(
                    setting.scopeType,
                    BigInt(setting.scopeId),
                    setting.actionKey || null,
                    Number(e.currentTarget.value)
                  )}
                  class="w-20 p-2 rounded-lg border text-center"
                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                >

                <button
                  type="button"
                  class="px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80"
                  style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
                  disabled={pruneSaving}
                  onclick={() => (pendingRemoval = setting)}
                >
                  Remove
                </button>
              </div>
            {/each}
          </div>

        {/if}

        {#if pruneSettings.length > 0}
          <div class="mt-6 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
            <button
              type="button"
              class="px-4 py-2 rounded-lg text-sm transition-all hover:opacity-80"
              style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
              disabled={pruneSaving}
              onclick={() => (confirmResetOpen = true)}
            >
              Reset everything to defaults
            </button>
          </div>
        {/if}
      </section>
    {/if}
  {/if}
</DashboardPageLayout>

<ConfirmationModal
  isOpen={pendingRemoval !== null}
  title="Remove override?"
  message={pendingRemoval
    ? `Bans in ${scopeTargetName(pendingRemoval)} fall back to the next broadest setting.`
    : ""}
  confirmText="Remove"
  onconfirm={async () => {
    const target = pendingRemoval;
    pendingRemoval = null;
    if (target) await removeSetting(target);
  }}
  oncancel={() => (pendingRemoval = null)}
/>

<ConfirmationModal
  bind:isOpen={confirmResetOpen}
  title="Reset ban purge settings?"
  message="Every server default and override is removed, and each action goes back to its built in purge."
  confirmText="Reset"
  onconfirm={async () => {
    confirmResetOpen = false;
    await resetAllSettings();
  }}
  oncancel={() => (confirmResetOpen = false)}
/>

<style lang="postcss">
    @reference '../../../app.css';
</style>