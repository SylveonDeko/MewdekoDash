<!-- routes/dashboard/invites/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade } from "svelte/transition";
  import type { BotStatusModel } from "$lib/types/models.ts";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { AlertCircle, Award, Clock, FileSpreadsheet, Settings, User, UserPlus, Users } from "lucide-svelte";
  import { browser } from "$app/environment";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import { loadingStore } from "$lib/stores/loadingStore";
  import type { PageData } from "./$types";

  export let data: PageData;

  // State management
  let botStatus: BotStatusModel | null = null;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let activeTab = "settings";
  let isMobile = false;
  
  // Layout configuration
  const tabs = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "stats", label: "Statistics", icon: FileSpreadsheet },
    { id: "leaderboard", label: "Leaderboard", icon: Award },
    { id: "inviter", label: "Find Inviter", icon: User },
    { id: "invited", label: "Invited Users", icon: UserPlus }
  ];

  // Invite Settings
  let inviteSettings = {
    isEnabled: true,
    removeInviteOnLeave: false,
    minAccountAge: "00:00:00" // TimeSpan format
  };

  // Invite Leaderboard
  let leaderboard: Array<{
    userId: string;
    username: string;
    inviteCount: number;
  }> = [];
  let leaderboardPage = 1;
  let leaderboardPageSize = 10;

  // User selection for viewing inviter/invited
  let selectedUserId = "";
  let guildMembers: Array<{
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  }> = [];

  // Inviter lookup
  let inviterInfo: {
    id: string;
    username: string;
    discriminator: string;
    avatarUrl: string;
  } | null = null;
  let inviterLoading = false;
  let inviterError: string | null = null;

  // Invited users list
  let invitedUsers: Array<{
    id: string;
    username: string;
    discriminator: string;
    avatarUrl: string;
  }> = [];
  let invitedLoading = false;
  let invitedError: string | null = null;

  // Stats
  let userStats = {
    totalInvites: 0,
    avgInvitesPerUser: 0,
    topInviter: {
      username: "",
      inviteCount: 0
    }
  };

  // Management
  let changedSettings = new Set<string>();
  let loading = {
    settings: true,
    leaderboard: true,
    members: true,
    stats: true
  };
  let error = {
    settings: null as string | null,
    leaderboard: null as string | null,
    members: null as string | null,
    stats: null as string | null
  };

  // Min account age inputs
  let minAgeDays = 0;
  let minAgeHours = 0;
  let minAgeMinutes = 0;

  // Fetch bot status
  async function fetchBotStatus() {
    try {
      botStatus = await api.getBotStatus();
    } catch (err) {
      logger.error("Failed to fetch bot status:", err);
    }
  }

  $: if ($currentInstance) {
    Promise.all([
      fetchInviteSettings(),
      fetchLeaderboard(),
      fetchGuildMembers(),
      calculateStats(),
      fetchBotStatus()
    ]);
  }

  function markAsChanged(setting: string) {
    changedSettings = changedSettings.add(setting);
  }

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function fetchInviteSettings() {
    return await loadingStore.wrap("fetch-invite-settings", async () => {
      try {
        loading.settings = true;
        error.settings = null;
        if (!$currentGuild?.id) {
          throw new Error("No guild selected");
        }

        inviteSettings = await api.getInviteSettings($currentGuild.id);

      // Parse the TimeSpan format for min account age
      const timeSpanRegex = /^(\d+)\:(\d+)\:(\d+)(?:\.(\d+))?$/;
      const match = inviteSettings.minAccountAge.match(timeSpanRegex);

      if (match) {
        minAgeDays = Math.floor(parseInt(match[1]) / 24); // Convert hours to days
        minAgeHours = parseInt(match[1]) % 24;
        minAgeMinutes = parseInt(match[2]);
      }
      } catch (err) {
        logger.error("Failed to fetch invite settings:", err);
        error.settings = err instanceof Error ? err.message : "Failed to fetch invite settings";
      } finally {
        loading.settings = false;
      }
    }, "api", "Loading invite settings...");
  }

  async function fetchLeaderboard() {
    return await loadingStore.wrap("fetch-leaderboard", async () => {
      try {
        loading.leaderboard = true;
        error.leaderboard = null;
        if (!$currentGuild?.id) {
          throw new Error("No guild selected");
        }

        leaderboard = await api.getInviteLeaderboard($currentGuild.id, leaderboardPage, leaderboardPageSize);
      } catch (err) {
        logger.error("Failed to fetch invite leaderboard:", err);
        error.leaderboard = err instanceof Error ? err.message : "Failed to fetch invite leaderboard";
      } finally {
        loading.leaderboard = false;
      }
    }, "api", "Loading leaderboard...");
  }

  async function fetchGuildMembers() {
    try {
      loading.members = true;
      error.members = null;
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      guildMembers = await api.getGuildMembers($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch guild members:", err);
      error.members = err instanceof Error ? err.message : "Failed to fetch guild members";
    } finally {
      loading.members = false;
    }
  }

  async function lookupInviter() {
    if (!selectedUserId || !$currentGuild?.id) return;

    try {
      inviterLoading = true;
      inviterError = null;
      inviterInfo = null;

      inviterInfo = await api.getInviter($currentGuild.id, BigInt(selectedUserId));
    } catch (err) {
      logger.error("Failed to find inviter:", err);
      inviterError = "No inviter found for this user";
      inviterInfo = null;
    } finally {
      inviterLoading = false;
    }
  }

  async function lookupInvitedUsers() {
    if (!selectedUserId || !$currentGuild?.id) return;

    try {
      invitedLoading = true;
      invitedError = null;
      invitedUsers = [];

      invitedUsers = await api.getInvitedUsers($currentGuild.id, BigInt(selectedUserId));
    } catch (err) {
      logger.error("Failed to find invited users:", err);
      invitedError = "No users found invited by this user";
      invitedUsers = [];
    } finally {
      invitedLoading = false;
    }
  }

  async function calculateStats() {
    try {
      loading.stats = true;
      error.stats = null;
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      // Get leaderboard for stats calculation
      const fullLeaderboard = await api.getInviteLeaderboard($currentGuild.id, 1, 100);

      // Calculate statistics
      const totalInvites = fullLeaderboard.reduce((sum, user) => sum + user.inviteCount, 0);
      const topInviter = fullLeaderboard.length > 0 ?
        fullLeaderboard.reduce((max, user) => max.inviteCount > user.inviteCount ? max : user) :
        { username: "None", inviteCount: 0 };

      userStats = {
        totalInvites,
        avgInvitesPerUser: fullLeaderboard.length > 0 ? totalInvites / fullLeaderboard.length : 0,
        topInviter: {
          username: topInviter.username,
          inviteCount: topInviter.inviteCount
        }
      };
    } catch (err) {
      logger.error("Failed to calculate stats:", err);
      error.stats = err instanceof Error ? err.message : "Failed to calculate statistics";
    } finally {
      loading.stats = false;
    }
  }

  async function updateInviteSettings() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      // Update enabled state
      await api.toggleInviteTracking($currentGuild.id, inviteSettings.isEnabled);

      // Update remove on leave setting
      await api.setRemoveOnLeave($currentGuild.id, inviteSettings.removeInviteOnLeave);

      // Calculate TimeSpan for minimum account age
      const totalHours = (minAgeDays * 24) + minAgeHours;
      const minAgeTimeSpan = `${totalHours.toString().padStart(2, "0")}:${minAgeMinutes.toString().padStart(2, "0")}:00`;

      // Update minimum account age
      await api.setMinAccountAge($currentGuild.id, minAgeTimeSpan);

      showNotificationMessage("Invite settings updated successfully", "success");
      changedSettings.clear();
      await fetchInviteSettings();
    } catch (err) {
      logger.error("Failed to update invite settings:", err);
      showNotificationMessage("Failed to update invite settings", "error");
    }
  }

  function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }

  function goToPage(page: number) {
    if (page < 1) return;
    leaderboardPage = page;
    fetchLeaderboard();
  }

  onMount(async () => {
    // Add a small delay to allow the guild store to initialize
    if (browser) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Check if guild is available after initialization
    if (!$currentGuild) {
      await goto("/dashboard");
      return;
    }

    // Continue with normal initialization
    Promise.all([
      fetchInviteSettings(),
      fetchLeaderboard(),
      fetchGuildMembers(),
      calculateStats(),
      fetchBotStatus()
    ]);
    checkMobile();

    if (browser) {
      window.addEventListener("resize", checkMobile);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener("resize", checkMobile);
    }
  });


  // Reactive declarations for guild changes
  $: if ($currentGuild) {
    fetchInviteSettings();
    fetchLeaderboard();
    fetchGuildMembers();
    calculateStats();
  }

  // Reactive declarations for instance changes
  $: if ($currentInstance) {
    fetchInviteSettings();
    fetchLeaderboard();
    fetchGuildMembers();
    calculateStats();
  }

  // Reactive declarations for user selection changes
  $: if (selectedUserId && activeTab === "inviter") {
    lookupInviter();
  }

  $: if (selectedUserId && activeTab === "invited") {
    lookupInvitedUsers();
  }
