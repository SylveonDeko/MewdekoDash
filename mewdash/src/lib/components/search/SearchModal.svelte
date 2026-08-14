<!-- lib/components/search/SearchModal.svelte -->
<script lang="ts">

  import {onDestroy, onMount} from "svelte";
    import {fade, fly} from "svelte/transition";
    import {browser} from "$app/environment";
    import {goto} from "$app/navigation";
    import {clickOutside} from "$lib/clickOutside";
    import {colorStore} from "$lib/stores/colorStore";
    import {closeSearch, getSearchableFeatures, type SearchableItem, searchStore} from "$lib/stores/searchStore";
    import Portal from "$lib/components/ui/Portal.svelte";


  // No props needed - using store state

  // State
  let searchInput: HTMLInputElement | undefined = $state();
  let query = $state('');
  let results: SearchableItem[] = $state([]);
  let selectedIndex = $state(0);
  let categories = ['All', 'Navigation', 'Community', 'Entertainment', 'Actions', 'Security', 'Settings', 'Analytics'];
  let activeCategory = $state('All');
  let recentSearches: string[] = $state([]);


  // Fuzzy search implementation
  function searchFeatures(searchQuery: string, category: string): SearchableItem[] {
    const allFeatures = getSearchableFeatures(); // Get dynamic features

    if (!searchQuery.trim()) {
      // Show all features when no query, filtered by category
      const filtered = category === 'All'
        ? allFeatures
        : allFeatures.filter(item => item.category === category);
      return category === 'All' ? filtered : filtered.slice(0, 8); // Show all for "All" category, limit others
    }

    const query = searchQuery.toLowerCase();
    const filtered = allFeatures
      .filter(item => {
        // Category filter
        if (category !== 'All' && item.category !== category) return false;
        
        // Text matching
        const titleMatch = item.title.toLowerCase().includes(query);
        const descMatch = item.description.toLowerCase().includes(query);
        const keywordMatch = item.keywords.some(keyword => keyword.toLowerCase().includes(query));
        
        return titleMatch || descMatch || keywordMatch;
      })
      .sort((a, b) => {
        // Prioritize exact title matches
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        
        if (aTitle.startsWith(query) && !bTitle.startsWith(query)) return -1;
        if (!aTitle.startsWith(query) && bTitle.startsWith(query)) return 1;
        
        // Then prioritize title contains
        if (aTitle.includes(query) && !bTitle.includes(query)) return -1;
        if (!aTitle.includes(query) && bTitle.includes(query)) return 1;
        
        return 0;
      })
      .slice(0, 10); // Limit results

    return filtered;
  }

  function focusInput() {
    if (browser && searchInput) {
      setTimeout(() => searchInput?.focus(), 50);
    }
  }

  function selectResult(item: SearchableItem) {
    // Add to recent searches
    if (!recentSearches.includes(item.title)) {
      recentSearches = [item.title, ...recentSearches.slice(0, 4)];
      if (browser) {
        localStorage.setItem('dashboard-recent-searches', JSON.stringify(recentSearches));
      }
    }

    // Navigate and close
    goto(item.path);
    closeSearch();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!$searchStore.isOpen) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        closeSearch();
        break;
      
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        break;
      
      case 'Enter':
        event.preventDefault();
        if (results[selectedIndex]) {
          selectResult(results[selectedIndex]);
        }
        break;
      
      case 'Tab':
        event.preventDefault();
        // Cycle through categories
        const currentIndex = categories.indexOf(activeCategory);
        const nextIndex = (currentIndex + 1) % categories.length;
        activeCategory = categories[nextIndex];
        selectedIndex = 0;
        break;
    }
  }

  function handleClickOutside() {
    closeSearch();
  }

  // Load recent searches
  onMount(() => {
    if (browser) {
      const saved = localStorage.getItem('dashboard-recent-searches');
      if (saved) {
        try {
          recentSearches = JSON.parse(saved);
        } catch (e) {
          recentSearches = [];
        }
      }
    }
  });

  onMount(() => {
    if (browser) {
      window.addEventListener('keydown', handleKeydown);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('keydown', handleKeydown);
    }
  });

  // Prevent body scroll when modal is open
  $effect(() => {
    if (browser && $searchStore.isOpen) {
      document.body.style.overflow = 'hidden';
    } else if (browser) {
      document.body.style.overflow = '';
    }
  });
  // Reactive updates
  $effect(() => {
    $searchStore.isOpen && focusInput();
  });
  $effect(() => {
    results = searchFeatures(query, activeCategory);
  });
  $effect(() => {
    if (selectedIndex >= results.length && results.length > 0) {
      selectedIndex = results.length - 1;
    }
  });
