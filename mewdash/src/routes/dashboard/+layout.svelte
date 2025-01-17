<!-- routes/dashboard/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { currentInstance } from "$lib/stores/instanceStore";
  import InstanceSelector from "$lib/InstanceSelector.svelte";

  onMount(() => {
    const savedInstance = localStorage.getItem('selectedInstance');
    if (savedInstance) {
      currentInstance.set(JSON.parse(savedInstance));
    }
  });
</script>

<div class="dashboard-container min-h-0 pt-4 flex">
  <!-- Main content -->
  <div class="flex-1">
    {#if !$currentInstance}
      <InstanceSelector />
    {:else}
      <slot />
    {/if}
  </div>
</div>

<style lang="postcss">
  .dashboard-container {
    min-height: calc(100vh - 76px); /* Account for the unified nav height */
    @apply bg-mewd-dark-grey;
  }
</style>