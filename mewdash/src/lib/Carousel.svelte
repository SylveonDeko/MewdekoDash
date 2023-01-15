<script lang="ts">
    type ImageType = {
        title: string,
        src: string
    }
    export let images: ImageType[]
    export let name: string = 'carousel'
    export const getItemId = (index: number) => `${name}-item-${index}`

    let carousel: HTMLElement
    let scrolledFromLeft
    $: pictureWidth = carousel?.scrollWidth / images?.length
    $: currentId = !carousel || !scrolledFromLeft || !pictureWidth ? 0 : Math.round(scrolledFromLeft / pictureWidth)
    $: scrollRigthPossible = currentId < images?.length - 1
    $: scrollLeftPossible = currentId > 0

    function scrollTo({target}) {
        const link = target.getAttribute('href')
        if (!link) return

        scrollToId(link.slice(1))
    }

    function scrollRight() {
        if (!scrollRigthPossible) return
        scrollToId(getItemId(currentId + 1))
    }

    function scrollLeft() {
        if (!scrollLeftPossible) return
        scrollToId(getItemId(currentId - 1))
    }

    function scrollToId(id: string) {
        const scrollToElement = document.getElementById(id)
        if (!scrollToElement) return

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        scrollToElement.scrollIntoView({
            block: 'nearest',
            inline: 'center',
            behavior: mediaQuery.matches ? 'auto' : 'smooth',
        })
    }
</script>
<div class="relative">
    <ul class="flex overflow-x-auto gap-6 snap-x snap-mandatory no-scroller"
        bind:this={carousel}
        on:scroll={()=>scrolledFromLeft=carousel.scrollLeft}>
        {#each images as {title, src}, index}
            <li id="{getItemId(index)}" class="w-full shrink-0 snap-center flex flex-col justify-center">
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
                    <button class="w-[32px] h-[6px] rounded-md hover:bg-mewd-white {index === currentId ? 'bg-mewd-white' : ' bg-mewd-transparent'}"
                            href="#{getItemId(index)}"
                            on:click={scrollTo}>
                    </button>
                {/each}
            </div>
        </div>
        {#if scrollLeftPossible}
            <button title="navigate one left" class="absolute w-min top-[45%] -left-6" on:click={scrollLeft}>
                <svg class="h-8 stroke-mewd-transparent hover:stroke-mewd-white" viewBox="4 1 12 15"
                     xmlns="http://www.w3.org/2000/svg" fill-opacity="0">
                    <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                          stroke-linecap="round" stroke-miterlimit="10"
                          stroke-width="1"/>
                </svg>
            </button>
        {/if}
        {#if scrollRigthPossible}
            <button title="navigate one right" class="absolute w-min top-[45%] -right-8" on:click={scrollRight}>
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