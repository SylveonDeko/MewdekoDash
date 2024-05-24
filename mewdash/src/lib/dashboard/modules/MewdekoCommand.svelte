<script lang="ts">
    import type {Command} from "$lib/types/mewdekoModules";

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const truncateString = (string = '', maxLength = 50) =>
        string.length > maxLength
            ? `${string.substring(0, maxLength)}…`
            : string

    export let command: Command;
</script>

<details class="group list-inside bg-mewd-dark-grey rounded-lg break-normal pb-4">
    <summary class="flex flex-row justify-start self-center w-full py-3 px-4 cursor-pointer">
        <h3 class="text-mewd-yellow text-lg font-bold">{capitalizeFirstLetter(command.CommandName)}</h3>
        <h4 class="group-open:hidden px-4 text-sm whitespace-nowrap text-ellipsis overflow-hidden prose prose-invert prose-code:bg-gray-700 before:prose-code:content-[''] after:prose-code:content-[''] prose-code:rounded-sm"> {@html command.Description}</h4>
    </summary>
    <h5 class="px-4 pb-2 prose prose-invert prose-code:bg-gray-700 before:prose-code:content-[''] after:prose-code:content-[''] prose-code:rounded-sm"> {@html command.HtmlDescription}</h5>
    {#if command.GuildUserPermissions}
        <h6 class="px-4 whitespace-nowrap text-ellipsis">User Guild Permissions</h6>
        <p class="text-sm ml-4 mb-2">{command.GuildUserPermissions}</p>
    {/if}
    
    {#if command.ChannelUserPermissions}
        <h6 class="px-4 whitespace-nowrap">User Channel Permissions</h6>
        <p class="text-sm ml-4 mb-2">{command.ChannelUserPermissions}</p>
    {/if}

    {#if command.GuildBotPermissions}
        <h6 class="px-4 whitespace-nowrap">Bot Guild Permissions</h6>
        <p class="text-sm ml-4 mb-2">{command.GuildBotPermissions}</p>
    {/if}

    {#if command.ChannelBotPermissions}
        <h6 class="px-4 whitespace-nowrap">Bot Channel Permissions</h6>
        <p class="text-sm ml-4 mb-2">{command.ChannelBotPermissions}</p>
    {/if}

    {#if command.ListOptions}
        <h6 class="px-4 whitespace-nowrap text-ellipsis">Available Choices</h6>
        <p class="text-sm ml-4 mb-2">{command.ListOptions}</p>
    {/if}

    {#if command.BotVersion}
        <h6 class="px-4 whitespace-nowrap">Available on</h6>
        <p class="text-sm ml-4 mb-2">{command.BotVersion}</p>
    {/if}
    
    <h6 class="px-4 py-2 whitespace-nowrap">Usage</h6>
    {#each command.Example as example}
        <code class="text-sm bg-gray-700 ml-4 rounded-sm my-2 py-1">{truncateString(example, 70)}</code><br>
    {/each}
</details>