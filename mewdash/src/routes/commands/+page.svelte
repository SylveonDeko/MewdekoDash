<script lang="ts">
    import json from "./modules.json"
    import MewdekoModule from "$lib/MewdekoModule.svelte"
    import type {Module} from "$lib/types/mewdekoModules";

    let modules: Module[] = json

    modules.sort((a, b) => a.Name < b.Name ? -1 : a.Name > b.Name ? 1 : 0)
    modules.forEach(module => {
        module.Commands.sort((a, b) => a.CommandName < b.CommandName ? -1 : a.CommandName > b.CommandName ? 1 : 0)
    })
</script>
<ul class="p-2 bg-mewd-dark-grey space-y-6">
    {#each modules as module}
        <li class="mb-2 p-2 bg-mewd-light-grey rounded-xl ">
            <MewdekoModule {module}/>
        </li>
    {/each}
</ul>