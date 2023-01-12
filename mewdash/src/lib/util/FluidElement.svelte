<script lang="ts">
    const sizes = ["1/2", "1/3", "1/4"]

    export let breakpoints = ["md", "lg", "xl"];
    export let maxBreaks: number = sizes.length;

    const widths = Array.from(Array(Math.min(maxBreaks - 1, sizes.length, breakpoints.length)).keys()) //maxBreaks - 1 because of 0 index
        .map((i) => `${breakpoints[i]}:w-${sizes[i]}`)  //Go  and map that to ascending splits
        .join(" ") //join with space

    console.log(widths)
</script>

<div class="w-full {widths} flex justify-center">
    <slot/>
</div>