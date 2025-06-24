<!-- lib/components/TabbedDashboard.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { browser } from "$app/environment";
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { BarChart3, ChevronLeft, ChevronRight, Music, Settings, Shield, Users } from "lucide-svelte";

  // Import tab components
  import OverviewTab from "./dashboard/OverviewTab.svelte";
  import CommunityTab from "./dashboard/CommunityTab.svelte";
  import ContentTab from "./dashboard/ContentTab.svelte";
  import SecurityTab from "./dashboard/SecurityTab.svelte";
  import SettingsTab from "./dashboard/SettingsTab.svelte";

  // Props from parent
  export let botStatus: any;
  export let guildMemberStats: any;
  export let roleStats: any;
  export let joinStats: any;
  export let leaveStats: any;
  export let guildFeatures: any;
  export let onRefresh: () => void;
  export let refreshing: boolean = false;

  // Export activeTab so parent can access it
  export let activeTab = "overview";

  // Tab definitions
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      component: OverviewTab,
      description: "Server stats and bot status"
    },
    {
      id: "community",
      label: "Community",
      icon: Users,
      component: CommunityTab,
      description: "XP, suggestions, and starboard"
    },
    {
      id: "content",
      label: "Content",
      icon: Music,
      component: ContentTab,
      description: "Music, triggers, and giveaways"
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      component: SecurityTab,
      description: "Moderation and protection"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      component: SettingsTab,
      description: "Configuration and roles"
    }
  ];

  // State management
  let isChangingTab = false;
  let tabContainerElement: HTMLElement;

  // Keyboard shortcuts
  const keyboardShortcuts = {
    "1": "overview",
    "2": "community",
    "3": "content",
    "4": "security",
    "5": "settings"
  };

  // URL and state management
  function updateUrlTab(tabId: string, addToHistory: boolean = false) {
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
        window.history.pushState({ tab: tabId }, "", url.toString());
      } else {
        window.history.replaceState({ tab: tabId }, "", url.toString());
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

    // Stricter swipe detection
    if (
      Math.abs(diffX) > swipeThreshold && // Horizontal distance
      diffY < 60 && // Vertical threshold (prevent conflicts with vertical scrolls)
      swipeTime < maxSwipeTime && // Fast enough to be intentional
      isDragging // User actually dragged
    ) {
      if (diffX > 0) {
        nextTab(); // Swipe left -> next tab
      } else {
        previousTab(); // Swipe right -> previous tab
      }
    }
  }

  // Get current tab data
  $: currentTabData = tabs.find(tab => tab.id === activeTab) || tabs[0];

  // Handle browser back/forward buttons
  function handlePopState() {
    const tabFromUrl = getTabFromUrl();
    if (tabFromUrl !== activeTab) {
      // Don't add to history when handling popstate
      switchTab(tabFromUrl, true, false);
    }
  }

  onMount(() => {
    // Initialize tab from URL
    activeTab = getTabFromUrl();

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
      <div class="hidden md:flex items-center justify-between py-4">
        <div class="flex items-center space-x-1">
          {#each tabs as tab}
            <button
              class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative"
              class:opacity-60={isChangingTab && activeTab !== tab.id}
              style="color: {activeTab === tab.id ? $colorStore.primary : $colorStore.muted};
                     background: {activeTab === tab.id ? $colorStore.primary + '20' : 'transparent'};
                     border: 1px solid {activeTab === tab.id ? $colorStore.primary + '40' : 'transparent'};"
              on:click={() => switchTab(tab.id)}
              disabled={isChangingTab}
            >
              <svelte:component this={tab.icon} size={20} />
              <span class="font-medium">{tab.label}</span>

              <!-- Active indicator -->
              {#if activeTab === tab.id}
                <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-t-md"
                     style="background: linear-gradient(90deg, {$colorStore.primary}, {$colorStore.secondary})"
                     in:slide={{ duration: 200 }}></div>
              {/if}
            </button>
          {/each}
        </div>

        <!-- Tab Info and Navigation -->
        <div class="flex items-center gap-4">
          <div class="text-sm text-right">
            <div class="font-medium" style="color: {$colorStore.text}">
              {currentTabData.label}
            </div>
            <div style="color: {$colorStore.muted}">
              {currentTabData.description}
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button
              class="p-2 rounded-lg transition-all hover:scale-110"
              on:click={previousTab}
              style="color: {$colorStore.muted}; hover:color: {$colorStore.primary};"
              title="Previous tab (Ctrl+←)"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              class="p-2 rounded-lg transition-all hover:scale-110"
              on:click={nextTab}
              style="color: {$colorStore.muted}; hover:color: {$colorStore.primary};"
              title="Next tab (Ctrl+→)"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Tab Navigation -->
      <div class="md:hidden py-3">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold" style="color: {$colorStore.text}">
            {currentTabData.label}
          </h2>
          <div class="text-sm" style="color: {$colorStore.muted}">
            {tabs.findIndex(tab => tab.id === activeTab) + 1} / {tabs.length}
          </div>
        </div>

        <!-- Mobile tab selector -->
        <div class="flex space-x-2 overflow-x-auto pb-2">
          {#each tabs as tab}
            <button
              class="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
              style="color: {activeTab === tab.id ? $colorStore.primary : $colorStore.muted};
                     background: {activeTab === tab.id ? $colorStore.primary + '20' : $colorStore.primary + '08'};"
              on:click={() => switchTab(tab.id)}
            >
              <svelte:component this={tab.icon} size={16} />
              <span class="text-sm font-medium">{tab.label}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Tab Content -->
  <div class="w-full">
    {#if activeTab === 'overview'}
      <div in:fly={{ x: 20, duration: 300, delay: 100 }}>
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
      <div in:fly={{ x: 20, duration: 300, delay: 100 }}>
        <CommunityTab
          {guildFeatures}
          memberStats={guildMemberStats}
        />
      </div>
    {:else if activeTab === 'content'}
      <div in:fly={{ x: 20, duration: 300, delay: 100 }}>
        <ContentTab
          {guildFeatures}
        />
      </div>
    {:else if activeTab === 'security'}
      <div in:fly={{ x: 20, duration: 300, delay: 100 }}>
        <SecurityTab
          {guildFeatures}
        />
      </div>
    {:else if activeTab === 'settings'}
      <div in:fly={{ x: 20, duration: 300, delay: 100 }}>
        <SettingsTab
          {guildFeatures}
        />
      </div>
    {/if}
  </div>

  <!-- Keyboard Shortcuts Hint -->
  <div class="fixed bottom-4 right-4 hidden md:block opacity-60 hover:opacity-100 transition-opacity"
       style="color: {$colorStore.muted}">
    <div class="text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
      Press 1-5 to switch tabs
    </div>
  </div>
</div>