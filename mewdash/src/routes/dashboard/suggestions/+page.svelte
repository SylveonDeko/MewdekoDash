<!-- routes/dashboard/suggestions/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade, slide } from "svelte/transition";
  import { type SuggestionsModel, SuggestionState } from "$lib/types/models.ts";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { browser } from "$app/environment";
  import { colorStore } from "$lib/stores/colorStore";
  import {
    AlertTriangle,
    Archive,
    ArrowDown,
    ArrowUp,
    Check,
    Hash,
    Inbox,
    MessageCircle,
    MessageSquare,
    Settings,
    Smile,
    Trash2,
    X
  } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { loadingStore } from "$lib/stores/loadingStore";

  export let data: PageData;

  let currentUser = data.user;

  // States
  let activeTab = "suggestions";
  let activeSubTab = "general";
  let isMobile = false;
  let loading = true;
  let error: string | null = null;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let changedSettings = new Set<string>();
  let showStatusModal = false;
  let statusChangeReason = "";
  let selectedSuggestion: SuggestionsModel | null = null;
  let selectedStatus: SuggestionState | null = null;

  let sortBy: "dateAdded" | "currentState" = "dateAdded";
  let sortDirection: "asc" | "desc" = "desc";

  // Data
  let suggestions: SuggestionsModel[] = [];
  let channels: Array<{ id: string; name: string }> = [];


  // Settings
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

  // Computed values
  $: hasChanges = changedSettings.size > 0;
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


  // Helper Functions
  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => showNotification = false, 3000);
  }

  function markAsChanged(setting: string) {
    changedSettings = changedSettings.add(setting);
  }

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  function getStatusString(state: SuggestionState): string {
    return {
      [SuggestionState.Pending]: "Pending",
      [SuggestionState.Accepted]: "Accepted",
      [SuggestionState.Denied]: "Denied",
      [SuggestionState.Considered]: "Considered",
      [SuggestionState.Implemented]: "Implemented"
    }[state] || "Unknown";
  }

  function getStateColor(state: SuggestionState): string {
    return {
      [SuggestionState.Pending]: $colorStore.primary,
      [SuggestionState.Accepted]: "#22c55e",
      [SuggestionState.Denied]: "#ef4444",
      [SuggestionState.Considered]: $colorStore.secondary,
      [SuggestionState.Implemented]: $colorStore.accent
    }[state] || $colorStore.muted;
  }

  function toggleSortDirection() {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  }

  // Modal Functions
  function initiateStatusChange(suggestion: SuggestionsModel, status: SuggestionState) {
    selectedSuggestion = suggestion;
    selectedStatus = status;
    statusChangeReason = "";
    showStatusModal = true;
  }

  function closeStatusModal() {
    showStatusModal = false;
    statusChangeReason = "";
    selectedSuggestion = null;
    selectedStatus = null;
  }

  // API Functions
  async function fetchSuggestions() {
    return await loadingStore.wrap("fetch-suggestions", async () => {
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
          try {
            const userResponse = await api.getUser(suggestion.guildId, suggestion.userId);
            return {
              ...suggestion,
              user: userResponse
            };
          } catch (err) {
            // Handle 404 or other errors for user fetch
            return {
              ...suggestion,
              user: {
                username: `Unknown User (${suggestion.userId})`,
                avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
                id: suggestion.userId
              }
            };
          }
        })
      );

        suggestions = suggestionsWithUsers;
      } catch (err) {
        error = err instanceof Error ? err.message : "Failed to fetch suggestions";
      } finally {
        loading = false;
      }
    }, "api", "Loading suggestions...");
  }

  async function loadSettings() {
    if (!$currentGuild?.id) return;
    return await loadingStore.wrap("load-settings", async () => {
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
      acceptChannel = fetchedAcceptChannel?.toString() || "";
      denyChannel = fetchedDenyChannel?.toString() || "";
      considerChannel = fetchedConsiderChannel?.toString() || "";
      implementChannel = fetchedImplementChannel?.toString() || "";
      suggestChannel = fetchedSuggestChannel?.toString() || "";
      threadType = fetchedThreadType;
      archiveOnDeny = fetchedArchiveOnDeny;
      archiveOnAccept = fetchedArchiveOnAccept;
      archiveOnConsider = fetchedArchiveOnConsider;
      archiveOnImplement = fetchedArchiveOnImplement;
      suggestEmotes = fetchedSuggestEmotes;
      suggestButtonMessage = fetchedButtonMessage || "";
      suggestButtonLabel = fetchedButtonLabel || "";
      suggestButtonEmote = fetchedButtonEmote || "";
        suggestButtonChannel = fetchedButtonChannel;
      } catch (err) {
        showNotificationMessage("Failed to load settings", "error");
      }
    }, "api", "Loading settings...");
  }

  async function fetchChannels() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      channels = await api.getGuildTextChannels($currentGuild.id);
    } catch (err) {
      showNotificationMessage("Failed to fetch channels", "error");
    }
  }

  async function saveSettings() {
    if (!$currentGuild?.id || changedSettings.size === 0) return;

    return await loadingStore.wrap("save-settings", async () => {
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
        updatePromises.push(api.setArchiveOnDeny($currentGuild.id, archiveOnDeny));
      }
      if (changedSettings.has("archiveOnAccept")) {
        updatePromises.push(api.setArchiveOnAccept($currentGuild.id, archiveOnAccept));
      }
      if (changedSettings.has("archiveOnConsider")) {
        updatePromises.push(api.setArchiveOnConsider($currentGuild.id, archiveOnConsider));
      }
      if (changedSettings.has("archiveOnImplement")) {
        updatePromises.push(api.setArchiveOnImplement($currentGuild.id, archiveOnImplement));
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
        showNotificationMessage("Settings saved successfully");
      } catch (err) {
        showNotificationMessage("Failed to save settings", "error");
      }
    }, "operation", "Saving settings...");
  }

  async function confirmStatusChange() {
    if (!selectedSuggestion || selectedStatus === null || !$currentGuild?.id) return;

    return await loadingStore.wrap("update-status", async () => {
      try {
      await api.updateSuggestionStatus($currentGuild.id, selectedSuggestion.suggestionId, {
        state: selectedStatus,
        reason: statusChangeReason || null,
        userId: currentUser.id
      });

        await fetchSuggestions();
        showNotificationMessage("Status updated successfully");
        closeStatusModal();
      } catch (err) {
        showNotificationMessage("Failed to update status", "error");
      }
    }, "operation", "Updating status...");
  }

  async function deleteSuggestion(id: number) {
    return await loadingStore.wrap("delete-suggestion", async () => {
      try {
        if (!$currentGuild?.id) throw new Error("No guild selected");
        await api.deleteSuggestion($currentGuild.id, id);
        await fetchSuggestions();
        showNotificationMessage("Suggestion deleted successfully");
      } catch (err) {
        showNotificationMessage("Failed to delete suggestion", "error");
      }
    }, "operation", "Deleting suggestion...");
  }

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    checkMobile();
    if (browser) {
      window.addEventListener("resize", checkMobile);
      await Promise.all([
        fetchSuggestions(),
        fetchChannels(),
        loadSettings()
      ]);
    }

    return () => {
      if (browser) window.removeEventListener("resize", checkMobile);
    };
  });

  $: if ($currentInstance) {
    Promise.all([
      fetchSuggestions(),
      fetchChannels(),
      loadSettings()
    ]);
  }

  $: if ($currentGuild) {
    Promise.all([
      fetchSuggestions(),
      fetchChannels(),
      loadSettings()
    ]);
  }

