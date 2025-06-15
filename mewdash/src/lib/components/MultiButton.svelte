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
    class="flex flex-col sm:flex-row items-stretch relative rounded-2xl sm:rounded-full backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-2xl"
    style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
           border: 1px solid {$colorStore.primary}30;"
  >
    {#each buttons as button, index}
      {#if button.options}
        <!-- Button with Dropdown -->
        <div
          class="relative flex-1 sm:flex-initial"
          use:clickOutside
          on:clickoutside={() => (openDropdownIndex = null)}
        >
          <button
            on:click={() => toggleDropdown(index)}
            class="w-full sm:w-auto inline-flex items-center justify-center font-bold text-xl sm:text-2xl px-6 py-3 sm:py-2
            transition-all duration-300 hover:bg-white/5 hover:scale-105 active:scale-95 rounded-xl sm:rounded-none focus:outline-none focus:ring-2 focus:ring-offset-2"
            style="color: {$colorStore.text}; --tw-ring-color: {$colorStore.accent};"
            aria-label={button.ariaLabel || button.label}
            aria-expanded={openDropdownIndex === index}
            aria-controls={`dropdown-${index}`}
          >
            <span class="mr-2">{button.label}</span>
            <svg class="w-4 h-4 transition-transform duration-200" class:rotate-180={openDropdownIndex === index}
                 fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
            </svg>
          </button>

          {#if openDropdownIndex === index}
            <div
              id={`dropdown-${index}`}
              class="absolute left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-48 z-50"
              in:fly={{ y: -10, duration: 300, easing: cubicOut }}
              out:fly={{ y: -10, duration: 300, easing: cubicOut }}
            >
              <div
                class="rounded-xl py-2 backdrop-blur-md shadow-2xl transition-all duration-300 border-2"
                style="background: linear-gradient(135deg, {$colorStore.gradientStart}90, {$colorStore.gradientMid}90);
                       border-color: {$colorStore.primary}50;"
              >
                {#each button.options as option, optionIndex}
                  <a
                    href={option.href}
                    class="group block px-4 py-3 hover:bg-white/10 transition-all duration-200 focus:bg-white/10 focus:outline-none rounded-lg mx-2"
                    style="color: {$colorStore.text}"
                    target="_blank"
                    rel="noreferrer"
                    aria-label={option.ariaLabel || option.label}
                    in:fly={{ x: -10, duration: 200, delay: optionIndex * 50 }}
                  >
                    <span class="flex items-center gap-2">
                      <span class="group-hover:scale-110 transition-transform">{option.label}</span>
                      <svg class="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" fill="currentColor"
                           viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                              clip-rule="evenodd" />
                      </svg>
                    </span>
                  </a>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <!-- Simple Button or Link -->
        {#if button.href}
          <div class="relative flex-1 sm:flex-initial">
            <a
              href={button.href}
              class="group w-full sm:w-auto inline-flex items-center justify-center font-bold text-xl sm:text-2xl px-6 py-3 sm:py-2
              transition-all duration-300 hover:bg-white/5 hover:scale-105 active:scale-95 rounded-xl sm:rounded-none focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden"
              style="color: {$colorStore.text}; --tw-ring-color: {$colorStore.accent};"
              target="_blank"
              rel="noreferrer"
              aria-label={button.ariaLabel || button.label}
            >
              <span class="relative z-10">{button.label}</span>
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </a>
          </div>
        {:else}
          <div class="relative flex-1 sm:flex-initial">
            <button
              class="group w-full sm:w-auto inline-flex items-center justify-center font-bold text-xl sm:text-2xl px-6 py-3 sm:py-2
              transition-all duration-300 hover:bg-white/5 hover:scale-105 active:scale-95 rounded-xl sm:rounded-none focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden"
              style="color: {$colorStore.text}; --tw-ring-color: {$colorStore.accent};"
              aria-label={button.ariaLabel || button.label}
            >
              <span class="relative z-10">{button.label}</span>
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </div>
        {/if}
      {/if}
    {/each}
  </div>
</div>

<style>
    div[style*="background"] {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Enhanced mobile responsiveness */
    @media (max-width: 640px) {
        div[class*="flex-col"] > div {
            margin-bottom: 0.75rem;
        }

        div[class*="flex-col"] > div:last-child {
            margin-bottom: 0;
        }
    }

    /* Improved focus states */
    button:focus,
    a:focus {
        outline: 2px solid var(--tw-ring-color, #3b82f6);
        outline-offset: 2px;
    }

    /* Button hover animations */
    @keyframes shimmer {
        0% {
            transform: translateX(-100%) skewX(-12deg);
        }
        100% {
            transform: translateX(200%) skewX(-12deg);
        }
    }

    .group:hover .absolute {
        animation: shimmer 0.7s ease-out;
    }

    /* Dropdown animations */
    .dropdown-enter {
        animation: dropdown-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes dropdown-slide-in {
        from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    /* Mobile touch improvements */
    @media (max-width: 640px) {
        button:active,
        a:active {
            transform: scale(0.95);
        }
    }
</style>