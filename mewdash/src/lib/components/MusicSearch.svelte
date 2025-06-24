<!--
@component
A modal music search component for finding and adding tracks to the music queue.

- Supports multiple platforms (YouTube, Spotify, SoundCloud)
- Provides real-time search with debouncing
- Shows track details including duration and artwork
- Integrates with the music player's dynamic color scheme
- Handles adding tracks to the queue with user feedback

@example
```svelte
<MusicSearch 
  bind:isOpen={searchModalOpen}
  colors={musicPlayerColors}
  currentUser={user}
  on:close={handleSearchClose}
/>
```
-->
<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { ExternalLink, Loader, Music, Plus, Search, X } from "lucide-svelte";
  import { api } from "$lib/api";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { fade, fly } from "svelte/transition";
  import { logger } from "$lib/logger";
  import type { Requester } from "$lib/types/music.ts";

  export let colors: {
    background: string;
    foreground: string;
    accent: string;
    text: string;
    gradientStart: string;
    gradientEnd: string;
    controlsHighlight: string;
  };
  export let isOpen = false;
  export let currentUser: Requester;

  const dispatch = createEventDispatcher();

  let searchQuery = "";
  let searchResults: Array<{
    title: string;
    author: string;
    duration: string;
    uri: string;
    artworkUri: string;
    provider: string;
  }> = [];
  let isSearching = false;
  let errorMessage = "";
  let selectedPlatform = "youtube";
  let debounceTimeout: NodeJS.Timeout | null = null;
  let isAdding = false;
  let addedTrackMessage = "";
  let searchInputElement: HTMLInputElement;
  let searchRetryCount = 0;
  let addRetryCount = 0;
  let lastSearchQuery = "";

  const MAX_RETRIES = 3;

  // Platform options
  const platforms = [
    { id: "youtube", name: "YouTube", icon: "🎬" },
    { id: "spotify", name: "Spotify", icon: "🟢" },
    { id: "soundcloud", name: "SoundCloud", icon: "🔊" }
  ];

  onMount(() => {
    if (isOpen && searchInputElement) {
      searchInputElement.focus();
    }
  });

  function close(): void {
    isOpen = false;
    searchQuery = "";
    searchResults = [];
    errorMessage = "";
    dispatch("close");
  }

  // Debounced search function
  function handleSearch(): void {
    errorMessage = "";
    searchRetryCount = 0; // Reset retry count for new search

    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (!searchQuery.trim()) {
      searchResults = [];
      isSearching = false;
      return;
    }

    lastSearchQuery = searchQuery;

    // Debounce the search
    debounceTimeout = setTimeout(() => {
      performSearch();
    }, 500);
  }

  // Perform the actual search with retry logic
  async function performSearch(): Promise<void> {
    isSearching = true;

    try {
      // If it looks like a URL, don't modify it
      const isUrl = lastSearchQuery.startsWith("http") || lastSearchQuery.includes("youtu.be/");

      let response;
      if (isUrl) {
        response = await api.extractTrack($currentGuild!.id, lastSearchQuery);
        searchResults = response ? [response] : [];
      } else {
        const query = `${lastSearchQuery}${selectedPlatform === "spotify" ? " spotify" : ""}`;
        const apiResponse = await api.searchTracks($currentGuild!.id, query, selectedPlatform, 10);
        searchResults = apiResponse.tracks || [];
      }

      if (searchResults.length === 0) {
        errorMessage = "No results found. Try a different search term or platform.";
      }

      // Reset retry count on success
      searchRetryCount = 0;

    } catch (err) {
      logger.error("Search error:", err);

      // Classify error type
      const isNetworkError = err instanceof TypeError || (err as any)?.message?.includes("fetch");
      const isServerError = (err as any)?.status >= 500;

      if ((isNetworkError || isServerError) && searchRetryCount < MAX_RETRIES) {
        searchRetryCount++;
        errorMessage = `Search failed. Retrying... (${searchRetryCount}/${MAX_RETRIES})`;

        // Exponential backoff
        const delay = Math.pow(2, searchRetryCount - 1) * 1000;
        setTimeout(() => {
          if (lastSearchQuery === searchQuery) { // Only retry if query hasn't changed
            performSearch();
          }
        }, delay);
      } else {
        // Max retries reached or non-retryable error
        if (searchRetryCount >= MAX_RETRIES) {
          errorMessage = "Search failed after multiple attempts. Please check your connection and try again.";
        } else {
          errorMessage = "Search failed. Please try a different search term.";
        }
        searchResults = [];
      }
    } finally {
      if (searchRetryCount === 0) {
        isSearching = false;
      }
    }
  }

  // Retry search function
  function retrySearch(): void {
    searchRetryCount = 0;
    errorMessage = "";
    performSearch();
  }

  async function addToQueue(track: any) {
    if (isAdding || !$currentGuild?.id) return;

    addRetryCount = 0;
    await performAddToQueue(track);
  }

  async function performAddToQueue(track: any): Promise<void> {
    isAdding = true;
    const trackIndex = searchResults.indexOf(track);

    try {
      const playRequest = {
        url: track.uri || track.url,
        requester: {
          Id: currentUser?.Id || BigInt("0"),
          Username: currentUser?.Username || "Unknown",
          AvatarUrl: currentUser?.AvatarUrl || ""
        }
      };

      await api.playTrack($currentGuild!.id, playRequest);

      // Update UI to show the track was added
      addedTrackMessage = `Added "${track.title}" to queue`;
      setTimeout(() => {
        addedTrackMessage = "";
      }, 3000);

      // Remove the track from search results to prevent duplicate adds
      searchResults = [
        ...searchResults.slice(0, trackIndex),
        ...searchResults.slice(trackIndex + 1)
      ];

      // Dispatch an event to notify parent component
      dispatch("trackAdded", { track });

      // Reset retry count on success
      addRetryCount = 0;

    } catch (err) {
      logger.error("Failed to add track:", err);

      // Classify error type
      const isNetworkError = err instanceof TypeError || (err as any)?.message?.includes("fetch");
      const isServerError = (err as any)?.status >= 500;

      if ((isNetworkError || isServerError) && addRetryCount < MAX_RETRIES) {
        addRetryCount++;
        errorMessage = `Failed to add track. Retrying... (${addRetryCount}/${MAX_RETRIES})`;

        // Exponential backoff
        const delay = Math.pow(2, addRetryCount - 1) * 1000;
        setTimeout(() => {
          performAddToQueue(track);
        }, delay);
      } else {
        // Max retries reached or non-retryable error
        if (addRetryCount >= MAX_RETRIES) {
          errorMessage = `Failed to add "${track.title}" after multiple attempts. Please try again later.`;
        } else {
          errorMessage = `Failed to add "${track.title}". Please try again.`;
        }
      }
    } finally {
      if (addRetryCount === 0) {
        isAdding = false;
      }
    }
  }

  // Retry add to queue function

  function getFormattedDuration(duration: any) {
    if (!duration) return "??:??";

    const parts = duration.split(":");
    if (parts.length === 3) {
      // Format hh:mm:ss to mm:ss if hours is 0
      const hours = parseInt(parts[0]);
      if (hours === 0) {
        return `${parts[1]}:${parts[2]}`;
      }
    }
    return duration;
  }

  // Listen for Enter key in search box
  function handleKeydown(event: any) {
    if (event.key === "Escape") {
      close();
    } else if (event.key === "Enter" && searchResults.length > 0) {
      // Add the top result
      addToQueue(searchResults[0]);
    }
  }

  $: if (isOpen && searchInputElement) {
    setTimeout(() => searchInputElement?.focus(), 100);
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30 flex items-center justify-center p-0 sm:p-4"
    transition:fade={{ duration: 200 }}
    on:click={close}
    on:keydown={(e) => e.key === 'Escape' && close()}
    role="button"
    tabindex="0"
    aria-label="Close music search dialog"
  >
    <div
      class="w-full h-full sm:h-auto sm:max-w-2xl bg-gray-800 sm:rounded-xl shadow-2xl overflow-hidden"
      transition:fly={{ y: 20, duration: 200 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="music-search-title"
      style="background: linear-gradient(135deg, {colors.gradientStart}80, {colors.gradientEnd}80);
           border: 1px solid {colors.foreground}40;"
      on:click|stopPropagation
    >
      <!-- Header with search box -->
      <div class="p-4 border-b" style="border-color: {colors.foreground}20;">
        <div class="flex items-center justify-between mb-2">
          <h2 id="music-search-title" class="text-xl font-bold" style="color: {colors.text};">
            Add Music
          </h2>
          <button
            class="p-2 rounded-full hover:bg-black hover:bg-opacity-20 transition-colors focus:outline-none focus:ring-2"
            on:click={close}
            aria-label="Close search"
            style="color: {colors.text}; --ring-color: {colors.accent};"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Search input -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="w-5 h-5" style="color: {colors.foreground}80;" />
          </div>
          <input
            bind:this={searchInputElement}
            bind:value={searchQuery}
            on:input={handleSearch}
            on:keydown={handleKeydown}
            type="text"
            placeholder="Search for songs, artists, or paste a link..."
            class="w-full py-2 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2"
            style="background: {colors.foreground}20; color: {colors.text}; --ring-color: {colors.accent};"
          />
        </div>

        <!-- Platform selector -->
        <div class="flex gap-3 sm:gap-2 mt-3 sm:mt-2 overflow-x-auto py-1 no-scrollbar">
          {#each platforms as platform}
            <button
              class="px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 sm:gap-1 flex-shrink-0 hover:scale-105 active:scale-95"
              class:active-platform={selectedPlatform === platform.id}
              on:click={() => {
              selectedPlatform = platform.id;
              if (searchQuery) handleSearch();
            }}
              style="
              background: {selectedPlatform === platform.id ? colors.accent : colors.foreground + '20'};
              color: {selectedPlatform === platform.id ? 'white' : colors.text};
              border: 2px solid {selectedPlatform === platform.id ? colors.accent : 'transparent'};
            "
            >
              <span class="text-base sm:text-sm">{platform.icon}</span>
              <span class="text-sm sm:text-xs">{platform.name}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Results area -->
      <div
        class="flex-1 overflow-y-auto p-3 sm:p-2 sm:max-h-[50vh]"
        style="scrollbar-gutter: stable; color: {colors.text};"
      >
        {#if addedTrackMessage}
          <div
            class="bg-green-500 bg-opacity-20 text-green-400 px-4 py-2 rounded-lg mb-2 animate-fadeout"
            transition:fly={{ y: -10, duration: 200 }}
          >
            {addedTrackMessage}
          </div>
        {/if}

        {#if errorMessage}
          <div
            class="bg-red-500 bg-opacity-20 text-red-400 px-4 py-2 rounded-lg"
            transition:fly={{ y: -10, duration: 200 }}
            role="alert"
          >
            <div class="flex items-center justify-between">
              <span class="flex-1">{errorMessage}</span>
              {#if searchRetryCount === 0 && addRetryCount === 0 && !isSearching && !isAdding}
                <button
                  class="ml-3 px-3 py-1 text-sm rounded transition-colors"
                  style="background: {colors.accent}30; color: {colors.text};"
                  on:click={retrySearch}
                  aria-label="Retry search"
                >
                  Retry
                </button>
              {/if}
            </div>
          </div>
        {/if}

        {#if isSearching}
          <div class="flex justify-center items-center py-8">
            <Loader class="w-8 h-8 animate-spin" style="color: {colors.accent}" aria-hidden="true" />
            <span class="ml-2">
              {#if searchRetryCount > 0}
                Retrying search... ({searchRetryCount}/{MAX_RETRIES})
              {:else}
                Searching...
              {/if}
            </span>
          </div>
        {:else if searchResults.length > 0}
          <div class="space-y-3 sm:space-y-2">
            {#each searchResults as track, i}
              <div
                class="flex items-center gap-4 sm:gap-3 p-4 sm:p-3 rounded-xl sm:rounded-lg transition-all duration-200 hover:scale-[1.01] cursor-pointer group active:scale-[0.98]"
                style="background: {colors.foreground}15; min-height: 80px;"
                on:click={() => addToQueue(track)}
                role="button"
                tabindex="0"
                on:keydown={(e) => e.key === 'Enter' && addToQueue(track)}
                aria-label="Add {track.title} to queue"
              >
                <!-- Thumbnail with hover overlay -->
                <div class="relative flex-shrink-0">
                  <img
                    src={track.artworkUri || "/default-album.png"}
                    alt="{track.title} thumbnail"
                    class="w-16 h-16 sm:w-12 sm:h-12 object-cover rounded-lg sm:rounded-md shadow-md"
                    loading="lazy"
                  />
                  <div
                    class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg sm:rounded-md"
                    style="background: rgba(0,0,0,0.6);"
                  >
                    <Plus class="w-8 h-8 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
                  </div>

                  <!-- Platform indicator -->
                  <div
                    class="absolute -top-1 -right-1 w-5 h-5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-xs"
                    style="background: {colors.accent};">
                    {#if track.uri && track.uri.includes('spotify')}
                      🟢
                    {:else if track.uri && track.uri.includes('youtube')}
                      🎬
                    {:else if track.uri && track.uri.includes('soundcloud')}
                      🔊
                    {:else}
                      🎵
                    {/if}
                  </div>
                </div>

                <!-- Track info -->
                <div class="flex-grow min-w-0">
                  <h3 class="font-semibold text-base sm:text-sm truncate mb-1 sm:mb-0" style="color: {colors.text};">
                    {track.title}
                  </h3>
                  <p class="text-sm sm:text-xs truncate opacity-80 mb-1 sm:mb-0" style="color: {colors.text};">
                    {track.author}
                  </p>

                  <!-- Duration and external link on mobile -->
                  <div class="flex items-center gap-2 mt-2 sm:hidden">
                    <span class="text-xs opacity-70 px-2 py-1 rounded-full" style="background: {colors.foreground}20;">
                      {getFormattedDuration(track.duration)}
                    </span>
                    {#if track.uri}
                      <a
                        href={track.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="p-1.5 rounded-full transition-colors"
                        style="background: {colors.accent}20; color: {colors.accent};"
                        on:click|stopPropagation
                        aria-label="Open in {track.provider || 'original source'}"
                      >
                        <ExternalLink class="w-4 h-4" />
                      </a>
                    {/if}
                  </div>
                </div>

                <!-- Desktop duration and actions -->
                <div class="hidden sm:flex items-center gap-2 flex-shrink-0">
                  <span class="text-xs opacity-70">{getFormattedDuration(track.duration)}</span>
                  {#if track.uri}
                    <a
                      href={track.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="p-1 rounded-full hover:bg-black hover:bg-opacity-20"
                      on:click|stopPropagation
                      aria-label="Open in {track.provider || 'original source'}"
                    >
                      <ExternalLink class="w-3 h-3 opacity-70" />
                    </a>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {:else if searchQuery.trim()}
          <div class="py-12 sm:py-8 text-center px-4">
            <Music class="w-16 h-16 sm:w-12 sm:h-12 mx-auto mb-4 sm:mb-2 opacity-50" style="color: {colors.accent};" />
            <p class="text-lg sm:text-base mb-2" style="color: {colors.text};">No results found</p>
            <p class="text-sm opacity-70" style="color: {colors.text};">Try different keywords or check your
              spelling</p>
          </div>
        {:else}
          <div class="py-12 sm:py-8 text-center px-4">
            <Music class="w-16 h-16 sm:w-12 sm:h-12 mx-auto mb-4 sm:mb-2 opacity-50" style="color: {colors.accent};" />
            <p class="text-lg sm:text-base mb-2" style="color: {colors.text};">Search for music</p>
            <p class="text-sm opacity-70 mb-4" style="color: {colors.text};">Type artist name, song title or paste a
              link</p>
            <div class="text-xs opacity-60 space-y-1" style="color: {colors.text};">
              <p>💡 Tip: You can paste direct links from:</p>
              <p>🎬 YouTube • 🟢 Spotify • 🔊 SoundCloud</p>
            </div>
          </div>
        {/if}
      </div>

      <!-- Footer with tips -->
      <div
        class="p-4 sm:p-3 text-xs border-t flex items-center justify-between"
        style="border-color: {colors.foreground}20; color: {colors.text}80;"
      >
        <div class="flex-1">
          <p class="hidden sm:block">Tip: Press Enter to add the top result to queue</p>
          <p class="sm:hidden">Tap any result to add to queue</p>
        </div>
        {#if searchResults.length > 0}
          <div class="text-xs font-medium px-2 py-1 rounded-full"
               style="background: {colors.accent}20; color: {colors.accent};">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
    .no-scrollbar {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }

    .animate-fadeout {
        animation: fadeout 3s forwards;
    }

    @keyframes fadeout {
        0% {
            opacity: 1;
        }
        70% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }
</style>