<!--
@component
Three-state feature selection card: Full Setup, Quick Enable, or Skip
Replaces the binary enable/disable pattern with progressive options
-->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { fly } from "svelte/transition";

  interface Props {
    id: string;
    title: string;
    description: string;
    icon: string;
    setupState?: "full" | "quick" | "skip";
    recommended?: boolean;
    setupTime?: string;
    difficulty?: "easy" | "medium" | "advanced";
    disabled?: boolean;
    benefits?: string[];
    /** How many extra wizard screens choosing Full Setup adds. */
    stepCount?: number;
    /** Why this feature was suggested for this server, shown so the choice is not a mystery. */
    suggestionReason?: string;
    onchange?: (detail: { id: string; state: "full" | "quick" | "skip" }) => void;
  }

  let {
    id,
    title,
    description,
    icon,
    setupState = "skip",
    recommended = false,
    setupTime = "2 min",
    difficulty = "easy",
    disabled = false,
    benefits = [],
    stepCount = 0,
    suggestionReason = "",
    onchange
  }: Props = $props();

  let showBenefits = $state(false);

  /**
   * Shown beside the Full Setup label rather than in its description, which is hidden
   * on small screens. Wizard length is exactly what a phone user needs warning about.
   */
  let fullStepHint = $derived(stepCount > 0 ? `+${stepCount}` : "");

  function setState(newState: "full" | "quick" | "skip") {
    if (disabled) return;
    setupState = newState;
    onchange?.({ id, state: newState });
  }

  function toggleBenefits(e: MouseEvent) {
    e.stopPropagation();
    showBenefits = !showBenefits;
  }

  let difficultyColor = $derived({
    "easy": $colorStore.accent,
    "medium": "#f59e0b",
    "advanced": "#ef4444"
  }[difficulty]);

  let stateConfig = $derived({
    full: {
      color: $colorStore.primary,
      label: "Full Setup",
      icon: "fa-sliders",
      description: "Configure all settings now"
    },
    quick: {
      color: $colorStore.secondary,
      label: "Quick Enable",
      icon: "fa-bolt",
      description: "Enable with smart defaults"
    },
    skip: {
      color: $colorStore.muted,
      label: "Skip",
      icon: "fa-forward",
      description: "Configure later"
    }
  });
</script>

<div
  class="feature-setup-card rounded-xl border-2 transition-all overflow-visible relative"
  class:disabled
  class:full={setupState === 'full'}
  class:quick={setupState === 'quick'}
  style="background: {setupState !== 'skip'
      ? `linear-gradient(135deg, ${stateConfig[setupState].color}10, ${stateConfig[setupState].color}05)`
      : `${$colorStore.primary}05`};
         border-color: {setupState !== 'skip' ? stateConfig[setupState].color + '40' : $colorStore.primary + '20'};"
