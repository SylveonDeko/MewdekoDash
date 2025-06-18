<!-- routes/dashboard/chat-triggers/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { fade, slide } from "svelte/transition";
  import MultiSelectDropdown from "$lib/components/MultiSelectDropdown.svelte";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/Notification.svelte";
  import { get } from "svelte/store";
  import type { ChatTriggers } from "$lib/types/models";
  import type { PageData } from "./$types";
  import {
    AlertTriangle,
    Check,
    ChevronDown,
    ChevronUp,
    Command,
    Delete,
    Edit,
    MessageCircle,
    Plus,
    Settings,
    Sparkles,
    ToggleRight,
    Users,
    X
  } from "lucide-svelte";
  import { browser } from "$app/environment";
  import { logger } from "$lib/logger.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";

  export let data: PageData;

  // Notification variables
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";

  // Data variables
  let triggers: ChatTriggers[] = [];
  let newTrigger: Partial<ChatTriggers> & { isValidRegex: boolean } = {
    trigger: "",
    response: "",
    grantedRoles: "",
    removedRoles: "",
    isRegex: false,
    isValidRegex: true,
  };
  let guildRoles: Array<{ id: string; name: string }> = [];

  // UI state variables
  let newTriggerRegexTestString = "";
  let newTriggerRegexTestResult = "";
  let newTriggerRegexHighlightedString = "";
  let expandedTriggerId: number | null = null;
  let loading = true;
  let error: string | null = null;
  let regexTestString = "";
  let regexTestResult = "";
  let regexHighlightedString = "";
  let dropdownRef: HTMLDivElement;
  let activeDropdown: string | null = null;
  let isMobile = false;

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
    Message: 1,
    Interaction: 2,
    Button: 4,
  };

  const CtApplicationCommandType = {
    None: 0,
    Slash: 1,
    Message: 2,
    User: 3,
  };

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
        isValidRegex: trigger.isRegex ? validateRegex(trigger.trigger) : true,
      }));
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
      const addedTrigger = await api.addChatTrigger(
        guild.id,
        newTrigger as ChatTriggers,
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
  async function updateTrigger(trigger: ChatTriggers) {
    if (!trigger.trigger.trim() || !trigger.response.trim()) {
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
      const updatedTrigger = {
        ...trigger,
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

  // Function to delete a trigger
  async function deleteTrigger(triggerId: number) {
    if (!confirm("Are you sure you want to delete this trigger?")) {
      return;
    }

    try {
      const guild = get(currentGuild);
      if (!guild?.id) {
        throw new Error("No guild selected");
      }
      await api.deleteChatTrigger(guild.id, triggerId);
      showNotificationMessage("Trigger deleted successfully", "success");
      await loadTriggers();
    } catch (error: any) {
      showNotificationMessage(
        "Failed to delete trigger: " + error.message,
        "error",
      );
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
  function handleRegexChange(trigger: ChatTriggers) {
    if (trigger.isRegex) {
      trigger.isValidRegex = validateRegex(trigger.trigger);
    }
  }

  // Function to test regex for existing triggers
  function testRegex(trigger: ChatTriggers) {
    if (trigger.isRegex && trigger.isValidRegex) {
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

  // Helper functions
  function toggleExpand(triggerId: number) {
    expandedTriggerId = expandedTriggerId === triggerId ? null : triggerId;
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

  function handleDropdownKeydown(event: KeyboardEvent, key: string) {
    if (event.key === "Escape") {
      closeDropdown();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const options = Array.from(
        dropdownRef.querySelectorAll(
          `[data-dropdown="${key}"] [role="option"]`,
        ),
      );
      const currentIndex = options.findIndex(
        (option) => option === document.activeElement,
      );
      let nextIndex;
      if (event.key === "ArrowDown") {
        nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
      }
      (options[nextIndex] as HTMLElement).focus();
    }
  }

  function handleOptionKeydown(
    event: KeyboardEvent,
    option: string,
    key: string,
    trigger: ChatTriggers,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleOption(option, key, trigger);
    }
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

  function toggleDropdown(key: string) {
    activeDropdown = activeDropdown === key ? null : key;
  }

  function closeDropdown() {
    activeDropdown = null;
  }

  function getEnumDisplayValue(enumObj: object, value: any): string {
    const entry = Object.entries(enumObj).find(([key, val]) => val === value);
    return entry ? entry[0] : "Unknown";
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
</script>

<svelte:head>
  <title>Chat Triggers - Dashboard</title>
</svelte:head>

<div
  class="min-h-screen p-4 md:p-6"
  style="{colorVars} background: radial-gradient(circle at top,
    {colors.gradientStart}15 0%,
    {colors.gradientMid}10 50%,
    {colors.gradientEnd}05 100%);"
>
  <div class="max-w-7xl mx-auto space-y-8">
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification {notificationMessage} type={notificationType} />
      </div>
    {/if}

    <!-- Header -->
    <div
      class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
             border-color: {colors.primary}30;"
    >
      <h1 class="text-3xl font-bold" style="color: {colors.text}">Chat Triggers</h1>
      <p style="color: {colors.muted}" class="mt-2">Create and manage automated responses to messages</p>
    </div>

    {#if loading}
      <div class="flex justify-center items-center min-h-[200px]">
        <div
          class="w-12 h-12 border-4 rounded-full animate-spin"
          style="border-color: {colors.primary}20;
                 border-top-color: {colors.primary};">
        </div>
      </div>
    {:else if error}
      <div
        class="rounded-xl p-4 flex items-center gap-3"
        style="background: {colors.accent}10;"
        role="alert"
      >
        <AlertTriangle class="w-5 h-5" style="color: {colors.accent}" />
        <p style="color: {colors.accent}">{error}</p>
      </div>
    {:else if triggers.length === 0}
      <div
        class="text-center py-12 backdrop-blur-sm rounded-2xl border shadow-2xl"
        style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
               border-color: {colors.primary}30;"
        transition:fade
      >
        <MessageCircle class="w-12 h-12 mx-auto mb-4" style="color: {colors.muted}" />
        <p style="color: {colors.muted}">No chat triggers found</p>
      </div>
    {:else}
      <!-- Existing Triggers List -->
      <div class="space-y-4">
        {#each triggers as trigger (trigger.id)}
          <div
            class="backdrop-blur-sm rounded-2xl border shadow-2xl overflow-hidden transition-all duration-200"
            style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                   border-color: {colors.primary}30;
                   hover:border-color: {colors.primary}50;"
          >
            <div class="p-4">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-grow">
                  <div class="flex items-center gap-2">
                    <Command class="w-5 h-5" style="color: {colors.primary}" />
                    <span class="font-medium break-all" style="color: {colors.text}">
                      {trigger.trigger}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    <MessageCircle class="w-4 h-4" style="color: {colors.muted}" />
                    <span class="text-sm break-all" style="color: {colors.muted}">
                      {trigger.response}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    class="p-2 rounded-lg transition-colors duration-200"
                    style="background: {colors.primary}10;
                           hover:background: {colors.primary}20;"
                    on:click={() => toggleExpand(trigger.id)}
                    aria-expanded={expandedTriggerId === trigger.id}
                  >
                    <svelte:component
                      this={expandedTriggerId === trigger.id ? ChevronUp : ChevronDown}
                      class="w-5 h-5"
                      style="color: {colors.primary}"
                    />
                  </button>
                </div>
              </div>

              {#if expandedTriggerId === trigger.id}
                <div
                  transition:slide
                  class="mt-4 space-y-4 border-t"
                  style="border-color: {colors.primary}20;"
                >
                  {#each Object.entries(trigger) as [key, value]}
                    {#if !["id", "dateAdded", "guildId", "isValidRegex", "useCount", "applicationCommandId"].includes(key)}
                      <div class="mt-4">
                        <div class="flex items-center gap-2 mb-2">
                          <svelte:component
                            this={key.includes('role') ? Users : key === 'trigger' ? Command : key === 'response' ? MessageCircle : Settings}
                            class="w-4 h-4"
                            style="color: {colors.secondary}"
                          />
                          <label
                            for={`${trigger.id}-${key}`}
                            class="font-medium"
                            style="color: {colors.text}"
                          >
                            {getDescriptiveLabel(key)}
                          </label>
                        </div>

                        {#if key === "trigger"}
                          <div>
                            <input
                              id={`${trigger.id}-${key}`}
                              class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                              class:border-red-500={trigger.isRegex && !trigger.isValidRegex}
                              style="border-color: {colors.primary}30;
                                     color: {colors.text};
                                     background: {colors.primary}10;"
                              bind:value={trigger[key]}
                              on:input={() => handleRegexChange(trigger)}
                            />
                            {#if trigger.isRegex && !trigger.isValidRegex}
                              <p class="mt-1 flex items-center gap-2" style="color: {colors.accent}">
                                <AlertTriangle class="w-4 h-4" />
                                <span>Invalid regex syntax</span>
                              </p>
                            {/if}
                          </div>
                        {:else if isBoolean(value)}
                          <div class="relative">
                            <select
                              id={`${trigger.id}-${key}`}
                              class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200 appearance-none"
                              style="border-color: {colors.secondary}30;
                                     color: {colors.text};
                                     background: {colors.primary}10;"
                              bind:value={trigger[key]}
                            >
                              <option value={true}>Yes</option>
                              <option value={false}>No</option>
                            </select>
                            <ChevronDown
                              class="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                              style="color: {colors.muted}"
                            />
                          </div>
                        {:else if isEnum(key)}
                          <div class="relative">
                            <select
                              id={`${trigger.id}-${key}`}
                              class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200 appearance-none"
                              style="border-color: {colors.secondary}30;
                                     color: {colors.text};
                                     background: {colors.primary}10;"
                              bind:value={trigger[key]}
                            >
                              {#each Object.entries(getEnumOptions(key)) as [optionKey, optionValue]}
                                <option value={optionValue}>{optionKey}</option>
                              {/each}
                            </select>
                            <ChevronDown
                              class="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                              style="color: {colors.muted}"
                            />
                          </div>
                        {:else if isRoleSelection(key)}
                          <MultiSelectDropdown
                            id={`${trigger.id}-${key}`}
                            options={guildRoles}
                            bind:selected={trigger[key]}
                            placeholder="Select roles"
                            on:change={(e) => {
                              trigger[key] = e.detail;
                            }}
                          />
                        {:else}
                          <input
                            id={`${trigger.id}-${key}`}
                            class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                            style="border-color: {colors.primary}30;
                                   color: {colors.text};
                                   background: {colors.primary}10;"
                            bind:value={trigger[key]}
                          />
                        {/if}
                      </div>
                    {/if}
                  {/each}

                  {#if trigger.isRegex && trigger.isValidRegex}
                    <div class="mt-4">
                      <div class="flex items-center gap-2 mb-2">
                        <Sparkles class="w-4 h-4" style="color: {colors.accent}" />
                        <label for="test-regex-pattern" class="font-medium" style="color: {colors.text}">
                          Test Regex Pattern
                        </label>
                      </div>
                      <input
                        id="test-regex-pattern"
                        class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                        style="border-color: {colors.accent}30;
                               color: {colors.text};
                               background: {colors.primary}10;"
                        bind:value={regexTestString}
                        placeholder="Enter text to test your regex pattern"
                        on:input={() => testRegex(trigger)}
                      />
                      {#if regexTestResult}
                        <p
                          class="mt-2 flex items-center gap-2"
                          style="color: {regexTestResult !== 'No matches' ? colors.primary : colors.accent}"
                        >
                          <svelte:component
                            this={regexTestResult !== 'No matches' ? Check : X}
                            class="w-4 h-4"
                          />
                          <span>{regexTestResult}</span>
                        </p>
                        {#if regexHighlightedString}
                          <div
                            class="mt-2 p-3 rounded-lg"
                            style="background: {colors.primary}10;"
                          >
                            {@html regexHighlightedString}
                          </div>
                        {/if}
                      {/if}
                    </div>
                  {/if}

                  <div class="flex justify-between gap-4 pt-4 mt-4" style="border-top: 1px solid {colors.primary}20;">
                    <button
                      class="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                      style="background: {colors.primary}15;
                             color: {colors.primary};
                             hover:background: {colors.primary}25;"
                      on:click={() => updateTrigger(trigger)}
                    >
                      <div class="flex items-center gap-2">
                        <Edit class="w-4 h-4" />
                        <span>Update</span>
                      </div>
                    </button>
                    <button
                      class="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                      style="background: {colors.accent}15;
                             color: {colors.accent};
                             hover:background: {colors.accent}25;"
                      on:click={() => deleteTrigger(trigger.id)}
                    >
                      <div class="flex items-center gap-2">
                        <Delete class="w-4 h-4" />
                        <span>Delete</span>
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

    <!-- Add New Trigger Section -->
    <div
      class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
             border-color: {colors.primary}30;"
    >
      <div class="flex items-center gap-3 mb-6">
        <div
          class="p-3 rounded-xl"
          style="background: linear-gradient(135deg, {colors.primary}20, {colors.secondary}20);
                 color: {colors.primary};"
        >
          <Plus class="w-6 h-6" />
        </div>
        <h2 class="text-xl font-bold" style="color: {colors.text}">Add New Trigger</h2>
      </div>

      <div class="space-y-4">
        <!-- Trigger Input -->
        <div>
          <div class="flex items-center gap-2 mb-2">
            <Command class="w-4 h-4" style="color: {colors.primary}" />
            <label class="font-medium" for="trigger-pattern" style="color: {colors.text}">
              Trigger Pattern
            </label>
          </div>
          <input
            id="trigger-pattern"
            bind:value={newTrigger.trigger}
            class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
            class:border-red-500={newTrigger.isRegex && !newTrigger.isValidRegex}
            style="border-color: {colors.primary}30;
                   color: {colors.text};
                   background: {colors.primary}10;"
            placeholder="Enter trigger text or pattern"
            on:input={handleNewTriggerRegexChange}
            aria-invalid={newTrigger.isRegex && !newTrigger.isValidRegex}
          />
          {#if newTrigger.isRegex && !newTrigger.isValidRegex}
            <p class="mt-1 flex items-center gap-2" style="color: {colors.accent}">
              <AlertTriangle class="w-4 h-4" />
              <span>Invalid regex syntax</span>
            </p>
          {/if}
        </div>

        <!-- Response Input -->
        <div>
          <div class="flex items-center gap-2 mb-2">
            <MessageCircle class="w-4 h-4" style="color: {colors.secondary}" />
            <label class="font-medium" for="response-message" style="color: {colors.text}">
              Response Message
            </label>
          </div>
          <input
            id="response-message"
            bind:value={newTrigger.response}
            class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
            style="border-color: {colors.secondary}30;
                   color: {colors.text};
                   background: {colors.primary}10;"
            placeholder="Enter response message"
          />
        </div>

        <!-- Trigger Type -->
        <div>
          <div class="flex items-center gap-2 mb-2">
            <ToggleRight class="w-4 h-4" style="color: {colors.accent}" />
            <label class="font-medium" for="trigger-type" style="color: {colors.text}">
              Trigger Type
            </label>
          </div>
          <div class="relative">
            <select
              id="trigger-type"
              bind:value={newTrigger.isRegex}
              class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200 appearance-none"
              style="border-color: {colors.accent}30;
                     color: {colors.text};
                     background: {colors.primary}10;"
              on:change={handleNewTriggerRegexChange}
            >
              <option value={false}>Normal Trigger</option>
              <option value={true}>Regular Expression</option>
            </select>
            <ChevronDown
              class="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style="color: {colors.muted}"
            />
          </div>
        </div>

        <!-- Regex Test Area -->
        {#if newTrigger.isRegex && newTrigger.isValidRegex}
          <div>
            <div class="flex items-center gap-2 mb-2">
              <Sparkles class="w-4 h-4" style="color: {colors.accent}" />
              <label for="test-regex-pattern-2" class="font-medium" style="color: {colors.text}">
                Test Regex Pattern
              </label>
            </div>
            <input
              id="test-regex-pattern-2"
              class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
              style="border-color: {colors.accent}30;
                     color: {colors.text};
                     background: {colors.primary}10;"
              bind:value={newTriggerRegexTestString}
              placeholder="Enter text to test your regex pattern"
              on:input={testNewTriggerRegex}
            />
            {#if newTriggerRegexTestResult}
              <p
                class="mt-2 flex items-center gap-2"
                style="color: {newTriggerRegexTestResult !== 'No matches' ? colors.primary : colors.accent}"
              >
                <svelte:component
                  this={newTriggerRegexTestResult !== 'No matches' ? Check : X}
                  class="w-4 h-4"
                />
                <span>{newTriggerRegexTestResult}</span>
              </p>
              {#if newTriggerRegexHighlightedString}
                <div
                  class="mt-2 p-3 rounded-lg"
                  style="background: {colors.primary}10;"
                >
                  {@html newTriggerRegexHighlightedString}
                </div>
              {/if}
            {/if}
          </div>
        {/if}

        <!-- Add Button -->
        <div class="flex justify-end mt-6">
          <button
            class="px-6 py-3 rounded-lg font-medium transition-all duration-200"
            style="background: linear-gradient(to right, {colors.primary}, {colors.secondary});
                   color: {colors.text};
                   hover:opacity: 0.9;"
            on:click={addTrigger}
          >
            <div class="flex items-center gap-2">
              <Plus class="w-5 h-5" />
              <span>Add Trigger</span>
            </div>
          </button>
        </div>
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
</style>