<!-- FullscreenEmbedBuilder.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import Portal from "$lib/components/ui/Portal.svelte";
  import PreviewCard from "./PreviewCard.svelte";
  import EmbedEditor from "./EmbedEditor.svelte";
  import ComponentEditor from "./ComponentEditor.svelte";
  import ValidationCard from "./ValidationCard.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import { fade, slide } from "svelte/transition";
  import { chatTriggersApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger.ts";
  import type { DiscordUser } from "$lib/types/discord";

  interface Props {
    // Bound value - the JSON output
    value?: any;
    // Preview settings
    previewTitle?: string;
    previewDescription?: string;
    // Customization options
    allowMultipleEmbeds?: boolean;
    maxEmbeds?: number;
    allowComponents?: boolean;
    allowContent?: boolean;
    // Placeholders
    placeholders?: Placeholder[];
    additionalPlaceholders?: Placeholder[];
    // Restrictions
    restrictedFields?: string[]; // Fields to hide in embed editor
    restrictedComponentTypes?: string[]; // Component types to restrict
    // Appearance
    placeholder?: string; // Placeholder text when empty
    icon?: string; // Icon to show in preview
    // Guild/User context
    guildId?: string | bigint;
    user?: DiscordUser;
    // Events
    onchange?: (value: any) => void;
    onclose?: () => void;
  }

  interface Placeholder {
    category: string;
    name: string;
    description: string;
  }

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
    rowIndex: number;
    displayName: string;
    style: number;
    url: string;
    emoji: string;
    isSelect: boolean;
    maxOptions: number;
    minOptions: number;
    options: NewEmbedSelectOption[];
  }

  interface ComponentRow {
    componentKey: string;
    rowKey: string;
    components: NewEmbedComponent[];
  }

  interface ChatTrigger {
    id: number;
    trigger: string | null;
    response: string | null;
  }

  let {
    value = $bindable({}),
    previewTitle = "Embed Builder",
    previewDescription = "Click to edit",
    allowMultipleEmbeds = true,
    maxEmbeds = 10,
    allowComponents = true,
    allowContent = true,
    placeholders = [],
    additionalPlaceholders = [],
    restrictedFields = [],
    restrictedComponentTypes = [],
    placeholder = "Click to create an embed",
    icon = "fa-layer-group",
    guildId = null,
    user = null,
    onchange,
    onclose
  }: Props = $props();

  // State
  let isOpen = $state(false);
  let activeTab = $state("editor");
  let embeds: Embed[] = $state([]);
  let content = $state("");
  let componentRows: ComponentRow[] = $state([]);
  let chatTriggers: ChatTrigger[] = $state([]);
  let validationErrors: any[] = $state([]);
  let validationWarnings: any[] = $state([]);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let showMobilePreview = $state(false);
  let hasInitialized = $state(false);
  let editingComponentKey = $state<string | null>(null);

  // Default placeholders - comprehensive list from backend ReplacementBuilder
  const defaultPlaceholders: Placeholder[] = [
    // User placeholders
    { category: "User", name: "%user%", description: "User mention" },
    { category: "User", name: "%user.mention%", description: "Mention the user" },
    { category: "User", name: "%user.id%", description: "User ID" },
    { category: "User", name: "%user.name%", description: "Username" },
    { category: "User", name: "%user.fullname%", description: "Full username" },
    { category: "User", name: "%user.avatar%", description: "User's avatar URL" },
    { category: "User", name: "%user.banner%", description: "User's banner URL" },
    { category: "User", name: "%user.created_time%", description: "Account creation time (HH:mm)" },
    { category: "User", name: "%user.created_date%", description: "Account creation date (dd.MM.yyyy)" },
    { category: "User", name: "%user.joined_time%", description: "Server join time (HH:mm)" },
    { category: "User", name: "%user.joined_date%", description: "Server join date (dd.MM.yyyy)" },

    // Server placeholders
    { category: "Server", name: "%server%", description: "Server name" },
    { category: "Server", name: "%server.name%", description: "Server name" },
    { category: "Server", name: "%server.id%", description: "Server ID" },
    { category: "Server", name: "%server.icon%", description: "Server icon URL" },
    { category: "Server", name: "%server.banner%", description: "Server banner URL" },
    { category: "Server", name: "%server.members%", description: "Total member count" },
    { category: "Server", name: "%server.members.online%", description: "Online members count" },
    { category: "Server", name: "%server.members.offline%", description: "Offline members count" },
    { category: "Server", name: "%server.members.dnd%", description: "Do Not Disturb members count" },
    { category: "Server", name: "%server.members.idle%", description: "Idle members count" },
    { category: "Server", name: "%server.boostlevel%", description: "Server boost level" },
    { category: "Server", name: "%server.boostcount%", description: "Server boost count" },
    { category: "Server", name: "%server.time%", description: "Current server time with timezone" },
    { category: "Server", name: "%server.timestamp.longdatetime%", description: "Discord long date/time timestamp" },
    { category: "Server", name: "%server.timestamp.longtime%", description: "Discord long time timestamp" },
    { category: "Server", name: "%server.timestamp.longdate%", description: "Discord long date timestamp" },
    { category: "Server", name: "%server.timestamp.shortdatetime%", description: "Discord short date/time timestamp" },

    // Channel placeholders
    { category: "Channel", name: "%channel%", description: "Channel mention" },
    { category: "Channel", name: "%channel.mention%", description: "Channel mention" },
    { category: "Channel", name: "%channel.name%", description: "Channel name" },
    { category: "Channel", name: "%channel.id%", description: "Channel ID" },
    { category: "Channel", name: "%channel.created%", description: "Channel creation date/time" },
    { category: "Channel", name: "%channel.nsfw%", description: "Whether channel is NSFW" },
    { category: "Channel", name: "%channel.topic%", description: "Channel topic" },

    // Bot placeholders
    { category: "Bot", name: "%bot.status%", description: "Bot's current status" },
    { category: "Bot", name: "%bot.latency%", description: "Bot's latency in ms" },
    { category: "Bot", name: "%bot.name%", description: "Bot's username" },
    { category: "Bot", name: "%bot.fullname%", description: "Bot's full username" },
    { category: "Bot", name: "%bot.id%", description: "Bot's user ID" },
    { category: "Bot", name: "%bot.avatar%", description: "Bot's avatar URL" },
    { category: "Bot", name: "%bot.time%", description: "Current time with timezone" },

    // Shard/Stats placeholders
    { category: "Stats", name: "%shard.servercount%", description: "Number of servers on this shard" },
    { category: "Stats", name: "%shard.usercount%", description: "Number of users on this shard" },

    // Time/Date placeholders
    { category: "Time", name: "%time.month%", description: "Current month name" },
    { category: "Time", name: "%time.day%", description: "Current day name" },
    { category: "Time", name: "%time.year%", description: "Current year" },

    // Random placeholders
    { category: "Random", name: "%rng%", description: "Random number (0-10)" },
    { category: "Random", name: "%rng(1,100)%", description: "Random number between specified range" },
    { category: "Random", name: "%choose(a|b|c)%", description: "Choose randomly from pipe-separated options" },
    { category: "Random", name: "%target%", description: "Text after the trigger" },
    { category: "Random", name: "%img:query%", description: "Imgur search for 'query'" },

    // GIF placeholders (nekos.best API)
    { category: "GIFs", name: "%bakagif%", description: "Random baka reaction GIF" },
    { category: "GIFs", name: "%bitegif%", description: "Random bite reaction GIF" },
    { category: "GIFs", name: "%blushgif%", description: "Random blush reaction GIF" },
    { category: "GIFs", name: "%boredgif%", description: "Random bored reaction GIF" },
    { category: "GIFs", name: "%crygif%", description: "Random cry reaction GIF" },
    { category: "GIFs", name: "%cuddlegif%", description: "Random cuddle reaction GIF" },
    { category: "GIFs", name: "%dancegif%", description: "Random dance reaction GIF" },
    { category: "GIFs", name: "%facepalmgif%", description: "Random facepalm reaction GIF" },
    { category: "GIFs", name: "%feedgif%", description: "Random feed reaction GIF" },
    { category: "GIFs", name: "%handholdgif%", description: "Random handhold reaction GIF" },
    { category: "GIFs", name: "%happygif%", description: "Random happy reaction GIF" },
    { category: "GIFs", name: "%highfivegif%", description: "Random highfive reaction GIF" },
    { category: "GIFs", name: "%huggif%", description: "Random hug reaction GIF" },
    { category: "GIFs", name: "%kickgif%", description: "Random kick reaction GIF" },
    { category: "GIFs", name: "%kissgif%", description: "Random kiss reaction GIF" },
    { category: "GIFs", name: "%laughgif%", description: "Random laugh reaction GIF" },
    { category: "GIFs", name: "%patgif%", description: "Random pat reaction GIF" },
    { category: "GIFs", name: "%pokegif%", description: "Random poke reaction GIF" },
    { category: "GIFs", name: "%poutgif%", description: "Random pout reaction GIF" },
    { category: "GIFs", name: "%punchgif%", description: "Random punch reaction GIF" },
    { category: "GIFs", name: "%shootgif%", description: "Random shoot reaction GIF" },
    { category: "GIFs", name: "%shruggif%", description: "Random shrug reaction GIF" },
    { category: "GIFs", name: "%slapgif%", description: "Random slap reaction GIF" },
    { category: "GIFs", name: "%sleepgif%", description: "Random sleep reaction GIF" },
    { category: "GIFs", name: "%smilegif%", description: "Random smile reaction GIF" },
    { category: "GIFs", name: "%smuggif%", description: "Random smug reaction GIF" },
    { category: "GIFs", name: "%staregif%", description: "Random stare reaction GIF" },
    { category: "GIFs", name: "%thinkgif%", description: "Random think reaction GIF" },
    { category: "GIFs", name: "%thumbsupgif%", description: "Random thumbsup reaction GIF" },
    { category: "GIFs", name: "%ticklegif%", description: "Random tickle reaction GIF" },
    { category: "GIFs", name: "%wavegif%", description: "Random wave reaction GIF" },
    { category: "GIFs", name: "%winkgif%", description: "Random wink reaction GIF" }
  ];

  // Combine all placeholders and filter duplicates by name
  let allPlaceholders = $derived((() => {
    const combined = [
      ...defaultPlaceholders,
      ...placeholders,
      ...additionalPlaceholders
    ];

    // Deduplicate by placeholder name (case-insensitive)
    const seen = new Map<string, Placeholder>();
    combined.forEach(placeholder => {
      const key = placeholder.name.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, placeholder);
      }
    });

    return Array.from(seen.values());
  })());

  // Initialize from value
  $effect(() => {
    // Parse content
    content = value?.content || "";

    // Parse embeds
    if (value?.embeds && Array.isArray(value.embeds) && value.embeds.length > 0) {
      embeds = value.embeds.map(e => ({
        title: e.title || "",
        description: e.description || "",
        color: e.color || "#5865F2",
        url: e.url || "",
        author: e.author || { name: "", url: "", icon_url: "" },
        thumbnail: e.thumbnail || { url: "" },
        image: e.image || { url: "" },
        footer: e.footer || { text: "", icon_url: "" },
        fields: e.fields || []
      }));
      hasInitialized = true;
    } else if (value === "" || value === null || value === undefined) {
      // Completely empty - don't auto-create embeds
      embeds = [];
    } else if (!hasInitialized) {
      // First time initialization with empty object - create one embed for editing
      embeds = [{
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
      hasInitialized = true;
    }

    // Parse components
    if (value?.components && Array.isArray(value.components)) {
      // Group components by row
      const rowsMap = new Map<number, NewEmbedComponent[]>();
      value.components.forEach((comp: any) => {
        const rowIndex = comp.row || 0;
        if (!rowsMap.has(rowIndex)) {
          rowsMap.set(rowIndex, []);
        }
        rowsMap.get(rowIndex)!.push({
          componentKey: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          id: comp.id || null,
          rowIndex,
          displayName: comp.displayName || "",
          style: comp.style || 1,
          url: comp.url || "",
          emoji: comp.emoji || "",
          isSelect: comp.isSelect || false,
          maxOptions: comp.maxOptions || 1,
          minOptions: comp.minOptions || 1,
          options: comp.options || []
        });
      });

      // Convert to ComponentRow array
      componentRows = Array.from(rowsMap.entries()).map(([rowIndex, components]) => ({
        componentKey: `row-${rowIndex}-${Date.now()}`,
        rowKey: `row-${rowIndex}-${Date.now()}`,
        components
      }));
    } else {
      componentRows = [];
    }
  });

  // Load chat triggers
  async function loadChatTriggers() {
    if (!guildId) return;
    try {
      const guildIdBigInt = typeof guildId === "string" ? BigInt(guildId) : guildId;
      chatTriggers = await chatTriggersApi.getChatTriggers(guildIdBigInt);
    } catch (error) {
      logger.error("Failed to load chat triggers:", error);
    }
  }

  // Open/Close handlers
  function open() {
    isOpen = true;
    loadChatTriggers();
    validateEmbeds();
    validateComponents();
    // Prevent body scrolling
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  }

  function close() {
    isOpen = false;
    onclose?.();
    // Restore body scrolling
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  }

  function save() {
    const outputData = cleanOutput();
    value = outputData;
    onchange?.(outputData);
    showNotificationMessage("Saved successfully!");
    close();
  }

  // Clean output for export
  function cleanOutput() {
    const cleanedEmbeds = embeds
      .map(cleanEmbed)
      .filter(cleaned => Object.keys(cleaned).length > 0); // Filter AFTER cleaning to remove truly empty embeds

    const exportData: any = {};

    // Only include content if allowed and not empty
    if (allowContent && content.trim()) {
      exportData.content = content.trim();
    }

    // Only include embeds if there are any
    if (cleanedEmbeds.length > 0) {
      exportData.embeds = cleanedEmbeds;
    }

    // Clean and flatten components if allowed
    if (allowComponents && componentRows.length > 0) {
      const cleanedComponents: any[] = [];
      componentRows.forEach(row => {
        row.components.forEach(component => {
          cleanedComponents.push(cleanComponent(component));
        });
      });

      if (cleanedComponents.length > 0) {
        exportData.components = cleanedComponents;
      }
    }

    // If nothing was added, return empty string instead of empty object
    if (Object.keys(exportData).length === 0) {
      return "";
    }

    return exportData;
  }

  function cleanEmbed(embed: Embed) {
    const cleaned: any = {};

    if (embed.title?.trim()) cleaned.title = embed.title;
    if (embed.description?.trim()) cleaned.description = embed.description;
    if (embed.color) cleaned.color = embed.color;
    if (embed.url?.trim()) cleaned.url = embed.url;

    if (embed.author?.name?.trim() || embed.author?.url?.trim() || embed.author?.icon_url?.trim()) {
      cleaned.author = {};
      if (embed.author.name?.trim()) cleaned.author.name = embed.author.name;
      if (embed.author.url?.trim()) cleaned.author.url = embed.author.url;
      if (embed.author.icon_url?.trim()) cleaned.author.icon_url = embed.author.icon_url;
    }

    if (embed.footer?.text?.trim() || embed.footer?.icon_url?.trim()) {
      cleaned.footer = {};
      if (embed.footer.text?.trim()) cleaned.footer.text = embed.footer.text;
      if (embed.footer.icon_url?.trim()) cleaned.footer.icon_url = embed.footer.icon_url;
    }

    if (embed.thumbnail?.url?.trim()) {
      cleaned.thumbnail = { url: embed.thumbnail.url };
    }
    if (embed.image?.url?.trim()) {
      cleaned.image = { url: embed.image.url };
    }

    if (embed.fields?.length > 0) {
      cleaned.fields = embed.fields;
    }

    return cleaned;
  }

  function cleanComponent(component: NewEmbedComponent) {
    const cleaned: any = {
      row: component.rowIndex,
      displayName: component.displayName,
      style: component.style,
      isSelect: component.isSelect
    };

    if (component.id) {
      cleaned.id = component.id;
    }

    if (component.style === 5 && component.url?.trim()) {
      cleaned.url = component.url;
    }

    if (component.emoji?.trim()) {
      cleaned.emoji = component.emoji;
    }

    if (component.isSelect) {
      cleaned.minOptions = component.minOptions;
      cleaned.maxOptions = component.maxOptions;

      if (component.options?.length > 0) {
        cleaned.options = component.options.map(opt => {
          const cleanedOpt: any = {
            name: opt.name
          };

          if (opt.id) cleanedOpt.id = opt.id;
          if (opt.description?.trim()) cleanedOpt.description = opt.description;
          if (opt.emoji?.trim()) cleanedOpt.emoji = opt.emoji;

          return cleanedOpt;
        });
      }
    }

    return cleaned;
  }

  // Embed management
  function addEmbed() {
    if (embeds.length >= maxEmbeds) return;

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
    if (embeds.length > 1 || !allowMultipleEmbeds) {
      embeds = embeds.filter((_, i) => i !== index);
      showNotificationMessage("Embed removed");
    }
  }

  function clearAllEmbeds() {
    embeds = [];
    showNotificationMessage("All embeds cleared");
  }

  function clearAll() {
    // Clear everything
    content = "";
    embeds = [];
    componentRows = [];

    // Set the bound value to empty string
    value = "";
    onchange?.("");

    showNotificationMessage("Everything cleared");
  }

  function duplicateEmbed(index: number) {
    if (embeds.length >= maxEmbeds) return;

    const duplicated = JSON.parse(JSON.stringify(embeds[index]));
    embeds.splice(index + 1, 0, duplicated);
    embeds = [...embeds];
    showNotificationMessage("Embed duplicated");
  }

  function handleEmbedUpdate(detail: { embed: any; index: number }) {
    const { embed, index } = detail;
    embeds[index] = embed;
    embeds = [...embeds];
    validateEmbeds();
  }

  // Component Row management
  function addRow() {
    if (getTotalComponentCount() >= 25) return;

    const rowKey = `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRow: ComponentRow = {
      componentKey: rowKey,
      rowKey,
      components: []
    };

    componentRows = [...componentRows, newRow];
    showNotificationMessage("New row added");
  }

  function addComponentToRow(rowKey: string, type: "button" | "select") {
    if (restrictedComponentTypes.includes(type)) {
      showNotificationMessage(`${type} components are not allowed`, "error");
      return;
    }

    const rowIndex = componentRows.findIndex(r => r.rowKey === rowKey);
    if (rowIndex === -1) return;

    const row = componentRows[rowIndex];

    if (getTotalComponentCount() >= 25) {
      showNotificationMessage("Maximum 25 components allowed", "error");
      return;
    }

    if (type === "button" && row.components.length >= 5) {
      showNotificationMessage("Maximum 5 buttons per row", "error");
      return;
    }

    if (type === "select" && row.components.length > 0) {
      showNotificationMessage("Select menus must be alone in a row", "error");
      return;
    }

    if (row.components.some(c => c.isSelect)) {
      showNotificationMessage("Cannot add components to a row with a select menu", "error");
      return;
    }

    const componentKey = `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newComponent: NewEmbedComponent = {
      componentKey,
      id: null,
      rowIndex,
      displayName: type === "button" ? "New Button" : "New Select",
      style: type === "button" ? 1 : 0,
      url: "",
      emoji: "",
      isSelect: type === "select",
      maxOptions: 1,
      minOptions: 1,
      options: type === "select" ? [] : []
    };

    row.components = [...row.components, newComponent];
    componentRows = [...componentRows];
    // Automatically open edit mode for the new component
    editingComponentKey = componentKey;
    showNotificationMessage(`${type === "button" ? "Button" : "Select menu"} added`);
  }

  function removeRow(rowKey: string) {
    componentRows = componentRows.filter(r => r.rowKey !== rowKey);

    componentRows = componentRows.map((r, idx) => ({
      ...r,
      components: r.components.map(c => ({
        ...c,
        rowIndex: idx
      }))
    }));

    showNotificationMessage("Row removed");
  }

  function handleComponentUpdate(detail: { component: NewEmbedComponent }) {
    const { component } = detail;

    for (const row of componentRows) {
      const index = row.components.findIndex(c => c.componentKey === component.componentKey);
      if (index !== -1) {
        row.components[index] = component;
        componentRows = [...componentRows];
        validateComponents();
        return;
      }
    }
  }

  function handleComponentRemove(detail: { componentKey: string }) {
    const { componentKey } = detail;

    for (const row of componentRows) {
      const initialLength = row.components.length;
      row.components = row.components.filter(c => c.componentKey !== componentKey);

      if (row.components.length !== initialLength) {
        componentRows = [...componentRows];
        // Clear editing state if we're removing the component being edited
        if (editingComponentKey === componentKey) {
          editingComponentKey = null;
        }
        showNotificationMessage("Component removed");
        return;
      }
    }
  }

  function handleComponentEdit(detail: { component: NewEmbedComponent }) {
    const { component } = detail;
    // Toggle edit mode: if already editing this component, close it; otherwise open it
    if (editingComponentKey === component.componentKey) {
      editingComponentKey = null;
    } else {
      editingComponentKey = component.componentKey;
    }
  }

  function handleComponentDuplicate(detail: { componentKey: string }) {
    const { componentKey } = detail;

    for (const row of componentRows) {
      const componentIndex = row.components.findIndex(c => c.componentKey === componentKey);
      if (componentIndex !== -1) {
        const originalComponent = row.components[componentIndex];
        const newComponent: NewEmbedComponent = {
          ...originalComponent,
          componentKey: `comp_${Date.now()}_${Math.random()}`,
          id: null // Clear ID for duplicated component
        };

        row.components.splice(componentIndex + 1, 0, newComponent);
        componentRows = [...componentRows];
        showNotificationMessage("Component duplicated");
        return;
      }
    }
  }

  function getTotalComponentCount(): number {
    return componentRows.reduce((sum, row) => sum + row.components.length, 0);
  }

  // Validation
  function validateEmbeds() {
    validationErrors = [];
    validationWarnings = [];

    embeds.forEach((embed, index) => {
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
    validationErrors = validationErrors.filter(err => !err.id.startsWith("component-"));

    componentRows.forEach(row => {
      row.components.forEach((component, index) => {
        if (!component.isSelect && component.style !== 5 && !component.id) {
          validationErrors.push({
            id: `component-${component.componentKey}-trigger`,
            message: `${component.isSelect ? "Select menu" : "Button"} "${component.displayName}" needs a trigger`,
            field: `components[${index}]`
          });
        }

        if (component.isSelect) {
          component.options.forEach((option, optIndex) => {
            if (!option.id) {
              validationErrors.push({
                id: `component-${component.componentKey}-option-${optIndex}-trigger`,
                message: `Option "${option.name}" needs a trigger`,
                field: `components[${index}].options[${optIndex}]`
              });
            }
          });
        }
      });
    });
  }

  // Notification helper
  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  // Check if has content
  let hasContent = $derived(
    (allowContent && content.trim()) ||
    embeds.some(e => e.title || e.description || e.fields?.length > 0) ||
    (allowComponents && componentRows.some(row => row.components && row.components.length > 0))
  );

  // Mobile detection
  let isMobile = $derived.by(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });
</script>

<!-- Preview (clickable) -->
<button
  class="w-full text-left rounded-xl border transition-all hover:shadow-lg hover:scale-[1.01] cursor-pointer p-4"
  onclick={open}
  style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
  type="button"
>
  <div class="flex items-start gap-4">
    <div class="flex-shrink-0 mt-1">
      <i class="fa-solid {icon}" style="color: {$colorStore.primary}; font-size: 24px;"></i>
    </div>

    <div class="flex-1 min-w-0">
      <h3 class="text-base font-semibold mb-1" style="color: {$colorStore.text};">
        {previewTitle}
      </h3>
      <p class="text-sm mb-3" style="color: {$colorStore.muted};">
        {previewDescription}
      </p>

      {#if hasContent}
        <!-- Mini preview using PreviewCard -->
        <div class="max-h-[200px] overflow-hidden rounded-lg border" style="border-color: {$colorStore.primary}20;">
          <div class="scale-75 origin-top-left" style="width: 133.33%;">
            <PreviewCard
              {content}
              {embeds}
              {componentRows}
              {user}
              {guildId}
              showEmpty={false}
            />
          </div>
        </div>
      {:else}
        <div class="text-center py-8 rounded-lg"
             style="background: {$colorStore.primary}03; border: 1px dashed {$colorStore.primary}20;">
          <p class="text-sm" style="color: {$colorStore.muted};">
            {placeholder}
          </p>
        </div>
      {/if}
    </div>

    <div class="flex-shrink-0">
      <i class="fa-solid fa-chevron-right" style="color: {$colorStore.muted}; font-size: 16px;"></i>
    </div>
  </div>
</button>

<!-- Fullscreen Editor Modal -->
{#if isOpen}
  <Portal>
    <div class="fixed inset-0 z-[9999] flex flex-col" transition:fade={{ duration: 200 }}>
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onclick={close}
      ></div>

      <!-- Modal Content -->
      <div
        class="relative flex-1 flex flex-col m-0 md:m-4 rounded-none md:rounded-2xl overflow-hidden"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}98, {$colorStore.gradientMid}99);"
        transition:slide={{ duration: 300 }}
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-4 md:px-6 py-4 border-b"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;"
        >
          <div>
            <h2 class="text-lg md:text-xl font-bold" style="color: {$colorStore.text};">
              {previewTitle}
            </h2>
            <p class="text-xs md:text-sm" style="color: {$colorStore.muted};">
              {previewDescription}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02]"
              style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
              onclick={clearAll}
              type="button"
              title="Clear everything"
            >
              <i class="fa-solid fa-eraser"></i>
              <span class="hidden sm:inline ml-1">Clear All</span>
            </button>
            <button
              class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={close}
              type="button"
            >
              Cancel
            </button>
            <button
              class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02]"
              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
              onclick={save}
              type="button"
            >
              Save
            </button>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 overflow-hidden flex flex-col lg:flex-row">
          <!-- Editor Side -->
          <div class="flex-1 overflow-y-auto p-4 md:p-6 lg:w-1/2">
            <!-- Tabs -->
            <div class="flex gap-2 mb-4 flex-wrap">
              {#if allowContent || embeds.length > 0}
                <button
                  class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; {activeTab === 'editor' ? 'filter: brightness(0.9);' : ''}"
                  onclick={() => activeTab = 'editor'}
                  type="button"
                >
                  <i class="fa-solid fa-layer-group mr-2"></i>
                  Embed
                </button>
              {/if}

              {#if allowComponents && !restrictedComponentTypes.includes('all')}
                <button
                  class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; {activeTab === 'components' ? 'filter: brightness(0.9);' : ''}"
                  onclick={() => activeTab = 'components'}
                  type="button"
                >
                  <i class="fa-solid fa-comment mr-2"></i>
                  Components
                </button>
              {/if}
            </div>

            <!-- Tab Content -->
            <div class="space-y-4">
              {#if activeTab === 'editor'}
                <!-- Message Content -->
                {#if allowContent}
                  <div>
                    <label for="message-content" class="block text-sm font-medium mb-2"
                           style="color: {$colorStore.text};">
                      Message Content <span class="text-xs">(optional)</span>
                    </label>
                    <textarea
                      id="message-content"
                      rows="3"
                      class="w-full px-3 py-2 rounded-lg border resize-y"
                      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      placeholder="Optional message content that appears above the embed..."
                      bind:value={content}
                    ></textarea>
                  </div>
                {/if}

                <!-- Embeds -->
                <div class="space-y-4">
                  <div class="flex justify-between items-center flex-wrap gap-2">
                    <h3 class="text-base md:text-lg font-semibold" style="color: {$colorStore.text};">
                      Embeds ({embeds.length}/{maxEmbeds})
                    </h3>
                    <div class="flex gap-2">
                      {#if embeds.length > 1}
                        <button
                          class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02] flex items-center gap-2"
                          style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
                          onclick={clearAllEmbeds}
                          type="button"
                        >
                          <i class="fa-solid fa-eraser"></i>
                          Clear All Embeds
                        </button>
                      {/if}
                      {#if allowMultipleEmbeds}
                        <button
                          class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                          disabled={embeds.length >= maxEmbeds}
                          onclick={addEmbed}
                          type="button"
                        >
                          <i class="fa-solid fa-plus"></i>
                          Add Embed
                        </button>
                      {/if}
                    </div>
                  </div>

                  {#if embeds.length === 0}
                    <div class="text-center py-12 rounded-lg"
                         style="background: {$colorStore.primary}05; border: 1px dashed {$colorStore.primary}20;">
                      <i class="fa-solid fa-layer-group"
                         style="font-size: 48px; opacity: 0.3; display: block; margin: 0 auto 16px; color: {$colorStore.muted};"></i>
                      <h4 class="text-lg font-semibold mb-2" style="color: {$colorStore.text};">No embeds</h4>
                      <p class="text-sm mb-4" style="color: {$colorStore.muted};">
                        Click "Add Embed" to create one
                      </p>
                      <button
                        class="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02] flex items-center gap-2 mx-auto"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                        onclick={addEmbed}
                        type="button"
                      >
                        <i class="fa-solid fa-plus"></i>
                        Add Embed
                      </button>
                    </div>
                  {:else}
                    {#each embeds as embed, index}
                      <EmbedEditor
                        {embed}
                        {index}
                        placeholders={allPlaceholders}
                        onupdate={handleEmbedUpdate}
                        onremove={(detail) => removeEmbed(detail.index)}
                        onduplicate={(detail) => duplicateEmbed(detail.index)}
                      />
                    {/each}
                  {/if}
                </div>

              {:else if activeTab === 'components'}
                <!-- Components Tab -->
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <div>
                      <h3 class="text-base md:text-lg font-semibold" style="color: {$colorStore.text};">
                        Components <span class="text-sm font-normal">({getTotalComponentCount()}/25)</span>
                      </h3>
                      <p class="text-xs md:text-sm" style="color: {$colorStore.muted};">
                        Rows: {componentRows.length}/5 • Max 5 buttons per row
                      </p>
                    </div>

                    <button
                      class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
                      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                      disabled={componentRows.length >= 5 || getTotalComponentCount() >= 25}
                      onclick={addRow}
                      type="button"
                    >
                      <i class="fa-solid fa-plus"></i>
                      Add Row
                    </button>
                  </div>

                  {#if componentRows.length === 0}
                    <div class="text-center py-12">
                      <i class="fa-solid fa-comment"
                         style="font-size: 48px; opacity: 0.3; display: block; margin: 0 auto 16px; color: {$colorStore.muted};"></i>
                      <h4 class="text-lg font-semibold mb-2" style="color: {$colorStore.text};">No components yet</h4>
                      <p class="text-sm mb-4" style="color: {$colorStore.muted};">
                        Click "Add Row" to start adding buttons or select menus
                      </p>
                    </div>
                  {:else}
                    {#each componentRows as row, rowIndex (row.componentKey)}
                      <div class="p-4 border rounded-lg"
                           style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                        <!-- Row Header -->
                        <div class="flex items-center justify-between mb-3">
                          <span class="text-sm font-medium" style="color: {$colorStore.text};">
                            Row {rowIndex + 1} ({row.components.length}
                            component{row.components.length !== 1 ? 's' : ''})
                          </span>
                          <button
                            class="px-2 py-1 text-xs rounded-lg transition-all hover:scale-[1.02] font-medium"
                            style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
                            onclick={() => removeRow(row.rowKey)}
                            type="button"
                          >
                            <i class="fa-solid fa-trash"></i>
                            Remove Row
                          </button>
                        </div>

                        <!-- Row Components -->
                        {#if row.components.length === 0}
                          <div class="text-center py-6">
                            <p class="text-sm mb-3" style="color: {$colorStore.muted};">
                              This row is empty
                            </p>
                            <div class="flex gap-2 justify-center flex-wrap">
                              {#if !restrictedComponentTypes.includes('button')}
                                <button
                                  class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
                                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                                  onclick={() => addComponentToRow(row.rowKey, 'button')}
                                  type="button"
                                >
                                  <i class="fa-solid fa-plus"></i>
                                  Add Button
                                </button>
                              {/if}
                              {#if !restrictedComponentTypes.includes('select')}
                                <button
                                  class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
                                  style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                                  onclick={() => addComponentToRow(row.rowKey, 'select')}
                                  type="button"
                                >
                                  <i class="fa-solid fa-plus"></i>
                                  Add Select
                                </button>
                              {/if}
                            </div>
                          </div>
                        {:else}
                          <div class="space-y-3">
                            {#each row.components as component (component.componentKey)}
                              <ComponentEditor
                                {component}
                                triggers={chatTriggers}
                                isEditing={editingComponentKey === component.componentKey}
                                {user}
                                onupdate={handleComponentUpdate}
                                onremove={handleComponentRemove}
                                onedit={handleComponentEdit}
                                onduplicate={handleComponentDuplicate}
                              />
                            {/each}
                          </div>

                          {#if !row.components.some(c => c.isSelect) && row.components.length < 5 && !restrictedComponentTypes.includes('button')}
                            <div class="flex justify-center pt-3 mt-3 border-t"
                                 style="border-color: {$colorStore.primary}20;">
                              <button
                                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] flex items-center gap-1"
                                style="background: {$colorStore.primary}15; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}25;"
                                onclick={() => addComponentToRow(row.rowKey, 'button')}
                                type="button"
                              >
                                <i class="fa-solid fa-plus"></i>
                                Add Button
                              </button>
                            </div>
                          {/if}
                        {/if}
                      </div>
                    {/each}
                  {/if}
                </div>
              {/if}
            </div>
          </div>

          <!-- Preview Side (Desktop only) -->
          <div class="hidden lg:block lg:w-1/2 border-l overflow-y-auto"
               style="background: {$colorStore.primary}03; border-color: {$colorStore.primary}30;">
            <div class="sticky top-0 p-4 border-b"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30;">
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">Live Preview</h3>
            </div>

            <div class="p-4">
              <!-- Validation -->
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

              <!-- Preview -->
              <PreviewCard
                {content}
                {embeds}
                {componentRows}
                {user}
                {guildId}
                emptyMessage="Your embed preview will appear here"
              />
            </div>
          </div>
        </div>

        <!-- Mobile Floating Preview Button -->
        {#if isMobile && !showMobilePreview}
          <button
            class="fixed bottom-4 right-4 z-[9999] px-4 py-3 rounded-full shadow-lg transition-all hover:scale-[1.05] flex items-center gap-2 backdrop-blur-md"
            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; box-shadow: 0 4px 12px {$colorStore.secondary}40; border: 2px solid {$colorStore.secondary}30;"
            onclick={() => showMobilePreview = true}
            type="button"
          >
            <i class="fa-solid fa-eye"></i>
            <span class="font-medium">Preview</span>
          </button>
        {/if}
      </div>
    </div>

    <!-- Notification -->
    {#if showNotification}
      <div class="fixed top-4 right-4 z-[10000]" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}

    <!-- Mobile Preview Modal -->
    {#if showMobilePreview}
      <div class="fixed inset-0 z-[10001] flex items-center justify-center p-4" transition:fade={{ duration: 200 }}>
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onclick={() => showMobilePreview = false}
        ></div>

        <!-- Preview Modal -->
        <div
          class="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}98, {$colorStore.gradientMid}99);"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-4 py-3 border-b"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;"
          >
            <h3 class="text-lg font-semibold" style="color: {$colorStore.primary};">Preview</h3>
            <button
              class="p-2 rounded-lg transition-all hover:scale-[1.02]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
              onclick={() => showMobilePreview = false}
              type="button"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-4">
            <!-- Validation -->
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

            <!-- Preview -->
            <PreviewCard
              {content}
              {embeds}
              {componentRows}
              {user}
              {guildId}
              emptyMessage="Your embed preview will appear here"
            />
          </div>

          <!-- Footer -->
          <div
            class="px-4 py-3 border-t"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30;"
          >
            <button
              class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={() => showMobilePreview = false}
              type="button"
            >
              <i class="fa-solid fa-arrow-left mr-2"></i>
              Back to Editor
            </button>
          </div>
        </div>
      </div>
    {/if}
  </Portal>
{/if}