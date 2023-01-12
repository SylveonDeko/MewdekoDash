<script lang="ts">
    export let small: boolean = false;
</script>
<div class="w-full {small?'sm:w-1/2 md:w-1/3 lg:w-1/4':'md:w-1/2 lg:w-1/3 xl:w-1/4'} flex justify-center">
    <slot/>
</div>