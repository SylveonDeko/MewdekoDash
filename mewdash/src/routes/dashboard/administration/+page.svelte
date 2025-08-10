<!-- routes/dashboard/administration/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { 
    AlertTriangle, Bot, CheckCircle, Settings, Shield, UserCheck, Users, 
    Clock, Globe, BarChart3, ShieldCheck, Mic, Hash, Key, Crown,
    ToggleLeft, ToggleRight, Plus, X, Search, Trash2, Edit3, Save,
    Volume2, MessageSquare, Filter, Link2, RefreshCw, Database,
    AtSign, Zap, Timer, Eye, EyeOff, Gamepad2, Check
  } from "lucide-svelte";
  import { fly } from "svelte/transition";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { loadingStore } from "$lib/stores/loadingStore";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";

  export let data;

  let loading = true;
  let error: string | null = null;
  let saving = false;
  
  // Layout state
  let activeTab = "server";
  
  const tabs = [
    { id: "server", label: "Server Management", icon: Settings },
    { id: "roles", label: "Auto-Assign Roles", icon: Users },
    { id: "protection", label: "Protection Systems", icon: Shield },
    { id: "rolemanagement", label: "Role Management", icon: UserCheck },
    { id: "permissions", label: "Permissions", icon: Key },
    { id: "cooldowns", label: "Command Cooldowns", icon: Timer },
    { id: "advanced", label: "Advanced Operations", icon: Zap }
  ];

  // Server Management
  let staffRole: bigint | null = null;
  let memberRole: bigint | null = null;
  let guildTimezone: string = "UTC";
  let availableTimezones: Array<{ id: string; displayName: string; offset: string }> = [];
  let deleteMessageOnCommand: { enabled: boolean; channels: Array<{ channelId: bigint; state: boolean; }> } = { enabled: false, channels: [] };
  let gameVoiceChannel: bigint | null = null;

  // Auto-assign roles
  let autoAssignRoles: { normalRoles: bigint[]; botRoles: bigint[] } = { normalRoles: [], botRoles: [] };
  let autoBanRoles: Array<{ roleId: bigint; roleName: string }> = [];
  let selectedNormalRoles: string[] = [];
  let selectedBotRoles: string[] = [];

  // Protection settings
  let protectionStatus: any = {
    antiRaid: { enabled: false, userThreshold: 5, seconds: 10, action: "Mute", punishDuration: 60 },
    antiSpam: { enabled: false, messageThreshold: 5, action: "Mute", muteTime: 5, roleId: null },
    antiAlt: { enabled: false, minAgeMinutes: 1440, action: "Kick", actionDurationMinutes: 0, roleId: null },
    antiMassMention: { enabled: false, mentionThreshold: 5, timeWindowSeconds: 30, maxMentionsInTimeWindow: 10, ignoreBots: true, action: "Mute", muteTime: 5, roleId: null }
  };

  // Protection form data
  let editingProtection: string | null = null;
  let tempProtectionConfig: any = {};

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
  } = { exclusive: false, roles: [], groups: {} };
  let voiceChannelRoles: Array<{ channelId: bigint; channelName: string; roleId: bigint; roleName: string }> = [];
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
  } = { success: false, reactionRoles: [] };

  // Permission Overrides
  let permissionOverrides: Array<{ command: string; permission: string }> = [];
  
  // Command Cooldowns
  let commandCooldowns: Array<{ command: string; cooldown: number }> = [];

  // Advanced Operations
  let banMessage: string = "";
  let massOperations = {
    prune: { days: 7 }
  };

  // Available data
  let availableRoles: any[] = [];
  let guildChannels: any[] = [];
  let textChannels: Array<{ id: string; name: string }> = [];
  let voiceChannels: Array<{ id: string; name: string }> = [];
  let availableCommands: Array<{ id: string; name: string; label?: string }> = [];
  let availablePermissions: Array<{ id: string; name: string }> = [];
  let actionOptions = [
    { id: "0", name: "Warn", label: "Warn" },
    { id: "1", name: "Mute", label: "Mute" },
    { id: "2", name: "Kick", label: "Kick" },
    { id: "3", name: "Ban", label: "Ban" }
  ];

  // UI State
  let showAddRoleModal = false;
  let showAddAutoBanRoleModal = false;
  let showAddVoiceChannelRoleModal = false;
  let showAddPermissionOverrideModal = false;
  let showAddCommandCooldownModal = false;
  let showDeleteMessageChannelModal = false;
  let showConfirmModal = false;
  let confirmModalData = { title: "", message: "", action: null, variant: "danger" };

  // Form data
  let newStaffRole: string | null = null;
  let newMemberRole: string | null = null;
  let newTimezone = "";
  let newAutoBanRole: string | null = null;
  let newVoiceChannelRole: { channelId: string | null; roleId: string | null } = { channelId: null, roleId: null };
  let newPermissionOverride: { command: string; permission: string } = { command: "", permission: "Administrator" };
  let selectedPermissionOverrides: string[] = [];
  let selectAllPermissionOverrides = false;
  let newCommandCooldown: { command: string; seconds: number } = { command: "", seconds: 5 };
  let newDeleteMessageChannel: { channelId: string | null; state: string } = { channelId: null, state: "enable" };
  let searchQuery = "";

  async function fetchAllData() {
    if (!$currentGuild?.id) return;

    return await loadingStore.wrap("fetch-admin-data", async () => {
      try {
        loading = true;

        const [
          autoAssignData, protectionData, selfAssignData, rolesData, textChannelsData, voiceChannelsData,
          staffRoleData, memberRoleData, timezoneData, timezonesData,
          deleteMsgData, gameVoiceData,
          autoBanRolesData, voiceChannelRolesData, reactionRolesData,
          permissionOverridesData, commandsAndModulesData, commandCooldownsData,
          banMessageData
        ] = await Promise.all([
          api.getAutoAssignRoles($currentGuild.id),
          api.getProtectionStatus($currentGuild.id),
          api.getSelfAssignableRoles($currentGuild.id),
          api.getGuildRoles($currentGuild.id),
          api.getGuildChannels($currentGuild.id, 0), // Text channels
          api.getGuildChannels($currentGuild.id, 1), // Voice channels
          api.getStaffRole($currentGuild.id),
          api.getMemberRole($currentGuild.id),
          api.getGuildTimezone($currentGuild.id),
          api.getAvailableTimezones($currentGuild.id),
          api.getDeleteMessageOnCommand($currentGuild.id),
          api.getGameVoiceChannel($currentGuild.id),
          api.getAutoBanRoles($currentGuild.id),
          api.getVoiceChannelRoles($currentGuild.id),
          api.getReactionRoles($currentGuild.id),
          api.getPermissionOverrides($currentGuild.id),
          api.getCommandsAndModules(),
          api.getCommandCooldowns($currentGuild.id),
          api.getBanMessage($currentGuild.id)
        ]);

        // Server Management
        staffRole = staffRoleData && staffRoleData !== BigInt(0) ? staffRoleData : null;
        memberRole = memberRoleData && memberRoleData !== BigInt(0) ? memberRoleData : null;
        
        // Pre-populate selector values
        const staffRoleString = staffRole ? staffRole.toString() : null;
        const memberRoleString = memberRole ? memberRole.toString() : null;
        newStaffRole = staffRoleString;
        newMemberRole = memberRoleString;
        // Handle timezone data that might be wrapped in an object
        if (timezoneData && typeof timezoneData === 'object' && 'data' in timezoneData) {
          guildTimezone = timezoneData.data || "UTC";
        } else {
          guildTimezone = timezoneData || "UTC";
        }
        // Transform timezone data to match DiscordSelector's expected format
        availableTimezones = (timezonesData || []).map(tz => ({
          id: tz.id,
          name: tz.id,
          label: tz.displayName,
          offset: tz.offset
        }));
        // Find the timezone ID from the available timezones that matches the current timezone
        // The API might return abbreviated timezone like "EST" so we need to find the matching full timezone
        const currentTimezoneOption = availableTimezones.find(tz => 
          tz.id === guildTimezone || 
          tz.label.includes(guildTimezone) ||
          tz.id.includes(guildTimezone)
        );
        newTimezone = currentTimezoneOption ? currentTimezoneOption.id : (guildTimezone || "UTC");
        deleteMessageOnCommand = deleteMsgData || { enabled: false, channels: [] };
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
          antiMassMention: { enabled: false }
        };

        // Role Management
        selfAssignableRoles = selfAssignData || { exclusive: false, roles: [], groups: {} };
        voiceChannelRoles = voiceChannelRolesData || [];
        reactionRoles = reactionRolesData || { success: false, reactionRoles: [] };

        // Permissions
        permissionOverrides = permissionOverridesData || [];
        
        // Command Cooldowns
        commandCooldowns = commandCooldownsData || [];

        // Advanced Operations
        banMessage = banMessageData || "";
        
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
          const currentTimezoneOption = availableTimezones.find(tz => 
            tz.id === guildTimezone || 
            tz.label.includes(guildTimezone) ||
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

  function getRoleName(roleId: bigint | null): string {
    if (!roleId) return "None";
    const role = availableRoles.find(r => BigInt(r.id) === roleId);
    return role ? role.name : `Role ${roleId.toString()}`;
  }

  function getChannelName(channelId: bigint | null): string {
    if (!channelId) return "None";
    const channel = guildChannels.find(c => BigInt(c.id) === channelId);
    return channel ? channel.name : `Channel ${channelId.toString()}`;
  }


  function formatDuration(minutes: number): string {
    if (minutes === 0) return "Permanent";
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
  }

  function showConfirm(title: string, message: string, action: () => void, variant = "danger") {
    confirmModalData = { title, message, action, variant };
    showConfirmModal = true;
  }

  function handleNormalRolesChange(event: CustomEvent) {
    selectedNormalRoles = Array.isArray(event.detail.selected) ? event.detail.selected : [];
  }

  function handleBotRolesChange(event: CustomEvent) {
    selectedBotRoles = Array.isArray(event.detail.selected) ? event.detail.selected : [];
  }

  async function saveNormalRoles() {
    if (!$currentGuild?.id) return;
    
    try {
      saving = true;
      const roleIds = selectedNormalRoles.map(id => BigInt(id));
      await api.setAutoAssignRoles($currentGuild.id, roleIds);
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
      await api.setBotAutoAssignRoles($currentGuild.id, roleIds);
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
        promises.push(api.setStaffRole($currentGuild.id, BigInt(newStaffRole)));
      }
      
      if (newMemberRole && newMemberRole !== (memberRole?.toString() || null)) {
        promises.push(api.setMemberRole($currentGuild.id, BigInt(newMemberRole)));
      }
      
      if (newTimezone && newTimezone !== guildTimezone) {
        promises.push(api.setGuildTimezone($currentGuild.id, newTimezone));
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

  async function toggleDeleteMessageOnCommand() {
    if (!$currentGuild?.id) return;
    
    try {
      await api.toggleDeleteMessageOnCommand($currentGuild.id);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to toggle delete message on command:", err);
    }
  }

  async function toggleGameVoiceChannel(channelId: bigint) {
    if (!$currentGuild?.id) return;
    
    try {
      await api.toggleGameVoiceChannel($currentGuild.id, channelId);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to toggle game voice channel:", err);
    }
  }

  async function toggleStatsOptOut() {
    if (!$currentGuild?.id) return;
    
    try {
      await api.toggleStatsOptOut($currentGuild.id);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to toggle stats opt-out:", err);
    }
  }

  async function deleteStatsData() {
    if (!$currentGuild?.id) return;
    
    try {
      await api.deleteStatsData($currentGuild.id);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to delete stats data:", err);
    }
  }

  async function addAutoBanRole() {
    if (!$currentGuild?.id || !newAutoBanRole) return;
    
    try {
      await api.addAutoBanRole($currentGuild.id, BigInt(newAutoBanRole));
      await fetchAllData();
      showAddAutoBanRoleModal = false;
      newAutoBanRole = null;
    } catch (err) {
      logger.error("Failed to add auto-ban role:", err);
    }
  }

  async function removeAutoBanRole(roleId: bigint) {
    if (!$currentGuild?.id) return;
    
    try {
      await api.removeAutoBanRole($currentGuild.id, roleId);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to remove auto-ban role:", err);
    }
  }

  async function addVoiceChannelRole() {
    if (!$currentGuild?.id || !newVoiceChannelRole.channelId || !newVoiceChannelRole.roleId) return;
    
    try {
      await api.addVoiceChannelRole($currentGuild.id, BigInt(newVoiceChannelRole.channelId), BigInt(newVoiceChannelRole.roleId));
      await fetchAllData();
      showAddVoiceChannelRoleModal = false;
      newVoiceChannelRole = { channelId: null, roleId: null };
    } catch (err) {
      logger.error("Failed to add voice channel role:", err);
    }
  }

  async function removeVoiceChannelRole(channelId: bigint) {
    if (!$currentGuild?.id) return;
    
    try {
      await api.removeVoiceChannelRole($currentGuild.id, channelId);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to remove voice channel role:", err);
    }
  }

  async function toggleSelfAssignableRolesExclusive() {
    if (!$currentGuild?.id) return;
    
    try {
      await api.toggleSelfAssignableRolesExclusive($currentGuild.id);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to toggle self-assignable roles exclusivity:", err);
    }
  }


  function togglePermissionOverrideSelection(command: string) {
    if (selectedPermissionOverrides.includes(command)) {
      selectedPermissionOverrides = selectedPermissionOverrides.filter(c => c !== command);
    } else {
      selectedPermissionOverrides = [...selectedPermissionOverrides, command];
    }
    selectAllPermissionOverrides = selectedPermissionOverrides.length === permissionOverrides.length;
  }

  function toggleSelectAllPermissionOverrides() {
    if (selectAllPermissionOverrides) {
      selectedPermissionOverrides = [];
      selectAllPermissionOverrides = false;
    } else {
      selectedPermissionOverrides = permissionOverrides.map(p => p.command);
      selectAllPermissionOverrides = true;
    }
  }

  async function deleteSelectedPermissionOverrides() {
    if (!$currentGuild?.id || selectedPermissionOverrides.length === 0) return;
    
    try {
      await Promise.all(
        selectedPermissionOverrides.map(command => {
          const override = permissionOverrides.find(o => o.command === command);
          return api.removePermissionOverride($currentGuild.id, command, override?.permission || "");
        })
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
          await api.configureAntiRaid($currentGuild.id, config);
          break;
        case "antiSpam":
          await api.configureAntiSpam($currentGuild.id, config);
          break;
        case "antiAlt":
          await api.configureAntiAlt($currentGuild.id, config);
          break;
        case "antiMassMention":
          await api.configureAntiMassMention($currentGuild.id, config);
          break;
      }
      await fetchAllData();
      editingProtection = null;
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
      const defaultConfigs = {
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
        }
      };
      
      await configureProtection(type, defaultConfigs[type]);
    } else {
      await configureProtection(type, { enabled: false });
    }
  }

  function startEditProtection(type: string) {
    editingProtection = type;
    tempProtectionConfig = { ...protectionStatus[type] };
    // Convert action to string for DiscordSelector
    tempProtectionConfig.action = tempProtectionConfig.action?.toString() || "0";
  }

  function cancelEditProtection() {
    editingProtection = null;
    tempProtectionConfig = {};
  }

  function saveProtectionConfig() {
    if (!editingProtection) return;
    // Convert action back to number for API
    const config = { ...tempProtectionConfig };
    config.action = parseInt(config.action) || 0;
    configureProtection(editingProtection, config);
  }

  // Permission Functions
  async function addPermissionOverride() {
    if (!$currentGuild?.id || !newPermissionOverride.command || !newPermissionOverride.permission) return;

    try {
      saving = true;
      await api.addPermissionOverride($currentGuild.id, newPermissionOverride.command, newPermissionOverride.permission);
      newPermissionOverride = { command: "", permission: "Administrator" };
      showAddPermissionOverrideModal = false;
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to add permission override:", err);
    } finally {
      saving = false;
    }
  }

  async function removePermissionOverride(command: string, permission: string) {
    if (!$currentGuild?.id) return;

    try {
      await api.removePermissionOverride($currentGuild.id, command, permission);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to remove permission override:", err);
    }
  }

  async function resetPermissionOverrides() {
    if (!$currentGuild?.id) return;

    try {
      await api.resetPermissionOverrides($currentGuild.id);
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
      await api.setCommandCooldown($currentGuild.id, newCommandCooldown.command, newCommandCooldown.seconds);
      newCommandCooldown = { command: "", seconds: 5 };
      showAddCommandCooldownModal = false;
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
      await api.removeCommandCooldown($currentGuild.id, command);
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
      await api.setBanMessage($currentGuild.id, banMessage);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to save ban message:", err);
    } finally {
      saving = false;
    }
  }

  async function performPrune() {
    if (!$currentGuild?.id || massOperations.prune.days <= 0) return;

    try {
      saving = true;
      const result = await api.pruneUsers($currentGuild.id, massOperations.prune.days);
      await fetchAllData();
      return result;
    } catch (err) {
      logger.error("Failed to prune users:", err);
      throw err;
    } finally {
      saving = false;
    }
  }

  // Utility Functions
  function formatAction(action: string | number) {
    if (typeof action === 'number') {
      const actions = ["Warn", "Mute", "Kick", "Ban", "AddRole", "RemoveRole"];
      return actions[action] || "Unknown";
    }
    return action || "Unknown";
  }

  onMount(() => {
    fetchAllData();
  });

  $: if ($currentGuild) {
    fetchAllData();
  }

  $: filteredRoles = availableRoles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: filteredChannels = guildChannels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
</script>

<DashboardPageLayout 
  title="Administration" 
  subtitle="Manage all server administration settings and features" 
  icon={Settings}
  guildName={$currentGuild?.name || "Dashboard"}
  tabs={tabs}
  bind:activeTab
  on:tabChange={(e) => activeTab = e.detail.tabId}
>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2" style="border-color: {$colorStore.primary}"></div>
      <span class="ml-3" style="color: {$colorStore.text}">Loading administration data...</span>
    </div>
  {:else if error}
    <div class="p-6 rounded-xl mb-6 transition-all" role="alert"
         style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}40;">
      <div class="flex items-center gap-3">
        <AlertTriangle class="w-6 h-6" style="color: {$colorStore.accent}" />
        <div style="color: {$colorStore.accent}">
          <div class="font-semibold text-lg">Error Occurred</div>
          <div class="text-sm mt-1" style="color: {$colorStore.accent}90">{error}</div>
        </div>
      </div>
    </div>
  {:else}

    {#if activeTab === 'server'}
      <!-- Server Management Section -->
      <div class="space-y-6">
        
        <!-- Staff & Member Roles -->
        <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 300, delay: 100 }}>

          <div class="flex items-center gap-4 mb-6">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <Crown class="w-6 h-6" style="color: {$colorStore.primary}" />
            </div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Staff & Member Roles</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <label class="block text-sm font-medium" style="color: {$colorStore.text}">
                Staff Role
              </label>
              <DiscordSelector
                type="role"
                options={availableRoles}
                bind:selected={newStaffRole}
                placeholder="Select staff role..."
                multiple={false}
              />
              <p class="text-xs" style="color: {$colorStore.muted}">
                Role that grants administrative permissions
              </p>
            </div>

            <div class="space-y-4">
              <label class="block text-sm font-medium" style="color: {$colorStore.text}">
                Member Role
              </label>
              <DiscordSelector
                type="role"
                options={availableRoles}
                bind:selected={newMemberRole}
                placeholder="Select member role..."
                multiple={false}
              />
              <p class="text-xs" style="color: {$colorStore.muted}">
                Role assigned to regular server members
              </p>
            </div>
          </div>

          {#if (newStaffRole && newStaffRole !== (staffRole?.toString() || null)) || (newMemberRole && newMemberRole !== (memberRole?.toString() || null))}
            <div class="mt-6 flex justify-end">
              <button
                class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                on:click={saveServerSettings}
                disabled={saving}
              >
                {#if saving}
                  <RefreshCw class="w-4 h-4 animate-spin" />
                {:else}
                  <Save class="w-4 h-4" />
                {/if}
                Save Changes
              </button>
            </div>
          {/if}
        </div>

        <!-- Timezone Settings -->
        <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 300, delay: 200 }}>

          <div class="flex items-center gap-4 mb-6">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <Globe class="w-6 h-6" style="color: {$colorStore.primary}" />
            </div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Timezone Settings</h2>
          </div>

          <div class="space-y-4">
            <label class="block text-sm font-medium" style="color: {$colorStore.text}">
              Server Timezone
            </label>
            <DiscordSelector
              type="timezone"
              options={availableTimezones}
              bind:selected={newTimezone}
              placeholder="Select server timezone..."
              multiple={false}
            />
            <p class="text-xs" style="color: {$colorStore.muted}">
              Timezone used for time-based features and logging
            </p>
          </div>

          {#if newTimezone && newTimezone !== guildTimezone}
            <div class="mt-6 flex justify-end">
              <button
                class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                on:click={saveServerSettings}
                disabled={saving}
              >
                {#if saving}
                  <RefreshCw class="w-4 h-4 animate-spin" />
                {:else}
                  <Save class="w-4 h-4" />
                {/if}
                Save Timezone
              </button>
            </div>
          {/if}
        </div>

        <!-- Delete Message on Command -->
        <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 300, delay: 300 }}>

          <div class="flex items-center gap-4 mb-6">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <MessageSquare class="w-6 h-6" style="color: {$colorStore.primary}" />
            </div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Delete Message on Command</h2>
          </div>

          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="font-medium" style="color: {$colorStore.text}">Global Setting</p>
              <p class="text-sm" style="color: {$colorStore.muted}">
                Automatically delete command messages
              </p>
            </div>
            <button
              class="p-2 rounded-lg transition-colors"
              style="color: {deleteMessageOnCommand.enabled ? $colorStore.secondary : $colorStore.muted}"
              on:click={toggleDeleteMessageOnCommand}
            >
              {#if deleteMessageOnCommand.enabled}
                <ToggleRight class="w-8 h-8" />
              {:else}
                <ToggleLeft class="w-8 h-8" />
              {/if}
            </button>
          </div>

          {#if deleteMessageOnCommand.channels && deleteMessageOnCommand.channels.length > 0}
            <div class="space-y-2">
              <p class="text-sm font-medium" style="color: {$colorStore.text}">Channel Overrides</p>
              {#each deleteMessageOnCommand.channels as channel}
                <div class="flex items-center justify-between p-3 rounded-lg" 
                     style="background: {$colorStore.primary}05; border: 1px solid {$colorStore.primary}20;">
                  <span style="color: {$colorStore.text}">
                    #{getChannelName(channel.channelId)}
                  </span>
                  <span class="text-sm" style="color: {channel.state ? $colorStore.secondary : $colorStore.accent}">
                    {channel.state ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Game Voice Channel -->
        <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 300, delay: 400 }}>

          <div class="flex items-center gap-4 mb-6">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <Gamepad2 class="w-6 h-6" style="color: {$colorStore.primary}" />
            </div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Game Voice Channel</h2>
          </div>

          <div class="space-y-4">
            <p class="text-sm" style="color: {$colorStore.muted}">
              Automatically move users to matching voice channels based on their game activity
            </p>
            
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium" style="color: {$colorStore.text}">
                  Current Channel: {gameVoiceChannel ? getChannelName(gameVoiceChannel) : "None"}
                </p>
              </div>
              
              {#if gameVoiceChannel}
                <button
                  class="px-4 py-2 rounded-lg font-medium transition-colors"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                  on:click={() => toggleGameVoiceChannel(gameVoiceChannel)}
                >
                  Disable
                </button>
              {/if}
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium" style="color: {$colorStore.text}">
                Set Game Voice Channel
              </label>
              <DiscordSelector
                type="channel"
                options={voiceChannels}
                bind:selected={newVoiceChannelRole.channelId}
                placeholder="Select voice channel..."
                multiple={false}
              />
              <p class="text-xs" style="color: {$colorStore.muted}">
                Select voice channel for automatic game-based voice routing
              </p>
              
              {#if newVoiceChannelRole.channelId}
                <button
                  class="px-4 py-2 rounded-lg font-medium transition-colors"
                  style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                  on:click={() => toggleGameVoiceChannel(BigInt(newVoiceChannelRole.channelId))}
                >
                  Set as Game Voice Channel
                </button>
              {/if}
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 300, delay: 500 }}>

          <div class="flex items-center gap-4 mb-6">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <BarChart3 class="w-6 h-6" style="color: {$colorStore.primary}" />
            </div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Statistics</h2>
          </div>

          <div class="space-y-4">
            <button
              class="w-full px-4 py-3 rounded-lg font-medium transition-colors text-left"
              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
              on:click={toggleStatsOptOut}
            >
              Toggle Stats Opt-Out
            </button>
            
            <button
              class="w-full px-4 py-3 rounded-lg font-medium transition-colors text-left"
              style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
              on:click={() => showConfirm("Delete Statistics Data", "Are you sure you want to delete all statistics data for this server? This action cannot be undone.", deleteStatsData)}
            >
              <div class="flex items-center gap-2">
                <Database class="w-4 h-4" />
                Delete Stats Data
              </div>
            </button>
          </div>
        </div>
      </div>
    {/if}

    {#if activeTab === 'roles'}
      <!-- Auto-Assign Roles Section -->
      <div class="space-y-6">
        
        <!-- Normal & Bot Auto-Assign Roles -->
        <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 300, delay: 100 }}>

          <div class="flex items-center gap-4 mb-6">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <Users class="w-6 h-6" style="color: {$colorStore.primary}" />
            </div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Auto-Assign Roles</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Normal Users -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold flex items-center gap-2" style="color: {$colorStore.text}">
                <Users class="w-5 h-5" />
                Normal Users
              </h3>

              <DiscordSelector
                type="role"
                options={availableRoles}
                placeholder="Select roles to auto-assign to normal users"
                multiple={true}
                selected={selectedNormalRoles}
                on:change={handleNormalRolesChange}
              />
              <button
                class="w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                disabled={saving}
                on:click={saveNormalRoles}
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              >
                {saving ? "Saving..." : "Save Normal User Roles"}
              </button>
              <p class="text-sm" style="color: {$colorStore.muted}">
                Roles automatically assigned to new users when they join the server.
              </p>
            </div>

            <!-- Bot Users -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold flex items-center gap-2" style="color: {$colorStore.text}">
                <Bot class="w-5 h-5" />
                Bot Users
              </h3>

              <DiscordSelector
                type="role"
                options={availableRoles}
                placeholder="Select roles to auto-assign to bot users"
                multiple={true}
                selected={selectedBotRoles}
                on:change={handleBotRolesChange}
              />
              <button
                class="w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                disabled={saving}
                on:click={saveBotRoles}
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              >
                {saving ? "Saving..." : "Save Bot User Roles"}
              </button>
              <p class="text-sm" style="color: {$colorStore.muted}">
                Roles automatically assigned to bot users when they join the server.
              </p>
            </div>
          </div>
        </div>

        <!-- Auto-Ban Roles -->
        <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 300, delay: 200 }}>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-xl"
                   style="background: linear-gradient(135deg, {$colorStore.accent}20, {$colorStore.accent}30);">
                <AlertTriangle class="w-6 h-6" style="color: {$colorStore.accent}" />
              </div>
              <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Auto-Ban Roles</h2>
            </div>
            
            <button
              class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
              on:click={() => showAddAutoBanRoleModal = true}
            >
              <Plus class="w-4 h-4" />
              Add Role
            </button>
          </div>

          <div class="space-y-4">
            <p class="text-sm" style="color: {$colorStore.muted}">
              Users who receive these roles will be automatically banned from the server
            </p>

            {#if autoBanRoles.length === 0}
              <div class="text-center py-8">
                <AlertTriangle class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.accent}50" />
                <p class="text-lg font-medium" style="color: {$colorStore.text}">No auto-ban roles configured</p>
                <p class="text-sm" style="color: {$colorStore.muted}">Add roles that should trigger automatic bans</p>
              </div>
            {:else}
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each autoBanRoles as role}
                  <div
                    class="flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:shadow-lg backdrop-blur-sm border"
                    style="background: {$colorStore.accent}05; border-color: {$colorStore.accent}20;">
                    <span class="font-medium" style="color: {$colorStore.text}">
                      {role.roleName}
                    </span>
                    <button
                      class="px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80"
                      style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                      on:click={() => showConfirm("Remove Auto-Ban Role", `Are you sure you want to remove ${role.roleName} from auto-ban roles?`, () => removeAutoBanRole(role.roleId))}
                      aria-label="Remove {role.roleName} from auto-ban roles"
                    >
                      Remove
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}

    {#if activeTab === 'protection'}
      <!-- Protection Systems Section -->
      <div class="space-y-6">
        
        <!-- Anti-Raid Protection -->
        <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 300, delay: 100 }}>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-xl"
                   style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
                <Shield class="w-6 h-6" style="color: {$colorStore.primary}" />
              </div>
              <div>
                <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Anti-Raid Protection</h2>
                <p class="text-sm" style="color: {$colorStore.muted}">Protect against mass user joins</p>
              </div>
            </div>
            
            <div class="flex flex-wrap items-center gap-2">
              <button
                class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
                style="background: {protectionStatus.antiRaid.enabled ? $colorStore.accent + '20' : $colorStore.secondary + '20'}; 
                       color: {protectionStatus.antiRaid.enabled ? $colorStore.accent : $colorStore.secondary}; 
                       border: 1px solid {protectionStatus.antiRaid.enabled ? $colorStore.accent + '30' : $colorStore.secondary + '30'};"
                on:click={() => toggleProtection('antiRaid')}
              >
                {#if protectionStatus.antiRaid.enabled}
                  <ToggleRight class="w-4 h-4" />
                  Enabled
                {:else}
                  <ToggleLeft class="w-4 h-4" />
                  Disabled
                {/if}
              </button>
              
              {#if protectionStatus.antiRaid.enabled}
                <button
                  class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
                  style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                  on:click={() => startEditProtection('antiRaid')}
                >
                  <Settings class="w-4 h-4" />
                  Configure
                </button>
              {/if}
            </div>
          </div>

          {#if protectionStatus.antiRaid.enabled}
            <div class="grid grid-cols-2 gap-4 p-4 rounded-xl" style="background: {$colorStore.primary}05;">
              <div class="text-center">
                <div class="text-2xl font-bold" style="color: {$colorStore.primary}">{protectionStatus.antiRaid.userThreshold}</div>
                <div class="text-sm" style="color: {$colorStore.muted}">User Threshold</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold" style="color: {$colorStore.primary}">{protectionStatus.antiRaid.seconds}s</div>
                <div class="text-sm" style="color: {$colorStore.muted}">Time Window</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-semibold" style="color: {$colorStore.primary}">{formatAction(protectionStatus.antiRaid.action)}</div>
                <div class="text-sm" style="color: {$colorStore.muted}">Punishment</div>
              </div>
              {#if protectionStatus.antiRaid.action === 1}
                <div class="text-center">
                  <div class="text-2xl font-bold" style="color: {$colorStore.primary}">{protectionStatus.antiRaid.punishDuration}m</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Mute Duration</div>
                </div>
              {/if}
            </div>
          {:else}
            <div class="text-center py-8">
              <Shield class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
              <p class="text-lg font-medium" style="color: {$colorStore.text}">Anti-Raid Protection Disabled</p>
              <p class="text-sm" style="color: {$colorStore.muted}">Enable to protect against mass user joins</p>
            </div>
          {/if}
        </div>

        <!-- Anti-Spam Protection -->
        <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 300, delay: 200 }}>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-xl"
                   style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
                <MessageSquare class="w-6 h-6" style="color: {$colorStore.primary}" />
              </div>
              <div>
                <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Anti-Spam Protection</h2>
                <p class="text-sm" style="color: {$colorStore.muted}">Prevent message spam attacks</p>
              </div>
            </div>
            
            <div class="flex flex-wrap items-center gap-2">
              <button
                class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
                style="background: {protectionStatus.antiSpam.enabled ? $colorStore.accent + '20' : $colorStore.secondary + '20'}; 
                       color: {protectionStatus.antiSpam.enabled ? $colorStore.accent : $colorStore.secondary}; 
                       border: 1px solid {protectionStatus.antiSpam.enabled ? $colorStore.accent + '30' : $colorStore.secondary + '30'};"
                on:click={() => toggleProtection('antiSpam')}
              >
                {#if protectionStatus.antiSpam.enabled}
                  <ToggleRight class="w-4 h-4" />
                  Enabled
                {:else}
                  <ToggleLeft class="w-4 h-4" />
                  Disabled
                {/if}
              </button>
              
              {#if protectionStatus.antiSpam.enabled}
                <button
                  class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
                  style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                  on:click={() => startEditProtection('antiSpam')}
                >
                  <Settings class="w-4 h-4" />
                  Configure
                </button>
              {/if}
            </div>
          </div>

          {#if protectionStatus.antiSpam.enabled}
            <div class="grid grid-cols-2 gap-4 p-4 rounded-xl" style="background: {$colorStore.primary}05;">
              <div class="text-center">
                <div class="text-2xl font-bold" style="color: {$colorStore.primary}">{protectionStatus.antiSpam.messageThreshold}</div>
                <div class="text-sm" style="color: {$colorStore.muted}">Message Threshold</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-semibold" style="color: {$colorStore.primary}">{formatAction(protectionStatus.antiSpam.action)}</div>
                <div class="text-sm" style="color: {$colorStore.muted}">Punishment</div>
              </div>
              {#if protectionStatus.antiSpam.action === 1}
                <div class="text-center">
                  <div class="text-2xl font-bold" style="color: {$colorStore.primary}">{protectionStatus.antiSpam.muteTime}m</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Mute Duration</div>
                </div>
              {/if}
            </div>
          {:else}
            <div class="text-center py-8">
              <MessageSquare class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
              <p class="text-lg font-medium" style="color: {$colorStore.text}">Anti-Spam Protection Disabled</p>
              <p class="text-sm" style="color: {$colorStore.muted}">Enable to prevent message spam</p>
            </div>
          {/if}
        </div>

        <!-- Anti-Alt Protection -->
        <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 300, delay: 300 }}>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-xl"
                   style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
                <Timer class="w-6 h-6" style="color: {$colorStore.primary}" />
              </div>
              <div>
                <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Anti-Alt Protection</h2>
                <p class="text-sm" style="color: {$colorStore.muted}">Block young accounts</p>
              </div>
            </div>
            
            <div class="flex flex-wrap items-center gap-2">
              <button
                class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
                style="background: {protectionStatus.antiAlt.enabled ? $colorStore.accent + '20' : $colorStore.secondary + '20'}; 
                       color: {protectionStatus.antiAlt.enabled ? $colorStore.accent : $colorStore.secondary}; 
                       border: 1px solid {protectionStatus.antiAlt.enabled ? $colorStore.accent + '30' : $colorStore.secondary + '30'};"
                on:click={() => toggleProtection('antiAlt')}
              >
                {#if protectionStatus.antiAlt.enabled}
                  <ToggleRight class="w-4 h-4" />
                  Enabled
                {:else}
                  <ToggleLeft class="w-4 h-4" />
                  Disabled
                {/if}
              </button>
              
              {#if protectionStatus.antiAlt.enabled}
                <button
                  class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
                  style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                  on:click={() => startEditProtection('antiAlt')}
                >
                  <Settings class="w-4 h-4" />
                  Configure
                </button>
              {/if}
            </div>
          </div>

          {#if protectionStatus.antiAlt.enabled}
            <div class="grid grid-cols-2 gap-4 p-4 rounded-xl" style="background: {$colorStore.primary}05;">
              <div class="text-center">
                <div class="text-2xl font-bold" style="color: {$colorStore.primary}">{Math.floor(protectionStatus.antiAlt.minAgeMinutes / 1440)}</div>
                <div class="text-sm" style="color: {$colorStore.muted}">Min Account Age (days)</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-semibold" style="color: {$colorStore.primary}">{formatAction(protectionStatus.antiAlt.action)}</div>
                <div class="text-sm" style="color: {$colorStore.muted}">Punishment</div>
              </div>
              {#if protectionStatus.antiAlt.action === 1 && protectionStatus.antiAlt.actionDurationMinutes > 0}
                <div class="text-center">
                  <div class="text-2xl font-bold" style="color: {$colorStore.primary}">{protectionStatus.antiAlt.actionDurationMinutes}m</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Mute Duration</div>
                </div>
              {/if}
            </div>
          {:else}
            <div class="text-center py-8">
              <Timer class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
              <p class="text-lg font-medium" style="color: {$colorStore.text}">Anti-Alt Protection Disabled</p>
              <p class="text-sm" style="color: {$colorStore.muted}">Enable to block young accounts</p>
            </div>
          {/if}
        </div>

        <!-- Anti-Mass Mention Protection -->
        <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 300, delay: 400 }}>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-xl"
                   style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
                <AtSign class="w-6 h-6" style="color: {$colorStore.primary}" />
              </div>
              <div>
                <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Anti-Mass Mention</h2>
                <p class="text-sm" style="color: {$colorStore.muted}">Prevent mention spam</p>
              </div>
            </div>
            
            <div class="flex flex-wrap items-center gap-2">
              <button
                class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
                style="background: {protectionStatus.antiMassMention.enabled ? $colorStore.accent + '20' : $colorStore.secondary + '20'}; 
                       color: {protectionStatus.antiMassMention.enabled ? $colorStore.accent : $colorStore.secondary}; 
                       border: 1px solid {protectionStatus.antiMassMention.enabled ? $colorStore.accent + '30' : $colorStore.secondary + '30'};"
                on:click={() => toggleProtection('antiMassMention')}
              >
                {#if protectionStatus.antiMassMention.enabled}
                  <ToggleRight class="w-4 h-4" />
                  Enabled
                {:else}
                  <ToggleLeft class="w-4 h-4" />
                  Disabled
                {/if}
              </button>
              
              {#if protectionStatus.antiMassMention.enabled}
                <button
                  class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
                  style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                  on:click={() => startEditProtection('antiMassMention')}
                >
                  <Settings class="w-4 h-4" />
                  Configure
                </button>
              {/if}
            </div>
          </div>

          {#if protectionStatus.antiMassMention.enabled}
            <div class="grid grid-cols-2 gap-4 p-4 rounded-xl" style="background: {$colorStore.primary}05;">
              <div class="text-center">
                <div class="text-2xl font-bold" style="color: {$colorStore.primary}">{protectionStatus.antiMassMention.mentionThreshold}</div>
                <div class="text-sm" style="color: {$colorStore.muted}">Mention Threshold</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold" style="color: {$colorStore.primary}">{protectionStatus.antiMassMention.timeWindowSeconds}s</div>
                <div class="text-sm" style="color: {$colorStore.muted}">Time Window</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-semibold" style="color: {$colorStore.primary}">{formatAction(protectionStatus.antiMassMention.action)}</div>
                <div class="text-sm" style="color: {$colorStore.muted}">Punishment</div>
              </div>
              {#if protectionStatus.antiMassMention.action === 1}
                <div class="text-center">
                  <div class="text-2xl font-bold" style="color: {$colorStore.primary}">{protectionStatus.antiMassMention.muteTime}m</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Mute Duration</div>
                </div>
              {/if}
            </div>
          {:else}
            <div class="text-center py-8">
              <AtSign class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
              <p class="text-lg font-medium" style="color: {$colorStore.text}">Anti-Mass Mention Disabled</p>
              <p class="text-sm" style="color: {$colorStore.muted}">Enable to prevent mention spam</p>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    {#if activeTab === 'rolemanagement'}
      <!-- Role Management Section -->
      <div class="space-y-6">
        
        <!-- Self-Assignable Roles -->
        <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 300, delay: 100 }}>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-xl"
                   style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
                <UserCheck class="w-6 h-6" style="color: {$colorStore.primary}" />
              </div>
              <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Self-Assignable Roles</h2>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="text-sm" style="color: {$colorStore.text}">Exclusive</span>
              <button
                class="p-2 rounded-lg transition-all hover:scale-105 min-h-[44px] min-w-[44px]"
                style="color: {selfAssignableRoles.exclusive ? $colorStore.secondary : $colorStore.muted}"
                on:click={toggleSelfAssignableRolesExclusive}
              >
                {#if selfAssignableRoles.exclusive}
                  <ToggleRight class="w-6 h-6" />
                {:else}
                  <ToggleLeft class="w-6 h-6" />
                {/if}
              </button>
            </div>
          </div>

          {#if !Array.isArray(selfAssignableRoles.roles) || selfAssignableRoles.roles.length === 0}
            <div class="text-center py-8">
              <UserCheck class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
              <p class="text-lg font-medium" style="color: {$colorStore.text}">No self-assignable roles configured</p>
              <p class="text-sm" style="color: {$colorStore.muted}">Users can't assign roles to themselves yet</p>
            </div>
          {:else}
            <div class="space-y-4">
              {#each Object.entries(selfAssignableRoles.groups || {}) as [groupId, groupName]}
                <div class="border rounded-lg p-4" style="border-color: {$colorStore.primary}20;">
                  <h3 class="font-semibold mb-3" style="color: {$colorStore.text}">
                    Group {groupId}: {groupName || 'Unnamed'}
                  </h3>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {#each selfAssignableRoles.roles.filter(r => r.model.group === parseInt(groupId)) as role}
                      <div
                        class="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:shadow-lg backdrop-blur-sm border"
                        style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <span class="font-medium" style="color: {$colorStore.text}">
                          {role.role?.name || `Role ${role.model.roleId}`}
                          {#if role.model.levelRequirement > 0}
                            <span class="text-xs" style="color: {$colorStore.muted}">
                              (Level {role.model.levelRequirement}+)
                            </span>
                          {/if}
                        </span>
                        <button
                          class="px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80"
                          style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                          on:click={() => api.removeSelfAssignableRole($currentGuild.id, role.model.roleId).then(() => fetchAllData())}
                          aria-label="Remove {role.role?.name} from self-assignable roles"
                        >
                          Remove
                        </button>
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
              
              <!-- Ungrouped roles -->
              {#if selfAssignableRoles.roles.filter(r => r.model.group === 0).length > 0}
                <div class="border rounded-lg p-4" style="border-color: {$colorStore.primary}20;">
                  <h3 class="font-semibold mb-3" style="color: {$colorStore.text}">
                    Ungrouped Roles
                  </h3>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {#each selfAssignableRoles.roles.filter(r => r.model.group === 0) as role}
                      <div
                        class="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:shadow-lg backdrop-blur-sm border"
                        style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <span class="font-medium" style="color: {$colorStore.text}">
                          {role.role?.name || `Role ${role.model.roleId}`}
                          {#if role.model.levelRequirement > 0}
                            <span class="text-xs" style="color: {$colorStore.muted}">
                              (Level {role.model.levelRequirement}+)
                            </span>
                          {/if}
                        </span>
                        <button
                          class="px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80"
                          style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                          on:click={() => api.removeSelfAssignableRole($currentGuild.id, role.model.roleId).then(() => fetchAllData())}
                          aria-label="Remove {role.role?.name} from self-assignable roles"
                        >
                          Remove
                        </button>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Voice Channel Roles -->
        <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 300, delay: 200 }}>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-xl"
                   style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
                <Volume2 class="w-6 h-6" style="color: {$colorStore.primary}" />
              </div>
              <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Voice Channel Roles</h2>
            </div>
            
            <button
              class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
              on:click={() => showAddVoiceChannelRoleModal = true}
            >
              <Plus class="w-4 h-4" />
              Add Mapping
            </button>
          </div>

          <div class="space-y-4">
            <p class="text-sm" style="color: {$colorStore.muted}">
              Automatically assign roles when users join specific voice channels
            </p>

            {#if voiceChannelRoles.length === 0}
              <div class="text-center py-8">
                <Volume2 class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
                <p class="text-lg font-medium" style="color: {$colorStore.text}">No voice channel roles configured</p>
                <p class="text-sm" style="color: {$colorStore.muted}">Add voice channel to role mappings</p>
              </div>
            {:else}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each voiceChannelRoles as vcRole}
                  <div
                    class="flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:shadow-lg backdrop-blur-sm border"
                    style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                    <div class="space-y-1">
                      <p class="font-medium" style="color: {$colorStore.text}">
                        🔊 {vcRole.channelName}
                      </p>
                      <p class="text-sm" style="color: {$colorStore.muted}">
                        → {vcRole.roleName}
                      </p>
                    </div>
                    <button
                      class="px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80"
                      style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                      on:click={() => showConfirm("Remove Voice Channel Role", `Remove role mapping for ${vcRole.channelName}?`, () => removeVoiceChannelRole(vcRole.channelId))}
                      aria-label="Remove voice channel role mapping for {vcRole.channelName}"
                    >
                      Remove
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <!-- Reaction Roles -->
        <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 300, delay: 300 }}>

          <div class="flex items-center gap-4 mb-6">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <AtSign class="w-6 h-6" style="color: {$colorStore.primary}" />
            </div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Reaction Roles</h2>
          </div>

          <div class="space-y-4">
            <p class="text-sm" style="color: {$colorStore.muted}">
              Allow users to get roles by reacting to messages with specific emojis
            </p>

            {#if !reactionRoles.success || reactionRoles.reactionRoles.length === 0}
              <div class="text-center py-8">
                <AtSign class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
                <p class="text-lg font-medium" style="color: {$colorStore.text}">No reaction roles configured</p>
                <p class="text-sm" style="color: {$colorStore.muted}">Set up reaction-based role assignment</p>
              </div>
            {:else}
              <div class="space-y-4">
                {#each reactionRoles.reactionRoles as rr}
                  <div
                    class="p-4 rounded-lg transition-all duration-200 hover:shadow-lg backdrop-blur-sm border"
                    style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                    <div class="flex items-center justify-between mb-3">
                      <p class="font-medium" style="color: {$colorStore.text}">
                        Message ID: {rr.messageId}
                      </p>
                      <span class="text-xs px-2 py-1 rounded-full" 
                            style="background: {rr.exclusive ? $colorStore.accent + '20' : $colorStore.secondary + '20'}; 
                                   color: {rr.exclusive ? $colorStore.accent : $colorStore.secondary}">
                        {rr.exclusive ? 'Exclusive' : 'Multiple'}
                      </span>
                    </div>
                    
                    <div class="space-y-2">
                      {#each rr.reactionRoles as reaction}
                        <div class="flex items-center gap-3 text-sm" style="color: {$colorStore.muted}">
                          <span>{reaction.emoteName}</span>
                          <span>→</span>
                          <span>{getRoleName(reaction.roleId)}</span>
                        </div>
                      {/each}
                    </div>
                    
                    <div class="mt-3 flex justify-end">
                      <button
                        class="px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80"
                        style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                        on:click={() => showConfirm("Remove Reaction Role", "Remove this reaction role setup?", () => api.removeReactionRole($currentGuild.id, rr.index))}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}

    {#if activeTab === 'permissions'}
      <!-- Permissions Section -->
      <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                  border-color: {$colorStore.primary}30;"
           in:fly={{ y: 20, duration: 300, delay: 100 }}>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <Key class="w-6 h-6" style="color: {$colorStore.primary}" />
            </div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Permission Overrides</h2>
          </div>
          
          <div class="flex flex-wrap items-center gap-2">
            <button
              class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
              on:click={() => showAddPermissionOverrideModal = true}
            >
              <Plus class="w-4 h-4" />
              Add Override
            </button>
            
            {#if selectedPermissionOverrides.length > 0}
              <button
                class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
                style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                on:click={() => showConfirm("Delete Selected Overrides", `Delete ${selectedPermissionOverrides.length} selected permission override${selectedPermissionOverrides.length > 1 ? 's' : ''}?`, deleteSelectedPermissionOverrides)}
              >
                <Trash2 class="w-4 h-4" />
                Delete Selected ({selectedPermissionOverrides.length})
              </button>
            {/if}
            
            {#if permissionOverrides.length > 0}
              <button
                class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
                style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                on:click={() => showConfirm("Clear All Overrides", "Are you sure you want to clear all permission overrides?", resetPermissionOverrides)}
              >
                <Trash2 class="w-4 h-4" />
                Clear All
              </button>
            {/if}
          </div>
        </div>

        <div class="space-y-4">
          <p class="text-sm" style="color: {$colorStore.muted}">
            Override Discord permissions required for specific bot commands. Select from {availableCommands.length} available commands.
          </p>

          {#if permissionOverrides.length === 0}
            <div class="text-center py-8">
              <Key class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
              <p class="text-lg font-medium" style="color: {$colorStore.text}">No permission overrides configured</p>
              <p class="text-sm" style="color: {$colorStore.muted}">Add command permission overrides using actual bot commands</p>
            </div>
          {:else}
            <div class="space-y-3">
              <!-- Bulk Actions Header -->
              {#if permissionOverrides.length > 1}
                <div class="flex items-center justify-between p-3 rounded-lg" style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                  <button
                    class="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                    style="color: {$colorStore.text}"
                    on:click={toggleSelectAllPermissionOverrides}
                  >
                    <div class="relative flex items-center justify-center">
                      <div class="w-6 h-6 rounded border-2 transition-all duration-200 flex items-center justify-center touch-manipulation cursor-pointer hover:scale-105"
                           style="border-color: {selectAllPermissionOverrides ? $colorStore.primary : $colorStore.muted}; 
                                  background: {selectAllPermissionOverrides ? $colorStore.primary : 'transparent'};">
                        {#if selectAllPermissionOverrides}
                          <Check class="w-4 h-4 text-white" />
                        {/if}
                      </div>
                    </div>
                    {selectAllPermissionOverrides ? 'Deselect All' : 'Select All'} ({permissionOverrides.length})
                  </button>
                  
                  {#if selectedPermissionOverrides.length > 0}
                    <span class="text-xs px-2 py-1 rounded-full" style="background: {$colorStore.primary}20; color: {$colorStore.primary}">
                      {selectedPermissionOverrides.length} selected
                    </span>
                  {/if}
                </div>
              {/if}

              {#each permissionOverrides as override}
                <div
                  class="group relative p-4 rounded-lg transition-all duration-200 hover:shadow-lg backdrop-blur-sm border cursor-pointer"
                  class:selected={selectedPermissionOverrides.includes(override.command)}
                  style="background: {selectedPermissionOverrides.includes(override.command) ? $colorStore.primary + '15' : $colorStore.primary + '05'}; 
                         border-color: {selectedPermissionOverrides.includes(override.command) ? $colorStore.primary + '40' : $colorStore.primary + '20'};"
                  on:click={() => togglePermissionOverrideSelection(override.command)}
                  role="button"
                  tabindex="0"
                >
                  
                  <!-- Selection Indicator -->
                  <div class="absolute top-3 left-3 flex items-center justify-center">
                    <div class="w-8 h-8 rounded border-2 transition-all duration-200 flex items-center justify-center touch-manipulation cursor-pointer hover:scale-105"
                         style="border-color: {selectedPermissionOverrides.includes(override.command) ? $colorStore.primary : $colorStore.muted + '50'}; 
                                background: {selectedPermissionOverrides.includes(override.command) ? $colorStore.primary : 'transparent'};">
                      {#if selectedPermissionOverrides.includes(override.command)}
                        <Check class="w-5 h-5 text-white" />
                      {/if}
                    </div>
                  </div>
                  
                  <div class="ml-14 pr-24">
                    <p class="font-medium" style="color: {$colorStore.text}">
                      {override.command}
                    </p>
                    <p class="text-sm" style="color: {$colorStore.muted}">
                      Requires: {availablePermissions.find(p => p.id === override.permission)?.name || override.permission}
                    </p>
                  </div>
                  
                  <button
                    class="absolute top-3 right-3 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 opacity-60 group-hover:opacity-100 min-h-[36px] min-w-[80px]"
                    style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                    on:click|stopPropagation={() => showConfirm("Remove Permission Override", `Remove override for ${override.command}?`, () => removePermissionOverride(override.command, override.permission))}
                    aria-label="Remove permission override for {override.command}"
                  >
                    Remove
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>

      </div>
    {/if}

    {#if activeTab === 'cooldowns'}
      <!-- Command Cooldowns Section -->
      <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                  border-color: {$colorStore.primary}30;"
           in:fly={{ y: 20, duration: 300, delay: 100 }}>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <Timer class="w-6 h-6" style="color: {$colorStore.primary}" />
            </div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Command Cooldowns</h2>
          </div>
          
          <div class="flex flex-wrap items-center gap-2">
            <button
              class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
              on:click={() => showAddCommandCooldownModal = true}
            >
              <Plus class="w-4 h-4" />
              Add Cooldown
            </button>
          </div>
        </div>

        {#if commandCooldowns.length === 0}
          <div class="text-center py-8">
            <Timer class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
            <p class="text-lg font-medium" style="color: {$colorStore.text}">No command cooldowns configured</p>
            <p class="text-sm" style="color: {$colorStore.muted}">Add cooldowns to prevent command spam</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each commandCooldowns as cooldown}
              <div
                class="group relative p-4 rounded-lg transition-all duration-200 hover:shadow-lg backdrop-blur-sm border"
                style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                
                <div class="pr-16">
                  <p class="font-medium text-lg" style="color: {$colorStore.text}">
                    {cooldown.commandName || cooldown.command}
                  </p>
                  <p class="text-sm" style="color: {$colorStore.muted}">
                    Cooldown: {cooldown.seconds || cooldown.cooldown}s
                  </p>
                </div>
                
                <button
                  class="absolute top-3 right-3 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 opacity-60 group-hover:opacity-100 min-h-[36px] min-w-[80px]"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                  on:click={() => removeCommandCooldown(cooldown.commandName || cooldown.command)}
                  aria-label="Remove cooldown for {cooldown.commandName || cooldown.command}"
                >
                  Remove
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    {#if activeTab === 'advanced'}
      <!-- Advanced Operations Section -->
      <div class="space-y-6">
        
        <!-- Ban Message Management -->
        <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 300, delay: 100 }}>

          <div class="flex items-center gap-4 mb-6">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <MessageSquare class="w-6 h-6" style="color: {$colorStore.primary}" />
            </div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Ban Message</h2>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                Custom Ban Message
              </label>
              <textarea
                bind:value={banMessage}
                class="w-full px-3 py-2 rounded-lg border transition-colors resize-none"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                placeholder="Enter custom ban message..."
                rows="3"
              />
              <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                This message will be sent to users when they are banned
              </p>
            </div>

            <div class="flex justify-end">
              <button
                class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
                style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                on:click={saveBanMessage}
                disabled={saving}
              >
                <Save class="w-4 h-4" />
                Save Message
              </button>
            </div>
          </div>
        </div>

        <!-- Mass Operations -->
        <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 300, delay: 200 }}>

          <div class="flex items-center gap-4 mb-6">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.accent}20, {$colorStore.accent}30);">
              <Zap class="w-6 h-6" style="color: {$colorStore.accent}" />
            </div>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Mass Operations</h2>
          </div>

          <div class="max-w-md">
            <!-- Prune Users -->
            <div class="p-4 rounded-xl border" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
              <h3 class="font-semibold mb-3" style="color: {$colorStore.text}">Prune Inactive Users</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Days of Inactivity</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    bind:value={massOperations.prune.days}
                    class="w-full px-3 py-2 rounded-lg border transition-colors"
                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                    placeholder="7"
                  />
                  <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                    Users inactive for this many days will be removed
                  </p>
                </div>
                <button
                  class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 min-h-[44px]"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  on:click={() => showConfirm("Prune Users", `Remove users inactive for ${massOperations.prune.days} days?`, performPrune)}
                  disabled={massOperations.prune.days <= 0 || saving}
                >
                  Execute Prune
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</DashboardPageLayout>

<!-- Modals -->
{#if showAddAutoBanRoleModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="p-6 rounded-2xl max-w-md w-full mx-4" 
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}30;">
      <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Add Auto-Ban Role</h3>
      
      <div class="space-y-4">
        <DiscordSelector
          type="role"
          options={availableRoles}
          bind:selected={newAutoBanRole}
          placeholder="Select role to auto-ban..."
          multiple={false}
        />
        
        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted}"
            on:click={() => { showAddAutoBanRoleModal = false; newAutoBanRole = null; }}
          >
            Cancel
          </button>
          <button
            class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
            on:click={addAutoBanRole}
            disabled={!newAutoBanRole}
          >
            Add Role
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if showAddVoiceChannelRoleModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="p-6 rounded-2xl max-w-md w-full mx-4" 
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}30;">
      <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Add Voice Channel Role</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Voice Channel</label>
          <DiscordSelector
            type="channel"
            options={voiceChannels}
            bind:selected={newVoiceChannelRole.channelId}
            placeholder="Select voice channel..."
            multiple={false}
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Role to Assign</label>
          <DiscordSelector
            type="role"
            options={availableRoles}
            bind:selected={newVoiceChannelRole.roleId}
            placeholder="Select role..."
            multiple={false}
          />
        </div>
        
        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted}"
            on:click={() => { showAddVoiceChannelRoleModal = false; newVoiceChannelRole = { channelId: null, roleId: null }; }}
          >
            Cancel
          </button>
          <button
            class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
            on:click={addVoiceChannelRole}
            disabled={!newVoiceChannelRole.channelId || !newVoiceChannelRole.roleId}
          >
            Add Mapping
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if showAddPermissionOverrideModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="p-6 rounded-2xl max-w-md w-full mx-4" 
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}30;">
      <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Add Permission Override</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Bot Command ({availableCommands.length} available)
          </label>
          <DiscordSelector
            type="custom"
            options={availableCommands}
            bind:selected={newPermissionOverride.command}
            placeholder="Select a bot command..."
            multiple={false}
            searchable={true}
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Required Discord Permission</label>
          <DiscordSelector
            type="custom"
            options={availablePermissions}
            bind:selected={newPermissionOverride.permission}
            placeholder="Select required permission..."
            multiple={false}
            searchable={true}
          />
        </div>
        
        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted}"
            on:click={() => { showAddPermissionOverrideModal = false; newPermissionOverride = { command: "", permission: "Administrator" }; }}
          >
            Cancel
          </button>
          <button
            class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
            on:click={addPermissionOverride}
            disabled={!newPermissionOverride.command}
          >
            Add Override
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if showAddCommandCooldownModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="p-6 rounded-2xl max-w-md w-full mx-4" 
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}30;">
      <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Add Command Cooldown</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Command</label>
          <DiscordSelector
            type="command"
            options={availableCommands}
            bind:selected={newCommandCooldown.command}
            placeholder="Select command..."
            multiple={false}
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Cooldown (seconds)</label>
          <input
            type="number"
            min="1"
            max="90000"
            bind:value={newCommandCooldown.seconds}
            class="w-full px-3 py-2 rounded-lg border transition-colors"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
            placeholder="Enter cooldown in seconds..."
          />
          <p class="text-xs mt-1" style="color: {$colorStore.muted}">
            Minimum: 1 second, Maximum: 90,000 seconds (25 hours)
          </p>
        </div>
        
        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted}"
            on:click={() => { showAddCommandCooldownModal = false; newCommandCooldown = { command: "", seconds: 5 }; }}
          >
            Cancel
          </button>
          <button
            class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
            on:click={addCommandCooldown}
            disabled={!newCommandCooldown.command || newCommandCooldown.seconds <= 0}
          >
            Add Cooldown
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Edit Protection Modal -->
{#if editingProtection}
  <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="p-6 rounded-2xl max-w-md w-full mx-4" 
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}30;">
      <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">
        Configure {editingProtection === 'antiRaid' ? 'Anti-Raid' : 
                   editingProtection === 'antiSpam' ? 'Anti-Spam' : 
                   editingProtection === 'antiAlt' ? 'Anti-Alt' : 
                   'Anti-Mass Mention'} Protection
      </h3>
      
      <div class="space-y-4">
        {#if editingProtection === 'antiRaid'}
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">User Threshold</label>
            <input
              type="number"
              bind:value={tempProtectionConfig.userThreshold}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              min="1"
              max="50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Time Window (seconds)</label>
            <input
              type="number"
              bind:value={tempProtectionConfig.seconds}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              min="1"
              max="300"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Action</label>
            <DiscordSelector
              type="custom"
              options={actionOptions}
              bind:selected={tempProtectionConfig.action}
              placeholder="Select action..."
              multiple={false}
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Punishment Duration (minutes)</label>
            <input
              type="number"
              bind:value={tempProtectionConfig.punishDuration}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              min="1"
              max="10080"
            />
          </div>
        {:else if editingProtection === 'antiSpam'}
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Message Threshold</label>
            <input
              type="number"
              bind:value={tempProtectionConfig.messageThreshold}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              min="1"
              max="20"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Action</label>
            <DiscordSelector
              type="custom"
              options={actionOptions}
              bind:selected={tempProtectionConfig.action}
              placeholder="Select action..."
              multiple={false}
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Mute Time (minutes)</label>
            <input
              type="number"
              bind:value={tempProtectionConfig.muteTime}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              min="1"
              max="10080"
            />
          </div>
        {:else if editingProtection === 'antiAlt'}
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Minimum Account Age (minutes)</label>
            <input
              type="number"
              bind:value={tempProtectionConfig.minAgeMinutes}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              min="1"
              max="525600"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Action</label>
            <DiscordSelector
              type="custom"
              options={actionOptions}
              bind:selected={tempProtectionConfig.action}
              placeholder="Select action..."
              multiple={false}
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Action Duration (minutes)</label>
            <input
              type="number"
              bind:value={tempProtectionConfig.actionDurationMinutes}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              min="0"
              max="525600"
            />
          </div>
        {:else if editingProtection === 'antiMassMention'}
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Mention Threshold</label>
            <input
              type="number"
              bind:value={tempProtectionConfig.mentionThreshold}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              min="1"
              max="50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Time Window (seconds)</label>
            <input
              type="number"
              bind:value={tempProtectionConfig.timeWindowSeconds}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              min="1"
              max="300"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Max Mentions in Time Window</label>
            <input
              type="number"
              bind:value={tempProtectionConfig.maxMentionsInTimeWindow}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              min="1"
              max="100"
            />
          </div>
          <div>
            <label class="flex items-center gap-2 text-sm font-medium" style="color: {$colorStore.text}">
              <input
                type="checkbox"
                bind:checked={tempProtectionConfig.ignoreBots}
                class="w-4 h-4 rounded border transition-colors"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30;"
              />
              Ignore Bot Mentions
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Action</label>
            <DiscordSelector
              type="custom"
              options={actionOptions}
              bind:selected={tempProtectionConfig.action}
              placeholder="Select action..."
              multiple={false}
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Mute Time (minutes)</label>
            <input
              type="number"
              bind:value={tempProtectionConfig.muteTime}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              min="1"
              max="10080"
            />
          </div>
        {/if}
      </div>
      
      <div class="flex gap-3 mt-6">
        <button
          class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
          style="background: {$colorStore.muted}20; color: {$colorStore.muted}"
          on:click={cancelEditProtection}
        >
          Cancel
        </button>
        <button
          class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
          on:click={saveProtectionConfig}
          disabled={saving}
        >
          {#if saving}
            <RefreshCw class="w-4 h-4 animate-spin mx-auto" />
          {:else}
            Save Configuration
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<ConfirmationModal
  bind:isOpen={showConfirmModal}
  title={confirmModalData.title}
  message={confirmModalData.message}
  variant={confirmModalData.variant}
  on:confirm={() => confirmModalData.action?.()}
  on:cancel={() => showConfirmModal = false}
/>

<style lang="postcss">
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
</style>