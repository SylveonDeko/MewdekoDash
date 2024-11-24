<!-- routes/dashboard/suggestions/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade, slide } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { type SuggestionsModel, type GuildConfig, SuggestionState } from "$lib/types/models.ts";
  import Notification from "$lib/Notification.svelte";
  import { browser } from "$app/environment";
  import { currentUser } from "$lib/stores/currentUserStore.ts";

  // Tab and View States
  let activeTab: "suggestions" | "settings" = "suggestions";
  let isMobile = false;
  let isMenuOpen = false;

  // Settings State
  let minLength = 0;
  let maxLength = 2000;
  let acceptMessage: string | null = "";
  let denyMessage: string | null = "";
  let considerMessage: string | null = "";
  let implementMessage: string | null = "";
  let acceptChannel = "";
  let denyChannel = "";
  let considerChannel = "";
  let implementChannel = "";
  let suggestChannel = "";
  let threadType = 0;
  let suggestButtonMessage: string | null = "";
  let suggestButtonLabel: string | null = "";
  let suggestButtonEmote: string | null = "";
  let suggestEmotes: string | null = "";
  let archiveOnDeny = false;
  let archiveOnAccept = false;
  let archiveOnConsider = false;
  let archiveOnImplement = false;
  let suggestButtonChannel: bigint | null = null;

  // Status Change Modal State
  let showStatusModal = false;
  let statusChangeReason = "";
  let selectedSuggestion: SuggestionsModel | null = null;
  let selectedStatus: SuggestionState | null = null;

  let channels: Array<{ id: string; name: string }> = [];
  let loading = true;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let settingsTab = "general";
  let changedSettings = new Set<string>();
  let suggestions: SuggestionsModel[] = [];
  let guildConfig: GuildConfig;
  let error: string | null = null;
  let sortBy: "dateAdded" | "currentState" = "dateAdded";
  let sortDirection: "asc" | "desc" = "desc";
  let expandedSuggestion: number | null = null;

  // Reactive sortedSuggestions
  $: sortedSuggestions = [...suggestions].sort((a, b) => {
    if (sortBy === "dateAdded") {
      const dateA = new Date(a.dateAdded).getTime();
      const dateB = new Date(b.dateAdded).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      if (a.currentState < b.currentState) return sortDirection === "asc" ? -1 : 1;
      if (a.currentState > b.currentState) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
  });

  $: hasChanges = changedSettings.size > 0;

  // Helper Functions
  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function getButtonClass(active: boolean) {
    return `px-3 py-2 text-sm md:px-4 md:py-2 md:text-base ${
      active ? "bg-blue-600" : "bg-gray-700"
    } text-white rounded-lg transition-colors hover:bg-opacity-90 w-full md:w-auto`;
  }

  function getActionButtonClass(color: string) {
    return `px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm bg-${color}-600 text-white rounded
    hover:bg-${color}-700 transition-colors flex-1 md:flex-none whitespace-nowrap`;
  }

  function toggleSortDirection() {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  }

  function markAsChanged(setting: string) {
    changedSettings = changedSettings.add(setting);
  }

  function getStatusString(state: SuggestionState): string {
    const statusMap = {
      [SuggestionState.Pending]: "Pending",
      [SuggestionState.Accepted]: "Accepted",
      [SuggestionState.Denied]: "Denied",
      [SuggestionState.Considered]: "Considered",
      [SuggestionState.Implemented]: "Implemented"
    };
    return statusMap[state] || "Unknown";
  }

  function getStateColor(state: SuggestionState): string {
    const colorMap = {
      [SuggestionState.Pending]: "bg-yellow-500",
      [SuggestionState.Accepted]: "bg-green-500",
      [SuggestionState.Denied]: "bg-red-500",
      [SuggestionState.Considered]: "bg-blue-500",
      [SuggestionState.Implemented]: "bg-purple-500"
    };
    return colorMap[state] || "bg-gray-500";
  }

  function getEmotes(): string[] {
  if (suggestEmotes && typeof suggestEmotes === 'object' && 'data' in suggestEmotes) {
    return suggestEmotes.data.split(",").map(emote => emote.trim());
  } else if (typeof suggestEmotes === 'string' && suggestEmotes.length > 0) {
    return suggestEmotes.split(",").map(emote => emote.trim());
  }
  return ["👍", "👎"];
}

  function getEmoteCounts(suggestion: SuggestionsModel): number[] {
    const emotes = getEmotes();
    return Array.from({ length: emotes.length }, (_, i) =>
      suggestion[`emoteCount${i + 1}`] || 0
    );
  }

  function renderEmote(emote: string): string {
  const customEmoteMatch = emote.match(/<(a)?:(\w+):(\d+)>/);
  if (customEmoteMatch) {
    const [, animated, emoteName, emoteId] = customEmoteMatch;
    const extension = animated ? "gif" : "png";
    return `<img
      src="https://cdn.discordapp.com/emojis/${emoteId}.${extension}"
      alt="${emoteName}"
      class="inline-block w-6 h-6"
      loading="lazy"
    >`;
  }
  return emote;
}

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  // Modal Control Functions
  function initiateStatusChange(suggestion: SuggestionsModel, status: SuggestionState) {
    selectedSuggestion = suggestion;
    selectedStatus = status;
    statusChangeReason = "";
    showStatusModal = true;
  }

  async function confirmStatusChange() {
    if (!selectedSuggestion || selectedStatus === null || !$currentGuild?.id) return;

    try {
      await api.updateSuggestionStatus($currentGuild.id, selectedSuggestion.suggestionId, {
        state: selectedStatus,
        reason: statusChangeReason || null,
        userId: $currentUser.id
      });

      selectedSuggestion.currentState = selectedStatus;
      showNotificationMessage("Suggestion status updated", "success");
      closeStatusModal();
    } catch (error) {
      showNotificationMessage("Failed to update suggestion status: " + error.message, "error");
    }
  }

  function closeStatusModal() {
    showStatusModal = false;
    statusChangeReason = "";
    selectedSuggestion = null;
    selectedStatus = null;
  }

  // Data Loading Functions
  async function loadSettings() {
    if (!$currentGuild?.id) return;
    try {
      const [
        fetchedMinLength,
        fetchedMaxLength,
        fetchedAcceptMessage,
        fetchedDenyMessage,
        fetchedConsiderMessage,
        fetchedImplementMessage,
        fetchedAcceptChannel,
        fetchedDenyChannel,
        fetchedConsiderChannel,
        fetchedImplementChannel,
        fetchedSuggestChannel,
        fetchedThreadType,
        fetchedArchiveOnDeny,
        fetchedArchiveOnAccept,
        fetchedArchiveOnConsider,
        fetchedArchiveOnImplement,
        fetchedSuggestEmotes,
        fetchedButtonMessage,
        fetchedButtonLabel,
        fetchedButtonEmote,
        fetchedButtonChannel
      ] = await Promise.all([
        api.getMinLength($currentGuild.id),
        api.getMaxLength($currentGuild.id),
        api.getAcceptMessage($currentGuild.id),
        api.getDenyMessage($currentGuild.id),
        api.getConsiderMessage($currentGuild.id),
        api.getImplementMessage($currentGuild.id),
        api.getAcceptChannel($currentGuild.id),
        api.getDenyChannel($currentGuild.id),
        api.getConsiderChannel($currentGuild.id),
        api.getImplementChannel($currentGuild.id),
        api.getSuggestChannel($currentGuild.id),
        api.getSuggestThreadsType($currentGuild.id),
        api.getArchiveOnDeny($currentGuild.id),
        api.getArchiveOnAccept($currentGuild.id),
        api.getArchiveOnConsider($currentGuild.id),
        api.getArchiveOnImplement($currentGuild.id),
        api.getSuggestEmotes($currentGuild.id),
        api.getSuggestButtonMessage($currentGuild.id),
        api.getSuggestButtonLabel($currentGuild.id),
        api.getSuggestButtonEmote($currentGuild.id),
        api.getSuggestButtonChannel($currentGuild.id)
      ]);

      minLength = fetchedMinLength;
      maxLength = fetchedMaxLength;
      acceptMessage = fetchedAcceptMessage || "";
      denyMessage = fetchedDenyMessage || "";
      considerMessage = fetchedConsiderMessage || "";
      implementMessage = fetchedImplementMessage || "";
      acceptChannel = fetchedAcceptChannel && fetchedAcceptChannel !== 0n ? fetchedAcceptChannel.toString() : "";
      denyChannel = fetchedDenyChannel && fetchedDenyChannel !== 0n ? fetchedDenyChannel.toString() : "";
      considerChannel = fetchedConsiderChannel && fetchedConsiderChannel !== 0n ? fetchedConsiderChannel.toString() : "";
      implementChannel = fetchedImplementChannel && fetchedImplementChannel !== 0n ? fetchedImplementChannel.toString() : "";
      suggestChannel = fetchedSuggestChannel && fetchedSuggestChannel !== 0n ? fetchedSuggestChannel.toString() : "";
      threadType = fetchedThreadType;
      archiveOnDeny = fetchedArchiveOnDeny;
      archiveOnAccept = fetchedArchiveOnAccept;
      archiveOnConsider = fetchedArchiveOnConsider;
      archiveOnImplement = fetchedArchiveOnImplement;
      suggestEmotes = fetchedSuggestEmotes || null;
      suggestButtonMessage = fetchedButtonMessage || "";
      suggestButtonLabel = fetchedButtonLabel || "";
      suggestButtonEmote = fetchedButtonEmote || "";
      suggestButtonChannel = fetchedButtonChannel;
    } catch (err) {
      console.error("Failed to load settings:", err);
      showNotificationMessage("Failed to load settings", "error");
    }
  }

  async function fetchChannels() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      channels = await api.getGuildTextChannels($currentGuild.id);
    } catch (err) {
      console.error("Failed to fetch channels:", err);
      showNotificationMessage("Failed to fetch channels", "error");
    }
  }

  async function fetchGuildConfig() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      guildConfig = await api.getGuildConfig($currentGuild.id);
    } catch (err) {
      console.error("Failed to fetch guild config:", err);
      error = err.message || "Failed to fetch guild config";
    }
  }

  async function fetchSuggestions() {
    try {
      loading = true;
      error = null;
      if (!$currentGuild?.id) throw new Error("No guild selected");
      const fetched = await api.getSuggestions($currentGuild.id);

      if (fetched === null || fetched.length === 0) {
        suggestions = [];
        return;
      }

      const suggestionsWithUsers = await Promise.all(
        fetched.map(async (suggestion) => {
          const userResponse = await api.getUser(suggestion.guildId, suggestion.userId);
          return { ...suggestion, user: userResponse };
        })
      );

      suggestions = suggestionsWithUsers;
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      error = err.message || "Failed to fetch suggestions";
    } finally {
      loading = false;
    }
  }

  async function saveSettings() {
    if (!$currentGuild?.id || changedSettings.size === 0) return;

    try {
      const updatePromises = [];

      if (changedSettings.has("minLength")) {
        updatePromises.push(api.setMinLength($currentGuild.id, minLength));
      }
      if (changedSettings.has("maxLength")) {
        updatePromises.push(api.setMaxLength($currentGuild.id, maxLength));
      }
      if (changedSettings.has("acceptMessage")) {
        updatePromises.push(api.setAcceptMessage($currentGuild.id, acceptMessage));
      }
      if (changedSettings.has("denyMessage")) {
        updatePromises.push(api.setDenyMessage($currentGuild.id, denyMessage));
      }
      if (changedSettings.has("considerMessage")) {
        updatePromises.push(api.setConsiderMessage($currentGuild.id, considerMessage));
      }
      if (changedSettings.has("implementMessage")) {
        updatePromises.push(api.setImplementMessage($currentGuild.id, implementMessage));
      }
      if (changedSettings.has("acceptChannel")) {
        updatePromises.push(api.setAcceptChannel($currentGuild.id, acceptChannel ? BigInt(acceptChannel) : 0n));
      }
      if (changedSettings.has("denyChannel")) {
        updatePromises.push(api.setDenyChannel($currentGuild.id, denyChannel ? BigInt(denyChannel) : 0n));
      }
      if (changedSettings.has("considerChannel")) {
        updatePromises.push(api.setConsiderChannel($currentGuild.id, considerChannel ? BigInt(considerChannel) : 0n));
      }
      if (changedSettings.has("implementChannel")) {
        updatePromises.push(api.setImplementChannel($currentGuild.id, implementChannel ? BigInt(implementChannel) : 0n));
      }
      if (changedSettings.has("suggestChannel")) {
        updatePromises.push(api.setSuggestChannel($currentGuild.id, suggestChannel ? BigInt(suggestChannel) : 0n));
      }
      if (changedSettings.has("threadType")) {
        updatePromises.push(api.setSuggestThreadsType($currentGuild.id, threadType));
      }
     if (changedSettings.has("archiveOnDeny")) {
      const response = await api.setArchiveOnDeny($currentGuild.id, Boolean(archiveOnDeny));
      if ('error' in response) {
        throw new Error(
          response.error.errors?.$?.[0] ||
          response.error.message ||
          'Failed to update archive setting'
        );
      }
    }

    if (changedSettings.has("archiveOnAccept")) {
      const response = await api.setArchiveOnAccept($currentGuild.id, Boolean(archiveOnAccept));
      if ('error' in response) {
        throw new Error(
          response.error.errors?.$?.[0] ||
          response.error.message ||
          'Failed to update archive setting'
        );
      }
    }

    if (changedSettings.has("archiveOnConsider")) {
      const response = await api.setArchiveOnConsider($currentGuild.id, Boolean(archiveOnConsider));
      if ('error' in response) {
        throw new Error(
          response.error.errors?.$?.[0] ||
          response.error.message ||
          'Failed to update archive setting'
        );
      }
    }

    if (changedSettings.has("archiveOnImplement")) {
      const response = await api.setArchiveOnImplement($currentGuild.id, Boolean(archiveOnImplement));
      if ('error' in response) {
        throw new Error(
          response.error.errors?.$?.[0] ||
          response.error.message ||
          'Failed to update archive setting'
        );
      }
    }
      if (changedSettings.has("suggestEmotes")) {
        updatePromises.push(api.setSuggestEmotes($currentGuild.id, suggestEmotes));
      }
      if (changedSettings.has("suggestButtonMessage")) {
        updatePromises.push(api.setSuggestButtonMessage($currentGuild.id, suggestButtonMessage));
      }
      if (changedSettings.has("suggestButtonLabel")) {
        updatePromises.push(api.setSuggestButtonLabel($currentGuild.id, suggestButtonLabel));
      }
      if (changedSettings.has("suggestButtonEmote")) {
        updatePromises.push(api.setSuggestButtonEmote($currentGuild.id, suggestButtonEmote));
      }
      if (changedSettings.has("suggestButtonChannel")) {
        updatePromises.push(api.setSuggestButtonChannel($currentGuild.id, suggestButtonChannel));
      }

      await Promise.all(updatePromises);
      changedSettings.clear();
      showNotificationMessage("Settings saved successfully", "success");
    } catch (err) {
      console.error("Failed to save settings:", err);
      showNotificationMessage("Failed to save settings", "error");
    }
  }

  async function deleteSuggestion(id: number) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      await api.deleteSuggestion($currentGuild.id, id);
      suggestions = suggestions.filter(s => s.id !== id);
      showNotificationMessage("Suggestion deleted successfully", "success");
    } catch (error) {
      showNotificationMessage("Failed to delete suggestion: " + error.message, "error");
    }
  }

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    checkMobile();
    if (browser) {
      window.addEventListener("resize", checkMobile);
      await Promise.all([
        fetchSuggestions(),
        fetchChannels(),
        fetchGuildConfig(),
        loadSettings()
      ]);
    }

    return () => {
      if (browser) {
        window.removeEventListener("resize", checkMobile);
      }
    };
  });
