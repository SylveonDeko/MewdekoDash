<!-- lib/nav/UnifiedNav.svelte -->
<script lang="ts">
  import { page } from "$app/stores";
  import { slide, fade, scale } from "svelte/transition";
  import { clickOutside } from "$lib/clickOutside";
  import { browser } from "$app/environment";
  import { onDestroy, onMount } from "svelte";
  import type { DiscordGuild } from "$lib/types/discordGuild.ts";
  import type { BotInstance } from "$lib/types/models.ts";
  import { extractColors, type ColorPalette } from "$lib/colorUtils";
  import { api } from "$lib/api.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { get } from "svelte/store";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { logger } from "$lib/logger.ts";
  import JSONbig from "json-bigint";

  // Props
  export let items: NavItem[] = [];
  export let data;

  let lastSelectedGuild: BigInt | null = null;
  let instances: BotInstance[] = [];
  let instancesLoading = true;
  let instancesError: string | null = null;
  $: shouldFetchGuilds = Boolean(browser && data?.user && $currentInstance);

  let colors: ColorPalette;
  let colorVars: string;

  // State
  let menuOpen = false;
  let sidebarOpen = false;
  let dropdownOpen = false;
  let isMobile = browser ? window.innerWidth < 768 : false;
  let menuButtonRef: HTMLButtonElement;
  let menuRef: HTMLDivElement;
  let adminGuilds: DiscordGuild[] = [];
  let isFetchingGuilds = false;
  let resizeTimer: number;

  interface ColorPalette {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    muted: string;
    gradientStart: string;
    gradientMid: string;
    gradientEnd: string;
  }

  const DEFAULT_PALETTE: ColorPalette = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    text: '#ffffff',
    muted: '#9ca3af',
    gradientStart: '#3b82f6',
    gradientMid: '#8b5cf6',
    gradientEnd: '#ec4899'
  };

  // Computed
  $: isDashboard = $page.url.pathname.startsWith("/dashboard");
  $: current = $page.url.pathname;
  $: computedItems = isDashboard ? buildDashboardItems() : buildMainItems(items);

  $: if (currentGuild) {
    computedItems = isDashboard ? buildDashboardItems() : buildMainItems(items);
  }

  $: if (shouldFetchGuilds) {
    const fetchGuildsIfReady = async () => {
      try {
        console.log('Fetching guilds for user:', data.user.id, 'and instance:', $currentInstance.botId);
        const newGuilds = await api.getMutualGuilds(data.user.id);
        adminGuilds = [...newGuilds];
      } catch (e) {
        logger.error("Error fetching guilds:", e);
      }
    };

    fetchGuildsIfReady();
  }

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
    children?: { title?: string; href: string }[];
  };

  // Dashboard items with icons
  const dashboardItems = [
    { title: "Dashboard", href: "/dashboard", icon: "📊" },
    { title: "AFK", href: "/dashboard/afk", icon: "💤" },
    { title: "Music", href: "/dashboard/music", icon: "🎵" },
    { title: "Triggers", href: "/dashboard/chat-triggers", icon: "💬" },
    { title: "Suggestions", href: "/dashboard/suggestions", icon: "💡" },
    { title: "Permissions", href: "/dashboard/permissions", icon: "🔒" },
    { title: "Giveaways", href: "/dashboard/giveaways", icon: "🎁" },
    { title: "MultiGreets", href: "/dashboard/multigreets", icon: "👋" }
  ];

  function buildDashboardItems(): ProcessedItem[] {
    if (!currentGuild) {
      return [{ title: "Dashboard", wrapped: false, href: "/dashboard", icon: "📊" }];
    }
    return dashboardItems.map(item => ({
      title: item.title,
      wrapped: false,
      href: item.href,
      icon: item.icon
    }));
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

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

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

  function debouncedResize() {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(handleResize, 250);
  }

  function closeDropdown() {
    dropdownOpen = false;
  }

  let guildSearch = "";
  $: filteredGuilds = adminGuilds.filter(guild =>
    guild.name.toLowerCase().includes(guildSearch.toLowerCase())
  );

  let showQuickSwitcher = false;

  function openQuickSwitcher() {
    showQuickSwitcher = true;
  }

  async function selectGuild(guild: DiscordGuild) {
    if (get(currentGuild) === guild) return;

    // Set the guild in store
    currentGuild.set(guild);

    // Store in localStorage with proper serialization
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

    // Only close dropdown after successful store/save
    closeDropdown();
  }

  async function handleInstanceSelect(instance: BotInstance) {
    currentInstance.set(instance);
    if (browser) {
      localStorage.setItem("selectedInstance", JSON.stringify(instance));
    }
    closeDropdown();
  }

  function handleResize() {
    isMobile = window.innerWidth < 768;
  }

  function getGuildIconUrl(guild: DiscordGuild) {
    if (guild.icon) {
      const extension = guild.icon.startsWith("a_") ? "gif" : "png";
      return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${extension}`;
    }
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }

  async function updateColors() {
    try {
      if (typeof window === 'undefined') {
        colors = DEFAULT_PALETTE;
        return;
      }

      let imageUrl: string;
      if (data?.user?.avatar) {
        imageUrl = data.user.avatar.startsWith("a_")
          ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.gif`
          : `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`;
      } else {
        imageUrl = new URL('/img/Mewdeko.png', window.location.origin).href;
      }

      colors = await extractColors(imageUrl);
    } catch (err) {
      logger.error('Failed to extract colors:', err);
      colors = DEFAULT_PALETTE;
    }

    colorVars = `
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-accent: ${colors.accent};
    --color-text: ${colors.text};
    --color-muted: ${colors.muted};
  `;
  }

  onMount(async () => {
    if (browser) {
      window.addEventListener("keydown", (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          openQuickSwitcher();
        }
      });

      try {
        const response = await api.getBotInstances();
        instances = response;

        // If there's only one instance, select it
        if (instances.length === 1) {
          await handleInstanceSelect(instances[0]);
        }

        // Check for stored instance
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

    const stored = localStorage.getItem("lastSelectedGuild");
    if (stored) {
      const storedGuild = JSON.parse(stored) as DiscordGuild;
      lastSelectedGuild = storedGuild.id;
      const guild = data.guilds.find(g => g.id === lastSelectedGuild);
      if (guild) {
        await selectGuild(guild);
      }
    }

    const storedInstance = localStorage.getItem("selectedInstance");
    if (storedInstance) {
      currentInstance.set(JSON.parse(storedInstance));
    }

    checkMobile();
    await updateColors();
    window.addEventListener("resize", debouncedResize);
    handleResize();
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimer);
      window.removeEventListener("keydown", (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          openQuickSwitcher();
        }
      });
    }
  });

  $: if (data.user) {
    updateColors()
  }
