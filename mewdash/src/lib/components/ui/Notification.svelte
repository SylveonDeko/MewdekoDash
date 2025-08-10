<!-- lib/components/ui/Notification.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { colorStore } from "$lib/stores/colorStore";
  import { CheckCircle, AlertCircle, X } from "lucide-svelte";
  import { onMount, onDestroy } from "svelte";

  export let message: string;
  export let type: "success" | "error" = "success";
  export let timeout: number = 5000;
  export let onDismiss: (() => void) | undefined = undefined;

  let timeoutId: NodeJS.Timeout;

  // Calculate dynamic colors based on bot's theme with appropriate tinting
  $: successColor = $colorStore.primary ? 
    // Blend the primary color with green
    blendColors($colorStore.primary, '#10B981', 0.3) : 
    '#10B981';
    
  $: errorColor = $colorStore.primary ? 
    // Blend the primary color with red
    blendColors($colorStore.primary, '#EF4444', 0.3) : 
    '#EF4444';

  // Function to blend two hex colors
  function blendColors(color1: string, color2: string, ratio: number): string {
    // Remove # if present
    const c1 = color1.replace('#', '');
    const c2 = color2.replace('#', '');
    
    // Parse RGB values
    const r1 = parseInt(c1.substring(0, 2), 16);
    const g1 = parseInt(c1.substring(2, 4), 16);
    const b1 = parseInt(c1.substring(4, 6), 16);
    
    const r2 = parseInt(c2.substring(0, 2), 16);
    const g2 = parseInt(c2.substring(2, 4), 16);
    const b2 = parseInt(c2.substring(4, 6), 16);
    
    // Blend colors
    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  function handleDismiss() {
    if (timeoutId) clearTimeout(timeoutId);
    if (onDismiss) onDismiss();
  }

  onMount(() => {
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        handleDismiss();
      }, timeout);
    }
  });

  onDestroy(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
</script>

<div
  class="fixed top-20 md:top-4 right-4 p-4 rounded-xl shadow-2xl backdrop-blur-md border max-w-sm min-w-80 z-[60]"
  style="
    background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10),
                linear-gradient(135deg, {type === 'success' ? successColor : errorColor}25, {type === 'success' ? successColor : errorColor}15);
    border-color: {type === 'success' ? successColor : errorColor}50;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), 
                0 0 0 1px {type === 'success' ? successColor : errorColor}20,
                0 4px 12px {type === 'success' ? successColor : errorColor}30;
  "
  in:fly={{ 
    x: 400, 
    duration: 300, 
    easing: cubicOut
  }}
  out:fly={{ 
    x: 400, 
    duration: 200, 
    easing: cubicOut
  }}
>
    <div class="flex items-start gap-3">
      <!-- Icon -->
      <div 
        class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
        style="background-color: {type === 'success' ? successColor : errorColor}20;"
      >
        {#if type === 'success'}
          <CheckCircle 
            size={16} 
            style="color: {successColor};" 
          />
        {:else}
          <AlertCircle 
            size={16} 
            style="color: {errorColor};" 
          />
        {/if}
      </div>

      <!-- Message -->
      <div class="flex-1 min-w-0">
        <p 
          class="text-sm font-medium leading-5 break-words"
          style="color: {$colorStore.text};"
        >
          {message}
        </p>
      </div>

      <!-- Dismiss Button -->
      <button
        class="flex-shrink-0 p-1 rounded-lg transition-all duration-200 hover:scale-110"
        style="color: {$colorStore.muted}; 
               hover:background-color: {type === 'success' ? successColor : errorColor}20;
               hover:color: {$colorStore.text};"
        on:click={handleDismiss}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>

    <!-- Progress bar for timed notifications -->
    {#if timeout > 0}
      <div 
        class="absolute bottom-0 left-0 h-1 rounded-b-xl transition-all ease-linear"
        style="
          background: linear-gradient(90deg, {type === 'success' ? successColor : errorColor}, {type === 'success' ? successColor : errorColor}80);
          width: 100%;
          animation: notificationProgress {timeout}ms linear forwards;
        "
      ></div>
    {/if}
  </div>

<style>
  @keyframes notificationProgress {
    from {
      width: 100%;
    }
    to {
      width: 0;
    }
  }
</style>
