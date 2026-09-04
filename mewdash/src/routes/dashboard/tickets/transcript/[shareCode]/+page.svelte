<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { chatApi, type ChatLogMessage, clientApi, instanceManagementApi } from "$lib/api/index.ts";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { safeUrl } from "$lib/utils/sanitize";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let loading = $state(true);
  let error = $state<string | null>(null);
  let chatLogId = $state<number | null>(null);
  let chatLog = $state<any>(null);
  let messages: ChatLogMessage[] = $state([]);
  let guildMembers: any[] = $state([]);
  let guildChannels: any[] = $state([]);
  let hasAccess = $state(false);

  function decodeShareCode(shareCode: string): { chatLogId: number; guildId: bigint; instancePort: number } | null {
    try {
      // Reverse the URL-safe base64 encoding
      const base64 = shareCode
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      // Add padding if needed
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");

      // Decode
      const decoded = atob(padded);
      logger.info("Decoded share code:", decoded);

      const parts = decoded.split("_");
      logger.info("Split parts:", parts);

      if (parts.length !== 3) {
        logger.error(`Expected 3 parts in share code, got ${parts.length}: ${parts}`);
        return null;
      }

      const [logId, guildIdStr, port] = parts;

      const result = {
        chatLogId: parseInt(logId),
        guildId: BigInt(guildIdStr),
        instancePort: parseInt(port)
      };

      logger.info("Parsed share code:", result);

      if (isNaN(result.chatLogId) || isNaN(result.instancePort)) {
        logger.error("Failed to parse numeric values from share code:", { logId, port, result });
        return null;
      }

      return result;
    } catch (err) {
      logger.error("Failed to decode share code:", err);
      return null;
    }
  }

  function safelyParseDate(dateString: string): Date {
    try {
      const parsedDate = new Date(dateString);
      if (isNaN(parsedDate.getTime())) {
        return new Date();
      }
      return parsedDate;
    } catch (err) {
      return new Date();
    }
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

    text = sanitizeText(text);

    // Links with text [text](url). The URL must be scheme-checked: escaping alone
    // leaves `javascript:` intact, since the parser decodes entities before the href
    // is used, and this page is shared by link with anyone.
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) =>
      `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary);">${label}</a>`);

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
        return `<span class="mention user">@${sanitizeText(member.username)}</span>`;
      }
      return `<span class="mention user">@Unknown User</span>`;
    });

    // Channel mentions <#123456789>
    text = text.replace(/<#(\d+)>/g, (match, channelId) => {
      const channel = guildChannels.find(c => c.id === channelId);
      if (channel) {
        return `<span class="mention channel">#${sanitizeText(channel.name)}</span>`;
      }
      return `<span class="mention channel">#unknown-channel</span>`;
    });

    // Role mentions <@&123456789>
    text = text.replace(/<@&(\d+)>/g, "<span class=\"mention role\">@Role</span>");

    // Plain URLs
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

  function groupMessagesByAuthor(messages: ChatLogMessage[]): ChatLogMessage[][] {
    if (!messages || messages.length === 0) return [];

    const validMessages = messages.filter(msg =>
      msg && msg.author && typeof msg.author.id !== "undefined"
    );

    if (validMessages.length === 0) return [];

    const MAX_TIME_BETWEEN_MESSAGES = 5 * 60 * 1000; // 5 minutes
    const result: ChatLogMessage[][] = [];
    let currentGroup: ChatLogMessage[] = [validMessages[0]];

    for (let i = 1; i < validMessages.length; i++) {
      const currentMessage = validMessages[i];
      const previousMessage = validMessages[i - 1];

      if (!currentMessage.author || !previousMessage.author) {
        result.push(currentGroup);
        currentGroup = [currentMessage];
        continue;
      }

      const sameAuthor = currentMessage.author.id === previousMessage.author.id;
      const timeDiff = safelyParseDate(currentMessage.timestamp).getTime() -
        safelyParseDate(previousMessage.timestamp).getTime();

      if (sameAuthor && timeDiff < MAX_TIME_BETWEEN_MESSAGES) {
        currentGroup.push(currentMessage);
      } else {
        result.push(currentGroup);
        currentGroup = [currentMessage];
      }
    }

    if (currentGroup.length > 0) {
      result.push(currentGroup);
    }

    return result;
  }

  let messagesByDate = $derived(() => {
    const grouped: Record<string, ChatLogMessage[]> = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    return Object.entries(grouped).sort(([dateA], [dateB]) =>
      new Date(dateA).getTime() - new Date(dateB).getTime()
    );
  });

  async function loadTranscript() {
    try {
      loading = true;
      error = null;

      const shareCode = $page.params.shareCode;
      if (!shareCode) {
        error = "Missing share code in URL.";
        return;
      }
      logger.info("Loading transcript with share code:", shareCode);

      const decoded = decodeShareCode(shareCode);
      if (!decoded) {
        error = `Invalid or expired transcript link. Share code: ${shareCode}. Check browser console for details.`;
        return;
      }

      chatLogId = decoded.chatLogId;

      // Set the correct instance based on port FIRST (before any API calls)
      const instances = await instanceManagementApi.getBotInstances();
      const targetInstance = instances.find((i) => i.port === decoded.instancePort);

      if (targetInstance) {
        currentInstance.set(targetInstance);
      } else {
        error = `Could not find bot instance on port ${decoded.instancePort}. Please check your instance configuration.`;
        return;
      }

      // NOW verify user has access to the guild (with correct instance set)
      try {
        const userGuilds = await clientApi.getMutualGuilds(BigInt(data.user.id), true); // adminOnly = true
        const guild = userGuilds?.find((g: any) => g.id.toString() === decoded.guildId.toString());

        if (!guild) {
          error = "You do not have access to view this transcript. Only server administrators can view ticket transcripts.";
          return;
        }
        hasAccess = true;
      } catch (err) {
        logger.error("Failed to verify guild access:", err);
        error = "Failed to verify guild access";
        return;
      }

      // Fetch the chat log
      chatLog = await chatApi.getChatLog(decoded.guildId, chatLogId.toString());

      if (!chatLog) {
        error = "Transcript not found";
        return;
      }

      // Load guild members and channels for mention parsing
      try {
        [guildMembers, guildChannels] = await Promise.all([
          clientApi.getMembers(decoded.guildId).catch(() => []),
          clientApi.getTextChannels(decoded.guildId).catch(() => [])
        ]);
      } catch (err) {
        logger.warn("Failed to load guild data for mentions:", err);
      }

      messages = chatLog.messages || [];

    } catch (err) {
      logger.error("Failed to load transcript:", err);
      error = "Failed to load transcript";
    } finally {
      loading = false;
    }
  }

  function exportAsHTML(): void {
    if (messages.length === 0 || !chatLog) return;

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket Transcript - ${chatLog.name}</title>
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
    .subtitle {
      font-size: 16px;
      margin-top: 5px;
      color: var(--secondary-text);
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
    .content {
      word-wrap: break-word;
      white-space: pre-wrap;
    }
    .mention {
      background-color: rgba(88, 101, 242, 0.3);
      border-radius: 3px;
      padding: 0 2px;
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
    <h1>Ticket Transcript</h1>
    <div class="subtitle">${chatLog.name}</div>
    <div class="timestamp">Generated ${new Date().toLocaleString()}</div>
  </header>
  <main class="messages">`;

    // Group messages by day
    const groupedMessages: Record<string, ChatLogMessage[]> = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    });

    const orderedDates = Object.keys(groupedMessages).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    orderedDates.forEach(day => {
      html += `
    <div class="day-divider"><span>${new Date(day).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })}</span></div>`;

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

        group.forEach((message, index) => {
          if (index > 0) {
            html += `
        <div class="timestamp" style="margin-top: 8px; margin-bottom: 2px;">${new Date(message.timestamp).toLocaleTimeString()}</div>`;
          }

          if (message.content) {
            html += `
        <div class="content">${parseDiscordMarkdown(message.content)}</div>`;
          }
        });

        html += `
      </div>
    </div>`;
      });
    });

    html += `
  </main>
  <footer>
    <p>Generated on ${new Date().toLocaleString()}</p>
    <p>Ticket Transcript System - Mewdeko</p>
  </footer>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chatLog.name.replace(/[^a-z0-9]/gi, "-")}-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  onMount(async () => {
    if (!data.user) {
      goto(`/api/discord/login?redirect_to=${encodeURIComponent($page.url.pathname)}`);
      return;
    }

    await loadTranscript();
  });
