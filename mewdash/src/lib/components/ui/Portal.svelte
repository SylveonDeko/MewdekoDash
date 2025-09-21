<!-- Portal.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  
  interface Props {
    target?: string | HTMLElement;
    children?: import('svelte').Snippet;
  }

  let { target = 'body', children }: Props = $props();
  
  let portal: HTMLDivElement = $state();
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
  {@render children?.()}
</div>