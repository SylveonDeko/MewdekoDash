<!-- routes/dashboard/xp/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade } from "svelte/transition";
  import type { BotStatusModel } from "$lib/types/models.ts";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import XpSettings from "$lib/components/dashboard/xp/XpSettings.svelte";
  import XpStats from "$lib/components/dashboard/xp/XpStats.svelte";
  import XpLeaderboard from "$lib/components/dashboard/xp/XpLeaderboard.svelte";
  import XpRewards from "$lib/components/dashboard/xp/XpRewards.svelte";
  import XpExclusions from "$lib/components/dashboard/xp/XpExclusions.svelte";
  import XpTemplateEditor from "$lib/components/dashboard/xp/XpTemplateEditor.svelte";
  import XpMobileTemplateEditor from "$lib/components/dashboard/xp/XpMobileTemplateEditor.svelte";
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
  let notificationMessage = "";
  let notificationType = "success";
  let isMobile = false;
  let lastDragUpdate = 0;
  const THROTTLE_MS = 16;
  let dragAnimationFrameId: number | null = null;
  let currentUserData: any = null;
  let isLoadingUserData = false;

  // XP Settings
  let xpSettings = {
    guildId: $currentGuild?.id || BigInt(0),
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
    { id: "0", name: "Up" },
    { id: "1", name: "Down" },
    { id: "2", name: "Left" },
    { id: "3", name: "Right" }
  ];

  // Enhanced sample data for preview with realistic information
  let sampleData = {
    username: "QuantumViper42",
    avatarUrl: "https://cdn.discordapp.com/avatars/123456789012345678/a_1234567890abcdef1234567890abcdef.gif",
    discriminator: "0001",
    displayName: "Quantum Viper",
    level: 47,
    rank: 12,
    totalXp: 234567,
    levelXp: 4890,
    requiredXp: 7200,
    timeOnLevel: "2d 8h 23m",
    clubName: "Elite Gamers",
    clubIcon: "🏆",
    joinDate: "2021-03-15",
    messageCount: 15432,
    voiceTime: "127h 45m",
    lastActive: "2 hours ago",
    badges: ["🎖️", "⚡", "🔥"],
    progress: 68, // percentage (levelXp / requiredXp * 100)
    streak: 15,
    favoriteChannel: "general-chat",
    topEmoji: "😎"
  };


  // Fetch bot status
  async function fetchBotStatus() {
    try {
      botStatus = await api.getBotStatus();
    } catch (err) {
      logger.error("Failed to fetch bot status:", err);
    }
  }

  function activateTab(tab: "settings" | "stats" | "leaderboard" | "rewards" | "template" | "exclusions") {
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
        guildId: $currentGuild?.id || BigInt(0),
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

      const stats = await api.getXpServerStats($currentGuild.id);
      serverStats = {
        ...stats,
        recentActivity: stats.recentActivity.map(activity => ({
          ...activity,
          userId: activity.userId.toString()
        }))
      };
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

      const board = await api.getXpLeaderboard($currentGuild.id, leaderboardPage, leaderboardPageSize);
      leaderboard = board.map(entry => ({
        ...entry,
        userId: entry.userId.toString(),
        guildId: entry.guildId.toString()
      }));
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

      console.log("Fetching XP template for guild:", $currentGuild.id);
      template = await api.getXpTemplate($currentGuild.id);
      console.log("Raw template from API:", template);

      localTemplate = JSON.parse(JSON.stringify(template));
      console.log("Local template after copy:", localTemplate);

      // Initialize barWidth if it doesn't exist
      if (localTemplate.templateBar && !localTemplate.templateBar.barWidth) {
        localTemplate.templateBar.barWidth = 4; // Default to 4px
        console.log("Added default barWidth to templateBar");
      }

      localTemplate.customXpImageUrl = xpSettings.customXpImageUrl || "";
      console.log("Set customXpImageUrl:", localTemplate.customXpImageUrl);

      // Update the UI variables
      if (xpSettings.customXpImageUrl) {
        imageUrl = xpSettings.customXpImageUrl;
        previewBackgroundUrl = imageUrl;
        console.log("Updated preview background URL:", previewBackgroundUrl);
      }

      console.log("Template fetch completed successfully");
    } catch (err) {
      console.error("Failed to fetch XP template:", err);
      logger.error("Failed to fetch XP template:", err);
      error.template = err instanceof Error ? err.message : "Failed to fetch XP template";
    } finally {
      loading.template = false;
      console.log("Template loading finished, loading.template:", loading.template);
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

      roleRewards = roles.map(reward => ({
        ...reward,
        guildId: reward.guildId.toString(),
        roleId: reward.roleId.toString()
      }));
      currencyRewards = currency.map(reward => ({
        ...reward,
        guildId: reward.guildId.toString()
      }));
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

      excludedChannels = channels.map(id => id.toString());
      excludedRoles = roles.map(id => id.toString());
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

  async function addRoleReward(level: number, roleId: string) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!roleId) throw new Error("Please select a role");
      if (level < 1) throw new Error("Level must be at least 1");

      await api.addXpRoleReward($currentGuild.id, level, BigInt(roleId));

      showNotificationMessage("Role reward added successfully", "success");
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

  async function addCurrencyReward(level: number, amount: number) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (amount <= 0) throw new Error("Amount must be greater than 0");
      if (level < 1) throw new Error("Level must be at least 1");

      await api.addXpCurrencyReward($currentGuild.id, level, amount);
      showNotificationMessage("Currency reward added successfully", "success");
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

  async function excludeChannel(channelId: string) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!channelId) throw new Error("Please select a channel");

      await api.excludeXpChannel($currentGuild.id, BigInt(channelId));
      showNotificationMessage("Channel excluded successfully", "success");
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

  async function excludeRole(roleId: string) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!roleId) throw new Error("Please select a role");

      await api.excludeXpRole($currentGuild.id, BigInt(roleId));
      showNotificationMessage("Role excluded successfully", "success");
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

  function goToPage(page: number) {
    if (page < 1) return;
    leaderboardPage = page;
    fetchLeaderboard();
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

  // Color input handlers with type safety
  function handleColorInput(path: string) {
    return (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target) {
        handleChange(path, parseColor(target.value));
      }
    };
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

  // Start dragging an element
  function startDrag(event: MouseEvent | TouchEvent, element: any) {
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
  function handleDragMove(event: MouseEvent | TouchEvent) {
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

  function calculateSimplifiedSnapLines(currentElement: any, x: number, y: number) {
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

<DashboardPageLayout 
  title="XP Management" 
  subtitle="Configure XP settings, rewards, and manage users' experience" 
  icon={Award}
  bind:notificationMessage
  bind:notificationType
  guildName={$currentGuild?.name || "Dashboard"}
  tabs={[
    {id: "settings", label: "Settings", icon: Settings},
    {id: "stats", label: "Stats", icon: BarChart},
    {id: "leaderboard", label: "Leaderboard", icon: Users},
    {id: "rewards", label: "Rewards", icon: Star},
    {id: "template", label: "Template", icon: Image},
    {id: "exclusions", label: "Exclusions", icon: AlertCircle}
  ]}
  activeTab={activeTab}
  on:tabChange={(e) => activeTab = e.detail.tabId}
  actionButtons={changedSettings.size > 0 ? [
    {
      label: "Save Changes",
      icon: Settings,
      action: updateXpSettings,
      style: `background: linear-gradient(to right, ${$colorStore.primary}, ${$colorStore.secondary}); color: ${$colorStore.text}; box-shadow: 0 0 20px ${$colorStore.primary}20;`
    }
  ] : []}
>

  <!-- Tab Content -->
  <div
    class="backdrop-blur-sm border shadow-2xl"
    class:rounded-2xl={activeTab !== 'template'}
    class:p-6={activeTab !== 'template'}
    class:h-[calc(100vh-200px)]={activeTab === 'template'}
    style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}10, {$colorStore.gradientEnd}20);
           border-color: {$colorStore.primary}30;"
  >
    <!-- Settings Panel -->
    <div
      aria-labelledby="settings-tab"
      class:hidden={activeTab !== 'settings'}
      id="settings-panel"
      role="tabpanel"
    >
      <XpSettings 
        bind:xpSettings={xpSettings}
        loading={loading.settings}
        error={error.settings}
        bind:changedSettings={changedSettings}
      />
      
      {#if changedSettings.has("xpSettings")}
        <div class="flex justify-end mt-6">
          <button
            class="px-6 py-2 rounded-lg font-medium transition-all duration-200 min-h-[44px]"
            on:click={updateXpSettings}
            style="background: linear-gradient(to right, {$colorStore.primary}, {$colorStore.secondary});
                   color: {$colorStore.text};"
            aria-label="Save XP settings"
          >
            Save Settings
          </button>
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
      <XpStats 
        serverStats={serverStats}
        loading={loading.stats}
        error={error.stats}
      />
    </div>

    <!-- Leaderboard Panel -->
    <div
      aria-labelledby="leaderboard-tab"
      class:hidden={activeTab !== 'leaderboard'}
      id="leaderboard-panel"
      role="tabpanel"
    >
      <XpLeaderboard 
        leaderboard={leaderboard}
        leaderboardPage={leaderboardPage}
        loading={loading.leaderboard}
        error={error.leaderboard}
        onPageChange={goToPage}
      />
    </div>

    <!-- Rewards Panel -->
    <div
      aria-labelledby="rewards-tab"
      class:hidden={activeTab !== 'rewards'}
      id="rewards-panel"
      role="tabpanel"
    >
      <XpRewards 
        roleRewards={roleRewards}
        currencyRewards={currencyRewards}
        guildRoles={guildRoles}
        loading={loading.rewards}
        error={error.rewards}
        onAddRoleReward={addRoleReward}
        onRemoveRoleReward={removeRoleReward}
        onAddCurrencyReward={addCurrencyReward}
        onRemoveCurrencyReward={removeCurrencyReward}
      />
    </div>

    <!-- Template Panel (kept mostly as is since user said don't touch it) -->
    <div
      aria-labelledby="template-tab"
      class:hidden={activeTab !== 'template'}
      id="template-panel"
      role="tabpanel"
    >

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
        {#if localTemplate}
          {#if isMobile}
            <!-- Mobile editor has its own header, so skip the page header -->
            <XpMobileTemplateEditor 
              bind:localTemplate={localTemplate}
              bind:changedSettings={changedSettings}
              bind:currentUserData={currentUserData}
              bind:sampleData={sampleData}
            />
          {:else}
            <XpTemplateEditor 
              bind:localTemplate={localTemplate}
              bind:changedSettings={changedSettings}
              bind:isMobile={isMobile}
              bind:currentUserData={currentUserData}
              bind:sampleData={sampleData}
            />
          {/if}
        {:else}
          <div class="text-center py-12" style="color: {$colorStore.muted}">
            Template loaded but localTemplate is null. Raw template: {JSON.stringify(template)}
          </div>
        {/if}

        <!-- Save/Reset buttons -->
        <div class="flex justify-end gap-3 mt-4 mb-16 md:mb-4">
          {#if changedSettings.has("template")}
            <button
              class="px-4 py-2 rounded-lg transition-all duration-200 min-h-[44px]"
              on:click={resetChanges}
              style="background: {$colorStore.accent}30; color: {$colorStore.accent};"
              aria-label="Reset changes"
            >
              Reset Changes
            </button>
            <button
              class="px-6 py-2 rounded-lg font-medium transition-all duration-200 min-h-[44px]"
              on:click={updateXpTemplate}
              style="background: linear-gradient(to right, {$colorStore.primary}, {$colorStore.secondary});
               color: {$colorStore.text};"
              aria-label="Save template changes"
            >
              Save Template Changes
            </button>
          {/if}
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
      <XpExclusions 
        excludedChannels={excludedChannels}
        excludedRoles={excludedRoles}
        guildChannels={guildChannels}
        guildRoles={guildRoles}
        loading={loading.exclusions}
        error={error.exclusions}
        onExcludeChannel={excludeChannel}
        onIncludeChannel={includeChannel}
        onExcludeRole={excludeRole}
        onIncludeRole={includeRole}
      />
    </div>
  </div>
</DashboardPageLayout>

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

    /* Improve touchable area on mobile */
    @media (max-width: 768px) {
        button, input[type="checkbox"] {
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
            select {
                font-size: 16px;
            }
        }
    }
</style>