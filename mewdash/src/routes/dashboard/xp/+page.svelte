<!-- routes/dashboard/xp/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade } from "svelte/transition";
  import type { BotStatusModel } from "$lib/types/models.ts";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/Notification.svelte";
  import {
    AlertCircle,
    AlignCenter,
    Award,
    BarChart,
    BarChart2,
    Clock,
    Database,
    Grid,
    Image,
    Move,
    RotateCcw,
    Settings,
    Star,
    Type,
    User,
    Users,
    ZoomIn,
    ZoomOut
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
  let lastDragUpdate = 0;
  const THROTTLE_MS = 16;
  let dragAnimationFrameId = null;
  let currentUserData = null;
  let isLoadingUserData = false;

  // XP Settings
  let xpSettings = {
    guildId: $currentGuild.id,
    xpPerMessage: 3,
    messageXpCooldown: 60,
    voiceXpPerMinute: 2,
    voiceXpTimeout: 60,
    xpMultiplier: 1.0,
    xpCurveType: 0,
    customXpImageUrl: "",
    xpGainDisabled: false,
    serverExclusionState: false
  };

  // XP Stats
  let serverStats = {
    totalUsers: 0,
    totalXp: 0,
    averageLevel: 0,
    highestLevel: 0,
    recentActivity: [] as Array<{
      userId: string;
      username: string;
      avatarUrl: string;
      timestamp: string;
    }>
  };

  // XP Leaderboard
  let leaderboard: Array<{
    userId: string;
    guildId: string;
    totalXp: number;
    level: number;
    levelXp: number;
    requiredXp: number;
    rank: number;
    username: string;
    avatarUrl: string;
  }> = [];
  let leaderboardPage = 1;
  let leaderboardPageSize = 9;

  // XP Template
  let template: any = null;

  // XP Rewards
  let roleRewards: Array<{
    id: number;
    guildId: string;
    level: number;
    roleId: string;
    roleName: string;
  }> = [];

  let currencyRewards: Array<{
    id: number;
    guildId: string;
    level: number;
    amount: number;
  }> = [];

  // XP Exclusions
  let excludedChannels: string[] = [];
  let excludedRoles: string[] = [];

  // Management
  let changedSettings = new Set<string>();
  let activeTab: "settings" | "stats" | "leaderboard" | "rewards" | "template" | "exclusions" = "settings";
  let guildChannels: Array<{ id: string; name: string }> = [];
  let guildRoles: Array<{ id: string; name: string }> = [];
  let loading = {
    settings: true,
    stats: true,
    leaderboard: true,
    rewards: true,
    exclusions: true,
    template: true
  };
  let error = {
    settings: null as string | null,
    stats: null as string | null,
    leaderboard: null as string | null,
    rewards: null as string | null,
    exclusions: null as string | null,
    template: null as string | null
  };

  // Form inputs
  let newRoleReward = { level: 1, roleId: "" };
  let newCurrencyReward = { level: 1, amount: 100 };
  let selectedChannelId = "";
  let selectedRoleId = "";

  // Template Editor State
  let editorActiveTab = "general";
  let localTemplate: any = null;
  let previewContainerRef: HTMLDivElement;
  let draggingElement: any = null;
  let hoverElement: any = null;
  let dragStartPos = { x: 0, y: 0 };
  let dragStartElementPos = { x: 0, y: 0 };
  let previewScale = 1;
  let previewWidth = 0;
  let previewHeight = 0;
  let previewOffset = { x: 0, y: 0 };
  let isDesignMode = false;
  let imageUrl = "";
  let updateSizeFromImage = true;
  let imageLoading = false;
  let imageError = "";
  let previewBackgroundUrl: string | null = null;
  let showGrid = false;
  let gridSize = 10;
  let snapToGrid = false;
  let showRealDataPreview = false;
  let undoStack: string[] = [];
  let redoStack: string[] = [];
  let showSavedConfirmation = false;
  let showCoordinateOverlay = false;
  let showTooltips = true;
  let isDragging = false;
  let showGuideLines = false;
  let guideLinesPos = { x: null as number | null, y: null as number | null };
  let showSnapping = false;
  let snapLines: any[] = [];
  let editorMobileView: "preview" | "controls" = "preview";

  // Direction options for the progress bar
  const directions = [
    { value: 0, label: "Up" },
    { value: 1, label: "Down" },
    { value: 2, label: "Left" },
    { value: 3, label: "Right" }
  ];

  // Customizable sample data for preview
  let sampleData = {
    username: "SampleUser",
    avatarUrl: "https://via.placeholder.com/100",
    level: 25,
    rank: 3,
    timeOnLevel: "3d 12h 45m",
    clubName: "Sample Club",
    progress: 75 // percentage
  };

  // Draggable elements configuration
  const draggableElements = [
    {
      id: "username",
      label: "Username",
      getX: () => localTemplate?.templateUser?.textX || 0,
      getY: () => localTemplate?.templateUser?.textY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateUser.textX", Math.round(x));
        handleChange("templateUser.textY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateUser?.showText,
      getWidth: () => {
        // Estimate text width based on font size
        const fontSize = localTemplate?.templateUser?.fontSize || 20;
        return fontSize * 6; // Rough estimate of text width
      },
      getHeight: () => localTemplate?.templateUser?.fontSize || 20,
      color: "#3B82F6",
      tooltip: "Username text position"
    },
    {
      id: "userAvatar",
      label: "User Avatar",
      getX: () => localTemplate?.templateUser?.iconX || 0,
      getY: () => localTemplate?.templateUser?.iconY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateUser.iconX", Math.round(x));
        handleChange("templateUser.iconY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateUser?.showIcon,
      getWidth: () => localTemplate?.templateUser?.iconSizeX || 50,
      getHeight: () => localTemplate?.templateUser?.iconSizeY || 50,
      color: "#10B981",
      tooltip: "User avatar position and size"
    },
    {
      id: "guildLevel",
      label: "Guild Level",
      getX: () => localTemplate?.templateGuild?.guildLevelX || 0,
      getY: () => localTemplate?.templateGuild?.guildLevelY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateGuild.guildLevelX", Math.round(x));
        handleChange("templateGuild.guildLevelY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateGuild?.showGuildLevel,
      getWidth: () => (localTemplate?.templateGuild?.guildLevelFontSize || 20) * 5,
      getHeight: () => localTemplate?.templateGuild?.guildLevelFontSize || 20,
      color: "#8B5CF6",
      tooltip: "Guild level text position"
    },
    {
      id: "guildRank",
      label: "Guild Rank",
      getX: () => localTemplate?.templateGuild?.guildRankX || 0,
      getY: () => localTemplate?.templateGuild?.guildRankY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateGuild.guildRankX", Math.round(x));
        handleChange("templateGuild.guildRankY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateGuild?.showGuildRank,
      getWidth: () => (localTemplate?.templateGuild?.guildRankFontSize || 20) * 4,
      getHeight: () => localTemplate?.templateGuild?.guildRankFontSize || 20,
      color: "#EC4899",
      tooltip: "Guild rank position"
    },
    {
      id: "timeOnLevel",
      label: "Time On Level",
      getX: () => localTemplate?.timeOnLevelX || 0,
      getY: () => localTemplate?.timeOnLevelY || 0,
      setPos: (x: number, y: number) => {
        handleChange("timeOnLevelX", Math.round(x));
        handleChange("timeOnLevelY", Math.round(y));
      },
      isVisible: () => localTemplate?.showTimeOnLevel,
      getWidth: () => (localTemplate?.timeOnLevelFontSize || 20) * 6,
      getHeight: () => localTemplate?.timeOnLevelFontSize || 20,
      color: "#F59E0B",
      tooltip: "Time on level display position"
    },
    {
      id: "clubName",
      label: "Club Name",
      getX: () => localTemplate?.templateClub?.clubNameX || 0,
      getY: () => localTemplate?.templateClub?.clubNameY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateClub.clubNameX", Math.round(x));
        handleChange("templateClub.clubNameY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateClub?.showClubName,
      getWidth: () => (localTemplate?.templateClub?.clubNameFontSize || 20) * 5,
      getHeight: () => localTemplate?.templateClub?.clubNameFontSize || 20,
      color: "#14B8A6",
      tooltip: "Club name text position"
    },
    {
      id: "clubIcon",
      label: "Club Icon",
      getX: () => localTemplate?.templateClub?.clubIconX || 0,
      getY: () => localTemplate?.templateClub?.clubIconY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateClub.clubIconX", Math.round(x));
        handleChange("templateClub.clubIconY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateClub?.showClubIcon,
      getWidth: () => localTemplate?.templateClub?.clubIconSizeX || 50,
      getHeight: () => localTemplate?.templateClub?.clubIconSizeY || 50,
      color: "#6366F1",
      tooltip: "Club icon position and size"
    },
    {
      id: "progressBarStart",
      label: "Progress Bar Start",
      getX: () => localTemplate?.templateBar?.barPointAx || 0,
      getY: () => localTemplate?.templateBar?.barPointAy || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateBar.barPointAx", Math.round(x));
        handleChange("templateBar.barPointAy", Math.round(y));
      },
      isVisible: () => localTemplate?.templateBar?.showBar,
      getWidth: () => 20,
      getHeight: () => 20,
      color: "#EF4444",
      tooltip: "Progress bar starting point"
    },
    {
      id: "progressBarEnd",
      label: "Progress Bar End",
      getX: () => localTemplate?.templateBar?.barPointBx || 0,
      getY: () => localTemplate?.templateBar?.barPointBy || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateBar.barPointBx", Math.round(x));
        handleChange("templateBar.barPointBy", Math.round(y));
      },
      isVisible: () => localTemplate?.templateBar?.showBar,
      getWidth: () => 20,
      getHeight: () => 20,
      color: "#EF4444",
      tooltip: "Progress bar ending point"
    }
  ];

  // Fetch bot status
  async function fetchBotStatus() {
    try {
      botStatus = await api.getBotStatus();
    } catch (err) {
      logger.error("Failed to fetch bot status:", err);
    }
  }

  function activateTab(tab) {
    activeTab = tab;

    // If switching to template tab, schedule a refresh after DOM update
    if (tab === "template") {
      // Wait for component to render, then update scale
      setTimeout(() => {
        if (previewContainerRef && localTemplate) {
          updatePreviewScale();

          // Also ensure image loading if URL exists
          if (localTemplate.customXpImageUrl) {
            imageUrl = localTemplate.customXpImageUrl;
            previewBackgroundUrl = imageUrl;
          }
        }
      }, 100);
    }
  }

  $: if ($currentInstance) {
    Promise.all([
      fetchXpSettings(),
      fetchServerStats(),
      fetchLeaderboard(),
      fetchXpTemplate(),
      fetchRewards(),
      fetchExclusions(),
      fetchChannelsAndRoles(),
      fetchBotStatus()
    ]);
  }

  function markAsChanged(setting: string) {
    changedSettings = changedSettings.add(setting);
  }

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  async function fetchCurrentUserData() {
    try {
      if (!$currentGuild?.id) return;

      isLoadingUserData = true;

      const currentUserId = data.user?.id;

      if (!currentUserId) return;

      // Fetch the user's XP stats
      const userData = await api.getUserXpStats($currentGuild.id, currentUserId);

      // Format the timeOnLevel for display
      const timeStr = userData.timeOnLevel ?
        `${userData.timeOnLevel.days}d ${userData.timeOnLevel.hours}h ${userData.timeOnLevel.minutes}m` :
        "0d 0h 0m";

      // Calculate progress percentage
      const progress = userData.requiredXp ?
        Math.round((userData.levelXp / userData.requiredXp) * 100) :
        0;

      // Update currentUserData with the received data
      currentUserData = {
        username: userData.username,
        avatarUrl: userData.avatarUrl,
        level: userData.level,
        rank: userData.rank,
        timeOnLevel: timeStr,
        clubName: "Your Club",
        progress: progress
      };
    } catch (err) {
      logger.error("Failed to fetch user XP data:", err);
      showNotificationMessage("Could not load user data", "error");
    } finally {
      isLoadingUserData = false;
    }
  }

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function fetchXpSettings() {
    try {
      loading.settings = true;
      error.settings = null;
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      const settings = await api.getXpSettings($currentGuild.id);
      xpSettings = {
        xpPerMessage: settings.xpPerMessage || 3,
        messageXpCooldown: settings.messageXpCooldown || 60,
        voiceXpPerMinute: settings.voiceXpPerMinute || 2,
        voiceXpTimeout: settings.voiceXpTimeout || 60,
        xpMultiplier: settings.xpMultiplier || 1.0,
        xpCurveType: settings.xpCurveType || 0,
        customXpImageUrl: settings.customXpImageUrl || "",
        xpGainDisabled: settings.xpGainDisabled || false,
        serverExclusionState: settings.xpGainDisabled || false
      };
    } catch (err) {
      logger.error("Failed to fetch XP settings:", err);
      error.settings = err instanceof Error ? err.message : "Failed to fetch XP settings";
    } finally {
      loading.settings = false;
    }
  }

  async function fetchServerStats() {
    try {
      loading.stats = true;
      error.stats = null;
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      serverStats = await api.getXpServerStats($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch XP server stats:", err);
      error.stats = err instanceof Error ? err.message : "Failed to fetch XP server stats";
    } finally {
      loading.stats = false;
    }
  }

  async function fetchLeaderboard() {
    try {
      loading.leaderboard = true;
      error.leaderboard = null;
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      leaderboard = await api.getXpLeaderboard($currentGuild.id, leaderboardPage, leaderboardPageSize);
    } catch (err) {
      logger.error("Failed to fetch XP leaderboard:", err);
      error.leaderboard = err instanceof Error ? err.message : "Failed to fetch XP leaderboard";
    } finally {
      loading.leaderboard = false;
    }
  }

  async function fetchXpTemplate() {
    try {
      loading.template = true;
      error.template = null;
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      template = await api.getXpTemplate($currentGuild.id);

      localTemplate = JSON.parse(JSON.stringify(template));

      // Initialize barWidth if it doesn't exist
      if (localTemplate.templateBar && !localTemplate.templateBar.barWidth) {
        localTemplate.templateBar.barWidth = 4; // Default to 4px
      }

      localTemplate.customXpImageUrl = xpSettings.customXpImageUrl || "";

      // Update the UI variables
      if (xpSettings.customXpImageUrl) {
        imageUrl = xpSettings.customXpImageUrl;
        previewBackgroundUrl = imageUrl;
      }
    } catch (err) {
      logger.error("Failed to fetch XP template:", err);
      error.template = err instanceof Error ? err.message : "Failed to fetch XP template";
    } finally {
      loading.template = false;
    }
  }

  async function fetchRewards() {
    try {
      loading.rewards = true;
      error.rewards = null;
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      const [roles, currency] = await Promise.all([
        api.getXpRoleRewards($currentGuild.id),
        api.getXpCurrencyRewards($currentGuild.id)
      ]);

      roleRewards = roles;
      currencyRewards = currency;
    } catch (err) {
      logger.error("Failed to fetch XP rewards:", err);
      error.rewards = err instanceof Error ? err.message : "Failed to fetch XP rewards";
    } finally {
      loading.rewards = false;
    }
  }

  async function fetchExclusions() {
    try {
      loading.exclusions = true;
      error.exclusions = null;
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      const [channels, roles] = await Promise.all([
        api.getXpExcludedChannels($currentGuild.id),
        api.getXpExcludedRoles($currentGuild.id)
      ]);

      excludedChannels = channels;
      excludedRoles = roles;
    } catch (err) {
      logger.error("Failed to fetch XP exclusions:", err);
      error.exclusions = err instanceof Error ? err.message : "Failed to fetch XP exclusions";
    } finally {
      loading.exclusions = false;
    }
  }

  async function fetchChannelsAndRoles() {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      const [channels, roles] = await Promise.all([
        api.getGuildTextChannels($currentGuild.id),
        api.getGuildRoles($currentGuild.id)
      ]);

      guildChannels = channels;
      guildRoles = roles;
    } catch (err) {
      logger.error("Failed to fetch channels and roles:", err);
    }
  }

  async function updateXpSettings() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      xpSettings.guildId = $currentGuild.id;
      await api.updateXpSettings($currentGuild.id, xpSettings);
      showNotificationMessage("XP settings updated successfully", "success");
      changedSettings.clear();
      await fetchXpSettings();
    } catch (err) {
      logger.error("Failed to update XP settings:", err);
      showNotificationMessage("Failed to update XP settings", "error");
    }
  }

  async function updateXpTemplate() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      template = JSON.parse(JSON.stringify(localTemplate));

      const imageUrl = template.customXpImageUrl;

      delete template.customXpImageUrl;

      await api.updateXpTemplate($currentGuild.id, template);

      if (imageUrl) {
        await api.updateXpSettings($currentGuild.id, {
          guildId: $currentGuild.id,
          customXpImageUrl: imageUrl
        });
      }

      showNotificationMessage("XP template updated successfully", "success");
      changedSettings.delete("template");
    } catch (err) {
      logger.error("Failed to update XP template:", err);
      showNotificationMessage("Failed to update XP template", "error");
    }
  }

  async function addRoleReward() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!newRoleReward.roleId) throw new Error("Please select a role");
      if (newRoleReward.level < 1) throw new Error("Level must be at least 1");

      await api.addXpRoleReward($currentGuild.id, newRoleReward.level, BigInt(newRoleReward.roleId));

      showNotificationMessage("Role reward added successfully", "success");
      newRoleReward = { level: 1, roleId: "" };
      await fetchRewards();
    } catch (err) {
      logger.error("Failed to add role reward:", err);
      showNotificationMessage(err instanceof Error ? err.message : "Failed to add role reward", "error");
    }
  }

  async function removeRoleReward(rewardId: number) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      await api.removeXpRoleReward($currentGuild.id, rewardId);
      showNotificationMessage("Role reward removed successfully", "success");
      await fetchRewards();
    } catch (err) {
      logger.error("Failed to remove role reward:", err);
      showNotificationMessage("Failed to remove role reward", "error");
    }
  }

  async function addCurrencyReward() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (newCurrencyReward.amount <= 0) throw new Error("Amount must be greater than 0");
      if (newCurrencyReward.level < 1) throw new Error("Level must be at least 1");

      await api.addXpCurrencyReward($currentGuild.id, newCurrencyReward.level, newCurrencyReward.amount);
      showNotificationMessage("Currency reward added successfully", "success");
      newCurrencyReward = { level: 1, amount: 100 };
      await fetchRewards();
    } catch (err) {
      logger.error("Failed to add currency reward:", err);
      showNotificationMessage(err instanceof Error ? err.message : "Failed to add currency reward", "error");
    }
  }

  async function removeCurrencyReward(rewardId: number) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      await api.removeXpCurrencyReward($currentGuild.id, rewardId);
      showNotificationMessage("Currency reward removed successfully", "success");
      await fetchRewards();
    } catch (err) {
      logger.error("Failed to remove currency reward:", err);
      showNotificationMessage("Failed to remove currency reward", "error");
    }
  }

  async function excludeChannel() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!selectedChannelId) throw new Error("Please select a channel");

      await api.excludeXpChannel($currentGuild.id, BigInt(selectedChannelId));
      showNotificationMessage("Channel excluded successfully", "success");
      selectedChannelId = "";
      await fetchExclusions();
    } catch (err) {
      logger.error("Failed to exclude channel:", err);
      showNotificationMessage("Failed to exclude channel", "error");
    }
  }

  async function includeChannel(channelId: string) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      await api.includeXpChannel($currentGuild.id, BigInt(channelId));
      showNotificationMessage("Channel included successfully", "success");
      await fetchExclusions();
    } catch (err) {
      logger.error("Failed to include channel:", err);
      showNotificationMessage("Failed to include channel", "error");
    }
  }

  async function excludeRole() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!selectedRoleId) throw new Error("Please select a role");

      await api.excludeXpRole($currentGuild.id, BigInt(selectedRoleId));
      showNotificationMessage("Role excluded successfully", "success");
      selectedRoleId = "";
      await fetchExclusions();
    } catch (err) {
      logger.error("Failed to exclude role:", err);
      showNotificationMessage("Failed to exclude role", "error");
    }
  }

  async function includeRole(roleId: string) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      await api.includeXpRole($currentGuild.id, BigInt(roleId));
      showNotificationMessage("Role included successfully", "success");
      await fetchExclusions();
    } catch (err) {
      logger.error("Failed to include role:", err);
      showNotificationMessage("Failed to include role", "error");
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

  function getCurveTypeName(type: number): string {
    switch (type) {
      case 0:
        return "Default";
      case 1:
        return "Linear";
      case 2:
        return "Quadratic";
      case 3:
        return "Exponential";
      default:
        return "Unknown";
    }
  }

  // Save current state for undo functionality
  function saveStateForUndo() {
    undoStack.push(JSON.stringify(localTemplate));
    redoStack = []; // Clear redo stack when a new change is made
    // Keep undo stack limited to prevent memory issues
    if (undoStack.length > 20) {
      undoStack = undoStack.slice(-20);
    }
  }

  // Undo last change
  function undo() {
    if (undoStack.length > 0) {
      // Save current state for redo
      redoStack.push(JSON.stringify(localTemplate));

      // Pop the previous state from undo stack
      const previousState = undoStack.pop() as string;
      localTemplate = JSON.parse(previousState);
      markAsChanged("template");
    }
  }

  // Redo last undone change
  function redo() {
    if (redoStack.length > 0) {
      // Save current state for undo
      undoStack.push(JSON.stringify(localTemplate));

      // Pop the next state from redo stack
      const nextState = redoStack.pop() as string;
      localTemplate = JSON.parse(nextState);
      markAsChanged("template");
    }
  }

  // Handle changes to the template
  function handleChange(path: string, value: any) {
    if (!changedSettings.has("template")) {
      // Only save state for undo if this is a new change sequence
      saveStateForUndo();
    }

    markAsChanged("template");

    // Handle nested paths like 'templateUser.textColor'
    const pathParts = path.split(".");
    let current = localTemplate;

    // Navigate to the nested property
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }

    // Set the value
    current[pathParts[pathParts.length - 1]] = value;

    // Force Svelte to detect the change
    localTemplate = { ...localTemplate };
  }

  // Apply snap to grid
  function applySnapToGrid(x: number, y: number) {
    if (!snapToGrid) return { x, y };

    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }

  // Format color to include # prefix for display
  function formatColor(colorString: string) {
    if (colorString && !colorString.startsWith("#")) {
      return `#${colorString}`;
    }
    return colorString;
  }

  // Parse color to remove # prefix for storage
  function parseColor(colorString: string) {
    if (colorString && colorString.startsWith("#")) {
      return colorString.substring(1);
    }
    return colorString;
  }

  // Reset changes
  function resetChanges() {
    // Save current state for undo
    saveStateForUndo();
    localTemplate = JSON.parse(JSON.stringify(template));
    changedSettings.delete("template");
  }

  // Toggle design mode
  function toggleDesignMode() {
    isDesignMode = !isDesignMode;
    // Reset guide lines and other design mode specific states
    guideLinesPos = { x: null, y: null };
    snapLines = [];
  }

  // Load image and update template size
  async function loadImage() {
    if (!imageUrl) return;

    imageLoading = true;
    imageError = "";

    try {
      const img = document.createElement("img");

      // Create a promise that resolves when the image loads
      const imageLoaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));

        // Set a timeout in case the image takes too long
        setTimeout(() => reject(new Error("Image load timeout")), 10000);
      });

      // Start loading
      img.src = imageUrl;

      // Wait for load
      await imageLoaded;

      if (updateSizeFromImage) {
        // Update template dimensions
        handleChange("outputSizeX", img.width);
        handleChange("outputSizeY", img.height);

        // Update preview scale
        updatePreviewScale();
      }

      // Update background image in preview
      previewBackgroundUrl = imageUrl;
      handleChange("customXpImageUrl", imageUrl);

    } catch (error) {
      console.error("Error loading image:", error);
      imageError = "Failed to load image. Please check the URL.";
    } finally {
      imageLoading = false;
    }
  }

  function calculateProgressPosition() {
    if (!localTemplate || !localTemplate.templateBar) return { x: 0, y: 0 };

    const startX = localTemplate.templateBar.barPointAx;
    const startY = localTemplate.templateBar.barPointAy;
    const endX = localTemplate.templateBar.barPointBx;
    const endY = localTemplate.templateBar.barPointBy;

    // Calculate the point at the percentage position (using real or sample data)
    const progressValue = (showRealDataPreview && currentUserData) ?
      currentUserData.progress : sampleData.progress;
    const progress = progressValue / 100;

    const x = startX + (endX - startX) * progress;
    const y = startY + (endY - startY) * progress;

    return { x, y };
  }

  // Calculate potential snap lines based on element positions
  function calculateSnapLines(currentElement: any, x: number, y: number) {
    const snapDistance = 5; // Distance in pixels to trigger snapping
    let snapX = null;
    let snapY = null;

    // Center lines of the canvas
    const canvasCenterX = localTemplate.outputSizeX / 2;
    const canvasCenterY = localTemplate.outputSizeY / 2;

    // Check for center alignment with canvas
    if (Math.abs(x - canvasCenterX) < snapDistance) {
      snapX = canvasCenterX;
    }

    if (Math.abs(y - canvasCenterY) < snapDistance) {
      snapY = canvasCenterY;
    }

    // Edges of the canvas
    if (Math.abs(x) < snapDistance) snapX = 0;
    if (Math.abs(y) < snapDistance) snapY = 0;
    if (Math.abs(x - localTemplate.outputSizeX) < snapDistance) snapX = localTemplate.outputSizeX;
    if (Math.abs(y - localTemplate.outputSizeY) < snapDistance) snapY = localTemplate.outputSizeY;

    // Check for alignment with other elements
    draggableElements.forEach(element => {
      if (element !== currentElement && element.isVisible()) {
        const elementX = element.getX();
        const elementY = element.getY();

        // Center alignment with other elements
        if (Math.abs(x - elementX) < snapDistance) {
          snapX = elementX;
        }

        if (Math.abs(y - elementY) < snapDistance) {
          snapY = elementY;
        }

        // Edge alignment with other elements
        const elementWidth = element.getWidth();
        const elementHeight = element.getHeight();

        const rightEdge = elementX + elementWidth;
        const bottomEdge = elementY + elementHeight;

        if (Math.abs(x - rightEdge) < snapDistance) {
          snapX = rightEdge;
        }

        if (Math.abs(y - bottomEdge) < snapDistance) {
          snapY = bottomEdge;
        }
      }
    });

    return { snapX, snapY };
  }

  // Start dragging an element
  function startDrag(event, element) {
    if (!isDesignMode) return;

    // Prevent default to avoid triggering other events
    event.preventDefault();
    event.stopPropagation();

    draggingElement = element;
    isDragging = true;

    // Get initial pointer position
    const clientX = event.type.includes("mouse")
      ? (event as MouseEvent).clientX
      : (event as TouchEvent).touches && (event as TouchEvent).touches[0]
        ? (event as TouchEvent).touches[0].clientX : 0;

    const clientY = event.type.includes("mouse")
      ? (event as MouseEvent).clientY
      : (event as TouchEvent).touches && (event as TouchEvent).touches[0]
        ? (event as TouchEvent).touches[0].clientY : 0;

    dragStartPos = {
      x: clientX,
      y: clientY
    };

    // Get initial element position
    dragStartElementPos = {
      x: element.getX(),
      y: element.getY()
    };

    // Show coordinate overlay during drag
    showCoordinateOverlay = true;

    document.body.classList.add("dragging-active");

    // Add event listeners for drag movement and end
    window.addEventListener("mousemove", handleDragMove, { passive: false });
    window.addEventListener("touchmove", handleDragMove, { passive: false });
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchend", endDrag);

    // Only update UI once to show initial drag state
    localTemplate = { ...localTemplate };
  }


  // Handle drag movement
  function handleDragMove(event) {
    if (!draggingElement) return;

    // Prevent default behaviors
    event.preventDefault();
    event.stopPropagation();

    // Throttle event handling
    const now = Date.now();
    if (now - lastDragUpdate < THROTTLE_MS) return;
    lastDragUpdate = now;

    // Cancel any existing animation frame to prevent queuing
    if (dragAnimationFrameId) {
      cancelAnimationFrame(dragAnimationFrameId);
    }

    dragAnimationFrameId = requestAnimationFrame(() => {
      // Get current pointer position
      const clientX = event.type.includes("mouse")
        ? (event as MouseEvent).clientX
        : (event as TouchEvent).touches && (event as TouchEvent).touches[0]
          ? (event as TouchEvent).touches[0].clientX : 0;

      const clientY = event.type.includes("mouse")
        ? (event as MouseEvent).clientY
        : (event as TouchEvent).touches && (event as TouchEvent).touches[0]
          ? (event as TouchEvent).touches[0].clientY : 0;

      // Calculate the difference in position, accounting for preview scale
      const deltaX = (clientX - dragStartPos.x) / previewScale;
      const deltaY = (clientY - dragStartPos.y) / previewScale;

      // Calculate new element position
      let newX = dragStartElementPos.x + deltaX;
      let newY = dragStartElementPos.y + deltaY;

      // Apply snapping if enabled
      if (snapToGrid) {
        const snapped = applySnapToGrid(newX, newY);
        newX = snapped.x;
        newY = snapped.y;
      } else if (showSnapping) {
        const snapResult = calculateSimplifiedSnapLines(draggingElement, newX, newY);

        if (snapResult.snapX !== null) {
          newX = snapResult.snapX;
          guideLinesPos.x = snapResult.snapX;
        } else {
          guideLinesPos.x = null;
        }

        if (snapResult.snapY !== null) {
          newY = snapResult.snapY;
          guideLinesPos.y = snapResult.snapY;
        } else {
          guideLinesPos.y = null;
        }

        // Show guidelines during snapping
        showGuideLines = (guideLinesPos.x !== null || guideLinesPos.y !== null);
      }

      // Update element position
      draggingElement.setPos(newX, newY);

      // Only update the UI elements we actually need for visual feedback during drag
      if (localTemplate && draggingElement) {
        // Force Svelte to update just what we need
        localTemplate = { ...localTemplate };
      }
    });
  }

  // End dragging
  function endDrag() {
    // Cancel any pending animation frame
    if (dragAnimationFrameId) {
      cancelAnimationFrame(dragAnimationFrameId);
      dragAnimationFrameId = null;
    }

    document.body.classList.remove("dragging-active");

    draggingElement = null;
    isDragging = false;
    showCoordinateOverlay = false;
    showGuideLines = false;

    // Remove event listeners
    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("touchmove", handleDragMove);
    window.removeEventListener("mouseup", endDrag);
    window.removeEventListener("touchend", endDrag);

    // One final update to ensure the UI is in sync
    localTemplate = { ...localTemplate };
  }

  function calculateSimplifiedSnapLines(currentElement, x, y) {
    const snapDistance = 5; // Distance in pixels to trigger snapping
    let snapX = null;
    let snapY = null;

    // Center of the canvas
    const canvasCenterX = localTemplate.outputSizeX / 2;
    const canvasCenterY = localTemplate.outputSizeY / 2;

    // Quick checks for basic alignment points

    // Canvas center
    if (Math.abs(x - canvasCenterX) < snapDistance) snapX = canvasCenterX;
    if (Math.abs(y - canvasCenterY) < snapDistance) snapY = canvasCenterY;

    // Canvas edges
    if (Math.abs(x) < snapDistance) snapX = 0;
    if (Math.abs(y) < snapDistance) snapY = 0;
    if (Math.abs(x - localTemplate.outputSizeX) < snapDistance) snapX = localTemplate.outputSizeX;
    if (Math.abs(y - localTemplate.outputSizeY) < snapDistance) snapY = localTemplate.outputSizeY;

    // Only check other elements if we haven't found a snap yet
    if (snapX === null || snapY === null) {
      // Check only visible elements that aren't the current one
      const visibleElements = draggableElements.filter(element =>
        element !== currentElement && element.isVisible()
      );

      const limitedElements = visibleElements.slice(0, 5);

      for (const element of limitedElements) {
        const elementX = element.getX();
        const elementY = element.getY();

        // Only check for X alignment if we haven't found one yet
        if (snapX === null && Math.abs(x - elementX) < snapDistance) {
          snapX = elementX;
        }

        // Only check for Y alignment if we haven't found one yet
        if (snapY === null && Math.abs(y - elementY) < snapDistance) {
          snapY = elementY;
        }

        // If we've found both alignments, we can stop
        if (snapX !== null && snapY !== null) break;
      }
    }

    return { snapX, snapY };
  }

  // Toggle grid visibility
  function toggleGrid() {
    showGrid = !showGrid;
  }

  // Toggle snap to grid
  function toggleSnapToGrid() {
    snapToGrid = !snapToGrid;
  }

  // Toggle real data preview
  async function toggleRealDataPreview() {
    if (!currentUserData && !showRealDataPreview) {
      await fetchCurrentUserData();
    }

    showRealDataPreview = !showRealDataPreview;
  }

  // Toggle snapping to elements
  function toggleSnapping() {
    showSnapping = !showSnapping;
  }

  // Zoom in preview
  function zoomIn() {
    previewScale = Math.min(previewScale * 1.2, 3);
    updatePreviewDimensions();
  }

  // Zoom out preview
  function zoomOut() {
    previewScale = Math.max(previewScale / 1.2, 0.2);
    updatePreviewDimensions();
  }

  // Reset zoom preview
  function resetZoom() {
    previewScale = 1;
    updatePreviewDimensions();
  }

  // Update preview dimensions
  function updatePreviewDimensions() {
    if (!previewContainerRef || !localTemplate) return;

    previewWidth = localTemplate.outputSizeX * previewScale;
    previewHeight = localTemplate.outputSizeY * previewScale;

    // Center the preview
    previewOffset = {
      x: (previewContainerRef.clientWidth - previewWidth) / 2,
      y: (previewContainerRef.clientHeight - previewHeight) / 2
    };
  }

  // Calculate preview scale based on container size
  function updatePreviewScale() {
    if (!previewContainerRef || !localTemplate) return;

    const containerWidth = previewContainerRef.clientWidth;
    const containerHeight = previewContainerRef.clientHeight;
    const templateWidth = localTemplate.outputSizeX;
    const templateHeight = localTemplate.outputSizeY;

    // Calculate scale to fit template within container
    const widthScale = (containerWidth - 40) / templateWidth;
    const heightScale = (containerHeight - 40) / templateHeight;
    previewScale = Math.min(widthScale, heightScale, 1);

    updatePreviewDimensions();
  }

  // Toggle editor view on mobile
  function toggleEditorMobileView() {
    editorMobileView = editorMobileView === "preview" ? "controls" : "preview";
  }

  // After mounting
  function handleInputFocus(event: FocusEvent) {
    const target = event.target as HTMLInputElement;
    target.select();
  }

  onMount(() => {
    if (!$currentGuild) goto("/dashboard");
    Promise.all([
      fetchXpSettings(),
      fetchServerStats(),
      fetchLeaderboard(),
      fetchXpTemplate(),
      fetchRewards(),
      fetchExclusions(),
      fetchChannelsAndRoles(),
      fetchBotStatus()
    ]);
    checkMobile();

    if (browser) {
      window.addEventListener("resize", checkMobile);
      window.addEventListener("resize", updatePreviewScale);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("resize", updatePreviewScale);
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchend", endDrag);
    }
  });

  // Color handling
  $: colorVars = `
    --color-primary: ${$colorStore.primary};
    --color-secondary: ${$colorStore.secondary};
    --color-accent: ${$colorStore.accent};
    --color-text: ${$colorStore.text};
    --color-muted: ${$colorStore.muted};
    --color-primary-rgb: ${hexToRgb($colorStore.primary)};
    --color-secondary-rgb: ${hexToRgb($colorStore.secondary)};
    --color-accent-rgb: ${hexToRgb($colorStore.accent)};
  `;

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
    fetchXpSettings();
    fetchServerStats();
    fetchLeaderboard();
    fetchXpTemplate();
    fetchRewards();
    fetchExclusions();
    fetchChannelsAndRoles();
  }

  // Reactive declarations for instance changes
  $: if ($currentInstance) {
    fetchXpSettings();
    fetchServerStats();
    fetchLeaderboard();
    fetchXpTemplate();
    fetchRewards();
    fetchExclusions();
    fetchChannelsAndRoles();
  }

  // Update preview on template change
  $: if (localTemplate && previewContainerRef) {
    setTimeout(() => updatePreviewScale(), 0);
  }

  $: if (activeTab === "template" && !currentUserData) {
    fetchCurrentUserData();
  }