</script>


<DashboardPageLayout 
  title="Suggestions" 
  subtitle="Manage and configure server suggestions" 
  icon={MessageCircle}
  guildName={$currentGuild?.name || "Dashboard"}
  tabs={[
    { id: "suggestions", label: "Suggestions", icon: Inbox },
    { id: "settings", label: "Settings", icon: Settings }
  ]}
  bind:activeTab
  subTabs={[
    { id: "general", label: "General", parentTab: "settings" },
    { id: "messages", label: "Messages", parentTab: "settings" },
    { id: "channels", label: "Channels", parentTab: "settings" },
    { id: "archive", label: "Archive", parentTab: "settings" },
    { id: "emotes", label: "Emotes", parentTab: "settings" }
  ]}
  bind:activeSubTab
  on:tabChange={(e) => {
    if (e.detail.tabId === 'suggestions') {
      activeSubTab = '';
    } else if (e.detail.tabId === 'settings' && !activeSubTab) {
      activeSubTab = 'general';
    }
  }}
  on:subTabChange={(e) => {
    activeSubTab = e.detail.tabId;
  }}
  actionButtons={hasChanges ? [
    {
      label: "Save Settings",
      icon: Check,
      action: saveSettings,
      style: `background: linear-gradient(to right, ${$colorStore.primary}, ${$colorStore.secondary}); color: ${$colorStore.text}; box-shadow: 0 0 20px ${$colorStore.primary}20;`
    }
  ] : []}
