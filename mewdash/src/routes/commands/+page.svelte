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
<head>
    <title>Mewdeko - Commands</title>
    <meta content="Mewdeko - All the commands! Searchable!" property="og:title">
    <meta content="Find out more about Mewdeko's commands and how to use them."
          name="description">
    <meta content="Find out more about Mewdeko's commands and how to use them."
          property="og:description">
    <meta content="Find out more about Mewdeko's commands and how to use them."
          name="twitter:description">
</head>
<div class="">
    <div class="min-h-screen p-2 bg-mewd-dark-grey space-y-6">
        <h1 class="text-center text-4xl font-bold text-white">Mewdeko Modules</h1>
        <div class="sticky top-0 z-50 flex flex-col items-center space-y-2 py-4">
            <input type="search" id="search" placeholder="Search..." class="rounded-full px-3 py-3 text-center sm:w-96 drop-shadow-md" bind:value="{$searchStore.search}" />
        </div>
        <ul id="modules">
            {#each $searchStore.filtered as module}
                <li class="mb-2 p-2 bg-mewd-light-grey rounded-xl ">
                    <MewdekoModule {module} searching="{!!$searchStore.search?.trim()}"/>
                </li>
            {/each}
        </ul>
    </div>
</div>