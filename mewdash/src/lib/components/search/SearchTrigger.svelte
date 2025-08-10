<!-- lib/components/search/SearchTrigger.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { openSearch, searchStore } from "$lib/stores/searchStore";
  import { Search, Command } from "lucide-svelte";

  // Props
  export let variant: 'button' | 'compact' | 'mobile' = 'button';
  export let showShortcut = true;

  function handleOpenSearch() {
    openSearch();
  }
</script>

{#if variant === 'button'}
  <!-- Desktop Button -->
  <button
    class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:scale-105 hover:shadow-lg group"
    style="background: {$colorStore.primary}15; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}25;"
    on:click={handleOpenSearch}
  >
    <Search size={18} style="color: {$colorStore.primary}" />
    <span class="text-sm font-medium">Search features...</span>
    
    {#if showShortcut}
      <div class="hidden md:flex items-center gap-1 ml-auto">
        <div class="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs"
             style="background: {$colorStore.primary}20; color: {$colorStore.primary}">
          <Command size={10} />
          <span>K</span>
        </div>
      </div>
    {/if}
  </button>

{:else if variant === 'compact'}
  <!-- Compact Button -->
  <button
    class="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105"
    style="background: {$colorStore.primary}10; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}20;"
    on:click={handleOpenSearch}
    title="Search dashboard (⌘K)"
  >
    <Search size={16} />
    <span class="text-sm">Search</span>
  </button>

{:else if variant === 'mobile'}
  <!-- Mobile Button -->
  <button
    class="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-105"
    style="background: {$colorStore.primary}15; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}25;"
    on:click={handleOpenSearch}
    aria-label="Search dashboard features"
  >
    <Search size={20} />
  </button>
{/if}