</script>

<svelte:head>
  <title>XP Management - Dashboard</title>
</svelte:head>

<div
  class="min-h-screen p-4 md:p-6"
  style="{colorVars} background: radial-gradient(circle at top,
    {$colorStore.gradientStart}15 0%,
    {$colorStore.gradientMid}10 50%,
    {$colorStore.gradientEnd}05 100%);"
>
  <div class="max-w-7xl mx-auto space-y-8">
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}

    <!-- Header -->
    <div
      class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <h1 class="text-3xl font-bold" style="color: {$colorStore.text}">XP Management</h1>
      <p class="mt-2" style="color: {$colorStore.muted}">Configure XP settings, rewards, and manage users'
        experience</p>
    </div>

    <!-- Tabs Navigation -->
    <div
      aria-label="XP Management Options"
      class="backdrop-blur-sm rounded-2xl border overflow-hidden p-2 md:p-4 shadow-2xl"
      role="tablist"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
       border-color: {$colorStore.primary}30;"
    >
      <!-- Desktop horizontal tabs -->
      <div class="hidden md:flex space-x-4 overflow-x-auto">
        <button
          aria-controls="settings-panel"
          aria-selected={activeTab === 'settings'}
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-base {activeTab === 'settings' ? 'font-medium' : 'opacity-70'}"
          id="settings-tab"
          on:click={() => activeTab = 'settings'}
          role="tab"
          style="background: {activeTab === 'settings' ? $colorStore.primary + '20' : 'transparent'};
             color: {$colorStore.text};"
        >
          <Settings aria-hidden="true" class="w-5 h-5" style="color: {$colorStore.primary}" />
          <span>Settings</span>
        </button>

        <button
          aria-controls="stats-panel"
          aria-selected={activeTab === 'stats'}
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-base {activeTab === 'stats' ? 'font-medium' : 'opacity-70'}"
          id="stats-tab"
          on:click={() => activeTab = 'stats'}
          role="tab"
          style="background: {activeTab === 'stats' ? $colorStore.primary + '20' : 'transparent'};
             color: {$colorStore.text};"
        >
          <BarChart2 aria-hidden="true" class="w-5 h-5" style="color: {$colorStore.secondary}" />
          <span>Stats</span>
        </button>

        <button
          aria-controls="leaderboard-panel"
          aria-selected={activeTab === 'leaderboard'}
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-base {activeTab === 'leaderboard' ? 'font-medium' : 'opacity-70'}"
          id="leaderboard-tab"
          on:click={() => activeTab = 'leaderboard'}
          role="tab"
          style="background: {activeTab === 'leaderboard' ? $colorStore.primary + '20' : 'transparent'};
             color: {$colorStore.text};"
        >
          <Award aria-hidden="true" class="w-5 h-5" style="color: {$colorStore.accent}" />
          <span>Leaderboard</span>
        </button>

        <button
          aria-controls="rewards-panel"
          aria-selected={activeTab === 'rewards'}
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-base {activeTab === 'rewards' ? 'font-medium' : 'opacity-70'}"
          id="rewards-tab"
          on:click={() => activeTab = 'rewards'}
          role="tab"
          style="background: {activeTab === 'rewards' ? $colorStore.primary + '20' : 'transparent'};
             color: {$colorStore.text};"
        >
          <Star aria-hidden="true" class="w-5 h-5" style="color: {$colorStore.primary}" />
          <span>Rewards</span>
        </button>

        <button
          aria-controls="template-panel"
          aria-selected={activeTab === 'template'}
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-base {activeTab === 'template' ? 'font-medium' : 'opacity-70'}"
          id="template-tab"
          on:click={() => activateTab('template')}
          on:click={() => activeTab = 'template'}
          role="tab"
          style="background: {activeTab === 'template' ? $colorStore.primary + '20' : 'transparent'};
             color: {$colorStore.text};"
        >
          <Image aria-hidden="true" class="w-5 h-5" style="color: {$colorStore.secondary}" />
          <span>Card Template</span>
        </button>

        <button
          aria-controls="exclusions-panel"
          aria-selected={activeTab === 'exclusions'}
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-base {activeTab === 'exclusions' ? 'font-medium' : 'opacity-70'}"
          id="exclusions-tab"
          on:click={() => activeTab = 'exclusions'}
          role="tab"
          style="background: {activeTab === 'exclusions' ? $colorStore.primary + '20' : 'transparent'};
             color: {$colorStore.text};"
        >
          <Database aria-hidden="true" class="w-5 h-5" style="color: {$colorStore.accent}" />
          <span>Exclusions</span>
        </button>
      </div>

      <!-- Mobile grid layout tabs -->
      <div class="grid grid-cols-3 gap-2 md:hidden">
        <button
          aria-controls="settings-panel"
          aria-selected={activeTab === 'settings'}
          class="flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 {activeTab === 'settings' ? 'font-medium' : 'opacity-80'}"
          id="settings-tab-mobile"
          on:click={() => activeTab = 'settings'}
          role="tab"
          style="background: {activeTab === 'settings' ? $colorStore.primary + '20' : $colorStore.primary + '10'};
             color: {$colorStore.text};"
        >
          <Settings aria-hidden="true" class="w-6 h-6 mb-1" style="color: {$colorStore.primary}" />
          <span class="text-xs">Settings</span>
        </button>

        <button
          aria-controls="stats-panel"
          aria-selected={activeTab === 'stats'}
          class="flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 {activeTab === 'stats' ? 'font-medium' : 'opacity-80'}"
          id="stats-tab-mobile"
          on:click={() => activeTab = 'stats'}
          role="tab"
          style="background: {activeTab === 'stats' ? $colorStore.primary + '20' : $colorStore.primary + '10'};
             color: {$colorStore.text};"
        >
          <BarChart2 aria-hidden="true" class="w-6 h-6 mb-1" style="color: {$colorStore.secondary}" />
          <span class="text-xs">Stats</span>
        </button>

        <button
          aria-controls="leaderboard-panel"
          aria-selected={activeTab === 'leaderboard'}
          class="flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 {activeTab === 'leaderboard' ? 'font-medium' : 'opacity-80'}"
          id="leaderboard-tab-mobile"
          on:click={() => activeTab = 'leaderboard'}
          role="tab"
          style="background: {activeTab === 'leaderboard' ? $colorStore.primary + '20' : $colorStore.primary + '10'};
             color: {$colorStore.text};"
        >
          <Award aria-hidden="true" class="w-6 h-6 mb-1" style="color: {$colorStore.accent}" />
          <span class="text-xs">Ranks</span>
        </button>

        <button
          aria-controls="rewards-panel"
          aria-selected={activeTab === 'rewards'}
          class="flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 {activeTab === 'rewards' ? 'font-medium' : 'opacity-80'}"
          id="rewards-tab-mobile"
          on:click={() => activeTab = 'rewards'}
          role="tab"
          style="background: {activeTab === 'rewards' ? $colorStore.primary + '20' : $colorStore.primary + '10'};
             color: {$colorStore.text};"
        >
          <Star aria-hidden="true" class="w-6 h-6 mb-1" style="color: {$colorStore.primary}" />
          <span class="text-xs">Rewards</span>
        </button>

        <button
          aria-controls="template-panel"
          aria-selected={activeTab === 'template'}
          class="flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 {activeTab === 'template' ? 'font-medium' : 'opacity-80'}"
          id="template-tab-mobile"
          on:click={() => activateTab('template')}
          on:click={() => activeTab = 'template'}
          role="tab"
          style="background: {activeTab === 'template' ? $colorStore.primary + '20' : $colorStore.primary + '10'};
             color: {$colorStore.text};"
        >
          <Image aria-hidden="true" class="w-6 h-6 mb-1" style="color: {$colorStore.secondary}" />
          <span class="text-xs">Card</span>
        </button>

        <button
          aria-controls="exclusions-panel"
          aria-selected={activeTab === 'exclusions'}
          class="flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 {activeTab === 'exclusions' ? 'font-medium' : 'opacity-80'}"
          id="exclusions-tab-mobile"
          on:click={() => activeTab = 'exclusions'}
          role="tab"
          style="background: {activeTab === 'exclusions' ? $colorStore.primary + '20' : $colorStore.primary + '10'};
             color: {$colorStore.text};"
        >
          <Database aria-hidden="true" class="w-6 h-6 mb-1" style="color: {$colorStore.accent}" />
          <span class="text-xs">Exclude</span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div
      class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <!-- Settings Panel -->
      <div
        aria-labelledby="settings-tab"
        class:hidden={activeTab !== 'settings'}
        id="settings-panel"
        role="tabpanel"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   color: {$colorStore.primary};"
          >
            <Settings aria-hidden="true" class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">XP Settings</h2>
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
            <!-- XP Per Message -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.primary}10;"
            >
              <div class="flex items-center gap-2 mb-3">
                <Settings class="w-5 h-5" style="color: {$colorStore.primary}" aria-hidden="true" />
                <h3 class="font-semibold" style="color: {$colorStore.text}">XP Per Message</h3>
              </div>
              <input
                id="xp-per-message"
                bind:value={xpSettings.xpPerMessage}
                class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                on:input={() => markAsChanged("xpSettings")}
                style="border-color: {$colorStore.primary}30;
                       color: {$colorStore.text};
                       focus-visible:outline: none;
                       focus-visible:ring: 2px;
                       focus-visible:ring-color: {$colorStore.primary}50;"
                type="number"
                min="0"
                max="50"
                aria-label="XP per message"
              />
              <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
                Amount of XP users earn per message (max 50).
              </p>
            </div>

            <!-- Message XP Cooldown -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.primary}10;"
            >
              <div class="flex items-center gap-2 mb-3">
                <Settings class="w-5 h-5" style="color: {$colorStore.secondary}" aria-hidden="true" />
                <h3 class="font-semibold" style="color: {$colorStore.text}">Message XP Cooldown</h3>
              </div>
              <input
                id="message-xp-cooldown"
                bind:value={xpSettings.messageXpCooldown}
                class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                on:input={() => markAsChanged("xpSettings")}
                style="border-color: {$colorStore.secondary}30;
                       color: {$colorStore.text};
                       focus-visible:outline: none;
                       focus-visible:ring: 2px;
                       focus-visible:ring-color: {$colorStore.secondary}50;"
                type="number"
                min="0"
                aria-label="Message XP cooldown in seconds"
              />
              <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
                Cooldown in seconds between messages that can earn XP.
              </p>
            </div>

            <!-- Voice XP Per Minute -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.primary}10;"
            >
              <div class="flex items-center gap-2 mb-3">
                <Settings class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
                <h3 class="font-semibold" style="color: {$colorStore.text}">Voice XP Per Minute</h3>
              </div>
              <input
                id="voice-xp-per-minute"
                bind:value={xpSettings.voiceXpPerMinute}
                class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                on:input={() => markAsChanged("xpSettings")}
                style="border-color: {$colorStore.accent}30;
                       color: {$colorStore.text};
                       focus-visible:outline: none;
                       focus-visible:ring: 2px;
                       focus-visible:ring-color: {$colorStore.accent}50;"
                type="number"
                min="0"
                max="10"
                aria-label="Voice XP per minute"
              />
              <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
                Amount of XP users earn per minute in voice channels (max 10).
              </p>
            </div>

            <!-- Voice XP Timeout -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.primary}10;"
            >
              <div class="flex items-center gap-2 mb-3">
                <Settings class="w-5 h-5" style="color: {$colorStore.primary}" aria-hidden="true" />
                <h3 class="font-semibold" style="color: {$colorStore.text}">Voice XP Timeout</h3>
              </div>
              <input
                id="voice-xp-timeout"
                bind:value={xpSettings.voiceXpTimeout}
                class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                on:input={() => markAsChanged("xpSettings")}
                style="border-color: {$colorStore.primary}30;
                       color: {$colorStore.text};
                       focus-visible:outline: none;
                       focus-visible:ring: 2px;
                       focus-visible:ring-color: {$colorStore.primary}50;"
                type="number"
                min="0"
                aria-label="Voice XP timeout in minutes"
              />
              <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
                Time in minutes before a voice session expires if user is inactive.
              </p>
            </div>

            <!-- XP Multiplier -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.primary}10;"
            >
              <div class="flex items-center gap-2 mb-3">
                <Settings class="w-5 h-5" style="color: {$colorStore.secondary}" aria-hidden="true" />
                <h3 class="font-semibold" style="color: {$colorStore.text}">Global XP Multiplier</h3>
              </div>
              <input
                id="xp-multiplier"
                bind:value={xpSettings.xpMultiplier}
                class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                on:input={() => markAsChanged("xpSettings")}
                style="border-color: {$colorStore.secondary}30;
                       color: {$colorStore.text};
                       focus-visible:outline: none;
                       focus-visible:ring: 2px;
                       focus-visible:ring-color: {$colorStore.secondary}50;"
                type="number"
                min="0.1"
                step="0.1"
                aria-label="Global XP multiplier"
              />
              <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
                Global multiplier applied to all XP gains.
              </p>
            </div>

            <!-- XP Curve Type -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.primary}10;"
            >
              <div class="flex items-center gap-2 mb-3">
                <Settings class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
                <h3 class="font-semibold" style="color: {$colorStore.text}">XP Curve Type</h3>
              </div>
              <select
                id="xp-curve-type"
                bind:value={xpSettings.xpCurveType}
                class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                on:change={() => markAsChanged("xpSettings")}
                style="border-color: {$colorStore.accent}30;
                       color: {$colorStore.text};
                       focus-visible:outline: none;
                       focus-visible:ring: 2px;
                       focus-visible:ring-color: {$colorStore.accent}50;"
                aria-label="XP curve type"
              >
                <option value={0}>Default</option>
                <option value={1}>Linear</option>
                <option value={2}>Quadratic</option>
                <option value={3}>Exponential</option>
                <option value={5}>Legacy</option>
              </select>
              <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
                Determines how much XP is required for each level.
              </p>
            </div>

            <!-- Custom XP Image URL -->
            <div
              class="col-span-1 md:col-span-2 rounded-xl p-4"
              style="background: {$colorStore.primary}10;"
            >
              <div class="flex items-center gap-2 mb-3">
                <Settings class="w-5 h-5" style="color: {$colorStore.primary}" aria-hidden="true" />
                <h3 class="font-semibold" style="color: {$colorStore.text}">Custom XP Card Background</h3>
              </div>
              <input
                id="custom-xp-image-url"
                bind:value={xpSettings.customXpImageUrl}
                class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                on:input={() => markAsChanged("xpSettings")}
                style="border-color: {$colorStore.primary}30;
                       color: {$colorStore.text};
                       focus-visible:outline: none;
                       focus-visible:ring: 2px;
                       focus-visible:ring-color: {$colorStore.primary}50;"
                type="url"
                placeholder="https://example.com/image.png"
                aria-label="Custom XP card background URL"
              />
              <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
                URL to a custom background image for XP cards. Recommended size: 797x279 pixels.
              </p>
            </div>

            <!-- Server Exclusion -->
            <div
              class="col-span-1 md:col-span-2 rounded-xl p-4"
              style="background: {$colorStore.primary}10;"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Settings class="w-5 h-5" style="color: {$colorStore.secondary}" aria-hidden="true" />
                  <h3 class="font-semibold" style="color: {$colorStore.text}">Server XP Exclusion</h3>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    bind:checked={xpSettings.serverExclusionState}
                    class="sr-only peer"
                    on:change={() => markAsChanged("xpSettings")}
                    aria-label="Enable or disable XP gain for the entire server"
                    id="server-exclusion"
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
                When enabled, XP gain is disabled server-wide.
              </p>
            </div>

            <!-- Save Button -->
            <div class="col-span-1 md:col-span-2 flex justify-end mt-4">
              <button
                class="px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                disabled={!changedSettings.has("xpSettings")}
                on:click={updateXpSettings}
                style="background: linear-gradient(to right, {$colorStore.primary}, {$colorStore.secondary});
                       color: {$colorStore.text};"
                aria-label="Save XP settings"
              >
                Save Settings
              </button>
            </div>
          </div>
        {/if}
      </div>

      <!-- Stats Panel -->
      <div
        aria-labelledby="stats-tab"
        class:hidden={activeTab !== 'stats'}
        id="stats-panel"
        role="tabpanel"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   color: {$colorStore.primary};"
          >
            <BarChart2 aria-hidden="true" class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">XP Statistics</h2>
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
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Total Users Stat -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.primary}10;"
            >
              <div class="flex flex-col">
                <span class="text-sm" style="color: {$colorStore.muted}">Total Users</span>
                <span class="text-3xl font-bold"
                      style="color: {$colorStore.text}">{formatNumber(serverStats.totalUsers)}</span>
              </div>
            </div>

            <!-- Total XP Stat -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.secondary}10;"
            >
              <div class="flex flex-col">
                <span class="text-sm" style="color: {$colorStore.muted}">Total XP</span>
                <span class="text-3xl font-bold"
                      style="color: {$colorStore.text}">{formatNumber(serverStats.totalXp)}</span>
              </div>
            </div>

            <!-- Average Level Stat -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.accent}10;"
            >
              <div class="flex flex-col">
                <span class="text-sm" style="color: {$colorStore.muted}">Average Level</span>
                <span class="text-3xl font-bold" style="color: {$colorStore.text}">{serverStats.averageLevel}</span>
              </div>
            </div>

            <!-- Highest Level Stat -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.primary}10;"
            >
              <div class="flex flex-col">
                <span class="text-sm" style="color: {$colorStore.muted}">Highest Level</span>
                <span class="text-3xl font-bold" style="color: {$colorStore.text}">{serverStats.highestLevel}</span>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div
            class="rounded-xl p-4"
            style="background: {$colorStore.primary}15;"
          >
            <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">Recent XP Activity</h3>

            {#if serverStats.recentActivity && serverStats.recentActivity.length > 0}
              <ul class="space-y-3">
                {#each serverStats.recentActivity as activity}
                  <li class="flex items-center gap-3 p-3 rounded-lg" style="background: {$colorStore.primary}10;">
                    <img
                      src={activity.avatarUrl}
                      alt=""
                      class="w-10 h-10 rounded-full border-2"
                      style="border-color: {$colorStore.primary}30;"
                    />
                    <div class="flex-grow">
                      <div class="flex justify-between items-center">
                        <span class="font-medium" style="color: {$colorStore.text}">{activity.username}</span>
                        <span class="text-sm" style="color: {$colorStore.muted}">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div class="text-sm" style="color: {$colorStore.secondary}">
                        Recent activity
                      </div>
                    </div>
                  </li>
                {/each}
              </ul>
            {:else}
              <div class="text-center py-6" style="color: {$colorStore.muted}">
                No recent XP activity
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Leaderboard Panel -->
      <div
        aria-labelledby="leaderboard-tab"
        class:hidden={activeTab !== 'leaderboard'}
        id="leaderboard-panel"
        role="tabpanel"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   color: {$colorStore.primary};"
          >
            <Award aria-hidden="true" class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">XP Leaderboard</h2>
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
              <p style="color: {$colorStore.muted}">No XP data available</p>
            </div>
          {:else}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              {#each leaderboard as user, i}
                <div
                  class="rounded-xl p-4 border transition-all duration-200"
                  style="background: {$colorStore.primary}10;
                         border-color: {$colorStore.primary}20;
                         hover:border-color: {$colorStore.primary}30;"
                >
                  <div class="flex items-center gap-4">
                    <div
                      class="w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold"
                      style="background: {i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : $colorStore.primary}20;
                             color: {i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : $colorStore.primary};"
                      aria-label={`Rank ${user.rank}`}
                    >
                      #{user.rank}
                    </div>
                    <img
                      src={user.avatarUrl}
                      alt=""
                      class="w-12 h-12 rounded-full border-2"
                      style="border-color: {$colorStore.primary}30;"
                    />
                    <div class="flex-grow min-w-0">
                      <p class="font-medium truncate" style="color: {$colorStore.text}">{user.username}</p>
                      <div class="flex items-center text-sm" style="color: {$colorStore.muted}">
                        <span class="font-medium" style="color: {$colorStore.secondary}">Level {user.level}</span>
                        <span class="mx-1">•</span>
                        <span>{formatNumber(user.totalXp)} XP</span>
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
      </div>

      <!-- Rewards Panel -->
      <div
        aria-labelledby="rewards-tab"
        class:hidden={activeTab !== 'rewards'}
        id="rewards-panel"
        role="tabpanel"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   color: {$colorStore.primary};"
          >
            <Star aria-hidden="true" class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">XP Rewards</h2>
        </div>

        {#if loading.rewards}
          <div class="flex justify-center items-center min-h-[200px]">
            <div
              class="w-12 h-12 border-4 rounded-full animate-spin"
              style="border-color: {$colorStore.primary}20;
                     border-top-color: {$colorStore.primary};"
              aria-label="Loading"
            >
            </div>
          </div>
        {:else if error.rewards}
          <div
            class="rounded-xl p-4 flex items-center gap-3"
            style="background: {$colorStore.accent}10;"
            role="alert"
          >
            <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
            <p style="color: {$colorStore.accent}">{error.rewards}</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Role Rewards -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.primary}10;"
            >
              <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">Role Rewards</h3>

              <!-- Add Role Reward Form -->
              <div class="mb-6 p-4 rounded-lg" style="background: {$colorStore.primary}15;">
                <h4 class="text-sm font-medium mb-3" style="color: {$colorStore.muted}">Add Role Reward</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label class="block text-xs mb-1" for="role-reward-level"
                           style="color: {$colorStore.muted}">Level</label>
                    <input
                      id="role-reward-level"
                      bind:value={newRoleReward.level}
                      class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                      style="border-color: {$colorStore.primary}30;
                             color: {$colorStore.text};"
                      type="number"
                      min="1"
                      aria-label="Level required for role reward"
                    />
                  </div>
                  <div>
                    <label class="block text-xs mb-1" for="role-reward-role"
                           style="color: {$colorStore.muted}">Role</label>
                    <select
                      id="role-reward-role"
                      bind:value={newRoleReward.roleId}
                      class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                      style="border-color: {$colorStore.primary}30;
                             color: {$colorStore.text};"
                      aria-label="Role to award"
                    >
                      <option value="">Select Role</option>
                      {#each guildRoles as role}
                        <option value={role.id}>{role.name}</option>
                      {/each}
                    </select>
                  </div>
                </div>
                <button
                  class="w-full px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  style="background: {$colorStore.primary}20;
                         color: {$colorStore.text};"
                  on:click={addRoleReward}
                  aria-label="Add role reward"
                >
                  Add Role Reward
                </button>
              </div>

              <!-- Role Rewards List -->
              {#if roleRewards.length === 0}
                <div class="text-center py-4" style="color: {$colorStore.muted}">
                  No role rewards configured
                </div>
              {:else}
                <ul class="space-y-2">
                  {#each roleRewards as reward}
                    <li
                      class="flex items-center justify-between p-3 rounded-lg"
                      style="background: {$colorStore.primary}15;"
                    >
                      <div class="flex items-center gap-2">
                        <div
                          class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
                          style="background: {$colorStore.primary}20;
                                 color: {$colorStore.primary};"
                        >
                          {reward.level}
                        </div>
                        <span style="color: {$colorStore.text}">{reward.roleName || `Role ID: ${reward.roleId}`}</span>
                      </div>
                      <button
                        class="p-2 rounded-full transition-all duration-200"
                        style="background: {$colorStore.accent}20;
                               color: {$colorStore.accent};"
                        on:click={() => removeRoleReward(reward.id)}
                        aria-label={`Remove role reward for level ${reward.level}`}
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>

            <!-- Currency Rewards -->
            <div
              class="rounded-xl p-4"
              style="background: {$colorStore.secondary}10;"
            >
              <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">Currency Rewards</h3>

              <!-- Add Currency Reward Form -->
              <div class="mb-6 p-4 rounded-lg" style="background: {$colorStore.secondary}15;">
                <h4 class="text-sm font-medium mb-3" style="color: {$colorStore.muted}">Add Currency Reward</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label class="block text-xs mb-1" for="currency-reward-level" style="color: {$colorStore.muted}">Level</label>
                    <input
                      id="currency-reward-level"
                      bind:value={newCurrencyReward.level}
                      class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                      style="border-color: {$colorStore.secondary}30;
                             color: {$colorStore.text};"
                      type="number"
                      min="1"
                      aria-label="Level required for currency reward"
                    />
                  </div>
                  <div>
                    <label class="block text-xs mb-1" for="currency-reward-amount" style="color: {$colorStore.muted}">Amount</label>
                    <input
                      id="currency-reward-amount"
                      bind:value={newCurrencyReward.amount}
                      class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                      style="border-color: {$colorStore.secondary}30;
                             color: {$colorStore.text};"
                      type="number"
                      min="1"
                      aria-label="Currency amount to award"
                    />
                  </div>
                </div>
                <button
                  class="w-full px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  style="background: {$colorStore.secondary}20;
                         color: {$colorStore.text};"
                  on:click={addCurrencyReward}
                  aria-label="Add currency reward"
                >
                  Add Currency Reward
                </button>
              </div>

              <!-- Currency Rewards List -->
              {#if currencyRewards.length === 0}
                <div class="text-center py-4" style="color: {$colorStore.muted}">
                  No currency rewards configured
                </div>
              {:else}
                <ul class="space-y-2">
                  {#each currencyRewards as reward}
                    <li
                      class="flex items-center justify-between p-3 rounded-lg"
                      style="background: {$colorStore.secondary}15;"
                    >
                      <div class="flex items-center gap-2">
                        <div
                          class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
                          style="background: {$colorStore.secondary}20;
                                 color: {$colorStore.secondary};"
                        >
                          {reward.level}
                        </div>
                        <span style="color: {$colorStore.text}">{formatNumber(reward.amount)} currency</span>
                      </div>
                      <button
                        class="p-2 rounded-full transition-all duration-200"
                        style="background: {$colorStore.accent}20;
                               color: {$colorStore.accent};"
                        on:click={() => removeCurrencyReward(reward.id)}
                        aria-label={`Remove currency reward for level ${reward.level}`}
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          </div>
        {/if}
      </div>

      <!-- Template Panel -->
      <div
        aria-labelledby="template-tab"
        class:hidden={activeTab !== 'template'}
        id="template-panel"
        role="tabpanel"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
             color: {$colorStore.primary};"
          >
            <Image aria-hidden="true" class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">XP Card Template</h2>
        </div>

        {#if loading.template}
          <div class="flex justify-center items-center min-h-[200px]">
            <div
              class="w-12 h-12 border-4 rounded-full animate-spin"
              style="border-color: {$colorStore.primary}20;
               border-top-color: {$colorStore.primary};"
              aria-label="Loading"
            >
            </div>
          </div>
        {:else if error.template}
          <div
            class="rounded-xl p-4 flex items-center gap-3"
            style="background: {$colorStore.accent}10;"
            role="alert"
          >
            <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
            <p style="color: {$colorStore.accent}">{error.template}</p>
          </div>
        {:else if template}
          <!-- Mobile View Toggle -->
          {#if isMobile}
            <div class="mb-4 flex justify-center">
              <div class="bg-gray-800/50 rounded-lg p-1 inline-flex">
                <button
                  class="px-4 py-2 rounded-lg transition-all duration-200"
                  class:font-medium={editorMobileView === 'preview'}
                  style="background: {editorMobileView === 'preview' ? $colorStore.primary + '30' : 'transparent'};
                   color: {$colorStore.text};"
                  on:click={() => editorMobileView = 'preview'}
                  aria-label="Show preview"
                >
                  Preview
                </button>
                <button
                  class="px-4 py-2 rounded-lg transition-all duration-200"
                  class:font-medium={editorMobileView === 'controls'}
                  style="background: {editorMobileView === 'controls' ? $colorStore.primary + '30' : 'transparent'};
                   color: {$colorStore.text};"
                  on:click={() => editorMobileView = 'controls'}
                  aria-label="Show controls"
                >
                  Controls
                </button>
              </div>
            </div>
          {/if}

          <!-- Integrated Template Editor -->
          <div class="space-y-6">
            <!-- Template Editor Grid Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <!-- Preview Section - Left Side -->
              <div
                class="lg:col-span-2 h-[450px] flex flex-col"
                class:hidden={isMobile && editorMobileView === 'controls'}
              >
                <!-- Design Mode Button -->
                <div class="mb-3 flex justify-between items-center">
                  <button
                    class="px-3 py-2 rounded-lg transition-all duration-200 flex gap-1 items-center font-medium hover:scale-105"
                    class:border={isDesignMode}
                    on:click={toggleDesignMode}
                    style="background: {isDesignMode
                ? `linear-gradient(to right, ${$colorStore.primary}, ${$colorStore.secondary})`
                : $colorStore.primary + '20'};
                     color: {isDesignMode ? $colorStore.text : $colorStore.primary};
                     border-color: {isDesignMode ? $colorStore.primary : 'transparent'};"
                  >
                    <Move size={20} />
                    <span>{isDesignMode ? 'Design Mode Active' : 'Enable Design Mode'}</span>
                  </button>

                  <!-- Preview Controls -->
                  <div class="flex items-center gap-2">
                    <button
                      class="p-1.5 rounded-lg transition-colors"
                      on:click={toggleGrid}
                      style="background: {showGrid ? $colorStore.primary + '30' : $colorStore.primary + '10'};
                       color: {$colorStore.text};"
                      aria-label="Toggle grid"
                    >
                      <Grid size={18} />
                    </button>

                    <button
                      class="p-1.5 rounded-lg transition-colors"
                      on:click={toggleRealDataPreview}
                      style="background: {showRealDataPreview ? $colorStore.primary + '30' : $colorStore.primary + '10'};
                       color: {$colorStore.text};"
                      aria-label="Toggle real data preview"
                    >
                      <User size={18} />
                    </button>

                    <div class="hidden sm:flex items-center gap-2">
                      <button
                        class="p-1.5 rounded-lg transition-colors"
                        on:click={zoomOut}
                        style="background: {$colorStore.primary + '10'};
                         color: {$colorStore.text};"
                        aria-label="Zoom out"
                      >
                        <ZoomOut size={18} />
                      </button>

                      <span class="text-xs px-2" style="color: {$colorStore.text};">
                  {Math.round(previewScale * 100)}%
                </span>

                      <button
                        class="p-1.5 rounded-lg transition-colors"
                        on:click={zoomIn}
                        style="background: {$colorStore.primary + '10'};
                         color: {$colorStore.text};"
                        aria-label="Zoom in"
                      >
                        <ZoomIn size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Design mode tools -->
                {#if isDesignMode}
                  <div class="mb-3 flex flex-wrap gap-2">
                    <button
                      class="px-2 py-1 rounded flex items-center gap-1 text-xs"
                      class:border={snapToGrid}
                      on:click={toggleSnapToGrid}
                      style="background: {snapToGrid ? $colorStore.secondary + '30' : $colorStore.secondary + '10'};
                       color: {snapToGrid ? $colorStore.secondary : $colorStore.muted};
                       border-color: {snapToGrid ? $colorStore.secondary : 'transparent'};"
                    >
                      <Grid size={12} />
                      <span>Snap to Grid</span>
                    </button>

                    <button
                      class="px-2 py-1 rounded flex items-center gap-1 text-xs"
                      class:border={showSnapping}
                      on:click={toggleSnapping}
                      style="background: {showSnapping ? $colorStore.secondary + '30' : $colorStore.secondary + '10'};
                       color: {showSnapping ? $colorStore.secondary : $colorStore.muted};
                       border-color: {showSnapping ? $colorStore.secondary : 'transparent'};"
                    >
                      <AlignCenter size={12} />
                      <span>Smart Snapping</span>
                    </button>
                  </div>
                {/if}

                <!-- Template preview container -->
                <div
                  class="flex-grow relative overflow-hidden border rounded-lg flex items-center justify-center"
                  style="background: #111; border-color: {$colorStore.primary}30;"
                  bind:this={previewContainerRef}
                >
                  {#if localTemplate}
                    <!-- Grid background (if enabled) -->
                    {#if showGrid}
                      <div
                        class="absolute inset-0 z-0"
                        style="background-size: {gridSize * previewScale}px {gridSize * previewScale}px;
                         background-image: linear-gradient({$colorStore.primary}20 1px, transparent 1px),
                                          linear-gradient(90deg, {$colorStore.primary}20 1px, transparent 1px);
                         opacity: 0.3;"
                      >
                      </div>
                    {/if}

                    <!-- Template canvas -->
                    <div
                      class="absolute bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg"
                      style="width: {previewWidth}px;
                       height: {previewHeight}px;
                       left: {previewOffset.x}px;
                       top: {previewOffset.y}px;
                       transform-origin: top left;
                       background-image: url('{previewBackgroundUrl || ''}');
                       background-size: cover;
                       background-position: center;
                       border: 1px solid {$colorStore.primary}30;"
                    >
                      <!-- Guidelines -->
                      {#if showGuideLines && (guideLinesPos.x !== null || guideLinesPos.y !== null)}
                        <svg class="absolute inset-0 w-full h-full pointer-events-none">
                          {#if guideLinesPos.x !== null}
                            <line
                              x1={guideLinesPos.x}
                              y1="0"
                              x2={guideLinesPos.x}
                              y2={localTemplate.outputSizeY}
                              stroke={$colorStore.secondary}
                              stroke-width="1"
                              stroke-dasharray="4,4"
                            />
                          {/if}

                          {#if guideLinesPos.y !== null}
                            <line
                              x1="0"
                              y1={guideLinesPos.y}
                              x2={localTemplate.outputSizeX}
                              y2={guideLinesPos.y}
                              stroke={$colorStore.secondary}
                              stroke-width="1"
                              stroke-dasharray="4,4"
                            />
                          {/if}
                        </svg>
                      {/if}

                      {#each draggableElements as element (element.id)}
                        {#if element.isVisible()}
                          <!-- Draggable element representation -->
                          <div
                            class="absolute flex items-center justify-center border-2 transition-all duration-100"
                            class:cursor-move={isDesignMode}
                            class:transform-gpu={true}
                            class:scale-105={draggingElement === element}
                            class:outline-dashed={draggingElement === element}
                            style="left: {element.getX() * previewScale}px;
                             top: {element.getY() * previewScale}px;
                             width: {element.getWidth() * previewScale}px;
                             height: {element.getHeight() * previewScale}px;
                             background: {element.color}30;
                             border-color: {element.color};
                             {!isDesignMode ? 'pointer-events: none;' : ''}
                             {isDesignMode ? 'opacity: 0.9;' : 'opacity: 0.6;'}
                             {draggingElement === element ? 'z-index: 100; outline-color: ' + $colorStore.secondary + ';' : ''}
                             {hoverElement === element ? 'box-shadow: 0 0 0 3px ' + element.color + ';' : ''}"
                            on:mousedown={(e) => startDrag(e, element)}
                            on:touchstart={(e) => startDrag(e, element)}
                            on:mouseover={() => isDesignMode && (hoverElement = element)}
                            on:mouseleave={() => isDesignMode && hoverElement === element && (hoverElement = null)}
                            aria-label={`${element.label} element`}
                          >
                            <div class="relative w-full h-full flex items-center justify-center overflow-hidden">
                        <span
                          class="text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-1"
                          style="color: {$colorStore.text};"
                        >
                          {element.label}
                        </span>

                              <!-- Show real data preview if enabled -->
                              {#if showRealDataPreview}
                                {#if element.id === 'username'}
            <span class="absolute inset-0 flex items-center justify-center text-xs opacity-50"
                  style="color: {formatColor(localTemplate.templateUser.textColor)};">
              {currentUserData ? currentUserData.username : sampleData.username}
            </span>
                                {:else if element.id === 'userAvatar'}
                                  <div class="absolute inset-0 flex items-center justify-center opacity-30">
                                    <div class="rounded-full overflow-hidden" style="width: 80%; height: 80%;">
                                      <img src={currentUserData ? currentUserData.avatarUrl : sampleData.avatarUrl}
                                           alt="Avatar preview" class="w-full h-full object-cover" />
                                    </div>
                                  </div>
                                {:else if element.id === 'guildLevel'}
            <span class="absolute inset-0 flex items-center justify-center text-xs opacity-50"
                  style="color: {formatColor(localTemplate.templateGuild.guildLevelColor)};">
              Level {currentUserData ? currentUserData.level : sampleData.level}
            </span>
                                {:else if element.id === 'guildRank'}
            <span class="absolute inset-0 flex items-center justify-center text-xs opacity-50"
                  style="color: {formatColor(localTemplate.templateGuild.guildRankColor)};">
              Rank #{currentUserData ? currentUserData.rank : sampleData.rank}
            </span>
                                {:else if element.id === 'timeOnLevel'}
            <span class="absolute inset-0 flex items-center justify-center text-xs opacity-50"
                  style="color: {formatColor(localTemplate.timeOnLevelColor)};">
              {currentUserData ? currentUserData.timeOnLevel : sampleData.timeOnLevel}
            </span>
                                {:else if element.id === 'clubName'}
            <span class="absolute inset-0 flex items-center justify-center text-xs opacity-50"
                  style="color: {formatColor(localTemplate.templateClub.clubNameColor)};">
              {currentUserData?.clubName || sampleData.clubName}
            </span>
                                {/if}
                              {/if}


                              <!-- Show tooltip if hovering -->
                              {#if hoverElement === element && showTooltips && element.tooltip}
                                <div
                                  class="absolute -top-6 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs whitespace-nowrap z-50"
                                  style="background: {$colorStore.primary}; color: {$colorStore.text};"
                                >
                                  {element.tooltip}
                                </div>
                              {/if}
                            </div>
                          </div>
                        {/if}
                      {/each}

                      <!-- Progress bar line representation -->
                      {#if localTemplate.templateBar.showBar}
                        <svg
                          class="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none"
                          style="opacity: 0.9;"
                        >
                          <line
                            x1={localTemplate.templateBar.barPointAx * previewScale}
                            y1={localTemplate.templateBar.barPointAy * previewScale}
                            x2={localTemplate.templateBar.barPointBx * previewScale}
                            y2={localTemplate.templateBar.barPointBy * previewScale}
                            stroke={formatColor(localTemplate.templateBar.barColor) || '#ffffff'}
                            stroke-width={(localTemplate.templateBar.barWidth || 4) * previewScale}
                            stroke-opacity={localTemplate.templateBar.barTransparency / 255}
                          />

                          <!-- Show progress with sample data -->
                          {#if showRealDataPreview}
                            <line
                              x1={localTemplate.templateBar.barPointAx * previewScale}
                              y1={localTemplate.templateBar.barPointAy * previewScale}
                              x2={calculateProgressPosition().x * previewScale}
                              y2={calculateProgressPosition().y * previewScale}
                              stroke={formatColor(localTemplate.templateBar.barColor) || '#ffffff'}
                              stroke-width={(localTemplate.templateBar.barWidth || 4) * previewScale}
                              stroke-opacity={1}
                            />
                          {/if}
                        </svg>
                      {/if}
                    </div>
                  {/if}

                  <!-- Size indicator -->
                  <div
                    class="absolute bottom-1 left-1 px-2 py-1 rounded text-xs opacity-60 transition-opacity bg-black/70"
                    style="color: {$colorStore.text};"
                  >
                    {localTemplate?.outputSizeX || 0} × {localTemplate?.outputSizeY || 0}px
                  </div>

                  <!-- Coordinate overlay during drag -->
                  {#if showCoordinateOverlay && draggingElement}
                    <div
                      class="absolute top-1 right-1 px-3 py-2 rounded text-xs font-mono bg-black/80"
                      style="color: {$colorStore.text}; border: 1px solid {$colorStore.primary}40;"
                      transition:fade={{ duration: 100 }}
                    >
                      X: {Math.round(draggingElement.getX())} Y: {Math.round(draggingElement.getY())}
                    </div>
                  {/if}
                </div>

                <!-- Coordinates and element info display -->
                <div
                  class="mt-2 p-3 rounded-lg flex flex-wrap gap-2 text-sm items-center"
                  style="color: {$colorStore.text}; background: {$colorStore.primary}20;"
                >
                  {#if draggingElement}
                    <div class="flex items-center gap-2">
                <span
                  class="w-3 h-3 rounded-full"
                  style="background-color: {draggingElement.color};"
                ></span>
                      <span class="font-medium">{draggingElement.label}:</span>
                    </div>
                    <span class="px-2 py-1 rounded" style="background: {draggingElement.color}20;">
                X: {Math.round(draggingElement.getX())}
              </span>
                    <span class="px-2 py-1 rounded" style="background: {draggingElement.color}20;">
                Y: {Math.round(draggingElement.getY())}
              </span>
                  {:else if hoverElement}
                    <div class="flex items-center gap-2">
                <span
                  class="w-3 h-3 rounded-full"
                  style="background-color: {hoverElement.color};"
                ></span>
                      <span class="font-medium">{hoverElement.label}:</span>
                    </div>
                    <span class="px-2 py-1 rounded" style="background: {hoverElement.color}20;">
                X: {Math.round(hoverElement.getX())}
              </span>
                    <span class="px-2 py-1 rounded" style="background: {hoverElement.color}20;">
                Y: {Math.round(hoverElement.getY())}
              </span>
                  {:else if isDesignMode}
                    <span>Hover over elements to see coordinates</span>
                  {:else}
                    <span>Enable Design Mode to position elements by dragging</span>
                  {/if}

                  <div class="ml-auto flex gap-2">
                    <button
                      class="p-1 rounded-lg transition-colors opacity-70 hover:opacity-100 disabled:opacity-30"
                      on:click={undo}
                      disabled={undoStack.length === 0}
                      aria-label="Undo"
                      style="background: {$colorStore.primary}20; color: {$colorStore.text};"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      class="p-1 rounded-lg transition-colors opacity-70 hover:opacity-100 text-xs flex items-center"
                      on:click={resetZoom}
                      aria-label="Reset zoom"
                      style="background: {$colorStore.primary}20; color: {$colorStore.text};"
                    >
                      Reset Zoom
                    </button>
                  </div>
                </div>
              </div>

              <!-- Settings Section - Right Side -->
              <div
                class="lg:col-span-3 flex flex-col"
                class:hidden={isMobile && editorMobileView === 'preview'}
              >
                <!-- Tabs Navigation -->
                <div class="mb-4 border-b pb-2" style="border-color: {$colorStore.primary}30;">
                  <div class="hidden md:flex gap-2 overflow-x-auto pb-1">
                    <button
                      class="px-3 py-2 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap"
                      class:font-medium={editorActiveTab === 'general'}
                      style="background: {editorActiveTab === 'general' ? $colorStore.primary + '30' : 'transparent'};
       color: {$colorStore.text};"
                      on:click={() => editorActiveTab = 'general'}
                    >
                      <Image size={18} />
                      <span>General</span>
                    </button>
                    <button
                      class="px-3 py-2 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap"
                      class:font-medium={editorActiveTab === 'user'}
                      style="background: {editorActiveTab === 'user' ? $colorStore.primary + '30' : 'transparent'};
       color: {$colorStore.text};"
                      on:click={() => editorActiveTab = 'user'}
                    >
                      <User size={18} />
                      <span>User</span>
                    </button>
                    <button
                      class="px-3 py-2 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap"
                      class:font-medium={editorActiveTab === 'bar'}
                      style="background: {editorActiveTab === 'bar' ? $colorStore.primary + '30' : 'transparent'};
       color: {$colorStore.text};"
                      on:click={() => editorActiveTab = 'bar'}
                    >
                      <BarChart size={18} />
                      <span>Progress Bar</span>
                    </button>
                    <button
                      class="px-3 py-2 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap"
                      class:font-medium={editorActiveTab === 'guild'}
                      style="background: {editorActiveTab === 'guild' ? $colorStore.primary + '30' : 'transparent'};
       color: {$colorStore.text};"
                      on:click={() => editorActiveTab = 'guild'}
                    >
                      <Users size={18} />
                      <span>Guild Info</span>
                    </button>
                    <button
                      class="px-3 py-2 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap"
                      class:font-medium={editorActiveTab === 'time'}
                      style="background: {editorActiveTab === 'time' ? $colorStore.primary + '30' : 'transparent'};
       color: {$colorStore.text};"
                      on:click={() => editorActiveTab = 'time'}
                    >
                      <Clock size={18} />
                      <span>Time</span>
                    </button>
                    <button
                      class="px-3 py-2 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap"
                      class:font-medium={editorActiveTab === 'club'}
                      style="background: {editorActiveTab === 'club' ? $colorStore.primary + '30' : 'transparent'};
       color: {$colorStore.text};"
                      on:click={() => editorActiveTab = 'club'}
                    >
                      <Award size={18} />
                      <span>Club</span>
                    </button>
                  </div>

                  <!-- For mobile, use a grid layout with more space -->
                  <div class="grid grid-cols-3 gap-2 md:hidden">
                    <button
                      class="p-2 rounded-lg flex flex-col items-center justify-center transition-colors"
                      class:font-medium={editorActiveTab === 'general'}
                      style="background: {editorActiveTab === 'general' ? $colorStore.primary + '30' : $colorStore.primary + '10'};
       color: {$colorStore.text};"
                      on:click={() => editorActiveTab = 'general'}
                    >
                      <Image size={16} />
                      <span class="text-xs mt-1">General</span>
                    </button>
                    <button
                      class="p-2 rounded-lg flex flex-col items-center justify-center transition-colors"
                      class:font-medium={editorActiveTab === 'user'}
                      style="background: {editorActiveTab === 'user' ? $colorStore.primary + '30' : $colorStore.primary + '10'};
       color: {$colorStore.text};"
                      on:click={() => editorActiveTab = 'user'}
                    >
                      <User size={16} />
                      <span class="text-xs mt-1">User</span>
                    </button>
                    <button
                      class="p-2 rounded-lg flex flex-col items-center justify-center transition-colors"
                      class:font-medium={editorActiveTab === 'bar'}
                      style="background: {editorActiveTab === 'bar' ? $colorStore.primary + '30' : $colorStore.primary + '10'};
       color: {$colorStore.text};"
                      on:click={() => editorActiveTab = 'bar'}
                    >
                      <BarChart size={16} />
                      <span class="text-xs mt-1">Bar</span>
                    </button>
                    <button
                      class="p-2 rounded-lg flex flex-col items-center justify-center transition-colors"
                      class:font-medium={editorActiveTab === 'guild'}
                      style="background: {editorActiveTab === 'guild' ? $colorStore.primary + '30' : $colorStore.primary + '10'};
       color: {$colorStore.text};"
                      on:click={() => editorActiveTab = 'guild'}
                    >
                      <Users size={16} />
                      <span class="text-xs mt-1">Guild</span>
                    </button>
                    <button
                      class="p-2 rounded-lg flex flex-col items-center justify-center transition-colors"
                      class:font-medium={editorActiveTab === 'time'}
                      style="background: {editorActiveTab === 'time' ? $colorStore.primary + '30' : $colorStore.primary + '10'};
       color: {$colorStore.text};"
                      on:click={() => editorActiveTab = 'time'}
                    >
                      <Clock size={16} />
                      <span class="text-xs mt-1">Time</span>
                    </button>
                    <button
                      class="p-2 rounded-lg flex flex-col items-center justify-center transition-colors"
                      class:font-medium={editorActiveTab === 'club'}
                      style="background: {editorActiveTab === 'club' ? $colorStore.primary + '30' : $colorStore.primary + '10'};
       color: {$colorStore.text};"
                      on:click={() => editorActiveTab = 'club'}
                    >
                      <Award size={16} />
                      <span class="text-xs mt-1">Club</span>
                    </button>
                  </div>
                </div>
                <!-- Tab Content Container -->
                <div class="flex-grow border rounded-lg p-4 overflow-y-auto"
                     style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; max-height: 500px;">
                  <!-- General Tab Content -->
                  {#if editorActiveTab === 'general'}
                    <div class="space-y-6" transition:fade={{ duration: 200 }}>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Output Size -->
                        <div class="space-y-4">
                          <div class="flex items-center gap-2">
                            <h3 class="text-lg font-medium" style="color: {$colorStore.text}">Output Size</h3>
                          </div>
                          <div class="space-y-3 p-4 rounded-lg border"
                               style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}20;">
                            <div>
                              <label for="output-width" class="block text-sm mb-1" style="color: {$colorStore.muted}">Width
                                (pixels)</label>
                              <div class="flex items-center">
                                <input
                                  id="output-width"
                                  type="range"
                                  bind:value={localTemplate.outputSizeX}
                                  on:input={() => handleChange('outputSizeX', localTemplate.outputSizeX)}
                                  min="300"
                                  max="1200"
                                  step="1"
                                  class="w-full mr-2"
                                />
                                <input
                                  type="number"
                                  bind:value={localTemplate.outputSizeX}
                                  on:input={() => handleChange('outputSizeX', localTemplate.outputSizeX)}
                                  on:focus={handleInputFocus}
                                  class="w-20 p-2 rounded-lg bg-gray-900/70 border input-field"
                                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  min="300"
                                  max="1200"
                                  aria-labelledby="output-width"
                                />
                              </div>
                            </div>
                            <div>
                              <label for="output-height" class="block text-sm mb-1" style="color: {$colorStore.muted}">Height
                                (pixels)</label>
                              <div class="flex items-center">
                                <input
                                  id="output-height"
                                  type="range"
                                  bind:value={localTemplate.outputSizeY}
                                  on:input={() => handleChange('outputSizeY', localTemplate.outputSizeY)}
                                  min="150"
                                  max="600"
                                  step="1"
                                  class="w-full mr-2"
                                />
                                <input
                                  type="number"
                                  bind:value={localTemplate.outputSizeY}
                                  on:input={() => handleChange('outputSizeY', localTemplate.outputSizeY)}
                                  on:focus={handleInputFocus}
                                  class="w-20 p-2 rounded-lg bg-gray-900/70 border input-field"
                                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  min="150"
                                  max="600"
                                  aria-labelledby="output-height"
                                />
                              </div>
                            </div>
                            <div class="text-xs py-1 px-2 rounded"
                                 style="background: {$colorStore.secondary}10; color: {$colorStore.muted};">
                              Recommended ratio: 2.85:1 (e.g., 800×280)
                            </div>
                          </div>
                        </div>

                        <!-- Background Image -->
                        <div class="space-y-4">
                          <div class="flex items-center gap-2">
                            <h3 class="text-lg font-medium" style="color: {$colorStore.text}">Background Image</h3>
                          </div>
                          <div class="space-y-3 p-4 rounded-lg border"
                               style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}20;">
                            <div>
                              <label for="image-url" class="block text-sm mb-1" style="color: {$colorStore.muted}">Image
                                URL</label>
                              <!-- Changed from flex gap-2 to flex flex-col sm:flex-row sm:gap-2 -->
                              <div class="flex flex-col sm:flex-row sm:gap-2">
                                <input
                                  id="image-url"
                                  type="text"
                                  bind:value={imageUrl}
                                  class="flex-1 p-2 rounded-lg bg-gray-900/70 border input-field mb-2 sm:mb-0"
                                  placeholder="https://example.com/image.jpg"
                                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                />
                                <button
                                  class="px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 w-full sm:w-auto"
                                  on:click={loadImage}
                                  disabled={imageLoading}
                                  style="background: {$colorStore.primary}30; color: {$colorStore.text}; opacity: {imageLoading ? '0.5' : '1'};"
                                  aria-label="Load background image"
                                >
                                  {#if imageLoading}
                                    <div class="w-4 h-4 border-2 rounded-full animate-spin"
                                         style="border-color: {$colorStore.primary}80; border-top-color: transparent;"></div>
                                  {/if}
                                  <span>Load</span>
                                </button>
                              </div>
                              {#if imageError}
                                <p class="mt-1 text-sm" style="color: {$colorStore.accent};">{imageError}</p>
                              {/if}
                            </div>

                            <div class="flex items-center mt-2 gap-2">
                              <input
                                type="checkbox"
                                id="update-size"
                                bind:checked={updateSizeFromImage}
                                class="w-4 h-4 rounded"
                              />
                              <label for="update-size" class="text-sm" style="color: {$colorStore.muted}">
                                Auto-update template size from image
                              </label>
                            </div>

                            <p class="text-xs py-1 px-2 rounded"
                               style="background: {$colorStore.secondary}10; color: {$colorStore.muted};">
                              Recommended size: {localTemplate.outputSizeX}×{localTemplate.outputSizeY} pixels
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- User Tab Content -->
                  {:else if editorActiveTab === 'user'}
                    <div class="space-y-6" transition:fade={{ duration: 200 }}>
                      <h3 class="text-lg font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                        <User size={20} style="color: {$colorStore.primary}" />
                        User Information Settings
                      </h3>

                      <!-- Username Settings -->
                      <div
                        class="border rounded-lg p-4 space-y-4"
                        style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}20;"
                      >
                        <div class="flex items-center justify-between">
                          <h4 class="font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                            <Type size={18} style="color: {$colorStore.primary}" />
                            Username Text
                          </h4>
                          <label class="flex items-center gap-2">
                            <span class="text-sm" style="color: {$colorStore.muted}">Show</span>
                            <input
                              type="checkbox"
                              class="w-4 h-4 rounded"
                              checked={localTemplate.templateUser.showText}
                              on:change={() => handleChange('templateUser.showText', !localTemplate.templateUser.showText)}
                              aria-label="Show username text"
                            />
                          </label>
                        </div>

                        <div class="space-y-3" class:opacity-50={!localTemplate.templateUser.showText}>
                          <div>
                            <label for="username-color" class="block text-sm mb-1" style="color: {$colorStore.muted}">Text
                              Color</label>
                            <div class="flex gap-2">
                              <input
                                id="username-color"
                                type="text"
                                value={formatColor(localTemplate.templateUser.textColor)}
                                on:input={(e) => handleChange('templateUser.textColor', parseColor(e.target.value))}
                                on:focus={handleInputFocus}
                                class="flex-1 p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                pattern="^#?[0-9A-Fa-f]{6,8}$"
                                placeholder="#RRGGBB"
                              />
                              <input
                                type="color"
                                value={formatColor(localTemplate.templateUser.textColor)}
                                on:input={(e) => handleChange('templateUser.textColor', parseColor(e.target.value))}
                                class="w-10 h-10 rounded-lg border cursor-pointer"
                                style="border-color: {$colorStore.primary}30;"
                                aria-labelledby="username-color"
                              />
                            </div>
                          </div>

                          <!-- Font Size with Slider -->
                          <div class="p-3 rounded-lg" style="background: {$colorStore.primary}15;">
                            <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Font Size</h5>
                            <div class="flex items-center">
                              <input
                                id="username-font-size"
                                type="range"
                                bind:value={localTemplate.templateUser.fontSize}
                                on:input={() => handleChange('templateUser.fontSize', localTemplate.templateUser.fontSize)}
                                min="10"
                                max="100"
                                step="1"
                                class="w-full mr-2"
                                aria-label="Username font size"
                              />
                              <input
                                type="number"
                                bind:value={localTemplate.templateUser.fontSize}
                                on:input={() => handleChange('templateUser.fontSize', localTemplate.templateUser.fontSize)}
                                on:focus={handleInputFocus}
                                class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                min="10"
                                max="100"
                                aria-labelledby="username-font-size"
                              />
                            </div>
                            <div class="flex justify-between text-xs mt-1" style="color: {$colorStore.muted}">
                              <span>Small</span>
                              <span>Large</span>
                            </div>
                          </div>

                          <div class="grid grid-cols-2 gap-3">
                            <div>
                              <label for="username-position-x" class="block text-sm mb-1"
                                     style="color: {$colorStore.muted}">Position X</label>
                              <input
                                id="username-position-x"
                                type="number"
                                bind:value={localTemplate.templateUser.textX}
                                on:input={() => handleChange('templateUser.textX', localTemplate.templateUser.textX)}
                                on:focus={handleInputFocus}
                                class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                              />
                            </div>
                            <div>
                              <label for="username-position-y" class="block text-sm mb-1"
                                     style="color: {$colorStore.muted}">Position Y</label>
                              <input
                                id="username-position-y"
                                type="number"
                                bind:value={localTemplate.templateUser.textY}
                                on:input={() => handleChange('templateUser.textY', localTemplate.templateUser.textY)}
                                on:focus={handleInputFocus}
                                class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- User Avatar Settings -->
                      <div
                        class="border rounded-lg p-4 space-y-4"
                        style="border-color: {$colorStore.secondary}30; background: {$colorStore.secondary}20;"
                      >
                        <div class="flex items-center justify-between">
                          <h4 class="font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                            <User size={18} style="color: {$colorStore.secondary}" />
                            User Avatar
                          </h4>
                          <label class="flex items-center gap-2">
                            <span class="text-sm" style="color: {$colorStore.muted}">Show</span>
                            <input
                              type="checkbox"
                              class="w-4 h-4 rounded"
                              checked={localTemplate.templateUser.showIcon}
                              on:change={() => handleChange('templateUser.showIcon', !localTemplate.templateUser.showIcon)}
                              aria-label="Show user avatar"
                            />
                          </label>
                        </div>

                        <div class="space-y-3" class:opacity-50={!localTemplate.templateUser.showIcon}>
                          <div class="grid grid-cols-2 gap-3">
                            <div>
                              <label for="avatar-position-x" class="block text-sm mb-1"
                                     style="color: {$colorStore.muted}">Position X</label>
                              <input
                                id="avatar-position-x"
                                type="number"
                                bind:value={localTemplate.templateUser.iconX}
                                on:input={() => handleChange('templateUser.iconX', localTemplate.templateUser.iconX)}
                                on:focus={handleInputFocus}
                                class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                              />
                            </div>
                            <div>
                              <label for="avatar-position-y" class="block text-sm mb-1"
                                     style="color: {$colorStore.muted}">Position Y</label>
                              <input
                                id="avatar-position-y"
                                type="number"
                                bind:value={localTemplate.templateUser.iconY}
                                on:input={() => handleChange('templateUser.iconY', localTemplate.templateUser.iconY)}
                                on:focus={handleInputFocus}
                                class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                              />
                            </div>
                          </div>

                          <!-- Avatar Size with Sliders -->
                          <div class="mt-4 p-3 rounded-lg" style="background: {$colorStore.secondary}15;">
                            <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Avatar Size</h5>
                            <div class="grid grid-cols-2 gap-3">
                              <div>
                                <label for="avatar-width" class="block text-xs mb-1" style="color: {$colorStore.muted}">Width</label>
                                <div class="flex items-center">
                                  <input
                                    id="avatar-width"
                                    type="range"
                                    bind:value={localTemplate.templateUser.iconSizeX}
                                    on:input={() => handleChange('templateUser.iconSizeX', localTemplate.templateUser.iconSizeX)}
                                    min="10"
                                    max="200"
                                    step="1"
                                    class="w-full mr-2"
                                  />
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateUser.iconSizeX}
                                    on:input={() => handleChange('templateUser.iconSizeX', localTemplate.templateUser.iconSizeX)}
                                    on:focus={handleInputFocus}
                                    class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                                    style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                    min="10"
                                    aria-labelledby="avatar-width"
                                  />
                                </div>
                              </div>
                              <div>
                                <label for="avatar-height" class="block text-xs mb-1"
                                       style="color: {$colorStore.muted}">Height</label>
                                <div class="flex items-center">
                                  <input
                                    id="avatar-height"
                                    type="range"
                                    bind:value={localTemplate.templateUser.iconSizeY}
                                    on:input={() => handleChange('templateUser.iconSizeY', localTemplate.templateUser.iconSizeY)}
                                    min="10"
                                    max="200"
                                    step="1"
                                    class="w-full mr-2"
                                  />
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateUser.iconSizeY}
                                    on:input={() => handleChange('templateUser.iconSizeY', localTemplate.templateUser.iconSizeY)}
                                    on:focus={handleInputFocus}
                                    class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                                    style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                    min="10"
                                    aria-labelledby="avatar-height"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Progress Bar Tab Content -->
                  {:else if editorActiveTab === 'bar'}
                    <div class="space-y-6" transition:fade={{ duration: 200 }}>
                      <h3 class="text-lg font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                        <BarChart size={20} style="color: {$colorStore.primary}" />
                        Progress Bar Settings
                      </h3>

                      <div
                        class="border rounded-lg p-4 space-y-4"
                        style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}20;"
                      >
                        <div class="flex items-center justify-between">
                          <h4 class="font-medium" style="color: {$colorStore.text}">XP Progress Bar</h4>
                          <label class="flex items-center gap-2">
                            <span class="text-sm" style="color: {$colorStore.muted}">Show</span>
                            <input
                              type="checkbox"
                              class="w-4 h-4 rounded"
                              checked={localTemplate.templateBar.showBar}
                              on:change={() => handleChange('templateBar.showBar', !localTemplate.templateBar.showBar)}
                              aria-label="Show progress bar"
                            />
                          </label>
                        </div>

                        <div class="space-y-4" class:opacity-50={!localTemplate.templateBar.showBar}>
                          <div>
                            <label for="bar-color" class="block text-sm mb-1" style="color: {$colorStore.muted}">Bar
                              Color</label>
                            <div class="flex gap-2">
                              <input
                                id="bar-color"
                                type="text"
                                value={formatColor(localTemplate.templateBar.barColor)}
                                on:input={(e) => handleChange('templateBar.barColor', parseColor(e.target.value))}
                                on:focus={handleInputFocus}
                                class="flex-1 p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                pattern="^#?[0-9A-Fa-f]{6,8}$"
                                placeholder="#RRGGBB"
                              />
                              <input
                                type="color"
                                value={formatColor(localTemplate.templateBar.barColor)}
                                on:input={(e) => handleChange('templateBar.barColor', parseColor(e.target.value))}
                                class="w-10 h-10 rounded-lg border cursor-pointer"
                                style="border-color: {$colorStore.primary}30;"
                                aria-labelledby="bar-color"
                              />
                            </div>
                          </div>

                          <!-- Bar Width with Slider -->
                          <div class="p-3 rounded-lg" style="background: {$colorStore.accent}15;">
                            <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Bar Width</h5>
                            <div class="flex items-center">
                              <input
                                id="bar-width"
                                type="range"
                                bind:value={localTemplate.templateBar.barWidth}
                                on:input={() => handleChange('templateBar.barWidth', localTemplate.templateBar.barWidth)}
                                min="1"
                                max="30"
                                step="1"
                                class="w-full mr-2"
                              />
                              <input
                                type="number"
                                bind:value={localTemplate.templateBar.barWidth}
                                on:input={() => handleChange('templateBar.barWidth', localTemplate.templateBar.barWidth)}
                                on:focus={handleInputFocus}
                                class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.accent}30; color: {$colorStore.text};"
                                min="1"
                                max="30"
                                aria-labelledby="bar-width"
                              />
                            </div>
                            <div class="flex justify-between text-xs mt-1" style="color: {$colorStore.muted}">
                              <span>Thin</span>
                              <span>Thick</span>
                            </div>
                          </div>

                          <div>
                            <label for="bar-transparency" class="block text-sm mb-1" style="color: {$colorStore.muted}">Transparency</label>
                            <input
                              id="bar-transparency"
                              type="range"
                              bind:value={localTemplate.templateBar.barTransparency}
                              on:input={() => handleChange('templateBar.barTransparency', localTemplate.templateBar.barTransparency)}
                              min="0"
                              max="255"
                              step="1"
                              class="w-full"
                            />
                            <div class="flex justify-between text-xs" style="color: {$colorStore.muted}">
                              <span>Transparent</span>
                              <span>Opaque</span>
                            </div>
                          </div>

                          <div>
                            <label for="bar-direction" class="block text-sm mb-1" style="color: {$colorStore.muted}">Bar
                              Direction</label>
                            <select
                              id="bar-direction"
                              bind:value={localTemplate.templateBar.barDirection}
                              on:change={() => handleChange('templateBar.barDirection', localTemplate.templateBar.barDirection)}
                              class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                              style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            >
                              {#each directions as direction}
                                <option value={direction.value}>{direction.label}</option>
                              {/each}
                            </select>
                          </div>

                          <div>
                            <label for="bar-length" class="block text-sm mb-1" style="color: {$colorStore.muted}">Bar
                              Length</label>
                            <input
                              id="bar-length"
                              type="number"
                              bind:value={localTemplate.templateBar.barLength}
                              on:input={() => handleChange('templateBar.barLength', localTemplate.templateBar.barLength)}
                              on:focus={handleInputFocus}
                              class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                              style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                              min="1"
                            />
                          </div>

                          <div class="grid grid-cols-2 gap-4">
                            <div>
                              <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Start Point</h5>
                              <div class="grid grid-cols-2 gap-2">
                                <div>
                                  <label for="bar-start-x" class="block text-xs mb-1"
                                         style="color: {$colorStore.muted}">X</label>
                                  <input
                                    id="bar-start-x"
                                    type="number"
                                    bind:value={localTemplate.templateBar.barPointAx}
                                    on:input={() => handleChange('templateBar.barPointAx', localTemplate.templateBar.barPointAx)}
                                    on:focus={handleInputFocus}
                                    class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                </div>
                                <div>
                                  <label for="bar-start-y" class="block text-xs mb-1"
                                         style="color: {$colorStore.muted}">Y</label>
                                  <input
                                    id="bar-start-y"
                                    type="number"
                                    bind:value={localTemplate.templateBar.barPointAy}
                                    on:input={() => handleChange('templateBar.barPointAy', localTemplate.templateBar.barPointAy)}
                                    on:focus={handleInputFocus}
                                    class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                </div>
                              </div>
                            </div>

                            <div>
                              <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">End Point</h5>
                              <div class="grid grid-cols-2 gap-2">
                                <div>
                                  <label for="bar-end-x" class="block text-xs mb-1"
                                         style="color: {$colorStore.muted}">X</label>
                                  <input
                                    id="bar-end-x"
                                    type="number"
                                    bind:value={localTemplate.templateBar.barPointBx}
                                    on:input={() => handleChange('templateBar.barPointBx', localTemplate.templateBar.barPointBx)}
                                    on:focus={handleInputFocus}
                                    class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                </div>
                                <div>
                                  <label for="bar-end-y" class="block text-xs mb-1"
                                         style="color: {$colorStore.muted}">Y</label>
                                  <input
                                    id="bar-end-y"
                                    type="number"
                                    bind:value={localTemplate.templateBar.barPointBy}
                                    on:input={() => handleChange('templateBar.barPointBy', localTemplate.templateBar.barPointBy)}
                                    on:focus={handleInputFocus}
                                    class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Guild Tab Content -->
                  {:else if editorActiveTab === 'guild'}
                    <div class="space-y-6" transition:fade={{ duration: 200 }}>
                      <h3 class="text-lg font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                        <Users size={20} style="color: {$colorStore.primary}" />
                        Guild Information Settings
                      </h3>

                      <!-- Guild Level Settings -->
                      <div
                        class="border rounded-lg p-4 space-y-4"
                        style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}20;"
                      >
                        <div class="flex items-center justify-between">
                          <h4 class="font-medium" style="color: {$colorStore.text}">Guild Level</h4>
                          <label class="flex items-center gap-2">
                            <span class="text-sm" style="color: {$colorStore.muted}">Show</span>
                            <input
                              type="checkbox"
                              class="w-4 h-4 rounded"
                              checked={localTemplate.templateGuild.showGuildLevel}
                              on:change={() => handleChange('templateGuild.showGuildLevel', !localTemplate.templateGuild.showGuildLevel)}
                              aria-label="Show guild level"
                            />
                          </label>
                        </div>

                        <div class="space-y-3" class:opacity-50={!localTemplate.templateGuild.showGuildLevel}>
                          <div>
                            <label for="guild-level-color" class="block text-sm mb-1"
                                   style="color: {$colorStore.muted}">Text Color</label>
                            <div class="flex gap-2">
                              <input
                                id="guild-level-color"
                                type="text"
                                value={formatColor(localTemplate.templateGuild.guildLevelColor)}
                                on:input={(e) => handleChange('templateGuild.guildLevelColor', parseColor(e.target.value))}
                                on:focus={handleInputFocus}
                                class="flex-1 p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                pattern="^#?[0-9A-Fa-f]{6,8}$"
                                placeholder="#RRGGBB"
                              />
                              <input
                                type="color"
                                value={formatColor(localTemplate.templateGuild.guildLevelColor)}
                                on:input={(e) => handleChange('templateGuild.guildLevelColor', parseColor(e.target.value))}
                                class="w-10 h-10 rounded-lg border cursor-pointer"
                                style="border-color: {$colorStore.primary}30;"
                                aria-labelledby="guild-level-color"
                              />
                            </div>
                          </div>

                          <!-- Guild Level Font Size with Slider -->
                          <div class="p-3 rounded-lg" style="background: {$colorStore.primary}15;">
                            <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Font Size</h5>
                            <div class="flex items-center">
                              <input
                                id="guild-level-font-size"
                                type="range"
                                bind:value={localTemplate.templateGuild.guildLevelFontSize}
                                on:input={() => handleChange('templateGuild.guildLevelFontSize', localTemplate.templateGuild.guildLevelFontSize)}
                                min="10"
                                max="100"
                                step="1"
                                class="w-full mr-2"
                              />
                              <input
                                type="number"
                                bind:value={localTemplate.templateGuild.guildLevelFontSize}
                                on:input={() => handleChange('templateGuild.guildLevelFontSize', localTemplate.templateGuild.guildLevelFontSize)}
                                on:focus={handleInputFocus}
                                class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                min="10"
                                max="100"
                                aria-labelledby="guild-level-font-size"
                              />
                            </div>
                            <div class="flex justify-between text-xs mt-1" style="color: {$colorStore.muted}">
                              <span>Small</span>
                              <span>Large</span>
                            </div>
                          </div>

                          <div class="grid grid-cols-2 gap-3">
                            <div>
                              <label for="guild-level-x" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                                X</label>
                              <input
                                id="guild-level-x"
                                type="number"
                                bind:value={localTemplate.templateGuild.guildLevelX}
                                on:input={() => handleChange('templateGuild.guildLevelX', localTemplate.templateGuild.guildLevelX)}
                                on:focus={handleInputFocus}
                                class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                              />
                            </div>
                            <div>
                              <label for="guild-level-y" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                                Y</label>
                              <input
                                id="guild-level-y"
                                type="number"
                                bind:value={localTemplate.templateGuild.guildLevelY}
                                on:input={() => handleChange('templateGuild.guildLevelY', localTemplate.templateGuild.guildLevelY)}
                                on:focus={handleInputFocus}
                                class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Guild Rank Settings -->
                      <div
                        class="border rounded-lg p-4 space-y-4"
                        style="border-color: {$colorStore.secondary}30; background: {$colorStore.secondary}20;"
                      >
                        <div class="flex items-center justify-between">
                          <h4 class="font-medium" style="color: {$colorStore.text}">Guild Rank</h4>
                          <label class="flex items-center gap-2">
                            <span class="text-sm" style="color: {$colorStore.muted}">Show</span>
                            <input
                              type="checkbox"
                              class="w-4 h-4 rounded"
                              checked={localTemplate.templateGuild.showGuildRank}
                              on:change={() => handleChange('templateGuild.showGuildRank', !localTemplate.templateGuild.showGuildRank)}
                              aria-label="Show guild rank"
                            />
                          </label>
                        </div>

                        <div class="space-y-3" class:opacity-50={!localTemplate.templateGuild.showGuildRank}>
                          <div>
                            <label for="guild-rank-color" class="block text-sm mb-1" style="color: {$colorStore.muted}">Text
                              Color</label>
                            <div class="flex gap-2">
                              <input
                                id="guild-rank-color"
                                type="text"
                                value={formatColor(localTemplate.templateGuild.guildRankColor)}
                                on:input={(e) => handleChange('templateGuild.guildRankColor', parseColor(e.target.value))}
                                on:focus={handleInputFocus}
                                class="flex-1 p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                pattern="^#?[0-9A-Fa-f]{6,8}$"
                                placeholder="#RRGGBB"
                              />
                              <input
                                type="color"
                                value={formatColor(localTemplate.templateGuild.guildRankColor)}
                                on:input={(e) => handleChange('templateGuild.guildRankColor', parseColor(e.target.value))}
                                class="w-10 h-10 rounded-lg border cursor-pointer"
                                style="border-color: {$colorStore.secondary}30;"
                                aria-labelledby="guild-rank-color"
                              />
                            </div>
                          </div>

                          <!-- Guild Rank Font Size with Slider -->
                          <div class="p-3 rounded-lg" style="background: {$colorStore.secondary}15;">
                            <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Font Size</h5>
                            <div class="flex items-center">
                              <input
                                id="guild-rank-font-size"
                                type="range"
                                bind:value={localTemplate.templateGuild.guildRankFontSize}
                                on:input={() => handleChange('templateGuild.guildRankFontSize', localTemplate.templateGuild.guildRankFontSize)}
                                min="10"
                                max="100"
                                step="1"
                                class="w-full mr-2"
                              />
                              <input
                                type="number"
                                bind:value={localTemplate.templateGuild.guildRankFontSize}
                                on:input={() => handleChange('templateGuild.guildRankFontSize', localTemplate.templateGuild.guildRankFontSize)}
                                on:focus={handleInputFocus}
                                class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                min="10"
                                max="100"
                                aria-labelledby="guild-rank-font-size"
                              />
                            </div>
                            <div class="flex justify-between text-xs mt-1" style="color: {$colorStore.muted}">
                              <span>Small</span>
                              <span>Large</span>
                            </div>
                          </div>

                          <div class="grid grid-cols-2 gap-3">
                            <div>
                              <label for="guild-rank-x" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                                X</label>
                              <input
                                id="guild-rank-x"
                                type="number"
                                bind:value={localTemplate.templateGuild.guildRankX}
                                on:input={() => handleChange('templateGuild.guildRankX', localTemplate.templateGuild.guildRankX)}
                                on:focus={handleInputFocus}
                                class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                              />
                            </div>
                            <div>
                              <label for="guild-rank-y" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                                Y</label>
                              <input
                                id="guild-rank-y"
                                type="number"
                                bind:value={localTemplate.templateGuild.guildRankY}
                                on:input={() => handleChange('templateGuild.guildRankY', localTemplate.templateGuild.guildRankY)}
                                on:focus={handleInputFocus}
                                class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Time Tab Content -->
                  {:else if editorActiveTab === 'time'}
                    <div class="space-y-6" transition:fade={{ duration: 200 }}>
                      <h3 class="text-lg font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                        <Clock size={20} style="color: {$colorStore.primary}" />
                        Time On Level Settings
                      </h3>

                      <!-- Time On Level Settings -->
                      <div
                        class="border rounded-lg p-4 space-y-4"
                        style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}20;"
                      >
                        <div class="flex items-center justify-between">
                          <h4 class="font-medium" style="color: {$colorStore.text}">Time On Level</h4>
                          <label class="flex items-center gap-2">
                            <span class="text-sm" style="color: {$colorStore.muted}">Show</span>
                            <input
                              type="checkbox"
                              class="w-4 h-4 rounded"
                              checked={localTemplate.showTimeOnLevel}
                              on:change={() => handleChange('showTimeOnLevel', !localTemplate.showTimeOnLevel)}
                              aria-label="Show time on level"
                            />
                          </label>
                        </div>

                        <div class="space-y-3" class:opacity-50={!localTemplate.showTimeOnLevel}>
                          <div>
                            <label for="time-format" class="block text-sm mb-1" style="color: {$colorStore.muted}">Format</label>
                            <input
                              id="time-format"
                              type="text"
                              bind:value={localTemplate.timeOnLevelFormat}
                              on:input={() => handleChange('timeOnLevelFormat', localTemplate.timeOnLevelFormat)}
                              on:focus={handleInputFocus}
                              class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                              style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                              placeholder="{0}d{1}h{2}m"
                            />
                            <p class="text-xs mt-1 px-2 py-1 rounded"
                               style="background: {$colorStore.primary}10; color: {$colorStore.muted};">
                              Format uses {0} for days, {1} for hours, {2} for minutes
                            </p>
                          </div>

                          <div>
                            <label for="time-color" class="block text-sm mb-1" style="color: {$colorStore.muted}">Text
                              Color</label>
                            <div class="flex gap-2">
                              <input
                                id="time-color"
                                type="text"
                                value={formatColor(localTemplate.timeOnLevelColor)}
                                on:input={(e) => handleChange('timeOnLevelColor', parseColor(e.target.value))}
                                on:focus={handleInputFocus}
                                class="flex-1 p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                pattern="^#?[0-9A-Fa-f]{6,8}$"
                                placeholder="#RRGGBB"
                              />
                              <input
                                type="color"
                                value={formatColor(localTemplate.timeOnLevelColor)}
                                on:input={(e) => handleChange('timeOnLevelColor', parseColor(e.target.value))}
                                class="w-10 h-10 rounded-lg border cursor-pointer"
                                style="border-color: {$colorStore.primary}30;"
                                aria-labelledby="time-color"
                              />
                            </div>
                          </div>

                          <!-- Time On Level Font Size with Slider -->
                          <div class="p-3 rounded-lg" style="background: {$colorStore.primary}15;">
                            <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Font Size</h5>
                            <div class="flex items-center">
                              <input
                                id="time-font-size"
                                type="range"
                                bind:value={localTemplate.timeOnLevelFontSize}
                                on:input={() => handleChange('timeOnLevelFontSize', localTemplate.timeOnLevelFontSize)}
                                min="10"
                                max="100"
                                step="1"
                                class="w-full mr-2"
                              />
                              <input
                                type="number"
                                bind:value={localTemplate.timeOnLevelFontSize}
                                on:input={() => handleChange('timeOnLevelFontSize', localTemplate.timeOnLevelFontSize)}
                                on:focus={handleInputFocus}
                                class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                min="10"
                                max="100"
                                aria-labelledby="time-font-size"
                              />
                            </div>
                            <div class="flex justify-between text-xs mt-1" style="color: {$colorStore.muted}">
                              <span>Small</span>
                              <span>Large</span>
                            </div>
                          </div>

                          <div class="grid grid-cols-2 gap-3">
                            <div>
                              <label for="time-x" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                                X</label>
                              <input
                                id="time-x"
                                type="number"
                                bind:value={localTemplate.timeOnLevelX}
                                on:input={() => handleChange('timeOnLevelX', localTemplate.timeOnLevelX)}
                                on:focus={handleInputFocus}
                                class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                              />
                            </div>
                            <div>
                              <label for="time-y" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                                Y</label>
                              <input
                                id="time-y"
                                type="number"
                                bind:value={localTemplate.timeOnLevelY}
                                on:input={() => handleChange('timeOnLevelY', localTemplate.timeOnLevelY)}
                                on:focus={handleInputFocus}
                                class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Club Tab Content -->
                  {:else if editorActiveTab === 'club'}
                    <div class="space-y-6" transition:fade={{ duration: 200 }}>
                      <h3 class="text-lg font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                        <Award size={20} style="color: {$colorStore.primary}" />
                        Club Settings
                      </h3>

                      <!-- Club Name Settings -->
                      <div
                        class="border rounded-lg p-4 space-y-4"
                        style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}20;"
                      >
                        <div class="flex items-center justify-between">
                          <h4 class="font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                            <Type size={18} style="color: {$colorStore.primary}" />
                            Club Name
                          </h4>
                          <label class="flex items-center gap-2">
                            <span class="text-sm" style="color: {$colorStore.muted}">Show</span>
                            <input
                              type="checkbox"
                              class="w-4 h-4 rounded"
                              checked={localTemplate.templateClub.showClubName}
                              on:change={() => handleChange('templateClub.showClubName', !localTemplate.templateClub.showClubName)}
                              aria-label="Show club name"
                            />
                          </label>
                        </div>

                        <div class="space-y-3" class:opacity-50={!localTemplate.templateClub.showClubName}>
                          <div>
                            <label for="club-name-color" class="block text-sm mb-1" style="color: {$colorStore.muted}">Text
                              Color</label>
                            <div class="flex gap-2">
                              <input
                                id="club-name-color"
                                type="text"
                                value={formatColor(localTemplate.templateClub.clubNameColor)}
                                on:input={(e) => handleChange('templateClub.clubNameColor', parseColor(e.target.value))}
                                on:focus={handleInputFocus}
                                class="flex-1 p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                pattern="^#?[0-9A-Fa-f]{6,8}$"
                                placeholder="#RRGGBB"
                              />
                              <input
                                type="color"
                                value={formatColor(localTemplate.templateClub.clubNameColor)}
                                on:input={(e) => handleChange('templateClub.clubNameColor', parseColor(e.target.value))}
                                class="w-10 h-10 rounded-lg border cursor-pointer"
                                style="border-color: {$colorStore.primary}30;"
                                aria-labelledby="club-name-color"
                              />
                            </div>
                          </div>

                          <!-- Club Name Font Size with Slider -->
                          <div class="p-3 rounded-lg" style="background: {$colorStore.primary}15;">
                            <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Font Size</h5>
                            <div class="flex items-center">
                              <input
                                id="club-name-font-size"
                                type="range"
                                bind:value={localTemplate.templateClub.clubNameFontSize}
                                on:input={() => handleChange('templateClub.clubNameFontSize', localTemplate.templateClub.clubNameFontSize)}
                                min="10"
                                max="100"
                                step="1"
                                class="w-full mr-2"
                              />
                              <input
                                type="number"
                                bind:value={localTemplate.templateClub.clubNameFontSize}
                                on:input={() => handleChange('templateClub.clubNameFontSize', localTemplate.templateClub.clubNameFontSize)}
                                on:focus={handleInputFocus}
                                class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                min="10"
                                max="100"
                                aria-labelledby="club-name-font-size"
                              />
                            </div>
                            <div class="flex justify-between text-xs mt-1" style="color: {$colorStore.muted}">
                              <span>Small</span>
                              <span>Large</span>
                            </div>
                          </div>

                          <div class="grid grid-cols-2 gap-3">
                            <div>
                              <label for="club-name-x" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                                X</label>
                              <input
                                id="club-name-x"
                                type="number"
                                bind:value={localTemplate.templateClub.clubNameX}
                                on:input={() => handleChange('templateClub.clubNameX', localTemplate.templateClub.clubNameX)}
                                on:focus={handleInputFocus}
                                class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                              />
                            </div>
                            <div>
                              <label for="club-name-y" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                                Y</label>
                              <input
                                id="club-name-y"
                                type="number"
                                bind:value={localTemplate.templateClub.clubNameY}
                                on:input={() => handleChange('templateClub.clubNameY', localTemplate.templateClub.clubNameY)}
                                on:focus={handleInputFocus}
                                class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Club Icon Settings -->
                      <div
                        class="border rounded-lg p-4 space-y-4"
                        style="border-color: {$colorStore.secondary}30; background: {$colorStore.secondary}20;"
                      >
                        <div class="flex items-center justify-between">
                          <h4 class="font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                            <Image size={18} style="color: {$colorStore.secondary}" />
                            Club Icon
                          </h4>
                          <label class="flex items-center gap-2">
                            <span class="text-sm" style="color: {$colorStore.muted}">Show</span>
                            <input
                              type="checkbox"
                              class="w-4 h-4 rounded"
                              checked={localTemplate.templateClub.showClubIcon}
                              on:change={() => handleChange('templateClub.showClubIcon', !localTemplate.templateClub.showClubIcon)}
                              aria-label="Show club icon"
                            />
                          </label>
                        </div>

                        <div class="space-y-3" class:opacity-50={!localTemplate.templateClub.showClubIcon}>
                          <div class="grid grid-cols-2 gap-3">
                            <div>
                              <label for="club-icon-x" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                                X</label>
                              <input
                                id="club-icon-x"
                                type="number"
                                bind:value={localTemplate.templateClub.clubIconX}
                                on:input={() => handleChange('templateClub.clubIconX', localTemplate.templateClub.clubIconX)}
                                on:focus={handleInputFocus}
                                class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                              />
                            </div>
                            <div>
                              <label for="club-icon-y" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                                Y</label>
                              <input
                                id="club-icon-y"
                                type="number"
                                bind:value={localTemplate.templateClub.clubIconY}
                                on:input={() => handleChange('templateClub.clubIconY', localTemplate.templateClub.clubIconY)}
                                on:focus={handleInputFocus}
                                class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                                style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                              />
                            </div>
                          </div>

                          <!-- Club Icon Size with Sliders -->
                          <div class="p-3 rounded-lg" style="background: {$colorStore.secondary}15;">
                            <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Icon Size</h5>
                            <div class="grid grid-cols-2 gap-3">
                              <div>
                                <label for="club-icon-width" class="block text-xs mb-1"
                                       style="color: {$colorStore.muted}">Width</label>
                                <div class="flex items-center">
                                  <input
                                    id="club-icon-width"
                                    type="range"
                                    bind:value={localTemplate.templateClub.clubIconSizeX}
                                    on:input={() => handleChange('templateClub.clubIconSizeX', localTemplate.templateClub.clubIconSizeX)}
                                    min="10"
                                    max="200"
                                    step="1"
                                    class="w-full mr-2"
                                  />
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateClub.clubIconSizeX}
                                    on:input={() => handleChange('templateClub.clubIconSizeX', localTemplate.templateClub.clubIconSizeX)}
                                    on:focus={handleInputFocus}
                                    class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                                    style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                    min="10"
                                    aria-labelledby="club-icon-width"
                                  />
                                </div>
                              </div>
                              <div>
                                <label for="club-icon-height" class="block text-xs mb-1"
                                       style="color: {$colorStore.muted}">Height</label>
                                <div class="flex items-center">
                                  <input
                                    id="club-icon-height"
                                    type="range"
                                    bind:value={localTemplate.templateClub.clubIconSizeY}
                                    on:input={() => handleChange('templateClub.clubIconSizeY', localTemplate.templateClub.clubIconSizeY)}
                                    min="10"
                                    max="200"
                                    step="1"
                                    class="w-full mr-2"
                                  />
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateClub.clubIconSizeY}
                                    on:input={() => handleChange('templateClub.clubIconSizeY', localTemplate.templateClub.clubIconSizeY)}
                                    on:focus={handleInputFocus}
                                    class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                                    style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                    min="10"
                                    aria-labelledby="club-icon-height"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Mobile View Footer -->
            {#if isMobile}
              <div class="mb-4 flex justify-center">
                <div class="bg-gray-800/50 rounded-lg p-1 inline-flex w-full max-w-md justify-center">
                  <button
                    class="flex-1 px-3 py-2 rounded-lg transition-all duration-200 mr-2"
                    class:font-medium={editorMobileView === 'preview'}
                    style="background: {editorMobileView === 'preview' ? $colorStore.primary + '30' : 'transparent'};
               color: {$colorStore.text};"
                    on:click={() => editorMobileView = 'preview'}
                    aria-label="Show preview"
                  >
                    Preview
                  </button>
                  <button
                    class="flex-1 px-3 py-2 rounded-lg transition-all duration-200"
                    class:font-medium={editorMobileView === 'controls'}
                    style="background: {editorMobileView === 'controls' ? $colorStore.primary + '30' : 'transparent'};
               color: {$colorStore.text};"
                    on:click={() => editorMobileView = 'controls'}
                    aria-label="Show controls"
                  >
                    Controls
                  </button>
                </div>
              </div>
            {/if}

            <!-- Save/Reset buttons -->
            <div class="flex justify-end gap-3 mt-4 mb-16 md:mb-4">
              {#if changedSettings.has("template")}
                <button
                  class="px-4 py-2 rounded-lg transition-all duration-200"
                  on:click={resetChanges}
                  style="background: {$colorStore.accent}30; color: {$colorStore.accent};"
                  aria-label="Reset changes"
                >
                  Reset Changes
                </button>
                <button
                  class="px-6 py-2 rounded-lg font-medium transition-all duration-200"
                  on:click={updateXpTemplate}
                  style="background: linear-gradient(to right, {$colorStore.primary}, {$colorStore.secondary});
                   color: {$colorStore.text};"
                  aria-label="Save template changes"
                >
                  Save Template Changes
                </button>
              {/if}
            </div>
          </div>
        {:else}
          <div class="text-center py-12" style="color: {$colorStore.muted}">
            No template data available
          </div>
        {/if}
      </div>


      <!-- Exclusions Panel -->
      <div
        aria-labelledby="exclusions-tab"
        class:hidden={activeTab !== 'exclusions'}
        id="exclusions-panel"
        role="tabpanel"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   color: {$colorStore.primary};"
          >
            <Database aria-hidden="true" class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">XP Exclusions</h2>
        </div>

        {#if loading.exclusions}
          <div class="flex justify-center items-center min-h-[200px]">
            <div
              class="w-12 h-12 border-4 rounded-full animate-spin"
              style="border-color: {$colorStore.primary}20;
                     border-top-color: {$colorStore.primary};"
              aria-label="Loading"
            >
            </div>
          </div>
        {:else if error.exclusions}
          <div
            class="rounded-xl p-4 flex items-center gap-3"
            style="background: {$colorStore.accent}10;"
            role="alert"
          >
            <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
            <p style="color: {$colorStore.accent}">{error.exclusions}</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <!-- Excluded Channels -->
            <div
              class="rounded-xl p-4 h-full flex flex-col"
              style="background: {$colorStore.primary}10;"
            >
              <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">Excluded Channels</h3>

              <!-- Add Excluded Channel Form -->
              <div class="mb-6 p-4 rounded-lg" style="background: {$colorStore.primary}15;">
                <h4 class="text-sm font-medium mb-3" style="color: {$colorStore.muted}">Exclude Channel from XP</h4>
                <div class="flex gap-3">
                  <select
                    id="exclude-channel-select"
                    bind:value={selectedChannelId}
                    class="flex-1 p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                    style="border-color: {$colorStore.primary}30;
                           color: {$colorStore.text};"
                    aria-label="Channel to exclude"
                  >
                    <option value="">Select Channel</option>
                    {#each guildChannels as channel}
                      <option value={channel.id}>{channel.name}</option>
                    {/each}
                  </select>
                  <button
                    class="px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                    disabled={!selectedChannelId}
                    on:click={excludeChannel}
                    style="background: {$colorStore.primary}20;
                           color: {$colorStore.text};"
                    aria-label="Exclude selected channel"
                  >
                    Exclude
                  </button>
                </div>
                <p class="mt-2 text-xs" style="color: {$colorStore.muted}">
                  Users won't earn XP from messages in excluded channels.
                </p>
              </div>

              <!-- Excluded Channels List -->
              {#if excludedChannels.length === 0}
                <div class="text-center py-4" style="color: {$colorStore.muted}">
                  No excluded channels
                </div>
              {:else}
                <ul class="space-y-2">
                  {#each excludedChannels as channelId}
                    <li
                      class="flex items-center justify-between p-3 rounded-lg"
                      style="background: {$colorStore.primary}15;"
                    >
                      <span style="color: {$colorStore.text}">
                        {guildChannels.find(c => c.id === channelId.toString())?.name || `Channel ID: ${channelId}`}
                      </span>
                      <button
                        class="p-2 rounded-full transition-all duration-200"
                        style="background: {$colorStore.accent}20;
                               color: {$colorStore.accent};"
                        on:click={() => includeChannel(channelId)}
                        aria-label={`Include channel ${guildChannels.find(c => c.id === channelId.toString())?.name || channelId}`}
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>

            <!-- Excluded Roles -->
            <div
              class="rounded-xl p-4 h-full flex flex-col"
              style="background: {$colorStore.secondary}10;"
            >
              <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">Excluded Roles</h3>

              <!-- Add Excluded Role Form -->
              <div class="mb-6 p-4 rounded-lg" style="background: {$colorStore.secondary}15;">
                <h4 class="text-sm font-medium mb-3" style="color: {$colorStore.muted}">Exclude Role from XP</h4>
                <div class="flex gap-3">
                  <select
                    id="exclude-role-select"
                    bind:value={selectedRoleId}
                    class="flex-1 p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                    style="border-color: {$colorStore.secondary}30;
                           color: {$colorStore.text};"
                    aria-label="Role to exclude"
                  >
                    <option value="">Select Role</option>
                    {#each guildRoles as role}
                      <option value={role.id}>{role.name}</option>
                    {/each}
                  </select>
                  <button
                    class="px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                    disabled={!selectedRoleId}
                    on:click={excludeRole}
                    style="background: {$colorStore.secondary}20;
                           color: {$colorStore.text};"
                    aria-label="Exclude selected role"
                  >
                    Exclude
                  </button>
                </div>
                <p class="mt-2 text-xs" style="color: {$colorStore.muted}">
                  Users with excluded roles won't earn XP from any source.
                </p>
              </div>

              <!-- Excluded Roles List -->
              {#if excludedRoles.length === 0}
                <div class="text-center py-4" style="color: {$colorStore.muted}">
                  No excluded roles
                </div>
              {:else}
                <ul class="space-y-2">
                  {#each excludedRoles as roleId}
                    <li
                      class="flex items-center justify-between p-3 rounded-lg"
                      style="background: {$colorStore.secondary}15;"
                    >
                      <span style="color: {$colorStore.text}">
                        {guildRoles.find(r => r.id === roleId.toString())?.name || `Role ID: ${roleId}`}
                      </span>
                      <button
                        class="p-2 rounded-full transition-all duration-200"
                        style="background: {$colorStore.accent}20;
                               color: {$colorStore.accent};"
                        on:click={() => includeRole(roleId)}
                        aria-label={`Include role ${guildRoles.find(r => r.id === roleId.toString())?.name || roleId}`}
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>


<style lang="postcss">
    :global(body) {
        background-color: #1a202c;
        color: #ffffff;
    }

    :global(select),
    :global(input),
    :global(textarea) {
        color-scheme: dark;
    }

    :global(*::-webkit-scrollbar) {
        @apply w-2;
    }

    :global(*::-webkit-scrollbar-track) {
        background: var(--color-primary) 10;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background: var(--color-primary) 30;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb:hover) {
        background: var(--color-primary) 50;
    }

    /* Prevent iOS styling */
    select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
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

    :global(.input-field) {
        transition: all 0.2s ease;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    :global(.input-field:focus) {
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
    }

    /* Draggable element styling */
    [class*="cursor-move"] {
        cursor: grab;
    }

    [class*="cursor-move"]:active {
        cursor: grabbing;
    }

    /* Custom slider styling */
    input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        height: 6px;
        border-radius: 5px;
        background: rgba(var(--color-primary-rgb), 0.2);
        outline: none;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--color-primary);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    input[type="range"]::-webkit-slider-thumb:hover {
        transform: scale(1.1);
    }

    input[type="range"]::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--color-primary);
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
    }

    input[type="range"]::-moz-range-thumb:hover {
        transform: scale(1.1);
    }

    /* Animation for draggable elements */
    .transform-gpu {
        backface-visibility: hidden;
        transform: translateZ(0);
        will-change: transform;
    }

    /* Prevent stretch in Safari */
    input, select, textarea {
        min-height: 44px;
    }

    /* Improve touchable area on mobile */
    @media (max-width: 768px) {
        button, input[type="checkbox"], input[type="radio"] {
            min-height: 44px;
            min-width: 44px;
        }
    }

    /* Prevent zoom on focus in mobile Safari */
    @media not all and (min-resolution: .001dpcm) {
        @supports (-webkit-appearance:none) {
            input[type="color"],
            input[type="date"],
            input[type="email"],
            input[type="month"],
            input[type="number"],
            input[type="password"],
            input[type="search"],
            input[type="tel"],
            input[type="text"],
            input[type="time"],
            input[type="url"],
            input[type="week"],
            select,
            textarea {
                font-size: 16px !important;
            }
        }
    }

    .dragging-active * {
        transition: none !important;
        animation: none !important;
    }

    .transform-gpu {
        transform: translate3d(0, 0, 0);
        backface-visibility: hidden;
        perspective: 1000px;
        will-change: transform;
    }

    /* Prevent selection during dragging */
    .dragging-active {
        user-select: none;
        -webkit-user-select: none;
    }

    .dragging-active .absolute {
        contain: layout style;
    }
</style>