</script>

{#if $searchStore.isOpen}
  <Portal>
    <div
      class="fixed inset-0 flex items-start justify-center pt-12 md:pt-20 px-2 md:px-4 pb-4"
      style="z-index: 100000; background: rgba(0, 0, 0, 0.3);"
      in:fade={{ duration: 150 }}
      out:fade={{ duration: 100 }}
      onclick={handleClickOutside}
      onkeydown={(e) => e.key === 'Escape' && handleClickOutside()}
      role="dialog"
      aria-modal="true"
      aria-label="Search dashboard features"
      tabindex="-1"
    >
      <div
        class="w-full max-w-2xl rounded-xl md:rounded-2xl shadow-2xl border overflow-hidden backdrop-blur-xl max-h-[calc(100vh-6rem)] md:max-h-[90vh] flex flex-col"
        style="background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.9)), linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}15);
               backdrop-filter: blur(20px);
               border: 1px solid {$colorStore.primary}30;
               box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8),
                          0 0 0 1px {$colorStore.primary}10,
                          inset 0 1px 0 {$colorStore.primary}15;"
        in:fly={{ y: -30, duration: 300, delay: 50 }}
        out:fly={{ y: -30, duration: 200 }}
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="searchbox"
        tabindex="0"
        use:clickOutside
        onclickoutside={handleClickOutside}
      >
      <!-- Search Header -->
      <div class="flex items-center gap-2 md:gap-4 p-3 md:p-6 border-b" style="border-color: {$colorStore.primary}20;">
        <div class="flex items-center gap-2 md:gap-4 flex-1">
          <div class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
               style="background: linear-gradient(135deg, {$colorStore.primary}40, {$colorStore.secondary}40);">
            <i class="fa-utility-duo fa-regular fa-magnifying-glass text-base md:text-xl"
               style="--fa-primary-color: {$colorStore.text}; --fa-secondary-color: {$colorStore.text};"></i>
          </div>
          <input
            bind:this={searchInput}
            bind:value={query}
            type="text"
            placeholder="Search..."
            class="flex-1 bg-transparent text-base md:text-xl outline-hidden"
            style="color: {$colorStore.text}; font-weight: 300;"
          >
        </div>

        <!-- Close Button -->
        <button aria-label="Button action"
          class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all"
          style="color: {$colorStore.muted}; hover:background: {$colorStore.primary}10;"
          onclick={closeSearch}

        >
          <i class="fa-utility-duo fa-regular fa-times text-sm md:text-base"
             style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted};"></i>
        </button>
      </div>

      <!-- Category Filters -->
      <div class="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 border-b overflow-x-auto shrink-0" style="border-color: {$colorStore.primary}15;">
        {#each categories as category}
          <button
            class="shrink-0 px-2 md:px-4 py-2 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all hover:scale-[1.02]"
            class:active={activeCategory === category}
            style="background: {activeCategory === category ? $colorStore.primary + '25' : $colorStore.primary + '08'};
                   color: {activeCategory === category ? $colorStore.primary : $colorStore.muted};
                   border: 1px solid {activeCategory === category ? $colorStore.primary + '40' : $colorStore.primary + '15'};"
            onclick={() => { activeCategory = category; selectedIndex = 0; }}
          >
            {category}
          </button>
        {/each}
      </div>

      <!-- Search Results -->
      <div class="overflow-y-auto flex-1 min-h-0">
        {#if results.length === 0 && query.trim()}
          <!-- No Results -->
          <div class="p-6 md:p-12 text-center">
            <i class="fa-utility-duo fa-regular fa-magnifying-glass text-4xl md:text-6xl mx-auto mb-4 md:mb-6 block"
               style="--fa-primary-color: {$colorStore.primary}40; --fa-secondary-color: {$colorStore.primary}40;"></i>
            <h3 class="text-lg md:text-xl font-light mb-2 md:mb-3" style="color: {$colorStore.text};">No results found</h3>
            <p class="text-xs md:text-sm" style="color: {$colorStore.muted};">
              Try adjusting your search or browse by category
            </p>
          </div>
        {:else if results.length === 0 && !query.trim()}
          <!-- Recent Searches -->
          <div class="p-3 md:p-6 pb-0">
            <div class="flex items-center gap-3 mb-4">
              <i class="fa-utility-duo fa-regular fa-star"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
              <span class="text-base font-light" style="color: {$colorStore.text};">Quick Access</span>
            </div>
            
            {#if recentSearches.length > 0}
              <div class="space-y-2 mb-6">
                <p class="text-xs font-medium mb-3" style="color: {$colorStore.muted};">Recent Searches</p>
                {#each recentSearches.slice(0, 3) as recentSearch}
                  <button 
                    class="block w-full text-left px-4 py-3 rounded-xl text-sm transition-all"
                    style="background: {$colorStore.primary}08; color: {$colorStore.text}; hover:background: {$colorStore.primary}15;"
                    onclick={() => { query = recentSearch; }}
                  >
                    {recentSearch}
                  </button>
                {/each}
              </div>
            {/if}

            <!-- Popular Features -->
            <div class="space-y-2 pb-6">
              <p class="text-xs font-medium mb-3" style="color: {$colorStore.muted};">Popular Features</p>
              {#each getSearchableFeatures().filter(f => ['music-player', 'xp-system', 'moderation', 'chat-triggers'].includes(f.id)) as feature}
                <button
                  class="search-result-item popular-feature flex items-center gap-4 w-full p-4 rounded-xl transition-all duration-200 ease-in-out border border-transparent relative group"
                  style="background: {$colorStore.primary}08; hover:background: {$colorStore.primary}15;"
                  onclick={() => selectResult(feature)}
                >
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                       style="background: linear-gradient(135deg, {$colorStore.primary}40, {$colorStore.secondary}40);">
                    <i class="fa-utility-duo fa-regular {feature.icon}"
                       style="--fa-primary-color: {$colorStore.text}; --fa-secondary-color: {$colorStore.text};"></i>
                  </div>
                  <div class="flex-1 text-left">
                    <div class="font-medium" style="color: {$colorStore.text};">{feature.title}</div>
                    <div class="text-sm" style="color: {$colorStore.muted};">{feature.description}</div>
                  </div>
                </button>
              {/each}
            </div>
          </div>
        {:else}
          <!-- Results List -->
          <div class="px-2 md:px-4 pb-2">
            {#each results as result, index}
              <button
                class="search-result-item flex items-center gap-2 md:gap-4 w-full p-2 md:p-4 rounded-lg md:rounded-xl transition-all duration-200 ease-in-out mb-2 border border-transparent relative group"
                class:selected={index === selectedIndex}
                style="background: {index === selectedIndex
                  ? `linear-gradient(135deg, ${$colorStore.primary}20, ${$colorStore.secondary}20)`
                  : $colorStore.primary + '03'};
                       border-color: {index === selectedIndex ? $colorStore.primary + '30' : 'transparent'};"
                onclick={() => selectResult(result)}
              >
                <!-- Icon -->
                  <div class="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0"
                     style="background: {index === selectedIndex
                       ? `linear-gradient(135deg, ${$colorStore.primary}40, ${$colorStore.secondary}40)`
                       : `linear-gradient(135deg, ${$colorStore.primary}25, ${$colorStore.secondary}25)`};">
                  <i class="fa-utility-duo fa-regular {result.icon} text-sm md:text-xl"
                     style="--fa-primary-color: {$colorStore.text}; --fa-secondary-color: {$colorStore.text};"></i>
                </div>

                <!-- Content -->
                <div class="flex-1 text-left min-w-0">
                  <div class="font-medium truncate text-sm md:text-base"
                       style="color: {index === selectedIndex ? $colorStore.primary : $colorStore.text};">
                    {result.title}
                  </div>
                  <div class="text-xs md:text-sm truncate mt-0.5 hidden md:block" style="color: {$colorStore.muted};">
                    {result.description}
                  </div>
                  <div class="flex items-center gap-1 md:gap-2 mt-1 md:mt-2">
                    <div class="text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full"
                         style="background: {$colorStore.secondary}15; color: {$colorStore.secondary};">
                      {result.category}
                    </div>
                    {#if result.tab}
                      <div class="text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full hidden md:block"
                           style="background: {$colorStore.accent}10; color: {$colorStore.accent};">
                        {result.tab}
                      </div>
                    {/if}
                  </div>
                </div>

                <!-- Keyboard hint -->
                {#if index === selectedIndex}
                    <div class="hidden md:flex items-center gap-1 text-xs shrink-0" style="color: {$colorStore.muted};">
                    <i class="fa-utility-duo fa-regular fa-keyboard text-sm"
                       style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted};"></i>
                  </div>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-3 md:px-6 py-2 md:py-4 border-t text-xs"
           style="border-color: {$colorStore.primary}15; color: {$colorStore.muted};">
        <div class="flex items-center gap-2 md:gap-6">
          <div class="hidden md:flex items-center gap-2">
            <div class="flex items-center gap-1">
              <i class="fa-utility-duo fa-regular fa-arrow-up text-xs"
                 style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted};"></i>
              <i class="fa-utility-duo fa-regular fa-arrow-down text-xs"
                 style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted};"></i>
            </div>
            <span>Navigate</span>
          </div>
          <div class="hidden md:flex items-center gap-2">
            <i class="fa-utility-duo fa-regular fa-keyboard text-xs"
               style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted};"></i>
            <span>Select</span>
          </div>
          <div class="hidden md:flex items-center gap-2">
            <span class="px-2 py-1 rounded-md border font-mono text-xs"
                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};">Tab</span>
            <span>Categories</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-1.5 md:px-2 py-0.5 md:py-1 rounded-md border font-mono text-xs"
                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};">Esc</span>
          <span>Close</span>
        </div>
      </div>
      </div>
    </div>
  </Portal>
{/if}

<style lang="postcss">
  .selected {
    transform: scale(1.01);
  }
  
  input::placeholder {
    opacity: 0.4;
  }

  /* Spotlight-style search result effects */
  .search-result-item {
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
  }

  /* Subtle highlight effect */
  .search-result-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, var(--primary-color)10, transparent);
    opacity: 0;
    transition: opacity 0.2s ease-out;
  }

  .search-result-item:hover::before,
  .search-result-item.selected::before {
    opacity: 1;
  }

  /* Subtle scale on hover */
  .search-result-item:hover {
    transform: scale(1.02);
  }

  .search-result-item:active {
    transform: scale(0.98);
  }

  /* Smooth focus outline */
  .search-result-item:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.3);
    outline-offset: -2px;
  }

  /* Selected state enhancement */
  .search-result-item.selected {
    transform: scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  /* Smooth scrollbar */
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Hide scrollbar on category pills */
  .overflow-x-auto::-webkit-scrollbar {
    display: none;
  }

  .overflow-x-auto {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  /* Ensure proper stacking context */
  .fixed {
    isolation: isolate;
  }
</style>