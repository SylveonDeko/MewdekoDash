<script lang="ts">
  export let title: string;
  export let description: string;
  export let cta: {
    href: string;
    text: string;
    target: string | "_blank";
  } | null = null;
</script>

<section
  class="w-full h-max m-6 pt-6 pb-8 max-w-[34rem] grid grid-cols-1 justify-center rounded-2xl bg-mewd-light-grey"
>
  {#if title}
    <h2 class="pt-2 px-6 text-center font-bold text-mewd-white text-[22px]">
      {title}
    </h2>
  {/if}
  {#if description}
    <p class="pt-2 px-6 text-center font-bold text-mewd-offwhite text-md">
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
        class="w-max h-max py-2 px-4 bg-mewd-yellow text-mewd-white font-bold rounded-full"
        href={cta.href}
        target={cta.target}
        rel="noreferrer"
        >{cta.text}
      </a>
    </div>
  {/if}
</section>
