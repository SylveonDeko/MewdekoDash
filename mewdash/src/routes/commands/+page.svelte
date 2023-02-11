<script lang="ts">
    import json from "./modules.json"
    import MewdekoModule from "$lib/dashboard/modules/MewdekoModule.svelte"
    import type {Module} from "$lib/types/mewdekoModules";
    import {createSearchStore, searchHandler} from "$lib/stores/commandSearch";
    import {onDestroy} from "svelte";

    let modules: Module[] = json
    modules.sort((a, b) => a.Name < b.Name ? -1 : a.Name > b.Name ? 1 : 0)
    modules.forEach(module => {
        module.Commands.sort((a, b) => a.CommandName < b.CommandName ? -1 : a.CommandName > b.CommandName ? 1 : 0)
    })

    const searchStore = createSearchStore(modules)

    const unsubscribe = searchStore.subscribe(model => searchHandler(model));

    onDestroy(() => {
        unsubscribe();
    })

    const MOCK_CONTENT = `
## Lorem

Lorem is currently extended with the following plugins.
Instructions on how to use them in your application are linked below.

| Plugin | README |
| ------ | ------ |
| Dropbox | [plugins/dropbox/README.md](Link) |
| Medium | [plugins/medium/README.md](Link) |
| Google Analytics | [plugins/googleanalytics/README.md](Link) |
`;
    export let data;
</script>

<div class="prose">
    {@html data.code}
</div>

<div class="min-h-screen p-2 bg-mewd-dark-grey space-y-6">
    <div class="flex flex-col items-center py-6 space-y-4 ">
        <h1 class="text-4xl font-bold text-mewd-white text-center">Mewdeko Modules</h1>
        <div class="flex flex-wrap justify-center">
            <label for="search" class="text-mewd-white pr-2">Search for a Command:</label>
            <input type="search" id="search" placeholder="Search..." class="rounded-full px-2 py-1 sm:w-96"
                   bind:value={$searchStore.search}/>
        </div>
    </div>
    <ul id="modules">
        {#each $searchStore.filtered as module}
            <li class="mb-2 p-2 bg-mewd-light-grey rounded-xl ">
                <MewdekoModule {module} searching="{!!$searchStore.search?.trim()}"/>
            </li>
        {/each}
    </ul>
</div>