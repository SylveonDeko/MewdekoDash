<script lang="ts">
    function scrollIntoView({target}) {
        const link = target.getAttribute('href')
        if (!link) return

        const scrollToElement = document.querySelector(link)

        if (!scrollToElement) return

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

        scrollToElement.scrollIntoView({
            block: 'nearest',
            inline: 'center',
            behavior: mediaQuery.matches ? 'auto' : 'smooth',
        })
    }

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
    $: current= !carousel || !scrolledFromLeft || !pictureWidth ?getItemId( 0) : getItemId(Math.round(scrolledFromLeft / pictureWidth))
</script>
<div class="overflow-hidden relative ">
    <ul class="flex overflow-x-auto gap-6 snap-x snap-mandatory no-scroller"
        bind:this={carousel}
        on:scroll={()=>scrolledFromLeft=carousel.scrollLeft}>
        {#each images as {title, src}, index}
            <li id="{getItemId(index)}" class="w-full shrink-0 snap-center flex flex-col justify-center">
                <img {src} {title} alt="{title}" class="w-full overflow-hidden rounded-xl"/>
            </li>
        {/each}
    </ul>
    <nav title="{name}-nav" class="w-full bottom-0 left-0 absolute flex flex-col justify-end">
        <div class="flex gap-2 place-content-center pb-4">
            {#each images as _ , index}
                <!--suppress JSUnresolvedVariable -->
                <button class="w-[32px] h-[6px] rounded-md {getItemId(index) === current ? 'bg-mewd-white' : ' bg-mewd-transparent'}"
                        href="#{getItemId(index)}"
                        on:click|preventDefault={scrollIntoView}>
                </button>
            {/each}
        </div>
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