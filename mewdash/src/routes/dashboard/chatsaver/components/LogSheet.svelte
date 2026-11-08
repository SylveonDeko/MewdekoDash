<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { ChatLogMessage } from "$lib/api/index.ts";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import MessageList from "./MessageList.svelte";
  import { matchesQuery, type MentionNames } from "./chatModel";

  interface Props {
    title: string;
    messages: ChatLogMessage[];
    names: MentionNames;
    /** Set for a saved log, which can be renamed instead of saved. */
    savedName?: string | null;
    saving: boolean;
    truncated: boolean;
    onsave: () => void;
    onexport: () => void;
    onrename: (name: string) => Promise<void>;
    onclose: () => void;
  }

  let { title, messages, names, savedName = null, saving, truncated, onsave, onexport, onrename, onclose }: Props = $props();

  let query = $state("");
  let name = $state("");
  let renaming = $state(false);

  $effect(() => {
    name = savedName ?? "";
  });

  const shown = $derived(query.trim() ? messages.filter(message => matchesQuery(message, query)) : messages);
  const renameChanged = $derived(!!savedName && name.trim() !== "" && name.trim() !== savedName);

  async function rename() {
    if (!renameChanged || renaming) return;
    renaming = true;
    try {
      await onrename(name.trim());
    } finally {
      renaming = false;
    }
  }

  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
</script>

<Sheet {title} {onclose} size="lg">
  {#snippet actions()}
    {#if savedName === null}
      <button
        type="button"
        class="flex items-center gap-2 px-4 rounded-lg min-h-[44px] text-sm font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={saving}
        onclick={onsave}
      >
        <i class="fa-solid {saving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}" aria-hidden="true"></i>
        {m.chatsaver.saverSaveLog()}
      </button>
    {/if}
    <button
      type="button"
      class="flex items-center gap-2 px-4 rounded-lg min-h-[44px] text-sm font-medium"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      onclick={onexport}
    >
      <i class="fa-solid fa-download" aria-hidden="true"></i>
      {m.common.exportHtml()}
    </button>
  {/snippet}

  {#if savedName !== null}
    <div class="flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        bind:value={name}
        aria-label={m.chatsaver.saverRenameLog()}
        class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
        onkeydown={(event) => event.key === "Enter" && rename()}
      >
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-lg min-h-[50px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={!renameChanged || renaming}
        onclick={rename}
      >
        <i class="fa-solid fa-pen" aria-hidden="true"></i>
        {m.chatsaver.saverRenameLog()}
      </button>
    </div>
  {/if}

  <div class="flex flex-col sm:flex-row sm:items-center gap-2">
    <input
      type="search"
      bind:value={query}
      placeholder={m.common.search()}
      aria-label={m.common.search()}
      class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style={inputStyle}
    >
    <p class="text-sm shrink-0" style="color: {$colorStore.muted}">
      {shown.length === 1 ? m.chatsaver.saverMessageCountOne({ count: shown.length }) : m.chatsaver.saverMessageCountOther({ count: shown.length })}
    </p>
  </div>

  {#if shown.length}
    <MessageList messages={shown} {names} />
  {:else}
    <p class="text-center py-8" style="color: {$colorStore.muted}">{m.chatsaver.saverNoMatches()}</p>
  {/if}

  {#if truncated}
    <p class="p-3 rounded-lg text-center text-sm" style="background: {$colorStore.primary}10; color: {$colorStore.text};">
      {m.chatsaver.saverLimitNotice({ count: messages.length })}
    </p>
  {/if}
</Sheet>
