<!-- lib/components/MobileNavBar.svelte -->
<script lang="ts">
  import { scale, slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import {
    Bell,
    Gift,
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
    { label: "Home", icon: Home, href: "/dashboard" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
    { label: "Music", icon: Music, href: "/dashboard/music" },
    { label: "XP", icon: Star, href: "/dashboard/xp" },
    { label: "Perms", icon: Shield, href: "/dashboard/permissions" },
    { label: "More", icon: Menu, href: "#", isMore: true }
  ];

  // Secondary items shown in expanded "More" state
  const moreItems = [
    { label: "AFK", icon: ZapOff, href: "/dashboard/afk" },
    { label: "Greets", icon: Bell, href: "/dashboard/multigreets" },
    { label: "Suggestions", icon: Lightbulb, href: "/dashboard/suggestions" },
    { label: "Triggers", icon: MessageSquare, href: "/dashboard/chat-triggers" },
    { label: "Embeds", icon: Link, href: "/dashboard/embedbuilder" },
    { label: "Giveaways", icon: Gift, href: "/dashboard/giveaways" },
    { label: "Chat Saver", icon: Save, href: "/dashboard/chatsaver" },
    { label: "Invites", icon: Users, href: "/dashboard/invites" }
  ];

  // State
  let showLabels = true;
  let showMoreMenu = false;
  let prevScrollPos = 0;
  let visible = true;
  let musicPlaying = false;

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

  // Show/hide the navbar based on scroll direction
  function handleScroll() {
    if (typeof window !== "undefined") {
      const currentScrollPos = window.pageYOffset;

      // Always show navbar when near the top
      if (currentScrollPos < 50) {
        visible = true;
      } else {
        // Hide when scrolling down, show when scrolling up
        visible = prevScrollPos > currentScrollPos;
      }

      prevScrollPos = currentScrollPos;
    }
  }

  // Toggle the more menu
  function toggleMoreMenu() {
    showMoreMenu = !showMoreMenu;
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
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden bg-cover bg-center"
            style="background-image: url('{$musicStore.status?.CurrentTrack?.AlbumArt || '/img/music-placeholder.png'}');"
          >
            <!-- Animated equalizer bars -->
            <div class="w-full h-full bg-black bg-opacity-50 flex items-end justify-center p-1">
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
          >
            <Music size={16} style="color: {$colorStore.primary}" />
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
    >
      <div class="flex justify-around">
        {#each navItems as item, i}
          {#if item.isMore}
            <!-- More menu button -->
            <button
              class="flex flex-col items-center justify-center py-2 px-4 relative more-button"
              on:click|stopPropagation={toggleMoreMenu}
              style="color: {moreMenuActive || showMoreMenu ? $colorStore.primary : $colorStore.muted}"
              aria-expanded={showMoreMenu}
              aria-label="More options"
            >
              <div class="relative">
                <svelte:component
                  this={item.icon}
                  size={24}
                  strokeWidth={1.5}
                />

                {#if showMoreMenu}
                  <div
                    class="absolute -top-1 -right-1 w-3 h-3 rounded-full backdrop-blur-md"
                  ></div>
                {/if}
              </div>
              {#if showLabels}
                <span class="text-xs mt-1">{item.label}</span>
              {/if}

              <!-- More menu dropdown -->
              {#if showMoreMenu}
                <div
                  class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 max-w-xs w-screen more-menu rounded-lg shadow-xl backdrop-blur-md"
                  style="max-height: 60vh; overflow-y: auto; margin-left: max(-40vw, -150px);
           border: 1px solid {$colorStore.primary}30;
           background: rgba(0, 0, 0, 0.5);"
                  transition:scale|local={{
      duration: 200,
      start: 0.8,
      opacity: 0,
      easing: cubicOut
    }}
                >
                  <div class="grid grid-cols-2 gap-1 p-1 backdrop-blur-md" style="background: rgba(0, 0, 0, 0.3);">
                    {#each moreItems as moreItem, j}
                      <a
                        href={moreItem.href}
                        data-sveltekit-preload-data="hover"
                        data-sveltekit-noscroll
                        class="flex flex-col items-center gap-1 px-2 py-3 hover:bg-opacity-20 transition-colors rounded-lg text-center backdrop-blur-md"
                        style="color: {currentPath.startsWith(moreItem.href) ? $colorStore.primary : $colorStore.text};"
                        in:slide|local={{ delay: j * 50, duration: 200 }}
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
                        <svelte:component this={moreItem.icon} size={20} />
                        <span class="text-xs whitespace-normal">{moreItem.label}</span>
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
              class="flex flex-col items-center justify-center py-2 px-4 relative"
              aria-current={activeIndex === i ? 'page' : undefined}
              style="color: {activeIndex === i ? $colorStore.primary : $colorStore.muted}"
            >
              <svelte:component
                this={item.icon}
                size={24}
                strokeWidth={1.5}
              />
              {#if showLabels}
                <span class="text-xs mt-1">{item.label}</span>
              {/if}

              {#if activeIndex === i}
                <div
                  class="absolute -bottom-px left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-t-sm"
                  style="background: {$colorStore.primary}"
                  in:scale|local={{ duration: 200, start: 0, delay: 100 }}
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