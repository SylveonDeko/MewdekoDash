<!-- lib/nav/UnifiedNav.svelte -->
<script lang="ts">
  import { page } from "$app/stores";
  import { fade, slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { clickOutside } from "$lib/clickOutside.ts";
  import { browser } from "$app/environment";
  import { onDestroy, onMount } from "svelte";
  import type { DiscordGuild } from "$lib/types/discordGuild.ts";
  import type { BotInstance } from "$lib/types/models.ts";
  import { api } from "$lib/api.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { derived, get, writable } from "svelte/store";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { userAdminGuilds } from "$lib/stores/adminGuildsStore.ts";
  import { logger } from "$lib/logger.ts";
  import { goto } from "$app/navigation";
  import { colorStore } from "$lib/stores/colorStore.ts";

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
  export let items: NavItem[] = [];
  export let data;

  // Stores
  const isOwnerStore = writable(false);

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

  // Computed
  $: isDashboard = $page.url.pathname.startsWith("/dashboard");
  $: current = $page.url.pathname;

  // Derived store for computed items
  const computedItemsStore = derived(
    [page, currentGuild, isOwnerStore],
    ([$page, $currentGuild, $isOwner]) => {
      const isDashboard = $page.url.pathname.startsWith("/dashboard");
      return isDashboard ? buildDashboardItems($isOwner) : buildMainItems(items);
    }
  );
  $: computedItems = $computedItemsStore;

  // ====== Functions ======
  function debounce(fn: Function, ms: number) {
    let timer: number;
    return (...args: any[]) => {
      if (browser) {
        clearTimeout(timer);
        timer = window.setTimeout(() => fn(...args), ms);
      }
    };
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

  // Dashboard items with icons
  function getDashboardItems(isOwner: boolean = false) {
    const items = [
      {
        category: "Core",
        items: [
          { title: "Dashboard", href: "/dashboard", icon: "📊" },
          { title: "Settings", href: "/dashboard/settings", icon: "⚙️" }
        ]
      },
      {
        category: "Community",
        items: [
          { title: "AFK", href: "/dashboard/afk", icon: "💤" },
          { title: "XP", href: "/dashboard/xp", icon: "⭐" },
          { title: "Suggestions", href: "/dashboard/suggestions", icon: "💡" },
          { title: "MultiGreets", href: "/dashboard/multigreets", icon: "👋" },
          { title: "Invites", href: "/dashboard/invites", icon: "👥" },
          { title: "Role Greets", href: "/dashboard/rolegreets", icon: "🏷️" },
          { title: "Role States", href: "/dashboard/rolestates", icon: "🔄" }
        ]
      },
      {
        category: "Content",
        items: [
          { title: "Music", href: "/dashboard/music", icon: "🎵" },
          { title: "Triggers", href: "/dashboard/chat-triggers", icon: "💬" },
          { title: "Embed Builder", href: "/dashboard/embedbuilder", icon: "🔗" }
        ]
      },
      {
        category: "Management",
        items: [
          { title: "Permissions", href: "/dashboard/permissions", icon: "🔒" },
          { title: "Giveaways", href: "/dashboard/giveaways", icon: "🎁" },
          { title: "Chat Saver", href: "/dashboard/chatsaver", icon: "💾" }
        ]
      }
    ];

    if (isOwner) {
      items.find(item => item.category === "Management")?.items.push(
        { title: "Performance", href: "/dashboard/performance", icon: "📈" }
      );
    }

    return items;
  }

  function buildDashboardItems(isOwner: boolean = false): ProcessedItem[] {
    if (!get(currentGuild)) {
      return [{ title: "Dashboard", wrapped: false, href: "/dashboard", icon: "📊" }];
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
    if (!data?.user?.id) return;

    try {
      const isOwner = await api.isOwner(BigInt(data.user.id));
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
        localStorage.setItem("lastSelectedGuild", JSON.stringify({
          id: guild.id.toString(),
          name: guild.name,
          icon: guild.icon,
          owner: guild.owner,
          permissions: guild.permissions,
          features: guild.features
        }));
      } catch (err) {
        logger.error("Failed to save guild to localStorage:", err);
      }
    }
  }

  async function fetchGuildsIfReady() {
    if (!get(currentInstance)) {
      logger.debug("No current instance, skipping guild fetch");
      return;
    }

    isFetchingGuilds = true;
    guildFetchError = null;
    try {
      logger.info("Fetching guilds for user:", data.user.id, "and instance:", get(currentInstance).botId);
      const newGuilds = await api.getMutualGuilds(data.user.id);
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
    currentInstance.set(instance);
    if (browser) {
      localStorage.setItem("selectedInstance", JSON.stringify(instance));

      // After setting an instance, fetch the guilds
      await fetchGuildsIfReady();
    }
    closeDropdown();
  }


  async function initializeInstances() {
    instancesLoading = true;
    instancesError = null;

    try {
      const response = await api.getBotInstances();
      instances = response;

      // Check for stored instance
      if (browser) {
        const storedInstance = localStorage.getItem("selectedInstance");
        if (storedInstance) {
          try {
            const parsedInstance = JSON.parse(storedInstance);
            const instance = instances.find(i => i.botId === parsedInstance.botId);
            if (instance) {
              logger.debug("Restoring instance:", instance.botName);
              currentInstance.set(instance);
              // Wait a moment to ensure instance is set before fetching guilds
              setTimeout(fetchGuildsIfReady, 100);
            }
          } catch (err) {
            logger.error("Error parsing stored instance:", err);
          }
        } else if (instances.length === 1) {
          // Auto-select if there's only one instance
          logger.debug("Auto-selecting the only instance:", instances[0].botName);
          currentInstance.set(instances[0]);
          // Wait a moment to ensure instance is set before fetching guilds
          setTimeout(fetchGuildsIfReady, 100);
        }
      }
    } catch (err) {
      instancesError = "Failed to load instances";
      logger.error("Error loading instances:", err);
    } finally {
      instancesLoading = false;
    }
  }

  async function restoreLastGuild() {
    if (!browser) return;

    const stored = localStorage.getItem("lastSelectedGuild");
    if (stored) {
      try {
        const storedGuild = JSON.parse(stored);
        lastSelectedGuild = BigInt(storedGuild.id);

        // Only attempt to select if we have guilds loaded
        if (adminGuilds.length > 0) {
          const guild = adminGuilds.find(g => g.id === lastSelectedGuild);
          if (guild) {
            logger.debug("Restoring last guild:", guild.name);
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
      if (data?.user) {
        await checkOwnership();
      }

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

  onMount(async () => {
    if (browser) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("resize", debouncedResize);

      checkMobile();
      await initialize();

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
  class="py-4 relative z-[100]"
  style="background: linear-gradient(135deg,
    {$colorStore?.gradientStart}10,
    {$colorStore?.gradientMid}15,
    {$colorStore?.gradientEnd}10
  );"
>
  <div class="sm:container flex items-center mx-auto px-4 lg:px-6">
    <!-- Left section with fixed width -->
    <div class="w-[160px] lg:w-[200px] flex-shrink-0">
      <a
        class="flex items-center py-[0.3rem] justify-start"
        href="/"
        title="mewdeko-banner"
      >
        <img
          alt="Mewdeko's Avatar"
          class="h-12 mr-3"
          height="48"
          src="/img/Mewdeko.png"
          width="48"
        />
        <span class="hidden xs:block self-center text-xl font-semibold whitespace-nowrap text-mewd-white">
          Mewdeko
        </span>
      </a>
    </div>

    <!-- Center section (nav items) -->
    <div class="flex-grow flex justify-center">
      <div
        class="hidden md:flex flex-row p-4 space-x-2 lg:space-x-4 text-[16px] font-medium"
        role="navigation"
      >
        {#each computedItems as item}
          {#if item.wrapped}
            <div class="relative group">
              <button
                class="ripple-effect flex items-center space-x-2 px-3 py-2 lg:px-4 lg:py-2 rounded-md hover:bg-opacity-20 transition-all duration-200 ease-in-out min-h-[40px]"
                style="color: {$colorStore.text}; hover:background-color: {$colorStore.primary}20;"
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
                class="absolute left-0 mt-2 w-48 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 backdrop-blur-md"
                style="background: linear-gradient(135deg, {$colorStore.gradientStart}95, {$colorStore.gradientEnd}95);
                      border: 1px solid {$colorStore.primary}30;"
                role="menu"
              >
                {#each item.children || [] as child}
                  <a
                    href={child.href}
                    data-sveltekit-preload-data="hover"
                    data-sveltekit-noscroll
                    class="ripple-effect block p-2 hover:bg-opacity-20 transition-colors"
                    style="color: {$colorStore.text}; hover:background-color: {$colorStore.primary}20;"
                    class:bg-opacity-30={current === child.href}
                    style:background-color={current === child.href ? `${$colorStore.primary}30` : 'transparent'}
                    role="menuitem"
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
          logger.error("Error storing guild:", err);
        }
      }
    }
    goto(child.href);
  }}
                  >
                    {#if child.icon}<span aria-hidden="true" class="mr-2">{child.icon}</span>{/if}
                    {child.title}
                  </a>
                {/each}
              </div>
            </div>
          {:else}
            <a
              href={item.href}
              data-sveltekit-preload-data="hover"
              data-sveltekit-noscroll
              class="ripple-effect flex items-center space-x-2 px-3 py-2 lg:px-4 lg:py-2 rounded-md hover:bg-opacity-20 transition-all duration-200 ease-in-out min-h-[40px]"
              style="color: {$colorStore.text}; hover:background-color: {$colorStore.primary}20;"
              class:bg-opacity-30={current === item.href}
              style:background-color={current === item.href ? `${$colorStore.primary}30` : 'transparent'}
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
          logger.error("Error storing guild:", err);
        }
      }
    }
    goto(item.href);
  }}
            >
              {#if item.icon}
                <span aria-hidden="true">{item.icon}</span>
              {/if}
              <span>{item.title}</span>
            </a>
          {/if}
        {/each}
      </div>
    </div>

    <!-- Right section -->
    <div class="flex items-center gap-2 w-[200px] justify-end">
      {#if !data?.user}
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
        <div class="hidden md:flex relative" use:clickOutside on:clickoutside={closeDropdown}>
          <button
            class="ripple-effect flex items-center gap-2 p-2 pl-3 pr-4 rounded-lg hover:bg-opacity-30 transition-all duration-200 ease-in-out backdrop-blur-sm border"
            style="background: linear-gradient(135deg, {$colorStore.gradientStart}40, {$colorStore.gradientMid}40);
                   border-color: {$colorStore.primary}30;
                   hover:background: linear-gradient(135deg, {$colorStore.primary}30, {$colorStore.secondary}30);
                   hover:border-color: {$colorStore.primary}50;"
            on:click={toggleDropdown}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label="Toggle user menu"
          >
            <!-- User Avatar -->
            <img
              src={data.user.avatar
                ? (data.user.avatar.startsWith("a_")
                  ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.gif`
                  : `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`)
                : `https://cdn.discordapp.com/embed/avatars/0.png`}
              alt={data.user.username}
              class="w-10 h-10 rounded-full"
              style="background: {$colorStore.primary}20;"
            />

            <!-- Username and instance display -->
            <div class="flex flex-col items-start">
              <span class="text-sm font-medium" style="color: {$colorStore.text}">
                {data.user.username}
              </span>
              {#if $currentInstance}
                <div class="flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full"
                        style="background-color: {$currentInstance.isActive ? '#10B981' : $colorStore.accent};"></span>
                  <span class="text-xs" style="color: {$colorStore.muted}">
                    {$currentInstance.botName}
                  </span>
                </div>
              {:else}
                <span class="text-xs" style="color: {$colorStore.muted}">
                  Select Instance
                </span>
              {/if}
            </div>

            <svg
              class="h-5 w-5 transition-transform ml-1"
              class:rotate-180={dropdownOpen}
              style="color: {$colorStore.muted};"
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
            <div
              class="absolute right-0 mt-2 w-72 rounded-lg p-4 flex flex-col space-y-4 shadow-2xl z-50 backdrop-blur-lg border"
              style="background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.8)), linear-gradient(135deg, {$colorStore.gradientStart}25, {$colorStore.gradientMid}30, {$colorStore.gradientEnd}25);
                    border-color: {$colorStore.primary}50;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px {$colorStore.primary}20;"
              role="menu"
              transition:slide|local={{ duration: 200 }}
            >
              <!-- User Info -->
              <div class="flex items-center space-x-3">
                <img
                  src={data.user.avatar
                    ? (data.user.avatar.startsWith("a_")
                      ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.gif`
                      : `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`)
                    : `https://cdn.discordapp.com/embed/avatars/0.png`}
                  alt={data.user.username}
                  class="w-10 h-10 rounded-full"
                />
                <div>
                  <div class="flex items-center space-x-2">
                    <h2 class="font-bold" style="color: {$colorStore.text};">{data.user.username}</h2>
                    {#if data.user.discriminator !== "0"}
                      <span style="color: {$colorStore.muted};">#{data.user.discriminator}</span>
                    {/if}
                  </div>
                </div>
              </div>

              <!-- Instance Selection -->
              <div class="py-2 border-t border-opacity-30" style="border-color: {$colorStore.primary};">
                <div class="text-sm font-medium mb-2" style="color: {$colorStore.muted};">Bot Instances</div>
                <div class="max-h-48 overflow-y-auto">
                  {#if instancesLoading}
                    <div class="text-sm px-2 py-1 flex items-center" style="color: {$colorStore.muted};">
                      <div class="animate-spin mr-2 h-4 w-4 border-2 rounded-full"
                           style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
                      Loading instances...
                    </div>
                  {:else if instancesError}
                    <div class="text-sm px-2 py-1" style="color: {$colorStore.accent};">{instancesError}</div>
                  {:else if instances.length === 0}
                    <div class="text-sm px-2 py-1" style="color: {$colorStore.muted};">No instances found</div>
                  {:else}
                    {#each instances as instance}
                      <button
                        class="ripple-effect w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all duration-200 ease-in-out hover:bg-opacity-30 border border-transparent"
                        style="color: {$colorStore.text};
                               background: {$currentInstance?.botId === instance.botId ? `linear-gradient(135deg, ${$colorStore.primary}40, ${$colorStore.secondary}40)` : 'transparent'};
                               border-color: {$currentInstance?.botId === instance.botId ? $colorStore.primary + '50' : 'transparent'};
                               hover:background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);
                               hover:border-color: {$colorStore.primary}40;"
                        on:click={() => handleInstanceSelect(instance)}
                        aria-selected={$currentInstance?.botId === instance.botId}
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
            src={data.user.avatar
              ? (data.user.avatar.startsWith("a_")
                ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.gif`
                : `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`)
              : `https://cdn.discordapp.com/embed/avatars/0.png`}
            alt={data.user.username}
            class="w-8 h-8 rounded-full"
            style="background: {$colorStore.primary}20;"
          />
        </div>

        <!-- Mobile menu button -->
        <button
          aria-controls="mobile-menu"
          aria-expanded={menuOpen || sidebarOpen}
          aria-label="Toggle navigation menu"
          class="inline-flex items-center p-3 rounded-lg border border-transparent hover:bg-opacity-20 transition-all duration-200 ease-in-out md:hidden min-h-[44px] min-w-[44px]"
          style="hover:background-color: {$colorStore.primary}20; border-color: {$colorStore.primary}30;"
          on:click={toggleMenu}
        >
          <span class="sr-only">Toggle navigation menu</span>
          <div class="relative w-6 h-6 flex flex-col justify-center">
            <span
              class="block w-6 h-0.5 rounded transition-all duration-200 ease-in-out"
              class:rotate-45={menuOpen || sidebarOpen}
              class:translate-y-2={menuOpen || sidebarOpen}
              style="background-color: {$colorStore.text};"
            ></span>
            <span
              class="block w-6 h-0.5 rounded mt-1.5 transition-all duration-200 ease-in-out"
              class:opacity-0={menuOpen || sidebarOpen}
              style="background-color: {$colorStore.text};"
            ></span>
            <span
              class="block w-6 h-0.5 rounded mt-1.5 transition-all duration-200 ease-in-out"
              class:-rotate-45={menuOpen || sidebarOpen}
              class:-translate-y-2={menuOpen || sidebarOpen}
              style="background-color: {$colorStore.text};"
            ></span>
          </div>
        </button>
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
          {#if data?.user}
            <div class="flex items-center space-x-3">
              <img
                src={data.user.avatar
                  ? (data.user.avatar.startsWith("a_")
                    ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.gif`
                    : `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`)
                  : `https://cdn.discordapp.com/embed/avatars/0.png`}
                alt={data.user.username}
                class="w-10 h-10 rounded-full"
              />
              <div>
                <div class="font-medium" style="color: {$colorStore.text};">{data.user.username}</div>
                {#if data.user.discriminator !== "0"}
                  <div style="color: {$colorStore.muted};" class="text-sm">#{data.user.discriminator}</div>
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
        <!-- Instance Selection (shown on both mobile dashboard and regular nav) -->
        <div class="p-4 border-b border-opacity-30" style="border-color: {$colorStore.primary};">
          <div class="text-sm font-medium mb-2" style="color: {$colorStore.muted};">Bot Instances</div>
          <div class="space-y-2">
            {#if instancesLoading}
              <div class="text-sm flex items-center" style="color: {$colorStore.muted};">
                <div class="animate-spin mr-2 h-4 w-4 border-2 rounded-full"
                     style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
                Loading instances...
              </div>
            {:else if instancesError}
              <div class="text-sm" style="color: {$colorStore.accent};">{instancesError}</div>
            {:else if instances.length === 0}
              <div class="text-sm" style="color: {$colorStore.muted};">No instances found</div>
            {:else}
              {#each instances as instance}
                <button
                  class="ripple-effect w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all duration-200 ease-in-out hover:bg-opacity-30 border border-transparent"
                  style="color: {$colorStore.text};
                         background: {$currentInstance?.botId === instance.botId ? `linear-gradient(135deg, ${$colorStore.primary}40, ${$colorStore.secondary}40)` : 'transparent'};
                         border-color: {$currentInstance?.botId === instance.botId ? $colorStore.primary + '50' : 'transparent'};
                         hover:background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);
                         hover:border-color: {$colorStore.primary}40;"
                  on:click={() => {
                    handleInstanceSelect(instance);
                    closeMobileMenu();
                  }}
                  aria-selected={$currentInstance?.botId === instance.botId}
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
                      href={child.href}
                      class="ripple-effect block px-4 py-3 rounded-lg hover:bg-opacity-30 transition-all duration-200 ease-in-out min-h-[44px] flex items-center border border-transparent"
                      style="color: {$colorStore.text};
                    background: {current === child.href ? `linear-gradient(135deg, ${$colorStore.primary}40, ${$colorStore.secondary}40)` : 'transparent'};
                    border-color: {current === child.href ? $colorStore.primary + '50' : 'transparent'};
                    hover:background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);
                    hover:border-color: {$colorStore.primary}40;"
                      on:click={closeMobileMenu}
                    >
                      {#if child.icon}<span class="mr-3 text-lg" aria-hidden="true">{child.icon}</span>{/if}
                      <span class="font-medium">{child.title}</span>
                    </a>
                  {/each}
                </div>
              {:else}
                <a
                  href={item.href}
                  class="ripple-effect flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-30 transition-all duration-200 ease-in-out min-h-[44px] border border-transparent"
                  style="color: {$colorStore.text};
                background: {current === item.href ? `linear-gradient(135deg, ${$colorStore.primary}40, ${$colorStore.secondary}40)` : 'transparent'};
                border-color: {current === item.href ? $colorStore.primary + '50' : 'transparent'};
                hover:background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);
                hover:border-color: {$colorStore.primary}40;"
                  on:click={closeMobileMenu}
                >
                  {#if item.icon}
                    <span class="text-lg" aria-hidden="true">{item.icon}</span>
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