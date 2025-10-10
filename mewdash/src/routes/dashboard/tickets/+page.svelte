<script lang="ts">


  import { onDestroy, onMount } from "svelte";
  import {
    ticketApi,
    clientApi,
    type BlacklistedUserResponse,
    type GuildStatistics,
    type TicketCase,
    type TicketPanel,
    type TicketPriority,
    type TicketTag
  } from "$lib/api/index.ts";
    import type {PageData} from "./$types";
    import {currentGuild} from "$lib/stores/currentGuild.ts";
    import {fade} from "svelte/transition";
    import {goto} from "$app/navigation";
    import Notification from "$lib/components/ui/Notification.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import {browser} from "$app/environment";
    import {currentInstance} from "$lib/stores/instanceStore.ts";
    import {colorStore} from "$lib/stores/colorStore.ts";
    import {loadingStore} from "$lib/stores/loadingStore";
    import {logger} from "$lib/logger.ts";

    interface Props {
        data: PageData;
    }

    let {data}: Props = $props();

  // State
    let activeTab: "overview" | "panels" | "tickets" | "cases" | "settings" | string = $state("overview");
    let channels: Array<{ id: string; name: string }> = $state([]);
  let categories: Array<{ id: string; name: string }> = [];
  let roles: Array<{ id: string; name: string }> = [];
    let panels: TicketPanel[] = $state([]);
    let cases: TicketCase[] = $state([]);
    let stats: GuildStatistics | null = $state(null);
    let priorities: TicketPriority[] = $state([]);
    let tags: TicketTag[] = $state([]);
    let blacklistedUsers: Array<BlacklistedUserResponse> = $state([]);

    let loading = $state(true);
    let error: string | null = $state(null);
    let showNotification = $state(false);
    let notificationMessage = $state("");
    let notificationType: "success" | "error" = $state("success");
  let isMobile = false;

  // Modal states
    let showCreatePanel = $state(false);
    let showCreateCase = $state(false);

    let showPanelButtons: TicketPanel | null = $state(null);
    let showSettings = $state(false);

  // Form states
    let newPanelData = $state({
    channelId: "",
    title: "",
    description: "",
    embedTitle: "",
    embedDescription: "",
    color: "#5865F2"
    });

    let newCaseData = $state({
    title: "",
    description: "",
    priority: 1
    });

    let settingsData = $state({
    transcriptChannelId: "",
    logChannelId: ""
    });

    let colorVars = $derived($colorStore);

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  function showNotificationMessage(
    message: string,
    type: "success" | "error" = "success"
  ) {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function fetchData() {
    if (!$currentGuild?.id) return;

    return await loadingStore.wrap("fetch-ticket-data", async () => {
      try {
        loading = true;
        error = null;
        const guildId = BigInt($currentGuild.id);

      const [
        panelsResult,
        casesResult,
        statsResult,
        channelsResult,
        categoriesResult,
        rolesResult,
        prioritiesResult,
        tagsResult,
        blacklistResult
      ] = await Promise.allSettled([
        ticketApi.getTicketPanels(guildId),
        ticketApi.getTicketCases(guildId),
        ticketApi.getTicketStats(guildId),
        clientApi.getTextChannels(guildId),
        clientApi.getCategories(guildId),
        clientApi.getRoles(guildId),
        ticketApi.getTicketPriorities(guildId),
        ticketApi.getTicketTags(guildId),
        ticketApi.getTicketBlacklist(guildId)
      ]);

      if (panelsResult.status === "fulfilled") panels = panelsResult.value;
      if (casesResult.status === "fulfilled") cases = casesResult.value;
      if (statsResult.status === "fulfilled") stats = statsResult.value;
      if (channelsResult.status === "fulfilled") channels = channelsResult.value;
      if (categoriesResult.status === "fulfilled") categories = categoriesResult.value;
      if (rolesResult.status === "fulfilled") roles = rolesResult.value;
      if (prioritiesResult.status === "fulfilled") priorities = prioritiesResult.value;
      if (tagsResult.status === "fulfilled") tags = tagsResult.value;
      if (blacklistResult.status === "fulfilled") blacklistedUsers = blacklistResult.value;

      } catch (err) {
        logger.error("Failed to fetch ticket data:", err);
        error = err instanceof Error ? err.message : "Failed to fetch data";
      } finally {
        loading = false;
      }
    }, "api", "Loading ticket data...");
  }

  async function createPanel() {
    try {
      if (!$currentGuild?.id || !newPanelData.channelId) {
        throw new Error("Missing required fields");
      }

      // Convert hex color to decimal
      const colorValue = parseInt(newPanelData.color.replace("#", ""), 16);

      const requestData = {
        channelId: BigInt(newPanelData.channelId), // Keep as BigInt for precision
        title: newPanelData.title,
        description: newPanelData.description,
        embedJson: "",
        color: {
          rawValue: colorValue
        }
      };

      console.log("Sending panel data:", requestData);

      await ticketApi.createTicketPanel(BigInt($currentGuild.id), requestData);

      showNotificationMessage("Panel created successfully");
      showCreatePanel = false;
      newPanelData = {
        channelId: "",
        title: "",
        description: "",
        embedTitle: "",
        embedDescription: "",
        color: "#5865F2"
      };
      await fetchData();
    } catch (error) {
      console.error("Create panel error:", error);
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to create panel",
        "error"
      );
    }
  }

  async function deletePanel(panelId: bigint) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      await ticketApi.deleteTicketPanel(BigInt($currentGuild.id), panelId);
      showNotificationMessage("Panel deleted successfully");
      await fetchData();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to delete panel",
        "error"
      );
    }
  }

  async function duplicatePanel(panelId: bigint) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      console.log(`Would duplicate panel ${panelId} in guild ${$currentGuild.id}`);
      showNotificationMessage("Panel duplication feature coming soon");
      // await ticketApi.duplicateTicketPanel(BigInt($currentGuild.id), panelId);
      // await fetchData();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to duplicate panel",
        "error"
      );
    }
  }

  async function createCase() {
    try {
      if (!$currentGuild?.id || !newCaseData.title) {
        throw new Error("Missing required fields");
      }

      await ticketApi.createTicketCase(BigInt($currentGuild.id), {
        title: newCaseData.title,
        description: newCaseData.description,
        creatorId: BigInt(data.user?.id || "0") // Using the current user as creator
      });

      showNotificationMessage("Case created successfully");
      showCreateCase = false;
      newCaseData = {
        title: "",
        description: "",
        priority: 1
      };
      await fetchData();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to create case",
        "error"
      );
    }
  }

  async function closeCase(caseId: number) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      await ticketApi.closeTicketCase(BigInt($currentGuild.id), caseId);
      showNotificationMessage("Case closed successfully");
      await fetchData();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to close case",
        "error"
      );
    }
  }

  async function saveSettings() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      const guildId = BigInt($currentGuild.id);
      const promises = [];

      if (settingsData.transcriptChannelId) {
        promises.push(ticketApi.setTicketTranscriptChannel(guildId, BigInt(settingsData.transcriptChannelId)));
      }

      if (settingsData.logChannelId) {
        promises.push(ticketApi.setTicketLogChannel(guildId, BigInt(settingsData.logChannelId)));
      }

      await Promise.all(promises);
      showNotificationMessage("Settings saved successfully");
      showSettings = false;
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to save settings",
        "error"
      );
    }
  }

  function formatNumber(num: number | undefined): string {
    if (num === undefined || num === null) return "0";
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  }

  function getPriorityColor(level: number): string {
    switch (level) {
      case 4:
        return "#ef4444"; // Critical - Red
      case 3:
        return "#f97316"; // High - Orange
      case 2:
        return "#eab308"; // Medium - Yellow
      case 1:
        return "#22c55e"; // Low - Green
      default:
        return $colorStore.muted;
    }
  }

  function getPriorityLabel(level: number): string {
    switch (level) {
      case 4:
        return "Critical";
      case 3:
        return "High";
      case 2:
        return "Medium";
      case 1:
        return "Low";
      default:
        return "Unknown";
    }
  }

  $effect(() => {
        if ($currentGuild) {
            fetchData();
            // Extract colors from server icon if available, otherwise use bot avatar as fallback
            if ($currentGuild.icon) {
                const serverIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
                colorStore.extractFromServerIcon(serverIconUrl);
            } else if ($currentInstance?.botAvatar) {
                colorStore.extractFromImage($currentInstance.botAvatar);
            }
        }
    });

  // Tab configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: "fa-chart-column" },
    { id: "panels", label: "Panels", icon: "fa-message" },
    { id: "tickets", label: "Tickets", icon: "fa-ticket" },
    { id: "cases", label: "Cases", icon: "fa-file-lines" },
    { id: "settings", label: "Settings", icon: "fa-gear" }
  ];

  // Action buttons configuration
    let actionButtons = $derived([
    {
      label: "Refresh",
      icon: "fa-arrows-rotate",
      action: fetchData,
      loading: loading
    },
    {
      label: "New Panel",
      icon: "fa-plus",
      action: () => showCreatePanel = true,
      loading: false
    },
    {
      label: "New Case",
      icon: "fa-file-lines",
      action: () => showCreateCase = true,
      loading: false
    },
    {
      label: "Settings",
      icon: "fa-gear",
      action: () => showSettings = true,
      loading: false
    }
    ]);

  // Handle tab change
  function handleTabChange(event: CustomEvent) {
    activeTab = event.detail.tabId;
  }

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    await fetchData();
    checkMobile();
    if (browser) window.addEventListener("resize", checkMobile);
  });

  onDestroy(() => {
    if (browser) window.removeEventListener("resize", checkMobile);
  });
