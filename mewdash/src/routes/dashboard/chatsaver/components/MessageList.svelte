<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { ChatLogMessage } from "$lib/api/index.ts";
  import {
    formatDateTime,
    formatDay,
    formatSize,
    groupByAuthor,
    groupByDay,
    isImageUrl,
    renderMarkdown,
    type MentionNames
  } from "./chatModel";

  interface Props {
    messages: ChatLogMessage[];
    names: MentionNames;
  }

  let { messages, names }: Props = $props();

  const days = $derived(groupByDay(messages));
</script>

<div class="chat min-w-0" style="--accent: {$colorStore.primary};">
  {#each days as { day, messages: dayMessages } (day)}
    <div class="relative text-center my-4">
      <div class="absolute inset-0 flex items-center" aria-hidden="true">
        <div class="w-full h-px" style="background: {$colorStore.primary}30;"></div>
      </div>
      <span class="relative px-3 py-1 rounded-full text-sm font-medium" style="background: {$colorStore.surface}; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;">
        {formatDay(dayMessages[0].timestamp)}
      </span>
    </div>

    <div class="space-y-4">
      {#each groupByAuthor(dayMessages) as group (group[0].id)}
        <div class="flex gap-3 min-w-0">
          <img src={group[0].author.avatarUrl} alt="" class="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shrink-0 mt-1">
          <div class="grow min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-semibold text-sm sm:text-base truncate" style="color: {$colorStore.text}">{group[0].author.username}</span>
              <span class="text-xs shrink-0" style="color: {$colorStore.muted}">{formatDateTime(group[0].timestamp)}</span>
            </div>

            {#each group as message, index (message.id)}
              {#if index > 0}
                <div class="text-xs mt-2" style="color: {$colorStore.muted}">{formatDateTime(message.timestamp)}</div>
              {/if}

              {#if message.content}
                <div class="mt-1 text-sm sm:text-base break-words [overflow-wrap:anywhere]" style="color: {$colorStore.text};">
                  {@html renderMarkdown(message.content, names)}
                </div>
              {/if}

              {#each message.attachments ?? [] as attachment, attachmentIndex (attachmentIndex)}
                {#if isImageUrl(attachment.url)}
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer" class="block mt-2 max-w-full sm:max-w-md">
                    <img src={attachment.proxyUrl || attachment.url} alt={attachment.filename} class="max-h-64 sm:max-h-96 max-w-full object-contain rounded-md">
                  </a>
                {:else}
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 mt-2 p-2 rounded-md min-h-[44px] min-w-0 text-sm"
                    style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                  >
                    <i class="fa-solid fa-paperclip shrink-0" aria-hidden="true"></i>
                    <span class="truncate">{attachment.filename} ({formatSize(attachment.fileSize)})</span>
                  </a>
                {/if}
              {/each}

              {#each message.embeds ?? [] as embed, embedIndex (embedIndex)}
                <div class="mt-2 rounded-md p-3 border-l-4 overflow-hidden min-w-0" style="background: {$colorStore.primary}10; border-left-color: {$colorStore.primary};">
                  <div class="flex flex-col sm:flex-row gap-3">
                    <div class="grow min-w-0">
                      {#if embed.author}
                        <div class="flex items-center gap-2 mb-2">
                          {#if embed.author.iconUrl}
                            <img src={embed.author.iconUrl} alt="" class="w-5 h-5 rounded-full shrink-0">
                          {/if}
                          <span class="text-sm font-medium truncate" style="color: {$colorStore.text}">{embed.author.name}</span>
                        </div>
                      {/if}
                      {#if embed.title}
                        <div class="font-bold mb-1 break-words" style="color: {$colorStore.text}">
                          {#if embed.url}
                            <a href={embed.url} target="_blank" rel="noopener noreferrer" style="color: {$colorStore.primary}">{embed.title}</a>
                          {:else}
                            {embed.title}
                          {/if}
                        </div>
                      {/if}
                      {#if embed.description}
                        <div class="text-sm break-words [overflow-wrap:anywhere]" style="color: {$colorStore.text}">
                          {@html renderMarkdown(embed.description, names)}
                        </div>
                      {/if}
                    </div>
                    {#if embed.thumbnail}
                      <img src={embed.thumbnail} alt={m.common.thumbnail()} class="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover shrink-0">
                    {/if}
                  </div>
                </div>
              {/each}
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .chat :global(a) {
    color: var(--accent);
    text-decoration: underline;
  }

  .chat :global(.mention) {
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    border-radius: 3px;
    padding: 0 2px;
  }

  .chat :global(code) {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    border-radius: 3px;
    padding: 0 4px;
    font-family: ui-monospace, monospace;
    font-size: 0.9em;
  }

  .chat :global(.code-block) {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    border-radius: 6px;
    padding: 8px;
    margin: 4px 0;
    overflow-x: auto;
    white-space: pre-wrap;
  }

  .chat :global(.code-block code) {
    background: none;
    padding: 0;
  }
</style>
