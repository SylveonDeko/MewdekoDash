<!-- @migration-task Error while migrating Svelte code: Expected a valid CSS identifier
https://svelte.dev/e/css_expected_identifier -->
<!-- PreviewCard.svelte -->
<script lang="ts">
  import { marked } from "marked";
  import DOMPurify from "dompurify";

  // Props
    interface Props {
      content?: string;
      embeds?: any[];
      componentRows?: any[];
      showEmpty?: boolean;
      emptyMessage?: string;
    }

    let {
      content = "",
      embeds = [],
      componentRows = [],
      showEmpty = true,
      emptyMessage = "Your embed preview will appear here"
    }: Props = $props();

  // Helper functions
  function parseMarkdown(text: string): string {
    return DOMPurify.sanitize(marked.parse(text) as string);
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
      case 1: return 'bg-[#5865F2] hover:bg-[#4752C4] text-white';
      case 2: return 'bg-[#4F545C] hover:bg-[#5D6269] text-white';
      case 3: return 'bg-[#3BA55D] hover:bg-[#2D7D32] text-white';
      case 4: return 'bg-[#ED4245] hover:bg-[#C62828] text-white';
      case 5: return 'bg-transparent hover:bg-[#5865F2]/10 text-[#00AFF4] border-0';
      default: return 'bg-[#5865F2] hover:bg-[#4752C4] text-white';
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

<div class="bg-[#36393f] rounded-lg p-4 space-y-4 text-white font-mono text-sm min-h-[200px] preview-content">
  {#if hasContent}
    <!-- Message Content -->
    {#if content.trim()}
      <div class="text-gray-100">
        {@html parseMarkdown(content)}
      </div>
    {/if}

    <!-- Embeds Preview -->
    {#each embeds as embed, index}
      {#if embed.title || embed.description || embed.fields?.length > 0}
        <div class="flex">
          <div class="w-1 rounded-l-md mr-3" style="background: {embed.color || '#5865F2'};"></div>
          <div class="flex-1 space-y-2 relative">
            
            <!-- Author -->
            {#if embed.author?.name}
              <div class="flex items-center gap-2 text-xs opacity-80">
                {#if embed.author.icon_url}
                  <img src={embed.author.icon_url} alt="Author icon" class="w-5 h-5 rounded-full">
                {/if}
                {#if embed.author.url}
                  <a href={embed.author.url} class="font-medium hover:underline text-blue-400">
                    {embed.author.name}
                  </a>
                {:else}
                  <span class="font-medium">{embed.author.name}</span>
                {/if}
              </div>
            {/if}

            <!-- Title -->
            {#if embed.title}
              <div class="font-semibold text-white">
                {#if embed.url}
                  <a href={embed.url} class="hover:underline text-blue-400">
                    {embed.title}
                  </a>
                {:else}
                  {embed.title}
                {/if}
              </div>
            {/if}

            <!-- Description -->
            {#if embed.description}
              <div class="text-gray-300 text-sm leading-relaxed">
                {@html parseMarkdown(embed.description)}
              </div>
            {/if}

            <!-- Fields -->
            {#if embed.fields?.length > 0}
              <div class="grid gap-2 grid-cols-1">
                {#each embed.fields as field}
                  {#if field.name || field.value}
                    <div class="space-y-1" class:inline-field={field.inline}>
                      {#if field.name}
                        <div class="font-semibold text-white text-sm">{field.name}</div>
                      {/if}
                      {#if field.value}
                        <div class="text-gray-300 text-sm">
                          {@html parseMarkdown(field.value)}
                        </div>
                      {/if}
                    </div>
                  {/if}
                {/each}
              </div>
            {/if}

            <!-- Thumbnail -->
            {#if embed.thumbnail?.url}
              <div class="absolute top-4 right-4 w-20 h-20">
                <img src={embed.thumbnail.url} alt="Thumbnail" class="w-full h-full object-cover rounded-lg">
              </div>
            {/if}

            <!-- Image -->
            {#if embed.image?.url}
              <div class="mt-4">
                <img src={embed.image.url} alt="" class="max-w-full rounded-lg">
              </div>
            {/if}

            <!-- Footer -->
            {#if embed.footer?.text || embed.footer?.icon_url}
              <div class="flex items-center mt-4 text-gray-400 text-xs">
                {#if embed.footer.icon_url}
                  <img src={embed.footer.icon_url} alt="Footer icon" class="w-5 h-5 rounded-full mr-2">
                {/if}
                <span>{embed.footer.text}</span>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    {/each}

    <!-- Components Preview -->
    {#if componentRows.length > 0}
      <div class="mt-4 space-y-2">
        {#each componentRows as row, rowIndex (row.rowKey)}
          {#if row.components && row.components.length > 0}
            <div class="flex flex-wrap justify-start gap-2">
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
                        class="{getButtonColorClass(component.style)} relative discord-button button-content flex justify-center grow-0 items-center box-border border-0 rounded-sm px-4 py-[2px] min-h-[32px] text-sm font-medium leading-[16px] transition-colors duration-200 select-none"
                  disabled
                  aria-label={component.displayName}
                >
                  <div class="flex items-center justify-center">
                    <div class="flex items-center gap-2">
                      {#if component.emoji}
                        {@const parsedEmoji = parseEmojiForDisplay(component.emoji)}
                        {#if parsedEmoji}
                          <img src={parsedEmoji.url} alt={parsedEmoji.name}
                               class="w-[1.2em] h-[1.2em] inline-flex items-center justify-center align-[-0.1em]" />
                        {:else}
                          <span
                            class="emoji w-[1.2em] h-[1.2em] inline-flex items-center justify-center align-[-0.1em]">
                            {component.emoji}
                          </span>
                        {/if}
                      {/if}
                      <span class="truncate">{component.displayName}</span>
                    </div>
                  </div>
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
  .discord-button {
    transition: transform 0.1s ease;
  }
  
  .discord-button:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  /* Inline field layout for desktop */
  .inline-field {
    display: inline-block;
    width: calc(33.333% - 8px);
    margin-right: 8px;
    vertical-align: top;
  }

  /* Stack fields on mobile */
  @media (max-width: 768px) {
    .inline-field {
      display: block;
      width: 100%;
      margin-right: 0;
      margin-bottom: 8px;
    }
  }

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
  :global(.preview-content) strong {
    font-weight: 600;
  }

  :global(.preview-content) em {
    font-style: italic;
  }

  :global(.preview-content) code {
    background: #2f3136;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
  }

  :global(.preview-content) pre {
    background: #2f3136;
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
  }

  :global(.preview-content) blockquote {
    border-left: 4px solid #4f545c;
    padding-left: 8px;
    margin: 4px 0;
  }
</style>