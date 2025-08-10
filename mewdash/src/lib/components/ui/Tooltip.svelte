<!-- lib/components/Tooltip.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import { colorStore } from '$lib/stores/colorStore';

  export let text: string = '';
  export let placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
  export let trigger: 'hover' | 'click' | 'focus' = 'hover';
  export let delay: number = 300;
  export let disabled: boolean = false;
  let maxWidth: string = '36rem';
  let className: string = '';
  export { className as class };

  let visible = false;
  let tooltipElement: HTMLElement;
  let triggerElement: HTMLElement;
  let showTimeout: NodeJS.Timeout;
  let hideTimeout: NodeJS.Timeout;

  const dispatch = createEventDispatcher();

  function show() {
    if (disabled) return;
    
    clearTimeout(hideTimeout);
    showTimeout = setTimeout(() => {
      visible = true;
      dispatch('show');
    }, trigger === 'hover' ? delay : 0);
  }

  function hide() {
    clearTimeout(showTimeout);
    hideTimeout = setTimeout(() => {
      visible = false;
      dispatch('hide');
    }, trigger === 'hover' ? 100 : 0);
  }

  function toggle() {
    if (visible) {
      hide();
    } else {
      show();
    }
  }

  function handleTriggerEvents(node: HTMLElement) {
    triggerElement = node;

    const events = {
      hover: {
        show: ['mouseenter', 'focus'],
        hide: ['mouseleave', 'blur']
      },
      click: {
        show: ['click'],
        hide: []
      },
      focus: {
        show: ['focus'],
        hide: ['blur']
      }
    };

    const currentEvents = events[trigger];

    currentEvents.show.forEach(event => {
      node.addEventListener(event, trigger === 'click' ? toggle : show);
    });

    currentEvents.hide.forEach(event => {
      node.addEventListener(event, hide);
    });

    // Close on escape key
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        hide();
      }
    };
    
    node.addEventListener('keydown', handleKeydown);

    return {
      destroy() {
        currentEvents.show.forEach(event => {
          node.removeEventListener(event, trigger === 'click' ? toggle : show);
        });
        currentEvents.hide.forEach(event => {
          node.removeEventListener(event, hide);
        });
        node.removeEventListener('keydown', handleKeydown);
        clearTimeout(showTimeout);
        clearTimeout(hideTimeout);
      }
    };
  }

  // Generate unique ID for accessibility
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;


  $: placementClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2', 
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  $: arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent'
  };
</script>

<div class="relative inline-block {className}">
  <!-- Trigger element -->
  <div 
    use:handleTriggerEvents
    aria-describedby={visible ? tooltipId : undefined}
    class="cursor-help"
  >
    <slot name="trigger">
      <button 
        type="button" 
        class="w-5 h-5 rounded-full flex items-center justify-center text-xs border-0 outline-none transition-all duration-200 hover:scale-110"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
        aria-label="Show help"
      >
        ?
      </button>
    </slot>
  </div>

  <!-- Tooltip -->
  {#if visible}
    <div
      bind:this={tooltipElement}
      id={tooltipId}
      role="tooltip"
      class="absolute z-50 px-4 py-3 text-sm rounded-xl shadow-2xl pointer-events-none {placementClasses[placement]}"
      style="max-width: {maxWidth}; 
             background: linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.75)), linear-gradient(135deg, {$colorStore.gradientStart}30, {$colorStore.gradientMid}30, {$colorStore.gradientEnd}30);
             color: {$colorStore.text}; 
             border: 1px solid {$colorStore.primary}40;
             backdrop-filter: blur(8px);"
      transition:fade={{ duration: 200 }}
    >
      <!-- Arrow -->
      <div 
        class="absolute w-0 h-0 {arrowClasses[placement]}"
        style="border-width: 6px; border-style: solid; border-color: rgba(0,0,0,0.85);"
      ></div>
      
      <!-- Content -->
      <div class="break-words leading-relaxed">
        <slot name="content">
          {text}
        </slot>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Ensure tooltip stays visible when hovering over it */
  :global(.tooltip-container:hover .tooltip-content) {
    display: block;
  }
</style>