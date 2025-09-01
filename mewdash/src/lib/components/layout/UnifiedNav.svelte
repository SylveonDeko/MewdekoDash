<!--
@component
A unified navigation component that provides responsive navigation with server and guild selection.

- Responsive design that adapts to mobile and desktop
- Server/guild selection dropdown with search
- Bot instance switching functionality
- Dynamic navigation menu with nested items
- Accessibility-compliant navigation structure

@example
```svelte
<UnifiedNav 
  items={navigationItems}
  data={{ user: currentUser }}
/>
```
-->
<script lang="ts">
  import { page } from "$app/stores";
  import { fade, slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { clickOutside } from "$lib/clickOutside.ts";
  import { browser } from "$app/environment";
  import type { ComponentType } from "svelte";
  import { onDestroy, onMount } from "svelte";
  import type { DiscordGuild } from "$lib/types/discordGuild.ts";
  import type { BotInstance } from "$lib/types/models.ts";
  import type { DiscordUser } from "$lib/types/discord.ts";
  import { api } from "$lib/api.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { derived, get, writable } from "svelte/store";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { userAdminGuilds } from "$lib/stores/adminGuildsStore.ts";
  import { logger } from "$lib/logger.ts";
  import { goto } from "$app/navigation";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { userStore } from "$lib/stores/userStore.ts";
  import { musicStore } from "$lib/stores/musicStore.ts";
  import MiniMusicPlayer from "$lib/components/music/MiniMusicPlayer.svelte";
  import SetupSuggestionBanner from "$lib/components/dashboard/SetupSuggestionBanner.svelte";
  import {
    ArrowLeft,
    Badge,
    BarChart3,
    Gift,
    HandMetal,
    Heart,
    Lightbulb,
    Link,
    Lock,
    MessageSquare,
    Moon,
    Music,
    RotateCcw,
    Save,
    Settings,
    Shield,
    Star,
    Tag,
    TrendingUp,
    Users
  } from "lucide-svelte";

  // Types
  type NavItem = {
    title: string;
    elements: {
      title?: string;
      href: string;
    }[];
  };

  type ProcessedItem = {
    title: string;
    wrapped: boolean;
    href?: string;
    icon?: string | ComponentType;
    children?: { title?: string; href: string; icon?: string | ComponentType }[];
  };

  // Props
  export let items: NavItem[] = [];
  export let data: { user?: DiscordUser } | undefined = undefined;

  // Stores
  const isOwnerStore = writable(false);

  // Derived store for current user (server data takes priority, fallback to user store)
  $: currentUser = data?.user || $userStore;

  // State
  let guildFetchError: string | null = null;
  let lastSelectedGuild: BigInt | null = null;
  let instances: BotInstance[] = [];
  let instancesLoading = true;
  let instancesError: string | null = null;
  let menuOpen = false;
  let sidebarOpen = false;
  let dropdownOpen = false;
  let isMobile = false;
  let adminGuilds: DiscordGuild[] = [];
  let isFetchingGuilds = false;
  let initialized = false;
  let checkingInstances = false;

  let instanceStates: Record<string, {
    loading: boolean;
    hasMutualGuild: boolean;
    error: string | null;
    checked: boolean;
  }> = {};

  // Computed - only access page store in browser
  $: isDashboard = browser ? $page.url.pathname.startsWith("/dashboard") : false;
  $: current = browser ? $page.url.pathname : "";
  $: isMinimalMode = isDashboard; // Use minimal mode for dashboard pages
  $: musicStatus = $musicStore.status;
  $: showMiniPlayer = isMinimalMode && musicStatus?.CurrentTrack && current !== "/dashboard/music";

  // Check if we're on a dashboard subpage (not the main dashboard)
  $: isDashboardSubpage = browser && isDashboard && (
    (current !== "/dashboard" && !current.startsWith("/dashboard?")) ||
    ($page.url.searchParams.get("tab") && $page.url.searchParams.get("tab") !== "overview")
  );

  // Check if we're on the main dashboard (no tabs or overview tab)
  $: isMainDashboard = browser && isDashboard && current === "/dashboard" && (!$page.url.searchParams.get("tab") || $page.url.searchParams.get("tab") === "overview");
  

  // Filter instances to only show those with mutual guilds
  $: visibleInstances = instances.filter(instance => {
    const instanceId = instance.botId.toString();
    const state = instanceStates[instanceId];
    // Only show instances that have been checked and have mutual guilds
    return state?.checked && state?.hasMutualGuild;
  });

  // Track if we're still checking any instances
  $: stillCheckingInstances = Object.values(instanceStates).some(state => state.loading);

  // Derived store for computed items - only use page store in browser
  const computedItemsStore = derived(
    [page, currentGuild, isOwnerStore],
    ([$page, $isOwner]) => {
      if (!browser) {
        // During SSR, return empty items to avoid page store access
        return [];
      }
      if (!$page || !$page.url)
          return [];
      const isDashboard = $page.url.pathname.startsWith("/dashboard");
      return isDashboard ? buildDashboardItems($isOwner) : buildMainItems(items);
    }
  );
  $: computedItems = $computedItemsStore;

  function debounce(fn: (...args: any[]) => void, ms: number) {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      if (browser) {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
      }
    };
  }


  // Back button handler
  function handleBackButton() {
    if (browser) {
      const tabParam = $page.url.searchParams.get("tab");

      // If we're on a tabbed dashboard page (with tab parameter), go to main dashboard
      if (tabParam && tabParam !== "overview") {
        goto("/dashboard", { replaceState: false });
      } else if (current !== "/dashboard") {
        // For other subpages (/dashboard/music, /dashboard/settings, etc.), go to main dashboard
        goto("/dashboard", { replaceState: false });
      } else if (!get(currentGuild) && get(currentInstance)) {
        // If we're on main dashboard but no guild selected, this might be helpful to show guild selection
        // Don't navigate away, just stay on dashboard to allow guild selection
        console.log("On main dashboard with instance but no guild - staying to allow guild selection");
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && (menuOpen || sidebarOpen || dropdownOpen)) {
      e.preventDefault();
      closeMobileMenu();
      closeDropdown();
    }
  };

  function handleResize() {
    isMobile = browser ? window.innerWidth < 768 : false;
    // Close mobile menu if screen becomes large enough
    if (browser && window.innerWidth >= 768 && (menuOpen || sidebarOpen)) {
      closeMobileMenu();
    }
  }

  const debouncedResize = debounce(handleResize, 250);

  function checkMobile() {
    handleResize();
  }

  async function checkInstanceMutualGuilds(instance: BotInstance) {
    if (!currentUser?.id) return false;

    const instanceId = instance.botId.toString();

    // Set loading state
    instanceStates[instanceId] = {
      loading: true,
      hasMutualGuild: false,
      error: null,
      checked: false
    };
    instanceStates = { ...instanceStates }; // Trigger reactivity

    const customHeaders = {
      "X-Instance-Url": `http://localhost:${instance.port}/botapi`
    };

    try {
      console.log(`Nav: Checking mutual guilds for instance ${instance.botName} (${instanceId})`);
      const mutualGuilds = await api.getMutualGuilds(currentUser.id, undefined, customHeaders);
      const hasMutual = mutualGuilds && Array.isArray(mutualGuilds) && mutualGuilds.length > 0;

      instanceStates[instanceId] = {
        loading: false,
        hasMutualGuild: hasMutual,
        error: null,
        checked: true
      };
      instanceStates = { ...instanceStates }; // Trigger reactivity

      console.log(`Nav: Instance ${instance.botName}: hasMutualGuild = ${hasMutual}`);
      return hasMutual;
    } catch (err: any) {
      console.log(`Nav: Error checking mutual guilds for instance ${instance.botName}:`, err);

      // Check if it's a 404 error (no mutual guilds found)
      const is404 = err?.message?.includes("404") || err?.status === 404 || err?.response?.status === 404;

      if (is404) {
        console.log(`Nav: Instance ${instance.botName}: No mutual guilds (404)`);
        instanceStates[instanceId] = {
          loading: false,
          hasMutualGuild: false,
          error: null, // 404 is not an error, it means no mutual guilds
          checked: true
        };
      } else {
        console.error(`Nav: Actual error for instance ${instance.botName}:`, err);
        instanceStates[instanceId] = {
          loading: false,
          hasMutualGuild: false,
          error: "Failed to check mutual guilds",
          checked: true
        };
      }

      instanceStates = { ...instanceStates }; // Trigger reactivity
      return false;
    }
  }

  // Dashboard items with icons
  function getDashboardItems(isOwner: boolean = false) {
    const items = [
      {
        category: "Core",
        items: [
          { title: "Dashboard", href: "/dashboard", icon: BarChart3 },
          { title: "Settings", href: "/dashboard/settings", icon: Settings }
        ]
      },
      {
        category: "Community",
        items: [
          { title: "AFK", href: "/dashboard/afk", icon: Moon },
          { title: "XP", href: "/dashboard/xp", icon: Star },
          { title: "Suggestions", href: "/dashboard/suggestions", icon: Lightbulb },
          { title: "MultiGreets", href: "/dashboard/multigreets", icon: HandMetal },
          { title: "Invites", href: "/dashboard/invites", icon: Users },
          { title: "Role Greets", href: "/dashboard/rolegreets", icon: Tag },
          { title: "Role States", href: "/dashboard/rolestates", icon: RotateCcw },
          { title: "Starboard", href: "/dashboard/starboard", icon: Star },
          { title: "Patreon", href: "/dashboard/patreon", icon: Heart }
        ]
      },
      {
        category: "Content",
        items: [
          { title: "Music", href: "/dashboard/music", icon: Music },
          { title: "Triggers", href: "/dashboard/chat-triggers", icon: MessageSquare },
          { title: "Embed Builder", href: "/dashboard/embedbuilder", icon: Link }
        ]
      },
      {
        category: "Management",
        items: [
          { title: "Moderation", href: "/dashboard/moderation", icon: Shield },
          { title: "Administration", href: "/dashboard/administration", icon: Badge },
          { title: "Permissions", href: "/dashboard/permissions", icon: Lock },
          { title: "Tickets", href: "/dashboard/tickets", icon: MessageSquare },
          { title: "Giveaways", href: "/dashboard/giveaways", icon: Gift },
          { title: "Chat Saver", href: "/dashboard/chatsaver", icon: Save }
        ]
      }
    ];

    if (isOwner) {
      items.find(item => item.category === "Management")?.items.push(
        { title: "Performance", href: "/dashboard/performance", icon: TrendingUp }
      );
    }

    return items;
  }

  function buildDashboardItems(isOwner: boolean = false): ProcessedItem[] {
    if (!get(currentGuild)) {
      return [{ title: "Dashboard", wrapped: false, href: "/dashboard", icon: BarChart3 }];
    }

    const items = getDashboardItems(isOwner);

    if (isMobile) {
      return [];
    } else {
      return items.map(category => ({
        title: category.category,
        wrapped: true,
        children: category.items.map(item => ({
          title: item.title,
          href: item.href,
          icon: item.icon
        }))
      }));
    }
  }

  function buildMainItems(items: NavItem[]): ProcessedItem[] {
    return items.flatMap((item): ProcessedItem => {
      const elems = item.elements;
      if (elems.length === 1 && !elems[0].title) {
        return {
          title: item.title,
          wrapped: false,
          href: elems[0].href
        };
      }
      return {
        title: item.title,
        wrapped: true,
        children: elems
      };
    });
  }

  // UI Interaction Functions
  function toggleMenu() {
    if (isDashboard) {
      sidebarOpen = !sidebarOpen;
    } else {
      menuOpen = !menuOpen;
    }

    if (browser) {
      document.body.style.overflow = (menuOpen || sidebarOpen) ? "hidden" : "";
    }
  }

  function closeMobileMenu() {
    menuOpen = false;
    sidebarOpen = false;
    if (browser) {
      document.body.style.overflow = "";
    }
  }

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  function closeDropdown() {
    dropdownOpen = false;
  }

  // API and Data Functions
  async function checkOwnership() {
    if (!currentUser?.id) return;

    try {
      const isOwner = await api.isOwner(BigInt(currentUser.id));
      isOwnerStore.set(isOwner);
    } catch (err) {
      logger.error("Error checking owner status:", err);
      isOwnerStore.set(false);
    }
  }

  async function selectGuild(guild: DiscordGuild) {
    if (get(currentGuild) === guild) return;

    currentGuild.set(guild);

    if (browser) {
      try {
        const currentInst = get(currentInstance);
        const storageKey = currentInst ? `lastSelectedGuild_${currentInst.botId}` : "lastSelectedGuild";

        localStorage.setItem(storageKey, JSON.stringify({
          id: guild.id.toString(),
          name: guild.name,
          icon: guild.icon,
          owner: guild.owner,
          permissions: guild.permissions,
          features: guild.features
        }));

        // Check if wizard should be shown for this guild
        await checkWizardForGuild(guild);
      } catch (err) {
        logger.error("Failed to save guild to localStorage:", err);
      }
    }
  }

  async function checkWizardForGuild(guild: DiscordGuild) {
    if (!currentUser || !browser) return;
    
    try {
      // Don't check wizard if we're already on wizard page
      if (current.startsWith('/wizard')) return;
      
      logger.debug("Checking wizard state for guild:", guild.name);
      
      const wizardDecision = await api.shouldShowWizard(BigInt(currentUser.id), guild.id);
      
      if (wizardDecision.showWizard) {
        // Convert numeric wizard type to string
        const wizardTypeString = wizardDecision.wizardType === 1 ? 'first-time' : 'quick-setup';
        logger.info(`Triggering ${wizardTypeString} wizard for guild ${guild.name}: ${wizardDecision.reason}`);
        goto(`/wizard?guild=${guild.id}&type=${wizardTypeString}`);
      } else if (wizardDecision.showSuggestion && !current.startsWith('/dashboard')) {
        // Show setup suggestion banner (will be implemented next)
        logger.debug(`Showing setup suggestion for guild ${guild.name}: ${wizardDecision.reason}`);
        showSetupSuggestion(guild, wizardDecision.context);
      } else {
        logger.debug(`No wizard needed for guild ${guild.name}: ${wizardDecision.reason}`);
      }
    } catch (err) {
      logger.error("Error checking wizard state for guild:", guild.name, err);
      // Fail gracefully - don't block normal dashboard access
    }
  }

  // Setup suggestion state
  let setupSuggestionVisible = false;
  let setupSuggestionGuild: DiscordGuild | null = null;
  let setupSuggestionContext: any = null;

  function showSetupSuggestion(guild: DiscordGuild, context: any) {
    setupSuggestionGuild = guild;
    setupSuggestionContext = context;
    setupSuggestionVisible = true;
  }

  function dismissSetupSuggestion() {
    setupSuggestionVisible = false;
    setupSuggestionGuild = null;
    setupSuggestionContext = null;
  }

  function startQuickSetup() {
    if (setupSuggestionGuild && browser) {
      goto(`/wizard?guild=${setupSuggestionGuild.id}&type=quick-setup`);
    }
  }

  async function fetchGuildsIfReady() {
    if (!get(currentInstance)) {
      logger.debug("No current instance, skipping guild fetch");
      return;
    }

    if (!currentUser) {
      logger.debug("No current user, skipping guild fetch");
      return;
    }

    isFetchingGuilds = true;
    guildFetchError = null;
    try {
      logger.info("Fetching guilds for user:", currentUser.id, "and instance:", get(currentInstance).botId);
      const newGuilds = await api.getMutualGuilds(currentUser.id);
      adminGuilds = newGuilds || [];

      if (adminGuilds.length === 0) {
        guildFetchError = "No available servers";
      }

      userAdminGuilds.set(adminGuilds);
      logger.debug("Guilds fetched successfully:", adminGuilds.length);

      if (initialized && lastSelectedGuild) {
        const guild = adminGuilds.find(g => g.id === lastSelectedGuild);
        if (guild) {
          await selectGuild(guild);
        }
      }

    } catch (e) {
      logger.error("Error fetching guilds:", e);
      guildFetchError = "Failed to load servers";
      adminGuilds = [];
    } finally {
      isFetchingGuilds = false;
    }
  }

  async function handleInstanceSelect(instance: BotInstance) {
    const previousInstance = get(currentInstance);
    
    // Don't do anything if this is already the current instance
    if (previousInstance?.botId === instance.botId) {
      console.log("Same instance selected, no action needed");
      closeDropdown();
      return;
    }

    // Clear current guild when switching instances to prevent stale data
    currentGuild.set(null);

    // Clear persisted guild data for the current instance when switching instances
    if (browser) {
      if (previousInstance) {
        const oldStorageKey = `lastSelectedGuild_${previousInstance.botId}`;
        localStorage.removeItem(oldStorageKey);
      }
      // Also clear the generic key for backwards compatibility
      localStorage.removeItem("lastSelectedGuild");
    }

    // Set the new instance
    currentInstance.set(instance);

    if (browser) {
      localStorage.setItem("selectedInstance", JSON.stringify(instance));

      // After setting an instance, fetch the guilds for the new instance
      await fetchGuildsIfReady();
    }
    closeDropdown();

    // Only redirect to main dashboard if we're actively switching instances AND on a subpage
    // Don't redirect on initial instance selection (when no instance was previously selected)
    if (previousInstance && isDashboardSubpage) {
      goto("/dashboard");
    }
  }

  async function initializeInstances() {
    instancesLoading = true;
    instancesError = null;

    try {
      const response = await api.getBotInstances();
      instances = response || [];

      if (instances.length === 0) {
        instancesLoading = false;
        return;
      }

      checkingInstances = true;

      // Check mutual guilds for all instances in parallel
      await Promise.all(instances.map(checkInstanceMutualGuilds));

      checkingInstances = false;

      // Check for stored instance and validate it has mutual guilds
      if (browser) {
        const storedInstance = localStorage.getItem("selectedInstance");
        if (storedInstance) {
          try {
            const parsedInstance = JSON.parse(storedInstance);
            const instance = visibleInstances.find(i => i.botId === parsedInstance.botId);
            if (instance) {
              logger.debug("Restoring instance:", instance.botName);
              currentInstance.set(instance);
              setTimeout(fetchGuildsIfReady, 100);
            }
          } catch (err) {
            logger.error("Error parsing stored instance:", err);
          }
        } else if (visibleInstances.length === 1) {
          // Auto-select if there's only one visible instance
          logger.debug("Auto-selecting the only visible instance:", visibleInstances[0].botName);
          currentInstance.set(visibleInstances[0]);
          setTimeout(fetchGuildsIfReady, 100);
        }
      }
    } catch (err) {
      instancesError = "Failed to load instances";
      logger.error("Error loading instances:", err);
      checkingInstances = false;
    } finally {
      instancesLoading = false;
    }
  }

  async function restoreLastGuild() {
    if (!browser) return;

    const currentInst = get(currentInstance);
    const storageKey = currentInst ? `lastSelectedGuild_${currentInst.botId}` : "lastSelectedGuild";

    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const storedGuild = JSON.parse(stored);
        lastSelectedGuild = BigInt(storedGuild.id);

        // Only attempt to select if we have guilds loaded
        if (adminGuilds.length > 0) {
          const guild = adminGuilds.find(g => g.id === lastSelectedGuild);
          if (guild) {
            logger.debug("Restoring last guild for instance:", currentInst?.botName, "guild:", guild.name);
            await selectGuild(guild);
          }
        }
      } catch (err) {
        logger.error("Error restoring last guild:", err);
      }
    }
  }

  async function initialize() {
    if (!browser || initialized) return;

    try {
      logger.debug("Initializing navigation component");
      if (currentUser) {
        await checkOwnership();
      }

      // Always initialize instances, but handle dashboard differently
      await initializeInstances();

      // Explicitly check if we have a current instance now
      const currentInst = get(currentInstance);
      if (currentInst) {
        await fetchGuildsIfReady();
        await restoreLastGuild();
      }

      initialized = true;
    } catch (err) {
      logger.error("Error during initialization:", err);
    }
  }

  onMount(() => {
    if (browser) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("resize", debouncedResize);

      checkMobile();
      initialize();

      // Watch for instance changes to refetch guilds
      const unsubscribe = currentInstance.subscribe(value => {
        if (value && initialized) {
          fetchGuildsIfReady();
        }
      });

      return () => {
        unsubscribe();
        window.removeEventListener("resize", debouncedResize);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener("resize", debouncedResize);
      window.removeEventListener("keydown", handleKeyDown);
    }
  });

