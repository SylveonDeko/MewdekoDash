<script lang="ts" module>
  import type { EmojiInfo, GuildEmojiInfo } from "$lib/api/client/models";

  export type EmojiOption = EmojiInfo & {
    guildId: string;
    guildName: string;
  };

  export type UnicodeEmojiOption = {
    name: string;
    unicode: string;
    searchTerms: string[];
    isUnicode: true;
  };

  export type AnyEmojiOption = EmojiOption | UnicodeEmojiOption;
</script>

<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { fly } from "svelte/transition";
  import reducedMotion from "$lib/reducedMotion";
  import Portal from "$lib/components/ui/Portal.svelte";
  import { onMount } from "svelte";
  import { unicodeEmojiStore } from "$lib/stores/unicodeEmojiStore";

  interface Props {
    // Props
    guildEmojis: GuildEmojiInfo[];
    selected?: string | string[] | null;
    multiple?: boolean;
    maxSelection?: number; // Max number of emojis that can be selected (only applies when multiple=true)
    placeholder?: string;
    searchable?: boolean;
    disabled?: boolean;
    groupByGuild?: boolean;
    showUnicodeEmojis?: boolean; // Enable Unicode emoji tab
    onchange?: (detail: {
      selected: string | string[] | null;
      emoji: AnyEmojiOption | AnyEmojiOption[] | null
    }) => void;
  }

  let {
    guildEmojis = [],
    selected = $bindable(null),
    multiple = false,
    maxSelection,
    placeholder = "Select an emoji...",
    searchable = true,
    disabled = false,
    groupByGuild = true,
    showUnicodeEmojis = true,
    onchange
  }: Props = $props();

  // Internal state
  let isOpen = $state(false);
  let searchTerm = $state("");
  let manualInput = $state("");
  let manualInputError = $state("");
  let dropdownRef: HTMLDivElement = $state()!;
  let searchInputRef: HTMLInputElement = $state()!;
  let containerRef: HTMLDivElement = $state()!;
  let dropdownId = `emoji-dropdown-${Math.random().toString(36).substring(2, 9)}`;
  let isMobile = $state(false);
  let activeTab = $state<"discord" | "unicode">("discord"); // Tab state
  let dropdownPosition = $state<"below" | "above">("below"); // Dropdown position
  let scrollContainerRef: HTMLElement = $state()!;
  let isLoadingTab = $state(false);


  // Detect mobile
  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  });

  // Reset scroll position when switching tabs
  $effect(() => {
    // Track activeTab so effect runs when it changes
    activeTab;
    if (scrollContainerRef && isOpen) {
      scrollContainerRef.scrollTop = 0;
    }
  });

  // Handle tab switching with loading state
  function switchTab(newTab: "discord" | "unicode") {
    if (activeTab === newTab) return;

    isLoadingTab = true;
    // Defer tab switch to next tick to show loading state
    setTimeout(() => {
      activeTab = newTab;
      // Give browser time to render
      requestAnimationFrame(() => {
        isLoadingTab = false;
      });
    }, 0);
  }

  // Flatten emojis with guild info (state so we can add custom emojis)
  let customEmojis = $state<EmojiOption[]>([]);

  let allEmojis = $derived(
    [
      ...guildEmojis.flatMap(guild =>
        guild.emojis.map(emoji => ({
          ...emoji,
          guildId: guild.guild.id,
          guildName: guild.guild.name
        } as EmojiOption))
      ),
      ...customEmojis
    ]
  );

  // Extract emoji ID from Discord format if needed
  function getEmojiId(value: string | null): string | null {
    if (!value) return null;
    // Check if it's a Discord emoji format: <:name:id> or <a:name:id>
    const match = value.match(/<a?:[^:]+:(\d+)>/);
    return match ? match[1] : value;
  }

  // Parse selected prop to extract IDs
  let selectedIds = $derived(() => {
    if (multiple) {
      const arr = Array.isArray(selected) ? selected : (selected ? [selected] : []);
      return arr.map(v => getEmojiId(v)).filter(id => id !== null) as string[];
    } else {
      return getEmojiId(selected as string | null);
    }
  });

  // Get all emojis - render everything, let browser optimize with content-visibility
  let unicodeEmojis = $derived(
    activeTab === "unicode" && showUnicodeEmojis && isOpen
      ? unicodeEmojiStore.search(searchTerm)
      : []
  );

  // Filter emojis based on search - render all, browser optimizes
  let filteredEmojis = $derived(
    searchable && searchTerm && activeTab === "discord"
      ? allEmojis.filter(emoji =>
        emoji.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : activeTab === "discord" ? allEmojis : []
  );

  // Group filtered emojis by guild
  let groupedEmojis = $derived(() => {
    if (!groupByGuild) return null;

    const groups = new Map<string, { guild: { id: string; name: string }; emojis: EmojiOption[] }>();

    for (const emoji of filteredEmojis) {
      if (!groups.has(emoji.guildId)) {
        groups.set(emoji.guildId, {
          guild: { id: emoji.guildId, name: emoji.guildName },
          emojis: []
        });
      }
      groups.get(emoji.guildId)!.emojis.push(emoji);
    }

    return Array.from(groups.values());
  });

  // Get count of all selected items (both Discord and Unicode emojis)
  let selectedArray = $derived(() => {
    if (!multiple) return [];
    if (!Array.isArray(selected)) return [];
    return selected; // This includes both Discord format strings and Unicode strings
  });

  let hasSelection = $derived(
    multiple
      ? selectedArray().length > 0
      : selectedIds() !== null
  );

  let isMaxReached = $derived(
    multiple && maxSelection ? selectedArray().length >= maxSelection : false
  );

  // Type guard to check if emoji is Unicode
  function isUnicodeEmoji(emoji: AnyEmojiOption): emoji is UnicodeEmojiOption {
    return "isUnicode" in emoji && emoji.isUnicode === true;
  }

  // Get emoji URL using WebP like Discord does
  function getEmojiUrl(emoji: EmojiOption): string {
    const baseUrl = `https://cdn.discordapp.com/emojis/${emoji.id}.webp?size=48`;
    return emoji.animated ? `${baseUrl}&animated=true` : baseUrl;
  }

  // Handle emoji selection
  function selectEmoji(emoji: AnyEmojiOption) {
    // Handle Unicode emoji selection
    if (isUnicodeEmoji(emoji)) {
      if (multiple) {
        const currentSelected = Array.isArray(selected) ? selected : [];
        const emojiValue = emoji.unicode;

        // Check if already selected
        const index = currentSelected.indexOf(emojiValue);

        if (index === -1) {
          // Check if we can add more
          if (maxSelection && currentSelected.length >= maxSelection) {
            return;
          }
          selected = [...currentSelected, emojiValue];
        } else {
          // Remove
          selected = currentSelected.filter(s => s !== emojiValue);
        }

        // Get selected emoji objects for the callback (only new selection, not filtering all)
        const selectedEmojis = index === -1 ? [emoji] : [];
        onchange?.({ selected, emoji: selectedEmojis });

        if (!isMobile) {
          // Desktop: could auto-close or stay open
        }
      } else {
        // Single selection - use the actual unicode character
        selected = emoji.unicode;
        closeDropdown();
        onchange?.({ selected, emoji });
      }
      return;
    }

    // Handle Discord custom emoji selection (existing code)
    if (multiple) {
      const currentSelected = Array.isArray(selected) ? selected : [];
      const emojiId = emoji.id;
      const formattedEmoji = `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`;

      // Check if already selected (by ID)
      const currentArray = selectedArray();
      const index = currentArray.findIndex(s => getEmojiId(s) === emojiId);

      if (index === -1) {
        // Check if we can add more
        if (maxSelection && currentSelected.length >= maxSelection) {
          return; // Don't allow adding more
        }
        selected = [...currentSelected, formattedEmoji];
      } else {
        // Remove by finding the formatted string
        const actualSelected = Array.isArray(selected) ? selected : [];
        selected = actualSelected.filter(s => getEmojiId(s) !== emojiId);
      }

      // Get selected emoji objects for the callback
      const selectedEmojis = allEmojis.filter(e => currentArray.some(s => getEmojiId(s) === e.id));
      onchange?.({ selected, emoji: selectedEmojis });

      // Don't close on mobile for multiple selection
      if (!isMobile) {
        // Desktop: could auto-close or stay open
      }
    } else {
      // Format as Discord emoji: <:name:id> or <a:name:id>
      const formattedEmoji = `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`;
      selected = formattedEmoji;
      closeDropdown();
      onchange?.({ selected, emoji });
    }
  }

  // Handle done button (mobile multi-select)
  function handleDone() {
    closeDropdown();
  }

  // Remove selected emoji (for multiple mode)
  function removeEmoji(emojiId: string, event: Event) {
    event.stopPropagation();
    if (multiple && Array.isArray(selected)) {
      selected = selected.filter(s => getEmojiId(s) !== emojiId);
      const currentArray = selectedArray();
      const selectedEmojis = allEmojis.filter(e => currentArray.some(s => getEmojiId(s) === e.id));
      onchange?.({ selected, emoji: selectedEmojis });
    }
  }

  // Calculate dropdown position based on available space
  function calculateDropdownPosition() {
    if (!containerRef || isMobile) {
      dropdownPosition = "below"; // Default to below for mobile
      return;
    }

    const rect = containerRef.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 600; // Approximate dropdown height

    // Check if dropdown would go above viewport when positioned "above"
    const wouldGoAboveViewport = rect.top - dropdownHeight < 0;

    // Check if dropdown would go below viewport when positioned "below"
    const wouldGoBelowViewport = rect.bottom + dropdownHeight > viewportHeight;

    // Decision logic:
    // 1. If it would go above viewport when "above", force "below"
    // 2. If it would go below viewport when "below", force "above"
    // 3. Otherwise, prefer "above" if there's enough space, else "below"
    if (wouldGoAboveViewport && !wouldGoBelowViewport) {
      dropdownPosition = "below";
    } else if (wouldGoBelowViewport && !wouldGoAboveViewport) {
      dropdownPosition = "above";
    } else if (wouldGoAboveViewport && wouldGoBelowViewport) {
      // Not enough space either way, choose the one with more space
      dropdownPosition = spaceAbove > spaceBelow ? "above" : "below";
    } else {
      // Enough space both ways, prefer above
      dropdownPosition = spaceAbove >= dropdownHeight ? "above" : "below";
    }
  }

  // Dropdown control
  function toggleDropdown() {
    if (disabled) return;
    isOpen = !isOpen;
    if (isOpen) {
      searchTerm = "";
      manualInput = "";
      manualInputError = "";
      calculateDropdownPosition();
      setTimeout(() => {
        if (searchable && searchInputRef) {
          searchInputRef.focus();
        }
      }, 0);
    }
  }

  function closeDropdown() {
    isOpen = false;
    searchTerm = "";
    manualInput = "";
    manualInputError = "";
  }

  // Keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (disabled) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (!isOpen) {
          toggleDropdown();
        }
        break;

      case "Escape":
        closeDropdown();
        break;
    }
  }

  // Click outside handler
  function handleClickOutside(event: MouseEvent) {
    if (!isOpen) return;

    const target = event.target as Node;

    if (containerRef && !containerRef.contains(target)) {
      closeDropdown();
    }
  }

  // Setup click outside listener (desktop only)
  $effect(() => {
    if (isOpen && !isMobile) {
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 10);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
    return () => {
    };
  });

  // Lock body scroll when modal is open (mobile only)
  $effect(() => {
    if (isOpen && isMobile) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    return () => {
    };
  });

  // Clear all selections
  function clearAll(event: Event) {
    event.stopPropagation();
    selected = multiple ? [] : null;
    onchange?.({ selected, emoji: null });
  }

  // Parse Discord emoji format: <:name:id> or <a:name:id>
  function parseDiscordEmoji(input: string): EmojiOption | null {
    const regex = /<(a?):([^:]+):(\d+)>/;
    const match = input.trim().match(regex);

    if (!match) {
      return null;
    }

    const [, animatedFlag, name, id] = match;
    const animated = animatedFlag === "a";

    return {
      id,
      name,
      animated,
      isAvailable: true,
      roleIds: [],
      requireColons: true,
      url: `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}?size=256&quality=lossless`,
      guildId: "custom",
      guildName: "Custom Input"
    };
  }

  // Handle manual emoji input
  function handleManualInput() {
    manualInputError = "";

    if (!manualInput.trim()) {
      manualInputError = "Please enter an emoji";
      return;
    }

    const parsedEmoji = parseDiscordEmoji(manualInput);

    if (!parsedEmoji) {
      manualInputError = "Invalid emoji format. Use Discord format: <:name:id> or <a:name:id>";
      return;
    }

    // Check if we already have this emoji selected
    if (multiple) {
      const currentSelected = Array.isArray(selected) ? selected : [];
      if (currentSelected.includes(parsedEmoji.id)) {
        manualInputError = "This emoji is already selected";
        return;
      }

      // Check max selection
      if (maxSelection && currentSelected.length >= maxSelection) {
        manualInputError = `Maximum ${maxSelection} emoji${maxSelection !== 1 ? "s" : ""} allowed`;
        return;
      }

      // Add the formatted emoji string
      const formattedEmoji = `<${parsedEmoji.animated ? "a" : ""}:${parsedEmoji.name}:${parsedEmoji.id}>`;
      selected = [...currentSelected, formattedEmoji];

      // Add to customEmojis if not already there
      if (!allEmojis.some(e => e.id === parsedEmoji.id)) {
        customEmojis = [...customEmojis, parsedEmoji];
      }

      const currentArray = selectedArray();
      const selectedEmojis = allEmojis.filter(e => currentArray.some(s => getEmojiId(s) === e.id));
      onchange?.({ selected, emoji: selectedEmojis });
    } else {
      // Add to customEmojis if not already there
      if (!allEmojis.some(e => e.id === parsedEmoji.id)) {
        customEmojis = [...customEmojis, parsedEmoji];
      }

      // Format as Discord emoji
      const formattedEmoji = `<${parsedEmoji.animated ? "a" : ""}:${parsedEmoji.name}:${parsedEmoji.id}>`;
      selected = formattedEmoji;
      onchange?.({ selected, emoji: parsedEmoji });
      closeDropdown();
    }

    // Clear input on success
    manualInput = "";
  }

  // Handle Enter key in manual input
  function handleManualInputKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleManualInput();
    }
  }

  // Get selected emoji objects for display
  let selectedEmojis = $derived(() => {
    if (!multiple) {
      // Single selection - just return the one emoji
      const currentId = selectedIds();
      if (currentId !== null) {
        const discordEmoji = allEmojis.find(e => e.id === currentId);
        if (discordEmoji) return [discordEmoji];
      }

      // Check for Unicode emoji
      if (selected && typeof selected === "string" && !selected.startsWith("<")) {
        const match = unicodeEmojiStore.getByUnicode(selected);
        if (match) {
          return [{ ...match, isUnicode: true }];
        }
      }

      return [];
    }

    // Multiple selection - preserve the order from `selected` array
    if (!Array.isArray(selected)) return [];

    const result: AnyEmojiOption[] = [];

    for (const sel of selected) {
      if (!sel.startsWith("<")) {
        // Unicode emoji
        const match = unicodeEmojiStore.getByUnicode(sel);
        if (match) {
          result.push({ ...match, isUnicode: true });
        }
      } else {
        // Discord custom emoji - extract ID and find in allEmojis
        const emojiId = getEmojiId(sel);
        if (emojiId) {
          const discordEmoji = allEmojis.find(e => e.id === emojiId);
          if (discordEmoji) {
            result.push(discordEmoji);
          }
        }
      }
    }

    return result;
  });

  let selectedDisplayText = $derived(() => {
    if (!hasSelection) return placeholder;

    if (multiple) {
      const count = selectedArray().length;
      if (count === 0) return placeholder;
      return `${count} emoji${count !== 1 ? "s" : ""} selected`;
    } else {
      const firstEmoji = selectedEmojis()[0];
      if (!firstEmoji) return placeholder;
      return isUnicodeEmoji(firstEmoji) ? firstEmoji.name : firstEmoji.name;
    }
  });

  // Get emoji URL or unicode for display in selector button
  function getSelectedEmojiDisplay(): { type: "url" | "unicode"; value: string } | null {
    if (!hasSelection || multiple) return null;
    const emoji = selectedEmojis()[0];
    if (!emoji) return null;

    if (isUnicodeEmoji(emoji)) {
      return { type: "unicode", value: emoji.unicode };
    }
    return {
      type: "url",
      value: `https://cdn.discordapp.com/emojis/${emoji.id}.png?size=32&quality=lossless`
    };
  }
