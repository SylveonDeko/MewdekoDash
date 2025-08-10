<!-- lib/util/FluidContainer.svelte -->
<script lang="ts">
  import Elem from "$lib/components/display/FluidElement.svelte";

  export let breakpoints = ["md", "lg", "xl"];
  const maxBreaks = Object.keys($$slots).length;

  // Create an array of slot names
  const slotNames = Array.from({ length: 12 }, (_, i) => `element-${i + 1}`);
</script>

<div class="flex flex-wrap justify-center">
  {#each slotNames as slotName}
    {#if $$slots[slotName]}
      <Elem {breakpoints} {maxBreaks}>
        {#if slotName === "element-1"}
          <slot name="element-1" />
        {:else if slotName === "element-2"}
          <slot name="element-2" />
        {:else if slotName === "element-3"}
          <slot name="element-3" />
        {:else if slotName === "element-4"}
          <slot name="element-4" />
        {:else if slotName === "element-5"}
          <slot name="element-5" />
        {:else if slotName === "element-6"}
          <slot name="element-6" />
        {:else if slotName === "element-7"}
          <slot name="element-7" />
        {:else if slotName === "element-8"}
          <slot name="element-8" />
        {:else if slotName === "element-9"}
          <slot name="element-9" />
        {:else if slotName === "element-10"}
          <slot name="element-10" />
        {:else if slotName === "element-11"}
          <slot name="element-11" />
        {:else if slotName === "element-12"}
          <slot name="element-12" />
        {/if}
      </Elem>
    {/if}
  {/each}
</div>