</script>

<svelte:head>
  <title>{chatLog?.name || "Ticket Transcript"} - Mewdeko</title>
</svelte:head>

<main
  class="min-h-screen py-8 px-4"
  style="background: linear-gradient(135deg, {$colorStore.primary}08 0%, {$colorStore.secondary}05 100%);"
>
  <div class="container mx-auto max-w-5xl">
    {#if loading}
      <div
        class="rounded-xl border p-12 text-center"
        style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
        in:fade
      >
        <div
          class="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
          style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"
        ></div>
        <p style="color: {$colorStore.muted};">Loading transcript...</p>
      </div>
    {:else if error}
      <div
        class="rounded-xl border p-8 text-center"
        style="background: #ef444410; border-color: #ef444430;"
        in:fade
      >
        <div class="flex justify-center mb-4">
          <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444; font-size: 48px;"></i>
        </div>
        <h2 class="text-2xl font-bold mb-4" style="color: #ef4444;">Error</h2>
        <p class="text-lg mb-6" style="color: {$colorStore.text};">{error}</p>
        <button
          onclick={() => goto("/dashboard")}
          class="px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        >
          Return to Dashboard
        </button>
      </div>
    {:else if hasAccess && chatLog}
      <div class="space-y-6">
        <!-- Header -->
        <div
          class="rounded-xl border p-6"
          style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
          in:fade
        >
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex items-center gap-3">
              <div
                class="p-3 rounded-xl"
                style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);"
              >
                <i class="fa-solid fa-file-lines" style="color: {$colorStore.primary}; font-size: 24px;"></i>
              </div>
              <div>
                <h1 class="text-2xl font-bold" style="color: {$colorStore.text};">
                  {chatLog.name}
                </h1>
                <p class="text-sm" style="color: {$colorStore.muted};">
                  {messages.length} messages • {formatTimestamp(chatLog.timestamp)}
                </p>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                class="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 min-h-[44px]"
                style="background: linear-gradient(to right, {$colorStore.primary}30, {$colorStore.secondary}30);
                      color: {$colorStore.text};"
                onclick={exportAsHTML}
              >
                <i class="fa-solid fa-download" style="font-size: 16px;"></i>
                Export HTML
              </button>
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div
          class="rounded-2xl border p-6 shadow-2xl"
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                border-color: {$colorStore.primary}30;"
        >
          {#each messagesByDate() as [date, messagesOnDate]}
            <div class="mb-6">
              <div class="text-center relative mb-4">
                <div class="absolute inset-0 flex items-center" style="z-index: 0;">
                  <div class="w-full h-px" style="background-color: {$colorStore.primary}30;"></div>
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
                  <div class="flex gap-3" style="border-top: 1px solid {$colorStore.primary}10;">
                    <img
                      src={messageGroup[0].author.avatarUrl}
                      alt={messageGroup[0].author.username}
                      class="w-10 h-10 rounded-full object-cover mt-4 shrink-0"
                    >
                    <div class="grow pt-4 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-semibold text-base truncate" style="color: {$colorStore.text}">
                          {messageGroup[0].author.username}
                        </span>
                        <span class="text-xs shrink-0" style="color: {$colorStore.muted}">
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
                          <div class="mt-1 break-words text-base" style="color: {$colorStore.text};">
                            {@html parseDiscordMarkdown(message.content)}
                          </div>
                        {/if}

                        {#if message.attachments && message.attachments.length > 0}
                          <div class="mt-2 space-y-2">
                            {#each message.attachments as attachment}
                              {#if isImageUrl(attachment.url)}
                                <div class="rounded-sm overflow-hidden max-w-md">
                                  <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={attachment.proxyUrl || attachment.url}
                                      alt={attachment.filename}
                                      class="max-h-96 max-w-full object-contain"
                                    >
                                  </a>
                                </div>
                              {:else}
                                <div
                                  class="flex items-center gap-2 p-2 rounded-sm"
                                  style="background: {$colorStore.primary}15;"
                                >
                                  <i class="fa-solid fa-link"
                                     style="color: {$colorStore.primary}; font-size: 16px;"></i>
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
                                class="rounded-md p-3 border-l-4"
                                style="background: {$colorStore.primary}15; border-left-color: {$colorStore.primary};"
                              >
                                <div class="flex gap-3">
                                  <div class="grow min-w-0">
                                    {#if embed.author}
                                      <div class="flex items-center gap-2 mb-2">
                                        {#if embed.author.iconUrl}
                                          <img
                                            src={embed.author.iconUrl}
                                            alt="Author"
                                            class="w-5 h-5 rounded-full shrink-0"
                                          >
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
                                          >
                                            {embed.title}
                                          </a>
                                        {:else}
                                          {embed.title}
                                        {/if}
                                      </div>
                                    {/if}

                                    {#if embed.description}
                                      <div class="text-sm whitespace-pre-wrap break-words"
                                           style="color: {$colorStore.text}90">
                                        {@html parseDiscordMarkdown(embed.description)}
                                      </div>
                                    {/if}

                                    {#if embed.fields && embed.fields.length > 0}
                                      <div class="mt-3 grid gap-2"
                                           style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                                        {#each embed.fields as field}
                                          <div class="text-sm" style="grid-column: {field.inline ? 'auto' : '1 / -1'};">
                                            <div class="font-semibold mb-1" style="color: {$colorStore.text}">
                                              {field.name}
                                            </div>
                                            <div class="whitespace-pre-wrap break-words"
                                                 style="color: {$colorStore.text}80">
                                              {@html parseDiscordMarkdown(field.value)}
                                            </div>
                                          </div>
                                        {/each}
                                      </div>
                                    {/if}
                                  </div>

                                  {#if embed.thumbnail}
                                    <div class="shrink-0">
                                      <img
                                        src={embed.thumbnail}
                                        alt="Thumbnail"
                                        class="w-20 h-20 rounded-md object-cover"
                                      >
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

          {#if messages.length === 0}
            <div class="text-center py-12">
              <i class="fa-solid fa-inbox"
                 style="color: {$colorStore.muted}; font-size: 48px; display: block; margin: 0 auto 16px;"></i>
              <p style="color: {$colorStore.muted};">No messages in this transcript</p>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</main>

<style lang="postcss">
    :global(.mention) {
        background-color: rgba(88, 101, 242, 0.3);
        border-radius: 3px;
        padding: 0 2px;
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
