<script lang="ts">
    import type {Module} from "$lib/types/mewdekoModules";
    import MewdekoCommand from "./MewdekoCommand.svelte";

    export let module: Module;
</script>
<div class="text-2xl font-bold text-mewd-white mt-2 mx-2 ">
    {module.Name}
    <div class="mt-4 flex flex-wrap font-semibold">
        {#each module.Commands as command, i}
            <div class="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-2">
                <MewdekoCommand command={command}/>
            </div>
        {/each}
    </div>
</div>
