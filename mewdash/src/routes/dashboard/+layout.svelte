<!-- routes/dashboard/+layout.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { currentInstance } from "$lib/stores/instanceStore";
  import InstanceSelector from "$lib/components/InstanceSelector.svelte";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { userStore } from "$lib/stores/userStore.ts";
  import MobileNavBar from "$lib/components/MobileNavBar.svelte";
  import { goto } from "$app/navigation";
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
        goto("/api/discord/login");
        return;
      }
    }

    const savedInstance = localStorage.getItem("selectedInstance");
    if (savedInstance) {
      currentInstance.set(JSON.parse(savedInstance));
    }
    colorStore.extractFromImage($currentInstance?.botAvatar);
  });
</script>

<div class="pt-4 flex w-full">
  <!-- Main content -->
  <div class="flex-1 w-full">
    {#if !$currentInstance}
      <InstanceSelector data="{data}" />
    {:else}
      <slot />
      {#if $currentGuild}
        <MobileNavBar />
      {/if}
    {/if}
  </div>
</div>