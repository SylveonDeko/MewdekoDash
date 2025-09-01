<!--
@component
Main wizard page component that orchestrates the entire setup flow
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { colorStore } from '$lib/stores/colorStore';
  import type { PageData } from './$types';
  import {
      HandMetal,
      Shield,
      Star,
      Settings,
      CheckCircle,
      ArrowRight,
      ArrowLeft,
      SkipForward,
      AlertTriangle,
      RefreshCw, ExternalLink, TrendingUp
  } from 'lucide-svelte';
  
  // Components
  import WizardProgress from './components/WizardProgress.svelte';
  import WizardStep from './components/WizardStep.svelte';
  import FeatureCard from './components/FeatureCard.svelte';
  import PermissionCheck from './components/PermissionCheck.svelte';
  import DiscordSelector from '$lib/components/forms/DiscordSelector.svelte';
  import EmbedEditor from '$lib/components/specialized/EmbedEditor.svelte';
  import PreviewCard from '$lib/components/specialized/PreviewCard.svelte';
  import {api} from "$lib/api.ts";

  export let data: PageData;

  // Wizard state
  let currentStep = 1;
  let completedSteps: number[] = [];
  let selectedFeatures: string[] = [];
  let wizardLoading = false;
  let skipConfirmation = false;
  let permissionData: any = null;
  let permissionsLoading = true;
  let guild: any = null;
  let wizardState: any = null;
  let wizardDecision: any = null;
  let dataLoading = true;
  let dataError: string | null = null;
  
  // Feature configuration flow
  let currentConfigFeatureIndex = 0;
  let configurationComplete = false;

  // Dynamic step configuration based on selected features
  $: baseSteps = data.wizardType === 'first-time' ? 3 : 2; // Welcome + (Permissions) + Features
  $: configSteps = selectedFeatures.length; // One step per selected feature
  $: totalSteps = baseSteps + configSteps + 1; // +1 for completion
  $: currentConfiguredFeature = selectedFeatures[currentConfigFeatureIndex];
  
  $: stepTitles = [
    "Welcome",
    ...(data.wizardType === 'first-time' ? ["Permissions"] : []),
    "Features",
    ...selectedFeatures.map(id => allFeatures.find(f => f.id === id)?.title || id),
    "Complete"
  ];

  // Determine if we're in configuration phase
  $: isConfigurationStep = currentStep > baseSteps && currentStep <= baseSteps + configSteps;
  $: currentConfigStepIndex = currentStep - baseSteps - 1;

  // Import icons to match dashboard
  import { 
    Moon, Users, Tag, RotateCcw, Heart, MessageSquare, Link, Badge, Lock, Gift, Save
  } from 'lucide-svelte';

  // Smart feature selection - most popular/useful features for setup
  const featureCategories = [
    {
      name: "Essential",
      description: "Core features every server should consider",
      features: [
        { id: 'multigreets', title: 'Welcome Messages', description: 'Greet new members when they join/leave', icon: HandMetal, recommended: true, difficulty: 'easy' as const },
        { id: 'rolegreets', title: 'Role Messages', description: 'Greet members when they get roles (perfect for verification systems)', icon: Tag, recommended: true, difficulty: 'easy' as const },
        { id: 'logging', title: 'Event Logging', description: 'Track joins, leaves, and moderation actions', icon: Save, recommended: true, difficulty: 'easy' as const },
        { id: 'administration', title: 'Auto-Assign Roles', description: 'Give roles to new members automatically', icon: Badge, recommended: false, difficulty: 'easy' as const }
      ]
    },
    {
      name: "Community Growth", 
      description: "Features to engage and grow your community",
      features: [
        { id: 'xp', title: 'XP & Leveling', description: 'Reward active members with levels and role rewards', icon: Star, recommended: false, difficulty: 'medium' as const },
        { id: 'starboard', title: 'Starboard', description: 'Highlight the best messages with reactions', icon: Star, recommended: false, difficulty: 'easy' as const },
        { id: 'suggestions', title: 'Suggestions', description: 'Let members suggest server improvements', icon: Settings, recommended: false, difficulty: 'medium' as const },
        { id: 'giveaways', title: 'Giveaways', description: 'Host contests and events', icon: Gift, recommended: false, difficulty: 'easy' as const }
      ]
    },
    {
      name: "Moderation & Support",
      description: "Keep your server safe and organized", 
      features: [
        { id: 'moderation', title: 'Moderation Tools', description: 'Warning system for rule breakers', icon: Shield, recommended: false, difficulty: 'medium' as const },
        { id: 'tickets', title: 'Support Tickets', description: 'Private support channels for members', icon: MessageSquare, recommended: false, difficulty: 'medium' as const },
        { id: 'chat-triggers', title: 'Auto Responses', description: 'Bot responds to keywords automatically', icon: MessageSquare, recommended: false, difficulty: 'medium' as const }
      ]
    }
  ];

  // Flatten all features for easy access
  const allFeatures = featureCategories.flatMap(cat => cat.features);

  // Feature configuration state for essential settings
  let featureConfigs = {
    multigreets: {
      channelId: null,
      channelIds: [], // Support multiple channels
      message: "Welcome to %server.name%, %user.mention%! 🎉",
      embeds: [],
      components: [],
      applyToMultiple: false,
      useRichMessage: false
    },
    rolegreets: {
      roleId: null,
      channelId: null,
      message: "Congratulations %user.mention% on getting the %role.name% role! 🎉",
      embeds: [],
      components: [],
      useRichMessage: false
    },
    logging: {
      channelId: null
    },
    administration: {
      autoRoleId: null
    },
    xp: {
      textRate: 3,
      voiceRate: 2,
      levelChannelId: null
    },
    starboard: {
      channelId: null,
      threshold: 3,
      emoji: "⭐"
    },
    suggestions: {
      channelId: null
    },
    moderation: {
      logChannelId: null,
      muteRoleId: null
    },
    tickets: {
      categoryId: null
    },
    giveaways: {
      channelId: null
    }
  };

  let availableChannels = [];
  let availableRoles = [];
  let availableCategories = [];
  let channelsLoading = false;

  // Load all data client-side on mount
  onMount(async () => {
    await loadWizardData();
    
    if (data.wizardType === 'first-time') {
      await loadPermissions();
    }
    
    // Load existing feature configurations and channels
    await loadExistingConfigurations();
    await loadAvailableChannels();
  });

  async function loadExistingConfigurations() {
    if (!guild) return;
    
    try {
      const guildId = BigInt(data.guildId);
      
      // Load existing configurations in parallel
      const [multiGreets, starboards, xpSettings, loggingConfig] = await Promise.all([
        api.getMultiGreets(guildId).catch(() => []),
        api.getStarboards(guildId).catch(() => []),
        api.getXpSettings(guildId).catch(() => null),
        api.getLoggingConfig(guildId).catch(() => null)
      ]);
      
      // Pre-populate feature configs with existing data using correct property names
      if (multiGreets.length > 0) {
        const existing = multiGreets[0];
        featureConfigs.multigreets = {
          channelId: existing.channelId ? existing.channelId.toString() : null,
          message: existing.message || featureConfigs.multigreets.message
        };
      }
      
      if (starboards.length > 0) {
        const existing = starboards[0];
        featureConfigs.starboard = {
          channelId: existing.channelId ? existing.channelId.toString() : null,
          threshold: existing.threshold || 3,
          emoji: existing.emote || "⭐"
        };
      }
      
      if (xpSettings) {
        featureConfigs.xp = {
          textRate: xpSettings.xpPerMessage || 3,
          voiceRate: xpSettings.voiceMinutes || 2,
          levelChannelId: null // XP settings don't have level channel in the interface
        };
      }
      
      if (loggingConfig && loggingConfig.logChannels) {
        // Find a suitable log channel (prefer UserJoined, fallback to any configured channel)
        const logChannels = loggingConfig.logChannels || loggingConfig.logTypes || {};
        const joinChannel = logChannels.user_joined || logChannels.UserJoined;
        const anyChannel = Object.values(logChannels).find(ch => ch && ch !== '0');
        
        featureConfigs.logging = {
          channelId: joinChannel ? joinChannel.toString() : anyChannel ? anyChannel.toString() : null
        };
      }
      
      console.log('Loaded existing configurations:', featureConfigs);
      
    } catch (err) {
      console.warn('Error loading existing configurations:', err);
    }
  }

  async function loadAvailableChannels() {
    if (!guild) return;
    
    try {
      channelsLoading = true;
      const guildId = BigInt(data.guildId);
      
      // Load channels, roles, and categories in parallel
      const [channels, roles, categories] = await Promise.all([
        api.getGuildTextChannels(guildId).catch(() => []),
        api.getGuildRoles(guildId).catch(() => []),
        api.getGuildCategories(guildId).catch(() => [])
      ]);
      
      availableChannels = channels;
      availableRoles = roles;
      availableCategories = categories;
      
    } catch (err) {
      console.error('Error loading guild data:', err);
      availableChannels = [];
      availableRoles = [];
      availableCategories = [];
    } finally {
      channelsLoading = false;
    }
  }

  async function loadWizardData() {
    try {
      dataLoading = true;
      dataError = null;
      
      const guildId = BigInt(data.guildId);
      
      // Load guild info, wizard state, and decision in parallel
      const [userGuilds, wizardStateData, wizardDecisionData] = await Promise.all([
        api.getMutualGuilds(BigInt(data.user.id)),
        api.getGuildWizardState(guildId),
        api.shouldShowWizard(BigInt(data.user.id), guildId)
      ]);
      
      // Find the target guild
      guild = userGuilds?.find(g => g.id.toString() === data.guildId);
      if (!guild) {
        dataError = 'You do not have access to this guild';
        return;
      }
      
      wizardState = wizardStateData;
      wizardDecision = wizardDecisionData;
      
      // If wizard is already completed, redirect to dashboard
      if (wizardState.completed || wizardState.skipped) {
        goto(`/dashboard?guild=${data.guildId}`);
        return;
      }
      
      console.log('Wizard data loaded successfully:', { guild, wizardState, wizardDecision });
      
    } catch (err) {
      console.error('Error loading wizard data:', err);
      dataError = 'Failed to load wizard data';
    } finally {
      dataLoading = false;
    }
  }

  async function loadPermissions() {
    try {
      permissionsLoading = true;
      permissionData = await api.checkBotPermissions(BigInt(data.guildId));
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      permissionsLoading = false;
    }
  }

  function nextStep() {
    if (currentStep < totalSteps) {
      completedSteps = [...completedSteps, currentStep];
      currentStep++;
      
      // If we're entering configuration phase, reset the feature index
      if (isConfigurationStep && currentConfigStepIndex === 0) {
        currentConfigFeatureIndex = 0;
      }
    }
  }

  function previousStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  async function finishCurrentFeatureConfig() {
    const featureId = selectedFeatures[currentConfigStepIndex];
    
    console.log(`Configuring feature ${featureId} (${currentConfigStepIndex + 1} of ${selectedFeatures.length})`);
    
    try {
      wizardLoading = true;
      
      // Configure the current feature
      await configureFeature(featureId);
      
      // Check if this was the last feature
      if (currentConfigStepIndex === selectedFeatures.length - 1) {
        console.log('Last feature configured, completing wizard...');
        // Complete the wizard
        await completeWizard();
      } else {
        console.log('Moving to next feature configuration...');
        // Move to next feature configuration step
        completedSteps = [...completedSteps, currentStep];
        currentStep++;
      }
      
    } catch (error) {
      console.error(`Error configuring ${featureId}:`, error);
    } finally {
      wizardLoading = false;
    }
  }

  async function completeWizard() {
    try {
      console.log('Starting wizard completion...');
      console.log('User ID:', data.user.id, 'Guild ID:', data.guildId, 'Features:', selectedFeatures);
      
      // Mark wizard as completed
      const result = await api.completeWizard(BigInt(data.user.id), BigInt(data.guildId), selectedFeatures);
      console.log('Wizard completion result:', result);
      
      // Show completion step
      completedSteps = [...completedSteps, currentStep];
      currentStep = totalSteps;
      
      console.log('Wizard completed successfully with features:', selectedFeatures);
      console.log('Current step now:', currentStep, 'Total steps:', totalSteps);
      
      // Redirect after brief success display
      setTimeout(() => {
        console.log('Redirecting to dashboard...');
        goto(`/dashboard?guild=${data.guildId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error completing wizard:', error);
    }
  }

  async function configureFeature(featureId: string) {
    const guildId = BigInt(data.guildId);
    
    switch (featureId) {
      case 'multigreets':
        const channelsToSetup = featureConfigs.multigreets.applyToMultiple 
          ? featureConfigs.multigreets.channelIds 
          : featureConfigs.multigreets.channelId ? [featureConfigs.multigreets.channelId] : [];
        
        if (channelsToSetup.length > 0) {
          console.log(`Setting up MultiGreets for ${channelsToSetup.length} channels`);
          
          for (const channelId of channelsToSetup) {
            try {
              // Try to add a new MultiGreet for this channel
              await api.addMultiGreet(guildId, BigInt(channelId));
              console.log(`Created MultiGreet for channel ${channelId}`);
              
              // Update the message for the newly created greet
              const greets = await api.getMultiGreets(guildId);
              const newGreet = greets.find(g => g.channelId.toString() === channelId);
              if (newGreet) {
                const fullMessage = buildFullMessage(featureConfigs.multigreets);
                await api.updateMultiGreetMessage(guildId, newGreet.id, fullMessage);
                console.log(`Updated message for greet ${newGreet.id} in channel ${channelId}`);
              }
              
            } catch (err) {
              // If channel already has greets or limit reached, try to update existing ones
              if (err.message.includes('maximum greets')) {
                console.log(`Channel ${channelId} already has greets or limit reached, updating existing...`);
                const greets = await api.getMultiGreets(guildId);
                const existingGreet = greets.find(g => g.channelId.toString() === channelId);
                if (existingGreet) {
                  const fullMessage = buildFullMessage(featureConfigs.multigreets);
                  await api.updateMultiGreetMessage(guildId, existingGreet.id, fullMessage);
                  console.log(`Updated existing greet ${existingGreet.id} in channel ${channelId}`);
                }
              } else {
                console.error(`Error setting up MultiGreet for channel ${channelId}:`, err);
                // Don't throw - continue with other channels
              }
            }
          }
        }
        break;
        
      case 'rolegreets':
        if (featureConfigs.rolegreets.roleId && featureConfigs.rolegreets.channelId) {
          try {
            await api.addRoleGreet(guildId, BigInt(featureConfigs.rolegreets.roleId), BigInt(featureConfigs.rolegreets.channelId));
            console.log(`Created RoleGreet for role ${featureConfigs.rolegreets.roleId} in channel ${featureConfigs.rolegreets.channelId}`);
            
            // Update the message
            const roleGreets = await api.getAllRoleGreets(guildId);
            const newRoleGreet = roleGreets.find(rg => 
              rg.roleId.toString() === featureConfigs.rolegreets.roleId && 
              rg.channelId.toString() === featureConfigs.rolegreets.channelId
            );
            if (newRoleGreet) {
              const fullMessage = buildFullMessage(featureConfigs.rolegreets);
              await api.updateRoleGreetMessage(guildId, newRoleGreet.id, fullMessage);
              console.log(`Updated message for role greet ${newRoleGreet.id}`);
            }
          } catch (err) {
            if (err.message.includes('Maximum number')) {
              console.log('Role already has maximum greets, updating existing...');
              const roleGreets = await api.getAllRoleGreets(guildId);
              const existingRoleGreet = roleGreets.find(rg => rg.roleId.toString() === featureConfigs.rolegreets.roleId);
              if (existingRoleGreet) {
                const fullMessage = buildFullMessage(featureConfigs.rolegreets);
                await api.updateRoleGreetMessage(guildId, existingRoleGreet.id, fullMessage);
                console.log(`Updated existing role greet ${existingRoleGreet.id}`);
              }
            } else {
              console.error(`Error setting up RoleGreet:`, err);
            }
          }
        }
        break;
        
      case 'logging':
        if (featureConfigs.logging.channelId) {
          // Use bulk update for logging since individual setLogChannel might have endpoint issues
          const channelId = BigInt(featureConfigs.logging.channelId);
          await api.bulkUpdateLogChannels(guildId, {
            logTypeMappings: [
              { LogType: 'UserJoined', ChannelId: channelId },
              { LogType: 'UserLeft', ChannelId: channelId },
              { LogType: 'MessageDeleted', ChannelId: channelId }
            ]
          });
        }
        break;
        
      case 'administration':
        if (featureConfigs.administration.autoRoleId) {
          await api.setAutoAssignRoles(guildId, [BigInt(featureConfigs.administration.autoRoleId)]);
        }
        break;
        
      case 'xp':
        // Configure XP settings with all required fields to avoid database constraints
        await api.updateXpSettings(guildId, {
          guildId: guildId,
          xpPerMessage: featureConfigs.xp.textRate,
          cooldownSeconds: 60,
          excludeChannels: "",
          excludeRoles: "",
          includeChannels: "",
          includeRoles: "",
          enabled: true,
          serverExcluded: false,
          notifyLevelUp: true,
          notifyMessage: "%user.mention% has reached level %level%!",
          txtTimeout: 60,
          voiceTimeout: 300,
          voiceMinutes: featureConfigs.xp.voiceRate,
          voiceXpMultiplier: 1.0,
          txtMultiplier: 1.0,
          customXpImageUrl: ""
        });
        break;
        
      case 'starboard':
        if (featureConfigs.starboard.channelId) {
          // Smart emote handling - try multiple fallback emotes
          const emoteOptions = [
            featureConfigs.starboard.emoji, // User's choice
            "🌟", "✨", "💫", "⭐", "🎭", "🏆", "💎", "🔥"  // Fallbacks
          ];
          
          let starboardCreated = false;
          
          for (const emote of emoteOptions) {
            try {
              await api.createStarboard(
                guildId, 
                BigInt(featureConfigs.starboard.channelId), 
                emote, 
                featureConfigs.starboard.threshold
              );
              console.log(`Created starboard with emote: ${emote}`);
              starboardCreated = true;
              break; // Success, stop trying
            } catch (err) {
              if (err.message.includes('already in use')) {
                console.log(`Emote ${emote} already in use, trying next...`);
                continue; // Try next emote
              } else {
                throw err; // Different error, re-throw
              }
            }
          }
          
          if (!starboardCreated) {
            console.warn('Could not create starboard - all fallback emotes in use');
            // Could also try to add emote to existing starboard instead
          }
        }
        break;
        
      case 'suggestions':
        if (featureConfigs.suggestions.channelId) {
          await api.setSuggestChannel(guildId, BigInt(featureConfigs.suggestions.channelId));
        }
        break;
    }
    
    console.log(`Configured feature: ${featureId}`);
  }

  function handleFeatureToggle(event: CustomEvent<{ id: string; selected: boolean }>) {
    const { id, selected } = event.detail;
    if (selected) {
      selectedFeatures = [...selectedFeatures, id];
    } else {
      selectedFeatures = selectedFeatures.filter(f => f !== id);
    }
  }

  async function skipWizard() {
    if (!skipConfirmation) {
      skipConfirmation = true;
      return;
    }

    try {
      wizardLoading = true;
      console.log('Skipping wizard for:', { guildId: data.guildId, userId: data.user.id });
      await api.skipWizard(BigInt(data.guildId), BigInt(data.user.id));
      console.log('Wizard skip successful, redirecting...');
      goto(`/dashboard?guild=${data.guildId}`);
    } catch (error) {
      console.error('Error skipping wizard:', error);
      // Add user feedback for skip errors
      alert('Failed to skip wizard: ' + (error.message || 'Unknown error'));
    } finally {
      wizardLoading = false;
      skipConfirmation = false;
    }
  }

  async function configureSelectedFeatures() {
    try {
      wizardLoading = true;
      const guildId = BigInt(data.guildId);
      const results = [];
      
      // Configure each selected feature with essential settings
      for (const featureId of selectedFeatures) {
        try {
          let success = false;
          
          switch (featureId) {
            case 'multigreets':
              if (featureConfigs.multigreets.channelId) {
                await api.addMultiGreet(guildId, BigInt(featureConfigs.multigreets.channelId));
                // Update the message if it was customized
                const greets = await api.getMultiGreets(guildId);
                if (greets.length > 0) {
                  await api.updateMultiGreetMessage(guildId, greets[0].id, featureConfigs.multigreets.message);
                }
                success = true;
              }
              break;
              
            case 'logging':
              if (featureConfigs.logging.channelId) {
                const channelId = BigInt(featureConfigs.logging.channelId);
                await api.setLogChannel(guildId, 'UserJoined', channelId);
                await api.setLogChannel(guildId, 'UserLeft', channelId);
                success = true;
              }
              break;
              
            case 'administration':
              if (featureConfigs.administration.autoRoleId) {
                await api.setAutoAssignRoles(guildId, [BigInt(featureConfigs.administration.autoRoleId)]);
                success = true;
              } else {
                success = true; // Enable without auto-role
              }
              break;
              
            case 'xp':
              // Configure XP with correct property names from actual XpSettings interface
              await api.updateXpSettings(guildId, {
                guildId: guildId,
                xpPerMessage: featureConfigs.xp.textRate,
                cooldownSeconds: 60,
                excludeChannels: null,
                excludeRoles: null,
                includeChannels: null,
                includeRoles: null,
                enabled: true,
                serverExcluded: false,
                notifyLevelUp: true,
                notifyMessage: null,
                txtTimeout: 60,
                voiceTimeout: 300,
                voiceMinutes: featureConfigs.xp.voiceRate,
                voiceXpMultiplier: 1.0,
                txtMultiplier: 1.0
              });
              success = true;
              break;
              
            case 'starboard':
              if (featureConfigs.starboard.channelId) {
                try {
                  await api.createStarboard(
                    guildId, 
                    BigInt(featureConfigs.starboard.channelId), 
                    featureConfigs.starboard.emoji, 
                    featureConfigs.starboard.threshold
                  );
                  success = true;
                } catch (err) {
                  // If emoji conflict, try with different emoji
                  if (err.message.includes('already in use')) {
                    await api.createStarboard(
                      guildId, 
                      BigInt(featureConfigs.starboard.channelId), 
                      "🌟", // Alternative emoji
                      featureConfigs.starboard.threshold
                    );
                    success = true;
                  } else {
                    throw err;
                  }
                }
              }
              break;
              
            case 'suggestions':
              if (featureConfigs.suggestions.channelId) {
                // Use the actual suggestions API method
                await api.setSuggestChannel(guildId, BigInt(featureConfigs.suggestions.channelId));
                success = true;
              }
              break;
              
            case 'moderation':
              // Enable moderation - basic setup will be done in dashboard  
              success = true;
              break;
              
            case 'tickets':
              // Enable tickets - basic setup will be done in dashboard
              success = true;
              break;
              
            case 'giveaways':
              if (featureConfigs.giveaways.channelId) {
                // Just enable giveaways - no specific setup needed
                success = true;
              }
              break;
              
            default:
              // For other features, just mark as enabled with defaults
              success = true;
              break;
          }
          
          results.push({ featureId, success });
          console.log(`Configured ${featureId}:`, success);
          
        } catch (err) {
          console.error(`Error configuring ${featureId}:`, err);
          results.push({ featureId, success: false, error: err });
        }
      }
      
      // Mark wizard as completed with successfully configured features
      const successfulFeatures = results.filter(r => r.success).map(r => r.featureId);
      await api.completeWizard(BigInt(data.user.id), guildId, successfulFeatures);
      
      // Show completion
      completedSteps = [...completedSteps, currentStep];
      currentStep = totalSteps;
      
      console.log('Wizard completed. Configuration results:', results);
      
      // Brief success message, then redirect to dashboard
      setTimeout(() => {
        goto(`/dashboard?guild=${data.guildId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error configuring features:', error);
    } finally {
      wizardLoading = false;
    }
  }

  function cancelSkip() {
    skipConfirmation = false;
  }

  // Helper to build full message with embeds/components like the repeaters system
  function buildFullMessage(config: any) {
    if (!config.useRichMessage || (config.embeds.length === 0 && config.components.length === 0)) {
      return config.message; // Plain text
    }
    
    // Build rich message JSON like repeaters
    const messageJson: any = {};
    if (config.message.trim()) messageJson.content = config.message;
    if (config.embeds.length > 0) messageJson.embeds = config.embeds;
    if (config.components.length > 0) messageJson.components = config.components;
    
    return JSON.stringify(messageJson);
  }

  // Helper to convert permission health status enum to user-friendly text
  function getHealthStatusText(status) {
    switch (status) {
      case 0:
      case 'Excellent':
        return 'Excellent';
      case 1: 
      case 'Good':
        return 'Good';
      case 2:
      case 'Warning':
        return 'Needs Attention';
      case 3:
      case 'Poor':
        return 'Critical Issues';
      default:
        return 'Unknown';
    }
  }

  function getHealthStatusDescription(status) {
    switch (status) {
      case 0:
      case 'Excellent':
        return 'All required permissions are present';
      case 1:
      case 'Good': 
        return 'Most permissions present, minor issues';
      case 2:
      case 'Warning':
        return 'Some important permissions missing';
      case 3:
      case 'Poor':
        return 'Critical permissions missing - bot may not work properly';
      default:
        return 'Unable to check permission status';
    }
  }

  $: canProceed = currentStep === 1 || 
    (currentStep === 2 && (data.wizardType === 'quick-setup' || permissionData?.canFunction)) ||
    (currentStep === 3 && selectedFeatures.length > 0) ||
    currentStep === totalSteps;

  $: stepIndex = data.wizardType === 'first-time' ? currentStep : 
    currentStep === 1 ? 1 : currentStep === 2 ? 3 : currentStep === 3 ? 4 : 5;

  // Show loading state until data is loaded
  $: showContent = !dataLoading && !dataError && guild;
</script>

<svelte:head>
  <title>Setup Wizard - {guild?.name || 'Loading...'} - Mewdeko</title>
</svelte:head>

<div class="wizard-container min-h-screen">
  <!-- Loading state -->
  {#if dataLoading}
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <RefreshCw class="w-8 h-8 animate-spin mx-auto mb-4" style="color: {$colorStore.primary};" />
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
          class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
          style="background: {$colorStore.primary}; color: white;"
          on:click={() => goto('/dashboard')}
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
        stepTitles={stepTitles}
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
    icon={HandMetal}
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
              <CheckCircle class="w-4 h-4" style="color: {$colorStore.accent};" />
              <span>Verify bot permissions</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle class="w-4 h-4" style="color: {$colorStore.accent};" />
              <span>Choose features to configure</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle class="w-4 h-4" style="color: {$colorStore.accent};" />
              <span>Set up essential settings</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle class="w-4 h-4" style="color: {$colorStore.accent};" />
              <span>Get your server ready to go!</span>
            </div>
          </div>
        </div>
      {/if}

      <!-- Action buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6">
        <button
          class="w-full sm:w-auto px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 min-h-[44px]"
          style="background: {$colorStore.primary}; color: white;"
          on:click={nextStep}
        >
          Get Started
          <ArrowRight class="w-4 h-4" />
        </button>
        
        <button
          class="w-full sm:w-auto px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 min-h-[44px]"
          style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
          on:click={skipWizard}
          disabled={wizardLoading}
        >
          {skipConfirmation ? 'Confirm Skip' : 'Skip Setup'}
          <SkipForward class="w-4 h-4" />
        </button>
      </div>

      {#if skipConfirmation}
        <div class="p-4 rounded-lg border" 
             style="background: #f59e0b15; border-color: #f59e0b30; color: #f59e0b;">
          <div class="flex items-center gap-2 mb-2">
            <AlertTriangle class="w-4 h-4" />
            <span class="font-medium">Skip setup?</span>
          </div>
          <p class="text-sm mb-3">You can always configure features later from the dashboard.</p>
          <div class="flex gap-2 justify-center">
            <button
              class="px-3 py-1 rounded text-sm font-medium transition-all"
              style="background: #f59e0b25; color: #f59e0b;"
              on:click={skipWizard}
              disabled={wizardLoading}
            >
              {wizardLoading ? 'Skipping...' : 'Yes, Skip'}
            </button>
            <button
              class="px-3 py-1 rounded text-sm font-medium transition-all"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
              on:click={cancelSkip}
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
      icon={Shield}
      maxWidth="max-w-5xl"
    >
      <div class="space-y-6">
        {#if permissionsLoading}
          <div class="flex items-center justify-center py-8">
            <RefreshCw class="w-6 h-6 animate-spin" style="color: {$colorStore.primary};" />
            <span class="ml-2" style="color: {$colorStore.text};">Checking permissions...</span>
          </div>
        {:else if permissionData}
          <!-- Permission health status -->
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

          <!-- Permission list -->
          <div class="relative">
            <div class="space-y-3 max-h-80 overflow-y-auto border rounded-lg p-2" 
                 style="border-color: {$colorStore.primary}20;">
              {#each permissionData.permissionResults as permission}
                <PermissionCheck
                  permission={permission.permissionName}
                  hasPermission={permission.hasPermission}
                  importance={permission.importance}
                  description={permission.description}
                  requiredForFeatures={permission.requiredForFeatures}
                />
              {/each}
            </div>
            
            <!-- Scroll indicator -->
            {#if permissionData.permissionResults.length > 4}
              <div class="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md text-xs"
                   style="background: {$colorStore.background}90; color: {$colorStore.muted}; backdrop-filter: blur(4px);">
                <span>Scroll for more</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
              </div>
            {/if}
          </div>

          <!-- Fix permissions if needed -->
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
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                style="background: #f59e0b; color: white;"
              >
                Fix Permissions
                <ExternalLink class="w-4 h-4" />
              </a>
            </div>
          {/if}
        {/if}

        <!-- Navigation -->
        <div class="flex items-center justify-between pt-6">
          <button
            class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
            on:click={previousStep}
          >
            <ArrowLeft class="w-4 h-4" />
            Back
          </button>

          <button
            class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50"
            style="background: {$colorStore.primary}; color: white;"
            on:click={nextStep}
            disabled={!canProceed}
          >
            Continue
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </WizardStep>
  {/if}

  <!-- Step 3: Feature Selection -->
  <WizardStep 
    title="Choose Features"
    subtitle="Select the features you'd like to set up for your server."
    stepNumber={data.wizardType === 'first-time' ? 3 : 2}
    isActive={currentStep === (data.wizardType === 'first-time' ? 3 : 2)}
    icon={Settings}
    maxWidth="max-w-7xl"
  >
    <div class="space-y-6">
      <!-- Features organized by category -->
      <div class="space-y-6">
        {#each featureCategories as category}
          <div>
            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2" style="color: {$colorStore.text};">
              <span class="w-2 h-2 rounded-full" style="background: {$colorStore.primary};"></span>
              {category.name}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {#each category.features as feature}
                <FeatureCard
                  id={feature.id}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  recommended={feature.recommended}
                  setupTime="2 min"
                  difficulty={feature.difficulty}
                  selected={selectedFeatures.includes(feature.id)}
                  on:toggle={handleFeatureToggle}
                />
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <!-- Selection summary -->
      {#if selectedFeatures.length > 0}
        <div class="text-center p-4 rounded-lg border"
             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}25;">
          <p style="color: {$colorStore.text};">
            <span class="font-semibold">{selectedFeatures.length}</span> feature{selectedFeatures.length === 1 ? '' : 's'} selected
          </p>
        </div>
      {/if}

      <!-- Navigation -->
      <div class="flex items-center justify-between pt-6">
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2"
          style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
          on:click={previousStep}
        >
          <ArrowLeft class="w-4 h-4" />
          Back
        </button>

        <button
          class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50"
          style="background: {$colorStore.primary}; color: white;"
          on:click={nextStep}
          disabled={!canProceed}
        >
          {selectedFeatures.length > 0 ? 'Configure Features' : 'Skip Features'}
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </WizardStep>

  <!-- Individual Feature Configuration Steps -->
  {#if isConfigurationStep && selectedFeatures.length > 0}
    {@const featureId = selectedFeatures[currentConfigStepIndex]}
    {@const feature = allFeatures.find(f => f.id === featureId)}
    {#if feature}
      <WizardStep 
        title="Configure {feature.title}"
        subtitle="Set up {feature.title} for your server - you'll have full page space to configure it properly."
        stepNumber={currentStep}
        isActive={true}
        icon={feature.icon}
        maxWidth="max-w-5xl"
      >
        <div class="space-y-6">
          
          <!-- Feature-specific configuration with full page space and mobile-friendly layout -->
          {#if featureId === 'multigreets'}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">Welcome Settings</h3>
                  <div class="space-y-4">
                    <div>
                      <div class="flex items-center gap-3 mb-3">
                        <span id="welcome-channel-label" class="block text-sm font-medium" style="color: {$colorStore.text};">Welcome Channel{featureConfigs.multigreets.applyToMultiple ? 's' : ''}</span>
                        <label class="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            bind:checked={featureConfigs.multigreets.applyToMultiple}
                            class="rounded"
                          />
                          <span style="color: {$colorStore.muted};">Set up multiple channels</span>
                        </label>
                      </div>
                      
                      {#if featureConfigs.multigreets.applyToMultiple}
                        <DiscordSelector 
                          type="channel" 
                          options={availableChannels} 
                          bind:selected={featureConfigs.multigreets.channelIds} 
                          placeholder="Choose channels for welcome messages..." 
                          aria-labelledby="welcome-channel-label"
                          multiple={true}
                        />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          Welcome messages will be sent to all selected channels
                        </p>
                      {:else}
                        <DiscordSelector 
                          type="channel" 
                          options={availableChannels} 
                          bind:selected={featureConfigs.multigreets.channelId} 
                          placeholder="Choose where to send welcome messages..." 
                          aria-labelledby="welcome-channel-label" 
                        />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          This channel will receive welcome messages for new members
                        </p>
                      {/if}
                    </div>
                    
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <label for="welcome-message" class="text-sm font-medium" style="color: {$colorStore.text};">Welcome Message</label>
                        <label class="flex items-center gap-3 text-sm cursor-pointer p-2 rounded-lg transition-all hover:bg-opacity-50" style="background: {$colorStore.primary}05;">
                          <div class="relative">
                            <input 
                              type="checkbox" 
                              bind:checked={featureConfigs.multigreets.useRichMessage}
                              class="sr-only"
                            />
                            <div class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                                 style="border-color: {featureConfigs.multigreets.useRichMessage ? $colorStore.primary : $colorStore.muted}; 
                                        background: {featureConfigs.multigreets.useRichMessage ? $colorStore.primary : 'transparent'};">
                              {#if featureConfigs.multigreets.useRichMessage}
                                <svg class="w-3 h-3" fill="white" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                              {/if}
                            </div>
                          </div>
                          <span style="color: {$colorStore.text};">Rich embeds & buttons</span>
                        </label>
                      </div>
                      
                      <textarea
                        id="welcome-message"
                        class="w-full px-3 py-2 rounded-lg border resize-none"
                        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                        rows="3" bind:value={featureConfigs.multigreets.message}
                        placeholder="Welcome to %server.name%, %user.mention%! 🎉"
                      />
                      
                      {#if featureConfigs.multigreets.useRichMessage}
                        <div class="mt-3 space-y-4">
                          <!-- Message Builder Buttons -->
                          <div class="flex gap-2">
                            <button
                              type="button"
                              class="px-3 py-1 rounded text-xs font-medium transition-all hover:scale-105"
                              style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                              on:click={() => {
                                featureConfigs.multigreets.embeds = [...(featureConfigs.multigreets.embeds || []), {
                                  title: '',
                                  description: '',
                                  color: $colorStore.primary.replace('#', ''),
                                  url: '', author: {name: '', url: '', icon_url: ''}, thumbnail: {url: ''}, image: {url: ''}, footer: {text: '', icon_url: ''}, fields: []
                                }];
                              }}
                              disabled={(featureConfigs.multigreets.embeds?.length || 0) >= 10}
                            >
                              + Add Embed ({(featureConfigs.multigreets.embeds?.length || 0)}/10)
                            </button>
                            <button
                              type="button" 
                              class="px-3 py-1 rounded text-xs font-medium transition-all hover:scale-105"
                              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                              on:click={() => {
                                featureConfigs.multigreets.components = [...(featureConfigs.multigreets.components || []), {
                                  componentKey: `welcome-btn-${Date.now()}`, id: null, displayName: '', style: 1, url: '', emoji: '', isSelect: false, maxOptions: 1, minOptions: 1, options: []
                                }];
                              }}
                            >
                              + Add Button
                            </button>
                          </div>
                          
                          <!-- Embed Editors -->
                          {#if (featureConfigs.multigreets.embeds?.length || 0) > 0}
                            <div class="space-y-4">
                              <h4 class="text-sm font-medium" style="color: {$colorStore.text};">Welcome Embeds</h4>
                              {#each featureConfigs.multigreets.embeds as embed, index}
                                <div class="border rounded-lg overflow-hidden" style="border-color: {$colorStore.primary}20;">
                                  <div class="flex items-center justify-between p-3 border-b" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                                    <span class="text-sm font-medium" style="color: {$colorStore.text};">Embed {index + 1}</span>
                                    <button
                                      type="button"
                                      class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
                                      style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                                      on:click={() => {
                                        featureConfigs.multigreets.embeds = featureConfigs.multigreets.embeds.filter((_, i) => i !== index);
                                      }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  <div class="p-4">
                                    <EmbedEditor
                                      bind:embed={featureConfigs.multigreets.embeds[index]}
                                      {index}
                                      placeholders={[
                                        { category: "User", name: "%user.mention%", description: "Mention the user" },
                                        { category: "User", name: "%user.username%", description: "Username of the user" },
                                        { category: "Server", name: "%server.name%", description: "Server name" },
                                        { category: "Server", name: "%server.members%", description: "Number of server members" }
                                      ]}
                                      on:update={() => {
                                        featureConfigs.multigreets.embeds = [...featureConfigs.multigreets.embeds];
                                      }}
                                    />
                                  </div>
                                </div>
                              {/each}
                            </div>
                          {/if}
                          
                          <!-- Live Preview -->
                          {#if (featureConfigs.multigreets.embeds?.length > 0) || (featureConfigs.multigreets.components?.length > 0) || featureConfigs.multigreets.message.trim()}
                            <div>
                              <h4 class="text-sm font-medium mb-2" style="color: {$colorStore.text};">Live Preview</h4>
                              <div class="border rounded-lg overflow-hidden" style="border-color: {$colorStore.primary}20;">
                                <PreviewCard 
                                  content={featureConfigs.multigreets.message}
                                  embeds={featureConfigs.multigreets.embeds || []}
                                  components={featureConfigs.multigreets.components || []}
                                  showEmpty={false}
                                  compact={true}
                                />
                              </div>
                            </div>
                          {/if}
                        </div>
                      {/if}
                      
                      <p class="text-xs mt-2" style="color: {$colorStore.muted};">
                        Use %user.mention% for username, %server.name% for server name
                        {#if featureConfigs.multigreets.applyToMultiple}
                          <br><strong>This message will be applied to all selected channels</strong>
                        {/if}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="rounded-xl border p-6" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <h4 class="font-semibold mb-4" style="color: {$colorStore.text};">Setup Preview</h4>
                
                <!-- Message preview -->
                <div class="p-4 rounded-lg mb-4" style="background: {$colorStore.primary}10;">
                  <p class="text-sm" style="color: {$colorStore.text};">
                    {featureConfigs.multigreets.message.replace('%server.name%', guild?.name || 'Your Server').replace('%user.mention%', '@NewMember')}
                  </p>
                </div>
                
                <!-- Channels that will be configured -->
                {#if featureConfigs.multigreets.applyToMultiple && (featureConfigs.multigreets.channelIds?.length || 0) > 0}
                  <div class="mb-4">
                    <p class="text-sm font-medium mb-2" style="color: {$colorStore.text};">
                      Will be configured in {featureConfigs.multigreets.channelIds?.length || 0} channels:
                    </p>
                    <div class="flex flex-wrap gap-2">
                      {#each (featureConfigs.multigreets.channelIds || []) as channelId}
                        {@const channel = availableChannels?.find(c => c.id === channelId)}
                        {#if channel}
                          <span class="px-2 py-1 rounded text-xs font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
                            #{channel.name}
                          </span>
                        {/if}
                      {/each}
                    </div>
                  </div>
                {:else if featureConfigs.multigreets.channelId}
                  {@const channel = availableChannels?.find(c => c.id === featureConfigs.multigreets.channelId)}
                  {#if channel}
                    <div class="mb-4">
                      <p class="text-sm" style="color: {$colorStore.text};">
                        Will be configured in: <span class="font-medium">#{channel.name}</span>
                      </p>
                    </div>
                  {/if}
                {/if}
                
                <div class="space-y-2 text-sm" style="color: {$colorStore.muted};">
                  <p><strong>💡 Tips:</strong></p>
                  <p>• Keep messages friendly and informative</p>
                  <p>• Include server rules or important channels</p>
                  <p>• Use emojis to make it welcoming</p>
                  {#if featureConfigs.multigreets.applyToMultiple}
                    <p>• Same message across channels for consistency</p>
                  {/if}
                </div>
              </div>
            </div>
            
          {:else if featureId === 'rolegreets'}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">Role Greet Settings</h3>
                  <div class="space-y-4">
                    <div>
                      <span id="role-greet-role-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">Role to Greet For</span>
                      <DiscordSelector type="role" options={availableRoles} bind:selected={featureConfigs.rolegreets.roleId} placeholder="Choose role to congratulate..." aria-labelledby="role-greet-role-label" />
                      <p class="text-xs mt-1" style="color: {$colorStore.muted};">When members get this role, they'll receive a congratulations message</p>
                    </div>
                    <div>
                      <span id="role-greet-channel-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">Congratulations Channel</span>
                      <DiscordSelector type="channel" options={availableChannels} bind:selected={featureConfigs.rolegreets.channelId} placeholder="Choose where to send congratulations..." aria-labelledby="role-greet-channel-label" />
                      <p class="text-xs mt-1" style="color: {$colorStore.muted};">This channel will receive role congratulations messages</p>
                    </div>
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <label for="role-greet-message" class="text-sm font-medium" style="color: {$colorStore.text};">Congratulations Message</label>
                        <label class="flex items-center gap-3 text-sm cursor-pointer p-2 rounded-lg transition-all hover:bg-opacity-50" style="background: {$colorStore.primary}05;">
                          <div class="relative">
                            <input 
                              type="checkbox" 
                              bind:checked={featureConfigs.rolegreets.useRichMessage}
                              class="sr-only"
                            />
                            <div class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                                 style="border-color: {featureConfigs.rolegreets.useRichMessage ? $colorStore.primary : $colorStore.muted}; 
                                        background: {featureConfigs.rolegreets.useRichMessage ? $colorStore.primary : 'transparent'};">
                              {#if featureConfigs.rolegreets.useRichMessage}
                                <svg class="w-3 h-3" fill="white" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                              {/if}
                            </div>
                          </div>
                          <span style="color: {$colorStore.text};">Rich embeds & buttons</span>
                        </label>
                      </div>
                      
                      <textarea
                        id="role-greet-message"
                        class="w-full px-3 py-2 rounded-lg border resize-none"
                        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                        rows="3" bind:value={featureConfigs.rolegreets.message}
                        placeholder="Congratulations %user.mention% on getting the %role.name% role! 🎉"
                      />
                      
                      {#if featureConfigs.rolegreets.useRichMessage}
                        <div class="mt-3 space-y-4">
                          <!-- Message Builder Buttons -->
                          <div class="flex gap-2">
                            <button
                              type="button"
                              class="px-3 py-1 rounded text-xs font-medium transition-all hover:scale-105"
                              style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                              on:click={() => {
                                featureConfigs.rolegreets.embeds = [...(featureConfigs.rolegreets.embeds || []), {
                                  title: '',
                                  description: '',
                                  color: $colorStore.secondary.replace('#', ''),
                                  url: '', author: {name: '', url: '', icon_url: ''}, thumbnail: {url: ''}, image: {url: ''}, footer: {text: '', icon_url: ''}, fields: []
                                }];
                              }}
                              disabled={(featureConfigs.rolegreets.embeds?.length || 0) >= 10}
                            >
                              + Add Embed ({(featureConfigs.rolegreets.embeds?.length || 0)}/10)
                            </button>
                            <button
                              type="button" 
                              class="px-3 py-1 rounded text-xs font-medium transition-all hover:scale-105"
                              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                              on:click={() => {
                                featureConfigs.rolegreets.components = [...(featureConfigs.rolegreets.components || []), {
                                  componentKey: `role-btn-${Date.now()}`, id: null, displayName: '', style: 1, url: '', emoji: '', isSelect: false, maxOptions: 1, minOptions: 1, options: []
                                }];
                              }}
                            >
                              + Add Button
                            </button>
                          </div>
                          
                          <!-- Embed Editors -->
                          {#if (featureConfigs.rolegreets.embeds?.length || 0) > 0}
                            <div class="space-y-4">
                              <h4 class="text-sm font-medium" style="color: {$colorStore.text};">Congratulations Embeds</h4>
                              {#each featureConfigs.rolegreets.embeds as embed, index}
                                <div class="border rounded-lg overflow-hidden" style="border-color: {$colorStore.primary}20;">
                                  <div class="flex items-center justify-between p-3 border-b" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                                    <span class="text-sm font-medium" style="color: {$colorStore.text};">Embed {index + 1}</span>
                                    <button
                                      type="button"
                                      class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
                                      style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                                      on:click={() => {
                                        featureConfigs.rolegreets.embeds = featureConfigs.rolegreets.embeds.filter((_, i) => i !== index);
                                      }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  <div class="p-4">
                                    <EmbedEditor
                                      bind:embed={featureConfigs.rolegreets.embeds[index]}
                                      {index}
                                      placeholders={[
                                        { category: "User", name: "%user.mention%", description: "Mention the user" },
                                        { category: "User", name: "%user.username%", description: "Username of the user" },
                                        { category: "Role", name: "%role.name%", description: "Name of the role" },
                                        { category: "Server", name: "%server.name%", description: "Server name" }
                                      ]}
                                      on:update={() => {
                                        featureConfigs.rolegreets.embeds = [...featureConfigs.rolegreets.embeds];
                                      }}
                                    />
                                  </div>
                                </div>
                              {/each}
                            </div>
                          {/if}
                          
                          <!-- Live Preview -->
                          {#if (featureConfigs.rolegreets.embeds?.length > 0) || (featureConfigs.rolegreets.components?.length > 0) || featureConfigs.rolegreets.message.trim()}
                            <div>
                              <h4 class="text-sm font-medium mb-2" style="color: {$colorStore.text};">Live Preview</h4>
                              <div class="border rounded-lg overflow-hidden" style="border-color: {$colorStore.primary}20;">
                                <PreviewCard 
                                  content={featureConfigs.rolegreets.message}
                                  embeds={featureConfigs.rolegreets.embeds || []}
                                  components={featureConfigs.rolegreets.components || []}
                                  showEmpty={false}
                                  compact={true}
                                />
                              </div>
                            </div>
                          {/if}
                        </div>
                      {/if}
                      
                      <p class="text-xs mt-2" style="color: {$colorStore.muted};">Use %user.mention% for username, %role.name% for role name</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="rounded-xl border p-6" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <h4 class="font-semibold mb-4" style="color: {$colorStore.text};">Role Greet Benefits</h4>
                
                <!-- Message preview -->
                {#if featureConfigs.rolegreets.roleId}
                  {@const selectedRole = availableRoles?.find(r => r.id === featureConfigs.rolegreets.roleId)}
                  <div class="p-4 rounded-lg mb-4" style="background: {$colorStore.primary}10;">
                    <p class="text-sm" style="color: {$colorStore.text};">
                      {featureConfigs.rolegreets.message.replace('%user.mention%', '@Member').replace('%role.name%', selectedRole?.name || 'Selected Role')}
                    </p>
                  </div>
                {/if}
                
                <div class="space-y-2 text-sm" style="color: {$colorStore.muted};">
                  <p>• <strong>Perfect for verification:</strong> Welcome users only after they're verified</p>
                  <p>• <strong>Staff promotions:</strong> Congratulate new moderators/admins</p>
                  <p>• <strong>Achievement rewards:</strong> Celebrate milestone roles</p>
                  <p>• <strong>Special access:</strong> Notify when users get VIP/premium roles</p>
                  <p>• <strong>Reduces spam:</strong> No welcome messages for unverified users</p>
                </div>
              </div>
            </div>
            
          {:else if featureId === 'starboard'}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">Starboard Configuration</h3>
                  <div class="space-y-4">
                    <div>
                      <span id="starboard-channel-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">Starboard Channel</span>
                      <DiscordSelector type="channel" options={availableChannels} bind:selected={featureConfigs.starboard.channelId} placeholder="Channel for popular messages..." aria-labelledby="starboard-channel-label" />
                      <p class="text-xs mt-1" style="color: {$colorStore.muted};">Messages with enough reactions will be posted here</p>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label for="star-threshold" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">Star Threshold</label>
                        <input id="star-threshold" type="number" min="1" max="20" class="w-full px-3 py-2 rounded-lg border" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}" bind:value={featureConfigs.starboard.threshold} />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">Reactions needed to reach starboard</p>
                      </div>
                      <div>
                        <label for="star-emoji" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">Star Emoji</label>
                        <input id="star-emoji" type="text" maxlength="2" class="w-full px-3 py-2 rounded-lg border text-center" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}" bind:value={featureConfigs.starboard.emoji} placeholder="⭐" />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">Emoji to count for starboard</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="rounded-xl border p-6" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <h4 class="font-semibold mb-4" style="color: {$colorStore.text};">How Starboard Works</h4>
                <div class="space-y-3 text-sm" style="color: {$colorStore.muted};">
                  <p>• Members react with {featureConfigs.starboard.emoji} to funny/important messages</p>
                  <p>• When {featureConfigs.starboard.threshold}+ reactions are reached, message gets highlighted</p>
                  <p>• Great for showcasing community highlights</p>
                  <p>• Encourages positive interactions</p>
                </div>
              </div>
            </div>
            
          {:else if featureId === 'xp'}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">XP & Leveling Settings</h3>
                  <div class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label for="xp-text-rate" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">XP per Message</label>
                        <input id="xp-text-rate" type="number" min="1" max="10" class="w-full px-3 py-2 rounded-lg border" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}" bind:value={featureConfigs.xp.textRate} />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">XP gained per text message (recommended: 3)</p>
                      </div>
                      <div>
                        <label for="xp-voice-rate" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">Voice XP Rate</label>
                        <input id="xp-voice-rate" type="number" min="1" max="10" class="w-full px-3 py-2 rounded-lg border" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}" bind:value={featureConfigs.xp.voiceRate} />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">XP gained per minute in voice (recommended: 2)</p>
                      </div>
                    </div>
                    <div>
                      <span id="xp-level-channel-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">Level Up Channel (Optional)</span>
                      <DiscordSelector type="channel" options={availableChannels} bind:selected={featureConfigs.xp.levelChannelId} placeholder="Channel for level up announcements..." aria-labelledby="xp-level-channel-label" />
                      <p class="text-xs mt-1" style="color: {$colorStore.muted};">Where to announce when members level up (leave empty for no announcements)</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="rounded-xl border p-6" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <h4 class="font-semibold mb-4" style="color: {$colorStore.text};">XP System Benefits</h4>
                <div class="space-y-3 text-sm" style="color: {$colorStore.muted};">
                  <p>• <strong>Rewards activity:</strong> Active members gain levels</p>
                  <p>• <strong>Encourages engagement:</strong> Members chat more to level up</p>
                  <p>• <strong>Role rewards:</strong> Unlock perks at higher levels</p>
                  <p>• <strong>Leaderboards:</strong> Community competition</p>
                  <p>• <strong>Statistics:</strong> Track server activity</p>
                </div>
              </div>
            </div>
            
          {:else if featureId === 'logging'}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">Event Logging</h3>
                  <div class="space-y-4">
                    <div>
                      <span id="log-channel-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">General Log Channel</span>
                      <DiscordSelector type="channel" options={availableChannels} bind:selected={featureConfigs.logging.channelId} placeholder="Choose channel for server logs..." aria-labelledby="log-channel-label" />
                      <p class="text-xs mt-1" style="color: {$colorStore.muted};">Member joins, leaves, and other server events will be logged here</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="rounded-xl border p-6" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <h4 class="font-semibold mb-4" style="color: {$colorStore.text};">Events Logged</h4>
                <div class="space-y-2 text-sm" style="color: {$colorStore.muted};">
                  <p>• <strong>Member Activity:</strong> Joins, leaves, role changes</p>
                  <p>• <strong>Messages:</strong> Edits, deletions, bulk actions</p>
                  <p>• <strong>Moderation:</strong> Warns, kicks, bans, mutes</p>
                  <p>• <strong>Server Changes:</strong> Channel/role modifications</p>
                  <p class="pt-2 text-xs">💡 You can configure specific event channels later in the dashboard</p>
                </div>
              </div>
            </div>
            
          {:else if featureId === 'administration'}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">Auto-Assign Roles</h3>
                  <div class="space-y-4">
                    <div>
                      <span id="auto-role-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">Member Role (Optional)</span>
                      <DiscordSelector type="role" options={availableRoles} bind:selected={featureConfigs.administration.autoRoleId} placeholder="Role to give new members..." aria-labelledby="auto-role-label" />
                      <p class="text-xs mt-1" style="color: {$colorStore.muted};">New members will automatically receive this role when they join</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="rounded-xl border p-6" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <h4 class="font-semibold mb-4" style="color: {$colorStore.text};">Auto-Role Benefits</h4>
                <div class="space-y-2 text-sm" style="color: {$colorStore.muted};">
                  <p>• <strong>Instant permissions:</strong> New members get basic access immediately</p>
                  <p>• <strong>Distinguish members:</strong> Separate from bots and unverified users</p>
                  <p>• <strong>Channel access:</strong> Grant access to member-only channels</p>
                  <p>• <strong>Streamlined onboarding:</strong> No manual role assignment needed</p>
                </div>
              </div>
            </div>
            
          {:else if featureId === 'suggestions'}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">Suggestion System</h3>
                  <div class="space-y-4">
                    <div>
                      <span id="suggestions-channel-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">Suggestions Channel</span>
                      <DiscordSelector type="channel" options={availableChannels} bind:selected={featureConfigs.suggestions.channelId} placeholder="Channel for member suggestions..." aria-labelledby="suggestions-channel-label" />
                      <p class="text-xs mt-1" style="color: {$colorStore.muted};">Members can submit suggestions and vote on them here</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="rounded-xl border p-6" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <h4 class="font-semibold mb-4" style="color: {$colorStore.text};">Suggestion Features</h4>
                <div class="space-y-2 text-sm" style="color: {$colorStore.muted};">
                  <p>• <strong>Member submissions:</strong> Easy command-based suggestions</p>
                  <p>• <strong>Community voting:</strong> Automatic upvote/downvote reactions</p>
                  <p>• <strong>Staff management:</strong> Approve, deny, or consider suggestions</p>
                  <p>• <strong>Thread discussions:</strong> Detailed feedback on suggestions</p>
                </div>
              </div>
            </div>
            
          {:else}
            <!-- Default configuration for other features -->
            <div class="text-center py-12">
              <div class="mb-6">
                <svelte:component this={feature.icon} class="w-16 h-16 mx-auto mb-4" style="color: {$colorStore.primary};" />
                <h3 class="text-xl font-semibold mb-2" style="color: {$colorStore.text};">{feature.title}</h3>
                <p class="text-sm max-w-md mx-auto" style="color: {$colorStore.muted};">{feature.description}</p>
              </div>
              <div class="p-6 rounded-xl border max-w-lg mx-auto" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}25;">
                <p class="text-sm mb-2" style="color: {$colorStore.text};">
                  {feature.title} will be enabled with smart defaults.
                </p>
                <p class="text-xs" style="color: {$colorStore.muted};">
                  You can customize all settings later in the dashboard's {feature.title} section.
                </p>
              </div>
            </div>
          {/if}

          <!-- Navigation with feature progress -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
            <button
              class="w-full sm:w-auto px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 min-h-[44px]"
              style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
              on:click={previousStep}
            >
              <ArrowLeft class="w-4 h-4" />
              Back
            </button>

            <div class="flex flex-col sm:flex-row items-center gap-4">
              <span class="text-sm px-3 py-1 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">
                Configuring {currentConfigStepIndex + 1} of {selectedFeatures.length} features
              </span>
              
              <button
                class="w-full sm:w-auto px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 min-h-[44px]"
                style="background: {$colorStore.primary}; color: white;"
                on:click={finishCurrentFeatureConfig}
                disabled={wizardLoading}
              >
                {wizardLoading ? 'Configuring...' : currentConfigStepIndex === selectedFeatures.length - 1 ? 'Finish Setup' : 'Configure Next'}
                {#if wizardLoading}
                  <RefreshCw class="w-4 h-4 animate-spin" />
                {:else}
                  <ArrowRight class="w-4 h-4" />
                {/if}
              </button>
            </div>
          </div>
        </div>
      </WizardStep>
    {/if}
  {/if}

  <!-- Step 5: Completion -->
  <WizardStep 
    title="Setup Complete!"
    subtitle={`${guild.name} is now ready to go with your selected features.`}
    stepNumber={totalSteps}
    isActive={currentStep === totalSteps}
    icon={CheckCircle}
    showStepNumber={false}
  >
    <div class="text-center space-y-6">
      <!-- Success animation -->
      <div class="flex justify-center">
        <div class="w-20 h-20 rounded-full flex items-center justify-center animate-pulse"
             style="background: {$colorStore.accent}20;">
          <CheckCircle class="w-12 h-12" style="color: {$colorStore.accent};" />
        </div>
      </div>

      <!-- Configured features summary -->
      {#if selectedFeatures.length > 0}
        <div class="p-4 rounded-lg border"
             style="background: {$colorStore.accent}10; border-color: {$colorStore.accent}30;">
          <h3 class="font-semibold mb-2" style="color: {$colorStore.text};">Features Configured:</h3>
          <div class="flex flex-wrap justify-center gap-2">
            {#each selectedFeatures as featureId}
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
    /* Prevent scrolling during wizard */
    overflow-x: hidden;
  }
</style>