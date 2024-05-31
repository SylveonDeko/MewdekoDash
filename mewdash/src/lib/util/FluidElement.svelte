<script lang="ts">
    const sizes = ["1/2", "1/3", "1/4", "1/5"]

    export let breakpoints = ["md", "lg", "xl"];
    export let maxBreaks: number = sizes.length;

    const widths = Array.from(Array(Math.min(maxBreaks - 1, sizes.length, breakpoints.length)).keys()) //maxBreaks - 1 because of 0 index
        .map((i) => `${breakpoints[i]}:w-${sizes[i]}`)  //Go  and map that to ascending splits
        .join(" ") //join with space

    /* DONT REMOVE THIS, ITS FOR TAILWIND RETAINING CLASSES
        md:w-1/2 md:w-1/3 md:w-1/4 md:w-1/5
        lg:w-1/2 lg:w-1/3 lg:w-1/4 lg:w-1/5
        xl:w-1/2 xl:w-1/3 xl:w-1/4 xl:w-1/5
    */
</script>

<div class="w-full {widths} flex justify-center">
    <slot/>
</div>
