<!-- lib/MultiButton.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { clickOutside } from "./clickOutside";

  export let buttons: ButtonConfig[] = [];

  interface ButtonConfig {
    label: string;
    href?: string;
    options?: OptionConfig[];
    ariaLabel?: string;
  }

  interface OptionConfig {
    label: string;
    href: string;
    ariaLabel?: string;
  }

  let openDropdownIndex: number | null = null;

  function toggleDropdown(index: number) {
    if (openDropdownIndex === index) {
      openDropdownIndex = null;
    } else {
      openDropdownIndex = index;
    }
  }
</script>

<div class="flex mt-8 items-stretch">
  {#each buttons as button, index}
    {#if button.options}
      <!-- Button with Dropdown -->
      <div
        class="relative {index > 0 ? '-ml-px' : ''}"
        use:clickOutside
        on:clickoutside={() => (openDropdownIndex = null)}
      >
        <button
          on:click={() => toggleDropdown(index)}
          class="inline-flex items-center justify-center bg-mewd-yellow text-mewd-white font-bold text-2xl px-6 py-2 border border-mewd-yellow transition-colors duration-200
          {index === 0 ? 'rounded-l-full' : ''}
          {index === buttons.length - 1 ? 'rounded-r-full' : ''}
          hover:bg-mewd-dark-yellow focus:outline-none h-full"
          aria-label={button.ariaLabel || button.label}
          aria-expanded={openDropdownIndex === index}
          aria-controls={`dropdown-${index}`}
        >
          {button.label}
        </button>

        {#if openDropdownIndex === index}
          <!-- Dropdown Options -->
          <div
            id={`dropdown-${index}`}
            class="absolute left-0 mt-2 z-10 w-full"
            in:fly={{ y: -10, duration: 300, easing: cubicOut }}
            out:fly={{ y: -10, duration: 300, easing: cubicOut }}
          >
            <div class="bg-mewd-dark-grey rounded-md shadow-lg py-2">
              {#each button.options as option}
                <a
                  href={option.href}
                  class="block px-4 py-2 text-mewd-white hover:bg-mewd-yellow hover:text-mewd-dark-grey"
                  target="_blank"
                  rel="noreferrer"
                  aria-label={option.ariaLabel || option.label}
                >
                  {option.label}
                </a>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <!-- Simple Button or Link -->
      {#if button.href}
        <div class="relative {index > 0 ? '-ml-px' : ''}">
          <a
            href={button.href}
            class="inline-flex items-center justify-center bg-mewd-yellow text-mewd-white font-bold text-2xl px-6 py-2 border border-mewd-yellow transition-colors duration-200
            {index === 0 ? 'rounded-l-full' : ''}
            {index === buttons.length - 1 ? 'rounded-r-full' : ''}
            hover:bg-mewd-dark-yellow focus:outline-none h-full"
            target="_blank"
            rel="noreferrer"
            aria-label={button.ariaLabel || button.label}
          >
            {button.label}
          </a>
        </div>
      {:else}
        <div class="relative {index > 0 ? '-ml-px' : ''}">
          <button
            class="inline-flex items-center justify-center bg-mewd-yellow text-mewd-white font-bold text-2xl px-6 py-2 border border-mewd-yellow transition-colors duration-200
            {index === 0 ? 'rounded-l-full' : ''}
            {index === buttons.length - 1 ? 'rounded-r-full' : ''}
            hover:bg-mewd-dark-yellow focus:outline-none h-full"
            aria-label={button.ariaLabel || button.label}
          >
            {button.label}
          </button>
        </div>
      {/if}
    {/if}
  {/each}
</div>
