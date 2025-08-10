<!-- routes/dashboard/chat-triggers/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { fade, slide, fly } from "svelte/transition";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import { goto } from "$app/navigation";
  import { get } from "svelte/store";
  import type { ChatTriggers } from "$lib/types/models";
  import type { PageData } from "./$types";
  import {
    AlertTriangle,
    Check,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    Command,
    Crown,
    Edit,
    MessageCircle,
    Plus,
    Save,
    Settings,
    Sparkles,
    Trash,
    Users,
    X,
    Zap
  } from "lucide-svelte";
  import { browser } from "$app/environment";
  import { logger } from "$lib/logger.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";

  export let data: PageData;

  // Notification variables
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";

  // Enums
  const RequirePrefixType = {
    None: 0,
    Global: 1,
    GuildOrGlobal: 2,
    GuildOrNone: 3,
    Custom: 4,
  };

  const CtRoleGrantType = {
    Sender: 0,
    Mentioned: 1,
    Both: 2,
  };

  const ChatTriggerType = {
    Message: 1,      // 0b0001
    Interaction: 2,  // 0b0010
    Button: 4,       // 0b0100
    Reactions: 8,    // 0b1000
  };

  const CtApplicationCommandType = {
    None: 0,
    Slash: 1,
    Message: 2,
    User: 3,
  };

  // Data variables  
  let triggers: ChatTriggers[] = [];
  let newTrigger: Partial<ChatTriggers> & { 
    isValidRegex: boolean; 
    grantedRoles: string[] | string | null; 
    removedRoles: string[] | string | null;
    validTriggerTypesMessage: boolean;
    validTriggerTypesInteraction: boolean;
    validTriggerTypesButton: boolean;
    validTriggerTypesReactions: boolean;
  } = {
    trigger: "",
    response: "",
    grantedRoles: [],
    removedRoles: [],
    isRegex: false,
    isValidRegex: true,
    validTriggerTypesMessage: true,
    validTriggerTypesInteraction: false,
    validTriggerTypesButton: false,
    validTriggerTypesReactions: false,
    // Initialize other properties with sensible defaults
    autoDeleteTrigger: false,
    reactToTrigger: false,
    dmResponse: false,
    containsAnywhere: false,
    allowTarget: false,
    noRespond: false,
    ownerOnly: false,
    applicationCommandType: CtApplicationCommandType.None,
    prefixType: RequirePrefixType.None,
    roleGrantType: CtRoleGrantType.Sender,
  };
  let guildRoles: Array<{ id: string; name: string }> = [];

  // UI state variables - Dual Mode Interface
  let activeTab: "simple" | "advanced" = "simple";
  let expandedTriggerId: number | null = null;
  let loading = true;
  let error: string | null = null;
  let isMobile = false;
  
  // Accessibility state
  let statusMessage = "";
  let errorMessage = "";
  let focusedCardIndex = -1;
  
  // Simple mode state
  let quickTriggerText = "";
  let quickResponseText = "";
  let showAdvancedOptions = false;
  
  // Advanced mode state
  let newTriggerRegexTestString = "";
  let newTriggerRegexTestResult = "";
  let newTriggerRegexHighlightedString = "";
  let regexTestString = "";
  let regexTestResult = "";
  let regexHighlightedString = "";
  let activeDropdown: string | null = null;

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  // Function to load triggers
  async function loadTriggers() {
    try {
      loading = true;
      error = null;
      const guild = get(currentGuild);
      if (!guild?.id) {
        throw new Error("No guild selected");
      }
      triggers = await api.getChatTriggers(guild.id);
      triggers = triggers.map((trigger) => ({
        ...trigger,
        grantedRoles: roleStringToArray(trigger.grantedRoles),
        removedRoles: roleStringToArray(trigger.removedRoles),
        isRegex: trigger.isRegex || false,
        isValidRegex: trigger.isRegex && trigger.trigger ? validateRegex(trigger.trigger) : true,
        // Add frontend-only boolean properties for trigger types
        validTriggerTypesMessage: !!(trigger.validTriggerTypes & ChatTriggerType.Message),
        validTriggerTypesInteraction: !!(trigger.validTriggerTypes & ChatTriggerType.Interaction),
        validTriggerTypesButton: !!(trigger.validTriggerTypes & ChatTriggerType.Button),
        validTriggerTypesReactions: !!(trigger.validTriggerTypes & ChatTriggerType.Reactions),
      } as any));
    } catch (err: any) {
      logger.error("Failed to fetch chat triggers:", err);
      error = err.message || "Failed to fetch chat triggers";
    } finally {
      loading = false;
    }
  }

  // Function to load guild roles
  async function loadGuildRoles() {
    try {
      const guild = get(currentGuild);
      if (!guild?.id) {
        throw new Error("No guild selected");
      }
      guildRoles = await api.getGuildRoles(guild.id);
    } catch (err) {
      logger.error("Failed to fetch guild roles:", err);
    }
  }

  // Function to add a new trigger
  async function addTrigger() {
    if (!newTrigger.trigger?.trim() || !newTrigger.response?.trim()) {
      showNotificationMessage("Trigger and Response are required", "error");
      return;
    }

    if (newTrigger.isRegex && !newTrigger.isValidRegex) {
      showNotificationMessage("Invalid regex pattern", "error");
      return;
    }

    try {
      const guild = get(currentGuild);
      if (!guild?.id) {
        throw new Error("No guild selected");
      }
      
      // Convert boolean trigger types to bitwise integer
      let validTriggerTypes = 0;
      if (newTrigger.validTriggerTypesMessage) validTriggerTypes |= ChatTriggerType.Message;
      if (newTrigger.validTriggerTypesInteraction) validTriggerTypes |= ChatTriggerType.Interaction;
      if (newTrigger.validTriggerTypesButton) validTriggerTypes |= ChatTriggerType.Button;
      if (newTrigger.validTriggerTypesReactions) validTriggerTypes |= ChatTriggerType.Reactions;
      
      const triggerData = {
        ...newTrigger,
        validTriggerTypes,
        guildId: guild.id,
        grantedRoles: roleArrayToString(newTrigger.grantedRoles),
        removedRoles: roleArrayToString(newTrigger.removedRoles),
      };
      
      const addedTrigger = await api.addChatTrigger(
        guild.id,
        triggerData as ChatTriggers,
      );
      triggers = [...triggers, addedTrigger];
      showNotificationMessage("Trigger added successfully", "success");
      newTrigger = {
        guildId: guild.id,
        trigger: "",
        response: "",
        grantedRoles: "",
        removedRoles: "",
        isRegex: false,
        isValidRegex: true,
      };
      newTriggerRegexTestString = "";
      newTriggerRegexTestResult = "";
      newTriggerRegexHighlightedString = "";
    } catch (error: any) {
      showNotificationMessage(
        "Failed to add trigger: " + error.message,
        "error",
      );
    }
  }

  // Function to update a trigger
  async function updateTrigger(trigger: any) {
    if (!trigger.trigger?.trim() || !trigger.response?.trim()) {
      showNotificationMessage("Trigger and Response are required", "error");
      return;
    }

    if (trigger.isRegex && !trigger.isValidRegex) {
      showNotificationMessage("Invalid regex pattern", "error");
      return;
    }

    try {
      const guild = get(currentGuild);
      if (!guild?.id) {
        throw new Error("No guild selected");
      }
      // Convert boolean trigger types to bitwise integer if they exist
      let validTriggerTypes = trigger.validTriggerTypes;
      if (trigger.validTriggerTypesMessage !== undefined) {
        validTriggerTypes = 0;
        if (trigger.validTriggerTypesMessage) validTriggerTypes |= ChatTriggerType.Message;
        if (trigger.validTriggerTypesInteraction) validTriggerTypes |= ChatTriggerType.Interaction;
        if (trigger.validTriggerTypesButton) validTriggerTypes |= ChatTriggerType.Button;
        if (trigger.validTriggerTypesReactions) validTriggerTypes |= ChatTriggerType.Reactions;
      }
      
      const updatedTrigger = {
        ...trigger,
        validTriggerTypes,
        grantedRoles: roleArrayToString(trigger.grantedRoles),
        removedRoles: roleArrayToString(trigger.removedRoles),
        guildId: guild.id,
      };
      await api.updateChatTrigger(guild.id, updatedTrigger);
      showNotificationMessage("Trigger updated successfully", "success");
      await loadTriggers();
    } catch (error: any) {
      showNotificationMessage(
        "Failed to update trigger: " + error.message,
        "error",
      );
    }
  }

  // Function to delete a trigger - Enhanced with accessibility
  async function deleteTrigger(triggerId: number) {
    const trigger = triggers.find(t => t.id === triggerId);
    const triggerName = trigger?.trigger || 'trigger';
    
    if (!confirm(`Are you sure you want to delete the trigger "${triggerName}"?`)) {
      announceAction('Delete cancelled');
      return;
    }

    try {
      const guild = get(currentGuild);
      if (!guild?.id) {
        throw new Error("No guild selected");
      }
      await api.deleteChatTrigger(guild.id, triggerId);
      showNotificationMessage("Trigger deleted successfully", "success");
      announceAction(`Trigger ${triggerName} deleted`);
      await loadTriggers();
    } catch (error: any) {
      showNotificationMessage(
        "Failed to delete trigger: " + error.message,
        "error",
      );
      announceError('Failed to delete trigger');
    }
  }

  // Function to handle regex validation for new trigger
  function handleNewTriggerRegexChange() {
    if (newTrigger.isRegex) {
      newTrigger.isValidRegex = validateRegex(newTrigger.trigger || "");
      testNewTriggerRegex();
    } else {
      newTrigger.isValidRegex = true;
      newTriggerRegexTestResult = "";
      newTriggerRegexHighlightedString = "";
    }
  }

  // Function to test new trigger regex
  function testNewTriggerRegex() {
    if (newTrigger.isRegex && newTrigger.isValidRegex) {
      try {
        const regex = new RegExp(newTrigger.trigger || "", "g");
        const matches = newTriggerRegexTestString.match(regex);
        if (matches) {
          newTriggerRegexTestResult = `${matches.length} match${matches.length > 1 ? "es" : ""}`;
          newTriggerRegexHighlightedString = highlightMatches(
            newTriggerRegexTestString,
            regex,
          );
        } else {
          newTriggerRegexTestResult = "No matches";
          newTriggerRegexHighlightedString = newTriggerRegexTestString;
        }
      } catch (e) {
        newTriggerRegexTestResult = "Error testing regex";
        newTriggerRegexHighlightedString = newTriggerRegexTestString;
      }
    } else {
      newTriggerRegexTestResult = "";
      newTriggerRegexHighlightedString = "";
    }
  }

  // Function to handle regex validation for existing triggers
  function handleRegexChange(trigger: any) {
    if (trigger.isRegex && trigger.trigger) {
      trigger.isValidRegex = validateRegex(trigger.trigger);
    }
  }

  // Function to test regex for existing triggers
  function testRegex(trigger: any) {
    if (trigger.isRegex && trigger.isValidRegex && trigger.trigger) {
      try {
        const regex = new RegExp(trigger.trigger, "g");
        const matches = regexTestString.match(regex);
        if (matches) {
          regexTestResult = `${matches.length} match${matches.length > 1 ? "es" : ""}`;
          regexHighlightedString = highlightMatches(regexTestString, regex);
        } else {
          regexTestResult = "No matches";
          regexHighlightedString = regexTestString;
        }
      } catch (e) {
        regexTestResult = "Error testing regex";
        regexHighlightedString = regexTestString;
      }
    } else {
      regexTestResult = "";
      regexHighlightedString = "";
    }
  }

  // Helper functions - Enhanced with accessibility
  function toggleExpand(triggerId: number) {
    const wasExpanded = expandedTriggerId === triggerId;
    expandedTriggerId = wasExpanded ? null : triggerId;
    
    if (!wasExpanded) {
      // Small delay to ensure DOM is updated before focusing
      setTimeout(() => {
        const firstInput = document.querySelector(`#trigger-${triggerId} input`);
        if (firstInput) {
          (firstInput as HTMLElement).focus();
        }
      }, 100);
    }
  }

  function isBoolean(value: any): value is boolean {
    return typeof value === "boolean";
  }

  function isEnum(key: string): boolean {
    return [
      "prefixType",
      "roleGrantType",
      "validTriggerTypes",
      "applicationCommandType",
    ].includes(key);
  }

  function isRoleSelection(key: string): boolean {
    return ["grantedRoles", "removedRoles"].includes(key);
  }

  function getEnumOptions(key: string): any {
    switch (key) {
      case "prefixType":
        return RequirePrefixType;
      case "roleGrantType":
        return CtRoleGrantType;
      case "validTriggerTypes":
        return ChatTriggerType;
      case "applicationCommandType":
        return CtApplicationCommandType;
      default:
        return {};
    }
  }

  function roleArrayToString(roleArray: string | null): string {
    if (Array.isArray(roleArray)) {
      return roleArray.join("@@@");
    } else if (typeof roleArray === "string") {
      return roleArray;
    } else {
      return "";
    }
  }

  function roleStringToArray(roleString: string | null): string[] {
    if (typeof roleString === "string") {
      return roleString.split("@@@").filter((role) => role.trim() !== "");
    } else if (Array.isArray(roleString)) {
      return roleString;
    } else {
      return [];
    }
  }

  function validateRegex(regex: string): boolean {
    try {
      new RegExp(regex);
      return true;
    } catch (e) {
      return false;
    }
  }

  function highlightMatches(text: string, regex: RegExp): string {
    return text.replace(
      regex,
      (match) => `<span class="bg-yellow-300 text-black">${match}</span>`,
    );
  }

  function toggleOption(option: string, key: string, trigger: ChatTriggers) {
    if (isEnum(key)) {
      (trigger as any)[key] = getEnumOptions(key)[option];
    } else if (isRoleSelection(key)) {
      const index = (trigger as any)[key].indexOf(option);
      if (index === -1) {
        (trigger as any)[key] = [...(trigger as any)[key], option];
      } else {
        (trigger as any)[key] = (trigger as any)[key].filter(
          (role: string) => role !== option,
        );
      }
    }
  }

  function closeDropdown() {
    activeDropdown = null;
  }

  // Format data for DiscordSelector
  $: roleOptions = guildRoles.map(role => ({
    id: role.id,
    name: role.name
  }));

  // Boolean options for DiscordSelector
  $: booleanOptions = [
    { id: "true", name: "Yes" },
    { id: "false", name: "No" }
  ];

  // Pattern type options for DiscordSelector
  $: triggerTypeOptions = [
    { id: "false", name: "Normal Text Pattern" },
    { id: "true", name: "Regular Expression Pattern" }
  ];

  // Format enum options for DiscordSelector
  function getEnumOptionsForSelector(key: string) {
    const enumOptions = getEnumOptions(key);
    return Object.entries(enumOptions).map(([optionKey, optionValue]) => ({
      id: String(optionValue),
      name: optionKey
    }));
  }

  // Handle boolean selection change
  function handleBooleanChange(trigger: ChatTriggers, key: string, event: CustomEvent) {
    (trigger as any)[key] = event.detail.selected === "true";
  }

  // Handle enum selection change
  function handleEnumChange(trigger: any, key: string, event: CustomEvent) {
    trigger[key] = parseInt(event.detail.selected);
  }

  // Handle trigger type change
  function handleTriggerTypeChange(event: CustomEvent) {
    newTrigger.isRegex = event.detail.selected === "true";
    handleNewTriggerRegexChange();
  }

  function getDescriptiveLabel(key: string): string {
    const labels: { [key: string]: string } = {
      useCount: "Usage Count",
      isRegex: "Is Regular Expression",
      ownerOnly: "Owner Only",
      guildId: "Guild ID",
      response: "Response Message",
      trigger: "Trigger Text or Pattern",
      prefixType: "Prefix Requirement",
      customPrefix: "Custom Prefix",
      autoDeleteTrigger: "Auto Delete Trigger Message",
      reactToTrigger: "React to Trigger Message",
      noRespond: "Don't Respond to Trigger",
      dmResponse: "Send Response as DM",
      containsAnywhere: "Trigger If Contained Anywhere",
      allowTarget: "Allow Targeting",
      reactions: "Trigger Reactions",
      grantedRoles: "Roles to Grant",
      removedRoles: "Roles to Remove",
      roleGrantType: "Role Grant Target",
      validTriggerTypes: "Valid Trigger Types",
      applicationCommandId: "Application Command ID",
      applicationCommandName: "Application Command Name",
      applicationCommandDescription: "Application Command Description",
      applicationCommandType: "Application Command Type",
      ephemeralResponse: "Ephemeral Response",
      crosspostingChannelId: "Crossposting Channel ID",
      crosspostingWebhookUrl: "Crossposting Webhook URL",
    };
    return labels[key] || key;
  }

  function showNotificationMessage(
    message: string,
    type: "success" | "error" = "success",
  ) {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  onMount(async () => {
    const guild = get(currentGuild);
    if (!guild) {
      await goto("/dashboard");
      return;
    }
    newTrigger.guildId = guild.id;
    loading = true;
    try {
      await Promise.all([loadTriggers(), loadGuildRoles()]);
      checkMobile();
      if (browser) window.addEventListener("resize", checkMobile);
    } catch (err) {
      error = "Failed to fetch data";
      logger.error(error, err);
    } finally {
      loading = false;
    }
  });

  // Watch for guild changes
  $: if ($currentGuild) {
    loadTriggers()
    loadGuildRoles()
  }

  $: colors = $colorStore;

  onDestroy(() => {
    if (browser) window.removeEventListener("resize", checkMobile);
  });

  $: colorVars = `
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-accent: ${colors.accent};
    --color-text: ${colors.text};
    --color-muted: ${colors.muted};
  `;
  
  // Tabs configuration following birthday pattern
  const tabs = [
    { id: "simple", label: "Simple Mode", icon: Zap },
    { id: "advanced", label: "Advanced Mode", icon: Settings }
  ];

  // Action buttons configuration
  $: actionButtons = [];

  // Handle tab change
  function handleTabChange(event: CustomEvent) {
    activeTab = event.detail.tabId;
    announceAction(`Switched to ${activeTab === 'simple' ? 'Simple Mode' : 'Advanced Mode'}`);
  }
  
  // Accessibility functions
  function announceAction(message: string) {
    statusMessage = message;
    setTimeout(() => statusMessage = "", 1000);
  }
  
  function announceError(message: string) {
    errorMessage = message;
    setTimeout(() => errorMessage = "", 5000);
  }
  
  // Quick trigger creation for Simple Mode
  async function createQuickTrigger() {
    if (!quickTriggerText.trim() || !quickResponseText.trim()) {
      showNotificationMessage("Both trigger text and response are required", "error");
      announceError("Both trigger text and response are required");
      return;
    }
    
    try {
      const guild = get(currentGuild);
      if (!guild?.id) {
        throw new Error("No guild selected");
      }
      
      const triggerData = {
        trigger: quickTriggerText.trim(),
        response: quickResponseText.trim(),
        isRegex: false,
        guildId: guild.id,
        validTriggerTypes: ChatTriggerType.Message, // Use integer, not array
      };
      
      const addedTrigger = await api.addChatTrigger(guild.id, triggerData as ChatTriggers);
      triggers = [...triggers, addedTrigger];
      
      // Reset form
      quickTriggerText = "";
      quickResponseText = "";
      
      showNotificationMessage("Trigger created successfully!", "success");
      announceAction("Trigger created successfully");
    } catch (error: any) {
      showNotificationMessage("Failed to create trigger: " + error.message, "error");
      announceError("Failed to create trigger");
    }
  }
  
  // Template usage functions
  function useTemplate(templateType: string) {
    switch (templateType) {
      case 'simple':
        quickTriggerText = "hello";
        quickResponseText = "Hello there! 👋";
        break;
      case 'role':
        activeTab = "advanced";
        newTrigger.trigger = "getrole";
        newTrigger.response = "Role assigned!";
        newTrigger.validTriggerTypesMessage = true;
        newTrigger.validTriggerTypesInteraction = false;
        newTrigger.validTriggerTypesButton = false;
        newTrigger.validTriggerTypesReactions = false;
        break;
      case 'slash':
        activeTab = "advanced";
        newTrigger.trigger = "info";
        newTrigger.response = "Server information: %server.name%";
        newTrigger.validTriggerTypesMessage = false;
        newTrigger.validTriggerTypesInteraction = true;
        newTrigger.validTriggerTypesButton = false;
        newTrigger.validTriggerTypesReactions = false;
        // Set application command properties for slash command
        newTrigger.applicationCommandType = CtApplicationCommandType.Slash;
        newTrigger.applicationCommandName = "info";
        newTrigger.applicationCommandDescription = "Get server information";
        break;
      case 'embed':
        activeTab = "advanced";
        newTrigger.trigger = "welcome";
        newTrigger.response = JSON.stringify({
          "content": "Welcome to the server!",
          "embed": {
            "title": "Welcome!",
            "description": "Thanks for joining %server.name%!",
            "color": "0x5865F2",
            "thumbnail": {
              "url": "%user.avatar%"
            },
            "footer": {
              "text": "Enjoy your stay!"
            }
          }
        }, null, 2);
        newTrigger.validTriggerTypesMessage = true;
        break;
    }
    announceAction(`${templateType} template applied`);
  }
  
  // Validation functions
  function validateTriggerOptions() {
    // Auto delete trigger and react to trigger are mutually exclusive
    if (newTrigger.autoDeleteTrigger && newTrigger.reactToTrigger) {
      newTrigger.reactToTrigger = false;
      announceAction("React to trigger disabled - cannot be used with auto-delete");
    }
    
    // React to trigger and auto delete trigger are mutually exclusive
    if (newTrigger.reactToTrigger && newTrigger.autoDeleteTrigger) {
      newTrigger.autoDeleteTrigger = false;
      announceAction("Auto-delete disabled - cannot be used with react to trigger");
    }
    
    // If no trigger types are selected, default to message
    if (!newTrigger.validTriggerTypesMessage && 
        !newTrigger.validTriggerTypesInteraction && 
        !newTrigger.validTriggerTypesButton && 
        !newTrigger.validTriggerTypesReactions) {
      newTrigger.validTriggerTypesMessage = true;
      announceAction("Message triggers enabled - at least one trigger type is required");
    }
    
    // Slash commands require interaction trigger type
    if (newTrigger.applicationCommandType === CtApplicationCommandType.Slash && 
        !newTrigger.validTriggerTypesInteraction) {
      newTrigger.validTriggerTypesInteraction = true;
      announceAction("Interaction triggers enabled for slash command");
    }
    
    // Reaction triggers should use emoji-like patterns
    if (newTrigger.validTriggerTypesReactions && newTrigger.trigger && 
        !newTrigger.trigger.match(/^[👍👎❤️😂😢😮😡💯]|:\w+:$/)) {
      // This is just a warning, not enforcement
      console.log("Consider using emoji names or Unicode emojis for reaction triggers");
    }
  }
  

  // Enhanced keyboard navigation
  function handleGlobalKeydown(event: KeyboardEvent) {
    // Global shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'n':
        case 'N':
          event.preventDefault();
          if (activeTab === 'simple') {
            document.getElementById('quick-trigger')?.focus();
          }
          announceAction('Create new trigger focused');
          break;
        case 's':
        case 'S':
          event.preventDefault();
          if (activeTab === 'simple') {
            createQuickTrigger();
          }
          break;
      }
    }
    
    // Tab navigation
    if (event.key === 'Escape') {
      expandedTriggerId = null;
      announceAction('Collapsed all cards');
    }
  }
  
  function handleCardKeydown(event: KeyboardEvent, triggerId: number) {
    switch(event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        toggleExpand(triggerId);
        announceAction(`Trigger ${expandedTriggerId === triggerId ? 'expanded' : 'collapsed'}`);
        break;
      case 'e':
      case 'E':
        if (!event.ctrlKey) {
          event.preventDefault();
          // Focus first input in expanded card or expand if collapsed
          if (expandedTriggerId !== triggerId) {
            toggleExpand(triggerId);
          }
          announceAction('Edit mode activated');
        }
        break;
      case 'd':
      case 'D':
        if (!event.ctrlKey) {
          event.preventDefault();
          deleteTrigger(triggerId);
        }
        break;
    }
  }
  
  
