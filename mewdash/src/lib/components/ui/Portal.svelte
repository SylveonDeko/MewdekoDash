<!-- Portal.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  
  export let target: string | HTMLElement = 'body';
  
  let portal: HTMLDivElement;
  let targetElement: HTMLElement;
  
  onMount(() => {
    if (typeof target === 'string') {
      targetElement = document.querySelector(target) || document.body;
    } else {
      targetElement = target;
    }
    
    targetElement.appendChild(portal);
  });
  
  onDestroy(() => {
    if (portal && portal.parentNode) {
      portal.parentNode.removeChild(portal);
    }
  });
</script>

<div bind:this={portal}>
  <slot />
</div>