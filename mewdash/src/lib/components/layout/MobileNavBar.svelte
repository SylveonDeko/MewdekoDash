<!-- lib/components/MobileNavBar.svelte -->
<script lang="ts">
    import {preventDefault, run, stopPropagation} from 'svelte/legacy';

    import {fade, scale, slide} from "svelte/transition";
    import {cubicOut} from "svelte/easing";

    // Import Font Awesome CSS
    import '@fortawesome/fontawesome-free/css/all.min.css';
    import {page} from "$app/stores";
    import {colorStore} from "$lib/stores/colorStore";
    import {currentGuild} from "$lib/stores/currentGuild";
    import {currentInstance} from "$lib/stores/instanceStore";
    import {musicStore} from "$lib/stores/musicStore";
    import {userStore} from "$lib/stores/userStore";
    import {onMount} from "svelte";
    import {browser} from "$app/environment";
    import {goto} from "$app/navigation";
    import {api} from "$lib/api";
    import type {BotInstance} from "$lib/types/models";


    interface Props {
    // Props
    showInstanceSelector?: boolean;
    data?: any;
  }

  let { showInstanceSelector = false, data = undefined }: Props = $props();

  // Define navigation items (main visible buttons)
  const navItems = [
      {label: "Home", icon: "fa-solid fa-house", href: "/dashboard", priority: 1},
      {label: "Settings", icon: "fa-solid fa-gear", href: "/dashboard/settings", priority: 2},
      {label: "Music", icon: "fa-solid fa-music", href: "/dashboard/music", priority: 3},
      {label: "XP", icon: "fa-solid fa-star", href: "/dashboard/xp", priority: 4},
      {label: "Instance", icon: "fa-solid fa-server", href: "#", isInstanceSelector: true, priority: 5},
      {label: "More", icon: "fa-solid fa-bars", href: "#", isMore: true, priority: 6}
  ];

  // Secondary items shown in expanded "More" state - organized by category
  const moreItems = [
      {label: "AFK", icon: "fa-solid fa-moon", href: "/dashboard/afk", category: "Community"},
      {label: "Greets", icon: "fa-solid fa-bell", href: "/dashboard/multigreets", category: "Community"},
      {label: "Invites", icon: "fa-solid fa-users", href: "/dashboard/invites", category: "Community"},
      {label: "Suggestions", icon: "fa-solid fa-lightbulb", href: "/dashboard/suggestions", category: "Community"},
      {label: "Todo Lists", icon: "fa-solid fa-list", href: "/dashboard/todo", category: "Community"},
      {label: "Triggers", icon: "fa-solid fa-comment-dots", href: "/dashboard/chat-triggers", category: "Content"},
      {label: "Repeaters", icon: "fa-solid fa-repeat", href: "/dashboard/repeaters", category: "Content"},
      {label: "Embeds", icon: "fa-solid fa-link", href: "/dashboard/embedbuilder", category: "Content"},
      {label: "Perms", icon: "fa-solid fa-shield", href: "/dashboard/permissions", category: "Management"},
      {label: "Protection", icon: "fa-solid fa-shield-halved", href: "/dashboard/protection", category: "Management"},
      {label: "Moderation", icon: "fa-solid fa-shield-halved", href: "/dashboard/moderation", category: "Management"},
      {label: "Administration", icon: "fa-solid fa-gear", href: "/dashboard/administration", category: "Management"},
      {label: "Tickets", icon: "fa-solid fa-ticket", href: "/dashboard/tickets", category: "Management"},
      {label: "Giveaways", icon: "fa-solid fa-gift", href: "/dashboard/giveaways", category: "Management"},
      {label: "Chat Saver", icon: "fa-solid fa-floppy-disk", href: "/dashboard/chatsaver", category: "Management"},
      {label: "Patreon", icon: "fa-solid fa-heart", href: "/dashboard/patreon", category: "Premium"}
  ];

  // State
  let showLabels = true;
  let showMoreMenu = $state(false);
  let showInstanceMenu = $state(false);
    let activeMenuType = $state<'more' | 'instance' | null>(null);
  let prevScrollPos = 0;
  let visible = $state(true);
  let musicPlaying = $state(false);
  let lastTapTime = 0;
  let isAnimating = $state(false);
  let isNavigating = $state(false);
  let navigationLoadingTarget = $state(null);

  // Instance selection state
  let instances: BotInstance[] = $state([]);
  let instancesLoading = $state(true);
  let instancesError: string | null = $state(null);
  let instanceStates: Record<string, {
    loading: boolean;
    hasMutualGuild: boolean;
    error: string | null;
    checked: boolean;
  }> = $state({});

  // Derived state
  let currentPath = $derived($page.url.pathname);
  let activeIndex = $derived(navItems.findIndex(item =>
      !item.isMore && (
        currentPath === item.href ||
        currentPath === `${item.href}/` ||
        (item.href !== "/dashboard" && currentPath.startsWith(item.href + "/"))
      )
  ));
  let activeMoreIndex = $derived(moreItems.findIndex(item =>
    currentPath === item.href ||
    currentPath === `${item.href}/` ||
    currentPath.startsWith(item.href + "/")
  ));
  let moreMenuActive = $derived(activeMoreIndex >= 0);
  run(() => {
    musicPlaying = $musicStore.status?.IsPlaying || false;
  });

  // Instance selection derived state
  let visibleInstances = $derived(instances.filter(instance => {
    const instanceId = instance.botId.toString();
    const state = instanceStates[instanceId];
    return state?.checked && state?.hasMutualGuild;
  }));
  let stillCheckingInstances = $derived(Object.values(instanceStates).some(state => state.loading));

    // Modify nav items when in instance selector mode or always show instance selector
  let effectiveNavItems = $derived(showInstanceSelector ? (
      // In instance selector mode, show the selector
      [
          {label: "Instances", icon: "fa-server", href: "#", isInstanceSelector: true, priority: 1},
          {label: "Home", icon: "fa-home", href: "/", priority: 2}
    ]
  ) : navItems); // Always show all nav items including instance selector

  // Show/hide the navbar based on scroll direction with debouncing
  let scrollTimeout: NodeJS.Timeout;
  function handleScroll() {
    if (typeof window !== "undefined") {
      // Debounce scroll events for better performance
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const currentScrollPos = window.pageYOffset;
        const scrollDelta = Math.abs(currentScrollPos - prevScrollPos);

        // Only update if scroll delta is significant (reduces jitter)
        if (scrollDelta > 5) {
          // Always show navbar when near the top
          if (currentScrollPos < 50) {
            visible = true;
          } else {
            // Hide when scrolling down, show when scrolling up
            visible = prevScrollPos > currentScrollPos;
          }
          prevScrollPos = currentScrollPos;
        }
      }, 10);
    }
  }

  // Toggle the more menu with haptic feedback
  function toggleMoreMenu() {
    if (isAnimating) return;

    showMoreMenu = !showMoreMenu;
    showInstanceMenu = false; // Close instance menu when opening more menu
      activeMenuType = showMoreMenu ? 'more' : null;

    // Add haptic feedback on supported devices
    if ("vibrate" in navigator && showMoreMenu) {
      navigator.vibrate(50);
    }
  }

  // Toggle the instance menu with haptic feedback
  function toggleInstanceMenu() {
    if (isAnimating) return;

    showInstanceMenu = !showInstanceMenu;
    showMoreMenu = false; // Close more menu when opening instance menu
      activeMenuType = showInstanceMenu ? 'instance' : null;

    // Add haptic feedback on supported devices
    if ("vibrate" in navigator && showInstanceMenu) {
      navigator.vibrate(50);
    }
  }

  // Handle keyboard navigation for more menu
  function handleMoreMenuKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleMoreMenu();
    } else if (event.key === "Escape" && showMoreMenu) {
      event.preventDefault();
      showMoreMenu = false;
    }
  }

  // Handle keyboard navigation for instance menu
  function handleInstanceMenuKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleInstanceMenu();
    } else if (event.key === "Escape" && showInstanceMenu) {
      event.preventDefault();
      showInstanceMenu = false;
    }
  }

  // Handle keyboard navigation for menu items
  function handleMenuItemKeydown(event: KeyboardEvent, href: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goto(href);
      showMoreMenu = false;
    }
  }

  // Handle double-tap for quick actions with enhanced feedback
  function handleNavItemTap(item: any) {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTapTime;

    if (timeDiff < 300 && timeDiff > 0) {
      // Double tap detected - could trigger quick action
      if (item.href === "/dashboard/music" && musicPlaying) {
        // Quick action: go directly to music player with haptic feedback
        if ("vibrate" in navigator) {
          navigator.vibrate([50, 50, 50]);
        }
        navigateWithLoading(item.href, item.label);
        return;
      }
    }

    lastTapTime = currentTime;
    navigateWithLoading(item.href, item.label);
  }

  // Enhanced navigation with loading state
  function navigateWithLoading(href: string, label: string) {
    isNavigating = true;
    navigationLoadingTarget = label;

    // Add haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate(30);
    }

    // Navigate with a small delay for visual feedback
    setTimeout(() => {
      goto(href);
      // Reset loading state after navigation
      setTimeout(() => {
        isNavigating = false;
        navigationLoadingTarget = null;
      }, 500);
    }, 150);
  }

  // Instance checking functions  
  async function checkInstanceMutualGuilds(instance: BotInstance) {
    // Skip checking if we don't have user data
    const userData = $userStore || data?.user;
    if (!userData?.id) {
      console.log("No user data available for instance checking");
      return false;
    }

    const instanceId = instance.botId.toString();

    instanceStates[instanceId] = {
      loading: true,
      hasMutualGuild: false,
      error: null,
      checked: false
    };
    instanceStates = { ...instanceStates };

    const customHeaders = {
      "X-Instance-Url": `http://localhost:${instance.port}/botapi`
    };

    try {
        const mutualGuilds = await api.getMutualGuilds(userData.id, true, fetch, customHeaders);
      const hasMutual = mutualGuilds && Array.isArray(mutualGuilds) && mutualGuilds.length > 0;

      instanceStates[instanceId] = {
        loading: false,
        hasMutualGuild: hasMutual,
        error: null,
        checked: true
      };
      instanceStates = { ...instanceStates };
      return hasMutual;
    } catch (err: any) {
      const is404 = err?.message?.includes("404") || err?.status === 404 || err?.response?.status === 404;

      instanceStates[instanceId] = {
        loading: false,
        hasMutualGuild: false,
        error: is404 ? null : "Failed to check mutual guilds",
        checked: true
      };
      instanceStates = { ...instanceStates };
      return false;
    }
  }

  async function handleInstanceSelect(instance: BotInstance) {
    // Don't do anything if this is already the current instance
    if ($currentInstance?.botId === instance.botId) {
      console.log("Same instance selected, no action needed");
      return;
    }

    // Clear current guild when switching instances
    currentGuild.set(null);

    // Clear persisted guild data
    if (browser) {
      const currentInst = $currentInstance;
      if (currentInst) {
        const oldStorageKey = `lastSelectedGuild_${currentInst.botId}`;
        localStorage.removeItem(oldStorageKey);
      }
      localStorage.removeItem("lastSelectedGuild");
    }

    // Set new instance
    currentInstance.set(instance);

    if (browser) {
      localStorage.setItem("selectedInstance", JSON.stringify(instance));
    }

    // Add haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }

    // Navigate to dashboard
    goto("/dashboard");
  }

  async function loadInstances() {
    // Always load instances now since we show instance selector in regular nav
    try {
      instancesLoading = true;
      instancesError = null;

      const response = await api.getBotInstances();
      instances = response || [];

      if (instances.length > 0) {
        await Promise.all(instances.map(checkInstanceMutualGuilds));
      }
    } catch (err) {
      instancesError = "Failed to load instances";
      console.error("Error loading instances:", err);
    } finally {
      instancesLoading = false;
    }
  }

  // Close the menus when clicking anywhere else
  function handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if ((showMoreMenu || showInstanceMenu) && !target.closest(".more-menu") && !target.closest(".more-button")) {
      showMoreMenu = false;
      showInstanceMenu = false;
    }
  }

  onMount(() => {
    if (browser) {
      window.addEventListener("scroll", handleScroll);
      document.addEventListener("click", handleClick);

      // Always load instances since we now show instance selector in regular nav
      loadInstances();

      // Close menus if route changes
      const unsubscribe = page.subscribe(() => {
        showMoreMenu = false;
        showInstanceMenu = false;
      });

      return () => {
        window.removeEventListener("scroll", handleScroll);
        document.removeEventListener("click", handleClick);
        unsubscribe();
      };
    }
  });
