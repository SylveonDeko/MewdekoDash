<!-- lib/dashboard/modules/MewdekoCommandModule.svelte -->
<script lang="ts">
  import type { Module } from "$lib/types/mewdekoModules";
  import MewdekoCommand from "./MewdekoCommand.svelte";

  export let module: Module;
  export let searching: boolean;
</script>

<details class="text-2xl font-bold text-mewd-white m-2" bind:open={searching}>
  <summary class="cursor-pointer">{module.Name}</summary>
  <div
    class="mt-4 flex flex-wrap font-semibold"
    role="list"
    aria-label={`Commands for ${module.Name}`}
  >
    {#each module.Commands as command, i}
      <div class="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-2" role="listitem">
        <MewdekoCommand {command} />
      </div>
    {/each}
  </div>
</details>
