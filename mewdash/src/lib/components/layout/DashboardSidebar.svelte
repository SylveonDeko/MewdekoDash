<script lang="ts">
  import { page } from "$app/state";
  import { fade, slide } from "svelte/transition";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { allDashboardFeatures, categoryOrder, type NavigationItem } from "$lib/config/navigationItems";
  import { type BotInstance, clientApi, instanceManagementApi, ownershipApi } from "$lib/api/index";
  import { userStore } from "$lib/stores/userStore";
  import { switchingServer } from "$lib/stores/guildSwitchStore";
  import { userAdminGuilds } from "$lib/stores/adminGuildsStore";
  import { clickOutside } from "$lib/clickOutside";
  import { musicStore } from "$lib/stores/musicStore";
  import MiniMusicPlayer from "$lib/components/music/MiniMusicPlayer.svelte";

  interface Props {
    collapsed?: boolean;
    mobileOpen?: boolean;
  }

  let { collapsed = $bindable(false), mobileOpen = $bindable(false) }: Props = $props();
  let isOwner = $state(false);
  let collapsedCategories = $state<Record<string, boolean>>({});
  let searchTerm = $state("");
  let searchInputRef = $state<HTMLInputElement>();
  let hoveringItem = $state<string | null>(null);
  let tooltipPosition = $state<{ top: number } | null>(null);
  let isMobile = $state(browser ? window.innerWidth < 1024 : false);

  let showServerPicker = $state(false);
  let serverSearchTerm = $state("");
  let showInstancePicker = $state(false);
  let instances = $state<BotInstance[]>([]);
  let instancesLoading = $state(true);
  let instanceStates = $state<Record<string, { loading: boolean; hasMutualGuild: boolean; checked: boolean }>>({});

  let visibleInstances = $derived(instances.filter(inst => {
    const state = instanceStates[inst.botId.toString()];
    return state?.checked && state?.hasMutualGuild;
  }));
  let stillCheckingInstances = $derived(Object.values(instanceStates).some(s => s.loading));

  let currentPath = $derived(page.url.pathname);
  let isDashboardHome = $derived(currentPath === "/dashboard" || currentPath === "/dashboard/");
  let musicStatus = $derived($musicStore.status);
  let showMusicPlayer = $derived(musicStatus?.CurrentTrack && currentPath !== "/dashboard/music");
  let noGuild = $derived(!$currentGuild);
  let showUserMenu = $state(false);

  let userAvatarUrl = $derived.by(() => {
    const user = $userStore;
    if (!user?.avatar) return "https://cdn.discordapp.com/embed/avatars/0.png";
    const ext = user.avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}`;
  });

  let filteredFeatures = $derived.by(() => {
    // Dashboard Access is pinned above the categorized list alongside the Dashboard Home link,
    // not shown again inside its category.
    let features = allDashboardFeatures.filter(item => (!item.ownerOnly || isOwner) && item.href !== "/dashboard/access");
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      features = features.filter(f =>
        f.label.toLowerCase().includes(term) ||
        f.description?.toLowerCase().includes(term) ||
        f.category.toLowerCase().includes(term)
      );
    }
    return features;
  });

  let featuresByCategory = $derived.by(() => {
    const grouped: Record<string, NavigationItem[]> = {};
    for (const item of filteredFeatures) {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    }
    return grouped;
  });

  let filteredGuilds = $derived(
    ($userAdminGuilds || [])
      .filter(guild => guild.name.toLowerCase().includes(serverSearchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
  );

  function isActive(href: string): boolean {
    if (href === "/dashboard") {
      return isDashboardHome;
    }
    return currentPath === href || currentPath.startsWith(href + "/");
  }

  function toggleCategory(category: string) {
    collapsedCategories[category] = !collapsedCategories[category];
    if (browser) {
      localStorage.setItem("sidebar-collapsed-categories", JSON.stringify(collapsedCategories));
    }
  }

  function toggleSidebar() {
    collapsed = !collapsed;
    if (browser) {
      localStorage.setItem("sidebar-collapsed", collapsed.toString());
      window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: collapsed }));
    }
  }

  function toggleServerPicker() {
    showServerPicker = !showServerPicker;
    if (!showServerPicker) {
      serverSearchTerm = "";
    }
  }

  async function handleServerSelect(guild: any) {
    if ($switchingServer) return;

    showServerPicker = false;
    serverSearchTerm = "";

    switchingServer.set(true);

    if (browser) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

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
      } catch {}
    }

    setTimeout(() => {
      switchingServer.set(false);
    }, 600);
  }

  function handleSearchKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      searchTerm = "";
      searchInputRef?.blur();
    }
  }

  function closeMobile() {
    mobileOpen = false;
    if (browser) {
      document.body.style.overflow = "";
    }
  }

  // Close mobile sidebar on route change
  let prevPath = $state("");
  $effect(() => {
    if (currentPath !== prevPath) {
      prevPath = currentPath;
      if (mobileOpen) {
        closeMobile();
      }
    }
  });

  // Lock body scroll when mobile sidebar is open
  $effect(() => {
    if (browser) {
      document.body.style.overflow = mobileOpen ? "hidden" : "";
    }
  });

  function handleGlobalKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

    if ((event.ctrlKey || event.metaKey) && event.key === "b") {
      event.preventDefault();
      toggleSidebar();
    }

    if (event.key === "/" && !collapsed) {
      event.preventDefault();
      searchInputRef?.focus();
    }
  }

  function showTooltip(event: MouseEvent, label: string) {
    if (!collapsed) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    tooltipPosition = { top: rect.top + rect.height / 2 };
    hoveringItem = label;
  }

  function hideTooltip() {
    hoveringItem = null;
    tooltipPosition = null;
  }

  let serverIconUrl = $derived.by(() => {
    if ($currentGuild?.icon) {
      const ext = $currentGuild.icon.startsWith("a_") ? "gif" : "png";
      return `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${ext}?size=128`;
    }
    return null;
  });

  let bannerUrl = $derived.by(() => {
    const banner = $currentGuild?.banner;
    if (!banner) return null;
    if (banner.startsWith("https://cdn.discordapp.com")) return banner;
    if (/^[a-f0-9]{20,}$/i.test(banner) || banner.startsWith("a_")) {
      const ext = banner.startsWith("a_") ? "gif" : "png";
      return `https://cdn.discordapp.com/banners/${$currentGuild.id}/${banner}.${ext}?size=480`;
    }
    return null;
  });

  function guildIconUrl(guild: any): string {
    if (guild.icon) {
      const ext = guild.icon.startsWith("a_") ? "gif" : "png";
      return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}?size=64`;
    }
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }

  async function checkOwnership() {
    const userData = $userStore;
    if (!userData?.id) return;
    try {
      isOwner = await ownershipApi.isOwner(BigInt(userData.id));
    } catch {
      isOwner = false;
    }
  }

  async function checkInstanceMutualGuilds(instance: BotInstance) {
    const userData = $userStore;
    if (!userData?.id) return;
    const id = instance.botId.toString();
    instanceStates[id] = { loading: true, hasMutualGuild: false, checked: false };
    instanceStates = { ...instanceStates };
    try {
      const guilds = await clientApi.getMutualGuilds(userData.id, true, fetch, {
        "X-Instance-Url": `http://localhost:${instance.port}/botapi`
      });
      instanceStates[id] = { loading: false, hasMutualGuild: !!(guilds?.length), checked: true };
    } catch {
      instanceStates[id] = { loading: false, hasMutualGuild: false, checked: true };
    }
    instanceStates = { ...instanceStates };
  }

  async function loadInstances() {
    try {
      instancesLoading = true;
      const response = await instanceManagementApi.getBotInstances();
      instances = response || [];
      if (instances.length > 0) {
        await Promise.all(instances.map(checkInstanceMutualGuilds));
      }
    } catch {
      instances = [];
    } finally {
      instancesLoading = false;
    }
  }

  async function handleInstanceSelect(instance: BotInstance) {
    if ($currentInstance?.botId === instance.botId) {
      showInstancePicker = false;
      return;
    }
    currentGuild.set(null);
    if (browser) {
      if ($currentInstance) {
        localStorage.removeItem(`lastSelectedGuild_${$currentInstance.botId}`);
      }
      localStorage.removeItem("lastSelectedGuild");
    }
    currentInstance.set(instance);
    if (browser) {
      localStorage.setItem("selectedInstance", JSON.stringify(instance));
    }
    showInstancePicker = false;
  }

  onMount(() => {
    if (browser) {
      collapsed = localStorage.getItem("sidebar-collapsed") === "true";

      const savedCategories = localStorage.getItem("sidebar-collapsed-categories");
      if (savedCategories) {
        try {
          collapsedCategories = JSON.parse(savedCategories);
        } catch {
          collapsedCategories = {};
        }
      }

      window.addEventListener("keydown", handleGlobalKeydown);
      window.addEventListener("resize", () => { isMobile = window.innerWidth < 1024; });
    }

    checkOwnership();
    loadInstances();

    return () => {
      if (browser) {
        window.removeEventListener("keydown", handleGlobalKeydown);
      }
    };
  });

  $effect(() => {
    if ($userStore) {
      checkOwnership();
    }
  });
