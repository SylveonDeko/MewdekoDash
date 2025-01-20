<!-- routes/embedbuilder/+page.svelte -->
<script lang="ts">
  import { onMount, tick } from "svelte";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { userAdminGuilds } from "$lib/stores/adminGuildsStore";
  import { api } from "$lib/api";
  import { clickOutside } from "$lib/clickOutside";
  import { fly } from "svelte/transition";
  import { ChevronDown, Component, Copy, Image as ImageIcon, Layers, Layout, Plus, Type, X } from "lucide-svelte";
  import { marked } from "marked";
  import DOMPurify from "dompurify";
  import type { DiscordGuild } from "$lib/types/discordGuild.ts";
  import { logger } from "$lib/logger.ts";

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

  let view: 'editor' | 'preview' | 'both' = 'editor';

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
    let parsedText = marked(text);
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

    // Parse Unicode emojis (this is a basic implementation, you might want to use a library for more comprehensive parsing)
    const unicodeEmojiPattern = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
    text = text.replace(unicodeEmojiPattern, (match) =>
      `<span class="emoji">${match}</span>`
    );

    return text;
  }

  function checkMobileSize() {
    isMobile = window.innerWidth < 768;
    showPreview = !isMobile;
  }

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  function closeDropdown() {
    dropdownOpen = false;
  }

  function handleGuildKeydown(event: KeyboardEvent, guild: DiscordGuild) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectGuild(guild);
    }
  }

  function getGuildIconUrl(guild: DiscordGuild) {
    if (guild.icon) {
      const extension = guild.icon.startsWith("a_") ? "gif" : "png";
      return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${extension}`;
    }
    return "https://cdn.discordapp.com/embed/avatars/0.png";
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
        color: "#5865F2",
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
      showPlaceholderMenu = true;
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      const rect = target.getBoundingClientRect();
      placeholderMenuPosition = {
        x: Math.min(rect.left, window.innerWidth - 320),
        y: rect.bottom + window.scrollY
      };
      currentEditingElement = target;
      editingField = `${embedIndex}-${field}`;
      filteredPlaceholders = placeholders;
      selectedPlaceholderIndex = 0;

      await tick();
      placeholderInputRef?.focus();
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

  function validateComponents(): boolean {
    for (const component of components) {
      if (component.isSelect) {
        if (!component.id) {
          return false;
        }
        if (component.minOptions > component.options.length) {
          return false;
        }
        if (component.maxOptions < component.minOptions) {
          return false;
        }
        for (const option of component.options) {
          if (
            !option.id ||
            !option.description ||
            option.description.trim() === "" ||
            option.name.length > 100 ||
            option.description.length > 100
          ) {
            return false;
          }
        }
      } else {
        if (!component.id) {
          return false;
        }
        if (component.displayName.length > (component.isSelect ? 150 : 80)) {
          return false;
        }
      }
    }
    return true;
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
        return "bg-[#5865F2] hover:bg-[#4752C4] text-white";
      case 2: // Secondary
        return "bg-[#4F545C] hover:bg-[#686D73] text-white";
      case 3: // Success
        return "bg-[#43B581] hover:bg-[#3CA374] text-white";
      case 4: // Danger
        return "bg-[#F04747] hover:bg-[#D84040] text-white";
      case 5: // Link
        return "bg-transparent hover:bg-[#4752C4] text-[#00AFF4] hover:text-white";
      default:
        return "bg-[#5865F2] hover:bg-[#4752C4] text-white";
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

  $: canCopyJson =
    ((embeds.length === 0 || embeds.every(validateEmbed)) &&
      (components.length === 0 || validateComponents()) &&
      (content.trim().length > 0 || embeds.length > 0));
</script>

<div class="container mx-auto px-4 py-6 max-w-7xl">
  <!-- Content Section -->
  <div class="bg-gray-800 rounded-lg p-4 mb-6">
    <label class="block text-sm font-medium text-gray-200 mb-2" for="content">
      Message Content
    </label>
    <textarea
      bind:value={content}
      class="w-full bg-gray-700 text-white rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
      id="content"
      on:keydown={(e) => handleKeydown(e, -1, 'content')}
      placeholder="Type your message content..."
    />
  </div>

  <!-- Guild Selection -->
  {#if isLoggedIn && hasAdminGuilds}
    <div class="guild-selector relative mb-5" use:clickOutside on:clickoutside={closeDropdown}>
      <button
        class="dropdown-toggle w-full p-2 bg-gray-700 text-white border border-gray-600 rounded cursor-pointer text-sm text-left flex items-center"
        on:click={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={dropdownOpen}
        aria-label="Select a guild"
      >
        {#if $currentGuild}
          <img src={getGuildIconUrl($currentGuild)} alt=""
               class="guild-icon w-6 h-6 rounded-full mr-2 object-cover" />
          <span class="guild-name flex-grow">{$currentGuild.name}</span>
        {:else}
          <span class="guild-name flex-grow">Select a Guild</span>
        {/if}
        <ChevronDown class="dropdown-arrow" aria-hidden="true" />
      </button>

      {#if dropdownOpen}
        <ul
          class="dropdown-menu absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded mt-1 max-h-48 overflow-y-auto z-10"
          transition:fly="{{ y: -10, duration: 200 }}"
          role="listbox"
          tabindex="-1"
        >
          {#each $userAdminGuilds as guild}
            <li role="option" aria-selected={$currentGuild === guild}>
              <button
                on:click={() => selectGuild(guild)}
                on:keydown={(event) => handleGuildKeydown(event, guild)}
                class="dropdown-item w-full text-left p-2 cursor-pointer transition-colors duration-200 hover:bg-gray-600 flex items-center"
              >
                <img src={getGuildIconUrl(guild)} alt=""
                     class="guild-icon w-6 h-6 rounded-full mr-2 object-cover" />
                <span class="guild-name">{guild.name}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}

  <!-- Mobile Navigation -->
  <div class="md:hidden mb-4 space-y-2">
    <div class="flex gap-2">
      {#each mainTabs as tab}
        <button
          class="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 {currentSection === tab.id ? 'bg-blue-600' : ''}"
          on:click={() => currentSection = tab.id}
          aria-pressed={currentSection === tab.id}
        >
          <svelte:component this={tab.icon} size={16} />
          {tab.label}
        </button>
      {/each}
    </div>

    <button
      aria-expanded={showPreview}
      class="w-full bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-between"
      on:click={() => showPreview = !showPreview}
    >
      <span>{showPreview ? 'Show Editor' : 'Show Preview'}</span>
      <ChevronDown
        aria-hidden="true"
        class="transform transition-transform {showPreview ? 'rotate-180' : ''}"
      />
    </button>
  </div>

  <!-- Main Content -->
  <div class="flex flex-col md:flex-row gap-6">
    <!-- Editor Section -->
    <div class={`w-full md:w-1/2 ${showPreview ? 'hidden md:block' : 'block'}`}>
      <!-- Validation Errors Display -->
      {#if currentSection === 'embeds' && embeds[activeEmbedIndex]}
        {@const errors = getValidationErrors(embeds[activeEmbedIndex])}
        {#if errors.length > 0}
          <div class="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-4">
            <ul class="list-disc list-inside space-y-1">
              {#each errors as error}
                <li class="text-red-400 text-sm">{error}</li>
              {/each}
            </ul>
          </div>
        {/if}
      {/if}

      <!-- Desktop Navigation -->
      <div class="hidden md:flex gap-4 mb-4">
        {#each mainTabs as tab}
          <button
            class="flex items-center gap-2 px-4 py-2 rounded-lg {currentSection === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}"
            on:click={() => currentSection = tab.id}
            aria-pressed={currentSection === tab.id}
          >
            <svelte:component this={tab.icon} size={16} />
            {tab.label}
          </button>
        {/each}
      </div>

      <!-- Editor Content -->
      {#if currentSection === 'embeds'}
        <div class="bg-gray-800 rounded-lg overflow-hidden">
          <!-- Add a header with embed controls -->
          <div class="p-4 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h3 class="text-white font-medium">Embeds ({embeds.length}/10)</h3>
              <button
                class="px-3 py-1 rounded bg-green-600 hover:bg-green-500 flex items-center gap-1 text-white"
                on:click={addEmbed}
                disabled={embeds.length >= 10}
                aria-label="Add new embed"
              >
                <Plus size={14} />
                Add Embed
              </button>
            </div>
            {#if embeds.length > 1}
              <button
                class="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white"
                on:click={() => removeEmbed(activeEmbedIndex)}
                aria-label="Remove current embed"
              >
                <X size={14} />
                Remove
              </button>
            {/if}
          </div>

          <!-- Embed Navigation -->
          {#if embeds.length > 1}
            <div class="flex gap-2 p-2 bg-gray-900 border-b border-gray-700 overflow-x-auto">
              {#each embeds as _, index}
                <button
                  class="px-3 py-1 rounded {activeEmbedIndex === index ? 'bg-blue-600' : 'bg-gray-700'} text-white"
                  on:click={() => activeEmbedIndex = index}
                  aria-label="Switch to embed {index + 1}"
                  aria-current={activeEmbedIndex === index}
                >
                  Embed {index + 1}
                </button>
              {/each}
            </div>
          {/if}

          <!-- Tab Navigation -->
          <div class="flex border-b border-gray-700 overflow-x-auto">
            {#each editorTabs as tab}
              <button
                class="px-4 py-2 text-sm font-medium whitespace-nowrap {activeTab === tab.id ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'} transition-colors flex items-center gap-2"
                on:click={() => activeTab = tab.id}
                aria-pressed={activeTab === tab.id}
              >
                <svelte:component this={tab.icon} size={16} />
                {tab.label}
              </button>
            {/each}
          </div>

          <!-- Tab Content -->
          <div class="p-4">
            {#if activeTab === 'content'}
              <div class="space-y-4">
                <!-- Embed Title -->
                <div>
                  <label for="embed-title" class="block text-sm font-medium text-gray-200 mb-2">
                    Embed Title
                  </label>
                  <input
                    id="embed-title"
                    type="text"
                    bind:value={embeds[activeEmbedIndex].title}
                    class="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter title"
                    on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'title')}
                  />
                  <input
                    id="embed-url"
                    type="text"
                    bind:value={embeds[activeEmbedIndex].url}
                    class="w-full bg-gray-700 text-white rounded-lg p-3 mt-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Title URL (optional)"
                    on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'url')}
                  />
                </div>

                <!-- Embed Description -->
                <div>
                  <label for="embed-description" class="block text-sm font-medium text-gray-200 mb-2">
                    Embed Description
                  </label>
                  <textarea
                    id="embed-description"
                    bind:value={embeds[activeEmbedIndex].description}
                    class="w-full bg-gray-700 text-white rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter description"
                    on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'description')}
                  />
                </div>
              </div>
            {/if}

            {#if activeTab === 'appearance'}
              <div class="space-y-4">
                <!-- Color Picker -->
                <div>
                  <label for="embed-color" class="block text-sm font-medium text-gray-200 mb-2">
                    Embed Color
                  </label>
                  <div class="flex items-center space-x-2">
                    <input
                      id="embed-color"
                      type="color"
                      bind:value={embeds[activeEmbedIndex].color}
                      class="h-10 w-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      bind:value={embeds[activeEmbedIndex].color}
                      class="bg-gray-700 text-white rounded-lg p-2 w-32 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      aria-label="Color hex value"
                    />
                  </div>
                </div>

                <!-- Author Settings -->
                <div>
                  <h4 class="text-sm font-medium text-gray-200 mb-2">Author</h4>
                  <div class="space-y-2">
                    <input
                      type="text"
                      bind:value={embeds[activeEmbedIndex].author.name}
                      class="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Author name"
                      on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'author-name')}
                    />
                    <input
                      type="text"
                      bind:value={embeds[activeEmbedIndex].author.url}
                      class="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Author URL"
                      on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'author-url')}
                    />
                    <input
                      type="text"
                      bind:value={embeds[activeEmbedIndex].author.icon_url}
                      class="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Author icon URL"
                      on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'author-icon')}
                    />
                  </div>
                </div>

                <!-- Footer Settings -->
                <div>
                  <h4 class="text-sm font-medium text-gray-200 mb-2">Footer</h4>
                  <div class="space-y-2">
                    <input
                      type="text"
                      bind:value={embeds[activeEmbedIndex].footer.text}
                      class="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Footer text"
                      on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'footer-text')}
                    />
                    <input
                      type="text"
                      bind:value={embeds[activeEmbedIndex].footer.icon_url}
                      class="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Footer icon URL"
                      on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'footer-icon')}
                    />
                  </div>
                </div>
              </div>
            {/if}
            {#if activeTab === 'fields'}
              <div class="space-y-4">
                <button
                  class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  on:click={() => addField(activeEmbedIndex)}
                  disabled={embeds[activeEmbedIndex].fields.length >= 25}
                >
                  <Plus size={16} />
                  Add Field
                </button>

                {#each embeds[activeEmbedIndex].fields as field, fieldIndex}
                  <div class="bg-gray-700 p-4 rounded-lg space-y-2 relative">
                    <button
                      class="absolute top-2 right-2 text-gray-400 hover:text-red-500 focus:outline-none focus:text-red-500"
                      on:click={() => removeField(activeEmbedIndex, fieldIndex)}
                      aria-label="Remove field"
                    >
                      <X size={16} />
                    </button>

                    <input
                      type="text"
                      bind:value={field.name}
                      class="w-full bg-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Field name"
                      on:keydown={(e) => handleKeydown(e, activeEmbedIndex, `field-${fieldIndex}-name`)}
                    />
                    <textarea
                      bind:value={field.value}
                      class="w-full bg-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Field value"
                      rows="3"
                      on:keydown={(e) => handleKeydown(e, activeEmbedIndex, `field-${fieldIndex}-value`)}
                    />
                    <label class="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        bind:checked={field.inline}
                        class="form-checkbox h-4 w-4 text-blue-500 rounded"
                      />
                      <span class="text-sm text-gray-200">Inline field</span>
                    </label>
                  </div>
                {/each}
              </div>
            {/if}

            {#if activeTab === 'media'}
              <div class="space-y-4">
                <div>
                  <label for="thumbnail-url" class="block text-sm font-medium text-gray-200 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    id="thumbnail-url"
                    type="text"
                    bind:value={embeds[activeEmbedIndex].thumbnail.url}
                    class="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter thumbnail URL"
                    on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'thumbnail')}
                  />
                </div>

                <div>
                  <label for="image-url" class="block text-sm font-medium text-gray-200 mb-2">
                    Image URL
                  </label>
                  <input
                    id="image-url"
                    type="text"
                    bind:value={embeds[activeEmbedIndex].image.url}
                    class="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter image URL"
                    on:keydown={(e) => handleKeydown(e, activeEmbedIndex, 'image')}
                  />
                </div>
              </div>
            {/if}
          </div>
        </div>
      {:else if currentSection === 'components'}
        <!-- Component Editor -->
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-200">Components</h3>
            <button
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              on:click={() => showAddComponent = true}
              disabled={totalComponents >= 25}
            >
              <Plus size={16} />
              Add Component
            </button>
          </div>

          <div class="space-y-4">
            {#each components as component}
              <div class="bg-gray-700 p-4 rounded-lg">
                <div class="flex justify-between items-center mb-4">
                  <span class="text-white font-medium">
                    {component.isSelect ? 'Select Menu' : 'Button'}
                  </span>
                  <div class="flex gap-2">
                    <button
                      class="text-blue-400 hover:text-blue-300"
                      on:click={() => startEditingComponent(component)}
                    >
                      Edit
                    </button>
                    <button
                      class="text-red-400 hover:text-red-300"
                      on:click={() => removeComponent(component.componentKey)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div class="text-gray-300">
                  <p>Label: {component.displayName}</p>
                  {#if component.isSelect}
                    <p>Options: {component.options.length}</p>
                    {#each component.options as option}
                      {#if !option.id}
                        <p class="text-red-500">Option "{option.name}" has no trigger selected</p>
                      {/if}
                      {#if !option.description || option.description.trim() === ''}
                        <p class="text-red-500">Option "{option.name}" is missing a description</p>
                      {/if}
                    {/each}
                  {:else}
                    <p>Style: {getButtonStyleName(component.style)}</p>
                    {#if !component.id}
                      <p class="text-red-500">Trigger not selected for button</p>
                    {/if}
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Preview Section -->
    <div class={`w-full md:w-1/2 ${!showPreview ? 'hidden md:block' : 'block'}`}>
      <div class="bg-gray-800 rounded-lg p-4">
        <h2 class="text-lg font-medium text-gray-200 mb-4">Preview</h2>

        <!-- Message Content Preview -->
        {#if content}
          <div class="text-white mb-4">
            {@html parseMarkdown(content)}
          </div>
        {/if}

        <!-- Embeds Preview -->
        {#each embeds as embed}
          <div class="rounded-lg overflow-hidden mb-4" style="border-left: 4px solid {embed.color};">
            <div class="bg-[#2F3136] p-4 relative">
              <!-- Author -->
              {#if embed.author.name}
                <div class="flex items-center mb-2">
                  {#if embed.author.icon_url}
                    <img src={embed.author.icon_url} alt="" class="w-6 h-6 rounded-full mr-2" />
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
                  <img src={embed.image.url} alt="Embed image" class="max-w-full h-auto rounded-lg" />
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
                    <img src={embed.footer.icon_url} alt="" class="w-5 h-5 rounded-full mr-2" />
                  {/if}
                  <span>{embed.footer.text}</span>
                </div>
              {/if}
            </div>
          </div>
        {/each}

        {#if components.length > 0}
          <div class="mt-4 space-y-2">
            {#each getComponentRows(components) as row}
              <div class="grid grid-cols-5 gap-2">
                {#each row as component}
                  {#if component.isSelect}
                    <div class="col-span-5">
                      <div
                        class="select-container border border-transparent bg-[#2F3136] text-white font-medium rounded cursor-pointer box-border grid grid-cols-[1fr,auto] items-center"
                        role="button"
                        aria-expanded="false"
                        aria-haspopup="listbox"
                        tabindex="0"
                      >
                        <span class="placeholder px-3 py-2">{component.displayName || "Select an option..."}</span>
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
                      </div>

                      <!-- Options Popout (can be conditionally rendered based on state) -->
                      <div
                        class="options-popout bg-[#2F3136] border border-[#202225] mt-1 rounded-b overflow-hidden"
                        role="listbox"
                        style="display: none;"
                      >
                        {#each component.options as option}
                          <div
                            class="option px-3 py-2 hover:bg-[#36393f] cursor-pointer"
                            role="option"
                            aria-selected="false"
                            aria-disabled="false"
                          >
                            <div class="option-content">
                              <div class="label-container">
                                <strong class="label text-white">{option.name}</strong>
                                {#if option.description}
                                  <span class="description block text-[#B9BBBE] text-sm">{option.description}</span>
                                {/if}
                              </div>
                            </div>
                          </div>
                        {/each}
                      </div>
                    </div>
                  {:else}
                    <!-- Button -->
                    <button
                      class="relative discord-button button-content flex justify-center items-center box-border border-0 rounded px-4 py-[2px] min-h-[32px] text-sm font-medium leading-[16px] transition-colors duration-200 select-none {getButtonColorClass(component.style)}"
                      disabled
                    >
                      <div class="flex items-center justify-center">
                        <div class="flex items-center gap-2">
                          {#if component.emoji}
            <span class="emoji w-[1.2em] h-[1.2em] inline-flex items-center justify-center align-[-0.1em]">
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
    </div>
  </div>

  <!-- Copy JSON Button -->
  <div class="flex justify-end mt-4">
    <button
      aria-label={jsonCopied ? 'JSON copied!' : 'Copy JSON'}
      class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600 flex items-center gap-2"
      disabled={!canCopyJson}
      on:click={copyJson}
    >
      <Copy size={20} />
      {jsonCopied ? 'Copied!' : 'Copy JSON'}
    </button>
  </div>
</div>

<!-- Modals -->
<!-- Add Component Modal -->
{#if showAddComponent}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    on:click|self={() => showAddComponent = false}
    role="dialog"
    aria-labelledby="add-component-title"
  >
    <div class="bg-gray-800 p-6 rounded-lg w-full max-w-md">
      <h2 id="add-component-title" class="text-xl font-bold mb-4">Add Component</h2>
      <div class="space-y-2">
        <button
          class="w-full bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
          on:click={() => {
            addComponent('button');
            showAddComponent = false;
          }}
        >
          Button
        </button>
        <button
          class="w-full bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
          on:click={() => {
            addComponent('select');
            showAddComponent = false;
          }}
        >
          Select Menu
        </button>
      </div>
    </div>
  </div>
{/if}
<!-- Edit Component Modal -->
{#if editingComponent}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    on:click|self={() => editingComponent = null}
    role="dialog"
    aria-labelledby="edit-component-title"
  >
    <div class="bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
      <h2 id="edit-component-title" class="text-xl font-bold mb-4">
        Edit {editingComponent.isSelect ? 'Select Menu' : 'Button'}
      </h2>

      <div class="space-y-4">
        <!-- Common Fields -->
        {#if !editingComponent.isSelect}
          <!-- Button Specific Fields -->
          <div>
            <label class="block text-sm font-medium text-gray-200 mb-2">
              Display Name
            </label>
            <input
              type="text"
              bind:value={editingComponent.displayName}
              maxlength="80"
              class="w-full bg-gray-700 text-white p-2 rounded"
              placeholder="Display name"
              on:input={() => {
                if (editingComponent.displayName.length > 80) {
                  editingComponent.displayName = editingComponent.displayName.slice(0, 80);
                }
              }}
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-200 mb-2">
              Style
            </label>
            <select
              bind:value={editingComponent.style}
              class="w-full bg-gray-700 text-white p-2 rounded"
            >
              <option value={1}>Primary</option>
              <option value={2}>Secondary</option>
              <option value={3}>Success</option>
              <option value={4}>Danger</option>
              <option value={5}>Link</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-200 mb-2">
              Emoji (optional)
            </label>
            <input
              type="text"
              bind:value={editingComponent.emoji}
              class="w-full bg-gray-700 text-white p-2 rounded"
              placeholder="Emoji"
            />
          </div>

          {#if editingComponent.style === 5}
            <div>
              <label class="block text-sm font-medium text-gray-200 mb-2">
                URL
              </label>
              <input
                type="text"
                bind:value={editingComponent.url}
                class="w-full bg-gray-700 text-white p-2 rounded"
                placeholder="https://"
              />
            </div>
          {:else}
            <button
              class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              on:click={() => {
                currentTriggerComponent = editingComponent;
                currentEditingOptionIndex = null;
                showTriggerSelect = true;
              }}
            >
              Select Trigger
            </button>
          {/if}
        {:else}
          <!-- Select Menu Fields -->
          <div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-200 mb-2">
                Placeholder Text
              </label>
              <input
                type="text"
                bind:value={editingComponent.displayName}
                maxlength="150"
                class="w-full bg-gray-700 text-white p-2 rounded"
                placeholder="Placeholder text when nothing is selected (optional)"
                on:input={() => {
                  if (editingComponent.displayName.length > 150) {
                    editingComponent.displayName = editingComponent.displayName.slice(0, 150);
                  }
                }}
              />
              {#if editingComponent.displayName && editingComponent.displayName.length > 150}
                <p class="text-red-500">Placeholder text cannot exceed 150 characters.</p>
              {/if}
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-200 mb-2">
                Options
              </label>
              <div class="space-y-2">
                {#each editingComponent.options as option, index}
                  <div class="bg-gray-700 p-2 rounded">
                    <!-- Option Name -->
                    <input
                      type="text"
                      bind:value={option.name}
                      maxlength="100"
                      class="w-full bg-gray-600 text-white p-2 rounded mb-2"
                      placeholder="Option name"
                      on:input={() => {
                        if (option.name.length > 100) {
                          option.name = option.name.slice(0, 100);
                        }
                      }}
                    />
                    {#if option.name.length > 100}
                      <p class="text-red-500">Option name cannot exceed 100 characters.</p>
                    {/if}
                    <!-- Option Emoji -->
                    <input
                      type="text"
                      bind:value={option.emoji}
                      class="w-full bg-gray-600 text-white p-2 rounded mb-2"
                      placeholder="Option emoji (optional)"
                    />
                    <!-- Option Description -->
                    <textarea
                      bind:value={option.description}
                      maxlength="100"
                      class="w-full bg-gray-600 text-white p-2 rounded mb-2 {(!option.description || option.description.trim() === '') ? 'border border-red-500' : ''}"
                      placeholder="Option description (required)"
                      rows="2"
                      required
                      on:input={() => {
                        if (option.description.length > 100) {
                          option.description = option.description.slice(0, 100);
                        }
                      }}
                    />
                    {#if option.description.length > 100}
                      <p class="text-red-500">Option description cannot exceed 100 characters.</p>
                    {/if}

                    <!-- Validation Message -->
                    {#if !option.description || option.description.trim() === ''}
                      <p class="text-red-500">Description is required.</p>
                    {/if}
                    <!-- Select Trigger Button -->
                    <button
                      class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-2"
                      on:click={() => {
                        currentTriggerComponent = editingComponent;
                        currentEditingOptionIndex = index;
                        showTriggerSelect = true;
                      }}
                    >
                      Select Trigger
                    </button>
                    <!-- Remove Option Button -->
                    {#if editingComponent.options.length > 1}
                      <button
                        class="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                        on:click={() => {
                          editingComponent.options = editingComponent.options.filter((_, i) => i !== index);
                        }}
                      >
                        Remove Option
                      </button>
                    {/if}
                  </div>
                {/each}
              </div>

              {#if editingComponent.options.length < 25}
                <button
                  class="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
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
                >
                  Add Option
                </button>
              {/if}
            </div>
          </div>

          <!-- Min and Max Options -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-200 mb-2">
                Min Options
              </label>
              <input
                type="number"
                bind:value={editingComponent.minOptions}
                min="1"
                max={editingComponent.options.length}
                class="w-full bg-gray-700 text-white p-2 rounded"
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
              <label class="block text-sm font-medium text-gray-200 mb-2">
                Max Options
              </label>
              <input
                type="number"
                bind:value={editingComponent.maxOptions}
                min={editingComponent.minOptions}
                max={editingComponent.options.length}
                class="w-full bg-gray-700 text-white p-2 rounded"
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
        <div class="mt-4">
          {#if !editingComponent.isSelect && !editingComponent.id}
            <p class="text-red-500">Please select a trigger for this button.</p>
          {/if}

          {#if editingComponent.isSelect}
            {#each editingComponent.options as option, index}
              {#if !option.id}
                <p class="text-red-500">Option "{option.name}" is missing a trigger.</p>
              {/if}
              {#if !option.description || option.description.trim() === ''}
                <p class="text-red-500">Option "{option.name}" is missing a description.</p>
              {/if}
            {/each}
          {/if}
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="flex justify-end mt-4 space-x-2">
        <button
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          on:click={() => editingComponent = null}
        >
          Cancel
        </button>
        <button
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          on:click={() => {
            const index = components.findIndex(c => c.componentKey === editingComponent.componentKey);
            components[index] = editingComponent;
            components = [...components];
            editingComponent = null;
          }}
          disabled={
            (!editingComponent.isSelect && !editingComponent.id) ||
            (editingComponent.isSelect && editingComponent.options.some(option => !option.id || !option.description || option.description.trim() === ''))
          }
        >
          Save
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Trigger Select Modal -->
{#if showTriggerSelect}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    on:click|self={() => showTriggerSelect = false}
    role="dialog"
    aria-labelledby="select-trigger-title"
  >
    <div class="bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
      <h2 id="select-trigger-title" class="text-xl font-bold mb-4">Select Trigger</h2>

      <div class="space-y-2">
        {#if chatTriggers.length === 0}
          <p class="text-gray-400">No triggers available</p>
        {:else}
          {#each chatTriggers as trigger}
            <button
              class="w-full text-left bg-gray-700 p-3 rounded hover:bg-gray-600 transition-colors"
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
              }}
            >
              <div class="font-medium">{trigger.trigger}</div>
              <div class="text-sm text-gray-400 truncate">
                {trigger.response}
              </div>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- Placeholder Menu -->
{#if showPlaceholderMenu}
  <div
    class="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-96 w-80 overflow-hidden"
    style="top: {placeholderMenuPosition.y}px; left: {placeholderMenuPosition.x}px;"
    role="dialog"
    aria-label="Placeholder menu"
  >
    <div class="p-2 border-b border-gray-700">
      <input
        bind:this={placeholderInputRef}
        type="text"
        class="w-full bg-gray-700 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search placeholders..."
        on:input={filterPlaceholders}
        on:keydown={handlePlaceholderNavigation}
        aria-label="Search placeholders"
      />
    </div>

    <div class="overflow-y-auto max-h-80" role="listbox">
      {#each filteredPlaceholders as placeholder, index}
        <button
          class="w-full text-left p-2 hover:bg-gray-700 {index === selectedPlaceholderIndex ? 'bg-gray-600' : ''}"
          on:click={() => insertPlaceholder(placeholder)}
          role="option"
          aria-selected={index === selectedPlaceholderIndex}
        >
          <span class="font-medium text-white">{placeholder.name}</span>
          <span class="text-sm text-gray-400 block">{placeholder.description}</span>
        </button>
      {/each}
    </div>
  </div>
{/if}

<style lang="postcss">
    :global(.embed-link) {
    @apply text-[#00b0f4] no-underline;

    &:hover {
      @apply underline;
    }
  }

    :global(.markdown-content) {
        @apply text-white;
    }

    :global(.markdown-content h1) {
        @apply text-2xl font-bold my-4;
    }

    :global(.markdown-content h2) {
        @apply text-xl font-bold my-3;
    }

    :global(.markdown-content h3) {
        @apply text-lg font-bold my-2;
    }

    :global(.markdown-content p) {
        @apply my-2;
    }

    :global(.markdown-content ul) {
        @apply list-disc ml-6;
    }

    :global(.markdown-content ol) {
        @apply list-decimal ml-6;
    }

    :global(.markdown-content blockquote) {
        @apply border-l-4 border-gray-600 pl-4 my-2;
    }

    :global(.markdown-content code) {
        @apply bg-gray-800 px-2 py-1 rounded font-mono text-sm;
    }

    :global(.markdown-content pre) {
        @apply bg-gray-800 p-4 rounded overflow-x-auto my-4;
    }

    :global(.markdown-content pre code) {
        @apply bg-transparent p-0;
    }

    :global(.markdown-content a) {
        @apply text-blue-400 no-underline;

         &:hover {
      @apply underline;
    }
    }

    :global(.mention) {
        @apply bg-opacity-30 bg-blue-500 text-blue-100 rounded px-1 font-medium;
    }

    :global(.placeholder) {
        @apply bg-opacity-30 bg-blue-500 text-blue-100 rounded px-1 font-medium;
    }

    input[type="color"] {
        -webkit-appearance: none;
        @apply border-0 p-0 rounded cursor-pointer;
    }

    input[type="color"]::-webkit-color-swatch-wrapper {
        @apply p-0;
    }

    input[type="color"]::-webkit-color-swatch {
        @apply border-0 rounded;
    }

    .inline-emoji {
        @apply inline-block w-5 h-5 align-text-bottom;
    }

    .emoji {
        @apply inline-block text-xl leading-none;
    }

    ::-webkit-scrollbar {
        @apply w-2;
    }

    ::-webkit-scrollbar-track {
        @apply bg-gray-800;
    }

    ::-webkit-scrollbar-thumb {
        @apply bg-gray-600 rounded;

         &:hover {
      @apply bg-gray-500;
    }
    }


    select:disabled {
        @apply opacity-100 cursor-default appearance-none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 16px;
        padding-right: 32px;
    }

    .emoji {
        @apply inline-flex items-center justify-center;
        font-size: 1.2em;
        line-height: 1;
        vertical-align: -0.1em;
    }

		.discord-button {
			padding: 2px 16px;
			height: 32px;
		}

    button:disabled {
        @apply opacity-100 cursor-default;
    }

    .emoji {
        @apply inline-flex items-center justify-center;
        font-size: 1.2em;
        line-height: 1;
        vertical-align: -0.1em;
    }

    button {
        @apply transition-colors duration-200;
    }

    button:focus {
        @apply outline-none ring-2 ring-white ring-opacity-30;
    }

    .button-content {
        @apply flex items-center justify-center gap-2;
    }

		.select-container {
    transition: border-color 0.2s ease-in-out;
  }

  .select-container:hover {
    @apply border-[#040405];
  }

  .select-container:focus {
    @apply outline-none border-[#040405];
  }

  .options-popout {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.24);
  }

  .option:hover .label {
    @apply text-white;
  }

  .option:hover .description {
    @apply text-[#DCDDDE];
  }

  /* Match Discord's scrollbar styling */
  .options-popout {
    scrollbar-width: thin;
    scrollbar-color: #202225 transparent;
  }

  .options-popout::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .options-popout::-webkit-scrollbar-thumb {
    background-color: #202225;
    border-radius: 4px;
  }

  .options-popout::-webkit-scrollbar-track {
    background-color: transparent;
  }

  /* Ensure proper text truncation */
  .label, .description {
    @apply truncate;
  }

  /* Proper spacing for options with emojis */
  .option-content {
    @apply flex items-center gap-2;
  }

  .emoji {
    @apply flex-shrink-0;
  }
</style>