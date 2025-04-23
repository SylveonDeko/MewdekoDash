<!-- lib/components/ServerSelector.svelte -->
<script lang="ts">
  import { scale, slide } from "svelte/transition";
  import { Check, Search, Server } from "lucide-svelte";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import type { DiscordGuild } from "$lib/types/discordGuild";
  import { clickOutside } from "$lib/clickOutside";

  export let guilds: DiscordGuild[] = [];
  export let loading = false;
  export let error: string | null = null;
  export let onSelect: (guild: DiscordGuild) => void;
  export let onRetry: () => void;

  let showDropdown = false;
  let searchTerm = "";
  let containerRef: HTMLDivElement;

  // Track if user has ever selected a server
  let hasEverSelectedServer = false;

  $: filteredGuilds = guilds.filter(guild =>
    guild.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

  function closeDropdown() {
    showDropdown = false;
  }

  function handleSelect(guild: DiscordGuild) {
    onSelect(guild);
    currentGuild.set(guild);
    closeDropdown();
    if (browser) {
      hasEverSelectedServer = true;
      localStorage.setItem("hasEverSelectedServer", "true");
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      closeDropdown();
    }
  }

  onMount(() => {
    if (browser) {
      hasEverSelectedServer = localStorage.getItem("hasEverSelectedServer") === "true";

      // Set up the escape key handler
      window.addEventListener("keydown", handleKeydown);

      return () => {
        window.removeEventListener("keydown", handleKeydown);
      };
    }
  });
</script>

<div
  bind:this={containerRef}
  class="relative text-center"
  on:clickoutside={closeDropdown}
  use:clickOutside
>
  <button
    aria-controls="server-dropdown"
    aria-expanded={showDropdown}
    class="flex items-center justify-center gap-3 py-2 px-4 rounded-lg transition-colors duration-300 w-full"
    class:border={!$currentGuild && !hasEverSelectedServer}
    class:border-4={!$currentGuild && !hasEverSelectedServer}
    class:shadow-lg={showDropdown}
    on:click={toggleDropdown}
    style={showDropdown ?
      `background: linear-gradient(135deg, ${$colorStore.gradientStart}15, ${$colorStore.gradientMid}20);` :
      `background: linear-gradient(135deg, ${$colorStore.gradientStart}10, ${$colorStore.gradientMid}15);`}
    style:border-color={!$currentGuild && !hasEverSelectedServer ? `${$colorStore.primary}30` : ''}
  >
    {#if $currentGuild}
      <div class="flex items-center justify-center gap-3 flex-1 min-w-0">
        <img
          src={$currentGuild.icon ?
            `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith('a_') ? 'gif' : 'png'}` :
            'https://cdn.discordapp.com/embed/avatars/0.png'
          }
          alt=""
          class="w-8 h-8 rounded-full object-cover"
          in:scale={{ duration: 300, start: 0.8 }}
        />
        <div class="flex-1 min-w-0 text-center">
          <div class="font-semibold truncate" style="color: {$colorStore.text}">
            {$currentGuild.name}
          </div>
          <div class="text-xs truncate" style="color: {$colorStore.muted}">
            Click to change server
          </div>
        </div>
      </div>
    {:else}
      <div class="flex items-center justify-center gap-3 flex-1">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center"
          style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20)"
        >
          <div>
            <Server
              size={16}
              style="color: {$colorStore.primary}"
            />
          </div>
        </div>
        <div class="text-center">
          <div class="font-semibold" style="color: {$colorStore.text}">
            {!hasEverSelectedServer ? 'Select a Server' : 'No Server Selected'}
          </div>
          <div class="text-xs" style="color: {$colorStore.muted}">
            {!hasEverSelectedServer ? 'Click here to get started' : 'Click to select a server'}
          </div>
        </div>
      </div>
    {/if}

    <div
      class="h-5 w-5 flex items-center justify-center rounded-full transition-transform duration-300"
      class:rotate-180={showDropdown}
      style="background: linear-gradient(135deg, {$colorStore.primary}30, {$colorStore.secondary}30)"
    >
      <svg
        fill="none"
        height="14"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        style="color: {$colorStore.text}"
        viewBox="0 0 24 24"
        width="14"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
  </button>

  {#if showDropdown}
    <div
      id="server-dropdown"
      class="absolute mt-2 w-full rounded-lg shadow-xl overflow-hidden z-50 backdrop-blur-xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}90, {$colorStore.gradientMid}90);
             border: 1px solid {$colorStore.primary}30;"
      transition:slide|local={{ duration: 200 }}
      role="listbox"
      aria-label="Available servers"
    >
      <div class="p-3" style="border-bottom: 1px solid {$colorStore.primary}30;">
        <div class="relative">
          <input
            type="text"
            placeholder="Search servers..."
            class="w-full pl-10 pr-3 py-2 rounded-md focus:outline-none transition-colors duration-300"
            style="background: {$colorStore.gradientStart}40;
                   color: {$colorStore.text};
                   border: 1px solid {$colorStore.primary}30;"
            bind:value={searchTerm}
            aria-label="Search servers"
          />
          <Search
            size={16}
            class="absolute left-3 top-1/2 transform -translate-y-1/2"
            style="color: {$colorStore.primary}90"
            aria-hidden="true"
          />
        </div>
      </div>

      <div class="max-h-60 overflow-y-auto">
        {#if loading}
          <div class="py-8 flex flex-col items-center justify-center gap-3">
            <div class="w-8 h-8 border-4 rounded-full animate-spin"
                 style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary}"></div>
            <div style="color: {$colorStore.muted}">Loading servers...</div>
          </div>
        {:else if error}
          <div class="py-8 flex flex-col items-center justify-center gap-3">
            <div class="text-center" style="color: {$colorStore.muted}">{error}</div>
            <button
              class="text-sm py-1 px-3 rounded-md transition-colors duration-300 hover:bg-opacity-75"
              style="background: linear-gradient(135deg, {$colorStore.primary}40, {$colorStore.secondary}40); color: {$colorStore.text}"
              on:click={onRetry}
            >
              Retry
            </button>
          </div>
        {:else if filteredGuilds.length === 0}
          <div class="py-8 text-center" style="color: {$colorStore.muted}">
            {searchTerm ? 'No matching servers found' : 'No servers available'}
          </div>
        {:else}
          {#each filteredGuilds as guild, i (guild.id.toString())}
            <button
              class="flex items-center w-full p-3 transition-colors duration-300"
              style={$currentGuild?.id === guild.id ?
                `background: ${$colorStore.primary}30;` :
                ``}
              on:mouseover={(e) => e.currentTarget.style.background = `${$colorStore.primary}20`}
              on:mouseout={(e) => e.currentTarget.style.background = $currentGuild?.id === guild.id ? `${$colorStore.primary}30` : ''}
              on:click={() => handleSelect(guild)}
              role="option"
              aria-selected={$currentGuild?.id === guild.id}
              in:slide|local={{ delay: i * 30, duration: 200 }}
            >
              <div class="w-8 h-8 flex-none">
                <img
                  src={guild.icon ?
                    `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith('a_') ? 'gif' : 'png'}` :
                    'https://cdn.discordapp.com/embed/avatars/0.png'
                  }
                  alt=""
                  class="w-8 h-8 rounded-full object-cover"
                />
              </div>
              <span class="flex-1 mx-3 text-center" style="color: {$colorStore.text}">{guild.name}</span>
              <div class="w-8 h-8 flex-none flex items-center justify-center">
                {#if $currentGuild?.id === guild.id}
                  <div class="w-6 h-6 rounded-full flex items-center justify-center"
                       style="background: linear-gradient(135deg, {$colorStore.primary}, {$colorStore.secondary})">
                    <Check size={14} color="white" />
                  </div>
                {/if}
              </div>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
    /* Scrollbar styling - matching dashboard style */
    .max-h-60::-webkit-scrollbar {
        width: 8px;
    }

    .max-h-60::-webkit-scrollbar-track {
        background: var(--color-primary-10);
        border-radius: 8px;
    }

    .max-h-60::-webkit-scrollbar-thumb {
        background: var(--color-primary-30);
        border-radius: 8px;
    }

    .max-h-60::-webkit-scrollbar-thumb:hover {
        background: var(--color-primary-50);
    }

    /* Only keep simple transitions, removing 3D transforms */
    button {
        transition: background-color 0.3s ease;
    }
</style>