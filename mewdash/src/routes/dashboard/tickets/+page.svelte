<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade } from "svelte/transition";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/Notification.svelte";
  import { browser } from "$app/environment";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import type { Priority, TicketCase, TicketPanel, TicketStats, TicketTag } from "$lib/types.ts";
  import {
    AlertTriangle,
    BarChart3,
    Bot,
    Calendar,
    Check,
    Clock,
    Copy,
    FileText,
    Flag,
    MessageCircle,
    Plus,
    Settings,
    Shield,
    Tag,
    Ticket,
    Trash2,
    Users
  } from "lucide-svelte";
  import { logger } from "$lib/logger.ts";

  export let data: PageData;

  // State
  let activeTab: "overview" | "panels" | "tickets" | "cases" | "settings" = "overview";
  let channels: Array<{ id: string; name: string }> = [];
  let categories: Array<{ id: string; name: string }> = [];
  let roles: Array<{ id: string; name: string }> = [];
  let panels: TicketPanel[] = [];
  let cases: TicketCase[] = [];
  let stats: TicketStats | null = null;
  let priorities: Priority[] = [];
  let tags: TicketTag[] = [];
  let blacklistedUsers: Array<{ id: string; username: string; reason: string }> = [];

  let loading = true;
  let error: string | null = null;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let isMobile = false;

  // Modal states
  let showCreatePanel = false;
  let showCreateCase = false;
  let showEditPanel: TicketPanel | null = null;
  let showPanelButtons: TicketPanel | null = null;
  let showSettings = false;

  // Form states
  let newPanelData = {
    channelId: "",
    title: "",
    description: "",
    embedTitle: "",
    embedDescription: "",
    color: "#5865F2"
  };

  let newCaseData = {
    title: "",
    description: "",
    priority: 1
  };

  let settingsData = {
    transcriptChannelId: "",
    logChannelId: ""
  };

  $: colorVars = $colorStore;

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
        // Note: These API methods need to be implemented in api.ts
        Promise.resolve([]), // api.getTicketPanels(guildId),
        Promise.resolve([]), // api.getTicketCases(guildId),
        Promise.resolve(null), // api.getTicketStats(guildId),
        api.getGuildTextChannels(guildId),
        api.getGuildCategories(guildId),
        api.getGuildRoles(guildId),
        Promise.resolve([]), // api.getTicketPriorities(guildId),
        Promise.resolve([]), // api.getTicketTags(guildId),
        Promise.resolve([]) // api.getTicketBlacklist(guildId)
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

      // Note: createTicketPanel API method needs to be implemented in api.ts
      console.log("Would create panel with data:", requestData);
      // await api.createTicketPanel(BigInt($currentGuild.id), requestData);

      showNotificationMessage("Panel creation feature coming soon");
      showCreatePanel = false;
      newPanelData = {
        channelId: "",
        title: "",
        description: "",
        embedTitle: "",
        embedDescription: "",
        color: "#5865F2"
      };
      // await fetchData();
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
      // Note: deleteTicketPanel API method needs to be implemented in api.ts
      console.log(`Would delete panel ${panelId} in guild ${$currentGuild.id}`);
      // await api.deleteTicketPanel(BigInt($currentGuild.id), panelId);
      showNotificationMessage("Panel deletion feature coming soon");
      // await fetchData();
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
      // Note: duplicateTicketPanel API method needs to be implemented in api.ts
      console.log(`Would duplicate panel ${panelId} in guild ${$currentGuild.id}`);
      showNotificationMessage("Panel duplication feature coming soon");
      // await api.duplicateTicketPanel(BigInt($currentGuild.id), panelId);
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

      // Note: createTicketCase API method needs to be implemented in api.ts
      console.log("Would create case with data:", {
        title: newCaseData.title,
        description: newCaseData.description,
        priority: newCaseData.priority
      });
      // await api.createTicketCase(BigInt($currentGuild.id), {
      //   title: newCaseData.title,
      //   description: newCaseData.description,
      //   priority: newCaseData.priority
      // });

      showNotificationMessage("Case creation feature coming soon");
      showCreateCase = false;
      newCaseData = {
        title: "",
        description: "",
        priority: 1
      };
      // await fetchData();
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
      // Note: closeTicketCase API method needs to be implemented in api.ts
      console.log(`Would close case ${caseId} in guild ${$currentGuild.id}`);
      showNotificationMessage("Case closing feature coming soon");
      // await api.closeTicketCase(BigInt($currentGuild.id), caseId);
      // await fetchData();
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
        // Note: setTicketTranscriptChannel API method needs to be implemented in api.ts
        console.log(`Would set transcript channel ${settingsData.transcriptChannelId} for guild ${guildId}`);
        // promises.push(api.setTicketTranscriptChannel(guildId, BigInt(settingsData.transcriptChannelId)));
      }

      if (settingsData.logChannelId) {
        // Note: setTicketLogChannel API method needs to be implemented in api.ts
        console.log(`Would set log channel ${settingsData.logChannelId} for guild ${guildId}`);
        // promises.push(api.setTicketLogChannel(guildId, BigInt(settingsData.logChannelId)));
      }

      await Promise.all(promises);
      showNotificationMessage("Settings feature coming soon");
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

  $: if ($currentGuild) {
    fetchData();
    // Extract colors from server icon if available, otherwise use bot avatar as fallback
    if ($currentGuild.icon) {
      const serverIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
      colorStore.extractFromServerIcon(serverIconUrl);
    } else if ($currentInstance?.botAvatar) {
      colorStore.extractFromImage($currentInstance.botAvatar);
    }
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

<div
  class="min-h-screen p-4 md:p-6"
  style="{colorVars} background: radial-gradient(circle at top,
    {$colorStore.gradientStart}15 0%,
    {$colorStore.gradientMid}10 50%,
    {$colorStore.gradientEnd}05 100%);"
