<!--
@component
Wrapper component for individual wizard steps with consistent styling and animations
-->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";


  interface Props {
    title: string;
    subtitle?: string;
    icon?: string | undefined;
    stepNumber: number;
    isActive?: boolean;
    maxWidth?: string;
    showStepNumber?: boolean;
    children?: import('svelte').Snippet;
  }

  let {
    title,
    subtitle = "",
    icon = undefined,
    stepNumber,
    isActive = false,
    maxWidth = "max-w-2xl",
    showStepNumber = true,
    children
  }: Props = $props();
</script>

{#if isActive}
  <div
    class="wizard-step w-full flex flex-col items-center px-3 py-4 sm:px-4 sm:py-8"
    in:fly={{ y: 20, duration: 500, delay: 150, easing: cubicOut }}
    out:fade={{ duration: 200 }}
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
                <i class="{icon}" style="font-size: 32px;"></i>
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
          class=" rounded-xl sm:rounded-2xl border p-4 sm:p-6 md:p-8 shadow-2xl"
        style="
          background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
          border-color: {$colorStore.primary}30;
        "
      >
        {@render children?.()}
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