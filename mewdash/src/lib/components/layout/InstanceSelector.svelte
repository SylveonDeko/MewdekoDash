<script lang="ts">
  import {onMount} from "svelte";
  import { instanceManagementApi, clientApi, type BotInstance } from "$lib/api/index.ts";
  import {currentInstance} from "$lib/stores/instanceStore.ts";
  import {fade, fly} from "svelte/transition";
  import {goto} from "$app/navigation";
  import {page} from "$app/stores";
  import {colorStore} from "$lib/stores/colorStore";
  import {browser} from "$app/environment";

  interface Props {
    data: any;
  }

  let { data }: Props = $props();
  let instances: BotInstance[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  let checkingInstances = $state(false);

  // Use a reactive object instead of Map for better Svelte reactivity
  let instanceStates: Record<string, {
    loading: boolean;
    hasMutualGuild: boolean;
    error: string | null;
    checked: boolean; // Track if we've finished checking this instance
  }> = $state({});

  async function checkInstanceMutualGuilds(instance: BotInstance) {
    if (!data.user) return false;

    const instanceId = instance.botId.toString();

    // Set loading state
    instanceStates[instanceId] = {
      loading: true,
      hasMutualGuild: false,
      error: null,
      checked: false
    };
    instanceStates = { ...instanceStates }; // Trigger reactivity

    const customHeaders = {
      "X-Instance-Url": `http://localhost:${instance.port}/botapi`
    };

    try {
      const mutualGuilds = await clientApi.getMutualGuilds(data.user.id, true, fetch, customHeaders);

      // Check if mutualGuilds is null, undefined, or empty
      const hasMutual = mutualGuilds && Array.isArray(mutualGuilds) && mutualGuilds.length > 0;

      instanceStates[instanceId] = {
        loading: false,
        hasMutualGuild: hasMutual || false,
        error: null,
        checked: true
      };
      instanceStates = { ...instanceStates }; // Trigger reactivity

      return hasMutual;
    } catch (err: any) {

      // Check if it's a 404 error (no mutual guilds found)
      const is404 = err?.message?.includes("404") || err?.status === 404 || err?.response?.status === 404;

      if (is404) {
        console.log(`Instance ${instance.botName}: No mutual guilds (404)`);
        instanceStates[instanceId] = {
          loading: false,
          hasMutualGuild: false,
          error: null, // 404 is not an error, it means no mutual guilds
          checked: true
        };
      } else {
        console.error(`Actual error for instance ${instance.botName}:`, err);
        instanceStates[instanceId] = {
          loading: false,
          hasMutualGuild: false,
          error: "Failed to check mutual guilds",
          checked: true
        };
      }

      instanceStates = { ...instanceStates }; // Trigger reactivity
      return false;
    }
  }

  onMount(async () => {
    try {
      const response = await instanceManagementApi.getBotInstances();
      instances = response || [];
      console.log("Loaded instances:", instances);

      if (instances.length === 0) {
        loading = false;
        return;
      }

      checkingInstances = true;

      // If only one instance, check it directly
      if (instances.length === 1) {
        const hasMutual = await checkInstanceMutualGuilds(instances[0]);
        if (hasMutual) {
          currentInstance.set(instances[0]);
          // Save to localStorage for future loads
          if (browser) {
            localStorage.setItem("selectedInstance", JSON.stringify(instances[0]));
          }
          // Stay on the current page instead of redirecting to main dashboard
          const currentPath = browser ? $page.url.pathname : "/dashboard";
          if (currentPath === "/dashboard") {
            // Only redirect if we're already on the main dashboard page
            await goto("/dashboard");
          }
          // Otherwise, stay on the current page to let it load with the selected instance
          return;
        }
      } else if (instances.length > 0) {
        // Check all instances in parallel
        await Promise.all(instances.map(checkInstanceMutualGuilds));
      }

      checkingInstances = false;
    } catch (err) {
      console.error("Error loading bot instances:", err);
      error = "Failed to load bot instances. Please try again later.";
      checkingInstances = false;
    } finally {
      loading = false;
    }
  });

  async function handleInstanceSelect(instance: BotInstance) {
    currentInstance.set(instance);
    localStorage.setItem("selectedInstance", JSON.stringify(instance));
    // Stay on the current page instead of redirecting to main dashboard
    const currentPath = browser ? $page.url.pathname : "/dashboard";
    if (currentPath === "/dashboard") {
      // Only redirect if we're already on the main dashboard page
      await goto("/dashboard");
    }
    // Otherwise, stay on the current page to let it load with the selected instance
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent, instance: BotInstance) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleInstanceSelect(instance);
    }
  }

  // Filter to show only instances with mutual guilds, but only after they've been checked
  let visibleInstances = $derived(instances.filter(instance => {
    const instanceId = instance.botId.toString();
    const state = instanceStates[instanceId];

    // Only show instances that have been checked and have mutual guilds
    return state?.checked && state?.hasMutualGuild;
  }));

  // Track if we're still checking any instances
  let stillChecking = $derived(Object.values(instanceStates).some(state => state.loading));

  // Show loading state while checking instances
  let showLoading = $derived(loading || checkingInstances || stillChecking);
