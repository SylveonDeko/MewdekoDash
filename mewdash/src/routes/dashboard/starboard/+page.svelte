<!-- routes/dashboard/starboard/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";


  import { onMount } from "svelte";
  import { starboardApi, clientApi, type Starboard } from "$lib/api/index.ts";
    import {currentGuild} from "$lib/stores/currentGuild.ts";
    import {fade} from "svelte/transition";
    import {goto} from "$app/navigation";
    import Notification from "$lib/components/ui/Notification.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import {colorStore} from "$lib/stores/colorStore";
    import {logger} from "$lib/logger.ts";

  // State management
    let showNotification = $state(false);
    let notificationMessage = $state("");
    let notificationType: "success" | "error" = $state("success");

  // Starboard configurations
  let starboards: Starboard[] = $state([]);

  // Guild channels and emote selection
  let guildTextChannels: Array<{
    id: string;
    name: string;
  }> = $state([]);

  // New starboard form
    let newStarboard = $state({
    channelId: "",
    emote: "⭐",
    threshold: 1
    });

  // Channel management
    let selectedStarboardId: number | null = $state(null);
    let selectedChannelId = $state("");
    let parsedCheckedChannels: string[] = $state([]);

  // Current view states
    let loadingStarboards = $state(true);
    let errorStarboards: string | null = $state(null);
    let creatingStarboard = $state(false);


  // Edit thresholds
    let editStarThreshold = $state(0);
    let editRepostThreshold = $state(0);

  // Modals
    let showDeleteModal = $state(false);
    let showSettingsModal = $state(false);
    let showChannelsModal = $state(false);
    let starboardToDelete: number | null = $state(null);
    let currentEditStarboard: any = $state(null);

  // Custom emoji input (for when users want to use a custom emoji)
    let customEmojiInput = $state("");

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
        throw new Error(m.common.noGuildSelected());
      }

      starboards = await starboardApi.getStarboards($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch starboards:", err);
      errorStarboards = err instanceof Error ? err.message : m.starboard.errorFetch();
    } finally {
      loadingStarboards = false;
    }
  }

  async function fetchGuildChannels() {
    try {
      if (!$currentGuild?.id) {
        throw new Error(m.common.noGuildSelected());
      }

      guildTextChannels = await clientApi.getTextChannels($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch guild channels:", err);
    }
  }

  async function createStarboard() {
    try {
      creatingStarboard = true;
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      if (!newStarboard.channelId) throw new Error(m.common.noChannelSelected());

      await starboardApi.createStarboard(
        $currentGuild.id,
        BigInt(newStarboard.channelId),
        newStarboard.emote,
        newStarboard.threshold
      );

      showNotificationMessage(m.starboard.notifyCreated(), "success");

      // Reset form
      newStarboard = {
        channelId: "",
        emote: "⭐",
        threshold: 1
      };

      await fetchStarboards();
    } catch (err) {
      logger.error("Failed to create starboard:", err);
      showNotificationMessage(err instanceof Error ? err.message : m.starboard.errorCreate(), "error");
    } finally {
      creatingStarboard = false;
    }
  }

  async function deleteStarboard(starboardId: number) {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());

      await starboardApi.deleteStarboard($currentGuild.id, starboardId);
      showNotificationMessage(m.starboard.notifyDeleted(), "success");
      await fetchStarboards();
      showDeleteModal = false;
      starboardToDelete = null;
    } catch (err) {
      logger.error("Failed to delete starboard:", err);
      showNotificationMessage(m.starboard.errorDelete(), "error");
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

  /** Emote management state for the settings modal */
  let newStarEmote = $state("");
  let emoteBusy = $state(false);

  /** Splits the bot's pipe-separated emote list */
  function parseEmotes(emoteString: string | null | undefined): string[] {
    if (!emoteString) return [];
    return emoteString.split("|").map(e => e.trim()).filter(Boolean);
  }

  /** Refreshes the starboard list and the copy shown in the open modal */
  async function refreshEditStarboard(starboardId: number) {
    await fetchStarboards();
    const updated = starboards.find(s => s.id === starboardId);
    if (updated && currentEditStarboard) currentEditStarboard = { ...updated };
  }

  async function addStarEmote(starboardId: number) {
    const emote = newStarEmote.trim();
    if (!emote || !$currentGuild?.id) return;
    emoteBusy = true;
    try {
      await starboardApi.addEmoteToStarboard($currentGuild.id, starboardId, emote);
      newStarEmote = "";
      await refreshEditStarboard(starboardId);
    } catch (err: any) {
      logger.error("Failed to add starboard emote:", err);
      showNotificationMessage(err?.message?.includes("already") ? m.starboard.errorEmoteInUse() : m.starboard.errorAddEmote(), "error");
    } finally {
      emoteBusy = false;
    }
  }

  async function removeStarEmote(starboardId: number, emote: string) {
    if (!$currentGuild?.id) return;
    emoteBusy = true;
    try {
      await starboardApi.removeEmoteFromStarboard($currentGuild.id, starboardId, emote);
      await refreshEditStarboard(starboardId);
    } catch (err) {
      logger.error("Failed to remove starboard emote:", err);
      showNotificationMessage(m.starboard.errorRemoveEmote(), "error");
    } finally {
      emoteBusy = false;
    }
  }

  async function toggleAllowBots(starboardId: number, currentValue: boolean) {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());

      const result = await starboardApi.setAllowBots($currentGuild.id, starboardId, !currentValue);
      showNotificationMessage(result ? m.starboard.notifyAllowBotsOn() : m.starboard.notifyAllowBotsOff(), "success");
      await fetchStarboards();
    } catch (err) {
      logger.error("Failed to toggle allow bots setting:", err);
      showNotificationMessage(m.common.notifyUpdateFailed(), "error");
    }
  }

  async function toggleRemoveOnDelete(starboardId: number, currentValue: boolean) {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());

      const result = await starboardApi.setRemoveOnDelete($currentGuild.id, starboardId, !currentValue);
      showNotificationMessage(result ? m.starboard.notifyRemoveOnDeleteOn() : m.starboard.notifyRemoveOnDeleteOff(), "success");
      await fetchStarboards();
    } catch (err) {
      logger.error("Failed to toggle remove on delete setting:", err);
      showNotificationMessage(m.common.notifyUpdateFailed(), "error");
    }
  }

  async function toggleRemoveOnClear(starboardId: number, currentValue: boolean) {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());

      const result = await starboardApi.setRemoveOnClear($currentGuild.id, starboardId, !currentValue);
      showNotificationMessage(result ? m.starboard.notifyRemoveOnClearOn() : m.starboard.notifyRemoveOnClearOff(), "success");
      await fetchStarboards();
    } catch (err) {
      logger.error("Failed to toggle remove on clear setting:", err);
      showNotificationMessage(m.common.notifyUpdateFailed(), "error");
    }
  }

  async function toggleRemoveBelowThreshold(starboardId: number, currentValue: boolean) {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());

      const result = await starboardApi.setRemoveBelowThreshold($currentGuild.id, starboardId, !currentValue);
      showNotificationMessage(result ? m.starboard.notifyRemoveBelowOn() : m.starboard.notifyRemoveBelowOff(), "success");
      await fetchStarboards();
    } catch (err) {
      logger.error("Failed to toggle remove below threshold setting:", err);
      showNotificationMessage(m.common.notifyUpdateFailed(), "error");
    }
  }

  async function toggleUseBlacklist(starboardId: number, currentValue: boolean) {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());

      const result = await starboardApi.setUseBlacklist($currentGuild.id, starboardId, !currentValue);
      showNotificationMessage(result ? m.starboard.notifyModeBlacklist() : m.starboard.notifyModeWhitelist(), "success");
      await fetchStarboards();
    } catch (err) {
      logger.error("Failed to toggle blacklist mode:", err);
      showNotificationMessage(m.common.notifyUpdateFailed(), "error");
    }
  }

  async function updateStarThreshold() {
    try {
      if (!$currentGuild?.id || !currentEditStarboard) throw new Error("No guild or starboard selected");

      await starboardApi.setStarThreshold($currentGuild.id, currentEditStarboard.id, editStarThreshold);
      showNotificationMessage(m.starboard.notifyStarThreshold({ threshold: editStarThreshold }), "success");
      await fetchStarboards();
    } catch (err) {
      logger.error("Failed to update star threshold:", err);
      showNotificationMessage(m.starboard.errorUpdateThreshold(), "error");
    }
  }

  async function updateRepostThreshold() {
    try {
      if (!$currentGuild?.id || !currentEditStarboard) throw new Error("No guild or starboard selected");

      await starboardApi.setRepostThreshold($currentGuild.id, currentEditStarboard.id, editRepostThreshold);

      if (editRepostThreshold === 0) {
        showNotificationMessage(m.starboard.notifyRepostDisabled(), "success");
      } else {
        showNotificationMessage(m.starboard.notifyRepostThreshold({ threshold: editRepostThreshold }), "success");
      }

      await fetchStarboards();
    } catch (err) {
      logger.error("Failed to update repost threshold:", err);
      showNotificationMessage(m.starboard.errorUpdateThreshold(), "error");
    }
  }

  async function toggleChannelInList() {
    try {
      if (!$currentGuild?.id || !selectedStarboardId || !selectedChannelId)
        throw new Error("Missing required information");

      const result = await starboardApi.toggleChannel($currentGuild.id, selectedStarboardId, BigInt(selectedChannelId));

      if (result.wasAdded) {
        showNotificationMessage(result.config.useBlacklist ? m.starboard.notifyChannelAddedBlacklist() : m.starboard.notifyChannelAddedWhitelist(), "success");
      } else {
        showNotificationMessage(result.config.useBlacklist ? m.starboard.notifyChannelRemovedBlacklist() : m.starboard.notifyChannelRemovedWhitelist(), "success");
      }

      // Update the local checked channels
      parsedCheckedChannels = result.config.checkedChannels ? result.config.checkedChannels.split(" ") : [];

      await fetchStarboards();
      selectedChannelId = "";
    } catch (err) {
      logger.error("Failed to toggle channel:", err);
      showNotificationMessage(m.starboard.errorUpdateChannels(), "error");
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
    return channel ? channel.name : m.common.channelIdLabel({ id: channelId });
  }

  function handleChannelChange(detail: any) {
    newStarboard.channelId = detail.selected || "";
  }

  function handleChannelListChange(detail: any) {
    selectedChannelId = detail.selected || "";
  }

  onMount(() => {
    if (!$currentGuild) goto("/dashboard");
    fetchStarboards();
    fetchGuildChannels();
  });

  $effect(() => {
    if ($currentGuild) {
      fetchStarboards();
      fetchGuildChannels();
    }
  });
</script>

<svelte:head>
  <title>{m.starboard.pageHeadTitle()}</title>
</svelte:head>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  actionButtons={[
    {
      label: m.starboard.actionCreate(),
      icon: "fa-star",
      action: createStarboard,
      loading: creatingStarboard,
      disabled: !newStarboard.channelId || creatingStarboard,
      style: `background: linear-gradient(to right, ${$colorStore.primary}, ${$colorStore.secondary}); color: ${$colorStore.text}; box-shadow: 0 0 20px ${$colorStore.primary}20;`
    }
  ]}
  statusMessages={statusMessages}
  icon="fa-star"
  guildName={$currentGuild?.name || "Dashboard"}
  subtitle={m.starboard.pageSubtitle()}
  title={m.features.starboardName()}
>

    <!-- Create New Starboard Section -->
    <div
      class=" rounded-2xl border p-4 md:p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <div
          class="p-2 md:p-3 rounded-xl"
          style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                 color: {$colorStore.primary};"
        >
          <i aria-hidden="true"
             class="fa-utility-duo fa-regular fa-envelope"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
        </div>
        <h2 class="text-lg md:text-xl font-bold" style="color: {$colorStore.text}">{m.starboard.createHeading()}</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <!-- Channel Selection -->
        <div>
          <span class="block text-sm mb-2" id="starboard-channel-label" style="color: {$colorStore.muted}">
            {m.starboard.channelLabel()}
          </span>
          <DiscordSelector
            type="channel"
            options={guildTextChannels}
            selected={newStarboard.channelId}
            placeholder={m.common.selectAChannelPlaceholder()}
            onchange={handleChannelChange} />
        </div>

        <!-- Emote Selection -->
        <div>
          <label class="block text-sm mb-2" for="starboard-emote" style="color: {$colorStore.muted}">
            {m.starboard.emoteLabel()}
          </label>
          <div class="flex flex-col sm:flex-row gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <!-- Common emojis -->
              <button
                class="p-3 rounded-lg transition-all duration-200"
                onclick={() => newStarboard.emote = "⭐"}
                style="background: {newStarboard.emote === '⭐' ? $colorStore.primary : $colorStore.primary + '20'};
                       color: {$colorStore.text};"
              >
                ⭐
              </button>
              <button
                class="p-3 rounded-lg transition-all duration-200"
                onclick={() => newStarboard.emote = "🌟"}
                style="background: {newStarboard.emote === '🌟' ? $colorStore.primary : $colorStore.primary + '20'};
                       color: {$colorStore.text};"
              >
                🌟
              </button>
              <button
                class="p-3 rounded-lg transition-all duration-200"
                onclick={() => newStarboard.emote = "💫"}
                style="background: {newStarboard.emote === '💫' ? $colorStore.primary : $colorStore.primary + '20'};
                       color: {$colorStore.text};"
              >
                💫
              </button>
              <button
                class="p-3 rounded-lg transition-all duration-200"
                onclick={() => newStarboard.emote = "✨"}
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
                placeholder={m.starboard.customEmojiPlaceholder()}
                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                type="text"
              >
              <button
                class="px-2 md:px-3 py-1 rounded-r-lg transition-all duration-200 whitespace-nowrap"
                onclick={setCustomEmoji}
                style="background: {$colorStore.primary}20;
               color: {$colorStore.text};"
              >
                {m.starboard.customEmojiSet()}
              </button>
            </div>
          </div>
          <p class="text-xs mt-2" style="color: {$colorStore.muted}">
            {m.starboard.currentEmote({ emote: newStarboard.emote || m.starboard.noEmoteSelected() })}
          </p>
        </div>

        <!-- Threshold -->
        <div>
          <label class="block text-sm mb-2" for="starboard-threshold" style="color: {$colorStore.muted}">
            {m.starboard.thresholdLabel()}
          </label>
          <input
            bind:value={newStarboard.threshold}
            class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
            id="starboard-threshold"
            min="1"
            style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            type="number"
          >
        </div>

        <!-- Create Button -->
        <div class="flex items-end">
          <button
            class="w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            disabled={!newStarboard.channelId || !newStarboard.emote || creatingStarboard}
            onclick={createStarboard}
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
              <i class="fa-solid fa-star" style="font-size: 16px;"></i>
            {/if}
            <span>{m.starboard.actionCreate()}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Existing Starboards Section -->
    <div
      class=" rounded-2xl border p-4 md:p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <div
          class="p-2 md:p-3 rounded-xl"
          style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                 color: {$colorStore.primary};"
        >
          <i aria-hidden="true"
             class="fa-utility-duo fa-regular fa-star"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
        </div>
        <h2 class="text-lg md:text-xl font-bold" style="color: {$colorStore.text}">{m.starboard.manageHeading()}</h2>
      </div>

      {#if loadingStarboards}
        <div class="flex justify-center items-center min-h-[100px]">
          <div
            class="w-8 h-8 border-3 rounded-full animate-spin"
            style="border-color: {$colorStore.primary}20;
                   border-top-color: {$colorStore.primary};"
            aria-label={m.common.loading()}
          >
          </div>
        </div>
      {:else if errorStarboards}
        <div
          class="rounded-xl p-4 flex items-center gap-3"
          style="background: {$colorStore.accent}10;"
          role="alert"
        >
          <i class="fa-utility-duo fa-regular fa-bell"
             style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"
             aria-hidden="true"></i>
          <p style="color: {$colorStore.accent}">{errorStarboards}</p>
        </div>
      {:else if !starboards || starboards.length === 0}
        <div
          class="text-center py-12 rounded-xl"
          style="background: {$colorStore.primary}10;"
          transition:fade
        >
          <i class="fa-utility-duo fa-regular fa-star"
             style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; display: block; margin: 0 auto 16px;"
             aria-hidden="true"></i>
          <p style="color: {$colorStore.muted}">{m.starboard.emptyTitle()}</p>
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            {m.starboard.emptyHint()}
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
                    <i class="fa-utility-duo fa-regular fa-star"
                       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"
                       aria-hidden="true"></i>
                    <h3 class="font-medium text-sm md:text-base" style="color: {$colorStore.text}">{m.starboard.itemHeading({ id: starboard.id })}</h3>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 md:mb-4">
                    <div class="overflow-hidden">
                      <p class="text-xs md:text-sm" style="color: {$colorStore.muted}">{m.common.channelLabel()}</p>
                      <p class="text-sm md:text-base truncate" style="color: {$colorStore.text}">
                        #{getChannelName(starboard.starboardChannelId.toString())}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs md:text-sm" style="color: {$colorStore.muted}">{m.starboard.itemEmote()}</p>
                      <p class="text-sm md:text-base" style="color: {$colorStore.text}">{starboard.emote}</p>
                    </div>
                    <div>
                      <p class="text-xs md:text-sm" style="color: {$colorStore.muted}">{m.starboard.itemThreshold()}</p>
                      <p class="text-sm md:text-base" style="color: {$colorStore.text}">{starboard.threshold === 1 ? m.starboard.thresholdReactionsOne({ count: starboard.threshold }) : m.starboard.thresholdReactionsOther({ count: starboard.threshold })}</p>
                    </div>
                    <div>
                      <p class="text-xs md:text-sm" style="color: {$colorStore.muted}">{m.starboard.itemRepostThreshold()}</p>
                      <p class="text-sm md:text-base" style="color: {$colorStore.text}">
                        {starboard.repostThreshold === 0 ? m.common.disabled() : starboard.repostThreshold === 1 ? m.starboard.repostMessagesOne({ count: starboard.repostThreshold }) : m.common.messagesCount({ count: starboard.repostThreshold })}
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
                        {starboard.useBlacklist ? m.starboard.modeBlacklist() : m.starboard.modeWhitelist()}
                      </span>
                    </div>
                    <div class="flex items-center gap-1">
                      <div
                        class="w-2 h-2 rounded-full"
                        style="background-color: {starboard.allowBots ? $colorStore.primary : $colorStore.accent};"
                      ></div>
                      <span class="text-sm" style="color: {$colorStore.muted}">
                        {starboard.allowBots ? m.starboard.botsAllow() : m.common.ignoreBots()}
                      </span>
                    </div>
                    <div class="flex items-center gap-1">
                      <div
                        class="w-2 h-2 rounded-full"
                        style="background-color: {starboard.removeOnDelete ? $colorStore.primary : $colorStore.accent};"
                      ></div>
                      <span class="text-sm" style="color: {$colorStore.muted}">
                        {starboard.removeOnDelete ? m.starboard.onDeleteRemove() : m.starboard.onDeleteKeep()}
                      </span>
                    </div>
                    <div class="flex items-center gap-1">
                      <div
                        class="w-2 h-2 rounded-full"
                        style="background-color: {starboard.removeOnReactionsClear ? $colorStore.primary : $colorStore.accent};"
                      ></div>
                      <span class="text-sm" style="color: {$colorStore.muted}">
                        {starboard.removeOnReactionsClear ? m.starboard.onClearRemove() : m.starboard.onClearKeep()}
                      </span>
                    </div>
                    <div class="flex items-center gap-1">
                      <div
                        class="w-2 h-2 rounded-full"
                        style="background-color: {starboard.removeOnBelowThreshold ? $colorStore.primary : $colorStore.accent};"
                      ></div>
                      <span class="text-sm" style="color: {$colorStore.muted}">
                        {starboard.removeOnBelowThreshold ? m.starboard.belowRemove() : m.starboard.belowKeep()}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Buttons -->
                <div class="flex flex-row md:flex-col justify-end gap-2">
                  <button
                    class="p-2 rounded-lg transition-all duration-200"
                    onclick={() => openSettingsModal(starboard)}
                    style="background: {$colorStore.primary}20;
                           color: {$colorStore.text};"
                    aria-label={m.starboard.settingsAria()}
                  >
                    <i class="fa-solid fa-gear" style="font-size: 20px;"></i>
                  </button>
                  <button
                    class="p-2 rounded-lg transition-all duration-200"
                    onclick={() => openChannelsModal(starboard)}
                    style="background: {$colorStore.secondary}20;
                           color: {$colorStore.text};"
                    aria-label={m.common.permManageChannels()}
                  >
                    <i class="fa-solid fa-hashtag" style="font-size: 20px;"></i>
                  </button>
                  <button
                    class="p-2 rounded-lg transition-all duration-200"
                    onclick={() => confirmDeleteStarboard(starboard.id)}
                    style="background: {$colorStore.accent}20;
                           color: {$colorStore.accent};"
                    aria-label={m.starboard.deleteAria()}
                  >
                    <i class="fa-solid fa-trash" style="font-size: 20px;"></i>
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
      class="fixed inset-0 bg-black/50  flex items-center justify-center z-50"
      transition:fade={{ duration: 200 }}
    >
      <div
        class="bg-gray-900/90 rounded-xl p-6 max-w-md w-full mx-4 border shadow-2xl"
        style="border-color: {$colorStore.accent}30;"
      >
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">{m.common.confirmDelete()}</h3>
        <p class="mb-6" style="color: {$colorStore.muted}">
          {m.starboard.deleteMessage()}
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 rounded-lg"
            onclick={() => { showDeleteModal = false; starboardToDelete = null; }}
            style="background: {$colorStore.primary}20;
                   color: {$colorStore.text};"
          >
            {m.common.cancel()}
          </button>
          <button
            class="px-4 py-2 rounded-lg flex items-center gap-2"
            onclick={() => starboardToDelete && deleteStarboard(starboardToDelete)}
            style="background: {$colorStore.accent}20;
                   color: {$colorStore.accent};"
          >
            <i class="fa-solid fa-trash" style="font-size: 16px;"></i>
            <span>{m.common.delete()}</span>
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Settings Modal -->
  {#if showSettingsModal && currentEditStarboard}
    <div
      class="fixed inset-0 bg-black/50  flex items-center justify-center z-50"
      transition:fade={{ duration: 200 }}
    >
      <div
        class="bg-gray-900/90 rounded-xl p-6 max-w-xl w-full mx-4 border shadow-2xl overflow-y-auto max-h-[90vh]"
        style="border-color: {$colorStore.primary}30;"
      >
        <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">{m.starboard.settingsAria()}</h3>

        <div class="space-y-4">
          <!-- Star Threshold -->
          <div>
            <label for="edit-star-threshold" class="block text-sm mb-2" style="color: {$colorStore.muted}">
              {m.starboard.starThresholdLabel()}
            </label>
            <div class="flex gap-2">
              <input
                id="edit-star-threshold"
                type="number"
                min="1"
                bind:value={editStarThreshold}
                class="flex-1 p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              >
              <button
                class="px-4 py-2 rounded-lg transition-all duration-200"
                onclick={updateStarThreshold}
                disabled={editStarThreshold === currentEditStarboard.threshold}
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};
                       opacity: {editStarThreshold === currentEditStarboard.threshold ? '0.5' : '1'};"
              >
                {m.common.update()}
              </button>
            </div>
          </div>

          <!-- Repost Threshold -->
          <div>
            <label for="edit-repost-threshold" class="block text-sm mb-2" style="color: {$colorStore.muted}">
              {m.starboard.repostThresholdLabel()}
            </label>
            <div class="flex gap-2">
              <input
                id="edit-repost-threshold"
                type="number"
                min="0"
                bind:value={editRepostThreshold}
                class="flex-1 p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              >
              <button
                class="px-4 py-2 rounded-lg transition-all duration-200"
                onclick={updateRepostThreshold}
                disabled={editRepostThreshold === currentEditStarboard.repostThreshold}
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};
                       opacity: {editRepostThreshold === currentEditStarboard.repostThreshold ? '0.5' : '1'};"
              >
                {m.common.update()}
              </button>
            </div>
          </div>

          <!-- Emotes -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <h4 class="font-medium mb-1" style="color: {$colorStore.text}">{m.starboard.emotesHeading()}</h4>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">{m.starboard.emotesHint()}</p>
            <div class="flex flex-wrap gap-2 mb-3">
              {#each parseEmotes(currentEditStarboard.emote) as emote (emote)}
                <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                      style="background: {$colorStore.primary}15; color: {$colorStore.text};">
                  <span>{emote}</span>
                  <button class="rounded-sm hover:opacity-80 min-h-[24px] min-w-[24px] disabled:opacity-30"
                          aria-label={m.starboard.removeEmoteAria({ emote })}
                          disabled={emoteBusy || parseEmotes(currentEditStarboard.emote).length <= 1}
                          onclick={() => removeStarEmote(currentEditStarboard.id, emote)}>
                    <i class="fa-solid fa-xmark" style="color: {$colorStore.muted}; font-size: 12px;"></i>
                  </button>
                </span>
              {/each}
            </div>
            <form class="flex gap-2" onsubmit={(e) => { e.preventDefault(); addStarEmote(currentEditStarboard.id); }}>
              <input
                type="text"
                bind:value={newStarEmote}
                placeholder={m.starboard.newEmotePlaceholder()}
                aria-label={m.starboard.newEmoteAria()}
                class="flex-1 p-3 rounded-lg border transition-all duration-200 min-h-[44px]"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              >
              <button
                type="submit"
                class="px-4 py-2 rounded-lg transition-all duration-200 min-h-[44px] disabled:opacity-50"
                disabled={emoteBusy || !newStarEmote.trim()}
                style="background: {$colorStore.primary}20; color: {$colorStore.text};"
              >
                {m.common.add()}
              </button>
            </form>
          </div>

          <!-- Toggle Settings -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}10;"
          >
            <h4 class="font-medium mb-3" style="color: {$colorStore.text}">{m.starboard.togglesHeading()}</h4>

            <div class="grid grid-cols-1 gap-3">
              <!-- Allow Bots -->
              <div class="flex items-center justify-between">
                <div>
                  <p style="color: {$colorStore.text}">{m.starboard.allowBotsLabel()}</p>
                  <p class="text-sm" style="color: {$colorStore.muted}">
                    {currentEditStarboard.allowBots
                      ? m.starboard.allowBotsOn()
                      : m.starboard.allowBotsOff()}
                  </p>
                </div>
                <button
                  class="p-2 rounded-lg transition-all duration-200"
                  onclick={() => toggleAllowBots(currentEditStarboard.id, currentEditStarboard.allowBots)}
                  style="background: {$colorStore.primary}20;
                         color: {$colorStore.text};"
                  aria-label={currentEditStarboard.allowBots ? m.starboard.allowBotsDisableAria() : m.starboard.allowBotsEnableAria()}
                >
                  {#if currentEditStarboard.allowBots}
                    <i class="fa-solid fa-toggle-on" style="font-size: 24px;"></i>
                  {:else}
                    <i class="fa-solid fa-toggle-off" style="font-size: 24px;"></i>
                  {/if}
                </button>
              </div>

              <!-- Remove on Delete -->
              <div class="flex items-center justify-between">
                <div>
                  <p style="color: {$colorStore.text}">{m.starboard.onDeleteRemove()}</p>
                  <p class="text-sm" style="color: {$colorStore.muted}">
                    {currentEditStarboard.removeOnDelete
                      ? m.starboard.removeOnDeleteOn()
                      : m.starboard.removeOnDeleteOff()}
                  </p>
                </div>
                <button
                  class="p-2 rounded-lg transition-all duration-200"
                  onclick={() => toggleRemoveOnDelete(currentEditStarboard.id, currentEditStarboard.removeOnDelete)}
                  style="background: {$colorStore.primary}20;
                         color: {$colorStore.text};"
                  aria-label={currentEditStarboard.removeOnDelete ? m.starboard.removeOnDeleteDisableAria() : m.starboard.removeOnDeleteEnableAria()}
                >
                  {#if currentEditStarboard.removeOnDelete}
                    <i class="fa-solid fa-toggle-on" style="font-size: 24px;"></i>
                  {:else}
                    <i class="fa-solid fa-toggle-off" style="font-size: 24px;"></i>
                  {/if}
                </button>
              </div>

              <!-- Remove on Reactions Clear -->
              <div class="flex items-center justify-between">
                <div>
                  <p style="color: {$colorStore.text}">{m.starboard.removeOnClearLabel()}</p>
                  <p class="text-sm" style="color: {$colorStore.muted}">
                    {currentEditStarboard.removeOnReactionsClear
                      ? m.starboard.removeOnClearOn()
                      : m.starboard.removeOnClearOff()}
                  </p>
                </div>
                <button
                  class="p-2 rounded-lg transition-all duration-200"
                  onclick={() => toggleRemoveOnClear(currentEditStarboard.id, currentEditStarboard.removeOnReactionsClear)}
                  style="background: {$colorStore.primary}20;
                         color: {$colorStore.text};"
                  aria-label={currentEditStarboard.removeOnReactionsClear ? m.starboard.removeOnClearDisableAria() : m.starboard.removeOnClearEnableAria()}
                >
                  {#if currentEditStarboard.removeOnReactionsClear}
                    <i class="fa-solid fa-toggle-on" style="font-size: 24px;"></i>
                  {:else}
                    <i class="fa-solid fa-toggle-off" style="font-size: 24px;"></i>
                  {/if}
                </button>
              </div>

              <!-- Remove Below Threshold -->
              <div class="flex items-center justify-between">
                <div>
                  <p style="color: {$colorStore.text}">{m.starboard.belowRemove()}</p>
                  <p class="text-sm" style="color: {$colorStore.muted}">
                    {currentEditStarboard.removeOnBelowThreshold
                      ? m.starboard.removeBelowOn()
                      : m.starboard.removeBelowOff()}
                  </p>
                </div>
                <button
                  class="p-2 rounded-lg transition-all duration-200"
                  onclick={() => toggleRemoveBelowThreshold(currentEditStarboard.id, currentEditStarboard.removeOnBelowThreshold)}
                  style="background: {$colorStore.primary}20;
                         color: {$colorStore.text};"
                  aria-label={currentEditStarboard.removeOnBelowThreshold ? m.starboard.removeBelowDisableAria() : m.starboard.removeBelowEnableAria()}
                >
                  {#if currentEditStarboard.removeOnBelowThreshold}
                    <i class="fa-solid fa-toggle-on" style="font-size: 24px;"></i>
                  {:else}
                    <i class="fa-solid fa-toggle-off" style="font-size: 24px;"></i>
                  {/if}
                </button>
              </div>

              <!-- Use Blacklist Mode -->
              <div class="flex items-center justify-between">
                <div>
                  <p style="color: {$colorStore.text}">{m.starboard.channelModeLabel()}</p>
                  <p class="text-sm" style="color: {$colorStore.muted}">
                    {currentEditStarboard.useBlacklist
                      ? m.starboard.channelModeBlacklist()
                      : m.starboard.channelModeWhitelist()}
                  </p>
                </div>
                <button
                  class="p-2 rounded-lg transition-all duration-200"
                  onclick={() => toggleUseBlacklist(currentEditStarboard.id, currentEditStarboard.useBlacklist)}
                  style="background: {$colorStore.primary}20;
                         color: {$colorStore.text};"
                  aria-label={currentEditStarboard.useBlacklist ? m.starboard.useWhitelistAria() : m.starboard.useBlacklistAria()}
                >
                  {#if currentEditStarboard.useBlacklist}
                    <i class="fa-solid fa-toggle-on" style="font-size: 24px;"></i>
                  {:else}
                    <i class="fa-solid fa-toggle-off" style="font-size: 24px;"></i>
                  {/if}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            class="px-4 py-2 rounded-lg"
            onclick={() => { showSettingsModal = false; currentEditStarboard = null; }}
            style="background: {$colorStore.primary}20;
                   color: {$colorStore.text};"
          >
            {m.common.close()}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Channel Management Modal -->
  {#if showChannelsModal && currentEditStarboard}
    <div
      class="fixed inset-0 bg-black/50  flex items-center justify-center z-50"
      transition:fade={{ duration: 200 }}
    >
      <div
        class="bg-gray-900/90 rounded-xl p-6 max-w-xl w-full mx-4 border shadow-2xl overflow-y-auto max-h-[90vh]"
        style="border-color: {$colorStore.primary}30;"
      >
        <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text}">{m.common.permManageChannels()}</h3>
        <p class="mb-4" style="color: {$colorStore.muted}">
          {currentEditStarboard.useBlacklist
            ? m.starboard.channelsBlacklistHint()
            : m.starboard.channelsWhitelistHint()}
        </p>

        <div class="space-y-4">
          <!-- Add Channel -->
          <div>
            <span id="addremove-channel-label" class="block text-sm mb-2" style="color: {$colorStore.muted}">
              {m.starboard.addRemoveChannel()}
            </span>
            <div class="flex gap-2">
              <div class="flex-1">
                <DiscordSelector
                  type="channel"
                  options={guildTextChannels}
                  selected={selectedChannelId}
                  placeholder={m.common.selectAChannelPlaceholder()}
                  onchange={handleChannelListChange} />
              </div>
              <button
                class="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                onclick={toggleChannelInList}
                disabled={!selectedChannelId}
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.text};
                       opacity: {!selectedChannelId ? '0.5' : '1'};"
              >
                <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 16px;"></i>
                <span>{m.common.toggle()}</span>
              </button>
            </div>
          </div>

          <!-- Channel List -->
          <div>
            <h4 class="font-medium mb-2" style="color: {$colorStore.text}">
              {currentEditStarboard.useBlacklist ? m.starboard.channelsListBlacklisted() : m.starboard.channelsListWhitelisted()}
            </h4>
            <div
              class="p-3 rounded-lg max-h-64 overflow-y-auto"
              style="background: {$colorStore.primary}15;"
            >
              {#if parsedCheckedChannels.length === 0}
                <p class="text-sm italic" style="color: {$colorStore.muted}">
                  {currentEditStarboard.useBlacklist ? m.starboard.channelsNoneBlacklisted() : m.starboard.channelsNoneWhitelisted()}
                </p>
              {:else}
                <ul class="space-y-2">
                  {#each parsedCheckedChannels as channelId}
                    <li class="flex items-center justify-between p-2 rounded-lg"
                        style="background: {$colorStore.primary}10;">
                      <span style="color: {$colorStore.text}">#{getChannelName(channelId)}</span>
                      <button
                              class="p-1 rounded-sm transition-all duration-200"
                        onclick={() => { selectedChannelId = channelId; toggleChannelInList(); }}
                        style="background: {$colorStore.accent}20;
                               color: {$colorStore.accent};"
                        aria-label={m.starboard.removeChannelAria()}
                      >
                        <i class="fa-solid fa-filter" style="font-size: 16px;"></i>
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
            onclick={() => { showChannelsModal = false; currentEditStarboard = null; selectedStarboardId = null; }}
            style="background: {$colorStore.primary}20;
                   color: {$colorStore.text};"
          >
            {m.common.close()}
          </button>
        </div>
      </div>
    </div>
  {/if}
</DashboardPageLayout>

