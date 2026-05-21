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
    birthdayApi,
    clientApi,
    confessionsApi,
    countingApi,
    loggingApi,
    multiGreetApi,
    roleGreetApi,
    starboardApi,
    suggestionsApi,
    wizardApi,
    xpApi
  } from "$lib/api/index.ts";

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

  // Feature states
  type FeatureState = "full" | "quick" | "skip";
  let featureStates = $state<Record<string, FeatureState>>({
    multigreets: "skip",
    rolegreets: "skip",
    logging: "skip",
    administration: "skip",
    xp: "skip",
    starboard: "skip",
    suggestions: "skip",
    moderation: "skip",
    tickets: "skip",
    giveaways: "skip",
    confessions: "skip",
    counting: "skip",
    birthday: "skip"
  });

  // Feature configurations
  let featureConfigs = $state<Record<string, any>>({
    multigreets: {
      channelId: null,
      channelIds: [],
      message: "Welcome to %server.name%, %user.mention%! 🎉",
      messageStyle: "plain",
      embeds: [],
      components: [],
      applyToMultiple: false
    },
    rolegreets: {
      roleId: null,
      channelId: null,
      message: "Congratulations %user.mention% on getting the %role.name% role! 🎉",
      messageStyle: "plain",
      embeds: [],
      components: []
    },
    logging: {
      // Logging events are tracked in loggingEvents state array
    },
    administration: {
      normalRoles: [],
      botRoles: []
    },
    xp: {
      textRate: 3,
      voiceRate: 2,
      levelChannelId: null,
      roleRewards: [],
      excludedChannels: []
    },
    starboard: {
      starboards: [
        { channelId: null, threshold: 3, emoji: "⭐" }
      ]
    },
    suggestions: {
      channelId: null,
      acceptChannelId: null,
      denyChannelId: null,
      considerChannelId: null,
      implementChannelId: null
    },
    moderation: {
      logChannelId: null,
      muteRoleId: null
    },
    tickets: {
      categoryId: null
    },
    giveaways: {
      // Giveaways are configured per-event in the dashboard
      // No persistent configuration needed for wizard
    },
    confessions: {
      channelId: null,
      logChannelId: null
    },
    counting: {
      channelId: null
    },
    birthday: {
      channelId: null,
      roleId: null,
      message: "Happy Birthday, %user.mention%! 🎉🎂",
      messageStyle: "plain",
      embeds: [],
      components: []
    }
  });

  // Current configuration step tracking
  let configPhase = $state(false);
  let currentConfigFeature = $state<string | null>(null);
  let currentConfigStep = $state(0);

  // Channels and roles
  let availableChannels = $state<any[]>([]);
  let availableRoles = $state<any[]>([]);
  let availableCategories = $state<any[]>([]);
  let channelsLoading = $state(false);

  // Dependency suggestions
  let suggestions = $state<any[]>([]);

  // Expanded feature categories (Essential expanded by default)
  let expandedFeatureCategories = $state<Record<string, boolean>>({
    "Essential": true,
    "Community Growth": false,
    "Moderation & Support": false
  });

  // Logging events for bulk setup - comprehensive list with correct FA icons
  let loggingEvents = $state([
    // Essential events (enabled by default)
    {
      id: "UserJoined",
      name: "Member Joins",
      icon: "fa-solid fa-user-plus",
      description: "When members join the server",
      enabled: true,
      channelId: null as string | null,
      category: "Members"
    },
    {
      id: "UserLeft",
      name: "Member Leaves",
      icon: "fa-solid fa-user-minus",
      description: "When members leave the server",
      enabled: true,
      channelId: null as string | null,
      category: "Members"
    },
    {
      id: "MessageDeleted",
      name: "Message Deletions",
      icon: "fa-solid fa-trash",
      description: "When messages are deleted",
      enabled: true,
      channelId: null as string | null,
      category: "Messages"
    },

    // Additional member events (collapsed)
    {
      id: "UserBanned",
      name: "Member Bans",
      icon: "fa-solid fa-gavel",
      description: "When members are banned",
      enabled: false,
      channelId: null as string | null,
      category: "Members"
    },
    {
      id: "UserUnbanned",
      name: "Member Unbans",
      icon: "fa-solid fa-user-check",
      description: "When members are unbanned",
      enabled: false,
      channelId: null as string | null,
      category: "Members"
    },
    {
      id: "UserMuted",
      name: "Member Mutes",
      icon: "fa-solid fa-volume-xmark",
      description: "When members are muted/timed out",
      enabled: false,
      channelId: null as string | null,
      category: "Members"
    },
    {
      id: "UserRoleAdded",
      name: "Roles Added",
      icon: "fa-solid fa-circle-plus",
      description: "When roles are added to members",
      enabled: false,
      channelId: null as string | null,
      category: "Members"
    },
    {
      id: "UserRoleRemoved",
      name: "Roles Removed",
      icon: "fa-solid fa-circle-minus",
      description: "When roles are removed from members",
      enabled: false,
      channelId: null as string | null,
      category: "Members"
    },

    // Message events (collapsed)
    {
      id: "MessageUpdated",
      name: "Message Edits",
      icon: "fa-solid fa-pen",
      description: "When messages are edited",
      enabled: false,
      channelId: null as string | null,
      category: "Messages"
    },

    // User profile events (collapsed)
    {
      id: "UsernameUpdated",
      name: "Username Changes",
      icon: "fa-solid fa-user-pen",
      description: "When usernames are changed",
      enabled: false,
      channelId: null as string | null,
      category: "User Updates"
    },
    {
      id: "NicknameUpdated",
      name: "Nickname Changes",
      icon: "fa-solid fa-signature",
      description: "When nicknames are changed",
      enabled: false,
      channelId: null as string | null,
      category: "User Updates"
    },
    {
      id: "AvatarUpdated",
      name: "Avatar Changes",
      icon: "fa-solid fa-image-portrait",
      description: "When avatars are changed",
      enabled: false,
      channelId: null as string | null,
      category: "User Updates"
    },

    // Channel events (collapsed)
    {
      id: "ChannelCreated",
      name: "Channel Created",
      icon: "fa-solid fa-plus",
      description: "When channels are created",
      enabled: false,
      channelId: null as string | null,
      category: "Channels"
    },
    {
      id: "ChannelDestroyed",
      name: "Channel Deleted",
      icon: "fa-solid fa-trash",
      description: "When channels are deleted",
      enabled: false,
      channelId: null as string | null,
      category: "Channels"
    },
    {
      id: "ChannelUpdated",
      name: "Channel Updated",
      icon: "fa-solid fa-pen",
      description: "When channel settings change",
      enabled: false,
      channelId: null as string | null,
      category: "Channels"
    },

    // Role events (collapsed)
    {
      id: "RoleCreated",
      name: "Role Created",
      icon: "fa-solid fa-plus",
      description: "When roles are created",
      enabled: false,
      channelId: null as string | null,
      category: "Roles"
    },
    {
      id: "RoleDeleted",
      name: "Role Deleted",
      icon: "fa-solid fa-trash",
      description: "When roles are deleted",
      enabled: false,
      channelId: null as string | null,
      category: "Roles"
    },
    {
      id: "RoleUpdated",
      name: "Role Updated",
      icon: "fa-solid fa-pen",
      description: "When role settings change",
      enabled: false,
      channelId: null as string | null,
      category: "Roles"
    },

    // Thread events (collapsed)
    {
      id: "ThreadCreated",
      name: "Thread Created",
      icon: "fa-solid fa-comments",
      description: "When threads are created",
      enabled: false,
      channelId: null as string | null,
      category: "Threads"
    },
    {
      id: "ThreadDeleted",
      name: "Thread Deleted",
      icon: "fa-solid fa-trash",
      description: "When threads are deleted",
      enabled: false,
      channelId: null as string | null,
      category: "Threads"
    },
    {
      id: "ThreadUpdated",
      name: "Thread Updated",
      icon: "fa-solid fa-pen",
      description: "When thread settings change",
      enabled: false,
      channelId: null as string | null,
      category: "Threads"
    },

    // Voice events (collapsed)
    {
      id: "VoicePresence",
      name: "Voice Activity",
      icon: "fa-solid fa-microphone",
      description: "When members join/leave voice channels",
      enabled: false,
      channelId: null as string | null,
      category: "Voice"
    },

    // Server events (collapsed)
    {
      id: "ServerUpdated",
      name: "Server Updated",
      icon: "fa-solid fa-server",
      description: "When server settings change",
      enabled: false,
      channelId: null as string | null,
      category: "Server"
    },
    {
      id: "EventCreated",
      name: "Event Created",
      icon: "fa-utility-duo fa-regular fa-calendar",
      description: "When server events are created",
      enabled: false,
      channelId: null as string | null,
      category: "Server"
    }
  ]);

  // Feature definitions with full details
  const featureCategories = [
    {
      name: "Essential",
      description: "Core features every server should consider",
      features: [
        {
          id: "multigreets",
          title: "Welcome Messages",
          description: "Greet new members when they join/leave",
          icon: "fa-utility-duo fa-regular fa-bell",
          recommended: true,
          difficulty: "easy" as const,
          setupTime: "3-5 min",
          benefits: [
            "Make new members feel welcome instantly",
            "Customize messages with embeds and buttons",
            "Set up multiple welcome channels",
            "Track member count in messages"
          ],
          steps: [
            {
              id: "channel",
              title: "Choose Channels",
              description: "Where should welcome messages be sent?",
              component: "channel" as const
            },
            {
              id: "message",
              title: "Design Message",
              description: "Create your welcome message",
              component: "message" as const
            }
          ]
        },
        {
          id: "rolegreets",
          title: "Role Messages",
          description: "Greet members when they get roles (perfect for verification)",
          icon: "fa-utility-duo fa-regular fa-user",
          recommended: true,
          difficulty: "easy" as const,
          setupTime: "2-4 min",
          benefits: [
            "Perfect for verification systems",
            "Celebrate staff promotions",
            "Reduce spam from unverified users",
            "Announce achievement roles"
          ],
          steps: [
            {
              id: "role",
              title: "Choose Role",
              description: "Which role should trigger the message?",
              component: "custom" as const
            },
            {
              id: "channel",
              title: "Choose Channel",
              description: "Where should the message be sent?",
              component: "channel" as const
            },
            {
              id: "message",
              title: "Design Message",
              description: "Create your role greet message",
              component: "message" as const
            }
          ]
        },
        {
          id: "logging",
          title: "Event Logging",
          description: "Track joins, leaves, and moderation actions",
          icon: "fa-utility-duo fa-regular fa-file",
          recommended: true,
          difficulty: "easy" as const,
          setupTime: "2-3 min",
          benefits: [
            "Track all member activity",
            "Monitor message edits and deletions",
            "Log moderation actions",
            "Separate logs by event type"
          ],
          steps: [
            {
              id: "channels",
              title: "Configure Logging",
              description: "Set up event log channels",
              component: "custom" as const
            }
          ]
        },
        {
          id: "administration",
          title: "Auto-Assign Roles",
          description: "Give roles to new members automatically",
          icon: "fa-utility-duo fa-regular fa-cog",
          recommended: false,
          difficulty: "easy" as const,
          setupTime: "2-3 min",
          benefits: [
            "Instant permissions for new members",
            "Distinguish members from bots",
            "Separate roles for users vs bots",
            "Grant channel access automatically"
          ],
          steps: [
            {
              id: "roles",
              title: "Choose Roles",
              description: "Select roles to auto-assign",
              component: "custom" as const
            }
          ]
        }
      ]
    },
    {
      name: "Community Growth",
      description: "Features to engage and grow your community",
      features: [
        {
          id: "xp",
          title: "XP & Leveling",
          description: "Reward active members with levels and role rewards",
          icon: "fa-utility-duo fa-regular fa-star",
          recommended: false,
          difficulty: "medium" as const,
          setupTime: "5-8 min",
          benefits: [
            "Reward active members",
            "Automatic role rewards at levels",
            "Exclude spam channels",
            "Voice and text XP tracking"
          ],
          steps: [
            { id: "rates", title: "XP Rates", description: "Configure XP earning rates", component: "custom" as const },
            {
              id: "rewards",
              title: "Role Rewards",
              description: "Set up level-based role rewards",
              component: "custom" as const
            },
            {
              id: "exclusions",
              title: "Exclusions",
              description: "Exclude channels from XP gain",
              component: "custom" as const
            }
          ]
        },
        {
          id: "starboard",
          title: "Starboard",
          description: "Highlight the best messages with reactions",
          icon: "fa-utility-duo fa-regular fa-star",
          recommended: false,
          difficulty: "easy" as const,
          setupTime: "2-3 min",
          benefits: [
            "Showcase community highlights",
            "Encourage positive interactions",
            "Custom star emoji and threshold",
            "Multiple starboards support"
          ],
          steps: [
            {
              id: "config",
              title: "Configure Starboard",
              description: "Set up your starboard",
              component: "custom" as const
            }
          ]
        },
        {
          id: "suggestions",
          title: "Suggestions",
          description: "Let members suggest server improvements",
          icon: "fa-utility-duo fa-regular fa-lightbulb",
          recommended: false,
          difficulty: "easy" as const,
          setupTime: "2-4 min",
          benefits: [
            "Gather community feedback",
            "Automatic voting reactions",
            "Staff approval workflow",
            "Optional channels for accepted/denied"
          ],
          steps: [
            {
              id: "channels",
              title: "Suggestion Channels",
              description: "Configure where suggestions are managed",
              component: "custom" as const
            }
          ]
        },
        {
          id: "giveaways",
          title: "Giveaways",
          description: "Host contests and events (configured per giveaway)",
          icon: "fa-utility-duo fa-regular fa-gift",
          recommended: false,
          difficulty: "easy" as const,
          setupTime: "N/A",
          benefits: [
            "Host engaging events",
            "Automatic winner selection",
            "Role and message requirements",
            "Multiple winners support",
            "Configured per-giveaway in dashboard"
          ],
          steps: []
        },
        {
          id: "confessions",
          title: "Anonymous Confessions",
          description: "Let members submit anonymous confessions",
          icon: "fa-utility-duo fa-regular fa-comment",
          recommended: false,
          difficulty: "easy" as const,
          setupTime: "2-3 min",
          benefits: [
            "Anonymous community feedback",
            "Staff moderation via log channel",
            "Build trust and openness",
            "Track confession statistics"
          ],
          steps: [
            {
              id: "config",
              title: "Confession Setup",
              description: "Configure confession channels",
              component: "custom" as const
            }
          ]
        },
        {
          id: "counting",
          title: "Counting Game",
          description: "Count to infinity (or chaos ensues)",
          icon: "fa-utility-duo fa-regular fa-hashtag",
          recommended: false,
          difficulty: "easy" as const,
          setupTime: "1 min",
          benefits: [
            "Fun community activity",
            "Simple but engaging",
            "Automatic number tracking",
            "Prevents duplicate counts"
          ],
          steps: [
            {
              id: "channel",
              title: "Counting Channel",
              description: "Where should counting happen?",
              component: "channel" as const
            }
          ]
        },
        {
          id: "birthday",
          title: "Birthday Celebrations",
          description: "Celebrate member birthdays automatically",
          icon: "fa-utility-duo fa-regular fa-birthday-cake",
          recommended: false,
          difficulty: "easy" as const,
          setupTime: "3-4 min",
          benefits: [
            "Auto birthday announcements",
            "Optional birthday role",
            "Customizable messages/embeds",
            "Never miss a birthday"
          ],
          steps: [
            {
              id: "channel",
              title: "Birthday Channel & Role",
              description: "Where to announce birthdays",
              component: "custom" as const
            },
            {
              id: "message",
              title: "Birthday Message",
              description: "Customize the birthday announcement",
              component: "message" as const
            }
          ]
        }
      ]
    },
    {
      name: "Moderation & Support",
      description: "Keep your server safe and organized",
      features: [
        {
          id: "moderation",
          title: "Moderation Tools",
          description: "Warning system for rule breakers",
          icon: "fa-utility-duo fa-regular fa-flag",
          recommended: false,
          difficulty: "medium" as const,
          setupTime: "3-5 min",
          benefits: [
            "Track warnings per user",
            "Automatic punishment thresholds",
            "Moderation logs",
            "Case management system"
          ],
          steps: [
            {
              id: "config",
              title: "Moderation Setup",
              description: "Configure moderation settings",
              component: "custom" as const
            }
          ]
        },
        {
          id: "tickets",
          title: "Support Tickets",
          description: "Private support channels for members",
          icon: "fa-utility-duo fa-regular fa-ticket",
          recommended: false,
          difficulty: "medium" as const,
          setupTime: "3-5 min",
          benefits: [
            "Private support channels",
            "Automatic ticket management",
            "Transcript saving",
            "Staff role permissions"
          ],
          steps: [
            {
              id: "category",
              title: "Ticket Category",
              description: "Where should tickets be created?",
              component: "custom" as const
            }
          ]
        }
      ]
    }
  ];

  // Flatten features - explicit type to avoid inference issues
  type Feature = {
    id: string;
    title: string;
    description: string;
    icon: string;
    recommended: boolean;
    difficulty: "easy" | "medium" | "advanced";
    setupTime: string;
    benefits: string[];
    steps: Array<{
      id: string;
      title: string;
      description: string;
      component: "channel" | "message" | "embed" | "custom"
    }>;
  };

  const allFeatures: Feature[] = [];
  featureCategories.forEach(cat => {
    cat.features.forEach(f => allFeatures.push(f));
  });

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

  let totalSteps = $derived.by(() => {
    const baseSteps = data.wizardType === "first-time" ? 3 : 2; // Welcome + (Permissions) + Features
    const configSteps = fullSetupFeatures.length; // One step per full setup feature
    const bulkStep = quickEnableFeatures.length > 0 ? 1 : 0; // One bulk config step
    return baseSteps + configSteps + bulkStep + 1; // +1 for completion
  });

  let currentStepTitle = $derived.by(() => {
    const titles: string[] = [
      "Welcome",
      ...(data.wizardType === "first-time" ? ["Permissions"] : []),
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

      const [channels, roles, categories] = await Promise.all([
        clientApi.getTextChannels(guildId).catch(() => []),
        clientApi.getRoles(guildId).catch(() => []),
        clientApi.getCategories(guildId).catch(() => [])
      ]);

      availableChannels = channels;
      availableRoles = roles;
      availableCategories = categories;

    } catch (err) {
      console.error("Error loading guild data:", err);
      availableChannels = [];
      availableRoles = [];
      availableCategories = [];
    } finally {
      channelsLoading = false;
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
        birthdayConfig
      ] = await Promise.all([
        multiGreetApi.getMultiGreets(guildId).catch(() => []),
        starboardApi.getStarboards(guildId).catch(() => []),
        xpApi.getXpSettings(guildId).catch(() => null),
        loggingApi.getLoggingConfig(guildId).catch(() => null),
        confessionsApi.getConfessionChannel(guildId).catch(() => null),
        confessionsApi.getConfessionLogChannel(guildId).catch(() => null),
        countingApi.getCountingChannels(guildId).catch(() => []),
        birthdayApi.getBirthdayConfig(guildId).catch(() => null)
      ]);

      if (multiGreets.length > 0) {
        const existing = multiGreets[0];

        // Parse message if it's JSON (contains embeds)
        let parsedMessage = existing.message || featureConfigs.multigreets.message;
        let parsedEmbeds = featureConfigs.multigreets.embeds;
        let parsedComponents = featureConfigs.multigreets.components;
        let parsedStyle = featureConfigs.multigreets.messageStyle;

        if (typeof existing.message === "string" && existing.message.startsWith("{")) {
          try {
            const messageObj = JSON.parse(existing.message);
            parsedMessage = messageObj.content || "";
            parsedEmbeds = messageObj.embeds || [];
            parsedComponents = messageObj.components || [];
            parsedStyle = parsedEmbeds.length > 0 ? (parsedComponents.length > 0 ? "embed-buttons" : "embed") : "plain";
          } catch (e) {
            // Not JSON, use as plain text
            parsedMessage = existing.message;
          }
        }

        featureConfigs.multigreets = {
          ...featureConfigs.multigreets,
          channelId: existing.channelId ? existing.channelId.toString() : null,
          message: parsedMessage,
          embeds: parsedEmbeds,
          components: parsedComponents,
          messageStyle: parsedStyle
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

      console.log("Loaded existing configurations:", featureConfigs);

    } catch (err) {
      console.warn("Error loading existing configurations:", err);
    }
  }

  // Smart channel detection
  function detectChannelsForFeature(featureId: string): string[] {
    const patterns: Record<string, string[]> = {
      multigreets: ["welcome", "greet", "general", "lobby"],
      rolegreets: ["welcome", "announcements", "roles"],
      logging: ["logs", "mod-log", "audit"],
      suggestions: ["suggest", "feedback", "ideas"],
      starboard: ["starboard", "best-of", "highlights"],
      giveaways: ["giveaway", "events", "contests"],
      confessions: ["confess", "anonymous", "secrets"],
      counting: ["count", "number", "game"],
      birthday: ["birthday", "bday", "celebration", "announcements"]
    };

    const featurePatterns = patterns[featureId] || [];
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
      if (detected.length > 0 && !featureConfigs[detail.id].channelId) {
        featureConfigs[detail.id].channelId = detected[0];
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
      const featureSelectionStep = data.wizardType === "first-time" ? 3 : 2;
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
      await wizardApi.skipWizard(BigInt(data.guildId), BigInt(data.user.id));
      goto(`/dashboard?guild=${data.guildId}`);
    } catch (error: any) {
      console.error("Error skipping wizard:", error);
      alert("Failed to skip wizard: " + (error?.message || "Unknown error"));
    } finally {
      wizardLoading = false;
      skipConfirmation = false;
    }
  }

  function cancelSkip() {
    skipConfirmation = false;
  }

  // Configuration helpers
  function buildFullMessage(config: any) {
    if (!config.embeds || config.embeds.length === 0) {
      return config.message;
    }

    const messageJson: any = {};
    if (config.message?.trim()) messageJson.content = config.message;
    if (config.embeds.length > 0) messageJson.embeds = config.embeds;
    if (config.components && config.components.length > 0) messageJson.components = config.components;

    return JSON.stringify(messageJson);
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
              const greetIndex = roleGreets.findIndex(rg =>
                rg.roleId.toString() === config.roleId &&
                rg.channelId.toString() === config.channelId
              );
              if (greetIndex !== -1) {
                const fullMessage = buildFullMessage(config);
                await roleGreetApi.updateRoleGreetMessage(guildId, greetIndex + 1, fullMessage);
              }
            } catch (err: any) {
              if (err.message && err.message.includes("Maximum number")) {
                const roleGreets = await roleGreetApi.getAllRoleGreets(guildId);
                const greetIndex = roleGreets.findIndex(rg => rg.roleId.toString() === config.roleId);
                if (greetIndex !== -1) {
                  const fullMessage = buildFullMessage(config);
                  await roleGreetApi.updateRoleGreetMessage(guildId, greetIndex + 1, fullMessage);
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
      }

      console.log(`Configured feature: ${featureId}`);
    } catch (error) {
      console.error(`Error configuring ${featureId}:`, error);
      throw error;
    }
  }

  // Complete wizard
  async function completeWizard() {
    try {
      wizardLoading = true;
      console.log("Starting wizard completion...");

      // Configure all quick enable features
      for (const featureId of quickEnableFeatures) {
        await configureFeature(featureId);
      }

      // Mark wizard as completed
      await wizardApi.completeWizard(BigInt(data.user.id), BigInt(data.guildId), allEnabledFeatures);

      completedSteps = [...completedSteps, currentStep];
      currentStep = totalSteps;

      setTimeout(() => {
        goto(`/dashboard?guild=${data.guildId}`);
      }, 2000);

    } catch (error: any) {
      console.error("Error completing wizard:", error);
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
      await configureFeature(currentConfigFeature);

      const currentIndex = fullSetupFeatures.indexOf(currentConfigFeature);
      if (currentIndex < fullSetupFeatures.length - 1) {
        // Move to next full setup feature
        nextStep();
        startFeatureConfig(fullSetupFeatures[currentIndex + 1]);
      } else {
        // Done with all full setup features
        configPhase = false;
        currentConfigFeature = null;
        nextStep();
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
    (currentStep === 2 && (data.wizardType === "quick-setup" || permissionData?.canFunction)) ||
    (currentStep === 3 && allEnabledFeatures.length > 0) ||
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
                <span>Choose features to configure</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-circle-check" style="color: {$colorStore.accent}; font-size: 16px;"></i>
                <span>Set up essential settings</span>
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

    <!-- Step 3: Feature Selection -->
    <WizardStep
      title="Choose Features"
      subtitle="Select which features you want to set up for your server."
      stepNumber={data.wizardType === 'first-time' ? 3 : 2}
      isActive={currentStep === (data.wizardType === 'first-time' ? 3 : 2)}
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
        <div class="flex items-center justify-between pt-6 border-t" style="border-color: {$colorStore.primary}20;">
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
            onclick={() => {
              nextStep();
              if (fullSetupFeatures.length > 0) {
                startFeatureConfig(fullSetupFeatures[0]);
              }
            }}
            disabled={!canProceed}
          >
            {allEnabledFeatures.length > 0 ? 'Configure Features' : 'Skip to Completion'}
            <i class="fa-solid fa-arrow-right" style="font-size: 16px;"></i>
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
          {#key `${currentConfigFeature}-${currentConfigStep}`}
            <div
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
                showPreview={!['logging', 'administration', 'moderation', 'tickets', 'xp', 'starboard', 'suggestions', 'confessions', 'counting'].includes(feature.id)}
                onnext={handleFeatureConfigNext}
                onback={handleFeatureConfigBack}
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
                  {:else if feature.id === 'moderation' && step.id === 'config'}
                    <div class="space-y-4">
                      <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                      Moderation Log Channel
                    </span>
                        <DiscordSelector
                          type="channel"
                          options={availableChannels}
                          bind:selected={config.logChannelId}
                          placeholder="Choose moderation log channel..."
                        />
                  </div>
                      <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                      Mute Role (Optional)
                    </span>
                        <DiscordSelector
                          type="role"
                          options={availableRoles}
                          bind:selected={config.muteRoleId}
                          placeholder="Choose mute role..."
                        />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          This role will be used for timing out members
                        </p>
                      </div>
                    </div>
                  {:else if feature.id === 'tickets' && step.id === 'category'}
                    <div class="space-y-4">
                      <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                      Ticket Category
                    </span>
                        <DiscordSelector
                          type="custom"
                          options={availableCategories}
                          bind:selected={config.categoryId}
                          placeholder="Choose category for tickets..."
                        />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Ticket channels will be created under this category
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
                  {/if}
                {/snippet}
              </ProgressiveFeatureConfig>
            </div>
          {/key}
        </WizardStep>
      {/if}
    {/if}

    <!-- Quick Enable Bulk Setup -->
    {#if !configPhase && quickEnableFeatures.length > 0 && currentStep === (data.wizardType === 'first-time' ? 3 : 2) + fullSetupFeatures.length + 1}
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

          <div class="flex items-center justify-between pt-6 border-t" style="border-color: {$colorStore.primary}20;">
            <button
              class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center gap-2"
              style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30; focus:ring-color: {$colorStore.muted};"
              onclick={previousStep}
            >
              <i class="fa-solid fa-arrow-left" style="font-size: 16px;"></i>
              Back
            </button>

            <button
              class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center gap-2"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
              onclick={completeWizard}
              disabled={wizardLoading}
            >
              {wizardLoading ? 'Completing...' : 'Complete Setup'}
              <i class="fa-solid fa-check" style="font-size: 16px;"></i>
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

        {#if allEnabledFeatures.length > 0}
          <div class="p-4 rounded-lg border"
               style="background: {$colorStore.accent}10; border-color: {$colorStore.accent}30;">
            <h3 class="font-semibold mb-2" style="color: {$colorStore.text};">Features Configured:</h3>
            <div class="flex flex-wrap justify-center gap-2">
              {#each allEnabledFeatures as featureId (featureId)}
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
    }
</style>
