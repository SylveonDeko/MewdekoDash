<!-- routes/dashboard/+layout.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { currentInstance } from "$lib/stores/instanceStore";
  import InstanceSelector from "$lib/components/InstanceSelector.svelte";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { userStore } from "$lib/stores/userStore.ts";
  import MobileNavBar from "$lib/components/MobileNavBar.svelte";
  import { browser } from "$app/environment";

  export let data;

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

    const savedInstance = localStorage.getItem("selectedInstance");
    if (savedInstance) {
      currentInstance.set(JSON.parse(savedInstance));
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
      <slot />
      <!-- Always show mobile nav when we have an instance - it can handle both guild and instance selection -->
      <MobileNavBar showInstanceSelector={!$currentGuild} data={data} />
    {/if}
  </div>
</div>