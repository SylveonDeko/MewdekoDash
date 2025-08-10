<!-- TabNavigation.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { colorStore } from "$lib/stores/colorStore";
  import type { ComponentType } from 'svelte';

  export let tabs: { id: string; label: string; icon?: ComponentType }[];
  export let activeTab: string;
  export let variant: 'desktop' | 'mobile' = 'desktop';
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let ariaLabel: string = 'Tab navigation';

  const dispatch = createEventDispatcher<{
    change: { tab: string; previousTab: string };
  }>();

  let previousTab = activeTab;

  function handleTabChange(tabId: string) {
    if (tabId === activeTab) return;
    
    previousTab = activeTab;
    activeTab = tabId;
    dispatch('change', { tab: tabId, previousTab });
  }

  function handleKeydown(event: KeyboardEvent, tabId: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTabChange(tabId);
    }
  }

  $: sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  };

  $: containerClasses = orientation === 'vertical' 
    ? 'flex flex-col space-y-1' 
    : 'flex items-center space-x-2';

  $: tabClasses = orientation === 'vertical'
    ? 'w-full justify-start'
    : 'justify-center';
</script>

<!-- Desktop Tab Navigation -->
<div class="hidden sm:block">
  <div class="{containerClasses} p-2 rounded-xl"
       style="background: {$colorStore.primary}10;"
       role="tablist"
       aria-label={ariaLabel}>
    {#each tabs as tab}
      <button
        class="flex items-center gap-2 {sizeClasses[size]} {tabClasses} rounded-xl transition-all font-medium"
        class:active={activeTab === tab.id}
        style="color: {activeTab === tab.id ? $colorStore.primary : $colorStore.muted};
               background: {activeTab === tab.id ? $colorStore.primary + '20' : 'transparent'};
               border: 1px solid {activeTab === tab.id ? $colorStore.primary + '40' : 'transparent'};"
        on:click={() => handleTabChange(tab.id)}
        on:keydown={(e) => handleKeydown(e, tab.id)}
        role="tab"
        aria-selected={activeTab === tab.id}
        aria-controls="{tab.id}-panel"
        id="{tab.id}-tab"
        tabindex={activeTab === tab.id ? 0 : -1}
      >
        {#if tab.icon}
          <svelte:component this={tab.icon} size={16} />
        {/if}
        <span class="font-medium">{tab.label}</span>
      </button>
    {/each}
  </div>
</div>

<!-- Mobile Tab Navigation -->
<div class="sm:hidden">
  <div class="flex overflow-x-auto scrollbar-hide border-b border-opacity-30"
       style="border-color: {$colorStore.primary}30;"
       role="tablist"
       aria-label={ariaLabel}>
    {#each tabs as tab}
      <button
        class="flex items-center gap-2 {sizeClasses[size]} whitespace-nowrap transition-all font-medium border-b-2 flex-shrink-0"
        class:active={activeTab === tab.id}
        style="color: {activeTab === tab.id ? $colorStore.primary : $colorStore.muted};
               border-color: {activeTab === tab.id ? $colorStore.primary : 'transparent'};"
        on:click={() => handleTabChange(tab.id)}
        on:keydown={(e) => handleKeydown(e, tab.id)}
        role="tab"
        aria-selected={activeTab === tab.id}
        aria-controls="{tab.id}-panel"
        id="{tab.id}-tab-mobile"
        tabindex={activeTab === tab.id ? 0 : -1}
      >
        {#if tab.icon}
          <svelte:component this={tab.icon} size={16} />
        {/if}
        <span class="font-medium">{tab.label}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .active {
    transform: translateY(-1px);
  }

  button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  button:hover:not(.active) {
    background: var(--color-primary)10 !important;
  }
</style>