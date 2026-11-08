<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { wordOfTheDayApi, type WordOfTheDayWord } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, type Notify } from "./wotdModel";

  interface Props {
    guildId: bigint;
    userId?: string | null;
    notify: Notify;
  }

  let { guildId, userId = null, notify }: Props = $props();

  let words: WordOfTheDayWord[] = $state([]);
  let loading = $state(true);
  let adding = $state(false);
  let newWord = $state("");
  let newDefinition = $state("");
  let query = $state("");

  const visible = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return q ? words.filter((w) => w.word.toLowerCase().includes(q) || w.definition?.toLowerCase().includes(q)) : words;
  });

  const inputClass = "w-full px-3 rounded-lg border min-h-[50px] text-base";
  const inputStyle = $derived(
    `background: ${$colorStore.primary}08; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  async function add() {
    if (adding || !newWord.trim()) return;
    adding = true;
    try {
      const added = await wordOfTheDayApi.addWord(guildId, {
        word: newWord.trim(),
        definition: newDefinition.trim() || null,
        addedBy: BigInt(userId ?? 0)
      });
      words = [...words, added];
      newWord = "";
      newDefinition = "";
      notify(m.wordoftheday.notifyWordAdded());
    } catch (err) {
      logger.error("Failed to add custom word:", err);
      notify(errorText(err, m.wordoftheday.notifyAddFailed()), "error");
    } finally {
      adding = false;
    }
  }

  async function remove(word: WordOfTheDayWord) {
    const ok = await requestConfirmation({
      message: m.wordoftheday.confirmRemoveWord({ word: word.word }),
      confirmText: m.common.remove()
    });
    if (!ok) return;
    try {
      await wordOfTheDayApi.removeWord(guildId, word.word);
      words = words.filter((w) => w.id !== word.id);
    } catch (err) {
      logger.error("Failed to remove custom word:", err);
      notify(errorText(err, m.wordoftheday.notifyRemoveFailed()), "error");
    }
  }

  onMount(async () => {
    try {
      words = await wordOfTheDayApi.getWords(guildId);
    } catch (err) {
      logger.error("Failed to load custom words:", err);
      notify(errorText(err, m.wordoftheday.notifyLoadFailed()), "error");
    } finally {
      loading = false;
    }
  });
</script>

<PluginCard title={m.wordoftheday.wordsAddTitle()} alwaysOpen>
  <div class="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3">
    <input
      type="text"
      bind:value={newWord}
      placeholder={m.common.word()}
      maxlength="64"
      aria-label={m.wordoftheday.wordsWordAria()}
      class={inputClass}
      style={inputStyle}
      onkeydown={(e) => e.key === "Enter" && add()}
    />
    <input
      type="text"
      bind:value={newDefinition}
      placeholder={m.wordoftheday.wordsDefinitionPlaceholder()}
      maxlength="1000"
      aria-label={m.wordoftheday.wordsDefinitionAria()}
      class={inputClass}
      style={inputStyle}
      onkeydown={(e) => e.key === "Enter" && add()}
    />
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-4 rounded-lg min-h-[50px] font-medium"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={adding || !newWord.trim()}
      aria-busy={adding}
      onclick={add}
    >
      <i class="fa-solid fa-plus {adding ? 'fa-spin' : ''}" aria-hidden="true"></i>
      {adding ? m.common.adding() : m.common.add()}
    </button>
  </div>
</PluginCard>

<PluginCard title={m.wordoftheday.wordsTitle({ count: words.length })} alwaysOpen>
  {#if words.length > 5}
    <input
      type="search"
      bind:value={query}
      placeholder={m.common.search()}
      aria-label={m.common.search()}
      class={inputClass}
      style={inputStyle}
    />
  {/if}

  {#if loading}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.common.loading()}</p>
  {:else if words.length === 0}
    <div class="py-6 text-center">
      <p class="font-semibold" style="color: {$colorStore.text}">{m.wordoftheday.wordsEmptyTitle()}</p>
      <p class="text-sm" style="color: {$colorStore.muted}">{m.wordoftheday.wordsEmptyHint()}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each visible as word (word.id)}
        <div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="grow min-w-0 px-1">
            <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">
              {word.word}
              {#if word.partOfSpeech}
                <span class="text-xs font-normal italic ml-1" style="color: {$colorStore.muted}">{word.partOfSpeech}</span>
              {/if}
            </span>
            <span class="block text-sm break-words" style="color: {$colorStore.muted}">
              {word.definition || m.wordoftheday.wordsNoDefinition()}
            </span>
            <span class="inline-block text-xs px-2 py-0.5 rounded-full mt-1" style="background: {$colorStore.primary}15; color: {$colorStore.text};">
              {m.wordoftheday.wordsTimesUsed({ count: word.timesUsed })}
            </span>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            aria-label={m.common.ariaRemoveWord({ word: word.word })}
            onclick={() => remove(word)}
          >
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</PluginCard>
