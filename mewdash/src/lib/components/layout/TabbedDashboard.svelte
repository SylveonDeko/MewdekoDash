<!-- lib/components/TabbedDashboard.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { browser } from "$app/environment";
  import {pushState, replaceState} from "$app/navigation";
  import {fly, slide, fade} from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import {logger} from "$lib/logger";

  // Import search components
  import SearchTrigger from "$lib/components/search/SearchTrigger.svelte";
  import SearchModal from "$lib/components/search/SearchModal.svelte";

  // Import tab components
  import OverviewTab from "$lib/components/dashboard/OverviewTab.svelte";
  import CommunityTab from "$lib/components/dashboard/CommunityTab.svelte";
  import EntertainmentTab from "$lib/components/dashboard/EntertainmentTab.svelte";
  import ActionsTab from "$lib/components/dashboard/ActionsTab.svelte";
  import SecurityTab from "$lib/components/dashboard/SecurityTab.svelte";
  import SettingsTab from "$lib/components/dashboard/SettingsTab.svelte";

  

  // Initialize activeTab from URL immediately when browser is available
  function getInitialTab(): string {
    if (browser) {
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get("tab");
      if (tabFromUrl && ["overview", "community", "entertainment", "actions", "security", "settings"].includes(tabFromUrl)) {
        return tabFromUrl;
      }
    }
    return "overview";
  }

  
  interface Props {
    // Props from parent
    botStatus: any;
    guildMemberStats: any;
    roleStats: any;
    joinStats: any;
    leaveStats: any;
    guildFeatures: any;
    onRefresh: () => void;
    refreshing?: boolean;
    // Export activeTab so parent can access it
    activeTab?: any;
      showMusicPlayer?: boolean;
  }

  let {
    botStatus,
    guildMemberStats,
    roleStats,
    joinStats,
    leaveStats,
    guildFeatures,
    onRefresh,
    refreshing = false,
      activeTab = $bindable(getInitialTab()),
      showMusicPlayer = false
  }: Props = $props();

  // Log when showMusicPlayer changes
  $effect(() => {
      logger.info('TabbedDashboard: showMusicPlayer changed', {
          showMusicPlayer,
          activeTab
      });
  });

  // Tab definitions with Font Awesome icons
  const tabs = [
    {
      id: "overview",
      label: "Overview",
        icon: "fa-utility-duo fa-regular fa-home",
      component: OverviewTab,
      description: "Server stats and bot status"
    },
    {
      id: "community",
      label: "Community",
        icon: "fa-utility-duo fa-regular fa-users",
      component: CommunityTab,
      description: "XP, suggestions, tickets"
    },
    {
      id: "entertainment",
      label: "Entertainment",
        icon: "fa-utility-duo fa-regular fa-music",
      component: EntertainmentTab,
      description: "Music, voice, giveaways"
    },
    {
      id: "actions",
      label: "Actions",
        icon: "fa-utility-duo fa-regular fa-bolt",
      component: ActionsTab,
      description: "Greets, triggers, embeds"
    },
    {
      id: "security",
      label: "Security",
        icon: "fa-utility-duo fa-regular fa-shield",
      component: SecurityTab,
      description: "Moderation and protection"
    },
    {
      id: "settings",
      label: "Settings",
        icon: "fa-utility-duo fa-regular fa-cog",
      component: SettingsTab,
      description: "Bot config and roles"
    }
  ];

  // State management
  let isChangingTab = $state(false);
  let tabContainerElement: HTMLElement = $state();
  let showSwipeHint = $state(true);
  let tabElements: HTMLElement[] = $state([]);
  let showBounceStart = $state(false);
  let showBounceEnd = $state(false);

  // Keyboard shortcuts
  const keyboardShortcuts = {
    "1": "overview",
    "2": "community",
    "3": "entertainment",
    "4": "actions",
    "5": "security",
    "6": "settings"
  };

  // URL and state management
  function updateUrlTab(tabId: string, addToHistory: boolean = true) {
    if (browser) {
      const url = new URL(window.location.href);
      const currentTab = url.searchParams.get("tab") || "overview";

      if (tabId === "overview") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tabId);
      }

      // Only add to history if the tab actually changed and we want to track it
      if (currentTab !== tabId && addToHistory) {
          pushState(url.toString(), {tab: tabId});
      } else if (currentTab !== tabId) {
        // Still need to update the URL even when not adding to history
          replaceState(url.toString(), {tab: tabId});
      }
    }
  }

  function getTabFromUrl(): string {
    if (browser) {
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get("tab");
      if (tabFromUrl && tabs.some(tab => tab.id === tabFromUrl)) {
        return tabFromUrl;
      }
    }
    return "overview";
  }

  // Tab switching
  async function switchTab(tabId: string, animate: boolean = true, addToHistory: boolean = true) {
    if (isChangingTab || activeTab === tabId) return;

    isChangingTab = true;

    if (animate) {
      // Brief pause for visual feedback
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    activeTab = tabId;
    updateUrlTab(tabId, addToHistory);

    // Reset flag after transition
    setTimeout(() => {
      isChangingTab = false;
    }, 300);
  }

  // Navigation helpers
  function nextTab() {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    switchTab(tabs[nextIndex].id);
  }

  function previousTab() {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    switchTab(tabs[prevIndex].id);
  }

  // Keyboard event handler
  function handleKeyDown(event: KeyboardEvent) {
    // Only process if no input element is focused
    const target = event.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

    // Handle number key shortcuts
    if (keyboardShortcuts[event.key]) {
      event.preventDefault();
      switchTab(keyboardShortcuts[event.key]);
      return;
    }

    // Handle arrow keys for tab navigation
    if (event.key === "ArrowLeft" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      previousTab();
    } else if (event.key === "ArrowRight" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      nextTab();
    }
  }

  // Swipe handling for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;
  let touchStartTime = 0;
  let isDragging = false;

  function handleTouchStart(event: TouchEvent) {
    const target = event.target as HTMLElement;

    // Don't handle swipes if we're interacting with scrollable content
    if (isScrollableElement(target)) {
      return;
    }

    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
    touchStartTime = Date.now();
    isDragging = false;
  }

  function handleTouchMove(event: TouchEvent) {
    if (touchStartX === 0) return;

    const currentX = event.changedTouches[0].screenX;
    const currentY = event.changedTouches[0].screenY;
    const diffX = Math.abs(currentX - touchStartX);
    const diffY = Math.abs(currentY - touchStartY);

    // If vertical movement is greater than horizontal, it's likely a scroll
    if (diffY > diffX) {
      touchStartX = 0; // Cancel horizontal swipe
      return;
    }

    // Mark as dragging if moved significantly
    if (diffX > 10) {
      isDragging = true;
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    if (touchStartX === 0) return;

    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
    handleSwipe();

    // Reset values
    touchStartX = 0;
    touchStartY = 0;
    isDragging = false;
  }

  function isScrollableElement(element: HTMLElement): boolean {
    if (!element) return false;

    // Check if element or any parent is scrollable
    let current = element;
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      const overflow = style.overflow || style.overflowX || style.overflowY;

      // Check for scrollable areas, queue lists, tab containers, input areas
      if (
        overflow.includes("auto") ||
        overflow.includes("scroll") ||
        current.classList.contains("queue-list") ||
        current.classList.contains("tab-scroll") ||
        current.classList.contains("overflow-x-auto") ||
        current.classList.contains("overflow-y-auto") ||
        current.tagName === "INPUT" ||
        current.tagName === "TEXTAREA" ||
        current.tagName === "SELECT" ||
        current.isContentEditable ||
        current.closest(".queue-list") ||
        current.closest(".tab-scroll") ||
        current.closest("[role=\"tablist\"]")
      ) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  function handleSwipe() {
    const swipeThreshold = 80; // Increased threshold to prevent accidental swipes
    const maxSwipeTime = 300; // Maximum time for a valid swipe

    const diffX = touchStartX - touchEndX;
    const diffY = Math.abs(touchStartY - touchEndY);
    const swipeTime = Date.now() - touchStartTime;
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);

    // Stricter swipe detection
    if (
      Math.abs(diffX) > swipeThreshold && // Horizontal distance
      diffY < 60 && // Vertical threshold (prevent conflicts with vertical scrolls)
      swipeTime < maxSwipeTime && // Fast enough to be intentional
      isDragging // User actually dragged
    ) {
      if (diffX > 0) {
          // Swipe left -> try next tab
          if (currentIndex === tabs.length - 1) {
              // At the end, show bounce
              showBounceEnd = true;
              setTimeout(() => showBounceEnd = false, 400);
          } else {
              nextTab();
          }
      } else {
          // Swipe right -> try previous tab
          if (currentIndex === 0) {
              // At the start, show bounce
              showBounceStart = true;
              setTimeout(() => showBounceStart = false, 400);
          } else {
              previousTab();
          }
      }
    }
  }

  // Get current tab data
  let currentTabData = $derived(tabs.find(tab => tab.id === activeTab) || tabs[0]);

  // Handle browser back/forward buttons
  function handlePopState(event: PopStateEvent) {
    const tabFromUrl = getTabFromUrl();
    if (tabFromUrl !== activeTab) {
      // Don't add to history when handling popstate - this is already a navigation event
      switchTab(tabFromUrl, true, false);
    }
  }

  onMount(() => {
    // Set initial history state to ensure proper back button behavior
    if (browser && activeTab !== "overview") {
      updateUrlTab(activeTab, false);
    }

      // Hide swipe hint after 3 seconds
      setTimeout(() => {
          showSwipeHint = false;
      }, 3000);

    if (browser) {
      // Add keyboard event listener
      window.addEventListener("keydown", handleKeyDown);

      // Add popstate listener for browser back/forward buttons
      window.addEventListener("popstate", handlePopState);

      // Add touch event listeners for mobile swipe
      if (tabContainerElement) {
        tabContainerElement.addEventListener("touchstart", handleTouchStart, { passive: true });
        tabContainerElement.addEventListener("touchmove", handleTouchMove, { passive: true });
        tabContainerElement.addEventListener("touchend", handleTouchEnd, { passive: true });
      }
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);

      if (tabContainerElement) {
        tabContainerElement.removeEventListener("touchstart", handleTouchStart);
        tabContainerElement.removeEventListener("touchmove", handleTouchMove);
        tabContainerElement.removeEventListener("touchend", handleTouchEnd);
      }
    }
  });
</script>

<div bind:this={tabContainerElement} class="w-full">
  <!-- Tab Navigation -->
  <div class="sticky top-0 z-40 backdrop-blur-lg border-b mb-6"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}90, {$colorStore.gradientMid}90);
              border-color: {$colorStore.primary}30;">
    <div class="w-full px-4 md:px-6">

      <!-- Desktop Tab Navigation -->
        <div class="hidden md:block py-5">
            <!-- Top Row: Centered Tab Navigation -->
            <div class="flex items-center justify-between mb-6">
                <!-- Left: Navigation Arrows -->
                <div class="flex items-center gap-1 px-2 py-1 rounded-xl"
                     style="background: {$colorStore.primary}05; border: 1px solid {$colorStore.primary}10;">
                  <button aria-label="Previous tab"
                            class="group p-1.5 rounded-lg btn-press hover:scale-110"
                            onclick={previousTab}
                            onmouseenter={(e) => e.currentTarget.querySelector('i')?.classList.add('fa-bounce')}
                            onmouseleave={(e) => e.currentTarget.querySelector('i')?.classList.remove('fa-bounce')}
                            style="color: {$colorStore.muted};"
                            title="Previous tab (Ctrl+←)"
                    >
                        <i class="fa-solid fa-chevron-left text-base"
                           style="--fa-animation-duration: 0.8s;
                        --fa-bounce-rebound: -0.3;
                        --fa-bounce-height: -0.2;"></i>
                    </button>
                    <div class="w-px h-4 mx-1" style="background: {$colorStore.primary}20;"></div>
                  <button aria-label="Next tab"
                            class="group p-1.5 rounded-lg btn-press hover:scale-110"
                            onclick={nextTab}
                            onmouseenter={(e) => e.currentTarget.querySelector('i')?.classList.add('fa-bounce')}
                            onmouseleave={(e) => e.currentTarget.querySelector('i')?.classList.remove('fa-bounce')}
                            style="color: {$colorStore.muted};"
                            title="Next tab (Ctrl+→)"
                    >
                        <i class="fa-solid fa-chevron-right text-base"
                           style="--fa-animation-duration: 0.8s;
                        --fa-bounce-rebound: -0.3;
                        --fa-bounce-height: -0.2;"></i>
                    </button>
                </div>

                <!-- Center: Tab Pills -->
                <div class="flex items-center justify-center flex-1 mx-8">
                    <div class="relative flex items-center p-1.5 rounded-2xl"
                         style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">

                        <!-- Sliding Background -->
                        {#if activeTab && tabElements.length > 0}
                            {@const activeIndex = tabs.findIndex(tab => tab.id === activeTab)}
                            {@const activeElement = tabElements[activeIndex]}
                            {#if activeElement}
                                <div class="absolute h-[calc(100%-12px)] rounded-xl transition-all duration-300 ease-out pointer-events-none"
                                     style="width: {activeElement.offsetWidth}px;
                              transform: translateX({activeElement.offsetLeft - 6}px);
                              background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}20);
                              border: 1px solid {$colorStore.primary}30;
                              box-shadow: 0 2px 8px {$colorStore.primary}15;">
                                </div>
                            {/if}
                        {/if}

                        <!-- Tab Buttons -->
                        {#each tabs as tab, index}
                            {@const isActive = activeTab === tab.id}
                            <button
                                    bind:this={tabElements[index]}
                                    class="relative z-10 flex items-center gap-2.5 px-5 py-2.5 rounded-xl tab-press group"
                                    class:opacity-60={isChangingTab && !isActive}
                                    onclick={() => switchTab(tab.id)}
                                    disabled={isChangingTab}
                            >
                                <i class="{tab.icon} text-lg transition-all duration-200 {isActive ? 'fa-beat' : ''}"
                                   style="--fa-primary-color: {isActive ? $colorStore.primary : $colorStore.muted};
                            --fa-secondary-color: {isActive ? $colorStore.secondary : $colorStore.muted};
                            --fa-secondary-opacity: {isActive ? 0.5 : 0.3};
                            opacity: {isActive ? 1 : 0.7};
                            --fa-animation-duration: 2s;
                            --fa-beat-scale: 1.1;"></i>
                                <span class="font-medium text-sm transition-all duration-200"
                                      style="color: {isActive ? $colorStore.text : $colorStore.muted};">
                    {tab.label}
                  </span>
                                {#if tab.id === 'entertainment' && showMusicPlayer}
                    <span class="relative flex h-2 w-2 ml-1">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                            style="background: {$colorStore.primary};"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2"
                            style="background: {$colorStore.primary};"></span>
                    </span>
                                {/if}
                            </button>

                            {#if index < tabs.length - 1}
                                <div class="w-px h-5 opacity-20" style="background: {$colorStore.muted};"></div>
                            {/if}
                        {/each}
                    </div>
                </div>

                <!-- Right: Search -->
                <div class="relative group">
                    <SearchTrigger variant="compact"/>
                    <div class="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div class="px-2 py-1 rounded text-xs whitespace-nowrap"
                             style="background: {$colorStore.background}; color: {$colorStore.muted}; border: 1px solid {$colorStore.primary}20;">
                            Quick Search (/)
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Row: Tab Description and Keyboard Hints -->
            <div class="flex items-center justify-between">
                <!-- Current Tab Description -->
                <div class="flex items-center gap-3">
                    <div class="w-1 h-8 rounded-full"
                         style="background: linear-gradient(180deg, {$colorStore.primary}, {$colorStore.secondary});"></div>
                    <div>
                        <div class="text-xs uppercase tracking-wider opacity-60" style="color: {$colorStore.muted}">
                            Current Section
                        </div>
                        <div class="relative h-5">
                            {#key activeTab}
                                <div class="text-sm font-medium absolute inset-0 whitespace-nowrap"
                                     style="color: {$colorStore.text}"
                                     in:fade={{ duration: 200, delay: 100 }}
                                     out:fade={{ duration: 100 }}>
                                    {currentTabData.description}
                                </div>
                            {/key}
                        </div>
                    </div>
          </div>

                <!-- Keyboard Shortcuts Hint -->
                <div class="flex items-center gap-3 text-xs" style="color: {$colorStore.muted};">
                    <div class="flex items-center gap-1.5">
                        <kbd class="px-1.5 py-0.5 rounded"
                             style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                            1-6
                        </kbd>
                        <span>Switch tabs</span>
                    </div>
                    <div class="w-px h-3" style="background: {$colorStore.primary}20;"></div>
                    <div class="flex items-center gap-1.5">
                        <kbd class="px-1.5 py-0.5 rounded"
                             style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                            /
                        </kbd>
                        <span>Search</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Mobile Tab Navigation -->
        <div class="md:hidden py-2">
            <!-- Mobile Tab Pills -->
            <div class="relative">
                <!-- Bounce Indicators -->
                {#if showBounceStart}
                    <div class="absolute left-0 top-0 bottom-0 w-2 z-20 rounded-r-full animate-bounce-left"
                         style="background: linear-gradient(90deg, {$colorStore.primary}40, transparent);"></div>
                {/if}
                {#if showBounceEnd}
                    <div class="absolute right-0 top-0 bottom-0 w-2 z-20 rounded-l-full animate-bounce-right"
                         style="background: linear-gradient(-90deg, {$colorStore.primary}40, transparent);"></div>
                {/if}

                <!-- Fade edges for scroll indication -->
                <div class="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
                     style="background: linear-gradient(to right, {$colorStore.background}, transparent);"></div>
                <div class="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
                     style="background: linear-gradient(to left, {$colorStore.background}, transparent);"></div>

                <!-- Scrollable Tab Container -->
                <div class="flex gap-2 overflow-x-auto pb-2 pt-2 px-2 scrollbar-hide {showBounceStart ? 'animate-bounce-content-right' : ''} {showBounceEnd ? 'animate-bounce-content-left' : ''}"
                     style="-webkit-overflow-scrolling: touch;">
                    {#each tabs as tab, index}
                        {@const isActive = activeTab === tab.id}
                        <button
                                class="shrink-0 relative flex items-center gap-2 px-4 py-2.5 rounded-full tab-press min-w-fit"
                                class:scale-105={isActive}
                                style="background: {isActive
                       ? `linear-gradient(135deg, ${$colorStore.primary}25, ${$colorStore.secondary}20)`
                       : $colorStore.primary + '08'};
                       border: 1px solid {isActive ? $colorStore.primary + '30' : 'transparent'};
                       color: {isActive ? $colorStore.text : $colorStore.muted};"
                                onclick={() => switchTab(tab.id)}
                                disabled={isChangingTab}
                        >
                            <!-- Icon with Animation -->
                            <i class="{tab.icon} text-sm {isActive ? 'fa-beat' : ''}"
                               style="--fa-primary-color: {isActive ? $colorStore.primary : $colorStore.muted};
                          --fa-secondary-color: {isActive ? $colorStore.secondary : $colorStore.muted};
                          --fa-secondary-opacity: {isActive ? 0.5 : 0.3};
                          --fa-animation-duration: 2s;
                          --fa-beat-scale: 1.05;"></i>

                            <!-- Label -->
                            <span class="text-sm font-medium whitespace-nowrap">
                  {tab.label}
                </span>
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Mobile Footer with Description and Search -->
            <div class="flex items-center justify-between mt-3 px-3 h-10">
                <div class="flex-1">
                    <div class="relative h-5">
                        {#key activeTab}
                            <div class="text-sm font-medium absolute inset-0 whitespace-nowrap"
                                 style="color: {$colorStore.text}"
                                 in:fade={{ duration: 200, delay: 100 }}
                                 out:fade={{ duration: 100 }}>
                                {currentTabData.label}
                            </div>
                        {/key}
                    </div>
                    <div class="relative h-4">
                        {#key activeTab}
                            <div class="text-xs absolute inset-0 whitespace-nowrap"
                                 style="color: {$colorStore.muted}; opacity: 0.8;"
                                 in:fade={{ duration: 200, delay: 150 }}
                                 out:fade={{ duration: 100 }}>
                                {currentTabData.description}
                            </div>
                        {/key}
                    </div>
                </div>

                <!-- Mobile Search -->
                <SearchTrigger showShortcut={false} variant="mobile"/>
            </div>

            <!-- Swipe Hint (shows only briefly on first load) -->
            {#if showSwipeHint}
                <div class="flex items-center justify-center gap-2 mt-2 text-xs animate-pulse transition-opacity duration-500"
                     style="color: {$colorStore.muted}; opacity: 0.5;">
                    <i class="fa-solid fa-chevron-left"></i>
                    <span>Swipe to navigate</span>
                    <i class="fa-solid fa-chevron-right"></i>
                </div>
            {/if}
      </div>
    </div>
  </div>

  <!-- Tab Content -->
    <div class="w-full relative">
    {#if activeTab === 'overview'}
        <div in:fly={{ x: 20, duration: 300, delay: 100 }} class="relative z-10">
        <OverviewTab
          {botStatus}
          {guildMemberStats}
          {roleStats}
          {joinStats}
          {leaveStats}
          {onRefresh}
          {refreshing}
        />
      </div>
    {:else if activeTab === 'community'}
        <div in:fly={{ x: 20, duration: 300, delay: 100 }} class="relative z-10">
        <CommunityTab
          {guildFeatures}
          memberStats={guildMemberStats}
        />
      </div>
    {:else if activeTab === 'entertainment'}
        <div in:fly={{ x: 20, duration: 300, delay: 100 }} class="relative z-10">
        <EntertainmentTab />
      </div>
    {:else if activeTab === 'actions'}
        <div in:fly={{ x: 20, duration: 300, delay: 100 }} class="relative z-10">
        <ActionsTab />
      </div>
    {:else if activeTab === 'security'}
        <div in:fly={{ x: 20, duration: 300, delay: 100 }} class="relative z-10">
        <SecurityTab />
      </div>
    {:else if activeTab === 'settings'}
        <div in:fly={{ x: 20, duration: 300, delay: 100 }} class="relative z-10">
        <SettingsTab />
      </div>
    {/if}
  </div>
</div>

<!-- Global Search Modal -->
<SearchModal />

<style>
    /* Jelly Duo icon color theming */
    :global(.fa-utility-duo) {
        --fa-primary-color: var(--color-primary);
        --fa-secondary-color: var(--color-secondary);
        --fa-primary-opacity: 1.0;
        --fa-secondary-opacity: 0.5;
    }

    /* Hide scrollbar for mobile tab navigation */
    .scrollbar-hide {
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE/Edge */
    }

    .scrollbar-hide::-webkit-scrollbar {
        display: none; /* Chrome/Safari/Opera */
    }

    /* Button press animation - like a keyboard key */
    .btn-press {
        transition: transform 0.1s ease-out;
    }

    .btn-press:active {
        transform: scale(0.92);
    }

    /* Enhanced press for tab buttons */
    .tab-press {
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .tab-press:active {
        transform: scale(0.95) translateY(1px);
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    /* Bounce animations for swipe boundaries */
    @keyframes bounceLeft {
        0% {
            transform: scaleX(0);
        }
        50% {
            transform: scaleX(1.5);
        }
        100% {
            transform: scaleX(0);
        }
    }

    @keyframes bounceRight {
        0% {
            transform: scaleX(0);
        }
        50% {
            transform: scaleX(1.5);
        }
        100% {
            transform: scaleX(0);
        }
    }

    @keyframes bounceContentLeft {
        0% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(-8px);
        }
        75% {
            transform: translateX(-4px);
        }
        100% {
            transform: translateX(0);
        }
    }

    @keyframes bounceContentRight {
        0% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(8px);
        }
        75% {
            transform: translateX(4px);
        }
        100% {
            transform: translateX(0);
        }
    }

    .animate-bounce-left {
        animation: bounceLeft 0.4s ease-out;
    }

    .animate-bounce-right {
        animation: bounceRight 0.4s ease-out;
    }

</style>