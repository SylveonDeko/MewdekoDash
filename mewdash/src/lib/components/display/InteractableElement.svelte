<!-- lib/util/InteractableElement.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore.ts";

  export let title: string;
  export let description: string;
  export let cta: {
    href: string;
    text: string;
    target: string | "_blank";
  } | null = null;
</script>

<section
  class="group w-full h-max m-6 pt-6 pb-8 max-w-[34rem] grid grid-cols-1 justify-center rounded-2xl backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 cursor-pointer transform transition-all duration-500 ease-out hover:scale-105"
  on:mouseenter
  on:mouseleave
  role="article"
  style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
         border: 1px solid {$colorStore.primary}30;
         transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);"
>
  {#if title}
    <h2
      class="pt-2 px-6 text-center font-bold text-[22px] group-hover:text-shadow-lg transition-all duration-300 group-hover:scale-105"
      style="color: {$colorStore.text}"
    >
      {title}
    </h2>
  {/if}
  {#if description}
    <p
      class="pt-2 px-6 text-center font-medium text-md leading-relaxed group-hover:scale-102 transition-all duration-300"
      style="color: {$colorStore.muted}"
    >
      {@html description}
    </p>
  {/if}
  {#if $$slots.default}
    <div class="pt-10 px-10 flex justify-center group-hover:scale-105 transition-transform duration-500">
      <div class="w-full h-max overflow-hidden rounded-xl">
        <slot />
      </div>
    </div>
  {/if}
  {#if cta}
    <div class="pt-4 flex justify-center">
      <a
        class="group/cta relative w-max h-max py-3 px-8 font-bold text-xl backdrop-blur-sm rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-110 active:scale-95 overflow-hidden"
        href={cta.href}
        target={cta.target}
        rel="noreferrer"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}25, {$colorStore.gradientMid}35);
      color: {$colorStore.text};
      border: 1px solid {$colorStore.primary}50;"
      >
        <span class="relative z-10">{cta.text}</span>
        <div
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/cta:translate-x-full transition-transform duration-700"></div>
      </a>
    </div>
  {/if}
</section>

<style>
    section {
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    section:hover {
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
        0 0 0 1px var(--color-primary, #3b82f6) with 30% opacity;
        border-color: var(--color-primary, #3b82f6) with 60% opacity;
    }

    section:focus {
        outline: 2px solid var(--color-primary, #3b82f6);
        outline-offset: 2px;
    }

    a {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Enhanced hover effects */
    .group:hover .group\/cta {
        animation: subtle-bounce 0.6s ease-in-out;
    }

    @keyframes subtle-bounce {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }

    /* Text shadow for better readability *//* Smooth scale animations */
    .group-hover\:scale-102:hover {
        transform: scale(1.02);
    }

    /* Accessibility improvements */
    section:focus-visible {
        outline: 3px solid var(--color-accent, #ec4899);
        outline-offset: 3px;
    }
</style>