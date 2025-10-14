<!--
@component
Smart feature dependency suggestions
Shows when enabling one feature would benefit from enabling another
-->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";

  interface Suggestion {
    feature: string;
    reason: string;
    icon: string;
    benefits: string[];
  }

  interface Props {
    suggestions: Suggestion[];
    onaccept?: (detail: { feature: string }) => void;
    ondismiss?: () => void;
  }

  let {
    suggestions = [],
    onaccept,
    ondismiss
  }: Props = $props();

  let expandedIndex = $state<number | null>(null);

  function acceptSuggestion(feature: string) {
    onaccept?.({ feature });
  }

  function toggleExpand(index: number) {
    expandedIndex = expandedIndex === index ? null : index;
  }
</script>

{#if suggestions.length > 0}
  <div
    class="rounded-xl border-2 overflow-hidden"
    style="background: linear-gradient(135deg, {$colorStore.accent}08, {$colorStore.secondary}08);
           border-color: {$colorStore.accent}30;"
  >
    <!-- Header -->
    <div class="px-4 py-3 border-b flex items-center justify-between"
         style="background: {$colorStore.accent}10; border-color: {$colorStore.accent}20;">
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-lightbulb" style="color: {$colorStore.accent}; font-size: 18px;"></i>
        <h4 class="font-semibold text-sm" style="color: {$colorStore.text};">
          Smart Suggestions
        </h4>
      </div>
      {#if ondismiss}
        <button
          class="p-1 rounded-sm transition-all hover:opacity-70"
          style="color: {$colorStore.muted};"
          onclick={ondismiss}
          aria-label="Dismiss suggestions"
        >
          <i class="fa-solid fa-xmark" style="font-size: 16px;"></i>
        </button>
      {/if}
    </div>

    <!-- Suggestions List -->
    <div class="divide-y" style="divide-color: {$colorStore.accent}15;">
      {#each suggestions as suggestion, index}
        <div class="p-4">
          <div class="flex items-start gap-3">
            <!-- Icon -->
            <div
              class="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
              style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
            >
              <i class="fa-solid {suggestion.icon}" style="font-size: 18px;"></i>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h5 class="font-semibold text-sm mb-1" style="color: {$colorStore.text};">
                Consider enabling {suggestion.feature}
              </h5>
              <p class="text-xs mb-3" style="color: {$colorStore.muted};">
                {suggestion.reason}
              </p>

              <!-- Benefits (expandable) -->
              {#if suggestion.benefits.length > 0}
                <button
                  class="text-xs font-medium mb-2 flex items-center gap-1 transition-all"
                  style="color: {$colorStore.accent};"
                  onclick={() => toggleExpand(index)}
                >
                  <i class="fa-solid {expandedIndex === index ? 'fa-chevron-up' : 'fa-chevron-down'}"
                     style="font-size: 10px;"></i>
                  {expandedIndex === index ? 'Hide' : 'Show'} Benefits
                </button>

                {#if expandedIndex === index}
                  <ul class="space-y-1 mb-3 pl-4">
                    {#each suggestion.benefits as benefit}
                      <li class="text-xs flex items-start gap-2">
                        <i class="fa-solid fa-check"
                           style="color: {$colorStore.accent}; font-size: 12px; margin-top: 2px;"></i>
                        <span style="color: {$colorStore.text};">{benefit}</span>
                      </li>
                    {/each}
                  </ul>
                {/if}
              {/if}

              <!-- Actions -->
              <div class="flex items-center gap-2">
                <button
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                  onclick={() => acceptSuggestion(suggestion.feature)}
                >
                  <i class="fa-solid fa-plus" style="font-size: 14px;"></i>
                  <span>Enable {suggestion.feature}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
