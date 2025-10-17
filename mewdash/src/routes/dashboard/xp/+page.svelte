<!-- routes/dashboard/xp/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { clientApi, xpApi } from "$lib/api/index.ts";
  import type { GuildXpSetting } from "$lib/api/xp/models/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { goto } from "$app/navigation";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import XpSettings from "$lib/components/dashboard/xp/XpSettings.svelte";
  import XpStats from "$lib/components/dashboard/xp/XpStats.svelte";
  import XpLeaderboard from "$lib/components/dashboard/xp/XpLeaderboard.svelte";
  import XpRewards from "$lib/components/dashboard/xp/XpRewards.svelte";
  import XpExclusions from "$lib/components/dashboard/xp/XpExclusions.svelte";
  import XpTemplateEditor from "$lib/components/dashboard/xp/XpTemplateEditor.svelte";
  import XpMobileTemplateEditor from "$lib/components/dashboard/xp/XpMobileTemplateEditor.svelte";
  import { browser } from "$app/environment";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import type { PageData } from "./$types";

  interface Props {
        data: PageData;
    }

    let {data}: Props = $props();

  // State management
    let notificationMessage = $state("");
    let notificationType: "success" | "error" = $state("success");
    let isMobile = $state(false);
  let lastDragUpdate = 0;
  const THROTTLE_MS = 16;
  let dragAnimationFrameId: number | null = null;

    interface CurrentUserData {
      username: string;
      avatarUrl: string;
      level: number;
      rank: number;
      timeOnLevel: string;
      clubName: string;
      progress: number;
    }

    let currentUserData: CurrentUserData | null = $state(null);

  // XP Settings
    let xpSettings: GuildXpSetting | null = $state(null);

  // XP Stats
    let serverStats = $state({
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
    });

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
  }> = $state([]);
    let leaderboardPage = $state(1);
  let leaderboardPageSize = 9;

  // XP Template
    let template: any = $state(null);

  // XP Rewards
  let roleRewards: Array<{
    id: number;
    guildId: string;
    level: number;
    roleId: string;
    roleName: string;
  }> = $state([]);

  let currencyRewards: Array<{
    id: number;
    guildId: string;
    level: number;
    amount: number;
  }> = $state([]);

  // XP Exclusions
    let excludedChannels: string[] = $state([]);
    let excludedRoles: string[] = $state([]);

  // Management
    let changedSettings = $state(new Set<string>());
    let activeTab: "settings" | "stats" | "leaderboard" | "rewards" | "template" | "exclusions" = $state("settings");
    let guildChannels: Array<{ id: string; name: string }> = $state([]);
    let guildRoles: Array<{ id: string; name: string }> = $state([]);
    let loading = $state({
    settings: true,
    stats: true,
    leaderboard: true,
    rewards: true,
    exclusions: true,
    template: true
    });
    let error = $state({
    settings: null as string | null,
    stats: null as string | null,
    leaderboard: null as string | null,
    rewards: null as string | null,
    exclusions: null as string | null,
    template: null as string | null
    });

  // Template Editor State
    interface TemplateData {
      id: number;
      guildId: bigint;
      outputSizeX: number;
      outputSizeY: number;
      customXpImageUrl?: string;
      templateBar?: {
        barWidth?: number;
        barLength?: number;
        barDirection?: number;
        barColor?: string;
        barTransparency?: number;
        showBar?: boolean;
        barPointAx: number;
        barPointAy: number;
        barPointBx: number;
        barPointBy: number;
      };
      templateUser?: {
        showText?: boolean;
        textColor?: string;
        fontSize?: number;
        textX?: number;
        textY?: number;
      };
      templateGuild?: {
        showGuildRank?: boolean;
        guildRankColor?: string;
        guildRankFontSize?: number;
        guildRankX?: number;
        guildRankY?: number;
        showGuildLevel?: boolean;
        guildLevelColor?: string;
        guildLevelFontSize?: number;
        guildLevelX?: number;
        guildLevelY?: number;
      };
    }

    let localTemplate: TemplateData | null = $state(null);
    let previewContainerRef: HTMLDivElement | undefined = undefined;
    let draggingElement: ElementHelper | null = null;
    let showTemplateEditor = $state(false);
    let previewCanvas: HTMLCanvasElement | null = $state(null);
    let previewBgImage = $state<HTMLImageElement | null>(null);
    let defaultBgImage = $state<HTMLImageElement | null>(null);
  let dragStartPos = { x: 0, y: 0 };
  let dragStartElementPos = { x: 0, y: 0 };
  let previewScale = 1;
  let gridSize = 10;
  let snapToGrid = false;
  let undoStack: string[] = [];

    interface ElementHelper {
      getX(): number;

      getY(): number;

      setPos(x: number, y: number): void;

      isVisible(): boolean;
    }

  // Enhanced sample data for preview with realistic information
    let sampleData = $state({
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
    });

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  async function fetchCurrentUserData() {
    try {
      if (!$currentGuild?.id) return;

      const currentUserId = data.user?.id;

      if (!currentUserId) return;

      // Fetch the user's XP stats
      const userData = await xpApi.getUserXpStats($currentGuild.id, currentUserId);

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

      xpSettings = await xpApi.getXpSettings($currentGuild.id);
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

      const stats = await xpApi.getXpServerStats($currentGuild.id);
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

      const board = await xpApi.getXpLeaderboard($currentGuild.id, leaderboardPage, leaderboardPageSize);
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
        loading = {...loading, template: true};
        error = {...error, template: null};

      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }


        // Fetch template and settings together to ensure we have the custom image URL
        const [templateData, settingsData] = await Promise.all([
          xpApi.getXpTemplate($currentGuild.id),
          xpApi.getXpSettings($currentGuild.id).catch(() => xpSettings) // Fallback to existing settings
        ]);

        template = templateData;

      localTemplate = JSON.parse(JSON.stringify(template));

        // Initialize missing properties with C# defaults
      if (localTemplate) {
        if (localTemplate.templateBar) {
          if (!localTemplate.templateBar.barWidth) {
            localTemplate.templateBar.barWidth = 20; // C# default
          }
          if (typeof localTemplate.templateBar.barLength === "undefined") {
            localTemplate.templateBar.barLength = 452; // C# default value from DrawXpBar
          }
          if (typeof localTemplate.templateBar.barDirection === "undefined") {
            localTemplate.templateBar.barDirection = 3; // Default to Right (3 in C# enum)
          }
        }

        // Set customXpImageUrl from settings
        localTemplate.customXpImageUrl = settingsData?.customXpImageUrl || xpSettings?.customXpImageUrl || "";
      }

    } catch (err) {
      logger.error("Failed to fetch XP template:", err);
        error = {...error, template: err instanceof Error ? err.message : "Failed to fetch XP template"};
    } finally {
        loading = {...loading, template: false};
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
        xpApi.getXpRoleRewards($currentGuild.id),
        xpApi.getXpCurrencyRewards($currentGuild.id)
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
        xpApi.getXpExcludedChannels($currentGuild.id),
        xpApi.getXpExcludedRoles($currentGuild.id)
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
        clientApi.getTextChannels($currentGuild.id),
        clientApi.getRoles($currentGuild.id)
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
      if (!xpSettings) throw new Error("No settings to update");

      await xpApi.updateXpSettings($currentGuild.id, xpSettings);
      showNotificationMessage("XP settings updated successfully", "success");
      changedSettings = new Set();
      await fetchXpSettings();
    } catch (err) {
      logger.error("Failed to update XP settings:", err);
      showNotificationMessage("Failed to update XP settings", "error");
    }
  }

  async function updateXpTemplate() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!localTemplate) throw new Error("No template to update");
      if (!xpSettings) throw new Error("Settings not loaded");

      const templateCopy = JSON.parse(JSON.stringify(localTemplate));
      const imageUrl = templateCopy.customXpImageUrl;

      delete templateCopy.customXpImageUrl;

      await xpApi.updateXpTemplate($currentGuild.id, templateCopy);

      if (imageUrl) {
        // Update settings with new image URL
        const updatedSettings: GuildXpSetting = {
          ...xpSettings,
          customXpImageUrl: imageUrl
        };
        await xpApi.updateXpSettings($currentGuild.id, updatedSettings);
      }

      showNotificationMessage("XP template updated successfully", "success");
      const newSet = new Set(changedSettings);
      newSet.delete("template");
      changedSettings = newSet;
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

      await xpApi.addXpRoleReward($currentGuild.id, level, BigInt(roleId));

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

      await xpApi.removeXpRoleReward($currentGuild.id, rewardId);
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

      await xpApi.addXpCurrencyReward($currentGuild.id, level, amount);
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

      await xpApi.removeXpCurrencyReward($currentGuild.id, rewardId);
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

      await xpApi.excludeXpChannel($currentGuild.id, BigInt(channelId));
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

      await xpApi.includeXpChannel($currentGuild.id, BigInt(channelId));
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

      await xpApi.excludeXpRole($currentGuild.id, BigInt(roleId));
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

      await xpApi.includeXpRole($currentGuild.id, BigInt(roleId));
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
    if (localTemplate) {
      undoStack.push(JSON.stringify(localTemplate));
      // Keep undo stack limited to prevent memory issues
      if (undoStack.length > 20) {
        undoStack = undoStack.slice(-20);
      }
    }
  }

  // Apply snap to grid
  function applySnapToGrid(x: number, y: number) {
    if (!snapToGrid) return { x, y };

    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }

  // Reset changes
  function resetChanges() {
    // Save current state for undo
    saveStateForUndo();
    localTemplate = JSON.parse(JSON.stringify(template));
    const newSet = new Set(changedSettings);
    newSet.delete("template");
    changedSettings = newSet;
  }

  function handleDragMove(event: MouseEvent | TouchEvent) {
    if (!draggingElement) return;

    event.preventDefault();
    event.stopPropagation();

    const now = Date.now();
    if (now - lastDragUpdate < THROTTLE_MS) return;
    lastDragUpdate = now;

    if (dragAnimationFrameId) {
      cancelAnimationFrame(dragAnimationFrameId);
    }

    dragAnimationFrameId = requestAnimationFrame(() => {
      const clientX = event.type.includes("mouse")
        ? (event as MouseEvent).clientX
        : (event as TouchEvent).touches && (event as TouchEvent).touches[0]
          ? (event as TouchEvent).touches[0].clientX : 0;

      const clientY = event.type.includes("mouse")
        ? (event as MouseEvent).clientY
        : (event as TouchEvent).touches && (event as TouchEvent).touches[0]
          ? (event as TouchEvent).touches[0].clientY : 0;

      const deltaX = (clientX - dragStartPos.x) / previewScale;
      const deltaY = (clientY - dragStartPos.y) / previewScale;

      let newX = dragStartElementPos.x + deltaX;
      let newY = dragStartElementPos.y + deltaY;

      if (snapToGrid) {
        const snapped = applySnapToGrid(newX, newY);
        newX = snapped.x;
        newY = snapped.y;
      }

      if (draggingElement) {
        draggingElement.setPos(newX, newY);
      }

      if (localTemplate) {
        localTemplate = { ...localTemplate } as TemplateData;
      }
    });
  }

  function endDrag() {
    if (dragAnimationFrameId) {
      cancelAnimationFrame(dragAnimationFrameId);
      dragAnimationFrameId = null;
    }

    document.body.classList.remove("dragging-active");

    draggingElement = null;

    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("touchmove", handleDragMove);
    window.removeEventListener("mouseup", endDrag);
    window.removeEventListener("touchend", endDrag);

    if (localTemplate) {
      localTemplate = { ...localTemplate } as TemplateData;
    }
  }

  function updatePreviewScale() {
    if (!previewContainerRef || !localTemplate) return;

    const containerWidth = previewContainerRef.clientWidth;
    const containerHeight = previewContainerRef.clientHeight;
    const templateWidth = localTemplate.outputSizeX;
    const templateHeight = localTemplate.outputSizeY;

    const widthScale = (containerWidth - 40) / templateWidth;
    const heightScale = (containerHeight - 40) / templateHeight;
    previewScale = Math.min(widthScale, heightScale, 1);
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
      fetchChannelsAndRoles()
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

    // Render XP card preview
    function renderPreview() {
        if (!previewCanvas || !localTemplate) return;

        const ctx = previewCanvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        // Draw background
        if (previewBgImage) {
            // Custom background image
            ctx.drawImage(previewBgImage, 0, 0, localTemplate.outputSizeX, localTemplate.outputSizeY);
        } else if (defaultBgImage) {
            // Default background with gradient (since default is transparent)
            // First draw gradient
            const gradient = ctx.createLinearGradient(0, 0, localTemplate.outputSizeX, localTemplate.outputSizeY);
            gradient.addColorStop(0, `${$colorStore.primary}15`);
            gradient.addColorStop(0.5, `${$colorStore.primary}20`);
            gradient.addColorStop(1, `${$colorStore.secondary}15`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, localTemplate.outputSizeX, localTemplate.outputSizeY);

            // Then draw transparent default image on top
            ctx.drawImage(defaultBgImage, 0, 0, localTemplate.outputSizeX, localTemplate.outputSizeY);
        }

        // Draw username
        if (localTemplate.templateUser?.showText) {
            ctx.fillStyle = `#${localTemplate.templateUser.textColor || 'FFFFFF'}`;
            ctx.font = `${localTemplate.templateUser.fontSize || 24}px sans-serif`;
            ctx.fillText(
                currentUserData?.username || sampleData.username,
                localTemplate.templateUser.textX || 120,
                localTemplate.templateUser.textY || 50
            );
        }

        // Draw progress bar (matching C# DrawXpBar method exactly)
        if (localTemplate.templateBar?.showBar) {
            const percent = (currentUserData?.progress || sampleData.progress) / 100;
            const x1 = localTemplate.templateBar.barPointAx;
            const y1 = localTemplate.templateBar.barPointAy;
            const x2 = localTemplate.templateBar.barPointBx;
            const y2 = localTemplate.templateBar.barPointBy;
            const length = (localTemplate.templateBar.barLength || 452) * percent;
            const direction = localTemplate.templateBar.barDirection ?? 3; // Default to 3 (Right) as per C#

            // Calculate the four corners based on C# XpTemplateDirection enum
            // 0=Up, 1=Down, 2=Left, 3=Right
            let x3, x4, y3, y4;
            switch (direction) {
                case 1: // Down
                    x3 = x1;
                    x4 = x2;
                    y3 = y1 + length;
                    y4 = y2 + length;
                    break;
                case 0: // Up
                    x3 = x1;
                    x4 = x2;
                    y3 = y1 - length;
                    y4 = y2 - length;
                    break;
                case 2: // Left
                    x3 = x1 - length;
                    x4 = x2 - length;
                    y3 = y1;
                    y4 = y2;
                    break;
                default: // Right (3)
                    x3 = x1 + length;
                    x4 = x2 + length;
                    y3 = y1;
                    y4 = y2;
                    break;
            }

            // Draw as filled path
            ctx.save();

            // Parse color - handle ARGB format (e.g., "FF000000")
            let barColor = localTemplate.templateBar.barColor || '4CAF50';
            if (barColor.length === 8) {
                // Skip alpha bytes for ARGB format
                barColor = barColor.slice(2);
            }
            ctx.fillStyle = `#${barColor}`;
            ctx.globalAlpha = (localTemplate.templateBar.barTransparency || 255) / 255;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x3, y3);
            ctx.lineTo(x4, y4);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        // Draw guild rank
        if (localTemplate.templateGuild?.showGuildRank) {
            ctx.fillStyle = `#${localTemplate.templateGuild.guildRankColor || 'FFFFFF'}`;
            ctx.font = `${localTemplate.templateGuild.guildRankFontSize || 18}px sans-serif`;
            ctx.fillText(
                `#${currentUserData?.rank || sampleData.rank}`,
                localTemplate.templateGuild.guildRankX || 50,
                localTemplate.templateGuild.guildRankY || 150
            );
        }

        // Draw guild level
        if (localTemplate.templateGuild?.showGuildLevel) {
            ctx.fillStyle = `#${localTemplate.templateGuild.guildLevelColor || 'FFFFFF'}`;
            ctx.font = `${localTemplate.templateGuild.guildLevelFontSize || 18}px sans-serif`;
            ctx.fillText(
                `Level ${currentUserData?.level || sampleData.level}`,
                localTemplate.templateGuild.guildLevelX || 350,
                localTemplate.templateGuild.guildLevelY || 150
            );
        }
    }

    // Load default background image once
    onMount(() => {
        const img = new Image();
        img.onload = () => {
            defaultBgImage = img;
            if (previewCanvas && localTemplate) {
                renderPreview();
            }
        };
        img.onerror = () => {
            defaultBgImage = null;
        };
        img.src = '/img/default_xp_background.png';
    });

  // Update preview on template change
    $effect(() => {
        if (localTemplate && activeTab === "template") {

            // Load background image if available
            if (localTemplate.customXpImageUrl) {
                const img = new Image();
                img.onload = () => {
                    previewBgImage = img;
                    renderPreview();
                };
              img.onerror = () => {
                    previewBgImage = null;
                    renderPreview();
                };
                img.src = localTemplate.customXpImageUrl;
            } else {
                previewBgImage = null;
                renderPreview();
            }
        }
    });

    $effect(() => {
        if (activeTab === "template" && !currentUserData) {
            fetchCurrentUserData();
        }
    });

    $effect(() => {
        if (previewCanvas && localTemplate && activeTab === "template") {
            // Small delay to ensure canvas is ready
            setTimeout(() => renderPreview(), 50);
        }
    });
</script>

<svelte:head>
  <title>XP Management - Dashboard</title>
</svelte:head>

<DashboardPageLayout 
  title="XP Management" 
  actionButtons={changedSettings.size > 0 ? [
    {
      label: "Save Changes",
      icon: "fa-floppy-disk",
      action: updateXpSettings,
      style: `background: linear-gradient(to right, ${$colorStore.primary}, ${$colorStore.secondary}); color: ${$colorStore.text}; box-shadow: 0 0 20px ${$colorStore.primary}20;`
    }
  ] : []}
  icon="fa-star"
  bind:notificationMessage
  bind:activeTab
  guildName={$currentGuild?.name || "Dashboard"}
  subtitle="Configure XP settings, rewards, and manage users' experience"
  notificationType={notificationType}
  tabs={[
    {id: "settings", label: "Settings", icon: "fa-gear"},
    {id: "stats", label: "Stats", icon: "fa-chart-bar"},
    {id: "leaderboard", label: "Leaderboard", icon: "fa-users"},
    {id: "rewards", label: "Rewards", icon: "fa-star"},
    {id: "template", label: "Template", icon: "fa-image"},
    {id: "exclusions", label: "Exclusions", icon: "fa-bell"}
  ]}
>

  <!-- Tab Content -->
  <div
    class=" border shadow-2xl"
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
            onclick={updateXpSettings}
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
          <i class="fa-utility-duo fa-regular fa-bell"
             style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"
             aria-hidden="true"></i>
          <p style="color: {$colorStore.accent}">{error.template}</p>
        </div>
      {:else if template}
        {#if localTemplate}
            <!-- XP Card Preview -->
            <div class="flex flex-col items-center gap-6 py-8">
                <h3 class="text-xl font-semibold" style="color: {$colorStore.text}">XP Card Preview</h3>

                <!-- Preview Container -->
                <div
                        class="relative rounded-2xl overflow-hidden shadow-2xl {isMobile ? 'max-w-full mx-4' : ''}"
                        style="width: {isMobile ? '100%' : Math.min(localTemplate.outputSizeX, 600) + 'px'};
                     max-width: {isMobile ? 'calc(100vw - 2rem)' : '600px'};
                     height: {isMobile ? '200px' : 'auto'};
                     aspect-ratio: {isMobile ? 'auto' : localTemplate.outputSizeX + ' / ' + localTemplate.outputSizeY};
                     background: linear-gradient(135deg, {$colorStore.primary}10, {$colorStore.secondary}10);
                     border: 2px solid {$colorStore.primary}30;"
                >
                    <canvas
                            bind:this={previewCanvas}
                            id="xp-preview-canvas"
                            width={localTemplate.outputSizeX}
                            height={localTemplate.outputSizeY}
                            style="width: 100%; height: 100%; object-fit: {isMobile ? 'cover' : 'contain'}; object-position: center; image-rendering: crisp-edges;"
                    ></canvas>
                </div>

                <!-- Edit Button -->
                <button
                  class="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 text-sm sm:text-base"
                        style="background: linear-gradient(135deg, {$colorStore.primary}, {$colorStore.secondary});
                     color: white;"
                        onclick={() => { showTemplateEditor = true; }}
                >
                  <i class="fa-solid fa-image" style="font-size: 20px;"></i>
                    Edit Template
                </button>

                <!-- Template Info -->
                <div class="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm"
                     style="color: {$colorStore.muted}">
                    <span>Size: {localTemplate.outputSizeX} × {localTemplate.outputSizeY}px</span>
                    <span class="hidden sm:inline">•</span>
                    <span>Background: {localTemplate.customXpImageUrl ? 'Custom Image' : 'Default'}</span>
                </div>
            </div>

            <!-- Fullscreen Template Editor -->
            {#if showTemplateEditor}
                {#if isMobile}
                    <XpMobileTemplateEditor
                            bind:localTemplate={localTemplate}
                            bind:changedSettings={changedSettings}
                            bind:currentUserData={currentUserData}
                            bind:sampleData={sampleData}
                            bind:showEditor={showTemplateEditor}
                    />
                {:else}
                    <XpTemplateEditor
                            bind:localTemplate={localTemplate}
                            bind:changedSettings={changedSettings}
                            bind:currentUserData={currentUserData}
                            bind:sampleData={sampleData}
                            bind:showEditor={showTemplateEditor}
                    />
                {/if}
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
              onclick={resetChanges}
              style="background: {$colorStore.accent}30; color: {$colorStore.accent};"
              aria-label="Reset changes"
            >
              Reset Changes
            </button>
            <button
              class="px-6 py-2 rounded-lg font-medium transition-all duration-200 min-h-[44px]"
              onclick={updateXpTemplate}
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
    @reference '../../../app.css'; /* Improve touchable area on mobile */
    @media (max-width: 768px) {
    }

    /* Prevent zoom on focus in mobile Safari */
    @media not all and (min-resolution: .001dpcm) {
        @supports (-webkit-appearance:none) {
        }
    }
</style>