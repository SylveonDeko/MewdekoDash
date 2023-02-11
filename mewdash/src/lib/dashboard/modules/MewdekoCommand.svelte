<script lang="ts">
    import type {Command} from "$lib/types/mewdekoModules";

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    export let command: Command;
</script>

<details class="group list-inside bg-mewd-dark-grey rounded-lg break-normal">
    <summary class="flex flex-row justify-start w-full py-3 px-5 cursor-pointer">
        <h3 class="text-mewd-yellow text-sm font-bold">{capitalizeFirstLetter(command.CommandName)}</h3>
        <h4 class="group-open:hidden px-4 text-sm whitespace-nowrap text-ellipsis overflow-hidden"> {command.Description}</h4>
    </summary>
    <p class="px-4 pb-2 text-sm prose prose-invert"> {@html command.HtmlDescription}</p>
</details>