</script>

<!-- Only show on mobile -->
<div class="md:hidden">
  {#if $currentInstance}
      <!-- Music Mini Player - Floating above nav -->
    {#if musicPlaying}
        <div class="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none z-40"
             style="padding-bottom: calc(80px + env(safe-area-inset-bottom));">
            <div
                    class="pointer-events-auto mx-4 w-full max-w-md py-2 px-3 backdrop-blur-md rounded-2xl shadow-lg"
                    style="background: linear-gradient(135deg, {$colorStore.gradientStart}90, {$colorStore.gradientMid}90);"
                    transition:slide={{ duration: 200, axis: 'y' }}
                    role="status"
                    aria-label="Currently playing: {$musicStore.status?.CurrentTrack?.Title || 'Unknown Track'}"
            >
        <div class="flex items-center gap-3">
          <div
                  class="w-8 h-8 rounded-lg shrink-0 overflow-hidden bg-cover bg-center"
            style="background-image: url('{$musicStore.status?.CurrentTrack?.AlbumArt || '/img/music-placeholder.png'}');"
          >
            <!-- Animated equalizer bars -->
            <div class="w-full h-full bg-black bg-opacity-50 flex items-end justify-center p-1" aria-hidden="true">
              <div class="bar-1 w-1 mx-px rounded-t" style="background-color: {$colorStore.primary};"></div>
              <div class="bar-2 w-1 mx-px rounded-t" style="background-color: {$colorStore.secondary};"></div>
              <div class="bar-3 w-1 mx-px rounded-t" style="background-color: {$colorStore.accent};"></div>
              <div class="bar-4 w-1 mx-px rounded-t" style="background-color: {$colorStore.primary};"></div>
            </div>
          </div>

          <div class="flex-1 min-w-0 text-sm">
            <div class="font-medium truncate" style:color={$colorStore.text}>
              {$musicStore.status?.CurrentTrack?.Title || 'Unknown Track'}
            </div>
            <div class="text-xs truncate" style:color={$colorStore.muted}>
              {$musicStore.status?.CurrentTrack?.Author || 'Unknown Artist'}
            </div>
          </div>

          <a
            href="/dashboard/music"
            class="w-8 h-8 rounded-full flex items-center justify-center"
            style:background="{$colorStore.primary}30"
            aria-label="Go to music player"
          >
              <i class="fa-solid fa-music text-sm" style="color: {$colorStore.primary}" aria-hidden="true"></i>
          </a>
        </div>
            </div>
      </div>
    {/if}

      <!-- Bottom Navigation Bar - Floating Pill Style -->
      <div class="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none z-50"
           style="padding-bottom: calc(12px + env(safe-area-inset-bottom));">
          <nav
                  class="pointer-events-auto mx-4 w-full max-w-md transition-all duration-300 ease-out backdrop-blur-md rounded-full shadow-2xl"
                  class:translate-y-0={visible}
                  class:translate-y-full={!visible}
                  style="background: linear-gradient(135deg, {$colorStore.gradientStart}90, {$colorStore.gradientMid}90);"
                  aria-label="Mobile navigation"
          >
              <div class="flex justify-around py-1.5 px-2">
        {#each effectiveNavItems as item, i}
          {#if item.isMore || item.isInstanceSelector}
            <!-- More menu / Instance selector button -->
            <button
              class="flex flex-col items-center justify-center py-2 px-4 relative more-button transition-all duration-200 hover:scale-105 active:scale-95"
              onclick={stopPropagation(item.isInstanceSelector ? toggleInstanceMenu : toggleMoreMenu)}
              onkeydown={item.isInstanceSelector ? handleInstanceMenuKeydown : handleMoreMenuKeydown}
              style:color={moreMenuActive || showMoreMenu || showInstanceMenu || (item.isInstanceSelector && $currentInstance) ? $colorStore.primary : $colorStore.muted}
              aria-expanded={item.isInstanceSelector ? showInstanceMenu : showMoreMenu}
              aria-haspopup="menu"
              aria-label="{item.isInstanceSelector ? 'Instance selection' : 'More navigation options'}"
            >
              <div class="relative">
                <div class="transition-transform duration-200"
                     class:rotate-180={item.isInstanceSelector ? showInstanceMenu : showMoreMenu}>
                    <i class="{item.icon} text-xl" aria-hidden="true"></i>
                </div>

                {#if (item.isInstanceSelector && showInstanceMenu) || (item.isMore && showMoreMenu)}
                  <div
                    class="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
                    style:background={$colorStore.primary}
                  ></div>
                {:else if item.isInstanceSelector && $currentInstance}
                  <!-- Instance indicator when not showing menu -->
                  <div
                    class="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                    style:background={$currentInstance.isActive ? '#10B981' : $colorStore.accent}
                  ></div>
                {/if}
              </div>
              {#if showLabels}
                <span class="text-xs mt-1">
                  {#if item.isInstanceSelector && $currentInstance}
                    {$currentInstance.botName.length > 8 ? $currentInstance.botName.substring(0, 8) + '...' : $currentInstance.botName}
                  {:else}
                    {item.label}
                  {/if}
                </span>
              {/if}
            </button>
          {:else}
              <!-- Regular nav item -->
              <a
                      href={item.href}
                      class="flex flex-col items-center justify-center py-2 px-4 relative transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                      aria-current={activeIndex === i ? 'page' : undefined}
                      style:color={activeIndex === i ? $colorStore.primary : $colorStore.muted}
                      style:focus:ring-color={$colorStore.primary}
                      aria-label="Navigate to {item.label}"
                      onclick={preventDefault((e) => {
                e.preventDefault();
                if ($currentGuild && !item.isInstanceSelector) {
                  if (browser) {
                    try {
                      const currentInst = $currentInstance;
                      const storageKey = currentInst ? `lastSelectedGuild_${currentInst.botId}` : "lastSelectedGuild";
                      
                      localStorage.setItem(storageKey, JSON.stringify({
                        id: $currentGuild.id.toString(),
                        name: $currentGuild.name,
                        icon: $currentGuild.icon,
                        owner: $currentGuild.owner,
                        permissions: $currentGuild.permissions,
                        features: $currentGuild.features
                      }));
                    } catch (err) {
                      console.error("Error storing guild:", err);
                    }
                  }
                }
                handleNavItemTap(item);
              })}
              >
                  <div class="relative">
                      <i class="{item.icon} text-xl {isNavigating && navigationLoadingTarget === item.label ? 'animate-pulse' : ''}"
                         aria-hidden="true"
                         style="color: {isNavigating && navigationLoadingTarget === item.label ? $colorStore.primary : 'inherit'}"></i>

                      <!-- Active indicator dot -->
                      {#if activeIndex === i && !(isNavigating && navigationLoadingTarget === item.label)}
                          <div
                                  class="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
                                  style:background={$colorStore.primary}
                                  transition:scale={{ duration: 300, easing: cubicOut }}
                          ></div>
                      {/if}

                      <!-- Music playing indicator -->
                      {#if item.href === '/dashboard/music' && musicPlaying}
                          <div
                                  class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full animate-pulse"
                                  style:background={$colorStore.accent}
                          ></div>
                      {/if}
                  </div>
                  {#if showLabels}
                      <span class="text-xs mt-1">{item.label}</span>
                  {/if}

                  {#if activeIndex === i}
                      <div
                              class="absolute -bottom-px left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-t-md"
                              style="background: linear-gradient(90deg, {$colorStore.primary}, {$colorStore.secondary})"
                              in:scale|local={{ duration: 300, start: 0, delay: 50, easing: cubicOut }}
                              out:scale|local={{ duration: 200 }}
                      ></div>
                  {/if}
              </a>
          {/if}
        {/each}
      </div>
          </nav>
      </div>

      <!-- Menus rendered outside nav to avoid blur stacking -->
      {#if activeMenuType && (showInstanceMenu || showMoreMenu)}
          <!-- Backdrop -->
          <div
                  class="fixed inset-0 z-40 backdrop-blur-md"
                  style="background: linear-gradient(135deg, {$colorStore.gradientStart}60 0%, {$colorStore.gradientMid}50 50%, {$colorStore.gradientEnd}60 100%);"
                  onclick={() => {
          showMoreMenu = false;
          showInstanceMenu = false;
          activeMenuType = null;
        }}
                  transition:fade={{ duration: 200 }}
                  aria-hidden="true"
          ></div>

          <!-- Menu -->
          <div
                  class="fixed left-4 right-4 rounded-2xl shadow-2xl border z-50 backdrop-blur-md"
                  style="bottom: calc(80px + env(safe-area-inset-bottom)); max-height: 60vh;
         background: linear-gradient(135deg, {$colorStore.gradientStart}95, {$colorStore.gradientMid}95, {$colorStore.gradientEnd}95);
         border-color: {$colorStore.primary}50;"
                  transition:slide={{ duration: 250, axis: 'y', easing: cubicOut }}
                  role="menu"
                  aria-label="{activeMenuType === 'instance' ? 'Instance selection' : 'Additional navigation options'}"
          >
              {#if activeMenuType === 'instance'}
                  <!-- Instance Selection Menu -->
                  <div class="p-4 overflow-y-auto" style="max-height: 55vh;">
                      <div class="text-center mb-4">
                          <h3 class="text-base font-semibold" style="color: {$colorStore.text};">Bot Instances</h3>
                          {#if $currentInstance}
                              <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                                  Current: {$currentInstance.botName}</p>
                          {:else}
                              <p class="text-xs mt-1" style="color: {$colorStore.muted};">Choose an instance to
                                  manage</p>
                          {/if}
                      </div>

                      {#if instancesLoading || stillCheckingInstances}
                          <div class="text-center py-4" style="color: {$colorStore.muted};">
                              <div class="animate-spin mx-auto mb-2 h-6 w-6 border-2 rounded-full"
                                   style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
                              <p class="text-xs">{instancesLoading ? 'Loading instances...' : 'Checking access...'}</p>
                          </div>
                      {:else if instancesError}
                          <div class="text-center py-4" style="color: {$colorStore.accent};">
                              <p class="text-xs">{instancesError}</p>
                          </div>
                      {:else if visibleInstances.length === 0}
                          <div class="text-center py-4" style="color: {$colorStore.muted};">
                              <p class="text-xs">No accessible instances found</p>
                          </div>
                      {:else}
                          <div class="space-y-2">
                              {#each visibleInstances as instance, j}
                                  <button
                                          class="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 border"
                                          style="color: {$colorStore.text};
                           background: {$currentInstance?.botId === instance.botId ? `linear-gradient(135deg, ${$colorStore.primary}40, ${$colorStore.secondary}40)` : 'transparent'};
                           border-color: {$currentInstance?.botId === instance.botId ? $colorStore.primary + '50' : 'transparent'};
                           hover:background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);
                           hover:border-color: {$colorStore.primary}40;"
                                          onclick={() => {
                      handleInstanceSelect(instance);
                      showInstanceMenu = false;
                      activeMenuType = null;
                    }}
                                          in:slide|local={{ delay: j * 30, duration: 200 }}
                                  >
                                      <img
                                              src={instance.botAvatar}
                                              alt=""
                                              class="w-8 h-8 rounded-full"
                                      />
                                      <div class="flex-1 text-left">
                                          <div class="text-sm font-medium">{instance.botName}</div>
                                          <div class="text-xs" style="color: {$colorStore.muted};">
                                              {instance.isActive ? 'Online' : 'Offline'}
                                          </div>
                                      </div>
                                      {#if !instance.isActive}
                      <span class="px-2 py-1 rounded-sm text-xs"
                            style="color: {$colorStore.accent}; background: {$colorStore.accent}15;">
                        Offline
                      </span>
                                      {/if}
                                  </button>
                              {/each}
                          </div>
                      {/if}
                  </div>
              {:else if activeMenuType === 'more'}
                  <!-- Regular More Menu -->
                  <div class="grid grid-cols-2 gap-2 p-4 overflow-y-auto" style="max-height: 55vh;">
                      {#each moreItems as moreItem, j}
                          <a
                                  href={moreItem.href}
                                  data-sveltekit-preload-data="hover"
                                  data-sveltekit-noscroll
                                  class="flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg text-center transition-all duration-200 hover:scale-[1.02] active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-offset-2 border"
                                  style="color: {currentPath.startsWith(moreItem.href) ? $colorStore.primary : $colorStore.text};
                       background: {currentPath.startsWith(moreItem.href) ? `linear-gradient(135deg, ${$colorStore.primary}25, ${$colorStore.secondary}25)` : 'transparent'};
                       border-color: {currentPath.startsWith(moreItem.href) ? $colorStore.primary + '40' : 'transparent'};
                       hover:background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                       hover:border-color: {$colorStore.primary}30;"
                                  in:slide|local={{ delay: j * 30, duration: 200 }}
                                  role="menuitem"
                                  aria-label="Navigate to {moreItem.label}"
                                  onkeydown={(e) => handleMenuItemKeydown(e, moreItem.href)}
                                  onclick={preventDefault(() => {
                  if ($currentGuild) {
                    if (browser) {
                      try {
                        const currentInst = $currentInstance;
                        const storageKey = currentInst ? `lastSelectedGuild_${currentInst.botId}` : "lastSelectedGuild";

                        localStorage.setItem(storageKey, JSON.stringify({
                          id: $currentGuild.id.toString(),
                          name: $currentGuild.name,
                          icon: $currentGuild.icon,
                          owner: $currentGuild.owner,
                          permissions: $currentGuild.permissions,
                          features: $currentGuild.features
                        }));
                      } catch (err) {
                        console.error("Error storing guild:", err);
                      }
                    }
                  }
                  navigateWithLoading(moreItem.href, moreItem.label);
                  showMoreMenu = false;
                  activeMenuType = null;
                })}
                          >
                              <i class="{moreItem.icon} text-base"
                                 aria-hidden="true"
                                 style="color: {currentPath.startsWith(moreItem.href) ? $colorStore.primary : 'inherit'}">
                              </i>
                              <span class="text-xs font-medium whitespace-normal leading-tight">{moreItem.label}</span>
                          </a>
                      {/each}
                  </div>
              {/if}
          </div>
      {/if}
  {/if}
</div>

<style>
    /* Animated equalizer bars */
    .bar-1 {
        height: 30%;
        animation: eq1 1s infinite;
    }

    .bar-2 {
        height: 70%;
        animation: eq2 0.8s infinite;
    }

    .bar-3 {
        height: 40%;
        animation: eq3 1.2s infinite;
    }

    .bar-4 {
        height: 60%;
        animation: eq4 0.6s infinite;
    }

    @keyframes eq1 {
        0%, 100% {
            height: 30%;
        }
        50% {
            height: 70%;
        }
    }

    @keyframes eq2 {
        0%, 100% {
            height: 70%;
        }
        50% {
            height: 30%;
        }
    }

    @keyframes eq3 {
        0%, 100% {
            height: 40%;
        }
        50% {
            height: 80%;
        }
    }

    @keyframes eq4 {
        0%, 100% {
            height: 60%;
        }
        50% {
            height: 20%;
        }
    }
</style>