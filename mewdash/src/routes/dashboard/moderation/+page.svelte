<!-- routes/dashboard/moderation/+page.svelte -->
<script lang="ts">


  import { onMount } from "svelte";
  import { banPruneApi, clientApi, moderationApi, PunishmentAction, type WarningPunishment } from "$lib/api/index.ts";
  import { BanPruneScope } from "$lib/api/banprune/models";
  import type { BanPruneActionInfo, BanPruneSetting } from "$lib/api/banprune/models";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
    import {currentGuild} from "$lib/stores/currentGuild";
    import {colorStore} from "$lib/stores/colorStore";
    import {logger} from "$lib/logger";
    import {fade, fly, slide} from "svelte/transition";
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
    { id: "punishments", label: "Punishments", icon: "fa-gavel" },
    { id: "activity", label: "Recent Activity", icon: "fa-clock" },
    { id: "banpurge", label: "Ban Purge", icon: "fa-broom" }
  ];

  /** Warning management state */
  let warningSearch = $state("");
  let showForgiven = $state(true);
  let warningBusy = $state(false);
  let showWarnForm = $state(false);
  let warnUserId = $state("");
  let warnReason = $state("");
  let warnError = $state("");
  let pendingDeleteWarning: any | null = $state(null);
  let pendingForgiveAllUser: string | null = $state(null);

  /** Punishment ladder state */
  let punishments: WarningPunishment[] = $state([]);
  let guildRoles: Array<{ id: string; name: string; color?: number }> = $state([]);
  let warnlogChannelId = $state<string | null>(null);
  let punishmentBusy = $state(false);
  let newPunishment = $state({ count: 3, punishment: PunishmentAction.Mute.toString(), timeMinutes: null as number | null, roleId: null as string | null });
  let punishmentError = $state("");
  let pendingRemovePunishment: number | null = $state(null);

  /** Punishments that can be chosen for the warning ladder */
  const punishmentOptions = [
    { id: PunishmentAction.Mute.toString(), name: "Mute" },
    { id: PunishmentAction.ChatMute.toString(), name: "Chat mute" },
    { id: PunishmentAction.VoiceMute.toString(), name: "Voice mute" },
    { id: PunishmentAction.Timeout.toString(), name: "Timeout" },
    { id: PunishmentAction.Kick.toString(), name: "Kick" },
    { id: PunishmentAction.Softban.toString(), name: "Softban" },
    { id: PunishmentAction.Ban.toString(), name: "Ban" },
    { id: PunishmentAction.AddRole.toString(), name: "Add role" },
    { id: PunishmentAction.RemoveRoles.toString(), name: "Remove all roles" }
  ];

  /** Punishments that accept a duration */
  const timedPunishments = new Set([
    PunishmentAction.Mute, PunishmentAction.ChatMute, PunishmentAction.VoiceMute,
    PunishmentAction.Timeout, PunishmentAction.Ban, PunishmentAction.AddRole
  ]);

  let selectedPunishmentIsTimed = $derived(timedPunishments.has(parseInt(newPunishment.punishment)));
  let selectedPunishmentNeedsRole = $derived(parseInt(newPunishment.punishment) === PunishmentAction.AddRole);

  let filteredWarnings = $derived.by(() => {
    const term = warningSearch.trim().toLowerCase();
    return warnings.filter(w => {
      if (!showForgiven && w.forgiven) return false;
      if (!term) return true;
      return w.userId.toString().includes(term)
        || (w.reason || "").toLowerCase().includes(term)
        || (w.moderator || "").toLowerCase().includes(term);
    });
  });

  /** Groups filtered warnings by user for the per-user forgive action */
  let warningsByUser = $derived.by(() => {
    const map = new Map<string, any[]>();
    for (const w of filteredWarnings) {
      const key = w.userId.toString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    }
    return Array.from(map.entries()).map(([userId, items]) => ({
      userId,
      items,
      active: items.filter(i => !i.forgiven).length
    }));
  });

  function moderatorId(): bigint | null {
    return data?.user?.id ? BigInt(data.user.id) : null;
  }

  async function forgiveWarning(warning: any) {
    const mod = moderatorId();
    if (!$currentGuild?.id || !mod) return;
    warningBusy = true;
    try {
      await moderationApi.forgiveWarning($currentGuild.id, warning.id, mod);
      await fetchModerationData();
    } catch (err) {
      logger.error("Failed to forgive warning:", err);
      error = "Failed to forgive warning";
    } finally {
      warningBusy = false;
    }
  }

  async function forgiveAllForUser(userId: string) {
    const mod = moderatorId();
    if (!$currentGuild?.id || !mod) return;
    warningBusy = true;
    try {
      await moderationApi.forgiveAllWarnings($currentGuild.id, BigInt(userId), mod);
      await fetchModerationData();
    } catch (err) {
      logger.error("Failed to forgive warnings:", err);
      error = "Failed to forgive warnings";
    } finally {
      warningBusy = false;
    }
  }

  async function deleteWarning(warning: any) {
    if (!$currentGuild?.id) return;
    warningBusy = true;
    try {
      await moderationApi.deleteWarning($currentGuild.id, warning.id);
      await fetchModerationData();
    } catch (err) {
      logger.error("Failed to delete warning:", err);
      error = "Failed to delete warning";
    } finally {
      warningBusy = false;
    }
  }

  async function submitWarn() {
    const mod = moderatorId();
    warnError = "";
    if (!$currentGuild?.id || !mod) return;
    if (!/^\d{15,22}$/.test(warnUserId.trim())) {
      warnError = "Enter a valid Discord user ID.";
      return;
    }
    if (!warnReason.trim()) {
      warnError = "A reason is required.";
      return;
    }
    warningBusy = true;
    try {
      const result = await moderationApi.warnUser($currentGuild.id, BigInt(warnUserId.trim()), { moderatorId: mod, reason: warnReason.trim() });
      warnUserId = "";
      warnReason = "";
      showWarnForm = false;
      if (result.punishmentApplied && result.punishment) {
        error = null;
      }
      await fetchModerationData();
    } catch (err) {
      logger.error("Failed to warn user:", err);
      warnError = "Failed to warn user. Make sure the ID belongs to a member of this server.";
    } finally {
      warningBusy = false;
    }
  }

  async function fetchPunishmentData() {
    if (!$currentGuild?.id) return;
    try {
      const [list, channel, roles] = await Promise.all([
        moderationApi.getWarningPunishments($currentGuild.id).catch(() => []),
        moderationApi.getWarnlogChannel($currentGuild.id).catch(() => null),
        guildRoles.length ? Promise.resolve(guildRoles) : clientApi.getRoles($currentGuild.id).catch(() => [])
      ]);
      punishments = (list || []).slice().sort((a, b) => a.count - b.count);
      warnlogChannelId = channel?.channelId && channel.channelId.toString() !== "0" ? channel.channelId.toString() : null;
      guildRoles = (roles as any[]).map(r => ({ id: r.id.toString(), name: r.name, color: r.color }));
    } catch (err) {
      logger.error("Failed to load punishment settings:", err);
    }
  }

  async function addPunishment() {
    punishmentError = "";
    if (!$currentGuild?.id) return;
    if (!newPunishment.count || newPunishment.count < 1) {
      punishmentError = "Warning count must be at least 1.";
      return;
    }
    if (selectedPunishmentNeedsRole && !newPunishment.roleId) {
      punishmentError = "Choose the role to add.";
      return;
    }
    punishmentBusy = true;
    try {
      punishments = (await moderationApi.setWarningPunishment($currentGuild.id, {
        count: newPunishment.count,
        punishment: parseInt(newPunishment.punishment),
        timeMinutes: selectedPunishmentIsTimed ? newPunishment.timeMinutes || null : null,
        roleId: selectedPunishmentNeedsRole && newPunishment.roleId ? BigInt(newPunishment.roleId) : null
      })).slice().sort((a, b) => a.count - b.count);
      newPunishment = { ...newPunishment, count: newPunishment.count + 1, timeMinutes: null };
    } catch (err: any) {
      logger.error("Failed to save punishment:", err);
      punishmentError = err?.message || "Failed to save punishment.";
    } finally {
      punishmentBusy = false;
    }
  }

  async function removePunishment(count: number) {
    if (!$currentGuild?.id) return;
    punishmentBusy = true;
    try {
      punishments = (await moderationApi.removeWarningPunishment($currentGuild.id, count)).slice().sort((a, b) => a.count - b.count);
    } catch (err) {
      logger.error("Failed to remove punishment:", err);
      error = "Failed to remove punishment";
    } finally {
      punishmentBusy = false;
    }
  }

  async function saveWarnlogChannel(channelId: string | null) {
    if (!$currentGuild?.id || !channelId) return;
    punishmentBusy = true;
    try {
      await moderationApi.setWarnlogChannel($currentGuild.id, BigInt(channelId));
      warnlogChannelId = channelId;
    } catch (err) {
      logger.error("Failed to set warn log channel:", err);
      error = "Failed to set warning log channel";
    } finally {
      punishmentBusy = false;
    }
  }

  function describePunishment(p: WarningPunishment): string {
    const name = punishmentOptions.find(o => o.id === p.punishment.toString())?.name ?? p.punishmentName;
    const parts = [name];
    if (p.punishment === PunishmentAction.AddRole && p.roleId) {
      parts.push(`@${guildRoles.find(r => r.id === p.roleId?.toString())?.name ?? p.roleId}`);
    }
    if (p.time > 0) {
      parts.push(p.time >= 1440 ? `for ${Math.round(p.time / 1440)}d` : p.time >= 60 ? `for ${Math.round(p.time / 60)}h` : `for ${p.time}m`);
    }
    return parts.join(" ");
  }

  $effect(() => {
    if (activeTab === "punishments" && $currentGuild?.id) fetchPunishmentData();
  });

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
          <h2 class="text-xl font-bold flex-1" style="color: {$colorStore.text}">All Warnings</h2>
          <button class="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                  onclick={() => { showWarnForm = !showWarnForm; warnError = ""; }}>
            <i class="fa-solid {showWarnForm ? 'fa-xmark' : 'fa-plus'}"></i>
            {showWarnForm ? "Cancel" : "Warn a user"}
          </button>
        </div>

        {#if showWarnForm}
          <form class="mb-6 p-4 rounded-xl border space-y-3" transition:slide
                style="background: {$colorStore.accent}05; border-color: {$colorStore.accent}30;"
                onsubmit={(e) => { e.preventDefault(); submitWarn(); }}>
            <div class="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-3">
              <input type="text" inputmode="numeric" bind:value={warnUserId} placeholder="User ID" aria-label="User ID to warn"
                     class="p-3 rounded-lg border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
              <input type="text" bind:value={warnReason} placeholder="Reason (shown to the user)" aria-label="Warning reason" maxlength="500"
                     class="p-3 rounded-lg border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
              <button type="submit" disabled={warningBusy}
                      class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
                      style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;">
                <i class="fa-solid fa-triangle-exclamation"></i>
                Warn
              </button>
            </div>
            <p class="text-xs" style="color: {$colorStore.muted}">Configured punishments for the resulting warning count are applied automatically.</p>
            {#if warnError}
              <div class="p-3 rounded-lg flex items-center gap-2 text-sm" role="alert"
                   style="background: #ef444420; border: 1px solid #ef444430; color: #ef4444;">
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>{warnError}</span>
              </div>
            {/if}
          </form>
        {/if}

        {#if warnings.length > 0}
          <div class="flex flex-col sm:flex-row gap-3 mb-4">
            <div class="relative flex-1">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2" style="color: {$colorStore.muted}; font-size: 14px;"></i>
              <input type="text" bind:value={warningSearch} placeholder="Search by user ID, reason, or moderator"
                     aria-label="Search warnings"
                     class="w-full pl-9 pr-3 py-3 rounded-lg border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            </div>
            <label class="flex items-center gap-2 px-3 rounded-lg cursor-pointer min-h-[44px] text-sm"
                   style="background: {$colorStore.primary}08; color: {$colorStore.text};">
              <input type="checkbox" bind:checked={showForgiven} class="w-4 h-4 rounded" style="accent-color: {$colorStore.primary};">
              Show forgiven
            </label>
          </div>
        {/if}

        {#if warnings.length === 0}
          <div class="text-center py-8">
            <i class="fa-utility-duo fa-regular fa-shield" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
            <p class="text-lg font-medium" style="color: {$colorStore.text}">No warnings found</p>
            <p class="text-sm" style="color: {$colorStore.muted}">This server has been peaceful!</p>
          </div>
        {:else if filteredWarnings.length === 0}
          <div class="text-center py-8">
            <p class="text-sm" style="color: {$colorStore.muted}">No warnings match your search.</p>
          </div>
        {:else}
          <div class="space-y-4 max-h-[40rem] overflow-y-auto pr-1">
            {#each warningsByUser as group (group.userId)}
              <div class="rounded-xl border p-4" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-user" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                    <span class="font-medium" style="color: {$colorStore.text}">User {group.userId}</span>
                    <span class="px-2 py-0.5 text-xs rounded-full" style="background: {group.active > 0 ? $colorStore.accent + '20' : $colorStore.secondary + '20'}; color: {group.active > 0 ? $colorStore.accent : $colorStore.secondary};">
                      {group.active} active
                    </span>
                  </div>
                  {#if group.active > 0}
                    <button class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] min-h-[36px] disabled:opacity-50"
                            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                            disabled={warningBusy}
                            onclick={() => pendingForgiveAllUser = group.userId}>
                      Forgive all
                    </button>
                  {/if}
                </div>
                <div class="space-y-2">
                  {#each group.items as warning (warning.id)}
                    <div class="flex items-start gap-3 p-3 rounded-lg transition-all duration-200"
                         style="background: {$colorStore.primary}05; opacity: {warning.forgiven ? 0.7 : 1};"
                         in:fade={{ duration: 200 }}>
                      <div class="p-2 rounded-lg shrink-0"
                           style="background: {warning.forgiven ? $colorStore.secondary + '20' : $colorStore.accent + '20'};">
                        {#if warning.forgiven}
                          <i class="fa-utility-duo fa-regular fa-circle-check" style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.primary}; font-size: 18px;"></i>
                        {:else}
                          <i class="fa-utility-duo fa-regular fa-bell" style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 18px;"></i>
                        {/if}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm break-words" style="color: {$colorStore.text}">
                          {warning.reason || "No reason provided"}
                          {#if warning.forgiven}
                            <span class="ml-2 px-2 py-0.5 text-xs rounded-full" style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                              Forgiven{warning.forgivenBy ? ` by ${warning.forgivenBy}` : ""}
                            </span>
                          {/if}
                        </p>
                        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-1" style="color: {$colorStore.muted}">
                          <span>By {warning.moderator || "Unknown"}</span>
                          <span>{formatDate(warning.dateAdded)}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-1 shrink-0">
                        {#if !warning.forgiven}
                          <button class="p-2 rounded-lg transition-all hover:scale-[1.05] min-h-[36px] min-w-[36px] disabled:opacity-50"
                                  style="background: {$colorStore.secondary}15; color: {$colorStore.secondary};"
                                  disabled={warningBusy}
                                  aria-label="Forgive warning" title="Forgive"
                                  onclick={() => forgiveWarning(warning)}>
                            <i class="fa-solid fa-check" style="font-size: 12px;"></i>
                          </button>
                        {/if}
                        <button class="p-2 rounded-lg transition-all hover:scale-[1.05] min-h-[36px] min-w-[36px] disabled:opacity-50"
                                style="background: #ef444415; color: #ef4444;"
                                disabled={warningBusy}
                                aria-label="Delete warning" title="Delete permanently"
                                onclick={() => pendingDeleteWarning = warning}>
                          <i class="fa-solid fa-trash" style="font-size: 12px;"></i>
                        </button>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </section>
    {/if}

    {#if activeTab === 'punishments'}
      <section class="space-y-6" in:fly={{ y: 20, duration: 300, delay: 200 }}>
        <div class=" rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;">
          <div class="flex items-center gap-4 mb-2">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <i class="fa-utility-duo fa-regular fa-shield-halved"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Warning Punishments</h2>
              <p class="text-sm" style="color: {$colorStore.muted}">What happens automatically when a member reaches a number of active warnings</p>
            </div>
          </div>

          <form class="mt-6 p-4 rounded-xl border space-y-4"
                style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;"
                onsubmit={(e) => { e.preventDefault(); addPunishment(); }}>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label for="punish-count" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">At warning #</label>
                <input id="punish-count" type="number" min="1" max="100" bind:value={newPunishment.count}
                       class="w-full p-3 rounded-lg border min-h-[44px]"
                       style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
              </div>
              <div>
                <span id="punish-action-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Punishment</span>
                <DiscordSelector type="custom" options={punishmentOptions} selected={newPunishment.punishment} searchable={false}
                                 ariaLabelledby="punish-action-label"
                                 onchange={(e) => { if (typeof e.selected === "string") newPunishment.punishment = e.selected; }} />
              </div>
              {#if selectedPunishmentIsTimed}
                <div>
                  <label for="punish-minutes" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Duration (minutes)</label>
                  <input id="punish-minutes" type="number" min="1" max="70560" bind:value={newPunishment.timeMinutes} placeholder="Permanent"
                         class="w-full p-3 rounded-lg border min-h-[44px]"
                         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
                </div>
              {/if}
              {#if selectedPunishmentNeedsRole}
                <div>
                  <span id="punish-role-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Role to add</span>
                  <DiscordSelector type="role" options={guildRoles} selected={newPunishment.roleId} placeholder="Select role"
                                   ariaLabelledby="punish-role-label"
                                   onchange={(e) => { newPunishment.roleId = typeof e.selected === "string" ? e.selected : null; }} />
                </div>
              {/if}
            </div>
            {#if punishmentError}
              <div class="p-3 rounded-lg flex items-center gap-2 text-sm" role="alert"
                   style="background: #ef444420; border: 1px solid #ef444430; color: #ef4444;">
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>{punishmentError}</span>
              </div>
            {/if}
            <button type="submit" disabled={punishmentBusy}
                    class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px] disabled:opacity-50"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
              <i class="fa-solid fa-plus"></i>
              Add to ladder
            </button>
          </form>

          <div class="mt-6">
            {#if punishments.length === 0}
              <div class="text-center py-8">
                <i class="fa-utility-duo fa-regular fa-shield-halved" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 40px; opacity: 0.5; display: block; margin: 0 auto 12px;"></i>
                <p style="color: {$colorStore.muted}">No automatic punishments yet. Warnings are only recorded.</p>
              </div>
            {:else}
              <ol class="space-y-2">
                {#each punishments as p (p.count)}
                  <li class="flex items-center gap-4 p-4 rounded-xl border" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;" transition:slide>
                    <div class="w-12 h-12 rounded-full flex flex-col items-center justify-center shrink-0"
                         style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
                      <span class="text-lg font-bold leading-none">{p.count}</span>
                      <span class="text-[10px] uppercase">warn{p.count === 1 ? "" : "s"}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-medium" style="color: {$colorStore.text}">{describePunishment(p)}</div>
                      <div class="text-xs" style="color: {$colorStore.muted}">Applied when a member reaches {p.count} active warning{p.count === 1 ? "" : "s"}</div>
                    </div>
                    <button class="px-3 py-2 rounded-lg text-sm transition-all hover:scale-[1.02] min-h-[40px] disabled:opacity-50"
                            style="background: #ef444415; color: #ef4444; border: 1px solid #ef444430;"
                            disabled={punishmentBusy}
                            onclick={() => pendingRemovePunishment = p.count}>
                      Remove
                    </button>
                  </li>
                {/each}
              </ol>
            {/if}
          </div>
        </div>

        <div class=" rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <i class="fa-utility-duo fa-regular fa-list-ul"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
            </div>
            <div>
              <h2 id="warnlog-label" class="text-xl font-bold" style="color: {$colorStore.text}">Warning Log Channel</h2>
              <p class="text-sm" style="color: {$colorStore.muted}">Every warning and punishment is posted here. Saves immediately.</p>
            </div>
          </div>
          <DiscordSelector type="channel" options={textChannels} selected={warnlogChannelId} placeholder="No warning log"
                           ariaLabelledby="warnlog-label" disabled={punishmentBusy}
                           onchange={(e) => saveWarnlogChannel(typeof e.selected === "string" ? e.selected : null)} />
        </div>
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
  isOpen={pendingDeleteWarning !== null}
  title="Delete warning?"
  message="The warning is removed permanently and no longer counts toward punishments. Forgiving keeps a record instead."
  confirmText="Delete"
  onconfirm={async () => {
    const target = pendingDeleteWarning;
    pendingDeleteWarning = null;
    if (target) await deleteWarning(target);
  }}
  oncancel={() => (pendingDeleteWarning = null)}
/>

<ConfirmationModal
  isOpen={pendingForgiveAllUser !== null}
  title="Forgive all warnings?"
  message={pendingForgiveAllUser ? `Every active warning for user ${pendingForgiveAllUser} is marked forgiven.` : ""}
  confirmText="Forgive all"
  variant="warning"
  onconfirm={async () => {
    const target = pendingForgiveAllUser;
    pendingForgiveAllUser = null;
    if (target) await forgiveAllForUser(target);
  }}
  oncancel={() => (pendingForgiveAllUser = null)}
/>

<ConfirmationModal
  isOpen={pendingRemovePunishment !== null}
  title="Remove punishment?"
  message={pendingRemovePunishment !== null ? `Nothing will happen automatically at ${pendingRemovePunishment} warnings anymore.` : ""}
  confirmText="Remove"
  onconfirm={async () => {
    const target = pendingRemovePunishment;
    pendingRemovePunishment = null;
    if (target !== null) await removePunishment(target);
  }}
  oncancel={() => (pendingRemovePunishment = null)}
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