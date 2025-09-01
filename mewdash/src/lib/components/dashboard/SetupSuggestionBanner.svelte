<!--
@component
Setup suggestion banner for experienced users with unconfigured guilds
-->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";
  import { Lightbulb, X, ArrowRight, Clock } from "lucide-svelte";
  import type { DiscordGuild } from "$lib/types/discordGuild";

  export let guild: DiscordGuild;
  export let context: {
    experienceLevel: number;
    isFirstDashboardAccess: boolean;
    completedWizardCount: number;
    guildHasBasicSetup: boolean;
  };
  export let visible: boolean = true;

  const dispatch = createEventDispatcher<{
    dismiss: void;
    startSetup: void;
  }>();

  function handleDismiss() {
    dispatch('dismiss');
  }

  function handleStartSetup() {
    dispatch('startSetup');
  }

  // Estimated setup time based on experience level
  $: estimatedTime = context.experienceLevel >= 2 ? "2-3 min" : "5 min";
</script>

{#if visible}
  <div 
    class="setup-suggestion-banner relative overflow-hidden backdrop-blur-sm rounded-xl border p-4 shadow-lg mb-6"
    style="
      background: linear-gradient(135deg, {$colorStore.secondary}12, {$colorStore.primary}08);
      border-color: {$colorStore.secondary}30;
    "
    transition:slide={{ duration: 300 }}
  >
    <!-- Background decoration -->
    <div class="absolute top-0 right-0 w-32 h-32 opacity-5 transform rotate-12 translate-x-8 -translate-y-8">
      <Lightbulb class="w-full h-full" />
    </div>

    <div class="relative flex items-start gap-4">
      <!-- Icon -->
      <div 
        class="flex items-center justify-center w-10 h-10 rounded-lg border flex-shrink-0"
        style="
          background: {$colorStore.secondary}20;
          border-color: {$colorStore.secondary}40;
          color: {$colorStore.secondary};
        "
      >
        <Lightbulb class="w-5 h-5" />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold mb-1" style="color: {$colorStore.text};">
          Quick Setup Available
        </h3>
        <p class="text-sm mb-3" style="color: {$colorStore.muted};">
          {guild.name} doesn't have any features configured yet. 
          Want to set up essential features quickly?
        </p>

        <!-- Benefits -->
        <div class="flex flex-wrap gap-4 text-xs mb-4" style="color: {$colorStore.text};">
          <div class="flex items-center gap-1">
            <Clock class="w-3 h-3" style="color: {$colorStore.secondary};" />
            <span>~{estimatedTime} setup</span>
          </div>
          <div class="flex items-center gap-1">
            <Lightbulb class="w-3 h-3" style="color: {$colorStore.secondary};" />
            <span>Smart defaults</span>
          </div>
          <div class="flex items-center gap-1">
            <ArrowRight class="w-3 h-3" style="color: {$colorStore.secondary};" />
            <span>Skip anytime</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 flex-wrap">
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 flex items-center gap-2 text-sm min-h-[36px]"
            style="background: {$colorStore.secondary}; color: white;"
            on:click={handleStartSetup}
          >
            Quick Setup
            <ArrowRight class="w-3 h-3" />
          </button>
          
          <button
            class="px-3 py-2 rounded-lg font-medium transition-all hover:scale-105 text-sm min-h-[36px]"
            style="background: {$colorStore.muted}15; color: {$colorStore.muted};"
            on:click={handleDismiss}
          >
            Maybe Later
          </button>
        </div>
      </div>

      <!-- Dismiss button -->
      <button
        class="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-110 flex-shrink-0"
        style="
          background: {$colorStore.muted}15;
          color: {$colorStore.muted};
          hover:background: {$colorStore.muted}25;
        "
        on:click={handleDismiss}
        aria-label="Dismiss setup suggestion"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
{/if}

<style>
  .setup-suggestion-banner {
    user-select: none;
  }
</style>