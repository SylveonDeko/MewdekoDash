<script context="module" lang="ts">
  import type { SvelteComponent } from "svelte";

  export interface Item {
    props: Record<string, any>;
    component: typeof SvelteComponent | null;
  }
</script>

<script lang="ts">
  import reducedMotion from "$lib/reducedMotion.ts";

  export let items: Item[] = [];
  export let defaultAbsoluteNavigation = true;
  export let defaultRelativeNavigation = true;

  export let currentIndex: number;
  export let itemCount: number;

  //Bound to the carousel list
  let carousel: HTMLElement;
  //Bound to the carousel items ordered by their index
  let carouselElements: HTMLElement[] = [];
  //Updated to the current scroll position of the carousel
  let carouselScroll: number;

  // Generate unique ID for ARIA labeling
  const carouselId = `carousel-${Math.random().toString(36).substr(2, 9)}`;
  const liveRegionId = `${carouselId}-live`;

  //The amount of items in the carousel
  $: itemCount = items?.length ?? 0;
  //The scrolled width divided by the width of a single image (maximum width/image count) is the index of the currently centered image
  $: currentIndex =
    !carousel || !carouselScroll
      ? 0
      : Math.round(carouselScroll / (carousel?.scrollWidth / itemCount));

  function scrollToIndex(index: number) {
    //Check if index is in bounds
    if (index < 0 || index >= itemCount) return;
    //Determine the element to scroll to
    const scrollToElement = carouselElements[index];
    if (!scrollToElement) return;
    //Scroll to the element, smooth if reduced motion is not enabled
    carousel?.scroll(scrollToElement.offsetLeft, 0);
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        if (currentIndex > 0) {
          scrollToIndex(currentIndex - 1);
        }
        break;
      case "ArrowRight":
        event.preventDefault();
        if (currentIndex < itemCount - 1) {
          scrollToIndex(currentIndex + 1);
        }
        break;
      case "Home":
        event.preventDefault();
        scrollToIndex(0);
        break;
      case "End":
        event.preventDefault();
        scrollToIndex(itemCount - 1);
        break;
    }
  }
</script>

<div class="relative h-full w-full">
  <!-- Live region for announcing current item -->
  <div aria-atomic="true" aria-live="polite" class="sr-only" id="{liveRegionId}">
    {#if itemCount > 1}
      Showing item {currentIndex + 1} of {itemCount}
    {/if}
  </div>

  {#if itemCount > 1}
    <section
      role="region"
      aria-roledescription="carousel"
      aria-labelledby="{carouselId}-label"
      tabindex="0"
      on:keydown={handleKeydown}
    >
      <h2 id="{carouselId}-label" class="sr-only">Content Carousel</h2>
      <ol
        class="flex items-center overflow-x-auto gap-6 snap-x snap-mandatory no-scrollbar {$reducedMotion
          ? ''
          : 'scroll-smooth'}"
        bind:this={carousel}
        on:scroll={() => (carouselScroll = carousel.scrollLeft)}
      >
      {#each items as { props, component }, index}
        <li
          bind:this={carouselElements[index]}
          class="relative h-full w-full snap-center flex grow-0 shrink-0 basis-full"
          aria-current={index === currentIndex ? 'true' : 'false'}
          aria-label="Item {index + 1} of {itemCount}"
        >
          <svelte:component this={component} {...props} />
        </li>
      {/each}
    </ol>
      <nav aria-label="Carousel navigation controls">
      <slot name="navigation" {scrollToIndex} {currentIndex} {itemCount}>
        {#if defaultRelativeNavigation}
          <div
            class="absolute h-[100%] w-min left-0 top-0 flex content-center mx-2"
          >
            <button
              aria-label="Go to previous item"
              on:click={() => scrollToIndex(currentIndex - 1)}
              disabled={currentIndex <= 0}
              tabindex={defaultRelativeNavigation ? 0 : -1}
            >
              <svg
                viewBox="3 1 10 15"
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 stroke-mewd-white opacity-60 hover:opacity-100"
              >
                <path
                  style="stroke-linecap: round; stroke-miterlimit: 10;"
                  d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                />
              </svg>
            </button>
          </div>
          <div
            class="absolute h-[100%] w-min right-0 top-0 flex content-center mx-2"
          >
            <button
              aria-label="Go to next item"
              on:click={() => scrollToIndex(currentIndex + 1)}
              disabled={currentIndex >= itemCount - 1}
              tabindex={defaultRelativeNavigation ? 0 : -1}
            >
              <svg
                viewBox="3 1 10 15"
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 stroke-mewd-white opacity-60 hover:opacity-100"
              >
                <path
                  style="stroke-linecap: round; stroke-miterlimit: 10;"
                  d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                />
              </svg>
            </button>
          </div>
        {/if}
        {#if defaultAbsoluteNavigation}
          <div
            class="absolute bottom-0 w-full flex gap-2 place-content-center my-2"
          >
            {#each items as _, index}
              <button
                aria-label="Go to item {index + 1} of {itemCount}"
                aria-current={index === currentIndex ? 'true' : 'false'}
                class="w-[32px] h-[6px] rounded-md bg-mewd-white {index ===
                currentIndex
                  ? 'bg-opacity-100'
                  : 'bg-opacity-60  hover:bg-opacity-100'}"
                on:click={() => scrollToIndex(index)}
                tabindex={defaultAbsoluteNavigation ? 0 : -1}
              >
              </button>
            {/each}
          </div>
        {/if}
      </slot>
    </nav>
    </section>
  {:else if itemCount === 1}
    <div class="w-full h-full">
      <svelte:component this={items[0].component} {...items[0].props} />
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

  /* Screen reader only content */
  .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
  }
</style>
