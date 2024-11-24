<!-- lib/nav/NavLink.svelte -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import { onMount } from "svelte";

  type Item = {
    title: string;
    wrapped: boolean;
    href?: string;
    children?: { title: string; href: string }[];
  };
  export let item: Item;
  export let current: string | null;
  let openOverride: boolean = false;
  let detailsElement: HTMLDetailsElement;

  function handleMouseLeave() {
    openOverride = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && openOverride) {
      openOverride = false;
      detailsElement.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      openOverride = !openOverride;
    }
  }

  onMount(() => {
    if (detailsElement) {
      detailsElement.addEventListener("toggle", () => {
        openOverride = detailsElement.open;
      });
    }
  });
  let menubarRef: HTMLDivElement;
</script>

<!-- Desktop - hidden md:block -->
{#if item.wrapped}
  <div
    role="menubar"
    tabindex="0"
    on:mouseleave={handleMouseLeave}
    on:keydown={handleKeydown}
    bind:this={menubarRef}
    class="hidden md:block"
  >
    <details
      class="group py-1 px-2 drop-shadow-xl"
      transition:slide
      bind:this={detailsElement}
      bind:open={openOverride}
    >
      <summary
        class="cursor-pointer flex list-none rounded text-mewd-offwhite hover:text-mewd-white stroke-mewd-offwhite hover:stroke-mewd-white"
        aria-haspopup="true"
        aria-expanded={openOverride}
      >
        {item.title}
        <svg
          viewBox="5 7 14 9"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          class="ml-1 w-4 group-open:rotate-180"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </summary>
      <div
        class="cursor-default absolute -translate-y-2 pb-6 pr-7 text-transparent"
        aria-hidden="true"
      >
        {"he".repeat(Math.ceil(item.title.length / 2))}
      </div>
      <div
        class="flex flex-col mt-2 -translate-x-2 absolute bg-mewd-light-grey rounded overflow-hidden w-max"
        role="menu"
      >
        {#each item.children as child}
          <a
            role="menuitem"
            tabindex="-1"
            aria-current={child.href === current ? "page" : undefined}
            class="py-1 pl-2 pr-4 hover:text-mewd-white {child.href === current
              ? 'text-white bg-mewd-yellow rounded text-mewd-white'
              : 'rounded text-mewd-offwhite hover:bg-mewd-light-grey hover:text-mewd-offwhite md:hover:bg-transparent'}"
            href={child.href}
          >
            {child.title}
          </a>
        {/each}
      </div>
    </details>
  </div>
{:else}
  <a
    aria-current={item.href === current ? "page" : undefined}
    class="hidden md:flex py-1 px-2 hover:text-mewd-white {item.href === current
      ? 'text-white bg-mewd-yellow rounded text-mewd-white'
      : 'rounded text-mewd-offwhite hover:bg-mewd-light-grey hover:text-mewd-offwhite md:hover:bg-transparent'}"
    href={item.href}
  >
    {item.title}
  </a>
{/if}

<!-- Mobile - md:hidden -->
{#if item.wrapped}
  {#each item.children as child}
    <a
      aria-current={child.href === current ? "page" : undefined}
      class="md:hidden py-2 pl-3 pr-4 {child.href === current
        ? 'text-white bg-mewd-yellow rounded md:bg-transparent md:p-0 text-mewd-white'
        : 'rounded md:border-0 md:p-0 text-mewd-offwhite md:hover:text-mewd-white hover:bg-mewd-light-grey hover:text-mewd-offwhite md:hover:bg-transparent'}"
      href={child.href}
    >
      {child.title}
    </a>
  {/each}
{:else}
  <a
    aria-current={item.href === current ? "page" : undefined}
    class="md:hidden py-2 pl-3 pr-4 {item.href === current
      ? 'text-white bg-mewd-yellow rounded md:bg-transparent md:p-0'
      : 'rounded md:border-0 md:p-0 text-mewd-offwhite md:hover:text-mewd-white hover:bg-mewd-light-grey hover:text-mewd-offwhite md:hover:bg-transparent'}"
    href={item.href}
  >
    {item.title}
  </a>
{/if}