</script>

<aside
  class="flex flex-col shrink-0 fixed top-0 z-40 transition-all duration-300 ease-out h-dvh lg:left-0 lg:border-r max-lg:right-0 max-lg:border-l"
  class:max-lg:translate-x-0={mobileOpen}
  class:max-lg:translate-x-full={!mobileOpen}
  class:sidebar-switching={$switchingServer}
  style="width: {isMobile ? 'min(85vw, 320px)' : collapsed ? '68px' : '280px'};
         background: linear-gradient(180deg, {$colorStore.primary}15, {$colorStore.secondary}10, {$colorStore.accent}08);
         border-color: {$colorStore.primary}15;"
  aria-label="Dashboard sidebar navigation"
>
  <!-- Bot instance branding -->
  <div class="border-b shrink-0 flex items-center px-3 py-3"
       class:justify-center={collapsed}
       style="border-color: {$colorStore.primary}15;">
    <a href="/dashboard" class="flex items-center gap-3 overflow-hidden"
       class:justify-center={collapsed}>
      <img
        src="/img/Mewdeko.png"
        alt="Mewdeko"
        class="w-9 h-9 object-contain shrink-0 rounded-lg"
      >
      {#if !collapsed}
        <span class="text-lg font-semibold whitespace-nowrap" style="color: {$colorStore.text};"
              transition:fade={{ duration: 150 }}>
          Mewdeko
        </span>
      {/if}
    </a>
  </div>

  <!-- Mobile instance selector -->
  {#if visibleInstances.length > 1 || instancesLoading || stillCheckingInstances}
    <div class="lg:hidden border-b shrink-0 px-3 py-2" style="border-color: {$colorStore.primary}15;">
      <button
        class="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200"
        style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15; color: {$colorStore.text};"
        onclick={() => showInstancePicker = !showInstancePicker}
      >
        {#if $currentInstance}
          <img src={$currentInstance.botAvatar} alt="" class="w-7 h-7 rounded-full shrink-0">
          <span class="flex-1 text-sm font-medium truncate text-left">{$currentInstance.botName}</span>
          <span class="w-2 h-2 rounded-full shrink-0" style="background: {$currentInstance.isActive ? '#10B981' : $colorStore.accent};"></span>
        {:else}
          <i class="fa-solid fa-robot text-sm" style="color: {$colorStore.muted};" aria-hidden="true"></i>
          <span class="flex-1 text-sm text-left" style="color: {$colorStore.muted};">Select Instance</span>
        {/if}
        <i class="fa-solid fa-chevron-down text-xs transition-transform duration-200"
           style="color: {$colorStore.muted}; transform: rotate({showInstancePicker ? '180deg' : '0deg'});"
           aria-hidden="true"></i>
      </button>

      {#if showInstancePicker}
        <div class="mt-2 space-y-1" transition:slide={{ duration: 200, axis: 'y' }}>
          {#if instancesLoading || stillCheckingInstances}
            <div class="flex items-center gap-2 px-3 py-2 text-xs" style="color: {$colorStore.muted};">
              <div class="animate-spin h-3 w-3 border-2 rounded-full"
                   style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
              {instancesLoading ? 'Loading...' : 'Checking access...'}
            </div>
          {:else}
            {#each visibleInstances as instance (instance.botId)}
              <button
                class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left"
                style="background: {$currentInstance?.botId === instance.botId ? $colorStore.primary + '15' : 'transparent'};
                       color: {$colorStore.text};"
                onclick={() => handleInstanceSelect(instance)}
              >
                <img src={instance.botAvatar} alt="" class="w-6 h-6 rounded-full shrink-0">
                <span class="flex-1 text-sm truncate">{instance.botName}</span>
                {#if $currentInstance?.botId === instance.botId}
                  <div class="w-1.5 h-1.5 rounded-full" style="background: {$colorStore.primary};"></div>
                {/if}
              </button>
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  <div class="border-b shrink-0 relative"
       style="border-color: {$colorStore.primary}15;">
    {#key $currentGuild?.id}
      {#if $currentGuild}
        {#if bannerUrl && !collapsed}
          <div class="absolute inset-0 z-0 overflow-hidden rounded-b-lg"
               in:fade={{ duration: 400, delay: 150 }}
               out:fade={{ duration: 150 }}>
            <img src={bannerUrl} alt="" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70"></div>
          </div>
        {/if}

        <div class="relative z-10 p-3">
          <button
            class="flex items-center gap-3 rounded-xl p-2 transition-all duration-200 hover:scale-[1.02] min-w-0 w-full overflow-hidden text-left"
            class:justify-center={collapsed}
            style="background: {bannerUrl && !collapsed ? 'rgba(0,0,0,0.3)' : $colorStore.primary + '08'};
                   border: 1px solid {bannerUrl && !collapsed ? 'rgba(255,255,255,0.15)' : $colorStore.primary + '15'};
                   backdrop-filter: {bannerUrl && !collapsed ? 'blur(4px)' : 'none'};"
            onclick={toggleServerPicker}
            in:fade={{ duration: 300, delay: 200 }}
            out:fade={{ duration: 150 }}
          >
            <div class="w-9 h-9 rounded-xl overflow-hidden shrink-0 transition-all duration-200 ring-2 ring-opacity-30"
                 style="background: {$colorStore.primary}20; ring-color: {$colorStore.primary};">
              {#if serverIconUrl}
                <img src={serverIconUrl} alt="" class="w-full h-full object-cover" loading="lazy">
              {:else}
                <div class="w-full h-full flex items-center justify-center">
                  <i class="fa-solid fa-server" style="color: {$colorStore.primary};"></i>
                </div>
              {/if}
            </div>
            {#if !collapsed}
              <div class="min-w-0 flex-1" transition:fade={{ duration: 150 }}>
                <div class="text-base font-semibold truncate" style="color: {$colorStore.text};">
                  {$currentGuild.name}
                </div>
                <div class="flex items-center gap-1.5 text-xs" style="color: {$colorStore.muted};">
                  {#if $currentGuild.owner}
                    <span class="px-1.5 py-0.5 rounded-md text-xs font-medium"
                          style="background: {$colorStore.accent}25; color: {$colorStore.accent};">Owner</span>
                  {:else}
                    <span>Admin</span>
                  {/if}
                </div>
              </div>
              <i class="fa-solid fa-chevron-down text-xs shrink-0 transition-transform duration-200"
                 style="color: {$colorStore.muted}; transform: rotate({showServerPicker ? '180deg' : '0deg'});"
                 aria-hidden="true"></i>
            {/if}
          </button>

          {#if !collapsed}
            <div class="flex items-center gap-2 mt-2 px-1" transition:fade={{ duration: 150 }}>
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-[1.02] flex-1"
                style="background: {bannerUrl ? 'rgba(255,255,255,0.1)' : $colorStore.primary + '15'};
                       color: {$colorStore.primary};
                       border: 1px solid {bannerUrl ? 'rgba(255,255,255,0.1)' : $colorStore.primary + '20'};"
                onclick={() => window.open(`https://discord.com/channels/${$currentGuild?.id}`, '_blank')}
              >
                <i class="fa-solid fa-external-link text-[10px]" aria-hidden="true"></i>
                View Server
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <div class="p-3">
          <div class="flex items-center gap-3 p-2 min-w-0 w-full" class:justify-center={collapsed}>
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                 style="background: {$colorStore.primary}15;">
              <i class="fa-solid fa-server text-sm" style="color: {$colorStore.muted};"></i>
            </div>
            {#if !collapsed}
              <div class="min-w-0 flex-1" transition:fade={{ duration: 150 }}>
                <div class="text-sm font-medium" style="color: {$colorStore.muted};">
                  No server selected
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    {/key}

    {#if showServerPicker && !collapsed}
      <div
        class="absolute left-2 right-2 top-full mt-1 rounded-xl shadow-2xl border overflow-hidden z-50"
        style="border-color: {$colorStore.primary}30;
               background: linear-gradient(135deg, {$colorStore.background}f8, {$colorStore.background}f0);
               backdrop-filter: blur(12px);"
        transition:slide={{ duration: 200, axis: 'y' }}
        use:clickOutside
        onclickoutside={() => { showServerPicker = false; serverSearchTerm = ''; }}
      >
        <div class="p-2 border-b" style="border-color: {$colorStore.primary}15;">
          <input
            type="text"
            placeholder="Search servers..."
            bind:value={serverSearchTerm}
            onclick={(e) => e.stopPropagation()}
            class="w-full px-3 py-2 rounded-lg border text-xs"
            style="border-color: {$colorStore.primary}20;
                   color: {$colorStore.text};
                   background: {$colorStore.primary}08;"
          >
        </div>
        <div class="max-h-52 overflow-y-auto sidebar-scrollbar">
          {#each filteredGuilds as guild (guild.id)}
            <button
              class="w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left"
              style="background: {guild.id === $currentGuild?.id ? $colorStore.primary + '15' : 'transparent'}"
              onmouseenter={(e) => e.currentTarget.style.background = $colorStore.primary + '10'}
              onmouseleave={(e) => e.currentTarget.style.background = guild.id === $currentGuild?.id ? $colorStore.primary + '15' : 'transparent'}
              onclick={() => handleServerSelect(guild)}
            >
              <img
                src={guildIconUrl(guild)}
                alt=""
                class="w-8 h-8 rounded-lg object-cover"
              >
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate" style="color: {$colorStore.text};">
                  {guild.name}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted};">
                  {guild.owner ? 'Owner' : 'Admin'}
                </div>
              </div>
              {#if guild.id === $currentGuild?.id}
                <div class="w-2 h-2 rounded-full shrink-0" style="background: {$colorStore.primary};"></div>
              {/if}
            </button>
          {:else}
            <div class="p-4 text-center text-xs" style="color: {$colorStore.muted};">
              No servers found
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#if !collapsed}
    <div class="px-3 pt-3 pb-1 shrink-0" transition:fade={{ duration: 150 }}>
      <div class="relative">
        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs"
           style="color: {$colorStore.muted};" aria-hidden="true"></i>
        <input
          bind:this={searchInputRef}
          type="text"
          placeholder="Search features..."
          bind:value={searchTerm}
          onkeydown={handleSearchKeydown}
          class="w-full pl-8 pr-3 py-2 rounded-lg text-sm border transition-all duration-200"
          style="background: {$colorStore.primary}08;
                 border-color: {$colorStore.primary}15;
                 color: {$colorStore.text};"
        >
        {#if searchTerm}
          <button
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-all hover:scale-110"
            style="color: {$colorStore.muted};"
            onclick={() => { searchTerm = ""; }}
            aria-label="Clear search"
          >
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <nav class="flex-1 overflow-y-auto overflow-x-hidden py-2 sidebar-scrollbar" aria-label="Feature navigation">
    {#if !isDashboardHome}
      <div class="px-2 mb-1">
        <a
          href={noGuild ? undefined : "/dashboard"}
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
          class:hover:scale-[1.01]={!noGuild}
          class:opacity-40={noGuild}
          class:pointer-events-none={noGuild}
          style="background: transparent;
                 color: {$colorStore.muted};
                 border: 1px solid transparent;"
          onmouseenter={(e) => showTooltip(e, noGuild ? 'Select a server first' : 'Dashboard Home')}
          onmouseleave={hideTooltip}
        >
          <i class="fa-utility-duo fa-regular fa-home text-base shrink-0"
             style="--fa-primary-color: {$colorStore.muted};
                    --fa-secondary-color: {$colorStore.muted};
                    --fa-secondary-opacity: 0.4;
                    width: 20px; text-align: center;"
             aria-hidden="true"></i>
          {#if !collapsed}
            <span class="text-[15px] font-medium" transition:fade={{ duration: 150 }}>Dashboard</span>
          {/if}
        </a>

        <a
          href={noGuild ? undefined : "/dashboard/access"}
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
          class:hover:scale-[1.01]={!noGuild}
          class:opacity-40={noGuild}
          class:pointer-events-none={noGuild}
          style="background: {isActive('/dashboard/access') ? $colorStore.primary + '12' : 'transparent'};
                 color: {isActive('/dashboard/access') ? $colorStore.text : $colorStore.muted};
                 border: 1px solid {isActive('/dashboard/access') ? $colorStore.primary + '20' : 'transparent'};"
          aria-current={isActive('/dashboard/access') ? 'page' : undefined}
          aria-disabled={noGuild}
          onmouseenter={(e) => showTooltip(e, noGuild ? 'Select a server first' : 'Dashboard Access')}
          onmouseleave={hideTooltip}
        >
          <i class="fa-utility-duo fa-regular fa-key text-base shrink-0"
             style="--fa-primary-color: {isActive('/dashboard/access') ? $colorStore.primary : $colorStore.muted};
                    --fa-secondary-color: {isActive('/dashboard/access') ? $colorStore.secondary : $colorStore.muted};
                    --fa-secondary-opacity: 0.4;
                    width: 20px; text-align: center;"
             aria-hidden="true"></i>
          {#if !collapsed}
            <span class="text-[15px] font-medium" transition:fade={{ duration: 150 }}>Dashboard Access</span>
          {/if}
        </a>
      </div>

      <div class="mx-3 my-2 h-px" style="background: {$colorStore.primary}10;"></div>
    {/if}

    {#each categoryOrder as category}
      {#if featuresByCategory[category] && featuresByCategory[category].length > 0}
        <div class="mb-1">
          {#if !collapsed}
            <button
              class="w-full flex items-center gap-2 px-4 py-1.5 text-[13px] font-semibold uppercase tracking-wider transition-all duration-200 hover:opacity-100 group"
              style="color: {$colorStore.muted}; opacity: 0.7;"
              onclick={() => toggleCategory(category)}
              aria-expanded={!collapsedCategories[category]}
            >
              <span class="flex-1 text-left">{category}</span>
              <i class="fa-solid fa-chevron-down text-[10px] transition-transform duration-200 group-hover:opacity-100 opacity-50"
                 style="transform: rotate({collapsedCategories[category] ? '-90deg' : '0deg'});"
                 aria-hidden="true"></i>
              <span class="text-[10px] font-normal px-1.5 py-0.5 rounded-full opacity-50 group-hover:opacity-80"
                    style="background: {$colorStore.primary}10; color: {$colorStore.muted};">
                {featuresByCategory[category].length}
              </span>
            </button>
          {:else}
            <div class="flex items-center justify-center py-2">
              <div class="w-1.5 h-1.5 rounded-full" style="background: {$colorStore.primary}25;"></div>
            </div>
          {/if}

          {#if !collapsedCategories[category] || collapsed}
            <div class="px-2 space-y-0.5"
                 class:mt-0.5={!collapsed}>
              {#each featuresByCategory[category] as feature}
                {@const active = isActive(feature.href)}
                <a
                  href={noGuild ? undefined : feature.href}
                  class="flex items-center gap-3 px-3 py-2 max-lg:py-3 rounded-xl transition-all duration-200 group relative"
                  class:hover:scale-[1.01]={!noGuild}
                  class:opacity-40={noGuild}
                  class:pointer-events-none={noGuild}
                  style="background: {active ? $colorStore.primary + '12' : 'transparent'};
                         color: {active ? $colorStore.text : $colorStore.muted};
                         border: 1px solid {active ? $colorStore.primary + '20' : 'transparent'};"
                  aria-current={active ? 'page' : undefined}
                  aria-disabled={noGuild}
                  onmouseenter={(e) => showTooltip(e, noGuild ? 'Select a server first' : feature.label)}
                  onmouseleave={hideTooltip}
                >
                  {#if active}
                    <div class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                         style="background: linear-gradient(180deg, {$colorStore.primary}, {$colorStore.secondary});"
                         transition:fade={{ duration: 150 }}></div>
                  {/if}

                  <i class="{feature.icon} text-sm shrink-0 transition-all duration-200"
                     style="--fa-primary-color: {active ? $colorStore.primary : $colorStore.muted};
                            --fa-secondary-color: {active ? $colorStore.secondary : $colorStore.muted};
                            --fa-secondary-opacity: {active ? 0.5 : 0.3};
                            width: 20px; text-align: center;"
                     aria-hidden="true"></i>

                  {#if !collapsed}
                    <span class="text-[15px] max-lg:text-base truncate flex-1 transition-all duration-200"
                          style="color: {active ? $colorStore.text : $colorStore.muted};"
                          transition:fade={{ duration: 150 }}>
                      {feature.label}
                    </span>
                  {/if}
                </a>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    {/each}

    {#if searchTerm && filteredFeatures.length === 0}
      <div class="px-4 py-8 text-center">
        <i class="fa-solid fa-search text-2xl mb-2 block" style="color: {$colorStore.muted}; opacity: 0.3;"></i>
        <p class="text-xs" style="color: {$colorStore.muted};">No features match "{searchTerm}"</p>
      </div>
    {/if}
  </nav>

  {#if showMusicPlayer && !collapsed}
    <div class="px-2 py-2 border-t shrink-0" style="border-color: {$colorStore.primary}10;"
         transition:slide={{ duration: 200, axis: 'y' }}>
      <MiniMusicPlayer {musicStatus} isVisible={true} />
    </div>
  {/if}

  <!-- User profile & controls -->
  <div class="border-t shrink-0 relative" style="border-color: {$colorStore.primary}10;">
    <!-- Expandable menu (opens upward) -->
    {#if showUserMenu && !collapsed}
      <div class="border-b p-2 space-y-1" style="border-color: {$colorStore.primary}10;"
           transition:slide={{ duration: 200, axis: 'y' }}>
        <!-- Instance selector -->
        {#if visibleInstances.length > 1 || instancesLoading || stillCheckingInstances}
          <div class="px-2 py-1.5">
            <div class="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style="color: {$colorStore.muted}; opacity: 0.7;">Bot Instance</div>
            {#if instancesLoading || stillCheckingInstances}
              <div class="flex items-center gap-2 px-2 py-1 text-xs" style="color: {$colorStore.muted};">
                <div class="animate-spin h-3 w-3 border-2 rounded-full"
                     style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
                Loading...
              </div>
            {:else}
              {#each visibleInstances as instance (instance.botId)}
                <button
                  class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 text-left text-sm"
                  style="background: {$currentInstance?.botId === instance.botId ? $colorStore.primary + '15' : 'transparent'};
                         color: {$colorStore.text};"
                  onclick={() => handleInstanceSelect(instance)}
                >
                  <img src={instance.botAvatar} alt="" class="w-5 h-5 rounded-full shrink-0">
                  <span class="flex-1 truncate text-xs">{instance.botName}</span>
                  {#if $currentInstance?.botId === instance.botId}
                    <div class="w-1.5 h-1.5 rounded-full" style="background: {$colorStore.primary};"></div>
                  {/if}
                </button>
              {/each}
            {/if}
          </div>
          <div class="mx-2 h-px" style="background: {$colorStore.primary}10;"></div>
        {/if}

        <!-- My Settings -->
        <a
          href="/me"
          class="flex items-center gap-3 px-3 py-2 max-lg:py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01] group"
          style="color: {$colorStore.text};"
        >
          <i class="fa-solid fa-gear text-sm shrink-0" style="color: {$colorStore.primary}; width: 20px; text-align: center;" aria-hidden="true"></i>
          <span class="text-sm">My Settings</span>
        </a>

        <!-- Logout -->
        <form action="/api/discord/logout" method="GET" class="w-full">
          <button
            type="submit"
            class="w-full flex items-center gap-3 px-3 py-2 max-lg:py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01] group"
            style="color: {$colorStore.accent};"
          >
            <i class="fa-solid fa-right-from-bracket text-sm shrink-0" style="width: 20px; text-align: center;" aria-hidden="true"></i>
            <span class="text-sm">Logout</span>
          </button>
        </form>
      </div>
    {/if}

    <div class="p-2 flex items-center gap-1" class:justify-center={collapsed}>
      <!-- User profile button -->
      {#if $userStore}
        <button
          class="flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-200 hover:scale-[1.01] min-w-0"
          class:flex-1={!collapsed}
          class:justify-center={collapsed}
          style="background: {showUserMenu ? $colorStore.primary + '10' : 'transparent'}; color: {$colorStore.text};"
          onclick={() => { if (collapsed) { toggleSidebar(); } else { showUserMenu = !showUserMenu; } }}
          aria-label={collapsed ? "Expand sidebar" : "User menu"}
          aria-expanded={showUserMenu}
        >
          <img
            src={userAvatarUrl}
            alt={$userStore.username}
            class="w-9 h-9 rounded-full shrink-0"
          >
          {#if !collapsed}
            <div class="flex-1 min-w-0 text-left" transition:fade={{ duration: 150 }}>
              <div class="text-sm font-medium truncate">{$userStore.username}</div>
              {#if $currentInstance}
                <div class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full" style="background: {$currentInstance.isActive ? '#10B981' : $colorStore.accent};"></span>
                  <span class="text-[11px] truncate" style="color: {$colorStore.muted};">{$currentInstance.botName}</span>
                </div>
              {/if}
            </div>
            <i class="fa-solid fa-chevron-up text-xs shrink-0 transition-transform duration-200"
               style="color: {$colorStore.muted}; transform: rotate({showUserMenu ? '180deg' : '0deg'});"
               aria-hidden="true"></i>
          {/if}
        </button>
      {/if}

      {#if !collapsed}
        <!-- Collapse toggle (desktop only) -->
        <button
          class="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:scale-[1.05] shrink-0"
          style="color: {$colorStore.muted}; background: {$colorStore.primary}08;"
          onclick={toggleSidebar}
          title="Collapse (Ctrl+B)"
          aria-label="Collapse sidebar"
        >
          <i class="fa-solid fa-angles-left text-xs" aria-hidden="true"></i>
        </button>

        <!-- Close (mobile only) -->
        <button
          class="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:scale-[1.05] shrink-0"
          style="color: {$colorStore.muted}; background: {$colorStore.primary}08;"
          onclick={closeMobile}
          aria-label="Close sidebar"
        >
          <i class="fa-solid fa-xmark text-xs" aria-hidden="true"></i>
        </button>
      {/if}
    </div>
  </div>
</aside>

<!-- Mobile backdrop -->
{#if mobileOpen}
  <div
    class="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
    onclick={closeMobile}
    transition:fade={{ duration: 200 }}
    aria-hidden="true"
  ></div>
{/if}

{#if collapsed && hoveringItem && tooltipPosition}
  <div
    class="fixed z-50 pointer-events-none px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap"
    style="left: 76px;
           top: {tooltipPosition.top}px;
           transform: translateY(-50%);
           background: {$colorStore.gradientStart}f5;
           color: {$colorStore.text};
           border: 1px solid {$colorStore.primary}25;
           backdrop-filter: blur(8px);"
    transition:fade={{ duration: 100 }}
  >
    {hoveringItem}
  </div>
{/if}

<style>
  .sidebar-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
  }

  .sidebar-scrollbar:hover {
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
  }

  .sidebar-scrollbar::-webkit-scrollbar {
    width: 4px;
  }

  .sidebar-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .sidebar-scrollbar::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 4px;
  }

  .sidebar-scrollbar:hover::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
  }

  .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .sidebar-switching {
    opacity: 0.75;
    filter: blur(0.5px);
    transform: scale(0.99);
  }
</style>
