<!-- lib/components/MewdekoModule.svelte -->
<script lang="ts">
  import type { Module } from "$lib/types/mewdekoModules";
  import MewdekoCommand from "./MewdekoCommand.svelte";
  import { colorStore } from "$lib/stores/colorStore";

  export let module: Module;
  export let searching: boolean;

  let isOpen = searching;
  $: isOpen = searching;
</script>

<div class="border-b border-opacity-20" style="border-color: {$colorStore.primary};">
  <details bind:open={isOpen} class="group">
    <summary
      class="cursor-pointer list-none p-4 lg:p-6 hover:bg-white/5 transition-all duration-200 flex items-center justify-between"
      on:click={() => isOpen = !isOpen}
    >
      <div class="flex items-center space-x-4">
        <div class="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center"
             style="background: {$colorStore.accent}20;">
          <span class="text-lg lg:text-xl font-bold" style="color: {$colorStore.accent};">
            {module.Name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h2 class="text-lg lg:text-xl font-bold" style="color: {$colorStore.text};">
            {module.Name}
          </h2>
          <p class="text-xs lg:text-sm opacity-70" style="color: {$colorStore.text};">
            {module.Commands.length} command{module.Commands.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div class="flex-shrink-0">
        <svg
          class="w-5 h-5 transform transition-transform duration-200"
          class:rotate-180={isOpen}
          fill="none"
          stroke="currentColor"
          style="color: {$colorStore.muted};"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
        </svg>
      </div>
    </summary>

    {#if isOpen}
      <div class="px-4 lg:px-6 pb-4 lg:pb-6">
        <div class="space-y-2 lg:space-y-3">
          {#each module.Commands as command}
            <MewdekoCommand {command} />
          {/each}
        </div>
      </div>
    {/if}
  </details>
</div>