</script>

<!-- Global keyboard event handler -->
<svelte:window on:keydown={handleGlobalKeydown} />

<!-- Accessibility live regions -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {statusMessage}
</div>
<div aria-live="assertive" aria-atomic="true" class="sr-only">
  {errorMessage}
</div>

<DashboardPageLayout 
  title="Chat Triggers"
  subtitle="Create and manage automated responses to messages"
  icon={MessageCircle}
  {tabs}
  {activeTab}
  {actionButtons}
  guildName="Dashboard"
  on:tabChange={handleTabChange}
>
  <svelte:fragment slot="status-messages">
    <!-- Notifications -->
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <div class="p-4 rounded-xl shadow-2xl border max-w-md"
             style="background: {notificationType === 'success' ? '#10b98120' : '#ef444420'};
                    border-color: {notificationType === 'success' ? '#10b981' : '#ef4444'}30;">
          <div class="flex items-center gap-3">
            {#if notificationType === 'success'}
              <Check class="w-5 h-5" style="color: #10b981" />
            {:else}
              <AlertTriangle class="w-5 h-5" style="color: #ef4444" />
            {/if}
            <span style="color: {notificationType === 'success' ? '#10b981' : '#ef4444'}">{notificationMessage}</span>
          </div>
        </div>
      </div>
    {/if}
  </svelte:fragment>


  <!-- Loading State -->
  {#if loading}
    <div class="flex justify-center items-center min-h-[200px]">
      <div class="w-12 h-12 border-4 rounded-full animate-spin"
           style="border-color: {colors.primary}20; border-top-color: {colors.primary};">
      </div>
    </div>
  {:else if error}
    <div class="rounded-xl p-4 flex items-center gap-3"
         style="background: {colors.accent}10;" role="alert">
      <AlertTriangle class="w-5 h-5" style="color: {colors.accent}" />
      <p style="color: {colors.accent}">{error}</p>
    </div>
  {:else}
    <!-- Tab Content -->
    {#if activeTab === 'simple'}
      <div class="w-full space-y-6" in:fade={{ duration: 200 }}
           role="tabpanel" id="simple-panel" aria-labelledby="simple-tab" tabindex="0">
        
        <!-- Quick Setup Card -->
        <div class="rounded-2xl border p-6 shadow-2xl relative z-10"
             style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                    border-color: {colors.primary}30;">
          
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 rounded-xl"
                 style="background: linear-gradient(135deg, {colors.primary}20, {colors.secondary}20);">
              <Plus class="w-6 h-6" style="color: {colors.primary}" />
            </div>
            <h2 class="text-xl font-bold" style="color: {colors.text}">Quick Setup</h2>
          </div>

          <div class="space-y-4">
            <!-- Trigger Input -->
            <div>
              <label for="quick-trigger" class="block text-sm font-medium mb-2" style="color: {colors.text}">
                When someone types:
                <abbr title="required" aria-label="required">*</abbr>
              </label>
              <input 
                id="quick-trigger"
                class="w-full p-3 rounded-lg border transition-all duration-200"
                style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}10;"
                placeholder="hello"
                bind:value={quickTriggerText}
                aria-describedby="trigger-help"
                aria-required="true"
              />
              <div id="trigger-help" class="text-xs mt-1" style="color: {colors.muted}">
                Simple text that will trigger the response
              </div>
            </div>

            <!-- Response Input -->
            <div>
              <label for="quick-response" class="block text-sm font-medium mb-2" style="color: {colors.text}">
                Bot responds with:
                <abbr title="required" aria-label="required">*</abbr>
              </label>
              <textarea 
                id="quick-response"
                class="w-full p-3 rounded-lg border transition-all duration-200 resize-none"
                style="border-color: {colors.secondary}30; color: {colors.text}; background: {colors.primary}10;"
                placeholder="Hello there! 👋 (Supports plain text, embeds, and interactive components)"
                rows="3"
                bind:value={quickResponseText}
                aria-required="true"
              ></textarea>
              <div class="text-xs mt-1" style="color: {colors.muted}">
                💡 Tip: For rich embeds and interactive components, try the "Rich Embeds" template or use Advanced Mode
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
              <button 
                class="flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 min-h-[52px] disabled:opacity-50 hover:brightness-110"
                style="background: {colors.primary}20; color: {colors.primary}; border: 1px solid {colors.primary}30;"
                on:click={createQuickTrigger}
                disabled={!quickTriggerText.trim() || !quickResponseText.trim()}
                aria-describedby="create-help"
              >
                <div class="flex items-center justify-center gap-2">
                  <Plus class="w-5 h-5" />
                  <span>Create Trigger</span>
                </div>
              </button>
              
              <button 
                type="button"
                class="px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:brightness-110"
                style="background: {colors.secondary}20; color: {colors.secondary}; border: 1px solid {colors.secondary}30;"
                on:click={() => activeTab = 'advanced'}
              >
                More Options →
              </button>
            </div>
            
            <div id="create-help" class="text-xs" style="color: {colors.muted}">
              Creates a simple trigger that responds when users type your trigger text
            </div>
          </div>
        </div>

        <!-- Template Selection -->
        <div class="rounded-2xl border p-6 shadow-2xl relative z-5"
             style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                    border-color: {colors.primary}30;">
          
          <h3 class="text-lg font-semibold mb-4" style="color: {colors.text}">
            Or choose a template:
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              class="template-card p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 focus:scale-105"
              style="border-color: {colors.primary}30; background: linear-gradient(135deg, {colors.primary}10, {colors.secondary}10);"
              on:click={() => useTemplate('simple')}
              role="button"
              aria-describedby="template-simple-desc"
            >
              <div class="flex items-center gap-3 mb-2">
                <MessageCircle class="w-5 h-5" style="color: {colors.primary}" />
                <span class="font-medium" style="color: {colors.text}">Simple Response</span>
              </div>
              <p id="template-simple-desc" class="text-sm" style="color: {colors.muted}">
                Bot says X when users type Y
              </p>
            </button>

            <button 
              class="template-card p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 focus:scale-105"
              style="border-color: {colors.secondary}30; background: linear-gradient(135deg, {colors.secondary}15, {colors.primary}10);"
              on:click={() => useTemplate('role')}
              role="button"
              aria-describedby="template-role-desc"
            >
              <div class="flex items-center gap-3 mb-2">
                <Crown class="w-5 h-5" style="color: {colors.secondary}" />
                <span class="font-medium" style="color: {colors.text}">Role Actions</span>
              </div>
              <p id="template-role-desc" class="text-sm" style="color: {colors.muted}">
                Give/remove roles when triggered
              </p>
            </button>

            <button 
              class="template-card p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 focus:scale-105"
              style="border-color: {colors.accent}30; background: linear-gradient(135deg, {colors.accent}15, {colors.secondary}10);"
              on:click={() => useTemplate('slash')}
              role="button"
              aria-describedby="template-slash-desc"
            >
              <div class="flex items-center gap-3 mb-2">
                <Command class="w-5 h-5" style="color: {colors.accent}" />
                <span class="font-medium" style="color: {colors.text}">Slash Commands</span>
              </div>
              <p id="template-slash-desc" class="text-sm" style="color: {colors.muted}">
                Create custom slash commands
              </p>
            </button>

            <button 
              class="template-card p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 focus:scale-105"
              style="border-color: {colors.secondary}30; background: linear-gradient(135deg, {colors.gradientStart}15, {colors.gradientMid}10);"
              on:click={() => useTemplate('embed')}
              role="button"
              aria-describedby="template-embed-desc"
            >
              <div class="flex items-center gap-3 mb-2">
                <Sparkles class="w-5 h-5" style="color: {colors.secondary}" />
                <span class="font-medium" style="color: {colors.text}">Rich Embeds</span>
              </div>
              <p id="template-embed-desc" class="text-sm" style="color: {colors.muted}">
                Rich embeds with images, fields, and components
              </p>
            </button>
          </div>
        </div>

        <!-- Existing Triggers (Simple View) -->
        {#if triggers.length === 0}
          <div class="text-center py-12 rounded-2xl border shadow-2xl"
               style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                      border-color: {colors.primary}30;"
               transition:fade>
            <MessageCircle class="w-12 h-12 mx-auto mb-4" style="color: {colors.muted}" />
            <h3 class="text-lg font-semibold mb-2" style="color: {colors.text}">No Chat Triggers Found</h3>
            <p style="color: {colors.muted}">Create your first trigger using the quick setup above</p>
          </div>
        {:else}
          <div class="space-y-4">
            {#each triggers as trigger (trigger.id)}
              <div class="trigger-card rounded-2xl border shadow-2xl transition-all duration-200 relative"
                   style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                          border-color: {colors.primary}30;
                          z-index: {expandedTriggerId === trigger.id ? 15 : 5};"
                   role="article"
                   aria-labelledby="trigger-{trigger.id}-title"
                   id="trigger-{trigger.id}">
                
                <div class="p-4">
                  <div class="flex items-center justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <h3 id="trigger-{trigger.id}-title" class="font-medium mb-1" style="color: {colors.text}">
                        "{trigger.trigger}" → "{trigger.response}"
                      </h3>
                      <div class="text-sm" style="color: {colors.muted}">
                        Used {trigger.useCount || 0} times
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-2">
                      <button
                        class="p-2 rounded-lg transition-all duration-200 hover:brightness-110"
                        style="background: {colors.accent}20; color: {colors.accent}; border: 1px solid {colors.accent}30;"
                        on:click={() => deleteTrigger(trigger.id)}
                        aria-label="Delete trigger {trigger.trigger}"
                      >
                        <Trash class="w-4 h-4" style="color: {colors.accent}" />
                      </button>
                      
                      <button
                        class="p-2 rounded-lg transition-all duration-200 hover:brightness-110"
                        style="background: {colors.secondary}20; color: {colors.secondary}; border: 1px solid {colors.secondary}30;"
                        on:click={() => toggleExpand(trigger.id)}
                        aria-expanded={expandedTriggerId === trigger.id}
                        aria-label="{expandedTriggerId === trigger.id ? 'Collapse' : 'Expand'} trigger settings"
                      >
                        <svelte:component
                          this={expandedTriggerId === trigger.id ? ChevronUp : ChevronDown}
                          class="w-4 h-4"
                          style="color: {colors.secondary}"
                        />
                      </button>
                    </div>
                  </div>

                  {#if expandedTriggerId === trigger.id}
                    <div transition:slide={{ duration: 200 }} class="mt-4 pt-4 border-t space-y-4"
                         style="border-color: {colors.primary}20;"
                         role="region"
                         aria-label="Advanced settings for {trigger.trigger}">
                      
                      <!-- Basic Editing -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label for="edit-trigger-{trigger.id}" class="block text-sm font-medium mb-2" style="color: {colors.text}">
                            Trigger Text
                          </label>
                          <input
                            id="edit-trigger-{trigger.id}"
                            class="w-full p-3 rounded-lg border transition-all duration-200"
                            style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}10;"
                            bind:value={trigger.trigger}
                            aria-describedby="edit-trigger-help-{trigger.id}"
                          />
                          <div id="edit-trigger-help-{trigger.id}" class="text-xs mt-1" style="color: {colors.muted}">
                            Text that will trigger this response
                          </div>
                        </div>

                        <div>
                          <label for="edit-response-{trigger.id}" class="block text-sm font-medium mb-2" style="color: {colors.text}">
                            Response Message
                          </label>
                          <textarea
                            id="edit-response-{trigger.id}"
                            class="w-full p-3 rounded-lg border transition-all duration-200 resize-none"
                            style="border-color: {colors.secondary}30; color: {colors.text}; background: {colors.primary}10;"
                            bind:value={trigger.response}
                            rows="2"
                          ></textarea>
                        </div>
                      </div>

                      <!-- Quick Settings -->
                      <div class="space-y-3">
                        <h4 class="font-medium" style="color: {colors.text}">Quick Settings</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <label class="flex items-center gap-3 p-3 rounded-lg" style="background: {colors.primary}08;">
                            <input type="checkbox" 
                                   bind:checked={trigger.autoDeleteTrigger}
                                   class="sr-only peer"
                                   aria-describedby="auto-delete-desc-{trigger.id}" />
                            <div class="switch-toggle w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all relative"
                                 style="peer-checked:bg-color: {colors.primary}; {trigger.autoDeleteTrigger ? `box-shadow: 0 0 8px ${colors.primary}40, inset 0 1px 0 rgba(255,255,255,0.2);` : ''}"></div>
                            <span style="color: {colors.text}">Delete trigger message</span>
                          </label>
                          <div id="auto-delete-desc-{trigger.id}" class="text-xs" style="color: {colors.muted}">
                            Automatically delete the user's message that triggered this response
                          </div>

                          <label class="flex items-center gap-3 p-3 rounded-lg" style="background: {colors.primary}08;">
                            <input type="checkbox" 
                                   bind:checked={trigger.dmResponse}
                                   class="sr-only peer" />
                            <div class="switch-toggle w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all relative"
                                 style="peer-checked:bg-color: {colors.primary}; {trigger.dmResponse ? `box-shadow: 0 0 8px ${colors.primary}40, inset 0 1px 0 rgba(255,255,255,0.2);` : ''}"></div>
                            <span style="color: {colors.text}">Send as DM</span>
                          </label>

                          <label class="flex items-center gap-3 p-3 rounded-lg" style="background: {colors.primary}08;">
                            <input type="checkbox" 
                                   bind:checked={trigger.containsAnywhere}
                                   class="sr-only peer" />
                            <div class="switch-toggle w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all relative"
                                 style="peer-checked:bg-color: {colors.primary}; {trigger.containsAnywhere ? `box-shadow: 0 0 8px ${colors.primary}40, inset 0 1px 0 rgba(255,255,255,0.2);` : ''}"></div>
                            <span style="color: {colors.text}">Match anywhere in message</span>
                          </label>
                        </div>
                      </div>

                      <!-- Role Settings -->
                      <div class="space-y-3">
                        <h4 class="font-medium" style="color: {colors.text}">Role Management</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span class="block text-sm font-medium mb-2" style="color: {colors.text}">
                              Roles to Grant
                            </span>
                            <DiscordSelector
                              type="role"
                              options={roleOptions}
                              multiple={true}
                              selected={trigger.grantedRoles}
                              placeholder="No roles to grant"
                              on:change={(e) => trigger.grantedRoles = e.detail.selected}
                              aria-label="Select roles to grant for this trigger"
                              aria-describedby="roles-grant-help-{trigger.id}"
                            />
                            <div id="roles-grant-help-{trigger.id}" class="text-xs mt-1" style="color: {colors.muted}">
                              Users will receive these roles when the trigger is activated
                            </div>
                          </div>

                          <div>
                            <span class="block text-sm font-medium mb-2" style="color: {colors.text}">
                              Roles to Remove  
                            </span>
                            <DiscordSelector
                              type="role"
                              options={roleOptions}
                              multiple={true}
                              selected={trigger.removedRoles}
                              placeholder="No roles to remove"
                              on:change={(e) => trigger.removedRoles = e.detail.selected}
                              aria-label="Select roles to remove for this trigger"
                              aria-describedby="roles-remove-help-{trigger.id}"
                            />
                            <div id="roles-remove-help-{trigger.id}" class="text-xs mt-1" style="color: {colors.muted}">
                              Users will lose these roles when the trigger is activated
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Save Button -->
                      <div class="flex justify-end pt-3">
                        <button
                          class="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:brightness-110"
                          style="background: {colors.primary}20; color: {colors.primary}; border: 1px solid {colors.primary}30;"
                          on:click={() => updateTrigger(trigger)}
                        >
                          <div class="flex items-center gap-2">
                            <Save class="w-4 h-4" />
                            <span>Save Changes</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

    {:else if activeTab === 'advanced'}
      <div class="w-full space-y-6" in:fade={{ duration: 200 }}
           role="tabpanel" id="advanced-panel" aria-labelledby="advanced-tab" tabindex="0">
        
        <!-- Advanced Creation Form -->
        <div class="rounded-2xl border p-6 shadow-2xl relative z-30"
             style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                    border-color: {colors.primary}30;">
          
          <h2 class="text-xl font-bold mb-6" style="color: {colors.text}">Advanced Trigger Creation</h2>
          
          <!-- Basic Trigger Configuration -->
          <div class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Trigger Text -->
              <div>
                <label for="new-trigger" class="block text-sm font-medium mb-2" style="color: {colors.text}">
                  Trigger Text or Pattern
                  <abbr title="required" aria-label="required">*</abbr>
                </label>
                <input
                  id="new-trigger"
                  class="w-full p-3 rounded-lg border transition-all duration-200"
                  style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}10;"
                  bind:value={newTrigger.trigger}
                  on:input={handleNewTriggerRegexChange}
                  placeholder="Enter trigger text or regex pattern"
                  aria-required="true"
                  aria-describedby="trigger-validity"
                />
                {#if newTrigger.isRegex && !newTrigger.isValidRegex}
                  <div id="trigger-validity" class="text-xs mt-1" style="color: {colors.accent}" role="alert">
                    Invalid regular expression syntax
                  </div>
                {/if}
              </div>

              <!-- Response Message -->
              <div>
                <label for="new-response" class="flex items-center gap-2 text-sm font-medium mb-2" style="color: {colors.text}">
                  Response Message
                  <abbr title="required" aria-label="required">*</abbr>
                  <Tooltip 
                    placement="bottom" 
                    text="Supports rich content including plain text, JSON embeds with images/fields/colors, interactive components, and placeholders like %user.name%. Try the Rich Embeds template!" />
                </label>
                <textarea
                  id="new-response"
                  class="w-full p-3 rounded-lg border transition-all duration-200 resize-none"
                  style="border-color: {colors.secondary}30; color: {colors.text}; background: {colors.primary}10;"
                  bind:value={newTrigger.response}
                  placeholder="Bot's response message or JSON for rich embeds/components"
                  rows="3"
                  aria-required="true"
                ></textarea>
              </div>
            </div>

            <!-- Pattern Type (Regex vs Normal) -->
            <div class="space-y-3">
              <h3 class="text-lg font-semibold" style="color: {colors.text}">Pattern Type</h3>
              <div class="flex items-center gap-4">
                <DiscordSelector
                  type="custom"
                  options={triggerTypeOptions}
                  selected={newTrigger.isRegex ? "true" : "false"}
                  placeholder="Select pattern type"
                  on:change={handleTriggerTypeChange}
                  aria-label="Pattern type selector"
                />
              </div>
            </div>

            <!-- Valid Trigger Types -->
            <div class="space-y-3">
              <h3 class="text-lg font-semibold flex items-center gap-2" style="color: {colors.text}">
                Valid Trigger Types
                <Tooltip 
                  placement="bottom" 
                  text="Choose how this trigger activates: Messages (regular chat), Slash Commands (requires setup), Buttons (interactive), or Reactions (emoji responses). Multiple types can be enabled." />
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style="background: {colors.primary}08;">
                  <input type="checkbox" 
                         bind:checked={newTrigger.validTriggerTypesMessage}
                         on:change={validateTriggerOptions}
                         class="sr-only peer" />
                  <div class="w-11 h-6 rounded-full peer-focus:ring-2 
                            after:content-[''] after:absolute after:top-[2px]
                            after:left-[2px] after:bg-white after:rounded-full
                            after:h-5 after:w-5 after:transition-all
                            peer-checked:after:translate-x-full relative"
                       style="background: {newTrigger.validTriggerTypesMessage ? colors.primary : `${colors.primary}20`};">
                  </div>
                  <span style="color: {colors.text}">Message triggers</span>
                </label>

                <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style="background: {colors.primary}08;">
                  <input type="checkbox" 
                         bind:checked={newTrigger.validTriggerTypesInteraction}
                         on:change={validateTriggerOptions}
                         class="sr-only peer" />
                  <div class="w-11 h-6 rounded-full peer-focus:ring-2 
                            after:content-[''] after:absolute after:top-[2px]
                            after:left-[2px] after:bg-white after:rounded-full
                            after:h-5 after:w-5 after:transition-all
                            peer-checked:after:translate-x-full relative"
                       style="background: {newTrigger.validTriggerTypesInteraction ? colors.primary : `${colors.primary}20`};">
                  </div>
                  <span style="color: {colors.text}">Slash command interactions</span>
                </label>

                <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style="background: {colors.primary}08;">
                  <input type="checkbox" 
                         bind:checked={newTrigger.validTriggerTypesButton}
                         on:change={validateTriggerOptions}
                         class="sr-only peer" />
                  <div class="w-11 h-6 rounded-full peer-focus:ring-2 
                            after:content-[''] after:absolute after:top-[2px]
                            after:left-[2px] after:bg-white after:rounded-full
                            after:h-5 after:w-5 after:transition-all
                            peer-checked:after:translate-x-full relative"
                       style="background: {newTrigger.validTriggerTypesButton ? colors.primary : `${colors.primary}20`};">
                  </div>
                  <span style="color: {colors.text}">Button interactions</span>
                </label>

                <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style="background: {colors.primary}08;">
                  <input type="checkbox" 
                         bind:checked={newTrigger.validTriggerTypesReactions}
                         on:change={validateTriggerOptions}
                         class="sr-only peer" />
                  <div class="w-11 h-6 rounded-full peer-focus:ring-2 
                            after:content-[''] after:absolute after:top-[2px]
                            after:left-[2px] after:bg-white after:rounded-full
                            after:h-5 after:w-5 after:transition-all
                            peer-checked:after:translate-x-full relative"
                       style="background: {newTrigger.validTriggerTypesReactions ? colors.primary : `${colors.primary}20`};">
                  </div>
                  <span style="color: {colors.text}">Reaction triggers</span>
                </label>
              </div>
              <div class="text-xs" style="color: {colors.muted}">
                Select which types of interactions can trigger this response
              </div>
            </div>

            <!-- Regex Testing (shown when regex is enabled) -->
            {#if newTrigger.isRegex}
              <div class="space-y-3" transition:slide>
                <h4 class="font-semibold flex items-center gap-2" style="color: {colors.text}">
                  Regular Expression Testing
                  <Tooltip 
                    placement="bottom" 
                    text="Test your regex pattern against sample text to ensure it matches correctly and prevents unexpected behavior." />
                </h4>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label for="regex-test-input" class="block text-sm font-medium mb-2" style="color: {colors.text}">
                      Test String
                    </label>
                    <input
                      id="regex-test-input"
                      class="w-full p-3 rounded-lg border"
                      style="border-color: {colors.accent}30; color: {colors.text}; background: {colors.primary}10;"
                      bind:value={newTriggerRegexTestString}
                      on:input={testNewTriggerRegex}
                      placeholder="Enter text to test against your regex"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: {colors.text}">
                      Test Result
                    </label>
                    <div class="p-3 rounded-lg" style="background: {colors.accent}10; color: {colors.text};">
                      {newTriggerRegexTestResult || 'Enter test string to see results'}
                    </div>
                  </div>
                </div>
                {#if newTriggerRegexHighlightedString}
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: {colors.text}">
                      Highlighted Matches
                    </label>
                    <div class="p-3 rounded-lg" style="background: {colors.primary}10; color: {colors.text};">
                      {@html newTriggerRegexHighlightedString}
                    </div>
                  </div>
                {/if}
              </div>
            {/if}

            <!-- Role Management -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold flex items-center gap-2" style="color: {colors.text}">
                Role Management
                <Tooltip 
                  placement="bottom" 
                  text="Grant or remove Discord roles when triggered. Useful for role reactions, access controls, and rewards." />
              </h3>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: {colors.text}">
                    Roles to Grant
                  </label>
                  <DiscordSelector
                    type="role"
                    options={roleOptions}
                    multiple={true}
                    selected={newTrigger.grantedRoles}
                    placeholder="Select roles to grant"
                    on:change={(e) => newTrigger.grantedRoles = e.detail.selected}
                    aria-label="Roles to grant selector"
                    aria-describedby="new-roles-grant-help"
                  />
                  <div id="new-roles-grant-help" class="text-xs mt-1" style="color: {colors.muted}">
                    Users will receive these roles when the trigger is activated
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: {colors.text}">
                    Roles to Remove
                  </label>
                  <DiscordSelector
                    type="role"
                    options={roleOptions}
                    multiple={true}
                    selected={newTrigger.removedRoles}
                    placeholder="Select roles to remove"
                    on:change={(e) => newTrigger.removedRoles = e.detail.selected}
                    aria-label="Roles to remove selector"
                    aria-describedby="new-roles-remove-help"
                  />
                  <div id="new-roles-remove-help" class="text-xs mt-1" style="color: {colors.muted}">
                    Users will lose these roles when the trigger is activated
                  </div>
                </div>
              </div>
            </div>

            <!-- Basic Options -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold" style="color: {colors.text}">Basic Options</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer" 
                       style="background: {colors.primary}08; opacity: {newTrigger.reactToTrigger ? '0.5' : '1'};">
                  <input type="checkbox" 
                         bind:checked={newTrigger.autoDeleteTrigger}
                         on:change={validateTriggerOptions}
                         disabled={newTrigger.reactToTrigger}
                         class="sr-only peer" />
                  <div class="switch-toggle w-11 h-6 rounded-full peer-focus:ring-2 
                            after:content-[''] after:absolute after:top-[2px]
                            after:left-[2px] after:bg-white after:rounded-full
                            after:h-5 after:w-5 after:transition-all
                            peer-checked:after:translate-x-full relative"
                       style="background: {newTrigger.autoDeleteTrigger ? colors.primary : `${colors.primary}20`};
                              {newTrigger.autoDeleteTrigger ? `box-shadow: 0 0 8px ${colors.primary}40, inset 0 1px 0 rgba(255,255,255,0.2);` : ''}">
                  </div>
                  <span style="color: {colors.text}">Auto-delete trigger message</span>
                  <div class="ml-auto">
                    <Tooltip 
                      placement="top" 
                      text="Automatically deletes the user's message that triggered this response. Cannot be used with 'React to trigger'." />
                  </div>
                </label>

                <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style="background: {colors.primary}08;">
                  <input type="checkbox" 
                         bind:checked={newTrigger.dmResponse}
                         class="sr-only peer" />
                  <div class="switch-toggle w-11 h-6 rounded-full peer-focus:ring-2 
                            after:content-[''] after:absolute after:top-[2px]
                            after:left-[2px] after:bg-white after:rounded-full
                            after:h-5 after:w-5 after:transition-all
                            peer-checked:after:translate-x-full relative"
                       style="background: {newTrigger.dmResponse ? colors.primary : `${colors.primary}20`};
                              {newTrigger.dmResponse ? `box-shadow: 0 0 8px ${colors.primary}40, inset 0 1px 0 rgba(255,255,255,0.2);` : ''}">
                  </div>
                  <span style="color: {colors.text}">Send response as DM</span>
                </label>

                <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style="background: {colors.primary}08;">
                  <input type="checkbox" 
                         bind:checked={newTrigger.containsAnywhere}
                         class="sr-only peer" />
                  <div class="switch-toggle w-11 h-6 rounded-full peer-focus:ring-2 
                            after:content-[''] after:absolute after:top-[2px]
                            after:left-[2px] after:bg-white after:rounded-full
                            after:h-5 after:w-5 after:transition-all
                            peer-checked:after:translate-x-full relative"
                       style="background: {newTrigger.containsAnywhere ? colors.primary : `${colors.primary}20`};
                              {newTrigger.containsAnywhere ? `box-shadow: 0 0 8px ${colors.primary}40, inset 0 1px 0 rgba(255,255,255,0.2);` : ''}">
                  </div>
                  <span style="color: {colors.text}">Match anywhere in message</span>
                  <div class="ml-auto">
                    <Tooltip 
                      placement="top" 
                      text="When enabled, the trigger can be found anywhere within a message. When disabled, the message must start with the trigger text." />
                  </div>
                </label>

                <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer" 
                       style="background: {colors.primary}08; opacity: {newTrigger.autoDeleteTrigger ? '0.5' : '1'};">
                  <input type="checkbox" 
                         bind:checked={newTrigger.reactToTrigger}
                         on:change={validateTriggerOptions}
                         disabled={newTrigger.autoDeleteTrigger}
                         class="sr-only peer" />
                  <div class="switch-toggle w-11 h-6 rounded-full peer-focus:ring-2 
                            after:content-[''] after:absolute after:top-[2px]
                            after:left-[2px] after:bg-white after:rounded-full
                            after:h-5 after:w-5 after:transition-all
                            peer-checked:after:translate-x-full relative"
                       style="background: {newTrigger.reactToTrigger ? colors.primary : `${colors.primary}20`};
                              {newTrigger.reactToTrigger ? `box-shadow: 0 0 8px ${colors.primary}40, inset 0 1px 0 rgba(255,255,255,0.2);` : ''}">
                  </div>
                  <span style="color: {colors.text}">React to trigger message</span>
                  <div class="ml-auto">
                    <Tooltip 
                      placement="top" 
                      text="Adds reaction emojis to the user's message instead of the bot's response. Cannot be used with 'Auto-delete trigger'." />
                  </div>
                </label>

                <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style="background: {colors.primary}08;">
                  <input type="checkbox" 
                         bind:checked={newTrigger.noRespond}
                         class="sr-only peer" />
                  <div class="switch-toggle w-11 h-6 rounded-full peer-focus:ring-2 
                            after:content-[''] after:absolute after:top-[2px]
                            after:left-[2px] after:bg-white after:rounded-full
                            after:h-5 after:w-5 after:transition-all
                            peer-checked:after:translate-x-full relative"
                       style="background: {newTrigger.noRespond ? colors.primary : `${colors.primary}20`};
                              {newTrigger.noRespond ? `box-shadow: 0 0 8px ${colors.primary}40, inset 0 1px 0 rgba(255,255,255,0.2);` : ''}">
                  </div>
                  <span style="color: {colors.text}">Don't send response message</span>
                </label>

                <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style="background: {colors.primary}08;">
                  <input type="checkbox" 
                         bind:checked={newTrigger.ownerOnly}
                         class="sr-only peer" />
                  <div class="switch-toggle w-11 h-6 rounded-full peer-focus:ring-2 
                            after:content-[''] after:absolute after:top-[2px]
                            after:left-[2px] after:bg-white after:rounded-full
                            after:h-5 after:w-5 after:transition-all
                            peer-checked:after:translate-x-full relative"
                       style="background: {newTrigger.ownerOnly ? colors.primary : `${colors.primary}20`};
                              {newTrigger.ownerOnly ? `box-shadow: 0 0 8px ${colors.primary}40, inset 0 1px 0 rgba(255,255,255,0.2);` : ''}">
                  </div>
                  <span style="color: {colors.text}">Owner only</span>
                </label>
              </div>
            </div>

            <!-- Advanced Configuration (Collapsible) -->
            <div class="space-y-4">
              <button 
                class="flex items-center gap-2 text-lg font-semibold transition-colors duration-200"
                style="color: {colors.text}"
                on:click={() => showAdvancedOptions = !showAdvancedOptions}
                aria-expanded={showAdvancedOptions}
                aria-controls="advanced-options"
              >
                <svelte:component 
                  this={showAdvancedOptions ? ChevronUp : ChevronRight} 
                  class="w-5 h-5" 
                />
                Advanced Configuration
                <Tooltip 
                  placement="bottom" 
                  text="Advanced options for prefix requirements, role targeting, and interaction commands. Most users won't need these." />
              </button>

              {#if showAdvancedOptions}
                <div id="advanced-options" transition:slide class="space-y-6">
                  <!-- Prefix Configuration -->
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium mb-2" style="color: {colors.text}">
                        Prefix Requirement
                      </label>
                      <DiscordSelector
                        type="custom"
                        options={getEnumOptionsForSelector('prefixType')}
                        selected={newTrigger.prefixType?.toString() || "0"}
                        placeholder="Select prefix type"
                        on:change={(e) => handleEnumChange(newTrigger, 'prefixType', e)}
                        aria-label="Prefix requirement selector"
                      />
                    </div>

                    {#if newTrigger.prefixType === RequirePrefixType.Custom}
                      <div transition:slide>
                        <label for="custom-prefix" class="block text-sm font-medium mb-2" style="color: {colors.text}">
                          Custom Prefix
                        </label>
                        <input
                          id="custom-prefix"
                          class="w-full p-3 rounded-lg border"
                          style="border-color: {colors.accent}30; color: {colors.text}; background: {colors.primary}10;"
                          bind:value={newTrigger.customPrefix}
                          placeholder="!"
                        />
                      </div>
                    {/if}
                  </div>

                  <!-- Role Grant Type -->
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: {colors.text}">
                      Role Grant Target
                    </label>
                    <DiscordSelector
                      type="custom"
                      options={getEnumOptionsForSelector('roleGrantType')}
                      selected={newTrigger.roleGrantType?.toString() || "0"}
                      placeholder="Who gets the roles"
                      on:change={(e) => handleEnumChange(newTrigger, 'roleGrantType', e)}
                      aria-label="Role grant target selector"
                    />
                  </div>

                  <!-- Additional Options -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label for="reactions" class="block text-sm font-medium mb-2" style="color: {colors.text}">
                        Reactions (emojis)
                      </label>
                      <input
                        id="reactions"
                        class="w-full p-3 rounded-lg border"
                        style="border-color: {colors.secondary}30; color: {colors.text}; background: {colors.primary}10;"
                        bind:value={newTrigger.reactions}
                        placeholder="👍 ✅ 🎉"
                      />
                    </div>

                    <div class="flex items-center gap-3 p-3 rounded-lg" style="background: {colors.primary}08;">
                      <label class="flex items-center gap-3">
                        <input type="checkbox" 
                               bind:checked={newTrigger.allowTarget}
                               class="sr-only peer" />
                        <div class="switch-toggle w-11 h-6 rounded-full peer-focus:ring-2 
                                  after:content-[''] after:absolute after:top-[2px]
                                  after:left-[2px] after:bg-white after:rounded-full
                                  after:h-5 after:w-5 after:transition-all
                                  peer-checked:after:translate-x-full relative"
                             style="background: {newTrigger.allowTarget ? colors.primary : `${colors.primary}20`};
                                    {newTrigger.allowTarget ? `box-shadow: 0 0 8px ${colors.primary}40, inset 0 1px 0 rgba(255,255,255,0.2);` : ''}">
                        </div>
                        <span style="color: {colors.text}">Allow targeting</span>
                      </label>
                    </div>
                  </div>
                </div>
              {/if}
            </div>

            <!-- Create Button -->
            <div class="flex justify-end pt-6">
              <button
                class="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                style="background: {colors.primary}20; color: {colors.primary}; border: 1px solid {colors.primary}30;"
                on:click={addTrigger}
                disabled={!newTrigger.trigger?.trim() || !newTrigger.response?.trim() || (newTrigger.isRegex && !newTrigger.isValidRegex)}
                aria-describedby="create-help"
              >
                <div class="flex items-center gap-2">
                  <Plus class="w-5 h-5" />
                  <span>Create Advanced Trigger</span>
                </div>
              </button>
            </div>
            <div id="create-help" class="text-xs text-right" style="color: {colors.muted}">
              All required fields must be filled with valid data
            </div>
          </div>
        </div>
      </div>
    {/if}
  {/if}

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

    /* Custom scrollbar */
    :global(*::-webkit-scrollbar) {
        @apply w-2;
    }

    :global(*::-webkit-scrollbar-track) {
        background: var(--color-primary)10;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background: var(--color-primary)30;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb:hover) {
        background: var(--color-primary)50;
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

    /* Animation for loading spinner */
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }

    /* Screen reader only content */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    /* Toggle switch styles */
    .peer:checked ~ div {
        background-color: var(--color-primary);
    }

    /* Focus styles for accessibility */
    .trigger-card:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }

    .template-card:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }

    /* Progressive enhancement for reduced motion */
    @media (prefers-reduced-motion: reduce) {
        .transition-all {
            transition: none;
        }
        
        .animate-spin {
            animation: none;
        }
        
        /* Provide alternative loading indicator */
        .animate-spin::after {
            content: "Loading...";
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
        .trigger-card {
            border: 2px solid;
        }
        
        .template-card {
            border: 2px solid;
        }
        
        button:focus {
            outline: 3px solid Highlight;
        }
    }

    /* Touch target optimization */
    @media (hover: none) {
        .touch-target {
            min-height: 44px;
            min-width: 44px;
        }
    }

    /* Switch shine effect for active state */
    @media (prefers-reduced-motion: no-preference) {
        .switch-toggle {
            transition: box-shadow 0.3s ease;
        }
    }

    /* Disable shine for users who prefer reduced motion */
    @media (prefers-reduced-motion: reduce) {
        .switch-toggle {
            box-shadow: none !important;
        }
    }
</style>