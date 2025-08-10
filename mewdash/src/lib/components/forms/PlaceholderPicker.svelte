<!-- PlaceholderPicker.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { colorStore } from "$lib/stores/colorStore";
  import { Search, Hash, User, Server, Calendar, BarChart3, Zap } from "lucide-svelte";
  import Portal from "$lib/components/ui/Portal.svelte";
  import { clickOutside } from "$lib/clickOutside";
  import type { ComponentType } from "svelte";


  // TypeScript interfaces
  interface Placeholder {
    category: string;
    name: string;
    description: string;
  }

  interface Position {
    x: number;
    y: number;
  }

  interface InlinePosition extends Position {
    positioning: string;
    direction: 'above' | 'below';
    width: number;
  }

  // Props
  export let visible: boolean = false;
  export let position: Position = { x: 0, y: 0 };
  export let placeholders: Placeholder[] = [];
  export let searchTerm: string = "";
  export let inline: boolean = false;
  export let inputElement: HTMLInputElement | HTMLTextAreaElement | null = null;
  
  // Events
  const dispatch = createEventDispatcher<{
    select: { placeholder: Placeholder };
    close: Record<string, never>;
    search: { term: string };
  }>();

  // Internal state
  let selectedIndex = 0;
  let searchInputRef: HTMLInputElement;
  let containerRef: HTMLDivElement;
  let filteredPlaceholders: Placeholder[] = [];

  // Category icons mapping
  const categoryIcons: Record<string, ComponentType> = {
    'user': User,
    'server': Server,
    'guild': Server,
    'channel': Hash,
    'date': Calendar,
    'time': Calendar,
    'stats': BarChart3,
    'bot': Zap,
    'afk': User,
    'suggest': BarChart3,
    'default': Hash
  };

  // Filter placeholders based on search term
  $: {
    if (searchTerm.trim() === '') {
      filteredPlaceholders = placeholders;
    } else {
      const term = searchTerm.toLowerCase();
      filteredPlaceholders = placeholders.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }
    selectedIndex = 0; // Reset selection when filtering
  }

  // Group placeholders by category
  $: groupedPlaceholders = filteredPlaceholders.reduce((groups, placeholder) => {
    const category = placeholder.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(placeholder);
    return groups;
  }, {} as Record<string, Placeholder[]>);

  // Get icon for category
  function getCategoryIcon(category: string): ComponentType {
    const key = category.toLowerCase();
    return categoryIcons[key] || categoryIcons.default;
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent): void {
    if (!visible) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, filteredPlaceholders.length - 1);
        scrollToSelected();
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        scrollToSelected();
        break;
      case 'Enter':
        event.preventDefault();
        if (filteredPlaceholders[selectedIndex]) {
          selectPlaceholder(filteredPlaceholders[selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
    }
  }

  // Scroll to keep selected item visible
  function scrollToSelected(): void {
    if (!containerRef) return;
    
    const selectedElement = containerRef.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }

  // Select a placeholder
  function selectPlaceholder(placeholder: Placeholder): void {
    if (inline && inputElement) {
      // For inline mode, insert directly into the input element
      insertPlaceholderIntoInput(placeholder);
    } else {
      // For non-inline mode, dispatch event for parent to handle
      dispatch('select', { placeholder });
    }
    
    close();
  }

  // Insert placeholder directly into input element (for inline mode)
  function insertPlaceholderIntoInput(placeholder: Placeholder): void {
    if (!inputElement) return;

    const start = inputElement.selectionStart || 0;
    const end = inputElement.selectionEnd || 0;
    const text = inputElement.value;
    const newText = text.substring(0, start) + placeholder.name + text.substring(end);

    inputElement.value = newText;
    inputElement.selectionStart = inputElement.selectionEnd = start + placeholder.name.length;

    // Trigger input event to update bound values
    const inputEvent = new Event('input', { bubbles: true });
    inputElement.dispatchEvent(inputEvent);

    // Focus back on the input
    inputElement.focus();
  }

  // Close the picker
  function close(): void {
    dispatch('close', {});
  }

  // Handle search input
  function handleSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value !== undefined) {
      searchTerm = target.value;
      dispatch('search', { term: searchTerm });
    }
  }

  // Focus management and accessibility
  function focusSearchInput(): void {
    if (searchInputRef) {
      tick().then(() => {
        searchInputRef?.focus();
        // Announce to screen readers
        const announcement = `Placeholder picker opened. ${filteredPlaceholders.length} placeholders available. Use arrow keys to navigate.`;
        announceToScreenReader(announcement);
      });
    }
  }

  // Screen reader announcements
  function announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Handle selection change announcements
  function announceSelection(placeholder: Placeholder): void {
    const message = `Selected: ${placeholder.name}. ${placeholder.description}`;
    announceToScreenReader(message);
  }

  // Focus search input when opened
  onMount(() => {
    if (visible) {
      focusSearchInput();
    }
  });

  // Update focus when visibility changes
  $: if (visible && searchInputRef) {
    focusSearchInput();
  }

  // Update selection announcement
  $: if (visible && filteredPlaceholders[selectedIndex]) {
    announceSelection(filteredPlaceholders[selectedIndex]);
  }


  // Smart positioning for inline mode
  function getInlinePosition(): InlinePosition {
    if (!inline || !inputElement || typeof window === 'undefined') {
      return { 
        positioning: '', 
        direction: 'below' as const,
        x: 100, // Fallback positioning instead of 0,0
        y: 100,
        width: 320
      };
    }
    
    const rect = inputElement.getBoundingClientRect();
    const menuHeight = 300; // Approximate picker height
    const padding = 10;
    
    const spaceBelow = window.innerHeight - rect.bottom - padding;
    const spaceAbove = rect.top - padding;
    
    // Prefer below, but use above if not enough space below
    const shouldPositionAbove = spaceBelow < menuHeight && spaceAbove > menuHeight;
    
    if (shouldPositionAbove) {
      return { 
        positioning: '',
        direction: 'above' as const,
        x: rect.left,
        y: rect.top - menuHeight - 4,
        width: Math.max(rect.width, 320)
      };
    } else {
      return { 
        positioning: '',
        direction: 'below' as const,
        x: rect.left,
        y: rect.bottom + 4,
        width: Math.max(rect.width, 320)
      };
    }
  }

  // Clamp position to viewport (for fixed mode)
  function getClampedPosition(): Position {
    if (typeof window === 'undefined') return position;
    
    const padding = 20;
    const menuWidth = 320;
    const menuHeight = 400;
    
    let x = position.x;
    let y = position.y;
    
    // Clamp horizontal position
    if (x + menuWidth > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth - padding;
    }
    if (x < padding) {
      x = padding;
    }
    
    // Clamp vertical position
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }
    if (y < padding) {
      y = padding;
    }
    
    return { x, y };
  }

  $: clampedPosition = getClampedPosition();
  $: inlinePosition = getInlinePosition();
