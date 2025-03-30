<!-- routes/dashboard/+layout.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { currentInstance } from "$lib/stores/instanceStore";
  import InstanceSelector from "$lib/components/InstanceSelector.svelte";
  import { colorStore } from "$lib/stores/colorStore.ts";

  export let data;

  onMount(() => {
    const savedInstance = localStorage.getItem('selectedInstance');
    if (savedInstance) {
      currentInstance.set(JSON.parse(savedInstance));
    }
    colorStore.extractFromImage($currentInstance?.botAvatar);
  });
</script>

<div class="pt-4 flex w-full overflow-x-hidden">
  <!-- Main content -->
  <div class="flex-1 w-full overflow-x-hidden">
    {#if !$currentInstance}
      <InstanceSelector data="{data}" />
    {:else}
      <slot />
    {/if}
  </div>
</div>