>
  <svelte:fragment slot="status-messages">
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}
  </svelte:fragment>

    <!-- Status Change Modal -->
    {#if showStatusModal}
      <div
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        transition:fade
      >
        <div
          class="w-full max-w-md rounded-xl border p-6"
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                 border-color: {$colorStore.primary}30;"
          transition:slide
        >
          <h2 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">
            Update Status to {selectedStatus !== null ? getStatusString(selectedStatus) : ''}
          </h2>
          <textarea
            bind:value={statusChangeReason}
            class="w-full min-h-[100px] p-3 rounded-lg mb-4 resize-none"
            style="background: {$colorStore.primary}10;
                   border: 1px solid {$colorStore.primary}30;
                   color: {$colorStore.text};"
            placeholder="Enter reason for status change (optional)..."
          ></textarea>
          <div class="flex gap-2 justify-end">
            <button
              class="px-4 py-2 rounded-lg transition-colors"
              style="background: {$colorStore.primary}20;
                     color: {$colorStore.text};"
              on:click={closeStatusModal}
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 rounded-lg transition-colors"
              style="background: {$colorStore.primary};
                     color: {$colorStore.text};"
              on:click={confirmStatusChange}
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Main Content -->
    {#if activeTab === 'suggestions'}
      <div
        class="rounded-2xl border p-6"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
      >
        {#if loading}
          <div class="flex justify-center items-center min-h-[200px]">
            <div
              class="w-12 h-12 border-4 rounded-full animate-spin"
              style="border-color: {$colorStore.primary}20;
                     border-top-color: {$colorStore.primary};"
            ></div>
          </div>
        {:else if error}
          <div
            class="rounded-lg p-4 flex items-center gap-3"
            style="background: {$colorStore.accent}10;"
          >
            <AlertTriangle class="w-5 h-5" style="color: {$colorStore.accent}" />
            <p style="color: {$colorStore.accent}">{error}</p>
          </div>
        {:else if suggestions.length === 0}
          <div class="text-center py-12">
            <Inbox
              class="w-16 h-16 mx-auto mb-4"
              style="color: {$colorStore.muted}"
            />
            <p style="color: {$colorStore.muted}">No suggestions found</p>
          </div>
        {:else}
          <!-- Sort Controls -->
          <div class="flex flex-wrap gap-2 mb-6">
            <DiscordSelector
              type="custom"
              options={[
                { id: "dateAdded", name: "Sort by Date", label: "Sort by Date" },
                { id: "currentState", name: "Sort by Status", label: "Sort by Status" }
              ]}
              selected={sortBy}
              searchable={false}
              placeholder="Sort by..."
              on:change={(e) => sortBy = e.detail.selected}
            />
            <button
              class="px-3 py-2 rounded-lg border flex items-center gap-2"
              style="border-color: {$colorStore.primary}30;
                     color: {$colorStore.text};"
              on:click={toggleSortDirection}
            >
              {#if sortDirection === 'asc'}
                <ArrowUp class="w-4 h-4" />
              {:else}
                <ArrowDown class="w-4 h-4" />
              {/if}
              {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>

          <!-- Suggestions List -->
          <div class="space-y-4">
            {#each sortedSuggestions as suggestion (suggestion.id)}
              <div
                class="rounded-xl border overflow-hidden "
                style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                       border-color: {$colorStore.primary}30;"
              >
                <!-- Suggestion Header -->
                <div
                  class="p-4 flex items-start justify-between gap-4"
                  style="border-bottom: 1px solid {$colorStore.primary}30;"
                >
                  <div class="flex items-center gap-3">
                    <img
                      src={suggestion.user?.avatarUrl}
                      alt=""
                      class="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p class="font-medium" style="color: {$colorStore.text}">
                        {suggestion.user?.username}
                      </p>
                      <p class="text-sm" style="color: {$colorStore.muted}">
                        {new Date(suggestion.dateAdded).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div
                    class="px-3 py-1 rounded-full text-sm"
                    style="background: {getStateColor(suggestion.currentState)}20;
                           color: {getStateColor(suggestion.currentState)};"
                  >
                    {getStatusString(suggestion.currentState)}
                  </div>
                </div>

                <!-- Suggestion Content -->
                <div class="p-4">
                  <p class="mb-4 break-words" style="color: {$colorStore.text}">
                    {suggestion.suggestion1}
                  </p>

                  <!-- Action Buttons -->
                  <div class="flex flex-wrap gap-2">
                    <button
                      class="px-3 py-1 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      style="background: #22c55e20;
                             color: #22c55e;"
                      on:click={() => initiateStatusChange(suggestion, SuggestionState.Accepted)}
                    >
                      <Check class="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      class="px-3 py-1 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      style="background: #ef444420;
                             color: #ef4444;"
                      on:click={() => initiateStatusChange(suggestion, SuggestionState.Denied)}
                    >
                      <X class="w-4 h-4" />
                      Deny
                    </button>
                    <button
                      class="px-3 py-1 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      style="background: {$colorStore.secondary}20;
                             color: {$colorStore.secondary};"
                      on:click={() => initiateStatusChange(suggestion, SuggestionState.Considered)}
                    >
                      <MessageCircle class="w-4 h-4" />
                      Consider
                    </button>
                    <button
                      class="px-3 py-1 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      style="background: {$colorStore.accent}20;
                             color: {$colorStore.accent};"
                      on:click={() => initiateStatusChange(suggestion, SuggestionState.Implemented)}
                    >
                      <Check class="w-4 h-4" />
                      Implement
                    </button>
                    <button
                      class="px-3 py-1 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      style="background: {$colorStore.primary}20;
                             color: {$colorStore.muted};"
                      on:click={() => deleteSuggestion(suggestion.id)}
                    >
                      <Trash2 class="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <!-- Settings Content -->
      <div class="space-y-6">
        <!-- Settings Panels -->
        {#if activeSubTab === 'general'}
          <div
            class="rounded-2xl border p-6 space-y-6"
            style="background: linear-gradient(135deg,
                     {$colorStore.gradientStart}10,
                     {$colorStore.gradientMid}15);
                   border-color: {$colorStore.primary}30;"
          >
            <div class="space-y-4">
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">Length Settings</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label for="min-length" class="block text-sm" style="color: {$colorStore.muted}">
                    Minimum Length
                  </label>
                  <input
                    id="min-length"
                    type="number"
                    bind:value={minLength}
                    on:input={() => markAsChanged('minLength')}
                    class="w-full p-3 rounded-lg"
                    style="background: {$colorStore.primary}10;
                           border: 1px solid {$colorStore.primary}30;
                           color: {$colorStore.text};"
                  />
                </div>
                <div class="space-y-2">
                  <label for="max-length" class="block text-sm" style="color: {$colorStore.muted}">
                    Maximum Length
                  </label>
                  <input
                    id="max-length"
                    type="number"
                    bind:value={maxLength}
                    on:input={() => markAsChanged('maxLength')}
                    class="w-full p-3 rounded-lg"
                    style="background: {$colorStore.primary}10;
                           border: 1px solid {$colorStore.primary}30;
                           color: {$colorStore.text};"
                  />
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">Thread Settings</h3>
              <div class="space-y-2">
                <label class="block text-sm" style="color: {$colorStore.muted}">Thread Type</label>
                <DiscordSelector
                  type="custom"
                  options={[
                    { id: "0", name: "No Threads", label: "No Threads" },
                    { id: "1", name: "Regular Threads", label: "Regular Threads" },
                    { id: "2", name: "Private Threads", label: "Private Threads" }
                  ]}
                  selected={threadType.toString()}
                  searchable={false}
                  placeholder="Select thread type..."
                  on:change={(e) => {
                    threadType = parseInt(e.detail.selected);
                    markAsChanged('threadType');
                  }}
                />
              </div>
            </div>
          </div>
        {/if}

        {#if activeSubTab === 'messages'}
          <div
            class="rounded-2xl border p-6 space-y-6"
            style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                   border-color: {$colorStore.primary}30;"
          >
            {#each [
              { label: 'Accept Message', value: acceptMessage, key: 'acceptMessage' },
              { label: 'Deny Message', value: denyMessage, key: 'denyMessage' },
              { label: 'Consider Message', value: considerMessage, key: 'considerMessage' },
              { label: 'Implement Message', value: implementMessage, key: 'implementMessage' }
            ] as message}
              <div class="space-y-2">
                <label for="{message.key}-textarea" class="block text-sm"
                       style="color: {$colorStore.muted}">{message.label}</label>
                <textarea
                  id="{message.key}-textarea"
                  bind:value={message.value}
                  on:input={() => markAsChanged(message.key)}
                  class="w-full p-3 rounded-lg min-h-[100px] resize-none"
                  style="background: {$colorStore.primary}10;
                         border: 1px solid {$colorStore.primary}30;
                         color: {$colorStore.text};"
                  placeholder="Enter message template..."
                ></textarea>
                <p class="text-xs" style="color: {$colorStore.muted}">
                  Supports placeholders: %suggest.user%, %suggest.message%
                </p>
              </div>
            {/each}
          </div>
        {/if}

        {#if activeSubTab === 'channels'}
          <div
            class="rounded-2xl border p-6 space-y-6"
            style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                   border-color: {$colorStore.primary}30;"
          >
            <div class="space-y-4">
              <div class="space-y-2">
                <label class="block text-sm" style="color: {$colorStore.muted}">Suggest Channel</label>
                <DiscordSelector
                  type="channel"
                  options={channels}
                  selected={suggestChannel}
                  placeholder="Select suggest channel..."
                  on:change={(e) => {
                    suggestChannel = e.detail.selected;
                    markAsChanged('suggestChannel');
                  }}
                />
              </div>
              <div class="space-y-2">
                <label class="block text-sm" style="color: {$colorStore.muted}">Accept Channel</label>
                <DiscordSelector
                  type="channel"
                  options={channels}
                  selected={acceptChannel}
                  placeholder="Select accept channel..."
                  on:change={(e) => {
                    acceptChannel = e.detail.selected;
                    markAsChanged('acceptChannel');
                  }}
                />
              </div>
              <div class="space-y-2">
                <label class="block text-sm" style="color: {$colorStore.muted}">Deny Channel</label>
                <DiscordSelector
                  type="channel"
                  options={channels}
                  selected={denyChannel}
                  placeholder="Select deny channel..."
                  on:change={(e) => {
                    denyChannel = e.detail.selected;
                    markAsChanged('denyChannel');
                  }}
                />
              </div>
              <div class="space-y-2">
                <label class="block text-sm" style="color: {$colorStore.muted}">Consider Channel</label>
                <DiscordSelector
                  type="channel"
                  options={channels}
                  selected={considerChannel}
                  placeholder="Select consider channel..."
                  on:change={(e) => {
                    considerChannel = e.detail.selected;
                    markAsChanged('considerChannel');
                  }}
                />
              </div>
              <div class="space-y-2">
                <label class="block text-sm" style="color: {$colorStore.muted}">Implement Channel</label>
                <DiscordSelector
                  type="channel"
                  options={channels}
                  selected={implementChannel}
                  placeholder="Select implement channel..."
                  on:change={(e) => {
                    implementChannel = e.detail.selected;
                    markAsChanged('implementChannel');
                  }}
                />
              </div>
            </div>
          </div>
        {/if}

        {#if activeSubTab === 'archive'}
          <div
            class="rounded-2xl border p-6 space-y-6"
            style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                   border-color: {$colorStore.primary}30;"
          >
            {#each [
              { label: 'Archive on Accept', value: archiveOnAccept, key: 'archiveOnAccept' },
              { label: 'Archive on Deny', value: archiveOnDeny, key: 'archiveOnDeny' },
              { label: 'Archive on Consider', value: archiveOnConsider, key: 'archiveOnConsider' },
              { label: 'Archive on Implement', value: archiveOnImplement, key: 'archiveOnImplement' }
            ] as archive}
              <div class="flex items-center justify-between p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                   style="background: {$colorStore.primary}05;">
                <span style="color: {$colorStore.text}">{archive.label}</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    bind:checked={archive.value}
                    on:change={() => markAsChanged(archive.key)}
                  />
                  <div
                    class="w-11 h-6 rounded-full peer-focus:ring-2 after:content-['']
                           after:absolute after:top-[2px] after:left-[2px]
                           after:bg-white after:rounded-full after:h-5 after:w-5
                           after:transition-all peer-checked:after:translate-x-full"
                    style="background: {archive.value ? $colorStore.primary : `${$colorStore.primary}20`};
                           ring-color: {$colorStore.primary}50;"
                  ></div>
                </label>
              </div>
            {/each}
          </div>
        {/if}

        {#if activeSubTab === 'emotes'}
          <div
            class="rounded-2xl border p-6 space-y-6"
            style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                   border-color: {$colorStore.primary}30;"
          >
            <div class="space-y-2">
              <label for="suggest-emotes" class="block text-sm" style="color: {$colorStore.muted}">Custom Emotes</label>
              <input
                id="suggest-emotes"
                type="text"
                bind:value={suggestEmotes}
                on:input={() => markAsChanged('suggestEmotes')}
                class="w-full p-3 rounded-lg"
                style="background: {$colorStore.primary}10;
                       border: 1px solid {$colorStore.primary}30;
                       color: {$colorStore.text};"
                placeholder="Enter emotes separated by commas"
              />
              <p class="text-xs" style="color: {$colorStore.muted}">
                Enter custom emotes separated by commas (e.g. 👍,👎 or custom Discord emotes)
              </p>
            </div>

            <div class="space-y-4">
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">Suggestion Button</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label for="suggest-button-label" class="block text-sm" style="color: {$colorStore.muted}">Button
                    Label</label>
                  <input
                    id="suggest-button-label"
                    type="text"
                    bind:value={suggestButtonLabel}
                    on:input={() => markAsChanged('suggestButtonLabel')}
                    class="w-full p-3 rounded-lg"
                    style="background: {$colorStore.primary}10;
                           border: 1px solid {$colorStore.primary}30;
                           color: {$colorStore.text};"
                    placeholder="Enter button label"
                  />
                </div>
                <div class="space-y-2">
                  <label for="suggest-button-emote" class="block text-sm" style="color: {$colorStore.muted}">Button
                    Emote</label>
                  <input
                    id="suggest-button-emote"
                    type="text"
                    bind:value={suggestButtonEmote}
                    on:input={() => markAsChanged('suggestButtonEmote')}
                    class="w-full p-3 rounded-lg"
                    style="background: {$colorStore.primary}10;
                           border: 1px solid {$colorStore.primary}30;
                           color: {$colorStore.text};"
                    placeholder="Enter button emote"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <label for="suggest-button-message" class="block text-sm" style="color: {$colorStore.muted}">Button
                  Message</label>
                <textarea
                  id="suggest-button-message"
                  bind:value={suggestButtonMessage}
                  on:input={() => markAsChanged('suggestButtonMessage')}
                  class="w-full p-3 rounded-lg min-h-[100px] resize-none"
                  style="background: {$colorStore.primary}10;
                         border: 1px solid {$colorStore.primary}30;
                         color: {$colorStore.text};"
                  placeholder="Enter button message"
                ></textarea>
              </div>
            </div>
          </div>
        {/if}

      </div>
    {/if}
</DashboardPageLayout>

<style lang="postcss">
    :global(body) {
        background-color: #1a202c;
        color: #ffffff;
    }

    :global(input[type="checkbox"]) {
        color-scheme: dark;
    }

    /* Prevent blue highlight on iOS */
    select:focus {
        -webkit-tap-highlight-color: transparent;
    }

    /* Custom styling for options */
    option {
        background-color: #374151;
        color: white;
        padding: 0.5rem;
    }

    /* Add smooth transitions */
    [style*="background"],
    [style*="color"] {
        @apply transition-colors duration-300;
    }

    /* Add container queries for better responsive behavior */
    @container (max-width: 640px) {
        .suggestions-grid {
            @apply gap-4;
        }
    }

    /* Scrollbar styling */
    :global(*::-webkit-scrollbar) {
        @apply w-2;
    }

    :global(*::-webkit-scrollbar-track) {
        background: var(--color-primary)10;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background: var(--color-primary)30;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb:hover) {
        background: var(--color-primary)50;
    }
</style>