<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";

  interface Props {
    id: string;
    label: string;
    words: string[];
    maxWords: number;
    maxLength: number;
    onchange: (words: string[]) => void;
  }

  let { id, label, words, maxWords, maxLength, onchange }: Props = $props();

  let text = $state("");

  const addable = $derived(text.trim().length > 0 && words.length < maxWords);

  function add() {
    const word = text.trim();
    if (!word || words.length >= maxWords) return;
    text = "";
    if (words.some(x => x.toLowerCase() === word.toLowerCase())) return;
    onchange([...words, word]);
  }
</script>

<SettingField {label} {id}>
  {#if words.length}
    <div class="flex flex-wrap gap-2 mb-3">
      {#each words as word (word)}
        <span
          class="inline-flex items-center gap-1 pl-3 rounded-lg min-h-[44px] border max-w-full"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}20; color: {$colorStore.text};"
        >
          <span class="truncate">{word}</span>
          <button
            type="button"
            class="min-h-[44px] min-w-[44px] rounded-lg"
            aria-label={m.channelMessages.removeWordAria({ word })}
            onclick={() => onchange(words.filter(x => x !== word))}
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </span>
      {/each}
    </div>
  {/if}
  <div class="flex gap-3 items-stretch">
    <input
      {id}
      type="text"
      bind:value={text}
      maxlength={maxLength}
      placeholder={m.channelMessages.wordPlaceholder()}
      class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      onkeydown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          add();
        }
      }}
    >
    <button
      type="button"
      class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={!addable}
      onclick={add}
    >
      {m.common.add()}
    </button>
  </div>
</SettingField>
