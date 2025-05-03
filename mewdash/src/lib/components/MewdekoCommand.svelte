<!-- lib/components/MewdekoCommand.svelte -->
<script lang="ts">
  import type { Command } from "$lib/types/mewdekoModules";
  import { colorStore } from "$lib/stores/colorStore";

  /**
   * Capitalizes the first letter of a string
   * @param string The string to capitalize
   * @returns The capitalized string
   */
  function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * Truncates a string to a specified length
   * @param string The string to truncate
   * @param maxLength The maximum length of the string
   * @returns The truncated string
   */
  const truncateString = (string = "", maxLength = 50): string =>
    string.length > maxLength ? `${string.substring(0, maxLength)}…` : string;

  export let command: Command;
</script>

<details
  class="group list-inside rounded-lg pb-4 transition-all duration-300 shadow-md overflow-hidden"
  style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}25);"
>
  <summary
    class="flex flex-row justify-start items-center self-center w-full py-3 px-4 cursor-pointer hover:opacity-90 transition-opacity duration-200"
  >
    <h3 class="text-lg font-bold min-w-fit" style="color: {$colorStore.accent};">
      {capitalizeFirstLetter(command.CommandName)}
    </h3>
    <p
      class="group-open:hidden px-4 text-sm overflow-hidden text-ellipsis prose prose-code:rounded-sm"
      style="color: {$colorStore.muted};"
    >
      {@html command.Description}
    </p>
  </summary>
  <div
    class="px-4 pb-2 prose prose-code:rounded-sm"
    style="color: {$colorStore.text};"
  >
    {@html command.HtmlDescription}
  </div>

  {#if command.GuildUserPermissions}
    <div class="mb-2">
      <h4 class="px-4 font-semibold"
          style="color: {$colorStore.accent};">
        User Guild Permissions
      </h4>
      <p class="text-sm ml-4 break-words" style="color: {$colorStore.muted};">
        {command.GuildUserPermissions}
      </p>
    </div>
  {/if}

  {#if command.ChannelUserPermissions}
    <div class="mb-2">
      <h4 class="px-4 font-semibold"
          style="color: {$colorStore.accent};">
        User Channel Permissions
      </h4>
      <p class="text-sm ml-4 break-words" style="color: {$colorStore.muted};">
        {command.ChannelUserPermissions}
      </p>
    </div>
  {/if}

  {#if command.GuildBotPermissions}
    <div class="mb-2">
      <h4 class="px-4 font-semibold"
          style="color: {$colorStore.accent};">
        Bot Guild Permissions
      </h4>
      <p class="text-sm ml-4 break-words" style="color: {$colorStore.muted};">
        {command.GuildBotPermissions}
      </p>
    </div>
  {/if}

  {#if command.ChannelBotPermissions}
    <div class="mb-2">
      <h4 class="px-4 font-semibold"
          style="color: {$colorStore.accent};">
        Bot Channel Permissions
      </h4>
      <p class="text-sm ml-4 break-words" style="color: {$colorStore.muted};">
        {command.ChannelBotPermissions}
      </p>
    </div>
  {/if}

  {#if command.ListOptions && command.ListOptions.length > 0 && command.ListOptions.at(0) !== ""}
    <div class="mb-2">
      <h4 class="px-4 font-semibold"
          style="color: {$colorStore.accent};">
        Available Choices
      </h4>
      <p class="text-sm ml-4 break-words" style="color: {$colorStore.muted};">
        {command.ListOptions}
      </p>
    </div>
  {/if}

  {#if command.BotVersion && command.BotVersion.length > 0 && command.BotVersion.at(0) !== ""}
    <div class="mb-2">
      <h4 class="px-4 font-semibold"
          style="color: {$colorStore.accent};">
        Available on
      </h4>
      <p class="text-sm ml-4 break-words" style="color: {$colorStore.muted};">
        {command.BotVersion}
      </p>
    </div>
  {/if}

  <div>
    <h4 class="px-4 py-2 font-semibold"
        style="color: {$colorStore.accent};">
      Usage
    </h4>
    <ul aria-label="Command usage examples" class="list-none px-4">
      {#each command.Example as example}
        <li class="break-words">
          <code
            class="text-sm rounded-sm my-2 py-1 px-2 block transition-colors overflow-x-auto"
            style="background: {$colorStore.primary}80; color: {$colorStore.text};"
          >
            {example}
          </code>
        </li>
      {/each}
    </ul>
  </div>
</details>