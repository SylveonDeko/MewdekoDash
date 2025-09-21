<!-- lib/components/FeatureCard.svelte -->
<script lang="ts">
  import { fade, scale } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import type { ComponentType } from "svelte";


  interface Props {
      // Props
      icon: ComponentType;
      title: string;
      isActive?: boolean;
      description?: string;
      href?: string;
      animationDelay?: number;
      hasRecentActivity?: boolean;
      activityText?: string;
  }

  let {
      icon,
      title,
      isActive = false,
      description = "",
      href = "",
      animationDelay = 0,
      hasRecentActivity = false,
      activityText = ""
  }: Props = $props();
</script>

<div
  class="relative group"
  in:fade={{ delay: animationDelay, duration: 300 }}
  role="listitem"
>
  {#if href}
      {@const SvelteComponent = icon}
    <a 
      {href} 
      class="block p-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
      class:hover:scale-105={isActive}
      class:hover:shadow-lg={isActive}
      class:ring-2={isActive}
      class:ring-transparent={!isActive}
      style="background: {isActive ? $colorStore.primary + '15' : $colorStore.primary + '08'};
             ring-color: {isActive ? $colorStore.primary + '30' : 'transparent'};
             focus:ring-color: {$colorStore.primary};"
      aria-label="{title} - {description || 'Configure feature'}"
      aria-current={isActive ? 'true' : undefined}
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0">
              <SvelteComponent
              class="w-5 h-5 transition-colors duration-300"
              style="color: {isActive ? $colorStore.primary : $colorStore.muted}"
            />
          </div>

          <span
            class="transition-all duration-300"
            class:font-medium={isActive}
            style="color: {isActive ? $colorStore.text : $colorStore.muted}"
          >
            {title}
          </span>
        </div>

        <!-- Status indicator -->
        <div class="flex items-center gap-2 flex-shrink-0">
          {#if isActive}
            <div class="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></div>
            <span class="text-xs" style="color: #10b981" aria-label="Feature is active">Active</span>
            {#if hasRecentActivity && activityText}
              <span class="text-xs" style="color: {$colorStore.muted}">• {activityText}</span>
            {/if}
          {:else}
            <span class="text-xs" style="color: {$colorStore.muted}" aria-label="Feature needs setup">Setup needed</span>
          {/if}
        </div>
      </div>
    </a>
  {:else}
      {@const SvelteComponent_1 = icon}
    <div 
      class="p-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
      class:ring-2={isActive}
      class:ring-transparent={!isActive}
      style="background: {isActive ? $colorStore.primary + '15' : $colorStore.primary + '08'};
             ring-color: {isActive ? $colorStore.primary + '30' : 'transparent'};
             focus:ring-color: {$colorStore.primary};"
      role="status"
      aria-label="{title} - {isActive ? 'Active feature' : 'Feature not configured'}"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0">
              <SvelteComponent_1
              class="w-5 h-5 transition-colors duration-300"
              style="color: {isActive ? $colorStore.primary : $colorStore.muted}"
            />
          </div>

          <span
            class="transition-all duration-300"
            class:font-medium={isActive}
            style="color: {isActive ? $colorStore.text : $colorStore.muted}"
          >
            {title}
          </span>
        </div>

        <!-- Status indicator -->
        <div class="flex items-center gap-2 flex-shrink-0">
          {#if isActive}
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="text-xs" style="color: #10b981">Active</span>
            {#if hasRecentActivity && activityText}
              <span class="text-xs" style="color: {$colorStore.muted}">• {activityText}</span>
            {/if}
          {:else}
            <span class="text-xs" style="color: {$colorStore.muted}">No config</span>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>