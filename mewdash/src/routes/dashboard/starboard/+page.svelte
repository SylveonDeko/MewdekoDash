<!-- routes/dashboard/starboard/+page.svelte -->
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
  import {
    AlertCircle,
    ExternalLink,
    Filter,
    Hash,
    MessageSquarePlus,
    Settings,
    Sparkles,
    Star,
    ToggleLeft,
    ToggleRight,
    Trash,
    Trash2
  } from "lucide-svelte";
  import { browser } from "$app/environment";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import type { PageData } from "./$types";

  export let data: PageData;

  // State management
  let botStatus: BotStatusModel | null = null;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let isMobile = false;

  // Starboard configurations
  let starboards: Array<{
    id: number;
    guildId: bigint;
    starboardChannelId: bigint;
    emote: string;
    threshold: number;
    checkedChannels: string;
    useBlacklist: boolean;
    allowBots: boolean;
    removeOnDelete: boolean;
    removeOnReactionsClear: boolean;
    removeBelowThreshold: boolean;
    repostThreshold: number;
  }> = [];

  // Guild channels and emote selection
  let guildTextChannels: Array<{
    id: string;
    name: string;
  }> = [];

  // New starboard form
  let newStarboard = {
    channelId: "",
    emote: "⭐",
    threshold: 1
  };

  // Channel management
  let selectedStarboardId: number | null = null;
  let selectedChannelId = "";
  let parsedCheckedChannels: string[] = [];

  // Current view states
  let loadingStarboards = true;
  let errorStarboards: string | null = null;
  let creatingStarboard = false;


  // Edit thresholds
  let editStarThreshold = 0;
  let editRepostThreshold = 0;

  // Modals
  let showDeleteModal = false;
  let showSettingsModal = false;
  let showChannelsModal = false;
  let starboardToDelete: number | null = null;
  let currentEditStarboard: any = null;

  // Custom emoji input (for when users want to use a custom emoji)
  let customEmojiInput = "";

  // Fetch bot status
  async function fetchBotStatus() {
    try {
      botStatus = await api.getBotStatus();
    } catch (err) {
      logger.error("Failed to fetch bot status:", err);
    }
  }

  // Initialize data loading
  $: if ($currentInstance) {
    Promise.all([
      fetchStarboards(),
      fetchGuildChannels(),
      fetchBotStatus()
    ]);
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

  async function fetchStarboards() {
    try {
      loadingStarboards = true;
      errorStarboards = null;
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      starboards = await api.getStarboards($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch starboards:", err);
      errorStarboards = err instanceof Error ? err.message : "Failed to fetch starboards";
    } finally {
      loadingStarboards = false;
    }
  }

  async function fetchGuildChannels() {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      guildTextChannels = await api.getGuildTextChannels($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch guild channels:", err);
    }
  }

  async function createStarboard() {
    try {
      creatingStarboard = true;
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!newStarboard.channelId) throw new Error("No channel selected");

      await api.createStarboard(
        $currentGuild.id,
        BigInt(newStarboard.channelId),
        newStarboard.emote,
        newStarboard.threshold
      );

      showNotificationMessage("Starboard created successfully", "success");

      // Reset form
      newStarboard = {
        channelId: "",
        emote: "⭐",
        threshold: 1
      };

      await fetchStarboards();
    } catch (err) {
      logger.error("Failed to create starboard:", err);
      showNotificationMessage(err instanceof Error ? err.message : "Failed to create starboard", "error");
    } finally {
      creatingStarboard = false;
    }
  }

  async function deleteStarboard(starboardId: number) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      await api.deleteStarboard($currentGuild.id, starboardId);
      showNotificationMessage("Starboard deleted successfully", "success");
      await fetchStarboards();
      showDeleteModal = false;
      starboardToDelete = null;
    } catch (err) {
      logger.error("Failed to delete starboard:", err);
      showNotificationMessage("Failed to delete starboard", "error");
    }
  }

  function confirmDeleteStarboard(starboardId: number) {
    starboardToDelete = starboardId;
    showDeleteModal = true;
  }

  function openSettingsModal(starboard: any) {
    currentEditStarboard = { ...starboard };
    editStarThreshold = starboard.threshold;
    editRepostThreshold = starboard.repostThreshold;
    showSettingsModal = true;
  }

  function openChannelsModal(starboard: any) {
    currentEditStarboard = { ...starboard };
    selectedStarboardId = starboard.id;
    parsedCheckedChannels = starboard.checkedChannels
      ? starboard.checkedChannels.split(" ")
      : [];
    showChannelsModal = true;
  }

  async function toggleAllowBots(starboardId: number, currentValue: boolean) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      const result = await api.setAllowBots($currentGuild.id, starboardId, !currentValue);
      showNotificationMessage(`Bot messages will ${result ? "be" : "not be"} starred`, "success");
      await fetchStarboards();
    } catch (err) {
      logger.error("Failed to toggle allow bots setting:", err);
      showNotificationMessage("Failed to update setting", "error");
    }
  }

  async function toggleRemoveOnDelete(starboardId: number, currentValue: boolean) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      const result = await api.setRemoveOnDelete($currentGuild.id, starboardId, !currentValue);
      showNotificationMessage(`Starred messages will ${result ? "be" : "not be"} removed when original is deleted`, "success");
      await fetchStarboards();
    } catch (err) {
      logger.error("Failed to toggle remove on delete setting:", err);
      showNotificationMessage("Failed to update setting", "error");
    }
  }

  async function toggleRemoveOnClear(starboardId: number, currentValue: boolean) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      const result = await api.setRemoveOnClear($currentGuild.id, starboardId, !currentValue);
      showNotificationMessage(`Starred messages will ${result ? "be" : "not be"} removed when reactions are cleared`, "success");
      await fetchStarboards();
    } catch (err) {
      logger.error("Failed to toggle remove on clear setting:", err);
      showNotificationMessage("Failed to update setting", "error");
    }
  }

  async function toggleRemoveBelowThreshold(starboardId: number, currentValue: boolean) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      const result = await api.setRemoveBelowThreshold($currentGuild.id, starboardId, !currentValue);
      showNotificationMessage(`Starred messages will ${result ? "be" : "not be"} removed when below threshold`, "success");
      await fetchStarboards();
    } catch (err) {
      logger.error("Failed to toggle remove below threshold setting:", err);
      showNotificationMessage("Failed to update setting", "error");
    }
  }

  async function toggleUseBlacklist(starboardId: number, currentValue: boolean) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      const result = await api.setUseBlacklist($currentGuild.id, starboardId, !currentValue);
      showNotificationMessage(`Now using ${result ? "blacklist" : "whitelist"} mode for channels`, "success");
      await fetchStarboards();
    } catch (err) {
      logger.error("Failed to toggle blacklist mode:", err);
      showNotificationMessage("Failed to update setting", "error");
    }
  }

  async function updateStarThreshold() {
    try {
      if (!$currentGuild?.id || !currentEditStarboard) throw new Error("No guild or starboard selected");

      await api.setStarThreshold($currentGuild.id, currentEditStarboard.id, editStarThreshold);
      showNotificationMessage(`Star threshold updated to ${editStarThreshold}`, "success");
      await fetchStarboards();
    } catch (err) {
      logger.error("Failed to update star threshold:", err);
      showNotificationMessage("Failed to update threshold", "error");
    }
  }

  async function updateRepostThreshold() {
    try {
      if (!$currentGuild?.id || !currentEditStarboard) throw new Error("No guild or starboard selected");

      await api.setRepostThreshold($currentGuild.id, currentEditStarboard.id, editRepostThreshold);

      if (editRepostThreshold === 0) {
        showNotificationMessage("Reposting disabled", "success");
      } else {
        showNotificationMessage(`Repost threshold updated to ${editRepostThreshold}`, "success");
      }

      await fetchStarboards();
    } catch (err) {
      logger.error("Failed to update repost threshold:", err);
      showNotificationMessage("Failed to update threshold", "error");
    }
  }

  async function toggleChannelInList() {
    try {
      if (!$currentGuild?.id || !selectedStarboardId || !selectedChannelId)
        throw new Error("Missing required information");

      const result = await api.toggleChannel($currentGuild.id, selectedStarboardId, BigInt(selectedChannelId));

      if (result.wasAdded) {
        showNotificationMessage(`Channel added to ${result.config.useBlacklist ? "blacklist" : "whitelist"}`, "success");
      } else {
        showNotificationMessage(`Channel removed from ${result.config.useBlacklist ? "blacklist" : "whitelist"}`, "success");
      }

      // Update the local checked channels
      parsedCheckedChannels = result.config.checkedChannels ? result.config.checkedChannels.split(" ") : [];

      await fetchStarboards();
      selectedChannelId = "";
    } catch (err) {
      logger.error("Failed to toggle channel:", err);
      showNotificationMessage("Failed to update channel list", "error");
    }
  }

  function setCustomEmoji() {
    if (customEmojiInput) {
      newStarboard.emote = customEmojiInput;
      customEmojiInput = "";
    }
  }

  function getChannelName(channelId: string) {
    const channel = guildTextChannels.find(c => c.id === channelId);
    return channel ? channel.name : `Channel ID: ${channelId}`;
  }

  onMount(() => {
    if (!$currentGuild) goto("/dashboard");
    fetchStarboards();
    fetchGuildChannels();
    fetchBotStatus();
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


  // Convert hex color to rgb values
  function hexToRgb(hex: string) {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }

  // Reactive declarations for guild changes
  $: if ($currentGuild) {
    fetchStarboards();
    fetchGuildChannels();
  }

  // Reactive declarations for instance changes
  $: if ($currentInstance) {
    fetchStarboards();
    fetchGuildChannels();
  }
</script>

<svelte:head>
  <title>Starboard - Dashboard</title>
</svelte:head>

<DashboardPageLayout 
  title="Starboard" 
  subtitle="Showcase your server's best messages in dedicated channels" 
  icon={Star}
  guildName={$currentGuild?.name || "Dashboard"}
  actionButtons={[
    {
      label: "Create Starboard",
      icon: MessageSquarePlus,
      action: createStarboard,
      loading: creatingStarboard,
      disabled: !newStarboard.channelId || creatingStarboard,
      style: `background: linear-gradient(to right, ${$colorStore.primary}, ${$colorStore.secondary}); color: ${$colorStore.text}; box-shadow: 0 0 20px ${$colorStore.primary}20;`
    }
  ]}
>
  <svelte:fragment slot="status-messages">
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}
  </svelte:fragment>

    <!-- Create New Starboard Section -->
    <div
      class="backdrop-blur-sm rounded-2xl border p-4 md:p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <div
          class="p-2 md:p-3 rounded-xl"
          style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                 color: {$colorStore.primary};"
        >
          <MessageSquarePlus aria-hidden="true" class="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <h2 class="text-lg md:text-xl font-bold" style="color: {$colorStore.text}">Create New Starboard</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <!-- Channel Selection -->
        <div>
          <label class="block text-sm mb-2" style="color: {$colorStore.muted}">
            Starboard Channel
          </label>
          <DiscordSelector
            type="channel"
            options={guildTextChannels}
            selected={newStarboard.channelId}
            placeholder="Select a channel"
            on:change={(e) => {
              newStarboard.channelId = e.detail.selected || "";
            }}
          />
        </div>

        <!-- Emote Selection -->
        <div>
          <label class="block text-sm mb-2" for="starboard-emote" style="color: {$colorStore.muted}">
            Emote
          </label>
          <div class="flex flex-col sm:flex-row gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <!-- Common emojis -->
              <button
                class="p-3 rounded-lg transition-all duration-200"
                on:click={() => newStarboard.emote = "⭐"}
                style="background: {newStarboard.emote === '⭐' ? $colorStore.primary : $colorStore.primary + '20'};
                       color: {$colorStore.text};"
              >
                ⭐
              </button>
              <button
                class="p-3 rounded-lg transition-all duration-200"
                on:click={() => newStarboard.emote = "🌟"}
                style="background: {newStarboard.emote === '🌟' ? $colorStore.primary : $colorStore.primary + '20'};
                       color: {$colorStore.text};"
              >
                🌟
              </button>
              <button
                class="p-3 rounded-lg transition-all duration-200"
                on:click={() => newStarboard.emote = "💫"}
                style="background: {newStarboard.emote === '💫' ? $colorStore.primary : $colorStore.primary + '20'};
                       color: {$colorStore.text};"
              >
                💫
              </button>
              <button
                class="p-3 rounded-lg transition-all duration-200"
                on:click={() => newStarboard.emote = "✨"}
                style="background: {newStarboard.emote === '✨' ? $colorStore.primary : $colorStore.primary + '20'};
                       color: {$colorStore.text};"
              >
                ✨
              </button>
            </div>

            <!-- Custom emoji input -->
            <div class="flex w-full sm:w-auto">
              <input
                bind:value={customEmojiInput}
                class="flex-1 p-2 md:p-3 text-sm md:text-base rounded-l-lg bg-gray-900/50 border transition-all duration-200"
                placeholder="Custom emoji"
                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                type="text"
              />
              <button
                class="px-2 md:px-3 py-1 rounded-r-lg transition-all duration-200 whitespace-nowrap"
                on:click={setCustomEmoji}
                style="background: {$colorStore.primary}20;
               color: {$colorStore.text};"
              >
                Set
              </button>
            </div>
          </div>
          <p class="text-xs mt-2" style="color: {$colorStore.muted}">
            Current emote: {newStarboard.emote || "None selected"}
          </p>
        </div>

        <!-- Threshold -->
        <div>
          <label class="block text-sm mb-2" for="starboard-threshold" style="color: {$colorStore.muted}">
            Threshold (reactions needed)
          </label>
          <input
            bind:value={newStarboard.threshold}
            class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
            id="starboard-threshold"
            min="1"
            style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            type="number"
          />
        </div>

        <!-- Create Button -->
        <div class="flex items-end">
          <button
            class="w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            disabled={!newStarboard.channelId || !newStarboard.emote || creatingStarboard}
            on:click={createStarboard}
            style="background: {$colorStore.primary}20;
                   color: {$colorStore.text};
                   opacity: {!newStarboard.channelId || !newStarboard.emote || creatingStarboard ? '0.5' : '1'};"
          >
            {#if creatingStarboard}
              <div
                class="w-4 h-4 border-2 rounded-full animate-spin"
                style="border-color: {$colorStore.text}20;
                       border-top-color: {$colorStore.text};"
              ></div>
            {:else}
              <Sparkles size={16} />
            {/if}
            <span>Create Starboard</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Existing Starboards Section -->
    <div
      class="backdrop-blur-sm rounded-2xl border p-4 md:p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <div
          class="p-2 md:p-3 rounded-xl"
          style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                 color: {$colorStore.primary};"
        >
          <Star aria-hidden="true" class="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <h2 class="text-lg md:text-xl font-bold" style="color: {$colorStore.text}">Manage Starboards</h2>
      </div>

      {#if loadingStarboards}
        <div class="flex justify-center items-center min-h-[100px]">
          <div
            class="w-8 h-8 border-3 rounded-full animate-spin"
            style="border-color: {$colorStore.primary}20;
                   border-top-color: {$colorStore.primary};"
            aria-label="Loading"
          >
          </div>
        </div>
      {:else if errorStarboards}
        <div
          class="rounded-xl p-4 flex items-center gap-3"
          style="background: {$colorStore.accent}10;"
          role="alert"
        >
          <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
          <p style="color: {$colorStore.accent}">{errorStarboards}</p>
        </div>
      {:else if !starboards || starboards.length === 0}
        <div
          class="text-center py-12 rounded-xl"
          style="background: {$colorStore.primary}10;"
          transition:fade
        >
          <Star class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.muted}" aria-hidden="true" />
          <p style="color: {$colorStore.muted}">No starboards configured</p>
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            Create your first starboard to showcase your server's best messages
          </p>
        </div>
      {:else}
        <div class="space-y-6">
          {#each starboards as starboard (starboard.id)}
            <div
              class="rounded-xl border p-4 hover:shadow-lg transition-all duration-200"
              style="background: {$colorStore.primary}10;
                     border-color: {$colorStore.primary}30;"
            >
              <div class="flex flex-col md:flex-row gap-3 md:gap-4">
                <!-- Starboard Info -->
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <Star class="w-4 h-4 md:w-5 md:h-5" style="color: {$colorStore.primary}" aria-hidden="true" />
                    <h3 class="font-medium text-sm md:text-base" style="color: {$colorStore.text}">Starboard
                      #{starboard.id}</h3>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 md:mb-4">
                    <div class="overflow-hidden">
                      <p class="text-xs md:text-sm" style="color: {$colorStore.muted}">Channel:</p>
                      <p class="text-sm md:text-base truncate" style="color: {$colorStore.text}">
                        #{getChannelName(starboard.starboardChannelId.toString())}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs md:text-sm" style="color: {$colorStore.muted}">Emote:</p>
                      <p class="text-sm md:text-base" style="color: {$colorStore.text}">{starboard.emote}</p>
                    </div>
                    <div>
                      <p class="text-xs md:text-sm" style="color: {$colorStore.muted}">Threshold:</p>
                      <p class="text-sm md:text-base" style="color: {$colorStore.text}">{starboard.threshold}
                        reaction{starboard.threshold !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p class="text-xs md:text-sm" style="color: {$colorStore.muted}">Repost Threshold:</p>
                      <p class="text-sm md:text-base" style="color: {$colorStore.text}">
                        {starboard.repostThreshold === 0 ? 'Disabled' : `${starboard.repostThreshold} message${starboard.repostThreshold !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>

                  <!-- Settings Overview -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
                    <div class="flex items-center gap-1">
                      <div
                        class="w-2 h-2 rounded-full"
                        style="background-color: {starboard.useBlacklist ? $colorStore.accent : $colorStore.primary};"
                      ></div>
                      <span class="text-sm" style="color: {$colorStore.muted}">
                        {starboard.useBlacklist ? 'Blacklist' : 'Whitelist'} Mode
                      </span>
                    </div>
                    <div class="flex items-center gap-1">
                      <div
                        class="w-2 h-2 rounded-full"
                        style="background-color: {starboard.allowBots ? $colorStore.primary : $colorStore.accent};"
                      ></div>
                      <span class="text-sm" style="color: {$colorStore.muted}">
                        {starboard.allowBots ? 'Allow' : 'Ignore'} Bots
                      </span>
                    </div>
                    <div class="flex items-center gap-1">
                      <div
                        class="w-2 h-2 rounded-full"
                        style="background-color: {starboard.removeOnDelete ? $colorStore.primary : $colorStore.accent};"
                      ></div>
                      <span class="text-sm" style="color: {$colorStore.muted}">
                        {starboard.removeOnDelete ? 'Remove' : 'Keep'} on Delete
                      </span>
                    </div>
                    <div class="flex items-center gap-1">
                      <div
                        class="w-2 h-2 rounded-full"
                        style="background-color: {starboard.removeOnReactionsClear ? $colorStore.primary : $colorStore.accent};"
                      ></div>
                      <span class="text-sm" style="color: {$colorStore.muted}">
                        {starboard.removeOnReactionsClear ? 'Remove' : 'Keep'} on Clear
                      </span>
                    </div>
                    <div class="flex items-center gap-1">
                      <div
                        class="w-2 h-2 rounded-full"
                        style="background-color: {starboard.removeBelowThreshold ? $colorStore.primary : $colorStore.accent};"
                      ></div>
                      <span class="text-sm" style="color: {$colorStore.muted}">
                        {starboard.removeBelowThreshold ? 'Remove' : 'Keep'} Below Threshold
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Buttons -->
                <div class="flex flex-row md:flex-col justify-end gap-2">
                  <button
                    class="p-2 rounded-lg transition-all duration-200"
                    on:click={() => openSettingsModal(starboard)}
                    style="background: {$colorStore.primary}20;
                           color: {$colorStore.text};"
                    aria-label="Starboard settings"
                  >
                    <Settings size={20} />
                  </button>
                  <button
                    class="p-2 rounded-lg transition-all duration-200"
                    on:click={() => openChannelsModal(starboard)}
                    style="background: {$colorStore.secondary}20;
                           color: {$colorStore.text};"
                    aria-label="Manage channels"
                  >
                    <Hash size={20} />
                  </button>
                  <button
                    class="p-2 rounded-lg transition-all duration-200"
                    on:click={() => confirmDeleteStarboard(starboard.id)}
                    style="background: {$colorStore.accent}20;
                           color: {$colorStore.accent};"
                    aria-label="Delete starboard"
                  >
                    <Trash size={20} />
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

  <!-- Delete Confirmation Modal -->
  {#if showDeleteModal}
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      transition:fade={{ duration: 200 }}
    >
      <div
        class="bg-gray-900/90 rounded-xl p-6 max-w-md w-full mx-4 border shadow-2xl"
        style="border-color: {$colorStore.accent}30;"
      >
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Confirm Delete</h3>
        <p class="mb-6" style="color: {$colorStore.muted}">
          Are you sure you want to delete this starboard? This action cannot be undone.
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 rounded-lg"
            on:click={() => { showDeleteModal = false; starboardToDelete = null; }}
            style="background: {$colorStore.primary}20;
                   color: {$colorStore.text};"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 rounded-lg flex items-center gap-2"
            on:click={() => starboardToDelete && deleteStarboard(starboardToDelete)}
            style="background: {$colorStore.accent}20;
                   color: {$colorStore.accent};"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Settings Modal -->
  {#if showSettingsModal && currentEditStarboard}
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      transition:fade={{ duration: 200 }}
    >
      <div
        class="bg-gray-900/90 rounded-xl p-6 max-w-xl w-full mx-4 border shadow-2xl overflow-y-auto max-h-[90vh]"
        style="border-color: {$colorStore.primary}30;"
      >
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Starboard Settings</h3>

        <div class="space-y-4">
          <!-- Star Threshold -->
          <div>
            <label for="edit-star-threshold" class="block text-sm mb-2" style="color: {$colorStore.muted}">
              Star Threshold
            </label>
            <div class="flex gap-2">
              <input
                id="edit-star-threshold"
                type="number"
                min="1"
                bind:value={editStarThreshold}
                class="flex-1 p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              />
              <button
                class="px-4 py-2 rounded-lg transition-all duration-200"
                on:click={updateStarThreshold}
                disabled={editStarThreshold === currentEditStarboard.threshold}
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};
                       opacity: {editStarThreshold === currentEditStarboard.threshold ? '0.5' : '1'};"
              >
                Update
              </button>
            </div>
          </div>

          <!-- Repost Threshold -->
          <div>
            <label for="edit-repost-threshold" class="block text-sm mb-2" style="color: {$colorStore.muted}">
              Repost Threshold (0 to disable)
            </label>
            <div class="flex gap-2">
              <input
                id="edit-repost-threshold"
                type="number"
                min="0"
                bind:value={editRepostThreshold}
                class="flex-1 p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              />
              <button
                class="px-4 py-2 rounded-lg transition-all duration-200"
                on:click={updateRepostThreshold}
                disabled={editRepostThreshold === currentEditStarboard.repostThreshold}
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};
                       opacity: {editRepostThreshold === currentEditStarboard.repostThreshold ? '0.5' : '1'};"
              >
                Update
              </button>
            </div>
          </div>

          <!-- Toggle Settings -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <h4 class="font-medium mb-3" style="color: {$colorStore.text}">Toggle Settings</h4>

            <div class="grid grid-cols-1 gap-3">
              <!-- Allow Bots -->
              <div class="flex items-center justify-between">
                <div>
                  <p style="color: {$colorStore.text}">Allow Bot Messages</p>
                  <p class="text-sm" style="color: {$colorStore.muted}">
                    {currentEditStarboard.allowBots
                      ? 'Bot messages can be starred'
                      : 'Bot messages are ignored'}
                  </p>
                </div>
                <button
                  class="p-2 rounded-lg transition-all duration-200"
                  on:click={() => toggleAllowBots(currentEditStarboard.id, currentEditStarboard.allowBots)}
                  style="background: {$colorStore.primary}20;
                         color: {$colorStore.text};"
                  aria-label={currentEditStarboard.allowBots ? "Disable bot messages" : "Enable bot messages"}
                >
                  {#if currentEditStarboard.allowBots}
                    <ToggleRight size={24} />
                  {:else}
                    <ToggleLeft size={24} />
                  {/if}
                </button>
              </div>

              <!-- Remove on Delete -->
              <div class="flex items-center justify-between">
                <div>
                  <p style="color: {$colorStore.text}">Remove on Delete</p>
                  <p class="text-sm" style="color: {$colorStore.muted}">
                    {currentEditStarboard.removeOnDelete
                      ? 'Starred messages are removed when original is deleted'
                      : 'Starred messages remain when original is deleted'}
                  </p>
                </div>
                <button
                  class="p-2 rounded-lg transition-all duration-200"
                  on:click={() => toggleRemoveOnDelete(currentEditStarboard.id, currentEditStarboard.removeOnDelete)}
                  style="background: {$colorStore.primary}20;
                         color: {$colorStore.text};"
                  aria-label={currentEditStarboard.removeOnDelete ? "Disable remove on delete" : "Enable remove on delete"}
                >
                  {#if currentEditStarboard.removeOnDelete}
                    <ToggleRight size={24} />
                  {:else}
                    <ToggleLeft size={24} />
                  {/if}
                </button>
              </div>

              <!-- Remove on Reactions Clear -->
              <div class="flex items-center justify-between">
                <div>
                  <p style="color: {$colorStore.text}">Remove on Reactions Clear</p>
                  <p class="text-sm" style="color: {$colorStore.muted}">
                    {currentEditStarboard.removeOnReactionsClear
                      ? 'Starred messages are removed when reactions are cleared'
                      : 'Starred messages remain when reactions are cleared'}
                  </p>
                </div>
                <button
                  class="p-2 rounded-lg transition-all duration-200"
                  on:click={() => toggleRemoveOnClear(currentEditStarboard.id, currentEditStarboard.removeOnReactionsClear)}
                  style="background: {$colorStore.primary}20;
                         color: {$colorStore.text};"
                  aria-label={currentEditStarboard.removeOnReactionsClear ? "Disable remove on clear" : "Enable remove on clear"}
                >
                  {#if currentEditStarboard.removeOnReactionsClear}
                    <ToggleRight size={24} />
                  {:else}
                    <ToggleLeft size={24} />
                  {/if}
                </button>
              </div>

              <!-- Remove Below Threshold -->
              <div class="flex items-center justify-between">
                <div>
                  <p style="color: {$colorStore.text}">Remove Below Threshold</p>
                  <p class="text-sm" style="color: {$colorStore.muted}">
                    {currentEditStarboard.removeBelowThreshold
                      ? 'Starred messages are removed when they fall below threshold'
                      : 'Starred messages remain when they fall below threshold'}
                  </p>
                </div>
                <button
                  class="p-2 rounded-lg transition-all duration-200"
                  on:click={() => toggleRemoveBelowThreshold(currentEditStarboard.id, currentEditStarboard.removeBelowThreshold)}
                  style="background: {$colorStore.primary}20;
                         color: {$colorStore.text};"
                  aria-label={currentEditStarboard.removeBelowThreshold ? "Disable remove below threshold" : "Enable remove below threshold"}
                >
                  {#if currentEditStarboard.removeBelowThreshold}
                    <ToggleRight size={24} />
                  {:else}
                    <ToggleLeft size={24} />
                  {/if}
                </button>
              </div>

              <!-- Use Blacklist Mode -->
              <div class="flex items-center justify-between">
                <div>
                  <p style="color: {$colorStore.text}">Channel Mode</p>
                  <p class="text-sm" style="color: {$colorStore.muted}">
                    {currentEditStarboard.useBlacklist
                      ? 'Blacklist: Listed channels are ignored'
                      : 'Whitelist: Only listed channels are checked'}
                  </p>
                </div>
                <button
                  class="p-2 rounded-lg transition-all duration-200"
                  on:click={() => toggleUseBlacklist(currentEditStarboard.id, currentEditStarboard.useBlacklist)}
                  style="background: {$colorStore.primary}20;
                         color: {$colorStore.text};"
                  aria-label={currentEditStarboard.useBlacklist ? "Use whitelist mode" : "Use blacklist mode"}
                >
                  {#if currentEditStarboard.useBlacklist}
                    <ToggleRight size={24} />
                  {:else}
                    <ToggleLeft size={24} />
                  {/if}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            class="px-4 py-2 rounded-lg"
            on:click={() => { showSettingsModal = false; currentEditStarboard = null; }}
            style="background: {$colorStore.primary}20;
                   color: {$colorStore.text};"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Channel Management Modal -->
  {#if showChannelsModal && currentEditStarboard}
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      transition:fade={{ duration: 200 }}
    >
      <div
        class="bg-gray-900/90 rounded-xl p-6 max-w-xl w-full mx-4 border shadow-2xl overflow-y-auto max-h-[90vh]"
        style="border-color: {$colorStore.primary}30;"
      >
        <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text}">Manage Channels</h3>
        <p class="mb-4" style="color: {$colorStore.muted}">
          {currentEditStarboard.useBlacklist
            ? 'Blacklist Mode: Listed channels will be ignored'
            : 'Whitelist Mode: Only listed channels will be checked'}
        </p>

        <div class="space-y-4">
          <!-- Add Channel -->
          <div>
            <label class="block text-sm mb-2" style="color: {$colorStore.muted}">
              Add/Remove Channel
            </label>
            <div class="flex gap-2">
              <div class="flex-1">
                <DiscordSelector
                  type="channel"
                  options={guildTextChannels}
                  selected={selectedChannelId}
                  placeholder="Select a channel"
                  on:change={(e) => {
                    selectedChannelId = e.detail.selected || "";
                  }}
                />
              </div>
              <button
                class="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                on:click={toggleChannelInList}
                disabled={!selectedChannelId}
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};
                       opacity: {!selectedChannelId ? '0.5' : '1'};"
              >
                <ExternalLink size={16} />
                <span>Toggle</span>
              </button>
            </div>
          </div>

          <!-- Channel List -->
          <div>
            <h4 class="font-medium mb-2" style="color: {$colorStore.text}">
              {currentEditStarboard.useBlacklist ? 'Blacklisted' : 'Whitelisted'} Channels
            </h4>
            <div
              class="p-3 rounded-lg max-h-64 overflow-y-auto"
              style="background: {$colorStore.primary}15;"
            >
              {#if parsedCheckedChannels.length === 0}
                <p class="text-sm italic" style="color: {$colorStore.muted}">
                  No channels {currentEditStarboard.useBlacklist ? 'blacklisted' : 'whitelisted'}
                </p>
              {:else}
                <ul class="space-y-2">
                  {#each parsedCheckedChannels as channelId}
                    <li class="flex items-center justify-between p-2 rounded-lg"
                        style="background: {$colorStore.primary}10;">
                      <span style="color: {$colorStore.text}">#{getChannelName(channelId)}</span>
                      <button
                        class="p-1 rounded transition-all duration-200"
                        on:click={() => { selectedChannelId = channelId; toggleChannelInList(); }}
                        style="background: {$colorStore.accent}20;
                               color: {$colorStore.accent};"
                        aria-label="Remove channel"
                      >
                        <Filter size={16} />
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            class="px-4 py-2 rounded-lg"
            on:click={() => { showChannelsModal = false; currentEditStarboard = null; selectedStarboardId = null; }}
            style="background: {$colorStore.primary}20;
                   color: {$colorStore.text};"
          >
            Close
          </button>
        </div>
      </div>
    </div>
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