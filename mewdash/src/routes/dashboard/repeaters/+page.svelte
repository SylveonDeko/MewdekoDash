<!-- routes/dashboard/repeaters/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";


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
  import { requestConfirmation } from "$lib/stores/confirmationStore";

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

  /** Which quick-edit field is being edited in the quick edit modal */
  type QuickEditField = "interval" | "startTime" | "threshold" | "expiry";
  let quickEdit = $state<{ repeater: RepeaterResponse; field: QuickEditField } | null>(null);
  let quickEditForm = $state({ interval: "", startTime: "", threshold: 5, maxAge: "", maxTriggers: "" });
  let quickEditSaving = $state(false);
  let quickEditError = $state("");

  /** Human readable metadata for each quick-edit field */
  const quickEditMeta: Record<QuickEditField, { title: string; icon: string; hint: string }> = $derived({
    interval: { title: m.repeaters.pageActionEditIntervalAria(), icon: "fa-clock", hint: m.repeaters.pageQuickEditIntervalHint() },
    startTime: { title: m.repeaters.pageActionEditStartAria(), icon: "fa-clock", hint: m.repeaters.pageQuickEditStartHint() },
    threshold: { title: m.repeaters.pageQuickEditThresholdTitle(), icon: "fa-users", hint: m.repeaters.pageQuickEditThresholdHint() },
    expiry: { title: m.repeaters.pageActionEditExpiryAria(), icon: "fa-calendar", hint: m.repeaters.pageQuickEditExpiryHint() }
  });

  /** Open the quick edit modal for a single repeater property */
  function openQuickEdit(repeater: RepeaterResponse, field: QuickEditField) {
    quickEditForm = {
      interval: repeater.interval || "01:00:00",
      startTime: repeater.startTimeOfDay || "",
      threshold: repeater.conversationThreshold || 5,
      maxAge: repeater.maxAge || "",
      maxTriggers: repeater.maxTriggers?.toString() || ""
    };
    quickEditError = "";
    quickEdit = { repeater, field };
  }

  function closeQuickEdit() {
    quickEdit = null;
    quickEditError = "";
  }

  /** Validate and persist the quick edit modal value */
  async function saveQuickEdit() {
    if (!quickEdit) return;
    const { repeater, field } = quickEdit;
    quickEditError = "";

    if (field === "interval" && !/^\d{1,2}:\d{2}:\d{2}$/.test(quickEditForm.interval.trim())) {
      quickEditError = m.repeaters.pageQuickErrorInterval();
      return;
    }
    if (field === "startTime" && quickEditForm.startTime.trim() && !/^\d{1,2}:\d{2}$/.test(quickEditForm.startTime.trim())) {
      quickEditError = m.repeaters.pageQuickErrorStart();
      return;
    }
    if (field === "threshold" && (!Number.isFinite(quickEditForm.threshold) || quickEditForm.threshold < 1)) {
      quickEditError = m.repeaters.pageQuickErrorThreshold();
      return;
    }
    if (field === "expiry" && quickEditForm.maxAge.trim() && !/^(\d+\.)?\d{1,2}:\d{2}:\d{2}$/.test(quickEditForm.maxAge.trim())) {
      quickEditError = m.repeaters.pageQuickErrorMaxAge();
      return;
    }
    if (field === "expiry" && quickEditForm.maxTriggers.trim() && !/^\d+$/.test(quickEditForm.maxTriggers.trim())) {
      quickEditError = m.repeaters.pageQuickErrorMaxTriggers();
      return;
    }

    quickEditSaving = true;
    try {
      if (field === "interval") await updateRepeaterInterval(repeater.id, quickEditForm.interval.trim());
      else if (field === "startTime") await updateRepeaterStartTime(repeater.id, quickEditForm.startTime.trim());
      else if (field === "threshold") await updateRepeaterConversationThreshold(repeater.id, quickEditForm.threshold);
      else await updateRepeaterExpiry(repeater.id, quickEditForm.maxAge.trim(), quickEditForm.maxTriggers.trim());
      closeQuickEdit();
    } finally {
      quickEditSaving = false;
    }
  }

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
      label: m.repeaters.pageChannelOptionText({ name: ch.name })
    })),
      ...forumChannels.map(ch => ({
        id: ch.id,
        name: ch.name,
        label: m.repeaters.pageChannelOptionForum({ name: ch.name, count: ch.tags.length })
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
      showMessage(m.repeaters.pageNotifyLoadFailed(), "error");
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
      showMessage(m.repeaters.pageNotifyCreated(), "success");

      // Reset form
      resetForm();

      // Switch to manage tab after successful creation
      activeTab = "manage";

      // Reload data
      await loadAllData();
    } catch (err) {
      logger.error("Failed to create repeater:", err);
      showMessage(m.repeaters.pageNotifyCreateFailed(), "error");
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

      /** Start time of day changes: an empty value explicitly clears it. */
      if (formData.startTimeOfDay !== originalFormData.startTimeOfDay) {
        request.startTimeOfDay = formData.startTimeOfDay || "";
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

      /** Time schedule preset changes: applies the preset, or clears the schedule with "none". */
      if (formData.timeSchedulePreset !== originalFormData.timeSchedulePreset) {
        request.timeSchedulePreset = formData.timeSchedulePreset;
      }

      /** Time conditions changes. */
      const timeConditions = formData.timeSchedulePreset === "custom" ? formData.timeConditions : null;
      const originalTimeConditions = originalFormData.timeSchedulePreset === "custom" ? originalFormData.timeConditions : null;
      if (timeConditions !== originalTimeConditions) {
        request.timeConditions = timeConditions;
      }

      /** Max age changes: a blank value clears it via clearMaxAge, since maxAge: null is a no-op. */
      if (formData.maxAge !== originalFormData.maxAge) {
        if (formData.maxAge) {
          request.maxAge = formData.maxAge;
        } else {
          request.clearMaxAge = true;
        }
      }

      /** Max triggers changes: a blank value clears it via clearMaxTriggers, since null cannot be told apart from a missing field. */
      if (formData.maxTriggers !== originalFormData.maxTriggers) {
        if (formData.maxTriggers) {
          request.maxTriggers = formData.maxTriggers;
        } else {
          request.clearMaxTriggers = true;
        }
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
        showMessage(m.repeaters.pageNotifyNoChanges(), "info");
        resetForm();
        activeTab = "manage";
        return;
      }

      logger.info(`Updating repeater ${editingRepeaterId} for guild ${$currentGuild.id} with changes:`, request);
      await repeatersApi.updateRepeater($currentGuild.id, editingRepeaterId!, request);
      logger.info(`Successfully updated repeater ${editingRepeaterId}`);
      showMessage(m.repeaters.pageNotifyUpdated(), "success");

      // Reset form and switch back to manage tab
      resetForm();
      activeTab = "manage";
      await loadAllData();
    } catch (err) {
      logger.error("Failed to update repeater:", err);
      showMessage(m.repeaters.pageNotifyUpdateFailed(), "error");
    } finally {
      saving = false;
    }
  }

  // Delete a repeater
  async function deleteRepeater(repeaterId: number) {
    if (!$currentGuild?.id) return;
    if (!(await requestConfirmation({ message: m.repeaters.pageConfirmDelete(), confirmText: m.common.delete() }))) return;

    try {
      await repeatersApi.deleteRepeater($currentGuild.id, repeaterId);
      showMessage(m.repeaters.pageNotifyDeleted(), "success");
      await loadAllData();
    } catch (err) {
      logger.error("Failed to delete repeater:", err);
      showMessage(m.repeaters.pageNotifyDeleteFailed(), "error");
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
      
      showMessage(repeater.isEnabled ? m.repeaters.pageNotifyDisabled() : m.repeaters.pageNotifyEnabled(), "success");
      await loadAllData();
    } catch (err) {
      logger.error("Failed to toggle repeater:", err);
      showMessage(m.repeaters.pageNotifyToggleFailed(), "error");
    }
  }

  // Trigger a repeater immediately
  async function triggerRepeater(repeaterId: number) {
    if (!$currentGuild?.id) return;

    try {
      await repeatersApi.triggerRepeater($currentGuild.id, repeaterId);
      showMessage(m.repeaters.pageNotifyTriggered(), "success");
    } catch (err) {
      logger.error("Failed to trigger repeater:", err);
      showMessage(m.repeaters.pageNotifyTriggerFailed(), "error");
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
    return channel ? `#${channel.name}` : m.common.unknownChannel();
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
      showMessage(enable ? m.repeaters.pageNotifyBulkEnabled() : m.repeaters.pageNotifyBulkDisabled(), "success");

      clearSelection();
      await loadAllData();
    } catch (err) {
      logger.error("Failed to bulk toggle repeaters:", err);
      showMessage(m.repeaters.pageNotifyBulkFailed(), "error");
    }
  }

  // Queue Position Management using updateRepeater
  async function updateQueuePosition(repeaterId: number, newPosition: number) {
    if (!$currentGuild?.id) return;

    try {
      await repeatersApi.updateRepeater($currentGuild.id, repeaterId, { queuePosition: newPosition });
      showMessage(m.repeaters.pageNotifyQueueUpdated(), "success");
      await loadAllData();
    } catch (err) {
      logger.error("Failed to update queue position:", err);
      showMessage(m.repeaters.pageNotifyQueueFailed(), "error");
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
      showMessage(m.repeaters.pageNotifyIntervalUpdated(), "success");
      await loadAllData();
    } catch (err) {
      logger.error("Failed to update interval:", err);
      showMessage(m.repeaters.pageNotifyIntervalFailed(), "error");
    }
  }

  /**
   * Updates a repeater's start time of day.
   * @param repeaterId The repeater ID
   * @param startTime The new start time (HH:mm, UTC), or "" to explicitly clear it
   */
  async function updateRepeaterStartTime(repeaterId: number, startTime: string) {
    if (!$currentGuild?.id) return;

    try {
      await repeatersApi.updateRepeater($currentGuild.id, repeaterId, { startTimeOfDay: startTime });
      await loadAllData();
    } catch (err) {
      logger.error("Failed to update start time:", err);
      showMessage(m.repeaters.pageNotifyStartFailed(), "error");
    }
  }

  async function updateRepeaterConversationThreshold(repeaterId: number, threshold: number) {
    if (!$currentGuild?.id) return;

    try {
      await repeatersApi.updateRepeater($currentGuild.id, repeaterId, { conversationThreshold: threshold });
      showMessage(m.repeaters.pageNotifyThresholdUpdated(), "success");
      await loadAllData();
    } catch (err) {
      logger.error("Failed to update conversation threshold:", err);
      showMessage(m.repeaters.pageNotifyThresholdFailed(), "error");
    }
  }

  /**
   * Updates a repeater's expiry settings, clearing either limit when its value is blank.
   * @param repeaterId The repeater ID
   * @param maxAge The new max age (e.g. "7.00:00:00"), or "" to clear it
   * @param maxTriggers The new max triggers, or "" to clear it
   */
  async function updateRepeaterExpiry(repeaterId: number, maxAge: string, maxTriggers: string) {
    if (!$currentGuild?.id) return;

    try {
      const request: UpdateRepeaterRequest = {};
      if (maxAge) {
        request.maxAge = maxAge;
      } else {
        request.clearMaxAge = true;
      }
      if (maxTriggers) {
        request.maxTriggers = Number.parseInt(maxTriggers, 10);
      } else {
        request.clearMaxTriggers = true;
      }

      await repeatersApi.updateRepeater($currentGuild.id, repeaterId, request);
      await loadAllData();
    } catch (err) {
      logger.error("Failed to update expiry settings:", err);
      showMessage(m.repeaters.pageNotifyExpiryFailed(), "error");
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
      showMessage(m.repeaters.pageNotifyTagsUpdated(), "success");
      showForumTagEditor = false;
      await loadAllData();
    } catch (err) {
      logger.error("Failed to update forum tag conditions:", err);
      showMessage(m.repeaters.pageNotifyTagsFailed(), "error");
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
  const tabs = $derived([
    { id: "overview", label: m.common.overview(), icon: "fa-chart-bar" },
    { id: "manage", label: m.repeaters.tabManage(), icon: "fa-clock" },
    { id: "create", label: m.repeaters.tabCreate(), icon: "fa-plus" }
  ]);

  // Action buttons configuration
    let actionButtons = $derived([
    {
      label: m.common.refresh(),
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
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-clock"
  {statusMessages}
  subtitle={m.repeaters.pageSubtitle()}
  {tabs}
  title={m.repeaters.pageTitle()}
>

  <!-- Tab Content -->
  {#if activeTab === 'overview'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {#if repeaterStats}
          <StatCard
            icon="fa-clock"
            label={m.repeaters.pageStatTotal()}
            value={repeaterStats.totalRepeaters}
            subtitle={m.common.configuredLower()}
            iconColor="primary"
            animationDelay={0}
          />

          <StatCard
            icon="fa-bell"
            label={m.repeaters.pageStatActive()}
            value={repeaterStats.activeRepeaters}
            subtitle={m.repeaters.pageStatActiveHint()}
            iconColor="secondary"
            animationDelay={100}
          />

          <StatCard
            icon="fa-star"
            label={m.repeaters.pageStatDisplays()}
            value={repeaterStats.totalDisplays}
            subtitle={m.repeaters.pageStatDisplaysHint()}
            iconColor="accent"
            animationDelay={200}
          />

          <StatCard
            icon="fa-calendar"
            label={m.common.scheduled()}
            value={repeaterStats.timeScheduledRepeaters}
            subtitle={m.repeaters.pageStatScheduledHint()}
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
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">{m.repeaters.pageOverviewModes()}</h3>
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
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">{m.common.mostActive()}</h3>
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium" style="color: {$colorStore.text}">
                  {getChannelName(repeaterStats.mostActiveRepeater.channelId)}
                </span>
                <span class="font-bold" style="color: {$colorStore.secondary}">
                  {repeaterStats.mostActiveRepeater.displayCount === 1 ? m.repeaters.pageDisplaysOne({ count: 1 }) : m.repeaters.pageDisplaysOther({ count: repeaterStats.mostActiveRepeater.displayCount })}
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
          <h3 class="text-xl font-semibold mb-2 mt-4" style="color: {$colorStore.text}">{m.repeaters.pageEmptyTitle()}</h3>
          <p class="mb-6" style="color: {$colorStore.muted}">{m.repeaters.pageEmptyHint()}</p>
          <div class="flex justify-center">
            <button
              class="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={() => activeTab = 'create'}
            >
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
                <span>{m.repeaters.pageCreateRepeater()}</span>
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
              {m.common.selectAllCount({ count: repeaters.length })}
            </button>

            {#if selectedRepeaterIds.length > 0}
              <button
                class="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                onclick={clearSelection}
              >
                <i class="fa-solid fa-square mr-1" style="font-size: 14px;"></i>
                {m.repeaters.pageClearSelection({ count: selectedRepeaterIds.length })}
              </button>
            {/if}
          </div>

          <!-- Bulk Actions -->
          {#if selectedRepeaterIds.length > 0}
            <div class="flex flex-wrap items-center gap-2" in:fly={{ x: 20, duration: 300 }}>
              <span class="text-xs sm:text-sm font-medium" style="color: {$colorStore.text}">
                {m.repeaters.pageSelectedCount({ count: selectedRepeaterIds.length })}
              </span>

              <button
                class="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                onclick={() => bulkToggleRepeaters(true)}
              >
                <i class="fa-solid fa-check mr-1" style="font-size: 14px;"></i>
                {m.common.enable()}
              </button>

              <button
                class="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                onclick={() => bulkToggleRepeaters(false)}
              >
                <i class="fa-solid fa-xmark mr-1" style="font-size: 14px;"></i>
                {m.common.disable()}
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
                      <span class="hidden sm:inline">{m.repeaters.pageCardPriority({ value: repeater.priority })}</span>
                      <span class="whitespace-nowrap">{m.repeaters.pageCardQueue({ position: repeater.queuePosition })}</span>
                      <span class="whitespace-nowrap">{repeater.displayCount === 1 ? m.repeaters.pageDisplaysOne({ count: 1 }) : m.repeaters.pageDisplaysOther({ count: repeater.displayCount })}</span>
                    </div>
                  </div>
                </div>

                <!-- Status indicator -->
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <div class="w-2.5 h-2.5 rounded-full"
                       style="background: {repeater.isEnabled ? $colorStore.primary : $colorStore.muted};"></div>
                  <span class="text-xs sm:text-sm font-medium whitespace-nowrap"
                        style="color: {repeater.isEnabled ? $colorStore.primary : $colorStore.muted}">
                    {repeater.isEnabled ? m.common.active() : m.common.disabled()}
                  </span>
                </div>
              </div>

              <div class="mb-4">
                {#if repeater.message}
                  <!-- Use FullscreenEmbedBuilder as read-only preview -->
                  <div class="[&_button]:pointer-events-none">
                    <FullscreenEmbedBuilder
                      value={toBuilderValue(repeater.message)}
                      previewTitle={m.repeaters.pageMessagePreviewTitle()}
                      previewDescription={m.repeaters.pageMessagePreviewDescription()}
                      placeholder={m.repeaters.pageMessagePreviewPlaceholder()}
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
                    <p class="text-sm" style="color: {$colorStore.muted}">{m.repeaters.pageMessageNone()}</p>
                  </div>
                {/if}
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4">
                {#if repeater.triggerMode === StickyTriggerMode.Immediate}
                  <!-- Immediate Mode Info -->
                  <div>
                    <div class="text-xs font-medium mb-1" style="color: {$colorStore.muted}">{m.repeaters.pageCardTriggerMode()}</div>
                    <div class="text-sm flex items-center gap-2" style="color: {$colorStore.text}">
                      <i class="fa-solid fa-bolt" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                      {m.repeaters.pageCardImmediate()}
                    </div>
                    <div class="text-xs mt-1" style="color: {$colorStore.muted}">
                      {m.repeaters.pageCardImmediateHint()}
                    </div>
                  </div>
                {:else}
                  <!-- Time-based modes show interval and next execution -->
                  <div>
                    <div class="text-xs font-medium mb-1" style="color: {$colorStore.muted}">{m.repeaters.pageInterval()}</div>
                    <div class="text-sm" style="color: {$colorStore.text}">
                      {formatInterval(repeater.interval)}
                    </div>
                    {#if repeater.startTimeOfDay}
                      <div class="text-xs mt-1" style="color: {$colorStore.muted}">
                        {m.repeaters.pageCardStart({ time: repeater.startTimeOfDay })}
                      </div>
                    {/if}
                  </div>

                  <div>
                    <div class="text-xs font-medium mb-1" style="color: {$colorStore.muted}">{m.repeaters.pageCardNext()}</div>
                    <div class="text-sm" style="color: {$colorStore.text}">
                      {formatTimeUntilNext(repeater.nextExecution)}
                    </div>
                    {#if repeater.requiresTimezone}
                      <div class="text-xs mt-1" style="color: {$colorStore.accent}">
                        {m.repeaters.pageCardTimezone()}
                      </div>
                    {/if}
                  </div>
                {/if}

                {#if repeater.triggerMode === StickyTriggerMode.OnActivity || repeater.triggerMode === StickyTriggerMode.OnNoActivity || repeater.triggerMode === StickyTriggerMode.AfterMessages}
                  <!-- Activity modes show activity settings -->
                  <div>
                    <div class="text-xs font-medium mb-1" style="color: {$colorStore.muted}">{m.repeaters.pageActivitySettings()}</div>
                    <div class="text-sm" style="color: {$colorStore.text}">
                      {m.repeaters.pageCardThreshold({ value: repeater.activityThreshold })}
                    </div>
                    <div class="text-xs mt-1" style="color: {$colorStore.muted}">
                      {m.repeaters.pageCardWindow({ window: formatInterval(repeater.activityTimeWindow) })}
                    </div>
                    {#if repeater.conversationDetection}
                      <div class="text-xs" style="color: {$colorStore.muted}">
                        {m.repeaters.pageCardConversation({ threshold: repeater.conversationThreshold })}
                      </div>
                    {/if}
                  </div>
                {/if}

                <div>
                  <div class="text-xs font-medium mb-1" style="color: {$colorStore.muted}">{m.repeaters.pageCardExpiry()}</div>
                  <div class="text-sm" style="color: {$colorStore.text}">
                    {#if repeater.maxAge || repeater.maxTriggers}
                      {#if repeater.maxAge}
                        {m.repeaters.pageCardAge({ age: repeater.maxAge })}
                      {/if}
                      {#if repeater.maxTriggers}
                        {m.repeaters.pageCardMaxTriggers({ count: repeater.maxTriggers })}
                      {/if}
                    {:else}
                      {m.repeaters.pageCardNeverExpires()}
                    {/if}
                  </div>
                </div>
              </div>

              <!-- Feature Badges -->
              <div class="mb-4">
                <div class="text-xs font-medium mb-2" style="color: {$colorStore.muted}">{m.repeaters.pageCardFeatures()}</div>
                <div class="flex flex-wrap gap-2">
                  {#if repeater.conversationDetection}
                    <span class="px-2 py-1 rounded-sm text-xs"
                          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                      <i class="fa-solid fa-users" style="font-size: 12px;"></i>
                      {m.repeaters.pageFeatureConversation()}
                    </span>
                  {/if}
                  {#if repeater.threadAutoSticky}
                    <span class="px-2 py-1 rounded-sm text-xs"
                          style="background: {$colorStore.accent}20; color: {$colorStore.accent}">
                      <i class="fa-solid fa-comment" style="font-size: 12px;"></i>
                      {m.repeaters.pageFeatureThreadAuto()}
                    </span>
                  {/if}
                  {#if repeater.threadOnlyMode}
                    <span class="px-2 py-1 rounded-sm text-xs"
                          style="background: {$colorStore.accent}20; color: {$colorStore.accent}">
                      {m.repeaters.pageFeatureThreadOnly()}
                    </span>
                  {/if}
                  {#if repeater.timeConditions}
                    <span class="px-2 py-1 rounded-sm text-xs"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary}">
                      <i class="fa-solid fa-clock" style="font-size: 12px;"></i>
                      {m.repeaters.pageFeatureScheduled()}
                    </span>
                  {/if}
                  {#if repeater.forumTagConditions}
                    <span class="px-2 py-1 rounded-sm text-xs"
                          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                      <i class="fa-solid fa-tags" style="font-size: 12px;"></i>
                      {m.repeaters.pageFeatureForumTags()}
                    </span>
                  {/if}
                  {#if repeater.noRedundant}
                    <span class="px-2 py-1 rounded-sm text-xs"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary}">
                      {m.repeaters.pageFeatureNoRedundant()}
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
                    aria-label={m.common.edit()}
                  >
                    <i class="fa-solid fa-pen" style="font-size: 12px;"></i>
                    <span class="hidden sm:inline">{m.common.edit()}</span>
                  </button>

                  <button
                    class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                    style="background: {repeater.isEnabled ? $colorStore.accent + '20' : $colorStore.primary + '20'};
                           color: {repeater.isEnabled ? $colorStore.accent : $colorStore.primary};"
                    onclick={() => toggleRepeater(repeater.id)}
                  >
                    <i class="fa-solid fa-toggle-off" style="font-size: 12px;"></i>
                    {repeater.isEnabled ? m.common.disable() : m.common.enable()}
                  </button>

                  <button
                    class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                    style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                    onclick={() => triggerRepeater(repeater.id)}
                    disabled={!repeater.isEnabled}
                  >
                    <i class="fa-solid fa-play" style="font-size: 12px;"></i>
                    <span class="hidden sm:inline">{m.repeaters.pageActionTriggerLong()}</span>
                    <span class="sm:hidden">{m.common.trigger()}</span>
                  </button>

                  <!-- Queue Position Controls -->
                  <div class="flex items-center">
                    <button aria-label={m.repeaters.pageActionMoveUpAria()}
                            class="flex items-center gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-l-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                      style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                      onclick={() => moveRepeaterUp(repeater.id)}
                      disabled={repeater.queuePosition <= 1}
                    >
                      <i class="fa-solid fa-arrow-up" style="font-size: 12px;"></i>
                    </button>
                    <button aria-label={m.repeaters.pageActionMoveDownAria()}
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
                    <span class="hidden sm:inline">{m.common.delete()}</span>
                    <span class="sm:hidden">{m.repeaters.pageActionDeleteShort()}</span>
                  </button>
                </div>

                <!-- Advanced Controls -->
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <!-- Quick Property Updates -->
                  <button
                    class="flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium transition-all duration-200 hover:scale-[1.02] min-h-[32px]"
                    style="background: {$colorStore.primary}15; color: {$colorStore.primary};"
                    onclick={() => openQuickEdit(repeater, "interval")}
                    aria-label={m.repeaters.pageActionEditIntervalAria()}
                  >
                    <i class="fa-solid fa-clock" style="font-size: 10px;"></i>
                    <span class="hidden sm:inline">{m.repeaters.pageInterval()}</span>
                    <span class="sm:hidden">{m.repeaters.pageIntervalShort()}</span>
                  </button>

                  <button
                    class="flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium transition-all duration-200 hover:scale-[1.02] min-h-[32px]"
                    style="background: {$colorStore.primary}15; color: {$colorStore.primary};"
                    onclick={() => openQuickEdit(repeater, "startTime")}
                    aria-label={m.repeaters.pageActionEditStartAria()}
                  >
                    <i class="fa-solid fa-clock" style="font-size: 10px;"></i>
                    <span class="hidden sm:inline">{m.repeaters.pageStartTime()}</span>
                    <span class="sm:hidden">{m.common.start()}</span>
                  </button>

                  {#if repeater.conversationDetection}
                    <button
                      class="flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium transition-all duration-200 hover:scale-[1.02] min-h-[32px]"
                      style="background: {$colorStore.secondary}15; color: {$colorStore.secondary};"
                      onclick={() => openQuickEdit(repeater, "threshold")}
                      aria-label={m.repeaters.pageActionEditThresholdAria()}
                    >
                      <i class="fa-solid fa-users" style="font-size: 10px;"></i>
                      <span class="whitespace-nowrap">{m.repeaters.pageActionConversation({ threshold: repeater.conversationThreshold })}</span>
                    </button>
                  {/if}

                  <button
                    class="flex items-center gap-2 px-2 py-1 rounded-sm text-xs font-medium transition-all duration-200 hover:scale-[1.02] min-h-[32px]"
                    style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
                    onclick={() => openQuickEdit(repeater, "expiry")}
                    aria-label={m.repeaters.pageActionEditExpiryAria()}
                  >
                    <i class="fa-solid fa-calendar" style="font-size: 12px;"></i>
                    {m.repeaters.pageActionExpiry()}
                  </button>

                  <!-- Advanced Features open the full editor -->
                  {#if repeater.forumTagConditions}
                    <button
                      class="flex items-center gap-2 px-2 py-1 rounded-sm text-xs font-medium transition-all duration-200 hover:scale-[1.02] min-h-[32px]"
                      style="background: {$colorStore.secondary}15; color: {$colorStore.secondary};"
                      onclick={() => editRepeater(repeater)}
                    >
                      <i class="fa-solid fa-tags" style="font-size: 12px;"></i>
                      {m.repeaters.pageFeatureForumTags()}
                    </button>
                  {/if}

                  {#if repeater.timeConditions}
                    <button
                      class="flex items-center gap-2 px-2 py-1 rounded-sm text-xs font-medium transition-all duration-200 hover:scale-[1.02] min-h-[32px]"
                      style="background: {$colorStore.primary}15; color: {$colorStore.primary};"
                      onclick={() => editRepeater(repeater)}
                    >
                      <i class="fa-solid fa-code" style="font-size: 12px;"></i>
                      {m.repeaters.pageActionTimeConditions()}
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
                      {m.repeaters.pageActionThreadMessages()}
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
                <h2 class="text-lg sm:text-xl md:text-2xl font-bold truncate" style="color: {$colorStore.text}">{m.repeaters.pageFormEditTitle()}</h2>
                <p class="text-xs sm:text-sm mt-1 break-words" style="color: {$colorStore.muted}">{m.repeaters.pageFormEditSubtitle({ id: editingRepeaterId ?? 0 })}</p>
              </div>
            {:else}
              <i class="fa-solid fa-plus flex-shrink-0" style="color: {$colorStore.primary}; font-size: 20px;"></i>
              <div class="min-w-0 flex-1">
                <h2 class="text-lg sm:text-xl md:text-2xl font-bold" style="color: {$colorStore.text}">{m.repeaters.pageFormCreateTitle()}</h2>
                <p class="text-xs sm:text-sm mt-1" style="color: {$colorStore.muted}">{m.repeaters.pageFormCreateSubtitle()}</p>
              </div>
            {/if}
          </div>
        </div>

        <form onsubmit={(e) => { e.preventDefault(); isEditMode ? updateRepeater() : createRepeater(); }}
              class="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 md:space-y-10">

          <div class="space-y-4">
            <div class="flex items-center gap-2 mb-4">
              <i class="fa-solid fa-hashtag" style="color: {$colorStore.primary}; font-size: 18px;"></i>
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">{m.repeaters.pageFormChannel()}</h3>
            </div>

            <div class="pl-0 md:pl-7">
              <DiscordSelector
                type="channel"
                options={allChannels.map(ch => ({ id: ch.id, name: ch.name }))}
                bind:selected={formData.channelId}
                placeholder={m.common.selectChannelPlaceholder()} />
              {#if selectedChannelType === 'forum' && availableForumTags.length > 0}
                <div class="mt-6 p-5 md:p-6 rounded-xl border"
                     style="background: {$colorStore.secondary}05; border-color: {$colorStore.secondary}20;"
                     in:fly={{ y: 20, duration: 300 }}>
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div class="flex items-center gap-2">
                      <i class="fa-solid fa-tags" style="color: {$colorStore.secondary}; font-size: 16px;"></i>
                      <h4 class="text-base font-semibold" style="color: {$colorStore.text}">{m.repeaters.pageFormTagsTitle()}</h4>
                      <span class="text-xs px-2 py-1 rounded-sm"
                            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                          {m.common.optional()}
                        </span>
                    </div>

                    {#if selectedForumTags.required.length > 0 || selectedForumTags.excluded.length > 0}
                      <button
                        type="button"
                        class="text-sm px-3 py-1.5 rounded-lg transition-all hover:scale-[1.02]"
                        style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                        onclick={() => selectedForumTags = {required: [], excluded: []}}
                      >
                        {m.common.clearAll()}
                      </button>
                    {/if}
                  </div>

                  <p class="text-sm mb-6" style="color: {$colorStore.muted}">{m.repeaters.pageFormTagsHint()}</p>

                  <!-- Required/Excluded Sections -->
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                    <!-- Required Tags Section -->
                    <div>
                      <h5 class="text-sm font-medium mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                        <i class="fa-solid fa-check" style="color: {$colorStore.primary}; font-size: 14px;"></i>{m.repeaters.pageFormTagsRequired()}</h5>
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
                            {m.repeaters.pageFormTagsRequiredEmpty()}
                          </div>
                        {/if}
                      </div>
                    </div>

                    <!-- Excluded Tags Section -->
                    <div>
                      <h5 class="text-sm font-medium mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                        <i class="fa-solid fa-xmark" style="color: {$colorStore.accent}; font-size: 14px;"></i>{m.repeaters.pageFormTagsExcluded()}</h5>
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
                                        style="background: {$colorStore.primary}; color: white;">{m.common.required()}</span>
                                {/if}
                              </span>
                          </label>
                        {/each}

                        {#if selectedForumTags.excluded.length === 0}
                          <div class="text-sm text-center py-4 rounded-lg"
                               style="background: {$colorStore.accent}05; color: {$colorStore.muted}">
                            {m.repeaters.pageFormTagsExcludedEmpty()}
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
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">{m.common.messageContent()}</h3>
            </div>

            <div class="pl-0 md:pl-7 space-y-3">
              <FullscreenEmbedBuilder
                bind:value={repeaterMessage}
                previewTitle={m.repeaters.pageFormMessagePreviewTitle()}
                previewDescription={m.repeaters.pageFormMessagePreviewDescription()}
                icon="fa-clock"
                allowContent={true}
                allowMultipleEmbeds={true}
                maxEmbeds={10}
                allowComponents={true}
                additionalPlaceholders={[
                    { category: "Server", name: "%server%", description: m.placeholders.server() },
                    { category: "Server", name: "%server.members%", description: m.placeholders.serverMembers() },
                    { category: "Server", name: "%server.id%", description: m.placeholders.serverId() }
                  ]}
                guildId={$currentGuild?.id}
                user={data.user}
                placeholder={m.repeaters.pageFormMessagePlaceholder()}
              />

              <p class="text-sm" style="color: {$colorStore.muted}">{m.repeaters.pageFormMessageHint()}</p>
            </div>
          </div>

          <div>
            <div class="flex items-center gap-2 mb-4">
              <i class="fa-solid fa-gear" style="color: {$colorStore.primary}; font-size: 18px;"></i>
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">{m.repeaters.pageFormTriggerTitle()}</h3>
            </div>

            <div class="pl-0 md:pl-7 space-y-6">
              <div>
                <span class="block text-sm font-medium mb-3" style="color: {$colorStore.text}">{m.repeaters.pageFormTriggerQuestion()}</span>
                <DiscordSelector
                  type="custom"
                  options={triggerModeOptions}
                  selected={formData.triggerMode.toString()}
                  placeholder={m.repeaters.pageFormTriggerPlaceholder()}
                  onchange={handleTriggerModeChange} />
              </div>

              {#if formData.triggerMode === StickyTriggerMode.TimeInterval}
                <div in:fly={{ y: 20, duration: 300 }}>
                  <span class="block text-sm font-medium mb-3" style="color: {$colorStore.text}">{m.repeaters.pageFormRepeatEvery()}</span>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                {#each [
                  { value: "00:01:00", label: m.repeaters.pageIntervalPreset1m() },
                  { value: "00:05:00", label: m.repeaters.pageIntervalPreset5m() },
                  { value: "00:15:00", label: m.repeaters.pageIntervalPreset15m() },
                  { value: "01:00:00", label: m.common.oneHour() },
                  { value: "06:00:00", label: m.repeaters.pageIntervalPreset6h() },
                  { value: "1.00:00:00", label: m.common.daily() }
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
                placeholder={m.repeaters.pageFormCustomInterval()}
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
                <span class="font-medium" style="color: {$colorStore.text}">{m.repeaters.pageFormAdvanced()}</span>
                  <span class="text-xs px-2 py-1 rounded-sm"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary}">
                  {m.common.optional()}
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
                    <span class="text-sm" style="color: {$colorStore.text}">{m.repeaters.pageFormNoRedundant()}</span>
                  </label>

                  <label for="allow-mentions-check" class="flex items-start sm:items-center gap-3">
                    <input
                      id="allow-mentions-check"
                      type="checkbox"
                      bind:checked={formData.allowMentions}
                      class="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0"
                    >
                    <span class="text-sm" style="color: {$colorStore.text}">{m.repeaters.pageFormAllowMentions()}</span>
                  </label>
                </div>

                <!-- Priority & Timing -->
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label for="repeater-priority-input" class="block text-sm font-medium mb-2"
                           style="color: {$colorStore.text}">{m.repeaters.pageFormPriority()}</label>
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
                           style="color: {$colorStore.text}">{m.repeaters.pageFormQueuePosition()}</label>
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
                           style="color: {$colorStore.text}">{m.repeaters.pageFormStartTime()}</label>
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
                    <span style="color: {$colorStore.text}">{m.repeaters.pageFeatureConversation()}</span>
                  </label>

                  <label for="suppress-notifications-check" class="flex items-center gap-3">
                    <input
                      id="suppress-notifications-check"
                      type="checkbox"
                      bind:checked={formData.suppressNotifications}
                      class="w-4 h-4"
                    >
                    <span style="color: {$colorStore.text}">{m.repeaters.pageFormSuppress()}</span>
                  </label>

                  {#if selectedChannelType === 'forum'}
                    <label for="thread-auto-sticky-check" class="flex items-center gap-3">
                      <input
                        id="thread-auto-sticky-check"
                        type="checkbox"
                        bind:checked={formData.threadAutoSticky}
                        class="w-4 h-4"
                      >
                      <span style="color: {$colorStore.text}">{m.repeaters.pageFormThreadAuto()}</span>
                    </label>

                    <label for="thread-only-mode-check" class="flex items-center gap-3">
                      <input
                        id="thread-only-mode-check"
                        type="checkbox"
                        bind:checked={formData.threadOnlyMode}
                        class="w-4 h-4"
                      >
                      <span style="color: {$colorStore.text}">{m.repeaters.pageFormThreadOnly()}</span>
                    </label>
                  {/if}
                </div>

                <!-- Auto-Expiry (simplified) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="max-age-input" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.repeaters.pageFormMaxAge()}</label>
                    <input
                      id="max-age-input"
                      type="text"
                      bind:value={formData.maxAge}
                      placeholder={m.repeaters.pageFormMaxAgePlaceholder()}
                      class="w-full rounded-lg p-3 border text-sm transition-all duration-200"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    >
                  </div>

                  <div>
                    <label for="max-triggers-input" class="block text-sm font-medium mb-2"
                           style="color: {$colorStore.text}">{m.repeaters.pageFormMaxTriggers()}</label>
                    <input
                      id="max-triggers-input"
                      type="number"
                      bind:value={formData.maxTriggers}
                      placeholder={m.repeaters.pageFormMaxTriggersPlaceholder()}
                      min="1"
                      class="w-full rounded-lg p-3 border text-sm transition-all duration-200"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    >
                  </div>
                </div>

                <!-- Time Scheduling (simplified) -->
                <div>
                  <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.repeaters.pageFormTimeSchedule()}</span>
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
                        <span style="color: {$colorStore.text}">{preset.label()}</span>
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
                <h4 class="text-sm font-semibold" style="color: {$colorStore.text}">{m.repeaters.pageActivitySettings()}</h4>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label for="activity-threshold-input" class="block text-sm mb-2" style="color: {$colorStore.muted}">
                    {formData.triggerMode === StickyTriggerMode.AfterMessages ? m.repeaters.pageFormMessagesNeeded() : m.repeaters.pageFormActivityThreshold()}
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
                  <label for="activity-time-window-input" class="block text-sm mb-2" style="color: {$colorStore.muted}">{m.common.timeWindow()}</label>
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
                <span class="text-sm font-medium" style="color: {$colorStore.text}">{m.repeaters.pageFormImmediateHint()}</span>
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
                  <span>{m.common.cancel()}</span>
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
                      <span>{isEditMode ? m.common.saving() : m.common.creating()}</span>
                    {:else if isEditMode}
                      <i class="fa-solid fa-floppy-disk" style="font-size: 16px;"></i>
                      <span>{m.common.saveChanges()}</span>
                    {:else}
                      <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
                      <span>{m.repeaters.pageCreateRepeater()}</span>
                    {/if}
                  </div>
                </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</DashboardPageLayout>

<!-- Quick Edit Modal -->
{#if quickEdit}
  {@const meta = quickEditMeta[quickEdit.field]}
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
       role="presentation"
       onclick={closeQuickEdit}
       onkeydown={(e) => { if (e.key === "Escape") closeQuickEdit(); }}
       in:fade={{ duration: 150 }}>
    <div class="rounded-2xl shadow-2xl w-full max-w-md border"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}, {$colorStore.gradientMid}); border-color: {$colorStore.primary}30;"
         role="dialog"
         aria-modal="true"
         aria-labelledby="quick-edit-title"
         tabindex="-1"
         onclick={(e) => e.stopPropagation()}
         onkeydown={(e) => e.stopPropagation()}
         in:fly={{ y: 20, duration: 250 }}>
      <div class="p-6">
        <div class="flex items-center gap-3 mb-2">
          <div class="p-2 rounded-lg" style="background: {$colorStore.primary}20;">
            <i class="fa-solid {meta.icon}" style="color: {$colorStore.primary}; font-size: 18px;"></i>
          </div>
          <div>
            <h3 id="quick-edit-title" class="text-lg font-bold" style="color: {$colorStore.text}">{meta.title}</h3>
            <p class="text-xs" style="color: {$colorStore.muted}">{quickEdit.repeater.message?.slice(0, 60) || m.repeaters.pageQuickRepeaterFallback({ id: quickEdit.repeater.id })}</p>
          </div>
        </div>
        <p class="text-sm mb-5" style="color: {$colorStore.muted}">{meta.hint}</p>

        <form class="space-y-4" onsubmit={(e) => { e.preventDefault(); saveQuickEdit(); }}>
          {#if quickEdit.field === "interval"}
            <div>
              <label for="quick-interval" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.repeaters.pageQuickIntervalLabel()}</label>
              <input id="quick-interval" type="text" bind:value={quickEditForm.interval} placeholder="01:00:00"
                     class="w-full px-4 py-3 rounded-lg border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            </div>
          {:else if quickEdit.field === "startTime"}
            <div>
              <label for="quick-start" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.repeaters.pageFormStartTime()}</label>
              <input id="quick-start" type="time" bind:value={quickEditForm.startTime}
                     class="w-full px-4 py-3 rounded-lg border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            </div>
          {:else if quickEdit.field === "threshold"}
            <div>
              <label for="quick-threshold" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.repeaters.pageQuickThresholdLabel()}</label>
              <input id="quick-threshold" type="number" min="1" max="1000" bind:value={quickEditForm.threshold}
                     class="w-full px-4 py-3 rounded-lg border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            </div>
          {:else}
            <div>
              <label for="quick-maxage" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.repeaters.pageQuickMaxAgeLabel()}</label>
              <input id="quick-maxage" type="text" bind:value={quickEditForm.maxAge} placeholder={m.repeaters.pageQuickMaxAgePlaceholder()}
                     class="w-full px-4 py-3 rounded-lg border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            </div>
            <div>
              <label for="quick-maxtriggers" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.repeaters.pageQuickMaxTriggersLabel()}</label>
              <input id="quick-maxtriggers" type="number" min="1" bind:value={quickEditForm.maxTriggers} placeholder={m.common.noLimit()}
                     class="w-full px-4 py-3 rounded-lg border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            </div>
          {/if}

          {#if quickEditError}
            <div class="p-3 rounded-lg flex items-center gap-2 text-sm" role="alert"
                 style="background: #ef444420; border: 1px solid #ef444430; color: #ef4444;">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span>{quickEditError}</span>
            </div>
          {/if}

          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onclick={closeQuickEdit}
                    class="flex-1 px-4 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                    style="background: {$colorStore.muted}20; color: {$colorStore.muted};">
              {m.common.cancel()}
            </button>
            <button type="submit" disabled={quickEditSaving}
                    class="flex-1 px-4 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] min-h-[44px] disabled:opacity-50"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
              {#if quickEditSaving}
                <i class="fa-solid fa-arrows-rotate fa-spin mr-2"></i>{m.common.savingPlain()}
              {:else}
                <i class="fa-solid fa-floppy-disk mr-2"></i>{m.common.save()}
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}
