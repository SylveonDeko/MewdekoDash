<script lang="ts">
    import reducedMotion from './reducedMotion';

    type ImageType = {
        title: string,
        src: string
    }
    export let images: ImageType[]
    export let name: string = 'carousel'

    //Carousel unique prefix (as long as name is unique)
    const idPrefix = `${name}-item-`
    //Adds the prefix to and index -> unique element identifier
    const getIdForIndex = (index: number) => idPrefix + index
    //Removes the prefix from an id -> index
    const getIndexFromId = (id: string) => parseInt(id.replace(idPrefix, ''))

    //Bound to the carousel list
    let carousel: HTMLElement
    //Bound to the carousel items ordered by their index
    let carouselImages: HTMLElement[] = []
    //Updated to the current scroll position of the carousel
    let carouselScroll: number

    //The scrolled width divided by the width of a single image (maximum width/image count) is the index of the currently centered image
    $: currentIndex = !carousel || !carouselScroll ? 0 : Math.round(carouselScroll / (carousel?.scrollWidth / images?.length))

    //Used to scroll the carousel by a href element (needs to prevent default)
    function scrollTo({target}) {
        const link = target.getAttribute('href')
        if (!link) return
        scrollToIndex(getIndexFromId(link.slice(1)))
    }

    //Scrolls the carousel to the image at the given index, smoothly if reduced motion is not enabled
    function scrollToIndex(index: number) {
        const scrollToElement = carouselImages[index]
        if (!scrollToElement) return

        scrollToElement.scrollIntoView({
            block: 'nearest',
            inline: 'center',
            behavior: $reducedMotion ? 'auto' : 'smooth',
        })
    }
</script>
<div class="relative">
    <ul class="flex overflow-x-auto gap-6 snap-x snap-mandatory no-scroller"
        bind:this={carousel}
        on:scroll={() => carouselScroll = carousel.scrollLeft}>
        {#each images as {title, src}, index}
            <li id="{getIdForIndex(index)}" bind:this="{carouselImages[index]}"
                class="w-full shrink-0 snap-center flex flex-col justify-center">
                <img {src} {title} alt="{title}" class="w-full overflow-hidden rounded-xl"/>
            </li>
        {/each}
    </ul>
    <!--suppress JSUnresolvedVariable -->
    <nav title="{name} nav">
        <div title="absolute navigation" class="w-full bottom-0 left-0 absolute flex flex-col justify-end">
            <div class="flex gap-2 place-content-center pb-4 ">
                {#each images as _ , index}
                    <!--suppress JSUnresolvedVariable -->
                    <button class="w-[32px] h-[6px] rounded-md hover:bg-mewd-white {index === currentIndex ? 'bg-mewd-white' : ' bg-mewd-transparent'}"
                            href="#{getIdForIndex(index)}"
                            on:click={scrollTo}>
                    </button>
                {/each}
            </div>
        </div>
        {#if currentIndex > 0}
            <!--suppress JSUnresolvedVariable -->
            <button title="navigate one left" class="absolute w-min top-[45%] -left-6"
                    on:click={() => scrollToIndex(currentIndex - 1)}>
                <svg class="h-8 stroke-mewd-transparent hover:stroke-mewd-white" viewBox="4 1 12 15"
                     xmlns="http://www.w3.org/2000/svg" fill-opacity="0">
                    <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                          stroke-linecap="round" stroke-miterlimit="10"
                          stroke-width="1"/>
                </svg>
            </button>
        {/if}
        {#if currentIndex < images?.length - 1}
            <!--suppress JSUnresolvedVariable -->
            <button title="navigate one right" class="absolute w-min top-[45%] -right-8"
                    on:click={() => scrollToIndex(currentIndex + 1)}>
                <svg class="h-8 stroke-mewd-transparent hover:stroke-mewd-white" viewBox="4 1 12 15"
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