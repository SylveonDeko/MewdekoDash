<!-- routes/commands/+page.svelte -->
<script lang="ts">
  import { createSearchStore, searchHandler } from "$lib/stores/commandSearch";
  import { onDestroy, onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import type { PageData } from "./$types";

  export let data: PageData;

  const searchStore = createSearchStore(data.modules);
  let mounted = false;
  let activeTabIndex = 0;
  let searchValue = "";
  let showShortcuts = false;
  let searchResultCount = 0;

  // Reactive variables for tab functionality
  $: filteredModules = searchValue.trim() ? $searchStore.filtered : data.modules;
  $: activeModule = filteredModules[activeTabIndex] || filteredModules[0];
  $: {
    // Update search result count
    if (searchValue.trim()) {
      searchResultCount = filteredModules.reduce((count, module) => {
        return count + (module.Commands ? module.Commands.length : 0);
      }, 0);
    } else {
      searchResultCount = data.modules.reduce((count, module) => {
        return count + (module.Commands ? module.Commands.length : 0);
      }, 0);
    }
  }

  // Update search store when search value changes
  $: if (searchValue !== $searchStore.search) {
    searchStore.update(store => ({ ...store, search: searchValue }));
  }

  // Reset active tab when search changes
  $: if (searchValue.trim()) {
    activeTabIndex = 0;
  }

  const unsubscribe = searchStore.subscribe((model) => searchHandler(model));

  // Keyboard navigation for tabs
  function handleTabKeydown(event: KeyboardEvent, index: number) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activeTabIndex = index;
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      activeTabIndex = index - 1;
      (event.target as HTMLElement).previousElementSibling?.focus();
    } else if (event.key === "ArrowRight" && index < filteredModules.length - 1) {
      event.preventDefault();
      activeTabIndex = index + 1;
      (event.target as HTMLElement).nextElementSibling?.focus();
    }
  }

  function capitalizeFirstLetter(string: string | undefined): string {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Keyboard shortcuts
  function handleGlobalKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault();
      document.getElementById("search")?.focus();
    }
    if (event.key === "Escape") {
      searchValue = "";
      document.getElementById("search")?.blur();
    }
  }

  function handleSearchFocus() {
    showShortcuts = true;
  }

  function handleSearchBlur() {
    setTimeout(() => showShortcuts = false, 100);
  }

  function clearSearch() {
    searchValue = "";
    activeTabIndex = 0;
  }

  onMount(() => {
    mounted = true;
  });

  onMount(() => {
    mounted = true;
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleGlobalKeydown);
    }
  });

  onDestroy(() => {
    unsubscribe();
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleGlobalKeydown);
    }
  });
</script>

<svelte:head>
  <title>Mewdeko - Commands</title>
  <meta content="Mewdeko - All the commands! Searchable!" property="og:title" />
  <meta
    content="Find out more about Mewdeko's commands and how to use them."
    name="description"
  />
  <meta
    content="Find out more about Mewdeko's commands and how to use them."
    property="og:description"
  />
  <meta
    content="Find out more about Mewdeko's commands and how to use them."
    name="twitter:description"
  />
</svelte:head>

<main
  class="min-h-screen"
  style="--color-primary: {$colorStore.primary};
         --color-secondary: {$colorStore.secondary};
         --color-accent: {$colorStore.accent};
         --color-text: {$colorStore.text};
         --color-muted: {$colorStore.muted};
         background: linear-gradient(135deg, {$colorStore.primary}15 0%, {$colorStore.secondary}10 100%);"
