<!-- routes/dashboard/administration/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { administrationApi, clientApi, protectionApi, type TimezoneInfo } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import { loadingStore } from "$lib/stores/loadingStore";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";

  // Import tab components
  import OverviewTab from "./components/OverviewTab.svelte";
  import ProtectionTab from "./components/tabs/ProtectionTab.svelte";
  import RolesTab from "./components/tabs/RolesTab.svelte";
  import AutomationTab from "./components/tabs/AutomationTab.svelte";
  import AdvancedTab from "./components/tabs/AdvancedTab.svelte";

  let { data } = $props();

  let loading = $state(true);
  let error: string | null = $state(null);
  let saving = $state(false);

  // Layout state
  let activeTab = $state("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: "fa-chart-bar" },
    { id: "protection", label: "Protection Systems", icon: "fa-shield" },
    { id: "roles", label: "Roles & Permissions", icon: "fa-users" },
    { id: "automation", label: "Automation & Settings", icon: "fa-gear" },
    { id: "advanced", label: "Advanced Operations", icon: "fa-bolt" }
  ];

  // Server Management
  let staffRole: bigint | null = $state(null);
  let memberRole: bigint | null = $state(null);
  let guildTimezone: string = $state("UTC");
  let availableTimezones: Array<{ id: string; displayName: string; offset: string }> = $state([]);
  let gameVoiceChannel: bigint | null = $state(null);

  // Auto-assign roles
  let autoAssignRoles: { normalRoles: bigint[]; botRoles: bigint[] } = $state({ normalRoles: [], botRoles: [] });
  let autoBanRoles: Array<{ roleId: bigint; roleName: string }> = $state([]);
  let selectedNormalRoles: string[] = $state([]);
  let selectedBotRoles: string[] = $state([]);

  // Protection settings
  let protectionStatus: any = $state({
    antiRaid: { enabled: false, userThreshold: 5, seconds: 10, action: "Mute", punishDuration: 60 },
    antiSpam: { enabled: false, messageThreshold: 5, action: "Mute", muteTime: 5, roleId: null },
    antiAlt: { enabled: false, minAgeMinutes: 1440, action: "Kick", actionDurationMinutes: 0, roleId: null },
    antiMassMention: { enabled: false, mentionThreshold: 5, timeWindowSeconds: 30, maxMentionsInTimeWindow: 10, ignoreBots: true, action: "Mute", muteTime: 5, roleId: null },
    antiPattern: {
      enabled: false,
      action: 1,
      punishDuration: 60,
      roleId: null,
      checkAccountAge: false,
      maxAccountAgeMonths: 6,
      checkJoinTiming: false,
      maxJoinHours: 48.0,
      checkBatchCreation: false,
      checkOfflineStatus: false,
      checkNewAccounts: false,
      newAccountDays: 7,
      minimumScore: 15,
      patternCount: 0,
      counter: 0
    },
    antiMassPost: {
      enabled: false,
      channelThreshold: 3,
      timeWindowSeconds: 60,
      contentSimilarityThreshold: 0.8,
      minContentLength: 20,
      checkLinksOnly: true,
      checkDuplicateContent: true,
      requireIdenticalContent: false,
      caseSensitive: false,
      deleteMessages: true,
      notifyUser: true,
      action: 2,
      punishDuration: 0,
      roleId: null,
      ignoreBots: true,
      maxMessagesTracked: 50,
      userCount: 0,
      counter: 0
    },
    antiPostChannel: {
      enabled: false,
      action: 2,
      deleteMessages: true,
      notifyUser: true,
      punishDuration: 0,
      roleId: null,
      ignoreBots: true,
      channelCount: 0,
      channels: [],
      ignoredRoles: [],
      ignoredUsers: [],
      counter: 0
    }
  });

  // Protection form data
  let tempProtectionConfig: any = $state({});

  // Anti-pattern specific state
  let antiPatternPatterns: Array<{
    id: number;
    name: string;
    pattern: string;
    checkUsername: boolean;
    checkDisplayName: boolean;
  }> = $state([]);
  let newPattern = $state({ name: "", pattern: "", checkUsername: true, checkDisplayName: false });

  // Anti-post-channel specific state
  let selectedHoneypotChannels: string[] = $state([]);
  let selectedIgnoredRoles: string[] = $state([]);
  let selectedIgnoredUsers: string = $state("");

  // Role Management
  let selfAssignableRoles: {
    exclusive: boolean;
    roles: Array<{
      model: {
        id: number;
        guildId: bigint;
        roleId: bigint;
        group: number;
        levelRequirement: number;
      };
      role: {
        id: bigint;
        name: string;
        color: number;
      } | null;
    }>;
    groups: Record<number, string>;
  } = $state({exclusive: false, roles: [], groups: {}});
  let voiceChannelRoles: Array<{
    channelId: bigint;
    channelName: string;
    roleId: bigint;
    roleName: string
  }> = $state([]);
  let reactionRoles: {
    success: boolean;
    reactionRoles: Array<{
      index: number;
      messageId: bigint;
      channelId: bigint;
      exclusive: boolean;
      reactionRoles: Array<{
        emoteName: string;
        roleId: bigint;
      }>;
    }>;
  } = $state({success: false, reactionRoles: []});

  // Permission Overrides
  let permissionOverrides: Array<{ command: string; permission: string }> = $state([]);

  // Command Cooldowns
  let commandCooldowns: Array<{ command: string; cooldown: number }> = $state([]);

  // Advanced Operations
  let banMessage: any = $state({});

  // Available data
  let availableRoles: any[] = $state([]);
  let guildChannels: any[] = $state([]);
  let textChannels: Array<{ id: string; name: string }> = $state([]);
  let voiceChannels: Array<{ id: string; name: string }> = $state([]);
  let availableCommands: Array<{ id: string; name: string; label?: string }> = $state([]);
  let availablePermissions: Array<{ id: string; name: string }> = $state([]);
  let actionOptions = [
    { id: "9", name: "Warn", label: "Warn" },
    { id: "0", name: "Mute", label: "Mute" },
    { id: "1", name: "Kick", label: "Kick" },
    { id: "2", name: "Ban", label: "Ban" }
  ];

  // UI State
  let showConfirmModal = $state(false);
  let confirmModalData = $state<{
    title: string;
    message: string;
    action: (() => void) | null;
    variant: "danger" | "warning" | "info"
  }>({ title: "", message: "", action: null, variant: "danger" });

  // Expanded cards state
  let expandedProtectionCard: string | null = $state(null);
  let expandedRoleCard: string | null = $state(null);
  let showPatternManagement = $state(false);

  // Form data
  let newStaffRole: string | null = $state(null);
  let newMemberRole: string | null = $state(null);
  let newTimezone = $state("");
  let newAutoBanRole: string | null = $state(null);
  let newVoiceChannelRole: { channelId: string | null; roleId: string | null } = $state({
    channelId: null,
    roleId: null
  });
  let newPermissionOverride: { command: string; permission: string } = $state({
    command: "",
    permission: "Administrator"
  });
  let selectedPermissionOverrides: string[] = $state([]);
  let selectAllPermissionOverrides = $state(false);
  let newCommandCooldown: { command: string; seconds: number } = $state({ command: "", seconds: 5 });

  async function fetchAllData() {
    if (!$currentGuild?.id) return;

    return await loadingStore.wrap("fetch-admin-data", async () => {
      try {
        loading = true;

        const [
          autoAssignData, protectionData, selfAssignData, rolesData, textChannelsData, voiceChannelsData,
          staffRoleData, memberRoleData, timezoneData, timezonesData,
          _deleteMsgData, gameVoiceData,
          autoBanRolesData, voiceChannelRolesData, reactionRolesData,
          permissionOverridesData, commandsAndModulesData, commandCooldownsData,
          banMessageData, antiPatternPatternsData
        ] = await Promise.all([
          administrationApi.getAutoAssignRoles($currentGuild.id),
          protectionApi.getProtectionStatus($currentGuild.id),
          administrationApi.getSelfAssignableRoles($currentGuild.id),
          clientApi.getRoles($currentGuild.id),
          clientApi.getChannelsByType($currentGuild.id, 0), // Text channels
          clientApi.getChannelsByType($currentGuild.id, 2), // Voice channels
          administrationApi.getStaffRole($currentGuild.id),
          administrationApi.getMemberRole($currentGuild.id),
          administrationApi.getGuildTimezone($currentGuild.id),
          administrationApi.getTimezones($currentGuild.id),
          administrationApi.getDeleteMessageOnCommand($currentGuild.id),
          administrationApi.getGameVoiceChannel($currentGuild.id),
          administrationApi.getAutoBanRoles($currentGuild.id),
          administrationApi.getVoiceChannelRoles($currentGuild.id),
          administrationApi.getReactionRoles($currentGuild.id),
          administrationApi.getPermissionOverrides($currentGuild.id),
          administrationApi.getCommandsAndModules(),
          administrationApi.getCommandCooldowns($currentGuild.id),
          administrationApi.getBanMessage($currentGuild.id),
          protectionApi.getAntiPatternPatterns($currentGuild.id).catch(() => [])
        ]);

        // Server Management
        staffRole = staffRoleData && staffRoleData !== BigInt(0) ? staffRoleData : null;
        memberRole = memberRoleData && memberRoleData !== BigInt(0) ? memberRoleData : null;

        // Pre-populate selector values
        const staffRoleString = staffRole ? staffRole.toString() : null;
        const memberRoleString = memberRole ? memberRole.toString() : null;
        newStaffRole = staffRoleString;
        newMemberRole = memberRoleString;
        // Handle timezone data
        guildTimezone = (timezoneData as any)?.data || timezoneData || "UTC";
        // Transform timezone data to match DiscordSelector's expected format
        availableTimezones = (timezonesData || []).map((tz: TimezoneInfo) => ({
          id: tz.id,
          displayName: tz.displayName,
          offset: tz.offset
        }));
        // Find the timezone ID from the available timezones that matches the current timezone
        const currentTimezoneOption = availableTimezones.find((tz: TimezoneInfo) =>
          tz.id === guildTimezone ||
          (tz.displayName && tz.displayName.includes(guildTimezone)) ||
          tz.id.includes(guildTimezone)
        );
        newTimezone = currentTimezoneOption ? currentTimezoneOption.id : (guildTimezone || "UTC");
        gameVoiceChannel = gameVoiceData;

        // Auto-assign roles
        autoAssignRoles = autoAssignData || { normalRoles: [], botRoles: [] };
        autoBanRoles = autoBanRolesData || [];

        // Convert role IDs to strings for DiscordSelector
        const normalRoleIds = (autoAssignRoles.normalRoles || []).map(id => id.toString());
        const botRoleIds = (autoAssignRoles.botRoles || []).map(id => id.toString());
        selectedNormalRoles = normalRoleIds;
        selectedBotRoles = botRoleIds;

        // Ensure proper timing for pre-population
        setTimeout(() => {
          selectedNormalRoles = [...normalRoleIds];
          selectedBotRoles = [...botRoleIds];
        }, 0);

        // Protection
        protectionStatus = protectionData || {
          antiRaid: { enabled: false },
          antiSpam: { enabled: false },
          antiAlt: { enabled: false },
          antiMassMention: { enabled: false },
          antiPattern: { enabled: false },
          antiMassPost: { enabled: false },
          antiPostChannel: { enabled: false }
        };

        if (protectionStatus.antiPostChannel) {
          // Convert channel and role IDs to strings for DiscordSelector
          const channelIds = (protectionStatus.antiPostChannel.channels || []).map((id: any) => id.toString());
          const roleIds = (protectionStatus.antiPostChannel.ignoredRoles || []).map((id: any) => id.toString());
          selectedHoneypotChannels = channelIds;
          selectedIgnoredRoles = roleIds;

          // Ensure proper timing for pre-population
          setTimeout(() => {
            selectedHoneypotChannels = [...channelIds];
            selectedIgnoredRoles = [...roleIds];
          }, 0);
        }

        // Anti-pattern patterns
        antiPatternPatterns = antiPatternPatternsData || [];

        // Role Management
        selfAssignableRoles = (selfAssignData as any) || { exclusive: false, roles: [], groups: {} };
        voiceChannelRoles = voiceChannelRolesData || [];
        reactionRoles = (reactionRolesData as any) || { success: false, reactionRoles: [] };

        // Permissions
        permissionOverrides = permissionOverridesData || [];

        // Command Cooldowns
        commandCooldowns = (commandCooldownsData as any) || [];

        // Advanced Operations - parse JSON string into object if present
        const banMessageStr = typeof banMessageData === "string" ? banMessageData : ((banMessageData as any)?.message || "");
        try {
          banMessage = banMessageStr && banMessageStr.trim().startsWith("{") ? JSON.parse(banMessageStr) : (banMessageStr ? { content: banMessageStr } : {});
        } catch {
          banMessage = banMessageStr ? { content: banMessageStr } : {};
        }

        // Process commands and modules data
        if (commandsAndModulesData) {
          const commandMap = new Map<string, { id: string; name: string; label: string }>();

          // The API returns an array of objects with "commands" arrays
          commandsAndModulesData.forEach(moduleData => {
            if (moduleData.commands) {
              moduleData.commands.forEach(command => {
                const commandId = command.commandName;
                // Only add if not already exists (deduplication)
                if (!commandMap.has(commandId)) {
                  commandMap.set(commandId, {
                    id: commandId,
                    name: commandId,
                    label: `${commandId} - ${command.description || 'No description'}`
                  });
                }
              });
            }
          });

          availableCommands = Array.from(commandMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        }

        // Set up available Discord permissions
        availablePermissions = [
          { id: "Administrator", name: "Administrator" },
          { id: "ManageGuild", name: "Manage Server" },
          { id: "ManageRoles", name: "Manage Roles" },
          { id: "ManageChannels", name: "Manage Channels" },
          { id: "ManageMessages", name: "Manage Messages" },
          { id: "KickMembers", name: "Kick Members" },
          { id: "BanMembers", name: "Ban Members" },
          { id: "ModerateMembers", name: "Moderate Members" },
          { id: "ViewChannel", name: "View Channels" },
          { id: "SendMessages", name: "Send Messages" },
          { id: "EmbedLinks", name: "Embed Links" },
          { id: "AttachFiles", name: "Attach Files" },
          { id: "ReadMessageHistory", name: "Read Message History" },
          { id: "MentionEveryone", name: "Mention Everyone" },
          { id: "UseExternalEmojis", name: "Use External Emojis" },
          { id: "Connect", name: "Connect to Voice" },
          { id: "Speak", name: "Speak in Voice" },
          { id: "MuteMembers", name: "Mute Members" },
          { id: "DeafenMembers", name: "Deafen Members" },
          { id: "MoveMembers", name: "Move Members" }
        ];

        // Available data
        availableRoles = rolesData || [];
        textChannels = textChannelsData || [];
        voiceChannels = voiceChannelsData || [];
        guildChannels = [...textChannels, ...voiceChannels];


        // Ensure proper timing for pre-population after roles/channels are loaded
        setTimeout(() => {
          newStaffRole = [...(staffRoleString ? [staffRoleString] : [])][0] || null;
          newMemberRole = [...(memberRoleString ? [memberRoleString] : [])][0] || null;
          // Re-find timezone option in case options loaded after initial assignment
          const currentTimezoneOption = availableTimezones.find((tz: any) =>
            tz.id === guildTimezone ||
            (tz.displayName && tz.displayName.includes(guildTimezone)) ||
            tz.id.includes(guildTimezone)
          );
          newTimezone = currentTimezoneOption ? currentTimezoneOption.id : (guildTimezone || "UTC");
          selectedNormalRoles = [...normalRoleIds];
          selectedBotRoles = [...botRoleIds];
        }, 0);

      } catch (err) {
        logger.error("Failed to fetch administration data:", err);
        error = "Failed to load administration data";
      } finally {
        loading = false;
      }
    }, "api", "Loading administration data...");
  }

  function showConfirm(title: string, message: string, action: () => void, variant: "danger" | "warning" | "info" = "danger") {
    confirmModalData = { title, message, action, variant };
    showConfirmModal = true;
  }

  async function saveNormalRoles() {
    if (!$currentGuild?.id) return;

    try {
      saving = true;
      const roleIds = selectedNormalRoles.map(id => BigInt(id));
      await administrationApi.setAutoAssignRoles($currentGuild.id, roleIds);
      await fetchAllData();
    } catch (error) {
      logger.error("Failed to save normal auto-assign roles:", error);
    } finally {
      saving = false;
    }
  }

  async function saveBotRoles() {
    if (!$currentGuild?.id) return;

    try {
      saving = true;
      const roleIds = selectedBotRoles.map(id => BigInt(id));
      await administrationApi.setBotAutoAssignRoles($currentGuild.id, roleIds);
      await fetchAllData();
    } catch (error) {
      logger.error("Failed to save bot auto-assign roles:", error);
    } finally {
      saving = false;
    }
  }

  async function saveServerSettings() {
    if (!$currentGuild?.id) return;

    try {
      saving = true;

      const promises = [];

      if (newStaffRole && newStaffRole !== (staffRole?.toString() || null)) {
        promises.push(administrationApi.setStaffRole($currentGuild.id, BigInt(newStaffRole)));
      }

      if (newMemberRole && newMemberRole !== (memberRole?.toString() || null)) {
        promises.push(administrationApi.setMemberRole($currentGuild.id, BigInt(newMemberRole)));
      }

      if (newTimezone && newTimezone !== guildTimezone) {
        promises.push(administrationApi.setGuildTimezone($currentGuild.id, { timezoneId: newTimezone }));
      }

      await Promise.all(promises);
      await fetchAllData();

      // Reset form
      newStaffRole = null;
      newMemberRole = null;
      newTimezone = "";

    } catch (err) {
      logger.error("Failed to save server settings:", err);
    } finally {
      saving = false;
    }
  }

  async function toggleGameVoiceChannel(channelId: bigint) {
    if (!$currentGuild?.id) return;

    try {
      await administrationApi.toggleGameVoiceChannel($currentGuild.id, { channelId });
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to toggle game voice channel:", err);
    }
  }

  async function addAutoBanRole() {
    if (!$currentGuild?.id || !newAutoBanRole) return;

    try {
      await administrationApi.addAutoBanRole($currentGuild.id, BigInt(newAutoBanRole));
      await fetchAllData();
      expandedRoleCard = null;
      newAutoBanRole = null;
    } catch (err) {
      logger.error("Failed to add auto-ban role:", err);
    }
  }

  async function removeAutoBanRole(roleId: bigint) {
    if (!$currentGuild?.id) return;

    try {
      await administrationApi.removeAutoBanRole($currentGuild.id, roleId);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to remove auto-ban role:", err);
    }
  }

  async function addVoiceChannelRole() {
    if (!$currentGuild?.id || !newVoiceChannelRole.channelId || !newVoiceChannelRole.roleId) return;

    try {
      await administrationApi.addVoiceChannelRole($currentGuild.id, {
        channelId: BigInt(newVoiceChannelRole.channelId),
        roleId: BigInt(newVoiceChannelRole.roleId)
      });
      await fetchAllData();
      expandedRoleCard = null;
      newVoiceChannelRole = { channelId: null, roleId: null };
    } catch (err) {
      logger.error("Failed to add voice channel role:", err);
    }
  }

  async function removeVoiceChannelRole(channelId: bigint) {
    if (!$currentGuild?.id) return;

    try {
      await administrationApi.removeVoiceChannelRole($currentGuild.id, channelId);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to remove voice channel role:", err);
    }
  }

  async function toggleSelfAssignableRolesExclusive() {
    if (!$currentGuild?.id) return;

    try {
      await administrationApi.toggleSelfAssignableRoleExclusive($currentGuild.id);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to toggle self-assignable roles exclusivity:", err);
    }
  }

  async function deleteSelectedPermissionOverrides() {
    if (!$currentGuild?.id || selectedPermissionOverrides.length === 0) return;

    try {
      await Promise.all(
        selectedPermissionOverrides.map(command =>
          administrationApi.removePermissionOverride($currentGuild.id, command)
        )
      );
      selectedPermissionOverrides = [];
      selectAllPermissionOverrides = false;
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to delete selected permission overrides:", err);
    }
  }

  // Protection Configuration Functions
  async function configureProtection(type: string, config: any) {
    if (!$currentGuild?.id) return;

    try {
      saving = true;
      switch (type) {
        case "antiRaid":
          await administrationApi.configureAntiRaid($currentGuild.id, config);
          break;
        case "antiSpam":
          await administrationApi.configureAntiSpam($currentGuild.id, config);
          break;
        case "antiAlt":
          await administrationApi.configureAntiAlt($currentGuild.id, config);
          break;
        case "antiMassMention":
          await administrationApi.configureAntiMassMention($currentGuild.id, config);
          break;
        case "antiPattern":
          await protectionApi.configureAntiPattern($currentGuild.id, config);
          break;
        case "antiMassPost":
          await administrationApi.configureAntiMassPost($currentGuild.id, config);
          break;
        case "antiPostChannel":
          await administrationApi.configureAntiPostChannel($currentGuild.id, config);
          break;
      }
      await fetchAllData();
    } catch (err) {
      logger.error(`Failed to configure ${type}:`, err);
    } finally {
      saving = false;
    }
  }

  async function toggleProtection(type: string) {
    if (!$currentGuild?.id || !protectionStatus) return;

    const isEnabled = protectionStatus[type]?.enabled;

    // When enabling, send default values that meet validation requirements
    if (!isEnabled) {
      const defaultConfigs: Record<string, any> = {
        antiRaid: {
          enabled: true,
          userThreshold: 5,
          seconds: 10,
          action: 1, // Mute = 1
          punishDuration: 60
        },
        antiSpam: {
          enabled: true,
          messageThreshold: 5,
          action: 1, // Mute = 1
          muteTime: 5,
          roleId: null
        },
        antiAlt: {
          enabled: true,
          minAgeMinutes: 1440,
          action: 2, // Kick = 2
          actionDurationMinutes: 0,
          roleId: null
        },
        antiMassMention: {
          enabled: true,
          mentionThreshold: 5,
          timeWindowSeconds: 30,
          maxMentionsInTimeWindow: 10,
          ignoreBots: true,
          action: 1, // Mute = 1
          muteTime: 5,
          roleId: null
        },
        antiPattern: {
          enabled: true,
          action: 1, // Mute = 1
          punishDuration: 60,
          roleId: null,
          checkAccountAge: true,
          maxAccountAgeMonths: 6,
          checkJoinTiming: true,
          maxJoinHours: 48.0,
          checkBatchCreation: true,
          checkOfflineStatus: true,
          checkNewAccounts: true,
          newAccountDays: 7,
          minimumScore: 15
        },
        antiMassPost: {
          enabled: true,
          channelThreshold: 3,
          timeWindowSeconds: 60,
          contentSimilarityThreshold: 0.8,
          minContentLength: 20,
          checkLinksOnly: true,
          checkDuplicateContent: true,
          requireIdenticalContent: false,
          caseSensitive: false,
          deleteMessages: true,
          notifyUser: true,
          action: 2, // Ban
          punishDuration: 0,
          roleId: null,
          ignoreBots: true,
          maxMessagesTracked: 50
        },
        antiPostChannel: {
          enabled: true,
          action: 2, // Ban
          punishDuration: 0,
          roleId: null,
          deleteMessages: true,
          notifyUser: true,
          ignoreBots: true
        }
      };

      await configureProtection(type, defaultConfigs[type]);
    } else {
      await configureProtection(type, { enabled: false });
    }
  }

  function toggleProtectionCard(type: string) {
    if (expandedProtectionCard === type) {
      expandedProtectionCard = null;
      tempProtectionConfig = {};
    } else {
      expandedProtectionCard = type;
      tempProtectionConfig = { ...protectionStatus[type] };
      // Convert action to string for DiscordSelector
      tempProtectionConfig.action = tempProtectionConfig.action?.toString() || "0";
    }
  }

  function cancelProtectionEdit() {
    expandedProtectionCard = null;
    tempProtectionConfig = {};
  }

  function saveProtectionConfig() {
    if (!expandedProtectionCard) return;
    // Convert action back to number for API
    const config = { ...tempProtectionConfig };
    config.action = parseInt(config.action) || 0;
    configureProtection(expandedProtectionCard, config);
    expandedProtectionCard = null;
  }

  async function saveHoneypotChannels() {
    if (!$currentGuild?.id) return;

    try {
      saving = true;
      // Get current channels from backend
      const currentChannels = protectionStatus.antiPostChannel.channels || [];
      const selectedIds = selectedHoneypotChannels.map(c => BigInt(c));

      // Add new channels
      for (const channelId of selectedIds) {
        if (!currentChannels.some((c: any) => c === channelId)) {
          await administrationApi.addAntiPostChannel($currentGuild.id, channelId);
        }
      }

      // Remove deselected channels
      for (const channelId of currentChannels) {
        if (!selectedIds.some(id => id === channelId)) {
          await administrationApi.removeAntiPostChannel($currentGuild.id, channelId);
        }
      }

      await fetchAllData();
    } catch (err) {
      logger.error("Failed to save honeypot channels:", err);
    } finally {
      saving = false;
    }
  }

  async function saveIgnoredRoles() {
    if (!$currentGuild?.id) return;

    try {
      saving = true;
      // Get current roles from backend
      const currentRoles = protectionStatus.antiPostChannel.ignoredRoles || [];
      const selectedIds = selectedIgnoredRoles.map(r => BigInt(r));

      // Add new roles
      for (const roleId of selectedIds) {
        if (!currentRoles.some((r: any) => r === roleId)) {
          await administrationApi.toggleAntiPostChannelIgnoredRole($currentGuild.id, roleId);
        }
      }

      // Remove deselected roles
      for (const roleId of currentRoles) {
        if (!selectedIds.some(id => id === roleId)) {
          await administrationApi.toggleAntiPostChannelIgnoredRole($currentGuild.id, roleId);
        }
      }

      await fetchAllData();
    } catch (err) {
      logger.error("Failed to save ignored roles:", err);
    } finally {
      saving = false;
    }
  }

  async function addIgnoredUser() {
    if (!$currentGuild?.id || !selectedIgnoredUsers) return;

    try {
      saving = true;
      await administrationApi.toggleAntiPostChannelIgnoredUser($currentGuild.id, BigInt(selectedIgnoredUsers));
      selectedIgnoredUsers = "";
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to add ignored user:", err);
    } finally {
      saving = false;
    }
  }

  // Permission Functions
  async function addPermissionOverride() {
    if (!$currentGuild?.id || !newPermissionOverride.command || !newPermissionOverride.permission) return;

    try {
      saving = true;
      await administrationApi.addPermissionOverride($currentGuild.id, {
        command: newPermissionOverride.command,
        permission: newPermissionOverride.permission
      });
      newPermissionOverride = { command: "", permission: "Administrator" };
      expandedRoleCard = null;
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to add permission override:", err);
    } finally {
      saving = false;
    }
  }

  async function removePermissionOverride(command: string) {
    if (!$currentGuild?.id) return;

    try {
      await administrationApi.removePermissionOverride($currentGuild.id, command);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to remove permission override:", err);
    }
  }

  async function resetPermissionOverrides() {
    if (!$currentGuild?.id) return;

    try {
      await administrationApi.clearAllPermissionOverrides($currentGuild.id);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to reset permission overrides:", err);
    }
  }

  // Command Cooldown Functions
  async function addCommandCooldown() {
    if (!$currentGuild?.id || !newCommandCooldown.command || newCommandCooldown.seconds <= 0) return;

    try {
      saving = true;
      await administrationApi.setCommandCooldown($currentGuild.id, newCommandCooldown.command, newCommandCooldown.seconds);
      newCommandCooldown = { command: "", seconds: 5 };
      expandedRoleCard = null;
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to add command cooldown:", err);
    } finally {
      saving = false;
    }
  }

  async function removeCommandCooldown(command: string) {
    if (!$currentGuild?.id || !command) return;

    try {
      await administrationApi.removeCommandCooldown($currentGuild.id, command);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to remove command cooldown:", err);
    }
  }

  // Advanced Operations Functions
  async function saveBanMessage() {
    if (!$currentGuild?.id) return;

    try {
      saving = true;
      const messageToSend = typeof banMessage === "object" && Object.keys(banMessage).length > 0
        ? JSON.stringify(banMessage)
        : (typeof banMessage === "string" ? banMessage : "");
      await administrationApi.setBanMessage($currentGuild.id, { message: messageToSend });
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to save ban message:", err);
    } finally {
      saving = false;
    }
  }


  // Anti-Pattern Pattern Management
  async function addAntiPatternPattern() {
    if (!$currentGuild?.id || !newPattern.name.trim() || !newPattern.pattern.trim()) return;

    try {
      saving = true;
      await protectionApi.addAntiPatternPattern(
        $currentGuild.id,
        newPattern.pattern,
        newPattern.name,
        newPattern.checkUsername,
        newPattern.checkDisplayName
      );

      newPattern = { name: "", pattern: "", checkUsername: true, checkDisplayName: false };
      showPatternManagement = false;
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to add anti-pattern pattern:", err);
    } finally {
      saving = false;
    }
  }

  async function removeAntiPatternPattern(patternId: number) {
    if (!$currentGuild?.id) return;

    try {
      await protectionApi.removeAntiPatternPattern($currentGuild.id, patternId);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to remove anti-pattern pattern:", err);
    }
  }

  // Utility Functions
  function formatAction(action: string | number) {
    if (typeof action === 'number') {
      const actions = ["Mute", "Kick", "Ban", "Softban", "RemoveRoles", "ChatMute", "VoiceMute", "AddRole", "Delete", "Warn", "Timeout"];
      return actions[action] || "Unknown";
    }
    return action || "Unknown";
  }

  onMount(() => {
    fetchAllData();
  });

  $effect(() => {
    if ($currentGuild) {
      fetchAllData();
    }
  });
</script>

<DashboardPageLayout
  title="Administration"
  subtitle="Manage all server administration settings and features"
  icon="fa-gear"
  guildName={$currentGuild?.name || "Dashboard"}
  tabs={tabs}
  bind:activeTab
>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2" style="border-color: {$colorStore.primary}"></div>
      <span class="ml-3" style="color: {$colorStore.text}">Loading administration data...</span>
    </div>
  {:else if error}
    <div class=" p-6 rounded-xl mb-6 transition-all" role="alert"
         style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}40;">
      <div class="flex items-center gap-3">
        <i class="fa-utility-duo fa-regular fa-triangle-exclamation" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
        <div style="color: {$colorStore.accent}">
          <div class="font-semibold text-lg">Error Occurred</div>
          <div class="text-sm mt-1" style="color: {$colorStore.accent}90">{error}</div>
        </div>
      </div>
    </div>
  {:else}

    {#if activeTab === 'overview'}
      <OverviewTab
        {protectionStatus}
        {selfAssignableRoles}
        {autoAssignRoles}
        {commandCooldowns}
        {staffRole}
        {memberRole}
        {guildTimezone}
        {gameVoiceChannel}
        {availableRoles}
        {guildChannels}
        bind:activeTab
      />
    {/if}

    {#if activeTab === 'protection'}
      <ProtectionTab
        {protectionStatus}
        bind:expandedProtectionCard
        bind:tempProtectionConfig
        bind:showPatternManagement
        {antiPatternPatterns}
        bind:newPattern
        bind:selectedHoneypotChannels
        bind:selectedIgnoredRoles
        bind:selectedIgnoredUsers
        {actionOptions}
        {textChannels}
        {availableRoles}
        {saving}
        {toggleProtection}
        {toggleProtectionCard}
        {cancelProtectionEdit}
        {saveProtectionConfig}
        {saveHoneypotChannels}
        {saveIgnoredRoles}
        {addIgnoredUser}
        {fetchAllData}
        {formatAction}
        {addAntiPatternPattern}
        {removeAntiPatternPattern}
      />
    {/if}

    {#if activeTab === 'roles'}
      <RolesTab
        {autoAssignRoles}
        bind:selectedNormalRoles
        bind:selectedBotRoles
        {autoBanRoles}
        {selfAssignableRoles}
        {voiceChannelRoles}
        {reactionRoles}
        bind:expandedRoleCard
        bind:newAutoBanRole
        bind:newVoiceChannelRole
        {availableRoles}
        {voiceChannels}
        {textChannels}
        {saving}
        {saveNormalRoles}
        {saveBotRoles}
        {showConfirm}
        {removeAutoBanRole}
        {addAutoBanRole}
        {toggleSelfAssignableRolesExclusive}
        {removeVoiceChannelRole}
        {addVoiceChannelRole}
        {fetchAllData}
      />
    {/if}

    {#if activeTab === 'automation'}
      <AutomationTab
        {staffRole}
        {memberRole}
        bind:newStaffRole
        bind:newMemberRole
        {guildTimezone}
        bind:newTimezone
        {availableTimezones}
        {gameVoiceChannel}
        {commandCooldowns}
        {permissionOverrides}
        bind:expandedRoleCard
        bind:newCommandCooldown
        bind:newPermissionOverride
        bind:newVoiceChannelRole
        {selectedPermissionOverrides}
        {availableRoles}
        {voiceChannels}
        {guildChannels}
        {textChannels}
        {availableCommands}
        {availablePermissions}
        {saving}
        {saveServerSettings}
        {removeCommandCooldown}
        {addCommandCooldown}
        {showConfirm}
        {removePermissionOverride}
        {addPermissionOverride}
        {resetPermissionOverrides}
        {deleteSelectedPermissionOverrides}
        {toggleGameVoiceChannel}
        {fetchAllData}
      />
    {/if}

    {#if activeTab === 'advanced'}
      <AdvancedTab
        bind:banMessage
        {textChannels}
        {saving}
        {saveBanMessage}
        {showConfirm}
        {fetchAllData}
        guildId={$currentGuild?.id}
        user={data.user}
      />
    {/if}
  {/if}
</DashboardPageLayout>

<ConfirmationModal
  bind:isOpen={showConfirmModal}
  title={confirmModalData.title}
  message={confirmModalData.message}
  variant={confirmModalData.variant}
  oncancel={() => showConfirmModal = false}
  onconfirm={() => confirmModalData.action?.()}
/>

<style lang="postcss">
    @reference '../../../app.css';
</style>
