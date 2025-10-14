<!--
@component
Setup suggestion banner for experienced users with unconfigured guilds
-->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { slide } from "svelte/transition";
  import type { DiscordGuild } from "$lib/types/discordGuild";

  interface Props {
    guild: DiscordGuild;
    context: {
    experienceLevel: number;
    isFirstDashboardAccess: boolean;
    completedWizardCount: number;
    guildHasBasicSetup: boolean;
  };
    visible?: boolean;
    ondismiss?: () => void;
    onstartSetup?: () => void;
  }

  let { guild, context, visible = true, ondismiss, onstartSetup }: Props = $props();

  function handleDismiss() {
    ondismiss?.();
  }

  function handleStartSetup() {
    onstartSetup?.();
  }

  // Estimated setup time based on experience level
  let estimatedTime = $derived(context.experienceLevel >= 2 ? "2-3 min" : "5 min");
</script>

{#if visible}
  <div
    class="setup-suggestion-banner relative overflow-hidden  rounded-xl border p-4 shadow-lg mb-6"
    style="
      background: linear-gradient(135deg, {$colorStore.secondary}12, {$colorStore.primary}08);
      border-color: {$colorStore.secondary}30;
    "
    transition:slide={{ duration: 300 }}
  >
    <!-- Background decoration -->
    <div class="absolute top-0 right-0 w-32 h-32 opacity-5 transform rotate-12 translate-x-8 -translate-y-8">
      <i class="fa-solid fa-lightbulb" style="font-size: 128px;"></i>
    </div>

    <div class="relative flex items-start gap-4">
      <!-- Icon -->
      <div
              class="flex items-center justify-center w-10 h-10 rounded-lg border shrink-0"
        style="
          background: {$colorStore.secondary}20;
          border-color: {$colorStore.secondary}40;
          color: {$colorStore.secondary};
        "
      >
        <i class="fa-solid fa-lightbulb" style="font-size: 20px;"></i>
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
            <i class="fa-solid fa-clock" style="color: {$colorStore.secondary}; font-size: 12px;"></i>
            <span>~{estimatedTime} setup</span>
          </div>
          <div class="flex items-center gap-1">
            <i class="fa-solid fa-lightbulb" style="color: {$colorStore.secondary}; font-size: 12px;"></i>
            <span>Smart defaults</span>
          </div>
          <div class="flex items-center gap-1">
            <i class="fa-solid fa-arrow-right" style="color: {$colorStore.secondary}; font-size: 12px;"></i>
            <span>Skip anytime</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 flex-wrap">
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2 text-sm min-h-[36px]"
            style="background: {$colorStore.secondary}; color: white;"
            onclick={handleStartSetup}
          >
            Quick Setup
            <i class="fa-solid fa-arrow-right" style="font-size: 12px;"></i>
          </button>
          
          <button
            class="px-3 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] text-sm min-h-[36px]"
            style="background: {$colorStore.muted}15; color: {$colorStore.muted};"
            onclick={handleDismiss}
          >
            Maybe Later
          </button>
        </div>
      </div>

      <!-- Dismiss button -->
      <button aria-label="Button action"
              class="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-110 shrink-0"
        style="
          background: {$colorStore.muted}15;
          color: {$colorStore.muted};
          hover:background: {$colorStore.muted}25;
        "
        onclick={handleDismiss}

      ><i class="fa-solid fa-xmark" style="font-size: 16px;"></i></button>
    </div>
  </div>
{/if}

<style>
  .setup-suggestion-banner {
    user-select: none;
  }
</style>