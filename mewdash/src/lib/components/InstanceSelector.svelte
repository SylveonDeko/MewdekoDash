<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api.ts";
  import type { BotInstance } from "$lib/types/models.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { fade } from "svelte/transition";
  import { goto } from "$app/navigation";

  export let data;
  let instances: BotInstance[] = [];
  let loading = true;
  let error: string | null = null;
  let checkingInstances = false;

  // Use a reactive object instead of Map for better Svelte reactivity
  let instanceStates: Record<string, {
    loading: boolean;
    hasMutualGuild: boolean;
    error: string | null;
    checked: boolean; // Track if we've finished checking this instance
  }> = {};

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
      console.log(`Checking mutual guilds for instance ${instance.botName} (${instanceId})`);
      const mutualGuilds = await api.getMutualGuilds(BigInt(data.user.id), undefined, customHeaders);

      console.log(`Instance ${instance.botName}: mutualGuilds =`, mutualGuilds);

      // Check if mutualGuilds is null, undefined, or empty
      const hasMutual = mutualGuilds && Array.isArray(mutualGuilds) && mutualGuilds.length > 0;

      instanceStates[instanceId] = {
        loading: false,
        hasMutualGuild: hasMutual,
        error: null,
        checked: true
      };
      instanceStates = { ...instanceStates }; // Trigger reactivity

      console.log(`Instance ${instance.botName}: hasMutualGuild = ${hasMutual}`);
      return hasMutual;
    } catch (err: any) {
      console.log(`Error checking mutual guilds for instance ${instance.botName}:`, err);

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
      const response = await api.getBotInstances();
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
          await goto("/dashboard");
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
    await goto("/dashboard");
  }

  // Filter to show only instances with mutual guilds, but only after they've been checked
  $: visibleInstances = instances.filter(instance => {
    const instanceId = instance.botId.toString();
    const state = instanceStates[instanceId];

    // Only show instances that have been checked and have mutual guilds
    return state?.checked && state?.hasMutualGuild;
  });

  // Track if we're still checking any instances
  $: stillChecking = Object.values(instanceStates).some(state => state.loading);

  // Show loading state while checking instances
  $: showLoading = loading || checkingInstances || stillChecking;
</script>

<div class="container mx-auto px-4 py-6 max-w-4xl">
  <div class="text-center mb-8">
    <h1 class="text-3xl font-bold mb-2">Select Bot Instance</h1>
    <p class="text-gray-400">Choose a bot instance from servers you're in</p>
  </div>

  {#if showLoading}
    <div class="flex flex-col items-center justify-center py-12">
      <div class="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
      <p class="text-gray-400">
        {#if loading}
          Loading bot instances...
        {:else if checkingInstances || stillChecking}
          Checking which servers you share with each bot...
        {/if}
      </p>
    </div>
  {:else if error}
    <div class="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 rounded-lg p-4">
      {error}
    </div>
  {:else if instances.length === 0}
    <div class="text-center py-12">
      <p class="text-xl text-gray-400">No bot instances available</p>
      <p class="mt-2 text-gray-500">Please contact an administrator</p>
    </div>
  {:else if visibleInstances.length === 0}
    <div class="text-center py-12">
      <p class="text-xl text-gray-400">No bot instances found in your servers</p>
      <p class="mt-2 text-gray-500">Join a server with one of our bots to manage it</p>

      <!-- Debug info (remove in production) -->
      <details class="mt-4 text-left bg-gray-800 p-4 rounded">
        <summary class="cursor-pointer text-gray-300">Debug Info</summary>
        <div class="mt-2 text-sm text-gray-400">
          <p>Total instances loaded: {instances.length}</p>
          <p>Instance states:</p>
          <pre
            class="text-xs mt-2 bg-gray-900 p-2 rounded overflow-x-auto">{JSON.stringify(instanceStates, null, 2)}</pre>
        </div>
      </details>
    </div>
  {:else}
    <div class="grid gap-4" in:fade>
      {#each visibleInstances as instance (instance.botId)}
        {@const state = instanceStates[instance.botId.toString()]}
        <button
          on:click={() => handleInstanceSelect(instance)}
          class="flex items-center p-6 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <img
            src={instance.botAvatar}
            alt=""
            class="w-16 h-16 rounded-full mr-6"
          />
          <div class="text-left flex-grow">
            <h2 class="text-xl font-semibold">{instance.botName}</h2>
            <p class="text-gray-400">Port: {instance.port}</p>
            {#if state?.error}
              <p class="text-red-500 text-sm mt-1">{state.error}</p>
            {/if}
          </div>
          {#if state?.loading}
            <div class="w-5 h-5 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin ml-auto"></div>
          {:else if !instance.isActive}
            <span class="ml-auto px-3 py-1 rounded-full bg-red-500 bg-opacity-10 text-red-500 text-sm">
              Offline
            </span>
          {:else}
            <span class="ml-auto px-3 py-1 rounded-full bg-green-500 bg-opacity-10 text-green-500 text-sm">
              Available
            </span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>