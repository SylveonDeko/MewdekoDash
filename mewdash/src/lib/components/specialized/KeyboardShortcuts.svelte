<!-- lib/components/KeyboardShortcuts.svelte -->
<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { onDestroy, onMount } from "svelte";
  import { browser } from "$app/environment";
  import { X } from "lucide-svelte";

  // Keyboard shortcuts
  const shortcuts = [
    {
      key: "?",
      description: "Show/hide keyboard shortcuts",
      context: "Global"
    },
    {
      key: "⌘K",
      description: "Quick server switch",
      context: "Global"
    },
    {
      key: "⌘/",
      description: "Focus search",
      context: "Global"
    },
    {
      key: "Esc",
      description: "Close popups/dialogs",
      context: "Global"
    },
    {
      key: "R",
      description: "Refresh current data",
      context: "Dashboard"
    },
    {
      key: "M",
      description: "Go to music player",
      context: "Dashboard"
    },
    {
      key: "H",
      description: "Go to dashboard home",
      context: "Dashboard"
    },
    {
      key: "S",
      description: "Go to settings",
      context: "Dashboard"
    },
    {
      key: "Space",
      description: "Play/pause music",
      context: "Music"
    },
    {
      key: "←/→",
      description: "Skip backward/forward",
      context: "Music"
    }
  ];

  // State
  let isVisible = false;
  let activeContext = "Global";

  // Contexts extracted from shortcuts
  $: contexts = [...new Set(shortcuts.map(s => s.context))];
  $: filteredShortcuts = shortcuts.filter(s =>
    activeContext === "All" || s.context === activeContext
  );

  // Toggle the shortcuts dialog
  function toggleShortcuts() {
    isVisible = !isVisible;
  }

  // Close the dialog
  function closeDialog() {
    isVisible = false;
  }

  // Set context filter
  function setContext(context: string) {
    activeContext = context;
  }

  // Handle keyboard events
  function handleKeydown(event: KeyboardEvent) {
    // Question mark to toggle shortcuts
    if (event.key === "?" && !event.ctrlKey && !event.metaKey) {
      toggleShortcuts();
      event.preventDefault();
    }

    // Escape to close
    if (event.key === "Escape" && isVisible) {
      closeDialog();
    }
  }

  onMount(() => {
    if (browser) {
      window.addEventListener("keydown", handleKeydown);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener("keydown", handleKeydown);
    }
  });
</script>

{#if isVisible}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    on:click={closeDialog}
    on:keydown={(e) => e.key === 'Escape' && closeDialog()}
    role="button"
    tabindex="0"
    aria-label="Close keyboard shortcuts dialog"
    transition:fade={{ duration: 200 }}
  >
    <!-- Dialog -->
    <div
      class="bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
      transition:fly={{ y: 20, duration: 300 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <!-- Header -->
      <div class="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2
          id="shortcuts-title"
          class="text-xl font-semibold"
          style="color: {$colorStore.text}"
        >
          Keyboard Shortcuts
        </h2>

        <button
          class="p-2 rounded-full hover:bg-gray-800 transition-colors"
          on:click={closeDialog}
          aria-label="Close keyboard shortcuts"
        >
          <X size={20} style="color: {$colorStore.muted}" />
        </button>
      </div>

      <!-- Context tabs -->
      <div class="border-b border-gray-800 p-2 flex gap-1 overflow-x-auto">
        <button
          class="px-3 py-1 rounded-md text-sm transition-colors"
          class:bg-gray-800={activeContext === 'All'}
          on:click={() => setContext('All')}
          style="color: {activeContext === 'All' ? $colorStore.primary : $colorStore.muted}"
        >
          All
        </button>

        {#each contexts as context}
          <button
            class="px-3 py-1 rounded-md text-sm transition-colors"
            class:bg-gray-800={activeContext === context}
            on:click={() => setContext(context)}
            style="color: {activeContext === context ? $colorStore.primary : $colorStore.muted}"
          >
            {context}
          </button>
        {/each}
      </div>

      <!-- Shortcuts list -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="grid gap-2">
          {#each filteredShortcuts as shortcut}
            <div
              class="flex items-center justify-between p-2 rounded hover:bg-gray-800/50 transition-colors"
              class:opacity-70={activeContext === 'All' && shortcut.context !== 'Global'}
            >
              <div style="color: {$colorStore.text}">
                {shortcut.description}
                {#if activeContext === 'All'}
                  <span class="text-xs ml-2 px-2 py-0.5 rounded-full bg-gray-800"
                        style="color: {$colorStore.muted}">
                    {shortcut.context}
                  </span>
                {/if}
              </div>

              <kbd
                class="px-2 py-0.5 rounded border text-sm font-mono"
                style="background: {$colorStore.primary}20;
                       border-color: {$colorStore.primary}40;
                       color: {$colorStore.text}"
              >
                {shortcut.key}
              </kbd>
            </div>
          {/each}
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-800 text-sm text-center">
        <span style="color: {$colorStore.muted}">
          Press <kbd class="px-1 bg-gray-800 rounded" style="color: {$colorStore.text}">?</kbd>
          at any time to show this dialog
        </span>
      </div>
    </div>
  </div>
{/if}

<style>
    /* Custom scrollbar for shortcuts list */
    .overflow-y-auto::-webkit-scrollbar {
        width: 8px;
    }

    .overflow-y-auto::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    /* Make sure horizontal scrollbar doesn't appear on context tabs */
    .overflow-x-auto::-webkit-scrollbar {
        height: 0;
        width: 0;
        display: none;
    }
</style>