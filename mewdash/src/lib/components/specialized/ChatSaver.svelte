<!-- lib/components/ChatSaver.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { fade } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import {
    Calendar,
    Clock,
    Download,
    Edit,
    ExternalLink,
    Folder,
    Hash,
    Link,
    MessageSquare,
    Save,
    Search,
    Trash2,
    X
  } from "lucide-svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { logger } from "$lib/logger";
  import { goto } from "$app/navigation";
  import { loadingStore } from "$lib/stores/loadingStore";

  export let data: { user?: { id: string } };

  interface Channel {
    id: string;
    name: string;
  }

  interface GuildMember {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  }

  interface MessageAttachment {
    url: string;
    proxyUrl: string;
    filename: string;
    fileSize: number;
  }

  interface MessageEmbed {
    type: string;
    title: string;
    description: string;
    url: string;
    thumbnail: string | null;
    author: {
      name: string;
      iconUrl: string;
    } | null;
  }

  interface MessageAuthor {
    id: string;
    username: string;
    avatarUrl: string;
  }

  interface Message {
    id: string;
    content: string;
    author: MessageAuthor;
    timestamp: string;
    attachments: MessageAttachment[];
    embeds: MessageEmbed[];
  }

  interface SavedLog {
    id: string;
    channelId: string;
    channelName: string;
    name: string;
    timestamp: string;
    createdBy: string;
    messageCount: number;
  }

  let channels: Channel[] = [];
  let selectedChannelId: string = "";
  
  // Layout state
  let activeTab = "fetch";
  
  const tabs = [
    { id: "fetch", label: "Fetch Messages", icon: Search },
    { id: "saved", label: "Saved Logs", icon: Folder },
    { id: "view", label: "View Messages", icon: MessageSquare }
  ];
  let timeAmount: number = 1;
  let timeUnit: "minutes" | "hours" | "days" = "hours";
  let messages: Message[] = [];
  let loading: boolean = false;
  let showNotification: boolean = false;
  let notificationMessage: string = "";
  let notificationType: "success" | "error" = "success";
  let savedLogs: SavedLog[] = [];
  let currentLogId: string | null = null;
  let editingLogName: string | false = false;
  let newLogName: string = "";
  let guildMembers: GuildMember[] = [];
  let guildChannels: Channel[] = [];

  // Time unit options
  const timeUnits = [
    { value: "minutes", label: "Minutes" },
    { value: "hours", label: "Hours" },
    { value: "days", label: "Days" }
  ];

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    await Promise.all([
      loadChannels(),
      loadGuildMembers(),
      loadSavedLogs()
    ]);
  });

  $: if ($currentGuild) {
    loadChannels();
    loadGuildMembers();
    loadSavedLogs();
  }

  function showNotificationMessage(message: string, type: "success" | "error" = "success"): void {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function loadChannels(): Promise<void> {
    return await loadingStore.wrap("load-channels", async () => {
      try {
        if (!$currentGuild?.id) return;
        channels = await api.getGuildTextChannels($currentGuild.id);
        guildChannels = channels;
      } catch (err) {
        logger.error("Failed to load channels:", err);
        showNotificationMessage("Failed to load channels", "error");
      }
    }, "api", "Loading channels...");
  }

  async function loadGuildMembers(): Promise<void> {
    try {
      if (!$currentGuild?.id) return;
      guildMembers = await api.getGuildMembers($currentGuild.id);
    } catch (err) {
      logger.error("Failed to load guild members:", err);
      // Not showing error notification as this is not critical
    }
  }

  function safelyParseDate(dateString: string): Date {
    // Try to safely parse the date
    try {
      const parsedDate = new Date(dateString);

      // Check if the date is valid
      if (isNaN(parsedDate.getTime())) {
        console.warn("Invalid date string:", dateString);
        return new Date(); // Return current date as fallback
      }

      return parsedDate;
    } catch (err) {
      console.warn("Error parsing date:", err);
      return new Date(); // Return current date as fallback
    }
  }

  async function loadSavedLogs(): Promise<void> {
    try {
      if (!$currentGuild?.id) return;
      savedLogs = await api.getChatLogs($currentGuild.id);
    } catch (err) {
      logger.error("Failed to load saved logs:", err);
      showNotificationMessage("Failed to load saved logs", "error");
    }
  }

  function calculateAfterDate(): string {
    const now = new Date();
    let afterDate = new Date(now);

    switch (timeUnit) {
      case "minutes":
        afterDate.setMinutes(now.getMinutes() - timeAmount);
        break;
      case "hours":
        afterDate.setHours(now.getHours() - timeAmount);
        break;
      case "days":
        afterDate.setDate(now.getDate() - timeAmount);
        break;
    }

    return afterDate.toISOString();
  }

  async function fetchMessages(): Promise<void> {
    if (!selectedChannelId) {
      showNotificationMessage("Please select a channel", "error");
      return;
    }

    if (timeAmount <= 0) {
      showNotificationMessage("Time amount must be greater than 0", "error");
      return;
    }

    if (timeUnit === "days" && timeAmount > 14) {
      showNotificationMessage("Maximum time for days is 3", "error");
      return;
    }

    return await loadingStore.wrap("fetch-messages", async () => {
      loading = true;
      currentLogId = null; // Reset current log when fetching new messages

      try {
        if (!$currentGuild?.id) {
          loading = false;
          return;
        }

        const afterDate = calculateAfterDate();
        messages = await api.getChatMessages(
          $currentGuild.id,
          BigInt(selectedChannelId),
          afterDate
        );

        if (messages.length === 0) {
          showNotificationMessage("No messages found in the selected time range", "error");
        } else {
          activeTab = "view"; // Switch to view tab after fetching
        }

      } catch (err) {
        logger.error("Failed to fetch messages:", err);
        showNotificationMessage("Failed to fetch messages", "error");
      } finally {
        loading = false;
      }
    }, "api", "Fetching messages...");
  }

  function formatTimestamp(timestamp: string): string {
    const date = safelyParseDate(timestamp);
    try {
      return new Intl.DateTimeFormat("default", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true
      }).format(date);
    } catch {
      // Fallback
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
  }

  function sanitizeText(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function parseDiscordMarkdown(text: string): string {
    if (!text) return "";

    // First sanitize the text to prevent HTML injection
    text = sanitizeText(text);

    // Links with text [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
      "<a href=\"$2\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color: var(--color-primary);\">$1</a>");

    // Bold
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    // Italic
    text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    text = text.replace(/_([^_]+)_/g, "<em>$1</em>");

    // Strikethrough
    text = text.replace(/~~([^~]+)~~/g, "<del>$1</del>");

    // Code blocks (multiline)
    text = text.replace(/```(?:(\w+)\n)?([^`]+)```/g, (match, language, code) => {
      return `<pre class="code-block ${language || ""}"><code>${code}</code></pre>`;
    });

    // Inline code
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

    // User mentions <@123456789>
    text = text.replace(/<@!?(\d+)>/g, (match, userId) => {
      const member = guildMembers.find(m => m.id === userId);
      if (member) {
        return `<span class="mention user">@${member.username}</span>`;
      }
      return `<span class="mention user">@Unknown User</span>`;
    });

    // Channel mentions <#123456789>
    text = text.replace(/<#(\d+)>/g, (match, channelId) => {
      const channel = guildChannels.find(c => c.id === channelId);
      if (channel) {
        return `<span class="mention channel">#${channel.name}</span>`;
      }
      return `<span class="mention channel">#unknown-channel</span>`;
    });

    // Role mentions <@&123456789>
    text = text.replace(/<@&(\d+)>/g, "<span class=\"mention role\">@Role</span>");

    // Plain URLs (not already in a link tag)
    text = text.replace(/(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g,
      "<a href=\"$1\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color: var(--color-primary);\">$1</a>");

    // Line breaks
    text = text.replace(/\n/g, "<br>");

    return text;
  }

  function getFileSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  function isImageUrl(url: string): boolean {
    return /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
  }

  function getSelectedChannelName(): string {
    if (!selectedChannelId) return "";
    const channel = channels.find(c => c.id === selectedChannelId);
    return channel ? channel.name : "";
  }

  function groupMessagesByAuthor(messages: Message[]): Message[][] {
    if (!messages || messages.length === 0) return [];

    // Safety check - make sure we have valid messages
    const validMessages = messages.filter(msg =>
      msg && msg.author && typeof msg.author.id !== "undefined"
    );

    console.log(validMessages);

    if (validMessages.length === 0) return [];

    const MAX_TIME_BETWEEN_MESSAGES = 5 * 60 * 1000; // 5 minutes in milliseconds
    const result: Message[][] = [];
    let currentGroup: Message[] = [validMessages[0]];

    for (let i = 1; i < validMessages.length; i++) {
      const currentMessage = validMessages[i];
      const previousMessage = validMessages[i - 1];

      // Double-check that we have valid messages with authors
      if (!currentMessage.author || !previousMessage.author) {
        // Start a new group for messages without proper author info
        result.push(currentGroup);
        currentGroup = [currentMessage];
        continue;
      }

      // Check if the current message is from the same author as the previous one
      // and the time difference is less than MAX_TIME_BETWEEN_MESSAGES
      const sameAuthor = currentMessage.author.id === previousMessage.author.id;
      const timeDiff = safelyParseDate(currentMessage.timestamp).getTime() -
        safelyParseDate(previousMessage.timestamp).getTime();

      if (sameAuthor && timeDiff < MAX_TIME_BETWEEN_MESSAGES) {
        // Add to the current group
        currentGroup.push(currentMessage);
      } else {
        // Start a new group
        result.push(currentGroup);
        currentGroup = [currentMessage];
      }
    }

    // Don't forget to add the last group
    if (currentGroup.length > 0) {
      result.push(currentGroup);
    }

    return result;
  }

  async function saveLog(): Promise<void> {
    if (messages.length === 0) return;

    const channelName = getSelectedChannelName();
    const logName = `${channelName} - ${new Date().toLocaleDateString()}`;

    try {
      if (!$currentGuild?.id || !data.user?.id) {
        showNotificationMessage("Missing guild or user information", "error");
        return;
      }

      // Use the API to save to PostgreSQL database
      const result = await api.saveChatLog($currentGuild.id, {
        channelId: BigInt(selectedChannelId),
        name: logName,
        createdBy: BigInt(data.user.id),
        messages: messages.map(msg => ({
          id: msg.id,
          content: msg.content || "",
          author: {
            id: msg.author.id,
            username: msg.author.username,
            avatarUrl: msg.author.avatarUrl
          },
          timestamp: msg.timestamp,
          attachments: (msg.attachments || []).map(att => ({
            url: att.url,
            proxyUrl: att.proxyUrl || att.url,
            filename: att.filename,
            fileSize: att.fileSize
          })),
          embeds: (msg.embeds || []).map(embed => ({
            type: embed.type || "Rich",
            title: embed.title || null,
            description: embed.description || null,
            url: embed.url || null,
            thumbnail: embed.thumbnail || null,
            author: embed.author ? {
              name: embed.author.name,
              iconUrl: embed.author.iconUrl || null
            } : null
          }))
        }))
      });

      showNotificationMessage("Log saved successfully");
      // Reload logs after saving
      await loadSavedLogs();
      currentLogId = result.id;

    } catch (err) {
      logger.error("Failed to save log:", err);
      showNotificationMessage("Failed to save log", "error");
    }
  }

  async function loadLog(logId: string): Promise<void> {
    try {
      if (!$currentGuild?.id) return;

      const log = await api.getChatLog($currentGuild.id, logId);

      if (log) {
        messages = log.messages;
        currentLogId = log.id;
        selectedChannelId = log.channelId.toString();
      }
    } catch (err) {
      logger.error("Failed to load log:", err);
      showNotificationMessage("Failed to load log", "error");
    }
  }

  async function deleteLog(logId: string): Promise<void> {
    try {
      if (!$currentGuild?.id) return;

      await api.deleteChatLog($currentGuild.id, logId);
      showNotificationMessage("Log deleted successfully");

      // Reload logs
      await loadSavedLogs();

      if (currentLogId === logId) {
        messages = [];
        currentLogId = null;
      }
    } catch (err) {
      logger.error("Failed to delete log:", err);
      showNotificationMessage("Failed to delete log", "error");
    }
  }

  function startEditingLogName(logId: string): void {
    const log = savedLogs.find(l => l.id === logId);
    if (log) {
      newLogName = log.name;
      editingLogName = logId;
    }
  }

  async function saveLogName(): Promise<void> {
    if (!editingLogName || !newLogName.trim()) {
      editingLogName = false;
      return;
    }

    try {
      if (!$currentGuild?.id) return;

      await api.updateChatLogName($currentGuild.id, editingLogName, newLogName.trim());
      showNotificationMessage("Log renamed successfully");

      // Reload logs
      await loadSavedLogs();
    } catch (err) {
      logger.error("Failed to rename log:", err);
      showNotificationMessage("Failed to rename log", "error");
    }

    editingLogName = false;
  }

  function exportAsHTML(): void {
    if (messages.length === 0) return;

    const channelName = getSelectedChannelName();
    const startDate = calculateAfterDate();

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat Log - #${channelName} - ${$currentGuild?.name || ""}</title>
  <style>
    :root {
      --primary-color: ${$colorStore.primary};
      --background-color: #36393f;
      --text-color: #ffffff;
      --secondary-text: #b9bbbe;
      --border-color: #4f545c;
    }
    body {
      font-family: 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: var(--background-color);
      color: var(--text-color);
      margin: 0;
      padding: 0;
    }
    header {
      background-color: rgba(0, 0, 0, 0.3);
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid var(--border-color);
    }
    h1 {
      margin: 0;
      color: var(--primary-color);
    }
    .guild-name {
      font-size: 18px;
      margin-top: 5px;
    }
    .timestamp {
      color: var(--secondary-text);
      margin-top: 10px;
      font-size: 14px;
    }
    .messages {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .day-divider {
      text-align: center;
      margin: 30px 0 15px;
      position: relative;
      color: var(--secondary-text);
      font-size: 12px;
    }
    .day-divider::before {
      content: '';
      position: absolute;
      height: 1px;
      width: 100%;
      background-color: var(--border-color);
      top: 50%;
      left: 0;
      z-index: -1;
    }
    .day-divider span {
      background-color: var(--background-color);
      padding: 0 10px;
    }
    .message {
      display: flex;
      margin-bottom: 16px;
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 16px;
    }
    .message-content {
      flex: 1;
    }
    .message-header {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
    }
    .username {
      font-weight: bold;
      margin-right: 8px;
    }
    .timestamp {
      color: var(--secondary-text);
      font-size: 12px;
    }
    .content {
      word-wrap: break-word;
      white-space: pre-wrap;
    }
    .attachments {
      margin-top: 8px;
    }
    .image-attachment img {
      max-width: 400px;
      max-height: 300px;
      border-radius: 4px;
    }
    .file-attachment {
      background-color: rgba(0, 0, 0, 0.2);
      padding: 8px 12px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 4px;
    }
    .file-attachment a {
      color: var(--primary-color);
      text-decoration: none;
    }
    .embeds {
      margin-top: 8px;
    }
    .embed {
      border-left: 4px solid var(--primary-color);
      background-color: rgba(0, 0, 0, 0.2);
      padding: 8px 12px;
      border-radius: 0 4px 4px 0;
      margin-top: 4px;
    }
    .embed-title {
      font-weight: bold;
      margin-bottom: 4px;
    }
    .embed-title a {
      color: var(--primary-color);
      text-decoration: none;
    }
    .embed-author {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    .embed-author img {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      margin-right: 8px;
    }
    .embed-description {
      word-wrap: break-word;
      white-space: pre-wrap;
      margin-bottom: 8px;
    }
    .embed-thumbnail img {
      max-width: 80px;
      max-height: 80px;
      border-radius: 4px;
    }
    .mention {
      background-color: rgba(88, 101, 242, 0.3);
      color: #c9cdfb;
      border-radius: 3px;
      padding: 0 2px;
    }
    .mention.user, .mention.role {
      color: #c9cdfb;
    }
    .mention.channel {
      color: #8e9297;
    }
    .code-block {
      background-color: #2f3136;
      border-radius: 3px;
      padding: 8px;
      font-family: "Consolas", "Courier New", Courier, monospace;
      overflow-x: auto;
    }
    code {
      background-color: #2f3136;
      border-radius: 3px;
      padding: 0 4px;
      font-family: "Consolas", "Courier New", Courier, monospace;
    }
    footer {
      text-align: center;
      padding: 20px;
      color: var(--secondary-text);
      border-top: 1px solid var(--border-color);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <header>
    <h1>#${channelName}</h1>
    <div class="guild-name">${$currentGuild?.name || ""}</div>
    <div class="timestamp">Messages from ${new Date(startDate).toLocaleString()} to ${new Date().toLocaleString()}</div>
  </header>
  <main class="messages">`;

    // Group messages by day
    const groupedMessages: Record<string, Message[]> = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    });

    // Get dates ordered chronologically
    const orderedDates = Object.keys(groupedMessages).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    // Process the message groups
    orderedDates.forEach(day => {
      html += `
    <div class="day-divider"><span>${new Date(day).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })}</span></div>`;

      // Group messages by author within each day
      const messageGroups = groupMessagesByAuthor(groupedMessages[day]);

      messageGroups.forEach(group => {
        const firstMessage = group[0];

        html += `
    <div class="message">
      <img class="avatar" src="${firstMessage.author.avatarUrl}" alt="${firstMessage.author.username}">
      <div class="message-content">
        <div class="message-header">
          <span class="username">${firstMessage.author.username}</span>
          <span class="timestamp">${safelyParseDate(firstMessage.timestamp).toLocaleTimeString()}</span>
        </div>`;

        // Process each message in the group
        group.forEach((message, index) => {
          if (index > 0) {
            html += `
        <div class="timestamp" style="margin-top: 8px; margin-bottom: 2px;">${new Date(message.timestamp).toLocaleTimeString()}</div>`;
          }

          if (message.content) {
            html += `
        <div class="content">${parseDiscordMarkdown(message.content)}</div>`;
          }

          // Process attachments
          if (message.attachments && message.attachments.length > 0) {
            html += `
        <div class="attachments">`;
            message.attachments.forEach(attachment => {
              if (isImageUrl(attachment.url)) {
                html += `
          <div class="image-attachment"><a href="${attachment.url}" target="_blank"><img src="${attachment.proxyUrl || attachment.url}" alt="${attachment.filename}"></a></div>`;
              } else {
                html += `
          <div class="file-attachment"><a href="${attachment.url}" target="_blank">${attachment.filename} (${getFileSize(attachment.fileSize)})</a></div>`;
              }
            });
            html += `
        </div>`;
          }

          // Process embeds
          if (message.embeds && message.embeds.length > 0) {
            html += `
        <div class="embeds">`;
            message.embeds.forEach(embed => {
              html += `
          <div class="embed">`;

              // Handle embed thumbnail (positioned at the right)
              if (embed.thumbnail) {
                html += `
            <div class="embed-thumbnail" style="float: right; margin-left: 10px; margin-top: -5px;"><img src="${embed.thumbnail}" alt="Thumbnail"></div>`;
              }

              // Process author
              if (embed.author) {
                html += `
            <div class="embed-author">`;
                if (embed.author.iconUrl) {
                  html += `
              <img src="${embed.author.iconUrl}" alt="Author icon">`;
                }
                html += `
              <span>${sanitizeText(embed.author.name)}</span>
            </div>`;
              }

              // Process title
              if (embed.title) {
                if (embed.url) {
                  html += `
            <div class="embed-title"><a href="${embed.url}" target="_blank">${parseDiscordMarkdown(embed.title)}</a></div>`;
                } else {
                  html += `
            <div class="embed-title">${parseDiscordMarkdown(embed.title)}</div>`;
                }
              }

              // Process description
              if (embed.description) {
                html += `
            <div class="embed-description">${parseDiscordMarkdown(embed.description)}</div>`;
              }

              // Close embed div
              html += `
          </div>`;
            });
            html += `
        </div>`;
          }

          // Add separator between messages in the same group (except the last one)
          if (index < group.length - 1) {
            html += `
        <hr style="border: 0; border-top: 1px dashed var(--border-color); margin: 8px 0;">`;
          }
        });

        // Close message content and message divs
        html += `
      </div>
    </div>`;
      });
    });

    html += `
  </main>
  <footer>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </footer>
</body>
</html>`;

    // Create a blob and download
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const filename = `${channelName}-${new Date().toISOString().slice(0, 10)}.html`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

</script>

<DashboardPageLayout 
  title="Chat Saver" 
  subtitle="Save and view chat logs from your Discord channels" 
  icon={MessageSquare}
  guildName={$currentGuild?.name || "Dashboard"}
  tabs={tabs}
  bind:activeTab
  on:tabChange={(e) => activeTab = e.detail.tabId}
>
  <svelte:fragment slot="status-messages">
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}
  </svelte:fragment>

  {#if activeTab === 'fetch'}
    <!-- Fetch Messages Tab -->
    <section
      class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="flex items-center gap-3 mb-6">
        <div
          class="p-3 rounded-xl"
          style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                 color: {$colorStore.primary};"
        >
          <MessageSquare class="w-6 h-6" />
        </div>
        <h2 class="text-lg sm:text-xl font-bold" style="color: {$colorStore.text}">Chat Options</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <!-- Channel Selection -->
        <div
          class="rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <Hash class="w-5 h-5" style="color: {$colorStore.primary}" />
            <h3 class="font-semibold" style="color: {$colorStore.text}">Channel</h3>
          </div>
          <DiscordSelector
            type="channel"
            options={channels}
            placeholder="Select a channel"
            bind:selected={selectedChannelId}
          />
        </div>

        <!-- Time Amount -->
        <div
          class="rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <Clock class="w-5 h-5" style="color: {$colorStore.secondary}" />
            <h3 class="font-semibold" style="color: {$colorStore.text}">Time Amount</h3>
          </div>
          <input
            bind:value={timeAmount}
            class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200 min-h-[44px]"
            max={timeUnit === "days" ? 3 : (timeUnit === "hours" ? 72 : 4320)}
            min="1"
            style="border-color: {$colorStore.secondary}30;
                   color: {$colorStore.text};"
            type="number"
          />
        </div>

        <!-- Time Unit -->
        <div
          class="rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <Calendar class="w-5 h-5" style="color: {$colorStore.accent}" />
            <h3 class="font-semibold" style="color: {$colorStore.text}">Time Unit</h3>
          </div>
          <DiscordSelector
            type="custom"
            options={timeUnits.map(unit => ({
              id: unit.value,
              name: unit.label
            }))}
            customIcon={Calendar}
            placeholder="Select time unit"
            bind:selected={timeUnit}
          />
        </div>
      </div>

      <div class="flex flex-wrap justify-center sm:justify-end gap-4 mt-6">
        <button
          class="px-6 py-3 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm flex items-center gap-2 min-h-[44px] w-full sm:w-auto"
          disabled={loading}
          on:click={fetchMessages}
          style="background: linear-gradient(to right, {$colorStore.primary}40, {$colorStore.secondary}40);
                 color: {$colorStore.text};
                 box-shadow: 0 0 20px {$colorStore.primary}20;"
        >
          <Search class="w-5 h-5" />
          {loading ? 'Loading...' : 'Load Messages'}
        </button>
      </div>
    </section>
  {/if}

  {#if activeTab === 'saved'}
    <!-- Saved Logs Tab -->
    {#if savedLogs.length > 0}
      <section
        class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   color: {$colorStore.primary};"
          >
            <Folder class="w-6 h-6" />
          </div>
          <h2 class="text-lg sm:text-xl font-bold" style="color: {$colorStore.text}">Saved Logs</h2>
        </div>

        <div class="grid grid-cols-1 gap-4">
          {#each savedLogs as log}
            <div
              class="rounded-lg p-4 flex flex-col transition-colors duration-200"
              style="background: {currentLogId === log.id ? $colorStore.primary + '20' : $colorStore.primary + '10'};
                     border: 1px solid {currentLogId === log.id ? $colorStore.primary + '40' : $colorStore.primary + '20'};"
            >
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div class="flex-grow">
                  {#if editingLogName === log.id}
                    <div class="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        bind:value={newLogName}
                        class="flex-grow p-2 rounded-lg bg-gray-900/50 border min-h-[44px]"
                        style="border-color: {$colorStore.primary}30;
                              color: {$colorStore.text};"
                        on:keydown={(e) => e.key === 'Enter' && saveLogName()}
                      />
                      <div class="flex gap-2">
                        <button
                          class="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                          style="background: {$colorStore.primary}20;
                                color: {$colorStore.text};"
                          on:click={saveLogName}
                        >
                          <Save class="w-4 h-4" />
                        </button>
                        <button
                          class="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                          style="background: {$colorStore.accent}20;
                                color: {$colorStore.accent};"
                          on:click={() => editingLogName = false}
                        >
                          <X class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  {:else}
                    <h3 class="font-medium text-lg" style="color: {$colorStore.text}">
                      {log.name}
                    </h3>
                  {/if}
                  <p class="text-sm mt-1" style="color: {$colorStore.muted}">
                    #{log.channelName} • {formatTimestamp(log.timestamp)} • {log.messageCount} messages
                  </p>
                </div>

                <div class="flex gap-2 flex-shrink-0">
                  <button
                    class="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                    style="background: {$colorStore.primary}20;
                           color: {$colorStore.primary};"
                    on:click={() => loadLog(log.id)}
                    title="View Log"
                  >
                    <Search class="w-4 h-4" />
                  </button>
                  <button
                    class="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                    style="background: {$colorStore.secondary}20;
                           color: {$colorStore.secondary};"
                    on:click={() => startEditingLogName(log.id)}
                    title="Rename Log"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button
                    class="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                    style="background: rgba(244, 67, 54, 0.2);
                           color: #f44336;"
                    on:click={() => deleteLog(log.id)}
                    title="Delete Log"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {:else}
      <div class="text-center py-12 px-4">
        <Folder class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.muted}" />
        <p class="text-base sm:text-lg" style="color: {$colorStore.muted}">No saved logs yet</p>
      </div>
    {/if}
  {/if}

  {#if activeTab === 'view'}
    <!-- Message Display Tab -->
    {#if messages.length > 0}
      <section
        class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
      >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div class="flex items-center gap-3">
            <div
              class="p-3 rounded-xl"
              style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                    color: {$colorStore.primary};"
            >
              <MessageSquare class="w-6 h-6" />
            </div>
            <h2 class="text-lg sm:text-xl font-bold" style="color: {$colorStore.text}">
              #{getSelectedChannelName()} - {messages.length} messages
            </h2>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {#if !currentLogId}
              <button
                class="px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm flex items-center gap-2 min-h-[44px] justify-center"
                style="background: linear-gradient(to right, {$colorStore.primary}30, {$colorStore.secondary}30);
                      color: {$colorStore.text};"
                on:click={saveLog}
              >
                <Save class="w-5 h-5" />
                Save Log
              </button>
            {/if}

            <button
              class="px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm flex items-center gap-2 min-h-[44px] justify-center"
              style="background: linear-gradient(to right, {$colorStore.primary}30, {$colorStore.secondary}30);
                    color: {$colorStore.text};"
              on:click={exportAsHTML}
            >
              <Download class="w-5 h-5" />
              Export HTML
            </button>
          </div>
        </div>

        <!-- Group messages by date -->
        {#each Object.entries(messages.reduce((groups, message) => {
          const date = new Date(message.timestamp).toLocaleDateString();
          if (!groups[date]) {
            groups[date] = [];
          }
          groups[date].push(message);
          return groups;
        }, {})).sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime()) as [date, messagesOnDate], i}
          <div class="mb-6">
            <div
              class="text-center relative mb-4"
            >
              <div
                class="absolute inset-0 flex items-center"
                style="z-index: 0;"
              >
                <div
                  class="w-full h-px"
                  style="background-color: {$colorStore.primary}30;"
                ></div>
              </div>
              <span
                class="relative px-3 py-1 rounded-full text-sm font-medium"
                style="background-color: {$colorStore.primary}20; color: {$colorStore.text}; z-index: 1;"
              >
                {new Date(date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            <div class="space-y-4 ml-1">
              {#each groupMessagesByAuthor(messagesOnDate.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())) as messageGroup}
                <div
                  class="flex gap-3"
                  style="border-top: 1px solid {$colorStore.primary}10;"
                >
                  <img
                    src={messageGroup[0].author.avatarUrl}
                    alt={messageGroup[0].author.username}
                    class="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover mt-4 flex-shrink-0"
                  />
                  <div class="flex-grow pt-4 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-semibold text-sm sm:text-base truncate" style="color: {$colorStore.text}">
                        {messageGroup[0].author.username}
                      </span>
                      <span class="text-xs flex-shrink-0" style="color: {$colorStore.muted}">
                        {formatTimestamp(messageGroup[0].timestamp)}
                      </span>
                    </div>

                    {#each messageGroup as message, msgIndex}
                      {#if msgIndex > 0}
                        <div class="text-xs my-1" style="color: {$colorStore.muted}">
                          {formatTimestamp(message.timestamp)}
                        </div>
                      {/if}

                      {#if message.content}
                        <div
                          class="mt-1 break-words text-sm sm:text-base"
                          style="color: {$colorStore.text};"
                        >
                          {@html parseDiscordMarkdown(message.content)}
                        </div>
                      {/if}

                      {#if message.attachments && message.attachments.length > 0}
                        <div class="mt-2 space-y-2">
                          {#each message.attachments as attachment}
                            {#if isImageUrl(attachment.url)}
                              <div class="rounded overflow-hidden max-w-full sm:max-w-md">
                                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={attachment.proxyUrl || attachment.url}
                                    alt={attachment.filename}
                                    class="max-h-64 sm:max-h-96 max-w-full object-contain"
                                  />
                                </a>
                              </div>
                            {:else}
                              <div
                                class="flex items-center gap-2 p-2 rounded max-w-full overflow-hidden"
                                style="background: {$colorStore.primary}15;"
                              >
                                <Link class="w-4 h-4 flex-shrink-0" style="color: {$colorStore.primary}" />
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style="color: {$colorStore.primary}"
                                  class="text-sm truncate"
                                >
                                  {attachment.filename} ({getFileSize(attachment.fileSize)})
                                </a>
                              </div>
                            {/if}
                          {/each}
                        </div>
                      {/if}

                      {#if message.embeds && message.embeds.length > 0}
                        <div class="mt-2 space-y-3">
                          {#each message.embeds as embed}
                            <div
                              class="rounded-md p-3 max-w-full border-l-4 overflow-hidden"
                              style="background: {$colorStore.primary}15; border-left-color: {$colorStore.primary};"
                            >
                              <div class="flex flex-col sm:flex-row gap-3">
                                <div class="flex-grow min-w-0 overflow-hidden">
                                  {#if embed.author}
                                    <div class="flex items-center gap-2 mb-2">
                                      {#if embed.author.iconUrl}
                                        <img
                                          src={embed.author.iconUrl}
                                          alt="Author"
                                          class="w-5 h-5 rounded-full flex-shrink-0"
                                        />
                                      {/if}
                                      <span class="text-sm font-medium truncate" style="color: {$colorStore.text}">
                                        {embed.author.name}
                                      </span>
                                    </div>
                                  {/if}

                                  {#if embed.title}
                                    <div class="font-bold mb-1" style="color: {$colorStore.text}">
                                      {#if embed.url}
                                        <a
                                          href={embed.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style="color: {$colorStore.primary}"
                                          class="flex items-center gap-1 break-all"
                                        >
                                          <span class="break-words">{embed.title}</span>
                                          <ExternalLink class="w-3 h-3 inline-block flex-shrink-0" />
                                        </a>
                                      {:else}
                                        <span class="break-words">{embed.title}</span>
                                      {/if}
                                    </div>
                                  {/if}

                                  {#if embed.description}
                                    <div class="text-sm whitespace-pre-wrap break-words" style="color: {$colorStore.text}90">
                                      {#if embed.description.includes('https://')}
                                        {@html parseDiscordMarkdown(embed.description)}
                                      {:else}
                                        {embed.description}
                                      {/if}
                                    </div>
                                  {/if}
                                </div>

                                {#if embed.thumbnail}
                                  <div class="flex-shrink-0">
                                    <img
                                      src={embed.thumbnail}
                                      alt="Thumbnail"
                                      class="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover"
                                    />
                                  </div>
                                {/if}
                              </div>
                            </div>
                          {/each}
                        </div>
                      {/if}

                      {#if msgIndex < messageGroup.length - 1}
                        <div class="border-b border-dashed my-2" style="border-color: {$colorStore.primary}10;"></div>
                      {/if}
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}

        {#if messages.length >= 1000}
          <div
            class="mt-4 p-3 rounded-lg"
            style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
          >
            <p class="text-center text-sm sm:text-base">Showing {messages.length} messages. There may be more messages that are not displayed.</p>
          </div>
        {/if}
      </section>
    {:else}
      <div class="text-center py-12 px-4">
        <MessageSquare class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.muted}" />
        <p class="text-base sm:text-lg" style="color: {$colorStore.muted}">No messages to display</p>
        <p class="text-sm mt-2" style="color: {$colorStore.muted}">Use the "Fetch Messages" tab to load messages</p>
      </div>
    {/if}
  {/if}
</DashboardPageLayout>

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

    /* Remove number input spinners */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    input[type="number"] {
        -moz-appearance: textfield;
    }

    :global(.mention) {
        background-color: rgba(88, 101, 242, 0.3);
        border-radius: 3px;
        padding: 0 2px;
    }

    :global(.mention.user), :global(.mention.role) {
        color: #c9cdfb;
    }

    :global(.mention.channel) {
        color: #8e9297;
    }

    :global(.code-block) {
        background-color: #2f3136;
        border-radius: 3px;
        padding: 8px;
        font-family: "Consolas", "Courier New", Courier, monospace;
        overflow-x: auto;
        margin: 4px 0;
    }

    :global(code) {
        background-color: #2f3136;
        border-radius: 3px;
        padding: 0 4px;
        font-family: "Consolas", "Courier New", Courier, monospace;
    }
</style>