</script>

<div
  class="min-h-screen p-4 md:p-6 overflow-x-hidden w-full transition-all duration-500"
  style="background: radial-gradient(circle at top,
    {$colorStore.gradientStart}15 0%,
    {$colorStore.gradientMid}10 50%,
    {$colorStore.gradientEnd}05 100%);"
>
  <div class="max-w-4xl mx-auto space-y-8">
    <div
      class="text-center p-8 rounded-2xl  border"
      in:fly={{ y: 20, duration: 300 }}
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <h1 class="text-3xl font-bold mb-2" id="instance-selector-title" style="color: {$colorStore.text}">Select Bot
        Instance</h1>
      <p style="color: {$colorStore.muted}">Choose a bot instance from servers you're in</p>
    </div>

  {#if showLoading}
    <div
      class="flex flex-col items-center justify-center py-12 rounded-2xl  border"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
      role="status"
      aria-live="polite"
    >
      <div
        class="w-12 h-12 border-4 rounded-full animate-spin mb-4"
        style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"
        aria-hidden="true"
      ></div>
      <p style="color: {$colorStore.text}">
        {#if loading}
          Loading bot instances...
        {:else if checkingInstances || stillChecking}
          Checking which servers you share with each bot...
        {/if}
      </p>
    </div>
  {:else if error}
    <div
      class="rounded-2xl border p-6 "
      style="background: linear-gradient(135deg, {$colorStore.accent}10, {$colorStore.accent}15);
             border-color: {$colorStore.accent}30;"
      role="alert"
      aria-live="assertive"
    >
      <p style="color: {$colorStore.accent}">{error}</p>
    </div>
  {:else if instances.length === 0}
    <div
      class="text-center py-12 rounded-2xl  border"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
      role="status"
    >
      <p class="text-xl" style="color: {$colorStore.text}">No bot instances available</p>
      <p class="mt-2" style="color: {$colorStore.muted}">Please contact an administrator</p>
    </div>
  {:else if visibleInstances.length === 0}
    <div
      class="text-center py-12 rounded-2xl  border"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
      role="status"
    >
      <p class="text-xl" style="color: {$colorStore.text}">No bot instances found in your servers</p>
      <p class="mt-2" style="color: {$colorStore.muted}">Join a server with one of our bots to manage it</p>
    </div>
  {:else}
    <div
      class="grid gap-4"
      in:fade
      role="list"
      aria-labelledby="instance-selector-title"
    >
      {#each visibleInstances as instance (instance.botId)}
        {@const state = instanceStates[instance.botId.toString()]}
        <button
          onclick={() => handleInstanceSelect(instance)}
          onkeydown={(e) => handleKeydown(e, instance)}
          class="flex items-center p-6 rounded-2xl  border transition-all duration-300 hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2"
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                 border-color: {$colorStore.primary}30;
                 focus:ring-color: {$colorStore.primary};
                 focus:ring-offset-color: {$colorStore.gradientStart};"
          aria-label="Select {instance.botName} bot instance - {!instance.isActive ? 'Offline' : 'Available'}"
        >
          <img
            src={instance.botAvatar}
            alt="{instance.botName} avatar"
            class="w-16 h-16 rounded-full mr-6"
          >
            <div class="text-left grow">
            <h2 class="text-xl font-semibold" style="color: {$colorStore.text}">{instance.botName}</h2>
            <p style="color: {$colorStore.muted}">Port: {instance.port}</p>
            {#if state?.error}
              <p class="text-sm mt-1" style="color: {$colorStore.accent}">{state.error}</p>
            {/if}
          </div>
          {#if state?.loading}
            <div
              class="w-5 h-5 border-2 rounded-full animate-spin ml-auto"
              style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"
              aria-hidden="true"
            ></div>
            <span class="sr-only">Loading...</span>
          {:else if !instance.isActive}
            <span
              class="ml-auto px-3 py-1 rounded-full text-sm"
              style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
              aria-label="Status: Offline"
            >
              Offline
            </span>
          {:else}
            <span
              class="ml-auto px-3 py-1 rounded-full text-sm"
              style="background: #22c55e20; color: #22c55e;"
              aria-label="Status: Available"
            >
              Available
            </span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
  </div>
</div>

<style>
    /* Screen reader only content */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
</style>