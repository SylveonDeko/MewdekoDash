<!-- routes/dashboard/embedbuilder/+page.svelte -->
<script lang="ts">
  import { onMount, tick } from "svelte";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { userAdminGuilds } from "$lib/stores/adminGuildsStore.ts";
  import { api } from "$lib/api.ts";
  import { fade } from "svelte/transition";
  import {
    AlertCircle,
    Copy,
    Eye,
    EyeOff,
    Layout,
    MessageCircle,
    Plus,
    Settings,
    Sparkles,
    Zap
  } from "lucide-svelte";
  import type { DiscordGuild } from "$lib/types/discordGuild.ts";
  import { logger } from "$lib/logger.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { browser } from "$app/environment";
  
  import TemplateGallery from "$lib/components/specialized/TemplateGallery.svelte";
  import EmbedEditor from "$lib/components/specialized/EmbedEditor.svelte";
  import ComponentEditor from "$lib/components/specialized/ComponentEditor.svelte";
  import PlaceholderPicker from "$lib/components/forms/PlaceholderPicker.svelte";
  import ValidationCard from "$lib/components/specialized/ValidationCard.svelte";
  import PreviewCard from "$lib/components/specialized/PreviewCard.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";

  interface Author {
    name: string;
    url: string;
    icon_url: string;
  }

  interface Thumbnail {
    url: string;
  }

  interface Image {
    url: string;
  }

  interface Footer {
    text: string;
    icon_url: string;
  }

  interface Field {
    name: string;
    value: string;
    inline: boolean;
    id: number;
  }

  interface Embed {
    title: string;
    description: string;
    color: string;
    url: string;
    author: Author;
    thumbnail: Thumbnail;
    image: Image;
    footer: Footer;
    fields: Field[];
  }

  interface NewEmbedSelectOption {
    id: string | null;
    name: string;
    emoji: string;
    description: string;
  }

  interface NewEmbedComponent {
    componentKey: string;
    id: string | null;
    displayName: string;
    style: number;
    url: string;
    emoji: string;
    isSelect: boolean;
    maxOptions: number;
    minOptions: number;
    options: NewEmbedSelectOption[];
  }

  interface ChatTrigger {
    id: number;
    trigger: string;
    response: string;
  }

  interface Placeholder {
    category: string;
    name: string;
    description: string;
  }

  // State management
  let embeds: Embed[] = [{
    title: "",
    description: "",
    color: "#5865F2",
    url: "",
    author: { name: "", url: "", icon_url: "" },
    thumbnail: { url: "" },
    image: { url: "" },
    footer: { text: "", icon_url: "" },
    fields: []
  }];

  let content = "";
  let components: NewEmbedComponent[] = [];
  let chatTriggers: ChatTrigger[] = [];

  // Main navigation state
  let activeMainTab = "templates";
  let isSimpleMode = true;

  // UI state
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let jsonCopied = false;

  // Placeholder picker state
  let showPlaceholderPicker = false;
  let placeholderPosition = { x: 0, y: 0 };
  let placeholderSearchTerm = "";
  let currentEditingElement: HTMLInputElement | HTMLTextAreaElement | null = null;
  let currentEditingField: string | null = null;

  // Component editing state
  let editingComponent: NewEmbedComponent | null = null;
  let showTriggerSelect = false;
  let currentTriggerComponent: NewEmbedComponent | null = null;
  let currentEditingOptionIndex: number | null = null;

  // Validation state
  let validationErrors: any[] = [];
  let validationWarnings: any[] = [];

  // Guild handling
  let selectedGuild: any = null;
  $: isLoggedIn = $userAdminGuilds !== null;
  $: hasAdminGuilds = isLoggedIn && $userAdminGuilds.length > 0;

  $: currentGuild.subscribe((guild) => {
    selectedGuild = guild;
    if (guild) {
      loadChatTriggers(guild.id);
    }
  });

  // Main tab configuration for DashboardPageLayout
  const mainTabs = [
    { id: "templates", label: "Templates", icon: Sparkles },
    { id: "editor", label: "Editor", icon: Layout },
    { id: "components", label: "Components", icon: MessageCircle }
  ];


  // Notification helper
  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  // Component initialization  
  onMount(() => {
    validateEmbeds();
    validateComponents();
  });

  // Load chat triggers
  async function loadChatTriggers(guildId: string) {
    try {
      const response = await api.getChatTriggers(guildId);
      if (response.success) {
        chatTriggers = response.data;
      }
    } catch (error) {
      logger.error('Failed to load chat triggers:', error);
    }
  }

  // Template handling
  function handleTemplateSelect(event: CustomEvent) {
    const template = event.detail.template;
    
    // Apply template to first embed
    embeds[0] = { ...template.embed };
    embeds = [...embeds];
    
    // Switch to editor tab
    activeMainTab = "editor";
    showNotificationMessage(`Applied template: ${template.name}`);
  }

  // Embed management
  function addEmbed() {
    const newEmbed: Embed = {
      title: "",
      description: "",
      color: "#5865F2",
      url: "",
      author: { name: "", url: "", icon_url: "" },
      thumbnail: { url: "" },
      image: { url: "" },
      footer: { text: "", icon_url: "" },
      fields: []
    };
    
    embeds = [...embeds, newEmbed];
    showNotificationMessage("New embed added");
  }

  function removeEmbed(index: number) {
    if (embeds.length > 1) {
      embeds = embeds.filter((_, i) => i !== index);
      showNotificationMessage("Embed removed");
    }
  }

  function duplicateEmbed(index: number) {
    const duplicated = JSON.parse(JSON.stringify(embeds[index]));
    embeds.splice(index + 1, 0, duplicated);
    embeds = [...embeds];
    showNotificationMessage("Embed duplicated");
  }

  function handleEmbedUpdate(event: CustomEvent) {
    const { embed, index } = event.detail;
    embeds[index] = embed;
    embeds = [...embeds];
    validateEmbeds();
  }

  // Component management
  function addComponent(type: "button" | "select") {
    const componentKey = `component-${Date.now()}`;
    
    const newComponent: NewEmbedComponent = {
      componentKey,
      id: null,
      displayName: type === "button" ? "New Button" : "New Select",
      style: type === "button" ? 1 : 0,
      url: "",
      emoji: "",
      isSelect: type === "select",
      maxOptions: 1,
      minOptions: 1,
      options: type === "select" ? [] : []
    };
    
    components = [...components, newComponent];
    showNotificationMessage(`${type === "button" ? "Button" : "Select menu"} added`);
  }

  function handleComponentUpdate(event: CustomEvent) {
    const { component } = event.detail;
    const index = components.findIndex(c => c.componentKey === component.componentKey);
    if (index !== -1) {
      components[index] = component;
      components = [...components];
      validateComponents();
    }
  }

  function handleComponentRemove(event: CustomEvent) {
    const { componentKey } = event.detail;
    components = components.filter(c => c.componentKey !== componentKey);
    showNotificationMessage("Component removed");
  }

  function handleComponentEdit(event: CustomEvent) {
    const { component } = event.detail;
    editingComponent = JSON.parse(JSON.stringify(component));
  }

  function handleTriggerSelect(event: CustomEvent) {
    const { component, optionIndex } = event.detail;
    currentTriggerComponent = component;
    currentEditingOptionIndex = optionIndex ?? null;
    showTriggerSelect = true;
  }

  function selectTrigger(trigger: ChatTrigger) {
    if (currentTriggerComponent) {
      if (currentTriggerComponent.isSelect && currentEditingOptionIndex !== null) {
        currentTriggerComponent.options[currentEditingOptionIndex].id = trigger.id.toString();
      } else {
        currentTriggerComponent.id = trigger.id.toString();
      }
      
      // Update the component in the array
      const index = components.findIndex(c => c.componentKey === currentTriggerComponent.componentKey);
      if (index !== -1) {
        components[index] = currentTriggerComponent;
        components = [...components];
      }
      
      // Update editing component if it matches
      if (editingComponent?.componentKey === currentTriggerComponent.componentKey) {
        editingComponent = { ...currentTriggerComponent };
      }
    }
    
    showTriggerSelect = false;
    currentEditingOptionIndex = null;
    showNotificationMessage("Trigger selected successfully");
  }

  // Placeholder handling
  function showPlaceholderMenu(element: HTMLInputElement | HTMLTextAreaElement, field: string) {
    currentEditingElement = element;
    currentEditingField = field;
    
    const rect = element.getBoundingClientRect();
    placeholderPosition = {
      x: rect.left,
      y: rect.bottom + 8
    };
    
    showPlaceholderPicker = true;
  }

  function showPlaceholderFromButton(buttonElement: HTMLButtonElement, field: string) {
    const inputElement = buttonElement.previousElementSibling as HTMLInputElement | HTMLTextAreaElement;
    if (inputElement) {
      currentEditingElement = inputElement;
      currentEditingField = field;
      
      const rect = inputElement.getBoundingClientRect();
      placeholderPosition = {
        x: rect.left,
        y: rect.bottom + 8
      };
      
      showPlaceholderPicker = true;
    }
  }

  function handlePlaceholderSelect(event: CustomEvent) {
    const { placeholder } = event.detail;
    insertPlaceholder(placeholder);
  }

  function insertPlaceholder(placeholder: Placeholder) {
    if (!currentEditingElement) return;

    const start = currentEditingElement.selectionStart || 0;
    const end = currentEditingElement.selectionEnd || 0;
    const text = currentEditingElement.value;
    const newText = text.substring(0, start) + placeholder.name + text.substring(end);

    currentEditingElement.value = newText;
    currentEditingElement.selectionStart = currentEditingElement.selectionEnd = start + placeholder.name.length;

    // Update the corresponding data
    if (currentEditingField) {
      const changeEvent = new Event('input', { bubbles: true });
      currentEditingElement.dispatchEvent(changeEvent);
    }

    showPlaceholderPicker = false;
  }

  // Validation
  function validateEmbeds() {
    validationErrors = [];
    validationWarnings = [];
    
    embeds.forEach((embed, index) => {
      // Check embed limits
      if (embed.title && embed.title.length > 256) {
        validationErrors.push({
          id: `embed-${index}-title`,
          message: `Embed ${index + 1} title exceeds 256 characters`,
          field: `embeds[${index}].title`
        });
      }
      
      if (embed.description && embed.description.length > 4096) {
        validationErrors.push({
          id: `embed-${index}-description`,
          message: `Embed ${index + 1} description exceeds 4096 characters`,
          field: `embeds[${index}].description`
        });
      }
      
      // Warn about empty embeds
      if (!embed.title && !embed.description && embed.fields.length === 0) {
        validationWarnings.push({
          id: `embed-${index}-empty`,
          message: `Embed ${index + 1} is empty`,
          field: `embeds[${index}]`
        });
      }
    });
  }

  function validateComponents() {
    components.forEach((component, index) => {
      if (!component.isSelect && component.style !== 5 && !component.id) {
        validationErrors.push({
          id: `component-${index}-trigger`,
          message: `${component.isSelect ? 'Select menu' : 'Button'} "${component.displayName}" needs a trigger`,
          field: `components[${index}]`
        });
      }
      
      if (component.isSelect) {
        component.options.forEach((option, optIndex) => {
          if (!option.id) {
            validationErrors.push({
              id: `component-${index}-option-${optIndex}-trigger`,
              message: `Option "${option.name}" needs a trigger`,
              field: `components[${index}].options[${optIndex}]`
            });
          }
        });
      }
    });
  }

  // Clean up empty embed properties
  function cleanEmbed(embed: Embed) {
    const cleaned: any = {};
    
    // Only include non-empty string properties
    if (embed.title.trim()) cleaned.title = embed.title;
    if (embed.description.trim()) cleaned.description = embed.description;
    if (embed.color) cleaned.color = embed.color;
    if (embed.url.trim()) cleaned.url = embed.url;
    
    // Only include author if any field is populated
    if (embed.author.name.trim() || embed.author.url.trim() || embed.author.icon_url.trim()) {
      cleaned.author = {};
      if (embed.author.name.trim()) cleaned.author.name = embed.author.name;
      if (embed.author.url.trim()) cleaned.author.url = embed.author.url;
      if (embed.author.icon_url.trim()) cleaned.author.icon_url = embed.author.icon_url;
    }
    
    // Only include footer if any field is populated
    if (embed.footer.text.trim() || embed.footer.icon_url.trim()) {
      cleaned.footer = {};
      if (embed.footer.text.trim()) cleaned.footer.text = embed.footer.text;
      if (embed.footer.icon_url.trim()) cleaned.footer.icon_url = embed.footer.icon_url;
    }
    
    // Only include thumbnail/image if URL is populated
    if (embed.thumbnail.url.trim()) {
      cleaned.thumbnail = { url: embed.thumbnail.url };
    }
    if (embed.image.url.trim()) {
      cleaned.image = { url: embed.image.url };
    }
    
    // Only include fields if there are any
    if (embed.fields.length > 0) {
      cleaned.fields = embed.fields;
    }
    
    return cleaned;
  }

  // JSON export
  async function copyJson() {
    const cleanedEmbeds = embeds
      .filter(embed => embed.title || embed.description || embed.fields.length > 0)
      .map(cleanEmbed);
    
    const exportData: any = {};
    
    // Only include content if it's not empty
    if (content.trim()) {
      exportData.content = content.trim();
    }
    
    // Only include embeds if there are any
    if (cleanedEmbeds.length > 0) {
      exportData.embeds = cleanedEmbeds;
    }
    
    // Only include components if there are any
    if (components.length > 0) {
      exportData.components = components;
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      jsonCopied = true;
      showNotificationMessage("JSON copied to clipboard!");
      setTimeout(() => jsonCopied = false, 2000);
    } catch (error) {
      logger.error('Failed to copy JSON:', error);
      showNotificationMessage("Failed to copy JSON", "error");
    }
  }

  // Can copy validation
  $: canCopyJson = embeds.some(embed => 
    embed.title || embed.description || embed.fields.length > 0
  ) || content.trim().length > 0;

  // Color variables for styling
  $: colorVars = `
    --color-primary: ${$colorStore.primary};
    --color-secondary: ${$colorStore.secondary};
    --color-accent: ${$colorStore.accent};
    --color-text: ${$colorStore.text};
    --color-muted: ${$colorStore.muted};
  `;

  // Complete placeholders data from placeholders page
  const placeholders: Placeholder[] = [
    // AFK placeholders
    { category: "AFK", name: "%afk.message%", description: "The users afk message" },
    { category: "AFK", name: "%afk.user%", description: "The users name and discriminator" },
    { category: "AFK", name: "%afk.user.mention%", description: "The mention of the afk user" },
    { category: "AFK", name: "%afk.user.avatar%", description: "The avatar url of the user" },
    { category: "AFK", name: "%afk.user.id%", description: "The id of the afk user" },
    { category: "AFK", name: "%afk.triggeruser%", description: "The trigger users username and discriminator" },
    { category: "AFK", name: "%afk.triggeruser.avatar%", description: "The trigger users avatar" },
    { category: "AFK", name: "%afk.triggeruser.mention%", description: "The mention of the trigger user" },
    { category: "AFK", name: "%afk.triggeruser.id%", description: "The id of the trigger user" },
    { category: "AFK", name: "%afk.time%", description: "How long the user has been afk" },
    
    // Suggestions placeholders
    { category: "Suggestions", name: "%suggest.user%", description: "The full username of the user who's suggestion got updated" },
    { category: "Suggestions", name: "%suggest.user.id%", description: "The Id of the user who's suggestion got updated" },
    { category: "Suggestions", name: "%suggest.message%", description: "The original suggestion" },
    { category: "Suggestions", name: "%suggest.number%", description: "The suggestion number that was updated" },
    { category: "Suggestions", name: "%suggest.user.name%", description: "The name of the user who's suggestion got updated" },
    { category: "Suggestions", name: "%suggest.user.avatar%", description: "The avatar of the original suggester" },
    { category: "Suggestions", name: "%suggest.mod.user%", description: "The full username of the one who updated the suggestion" },
    { category: "Suggestions", name: "%suggest.mod.avatar%", description: "The pfp of the one who updated the suggestion" },
    { category: "Suggestions", name: "%suggest.mod.name%", description: "The name of the person who updated the suggestion" },
    { category: "Suggestions", name: "%suggest.mod.message%", description: "The reason the suggestion was updated" },
    
    // User placeholders
    { category: "User", name: "%user%", description: "Username of the user" },
    { category: "User", name: "%user.mention%", description: "Mention the user" },
    { category: "User", name: "%user.id%", description: "User ID" },
    { category: "User", name: "%user.avatar%", description: "User's avatar URL" },
    { category: "User", name: "%user.name%", description: "User's display name" },
    { category: "User", name: "%user.nick%", description: "User's nickname in the server" },
    
    // Server placeholders
    { category: "Server", name: "%server%", description: "Server name" },
    { category: "Server", name: "%server.id%", description: "Server ID" },
    { category: "Server", name: "%server.members%", description: "Number of server members" },
    { category: "Server", name: "%server.owner%", description: "Server owner username" },
    { category: "Server", name: "%server.icon%", description: "Server icon URL" },
    
    // Random placeholders
    { category: "Random", name: "%rng%", description: "Random number" },
    { category: "Random", name: "%rng(1,10)%", description: "Random number between 1 and 10" },
    { category: "Random", name: "%choose(a|b|c)%", description: "Choose randomly from options" },
    { category: "Random", name: "%target%", description: "Returns anything the user has written after the trigger" },
    { category: "Random", name: "%img:stuff%", description: "Returns an imgur.com search for 'stuff' (custom reactions only)" }
  ];


  // Tab change handler for DashboardPageLayout
  function handleMainTabChange(event: CustomEvent) {
    activeMainTab = event.detail.tabId;
    
    // Validate when switching tabs
    validateEmbeds();
    validateComponents();
  }

  // Action buttons for DashboardPageLayout
  $: actionButtons = [
    {
      label: isSimpleMode ? "Switch to Advanced" : "Switch to Simple",
      icon: isSimpleMode ? Settings : Zap,
      action: () => {
        isSimpleMode = !isSimpleMode;
        if (isSimpleMode && activeMainTab === 'components') {
          activeMainTab = 'templates';
        }
      },
      style: `background: ${$colorStore.secondary}20; color: ${$colorStore.secondary}; border: 1px solid ${$colorStore.secondary}30;`
    },
    {
      label: jsonCopied ? 'Copied!' : 'Copy JSON',
      icon: Copy,
      action: copyJson,
      disabled: !canCopyJson,
      loading: false,
      style: `background: linear-gradient(to right, ${$colorStore.primary}, ${$colorStore.secondary}); color: ${$colorStore.text};`
    }
  ];

