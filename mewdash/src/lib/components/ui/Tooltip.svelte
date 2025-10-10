<!-- lib/components/Tooltip.svelte -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  import { colorStore } from '$lib/stores/colorStore';

  interface Props {
    text?: string;
    placement?: "top" | "bottom" | "left" | "right";
    trigger?: "hover" | "click" | "focus";
    delay?: number;
    disabled?: boolean;
    class?: string;
    triggerSnippet?: import("svelte").Snippet;
    content?: import("svelte").Snippet;
    onshow?: () => void;
    onhide?: () => void;
  }

  let {
    text = "",
    placement = "top",
    trigger = "hover",
    delay = 150,
    disabled = false,
    class: className = "",
    triggerSnippet,
    content,
    onshow,
    onhide
  }: Props = $props();

  let visible = $state(false);
  let tooltipElement = $state<HTMLElement>();
  let triggerElement = $state<HTMLElement>();
  let showTimeout: NodeJS.Timeout;
  let hideTimeout: NodeJS.Timeout;
  let isMobile = $state(false);

  // Detect mobile on mount
  $effect(() => {
    isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  });

  function show() {
    if (disabled || (isMobile && trigger === "hover")) return;
    
    clearTimeout(hideTimeout);
    showTimeout = setTimeout(() => {
      visible = true;
      onshow?.();
    }, trigger === 'hover' ? delay : 0);
  }

  function hide() {
    clearTimeout(showTimeout);
    hideTimeout = setTimeout(() => {
      visible = false;
      onhide?.();
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
          hide: ['mouseleave', 'blur-sm']
      },
      click: {
        show: ['click'],
        hide: []
      },
      focus: {
        show: ['focus'],
          hide: ['blur-sm']
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

  const placementClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
  };
</script>

<div class="relative inline-block {className}">
  <!-- Trigger element -->
  <div
    use:handleTriggerEvents
    aria-describedby={visible ? tooltipId : undefined}
    class="cursor-help"
  >
    {#if triggerSnippet}
      {@render triggerSnippet()}
    {:else}
      <button
        class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] border-0 outline-hidden transition-opacity opacity-50 hover:opacity-100"
        type="button"
        style="background: {$colorStore.primary}15; color: {$colorStore.muted};"
        aria-label="Show help"
      >
        ?
      </button>
    {/if}
  </div>

  <!-- Tooltip -->
  {#if visible}
    <div
      bind:this={tooltipElement}
      id={tooltipId}
      role="tooltip"
      class="absolute z-[100] px-3 py-2 text-xs rounded-lg shadow-lg pointer-events-none backdrop-blur-md {placementClasses[placement]}"
      style="max-width: 24rem;
             background: {$colorStore.background}f5;
             color: {$colorStore.text};
             border: 1px solid {$colorStore.primary}25;"
      transition:fade={{ duration: 150 }}
    >
      <div class="break-words whitespace-pre-wrap">
        {#if content}
          {@render content()}
        {:else}
          {text}
        {/if}
      </div>
    </div>
  {/if}
</div>