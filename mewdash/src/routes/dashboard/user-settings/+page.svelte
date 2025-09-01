<!-- routes/dashboard/user-settings/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { api } from "$lib/api";
  import { logger } from "$lib/logger";
  import {
    AlertCircle,
    Bell,
    CheckCircle,
    Hash,
    Highlight,
    Plus,
    Save,
    Settings,
    Trash2,
    User,
    Users,
    XCircle,
    Crown,
    MessageSquare,
    Clock
  } from "lucide-svelte";

  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import StatCard from "$lib/components/monitoring/StatCard.svelte";

  export let data;

  // Component state
  let loading = false;
  let saving = false;
  let message = "";
  let messageType: "success" | "error" | "info" = "info";

  // User data
  let currentUser = data.user;
  let userId = BigInt(currentUser?.id || "0");

  // Data state
  let userHighlights: Array<{ id: number; word: string; dateAdded: string }> = [];
  let highlightSettings = {
    highlightsEnabled: true,
    ignoredChannels: [] as string[],
    ignoredUsers: [] as string[]
  };
  let afkStatus = {
    isAfk: false,
    message: "",
    when: null as string | null,
    wasTimed: false
  };
  let reputation = {
    totalRep: 0,
    rank: 0,
    totalGiven: 0,
    totalReceived: 0,
    currentStreak: 0,
    longestStreak: 0
  };

  // Form state
  let newHighlightWord = "";
  let newAfkMessage = "";
  let guildChannels: Array<{ id: string; name: string }> = [];
  let guildMembers: Array<{ id: string; username: string; displayName: string }> = [];

  // UI state
  let activeTab = "highlights";

  // Load all user data
  async function loadUserData() {
    if (!$currentGuild?.id || !userId) return;

    loading = true;
    try {
      const [
        highlights,
        hlSettings,
        afk,
        rep,
        channels,
        members
      ] = await Promise.all([
        api.getUserHighlights($currentGuild.id, userId).catch(() => []),
        api.getUserHighlightSettings($currentGuild.id, userId).catch(() => ({ 
          highlightsEnabled: true, 
          ignoredChannels: [], 
          ignoredUsers: [] 
        })),
        api.getUserAfkStatus($currentGuild.id, userId).catch(() => ({
          isAfk: false,
          message: "",
          when: null,
          wasTimed: false
        })),
        api.getUserReputation($currentGuild.id, userId).catch(() => ({
          totalRep: 0,
          rank: 0,
          totalGiven: 0,
          totalReceived: 0,
          currentStreak: 0,
          longestStreak: 0
        })),
        api.getGuildTextChannels($currentGuild.id).catch(() => []),
        api.getGuildMembers($currentGuild.id).catch(() => [])
      ]);

      userHighlights = highlights;
      highlightSettings = hlSettings;
      afkStatus = afk;
      reputation = rep;
      
      guildChannels = channels.map((c: any) => ({
        id: c.id.toString(),
        name: c.name
      }));
      
      guildMembers = members.map((m: any) => ({
        id: m.id.toString(),
        username: m.username,
        displayName: m.displayName
      }));

    } catch (err) {
      logger.error("Failed to load user data:", err);
      showMessage("Failed to load user settings", "error");
    } finally {
      loading = false;
    }
  }

  // Add highlight word
  async function addHighlight() {
    if (!$currentGuild?.id || !userId || !newHighlightWord.trim()) return;

    try {
      await api.addUserHighlight($currentGuild.id, userId, newHighlightWord.trim());
      newHighlightWord = "";
      showMessage("Highlight word added!", "success");
      await loadUserData();
    } catch (err) {
      logger.error("Failed to add highlight:", err);
      showMessage("Failed to add highlight word", "error");
    }
  }

  // Remove highlight word
  async function removeHighlight(highlightId: number) {
    if (!$currentGuild?.id || !userId) return;

    try {
      await api.removeUserHighlight($currentGuild.id, userId, highlightId);
      showMessage("Highlight word removed!", "success");
      await loadUserData();
    } catch (err) {
      logger.error("Failed to remove highlight:", err);
      showMessage("Failed to remove highlight word", "error");
    }
  }

  // Toggle highlights enabled
  async function toggleHighlights() {
    if (!$currentGuild?.id || !userId) return;

    saving = true;
    try {
      await api.updateUserHighlightSettings($currentGuild.id, userId, {
        highlightsEnabled: !highlightSettings.highlightsEnabled
      });
      showMessage(`Highlights ${!highlightSettings.highlightsEnabled ? 'enabled' : 'disabled'}!`, "success");
      await loadUserData();
    } catch (err) {
      logger.error("Failed to toggle highlights:", err);
      showMessage("Failed to update highlight settings", "error");
    } finally {
      saving = false;
    }
  }

  // Set AFK status
  async function setAfkStatus() {
    if (!$currentGuild?.id || !userId) return;

    saving = true;
    try {
      await api.setUserAfkStatus($currentGuild.id, userId, {
        message: newAfkMessage.trim() || undefined,
        isTimed: false,
        until: undefined
      });
      newAfkMessage = "";
      showMessage("AFK status updated!", "success");
      await loadUserData();
    } catch (err) {
      logger.error("Failed to set AFK:", err);
      showMessage("Failed to update AFK status", "error");
    } finally {
      saving = false;
    }
  }

  // Remove AFK status
  async function removeAfkStatus() {
    if (!$currentGuild?.id || !userId) return;

    saving = true;
    try {
      await api.removeUserAfkStatus($currentGuild.id, userId);
      showMessage("AFK status removed!", "success");
      await loadUserData();
    } catch (err) {
      logger.error("Failed to remove AFK:", err);
      showMessage("Failed to remove AFK status", "error");
    } finally {
      saving = false;
    }
  }

  // Utility functions
  function showMessage(text: string, type: "success" | "error" | "info") {
    message = text;
    messageType = type;
    setTimeout(() => {
      message = "";
    }, 5000);
  }

  onMount(() => {
    loadUserData();
  });

  // Tabs configuration
  const tabs = [
    { id: "highlights", label: "Highlights", icon: Highlight },
    { id: "afk", label: "AFK Status", icon: Clock },
    { id: "reputation", label: "Reputation", icon: Crown }
  ];

  // Action buttons configuration
  $: actionButtons = [
    {
      label: "Refresh",
      icon: Settings,
      action: loadUserData,
      loading: loading
    }
  ];

  // Handle tab change
  function handleTabChange(event: CustomEvent) {
    activeTab = event.detail.tabId;
  }