</script>

<DashboardPageLayout
  title="Tickets Management"
  subtitle="Manage support tickets and help desk"
  icon="fa-ticket"
  {tabs}
  {activeTab}
  {actionButtons}
  guildName={$currentGuild?.name || "Dashboard"}
  on:tabChange={handleTabChange}
>
    <!-- @migration-task: migrate this slot by hand, `status-messages` is an invalid identifier -->
  <svelte:fragment slot="status-messages">
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}
  </svelte:fragment>

  <div class="space-y-8">

    {#if loading}
      <div class="flex justify-center items-center min-h-[400px]">
        <div class="relative">
          <div
            class="w-16 h-16 border-4 rounded-full animate-spin"
            style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"
          ></div>
          <span class="mt-4 block text-center" style="color: {$colorStore.muted}">
            Loading ticket data...
          </span>
        </div>
      </div>
    {:else if error}
      <div
        class="p-6 rounded-xl"
        style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}40;"
        role="alert"
      >
        <div class="flex items-center gap-3">
          <i class="fa-utility-duo fa-regular fa-triangle-exclamation"
             style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.accent}; font-size: 24px;"></i>
          <div style="color: {$colorStore.accent}">
            <div class="font-semibold text-lg">Error Occurred</div>
            <div class="text-sm mt-1" style="color: {$colorStore.accent}90">{error}</div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Tab Content -->
      {#if activeTab === 'overview'}
        <div class="space-y-6" transition:fade={{ duration: 100 }}>
          <!-- Stats Cards -->
          {#if stats}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {#each [
                {
                  label: 'Total Tickets',
                  value: stats?.totalTickets ?? 0,
                  icon: 'fa-ticket',
                  color: $colorStore.primary
                },
                {
                  label: 'Open Tickets',
                  value: stats?.openTickets ?? 0,
                  icon: 'fa-message',
                  color: $colorStore.secondary
                },
                {
                  label: 'Closed Today',
                  value: stats?.closedTickets ?? 0,
                  icon: 'fa-check',
                  color: $colorStore.accent
                },
                { label: 'Active Staff', value: stats?.activeStaff ?? 0, icon: 'fa-users', color: '#10b981' }
              ] as stat (stat.label)}
                <div
                  class="p-6 rounded-xl  border"
                  style="background: linear-gradient(135deg, {stat.color}10, {stat.color}05);
                         border-color: {stat.color}30;"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium" style="color: {$colorStore.muted}">
                        {stat.label}
                      </p>
                      <p class="text-2xl font-bold mt-1" style="color: {$colorStore.text}">
                        {formatNumber(stat.value)}
                      </p>
                    </div>
                    <div
                      class="p-3 rounded-lg"
                      style="background: {stat.color}20"
                    >
                      <i class="fa-solid {stat.icon}" style="color: {stat.color}; font-size: 24px;"></i>
                    </div>
                  </div>
                </div>
              {/each}
            </div>

            <!-- Response Time & Categories -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                class="p-6 rounded-xl  border"
                style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                       border-color: {$colorStore.primary}30;"
              >
                <h3 class="font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                  <i class="fa-solid fa-clock" style="color: {$colorStore.primary}; font-size: 20px;"></i>
                  Average Response Time
                </h3>
                <div class="text-3xl font-bold" style="color: {$colorStore.primary}">
                  {stats?.avgResponseTime ?? 'N/A'}
                </div>
                <p class="text-sm mt-2" style="color: {$colorStore.muted}">
                  Across all open tickets
                </p>
              </div>

              <div
                class="p-6 rounded-xl  border"
                style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                       border-color: {$colorStore.primary}30;"
              >
                <h3 class="font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                  <i class="fa-solid fa-chart-column" style="color: {$colorStore.secondary}; font-size: 20px;"></i>
                  Top Categories
                </h3>
                <div class="space-y-3">
                  {#each (stats?.topCategories ?? []).slice(0, 3) as category (category.name)}
                    <div class="flex items-center justify-between">
                      <span class="text-sm" style="color: {$colorStore.text}">
                        {category.name}
                      </span>
                      <div class="flex items-center gap-2">
                        <div
                          class="h-2 rounded-full"
                          style="background: {$colorStore.secondary}30; width: 80px"
                        >
                          <div
                            class="h-2 rounded-full"
                            style="background: {$colorStore.secondary}; width: {(category.count / Math.max(...(stats?.topCategories ?? []).map(c => c.count))) * 100}%"
                          ></div>
                        </div>
                        <span class="text-sm font-medium" style="color: {$colorStore.text}">
                          {category.count}
                        </span>
                      </div>
                    </div>
                  {/each}
                  {#if !stats?.topCategories?.length}
                    <p class="text-sm" style="color: {$colorStore.muted}">
                      No data available
                    </p>
                  {/if}
                </div>
              </div>
            </div>
          {/if}
        </div>
      {:else if activeTab === 'panels'}
        <div class="space-y-6" transition:fade={{ duration: 100 }}>
          {#if !panels.length}
            <div
              class="text-center p-8  rounded-xl border"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;"
            >
              <i class="fa-utility-duo fa-regular fa-message"
                 style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 64px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
              <p class="text-lg font-medium" style="color: {$colorStore.text}">No Panels Configured</p>
              <p class="text-sm mt-2" style="color: {$colorStore.muted}">
                Create your first ticket panel to get started.
              </p>
            </div>
          {:else}
            <div class="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {#each panels as panel (panel.id)}
                <div
                  class=" rounded-xl border shadow-lg overflow-hidden"
                  style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                         border-color: {$colorStore.primary}30;"
                  transition:fade={{ duration: 100 }}
                >
                  <div
                    class="p-4 border-b"
                    style="background: linear-gradient(to bottom, {panel.color}20, {panel.color}10);
                           border-color: {$colorStore.primary}30;"
                  >
                    <div class="flex justify-between items-start gap-4">
                      <div class="flex-1">
                        <h3 class="font-medium text-lg" style="color: {$colorStore.text}">
                          {panel.title || `Panel #${panel.id}`}
                        </h3>
                        <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                          #{panel.channelId}
                        </p>
                      </div>
                      <div class="flex gap-2">
                        <button aria-label="Delete"
                          class="p-2 rounded-lg transition-all duration-75"
                          style="background: {$colorStore.primary}10; color: {$colorStore.muted}"
                          onclick={() => showPanelButtons = panel}
                        >
                          <i class="fa-solid fa-gear" style="font-size: 16px;"></i>
                        </button>
                        <button aria-label="Edit"
                          class="p-2 rounded-lg transition-all duration-75"
                          style="background: {$colorStore.secondary}10; color: {$colorStore.muted}"
                          onclick={() => duplicatePanel(panel.id)}
                        >
                          <i class="fa-solid fa-copy" style="font-size: 16px;"></i>
                        </button>
                        <button aria-label="View"
                          class="p-2 rounded-lg transition-all duration-75 hover:bg-red-500/10"
                          style="color: {$colorStore.muted}"
                          onclick={() => deletePanel(panel.id)}
                        >
                          <i class="fa-solid fa-trash" style="font-size: 16px;"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="p-4 space-y-4">
                    <div>
                      <h4 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">
                        Description
                      </h4>
                      <p class="text-sm" style="color: {$colorStore.muted}">
                        {panel.description || "No description"}
                      </p>
                    </div>

                    <div class="flex flex-wrap gap-4 pt-4 border-t" style="border-color: {$colorStore.primary}20">
                      <div class="flex items-center gap-2">
                        <i class="fa-solid fa-robot" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                        <span class="text-sm" style="color: {$colorStore.text}">
                          {panel.buttonCount} buttons
                        </span>
                      </div>
                      <div class="flex items-center gap-2">
                        <i class="fa-solid fa-message" style="color: {$colorStore.secondary}; font-size: 16px;"></i>
                        <span class="text-sm" style="color: {$colorStore.text}">
                          {panel.selectMenuCount} menus
                        </span>
                      </div>
                      <div class="flex items-center gap-2">
                        {#if panel.isActive}
                          <div class="w-2 h-2 rounded-full bg-green-500"></div>
                          <span class="text-sm text-green-400">Active</span>
                        {:else}
                          <div class="w-2 h-2 rounded-full bg-red-500"></div>
                          <span class="text-sm text-red-400">Inactive</span>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {:else if activeTab === 'cases'}
        <div class="space-y-6" transition:fade={{ duration: 100 }}>
          {#if !cases.length}
            <div
              class="text-center p-8  rounded-xl border"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;"
            >
              <i class="fa-utility-duo fa-regular fa-file-lines"
                 style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 64px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
              <p class="text-lg font-medium" style="color: {$colorStore.text}">No Cases Found</p>
              <p class="text-sm mt-2" style="color: {$colorStore.muted}">
                Create your first case to track related tickets.
              </p>
            </div>
          {:else}
            <div class="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {#each cases as ticketCase (ticketCase.id)}
                <div
                  class=" rounded-xl border shadow-lg overflow-hidden"
                  style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                         border-color: {$colorStore.primary}30;"
                  transition:fade={{ duration: 100 }}
                >
                  <div class="p-6">
                    <div class="flex justify-between items-start gap-4 mb-4">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                          <h3 class="font-medium text-lg" style="color: {$colorStore.text}">
                            {ticketCase.title}
                          </h3>
                          <span
                                  class="px-2 py-1 rounded-sm text-xs font-medium"
                            style="background: {getPriorityColor(ticketCase.priority)}20;
                                   color: {getPriorityColor(ticketCase.priority)}"
                          >
                            {getPriorityLabel(ticketCase.priority)}
                          </span>
                        </div>
                        <p class="text-sm" style="color: {$colorStore.muted}">
                          {ticketCase.description || "No description"}
                        </p>
                      </div>
                      {#if ticketCase.isOpen}
                        <button
                          class="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-75"
                          style="background: {$colorStore.accent}; color: {$colorStore.text}"
                          onclick={() => closeCase(ticketCase.id)}
                        >
                          Close Case
                        </button>
                      {:else}
                        <span
                          class="px-3 py-1 rounded-lg text-sm font-medium"
                          style="background: {$colorStore.muted}20; color: {$colorStore.muted}"
                        >
                          Closed
                        </span>
                      {/if}
                    </div>

                    <div class="flex flex-wrap gap-4 pt-4 border-t" style="border-color: {$colorStore.primary}20">
                      <div class="flex items-center gap-2">
                        <i class="fa-solid fa-ticket" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                        <span class="text-sm" style="color: {$colorStore.text}">
                          {ticketCase.ticketCount} tickets
                        </span>
                      </div>
                      <div class="flex items-center gap-2">
                        <i class="fa-solid fa-calendar" style="color: {$colorStore.secondary}; font-size: 16px;"></i>
                        <span class="text-sm" style="color: {$colorStore.text}">
                          {new Date(ticketCase.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {:else if activeTab === 'settings'}
        <div class="space-y-6" transition:fade={{ duration: 100 }}>
          <div class="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <!-- Priorities -->
            <div
              class="p-6  rounded-xl border"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;"
            >
              <h3 class="font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-solid fa-flag" style="color: {$colorStore.primary}; font-size: 20px;"></i>
                Priorities
              </h3>
              <div class="space-y-3">
                {#each priorities as priority (priority.level)}
                  <div class="flex items-center justify-between p-3 rounded-lg"
                       style="background: {$colorStore.primary}10">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-3 h-3 rounded-full"
                        style="background: {priority.color}"
                      ></div>
                      <span style="color: {$colorStore.text}">{priority.name}</span>
                    </div>
                    <span class="text-sm" style="color: {$colorStore.muted}">
                      Level {priority.level}
                    </span>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Tags -->
            <div
              class="p-6  rounded-xl border"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;"
            >
              <h3 class="font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-solid fa-tag" style="color: {$colorStore.secondary}; font-size: 20px;"></i>
                Tags
              </h3>
              <div class="space-y-3">
                {#each tags as tag (tag.name)}
                  <div class="flex items-center justify-between p-3 rounded-lg"
                       style="background: {$colorStore.primary}10">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-3 h-3 rounded-full"
                        style="background: {tag.color}"
                      ></div>
                      <span style="color: {$colorStore.text}">{tag.name}</span>
                    </div>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Blacklisted Users -->
            <div
              class="p-6  rounded-xl border lg:col-span-2"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;"
            >
              <h3 class="font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-solid fa-shield" style="color: {$colorStore.accent}; font-size: 20px;"></i>
                Blacklisted Users
              </h3>
              {#if blacklistedUsers.length}
                <div class="grid gap-3 grid-cols-1 md:grid-cols-2">
                  {#each blacklistedUsers as user (user.userId || user.username)}
                    <div class="flex items-center justify-between p-3 rounded-lg"
                         style="background: {$colorStore.accent}10">
                      <div>
                        <span style="color: {$colorStore.text}">{user.username}</span>
                        <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                          {user.reason}
                        </p>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="text-sm" style="color: {$colorStore.muted}">
                  No blacklisted users
                </p>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</DashboardPageLayout>

<!-- Create Panel Modal -->
{#if showCreatePanel}
  <div class="fixed inset-0 bg-black opacity-50 flex items-center justify-center p-4 z-50"
       transition:fade={{ duration: 150 }}>
    <div
      class="bg-gray-800 rounded-xl p-6 w-full max-w-md"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}25)"
    >
      <h3 class="text-xl font-semibold mb-4" style="color: {$colorStore.text}">
        Create New Panel
      </h3>

      <div class="space-y-4">
        <div>
          <label for="panel-channel" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Channel
          </label>
          <DiscordSelector
            type="channel"
            options={channels}
            placeholder="Select a channel"
            bind:selectedId={newPanelData.channelId}
          />
        </div>

        <div>
          <label for="panel-title" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Panel Title
          </label>
          <input
            id="panel-title"
            type="text"
            bind:value={newPanelData.title}
            class="w-full p-3 rounded-lg border"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
            placeholder="Support Tickets"
          >
        </div>

        <div>
          <label for="panel-description" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Description
          </label>
          <textarea
            id="panel-description"
            bind:value={newPanelData.description}
            class="w-full p-3 rounded-lg border resize-none"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
            rows="3"
            placeholder="Click a button below to create a ticket..."
          ></textarea>
        </div>

        <div>
          <label for="panel-color" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Color
          </label>
          <input
            id="panel-color"
            type="color"
            bind:value={newPanelData.color}
            class="w-full h-12 rounded-lg border"
            style="border-color: {$colorStore.primary}30"
          >
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          class="flex-1 py-3 rounded-lg font-medium"
          style="background: {$colorStore.primary}; color: {$colorStore.text}"
          onclick={createPanel}
        >
          Create Panel
        </button>
        <button
          class="flex-1 py-3 rounded-lg font-medium"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}"
          onclick={() => showCreatePanel = false}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Create Case Modal -->
{#if showCreateCase}
  <div class="fixed inset-0 bg-black opacity-50 flex items-center justify-center p-4 z-50"
       transition:fade={{ duration: 150 }}>
    <div
      class="bg-gray-800 rounded-xl p-6 w-full max-w-md"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}25)"
    >
      <h3 class="text-xl font-semibold mb-4" style="color: {$colorStore.text}">
        Create New Case
      </h3>

      <div class="space-y-4">
        <div>
          <label for="case-title" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Case Title
          </label>
          <input
            id="case-title"
            type="text"
            bind:value={newCaseData.title}
            class="w-full p-3 rounded-lg border"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
            placeholder="Bug Report: Login Issues"
          >
        </div>

        <div>
          <label for="case-description" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Description
          </label>
          <textarea
            id="case-description"
            bind:value={newCaseData.description}
            class="w-full p-3 rounded-lg border resize-none"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
            rows="3"
            placeholder="Describe the case..."
          ></textarea>
        </div>

        <div>
          <label for="case-priority" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Priority
          </label>
          <DiscordSelector
            type="custom"
            options={[
              { id: "1", name: "Low" },
              { id: "2", name: "Medium" },
              { id: "3", name: "High" },
              { id: "4", name: "Critical" }
            ]}
            customIcon="fa-flag"
            placeholder="Select priority"
            selectedId={newCaseData.priority.toString()}
            on:change={(e) => {
              newCaseData.priority = parseInt(e.detail.selected);
            }}
          />
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          class="flex-1 py-3 rounded-lg font-medium"
          style="background: {$colorStore.secondary}; color: {$colorStore.text}"
          onclick={createCase}
        >
          Create Case
        </button>
        <button
          class="flex-1 py-3 rounded-lg font-medium"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}"
          onclick={() => showCreateCase = false}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Settings Modal -->
{#if showSettings}
  <div class="fixed inset-0 bg-black opacity-50 flex items-center justify-center p-4 z-50"
       transition:fade={{ duration: 150 }}>
    <div
      class="bg-gray-800 rounded-xl p-6 w-full max-w-md"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}25)"
    >
      <h3 class="text-xl font-semibold mb-4" style="color: {$colorStore.text}">
        Ticket Settings
      </h3>

      <div class="space-y-4">
        <div>
          <label for="transcript-channel" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Transcript Channel
          </label>
          <DiscordSelector
            type="channel"
            options={channels}
            placeholder="None"
            bind:selectedId={settingsData.transcriptChannelId}
          />
        </div>

        <div>
          <label for="log-channel" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Log Channel
          </label>
          <DiscordSelector
            type="channel"
            options={channels}
            placeholder="None"
            bind:selectedId={settingsData.logChannelId}
          />
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          class="flex-1 py-3 rounded-lg font-medium"
          style="background: {$colorStore.accent}; color: {$colorStore.text}"
          onclick={saveSettings}
        >
          Save Settings
        </button>
        <button
          class="flex-1 py-3 rounded-lg font-medium"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}"
          onclick={() => showSettings = false}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<style lang="postcss">
    @reference '../../../app.css';

    input, input:focus, textarea:focus {
        -webkit-tap-highlight-color: transparent;
    }

    [style*="background"],
    [style*="color"] {
        @apply transition-colors duration-75;
    }
</style>