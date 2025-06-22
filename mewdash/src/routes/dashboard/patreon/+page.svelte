<!-- routes/dashboard/patreon/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { fade, fly } from "svelte/transition";
  import { goto, invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import Notification from "$lib/components/Notification.svelte";
  import { browser } from "$app/environment";
  import {
    Award,
    CheckCircle,
    DollarSign,
    Heart,
    LucideFolderSync,
    MessageCircle,
    Plus,
    RefreshCw,
    Save,
    Settings,
    Target,
    TrendingUp,
    Users,
    XCircle
  } from "lucide-svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  // These types now correctly match the backend models from patreon_types_ts
  import type {
    PatreonAnalytics,
    PatreonConfig,
    PatreonConfigUpdateRequest,
    PatreonGoal,
    PatreonOAuthStatusResponse,
    PatreonSupporter,
    PatreonTier
  } from "$lib/types";
  import { userStore } from "$lib/stores/userStore";

  export let data: PageData;

  let loading = true;
  let error: string | null = null;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let patreonStatus: PatreonOAuthStatusResponse | null = null;
  let patreonAnalytics: PatreonAnalytics | null = null;
  let patreonSupporters: PatreonSupporter[] = [];
  let patreonConfig: PatreonConfig | null = null;
  let patreonTiers: PatreonTier[] = [];
  let patreonGoals: PatreonGoal[] = [];
  let guildRoles: Array<{ id: string; name: string }> = [];
  let guildChannels: Array<{ id: string; name: string }> = [];
  let isConnecting = false;
  let activeTab = "overview";
  let isRefreshing = false;
  let isSyncing = false;
  let isUpdatingConfig = false;

  // Config form state
  let configForm: PatreonConfigUpdateRequest = {
    channelId: undefined,
    message: undefined,
    announcementDay: undefined,
    toggleAnnouncements: undefined,
    toggleRoleSync: undefined
  };

  // Tier mapping state
  let selectedTierId = "";
  let selectedRoleId = "";
  let isMappingTier = false;

  // Handle URL parameters for success/error messages
  onMount(async () => {
    if (browser) {
      await invalidateAll();
      await new Promise(resolve => setTimeout(resolve, 100));

      const urlParams = $page.url.searchParams;
      const success = urlParams.get("success");
      const errorParam = urlParams.get("error");
      const code = urlParams.get("code");
      const state = urlParams.get("state");

      if (code && state) {
        await handleOAuthCallback(code, state);
        const cleanUrl = new URL($page.url);
        cleanUrl.searchParams.delete("code");
        cleanUrl.searchParams.delete("state");
        goto(cleanUrl.toString(), { replaceState: true });
        await loadAllData();
        return;
      }

      if (success === "true") {
        showNotification = true;
        notificationMessage = "Patreon integration configured successfully!";
        notificationType = "success";
        const cleanUrl = new URL($page.url);
        cleanUrl.searchParams.delete("success");
        goto(cleanUrl.toString(), { replaceState: true });
      } else if (errorParam) {
        showNotification = true;
        notificationMessage = decodeURIComponent(errorParam);
        notificationType = "error";
        const cleanUrl = new URL($page.url);
        cleanUrl.searchParams.delete("error");
        goto(cleanUrl.toString(), { replaceState: true });
      }

      await loadAllData();
    }
  });

  async function loadAllData() {
    if (!$currentGuild) {
      if (data.user || $userStore) return;
      return;
    }

    try {
      loading = true;
      error = null;

      // Load basic data first
      await Promise.allSettled([
        loadPatreonStatus(),
        loadGuildRoles(),
        loadGuildChannels()
      ]);

      // If configured, load additional data
      if (patreonStatus?.isConfigured) {
        await Promise.allSettled([
          loadPatreonAnalytics(),
          loadPatreonSupporters(),
          loadPatreonConfig(),
          loadPatreonTiers(),
          loadPatreonGoals()
        ]);
      }
    } catch (err) {
      logger.error("Failed to load data:", err);
      error = err instanceof Error ? err.message : "Failed to load data";
    } finally {
      loading = false;
    }
  }

  async function loadPatreonStatus() {
    if (!$currentGuild) return;
    patreonStatus = await api.getPatreonOAuthStatus(BigInt($currentGuild.id));
  }

  async function loadPatreonAnalytics() {
    if (!$currentGuild) return;
    try {
      patreonAnalytics = await api.getPatreonAnalytics(BigInt($currentGuild.id));
    } catch (err) {
      logger.error("Failed to load analytics:", err);
    }
  }

  async function loadPatreonSupporters() {
    if (!$currentGuild) return;
    try {
      patreonSupporters = await api.getPatreonSupporters(BigInt($currentGuild.id));
    } catch (err) {
      logger.error("Failed to load supporters:", err);
    }
  }

  async function loadPatreonConfig() {
    if (!$currentGuild) return;
    try {
      patreonConfig = await api.getPatreonConfig(BigInt($currentGuild.id));
      // Populate form with current config
      configForm = {
        channelId: patreonConfig.channelId || undefined,
        message: patreonConfig.message || undefined,
        announcementDay: patreonConfig.announcementDay || undefined,
        toggleAnnouncements: undefined,
        toggleRoleSync: undefined
      };
    } catch (err) {
      logger.error("Failed to load config:", err);
    }
  }

  async function loadPatreonTiers() {
    if (!$currentGuild) return;
    try {
      patreonTiers = await api.getPatreonTiers(BigInt($currentGuild.id));
    } catch (err) {
      logger.error("Failed to load tiers:", err);
    }
  }

  async function loadPatreonGoals() {
    if (!$currentGuild) return;
    try {
      patreonGoals = await api.getPatreonGoals(BigInt($currentGuild.id));
    } catch (err) {
      logger.error("Failed to load goals:", err);
    }
  }

  async function loadGuildRoles() {
    if (!$currentGuild) return;
    try {
      guildRoles = await api.getGuildRoles(BigInt($currentGuild.id));
    } catch (err) {
      logger.error("Failed to load roles:", err);
    }
  }

  async function loadGuildChannels() {
    if (!$currentGuild) return;
    try {
      guildChannels = await api.getGuildTextChannels(BigInt($currentGuild.id));
    } catch (err) {
      logger.error("Failed to load channels:", err);
    }
  }

  async function handleOAuthCallback(code: string, state: string) {
    const stateParts = state.split(":");
    const guildId = stateParts[0];

    if (!guildId) {
      showNotification = true;
      notificationMessage = "Invalid OAuth state - missing guild ID";
      notificationType = "error";
      return;
    }

    try {
      isConnecting = true;
      const result = await api.handlePatreonOAuthCallback(code, state);

      showNotification = true;
      notificationMessage = result.message || "Patreon integration configured successfully!";
      notificationType = "success";

      if ($currentGuild) {
        await loadAllData();
      }
    } catch (err) {
      logger.error("OAuth callback failed:", err);
      showNotification = true;
      notificationMessage = err instanceof Error ? err.message : "Failed to configure Patreon integration";
      notificationType = "error";
    } finally {
      isConnecting = false;
    }
  }

  async function connectPatreon() {
    if (!$currentGuild) {
      showNotification = true;
      notificationMessage = "Please select a server first";
      notificationType = "error";
      return;
    }

    try {
      isConnecting = true;
      const oauthData = await api.getPatreonOAuthUrl(BigInt($currentGuild.id));
      window.location.href = oauthData.authorizationUrl;
    } catch (err) {
      logger.error("Failed to get OAuth URL:", err);
      showNotification = true;
      notificationMessage = err instanceof Error ? err.message : "Failed to start OAuth flow";
      notificationType = "error";
      isConnecting = false;
    }
  }

  async function refreshData() {
    isRefreshing = true;
    try {
      await loadAllData();
      showNotification = true;
      notificationMessage = "Data refreshed successfully!";
      notificationType = "success";
    } catch (err) {
      showNotification = true;
      notificationMessage = "Failed to refresh data";
      notificationType = "error";
    } finally {
      isRefreshing = false;
    }
  }

  async function triggerOperation(operation: string) {
    if (!$currentGuild) return;

    try {
      isSyncing = true;
      const result = await api.triggerPatreonOperation(BigInt($currentGuild.id), { operation });
      showNotification = true;
      notificationMessage = result.message;
      notificationType = "success";

      // Refresh relevant data after operation
      if (operation === "sync" || operation === "sync_all") {
        await loadPatreonSupporters();
        await loadPatreonTiers();
        await loadPatreonGoals();
        await loadPatreonAnalytics();
      }
    } catch (err) {
      logger.error(`Failed to trigger ${operation}:`, err);
      showNotification = true;
      notificationMessage = `Failed to ${operation}`;
      notificationType = "error";
    } finally {
      isSyncing = false;
    }
  }

  async function updateConfig() {
    if (!$currentGuild) return;

    try {
      isUpdatingConfig = true;
      const result = await api.updatePatreonConfig(BigInt($currentGuild.id), configForm);
      patreonConfig = result;
      showNotification = true;
      notificationMessage = "Configuration updated successfully!";
      notificationType = "success";
    } catch (err) {
      logger.error("Failed to update config:", err);
      showNotification = true;
      notificationMessage = "Failed to update configuration";
      notificationType = "error";
    } finally {
      isUpdatingConfig = false;
    }
  }

  async function mapTierToRole() {
    if (!$currentGuild || !selectedTierId || !selectedRoleId) return;

    try {
      isMappingTier = true;
      const result = await api.mapPatreonTierToRole(BigInt($currentGuild.id), {
        tierId: selectedTierId,
        roleId: BigInt(selectedRoleId)
      });

      showNotification = true;
      notificationMessage = result.message;
      notificationType = "success";

      selectedTierId = "";
      selectedRoleId = "";

      await loadPatreonTiers();
    } catch (err) {
      logger.error("Failed to map tier to role:", err);
      showNotification = true;
      notificationMessage = "Failed to map tier to role";
      notificationType = "error";
    } finally {
      isMappingTier = false;
    }
  }

  function formatCurrency(cents: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(cents / 100);
  }

  function formatDate(dateString?: string) {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  }
</script>

<svelte:head>
  <title>Patreon Integration - {$currentGuild?.name || 'Mewdeko Dashboard'}</title>
</svelte:head>

{#if showNotification}
  <Notification
    message={notificationMessage}
    type={notificationType}
    on:close={() => (showNotification = false)}
  />
{/if}

<div
  class="min-h-screen p-4 md:p-6"
  style="background: radial-gradient(circle at top,
    {$colorStore.gradientStart}15 0%,
    {$colorStore.gradientMid}10 50%,
    {$colorStore.gradientEnd}05 100%);"
>
  <div class="max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <div
      class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
      in:fade
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);"
          >
            <Heart class="w-6 h-6" style="color: {$colorStore.primary};" />
          </div>
          <div>
            <h1 class="text-3xl font-bold" style="color: {$colorStore.text};">Patreon Integration</h1>
            <p style="color: {$colorStore.muted};">
              Connect your Patreon campaign to automatically sync supporters and manage perks.
            </p>
          </div>
        </div>

        {#if patreonStatus?.isConfigured}
          <div class="flex items-center gap-2">
            <button
              class="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              style="background: {$colorStore.primary}; color: white;"
              on:click={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw class="w-4 h-4 {isRefreshing ? 'animate-spin' : ''}" />
              Refresh
            </button>
          </div>
        {/if}
      </div>
    </div>

    {#if loading}
      <div
        class="backdrop-blur-sm rounded-2xl border p-8 shadow-2xl text-center"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
        in:fade
      >
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
             style="border-color: {$colorStore.primary};"></div>
        <p style="color: {$colorStore.text};">Loading Patreon data...</p>
      </div>
    {:else if error}
      <div
        class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: #ef444430;"
        in:fade
      >
        <div class="flex items-center gap-3 mb-2">
          <XCircle class="w-6 h-6 text-red-400" />
          <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">Error</h3>
        </div>
        <p class="text-red-300">{error}</p>
        <button
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mt-4 transition-colors"
          on:click={loadAllData}
        >
          <RefreshCw class="w-4 h-4 inline mr-2" />
          Retry
        </button>
      </div>
    {:else if !patreonStatus?.isConfigured}
      <!-- Connection Setup -->
      <div
        class="backdrop-blur-sm rounded-2xl border p-8 shadow-2xl text-center"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
        in:fade
      >
        <Heart class="w-16 h-16 mx-auto mb-4 opacity-50" style="color: {$colorStore.primary};" />
        <h3 class="text-2xl font-bold mb-2" style="color: {$colorStore.text};">Connect Your Patreon</h3>
        <p class="mb-8 max-w-md mx-auto text-lg" style="color: {$colorStore.muted};">
          Link your Patreon campaign to automatically sync supporters and provide exclusive perks to your community.
        </p>

        <button
          class="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center gap-3 mx-auto text-lg"
          on:click={connectPatreon}
          disabled={isConnecting}
        >
          {#if isConnecting}
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Connecting...
          {:else}
            <Heart class="w-5 h-5" />
            Connect to Patreon
          {/if}
        </button>

        <!-- Information Card -->
        <div
          class="mt-8 rounded-2xl border p-6 text-left"
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}05, {$colorStore.gradientMid}10);
                 border-color: {$colorStore.primary}20;"
        >
          <h4 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">How it works</h4>
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5"
                style="background: {$colorStore.primary};"
              >1
              </div>
              <p style="color: {$colorStore.muted};">Connect your Patreon account by clicking the "Connect to Patreon"
                button above.</p>
            </div>
            <div class="flex items-start gap-3">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5"
                style="background: {$colorStore.primary};"
              >2
              </div>
              <p style="color: {$colorStore.muted};">Authorize Mewdeko to access your campaign information and supporter
                data.</p>
            </div>
            <div class="flex items-start gap-3">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5"
                style="background: {$colorStore.primary};"
              >3
              </div>
              <p style="color: {$colorStore.muted};">Configure automatic role rewards and exclusive perks for your
                supporters.</p>
            </div>
            <div class="flex items-start gap-3">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5"
                style="background: {$colorStore.primary};"
              >4
              </div>
              <p style="color: {$colorStore.muted};">Supporters will automatically receive their Discord roles and
                perks!</p>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Tabs Navigation -->
      <div
        class="backdrop-blur-sm rounded-2xl border shadow-2xl overflow-hidden"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
        in:fade
      >
        <div class="flex overflow-x-auto">
          {#each [
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "supporters", label: "Supporters", icon: Users },
            { id: "tiers", label: "Tiers & Roles", icon: Award },
            { id: "goals", label: "Goals", icon: Target },
            { id: "settings", label: "Settings", icon: Settings }
          ] as tab}
            <button
              class="flex items-center gap-2 px-6 py-4 whitespace-nowrap transition-colors border-b-2 {activeTab === tab.id ? 'border-current' : 'border-transparent'}"
              style="color: {activeTab === tab.id ? $colorStore.text : $colorStore.muted};"
              on:click={() => activeTab = tab.id}
            >
              <svelte:component this={tab.icon} class="w-4 h-4" />
              {tab.label}
            </button>
          {/each}
        </div>
      </div>

      <!-- Tab Content -->
      <div class="space-y-6">
        {#if activeTab === "overview"}
          <!-- Overview Tab -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" in:fly={{ y: 20, duration: 300 }}>
            <!-- Status Card -->
            <div
              class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;"
            >
              <div class="flex items-center gap-3 mb-4">
                <CheckCircle class="w-6 h-6 text-green-400" />
                <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">Connected</h3>
              </div>
              <div class="space-y-2">
                <div>
                  <p class="text-sm" style="color: {$colorStore.muted};">Campaign ID</p>
                  <p class="font-mono text-sm"
                     style="color: {$colorStore.text};">{patreonStatus.campaignId || 'Unknown'}</p>
                </div>
                <div>
                  <p class="text-sm" style="color: {$colorStore.muted};">Last Sync</p>
                  <p class="text-sm" style="color: {$colorStore.text};">{formatDate(patreonStatus.lastSync)}</p>
                </div>
                <div>
                  <p class="text-sm" style="color: {$colorStore.muted};">Token Expires</p>
                  <p class="text-sm" style="color: {$colorStore.text};">{formatDate(patreonStatus.tokenExpiry)}</p>
                </div>
              </div>
            </div>

            <!-- Analytics Cards -->
            {#if patreonAnalytics}
              <div
                class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
                style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                       border-color: {$colorStore.primary}30;"
              >
                <div class="flex items-center gap-3 mb-4">
                  <Users class="w-6 h-6" style="color: {$colorStore.primary};" />
                  <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">Supporters</h3>
                </div>
                <!-- FIX: Use activeSupporters for the count -->
                <p class="text-3xl font-bold mb-2"
                   style="color: {$colorStore.text};">{patreonAnalytics.activeSupporters}</p>
                <p class="text-sm" style="color: {$colorStore.muted};">Active supporters</p>
              </div>

              <div
                class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
                style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                       border-color: {$colorStore.primary}30;"
              >
                <div class="flex items-center gap-3 mb-4">
                  <DollarSign class="w-6 h-6" style="color: {$colorStore.primary};" />
                  <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">Revenue</h3>
                </div>
                <p class="text-3xl font-bold mb-2"
                   style="color: {$colorStore.text};">{formatCurrency(patreonAnalytics.totalMonthlyRevenue)}</p>
                <p class="text-sm" style="color: {$colorStore.muted};">Monthly recurring</p>
              </div>
            {/if}
          </div>

          <!-- Quick Actions -->
          <div
            class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
            style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                   border-color: {$colorStore.primary}30;"
          >
            <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">Quick Actions</h3>
            <div class="flex flex-wrap gap-3">
              <button
                class="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                on:click={() => triggerOperation("sync_all")}
                disabled={isSyncing}
              >
                <LucideFolderSync class="w-4 h-4 {isSyncing ? 'animate-spin' : ''}" />
                Sync All Data
              </button>

              <button
                class="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                on:click={() => triggerOperation("sync_roles")}
                disabled={isSyncing}
              >
                <Award class="w-4 h-4" />
                Sync Roles
              </button>

              <button
                class="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                on:click={() => triggerOperation("manual_announcement")}
                disabled={isSyncing}
              >
                <MessageCircle class="w-4 h-4" />
                Send Announcement
              </button>

              <button
                class="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                on:click={() => triggerOperation("refresh_token")}
                disabled={isSyncing}
              >
                <RefreshCw class="w-4 h-4" />
                Refresh Token
              </button>
            </div>
          </div>

        {:else if activeTab === "supporters"}
          <!-- Supporters Tab -->
          <div
            class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
            style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                   border-color: {$colorStore.primary}30;"
            in:fly={{ y: 20, duration: 300 }}
          >
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">All Supporters
                ({patreonSupporters.length})</h3>
              <button
                class="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                style="background: {$colorStore.primary}; color: white;"
                on:click={() => triggerOperation("sync_all")}
                disabled={isSyncing}
              >
                <LucideFolderSync class="w-4 h-4 {isSyncing ? 'animate-spin' : ''}" />
                Sync Now
              </button>
            </div>

            {#if patreonSupporters.length === 0}
              <div class="text-center py-8">
                <Users class="w-16 h-16 mx-auto mb-4 opacity-50" style="color: {$colorStore.primary};" />
                <p style="color: {$colorStore.muted};">No supporters found. Try syncing to load the latest data.</p>
              </div>
            {:else}
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                  <tr class="border-b" style="border-color: {$colorStore.primary}30;">
                    <th class="text-left py-3 px-4" style="color: {$colorStore.text};">Name</th>
                    <th class="text-left py-3 px-4" style="color: {$colorStore.text};">Pledge</th>
                    <th class="text-left py-3 px-4" style="color: {$colorStore.text};">Joined</th>
                    <th class="text-left py-3 px-4" style="color: {$colorStore.text};">Status</th>
                  </tr>
                  </thead>
                  <tbody>
                  {#each patreonSupporters as supporter}
                    <tr class="border-b" style="border-color: {$colorStore.primary}20;">
                      <td class="py-3 px-4">
                        <div>
                          <p class="font-medium" style="color: {$colorStore.text};">{supporter.fullName}</p>
                          <p class="text-sm" style="color: {$colorStore.muted};">{supporter.email || 'No email'}</p>
                        </div>
                      </td>
                      <td class="py-3 px-4"
                          style="color: {$colorStore.text};">{formatCurrency(supporter.amountCents)}</td>
                      <td class="py-3 px-4"
                          style="color: {$colorStore.text};">{formatDate(supporter.pledgeRelationshipStart)}</td>
                      <td class="py-3 px-4">
                          <span
                            class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                            class:bg-green-100={supporter.patronStatus === 'active_patron'}
                            class:text-green-800={supporter.patronStatus === 'active_patron'}
                            class:bg-red-100={supporter.patronStatus !== 'active_patron'}
                            class:text-red-800={supporter.patronStatus !== 'active_patron'}>
                            {supporter.patronStatus.replace('_', ' ')}
                          </span>
                      </td>
                    </tr>
                  {/each}
                  </tbody>
                </table>
              </div>
            {/if}
          </div>
        {:else if activeTab === "tiers"}
          <!-- Tiers & Roles Tab -->
          <div class="space-y-6" in:fly={{ y: 20, duration: 300 }}>
            <!-- Tier Mapping -->
            <div
              class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;"
            >
              <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">Map Tier to Role</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label for="patreon-tier" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">Patreon
                    Tier</label>
                  <select
                    id="patreon-tier"
                    bind:value={selectedTierId}
                    class="w-full px-3 py-2 rounded-lg border"
                    style="background: rgb(18, 24, 40); color: {$colorStore.text}; border-color: {$colorStore.primary}30;"
                  >
                    <option value="">Select a tier...</option>
                    {#each patreonTiers as tier}
                      <option value={tier.tierId}>{tier.tierTitle} - {formatCurrency(tier.amountCents)}</option>
                    {/each}
                  </select>
                </div>
                <div>
                  <label for="discord-role" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">Discord
                    Role</label>
                  <select
                    id="discord-role"
                    bind:value={selectedRoleId}
                    class="w-full px-3 py-2 rounded-lg border"
                    style="background: rgb(18, 24, 40); color: {$colorStore.text}; border-color: {$colorStore.primary}30;"
                  >
                    <option value="">Select a role...</option>
                    {#each guildRoles as role}
                      <option value={role.id}>{role.name}</option>
                    {/each}
                  </select>
                </div>
                <div>
                  <button
                    class="w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    style="background: {$colorStore.primary}; color: white;"
                    on:click={mapTierToRole}
                    disabled={isMappingTier || !selectedTierId || !selectedRoleId}
                  >
                    {#if isMappingTier}
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {:else}
                      <Plus class="w-4 h-4" />
                    {/if}
                    Map Tier
                  </button>
                </div>
              </div>
            </div>

            <!-- Tiers List -->
            <div
              class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;"
            >
              <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">Available Tiers</h3>
              {#if patreonTiers.length === 0}
                <div class="text-center py-8">
                  <Award class="w-16 h-16 mx-auto mb-4 opacity-50" style="color: {$colorStore.primary};" />
                  <p style="color: {$colorStore.muted};">No tiers found. Make sure your Patreon campaign has published
                    tiers. Try clicking "Sync All Data".</p>
                </div>
              {:else}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {#each patreonTiers as tier}
                    <div
                      class="rounded-lg p-4 border"
                      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;"
                    >
                      <div class="flex items-start justify-between mb-2">
                        <h4 class="font-semibold" style="color: {$colorStore.text};">{tier.tierTitle}</h4>
                        <span class="text-sm px-2 py-1 rounded-full"
                              style="background: {$colorStore.primary}20; color: {$colorStore.text};">
                          {tier.discordRoleId ? 'Mapped' : 'Unmapped'}
                        </span>
                      </div>
                      <p class="text-lg font-bold mb-2"
                         style="color: {$colorStore.primary};">{formatCurrency(tier.amountCents)}</p>
                      {#if tier.description}
                        <p class="text-sm mb-3" style="color: {$colorStore.muted};">{@html tier.description}</p>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {:else if activeTab === "goals"}
          <!-- Goals Tab -->
          <div
            class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
            style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                   border-color: {$colorStore.primary}30;"
            in:fly={{ y: 20, duration: 300 }}
          >
            <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">Patreon Goals</h3>
            {#if patreonGoals.length === 0}
              <div class="text-center py-8">
                <Target class="w-16 h-16 mx-auto mb-4 opacity-50" style="color: {$colorStore.primary};" />
                <p style="color: {$colorStore.muted};">No goals found. Create goals in your Patreon campaign to track
                  progress. Try clicking "Sync All Data".</p>
              </div>
            {:else}
              <div class="space-y-4">
                {#each patreonGoals as goal}
                  <div
                    class="rounded-lg p-4 border"
                    style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;"
                  >
                    <div class="flex items-start justify-between mb-3">
                      <div>
                        <h4 class="font-semibold" style="color: {$colorStore.text};">{goal.title}</h4>
                        {#if goal.description}
                          <p class="text-sm mt-1" style="color: {$colorStore.muted};">{goal.description}</p>
                        {/if}
                      </div>
                      <div class="text-right">
                        <p class="font-bold"
                           style="color: {$colorStore.primary};">{formatCurrency(goal.amountCents)}</p>
                        {#if goal.reachedAt}
                          <p class="text-xs text-green-400">Reached {formatDate(goal.reachedAt)}</p>
                        {/if}
                      </div>
                    </div>
                    <div class="space-y-2">
                      <div class="flex items-center justify-between text-sm">
                        <span style="color: {$colorStore.muted};">Progress</span>
                        <span style="color: {$colorStore.text};">{goal.completedPercentage}%</span>
                      </div>
                      <div class="w-full bg-gray-600 rounded-full h-2">
                        <div
                          class="h-2 rounded-full transition-all duration-300"
                          style="background: {$colorStore.primary}; width: {goal.completedPercentage}%;"
                        ></div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {:else if activeTab === "settings"}
          <!-- Settings Tab -->
          <div class="space-y-6" in:fly={{ y: 20, duration: 300 }}>
            <div
              class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;"
            >
              <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">Configuration</h3>
              <form on:submit|preventDefault={updateConfig} class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="announcement-channel" class="block text-sm font-medium mb-2"
                           style="color: {$colorStore.text};">Announcement Channel</label>
                    <select
                      id="announcement-channel"
                      bind:value={configForm.channelId}
                      class="w-full px-3 py-2 rounded-lg border"
                      style="background: rgb(18, 24, 40); color: {$colorStore.text}; border-color: {$colorStore.primary}30;"
                    >
                      <option value={undefined}>Select a channel...</option>
                      {#each guildChannels as channel}
                        <option value={BigInt(channel.id)}>#{channel.name}</option>
                      {/each}
                    </select>
                  </div>
                  <div>
                    <label for="announcement-day" class="block text-sm font-medium mb-2"
                           style="color: {$colorStore.text};">Announcement Day (1-28)</label>
                    <input
                      id="announcement-day"
                      type="number"
                      min="1"
                      max="28"
                      bind:value={configForm.announcementDay}
                      class="w-full px-3 py-2 rounded-lg border"
                      style="background: rgb(18, 24, 40); color: {$colorStore.text}; border-color: {$colorStore.primary}30;"
                      placeholder="Day of month"
                    />
                  </div>
                </div>

                <div>
                  <label for="custom-message" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">Custom
                    Message</label>
                  <textarea
                    id="custom-message"
                    bind:value={configForm.message}
                    rows="3"
                    class="w-full px-3 py-2 rounded-lg border"
                    style="background: rgb(18, 24, 40); color: {$colorStore.text}; border-color: {$colorStore.primary}30;"
                    placeholder="Custom announcement message..."
                  ></textarea>
                </div>

                <div class="flex items-center gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      bind:checked={configForm.toggleAnnouncements}
                      class="rounded"
                      style="accent-color: {$colorStore.primary};"
                    />
                    <span style="color: {$colorStore.text};">Enable Announcements</span>
                  </label>

                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      bind:checked={configForm.toggleRoleSync}
                      class="rounded"
                      style="accent-color: {$colorStore.primary};"
                    />
                    <span style="color: {$colorStore.text};">Enable Role Sync</span>
                  </label>
                </div>

                <div class="flex gap-3">
                  <button
                    type="submit"
                    class="px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                    style="background: {$colorStore.primary}; color: white;"
                    disabled={isUpdatingConfig}
                  >
                    {#if isUpdatingConfig}
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {:else}
                      <Save class="w-4 h-4" />
                    {/if}
                    Save Configuration
                  </button>
                </div>
              </form>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
