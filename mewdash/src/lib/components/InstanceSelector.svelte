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

  // Track loading and validity state for each instance
  let instanceStates: Map<string, {
    loading: boolean;
    hasMutualGuild: boolean;
    error: string | null;
  }> = new Map();

  async function checkInstanceMutualGuilds(instance: BotInstance) {
    if (!data.user) return false;
    instanceStates.set(instance.botId.toString(), {
      loading: true,
      hasMutualGuild: false,
      error: null
    });
    instanceStates = instanceStates;

    const customHeaders = {
      "X-Instance-Url": `http://localhost:${instance.port}/botapi`
    };

    const mutualGuilds = await api.getMutualGuilds(BigInt(data.user.id), undefined, customHeaders);

    if (!mutualGuilds || mutualGuilds === undefined)
      return false;

    instanceStates.set(instance.botId.toString(), {
      loading: false,
      hasMutualGuild: mutualGuilds.length > 0,
      error: null
    });
    instanceStates = instanceStates;

    return mutualGuilds.length > 0;

  }

  onMount(async () => {
    if (!data.user) {
      await goto("/api/discord/login");
      return;
    }
      const response = await api.getBotInstances();
      instances = response;

      // If only one instance, check it directly
      if (instances.length === 1) {
        const hasMutual = await checkInstanceMutualGuilds(instances[0]);
        if (hasMutual) {
          currentInstance.set(instances[0]);
          await goto("/dashboard");
        }
      } else {
        // Check all instances in parallel
        await Promise.all(instances.map(checkInstanceMutualGuilds));
      }
  });

  async function handleInstanceSelect(instance: BotInstance) {
    currentInstance.set(instance);
    localStorage.setItem("selectedInstance", JSON.stringify(instance));
    await goto("/dashboard");
  }

  // Filter to show only instances with mutual guilds
  $: visibleInstances = instances.filter(instance =>
    instanceStates.get(instance.botId.toString())?.hasMutualGuild
  );
</script>

<div class="container mx-auto px-4 py-6 max-w-4xl">
  <div class="text-center mb-8">
    <h1 class="text-3xl font-bold mb-2">Select Bot Instance</h1>
    <p class="text-gray-400">Choose a bot instance from servers you're in</p>
  </div>

  {#if loading}
    <div class="flex justify-center">
      <div class="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
    </div>
  {:else if error}
    <div class="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 rounded-lg p-4">
      {error}
    </div>
  {:else if visibleInstances.length === 0}
    <div class="text-center py-12">
      <p class="text-xl text-gray-400">No bot instances found in your servers</p>
      <p class="mt-2 text-gray-500">Join a server with one of our bots to manage it</p>
    </div>
  {:else}
    <div class="grid gap-4" in:fade>
      {#each visibleInstances as instance (instance.botId)}
        {@const state = instanceStates.get(instance.botId.toString())}
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
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>