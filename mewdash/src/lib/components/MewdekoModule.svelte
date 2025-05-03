<!-- lib/components/MewdekoModule.svelte -->
<script lang="ts">
  import type { Module } from "$lib/types/mewdekoModules";
  import MewdekoCommand from "./MewdekoCommand.svelte";
  import { colorStore } from "$lib/stores/colorStore";

  export let module: Module;
  export let searching: boolean;
</script>

<details
  bind:open={searching}
  class="text-2xl font-bold m-2 transition-all duration-300"
  style="color: {$colorStore.text};"
>
  <summary class="cursor-pointer hover:opacity-80 transition-opacity duration-200">
    {module.Name}
  </summary>
  <div
    class="mt-4 flex flex-wrap font-semibold w-full"
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