<!-- lib/components/StatCard.svelte -->
<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { ArrowRight, TrendingDown, TrendingUp } from "lucide-svelte";

  // Props
  export let icon: typeof SvelteComponent;
  export let label: string;
  export let value: string | number;
  export let subtitle: string = "";
  export let iconColor: "primary" | "secondary" | "accent" = "primary";
  export let trend: "up" | "down" | "neutral" | null = null;
  export let trendValue: string = "";
  export let previousValue: string | number | null = null;
  export let isLoading: boolean = false;
  export let animationDelay: number = 0;
  export let tooltipData: Array<{ label: string; value: string | number }> = [];

  // State
  let animatedValue: number = 0;
  let showTooltip = false;
  let mounted = false;

  // Handle numeric value animation
  function animateValue(target: number) {
    const duration = 1500;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;
    let current = 0;

    function step() {
      current += increment;
      animatedValue = Math.min(current, target);

      if (current < target) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  function toggleTooltip() {
    showTooltip = !showTooltip;
  }

  function closeTooltip() {
    showTooltip = false;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      toggleTooltip();
      event.preventDefault();
    } else if (event.key === "Escape" && showTooltip) {
      closeTooltip();
      event.preventDefault();
    }
  }

  onMount(() => {
    mounted = true;

    // Animate numeric values
    if (typeof value === "number" && !isNaN(value)) {
      // Add a slight delay before starting animation for staggered effect
      setTimeout(() => {
        animateValue(value as number);
      }, animationDelay);
    }
  });

  // Format trend value
  function getTrendColor() {
    if (trend === "up") return $colorStore.accent;
    if (trend === "down") return "#ef4444"; // red-500
    return $colorStore.muted;
  }

  // Format number with commas
  function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }

  // Get the right icon for the trend
  function getTrendIcon() {
    if (trend === "up") return TrendingUp;
    if (trend === "down") return TrendingDown;
    return ArrowRight;
  }
</script>

<div
  aria-expanded={tooltipData.length > 0 ? (showTooltip ? "true" : "false") : undefined}
  aria-haspopup={tooltipData.length > 0 ? "dialog" : undefined}
  class="flex items-center justify-center gap-4 p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300 group relative"
  class:cursor-pointer={tooltipData.length > 0}
  in:fade={{ delay: animationDelay, duration: 300 }}
  on:keydown={tooltipData.length > 0 ? handleKeyDown : undefined}
  on:mouseenter={tooltipData.length > 0 ? toggleTooltip : undefined}
  on:mouseleave={tooltipData.length > 0 ? closeTooltip : undefined}
  role={tooltipData.length > 0 ? "button" : "region"}
  tabindex={tooltipData.length > 0 ? 0 : undefined}
>
  <div
    class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
    style="background: {$colorStore[iconColor]}20"
  >
    <svelte:component
      class="w-5 h-5"
      style="color: {$colorStore[iconColor]}"
      this={icon}
    />
  </div>

  <div class="flex-1 min-w-0 text-center">
    <div class="text-sm" style="color: {$colorStore.muted}">{label}</div>

    {#if isLoading}
      <div class="h-6 bg-gray-700 animate-pulse rounded w-16 mt-1 mx-auto"></div>
    {:else}
      <div class="font-semibold text-lg flex items-center justify-center gap-2" style="color: {$colorStore.text}">
        {#if typeof value === 'number' && !isNaN(value) && mounted}
          <span class="tabular-nums">
            {formatNumber(Math.round(animatedValue))}
          </span>
        {:else}
          <span>{value}</span>
        {/if}

        {#if trend}
          <div
            class="flex items-center gap-1 text-sm bg-opacity-20 px-1.5 py-0.5 rounded-full"
            style="background: {getTrendColor()}20; color: {getTrendColor()}"
            in:slide={{ delay: animationDelay + 300, duration: 300 }}
          >
            <svelte:component this={getTrendIcon()} size={14} />
            {#if trendValue}
              <span class="text-xs">{trendValue}</span>
            {/if}
          </div>
        {/if}
      </div>
    {/if}

    {#if subtitle}
      <div class="text-xs mt-1 text-center" style="color: {$colorStore.muted}">{subtitle}</div>
    {/if}
  </div>

  <!-- Tooltip -->
  {#if showTooltip && tooltipData.length > 0}
    <div
      class="absolute z-20 bottom-full left-0 mb-2 bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 shadow-xl min-w-[200px]"
      transition:fade={{ duration: 200 }}
      role="dialog"
      aria-labelledby="tooltip-title"
    >
      <div id="tooltip-title" class="text-sm font-medium mb-2 text-center" style="color: {$colorStore.text}">{label}
        Details
      </div>

      <div class="space-y-2">
        {#each tooltipData as item}
          <div class="flex justify-between text-xs">
            <span style="color: {$colorStore.muted}">{item.label}</span>
            <span style="color: {$colorStore.text}">{item.value}</span>
          </div>
        {/each}
      </div>

      {#if previousValue !== null}
        <div class="mt-3 pt-2 border-t border-gray-700">
          <div class="flex justify-between text-xs">
            <span style="color: {$colorStore.muted}">Previous</span>
            <span style="color: {$colorStore.text}">{previousValue}</span>
          </div>
        </div>
      {/if}

      <div
        class="absolute -bottom-2 left-4 w-4 h-4 bg-gray-800/95 rotate-45"
      ></div>
    </div>
  {/if}
</div>