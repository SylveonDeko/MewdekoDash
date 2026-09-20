<!-- routes/owner/+layout.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { userStore } from "$lib/stores/userStore.ts";
  import { safeLocalStorage } from "$lib/safeStorage";
  import { logger } from "$lib/logger";
  import { ownershipApi } from "$lib/api/index.ts";
  import InstanceSelector from "$lib/components/layout/InstanceSelector.svelte";
  import OwnerSidebar from "$lib/components/layout/OwnerSidebar.svelte";
  import ErrorBoundary from "$lib/components/ui/ErrorBoundary.svelte";
  import SearchModal from "$lib/components/search/SearchModal.svelte";

  let { data, children } = $props();

  let sidebarCollapsed = $state(browser ? safeLocalStorage.getItem("sidebar-collapsed") === "true" : false);
  let mobileSidebarOpen = $state(false);

  /**
   * null until the bot has answered, so the page neither flashes owner content at a non-owner
   * nor bounces an owner before the probe returns.
   */
  let isOwner = $state<boolean | null>(null);

  function handleToggleMobileSidebar() {
    mobileSidebarOpen = !mobileSidebarOpen;
  }

  /**
   * Restores the instance the browser last worked with before the first render, the same way the
   * dashboard does, so a reload lands on the right host instead of the picker.
   */
  if (browser) {
    const savedInstance = safeLocalStorage.getItem("selectedInstance");
    if (savedInstance) {
      try {
        currentInstance.set(JSON.parse(savedInstance));
      } catch (err) {
        logger.error("Failed to parse saved instance:", err);
        safeLocalStorage.removeItem("selectedInstance");
      }
    }
  }

  $effect(() => {
    if (!browser) return;
    const botId = $currentInstance?.botId;
    if (botId === undefined || botId === null) return;
    document.cookie = `selectedInstanceId=${botId.toString()}; path=/; max-age=31536000; SameSite=Lax`;
  });

  $effect(() => {
    if ($currentInstance?.botAvatar) {
      colorStore.extractFromImage($currentInstance.botAvatar);
    }
  });

  /**
   * The answer depends on which instance is selected, since each bot has its own owner list, so
   * it is asked again whenever the instance changes.
   */
  $effect(() => {
    const user = $userStore;
    const instance = $currentInstance;
    if (!browser || !user?.id || !instance) return;

    isOwner = null;
    ownershipApi
      .isOwner(BigInt(user.id))
      .then((owner) => {
        isOwner = owner;
        if (!owner) goto("/dashboard");
      })
      .catch((err) => {
        logger.error("Owner check failed:", err);
        isOwner = false;
        goto("/dashboard");
      });
  });

  onMount(() => {
    if (data.user) {
      userStore.set(data.user);
    }

    window.addEventListener("toggle-mobile-sidebar", handleToggleMobileSidebar);
    return () => {
      window.removeEventListener("toggle-mobile-sidebar", handleToggleMobileSidebar);
    };
  });
</script>

<div class="flex w-full overflow-x-hidden">
  {#if $currentInstance}
    <OwnerSidebar bind:collapsed={sidebarCollapsed} bind:mobileOpen={mobileSidebarOpen} />
  {/if}

  <div class="flex-1 w-full min-w-0"
       class:lg:ml-[280px]={$currentInstance && !sidebarCollapsed}
       class:lg:ml-[68px]={$currentInstance && sidebarCollapsed}>
    {#if !$currentInstance}
      <InstanceSelector data={data} />
    {:else if isOwner}
      <ErrorBoundary>
        {@render children?.()}
      </ErrorBoundary>
    {:else}
      <div class="flex items-center justify-center min-h-[60vh]" aria-live="polite">
        <div class="flex items-center gap-3 text-sm" style="color: {$colorStore.muted};">
          <div class="animate-spin h-4 w-4 border-2 rounded-full"
               style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"></div>
          Checking owner access...
        </div>
      </div>
    {/if}
  </div>
</div>

<SearchModal />
