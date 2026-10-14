<!-- lib/components/KeyboardShortcuts.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
    import {fade, fly} from "svelte/transition";
    import {colorStore} from "$lib/stores/colorStore";
    import {onDestroy, onMount} from "svelte";
    import {browser} from "$app/environment";

    // Keyboard shortcuts
  const shortcuts = $derived([
    { key: "?", description: m.shortcuts.shortcutsToggle(), context: "global" },
    { key: "⌘K", description: m.shortcuts.shortcutsQuickSwitch(), context: "global" },
    { key: "⌘/", description: m.shortcuts.shortcutsFocusSearch(), context: "global" },
    { key: "Esc", description: m.shortcuts.shortcutsClosePopups(), context: "global" },
    { key: "R", description: m.shortcuts.shortcutsRefresh(), context: "dashboard" },
    { key: "M", description: m.shortcuts.shortcutsGoMusic(), context: "dashboard" },
    { key: "H", description: m.shortcuts.shortcutsGoHome(), context: "dashboard" },
    { key: "S", description: m.shortcuts.shortcutsGoSettings(), context: "dashboard" },
    { key: "Space", description: m.shortcuts.shortcutsPlayPause(), context: "music" },
    { key: "←/→", description: m.shortcuts.shortcutsSkip(), context: "music" }
  ]);

  const contextLabels: Record<string, () => string> = {
    global: m.shortcuts.shortcutsContextGlobal,
    dashboard: m.common.dashboard,
    music: m.features.musicName
  };

  // State
  let { isVisible = $bindable(false) }: { isVisible?: boolean } = $props();
  let activeContext = $state("global");

  // Contexts extracted from shortcuts
  let contexts = $derived([...new Set(shortcuts.map(s => s.context))]);
  let filteredShortcuts = $derived(shortcuts.filter(s =>
    activeContext === "All" || s.context === activeContext
  ));

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
    class="fixed inset-0 bg-black/70  z-50 flex items-center justify-center p-4"
    onclick={closeDialog}
    onkeydown={(e) => e.key === 'Escape' && closeDialog()}
    role="button"
    tabindex="0"
    aria-label={m.shortcuts.shortcutsCloseDialog()}
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
          {m.common.keyboardShortcuts()}
        </h2>

        <button aria-label={m.common.close()}
          class="p-2 rounded-full hover:bg-gray-800 transition-colors"
          onclick={closeDialog}

        ><i class="fa-solid fa-xmark" style="color: {$colorStore.muted}; font-size: 20px;"></i></button>
      </div>

      <!-- Context tabs -->
      <div class="border-b border-gray-800 p-2 flex gap-1 overflow-x-auto">
        <button
          class="px-3 py-1 rounded-md text-sm transition-colors"
          class:bg-gray-800={activeContext === 'All'}
          onclick={() => setContext('All')}
          style="color: {activeContext === 'All' ? $colorStore.primary : $colorStore.muted}"
        >
          {m.common.all()}
        </button>

        {#each contexts as context}
          <button
            class="px-3 py-1 rounded-md text-sm transition-colors"
            class:bg-gray-800={activeContext === context}
            onclick={() => setContext(context)}
            style="color: {activeContext === context ? $colorStore.primary : $colorStore.muted}"
          >
            {contextLabels[context]()}
          </button>
        {/each}
      </div>

      <!-- Shortcuts list -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="grid gap-2">
          {#each filteredShortcuts as shortcut}
            <div
                    class="flex items-center justify-between p-2 rounded-sm hover:bg-gray-800/50 transition-colors"
              class:opacity-70={activeContext === 'All' && shortcut.context !== 'global'}
            >
              <div style="color: {$colorStore.text}">
                {shortcut.description}
                {#if activeContext === 'All'}
                  <span class="text-xs ml-2 px-2 py-0.5 rounded-full bg-gray-800"
                        style="color: {$colorStore.muted}">
                    {contextLabels[shortcut.context]()}
                  </span>
                {/if}
              </div>

              <kbd
                      class="px-2 py-0.5 rounded-sm border text-sm font-mono"
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
          {@html m.shortcuts.shortcutsFooter({ key: `<kbd class="px-1 bg-gray-800 rounded-sm" style="color: ${$colorStore.text}">?</kbd>` })}
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