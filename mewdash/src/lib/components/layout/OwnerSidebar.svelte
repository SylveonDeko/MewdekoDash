<!-- lib/components/layout/OwnerSidebar.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import { fade, slide } from "svelte/transition";
  import { ownerFeatures } from "$lib/config/navigationItems";
  import { type BotInstance, instanceManagementApi } from "$lib/api/index";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { userStore } from "$lib/stores/userStore";
  import { safeLocalStorage } from "$lib/safeStorage";
  import { openSearch } from "$lib/stores/searchStore";

  /**
   * Navigation for the bot owner tools. A trimmed down version of the dashboard sidebar: no server
   * picker, since owner pages are fleet or host wide, and every instance is listed rather than only
   * the ones the viewer shares a guild with, because an owner may need to look at a bot they are
   * not a member of any server with.
   */
  interface Props {
    collapsed?: boolean;
    mobileOpen?: boolean;
  }

  let { collapsed = $bindable(false), mobileOpen = $bindable(false) }: Props = $props();

  let hoveringItem = $state<string | null>(null);
  let tooltipPosition = $state<{ top: number } | null>(null);
  let isMobile = $state(browser ? window.innerWidth < 1024 : false);
  let showInstancePicker = $state(false);
  let instances = $state<BotInstance[]>([]);
  let instancesLoading = $state(true);

  let currentPath = $derived(page.url.pathname);
  let isOwnerHome = $derived(currentPath === "/owner" || currentPath === "/owner/");
  let features = $derived([...ownerFeatures].sort((a, b) => a.label.localeCompare(b.label)));

  let userAvatarUrl = $derived.by(() => {
    const user = $userStore;
    if (!user?.avatar) return "https://cdn.discordapp.com/embed/avatars/0.png";
    const ext = user.avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}`;
  });

  function isActive(href: string): boolean {
    return currentPath === href || currentPath.startsWith(href + "/");
  }

  function toggleSidebar() {
    collapsed = !collapsed;
    if (browser) {
      safeLocalStorage.setItem("sidebar-collapsed", collapsed.toString());
      window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: collapsed }));
    }
  }

  function closeMobile() {
    mobileOpen = false;
    if (browser) {
      document.body.style.overflow = "";
    }
  }

  let prevPath = $state("");
  $effect(() => {
    if (currentPath !== prevPath) {
      prevPath = currentPath;
      if (mobileOpen) closeMobile();
    }
  });

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

  async function loadInstances() {
    try {
      instancesLoading = true;
      instances = (await instanceManagementApi.getBotInstances()) || [];
    } catch {
      instances = [];
    } finally {
      instancesLoading = false;
    }
  }

  /**
   * Switching bots also drops the selected guild, since the new bot may not be in it. The
   * dashboard reads the same keys, so going back there picks up the new selection.
   */
  function handleInstanceSelect(instance: BotInstance) {
    showInstancePicker = false;
    if ($currentInstance?.botId === instance.botId) return;

    currentGuild.set(null);
    if (browser) {
      if ($currentInstance) {
        safeLocalStorage.removeItem(`lastSelectedGuild_${$currentInstance.botId}`);
      }
      safeLocalStorage.removeItem("lastSelectedGuild");
    }
    currentInstance.set(instance);
    if (browser) {
      safeLocalStorage.setItem("selectedInstance", JSON.stringify(instance));
    }
  }

  function handleWindowResize() {
    isMobile = window.innerWidth < 1024;
  }

  onMount(() => {
    if (browser) {
      collapsed = safeLocalStorage.getItem("sidebar-collapsed") === "true";
      window.addEventListener("keydown", handleGlobalKeydown);
      window.addEventListener("resize", handleWindowResize);
    }

    loadInstances();

    return () => {
      if (browser) {
        window.removeEventListener("keydown", handleGlobalKeydown);
        window.removeEventListener("resize", handleWindowResize);
      }
    };
  });
</script>

<aside
  class="flex flex-col shrink-0 fixed top-0 z-40 transition-[width,transform] duration-300 ease-out h-dvh overflow-hidden lg:left-0 lg:border-r max-lg:right-0 max-lg:border-l"
  class:max-lg:translate-x-0={mobileOpen}
  class:max-lg:translate-x-full={!mobileOpen}
  style="width: {isMobile ? 'min(85vw, 320px)' : collapsed ? '68px' : '280px'};
         background: linear-gradient(180deg, {$colorStore.primary}15, {$colorStore.secondary}10, {$colorStore.accent}08);
         border-color: {$colorStore.primary}15;"
  aria-label="Owner panel navigation"
>
<div class="flex flex-col h-full shrink-0" style="width: {isMobile ? 'min(85vw, 320px)' : collapsed ? '68px' : '280px'};">
  <div class="border-b shrink-0 flex items-center px-3 py-3 gap-2"
       class:justify-center={collapsed}
       style="border-color: {$colorStore.primary}15;">
    <a href="/owner" class="flex items-center gap-3 overflow-hidden min-w-0"
       class:flex-1={!collapsed}
       class:justify-center={collapsed}>
      <img src="/img/Mewdeko.png" alt="Mewdeko" class="w-9 h-9 object-contain shrink-0 rounded-lg">
      {#if !collapsed}
        <span class="min-w-0">
          <span class="block text-lg font-semibold leading-tight whitespace-nowrap" style="color: {$colorStore.text};">
            Owner Panel
          </span>
          <span class="block text-[11px] uppercase tracking-wider" style="color: {$colorStore.muted};">
            Bot owner tools
          </span>
        </span>
      {/if}
    </a>
    {#if !collapsed}
      <a
        href="/dashboard"
        class="flex items-center justify-center w-8 h-8 rounded-lg transition-transform duration-200 hover:scale-[1.05] shrink-0"
        style="color: {$colorStore.muted}; background: {$colorStore.primary}08;"
        title="Back to the dashboard"
        aria-label="Back to the dashboard"
      >
        <i class="fa-solid fa-arrow-left text-xs" aria-hidden="true"></i>
      </a>
    {/if}
  </div>

  <div class="border-b shrink-0 relative" style="border-color: {$colorStore.primary}15;">
    <div class="p-3">
      <button
        class="flex items-center gap-3 rounded-xl p-2 transition-[color,background-color,border-color,transform] duration-200 hover:scale-[1.02] min-w-0 w-full overflow-hidden text-left"
        class:justify-center={collapsed}
        style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;"
        onclick={() => showInstancePicker = !showInstancePicker}
        onmouseenter={(e) => showTooltip(e, $currentInstance?.botName ?? 'Select instance')}
        onmouseleave={hideTooltip}
        aria-expanded={showInstancePicker}
      >
        <div class="w-9 h-9 rounded-xl overflow-hidden shrink-0 ring-2 ring-opacity-30"
             style="background: {$colorStore.primary}20; ring-color: {$colorStore.primary};">
          {#if $currentInstance?.botAvatar}
            <img src={$currentInstance.botAvatar} alt="" class="w-full h-full object-cover" loading="lazy">
          {:else}
            <div class="w-full h-full flex items-center justify-center">
              <i class="fa-solid fa-robot" style="color: {$colorStore.primary};"></i>
            </div>
          {/if}
        </div>
        {#if !collapsed}
          <div class="min-w-0 flex-1">
            <div class="text-base font-semibold truncate" style="color: {$colorStore.text};">
              {$currentInstance?.botName ?? "Select instance"}
            </div>
            <div class="flex items-center gap-1.5 text-xs" style="color: {$colorStore.muted};">
              <span class="w-1.5 h-1.5 rounded-full" style="background: {$currentInstance?.isActive ? '#10B981' : $colorStore.accent};"></span>
              <span>Port {$currentInstance?.port}</span>
            </div>
          </div>
          <i class="fa-solid fa-chevron-down text-xs shrink-0 transition-transform duration-200"
             style="color: {$colorStore.muted}; transform: rotate({showInstancePicker ? '180deg' : '0deg'});"
             aria-hidden="true"></i>
        {/if}
      </button>
    </div>

    {#if showInstancePicker && !collapsed}
      <div
        class="absolute left-2 right-2 top-full mt-1 rounded-xl shadow-2xl border overflow-hidden z-50"
        style="border-color: {$colorStore.primary}30;
               background: linear-gradient(135deg, {$colorStore.background}f8, {$colorStore.background}f0);
               backdrop-filter: blur(12px);"
        transition:slide={{ duration: 200, axis: 'y' }}
      >
        <div class="max-h-64 overflow-y-auto sidebar-scrollbar py-1">
          {#if instancesLoading}
            <div class="flex items-center gap-2 px-3 py-2 text-xs" style="color: {$colorStore.muted};">
              <div class="animate-spin h-3 w-3 border-2 rounded-full"
                   style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
              Loading instances...
            </div>
          {:else}
            {#each instances as instance (instance.botId)}
              <button
                class="w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left"
                style="background: {$currentInstance?.botId === instance.botId ? $colorStore.primary + '15' : 'transparent'}; color: {$colorStore.text};"
                onclick={() => handleInstanceSelect(instance)}
              >
                <img src={instance.botAvatar} alt="" class="w-6 h-6 rounded-full shrink-0">
                <span class="flex-1 min-w-0">
                  <span class="block text-sm truncate">{instance.botName}</span>
                  <span class="block text-[11px]" style="color: {$colorStore.muted};">Port {instance.port}</span>
                </span>
                <span class="w-1.5 h-1.5 rounded-full shrink-0" style="background: {instance.isActive ? '#10B981' : $colorStore.accent};"></span>
              </button>
            {:else}
              <div class="px-3 py-2 text-xs" style="color: {$colorStore.muted};">No instances registered</div>
            {/each}
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <nav class="flex-1 overflow-y-auto overflow-x-hidden py-2 sidebar-scrollbar" aria-label="Owner tools">
    <div class="px-2 mb-1">
      <a
        href="/owner"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-[color,background-color,border-color,transform] duration-200 hover:scale-[1.01]"
        class:justify-center={collapsed}
        style="background: {isOwnerHome ? $colorStore.primary + '12' : 'transparent'};
               color: {isOwnerHome ? $colorStore.text : $colorStore.muted};
               border: 1px solid {isOwnerHome ? $colorStore.primary + '20' : 'transparent'};"
        aria-current={isOwnerHome ? 'page' : undefined}
        onmouseenter={(e) => showTooltip(e, 'Overview')}
        onmouseleave={hideTooltip}
      >
        <i class="fa-utility-duo fa-regular fa-crown text-base shrink-0"
           style="--fa-primary-color: {isOwnerHome ? $colorStore.primary : $colorStore.muted};
                  --fa-secondary-color: {isOwnerHome ? $colorStore.secondary : $colorStore.muted};
                  --fa-secondary-opacity: 0.4;
                  width: 20px; text-align: center;"
           aria-hidden="true"></i>
        {#if !collapsed}
          <span class="text-[15px] font-medium">Overview</span>
        {/if}
      </a>

      <button
        type="button"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-[color,background-color,border-color,transform] duration-200 hover:scale-[1.01]"
        class:justify-center={collapsed}
        style="background: transparent; color: {$colorStore.muted}; border: 1px solid transparent;"
        onclick={() => openSearch()}
        onmouseenter={(e) => showTooltip(e, 'Search (Ctrl+K)')}
        onmouseleave={hideTooltip}
      >
        <i class="fa-utility-duo fa-regular fa-magnifying-glass text-base shrink-0"
           style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted};
                  --fa-secondary-opacity: 0.4; width: 20px; text-align: center;"
           aria-hidden="true"></i>
        {#if !collapsed}
          <span class="text-[15px] font-medium flex-1 text-left">Search</span>
          <span class="px-1.5 py-0.5 rounded-sm text-xs" style="background: {$colorStore.primary}20; color: {$colorStore.primary};">⌘K</span>
        {/if}
      </button>
    </div>

    <div class="mx-3 my-2 h-px" style="background: {$colorStore.primary}10;"></div>

    <div class="px-2 space-y-0.5">
      {#each features as feature (feature.href)}
        {@const active = isActive(feature.href)}
        <a
          href={feature.href}
          class="flex items-center gap-3 px-3 py-2 max-lg:py-3 rounded-xl transition-[color,background-color,border-color,transform] duration-200 hover:scale-[1.01] relative"
          class:justify-center={collapsed}
          style="background: {active ? $colorStore.primary + '12' : 'transparent'};
                 color: {active ? $colorStore.text : $colorStore.muted};
                 border: 1px solid {active ? $colorStore.primary + '20' : 'transparent'};"
          aria-current={active ? 'page' : undefined}
          onmouseenter={(e) => showTooltip(e, feature.label)}
          onmouseleave={hideTooltip}
        >
          {#if active}
            <div class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                 style="background: linear-gradient(180deg, {$colorStore.primary}, {$colorStore.secondary});"
                 transition:fade={{ duration: 150 }}></div>
          {/if}
          <i class="{feature.icon} text-sm shrink-0 transition-colors duration-200"
             style="--fa-primary-color: {active ? $colorStore.primary : $colorStore.muted};
                    --fa-secondary-color: {active ? $colorStore.secondary : $colorStore.muted};
                    --fa-secondary-opacity: {active ? 0.5 : 0.3};
                    width: 20px; text-align: center;"
             aria-hidden="true"></i>
          {#if !collapsed}
            <span class="text-[15px] max-lg:text-base truncate flex-1" style="color: {active ? $colorStore.text : $colorStore.muted};">
              {feature.label}
            </span>
          {/if}
        </a>
      {/each}
    </div>
  </nav>

  <div class="border-t shrink-0" style="border-color: {$colorStore.primary}10;">
    <div class="p-2 flex items-center gap-1" class:justify-center={collapsed}>
      {#if $userStore}
        <button
          class="flex items-center gap-3 px-2 py-2 rounded-xl transition-[color,background-color,border-color,transform] duration-200 hover:scale-[1.01] min-w-0"
          class:flex-1={!collapsed}
          class:justify-center={collapsed}
          style="color: {$colorStore.text};"
          onclick={() => { if (collapsed) toggleSidebar(); }}
          onmouseenter={(e) => collapsed && showTooltip(e, "Expand sidebar (Ctrl+B)")}
          onmouseleave={hideTooltip}
          aria-label={collapsed ? "Expand sidebar" : $userStore.username}
        >
          <div class="relative shrink-0">
            <img src={userAvatarUrl} alt={$userStore.username} class="w-9 h-9 rounded-full shrink-0">
            {#if collapsed}
              <span class="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full border-2"
                    style="background: {$colorStore.primary}; border-color: {$colorStore.gradientStart};">
                <i class="fa-solid fa-angles-right text-[7px]" style="color: {$colorStore.text};" aria-hidden="true"></i>
              </span>
            {/if}
          </div>
          {#if !collapsed}
            <div class="flex-1 min-w-0 text-left">
              <div class="text-sm font-medium truncate">{$userStore.username}</div>
              <div class="text-[11px] truncate" style="color: {$colorStore.accent};">Bot owner</div>
            </div>
          {/if}
        </button>
      {/if}

      {#if !collapsed}
        <button
          class="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg transition-[color,background-color,border-color,transform] duration-200 hover:scale-[1.05] shrink-0"
          style="color: {$colorStore.muted}; background: {$colorStore.primary}08;"
          onclick={toggleSidebar}
          title="Collapse (Ctrl+B)"
          aria-label="Collapse sidebar"
        >
          <i class="fa-solid fa-angles-left text-xs" aria-hidden="true"></i>
        </button>
        <button
          class="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-[color,background-color,border-color,transform] duration-200 hover:scale-[1.05] shrink-0"
          style="color: {$colorStore.muted}; background: {$colorStore.primary}08;"
          onclick={closeMobile}
          aria-label="Close sidebar"
        >
          <i class="fa-solid fa-xmark text-xs" aria-hidden="true"></i>
        </button>
      {/if}
    </div>
  </div>
</div>
</aside>

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
    style="left: 76px; top: {tooltipPosition.top}px; transform: translateY(-50%);
           background: {$colorStore.gradientStart}f5; color: {$colorStore.text};
           border: 1px solid {$colorStore.primary}25; backdrop-filter: blur(8px);"
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
</style>