</script>

{#snippet emojiContent()}
  <!-- Tab switcher -->
  {#if showUnicodeEmojis}
    <div class="p-3 border-b border-opacity-30 flex gap-2" style="border-color: {$colorStore.primary};">
      <button
        type="button"
        class="flex-1 py-2 px-4 rounded-lg font-medium"
        class:shadow-md={activeTab === 'discord'}
        disabled={isLoadingTab}
        style="background: {activeTab === 'discord' ? $colorStore.primary + '40' : $colorStore.primary + '10'};
               color: {$colorStore.text};"
        onclick={() => switchTab('discord')}
      >
        <i class="fa-brands fa-discord mr-2"></i>
        Discord
      </button>
      <button
        type="button"
        class="flex-1 py-2 px-4 rounded-lg font-medium"
        class:shadow-md={activeTab === 'unicode'}
        disabled={isLoadingTab}
        style="background: {activeTab === 'unicode' ? $colorStore.primary + '40' : $colorStore.primary + '10'};
               color: {$colorStore.text};"
        onclick={() => switchTab('unicode')}
      >
        <i class="fa-regular fa-face-smile mr-2"></i>
        Unicode
      </button>
    </div>
  {/if}

  <!-- Search input -->
  {#if searchable}
    <div class="p-4 pb-2 border-b border-opacity-30" style="border-color: {$colorStore.primary};">
      <div class="relative">
        <i
          class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2"
          style="color: {$colorStore.muted}; font-size: 16px;"
        ></i>
        <input
          bind:this={searchInputRef}
          bind:value={searchTerm}
          type="text"
          placeholder="Search emojis..."
          class="w-full pl-10 pr-3 py-2 rounded-lg border transition-all duration-200"
          style="background: {$colorStore.primary}08;
                 border-color: {$colorStore.primary}30;
                 color: {$colorStore.text};"
        />
      </div>
    </div>
  {/if}

  <!-- Manual emoji input (Discord tab only) -->
  {#if activeTab === 'discord'}
    <div class="p-4 pb-2 border-b border-opacity-30" style="border-color: {$colorStore.primary};">
      <div class="text-xs font-semibold mb-2" style="color: {$colorStore.muted}">
        Or paste emoji code:
      </div>
    <div class="flex gap-2">
      <div class="relative flex-1">
        <i
          class="fa-solid fa-code absolute left-3 top-1/2 transform -translate-y-1/2"
          style="color: {$colorStore.muted}; font-size: 14px;"
        ></i>
        <input
          bind:value={manualInput}
          type="text"
          placeholder="<:name:123456789>"
          onkeydown={handleManualInputKeydown}
          class="w-full pl-9 pr-3 py-2 rounded-lg border transition-all duration-200 text-sm font-mono"
          style="background: {$colorStore.primary}08;
                 border-color: {manualInputError ? '#ef4444' : $colorStore.primary + '30'};
                 color: {$colorStore.text};"
        />
      </div>
      <button
        type="button"
        onclick={handleManualInput}
        class="px-4 py-2 rounded-lg transition-all duration-200 font-medium shrink-0"
        style="background: {$colorStore.primary}30; color: {$colorStore.text};"
      >
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
      {#if manualInputError}
        <div class="text-xs mt-1" style="color: #ef4444">
          {manualInputError}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Emojis grid -->
  <div bind:this={scrollContainerRef} class="flex-1 overflow-y-auto overflow-x-hidden p-4 relative">
    <!-- Loading skeleton (position absolute to prevent size changes) -->
    {#if isLoadingTab}
      <div
        class="absolute inset-0 grid gap-2 p-4 bg-gradient-to-b from-transparent via-black/20 to-transparent"
        class:grid-cols-6={isMobile}
        class:grid-cols-12={!isMobile}
        in:fly={{ y: 0, opacity: 0, duration: 150 }}
        out:fly={{ y: 0, opacity: 0, duration: 150 }}
      >
        {#each Array(60) as _, i (i)}
          <div
            class="aspect-square rounded-lg animate-pulse"
            style="background: {$colorStore.primary}15;"
          ></div>
        {/each}
      </div>
    {/if}

    <!-- Content with fade transition -->
    <div class="transition-opacity duration-150" class:opacity-0={isLoadingTab}>
      {#if activeTab === 'unicode'}
        <!-- Unicode emoji grid -->
        {#if unicodeEmojis.length === 0}
          <div class="text-center py-8" style="color: {$colorStore.muted}">
            {searchTerm ? 'No matching emojis found' : 'No emojis available'}
          </div>
        {:else}
          <div class="grid gap-2" class:grid-cols-6={isMobile} class:grid-cols-12={!isMobile}>
            {#each unicodeEmojis as emoji (emoji.unicode)}
              {@const
                isSelected = multiple ? (Array.isArray(selected) ? selected : []).includes(emoji.unicode) : selected === emoji.unicode}
              {@const canSelect = !isSelected && (!isMaxReached || !multiple)}

              <button
                type="button"
                class="emoji-item aspect-square rounded-lg p-2 relative"
                class:opacity-50={!canSelect && !isSelected}
                class:cursor-not-allowed={!canSelect && !isSelected}
                disabled={!canSelect && !isSelected}
                style="background: {isSelected ? `${$colorStore.primary}40` : 'transparent'};
                     border: 2px solid {isSelected ? $colorStore.primary : 'transparent'};
                     --hover-bg: {$colorStore.primary}20;
                     content-visibility: auto;
                     contain-intrinsic-size: 56px;"
                onclick={() => selectEmoji({ ...emoji, isUnicode: true })}
                role="option"
                aria-selected={isSelected}
                title={emoji.name}
              >
                <!-- Unicode emoji -->
                <div class="w-full h-full flex items-center justify-center text-3xl">
                  {emoji.unicode}
                </div>

                <!-- Selection indicator -->
                {#if isSelected}
                  <div
                    class="absolute top-0 right-0 w-4 h-4 rounded-full flex items-center justify-center"
                    style="background: {$colorStore.primary}"
                  >
                    <i class="fa-solid fa-check" style="color: white; font-size: 8px;"></i>
                  </div>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      {:else if filteredEmojis.length === 0}
      <div class="text-center py-8" style="color: {$colorStore.muted}">
        {searchTerm ? 'No matching emojis found' : 'No emojis available'}
      </div>
    {:else if groupByGuild && groupedEmojis()}
        {#each groupedEmojis() || [] as group}
        <div class="mb-4">
          <!-- Guild header -->
          <div class="text-xs font-semibold mb-2 px-1" style="color: {$colorStore.muted}">
            {group.guild.name}
          </div>

          <!-- Emoji grid -->
          <div class="grid gap-2" class:grid-cols-6={isMobile} class:grid-cols-12={!isMobile}>
            {#each group.emojis as emoji (emoji.id)}
              {@const
                isSelected = multiple ? selectedArray().some(s => getEmojiId(s) === emoji.id) : selectedIds() === emoji.id}
              {@const canSelect = !isSelected && (!isMaxReached || !multiple)}

              <button
                type="button"
                class="emoji-item aspect-square rounded-lg p-2 relative"
                class:opacity-50={!canSelect && !isSelected}
                class:cursor-not-allowed={!canSelect && !isSelected}
                disabled={!canSelect && !isSelected}
                style="background: {isSelected ? `${$colorStore.primary}40` : 'transparent'};
                       border: 2px solid {isSelected ? $colorStore.primary : 'transparent'};
                       --hover-bg: {$colorStore.primary}20;
                       content-visibility: auto;
                       contain-intrinsic-size: 56px;"
                onclick={() => selectEmoji(emoji)}
                role="option"
                aria-selected={isSelected}
                title={emoji.name}
              >
                <!-- Emoji image -->
                <img
                  src={getEmojiUrl(emoji)}
                  alt={emoji.name}
                  class="w-full h-full object-contain"
                  loading="lazy"
                />

                <!-- Selection indicator -->
                {#if isSelected}
                  <div
                    class="absolute top-0 right-0 w-4 h-4 rounded-full flex items-center justify-center"
                    style="background: {$colorStore.primary}"
                  >
                    <i class="fa-solid fa-check" style="color: white; font-size: 8px;"></i>
                  </div>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/each}
    {:else}
      <!-- Ungrouped grid -->
      <div class="grid gap-2" class:grid-cols-6={isMobile} class:grid-cols-12={!isMobile}>
        {#each filteredEmojis as emoji (emoji.id)}
          {@const
            isSelected = multiple ? selectedArray().some(s => getEmojiId(s) === emoji.id) : selectedIds() === emoji.id}
          {@const canSelect = !isSelected && (!isMaxReached || !multiple)}

          <button
            type="button"
            class="emoji-item aspect-square rounded-lg p-2 relative"
            class:opacity-50={!canSelect && !isSelected}
            class:cursor-not-allowed={!canSelect && !isSelected}
            disabled={!canSelect && !isSelected}
            style="background: {isSelected ? `${$colorStore.primary}40` : 'transparent'};
                   border: 2px solid {isSelected ? $colorStore.primary : 'transparent'};
                   --hover-bg: {$colorStore.primary}20;
                   content-visibility: auto;
                   contain-intrinsic-size: 56px;"
            onclick={() => selectEmoji(emoji)}
            role="option"
            aria-selected={isSelected}
            title={emoji.name}
          >
            <!-- Emoji image -->
            <img
              src={getEmojiUrl(emoji)}
              alt={emoji.name}
              class="w-full h-full object-contain"
              loading="lazy"
            />

            <!-- Selection indicator -->
            {#if isSelected}
              <div
                class="absolute top-0 right-0 w-4 h-4 rounded-full flex items-center justify-center"
                style="background: {$colorStore.primary}"
              >
                <i class="fa-solid fa-check" style="color: white; font-size: 8px;"></i>
              </div>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
    </div>
  </div>

  <!-- Footer with Done button for multi-select -->
  {#if multiple}
    <div class="p-4 border-t shrink-0" style="border-color: {$colorStore.primary}50;">
      <button
        type="button"
        onclick={handleDone}
        class="w-full py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02]"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      >
        <i class="fa-solid fa-check inline mr-2" style="font-size: 14px;"></i>
        Done{selectedArray().length > 0 ? ` (${selectedArray().length} selected)` : ''}
      </button>
    </div>
  {/if}
{/snippet}

<div
  aria-controls={dropdownId}
  aria-expanded={isOpen}
  aria-haspopup="listbox"
  bind:this={containerRef}
  class="relative"
  onkeydown={handleKeydown}
  role="combobox"
  tabindex={disabled ? -1 : 0}
>
  <!-- Main selector button -->
  <button
    aria-label="Select emoji"
    class="group w-full p-2.5 rounded-xl border transition-all duration-200 text-left flex items-center backdrop-blur-md relative overflow-hidden"
    class:cursor-not-allowed={disabled}
    class:opacity-50={disabled}
    {disabled}
    onclick={toggleDropdown}
    style="background: {$colorStore.primary}08;
           border-color: {isOpen ? $colorStore.primary : $colorStore.primary + '30'};
           color: {$colorStore.text};
           min-height: 50px;"
    type="button"
  >
    <!-- Hover gradient overlay -->
    <div
      class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style="background: {$colorStore.primary}12;"
    ></div>

    <div class="flex items-center gap-3 flex-1 min-w-0 overflow-hidden relative z-10">
      <!-- Type icon or selected emoji -->
      {#if !multiple && getSelectedEmojiDisplay()}
        {@const display = getSelectedEmojiDisplay()}
        {#if display && display.type === 'unicode'}
          <div class="text-xl shrink-0">
            {display.value}
          </div>
        {:else if display && display.type === 'url'}
          <img
            src={display.value}
            alt={selectedEmojis()[0]?.name || 'emoji'}
            class="w-6 h-6 shrink-0 object-contain"
          />
        {/if}
      {:else}
        <i
          class="fa-utility-duo fa-regular fa-face-smile"
          style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 16px;"
        ></i>
      {/if}

      <!-- Selected content -->
      <div class="flex-1 min-w-0 pr-2 flex items-center h-[28px]">
        {#if multiple && selectedArray().length > 0}
          <div class="flex flex-nowrap gap-1 overflow-x-auto scrollbar-hide w-full">
            {#each selectedEmojis().slice(0, 5) as emoji}
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-sm flex-shrink-0"
                style="background: {$colorStore.primary}20; color: {$colorStore.text};"
              >
                {#if isUnicodeEmoji(emoji)}
                  <span class="text-base">{emoji.unicode}</span>
                  <span
                    class="hover:bg-black/20 rounded-sm p-0.5 cursor-pointer"
                    onclick={(e) => {
                      e.stopPropagation();
                      if (multiple && Array.isArray(selected)) {
                        selected = selected.filter(s => s !== emoji.unicode);
                        onchange?.({ selected, emoji: selectedEmojis() });
                      }
                    }}
                    onkeydown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        if (multiple && Array.isArray(selected)) {
                          selected = selected.filter(s => s !== emoji.unicode);
                          onchange?.({ selected, emoji: selectedEmojis() });
                        }
                      }
                    }}
                    role="button"
                    tabindex="0"
                    aria-label="Remove {emoji.name}"
                  >
                    <i class="fa-solid fa-xmark" style="font-size: 12px;"></i>
                  </span>
                {:else}
                  <img src={getEmojiUrl(emoji)} alt={emoji.name} class="w-4 h-4 object-contain" />
                  <span
                    class="hover:bg-black/20 rounded-sm p-0.5 cursor-pointer"
                    onclick={(e) => removeEmoji(emoji.id, e)}
                    onkeydown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        removeEmoji(emoji.id, e);
                      }
                    }}
                    role="button"
                    tabindex="0"
                    aria-label="Remove {emoji.name}"
                  >
                    <i class="fa-solid fa-xmark" style="font-size: 12px;"></i>
                  </span>
                {/if}
              </span>
            {/each}
            {#if selectedArray().length > 5}
              <span
                class="px-2 py-0.5 rounded-lg text-sm flex-shrink-0"
                style="background: {$colorStore.primary}20; color: {$colorStore.text};"
              >
                +{selectedArray().length - 5}
              </span>
            {/if}
          </div>
        {:else}
          <span class="truncate flex items-center h-full" class:opacity-60={!hasSelection}>
            {selectedDisplayText()}
          </span>
        {/if}
      </div>
    </div>

    <!-- Right side controls -->
    <div class="flex items-center gap-2 shrink-0 ml-2 relative z-10">
      {#if multiple && maxSelection}
        <span class="text-xs px-2 py-1 rounded"
              style="background: {$colorStore.primary}15; color: {isMaxReached ? '#ef4444' : $colorStore.text};">
          {selectedArray().length}/{maxSelection}
        </span>
      {/if}

      {#if hasSelection && !disabled}
        <span
          class="p-1 hover:bg-black/20 rounded-sm shrink-0 cursor-pointer"
          onclick={clearAll}
          onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              clearAll(e);
            }
          }}
          role="button"
          tabindex="0"
          aria-label="Clear selection"
        >
          <i class="fa-solid fa-xmark" style="color: {$colorStore.muted}; font-size: 14px;"></i>
        </span>
      {/if}

      <div class="transition-transform duration-200 shrink-0" class:rotate-180={isOpen}>
        <i class="fa-solid fa-chevron-down" style="color: {$colorStore.muted}; font-size: 14px;"></i>
      </div>
    </div>
  </button>

  <!-- Mobile: Full-screen Portal Modal -->
  {#if isOpen && isMobile}
    <Portal>
      <div
        bind:this={dropdownRef}
        id={dropdownId}
        class="fixed inset-0 z-[9999] flex flex-col backdrop-blur-md"
        style="background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.9)), linear-gradient(135deg, {$colorStore.gradientStart}25, {$colorStore.gradientMid}30, {$colorStore.gradientEnd}25);"
        role="listbox"
        aria-multiselectable={multiple}
        in:fly={{ y: 300, duration: 300 }}
        out:fly={{ y: 300, duration: 300 }}
      >
        <!-- Mobile Header -->
        <div class="flex items-center justify-between p-4 border-b shrink-0"
             style="border-color: {$colorStore.primary}50;">
          <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">Select Emoji</h3>
          <button
            type="button"
            onclick={closeDropdown}
            class="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <i class="fa-solid fa-xmark" style="color: {$colorStore.text}; font-size: 20px;"></i>
          </button>
        </div>

        {@render emojiContent()}
      </div>
    </Portal>
  {/if}

  <!-- Desktop: Dropdown -->
  {#if isOpen && !isMobile}
    <div
      bind:this={dropdownRef}
      id={dropdownId}
      class="absolute left-0 right-0 rounded-lg flex flex-col shadow-2xl border backdrop-blur-md z-[9999] overflow-hidden"
      class:bottom-full={dropdownPosition === 'above'}
      class:mb-1={dropdownPosition === 'above'}
      class:top-full={dropdownPosition === 'below'}
      class:mt-1={dropdownPosition === 'below'}
      style="background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.8)), linear-gradient(135deg, {$colorStore.gradientStart}25, {$colorStore.gradientMid}30, {$colorStore.gradientEnd}25);
             border-color: {$colorStore.primary}50;
             box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px {$colorStore.primary}20;
             max-height: min(600px, 80vh);
             transform-origin: {dropdownPosition === 'above' ? 'bottom' : 'top'};"
      role="listbox"
      aria-multiselectable={multiple}
      in:fly={{ y: dropdownPosition === 'above' ? 8 : -8, duration: 200 }}
      out:fly={{ y: dropdownPosition === 'above' ? 8 : -8, duration: 200 }}
    >
      {@render emojiContent()}
    </div>
  {/if}
</div>

<style lang="postcss">
    /* Hide scrollbar but keep functionality */
    .scrollbar-hide {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
    }

    .scrollbar-hide::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
    }

    /* Simple hover effect - just background color change (GPU accelerated) */
    .emoji-item:hover:not(:disabled) {
        background: var(--hover-bg) !important;
    }

    .emoji-item:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
    }
</style>
