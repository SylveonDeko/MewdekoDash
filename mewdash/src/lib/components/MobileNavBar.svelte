<!-- lib/components/MobileNavBar.svelte -->
<script lang="ts">
  import { fade, scale, slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import {
    Bell,
    Gift,
    Heart,
    Home,
    Lightbulb,
    Link,
    Menu,
    MessageSquare,
    Music,
    Save,
    Server,
    Settings,
    Shield,
    Star,
    Users,
    ZapOff
  } from "lucide-svelte";
  import { page } from "$app/stores";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { musicStore } from "$lib/stores/musicStore";
  import { userStore } from "$lib/stores/userStore";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { api } from "$lib/api";
  import type { BotInstance } from "$lib/types/models";

  // Props
  export let showInstanceSelector = false;
  export let data: any = undefined;

  // Define navigation items (main visible buttons)
  const navItems = [
    { label: "Home", icon: Home, href: "/dashboard", priority: 1 },
    { label: "Settings", icon: Settings, href: "/dashboard/settings", priority: 2 },
    { label: "Music", icon: Music, href: "/dashboard/music", priority: 3 },
    { label: "XP", icon: Star, href: "/dashboard/xp", priority: 4 },
    { label: "Instance", icon: Server, href: "#", isInstanceSelector: true, priority: 5 },
    { label: "More", icon: Menu, href: "#", isMore: true, priority: 6 }
  ];

  // Secondary items shown in expanded "More" state - organized by category
  const moreItems = [
    { label: "AFK", icon: ZapOff, href: "/dashboard/afk", category: "Community" },
    { label: "Greets", icon: Bell, href: "/dashboard/multigreets", category: "Community" },
    { label: "Invites", icon: Users, href: "/dashboard/invites", category: "Community" },
    { label: "Suggestions", icon: Lightbulb, href: "/dashboard/suggestions", category: "Community" },
    { label: "Triggers", icon: MessageSquare, href: "/dashboard/chat-triggers", category: "Content" },
    { label: "Embeds", icon: Link, href: "/dashboard/embedbuilder", category: "Content" },
    { label: "Perms", icon: Shield, href: "/dashboard/permissions", category: "Management" },
    { label: "Moderation", icon: Shield, href: "/dashboard/moderation", category: "Management" },
    { label: "Administration", icon: Settings, href: "/dashboard/administration", category: "Management" },
    { label: "Giveaways", icon: Gift, href: "/dashboard/giveaways", category: "Management" },
    { label: "Chat Saver", icon: Save, href: "/dashboard/chatsaver", category: "Management" },
    { label: "Patreon", icon: Heart, href: "/dashboard/patreon", category: "Premium" }
  ];

  // State
  let showLabels = true;
  let showMoreMenu = false;
  let showInstanceMenu = false;
  let prevScrollPos = 0;
  let visible = true;
  let musicPlaying = false;
  let lastTapTime = 0;
  let isAnimating = false;
  let isNavigating = false;
  let navigationLoadingTarget = null;

  // Instance selection state
  let instances: BotInstance[] = [];
  let instancesLoading = true;
  let instancesError: string | null = null;
  let instanceStates: Record<string, {
    loading: boolean;
    hasMutualGuild: boolean;
    error: string | null;
    checked: boolean;
  }> = {};

  // Derived state
  $: currentPath = $page.url.pathname;
  $: activeIndex = navItems.findIndex(item =>
      !item.isMore && (
        currentPath === item.href ||
        currentPath === `${item.href}/` ||
        (item.href !== "/dashboard" && currentPath.startsWith(item.href + "/"))
      )
  );
  $: activeMoreIndex = moreItems.findIndex(item =>
    currentPath === item.href ||
    currentPath === `${item.href}/` ||
    currentPath.startsWith(item.href + "/")
  );
  $: moreMenuActive = activeMoreIndex >= 0;
  $: musicPlaying = $musicStore.status?.IsPlaying || false;

  // Instance selection derived state
  $: visibleInstances = instances.filter(instance => {
    const instanceId = instance.botId.toString();
    const state = instanceStates[instanceId];
    return state?.checked && state?.hasMutualGuild;
  });
  $: stillCheckingInstances = Object.values(instanceStates).some(state => state.loading);

  // Modify nav items when in instance selector mode or filter out instance selector if only one instance
  $: effectiveNavItems = showInstanceSelector ? (
    // In instance selector mode, only show the selector if there's more than one instance
    visibleInstances.length > 1 || instancesLoading || stillCheckingInstances ? [
      { label: "Instances", icon: Server, href: "#", isInstanceSelector: true, priority: 1 },
      { label: "Home", icon: Home, href: "/", priority: 2 }
    ] : [
      { label: "Home", icon: Home, href: "/", priority: 2 }
    ]
  ) : navItems.filter(item => {
    // Hide instance selector if there's only one visible instance
    if (item.isInstanceSelector && visibleInstances.length <= 1) {
      return false;
    }
    return true;
  });

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
      const mutualGuilds = await api.getMutualGuilds(BigInt(userData.id), undefined, customHeaders);
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
    <!-- Music Mini Player -->
    {#if musicPlaying}
      <div
        class="fixed bottom-16 left-0 right-0 border-t z-40 py-2 px-3 backdrop-blur-md"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}80, {$colorStore.gradientMid}80);"
        style:border-color="{$colorStore.primary}30"
        transition:slide={{ duration: 200, axis: 'y' }}
        role="status"
        aria-label="Currently playing: {$musicStore.status?.CurrentTrack?.Title || 'Unknown Track'}"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden bg-cover bg-center"
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
            <Music size={16} style="color: {$colorStore.primary}" aria-hidden="true" />
          </a>
        </div>
      </div>
    {/if}

    <!-- Bottom Navigation Bar -->
    <nav
      class="fixed bottom-0 left-0 right-0 border-t z-50 transition-all duration-300 ease-out backdrop-blur-md"
      class:translate-y-0={visible}
      class:translate-y-full={!visible}
      class:opacity-95={isNavigating}
      class:scale-[0.98]={isNavigating}
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}80, {$colorStore.gradientMid}80);"
      style:border-color="{$colorStore.primary}30"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div class="flex justify-around">
        {#each effectiveNavItems as item, i}
          {#if item.isMore || item.isInstanceSelector}
            <!-- More menu / Instance selector button -->
            <button
              class="flex flex-col items-center justify-center py-2 px-4 relative more-button transition-all duration-200 hover:scale-105 active:scale-95"
              on:click|stopPropagation={item.isInstanceSelector ? toggleInstanceMenu : toggleMoreMenu}
              on:keydown={item.isInstanceSelector ? handleInstanceMenuKeydown : handleMoreMenuKeydown}
              style:color={moreMenuActive || showMoreMenu || showInstanceMenu || (item.isInstanceSelector && $currentInstance) ? $colorStore.primary : $colorStore.muted}
              aria-expanded={item.isInstanceSelector ? showInstanceMenu : showMoreMenu}
              aria-haspopup="menu"
              aria-label="{item.isInstanceSelector ? 'Instance selection' : 'More navigation options'}"
            >
              <div class="relative">
                <div class="transition-transform duration-200"
                     class:rotate-180={item.isInstanceSelector ? showInstanceMenu : showMoreMenu}>
                  <svelte:component
                    this={item.icon}
                    size={24}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
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

              <!-- More menu / Instance selector dropdown -->
              {#if (item.isInstanceSelector && showInstanceMenu) || (item.isMore && showMoreMenu)}
                <div
                  class="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 max-w-xs w-screen more-menu rounded-xl shadow-2xl backdrop-blur-md border"
                  style="max-height: 60vh; overflow-y: auto; margin-left: max(-40vw, -150px);
           background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6));
           box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1);"
                  style:border-color="{$colorStore.primary}40"
                  transition:scale|local={{
      duration: 300,
      start: 0.85,
      opacity: 0,
      easing: cubicOut
    }}
                  role="menu"
                  aria-label="{item.isInstanceSelector ? 'Instance selection' : 'Additional navigation options'}"
                  on:introstart={() => isAnimating = true}
                  on:introend={() => isAnimating = false}
                  on:outrostart={() => isAnimating = true}
                  on:outroend={() => isAnimating = false}
                >
                  {#if item.isInstanceSelector}
                    <!-- Instance Selection Menu -->
                    <div class="p-3">
                      <div class="text-center mb-3">
                        <h3 class="text-sm font-medium" style:color={$colorStore.text}>Bot Instances</h3>
                        {#if $currentInstance}
                          <p class="text-xs mt-1" style:color={$colorStore.muted}>
                            Current: {$currentInstance.botName}</p>
                        {:else}
                          <p class="text-xs mt-1" style:color={$colorStore.muted}>Choose an instance to manage</p>
                        {/if}
                      </div>

                      {#if instancesLoading || stillCheckingInstances}
                        <div class="text-center py-4" style:color={$colorStore.muted}>
                          <div class="animate-spin mx-auto mb-2 h-6 w-6 border-2 rounded-full"
                               style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
                          <p class="text-xs">{instancesLoading ? 'Loading instances...' : 'Checking access...'}</p>
                        </div>
                      {:else if instancesError}
                        <div class="text-center py-4" style:color={$colorStore.accent}>
                          <p class="text-xs">{instancesError}</p>
                        </div>
                      {:else if visibleInstances.length === 0}
                        <div class="text-center py-4" style:color={$colorStore.muted}>
                          <p class="text-xs">No accessible instances found</p>
                        </div>
                      {:else}
                        <div class="space-y-2">
                          {#each visibleInstances as instance, j}
                            <button
                              class="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border border-transparent"
                              style="color: {$colorStore.text};
                                     background: {$currentInstance?.botId === instance.botId ? `${$colorStore.primary}30` : 'transparent'};
                                     border-color: {$currentInstance?.botId === instance.botId ? $colorStore.primary + '50' : 'transparent'};
                                     hover:background: ${$colorStore.primary}15;"
                              on:click={() => {
                                handleInstanceSelect(instance);
                                showInstanceMenu = false;
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
                                <div class="text-xs" style:color={$colorStore.muted}>Port: {instance.port}</div>
                              </div>
                              {#if !instance.isActive}
                                <span class="px-2 py-1 rounded text-xs"
                                      style="color: {$colorStore.accent}; background: {$colorStore.accent}15;">
                                  Offline
                                </span>
                              {/if}
                            </button>
                          {/each}
                        </div>
                      {/if}
                    </div>
                  {:else}
                    <!-- Regular More Menu -->
                    <div class="grid grid-cols-2 gap-2 p-3">
                      {#each moreItems as moreItem, j}
                        <a
                          href={moreItem.href}
                          data-sveltekit-preload-data="hover"
                          data-sveltekit-noscroll
                          class="flex flex-col items-center gap-2 px-3 py-4 rounded-xl text-center transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-[var(--hover-bg)] focus:ring-color-[var(--focus-ring-color)]"
                          style="
      --hover-bg: {$colorStore.primary}15;
      --focus-ring-color: {$colorStore.primary};
      color: {currentPath.startsWith(moreItem.href) ? $colorStore.primary : $colorStore.text};
      background: {currentPath.startsWith(moreItem.href) ? `${$colorStore.primary}20` : 'transparent'};
    "
                          in:slide|local={{ delay: j * 30, duration: 200 }}
                          role="menuitem"
                          aria-label="Navigate to {moreItem.label}"
                          on:keydown={(e) => handleMenuItemKeydown(e, moreItem.href)}
                          on:click|preventDefault={(e) => {
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
    }}
                        >
                          <svelte:component
                            this={moreItem.icon}
                            size={22}
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                          <span class="text-xs font-medium whitespace-normal leading-tight">{moreItem.label}</span>
                        </a>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/if}

            </button>
          {:else}
            <!-- Regular nav item -->
            <a
              href={item.href}
              class="flex flex-col items-center justify-center py-2 px-4 relative transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
              class:opacity-60={isNavigating && navigationLoadingTarget !== item.label}
              class:scale-110={isNavigating && navigationLoadingTarget === item.label}
              aria-current={activeIndex === i ? 'page' : undefined}
              style:color={activeIndex === i ? $colorStore.primary : $colorStore.muted}
              style:focus:ring-color={$colorStore.primary}
              aria-label="Navigate to {item.label}"
              on:click|preventDefault={(e) => {
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
              }}
            >
              <div class="relative">
                <svelte:component
                  this={item.icon}
                  size={24}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />

                <!-- Active indicator dot -->
                {#if activeIndex === i}
                  <div
                    class="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
                    style:background={$colorStore.primary}
                    transition:scale={{ duration: 300, easing: cubicOut }}
                  ></div>
                {/if}

                <!-- Loading indicator -->
                {#if isNavigating && navigationLoadingTarget === item.label}
                  <div
                    class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg"
                    transition:fade={{ duration: 150 }}
                  >
                    <div
                      class="w-4 h-4 border-2 rounded-full animate-spin"
                      style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"
                    ></div>
                  </div>
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