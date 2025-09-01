<!--
@component
Feature card for selecting features during wizard setup
-->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { createEventDispatcher } from "svelte";
  import type { ComponentType } from "svelte";
  import { Check, Clock, Star } from "lucide-svelte";

  export let id: string;
  export let title: string;
  export let description: string;
  export let icon: ComponentType;
  export let selected: boolean = false;
  export let recommended: boolean = false;
  export let setupTime: string = "";
  export let difficulty: 'easy' | 'medium' | 'advanced' = 'easy';
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher<{
    toggle: { id: string; selected: boolean };
  }>();

  function handleClick() {
    if (disabled) return;
    dispatch('toggle', { id, selected: !selected });
  }

  $: difficultyColor = {
    'easy': $colorStore.accent + '60',
    'medium': '#f59e0b',
    'advanced': '#ef4444'
  }[difficulty];
</script>

<button
  class="feature-card group w-full text-left p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[160px] sm:min-h-[180px] relative overflow-hidden"
  class:disabled
  style="
    background: {selected 
      ? `linear-gradient(135deg, ${$colorStore.primary}15, ${$colorStore.secondary}15)` 
      : `linear-gradient(135deg, ${$colorStore.gradientStart}05, ${$colorStore.gradientMid}08)`};
    border-color: {selected ? $colorStore.primary + '60' : disabled ? $colorStore.muted + '20' : $colorStore.primary + '25'};
    focus:ring-color: {$colorStore.primary};
  "
  on:click={handleClick}
  {disabled}
  aria-pressed={selected}
>
  <!-- Background decoration -->
  <div class="absolute top-0 right-0 w-20 h-20 opacity-5 transform rotate-12 translate-x-6 -translate-y-6">
    <svelte:component this={icon} class="w-full h-full" />
  </div>

  <!-- Selected indicator -->
  {#if selected}
    <div class="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
         style="background: {$colorStore.primary};">
      <Check class="w-4 h-4 text-white" />
    </div>
  {/if}

  <!-- Recommended badge -->
  {#if recommended}
    <div class="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
         style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">
      <Star class="w-3 h-3" />
      Recommended
    </div>
  {/if}

  <!-- Icon and header -->
  <div class="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4" class:mt-6={recommended} class:sm:mt-8={recommended}>
    <div 
      class="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg border transition-colors flex-shrink-0"
      style="
        background: {selected ? $colorStore.primary + '20' : $colorStore.primary + '08'};
        border-color: {selected ? $colorStore.primary + '40' : $colorStore.primary + '20'};
        color: {selected ? $colorStore.primary : $colorStore.muted};
      "
    >
      <svelte:component this={icon} class="w-5 h-5 sm:w-6 sm:h-6" />
    </div>
    
    <div class="flex-1 min-w-0">
      <h3 class="text-base sm:text-lg font-bold mb-1 leading-tight" 
          style="color: {disabled ? $colorStore.muted : $colorStore.text};">
        {title}
      </h3>
      <p class="text-xs sm:text-sm leading-relaxed"
         style="color: {disabled ? $colorStore.muted : $colorStore.text + 'c0'};">
        {description}
      </p>
    </div>
  </div>

  <!-- Feature metadata -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-opacity-20 gap-2 sm:gap-4"
       style="border-color: {$colorStore.primary}30;">
    <div class="flex items-center gap-3 sm:gap-4">
      <!-- Setup time -->
      {#if setupTime}
        <div class="flex items-center gap-1 text-xs"
             style="color: {$colorStore.muted};">
          <Clock class="w-3 h-3" />
          {setupTime}
        </div>
      {/if}
      
      <!-- Difficulty indicator -->
      <div class="flex items-center gap-1 text-xs">
        <div class="w-2 h-2 rounded-full" style="background: {difficultyColor};"></div>
        <span style="color: {difficultyColor};">
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </span>
      </div>
    </div>
    
    <!-- Selection indicator -->
    <div class="text-xs font-medium sm:text-right"
         style="color: {selected ? $colorStore.primary : $colorStore.muted};">
      {selected ? 'Selected' : 'Click to select'}
    </div>
  </div>

  <!-- Hover effect overlay -->
  <div class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-200 pointer-events-none"
       style="background: linear-gradient(135deg, {$colorStore.primary}, {$colorStore.secondary});"></div>
</button>

<style>
  .feature-card.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  .feature-card.disabled:hover {
    transform: none;
  }
</style>