<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";

  interface Props {
    title: string;
    words: string[];
    /** Called with a word to add or remove. Resolves once the bot has answered. */
    ontoggle: (word: string) => Promise<void>;
    onclear?: () => Promise<void>;
  }

  let { title, words, ontoggle, onclear }: Props = $props();

  let draft = $state("");
  let search = $state("");
  let busy = $state(false);

  const shown = $derived.by(() => {
    const term = search.trim().toLowerCase();
    return term ? words.filter((word) => word.toLowerCase().includes(term)) : words;
  });

  async function add() {
    const word = draft.trim().toLowerCase();
    if (!word || busy) return;
    if (words.includes(word)) {
      draft = "";
      return;
    }
    busy = true;
    try {
      await ontoggle(word);
      draft = "";
    } finally {
      busy = false;
    }
  }

  async function remove(word: string) {
    if (busy) return;
    busy = true;
    try {
      await ontoggle(word);
    } finally {
      busy = false;
    }
  }

  async function clear() {
    if (!onclear) return;
    const confirmed = await requestConfirmation({
      title: m.filter.confirmClearTitle(),
      message: m.filter.confirmClearMessage({ count: words.length }),
      confirmText: m.common.clearAll()
    });
    if (confirmed) await onclear();
  }

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
</script>

{#snippet clearButton()}
  {#if onclear && words.length > 0}
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
      style="background: #ef444415; color: {$colorStore.text}; border: 1px solid #ef444440;"
      onclick={clear}
    >
      <i class="fa-solid fa-trash" aria-hidden="true"></i>{m.common.clearAll()}
    </button>
  {/if}
{/snippet}

<PluginCard title="{title} ({words.length})" alwaysOpen actions={clearButton}>
  <form
    class="flex gap-3 items-stretch"
    onsubmit={(event) => {
      event.preventDefault();
      void add();
    }}
  >
    <input
      type="text"
      bind:value={draft}
      placeholder={m.filter.wordPlaceholder()}
      aria-label={title}
      class="grow min-w-0 p-3 rounded-lg border min-h-[50px]"
      style={field}
    >
    <button
      type="submit"
      class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={busy || !draft.trim()}
    >
      {m.common.add()}
    </button>
  </form>

  {#if words.length > 10}
    <input
      type="search"
      bind:value={search}
      placeholder={m.filter.searchWordsPlaceholder()}
      aria-label={m.filter.searchWordsAria()}
      class="w-full p-3 rounded-lg border min-h-[50px]"
      style={field}
    >
  {/if}

  {#if shown.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{search ? m.filter.noSearchMatch() : m.filter.noWords()}</p>
  {:else}
    <div class="flex flex-wrap gap-2">
      {#each shown as word (word)}
        <span
          class="inline-flex items-center gap-1 pl-3 rounded-lg text-sm min-w-0 max-w-full"
          style="background: {$colorStore.primary}15; color: {$colorStore.text};"
        >
          <span class="truncate">{word}</span>
          <button
            type="button"
            class="min-h-[44px] min-w-[44px] rounded-lg disabled:opacity-40"
            aria-label={m.common.ariaRemoveWord({ word })}
            disabled={busy}
            onclick={() => remove(word)}
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </span>
      {/each}
    </div>
  {/if}
</PluginCard>
