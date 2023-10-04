<script lang="ts">
    import reducedMotion from '$lib/reducedMotion';
    import type {SvelteComponent} from "svelte";

    export type Item = {
        props: Record<string, any>
        component: typeof SvelteComponent
    }

    export let items: Item[] = []
    export let defaultAbsoluteNavigation = true;
    export let defaultRelativeNavigation = true;

    export let currentIndex: number
    export let itemCount: number

    //Bound to the carousel list
    let carousel: HTMLElement
    //Bound to the carousel items ordered by their index
    let carouselElements: HTMLElement[] = []
    //Updated to the current scroll position of the carousel
    let carouselScroll: number

    //The amount of items in the carousel
    $: itemCount = items?.length ?? 0
    //The scrolled width divided by the width of a single image (maximum width/image count) is the index of the currently centered image
    $: currentIndex = !carousel || !carouselScroll ? 0 : Math.round(carouselScroll / (carousel?.scrollWidth / itemCount))

    function scrollToIndex(index: number) {
        //Check if index is in bounds
        if (index < 0 || index >= itemCount) return
        //Determine the element to scroll to
        const scrollToElement = carouselElements[index]
        if (!scrollToElement) return
        //Scroll to the element, smooth if reduced motion is not enabled
        carousel?.scroll(scrollToElement.offsetLeft, 0)
    }
</script>

<div class="relative h-full w-full">
    {#if itemCount > 1}
        <ol class="flex items-center overflow-x-auto gap-6 snap-x snap-mandatory no-scrollbar {$reducedMotion ? '' : 'scroll-smooth'}"
            bind:this={carousel}
            on:scroll={() => carouselScroll = carousel.scrollLeft}>
            {#each items as {props, component}, index}
                <li bind:this="{carouselElements[index]}"
                    class="relative h-full w-full snap-center flex grow-0 shrink-0 basis-full">
                    <svelte:component this={component} {...props}/>
                </li>
            {/each}
        </ol>
        <nav title="carousel nav">
            <slot name="navigation" {scrollToIndex} {currentIndex} {itemCount}>
                {#if defaultRelativeNavigation}
                    <div class="absolute h-[100%] w-min left-0 top-0 flex content-center mx-2">
                        <button title="navigate one left" on:click={() => scrollToIndex(currentIndex - 1)}
                                disabled={currentIndex <= 0}>
                            <svg viewBox="3 1 10 15" xmlns="http://www.w3.org/2000/svg"
                                 class="h-8 stroke-mewd-white opacity-60 hover:opacity-100">
                                <path style="stroke-linecap: round; stroke-miterlimit: 10;"
                                      d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                                />
                            </svg>
                        </button>
                    </div>
                    <div class="absolute h-[100%] w-min right-0 top-0 flex content-center mx-2">
                        <button title="navigate one right" on:click={() => scrollToIndex(currentIndex + 1)}
                                disabled={currentIndex >= itemCount - 1}>
                            <svg viewBox="3 1 10 15" xmlns="http://www.w3.org/2000/svg"
                                 class="h-8 stroke-mewd-white opacity-60 hover:opacity-100">
                                <path style="stroke-linecap: round; stroke-miterlimit: 10;"
                                      d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                />
                            </svg>
                        </button>
                    </div>
                {/if}
                {#if defaultAbsoluteNavigation}
                    <div class="absolute bottom-0 w-full flex gap-2 place-content-center my-2">
                        {#each items as _ , index}
                            <button title="scroll #{index + 1} into view"
                                    class="w-[32px] h-[6px] rounded-md bg-mewd-white {index === currentIndex ? 'bg-opacity-100' : 'bg-opacity-60  hover:bg-opacity-100'}"
                                    on:click={() => scrollToIndex(index)}>
                            </button>
                        {/each}
                    </div>
                {/if}
            </slot>
        </nav>
    {:else if itemCount === 1 }
        <div class="w-full h-full">
            <svelte:component this={items[0].component} {...items[0].props}/>
        </div>
    {/if}
</div>

<style>
    /* Hide scrollbar for Chrome, Safari and Opera */
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    .no-scrollbar {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
    }
</style>