>
  <!-- Card Header -->
  <div class="p-3 sm:p-6">
    <div class="flex items-start gap-3 mb-3 sm:mb-4">
      <!-- Icon -->
      <div
        class="flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-xl border transition-all shrink-0"
        style="background: {setupState !== 'skip' ? stateConfig[setupState].color + '15' : $colorStore.primary + '10'};
               border-color: {setupState !== 'skip' ? stateConfig[setupState].color + '30' : $colorStore.primary + '20'};
               color: {setupState !== 'skip' ? stateConfig[setupState].color : $colorStore.muted};"
      >
        <i class="fa-solid {icon} text-lg sm:text-2xl"></i>
      </div>

      <!-- Title and Description -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1">
          <h3 class="text-base sm:text-lg font-bold" style="color: {disabled ? $colorStore.muted : $colorStore.text};">
            {title}
          </h3>
          {#if suggestionReason}
            <span
              class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
              style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
            >
              <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 10px;"></i>
              {suggestionReason}
            </span>
          {:else if recommended}
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
            >
              Recommended
            </span>
          {/if}
          {#if benefits.length > 0}
            <button
              class="p-1 rounded-full transition-all hover:scale-110"
              style="background: {setupState !== 'skip' ? stateConfig[setupState].color + '20' : $colorStore.primary + '20'}; color: {setupState !== 'skip' ? stateConfig[setupState].color : $colorStore.primary};"
              onclick={toggleBenefits}
              aria-label="Show benefits"
            >
              <i class="fa-solid fa-circle-info" style="font-size: 14px;"></i>
            </button>
          {/if}
        </div>
        <p class="text-sm mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none"
           style="color: {disabled ? $colorStore.muted : $colorStore.text + 'c0'};">
          {description}
        </p>

        <!-- Metadata -->
        <div class="hidden sm:flex items-center gap-4 text-xs" style="color: {$colorStore.muted};">
          <span class="flex items-center gap-1">
            <i class="fa-solid fa-clock" style="font-size: 12px;"></i>
            {setupTime}
          </span>
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full" style="background: {difficultyColor};"></span>
            <span style="color: {difficultyColor};">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- State Selection Buttons -->
    <div class="grid grid-cols-3 gap-2">
      <button
        class="state-button px-3 py-3 rounded-lg transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 text-left"
        class:active={setupState === 'full'}
        disabled={disabled}
        onclick={() => setState('full')}
        style="background: {setupState === 'full' ? stateConfig.full.color + '15' : 'transparent'};
               border: 2px solid {setupState === 'full' ? stateConfig.full.color : $colorStore.primary + '15'};
               focus:ring-color: {stateConfig.full.color};"
      >
        <div class="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2 mb-0 sm:mb-1">
          <i class="fa-solid {stateConfig.full.icon}" style="color: {stateConfig.full.color}; font-size: 16px;"></i>
          <span class="font-semibold text-xs sm:text-sm text-center sm:text-left"
                style="color: {setupState === 'full' ? stateConfig.full.color : $colorStore.text};">
            {stateConfig.full.label}
          </span>
          {#if fullStepHint}
            <span class="text-xs px-1.5 rounded-full shrink-0"
                  style="background: {stateConfig.full.color}20; color: {stateConfig.full.color};">
              {fullStepHint}
            </span>
          {/if}
        </div>
        <p class="text-xs hidden sm:block" style="color: {$colorStore.muted};">
          {stateConfig.full.description}{stepCount > 0 ? ` (+${stepCount} ${stepCount === 1 ? "screen" : "screens"})` : ""}
        </p>
      </button>

      <button
        class="state-button px-3 py-3 rounded-lg transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 text-left"
        class:active={setupState === 'quick'}
        disabled={disabled}
        onclick={() => setState('quick')}
        style="background: {setupState === 'quick' ? stateConfig.quick.color + '15' : 'transparent'};
               border: 2px solid {setupState === 'quick' ? stateConfig.quick.color : $colorStore.primary + '15'};
               focus:ring-color: {stateConfig.quick.color};"
      >
        <div class="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 mb-0 sm:mb-1">
          <i class="fa-solid {stateConfig.quick.icon}" style="color: {stateConfig.quick.color}; font-size: 16px;"></i>
          <span class="font-semibold text-xs sm:text-sm text-center sm:text-left"
                style="color: {setupState === 'quick' ? stateConfig.quick.color : $colorStore.text};">
            {stateConfig.quick.label}
          </span>
        </div>
        <p class="text-xs hidden sm:block" style="color: {$colorStore.muted};">
          {stateConfig.quick.description}
        </p>
      </button>

      <button
        class="state-button px-3 py-3 rounded-lg transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 text-left"
        class:active={setupState === 'skip'}
        disabled={disabled}
        onclick={() => setState('skip')}
        style="background: {setupState === 'skip' ? $colorStore.muted + '15' : 'transparent'};
               border: 2px solid {setupState === 'skip' ? $colorStore.muted : $colorStore.primary + '15'};
               focus:ring-color: {$colorStore.muted};"
      >
        <div class="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 mb-0 sm:mb-1">
          <i class="fa-solid {stateConfig.skip.icon}" style="color: {$colorStore.muted}; font-size: 16px;"></i>
          <span class="font-semibold text-xs sm:text-sm text-center sm:text-left"
                style="color: {setupState === 'skip' ? $colorStore.muted : $colorStore.text};">
            {stateConfig.skip.label}
          </span>
        </div>
        <p class="text-xs hidden sm:block" style="color: {$colorStore.muted};">
          {stateConfig.skip.description}
        </p>
      </button>
    </div>
  </div>

  <!-- Benefits Popup (Click/Tap to Toggle) -->
  {#if benefits.length > 0 && showBenefits}
    <div
      class="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border-2 shadow-2xl"
      style="background: linear-gradient(135deg, {stateConfig[setupState !== 'skip' ? setupState : 'full'].color}20, {stateConfig[setupState !== 'skip' ? setupState : 'full'].color}10); border-color: {stateConfig[setupState !== 'skip' ? setupState : 'full'].color}60; backdrop-filter: blur(10px);"
      in:fly={{ y: -10, duration: 250, opacity: 0 }}
      out:fly={{ y: -5, duration: 150, opacity: 0 }}
    >
      <div class="px-4 py-3 border-b flex items-center justify-between"
           style="background: {stateConfig[setupState !== 'skip' ? setupState : 'full'].color}15; border-color: {stateConfig[setupState !== 'skip' ? setupState : 'full'].color}30;">
        <span class="text-sm font-bold flex items-center gap-2"
              style="color: {stateConfig[setupState !== 'skip' ? setupState : 'full'].color};">
          <i class="fa-solid fa-sparkles" style="font-size: 14px;"></i>
          What You'll Get
        </span>
        <button
          class="p-1 rounded-full hover:opacity-70 transition-all"
          onclick={toggleBenefits}
          aria-label="Close benefits"
        >
          <i class="fa-solid fa-xmark"
             style="color: {stateConfig[setupState !== 'skip' ? setupState : 'full'].color}; font-size: 16px;"></i>
        </button>
      </div>
      <div class="px-4 py-3 space-y-2 max-h-60 overflow-y-auto">
        {#each benefits as benefit, index}
          <div
            class="flex items-start gap-2"
            in:fly={{ x: -10, duration: 200, delay: index * 40 }}
          >
            <i class="fa-solid fa-check"
               style="color: {stateConfig[setupState !== 'skip' ? setupState : 'full'].color}; font-size: 14px; margin-top: 2px;"></i>
            <span class="text-sm" style="color: {$colorStore.text};">{benefit}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
    .feature-setup-card.disabled {
        opacity: 0.6;
        pointer-events: none;
    }

    .state-button.active {
        box-shadow: 0 0 0 3px var(--ring-color, transparent);
    }

    .state-button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
</style>
