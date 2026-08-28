<script lang="ts">
  import { onDestroy, onMount, untrack } from "svelte";
  import { currentInstance } from "$lib/stores/instanceStore";
  import InstanceSelector from "$lib/components/layout/InstanceSelector.svelte";
  import ErrorBoundary from "$lib/components/ui/ErrorBoundary.svelte";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { userStore } from "$lib/stores/userStore.ts";
  import DashboardSidebar from "$lib/components/layout/DashboardSidebar.svelte";
  import SetupSuggestionBanner from "$lib/components/dashboard/SetupSuggestionBanner.svelte";
  import ProductUpdateModal from "$lib/components/dashboard/ProductUpdateModal.svelte";
  import {
    lastSeenUpdateKey,
    latestProductUpdate,
    productUpdates,
    unseenProductUpdates
  } from "$lib/content/productUpdates";
  import {
    announceProductUpdates,
    closeProductUpdates,
    unseenUpdates,
    updatesDialog
  } from "$lib/stores/productUpdateStore";
  import { browser } from "$app/environment";
  import { wizardApi } from "$lib/api/index.ts";
  import { musicStore } from "$lib/stores/musicStore.ts";
  import { userAdminGuilds } from "$lib/stores/adminGuildsStore";
  import { switchingServer } from "$lib/stores/guildSwitchStore";
  import { fade, fly } from "svelte/transition";

  let { data, children } = $props();
  let guildSearchTerm = $state("");

  let sidebarCollapsed = $state(browser ? localStorage.getItem("sidebar-collapsed") === "true" : false);
  let mobileSidebarOpen = $state(false);
  let contentEl = $state<HTMLElement>();
  let prevCollapsed = untrack(() => sidebarCollapsed);
  let slideCleanup: (() => void) | null = null;

  $effect(() => {
    const now = sidebarCollapsed;
    if (now === prevCollapsed) return;
    const delta = now ? 212 : -212;
    prevCollapsed = now;
    const el = contentEl;
    if (!browser || !el || window.innerWidth < 1024) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    slideCleanup?.();
    el.style.transition = "none";
    el.style.transform = `translateX(${delta}px)`;
    el.style.willChange = "transform";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "transform 300ms ease-out";
        el.style.transform = "translateX(0)";
      });
    });
    const done = (e?: TransitionEvent) => {
      if (e && (e.target !== el || e.propertyName !== "transform")) return;
      el.style.transition = "";
      el.style.transform = "";
      el.style.willChange = "";
      el.removeEventListener("transitionend", done);
      slideCleanup = null;
    };
    slideCleanup = done;
    el.addEventListener("transitionend", done);
  });

  function handleToggleMobileSidebar() {
    mobileSidebarOpen = !mobileSidebarOpen;
  }

  // Setup suggestion banner state
  let showSetupSuggestion = $state(false);
  let setupSuggestionContext = $state<any>(null);
  /**
   * Marks every update as read, so the next visit only surfaces what is published after this one.
   */
  function dismissProductUpdates() {
    unseenUpdates.set([]);
    closeProductUpdates();
    localStorage.setItem(lastSeenUpdateKey, latestProductUpdate.id);
  }

  /**
   * Converts the retired per-update dismissal keys into the single last-seen marker.
   *
   * The old scheme wrote one key per update and never removed any, so it grew by a key with
   * every release. This reads the newest update the viewer had already dismissed, clears the
   * whole set, and returns that id so they carry on from the right place instead of being
   * treated as a first-time visitor and silently skipping an update.
   */
  function migrateDismissedUpdates(): string | null {
    const legacyPrefix = "dismissed-product-update:";
    const dismissed = new Set<string>();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(legacyPrefix) && localStorage.getItem(key) === "true") {
        dismissed.add(key.slice(legacyPrefix.length));
      }
    }

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(legacyPrefix)) localStorage.removeItem(key);
    }

    if (dismissed.size === 0) return null;

    const newest = productUpdates.find((update) => dismissed.has(update.id));
    if (!newest) return null;

    localStorage.setItem(lastSeenUpdateKey, newest.id);
    return newest.id;
  }

  // Check for wizard or setup suggestion when guild changes
  async function checkWizardOrSuggestion() {
    if (!$currentGuild || !$userStore || !browser) return;

    try {
      // Don't check if we're already on wizard page
      if (window.location.pathname.startsWith('/wizard')) {
        return;
      }
      const wizardDecision = await wizardApi.shouldShowWizard(BigInt($userStore.id), $currentGuild.id);
      console.log("Wizard decision:", wizardDecision);

      if (wizardDecision.showWizard) {
        // Convert numeric wizard type to string
        const wizardTypeString = wizardDecision.wizardType === 1 ? "first-time" : "quick-setup";
        window.location.href = `/wizard?guild=${$currentGuild.id}&type=${wizardTypeString}`;
      } else if (wizardDecision.showSuggestion) {
        showSetupSuggestion = true;
        setupSuggestionContext = wizardDecision.context;
      } else {
        showSetupSuggestion = false;
        setupSuggestionContext = null;
      }
    } catch (err) {
      showSetupSuggestion = false;
    }
  }

  function dismissSetupSuggestion() {
    showSetupSuggestion = false;
    setupSuggestionContext = null;
  }

  function guildIconUrl(guild: any): string {
    if (!guild.icon) return "https://cdn.discordapp.com/embed/avatars/0.png";
    const ext = guild.icon.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}`;
  }

  async function selectGuild(guild: any) {
    if ($switchingServer) return;
    switchingServer.set(true);
    currentGuild.set(guild);
    if (browser) {
      try {
        localStorage.setItem("lastSelectedGuild", JSON.stringify({
          id: guild.id.toString(),
          name: guild.name,
          icon: guild.icon
        }));
      } catch {}
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    switchingServer.set(false);
  }

  let filteredGuilds = $derived(
    ($userAdminGuilds || [])
      .filter((g: any) => g.name.toLowerCase().includes(guildSearchTerm.toLowerCase()))
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
  );

  function startQuickSetup() {
    if ($currentGuild && browser) {
      window.location.href = `/wizard?guild=${$currentGuild.id}&type=quick-setup`;
    }
  }

  // Watch for guild changes to check wizard or setup suggestion
  $effect(() => {
        if (browser && $currentGuild && $userStore) {
            checkWizardOrSuggestion();
        }
    });

  // Load saved instance immediately when browser is available to prevent flash
  if (browser) {
    const savedInstance = localStorage.getItem("selectedInstance");
    if (savedInstance) {
      try {
        currentInstance.set(JSON.parse(savedInstance));
      } catch (err) {
        console.error("Failed to parse saved instance:", err);
        localStorage.removeItem("selectedInstance");
      }
    }
  }

  onMount(() => {
    // Set user from server data if available
    if (data.user) {
      userStore.set(data.user);
    }

    const lastSeen = localStorage.getItem(lastSeenUpdateKey) ?? migrateDismissedUpdates();

    // Nothing acknowledged yet means a first visit, which gets the newest update only rather
    // than the whole changelog. Being seen is recorded when it is dismissed, never on load, so
    // closing the tab without reading it does not quietly mark it read.
    const unseen = lastSeen ? unseenProductUpdates(lastSeen) : [latestProductUpdate];

    unseenUpdates.set(unseen);
    if (unseen.length > 0) announceProductUpdates();

    // If no user, redirect to login with current URL
    if (browser && !data.user && !$userStore) {
      const currentUrl = window.location.pathname + window.location.search;
      const loginUrl = `/api/discord/login?redirect_to=${encodeURIComponent(currentUrl)}`;
      window.location.href = loginUrl;
      return;
    }

    window.addEventListener('toggle-mobile-sidebar', handleToggleMobileSidebar);
    return () => {
      window.removeEventListener('toggle-mobile-sidebar', handleToggleMobileSidebar);
    };
  });

  // Extract colors from server icon when guild changes, fallback to bot avatar
  $effect(() => {
        if ($currentGuild?.icon) {
            const iconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.png`;
            colorStore.extractFromServerIcon(iconUrl);
        } else if ($currentInstance?.botAvatar) {
            colorStore.extractFromImage($currentInstance.botAvatar);
        }
    });

  // Start music polling when user and guild are available
  $effect(() => {
    if ($userStore?.id && $currentGuild) {
      musicStore.startPolling(BigInt($userStore.id));
    }
  });

  onDestroy(() => {
    musicStore.stopPolling();
  });
