<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot (status-messages to status_messages) making the component unusable -->
<!-- DashboardPageLayout.svelte -->
<script lang="ts">
  import {fade, fly} from "svelte/transition";
  import {colorStore} from "$lib/stores/colorStore";
  // Lifecycle
  import { onDestroy, onMount } from "svelte";
  import {browser} from "$app/environment";
  import LoadingOverlay from "$lib/components/ui/LoadingOverlay.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import {goto} from "$app/navigation";
  import {registerTabFeatures, unregisterSearchFeatures} from "$lib/stores/searchStore";

  // Props
  interface Props {
    title: string;
    subtitle: string;
    icon: string;
    tabs?: Array<{ id: string, label: string, icon: string }>;
    activeTab?: string;
    subTabs?: Array<{ id: string, label: string, icon?: string, parentTab: string }>;
    activeSubTab?: string;
    actionButtons?: Array<{
      label: string,
      icon: string,
      action: () => void,
      loading?: boolean,
      style?: string,
      disabled?: boolean
    }>;
    guildName?: string;
    notificationMessage?: string;
    notificationType?: "success" | "error";
    basePath?: string;
    category?: string;
    statusMessages?: import("svelte").Snippet;
    children: import("svelte").Snippet;
    ontabChange?: (detail: { tabId: string }) => void;
    onsubTabChange?: (detail: { tabId: string }) => void;
  }

  let {
    title,
    subtitle,
    icon,
    tabs = [],
    activeTab = $bindable(""),
    subTabs = [],
    activeSubTab = $bindable(""),
    actionButtons = [],
    guildName = "Dashboard",
    notificationMessage = $bindable(""),
    notificationType = "success",
    basePath = "/dashboard",
    category = "Settings",
    statusMessages,
    children,
    ontabChange,
    onsubTabChange
  }: Props = $props();

  // Reactive: show notification when message is set
  let showNotification = $derived(notificationMessage.length > 0);

  function handleNotificationDismiss() {
    notificationMessage = "";
  }

  // Track previous tab for animation direction
  let previousTab = $state("");
  let previousSubTab = $state("");
  let slideDirection = $state(1); // 1 for right, -1 for left
  let subSlideDirection = $state(1); // 1 for right, -1 for left

  // Navigation refs
  let tabContainer = $state<HTMLDivElement>();
  let subTabContainer = $state<HTMLDivElement>();

  // Track overflow state
  let tabsOverflow = $state(false);
  let subTabsOverflow = $state(false);
  
  // Check overflow on mount and resize with debouncing
  let checkOverflowTimeout: NodeJS.Timeout;
  function checkOverflow() {
    if (checkOverflowTimeout) clearTimeout(checkOverflowTimeout);
    checkOverflowTimeout = setTimeout(() => {
      if (tabContainer) {
        tabsOverflow = tabContainer.scrollWidth > tabContainer.clientWidth;
      }
      if (subTabContainer) {
        subTabsOverflow = subTabContainer.scrollWidth > subTabContainer.clientWidth;
      }
    }, 10);
  }

    // Handle browser back button navigation to main dashboard
  function handlePopState(event: PopStateEvent) {
    if (browser) {
      const currentUrl = window.location.pathname + window.location.search;
      
      // If browser URL shows main dashboard with query params, navigate there
      if (currentUrl.startsWith('/dashboard?') && currentUrl.includes('tab=')) {
        goto(currentUrl, { replaceState: true });
      }
    }
  }

  onMount(() => {
    checkOverflow();

    const observer = new ResizeObserver(() => checkOverflow());
    if (tabContainer) observer.observe(tabContainer);
    if (subTabContainer) observer.observe(subTabContainer);

    // Add popstate listener for browser back/forward navigation
    if (browser) {
      window.addEventListener('popstate', handlePopState);
      window.addEventListener("keydown", handleGlobalKeyDown);
    }

    // Register search features from tabs
    if (tabs.length > 0 || subTabs.length > 0) {
      registerTabFeatures(tabs, subTabs, basePath, title, category);
    }

    return () => {
      observer.disconnect();
    };
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    }

    // Unregister search features when component is destroyed
    if (tabs.length > 0 || subTabs.length > 0) {
      const featureIds = [
        ...tabs.map(tab => `${basePath}-${tab.id}`),
        ...subTabs.map(subTab => `${basePath}-${subTab.id}`)
      ];
      unregisterSearchFeatures(featureIds);
    }
  });
  
  // Simple reduced motion check
  let prefersReducedMotion = $state(false);
  if (browser && window.matchMedia) {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Filter sub-tabs based on active main tab
  let currentSubTabs = $derived(subTabs.filter(st => st.parentTab === activeTab));

  // Calculate slide direction based on tab order
  $effect(() => {
    if (activeTab !== previousTab && tabs.length > 0) {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      const previousIndex = tabs.findIndex(tab => tab.id === previousTab);

      if (previousIndex !== -1 && currentIndex !== -1) {
        slideDirection = currentIndex > previousIndex ? 1 : -1;
      }
      previousTab = activeTab;
    }
  });

  // Calculate slide direction for sub-tabs
  $effect(() => {
    if (activeSubTab !== previousSubTab && currentSubTabs.length > 0) {
      const currentIndex = currentSubTabs.findIndex(tab => tab.id === activeSubTab);
      const previousIndex = currentSubTabs.findIndex(tab => tab.id === previousSubTab);

      if (previousIndex !== -1 && currentIndex !== -1) {
        subSlideDirection = currentIndex > previousIndex ? 1 : -1;
      }
      previousSubTab = activeSubTab;
    }
  });

  // Re-check overflow when tabs change
  $effect(() => {
    if (tabs || currentSubTabs) {
      if (browser) {
        setTimeout(checkOverflow, 0);
      }
    }
  });
  
  function handleTabChange(tabId: string) {
    activeTab = tabId;
    ontabChange?.({ tabId });

    // Auto-select first sub-tab if available
    const newSubTabs = subTabs.filter(st => st.parentTab === tabId);
    if (newSubTabs.length > 0 && !newSubTabs.find(st => st.id === activeSubTab)) {
      activeSubTab = newSubTabs[0].id;
      onsubTabChange?.({ tabId: newSubTabs[0].id });
    }
  }

  function handleSubTabChange(tabId: string) {
    activeSubTab = tabId;
    onsubTabChange?.({ tabId });
  }
  
  // Keyboard navigation
  function handleKeyDown(event: KeyboardEvent, tabList: any[], currentTab: string, isSubTab = false) {
    const currentIndex = tabList.findIndex(tab => tab.id === currentTab);
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabList.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentIndex < tabList.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = tabList.length - 1;
        break;
      default:
        return;
    }

    if (isSubTab) {
      handleSubTabChange(tabList[newIndex].id);
    } else {
      handleTabChange(tabList[newIndex].id);
    }

    // Focus the new tab button
    const tabId = isSubTab ? `sub-tab-${tabList[newIndex].id}` : `tab-${tabList[newIndex].id}`;
    document.getElementById(tabId)?.focus();
  }

  // Global keyboard navigation for numbered tabs
  function handleGlobalKeyDown(event: KeyboardEvent) {
    // Only handle number keys (1-9)
    const key = event.key;
    if (!/^[1-9]$/.test(key)) return;

    // Don't trigger if user is typing in an input/textarea/select
    const target = event.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
      return;
    }

    const tabIndex = parseInt(key) - 1;

    // Try sub-tabs first if they exist
    if (currentSubTabs.length > 0 && tabIndex < currentSubTabs.length) {
      event.preventDefault();
      handleSubTabChange(currentSubTabs[tabIndex].id);
    } else if (tabs.length > 0 && tabIndex < tabs.length) {
      // Otherwise use main tabs
      event.preventDefault();
      handleTabChange(tabs[tabIndex].id);
    }
  }
  
  // Scroll navigation for mobile
  function scrollTabs(direction: 'left' | 'right', container: HTMLDivElement) {
    if (!container) return;
    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }
