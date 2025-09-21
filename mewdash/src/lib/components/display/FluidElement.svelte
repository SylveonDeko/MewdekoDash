<!-- lib/util/FluidElement.svelte -->
<script lang="ts">
  const sizes = ["1/2", "1/3", "1/4", "1/5"];

  interface Props {
    breakpoints?: any;
    maxBreaks?: number;
    children?: import('svelte').Snippet;
  }

  let { breakpoints = ["md", "lg", "xl"], maxBreaks = sizes.length, children }: Props = $props();

  const widths = Array.from(
    Array(Math.min(maxBreaks - 1, sizes.length, breakpoints.length)).keys(),
  ) //maxBreaks - 1 because of 0 index
    .map((i) => `${breakpoints[i]}:w-${sizes[i]}`) //Go  and map that to ascending splits
    .join(" "); //join with space

  /*OOPSIE */
</script>

<div class="w-full {widths} flex justify-center">
  {@render children?.()}
</div>
