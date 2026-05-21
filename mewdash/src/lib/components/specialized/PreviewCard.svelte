<!-- PreviewCard.svelte -->
<script lang="ts">
  import { marked } from "marked";
  import DOMPurify from "dompurify";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { get } from "svelte/store";

  // Props
    interface Props {
      content?: string;
      embeds?: any[];
      componentRows?: any[];
      showEmpty?: boolean;
      emptyMessage?: string;
      user?: any;
      guild?: any;
      guildId?: string | bigint | null;
    }

    let {
      content = "",
      embeds = [],
      componentRows = [],
      showEmpty = true,
      emptyMessage = "Your embed preview will appear here",
      user = null,
      guild = null,
      guildId = null
    }: Props = $props();

  // Get real data from stores
  const instance = get(currentInstance);
  const currentGuildData = get(currentGuild);
  let actualGuild = $derived(guild || currentGuildData);
  let actualGuildId = $derived(guildId || currentGuildData?.id);

  // Extract user data for use in all functions
  let userName = $derived(user?.username || user?.globalName || "ExampleUser");
  let userId = $derived(user?.id || "123456789012345678");

  // Placeholder replacement function
  function replacePlaceholders(text: string): string {
    if (!text) return text;

    let replaced = text;

    // User placeholders

    // Construct avatar URL from hash
    const userAvatarHash = user?.avatar;
    const userAvatar = userAvatarHash
      ? `https://cdn.discordapp.com/avatars/${userId}/${userAvatarHash}.${userAvatarHash.startsWith("a_") ? "gif" : "png"}?size=256`
      : "https://cdn.discordapp.com/embed/avatars/0.png";

    // Construct banner URL from hash
    const userBannerHash = user?.banner;
    const userBanner = userBannerHash
      ? `https://cdn.discordapp.com/banners/${userId}/${userBannerHash}.${userBannerHash.startsWith("a_") ? "gif" : "png"}?size=512`
      : "";

    replaced = replaced.replace(/%user%/g, `<@${userId}>`);
    replaced = replaced.replace(/%user\.mention%/g, `<@${userId}>`);
    replaced = replaced.replace(/%user\.name%/g, userName);
    replaced = replaced.replace(/%user\.fullname%/g, userName);
    replaced = replaced.replace(/%user\.id%/g, userId);
    replaced = replaced.replace(/%user\.avatar%/g, userAvatar);
    replaced = replaced.replace(/%user\.banner%/g, userBanner);
    replaced = replaced.replace(/%user\.created_time%/g, "14:30");
    replaced = replaced.replace(/%user\.created_date%/g, "15.06.2020");
    replaced = replaced.replace(/%user\.joined_time%/g, "09:45");
    replaced = replaced.replace(/%user\.joined_date%/g, "22.03.2023");

    // Server/Guild placeholders - use real data if available
    const guildName = actualGuild?.name || "Example Server";
    const guildIdStr = typeof actualGuildId === "bigint" ? actualGuildId.toString() : (actualGuildId?.toString() || "987654321098765432");
    replaced = replaced.replace(/%server%/g, guildName);
    replaced = replaced.replace(/%server\.name%/g, guildName);
    replaced = replaced.replace(/%server\.id%/g, guildIdStr);
    replaced = replaced.replace(/%server\.members%/g, actualGuild?.memberCount?.toString() || "1,234");
    replaced = replaced.replace(/%server\.members\.online%/g, "523");
    replaced = replaced.replace(/%server\.members\.offline%/g, "711");
    replaced = replaced.replace(/%server\.members\.dnd%/g, "45");
    replaced = replaced.replace(/%server\.members\.idle%/g, "89");
    replaced = replaced.replace(/%server\.boostlevel%/g, actualGuild?.premiumTier?.toString() || "2");
    replaced = replaced.replace(/%server\.boostcount%/g, actualGuild?.premiumSubscriptionCount?.toString() || "14");
    replaced = replaced.replace(/%server\.icon%/g, actualGuild?.icon ? `https://cdn.discordapp.com/icons/${guildIdStr}/${actualGuild.icon}.${actualGuild.icon.startsWith("a_") ? "gif" : "png"}?size=256` : "");
    replaced = replaced.replace(/%server\.banner%/g, actualGuild?.banner ? `https://cdn.discordapp.com/banners/${guildIdStr}/${actualGuild.banner}.png?size=512` : "");

    const nowTimestamp = Math.floor(Date.now() / 1000);
    replaced = replaced.replace(/%server\.time%/g, new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short"
    }));
    replaced = replaced.replace(/%server\.timestamp\.longdatetime%/g, `<t:${nowTimestamp}:F>`);
    replaced = replaced.replace(/%server\.timestamp\.longtime%/g, `<t:${nowTimestamp}:T>`);
    replaced = replaced.replace(/%server\.timestamp\.longdate%/g, `<t:${nowTimestamp}:D>`);
    replaced = replaced.replace(/%server\.timestamp\.shortdatetime%/g, `<t:${nowTimestamp}>`);

    // Channel placeholders (use Discord mention format)
    replaced = replaced.replace(/%channel%/g, "<#123456789012345678>");
    replaced = replaced.replace(/%channel\.mention%/g, "<#123456789012345678>");
    replaced = replaced.replace(/%channel\.name%/g, "general");
    replaced = replaced.replace(/%channel\.id%/g, "123456789012345678");
    replaced = replaced.replace(/%channel\.created%/g, "14:30 15.06.2020");
    replaced = replaced.replace(/%channel\.nsfw%/g, "False");
    replaced = replaced.replace(/%channel\.topic%/g, "Welcome to the chat!");

    // Bot placeholders - use real instance data if available
    const botName = instance?.botName || "Mewdeko";
    const botId = instance?.botId || "752236274261426994";
    const botAvatar = instance?.botAvatar || "https://cdn.discordapp.com/embed/avatars/0.png";
    replaced = replaced.replace(/%bot\.status%/g, "Online");
    replaced = replaced.replace(/%bot\.latency%/g, "45");
    replaced = replaced.replace(/%bot\.name%/g, botName);
    replaced = replaced.replace(/%bot\.fullname%/g, botName);
    replaced = replaced.replace(/%bot\.id%/g, botId.toString());
    replaced = replaced.replace(/%bot\.avatar%/g, botAvatar);
    replaced = replaced.replace(/%bot\.time%/g, new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short"
    }));

    // Stats placeholders
    replaced = replaced.replace(/%shard\.servercount%/g, "1,234");
    replaced = replaced.replace(/%shard\.usercount%/g, "456,789");

    // Time placeholders
    const now = new Date();
    replaced = replaced.replace(/%time\.month%/g, now.toLocaleString("en", { month: "long" }));
    replaced = replaced.replace(/%time\.day%/g, now.toLocaleString("en", { weekday: "long" }));
    replaced = replaced.replace(/%time\.year%/g, now.getFullYear().toString());

    // Random placeholders (use static examples for preview)
    replaced = replaced.replace(/%rng%/g, "7");
    replaced = replaced.replace(/%rng\((\d+),(\d+)\)%/g, "42");
    replaced = replaced.replace(/%choose\([^)]+\)%/g, "[random option]");
    replaced = replaced.replace(/%target%/g, "example text");
    replaced = replaced.replace(/%img:([^%]+)%/g, "https://i.imgur.com/example.png");

    // GIF placeholders (use placeholder URL)
    const gifPlaceholders = [
      "baka", "bite", "blush", "bored", "cry", "cuddle", "dance", "facepalm", "feed",
      "handhold", "happy", "highfive", "hug", "kick", "kiss", "laugh", "pat", "poke",
      "pout", "punch", "shoot", "shrug", "slap", "sleep", "smile", "smug", "stare",
      "think", "thumbsup", "tickle", "wave", "wink"
    ];
    gifPlaceholders.forEach(gif => {
      replaced = replaced.replace(new RegExp(`%${gif}gif%`, "g"), `https://nekos.best/api/v2/${gif}/001.gif`);
    });

    return replaced;
  }

  // Helper functions
  function parseMarkdown(text: string): string {
    // Step 1: Replace placeholders (%user% → <@id>)
    const withPlaceholders = replacePlaceholders(text);

    // Step 2: Parse markdown (this escapes HTML: <@id> → &lt;@id&gt;)
    // Use breaks: true to match Discord's newline behavior (single \n = <br>)
    const markdown = marked.parse(withPlaceholders, { breaks: true }) as string;

    // Step 3: Format Discord mentions AFTER markdown escaping
    const withMentions = formatDiscordMentions(markdown);

    // Step 4: Sanitize but preserve our mention spans
    const sanitized = DOMPurify.sanitize(withMentions, {
      ADD_TAGS: ["span"],
      ADD_ATTR: ["class"]
    });

    return sanitized;
  }

  // Apply placeholder replacement to simple text (non-markdown)
  function processText(text: string): string {
    const withPlaceholders = replacePlaceholders(text);
    // For simple text, return raw HTML with mentions
    return withPlaceholders;
  }

  // Helper to escape HTML
  function escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Process and format text with mentions (for {@html} rendering)
  function processTextWithMentions(text: string): string {
    if (!text) return "";

    // Step 1: Replace placeholders (these are safe, controlled by us)
    const withPlaceholders = replacePlaceholders(text);

    // Step 2: Escape all HTML to prevent injection
    const escaped = escapeHtml(withPlaceholders);

    // Step 3: Format Discord mentions (safe, we control the HTML)
    const withMentions = formatDiscordMentions(escaped);

    return withMentions;
  }

  // Format Discord mentions using discord.css classes
  // This function receives escaped HTML, so mentions are &lt;@id&gt;
  function formatDiscordMentions(text: string): string {
    if (!text) return text;

    let result = text;

    // User mentions: &lt;@userId&gt; or &lt;@!userId&gt;
    result = result.replace(/&lt;@!?(\d+)&gt;/g, (match, id) => {
      const displayName = id === userId ? escapeHtml(userName) : "User";
      return `<span class="dc-mention">@${displayName}</span>`;
    });

    // Channel mentions: &lt;#channelId&gt;
    result = result.replace(/&lt;#(\d+)&gt;/g, (match, id) => {
      return `<span class="dc-mention">#general</span>`;
    });

    // Role mentions: &lt;@&amp;roleId&gt; or &lt;@&roleId&gt;
    result = result.replace(/&lt;@&amp;(\d+)&gt;/g, (match, id) => {
      return `<span class="dc-mention dc-mention-role" style="--dc-mention-color-rgb: 114 137 218">@Role</span>`;
    });
    result = result.replace(/&lt;@&(\d+)&gt;/g, (match, id) => {
      return `<span class="dc-mention dc-mention-role" style="--dc-mention-color-rgb: 114 137 218">@Role</span>`;
    });

    return result;
  }

    // Parse Discord emoji format for rendering
    function parseEmojiForDisplay(emojiString: string): { url: string; name: string } | null {
      if (!emojiString) return null;
      const match = emojiString.match(/<(a?):([^:]+):(\d+)>/);
      if (!match) return null;

      const [, animatedFlag, name, id] = match;
      const animated = animatedFlag === "a";
      const url = `https://cdn.discordapp.com/emojis/${id}.${animated ? "png" : "png"}?size=32&quality=lossless`;

      return { url, name };
  }

  function getButtonColorClass(style: number): string {
    switch (style) {
      case 1:
        return "dc-btn dc-btn-blurple"; // Primary/Blurple
      case 2:
        return "dc-btn"; // Secondary/Grey (default)
      case 3:
        return "dc-btn dc-btn-success"; // Success/Green
      case 4:
        return "dc-btn dc-btn-danger"; // Danger/Red
      case 5:
        return "dc-btn dc-btn-link"; // Link
      default:
        return "dc-btn dc-btn-blurple";
    }
  }

  // Check if we have any content to display
    let hasContent = $derived(content.trim() ||
      embeds.some(e => e.title || e.description || e.fields?.length > 0) ||
      componentRows.some(row => row.components && row.components.length > 0));

    // State for select menu dropdowns
    let openSelectMenus = $state<Set<number>>(new Set());

    function toggleSelectMenu(index: number) {
      const newSet = new Set(openSelectMenus);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      openSelectMenus = newSet;
    }
