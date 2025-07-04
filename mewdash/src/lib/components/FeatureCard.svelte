<!-- lib/components/FeatureCard.svelte -->
<script lang="ts">
  import { fade, scale } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import type { ComponentType } from "svelte";

  // Props
  export let icon: ComponentType;
  export let title: string;
  export let isActive = false;
  export let description: string = "";
  export let href: string = "";
  export let animationDelay: number = 0;

  // Optional feedback message when inactive
  export let inactiveMessage: string = "This feature is not currently active";

  // Local state
  let showTooltip = false;

  // Generate unique ID for ARIA labeling
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  // Toggle tooltip
  function toggleTooltip() {
    if (!isActive) {
      showTooltip = !showTooltip;
    }
  }

  // Close tooltip
  function closeTooltip() {
    showTooltip = false;
  }

  // Handle keyboard events
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleTooltip();
    } else if (event.key === "Escape" && showTooltip) {
      event.preventDefault();
      closeTooltip();
    }
  }
</script>

<div
  aria-pressed={!isActive && showTooltip ? "true" : undefined}
  aria-describedby={!isActive && showTooltip ? tooltipId : undefined}
  class="relative group"
  class:cursor-pointer={!!href || !isActive}
  in:fade={{ delay: animationDelay, duration: 300 }}
  on:click={toggleTooltip}
  aria-label={!isActive ? `${title} - ${inactiveMessage}. Press Enter to learn more.` : isActive && !href ? `${title} - Active feature` : undefined}
  role={!!href && isActive ? undefined : !isActive ? "button" : undefined}
  on:keydown={handleKeydown}
  tabindex={!isActive || (!!href && isActive) ? 0 : undefined}
>
  {#if href && isActive}
    <a {href} class="absolute inset-0 z-10" aria-label="{title} - {description || 'Configure this feature'}"></a>
  {/if}

  <div
    class="p-3 rounded-xl flex items-center gap-3 transition-all duration-300 overflow-hidden"
    class:hover:opacity-90={!isActive}
    class:hover:scale-105={isActive}
    class:hover:shadow-lg={isActive}
    class:opacity-75={!isActive}
    style="background: {isActive ? $colorStore.primary + '20' : $colorStore.primary + '10'}"
  >
    <div class="flex-shrink-0">
      <svelte:component
        class="w-5 h-5 transition-colors duration-300"
        style="color: {isActive ? $colorStore.primary : $colorStore.muted}"
        this={icon}
      />
    </div>

    <span
      class="transition-colors duration-300"
      style="color: {isActive ? $colorStore.text : $colorStore.muted}"
    >
      {title}
    </span>

    {#if isActive}
      <div
        class="absolute bottom-0 left-0 h-1 transition-all duration-300"
        style="background: {$colorStore.primary}; width: 30%;"
        in:scale={{ duration: 600, delay: animationDelay + 300 }}
      ></div>
    {/if}
  </div>

  {#if !isActive && showTooltip}
    <div
      id={tooltipId}
      class="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 rounded-lg px-4 py-3 shadow-xl
             w-auto max-w-[200px] min-w-[150px] text-center backdrop-blur-md border"
      style="background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.9));
             border-color: {$colorStore.primary}50;"
      transition:scale={{ duration: 200, start: 0.8 }}
      on:mouseleave={closeTooltip}
      role="tooltip"
      aria-live="polite"
    >
      <div class="text-sm mb-3" style="color: {$colorStore.text}">{inactiveMessage}</div>

      {#if href}
        <a
          {href}
          class="text-xs py-1.5 px-3 rounded inline-block transition-colors duration-200"
          style="background: {$colorStore.primary}40;
                 color: {$colorStore.text};
                 border: 1px solid {$colorStore.primary}50;
                 hover:background-color: {$colorStore.primary}60;"
          aria-label="Configure {title}"
        >
          Configure
        </a>
      {/if}

      <div
        class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 border-b border-r"
        style="background: rgba(0,0,0,0.9);
               border-color: {$colorStore.primary}50;"
      ></div>
    </div>
  {/if}

  {#if isActive && description && href}
    <!-- Info tooltip on hover for active features -->
    <div
      class="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 rounded-lg px-4 py-3 shadow-xl
             w-auto max-w-[220px] min-w-[180px] text-center opacity-0 invisible group-hover:opacity-100
             group-hover:visible transition-all duration-200 backdrop-blur-md border"
      style="background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.9));
             border-color: {$colorStore.primary}50;"
      role="tooltip"
      aria-live="polite"
    >
      <div class="text-sm" style="color: {$colorStore.text}">{description}</div>
      <div
        class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 border-b border-r"
        style="background: rgba(0,0,0,0.9);
               border-color: {$colorStore.primary}50;"
      ></div>
    </div>
  {/if}
</div>