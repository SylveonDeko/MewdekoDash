<script lang="ts">
    import reducedMotion from '../reducedMotion';

    type ImageType = {
        title: string,
        src: string
    }
    export let images: ImageType[] = []

    //Bound to the carousel list
    let carousel: HTMLElement
    //Bound to the carousel items ordered by their index
    let carouselImages: HTMLElement[] = []
    //Updated to the current scroll position of the carousel
    let carouselScroll: number

    //The scrolled width divided by the width of a single image (maximum width/image count) is the index of the currently centered image
    $: currentIndex = !carousel || !carouselScroll ? 0 : Math.round(carouselScroll / (carousel?.scrollWidth / images?.length))

    //Scrolls the carousel to the image at the given index
    function scrollToIndex(index: number) {
        //Check if index is in bounds
        if (index < 0 || index >= images.length) return
        //Determine the element to scroll to
        const scrollToElement = carouselImages[index]
        if (!scrollToElement) return
        //Scroll to the element, smooth if reduced motion is not enabled
        scrollToElement.scrollIntoView({
            block: 'nearest',
            inline: 'center'
        })
    }
</script>
<div class="relative mb-4">
    <ul class="flex overflow-x-auto gap-6 snap-x snap-mandatory no-scroller {$reducedMotion ? '' : 'scroll-smooth'}"
        bind:this={carousel}
        on:scroll={() => carouselScroll = carousel.scrollLeft}>
        {#each images as {title, src}, index}
            <li bind:this="{carouselImages[index]}"
                class="w-full shrink-0 snap-center flex flex-col justify-center">
                <img {src} {title} alt="{title}" class="w-full overflow-hidden rounded-xl"/>
            </li>
        {/each}
    </ul>
    <!--suppress JSUnresolvedVariable -->
    <nav title="carousel nav">
        <div title="absolute navigation" class="w-full -bottom-4 left-0 absolute flex flex-col justify-end">
            <div class="flex gap-2 place-content-center">
                {#each images as _ , index}
                    <!--suppress JSUnresolvedVariable -->
                    <button title="scroll image {index} into view"
                            class="w-[32px] h-[6px] rounded-md hover:bg-mewd-white {index === currentIndex ? 'bg-mewd-white' : ' bg-mewd-transparent'}"
                            on:click={() => scrollToIndex(index)}>
                    </button>
                {/each}
            </div>
        </div>
        {#if currentIndex > 0}
            <!--suppress JSUnresolvedVariable -->
            <button title="navigate one left" class="absolute w-min top-[45%] -left-7"
                    on:click={() => scrollToIndex(currentIndex - 1)}>
                <svg class="h-8 stroke-mewd-transparent hover:stroke-mewd-white" viewBox="3 1 10 15"
                     xmlns="http://www.w3.org/2000/svg" fill-opacity="0">
                    <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                          stroke-linecap="round" stroke-miterlimit="10"
                          stroke-width="1"/>
                </svg>
            </button>
        {/if}
        {#if currentIndex < images.length - 1}
            <!--suppress JSUnresolvedVariable -->
            <button title="navigate one right" class="absolute w-min top-[45%] -right-7"
                    on:click={() => scrollToIndex(currentIndex + 1)}>
                <svg class="h-8 stroke-mewd-transparent hover:stroke-mewd-white" viewBox="3 1 10 15"
                     xmlns="http://www.w3.org/2000/svg" fill-opacity="0">
                    <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                          stroke-linecap="round" stroke-miterlimit="10"
                          stroke-width="1"/>
                </svg>
            </button>
        {/if}
    </nav>
</div>


<style>
    /* Hide scrollbar for Chrome, Safari and Opera */
    .no-scroller::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    .no-scroller {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
    }
</style>