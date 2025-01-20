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
  class="w-full h-max m-6 pt-6 pb-8 max-w-[34rem] grid grid-cols-1 justify-center rounded-2xl backdrop-blur-sm hover:shadow-lg"
  style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
         border: 1px solid {$colorStore.primary}30;
         transition: all 0.2s ease-in-out;"
>
  {#if title}
    <h2
      class="pt-2 px-6 text-center font-bold text-[22px]"
      style="color: {$colorStore.text}"
    >
      {title}
    </h2>
  {/if}
  {#if description}
    <p
      class="pt-2 px-6 text-center font-bold text-md"
      style="color: {$colorStore.muted}"
    >
      {@html description}
    </p>
  {/if}
  {#if $$slots.default}
    <div class="pt-10 px-10 flex justify-center">
      <div class="w-full h-max">
        <slot />
      </div>
    </div>
  {/if}
  {#if cta}
    <div class="pt-4 flex justify-center">

      <a
        class="w-max h-max py-2 px-6 font-bold text-2xl backdrop-blur-sm rounded-full transition-all duration-200 hover:bg-white/5"
        href={cta.href}
        target={cta.target}
        rel="noreferrer"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}25);
      color: {$colorStore.text};
      border: 1px solid {$colorStore.primary}40;"
      >
        {cta.text}
      </a>
    </div>
  {/if}
</section>

<style>
    section {
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }


    a {
        transition: all 0.2s ease-in-out;
    }

</style>