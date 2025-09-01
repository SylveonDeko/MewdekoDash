<!--
@component
Wrapper component for individual wizard steps with consistent styling and animations
-->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { fly } from "svelte/transition";
  import type { ComponentType } from "svelte";

  export let title: string;
  export let subtitle: string = "";
  export let icon: ComponentType | undefined = undefined;
  export let stepNumber: number;
  export let isActive: boolean = false;
  export let maxWidth: string = "max-w-2xl";
  export let showStepNumber: boolean = true;
</script>

{#if isActive}
  <div 
    class="wizard-step w-full flex flex-col items-center px-3 py-4 sm:px-4 sm:py-8"
    in:fly={{ y: 30, duration: 400, delay: 100 }}
    out:fly={{ y: -30, duration: 300 }}
  >
    <!-- Step container -->
    <div class="w-full {maxWidth} mx-auto">
      <!-- Step header -->
      <div class="text-center mb-4 sm:mb-8">
        {#if showStepNumber}
          <div class="flex justify-center mb-3 sm:mb-4">
            <div 
              class="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-2 shadow-lg"
              style="
                background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                border-color: {$colorStore.primary}40;
                color: {$colorStore.primary};
              "
            >
              {#if icon}
                <svelte:component this={icon} class="w-6 h-6 sm:w-8 sm:h-8" />
              {:else}
                <span class="text-lg sm:text-2xl font-bold">{stepNumber}</span>
              {/if}
            </div>
          </div>
        {/if}
        
        <h2 class="text-xl sm:text-3xl font-bold mb-2 sm:mb-3" style="color: {$colorStore.text};">
          {title}
        </h2>
        
        {#if subtitle}
          <p class="text-sm sm:text-lg px-2" style="color: {$colorStore.muted};">
            {subtitle}
          </p>
        {/if}
      </div>

      <!-- Step content -->
      <div 
        class="backdrop-blur-sm rounded-xl sm:rounded-2xl border p-4 sm:p-6 md:p-8 shadow-2xl"
        style="
          background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
          border-color: {$colorStore.primary}30;
        "
      >
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  .wizard-step {
    /* Mobile: allow natural height, Desktop: center vertically */
    min-height: auto;
    display: flex;
    align-items: flex-start;
  }
  
  @media (min-width: 768px) {
    .wizard-step {
      min-height: calc(100vh - 120px);
      align-items: center;
    }
  }
</style>