</script>

<div
  class="bg-[#36393f] rounded-lg p-4 space-y-4 text-white font-mono text-sm min-h-[200px] preview-content overflow-hidden">
  {#if hasContent}
    <!-- Message Content -->
    {#if content.trim()}
      <div class="text-gray-100 break-words">
        {@html parseMarkdown(content)}
      </div>
    {/if}

    <!-- Embeds Preview -->
    {#each embeds as embed, index}
      {#if embed.title || embed.description || embed.fields?.length > 0}
        <div class="dc-embed" style="--dc-embed-color: {embed.color || '#5865F2'};">
            <!-- Author -->
            {#if embed.author?.name}
              {@const processedAuthorUrl = processText(embed.author.url || "")}
              {@const processedAuthorName = processTextWithMentions(embed.author.name)}
              {@const processedAuthorIcon = processText(embed.author.icon_url || "")}
              <div class="dc-embed-author">
                {#if processedAuthorIcon && !processedAuthorIcon.includes('%')}
                  <img src={processedAuthorIcon} alt="Author icon">
                {/if}
                {#if processedAuthorUrl && !processedAuthorUrl.includes('%')}
                  <a href={processedAuthorUrl}>
                    {@html processedAuthorName}
                  </a>
                {:else}
                  <span>{@html processedAuthorName}</span>
                {/if}
              </div>
            {/if}

          <!-- Thumbnail (comes BEFORE title in discord.css) -->
          {#if embed.thumbnail?.url}
            {@const processedThumbnail = processText(embed.thumbnail.url)}
            {#if processedThumbnail && !processedThumbnail.includes('%')}
              <div class="dc-embed-thumbnail">
                <img src={processedThumbnail} alt="Thumbnail">
              </div>
            {/if}
            {/if}

            <!-- Title -->
            {#if embed.title}
              {@const processedTitle = processTextWithMentions(embed.title)}
              {@const processedUrl = processText(embed.url || "")}
              <div class="dc-embed-title">
                {#if processedUrl && !processedUrl.includes('%')}
                  <a href={processedUrl}>
                    {@html processedTitle}
                  </a>
                {:else}
                  {@html processedTitle}
                {/if}
              </div>
            {/if}

            <!-- Description -->
            {#if embed.description}
              <div class="dc-embed-description">
                {@html parseMarkdown(embed.description)}
              </div>
            {/if}

            <!-- Fields -->
            {#if embed.fields?.length > 0}
              <div class="dc-embed-fields">
                {#each embed.fields as field}
                  {#if field.name || field.value}
                    <div class="dc-embed-field{field.inline ? '-inline' : ''}">
                      {#if field.name}
                        <div class="dc-embed-field-name">{@html processTextWithMentions(field.name)}</div>
                      {/if}
                      {#if field.value}
                        <div class="dc-embed-field-value">
                          {@html parseMarkdown(field.value)}
                        </div>
                      {/if}
                    </div>
                  {/if}
                {/each}
              </div>
            {/if}

          <!-- Image -->
          {#if embed.image?.url}
            {@const processedImage = processText(embed.image.url)}
            {#if processedImage && !processedImage.includes('%')}
              <div class="dc-embed-image">
                <img src={processedImage} alt="">
              </div>
            {/if}
            {/if}

            <!-- Footer -->
            {#if embed.footer?.text || embed.footer?.icon_url}
              {@const processedFooterIcon = processText(embed.footer.icon_url || "")}
              {@const processedFooterText = processTextWithMentions(embed.footer.text || "")}
              <div class="dc-embed-footer">
                {#if processedFooterIcon && !processedFooterIcon.includes('%')}
                  <img src={processedFooterIcon} alt="Footer icon">
                {/if}
                <span>{@html processedFooterText}</span>
              </div>
            {/if}
        </div>
      {/if}
    {/each}

    <!-- Components Preview -->
    {#if componentRows.length > 0}
      <div class="dc-msg-components">
        {#each componentRows as row, rowIndex (row.rowKey)}
          {#if row.components && row.components.length > 0}
            <div class="dc-msg-components-btn-row">
              {#each row.components as component, compIndex (component.componentKey)}
              {#if component.isSelect}
                <!-- Select Menu -->
                {@const selectIndex = rowIndex * 100 + compIndex}
                {@const isOpen = openSelectMenus.has(selectIndex)}
                <div class="w-full relative">
                  <button
                    class="border border-transparent bg-[#2F3136] text-white font-medium rounded-sm cursor-pointer box-border grid grid-cols-[1fr_auto] items-center w-full text-left hover:bg-[#3a3d44] transition-colors"
                    onclick={() => toggleSelectMenu(selectIndex)}
                  >
                    <span class="placeholder px-3 py-2">
                      {component.displayName || "Select an option..."}
                    </span>
                    <div class="icon-container px-2 transition-transform" class:rotate-180={isOpen}>
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

                  <!-- Options Dropdown -->
                  {#if isOpen && component.options?.length > 0}
                    <div
                      class="absolute top-full left-0 right-0 mt-1 bg-[#2F3136] rounded-sm border border-[#202225] shadow-lg z-10 max-h-60 overflow-y-auto">
                      {#each component.options as option}
                        <div
                          class="px-3 py-2 hover:bg-[#3a3d44] cursor-pointer transition-colors border-b border-[#202225] last:border-b-0">
                          <div class="flex items-center gap-2">
                            {#if option.emoji}
                              {@const parsedEmoji = parseEmojiForDisplay(option.emoji)}
                              {#if parsedEmoji}
                                <img src={parsedEmoji.url} alt={parsedEmoji.name} class="w-4 h-4" />
                              {:else}
                                <span>{option.emoji}</span>
                              {/if}
                            {/if}
                            <div class="flex-1">
                              <div class="font-medium text-sm">{option.name}</div>
                              {#if option.description}
                                <div class="text-xs text-gray-400">{option.description}</div>
                              {/if}
                            </div>
                          </div>
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {:else}
                <!-- Button -->
                <button
                  class="{getButtonColorClass(component.style)}"
                  disabled
                  aria-label={component.displayName}
                  style="display: inline-flex; align-items: center; gap: 0.5rem;"
                >
                  {#if component.emoji}
                    {@const parsedEmoji = parseEmojiForDisplay(component.emoji)}
                    {#if parsedEmoji}
                      <img src={parsedEmoji.url} alt={parsedEmoji.name} style="width: 1.2em; height: 1.2em;" />
                    {:else}
                      <span>{component.emoji}</span>
                    {/if}
                  {/if}
                  <span>{@html processTextWithMentions(component.displayName)}</span>
                </button>
              {/if}
              {/each}
            </div>
          {/if}
        {/each}
      </div>
    {/if}

  {:else if showEmpty}
    <!-- Empty State -->
    <div class="text-center py-12">
      <i class="fa-solid fa-eye" style="font-size: 48px; opacity: 0.3; display: block; margin: 0 auto 16px;"></i>
      <p class="text-gray-400">{emptyMessage}</p>
    </div>
  {/if}
</div>

<style>


  /* Style adjustments for embedded images */
  img {
    max-width: 100%;
    height: auto;
  }

  /* Link styling */
  a {
    color: #00AFF4;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  /* Discord-like markdown styles */
  :global(.preview-content) {
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
  }

  :global(.preview-content strong) {
    font-weight: 600;
  }

  :global(.preview-content em) {
    font-style: italic;
  }

  :global(.preview-content code) {
    background: #2f3136;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
      word-break: break-all;
  }

  :global(.preview-content pre) {
    background: #2f3136;
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
      max-width: 100%;
  }

  :global(.preview-content pre code) {
      word-break: normal;
  }

  :global(.preview-content blockquote) {
    border-left: 4px solid #4f545c;
    padding-left: 8px;
    margin: 4px 0;
  }

  :global(.preview-content) p {
      word-wrap: break-word;
      overflow-wrap: break-word;
  }

</style>