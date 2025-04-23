<!-- lib/nav/UnifiedNav.svelte -->
<script lang="ts">
  import { page } from "$app/stores";
  import { fade, slide } from "svelte/transition";
  import { clickOutside } from "$lib/clickOutside.ts";
  import { browser } from "$app/environment";
  import { onDestroy, onMount } from "svelte";
  import type { DiscordGuild } from "$lib/types/discordGuild.ts";
  import type { BotInstance } from "$lib/types/models.ts";
  import { type ColorPalette, extractColors } from "$lib/colorUtils.ts";
  import { api } from "$lib/api.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { derived, get, writable } from "svelte/store";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { userAdminGuilds } from "$lib/stores/adminGuildsStore.ts";
  import { logger } from "$lib/logger.ts";

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

  const DEFAULT_PALETTE: ColorPalette = {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    accent: "#ec4899",
    text: "#ffffff",
    muted: "#9ca3af",
    gradientStart: "#3b82f6",
    gradientMid: "#8b5cf6",
    gradientEnd: "#ec4899"
  };

  // Props
  export let items: NavItem[] = [];
  export let data;

  // Stores
  const isOwnerStore = writable(false);
  const colorsStore = writable<ColorPalette>(DEFAULT_PALETTE);

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
  let colorVars: string;

  // Computed
  $: isDashboard = $page.url.pathname.startsWith("/dashboard");
  $: current = $page.url.pathname;

  // Derived store for computed items
  const computedItemsStore = derived(
    [page, isOwnerStore],
    ([$page, $isOwner]) => {
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
          { title: "MultiGreets", href: "/dashboard/multigreets", icon: "👋" }
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
    if (!get(currentInstance)) return;

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
    }
    closeDropdown();
  }

  async function updateColors() {
    try {
      if (typeof window === "undefined") {
        colorsStore.set(DEFAULT_PALETTE);
        return;
      }

      if (browser && data?.user?.id) {
        const cachedColors = localStorage.getItem(`colors_${data.user.id}`);
        if (cachedColors) {
          const parsedColors = JSON.parse(cachedColors);
          if (parsedColors.timestamp && Date.now() - parsedColors.timestamp < 86400000) {
            colorsStore.set(parsedColors.palette);
            updateColorVars(parsedColors.palette);
            return;
          }
        }
      }

      let imageUrl: string;
      if (data?.user?.avatar) {
        imageUrl = data.user.avatar.startsWith("a_")
          ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.gif`
          : `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`;
      } else {
        imageUrl = new URL("/img/Mewdeko.png", window.location.origin).href;
      }

      const newColors = await extractColors(imageUrl);
      colorsStore.set(newColors);
      updateColorVars(newColors);

      if (browser && data?.user?.id) {
        localStorage.setItem(`colors_${data.user.id}`, JSON.stringify({
          palette: newColors,
          timestamp: Date.now()
        }));
      }
    } catch (err) {
      logger.error("Failed to extract colors:", err);
      colorsStore.set(DEFAULT_PALETTE);
      updateColorVars(DEFAULT_PALETTE);
    }
  }

  function updateColorVars(colors: ColorPalette) {
    colorVars = `
      --color-primary: ${colors.primary};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
      --color-text: ${colors.text};
      --color-muted: ${colors.muted};
    `;
  }

  async function initializeInstances() {
    instancesLoading = true;
    instancesError = null;

    try {
      const response = await api.getBotInstances();
      instances = response;

      if (instances.length === 1) {
        await handleInstanceSelect(instances[0]);
      }

      const storedInstance = localStorage.getItem("selectedInstance");
      if (storedInstance) {
        const instance = instances.find(
          i => i.botId === JSON.parse(storedInstance).botId
        );
        if (instance) {
          currentInstance.set(instance);
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
    const stored = localStorage.getItem("lastSelectedGuild");
    if (stored) {
      try {
        const storedGuild = JSON.parse(stored) as DiscordGuild;
        lastSelectedGuild = storedGuild.id;
        const guild = adminGuilds.find(g => g.id === lastSelectedGuild);
        if (guild) {
          await selectGuild(guild);
        }
      } catch (err) {
        logger.error("Error restoring last guild:", err);
      }
    }
  }

  onMount(async () => {
    if (browser) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("resize", debouncedResize);

      if (data?.user) {
        await checkOwnership();
      }

      await initializeInstances();

      const unsubscribe = currentInstance.subscribe(value => {
        if (value) {
          fetchGuildsIfReady();
        }
      });

      if (get(currentInstance)) {
        await fetchGuildsIfReady();
        await restoreLastGuild();
      }

      checkMobile();
      await updateColors();

      return () => {
        unsubscribe();
      };
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener("resize", debouncedResize);
      window.removeEventListener("keydown", handleKeyDown);
    }
  });

  $: if (data.user && browser) {
    updateColors();
  }
</script>

<nav
  aria-label="Main navigation"
  class="py-4 relative"
  style="{colorVars} background: linear-gradient(135deg,
    {$colorsStore?.gradientStart}10,
    {$colorsStore?.gradientMid}15,
    {$colorsStore?.gradientEnd}10
  );"
>
  <div class="sm:container flex items-center mx-auto px-4">
    <!-- Left section with fixed width -->
    <div class="w-[200px] flex-shrink-0">
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
        class="hidden md:flex flex-row p-4 space-x-4 text-[16px] font-medium"
        role="navigation"
      >
        {#each computedItems as item}
          {#if item.wrapped}
            <div class="relative group">
              <button
                class="flex items-center space-x-2 text-white p-2 rounded-md hover:bg-opacity-20 transition-colors"
                style="hover:background-color: {$colorsStore.primary}20; color: {$colorsStore.text};"
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
                class="absolute left-0 mt-2 w-48 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                style="background: linear-gradient(135deg, {$colorsStore.gradientStart}90, {$colorsStore.gradientMid}90);
                      border: 1px solid {$colorsStore.primary}30;"
                role="menu"
              >
                {#each item.children || [] as child}
                  <a
                    href={child.href}
                    class="block p-2 hover:bg-opacity-20 transition-colors"
                    style="color: {$colorsStore.text}; hover:background-color: {$colorsStore.primary}20;"
                    class:bg-opacity-30={current === child.href}
                    style:background-color={current === child.href ? `${$colorsStore.primary}30` : 'transparent'}
                    role="menuitem"
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
              class="flex items-center space-x-2 p-2 rounded-md hover:bg-opacity-20 transition-colors"
              style="color: {$colorsStore.text}; hover:background-color: {$colorsStore.primary}20;"
              class:bg-opacity-30={current === item.href}
              style:background-color={current === item.href ? `${$colorsStore.primary}30` : 'transparent'}
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
                  class="rounded-md p-2 transition-colors"
                  style="background-color: {$colorsStore.primary}; color: {$colorsStore.text}; hover:background-color: {$colorsStore.secondary};">
            Login
          </button>
        </form>
      {:else}
        <!-- Desktop User & Instance Display -->
        <div class="hidden md:flex relative" use:clickOutside on:clickoutside={closeDropdown}>
          <button
            class="flex items-center gap-2 p-1 pl-2 pr-3 rounded-lg hover:bg-opacity-20 transition-colors"
            style="hover:background-color: {$colorsStore.primary}20;"
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
              style="background: {$colorsStore.primary}20;"
            />

            <!-- Username and dropdown icon -->
            <div class="flex flex-col">
              <span class="text-sm font-medium" style="color: {$colorsStore.text}">
                {data.user.username}
              </span>
            </div>

            <svg
              class="h-5 w-5 transition-transform"
              class:rotate-180={dropdownOpen}
              style="color: {$colorsStore.muted};"
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
              class="absolute right-0 mt-2 w-72 rounded-md p-4 flex flex-col space-y-4 shadow-lg z-50 backdrop-blur-sm"
              style="background: linear-gradient(135deg, {$colorsStore.gradientStart}90, {$colorsStore.gradientMid}90);
                    border: 1px solid {$colorsStore.primary}30;"
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
                    <h2 class="font-bold" style="color: {$colorsStore.text};">{data.user.username}</h2>
                    {#if data.user.discriminator !== "0"}
                      <span style="color: {$colorsStore.muted};">#{data.user.discriminator}</span>
                    {/if}
                  </div>
                </div>
              </div>

              <!-- Instance Selection -->
              <div class="py-2 border-t border-opacity-30" style="border-color: {$colorsStore.primary};">
                <div class="text-sm font-medium mb-2" style="color: {$colorsStore.muted};">Bot Instances</div>
                <div class="max-h-48 overflow-y-auto">
                  {#if instancesLoading}
                    <div class="text-sm px-2 py-1 flex items-center" style="color: {$colorsStore.muted};">
                      <div class="animate-spin mr-2 h-4 w-4 border-2 rounded-full"
                           style="border-color: {$colorsStore.primary}30; border-top-color: {$colorsStore.primary};"></div>
                      Loading instances...
                    </div>
                  {:else if instancesError}
                    <div class="text-sm px-2 py-1" style="color: {$colorsStore.accent};">{instancesError}</div>
                  {:else if instances.length === 0}
                    <div class="text-sm px-2 py-1" style="color: {$colorsStore.muted};">No instances found</div>
                  {:else}
                    {#each instances as instance}
                      <button
                        class="w-full text-left p-2 rounded-md flex items-center space-x-2 transition-all hover:bg-opacity-20"
                        style="color: {$colorsStore.text};
                               hover:background-color: {$colorsStore.primary}20;
                               background-color: {$currentInstance?.botId === instance.botId ? $colorsStore.primary + '30' : 'transparent'};"
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
                                style="color: {$colorsStore.accent}; background-color: {$colorsStore.accent}10;">
                            Offline
                          </span>
                        {/if}
                      </button>
                    {/each}
                  {/if}
                </div>
              </div>

              <!-- Logout -->
              <div class="pt-2 border-t border-opacity-30" style="border-color: {$colorsStore.primary};">
                <form
                  action="/api/discord/logout"
                  method="GET"
                  class="w-full"
                >
                  <button
                    type="submit"
                    class="block w-full text-center px-4 py-2 rounded-md transition-colors"
                    style="background-color: {$colorsStore.accent}; color: {$colorsStore.text}; hover:opacity: 0.9;"
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
            style="background: {$colorsStore.primary}20;"
          />
        </div>

        <!-- Mobile menu button -->
        <button
          aria-controls="mobile-menu"
          aria-expanded={menuOpen || sidebarOpen}
          aria-label="Toggle navigation menu"
          class="inline-flex items-center p-2 rounded-lg border border-transparent hover:bg-opacity-20 transition-colors md:hidden"
          style="hover:background-color: {$colorsStore.primary}20; border-color: {$colorsStore.primary}30;"
          on:click={toggleMenu}
        >
          <span class="sr-only">Toggle navigation menu</span>
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style="color: {$colorsStore.text};"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      {/if}
    </div>
  </div>

  <!-- Mobile menu -->
  {#if (menuOpen || sidebarOpen) && isMobile}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
      on:click={closeMobileMenu}
      transition:fade={{ duration: 200 }}
      aria-hidden="true"
    ></div>

    <div
      class="fixed inset-y-0 right-0 w-72 z-50 flex flex-col overflow-hidden transition-transform duration-300 backdrop-blur-md"
      style="background: linear-gradient(135deg, {$colorsStore.gradientStart}90, {$colorsStore.gradientMid}90);
             border-left: 1px solid {$colorsStore.primary}30;"
      class:translate-x-0={menuOpen || sidebarOpen}
      class:translate-x-full={!(menuOpen || sidebarOpen)}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-menu-title"
    >
      <!-- Mobile Header -->
      <div class="p-4 border-b border-opacity-30" style="border-color: {$colorsStore.primary};">
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
                <div class="font-medium" style="color: {$colorsStore.text};">{data.user.username}</div>
                {#if data.user.discriminator !== "0"}
                  <div style="color: {$colorsStore.muted};" class="text-sm">#{data.user.discriminator}</div>
                {/if}
              </div>
            </div>
          {/if}
          <button
            class="p-2 rounded-lg hover:bg-opacity-20 transition-colors"
            style="color: {$colorsStore.muted}; hover:background-color: {$colorsStore.primary}20;"
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
        <div class="p-4 border-b border-opacity-30" style="border-color: {$colorsStore.primary};">
          <div class="text-sm font-medium mb-2" style="color: {$colorsStore.muted};">Bot Instances</div>
          <div class="space-y-2">
            {#if instancesLoading}
              <div class="text-sm flex items-center" style="color: {$colorsStore.muted};">
                <div class="animate-spin mr-2 h-4 w-4 border-2 rounded-full"
                     style="border-color: {$colorsStore.primary}30; border-top-color: {$colorsStore.primary};"></div>
                Loading instances...
              </div>
            {:else if instancesError}
              <div class="text-sm" style="color: {$colorsStore.accent};">{instancesError}</div>
            {:else if instances.length === 0}
              <div class="text-sm" style="color: {$colorsStore.muted};">No instances found</div>
            {:else}
              {#each instances as instance}
                <button
                  class="w-full text-left p-2 rounded-md flex items-center space-x-2 transition-all hover:bg-opacity-20 font-extrabold"
                  style="color: {$colorsStore.text};
                         hover:background-color: {$colorsStore.primary}20;
                         background-color: {$currentInstance?.botId === instance.botId ? $colorsStore.primary + '30' : 'transparent'};"
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
                          style="color: {$colorsStore.accent}; background-color: {$colorsStore.accent}10;">
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
                  <div class="text-sm font-medium px-2" style="color: {$colorsStore.muted};">{item.title}</div>
                  {#each item.children || [] as child}
                    <a
                      href={child.href}
                      class="block px-2 py-2 rounded-lg hover:bg-opacity-20 transition-colors backdrop-blur-md"
                      style="color: {$colorsStore.text};
                    hover:background-color: {$colorsStore.primary}20;
                    background-color: {current === child.href ? $colorsStore.primary + '30' : 'transparent'};"
                      on:click={closeMobileMenu}
                    >
                      {#if child.icon}<span class="mr-2" aria-hidden="true">{child.icon}</span>{/if}
                      {child.title}
                    </a>
                  {/each}
                </div>
              {:else}
                <a
                  href={item.href}
                  class="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-opacity-20 transition-colors backdrop-blur-md"
                  style="color: {$colorsStore.text};
                hover:background-color: {$colorsStore.primary}20;
                background-color: {current === item.href ? $colorsStore.primary + '30' : 'transparent'};"
                  on:click={closeMobileMenu}
                >
                  {#if item.icon}
                    <span class="text-lg" aria-hidden="true">{item.icon}</span>
                  {/if}
                  <span>{item.title}</span>
                </a>
              {/if}
            {/each}
          </nav>
        {/if}
      </div>

      <!-- Mobile Footer -->
      <div class="p-4 border-t border-opacity-30" style="border-color: {$colorsStore.primary};">
        <form
          action="/api/discord/logout"
          method="GET"
          class="w-full"
        >
          <button
            type="submit"
            class="block w-full text-center px-4 py-2 rounded-lg transition-colors"
            style="background-color: {$colorsStore.accent}; color: {$colorsStore.text}; hover:opacity: 0.9;"
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