</script>

<DashboardPageLayout 
  title="Invite Tracking" 
  subtitle="Monitor and manage server invites and user referrals" 
  icon={UserPlus}
  guildName={$currentGuild?.name || "Dashboard"}
  tabs={tabs}
  bind:activeTab
  on:tabChange={(e) => activeTab = e.detail.tabId}
>
  <svelte:fragment slot="status-messages">
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}
  </svelte:fragment>
  {#if activeTab === 'settings'}
    <!-- Settings Panel -->
    <section>
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   color: {$colorStore.primary};"
          >
            <Settings aria-hidden="true" class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Invite Tracking Settings</h2>
        </div>

        {#if loading.settings}
          <div class="flex justify-center items-center min-h-[200px]">
            <div
              class="w-12 h-12 border-4 rounded-full animate-spin"
              style="border-color: {$colorStore.primary}20;
                     border-top-color: {$colorStore.primary};"
              aria-label="Loading"
            >
            </div>
          </div>
        {:else if error.settings}
          <div
            class="rounded-xl p-4 flex items-center gap-3"
            style="background: {$colorStore.accent}10;"
            role="alert"
          >
            <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
            <p style="color: {$colorStore.accent}">{error.settings}</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Enable Invite Tracking -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.primary}10;"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Settings class="w-5 h-5" style="color: {$colorStore.primary}" aria-hidden="true" />
                  <h3 class="font-semibold" style="color: {$colorStore.text}">Enable Invite Tracking</h3>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    bind:checked={inviteSettings.isEnabled}
                    class="sr-only peer"
                    on:change={() => markAsChanged("inviteSettings")}
                    aria-label="Enable or disable invite tracking"
                  >
                  <div
                    class="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                    style="background-color: {$colorStore.accent}30;
                           peer-checked:background-color: {$colorStore.accent};"
                    aria-hidden="true"
                  ></div>
                </label>
              </div>
              <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
                Track who invited users to your server and how many invites each user has.
              </p>
            </div>

            <!-- Remove Invite On Leave -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.secondary}10;"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Settings class="w-5 h-5" style="color: {$colorStore.secondary}" aria-hidden="true" />
                  <h3 class="font-semibold" style="color: {$colorStore.text}">Remove Invite On Leave</h3>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    bind:checked={inviteSettings.removeInviteOnLeave}
                    class="sr-only peer"
                    on:change={() => markAsChanged("inviteSettings")}
                    aria-label="Remove invite count when a user leaves"
                  >
                  <div
                    class="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                    style="background-color: {$colorStore.accent}30;
                           peer-checked:background-color: {$colorStore.accent};"
                    aria-hidden="true"
                  ></div>
                </label>
              </div>
              <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
                When enabled, invite counts will be reduced if the invited user leaves the server.
              </p>
            </div>

            <!-- Minimum Account Age -->
            <div
              class="col-span-1 md:col-span-2 rounded-xl p-4"
              style="background: {$colorStore.primary}10;"
            >
              <div class="flex items-center gap-2 mb-3">
                <Clock class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
                <h3 class="font-semibold" style="color: {$colorStore.text}">Minimum Account Age</h3>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm mb-1" style="color: {$colorStore.muted}" for="min-age-days">Days</label>
                  <input
                    id="min-age-days"
                    type="number"
                    bind:value={minAgeDays}
                    on:input={() => markAsChanged("inviteSettings")}
                    class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                    style="border-color: {$colorStore.primary}30;
                           color: {$colorStore.text};"
                    min="0"
                    aria-label="Minimum account age in days"
                  />
                </div>
                <div>
                  <label class="block text-sm mb-1" style="color: {$colorStore.muted}" for="min-age-hours">Hours</label>
                  <input
                    id="min-age-hours"
                    type="number"
                    bind:value={minAgeHours}
                    on:input={() => markAsChanged("inviteSettings")}
                    class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                    style="border-color: {$colorStore.primary}30;
                           color: {$colorStore.text};"
                    min="0"
                    max="23"
                    aria-label="Minimum account age in hours"
                  />
                </div>
                <div>
                  <label class="block text-sm mb-1" style="color: {$colorStore.muted}"
                         for="min-age-minutes">Minutes</label>
                  <input
                    id="min-age-minutes"
                    type="number"
                    bind:value={minAgeMinutes}
                    on:input={() => markAsChanged("inviteSettings")}
                    class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                    style="border-color: {$colorStore.primary}30;
                           color: {$colorStore.text};"
                    min="0"
                    max="59"
                    aria-label="Minimum account age in minutes"
                  />
                </div>
              </div>
              <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
                Discord accounts must be at least this old to be counted toward invite totals. This helps prevent alt
                account abuse.
              </p>
            </div>

            <!-- Save Button -->
            <div class="col-span-1 md:col-span-2 flex justify-end mt-4">
              <button
                class="px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                disabled={!changedSettings.has("inviteSettings")}
                on:click={updateInviteSettings}
                style="background: linear-gradient(to right, {$colorStore.primary}, {$colorStore.secondary});
                       color: {$colorStore.text};"
                aria-label="Save invite settings"
              >
                Save Settings
              </button>
            </div>
          </div>
        {/if}
    </section>
  {/if}

  {#if activeTab === 'stats'}
    <!-- Stats Panel -->
    <section>
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   color: {$colorStore.primary};"
          >
            <FileSpreadsheet aria-hidden="true" class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Invite Statistics</h2>
        </div>

        {#if loading.stats}
          <div class="flex justify-center items-center min-h-[200px]">
            <div
              class="w-12 h-12 border-4 rounded-full animate-spin"
              style="border-color: {$colorStore.primary}20;
                     border-top-color: {$colorStore.primary};"
              aria-label="Loading"
            >
            </div>
          </div>
        {:else if error.stats}
          <div
            class="rounded-xl p-4 flex items-center gap-3"
            style="background: {$colorStore.accent}10;"
            role="alert"
          >
            <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
            <p style="color: {$colorStore.accent}">{error.stats}</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Total Invites -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.primary}10;"
            >
              <div class="flex flex-col">
                <span class="text-sm" style="color: {$colorStore.muted}">Total Invites</span>
                <span class="text-3xl font-bold"
                      style="color: {$colorStore.text}">{formatNumber(userStats.totalInvites)}</span>
                <span class="text-xs mt-1" style="color: {$colorStore.muted}">Total invites across all members</span>
              </div>
            </div>

            <!-- Average Invites -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.secondary}10;"
            >
              <div class="flex flex-col">
                <span class="text-sm" style="color: {$colorStore.muted}">Average Per Member</span>
                <span class="text-3xl font-bold"
                      style="color: {$colorStore.text}">{userStats.avgInvitesPerUser.toFixed(1)}</span>
                <span class="text-xs mt-1" style="color: {$colorStore.muted}">Average invites per member</span>
              </div>
            </div>

            <!-- Top Inviter -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.accent}10;"
            >
              <div class="flex flex-col">
                <span class="text-sm" style="color: {$colorStore.muted}">Top Inviter</span>
                <span class="text-xl font-bold truncate"
                      style="color: {$colorStore.text}">{userStats.topInviter.username}</span>
                <span class="text-sm" style="color: {$colorStore.secondary}">{userStats.topInviter.inviteCount}
                  invites</span>
              </div>
            </div>
          </div>

          <!-- Settings State -->
          <div
            class="rounded-xl p-4 mb-6"
            style="background: {$colorStore.primary}15;"
          >
            <h3 class="font-semibold mb-3" style="color: {$colorStore.text}">Current Settings</h3>
            <ul class="space-y-2">
              <li class="flex justify-between p-3 rounded-lg" style="background: {$colorStore.primary}10;">
                <span style="color: {$colorStore.muted}">Invite Tracking</span>
                <span style="color: {$colorStore.text}">{inviteSettings.isEnabled ? 'Enabled' : 'Disabled'}</span>
              </li>
              <li class="flex justify-between p-3 rounded-lg" style="background: {$colorStore.primary}10;">
                <span style="color: {$colorStore.muted}">Remove on Leave</span>
                <span
                  style="color: {$colorStore.text}">{inviteSettings.removeInviteOnLeave ? 'Enabled' : 'Disabled'}</span>
              </li>
              <li class="flex justify-between p-3 rounded-lg" style="background: {$colorStore.primary}10;">
                <span style="color: {$colorStore.muted}">Min Account Age</span>
                <span style="color: {$colorStore.text}">
                  {minAgeDays}d {minAgeHours}h {minAgeMinutes}m
                </span>
              </li>
            </ul>
          </div>
        {/if}
    </section>
  {/if}

  {#if activeTab === 'leaderboard'}
    <!-- Leaderboard Panel -->
    <section>
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   color: {$colorStore.primary};"
          >
            <Award aria-hidden="true" class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Invite Leaderboard</h2>
        </div>

        {#if loading.leaderboard}
          <div class="flex justify-center items-center min-h-[200px]">
            <div
              class="w-12 h-12 border-4 rounded-full animate-spin"
              style="border-color: {$colorStore.primary}20;
                     border-top-color: {$colorStore.primary};"
              aria-label="Loading"
            >
            </div>
          </div>
        {:else if error.leaderboard}
          <div
            class="rounded-xl p-4 flex items-center gap-3"
            style="background: {$colorStore.accent}10;"
            role="alert"
          >
            <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
            <p style="color: {$colorStore.accent}">{error.leaderboard}</p>
          </div>
        {:else}
          {#if leaderboard.length === 0}
            <div
              class="text-center py-12"
              transition:fade
            >
              <Users class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.muted}" aria-hidden="true" />
              <p style="color: {$colorStore.muted}">No invite data available</p>
            </div>
          {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {#each leaderboard as user, i}
                <div
                  class="rounded-xl p-4 border transition-all duration-200"
                  style="background: {$colorStore.primary}10;
                         border-color: {$colorStore.primary}20;
                         hover:border-color: {$colorStore.primary}30;"
                >
                  <div class="flex items-center gap-4">
                    <div
                      class="w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold"
                      style="background: {i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : $colorStore.primary}20;
                             color: {i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : $colorStore.primary};"
                    >
                      #{i + 1 + ((leaderboardPage - 1) * leaderboardPageSize)}
                    </div>
                    <div class="flex-grow min-w-0">
                      <p class="font-medium truncate" style="color: {$colorStore.text}">{user.username}</p>
                      <div class="flex items-center text-sm" style="color: {$colorStore.muted}">
                        <span class="font-medium" style="color: {$colorStore.secondary}">{user.inviteCount}</span>
                        <span class="ml-1">invites</span>
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>

            <!-- Pagination -->
            <div class="flex justify-center mt-6 space-x-2">
              <button
                class="px-4 py-2 rounded-lg transition-all duration-200"
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};
                       opacity: {leaderboardPage <= 1 ? '0.5' : '1'};"
                on:click={() => goToPage(leaderboardPage - 1)}
                disabled={leaderboardPage <= 1}
                aria-label="Previous page"
              >
                Previous
              </button>
              <div
                class="px-4 py-2 rounded-lg"
                style="background: {$colorStore.primary}30;
                       color: {$colorStore.text};"
                aria-current="page"
              >
                Page {leaderboardPage}
              </div>
              <button
                class="px-4 py-2 rounded-lg transition-all duration-200"
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};"
                on:click={() => goToPage(leaderboardPage + 1)}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          {/if}
        {/if}
    </section>
  {/if}

  {#if activeTab === 'inviter'}
    <!-- Inviter Panel -->
    <section>
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   color: {$colorStore.primary};"
          >
            <User aria-hidden="true" class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Find Who Invited a User</h2>
        </div>

        <div class="space-y-6">
          <!-- User Selection -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <h3 class="font-semibold mb-3" style="color: {$colorStore.text}">Select User</h3>
            <div class="flex flex-col md:flex-row gap-3">
              <DiscordSelector
                type="custom"
                options={guildMembers.map(member => ({
                  id: member.id,
                  name: member.username,
                  avatarUrl: member.avatarUrl
                }))}
                customIcon={User}
                placeholder="Select a User"
                bind:selectedId={selectedUserId}
                aria-label="Select a user to find their inviter"
              />
              <button
                aria-label="Find inviter"
                class="px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                disabled={!selectedUserId}
                on:click={lookupInviter}
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};"
              >
                Find Inviter
              </button>
            </div>
          </div>

          <!-- Inviter Results -->
          {#if inviterLoading}
            <div class="flex justify-center items-center py-6">
              <div
                class="w-8 h-8 border-3 rounded-full animate-spin"
                style="border-color: {$colorStore.primary}20;
                       border-top-color: {$colorStore.primary};"
                aria-label="Loading"
              >
              </div>
            </div>
          {:else if inviterError}
            <div
              class="rounded-xl p-4 flex items-center gap-3"
              style="background: {$colorStore.accent}10;"
              role="alert"
            >
              <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
              <p style="color: {$colorStore.accent}">{inviterError}</p>
            </div>
          {:else if inviterInfo && selectedUserId}
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.secondary}10;"
            >
              <h3 class="font-semibold mb-3" style="color: {$colorStore.text}">Inviter Information</h3>
              <div class="flex items-center gap-4 p-4 rounded-lg" style="background: {$colorStore.secondary}15;">
                <img
                  src={inviterInfo.avatarUrl}
                  alt=""
                  class="w-16 h-16 rounded-full border-2"
                  style="border-color: {$colorStore.primary}30;"
                />
                <div>
                  <p class="font-medium text-lg" style="color: {$colorStore.text}">{inviterInfo.username}</p>
                  <p class="text-sm" style="color: {$colorStore.muted}">
                    Invited <span
                    style="color: {$colorStore.secondary}">{guildMembers.find(m => m.id === selectedUserId)?.username || 'Selected User'}</span>
                    to the server
                  </p>
                </div>
              </div>
            </div>
          {/if}
        </div>
    </section>
  {/if}

  {#if activeTab === 'invited'}
    <!-- Invited Users Panel -->
    <section>
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   color: {$colorStore.primary};"
          >
            <UserPlus aria-hidden="true" class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Find Users Invited By</h2>
        </div>

        <div class="space-y-6">
          <!-- User Selection -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <h3 class="font-semibold mb-3" style="color: {$colorStore.text}">Select Inviter</h3>
            <div class="flex flex-col md:flex-row gap-3">
              <DiscordSelector
                type="custom"
                options={guildMembers.map(member => ({
                  id: member.id,
                  name: member.username,
                  avatarUrl: member.avatarUrl
                }))}
                customIcon={UserPlus}
                placeholder="Select a User"
                bind:selectedId={selectedUserId}
                aria-label="Select a user to find who they invited"
              />
              <button
                aria-label="Find invited users"
                class="px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                disabled={!selectedUserId}
                on:click={lookupInvitedUsers}
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};"
              >
                Find Invited Users
              </button>
            </div>
          </div>

          <!-- Invited Users Results -->
          {#if invitedLoading}
            <div class="flex justify-center items-center py-6">
              <div
                class="w-8 h-8 border-3 rounded-full animate-spin"
                style="border-color: {$colorStore.primary}20;
                       border-top-color: {$colorStore.primary};"
                aria-label="Loading"
              >
              </div>
            </div>
          {:else if invitedError}
            <div
              class="rounded-xl p-4 flex items-center gap-3"
              style="background: {$colorStore.accent}10;"
              role="alert"
            >
              <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
              <p style="color: {$colorStore.accent}">{invitedError}</p>
            </div>
          {:else if invitedUsers.length > 0 && selectedUserId}
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.secondary}10;"
            >
              <h3 class="font-semibold mb-3" style="color: {$colorStore.text}">
                {guildMembers.find(m => m.id === selectedUserId)?.username || 'Selected User'} has
                invited {invitedUsers.length} user{invitedUsers.length !== 1 ? 's' : ''}
              </h3>
              <div class="space-y-3">
                {#each invitedUsers as user}
                  <div
                    class="flex items-center gap-3 p-3 rounded-lg"
                    style="background: {$colorStore.secondary}15;"
                  >
                    <img
                      src={user.avatarUrl}
                      alt=""
                      class="w-10 h-10 rounded-full border-2"
                      style="border-color: {$colorStore.primary}30;"
                    />
                    <div>
                      <p class="font-medium" style="color: {$colorStore.text}">{user.username}</p>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {:else if selectedUserId && !invitedLoading}
            <div class="text-center py-8">
              <UserPlus class="w-12 h-12 mx-auto mb-3" style="color: {$colorStore.muted}" aria-hidden="true" />
              <p style="color: {$colorStore.muted}">
                {guildMembers.find(m => m.id === selectedUserId)?.username || 'This user'} hasn't invited anyone yet
              </p>
            </div>
          {/if}
        </div>
    </section>
  {/if}
</DashboardPageLayout>

<style lang="postcss">
    /* Custom styling for options */
    option {
        background-color: #374151;
        color: white;
        padding: 0.5rem;
    }

    :global(.input-field) {
        transition: all 0.2s ease;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    :global(.input-field:focus) {
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
    }

    /* Prevent stretch in Safari */
    input, select {
        min-height: 44px;
    }

    /* Improve touchable area on mobile */
    @media (max-width: 768px) {
        button, input[type="checkbox"] {
            min-height: 44px;
            min-width: 44px;
        }
    }
</style>