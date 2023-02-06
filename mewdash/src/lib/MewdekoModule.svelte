<script lang="ts">
    import type {Module} from "$lib/types/mewdekoModules";
    export let module: Module;
</script>
<div class=" text-xl font-lg text-mewd-white">
    {module.Name}
    <ul class="list-decimal list-inside ml-2 text-sm ">
        {#each module.Commands as command}
            <li>
                <span class="text-mewd-green">
                    {command.CommandName}
                </span>
                <span class="text-mewd-white">
                    {command.Description}
                </span>
            </li>
        {/each}
    </ul>

</div>
