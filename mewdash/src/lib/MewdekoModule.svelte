<script lang="ts">
    import type {Command, Module} from "$lib/types/mewdekoModules";

    export let module: Module;

    function computeCommandId(module: Module, command: Command) {
        return `${module.Name}_command${module.Commands.indexOf(command)}`;
    }

    function computeCurrentActive(module: Module, command: Command) {
        let clickedCommand = computeCommandId(module, command);
        if (active === clickedCommand) {
            active = "";
        } else {
            active = clickedCommand;
        }
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    let active: string = ""
</script>
<div class="text-xl font-lg text-mewd-white mt-2 mx-2">
    {module.Name}
    <ul class="mt-4 space-y-4">
        {#each module.Commands as command, i}
            <li class="">
                <button on:click|preventDefault="{()=>computeCurrentActive(module, command)}"
                        class="flex flex-row justify-start w-full py-3 px-5 bg-black">
                    <h3 class="text-mewd-green text-md">{capitalizeFirstLetter(command.CommandName)}</h3>
                    {#if active !== computeCommandId(module, command)}
                        <p class="pl-2 pt-2 text-sm whitespace-nowrap text-ellipsis overflow-hidden"> {command.Description}</p>
                    {/if}
                </button>
                {#if active === computeCommandId(module, command)}
                    <p class="p-4 text-sm"> {command.Description}</p>
                {/if}
            </li>
        {/each}
    </ul>
</div>
