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
  import { wizardApi } from "$lib/api/index.ts";

  let { data, children } = $props();

  // Setup suggestion banner state
    let showSetupSuggestion = $state(false);
  let setupSuggestionContext = $state<any>(null);

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

    // If no user, redirect to login with current URL
    if (browser && !data.user && !$userStore) {
      // Capture current URL for redirect after login
      const currentUrl = window.location.pathname + window.location.search;
      const loginUrl = `/api/discord/login?redirect_to=${encodeURIComponent(currentUrl)}`;
      window.location.href = loginUrl;
      return;
    }
  });

  // Extract colors from server icon when guild changes, fallback to bot avatar
  $effect(() => {
        if ($currentGuild?.icon) {
            // Use server icon for server-specific theming
            const iconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.png`;
            colorStore.extractFromServerIcon(iconUrl);
        } else if ($currentInstance?.botAvatar) {
            // Fallback to bot avatar if no server icon
            colorStore.extractFromImage($currentInstance.botAvatar);
        }
    });
</script>

<div class="flex w-full">
  <!-- Main content -->
  <div class="flex-1 w-full">
    {#if !$currentInstance}
        <InstanceSelector data={data}/>
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
              ondismiss={dismissSetupSuggestion}
              onstartSetup={startQuickSetup}
            />
          </div>
        {/if}

          {@render children?.()}
      </ErrorBoundary>
      <!-- Always show mobile nav when we have an instance - it can handle both guild and instance selection -->
      <MobileNavBar showInstanceSelector={!$currentGuild} data={data} />
    {/if}
  </div>
</div>