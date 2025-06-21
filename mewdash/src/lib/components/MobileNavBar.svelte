<!-- lib/components/MobileNavBar.svelte -->
<script lang="ts">
  import { scale, slide } from "svelte/transition";
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
    Settings,
    Shield,
    Star,
    Users,
    ZapOff
  } from "lucide-svelte";
  import { page } from "$app/stores";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { musicStore } from "$lib/stores/musicStore";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";

  // Define navigation items (main visible buttons)
  const navItems = [
    { label: "Home", icon: Home, href: "/dashboard", priority: 1 },
    { label: "Settings", icon: Settings, href: "/dashboard/settings", priority: 2 },
    { label: "Music", icon: Music, href: "/dashboard/music", priority: 3 },
    { label: "XP", icon: Star, href: "/dashboard/xp", priority: 4 },
    { label: "Perms", icon: Shield, href: "/dashboard/permissions", priority: 5 },
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
    { label: "Giveaways", icon: Gift, href: "/dashboard/giveaways", category: "Management" },
    { label: "Chat Saver", icon: Save, href: "/dashboard/chatsaver", category: "Management" },
    { label: "Patreon", icon: Heart, href: "/dashboard/patreon", category: "Premium" }
  ];

  // State
  let showLabels = true;
  let showMoreMenu = false;
  let prevScrollPos = 0;
  let visible = true;
  let musicPlaying = false;
  let lastTapTime = 0;
  let isAnimating = false;

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

    // Add haptic feedback on supported devices
    if ("vibrate" in navigator && showMoreMenu) {
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

  // Handle keyboard navigation for menu items
  function handleMenuItemKeydown(event: KeyboardEvent, href: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goto(href);
      showMoreMenu = false;
    }
  }

  // Handle double-tap for quick actions
  function handleNavItemTap(item: any) {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTapTime;

    if (timeDiff < 300 && timeDiff > 0) {
      // Double tap detected - could trigger quick action
      if (item.href === "/dashboard/music" && musicPlaying) {
        // Quick action: go directly to music player
        goto("/dashboard/music");
        return;
      }
    }

    lastTapTime = currentTime;
    goto(item.href);
  }

  // Close the more menu when clicking anywhere else
  function handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (showMoreMenu && !target.closest(".more-menu") && !target.closest(".more-button")) {
      showMoreMenu = false;
    }
  }

  onMount(() => {
    if (browser) {
      window.addEventListener("scroll", handleScroll);
      document.addEventListener("click", handleClick);

      // Close more menu if route changes
      const unsubscribe = page.subscribe(() => {
        showMoreMenu = false;
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
  {#if $currentGuild}
    <!-- Music Mini Player -->
    {#if musicPlaying}
      <div
        class="fixed bottom-16 left-0 right-0 border-t z-40 py-2 px-3 backdrop-blur-md"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}80, {$colorStore.gradientMid}80);
               border-color: {$colorStore.primary}30;"
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
              <div class="bar-1 bg-white w-1 mx-px rounded-t"></div>
              <div class="bar-2 bg-white w-1 mx-px rounded-t"></div>
              <div class="bar-3 bg-white w-1 mx-px rounded-t"></div>
              <div class="bar-4 bg-white w-1 mx-px rounded-t"></div>
            </div>
          </div>

          <div class="flex-1 min-w-0 text-sm">
            <div class="font-medium truncate" style="color: {$colorStore.text}">
              {$musicStore.status?.CurrentTrack?.Title || 'Unknown Track'}
            </div>
            <div class="text-xs truncate" style="color: {$colorStore.muted}">
              {$musicStore.status?.CurrentTrack?.Author || 'Unknown Artist'}
            </div>
          </div>

          <a
            href="/dashboard/music"
            class="w-8 h-8 rounded-full flex items-center justify-center"
            style="background: {$colorStore.primary}30"
            aria-label="Go to music player"
          >
            <Music size={16} style="color: {$colorStore.primary}" aria-hidden="true" />
          </a>
        </div>
      </div>
    {/if}

    <!-- Bottom Navigation Bar -->
    <nav
      class="fixed bottom-0 left-0 right-0 border-t z-50 transition-transform duration-300 backdrop-blur-md"
      class:translate-y-0={visible}
      class:translate-y-full={!visible}
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}80, {$colorStore.gradientMid}80);
             border-color: {$colorStore.primary}30;"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div class="flex justify-around">
        {#each navItems as item, i}
          {#if item.isMore}
            <!-- More menu button -->
            <button
              class="flex flex-col items-center justify-center py-2 px-4 relative more-button transition-all duration-200 hover:scale-105 active:scale-95"
              on:click|stopPropagation={toggleMoreMenu}
              on:keydown={handleMoreMenuKeydown}
              style="color: {moreMenuActive || showMoreMenu ? $colorStore.primary : $colorStore.muted}"
              aria-expanded={showMoreMenu}
              aria-haspopup="menu"
              aria-label="More navigation options"
            >
              <div class="relative">
                <div class="transition-transform duration-200" class:rotate-180={showMoreMenu}>
                  <svelte:component
                    this={item.icon}
                    size={24}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>

                {#if showMoreMenu}
                  <div
                    class="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
                    style="background: {$colorStore.primary}"
                  ></div>
                {/if}
              </div>
              {#if showLabels}
                <span class="text-xs mt-1">{item.label}</span>
              {/if}

              <!-- More menu dropdown -->
              {#if showMoreMenu}
                <div
                  class="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 max-w-xs w-screen more-menu rounded-xl shadow-2xl backdrop-blur-md"
                  style="max-height: 60vh; overflow-y: auto; margin-left: max(-40vw, -150px);
           border: 1px solid {$colorStore.primary}40;
           background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6));
           box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1);"
                  transition:scale|local={{
      duration: 250,
      start: 0.85,
      opacity: 0,
      easing: cubicOut
    }}
                  role="menu"
                  aria-label="Additional navigation options"
                  on:introstart={() => isAnimating = true}
                  on:introend={() => isAnimating = false}
                  on:outrostart={() => isAnimating = true}
                  on:outroend={() => isAnimating = false}
                >
                  <div class="grid grid-cols-2 gap-2 p-3">
                    {#each moreItems as moreItem, j}
                      <a
                        href={moreItem.href}
                        data-sveltekit-preload-data="hover"
                        data-sveltekit-noscroll
                        class="flex flex-col items-center gap-2 px-3 py-4 rounded-xl text-center transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style="color: {currentPath.startsWith(moreItem.href) ? $colorStore.primary : $colorStore.text};
                               background: {currentPath.startsWith(moreItem.href) ? `${$colorStore.primary}20` : 'transparent'};
                               hover:background: {$colorStore.primary}15;
                               focus:ring-color: {$colorStore.primary};"
                        in:slide|local={{ delay: j * 30, duration: 200 }}
                        role="menuitem"
                        aria-label="Navigate to {moreItem.label}"
                        on:keydown={(e) => handleMenuItemKeydown(e, moreItem.href)}
                        on:click|preventDefault={(e) => {
            if ($currentGuild) {
              if (browser) {
                try {
                  localStorage.setItem("lastSelectedGuild", JSON.stringify({
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
            goto(moreItem.href);
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
                </div>
              {/if}

            </button>
          {:else}
            <!-- Regular nav item -->
            <a
              href={item.href}
              class="flex flex-col items-center justify-center py-2 px-4 relative transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
              aria-current={activeIndex === i ? 'page' : undefined}
              style="color: {activeIndex === i ? $colorStore.primary : $colorStore.muted};
                     focus:ring-color: {$colorStore.primary};"
              aria-label="Navigate to {item.label}"
              on:click|preventDefault={(e) => {
                e.preventDefault();
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
                    class="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                    style="background: {$colorStore.primary}"
                    transition:scale={{ duration: 200 }}
                  ></div>
                {/if}

                <!-- Music playing indicator -->
                {#if item.href === '/dashboard/music' && musicPlaying}
                  <div
                    class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full animate-pulse"
                    style="background: {$colorStore.accent}"
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
                  in:scale|local={{ duration: 250, start: 0, delay: 50 }}
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