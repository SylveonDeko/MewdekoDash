<!-- lib/dashboard/modules/MewdekoCommand.svelte -->
<script lang="ts">
  import type { Command } from "$lib/types/mewdekoModules.ts";

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const truncateString = (string = "", maxLength = 50) =>
    string.length > maxLength ? `${string.substring(0, maxLength)}…` : string;

  export let command: Command;
</script>

<details
  class="group list-inside bg-mewd-dark-grey rounded-lg break-normal pb-4"
>
  <summary
    class="flex flex-row justify-start self-center w-full py-3 px-4 cursor-pointer"
  >
    <h3 class="text-mewd-yellow text-lg font-bold">
      {capitalizeFirstLetter(command.CommandName)}
    </h3>
    <p
      class="group-open:hidden px-4 text-sm whitespace-nowrap text-ellipsis overflow-hidden prose prose-invert prose-code:bg-gray-700 before:prose-code:content-[''] after:prose-code:content-[''] prose-code:rounded-sm"
    >
      {@html command.Description}
    </p>
  </summary>
  <div
    class="px-4 pb-2 prose prose-invert prose-code:bg-gray-700 before:prose-code:content-[''] after:prose-code:content-[''] prose-code:rounded-sm"
  >
    {@html command.HtmlDescription}
  </div>

  {#if command.GuildUserPermissions}
    <div class="mb-2">
      <h4 class="px-4 whitespace-nowrap text-ellipsis">
        User Guild Permissions
      </h4>
      <p class="text-sm ml-4">{command.GuildUserPermissions}</p>
    </div>
  {/if}

  {#if command.ChannelUserPermissions}
    <div class="mb-2">
      <h4 class="px-4 whitespace-nowrap">User Channel Permissions</h4>
      <p class="text-sm ml-4">{command.ChannelUserPermissions}</p>
    </div>
  {/if}

  {#if command.GuildBotPermissions}
    <div class="mb-2">
      <h4 class="px-4 whitespace-nowrap">Bot Guild Permissions</h4>
      <p class="text-sm ml-4">{command.GuildBotPermissions}</p>
    </div>
  {/if}

  {#if command.ChannelBotPermissions}
    <div class="mb-2">
      <h4 class="px-4 whitespace-nowrap">Bot Channel Permissions</h4>
      <p class="text-sm ml-4">{command.ChannelBotPermissions}</p>
    </div>
  {/if}

  {#if command.ListOptions && command.ListOptions.length > 0 && command.ListOptions.at(0) !== ""}
    <div class="mb-2">
      <h4 class="px-4 whitespace-nowrap text-ellipsis">Available Choices</h4>
      <p class="text-sm ml-4">{command.ListOptions}</p>
    </div>
  {/if}

  {#if command.BotVersion && command.BotVersion.length > 0 && command.BotVersion.at(0) !== ""}
    <div class="mb-2">
      <h4 class="px-4 whitespace-nowrap">Available on</h4>
      <p class="text-sm ml-4">{command.BotVersion}</p>
    </div>
  {/if}

  <div>
    <h4 class="px-4 py-2 whitespace-nowrap">Usage</h4>
    <ul class="list-none" aria-label="Command usage examples">
      {#each command.Example as example}
        <li>
          <code class="text-sm bg-gray-700 ml-4 rounded-sm my-2 py-1"
            >{truncateString(example, 70)}</code
          >
        </li>
      {/each}
    </ul>
  </div>
</details>