</script>

<nav
  aria-label="Main navigation"
  class="py-4 relative"
  style="{colorVars} background: linear-gradient(135deg,
    {colors?.gradientStart}10,
    {colors?.gradientMid}15,
    {colors?.gradientEnd}10
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
              <button class="flex items-center space-x-2 text-white p-2 rounded-md hover:bg-gray-700">
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
                class="absolute left-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {#each item.children || [] as child}
                  <a
                    href={child.href}
                    class="block text-white p-2 hover:bg-gray-700"
                    class:bg-yellow-700={current === child.href}
                  >
                    {child.title}
                  </a>
                {/each}
              </div>
            </div>
          {:else}
            <a
              href={item.href}
              class="flex items-center space-x-2 text-white p-2 rounded-md hover:bg-gray-700"
              class:bg-yellow-700={current === item.href}
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
                  class="rounded-md bg-teal-800 p-2 text-white hover:bg-teal-700 transition-colors">
            Login
          </button>
        </form>
      {:else}
        <!-- Desktop User & Guild Display -->
        <div class="hidden md:flex relative" use:clickOutside on:clickoutside={closeDropdown}>
          <button
            class="flex items-center gap-2 p-1 pl-2 pr-3 rounded-lg hover:bg-gray-700/50 transition-colors"
            on:click={toggleDropdown}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <!-- User Avatar -->
            <img
              src={data.user.avatar.startsWith("a_")
                ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.gif`
                : `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`}
              alt={data.user.username}
              class="w-10 h-10 rounded-full bg-gray-600"
            />

            <!-- Guild Display (if in dashboard and guild selected) -->
            {#if isDashboard}
              {#if $currentGuild}
                <div class="flex items-center gap-2 max-w-[150px]">
                  <img
                    src={getGuildIconUrl($currentGuild)}
                    alt=""
                    class="w-8 h-8 rounded-full"
                    in:scale|local={{ duration: 300, start: 0.5 }}
                  />
                  <span class="text-white font-medium truncate">
                    {$currentGuild.name}
                  </span>
                </div>
              {:else}
                <div class="flex items-center gap-2 text-gray-300 hover:text-white">
                  <div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
                    </svg>
                  </div>
                  <span class="font-medium">Select Server</span>
                </div>
              {/if}
            {/if}
          </button>

          <!-- Desktop Dropdown -->
          {#if dropdownOpen}
            <div
              class="absolute right-0 mt-2 w-72 bg-gray-900 rounded-md p-4 flex flex-col space-y-4 shadow-lg z-50"
              role="menu"
              transition:slide|local={{ duration: 200 }}
            >
              <!-- User Info -->
              <div class="flex items-center space-x-3">
                <img
                  src={data.user.avatar.startsWith("a_")
                    ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.gif`
                    : `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`}
                  alt={data.user.username}
                  class="w-10 h-10 rounded-full"
                />
                <div>
                  <div class="flex items-center space-x-2">
                    <h2 class="font-bold text-white">{data.user.username}</h2>
                    {#if data.user.discriminator !== "0"}
                      <span class="text-gray-400">#{data.user.discriminator}</span>
                    {/if}
                  </div>
                </div>
              </div>

              {#if isDashboard}
                <!-- Instance Selection -->
                <div class="py-2 border-t border-gray-700">
                  <div class="text-sm font-medium text-gray-400 mb-2">Bot Instances</div>
                  <div class="max-h-48 overflow-y-auto">
                    {#if instancesLoading}
                      <div class="text-sm text-gray-400 px-2 py-1">Loading instances...</div>
                    {:else if instancesError}
                      <div class="text-sm text-red-400 px-2 py-1">{instancesError}</div>
                    {:else if instances.length === 0}
                      <div class="text-sm text-gray-400 px-2 py-1">No instances found</div>
                    {:else}
                      {#each instances as instance}
                        <button
                          class="w-full text-left p-2 hover:bg-gray-800 rounded-md flex items-center space-x-2 transition-all"
                          class:bg-gray-800={$currentInstance?.botId === instance.botId}
                          on:click={() => handleInstanceSelect(instance)}
                        >
                          <img
                            src={instance.botAvatar}
                            alt=""
                            class="w-6 h-6 rounded-full"
                          />
                          <div class="flex flex-col flex-1 min-w-0">
                            <span class="text-white text-sm truncate">
                              {instance.botName}
                            </span>
                          </div>
                          {#if !instance.isActive}
                            <span class="px-1.5 py-0.5 rounded text-xs bg-red-500/10 text-red-500">
                              Offline
                            </span>
                          {/if}
                        </button>
                      {/each}
                    {/if}
                  </div>
                </div>

                <!-- Server Selection in dropdown -->
                <div class="py-2 border-t border-gray-700">
                  <div class="text-sm font-medium text-gray-400 mb-2">Your Servers</div>
                  <button
                    class="text-sm text-gray-400 hover:text-white transition-colors px-2 py-1"
                    on:click={openQuickSwitcher}
                  >
                    Quick Switch (⌘K)
                  </button>
                  <div class="max-h-48 overflow-y-auto">
                    {#if isFetchingGuilds}
                      <div class="text-sm text-gray-400 px-2 py-1">Loading servers...</div>
                    {:else if adminGuilds.length === 0}
                      <div class="text-sm text-gray-400 px-2 py-1">No servers found</div>
                    {:else}
                      {#each adminGuilds as guild, i}
                        <button
                          class="w-full text-left p-2 hover:bg-gray-800 rounded-md flex items-center space-x-2 transition-all"
                          class:bg-gray-800={$currentGuild === guild}
                          on:click={() => selectGuild(guild)}
                          in:slide|local={{ duration: 200, delay: i * 50 }}
                        >
                          <img
                            src={getGuildIconUrl(guild)}
                            alt=""
                            class="w-6 h-6 rounded-full"
                          />
                          <span class="text-white text-sm truncate">
                          {guild.name}
                        </span>
                        </button>
                      {/each}
                    {/if}
                  </div>
                </div>
              {/if}

              <!-- Logout -->
              <div class="pt-2 border-t border-gray-700">
                <form
                  action="/api/discord/logout"
                  method="GET"
                  class="w-full"
                >
                  <button
                    type="submit"
                    class="block w-full text-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
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
            src={data.user.avatar.startsWith("a_")
              ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.gif`
              : `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`}
            alt={data.user.username}
            class="w-8 h-8 rounded-full bg-gray-600"
          />
        </div>

        <!-- Mobile menu button -->
        <button
          aria-controls="mobile-menu"
          aria-expanded={menuOpen || sidebarOpen}
          class="inline-flex items-center p-2 rounded-lg border border-transparent hover:bg-gray-700/50 transition-colors md:hidden"
          on:click={toggleMenu}
        >
          <span class="sr-only">Toggle navigation menu</span>
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
    ></div>

    <div
      class="fixed inset-y-0 right-0 w-72 bg-gray-900 z-50 flex flex-col overflow-hidden"
      class:translate-x-0={menuOpen || sidebarOpen}
      class:translate-x-full={!(menuOpen || sidebarOpen)}
      transition:slide={{ duration: 300, axis: 'x' }}
    >
      <!-- Mobile Header -->
      <div class="p-4 border-b border-gray-800 flex-shrink-0">
        <div class="flex justify-between items-center">
          {#if data?.user}
            <div class="flex items-center space-x-3">
              <img
                src={data.user.avatar?.startsWith("a_")
                ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.gif`
                : `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`}
                alt={data.user.username}
                class="w-10 h-10 rounded-full"
              />
              <div>
                <div class="text-white font-medium">{data.user.username}</div>
                {#if data.user.discriminator !== "0"}
                  <div class="text-gray-400 text-sm">#{data.user.discriminator}</div>
                {/if}
              </div>
            </div>
          {/if}
          <button
            class="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
            on:click={closeMobileMenu}
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Content -->
      <div class="flex-1 overflow-y-auto">
        {#if isDashboard}
          <!-- Instance Selection for Dashboard -->
          <div class="p-4 border-b border-gray-800">
            <div class="text-sm font-medium text-gray-400 mb-2">Bot Instances</div>
            <div class="space-y-2">
              {#if instancesLoading}
                <div class="text-sm text-gray-400">Loading instances...</div>
              {:else if instancesError}
                <div class="text-sm text-red-400">{instancesError}</div>
              {:else if instances.length === 0}
                <div class="text-sm text-gray-400">No instances found</div>
              {:else}
                {#each instances as instance}
                  <button
                    class="w-full text-left p-2 hover:bg-gray-800 rounded-md flex items-center space-x-2 transition-all"
                    class:bg-gray-800={$currentInstance?.botId === instance.botId}
                    on:click={() => handleInstanceSelect(instance)}
                  >
                    <img
                      src={instance.botAvatar}
                      alt=""
                      class="w-6 h-6 rounded-full"
                    />
                    <div class="flex flex-col flex-1 min-w-0">
                    <span class="text-white text-sm truncate">
                      {instance.botName}
                    </span>
                    </div>
                    {#if !instance.isActive}
                    <span class="px-1.5 py-0.5 rounded text-xs bg-red-500/10 text-red-500">
                      Offline
                    </span>
                    {/if}
                  </button>
                {/each}
              {/if}
            </div>
          </div>

          <!-- Server Selection for Dashboard -->
          <div class="p-4 border-b border-gray-800">
            <div class="text-sm font-medium text-gray-400 mb-2">Your Servers</div>
            <button
              class="text-sm text-gray-400 hover:text-white transition-colors mb-2"
              on:click={() => {
              openQuickSwitcher();
              closeMobileMenu();
            }}
            >
              Quick Switch (⌘K)
            </button>
            <div class="space-y-2">
              {#if isFetchingGuilds}
                <div class="text-sm text-gray-400">Loading servers...</div>
              {:else if adminGuilds.length === 0}
                <div class="text-sm text-gray-400">No servers found</div>
              {:else}
                {#each adminGuilds as guild}
                  <button
                    class="w-full text-left p-2 hover:bg-gray-800 rounded-md flex items-center space-x-2 transition-all"
                    class:bg-gray-800={$currentGuild?.id === guild.id}
                    on:click={() => {
                    selectGuild(guild);
                    closeMobileMenu();
                  }}
                  >
                    <img
                      src={getGuildIconUrl(guild)}
                      alt=""
                      class="w-6 h-6 rounded-full"
                    />
                    <span class="text-white text-sm truncate">
                    {guild.name}
                  </span>
                  </button>
                {/each}
              {/if}
            </div>
          </div>
        {/if}

        <!-- Navigation Items -->
        <nav class="p-4 space-y-1">
          {#each computedItems as item}
            {#if item.wrapped}
              <div class="space-y-1">
                <div class="text-sm font-medium text-gray-400 px-2">{item.title}</div>
                {#each item.children || [] as child}
                  <a
                    href={child.href}
                    class="block px-2 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    class:bg-gray-800={current === child.href}
                    class:text-white={current === child.href}
                    on:click={closeMobileMenu}
                  >
                    {child.title}
                  </a>
                {/each}
              </div>
            {:else}
              <a
                href={item.href}
                class="flex items-center gap-3 px-2 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                class:bg-gray-800={current === item.href}
                class:text-white={current === item.href}
                style="background: {current === item.href ? colors?.primary + '20' : 'transparent'}"
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
      </div>

      <!-- Mobile Footer -->
      <div class="p-4 border-t border-gray-800 flex-shrink-0">
        <form
          action="/api/discord/logout"
          method="GET"
          class="w-full"
        >
          <button
            type="submit"
            class="block w-full text-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  {/if}

  <!-- Quick Switcher -->
  {#if showQuickSwitcher}
    <div
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      transition:fade
      on:click|self={() => showQuickSwitcher = false}
    >
      <div
        class="bg-gray-900 rounded-lg p-4 w-full max-w-md shadow-xl"
        transition:scale
      >
        <div class="mb-4">
          <input
            type="text"
            placeholder="Search servers..."
            class="w-full bg-gray-800 text-white rounded px-4 py-2"
            bind:value={guildSearch}
          />
        </div>
        <div class="max-h-[50vh] overflow-y-auto">
          {#if isFetchingGuilds}
            <div class="text-center p-4 text-gray-400">Loading servers...</div>
          {:else if filteredGuilds.length === 0}
            <div class="text-center p-4 text-gray-400">
              {guildSearch ? 'No servers found' : 'No servers available'}
            </div>
          {:else}
            {#each filteredGuilds as guild}
              <button
                class="w-full text-left p-2 hover:bg-gray-800 rounded flex items-center gap-3"
                on:click={() => {
                selectGuild(guild);
                showQuickSwitcher = false;
              }}
              >
                <img
                  src={getGuildIconUrl(guild)}
                  alt=""
                  class="w-8 h-8 rounded-full"
                />
                <span class="text-white">{guild.name}</span>
              </button>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  {/if}
</nav>

<style lang="postcss">
    :global(*::-webkit-scrollbar) {
        @apply w-2;
    }

    :global(*::-webkit-scrollbar-track) {
        @apply bg-gray-700 rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb) {
        @apply bg-gray-600 rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb:hover) {
        @apply bg-gray-500;
    }

    /* Ensure dropdowns appear above other content */
    .group:hover .absolute {
        z-index: 50;
    }

    @keyframes guildSelect {
        0% {
            transform: scale(0.95);
            opacity: 0;
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }

    .guild-select-animation {
        animation: guildSelect 0.3s ease-out forwards;
    }
</style>