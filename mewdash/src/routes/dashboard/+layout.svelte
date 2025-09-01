<!-- routes/dashboard/+layout.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { currentInstance } from "$lib/stores/instanceStore";
  import InstanceSelector from "$lib/components/layout/InstanceSelector.svelte";
  import ErrorBoundary from "$lib/components/ui/ErrorBoundary.svelte";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { userStore } from "$lib/stores/userStore.ts";
  import MobileNavBar from "$lib/components/layout/MobileNavBar.svelte";
  import SetupSuggestionBanner from "$lib/components/dashboard/SetupSuggestionBanner.svelte";
  import { browser } from "$app/environment";
  import { api } from "$lib/api.ts";
  import { logger } from "$lib/logger.ts";

  export let data;

  // Setup suggestion banner state
  let showSetupSuggestion = false;
  let setupSuggestionContext: any = null;

  // Check for wizard or setup suggestion when guild changes
  async function checkWizardOrSuggestion() {
    if (!$currentGuild || !$userStore || !browser) return;
    
    console.log('Dashboard layout: Checking wizard for guild:', $currentGuild.name, 'user:', $userStore.id);
    
    try {
      // Don't check if we're already on wizard page
      if (window.location.pathname.startsWith('/wizard')) {
        console.log('Already on wizard page, skipping check');
        return;
      }
      
      console.log('Making API call to shouldShowWizard...');
      const wizardDecision = await api.shouldShowWizard(BigInt($userStore.id), $currentGuild.id);
      console.log('Wizard decision received:', wizardDecision);
      
      if (wizardDecision.showWizard) {
        // Convert numeric wizard type to string
        const wizardTypeString = wizardDecision.wizardType === 1 ? 'first-time' : 'quick-setup';
        logger.info(`Dashboard triggering ${wizardTypeString} wizard for guild ${$currentGuild.name}: ${wizardDecision.reason}`);
        window.location.href = `/wizard?guild=${$currentGuild.id}&type=${wizardTypeString}`;
      } else if (wizardDecision.showSuggestion) {
        showSetupSuggestion = true;
        setupSuggestionContext = wizardDecision.context;
        logger.debug("Showing setup suggestion for guild:", $currentGuild.name);
      } else {
        showSetupSuggestion = false;
        setupSuggestionContext = null;
        logger.debug("No wizard or suggestion needed for guild:", $currentGuild.name);
      }
    } catch (err) {
      logger.error("Error checking wizard/suggestion:", err);
      showSetupSuggestion = false;
    }
  }

  function dismissSetupSuggestion() {
    showSetupSuggestion = false;
    setupSuggestionContext = null;
  }

  function startQuickSetup() {
    if ($currentGuild && browser) {
      window.location.href = `/wizard?guild=${$currentGuild.id}&type=quick-setup`;
    }
  }

  // Watch for guild changes to check wizard or setup suggestion
  $: if (browser && $currentGuild && $userStore) {
    checkWizardOrSuggestion();
  }

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

    // If no user from server or persisted store and not on Patreon callback, redirect to login
    if (browser && !data.user && !$userStore) {
      const isPatreonCallback = window.location.pathname === "/dashboard/patreon" &&
        (window.location.search.includes("code=") || window.location.search.includes("error="));
      if (!isPatreonCallback) {
        // Capture current URL for redirect after login
        const currentUrl = window.location.pathname + window.location.search;
        const loginUrl = `/api/discord/login?redirect_to=${encodeURIComponent(currentUrl)}`;
        window.location.href = loginUrl;
        return;
      }
    }
  });

  // Extract colors from server icon when guild changes, fallback to bot avatar
  $: if ($currentGuild?.icon) {
    // Use server icon for server-specific theming
    const iconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.png`;
    colorStore.extractFromServerIcon(iconUrl);
  } else if ($currentInstance?.botAvatar) {
    // Fallback to bot avatar if no server icon
    colorStore.extractFromImage($currentInstance.botAvatar);
  }
</script>

<div class="pt-4 flex w-full">
  <!-- Main content -->
  <div class="flex-1 w-full">
    {#if !$currentInstance}
      <InstanceSelector data="{data}" />
    {:else}
      <ErrorBoundary fallback="Dashboard component failed to load. Please refresh or try a different page."
                     showDetails={true}>
        <!-- Setup suggestion banner (only show on dashboard pages with selected guild) -->
        {#if $currentGuild && showSetupSuggestion && setupSuggestionContext}
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <SetupSuggestionBanner
              guild={$currentGuild}
              context={setupSuggestionContext}
              visible={showSetupSuggestion}
              on:dismiss={dismissSetupSuggestion}
              on:startSetup={startQuickSetup}
            />
          </div>
        {/if}
        
        <slot />
      </ErrorBoundary>
      <!-- Always show mobile nav when we have an instance - it can handle both guild and instance selection -->
      <MobileNavBar showInstanceSelector={!$currentGuild} data={data} />
    {/if}
  </div>
</div>