</script>

<DashboardPageLayout 
  title="Discord Embed Builder" 
  subtitle="Create and customize embeds for your Discord server"
  icon={Layout}
  guildName="Embed Builder"
  tabs={isSimpleMode ? mainTabs.filter(t => t.id !== 'components') : mainTabs}
  activeTab={activeMainTab}
  {actionButtons}
  on:tabChange={handleMainTabChange}
>
  <svelte:fragment slot="status-messages">
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}
  </svelte:fragment>

  <!-- Main Content Area -->
  <div class="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6 h-full w-full">
    
    <!-- Editor Side -->
    <section
      class="rounded-2xl border shadow-2xl flex-1"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <!-- Tab Content -->
      <div class="p-6 min-h-[600px]">
        {#if activeMainTab === "templates"}
          <!-- Templates Tab -->
          <div class="space-y-6">
            <div class="text-center mb-6">
              <h2 class="text-xl font-semibold mb-2" style="color: {$colorStore.text};">Choose a Template</h2>
              <p class="text-sm" style="color: {$colorStore.muted};">
                Start with a pre-built template or create from scratch
              </p>
            </div>

            <TemplateGallery 
              on:select={handleTemplateSelect}
            />
            
            <div class="text-center pt-6 border-t" style="border-color: {$colorStore.primary}20;">
              <button
                class="px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
                style="background: {$colorStore.primary}20; 
                       color: {$colorStore.primary};
                       border: 1px solid {$colorStore.primary}30;"
                on:click={() => activeMainTab = "editor"}
              >
                <Layout size={16} />
                Start from Scratch
              </button>
            </div>
          </div>

        {:else if activeMainTab === "editor"}
          <!-- Editor Tab -->
          <div class="space-y-6">
            <!-- Message Content -->
            {#if !isSimpleMode}
              <div>
                <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                  Message Content (optional)
                </label>
                <div class="relative">
                  <textarea
                    rows="3"
                    class="w-full px-3 py-2 pr-10 rounded-lg border resize-y"
                    style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    placeholder="Optional message content that appears above the embed..."
                    bind:value={content}
                  ></textarea>
                  <button
                    class="absolute right-2 top-2 p-1 rounded hover:bg-black/10"
                    style="color: {$colorStore.muted};"
                    on:click={(e) => showPlaceholderFromButton(e.currentTarget, 'content')}
                    title="Insert placeholder"
                  >
                    %
                  </button>
                </div>
                <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                  Click % for placeholders
                </p>
              </div>
            {/if}

            <!-- Embeds List -->
            <div class="space-y-4">
              <div class="flex justify-between items-center z-50">
                <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">
                  Embeds ({embeds.length}/10)
                </h3>
                {#if !isSimpleMode}
                  <button
                    class="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                    style="background: {$colorStore.primary}; color: {$colorStore.text};"
                    disabled={embeds.length >= 10}
                    on:click={addEmbed}
                  >
                    <Plus size={16} />
                    Add Embed
                  </button>
                {/if}
              </div>

              {#each embeds as embed, index}
                <EmbedEditor
                  {embed}
                  {index}
                  {placeholders}
                  on:update={handleEmbedUpdate}
                  on:remove={(e) => removeEmbed(e.detail.index)}
                  on:duplicate={(e) => duplicateEmbed(e.detail.index)}
                  on:showPlaceholders={(e) => showPlaceholderMenu(e.detail.element, e.detail.field)}
                />
              {/each}
            </div>
          </div>

        {:else if activeMainTab === "components"}
          <!-- Components Tab (Advanced Mode Only) -->
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">
                  Message Components ({components.length}/25)
                </h3>
                <p class="text-sm" style="color: {$colorStore.muted};">
                  Add interactive buttons and select menus
                </p>
              </div>
              
              <div class="flex gap-2">
                <button
                  class="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                  style="background: {$colorStore.primary}; color: {$colorStore.text};"
                  disabled={components.length >= 25}
                  on:click={() => addComponent('button')}
                >
                  <Plus size={14} />
                  Button
                </button>
                <button
                  class="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                  style="background: {$colorStore.secondary}; color: {$colorStore.text};"
                  disabled={components.length >= 25}
                  on:click={() => addComponent('select')}
                >
                  <Plus size={14} />
                  Select
                </button>
              </div>
            </div>

            {#if components.length === 0}
              <div class="text-center py-12">
                <MessageCircle size={48} class="mx-auto mb-4 opacity-50" style="color: {$colorStore.muted};" />
                <h4 class="text-lg font-semibold mb-2" style="color: {$colorStore.text};">No components yet</h4>
                <p class="text-sm mb-4" style="color: {$colorStore.muted};">
                  Add buttons or select menus to make your message interactive
                </p>
              </div>
            {:else}
              <div class="space-y-4">
                {#each components as component}
                  <div class="relative group">
                    <!-- Component Preview with Edit Overlay -->
                    <div class="p-4 border rounded-lg" 
                         style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                      
                      <!-- Component Preview -->
                      <div class="flex items-center justify-between mb-3">
                        <span class="text-sm font-medium" style="color: {$colorStore.text};">
                          {component.isSelect ? 'Select Menu' : 'Button'}: {component.displayName}
                        </span>
                        <div class="flex gap-2">
                          <button
                            class="px-3 py-1 text-xs rounded-lg transition-colors"
                            style="background: {$colorStore.primary}; color: {$colorStore.text};"
                            on:click={() => handleComponentEdit({ detail: { component } })}
                          >
                            Edit
                          </button>
                          <button
                            class="px-3 py-1 text-xs rounded-lg transition-colors"
                            style="background: #ED4245; color: white;"
                            on:click={() => handleComponentRemove({ detail: { componentKey: component.componentKey } })}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <ComponentEditor
                        {component}
                        triggers={chatTriggers}
                        isEditing={false}
                        on:update={handleComponentUpdate}
                        on:remove={handleComponentRemove}
                        on:edit={handleComponentEdit}
                        on:selectTrigger={handleTriggerSelect}
                      />
                    </div>

                    <!-- Edit Modal for this component -->
                    {#if editingComponent?.componentKey === component.componentKey}
                      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
                           on:click|self={() => editingComponent = null}>
                        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}30;">
                          <ComponentEditor
                            component={editingComponent}
                            triggers={chatTriggers}
                            isEditing={true}
                            on:update={(e) => {
                              handleComponentUpdate(e);
                              editingComponent = null;
                            }}
                            on:remove={(e) => {
                              handleComponentRemove(e);
                              editingComponent = null;
                            }}
                            on:edit={handleComponentEdit}
                            on:selectTrigger={handleTriggerSelect}
                          />
                          <div class="flex justify-end gap-2 mt-6">
                            <button
                              class="px-4 py-2 rounded-lg"
                              style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                              on:click={() => editingComponent = null}
                            >
                              Cancel
                            </button>
                            <button
                              class="px-4 py-2 rounded-lg"
                              style="background: {$colorStore.primary}; color: {$colorStore.text};"
                              on:click={() => {
                                const index = components.findIndex(c => c.componentKey === editingComponent.componentKey);
                                if (index !== -1) {
                                  components[index] = editingComponent;
                                  components = [...components];
                                }
                                editingComponent = null;
                              }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>

        {/if}
      </div>
    </section>

    <!-- Preview Side (Desktop Only) -->
    <section
      class="hidden lg:block rounded-2xl border shadow-2xl sticky top-4 self-start"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">Live Preview</h3>
        
        <!-- Validation Card -->
        {#if validationErrors.length > 0 || validationWarnings.length > 0}
          <div class="mb-4">
            <ValidationCard 
              errors={validationErrors}
              warnings={validationWarnings}
              title="Issues"
              collapsible={true}
              compact={true}
            />
          </div>
        {/if}
        
        <PreviewCard
          {content}
          {embeds}
          {components}
          emptyMessage="Your embed preview will appear here"
        />
      </div>
    </section>
  </div>
</DashboardPageLayout>

<!-- Placeholder Picker -->
<PlaceholderPicker
  visible={showPlaceholderPicker}
  position={placeholderPosition}
  {placeholders}
  searchTerm={placeholderSearchTerm}
  on:select={handlePlaceholderSelect}
  on:close={() => showPlaceholderPicker = false}
  on:search={(e) => placeholderSearchTerm = e.detail.term}
/>

<!-- Trigger Select Modal -->
{#if showTriggerSelect}
  <div
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
    on:click|self={() => showTriggerSelect = false}
    on:keydown={(e) => e.key === 'Escape' && (showTriggerSelect = false)}
    role="dialog"
    aria-modal="true"
    aria-labelledby="select-trigger-title"
    transition:fade={{ duration: 200 }}
    tabindex="-1"
  >
    <div
      class="rounded-xl p-4 w-80 sm:w-96 mx-auto max-h-[80vh] overflow-y-auto"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}20);
             border: 1px solid {$colorStore.primary}30;"
    >
      <h2 id="select-trigger-title" class="text-lg font-bold mb-4" style="color: {$colorStore.text};">
        Select Trigger
      </h2>

      <div class="space-y-3" role="listbox" aria-label="Available triggers">
        {#if chatTriggers.length === 0}
          <div
            class="p-6 text-center rounded-lg border"
            style="background: {$colorStore.primary}10;
                   border-color: {$colorStore.primary}30;"
          >
            <MessageCircle class="w-12 h-12 mx-auto mb-3" style="color: {$colorStore.muted}" />
            <p class="mb-2" style="color: {$colorStore.text};">No Triggers Available</p>
            <p class="text-sm" style="color: {$colorStore.muted};">
              Create chat triggers to use with your components
            </p>
          </div>
        {:else}
          {#each chatTriggers as trigger}
            <button
              class="w-full text-left p-4 rounded-lg border transition-all duration-200 hover:bg-opacity-20"
              style="background: {$colorStore.primary}10;
                     border-color: {$colorStore.primary}30;
                     color: {$colorStore.text};"
              on:click={() => selectTrigger(trigger)}
              role="option"
              aria-selected="false"
            >
              <div class="font-medium mb-1">{trigger.trigger}</div>
              <div class="text-sm truncate" style="color: {$colorStore.muted};">
                {trigger.response}
              </div>
            </button>
          {/each}
        {/if}
      </div>

      <div class="flex justify-end mt-6">
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all duration-200"
          style="background: {$colorStore.accent}20;
                 color: {$colorStore.accent};"
          on:click={() => showTriggerSelect = false}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Focus styles for accessibility */
  button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* Smooth transitions */
  .transition-all {
    transition: all 0.2s ease;
  }

  /* Custom scrollbar for mobile */
  @media (max-width: 768px) {
    .overflow-x-auto::-webkit-scrollbar {
      height: 4px;
    }
    
    .overflow-x-auto::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .overflow-x-auto::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }
  }
</style>