</script>

<svelte:head>
  <title>Suggestions - Mewdeko Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
  <div class="container mx-auto px-4 py-6 max-w-7xl">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <h1 class="text-xl md:text-2xl font-bold">Suggestions</h1>
      <div class="flex gap-2 w-full md:w-auto">
        <button
          class={getButtonClass(activeTab === 'suggestions')}
          on:click={() => activeTab = 'suggestions'}
        >
          Suggestions
        </button>
        <button
          class={getButtonClass(activeTab === 'settings')}
          on:click={() => activeTab = 'settings'}
        >
          Settings
        </button>
      </div>
    </div>

    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}

    <!-- Status Change Modal -->
    {#if showStatusModal}
      <div
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        transition:fade
      >
        <div
          class="bg-gray-800 rounded-lg p-6 w-full max-w-md"
          transition:slide
          role="dialog"
          aria-labelledby="status-modal-title"
        >
          <h2 id="status-modal-title" class="text-xl font-semibold mb-4">
            Update Status to {getStatusString(selectedStatus)}
          </h2>
          <div class="space-y-4">
            <div class="space-y-2">
              <label for="status-reason" class="block text-sm font-medium">
                Reason (optional)
              </label>
              <textarea
                id="status-reason"
                bind:value={statusChangeReason}
                class="w-full bg-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows="3"
                placeholder="Enter reason for status change..."
              ></textarea>
            </div>
            <div class="flex justify-end gap-3">
              <button
                class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                on:click={closeStatusModal}
              >
                Cancel
              </button>
              <button
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                on:click={confirmStatusChange}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if activeTab === 'suggestions'}
      <!-- Suggestions List Section -->
      {#if loading}
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      {:else if error}
        <div class="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-4">
          <p class="text-red-500">{error}</p>
        </div>
      {:else if suggestions.length === 0}
        <div class="text-center py-12" transition:fade>
          <p class="text-gray-400 text-lg">No suggestions found</p>
        </div>
      {:else}
        <div class="space-y-4">
          <!-- Sort Controls -->
          <div class="flex flex-col md:flex-row gap-2 mb-4">
            <select
              bind:value={sortBy}
              class="bg-gray-700 rounded-lg px-3 py-2 text-sm md:text-base focus:ring-2 focus:ring-blue-500"
              aria-label="Sort suggestions by"
            >
              <option value="dateAdded">Date Added</option>
              <option value="currentState">Status</option>
            </select>
            <button
              class="px-3 py-2 bg-gray-700 rounded-lg text-sm md:text-base hover:bg-gray-600 transition-colors"
              on:click={toggleSortDirection}
              aria-label={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
            >
              {sortDirection === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>

          <!-- Suggestions Cards -->
          {#each sortedSuggestions as suggestion (suggestion.id)}
            <div class="bg-gray-800 rounded-lg p-4">
              <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <img
                      src={suggestion.user?.avatarUrl}
                      alt=""
                      class="w-8 h-8 rounded-full"
                    />
                    <span class="font-semibold truncate">
                      {suggestion.user?.username}
                    </span>
                    <span class="px-2 py-1 text-xs rounded-full {getStateColor(suggestion.currentState)}">
                      {getStatusString(suggestion.currentState)}
                    </span>
                  </div>
                  <p class="text-gray-300 break-words">
                    {suggestion.suggestion}
                  </p>
                </div>

                <div class="flex flex-wrap md:flex-col gap-2">
                  <button
                    class={getActionButtonClass('green')}
                    on:click={() => initiateStatusChange(suggestion, SuggestionState.Accepted)}
                  >
                    Accept
                  </button>
                  <button
                    class={getActionButtonClass('red')}
                    on:click={() => initiateStatusChange(suggestion, SuggestionState.Denied)}
                  >
                    Deny
                  </button>
                  <button
                    class={getActionButtonClass('blue')}
                    on:click={() => initiateStatusChange(suggestion, SuggestionState.Considered)}
                  >
                    Consider
                  </button>
                  <button
                    class={getActionButtonClass('purple')}
                    on:click={() => initiateStatusChange(suggestion, SuggestionState.Implemented)}
                  >
                    Implement
                  </button>
                  <button
                    class={getActionButtonClass('gray')}
                    on:click={() => deleteSuggestion(suggestion.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-{getEmotes().length} gap-2">
                {#each getEmoteCounts(suggestion) as count, index}
                  <div class="text-sm text-gray-400 text-center bg-gray-700 rounded-lg p-2">
                    <span class="emoji-container" aria-label="Emote {index + 1}">
                      {@html renderEmote(getEmotes()[index])}
                    </span>
                    <span class="ml-2">{count} votes</span>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {:else}
      <div class="space-y-6">
        <!-- Settings Navigation -->
        <div class="relative -mx-4 px-4 md:mx-0 md:px-0">
          <div class="overflow-x-auto scrollbar-hide pb-2">
            <div class="flex space-x-2 min-w-max">
              {#each [
                { id: 'general', label: 'General', icon: '⚙️' },
                { id: 'messages', label: 'Messages', icon: '💬' },
                { id: 'channels', label: 'Channels', icon: '#️⃣' },
                { id: 'buttons', label: 'Buttons', icon: '🔘' },
                { id: 'archive', label: 'Archive', icon: '📂' },
                { id: 'emotes', label: 'Emotes', icon: '😀' }
              ] as tab}
                <button
                  class="px-3 py-2 rounded-lg flex items-center gap-2 text-sm md:text-base
              {settingsTab === tab.id ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}
              transition-colors whitespace-nowrap"
                  on:click={() => settingsTab = tab.id}
                  aria-selected={settingsTab === tab.id}
                  role="tab"
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              {/each}
            </div>
          </div>
        </div>

        <!-- Settings Content -->
        <div class="space-y-6">
          <!-- General Settings -->
          {#if settingsTab === 'general'}
            <div class="bg-gray-800 rounded-lg shadow-lg divide-y divide-gray-700">
              <div class="p-4 md:p-6">
                <h3 class="text-lg font-semibold mb-4">Length Settings</h3>
                <div class="grid gap-4 md:grid-cols-2">
                  <div class="space-y-2">
                    <label for="min-length" class="block text-sm font-medium text-gray-300">
                      Minimum Length
                    </label>
                    <input
                      id="min-length"
                      type="number"
                      min="0"
                      bind:value={minLength}
                      on:input={() => markAsChanged('minLength')}
                      class="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm md:text-base"
                      aria-label="Minimum suggestion length"
                    />
                  </div>
                  <div class="space-y-2">
                    <label for="max-length" class="block text-sm font-medium text-gray-300">
                      Maximum Length
                    </label>
                    <input
                      id="max-length"
                      type="number"
                      min="0"
                      bind:value={maxLength}
                      on:input={() => markAsChanged('maxLength')}
                      class="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm md:text-base"
                      aria-label="Maximum suggestion length"
                    />
                  </div>
                </div>
              </div>

              <div class="p-4 md:p-6">
                <h3 class="text-lg font-semibold mb-4">Thread Settings</h3>
                <div class="space-y-2">
                  <label for="thread-type" class="block text-sm font-medium text-gray-300">
                    Thread Type
                  </label>
                  <select
                    id="thread-type"
                    bind:value={threadType}
                    on:change={() => markAsChanged('threadType')}
                    class="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm md:text-base"
                  >
                    <option value={0}>No Threads</option>
                    <option value={1}>Regular Threads</option>
                    <option value={2}>Private Threads</option>
                  </select>
                </div>
              </div>
            </div>
          {/if}

          <!-- Messages Settings -->
          {#if settingsTab === 'messages'}
            <div class="space-y-4">
              {#each [
                { label: 'Accept Message', value: acceptMessage, key: 'acceptMessage' },
                { label: 'Deny Message', value: denyMessage, key: 'denyMessage' },
                { label: 'Consider Message', value: considerMessage, key: 'considerMessage' },
                { label: 'Implement Message', value: implementMessage, key: 'implementMessage' }
              ] as message}
                <div class="bg-gray-800 rounded-lg shadow-lg p-4">
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    {message.label}
                  </label>
                  <textarea
                    class="w-full bg-gray-700 rounded-lg px-3 py-2 min-h-[120px] resize-y
                focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm md:text-base"
                    bind:value={message.value}
                    on:input={() => markAsChanged(message.key)}
                    placeholder="Enter message template..."
                    aria-label={message.label}
                  ></textarea>
                  <p class="mt-2 text-xs text-gray-400">
                    Supports placeholders like %suggest.user%, %suggest.message%, etc.
                  </p>
                </div>
              {/each}
            </div>
          {/if}

          <!-- Channels Settings -->
          {#if settingsTab === 'channels'}
            <div class="space-y-4">
              {#each [
                { label: 'Suggest Channel', value: suggestChannel, key: 'suggestChannel' },
                { label: 'Accept Channel', value: acceptChannel, key: 'acceptChannel' },
                { label: 'Deny Channel', value: denyChannel, key: 'denyChannel' },
                { label: 'Consider Channel', value: considerChannel, key: 'considerChannel' },
                { label: 'Implement Channel', value: implementChannel, key: 'implementChannel' }
              ] as channel}
                <div class="bg-gray-800 rounded-lg shadow-lg p-4">
                  <label class="block text-sm font-medium text-gray-300 mb-2" for={channel.key}>
                    {channel.label}
                  </label>
                  <select
                    id={channel.key}
                    class="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm md:text-base"
                    bind:value={channel.value}
                    on:change={() => markAsChanged(channel.key)}
                  >
                    <option value="">Select Channel</option>
                    {#each channels as ch}
                      <option value={ch.id}>#{ch.name}</option>
                    {/each}
                  </select>
                </div>
              {/each}
            </div>
          {/if}

          <!-- Buttons Settings -->
          {#if settingsTab === 'buttons'}
            <div class="bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 class="text-lg font-semibold mb-4">Button Settings</h3>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label for="button-channel" class="block text-sm font-medium text-gray-300">
                    Button Channel
                  </label>
                  <select
                    id="button-channel"
                    class="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm md:text-base"
                    bind:value={suggestButtonChannel}
                    on:change={() => markAsChanged('suggestButtonChannel')}
                  >
                    <option value="">Select Channel</option>
                    {#each channels as ch}
                      <option value={ch.id}>#{ch.name}</option>
                    {/each}
                  </select>
                </div>

                <div class="space-y-2">
                  <label for="button-message" class="block text-sm font-medium text-gray-300">
                    Button Message
                  </label>
                  <input
                    id="button-message"
                    type="text"
                    bind:value={suggestButtonMessage}
                    class="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm md:text-base"
                    placeholder="Enter button message..."
                    on:input={() => markAsChanged('suggestButtonMessage')}
                  />
                </div>

                <div class="space-y-2">
                  <label for="button-label" class="block text-sm font-medium text-gray-300">
                    Button Label
                  </label>
                  <input
                    id="button-label"
                    type="text"
                    bind:value={suggestButtonLabel}
                    class="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm md:text-base"
                    placeholder="Enter button label..."
                    on:input={() => markAsChanged('suggestButtonLabel')}
                  />
                </div>

                <div class="space-y-2">
                  <label for="button-emote" class="block text-sm font-medium text-gray-300">
                    Button Emote
                  </label>
                  <input
                    id="button-emote"
                    type="text"
                    bind:value={suggestButtonEmote}
                    class="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm md:text-base"
                    placeholder="Enter button emote..."
                    on:input={() => markAsChanged('suggestButtonEmote')}
                  />
                </div>
              </div>
            </div>
          {/if}

          <!-- Archive Settings -->
          {#if settingsTab === 'archive'}
            <div class="bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 class="text-lg font-semibold mb-4">Archive Settings</h3>
              <div class="space-y-3">
                {#each [
                  { label: 'Archive on Deny', value: archiveOnDeny, key: 'archiveOnDeny' },
                  { label: 'Archive on Accept', value: archiveOnAccept, key: 'archiveOnAccept' },
                  { label: 'Archive on Consider', value: archiveOnConsider, key: 'archiveOnConsider' },
                  { label: 'Archive on Implement', value: archiveOnImplement, key: 'archiveOnImplement' }
                ] as archive}
                  <label class="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <span class="text-sm font-medium">{archive.label}</span>
                    <div class="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        class="sr-only peer"
                        bind:checked={archive.value}
                        on:change={() => markAsChanged(archive.key)}
                        aria-label={archive.label}
                      />
                      <div class="w-11 h-6 bg-gray-700 rounded-full peer
                    peer-checked:after:translate-x-full peer-checked:bg-blue-600
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                    after:bg-white after:rounded-full after:h-5 after:w-5
                    after:transition-all">
                      </div>
                    </div>
                  </label>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Emotes Settings -->
          {#if settingsTab === 'emotes'}
            <div class="bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 class="text-lg font-semibold mb-4">Emote Settings</h3>
              <div class="space-y-2">
                <label for="suggest-emotes" class="block text-sm font-medium text-gray-300">
                  Custom Emotes
                </label>
                <input
                  id="suggest-emotes"
                  type="text"
                  bind:value={suggestEmotes}
                  on:input={() => markAsChanged('suggestEmotes')}
                  class="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm md:text-base"
                  placeholder="Enter emotes separated by commas"
                />
                <p class="mt-2 text-sm text-gray-400">
                  Enter custom emotes separated by commas. Use Discord emoji format.
                </p>
              </div>
            </div>
          {/if}
        </div>

        <!-- Save Button -->
        {#if hasChanges}
          <div class="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-800 z-50">
            <div class="max-w-7xl mx-auto">
              <button
                class="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                on:click={saveSettings}
              >
                Save Changes
              </button>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
    :global(body) {
        @apply bg-gray-900;
    }

    .emoji-container {
        @apply inline-flex items-center justify-center;
    }

    /* Improve focus states */
    button:focus,
    input:focus,
    select:focus,
    textarea:focus {
        @apply outline-none ring-2 ring-blue-500 ring-opacity-50;
    }

    /* Ensure proper text contrast */
    select option {
        @apply bg-gray-700 text-white;
    }

    /* Add smooth transitions */
    button, input, select, textarea {
        @apply transition-all duration-200;
    }

    /* Improved touch targets on mobile */
    @media (max-width: 768px) {
        button, input, select {
            @apply min-h-[44px];
        }
    }

    /* Hide scrollbar for settings tabs */
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }

    /* Custom switch styling */
    input[type="checkbox"]:checked + div {
        @apply bg-blue-600;
    }

    input[type="checkbox"]:checked + div::after {
        @apply translate-x-full;
    }

    input[type="checkbox"]:focus + div {
        @apply ring-2 ring-blue-500 ring-opacity-50;
    }
</style>