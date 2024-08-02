<script lang="ts">
    export let options: { id: string; name: string }[];
    export let selected: string[];
    export let placeholder: string;

    let isOpen = false;
    let searchTerm = '';

    $: filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    function toggleOption(optionId: string) {
        const index = selected.indexOf(optionId);
        if (index === -1) {
            selected = [...selected, optionId];
        } else {
            selected = selected.filter(id => id !== optionId);
        }
    }

    function closeDropdown(event: Event) {
        const target = event.target as Element | null;
        if (target && !target.closest('.dropdown')) {
            isOpen = false;
        }
    }
</script>

<svelte:window on:click={closeDropdown} />

<div class="dropdown relative">
    <div
            class="bg-gray-700 text-white p-2 rounded cursor-pointer"
            on:click={() => isOpen = !isOpen}
    >
        {selected.length ? selected.length + ' selected' : placeholder}
    </div>

    {#if isOpen}
        <div class="absolute top-full left-0 w-full bg-gray-800 rounded mt-1 max-h-60 overflow-y-auto">
            <input
                    class="w-full bg-gray-700 text-white p-2"
                    placeholder="Search roles..."
                    bind:value={searchTerm}
            />
            {#each filteredOptions as option}
                <div
                        class="p-2 hover:bg-gray-700 cursor-pointer"
                        class:bg-blue-600={selected.includes(option.id)}
                        on:click={() => toggleOption(option.id)}
                >
                    {option.name}
                </div>
            {/each}
        </div>
    {/if}
</div>