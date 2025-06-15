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

  export let command: Command;

  // Check if command has any permissions to show
  $: hasPermissions = command.GuildUserPermissions || command.ChannelUserPermissions ||
    command.GuildBotPermissions || command.ChannelBotPermissions;

  // Check if command has additional options
  $: hasOptions = command.ListOptions && command.ListOptions.length > 0 && command.ListOptions.at(0) !== "";
  $: hasVersion = command.BotVersion && command.BotVersion.length > 0 && command.BotVersion.at(0) !== "";

  let isOpen = false;
</script>

<div class="border rounded-lg transition-all duration-200 hover:bg-white/5"
     style="border-color: {$colorStore.primary}20;">
  <details bind:open={isOpen} class="group">
    <summary
      class="cursor-pointer list-none p-3 lg:p-4 flex items-center justify-between"
      on:click={() => isOpen = !isOpen}
    >
      <div class="flex-1 min-w-0 mr-3">
        <div class="flex flex-col lg:flex-row lg:items-center lg:space-x-4">
          <h3 class="text-sm lg:text-base font-semibold" style="color: {$colorStore.accent};">
            {capitalizeFirstLetter(command.CommandName)}
          </h3>
          <div
            class="text-xs lg:text-sm mt-1 lg:mt-0 line-clamp-1 lg:line-clamp-none prose prose-sm prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:bg-black/20 prose-code:text-current"
            class:hidden={isOpen}
            style="color: {$colorStore.muted};"
          >
            {@html command.Description}
          </div>
        </div>
      </div>
      <div class="flex-shrink-0">
        <svg
          class="w-4 h-4 transform transition-transform duration-200"
          class:rotate-180={isOpen}
          fill="none"
          stroke="currentColor"
          style="color: {$colorStore.muted};"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
        </svg>
      </div>
    </summary>

    {#if isOpen}
      <div class="px-3 lg:px-4 pb-3 lg:pb-4 border-t" style="border-color: {$colorStore.primary}20;">
        <div class="grid gap-4 lg:gap-6 lg:grid-cols-2 xl:grid-cols-3 pt-3 lg:pt-4">

          <!-- Description -->
          <div class="lg:col-span-2 xl:col-span-3">
            <div
              class="prose prose-sm prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:bg-black/20 prose-code:text-current"
              style="color: {$colorStore.text};"
            >
              {@html command.HtmlDescription}
            </div>
          </div>

          <!-- Usage Examples -->
          <div class="lg:col-span-2 xl:col-span-2">
            <h4 class="text-sm font-semibold mb-2" style="color: {$colorStore.accent};">
              Usage Examples
            </h4>
            <div class="space-y-2">
              {#each command.Example as example}
                <code
                  class="block text-xs p-2 rounded border transition-colors overflow-x-auto"
                  style="background: {$colorStore.primary}15; 
                         color: {$colorStore.text}; 
                         border-color: {$colorStore.primary}30;"
                >
                  {example}
                </code>
              {/each}
            </div>
          </div>

          <!-- Additional Information -->
          {#if hasPermissions || hasOptions || hasVersion}
            <div class="space-y-3">

              {#if hasOptions}
                <div>
                  <h4 class="text-sm font-semibold mb-1" style="color: {$colorStore.accent};">
                    Available Choices
                  </h4>
                  <p class="text-xs" style="color: {$colorStore.muted};">
                    {command.ListOptions.join(', ')}
                  </p>
                </div>
              {/if}

              {#if hasVersion}
                <div>
                  <h4 class="text-sm font-semibold mb-1" style="color: {$colorStore.accent};">
                    Available On
                  </h4>
                  <p class="text-xs" style="color: {$colorStore.muted};">
                    {command.BotVersion}
                  </p>
                </div>
              {/if}

              {#if hasPermissions}
                <div>
                  <h4 class="text-sm font-semibold mb-2" style="color: {$colorStore.accent};">
                    Required Permissions
                  </h4>
                  <div class="space-y-2">
                    {#if command.GuildUserPermissions}
                      <div>
                        <h5 class="text-xs font-medium" style="color: {$colorStore.text};">
                          User Guild
                        </h5>
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          {command.GuildUserPermissions}
                        </p>
                      </div>
                    {/if}

                    {#if command.ChannelUserPermissions}
                      <div>
                        <h5 class="text-xs font-medium" style="color: {$colorStore.text};">
                          User Channel
                        </h5>
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          {command.ChannelUserPermissions}
                        </p>
                      </div>
                    {/if}

                    {#if command.GuildBotPermissions}
                      <div>
                        <h5 class="text-xs font-medium" style="color: {$colorStore.text};">
                          Bot Guild
                        </h5>
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          {command.GuildBotPermissions}
                        </p>
                      </div>
                    {/if}

                    {#if command.ChannelBotPermissions}
                      <div>
                        <h5 class="text-xs font-medium" style="color: {$colorStore.text};">
                          Bot Channel
                        </h5>
                        <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                          {command.ChannelBotPermissions}
                        </p>
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </details>
</div>