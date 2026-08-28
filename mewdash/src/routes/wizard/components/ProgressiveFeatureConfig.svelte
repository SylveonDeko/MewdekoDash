<!--
@component
Multi-step progressive configuration for a single feature
Each feature gets multiple screens for deeper configuration
-->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import ChannelBulkSelector from "./ChannelBulkSelector.svelte";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import type { DiscordUser } from "$lib/types/discord";

  interface FeatureStep {
    id: string;
    title: string;
    description: string;
    component?: "channel" | "message" | "embed" | "custom";
  }

  interface Props {
    featureId: string;
    featureName: string;
    steps: FeatureStep[];
    currentStep?: number;
    config?: any;
    channels?: any[];
    roles?: any[];
    categories?: any[];
    placeholders?: Array<{ category: string; name: string; description: string }>;
    guildId?: string | bigint | null;
    user?: DiscordUser | null;
    children?: import("svelte").Snippet<[{ step: FeatureStep; config: any }]>;
    onnext?: (detail: { config: any }) => void;
    onback?: () => void;
    onskip?: () => void;
  }

  let {
    featureId,
    featureName,
    steps = [],
    currentStep = $bindable(0),
    config = $bindable({}),
    channels = [],
    roles = [],
    categories = [],
    placeholders = [],
    guildId = null,
    user = null,
    children,
    onnext,
    onback,
    onskip
  }: Props = $props();

  let currentStepData = $derived(steps[currentStep]);
  let isLastStep = $derived(currentStep === steps.length - 1);

  function handleNext() {
    onnext?.({ config });
  }

  function handleBack() {
    if (currentStep > 0) {
      currentStep--;
    } else {
      onback?.();
    }
  }
</script>

<div class="progressive-config space-y-6">
  <!-- Step Progress -->
  {#if steps.length > 1}
    <div class="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {#each steps as step, index}
        <div class="flex items-center gap-2 shrink-0">
          <div
            class="flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all shrink-0"
            class:completed={index < currentStep}
            class:active={index === currentStep}
            style="background: {index <= currentStep ? $colorStore.primary + '20' : 'transparent'};
                   border-color: {index <= currentStep ? $colorStore.primary : $colorStore.muted + '40'};
                   color: {index <= currentStep ? $colorStore.primary : $colorStore.muted};"
          >
            {#if index < currentStep}
              <i class="fa-solid fa-check" style="font-size: 14px;"></i>
            {:else}
              <span class="text-xs font-bold">{index + 1}</span>
            {/if}
          </div>
          {#if index < steps.length - 1}
            <div
              class="h-0.5 w-6 sm:w-8 transition-all shrink-0"
              style="background: {index < currentStep ? $colorStore.primary : $colorStore.muted + '40'};"
            ></div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <!-- Step Header -->
  {#if currentStepData}
    <div>
      <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text};">
        {currentStepData.title}
      </h3>
      <p class="text-sm" style="color: {$colorStore.muted};">
        {currentStepData.description}
      </p>
    </div>
  {/if}

  <!-- Step Content -->
  <div>
    <div class="space-y-6">
      {#if currentStepData}
        {#if currentStepData.component === 'channel'}
          <ChannelBulkSelector
            {channels}
            {categories}
            bind:selected={config.channelId}
            label="Select Channel"
            placeholder="Choose where to send messages..."
          />
        {:else if currentStepData.component === 'message'}
          <FullscreenEmbedBuilder
            bind:value={config.message}
            previewTitle={featureName}
            previewDescription={currentStepData.description}
            icon="fa-comment"
            allowContent={true}
            allowMultipleEmbeds={true}
            maxEmbeds={10}
            allowComponents={true}
            {placeholders}
            {guildId}
            {user}
            placeholder="Click to write your message, add embeds or buttons"
          />
          <p class="text-xs" style="color: {$colorStore.muted};">
            Plain text works fine on its own. Placeholders like %user.mention% and %server.name% are
            filled in when the message is sent.
          </p>
        {:else if currentStepData.component === 'custom' && children}
          {@render children({ step: currentStepData, config })}
        {/if}
      {/if}
    </div>
  </div>

  <!-- Navigation -->
  <div class="pt-6 border-t" style="border-color: {$colorStore.primary}20;">
    <div class="flex items-center justify-between gap-3">
      <button
        class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center gap-2 min-h-[44px]"
        onclick={handleBack}
        style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30; focus:ring-color: {$colorStore.muted};"
      >
        <i class="fa-solid fa-arrow-left" style="font-size: 16px;"></i>
        Back
      </button>

      <div class="hidden sm:flex items-center gap-4">
        <span class="text-sm whitespace-nowrap" style="color: {$colorStore.muted};">
          Step {currentStep + 1} of {steps.length}
        </span>
        {#if onskip}
          <button
            class="px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center gap-2 min-h-[44px]"
            style="background: {$colorStore.muted}15; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30; focus:ring-color: {$colorStore.muted};"
            onclick={onskip}
          >
            <i class="fa-solid fa-forward" style="font-size: 13px;"></i>
            Skip {featureName}
          </button>
        {/if}
      </div>

      <button
        class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center gap-2 min-h-[44px]"
        onclick={handleNext}
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
      >
        {isLastStep ? 'Complete' : 'Next'}
        <i class="fa-solid {isLastStep ? 'fa-check' : 'fa-arrow-right'}" style="font-size: 16px;"></i>
      </button>
    </div>

    <div class="sm:hidden flex flex-col items-center gap-2 mt-3">
      <p class="text-xs" style="color: {$colorStore.muted};">
        Step {currentStep + 1} of {steps.length}
      </p>
      {#if onskip}
        <button
          class="w-full px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 min-h-[44px]"
          style="background: {$colorStore.muted}15; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30; focus:ring-color: {$colorStore.muted};"
          onclick={onskip}
        >
          <i class="fa-solid fa-forward" style="font-size: 13px;"></i>
          Skip {featureName}
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
    .completed {
        animation: bounce 0.3s ease;
    }

    @keyframes bounce {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
    }
</style>
