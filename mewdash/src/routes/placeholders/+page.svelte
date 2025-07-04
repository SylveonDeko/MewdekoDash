<!-- routes/placeholders/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";

  let mounted = false;
  let searchQuery = "";
  let selectedCategory = "all";
  let copiedPlaceholder = "";
  let showCopyFeedback = false;

  // Placeholder data structure
  const placeholderCategories = [
    {
      id: "afk",
      name: "AFK",
      description: "Placeholders for AFK functionality",
      placeholders: [
        { code: "%afk.message%", description: "The users afk message" },
        { code: "%afk.user%", description: "The users name and discriminator" },
        { code: "%afk.user.mention%", description: "The mention of the afk user" },
        { code: "%afk.user.avatar%", description: "The avatar url of the user" },
        { code: "%afk.user.id%", description: "The id of the afk user" },
        { code: "%afk.triggeruser%", description: "The trigger users username and discriminator" },
        { code: "%afk.triggeruser.avatar%", description: "The trigger users avatar" },
        { code: "%afk.triggeruser.mention%", description: "The mention of the trigger user" },
        { code: "%afk.triggeruser.id%", description: "The id of the trigger user" },
        { code: "%afk.time%", description: "How long the user has been afk" }
      ]
    },
    {
      id: "suggest",
      name: "Suggestions",
      description: "Placeholders for suggestion system",
      placeholders: [
        { code: "%suggest.user%", description: "The full username of the user who's suggestion got updated" },
        { code: "%suggest.user.id%", description: "The Id of the user who's suggestion got updated" },
        { code: "%suggest.message%", description: "The original suggestion" },
        { code: "%suggest.number%", description: "The suggestion number that was updated" },
        { code: "%suggest.user.name%", description: "The name of the user who's suggestion got updated" },
        { code: "%suggest.user.avatar%", description: "The avatar of the original suggester" },
        { code: "%suggest.mod.user%", description: "The full username of the one who updated the suggestion" },
        { code: "%suggest.mod.avatar%", description: "The pfp of the one who updated the suggestion" },
        { code: "%suggest.mod.name%", description: "The name of the person who updated the suggestion" },
        { code: "%suggest.mod.message%", description: "The reason the suggestion was updated" }
      ]
    },
    {
      id: "user",
      name: "User",
      description: "User-related placeholders",
      placeholders: [
        { code: "%user%", description: "Username of the user" },
        { code: "%user.mention%", description: "Mention the user" },
        { code: "%user.id%", description: "User ID" },
        { code: "%user.avatar%", description: "User's avatar URL" },
        { code: "%user.name%", description: "User's display name" },
        { code: "%user.nick%", description: "User's nickname in the server" }
      ]
    },
    {
      id: "server",
      name: "Server",
      description: "Server-related placeholders",
      placeholders: [
        { code: "%server%", description: "Server name" },
        { code: "%server.id%", description: "Server ID" },
        { code: "%server.members%", description: "Number of server members" },
        { code: "%server.owner%", description: "Server owner username" },
        { code: "%server.icon%", description: "Server icon URL" }
      ]
    },
    {
      id: "random",
      name: "Random",
      description: "Random generation placeholders",
      placeholders: [
        { code: "%rng%", description: "Random number" },
        { code: "%rng(1,10)%", description: "Random number between 1 and 10" },
        { code: "%choose(a|b|c)%", description: "Choose randomly from options" },
        { code: "%target%", description: "Returns anything the user has written after the trigger" },
        { code: "%img:stuff%", description: "Returns an imgur.com search for 'stuff' (custom reactions only)" }
      ]
    }
  ];

  $: filteredCategories = placeholderCategories.map(category => ({
    ...category,
    placeholders: category.placeholders.filter(placeholder =>
      searchQuery.trim() === "" ||
      placeholder.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      placeholder.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category =>
    selectedCategory === "all" ||
    category.id === selectedCategory ||
    category.placeholders.length > 0
  );

  $: totalResults = filteredCategories.reduce((sum, cat) => sum + cat.placeholders.length, 0);

  function copyToClipboard(placeholder: string) {
    navigator.clipboard.writeText(placeholder).then(() => {
      copiedPlaceholder = placeholder;
      showCopyFeedback = true;
      setTimeout(() => {
        showCopyFeedback = false;
        copiedPlaceholder = "";
      }, 2000);
    });
  }

  function handleGlobalKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault();
      document.getElementById("search-placeholders")?.focus();
    }
  }

  onMount(() => {
    mounted = true;
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleGlobalKeydown);
    }
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleGlobalKeydown);
    }
  });