</script>

<svelte:head>
  <title>{title} - {guildName}</title>
</svelte:head>

<div class="min-h-screen p-4 md:p-6 overflow-x-hidden w-full transition-all duration-500 relative z-10"
     style="background: radial-gradient(circle at top,
       {$colorStore.gradientStart}15 0%,
       {$colorStore.gradientMid}10 50%,
       {$colorStore.gradientEnd}05 100%);"
     in:fade={{ duration: 300 }}>
  
  <!-- Page Header -->
  <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
    <div class="flex items-center gap-4">
      <div class="p-4 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular {icon} text-3xl"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
      </div>
      <div>
        <h1 class="text-3xl font-bold" style="color: {$colorStore.text}">{title}</h1>
        <p class="text-lg mt-1" style="color: {$colorStore.muted}">
          {subtitle}
        </p>
      </div>
    </div>

    {#if actionButtons.length > 0}
      <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        {#each actionButtons as button}
          <button
            class="flex items-center justify-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] flex-1 sm:flex-initial min-w-[120px] font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2"
            disabled={button.loading || button.disabled}
            onclick={button.action}
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
            aria-busy={button.loading}
                  aria-label={button.label}
          >
            <i class="fa-solid {button.icon} {button.loading ? 'fa-spin' : ''}"
               style="font-size: 18px;"
               aria-hidden="true"></i>
            <span class="text-sm sm:text-base">{button.label}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Status Messages -->
  {#if statusMessages}
    {@render statusMessages()}
  {/if}
  
  <!-- Built-in Notification -->
  {#if showNotification}
    <Notification 
      message={notificationMessage} 
      type={notificationType} 
      onDismiss={handleNotificationDismiss}
    />
  {/if}

  <!-- Main Tab Navigation -->
  {#if tabs.length > 0}
    <nav class="mb-6" aria-label="Main navigation">
      <div class="flex items-center justify-center gap-2 max-w-[98%] sm:max-w-[90%] lg:max-w-[80%] mx-auto">
        <!-- Left scroll button -->
        {#if tabsOverflow}
          <button
            class="shrink-0 p-2 rounded-lg transition-all hover:scale-[1.02] backdrop-blur-xs"
            style="background: rgba(15, 23, 42, 0.9); border: 1px solid {$colorStore.primary}30; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"
            onclick={() => scrollTabs('left', tabContainer)}
            aria-label="Scroll tabs left"
          >
            <i class="fa-solid fa-chevron-left" style="color: {$colorStore.primary}; font-size: 16px;"></i>
          </button>
        {/if}
        
        <!-- Tab list -->
        <div 
          bind:this={tabContainer}
          class="flex items-center space-x-1 p-2 rounded-xl overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth flex-1 min-w-0 {tabsOverflow ? 'justify-start' : 'justify-center'}"
          style="background: {$colorStore.primary}10;"
          role="tablist"
          aria-label="{title} navigation tabs"
        >
          {#each tabs as tab, index}
            <button
                    class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all font-medium whitespace-nowrap shrink-0 focus:outline-hidden focus:ring-2 focus:ring-offset-2 hover:scale-[1.02]"
              class:active={activeTab === tab.id}
              style="color: {activeTab === tab.id ? $colorStore.primary : $colorStore.muted};
                     background: {activeTab === tab.id ? $colorStore.primary + '20' : 'transparent'};
                     border: 1px solid {activeTab === tab.id ? $colorStore.primary + '40' : 'transparent'};
                     focus:ring-color: {$colorStore.primary};"
                    onclick={() => handleTabChange(tab.id)}
                    onkeydown={(e) => handleKeyDown(e, tabs, activeTab)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls="tab-panel-{tab.id}"
              id="tab-{tab.id}"
              tabindex={activeTab === tab.id ? 0 : -1}
            >
              <i class="fa-solid {tab.icon}" style="font-size: 16px;" aria-hidden="true"></i>
              <span class="text-sm sm:text-base">{tab.label}</span>
            </button>
          {/each}
        </div>
        
        <!-- Right scroll button -->
        {#if tabsOverflow}
          <button
            class="shrink-0 p-2 rounded-lg transition-all hover:scale-[1.02] backdrop-blur-xs"
            style="background: rgba(15, 23, 42, 0.9); border: 1px solid {$colorStore.primary}30; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"
            onclick={() => scrollTabs('right', tabContainer)}
            aria-label="Scroll tabs right"
          >
            <i class="fa-solid fa-chevron-right" style="color: {$colorStore.primary}; font-size: 16px;"></i>
          </button>
        {/if}
      </div>
    </nav>
  {/if}

  <!-- Sub-Tab Navigation -->
  {#if currentSubTabs.length > 0}
    <div class="mb-6 -mt-4" transition:fade={{ duration: 200 }}>
      <!-- Context indicator -->
      <div class="flex items-center justify-center mb-3 px-2">
        <div class="flex items-center gap-2">
          <div class="h-px w-16" style="background: {$colorStore.primary}10;"></div>
          <span class="text-xs font-medium px-3 whitespace-nowrap" style="color: {$colorStore.muted};">
            {tabs.find(t => t.id === activeTab)?.label || ''} Options
          </span>
          <div class="h-px w-16" style="background: {$colorStore.primary}10;"></div>
        </div>
      </div>
      
      <nav aria-label="Sub navigation">
        <div class="relative">
          <!-- Mobile scroll buttons for sub-tabs -->
          {#if subTabsOverflow}
            <button
              class="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg md:hidden transition-opacity"
              style="background: #0f172a; border: 1px solid {$colorStore.primary}20;"
              onclick={() => scrollTabs('left', subTabContainer)}
              aria-label="Scroll sub-tabs left"
            >
              <i class="fa-solid fa-chevron-left" style="color: {$colorStore.primary}; font-size: 14px;"></i>
            </button>

            <button
              class="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg md:hidden transition-opacity"
              style="background: #0f172a; border: 1px solid {$colorStore.primary}20;"
              onclick={() => scrollTabs('right', subTabContainer)}
              aria-label="Scroll sub-tabs right"
            >
              <i class="fa-solid fa-chevron-right" style="color: {$colorStore.primary}; font-size: 14px;"></i>
            </button>
          {/if}
          
          <!-- Sub-tab list with pill style -->
          <div class="flex justify-center">
            <div
              bind:this={subTabContainer}
              class="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth p-1.5 rounded-xl {subTabsOverflow ? 'mx-8 md:mx-0' : ''}"
              style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;"
              role="tablist"
              aria-label="Sub navigation tabs"
            >
            {#each currentSubTabs as subTab, index}
              <button
                class="relative flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium whitespace-nowrap focus:outline-hidden focus:ring-2 focus:ring-offset-1 transition-all duration-200 rounded-lg hover:scale-[1.02]"
                class:active={activeSubTab === subTab.id}
                style="color: {activeSubTab === subTab.id ? $colorStore.text : $colorStore.muted};
                       background: {activeSubTab === subTab.id ? $colorStore.primary + '25' : 'transparent'};
                       {activeSubTab === subTab.id ? `border: 1px solid ${$colorStore.primary}30;` : 'border: 1px solid transparent;'};
                       focus:ring-color: {$colorStore.primary};"
                onclick={() => handleSubTabChange(subTab.id)}
                onkeydown={(e) => handleKeyDown(e, currentSubTabs, activeSubTab, true)}
                role="tab"
                aria-selected={activeSubTab === subTab.id}
                aria-controls="sub-tab-panel-{subTab.id}"
                id="sub-tab-{subTab.id}"
                tabindex={activeSubTab === subTab.id ? 0 : -1}
              >
                {#if subTab.icon}
                  <i class="fa-solid {subTab.icon}" style="font-size: 14px;" aria-hidden="true"></i>
                {/if}
                <span>{subTab.label}</span>
              </button>
            {/each}
            </div>
          </div>
        </div>
      </nav>
    </div>
  {/if}

  <!-- Main Content with Transition -->
  {#key activeTab + activeSubTab}
    <div 
      in:fly={{ 
        x: prefersReducedMotion ? 0 : (activeSubTab !== previousSubTab && currentSubTabs.length > 0 ? subSlideDirection : slideDirection) * 30, 
        y: prefersReducedMotion ? 10 : 0,
        duration: prefersReducedMotion ? 200 : 300, 
        delay: prefersReducedMotion ? 100 : 150,
        opacity: prefersReducedMotion ? 0.5 : 0
      }}
      out:fly={{ 
        x: prefersReducedMotion ? 0 : (activeSubTab !== previousSubTab && currentSubTabs.length > 0 ? subSlideDirection : slideDirection) * -30, 
        y: prefersReducedMotion ? -10 : 0,
        duration: prefersReducedMotion ? 150 : 200,
        opacity: prefersReducedMotion ? 0.5 : 0
      }}
      class="w-full space-y-6"
      role={tabs.length > 0 || currentSubTabs.length > 0 ? "tabpanel" : undefined}
      aria-labelledby={currentSubTabs.length > 0 ? `sub-tab-${activeSubTab}` : tabs.length > 0 ? `tab-${activeTab}` : undefined}
      id={currentSubTabs.length > 0 ? `sub-tab-panel-${activeSubTab}` : tabs.length > 0 ? `tab-panel-${activeTab}` : undefined}
    >
      {@render children()}
    </div>
  {/key}
  
  <!-- Universal Loading Overlay -->
  <LoadingOverlay />
</div>

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: 768px) {
    /* Ensure scroll indicators are visible on mobile */
    .scrollbar-hide {
      scroll-snap-type: x mandatory;
    }
    .scrollbar-hide > button {
      scroll-snap-align: start;
    }
  }
</style>