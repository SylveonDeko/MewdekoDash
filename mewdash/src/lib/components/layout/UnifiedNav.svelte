<!-- @migration-task Error while migrating Svelte code: can't migrate `$: currentUser = data?.user || $userStore;` to `$derived` because there's a variable named derived.
     Rename the variable and try again or migrate by hand. -->
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
>
```
-->
<script lang="ts">
  import { page } from "$app/state";
  import { fade, slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { clickOutside } from "$lib/clickOutside.ts";
  import { browser } from "$app/environment";

  import { onDestroy, onMount } from "svelte";
  import type { DiscordGuild } from "$lib/types/discordGuild.ts";
  import type { DiscordUser } from "$lib/types/discord.ts";
  import { type BotInstance, clientApi, instanceManagementApi, ownershipApi, wizardApi } from "$lib/api/index.ts";
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
    icon?: string;
    children?: { title?: string; href: string; icon?: string }[];
  };

  // Props
  interface Props {
    items?: NavItem[];
    data?: { user?: DiscordUser };
  }

  let { items = [], data = undefined }: Props = $props();

  // Stores
  const isOwnerStore = writable(false);

  // Derived store for current user (server data takes priority, fallback to user store)
  let currentUser = $derived(data?.user || $userStore);

  // State
  let guildFetchError = $state<string | null>(null);
  let lastSelectedGuild = $state<BigInt | null>(null);
  let instances = $state<BotInstance[]>([]);
  let instancesLoading = $state(true);
  let instancesError = $state<string | null>(null);
  let menuOpen = $state(false);
  let sidebarOpen = $state(false);
  let dropdownOpen = $state(false);
  let isMobile = $state(false);
  let adminGuilds = $state<DiscordGuild[]>([]);
  let isFetchingGuilds = $state(false);
  let initialized = $state(false);
  let checkingInstances = $state(false);

  let instanceStates = $state<Record<string, {
    loading: boolean;
    hasMutualGuild: boolean;
    error: string | null;
    checked: boolean;
  }>>({});

  // Computed - only access page in browser
  let isDashboard = $derived(browser ? page.url.pathname.startsWith("/dashboard") : false);
  let current = $derived(browser ? page.url.pathname : "");
  let isMinimalMode = $derived(isDashboard); // Use minimal mode for dashboard pages
  let musicStatus = $derived($musicStore.status);
  let showMiniPlayer = $derived(isMinimalMode && musicStatus?.CurrentTrack && current !== "/dashboard/music");

  // Check if we're on a dashboard subpage (not the main dashboard)
  let isDashboardSubpage = $derived(browser && isDashboard && (
    (current !== "/dashboard" && !current.startsWith("/dashboard?")) ||
    (page.url.searchParams.get("tab") && page.url.searchParams.get("tab") !== "overview")
  ));

  // Check if we're on the main dashboard (no tabs or overview tab)
  let isMainDashboard = $derived(browser && isDashboard && current === "/dashboard" && (!page.url.searchParams.get("tab") || page.url.searchParams.get("tab") === "overview"));
  

  // Filter instances to only show those with mutual guilds
  let visibleInstances = $derived(instances.filter(instance => {
    const instanceId = instance.botId.toString();
    const state = instanceStates[instanceId];
    // Only show instances that have been checked and have mutual guilds
    return state?.checked && state?.hasMutualGuild;
  }));

  // Track if we're still checking any instances
  let stillCheckingInstances = $derived(Object.values(instanceStates).some(state => state.loading));

  // Derived computed items based on current state
  let computedItems = $derived.by(() => {
    if (!browser) {
      // During SSR, return empty items
      return [];
    }
    if (!page || !page.url) {
      return [];
    }
    const isDashboard = page.url.pathname.startsWith("/dashboard");
    const isOwner = $isOwnerStore;
    return isDashboard ? buildDashboardItems(isOwner) : buildMainItems(items);
  });

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
      const tabParam = page.url.searchParams.get("tab");

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
      const mutualGuilds = await clientApi.getMutualGuilds(currentUser.id, true, fetch, customHeaders);
      const hasMutual = mutualGuilds && Array.isArray(mutualGuilds) && mutualGuilds.length > 0;

      instanceStates[instanceId] = {
        loading: false,
        hasMutualGuild: hasMutual,
        error: null,
        checked: true
      };
      instanceStates = { ...instanceStates }; // Trigger reactivity

      return hasMutual;
    } catch (err: any) {

      // Check if it's a 404 error (no mutual guilds found)
      const is404 = err?.message?.includes("404") || err?.status === 404 || err?.response?.status === 404;

      if (is404) {
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
          { title: "Dashboard", href: "/dashboard", icon: "fa-chart-bar" },
          { title: "Settings", href: "/dashboard/settings", icon: "fa-gear" }
        ]
      },
      {
        category: "Community",
        items: [
          { title: "AFK", href: "/dashboard/afk", icon: "fa-moon" },
          { title: "XP", href: "/dashboard/xp", icon: "fa-star" },
          { title: "Suggestions", href: "/dashboard/suggestions", icon: "fa-lightbulb" },
          { title: "Forms", href: "/dashboard/forms", icon: "fa-clipboard-list" },
          { title: "MultiGreets", href: "/dashboard/multigreets", icon: "fa-hand-horns" },
          { title: "Invites", href: "/dashboard/invites", icon: "fa-users" },
          { title: "Role Greets", href: "/dashboard/rolegreets", icon: "fa-tag" },
          { title: "Role States", href: "/dashboard/rolestates", icon: "fa-rotate-left" },
          { title: "Starboard", href: "/dashboard/starboard", icon: "fa-star" },
          { title: "Patreon", href: "/dashboard/patreon", icon: "fa-heart" }
        ]
      },
      {
        category: "Content",
        items: [
          { title: "Music", href: "/dashboard/music", icon: "fa-music" },
          { title: "Triggers", href: "/dashboard/chat-triggers", icon: "fa-comment" },
          { title: "Embed Builder", href: "/dashboard/embedbuilder", icon: "fa-link" }
        ]
      },
      {
        category: "Management",
        items: [
          { title: "Moderation", href: "/dashboard/moderation", icon: "fa-shield" },
          { title: "Administration", href: "/dashboard/administration", icon: "fa-badge" },
          { title: "Permissions", href: "/dashboard/permissions", icon: "fa-lock" },
          { title: "Tickets", href: "/dashboard/tickets", icon: "fa-comment" },
          { title: "Giveaways", href: "/dashboard/giveaways", icon: "fa-gift" },
          { title: "Chat Saver", href: "/dashboard/chatsaver", icon: "fa-floppy-disk" }
        ]
      }
    ];

    if (isOwner) {
      items.find(item => item.category === "Management")?.items.push(
        { title: "Performance", href: "/dashboard/performance", icon: "fa-arrow-trend-up" }
      );
    }

    return items;
  }

  function buildDashboardItems(isOwner: boolean = false): ProcessedItem[] {
    if (!get(currentGuild)) {
      return [{ title: "Dashboard", wrapped: false, href: "/dashboard", icon: "fa-chart-bar" }];
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
      const isOwner = await ownershipApi.isOwner(BigInt(currentUser.id));
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

        logger.info("Checking wizard state for guild:", guild.name);

      const wizardDecision = await wizardApi.shouldShowWizard(BigInt(currentUser.id), guild.id);
      
      if (wizardDecision.showWizard) {
        // Convert numeric wizard type to string
        const wizardTypeString = wizardDecision.wizardType === 1 ? 'first-time' : 'quick-setup';
        logger.info(`Triggering ${wizardTypeString} wizard for guild ${guild.name}: ${wizardDecision.reason}`);
        goto(`/wizard?guild=${guild.id}&type=${wizardTypeString}`);
      } else if (wizardDecision.showSuggestion && !current.startsWith('/dashboard')) {
        // Show setup suggestion banner (will be implemented next)
          logger.info(`Showing setup suggestion for guild ${guild.name}: ${wizardDecision.reason}`);
        showSetupSuggestion(guild, wizardDecision.context);
      } else {
          logger.info(`No wizard needed for guild ${guild.name}: ${wizardDecision.reason}`);
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
      return;
    }

    if (!currentUser) {
        logger.info("No current user, skipping guild fetch");
      return;
    }

    isFetchingGuilds = true;
    guildFetchError = null;
    try {
      const newGuilds = await clientApi.getMutualGuilds(currentUser.id);
      adminGuilds = newGuilds || [];

      if (adminGuilds.length === 0) {
        guildFetchError = "No available servers";
      }

      userAdminGuilds.set(adminGuilds);

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
      const response = await instanceManagementApi.getBotInstances();
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
              currentInstance.set(instance);
              setTimeout(fetchGuildsIfReady, 100);
            }
          } catch (err) {
            logger.error("Error parsing stored instance:", err);
          }
        } else if (visibleInstances.length === 1) {
          // Auto-select if there's only one visible instance
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
  class="py-2 lg:py-3 relative z-10 border-b"
  style="background: {$colorStore?.primary}05;
         border-color: {$colorStore?.primary}15;"
>
    <div class="flex items-center mx-auto px-4 lg:px-8 xl:px-12 max-w-[1920px]">
    <!-- Left section - Back button for dashboard or logo for main site -->
        <div class="w-[140px] lg:w-[180px] xl:w-[200px] shrink-0" class:md:w-[180px]={isDashboard}>
      {#if isDashboard}
        <!-- Back button for dashboard (disabled on main dashboard) -->
        <button
                class="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg transition-all duration-200"
          class:opacity-30={isMainDashboard}
          class:cursor-not-allowed={isMainDashboard}
                class:hover:scale-[1.02]={!isMainDashboard}
                style="background: {isMainDashboard ? $colorStore.primary + '10' : $colorStore.primary + '20'};
                 color: {isMainDashboard ? $colorStore.muted : $colorStore.primary};
                 border: 1px solid {isMainDashboard ? $colorStore.primary + '15' : $colorStore.primary + '30'};"
                onclick={isMainDashboard ? undefined : handleBackButton}
          disabled={isMainDashboard}
          aria-label="Go back"
        >
            <i class="fa-solid fa-arrow-left" style="font-size: 16px;"></i>
            <span class="hidden sm:inline text-xs font-medium">Back</span>
        </button>
      {:else}
        <!-- Logo for main site only (not dashboard) -->
        <a
                class="flex items-center py-1 justify-start"
          href="/"
          title="mewdeko-banner"
        >
          <img
            alt="Mewdeko's Avatar"
            class="h-10 w-10 object-contain mr-3"
            height="1024"
            src="/img/Mewdeko.png"
            width="1024"
          >
            <span class="hidden xs:block self-center text-lg font-semibold whitespace-nowrap text-mewd-white">
            Mewdeko
          </span>
        </a>
      {/if}
    </div>

    <!-- Center section (nav items) - Hidden in minimal mode -->
    {#if !isMinimalMode}
        <div class="grow flex justify-center z-20">
        <div
                class="hidden md:flex flex-row p-2 space-x-2 lg:space-x-4 text-[15px] font-medium"
          role="navigation"
        >
          {#each computedItems as item, i}
            {#if item.wrapped}
              <div class="relative group" in:slide|local={{ duration: 300, delay: i * 50, axis: 'x' }}>
                <button
                        class="ripple-effect flex items-center space-x-2 px-2 py-1.5 lg:px-3 lg:py-1.5 rounded-md transition-all duration-200 ease-in-out min-h-[36px]"
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
                  {#each item.children || [] as child (child.href)}
                    <a
                      href={child.href || '#'}
                      data-sveltekit-preload-data="hover"
                      data-sveltekit-noscroll
                      class="ripple-effect flex items-center p-2 transition-colors hover:bg-(--hover-bg-color)"
                      style="--hover-bg-color: {$colorStore.primary}20; color: {$colorStore.text};"
                      role="menuitem"
                      onclick={(e) => {
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
                        <i class="fa-utility-duo fa-regular {child.icon} mr-2 text-base"
                           aria-hidden="true"
                           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
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
                class="ripple-effect flex items-center space-x-2 px-2 py-1.5 lg:px-3 lg:py-1.5 rounded-md transition-all duration-200 ease-in-out min-h-[36px] hover:bg-(--hover-bg-color)"
                in:slide|local={{ duration: 300, delay: i * 50, axis: 'x' }}
                style:--hover-bg-color="{$colorStore.primary}20"
                style:background-color={current === item.href ? `${$colorStore.primary}30` : 'transparent'}
                onclick={(e) => {
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
                  <i class="fa-utility-duo fa-regular {item.icon} mr-2 text-base"
                     aria-hidden="true"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                {/if}
                <span>{item.title}</span>
              </a>
            {/if}
          {/each}
        </div>
      </div>
    {:else}
      <!-- Dashboard mode: centered logo with subpage name -->
        <div class="grow flex justify-center items-center relative">
        <!-- Dashboard Logo (perfectly centered on all screen sizes) -->
        <div class="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
          <a
            href="/"
            class="block transition-all duration-200 hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 rounded-lg"
            style:focus:ring-color={$colorStore.primary}
            title="Go to home page"
            aria-label="Return to home page"
          >
            <img
              alt="Mewdeko"
              class="h-7 w-7 md:h-10 md:w-10 object-contain"
              src="/img/Mewdeko.png"
            >
          </a>
        </div>

        <!-- Mini Music Player (positioned to the right of center, only on large screens) -->
        {#if showMiniPlayer}
            <div class="hidden xl:block absolute right-0 top-1/2 transform -translate-y-1/2"
                 in:fade={{ duration: 300, delay: 100 }}
                 out:fade={{ duration: 200 }}>
            <MiniMusicPlayer {musicStatus} isVisible={true} />
          </div>
        {/if}
      </div>
    {/if}

    <!-- Right section -->
        <div class="flex items-center gap-2 w-[140px] lg:w-[180px] xl:w-[200px] justify-end"
             class:md:w-[180px]={isDashboard}>
      {#if !currentUser}
        <a href="/api/discord/login"
           data-sveltekit-reload
           class="ripple-effect rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg backdrop-blur-xs border inline-block"
           style="background: linear-gradient(135deg, {$colorStore.primary}80, {$colorStore.secondary}80);
                  color: {$colorStore.text};
                  border-color: {$colorStore.primary}50;
                  box-shadow: 0 2px 8px {$colorStore.primary}30;">
          Login
        </a>
      {:else}
        <!-- Desktop User & Instance Display -->
        <div class="hidden md:flex relative" use:clickOutside onclickoutside={() => closeDropdown()}>
          <button
                  class="ripple-effect flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-lg transition-all duration-200 ease-in-out backdrop-blur-xs border hover:scale-[1.02] shadow-lg hover:shadow-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   border-color: {$colorStore.primary}40;
                   box-shadow: 0 2px 8px {$colorStore.primary}15;"
                  onclick={toggleDropdown}
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
              class="w-8 h-8 rounded-full"
              style:background="{$colorStore.primary}20"
            >

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
                    class="absolute right-0 top-full mt-1 w-72 rounded-xl p-3 flex flex-col space-y-3 shadow-2xl z-50 backdrop-blur-lg border"
              style="background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.9)), linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}25, {$colorStore.gradientEnd}20);
                    border-color: {$colorStore.primary}50;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);"
              role="menu"
              transition:slide|local={{ duration: 200 }}
            >
              <!-- Enhanced User Info -->
                <div class="p-3 rounded-lg mb-3 border backdrop-blur-xs"
                   style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}15);
                          border-color: {$colorStore.primary}40;">
                    <div class="flex items-center space-x-2">
                  <div class="relative">
                    <img
                      src={currentUser.avatar
                        ? (currentUser.avatar.startsWith("a_")
                          ? `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.gif`
                          : `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png`)
                        : `https://cdn.discordapp.com/embed/avatars/0.png`}
                      alt={currentUser.username}
                      class="w-10 h-10 rounded-lg border-2"
                      style="border-color: {$colorStore.primary}50;"
                    >
                    <!-- Online indicator -->
                      <div class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black"
                         style="background: #10b981;"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                      <div class="flex items-center space-x-1">
                          <h2 class="font-semibold text-base truncate"
                              style="color: {$colorStore.text};">{currentUser.username}</h2>
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
                      {#each visibleInstances as instance (instance.botId)}
                        <button
                                class="ripple-effect w-full text-left p-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ease-in-out hover:bg-opacity-30 border border-transparent"
                          style="color: {$colorStore.text};
                                 background: {$currentInstance?.botId === instance.botId ? `linear-gradient(135deg, ${$colorStore.primary}40, ${$colorStore.secondary}40)` : 'transparent'};
                                 border-color: {$currentInstance?.botId === instance.botId ? $colorStore.primary + '50' : 'transparent'};
                                 hover:background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);
                                 hover:border-color: {$colorStore.primary}40;"
                                onclick={() => handleInstanceSelect(instance)}
                          aria-pressed={$currentInstance?.botId === instance.botId}
                        >
                          <img
                            src={instance.botAvatar}
                            alt=""
                            class="w-5 h-5 rounded-full"
                          >
                          <div class="flex flex-col flex-1 min-w-0">
                            <span class="text-xs truncate">
                              {instance.botName}
                            </span>
                          </div>
                          {#if !instance.isActive}
                            <span class="px-1.5 py-0.5 rounded-sm text-xs bg-opacity-10"
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
                <div class="mb-3">
                <a
                  href="/me"
                  class="ripple-effect flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ease-in-out hover:scale-[1.02] border text-sm font-medium w-full group"
                  style="background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);
                         color: {$colorStore.text};
                         border-color: {$colorStore.primary}50;
                         box-shadow: 0 2px 8px {$colorStore.primary}15;"
                  role="menuitem"
                >
                    <div class="p-1.5 rounded transition-all group-hover:scale-110"
                       style="background: {$colorStore.primary}30;">
                        <i class="fa-solid fa-gear" style="color: {$colorStore.primary}; font-size: 14px;"></i>
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold">My Settings</div>
                    <div class="text-xs" style="color: {$colorStore.muted};">Profile, privacy & preferences</div>
                  </div>
                    <div class="text-base opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                        →
                    </div>
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
                    class="ripple-effect block w-full text-center px-3 py-2 rounded-lg transition-all duration-200 ease-in-out hover:scale-[1.02] border text-sm font-medium"
                    style="background: linear-gradient(135deg, {$colorStore.accent}15, {$colorStore.accent}20);
                           color: {$colorStore.text};
                           border-color: {$colorStore.accent}30;
                           box-shadow: 0 2px 8px {$colorStore.accent}10;"
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
            class="w-7 h-7 rounded-full"
            style:background="{$colorStore.primary}20"
          >
        </div>

        <!-- Mobile menu button - hide in dashboard -->
        {#if !isDashboard}
          <button
            aria-controls="mobile-menu"
            aria-expanded={menuOpen || sidebarOpen}
            aria-label="Toggle navigation menu"
            class="inline-flex items-center p-2 rounded-lg border-transparent transition-all duration-200 ease-in-out md:hidden min-h-[36px] min-w-[36px] hover:bg-(--hover-bg-color)"
            style:--hover-bg-color="{$colorStore.primary}20"
            style:border-color="{$colorStore.primary}30"
            onclick={toggleMenu}
          >
            <span class="sr-only">Toggle navigation menu</span>
              <div class="relative w-5 h-5 flex flex-col justify-center">
              <span
                      class="block w-5 h-0.5 rounded-sm transition-all duration-200 ease-in-out"
                class:rotate-45={menuOpen || sidebarOpen}
                      class:translate-y-1.5={menuOpen || sidebarOpen}
                style:background-color={$colorStore.text}
              ></span>
              <span
                      class="block w-5 h-0.5 rounded-sm mt-1 transition-all duration-200 ease-in-out"
                class:opacity-0={menuOpen || sidebarOpen}
                style:background-color={$colorStore.text}
              ></span>
              <span
                      class="block w-5 h-0.5 rounded-sm mt-1 transition-all duration-200 ease-in-out"
                class:-rotate-45={menuOpen || sidebarOpen}
                      class:-translate-y-1.5={menuOpen || sidebarOpen}
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
            class="fixed inset-0 backdrop-blur-sm z-40"
            style="background: rgba(0, 0, 0, 0.6);"
            onclick={closeMobileMenu}
      transition:fade={{ duration: 300, easing: cubicOut }}
      aria-hidden="true"
    ></div>

    <div
      class="fixed inset-y-0 right-0 w-72 z-50 flex flex-col overflow-hidden backdrop-blur-lg border-l shadow-2xl"
      style="background: linear-gradient(135deg, rgba(18, 24, 40, 0.98), rgba(18, 24, 40, 0.95)), linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}15);
             border-color: {$colorStore.primary}30;
             box-shadow: -8px 0 32px {$colorStore.primary}20, inset 0 0 0 1px {$colorStore.primary}10;"
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
                style="background: {$colorStore.primary}20;"
              >
              <div>
                <div class="font-medium" style="color: {$colorStore.text};">{currentUser.username}</div>
                {#if currentUser.discriminator !== "0"}
                  <div style="color: {$colorStore.muted};" class="text-sm">#{currentUser.discriminator}</div>
                {/if}
              </div>
            </div>
          {/if}
          <button
                  class="p-2 rounded-lg transition-all hover:bg-white/10"
                  style="color: {$colorStore.text};"
                  onclick={closeMobileMenu}
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
                        class="ripple-effect w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all duration-200 ease-in-out border hover:bg-white/5"
                        style="color: {$colorStore.text};
                         background: {$currentInstance?.botId === instance.botId ? `${$colorStore.primary}20` : 'transparent'};
                         border-color: {$currentInstance?.botId === instance.botId ? $colorStore.primary + '30' : 'transparent'};"
                        onclick={() => {
                    handleInstanceSelect(instance);
                    closeMobileMenu();
                  }}
                  aria-pressed={$currentInstance?.botId === instance.botId}
                >
                  <img
                    src={instance.botAvatar}
                    alt=""
                    class="w-6 h-6 rounded-full"
                    style="background: {$colorStore.primary}15;"
                  >
                  <div class="flex flex-col flex-1 min-w-0">
                    <span class="text-sm truncate">
                      {instance.botName}
                    </span>
                  </div>
                  {#if !instance.isActive}
                    <span class="px-1.5 py-0.5 rounded-sm text-xs bg-opacity-10"
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
            {#each computedItems as item (item.href || item.title)}
              {#if item.wrapped}
                <div class="space-y-1">
                  <div class="text-sm font-medium px-2" style="color: {$colorStore.muted};">{item.title}</div>
                  {#each item.children || [] as child (child.href)}
                    <a
                      href={child.href || '#'}
                      class="ripple-effect flex items-center px-4 py-3 rounded-lg transition-all duration-200 ease-in-out min-h-[44px] border hover:bg-white/5"
                      style="color: {$colorStore.text};
                             background: {current === child.href ? `${$colorStore.primary}20` : 'transparent'};
                             border-color: {current === child.href ? $colorStore.primary + '30' : 'transparent'};"
                      onclick={closeMobileMenu}
                    >
                      {#if child.icon}
                        <i class="fa-utility-duo fa-regular {child.icon} mr-3 text-xl"
                           aria-hidden="true"
                           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                      {/if}
                      <span class="font-medium">{child.title}</span>
                    </a>
                  {/each}
                </div>
              {:else}
                <a
                  href={item.href || '#'}
                  class="ripple-effect flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out min-h-[44px] border hover:bg-white/5"
                  style="color: {$colorStore.text};
                         background: {current === item.href ? `${$colorStore.primary}20` : 'transparent'};
                         border-color: {current === item.href ? $colorStore.primary + '30' : 'transparent'};"
                  onclick={closeMobileMenu}
                >
                  {#if item.icon}
                    <i class="fa-utility-duo fa-regular {item.icon} text-xl"
                       aria-hidden="true"
                       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
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
            class="ripple-effect block w-full text-center px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:scale-[1.02] border font-medium"
            style="background: linear-gradient(135deg, {$colorStore.accent}15, {$colorStore.accent}20);
                   color: {$colorStore.text};
                   border-color: {$colorStore.accent}30;
                   box-shadow: 0 2px 8px {$colorStore.accent}10;"
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  {/if}
</nav>

<style lang="postcss">
    @reference '../../../app.css'; /* Ripple effect styles */
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

    /* Ensure dropdowns appear above other content */
    .group:hover .absolute {
        z-index: 50;
    }
</style>