>
  <!-- Header and Search Section -->
  <div class="sticky top-0 z-50 backdrop-blur-lg border-b shadow-lg"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}15 0%, {$colorStore.gradientEnd}10 100%);
              border-color: {$colorStore.primary}30;">
    <div class="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1
            class="text-2xl lg:text-3xl font-bold mb-2"
            in:fade={{ duration: 300 }}
            style="color: {$colorStore.text};"
          >
            Command Reference
          </h1>
          <p class="text-sm lg:text-base opacity-80" style="color: {$colorStore.text};">
            Explore all available Mewdeko commands and modules
          </p>
        </div>
        <div class="flex-shrink-0 lg:max-w-md lg:w-full">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" style="color: {$colorStore.muted};"
                   viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2" />
              </svg>
            </div>
            <input
              aria-label="Search commands and modules"
              bind:value={searchValue}
              class="block w-full pl-12 pr-12 py-2 sm:py-3 rounded-xl transition-all duration-300 focus:ring-2 focus:outline-none backdrop-blur-sm"
              id="search"
              on:blur={handleSearchBlur}
              on:focus={handleSearchFocus}
              placeholder="Search modules or commands..."
              style="background: {$colorStore.primary}20;
                     color: {$colorStore.text};
                     border: 1px solid {$colorStore.primary}30;
                     --tw-ring-color: {$colorStore.accent};"
              type="search"
            />
            {#if searchValue}
              <button
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-sm transition-colors duration-200 hover:opacity-70"
                style="color: {$colorStore.muted};"
                on:click={clearSearch}
                aria-label="Clear search"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            {:else if showShortcuts}
              <div class="absolute inset-y-0 right-0 pr-4 flex items-center text-xs"
                   style="color: {$colorStore.muted};">
                <kbd class="px-2 py-1 rounded border"
                     style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;">Ctrl+K</kbd>
              </div>
            {/if}
          </div>

          <!-- Search results info -->
          {#if searchValue.trim()}
            <div class="mt-2 text-sm" style="color: {$colorStore.muted};" in:fade={{ duration: 200 }}>
              {#if searchResultCount > 0}
                Showing {searchResultCount} command{searchResultCount !== 1 ? 's' : ''} across {filteredModules.length}
                module{filteredModules.length !== 1 ? 's' : ''}
              {:else}
                No commands found for "{searchValue}"
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="flex-1 overflow-hidden">
    <div class="container mx-auto px-4 lg:px-6 h-full flex flex-col">
      {#if filteredModules.length === 0}
        <div class="flex items-center justify-center flex-1" in:fade={{ duration: 300 }}>
          <div class="text-center max-w-md">
            <div class="mb-6">
              <svg class="mx-auto h-20 w-20 mb-4" style="color: {$colorStore.muted};" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.529-.901-6.172-2.379C5.448 12.287 5.241 12 5 12H4a1 1 0 01-1-1V9a1 1 0 011-1h1c.241 0 .448-.287.828-.621C7.471 5.901 9.66 5 12 5s4.529.901 6.172 2.379c.38.334.587.621.828.621h1a1 1 0 011 1v2a1 1 0 01-1 1h-1c-.241 0-.448.287-.828.621z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold mb-3" style="color: {$colorStore.text};">
              No commands found
            </h3>
            <p class="text-lg mb-4" style="color: {$colorStore.muted};">
              No results for "{searchValue}"
            </p>
            <div class="space-y-2 text-sm" style="color: {$colorStore.muted};">
              <p>Try searching for:</p>
              <div class="flex flex-wrap gap-2 justify-center">
                <button
                  class="px-3 py-1 rounded-full transition-all hover:scale-105"
                  style="background: {$colorStore.primary}20; border: 1px solid {$colorStore.primary}30;"
                  on:click={() => searchValue = 'music'}
                >
                  music
                </button>
                <button
                  class="px-3 py-1 rounded-full transition-all hover:scale-105"
                  style="background: {$colorStore.primary}20; border: 1px solid {$colorStore.primary}30;"
                  on:click={() => searchValue = 'moderation'}
                >
                  moderation
                </button>
                <button
                  class="px-3 py-1 rounded-full transition-all hover:scale-105"
                  style="background: {$colorStore.primary}20; border: 1px solid {$colorStore.primary}30;"
                  on:click={() => searchValue = 'fun'}
                >
                  fun
                </button>
              </div>
            </div>
          </div>
        </div>
      {:else}
        <!-- Tab Navigation -->
        <div class="py-6">
          <!-- Mobile: Dropdown for module selection -->
          <div class="md:hidden mb-4">
            <label for="module-select" class="block text-sm font-medium mb-2" style="color: {$colorStore.muted};">Select
              Module:</label>
            <select
              id="module-select"
              class="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:ring-2 focus:outline-none backdrop-blur-sm"
              style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30; --tw-ring-color: {$colorStore.accent};"
              bind:value={activeTabIndex}
            >
              {#each filteredModules as module, index}
                <option value={index}>{capitalizeFirstLetter(module.Name)} ({module.Commands?.length || 0}commands)
                </option>
              {/each}
            </select>
          </div>

          <!-- Desktop: Horizontal tabs -->
          <div class="hidden md:block border-b" style="border-color: {$colorStore.primary}30;">
            <div
              class="-mb-px flex space-x-1 overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 pb-2"
              role="tablist"
              aria-label="Command modules"
              style="scrollbar-color: {$colorStore.primary}30 transparent;">
              {#each filteredModules as module, index}
                <button
                  class="tab-button group inline-flex items-center px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style="{index === activeTabIndex 
                    ? `border-color: ${$colorStore.primary}; color: ${$colorStore.text};` 
                    : `border-color: transparent; color: ${$colorStore.muted};`}
                    --tw-ring-color: {$colorStore.primary};
                    --tw-ring-offset-color: {$colorStore.primary};"
                  role="tab"
                  aria-selected={index === activeTabIndex}
                  aria-controls="tabpanel-{index}"
                  id="tab-{index}"
                  tabindex={index === activeTabIndex ? 0 : -1}
                  on:click={() => activeTabIndex = index}
                  on:keydown={(e) => handleTabKeydown(e, index)}
                >
                  <div
                    class="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center mr-2 text-xs font-bold group-hover:scale-110 transition-transform backdrop-blur-sm"
                    style="{index === activeTabIndex
                         ? `background: linear-gradient(135deg, ${$colorStore.gradientStart}40, ${$colorStore.gradientMid}50); color: ${$colorStore.text};` 
                         : `background: ${$colorStore.primary}20; color: ${$colorStore.text};`}">
                    {module.Name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span class="truncate">{capitalizeFirstLetter(module.Name)}</span>
                  <span class="ml-2 px-2 py-1 text-xs rounded-full"
                        style="{index === activeTabIndex 
                          ? `background: ${$colorStore.primary}30; color: ${$colorStore.text};` 
                          : `background: ${$colorStore.primary}15; color: ${$colorStore.muted};`}">
                    {module.Commands.length}
                  </span>
                </button>
              {/each}
            </div>
          </div>
        </div>

        <!-- Tab Content -->
        {#if activeModule}
          <div class="flex-1 overflow-auto">
            <div class="tab-content pb-8"
                 role="tabpanel"
                 aria-labelledby="tab-{activeTabIndex}"
                 id="tabpanel-{activeTabIndex}"
                 tabindex="0"
                 in:fade={{ duration: 200 }}>

              <!-- Module Header -->
              <div class="mb-6">
                <div class="flex items-center space-x-4 mb-4">
                  <div
                    class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm"
                    style="background: linear-gradient(135deg, {$colorStore.gradientStart}40, {$colorStore.gradientMid}50);
                              border: 1px solid {$colorStore.primary}30;">
                    <span class="text-xl font-bold text-white">
                      {activeModule.Name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 class="text-2xl font-bold mb-1" style="color: {$colorStore.text};">
                      {capitalizeFirstLetter(activeModule.Name)}
                    </h2>
                    <p class="text-sm opacity-80" style="color: {$colorStore.text};">
                      {activeModule.Commands.length} command{activeModule.Commands.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
              </div>

              <!-- Commands Grid -->
              <div class="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {#each activeModule.Commands as command, cmdIndex}
                  <article
                    class="command-card backdrop-blur-sm border rounded-xl p-4 transition-all duration-200 group focus-within:ring-2 overflow-hidden"
                    style="background: {$colorStore.primary}10;
                              border-color: {$colorStore.primary}20;
                              --tw-ring-color: {$colorStore.primary};"
                    in:fly={{ y: 20, duration: 300, delay: mounted ? cmdIndex * 30 : 0 }}>

                    <header class="mb-3">
                      <h3 class="text-lg font-semibold transition-colors" style="color: {$colorStore.text};">
                        {capitalizeFirstLetter(command.CommandName)}
                      </h3>
                    </header>

                    <div class="mb-4">
                      <div class="text-sm leading-relaxed prose prose-sm max-w-none overflow-x-auto"
                           style="color: {$colorStore.text}; opacity: 0.85;">
                        {@html command.Description}
                      </div>
                    </div>

                    <!-- Usage Examples -->
                    {#if command.Example && command.Example.length > 0}
                      <div class="mb-4">
                        <h4 class="text-xs font-semibold uppercase tracking-wide mb-2"
                            style="color: {$colorStore.muted};">
                          Usage Examples
                        </h4>
                        <div class="space-y-2">
                          {#each command.Example.slice(0, 2) as example}
                            <code
                              class="block text-xs p-2 border rounded-lg font-mono overflow-x-auto whitespace-pre-wrap break-all"
                              style="background: {$colorStore.primary}15;
                                         border-color: {$colorStore.primary}30;
                                         color: {$colorStore.text};">
                              {example}
                            </code>
                          {/each}
                          {#if command.Example.length > 2}
                            <p class="text-xs" style="color: {$colorStore.muted};">
                              +{command.Example.length - 2} more example{command.Example.length - 2 !== 1 ? 's' : ''}
                            </p>
                          {/if}
                        </div>
                      </div>
                    {/if}

                    <!-- Additional Info -->
                    <footer class="flex flex-wrap gap-2 mt-auto">
                      {#if command.BotVersion && command.BotVersion.length > 0 && command.BotVersion.at(0) !== ""}
                        <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md"
                              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">
                          <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          {command.BotVersion}
                        </span>
                      {/if}

                      {#if command.GuildUserPermissions || command.ChannelUserPermissions || command.GuildBotPermissions || command.ChannelBotPermissions}
                        <details class="group/perms">
                          <summary
                            class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md cursor-pointer transition-all backdrop-blur-sm"
                            style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}25);
                                          color: {$colorStore.text};
                                          border: 1px solid {$colorStore.primary}30;">
                            <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Permissions
                            <svg class="w-3 h-3 ml-1 transform transition-transform group-open/perms:rotate-180"
                                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7" />
                            </svg>
                          </summary>
                          <div class="mt-2 p-2 rounded-lg text-xs space-y-1"
                               style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                            {#if command.GuildUserPermissions}
                              <div>
                                <span class="font-semibold" style="color: {$colorStore.text};">User (Server):</span>
                                <span
                                  style="color: {$colorStore.text}; opacity: 0.8;"> {command.GuildUserPermissions}</span>
                              </div>
                            {/if}
                            {#if command.ChannelUserPermissions}
                              <div>
                                <span class="font-semibold" style="color: {$colorStore.text};">User (Channel):</span>
                                <span
                                  style="color: {$colorStore.text}; opacity: 0.8;"> {command.ChannelUserPermissions}</span>
                              </div>
                            {/if}
                            {#if command.GuildBotPermissions}
                              <div>
                                <span class="font-semibold" style="color: {$colorStore.text};">Bot (Server):</span>
                                <span
                                  style="color: {$colorStore.text}; opacity: 0.8;"> {command.GuildBotPermissions}</span>
                              </div>
                            {/if}
                            {#if command.ChannelBotPermissions}
                              <div>
                                <span class="font-semibold" style="color: {$colorStore.text};">Bot (Channel):</span>
                                <span
                                  style="color: {$colorStore.text}; opacity: 0.8;"> {command.ChannelBotPermissions}</span>
                              </div>
                            {/if}
                          </div>
                        </details>
                      {/if}

                      {#if command.ListOptions && command.ListOptions.length > 0 && command.ListOptions.at(0) !== ""}
                        <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md"
                              style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                                     color: {$colorStore.text};
                                     border: 1px solid {$colorStore.primary}20;"
                              title="Has selectable options">
                          <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Options Available
                        </span>
                      {/if}
                    </footer>
                  </article>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</main>

<style lang="postcss">
    :global(body) {
        color: var(--color-text);
        background: var(--color-primary);
    }

    /* Scrollbar styling */
    :global(.scrollbar-thin) {
        scrollbar-width: thin;
    }

    :global(.scrollbar-track-transparent) {
        scrollbar-color: transparent transparent;
    }

    :global(.scrollbar-thumb-white\/20) {
        scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
    }

    :global(*::-webkit-scrollbar) {
        @apply h-2 w-2;
    }

    :global(*::-webkit-scrollbar-track) {
        background: transparent;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background: rgba(255, 255, 255, 0.2);
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb:hover) {
        background: rgba(255, 255, 255, 0.3);
    }

    /* Tab focus indicators */
    .tab-button:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }

    .tab-button:not([aria-selected="true"]):hover {
        color: var(--color-text);
        border-color: var(--color-primary);
        opacity: 0.8;
    }

    /* Command card enhancements */
    .command-card {
        @apply transition-all duration-200;
    }

    .command-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        background: var(--color-primary, rgba(255, 255, 255, 0.15));
        border-color: var(--color-primary, rgba(255, 255, 255, 0.3));
    }

    /* Improved prose styling for dynamic theme */
    :global(.prose code) {
        background: var(--color-primary, rgba(255, 255, 255, 0.1));
        color: var(--color-text);
        opacity: 0.9;
        @apply px-1 py-0.5 rounded;
    }

    :global(.prose strong) {
        color: var(--color-text);
        font-weight: 600;
    }

    /* Enhanced accessibility for screen readers */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }

    /* High contrast mode support */
    @media (prefers-contrast: more) {
        .command-card {
            @apply border-2 border-white;
        }

        .tab-button[aria-selected="true"] {
            @apply bg-white text-black;
        }
    }

    /* Focus management for tab panels */
    .tab-content:focus {
        @apply outline-none;
    }
</style>