</script>

<div class="flex w-full overflow-x-hidden">
  {#if $currentInstance}
    <DashboardSidebar bind:collapsed={sidebarCollapsed} bind:mobileOpen={mobileSidebarOpen} />
  {/if}

  <div bind:this={contentEl} class="flex-1 w-full min-w-0"
       class:lg:ml-[280px]={$currentInstance && !sidebarCollapsed}
       class:lg:ml-[68px]={$currentInstance && sidebarCollapsed}>
    {#if !$currentInstance}
        <InstanceSelector data={data}/>
    {:else if !$currentGuild}
      <div
        class="h-screen overflow-hidden p-4 md:p-6 w-full flex flex-col"
        style="background: radial-gradient(circle at top,
          {$colorStore.gradientStart}15 0%,
          {$colorStore.gradientMid}10 50%,
          {$colorStore.gradientEnd}05 100%);"
      >
        <div class="max-w-5xl mx-auto w-full flex flex-col min-h-0 gap-4 md:gap-6">
          <div
            class="text-center px-4 py-5 md:py-6 rounded-2xl border shrink-0"
            in:fly={{ y: 20, duration: 300 }}
            style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                   border-color: {$colorStore.primary}30;"
          >
            <h1 class="text-xl md:text-2xl font-bold mb-1" style="color: {$colorStore.text}">Select a Server</h1>
            <p class="text-xs md:text-sm" style="color: {$colorStore.muted}">Choose a server to manage from the dashboard</p>
          </div>

          <div class="relative shrink-0">
            <i class="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-xs"
               style="color: {$colorStore.muted};"></i>
            <input
              type="text"
              placeholder="Search servers..."
              bind:value={guildSearchTerm}
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200"
              style="border-color: {$colorStore.primary}20;
                     color: {$colorStore.text};
                     background: {$colorStore.primary}08;"
            />
          </div>

          <div class="flex-1 min-h-0 overflow-y-auto rounded-2xl px-1" in:fade={{ delay: 100 }}>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 py-1">
              {#each filteredGuilds as guild (guild.id)}
                <button
                  onclick={() => selectGuild(guild)}
                  class="flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] focus:outline-hidden text-left"
                  style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12);
                         border-color: {$colorStore.primary}20;"
                >
                  <img
                    src={guildIconUrl(guild)}
                    alt=""
                    class="w-10 h-10 rounded-full shrink-0 object-cover"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium truncate" style="color: {$colorStore.text}">{guild.name}</p>
                    <p class="text-xs truncate" style="color: {$colorStore.muted}">
                      {guild.owner ? 'Owner' : 'Admin'}
                    </p>
                  </div>
                </button>
              {:else}
                <div class="col-span-full text-center py-12">
                  <p class="text-sm" style="color: {$colorStore.text}">
                    {#if guildSearchTerm}
                      No servers match "{guildSearchTerm}"
                    {:else}
                      No servers available
                    {/if}
                  </p>
                  <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                    {#if guildSearchTerm}
                      Try a different search term
                    {:else}
                      Make sure the bot is in a server where you have admin permissions
                    {/if}
                  </p>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {:else}
      <ErrorBoundary fallback="Dashboard component failed to load. Please refresh or try a different page."
                     showDetails={true}>
        {#if $updatesDialog.open}
          <ProductUpdateModal
            updates={$unseenUpdates}
            startInArchive={$updatesDialog.archive}
            ondismiss={dismissProductUpdates}
          />
        {/if}
        {#if $currentGuild && showSetupSuggestion && setupSuggestionContext}
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <SetupSuggestionBanner
              guild={$currentGuild}
              context={setupSuggestionContext}
              visible={showSetupSuggestion}
              ondismiss={dismissSetupSuggestion}
              onstartSetup={startQuickSetup}
            />
          </div>
        {/if}

          {@render children?.()}
      </ErrorBoundary>
    {/if}
  </div>
</div>