>
  <div class="max-w-7xl mx-auto space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-3xl font-bold" style="color: {$colorStore.text}">
        Tickets Management
      </h1>

      <div class="flex flex-wrap gap-2">
        <button
          class="px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-75"
          on:click={() => showCreatePanel = true}
          style="background: {$colorStore.primary}; color: {$colorStore.text}"
        >
          <Plus class="h-4 w-4" />
          New Panel
        </button>
        <button
          class="px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-75"
          on:click={() => showCreateCase = true}
          style="background: {$colorStore.secondary}; color: {$colorStore.text}"
        >
          <FileText class="h-4 w-4" />
          New Case
        </button>
        <button
          class="px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-75"
          on:click={() => showSettings = true}
          style="background: {$colorStore.accent}20; color: {$colorStore.text}"
        >
          <Settings class="h-4 w-4" />
          Settings
        </button>
      </div>
    </div>

    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade={{ duration: 150 }}>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}

    <!-- Tab Navigation -->
    <div class="flex overflow-x-auto border-b" style="border-color: {$colorStore.primary}30">
      {#each [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'panels', label: 'Panels', icon: MessageCircle },
        { id: 'tickets', label: 'Active Tickets', icon: Ticket },
        { id: 'cases', label: 'Cases', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings }
      ] as tab}
        <button
          class="flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-all duration-75"
          class:border-b-2={activeTab === tab.id}
          style="color: {activeTab === tab.id ? $colorStore.primary : $colorStore.muted}; border-color: {activeTab === tab.id ? $colorStore.primary : 'transparent'}"
          on:click={() => activeTab = tab.id}
        >
          <svelte:component this={tab.icon} class="h-4 w-4" />
          {tab.label}
        </button>
      {/each}
    </div>

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
          <AlertTriangle class="w-6 h-6" style="color: {$colorStore.accent}" />
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
                { label: 'Total Tickets', value: stats?.totalTickets ?? 0, icon: Ticket, color: $colorStore.primary },
                {
                  label: 'Open Tickets',
                  value: stats?.openTickets ?? 0,
                  icon: MessageCircle,
                  color: $colorStore.secondary
                },
                { label: 'Closed Today', value: stats?.closedTickets ?? 0, icon: Check, color: $colorStore.accent },
                { label: 'Active Staff', value: stats?.activeStaff ?? 0, icon: Users, color: '#10b981' }
              ] as stat}
                <div
                  class="p-6 rounded-xl backdrop-blur-sm border"
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
                      <svelte:component this={stat.icon} class="h-6 w-6" style="color: {stat.color}" />
                    </div>
                  </div>
                </div>
              {/each}
            </div>

            <!-- Response Time & Categories -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                class="p-6 rounded-xl backdrop-blur-sm border"
                style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                       border-color: {$colorStore.primary}30;"
              >
                <h3 class="font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                  <Clock class="h-5 w-5" style="color: {$colorStore.primary}" />
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
                class="p-6 rounded-xl backdrop-blur-sm border"
                style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                       border-color: {$colorStore.primary}30;"
              >
                <h3 class="font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                  <BarChart3 class="h-5 w-5" style="color: {$colorStore.secondary}" />
                  Top Categories
                </h3>
                <div class="space-y-3">
                  {#each (stats?.topCategories ?? []).slice(0, 3) as category}
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
              class="text-center p-8 backdrop-blur-sm rounded-xl border"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;"
            >
              <MessageCircle class="h-16 w-16 mx-auto mb-4" style="color: {$colorStore.muted}" />
              <p class="text-lg font-medium" style="color: {$colorStore.text}">No Panels Configured</p>
              <p class="text-sm mt-2" style="color: {$colorStore.muted}">
                Create your first ticket panel to get started.
              </p>
            </div>
          {:else}
            <div class="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {#each panels as panel (panel.id)}
                <div
                  class="backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden"
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
                        <button
                          class="p-2 rounded-lg transition-all duration-75"
                          style="background: {$colorStore.primary}10; color: {$colorStore.muted}"
                          on:click={() => showPanelButtons = panel}
                        >
                          <Settings class="w-4 h-4" />
                        </button>
                        <button
                          class="p-2 rounded-lg transition-all duration-75"
                          style="background: {$colorStore.secondary}10; color: {$colorStore.muted}"
                          on:click={() => duplicatePanel(panel.id)}
                        >
                          <Copy class="w-4 h-4" />
                        </button>
                        <button
                          class="p-2 rounded-lg transition-all duration-75 hover:bg-red-500/10"
                          style="color: {$colorStore.muted}"
                          on:click={() => deletePanel(panel.id)}
                        >
                          <Trash2 class="w-4 h-4" />
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
                        <Bot class="w-4 h-4" style="color: {$colorStore.primary}" />
                        <span class="text-sm" style="color: {$colorStore.text}">
                          {panel.buttonCount} buttons
                        </span>
                      </div>
                      <div class="flex items-center gap-2">
                        <MessageCircle class="w-4 h-4" style="color: {$colorStore.secondary}" />
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
              class="text-center p-8 backdrop-blur-sm rounded-xl border"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;"
            >
              <FileText class="h-16 w-16 mx-auto mb-4" style="color: {$colorStore.muted}" />
              <p class="text-lg font-medium" style="color: {$colorStore.text}">No Cases Found</p>
              <p class="text-sm mt-2" style="color: {$colorStore.muted}">
                Create your first case to track related tickets.
              </p>
            </div>
          {:else}
            <div class="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {#each cases as ticketCase (ticketCase.id)}
                <div
                  class="backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden"
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
                            class="px-2 py-1 rounded text-xs font-medium"
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
                          on:click={() => closeCase(ticketCase.id)}
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
                        <Ticket class="w-4 h-4" style="color: {$colorStore.primary}" />
                        <span class="text-sm" style="color: {$colorStore.text}">
                          {ticketCase.ticketCount} tickets
                        </span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Calendar class="w-4 h-4" style="color: {$colorStore.secondary}" />
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
              class="p-6 backdrop-blur-sm rounded-xl border"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;"
            >
              <h3 class="font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                <Flag class="h-5 w-5" style="color: {$colorStore.primary}" />
                Priorities
              </h3>
              <div class="space-y-3">
                {#each priorities as priority}
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
              class="p-6 backdrop-blur-sm rounded-xl border"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;"
            >
              <h3 class="font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                <Tag class="h-5 w-5" style="color: {$colorStore.secondary}" />
                Tags
              </h3>
              <div class="space-y-3">
                {#each tags as tag}
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
              class="p-6 backdrop-blur-sm rounded-xl border lg:col-span-2"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;"
            >
              <h3 class="font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                <Shield class="h-5 w-5" style="color: {$colorStore.accent}" />
                Blacklisted Users
              </h3>
              {#if blacklistedUsers.length}
                <div class="grid gap-3 grid-cols-1 md:grid-cols-2">
                  {#each blacklistedUsers as user}
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
</div>

<!-- Create Panel Modal -->
{#if showCreatePanel}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
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
          <select
            id="panel-channel"
            bind:value={newPanelData.channelId}
            class="w-full p-3 rounded-lg border"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
          >
            <option value="">Select a channel</option>
            {#each channels as channel}
              <option value={channel.id}>{channel.name}</option>
            {/each}
          </select>
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
          />
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
          />
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          class="flex-1 py-3 rounded-lg font-medium"
          style="background: {$colorStore.primary}; color: {$colorStore.text}"
          on:click={createPanel}
        >
          Create Panel
        </button>
        <button
          class="flex-1 py-3 rounded-lg font-medium"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}"
          on:click={() => showCreatePanel = false}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Create Case Modal -->
{#if showCreateCase}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
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
          />
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
          <select
            id="case-priority"
            bind:value={newCaseData.priority}
            class="w-full p-3 rounded-lg border"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
          >
            <option value={1}>Low</option>
            <option value={2}>Medium</option>
            <option value={3}>High</option>
            <option value={4}>Critical</option>
          </select>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          class="flex-1 py-3 rounded-lg font-medium"
          style="background: {$colorStore.secondary}; color: {$colorStore.text}"
          on:click={createCase}
        >
          Create Case
        </button>
        <button
          class="flex-1 py-3 rounded-lg font-medium"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}"
          on:click={() => showCreateCase = false}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Settings Modal -->
{#if showSettings}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
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
          <select
            id="transcript-channel"
            bind:value={settingsData.transcriptChannelId}
            class="w-full p-3 rounded-lg border"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
          >
            <option value="">None</option>
            {#each channels as channel}
              <option value={channel.id}>{channel.name}</option>
            {/each}
          </select>
        </div>

        <div>
          <label for="log-channel" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Log Channel
          </label>
          <select
            id="log-channel"
            bind:value={settingsData.logChannelId}
            class="w-full p-3 rounded-lg border"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
          >
            <option value="">None</option>
            {#each channels as channel}
              <option value={channel.id}>{channel.name}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          class="flex-1 py-3 rounded-lg font-medium"
          style="background: {$colorStore.accent}; color: {$colorStore.text}"
          on:click={saveSettings}
        >
          Save Settings
        </button>
        <button
          class="flex-1 py-3 rounded-lg font-medium"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}"
          on:click={() => showSettings = false}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<style lang="postcss">
    :global(body) {
        background-color: #1a202c;
        color: #ffffff;
    }

    select, input, textarea {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
    }

    select:focus, input:focus, textarea:focus {
        -webkit-tap-highlight-color: transparent;
    }

    option {
        background-color: #374151;
        color: white;
        padding: 0.5rem;
    }

    [style*="background"],
    [style*="color"] {
        @apply transition-colors duration-75;
    }

    @media (max-width: 640px) {
        :global(.card-grid) {
            @apply gap-4;
        }

        :global(.card) {
            @apply p-4;
        }
    }

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