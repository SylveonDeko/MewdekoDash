<!-- routes/dashboard/repeaters/+page.svelte -->
<script lang="ts">


  import { onMount } from "svelte";
    import {fade, fly} from "svelte/transition";
    import {colorStore} from "$lib/stores/colorStore";
    import {currentGuild} from "$lib/stores/currentGuild";
    import {
      repeatersApi,
      clientApi,
      messageCountApi,
      type CreateRepeaterRequest,
      type MessageCountingStatus,
      type RepeaterFormData,
      type RepeaterResponse,
      type RepeaterStatsResponse,
      type UpdateRepeaterRequest,
        formatInterval,
        formatTimeUntilNext,
        getTriggerModeDescription,
        getTriggerModeLabel,
        StickyTriggerMode,
        TIME_SCHEDULE_PRESETS
    } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";

  import StatCard from "$lib/components/monitoring/StatCard.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import PreviewCard from "$lib/components/specialized/PreviewCard.svelte";
  import EmbedEditor from "$lib/components/specialized/EmbedEditor.svelte";

    // Component state
    let loading = $state(false);
    let saving = $state(false);
    let message = $state("");
    let messageType: "success" | "error" | "info" = $state("info");

  // Data state
    let repeaters: RepeaterResponse[] = $state([]);
    let repeaterStats: RepeaterStatsResponse | null = $state(null);
    let messageCountStatus: MessageCountingStatus | null = $state(null);
    let guildChannels: Array<{ id: string; name: string; }> = $state([]);
  let forumChannels: Array<{ 
    id: string; 
    name: string; 
    tags: Array<{id: bigint, name: string, emoji: string | null, isModerated: boolean}>;
  }> = $state([]);
  
  // Dynamic channel selection state
    let selectedChannelType: 'text' | 'forum' | null = $state(null);
    let availableForumTags: Array<{ id: bigint, name: string, emoji: string | null }> = $state([]);
    let selectedForumTags: { required: bigint[], excluded: bigint[] } = $state({required: [], excluded: []});

    let messageContent = $state(""); // Plain text content
  let messageEmbeds: Array<{
    title: string;
    description: string;
    color: string;
    url: string;
    author: { name: string; url: string; icon_url: string };
    thumbnail: { url: string };
    image: { url: string };
    footer: { text: string; icon_url: string };
    fields: Array<{ name: string; value: string; inline: boolean; id: number }>;
  }> = $state([]);
  let messageComponents: Array<{
    componentKey: string;
    id: string | null;
    displayName: string;
    style: number;
    url: string;
    emoji: string;
    isSelect: boolean;
    maxOptions: number;
    minOptions: number;
    options: Array<{ id: string | null; name: string; emoji: string; description: string }>;
  }> = $state([]);

  // Message builder state
    let showEmbedBuilder = $state(false);
    let showComponentBuilder = $state(false);
  let editingEmbed: any = null;
  let editingComponent: any = null;

  // UI state
    let activeTab = $state("overview");
    let selectedRepeater: RepeaterResponse | null = $state(null);
  let showCreateForm = false;
    let editingRepeaterId: number | null = $state(null);
    let isEditMode = $state(false);

  // Form data for creating/editing repeaters - NOW WITH ALL FIELDS
    let formData: RepeaterFormData = $state({
    channelId: null,
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
    forumTagConditions: null
    });

  // Additional state for advanced features
    let selectedRepeaterIds: number[] = $state([]);
  let showBulkActions = false;
  let showAdvancedTimeEditor = false;
    let showForumTagEditor = $state(false);
  let currentForumTags: Array<{id: bigint, name: string, type: 'required'|'excluded'}> = [];
  let threadStickyMessages: Array<{threadId: bigint, messageId: bigint, threadName: string, isActive: boolean}> = [];
  
  // UI state for simplified form
    let showAdvancedOptions = $state(false);

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
      type: 'text',
      label: `#${ch.name} (Text Channel)`
    })),
    ...forumChannels.map(ch => ({ 
      id: ch.id, 
      name: ch.name, 
      type: 'forum',
      label: `#${ch.name} (Forum - ${ch.tags.length} tags)`,
      tags: ch.tags
    }))
    ]);

  // Dynamic channel type detection and tag loading
  $effect(() => {
    if (formData.channelId) {
      const selectedChannel = allChannels.find(ch => ch.id === formData.channelId);
      if (selectedChannel) {
        selectedChannelType = selectedChannel.type as 'text' | 'forum';
        
        if (selectedChannel.type === 'forum' && selectedChannel.tags) {
          availableForumTags = selectedChannel.tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            emoji: tag.emoji
          }));
          // Auto-enable thread auto-sticky for forum channels (only if not in edit mode)
          if (!isEditMode) {
            formData.threadAutoSticky = true;
            // Auto-enable thread-only mode for immediate trigger on forum channels
            if (formData.triggerMode === StickyTriggerMode.Immediate) {
              formData.threadOnlyMode = true;
            }
          }
        } else {
          availableForumTags = [];
          // Reset thread auto-sticky for non-forum channels (only if not in edit mode)  
          if (!isEditMode) {
            formData.threadAutoSticky = false;
            formData.threadOnlyMode = false;
          }
        }
      }
    } else {
      selectedChannelType = null;
      availableForumTags = [];
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
        messageCountData,
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
        messageCountApi.getMessageCountingStatus($currentGuild.id).catch((err) => {
          logger.error("Failed to fetch message counting status:", err);
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
      messageCountStatus = messageCountData;

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
      
      showMessage("Data loaded successfully", "success");
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

      let fullMessage = messageContent;
      if (messageEmbeds.length > 0 || messageComponents.length > 0) {
        const messageJson: any = {};
        if (messageContent.trim()) messageJson.content = messageContent;
        if (messageEmbeds.length > 0) messageJson.embeds = messageEmbeds;
        if (messageComponents.length > 0) messageJson.components = messageComponents;
        fullMessage = JSON.stringify(messageJson);
      }

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
        forumTagConditions: forumTagConditionsJson
      };

      logger.info("Creating repeater request:", {
        triggerMode: formData.triggerMode,
        threadOnlyMode: formData.threadOnlyMode,
        threadAutoSticky: formData.threadAutoSticky,
        selectedChannelType: selectedChannelType
      });

      await api.createRepeater($currentGuild.id, request);
      showMessage("Repeater created successfully!", "success");
      
      // Reset form and close modal
      resetForm();
      showCreateForm = false;
      
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
    if (!$currentGuild?.id || !editingRepeaterId || !selectedRepeater) return;

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

      let fullMessage = messageContent;
      if (messageEmbeds.length > 0 || messageComponents.length > 0) {
        const messageJson: any = {};
        if (messageContent.trim()) messageJson.content = messageContent;
        if (messageEmbeds.length > 0) messageJson.embeds = messageEmbeds;
        if (messageComponents.length > 0) messageJson.components = messageComponents;
        fullMessage = JSON.stringify(messageJson);
      }

      const request: UpdateRepeaterRequest = {
        message: fullMessage,
        channelId: formData.channelId ? BigInt(formData.channelId) : null,
        interval: formData.interval,
        triggerMode: formData.triggerMode,
        activityThreshold: formData.activityThreshold,
        activityTimeWindow: formData.activityTimeWindow,
        conversationDetection: formData.conversationDetection,
        conversationThreshold: formData.conversationThreshold,
        priority: formData.priority,
        queuePosition: formData.queuePosition,
        noRedundant: formData.noRedundant,
        isEnabled: true,
        timeConditions: formData.timeSchedulePreset === 'custom' ? formData.timeConditions : null,
        maxAge: formData.maxAge || null,
        maxTriggers: formData.maxTriggers,
        threadAutoSticky: formData.threadAutoSticky,
        threadOnlyMode: formData.threadOnlyMode,
        forumTagConditions: forumTagConditionsJson,
        allowMentions: formData.allowMentions
      };

      logger.info(`Updating repeater ${editingRepeaterId} for guild ${$currentGuild.id}`, request);
      await repeatersApi.updateRepeater($currentGuild.id, editingRepeaterId!, request);
      logger.info(`Successfully updated repeater ${editingRepeaterId}`);
      showMessage("Repeater updated successfully!", "success");
      
      // Reset form and switch back to overview
      resetForm();
      activeTab = "overview";
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
      await api.triggerRepeater($currentGuild.id, repeaterId);
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
    let parsedMessage = "";
    let parsedEmbeds = [];
    let parsedComponents = [];
    
    try {
      const messageJson = JSON.parse(repeater.message);
      parsedMessage = messageJson.content || "";
      parsedEmbeds = messageJson.embeds || [];
      parsedComponents = messageJson.components || [];
    } catch {
      // Not JSON, treat as plain text
      parsedMessage = repeater.message;
    }
    
    // Parse forum tag conditions if present
    let parsedForumTags = { required: [], excluded: [] };
    if (repeater.forumTagConditions) {
      try {
        const conditions = JSON.parse(repeater.forumTagConditions);
        parsedForumTags.required = (conditions.requiredTags || []).map(id => BigInt(id));
        parsedForumTags.excluded = (conditions.excludedTags || []).map(id => BigInt(id));
      } catch {
        // Invalid JSON, use defaults
      }
    }
    
    formData = {
      channelId: repeater.channelId.toString(),
      message: parsedMessage,
      interval: repeater.interval,
      startTimeOfDay: repeater.startTimeOfDay || "",
      triggerMode: repeater.triggerMode,
      activityThreshold: repeater.activityThreshold,
      activityTimeWindow: repeater.activityTimeWindow,
      conversationDetection: repeater.conversationDetection,
      conversationThreshold: repeater.conversationThreshold,
      priority: repeater.priority,
      queuePosition: repeater.queuePosition,
      noRedundant: repeater.noRedundant,
      allowMentions: false, // This isn't stored, so default to false
      timeSchedulePreset: repeater.timeConditions ? "custom" : "none",
      timeConditions: repeater.timeConditions || "",
      maxAge: repeater.maxAge || "",
      maxTriggers: repeater.maxTriggers,
      threadAutoSticky: repeater.threadAutoSticky,
      threadOnlyMode: repeater.threadOnlyMode,
      forumTagConditions: null
    };
    
    // Set parsed content
    messageContent = parsedMessage;
    messageEmbeds = parsedEmbeds;
    messageComponents = parsedComponents;
    selectedForumTags = parsedForumTags;
    
    // Switch to create tab
    activeTab = "create";
  }

  // Reset form data
  function resetForm() {
    formData = {
      channelId: null,
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
      forumTagConditions: null
    };
    
    // Reset additional state
    selectedRepeaterIds = [];
    showBulkActions = false;
    showAdvancedTimeEditor = false;
    showForumTagEditor = false;
    currentForumTags = [];
    selectedChannelType = null;
    availableForumTags = [];
    selectedForumTags = {required: [], excluded: []};
    
    messageContent = "";
    messageEmbeds = [];
    messageComponents = [];
    showEmbedBuilder = false;
    showComponentBuilder = false;
    isEditMode = false;
    editingRepeaterId = null;
    selectedRepeater = null;
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
    showBulkActions = selectedRepeaterIds.length > 0;
  }

  function selectAllRepeaters() {
    selectedRepeaterIds = repeaters.map(r => r.id);
    showBulkActions = true;
  }

  function clearSelection() {
    selectedRepeaterIds = [];
    showBulkActions = false;
  }

  async function bulkToggleRepeaters(enable: boolean) {
    if (!$currentGuild?.id || selectedRepeaterIds.length === 0) return;

    try {
      const result = await api.bulkToggleRepeaters($currentGuild.id, selectedRepeaterIds, enable);
      const successCount = result.results.filter(r => r.success).length;
      showMessage(`${enable ? 'Enabled' : 'Disabled'} ${successCount} repeaters successfully`, "success");
      
      clearSelection();
      await loadAllData();
    } catch (err) {
      logger.error("Failed to bulk toggle repeaters:", err);
      showMessage("Failed to bulk toggle repeaters", "error");
    }
  }

  // Queue Position Management
  async function updateQueuePosition(repeaterId: number, newPosition: number) {
    if (!$currentGuild?.id) return;

    try {
      await repeatersApi.updateRepeaterQueuePosition($currentGuild.id, repeaterId, newPosition);
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

  // Individual Property Updates
  async function updateRepeaterInterval(repeaterId: number, interval: string) {
    if (!$currentGuild?.id) return;

    try {
      await repeatersApi.updateRepeaterInterval($currentGuild.id, repeaterId, interval);
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
      await repeatersApi.updateRepeaterStartTime($currentGuild.id, repeaterId, startTime);
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
      await repeatersApi.updateRepeaterConversationThreshold($currentGuild.id, repeaterId, threshold);
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
      await repeatersApi.updateRepeaterExpiry($currentGuild.id, repeaterId, maxAge || null, maxTriggers || null);
      showMessage("Expiry settings updated successfully", "success");
      await loadAllData();
    } catch (err) {
      logger.error("Failed to update expiry settings:", err);
      showMessage("Failed to update expiry settings", "error");
    }
  }

  // Forum Tag Management
  async function loadForumTags(repeaterId: number) {
    if (!$currentGuild?.id) return;

    try {
      const response = await repeatersApi.updateRepeaterForumTags($currentGuild.id, repeaterId, "list");
      // Parse the conditions from the response
      if (response.conditions) {
        const conditions = JSON.parse(response.conditions);
        currentForumTags = [
          ...(conditions.requiredTags || []).map((id: bigint) => ({ id, name: `Tag ${id}`, type: 'required' as const })),
          ...(conditions.excludedTags || []).map((id: bigint) => ({ id, name: `Tag ${id}`, type: 'excluded' as const }))
        ];
      }
    } catch (err) {
      logger.error("Failed to load forum tags:", err);
    }
  }

  async function addForumTag(repeaterId: number, tagId: bigint, tagType: 'required' | 'excluded') {
    if (!$currentGuild?.id) return;

    try {
      await repeatersApi.updateRepeaterForumTags($currentGuild.id, repeaterId, "add", tagType, [tagId]);
      showMessage(`Forum tag ${tagType === 'required' ? 'required' : 'excluded'} successfully`, "success");
      await loadForumTags(repeaterId);
    } catch (err) {
      logger.error("Failed to add forum tag:", err);
      showMessage("Failed to add forum tag", "error");
    }
  }

  async function removeForumTag(repeaterId: number, tagId: bigint, tagType: 'required' | 'excluded') {
    if (!$currentGuild?.id) return;

    try {
      await repeatersApi.updateRepeaterForumTags($currentGuild.id, repeaterId, "remove", tagType, [tagId]);
      showMessage("Forum tag removed successfully", "success");
      await loadForumTags(repeaterId);
    } catch (err) {
      logger.error("Failed to remove forum tag:", err);
      showMessage("Failed to remove forum tag", "error");
    }
  }

  async function clearForumTags(repeaterId: number) {
    if (!$currentGuild?.id) return;

    try {
      await repeatersApi.updateRepeaterForumTags($currentGuild.id, repeaterId, "clear");
      showMessage("All forum tags cleared successfully", "success");
      await loadForumTags(repeaterId);
    } catch (err) {
      logger.error("Failed to clear forum tags:", err);
      showMessage("Failed to clear forum tags", "error");
    }
  }

  // Thread Sticky Messages
  async function loadThreadStickyMessages(repeaterId: number) {
    if (!$currentGuild?.id) return;

    try {
      threadStickyMessages = await repeatersApi.getRepeaterThreadMessages($currentGuild.id, repeaterId);
    } catch (err) {
      logger.error("Failed to load thread sticky messages:", err);
      threadStickyMessages = [];
    }
  }

  function openAdvancedTimeEditor(repeaterId?: number) {
    showAdvancedTimeEditor = true;
    if (repeaterId) {
      const repeater = repeaters.find(r => r.id === repeaterId);
      if (repeater?.timeConditions) {
        formData.timeConditions = repeater.timeConditions;
      }
    }
  }

  async function saveAdvancedTimeConditions(repeaterId: number) {
    if (!$currentGuild?.id) return;

    try {
      await repeatersApi.updateRepeater($currentGuild.id, repeaterId, {
        timeConditions: formData.timeConditions || null
      });
      showMessage("Time conditions updated successfully", "success");
      showAdvancedTimeEditor = false;
      await loadAllData();
    } catch (err) {
      logger.error("Failed to update time conditions:", err);
      showMessage("Failed to update time conditions", "error");
    }
  }

  onMount(() => {
    loadAllData();
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

  // Handle tab change
  function handleTabChange(event: CustomEvent) {
    activeTab = event.detail.tabId;
    if (activeTab === "create") {
      showCreateForm = true;
      resetForm();
    } else {
      showCreateForm = false;
    }
  }
</script>

<DashboardPageLayout
  title="Message Repeaters"
  subtitle="Manage automated recurring messages and sticky posts"
  icon="fa-clock"
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
          <i class="fa-utility-duo fa-regular fa-circle-check"
             style="--fa-primary-color: #10b981; --fa-secondary-color: #059669; font-size: 20px;"></i>
        {:else if messageType === 'error'}
          <i class="fa-utility-duo fa-regular fa-circle-xmark"
             style="--fa-primary-color: #ef4444; --fa-secondary-color: #dc2626; font-size: 20px;"></i>
        {:else}
          <i class="fa-utility-duo fa-regular fa-bell"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
        {/if}
        <span
          style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
      </div>
    {/if}

    <!-- Message Counting Warning -->
    {#if messageCountStatus && !messageCountStatus.enabled && messageCountStatus.available}
      <div class="mb-6 p-4 rounded-xl flex items-center gap-3 border"
           style="background: {$colorStore.accent}10; border-color: {$colorStore.accent}30;"
           in:fly={{ x: -20, duration: 300 }}>
        <i class="fa-utility-duo fa-regular fa-bell"
           style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
        <div>
          <span style="color: {$colorStore.text}">
            <strong>Message Counting Disabled:</strong> Some trigger modes require message counting to be enabled.
          </span>
        </div>
      </div>
    {/if}
  </svelte:fragment>

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

      <!-- Trigger Mode Distribution -->
      {#if repeaterStats?.triggerModeDistribution}
        <div class="rounded-2xl p-6 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3 mb-6">
            <i class="fa-utility-duo fa-regular fa-gear"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Trigger Mode Distribution</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each Object.entries(repeaterStats.triggerModeDistribution) as [mode, count] (mode)}
              <div class="p-4 rounded-xl"
                   style="background: {$colorStore.primary}08;">
                <div class="flex items-center justify-between">
                  <span class="font-medium" style="color: {$colorStore.text}">{mode}</span>
                  <span class="text-lg font-bold" style="color: {$colorStore.primary}">{count}</span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Most Active Repeater -->
      {#if repeaterStats?.mostActiveRepeater}
        <div class="rounded-2xl p-6 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3 mb-6">
            <i class="fa-utility-duo fa-regular fa-star"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Most Active Repeater</h2>
          </div>

          <div class="p-4 rounded-xl"
               style="background: {$colorStore.primary}08;">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium" style="color: {$colorStore.text}">
                {getChannelName(repeaterStats.mostActiveRepeater.channelId)}
              </span>
              <span class="text-lg font-bold" style="color: {$colorStore.primary}">
                {repeaterStats.mostActiveRepeater.displayCount} displays
              </span>
            </div>
            <p class="text-sm" style="color: {$colorStore.muted}">
              {repeaterStats.mostActiveRepeater.message.substring(0, 100)}...
            </p>
          </div>
        </div>
      {/if}
    </div>

  {:else if activeTab === 'manage'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      <!-- Repeaters List -->
      {#if repeaters.length === 0}
        <!-- Empty state -->
        <div class="text-center py-12 rounded-2xl"
             style="background: {$colorStore.primary}08;">
          <i class="fa-utility-duo fa-regular fa-clock"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 64px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
          <h3 class="text-xl font-semibold mb-2" style="color: {$colorStore.text}">No Repeaters</h3>
          <p class="mb-6" style="color: {$colorStore.muted}">
            Create your first repeater to start sending automated messages.
          </p>
          <button
            class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
            style="background: {$colorStore.primary}; color: white;"
            onclick={() => activeTab = 'create'}
          >
            <i class="fa-solid fa-plus" style="font-size: 20px;"></i>
            Create Repeater
          </button>
        </div>
      {:else}
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <!-- Selection Controls -->
          <div class="flex items-center gap-3">
            <button
              class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
              onclick={selectAllRepeaters}
              disabled={repeaters.length === 0}
            >
              <i class="fa-solid fa-square-check" style="font-size: 16px;"></i>
              Select All ({repeaters.length})
            </button>
            
            {#if selectedRepeaterIds.length > 0}
              <button
                class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                onclick={clearSelection}
              >
                <i class="fa-solid fa-square" style="font-size: 16px;"></i>
                Clear ({selectedRepeaterIds.length})
              </button>
            {/if}
          </div>

          <!-- Bulk Actions -->
          {#if selectedRepeaterIds.length > 0}
            <div class="flex items-center gap-3" in:fly={{ x: 20, duration: 300 }}>
              <span class="text-sm font-medium" style="color: {$colorStore.text}">
                {selectedRepeaterIds.length} selected:
              </span>
              
              <button
                class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                onclick={() => bulkToggleRepeaters(true)}
              >
                <i class="fa-solid fa-check" style="font-size: 16px;"></i>
                Enable All
              </button>
              
              <button
                class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                onclick={() => bulkToggleRepeaters(false)}
              >
                <i class="fa-solid fa-xmark" style="font-size: 16px;"></i>
                Disable All
              </button>
            </div>
          {/if}
        </div>

        <!-- Repeaters grid -->
        <div class="space-y-4">
          {#each repeaters as repeater, index}
            {@const parsedMessage = parseRepeaterMessage(repeater.message)}
            <div class="rounded-2xl p-6 shadow-lg border transition-all hover:scale-[1.01]"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {repeater.isEnabled ? $colorStore.primary + '30' : $colorStore.muted + '20'};"
                 in:fly={{ y: 20, duration: 300, delay: index * 50 }}>
              
              <!-- Repeater Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <!-- Selection Checkbox -->
                  <label for="input-9921"
                         class="flex items-center justify-center w-6 h-6 rounded-sm border-2 cursor-pointer transition-all hover:scale-110"
                         style="border-color: {selectedRepeaterIds.includes(repeater.id) ? $colorStore.primary : $colorStore.muted}; 
                                background: {selectedRepeaterIds.includes(repeater.id) ? $colorStore.primary : 'transparent'};">
                    <input
                      type="checkbox"
                      class="sr-only"
                      checked={selectedRepeaterIds.includes(repeater.id)}
                      onchange={() => toggleRepeaterSelection(repeater.id)}
                    >
                    {#if selectedRepeaterIds.includes(repeater.id)}
                      <i class="fa-solid fa-check" style="color: white; font-size: 16px;"></i>
                    {/if}
                  </label>

                  <div class="p-2 rounded-lg"
                       style="background: {repeater.isEnabled ? $colorStore.primary + '20' : $colorStore.muted + '20'};">
                    <i class="fa-solid fa-hashtag"
                       style="color: {repeater.isEnabled ? $colorStore.primary : $colorStore.muted}; font-size: 20px;"></i>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold" style="color: {$colorStore.text}">
                      {getChannelName(repeater.channelId)}
                    </h3>
                    <div class="flex items-center gap-4 text-sm" style="color: {$colorStore.muted}">
                      <span>{getTriggerModeLabel(repeater.triggerMode)}</span>
                      <span>Priority: {repeater.priority}</span>
                      <span>Queue: #{repeater.queuePosition}</span>
                      <span>{repeater.displayCount} displays</span>
                    </div>
                  </div>
                </div>

                <!-- Status indicator -->
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full"
                       style="background: {repeater.isEnabled ? '#10b981' : '#6b7280'};"></div>
                  <span class="text-sm font-medium"
                        style="color: {repeater.isEnabled ? '#10b981' : '#6b7280'}">
                    {repeater.isEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div class="mb-4">
                {#if parsedMessage.hasRichContent}
                   <div class="p-3 rounded-lg border" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                    <div class="flex items-center gap-2 mb-2">
                      <i class="fa-solid fa-message" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                      <span class="text-xs font-medium" style="color: {$colorStore.primary}">Rich Message</span>
                      {#if parsedMessage.embeds.length > 0}
                        <span class="text-xs px-2 py-1 rounded-sm"
                              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                          {parsedMessage.embeds.length} embed{parsedMessage.embeds.length > 1 ? 's' : ''}
                        </span>
                      {/if}
                      {#if parsedMessage.components.length > 0}
                        <span class="text-xs px-2 py-1 rounded-sm"
                              style="background: {$colorStore.accent}20; color: {$colorStore.accent}">
                          {parsedMessage.components.length} component{parsedMessage.components.length > 1 ? 's' : ''}
                        </span>
                      {/if}
                    </div>
                    <!-- Compact preview using PreviewCard -->
                    <div class="max-h-48 overflow-hidden">
                      <PreviewCard 
                        content={parsedMessage.content}
                        embeds={parsedMessage.embeds.slice(0, 2)}
                        components={parsedMessage.components.slice(0, 1)}
                        showEmpty={false}
                        compact={true}
                      />
                    </div>
                    {#if parsedMessage.embeds.length > 2 || parsedMessage.components.length > 1}
                      <div class="text-xs text-center mt-2 pt-2 border-t" style="color: {$colorStore.muted}; border-color: {$colorStore.primary}20;">
                        + {Math.max(0, parsedMessage.embeds.length - 2) + Math.max(0, parsedMessage.components.length - 1)} more items
                      </div>
                    {/if}
                  </div>
                {:else}
                  <!-- Simple text preview -->
                  <div class="p-3 rounded-lg" style="background: {$colorStore.primary}08;">
                    <p class="text-sm" style="color: {$colorStore.text}">
                      {parsedMessage.content.substring(0, 200)}
                      {#if parsedMessage.content.length > 200}...{/if}
                    </p>
                  </div>
                {/if}
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                    onclick={() => editRepeater(repeater)}
                  >
                    <i class="fa-solid fa-pen" style="font-size: 16px;"></i>
                    Edit
                  </button>

                  <button
                    class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                    style="background: {repeater.isEnabled ? $colorStore.accent + '20' : $colorStore.primary + '20'};
                           color: {repeater.isEnabled ? $colorStore.accent : $colorStore.primary};"
                    onclick={() => toggleRepeater(repeater.id)}
                  >
                    <i class="fa-solid fa-toggle-off" style="font-size: 16px;"></i>
                    {repeater.isEnabled ? 'Disable' : 'Enable'}
                  </button>

                  <button
                    class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                    style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                    onclick={() => triggerRepeater(repeater.id)}
                    disabled={!repeater.isEnabled}
                  >
                    <i class="fa-solid fa-play" style="font-size: 16px;"></i>
                    Trigger Now
                  </button>

                  <!-- Queue Position Controls -->
                  <div class="flex items-center">
                    <button aria-label="Delete"
                            class="flex items-center gap-1 px-2 py-2 rounded-l-lg text-sm font-medium transition-all hover:scale-[1.02]"
                      style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                      onclick={() => moveRepeaterUp(repeater.id)}
                      disabled={repeater.queuePosition <= 1}
                    >
                      <i class="fa-solid fa-arrow-up" style="font-size: 16px;"></i>
                    </button>
                    <button aria-label="Edit"
                            class="flex items-center gap-1 px-2 py-2 rounded-r-lg text-sm font-medium transition-all hover:scale-[1.02]"
                      style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                      onclick={() => moveRepeaterDown(repeater.id)}
                    >
                      <i class="fa-solid fa-arrow-down" style="font-size: 16px;"></i>
                    </button>
                  </div>

                  <button
                    class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                    style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                    onclick={() => deleteRepeater(repeater.id)}
                  >
                    <i class="fa-solid fa-trash" style="font-size: 16px;"></i>
                    Delete
                  </button>
                </div>

                <!-- Advanced Controls -->
                <div class="flex flex-wrap items-center gap-2">
                  <!-- Quick Property Updates -->
                  <button
                    class="flex items-center gap-2 px-2 py-1 rounded-sm text-xs font-medium transition-all hover:scale-[1.02]"
                    style="background: {$colorStore.primary}15; color: {$colorStore.primary};"
                    onclick={() => {
                      const newInterval = prompt('New interval (HH:MM:SS):', repeater.interval);
                      if (newInterval) updateRepeaterInterval(repeater.id, newInterval);
                    }}
                  >
                    <i class="fa-solid fa-clock" style="font-size: 12px;"></i>
                    Interval
                  </button>

                  <button
                    class="flex items-center gap-2 px-2 py-1 rounded-sm text-xs font-medium transition-all hover:scale-[1.02]"
                    style="background: {$colorStore.primary}15; color: {$colorStore.primary};"
                    onclick={() => {
                      const newTime = prompt('Start time (HH:MM, leave empty to disable):', repeater.startTimeOfDay || '');
                      updateRepeaterStartTime(repeater.id, newTime || null);
                    }}
                  >
                    <i class="fa-solid fa-clock" style="font-size: 12px;"></i>
                    Start Time
                  </button>

                  {#if repeater.conversationDetection}
                    <button
                      class="flex items-center gap-2 px-2 py-1 rounded-sm text-xs font-medium transition-all hover:scale-[1.02]"
                      style="background: {$colorStore.secondary}15; color: {$colorStore.secondary};"
                      onclick={() => {
                        const newThreshold = prompt('Conversation threshold (messages/minute):', repeater.conversationThreshold.toString());
                        if (newThreshold) updateRepeaterConversationThreshold(repeater.id, parseInt(newThreshold));
                      }}
                    >
                      <i class="fa-solid fa-users" style="font-size: 12px;"></i>
                      Conv: {repeater.conversationThreshold}/min
                    </button>
                  {/if}

                  <button
                    class="flex items-center gap-2 px-2 py-1 rounded-sm text-xs font-medium transition-all hover:scale-[1.02]"
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
                      class="flex items-center gap-2 px-2 py-1 rounded-sm text-xs font-medium transition-all hover:scale-[1.02]"
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
                      class="flex items-center gap-2 px-2 py-1 rounded-sm text-xs font-medium transition-all hover:scale-[1.02]"
                      style="background: {$colorStore.primary}15; color: {$colorStore.primary};"
                      onclick={() => openAdvancedTimeEditor(repeater.id)}
                    >
                      <i class="fa-solid fa-code" style="font-size: 12px;"></i>
                      Time JSON
                    </button>
                  {/if}

                  {#if repeater.threadAutoSticky || repeater.threadOnlyMode}
                    <button
                      class="flex items-center gap-2 px-2 py-1 rounded-sm text-xs font-medium transition-all hover:scale-[1.02]"
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
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      <!-- Create Repeater Form -->
      <div class="rounded-2xl p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <div class="flex items-center gap-3 mb-6">
          {#if isEditMode}
            <i class="fa-solid fa-pen" style="color: {$colorStore.secondary}; font-size: 20px;"></i>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Edit Repeater #{editingRepeaterId}</h2>
          {:else}
            <i class="fa-solid fa-plus" style="color: {$colorStore.primary}; font-size: 20px;"></i>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Create New Repeater</h2>
          {/if}
        </div>

        <form onsubmit={(e) => { e.preventDefault(); isEditMode ? updateRepeater() : createRepeater(); }}
              class="space-y-6">
          <!-- ===== SIMPLIFIED ESSENTIAL SETTINGS ===== -->
          
          <!-- Channel Selection -->
          <div>
            <span id="target-channel-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-hashtag" style="font-size: 16px;"></i>
              Target Channel
            </span>
            <DiscordSelector
              type="channel"
              options={allChannels}
              bind:selected={formData.channelId}
              placeholder="Select channel..."
              aria-labelledby="target-channel-label" />

          <!-- Forum Tag Filters (when forum channel selected) -->
          {#if selectedChannelType === 'forum' && availableForumTags.length > 0}
            <div class="p-4 rounded-xl border mt-4" 
                 style="background: {$colorStore.secondary}05; border-color: {$colorStore.secondary}20;"
                 in:fly={{ y: 20, duration: 300 }}>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-tags" style="color: {$colorStore.secondary}; font-size: 16px;"></i>
                  <h4 class="text-sm font-semibold" style="color: {$colorStore.text}">Forum Tag Filters</h4>
                    <span class="text-xs px-2 py-1 rounded-sm"
                          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                    Optional
                  </span>
                </div>
                
                {#if selectedForumTags.required.length > 0 || selectedForumTags.excluded.length > 0}
                  <button
                    type="button"
                    class="text-xs px-2 py-1 rounded-sm transition-all hover:scale-[1.02]"
                    style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                    onclick={() => selectedForumTags = {required: [], excluded: []}}
                  >
                    Clear All
                  </button>
                {/if}
              </div>
              
              <p class="text-xs mb-4" style="color: {$colorStore.muted}">
                Configure which forum tags are required or excluded for this repeater.
              </p>

              <!-- Required/Excluded Sections -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <!-- Required Tags Section -->
                <div>
                  <h5 class="text-sm font-medium mb-3 flex items-center gap-2" style="color: {$colorStore.text}">
                    <i class="fa-solid fa-check" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                    Must Have These Tags
                  </h5>
                  <div class="space-y-2">
                    {#each availableForumTags as tag}
                      <label for="input-9921"
                             class="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                             style="background: {selectedForumTags.required.includes(tag.id) ? $colorStore.primary + '15' : $colorStore.primary + '05'};
                                    border: 1px solid {selectedForumTags.required.includes(tag.id) ? $colorStore.primary + '40' : 'transparent'};">
                        <input
                          type="checkbox"
                          class="sr-only"
                          checked={selectedForumTags.required.includes(tag.id)}
                          onchange={(e) => {
                            if (e.target.checked) {
                              selectedForumTags.required = [...selectedForumTags.required, tag.id];
                              selectedForumTags.excluded = selectedForumTags.excluded.filter(id => id !== tag.id);
                            } else {
                              selectedForumTags.required = selectedForumTags.required.filter(id => id !== tag.id);
                            }
                          }}
                        >
                          <div class="w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all"
                             style="border-color: {selectedForumTags.required.includes(tag.id) ? $colorStore.primary : $colorStore.muted}; 
                                    background: {selectedForumTags.required.includes(tag.id) ? $colorStore.primary : 'transparent'};">
                          {#if selectedForumTags.required.includes(tag.id)}
                            <i class="fa-solid fa-check" style="color: white; font-size: 8px;"></i>
                          {/if}
                        </div>
                        <div class="flex items-center gap-2">
                          {#if tag.emoji}
                            <span>{tag.emoji}</span>
                          {/if}
                          <span class="text-sm" style="color: {$colorStore.text}">{tag.name}</span>
                        </div>
                      </label>
                    {/each}
                    
                    {#if selectedForumTags.required.length === 0}
                      <div class="text-xs text-center py-3" style="color: {$colorStore.muted}">
                        No tags required - will work on all threads
                      </div>
                    {/if}
                  </div>
                </div>

                <!-- Excluded Tags Section -->
                <div>
                  <h5 class="text-sm font-medium mb-3 flex items-center gap-2" style="color: {$colorStore.text}">
                    <i class="fa-solid fa-xmark" style="color: {$colorStore.accent}; font-size: 16px;"></i>
                    Never Use These Tags
                  </h5>
                  <div class="space-y-2">
                    {#each availableForumTags as tag}
                      <label for="input-9921"
                             class="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                             style="background: {selectedForumTags.excluded.includes(tag.id) ? $colorStore.accent + '15' : $colorStore.accent + '05'};
                                    border: 1px solid {selectedForumTags.excluded.includes(tag.id) ? $colorStore.accent + '40' : 'transparent'};">
                        <input
                          type="checkbox"
                          class="sr-only"
                          checked={selectedForumTags.excluded.includes(tag.id)}
                          disabled={selectedForumTags.required.includes(tag.id)}
                          onchange={(e) => {
                            if (e.target.checked) {
                              selectedForumTags.excluded = [...selectedForumTags.excluded, tag.id];
                            } else {
                              selectedForumTags.excluded = selectedForumTags.excluded.filter(id => id !== tag.id);
                            }
                          }}
                        >
                          <div class="w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all"
                             style="border-color: {selectedForumTags.excluded.includes(tag.id) ? $colorStore.accent : $colorStore.muted}; 
                                    background: {selectedForumTags.excluded.includes(tag.id) ? $colorStore.accent : 'transparent'};
                                    opacity: {selectedForumTags.required.includes(tag.id) ? '0.3' : '1'};">
                          {#if selectedForumTags.excluded.includes(tag.id)}
                            <i class="fa-solid fa-xmark" style="color: white; font-size: 8px;"></i>
                          {/if}
                        </div>
                        <div class="flex items-center gap-2" 
                             style="opacity: {selectedForumTags.required.includes(tag.id) ? '0.5' : '1'}">
                          {#if tag.emoji}
                            <span>{tag.emoji}</span>
                          {/if}
                          <span class="text-sm" style="color: {$colorStore.text}">{tag.name}</span>
                          {#if selectedForumTags.required.includes(tag.id)}
                              <span class="text-xs px-1 rounded-sm"
                                    style="background: {$colorStore.primary}; color: white;">Required</span>
                          {/if}
                        </div>
                      </label>
                    {/each}
                    
                    {#if selectedForumTags.excluded.length === 0}
                      <div class="text-xs text-center py-3" style="color: {$colorStore.muted}">
                        No tags excluded - will work on all thread types
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
              
              <!-- Smart Summary -->
              {#if selectedForumTags.required.length > 0 || selectedForumTags.excluded.length > 0}
                <div class="mt-4 p-3 rounded-lg transition-all duration-300" 
                     style="background: {$colorStore.primary}08;"
                     in:fly={{ y: 10, duration: 200 }}>
                  <div class="flex items-center gap-4 text-sm">
                    {#if selectedForumTags.required.length > 0}
                      <div class="flex items-center gap-1" style="color: {$colorStore.primary}">
                        <i class="fa-solid fa-check" style="font-size: 12px;"></i>
                        <span>{selectedForumTags.required.length} required</span>
                      </div>
                    {/if}
                    {#if selectedForumTags.excluded.length > 0}
                      <div class="flex items-center gap-1" style="color: {$colorStore.accent}">
                        <i class="fa-solid fa-xmark" style="font-size: 12px;"></i>
                        <span>{selectedForumTags.excluded.length} excluded</span>
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          {/if}

          <!-- Message Content with Live Preview -->
          <div class="mt-6">
              <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
              <!-- Message Input Side -->
              <div>
                <label for="input-9921" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                  <i class="fa-solid fa-message" style="font-size: 16px;"></i>
                  Message Content
                </label>
                
                <div class="space-y-4">
                  <div>
                    <textarea
                      bind:value={messageContent}
                      placeholder="Enter your repeater message here..."
                      rows="4"
                      class="w-full p-3 rounded-xl border transition-all resize-none"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    ></textarea>
                    
                    <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                      Supports Discord markdown: **bold**, *italic*, `code`, etc.
                    </p>
                  </div>
                  
                  <!-- Message Builder Options -->
                  <div class="flex flex-wrap gap-3">
                    <button
                      type="button"
                      class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
                      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                      onclick={() => showEmbedBuilder = !showEmbedBuilder}
                    >
                      <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
                      {messageEmbeds.length > 0 ? `${messageEmbeds.length} Embeds` : 'Add Embed'}
                    </button>
                    
                    <button
                      type="button"
                      class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
                      style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                      onclick={() => showComponentBuilder = !showComponentBuilder}
                    >
                      <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
                      {messageComponents.length > 0 ? `${messageComponents.length} Components` : 'Add Components'}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Live Discord Preview -->
              <div class="lg:sticky lg:top-4 lg:self-start">
                <label for="input-9921" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                  <i class="fa-solid fa-eye" style="font-size: 16px;"></i>
                  Live Preview
                </label>
                <div class="border rounded-xl overflow-hidden" style="border-color: {$colorStore.primary}30;">
                  <PreviewCard 
                    content={messageContent}
                    embeds={messageEmbeds}
                    components={messageComponents}
                    showEmpty={true}
                    emptyMessage="Start typing to see your message preview..."
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Advanced Embed Builder -->
          {#if showEmbedBuilder}
            <div class="mt-6 space-y-4" in:fly={{ y: 20, duration: 300 }}>
                <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-message" style="color: {$colorStore.primary}; font-size: 20px;"></i>
                    <h4 class="text-lg font-semibold" style="color: {$colorStore.text}">Message Embeds ({messageEmbeds.length}/10)</h4>
                  </div>
                  
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
                      style="background: {$colorStore.primary}; color: white;"
                      onclick={() => {
                        if (messageEmbeds.length < 10) {
                          messageEmbeds = [...messageEmbeds, {
                            title: '',
                            description: '',
                            color: '#5865F2',
                            url: '',
                            author: { name: '', url: '', icon_url: '' },
                            thumbnail: { url: '' },
                            image: { url: '' },
                            footer: { text: '', icon_url: '' },
                            fields: []
                          }];
                        }
                      }}
                      disabled={messageEmbeds.length >= 10}
                    >
                      <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
                      Add Embed
                    </button>
                    
                    <button
                      type="button"
                      class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                      style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                      onclick={() => showEmbedBuilder = false}
                    >
                      Done
                    </button>
                  </div>
                </div>
                
                <!-- Spacer for preview alignment -->
                <div class="hidden lg:block"></div>
              </div>
              
              <!-- Mobile-friendly Embed List -->
                <div class="space-y-6">
                  {#each messageEmbeds as embed, embedIndex}
                    <div class="border rounded-xl overflow-hidden" 
                         style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                      
                      <!-- Embed Header -->
                      <div class="flex items-center justify-between p-4 border-b" style="border-color: {$colorStore.primary}20;">
                        <span class="font-medium" style="color: {$colorStore.text}">
                          Embed {embedIndex + 1}
                        </span>
                        <div class="flex gap-2">
                          <button
                            type="button"
                            class="px-3 py-1 rounded-sm text-xs font-medium transition-all hover:scale-[1.02]"
                            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                            onclick={() => {
                              const duplicated = JSON.parse(JSON.stringify(embed));
                              messageEmbeds.splice(embedIndex + 1, 0, duplicated);
                              messageEmbeds = [...messageEmbeds];
                            }}
                          >
                            <i class="fa-solid fa-copy" style="font-size: 12px;"></i>
                            Copy
                          </button>
                          <button
                            type="button"
                            class="px-3 py-1 rounded-sm text-xs font-medium transition-all hover:scale-[1.02]"
                            style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                            onclick={() => messageEmbeds = messageEmbeds.filter((_, i) => i !== embedIndex)}
                          >
                            <i class="fa-solid fa-trash" style="font-size: 12px;"></i>
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      <!-- Use the full EmbedEditor component -->
                      <div class="p-4">
                        <EmbedEditor
                          bind:embed={messageEmbeds[embedIndex]}
                          index={embedIndex}
                          placeholders={[
                            { category: "User", name: "%user%", description: "Username of the user" },
                            { category: "User", name: "%user.mention%", description: "Mention the user" },
                            { category: "Server", name: "%server%", description: "Server name" },
                            { category: "Server", name: "%server.members%", description: "Number of server members" }
                          ]}
                          on:update={(e) => {
                            messageEmbeds[embedIndex] = e.detail.embed;
                            messageEmbeds = [...messageEmbeds];
                          }}
                        />
                      </div>
                    </div>
                  {/each}
                  
                  {#if messageEmbeds.length === 0}
                    <div class="text-center py-12 rounded-xl border-2 border-dashed" 
                         style="border-color: {$colorStore.primary}30;">
                      <i class="fa-utility-duo fa-regular fa-envelope"
                         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                      <h4 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No embeds yet</h4>
                      <p class="text-sm mb-4" style="color: {$colorStore.muted}">
                        Click "Add Embed" to create rich embedded messages
                      </p>
                    </div>
                  {/if}
                </div>
              </div>
            {/if}
            
            <!-- Component Builder Section (appears directly under message content) -->
            {#if showComponentBuilder}
              <div class="p-6 rounded-2xl border" 
                   style="background: {$colorStore.secondary}08; border-color: {$colorStore.secondary}30;"
                   in:fly={{ y: 20, duration: 300 }}>
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-bolt" style="color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h4 class="text-lg font-semibold" style="color: {$colorStore.text}">Interactive Components</h4>
                  </div>
                  
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="px-3 py-1 rounded-sm text-xs font-medium transition-all hover:scale-[1.02]"
                      style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                      onclick={() => {
                        messageComponents = [...messageComponents, {
                          componentKey: `btn-${Date.now()}`,
                          id: null,
                          displayName: 'New Button',
                          style: 1,
                          url: '',
                          emoji: '',
                          isSelect: false,
                          maxOptions: 1,
                          minOptions: 1,
                          options: []
                        }];
                      }}
                      disabled={messageComponents.length >= 25}
                    >
                      <i class="fa-solid fa-plus" style="font-size: 12px;"></i>
                      Add Button
                    </button>
                    
                    <button
                      type="button"
                      class="px-3 py-1 rounded-sm text-xs font-medium transition-all hover:scale-[1.02]"
                      style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                      onclick={() => showComponentBuilder = false}
                    >
                      Done
                    </button>
                  </div>
                </div>
                
                <!-- Component List -->
                <div class="space-y-4">
                  {#each messageComponents as component, index}
                    <div class="p-4 rounded-xl border" style="background: {$colorStore.secondary}05; border-color: {$colorStore.secondary}20;">
                      <div class="flex items-center justify-between mb-3">
                        <span class="text-sm font-medium" style="color: {$colorStore.text}">
                          Button: {component.displayName}
                        </span>
                        <button
                          type="button"
                          class="px-2 py-1 rounded-sm text-xs transition-all hover:scale-[1.02]"
                          style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                          onclick={() => messageComponents = messageComponents.filter((_, i) => i !== index)}
                        >
                          Remove
                        </button>
                      </div>
                      
                      <!-- Basic component fields -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label for="input-9921" class="block text-xs font-medium mb-1"
                                 style="color: {$colorStore.text}">Button Text</label>
                          <input id="input-9921"
                            type="text"
                            bind:value={component.displayName}
                            placeholder="Button label..."
                            class="w-full p-2 rounded-sm border text-sm"
                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          >
                        </div>
                        
                        <div>
                          <label for="input-2408" class="block text-xs font-medium mb-1"
                                 style="color: {$colorStore.text}">URL (optional)</label>
                          <input id="input-2408"
                            type="url"
                            bind:value={component.url}
                            placeholder="https://..."
                            class="w-full p-2 rounded-sm border text-sm"
                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          >
                        </div>
                      </div>
                    </div>
                  {/each}
                  
                  {#if messageComponents.length === 0}
                    <div class="text-center py-6" style="color: {$colorStore.muted}">
                      <i class="fa-solid fa-bolt" style="font-size: 32px;"></i>
                      <p class="text-sm">Click "Add Button" to create interactive components</p>
                    </div>
                  {/if}
                </div>
              </div>
            {/if}

          </div>


          <!-- Trigger Mode Selection -->
          <div>
            <span id="how-should-this-repeater-trigger-label" class="block text-sm font-medium mb-2"
                  style="color: {$colorStore.text}">
              <i class="fa-solid fa-bolt" style="font-size: 16px;"></i>
              How should this repeater trigger?
            </span>
            <DiscordSelector
              type="custom"
              options={triggerModeOptions}
              selected={formData.triggerMode.toString()}
              placeholder="Select trigger mode..."
              on:change={(e) => formData.triggerMode = parseInt(e.detail.selected)} />
          </div>

          <!-- ===== CONTEXTUAL INTERVAL SELECTION (Only for TimeInterval mode) ===== -->
          {#if formData.triggerMode === StickyTriggerMode.TimeInterval}
            <div in:fly={{ y: 20, duration: 300 }}>
              <label for="input-7328" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                <i class="fa-solid fa-clock" style="font-size: 16px;"></i>
                Repeat Every
              </label>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {#each [
                  { value: "00:01:00", label: "1 minute" },
                  { value: "00:05:00", label: "5 minutes" },
                  { value: "00:15:00", label: "15 minutes" },
                  { value: "01:00:00", label: "1 hour" },
                  { value: "06:00:00", label: "6 hours" },
                  { value: "1.00:00:00", label: "Daily" }
                ] as preset}
                  <label for="input-7328"
                         class="flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all hover:scale-[1.02]"
                         style="background: {formData.interval === preset.value ? $colorStore.primary + '20' : $colorStore.primary + '08'};
                                border-color: {formData.interval === preset.value ? $colorStore.primary : $colorStore.primary + '30'};">
                    <input
                      type="radio"
                      bind:group={formData.interval}
                      value={preset.value}
                      class="sr-only"
                    >
                    <span class="text-sm" style="color: {$colorStore.text}">{preset.label}</span>
                  </label>
                {/each}
              </div>
              
              <!-- Custom interval input -->
              <input
                type="text"
                bind:value={formData.interval}
                placeholder="Custom: HH:MM:SS"
                class="w-full p-2 rounded-lg border text-sm transition-all"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              >
            </div>
          {/if}

          <!-- Simple Feature Toggles -->
          <div class="flex flex-wrap gap-4">
            <label for="input-7328" class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={formData.noRedundant}
                class="sr-only"
              >
                <div class="w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all"
                   style="border-color: {formData.noRedundant ? $colorStore.primary : $colorStore.muted}; 
                          background: {formData.noRedundant ? $colorStore.primary : 'transparent'};">
                {#if formData.noRedundant}
                  <i class="fa-solid fa-check" style="color: white; font-size: 8px;"></i>
                {/if}
              </div>
              <span class="text-sm" style="color: {$colorStore.text}">Don't repeat if message is already last in channel</span>
            </label>

            <label for="input-7328" class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={formData.allowMentions}
                class="sr-only"
              >
                <div class="w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all"
                   style="border-color: {formData.allowMentions ? $colorStore.primary : $colorStore.muted}; 
                          background: {formData.allowMentions ? $colorStore.primary : 'transparent'};">
                {#if formData.allowMentions}
                  <i class="fa-solid fa-check" style="color: white; font-size: 8px;"></i>
                {/if}
              </div>
              <span class="text-sm" style="color: {$colorStore.text}">Allow @everyone and @here mentions</span>
            </label>
          </div>


          <!-- Collapsible Advanced Options -->
          <div class="border rounded-xl" style="border-color: {$colorStore.primary}30;">
            <button
              type="button"
              class="w-full flex items-center justify-between p-4 transition-all hover:opacity-50"
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
                
                <!-- Priority & Timing -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label for="input-7328" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Priority
                      (0-100)</label>
                    <input id="input-7328"
                      type="number"
                      bind:value={formData.priority}
                      min="0" max="100"
                      class="w-full p-2 rounded-lg border text-sm"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    >
                  </div>
                  
                  <div>
                    <label for="input-3731" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Queue
                      Position</label>
                    <input id="input-3731"
                      type="number"
                      bind:value={formData.queuePosition}
                      min="0"
                      class="w-full p-2 rounded-lg border text-sm"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    >
                  </div>
                  
                  <div>
                    <label for="input-5720" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Start
                      Time (HH:MM)</label>
                    <input id="input-5720"
                      type="time"
                      bind:value={formData.startTimeOfDay}
                      class="w-full p-2 rounded-lg border text-sm"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    >
                  </div>
                </div>

                <!-- Advanced Toggles -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label for="input-9356" class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" bind:checked={formData.conversationDetection} class="sr-only">
                      <div class="w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all"
                         style="border-color: {formData.conversationDetection ? $colorStore.primary : $colorStore.muted}; 
                                background: {formData.conversationDetection ? $colorStore.primary : 'transparent'};">
                      {#if formData.conversationDetection}
                        <i class="fa-solid fa-check" style="color: white; font-size: 8px;"></i>
                      {/if}
                    </div>
                    <span class="text-sm" style="color: {$colorStore.text}">Conversation Detection</span>
                  </label>

                  {#if selectedChannelType === 'forum'}
                    <label for="input-9356" class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" bind:checked={formData.threadAutoSticky} class="sr-only">
                        <div class="w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all"
                           style="border-color: {formData.threadAutoSticky ? $colorStore.primary : $colorStore.muted}; 
                                  background: {formData.threadAutoSticky ? $colorStore.primary : 'transparent'};">
                        {#if formData.threadAutoSticky}
                          <i class="fa-solid fa-check" style="color: white; font-size: 8px;"></i>
                        {/if}
                      </div>
                      <span class="text-sm" style="color: {$colorStore.text}">Auto-create in new threads</span>
                    </label>

                    <label for="input-9356" class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" bind:checked={formData.threadOnlyMode} class="sr-only">
                        <div class="w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all"
                           style="border-color: {formData.threadOnlyMode ? $colorStore.primary : $colorStore.muted}; 
                                  background: {formData.threadOnlyMode ? $colorStore.primary : 'transparent'};">
                        {#if formData.threadOnlyMode}
                          <i class="fa-solid fa-check" style="color: white; font-size: 8px;"></i>
                        {/if}
                      </div>
                      <span class="text-sm" style="color: {$colorStore.text}">Thread-only mode</span>
                    </label>
                  {/if}
                </div>

                <!-- Auto-Expiry (simplified) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="input-9356" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Auto-delete
                      after (days)</label>
                    <input id="input-9356"
                      type="text"
                      bind:value={formData.maxAge}
                      placeholder="7.00:00:00 (7 days)"
                      class="w-full p-2 rounded-lg border text-sm"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    >
                  </div>
                  
                  <div>
                    <label for="input-8121" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Max
                      displays</label>
                    <input id="input-8121"
                      type="number"
                      bind:value={formData.maxTriggers}
                      placeholder="Leave empty for unlimited"
                      min="1"
                      class="w-full p-2 rounded-lg border text-sm"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    >
                  </div>
                </div>

                <!-- Time Scheduling (simplified) -->
                <div>
                  <label for="input-6736" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Time
                    Schedule (Optional)</label>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {#each TIME_SCHEDULE_PRESETS as preset}
                      <label for="input-6736"
                             class="flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] text-sm"
                             style="background: {formData.timeSchedulePreset === preset.id ? $colorStore.primary + '20' : $colorStore.primary + '08'};
                                    border-color: {formData.timeSchedulePreset === preset.id ? $colorStore.primary : $colorStore.primary + '30'};">
                        <input
                          type="radio"
                          bind:group={formData.timeSchedulePreset}
                          value={preset.id}
                          class="sr-only"
                        >
                        <span style="color: {$colorStore.text}">{preset.name}</span>
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
            <div class="p-4 rounded-xl border" 
                 style="background: {$colorStore.secondary}05; border-color: {$colorStore.secondary}20;"
                 in:fly={{ y: 20, duration: 300 }}>
              <div class="flex items-center gap-2 mb-3">
                <i class="fa-solid fa-chart-line" style="color: {$colorStore.secondary}; font-size: 16px;"></i>
                <h4 class="text-sm font-semibold" style="color: {$colorStore.text}">Activity Settings</h4>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="input-6736" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                    {formData.triggerMode === StickyTriggerMode.AfterMessages ? 'Messages needed' : 'Activity threshold'}
                  </label>
                  <input id="input-6736"
                    type="number"
                    bind:value={formData.activityThreshold}
                    min="1"
                    class="w-full p-2 rounded-lg border text-sm"
                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                  >
                </div>
                
                <div>
                  <label for="input-9912" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Time
                    window</label>
                  <input id="input-9912"
                    type="text"
                    bind:value={formData.activityTimeWindow}
                    placeholder="00:05:00"
                    class="w-full p-2 rounded-lg border text-sm"
                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                  >
                </div>
              </div>
            </div>
          {/if}

          <!-- Immediate Mode Info -->
          {#if formData.triggerMode === StickyTriggerMode.Immediate}
            <div class="p-4 rounded-xl border" 
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

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
            <button
              type="submit"
              class="flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] min-h-[52px] shadow-lg"
              style="background: linear-gradient(135deg, {$colorStore.primary}, {$colorStore.secondary}); color: white;"
              disabled={saving || !formData.channelId || (!messageContent.trim() && messageEmbeds.length === 0)}
            >
              {#if saving}
                <i class="fa-solid fa-arrows-rotate fa-spin" style="font-size: 20px;"></i>
                {isEditMode ? 'Updating...' : 'Creating...'}
              {:else if isEditMode}
                <Edit3 class="w-5 h-5" />
                Update Repeater
              {:else}
                <i class="fa-solid fa-plus" style="font-size: 20px;"></i>
                Create Repeater
              {/if}
            </button>

            {#if isEditMode}
              <button
                type="button"
                class="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[52px]"
                style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                onclick={() => {
                  isEditMode = false;
                  editingRepeaterId = null;
                  selectedRepeater = null;
                  resetForm();
                  activeTab = 'overview';
                }}
              >
                <i class="fa-solid fa-xmark" style="font-size: 20px;"></i>
                Cancel Edit
              </button>
            {:else}
              <button
                type="button"
                class="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[52px]"
                style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30;"
                onclick={resetForm}
              >
                <i class="fa-solid fa-arrows-rotate" style="font-size: 20px;"></i>
                Reset Form
              </button>
            {/if}
          </div>
        </form>
      </div>
    </div>
  {/if}
</DashboardPageLayout>