</script>

<nav
  aria-label="Main navigation"
  class="py-4 relative z-10"
  style="background: linear-gradient(135deg,
    {$colorStore?.gradientStart}10,
    {$colorStore?.gradientMid}15,
    {$colorStore?.gradientEnd}10
  );"
>
  <div class="sm:container flex items-center mx-auto px-4 lg:px-6">
    <!-- Left section - Back button for dashboard or logo for main site -->
    <div class="w-[160px] lg:w-[200px] flex-shrink-0" class:md:w-[200px]={isDashboard}>
      {#if isDashboard}
        <!-- Back button for dashboard (disabled on main dashboard) -->
        <button
          class="flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200"
          class:opacity-30={isMainDashboard}
          class:cursor-not-allowed={isMainDashboard}
          class:hover:scale-105={!isMainDashboard}
          style="background: {isMainDashboard ? $colorStore.primary + '10' : $colorStore.primary + '20'}; 
                 color: {isMainDashboard ? $colorStore.muted : $colorStore.primary}; 
                 border: 1px solid {isMainDashboard ? $colorStore.primary + '15' : $colorStore.primary + '30'};"
          on:click={isMainDashboard ? undefined : handleBackButton}
          disabled={isMainDashboard}
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
          <span class="hidden sm:inline text-sm font-medium">Back</span>
        </button>
      {:else}
        <!-- Logo for main site only (not dashboard) -->
        <a
          class="flex items-center py-[0.3rem] justify-start"
          href="/"
          title="mewdeko-banner"
        >
          <img
            alt="Mewdeko's Avatar"
            class="h-12 mr-3"
            height="1024"
            src="/img/Mewdeko.png"
            width="1024"
          />
          <span class="hidden xs:block self-center text-xl font-semibold whitespace-nowrap text-mewd-white">
            Mewdeko
          </span>
        </a>
      {/if}
    </div>

    <!-- Center section (nav items) - Hidden in minimal mode -->
    {#if !isMinimalMode}
      <div class="flex-grow flex justify-center z-20">
        <div
          class="hidden md:flex flex-row p-4 space-x-2 lg:space-x-4 text-[16px] font-medium"
          role="navigation"
        >
          {#each computedItems as item, i}
            {#if item.wrapped}
              <div class="relative group" in:slide|local={{ duration: 300, delay: i * 50, axis: 'x' }}>
                <button
                  class="ripple-effect flex items-center space-x-2 px-3 py-2 lg:px-4 lg:py-2 rounded-md transition-all duration-200 ease-in-out min-h-[40px]"
                  style="color: {$colorStore.text};"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span>{item.title}</span>
                  <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
                <div
                  class="absolute left-0 mt-2 w-48 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 backdrop-blur-md border"
                  style="background: linear-gradient(135deg, {$colorStore.gradientStart}95, {$colorStore.gradientEnd}95);"
                  role="menu"
                >
                  {#each item.children || [] as child}
                    <a
                      href={child.href || '#'}
                      data-sveltekit-preload-data="hover"
                      data-sveltekit-noscroll
                      class="ripple-effect flex items-center p-2 transition-colors hover:bg-[var(--hover-bg-color)]"
                      style="--hover-bg-color: {$colorStore.primary}20; color: {$colorStore.text};"
                      role="menuitem"
                      on:click|preventDefault={(e) => {
        e.preventDefault();
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
              logger.error("Error storing guild:", err);
            }
          }
        }
        goto(child.href || '/');
      }}
                    >
                      {#if child.icon}
                        {#if typeof child.icon === 'string'}
                          <span aria-hidden="true" class="mr-2">{child.icon}</span>
                        {:else}
                          <svelte:component this={child.icon} class="mr-2 w-4 h-4" aria-hidden="true" />
                        {/if}
                      {/if}
                      {child.title}
                    </a>
                  {/each}
                </div>
              </div>
            {:else}
              <a
                href={item.href || '#'}
                data-sveltekit-preload-data="hover"
                data-sveltekit-noscroll
                class="ripple-effect flex items-center space-x-2 px-3 py-2 lg:px-4 lg:py-2 rounded-md transition-all duration-200 ease-in-out min-h-[40px] hover:bg-[var(--hover-bg-color)]"
                in:slide|local={{ duration: 300, delay: i * 50, axis: 'x' }}
                style:--hover-bg-color="{$colorStore.primary}20"
                style:background-color={current === item.href ? `${$colorStore.primary}30` : 'transparent'}
                on:click|preventDefault={(e) => {
        e.preventDefault();
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
              logger.error("Error storing guild:", err);
            }
          }
        }
        goto(item.href || '/');
      }}
              >
                {#if item.icon}
                  {#if typeof item.icon === 'string'}
                    <span aria-hidden="true" class="mr-2">{item.icon}</span>
                  {:else}
                    <svelte:component this={item.icon} class="w-4 h-4 mr-2" aria-hidden="true" />
                  {/if}
                {/if}
                <span>{item.title}</span>
              </a>
            {/if}
          {/each}
        </div>
      </div>
    {:else}
      <!-- Dashboard mode: centered logo with subpage name -->
      <div class="flex-grow flex justify-center items-center relative">
        <!-- Dashboard Logo (perfectly centered on all screen sizes) -->
        <div class="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
          <a
            href="/"
            class="block transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
            style:focus:ring-color={$colorStore.primary}
            title="Go to home page"
            aria-label="Return to home page"
          >
            <img
              alt="Mewdeko"
              class="h-12 w-12 object-contain"
              src="/img/Mewdeko.png"
            />
          </a>
        </div>

        <!-- Mini Music Player (positioned to the right of center, only on large screens) -->
        {#if showMiniPlayer}
          <div class="hidden xl:block absolute right-0 top-1/2 transform -translate-y-1/2">
            <MiniMusicPlayer {musicStatus} isVisible={true} />
          </div>
        {/if}
      </div>
    {/if}

    <!-- Right section -->
    <div class="flex items-center gap-2 w-[160px] lg:w-[200px] justify-end" class:md:w-[200px]={isDashboard}>
      {#if !currentUser}
        <form action="/api/discord/login" method="GET" data-sveltekit-reload>
          <button type="submit"
                  class="ripple-effect rounded-lg px-4 py-2 font-medium transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg backdrop-blur-sm border"
                  style="background: linear-gradient(135deg, {$colorStore.primary}80, {$colorStore.secondary}80);
                         color: {$colorStore.text};
                         border-color: {$colorStore.primary}50;
                         box-shadow: 0 2px 8px {$colorStore.primary}30;">
            Login
          </button>
        </form>
      {:else}
        <!-- Desktop User & Instance Display -->
        <div class="hidden md:flex relative" use:clickOutside on:clickoutside={() => closeDropdown()}>
          <button
            class="ripple-effect flex items-center gap-2 p-2 pl-3 pr-4 rounded-lg transition-all duration-200 ease-in-out backdrop-blur-sm border hover:scale-[1.02] shadow-lg hover:shadow-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   border-color: {$colorStore.primary}40;
                   box-shadow: 0 2px 8px {$colorStore.primary}15;"
            on:click={toggleDropdown}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            <!-- User Avatar -->
            <img
              src={currentUser.avatar
                ? (currentUser.avatar.startsWith("a_")
                  ? `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.gif`
                  : `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png`)
                : `https://cdn.discordapp.com/embed/avatars/0.png`}
              alt={currentUser.username}
              class="w-10 h-10 rounded-full"
              style:background="{$colorStore.primary}20"
            />

            <!-- Username and instance display -->
            <div class="flex flex-col items-start">
              <span class="text-sm font-medium" style:color={$colorStore.text}>
                {currentUser.username}
              </span>
              {#if $currentInstance}
                <div class="flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full"
                        style:background-color={$currentInstance.isActive ? '#10B981' : $colorStore.accent}></span>
                  <span class="text-xs" style:color={$colorStore.muted}>
                    {$currentInstance.botName}
                  </span>
                </div>
              {:else}
                <span class="text-xs" style:color={$colorStore.muted}>
                  Select Instance
                </span>
              {/if}
            </div>

            <svg
              class="h-5 w-5 transition-transform ml-1"
              class:rotate-180={dropdownOpen}
              style:color={$colorStore.muted}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <!-- Desktop Dropdown -->
          {#if dropdownOpen}
            <!-- Dropdown arrow -->
            <div class="absolute right-4 top-full w-0 h-0 z-40"
                 style="border-left: 8px solid transparent;
                        border-right: 8px solid transparent;
                        border-bottom: 8px solid {$colorStore.primary}50;
                        margin-top: -1px;"></div>
            
            <div
              class="absolute right-0 top-full mt-1 w-80 rounded-xl p-4 flex flex-col space-y-4 shadow-2xl z-50 backdrop-blur-lg border"
              style="background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.9)), linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}25, {$colorStore.gradientEnd}20);
                    border-color: {$colorStore.primary}50;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);"
              role="menu"
              transition:slide|local={{ duration: 200 }}
            >
              <!-- Enhanced User Info -->
              <div class="p-4 rounded-xl mb-4 border backdrop-blur-sm"
                   style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}15);
                          border-color: {$colorStore.primary}40;">
                <div class="flex items-center space-x-3">
                  <div class="relative">
                    <img
                      src={currentUser.avatar
                        ? (currentUser.avatar.startsWith("a_")
                          ? `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.gif`
                          : `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png`)
                        : `https://cdn.discordapp.com/embed/avatars/0.png`}
                      alt={currentUser.username}
                      class="w-12 h-12 rounded-xl border-2"
                      style="border-color: {$colorStore.primary}50;"
                    />
                    <!-- Online indicator -->
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black"
                         style="background: #10b981;"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2">
                      <h2 class="font-bold text-lg truncate" style="color: {$colorStore.text};">{currentUser.username}</h2>
                      {#if currentUser.discriminator !== "0"}
                        <span class="text-sm" style="color: {$colorStore.muted};">#{currentUser.discriminator}</span>
                      {/if}
                    </div>
                    {#if $currentInstance}
                      <div class="flex items-center gap-2 mt-1">
                        <span class="w-2 h-2 rounded-full"
                              style="background: {$currentInstance.isActive ? '#10B981' : $colorStore.accent};"></span>
                        <span class="text-xs truncate" style="color: {$colorStore.muted};">
                          {$currentInstance.botName}
                        </span>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>

              <!-- Instance Selection - Only show if more than one instance -->
              {#if visibleInstances.length > 1 || instancesLoading || stillCheckingInstances}
                <div class="py-2 border-t border-opacity-30" style="border-color: {$colorStore.primary};">
                  <div class="text-sm font-medium mb-2" style="color: {$colorStore.muted};">Bot Instances</div>
                  <div class="max-h-48 overflow-y-auto">
                    {#if instancesLoading || stillCheckingInstances}
                      <div class="text-sm px-2 py-1 flex items-center" style="color: {$colorStore.muted};">
                        <div class="animate-spin mr-2 h-4 w-4 border-2 rounded-full"
                             style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
                        {instancesLoading ? 'Loading instances...' : 'Checking server access...'}
                      </div>
                    {:else if instancesError}
                      <div class="text-sm px-2 py-1" style="color: {$colorStore.accent};">{instancesError}</div>
                    {:else if visibleInstances.length === 0}
                      <div class="text-sm px-2 py-1" style="color: {$colorStore.muted};">No accessible instances</div>
                    {:else}
                      {#each visibleInstances as instance}
                        <button
                          class="ripple-effect w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all duration-200 ease-in-out hover:bg-opacity-30 border border-transparent"
                          style="color: {$colorStore.text};
                                 background: {$currentInstance?.botId === instance.botId ? `linear-gradient(135deg, ${$colorStore.primary}40, ${$colorStore.secondary}40)` : 'transparent'};
                                 border-color: {$currentInstance?.botId === instance.botId ? $colorStore.primary + '50' : 'transparent'};
                                 hover:background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);
                                 hover:border-color: {$colorStore.primary}40;"
                          on:click={() => handleInstanceSelect(instance)}
                          aria-pressed={$currentInstance?.botId === instance.botId}
                        >
                          <img
                            src={instance.botAvatar}
                            alt=""
                            class="w-6 h-6 rounded-full"
                          />
                          <div class="flex flex-col flex-1 min-w-0">
                            <span class="text-sm truncate">
                              {instance.botName}
                            </span>
                          </div>
                          {#if !instance.isActive}
                            <span class="px-1.5 py-0.5 rounded text-xs bg-opacity-10"
                                  style="color: {$colorStore.accent}; background-color: {$colorStore.accent}10;">
                              Offline
                            </span>
                          {/if}
                        </button>
                      {/each}
                    {/if}
                  </div>
                </div>
              {/if}


              <!-- Prominent My Settings Link -->
              <div class="mb-4">
                <a
                  href="/me"
                  class="ripple-effect flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out hover:scale-[1.02] border font-medium w-full group"
                  style="background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);
                         color: {$colorStore.text};
                         border-color: {$colorStore.primary}50;
                         box-shadow: 0 4px 12px {$colorStore.primary}20;"
                  role="menuitem"
                >
                  <div class="p-2 rounded-lg transition-all group-hover:scale-110"
                       style="background: {$colorStore.primary}30;">
                    <Settings class="w-4 h-4" style="color: {$colorStore.primary};" />
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold">My Settings</div>
                    <div class="text-xs" style="color: {$colorStore.muted};">Profile, privacy & preferences</div>
                  </div>
                  <div class="text-lg opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</div>
                </a>
              </div>
              
              <!-- Logout -->
              <div class="pt-2 border-t border-opacity-30" style="border-color: {$colorStore.primary};">
                <form
                  action="/api/discord/logout"
                  method="GET"
                  class="w-full"
                >
                  <button
                    type="submit"
                    class="ripple-effect block w-full text-center px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:scale-105 border font-medium"
                    style="background: linear-gradient(135deg, {$colorStore.accent}80, rgba(239, 68, 68, 0.8));
                           color: white;
                           border-color: {$colorStore.accent}60;
                           box-shadow: 0 2px 8px {$colorStore.accent}30;
                           hover:box-shadow: 0 4px 12px {$colorStore.accent}40;"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
          {/if}
        </div>

        <!-- Mobile User Display -->
        <div class="md:hidden flex items-center gap-2">
          <img
            src={currentUser.avatar
              ? (currentUser.avatar.startsWith("a_")
                ? `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.gif`
                : `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png`)
              : `https://cdn.discordapp.com/embed/avatars/0.png`}
            alt={currentUser.username}
            class="w-8 h-8 rounded-full"
            style:background="{$colorStore.primary}20"
          />
        </div>

        <!-- Mobile menu button - hide in dashboard -->
        {#if !isDashboard}
          <button
            aria-controls="mobile-menu"
            aria-expanded={menuOpen || sidebarOpen}
            aria-label="Toggle navigation menu"
            class="inline-flex items-center p-3 rounded-lg border-transparent transition-all duration-200 ease-in-out md:hidden min-h-[44px] min-w-[44px] hover:bg-[var(--hover-bg-color)]"
            style:--hover-bg-color="{$colorStore.primary}20"
            style:border-color="{$colorStore.primary}30"
            on:click={toggleMenu}
          >
            <span class="sr-only">Toggle navigation menu</span>
            <div class="relative w-6 h-6 flex flex-col justify-center">
              <span
                class="block w-6 h-0.5 rounded transition-all duration-200 ease-in-out"
                class:rotate-45={menuOpen || sidebarOpen}
                class:translate-y-2={menuOpen || sidebarOpen}
                style:background-color={$colorStore.text}
              ></span>
              <span
                class="block w-6 h-0.5 rounded mt-1.5 transition-all duration-200 ease-in-out"
                class:opacity-0={menuOpen || sidebarOpen}
                style:background-color={$colorStore.text}
              ></span>
              <span
                class="block w-6 h-0.5 rounded mt-1.5 transition-all duration-200 ease-in-out"
                class:-rotate-45={menuOpen || sidebarOpen}
                class:-translate-y-2={menuOpen || sidebarOpen}
                style:background-color={$colorStore.text}
              ></span>
            </div>
          </button>
        {/if}
      {/if}
    </div>
  </div>

  <!-- Mobile menu -->
  {#if (menuOpen || sidebarOpen) && isMobile}
    <div
      class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40"
      on:click={closeMobileMenu}
      transition:fade={{ duration: 300, easing: cubicOut }}
      aria-hidden="true"
    ></div>

    <div
      class="fixed inset-y-0 right-0 w-72 z-50 flex flex-col overflow-hidden backdrop-blur-lg border-l shadow-2xl"
      style="background: linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.75)), linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}25, {$colorStore.gradientEnd}20);
             border-color: {$colorStore.primary}40;
             box-shadow: -8px 0 32px rgba(0,0,0,0.5), inset 0 0 0 1px {$colorStore.primary}20;"
      transition:slide={{ duration: 300, easing: cubicOut, axis: 'x' }}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-menu-title"
    >
      <!-- Mobile Header -->
      <div class="p-4 border-b border-opacity-30" style="border-color: {$colorStore.primary};">
        <div class="flex justify-between items-center">
          <div id="mobile-menu-title" class="sr-only">Mobile Navigation Menu</div>
          {#if currentUser}
            <div class="flex items-center space-x-3">
              <img
                src={currentUser.avatar
                  ? (currentUser.avatar.startsWith("a_")
                    ? `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.gif`
                    : `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png`)
                  : `https://cdn.discordapp.com/embed/avatars/0.png`}
                alt={currentUser.username}
                class="w-10 h-10 rounded-full"
              />
              <div>
                <div class="font-medium" style="color: {$colorStore.text};">{currentUser.username}</div>
                {#if currentUser.discriminator !== "0"}
                  <div style="color: {$colorStore.muted};" class="text-sm">#{currentUser.discriminator}</div>
                {/if}
              </div>
            </div>
          {/if}
          <button
            class="p-2 rounded-lg hover:bg-opacity-20 transition-colors"
            style="color: {$colorStore.muted}; hover:background-color: {$colorStore.primary}20;"
            on:click={closeMobileMenu}
            aria-label="Close menu"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Instance Selection -->
        <div class="p-4 border-b border-opacity-30" style="border-color: {$colorStore.primary};">
          <div class="text-sm font-medium mb-2" style="color: {$colorStore.muted};">Bot Instances</div>
          <div class="space-y-2">
            {#if instancesLoading || stillCheckingInstances}
              <div class="text-sm flex items-center" style="color: {$colorStore.muted};">
                <div class="animate-spin mr-2 h-4 w-4 border-2 rounded-full"
                     style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
                {instancesLoading ? 'Loading instances...' : 'Checking server access...'}
              </div>
            {:else if instancesError}
              <div class="text-sm" style="color: {$colorStore.accent};">{instancesError}</div>
            {:else if visibleInstances.length === 0}
              <div class="text-sm" style="color: {$colorStore.muted};">No accessible instances</div>
            {:else}
              {#each visibleInstances as instance}
                <button
                  class="ripple-effect w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all duration-200 ease-in-out border border-transparent hover:bg-[var(--hover-bg)] hover:border-color-[var(--hover-border)]"
                  style="
    --hover-bg: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);
    --hover-border: {$colorStore.primary}40;
    color: {$colorStore.text};
    background: {$currentInstance?.botId === instance.botId ? `linear-gradient(135deg, ${$colorStore.primary}40, ${$colorStore.secondary}40)` : 'transparent'};
    border-color: {$currentInstance?.botId === instance.botId ? $colorStore.primary + '50' : 'transparent'};
  "
                  on:click={() => {
                    handleInstanceSelect(instance);
                    closeMobileMenu();
                  }}
                  aria-pressed={$currentInstance?.botId === instance.botId}
                >
                  <img
                    src={instance.botAvatar}
                    alt=""
                    class="w-6 h-6 rounded-full"
                  />
                  <div class="flex flex-col flex-1 min-w-0">
                    <span class="text-sm truncate">
                      {instance.botName}
                    </span>
                  </div>
                  {#if !instance.isActive}
                    <span class="px-1.5 py-0.5 rounded text-xs bg-opacity-10"
                          style="color: {$colorStore.accent}; background-color: {$colorStore.accent}10;">
                      Offline
                    </span>
                  {/if}
                </button>
              {/each}
            {/if}
          </div>
        </div>

        <!-- Only show navigation items on non-dashboard pages for mobile -->
        {#if !isDashboard}
          <nav class="p-4 space-y-1">
            {#each computedItems as item}
              {#if item.wrapped}
                <div class="space-y-1">
                  <div class="text-sm font-medium px-2" style="color: {$colorStore.muted};">{item.title}</div>
                  {#each item.children || [] as child}
                    <a
                      href={child.href || '#'}
                      class="ripple-effect flex items-center px-4 py-3 rounded-lg hover:bg-opacity-30 transition-all duration-200 ease-in-out min-h-[44px] border border-transparent"
                      style="color: {$colorStore.text};
                    background: {current === child.href ? `linear-gradient(135deg, ${$colorStore.primary}40, ${$colorStore.secondary}40)` : 'transparent'};
                    border-color: {current === child.href ? $colorStore.primary + '50' : 'transparent'};
                    hover:background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);
                    hover:border-color: {$colorStore.primary}40;"
                      on:click={closeMobileMenu}
                    >
                      {#if child.icon}
                        {#if typeof child.icon === 'string'}
                          <span class="mr-3 text-lg" aria-hidden="true">{child.icon}</span>
                        {:else}
                          <svelte:component this={child.icon} class="mr-3 w-5 h-5" aria-hidden="true" />
                        {/if}
                      {/if}
                      <span class="font-medium">{child.title}</span>
                    </a>
                  {/each}
                </div>
              {:else}
                <a
                  href={item.href || '#'}
                  class="ripple-effect flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-30 transition-all duration-200 ease-in-out min-h-[44px] border border-transparent"
                  style="color: {$colorStore.text};
                background: {current === item.href ? `linear-gradient(135deg, ${$colorStore.primary}40, ${$colorStore.secondary}40)` : 'transparent'};
                border-color: {current === item.href ? $colorStore.primary + '50' : 'transparent'};
                hover:background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);
                hover:border-color: {$colorStore.primary}40;"
                  on:click={closeMobileMenu}
                >
                  {#if item.icon}
                    {#if typeof item.icon === 'string'}
                      <span class="text-lg" aria-hidden="true">{item.icon}</span>
                    {:else}
                      <svelte:component this={item.icon} class="w-5 h-5" aria-hidden="true" />
                    {/if}
                  {/if}
                  <span class="font-medium">{item.title}</span>
                </a>
              {/if}
            {/each}
          </nav>
        {/if}
      </div>

      <!-- Mobile Footer -->
      <div class="p-4 border-t border-opacity-30" style="border-color: {$colorStore.primary};">
        <form
          action="/api/discord/logout"
          method="GET"
          class="w-full"
        >
          <button
            type="submit"
            class="ripple-effect block w-full text-center px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:scale-105 border font-medium"
            style="background: linear-gradient(135deg, {$colorStore.accent}80, rgba(239, 68, 68, 0.8));
                   color: white;
                   border-color: {$colorStore.accent}60;
                   box-shadow: 0 2px 8px {$colorStore.accent}30;
                   hover:box-shadow: 0 4px 12px {$colorStore.accent}40;"
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  {/if}
</nav>

<style lang="postcss">
    :global(*::-webkit-scrollbar) {
        @apply w-2;
    }

    /* Ripple effect styles */
    .ripple-effect {
        position: relative;
        overflow: hidden;
    }

    .ripple-effect::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 70%);
        transform: translate(-50%, -50%);
        transition: width 0.4s ease-out, height 0.4s ease-out, opacity 0.4s ease-out;
        opacity: 0;
        pointer-events: none;
        z-index: 1;
    }

    .ripple-effect:hover::before {
        width: 100%;
        height: 100%;
        opacity: 1;
        animation: ripple-pulse 0.4s ease-out;
    }

    @keyframes ripple-pulse {
        0% {
            width: 0;
            height: 0;
            opacity: 0.6;
        }
        50% {
            opacity: 0.3;
        }
        100% {
            width: 100%;
            height: 100%;
            opacity: 0;
        }
    }

    /* Ensure text stays on top */
    .ripple-effect > * {
        position: relative;
        z-index: 2;
    }

    :global(*::-webkit-scrollbar-track) {
        background: rgba(var(--color-primary), 0.1);
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background: rgba(var(--color-primary), 0.3);
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb:hover) {
        background: rgba(var(--color-primary), 0.5);
    }

    /* Ensure dropdowns appear above other content */
    .group:hover .absolute {
        z-index: 50;
    }
</style>