</script>

<svelte:window on:keydown={handleKeydown} />

{#if visible}
  {#if !inline}
    <!-- Backdrop for fixed mode -->
    <button
      class="fixed inset-0 z-40 bg-transparent border-none cursor-default"
      on:click={close}
      on:keydown={(e) => e.key === 'Escape' && close()}
      aria-label="Close placeholder picker"
      tabindex="-1"
    ></button>
  {/if}

  <!-- Wrap inline mode in Portal -->
  {#if inline}
    <Portal>
      <div
        bind:this={containerRef}
        use:clickOutside
        on:clickoutside={() => close()}
        class="fixed border rounded-xl shadow-2xl max-h-96 overflow-hidden placeholder-menu backdrop-blur-md"
        style="top: {inlinePosition.y}px;
               left: {inlinePosition.x}px;
               width: {inlinePosition.width}px;
               background: linear-gradient(135deg, {$colorStore.gradientStart}30, {$colorStore.gradientMid}30);
               border-color: {$colorStore.primary}30;
               z-index: 9999;"
        role="dialog"
        aria-modal="true"
        aria-label="Placeholder picker"
        aria-describedby="picker-description"
        transition:fly={{ y: inlinePosition.direction === 'above' ? 10 : -10, duration: 200, easing: cubicOut }}
        tabindex="-1"
      >
        <!-- Search Header -->
        <div class="p-3 border-b" style="border-color: {$colorStore.primary}30;">
          <div class="relative">
            <Search 
              size={16} 
              class="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
              style="color: {$colorStore.muted};" 
            />
            <input
              bind:this={searchInputRef}
              type="text"
              class="w-full pl-10 pr-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2"
              style="background: {$colorStore.primary}20;
                     border: 1px solid {$colorStore.primary}30;
                     color: {$colorStore.text};
                     focus:ring-color: {$colorStore.primary}50;"
              placeholder="Search placeholders..."
              value={searchTerm}
              on:input={handleSearch}
              aria-label="Search placeholders"
            />
          </div>
        </div>

        <!-- Placeholders List -->
        <div class="overflow-y-auto max-h-80" role="listbox" aria-label="Available placeholders">
          {#if filteredPlaceholders.length === 0}
            <!-- No Results -->
            <div class="p-6 text-center">
              <Search size={32} class="mx-auto mb-3 opacity-50" style="color: {$colorStore.muted};" />
              <p class="text-sm font-medium mb-1" style="color: {$colorStore.text};">No placeholders found</p>
              <p class="text-xs" style="color: {$colorStore.muted};">
                Try adjusting your search terms
              </p>
            </div>
          {:else}
            <!-- Group by Categories -->
            {#each Object.entries(groupedPlaceholders) as [category, categoryPlaceholders]}
              <!-- Category Header -->
              <div class="px-3 py-2 border-b border-opacity-20" style="border-color: {$colorStore.primary}20;">
                <div class="flex items-center gap-2">
                  <svelte:component 
                    this={getCategoryIcon(category)} 
                    size={14} 
                    style="color: {$colorStore.primary};" 
                  />
                  <span class="text-xs font-semibold uppercase tracking-wide" 
                        style="color: {$colorStore.primary};">
                    {category}
                  </span>
                  <span class="text-xs" style="color: {$colorStore.muted};">
                    ({categoryPlaceholders.length})
                  </span>
                </div>
              </div>

              <!-- Category Placeholders -->
              {#each categoryPlaceholders as placeholder}
                {@const flatIndex = filteredPlaceholders.indexOf(placeholder)}
                <button
                  class="w-full text-left p-3 transition-all duration-200 hover:bg-opacity-20 border-l-2"
                  style="background: {flatIndex === selectedIndex ? $colorStore.primary + '20' : 'transparent'};
                         border-color: {flatIndex === selectedIndex ? $colorStore.primary : 'transparent'};
                         color: {$colorStore.text};"
                  on:click={() => selectPlaceholder(placeholder)}
                  on:keydown={(e) => e.key === 'Enter' && selectPlaceholder(placeholder)}
                  role="option"
                  aria-selected={flatIndex === selectedIndex}
                  data-index={flatIndex}
                  tabindex={flatIndex === selectedIndex ? 0 : -1}
                >
                  <span class="flex items-start gap-3">
                    <!-- Placeholder Icon/Preview -->
                    <span class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono"
                         style="background: {$colorStore.primary}15; color: {$colorStore.primary};">
                      %
                    </span>
                    
                    <!-- Placeholder Info -->
                    <span class="flex-1 min-w-0">
                      <span class="font-medium text-sm truncate block" style="color: {$colorStore.text};">
                        {placeholder.name}
                      </span>
                      <span class="text-xs mt-0.5 leading-tight block" style="color: {$colorStore.muted};">
                        {placeholder.description}
                      </span>
                    </span>
                  </span>
                  
                  <!-- Selection Indicator -->
                  {#if flatIndex === selectedIndex}
                    <span class="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span class="w-2 h-2 rounded-full block" style="background: {$colorStore.primary};"></span>
                    </span>
                  {/if}
                </button>
              {/each}
            {/each}
          {/if}
        </div>

        <!-- Footer with Shortcuts -->
        <div class="p-2 border-t text-xs" 
             style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <div class="flex items-center justify-between" style="color: {$colorStore.muted};">
            <div class="flex items-center gap-3">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            <div>
              {filteredPlaceholders.length} result{filteredPlaceholders.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  {:else}
    <!-- Fixed position mode (non-inline) -->
    <div
      bind:this={containerRef}
      use:clickOutside
      on:clickoutside={() => close()}
      class="fixed border rounded-xl shadow-2xl max-h-96 w-80 overflow-hidden placeholder-menu backdrop-blur-md"
      style="top: {clampedPosition.y}px;
             left: {clampedPosition.x}px;
             background: linear-gradient(135deg, {$colorStore.gradientStart}30, {$colorStore.gradientMid}30);
             border-color: {$colorStore.primary}30;
             z-index: 9999;"
      role="dialog"
      aria-modal="true"
      aria-label="Placeholder picker"
      transition:fade={{ duration: 150 }}
      tabindex="-1"
    >
      <!-- Search Header -->
      <div class="p-3 border-b" style="border-color: {$colorStore.primary}30;">
        <div class="relative">
          <Search 
            size={16} 
            class="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            style="color: {$colorStore.muted};" 
          />
          <input
            bind:this={searchInputRef}
            type="text"
            class="w-full pl-10 pr-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2"
            style="background: {$colorStore.primary}20;
                   border: 1px solid {$colorStore.primary}30;
                   color: {$colorStore.text};
                   focus:ring-color: {$colorStore.primary}50;"
            placeholder="Search placeholders..."
            value={searchTerm}
            on:input={handleSearch}
            aria-label="Search placeholders"
          />
        </div>
      </div>

      <!-- Placeholders List -->
      <div class="overflow-y-auto max-h-80" role="listbox" aria-label="Available placeholders">
        {#if filteredPlaceholders.length === 0}
          <!-- No Results -->
          <div class="p-6 text-center">
            <Search size={32} class="mx-auto mb-3 opacity-50" style="color: {$colorStore.muted};" />
            <p class="text-sm font-medium mb-1" style="color: {$colorStore.text};">No placeholders found</p>
            <p class="text-xs" style="color: {$colorStore.muted};">
              Try adjusting your search terms
            </p>
          </div>
        {:else}
          <!-- Group by Categories -->
          {#each Object.entries(groupedPlaceholders) as [category, categoryPlaceholders]}
            <!-- Category Header -->
            <div class="px-3 py-2 border-b border-opacity-20" style="border-color: {$colorStore.primary}20;">
              <div class="flex items-center gap-2">
                <svelte:component 
                  this={getCategoryIcon(category)} 
                  size={14} 
                  style="color: {$colorStore.primary};" 
                />
                <span class="text-xs font-semibold uppercase tracking-wide" 
                      style="color: {$colorStore.primary};">
                  {category}
                </span>
                <span class="text-xs" style="color: {$colorStore.muted};">
                  ({categoryPlaceholders.length})
                </span>
              </div>
            </div>

            <!-- Category Placeholders -->
            {#each categoryPlaceholders as placeholder}
              {@const flatIndex = filteredPlaceholders.indexOf(placeholder)}
              <button
                class="w-full text-left p-3 transition-all duration-200 hover:bg-opacity-20 border-l-2"
                style="background: {flatIndex === selectedIndex ? $colorStore.primary + '20' : 'transparent'};
                       border-color: {flatIndex === selectedIndex ? $colorStore.primary : 'transparent'};
                       color: {$colorStore.text};"
                on:click={() => selectPlaceholder(placeholder)}
                on:keydown={(e) => e.key === 'Enter' && selectPlaceholder(placeholder)}
                role="option"
                aria-selected={flatIndex === selectedIndex}
                data-index={flatIndex}
                tabindex={flatIndex === selectedIndex ? 0 : -1}
              >
                <span class="flex items-start gap-3">
                  <!-- Placeholder Icon/Preview -->
                  <span class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono"
                       style="background: {$colorStore.primary}15; color: {$colorStore.primary};">
                    %
                  </span>
                  
                  <!-- Placeholder Info -->
                  <span class="flex-1 min-w-0">
                    <span class="font-medium text-sm truncate block" style="color: {$colorStore.text};">
                      {placeholder.name}
                    </span>
                    <span class="text-xs mt-0.5 leading-tight block" style="color: {$colorStore.muted};">
                      {placeholder.description}
                    </span>
                  </span>
                </span>
                
                <!-- Selection Indicator -->
                {#if flatIndex === selectedIndex}
                  <span class="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span class="w-2 h-2 rounded-full block" style="background: {$colorStore.primary};"></span>
                  </span>
                {/if}
              </button>
            {/each}
          {/each}
        {/if}
      </div>

      <!-- Footer with Shortcuts -->
      <div class="p-2 border-t text-xs" 
           style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
        <div class="flex items-center justify-between" style="color: {$colorStore.muted};">
          <div class="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <div>
            {filteredPlaceholders.length} result{filteredPlaceholders.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  {/if}
{/if}

<style>
  .placeholder-menu {
    /* Custom scrollbar */
    scrollbar-width: thin;
    scrollbar-color: var(--color-primary) transparent;
  }
  
  .placeholder-menu::-webkit-scrollbar {
    width: 6px;
  }
  
  .placeholder-menu::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .placeholder-menu::-webkit-scrollbar-thumb {
    background: var(--color-primary);
    border-radius: 3px;
  }
  
  .placeholder-menu::-webkit-scrollbar-thumb:hover {
    background: var(--color-primary);
    opacity: 0.8;
  }

  /* Focus styles */
  button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }

  input:focus {
    box-shadow: 0 0 0 2px var(--color-primary)50;
  }

  /* Smooth hover transitions */
  button {
    position: relative;
  }

  button:hover {
    transform: translateX(2px);
  }


</style>