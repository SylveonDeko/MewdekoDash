<!-- routes/dashboard/repeaters/+page.svelte -->
<script lang="ts">


  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import {
    clientApi,
    type CreateRepeaterRequest,
    formatInterval,
    formatTimeUntilNext,
    getTriggerModeDescription,
    getTriggerModeLabel,
    type RepeaterResponse,
    repeatersApi,
    StickyTriggerMode,
    TIME_SCHEDULE_PRESETS,
    type UpdateRepeaterRequest
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";

  import StatCard from "$lib/components/monitoring/StatCard.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import { toBuilderValue } from "$lib/utils/embedMessage";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

    // Component state
    let loading = $state(false);
    let saving = $state(false);
    let message = $state("");
    let messageType: "success" | "error" | "info" = $state("info");

  // Data state
    let repeaters: RepeaterResponse[] = $state([]);
  let repeaterStats: any = $state(null);
    let guildChannels: Array<{ id: string; name: string; }> = $state([]);
  let forumChannels: Array<{
    id: string;
    name: string;
    tags: Array<{id: bigint, name: string, emoji: string | null, isModerated: boolean}>;
  }> = $state([]);

  // Dynamic channel selection state
    let selectedChannelType: 'text' | 'forum' | null = $state(null);
    let selectedForumTags: { required: bigint[], excluded: bigint[] } = $state({required: [], excluded: []});

  let repeaterMessage: any = $state({}); // Unified message object for FullscreenEmbedBuilder

  // UI state
    let activeTab = $state("overview");
    let selectedRepeater: RepeaterResponse | null = $state(null);
    let editingRepeaterId: number | null = $state(null);
    let isEditMode = $state(false);
  let originalFormData: any = $state(null); // Track original values for comparison
  let showAdvancedOptions = $state(false);
  let showForumTagEditor = $state(false);

  // Form data for creating/editing repeaters - using any for flexibility
  let formData: any = $state({
    channelId: "",
    message: "",
    interval: "00:05:00",
    startTimeOfDay: "",
    triggerMode: StickyTriggerMode.TimeInterval,
    activityThreshold: 5,
    activityTimeWindow: "00:05:00",
    conversationDetection: false,
    conversationThreshold: 3,
    priority: 50,
    queuePosition: 0,
    noRedundant: false,
    allowMentions: false,
    timeSchedulePreset: "none",
    timeConditions: "",
    maxAge: "",
    maxTriggers: null,
    threadAutoSticky: false,
    threadOnlyMode: false,
    suppressNotifications: false,
    forumTagConditions: null
    });

  // Additional state for advanced features
    let selectedRepeaterIds: number[] = $state([]);

  // Trigger mode options for DiscordSelector
    let triggerModeOptions = $derived(Object.values(StickyTriggerMode)
    .filter(v => typeof v === 'number')
    .map(mode => ({
      id: mode.toString(),
      name: getTriggerModeLabel(mode as StickyTriggerMode),
      label: `${getTriggerModeLabel(mode as StickyTriggerMode)} - ${getTriggerModeDescription(mode as StickyTriggerMode)}`
    })));

    let allChannels = $derived([
      ...guildChannels.map(ch => ({
        id: ch.id,
        name: ch.name,
      label: `#${ch.name} (Text Channel)`
    })),
      ...forumChannels.map(ch => ({
        id: ch.id,
        name: ch.name,
        label: `#${ch.name} (Forum - ${ch.tags.length} tags)`
    }))
    ]);

  // Derive available forum tags from selected channel
  let availableForumTags = $derived.by(() => {
    if (!formData.channelId) return [];
    const selectedChannel = forumChannels.find(ch => ch.id === formData.channelId);
    if (selectedChannel) {
      return selectedChannel.tags.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        emoji: tag.emoji
      }));
    }
    return [];
  });

  // Dynamic channel type detection and tag loading
  $effect(() => {
    if (formData.channelId) {
      const isForumChannel = forumChannels.some(ch => ch.id === formData.channelId);
      selectedChannelType = isForumChannel ? "forum" : "text";

      if (isForumChannel) {
        // Auto-enable thread auto-sticky for forum channels (only if not in edit mode)
        if (!isEditMode) {
          formData.threadAutoSticky = true;
          // Auto-enable thread-only mode for immediate trigger on forum channels
          if (formData.triggerMode === StickyTriggerMode.Immediate) {
            formData.threadOnlyMode = true;
          }
        }
      } else {
        // Reset thread auto-sticky for non-forum channels (only if not in edit mode)
        if (!isEditMode) {
          formData.threadAutoSticky = false;
          formData.threadOnlyMode = false;
        }
      }
    } else {
      selectedChannelType = null;
    }
    });

  // Load all repeater data
  async function loadAllData() {
    if (!$currentGuild?.id) return;

    loading = true;
    logger.info(`Loading repeater data for guild ${$currentGuild.id}`);

    try {
      const [
        repeatersData,
        statsData,
        channelsData,
        forumData
      ] = await Promise.all([
        repeatersApi.getRepeaters($currentGuild.id).catch((err) => {
          logger.error("Failed to fetch repeaters:", err);
          return [];
        }),
        repeatersApi.getRepeaterStatistics($currentGuild.id).catch((err) => {
          logger.error("Failed to fetch repeater statistics:", err);
          return null;
        }),
        clientApi.getTextChannels($currentGuild.id).catch((err) => {
          logger.error("Failed to fetch text channels:", err);
          return [];
        }),
        clientApi.getForumChannels($currentGuild.id).catch((err) => {
          logger.error("Failed to fetch forum channels:", err);
          return [];
        })
      ]);

      logger.info(`Successfully fetched ${repeatersData.length} repeaters:`, repeatersData);
      repeatersData.forEach((repeater, index) => {
        logger.info(`Repeater ${index + 1}:`, {
          id: repeater.id,
          channelId: repeater.channelId,
          message: repeater.message,
          triggerMode: repeater.triggerMode,
          isEnabled: repeater.isEnabled,
          priority: repeater.priority,
          forumTagConditions: repeater.forumTagConditions
        });
      });
      repeaters = repeatersData;
      repeaterStats = statsData;

      // Process channels data
      guildChannels = (channelsData || []).map((ch: any) => ({
        id: ch.id.toString(),
        name: ch.name
      }));

      // Process forum channels data with full tag information
      forumChannels = (forumData || []).map((forum: any) => ({
        id: forum.id.toString(),
        name: forum.name,
        tags: (forum.tags || []).map((tag: any) => ({
          id: BigInt(tag.id),
          name: tag.name,
          emoji: tag.emoji,
          isModerated: tag.isModerated
        }))
      }));
      
    } catch (err) {
      logger.error("Failed to load repeater data:", err);
      showMessage("Failed to load repeater data", "error");
    } finally {
      loading = false;
    }
  }

  // Create a new repeater
  async function createRepeater() {
    if (!$currentGuild?.id) return;

    saving = true;
    try {
      // Prepare forum tag conditions if any are selected
      let forumTagConditionsJson: string | null = null;
      if (selectedChannelType === 'forum' && (selectedForumTags.required.length > 0 || selectedForumTags.excluded.length > 0)) {
        const conditions: any = {};
        if (selectedForumTags.required.length > 0) {
          conditions.requiredTags = selectedForumTags.required.map(id => id.toString());
        }
        if (selectedForumTags.excluded.length > 0) {
          conditions.excludedTags = selectedForumTags.excluded.map(id => id.toString());
        }
        forumTagConditionsJson = JSON.stringify(conditions);
      }

      const fullMessage = Object.keys(repeaterMessage).length > 0 ? JSON.stringify(repeaterMessage) : "";

      const request: CreateRepeaterRequest = {
        channelId: BigInt(formData.channelId!),
        message: fullMessage,
        interval: formData.interval,
        startTimeOfDay: formData.startTimeOfDay || null,
        triggerMode: formData.triggerMode,
        activityThreshold: formData.activityThreshold,
        activityTimeWindow: formData.activityTimeWindow,
        conversationDetection: formData.conversationDetection,
        conversationThreshold: formData.conversationThreshold,
        priority: formData.priority,
        noRedundant: formData.noRedundant,
        allowMentions: formData.allowMentions,
        timeSchedulePreset: formData.timeSchedulePreset === "none" ? null : formData.timeSchedulePreset,
        timeConditions: formData.timeSchedulePreset === 'custom' ? formData.timeConditions : null,
        maxAge: formData.maxAge || null,
        maxTriggers: formData.maxTriggers,
        threadAutoSticky: formData.threadAutoSticky,
        threadOnlyMode: formData.threadOnlyMode,
        suppressNotifications: formData.suppressNotifications,
        forumTagConditions: forumTagConditionsJson
      };

      logger.info("Creating repeater request:", {
        triggerMode: formData.triggerMode,
        threadOnlyMode: formData.threadOnlyMode,
        threadAutoSticky: formData.threadAutoSticky,
        selectedChannelType: selectedChannelType
      });

      await repeatersApi.createRepeater($currentGuild.id, request);
      showMessage("Repeater created successfully!", "success");

      // Reset form
      resetForm();

      // Switch to manage tab after successful creation
      activeTab = "manage";

      // Reload data
      await loadAllData();
    } catch (err) {
      logger.error("Failed to create repeater:", err);
      showMessage("Failed to create repeater", "error");
    } finally {
      saving = false;
    }
  }

  // Update an existing repeater
  async function updateRepeater() {
    if (!$currentGuild?.id || !editingRepeaterId || !selectedRepeater || !originalFormData) return;

    saving = true;
    try {
      // Build request with only changed fields
      const request: UpdateRepeaterRequest = {};

      // Check message changes
      const fullMessage = Object.keys(repeaterMessage).length > 0 ? JSON.stringify(repeaterMessage) : "";
      const originalMessage = selectedRepeater.message || "";
      if (fullMessage !== originalMessage) {
        request.message = fullMessage;
      }

      // Check channel changes
      if (formData.channelId !== originalFormData.channelId) {
        request.channelId = formData.channelId ? BigInt(formData.channelId) : null;
      }

      // Check interval changes
      if (formData.interval !== originalFormData.interval) {
        request.interval = formData.interval;
      }

      // Check trigger mode changes
      if (formData.triggerMode !== originalFormData.triggerMode) {
        request.triggerMode = formData.triggerMode;
      }

      // Check activity settings changes
      if (formData.activityThreshold !== originalFormData.activityThreshold) {
        request.activityThreshold = formData.activityThreshold;
      }
      if (formData.activityTimeWindow !== originalFormData.activityTimeWindow) {
        request.activityTimeWindow = formData.activityTimeWindow;
      }

      // Check conversation detection - only send if CHANGED
      if (formData.conversationDetection !== originalFormData.conversationDetection) {
        request.conversationDetection = formData.conversationDetection;
      }
      if (formData.conversationThreshold !== originalFormData.conversationThreshold) {
        request.conversationThreshold = formData.conversationThreshold;
      }

      // Check priority changes
      if (formData.priority !== originalFormData.priority) {
        request.priority = formData.priority;
      }

      // Check queue position changes
      if (formData.queuePosition !== originalFormData.queuePosition) {
        request.queuePosition = formData.queuePosition;
      }

      // Check noRedundant - only send if CHANGED
      if (formData.noRedundant !== originalFormData.noRedundant) {
        request.noRedundant = formData.noRedundant;
      }

      // Check time conditions changes
      const timeConditions = formData.timeSchedulePreset === "custom" ? formData.timeConditions : null;
      const originalTimeConditions = originalFormData.timeSchedulePreset === "custom" ? originalFormData.timeConditions : null;
      if (timeConditions !== originalTimeConditions) {
        request.timeConditions = timeConditions;
      }

      // Check max age/triggers changes
      if (formData.maxAge !== originalFormData.maxAge) {
        request.maxAge = formData.maxAge || null;
      }
      if (formData.maxTriggers !== originalFormData.maxTriggers) {
        request.maxTriggers = formData.maxTriggers;
      }

      // Check thread settings changes
      if (formData.threadAutoSticky !== originalFormData.threadAutoSticky) {
        request.threadAutoSticky = formData.threadAutoSticky;
      }
      if (formData.threadOnlyMode !== originalFormData.threadOnlyMode) {
        request.threadOnlyMode = formData.threadOnlyMode;
      }

      // Check suppressNotifications changes
      if (formData.suppressNotifications !== originalFormData.suppressNotifications) {
        request.suppressNotifications = formData.suppressNotifications;
      }

      // Check forum tag conditions
      let forumTagConditionsJson: string | null = null;
      if (selectedChannelType === 'forum' && (selectedForumTags.required.length > 0 || selectedForumTags.excluded.length > 0)) {
        const conditions: any = {};
        if (selectedForumTags.required.length > 0) {
          conditions.requiredTags = selectedForumTags.required.map(id => id.toString());
        }
        if (selectedForumTags.excluded.length > 0) {
          conditions.excludedTags = selectedForumTags.excluded.map(id => id.toString());
        }
        forumTagConditionsJson = JSON.stringify(conditions);
      }

      // Only send forum tag conditions if they changed
      if (forumTagConditionsJson !== selectedRepeater.forumTagConditions) {
        request.forumTagConditions = forumTagConditionsJson;
      }

      // Check allowMentions changes
      if (formData.allowMentions !== originalFormData.allowMentions) {
        request.allowMentions = formData.allowMentions;
      }

      // Only make the request if something actually changed
      if (Object.keys(request).length === 0) {
        showMessage("No changes detected", "info");
        resetForm();
        activeTab = "manage";
        return;
      }

      logger.info(`Updating repeater ${editingRepeaterId} for guild ${$currentGuild.id} with changes:`, request);
      await repeatersApi.updateRepeater($currentGuild.id, editingRepeaterId!, request);
      logger.info(`Successfully updated repeater ${editingRepeaterId}`);
      showMessage("Repeater updated successfully!", "success");

      // Reset form and switch back to manage tab
      resetForm();
      activeTab = "manage";
      await loadAllData();
    } catch (err) {
      logger.error("Failed to update repeater:", err);
      showMessage("Failed to update repeater", "error");
    } finally {
      saving = false;
    }
  }

  // Delete a repeater
  async function deleteRepeater(repeaterId: number) {
    if (!$currentGuild?.id) return;
    if (!confirm("Are you sure you want to delete this repeater? This action cannot be undone.")) return;

    try {
      await repeatersApi.deleteRepeater($currentGuild.id, repeaterId);
      showMessage("Repeater deleted successfully", "success");
      await loadAllData();
    } catch (err) {
      logger.error("Failed to delete repeater:", err);
      showMessage("Failed to delete repeater", "error");
    }
  }

  // Toggle repeater enabled state
  async function toggleRepeater(repeaterId: number) {
    if (!$currentGuild?.id) return;

    try {
      const repeater = repeaters.find(r => r.id === repeaterId);
      if (!repeater) return;

      await repeatersApi.updateRepeater($currentGuild.id, repeaterId, {
        isEnabled: !repeater.isEnabled
      });
      
      showMessage(`Repeater ${repeater.isEnabled ? 'disabled' : 'enabled'}`, "success");
      await loadAllData();
    } catch (err) {
      logger.error("Failed to toggle repeater:", err);
      showMessage("Failed to toggle repeater", "error");
    }
  }

  // Trigger a repeater immediately
  async function triggerRepeater(repeaterId: number) {
    if (!$currentGuild?.id) return;

    try {
      await repeatersApi.triggerRepeater($currentGuild.id, repeaterId);
      showMessage("Repeater triggered successfully!", "success");
    } catch (err) {
      logger.error("Failed to trigger repeater:", err);
      showMessage("Failed to trigger repeater", "error");
    }
  }

  // Show edit modal for a repeater
  function editRepeater(repeater: RepeaterResponse) {
    selectedRepeater = repeater;
    editingRepeaterId = repeater.id;
    isEditMode = true;

    // Parse message content if it's JSON
    try {
      const messageJson = JSON.parse(repeater.message);
      repeaterMessage = messageJson;
    } catch {
      // Not JSON, treat as plain text - convert to message object
      repeaterMessage = { content: repeater.message };
    }

    // Parse forum tag conditions if present
    let parsedForumTags: any = { required: [], excluded: [] };
    if (repeater.forumTagConditions) {
      try {
        const conditions = JSON.parse(repeater.forumTagConditions);
        parsedForumTags.required = (conditions.requiredTags || []).map((id: any) => BigInt(id));
        parsedForumTags.excluded = (conditions.excludedTags || []).map((id: any) => BigInt(id));
      } catch {
        // Invalid JSON, use defaults
      }
    }

    // Determine channel type for the selected channel
    const channelIdString = repeater.channelId.toString();
    const isForumChannel = forumChannels.some(ch => ch.id === channelIdString);
    selectedChannelType = isForumChannel ? "forum" : "text";

    formData = {
      channelId: channelIdString,
      message: "",
      interval: repeater.interval,
      startTimeOfDay: repeater.startTimeOfDay || "",
      triggerMode: repeater.triggerMode,
      activityThreshold: repeater.activityThreshold,
      activityTimeWindow: repeater.activityTimeWindow,
      conversationDetection: repeater.conversationDetection || false,
      conversationThreshold: repeater.conversationThreshold,
      priority: repeater.priority,
      queuePosition: repeater.queuePosition,
      noRedundant: repeater.noRedundant || false,
      allowMentions: false,
      timeSchedulePreset: repeater.timeConditions ? "custom" : "none",
      timeConditions: repeater.timeConditions || "",
      maxAge: repeater.maxAge || "",
      maxTriggers: repeater.maxTriggers,
      threadAutoSticky: repeater.threadAutoSticky || false,
      threadOnlyMode: repeater.threadOnlyMode || false,
      suppressNotifications: repeater.suppressNotifications || false,
      forumTagConditions: null
    };

    selectedForumTags = parsedForumTags;

    // Store original form data for comparison during update
    originalFormData = JSON.parse(JSON.stringify(formData));

    // Switch to create tab
    activeTab = "create";
  }

  // Reset form data
  function resetForm() {
    formData = {
      channelId: "",
      message: "",
      interval: "00:05:00",
      startTimeOfDay: "",
      triggerMode: StickyTriggerMode.TimeInterval,
      activityThreshold: 5,
      activityTimeWindow: "00:05:00",
      conversationDetection: false,
      conversationThreshold: 3,
      priority: 50,
      queuePosition: 0,
      noRedundant: false,
      allowMentions: false,
      timeSchedulePreset: "none",
      timeConditions: "",
      maxAge: "",
      maxTriggers: null,
      threadAutoSticky: false,
      threadOnlyMode: false,
      suppressNotifications: false,
      forumTagConditions: null
    };

    // Reset additional state
    selectedRepeaterIds = [];
    selectedChannelType = null;
    selectedForumTags = {required: [], excluded: []};

    repeaterMessage = {};
    isEditMode = false;
    editingRepeaterId = null;
    selectedRepeater = null;
    originalFormData = null;
  }

  // Auto-enable thread-only mode when immediate trigger is selected on forum channels
  $effect(() => {
    if (!isEditMode && selectedChannelType === 'forum' && formData.triggerMode === StickyTriggerMode.Immediate) {
      formData.threadOnlyMode = true;
    }
    });

  // Parse repeater message for preview
  function parseRepeaterMessage(messageText: string) {
    try {
      const parsed = JSON.parse(messageText);
      return {
        content: parsed.content || "",
        embeds: parsed.embeds || [],
        components: parsed.components || [],
        hasRichContent: (parsed.embeds && parsed.embeds.length > 0) || (parsed.components && parsed.components.length > 0)
      };
    } catch {
      // Not JSON, treat as plain text
      return {
        content: messageText,
        embeds: [],
        components: [],
        hasRichContent: false
      };
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

  function getChannelName(channelId: bigint): string {
    const channel = allChannels.find(c => c.id === channelId.toString());
    return channel ? `#${channel.name}` : "Unknown channel";
  }


  // Bulk Operations
  function toggleRepeaterSelection(repeaterId: number) {
    if (selectedRepeaterIds.includes(repeaterId)) {
      selectedRepeaterIds = selectedRepeaterIds.filter(id => id !== repeaterId);
    } else {
      selectedRepeaterIds = [...selectedRepeaterIds, repeaterId];
    }
  }

  function selectAllRepeaters() {
    selectedRepeaterIds = repeaters.map(r => r.id);
  }

  function clearSelection() {
    selectedRepeaterIds = [];
  }

  async function bulkToggleRepeaters(enable: boolean) {
    if (!$currentGuild?.id || selectedRepeaterIds.length === 0) return;

    try {
      await repeatersApi.bulkToggleRepeaters($currentGuild.id, selectedRepeaterIds, enable);
      showMessage(`${enable ? "Enabled" : "Disabled"} repeaters successfully`, "success");

      clearSelection();
      await loadAllData();
    } catch (err) {
      logger.error("Failed to bulk toggle repeaters:", err);
      showMessage("Failed to bulk toggle repeaters", "error");
    }
  }

  // Queue Position Management using updateRepeater
  async function updateQueuePosition(repeaterId: number, newPosition: number) {
    if (!$currentGuild?.id) return;

    try {
      await repeatersApi.updateRepeater($currentGuild.id, repeaterId, { queuePosition: newPosition });
      showMessage("Queue position updated successfully", "success");
      await loadAllData();
    } catch (err) {
      logger.error("Failed to update queue position:", err);
      showMessage("Failed to update queue position", "error");
    }
  }

  async function moveRepeaterUp(repeaterId: number) {
    const repeater = repeaters.find(r => r.id === repeaterId);
    if (!repeater || repeater.queuePosition <= 1) return;
    await updateQueuePosition(repeaterId, repeater.queuePosition - 1);
  }

  async function moveRepeaterDown(repeaterId: number) {
    const repeater = repeaters.find(r => r.id === repeaterId);
    if (!repeater) return;
    await updateQueuePosition(repeaterId, repeater.queuePosition + 1);
  }

  // Individual Property Updates using updateRepeater
  async function updateRepeaterInterval(repeaterId: number, interval: string) {
    if (!$currentGuild?.id) return;

    try {
      await repeatersApi.updateRepeater($currentGuild.id, repeaterId, { interval });
      showMessage("Interval updated successfully", "success");
      await loadAllData();
    } catch (err) {
      logger.error("Failed to update interval:", err);
      showMessage("Failed to update interval", "error");
    }
  }

  async function updateRepeaterStartTime(repeaterId: number, startTime: string | null) {
    if (!$currentGuild?.id) return;

    try {
      await repeatersApi.updateRepeater($currentGuild.id, repeaterId, { startTimeOfDay: startTime } as any);
      showMessage("Start time updated successfully", "success");
      await loadAllData();
    } catch (err) {
      logger.error("Failed to update start time:", err);
      showMessage("Failed to update start time", "error");
    }
  }

  async function updateRepeaterConversationThreshold(repeaterId: number, threshold: number) {
    if (!$currentGuild?.id) return;

    try {
      await repeatersApi.updateRepeater($currentGuild.id, repeaterId, { conversationThreshold: threshold });
      showMessage("Conversation threshold updated successfully", "success");
      await loadAllData();
    } catch (err) {
      logger.error("Failed to update conversation threshold:", err);
      showMessage("Failed to update conversation threshold", "error");
    }
  }

  async function updateRepeaterExpiry(repeaterId: number, maxAge?: string, maxTriggers?: number) {
    if (!$currentGuild?.id) return;

    try {
      await repeatersApi.updateRepeater($currentGuild.id, repeaterId, {
        maxAge: maxAge || null,
        maxTriggers: maxTriggers || null
      });
      showMessage("Expiry settings updated successfully", "success");
      await loadAllData();
    } catch (err) {
      logger.error("Failed to update expiry settings:", err);
      showMessage("Failed to update expiry settings", "error");
    }
  }

  // Forum Tag Management - uses forumTagConditions JSON field
  async function updateForumTagConditions(repeaterId: number) {
    if (!$currentGuild?.id) return;

    try {
      const conditions = {
        required: selectedForumTags.required.map(id => id.toString()),
        excluded: selectedForumTags.excluded.map(id => id.toString())
      };

      const conditionsJson = JSON.stringify(conditions);

      await repeatersApi.updateRepeater($currentGuild.id, repeaterId, {
        forumTagConditions: conditionsJson
      });
      showMessage("Forum tag conditions updated successfully", "success");
      showForumTagEditor = false;
      await loadAllData();
    } catch (err) {
      logger.error("Failed to update forum tag conditions:", err);
      showMessage("Failed to update forum tag conditions", "error");
    }
  }

  // Thread Sticky Messages - already tracked in threadStickyMessages property
  async function loadThreadStickyMessages(repeaterId: number) {
    const repeater = repeaters.find(r => r.id === repeaterId);
    if (repeater?.threadStickyMessages) {
      // Thread sticky messages are stored as JSON, could parse and display if needed
      logger.info("Thread sticky messages:", repeater.threadStickyMessages);
    }
  }

  // Forum tags loading - for forum channel sticky posts
  async function loadForumTags(repeaterId?: number) {
    // Tags are already loaded with channel data in availableForumTags
    // If we need to load forum tag conditions for a repeater:
    if (repeaterId) {
      const repeater = repeaters.find(r => r.id === repeaterId);
      if (repeater?.forumTagConditions) {
        try {
          const conditions = JSON.parse(repeater.forumTagConditions);
          selectedForumTags = {
            required: conditions.required?.map((id: string) => BigInt(id)) || [],
            excluded: conditions.excluded?.map((id: string) => BigInt(id)) || []
          };
        } catch (err) {
          logger.error("Failed to parse forum tag conditions:", err);
        }
      }
    }
  }

  // Helper function to handle forum tag toggle
  function handleRequiredTagToggle(tag: any, checked: boolean) {
    if (checked) {
      selectedForumTags.required = [...selectedForumTags.required, tag.id];
      selectedForumTags.excluded = selectedForumTags.excluded.filter(id => id !== tag.id);
    } else {
      selectedForumTags.required = selectedForumTags.required.filter(id => id !== tag.id);
    }
  }

  function handleExcludedTagToggle(tag: any, checked: boolean) {
    if (checked) {
      selectedForumTags.excluded = [...selectedForumTags.excluded, tag.id];
      selectedForumTags.required = selectedForumTags.required.filter(id => id !== tag.id);
    } else {
      selectedForumTags.excluded = selectedForumTags.excluded.filter(id => id !== tag.id);
    }
  }

  // Advanced time editor
  function openAdvancedTimeEditor(repeaterId?: number) {
    // Feature for editing complex time conditions
    if (repeaterId) {
      const repeater = repeaters.find(r => r.id === repeaterId);
      if (repeater?.timeConditions) {
        formData.timeConditions = repeater.timeConditions;
      }
    }
  }

  // Trigger mode change handler
  function handleTriggerModeChange(detail: any) {
    if (detail.selected && typeof detail.selected === "string") {
      formData.triggerMode = parseInt(detail.selected);
    }
  }

  onMount(() => {
    loadAllData();
  });

  // Reload data when guild changes (e.g. restored from localStorage after mount)
  $effect(() => {
    if ($currentGuild?.id) {
      loadAllData();
    }
  });

  // Tabs configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: "fa-chart-bar" },
    { id: "manage", label: "Manage Repeaters", icon: "fa-clock" },
    { id: "create", label: "Create New", icon: "fa-plus" }
  ];

  // Action buttons configuration
    let actionButtons = $derived([
    {
      label: "Refresh",
      icon: "fa-arrows-rotate",
      action: loadAllData,
      loading: loading
    }
    ]);
</script>

{#snippet statusMessages()}
  <!-- Status Message -->
  {#if message}
    <div class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-all"
         style="background: {messageType === 'success' ? $colorStore.primary + '20' : messageType === 'error' ? $colorStore.accent + '20' : $colorStore.primary + '20'};
          border: 1px solid {messageType === 'success' ? $colorStore.primary + '30' : messageType === 'error' ? $colorStore.accent + '30' : $colorStore.primary + '30'};"
         in:fly={{ x: 20, duration: 300 }}>
      {#if messageType === 'success'}
        <i class="fa-utility-duo fa-regular fa-circle-check"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
      {:else if messageType === 'error'}
        <i class="fa-utility-duo fa-regular fa-circle-exclamation"
           style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
      {:else}
        <i class="fa-utility-duo fa-regular fa-bell"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
      {/if}
      <span
        style="color: {messageType === 'success' ? $colorStore.primary : messageType === 'error' ? $colorStore.accent : $colorStore.primary}">{message}</span>
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  bind:activeTab
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-clock"
  {statusMessages}
  subtitle="Manage automated recurring messages and sticky posts"
  {tabs}
  title="Message Repeaters"
>

  <!-- Tab Content -->
  {#if activeTab === 'overview'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {#if repeaterStats}
          <StatCard
            icon="fa-clock"
            label="Total Repeaters"
            value={repeaterStats.totalRepeaters}
            subtitle="configured"
            iconColor="primary"
            animationDelay={0}
          />

          <StatCard
            icon="fa-bell"
            label="Active Repeaters"
            value={repeaterStats.activeRepeaters}
            subtitle="currently running"
            iconColor="secondary"
            animationDelay={100}
          />

          <StatCard
            icon="fa-star"
            label="Total Displays"
            value={repeaterStats.totalDisplays}
            subtitle="messages sent"
            iconColor="accent"
            animationDelay={200}
          />

          <StatCard
            icon="fa-calendar"
            label="Scheduled"
            value={repeaterStats.timeScheduledRepeaters}
            subtitle="with time conditions"
            iconColor="primary"
            animationDelay={300}
          />
        {:else}
          <!-- Loading state -->
          {#each Array(4).fill(0) as _, i (i)}
            <div class="rounded-xl p-6 animate-pulse"
                 style="background: {$colorStore.primary}08;">
              <div class="h-12 w-12 rounded-xl mb-4"
                   style="background: {$colorStore.primary}20;"></div>
                <div class="h-6 rounded-sm mb-2"
                   style="background: {$colorStore.primary}20; width: 60%;"></div>
                <div class="h-4 rounded-sm"
                   style="background: {$colorStore.primary}15; width: 80%;"></div>
            </div>
          {/each}
        {/if}
      </div>

      <!-- Additional Stats in Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <!-- Trigger Mode Distribution -->
        {#if repeaterStats?.triggerModeDistribution}
          <div class="rounded-2xl p-4 md:p-6 shadow-lg"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
            <div class="flex items-center gap-2 mb-4">
              <i class="fa-solid fa-gear" style="color: {$colorStore.primary}; font-size: 18px;"></i>
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">Trigger Modes</h3>
            </div>

            <div class="space-y-2">
              {#each Object.entries(repeaterStats.triggerModeDistribution) as [mode, count] (mode)}
                <div class="flex items-center justify-between p-3 rounded-lg"
                     style="background: {$colorStore.primary}08;">
                  <span class="text-sm" style="color: {$colorStore.text}">{mode}</span>
                  <span class="font-bold" style="color: {$colorStore.primary}">{count}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Most Active Repeater -->
        {#if repeaterStats?.mostActiveRepeater}
          <div class="rounded-2xl p-4 md:p-6 shadow-lg"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
            <div class="flex items-center gap-2 mb-4">
              <i class="fa-solid fa-star" style="color: {$colorStore.secondary}; font-size: 18px;"></i>
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">Most Active</h3>
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium" style="color: {$colorStore.text}">
                  {getChannelName(repeaterStats.mostActiveRepeater.channelId)}
                </span>
                <span class="font-bold" style="color: {$colorStore.secondary}">
                  {repeaterStats.mostActiveRepeater.displayCount} displays
                </span>
              </div>
              <p class="text-xs line-clamp-2" style="color: {$colorStore.muted}">
                {repeaterStats.mostActiveRepeater.message.substring(0, 100)}...
              </p>
            </div>
          </div>
        {/if}
      </div>
    </div>

  {:else if activeTab === 'manage'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      <!-- Repeaters List -->
      {#if repeaters.length === 0}
        <!-- Empty state -->
        <div class="text-center py-12 rounded-2xl"
             style="background: {$colorStore.primary}08;">
          <i class="fa-utility-duo fa-regular fa-clock"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 64px; opacity: 0.5;"></i>
          <h3 class="text-xl font-semibold mb-2 mt-4" style="color: {$colorStore.text}">No Repeaters</h3>
          <p class="mb-6" style="color: {$colorStore.muted}">
            Create your first repeater to start sending automated messages.
          </p>
          <div class="flex justify-center">
            <button
              class="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={() => activeTab = 'create'}
            >
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
                <span>Create Repeater</span>
              </div>
            </button>
          </div>
        </div>
      {:else}
        <div class="flex flex-col gap-4 mb-6">
          <!-- Selection Controls -->
          <div class="flex flex-wrap items-center gap-2">
            <button
              class="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
              onclick={selectAllRepeaters}
              disabled={repeaters.length === 0}
            >
              <i class="fa-solid fa-square-check mr-1" style="font-size: 14px;"></i>
              Select All ({repeaters.length})
            </button>

            {#if selectedRepeaterIds.length > 0}
              <button
                class="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                onclick={clearSelection}
              >
                <i class="fa-solid fa-square mr-1" style="font-size: 14px;"></i>
                Clear ({selectedRepeaterIds.length})
              </button>
            {/if}
          </div>

          <!-- Bulk Actions -->
          {#if selectedRepeaterIds.length > 0}
            <div class="flex flex-wrap items-center gap-2" in:fly={{ x: 20, duration: 300 }}>
              <span class="text-xs sm:text-sm font-medium" style="color: {$colorStore.text}">
                {selectedRepeaterIds.length} selected:
              </span>

              <button
                class="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                onclick={() => bulkToggleRepeaters(true)}
              >
                <i class="fa-solid fa-check mr-1" style="font-size: 14px;"></i>
                Enable
              </button>

              <button
                class="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                onclick={() => bulkToggleRepeaters(false)}
              >
                <i class="fa-solid fa-xmark mr-1" style="font-size: 14px;"></i>
                Disable
              </button>
            </div>
          {/if}
        </div>

        <!-- Repeaters grid -->
        <div class="space-y-4">
          {#each repeaters as repeater, index}
            {@const parsedMessage = parseRepeaterMessage(repeater.message)}
            <div class="rounded-2xl p-4 md:p-6 border shadow-lg transition-all duration-200 hover:scale-[1.01]"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {repeater.isEnabled ? $colorStore.primary + '30' : $colorStore.muted + '20'};"
                 in:fly={{ y: 20, duration: 300, delay: index * 50 }}>
              
              <!-- Repeater Header -->
              <div class="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4">
                <div class="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                  <!-- Selection Checkbox -->
                  <label for="repeater-select-{repeater.id}"
                         class="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-sm border-2 cursor-pointer transition-all duration-200 hover:scale-110 flex-shrink-0 mt-1"
                         style="border-color: {selectedRepeaterIds.includes(repeater.id) ? $colorStore.primary : $colorStore.muted};
                                background: {selectedRepeaterIds.includes(repeater.id) ? $colorStore.primary : 'transparent'};">
                    <input
                      id="repeater-select-{repeater.id}"
                      type="checkbox"
                      class="sr-only"
                      checked={selectedRepeaterIds.includes(repeater.id)}
                      onchange={() => toggleRepeaterSelection(repeater.id)}
                    >
                    {#if selectedRepeaterIds.includes(repeater.id)}
                      <i class="fa-solid fa-check" style="color: white; font-size: 12px;"></i>
                    {/if}
                  </label>

                  <div class="p-1.5 sm:p-2 rounded-lg flex-shrink-0"
                       style="background: {repeater.isEnabled ? $colorStore.primary + '20' : $colorStore.muted + '20'};">
                    <i class="fa-solid fa-hashtag"
                       style="color: {repeater.isEnabled ? $colorStore.primary : $colorStore.muted}; font-size: 16px;"></i>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-sm sm:text-lg font-bold truncate" style="color: {$colorStore.text}">
                      {getChannelName(repeater.channelId)}
                    </h3>
                    <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm"
                         style="color: {$colorStore.muted}">
                      <span class="whitespace-nowrap">{getTriggerModeLabel(repeater.triggerMode)}</span>
                      <span class="hidden sm:inline">Priority: {repeater.priority}</span>
                      <span class="whitespace-nowrap">Queue: #{repeater.queuePosition}</span>
                      <span class="whitespace-nowrap">{repeater.displayCount} displays</span>
                    </div>
                  </div>
                </div>

                <!-- Status indicator -->
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <div class="w-2.5 h-2.5 rounded-full"
                       style="background: {repeater.isEnabled ? $colorStore.primary : $colorStore.muted};"></div>
                  <span class="text-xs sm:text-sm font-medium whitespace-nowrap"
                        style="color: {repeater.isEnabled ? $colorStore.primary : $colorStore.muted}">
                    {repeater.isEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div class="mb-4">
                {#if repeater.message}
                  <!-- Use FullscreenEmbedBuilder as read-only preview -->
                  <div class="[&_button]:pointer-events-none">
                    <FullscreenEmbedBuilder
                      value={toBuilderValue(repeater.message)}
                      previewTitle="Message Preview"
                      previewDescription="Click Edit to modify"
                      placeholder="No message content"
                      icon="fa-comment"
                      allowContent={false}
                      allowMultipleEmbeds={false}
                      allowComponents={false}
                      guildId={$currentGuild?.id}
                      user={data.user}
                      onchange={() => {}}
                      onclose={() => {}}
                    />
                  </div>
                {:else}
                  <!-- Empty message -->
                  <div class="p-3 rounded-lg text-center" style="background: {$colorStore.primary}08;">
                    <p class="text-sm" style="color: {$colorStore.muted}">
                      No message configured
                    </p>
                  </div>
                {/if}
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4">
                {#if repeater.triggerMode === StickyTriggerMode.Immediate}
                  <!-- Immediate Mode Info -->
                  <div>
                    <div class="text-xs font-medium mb-1" style="color: {$colorStore.muted}">Trigger Mode</div>
                    <div class="text-sm flex items-center gap-2" style="color: {$colorStore.text}">
                      <i class="fa-solid fa-bolt" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                      Immediate Response
                    </div>
                    <div class="text-xs mt-1" style="color: {$colorStore.muted}">
                      Reposts instantly when messages are sent
                    </div>
                  </div>
                {:else}
                  <!-- Time-based modes show interval and next execution -->
                  <div>
                    <div class="text-xs font-medium mb-1" style="color: {$colorStore.muted}">Interval</div>
                    <div class="text-sm" style="color: {$colorStore.text}">
                      {formatInterval(repeater.interval)}
                    </div>
                    {#if repeater.startTimeOfDay}
                      <div class="text-xs mt-1" style="color: {$colorStore.muted}">
                        Start: {repeater.startTimeOfDay}
                      </div>
                    {/if}
                  </div>

                  <div>
                    <div class="text-xs font-medium mb-1" style="color: {$colorStore.muted}">Next Execution</div>
                    <div class="text-sm" style="color: {$colorStore.text}">
                      {formatTimeUntilNext(repeater.nextExecution)}
                    </div>
                    {#if repeater.requiresTimezone}
                      <div class="text-xs mt-1" style="color: {$colorStore.accent}">
                        Timezone needed
                      </div>
                    {/if}
                  </div>
                {/if}

                {#if repeater.triggerMode === StickyTriggerMode.OnActivity || repeater.triggerMode === StickyTriggerMode.OnNoActivity || repeater.triggerMode === StickyTriggerMode.AfterMessages}
                  <!-- Activity modes show activity settings -->
                  <div>
                    <div class="text-xs font-medium mb-1" style="color: {$colorStore.muted}">Activity Settings</div>
                    <div class="text-sm" style="color: {$colorStore.text}">
                      Threshold: {repeater.activityThreshold}
                    </div>
                    <div class="text-xs mt-1" style="color: {$colorStore.muted}">
                      Window: {formatInterval(repeater.activityTimeWindow)}
                    </div>
                    {#if repeater.conversationDetection}
                      <div class="text-xs" style="color: {$colorStore.muted}">
                        Conversation: {repeater.conversationThreshold}/min
                      </div>
                    {/if}
                  </div>
                {/if}

                <div>
                  <div class="text-xs font-medium mb-1" style="color: {$colorStore.muted}">Auto-Expiry</div>
                  <div class="text-sm" style="color: {$colorStore.text}">
                    {#if repeater.maxAge || repeater.maxTriggers}
                      {#if repeater.maxAge}
                        Age: {repeater.maxAge}
                      {/if}
                      {#if repeater.maxTriggers}
                        Max: {repeater.maxTriggers} triggers
                      {/if}
                    {:else}
                      Never expires
                    {/if}
                  </div>
                </div>
              </div>

              <!-- Feature Badges -->
              <div class="mb-4">
                <div class="text-xs font-medium mb-2" style="color: {$colorStore.muted}">Features & Settings</div>
                <div class="flex flex-wrap gap-2">
                  {#if repeater.conversationDetection}
                    <span class="px-2 py-1 rounded-sm text-xs"
                          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                      <i class="fa-solid fa-users" style="font-size: 12px;"></i>
                      Conversation Detection
                    </span>
                  {/if}
                  {#if repeater.threadAutoSticky}
                    <span class="px-2 py-1 rounded-sm text-xs"
                          style="background: {$colorStore.accent}20; color: {$colorStore.accent}">
                      <i class="fa-solid fa-comment" style="font-size: 12px;"></i>
                      Thread Auto Sticky
                    </span>
                  {/if}
                  {#if repeater.threadOnlyMode}
                    <span class="px-2 py-1 rounded-sm text-xs"
                          style="background: {$colorStore.accent}20; color: {$colorStore.accent}">
                      Thread Only
                    </span>
                  {/if}
                  {#if repeater.timeConditions}
                    <span class="px-2 py-1 rounded-sm text-xs"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary}">
                      <i class="fa-solid fa-clock" style="font-size: 12px;"></i>
                      Time Scheduled
                    </span>
                  {/if}
                  {#if repeater.forumTagConditions}
                    <span class="px-2 py-1 rounded-sm text-xs"
                          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                      <i class="fa-solid fa-tags" style="font-size: 12px;"></i>
                      Forum Tags
                    </span>
                  {/if}
                  {#if repeater.noRedundant}
                    <span class="px-2 py-1 rounded-sm text-xs"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary}">
                      No Redundant
                    </span>
                  {/if}
                </div>
              </div>

              <div class="space-y-3">
                <!-- Primary Actions -->
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <button
                    class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                    onclick={() => editRepeater(repeater)}
                  >
                    <i class="fa-solid fa-pen" style="font-size: 12px;"></i>
                    <span class="hidden sm:inline">Edit</span>
                    <span class="sm:hidden">Edit</span>
                  </button>

                  <button
                    class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                    style="background: {repeater.isEnabled ? $colorStore.accent + '20' : $colorStore.primary + '20'};
                           color: {repeater.isEnabled ? $colorStore.accent : $colorStore.primary};"
                    onclick={() => toggleRepeater(repeater.id)}
                  >
                    <i class="fa-solid fa-toggle-off" style="font-size: 12px;"></i>
                    {repeater.isEnabled ? 'Disable' : 'Enable'}
                  </button>

                  <button
                    class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                    style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                    onclick={() => triggerRepeater(repeater.id)}
                    disabled={!repeater.isEnabled}
                  >
                    <i class="fa-solid fa-play" style="font-size: 12px;"></i>
                    <span class="hidden sm:inline">Trigger Now</span>
                    <span class="sm:hidden">Trigger</span>
                  </button>

                  <!-- Queue Position Controls -->
                  <div class="flex items-center">
                    <button aria-label="Move repeater up"
                            class="flex items-center gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-l-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                      style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                      onclick={() => moveRepeaterUp(repeater.id)}
                      disabled={repeater.queuePosition <= 1}
                    >
                      <i class="fa-solid fa-arrow-up" style="font-size: 12px;"></i>
                    </button>
                    <button aria-label="Move repeater down"
                            class="flex items-center gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-r-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                      style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                      onclick={() => moveRepeaterDown(repeater.id)}
                    >
                      <i class="fa-solid fa-arrow-down" style="font-size: 12px;"></i>
                    </button>
                  </div>

                  <button
                    class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                    style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                    onclick={() => deleteRepeater(repeater.id)}
                  >
                    <i class="fa-solid fa-trash" style="font-size: 12px;"></i>
                    <span class="hidden sm:inline">Delete</span>
                    <span class="sm:hidden">Del</span>
                  </button>
                </div>

                <!-- Advanced Controls -->
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <!-- Quick Property Updates -->
                  <button
                    class="flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium transition-all duration-200 hover:scale-[1.02]"
                    style="background: {$colorStore.primary}15; color: {$colorStore.primary};"
                    onclick={() => {
                      const newInterval = prompt('New interval (HH:MM:SS):', repeater.interval);
                      if (newInterval) updateRepeaterInterval(repeater.id, newInterval);
                    }}
                  >
                    <i class="fa-solid fa-clock" style="font-size: 10px;"></i>
                    <span class="hidden sm:inline">Interval</span>
                    <span class="sm:hidden">Int</span>
                  </button>

                  <button
                    class="flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium transition-all duration-200 hover:scale-[1.02]"
                    style="background: {$colorStore.primary}15; color: {$colorStore.primary};"
                    onclick={() => {
                      const newTime = prompt('Start time (HH:MM, leave empty to disable):', repeater.startTimeOfDay || '');
                      updateRepeaterStartTime(repeater.id, newTime || null);
                    }}
                  >
                    <i class="fa-solid fa-clock" style="font-size: 10px;"></i>
                    <span class="hidden sm:inline">Start Time</span>
                    <span class="sm:hidden">Start</span>
                  </button>

                  {#if repeater.conversationDetection}
                    <button
                      class="flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium transition-all duration-200 hover:scale-[1.02]"
                      style="background: {$colorStore.secondary}15; color: {$colorStore.secondary};"
                      onclick={() => {
                        const newThreshold = prompt('Conversation threshold (messages/minute):', repeater.conversationThreshold.toString());
                        if (newThreshold) updateRepeaterConversationThreshold(repeater.id, parseInt(newThreshold));
                      }}
                    >
                      <i class="fa-solid fa-users" style="font-size: 10px;"></i>
                      <span class="whitespace-nowrap">Conv: {repeater.conversationThreshold}/min</span>
                    </button>
                  {/if}

                  <button
                    class="flex items-center gap-2 px-2 py-1 rounded-sm text-xs font-medium transition-all duration-200 hover:scale-[1.02]"
                    style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
                    onclick={() => {
                      const maxAge = prompt('Max age (e.g., 7.00:00:00 for 7 days, empty for no limit):', repeater.maxAge || '');
                      const maxTriggers = prompt('Max triggers (empty for no limit):', repeater.maxTriggers?.toString() || '');
                      updateRepeaterExpiry(repeater.id, maxAge || undefined, maxTriggers ? parseInt(maxTriggers) : undefined);
                    }}
                  >
                    <i class="fa-solid fa-calendar" style="font-size: 12px;"></i>
                    Expiry
                  </button>

                  <!-- Advanced Features -->
                  {#if repeater.forumTagConditions}
                    <button
                      class="flex items-center gap-2 px-2 py-1 rounded-sm text-xs font-medium transition-all duration-200 hover:scale-[1.02]"
                      style="background: {$colorStore.secondary}15; color: {$colorStore.secondary};"
                      onclick={() => {
                        selectedRepeater = repeater;
                        showForumTagEditor = true;
                        loadForumTags(repeater.id);
                      }}
                    >
                      <i class="fa-solid fa-tags" style="font-size: 12px;"></i>
                      Forum Tags
                    </button>
                  {/if}

                  {#if repeater.timeConditions}
                    <button
                      class="flex items-center gap-2 px-2 py-1 rounded-sm text-xs font-medium transition-all duration-200 hover:scale-[1.02]"
                      style="background: {$colorStore.primary}15; color: {$colorStore.primary};"
                      onclick={() => openAdvancedTimeEditor(repeater.id)}
                    >
                      <i class="fa-solid fa-code" style="font-size: 12px;"></i>
                      Time JSON
                    </button>
                  {/if}

                  {#if repeater.threadAutoSticky || repeater.threadOnlyMode}
                    <button
                      class="flex items-center gap-2 px-2 py-1 rounded-sm text-xs font-medium transition-all duration-200 hover:scale-[1.02]"
                      style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
                      onclick={() => {
                        selectedRepeater = repeater;
                        loadThreadStickyMessages(repeater.id);
                      }}
                    >
                      <i class="fa-solid fa-comment" style="font-size: 12px;"></i>
                      Thread Messages
                    </button>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

  {:else if activeTab === 'create'}
    <div class="w-full" in:fade={{ duration: 200 }}>
      <!-- Create Repeater Form -->
      <div class="rounded-2xl border shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                  border-color: {$colorStore.primary}30;">

        <!-- Header Section -->
        <div class="p-4 sm:p-6 md:p-8 border-b" style="border-color: {$colorStore.primary}20;">
          <div class="flex items-start sm:items-center gap-3">
            {#if isEditMode}
              <i class="fa-solid fa-pen flex-shrink-0" style="color: {$colorStore.secondary}; font-size: 20px;"></i>
              <div class="min-w-0 flex-1">
                <h2 class="text-lg sm:text-xl md:text-2xl font-bold truncate" style="color: {$colorStore.text}">Edit
                  Repeater</h2>
                <p class="text-xs sm:text-sm mt-1 break-words" style="color: {$colorStore.muted}">Modify settings for
                  repeater #{editingRepeaterId}</p>
              </div>
            {:else}
              <i class="fa-solid fa-plus flex-shrink-0" style="color: {$colorStore.primary}; font-size: 20px;"></i>
              <div class="min-w-0 flex-1">
                <h2 class="text-lg sm:text-xl md:text-2xl font-bold" style="color: {$colorStore.text}">Create New
                  Repeater</h2>
                <p class="text-xs sm:text-sm mt-1" style="color: {$colorStore.muted}">Set up automated messages for your
                  server</p>
              </div>
            {/if}
          </div>
        </div>

        <form onsubmit={(e) => { e.preventDefault(); isEditMode ? updateRepeater() : createRepeater(); }}
              class="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 md:space-y-10">

          <div class="space-y-4">
            <div class="flex items-center gap-2 mb-4">
              <i class="fa-solid fa-hashtag" style="color: {$colorStore.primary}; font-size: 18px;"></i>
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">Target Channel</h3>
            </div>

            <div class="pl-0 md:pl-7">
              <DiscordSelector
                type="channel"
                options={allChannels.map(ch => ({ id: ch.id, name: ch.name }))}
                bind:selected={formData.channelId}
                placeholder="Select channel..." />
              {#if selectedChannelType === 'forum' && availableForumTags.length > 0}
                <div class="mt-6 p-5 md:p-6 rounded-xl border"
                     style="background: {$colorStore.secondary}05; border-color: {$colorStore.secondary}20;"
                     in:fly={{ y: 20, duration: 300 }}>
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div class="flex items-center gap-2">
                      <i class="fa-solid fa-tags" style="color: {$colorStore.secondary}; font-size: 16px;"></i>
                      <h4 class="text-base font-semibold" style="color: {$colorStore.text}">Forum Tag Filters</h4>
                      <span class="text-xs px-2 py-1 rounded-sm"
                            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                          Optional
                        </span>
                    </div>

                    {#if selectedForumTags.required.length > 0 || selectedForumTags.excluded.length > 0}
                      <button
                        type="button"
                        class="text-sm px-3 py-1.5 rounded-lg transition-all hover:scale-[1.02]"
                        style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                        onclick={() => selectedForumTags = {required: [], excluded: []}}
                      >
                        Clear All
                      </button>
                    {/if}
                  </div>

                  <p class="text-sm mb-6" style="color: {$colorStore.muted}">
                    Configure which forum tags are required or excluded for this repeater.
                  </p>

                  <!-- Required/Excluded Sections -->
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                    <!-- Required Tags Section -->
                    <div>
                      <h5 class="text-sm font-medium mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                        <i class="fa-solid fa-check" style="color: {$colorStore.primary}; font-size: 14px;"></i>
                        Must Have These Tags
                      </h5>
                      <div class="space-y-2.5">
                        {#each availableForumTags as tag}
                          <label for="required-tag-{tag.id}"
                                 class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                                 style="background: {selectedForumTags.required.includes(tag.id) ? $colorStore.primary + '15' : $colorStore.primary + '05'};
                                          border: 1px solid {selectedForumTags.required.includes(tag.id) ? $colorStore.primary + '40' : 'transparent'};">
                            <input
                              id="required-tag-{tag.id}"
                              type="checkbox"
                              class="sr-only"
                              checked={selectedForumTags.required.includes(tag.id)}
                              onchange={(e) => handleRequiredTagToggle(tag, e.currentTarget.checked)}
                            >
                            <span
                              class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0"
                              style="border-color: {selectedForumTags.required.includes(tag.id) ? $colorStore.primary : $colorStore.muted};
                                          background: {selectedForumTags.required.includes(tag.id) ? $colorStore.primary : 'transparent'};">
                                {#if selectedForumTags.required.includes(tag.id)}
                                  <i class="fa-solid fa-check" style="color: white; font-size: 10px;"></i>
                                {/if}
                              </span>
                            <span class="flex items-center gap-2">
                                {#if tag.emoji}
                                  <span class="text-base">{tag.emoji}</span>
                                {/if}
                              <span class="text-sm" style="color: {$colorStore.text}">{tag.name}</span>
                              </span>
                          </label>
                        {/each}

                        {#if selectedForumTags.required.length === 0}
                          <div class="text-sm text-center py-4 rounded-lg"
                               style="background: {$colorStore.primary}05; color: {$colorStore.muted}">
                            No tags required - will work on all threads
                          </div>
                        {/if}
                      </div>
                    </div>

                    <!-- Excluded Tags Section -->
                    <div>
                      <h5 class="text-sm font-medium mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                        <i class="fa-solid fa-xmark" style="color: {$colorStore.accent}; font-size: 14px;"></i>
                        Never Use These Tags
                      </h5>
                      <div class="space-y-2.5">
                        {#each availableForumTags as tag}
                          <label for="excluded-tag-{tag.id}"
                                 class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                                 style="background: {selectedForumTags.excluded.includes(tag.id) ? $colorStore.accent + '15' : $colorStore.accent + '05'};
                                          border: 1px solid {selectedForumTags.excluded.includes(tag.id) ? $colorStore.accent + '40' : 'transparent'};">
                            <input
                              id="excluded-tag-{tag.id}"
                              type="checkbox"
                              class="sr-only"
                              checked={selectedForumTags.excluded.includes(tag.id)}
                              disabled={selectedForumTags.required.includes(tag.id)}
                              onchange={(e) => handleExcludedTagToggle(tag, e.currentTarget.checked)}
                            >
                            <span
                              class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0"
                              style="border-color: {selectedForumTags.excluded.includes(tag.id) ? $colorStore.accent : $colorStore.muted};
                                          background: {selectedForumTags.excluded.includes(tag.id) ? $colorStore.accent : 'transparent'};
                                          opacity: {selectedForumTags.required.includes(tag.id) ? '0.3' : '1'};">
                                {#if selectedForumTags.excluded.includes(tag.id)}
                                  <i class="fa-solid fa-xmark" style="color: white; font-size: 10px;"></i>
                                {/if}
                              </span>
                            <span class="flex items-center gap-2"
                                  style="opacity: {selectedForumTags.required.includes(tag.id) ? '0.5' : '1'}">
                                {#if tag.emoji}
                                  <span class="text-base">{tag.emoji}</span>
                                {/if}
                              <span class="text-sm" style="color: {$colorStore.text}">{tag.name}</span>
                              {#if selectedForumTags.required.includes(tag.id)}
                                  <span class="text-xs px-2 py-0.5 rounded-md"
                                        style="background: {$colorStore.primary}; color: white;">Required</span>
                                {/if}
                              </span>
                          </label>
                        {/each}

                        {#if selectedForumTags.excluded.length === 0}
                          <div class="text-sm text-center py-4 rounded-lg"
                               style="background: {$colorStore.accent}05; color: {$colorStore.muted}">
                            No tags excluded - will work on all thread types
                          </div>
                        {/if}
                      </div>
                    </div>
                  </div>

                  <!-- Smart Summary -->
                  {#if selectedForumTags.required.length > 0 || selectedForumTags.excluded.length > 0}
                    <div class="mt-6 p-4 rounded-lg transition-all duration-300"
                         style="background: {$colorStore.primary}08;"
                         in:fly={{ y: 10, duration: 200 }}>
                      <div class="flex flex-wrap items-center gap-4 text-sm">
                        {#if selectedForumTags.required.length > 0}
                          <div class="flex items-center gap-2" style="color: {$colorStore.primary}">
                            <i class="fa-solid fa-check" style="font-size: 12px;"></i>
                            <span class="font-medium">{selectedForumTags.required.length}
                              required tag{selectedForumTags.required.length > 1 ? 's' : ''}</span>
                          </div>
                        {/if}
                        {#if selectedForumTags.excluded.length > 0}
                          <div class="flex items-center gap-2" style="color: {$colorStore.accent}">
                            <i class="fa-solid fa-xmark" style="font-size: 12px;"></i>
                            <span class="font-medium">{selectedForumTags.excluded.length}
                              excluded tag{selectedForumTags.excluded.length > 1 ? 's' : ''}</span>
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          </div>

          <div>
            <div class="flex items-center gap-2 mb-4">
              <i class="fa-solid fa-message" style="color: {$colorStore.primary}; font-size: 18px;"></i>
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">Message Content</h3>
            </div>

            <div class="pl-0 md:pl-7 space-y-3">
              <FullscreenEmbedBuilder
                bind:value={repeaterMessage}
                previewTitle="Repeater Message"
                previewDescription="Message that will be repeated in the channel"
                icon="fa-clock"
                allowContent={true}
                allowMultipleEmbeds={true}
                maxEmbeds={10}
                allowComponents={true}
                additionalPlaceholders={[
                    { category: "Server", name: "%server%", description: "Server name" },
                    { category: "Server", name: "%server.members%", description: "Member count" },
                    { category: "Server", name: "%server.id%", description: "Server ID" }
                  ]}
                guildId={$currentGuild?.id}
                user={data.user}
                placeholder="Click to configure repeater message with rich embeds and components"
              />

              <p class="text-sm" style="color: {$colorStore.muted}">
                Create rich messages with embeds, buttons, and select menus. Supports Discord markdown and placeholders.
              </p>
            </div>
          </div>

          <div>
            <div class="flex items-center gap-2 mb-4">
              <i class="fa-solid fa-gear" style="color: {$colorStore.primary}; font-size: 18px;"></i>
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">Trigger Settings</h3>
            </div>

            <div class="pl-0 md:pl-7 space-y-6">
              <div>
                <span class="block text-sm font-medium mb-3" style="color: {$colorStore.text}">How should this repeater trigger?</span>
                <DiscordSelector
                  type="custom"
                  options={triggerModeOptions}
                  selected={formData.triggerMode.toString()}
                  placeholder="Select trigger mode..."
                  onchange={handleTriggerModeChange} />
              </div>

              {#if formData.triggerMode === StickyTriggerMode.TimeInterval}
                <div in:fly={{ y: 20, duration: 300 }}>
                  <span class="block text-sm font-medium mb-3" style="color: {$colorStore.text}">Repeat Every</span>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                {#each [
                  { value: "00:01:00", label: "1 minute" },
                  { value: "00:05:00", label: "5 minutes" },
                  { value: "00:15:00", label: "15 minutes" },
                  { value: "01:00:00", label: "1 hour" },
                  { value: "06:00:00", label: "6 hours" },
                  { value: "1.00:00:00", label: "Daily" }
                ] as preset}
                  <label for="interval-preset-{preset.value}"
                         class="flex items-center justify-center rounded-lg p-2 sm:p-2.5 border cursor-pointer transition-all duration-200 hover:scale-[1.02] text-center"
                         style="background: {formData.interval === preset.value ? $colorStore.primary + '20' : $colorStore.primary + '08'};
                                border-color: {formData.interval === preset.value ? $colorStore.primary : $colorStore.primary + '30'};">
                    <input
                      id="interval-preset-{preset.value}"
                      type="radio"
                      bind:group={formData.interval}
                      value={preset.value}
                      class="sr-only"
                    >
                    <span class="text-xs sm:text-sm" style="color: {$colorStore.text}">{preset.label}</span>
                  </label>
                {/each}
              </div>

              <!-- Custom interval input -->
              <input
                id="interval-custom-input"
                type="text"
                bind:value={formData.interval}
                placeholder="Custom: HH:MM:SS"
                class="w-full rounded-lg p-3 border text-sm transition-all duration-200"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              >
            </div>
          {/if}

          <!-- Collapsible Advanced Options -->
              <div class="rounded-xl border" style="border-color: {$colorStore.primary}30;">
            <button
              type="button"
              class="w-full flex items-center justify-between p-4 transition-all duration-200 hover:opacity-50"
              style="background: {$colorStore.primary}05;"
              onclick={() => showAdvancedOptions = !showAdvancedOptions}
            >
              <div class="flex items-center gap-3">
                <i class="fa-utility-duo fa-regular fa-gear"
                   style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                <span class="font-medium" style="color: {$colorStore.text}">Advanced Options</span>
                  <span class="text-xs px-2 py-1 rounded-sm"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary}">
                  Optional
                </span>
              </div>
              <div class="transition-transform duration-200" class:rotate-180={showAdvancedOptions}>
                <i class="fa-solid fa-arrow-down" style="color: {$colorStore.primary}; font-size: 20px;"></i>
              </div>
            </button>

            {#if showAdvancedOptions}
              <div class="p-6 space-y-6" in:fly={{ y: -20, duration: 300 }}>

                <!-- Basic Toggles -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label for="no-redundant-check" class="flex items-start sm:items-center gap-3">
                    <input
                      id="no-redundant-check"
                      type="checkbox"
                      bind:checked={formData.noRedundant}
                      class="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0"
                    >
                    <span class="text-sm" style="color: {$colorStore.text}">Don't repeat if message is already last in channel</span>
                  </label>

                  <label for="allow-mentions-check" class="flex items-start sm:items-center gap-3">
                    <input
                      id="allow-mentions-check"
                      type="checkbox"
                      bind:checked={formData.allowMentions}
                      class="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0"
                    >
                    <span class="text-sm" style="color: {$colorStore.text}">Allow @everyone and @here mentions</span>
                  </label>
                </div>

                <!-- Priority & Timing -->
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label for="repeater-priority-input" class="block text-sm font-medium mb-2"
                           style="color: {$colorStore.text}">Priority (0-100)</label>
                    <input
                      id="repeater-priority-input"
                      type="number"
                      bind:value={formData.priority}
                      min="0"
                      max="100"
                      class="w-full rounded-lg p-3 border text-sm transition-all duration-200"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    >
                  </div>

                  <div>
                    <label for="queue-position-input" class="block text-sm font-medium mb-2"
                           style="color: {$colorStore.text}">Queue Position</label>
                    <input
                      id="queue-position-input"
                      type="number"
                      bind:value={formData.queuePosition}
                      min="0"
                      class="w-full rounded-lg p-3 border text-sm transition-all duration-200"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    >
                  </div>

                  <div>
                    <label for="start-time-input" class="block text-sm font-medium mb-2"
                           style="color: {$colorStore.text}">Start Time (HH:MM)</label>
                    <input
                      id="start-time-input"
                      type="time"
                      bind:value={formData.startTimeOfDay}
                      class="w-full rounded-lg p-3 border text-sm transition-all duration-200"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    >
                  </div>
                </div>

                <!-- Advanced Toggles -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label for="conversation-detection-check" class="flex items-center gap-3">
                    <input
                      id="conversation-detection-check"
                      type="checkbox"
                      bind:checked={formData.conversationDetection}
                      class="w-4 h-4"
                    >
                    <span style="color: {$colorStore.text}">Conversation Detection</span>
                  </label>

                  <label for="suppress-notifications-check" class="flex items-center gap-3">
                    <input
                      id="suppress-notifications-check"
                      type="checkbox"
                      bind:checked={formData.suppressNotifications}
                      class="w-4 h-4"
                    >
                    <span style="color: {$colorStore.text}">Suppress Notifications</span>
                  </label>

                  {#if selectedChannelType === 'forum'}
                    <label for="thread-auto-sticky-check" class="flex items-center gap-3">
                      <input
                        id="thread-auto-sticky-check"
                        type="checkbox"
                        bind:checked={formData.threadAutoSticky}
                        class="w-4 h-4"
                      >
                      <span style="color: {$colorStore.text}">Auto-create in new threads</span>
                    </label>

                    <label for="thread-only-mode-check" class="flex items-center gap-3">
                      <input
                        id="thread-only-mode-check"
                        type="checkbox"
                        bind:checked={formData.threadOnlyMode}
                        class="w-4 h-4"
                      >
                      <span style="color: {$colorStore.text}">Thread-only mode</span>
                    </label>
                  {/if}
                </div>

                <!-- Auto-Expiry (simplified) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="max-age-input" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Auto-delete
                      after (days)</label>
                    <input
                      id="max-age-input"
                      type="text"
                      bind:value={formData.maxAge}
                      placeholder="7.00:00:00 (7 days)"
                      class="w-full rounded-lg p-3 border text-sm transition-all duration-200"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    >
                  </div>

                  <div>
                    <label for="max-triggers-input" class="block text-sm font-medium mb-2"
                           style="color: {$colorStore.text}">Max displays</label>
                    <input
                      id="max-triggers-input"
                      type="number"
                      bind:value={formData.maxTriggers}
                      placeholder="Leave empty for unlimited"
                      min="1"
                      class="w-full rounded-lg p-3 border text-sm transition-all duration-200"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    >
                  </div>
                </div>

                <!-- Time Scheduling (simplified) -->
                <div>
                  <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Time Schedule (Optional)</span>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {#each TIME_SCHEDULE_PRESETS as preset}
                      <label for="time-schedule-{preset.value}"
                             class="flex items-center gap-2 rounded-lg p-2 border cursor-pointer transition-all duration-200 hover:scale-[1.02] text-sm"
                             style="background: {formData.timeSchedulePreset === preset.value ? $colorStore.primary + '20' : $colorStore.primary + '08'};
                                    border-color: {formData.timeSchedulePreset === preset.value ? $colorStore.primary : $colorStore.primary + '30'};">
                        <input
                          id="time-schedule-{preset.value}"
                          type="radio"
                          bind:group={formData.timeSchedulePreset}
                          value={preset.value}
                          class="sr-only"
                        >
                        <span style="color: {$colorStore.text}">{preset.label}</span>
                      </label>
                    {/each}
                  </div>
                </div>

              </div>
            {/if}
          </div>

          <!-- ===== CONTEXTUAL SETTINGS BASED ON TRIGGER MODE ===== -->

          <!-- Activity-Based Settings -->
          {#if formData.triggerMode === StickyTriggerMode.OnActivity || formData.triggerMode === StickyTriggerMode.OnNoActivity || formData.triggerMode === StickyTriggerMode.AfterMessages}
            <div class="rounded-xl p-4 border"
                 style="background: {$colorStore.secondary}05; border-color: {$colorStore.secondary}20;"
                 in:fly={{ y: 20, duration: 300 }}>
              <div class="flex items-center gap-2 mb-3">
                <i class="fa-solid fa-chart-line" style="color: {$colorStore.secondary}; font-size: 16px;"></i>
                <h4 class="text-sm font-semibold" style="color: {$colorStore.text}">Activity Settings</h4>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label for="activity-threshold-input" class="block text-sm mb-2" style="color: {$colorStore.muted}">
                    {formData.triggerMode === StickyTriggerMode.AfterMessages ? 'Messages needed' : 'Activity threshold'}
                  </label>
                  <input
                    id="activity-threshold-input"
                    type="number"
                    bind:value={formData.activityThreshold}
                    min="1"
                    class="w-full rounded-lg p-3 border text-sm transition-all duration-200"
                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                  >
                </div>

                <div>
                  <label for="activity-time-window-input" class="block text-sm mb-2" style="color: {$colorStore.muted}">Time
                    window</label>
                  <input
                    id="activity-time-window-input"
                    type="text"
                    bind:value={formData.activityTimeWindow}
                    placeholder="00:05:00"
                    class="w-full rounded-lg p-3 border text-sm transition-all duration-200"
                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                  >
                </div>
              </div>
            </div>
          {/if}

          <!-- Immediate Mode Info -->
          {#if formData.triggerMode === StickyTriggerMode.Immediate}
            <div class="rounded-xl p-4 border"
                 style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;"
                 in:fly={{ y: 20, duration: 300 }}>
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-bolt" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">
                  This repeater will immediately repost the message when any message is sent in the channel.
                </span>
              </div>
            </div>
          {/if}
            </div>
          </div>

          <!-- Action Buttons -->
              <div class="flex justify-end gap-3 pt-6">
            {#if isEditMode}
              <button
                type="button"
                class="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:brightness-110"
                style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30;"
                onclick={() => {
                  isEditMode = false;
                  editingRepeaterId = null;
                  selectedRepeater = null;
                  resetForm();
                  activeTab = 'overview';
                }}
              >
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-xmark" style="font-size: 16px;"></i>
                  <span>Cancel</span>
                </div>
              </button>
            {/if}

                <button
                  type="submit"
                  class="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  disabled={saving || !formData.channelId || Object.keys(repeaterMessage).length === 0}
                >
                  <div class="flex items-center gap-2">
                    {#if saving}
                      <i class="fa-solid fa-arrows-rotate fa-spin" style="font-size: 16px;"></i>
                      <span>{isEditMode ? 'Saving...' : 'Creating...'}</span>
                    {:else if isEditMode}
                      <i class="fa-solid fa-floppy-disk" style="font-size: 16px;"></i>
                      <span>Save Changes</span>
                    {:else}
                      <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
                      <span>Create Repeater</span>
                    {/if}
                  </div>
                </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</DashboardPageLayout>

