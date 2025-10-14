<!--
@component
Multi-step progressive configuration for a single feature
Each feature gets multiple screens for deeper configuration
-->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import MessageStylePicker from "./MessageStylePicker.svelte";
  import ChannelBulkSelector from "./ChannelBulkSelector.svelte";
  import LiveMessagePreview from "./LiveMessagePreview.svelte";
  import EmbedEditor from "$lib/components/specialized/EmbedEditor.svelte";

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
    showPreview?: boolean;
    placeholders?: Array<{ category: string; name: string; description: string }>;
    children?: import("svelte").Snippet<[{ step: FeatureStep; config: any }]>;
    onnext?: (detail: { config: any }) => void;
    onback?: () => void;
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
    showPreview = true,
    placeholders = [],
    children,
    onnext,
    onback
  }: Props = $props();

  let currentStepData = $derived(steps[currentStep]);
  let isLastStep = $derived(currentStep === steps.length - 1);

  // Only show preview for message/embed steps
  let shouldShowPreview = $derived(showPreview && currentStepData?.component === "message");

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

  // Default placeholders for preview
  let previewPlaceholders = {
    "%user.mention%": "@NewMember",
    "%user.name%": "NewMember",
    "%user.username%": "newmember",
    "%server.name%": "Your Server",
    "%server.membercount%": "1,234",
    "%role.name%": "Member",
    "%date%": new Date().toLocaleDateString()
  };
</script>

<div class="progressive-config space-y-6">
  <!-- Step Progress -->
  <div class="flex items-center gap-2">
    {#each steps as step, index}
      <div class="flex items-center gap-2">
        <div
          class="flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all"
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
            class="h-0.5 w-8 transition-all"
            style="background: {index < currentStep ? $colorStore.primary : $colorStore.muted + '40'};"
          ></div>
        {/if}
      </div>
    {/each}
  </div>

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
  <div class="grid grid-cols-1 gap-6" class:lg:grid-cols-2={showPreview}>
    <!-- Configuration -->
    <div class="space-y-6" class:lg:col-span-2={!showPreview}>
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
          <MessageStylePicker
            bind:selected={config.messageStyle}
            showTemplates={true}
            onselect={(detail) => config.messageStyle = detail.style}
            ontemplate={(detail) => {
              if (detail.template.embed) {
                config.embeds = [detail.template.embed];
                config.message = detail.template.embed.description || '';
              }
            }}
          />

          {#if config.messageStyle === 'plain'}
            <div>
              <label for="message-text" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                Message
              </label>
              <textarea
                id="message-text"
                class="w-full px-3 py-2 rounded-lg border resize-none"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                rows="4"
                bind:value={config.message}
                placeholder="Enter your message here..."
              ></textarea>
              <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                Use placeholders like %user.mention%, %server.name%
              </p>
            </div>
          {:else if config.messageStyle === 'embed' || config.messageStyle === 'embed-buttons'}
            <div>
              <label for="embed-message" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                Message Content (Optional)
              </label>
              <input
                type="text"
                id="embed-message"
                class="w-full px-3 py-2 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                bind:value={config.message}
                placeholder="Text above the embed..."
              />
            </div>

            {#if !config.embeds}
              {config.embeds = []}
            {/if}

            {#if config.embeds.length === 0}
              <button
                class="w-full px-4 py-3 rounded-lg border-2 border-dashed transition-all hover:scale-[1.01]"
                style="border-color: {$colorStore.primary}30; color: {$colorStore.primary};"
                onclick={() => config.embeds = [{
                  title: '', description: '', color: $colorStore.primary.replace('#', ''),
                  author: {name: '', url: '', icon_url: ''}, thumbnail: {url: ''}, image: {url: ''}, footer: {text: '', icon_url: ''}, fields: []
                }]}
              >
                <i class="fa-solid fa-plus" style="font-size: 18px;"></i>
                <span class="block mt-2 font-medium">Add Embed</span>
              </button>
            {:else}
              <EmbedEditor
                bind:embed={config.embeds[0]}
                index={0}
                placeholders={placeholders.length > 0 ? placeholders : [
                  { category: "User", name: "%user.mention%", description: "Mention the user" },
                  { category: "User", name: "%user.name%", description: "User's display name" },
                  { category: "Server", name: "%server.name%", description: "Server name" },
                  { category: "Server", name: "%server.membercount%", description: "Member count" }
                ]}
                onupdate={(detail) => config.embeds = [detail.embed]}
              />
            {/if}
          {/if}
        {:else if currentStepData.component === 'custom' && children}
          {@render children({ step: currentStepData, config })}
        {/if}
      {/if}
    </div>

    <!-- Live Preview (only shown when enabled) -->
    {#if showPreview}
      <div>
        <LiveMessagePreview
          content={config.message || ''}
          embeds={config.embeds || []}
          components={config.components || []}
          placeholders={previewPlaceholders}
          sticky={true}
        />
      </div>
    {/if}
  </div>

  <!-- Navigation -->
  <div class="flex items-center justify-between pt-6 border-t" style="border-color: {$colorStore.primary}20;">
    <button
      class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center gap-2"
      onclick={handleBack}
      style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30; focus:ring-color: {$colorStore.muted};"
    >
      <i class="fa-solid fa-arrow-left" style="font-size: 16px;"></i>
      Back
    </button>

    <span class="text-sm" style="color: {$colorStore.muted};">
      Step {currentStep + 1} of {steps.length}
    </span>

    <button
      class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2 flex items-center gap-2"
      onclick={handleNext}
      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
    >
      {isLastStep ? 'Complete' : 'Next'}
      <i class="fa-solid {isLastStep ? 'fa-check' : 'fa-arrow-right'}" style="font-size: 16px;"></i>
    </button>
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
