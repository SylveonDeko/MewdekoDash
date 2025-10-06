<!-- lib/components/search/SearchTrigger.svelte -->
<script lang="ts">
    import {colorStore} from "$lib/stores/colorStore";
    import {openSearch} from "$lib/stores/searchStore";


    interface Props {
    // Props
    variant?: 'button' | 'compact' | 'mobile';
    showShortcut?: boolean;
  }

  let { variant = 'button', showShortcut = true }: Props = $props();

  function handleOpenSearch() {
    openSearch();
  }
</script>

{#if variant === 'button'}
  <!-- Desktop Button -->
  <button
    class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:scale-105 hover:shadow-lg group"
    style="background: {$colorStore.primary}15; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}25;"
    onclick={handleOpenSearch}
  >
    <i class="fa-utility-duo fa-regular fa-magnifying-glass"
       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
    <span class="text-sm font-medium">Search features...</span>

    {#if showShortcut}
      <div class="hidden md:flex items-center gap-1 ml-auto">
          <div class="flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm text-xs"
             style="background: {$colorStore.primary}20; color: {$colorStore.primary}">
          <span>⌘K</span>
        </div>
      </div>
    {/if}
  </button>

{:else if variant === 'compact'}
  <!-- Compact Button -->
  <button
    class="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105"
    style="background: {$colorStore.primary}10; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}20;"
    onclick={handleOpenSearch}
    title="Search dashboard (⌘K)"
  >
    <i class="fa-utility-duo fa-regular fa-magnifying-glass"
       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
    <span class="text-sm">Search</span>
  </button>

{:else if variant === 'mobile'}
  <!-- Mobile Button -->
  <button aria-label="Button action"
    class="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-105"
    style="background: {$colorStore.primary}15; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}25;"
    onclick={handleOpenSearch}

  >
    <i class="fa-utility-duo fa-regular fa-magnifying-glass text-xl"
       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
  </button>
{/if}