</script>

<DashboardPageLayout
  title="User Settings"
  subtitle="Manage your personal bot settings for this server"
  icon={User}
  {tabs}
  {activeTab}
  {actionButtons}
  guildName={$currentGuild?.name || "Dashboard"}
  on:tabChange={handleTabChange}
>
  <svelte:fragment slot="status-messages">
    <!-- Status Message -->
    {#if message}
      <div class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-all"
           style="background: {messageType === 'success' ? '#10b98120' : messageType === 'error' ? '#ef444420' : $colorStore.primary + '20'};
                  border: 1px solid {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}30;"
           in:fly={{ x: 20, duration: 300 }}>
        {#if messageType === 'success'}
          <CheckCircle class="w-5 h-5" style="color: #10b981" />
        {:else if messageType === 'error'}
          <XCircle class="w-5 h-5" style="color: #ef4444" />
        {:else}
          <AlertCircle class="w-5 h-5" style="color: {$colorStore.primary}" />
        {/if}
        <span style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
      </div>
    {/if}
  </svelte:fragment>

  <!-- Tab Content -->
  {#if activeTab === 'highlights'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      <!-- Highlights Enable/Disable -->
      <div class="rounded-2xl p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Bell class="w-5 h-5" style="color: {$colorStore.primary}" />
            <div>
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">Enable Highlights</h3>
              <p class="text-sm" style="color: {$colorStore.muted}">Get notified when your highlight words are mentioned</p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              class="sr-only peer"
              checked={highlightSettings.highlightsEnabled}
              on:change={toggleHighlights}
              disabled={saving}
            />
            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-disabled:opacity-50"
                 style="peer-checked:bg: {$colorStore.primary}"></div>
          </label>
        </div>
      </div>

      <!-- Add New Highlight -->
      <div class="rounded-2xl p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
          <Plus class="w-5 h-5" />
          Add Highlight Word
        </h3>
        <div class="flex gap-3">
          <input
            type="text"
            bind:value={newHighlightWord}
            placeholder="Enter word to highlight..."
            class="flex-1 px-4 py-3 rounded-xl border transition-all"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
            on:keydown={(e) => e.key === 'Enter' && addHighlight()}
          />
          <button
            class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
            style="background: {$colorStore.primary}; color: white;"
            on:click={addHighlight}
            disabled={!newHighlightWord.trim()}
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Current Highlights -->
      <div class="rounded-2xl p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
          <Highlight class="w-5 h-5" />
          Your Highlight Words ({userHighlights.length})
        </h3>
        
        {#if userHighlights.length === 0}
          <div class="text-center py-8">
            <Highlight class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
            <p class="text-lg font-medium mb-2" style="color: {$colorStore.text}">No Highlight Words</p>
            <p class="text-sm" style="color: {$colorStore.muted}">Add words above to get notified when they're mentioned</p>
          </div>
        {:else}
          <div class="space-y-2">
            {#each userHighlights as highlight}
              <div class="flex items-center justify-between p-3 rounded-xl"
                   style="background: {$colorStore.primary}08;">
                <div class="flex items-center gap-3">
                  <div class="font-medium" style="color: {$colorStore.text}">{highlight.word}</div>
                  <div class="text-xs" style="color: {$colorStore.muted}">
                    Added {new Date(highlight.dateAdded).toLocaleDateString()}
                  </div>
                </div>
                <button
                  class="p-2 rounded-lg transition-all hover:scale-105"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                  on:click={() => removeHighlight(highlight.id)}
                  aria-label="Remove highlight word {highlight.word}"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

  {:else if activeTab === 'afk'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      <!-- Current AFK Status -->
      <div class="rounded-2xl p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
          <Clock class="w-5 h-5" />
          Current Status
        </h3>
        
        {#if afkStatus.isAfk}
          <div class="p-4 rounded-xl flex items-center gap-3"
               style="background: {$colorStore.accent}15; border: 1px solid {$colorStore.accent}30;">
            <div class="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
            <div>
              <div class="font-medium" style="color: {$colorStore.text}">You are currently AFK</div>
              {#if afkStatus.message}
                <div class="text-sm mt-1" style="color: {$colorStore.muted}">"{afkStatus.message}"</div>
              {/if}
              {#if afkStatus.when}
                <div class="text-xs mt-1" style="color: {$colorStore.muted}">
                  Since {new Date(afkStatus.when).toLocaleString()}
                </div>
              {/if}
            </div>
          </div>
          
          <button
            class="mt-4 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
            style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
            on:click={removeAfkStatus}
            disabled={saving}
          >
            Remove AFK Status
          </button>
        {:else}
          <div class="p-4 rounded-xl flex items-center gap-3"
               style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30;">
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <div>
              <div class="font-medium" style="color: {$colorStore.text}">You are not AFK</div>
              <div class="text-sm" style="color: {$colorStore.muted}">Set an AFK message below</div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Set AFK Status -->
      <div class="rounded-2xl p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
          <MessageSquare class="w-5 h-5" />
          Set AFK Message
        </h3>
        
        <div class="space-y-4">
          <textarea
            bind:value={newAfkMessage}
            placeholder="Enter your AFK message (optional)..."
            rows="3"
            class="w-full px-4 py-3 rounded-xl border transition-all resize-none"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
          ></textarea>
          
          <button
            class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2"
            style="background: {$colorStore.primary}; color: white;"
            on:click={setAfkStatus}
            disabled={saving}
          >
            <Save class="w-4 h-4" />
            {saving ? "Setting..." : "Set AFK"}
          </button>
        </div>
      </div>
    </div>

  {:else if activeTab === 'reputation'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      <!-- Reputation Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Crown}
          label="Total Reputation"
          value={reputation.totalRep}
          subtitle="reputation points"
          iconColor="primary"
          animationDelay={0}
        />
        
        <StatCard
          icon={Users}
          label="Server Rank"
          value={reputation.rank}
          subtitle="out of all users"
          iconColor="secondary"
          animationDelay={100}
        />
        
        <StatCard
          icon={Plus}
          label="Given"
          value={reputation.totalGiven}
          subtitle="rep points given"
          iconColor="accent"
          animationDelay={200}
        />
        
        <StatCard
          icon={CheckCircle}
          label="Current Streak"
          value={reputation.currentStreak}
          subtitle="days active"
          iconColor="primary"
          animationDelay={300}
        />
      </div>
      
      <!-- Reputation is read-only info panel -->
      <div class="rounded-2xl p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
        <div class="flex items-center gap-3 mb-4">
          <Crown class="w-5 h-5" style="color: {$colorStore.primary}" />
          <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">Reputation System</h3>
        </div>
        <p class="text-sm mb-4" style="color: {$colorStore.muted}">
          Reputation is earned by being a positive member of the community. Use chat commands like <code class="px-1 py-0.5 rounded" style="background: {$colorStore.primary}20">+rep @user</code> to give reputation to others.
        </p>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span style="color: {$colorStore.muted}">Longest Streak:</span>
            <span style="color: {$colorStore.text}" class="font-medium ml-2">{reputation.longestStreak} days</span>
          </div>
          <div>
            <span style="color: {$colorStore.muted}">Total Received:</span>
            <span style="color: {$colorStore.text}" class="font-medium ml-2">{reputation.totalReceived}</span>
          </div>
        </div>
      </div>
    </div>
  {/if}
</DashboardPageLayout>

<style>
  .peer:checked ~ div {
    background-color: var(--primary-color);
  }
  
  code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
  }
</style>