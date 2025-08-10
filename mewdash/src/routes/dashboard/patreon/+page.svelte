<!-- routes/dashboard/patreon/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { fade, fly } from "svelte/transition";
  import { goto, invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
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
    Unlink,
    Users,
    XCircle
  } from "lucide-svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import type {
    PatreonAnalytics,
    PatreonConfig,
    PatreonConfigUpdateRequest,
    PatreonCreator,
    PatreonOAuthStatusResponse,
    PatreonSupporter,
    PatreonTier
  } from "$lib/types";
  import { userStore } from "$lib/stores/userStore";

  export let data: PageData;

  let loading = true;
  let error: string | null = null;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let patreonStatus: PatreonOAuthStatusResponse | null = null;

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
  }
  let patreonAnalytics: PatreonAnalytics | null = null;
  let patreonSupporters: PatreonSupporter[] = [];
  let patreonConfig: PatreonConfig | null = null;
  let patreonTiers: PatreonTier[] = [];
  let patreonCreator: PatreonCreator | null = null;
  let guildRoles: Array<{ id: string; name: string }> = [];
  let guildChannels: Array<{ id: string; name: string }> = [];
  let isConnecting = false;
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
  
  // Layout state
  let activeTab = "overview";
  
  const tabs = [
    { id: "overview", label: "Overview", icon: Heart },
    { id: "supporters", label: "Supporters", icon: Users },
    { id: "tiers", label: "Tier Mapping", icon: Award },
    { id: "config", label: "Configuration", icon: Settings }
  ];

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
        await goto(cleanUrl.toString(), { replaceState: true });
        await loadAllData();
        return;
      }

      if (success === "true") {
        showNotificationMessage("Patreon integration configured successfully!", "success");
        const cleanUrl = new URL($page.url);
        cleanUrl.searchParams.delete("success");
        await goto(cleanUrl.toString(), { replaceState: true });
      } else if (errorParam) {
        showNotificationMessage(decodeURIComponent(errorParam), "error");
        const cleanUrl = new URL($page.url);
        cleanUrl.searchParams.delete("error");
        await goto(cleanUrl.toString(), { replaceState: true });
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
          loadPatreonCreator()
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

  async function loadPatreonCreator() {
    if (!$currentGuild) return;
    try {
      patreonCreator = await api.getPatreonCreator(BigInt($currentGuild.id));
    } catch (err) {
      logger.error("Failed to load creator:", err);
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
      showNotificationMessage("Invalid OAuth state - missing guild ID", "error");
      return;
    }

    try {
      isConnecting = true;
      const result = await api.handlePatreonOAuthCallback(code, state);

      showNotificationMessage(result.message || "Patreon integration configured successfully!", "success");

      if ($currentGuild) {
        await loadAllData();
      }
    } catch (err) {
      logger.error("OAuth callback failed:", err);
      showNotificationMessage(err instanceof Error ? err.message : "Failed to configure Patreon integration", "error");
    } finally {
      isConnecting = false;
    }
  }

  async function connectPatreon() {
    if (!$currentGuild) {
      showNotificationMessage("Please select a server first", "error");
      return;
    }

    try {
      isConnecting = true;
      const oauthData = await api.getPatreonOAuthUrl(BigInt($currentGuild.id));
      window.location.href = oauthData.authorizationUrl;
    } catch (err) {
      logger.error("Failed to get OAuth URL:", err);
      showNotificationMessage(err instanceof Error ? err.message : "Failed to start OAuth flow", "error");
      isConnecting = false;
    }
  }

  async function refreshData() {
    isRefreshing = true;
    try {
      await loadAllData();
      showNotificationMessage("Data refreshed successfully!", "success");
    } catch (err) {
      showNotificationMessage("Failed to refresh data", "error");
    } finally {
      isRefreshing = false;
    }
  }

  async function triggerOperation(operation: string) {
    if (!$currentGuild) return;

    try {
      isSyncing = true;
      const result = await api.triggerPatreonOperation(BigInt($currentGuild.id), { operation });
      showNotificationMessage(result.message, "success");

      // Refresh relevant data after operation
      if (operation === "sync" || operation === "sync_all") {
        await loadPatreonSupporters();
        await loadPatreonTiers();
        await loadPatreonAnalytics();
        await loadPatreonCreator();
      }
    } catch (err) {
      logger.error(`Failed to trigger ${operation}:`, err);
      showNotificationMessage(`Failed to ${operation}`, "error");
    } finally {
      isSyncing = false;
    }
  }

  async function updateConfig() {
    if (!$currentGuild) return;

    try {
      isUpdatingConfig = true;
      patreonConfig = await api.updatePatreonConfig(BigInt($currentGuild.id), configForm);
      showNotificationMessage("Configuration updated successfully!", "success");
    } catch (err) {
      logger.error("Failed to update config:", err);
      showNotificationMessage("Failed to update configuration", "error");
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

      showNotificationMessage(result.message, "success");

      selectedTierId = "";
      selectedRoleId = "";

      await loadPatreonTiers();
    } catch (err) {
      logger.error("Failed to map tier to role:", err);
      showNotificationMessage("Failed to map tier to role", "error");
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

  function formatDate(dateString?: string | null) {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  }

  async function disconnectPatreon() {
    if (!$currentGuild) return;

    try {
      isConnecting = true;
      const result = await api.disconnectPatreon(BigInt($currentGuild.id));
      showNotificationMessage(result.message, "success");

      // Reload data to show disconnected state
      await loadAllData();
    } catch (err) {
      logger.error("Failed to disconnect Patreon:", err);
      showNotificationMessage(err instanceof Error ? err.message : "Failed to disconnect Patreon", "error");
    } finally {
      isConnecting = false;
    }
  }
</script>

<svelte:head>
  <title>Patreon Integration - {$currentGuild?.name || 'Mewdeko Dashboard'}</title>
</svelte:head>

<DashboardPageLayout 
  title="Patreon Integration" 
  subtitle="Connect your Patreon campaign to automatically sync supporters and manage perks" 
  icon={Heart}
  guildName={$currentGuild?.name || "Dashboard"}
  tabs={tabs}
  bind:activeTab
  on:tabChange={(e) => activeTab = e.detail.tabId}
  bind:notificationMessage
  bind:notificationType
  actionButtons={patreonStatus?.isConfigured ? [
    {
      label: "Refresh Data",
      icon: RefreshCw,
      action: refreshData,
      loading: isRefreshing
    },
    {
      label: "Sync Supporters",
      icon: LucideFolderSync,
      action: () => triggerOperation("sync_all"),
      loading: isSyncing
    }
  ] : []}
>

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

            <!-- Creator Card -->
            {#if patreonCreator}
              <div
                class="backdrop-blur-sm rounded-2xl border p-4 md:p-6 shadow-2xl col-span-1 md:col-span-2 lg:col-span-1"
                style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                       border-color: {$colorStore.primary}30;"
              >
                <div class="flex items-center gap-3 mb-4">
                  <Heart class="w-5 h-5 md:w-6 md:h-6" style="color: {$colorStore.primary};" />
                  <h3 class="text-base md:text-lg font-semibold" style="color: {$colorStore.text};">Campaign Creator</h3>
                </div>
                
                <!-- Mobile-first layout -->
                <div class="space-y-3">
                  <div class="flex items-center gap-3">
                    {#if patreonCreator.attributes?.image_url}
                      <img 
                        src={patreonCreator.attributes.image_url} 
                        alt="Creator avatar" 
                        class="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover flex-shrink-0"
                      />
                    {:else}
                      <div 
                        class="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center flex-shrink-0"
                        style="background: {$colorStore.primary}20;"
                      >
                        <Heart class="w-6 h-6 md:w-7 md:h-7" style="color: {$colorStore.primary};" />
                      </div>
                    {/if}
                    
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-sm md:text-base truncate" style="color: {$colorStore.text};">
                        {patreonCreator.attributes?.full_name || patreonCreator.attributes?.first_name || 'Unknown Creator'}
                      </p>
                      
                      {#if patreonCreator.attributes?.is_creator}
                        <div class="flex items-center gap-1 mt-1">
                          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span class="text-xs" style="color: {$colorStore.muted};">Verified Creator</span>
                        </div>
                      {/if}
                    </div>
                  </div>
                  
                  <!-- Creator info -->
                  <div class="space-y-2 text-xs md:text-sm">
                    {#if patreonCreator.attributes?.created}
                      <div class="flex justify-between">
                        <span style="color: {$colorStore.muted};">Member since:</span>
                        <span style="color: {$colorStore.text};">
                          {new Date(patreonCreator.attributes.created).getFullYear()}
                        </span>
                      </div>
                    {/if}
                    
                    {#if patreonCreator.relationships?.memberships?.data}
                      <div class="flex justify-between">
                        <span style="color: {$colorStore.muted};">Memberships:</span>
                        <span style="color: {$colorStore.text};">
                          {patreonCreator.relationships.memberships.data.length}
                        </span>
                      </div>
                    {/if}
                  </div>
                  
                  <!-- Action button -->
                  {#if patreonCreator.attributes?.url}
                    <a 
                      href={patreonCreator.attributes.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors w-full justify-center"
                      style="background: {$colorStore.primary}15; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                    >
                      <Heart class="w-3 h-3 md:w-4 md:h-4" />
                      View Patreon Profile
                    </a>
                  {/if}
                </div>
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

              <button
                class="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
                on:click={disconnectPatreon}
                disabled={isConnecting}
              >
                <Unlink class="w-4 h-4" />
                Re-login
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
                  <DiscordSelector
                    type="custom"
                    options={patreonTiers.map(tier => ({
                      id: tier.tierId,
                      name: `${tier.tierTitle} - ${formatCurrency(tier.amountCents)}`,
                      label: `${tier.tierTitle} - ${formatCurrency(tier.amountCents)}`
                    }))}
                    selected={selectedTierId}
                    placeholder="Select a tier..."
                    customIcon={Award}
                    on:change={(e) => selectedTierId = e.detail.selected}
                  />
                </div>
                <div>
                  <label for="discord-role" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">Discord
                    Role</label>
                  <DiscordSelector
                    type="role"
                    options={guildRoles}
                    selected={selectedRoleId}
                    placeholder="Select a role..."
                    on:change={(e) => selectedRoleId = e.detail.selected}
                  />
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
                    <DiscordSelector
                      type="channel"
                      options={guildChannels}
                      selected={configForm.channelId ? configForm.channelId.toString() : ""}
                      placeholder="Select a channel..."
                      on:change={(e) => configForm.channelId = e.detail.selected ? BigInt(e.detail.selected) : undefined}
                    />
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
</DashboardPageLayout>