</script>

<svelte:head>
  <title>Mewdeko - Placeholders for commands with embeds!</title>
  <meta
    content="Mewdeko - Placeholders for commands with embeds!"
    property="og:title"
  />
  <meta content="Placeholders for commands with embeds!" name="description" />
  <meta
    content="Placeholders for commands with embeds!"
    property="og:description"
  />
  <meta
    content="Placeholders for commands with embeds!"
    name="twitter:description"
  />
</svelte:head>

{#if mounted}
  <main
    class="min-h-screen"
    style="--color-primary: {$colorStore.primary};
           --color-secondary: {$colorStore.secondary};
           --color-accent: {$colorStore.accent};
           --color-text: {$colorStore.text};
           --color-muted: {$colorStore.muted};
           background: linear-gradient(135deg, {$colorStore.primary}08 0%, {$colorStore.secondary}05 100%);"
    in:fade
  >
    <!-- Header Section -->
    <div class="sticky top-0 z-50 backdrop-blur-lg border-b shadow-lg"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}15 0%, {$colorStore.gradientEnd}10 100%); border-color: {$colorStore.primary}30;">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 class="text-3xl lg:text-4xl font-bold mb-2" style="color: {$colorStore.text};">
              Placeholders Reference
            </h1>
            <p class="text-lg" style="color: {$colorStore.muted};">
              Dynamic content for your embeds, messages, and commands
            </p>
          </div>

          <!-- Search and Filter -->
          <div class="flex-shrink-0 lg:max-w-md lg:w-full space-y-4">
            <!-- Search Bar -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5" style="color: {$colorStore.muted};" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                id="search-placeholders"
                placeholder="Search placeholders..."
                class="block w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-300 focus:ring-2 focus:outline-none backdrop-blur-sm"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30; --tw-ring-color: {$colorStore.accent};"
                bind:value={searchQuery}
                aria-label="Search placeholders"
              />
              {#if searchQuery}
                <button
                  class="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors duration-200 hover:opacity-70"
                  style="color: {$colorStore.muted};"
                  on:click={() => searchQuery = ''}
                  aria-label="Clear search"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              {/if}
            </div>

            <!-- Category Filter -->
            <select
              class="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:ring-2 focus:outline-none backdrop-blur-sm"
              style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30; --tw-ring-color: {$colorStore.accent};"
              bind:value={selectedCategory}
            >
              <option value="all">All Categories</option>
              {#each placeholderCategories as category}
                <option value={category.id}>{category.name}</option>
              {/each}
            </select>

            <!-- Search Results Info -->
            {#if searchQuery || selectedCategory !== 'all'}
              <div class="text-sm" style="color: {$colorStore.muted};" in:fade={{ duration: 200 }}>
                {totalResults} placeholder{totalResults !== 1 ? 's' : ''} found
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Introduction -->
      <div class="max-w-4xl mx-auto mb-12">
        <div class="rounded-2xl p-6 backdrop-blur-sm"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}20;">
          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                   style="background: {$colorStore.primary}20;">
                <span class="text-2xl">💬</span>
              </div>
              <h3 class="font-semibold mb-2" style="color: {$colorStore.text};">Messages & Greets</h3>
              <p class="text-sm" style="color: {$colorStore.muted};">Use in welcome messages, custom reactions, and chat
                triggers</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                   style="background: {$colorStore.primary}20;">
                <span class="text-2xl">📋</span>
              </div>
              <h3 class="font-semibold mb-2" style="color: {$colorStore.text};">Embeds</h3>
              <p class="text-sm" style="color: {$colorStore.muted};">Perfect for rich embeds and formatted content</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                   style="background: {$colorStore.primary}20;">
                <span class="text-2xl">🎲</span>
              </div>
              <h3 class="font-semibold mb-2" style="color: {$colorStore.text};">Dynamic Content</h3>
              <p class="text-sm" style="color: {$colorStore.muted};">Generate random content and user-specific
                information</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Important Note -->
      <div class="max-w-4xl mx-auto mb-8">
        <div class="rounded-xl p-4 backdrop-blur-sm"
             style="background: linear-gradient(135deg, #F59E0B20, #D9770630); border: 1px solid #F59E0B40;">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold mb-1" style="color: {$colorStore.text};">Important Note</h3>
              <p style="color: {$colorStore.text};">When using placeholders in embeds, avoid %user.mention% and
                %bot.mention% in titles, footers, and field names as they won't display properly.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Placeholder Categories -->
      <div class="max-w-6xl mx-auto">
        {#if totalResults === 0}
          <div class="text-center py-16" in:fade={{ duration: 300 }}>
            <div class="mb-6">
              <svg class="mx-auto h-16 w-16" style="color: {$colorStore.muted};" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.529-.901-6.172-2.379C5.448 12.287 5.241 12 5 12H4a1 1 0 01-1-1V9a1 1 0 011-1h1c.241 0 .448-.287.828-.621C7.471 5.901 9.66 5 12 5s4.529.901 6.172 2.379c.38.334.587.621.828.621h1a1 1 0 011 1v2a1 1 0 01-1 1h-1c-.241 0-.448.287-.828.621z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold mb-3" style="color: {$colorStore.text};">
              No placeholders found
            </h3>
            <p class="text-lg mb-4" style="color: {$colorStore.muted};">
              No results for "{searchQuery}"
            </p>
            <button
              class="px-4 py-2 rounded-xl transition-all hover:scale-105"
              style="background: {$colorStore.primary}20; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
              on:click={() => { searchQuery = ''; selectedCategory = 'all'; }}
            >
              Clear filters
            </button>
          </div>
        {:else}
          <div class="space-y-8">
            {#each filteredCategories as category, categoryIndex}
              {#if category.placeholders.length > 0}
                <div class="category-section" in:fly={{ y: 20, duration: 300, delay: categoryIndex * 100 }}>
                  <div class="mb-6">
                    <h2 class="text-2xl font-bold mb-2" style="color: {$colorStore.text};">
                      {category.name} Placeholders
                    </h2>
                    <p class="text-lg" style="color: {$colorStore.muted};">
                      {category.description}
                    </p>
                  </div>

                  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {#each category.placeholders as placeholder, placeholderIndex}
                      <div
                        class="placeholder-card group rounded-xl p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                        style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12); border: 1px solid {$colorStore.primary}20;"
                        in:fly={{ y: 10, duration: 200, delay: placeholderIndex * 50 }}
                        on:click={() => copyToClipboard(placeholder.code)}
                        tabindex="0"
                        role="button"
                        aria-label="Copy {placeholder.code} to clipboard"
                        on:keydown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            copyToClipboard(placeholder.code);
                          }
                        }}
                      >
                        <div class="flex items-start justify-between mb-3">
                          <code
                            class="text-sm font-mono px-3 py-2 rounded-lg flex-1 mr-3 transition-all duration-300 group-hover:scale-105"
                            style="background: {$colorStore.primary}15; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}25;"
                          >
                            {placeholder.code}
                          </code>
                          <button
                            class="flex-shrink-0 p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;"
                            on:click|stopPropagation={() => copyToClipboard(placeholder.code)}
                            aria-label="Copy to clipboard"
                          >
                            {#if copiedPlaceholder === placeholder.code && showCopyFeedback}
                              <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M5 13l4 4L19 7" />
                              </svg>
                            {:else}
                              <svg class="w-4 h-4" style="color: {$colorStore.text};" fill="none" viewBox="0 0 24 24"
                                   stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            {/if}
                          </button>
                        </div>
                        <p class="text-sm leading-relaxed" style="color: {$colorStore.muted};">
                          {placeholder.description}
                        </p>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </main>
{/if}

<style>
    /* Placeholder card hover effects */
    .placeholder-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .placeholder-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .placeholder-card:focus {
        outline: 2px solid var(--color-accent);
        outline-offset: 2px;
    }

    /* Copy feedback animation */
    @keyframes copy-success {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }

    .placeholder-card:active {
        animation: copy-success 0.2s ease-in-out;
    }

    /* Category section animations */
    .category-section {
        scroll-margin-top: 120px;
    }

    /* Code styling */
    code {
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
        font-variant-ligatures: none;
        word-break: break-all;
    }

    /* Responsive improvements */
    @media (max-width: 768px) {
        .placeholder-card {
            margin-bottom: 1rem;
        }

        .placeholder-card code {
            font-size: 0.75rem;
            word-break: break-all;
        }
    }

    /* Accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
        .placeholder-card,
        .placeholder-card:hover {
            transition: none;
            transform: none;
        }
  }

    /* High contrast mode */
    @media (prefers-contrast: more) {
        .placeholder-card {
            border-width: 2px;
        }

        .placeholder-card code {
            border-width: 2px;
        }
  }
</style>