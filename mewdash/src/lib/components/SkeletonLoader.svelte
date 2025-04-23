<!-- lib/components/SkeletonLoader.svelte -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";

  // Props
  export let type: "card" | "text" | "avatar" | "feature" | "stats" | "music" = "text";
  export let width: string = "100%";
  export let height: string = "1rem";
  export let rounded: string = "md";
  export let count: number = 1;
  export let inline: boolean = false;
  export let delay: number = 0;

  // The animation shimmer color
  $: shimmerColor = `linear-gradient(
    90deg,
    ${$colorStore.primary}10 0%,
    ${$colorStore.primary}20 50%,
    ${$colorStore.primary}10 100%
  )`;

  // Calculate the dynamic styles based on type
  $: style = (() => {
    let baseStyle = `background: #1f2937; width: ${width}; height: ${height};`;

    switch (rounded) {
      case "none":
        baseStyle += "border-radius: 0;";
        break;
      case "sm":
        baseStyle += "border-radius: 0.125rem;";
        break;
      case "md":
        baseStyle += "border-radius: 0.375rem;";
        break;
      case "lg":
        baseStyle += "border-radius: 0.5rem;";
        break;
      case "xl":
        baseStyle += "border-radius: 0.75rem;";
        break;
      case "full":
        baseStyle += "border-radius: 9999px;";
        break;
      default:
        baseStyle += "border-radius: 0.375rem;";
    }

    return baseStyle;
  })();
</script>

{#if type === "card"}
  <div
    class="w-full rounded-xl overflow-hidden animate-pulse"
    style="background: #1f2937;"
    in:fade={{ delay, duration: 300 }}
  >
    <!-- Card header -->
    <div class="h-48 relative overflow-hidden" style="background: #2d3748;">
      <div
        class="absolute inset-0 animate-shimmer bg-gradient-to-r"
        style="background-image: {shimmerColor}; background-size: 200% 100%;"
      ></div>
    </div>

    <!-- Card content -->
    <div class="p-6 space-y-4">
      <!-- Title -->
      <div
        class="h-7 rounded-md animate-pulse"
        style="background: #374151; width: 70%;"
      ></div>

      <!-- Content -->
      <div class="space-y-2">
        <div class="h-4 rounded-md animate-pulse" style="background: #374151;"></div>
        <div class="h-4 rounded-md animate-pulse" style="background: #374151; width: 90%;"></div>
        <div class="h-4 rounded-md animate-pulse" style="background: #374151; width: 80%;"></div>
      </div>

      <!-- Bottom section -->
      <div class="pt-4 flex items-center justify-between">
        <div class="h-8 w-24 rounded-md animate-pulse" style="background: #374151;"></div>
        <div class="h-8 w-8 rounded-full animate-pulse" style="background: #374151;"></div>
      </div>
    </div>
  </div>
{:else if type === "stats"}
  <div
    class="flex items-center gap-4"
    in:fade={{ delay, duration: 300 }}
  >
    <!-- Icon placeholder -->
    <div class="w-10 h-10 rounded-lg animate-pulse" style="background: #374151;"></div>

    <div class="flex-1">
      <!-- Label -->
      <div class="h-4 rounded-md animate-pulse mb-2" style="background: #374151; width: 40%;"></div>

      <!-- Value -->
      <div class="h-6 rounded-md animate-pulse" style="background: #374151; width: 60%;"></div>
    </div>
  </div>
{:else if type === "feature"}
  <div
    class="p-3 rounded-xl animate-pulse flex items-center gap-3"
    style="background: #2d3748;"
    in:fade={{ delay, duration: 300 }}
  >
    <!-- Icon placeholder -->
    <div class="w-5 h-5 rounded-md" style="background: #374151;"></div>

    <!-- Text placeholder -->
    <div class="h-4 rounded-md flex-grow" style="background: #374151; width: 70%;"></div>
  </div>
{:else if type === "music"}
  <div
    class="w-full rounded-xl overflow-hidden"
    in:fade={{ delay, duration: 300 }}
  >
    <!-- Cover image placeholder -->
    <div class="relative overflow-hidden aspect-video">
      <div class="absolute inset-0 animate-pulse" style="background: #2d3748;"></div>

      <!-- Shimmer effect -->
      <div
        class="absolute inset-0 animate-shimmer bg-gradient-to-r"
        style="background-image: {shimmerColor}; background-size: 200% 100%;"
      ></div>

      <!-- Play button placeholder -->
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full"
        style="background: #374151;"
      ></div>
    </div>

    <!-- Music info -->
    <div class="p-4 space-y-3">
      <!-- Title -->
      <div class="h-6 rounded-md animate-pulse" style="background: #374151; width: 80%;"></div>

      <!-- Artist -->
      <div class="h-4 rounded-md animate-pulse" style="background: #374151; width: 60%;"></div>

      <!-- Controls -->
      <div class="flex justify-between items-center pt-2">
        <div class="h-8 w-8 rounded-full animate-pulse" style="background: #374151;"></div>
        <div class="h-2 rounded-full animate-pulse flex-grow mx-4" style="background: #374151;"></div>
        <div class="h-8 w-8 rounded-full animate-pulse" style="background: #374151;"></div>
      </div>
    </div>
  </div>
{:else if type === "avatar"}
  <div
    class="rounded-full animate-pulse"
    style="background: #374151; width: {width}; height: {height};"
    in:fade={{ delay, duration: 300 }}
  ></div>
{:else}
  <!-- Default text placeholder -->
  {#each Array(count) as _, i}
    <div
      class:inline-block={inline}
      class:block={!inline}
      class:mb-2={!inline && i < count - 1}
      class:mr-2={inline && i < count - 1}
      class="animate-pulse"
      {style}
      in:fade={{ delay: delay + (i * 100), duration: 300 }}
    ></div>
  {/each}
{/if}

<style>
    /* Shimmer animation */
    .animate-shimmer {
        animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
        0% {
            background-position: -200% 0;
        }
        100% {
            background-position: 200% 0;
        }
    }
</style>