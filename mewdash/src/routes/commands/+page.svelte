<script lang="ts">
    import MewdekoModule from "$lib/dashboard/modules/MewdekoModule.svelte"
    import {createSearchStore, searchHandler} from "$lib/stores/commandSearch";
    import {onDestroy} from "svelte";
    import type {PageData} from "./$types";

    export let data: PageData;

    const searchStore = createSearchStore(data.modules)

    const unsubscribe = searchStore.subscribe(model => searchHandler(model));

    onDestroy(() => {
        unsubscribe();
    })
</script>

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