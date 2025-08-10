<script lang="ts">
  import { onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { loadingStore, showSpinner, loadingMessage } from "$lib/stores/loadingStore";
  import { Loader2 } from "lucide-svelte";
  import { fly } from "svelte/transition";

  // Loading state
  let mounted = false;
  let progressValue = 0;

  // Get loading states with progress
  $: loadingStates = Array.from($loadingStore.states.values());
  $: hasProgress = loadingStates.some(state => state.progress !== undefined);
  $: maxProgress = hasProgress 
    ? Math.max(...loadingStates.filter(s => s.progress !== undefined).map(s => s.progress!))
    : 0;

  // Smooth progress animation
  $: if (hasProgress && mounted) {
    const targetProgress = maxProgress;
    const step = () => {
      const diff = targetProgress - progressValue;
      if (Math.abs(diff) > 0.5) {
        progressValue += diff * 0.1;
        requestAnimationFrame(step);
      } else {
        progressValue = targetProgress;
      }
    };
    step();
  }

  onMount(() => {
    mounted = true;
  });
</script>

{#if $showSpinner}
  <div 
    class="fixed inset-0 z-[10000] pointer-events-none"
    transition:fly={{ y: -10, duration: 200 }}
  >
    <!-- More prominent top progress bar -->
    <div class="absolute top-0 left-0 right-0 h-2 overflow-hidden shadow-lg">
      <div 
        class="h-full transition-all duration-300 ease-out relative"
        style="
          background: linear-gradient(90deg, {$colorStore.primary}, {$colorStore.accent});
          width: {hasProgress ? progressValue : 100}%;
          animation: {hasProgress ? 'none' : 'loading-shimmer 2s infinite ease-in-out'};
          box-shadow: 0 0 15px {$colorStore.primary}40;
        "
      >
        {#if !hasProgress}
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        {/if}
      </div>
    </div>

    <!-- Subtle backdrop for better contrast -->
    <div class="absolute inset-0 bg-black/5 backdrop-blur-[0.5px]"></div>

    <!-- More prominent loading indicator -->
    <div class="absolute top-6 right-6 pointer-events-auto">
      <div 
        class="flex items-center gap-3 px-5 py-3 rounded-2xl backdrop-blur-md border shadow-2xl transform hover:scale-105 transition-transform"
        style="
          background: linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.95));
          border-color: {$colorStore.primary}50;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px {$colorStore.primary}20;
        "
      >
        <!-- Spinner -->
        <div class="flex-shrink-0">
          <Loader2 
            size={16}
            class="animate-spin"
            style="color: {$colorStore.primary}"
          />
        </div>

        <!-- Message -->
        <span 
          class="text-sm font-medium whitespace-nowrap"
          style="color: {$colorStore.text};"
        >
          {$loadingMessage}
        </span>

        <!-- Progress indicator -->
        {#if hasProgress}
          <span 
            class="text-xs opacity-75 min-w-[3ch] text-right"
            style="color: {$colorStore.muted};"
          >
            {Math.round(progressValue)}%
          </span>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes loading-shimmer {
    0% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(100%);
    }
  }
</style>