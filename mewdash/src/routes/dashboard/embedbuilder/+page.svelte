<!-- routes/dashboard/embedbuilder/+page.svelte -->
<script lang="ts">
  import { onMount, tick } from "svelte";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { userAdminGuilds } from "$lib/stores/adminGuildsStore.ts";
  import { api } from "$lib/api.ts";
  import { fade } from "svelte/transition";
  import {
    AlertCircle,
    ChevronDown,
    Component,
    Copy,
    Image as ImageIcon,
    Layers,
    Layout,
    MessageCircle,
    Plus,
    Type,
    X
  } from "lucide-svelte";
  import { marked } from "marked";
  import DOMPurify from "dompurify";
  import type { DiscordGuild } from "$lib/types/discordGuild.ts";
  import { logger } from "$lib/logger.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { browser } from "$app/environment";
  import Notification from "$lib/components/Notification.svelte";

  // Types
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
  let activeTab = "content";
  let currentSection = "embeds";
  let activeEmbedIndex = 0;
  let showPreview = true;
  let isMobile = false;
  let view: "editor" | "preview" | "both" = "both";
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";

  // Component state
  let components: NewEmbedComponent[] = [];
  let editingComponent: NewEmbedComponent | null = null;
  let showAddComponent = false;
  let showTriggerSelect = false;
  let currentTriggerComponent: NewEmbedComponent | null = null;
  let currentEditingOptionIndex: number | null = null;
  let chatTriggers: ChatTrigger[] = [];

  // UI state
  let jsonCopied = false;
  let editingField: string | null = null;
  let showPlaceholderMenu = false;
  let placeholderMenuPosition = { x: 0, y: 0 };
  let selectedPlaceholderIndex = 0;
  let filteredPlaceholders: Placeholder[] = [];
  let placeholderInputRef: HTMLInputElement;
  let fieldIdCounter = 0;
  let currentEditingElement: HTMLInputElement | HTMLTextAreaElement | null = null;
  let dropdownOpen = false;

  // Navigation
  const mainTabs = [
    { id: "embeds", label: "Embeds", icon: Layout },
    { id: "components", label: "Components", icon: Component }
  ];

  const editorTabs = [
    { id: "content", label: "Content", icon: Type },
    { id: "appearance", label: "Appearance", icon: Layers },
    { id: "fields", label: "Fields", icon: Layers },
    { id: "media", label: "Media", icon: ImageIcon }
  ];
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

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  $: colorVars = `
    --color-primary: ${$colorStore.primary};
    --color-secondary: ${$colorStore.secondary};
    --color-accent: ${$colorStore.accent};
    --color-text: ${$colorStore.text};
    --color-muted: ${$colorStore.muted};
  `;

  const placeholders: Placeholder[] = [
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
    {
      category: "Suggest",
      name: "%suggest.user%",
      description: "The full username of the user who's suggestion got updated"
    },
    {
      category: "Suggest",
      name: "%suggest.user.id%",
      description: "The Id of the user who's suggestion got updated"
    },
    { category: "Suggest", name: "%suggest.message%", description: "The original suggestion" },
    { category: "Suggest", name: "%suggest.number%", description: "The suggestion number that was updated" },
    {
      category: "Suggest",
      name: "%suggest.user.name%",
      description: "The name of the user who's suggestion got updated"
    },
    { category: "Suggest", name: "%suggest.user.avatar%", description: "The avatar of the original suggester" },
    {
      category: "Suggest",
      name: "%suggest.mod.user%",
      description: "The full username of the one who updated the suggestion"
    },
    {
      category: "Suggest",
      name: "%suggest.mod.avatar%",
      description: "The pfp of the one who updated the suggestion"
    },
    {
      category: "Suggest",
      name: "%suggest.mod.name%",
      description: "The name of the person who updated the suggestion"
    },
    { category: "Suggest", name: "%suggest.mod.message%", description: "The reason the suggestion was updated" },
    { category: "Suggest", name: "%suggest.mod.Id%", description: "The id of the suggestion updater" },
    { category: "Bot", name: "%bot.status%", description: "Bot's status (Online, Idle, DoNotDisturb, Invisible)" },
    { category: "Bot", name: "%bot.latency%", description: "Bot latency" },
    { category: "Bot", name: "%bot.name%", description: "Bot username" },
    { category: "Bot", name: "%bot.mention%", description: "Bot mention (clickable)" },
    { category: "Bot", name: "%bot.fullname%", description: "Bot username#discriminator" },
    { category: "Bot", name: "%bot.time%", description: "Bot time (usually the time of the server it's hosted on)" },
    { category: "Bot", name: "%bot.discrim%", description: "Bot's discriminator" },
    { category: "Bot", name: "%bot.id%", description: "Bot's user ID" },
    { category: "Bot", name: "%bot.avatar%", description: "Bot's avatar url" },
    { category: "Server", name: "%server.id%", description: "Server ID" },
    { category: "Server", name: "%server.name%", description: "Server name" },
    { category: "Server", name: "%server.members%", description: "Member count" },
    { category: "Server", name: "%server.time%", description: "Server time (requires .timezone to be set)" },
    { category: "Server", name: "%server.icon%", description: "The server's icon" },
    { category: "Server", name: "%server.boostlevel%", description: "The boost level, 1, 2, 3, etc" },
    { category: "Server", name: "%server.boostcount%", description: "How many boosts the server has" },
    { category: "Server", name: "%server.members.online%", description: "Shows the count of online members" },
    { category: "Server", name: "%server.members.offline%", description: "Shows the count of offline members" },
    { category: "Server", name: "%server.members.dnd%", description: "Shows the count of DND members" },
    { category: "Server", name: "%server.members.idle%", description: "Shows the count of idle members" },
    {
      category: "Server",
      name: "%server.timestamp.longdatetime%",
      description: "Shows time like this: Tuesday, 20 April 2021 16:20"
    },
    { category: "Server", name: "%server.timestamp.longtime%", description: "Shows time like this: 16:20:30" },
    {
      category: "Server",
      name: "%server.timestamp.longdate%",
      description: "Shows current date like this: 20 April 2021"
    },
    {
      category: "Server",
      name: "%server.timestamp.shortdatetime%",
      description: "Shows a short current date and time like this: 20 April 2021 16:20"
    },
    { category: "Feed", name: "%url%", description: "Shows the URL of what was posted" },
    { category: "Feed", name: "%author%", description: "Shows the author of what was posted" },
    { category: "Feed", name: "%content%", description: "Shows the description of the post" },
    { category: "Feed", name: "%image_url%", description: "Shows the image of the post, if any" },
    { category: "Feed", name: "%categories%", description: "Shows a comma separated list of the post categories" },
    { category: "Feed", name: "%timestamp%", description: "Shows the timestamp in longdatetime format" },
    { category: "Feed", name: "%feedurl%", description: "Shows the feed url used" },
    { category: "Channel", name: "%channel.mention%", description: "Channel mention (clickable)" },
    { category: "Channel", name: "%channel.name%", description: "Channel name" },
    { category: "Channel", name: "%channel.id%", description: "Channel ID" },
    { category: "Channel", name: "%channel.created%", description: "Channel creation date" },
    {
      category: "Channel",
      name: "%channel.nsfw%",
      description: "Returns either True or False, depending on if the channel is designated as NSFW using discord"
    },
    { category: "Channel", name: "%channel.topic%", description: "Channel topic" },
    { category: "User", name: "%user.mention%", description: "User mention" },
    { category: "User", name: "%user.fullname%", description: "Username#discriminator" },
    { category: "User", name: "%user.name%", description: "Username" },
    { category: "User", name: "%user.discrim%", description: "Discriminator" },
    { category: "User", name: "%user.avatar%", description: "User's avatar url" },
    { category: "User", name: "%user.id%", description: "User ID" },
    { category: "User", name: "%user.created_time%", description: "Account creation time (local time)" },
    { category: "User", name: "%user.created_date%", description: "Account creation date" },
    { category: "User", name: "%user.joined_time%", description: "Account join time (local time)" },
    { category: "User", name: "%user.joined_date%", description: "Account join date" },
    { category: "User", name: "%user.banner%", description: "Gives the url of a user's banner" },
    { category: "Ban", name: "%ban.mod%", description: "Full name of the moderator who performed the ban" },
    { category: "Ban", name: "%ban.mod.fullname%", description: "Full name of the moderator who performed the ban" },
    { category: "Ban", name: "%ban.mod.mention%", description: "Moderator's mention" },
    { category: "Ban", name: "%ban.mod.name%", description: "Name of the moderator - Admin" },
    { category: "Ban", name: "%ban.mod.discrim%", description: "Discriminator of the moderator - 1234" },
    { category: "Ban", name: "%ban.user%", description: "Full name of the banned user" },
    { category: "Ban", name: "%ban.user.fullname%", description: "Full name of the banned user" },
    { category: "Ban", name: "%ban.user.name%", description: "Name of the banned user" },
    { category: "Ban", name: "%ban.user.discrim%", description: "Discriminator of the banned user" },
    { category: "Ban", name: "%ban.reason%", description: "Reason for the ban, if provided" },
    {
      category: "Ban",
      name: "%ban.duration%",
      description: "Duration of the ban in the form Days.Hours:Minutes (6.05:04)"
    },
    { category: "Bot Stats", name: "%servers%", description: "Server count bot has joined" },
    { category: "Bot Stats", name: "%users%", description: "Combined user count on servers the bot has joined" },
    { category: "Shard Stats", name: "%shard.servercount%", description: "Server count on current shard" },
    { category: "Shard Stats", name: "%shard.usercount%", description: "Combined user count on current shard" },
    { category: "Shard Stats", name: "%shard.id%", description: "Shard ID" },
    { category: "Music", name: "%music.queued%", description: "Amount of songs currently queued" },
    { category: "Music", name: "%music.playing%", description: "Current song name" },
    { category: "Miscellaneous", name: "%rngX-Y%", description: "Returns a random number between X and Y" },
    {
      category: "Miscellaneous",
      name: "%target%",
      description: "Returns anything the user has written after the trigger (in a normal chat trigger), or the selected message's content / user's mention (context menu chat triggers)"
    },
    {
      category: "Miscellaneous",
      name: "%img:stuff%",
      description: "Returns an imgur.com search for \"stuff\" (only works on custom reactions)"
    }
  ];

  // Initialization
  onMount(() => {
    checkMobileSize();
    window.addEventListener("resize", checkMobileSize);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("resize", checkMobileSize);
      document.removeEventListener("click", handleClickOutside);
    };
  });

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest(".placeholder-menu") && !target.closest(".editing-field")) {
      showPlaceholderMenu = false;
    }
  }

  function parseMarkdown(text: string): string {
    text = parseEmojis(text);
    text = parseMentions(text);
    let parsedText = marked.parse(text) as string;
    return DOMPurify.sanitize(parsedText);
  }

  function parseMentions(text: string): string {
    const userMentionPattern = /<@!?(\d+)>/g;
    const channelMentionPattern = /<#(\d+)>/g;
    const roleMentionPattern = /<@&(\d+)>/g;

    // Replace user mentions
    text = text.replace(userMentionPattern, "<span class=\"mention user-mention\">@User</span>");
    // Replace channel mentions
    text = text.replace(channelMentionPattern, "<span class=\"mention channel-mention\">#channel</span>");
    // Replace role mentions
    text = text.replace(roleMentionPattern, "<span class=\"mention role-mention\">@Role</span>");

    return text;
  }

  function parseEmojis(text: string): string {
    // Parse custom emojis
    const customEmojiPattern = /<(a?):(.*?):(\d+)>/g;
    text = text.replace(customEmojiPattern, (match, animated, name, id) => {
      const ext = animated ? "gif" : "png";
      return `<img class="inline-emoji" src="https://cdn.discordapp.com/emojis/${id}.${ext}" alt="${name}" title="${name}">`;
    });

    // Parse Unicode emojis
    const unicodeEmojiPattern = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
    text = text.replace(unicodeEmojiPattern, (match) =>
      `<span class="emoji">${match}</span>`
    );

    return text;
  }

  function checkMobileSize() {
    isMobile = browser && window.innerWidth < 768;
    showPreview = !isMobile;
  }

  function closeDropdown() {
    dropdownOpen = false;
  }

  async function selectGuild(guild: DiscordGuild) {
    if ($currentGuild === guild) return;
    currentGuild.set(guild);
    closeDropdown();
  }

  function validateEmbed(embed: Embed): boolean {
    // Check if embed has any fields with missing values
    if (embed.fields.some(field => !field.name.trim() || !field.value.trim())) {
      return false;
    }

    // Check for minimum content
    const hasContent = embed.title.trim() ||
      embed.description.trim() ||
      embed.fields.length > 0 ||
      embed.image.url.trim() ||
      embed.thumbnail.url.trim() ||
      embed.author.name.trim() ||
      embed.footer.text.trim();

    if (!hasContent) {
      return false;
    }

    // Check character limits
    if (embed.title.length > 256 ||
      embed.description.length > 4096 ||
      embed.fields.length > 25 ||
      embed.fields.some(f => f.name.length > 256 || f.value.length > 1024)) {
      return false;
    }

    // Calculate total characters
    const totalChars = embed.title.length +
      embed.description.length +
      embed.fields.reduce((acc, f) => acc + f.name.length + f.value.length, 0);

    return totalChars <= 6000;
  }

  function getValidationErrors(embed: Embed): string[] {
    const errors: string[] = [];

    // Field validation
    embed.fields.forEach((field, index) => {
      if (!field.name.trim()) {
        errors.push(`Field ${index + 1} is missing a name`);
      }
      if (!field.value.trim()) {
        errors.push(`Field ${index + 1} is missing a value`);
      }
    });

    // URL and title validation
    if (embed.url && !embed.title.trim()) {
      errors.push("URL requires a title");
    }

    // Content validation
    const hasContent = embed.title.trim() ||
      embed.description.trim() ||
      embed.fields.length > 0 ||
      embed.image.url.trim() ||
      embed.thumbnail.url.trim() ||
      embed.author.name.trim() ||
      embed.footer.text.trim();

    if (!hasContent) {
      errors.push("Embed must contain at least one piece of content");
    }

    // Character limit validation
    if (embed.title.length > 256) {
      errors.push("Title cannot exceed 256 characters");
    }
    if (embed.description.length > 4096) {
      errors.push("Description cannot exceed 4096 characters");
    }
    if (embed.fields.length > 25) {
      errors.push("Cannot have more than 25 fields");
    }

    embed.fields.forEach((field, index) => {
      if (field.name.length > 256) {
        errors.push(`Field ${index + 1} name cannot exceed 256 characters`);
      }
      if (field.value.length > 1024) {
        errors.push(`Field ${index + 1} value cannot exceed 1024 characters`);
      }
    });

    const totalChars = embed.title.length +
      embed.description.length +
      embed.fields.reduce((acc, f) => acc + f.name.length + f.value.length, 0);

    if (totalChars > 6000) {
      errors.push("Total characters cannot exceed 6000");
    }

    return errors;
  }

  function addEmbed() {
    embeds = [
      ...embeds,
      {
        title: "",
        description: "",
        color: $colorStore.primary,
        url: "",
        author: { name: "", url: "", icon_url: "" },
        thumbnail: { url: "" },
        image: { url: "" },
        footer: { text: "", icon_url: "" },
        fields: []
      }
    ];
    activeEmbedIndex = embeds.length - 1;
  }

  function removeEmbed(index: number) {
    embeds = embeds.filter((_, i) => i !== index);
    if (activeEmbedIndex >= embeds.length) {
      activeEmbedIndex = Math.max(0, embeds.length - 1);
    }
  }

  function updateEmbed(index: number, field: string, value: any) {
    const updatedEmbeds = [...embeds];
    if (field.includes("-")) {
      const [type, subfield] = field.split("-");
      updatedEmbeds[index][type] = { ...updatedEmbeds[index][type], [subfield]: value };
    } else {
      updatedEmbeds[index][field] = value;
    }
    embeds = updatedEmbeds;
  }

  function addField(embedIndex: number) {
    fieldIdCounter++;
    const updatedEmbeds = [...embeds];
    updatedEmbeds[embedIndex].fields = [
      ...updatedEmbeds[embedIndex].fields,
      {
        name: "New Field",
        value: "Field value",
        inline: false,
        id: fieldIdCounter
      }
    ];
    embeds = updatedEmbeds;
  }

  function removeField(embedIndex: number, fieldIndex: number) {
    const updatedEmbeds = [...embeds];
    updatedEmbeds[embedIndex].fields = updatedEmbeds[embedIndex].fields.filter((_, i) => i !== fieldIndex);
    embeds = updatedEmbeds;
  }

  async function handleKeydown(event: KeyboardEvent, embedIndex: number, field: string) {
    if (showPlaceholderMenu) {
      handlePlaceholderNavigation(event);
      return;
    }

    if (event.key === "%") {
      event.preventDefault();
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;

      // Set current editing element first to ensure it's available
      currentEditingElement = target;
      editingField = embedIndex < 0 ? `${embedIndex}-${field}` : `${embedIndex}-${field}`;

      // Calculate position based on the input element
      const rect = target.getBoundingClientRect();
      placeholderMenuPosition = {
        x: Math.min(rect.left, window.innerWidth - 320),
        y: rect.bottom + window.scrollY
      };

      // Initialize placeholder menu state
      filteredPlaceholders = placeholders;
      selectedPlaceholderIndex = 0;
      showPlaceholderMenu = true;

      // Force a DOM update before focusing
      await tick();
      if (placeholderInputRef) {
        placeholderInputRef.focus();
      }
    }
  }

  function handlePlaceholderNavigation(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        selectedPlaceholderIndex = (selectedPlaceholderIndex + 1) % filteredPlaceholders.length;
        break;
      case "ArrowUp":
        event.preventDefault();
        selectedPlaceholderIndex = (selectedPlaceholderIndex - 1 + filteredPlaceholders.length) % filteredPlaceholders.length;
        break;
      case "Enter":
        event.preventDefault();
        if (filteredPlaceholders.length > 0) {
          insertPlaceholder(filteredPlaceholders[selectedPlaceholderIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        showPlaceholderMenu = false;
        break;
    }
  }

  function insertPlaceholder(placeholder: Placeholder) {
    if (!currentEditingElement) return;

    const start = currentEditingElement.selectionStart || 0;
    const end = currentEditingElement.selectionEnd || 0;
    const text = currentEditingElement.value;
    const newText = text.substring(0, start) + placeholder.name + text.substring(end);

    currentEditingElement.value = newText;
    currentEditingElement.selectionStart = currentEditingElement.selectionEnd = start + placeholder.name.length;

    if (editingField) {
      const [embedIndex, field] = editingField.split("-");
      if (embedIndex === "-1") {
        content = newText;
      } else {
        const index = parseInt(embedIndex);
        if (field.startsWith("field-")) {
          const [_, fieldIndex, fieldPart] = field.split("-");
          const updatedEmbed = { ...embeds[index] };
          const fieldIdx = parseInt(fieldIndex);
          if (fieldPart === "name") {
            updatedEmbed.fields[fieldIdx].name = newText;
          } else {
            updatedEmbed.fields[fieldIdx].value = newText;
          }
          embeds[index] = updatedEmbed;
          embeds = [...embeds];
        } else {
          updateEmbed(index, field, newText);
        }
      }
    }

    showPlaceholderMenu = false;
    announce(`Inserted placeholder: ${placeholder.name}`);
  }

  function filterPlaceholders(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    filteredPlaceholders = placeholders.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
    selectedPlaceholderIndex = 0;
  }

  function announce(message: string) {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }

  function getComponentRows(components: NewEmbedComponent[]): NewEmbedComponent[][] {
    const rows: NewEmbedComponent[][] = [];
    let currentRow: NewEmbedComponent[] = [];

    for (const component of components) {
      if (component.isSelect) {
        if (currentRow.length > 0) {
          rows.push([...currentRow]);
          currentRow = [];
        }
        rows.push([component]);
      } else {
        currentRow.push(component);
        if (currentRow.length === 5) {
          rows.push([...currentRow]);
          currentRow = [];
        }
      }
    }

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  }

  $: totalComponents = components.reduce((count, component) => {
    return count + (component.isSelect ? 5 : 1);
  }, 0);

  function generateUniqueId() {
    return "select-" + Math.random().toString(36).substr(2, 9);
  }

  function startEditingComponent(component: NewEmbedComponent) {
    editingComponent = JSON.parse(JSON.stringify(component));
  }

  function removeComponent(componentKey: string) {
    components = components.filter(c => c.componentKey !== componentKey);
  }

  function addComponent(type: "button" | "select") {
    const componentKey = `component-${Date.now()}`;
    if (type === "button") {
      components = [
        ...components,
        {
          componentKey,
          id: null,
          displayName: "New Button",
          style: 1,
          isSelect: false,
          url: "",
          emoji: "",
          maxOptions: 1,
          minOptions: 1,
          options: []
        }
      ];
    } else {
      components = [
        ...components,
        {
          componentKey,
          id: generateUniqueId(),
          displayName: "New Select Menu",
          style: 1,
          isSelect: true,
          url: "",
          emoji: "",
          maxOptions: 1,
          minOptions: 1,
          options: [{ id: null, name: "Option 1", emoji: "", description: "" }]
        }
      ];
    }
    showAddComponent = false;
  }

  async function loadChatTriggers(guildId: bigint) {
    try {
      chatTriggers = await api.getChatTriggers(guildId);
    } catch (error) {
      logger.error("Failed to load chat triggers:", error);
      chatTriggers = [];
    }
  }

  function getButtonColorClass(style: number): string {
    switch (style) {
      case 1: // Primary/Brand
        return `bg-[${$colorStore.primary}] hover:bg-[${$colorStore.primary}CC] text-white`;
      case 2: // Secondary
        return `bg-[${$colorStore.secondary}] hover:bg-[${$colorStore.secondary}CC] text-white`;
      case 3: // Success
        return "bg-[#43B581] hover:bg-[#3CA374] text-white";
      case 4: // Danger
        return `bg-[${$colorStore.accent}] hover:bg-[${$colorStore.accent}CC] text-white`;
      case 5: // Link
        return `bg-transparent hover:bg-[${$colorStore.primary}30] text-[${$colorStore.primary}] hover:text-white`;
      default:
        return `bg-[${$colorStore.primary}] hover:bg-[${$colorStore.primary}CC] text-white`;
    }
  }

  function getButtonStyleName(style: number): string {
    switch (style) {
      case 1:
        return "Primary";
      case 2:
        return "Secondary";
      case 3:
        return "Success";
      case 4:
        return "Danger";
      case 5:
        return "Link";
      default:
        return "Primary";
    }
  }

  function copyJson() {
    const validEmbeds = embeds.filter(validateEmbed);

    let data = {
      content,
      embeds: validEmbeds.length > 0 ? validEmbeds : undefined,
      components: components.length > 0 ? components : undefined
    };

    const strippedData = stripNullOrEmpty(data);
    const json = JSON.stringify(strippedData, null, 2);

    navigator.clipboard.writeText(json).then(() => {
      jsonCopied = true;
      showNotificationMessage("JSON copied to clipboard!", "success");
      setTimeout(() => {
        jsonCopied = false;
      }, 2000);
    });
  }

  function stripNullOrEmpty(obj: any): any {
    if (Array.isArray(obj)) {
      const arr = obj
        .map((item) => stripNullOrEmpty(item))
        .filter((item) => item !== null && item !== undefined && item !== "");
      return arr.length > 0 ? arr : undefined;
    } else if (obj !== null && typeof obj === "object") {
      const newObj: any = {};
      Object.keys(obj).forEach((key) => {
        const value = stripNullOrEmpty(obj[key]);
        if (
          value !== null &&
          value !== undefined &&
          value !== "" &&
          !(typeof value === "object" && Object.keys(value).length === 0)
        ) {
          newObj[key] = value;
        }
      });
      return Object.keys(newObj).length > 0 ? newObj : undefined;
    }
    return obj;
  }

  // Fix for allowing components-only messages
  $: canCopyJson =
    // Allow plaintext-only messages
    content.trim().length > 0 ||
    // Allow component and content messages
    components.length > 0 && content.trim().length > 0 ||
    // Or if there are valid embeds (all embeds must be valid)
    (embeds.length > 0 && embeds.every(validateEmbed));
</script>

<div
  class="w-full max-w-full overflow-hidden"
  style="{colorVars}"
>
  <div
    class="min-h-screen p-2 sm:p-4 md:p-6 overflow-x-hidden overflow-y-auto relative"
    style="background: radial-gradient(circle at top,
      {$colorStore.gradientStart}15 0%,
      {$colorStore.gradientMid}10 50%,
      {$colorStore.gradientEnd}05 100%);"
  >
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}

    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <section
        class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
      >
        <h1 class="text-3xl font-bold" style="color: {$colorStore.text}">Discord Embed Builder</h1>
        <p class="mt-2" style="color: {$colorStore.muted}">Create and customize embeds for your Discord
          server</p>
      </section>

      <!-- Content Section -->
      <section
        class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
      >
        <div class="flex items-center gap-3 mb-4">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);"
          >
            <MessageCircle class="w-6 h-6" style="color: {$colorStore.primary}" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Message Content</h2>
        </div>

        <textarea
          bind:value={content}
          class="w-full rounded-lg p-4 min-h-[100px] transition-all duration-200 focus:outline-none"
          id="content"
          on:keydown={(e) => handleKeydown(e, -1, 'content')}
          placeholder="Type your message content..."
          style="background: {$colorStore.primary}10;
               border: 1px solid {$colorStore.primary}30;
               color: {$colorStore.text};"
        />
      </section>

      <!-- Mobile Navigation -->
      <div class="md:hidden mb-4 space-y-4">
        <div class="flex gap-2">
          {#each mainTabs as tab}
            <button
              class="flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
              on:click={() => currentSection = tab.id}
              on:keydown={(e) => e.key === 'Enter' && (currentSection = tab.id)}
              aria-pressed={currentSection === tab.id}
              style="background: {currentSection === tab.id ? $colorStore.primary : $colorStore.primary + '20'};
                   color: {currentSection === tab.id ? $colorStore.text : $colorStore.muted};"
            >
              <svelte:component this={tab.icon} size={18} />
              {tab.label}
            </button>
          {/each}
        </div>

        <button
          aria-expanded={showPreview}
          class="w-full p-3 rounded-lg flex items-center justify-between transition-all duration-200"
          on:click={() => showPreview = !showPreview}
          on:keydown={(e) => e.key === 'Enter' && (showPreview = !showPreview)}
          style="background: {$colorStore.primary}20;
               color: {$colorStore.text};"
        >
          <span>{showPreview ? 'Show Editor' : 'Show Preview'}</span>
          <div
            class="dropdown-arrow transition-transform"
            class:rotate-180={showPreview}
          >
            <ChevronDown
              aria-hidden="true"
              style="color: {$colorStore.muted}"
            />
          </div>
        </button>
      </div>

      <!-- Main Content -->
      <div class="flex flex-col md:flex-row gap-4 md:gap-6">
        <!-- Editor Section -->
        <section
          class={`w-full ${showPreview ? 'hidden md:block md:w-1/2' : 'block'} backdrop-blur-sm rounded-2xl border shadow-2xl overflow-hidden`}
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
     border-color: {$colorStore.primary}30; max-width: 100%;"
        >
          <!-- Validation Errors Display -->
          {#if currentSection === 'embeds' && embeds[activeEmbedIndex]}
            {@const errors = getValidationErrors(embeds[activeEmbedIndex])}
            {#if errors.length > 0}
              <div
                class="m-4 p-4 rounded-lg border"
                role="alert"
                aria-live="polite"
                style="background: {$colorStore.accent}10;
                     border-color: {$colorStore.accent}30;"
              >
                <div class="flex items-start gap-3">
                  <AlertCircle class="w-5 h-5 mt-0.5" style="color: {$colorStore.accent}" />
                  <div>
                    <h3 class="font-medium mb-2" style="color: {$colorStore.accent}">Validation
                      Errors</h3>
                    <ul class="space-y-1">
                      {#each errors as error}
                        <li class="text-sm" style="color: {$colorStore.accent}80">{error}</li>
                      {/each}
                    </ul>
                  </div>
                </div>
              </div>
            {/if}
          {/if}

          <!-- Editor Content -->
          <div class="p-4">
            <!-- Desktop Navigation -->
            <div class="hidden md:flex gap-4 mb-6">
              {#each mainTabs as tab}
                <button
                  class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
                  on:click={() => currentSection = tab.id}
                  on:keydown={(e) => e.key === 'Enter' && (currentSection = tab.id)}
                  aria-pressed={currentSection === tab.id}
                  style="background: {currentSection === tab.id ? $colorStore.primary : $colorStore.primary + '20'};
                       color: {currentSection === tab.id ? $colorStore.text : $colorStore.muted};"
                >
                  <svelte:component this={tab.icon} size={18} />
                  {tab.label}
                </button>
              {/each}
            </div>

            {#if currentSection === 'embeds'}
              <!-- Add a header with embed controls -->
              <div
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
              >
                <div class="flex items-center gap-3">
                  <h3 class="text-lg font-medium" style="color: {$colorStore.text}">Embeds
                    ({embeds.length}/10)</h3>
                  <button
                    class="px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    on:click={addEmbed}
                    on:keydown={(e) => e.key === 'Enter' && addEmbed()}
                    disabled={embeds.length >= 10}
                    aria-label="Add new embed"
                    style="background: {$colorStore.primary};
                         color: {$colorStore.text};"
                  >
                    <Plus size={16} />
                    Add Embed
                  </button>
                </div>
                {#if embeds.length > 1}
                  <button
                    class="px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all duration-200"
                    on:click={() => removeEmbed(activeEmbedIndex)}
                    on:keydown={(e) => e.key === 'Enter' && removeEmbed(activeEmbedIndex)}
                    aria-label="Remove current embed"
                    style="background: {$colorStore.accent};
                         color: {$colorStore.text};"
                  >
                    <X size={16} />
                    Remove Embed
                  </button>
                {/if}
              </div>

              <!-- Embed Navigation -->
              {#if embeds.length > 1}
                <div
                  class="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar"
                  role="tablist"
                >
                  {#each embeds as _, index}
                    <button
                      class="px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200"
                      on:click={() => activeEmbedIndex = index}
                      on:keydown={(e) => e.key === 'Enter' && (activeEmbedIndex = index)}
                      role="tab"
                      id={`embed-tab-${index}`}
                      aria-controls={`embed-panel-${index}`}
                      aria-selected={activeEmbedIndex === index}
                      tabindex={activeEmbedIndex === index ? 0 : -1}
                      style="background: {activeEmbedIndex === index ? $colorStore.primary : $colorStore.primary + '20'};
                           color: {activeEmbedIndex === index ? $colorStore.text : $colorStore.muted};"
                    >
                      Embed {index + 1}
                    </button>
                  {/each}
                </div>
              {/if}

              <!-- Tab Navigation -->
              <div
                class="flex border-b overflow-x-auto mb-4"
                role="tablist"
                style="border-color: {$colorStore.primary}30;"
              >
                {#each editorTabs as tab}
                  <button
                    class="px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 border-b-2"
                    on:click={() => activeTab = tab.id}
                    on:keydown={(e) => e.key === 'Enter' && (activeTab = tab.id)}
                    role="tab"
                    id={`editor-tab-${tab.id}`}
                    aria-controls={`editor-panel-${tab.id}`}
                    aria-selected={activeTab === tab.id}
                    tabindex={activeTab === tab.id ? 0 : -1}
                    style="color: {activeTab === tab.id ? $colorStore.text : $colorStore.muted};
                         border-color: {activeTab === tab.id ? $colorStore.primary : 'transparent'};"
                  >
                    <svelte:component this={tab.icon} size={16} />
                    {tab.label}
                  </button>
                {/each}
              </div>

              <!-- Tab Content -->
              <div class="space-y-6">
                {#if activeTab === 'content'}
                  <div
                    class="space-y-4"
                    role="tabpanel"
                    id="editor-panel-content"
                    aria-labelledby="editor-tab-content"
                  >
                    <!-- Embed Title -->
                    <div>
                      <label for="embed-title" class="block text-sm font-medium mb-2"
                             style="color: {$colorStore.text}">
                        Embed Title
                      </label>
                      <input
                        id="embed-title"
                        type="text"
                        bind:value={embeds[activeEmbedIndex].title}
                        class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                        style="background: {$colorStore.primary}10;
                             border: 1px solid {$colorStore.primary}30;
                             color: {$colorStore.text};"
                        placeholder="Enter title"
                        on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'title')}
                      />
                      <input
                        id="embed-url"
                        type="text"
                        bind:value={embeds[activeEmbedIndex].url}
                        class="w-full rounded-lg p-3 mt-2 transition-all duration-200 focus:outline-none"
                        style="background: {$colorStore.primary}10;
                             border: 1px solid {$colorStore.primary}30;
                             color: {$colorStore.text};"
                        placeholder="Title URL (optional)"
                        on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'url')}
                        aria-label="Title URL"
                      />
                    </div>

                    <!-- Embed Description -->
                    <div>
                      <label for="embed-description" class="block text-sm font-medium mb-2"
                             style="color: {$colorStore.text}">
                        Embed Description
                      </label>
                      <textarea
                        id="embed-description"
                        bind:value={embeds[activeEmbedIndex].description}
                        class="w-full rounded-lg p-3 min-h-[120px] transition-all duration-200 focus:outline-none"
                        style="background: {$colorStore.primary}10;
                             border: 1px solid {$colorStore.primary}30;
                             color: {$colorStore.text};"
                        placeholder="Enter description"
                        on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'description')}
                      />
                    </div>
                  </div>
                {/if}

                {#if activeTab === 'appearance'}
                  <div
                    class="space-y-6"
                    role="tabpanel"
                    id="editor-panel-appearance"
                    aria-labelledby="editor-tab-appearance"
                  >
                    <!-- Color Picker -->
                    <div>
                      <label for="embed-color" class="block text-sm font-medium mb-2"
                             style="color: {$colorStore.text}">
                        Embed Color
                      </label>
                      <div class="flex items-center gap-4">
                        <input
                          id="embed-color"
                          type="color"
                          bind:value={embeds[activeEmbedIndex].color}
                          class="h-12 w-12 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          bind:value={embeds[activeEmbedIndex].color}
                          class="rounded-lg p-3 transition-all duration-200 focus:outline-none"
                          style="background: {$colorStore.primary}10;
                               border: 1px solid {$colorStore.primary}30;
                               color: {$colorStore.text};"
                          aria-label="Color hex value"
                        />
                      </div>
                    </div>

                    <!-- Author Settings -->
                    <fieldset>
                      <legend class="text-sm font-medium mb-3" style="color: {$colorStore.text}">Author</legend>
                      <div class="space-y-3">
                        <input
                          type="text"
                          bind:value={embeds[activeEmbedIndex].author.name}
                          class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                          style="background: {$colorStore.primary}10;
                               border: 1px solid {$colorStore.primary}30;
                               color: {$colorStore.text};"
                          placeholder="Author name"
                          on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'author-name')}
                          aria-label="Author name"
                        />
                        <input
                          type="text"
                          bind:value={embeds[activeEmbedIndex].author.url}
                          class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                          style="background: {$colorStore.primary}10;
                               border: 1px solid {$colorStore.primary}30;
                               color: {$colorStore.text};"
                          placeholder="Author URL"
                          on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'author-url')}
                          aria-label="Author URL"
                        />
                        <input
                          type="text"
                          bind:value={embeds[activeEmbedIndex].author.icon_url}
                          class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                          style="background: {$colorStore.primary}10;
                               border: 1px solid {$colorStore.primary}30;
                               color: {$colorStore.text};"
                          placeholder="Author icon URL"
                          on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'author-icon_url')}
                          aria-label="Author icon URL"
                        />
                      </div>
                    </fieldset>

                    <!-- Footer Settings -->
                    <fieldset>
                      <legend class="text-sm font-medium mb-3" style="color: {$colorStore.text}">Footer</legend>
                      <div class="space-y-3">
                        <input
                          type="text"
                          bind:value={embeds[activeEmbedIndex].footer.text}
                          class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                          style="background: {$colorStore.primary}10;
                               border: 1px solid {$colorStore.primary}30;
                               color: {$colorStore.text};"
                          placeholder="Footer text"
                          on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'footer-text')}
                          aria-label="Footer text"
                        />
                        <input
                          type="text"
                          bind:value={embeds[activeEmbedIndex].footer.icon_url}
                          class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                          style="background: {$colorStore.primary}10;
                               border: 1px solid {$colorStore.primary}30;
                               color: {$colorStore.text};"
                          placeholder="Footer icon URL"
                          on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'footer-icon_url')}
                          aria-label="Footer icon URL"
                        />
                      </div>
                    </fieldset>
                  </div>
                {/if}
                {#if activeTab === 'fields'}
                  <div
                    class="space-y-6"
                    role="tabpanel"
                    id="editor-panel-fields"
                    aria-labelledby="editor-tab-fields"
                  >
                    <button
                      class="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      on:click={() => addField(activeEmbedIndex)}
                      on:keydown={(e) => e.key === 'Enter' && addField(activeEmbedIndex)}
                      disabled={embeds[activeEmbedIndex].fields.length >= 25}
                      style="background: {$colorStore.primary};
                           color: {$colorStore.text};"
                    >
                      <Plus size={16} />
                      Add Field
                    </button>

                    {#each embeds[activeEmbedIndex].fields as field, fieldIndex}
                      <div
                        class="p-4 rounded-lg space-y-3 relative"
                        style="background: {$colorStore.primary}10;
                             border: 1px solid {$colorStore.primary}30;"
                      >
                        <button
                          class="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 hover:bg-opacity-40"
                          style="background: {$colorStore.accent}20;
                               color: {$colorStore.accent};"
                          on:click={() => removeField(activeEmbedIndex, fieldIndex)}
                          on:keydown={(e) => e.key === 'Enter' && removeField(activeEmbedIndex, fieldIndex)}
                          aria-label="Remove field"
                        >
                          <X size={16} />
                        </button>

                        <input
                          type="text"
                          bind:value={field.name}
                          class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                          style="background: {$colorStore.primary}20;
                               border: 1px solid {$colorStore.primary}30;
                               color: {$colorStore.text};"
                          placeholder="Field name"
                          on:keydown={(e) => handleKeydown(e, activeEmbedIndex, `field-${fieldIndex}-name`)}
                          aria-label={`Field ${fieldIndex + 1} name`}
                        />
                        <textarea
                          bind:value={field.value}
                          class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                          style="background: {$colorStore.primary}20;
                               border: 1px solid {$colorStore.primary}30;
                               color: {$colorStore.text};"
                          placeholder="Field value"
                          rows="3"
                          on:keydown={(e) => handleKeydown(e, activeEmbedIndex, `field-${fieldIndex}-value`)}
                          aria-label={`Field ${fieldIndex + 1} value`}
                        />
                        <label class="flex items-center gap-3 cursor-pointer">
                          <div
                            class="relative w-10 h-6 rounded-full transition-all duration-200"
                            style="background: {field.inline ? $colorStore.primary : $colorStore.primary + '30'};"
                          >
                            <input
                              type="checkbox"
                              bind:checked={field.inline}
                              class="sr-only peer"
                              aria-label="Make field inline"
                            />
                            <div
                              class="absolute w-4 h-4 rounded-full top-1 transition-all duration-200"
                              style="background: {$colorStore.text};
                                   left: {field.inline ? '5px' : '1px'};
                                   transform: translateX({field.inline ? '4px' : '0'});"
                              aria-hidden="true"
                            />
                          </div>
                          <span class="text-sm"
                                style="color: {$colorStore.text}">Inline field</span>
                        </label>
                      </div>
                    {/each}
                  </div>
                {/if}

                {#if activeTab === 'media'}
                  <div
                    class="space-y-6"
                    role="tabpanel"
                    id="editor-panel-media"
                    aria-labelledby="editor-tab-media"
                  >
                    <div>
                      <label for="thumbnail-url" class="block text-sm font-medium mb-2"
                             style="color: {$colorStore.text}">
                        Thumbnail URL
                      </label>
                      <input
                        id="thumbnail-url"
                        type="text"
                        bind:value={embeds[activeEmbedIndex].thumbnail.url}
                        class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                        style="background: {$colorStore.primary}10;
                             border: 1px solid {$colorStore.primary}30;
                             color: {$colorStore.text};"
                        placeholder="Enter thumbnail URL"
                        on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'thumbnail-url')}
                      />
                    </div>

                    <div>
                      <label for="image-url" class="block text-sm font-medium mb-2"
                             style="color: {$colorStore.text}">
                        Image URL
                      </label>
                      <input
                        id="image-url"
                        type="text"
                        bind:value={embeds[activeEmbedIndex].image.url}
                        class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                        style="background: {$colorStore.primary}10;
                             border: 1px solid {$colorStore.primary}30;
                             color: {$colorStore.text};"
                        placeholder="Enter image URL"
                        on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'image-url')}
                      />
                    </div>
                  </div>
                {/if}
              </div>
            {:else if currentSection === 'components'}
              <!-- Component Editor -->
              <div class="space-y-6">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 class="text-lg font-medium" style="color: {$colorStore.text}">Components
                    ({totalComponents}/25)</h3>
                  <button
                    class="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    on:click={() => showAddComponent = true}
                    on:keydown={(e) => e.key === 'Enter' && (showAddComponent = true)}
                    disabled={totalComponents >= 25}
                    style="background: {$colorStore.primary};
                         color: {$colorStore.text};"
                  >
                    <Plus size={16} />
                    Add Component
                  </button>
                </div>

                {#if components.length === 0}
                  <div
                    class="p-6 text-center rounded-lg border"
                    style="background: {$colorStore.primary}10;
                         border-color: {$colorStore.primary}30;"
                  >
                    <Component class="w-12 h-12 mx-auto mb-3" style="color: {$colorStore.muted}" />
                    <p class="mb-2" style="color: {$colorStore.text}">No Components Added</p>
                    <p class="text-sm" style="color: {$colorStore.muted}">Add buttons or select
                      menus to enhance your embed</p>
                  </div>
                {:else}
                  <div class="space-y-4">
                    {#each components as component}
                      <div
                        class="p-4 rounded-lg"
                        style="background: {$colorStore.primary}10;
                             border: 1px solid {$colorStore.primary}30;"
                      >
                        <div class="flex justify-between items-center mb-4">
                        <span class="font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                          <Component class="w-4 h-4" style="color: {$colorStore.primary}" />
                          {component.isSelect ? 'Select Menu' : 'Button'}
                        </span>
                          <div class="flex gap-2">
                            <button
                              class="px-3 py-1 rounded-lg text-sm transition-all duration-200 hover:bg-opacity-30"
                              style="background: {$colorStore.secondary}20;
                                   color: {$colorStore.secondary};"
                              on:click={() => startEditingComponent(component)}
                              on:keydown={(e) => e.key === 'Enter' && startEditingComponent(component)}
                              aria-label={`Edit ${component.isSelect ? 'select menu' : 'button'}`}
                            >
                              Edit
                            </button>
                            <button
                              class="px-3 py-1 rounded-lg text-sm transition-all duration-200 hover:bg-opacity-30"
                              style="background: {$colorStore.accent}20;
                                   color: {$colorStore.accent};"
                              on:click={() => removeComponent(component.componentKey)}
                              on:keydown={(e) => e.key === 'Enter' && removeComponent(component.componentKey)}
                              aria-label={`Delete ${component.isSelect ? 'select menu' : 'button'}`}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div style="color: {$colorStore.muted}">
                          <p class="flex justify-between">
                            <span>Label:</span>
                            <span style="color: {$colorStore.text}">{component.displayName}</span>
                          </p>
                          {#if component.isSelect}
                            <p class="flex justify-between mt-2">
                              <span>Options:</span>
                              <span style="color: {$colorStore.text}">{component.options.length}</span>
                            </p>
                            <div class="mt-2 space-y-1">
                              {#each component.options as option}
                                {#if !option.id}
                                  <p class="text-sm"
                                     style="color: {$colorStore.accent}">
                                    Option "{option.name}" has no trigger selected
                                  </p>
                                {/if}
                                {#if !option.description || option.description.trim() === ''}
                                  <p class="text-sm"
                                     style="color: {$colorStore.accent}">
                                    Option "{option.name}" is missing a description
                                  </p>
                                {/if}
                              {/each}
                            </div>
                          {:else}
                            <p class="flex justify-between mt-2">
                              <span>Style:</span>
                              <span style="color: {$colorStore.text}">{getButtonStyleName(component.style)}</span>
                            </p>
                            {#if !component.id}
                              <p class="mt-2 text-sm" style="color: {$colorStore.accent}">
                                Trigger not selected for button
                              </p>
                            {/if}
                          {/if}
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </section>

        <!-- Preview Section -->
        <section
          class={`w-full ${!showPreview ? 'hidden md:block md:w-1/2' : 'block'} backdrop-blur-sm rounded-2xl border shadow-2xl overflow-hidden`}
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
     border-color: {$colorStore.primary}30; max-width: 100%;"
        >
          <div class="p-6">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="p-3 rounded-xl"
                style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);"
              >
                <MessageCircle class="w-6 h-6" style="color: {$colorStore.primary}" />
              </div>
              <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Preview</h2>
            </div>

            <div
              class="rounded-lg p-4 mb-6"
              style="background: rgba(30, 33, 36, 0.6);
                   border: 1px solid rgba(79, 84, 92, 0.3);"
            >
              <!-- Message Content Preview -->
              {#if content}
                <div class="mb-4" style="color: {$colorStore.text}">
                  {@html parseMarkdown(content)}
                </div>
              {/if}

              <!-- Embeds Preview -->
              {#each embeds as embed}
                <div class="rounded-lg overflow-hidden mb-4"
                     style="border-left: 4px solid {embed.color};">
                  <div class="bg-[#2F3136] p-4 relative">
                    <!-- Author -->
                    {#if embed.author.name}
                      <div class="flex items-center mb-2">
                        {#if embed.author.icon_url}
                          <img src={embed.author.icon_url} alt="Author icon"
                               class="w-6 h-6 rounded-full mr-2" />
                        {/if}

                        {#if embed.author.url}
                          <a
                            href={embed.author.url}
                            class="text-white hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {embed.author.name}
                          </a>
                        {:else}
                          <span class="text-white">{embed.author.name}</span>
                        {/if}
                      </div>
                    {/if}

                    <!-- Title -->
                    {#if embed.title}
                      <div class="font-bold text-lg mb-2">
                        {#if embed.url}
                          <a
                            href={embed.url}
                            class="text-[#00b0f4] hover:underline embed-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {embed.title}
                          </a>
                        {:else}
                          <span class="text-white">{embed.title}</span>
                        {/if}
                      </div>
                    {/if}

                    <!-- Description -->
                    {#if embed.description}
                      <div class="text-gray-300 whitespace-pre-wrap mb-4 markdown-content">
                        {@html parseMarkdown(embed.description)}
                      </div>
                    {/if}

                    <!-- Fields -->
                    {#if embed.fields.length > 0}
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                        {#each embed.fields as field}
                          <div class={`${field.inline ? 'col-span-1' : 'col-span-full'}`}>
                            <div class="font-bold text-white text-sm">
                              {field.name}
                            </div>
                            <div class="text-gray-300 text-sm">
                              {@html parseMarkdown(field.value)}
                            </div>
                          </div>
                        {/each}
                      </div>
                    {/if}

                    <!-- Image -->
                    {#if embed.image.url}
                      <div class="mt-2 mb-2">
                        <img src={embed.image.url} alt=""
                             class="max-w-full h-auto rounded-lg" />
                      </div>
                    {/if}

                    <!-- Thumbnail -->
                    {#if embed.thumbnail.url}
                      <div class="absolute top-4 right-4 w-20 h-20">
                        <img src={embed.thumbnail.url} alt="Thumbnail"
                             class="w-full h-full object-cover rounded-lg" />
                      </div>
                    {/if}

                    <!-- Footer -->
                    {#if embed.footer.text || embed.footer.icon_url}
                      <div class="flex items-center mt-4 text-gray-400 text-sm">
                        {#if embed.footer.icon_url}
                          <img src={embed.footer.icon_url} alt="Footer icon"
                               class="w-5 h-5 rounded-full mr-2" />
                        {/if}
                        <span>{embed.footer.text}</span>
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}

              {#if components.length > 0}
                <div class="mt-4 space-y-4">
                  {#each getComponentRows(components) as row}
                    <div class="flex flex-wrap justify-start gap-2">
                      {#each row as component}
                        {#if component.isSelect}
                          <div class="col-span-5">
                            <button
                              class="border border-transparent bg-[#2F3136] text-white font-medium rounded cursor-pointer box-border grid grid-cols-[1fr,auto] items-center w-full text-left"
                              aria-expanded="false"
                              aria-haspopup="listbox"
                              disabled
                            >
                              <span
                                class="placeholder px-3 py-2">{component.displayName || "Select an option..."}</span>
                              <div class="icon-container px-2">
                                <svg
                                  aria-hidden="true"
                                  role="img"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  class="text-white"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M5.3 9.3a1 1 0 0 1 1.4 0l5.3 5.29 5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42Z"
                                  />
                                </svg>
                              </div>
                            </button>
                          </div>
                        {:else}
                          <!-- Button -->
                          <button
                            class="{getButtonColorClass(component.style)} relative discord-button button-content flex justify-center flex-grow-0 items-center box-border border-0 rounded px-4 py-[2px] min-h-[32px] text-sm font-medium leading-[16px] transition-colors duration-200 select-none"
                            class:col-span-2={component.displayName.length > 10}
                            disabled
                            aria-label={component.displayName}
                          >
                            <div class="flex items-center justify-center">
                              <div class="flex items-center gap-2">
                                {#if component.emoji}
                                <span
                                  class="emoji w-[1.2em] h-[1.2em] inline-flex items-center justify-center align-[-0.1em]">
                                  {@html parseEmojis(component.emoji)}
                                </span>
                                {/if}
                                <span class="truncate">{component.displayName}</span>
                              </div>
                            </div>
                          </button>
                        {/if}
                      {/each}
                    </div>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- Copy JSON Button -->
            <button
              aria-label={jsonCopied ? 'JSON copied!' : 'Copy JSON'}
              class="w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canCopyJson}
              on:click={copyJson}
              on:keydown={(e) => e.key === 'Enter' && canCopyJson && copyJson()}
              style="background: linear-gradient(to right, {$colorStore.primary}, {$colorStore.secondary});
                   color: {$colorStore.text};"
            >
              <Copy size={20} />
              {jsonCopied ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <!-- Add Component Modal -->
  {#if showAddComponent}
    <div
      class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
      on:click|self={() => showAddComponent = false}
      on:keydown={(e) => e.key === 'Escape' && (showAddComponent = false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-component-title"
      transition:fade={{ duration: 200 }}
      tabindex="-1"
    >
      <div
        class="rounded-xl p-4 w-80 sm:w-96 mx-auto"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}20);
           border: 1px solid {$colorStore.primary}30;"
      >
        <h2 id="add-component-title" class="text-lg font-bold mb-4" style="color: {$colorStore.text}">Add Component</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            class="p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:bg-opacity-30 transform hover:-translate-y-1"
            style="background: {$colorStore.primary}20;
               border: 1px solid {$colorStore.primary}30;
               color: {$colorStore.text};"
            on:click={() => {
            addComponent('button');
            showAddComponent = false;
          }}
            on:keydown={(e) => {
            if (e.key === 'Enter') {
              addComponent('button');
              showAddComponent = false;
            }
          }}
          >
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center mb-2"
              style="background: {$colorStore.primary}30;"
            >
              <Component size={24} style="color: {$colorStore.primary}" />
            </div>
            <span class="font-medium">Button</span>
            <span class="text-xs" style="color: {$colorStore.muted}">Add an interactive button</span>
          </button>

          <button
            class="p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:bg-opacity-30 transform hover:-translate-y-1"
            style="background: {$colorStore.secondary}20;
               border: 1px solid {$colorStore.secondary}30;
               color: {$colorStore.text};"
            on:click={() => {
            addComponent('select');
            showAddComponent = false;
          }}
            on:keydown={(e) => {
            if (e.key === 'Enter') {
              addComponent('select');
              showAddComponent = false;
            }
          }}
          >
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center mb-2"
              style="background: {$colorStore.secondary}30;"
            >
              <Component size={24} style="color: {$colorStore.secondary}" />
            </div>
            <span class="font-medium">Select Menu</span>
            <span class="text-xs" style="color: {$colorStore.muted}">Add a dropdown menu</span>
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Edit Component Modal -->
  {#if editingComponent}
    <div
      class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
      on:click|self={() => editingComponent = null}
      on:keydown={(e) => e.key === 'Escape' && (editingComponent = null)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-component-title"
      transition:fade={{ duration: 200 }}
      tabindex="-1"
    >
      <div
        class="rounded-xl p-4 w-80 sm:w-96 mx-auto max-h-[80vh] overflow-y-auto"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}20);
           border: 1px solid {$colorStore.primary}30;"
      >
        <h2 id="edit-component-title" class="text-lg font-bold mb-4" style="color: {$colorStore.text}">
          Edit {editingComponent.isSelect ? 'Select Menu' : 'Button'}
        </h2>

        <div class="space-y-6">
          <!-- Common Fields -->
          {#if !editingComponent.isSelect}
            <!-- Button Specific Fields -->
            <div>
              <label for="component-display-name" class="block text-sm font-medium mb-2"
                     style="color: {$colorStore.text}">
                Display Name
              </label>
              <input
                id="component-display-name"
                type="text"
                bind:value={editingComponent.displayName}
                maxlength="80"
                class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                style="background: {$colorStore.primary}10;
                   border: 1px solid {$colorStore.primary}30;
                   color: {$colorStore.text};"
                placeholder="Display name"
                on:input={() => {
                if (editingComponent.displayName.length > 80) {
                  editingComponent.displayName = editingComponent.displayName.slice(0, 80);
                }
              }}
              />
              {#if editingComponent.displayName.length >= 75}
                <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                  {80 - editingComponent.displayName.length} characters remaining
                </p>
              {/if}
            </div>
            <div>
              <label for="component-style" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                Style
              </label>
              <div class="relative">
                <select
                  id="component-style"
                  bind:value={editingComponent.style}
                  class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none appearance-none"
                  style="background-color: {$colorStore.primary}10;
                     border: 1px solid {$colorStore.primary}30;
                     color: {$colorStore.text};"
                >
                  <option value={1}>Primary</option>
                  <option value={2}>Secondary</option>
                  <option value={3}>Success</option>
                  <option value={4}>Danger</option>
                  <option value={5}>Link</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2" aria-hidden="true">
                  <ChevronDown class="w-5 h-5" style="color: {$colorStore.muted}" />
                </div>
              </div>
            </div>

            <div>
              <label for="component-emoji" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                Emoji (optional)
              </label>
              <input
                id="component-emoji"
                type="text"
                bind:value={editingComponent.emoji}
                class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                style="background: {$colorStore.primary}10;
                   border: 1px solid {$colorStore.primary}30;
                   color: {$colorStore.text};"
                placeholder="Emoji"
              />
            </div>

            {#if editingComponent.style === 5}
              <div>
                <label for="component-url" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                  URL
                </label>
                <input
                  id="component-url"
                  type="text"
                  bind:value={editingComponent.url}
                  class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                  style="background: {$colorStore.primary}10;
                     border: 1px solid {$colorStore.primary}30;
                     color: {$colorStore.text};"
                  placeholder="https://"
                />
              </div>
            {:else}
              <button
                class="w-full px-4 py-3 rounded-lg font-medium transition-all duration-200"
                style="background: {$colorStore.primary};
                   color: {$colorStore.text};"
                on:click={() => {
                currentTriggerComponent = editingComponent;
                currentEditingOptionIndex = null;
                showTriggerSelect = true;
              }}
                on:keydown={(e) => {
                if (e.key === 'Enter') {
                  currentTriggerComponent = editingComponent;
                  currentEditingOptionIndex = null;
                  showTriggerSelect = true;
                }
              }}
              >
                Select Trigger
              </button>
            {/if}
          {:else}
            <!-- Select Menu Fields -->
            <div>
              <div class="space-y-3">
                <label for="select-placeholder" class="block text-sm font-medium mb-2"
                       style="color: {$colorStore.text}">
                  Placeholder Text
                </label>
                <input
                  id="select-placeholder"
                  type="text"
                  bind:value={editingComponent.displayName}
                  maxlength="150"
                  class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                  style="background: {$colorStore.primary}10;
                     border: 1px solid {$colorStore.primary}30;
                     color: {$colorStore.text};"
                  placeholder="Placeholder text when nothing is selected (optional)"
                  on:input={() => {
                  if (editingComponent.displayName.length > 150) {
                    editingComponent.displayName = editingComponent.displayName.slice(0, 150);
                  }
                }}
                />
                {#if editingComponent.displayName && editingComponent.displayName.length > 120}
                  <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                    {150 - editingComponent.displayName.length} characters remaining
                  </p>
                {/if}
              </div>
              <fieldset class="space-y-3 mt-6">
                <legend class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Options</legend>
                <div class="space-y-4">
                  {#each editingComponent.options as option, index}
                    <div
                      class="p-4 rounded-lg space-y-3 relative"
                      style="background: {$colorStore.primary}10;
                         border: 1px solid {$colorStore.primary}30;"
                    >
                      <!-- Option Name -->
                      <label for={`option-name-${index}`} class="sr-only">Option {index + 1} name</label>
                      <input
                        id={`option-name-${index}`}
                        type="text"
                        bind:value={option.name}
                        maxlength="100"
                        class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                        style="background: {$colorStore.primary}20;
                           border: 1px solid {$colorStore.primary}30;
                           color: {$colorStore.text};"
                        placeholder="Option name"
                        on:input={() => {
                        if (option.name.length > 100) {
                          option.name = option.name.slice(0, 100);
                        }
                      }}
                      />
                      {#if option.name.length > 90}
                        <p class="text-xs" style="color: {$colorStore.muted}">
                          {100 - option.name.length} characters remaining
                        </p>
                      {/if}

                      <!-- Option Emoji -->
                      <label for={`option-emoji-${index}`} class="sr-only">Option {index + 1} emoji</label>
                      <input
                        id={`option-emoji-${index}`}
                        type="text"
                        bind:value={option.emoji}
                        class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                        style="background: {$colorStore.primary}20;
                           border: 1px solid {$colorStore.primary}30;
                           color: {$colorStore.text};"
                        placeholder="Option emoji (optional)"
                      />

                      <!-- Option Description -->
                      <label for={`option-description-${index}`} class="sr-only">Option {index + 1} description</label>
                      <textarea
                        id={`option-description-${index}`}
                        bind:value={option.description}
                        maxlength="100"
                        class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                        style="background: {$colorStore.primary}20;
                           border: 1px solid {(!option.description || option.description.trim() === '') ? $colorStore.accent + '30' : $colorStore.primary + '30'};
                           color: {$colorStore.text};"
                        placeholder="Option description (required)"
                        rows="2"
                        required
                        on:input={() => {
                        if (option.description.length > 100) {
                          option.description = option.description.slice(0, 100);
                        }
                      }}
                      />
                      {#if option.description.length > 90}
                        <p class="text-xs" style="color: {$colorStore.muted}">
                          {100 - option.description.length} characters remaining
                        </p>
                      {/if}

                      <!-- Validation Message -->
                      {#if !option.description || option.description.trim() === ''}
                        <p class="text-sm" role="alert" style="color: {$colorStore.accent}">Description is
                          required.</p>
                      {/if}

                      <!-- Select Trigger Button -->
                      <button
                        class="w-full px-4 py-2 rounded-lg font-medium transition-all duration-200"
                        style="background: {$colorStore.primary};
                           color: {$colorStore.text};"
                        on:click={() => {
                        currentTriggerComponent = editingComponent;
                        currentEditingOptionIndex = index;
                        showTriggerSelect = true;
                      }}
                        on:keydown={(e) => {
                        if (e.key === 'Enter') {
                          currentTriggerComponent = editingComponent;
                          currentEditingOptionIndex = index;
                          showTriggerSelect = true;
                        }
                      }}
                      >
                        Select Trigger
                      </button>

                      <!-- Remove Option Button -->
                      {#if editingComponent.options.length > 1}
                        <button
                          class="w-full px-4 py-2 mt-2 rounded-lg font-medium transition-all duration-200"
                          style="background: {$colorStore.accent}20;
                             color: {$colorStore.accent};"
                          on:click={() => {
                          editingComponent.options = editingComponent.options.filter((_, i) => i !== index);
                        }}
                          on:keydown={(e) => {
                          if (e.key === 'Enter') {
                            editingComponent.options = editingComponent.options.filter((_, i) => i !== index);
                          }
                        }}
                          aria-label={`Remove option ${index + 1}`}
                        >
                          Remove Option
                        </button>
                      {/if}
                    </div>
                  {/each}
                </div>

                {#if editingComponent.options.length < 25}
                  <button
                    class="w-full px-4 py-2 mt-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    style="background: {$colorStore.secondary};
                       color: {$colorStore.text};"
                    on:click={() => {
                    editingComponent.options = [
                      ...editingComponent.options,
                      {
                        id: null,
                        name: `Option ${editingComponent.options.length + 1}`,
                        emoji: '',
                        description: ''
                      }
                    ];
                  }}
                    on:keydown={(e) => {
                    if (e.key === 'Enter') {
                      editingComponent.options = [
                        ...editingComponent.options,
                        {
                          id: null,
                          name: `Option ${editingComponent.options.length + 1}`,
                          emoji: '',
                          description: ''
                        }
                      ];
                    }
                  }}
                  >
                    <Plus size={16} />
                    Add Option
                  </button>
                {/if}
              </fieldset>
            </div>

            <!-- Min and Max Options -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="min-options" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                  Min Options
                </label>
                <input
                  id="min-options"
                  type="number"
                  bind:value={editingComponent.minOptions}
                  min="1"
                  max={editingComponent.options.length}
                  class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                  style="background: {$colorStore.primary}10;
                     border: 1px solid {$colorStore.primary}30;
                     color: {$colorStore.text};"
                  on:input={() => {
                  if (editingComponent.minOptions > editingComponent.options.length) {
                    editingComponent.minOptions = editingComponent.options.length;
                  }
                  if (editingComponent.maxOptions < editingComponent.minOptions) {
                    editingComponent.maxOptions = editingComponent.minOptions;
                  }
                }}
                />
              </div>
              <div>
                <label for="max-options" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                  Max Options
                </label>
                <input
                  id="max-options"
                  type="number"
                  bind:value={editingComponent.maxOptions}
                  min={editingComponent.minOptions}
                  max={editingComponent.options.length}
                  class="w-full rounded-lg p-3 transition-all duration-200 focus:outline-none"
                  style="background: {$colorStore.primary}10;
                     border: 1px solid {$colorStore.primary}30;
                     color: {$colorStore.text};"
                  on:input={() => {
                  if (editingComponent.maxOptions < editingComponent.minOptions) {
                    editingComponent.maxOptions = editingComponent.minOptions;
                  }
                  if (editingComponent.maxOptions > editingComponent.options.length) {
                    editingComponent.maxOptions = editingComponent.options.length;
                  }
                }}
                />
              </div>
            </div>
          {/if}

          <!-- Validation Messages -->
          <div class="mt-4" role="alert" aria-live="polite">
            {#if !editingComponent.isSelect && !editingComponent.id && editingComponent.style !== 5}
              <p class="text-sm" style="color: {$colorStore.accent}">Please select a trigger for this
                button.</p>
            {/if}

            {#if editingComponent.isSelect}
              {#each editingComponent.options as option, index}
                {#if !option.id}
                  <p class="text-sm" style="color: {$colorStore.accent}">Option "{option.name}" is
                    missing a trigger.</p>
                {/if}
                {#if !option.description || option.description.trim() === ''}
                  <p class="text-sm" style="color: {$colorStore.accent}">Option "{option.name}" is
                    missing a description.</p>
                {/if}
              {/each}
            {/if}
          </div>

          <!-- Modal Actions -->
          <div class="flex justify-end mt-6 gap-3">
            <button
              class="px-4 py-2 rounded-lg font-medium transition-all duration-200"
              style="background: {$colorStore.accent}20;
                 color: {$colorStore.accent};"
              on:click={() => editingComponent = null}
              on:keydown={(e) => e.key === 'Enter' && (editingComponent = null)}
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style="background: {$colorStore.primary};
                 color: {$colorStore.text};"
              on:click={() => {
              const index = components.findIndex(c => c.componentKey === editingComponent.componentKey);
              components[index] = editingComponent;
              components = [...components];
              editingComponent = null;
            }}
              on:keydown={(e) => {
              if (e.key === 'Enter' && !(
                (!editingComponent.isSelect && !editingComponent.id && editingComponent.style !== 5) ||
                (editingComponent.isSelect && editingComponent.options.some(option => !option.id || !option.description || option.description.trim() === ''))
              )) {
                const index = components.findIndex(c => c.componentKey === editingComponent.componentKey);
                components[index] = editingComponent;
                components = [...components];
                editingComponent = null;
              }
            }}
              disabled={
              (
                !editingComponent.isSelect &&
                !editingComponent.id &&
                editingComponent.style !== 5
              ) ||
              (
                editingComponent.isSelect &&
                editingComponent.options.some(option => !option.id || !option.description || option.description.trim() === '')
              )
            }
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
  <!-- Placeholder Menu -->
  {#if showPlaceholderMenu}
    <div
      class="fixed backdrop-blur-sm border rounded-xl shadow-lg z-50 max-h-96 w-80 overflow-hidden placeholder-menu"
      style="top: {placeholderMenuPosition.y}px; left: {placeholderMenuPosition.x}px;
           background: linear-gradient(135deg, {$colorStore.gradientStart}30, {$colorStore.gradientMid}30);
           border-color: {$colorStore.primary}30;"
      role="dialog"
      aria-modal="true"
      aria-label="Placeholder menu"
      transition:fade={{ duration: 150 }}
      on:keydown={(e) => e.key === 'Escape' && (showPlaceholderMenu = false)}
      tabindex="-1"
    >
      <div
        class="p-3 border-b"
        style="border-color: {$colorStore.primary}30;"
      >
        <input
          bind:this={placeholderInputRef}
          type="text"
          class="w-full rounded-lg p-2 transition-all duration-200 focus:outline-none"
          style="background: {$colorStore.primary}20;
               border: 1px solid {$colorStore.primary}30;
               color: {$colorStore.text};"
          placeholder="Search placeholders..."
          on:input={filterPlaceholders}
          on:keydown={handlePlaceholderNavigation}
          aria-label="Search placeholders"
        />
      </div>

      <div class="overflow-y-auto max-h-80" role="listbox">
        {#each filteredPlaceholders as placeholder, index}
          <button
            class="w-full text-left p-3 transition-colors duration-200 hover:bg-opacity-20"
            style="background: {index === selectedPlaceholderIndex ? $colorStore.primary + '30' : 'transparent'};
                 color: {$colorStore.text};"
            on:click={() => insertPlaceholder(placeholder)}
            on:keydown={(e) => e.key === 'Enter' && insertPlaceholder(placeholder)}
            role="option"
            aria-selected={index === selectedPlaceholderIndex}
          >
            <span class="font-medium block">{placeholder.name}</span>
            <span class="text-sm block" style="color: {$colorStore.muted}">{placeholder.description}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
  <!-- Trigger Select Modal -->
  {#if showTriggerSelect}
    <div
      class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
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
        <h2 id="select-trigger-title" class="text-lg font-bold mb-4" style="color: {$colorStore.text}">
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
              <p class="mb-2" style="color: {$colorStore.text}">No Triggers Available</p>
              <p class="text-sm" style="color: {$colorStore.muted}">Create chat triggers to use with your
                components</p>
            </div>
          {:else}
            {#each chatTriggers as trigger}
              <button
                class="w-full text-left p-4 rounded-lg border transition-all duration-200 hover:bg-opacity-20"
                style="background: {$colorStore.primary}10;
                   border-color: {$colorStore.primary}30;
                   color: {$colorStore.text};"
                on:click={() => {
                if (currentTriggerComponent) {
                  if (currentTriggerComponent.isSelect && currentEditingOptionIndex !== null) {
                    currentTriggerComponent.options[currentEditingOptionIndex].id = trigger.id.toString();
                  } else {
                    currentTriggerComponent.id = trigger.id.toString();
                  }
                  if (editingComponent === currentTriggerComponent) {
                    editingComponent = { ...currentTriggerComponent };
                  }
                }
                showTriggerSelect = false;
                currentEditingOptionIndex = null;
                showNotificationMessage("Trigger selected successfully");
              }}
                on:keydown={(e) => {
                if (e.key === 'Enter') {
                  if (currentTriggerComponent) {
                    if (currentTriggerComponent.isSelect && currentEditingOptionIndex !== null) {
                      currentTriggerComponent.options[currentEditingOptionIndex].id = trigger.id.toString();
                    } else {
                      currentTriggerComponent.id = trigger.id.toString();
                    }
                    if (editingComponent === currentTriggerComponent) {
                      editingComponent = { ...currentTriggerComponent };
                    }
                  }
                  showTriggerSelect = false;
                  currentEditingOptionIndex = null;
                  showNotificationMessage("Trigger selected successfully");
                }
              }}
                role="option"
                aria-selected="false"
              >
                <div class="font-medium mb-1">{trigger.trigger}</div>
                <div class="text-sm truncate" style="color: {$colorStore.muted}">
                  {trigger.response}
                </div>
              </button>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>


<style>
    /* Base styles */
    :global(body) {
        background-color: #1a202c;
        color: #ffffff;
        overflow-x: hidden;
        width: 100%;
    }

    /* Fix mobile overflow issues */

    /* Add overscroll behavior to prevent bounce effects causing layout issues */
    :global(html, body) {
        overscroll-behavior: none;
    }

    /* Add better responsive handling for modals on mobile */
    @media (max-width: 640px) {
        .fixed.inset-0 {
            overflow-y: auto;
        }

        .fixed.inset-0 > div {
            max-width: 95vw;
            max-height: 80vh;
            overflow-y: auto;
            margin-top: 1rem;
            margin-bottom: 1rem;
        }
    }

    /* Fix position for mobile placeholders menu */
    @media (max-width: 640px) {
        div[style*="top"][style*="left"] {
            max-width: 90vw !important;
            left: 5vw !important;
        }
    }

    /* Hide scrollbar for Chrome, Safari and Opera */
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    /* Embed and markdown styling */
    :global(.embed-link) {
        color: #38b2f8;
        text-decoration: none;
    }

    :global(.embed-link:hover) {
        text-decoration: underline;
    }

    :global(.markdown-content) {
        color: #d1d5db;
    }

    :global(.markdown-content h1) {
        font-size: 1.5rem;
        font-weight: 700;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }

    :global(.markdown-content h2) {
        font-size: 1.25rem;
        font-weight: 700;
        margin-top: 0.75rem;
        margin-bottom: 0.75rem;
    }

    :global(.markdown-content h3) {
        font-size: 1.125rem;
        font-weight: 700;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
    }

    :global(.markdown-content p) {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
    }

    :global(.markdown-content ul) {
        list-style-type: disc;
        margin-left: 1.5rem;
    }

    :global(.markdown-content ol) {
        list-style-type: decimal;
        margin-left: 1.5rem;
    }

    :global(.markdown-content blockquote) {
        border-left-width: 4px;
        border-color: #4b5563;
        padding-left: 1rem;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
    }

    :global(.markdown-content code) {
        background-color: #1f2937;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        padding-top: 0.25rem;
        padding-bottom: 0.25rem;
        border-radius: 0.25rem;
        font-family: monospace;
        font-size: 0.875rem;
    }

    :global(.markdown-content pre) {
        background-color: #1f2937;
        padding: 1rem;
        border-radius: 0.25rem;
        overflow-x: auto;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }

    :global(.markdown-content pre code) {
        background-color: transparent;
        padding: 0;
    }

    :global(.markdown-content a) {
        color: #60a5fa;
        text-decoration: none;
    }

    :global(.markdown-content a:hover) {
        text-decoration: underline;
    }

    :global(.mention) {
        background-color: rgba(59, 130, 246, 0.3);
        color: #bfdbfe;
        border-radius: 0.25rem;
        padding-left: 0.25rem;
        padding-right: 0.25rem;
        font-weight: 500;
    }

    /* Color input styling */
    input[type="color"] {
        -webkit-appearance: none;
        border: 0;
        padding: 0;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0;
    }

    input[type="color"]::-webkit-color-swatch {
        border: 0;
        border-radius: 0.25rem;
    }

    .inline-emoji {
        display: inline-block;
        width: 1.25rem;
        height: 1.25rem;
        vertical-align: text-bottom;
    }

    .emoji {
        display: inline-block;
        font-size: 1.25rem;
        line-height: 1;
    }

    /* Ensure inputs don't overflow their containers */
    input, textarea, select {
        max-width: 100%;
        box-sizing: border-box;
    }

    /* Force all content to stay within viewable area */

    /* Fix for the editor section specifically */
    .backdrop-blur-sm {
        max-width: 100%;
        overflow-x: hidden;
    }

    /* Adjust field layouts on very small screens */
    @media (max-width: 480px) {

        /* Reduce padding on mobile */
        .p-4, .p-6 {
            padding: 0.75rem;
        }

        /* Make buttons more compact on mobile */
        button {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
        }
    }

    /* Fix text overflow in various sections */

    /* Accessibility focus styles */
    button:focus,
    input:focus,
    textarea:focus,
    select:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb, 99, 102, 241), 0.5);
    }

    /* Ensure proper contrast for placeholder text */
    ::placeholder {
        opacity: 0.7;
    }
</style>