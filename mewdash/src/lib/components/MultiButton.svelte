<!-- lib/MultiButton.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { clickOutside } from "../clickOutside.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";

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

<div class="mt-8 flex justify-center z-50">
  <div
    class="flex items-stretch relative rounded-full backdrop-blur-sm transition-all duration-200"
    style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
           border: 1px solid {$colorStore.primary}30;"
  >
    {#each buttons as button, index}
      {#if button.options}
        <!-- Button with Dropdown -->
        <div
          class="relative"
          use:clickOutside
          on:clickoutside={() => (openDropdownIndex = null)}
        >
          <button
            on:click={() => toggleDropdown(index)}
            class="inline-flex items-center justify-center font-bold text-2xl px-6 py-2
            transition-all duration-200 hover:bg-white/5"
            style="color: {$colorStore.text}"
            aria-label={button.ariaLabel || button.label}
            aria-expanded={openDropdownIndex === index}
            aria-controls={`dropdown-${index}`}
          >
            {button.label}
          </button>

          {#if openDropdownIndex === index}
            <div
              id={`dropdown-${index}`}
              class="absolute left-0 mt-2 w-full"
              in:fly={{ y: -10, duration: 300, easing: cubicOut }}
              out:fly={{ y: -10, duration: 300, easing: cubicOut }}
            >
              <div
                class="rounded-xl py-2 backdrop-blur-sm shadow-lg transition-all duration-200"
                style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                       border: 1px solid {$colorStore.primary}30;"
              >
                {#each button.options as option}
                  <a
                    href={option.href}
                    class="block px-4 py-2 hover:bg-white/5 transition-all duration-200"
                    style="color: {$colorStore.text}"
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
          <div class="relative">
            <a
              href={button.href}
              class="inline-flex items-center justify-center font-bold text-2xl px-6 py-2
              transition-all duration-200 hover:bg-white/5"
              style="color: {$colorStore.text}"
              target="_blank"
              rel="noreferrer"
              aria-label={button.ariaLabel || button.label}
            >
              {button.label}
            </a>
          </div>
        {:else}
          <div class="relative">
            <button
              class="inline-flex items-center justify-center font-bold text-2xl px-6 py-2
              transition-all duration-200 hover:bg-white/5"
              style="color: {$colorStore.text}"
              aria-label={button.ariaLabel || button.label}
            >
              {button.label}
            </button>
          </div>
        {/if}
      {/if}
    {/each}
  </div>
</div>

<style>
    div[style*="background"] {
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }
</style>