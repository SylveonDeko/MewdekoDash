<!--
@component
Complete Setup Wizard with Progressive Disclosure, Templates, Real-Time Previews,
Multi-Channel Intelligence, Bulk Configuration, and Three-State Feature Selection
-->
<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount, untrack } from "svelte";
  import { fade, fly, scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import type { PageData } from "./$types";

  // Components
  import WizardProgress from "./components/WizardProgress.svelte";
  import WizardStep from "./components/WizardStep.svelte";
  import FeatureSetupCard from "./components/FeatureSetupCard.svelte";
  import PermissionCheck from "./components/PermissionCheck.svelte";
  import ProgressiveFeatureConfig from "./components/ProgressiveFeatureConfig.svelte";
  import BulkNotificationSetup from "./components/BulkNotificationSetup.svelte";
  import FeatureDependencySuggestion from "./components/FeatureDependencySuggestion.svelte";
  import ChannelBulkSelector from "./components/ChannelBulkSelector.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  // API imports
  import {
    administrationApi,
    afkApi,
    birthdayApi,
    clientApi,
    confessionsApi,
    countingApi,
    customVoiceApi,
    feedsApi,
    guildApi,
    inviteTrackingApi,
    loggingApi,
    multiGreetApi,
    protectionApi,
    repeatersApi,
    reputationApi,
    roleGreetApi,
    roleStatesApi,
    starboardApi,
    statChannelsApi,
    statusRolesApi,
    streamNotificationsApi,
    suggestionsApi,
    ticketApi,
    votesApi,
    wizardApi,
    xpApi
  } from "$lib/api/index.ts";

  // Wizard feature catalog
  import {
    allWizardFeatures,
    createDefaultFeatureConfigs,
    createDefaultFeatureStates,
    wizardAfkTypes,
    wizardChannelPatterns,
    wizardFeatureCategories,
    wizardLoggingEvents,
    wizardPunishmentActions,
    wizardStatChannelTypes,
    type WizardFeature,
    type WizardFeatureState
  } from "$lib/config/wizardFeatures";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // Comprehensive placeholder list for embed editors
  const allPlaceholders = [
    // User placeholders
    { category: "User", name: "%user%", description: "Username of the user" },
    { category: "User", name: "%user.mention%", description: "Mention the user" },
    { category: "User", name: "%user.id%", description: "User ID" },
    { category: "User", name: "%user.avatar%", description: "User's avatar URL" },
    { category: "User", name: "%user.name%", description: "User's display name" },
    { category: "User", name: "%user.nick%", description: "User's nickname in the server" },
    // Server placeholders
    { category: "Server", name: "%server%", description: "Server name" },
    { category: "Server", name: "%server.name%", description: "Server name" },
    { category: "Server", name: "%server.id%", description: "Server ID" },
    { category: "Server", name: "%server.members%", description: "Number of server members" },
    { category: "Server", name: "%server.membercount%", description: "Number of server members" },
    { category: "Server", name: "%server.owner%", description: "Server owner username" },
    { category: "Server", name: "%server.icon%", description: "Server icon URL" },
    // Role placeholders
    { category: "Role", name: "%role.name%", description: "Role name" },
    { category: "Role", name: "%role.mention%", description: "Mention the role" },
    { category: "Role", name: "%role.id%", description: "Role ID" },
    // Date/Time placeholders
    { category: "Time", name: "%date%", description: "Current date" },
    { category: "Time", name: "%time%", description: "Current time" },
    { category: "Time", name: "%timestamp%", description: "Discord timestamp" },
    { category: "Time", name: "%timestamp.relative%", description: "Relative Discord timestamp" },
    // XP placeholders
    { category: "XP", name: "%xp.level.old%", description: "Previous level" },
    { category: "XP", name: "%xp.level.new%", description: "New level" },
    { category: "XP", name: "%xp.level.current%", description: "Current level" },
    { category: "XP", name: "%xp.total%", description: "Total XP" },
    { category: "XP", name: "%xp.rank%", description: "Server rank" },
    // Birthday placeholders
    { category: "Birthday", name: "%birthday.age%", description: "Calculated age" },
    // Inviter placeholders
    { category: "Inviter", name: "%inviter.username%", description: "Inviter's username" },
    { category: "Inviter", name: "%inviter.mention%", description: "Mention the inviter" },
    { category: "Inviter", name: "%inviter.count%", description: "Inviter's total invites" },
    // Random placeholders
    { category: "Random", name: "%rng%", description: "Random number" },
    { category: "Random", name: "%rng(1,10)%", description: "Random number 1-10" },
    { category: "Random", name: "%choose(a|b|c)%", description: "Choose randomly from options" }
  ];

  // Wizard state
  let currentStep = $state(1);
  let completedSteps: number[] = $state([]);
  let wizardLoading = $state(false);
  let skipConfirmation = $state(false);
  let permissionData: any = $state(null);
  let permissionsLoading = $state(true);
  let guild: any = $state(null);
  let wizardState: any = null;
  let wizardDecision: any = null;
  let dataLoading = $state(true);
  let dataError: string | null = $state(null);
  let actionError: string | null = $state(null);

  // Feature states
  type FeatureState = WizardFeatureState;
  let featureStates = $state<Record<string, FeatureState>>(createDefaultFeatureStates());

  // Feature configurations
  let featureConfigs = $state<Record<string, any>>(createDefaultFeatureConfigs());

  // Current configuration step tracking
  let configPhase = $state(false);
  let currentConfigFeature = $state<string | null>(null);
  let currentConfigStep = $state(0);

  // Channels and roles
  let availableChannels = $state<any[]>([]);
  let availableRoles = $state<any[]>([]);
  let availableCategories = $state<any[]>([]);
  let availableVoiceChannels = $state<any[]>([]);
  let availableTimezones = $state<any[]>([]);
  let channelsLoading = $state(false);

  /** Server-wide settings collected on the Server Basics step. */
  let basicsConfig = $state({
    prefix: "",
    locale: "",
    timezoneId: null as string | null
  });
  let guildConfig: any = $state(null);
  let basicsLoading = $state(true);

  /** Languages the bot ships translations for. */
  const availableLocales = [
    { id: "en-US", name: "English (US)" },
    { id: "es-ES", name: "Español" },
    { id: "fr-FR", name: "Français" },
    { id: "de-DE", name: "Deutsch" },
    { id: "it-IT", name: "Italiano" },
    { id: "pt-BR", name: "Português (Brasil)" },
    { id: "nl-NL", name: "Nederlands" },
    { id: "pl-PL", name: "Polski" },
    { id: "ru-RU", name: "Русский" },
    { id: "tr-TR", name: "Türkçe" },
    { id: "ja-JP", name: "日本語" },
    { id: "zh-CN", name: "中文 (简体)" },
    { id: "ko-KR", name: "한국어" }
  ];

  // Dependency suggestions
  let suggestions = $state<any[]>([]);

  // Expanded feature categories (Essential expanded by default)
  let expandedFeatureCategories = $state<Record<string, boolean>>(
    Object.fromEntries(
      wizardFeatureCategories.map((category) => [category.name, category.name === "Essential"])
    )
  );

  /** Every supported log type, pre-populated from the shared catalog. */
  let loggingEvents = $state(wizardLoggingEvents.map((event) => ({ ...event })));

  /** Feature catalog, shared with the dashboard's wizard config module. */
  const featureCategories = wizardFeatureCategories;
  const allFeatures: WizardFeature[] = allWizardFeatures;

  // Computed values
  let fullSetupFeatures = $derived(
    Object.entries(featureStates)
      .filter(([_, state]) => state === "full")
      .map(([id]) => id)
      .filter(id => {
        // Filter out features with no configuration steps (like giveaways)
        const feature = allFeatures.find(f => f.id === id);
        return feature && feature.steps.length > 0;
      })
  );

  let quickEnableFeatures = $derived(
    Object.entries(featureStates)
      .filter(([id, state]) => {
        if (state === "quick") return true;
        // Treat "full" features with no steps as "quick"
        if (state === "full") {
          const feature = allFeatures.find(f => f.id === id);
          return feature && feature.steps.length === 0;
        }
        return false;
      })
      .map(([id]) => id)
  );

  let allEnabledFeatures = $derived([...fullSetupFeatures, ...quickEnableFeatures]);

  // Quick enable features list for bulk setup (reactive) - must come after quickEnableFeatures is defined
  let quickEnableFeaturesData = $derived.by(() => {
    return quickEnableFeatures.map(id => ({
      id,
      name: allFeatures.find(f => f.id === id)?.title || id,
      icon: allFeatures.find(f => f.id === id)?.icon || "fa-cog",
      description: allFeatures.find(f => f.id === id)?.description || "",
      enabled: true,
      channelId: featureConfigs[id]?.channelId || null
    }));
  });

  /** Whether the permission check screen is part of this run. */
  let hasPermissionStep = $derived(data.wizardType === "first-time");

  /** 1-based step numbers for the fixed screens at the front of the wizard. */
  let permissionsStep = $derived(2);
  let basicsStep = $derived(hasPermissionStep ? 3 : 2);
  let featureSelectionStep = $derived(basicsStep + 1);

  /** The step index of the bulk quick-enable screen, when there is one. */
  let quickSetupStep = $derived(featureSelectionStep + fullSetupFeatures.length + 1);

  let totalSteps = $derived.by(() => {
    const baseSteps = featureSelectionStep; // Welcome + (Permissions) + Basics + Features
    const configSteps = fullSetupFeatures.length; // One step per full setup feature
    const bulkStep = quickEnableFeatures.length > 0 ? 1 : 0; // One bulk config step
    return baseSteps + configSteps + bulkStep + 1; // +1 for completion
  });

  let currentStepTitle = $derived.by(() => {
    const titles: string[] = [
      "Welcome",
      ...(hasPermissionStep ? ["Permissions"] : []),
      "Server Basics",
      "Select Features",
      ...fullSetupFeatures.map(id => allFeatures.find(f => f.id === id)?.title || id),
      ...(quickEnableFeatures.length > 0 ? ["Quick Setup"] : []),
      "Complete"
    ];
    return titles;
  });

  // Load wizard data - wait for instance to be ready first
  onMount(() => {
    // Don't load immediately - wait for currentInstance to be set by UnifiedNav
  });

  // Track the last instance to detect changes
  let lastInstancePort = $state<number | null>(null);

  // Load wizard data when instance is ready, and reload when instance changes
  $effect(() => {
    const currentPort = $currentInstance?.port;

    if (currentPort) {
      // Check if this is a new instance (different from last)
      const isInstanceChange = lastInstancePort !== null && currentPort !== lastInstancePort;
      const isInitialLoad = lastInstancePort === null;

      if (isInitialLoad || isInstanceChange) {
        // Update tracked port
        untrack(() => {
          lastInstancePort = currentPort;
        });

        // Load/reload all wizard data
        untrack(() => {
          (async () => {
            await loadWizardData();

            if (data.wizardType === "first-time") {
              await loadPermissions();
            }

            await loadAvailableChannels();
            await loadServerBasics();
            await loadExistingConfigurations();
          })();
        });
      }
    }
  });

  async function loadWizardData() {
    try {
      dataLoading = true;
      dataError = null;

      const guildId = BigInt(data.guildId);

      const [userGuilds, wizardStateData, wizardDecisionData] = await Promise.all([
        clientApi.getMutualGuilds(BigInt(data.user.id)),
        wizardApi.getWizardState(guildId),
        wizardApi.shouldShowWizard(BigInt(data.user.id), guildId)
      ]);

      guild = userGuilds?.find((g: any) => g.id.toString() === data.guildId);
      if (!guild) {
        dataError = "You do not have access to this guild. Make sure you've selected the correct bot instance.";
        return;
      }

      // Set currentGuild store for color extraction in layout
      currentGuild.set(guild);

      wizardState = wizardStateData;
      wizardDecision = wizardDecisionData;

      if (wizardState.completed || wizardState.skipped) {
        goto(`/dashboard?guild=${data.guildId}`);
        return;
      }

      console.log("Wizard data loaded successfully:", { guild, wizardState, wizardDecision });

    } catch (err) {
      console.error("Error loading wizard data:", err);
      dataError = "Failed to load wizard data";
    } finally {
      dataLoading = false;
    }
  }

  async function loadPermissions() {
    try {
      permissionsLoading = true;
      permissionData = await wizardApi.checkBotPermissions(BigInt(data.guildId));
    } catch (error) {
      console.error("Error loading permissions:", error);
    } finally {
      permissionsLoading = false;
    }
  }

  async function loadAvailableChannels() {
    if (!guild) return;

    try {
      channelsLoading = true;
      const guildId = BigInt(data.guildId);

      const [channels, roles, categories, voiceChannels] = await Promise.all([
        clientApi.getTextChannels(guildId).catch(() => []),
        clientApi.getRoles(guildId).catch(() => []),
        clientApi.getCategories(guildId).catch(() => []),
        clientApi.getVoiceChannels(guildId).catch(() => [])
      ]);

      availableChannels = channels;
      availableRoles = roles;
      availableCategories = categories;
      availableVoiceChannels = voiceChannels;

    } catch (err) {
      console.error("Error loading guild data:", err);
      availableChannels = [];
      availableRoles = [];
      availableCategories = [];
      availableVoiceChannels = [];
    } finally {
      channelsLoading = false;
    }
  }

  /**
   * Loads the server-wide settings shown on the Server Basics step.
   * The full guild config is kept so the later save can round-trip every field
   * the wizard does not touch.
   */
  async function loadServerBasics() {
    if (!guild) return;

    try {
      basicsLoading = true;
      const guildId = BigInt(data.guildId);

      const [config, timezone, timezones] = await Promise.all([
        guildApi.getGuildConfig(guildId).catch(() => null),
        administrationApi.getGuildTimezone(guildId).catch(() => null),
        administrationApi.getTimezones(guildId).catch(() => [])
      ]);

      guildConfig = config;
      availableTimezones = Array.isArray(timezones) ? timezones : [];

      basicsConfig = {
        prefix: config?.prefix || "",
        locale: config?.locale || "",
        timezoneId: typeof timezone === "string" ? timezone : (timezone as any)?.timezoneId ?? null
      };
    } catch (err) {
      console.warn("Error loading server basics:", err);
    } finally {
      basicsLoading = false;
    }
  }

  /** Persists the Server Basics step. Only changed values are sent. */
  async function saveServerBasics() {
    const guildId = BigInt(data.guildId);
    const requests: Promise<unknown>[] = [];

    const prefixChanged = (basicsConfig.prefix || "") !== (guildConfig?.prefix || "");
    const localeChanged = (basicsConfig.locale || "") !== (guildConfig?.locale || "");

    if (guildConfig && (prefixChanged || localeChanged)) {
      requests.push(
        guildApi.updateGuildConfig(guildId, {
          ...guildConfig,
          prefix: basicsConfig.prefix?.trim() || null,
          locale: basicsConfig.locale || null
        })
      );
    }

    if (basicsConfig.timezoneId) {
      requests.push(
        administrationApi.setGuildTimezone(guildId, { timezoneId: basicsConfig.timezoneId })
      );
    }

    if (requests.length > 0) {
      await Promise.all(requests);
    }
  }

  async function loadExistingConfigurations() {
    if (!guild) return;

    try {
      const guildId = BigInt(data.guildId);

      const [
        multiGreets,
        starboards,
        xpSettings,
        loggingConfig,
        confessionChannel,
        confessionLogChannel,
        countingChannels,
        birthdayConfig,
        protectionStatus,
        repConfig,
        inviteSettings,
        roleStateSettings,
        voiceConfig,
        staffRole,
        memberRole
      ] = await Promise.all([
        multiGreetApi.getMultiGreets(guildId).catch(() => []),
        starboardApi.getStarboards(guildId).catch(() => []),
        xpApi.getXpSettings(guildId).catch(() => null),
        loggingApi.getLoggingConfig(guildId).catch(() => null),
        confessionsApi.getConfessionChannel(guildId).catch(() => null),
        confessionsApi.getConfessionLogChannel(guildId).catch(() => null),
        countingApi.getCountingChannels(guildId).catch(() => []),
        birthdayApi.getBirthdayConfig(guildId).catch(() => null),
        protectionApi.getProtectionStatus(guildId).catch(() => null),
        reputationApi.getRepConfig(guildId).catch(() => null),
        inviteTrackingApi.getInviteSettings(guildId).catch(() => null),
        roleStatesApi.getRoleStateSettings(guildId).catch(() => null),
        customVoiceApi.getCustomVoiceConfig(guildId).catch(() => null),
        administrationApi.getStaffRole(guildId).catch(() => null),
        administrationApi.getMemberRole(guildId).catch(() => null)
      ]);

      if (multiGreets.length > 0) {
        const existing = multiGreets[0];

        featureConfigs.multigreets = {
          ...featureConfigs.multigreets,
          channelId: existing.channelId ? existing.channelId.toString() : null,
          message: parseStoredMessage(existing.message, featureConfigs.multigreets.message)
        };
      }

      if (starboards.length > 0) {
        const existing = starboards[0];
        featureConfigs.starboard = {
          ...featureConfigs.starboard,
          channelId: existing.starboardChannelId ? existing.starboardChannelId.toString() : null,
          threshold: existing.threshold || 3,
          emoji: existing.emote || "⭐"
        };
      }

      if (xpSettings) {
        featureConfigs.xp = {
          ...featureConfigs.xp,
          textRate: xpSettings.xpPerMessage || 3,
          voiceRate: xpSettings.voiceXpPerMinute || 2
        };
      }

      if (loggingConfig && loggingConfig.logTypes) {
        const logChannels = loggingConfig.logTypes || {};

        // Pre-populate logging events with existing configuration
        loggingEvents = loggingEvents.map(event => {
          const channelId = (logChannels as any)[event.id];
          return {
            ...event,
            channelId: channelId && channelId !== BigInt(0) ? channelId.toString() : null,
            enabled: channelId && channelId !== BigInt(0) ? true : event.enabled
          };
        });

        // No need to set a single channelId - loggingEvents already populated above
      }

      if (confessionChannel) {
        featureConfigs.confessions = {
          ...featureConfigs.confessions,
          channelId: confessionChannel.toString()
        };
      }

      if (confessionLogChannel) {
        featureConfigs.confessions = {
          ...featureConfigs.confessions,
          logChannelId: confessionLogChannel.toString()
        };
      }

      if (countingChannels && countingChannels.length > 0) {
        const firstCountingChannel = countingChannels[0];
        featureConfigs.counting = {
          ...featureConfigs.counting,
          channelId: firstCountingChannel.channelId ? firstCountingChannel.channelId.toString() : null
        };
      }

      if (birthdayConfig) {
        featureConfigs.birthday = {
          ...featureConfigs.birthday,
          channelId: birthdayConfig.birthdayChannelId ? birthdayConfig.birthdayChannelId.toString() : null,
          roleId: birthdayConfig.birthdayRoleId ? birthdayConfig.birthdayRoleId.toString() : null
        };
      }

      if (protectionStatus) {
        const status = protectionStatus as any;
        featureConfigs.protection = {
          antiRaid: {
            ...featureConfigs.protection.antiRaid,
            enabled: status.antiRaid?.enabled ?? featureConfigs.protection.antiRaid.enabled,
            userThreshold: status.antiRaid?.userThreshold ?? featureConfigs.protection.antiRaid.userThreshold,
            seconds: status.antiRaid?.seconds ?? featureConfigs.protection.antiRaid.seconds,
            action: status.antiRaid?.action ?? featureConfigs.protection.antiRaid.action
          },
          antiSpam: {
            ...featureConfigs.protection.antiSpam,
            enabled: status.antiSpam?.enabled ?? featureConfigs.protection.antiSpam.enabled,
            messageThreshold: status.antiSpam?.messageThreshold ?? featureConfigs.protection.antiSpam.messageThreshold,
            action: status.antiSpam?.action ?? featureConfigs.protection.antiSpam.action
          },
          antiAlt: {
            ...featureConfigs.protection.antiAlt,
            enabled: status.antiAlt?.enabled ?? featureConfigs.protection.antiAlt.enabled,
            minAgeMinutes: status.antiAlt?.minAgeMinutes ?? featureConfigs.protection.antiAlt.minAgeMinutes,
            action: status.antiAlt?.action ?? featureConfigs.protection.antiAlt.action
          },
          antiMassMention: {
            ...featureConfigs.protection.antiMassMention,
            enabled: status.antiMassMention?.enabled ?? featureConfigs.protection.antiMassMention.enabled,
            mentionThreshold:
              status.antiMassMention?.mentionThreshold ?? featureConfigs.protection.antiMassMention.mentionThreshold,
            action: status.antiMassMention?.action ?? featureConfigs.protection.antiMassMention.action
          }
        };
      }

      if (repConfig) {
        featureConfigs.reputation = {
          ...featureConfigs.reputation,
          cooldownMinutes: repConfig.defaultCooldownMinutes ?? featureConfigs.reputation.cooldownMinutes,
          dailyLimit: repConfig.dailyLimit ?? featureConfigs.reputation.dailyLimit,
          notificationChannelId: repConfig.notificationChannel ? repConfig.notificationChannel.toString() : null,
          enableNegative: repConfig.enableNegativeRep ?? false,
          enableAnonymous: repConfig.enableAnonymous ?? false
        };
      }

      if (inviteSettings) {
        featureConfigs.invitetracking = {
          ...featureConfigs.invitetracking,
          removeOnLeave: inviteSettings.removeInviteOnLeave ?? featureConfigs.invitetracking.removeOnLeave
        };
      }

      if (roleStateSettings) {
        featureConfigs.rolestates = {
          clearOnBan: roleStateSettings.clearOnBan ?? featureConfigs.rolestates.clearOnBan,
          ignoreBots: roleStateSettings.ignoreBots ?? featureConfigs.rolestates.ignoreBots
        };
      }

      if (voiceConfig) {
        featureConfigs.customvoice = {
          ...featureConfigs.customvoice,
          hubChannelId: voiceConfig.hubVoiceChannelId ? voiceConfig.hubVoiceChannelId.toString() : null,
          categoryId: voiceConfig.channelCategoryId ? voiceConfig.channelCategoryId.toString() : null,
          defaultNameFormat: voiceConfig.defaultNameFormat || featureConfigs.customvoice.defaultNameFormat,
          defaultUserLimit: voiceConfig.defaultUserLimit ?? featureConfigs.customvoice.defaultUserLimit,
          deleteWhenEmpty: voiceConfig.deleteWhenEmpty ?? featureConfigs.customvoice.deleteWhenEmpty
        };
      }

      featureConfigs.roles = {
        ...featureConfigs.roles,
        staffRoleId: staffRole && staffRole !== BigInt(0) ? staffRole.toString() : null,
        memberRoleId: memberRole && memberRole !== BigInt(0) ? memberRole.toString() : null
      };

      if (guildConfig) {
        featureConfigs.moderation = {
          ...featureConfigs.moderation,
          warnlogChannelId:
            guildConfig.warnlogChannelId && guildConfig.warnlogChannelId !== BigInt(0)
              ? guildConfig.warnlogChannelId.toString()
              : null,
          miniWarnlogChannelId:
            guildConfig.miniWarnlogChannelId && guildConfig.miniWarnlogChannelId !== BigInt(0)
              ? guildConfig.miniWarnlogChannelId.toString()
              : null,
          warnExpireHours: guildConfig.warnExpireHours ?? 0
        };
      }

      console.log("Loaded existing configurations:", featureConfigs);

    } catch (err) {
      console.warn("Error loading existing configurations:", err);
    }
  }

  // Smart channel detection
  function detectChannelsForFeature(featureId: string): string[] {
    const featurePatterns = wizardChannelPatterns[featureId] || [];
    return availableChannels
      .filter(ch => featurePatterns.some(pattern => ch.name.toLowerCase().includes(pattern)))
      .map(ch => ch.id);
  }

  // Feature dependency detection
  function checkDependencies(featureId: string) {
    const newSuggestions: any[] = [];

    if (featureId === "xp" && featureStates.rolegreets === "skip") {
      newSuggestions.push({
        feature: "Role Greets",
        reason: "Congratulate members when they reach XP reward levels",
        icon: "fa-user-plus",
        benefits: [
          "Celebrate members reaching level milestones",
          "Announce new role rewards publicly",
          "Make leveling feel more rewarding"
        ]
      });
    }

    if (featureId === "tickets" && featureStates.logging === "skip") {
      newSuggestions.push({
        feature: "Logging",
        reason: "Track ticket creation and resolution",
        icon: "fa-file-lines",
        benefits: [
          "Monitor support team activity",
          "Track ticket resolution times",
          "Keep audit trail of support interactions"
        ]
      });
    }

    if (featureId === "moderation" && featureStates.logging === "skip") {
      newSuggestions.push({
        feature: "Logging",
        reason: "Track all moderation actions in one place",
        icon: "fa-file-lines",
        benefits: [
          "Central log of all mod actions",
          "Track who performed actions",
          "Review moderation history"
        ]
      });
    }

    if (featureId === "protection" && featureStates.logging === "skip") {
      newSuggestions.push({
        feature: "Event Logging",
        reason: "See what protection acted on and why",
        icon: "fa-file-lines",
        benefits: [
          "Review every automated punishment",
          "Spot false positives early",
          "Keep a record of raid attempts"
        ]
      });
    }

    if (featureId === "multigreets" && featureStates.invitetracking === "skip") {
      newSuggestions.push({
        feature: "Invite Tracking",
        reason: "Unlocks %inviter% placeholders in your welcome message",
        icon: "fa-link",
        benefits: [
          "Credit the member who brought someone in",
          "Build an invite leaderboard",
          "Spot invite farming"
        ]
      });
    }

    if (featureId === "tickets" && featureStates.roles === "skip") {
      newSuggestions.push({
        feature: "Server Roles",
        reason: "Tickets need a support role to notify",
        icon: "fa-crown",
        benefits: [
          "Set the staff role once and reuse it",
          "Support roles get access to every ticket",
          "Powers permission checks elsewhere"
        ]
      });
    }

    if (featureId === "rolegreets" && featureStates.administration === "skip") {
      newSuggestions.push({
        feature: "Auto-Assign Roles",
        reason: "Manage roles that trigger greets",
        icon: "fa-user-gear",
        benefits: [
          "Automatically assign verification roles",
          "Set up roles for role greets to use",
          "Streamline role management"
        ]
      });
    }

    suggestions = newSuggestions;
  }

  // Feature state change handler
  function handleFeatureStateChange(detail: { id: string; state: FeatureState }) {
    console.log("Feature state change:", detail);

    // Update state with proper reactivity
    featureStates = {
      ...featureStates,
      [detail.id]: detail.state
    };

    if (detail.state !== "skip") {
      // Smart channel detection
      const detected = detectChannelsForFeature(detail.id);
      const config = featureConfigs[detail.id];
      if (detected.length > 0 && config && "channelId" in config && !config.channelId) {
        config.channelId = detected[0];
      }

      // Check dependencies
      checkDependencies(detail.id);
    }
  }

  // Navigation
  function nextStep() {
    if (currentStep < totalSteps) {
      completedSteps = [...completedSteps, currentStep];
      currentStep++;
    }
  }

  function previousStep() {
    if (currentStep > 1) {
      // If we're in config phase, exit it first
      if (configPhase) {
        configPhase = false;
        currentConfigFeature = null;
        currentConfigStep = 0;
      }
      currentStep--;

      // If we went back to a step that should be in config phase, re-enter it
      const stepIndexAfterFeatureSelection = currentStep - featureSelectionStep;

      if (stepIndexAfterFeatureSelection > 0 && stepIndexAfterFeatureSelection <= fullSetupFeatures.length) {
        // We're on a full-setup feature step
        const featureIndex = stepIndexAfterFeatureSelection - 1;
        const featureId = fullSetupFeatures[featureIndex];
        if (featureId) {
          startFeatureConfig(featureId);
        }
      }
    }
  }

  // Skip wizard
  async function skipWizard() {
    if (!skipConfirmation) {
      skipConfirmation = true;
      return;
    }

    try {
      wizardLoading = true;
      actionError = null;
      await wizardApi.skipWizard(BigInt(data.guildId), BigInt(data.user.id));
      goto(`/dashboard?guild=${data.guildId}`);
    } catch (error: any) {
      console.error("Error skipping wizard:", error);
      actionError = `Failed to skip setup: ${error?.message || "Unknown error"}`;
    } finally {
      wizardLoading = false;
      skipConfirmation = false;
    }
  }

  function cancelSkip() {
    skipConfirmation = false;
  }

  /** Saves the Server Basics step, then advances. A failure here is not fatal. */
  async function handleBasicsNext() {
    try {
      wizardLoading = true;
      actionError = null;
      await saveServerBasics();
      nextStep();
    } catch (error: any) {
      console.error("Error saving server basics:", error);
      actionError = `Could not save server settings: ${error?.message || "Unknown error"}. You can change them later in Settings.`;
    } finally {
      wizardLoading = false;
    }
  }

  /** Formats a minute count as the "HH:MM:SS" TimeSpan the repeater API expects. */
  function minutesToTimeSpan(minutes: number): string {
    const total = Math.max(1, Math.round(minutes));
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:00`;
  }

  /**
   * Serialises an embed builder value for the bot API.
   * Text-only messages are sent as a plain string so simple greets stay readable
   * in the dashboard; anything with embeds or components is sent as JSON.
   */
  function buildFullMessage(config: any) {
    const value = config.message;

    if (!value) return "";
    if (typeof value === "string") return value;

    const hasEmbeds = Array.isArray(value.embeds) && value.embeds.length > 0;
    const hasComponents = Array.isArray(value.components) && value.components.length > 0;

    if (!hasEmbeds && !hasComponents) {
      return value.content ?? "";
    }

    const messageJson: any = {};
    if (value.content?.trim()) messageJson.content = value.content;
    if (hasEmbeds) messageJson.embeds = value.embeds;
    if (hasComponents) messageJson.components = value.components;

    return JSON.stringify(messageJson);
  }

  /** Turns a stored message into the object shape the embed builder binds to. */
  function parseStoredMessage(raw: unknown, fallback: any) {
    if (typeof raw !== "string" || raw.length === 0) return fallback;

    if (raw.startsWith("{")) {
      try {
        const parsed = JSON.parse(raw);
        return {
          content: parsed.content ?? "",
          embeds: parsed.embeds ?? [],
          components: parsed.components ?? []
        };
      } catch {
        return { content: raw };
      }
    }

    return { content: raw };
  }

  // Feature configuration
  async function configureFeature(featureId: string) {
    const guildId = BigInt(data.guildId);
    const config = featureConfigs[featureId];

    try {
      switch (featureId) {
        case "multigreets":
          const channelsToSetup = config.applyToMultiple
            ? config.channelIds
            : config.channelId ? [config.channelId] : [];

          if (channelsToSetup.length > 0) {
            // Get existing greets first to check limits
            const existingGreets = await multiGreetApi.getMultiGreets(guildId);

            for (const channelId of channelsToSetup) {
              try {
                // Check if this channel already has a greet
                const existingGreet = existingGreets.find(g => g.channelId.toString() === channelId);

                if (existingGreet) {
                  // Update existing greet message
                  const fullMessage = buildFullMessage(config);
                  await multiGreetApi.updateMultiGreetMessage(guildId, existingGreet.id, fullMessage);
                  console.log(`Updated existing greet for channel ${channelId}`);
                } else {
                  // Try to add new greet
                  await multiGreetApi.addMultiGreet(guildId, BigInt(channelId));
                  const greets = await multiGreetApi.getMultiGreets(guildId);
                  const newGreet = greets.find(g => g.channelId.toString() === channelId);
                  if (newGreet) {
                    const fullMessage = buildFullMessage(config);
                    await multiGreetApi.updateMultiGreetMessage(guildId, newGreet.id, fullMessage);
                    console.log(`Created new greet for channel ${channelId}`);
                  }
                }
              } catch (err: any) {
                // If we hit max greets, just skip this channel
                if (err.message && (err.message.includes("maximum greets") || err.message.includes("reached maximum"))) {
                  console.warn(`Skipped channel ${channelId} - max greets reached`);

                } else {
                  console.error(`Error setting up greet for channel ${channelId}:`, err);
                }
              }
            }
          }
          break;

        case "rolegreets":
          if (config.roleId && config.channelId) {
            try {
              await roleGreetApi.addRoleGreet(guildId, BigInt(config.roleId), BigInt(config.channelId));
              const roleGreets = await roleGreetApi.getAllRoleGreets(guildId);
              const greet = roleGreets.find(rg =>
                rg.roleId.toString() === config.roleId &&
                rg.channelId.toString() === config.channelId
              );
              if (greet) {
                const fullMessage = buildFullMessage(config);
                await roleGreetApi.updateRoleGreetMessage(guildId, greet.id, fullMessage);
              }
            } catch (err: any) {
              if (err.message && err.message.includes("Maximum number")) {
                const roleGreets = await roleGreetApi.getAllRoleGreets(guildId);
                const greet = roleGreets.find(rg => rg.roleId.toString() === config.roleId);
                if (greet) {
                  const fullMessage = buildFullMessage(config);
                  await roleGreetApi.updateRoleGreetMessage(guildId, greet.id, fullMessage);
                }
              }
            }
          }
          break;

        case "logging":
          // Configure all enabled logging events
          const enabledEvents = loggingEvents.filter(e => e.enabled && e.channelId);
          for (const event of enabledEvents) {
            try {
              await loggingApi.setLogChannel(guildId, event.id as any, BigInt(event.channelId!));
            } catch (err) {
              console.error(`Failed to set log channel for ${event.id}:`, err);
            }
          }
          break;

        case "administration":
          // Set auto-assign roles for normal users
          if (config.normalRoles && config.normalRoles.length > 0) {
            const roleIds = config.normalRoles.map((id: string) => BigInt(id));
            await administrationApi.setAutoAssignRoles(guildId, roleIds);
          }
          // Set auto-assign roles for bots
          if (config.botRoles && config.botRoles.length > 0) {
            const roleIds = config.botRoles.map((id: string) => BigInt(id));
            await administrationApi.setBotAutoAssignRoles(guildId, roleIds);
          }
          break;

        case "xp":
          await xpApi.updateXpSettings(guildId, {
            guildId: guildId,
            xpPerMessage: config.textRate,
            messageXpCooldown: 60,
            voiceXpPerMinute: config.voiceRate,
            voiceXpTimeout: 300,
            xpMultiplier: 1.0,
            xpCurveType: 0,
            customXpImageUrl: "",
            xpGainDisabled: false
          } as any);
          break;

        case "starboard":
          if (config.starboards && config.starboards.length > 0) {
            const existingStarboards = await starboardApi.getStarboards(guildId);

            for (const starboard of config.starboards) {
              if (!starboard.channelId) continue;

              // Check if this channel already has a starboard
              const channelHasStarboard = existingStarboards.some(s => s.starboardChannelId.toString() === starboard.channelId);

              if (channelHasStarboard) {
                console.log(`Channel ${starboard.channelId} already has a starboard, skipping`);
                continue;
              }

              // Fallback emotes if the chosen one is already in use
              const emoteOptions = [
                starboard.emoji,
                "🌟", "✨", "💫", "⭐", "🎭", "🏆", "💎", "🔥", "❤️", "👍", "🔆", "💛"
              ];

              let starboardCreated = false;
              for (const emote of emoteOptions) {
                try {
                  await starboardApi.createStarboard(
                    guildId,
                    BigInt(starboard.channelId),
                    emote,
                    starboard.threshold
                  );
                  console.log(`Created starboard in channel ${starboard.channelId} with emote: ${emote}`);
                  starboardCreated = true;
                  break;
                } catch (err: any) {
                  if (err.message && err.message.includes("already in use")) {
                    console.log(`Emote ${emote} already in use, trying next...`);

                  } else {
                    console.error(`Error creating starboard:`, err);
                    throw err;
                  }
                }
              }

              if (!starboardCreated) {
                console.warn(`Could not create starboard for channel ${starboard.channelId} - all emotes in use`);
              }
            }
          }
          break;

        case "suggestions":
          if (config.channelId) {
            await suggestionsApi.setSuggestChannel(guildId, BigInt(config.channelId));
          }
          // Set optional workflow channels
          if (config.acceptChannelId) {
            await suggestionsApi.setAcceptChannel(guildId, BigInt(config.acceptChannelId));
          }
          if (config.denyChannelId) {
            await suggestionsApi.setDenyChannel(guildId, BigInt(config.denyChannelId));
          }
          if (config.considerChannelId) {
            await suggestionsApi.setConsiderChannel(guildId, BigInt(config.considerChannelId));
          }
          if (config.implementChannelId) {
            await suggestionsApi.setImplementChannel(guildId, BigInt(config.implementChannelId));
          }
          break;

        case "confessions":
          if (config.channelId) {
            await confessionsApi.setConfessionChannel(guildId, BigInt(config.channelId));
          }
          if (config.logChannelId) {
            await confessionsApi.setConfessionLogChannel(guildId, BigInt(config.logChannelId));
          }
          break;

        case "counting":
          if (config.channelId) {
            await countingApi.setupCountingChannel(guildId, BigInt(config.channelId), {
              startNumber: 0,
              increment: 1
            });
          }
          break;

        case "birthday":
          if (config.channelId || config.roleId) {
            await birthdayApi.updateBirthdayConfig(guildId, {
              birthdayChannelId: config.channelId ? BigInt(config.channelId) : undefined,
              birthdayRoleId: config.roleId ? BigInt(config.roleId) : undefined
            });
          }
          break;

        case "protection":
          if (config.antiRaid.enabled) {
            await protectionApi.configureAntiRaid(guildId, {
              enabled: true,
              userThreshold: config.antiRaid.userThreshold,
              seconds: config.antiRaid.seconds,
              action: Number(config.antiRaid.action),
              punishDuration: config.antiRaid.punishDuration
            });
          }
          if (config.antiSpam.enabled) {
            await protectionApi.configureAntiSpam(guildId, {
              enabled: true,
              messageThreshold: config.antiSpam.messageThreshold,
              action: Number(config.antiSpam.action),
              muteTime: config.antiSpam.muteTime,
              roleId: config.antiSpam.roleId ? BigInt(config.antiSpam.roleId) : null
            });
          }
          if (config.antiAlt.enabled) {
            await protectionApi.configureAntiAlt(guildId, {
              enabled: true,
              minAgeMinutes: config.antiAlt.minAgeMinutes,
              action: Number(config.antiAlt.action),
              actionDurationMinutes: config.antiAlt.actionDurationMinutes,
              roleId: config.antiAlt.roleId ? BigInt(config.antiAlt.roleId) : null
            });
          }
          if (config.antiMassMention.enabled) {
            await protectionApi.configureAntiMassMention(guildId, {
              enabled: true,
              mentionThreshold: config.antiMassMention.mentionThreshold,
              timeWindowSeconds: config.antiMassMention.timeWindowSeconds,
              maxMentionsInTimeWindow: config.antiMassMention.maxMentionsInTimeWindow,
              ignoreBots: config.antiMassMention.ignoreBots,
              action: Number(config.antiMassMention.action),
              muteTime: config.antiMassMention.muteTime,
              roleId: config.antiMassMention.roleId ? BigInt(config.antiMassMention.roleId) : null
            });
          }
          break;

        case "moderation": {
          const existingConfig = guildConfig ?? (await guildApi.getGuildConfig(guildId));
          await guildApi.updateGuildConfig(guildId, {
            ...existingConfig,
            warnlogChannelId: config.warnlogChannelId ? BigInt(config.warnlogChannelId) : BigInt(0),
            miniWarnlogChannelId: config.miniWarnlogChannelId
              ? BigInt(config.miniWarnlogChannelId)
              : BigInt(0),
            warnExpireHours: config.warnExpireHours || 0
          });
          break;
        }

        case "tickets": {
          if (!config.panelChannelId) break;

          await ticketApi.createTicketPanel(guildId, {
            channelId: BigInt(config.panelChannelId),
            title: config.panelTitle,
            description: config.panelDescription
          });

          const panels = await ticketApi.getTicketPanels(guildId);
          const panel = panels
            .filter((p: any) => p.channelId?.toString() === config.panelChannelId)
            .pop();

          if (panel) {
            await ticketApi.addPanelButton(guildId, BigInt(panel.id), {
              label: config.buttonLabel || "Create Ticket",
              emoji: "🎫",
              categoryId: config.categoryId ? BigInt(config.categoryId) : null,
              supportRoles: config.supportRoles?.length
                ? config.supportRoles.map((id: string) => BigInt(id))
                : null
            });
          }
          break;
        }

        case "rolestates": {
          const settings = await roleStatesApi.getRoleStateSettings(guildId).catch(() => null);
          if (!settings?.enabled) {
            await roleStatesApi.toggleRoleStates(guildId);
          }
          if (settings && settings.clearOnBan !== config.clearOnBan) {
            await roleStatesApi.toggleClearOnBan(guildId);
          }
          if (settings && settings.ignoreBots !== config.ignoreBots) {
            await roleStatesApi.toggleIgnoreBots(guildId);
          }
          break;
        }

        case "reputation":
          await reputationApi.setEnabled(guildId, true);
          await reputationApi.setDefaultCooldown(guildId, config.cooldownMinutes);
          await reputationApi.setDailyLimit(guildId, config.dailyLimit);
          await reputationApi.setNegativeReputation(guildId, config.enableNegative);
          await reputationApi.setAnonymousReputation(guildId, config.enableAnonymous);
          await reputationApi.setNotificationChannel(
            guildId,
            config.notificationChannelId ? BigInt(config.notificationChannelId) : null
          );
          break;

        case "roles":
          if (config.staffRoleId) {
            await administrationApi.setStaffRole(guildId, BigInt(config.staffRoleId));
          }
          if (config.memberRoleId) {
            await administrationApi.setMemberRole(guildId, BigInt(config.memberRoleId));
          }
          for (const roleId of config.selfAssignableRoles || []) {
            try {
              await administrationApi.addSelfAssignableRole(guildId, BigInt(roleId));
            } catch (err) {
              console.warn(`Could not add self-assignable role ${roleId}:`, err);
            }
          }
          break;

        case "statusroles": {
          if (!config.status?.trim() || !config.addRoles?.length) break;

          await statusRolesApi.addStatusRole(guildId, config.status.trim());
          const statusRoles = await statusRolesApi.getStatusRoles(guildId);
          const created = statusRoles
            .filter((s: any) => s.status === config.status.trim())
            .pop();

          if (created) {
            await statusRolesApi.setAddRoles(guildId, created.id, config.addRoles.join(" "));
            if (config.channelId) {
              await statusRolesApi.setStatusChannel(guildId, created.id, BigInt(config.channelId));
            }
          }
          break;
        }

        case "customvoice":
          if (!config.hubChannelId) break;

          await customVoiceApi.updateCustomVoiceConfig(guildId, {
            hubVoiceChannelId: BigInt(config.hubChannelId),
            channelCategoryId: config.categoryId ? BigInt(config.categoryId) : null,
            defaultNameFormat: config.defaultNameFormat,
            defaultUserLimit: config.defaultUserLimit,
            defaultBitrate: 64,
            deleteWhenEmpty: config.deleteWhenEmpty,
            emptyChannelTimeout: config.emptyChannelTimeout,
            allowMultipleChannels: false,
            allowNameCustomization: config.allowNameCustomization,
            allowUserLimitCustomization: config.allowUserLimitCustomization,
            allowBitrateCustomization: false,
            allowLocking: config.allowLocking,
            allowUserManagement: true,
            maxUserLimit: 99,
            maxBitrate: 96,
            persistUserPreferences: true,
            autoPermission: true,
            customVoiceAdminRoleId: null
          });
          break;

        case "feeds":
          for (const entry of config.entries || []) {
            if (!entry.url?.trim() || !entry.channelId) continue;
            try {
              await feedsApi.addFeed(guildId, {
                channelId: BigInt(entry.channelId),
                url: entry.url.trim()
              });
            } catch (err) {
              console.warn(`Could not add feed ${entry.url}:`, err);
            }
          }
          break;

        case "streams":
          for (const entry of config.entries || []) {
            if (!entry.url?.trim() || !entry.channelId) continue;
            try {
              await streamNotificationsApi.followStream(guildId, {
                channelId: BigInt(entry.channelId),
                url: entry.url.trim()
              });
            } catch (err) {
              console.warn(`Could not follow stream ${entry.url}:`, err);
            }
          }
          if (config.offlineNotifications) {
            await streamNotificationsApi.toggleOfflineNotifications(guildId);
          }
          break;

        case "repeaters":
          if (config.channelId && config.message?.trim()) {
            await repeatersApi.createRepeater(guildId, {
              channelId: BigInt(config.channelId),
              message: config.message.trim(),
              interval: minutesToTimeSpan(config.intervalMinutes),
              noRedundant: config.noRedundant
            });
          }
          break;

        case "votes":
          if (config.channelId) {
            await votesApi.setVoteChannel(guildId, BigInt(config.channelId));
          }
          if (config.message?.trim()) {
            await votesApi.setVoteMessage(guildId, config.message.trim());
          }
          if (config.password?.trim()) {
            await votesApi.setVotePassword(guildId, config.password.trim());
          }
          break;

        case "statchannels":
          for (const statType of config.statTypes || []) {
            try {
              await statChannelsApi.addStatChannel(guildId, {
                channelId: BigInt(0),
                categoryId: config.categoryId ? BigInt(config.categoryId) : undefined,
                statType
              });
            } catch (err) {
              console.warn(`Could not create stat channel for type ${statType}:`, err);
            }
          }
          break;

        case "invitetracking":
          await inviteTrackingApi.toggleInviteTracking(guildId, true);
          await inviteTrackingApi.setRemoveOnLeave(guildId, config.removeOnLeave);
          if (config.minAccountAgeDays > 0) {
            await inviteTrackingApi.setMinAccountAge(guildId, `${config.minAccountAgeDays}d`);
          }
          break;

        case "afk":
          await afkApi.afkTypeSet(guildId, Number(config.afkType));
          if (config.timeout && config.timeout !== "0s") {
            await afkApi.afkTimeoutSet(guildId, config.timeout);
          }
          if (config.customMessage?.trim()) {
            await afkApi.setCustomAfkMessage(guildId, config.customMessage.trim());
          }
          if (config.disabledChannels?.length) {
            await afkApi.setDisabledAfkChannels(guildId, config.disabledChannels.join(","));
          }
          break;
      }

      console.log(`Configured feature: ${featureId}`);
    } catch (error) {
      console.error(`Error configuring ${featureId}:`, error);
      throw error;
    }
  }

  /** Feature ids that could not be saved, surfaced on the completion step. */
  let failedFeatures = $state<string[]>([]);

  /** Features that actually saved, used for the completion summary. */
  let configuredFeatureIds = $derived(
    allEnabledFeatures.filter((id) => !failedFeatures.includes(id))
  );

  // Complete wizard
  async function completeWizard() {
    try {
      wizardLoading = true;
      actionError = null;
      failedFeatures = [];

      // A single failing feature should not block the rest of the setup
      for (const featureId of quickEnableFeatures) {
        try {
          await configureFeature(featureId);
        } catch (error) {
          console.error(`Error configuring ${featureId}:`, error);
          failedFeatures = [...failedFeatures, featureId];
        }
      }

      // Mark wizard as completed
      const succeeded = allEnabledFeatures.filter((id) => !failedFeatures.includes(id));
      await wizardApi.completeWizard(BigInt(data.user.id), BigInt(data.guildId), succeeded);

      completedSteps = [...completedSteps, currentStep];
      currentStep = totalSteps;

      setTimeout(() => {
        goto(`/dashboard?guild=${data.guildId}`);
      }, failedFeatures.length > 0 ? 6000 : 2000);

    } catch (error: any) {
      console.error("Error completing wizard:", error);
      actionError = `Failed to finish setup: ${error?.message || "Unknown error"}`;
    } finally {
      wizardLoading = false;
    }
  }

  // Progressive config handlers
  function startFeatureConfig(featureId: string) {
    currentConfigFeature = featureId;
    currentConfigStep = 0;
    configPhase = true;
  }

  async function handleFeatureConfigNext(_detail: { config: any }) {
    if (!currentConfigFeature) return;

    const feature = allFeatures.find(f => f.id === currentConfigFeature);
    if (!feature) return;

    if (currentConfigStep < feature.steps.length - 1) {
      currentConfigStep++;
    } else {
      // Finish this feature and move to next
      actionError = null;
      try {
        await configureFeature(currentConfigFeature);
      } catch (error: any) {
        console.error(`Error configuring ${currentConfigFeature}:`, error);
        actionError = `${feature.title} could not be saved: ${error?.message || "Unknown error"}. You can set it up later from the dashboard.`;
        failedFeatures = [...failedFeatures, currentConfigFeature];
      }

      const currentIndex = fullSetupFeatures.indexOf(currentConfigFeature);
      if (currentIndex < fullSetupFeatures.length - 1) {
        // Move to next full setup feature
        nextStep();
        startFeatureConfig(fullSetupFeatures[currentIndex + 1]);
      } else {
        // Done with all full setup features
        configPhase = false;
        currentConfigFeature = null;

        // With no quick-enable features there is no bulk step to finish on,
        // so completion has to be triggered here instead
        if (quickEnableFeatures.length > 0) {
          nextStep();
        } else {
          await completeWizard();
        }
      }
    }
  }

  // Helper functions for role rewards
  function removeRoleReward(configObj: any, idx: number) {
    configObj.roleRewards = configObj.roleRewards.filter((_: any, i: number) => i !== idx);
  }

  function addRoleReward(configObj: any) {
    const maxLevel = Math.max(...configObj.roleRewards.map((r: any) => r.level));
    configObj.roleRewards = [...configObj.roleRewards, { level: maxLevel + 5, roleId: null }];
  }

  /**
   * Abandons the feature being configured without saving it.
   * Removing it from the full-setup list shifts every later feature down one
   * step, so the current step number already points at the next feature.
   */
  function handleFeatureConfigSkip() {
    if (!currentConfigFeature) return;

    actionError = null;
    featureStates = { ...featureStates, [currentConfigFeature]: "skip" };
    failedFeatures = failedFeatures.filter((id) => id !== currentConfigFeature);

    const remaining = fullSetupFeatures;
    const nextIndex = currentStep - featureSelectionStep - 1;

    if (nextIndex >= 0 && nextIndex < remaining.length) {
      startFeatureConfig(remaining[nextIndex]);
      return;
    }

    configPhase = false;
    currentConfigFeature = null;

    if (quickEnableFeatures.length > 0) {
      currentStep = quickSetupStep;
    } else if (allEnabledFeatures.length > 0) {
      completeWizard();
    } else {
      currentStep = featureSelectionStep;
    }
  }

  function handleFeatureConfigBack() {
    if (currentConfigStep > 0) {
      currentConfigStep--;
    } else {
      // Going back to feature selection - exit config phase first
      const wasInConfigPhase = configPhase;
      configPhase = false;
      currentConfigFeature = null;
      currentConfigStep = 0;

      // Only call previousStep if we were actually in config phase
      if (wasInConfigPhase) {
        previousStep();
      }
    }
  }

  // Permission helpers
  function getHealthStatusText(status: any) {
    switch (status) {
      case 0:
      case "Excellent":
        return "Excellent";
      case 1:
      case "Good":
        return "Good";
      case 2:
      case "Warning":
        return "Needs Attention";
      case 3:
      case "Poor":
        return "Critical Issues";
      default:
        return "Unknown";
    }
  }

  function getHealthStatusDescription(status: any) {
    switch (status) {
      case 0:
      case "Excellent":
        return "All required permissions are present";
      case 1:
      case "Good":
        return "Most permissions present, minor issues";
      case 2:
      case "Warning":
        return "Some important permissions missing";
      case 3:
      case "Poor":
        return "Critical permissions missing - bot may not work properly";
      default:
        return "Unable to check permission status";
    }
  }

  let canProceed = $derived(
    currentStep === 1 ||
    (hasPermissionStep && currentStep === permissionsStep && permissionData?.canFunction) ||
    currentStep === basicsStep ||
    (currentStep === featureSelectionStep && allEnabledFeatures.length > 0) ||
    currentStep === totalSteps
  );

  let showContent = $derived(!dataLoading && !dataError && guild);
</script>

<svelte:head>
  <title>Setup Wizard - {guild?.name || 'Loading...'} - Mewdeko</title>
</svelte:head>

<div class="wizard-container min-h-screen">
  {#if dataLoading}
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="fa-solid fa-arrows-rotate fa-spin"
           style="color: {$colorStore.primary}; font-size: 32px; display: block; margin: 0 auto 16px;"></i>
        <p style="color: {$colorStore.text};">Loading wizard data...</p>
      </div>
    </div>
  {:else if dataError}
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center p-6 rounded-lg border max-w-md"
           style="background: #ef444415; border-color: #ef444430; color: #ef4444;">
        <h2 class="text-xl font-bold mb-2">Error Loading Wizard</h2>
        <p class="mb-4">{dataError}</p>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
          style="background: {$colorStore.primary}; color: white;"
          onclick={() => goto('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  {:else if showContent}
    <!-- Progress indicator -->
    <div class="container mx-auto px-3 sm:px-4 pt-3 sm:pt-6">
      <WizardProgress
        {currentStep}
        {totalSteps}
        stepTitles={currentStepTitle}
        {completedSteps}
      />
    </div>

    <!-- Step 1: Welcome -->
    <WizardStep
      title={data.wizardType === 'first-time' ? `Welcome to Mewdeko!` : `Quick Setup for ${guild.name}`}
      subtitle={data.wizardType === 'first-time'
        ? `Let's set up ${guild.name} with essential features in just a few minutes.`
        : `Configure essential features for your server quickly.`}
      stepNumber={1}
      isActive={currentStep === 1}
      icon="fa-solid fa-hand-peace"
    >
      <div class="text-center space-y-6">
        <!-- Guild info -->
        <div class="flex items-center justify-center gap-4 p-6 rounded-xl border"
             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}25;">
          <img
            src={guild.icon ?
            `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128` :
            'https://cdn.discordapp.com/embed/avatars/0.png'
          }
            alt={guild.name}
            class="w-16 h-16 rounded-xl"
          />
          <div class="text-left">
            <h3 class="text-xl font-bold" style="color: {$colorStore.text};">{guild.name}</h3>
            <p class="text-sm" style="color: {$colorStore.muted};">Ready for setup</p>
          </div>
        </div>

        {#if data.wizardType === 'first-time'}
          <div class="max-w-lg mx-auto space-y-4">
            <h4 class="text-lg font-semibold" style="color: {$colorStore.text};">What we'll do:</h4>
            <div class="space-y-2 text-sm" style="color: {$colorStore.text};">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-circle-check" style="color: {$colorStore.accent}; font-size: 16px;"></i>
                <span>Verify bot permissions</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-circle-check" style="color: {$colorStore.accent}; font-size: 16px;"></i>
                <span>Set your prefix, timezone and language</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-circle-check" style="color: {$colorStore.accent}; font-size: 16px;"></i>
                <span>Choose from {allFeatures.length} features to configure</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-circle-check" style="color: {$colorStore.accent}; font-size: 16px;"></i>
                <span>Get your server ready to go!</span>
              </div>
            </div>
          </div>
        {/if}

        <!-- Action buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6">
          <button
            class="w-full sm:w-auto px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 min-h-[44px]"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
            onclick={nextStep}
          >
            Get Started
            <i class="fa-solid fa-arrow-right" style="font-size: 16px;"></i>
          </button>

          <button
            class="w-full sm:w-auto px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 min-h-[44px]"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30; focus:ring-color: {$colorStore.muted};"
            onclick={skipWizard}
            disabled={wizardLoading}
          >
            {skipConfirmation ? 'Confirm Skip' : 'Skip Setup'}
            <i class="fa-solid fa-forward" style="font-size: 16px;"></i>
          </button>
        </div>

        {#if actionError}
          <div class="p-4 rounded-lg border text-left"
               style="background: #ef444415; border-color: #ef444440; color: #ef4444;">
            <div class="flex items-start gap-2">
              <i class="fa-solid fa-triangle-exclamation" style="font-size: 16px; margin-top: 2px;"></i>
              <p class="text-sm">{actionError}</p>
            </div>
          </div>
        {/if}

        {#if skipConfirmation}
          <div class="p-4 rounded-lg border"
               style="background: #f59e0b15; border-color: #f59e0b30; color: #f59e0b;">
            <div class="flex items-center gap-2 mb-2">
              <i class="fa-solid fa-triangle-exclamation" style="font-size: 16px;"></i>
              <span class="font-medium">Skip setup?</span>
            </div>
            <p class="text-sm mb-3">You can always configure features later from the dashboard.</p>
            <div class="flex gap-2 justify-center">
              <button
                class="px-3 py-1 rounded-sm text-sm font-medium transition-all"
                style="background: #f59e0b25; color: #f59e0b;"
                onclick={skipWizard}
                disabled={wizardLoading}
              >
                {wizardLoading ? 'Skipping...' : 'Yes, Skip'}
              </button>
              <button
                class="px-3 py-1 rounded-sm text-sm font-medium transition-all"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                onclick={cancelSkip}
              >
                Cancel
              </button>
            </div>
          </div>
        {/if}
      </div>
    </WizardStep>

    <!-- Step 2: Permissions (First-time only) -->
    {#if data.wizardType === 'first-time'}
      <WizardStep
        title="Permission Check"
        subtitle="Let's make sure Mewdeko has the permissions it needs to function properly."
        stepNumber={2}
        isActive={currentStep === 2}
        icon="fa-solid fa-shield"
        maxWidth="max-w-5xl"
      >
        <div class="space-y-6">
          {#if permissionsLoading}
            <div class="flex items-center justify-center py-8">
              <i class="fa-solid fa-arrows-rotate fa-spin" style="color: {$colorStore.primary}; font-size: 24px;"></i>
              <span class="ml-2" style="color: {$colorStore.text};">Checking permissions...</span>
            </div>
          {:else if permissionData}
            <div class="text-center p-4 rounded-lg border"
                 style="background: {getHealthStatusText(permissionData.healthStatus) === 'Excellent' ? $colorStore.accent + '10' :
                       getHealthStatusText(permissionData.healthStatus) === 'Good' ? '#f59e0b15' :
                       '#ef444415'};
                       border-color: {getHealthStatusText(permissionData.healthStatus) === 'Excellent' ? $colorStore.accent + '30' :
                       getHealthStatusText(permissionData.healthStatus) === 'Good' ? '#f59e0b30' :
                       '#ef444430'};">
              <h3 class="text-lg font-bold mb-2" style="color: {$colorStore.text};">
                {getHealthStatusText(permissionData.healthStatus)}
              </h3>
              <p class="text-sm" style="color: {$colorStore.muted};">
                {getHealthStatusDescription(permissionData.healthStatus)}
              </p>
            </div>

            <div class="relative">
              <div class="space-y-3 max-h-80 overflow-y-auto border rounded-lg p-2"
                   style="border-color: {$colorStore.primary}20;">
                {#each permissionData.permissionResults as permission (permission.permissionName)}
                  <PermissionCheck
                    permission={permission.permissionName}
                    hasPermission={permission.hasPermission}
                    importance={permission.importance}
                    description={permission.description}
                    requiredForFeatures={permission.requiredForFeatures}
                  />
                {/each}
              </div>

              {#if permissionData.permissionResults.length > 4}
                <div class="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md text-xs"
                     style="background: {$colorStore.primary}15; color: {$colorStore.muted}; backdrop-filter: blur(4px);">
                  <span>Scroll for more</span>
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              {/if}
            </div>

            {#if !permissionData.hasAllRequiredPermissions}
              <div class="text-center p-4 rounded-lg border"
                   style="background: #f59e0b15; border-color: #f59e0b30;">
                <h4 class="font-semibold mb-2" style="color: #f59e0b;">Need to fix permissions?</h4>
                <p class="text-sm mb-4" style="color: {$colorStore.muted};">
                  Click the button below to re-invite Mewdeko with the correct permissions.
                </p>
                <a
                  href={permissionData.suggestedInviteUrl}
                  target="_blank"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
                  style="background: #f59e0b; color: white;"
                >
                  Fix Permissions
                  <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 16px;"></i>
                </a>
              </div>
            {/if}
          {/if}

          <div class="flex items-center justify-between pt-6">
            <button
              class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center gap-2"
              style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30; focus:ring-color: {$colorStore.muted};"
              onclick={previousStep}
            >
              <i class="fa-solid fa-arrow-left" style="font-size: 16px;"></i>
              Back
            </button>

            <button
              class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center gap-2 disabled:opacity-50"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
              onclick={nextStep}
              disabled={!canProceed}
            >
              Continue
              <i class="fa-solid fa-arrow-right" style="font-size: 16px;"></i>
            </button>
          </div>
        </div>
      </WizardStep>
    {/if}

    <!-- Server Basics -->
    <WizardStep
      title="Server Basics"
      subtitle="A few server-wide settings that everything else builds on."
      stepNumber={basicsStep}
      isActive={currentStep === basicsStep}
      icon="fa-solid fa-gear"
      maxWidth="max-w-3xl"
    >
      <div class="space-y-6">
        {#if basicsLoading}
          <div class="flex items-center justify-center py-8">
            <i class="fa-solid fa-arrows-rotate fa-spin" style="color: {$colorStore.primary}; font-size: 24px;"></i>
            <span class="ml-2" style="color: {$colorStore.text};">Loading server settings...</span>
          </div>
        {:else}
          <div>
            <label for="basics-prefix" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
              Command Prefix
            </label>
            <input
              id="basics-prefix"
              type="text"
              maxlength="10"
              class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              bind:value={basicsConfig.prefix}
              placeholder="Leave blank to keep the default"
            />
            <p class="text-xs mt-1" style="color: {$colorStore.muted};">
              What members type before a command, for example <code>.help</code>. Slash commands work regardless.
            </p>
          </div>

          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
              Server Timezone
            </span>
            <DiscordSelector
              type="timezone"
              options={availableTimezones}
              bind:selected={basicsConfig.timezoneId}
              placeholder="Choose your server's timezone..."
            />
            <p class="text-xs mt-1" style="color: {$colorStore.muted};">
              Used for birthdays, repeating messages, timestamps and every other scheduled feature. Worth
              setting even if you skip everything else.
            </p>
          </div>

          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
              Language
            </span>
            <DiscordSelector
              type="custom"
              customIcon="fa-globe"
              options={availableLocales}
              bind:selected={basicsConfig.locale}
              placeholder="Choose a language..."
            />
            <p class="text-xs mt-1" style="color: {$colorStore.muted};">
              The language Mewdeko replies in for this server.
            </p>
          </div>
        {/if}

        {#if actionError}
          <div class="p-4 rounded-lg border" style="background: #ef444415; border-color: #ef444440; color: #ef4444;">
            <div class="flex items-start gap-2">
              <i class="fa-solid fa-triangle-exclamation" style="font-size: 16px; margin-top: 2px;"></i>
              <p class="text-sm">{actionError}</p>
            </div>
          </div>
        {/if}

        <div class="flex items-center justify-between gap-3 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
          <button
            class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center gap-2 min-h-[44px]"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30; focus:ring-color: {$colorStore.muted};"
            onclick={previousStep}
          >
            <i class="fa-solid fa-arrow-left" style="font-size: 16px;"></i>
            Back
          </button>

          <button
            class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
            onclick={handleBasicsNext}
            disabled={wizardLoading}
          >
            {wizardLoading ? 'Saving...' : 'Continue'}
            <i class="fa-solid fa-arrow-right" style="font-size: 16px;"></i>
          </button>
        </div>
      </div>
    </WizardStep>

    <!-- Feature Selection -->
    <WizardStep
      title="Choose Features"
      subtitle="Select which features you want to set up for your server."
      stepNumber={featureSelectionStep}
      isActive={currentStep === featureSelectionStep}
      icon="fa-solid fa-sliders"
      maxWidth="max-w-7xl"
    >
      <div class="space-y-8">
        <!-- Bulk Actions -->
        <div class="flex flex-col sm:flex-row flex-wrap gap-3 justify-center p-4 rounded-xl border"
             style="background: linear-gradient(135deg, {$colorStore.primary}05, {$colorStore.secondary}08); border-color: {$colorStore.secondary}30;">
          <button
            class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 w-full sm:w-auto"
            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30; focus:ring-color: {$colorStore.secondary};"
            onclick={() => {
              allFeatures.forEach(f => {
                featureStates = {
                  ...featureStates,
                  [f.id]: 'full'
                };
              });
            }}
          >
            <i class="fa-solid fa-layer-group" style="font-size: 14px;"></i>
            <span>Full Setup All</span>
          </button>

          <button
            class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 w-full sm:w-auto"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
            onclick={() => {
              allFeatures.forEach(f => {
                featureStates = {
                  ...featureStates,
                  [f.id]: 'quick'
                };
              });
            }}
          >
            <i class="fa-solid fa-bolt" style="font-size: 14px;"></i>
            <span>Quick Enable All</span>
          </button>

          <button
            class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 w-full sm:w-auto"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30; focus:ring-color: {$colorStore.muted};"
            onclick={() => {
              allFeatures.forEach(f => {
                featureStates = {
                  ...featureStates,
                  [f.id]: 'skip'
                };
              });
            }}
          >
            <i class="fa-solid fa-ban" style="font-size: 14px;"></i>
            <span>Clear All</span>
          </button>
        </div>

        <!-- Dependency Suggestions -->
        {#if suggestions.length > 0}
          <FeatureDependencySuggestion
            {suggestions}
            onaccept={(detail) => {
              console.log('Suggestion accepted:', detail);
              const feature = allFeatures.find(f => f.title === detail.feature);
              console.log('Found feature:', feature);
              if (feature) {
                featureStates = {
                  ...featureStates,
                  [feature.id]: 'full'
                };
                suggestions = [];
                console.log('Updated featureStates:', featureStates);
              }
            }}
            ondismiss={() => suggestions = []}
          />
        {/if}

        <!-- Features by Category -->
        {#each featureCategories as category (category.name)}
          <div>
            <!-- Category Header (Collapsible) -->
            <div class="mb-4 rounded-xl border-2 transition-all overflow-hidden"
                 style="background: {expandedFeatureCategories[category.name] ? $colorStore.primary + '10' : $colorStore.primary + '05'}; border-color: {expandedFeatureCategories[category.name] ? $colorStore.primary + '40' : $colorStore.primary + '20'};">
              <button
                class="w-full flex items-start justify-between gap-4 p-4 hover:opacity-80 transition-all"
                onclick={() => expandedFeatureCategories[category.name] = !expandedFeatureCategories[category.name]}
              >
                <div class="flex-1 text-left">
                  <h3 class="text-xl font-bold mb-2 flex items-center gap-2" style="color: {$colorStore.text};">
                    <i
                      class="fa-solid {expandedFeatureCategories[category.name] ? 'fa-chevron-down' : 'fa-chevron-right'}"
                      style="font-size: 16px;"></i>
                    {category.name}
                    <span class="text-xs px-2 py-1 rounded-full"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
                      {category.features.filter(f => featureStates[f.id] !== 'skip').length}/{category.features.length}
                    </span>
                  </h3>
                  <p class="text-sm" style="color: {$colorStore.muted};">
                    {category.description}
                  </p>
                </div>
              </button>

              <!-- Per-Category Bulk Actions (in header) -->
              {#if expandedFeatureCategories[category.name]}
                <div class="flex gap-2 px-4 pb-3 border-t pt-3" style="border-color: {$colorStore.primary}20;">
                  <button
                    class="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                    style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30; focus:ring-color: {$colorStore.secondary};"
                    onclick={(e) => {
                      e.stopPropagation();
                      category.features.forEach(f => {
                        featureStates = {
                          ...featureStates,
                          [f.id]: 'full'
                        };
                      });
                    }}
                  >
                    <i class="fa-solid fa-layer-group" style="font-size: 12px;"></i>
                    Full Setup All
                  </button>
                  <button
                    class="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                    onclick={(e) => {
                      e.stopPropagation();
                      category.features.forEach(f => {
                        featureStates = {
                          ...featureStates,
                          [f.id]: 'quick'
                        };
                      });
                    }}
                  >
                    <i class="fa-solid fa-bolt" style="font-size: 12px;"></i>
                    Quick Enable All
                  </button>
                </div>
              {/if}
            </div>

            {#if expandedFeatureCategories[category.name]}
              <div
                class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 px-2"
                in:fly={{ y: -20, duration: 400 }}
                out:fly={{ y: -10, duration: 200 }}
              >
                {#each category.features as feature (feature.id)}
                  <FeatureSetupCard
                    id={feature.id}
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    setupState={featureStates[feature.id]}
                    recommended={feature.recommended}
                    setupTime={feature.setupTime}
                    difficulty={feature.difficulty}
                    benefits={feature.benefits}
                    onchange={handleFeatureStateChange}
                  />
                {/each}
              </div>
            {/if}
          </div>
        {/each}

        <!-- Selection summary -->
        {#if allEnabledFeatures.length > 0}
          <div class="p-6 rounded-xl border transition-all"
               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}25;"
               in:fly={{ y: 20, duration: 300 }}>
            <div class="text-center">
              <div class="mb-4">
                <span class="text-4xl font-bold animate-pulse" style="color: {$colorStore.primary};">
                  {allEnabledFeatures.length}
                </span>
                <p class="text-sm mt-1" style="color: {$colorStore.text};">
                  feature{allEnabledFeatures.length === 1 ? '' : 's'} selected
                </p>
              </div>

              <div class="grid grid-cols-2 gap-4 max-w-md mx-auto mb-4">
                <div class="p-3 rounded-lg transition-all"
                     style="background: {$colorStore.primary}10;"
                     in:scale={{ duration: 200, delay: 100 }}>
                  <div class="text-2xl font-bold" style="color: {$colorStore.primary};">
                    {fullSetupFeatures.length}
                  </div>
                  <div class="text-xs" style="color: {$colorStore.muted};">
                    Full Setup
                  </div>
                </div>
                <div class="p-3 rounded-lg transition-all"
                     style="background: {$colorStore.secondary}10;"
                     in:scale={{ duration: 200, delay: 150 }}>
                  <div class="text-2xl font-bold" style="color: {$colorStore.secondary};">
                    {quickEnableFeatures.length}
                  </div>
                  <div class="text-xs" style="color: {$colorStore.muted};">
                    Quick Enable
                  </div>
                </div>
              </div>

              <!-- Selected Features Pills with Animation -->
              <div class="flex flex-wrap justify-center gap-2">
                {#each allEnabledFeatures as featureId, index (featureId)}
                  {@const feature = allFeatures.find(f => f.id === featureId)}
                  {#if feature}
                    <div
                      class="px-3 py-1 rounded-full text-xs font-medium"
                      style="background: {featureStates[featureId] === 'full' ? $colorStore.secondary + '20' : $colorStore.primary + '20'};
                             color: {featureStates[featureId] === 'full' ? $colorStore.secondary : $colorStore.primary};
                             border: 1px solid {featureStates[featureId] === 'full' ? $colorStore.secondary + '40' : $colorStore.primary + '40'};"
                      in:fly={{ x: -20, duration: 300, delay: index * 50 }}
                      out:fly={{ x: 20, duration: 200 }}
                    >
                      <i class="fa-solid {featureStates[featureId] === 'full' ? 'fa-layer-group' : 'fa-bolt'}"
                         style="font-size: 10px;"></i>
                      {feature.title}
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          </div>
        {/if}

        <!-- Navigation -->
        <div class="flex items-center justify-between gap-3 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
          <button
            class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center gap-2 min-h-[44px]"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30; focus:ring-color: {$colorStore.muted};"
            onclick={previousStep}
          >
            <i class="fa-solid fa-arrow-left" style="font-size: 16px;"></i>
            Back
          </button>

          <button
            class="px-4 sm:px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
            onclick={() => {
              nextStep();
              if (fullSetupFeatures.length > 0) {
                startFeatureConfig(fullSetupFeatures[0]);
              }
            }}
            disabled={!canProceed}
          >
            <span class="truncate">
              {allEnabledFeatures.length > 0 ? 'Configure Features' : 'Select a feature'}
            </span>
            <i class="fa-solid fa-arrow-right shrink-0" style="font-size: 16px;"></i>
          </button>
        </div>
      </div>
    </WizardStep>

    <!-- Full Setup Configuration Steps -->
    {#if configPhase && currentConfigFeature}
      {@const feature = allFeatures.find(f => f.id === currentConfigFeature)}
      {#if feature}
        <WizardStep
          title="Configure {feature.title}"
          subtitle={feature.description}
          stepNumber={currentStep}
          isActive={true}
          icon={feature.icon}
          maxWidth="max-w-6xl"
        >
          <div class="config-step-stack">
          {#key `${currentConfigFeature}-${currentConfigStep}`}
            <div
              class="config-step-pane"
              in:fly|global={{ y: 20, duration: 400, delay: 300, easing: cubicOut }}
              out:fade|global={{ duration: 250 }}
            >
              <ProgressiveFeatureConfig
                featureId={feature.id}
                featureName={feature.title}
                steps={feature.steps}
                bind:currentStep={currentConfigStep}
                bind:config={featureConfigs[feature.id]}
                channels={availableChannels}
                roles={availableRoles}
                categories={availableCategories}
                placeholders={allPlaceholders}
                guildId={data.guildId}
                user={data.user}
                onnext={handleFeatureConfigNext}
                onback={handleFeatureConfigBack}
                onskip={handleFeatureConfigSkip}
              >
                {#snippet children({ step, config })}
                  <!-- Custom configuration for specific feature steps -->
                  {#if feature.id === 'rolegreets' && step.id === 'role'}
                    <div class="space-y-4">
                      <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                      Select Role
                    </span>
                        <DiscordSelector
                          type="role"
                          options={availableRoles}
                          bind:selected={config.roleId}
                          placeholder="Choose a role to greet for..."
                        />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          When members get this role, they'll receive a congratulations message
                        </p>
                      </div>
                    </div>
                  {:else if feature.id === 'xp' && step.id === 'rates'}
                    <div class="space-y-4">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label for="xp-text-rate" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text};">
                            XP per Message
                          </label>
                          <input
                            id="xp-text-rate"
                            type="number"
                            min="1"
                            max="10"
                            class="w-full px-3 py-2 rounded-lg border"
                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            bind:value={config.textRate}
                          />
                          <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                            Recommended: 3-5 for balanced leveling
                          </p>
                        </div>
                        <div>
                          <label for="xp-voice-rate" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text};">
                            Voice XP per Minute
                          </label>
                          <input
                            id="xp-voice-rate"
                            type="number"
                            min="1"
                            max="10"
                            class="w-full px-3 py-2 rounded-lg border"
                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            bind:value={config.voiceRate}
                          />
                          <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                            Recommended: 2-3 for voice activity
                          </p>
                        </div>
                      </div>
                    </div>
                  {:else if feature.id === 'xp' && step.id === 'rewards'}
                    <div class="space-y-4">
                      <div class="p-4 rounded-lg border"
                           style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <h4 class="font-semibold mb-2" style="color: {$colorStore.text};">
                          Role Rewards
                        </h4>
                        <p class="text-sm mb-4" style="color: {$colorStore.muted};">
                          Give roles when members reach specific levels. You can add more later in the dashboard.
                        </p>

                        {#if !config.roleRewards}
                          {config.roleRewards = []}
                        {/if}

                        {#if config.roleRewards.length === 0}
                          <button
                            class="w-full px-4 py-3 rounded-lg border-2 border-dashed transition-all hover:scale-[1.01]"
                            style="border-color: {$colorStore.primary}30; color: {$colorStore.primary};"
                            onclick={() => config.roleRewards = [{ level: 5, roleId: null }, { level: 10, roleId: null }, { level: 25, roleId: null }]}
                          >
                            <i class="fa-solid fa-plus" style="font-size: 18px;"></i>
                            <span class="block mt-2 font-medium">Add Level Rewards</span>
                          </button>
                        {:else}
                          <div class="space-y-3">
                            {#each config.roleRewards as reward, index}
                              <div class="flex items-center gap-3">
                                <input
                                  type="number"
                                  min="1"
                                  max="1000"
                                  class="w-20 px-3 py-2 rounded-lg border"
                                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  bind:value={reward.level}
                                  placeholder="Level"
                                />
                                <div class="flex-1">
                                  <DiscordSelector
                                    type="role"
                                    options={availableRoles}
                                    bind:selected={reward.roleId}
                                    placeholder="Choose reward role..."
                                  />
                            </div>
                                <button
                                  class="p-2 rounded-lg transition-all hover:scale-[1.02]"
                                  style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                                  onclick={() => removeRoleReward(config, index)}
                                  aria-label="Remove reward"
                                >
                                  <i class="fa-solid fa-trash" style="font-size: 14px;"></i>
                                </button>
                              </div>
                            {/each}
                            <button
                              class="w-full px-3 py-2 rounded-lg transition-all hover:scale-[1.01]"
                              style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                              onclick={() => addRoleReward(config)}
                            >
                              <i class="fa-solid fa-plus" style="font-size: 12px;"></i>
                              Add Another Reward
                            </button>
                          </div>
                        {/if}
                      </div>
                    </div>
                  {:else if feature.id === 'xp' && step.id === 'exclusions'}
                    <div class="space-y-4">
                      <ChannelBulkSelector
                        channels={availableChannels}
                        categories={availableCategories}
                        bind:selected={config.excludedChannels}
                        mode="multiple"
                        label="Exclude Channels from XP"
                        placeholder="Choose channels to exclude..."
                        detectedPattern={detectChannelsForFeature('xp-exclude')}
                      />
                      <p class="text-sm" style="color: {$colorStore.muted};">
                        Members won't gain XP in these channels. Useful for bot channels, counting, etc.
                      </p>
                    </div>
                  {:else if feature.id === 'starboard' && step.id === 'config'}
                    <div class="space-y-4">
                      <div class="flex items-center justify-between mb-2">
                        <h4 class="text-sm font-semibold" style="color: {$colorStore.text};">
                          Starboard Channels
                        </h4>
                        <button
                          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                          onclick={() => {
                        config.starboards = [...config.starboards, { channelId: null, threshold: 3, emoji: "⭐" }];
                      }}
                        >
                          <i class="fa-solid fa-plus" style="font-size: 12px;"></i>
                          Add Starboard
                        </button>
                      </div>

                      {#each config.starboards as starboard, index (index)}
                        <div class="p-4 rounded-lg border"
                             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                          <div class="flex items-start justify-between gap-3 mb-3">
                        <span class="text-sm font-medium" style="color: {$colorStore.text};">
                          Starboard #{index + 1}
                        </span>
                            {#if config.starboards.length > 1}
                              <button
                                class="px-2 py-1 rounded text-xs transition-all hover:scale-[1.05]"
                                style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                                aria-label="Remove starboard {index + 1}"
                                onclick={() => {
                              config.starboards = config.starboards.filter((_: unknown, i: number) => i !== index);
                            }}
                              >
                                <i class="fa-solid fa-trash" style="font-size: 11px;"></i>
                              </button>
                        {/if}
                          </div>

                          <div class="space-y-3">
                            <div>
                              <label for="f-+page-channel-2383" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                                Channel
                              </label>
                              <DiscordSelector id="f-+page-channel-2383"
                                type="channel"
                                options={availableChannels}
                                bind:selected={starboard.channelId}
                                placeholder="Choose starboard channel..."
                              />
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                              <div>
                                <label for="f-+page-threshold-2396" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                                  Threshold
                                </label>
                                <input id="f-+page-threshold-2396"
                                  type="number"
                                  min="1"
                                  max="20"
                                  class="w-full px-3 py-2 rounded-lg border"
                                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  bind:value={starboard.threshold}
                                />
                                <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                                  Reactions needed
                                </p>
                              </div>
                              <div>
                                <label for="f-+page-emoji-2412" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                                  Emoji
                                </label>
                                <input id="f-+page-emoji-2412"
                                  type="text"
                                  maxlength="4"
                                  class="w-full px-3 py-2 rounded-lg border text-center"
                                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  bind:value={starboard.emoji}
                                  placeholder="⭐"
                                />
                                <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                                  Each must be unique
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      {/each}
                </div>
                  {:else if feature.id === 'logging' && step.id === 'channels'}
                    <BulkNotificationSetup
                      bind:features={loggingEvents}
                      channels={availableChannels}
                      title="Configure Event Logging"
                      description="Choose which events to log and where"
                      onchange={() => {
                    // loggingEvents is already bound and reactive
                  }}
                    />
                  {:else if feature.id === 'administration' && step.id === 'roles'}
                <div class="space-y-6">
                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                      <i class="fa-solid fa-users" style="font-size: 14px;"></i>
                      Normal User Roles
                    </span>
                    <DiscordSelector
                      type="role"
                      options={availableRoles}
                      bind:selected={config.normalRoles}
                      multiple={true}
                      placeholder="Select roles for normal users..."
                    />
                    <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                      These roles will be assigned to new members when they join
                    </p>
                  </div>

                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                      <i class="fa-solid fa-robot" style="font-size: 14px;"></i>
                      Bot User Roles (Optional)
                    </span>
                    <DiscordSelector
                      type="role"
                      options={availableRoles}
                      bind:selected={config.botRoles}
                      multiple={true}
                      placeholder="Select roles for bot users..."
                    />
                    <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                      These roles will be assigned to bots when they join (helps organize bots)
                    </p>
                  </div>
                </div>
                  {:else if feature.id === 'confessions' && step.id === 'config'}
                    <div class="space-y-4">
                      <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                      Confession Channel
                    </span>
                        <DiscordSelector
                          type="channel"
                          options={availableChannels}
                          bind:selected={config.channelId}
                          placeholder="Where should confessions be posted?"
                        />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Members will submit anonymous confessions to this channel
                        </p>
                      </div>

                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                      Log Channel (Staff Only - Shows User IDs)
                    </span>
                    <DiscordSelector
                      type="channel"
                      options={availableChannels}
                      bind:selected={config.logChannelId}
                      placeholder="Optional: Staff moderation channel"
                    />

                    <!-- BIG WARNING -->
                    <div class="p-4 rounded-lg border-2 mt-3" style="background: #ef444410; border-color: #ef4444;">
                      <div class="flex items-start gap-3">
                        <i class="fa-solid fa-triangle-exclamation"
                           style="color: #ef4444; font-size: 20px; margin-top: 2px;"></i>
                        <div>
                          <h5 class="font-bold text-sm mb-2" style="color: #ef4444;">
                            CRITICAL WARNING
                          </h5>
                          <p class="text-xs" style="color: #ef4444;">
                            The log channel reveals user IDs of anonymous confessions. Abusing this feature (sharing
                            IDs, punishing users for confessions) will result in <strong>immediate blacklisting</strong>
                            of your server from Mewdeko. This feature is for moderation only (removing illegal content,
                            etc.).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                    </div>
                  {:else if feature.id === 'suggestions' && step.id === 'channels'}
                <div class="space-y-6">
                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                      <i class="fa-solid fa-lightbulb" style="font-size: 14px;"></i>
                      Suggestion Channel (Required)
                    </span>
                    <DiscordSelector
                      type="channel"
                      options={availableChannels}
                      bind:selected={config.channelId}
                      placeholder="Where should suggestions be posted?"
                    />
                    <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                      Members will submit suggestions here
                    </p>
                  </div>

                  <!-- Optional Workflow Channels -->
                  <div class="p-4 rounded-lg border"
                       style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                    <h4 class="font-semibold mb-3 text-sm" style="color: {$colorStore.text};">
                      Optional: Workflow Channels
                    </h4>
                    <p class="text-xs mb-4" style="color: {$colorStore.muted};">
                      Configure separate channels for different suggestion states
                    </p>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span class="block text-xs font-medium mb-2" style="color: {$colorStore.text};">
                          <i class="fa-solid fa-check" style="font-size: 12px; color: #10b981;"></i>
                          Accepted
                        </span>
                        <DiscordSelector
                          type="channel"
                          options={availableChannels}
                          bind:selected={config.acceptChannelId}
                          placeholder="Optional"
                        />
                      </div>

                      <div>
                        <span class="block text-xs font-medium mb-2" style="color: {$colorStore.text};">
                          <i class="fa-solid fa-xmark" style="font-size: 12px; color: #ef4444;"></i>
                          Denied
                        </span>
                        <DiscordSelector
                          type="channel"
                          options={availableChannels}
                          bind:selected={config.denyChannelId}
                          placeholder="Optional"
                        />
                      </div>

                      <div>
                        <span class="block text-xs font-medium mb-2" style="color: {$colorStore.text};">
                          <i class="fa-solid fa-clock" style="font-size: 12px; color: #f59e0b;"></i>
                          Under Consideration
                        </span>
                        <DiscordSelector
                          type="channel"
                          options={availableChannels}
                          bind:selected={config.considerChannelId}
                          placeholder="Optional"
                        />
                      </div>

                      <div>
                        <span class="block text-xs font-medium mb-2" style="color: {$colorStore.text};">
                          <i class="fa-solid fa-code" style="font-size: 12px; color: #8b5cf6;"></i>
                          Implemented
                        </span>
                        <DiscordSelector
                          type="channel"
                          options={availableChannels}
                          bind:selected={config.implementChannelId}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                  {:else if feature.id === 'birthday' && step.id === 'channel'}
                    <div class="space-y-4">
                      <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                      Birthday Announcement Channel
                    </span>
                        <DiscordSelector
                          type="channel"
                          options={availableChannels}
                          bind:selected={config.channelId}
                          placeholder="Where should birthday announcements go?"
                        />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Birthday announcements will be posted here automatically
                        </p>
                      </div>

                      <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                      Birthday Role (Optional)
                    </span>
                        <DiscordSelector
                          type="role"
                          options={availableRoles}
                          bind:selected={config.roleId}
                          placeholder="Optional role for birthday members..."
                        />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Members will get this role on their birthday (removed the next day)
                        </p>
                      </div>
                    </div>
                  {:else if feature.id === 'protection' && step.id === 'raid'}
                    <div class="space-y-4">
                      <div class="p-4 rounded-lg border"
                           style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <label class="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" class="mt-1 w-5 h-5 shrink-0" bind:checked={config.antiRaid.enabled} />
                          <span>
                            <span class="block font-semibold text-sm" style="color: {$colorStore.text};">
                              Anti-Raid
                            </span>
                            <span class="block text-xs mt-1" style="color: {$colorStore.muted};">
                              Acts when a burst of members joins at once
                            </span>
                          </span>
                        </label>

                        {#if config.antiRaid.enabled}
                          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                            <div>
                              <label for="raid-threshold" class="block text-xs font-medium mb-2"
                                     style="color: {$colorStore.text};">
                                Members
                              </label>
                              <input id="raid-threshold" type="number" min="2" max="30"
                                     class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                     bind:value={config.antiRaid.userThreshold} />
                            </div>
                            <div>
                              <label for="raid-seconds" class="block text-xs font-medium mb-2"
                                     style="color: {$colorStore.text};">
                                Within (seconds)
                              </label>
                              <input id="raid-seconds" type="number" min="2" max="300"
                                     class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                     bind:value={config.antiRaid.seconds} />
                            </div>
                            <div>
                              <span class="block text-xs font-medium mb-2" style="color: {$colorStore.text};">
                                Punishment
                              </span>
                              <DiscordSelector
                                type="custom"
                                customIcon="fa-gavel"
                                options={wizardPunishmentActions}
                                selected={String(config.antiRaid.action)}
                                onchange={(detail) => config.antiRaid.action = Number(detail.selected)}
                                placeholder="Choose action..."
                              />
                            </div>
                          </div>
                          <p class="text-xs mt-3" style="color: {$colorStore.muted};">
                            Triggers when {config.antiRaid.userThreshold} members join within
                            {config.antiRaid.seconds} seconds.
                          </p>
                        {/if}
                      </div>

                      <div class="p-4 rounded-lg border"
                           style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <label class="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" class="mt-1 w-5 h-5 shrink-0" bind:checked={config.antiSpam.enabled} />
                          <span>
                            <span class="block font-semibold text-sm" style="color: {$colorStore.text};">
                              Anti-Spam
                            </span>
                            <span class="block text-xs mt-1" style="color: {$colorStore.muted};">
                              Acts when someone repeats the same message
                            </span>
                          </span>
                        </label>

                        {#if config.antiSpam.enabled}
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            <div>
                              <label for="spam-threshold" class="block text-xs font-medium mb-2"
                                     style="color: {$colorStore.text};">
                                Repeated messages
                              </label>
                              <input id="spam-threshold" type="number" min="2" max="10"
                                     class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                     bind:value={config.antiSpam.messageThreshold} />
                            </div>
                            <div>
                              <span class="block text-xs font-medium mb-2" style="color: {$colorStore.text};">
                                Punishment
                              </span>
                              <DiscordSelector
                                type="custom"
                                customIcon="fa-gavel"
                                options={wizardPunishmentActions}
                                selected={String(config.antiSpam.action)}
                                onchange={(detail) => config.antiSpam.action = Number(detail.selected)}
                                placeholder="Choose action..."
                              />
                            </div>
                          </div>
                        {/if}
                      </div>
                    </div>
                  {:else if feature.id === 'protection' && step.id === 'alts'}
                    <div class="space-y-4">
                      <div class="p-4 rounded-lg border"
                           style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <label class="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" class="mt-1 w-5 h-5 shrink-0" bind:checked={config.antiAlt.enabled} />
                          <span>
                            <span class="block font-semibold text-sm" style="color: {$colorStore.text};">
                              Anti-Alt
                            </span>
                            <span class="block text-xs mt-1" style="color: {$colorStore.muted};">
                              Acts on accounts younger than a minimum age
                            </span>
                          </span>
                        </label>

                        {#if config.antiAlt.enabled}
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            <div>
                              <label for="alt-age" class="block text-xs font-medium mb-2"
                                     style="color: {$colorStore.text};">
                                Minimum account age (hours)
                              </label>
                              <input id="alt-age" type="number" min="1" max="8760"
                                     class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                     value={Math.round(config.antiAlt.minAgeMinutes / 60)}
                                     oninput={(e) => config.antiAlt.minAgeMinutes = Math.max(1, Number(e.currentTarget.value)) * 60} />
                            </div>
                            <div>
                              <span class="block text-xs font-medium mb-2" style="color: {$colorStore.text};">
                                Punishment
                              </span>
                              <DiscordSelector
                                type="custom"
                                customIcon="fa-gavel"
                                options={wizardPunishmentActions}
                                selected={String(config.antiAlt.action)}
                                onchange={(detail) => config.antiAlt.action = Number(detail.selected)}
                                placeholder="Choose action..."
                              />
                            </div>
                          </div>
                        {/if}
                      </div>

                      <div class="p-4 rounded-lg border"
                           style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <label class="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" class="mt-1 w-5 h-5 shrink-0"
                                 bind:checked={config.antiMassMention.enabled} />
                          <span>
                            <span class="block font-semibold text-sm" style="color: {$colorStore.text};">
                              Anti-Mass-Mention
                            </span>
                            <span class="block text-xs mt-1" style="color: {$colorStore.muted};">
                              Acts on members who mention many people at once
                            </span>
                          </span>
                        </label>

                        {#if config.antiMassMention.enabled}
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            <div>
                              <label for="mention-threshold" class="block text-xs font-medium mb-2"
                                     style="color: {$colorStore.text};">
                                Mentions allowed
                              </label>
                              <input id="mention-threshold" type="number" min="2" max="50"
                                     class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                     bind:value={config.antiMassMention.mentionThreshold} />
                            </div>
                            <div>
                              <span class="block text-xs font-medium mb-2" style="color: {$colorStore.text};">
                                Punishment
                              </span>
                              <DiscordSelector
                                type="custom"
                                customIcon="fa-gavel"
                                options={wizardPunishmentActions}
                                selected={String(config.antiMassMention.action)}
                                onchange={(detail) => config.antiMassMention.action = Number(detail.selected)}
                                placeholder="Choose action..."
                              />
                            </div>
                          </div>
                        {/if}
                      </div>
                    </div>
                  {:else if feature.id === 'moderation' && step.id === 'config'}
                    <div class="space-y-4">
                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Warning Log Channel
                        </span>
                        <DiscordSelector
                          type="channel"
                          options={availableChannels}
                          bind:selected={config.warnlogChannelId}
                          placeholder="Where should warnings be logged?"
                        />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Full warning details are posted here
                        </p>
                      </div>

                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Short Warning Log (Optional)
                        </span>
                        <DiscordSelector
                          type="channel"
                          options={availableChannels}
                          bind:selected={config.miniWarnlogChannelId}
                          placeholder="Optional condensed log channel"
                        />
                      </div>

                      <div>
                        <label for="warn-expire" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text};">
                          Warnings Expire After (hours)
                        </label>
                        <input id="warn-expire" type="number" min="0" max="8760"
                               class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                               bind:value={config.warnExpireHours} />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Set to 0 to keep warnings forever
                        </p>
                      </div>
                    </div>
                  {:else if feature.id === 'tickets' && step.id === 'panel'}
                    <div class="space-y-4">
                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Panel Channel
                        </span>
                        <DiscordSelector
                          type="channel"
                          options={availableChannels}
                          bind:selected={config.panelChannelId}
                          placeholder="Where should the ticket panel be posted?"
                        />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Members click a button here to open a ticket
                        </p>
                      </div>

                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Ticket Category
                        </span>
                        <DiscordSelector
                          type="custom"
                          customIcon="fa-folder"
                          options={availableCategories}
                          bind:selected={config.categoryId}
                          placeholder="Choose category for tickets..."
                        />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Ticket channels will be created under this category
                        </p>
                      </div>

                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Support Roles
                        </span>
                        <DiscordSelector
                          type="role"
                          options={availableRoles}
                          bind:selected={config.supportRoles}
                          multiple={true}
                          placeholder="Who should see and answer tickets?"
                        />
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label for="panel-title" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text};">
                            Panel Title
                          </label>
                          <input id="panel-title" type="text" maxlength="256"
                                 class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 bind:value={config.panelTitle} />
                        </div>
                        <div>
                          <label for="button-label" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text};">
                            Button Label
                          </label>
                          <input id="button-label" type="text" maxlength="80"
                                 class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 bind:value={config.buttonLabel} />
                        </div>
                      </div>

                      <div>
                        <label for="panel-description" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text};">
                          Panel Description
                        </label>
                        <textarea id="panel-description" rows="3"
                                  class="w-full px-3 py-2 rounded-lg border resize-none"
                                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  bind:value={config.panelDescription}></textarea>
                      </div>
                    </div>
                  {:else if feature.id === 'rolestates' && step.id === 'config'}
                    <div class="space-y-4">
                      <label class="flex items-start gap-3 p-4 rounded-lg border cursor-pointer"
                             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <input type="checkbox" class="mt-1 w-5 h-5 shrink-0" bind:checked={config.ignoreBots} />
                        <span>
                          <span class="block font-semibold text-sm" style="color: {$colorStore.text};">
                            Ignore bots
                          </span>
                          <span class="block text-xs mt-1" style="color: {$colorStore.muted};">
                            Don't save or restore roles for bot accounts
                          </span>
                        </span>
                      </label>

                      <label class="flex items-start gap-3 p-4 rounded-lg border cursor-pointer"
                             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <input type="checkbox" class="mt-1 w-5 h-5 shrink-0" bind:checked={config.clearOnBan} />
                        <span>
                          <span class="block font-semibold text-sm" style="color: {$colorStore.text};">
                            Clear saved roles on ban
                          </span>
                          <span class="block text-xs mt-1" style="color: {$colorStore.muted};">
                            A banned member who is later unbanned starts fresh
                          </span>
                        </span>
                      </label>
                    </div>
                  {:else if feature.id === 'reputation' && step.id === 'config'}
                    <div class="space-y-4">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label for="rep-cooldown" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text};">
                            Cooldown (minutes)
                          </label>
                          <input id="rep-cooldown" type="number" min="0" max="10080"
                                 class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 bind:value={config.cooldownMinutes} />
                          <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                            How long before a member can give rep again
                          </p>
                        </div>
                        <div>
                          <label for="rep-daily" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text};">
                            Daily limit
                          </label>
                          <input id="rep-daily" type="number" min="1" max="100"
                                 class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 bind:value={config.dailyLimit} />
                        </div>
                      </div>

                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Announcement Channel (Optional)
                        </span>
                        <DiscordSelector
                          type="channel"
                          options={availableChannels}
                          bind:selected={config.notificationChannelId}
                          placeholder="Announce reputation changes here"
                        />
                      </div>

                      <label class="flex items-start gap-3 p-4 rounded-lg border cursor-pointer"
                             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <input type="checkbox" class="mt-1 w-5 h-5 shrink-0" bind:checked={config.enableAnonymous} />
                        <span>
                          <span class="block font-semibold text-sm" style="color: {$colorStore.text};">
                            Allow anonymous reputation
                          </span>
                          <span class="block text-xs mt-1" style="color: {$colorStore.muted};">
                            Members can give rep without revealing who they are
                          </span>
                        </span>
                      </label>

                      <label class="flex items-start gap-3 p-4 rounded-lg border cursor-pointer"
                             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <input type="checkbox" class="mt-1 w-5 h-5 shrink-0" bind:checked={config.enableNegative} />
                        <span>
                          <span class="block font-semibold text-sm" style="color: {$colorStore.text};">
                            Allow negative reputation
                          </span>
                          <span class="block text-xs mt-1" style="color: {$colorStore.muted};">
                            Members can take reputation away as well as give it
                          </span>
                        </span>
                      </label>
                    </div>
                  {:else if feature.id === 'roles' && step.id === 'core'}
                    <div class="space-y-4">
                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Staff Role
                        </span>
                        <DiscordSelector
                          type="role"
                          options={availableRoles}
                          bind:selected={config.staffRoleId}
                          placeholder="Which role are your moderators?"
                        />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Used by permission checks and staff-only features
                        </p>
                      </div>

                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Member Role (Optional)
                        </span>
                        <DiscordSelector
                          type="role"
                          options={availableRoles}
                          bind:selected={config.memberRoleId}
                          placeholder="Which role marks a verified member?"
                        />
                      </div>
                    </div>
                  {:else if feature.id === 'roles' && step.id === 'selfassign'}
                    <div class="space-y-4">
                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Self-Assignable Roles
                        </span>
                        <DiscordSelector
                          type="role"
                          options={availableRoles}
                          bind:selected={config.selfAssignableRoles}
                          multiple={true}
                          placeholder="Roles members can give themselves..."
                        />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Members claim these with the <code>.iam</code> command. Colour and pronoun roles are
                          the usual picks.
                        </p>
                      </div>
                    </div>
                  {:else if feature.id === 'statusroles' && step.id === 'config'}
                    <div class="space-y-4">
                      <div>
                        <label for="status-text" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text};">
                          Status Text
                        </label>
                        <input id="status-text" type="text" maxlength="128"
                               class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                               bind:value={config.status}
                               placeholder="discord.gg/yourserver" />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Members whose custom status contains this text get the roles below
                        </p>
                      </div>

                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Roles to Grant
                        </span>
                        <DiscordSelector
                          type="role"
                          options={availableRoles}
                          bind:selected={config.addRoles}
                          multiple={true}
                          placeholder="Roles to give while the status matches..."
                        />
                      </div>

                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Announcement Channel (Optional)
                        </span>
                        <DiscordSelector
                          type="channel"
                          options={availableChannels}
                          bind:selected={config.channelId}
                          placeholder="Announce when someone qualifies"
                        />
                      </div>
                    </div>
                  {:else if feature.id === 'customvoice' && step.id === 'hub'}
                    <div class="space-y-4">
                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Hub Voice Channel
                        </span>
                        <DiscordSelector
                          type="custom"
                          customIcon="fa-microphone"
                          options={availableVoiceChannels}
                          bind:selected={config.hubChannelId}
                          placeholder="Which channel do members join to get a room?"
                        />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Joining this channel creates a personal voice channel and moves the member into it
                        </p>
                      </div>

                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Category (Optional)
                        </span>
                        <DiscordSelector
                          type="custom"
                          customIcon="fa-folder"
                          options={availableCategories}
                          bind:selected={config.categoryId}
                          placeholder="Where should new channels be created?"
                        />
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label for="cv-name" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text};">
                            Channel Name Format
                          </label>
                          <input id="cv-name" type="text" maxlength="100"
                                 class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 bind:value={config.defaultNameFormat} />
                        </div>
                        <div>
                          <label for="cv-limit" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text};">
                            Default User Limit
                          </label>
                          <input id="cv-limit" type="number" min="0" max="99"
                                 class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 bind:value={config.defaultUserLimit} />
                          <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                            0 means unlimited
                          </p>
                        </div>
                      </div>

                      <label class="flex items-start gap-3 p-4 rounded-lg border cursor-pointer"
                             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <input type="checkbox" class="mt-1 w-5 h-5 shrink-0" bind:checked={config.deleteWhenEmpty} />
                        <span>
                          <span class="block font-semibold text-sm" style="color: {$colorStore.text};">
                            Delete channels when empty
                          </span>
                          <span class="block text-xs mt-1" style="color: {$colorStore.muted};">
                            Keeps your channel list from filling up with dead rooms
                          </span>
                        </span>
                      </label>
                    </div>
                  {:else if feature.id === 'feeds' && step.id === 'feeds'}
                    <div class="space-y-4">
                      {#each config.entries as entry, index (index)}
                        <div class="p-4 rounded-lg border space-y-3"
                             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                          <div class="flex items-center justify-between gap-2">
                            <span class="text-sm font-medium" style="color: {$colorStore.text};">
                              Feed #{index + 1}
                            </span>
                            {#if config.entries.length > 1}
                              <button class="px-2 py-1 rounded text-xs transition-all hover:scale-[1.05]"
                                      style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                                      aria-label="Remove feed {index + 1}"
                                      onclick={() => config.entries = config.entries.filter((_: unknown, i: number) => i !== index)}>
                                <i class="fa-solid fa-trash" style="font-size: 11px;"></i>
                              </button>
                            {/if}
                          </div>
                          <input type="url"
                                 class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 bind:value={entry.url}
                                 placeholder="https://example.com/feed.xml"
                                 aria-label="Feed URL {index + 1}" />
                          <DiscordSelector
                            type="channel"
                            options={availableChannels}
                            bind:selected={entry.channelId}
                            placeholder="Post new items to..."
                          />
                        </div>
                      {/each}
                      <button class="w-full px-3 py-2 rounded-lg transition-all hover:scale-[1.01] min-h-[44px]"
                              style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                              onclick={() => config.entries = [...config.entries, { url: '', channelId: null }]}>
                        <i class="fa-solid fa-plus" style="font-size: 12px;"></i>
                        Add Another Feed
                      </button>
                    </div>
                  {:else if feature.id === 'streams' && step.id === 'streams'}
                    <div class="space-y-4">
                      {#each config.entries as entry, index (index)}
                        <div class="p-4 rounded-lg border space-y-3"
                             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                          <div class="flex items-center justify-between gap-2">
                            <span class="text-sm font-medium" style="color: {$colorStore.text};">
                              Stream #{index + 1}
                            </span>
                            {#if config.entries.length > 1}
                              <button class="px-2 py-1 rounded text-xs transition-all hover:scale-[1.05]"
                                      style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                                      aria-label="Remove stream {index + 1}"
                                      onclick={() => config.entries = config.entries.filter((_: unknown, i: number) => i !== index)}>
                                <i class="fa-solid fa-trash" style="font-size: 11px;"></i>
                              </button>
                            {/if}
                          </div>
                          <input type="url"
                                 class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 bind:value={entry.url}
                                 placeholder="https://twitch.tv/username"
                                 aria-label="Stream URL {index + 1}" />
                          <DiscordSelector
                            type="channel"
                            options={availableChannels}
                            bind:selected={entry.channelId}
                            placeholder="Announce going live in..."
                          />
                        </div>
                      {/each}
                      <button class="w-full px-3 py-2 rounded-lg transition-all hover:scale-[1.01] min-h-[44px]"
                              style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                              onclick={() => config.entries = [...config.entries, { url: '', channelId: null }]}>
                        <i class="fa-solid fa-plus" style="font-size: 12px;"></i>
                        Add Another Stream
                      </button>

                      <label class="flex items-start gap-3 p-4 rounded-lg border cursor-pointer"
                             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <input type="checkbox" class="mt-1 w-5 h-5 shrink-0"
                               bind:checked={config.offlineNotifications} />
                        <span>
                          <span class="block font-semibold text-sm" style="color: {$colorStore.text};">
                            Also announce when a stream ends
                          </span>
                        </span>
                      </label>
                    </div>
                  {:else if feature.id === 'repeaters' && step.id === 'config'}
                    <div class="space-y-4">
                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Channel
                        </span>
                        <DiscordSelector
                          type="channel"
                          options={availableChannels}
                          bind:selected={config.channelId}
                          placeholder="Where should the message repeat?"
                        />
                      </div>

                      <div>
                        <label for="repeat-message" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text};">
                          Message
                        </label>
                        <textarea id="repeat-message" rows="4"
                                  class="w-full px-3 py-2 rounded-lg border resize-none"
                                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  bind:value={config.message}
                                  placeholder="Remember to read the rules in #rules!"></textarea>
                      </div>

                      <div>
                        <label for="repeat-interval" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text};">
                          Repeat Every (minutes)
                        </label>
                        <input id="repeat-interval" type="number" min="5" max="10080"
                               class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                               bind:value={config.intervalMinutes} />
                      </div>

                      <label class="flex items-start gap-3 p-4 rounded-lg border cursor-pointer"
                             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <input type="checkbox" class="mt-1 w-5 h-5 shrink-0" bind:checked={config.noRedundant} />
                        <span>
                          <span class="block font-semibold text-sm" style="color: {$colorStore.text};">
                            Skip if it's still the last message
                          </span>
                          <span class="block text-xs mt-1" style="color: {$colorStore.muted};">
                            Avoids spamming a quiet channel
                          </span>
                        </span>
                      </label>
                    </div>
                  {:else if feature.id === 'votes' && step.id === 'config'}
                    <div class="space-y-4">
                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Vote Announcement Channel
                        </span>
                        <DiscordSelector
                          type="channel"
                          options={availableChannels}
                          bind:selected={config.channelId}
                          placeholder="Where should votes be announced?"
                        />
                      </div>

                      <div>
                        <label for="vote-message" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text};">
                          Thank You Message
                        </label>
                        <textarea id="vote-message" rows="3"
                                  class="w-full px-3 py-2 rounded-lg border resize-none"
                                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  bind:value={config.message}></textarea>
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Supports placeholders like %user.mention%
                        </p>
                      </div>

                      <div>
                        <label for="vote-password" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text};">
                          Webhook Password
                        </label>
                        <input id="vote-password" type="text"
                               class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                               bind:value={config.password}
                               placeholder="Paste the same secret you set on top.gg" />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Must match the authorization secret configured in your top.gg webhook settings
                        </p>
                      </div>
                    </div>
                  {:else if feature.id === 'statchannels' && step.id === 'stats'}
                    <div class="space-y-4">
                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Category (Optional)
                        </span>
                        <DiscordSelector
                          type="custom"
                          customIcon="fa-folder"
                          options={availableCategories}
                          bind:selected={config.categoryId}
                          placeholder="Where should the counters be created?"
                        />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          A locked voice channel is created for each counter you pick below
                        </p>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {#each wizardStatChannelTypes as statType (statType.type)}
                          <label class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                                 style="background: {config.statTypes.includes(statType.type) ? $colorStore.primary + '10' : $colorStore.primary + '05'};
                                        border-color: {config.statTypes.includes(statType.type) ? $colorStore.primary + '40' : $colorStore.primary + '20'};">
                            <input type="checkbox" class="mt-1 w-5 h-5 shrink-0"
                                   checked={config.statTypes.includes(statType.type)}
                                   onchange={() => {
                                     config.statTypes = config.statTypes.includes(statType.type)
                                       ? config.statTypes.filter((t: number) => t !== statType.type)
                                       : [...config.statTypes, statType.type];
                                   }} />
                            <span>
                              <span class="block font-semibold text-sm" style="color: {$colorStore.text};">
                                {statType.label}
                              </span>
                              <span class="block text-xs mt-1" style="color: {$colorStore.muted};">
                                {statType.description}
                              </span>
                            </span>
                          </label>
                        {/each}
                      </div>
                    </div>
                  {:else if feature.id === 'invitetracking' && step.id === 'config'}
                    <div class="space-y-4">
                      <div class="p-4 rounded-lg border"
                           style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <p class="text-sm" style="color: {$colorStore.text};">
                          Invite tracking will be turned on for this server.
                        </p>
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Mewdeko needs the Manage Server permission to read invite counts.
                        </p>
                      </div>

                      <label class="flex items-start gap-3 p-4 rounded-lg border cursor-pointer"
                             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <input type="checkbox" class="mt-1 w-5 h-5 shrink-0" bind:checked={config.removeOnLeave} />
                        <span>
                          <span class="block font-semibold text-sm" style="color: {$colorStore.text};">
                            Subtract invites when a member leaves
                          </span>
                          <span class="block text-xs mt-1" style="color: {$colorStore.muted};">
                            Keeps the leaderboard honest against invite farming
                          </span>
                        </span>
                      </label>

                      <div>
                        <label for="invite-min-age" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text};">
                          Minimum Account Age (days)
                        </label>
                        <input id="invite-min-age" type="number" min="0" max="365"
                               class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                               bind:value={config.minAccountAgeDays} />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Joins from newer accounts won't count towards invites. 0 disables the check.
                        </p>
                      </div>
                    </div>
                  {:else if feature.id === 'afk' && step.id === 'config'}
                    <div class="space-y-4">
                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Clear AFK When
                        </span>
                        <DiscordSelector
                          type="custom"
                          customIcon="fa-moon"
                          options={wizardAfkTypes}
                          selected={String(config.afkType)}
                          onchange={(detail) => config.afkType = Number(detail.selected)}
                          placeholder="Choose behaviour..."
                        />
                      </div>

                      <div>
                        <label for="afk-message" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text};">
                          Custom AFK Message (Optional)
                        </label>
                        <textarea id="afk-message" rows="3"
                                  class="w-full px-3 py-2 rounded-lg border resize-none"
                                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  bind:value={config.customMessage}
                                  placeholder="%user.mention% is AFK: %afk.message%"></textarea>
                      </div>

                      <div>
                        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                          Disable AFK In (Optional)
                        </span>
                        <DiscordSelector
                          type="channel"
                          options={availableChannels}
                          bind:selected={config.disabledChannels}
                          multiple={true}
                          placeholder="Channels where AFK replies are noise..."
                        />
                      </div>
                    </div>
                  {/if}
                {/snippet}
              </ProgressiveFeatureConfig>
            </div>
          {/key}
          </div>
        </WizardStep>
      {/if}
    {/if}

    <!-- Quick Enable Bulk Setup -->
    {#if !configPhase && quickEnableFeatures.length > 0 && currentStep === quickSetupStep}
      <WizardStep
        title="Quick Enable Features"
        subtitle="Configure essential settings for features you're quick enabling"
        stepNumber={currentStep}
        isActive={true}
        icon="fa-solid fa-bolt"
        maxWidth="max-w-6xl"
      >
        <div class="space-y-6">
          <BulkNotificationSetup
            bind:features={quickEnableFeaturesData}
            channels={availableChannels}
            title="Quick Feature Setup"
            description="Set basic channels for quick-enabled features"
            onchange={(detail) => {
              detail.features.forEach(f => {
                if (featureConfigs[f.id]) {
                  featureConfigs[f.id].channelId = f.channelId;
                }
              });
            }}
          />

          {#if actionError}
            <div class="p-4 rounded-lg border" style="background: #ef444415; border-color: #ef444440; color: #ef4444;">
              <div class="flex items-start gap-2">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 16px; margin-top: 2px;"></i>
                <p class="text-sm">{actionError}</p>
              </div>
            </div>
          {/if}

          <div class="flex items-center justify-between gap-3 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
            <button
              class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center gap-2 min-h-[44px]"
              style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30; focus:ring-color: {$colorStore.muted};"
              onclick={previousStep}
            >
              <i class="fa-solid fa-arrow-left" style="font-size: 16px;"></i>
              Back
            </button>

            <button
              class="px-4 sm:px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
              onclick={completeWizard}
              disabled={wizardLoading}
            >
              <span class="truncate">{wizardLoading ? 'Completing...' : 'Complete Setup'}</span>
              <i class="fa-solid fa-check shrink-0" style="font-size: 16px;"></i>
            </button>
          </div>
        </div>
      </WizardStep>
    {/if}

    <!-- Completion Step -->
    <WizardStep
      title="Setup Complete!"
      subtitle="{guild.name} is now ready to go with your selected features."
      stepNumber={totalSteps}
      isActive={currentStep === totalSteps}
      icon="fa-solid fa-circle-check"
      showStepNumber={false}
    >
      <div class="text-center space-y-6">
        <div class="flex justify-center">
          <div class="w-20 h-20 rounded-full flex items-center justify-center animate-pulse"
               style="background: {$colorStore.accent}20;">
            <i class="fa-solid fa-circle-check" style="color: {$colorStore.accent}; font-size: 48px;"></i>
          </div>
        </div>

        {#if configuredFeatureIds.length > 0}
          <div class="p-4 rounded-lg border"
               style="background: {$colorStore.accent}10; border-color: {$colorStore.accent}30;">
            <h3 class="font-semibold mb-2" style="color: {$colorStore.text};">Features Configured:</h3>
            <div class="flex flex-wrap justify-center gap-2">
              {#each configuredFeatureIds as featureId (featureId)}
                {@const feature = allFeatures.find(f => f.id === featureId)}
                {#if feature}
                  <span class="px-3 py-1 rounded-full text-sm font-medium"
                        style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
                    {feature.title}
                  </span>
                {/if}
              {/each}
            </div>
          </div>
        {/if}

        {#if failedFeatures.length > 0}
          <div class="p-4 rounded-lg border text-left"
               style="background: #f59e0b15; border-color: #f59e0b40;">
            <h3 class="font-semibold mb-2 flex items-center gap-2" style="color: #f59e0b;">
              <i class="fa-solid fa-triangle-exclamation" style="font-size: 16px;"></i>
              Could not be set up
            </h3>
            <div class="flex flex-wrap gap-2 mb-2">
              {#each failedFeatures as featureId (featureId)}
                {@const feature = allFeatures.find(f => f.id === featureId)}
                {#if feature}
                  <span class="px-3 py-1 rounded-full text-sm font-medium"
                        style="background: #f59e0b25; color: #f59e0b;">
                    {feature.title}
                  </span>
                {/if}
              {/each}
            </div>
            <p class="text-sm" style="color: {$colorStore.muted};">
              Everything else was saved. Set these up from the dashboard, and check that Mewdeko has the
              permissions they need.
            </p>
          </div>
        {/if}

        <div class="space-y-2">
          <p class="text-lg" style="color: {$colorStore.text};">
            Redirecting to dashboard...
          </p>
          <p class="text-sm" style="color: {$colorStore.muted};">
            You can configure additional features and fine-tune settings there.
          </p>
        </div>
      </div>
    </WizardStep>
  {/if}
</div>

<style>
    .wizard-container {
        overflow-x: hidden;
        /* Steps share one grid cell so an outgoing and incoming step overlap
           instead of stacking, which would otherwise double the page height
           mid-transition and flash a scrollbar */
        display: grid;
        grid-template-columns: 100%;
        grid-template-rows: auto auto;
        align-content: start;
    }

    .wizard-container > :global(.wizard-step) {
        grid-column: 1;
        grid-row: 2;
    }

    /* Same overlay treatment for the per-feature config panes */
    .config-step-stack {
        display: grid;
        grid-template-columns: 100%;
    }

    .config-step-stack > :global(.config-step-pane) {
        grid-column: 1;
        grid-row: 1;
    }
</style>
