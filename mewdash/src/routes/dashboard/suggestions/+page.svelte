<!-- routes/dashboard/suggestions/+page.svelte -->
<script lang="ts">
    import {run} from 'svelte/legacy';

    import {onMount} from "svelte";
    import {api} from "$lib/api";
    import type {PageData} from "./$types";
    import {currentGuild} from "$lib/stores/currentGuild.ts";
    import {fade, slide} from "svelte/transition";
    import {type SuggestionsModel, SuggestionState} from "$lib/types/models.ts";
    import Notification from "$lib/components/ui/Notification.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import {browser} from "$app/environment";
    import {colorStore} from "$lib/stores/colorStore";
    import {
        AlertTriangle,
        ArrowDown,
        ArrowUp,
        Check,
        Hash,
        Inbox,
        MessageCircle,
        Settings,
        Trash2,
        User,
        X
    } from "lucide-svelte";
    import {goto} from "$app/navigation";
    import {currentInstance} from "$lib/stores/instanceStore.ts";
    import {loadingStore} from "$lib/stores/loadingStore";

    interface Props {
        data: PageData;
    }

    let {data}: Props = $props();

  let currentUser = data.user;

    // Helper function to validate and format Discord custom emotes
    function formatEmote(emote: string): string {
        const trimmed = emote.trim();
        // Check if it's a Discord custom emote format <a:name:id> or <:name:id>
        const customEmoteRegex = /^<(a?):(\w+):(\d+)>$/;
        if (customEmoteRegex.test(trimmed)) {
            return trimmed;
        }
        // Check if it's just the emote without brackets, and wrap it properly
        const partialEmoteRegex = /^(a?):(\w+):(\d+)$/;
        if (partialEmoteRegex.test(trimmed)) {
            return `<${trimmed}>`;
        }
        // Otherwise return as-is (Unicode emoji or plain text)
        return trimmed;
    }

    // Helper function to parse and validate emote list
    function parseEmotesList(emotesString: string): string {
        if (!emotesString || emotesString === "disabled" || emotesString === "-") {
            return emotesString;
        }

        const emotes = emotesString.split(',').map(e => formatEmote(e));
        if (emotes.length > 5) {
            showNotificationMessage("Maximum 5 emotes allowed. Only first 5 will be saved.", "error");
            return emotes.slice(0, 5).join(',');
        }
        return emotes.join(',');
    }

    // Helper function to render Discord emote as image or fallback to text
    function renderEmote(emote: string): { type: 'image' | 'text', content: string, animated?: boolean } {
        const trimmed = emote.trim();

        // Check for Discord custom emote
        const customEmoteMatch = trimmed.match(/^<(a?):(\w+):(\d+)>$/);
        if (customEmoteMatch) {
            const [, animated, name, id] = customEmoteMatch;
            const extension = animated === 'a' ? 'gif' : 'png';
            return {
                type: 'image',
                content: `https://cdn.discordapp.com/emojis/${id}.${extension}`,
                animated: animated === 'a'
            };
        }

        // Otherwise it's a Unicode emoji or text
        return {
            type: 'text',
            content: trimmed
        };
    }

    // Helper to parse emotes string for preview
    function parseEmotesForPreview(emotesString: string): Array<{
        type: 'image' | 'text',
        content: string,
        animated?: boolean
    }> {
        if (!emotesString || emotesString === "disabled" || emotesString === "-") {
            return [{type: 'text', content: '👍'}, {type: 'text', content: '👎'}];
        }

        return emotesString.split(',').map(e => renderEmote(formatEmote(e)));
    }

  // States
    let activeTab = $state("suggestions");
    let activeSubTab = $state("general");
  let isMobile = false;
    let loading = $state(true);
    let error: string | null = $state(null);
    let showNotification = $state(false);
    let notificationMessage = $state("");
    let notificationType: "success" | "error" = $state("success");
    let changedSettings = $state(new Set<string>());
    let showStatusModal = $state(false);
    let statusChangeReason = $state("");
  let selectedSuggestion: SuggestionsModel | null = null;
    let selectedStatus: SuggestionState | null = $state(null);

    let sortBy: "dateAdded" | "currentState" = $state("dateAdded");
    let sortDirection: "asc" | "desc" = $state("desc");

  // Data
    let suggestions: SuggestionsModel[] = $state([]);
    let channels: Array<{ id: string; name: string }> = $state([]);


  // Settings
    let minLength = $state(0);
    let maxLength = $state(2000);
    let acceptMessage = $state("");
    let denyMessage = $state("");
    let considerMessage = $state("");
    let implementMessage = $state("");
    let acceptChannel = $state("");
    let denyChannel = $state("");
    let considerChannel = $state("");
    let implementChannel = $state("");
    let suggestChannel = $state("");
    let threadType = $state(0);
    let suggestButtonMessage = $state("");
    let suggestButtonLabel = $state("");
    let suggestButtonEmote = $state("");
    let suggestEmotes = $state("");
    let archiveOnDeny = $state(false);
    let archiveOnAccept = $state(false);
    let archiveOnConsider = $state(false);
    let archiveOnImplement = $state(false);
  let suggestButtonChannel: bigint | null = null;

  // Computed values
    let hasChanges = $derived(changedSettings.size > 0);
    let sortedSuggestions = $derived([...suggestions].sort((a, b) => {
    if (sortBy === "dateAdded") {
      const dateA = new Date(a.dateAdded).getTime();
      const dateB = new Date(b.dateAdded).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      if (a.currentState < b.currentState) return sortDirection === "asc" ? -1 : 1;
      if (a.currentState > b.currentState) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    }));


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

          let fetched;
          try {
              fetched = await api.getSuggestions($currentGuild.id);
          } catch (err: any) {
              // Handle 404 as empty state, not an error
              if (err?.message?.includes('404') || err?.message?.includes('No suggestions')) {
                  suggestions = [];
                  loading = false;
                  return;
              }
              throw err;
          }

          if (!fetched || fetched.length === 0) {
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

          console.log("Fetched suggestion settings:", {
              acceptMessage: fetchedAcceptMessage,
              denyMessage: fetchedDenyMessage,
              considerMessage: fetchedConsiderMessage,
              implementMessage: fetchedImplementMessage,
              suggestEmotes: fetchedSuggestEmotes,
              buttonMessage: fetchedButtonMessage,
              buttonLabel: fetchedButtonLabel,
              buttonEmote: fetchedButtonEmote,
              types: {
                  acceptMessage: typeof fetchedAcceptMessage,
                  denyMessage: typeof fetchedDenyMessage,
                  considerMessage: typeof fetchedConsiderMessage,
                  implementMessage: typeof fetchedImplementMessage
              }
          });

      minLength = fetchedMinLength;
      maxLength = fetchedMaxLength;

          // Extract string values from API response objects (they come as {"data": "value"})
          acceptMessage = typeof fetchedAcceptMessage === 'string' ? fetchedAcceptMessage :
              fetchedAcceptMessage?.data || "";

          denyMessage = typeof fetchedDenyMessage === 'string' ? fetchedDenyMessage :
              fetchedDenyMessage?.data || "";

          considerMessage = typeof fetchedConsiderMessage === 'string' ? fetchedConsiderMessage :
              fetchedConsiderMessage?.data || "";

          implementMessage = typeof fetchedImplementMessage === 'string' ? fetchedImplementMessage :
              fetchedImplementMessage?.data || "";

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

          // Handle suggestEmotes - could be string or object with data property
          suggestEmotes = typeof fetchedSuggestEmotes === 'string' ? fetchedSuggestEmotes :
              fetchedSuggestEmotes?.data || "";

          // Handle button message - extract from object if needed
          suggestButtonMessage = typeof fetchedButtonMessage === 'string' ? fetchedButtonMessage :
              fetchedButtonMessage?.data || "";

          // Handle button label - should be a simple string, but API might return component structure
          if (typeof fetchedButtonLabel === 'string') {
              suggestButtonLabel = fetchedButtonLabel;
          } else if (fetchedButtonLabel?.data) {
              // API returning object with data property, extract it
              suggestButtonLabel = typeof fetchedButtonLabel.data === 'string' ? fetchedButtonLabel.data : "";
          } else if (fetchedButtonLabel?.actionRows?.[0]?.components?.[0]?.label) {
              // API incorrectly returning full component structure, extract just the label
              suggestButtonLabel = fetchedButtonLabel.actionRows[0].components[0].label;
          } else {
              suggestButtonLabel = "";
          }

          // Handle button emote - extract from object if needed
          suggestButtonEmote = typeof fetchedButtonEmote === 'string' ? fetchedButtonEmote :
              fetchedButtonEmote?.data || "";

          suggestButtonChannel = fetchedButtonChannel;

          console.log("After setting values:", {
              acceptMessage,
              denyMessage,
              considerMessage,
              implementMessage
          });
      } catch (err) {
          console.error("Error loading settings:", err);
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
          updatePromises.push(api.setAcceptMessage($currentGuild.id, acceptMessage || null));
      }
      if (changedSettings.has("denyMessage")) {
          updatePromises.push(api.setDenyMessage($currentGuild.id, denyMessage || null));
      }
      if (changedSettings.has("considerMessage")) {
          updatePromises.push(api.setConsiderMessage($currentGuild.id, considerMessage || null));
      }
      if (changedSettings.has("implementMessage")) {
          updatePromises.push(api.setImplementMessage($currentGuild.id, implementMessage || null));
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
          const parsedEmotes = parseEmotesList(suggestEmotes);
          updatePromises.push(api.setSuggestEmotes($currentGuild.id, parsedEmotes || null));
      }
      if (changedSettings.has("suggestButtonMessage")) {
          updatePromises.push(api.setSuggestButtonMessage($currentGuild.id, suggestButtonMessage || null));
      }
      if (changedSettings.has("suggestButtonLabel")) {
          updatePromises.push(api.setSuggestButtonLabel($currentGuild.id, suggestButtonLabel || null));
      }
      if (changedSettings.has("suggestButtonEmote")) {
          const formattedEmote = formatEmote(suggestButtonEmote);
          updatePromises.push(api.setSuggestButtonEmote($currentGuild.id, formattedEmote || null));
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

    run(() => {
        if ($currentInstance) {
            Promise.all([
                fetchSuggestions(),
                fetchChannels(),
                loadSettings()
            ]);
        }
    });

    run(() => {
        if ($currentGuild) {
            Promise.all([
                fetchSuggestions(),
                fetchChannels(),
                loadSettings()
            ]);
        }
    });

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
    <!-- @migration-task: migrate this slot by hand, `status-messages` is an invalid identifier -->
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
              class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        transition:fade
      >
        <div
                class="w-full max-w-md backdrop-blur-md rounded-xl border p-6 shadow-2xl"
                style="background: linear-gradient(135deg, {$colorStore.gradientStart}95, {$colorStore.gradientMid}98);
                 border-color: {$colorStore.primary}30;"
          transition:slide
        >
          <h2 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">
            Update Status to {selectedStatus !== null ? getStatusString(selectedStatus) : ''}
          </h2>
            <div class="mb-4">
                <label class="block text-sm mb-2" style="color: {$colorStore.muted}">Reason (optional)</label>
                <textarea
                        bind:value={statusChangeReason}
                        class="w-full min-h-[100px] p-3 rounded-lg resize-none"
                        style="background: {$colorStore.primary}10;
                     border: 1px solid {$colorStore.primary}30;
                     color: {$colorStore.text};"
                        placeholder="Enter reason for status change..."
                ></textarea>
            </div>
            <div class="flex gap-3 justify-end">
            <button
                    class="px-5 py-2.5 rounded-lg font-medium transition-all hover:scale-105"
                    style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
              onclick={closeStatusModal}
            >
              Cancel
            </button>
            <button
                    class="px-5 py-2.5 rounded-lg font-medium transition-all hover:scale-105"
                    style="background: linear-gradient(135deg, {$colorStore.primary}, {$colorStore.secondary});
                     color: white;
                     box-shadow: 0 4px 12px {$colorStore.primary}30;"
              onclick={confirmStatusChange}
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Main Content -->
    {#if activeTab === 'suggestions'}
        <div class="space-y-6">
        {#if loading}
            <div class="backdrop-blur-xs rounded-xl border p-12 transition-all"
                 style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
                <div class="flex flex-col items-center justify-center">
                    <div class="w-12 h-12 border-4 rounded-full animate-spin mb-4"
                         style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"></div>
                    <p class="text-sm" style="color: {$colorStore.muted}">Loading suggestions...</p>
                </div>
          </div>
        {:else if error}
            <div class="backdrop-blur-xs rounded-xl border p-6 transition-all"
                 style="background: #ef444410; border-color: #ef444430;">
                <div class="flex items-center gap-3">
                    <AlertTriangle size={20} style="color: #ef4444"/>
                    <span style="color: #ef4444">{error}</span>
                </div>
          </div>
        {:else if suggestions.length === 0}
            <div class="backdrop-blur-xs rounded-xl border p-12 transition-all text-center"
                 style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
                <Inbox size={48} style="color: {$colorStore.muted}; margin: 0 auto 16px;"/>
                <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text}">No suggestions yet</h3>
                <p style="color: {$colorStore.muted}">Suggestions from your community will appear here</p>
          </div>
        {:else}
          <!-- Sort Controls -->
            <div class="backdrop-blur-xs rounded-xl border p-4 mb-6 transition-all"
                 style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
                <div class="flex flex-wrap gap-3 items-center">
                    <span class="text-sm font-medium" style="color: {$colorStore.text}">Sort by:</span>
                    <DiscordSelector
                            type="custom"
                            options={[
                  { id: "dateAdded", name: "Date Added", label: "Date Added" },
                  { id: "currentState", name: "Status", label: "Status" }
                ]}
                            selected={sortBy}
                            searchable={false}
                            placeholder="Sort by..."
                            on:change={(e) => sortBy = e.detail.selected}
                    />
                    <button
                            class="px-4 py-2 rounded-lg border transition-all hover:scale-105 flex items-center gap-2"
                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            onclick={toggleSortDirection}
                    >
                        {#if sortDirection === 'asc'}
                            <ArrowUp size={16}/>
                        {:else}
                            <ArrowDown size={16}/>
                        {/if}
                        <span class="text-sm">{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</span>
                    </button>
                    <div class="ml-auto flex items-center gap-2">
                <span class="text-sm" style="color: {$colorStore.muted}">
                  {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
                </span>
                    </div>
                </div>
          </div>

          <!-- Suggestions List -->
          <div class="space-y-4">
              {#each sortedSuggestions as suggestion, index (suggestion.id)}
              <div
                      class="backdrop-blur-xs rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-px"
                      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
                      in:slide={{ duration: 300, delay: index * 50 }}
              >
                <!-- Suggestion Header -->
                  <div class="p-4 flex items-start justify-between gap-4"
                       style="background: {$colorStore.primary}08; border-bottom: 1px solid {$colorStore.primary}20;">
                      <div class="flex items-center gap-3 min-w-0">
                    <img
                      src={suggestion.user?.avatarUrl}
                      alt=""
                      class="w-10 h-10 rounded-full ring-2 ring-opacity-20"
                      style="ring-color: {$colorStore.primary};"
                    />
                          <div class="min-w-0">
                              <p class="font-semibold truncate" style="color: {$colorStore.text}">
                        {suggestion.user?.username}
                      </p>
                              <p class="text-xs" style="color: {$colorStore.muted}">
                                  {new Date(suggestion.dateAdded).toLocaleDateString()}
                                  • {new Date(suggestion.dateAdded).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                      <div class="flex items-center gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                          style="background: {getStateColor(suggestion.currentState)}20; color: {getStateColor(suggestion.currentState)};">
                      {getStatusString(suggestion.currentState)}
                    </span>
                  </div>
                </div>

                <!-- Suggestion Content -->
                  <div class="p-5">
                      <div class="mb-4 p-4 rounded-lg"
                           style="background: {$colorStore.primary}05; border-left: 3px solid {$colorStore.primary}30;">
                          <p class="break-words leading-relaxed" style="color: {$colorStore.text}">
                              {suggestion.suggestion1}
                          </p>
                      </div>

                      <!-- Suggestion Metadata -->
                      <div class="flex flex-wrap gap-4 mb-4 text-xs" style="color: {$colorStore.muted}">
                          <div class="flex items-center gap-1">
                              <Hash size={12}/>
                              <span>ID: {suggestion.suggestionId}</span>
                          </div>
                          {#if suggestion.stateChangeUser}
                              <div class="flex items-center gap-1">
                                  <User size={12}/>
                                  <span>Modified by: {suggestion.stateChangeUser}</span>
                              </div>
                          {/if}
                      </div>

                  <!-- Action Buttons -->
                      <div class="flex flex-wrap gap-2 pt-3" style="border-top: 1px solid {$colorStore.primary}15;">
                    <button
                            class="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
                            style="background: #22c55e20; color: #22c55e; border: 1px solid #22c55e30;"
                      onclick={() => initiateStatusChange(suggestion, SuggestionState.Accepted)}
                            disabled={suggestion.currentState === SuggestionState.Accepted}
                    >
                        <Check size={16}/>
                      Accept
                    </button>
                    <button
                            class="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
                            style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
                      onclick={() => initiateStatusChange(suggestion, SuggestionState.Denied)}
                            disabled={suggestion.currentState === SuggestionState.Denied}
                    >
                        <X size={16}/>
                      Deny
                    </button>
                    <button
                            class="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
                            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                      onclick={() => initiateStatusChange(suggestion, SuggestionState.Considered)}
                            disabled={suggestion.currentState === SuggestionState.Considered}
                    >
                        <MessageCircle size={16}/>
                      Consider
                    </button>
                    <button
                            class="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
                            style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                      onclick={() => initiateStatusChange(suggestion, SuggestionState.Implemented)}
                            disabled={suggestion.currentState === SuggestionState.Implemented}
                    >
                        <Check size={16}/>
                      Implement
                    </button>
                          <div class="ml-auto">
                              <button
                                      class="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 hover:bg-red-500/20"
                                      style="background: {$colorStore.primary}10; color: {$colorStore.muted}; border: 1px solid {$colorStore.primary}20;"
                                      onclick={() => {
                          if (confirm('Are you sure you want to delete this suggestion?')) {
                            deleteSuggestion(suggestion.id);
                          }
                        }}
                              >
                                  <Trash2 size={16}/>
                                  Delete
                              </button>
                          </div>
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
            <div class="backdrop-blur-xs rounded-xl border p-6 space-y-6 transition-all"
                 style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
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
                    oninput={() => markAsChanged('minLength')}
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
                    oninput={() => markAsChanged('maxLength')}
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
            <div class="backdrop-blur-xs rounded-xl border p-6 space-y-6 transition-all"
                 style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
                <div class="space-y-2">
                    <label for="accept-message-textarea" class="block text-sm"
                           style="color: {$colorStore.muted}">Accept Message</label>
                    <textarea
                            id="accept-message-textarea"
                            bind:value={acceptMessage}
                            oninput={() => markAsChanged('acceptMessage')}
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

                <div class="space-y-2">
                    <label for="deny-message-textarea" class="block text-sm"
                           style="color: {$colorStore.muted}">Deny Message</label>
                    <textarea
                            id="deny-message-textarea"
                            bind:value={denyMessage}
                            oninput={() => markAsChanged('denyMessage')}
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

                <div class="space-y-2">
                    <label for="consider-message-textarea" class="block text-sm"
                           style="color: {$colorStore.muted}">Consider Message</label>
                    <textarea
                            id="consider-message-textarea"
                            bind:value={considerMessage}
                            oninput={() => markAsChanged('considerMessage')}
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

                <div class="space-y-2">
                    <label for="implement-message-textarea" class="block text-sm"
                           style="color: {$colorStore.muted}">Implement Message</label>
                    <textarea
                            id="implement-message-textarea"
                            bind:value={implementMessage}
                            oninput={() => markAsChanged('implementMessage')}
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
          </div>
        {/if}

        {#if activeSubTab === 'channels'}
            <div class="backdrop-blur-xs rounded-xl border p-6 space-y-6 transition-all"
                 style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
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
            <div class="backdrop-blur-xs rounded-xl border p-6 space-y-6 transition-all"
                 style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
                <div class="flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.01]"
                     style="background: {$colorStore.primary}08;">
                    <span style="color: {$colorStore.text}">Archive on Accept</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input
                                type="checkbox"
                                class="sr-only peer"
                                bind:checked={archiveOnAccept}
                                onchange={() => markAsChanged('archiveOnAccept')}
                        />
                        <div
                                class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer
                         peer-checked:after:translate-x-full peer-checked:after:border-white
                         after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                         after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                style:background-color={archiveOnAccept ? $colorStore.primary : '#4b5563'}>
                        </div>
                    </label>
                </div>

                <div class="flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.01]"
                     style="background: {$colorStore.primary}08;">
                    <span style="color: {$colorStore.text}">Archive on Deny</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input
                                type="checkbox"
                                class="sr-only peer"
                                bind:checked={archiveOnDeny}
                                onchange={() => markAsChanged('archiveOnDeny')}
                        />
                        <div
                                class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer
                         peer-checked:after:translate-x-full peer-checked:after:border-white
                         after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                         after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                style:background-color={archiveOnDeny ? $colorStore.primary : '#4b5563'}>
                        </div>
                    </label>
                </div>

                <div class="flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.01]"
                     style="background: {$colorStore.primary}08;">
                    <span style="color: {$colorStore.text}">Archive on Consider</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input
                                type="checkbox"
                                class="sr-only peer"
                                bind:checked={archiveOnConsider}
                                onchange={() => markAsChanged('archiveOnConsider')}
                        />
                        <div
                                class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer
                         peer-checked:after:translate-x-full peer-checked:after:border-white
                         after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                         after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                style:background-color={archiveOnConsider ? $colorStore.primary : '#4b5563'}>
                        </div>
                    </label>
                </div>

                <div class="flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.01]"
                     style="background: {$colorStore.primary}08;">
                    <span style="color: {$colorStore.text}">Archive on Implement</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input
                                type="checkbox"
                                class="sr-only peer"
                                bind:checked={archiveOnImplement}
                                onchange={() => markAsChanged('archiveOnImplement')}
                        />
                        <div
                                class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer
                         peer-checked:after:translate-x-full peer-checked:after:border-white
                         after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                         after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                style:background-color={archiveOnImplement ? $colorStore.primary : '#4b5563'}>
                        </div>
                    </label>
                </div>
          </div>
        {/if}

        {#if activeSubTab === 'emotes'}
            <div class="backdrop-blur-xs rounded-xl border p-6 space-y-6 transition-all"
                 style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
            <div class="space-y-2">
              <label for="suggest-emotes" class="block text-sm" style="color: {$colorStore.muted}">Custom Emotes</label>
              <input
                id="suggest-emotes"
                type="text"
                bind:value={suggestEmotes}
                oninput={() => markAsChanged('suggestEmotes')}
                class="w-full p-3 rounded-lg"
                style="background: {$colorStore.primary}10;
                       border: 1px solid {$colorStore.primary}30;
                       color: {$colorStore.text};"
                placeholder="e.g. 👍,👎,🤔 or <a:HaneMeow:914307922287276052>,<:HaneJudge:914307916285227008>"
              />
              <p class="text-xs" style="color: {$colorStore.muted}">
                  Enter up to 5 emotes separated by commas. Supports Unicode (👍,👎) and Discord custom emotes
                  (&lt;:name:id&gt; or &lt;a:name:id&gt; for animated). Use "disabled" or "-" for default 👍/👎
              </p>

                <!-- Emote Preview -->
                {#if suggestEmotes}
                    <div class="mt-3 p-3 rounded-lg"
                         style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                        <p class="text-xs mb-2" style="color: {$colorStore.muted}">Preview:</p>
                        <div class="flex items-center gap-2">
                            {#each parseEmotesForPreview(suggestEmotes) as emote}
                                {#if emote.type === 'image'}
                                    <img
                                            src={emote.content}
                                            alt="Discord Emote"
                                            class="w-6 h-6 object-contain"
                                            onerror={(e) => {
                            if (e.currentTarget instanceof HTMLImageElement) {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback instanceof HTMLElement) {
                                fallback.style.display = 'inline';
                              }
                            }
                          }}
                                    />
                                    <span style="display: none; color: {$colorStore.muted};" class="text-xs">❓</span>
                                {:else}
                                    <span class="text-xl">{emote.content}</span>
                                {/if}
                            {/each}
                        </div>
                    </div>
                {/if}
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
                    oninput={() => markAsChanged('suggestButtonLabel')}
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
                    oninput={() => markAsChanged('suggestButtonEmote')}
                    class="w-full p-3 rounded-lg"
                    style="background: {$colorStore.primary}10;
                           border: 1px solid {$colorStore.primary}30;
                           color: {$colorStore.text};"
                    placeholder="e.g. 💡 or <:hanestare:968161429679112242>"
                  />
                    <p class="text-xs" style="color: {$colorStore.muted}">
                        Single emote for the suggest button. Supports Unicode (💡) or Discord custom (&lt;:name:id&gt;,
                        &lt;a:name:id&gt;).
                        Leave empty or use "disabled"/"-" for no emote.
                    </p>

                    <!-- Button Emote Preview -->
                    {#if suggestButtonEmote && suggestButtonEmote !== "disabled" && suggestButtonEmote !== "-"}
                        {@const buttonEmote = renderEmote(formatEmote(suggestButtonEmote))}
                        <div class="mt-2 inline-flex items-center gap-2">
                            {#if buttonEmote.type === 'image'}
                                <img
                                        src={buttonEmote.content}
                                        alt="Button Emote"
                                        class="w-5 h-5 object-contain"
                                        onerror={(e) => {
                            if (e.currentTarget instanceof HTMLImageElement) {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback instanceof HTMLElement) {
                                fallback.style.display = 'inline';
                              }
                            }
                          }}
                                />
                                <span style="display: none; color: {$colorStore.muted};" class="text-xs">❓</span>
                            {:else}
                                <span class="text-lg">{buttonEmote.content}</span>
                            {/if}
                        </div>
                    {/if}
                </div>
              </div>
              <div class="space-y-2">
                <label for="suggest-button-message" class="block text-sm" style="color: {$colorStore.muted}">Button
                  Message</label>
                <textarea
                  id="suggest-button-message"
                  bind:value={suggestButtonMessage}
                  oninput={() => markAsChanged('suggestButtonMessage')}
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

