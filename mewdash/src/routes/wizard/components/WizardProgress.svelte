<!--
@component
Wizard progress indicator showing current step and completion status
-->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { Check } from "lucide-svelte";

  export let currentStep: number;
  export let totalSteps: number;
  export let stepTitles: string[] = [];
  export let completedSteps: number[] = [];

  // Default step titles if not provided
  const defaultStepTitles = [
    "Welcome",
    "Permissions", 
    "Features",
    "Configuration",
    "Complete"
  ];

  $: displayTitles = stepTitles.length > 0 ? stepTitles : defaultStepTitles.slice(0, totalSteps);
  $: progressPercent = (currentStep / totalSteps) * 100;
</script>

<div class="wizard-progress mb-6">
  <!-- Simple progress bar with step info -->
  <div class="flex items-center justify-between mb-3">
    <span class="text-sm font-medium" style="color: {$colorStore.muted};">
      Step {currentStep} of {totalSteps}
    </span>
    <span class="text-sm font-medium" style="color: {$colorStore.primary};">
      {Math.round(progressPercent)}% Complete
    </span>
  </div>
  
  <!-- Progress bar -->
  <div class="relative mb-4">
    <div class="w-full h-2 rounded-full" style="background: {$colorStore.primary}15;"></div>
    <div 
      class="absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ease-out"
      style="background: linear-gradient(90deg, {$colorStore.primary}, {$colorStore.secondary}); 
             width: {progressPercent}%"
    ></div>
  </div>
  
  <!-- Current step title -->
  <div class="text-center">
    <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">
      {displayTitles[currentStep - 1]}
    </h3>
  </div>
  
  <!-- Simple dot indicators (optional) -->
  <div class="flex justify-center gap-2 mt-3">
    {#each displayTitles as _, index}
      {@const stepNumber = index + 1}
      {@const isActive = stepNumber === currentStep}
      {@const isCompleted = completedSteps.includes(stepNumber)}
      {@const isPast = stepNumber < currentStep}
      
      <div 
        class="w-2 h-2 rounded-full transition-all duration-300"
        style="
          background: {isCompleted || isPast || isActive ? $colorStore.primary : $colorStore.primary + '30'};
        "
      ></div>
    {/each}
  </div>
</div>

<style>
  .wizard-progress {
    user-select: none;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.8;
    }
  }
  
  .animate-pulse {
    animation: pulse 2s ease-in-out infinite;
  }
</style>